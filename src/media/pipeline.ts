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
  TextSubtitleSource,
  VideoSampleSink,
  VideoSampleSource,
  type AudioSample,
  type Input,
} from 'mediabunny'

import { log } from '../core/logger'
import {
  CLOSING_DEFAULTS,
  CLOSING_ONSET_SECONDS,
  modeNeedsOnset,
  type BrandingChoice,
  type BrandingColour,
  type BrandingMode,
} from '../config/branding'
import type { OutputShape, Preset } from '../config/presets'
import { createContentAudioProcessor, planAudio } from './audio-plan'
import {
  BrandingRenderer,
  closingTimeline,
  feedBrandingAudio,
  feedBrandingVideo,
  loadBrandingClip,
  loadClosingOnset,
  type BrandingClip,
} from './branding'
import { BrandingCompositor } from './composite'
import { fitRectangle } from './conform'
import { findFreezeFrame } from './freeze'
import { audioEncodingConfigFor, videoEncodingConfigFor } from './encoding'
import { AudioTimelineShift, measureEncoderDelay } from './encoder-delay'
import type { OpfsWorkspace } from './opfs'
import { offsetVtt } from './vtt'

/** Named stages, per spec section 9.2 — not one opaque bar. */
export type PipelineStage = 'preparing' | 'analysing' | 'encoding' | 'finishing'

export interface PipelineProgress {
  readonly stage: PipelineStage
  /** 0 to 1 within the whole job. */
  readonly fraction: number
}

export interface PipelineResult {
  readonly file: File
  /**
   * What was actually applied, which is not always what was asked for: a
   * branding asset that fails to load is skipped rather than failing the job,
   * and the caller has to be able to say so.
   */
  readonly brandingApplied: { readonly opening: boolean; readonly closing: boolean }
  readonly subtitleCues: number
  /**
   * Where the source's own content starts in the output, in seconds.
   *
   * Reported rather than left for the caller to reconstruct. The acceptance
   * harness used to derive it from `BRANDING_DURATIONS.openingSeconds`, which
   * is what the opening is SUPPOSED to be — while the pipeline uses the clip's
   * actual decoded duration. The two agreed only because the placeholder is
   * exactly 5.000 s, so a real asset a few frames off would have quietly
   * shifted every loudness window the harness measured (VH-16).
   */
  readonly contentOffsetSeconds: number
}

/**
 * Runs both feed lanes, stops the survivor when one fails, and reports the
 * cause that actually mattered (VH-37).
 *
 * What `Promise.all` got wrong is narrower than this comment first claimed, and
 * the correction is worth keeping: it does NOT leak an unhandled rejection.
 * `PerformPromiseAll` calls `.then` on every element as it iterates, so a
 * later-rejecting sibling is always observed. Reproduced in Node — zero
 * `unhandledrejection` events (VH-51 review).
 *
 * The real defect is that `Promise.all` REJECTS EARLY AND LEAVES THE LOSER
 * RUNNING. The surviving lane goes on decoding, converting and pushing frames
 * into an `Output` the caller is already tearing down — wasted work on a job
 * that has failed, and muxer errors raised against a half-cancelled output that
 * can outrank the cause in the log.
 *
 * `allSettled` waits for both, so teardown cannot start while a lane is still
 * writing. `onFailure` aborts the signal the lanes share, so the survivor stops
 * at its next checkpoint instead of running to completion. And the rethrow
 * prefers a real cause over a {@link CancelledError}, because the cancellation
 * is an EFFECT of the failure and reporting it would name the symptom.
 *
 * @param lanes - Started here, not before, so nothing is in flight if this
 *   throws synchronously.
 * @param onFailure - Called as soon as any lane rejects.
 */
