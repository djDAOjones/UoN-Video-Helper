/**
 * Branding conform and concatenation, spec section 4.
 *
 * Sequences are prepended and appended, never overlaid. The branding carries
 * its own audio bed which is mastered at the target loudness and passes
 * through UNPROCESSED — which is why the audio chain cannot live in the
 * encoder's transform hook: that would apply to every sample, and levelling a
 * sting that is already at target would undo the mastering.
 *
 * The same reasoning drives the loudness analysis running on source content
 * only (spec 4.4). Measuring a five-second sting together with fifty minutes
 * of speech biases the integrated figure and mis-levels the whole video.
 */

import {
  AudioSampleSink,
  BlobSource,
  Input,
  Mp4InputFormat,
  VideoSample,
  VideoSampleSink,
  type AudioSampleSource,
  type VideoSampleSource,
} from 'mediabunny'

import { BRANDING_DURATIONS, brandingAssetUrl, selectBrandingMaster, type BrandingSegment } from '../config/branding'
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
export async function loadBrandingClip(
  segment: BrandingSegment,
  shape: OutputShape,
): Promise<BrandingClip | null> {
  const master = selectBrandingMaster({ height: shape.height, frameRate: shape.frameRate })
  const url = brandingAssetUrl(segment, master)
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const input = new Input({
      formats: [new Mp4InputFormat()],
      source: new BlobSource(await response.blob()),
    })
    const track = await input.getPrimaryVideoTrack()
    if (!track) throw new Error('Branding asset has no video track')

    const durationSeconds = await track.computeDuration()
    log.info('branding', 'clip loaded', {
      segment,
      master: `${master.width}x${master.height}@${master.frameRate}`,
      durationSeconds,
    })
    return { input, durationSeconds, segment }
  } catch (cause) {
    log.warn('branding', 'clip unavailable; continuing without it', {
      segment,
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return null
  }
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
    if (signal?.aborted) break
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
 */
export async function feedBrandingAudio(
  clip: BrandingClip,
  target: AudioSampleSource,
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
    if (signal?.aborted) break
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
      const out = toSample(channels, sampleRate, offsetSeconds + relative)
      try {
        await target.add(out)
      } finally {
        out.close()
      }
    } finally {
      sample.close()
    }
  }
}
