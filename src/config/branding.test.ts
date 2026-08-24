import { describe, expect, it } from 'vitest'

import { BRANDING_DURATIONS, brandingAssetName, selectBrandingMaster } from './branding'

describe('selectBrandingMaster', () => {
  it('matches frame rate exactly where it can', () => {
    expect(selectBrandingMaster({ height: 1080, frameRate: 25 }).frameRate).toBe(25)
    expect(selectBrandingMaster({ height: 1080, frameRate: 30 }).frameRate).toBe(30)
  })

  it('picks the nearer frame rate for rates with no master', () => {
    // 24 and 50 are output rates the spec allows; neither has its own master.
    expect(selectBrandingMaster({ height: 1080, frameRate: 24 }).frameRate).toBe(25)
    expect(selectBrandingMaster({ height: 1080, frameRate: 50 }).frameRate).toBe(30)
    expect(selectBrandingMaster({ height: 1080, frameRate: 60 }).frameRate).toBe(30)
  })

  it('uses the 4K masters only above 1080p, so branding is never upscaled', () => {
    expect(selectBrandingMaster({ height: 1080, frameRate: 25 }).height).toBe(1080)
    expect(selectBrandingMaster({ height: 720, frameRate: 25 }).height).toBe(1080)
    expect(selectBrandingMaster({ height: 2160, frameRate: 25 }).height).toBe(2160)
    expect(selectBrandingMaster({ height: 1440, frameRate: 30 }).height).toBe(2160)
  })

  it('prefers frame rate over resolution', () => {
    // A 4K 30 fps output takes the 4K 30 master, not the 4K 25 one.
    const chosen = selectBrandingMaster({ height: 2160, frameRate: 30 })
    expect(chosen).toEqual({ width: 3840, height: 2160, frameRate: 30 })
  })
})

describe('asset naming', () => {
  it('names each variant distinctly', () => {
    const names = [
      brandingAssetName('opening', { width: 1920, height: 1080, frameRate: 25 }),
      brandingAssetName('opening', { width: 1920, height: 1080, frameRate: 30 }),
      brandingAssetName('closing', { width: 3840, height: 2160, frameRate: 25 }),
    ]
    expect(names).toEqual(['opening-1080p25.mp4', 'opening-1080p30.mp4', 'closing-2160p25.mp4'])
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('durations', () => {
  it('holds D2 in one place, since the subtitle offset depends on it', () => {
    expect(BRANDING_DURATIONS.openingSeconds).toBe(5)
    expect(BRANDING_DURATIONS.closingSeconds).toBe(4)
  })
})
