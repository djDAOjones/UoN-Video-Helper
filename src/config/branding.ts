/**
 * Branding configuration, spec section 4.
 *
 * Two models live here, deliberately.
 *
 * **Closing** uses the real 2025 masters (VH-12). Each 5 s master is shipped
 * as two parts split at exactly 1.00 s, where its alpha ramp completes: a
 * transparent `onset` and a fully opaque `tail`. What sits under the onset is
 * the user's choice of mode (VH-22).
 *
 * **Opening** is deferred (VH-23) — no opening assets exist, and the
 * maintainer's position is that closings are the norm for internal video. It
 * still runs on the generated placeholders and keeps the older single-clip
 * model until real assets arrive.
 *
 * Durations live here and nothing elsewhere may hard-code them: they feed the
 * subtitle offset, the time estimate, and the UI copy as well as the timeline.
 */

export type BrandingSegment = 'opening' | 'closing'

/* -------------------------------------------------------------------------
 * Closing — real assets
 * ---------------------------------------------------------------------- */

export type BrandingStyle = 'fade' | 'slide'
export type BrandingColour = 'blue' | 'white'

/**
 * How the closing graphic meets the source (VH-22). `T` is the source
 * duration.
 *
 * The graphic opens with a 1 s animated build. What the three modes really
 * choose between is what sits UNDERNEATH that build, so they are named for
 * that — using the conventional edit terms rather than invented ones.
 *
 * - `hard-cut` — the build is discarded and the picture cuts straight to the
 *   finished card. Output `T + 4.00`. Composites nothing, so it is the only
 *   mode that works without alpha decode.
 * - `over-picture` — the build plays over the closing second of moving
 *   picture. Output `T + 4.00`. Nothing is cut, but that second is
 *   progressively covered.
 * - `over-freeze` — the final frame sustains under the build. Output
 *   `T + 5.00`. Nothing is covered, at the cost of a frozen second.
 */
export type BrandingMode = 'hard-cut' | 'over-picture' | 'over-freeze'

/** Measured from the masters, not assumed. See tickets/VH-12.md. */
export const CLOSING_ONSET_SECONDS = 1
export const CLOSING_TAIL_SECONDS = 4

/**
 * Defaults, all the maintainer's choice (2026-08-25).
 *
 * `hard-cut` is the default because it is the least for a user to think about;
 * the other two are perks for people who want them. It also happens to be the
 * most robust choice — the one mode that composites nothing, so the default
 * path keeps working even in a browser that cannot decode transparency.
 */
export const CLOSING_DEFAULTS = {
  style: 'fade',
  colour: 'blue',
  mode: 'hard-cut',
} as const satisfies { style: BrandingStyle; colour: BrandingColour; mode: BrandingMode }

/**
 * What the user chose. Every closing field is optional and falls back to
 * {@link CLOSING_DEFAULTS}, so a caller that does not care says nothing.
 */
export interface BrandingChoice {
  readonly opening: boolean
  readonly closing: boolean
  readonly style?: BrandingStyle
  readonly colour?: BrandingColour
  readonly mode?: BrandingMode
}

/** Seconds a closing adds to the output, which is mode-dependent. */
export function closingAddedSeconds(mode: BrandingMode): number {
  return mode === 'over-freeze'
    ? CLOSING_ONSET_SECONDS + CLOSING_TAIL_SECONDS
    : CLOSING_TAIL_SECONDS
}

/** Whether a mode needs the transparent onset, and so alpha decode. */
export function modeNeedsOnset(mode: BrandingMode): boolean {
  return mode !== 'hard-cut'
}

/** The two shipped asset heights. */
export type BrandingAssetHeight = 1080 | 2160

/**
 * Picks the asset height for an output.
 *
 * Above 1080p the 4K assets are used so branding is never upscaled; below it,
 * the 1080p assets scale down. Only one master resolution was delivered, so
 * unlike the old model there is no frame-rate variant to choose — conversion
 * is Mediabunny's `transform.frameRate`.
 */
export function brandingAssetHeight(outputHeight: number): BrandingAssetHeight {
  return outputHeight > 1080 ? 2160 : 1080
}

export function closingOnsetName(
  style: BrandingStyle,
  colour: BrandingColour,
  height: BrandingAssetHeight,
): string {
  return `closing-onset-${style}-${colour}-${height}p.webm`
}

/** One tail per colour: Fade and Slide are identical after the onset. */
export function closingTailName(colour: BrandingColour, height: BrandingAssetHeight): string {
  return `closing-tail-${colour}-${height}p.mp4`
}

/* -------------------------------------------------------------------------
 * Opening — deferred, placeholders only (VH-23)
 * ---------------------------------------------------------------------- */

/** Open decision D2. Only the opening figure is still a placeholder guess. */
export const BRANDING_DURATIONS = {
  openingSeconds: 5,
  closingSeconds: CLOSING_TAIL_SECONDS,
} as const

export interface BrandingMaster {
  readonly width: number
  readonly height: number
  readonly frameRate: number
}

export const OPENING_MASTERS: readonly BrandingMaster[] = [
  { width: 1920, height: 1080, frameRate: 25 },
  { width: 1920, height: 1080, frameRate: 30 },
  { width: 3840, height: 2160, frameRate: 25 },
  { width: 3840, height: 2160, frameRate: 30 },
]

export function openingAssetName(master: BrandingMaster): string {
  const label = master.height >= 2160 ? '2160p' : '1080p'
  return `opening-${label}${master.frameRate}.mp4`
}

/** Frame rate is matched first: a rate mismatch judders, a size mismatch scales. */
export function selectOpeningMaster(output: {
  readonly height: number
  readonly frameRate: number
}): BrandingMaster {
  const wantsHighResolution = output.height > 1080
  const candidates = OPENING_MASTERS.filter(
    (master) => master.height >= 2160 === wantsHighResolution,
  )
  const pool = candidates.length > 0 ? candidates : OPENING_MASTERS

  let best = pool[0]!
  for (const master of pool) {
    if (
      Math.abs(master.frameRate - output.frameRate) <
      Math.abs(best.frameRate - output.frameRate)
    ) {
      best = master
    }
  }
  return best
}

/* ---------------------------------------------------------------------- */

/** Where the assets are served from. Copied verbatim by the build; stable URLs. */
export const BRANDING_ASSET_BASE = '/branding'

export function brandingAssetUrl(name: string): string {
  return `${BRANDING_ASSET_BASE}/${name}`
}
