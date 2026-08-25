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
 *
 * Canvas `drawImage` cannot do this for us, and the reason is stronger than
 * it first looked: **the browsers disagree with each other.** Drawing the
 * white onset (RGB 75, alpha 75) over white was measured in all three
 * supported engines:
 *
 *     Chrome 151        -> 202   treats the decoded colour as STRAIGHT
 *     Safari 26.5.2     -> 202   treats the decoded colour as STRAIGHT
 *     Firefox 152, 154  -> 255   treats the decoded colour as PREMULTIPLIED
 *
 * 255 is the correct answer, so Gecko is the engine in the right — but a
 * composite that is correct in one engine and double-darkened in the other two
 * is not usable at any price.
 *
 * Firefox was measured twice, two major versions apart, and returned the same
 * 255 both times. So this is not a regression waiting to be fixed; it is a
 * settled difference in how the engines interpret a decoded frame's alpha, and
 * it is not going to resolve itself. The blend therefore happens HERE, on the
 * CPU, over the ~25 frames of the onset. Doing the arithmetic ourselves is the
 * only way the picture does not depend on which browser the user opened.
 *
 * THE ARITHMETIC IS PORTABLE. THE READBACK THAT FEEDS IT IS NOT — see
 * {@link BrandingCompositor.compose}, measured in all three engines under
 * VH-34 on 2026-08-25 and open as VH-44. Moving the blend off the GPU was
 * necessary and did not finish the job: the disagreement reappears one step
 * later, where the branding pixels leave the frame.
 */

import { VideoSample } from 'mediabunny'

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

/**
 * Composites branding frames over picture frames for the transition modes.
 *
 * Holds its two canvases open across frames rather than allocating per frame,
 * as {@link BrandingRenderer} does — at 4K these are 33 MB each.
 *
 * The overlay is cleared to TRANSPARENT rather than to the brand background.
 * During a transition, anything outside the branding's fitted rectangle must
 * show the picture underneath; padding it with background would cover the very
 * content the transition modes exist to preserve. That differs from the opaque
 * segments, where the background is correct.
 */
export class BrandingCompositor {
  private readonly base: OffscreenCanvas
  private readonly baseContext: OffscreenCanvasRenderingContext2D
  private readonly overlay: OffscreenCanvas
  private readonly overlayContext: OffscreenCanvasRenderingContext2D

  constructor(private readonly shape: { readonly width: number; readonly height: number }) {
    this.base = new OffscreenCanvas(shape.width, shape.height)
    this.overlay = new OffscreenCanvas(shape.width, shape.height)
    const base = this.base.getContext('2d', { willReadFrequently: true })
    const overlay = this.overlay.getContext('2d', { willReadFrequently: true })
    if (!base || !overlay) throw new Error('Could not get a 2d context for compositing')
    this.baseContext = base
    this.overlayContext = overlay
  }

  /**
   * Draws `brand` over `picture` and returns the result.
   *
   * **Correct in Chrome and Safari, wrong in Firefox (VH-44).** Every route
   * out of a decoded frame was measured on 2026-08-25, on the blue and white
   * onsets, against the RGBA the WebM actually holds:
   *
   * | Route | Chrome 151 | Firefox 154 | Safari 26.5.2 |
   * | --- | --- | --- | --- |
   * | `draw` then `getImageData` (below) | correct | UN-PREMULTIPLIED | correct |
   * | `new VideoFrame(canvas).copyTo` | double-premultiplied | correct | BGRA |
   * | `VideoSample.copyTo` (no canvas) | correct | correct | luma plane |
   *
   * `getImageData` returns STRAIGHT RGBA by specification, so an engine that
   * holds the decoded frame as premultiplied divides the alpha back out here.
   * On the white onset that overflows and WRAPS: 74 x 255/69 = 273, reported
   * as 17. Blue comes back 3.7x too bright. Both compositing modes are opt-in
   * and off by default, so nothing ships broken today — but no mode that uses
   * this may be defaulted on until VH-44 lands. `/spike-alpha.html` re-runs
   * the measurement.
   *
   * @param picture - The frame underneath. Drawn to fill the output shape.
   * @param brand - The branding frame, with premultiplied alpha. Fitted into
   *   the same shape; whatever it does not cover stays transparent, so the
   *   picture shows through.
   * @param fit - Where the branding sits within the frame.
   * @param timing - Timestamp and duration for the returned sample, in seconds.
   */
  compose(
    picture: VideoSample,
    brand: VideoSample,
    fit: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
    timing: { readonly timestamp: number; readonly duration: number },
  ): VideoSample {
    const { width, height } = this.shape

    this.baseContext.clearRect(0, 0, width, height)
    picture.draw(this.baseContext, 0, 0, width, height)

    this.overlayContext.clearRect(0, 0, width, height)
    brand.draw(this.overlayContext, fit.x, fit.y, fit.width, fit.height)

    const under = this.baseContext.getImageData(0, 0, width, height)
    const over = this.overlayContext.getImageData(0, 0, width, height)
    compositePremultiplied(under.data, over.data)
    this.baseContext.putImageData(under, 0, 0)

    return new VideoSample(this.base, timing)
  }
}
