import { describe, expect, it } from 'vitest'

import {
  STANDARD_FRAME_RATES,
  conformCost,
  conformedFrameRate,
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

  it('costs nothing on a Teams recording, which is the point of VH-24', () => {
    // This assertion used to read `toBe(24)` with a 0.6 delta ratio, pinning
    // the defect rather than the rule: 16.000 fps became 24, duplicating half
    // the output frames. Spec 6.3 was reconciled on 2026-08-25 and this now
    // pins the corrected rule.
    const decision = conformCost(16)
    expect(decision.frameRate).toBe(16)
    expect(decision.frameDeltaRatio).toBe(0)
  })

  it('still reports the small drop a PowerPoint export implies', () => {
    // 1000/33. Above the floor, so the standard-value rule still applies and
    // 30 is the right answer — a 1% drop, not a 50% invention.
    const decision = conformCost(1000 / 33)
    expect(decision.frameRate).toBe(30)
    expect(decision.sourceFrameRate).toBeCloseTo(30.303, 3)
    expect(decision.frameDeltaRatio).toBeCloseTo(-0.01, 2)
  })
})

describe('conformedFrameRate', () => {
  // The two real corpus rates, named so a reader does not have to guess where
  // the numbers came from. Both were measured 2026-08-25; see tickets/VH-43.md.
  const TEAMS_MEETING_FPS = 16
  const POWERPOINT_EXPORT_FPS = 1000 / 33

  it('leaves a Teams recording at its own measured rate', () => {
    expect(conformedFrameRate(TEAMS_MEETING_FPS)).toBe(16)
  })

  it('rounds a PowerPoint export to the standard rate above the floor', () => {
    expect(conformedFrameRate(POWERPOINT_EXPORT_FPS)).toBe(30)
  })

  it('never rounds upward from below the lowest standard rate', () => {
    for (const rate of [1, 5, 10, 12, 15, 16, 20, 23.9]) {
      expect(conformedFrameRate(rate)).toBe(rate)
    }
  })

  it('rounds at and above the floor, so the rule has no gap at its edge', () => {
    expect(conformedFrameRate(24)).toBe(24)
    expect(conformedFrameRate(24.5)).toBe(24)
    expect(conformedFrameRate(26)).toBe(25)
  })

  it('rejects a nonsensical rate rather than guessing', () => {
    expect(() => conformedFrameRate(0)).toThrow(RangeError)
    expect(() => conformedFrameRate(-30)).toThrow(RangeError)
    expect(() => conformedFrameRate(Number.NaN)).toThrow(RangeError)
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
