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
import { MAX_PHASE_GAIN, OVERSAMPLE_PHASES, PHASE_TAPS } from './truepeak'

const MINIMUM_MAGNITUDE = 1e-12

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

  /** Oversampling history, one window per channel. `window[0]` is the newest sample. */
  private readonly windows: Float64Array[]
  private readonly minimum: SlidingMinimum
  private currentGain = 1

  constructor(options: LimiterOptions) {
    const { sampleRate, channelCount } = options
    this.channelCount = channelCount
    this.ceiling = 10 ** ((options.ceilingDbtp ?? LIMITER.ceilingDbtp) / 20)
    this.lookAhead = Math.max(1, Math.round((options.lookAheadMs ?? LIMITER.lookAheadMs) * sampleRate / 1000))
    this.release = Math.exp(-1 / (((options.releaseMs ?? LIMITER.releaseMs) / 1000) * sampleRate))

    this.delay = Array.from({ length: channelCount }, () => new Float32Array(this.lookAhead))
    this.windows = Array.from({ length: channelCount }, () => new Float64Array(PHASE_TAPS))
    this.minimum = new SlidingMinimum(this.lookAhead)
  }

  /** Highest true-peak magnitude across channels for the newest sample. */
  private truePeakMagnitude(): number {
    let peak = 0
    for (let ch = 0; ch < this.channelCount; ch++) {
      const window = this.windows[ch]!

      // Exact skip: no phase output can exceed the largest sample in the
      // window times the filter's L1 gain, so if that bound is under the
      // ceiling there is nothing to limit.
      let windowMax = 0
      for (let j = 0; j < PHASE_TAPS; j++) {
        const magnitude = Math.abs(window[j]!)
        if (magnitude > windowMax) windowMax = magnitude
      }
      if (windowMax * MAX_PHASE_GAIN <= this.ceiling) {
        if (windowMax > peak) peak = windowMax
        continue
      }

      for (const taps of OVERSAMPLE_PHASES) {
        let sum = 0
        for (let j = 0; j < PHASE_TAPS; j++) sum += taps[j]! * window[j]!
        const magnitude = Math.abs(sum)
        if (magnitude > peak) peak = magnitude
      }
    }
    return peak
  }

  /**
   * Limits planar audio in place.
   *
   * Output is delayed by the look-ahead, so the first `lookAhead` samples of
   * the stream are silence and the tail must be flushed with {@link flush}.
   */
  process(channels: readonly Float32Array[]): void {
    const frameCount = channels[0]?.length ?? 0

    for (let i = 0; i < frameCount; i++) {
      for (let ch = 0; ch < this.channelCount; ch++) {
        const window = this.windows[ch]!
        for (let j = PHASE_TAPS - 1; j > 0; j--) window[j] = window[j - 1]!
        window[0] = channels[ch]![i]!
      }

      const peak = Math.max(this.truePeakMagnitude(), MINIMUM_MAGNITUDE)
      const required = peak > this.ceiling ? this.ceiling / peak : 1
      const windowMinimum = this.minimum.push(required)

      // Never above the window minimum: that is the ceiling guarantee. Below
      // it, recover gently rather than snapping back and pumping.
      this.currentGain =
        windowMinimum < this.currentGain
          ? windowMinimum
          : Math.min(windowMinimum, windowMinimum + this.release * (this.currentGain - windowMinimum))

      for (let ch = 0; ch < this.channelCount; ch++) {
        const line = this.delay[ch]!
        const delayed = line[this.delayIndex]!
        line[this.delayIndex] = channels[ch]![i]!
        channels[ch]![i] = delayed * this.currentGain
      }
      this.delayIndex = (this.delayIndex + 1) % this.lookAhead
    }
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
