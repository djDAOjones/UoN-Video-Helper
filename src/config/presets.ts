/**
 * The two output presets, spec sections 6.1 and 6.2.
 *
 * Presented to the user by purpose, never by technique — "Best quality" and
 * "Smaller file", not bitrates. Spec section 9.2: no codec, bitrate or
 * loudness setting is exposed, not even in an advanced panel, because every
 * exposed control is a decision a novice is forced to make.
 */

export type PresetId = 'best' | 'smaller'

/**
 * What the picture is mostly made of. Slides and screen recordings are
 * high-contrast static detail that compresses extremely efficiently; a talking
 * head does not. Spec section 6.2 sets different bitrates for each.
 *
 * `unknown` is the honest state before anything has looked at the pixels, and
 * resolves to the higher bitrate — guessing "slides" on camera footage would
 * visibly damage it, while the reverse only costs file size.
 */
export type ContentClass = 'screen' | 'camera' | 'unknown'

export interface Preset {
  readonly id: PresetId
  /** What the user reads. Purpose, not technique. */
  readonly label: string
  readonly description: string
  /** Longest edge the output may have; larger sources are scaled down to fit. */
  readonly maxHeight: number | null
  /** Highest output frame rate; faster sources are capped. */
  readonly maxFrameRate: number | null
  readonly audioBitrateStereoBps: number
  readonly audioBitrateMonoBps: number
}

export const PRESETS: Readonly<Record<PresetId, Preset>> = {
  best: {
    id: 'best',
    label: 'Best quality',
    description: 'For EchoVideo or YouTube. These re-encode your video when you upload it, so it is worth sending them the best copy.',
    // Spec 6.1: resolution and frame rate unchanged.
    maxHeight: null,
    maxFrameRate: null,
    audioBitrateStereoBps: 192_000,
    audioBitrateMonoBps: 192_000,
  },
  smaller: {
    id: 'smaller',
    label: 'Smaller file',
    description: 'For OneDrive, SharePoint or email. Students often download these directly, so a smaller file is kinder.',
    // Spec 6.2: resolution PRESERVED up to 1080p, reduced only above it.
    // Slide legibility depends far more on resolution than on bitrate, so the
    // saving is taken from bitrate instead. See rationale section 4.1.
    maxHeight: 1080,
    maxFrameRate: 30,
    audioBitrateStereoBps: 128_000,
    audioBitrateMonoBps: 96_000,
  },
}

/** Spec 6.1: ~0.12 bits per pixel per frame, which is ≈7.5 Mbps at 1080p30. */
const BEST_BITS_PER_PIXEL_PER_FRAME = 0.12

/**
 * Spec 6.2 reference bitrates, quoted at 1080p30 and scaled from there by
 * pixel rate. Screen content is mostly static between frames and needs far
 * less; camera motion does not.
 */
const SMALLER_REFERENCE_BPS: Readonly<Record<ContentClass, number>> = {
  screen: 1_500_000,
  camera: 2_500_000,
  unknown: 2_500_000,
}
const SMALLER_REFERENCE_PIXEL_RATE = 1920 * 1080 * 30

/** Spec 6.1 and 6.2: a keyframe every 2 seconds. */
export const KEYFRAME_INTERVAL_SECONDS = 2

/** Spec 6.1 and 6.2: AAC-LC at 48 kHz. */
export const OUTPUT_SAMPLE_RATE = 48_000

export interface OutputShape {
  readonly width: number
  readonly height: number
  readonly frameRate: number
  readonly videoBitrateBps: number
  readonly audioBitrateBps: number
}

/** Even dimensions, because H.264 chroma subsampling requires them. */
function toEvenDimension(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2)
}

/**
 * Works out the output shape for a preset and source.
 *
 * @param preset - Which of the two the user chose.
 * @param source - Display dimensions and the conformed constant frame rate.
 * @param content - What the picture is mostly made of; affects the smaller
 *   preset's bitrate only.
 */
export function outputShapeFor(
  preset: Preset,
  source: { readonly width: number; readonly height: number; readonly frameRate: number },
  content: ContentClass = 'unknown',
): OutputShape {
  const scale =
    preset.maxHeight !== null && source.height > preset.maxHeight
      ? preset.maxHeight / source.height
      : 1

  const width = toEvenDimension(source.width * scale)
  const height = toEvenDimension(source.height * scale)
  const frameRate =
    preset.maxFrameRate !== null ? Math.min(source.frameRate, preset.maxFrameRate) : source.frameRate

  const pixelRate = width * height * frameRate
  const videoBitrateBps =
    preset.id === 'best'
      ? Math.round(pixelRate * BEST_BITS_PER_PIXEL_PER_FRAME)
      : Math.round((pixelRate / SMALLER_REFERENCE_PIXEL_RATE) * SMALLER_REFERENCE_BPS[content])

  return {
    width,
    height,
    frameRate,
    videoBitrateBps,
    audioBitrateBps: preset.audioBitrateStereoBps,
  }
}

/**
 * Projected output size in bytes. Deliberately an over-estimate: it assumes
 * the encoder spends its whole bitrate budget and adds container overhead, so
 * the storage check in `capability.ts` errs toward refusing a job that would
 * have just fit rather than running out of disk an hour in.
 */
export function projectedOutputBytes(shape: OutputShape, durationSeconds: number): number {
  const bitsPerSecond = shape.videoBitrateBps + shape.audioBitrateBps
  const containerOverhead = 1.02
  return Math.round((bitsPerSecond / 8) * durationSeconds * containerOverhead)
}

/** The WebCodecs config this shape implies, for `isConfigSupported` and the encoder alike. */
export function videoEncoderConfigFor(shape: OutputShape): VideoEncoderConfig {
  return {
    // H.264 High profile, level 4.2 — covers 1080p60 and 4K30, which is the
    // ceiling anything in spec section 2 arrives at.
    codec: 'avc1.640033',
    width: shape.width,
    height: shape.height,
    bitrate: shape.videoBitrateBps,
    framerate: shape.frameRate,
    latencyMode: 'quality',
    avc: { format: 'avc' },
  }
}
