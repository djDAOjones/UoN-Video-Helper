/**
 * The calibration probe, spec section 7.1.
 *
 * Decodes and re-encodes three seconds of the user's actual file on the
 * user's actual device, then extrapolates. Rationale section 5: the binding
 * constraint is not file size, it is time on this particular machine, and
 * throughput varies by an order of magnitude between a managed Windows laptop
 * and an Apple-silicon MacBook. A fixed limit is simultaneously too strict for
 * one and too permissive for the other.
 *
 * The audio is not sampled here. Pre-flight has already run the analysis pass
 * over the whole kept part, and its wall time prices every audio stage of the
 * job far better than three seconds of it could (VH-100).
 */

import {
  Mp4OutputFormat,
  NullTarget,
  Output,
  VideoSampleSink,
  VideoSampleSource,
  type Input,
  type InputVideoTrack,
} from 'mediabunny'

import { CODEC_PROBE, GAIN_SOLVE } from '../config/audio'
import { log } from '../core/logger'
import {
  AUDIO_STAGE_PASSES,
  CALIBRATION_PROBE_SECONDS,
  MINIMUM_CREDIBLE_PROBE_FRAMES,
} from '../config/thresholds'
import type { OutputShape } from '../config/presets'
import { videoEncodingConfigFor } from './encoding'

export interface ProbeResult {
  /** False when too little was processed to believe the number. */
  readonly measured: boolean
  readonly framesEncoded: number
  readonly videoFramesPerSecond: number
  /** Seconds of audio analysed per second of wall clock, by pre-flight's analysis pass. */
  readonly audioRealtimeFactor: number | null
  /** Estimated wall-clock seconds for the whole job. `null` when unmeasured. */
  readonly estimatedSeconds: number | null
}

const UNMEASURED: ProbeResult = {
  measured: false,
  framesEncoded: 0,
  videoFramesPerSecond: 0,
  audioRealtimeFactor: null,
  estimatedSeconds: null,
}

/**
 * Encodes the first few seconds exactly as the pipeline would.
 *
 * Uses the same `Output`, the same `VideoSampleSource` and the same encoding
 * config the real job uses — into a `NullTarget`, which discards the bytes.
 * Measuring a cheaper path than the job will actually run is the one way a
 * calibration probe can be worse than no probe at all.
 */
async function probeVideo(
  track: InputVideoTrack,
  shape: OutputShape,
  signal: AbortSignal | undefined,
  fromSeconds: number,
): Promise<{ frames: number; seconds: number }> {
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: false }),
    target: new NullTarget(),
  })
  const source = new VideoSampleSource(videoEncodingConfigFor(shape))
  output.addVideoTrack(source, { frameRate: shape.frameRate })

  const sink = new VideoSampleSink(track)
  let frames = 0
  const startedAt = performance.now()

  try {
    await output.start()
    for await (const sample of sink.samples(fromSeconds, fromSeconds + CALIBRATION_PROBE_SECONDS)) {
      // Closed before breaking; see `audio-plan.ts` for the same shape.
      if (signal?.aborted) {
        sample.close()
        break
      }
      try {
        await source.add(sample)
      } finally {
        sample.close()
      }
      frames++
    }
    source.close()
    await output.finalize()
  } catch (cause) {
    await output.cancel().catch(() => undefined)
    throw cause
  }

  return { frames, seconds: (performance.now() - startedAt) / 1000 }
}

/** The time a job will take, stage by stage. */
export interface JobTimeEstimate {
  /** Decoding, conforming and encoding the kept part, at the probe's measured rate. */
  readonly videoSeconds: number
  /** The closing's frames, at the same rate. */
  readonly brandingSeconds: number
  /** "Analysing audio": passes A and B, the refinements, the re-measure, and the codec probe. */
  readonly audioPlanningSeconds: number
  /** Pass C, which runs on the encode's own thread. */
  readonly audioProcessingSeconds: number
  /** The decoded-output check: one analysis pass over the finished file's audio. */
  readonly verificationSeconds: number
  readonly totalSeconds: number
}

/**
 * The time a job will take, from what pre-flight measured.
 *
 * The video at the probe's rate, as before; the closing at the same rate,
 * because its frames are decoded, conformed and encoded like any other; and
 * every audio stage as a multiple of the analysis pass pre-flight timed
 * ({@link AUDIO_STAGE_PASSES}). The refinements are counted at their most,
 * {@link GAIN_SOLVE}'s limit, which five of six real recordings reached, and
 * so is the re-measure a lowered ceiling forces. The codec probe is priced by
 * what it covers, which is bounded.
 *
 * A job with no sound counts no audio stage. Audio that a three-second window
 * never reached used to divide by zero here and call the job "very long"
 * (VH-95's review); a pass over the whole kept part has no such window.
 */
