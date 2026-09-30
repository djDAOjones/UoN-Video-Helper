import { describe, expect, it } from 'vitest'

import {
  BRANDING_ASSET_BASE,
  BRANDING_DURATIONS,
  CLOSING_DEFAULTS,
  CLOSING_ONSET_SECONDS,
  CLOSING_TAIL_SECONDS,
  LONGEST_CLOSING_SECONDS,
  CLOSING_COLOURS,
  CLOSING_CONTROL_DEFAULTS,
  CLOSING_ONSETS,
  CLOSING_TYPES,
  brandingAssetHeight,
  brandingAssetUrl,
  brandingChoiceFor,
  closingAddedSeconds,
  closingOnsetName,
  closingTailName,
  modeNeedsOnset,
  closingTypeUsesOnset,
  openingAssetName,
  readClosingControls,
  resolveBrandingBase,
  selectOpeningMaster,
  type BrandingColour,
  type BrandingStyle,
} from './branding'

describe('closing duration by mode', () => {
  // The mode changes the output length, so anything that estimates time or
  // offsets subtitles has to ask rather than assume 4 seconds.
  it('adds only the tail for the two modes that end with the source', () => {
    expect(closingAddedSeconds('hard-cut')).toBe(4)
    expect(closingAddedSeconds('over-picture')).toBe(4)
  })

  it('adds a second more for the freeze, which sustains under the onset', () => {
    expect(closingAddedSeconds('over-freeze')).toBe(5)
    expect(closingAddedSeconds('over-freeze') - closingAddedSeconds('over-picture')).toBe(
      CLOSING_ONSET_SECONDS,
    )
  })

  it('agrees with the measured 1 s onset and 4 s tail', () => {
    expect(CLOSING_ONSET_SECONDS + CLOSING_TAIL_SECONDS).toBe(5)
  })
})

describe('which modes need alpha', () => {
  // Hard cut must stay reachable without alpha decode: it is the fallback if
  // a browser cannot handle transparent video (VH-12).
  it('needs the onset for both overlay modes and not for the hard cut', () => {
    expect(modeNeedsOnset('hard-cut')).toBe(false)
    expect(modeNeedsOnset('over-picture')).toBe(true)
    expect(modeNeedsOnset('over-freeze')).toBe(true)
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
    // purpose, so hard cut survives where alpha decode does not.
    expect(closingOnsetName('fade', 'blue', 1080).endsWith('.webm')).toBe(true)
    expect(closingTailName('blue', 1080).endsWith('.mp4')).toBe(true)
  })

  it('builds urls under the base it is given', () => {
    const base = 'https://static.example/app/branding/'
    expect(brandingAssetUrl(closingTailName('blue', 2160), base)).toBe(
      `${base}closing-tail-blue-2160p.mp4`,
    )
  })

  it('anchors the asset base to BASE_URL, not to a leading slash', () => {
    // The deployed site serves from a subpath, and an absolute URL would 404
    // there. Every build but the flat Xerte package keeps the masters in their
    // own folder.
    expect(BRANDING_ASSET_BASE).toBe(`${import.meta.env.BASE_URL}branding/`)
  })

  it('resolves the asset base against the page, for every hosting shape', () => {
    // Regression. The worker fetched a relocatable build's `./branding` against
    // its own script in `assets/`, so every asset 404'd and the job shipped
    // with no closing. The page is the only correct anchor.
    expect(resolveBrandingBase('http://localhost:5173/', '/branding/')).toBe(
      'http://localhost:5173/branding/',
    )
    expect(
      resolveBrandingBase(
        'https://djdaojones.github.io/UoN-Video-Helper/',
        '/UoN-Video-Helper/branding/',
      ),
    ).toBe('https://djdaojones.github.io/UoN-Video-Helper/branding/')
    expect(
      resolveBrandingBase(
        'https://host.example/USER-FILES/1-user-site/media/index.html',
        './branding/',
      ),
    ).toBe('https://host.example/USER-FILES/1-user-site/media/branding/')
    // The flat Xerte package: the masters sit beside the page itself.
    expect(
      resolveBrandingBase('https://host.example/USER-FILES/1-user-site/media/index.html', './'),
    ).toBe('https://host.example/USER-FILES/1-user-site/media/')
  })
})

