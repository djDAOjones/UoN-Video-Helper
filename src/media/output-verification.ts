/**
 * Honest verification of the decoded, finished output audio.
 *
 * Verification is distinct from the post-processing advisory: acceptance is
 * the specification's +/- loudness tolerance AND the true-peak ceiling, while
 * the existing warning remains the looser "missed by more than 1 LU" notice.
 */

import { AudioSampleSink, type InputAudioTrack } from 'mediabunny'

import { AudioAnalyser } from '../audio/analyse'
import { PHASE_TAPS, TruePeakDetector } from '../audio/truepeak'
import {
  INTEGRATED_TOLERANCE_LU,
  TARGET_INTEGRATED_LUFS,
  TRUE_PEAK_CEILING_DBTP,
} from '../config/audio'
import { toPlanar } from './audio-frames'

export interface OutputAudioMeasurement {
  readonly integratedLufs: number
  readonly truePeakDbtp: number
  /** Real decoded duration only; EOF detector post-roll is excluded. */
  readonly durationSeconds: number
}

export type OutputVerification =
  | {
      readonly status: 'passed' | 'failed'
      readonly integratedLufs: number
      readonly truePeakDbtp: number
      readonly loudnessWithinTolerance: boolean
      readonly truePeakWithinCeiling: boolean
    }
  | {
      readonly status: 'unverified'
      readonly reason: 'missing-audio-track' | 'measurement-failed' | 'invalid-measurement'
    }
  | { readonly status: 'not-applicable'; readonly reason: 'no-audio' }

/**
 * Streaming analyser that drains only its independent true-peak FIR at EOF.
 *
 * The protected production analyser intentionally has no flush API. Feeding
 * post-roll into it would add synthetic silence to duration and loudness, so a
 * second detector receives the same real frames and then exactly
 * `PHASE_TAPS - 1` zeros. That exposes peaks whose FIR response lands after the
 * last decoded frame without changing the loudness measurement (R-01).
 */
export class FinishedOutputAudioAnalyser {
  private readonly analyser: AudioAnalyser
  private readonly truePeak: TruePeakDetector
  private readonly channelCount: number
  private finished = false

  constructor(options: { readonly sampleRate: number; readonly channelCount: number }) {
    this.analyser = new AudioAnalyser(options)
    this.truePeak = new TruePeakDetector(options.channelCount)
    this.channelCount = options.channelCount
  }

  addFrames(channels: readonly Float32Array[]): void {
    if (this.finished) throw new Error('Finished-output audio analyser has already finished')
    this.analyser.addFrames(channels)
    this.truePeak.addFrames(channels)
  }

  finish(): OutputAudioMeasurement {
    if (this.finished) throw new Error('Finished-output audio analyser has already finished')
    this.finished = true
    this.truePeak.addFrames(
      Array.from({ length: this.channelCount }, () => new Float32Array(PHASE_TAPS - 1)),
    )
    const analysis = this.analyser.finish()
    return {
      integratedLufs: analysis.integratedLufs,
      truePeakDbtp: this.truePeak.peakDbtp,
      durationSeconds: analysis.durationSeconds,
    }
  }
}

/** Measures a decoded output track in bounded memory and closes every sample. */
export async function measureFinishedOutputAudio(
  track: InputAudioTrack,
  signal?: AbortSignal,
): Promise<OutputAudioMeasurement> {
  signal?.throwIfAborted()
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])
  signal?.throwIfAborted()
  const analyser = new FinishedOutputAudioAnalyser({ sampleRate, channelCount })

  for await (const sample of new AudioSampleSink(track).samples()) {
    try {
      signal?.throwIfAborted()
      analyser.addFrames(toPlanar(sample, channelCount))
    } finally {
      sample.close()
    }
  }
  signal?.throwIfAborted()
  return analyser.finish()
}

/** Applies both finished-output acceptance limits, failing closed on invalid numbers. */
export function classifyOutputVerification(
  measurement: OutputAudioMeasurement,
): OutputVerification {
  const integratedValid =
    Number.isFinite(measurement.integratedLufs) ||
    measurement.integratedLufs === Number.NEGATIVE_INFINITY
  const truePeakValid =
    Number.isFinite(measurement.truePeakDbtp) ||
    measurement.truePeakDbtp === Number.NEGATIVE_INFINITY
  if (!integratedValid || !truePeakValid) {
    return { status: 'unverified', reason: 'invalid-measurement' }
  }

  const loudnessWithinTolerance =
    Math.abs(measurement.integratedLufs - TARGET_INTEGRATED_LUFS) <= INTEGRATED_TOLERANCE_LU
  const truePeakWithinCeiling = measurement.truePeakDbtp <= TRUE_PEAK_CEILING_DBTP
  return {
    status: loudnessWithinTolerance && truePeakWithinCeiling ? 'passed' : 'failed',
    integratedLufs: measurement.integratedLufs,
    truePeakDbtp: measurement.truePeakDbtp,
    loudnessWithinTolerance,
    truePeakWithinCeiling,
  }
}
