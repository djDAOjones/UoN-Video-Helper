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
    description:
      'For EchoVideo or YouTube. These re-encode your video when you upload it, so it is worth sending them the best copy.',
    // Spec 6.1: resolution and frame rate unchanged.
    maxHeight: null,
    maxFrameRate: null,
    audioBitrateStereoBps: 192_000,
    audioBitrateMonoBps: 192_000,
  },
  smaller: {
    id: 'smaller',
    label: 'Smaller file',
    description:
      'For OneDrive, SharePoint or email. Students often download these directly, so a smaller file is kinder.',
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
  /** What the encoder is asked for, after spec 6.2's never-exceed-source cap. */
  readonly videoBitrateBps: number
  /**
   * What the preset alone would have asked for, before the cap.
   *
   * Kept so the cap is VISIBLE rather than silent: when this exceeds
   * {@link videoBitrateBps}, the preset wanted more than the source carries
   * and the user is told so instead of wondering why the figures moved.
   */
  readonly requestedVideoBitrateBps: number
  readonly audioBitrateBps: number
}

/** Whether spec 6.2's never-exceed-source cap actually bit on this shape. */
export function bitrateWasCappedToSource(shape: OutputShape): boolean {
  return shape.requestedVideoBitrateBps > shape.videoBitrateBps
}

/** Even dimensions, because H.264 chroma subsampling requires them. */
function toEvenDimension(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2)
}

/**
 * Works out the output shape for a preset and source.
 *
 * @param preset - Which of the two the user chose.
 * @param source - Display dimensions, the conformed constant frame rate, and
 *   the video bitrate the source actually carries. Omit `videoBitrateBps` when
 *   it could not be measured; the cap is then not applied rather than guessed.
 * @param content - What the picture is mostly made of; affects the smaller
 *   preset's bitrate only.
 */
export function outputShapeFor(
  preset: Preset,
  source: {
    readonly width: number
    readonly height: number
    readonly frameRate: number
    // `undefined` is spelled out because `exactOptionalPropertyTypes` is on:
    // a caller spreading a report whose field is undefined is the normal case,
    // not a mistake to reject.
    readonly videoBitrateBps?: number | null | undefined
  },
  content: ContentClass = 'unknown',
): OutputShape {
  const scale =
    preset.maxHeight !== null && source.height > preset.maxHeight
      ? preset.maxHeight / source.height
      : 1

  const width = toEvenDimension(source.width * scale)
  const height = toEvenDimension(source.height * scale)
  const frameRate =
    preset.maxFrameRate !== null
      ? Math.min(source.frameRate, preset.maxFrameRate)
      : source.frameRate

  const pixelRate = width * height * frameRate
  const requestedVideoBitrateBps =
    preset.id === 'best'
      ? Math.round(pixelRate * BEST_BITS_PER_PIXEL_PER_FRAME)
      : Math.round((pixelRate / SMALLER_REFERENCE_PIXEL_RATE) * SMALLER_REFERENCE_BPS[content])

  // Spec 6.2: "never above the source's own video bitrate". The reference
  // figures are targets for material that needs them, not floors — a Teams
  // recording carries 1.006 Mbps at 1920x1080, and asking 2.5 Mbps of it makes
  // the output named "smaller" larger than what went in (VH-41).
  //
  // The cap is deliberately NOT applied to "best quality", and that asymmetry
  // is the spec's: that preset goes to destinations which re-encode on ingest,
  // where headroom above the source is what keeps a second generation from
  // showing. Only the preset that promises a smaller file has to honour it.
  const sourceBitrate = source.videoBitrateBps
  const capped =
    preset.id !== 'best' && typeof sourceBitrate === 'number' && sourceBitrate > 0
      ? Math.min(requestedVideoBitrateBps, Math.round(sourceBitrate))
      : requestedVideoBitrateBps

  return {
    width,
    height,
    frameRate,
    videoBitrateBps: capped,
    requestedVideoBitrateBps,
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
