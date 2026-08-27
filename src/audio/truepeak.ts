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
  /** Last {@link TAPS_PER_PHASE} - 1 samples of the previous chunk, per channel. */
  private readonly tails: Float64Array[]
  private readonly window: Float64Array
  private peak = 0
  /** One flag per frame in the current chunk, so a frame is counted once. */
  private clipFlags = new Uint8Array(0)
  /** Set by {@link finish}; the interpolator has been drained and is closed. */
  private drained = false

  /**
   * @param clipThresholdDbtp - Level at or above which a sample is counted as
   *   clipped. Spec 5.4 uses -0.1 dBTP: ten or more such samples is the
   *   trigger for the distortion warning.
   */
  constructor(channelCount: number, clipThresholdDbtp = -0.1) {
    if (!Number.isInteger(channelCount) || channelCount < 1) {
      throw new RangeError(`Channel count must be a positive integer, got ${channelCount}`)
    }
    this.channelCount = channelCount
    this.clipThreshold = 10 ** (clipThresholdDbtp / 20)
    this.tails = Array.from({ length: channelCount }, () => new Float64Array(TAPS_PER_PHASE - 1))
    this.window = new Float64Array(TAPS_PER_PHASE)
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
      this.processChannel(channels[ch]!, this.tails[ch]!)
    }

    // Summed after every channel has had its say, so a stereo file clipping on
    // both sides is one problem rather than two.
    for (let i = 0; i < frameCount; i++) if (this.clipFlags[i]) this.clippedSamples++
  }

  private processChannel(samples: Float32Array, tail: Float64Array): void {
    const tailLength = tail.length
    const window = this.window
    let peak = this.peak
    const clipFlags = this.clipFlags

    for (let i = 0; i < samples.length; i++) {
      // window[0] is x[i], window[j] is x[i - j] — the polyphase convolution
      // y[4i + p] = sum_j h_p[j] * x[i - j].
      for (let j = TAPS_PER_PHASE - 1; j > 0; j--) window[j] = window[j - 1]!
      window[0] = samples[i]!

      // Seed the delay line from the previous chunk's tail on the first
      // samples, so a chunk boundary is invisible to the result.
      if (i < tailLength) {
        for (let j = i + 1; j < TAPS_PER_PHASE; j++) window[j] = tail[j - i - 1]!
      }

      let windowMax = 0
      for (let j = 0; j < TAPS_PER_PHASE; j++) {
        const magnitude = Math.abs(window[j]!)
        if (magnitude > windowMax) windowMax = magnitude
      }
      // Two reasons to do the work: the sample might set a new peak, or it
      // might be loud enough to count as clipped. Skip only when neither is
      // possible — the bound is the filter's largest gain times the loudest
      // sample in the window, so skipping is exact rather than approximate.
      const bound = windowMax * MAX_PHASE_GAIN
      if (bound <= peak && bound < this.clipThreshold) continue

      let sampleTruePeak = 0
      for (let phase = 0; phase < OVERSAMPLE; phase++) {
        const taps = OVERSAMPLE_PHASES[phase]!
        let sum = 0
        for (let j = 0; j < TAPS_PER_PHASE; j++) sum += taps[j]! * window[j]!
        const magnitude = Math.abs(sum)
        if (magnitude > sampleTruePeak) sampleTruePeak = magnitude
      }
      if (sampleTruePeak > peak) peak = sampleTruePeak
      // Counted per frame position, not per channel, so a stereo file with
      // both sides clipping is not reported as twice the problem.
      if (sampleTruePeak >= this.clipThreshold) clipFlags[i] = 1
    }

    // Carry the last samples forward: tail[0] is the most recent.
    //
    // Walked high-to-low deliberately. A chunk shorter than the delay line
    // must shift the existing tail up rather than overwrite it, and ascending
    // order would read entries this same loop had already replaced — which
    // silently smears one sample across the whole delay line.
    const carried = Math.min(samples.length, tailLength)
    for (let j = tailLength - 1; j >= carried; j--) tail[j] = tail[j - carried]!
    for (let j = carried - 1; j >= 0; j--) tail[j] = samples[samples.length - 1 - j]!

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
