/**
 * True-peak measurement by 4x oversampling, per ITU-R BS.1770-4 Annex 2.
 *
 * Sample peak is not peak. A signal whose samples all sit at -1 dBFS can pass
 * through a D/A converter, or a lossy encoder, reconstructing a waveform that
 * overshoots 0 dBFS between samples. That overshoot is what clips, and it is
 * why the spec's ceiling is -2.0 dBTP rather than a sample-peak figure.
 *
 * The interpolator is a polyphase FIR: one 49-tap low-pass designed at 4x the
 * sample rate, decimated into four phases. Length 49 rather than 48 puts the
 * prototype's centre tap exactly on a multiple of 4, which makes phase 0 an
 * exact impulse — so the true sample values pass through untouched and the
 * measurement can never read *below* sample peak.
 */

import { WARNING_THRESHOLDS } from '../config/audio'

/** Taps in the prototype filter. Odd, so the centre lands on a phase boundary. */
const PROTOTYPE_TAPS = 49
const OVERSAMPLE = 4
const TAPS_PER_PHASE = Math.ceil(PROTOTYPE_TAPS / OVERSAMPLE) // 13
const CENTRE = (PROTOTYPE_TAPS - 1) / 2 // 24

function sinc(x: number): number {
  if (x === 0) return 1
  const piX = Math.PI * x
  return Math.sin(piX) / piX
}

/** Blackman window — chosen for its stopband depth; ripple matters more than transition width here. */
function blackman(n: number, length: number): number {
  const ratio = (2 * Math.PI * n) / (length - 1)
  return 0.42 - 0.5 * Math.cos(ratio) + 0.08 * Math.cos(2 * ratio)
}

/**
 * Builds the four phase filters.
 *
 * Cutoff is 1/(2 * OVERSAMPLE) normalised to the oversampled rate — that is,
 * the original Nyquist — and the result is scaled by OVERSAMPLE to undo the
 * gain lost to zero-stuffing.
 */
function buildPhases(): Float64Array[] {
  const cutoff = 1 / (2 * OVERSAMPLE)
  const prototype = new Float64Array(PROTOTYPE_TAPS)
  for (let n = 0; n < PROTOTYPE_TAPS; n++) {
    prototype[n] =
      2 * cutoff * sinc(2 * cutoff * (n - CENTRE)) * blackman(n, PROTOTYPE_TAPS) * OVERSAMPLE
  }

  return Array.from({ length: OVERSAMPLE }, (_unused, phase) => {
    const taps = new Float64Array(TAPS_PER_PHASE)
    for (let j = 0; j < TAPS_PER_PHASE; j++) {
      const index = j * OVERSAMPLE + phase
      taps[j] = index < PROTOTYPE_TAPS ? prototype[index]! : 0
    }
    // Normalise each phase to unity DC gain. Windowing perturbs the
    // theoretical tap sum, and that error appears directly as a level bias on
    // the reading. Phase 0 is already an exact impulse and is unchanged.
    let sum = 0
    for (const tap of taps) sum += tap
    if (sum !== 0) for (let j = 0; j < TAPS_PER_PHASE; j++) taps[j]! /= sum
    return taps
  })
}

/** Shared with the limiter, so detection and limiting agree by construction. */
export const OVERSAMPLE_PHASES: readonly Float64Array[] = buildPhases()

/**
 * L1 norm of the widest phase. The interpolated magnitude can never exceed
 * this times the largest input sample in the window, which is what lets the
 * detector skip the full convolution for quiet passages without changing the
 * answer.
 */
export const MAX_PHASE_GAIN = Math.max(
  ...OVERSAMPLE_PHASES.map((taps) => taps.reduce((sum, tap) => sum + Math.abs(tap), 0)),
)

/** Taps per polyphase branch; the limiter sizes its delay line from this. */
export const PHASE_TAPS = TAPS_PER_PHASE

/** Frames before x[i] that its window reaches back over. */
const HISTORY = TAPS_PER_PHASE - 1

/**
 * Frames whose windows are bounded together before any one is examined.
 *
 * The exact skip used to be tested sample by sample, over each sample's own
 * window, and that scan — with the shift that fed it — was most of the cost of
 * true peak: a CPU profile of the planning passes put the scans and shifts of
 * this detector and the limiter at half of all the time spent, and the
 * convolution they guard at under 1% (VH-99). One scan of a span's frames
 * bounds every window ending in it, so a quiet span costs 44 reads for 32
 * frames rather than 416.
 *
 * Speed only: a span that clears the bound would have had every one of its
 * frames skipped by the per-frame test, and a span that does not falls back to
 * that test, so the result is identical at any value. 32 is chosen, not
 * derived — long enough to amortise the twelve frames of history, short enough
 * that one loud syllable spoils few quiet neighbours.
 */
