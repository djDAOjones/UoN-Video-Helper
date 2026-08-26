import { describe, expect, it } from 'vitest'

import { compositeSampled, compositePremultiplied } from './composite'

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

/**
 * The scaling composite, VH-44.
 *
 * Chrome and Firefox honour a request for RGBA, so the branding pixels can go
 * straight from the decoder to the blend without a canvas — which is the only
 * way to stop Firefox un-premultiplying them on the way. But `copyTo` gives the
 * frame at its OWN resolution, so scaling stops being the canvas's job and
 * becomes this function's.
 */
describe('compositeSampled', () => {
  /** A solid `w` x `h` premultiplied buffer. */
  function solid(w: number, h: number, [r, g, b, a]: readonly number[]): Uint8Array {
    const data = new Uint8Array(w * h * 4)
    for (let i = 0; i < w * h; i++) {
      data[i * 4] = r!
      data[i * 4 + 1] = g!
      data[i * 4 + 2] = b!
      data[i * 4 + 3] = a!
    }
    return data
  }

  /** An `w` x `h` opaque picture, every pixel the same. */
  function picture(w: number, h: number, value: number): Uint8ClampedArray {
    const data = new Uint8ClampedArray(w * h * 4)
    for (let i = 0; i < w * h; i++) {
      data[i * 4] = value
      data[i * 4 + 1] = value
      data[i * 4 + 2] = value
      data[i * 4 + 3] = 255
    }
    return data
  }

  const full = (w: number, h: number) => ({ x: 0, y: 0, width: w, height: h })

  it('agrees with the unscaled blend when nothing needs scaling', () => {
    // The real onset at t=0.40s: RGB 73 premultiplied into alpha 75.
    const source = picture(4, 4, 0)
    compositeSampled(source, solid(4, 4, [73, 73, 73, 75]), { width: 4, height: 4 }, full(4, 4), {
      width: 4,
      height: 4,
    })
    const reference = picture(1, 1, 0)
    compositePremultiplied(reference, new Uint8ClampedArray([73, 73, 73, 75]))
    expect([...source.slice(0, 4)]).toEqual([...reference])
  })

  it('adds the branding unscaled by alpha, which is what premultiplied means', () => {
    // Over black the output IS the stored colour. Getting this wrong by
    // multiplying by alpha again is the plausible-looking mistake.
    const source = picture(2, 2, 0)
    compositeSampled(source, solid(2, 2, [4, 10, 17, 75]), { width: 2, height: 2 }, full(2, 2), {
      width: 2,
      height: 2,
    })
    expect([...source.slice(0, 4)]).toEqual([4, 10, 17, 255])
  })

  it('leaves the picture alone where the branding is transparent', () => {
    const source = picture(2, 2, 200)
    compositeSampled(source, solid(2, 2, [0, 0, 0, 0]), { width: 2, height: 2 }, full(2, 2), {
      width: 2,
      height: 2,
    })
    expect([...source.slice(0, 4)]).toEqual([200, 200, 200, 255])
  })

  it('replaces the picture where the branding is opaque', () => {
    const source = picture(2, 2, 200)
    compositeSampled(source, solid(2, 2, [10, 20, 30, 255]), { width: 2, height: 2 }, full(2, 2), {
      width: 2,
      height: 2,
    })
    expect([...source.slice(0, 4)]).toEqual([10, 20, 30, 255])
  })

  it('scales a large branding frame down into a smaller output', () => {
    // The real case: a 1080p master over a 720p job.
    const source = picture(4, 4, 0)
    compositeSampled(
      source,
      solid(16, 16, [60, 60, 60, 80]),
      { width: 16, height: 16 },
      full(4, 4),
      {
        width: 4,
        height: 4,
      },
    )
    for (let i = 0; i < 16; i++) {
      expect(source[i * 4]).toBe(60)
      expect(source[i * 4 + 3]).toBe(255)
    }
  })

  it('scales a small branding frame up without leaving holes', () => {
    const source = picture(8, 8, 0)
    compositeSampled(source, solid(2, 2, [40, 50, 60, 200]), { width: 2, height: 2 }, full(8, 8), {
      width: 8,
      height: 8,
    })
    for (let i = 0; i < 64; i++) expect(source[i * 4]).toBe(40)
  })

  it('touches nothing outside the fit rectangle', () => {
    // A 4:3 source in a 16:9 job: whatever the branding does not cover must
    // still show the picture, not the brand background.
    const source = picture(8, 4, 200)
    compositeSampled(
      source,
      solid(2, 2, [255, 255, 255, 255]),
      { width: 2, height: 2 },
      { x: 2, y: 0, width: 4, height: 4 },
      { width: 8, height: 4 },
    )
    // Column 0 is outside the rectangle; column 2 is inside it.
    expect(source[0]).toBe(200)
    expect(source[2 * 4]).toBe(255)
    expect(source[7 * 4]).toBe(200)
  })

  it('does not let the opaque fast path swallow an edge', () => {
    // The fast paths only fire when all four sampled taps agree. At the
    // boundary between an opaque logo and transparency they do not, so the
    // pixel must still be interpolated — otherwise scaling would harden every
    // edge into a staircase (VH-51).
    const brand = new Uint8Array(2 * 1 * 4)
    brand.set([0, 0, 0, 0], 0)
    brand.set([200, 200, 200, 255], 4)
    const source = picture(8, 1, 0)
    compositeSampled(source, brand, { width: 2, height: 1 }, full(8, 1), { width: 8, height: 1 })
    const reds = Array.from({ length: 8 }, (_unused, i) => source[i * 4]!)
    // Intermediate values exist: neither 0 nor 200 everywhere.
    expect(reds.some((v) => v > 0 && v < 200)).toBe(true)
  })

  it('interpolates across a ramp rather than stepping', () => {
    // Premultiplied colour is the space interpolation is DEFINED in, so a
    // gradient scaled up should be smooth rather than blocky.
    const brand = new Uint8Array(2 * 1 * 4)
    brand.set([0, 0, 0, 0], 0)
    brand.set([200, 200, 200, 200], 4)
    const source = picture(8, 1, 0)
    compositeSampled(source, brand, { width: 2, height: 1 }, full(8, 1), { width: 8, height: 1 })
    const reds = Array.from({ length: 8 }, (_unused, i) => source[i * 4]!)
    // Monotonically increasing, and not just two values repeated.
    for (let i = 1; i < reds.length; i++) expect(reds[i]!).toBeGreaterThanOrEqual(reds[i - 1]!)
    expect(new Set(reds).size).toBeGreaterThan(2)
  })
})
