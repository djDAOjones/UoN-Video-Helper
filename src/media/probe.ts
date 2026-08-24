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
 * Both passes are measured, not just the visible one. Video decode-encode
 * dominates, but pass 1's audio analysis is real time on a slow machine and
 * assuming it away would under-promise in exactly the wrong direction.
 */

import {
  AudioSampleSink,
  Mp4OutputFormat,
  NullTarget,
  Output,
  VideoSampleSink,
  VideoSampleSource,
  type Input,
  type InputVideoTrack,
} from 'mediabunny'

import { AudioAnalyser } from '../audio/analyse'
import { log } from '../core/logger'
import { CALIBRATION_PROBE_SECONDS, MINIMUM_CREDIBLE_PROBE_FRAMES } from '../config/thresholds'
import type { OutputShape } from '../config/presets'
import { videoEncodingConfigFor } from './encoding'

export interface ProbeResult {
  /** False when too little was processed to believe the number. */
  readonly measured: boolean
  readonly framesEncoded: number
  readonly videoFramesPerSecond: number
  /** Seconds of audio analysed per second of wall clock. */
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
    for await (const sample of sink.samples(0, CALIBRATION_PROBE_SECONDS)) {
      if (signal?.aborted) break
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

async function probeAudio(
  input: Input,
  signal: AbortSignal | undefined,
): Promise<{ seconds: number; wallSeconds: number } | null> {
  const track = await input.getPrimaryAudioTrack()
  if (!track) return null

  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])
  const analyser = new AudioAnalyser({ sampleRate, channelCount })
  const sink = new AudioSampleSink(track)

  let framesSeen = 0
  const startedAt = performance.now()

  for await (const sample of sink.samples(0, CALIBRATION_PROBE_SECONDS)) {
    if (signal?.aborted) break
    const perChannel = sample.numberOfFrames
    const channels: Float32Array[] = []
    for (let ch = 0; ch < channelCount; ch++) {
      const data = new Float32Array(perChannel)
      sample.copyTo(data, { planeIndex: ch, format: 'f32-planar' })
      channels.push(data)
    }
    analyser.addFrames(channels)
    framesSeen += perChannel
    sample.close()
  }
  analyser.finish()

  return {
    seconds: framesSeen / sampleRate,
    wallSeconds: (performance.now() - startedAt) / 1000,
  }
}

/**
 * Measures throughput on the real file and extrapolates to the whole job.
 *
 * @param file - The user's chosen file, opened read-only.
 * @param shape - The output the job will actually produce; the probe encodes
 *   at exactly this configuration or the measurement means nothing.
 * @param durationSeconds - Full source duration, for the extrapolation.
 * @param formats - Input formats to accept, matching `inspect.ts`.
 */
export async function calibrationProbe(options: {
  readonly input: Input
  readonly shape: OutputShape
  readonly durationSeconds: number
  readonly signal?: AbortSignal
}): Promise<ProbeResult> {
  const { input, shape, durationSeconds, signal } = options

  try {
    const videoTrack = await input.getPrimaryVideoTrack()
    if (!videoTrack) return UNMEASURED

    const video = await probeVideo(videoTrack, shape, signal)
    if (video.frames < MINIMUM_CREDIBLE_PROBE_FRAMES || video.seconds <= 0) {
      log.warn('probe', 'too few frames to trust the measurement', { frames: video.frames })
      return { ...UNMEASURED, framesEncoded: video.frames }
    }

    const audio = await probeAudio(input, signal)

    const videoFramesPerSecond = video.frames / video.seconds
    const totalFrames = durationSeconds * shape.frameRate
    const videoSeconds = totalFrames / videoFramesPerSecond

    // Pass 1 analyses audio a second time, before pass 2 processes it, so the
    // audio cost is counted twice.
    const audioRealtimeFactor =
      audio && audio.wallSeconds > 0 ? audio.seconds / audio.wallSeconds : null
    const audioSeconds =
      audioRealtimeFactor !== null ? (durationSeconds / audioRealtimeFactor) * 2 : 0

    const result: ProbeResult = {
      measured: true,
      framesEncoded: video.frames,
      videoFramesPerSecond,
      audioRealtimeFactor,
      estimatedSeconds: Math.round(videoSeconds + audioSeconds),
    }
    log.info('probe', 'calibration complete', {
      framesEncoded: result.framesEncoded,
      videoFramesPerSecond: Math.round(videoFramesPerSecond),
      audioRealtimeFactor: audioRealtimeFactor === null ? null : Math.round(audioRealtimeFactor),
      estimatedSeconds: result.estimatedSeconds,
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