describe('defaults', () => {
  it('defaults to Fade Blue, the maintainer choice', () => {
    expect(CLOSING_DEFAULTS.style).toBe('fade')
    expect(CLOSING_DEFAULTS.colour).toBe('blue')
  })

  it('defaults to the mode that needs no alpha, so the default path always works', () => {
    expect(CLOSING_DEFAULTS.mode).toBe('hard-cut')
    expect(modeNeedsOnset(CLOSING_DEFAULTS.mode)).toBe(false)
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

/**
 * VH-31. The size estimate multiplied by the SOURCE duration, so it omitted
 * whatever branding is appended — about 3% on a 130 s lecture, and part of why
 * four real "Smaller file" jobs produced a file larger than the figure the
 * user had decided on.
 */
describe('LONGEST_CLOSING_SECONDS', () => {
  it('is the longest any mode can add, not the commonest', () => {
    for (const mode of ['hard-cut', 'over-picture', 'over-freeze'] as const) {
      expect(closingAddedSeconds(mode)).toBeLessThanOrEqual(LONGEST_CLOSING_SECONDS)
    }
  })

  it('is actually reached, so the bound is tight rather than invented', () => {
    expect(closingAddedSeconds('over-freeze')).toBe(LONGEST_CLOSING_SECONDS)
  })
})

describe('the closing controls map onto the job (VH-90)', () => {
  // Three controls replaced a four-way radio, and the pipeline did not change.
  // Every combination must therefore produce the job its old radio did.

  it.each(CLOSING_COLOURS)('Cut is the clean cut, in %s', (colour) => {
    for (const onset of CLOSING_ONSETS) {
      // Onset is disabled under Cut; whatever it still holds is unread.
      expect(brandingChoiceFor({ type: 'cut', onset, colour })).toEqual({
        opening: false,
        closing: true,
        mode: 'hard-cut',
        style: 'fade',
        colour,
      })
    }
  })

  it.each([
    ['fade', 'existing', 'over-picture'],
    ['fade', 'freeze', 'over-freeze'],
    ['slide', 'existing', 'over-picture'],
    ['slide', 'freeze', 'over-freeze'],
  ] as const)('%s over %s is %s, in both colours', (type, onset, mode) => {
    for (const colour of CLOSING_COLOURS) {
      expect(brandingChoiceFor({ type, onset, colour })).toEqual({
        opening: false,
        closing: true,
        mode,
        style: type,
        colour,
      })
    }
  })

  it('None asks for no closing at all, whatever the other two hold', () => {
    for (const onset of CLOSING_ONSETS) {
      for (const colour of CLOSING_COLOURS) {
        expect(brandingChoiceFor({ type: 'none', onset, colour }).closing).toBe(false)
      }
    }
  })

  it('makes eleven distinct jobs: two for Cut, eight for Fade and Slide, one for None', () => {
    const jobs = new Set(
      CLOSING_TYPES.flatMap((type) =>
        CLOSING_ONSETS.flatMap((onset) =>
          CLOSING_COLOURS.map((colour) => JSON.stringify(brandingChoiceFor({ type, onset, colour }))),
        ),
      ),
    )
    expect(jobs.size).toBe(11)
  })

  it('never asks for an opening', () => {
    for (const type of CLOSING_TYPES) {
      expect(brandingChoiceFor({ ...CLOSING_CONTROL_DEFAULTS, type }).opening).toBe(false)
    }
  })

  it('adds 4 seconds over the picture and 5 over a freeze', () => {
    expect(closingAddedSeconds(brandingChoiceFor({ type: 'fade', onset: 'existing', colour: 'blue' }).mode!)).toBe(4)
    expect(closingAddedSeconds(brandingChoiceFor({ type: 'slide', onset: 'freeze', colour: 'blue' }).mode!)).toBe(5)
    expect(closingAddedSeconds(brandingChoiceFor({ type: 'cut', onset: 'freeze', colour: 'blue' }).mode!)).toBe(4)
  })

  it('only Fade and Slide use the onset', () => {
    expect(CLOSING_TYPES.filter(closingTypeUsesOnset)).toEqual(['fade', 'slide'])
  })
})

describe('the closing controls at rest (VH-90)', () => {
  it('defaults to Cut, blue — the same job as before the controls changed', () => {
    expect(CLOSING_CONTROL_DEFAULTS).toEqual({ type: 'cut', onset: 'existing', colour: 'blue' })
    expect(brandingChoiceFor(CLOSING_CONTROL_DEFAULTS)).toEqual({
      opening: false,
      closing: true,
      mode: CLOSING_DEFAULTS.mode,
      style: CLOSING_DEFAULTS.style,
      colour: CLOSING_DEFAULTS.colour,
    })
  })

  it('reads recognised values as they are', () => {
    expect(readClosingControls({ type: 'slide', onset: 'freeze', colour: 'white' })).toEqual({
      type: 'slide',
      onset: 'freeze',
      colour: 'white',
    })
  })

  it.each([
    [{ type: 'wipe', onset: 'existing', colour: 'blue' }],
    [{ type: 'cut', onset: 'sideways', colour: 'blue' }],
    [{ type: 'cut', onset: 'existing', colour: 'red' }],
    [{}],
    [{ type: null, onset: undefined, colour: '' }],
  ])('falls back to the default for a value it does not know: %j', (raw) => {
    // The DOM is editable. An unrecognised value must not reach the pipeline
    // as a string that matches no branch.
    const read = readClosingControls(raw)
    expect(CLOSING_TYPES).toContain(read.type)
    expect(CLOSING_ONSETS).toContain(read.onset)
    expect(CLOSING_COLOURS).toContain(read.colour)
    expect(readClosingControls({})).toEqual(CLOSING_CONTROL_DEFAULTS)
  })

  it('falls back field by field, keeping the ones it does know', () => {
    expect(readClosingControls({ type: 'fade', onset: 'nonsense', colour: 'white' })).toEqual({
      type: 'fade',
      onset: 'existing',
      colour: 'white',
    })
  })
})
