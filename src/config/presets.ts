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

/**
 * Spec 6.1: ~0.12 bits per pixel per frame, which is ≈7.5 Mbps at 1080p30.
 *
 * Two roles since VH-47, and it is the same number in both: the ANCHOR the
 * blend below pulls against, and the CEILING no output may exceed. What it is
 * no longer is the answer on its own — a figure derived from pixel count alone
 * cannot know that a Teams recording carries 1.0 Mbps and asked four times
 * that of it.
 */
const BEST_BITS_PER_PIXEL_PER_FRAME = 0.12

/**
 * How far the measured source pulls the figure away from the anchor, in log
 * space. 0.5 is the geometric mean: the claim that we have no basis yet to
 * trust either estimate over the other.
 *
 * This is the one number here that is judgement rather than measurement, and
 * it is worth knowing what would settle it: the calibration probe already
 * decodes three seconds of the real file, so encoding that sample at a spread
 * of multiples and scoring each through a second encode would measure it on
 * two files at widely separated densities. Recorded on VH-47's ticket.
 */
const BEST_SOURCE_BLEND = 0.5

/**
 * The floor the blend may not fall through, in bits per pixel per frame.
 *
 * 0.03 is a quarter of the anchor, and just above what the "smaller file"
 * preset targets for slides (0.024) — "best quality" must never ask for less
 * than "smaller file" would. It bounds a mis-measured source rather than a
 * genuinely thin one: `inspect.ts` walks every packet today, so a wrong figure
 * would take a change there to produce. It binds on no corpus file; the lowest
 * blended figure measured is 0.0306 (AMCS3068, a 0.48 Mbps 1080p export).
 */
const BEST_FLOOR_BITS_PER_PIXEL_PER_FRAME = 0.03

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
  /** What the encoder is asked for, after whichever source-relative rule applied. */
  readonly videoBitrateBps: number
  /**
   * What the preset alone would have asked for, before any source-relative rule.
   *
   * Kept so the decision is legible rather than silent — in a support bundle,
   * and in the pre-flight panel when it is worth telling the user. It exceeds
   * {@link videoBitrateBps} on BOTH presets now, for different reasons, so
   * comparing the two says only "something lowered it" and never which thing:
   * read {@link bitrateBasis} for that.
   */
  readonly requestedVideoBitrateBps: number
  /** Which rule decided {@link videoBitrateBps}. See {@link BitrateBasis}. */
  readonly bitrateBasis: BitrateBasis
  readonly audioBitrateBps: number
}

/**
 * Which rule produced the figure, so a support bundle and the interface can
 * both tell WHY rather than inferring it from a comparison.
 *
 * Inferring it is what went wrong: `requestedVideoBitrateBps > videoBitrateBps`
 * meant "capped at the source" while only the smaller preset could lower a
 * figure. VH-47 gave the best preset a way to lower one too, at which point
 * that comparison started reporting "already compressed as far as this setting
 * would take it" about outputs running at twice the source.
 */
export type BitrateBasis =
  /** The preset's own figure; the source bitrate could not be measured. */
  | 'preset'
  /** Spec 6.2's never-exceed-source cap bit. "Smaller file" only. */
  | 'capped-to-source'
  /** Spec 6.1's blend of the anchor and the measured source. "Best quality" only. */
  | 'blended-with-source'
  /** The blend exceeded the anchor, so the anchor held. "Best quality" only. */
  | 'anchor-ceiling'
  /** The blend fell through the floor, so the floor held. "Best quality" only. */
  | 'floor'

/**
 * Whether spec 6.2's never-exceed-source cap actually bit on this shape.
 *
 * Reads the basis rather than comparing the two figures: since VH-47 the best
 * preset also reports a `videoBitrateBps` below its request, and it is not
 * capped at the source — it is usually well above it.
 */
export function bitrateWasCappedToSource(shape: OutputShape): boolean {
  return shape.bitrateBasis === 'capped-to-source'
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
 *   it could not be measured; both source-relative rules then decline to act
 *   rather than guessing, and the preset's own figure stands.
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
    /**
     * The rate the source actually runs at, before conforming. Defaults to
     * `frameRate`, which is the CONFORMED rate — they differ whenever
     * conforming moves the rate, and dividing a bitrate by the wrong one
     * misreads the source's density by exactly that ratio.
     */
    readonly sourceFrameRate?: number | null | undefined
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

  const sourceBitrate = source.videoBitrateBps
  // `Number.isFinite`, not `typeof === 'number'`: Infinity is a number and
  // would sail through the second test into a division that yields Infinity.
  const measured = Number.isFinite(sourceBitrate) && (sourceBitrate as number) > 0
  const { videoBitrateBps, bitrateBasis } = measured
    ? bitrateFromSource(preset, pixelRate, requestedVideoBitrateBps, sourceBitrate as number, {
        width: source.width,
        height: source.height,
        frameRate: Number.isFinite(source.sourceFrameRate)
          ? (source.sourceFrameRate as number)
          : source.frameRate,
      })
    : { videoBitrateBps: requestedVideoBitrateBps, bitrateBasis: 'preset' as const }

  return {
    width,
    height,
    frameRate,
    videoBitrateBps,
    requestedVideoBitrateBps,
    bitrateBasis,
    audioBitrateBps: preset.audioBitrateStereoBps,
  }
}