export async function settleLanes(
  lanes: ReadonlyArray<() => Promise<void>>,
  onFailure: () => void,
): Promise<void> {
  const settled = await Promise.allSettled(
    lanes.map((lane) =>
      lane().catch((cause: unknown) => {
        onFailure()
        throw cause
      }),
    ),
  )
  const failures = settled
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map((result) => result.reason as unknown)
  if (failures.length === 0) return
  throw failures.find((cause) => !(cause instanceof CancelledError)) ?? failures[0]
}

export class CancelledError extends Error {
  override readonly name = 'CancelledError'
  constructor() {
    super('The job was cancelled')
  }
}

/** `exactOptionalPropertyTypes` makes an explicit `undefined` an error here. */
function colourOption(branding: {
  readonly colour?: BrandingColour
}): { readonly colour?: BrandingColour } {
  return branding.colour ? { colour: branding.colour } : {}
}

export interface PipelineOptions {
  readonly input: Input
  readonly shape: OutputShape
  readonly preset: Preset
  /**
   * How long the PICTURE runs. Every branding boundary is measured against
   * this and never against the file's overall duration (VH-42).
   *
   * `SourceReport.durationSeconds` is `max(video, audio)`, and using it here
   * put the closing where the LONGER track ended: audio outrunning the picture
   * opened a video gap before the closing and pushed the composite point past
   * anything the source reached, so the build silently never appeared.
   */
  readonly videoDurationSeconds: number
  /** How long the source's audio runs, or `null` when it has none. */
  readonly audioDurationSeconds: number | null
  readonly workspace: OpfsWorkspace
  /**
   * Spec 4.1's two toggles, plus the closing's own choices (VH-12, VH-22).
   * Style, colour and mode fall back to `CLOSING_DEFAULTS` when unset.
   */
  readonly branding: BrandingChoice
  /** Resolved D1 brand background; the worker has no document to read it from. */
  readonly backgroundColour: string
  /**
   * A user-supplied WebVTT sidecar, verbatim. Its cue times are offset by the
   * opening sequence's duration; its text is never touched (spec 8.1).
   */
  readonly subtitleVtt?: string
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
export async function runPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const { workspace, signal } = options

  try {
    return await encode(options)
  } catch (cause) {
    // Cleanup belongs to the whole function, not to the encode alone.
    // Cancelling during the analysis pass used to escape before the encode's
    // own catch existed, leaving the job's scratch behind — the acceptance
    // harness found it, because it calls this directly and has no worker
    // fallback to hide it.
    await workspace.dispose()
    if (cause instanceof CancelledError || signal?.aborted) {
      log.info('pipeline', 'cancelled; workspace disposed')
      throw new CancelledError()
    }
    throw cause
  }
}

