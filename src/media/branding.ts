/**
 * Branding conform and concatenation, spec section 4.
 *
 * Sequences are prepended and appended; the two "transition" modes ALSO overlay
 * the build over picture, which shipped with VH-22 and lives in
 * `composite.ts` and `pipeline.ts`. This module handles the opaque parts —
 * every mode's tail, all of "hard cut" — plus where each segment sits on the
 * timeline ({@link closingTimeline}, VH-42).
 *
 * Both overlay modes are withdrawn from the interface. Their readback WAS
 * wrong in Firefox; VH-44 fixed that and verified it in all three engines, so
 * what keeps them out now is VH-45's decision rather than a defect — restoring
 * them is VH-46b. The pipeline paths never left.
 *
 * The real closing masters carry NO audio, which the maintainer confirms is
 * intended (2026-08-25) — so spec 4.4's mastered audio bed, and the rule that
 * it passes through unprocessed, describe nothing on current assets. The
 * pass-through path is kept because the placeholders still have a bed and a
 * future master might, but nothing depends on it.
 *
 * Loudness analysis still runs on source content only (spec 4.4): measuring a
 * five-second sting together with fifty minutes of speech would bias the
 * integrated figure and mis-level the whole video.
 */

import {
  AudioSampleSink,
  BlobSource,
  Input,
  Mp4InputFormat,
  VideoSample,
  WebMInputFormat,
  VideoSampleSink,
  type AudioSample,
  type VideoSampleSource,
} from 'mediabunny'

import {
  BRANDING_DURATIONS,
  CLOSING_DEFAULTS,
  brandingAssetHeight,
  brandingAssetUrl,
  closingOnsetName,
  closingTailName,
  type BrandingColour,
  type BrandingMode,
  type BrandingSegment,
  type BrandingStyle,
} from '../config/branding'
import { BOUNDARY_FADE_MS } from '../config/audio'
import { log } from '../core/logger'
import type { OutputShape } from '../config/presets'
import { toPlanar, toSample } from './audio-frames'
import { fitRectangle } from './conform'

/**
 * Draws branding frames into the output frame, scaled to fit and padded with
 * the brand background.
 *
 * Mediabunny's `fit: 'contain'` scales correctly but offers no choice of
 * padding colour, and spec 4.3 requires the UoN brand background behind a
 * source whose shape does not match — which is most 4:3 and vertical sources.
 * The canvas is held open across frames rather than allocated per frame.
 */
export class BrandingRenderer {
  private readonly canvas: OffscreenCanvas
  private readonly context: OffscreenCanvasRenderingContext2D

  constructor(
    private readonly shape: OutputShape,
    private readonly backgroundColour: string,
  ) {
    this.canvas = new OffscreenCanvas(shape.width, shape.height)
    const context = this.canvas.getContext('2d', { alpha: false })
    if (!context) throw new Error('Could not create a 2D context for branding conform')
    this.context = context
  }

  /** @returns A sample the caller owns and must close. */
  render(sample: VideoSample, timestampSeconds: number, durationSeconds: number): VideoSample {
    const fit = fitRectangle(
      { width: sample.displayWidth, height: sample.displayHeight },
      this.shape,
    )

    this.context.fillStyle = this.backgroundColour
    this.context.fillRect(0, 0, this.shape.width, this.shape.height)
    sample.draw(this.context, fit.x, fit.y, fit.width, fit.height)

    return new VideoSample(this.canvas, {
      timestamp: timestampSeconds,
      duration: durationSeconds,
    })
  }
}

/**
 * Applies a fade at a segment boundary, spec 4.4 and open decision D3.
 *
 * A hard cut between two unrelated pieces of audio clicks. D3 assumes a hard
 * cut with a short fade on each side rather than a crossfade or ducking:
 * simplest, most predictable, and impossible to get audibly wrong.
 */
