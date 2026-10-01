/**
 * Spec section 5.2 step 6: the true-peak limiter.
 *
 * 5 ms look-ahead, 50 ms release, ceiling -2.0 dBTP. It is the last thing in
 * the chain and the only guarantee that the output never exceeds the ceiling —
 * which matters because EchoVideo and YouTube re-encode on ingest, and a lossy
 * re-encode can overshoot by around a decibel.
 *
 * Detection uses the same 4x polyphase filters as the meter, so what the
 * limiter catches and what the meter reports agree by construction rather than
 * by two implementations happening to match.
 *
 * The applied gain is never allowed above the minimum required across the
 * look-ahead window, which is what makes the ceiling a guarantee instead of a
 * target the smoother might overshoot.
 */

import { LIMITER } from '../config/audio'
import {
  interpolatedPeak,
  InterpolatorHistory,
  largestMagnitude,
  MAX_PHASE_GAIN,
  PHASE_TAPS,
  SPAN_FRAMES,
} from './truepeak'

const MINIMUM_MAGNITUDE = 1e-12

/** Frames before the newest that the oversampling window reaches back over. */
const HISTORY = PHASE_TAPS - 1

/**
 * Sliding-window minimum in amortised constant time.
 *
 * A 5 ms window is 240 samples at 48 kHz; rescanning it per sample would be
 * 240 comparisons each, and this is per channel across a whole recording.
 */
class SlidingMinimum {
  private readonly values: Float64Array
  /**
   * Float64, not Int32. `position` counts samples for the length of the file
   * and never resets, so an `Int32Array` wraps past 2^31 — about 12.4 hours at
   * 48 kHz — after which `indices[head] < oldest` compares a negative number
   * and the expiry loop cycles the whole ring forever. Outside the envelope
   * this tool is built for, and a latent hang is still a latent hang (VH-68).
   * A double holds every integer to 2^53 exactly: 285,000 years of audio.
   */
  private readonly indices: Float64Array
  private head = 0
  private tail = 0
  private position = 0

  constructor(private readonly windowSize: number) {
    this.values = new Float64Array(windowSize + 1)
    this.indices = new Float64Array(windowSize + 1)
  }

  push(value: number): number {
    const capacity = this.values.length
    while (this.tail !== this.head && this.values[(this.tail - 1 + capacity) % capacity]! >= value) {
      this.tail = (this.tail - 1 + capacity) % capacity
    }
    this.values[this.tail] = value
    this.indices[this.tail] = this.position
    this.tail = (this.tail + 1) % capacity

    const oldest = this.position - this.windowSize + 1
    while (this.indices[this.head]! < oldest) this.head = (this.head + 1) % capacity

    this.position++
    return this.values[this.head]!
  }
}

export interface LimiterOptions {
  readonly sampleRate: number
  readonly channelCount: number
  readonly ceilingDbtp?: number
  readonly lookAheadMs?: number
  readonly releaseMs?: number
}

export class TruePeakLimiter {
  private readonly ceiling: number
  private readonly lookAhead: number
  private readonly release: number
  private readonly channelCount: number

  /** Delay lines holding the audio while the look-ahead window is examined. */
  private readonly delay: Float32Array[]
  private delayIndex = 0

  /** Each channel's last {@link PHASE_TAPS} - 1 input frames, ahead of its next chunk. */
  private readonly histories: InterpolatorHistory[]
  /** Each channel's current chunk behind its history, while {@link process} runs. */
  private readonly inputs: Float32Array[]
  private readonly minimum: SlidingMinimum
  private currentGain = 1

  constructor(options: LimiterOptions) {
    const { sampleRate, channelCount } = options
    this.channelCount = channelCount
    this.ceiling = 10 ** ((options.ceilingDbtp ?? LIMITER.ceilingDbtp) / 20)
    this.lookAhead = Math.max(1, Math.round((options.lookAheadMs ?? LIMITER.lookAheadMs) * sampleRate / 1000))
    this.release = Math.exp(-1 / (((options.releaseMs ?? LIMITER.releaseMs) / 1000) * sampleRate))

    this.delay = Array.from({ length: channelCount }, () => new Float32Array(this.lookAhead))
    this.histories = Array.from({ length: channelCount }, () => new InterpolatorHistory())
    this.inputs = Array.from({ length: channelCount }, () => new Float32Array(0))
    this.minimum = new SlidingMinimum(this.lookAhead)
  }

