/**
 * Selects the local, approved asset used by the closing-card preview.
 *
 * The production hard cut discards the animated onset, so previewing that
 * onset would promise a transition the result does not contain. The opaque
 * tail is both accurate and the most widely decodable approved asset.
 */

import { brandingAssetUrl, closingTailName, type BrandingColour } from '../config/branding'

/** The 1080p asset is ample for the small on-screen preview. */
export function closingPreviewUrl(colour: BrandingColour): string {
  return brandingAssetUrl(closingTailName(colour, 1080))
}

/** Motion starts only when the user's operating-system preference allows it. */
export function closingPreviewMayAutoplay(prefersReducedMotion: boolean): boolean {
  return !prefersReducedMotion
}
