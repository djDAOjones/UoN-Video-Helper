/**
 * VH-111: what is on screen beside a live region is said by it too.
 */

import { afterEach, describe, expect, it } from 'vitest'

import { detectProductionWarnings, type AudioWarning } from '../audio/warnings'
import { setLanguage, t } from '../i18n'
import { lossesSpoken, spoken, warningsSpoken } from './announce'
import { warningText } from './warning-text'

describe('lossesSpoken', () => {
  it('says nothing when nothing is lost', () => {
    expect(lossesSpoken([])).toBe('')
  })

  it('counts the losses and carries each consequence, the caption one included', () => {
    const said = lossesSpoken([
      { title: 'Found 1 caption track', detail: 'The new file will have no caption track.' },
      { title: 'This file has 1 more sound track', detail: 'The others will not be carried over.' },
    ])
    expect(said).toMatch(/^Two things to know about what goes into the new file\./)
    expect(said).toContain('Found 1 caption track. The new file will have no caption track.')
    expect(said).toContain('1 more sound track')
    expect(lossesSpoken([{ title: 'A', detail: 'B.' }])).toMatch(/^One thing to know/)
  })
})

describe('warningsSpoken', () => {
  const warning = { code: 'no-audio' } as AudioWarning
  afterEach(() => setLanguage('en-GB'))

  it('speaks heavy limiting before the metadata warning, as the card shows them (VH-193), then its detail whole (VH-208)', () => {
    const both = detectProductionWarnings({ limiterBiteLu: 8.1, metadataCarried: false })
    expect(warningsSpoken('Worth knowing about the finished video', both)).toBe(
      'Worth knowing about the finished video: The loudest moments were held down hard; The file’s title, author, and date could not be copied across. ' +
        t().warnings.heavyLimiting.detail,
    )
  })

  it('says heavy limiting’s advice to play the video before saving it, chosen by its code; other warnings keep their title alone (V-52)', () => {
    const heavyOnly = detectProductionWarnings({ limiterBiteLu: 8.1, metadataCarried: true })
    const said = warningsSpoken('Worth knowing about the finished video', heavyOnly)
    expect(said).toContain('so play the new video before you save it.')
    expect(said.indexOf(t().warnings.heavyLimiting.detail)).toBeGreaterThan(
      said.indexOf(t().warnings.heavyLimiting.heading),
    )
    const metadataOnly = detectProductionWarnings({ limiterBiteLu: null, metadataCarried: false })
    expect(warningsSpoken('Worth knowing about the finished video', metadataOnly)).toBe(
      `Worth knowing about the finished video: ${t().warnings.metadataLost.heading}.`,
    )
  })

  it('joins the detail with the language’s own sentence gap', () => {
    setLanguage('zh-Hans')
    const heavyOnly = detectProductionWarnings({ limiterBiteLu: 8.1, metadataCarried: true })
    const { warnings } = t()
    expect(warningsSpoken(warnings.finishedHeading, heavyOnly)).toBe(
      warnings.spoken({
        heading: warnings.finishedHeading,
        titles: warnings.heavyLimiting.heading,
      }) + warnings.heavyLimiting.detail,
    )
  })

  it('says nothing when there are no warnings', () => {
    expect(warningsSpoken('Worth knowing about the sound', [])).toBe('')
  })

  it('names each warning under its panel heading', () => {
    const said = warningsSpoken('Worth knowing about the sound', [warning])
    expect(said).toBe(`Worth knowing about the sound: ${warningText(warning).heading}.`)
  })
})

describe('spoken', () => {
  it('joins only the parts that say something', () => {
    expect(spoken('Ready.', '', null, 'Saved.')).toBe('Ready. Saved.')
  })
})
