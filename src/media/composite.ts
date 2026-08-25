/**
 * Compositing branding over picture, spec section 4.3 (VH-22).
 *
 * The UoN closing masters store PREMULTIPLIED alpha, matted with black —
 * measured, not assumed: on the white variant, whose artwork reaches RGB 255
 * when opaque, RGB is exactly capped at alpha at every point of the ramp
 * (16/16, 75/75, 255/255). See tickets/VH-12.md.
 *
 * That makes the composite
 *
 *     out = brand + source × (1 − a)
 *
 * and NOT the straight-alpha form `brand × a + source × (1 − a)`. The
 * difference is not cosmetic: applying the straight form to premultiplied
 * source multiplies by alpha twice, darkening the logo and leaving a black
 * fringe on every edge. It looks plausible, which is what makes it dangerous —
 * `compositePremultiplied` is unit-tested against exactly that mistake.
 */

/** Bytes per pixel in the RGBA buffers `getImageData` and `VideoFrame` use. */
const RGBA = 4

/**
 * Composites a premultiplied-alpha branding frame over an opaque source frame.
 *
 * Writes into `source`, which is assumed opaque — it is decoded video, so it
 * has no meaningful alpha of its own, and the result stays opaque.
 *
 * @param source - RGBA pixels of the picture underneath. Modified in place.
 * @param brand - RGBA pixels of the branding, alpha already premultiplied into
 *   the colour channels. Must be the same length as `source`.
 */
export function compositePremultiplied(source: Uint8ClampedArray, brand: Uint8ClampedArray): void {
  if (source.length !== brand.length) {
    throw new RangeError(
      `Frames must be the same size: source has ${source.length} bytes, branding has ${brand.length}`,
    )
  }

  for (let i = 0; i < source.length; i += RGBA) {
    const alpha = brand[i + 3]!
    if (alpha === 255) {
      // Fully covered: the branding is the answer, and skipping the arithmetic
      // matters because four of the five branding seconds are fully opaque.
      source[i] = brand[i]!
      source[i + 1] = brand[i + 1]!
      source[i + 2] = brand[i + 2]!
      source[i + 3] = 255
      continue
    }
    if (alpha === 0) continue

    // `keep` is (1 - a) in 0..1, applied to the source's contribution only.
    // The branding term is added unscaled: it is already multiplied by alpha.
    const keep = (255 - alpha) / 255
    source[i] = brand[i]! + source[i]! * keep
    source[i + 1] = brand[i + 1]! + source[i + 1]! * keep
    source[i + 2] = brand[i + 2]! + source[i + 2]! * keep
    source[i + 3] = 255
  }
}