export const SPAN_FRAMES = 32

/**
 * One channel's chunk with the interpolator's history in front of it.
 *
 * The convolution at frame i reads x[i - 12] .. x[i], so the first frames of a
 * chunk need the last twelve of the chunk before. Holding them in front of it
 * in one buffer lets every window be read where it lies — instead of shifted
 * through a delay line a frame at a time — and lets a run of windows be
 * bounded with one scan. Starts silent, as the delay line did.
 */
export class InterpolatorHistory {
  private buffer = new Float32Array(HISTORY)

  /**
   * Places a chunk behind the history.
   *
   * @returns The buffer, holding the history at `[0, PHASE_TAPS - 1)` and the
   *   chunk after it — so frame i of the chunk is at `i + PHASE_TAPS - 1`.
   *   Valid until the next call; anything past the chunk is stale.
   */
  load(samples: Float32Array): Float32Array {
    const needed = HISTORY + samples.length
    if (this.buffer.length < needed) {
      const grown = new Float32Array(needed)
      grown.set(this.buffer.subarray(0, HISTORY))
      this.buffer = grown
    }
    this.buffer.set(samples, HISTORY)
    return this.buffer
  }

  /**
   * Keeps the last frames of the chunk just loaded as the next one's history.
   * A chunk shorter than the history keeps part of the old history too, which
   * is what the window needs.
   */
  advance(frameCount: number): void {
    this.buffer.copyWithin(0, frameCount, frameCount + HISTORY)
  }
}

/** Largest magnitude in `input[from, to)`. A window's, or a span's. */
export function largestMagnitude(input: Float32Array, from: number, to: number): number {
  let largest = 0
  for (let k = from; k < to; k++) {
    const magnitude = Math.abs(input[k]!)
    if (magnitude > largest) largest = magnitude
  }
  return largest
}

/**
 * The true peak at one frame: the largest of its four interpolated outputs,
 * BS.1770-4 Annex 2's y[4i + p] = sum_j h_p[j] * x[i - j] for p = 0..3.
 *
 * The one convolution the detector and the limiter both run, so what the
 * limiter catches and what the meter reports agree by construction.
 *
 * @param input - A channel laid out by {@link InterpolatorHistory.load}.
 * @param newest - Where x[i] sits in `input`; the window reaches back
 *   {@link PHASE_TAPS} - 1 frames before it.
 */
export function interpolatedPeak(input: Float32Array, newest: number): number {
  let peak = 0
  for (let phase = 0; phase < OVERSAMPLE; phase++) {
    const taps = OVERSAMPLE_PHASES[phase]!
    let sum = 0
    for (let j = 0; j < TAPS_PER_PHASE; j++) sum += taps[j]! * input[newest - j]!
    const magnitude = Math.abs(sum)
    if (magnitude > peak) peak = magnitude
  }
  return peak
}

/**
 * Streaming true-peak detector.
 *
 * Fed the same planar chunks as the loudness analyser, but *unweighted* —
 * true peak is measured on the signal as it will be encoded, not through the
 * K-weighting curve.
 */
export class TruePeakDetector {
  private readonly channelCount: number
  /** Level at or above which a sample counts as clipped, linear. */
  private readonly clipThreshold: number
  private clippedSamples = 0
  /** Each channel's last {@link PHASE_TAPS} - 1 frames, ahead of its next chunk. */
  private readonly histories: InterpolatorHistory[]
  private peak = 0
  /** One flag per frame in the current chunk, so a frame is counted once. */
  private clipFlags = new Uint8Array(0)
  /** Set by {@link finish}; the interpolator has been drained and is closed. */
  private drained = false

  /**
   * @param clipThresholdDbtp - Level at or above which a sample is counted as
   *   clipped. Defaults to spec 5.4's figure, taken from config rather than
   *   repeated here: it is a project choice, and it was declared in
   *   `WARNING_THRESHOLDS` and separately written out as a literal, so tuning
   *   one moved nothing (VH-68).
   */
  constructor(channelCount: number, clipThresholdDbtp = WARNING_THRESHOLDS.clippingDbtp) {
    if (!Number.isInteger(channelCount) || channelCount < 1) {
      throw new RangeError(`Channel count must be a positive integer, got ${channelCount}`)
    }
    this.channelCount = channelCount
    this.clipThreshold = 10 ** (clipThresholdDbtp / 20)
    this.histories = Array.from({ length: channelCount }, () => new InterpolatorHistory())
  }

