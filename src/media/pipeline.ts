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
import { createContentAudioProcessor, planAudio } from './audio-plan'
import {
  BrandingRenderer,
  feedBrandingAudio,
  feedBrandingVideo,
  loadBrandingClip,
  type BrandingClip,
} from './branding'
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
  /** Spec 4.1: two independent toggles, giving all four combinations. */
  readonly branding: { readonly opening: boolean; readonly closing: boolean }
  /** Resolved D1 brand background; the worker has no document to read it from. */
  readonly backgroundColour: string
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
  const { input, shape, preset, durationSeconds, workspace, branding, signal, onProgress } =
    options

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

  // Branding is fetched before anything is written, so a missing asset is
  // known about while the job can still be described honestly.
  const opening: BrandingClip | null = branding.opening
    ? await loadBrandingClip('opening', shape)
    : null
  const closing: BrandingClip | null = branding.closing
    ? await loadBrandingClip('closing', shape)
    : null

  const openingSeconds = opening?.durationSeconds ?? 0
  const closingSeconds = closing?.durationSeconds ?? 0
  const contentOffset = openingSeconds
  const closingOffset = openingSeconds + durationSeconds

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
    audioSource = new AudioSampleSource(audioEncodingConfigFor(preset, audioPlan.channelCount))
    output.addAudioTrack(audioSource)
  }

  const timelineSeconds = openingSeconds + durationSeconds + closingSeconds
  const expectedFrames = Math.max(1, Math.round(timelineSeconds * shape.frameRate))
  let framesFed = 0

  const renderer = new BrandingRenderer(shape, options.backgroundColour)

  // Everything is fed in timeline order within its own track, and the two
  // tracks are fed concurrently — the muxer interleaves them, so running one
  // track to completion first would make it buffer the whole of that track.
  const feedVideo = async (): Promise<void> => {
    if (opening) await feedBrandingVideo(opening, videoSource, 0, renderer, signal)

    const sink = new VideoSampleSink(videoTrack)
    // Mediabunny's transform normalises the whole stream to a constant frame
    // rate, so the branding and the content land on one regular grid however
    // variable the source was.
    //
    // Timestamps are taken relative to the track's own first sample. Real
    // recordings do not reliably start at zero — encoder priming shows up as a
    // negative first timestamp — and with no opening sequence the offset is
    // zero, so an unnormalised negative timestamp would be rejected outright.
    let contentOrigin: number | null = null
    for await (const sample of sink.samples()) {
      throwIfAborted(signal)
      try {
        contentOrigin ??= sample.timestamp
        sample.setTimestamp(contentOffset + Math.max(0, sample.timestamp - contentOrigin))
        await videoSource.add(sample)
      } finally {
        sample.close()
      }
      framesFed++
      if (framesFed % 30 === 0) {
        onProgress?.({ stage: 'encoding', fraction: Math.min(0.98, framesFed / expectedFrames) })
      }
    }

    if (closing) await feedBrandingVideo(closing, videoSource, closingOffset, renderer, signal)
    videoSource.close()
  }

  const feedAudio = async (): Promise<void> => {
    if (!audioTrack || !audioSource || !audioPlan) return

    if (opening) {
      await feedBrandingAudio(opening, audioSource, 0, { fadeIn: false, fadeOut: true }, signal)
    }

    const processContent = createContentAudioProcessor(audioPlan, {
      offsetSeconds: contentOffset,
      durationSeconds,
      fadeIn: opening !== null,
      fadeOut: closing !== null,
    })
    const sink = new AudioSampleSink(audioTrack)
    for await (const sample of sink.samples()) {
      throwIfAborted(signal)
      let processed
      try {
        processed = processContent(sample)
      } finally {
        sample.close()
      }
      if (!processed) continue
      try {
        await audioSource.add(processed)
      } finally {
        processed.close()
      }
    }

    if (closing) {
      await feedBrandingAudio(
        closing,
        audioSource,
        closingOffset,
        { fadeIn: true, fadeOut: false },
        signal,
      )
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
      openingSeconds,
      closingSeconds,
      timelineSeconds,
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
