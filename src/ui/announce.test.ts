/**
 * VH-111: what is on screen beside a live region is said by it too.
 */

import { describe, expect, it } from 'vitest'

import type { AudioWarning } from '../audio/warnings'
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
