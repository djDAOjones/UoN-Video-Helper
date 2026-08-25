import { describe, expect, it } from 'vitest'

import {
  BRANDING_DURATIONS,
  CLOSING_DEFAULTS,
  CLOSING_ONSET_SECONDS,
  CLOSING_TAIL_SECONDS,
  brandingAssetHeight,
  brandingAssetUrl,
  closingAddedSeconds,
  closingOnsetName,
  closingTailName,
  modeNeedsOnset,
  openingAssetName,
  selectOpeningMaster,
  type BrandingColour,
  type BrandingStyle,
} from './branding'

describe('closing duration by mode', () => {
  // The mode changes the output length, so anything that estimates time or
  // offsets subtitles has to ask rather than assume 4 seconds.
  it('adds only the tail for the two modes that end with the source', () => {
    expect(closingAddedSeconds('clean-cut')).toBe(4)
    expect(closingAddedSeconds('transition')).toBe(4)
  })

  it('adds a second more for the freeze, which sustains under the onset', () => {
    expect(closingAddedSeconds('transition-freeze')).toBe(5)
    expect(closingAddedSeconds('transition-freeze') - closingAddedSeconds('transition')).toBe(
      CLOSING_ONSET_SECONDS,
    )
  })

  it('agrees with the measured 1 s onset and 4 s tail', () => {
    expect(CLOSING_ONSET_SECONDS + CLOSING_TAIL_SECONDS).toBe(5)
  })
})

describe('which modes need alpha', () => {
  // Clean cut must stay reachable without alpha decode: it is the fallback if
  // a browser cannot handle transparent video (VH-12).
  it('needs the onset for both transition modes and not for clean cut', () => {
    expect(modeNeedsOnset('clean-cut')).toBe(false)
    expect(modeNeedsOnset('transition')).toBe(true)
    expect(modeNeedsOnset('transition-freeze')).toBe(true)
  })
})

describe('asset height', () => {
  it('uses the 4K assets only above 1080p, so branding is never upscaled', () => {
    expect(brandingAssetHeight(720)).toBe(1080)
    expect(brandingAssetHeight(1080)).toBe(1080)
    expect(brandingAssetHeight(1081)).toBe(2160)
    expect(brandingAssetHeight(2160)).toBe(2160)
    expect(brandingAssetHeight(2400)).toBe(2160)
  })
})

describe('closing asset naming', () => {
  const styles: BrandingStyle[] = ['fade', 'slide']
  const colours: BrandingColour[] = ['blue', 'white']

  it('names every onset distinctly', () => {
    const names = styles.flatMap((style) =>
      colours.flatMap((colour) =>
        ([1080, 2160] as const).map((height) => closingOnsetName(style, colour, height)),
      ),
    )
    expect(names).toHaveLength(8)
    expect(new Set(names).size).toBe(8)
    expect(names).toContain('closing-onset-fade-blue-2160p.webm')
  })

  it('shares one tail between the two styles, which are identical after the onset', () => {
    // Confirmed deliberate by the maintainer: one After Effects composition
    // duplicated, with only the onset animation and colour varied.
    expect(closingTailName('blue', 2160)).toBe('closing-tail-blue-2160p.mp4')
    expect(new Set(colours.map((colour) => closingTailName(colour, 1080))).size).toBe(2)
  })

  it('serves onsets as WebM and tails as MP4', () => {
    // Not cosmetic: the tail is the most universally decodable format on
    // purpose, so clean cut survives where alpha decode does not.
    expect(closingOnsetName('fade', 'blue', 1080).endsWith('.webm')).toBe(true)
    expect(closingTailName('blue', 1080).endsWith('.mp4')).toBe(true)
  })

  it('builds urls under the stable asset base', () => {
    expect(brandingAssetUrl(closingTailName('blue', 2160))).toBe(
      '/branding/closing-tail-blue-2160p.mp4',
    )
  })
})

describe('defaults', () => {
  it('defaults to Fade Blue, the maintainer choice', () => {
    expect(CLOSING_DEFAULTS.style).toBe('fade')
    expect(CLOSING_DEFAULTS.colour).toBe('blue')
  })

  it('names a mode default, since one is required to be stated', () => {
    expect(modeNeedsOnset(CLOSING_DEFAULTS.mode)).toBe(true)
  })
})

describe('opening — deferred, placeholders only', () => {
  it('still matches frame rate first, since a rate mismatch judders', () => {
    expect(selectOpeningMaster({ height: 1080, frameRate: 25 }).frameRate).toBe(25)
    expect(selectOpeningMaster({ height: 1080, frameRate: 24 }).frameRate).toBe(25)
    expect(selectOpeningMaster({ height: 1080, frameRate: 50 }).frameRate).toBe(30)
  })

  it('uses the 4K masters only above 1080p', () => {
    expect(selectOpeningMaster({ height: 720, frameRate: 25 }).height).toBe(1080)
    expect(selectOpeningMaster({ height: 1440, frameRate: 30 }).height).toBe(2160)
  })

  it('names placeholder variants distinctly', () => {
    expect(openingAssetName({ width: 1920, height: 1080, frameRate: 25 })).toBe(
      'opening-1080p25.mp4',
    )
  })
})

describe('durations', () => {
  it('holds D2 in one place, since the subtitle offset depends on it', () => {
    expect(BRANDING_DURATIONS.openingSeconds).toBe(5)
    expect(BRANDING_DURATIONS.closingSeconds).toBe(CLOSING_TAIL_SECONDS)
  })
})
