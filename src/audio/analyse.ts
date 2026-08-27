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
import { TruePeakDetector } from './truepeak'

export interface AudioAnalysis extends LoudnessReport {
  /** Highest true peak in the source, dBTP. `-Infinity` for pure silence. */
  readonly truePeakDbtp: number
  /** Frame positions reaching the clipping threshold — spec 5.4's distortion trigger. */
  readonly clippedSampleCount: number
  readonly sampleRate: number
  readonly channelCount: number
}

export class AudioAnalyser {
  private readonly loudness: LoudnessAnalyser
  private readonly truePeak: TruePeakDetector

  constructor(
    private readonly options: { readonly sampleRate: number; readonly channelCount: number },
  ) {
    this.loudness = new LoudnessAnalyser(options)
    this.truePeak = new TruePeakDetector(options.channelCount)
  }

  /** @param channels - Planar audio, one `Float32Array` per channel, equal lengths. */
  addFrames(channels: readonly Float32Array[]): void {
    this.loudness.addFrames(channels)
    this.truePeak.addFrames(channels)
  }

  finish(): AudioAnalysis {
    // The interpolator is causal, so the last frames of the stream are not
    // measured until silence has been clocked through it. Draining here rather
    // than at every call site is what stopped a full-scale transient at end of
    // file reading -64 dBTP (VH-50 / review R-02). Idempotent.
    this.truePeak.finish()
    return {
      ...this.loudness.finish(),
      truePeakDbtp: this.truePeak.peakDbtp,
      clippedSampleCount: this.truePeak.clippedSampleCount,
      sampleRate: this.options.sampleRate,
      channelCount: this.options.channelCount,
    }
  }
}
