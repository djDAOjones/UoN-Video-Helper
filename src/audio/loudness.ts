/**
 * Gated loudness measurement, per ITU-R BS.1770-4 and EBU Tech 3342 (LRA).
 *
 * Everything downstream of this module trusts its numbers, so it is built and
 * validated before anything consumes it (`AGENTS.md` -> "The meter is proved
 * before it is trusted"). Pure arithmetic over `Float32Array`: no
 * `AudioContext`, no WebCodecs, no DOM, so the whole thing runs in Node under
 * the EBU compliance harness.
 *
 * Streaming by construction. Audio arrives in whatever chunks the decoder
 * produces; state is a handful of running sums plus one value per 100 ms of
 * source, so an hour costs a few hundred kilobytes rather than a decoded copy
 * of the file.
 *
 * That claim was once generous — retention was nearer 1.4 MB an hour, because
 * gating blocks were kept per channel and the momentary curve was kept whether
 * anyone wanted it or not (VH-67 / review R-16). Both are fixed: gating stores
 * one pre-weighted value per block, which is the same arithmetic by the
 * identity in `computeIntegrated`, and the momentary curve is retained only
 * for callers that ask. A stereo hour is now around 580 kB.
 */

import { BiquadCascade } from './biquad'
import { designKWeighting } from './kweighting'

/**
 * Constants defined by the standards themselves. These are NOT project
 * choices and must not migrate to `src/config/` — nobody may tune them.
 * Project choices (the -16 LUFS target, the LRA > 9 LU gate) live in
 * `src/config/audio.ts`.
 */
/** BS.1770-4 eq. 2: the offset that cancels K-weighting's gain at 1 kHz. */
const LOUDNESS_OFFSET = -0.691
/** BS.1770-4 section 3: gating block length and hop (75% overlap). */
const BLOCK_SECONDS = 0.4
const INTEGRATED_HOP_SECONDS = 0.1
/** EBU Tech 3341: the short-term window. */
const SHORT_TERM_SECONDS = 3

/**
 * The accumulator's resolution, and the step of the momentary and short-term
 * curves.
 *
 * NOT the 100 ms implied by BS.1770-4's 75% block overlap, and deliberately
 * so. EBU Tech 3341 tests 10-14 offset their tones by i * 20 ms and
 * i * 150 ms precisely to probe a meter's update-rate resolution: on a 100 ms
 * grid the best-aligned 400 ms window catches only 360-380 ms of a 400 ms
 * tone, reading up to 0.46 LU low against a +/-0.1 LU tolerance. 10 ms is the
 * greatest common divisor of 20 and 150, so every one of those offsets lands
 * exactly on a hop.
 *
 * The integrated measurement is unaffected: its gating blocks are still taken
 * every 100 ms, by stepping {@link INTEGRATED_STEP_HOPS} of these.
 */
const HOP_SECONDS = 0.01
/** BS.1770-4 section 3: absolute and relative gate thresholds. */
const ABSOLUTE_GATE_LUFS = -70
const RELATIVE_GATE_LU = -10
/** EBU Tech 3342: LRA gating and percentiles. */
const LRA_RELATIVE_GATE_LU = -20
const LRA_LOW_PERCENTILE = 0.1
const LRA_HIGH_PERCENTILE = 0.95

const HOPS_PER_BLOCK = Math.round(BLOCK_SECONDS / HOP_SECONDS) // 40
const HOPS_PER_SHORT_TERM = Math.round(SHORT_TERM_SECONDS / HOP_SECONDS) // 300
/** Hops between consecutive gating blocks, preserving BS.1770-4's 75% overlap. */
const INTEGRATED_STEP_HOPS = Math.round(INTEGRATED_HOP_SECONDS / HOP_SECONDS) // 10
/** LRA is taken from short-term values at 10 Hz, matching reference implementations. */
const LRA_SUBSAMPLE_HOPS = INTEGRATED_STEP_HOPS

