/**
 * Branding configuration, spec section 4.
 *
 * Durations are open decision D2 and live here precisely so answering it is a
 * one-line change. Nothing anywhere else may hard-code them: they feed the
 * subtitle offset, the time estimate, and the UI copy as well as the timeline.
 */

/** Open decision D2. Proposed 5 s opening / 4 s closing, not yet confirmed. */
export const BRANDING_DURATIONS = {
  openingSeconds: 5,
  closingSeconds: 4,
} as const

export type BrandingSegment = 'opening' | 'closing'

/**
 * The four master variants from spec section 4.2.
 *
 * Both frame rates are rendered from the After Effects source rather than
 * converted, which avoids frame-rate conversion judder entirely. Only the two
 * variants matching a job are ever fetched.
 */
export interface BrandingMaster {
  readonly width: number
  readonly height: number
  readonly frameRate: number
}

export const BRANDING_MASTERS: readonly BrandingMaster[] = [
  { width: 1920, height: 1080, frameRate: 25 },
  { width: 1920, height: 1080, frameRate: 30 },
  { width: 3840, height: 2160, frameRate: 25 },
  { width: 3840, height: 2160, frameRate: 30 },
]

/** Where the assets are served from. Copied verbatim by the build; stable URLs. */
export const BRANDING_ASSET_BASE = '/branding'

/** File name for a variant, e.g. `opening-1080p25.mp4`. */
export function brandingAssetName(segment: BrandingSegment, master: BrandingMaster): string {
  const label = master.height >= 2160 ? '2160p' : '1080p'
  return `${segment}-${label}${master.frameRate}.mp4`
}

export function brandingAssetUrl(segment: BrandingSegment, master: BrandingMaster): string {
  return `${BRANDING_ASSET_BASE}/${brandingAssetName(segment, master)}`
}

/**
 * Picks the master for a given output, spec section 4.3 step 1.
 *
 * Frame rate is matched first and resolution second, and that order matters: a
 * frame-rate mismatch has to be resolved by duplicating or dropping frames,
 * which judders on motion, whereas a resolution mismatch is resolved by
 * scaling, which does not. Above 1080p the 4K masters are used so the branding
 * is not upscaled.
 */
export function selectBrandingMaster(output: {
  readonly height: number
  readonly frameRate: number
}): BrandingMaster {
  const wantsHighResolution = output.height > 1080
  const candidates = BRANDING_MASTERS.filter(
    (master) => master.height >= 2160 === wantsHighResolution,
  )
  const pool = candidates.length > 0 ? candidates : BRANDING_MASTERS

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
