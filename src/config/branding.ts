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

/* -------------------------------------------------------------------------
 * Closing — the three controls, and the job they ask for (VH-90)
 * ---------------------------------------------------------------------- */

/**
 * "Animation type". `cut` and `none` are different things that a list makes
 * look alike: `cut` is the closing with no animation, `none` is no closing.
 */
export type ClosingType = 'cut' | 'fade' | 'slide' | 'none'

/** "Animation onset": what sits under the 1 s build, for the types that play it. */
export type ClosingOnset = 'existing' | 'freeze'

/** The state of the three closing controls, exactly as the screen holds it. */
export interface ClosingControls {
  readonly type: ClosingType
  readonly onset: ClosingOnset
  readonly colour: BrandingColour
}

export const CLOSING_TYPES: readonly ClosingType[] = ['cut', 'fade', 'slide', 'none']
export const CLOSING_ONSETS: readonly ClosingOnset[] = ['existing', 'freeze']
export const CLOSING_COLOURS: readonly BrandingColour[] = ['blue', 'white']

/**
 * What the controls show before anyone touches them.
 *
 * `cut` is {@link CLOSING_DEFAULTS}' `hard-cut` under its on-screen name, and a
 * test holds the two together. `existing` is first in the list as the
 * maintainer asked for it; it is unread until a type that plays the build is
 * chosen.
 */
export const CLOSING_CONTROL_DEFAULTS: ClosingControls = {
  type: 'cut',
  onset: 'existing',
  colour: CLOSING_DEFAULTS.colour,
}

/** Whether a type plays the 1 s build, and so makes the onset mean something. */
export function closingTypeUsesOnset(type: ClosingType): boolean {
  return type === 'fade' || type === 'slide'
}

/**
 * Reads the controls' raw values, falling back to the default for any that is
 * not one the config knows.
 *
 * The DOM is editable, and an unrecognised value would otherwise reach the
 * pipeline as a string that matches no branch.
 */
export function readClosingControls(raw: {
  readonly type?: string | null | undefined
  readonly onset?: string | null | undefined
  readonly colour?: string | null | undefined
}): ClosingControls {
  const known = <T extends string>(allowed: readonly T[], value: unknown, fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback
  return {
    type: known(CLOSING_TYPES, raw.type, CLOSING_CONTROL_DEFAULTS.type),
    onset: known(CLOSING_ONSETS, raw.onset, CLOSING_CONTROL_DEFAULTS.onset),
    colour: known(CLOSING_COLOURS, raw.colour, CLOSING_CONTROL_DEFAULTS.colour),
  }
}

/**
 * The job the three controls ask for.
 *
 * The pipeline did not change for VH-90: this is the whole of the difference
 * between the old four-way radio and the new controls, and every combination
 * maps to the job its old radio produced.
 *
 * | Type | Onset | `closing` | `mode` |
 * | --- | --- | --- | --- |
 * | cut | unread | true | `hard-cut` |
 * | fade, slide | existing | true | `over-picture` |
 * | fade, slide | freeze | true | `over-freeze` |
 * | none | unread | false | unread |
 *
 * A field the pipeline will not read still carries its default rather than
 * being left out, so a `BrandingChoice` is never half-specified.
 */
export function brandingChoiceFor(controls: ClosingControls): BrandingChoice {
  const usesOnset = closingTypeUsesOnset(controls.type)
  return {
    // Always false: no approved opening asset exists (VH-23, iceboxed).
    opening: false,
    closing: controls.type !== 'none',
    style: controls.type === 'slide' ? 'slide' : CLOSING_DEFAULTS.style,
    colour: controls.type === 'none' ? CLOSING_DEFAULTS.colour : controls.colour,
    mode: !usesOnset
      ? CLOSING_DEFAULTS.mode
      : controls.onset === 'freeze'
        ? 'over-freeze'
        : 'over-picture',
  }
}

/** Seconds a closing adds to the output, which is mode-dependent. */
export function closingAddedSeconds(mode: BrandingMode): number {
  return mode === 'over-freeze'
    ? CLOSING_ONSET_SECONDS + CLOSING_TAIL_SECONDS
    : CLOSING_TAIL_SECONDS
}

/**
 * The most a closing can add, whichever mode is chosen.
 *
 * Pre-flight runs before the branding choice is known, and the size estimate
 * it produces is an upper bound, so it assumes the longest closing (VH-31).
 * Over-stating by a second on a job that turns out to be a clean cut is the
 * safe direction; under-stating is what let four real "Smaller file" jobs
 * produce a file larger than the figure the user decided on.
 */
export const LONGEST_CLOSING_SECONDS = CLOSING_ONSET_SECONDS + CLOSING_TAIL_SECONDS

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

/** Decision D2, answered for the closing. Only the opening figure is still a placeholder guess. */
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

/**
 * Where the assets are served from, relative to the page. Ends in a slash.
 *
 * Derived from Vite's `BASE_URL` rather than hard-coded to `/branding/`,
 * because a GitHub Pages project site serves from `/<repo>/` and every
 * branding fetch would 404 against an absolute path. `BASE_URL` always ends
 * in a slash, so this is `/branding/` locally, `/UoN-Video-Helper/branding/`
 * on Pages, and `./` in the flat Xerte package, where the masters sit beside
 * `index.html` (`__BRANDING_DIR__`, set in `vite.config.ts`). Page-relative,
 * so nothing fetches it directly: see {@link resolveBrandingBase}.
 */
export const BRANDING_ASSET_BASE = `${import.meta.env.BASE_URL}${__BRANDING_DIR__}`

/**
 * Resolves {@link BRANDING_ASSET_BASE} against the page, for the worker.
 *
 * The branding fetch runs in the worker, and a worker resolves a relative URL
 * against its own script, not the page. A relocatable build's `./branding`
 * therefore pointed into `assets/`, next to `job.worker-*.js`: every asset
 * 404'd, and since a branding fetch degrades rather than fails, every job
 * finished without its closing. Only the main thread knows the page, so it
 * resolves here and the worker is handed an absolute URL — the same reason
 * `backgroundColour` crosses the boundary already resolved.
 *
 * @param pageUrl - The document's base URL, `document.baseURI`.
 * @param base - The page-relative base; a parameter so each hosting shape can
 *   be tested, where `BASE_URL` is fixed per build.
 * @returns An absolute URL ending in a slash.
 */
export function resolveBrandingBase(pageUrl: string, base = BRANDING_ASSET_BASE): string {
  return new URL(base, pageUrl).href
}

/** @param baseUrl - From {@link resolveBrandingBase}, so it ends in a slash. */
export function brandingAssetUrl(name: string, baseUrl: string): string {
  return `${baseUrl}${name}`
}