/**
 * Both source-relative bitrate rules, for a source whose bitrate we measured.
 *
 * The two presets consult the source for opposite reasons and the asymmetry is
 * spec 6's, not a convenience:
 *
 * - **"Smaller file" is CAPPED at the source** (spec 6.2). The reference
 *   figures are targets for material that needs them, not floors. A Teams
 *   recording carries 1.006 Mbps at 1920x1080; asking 2.5 Mbps of it makes the
 *   output named "smaller" larger than what went in (VH-41).
 * - **"Best quality" is ANCHORED to the source with headroom** (spec 6.1). It
 *   is not capped, because re-encoding at exactly the source bitrate is worse
 *   than the source: the decoded frames already carry the first encoder's
 *   artefacts, and to the second encoder those are detail it must spend bits
 *   preserving. But a figure of `pixelRate x 0.12` never looked at the source
 *   at all, so the headroom it granted bore no relation to what was there to
 *   protect — 4.0x for the Teams recording, which had nothing left (VH-47).
 *
 * The blend is the geometric mean of the two independent estimates in bits per
 * pixel per frame, which gives the ratio the shape it should have: headroom
 * pays for the first encoder's artefacts, so it must SHRINK as those artefacts
 * approach nothing. `ratio = sqrt(anchor / sourceBpp)` does exactly that.
 *
 * **It may only ever lower the figure, never raise it.** That is measured, not
 * cautious: raising a well-encoded master toward its own density was tried at
 * 0.18 bpp and scored — it costs up to 933 MB per file for +0.60 VMAF against a
 * roughly 6-point just-noticeable difference, and the destination re-encodes on
 * ingest anyway. Holding at the anchor also means no job that runs today can be
 * refused tomorrow for storage it suddenly needs.
 */
function bitrateFromSource(
  preset: Preset,
  pixelRate: number,
  requested: number,
  sourceBitrate: number,
  sourceShape: { width: number; height: number; frameRate: number },
): { videoBitrateBps: number; bitrateBasis: BitrateBasis } {
  if (preset.id !== 'best') {
    return {
      videoBitrateBps: Math.min(requested, Math.round(sourceBitrate)),
      bitrateBasis: requested > sourceBitrate ? 'capped-to-source' : 'preset',
    }
  }

  // Density, not raw bitrate. The two agree today because "best quality"
  // neither downscales nor caps the rate, so the output shape IS the source
  // shape — but writing it in bits per pixel per frame is what keeps the rule
  // correct if that ever stops being true.
  const sourcePixelRate = sourceShape.width * sourceShape.height * sourceShape.frameRate
  const sourceBpp = sourceBitrate / sourcePixelRate
  const blended =
    BEST_BITS_PER_PIXEL_PER_FRAME ** (1 - BEST_SOURCE_BLEND) * sourceBpp ** BEST_SOURCE_BLEND

  if (blended > BEST_BITS_PER_PIXEL_PER_FRAME) {
    return {
      videoBitrateBps: Math.round(pixelRate * BEST_BITS_PER_PIXEL_PER_FRAME),
      bitrateBasis: 'anchor-ceiling',
    }
  }
  if (blended < BEST_FLOOR_BITS_PER_PIXEL_PER_FRAME) {
    return {
      videoBitrateBps: Math.round(pixelRate * BEST_FLOOR_BITS_PER_PIXEL_PER_FRAME),
      bitrateBasis: 'floor',
    }
  }
  return { videoBitrateBps: Math.round(pixelRate * blended), bitrateBasis: 'blended-with-source' }
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
    // H.264 High profile, level 5.1. The comment here read "level 4.2" until
    // 2026-08-26, which the string never said: `0x33` is 51. The code was right
    // and the comment was wrong in the direction that matters — 4.2 tops out
    // below 4K, and spec section 2 has 4K sources in it, so anyone trusting the
    // comment would have "fixed" the string into refusing them.
    codec: 'avc1.640033',
    width: shape.width,
    height: shape.height,
    bitrate: shape.videoBitrateBps,
    framerate: shape.frameRate,
    latencyMode: 'quality',
    avc: { format: 'avc' },
  }
}
