/**
 * Spec section 5.2 step 4: gentle compression.
 *
 * 2:1 above -18 dBFS with a soft knee. Deliberately mild — this is not a
 * loudness tool. Its job is to take the edge off the loudest syllables so the
 * single linear gain that follows can lift the whole recording without the
 * limiter having to work, not to make the speech dense.
 *
 * Detection is RMS, not peak, and that is the important choice. A peak
 * detector responds to individual samples, which on speech means reacting to
 * plosives and sibilance rather than to how loud the talker actually is — and
 * with a 20 ms attack it cannot track a waveform cycle anyway, so the stated
 * ratio would never quite apply. Sample peaks are the limiter's job; this
 * stage responds to level.
 *
 * Detection is summed across channels, so a stereo image never shifts when one
 * side is louder than the other.
 */

import { COMPRESSOR } from '../config/audio'

/** Time constant for a first-order smoother reaching 1 - 1/e in `ms`. */
function coefficientFor(ms: number, sampleRate: number): number {
  return Math.exp(-1 / ((ms / 1000) * sampleRate))
}

const MINIMUM_POWER = 1e-24

/**
 * RMS detector window. Long enough to ignore the waveform itself — a 100 Hz
 * cycle is 10 ms, and anything below that has been high-passed away — and
 * short enough to follow syllables.
 */
const DETECTOR_MS = 10

export interface CompressorOptions {
  readonly sampleRate: number
  readonly ratio?: number
  readonly thresholdDbfs?: number
  readonly attackMs?: number
  readonly releaseMs?: number
  /** Width of the soft knee in dB, centred on the threshold. */
  readonly kneeDb?: number
}

export class Compressor {
  private readonly threshold: number
  private readonly ratio: number
  private readonly knee: number
  private readonly attack: number
  private readonly release: number
  private readonly detector: number
  /** Smoothed mean square feeding the static curve. */
  private meanSquare = 0
  /** Current gain reduction in dB, always <= 0. */
  private envelopeDb = 0

  constructor(options: CompressorOptions) {
    this.threshold = options.thresholdDbfs ?? COMPRESSOR.thresholdDbfs
    this.ratio = options.ratio ?? COMPRESSOR.ratio
    this.knee = options.kneeDb ?? 6
    this.attack = coefficientFor(options.attackMs ?? COMPRESSOR.attackMs, options.sampleRate)
    this.release = coefficientFor(options.releaseMs ?? COMPRESSOR.releaseMs, options.sampleRate)
    this.detector = coefficientFor(DETECTOR_MS, options.sampleRate)
  }

  /** Static curve: input level in dBFS to output level in dBFS. */
  private curve(levelDb: number): number {
    const over = levelDb - this.threshold
    if (over <= -this.knee / 2) return levelDb
    if (over >= this.knee / 2) return this.threshold + over / this.ratio
    // Quadratic interpolation across the knee, so the transition has no corner.
    const x = over + this.knee / 2
    return levelDb + ((1 / this.ratio - 1) * x * x) / (2 * this.knee)
  }

  /** Compresses planar audio in place. */
  process(channels: readonly Float32Array[]): void {
    const frameCount = channels[0]?.length ?? 0
    const channelCount = channels.length

    for (let i = 0; i < frameCount; i++) {
      // Mean square across channels, so both sides move together.
      let power = 0
      for (let ch = 0; ch < channelCount; ch++) {
        const value = channels[ch]![i]!
        power += value * value
      }
      power /= channelCount

      this.meanSquare = power + this.detector * (this.meanSquare - power)
      const levelDb = 10 * Math.log10(Math.max(this.meanSquare, MINIMUM_POWER))
      const targetDb = Math.min(0, this.curve(levelDb) - levelDb)

      // Attack when the reduction deepens, release when it eases. Comparing
      // gain reduction rather than level keeps the meaning right: "attack" is
      // always the fast direction.
      const coefficient = targetDb < this.envelopeDb ? this.attack : this.release
      this.envelopeDb = targetDb + coefficient * (this.envelopeDb - targetDb)

      const gain = 10 ** (this.envelopeDb / 20)
      for (let ch = 0; ch < channelCount; ch++) channels[ch]![i]! *= gain
    }
  }

  /** Current gain reduction in dB, for metering and tests. */
  get gainReductionDb(): number {
    return this.envelopeDb
  }
}