export function applyBoundaryFade(
  channels: readonly Float32Array[],
  options: {
    /** Time of this chunk's first frame, relative to the start of its segment. */
    readonly chunkStartSeconds: number
    readonly segmentDurationSeconds: number
    readonly sampleRate: number
    readonly fadeIn: boolean
    readonly fadeOut: boolean
  },
): void {
  const fade = BOUNDARY_FADE_MS / 1000
  if (fade <= 0) return
  const frameCount = channels[0]?.length ?? 0

  for (let i = 0; i < frameCount; i++) {
    const t = options.chunkStartSeconds + i / options.sampleRate
    let gain = 1
    if (options.fadeIn && t < fade) gain = Math.min(gain, t / fade)
    if (options.fadeOut) {
      const remaining = options.segmentDurationSeconds - t
      if (remaining < fade) gain = Math.min(gain, Math.max(0, remaining / fade))
    }
    if (gain >= 1) continue
    for (const channel of channels) channel[i]! *= gain
  }
}

/**
 * Where each segment sits on the output timeline, spec section 4.3 (VH-42).
 *
 * Pure, and separate from the pipeline, because this is the arithmetic that was
 * wrong: every boundary was measured against `SourceReport.durationSeconds`,
 * which is `max(video, audio)`. A source whose audio outran its picture
 * therefore put the closing where the AUDIO ended — opening a video gap with
 * nothing in it — and pushed the composite point past anything the picture
 * reached, so the build silently never appeared. None of that is visible in a
 * unit test while it lives inline in a function that needs WebCodecs to run.
 *
 * The rule: **branding boundaries are measured against the picture.** Audio
 * that outruns it keeps playing underneath, because the real closing masters
 * carry no audio of their own and truncating a lecturer's last words to match
 * the picture would be the worse error.
 */
export interface ClosingTimeline {
  /** Where the content starts. */
  readonly contentOffsetSeconds: number
  /** Where the closing card starts, on the picture's clock. */
  readonly closingOffsetSeconds: number
  /** Where the build starts within the source, for `over-picture`. */
  readonly overlayFromSeconds: number
  /**
   * Where the source's audio is treated as ending, for the boundary fade.
   *
   * NOT a truncation point, despite an earlier version of this comment saying
   * so: nothing in the audio lane stops emitting here — it feeds the whole
   * `AudioSampleSink` and then flushes. So if a closing master ever carries a
   * bed of its own AND the source audio outruns the picture, both still write
   * the same stretch of one track; pulling this back to the boundary softens
   * the overlap rather than removing it. No shipped asset does — the real
   * closings are silent — so it is a recorded limit, not a live bug. VH-23 is
   * what would create the first branding with a bed.
   */
  readonly audioEndsAtSeconds: number
  /** Whole-output length, used for progress. */
  readonly timelineSeconds: number
  /** The mode actually used, which a too-short source can downgrade. */
  readonly mode: BrandingMode
  /** True when the source was too short to run the build across. */
  readonly downgradedForShortSource: boolean
}

