import { describe, expect, it } from 'vitest'

import { fitRectangle } from './conform'

describe('fitRectangle', () => {
  it('fills the frame exactly when aspect ratios match', () => {
    const fit = fitRectangle({ width: 1920, height: 1080 }, { width: 1280, height: 720 })
    expect(fit).toEqual({ x: 0, y: 0, width: 1280, height: 720 })
  })

  it('pillarboxes a 4:3 source in a 16:9 frame', () => {
    // The legacy-recording case in the spec's test corpus.
    const fit = fitRectangle({ width: 1440, height: 1080 }, { width: 1920, height: 1080 })
    expect(fit.height).toBe(1080)
    expect(fit.width).toBe(1440)
    expect(fit.x).toBe(240)
    expect(fit.y).toBe(0)
    // Padding is symmetric, so the picture stays centred.
    expect(fit.x * 2 + fit.width).toBe(1920)
  })

  it('letterboxes a vertical source', () => {
    const fit = fitRectangle({ width: 1080, height: 1920 }, { width: 1920, height: 1080 })
    expect(fit.width).toBe(608)
    expect(fit.height).toBe(1080)
    expect(fit.y).toBe(0)
    expect(fit.x).toBe(656)
  })

  it('never distorts, whatever the mismatch', () => {
    const cases: ReadonlyArray<readonly [number, number]> = [
      [640, 480],
      [1920, 1080],
      [1080, 1920],
      [2560, 1080],
      [720, 720],
    ]
    for (const [width, height] of cases) {
      const target = { width: 1920, height: 1080 }
      const fit = fitRectangle({ width, height }, target)
      expect(fit.width / fit.height).toBeCloseTo(width / height, 1)
      expect(fit.width).toBeLessThanOrEqual(target.width)
      expect(fit.height).toBeLessThanOrEqual(target.height)
    }
  })

  it('scales a small source up to fill the frame', () => {
    const fit = fitRectangle({ width: 640, height: 360 }, { width: 1920, height: 1080 })
    expect(fit).toEqual({ x: 0, y: 0, width: 1920, height: 1080 })
  })
})
