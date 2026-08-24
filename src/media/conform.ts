/**
 * Conform geometry.
 *
 * Scaling and constant-frame-rate conversion for the main content are handled
 * by Mediabunny's encoding `transform` — one implementation, shared by the
 * pipeline and the probe, so a measured estimate cannot drift from the job it
 * measured.
 *
 * What Mediabunny's `fit: 'contain'` does not offer is a choice of padding
 * colour, and spec section 4.3 requires the UoN brand background behind a
 * source whose aspect ratio does not match. That is a branding concern
 * (VH-8); this module holds the geometry it will need, kept pure and tested
 * separately from whatever draws it.
 */

/** Scaled rectangle that fits `source` inside `target` without distorting it. */
export function fitRectangle(
  source: { readonly width: number; readonly height: number },
  target: { readonly width: number; readonly height: number },
): { x: number; y: number; width: number; height: number } {
  const scale = Math.min(target.width / source.width, target.height / source.height)
  const width = Math.round(source.width * scale)
  const height = Math.round(source.height * scale)
  return {
    x: Math.round((target.width - width) / 2),
    y: Math.round((target.height - height) / 2),
    width,
    height,
  }
}
