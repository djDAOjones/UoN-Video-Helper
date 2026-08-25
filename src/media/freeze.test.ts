import { describe, expect, it } from 'vitest'

import { CLEAN_FRAME_TOLERANCE, meanLuma, pickCleanFrameIndex } from './freeze'

describe('pickCleanFrameIndex', () => {
  it('takes the final frame when the ending is steady', () => {
    expect(pickCleanFrameIndex([120, 121, 119, 120, 122])).toBe(4)
  })

  it('walks back past a black flash on the final frame', () => {
    // The failure this exists for: the last frame is black, and freezing it
    // would hold a black screen under the logo for a second.
    expect(pickCleanFrameIndex([120, 121, 119, 120, 2])).toBe(3)
  })

  it('walks back past a blown white frame too', () => {
    expect(pickCleanFrameIndex([120, 121, 119, 120, 254])).toBe(3)
  })

  it('walks back over several bad frames, not just one', () => {
    expect(pickCleanFrameIndex([120, 121, 119, 3, 2, 250])).toBe(2)
  })

  it('accepts an ordinary change in brightness', () => {
    // A gesture or a slide change moves luma a little; that is not a defect
    // and must not send the freeze backwards unnecessarily.
    const drift = 120 + CLEAN_FRAME_TOLERANCE - 1
    expect(pickCleanFrameIndex([120, 121, 119, 120, drift])).toBe(4)
  })

  it('keeps the last frame of a deliberate fade to black', () => {
    // The false positive that matters. Every frame here differs from the
    // median, but the fade is the picture the author intended — freezing
    // mid-fade would look like a bug, so the trend must win over the
    // outlier test.
    expect(pickCleanFrameIndex([200, 150, 100, 50, 0])).toBe(4)
  })

  it('keeps the last frame of a fade UP from black too', () => {
    expect(pickCleanFrameIndex([0, 50, 100, 150, 200])).toBe(4)
  })

  it('tells a one-frame flash from a trend, however large the jump', () => {
    // A single big step is a discontinuity, not a fade: one significant step
    // is never a trend, so this still walks back.
    expect(pickCleanFrameIndex([120, 120, 120, 120, 0])).toBe(3)
  })

  it('rejects a blown final frame at the end of a fade, if not ideally', () => {
    // A fade that ends in a flash. The blown frame is correctly rejected, but
    // the median is meaningless on a sloping window, so the walk goes further
    // back than the end of the fade. Pinned as known behaviour rather than
    // left undefined — see the note in freeze.ts.
    const chosen = pickCleanFrameIndex([200, 150, 100, 50, 255])
    expect(chosen).not.toBe(4)
    expect(chosen).toBeLessThan(4)
  })

  it('handles a single candidate', () => {
    expect(pickCleanFrameIndex([42])).toBe(0)
  })

  it('refuses an empty window rather than returning -1', () => {
    expect(() => pickCleanFrameIndex([])).toThrow(RangeError)
  })
})

describe('meanLuma', () => {
  it('reads black and white at the extremes', () => {
    expect(meanLuma(new Uint8ClampedArray([0, 0, 0, 255]))).toBeCloseTo(0)
    expect(meanLuma(new Uint8ClampedArray([255, 255, 255, 255]))).toBeCloseTo(255)
  })

  it('weights green most, per Rec. 709', () => {
    const green = meanLuma(new Uint8ClampedArray([0, 255, 0, 255]))
    const red = meanLuma(new Uint8ClampedArray([255, 0, 0, 255]))
    const blue = meanLuma(new Uint8ClampedArray([0, 0, 255, 255]))
    expect(green).toBeGreaterThan(red)
    expect(red).toBeGreaterThan(blue)
    expect(green).toBeCloseTo(182.4, 0)
  })

  it('averages across pixels', () => {
    expect(meanLuma(new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]))).toBeCloseTo(127.5)
  })

  it('returns 0 for an empty buffer rather than dividing by zero', () => {
    expect(meanLuma(new Uint8ClampedArray([]))).toBe(0)
  })
})
