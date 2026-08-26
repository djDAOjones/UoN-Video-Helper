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
 * Video throughput can be extrapolated from the encoded sample. Audio is
 * still calibrated to prove the exact decode path and report its measured
 * speed, but the production planner may traverse it repeatedly. Until those
 * adaptive traversals are modelled, an audio job has no honest total estimate.
 */

import {
  AudioSampleSink,
  Mp4OutputFormat,
  NullTarget,
  Output,
  VideoSampleSink,
  VideoSampleSource,
  type InputAudioTrack,
  type InputVideoTrack,
} from 'mediabunny'

import { AudioAnalyser } from '../audio/analyse'
import { log } from '../core/logger'
import { CALIBRATION_PROBE_SECONDS, MINIMUM_CREDIBLE_PROBE_FRAMES } from '../config/thresholds'
import type { OutputShape } from '../config/presets'
import { videoEncodingConfigFor } from './encoding'
import type { ProcessingTrackSelection } from './track-selection'

export type ProbeFailureStage = 'video-decode' | 'video-encode' | 'audio-decode'
export type VideoProbeStatus = 'supported' | 'failed' | 'not-run'

export interface ProbeResult {
  /** Verdict from the real decode-transform-encode path, not a codec-string query. */
  readonly videoSupport: VideoProbeStatus
  /** The pipeline stage that prevented measurement, when one did. */
  readonly failureStage: ProbeFailureStage | null
  /** False when too little was processed to believe the number. */
  readonly measured: boolean
  readonly framesEncoded: number
  readonly videoFramesPerSecond: number
  /** Seconds of audio analysed per second of wall clock. */
  readonly audioRealtimeFactor: number | null
  /** Estimated wall-clock seconds for the whole job, or `null` when unavailable. */
  readonly estimatedSeconds: number | null
}

export const PROBE_NOT_RUN: ProbeResult = Object.freeze({
  videoSupport: 'not-run',
  failureStage: null,
  measured: false,
  framesEncoded: 0,
  videoFramesPerSecond: 0,
  audioRealtimeFactor: null,
  estimatedSeconds: null,
})

class ProbeStageError extends Error {
  constructor(
    readonly stage: ProbeFailureStage,
    override readonly cause: unknown,
  ) {
    super(`Calibration failed during ${stage}`)
    this.name = 'ProbeStageError'
  }
}

function throwIfProbeAborted(signal: AbortSignal | undefined): void {
  signal?.throwIfAborted()
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
): Promise<{ frames: number; seconds: number }> {
  let output: Output | null = null
  let frames = 0
  const startedAt = performance.now()

  try {
    throwIfProbeAborted(signal)
    output = new Output({
      format: new Mp4OutputFormat({ fastStart: false }),
      target: new NullTarget(),
    })
    const source = new VideoSampleSource(videoEncodingConfigFor(shape))
    try {
      output.addVideoTrack(source, { frameRate: shape.frameRate })
      await output.start()
      throwIfProbeAborted(signal)
    } catch (cause) {
      if (signal?.aborted) throw cause
      throw new ProbeStageError('video-encode', cause)
    }

    try {
      const sink = new VideoSampleSink(track)
      for await (const sample of sink.samples(0, CALIBRATION_PROBE_SECONDS)) {
        // Cancellation after the iterator yields must still close the decoder
        // sample, so the abort check lives inside the ownership block.
        try {
          throwIfProbeAborted(signal)
          try {
            await source.add(sample)
          } catch (cause) {
            throw new ProbeStageError('video-encode', cause)
          }
          frames++
        } finally {
          sample.close()
        }
      }
      throwIfProbeAborted(signal)
    } catch (cause) {
      if (signal?.aborted || cause instanceof ProbeStageError) throw cause
      throw new ProbeStageError('video-decode', cause)
    }

    try {
      source.close()
      await output.finalize()
      // Finalization cannot accept a signal; cancellation while it held
      // control must not become a successful support result.
      throwIfProbeAborted(signal)
    } catch (cause) {
      if (signal?.aborted) throw cause
      throw new ProbeStageError('video-encode', cause)
    }
  } catch (cause) {
    if (output) await output.cancel().catch(() => undefined)
    throw cause
  }

  return { frames, seconds: (performance.now() - startedAt) / 1000 }
}