export function jobTimeEstimate(measured: {
  readonly videoFrames: number
  readonly videoSeconds: number
  readonly frameRate: number
  /** Seconds of source the job keeps. */
  readonly durationSeconds: number
  /** Seconds of closing the output may carry. */
  readonly closingSeconds: number
  /**
   * Wall-clock seconds pre-flight's analysis pass took over the kept part, or
   * `null` when the job carries no sound.
   */
  readonly analysisSeconds: number | null
}): JobTimeEstimate {
  const framesPerSecond = measured.videoFrames / measured.videoSeconds
  const videoSeconds = (measured.durationSeconds * measured.frameRate) / framesPerSecond
  const brandingSeconds = (measured.closingSeconds * measured.frameRate) / framesPerSecond

  const pass = measured.analysisSeconds ?? 0
  const probedFraction =
    measured.durationSeconds > 0
      ? Math.min(
          1,
          (CODEC_PROBE.windowSeconds * CODEC_PROBE.maximumWindows) / measured.durationSeconds,
        )
      : 0
  const audioPlanningSeconds =
    pass *
    (1 +
      // B, every refinement, and the re-measure — conditional on the codec, so
      // counted, like the refinements, at the most a job can run.
      AUDIO_STAGE_PASSES.chain * (2 + GAIN_SOLVE.maximumRefinementPasses) +
      AUDIO_STAGE_PASSES.codecProbe * probedFraction)
  const audioProcessingSeconds = pass * AUDIO_STAGE_PASSES.chain
  // The check reads the finished file's audio, which is the kept part: every
  // closing is silent, and VH-23 would bring the first branding with a bed.
  const verificationSeconds = pass

  return {
    videoSeconds,
    brandingSeconds,
    audioPlanningSeconds,
    audioProcessingSeconds,
    verificationSeconds,
    totalSeconds:
      videoSeconds +
      brandingSeconds +
      audioPlanningSeconds +
      audioProcessingSeconds +
      verificationSeconds,
  }
}

/**
 * Measures throughput on the real file and extrapolates to the whole job.
 *
 * @param file - The user's chosen file, opened read-only.
 * @param shape - The output the job will actually produce; the probe encodes
 *   at exactly this configuration or the measurement means nothing.
 * @param durationSeconds - How much of the source the job encodes — the whole
 *   file, or the kept range — for the extrapolation.
 * @param fromSeconds - Where to start measuring: the in-point of a trim, so the
 *   probe times material that will actually be encoded (VH-95). Zero otherwise.
 * @param closingSeconds - The most closing the output may carry; pre-flight
 *   runs before the closing is chosen.
 * @param analysisSeconds - What pre-flight's analysis pass over the kept part
 *   took, or `null` when the job carries no sound.
 */
export async function calibrationProbe(options: {
  readonly input: Input
  readonly shape: OutputShape
  readonly durationSeconds: number
  readonly fromSeconds?: number
  readonly closingSeconds: number
  readonly analysisSeconds: number | null
  readonly signal?: AbortSignal
}): Promise<ProbeResult> {
  const { input, shape, durationSeconds, closingSeconds, analysisSeconds, signal } = options
  const fromSeconds = options.fromSeconds ?? 0

  try {
    const videoTrack = await input.getPrimaryVideoTrack()
    if (!videoTrack) return UNMEASURED

    const video = await probeVideo(videoTrack, shape, signal, fromSeconds)
    if (video.frames < MINIMUM_CREDIBLE_PROBE_FRAMES || video.seconds <= 0) {
      log.warn('probe', 'too few frames to trust the measurement', { frames: video.frames })
      return { ...UNMEASURED, framesEncoded: video.frames }
    }

    const estimate = jobTimeEstimate({
      videoFrames: video.frames,
      videoSeconds: video.seconds,
      frameRate: shape.frameRate,
      durationSeconds,
      closingSeconds,
      analysisSeconds,
    })
    const videoFramesPerSecond = video.frames / video.seconds
    const audioRealtimeFactor =
      analysisSeconds !== null && analysisSeconds > 0 ? durationSeconds / analysisSeconds : null

    const result: ProbeResult = {
      measured: true,
      framesEncoded: video.frames,
      videoFramesPerSecond,
      audioRealtimeFactor,
      estimatedSeconds: Math.round(estimate.totalSeconds),
    }
    const tenths = (seconds: number): number => Math.round(seconds * 10) / 10
    log.info('probe', 'calibration complete', {
      framesEncoded: result.framesEncoded,
      videoFramesPerSecond: Math.round(videoFramesPerSecond),
      audioRealtimeFactor: audioRealtimeFactor === null ? null : Math.round(audioRealtimeFactor),
      estimatedSeconds: result.estimatedSeconds,
      // Stage by stage, so an estimate can be held against the job it
      // described (VH-100).
      videoSeconds: tenths(estimate.videoSeconds),
      brandingSeconds: tenths(estimate.brandingSeconds),
      audioPlanningSeconds: tenths(estimate.audioPlanningSeconds),
      audioProcessingSeconds: tenths(estimate.audioProcessingSeconds),
      verificationSeconds: tenths(estimate.verificationSeconds),
    })
    return result
  } catch (cause) {
    // A probe that fails is not a job that fails: the estimate is unavailable,
    // pre-flight warns, and the user may still proceed.
    log.warn('probe', 'calibration probe failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return UNMEASURED
  }
}