export function closingTimeline(options: {
  readonly videoDurationSeconds: number
  readonly audioDurationSeconds: number | null
  readonly mode: BrandingMode
  readonly openingSeconds: number
  readonly closingSeconds: number
  readonly onsetSeconds: number
  /** Whether the closing master carries an audio bed of its own. */
  readonly closingHasAudio: boolean
}): ClosingTimeline {
  const {
    videoDurationSeconds,
    audioDurationSeconds,
    openingSeconds,
    closingSeconds,
    onsetSeconds,
    closingHasAudio,
  } = options

  // A source shorter than the build has no closing second to run the build
  // across, so `over-picture` would compute a negative start. `over-freeze`
  // holds one frame under the build and needs no content length at all.
  const downgradedForShortSource =
    options.mode === 'over-picture' && videoDurationSeconds < onsetSeconds
  const mode: BrandingMode = downgradedForShortSource ? 'over-freeze' : options.mode

  // Only the freeze adds time of its own: it holds a frame under the build.
  // "over picture" plays the build across content that was going to be there
  // anyway, so it costs nothing.
  const freezeSeconds = mode === 'over-freeze' ? onsetSeconds : 0

  const contentAudioSeconds = audioDurationSeconds ?? videoDurationSeconds
  const audioEndsAtSeconds = closingHasAudio
    ? Math.min(contentAudioSeconds, videoDurationSeconds)
    : contentAudioSeconds

  return {
    contentOffsetSeconds: openingSeconds,
    closingOffsetSeconds: openingSeconds + videoDurationSeconds + freezeSeconds,
    // Clamped, so the downgrade above is a belt and this is the braces: even if
    // a caller reaches here with a short source in `over-picture`, the start is
    // never negative.
    overlayFromSeconds: Math.max(0, videoDurationSeconds - onsetSeconds),
    audioEndsAtSeconds,
    // The two tracks end independently, so the output lasts as long as the
    // LATER of them — not the audio overrun stacked on top of the closing.
    // Video ends at opening + picture + freeze + closing; audio at opening +
    // its own length. Adding them over-reported whenever audio outran the
    // picture (VH-51).
    timelineSeconds:
      openingSeconds +
      Math.max(videoDurationSeconds + freezeSeconds + closingSeconds, audioEndsAtSeconds),
    mode,
    downgradedForShortSource,
  }
}

export interface BrandingClip {
  readonly input: Input
  readonly durationSeconds: number
  readonly segment: BrandingSegment
}

/**
 * Fetches the master matching this output.
 *
 * @returns `null` when the asset cannot be fetched. Branding is a nice-to-have
 *   relative to a correctly levelled video: a missing asset warns and is
 *   skipped rather than failing the whole job.
 */
/**
 * Fetches one branding asset.
 *
 * Both container formats are offered every time rather than chosen by file
 * extension: the tails are MP4 and the onsets are WebM, and a URL is not a
 * reliable statement about what is inside it.
 *
 * @returns `null` when the asset cannot be fetched. Branding is a nice-to-have
 *   relative to a correctly levelled video, so a missing asset warns and is
 *   skipped rather than failing the job.
 */