  addFrames(channels: readonly Float32Array[]): void {
    if (this.drained) {
      throw new RangeError('Cannot add frames after finish(): the interpolator is drained')
    }
    if (channels.length !== this.channelCount) {
      throw new RangeError(`Expected ${this.channelCount} channels, got ${channels.length}`)
    }

    const frameCount = channels[0]?.length ?? 0
    if (this.clipFlags.length < frameCount) this.clipFlags = new Uint8Array(frameCount)
    this.clipFlags.fill(0, 0, frameCount)

    for (let ch = 0; ch < this.channelCount; ch++) {
      this.processChannel(channels[ch]!, this.histories[ch]!)
    }

    // Summed after every channel has had its say, so a stereo file clipping on
    // both sides is one problem rather than two.
    for (let i = 0; i < frameCount; i++) if (this.clipFlags[i]) this.clippedSamples++
  }

  private processChannel(samples: Float32Array, history: InterpolatorHistory): void {
    // Frame i of the chunk is at i + HISTORY, behind the previous chunk's last
    // frames, so a chunk boundary is invisible to the result.
    const input = history.load(samples)
    const clipThreshold = this.clipThreshold
    const clipFlags = this.clipFlags
    let peak = this.peak

    for (let start = 0; start < samples.length; start += SPAN_FRAMES) {
      const end = Math.min(samples.length, start + SPAN_FRAMES)

      // Two reasons to do the work: a frame might set a new peak, or be loud
      // enough to count as clipped. Skip only when neither is possible — the
      // bound is the filter's largest gain times the loudest sample in reach,
      // so skipping is exact rather than approximate. Every window ending in
      // this span lies inside [start, end + HISTORY), so one scan clears all
      // of them (VH-99).
      const spanBound = largestMagnitude(input, start, end + HISTORY) * MAX_PHASE_GAIN
      if (spanBound <= peak && spanBound < clipThreshold) continue

      for (let i = start; i < end; i++) {
        const newest = i + HISTORY
        // The same test, for this frame's window alone.
        const bound = largestMagnitude(input, i, newest + 1) * MAX_PHASE_GAIN
        if (bound <= peak && bound < clipThreshold) continue

        const sampleTruePeak = interpolatedPeak(input, newest)
        if (sampleTruePeak > peak) peak = sampleTruePeak
        // Counted per frame position, not per channel, so a stereo file with
        // both sides clipping is not reported as twice the problem.
        if (sampleTruePeak >= clipThreshold) clipFlags[i] = 1
      }
    }

    history.advance(samples.length)
    this.peak = peak
  }

  /**
   * Drains the interpolator so the last samples of the stream are measured.
   *
   * The polyphase convolution is causal — BS.1770-4 Annex 2's interpolated
   * output y[4i + p] = sum_j h_p[j] * x[i - j] — so the inter-sample peaks a
   * frame contributes to are only evaluated once the following
   * {@link PHASE_TAPS} - 1 frames have been clocked in. At end of stream there
   * are none, and the tail is simply never looked at: a single full-scale
   * sample in the last frame of a file measured **-64.05 dBTP** instead of 0
   * (VH-50 / review R-02). Feeding silence completes every window.
   *
   * Call once, after the last real frames. Adding frames afterwards would
   * splice silence into the middle of the signal, so it throws.
   */
  finish(): void {
    if (this.drained) return
    const silence = Array.from(
      { length: this.channelCount },
      () => new Float32Array(TAPS_PER_PHASE - 1),
    )
    this.addFrames(silence)
    // Set after the drain, not before, or addFrames would reject its own call.
    this.drained = true
  }

  /**
   * Highest true peak seen so far, in dBTP. `-Infinity` for pure silence.
   *
   * Read this after {@link finish}; before it, the final {@link PHASE_TAPS} - 1
   * frames have not been interpolated yet.
   */
  get peakDbtp(): number {
    return this.peak > 0 ? 20 * Math.log10(this.peak) : Number.NEGATIVE_INFINITY
  }

  /** Highest true peak seen so far, as a linear magnitude. */
  get peakLinear(): number {
    return this.peak
  }

  /**
   * Sample positions whose true peak reached the clipping threshold.
   *
   * Spec 5.4 triggers the distortion warning at ten or more. Counted once per
   * frame position across all channels, so a stereo file clipping on both
   * sides is one problem rather than two.
   */
  get clippedSampleCount(): number {
    return this.clippedSamples
  }
}