export interface LoudnessReport {
  /** Gated integrated loudness. `-Infinity` when nothing passed the gates. */
  readonly integratedLufs: number
  /** Loudness Range in LU. `0` when there is too little gated material. */
  readonly loudnessRangeLu: number
  /** Short-term (3 s) loudness at 100 ms steps. */
  readonly shortTermLufs: readonly number[]
  /**
   * Momentary (400 ms) loudness at 100 ms steps.
   *
   * Empty unless the analyser was constructed with `retainMomentary`. Nothing
   * in the pipeline reads it — the envelope and the warnings both work from
   * the short-term curve — while the EBU max-M cases need every value, so it
   * is kept on request rather than always (VH-67).
   */
  readonly momentaryLufs: readonly number[]
  /** Seconds of audio analysed. */
  readonly durationSeconds: number
  /**
   * Step between consecutive momentary and short-term values, in seconds.
   * Finer than BS.1770-4's block hop — see HOP_SECONDS in this module.
   */
  readonly stepSeconds: number
}

/**
 * Per-channel weights from BS.1770-4 Table 3.
 *
 * Surround channels are weighted +1.5 dB; LFE is excluded entirely. Channel
 * order follows the conventional interleave (L, R, C, LFE, Ls, Rs), which is
 * what WebCodecs `AudioData` and WAV both use.
 */
export function channelWeights(channelCount: number): readonly number[] {
  switch (channelCount) {
    case 1:
      return [1]
    case 2:
      return [1, 1]
    case 5:
      // 5.0 — L, R, C, Ls, Rs. No LFE channel at all, which is exactly the
      // configuration EBU Tech 3341 test case 6 uses.
      return [1, 1, 1, 1.41, 1.41]
    case 6:
      // 5.1 — L, R, C, LFE, Ls, Rs.
      return [1, 1, 1, 0, 1.41, 1.41]
    default:
      // Unusual layouts (3, 4, 8...) are rare in lecture recordings. Treating
      // every channel as full-weight over-reports rather than silently
      // dropping content, which is the safer direction for a level meter.
      return new Array<number>(channelCount).fill(1)
  }
}

/** Converts a summed weighted mean-square to LUFS. */
function toLoudness(weightedMeanSquare: number): number {
  return weightedMeanSquare > 0
    ? LOUDNESS_OFFSET + 10 * Math.log10(weightedMeanSquare)
    : Number.NEGATIVE_INFINITY
}

/** Inverse of {@link toLoudness}: LUFS back to the linear weighted mean-square. */
function toEnergy(lufs: number): number {
  return 10 ** ((lufs - LOUDNESS_OFFSET) / 10)
}

/**
 * Nearest-rank percentile over an ascending array.
 *
 * Tech 3342 does not mandate an interpolation method and reference
 * implementations use a 0.1 dB histogram; on a sorted array the nearest-rank
 * equivalent differs by at most one bin, far inside the standard's +/-1 LU
 * tolerance for LRA.
 */
function percentile(ascending: readonly number[], fraction: number): number {
  const index = Math.round((ascending.length - 1) * fraction)
  return ascending[Math.min(ascending.length - 1, Math.max(0, index))]!
}

export class LoudnessAnalyser {
  private readonly sampleRate: number
  private readonly channelCount: number
  private readonly weights: readonly number[]
  private readonly filters: BiquadCascade[]
  private readonly hopSamples: number

  /** Sum of squared K-weighted samples in the hop currently being filled. */
  private readonly hopSums: Float64Array
  private hopFill = 0

  /** Ring of completed hop sums, one row per channel, {@link HOPS_PER_SHORT_TERM} long. */
  private readonly hopHistory: Float64Array
  private hopsCompleted = 0

  /** Running sums over the momentary (400 ms) and short-term (3 s) windows. */
  private readonly momentarySums: Float64Array
  private readonly shortTermSums: Float64Array

  /** Per-gating-block per-channel mean square, flat: `[block0ch0, block0ch1, ...]`. */
  /**
   * One PRE-WEIGHTED mean square per gating block, not one per channel.
   *
   * `computeIntegrated` averages mean squares over the gated blocks and then
   * applies the channel weights, and those two commute:
   * `sum_ch w_ch * mean_i(ms[i][ch])` is `mean_i(sum_ch w_ch * ms[i][ch])`.
   * Weighting on the way in is therefore the identical figure at half the
   * storage for stereo (VH-67).
   */
  private readonly blockMeanSquares: number[] = []
  private readonly blockLoudness: number[] = []
  private readonly momentaryLoudness: number[] = []
  private readonly retainMomentary: boolean
  private readonly shortTermLoudness: number[] = []

  private framesSeen = 0
  private scratch: Float32Array