async function fetchClip(url: string, segment: BrandingSegment): Promise<BrandingClip | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const input = new Input({
      formats: [new Mp4InputFormat(), new WebMInputFormat()],
      source: new BlobSource(await response.blob()),
    })
    const track = await input.getPrimaryVideoTrack()
    if (!track) throw new Error('Branding asset has no video track')

    const durationSeconds = await track.computeDuration()
    log.info('branding', 'clip loaded', { segment, url, durationSeconds })
    return { input, durationSeconds, segment }
  } catch (cause) {
    log.warn('branding', 'clip unavailable; continuing without it', {
      segment,
      url,
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return null
  }
}

/**
 * Loads the opaque part of a segment.
 *
 * For `closing` this is the real 4 s tail, which is the whole of "hard cut".
 *
 * `opening` is DORMANT and returns `null` (VH-23, iceboxed 2026-08-27). There
 * are no approved opening assets and the maintainer's position is that there
 * will not be until far later in the product's life; the generated
 * placeholders that used to stand in have been removed from `public/branding/`
 * so that no unapproved University graphic can be served by a deployed build,
 * which is the risk VH-33 named.
 *
 * The path is refused here rather than deleted throughout. Everything
 * downstream — the timeline offsets, the subtitle shift, the estimate — is
 * written in terms of an opening duration that is currently zero, and is
 * tested that way. Tearing that out would cost more than it saves and would
 * have to be rebuilt to bring the feature back. Returning `null` is the same
 * answer the pipeline already handles for branding that fails to load: the
 * segment is skipped, and the caller reports what was applied.
 */
export async function loadBrandingClip(
  segment: BrandingSegment,
  shape: OutputShape,
  options: { readonly colour?: BrandingColour } = {},
): Promise<BrandingClip | null> {
  if (segment === 'opening') {
    log.info('branding', 'opening requested but dormant', { reason: 'no approved asset (VH-23)' })
    return null
  }
  const url = brandingAssetUrl(
    closingTailName(options.colour ?? CLOSING_DEFAULTS.colour, brandingAssetHeight(shape.height)),
  )
  return fetchClip(url, segment)
}

/**
 * Loads the 1 s transparent onset that the two transition modes composite.
 *
 * Kept separate from {@link loadBrandingClip} because it is optional in a way
 * the tail is not: if this returns `null` the job can still fall back to
 * "hard cut" and produce branding, which is why alpha decode failing in some
 * browser is a degradation rather than an outage (VH-12).
 */
export async function loadClosingOnset(
  shape: OutputShape,
  options: { readonly style?: BrandingStyle; readonly colour?: BrandingColour } = {},
): Promise<BrandingClip | null> {
  const url = brandingAssetUrl(
    closingOnsetName(
      options.style ?? CLOSING_DEFAULTS.style,
      options.colour ?? CLOSING_DEFAULTS.colour,
      brandingAssetHeight(shape.height),
    ),
  )
  return fetchClip(url, 'closing')
}

/** Nominal duration for a segment, used before the asset is loaded. */
export function nominalDuration(segment: BrandingSegment): number {
  return segment === 'opening'
    ? BRANDING_DURATIONS.openingSeconds
    : BRANDING_DURATIONS.closingSeconds
}

/**
 * Feeds one branding clip's video into the output at `offsetSeconds`.
 *
 * Timestamps are normalised against the track's own first sample. A track does
 * not necessarily start at zero — AAC in particular carries encoder priming as
 * a negative first timestamp, around -21 ms at 48 kHz — and a segment placed
 * at an offset must start exactly at that offset, not a little before it.
 */
export async function feedBrandingVideo(
  clip: BrandingClip,
  target: VideoSampleSource,
  offsetSeconds: number,
  renderer: BrandingRenderer,
  signal: AbortSignal | undefined,
): Promise<void> {
  const track = await clip.input.getPrimaryVideoTrack()
  if (!track) return
  const sink = new VideoSampleSink(track)
  let origin: number | null = null

  for await (const sample of sink.samples()) {
    // Closed before breaking; see `audio-plan.ts` for why.
    if (signal?.aborted) {
      sample.close()
      break
    }
    origin ??= sample.timestamp
    const conformed = renderer.render(
      sample,
      offsetSeconds + Math.max(0, sample.timestamp - origin),
      sample.duration,
    )
    try {
      await target.add(conformed)
    } finally {
      conformed.close()
      sample.close()
    }
  }
}

/**
 * Feeds one branding clip's audio into the output at `offsetSeconds`.
 *
 * Passed through untouched apart from the boundary fade — no high-pass, no
 * levelling, no compression. The bed is already at target.
 *
 * Emitted through a callback rather than added to the source directly, so the
 * encoder-delay shift applies to branding and content alike. A bed that
 * skipped it would sit at a different offset from the speech.
 */
export async function feedBrandingAudio(
  clip: BrandingClip,
  emit: (sample: AudioSample) => Promise<void>,
  offsetSeconds: number,
  fades: { readonly fadeIn: boolean; readonly fadeOut: boolean },
  signal: AbortSignal | undefined,
): Promise<void> {
  const track = await clip.input.getPrimaryAudioTrack()
  if (!track) return
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])
  const sink = new AudioSampleSink(track)
  let origin: number | null = null

  for await (const sample of sink.samples()) {
    // Closed before breaking; see `audio-plan.ts` for why.
    if (signal?.aborted) {
      sample.close()
      break
    }
    try {
      origin ??= sample.timestamp
      const relative = Math.max(0, sample.timestamp - origin)
      const channels = toPlanar(sample, channelCount)
      applyBoundaryFade(channels, {
        chunkStartSeconds: relative,
        segmentDurationSeconds: clip.durationSeconds,
        sampleRate,
        fadeIn: fades.fadeIn,
        fadeOut: fades.fadeOut,
      })
      await emit(toSample(channels, sampleRate, offsetSeconds + relative))
    } finally {
      sample.close()
    }
  }
}
