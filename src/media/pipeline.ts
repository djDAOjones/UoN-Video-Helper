/**
 * Decode to encode to mux, streaming to OPFS.
 *
 * The whole architecture exists so this function never holds the media in
 * memory: frames flow one at a time, Mediabunny applies backpressure to the
 * decoder when the encoder falls behind, and bytes land in OPFS as they are
 * produced. Memory is bounded by a few frames, not by file size.
 *
 * Video and audio are fed concurrently rather than one after the other. The
 * muxer interleaves them, so feeding all of one first would force it to buffer
 * the whole of that track — the exact ceiling this design avoids.
 */

import {
  AudioSampleSink,
  AudioSampleSource,
  Mp4OutputFormat,
  Output,
  VideoSampleSink,
  VideoSampleSource,
  type Input,
} from 'mediabunny'

import { log } from '../core/logger'
import type { OutputShape, Preset } from '../config/presets'
import { createAudioProcessor, planAudio } from './audio-plan'
import { audioEncodingConfigFor, videoEncodingConfigFor } from './encoding'
import type { OpfsWorkspace } from './opfs'

/** Named stages, per spec section 9.2 — not one opaque bar. */
export type PipelineStage = 'preparing' | 'analysing' | 'encoding' | 'finishing'

export interface PipelineProgress {
  readonly stage: PipelineStage
  /** 0 to 1 within the whole job. */
  readonly fraction: number
}

export class CancelledError extends Error {
  override readonly name = 'CancelledError'
  constructor() {
    super('The job was cancelled')
  }
}

export interface PipelineOptions {
  readonly input: Input
  readonly shape: OutputShape
  readonly preset: Preset
  readonly durationSeconds: number
  readonly workspace: OpfsWorkspace
  readonly signal?: AbortSignal
  readonly onProgress?: (progress: PipelineProgress) => void
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw new CancelledError()
}

/**
 * Runs the full video pipeline and returns the finished file.
 *
 * On cancellation or failure the output is abandoned and the workspace is
 * disposed, so no partial file and no orphaned OPFS data survive — spec
 * section 13, acceptance criterion 8.
 */
export async function runPipeline(options: PipelineOptions): Promise<File> {
  const { input, shape, preset, durationSeconds, workspace, signal, onProgress } = options

  throwIfAborted(signal)
  onProgress?.({ stage: 'preparing', fraction: 0 })

  const videoTrack = await input.getPrimaryVideoTrack()
  if (!videoTrack) throw new Error('The source has no video track')
  const audioTrack = await input.getPrimaryAudioTrack()

  // Passes A and B. The encode cannot start until the single linear gain is
  // known, and the gain is not knowable until the chain has been measured.
  let audioPlan = null
  if (audioTrack) {
    onProgress?.({ stage: 'analysing', fraction: 0 })
    audioPlan = await planAudio(audioTrack, signal)
    throwIfAborted(signal)
  }

  const outputFile = await workspace.createFile(`output-${preset.id}.mp4`)

  const output = new Output({
    // Explicit, always. Left undefined, Mediabunny may choose 'in-memory',
    // which holds every chunk until finalize and reinstates the memory ceiling
    // this architecture exists to escape (AGENTS.md, hard rule).
    //
    // `false` puts the moov box at the end of the file. That is right for the
    // "best quality" preset, whose destinations re-encode on ingest. Whether
    // the "smaller file" preset should use 'reserve' to place the moov at the
    // front — better for progressive playback from SharePoint — is a real
    // question that needs a measured packet count, and is in the backlog
    // rather than guessed at here.
    format: new Mp4OutputFormat({ fastStart: false }),
    target: outputFile.target,
  })

  const videoSource = new VideoSampleSource(videoEncodingConfigFor(shape))
  output.addVideoTrack(videoSource, { frameRate: shape.frameRate })

  let audioSource: AudioSampleSource | null = null
  if (audioTrack && audioPlan) {
    audioSource = new AudioSampleSource(
      audioEncodingConfigFor(preset, audioPlan.channelCount, createAudioProcessor(audioPlan)),
    )
    output.addAudioTrack(audioSource)
  }

  const expectedFrames = Math.max(1, Math.round(durationSeconds * shape.frameRate))
  let framesFed = 0

  const feedVideo = async (): Promise<void> => {
    const sink = new VideoSampleSink(videoTrack)
    // Mediabunny's transform normalises this stream to a constant frame rate,
    // so source frames are consumed as they come and the output grid is
    // regular regardless of how variable the input was.
    for await (const sample of sink.samples()) {
      throwIfAborted(signal)
      try {
        await videoSource.add(sample)
      } finally {
        sample.close()
      }
      framesFed++
      if (framesFed % 30 === 0) {
        onProgress?.({
          stage: 'encoding',
          fraction: Math.min(0.98, framesFed / expectedFrames),
        })
      }
    }
    videoSource.close()
  }

  const feedAudio = async (): Promise<void> => {
    if (!audioTrack || !audioSource) return
    const sink = new AudioSampleSink(audioTrack)
    for await (const sample of sink.samples()) {
      throwIfAborted(signal)
      try {
        await audioSource.add(sample)
      } finally {
        sample.close()
      }
    }
    audioSource.close()
  }

  try {
    await output.start()
    await Promise.all([feedVideo(), feedAudio()])

    throwIfAborted(signal)
    onProgress?.({ stage: 'finishing', fraction: 0.99 })
    await output.finalize()

    const file = await outputFile.finish()
    onProgress?.({ stage: 'finishing', fraction: 1 })
    log.info('pipeline', 'encode complete', {
      preset: preset.id,
      framesFed,
      outputBytes: file.size,
      width: shape.width,
      height: shape.height,
      frameRate: shape.frameRate,
      audioGainDb: audioPlan ? Math.round(audioPlan.gainDb * 10) / 10 : null,
    })
    return file
  } catch (cause) {
    // Abandon the output before the workspace goes, so no handle is left
    // holding a file that is about to be removed.
    try {
      await output.cancel()
    } catch {
      // Already finalized or never started. Nothing to undo.
    }
    await workspace.dispose()

    if (cause instanceof CancelledError || signal?.aborted) {
      log.info('pipeline', 'cancelled; workspace disposed', { framesFed })
      throw new CancelledError()
    }
    throw cause
  }
}