  /**
   * @param options.retainMomentary - Keep the momentary curve in the report.
   *   Defaults to `true`: the EBU harness needs it, and a meter that silently
   *   stopped reporting a published measurement would be the wrong default.
   *   The pipeline passes `false`.
   */
  constructor(options: {
    readonly sampleRate: number
    readonly channelCount: number
    readonly retainMomentary?: boolean
  }) {
    const { sampleRate, channelCount } = options
    this.retainMomentary = options.retainMomentary ?? true
    if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
      throw new RangeError(`Sample rate must be positive, got ${sampleRate}`)
    }
    if (!Number.isInteger(channelCount) || channelCount < 1) {
      throw new RangeError(`Channel count must be a positive integer, got ${channelCount}`)
    }

    this.sampleRate = sampleRate
    this.channelCount = channelCount
    this.weights = channelWeights(channelCount)
    this.hopSamples = Math.round(sampleRate * HOP_SECONDS)

    const coefficients = designKWeighting(sampleRate)
    this.filters = Array.from({ length: channelCount }, () => new BiquadCascade(coefficients))

    this.hopSums = new Float64Array(channelCount)
    this.hopHistory = new Float64Array(channelCount * HOPS_PER_SHORT_TERM)
    this.momentarySums = new Float64Array(channelCount)
    this.shortTermSums = new Float64Array(channelCount)
    this.scratch = new Float32Array(4096)
  }

  /**
   * Feeds one chunk of planar audio.
   *
   * @param channels - One `Float32Array` per channel, all the same length.
   *   Planar rather than interleaved because every stage here is per-channel;
   *   `AudioSample.copyTo` with `planeIndex` produces exactly this.
   */
  addFrames(channels: readonly Float32Array[]): void {
    if (channels.length !== this.channelCount) {
      throw new RangeError(`Expected ${this.channelCount} channels, got ${channels.length}`)
    }
    const frameCount = channels[0]?.length ?? 0
    if (frameCount === 0) return
    for (const channel of channels) {
      if (channel.length !== frameCount) {
        throw new RangeError('All channels in a chunk must have the same length')
      }
    }

    if (this.scratch.length < frameCount) this.scratch = new Float32Array(frameCount)
    const weighted = this.scratch.subarray(0, frameCount)

    // K-weight each channel, then accumulate squares hop by hop. The hop
    // boundary is walked once and applied to every channel so a hop always
    // closes at the same sample index across channels.
    let offset = 0
    while (offset < frameCount) {
      const take = Math.min(this.hopSamples - this.hopFill, frameCount - offset)

      for (let ch = 0; ch < this.channelCount; ch++) {
        const slice = channels[ch]!.subarray(offset, offset + take)
        const target = weighted.subarray(0, take)
        this.filters[ch]!.process(slice, target)

        let sum = 0
        for (let i = 0; i < take; i++) sum += target[i]! * target[i]!
        this.hopSums[ch]! += sum
      }

      this.hopFill += take
      offset += take
      if (this.hopFill === this.hopSamples) this.closeHop()
    }

    this.framesSeen += frameCount
  }

  /** Completes a hop, updating the running windows and emitting whatever it finishes. */
  private closeHop(): void {
    const slot = this.hopsCompleted % HOPS_PER_SHORT_TERM
    const channels = this.channelCount

    for (let ch = 0; ch < channels; ch++) {
      const incoming = this.hopSums[ch]!

      // Drop the hop leaving each window before it is overwritten. The ring is
      // HOPS_PER_SHORT_TERM long, so only the short-term window's departing
      // hop shares a slot with the arriving one.
      if (this.hopsCompleted >= HOPS_PER_SHORT_TERM) {
        this.shortTermSums[ch]! -= this.hopHistory[slot * channels + ch]!
      }
      if (this.hopsCompleted >= HOPS_PER_BLOCK) {
        const leaving = (this.hopsCompleted - HOPS_PER_BLOCK) % HOPS_PER_SHORT_TERM
        this.momentarySums[ch]! -= this.hopHistory[leaving * channels + ch]!
      }

      this.hopHistory[slot * channels + ch] = incoming
      this.momentarySums[ch]! += incoming
      this.shortTermSums[ch]! += incoming
      this.hopSums[ch] = 0
    }

    this.hopFill = 0
    this.hopsCompleted++

    if (this.hopsCompleted >= HOPS_PER_BLOCK) {
      const samples = HOPS_PER_BLOCK * this.hopSamples
      let weightedSum = 0
      for (let ch = 0; ch < channels; ch++) {
        weightedSum += this.weights[ch]! * (this.momentarySums[ch]! / samples)
      }
      if (this.retainMomentary) this.momentaryLoudness.push(toLoudness(weightedSum))

      // Gating blocks stay on BS.1770-4's 100 ms grid: the first completes one
      // block-length in, and every INTEGRATED_STEP_HOPS after that.
      if ((this.hopsCompleted - HOPS_PER_BLOCK) % INTEGRATED_STEP_HOPS === 0) {
        // `weightedSum` IS the channel-weighted mean square for this block —
        // the same value `toLoudness` is about to be given. Stored once.
        this.blockMeanSquares.push(weightedSum)
        this.blockLoudness.push(toLoudness(weightedSum))
      }
    }

    if (this.hopsCompleted >= HOPS_PER_SHORT_TERM) {
      const samples = HOPS_PER_SHORT_TERM * this.hopSamples
      let weightedSum = 0
      for (let ch = 0; ch < channels; ch++) {
        weightedSum += this.weights[ch]! * (this.shortTermSums[ch]! / samples)
      }
      this.shortTermLoudness.push(toLoudness(weightedSum))
    }
  }

  /**
   * Closes the measurement and returns the report.
   *
   * A partially-filled final hop is discarded rather than scaled up: BS.1770-4
   * gates on whole blocks, and a short tail would otherwise contribute a
   * mean-square computed over the wrong denominator.
   */
  finish(): LoudnessReport {
    return {
      integratedLufs: this.computeIntegrated(),
      loudnessRangeLu: this.computeLoudnessRange(),
      shortTermLufs: this.shortTermLoudness,
      momentaryLufs: this.momentaryLoudness,
      durationSeconds: this.framesSeen / this.sampleRate,
      stepSeconds: HOP_SECONDS,
    }
  }

  /** BS.1770-4 section 3: absolute gate, then a relative gate 10 LU below the ungated mean. */
  private computeIntegrated(): number {
    const blockCount = this.blockLoudness.length
    if (blockCount === 0) return Number.NEGATIVE_INFINITY

    /**
     * Mean of the channel-weighted mean squares over the given blocks.
     *
     * BS.1770-4 section 3 averages per channel and then weights; this averages
     * the already-weighted value. The two are equal — weighting is a linear
     * combination and the mean is linear — and this way the analyser holds one
     * number per block instead of one per channel per block (VH-67).
     */
    const weightedMeanOver = (indices: readonly number[]): number => {
      let sum = 0
      for (const index of indices) sum += this.blockMeanSquares[index]!
      return sum / indices.length
    }

    const aboveAbsolute: number[] = []
    for (let i = 0; i < blockCount; i++) {
      if (this.blockLoudness[i]! > ABSOLUTE_GATE_LUFS) aboveAbsolute.push(i)
    }
    if (aboveAbsolute.length === 0) return Number.NEGATIVE_INFINITY

    const relativeGate = toLoudness(weightedMeanOver(aboveAbsolute)) + RELATIVE_GATE_LU

    const gated = aboveAbsolute.filter((i) => this.blockLoudness[i]! > relativeGate)
    if (gated.length === 0) return Number.NEGATIVE_INFINITY

    return toLoudness(weightedMeanOver(gated))
  }

  /**
   * EBU Tech 3342: 95th minus 10th percentile of gated short-term loudness.
   *
   * Sampled at 10 Hz rather than from the full 100 Hz curve. The finer curve
   * exists for the EBU max-S tests; feeding it to LRA would weight the
   * percentile distribution differently from every reference implementation
   * for no gain in accuracy.
   */
  private computeLoudnessRange(): number {
    const atTenHertz = this.shortTermLoudness.filter((_v, i) => i % LRA_SUBSAMPLE_HOPS === 0)
    const aboveAbsolute = atTenHertz.filter((v) => v > ABSOLUTE_GATE_LUFS)
    if (aboveAbsolute.length === 0) return 0

    let energySum = 0
    for (const value of aboveAbsolute) energySum += toEnergy(value)
    const relativeGate = toLoudness(energySum / aboveAbsolute.length) + LRA_RELATIVE_GATE_LU

    const gated = aboveAbsolute.filter((v) => v >= relativeGate).sort((a, b) => a - b)
    if (gated.length < 2) return 0

    return percentile(gated, LRA_HIGH_PERCENTILE) - percentile(gated, LRA_LOW_PERCENTILE)
  }
}