  /**
   * The gain the frame at `newest` needs: the ceiling over the highest true
   * peak across channels, or 1 when nothing is over it.
   *
   * @param newest - Where the frame sits in each of {@link inputs}.
   */
  private requiredGain(newest: number): number {
    let peak = 0
    for (let ch = 0; ch < this.channelCount; ch++) {
      const input = this.inputs[ch]!

      // Exact skip: no phase output can exceed the largest sample in the
      // window times the filter's L1 gain, so if that bound is under the
      // ceiling there is nothing to limit.
      const windowMax = largestMagnitude(input, newest - HISTORY, newest + 1)
      if (windowMax * MAX_PHASE_GAIN <= this.ceiling) {
        if (windowMax > peak) peak = windowMax
        continue
      }

      const interpolated = interpolatedPeak(input, newest)
      if (interpolated > peak) peak = interpolated
    }
    peak = Math.max(peak, MINIMUM_MAGNITUDE)
    return peak > this.ceiling ? this.ceiling / peak : 1
  }

  /**
   * Limits planar audio in place.
   *
   * Output is delayed by the look-ahead, so the first `lookAhead` samples of
   * the stream are silence and the tail must be flushed with {@link flush}.
   */
  process(channels: readonly Float32Array[]): void {
    const frameCount = channels[0]?.length ?? 0
    // Detection reads a copy, behind each channel's history, because the
    // output is written back over the input below.
    for (let ch = 0; ch < this.channelCount; ch++) {
      this.inputs[ch] = this.histories[ch]!.load(channels[ch]!)
    }

    for (let start = 0; start < frameCount; start += SPAN_FRAMES) {
      const end = Math.min(frameCount, start + SPAN_FRAMES)

      // The exact skip for a whole span at once: every window ending in it, on
      // every channel, lies inside [start, end + HISTORY) — so if the loudest
      // sample there cannot interpolate over the ceiling, no frame in the span
      // needs gain, and none of their windows need scanning (VH-99).
      let spanMax = 0
      for (let ch = 0; ch < this.channelCount; ch++) {
        const largest = largestMagnitude(this.inputs[ch]!, start, end + HISTORY)
        if (largest > spanMax) spanMax = largest
      }
      const clear = spanMax * MAX_PHASE_GAIN <= this.ceiling

      for (let i = start; i < end; i++) {
        const required = clear ? 1 : this.requiredGain(i + HISTORY)
        const windowMinimum = this.minimum.push(required)

        // Never above the window minimum: that is the ceiling guarantee. Below
        // it, recover gently rather than snapping back and pumping.
        this.currentGain =
          windowMinimum < this.currentGain
            ? windowMinimum
            : Math.min(
                windowMinimum,
                windowMinimum + this.release * (this.currentGain - windowMinimum),
              )

        for (let ch = 0; ch < this.channelCount; ch++) {
          const line = this.delay[ch]!
          const delayed = line[this.delayIndex]!
          line[this.delayIndex] = channels[ch]![i]!
          channels[ch]![i] = delayed * this.currentGain
        }
        this.delayIndex = (this.delayIndex + 1) % this.lookAhead
      }
    }

    for (let ch = 0; ch < this.channelCount; ch++) this.histories[ch]!.advance(frameCount)
  }

  /**
   * Samples still held in the delay line, which the caller must append.
   *
   * Clocked out through {@link process} rather than copied, because the last
   * look-ahead window of a file is exactly where the ceiling used to be lost.
   * Two things only silence can reveal: the detector's causal FIR needs
   * {@link PHASE_TAPS} - 1 further frames before it has seen a sample's own
   * inter-sample overshoot, and the sliding minimum needs the window that
   * follows a sample before it knows what gain that sample must take. Copying
   * the delay line out at one frozen gain skipped both, and a full-scale
   * transient in the final frames left the limiter at 0 dBTP — 2 dB above the
   * ceiling this class exists to guarantee (VH-50 / review R-02).
   *
   * Feeding silence in also leaves the delay line silent, so a second call
   * returns silence rather than repeating the tail.
   */
  flush(): Float32Array[] {
    const tail = Array.from({ length: this.channelCount }, () => new Float32Array(this.lookAhead))
    this.process(tail)
    return tail
  }

  /** Look-ahead delay in samples, so callers can account for it. */
  get latencySamples(): number {
    return this.lookAhead
  }
}
