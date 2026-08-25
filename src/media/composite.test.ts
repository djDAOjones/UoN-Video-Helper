import { describe, expect, it } from 'vitest'

import { compositePremultiplied } from './composite'

/** One pixel, as the RGBA quads the canvas and WebCodecs both use. */
function px(r: number, g: number, b: number, a: number): Uint8ClampedArray {
  return new Uint8ClampedArray([r, g, b, a])
}

describe('compositePremultiplied', () => {
  it('leaves the picture untouched where the branding is fully transparent', () => {
    const source = px(10, 120, 240, 255)
    compositePremultiplied(source, px(0, 0, 0, 0))
    expect([...source]).toEqual([10, 120, 240, 255])
  })

  it('replaces the picture where the branding is fully opaque', () => {
    const source = px(10, 120, 240, 255)
    compositePremultiplied(source, px(0, 40, 90, 255))
    expect([...source]).toEqual([0, 40, 90, 255])
  })

  it('keeps the result opaque, since the output is video', () => {
    const source = px(200, 200, 200, 255)
    compositePremultiplied(source, px(30, 30, 30, 60))
    expect(source[3]).toBe(255)
  })

  it('rejects a size mismatch rather than reading past the end', () => {
    expect(() => compositePremultiplied(px(0, 0, 0, 255), new Uint8ClampedArray(8))).toThrow(
      RangeError,
    )
  })

  // The regression this module exists for. A WHITE logo at half opacity over a
  // WHITE picture must stay white: premultiplied gives 128 + 255×(1−128/255) =
  // 255. The straight-alpha form gives 128×0.502 + 255×0.498 ≈ 191 — a grey
  // smear where the logo should be invisible against the background. That is
  // the double-darkening, and it is the failure that looks plausible.
  it('does not double-darken: white branding over white picture stays white', () => {
    const source = px(255, 255, 255, 255)
    compositePremultiplied(source, px(128, 128, 128, 128))

    expect(source[0]).toBeGreaterThanOrEqual(254)
    expect(source[1]).toBeGreaterThanOrEqual(254)
    expect(source[2]).toBeGreaterThanOrEqual(254)

    // Pin the wrong answer explicitly so a future "simplification" to the
    // straight-alpha form fails here rather than shipping.
    const straightAlpha = Math.round(128 * (128 / 255) + 255 * (1 - 128 / 255))
    expect(straightAlpha).toBe(191)
    expect(source[0]).not.toBe(191)
  })

  it('matches the measured ramp: brand RGB is capped at alpha at every step', () => {
    // Values lifted from the masters — t=0.16s, 0.40s and 2.00s on the white
    // variant. Over black, a premultiplied composite reproduces the brand
    // term exactly, so these double as a check that the assets are what
    // VH-12 measured.
    for (const level of [16, 75, 255]) {
      const source = px(0, 0, 0, 255)
      compositePremultiplied(source, px(level, level, level, level))
      expect(source[0]).toBe(level)
    }
  })

  it('composites every pixel of a multi-pixel frame independently', () => {
    const source = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255])
    const brand = new Uint8ClampedArray([0, 0, 0, 0, 0, 40, 90, 255])
    compositePremultiplied(source, brand)
    expect([...source]).toEqual([255, 255, 255, 255, 0, 40, 90, 255])
  })
})
