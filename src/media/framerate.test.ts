import { describe, expect, it } from 'vitest'

import {
  STANDARD_FRAME_RATES,
  conformCost,
  frameCountFor,
  frameTimestampUs,
  nearestStandardFrameRate,
} from './framerate'

describe('nearestStandardFrameRate', () => {
  it('leaves an already-standard rate alone', () => {
    for (const rate of STANDARD_FRAME_RATES) expect(nearestStandardFrameRate(rate)).toBe(rate)
  })

  it('snaps the NTSC rates to their nominal neighbours', () => {
    expect(nearestStandardFrameRate(23.976)).toBe(24)
    expect(nearestStandardFrameRate(29.97)).toBe(30)
    expect(nearestStandardFrameRate(59.94)).toBe(60)
  })

  it('snaps typical screen-recording rates', () => {
    expect(nearestStandardFrameRate(23.5)).toBe(24)
    expect(nearestStandardFrameRate(26)).toBe(25)
    expect(nearestStandardFrameRate(48)).toBe(50)
  })

  it('rejects a nonsensical rate rather than guessing', () => {
    expect(() => nearestStandardFrameRate(0)).toThrow(RangeError)
    expect(() => nearestStandardFrameRate(-30)).toThrow(RangeError)
    expect(() => nearestStandardFrameRate(Number.NaN)).toThrow(RangeError)
  })
})

describe('conformCost', () => {
  it('costs nothing when the source is already standard', () => {
    expect(conformCost(25).frameDeltaRatio).toBe(0)
  })

  it('reports the small duplication an NTSC source implies', () => {
    const decision = conformCost(29.97)
    expect(decision.frameRate).toBe(30)
    // ~1 frame in 1000 duplicated.
    expect(decision.frameDeltaRatio).toBeCloseTo(0.001, 3)
  })

  it('reports the large duplication a low-rate source implies', () => {
    // The case worth warning a user about: a 15 fps Teams recording gains
    // 60% more frames, all of them duplicates.
    const decision = conformCost(15)
    expect(decision.frameRate).toBe(24)
    expect(decision.frameDeltaRatio).toBeCloseTo(0.6, 2)
  })
})

describe('frameTimestampUs', () => {
  it('derives each timestamp from its index, so error cannot accumulate', () => {
    // One hour at 60 fps. Computing from the index bounds the error at a
    // microsecond; accumulating a rounded step would drift by seconds.
    const frameRate = 60
    const lastIndex = 60 * 60 * frameRate - 1
    const expected = (lastIndex * 1_000_000) / frameRate
    expect(frameTimestampUs(lastIndex, frameRate)).toBe(Math.round(expected))
  })

  it('produces a strictly increasing grid at awkward rates', () => {
    for (const rate of [24, 25, 30, 50, 60]) {
      let previous = -1
      for (let i = 0; i < 500; i++) {
        const ts = frameTimestampUs(i, rate)
        expect(ts).toBeGreaterThan(previous)
        previous = ts
      }
    }
  })
})

describe('frameCountFor', () => {
  it('counts frames for a duration', () => {
    expect(frameCountFor(10, 25)).toBe(250)
    expect(frameCountFor(0, 25)).toBe(0)
  })
})
