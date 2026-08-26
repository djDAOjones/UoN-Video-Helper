/**
 * The analysis pass: spec section 5.2 step 1.
 *
 * Runs the loudness meter and the true-peak detector over the same audio in
 * one traversal, producing everything the audio chain and the warning rules
 * need. Loudness is K-weighted; true peak deliberately is not — it measures
 * the signal as it will be encoded.
 *
 * Critically, this runs over **source content only**, never the concatenated
 * timeline. Averaging a 5-second branding sting with 50 minutes of speech
 * biases the integrated measurement and would mis-level the whole video
 * (spec section 4.4).
 */

import { LoudnessAnalyser, type LoudnessReport } from './loudness'
import { PHASE_TAPS, TruePeakDetector } from './truepeak'
import { ABRUPT_AUDIO_START, WARNING_THRESHOLDS } from '../config/audio'

export interface AudioAnalysis extends LoudnessReport {
  /** Highest true peak in the source, dBTP. `-Infinity` for pure silence. */
  readonly truePeakDbtp: number
  /** Frame positions reaching the clipping threshold — spec 5.4's distortion trigger. */
  readonly clippedSampleCount: number
  /** RMS level across the opening source window, dBFS. `-Infinity` for silence. */
  readonly leadingRmsDbfs: number
  readonly sampleRate: number
  readonly channelCount: number
}

export class AudioAnalyser {
  private readonly loudness: LoudnessAnalyser
  private readonly truePeak: TruePeakDetector
  private readonly leadingFrameLimit: number
  private leadingFrames = 0
  private leadingSquareSum = 0

  constructor(
    private readonly options: { readonly sampleRate: number; readonly channelCount: number },
  ) {
    this.loudness = new LoudnessAnalyser(options)
    this.truePeak = new TruePeakDetector(options.channelCount, WARNING_THRESHOLDS.clippingDbtp)
    this.leadingFrameLimit = Math.round(options.sampleRate * ABRUPT_AUDIO_START.windowSeconds)
  }

  /** @param channels - Planar audio, one `Float32Array` per channel, equal lengths. */
  addFrames(channels: readonly Float32Array[]): void {
    const framesToMeasure = Math.min(
      channels[0]?.length ?? 0,
      this.leadingFrameLimit - this.leadingFrames,
    )
    if (framesToMeasure > 0) {
      for (const channel of channels) {
        for (let frame = 0; frame < framesToMeasure; frame++) {
          const sample = channel[frame]!
          this.leadingSquareSum += sample * sample
        }
      }
      this.leadingFrames += framesToMeasure
    }
    this.loudness.addFrames(channels)
    this.truePeak.addFrames(channels)
  }

  finish(): AudioAnalysis {
    // Complete only the causal true-peak FIR. Feeding the same zeros through
    // loudness would invent programme duration, but without this independent
    // post-roll a transient in the last few source frames is invisible.
    this.truePeak.addFrames(
      Array.from({ length: this.options.channelCount }, () => new Float32Array(PHASE_TAPS - 1)),
    )
    const leadingSampleCount = this.leadingFrames * this.options.channelCount
    const leadingMeanSquare =
      leadingSampleCount === 0 ? 0 : this.leadingSquareSum / leadingSampleCount
    return {
      ...this.loudness.finish(),
      truePeakDbtp: this.truePeak.peakDbtp,
      clippedSampleCount: this.truePeak.clippedSampleCount,
      leadingRmsDbfs:
        leadingMeanSquare === 0 ? Number.NEGATIVE_INFINITY : 10 * Math.log10(leadingMeanSquare),
      sampleRate: this.options.sampleRate,
      channelCount: this.options.channelCount,
    }
  }
}