async function probeAudio(
  track: InputAudioTrack | null,
  signal: AbortSignal | undefined,
): Promise<{ seconds: number; wallSeconds: number } | null> {
  if (!track) return null

  throwIfProbeAborted(signal)
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])
  throwIfProbeAborted(signal)
  const analyser = new AudioAnalyser({ sampleRate, channelCount })
  const sink = new AudioSampleSink(track)

  let framesSeen = 0
  const startedAt = performance.now()

  for await (const sample of sink.samples(0, CALIBRATION_PROBE_SECONDS)) {
    try {
      throwIfProbeAborted(signal)
      const perChannel = sample.numberOfFrames
      const channels: Float32Array[] = []
      for (let ch = 0; ch < channelCount; ch++) {
        const data = new Float32Array(perChannel)
        sample.copyTo(data, { planeIndex: ch, format: 'f32-planar' })
        channels.push(data)
      }
      analyser.addFrames(channels)
      framesSeen += perChannel
    } finally {
      // Copy failures and cancellation both release the yielded sample.
      sample.close()
    }
  }
  throwIfProbeAborted(signal)
  analyser.finish()

  return {
    seconds: framesSeen / sampleRate,
    wallSeconds: (performance.now() - startedAt) / 1000,
  }
}

function failedProbe(
  stage: ProbeFailureStage,
  options: { readonly videoSupport: VideoProbeStatus; readonly framesEncoded?: number },
): ProbeResult {
  return {
    ...PROBE_NOT_RUN,
    videoSupport: options.videoSupport,
    failureStage: stage,
    framesEncoded: options.framesEncoded ?? 0,
  }
}

/**
 * Returns a defensible whole-job estimate from the work this probe represents.
 *
 * Audio planning, gain solving, encoding and finished-output verification can
 * require a data-dependent number of full traversals. Reporting only the two
 * traversals this probe used would present a precise structural underestimate.
 */
export function estimateJobDurationSeconds(videoSeconds: number, hasAudio: boolean): number | null {
  return hasAudio ? null : Math.round(videoSeconds)
}

/**
 * Measures throughput on the real file and extrapolates to the whole job.
 *
 * @param processingTracks - The exact tracks inspection described to the user.
 * @param shape - The output the job will actually produce; the probe encodes
 *   at exactly this configuration or the measurement means nothing.
 * @param videoWorkSeconds - Selected picture span whose frames are decoded and
 *   encoded. A delayed picture start is not itself another set of frames.
 */
export async function calibrationProbe(options: {
  readonly processingTracks: ProcessingTrackSelection
  readonly shape: OutputShape
  readonly videoWorkSeconds: number
  readonly signal?: AbortSignal
}): Promise<ProbeResult> {
  const { processingTracks, shape, videoWorkSeconds, signal } = options
  const videoTrack = processingTracks.video
  if (!videoTrack) return PROBE_NOT_RUN

  let video: { frames: number; seconds: number }
  try {
    video = await probeVideo(videoTrack, shape, signal)
  } catch (cause) {
    if (signal?.aborted) throw cause
    const stage = cause instanceof ProbeStageError ? cause.stage : 'video-encode'
    log.warn('probe', 'calibration video path failed', {
      stage,
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return failedProbe(stage, { videoSupport: 'failed' })
  }

  if (video.frames < MINIMUM_CREDIBLE_PROBE_FRAMES || video.seconds <= 0) {
    log.warn('probe', 'too few frames to trust the measurement', { frames: video.frames })
    return {
      ...PROBE_NOT_RUN,
      videoSupport: 'supported',
      framesEncoded: video.frames,
    }
  }

  let audio: { seconds: number; wallSeconds: number } | null
  try {
    audio = await probeAudio(processingTracks.audio, signal)
  } catch (cause) {
    if (signal?.aborted) throw cause
    log.warn('probe', 'calibration audio path failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return failedProbe('audio-decode', {
      videoSupport: 'supported',
      framesEncoded: video.frames,
    })
  }

  const videoFramesPerSecond = video.frames / video.seconds
  const totalFrames = videoWorkSeconds * shape.frameRate
  const videoSeconds = totalFrames / videoFramesPerSecond

  const audioRealtimeFactor =
    audio && audio.wallSeconds > 0 ? audio.seconds / audio.wallSeconds : null

  const result: ProbeResult = {
    videoSupport: 'supported',
    failureStage: null,
    measured: true,
    framesEncoded: video.frames,
    videoFramesPerSecond,
    audioRealtimeFactor,
    estimatedSeconds: estimateJobDurationSeconds(videoSeconds, audio !== null),
  }
  log.info('probe', 'calibration complete', {
    framesEncoded: result.framesEncoded,
    videoFramesPerSecond: Math.round(videoFramesPerSecond),
    audioRealtimeFactor: audioRealtimeFactor === null ? null : Math.round(audioRealtimeFactor),
    estimatedSeconds: result.estimatedSeconds,
  })
  return result
}