async function encode(options: PipelineOptions): Promise<PipelineResult> {
  const {
    input,
    shape,
    preset,
    videoDurationSeconds,
    audioDurationSeconds,
    workspace,
    branding,
    signal,
    onProgress,
  } = options

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
    // Both traversals report, throttled: the analysis is two full passes over
    // the track with nothing to say in between, and since VH-38 made silence
    // the signal that a worker is wedged, saying nothing for minutes is how a
    // healthy long job got itself cancelled (VH-51).
    let analysed = 0
    audioPlan = await planAudio(audioTrack, signal, () => {
      analysed++
      if (analysed % 200 === 0) onProgress?.({ stage: 'analysing', fraction: 0 })
    })
    throwIfAborted(signal)
  }

  // Branding is fetched before anything is written, so a missing asset is
  // known about while the job can still be described honestly.
  const opening: BrandingClip | null = branding.opening
    ? await loadBrandingClip('opening', shape)
    : null
  const closing: BrandingClip | null = branding.closing
    ? await loadBrandingClip('closing', shape, colourOption(branding))
    : null

  // The build is only fetched for the modes that composite it. If it fails to
  // load, the job degrades to a hard cut rather than losing branding entirely
  // — which is what keeps an alpha-decode failure a degradation, not an
  // outage (VH-12).
  const requestedMode = branding.mode ?? CLOSING_DEFAULTS.mode
  const build: BrandingClip | null =
    closing && modeNeedsOnset(requestedMode)
      ? await loadClosingOnset(shape, {
          ...(branding.style ? { style: branding.style } : {}),
          ...(branding.colour ? { colour: branding.colour } : {}),
        })
      : null
  const requestedOrFallback: BrandingMode = build ? requestedMode : 'hard-cut'
  if (build === null && modeNeedsOnset(requestedMode)) {
    log.warn('branding', 'no build available; falling back to a hard cut', {
      requestedMode,
    })
  }

  const openingSeconds = opening?.durationSeconds ?? 0
  const closingSeconds = closing?.durationSeconds ?? 0
  // Whether the closing master carries a bed of its own decides whether source
  // audio may run underneath it. The real masters carry none.
  const closingHasAudio = closing ? (await closing.input.getPrimaryAudioTrack()) !== null : false

  // All of it measured against the PICTURE (VH-42), and pure, so the arithmetic
  // is unit-tested in `branding.test.ts` rather than only reachable through a
  // browser.
  const timeline = closingTimeline({
    videoDurationSeconds,
    audioDurationSeconds,
    mode: requestedOrFallback,
    openingSeconds,
    closingSeconds,
    onsetSeconds: CLOSING_ONSET_SECONDS,
    closingHasAudio,
  })
  const { mode, contentOffsetSeconds: contentOffset, closingOffsetSeconds: closingOffset } = timeline
  const audioEndsAt = timeline.audioEndsAtSeconds

  if (timeline.downgradedForShortSource) {
    log.warn('branding', 'source is shorter than the build; holding a freeze frame instead', {
      videoDurationSeconds,
      buildSeconds: CLOSING_ONSET_SECONDS,
    })
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

  // Spec 8.3.4: preserve creation metadata where the muxer supports it.
  // Mediabunny reads and writes file-level tags even though it cannot see
  // subtitle tracks, so this much genuinely survives.
  try {
    const tags = await input.getMetadataTags()
    if (tags && Object.keys(tags).length > 0) {
      output.setMetadataTags(tags)
      log.debug('pipeline', 'metadata tags carried over', { keys: Object.keys(tags).length })
    }
  } catch (cause) {
    log.warn('pipeline', 'could not carry metadata tags', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
  }

  let audioSource: AudioSampleSource | null = null
  let timelineShift: AudioTimelineShift | null = null
  if (audioTrack && audioPlan) {
    const audioConfig = audioEncodingConfigFor(preset, audioPlan.channelCount)
    audioSource = new AudioSampleSource(audioConfig)
    output.addAudioTrack(audioSource)

    // The encoder's own delay, cancelled by shifting the audio timeline
    // earlier. Measured rather than assumed: it is a property of whichever
    // encoder this browser provides, and applying a number we had not
    // measured would be worse than leaving it alone.
    const delaySeconds = await measureEncoderDelay(audioConfig)
    timelineShift = new AudioTimelineShift(delaySeconds, audioPlan.channelCount)
  }

  // Spec 8.1: offset the timing, never the words. The offset is the opening
  // clip's ACTUAL duration, not the nominal one from config — if the real
  // asset is 5.2 s, captions must move 5.2 s.
  let subtitleSource: TextSubtitleSource | null = null
  let subtitleCues = 0
  if (options.subtitleVtt) {
    const offset = offsetVtt(options.subtitleVtt, openingSeconds)
    subtitleCues = offset.cueCount
    subtitleSource = new TextSubtitleSource('webvtt')
    // 'und' — undetermined. The sidecar carries no language declaration, and
    // inventing one would be worse than admitting we do not know.
    output.addSubtitleTrack(subtitleSource, { languageCode: 'und' })
    // Held until after start(); fed below.
    options = { ...options, subtitleVtt: offset.text }
  }

  const timelineSeconds = timeline.timelineSeconds
  const expectedFrames = Math.max(1, Math.round(timelineSeconds * shape.frameRate))
  let framesFed = 0

  const renderer = new BrandingRenderer(shape, options.backgroundColour)

  // One failing lane must stop the other (VH-37). Both push into the same
  // `Output`, so a lane that keeps feeding one that is already cancelling
  // rejects later with nothing awaiting it — and `diagnostics.ts` hooks
  // `unhandledrejection`, so the user was shown the real error AND a spurious
  // second entry in the errors panel for the lane that only failed because the
  // first one did.
  //
  // The lanes watch this signal rather than the caller's, and the caller's
  // aborts it, so user cancellation still reaches them.
  const lanes = new AbortController()
  const abortLanes = (): void => {
    lanes.abort()
  }
  signal?.addEventListener('abort', abortLanes, { once: true })
  // A listener attached to an ALREADY-aborted signal never fires, so without
  // this line a cancel landing between the last `throwIfAborted` and here was
  // lost outright and the job encoded the whole file (VH-51). Checked after
  // attaching, never before: the other order leaves the same race, narrower.
  if (signal?.aborted) abortLanes()
  const laneSignal = lanes.signal

  // Everything is fed in timeline order within its own track, and the two
  // tracks are fed concurrently — the muxer interleaves them, so running one
  // track to completion first would make it buffer the whole of that track.
  const feedVideo = async (): Promise<void> => {
    if (opening) await feedBrandingVideo(opening, videoSource, 0, renderer, laneSignal)

    const sink = new VideoSampleSink(videoTrack)

    const buildTrack = build ? await build.input.getPrimaryVideoTrack() : null
    const buildSink = buildTrack ? new VideoSampleSink(buildTrack) : null
    const compositor = buildSink ? new BrandingCompositor(shape) : null
    // The build is authored 16:9. A source of another shape gets it centred
    // rather than stretched; whatever it does not cover stays transparent, so
    // the picture shows through there.
    const buildFit = buildTrack
      ? fitRectangle({ width: buildTrack.displayWidth, height: buildTrack.displayHeight }, shape)
      : null
    const canComposite = compositor !== null && buildSink !== null && buildFit !== null

    /** Where the build starts, in source time, for `over-picture`. */
    const overlayFrom = timeline.overlayFromSeconds

    // Mediabunny's transform normalises the whole stream to a constant frame
    // rate, so the branding and the content land on one regular grid however
    // variable the source was.
    //
    // Timestamps are taken relative to the track's own first sample. Real
    // recordings do not reliably start at zero — encoder priming shows up as a
    // negative first timestamp — and with no opening sequence the offset is
    // zero, so an unnormalised negative timestamp would be rejected outright.
    let contentOrigin: number | null = null
    let lastTrackTimestamp = 0
    for await (const sample of sink.samples()) {
      throwIfAborted(laneSignal)
      try {
        // Read before `setTimestamp`, which mutates the sample in place.
        const original = sample.timestamp
        contentOrigin ??= original
        lastTrackTimestamp = original
        const sourceTime = Math.max(0, original - contentOrigin)
        const timestamp = contentOffset + sourceTime
        const buildTime = sourceTime - overlayFrom

        if (mode === 'over-picture' && canComposite && buildTime >= 0) {
          // Paired by TIMESTAMP, never by frame order. The build runs at
          // 25 fps and the source at whatever it was recorded at — 16 fps on
          // a Teams capture — so counting frames would drift them apart.
          const brand = await buildSink.getSample(buildTime)
          if (brand) {
            const composed = await compositor.compose(sample, brand, buildFit, {
              timestamp,
              duration: sample.duration,
            })
            try {
              await videoSource.add(composed)
            } finally {
              composed.close()
              brand.close()
            }
          } else {
            sample.setTimestamp(timestamp)
            await videoSource.add(sample)
          }
        } else {
          sample.setTimestamp(timestamp)
          await videoSource.add(sample)
        }
      } finally {
        sample.close()
      }
      framesFed++
      if (framesFed % 30 === 0) {
        onProgress?.({ stage: 'encoding', fraction: Math.min(0.98, framesFed / expectedFrames) })
      }
    }

    // `over-freeze` holds the last clean frame while the build runs over it,
    // so nothing the source showed is ever covered.
    if (mode === 'over-freeze' && canComposite) {
      const frozen = await findFreezeFrame(sink, lastTrackTimestamp, shape.frameRate)
      if (frozen) {
        try {
          const step = 1 / shape.frameRate
          const held = Math.round(CLOSING_ONSET_SECONDS * shape.frameRate)
          for (let index = 0; index < held; index++) {
            throwIfAborted(laneSignal)
            const brand = await buildSink.getSample(index * step)
            if (!brand) continue
            const composed = await compositor.compose(frozen, brand, buildFit, {
              timestamp: contentOffset + videoDurationSeconds + index * step,
              duration: step,
            })
            try {
              await videoSource.add(composed)
            } finally {
              composed.close()
              brand.close()
            }
            framesFed++
          }
        } finally {
          frozen.close()
        }
      }
    }

    if (closing) await feedBrandingVideo(closing, videoSource, closingOffset, renderer, laneSignal)
    videoSource.close()
  }

  const feedAudio = async (): Promise<void> => {
    if (!audioTrack || !audioSource || !audioPlan) return

    // Every sample fed to the encoder passes through the shift, so the whole
    // timeline moves together — branding and content alike.
    const emit = async (sample: AudioSample): Promise<void> => {
      const shifted = timelineShift ? timelineShift.apply(sample, audioPlan.sampleRate) : sample
      if (!shifted) return
      try {
        await audioSource.add(shifted)
      } finally {
        shifted.close()
      }
    }

    if (opening) {
      await feedBrandingAudio(opening, emit, 0, { fadeIn: false, fadeOut: true }, laneSignal)
    }

    const processContent = createContentAudioProcessor(audioPlan, {
      offsetSeconds: contentOffset,
      // The audio's OWN length, so its fade lands where it actually ends rather
      // than where the picture did.
      durationSeconds: audioEndsAt,
      fadeIn: opening !== null,
      fadeOut: closing !== null,
    })
    const sink = new AudioSampleSink(audioTrack)
    for await (const sample of sink.samples()) {
      throwIfAborted(laneSignal)
      let processed
      try {
        processed = processContent.process(sample)
      } finally {
        sample.close()
      }
      if (!processed) continue
      await emit(processed)
    }

    // The limiter holds a look-ahead window, so the stream simply stopping lost
    // that much from the end of every job (VH-20). The analysis pass already
    // flushed, so loudness was measured over audio the output did not contain.
    const tail = processContent.flush()
    if (tail) await emit(tail)

    if (closing) {
      await feedBrandingAudio(closing, emit, closingOffset, { fadeIn: true, fadeOut: false }, laneSignal)
    }
    audioSource.close()
  }

  try {
    await output.start()

    if (subtitleSource && options.subtitleVtt) {
      await subtitleSource.add(options.subtitleVtt)
      subtitleSource.close()
    }

    await settleLanes([feedVideo, feedAudio], abortLanes)

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
      subtitleCues,
      brandingRequested: `${branding.opening}/${branding.closing}`,
      brandingApplied: `${opening !== null}/${closing !== null}`,
    })
    return {
      file,
      brandingApplied: { opening: opening !== null, closing: closing !== null },
      subtitleCues,
      contentOffsetSeconds: contentOffset,
    }
  } catch (cause) {
    // Abandon the output so no writer is left holding a file the caller is
    // about to remove. Disposal itself is the outer handler's job.
    try {
      await output.cancel()
    } catch {
      // Already finalized or never started. Nothing to undo.
    }
    throw cause
  } finally {
    signal?.removeEventListener('abort', abortLanes)
  }
}
