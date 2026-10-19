/**
 * Step 3, the staff title card (VH-127): the limit held in columns, the date
 * filled and refilled, the box on each side of the switch, the empty refusal
 * at Create, and a request built only when there is a card to draw.
 */

import { describe, expect, it } from 'vitest'

import { t } from '../i18n'
import { STAFF_CARD, columnsOf, type StaffCardText } from '../media/title-card'
import {
  cardDate,
  cardStop,
  cutToColumns,
  dateOnLanguageChange,
  dateOnTick,
  holdToColumns,
  isCardEmpty,
  refusalText,
  titleCardBoxState,
  titleCardRequest,
  type TitleCardAssets,
} from './title-card-step'

const EMPTY: StaffCardText = { title: '', department: '', authors: '', date: '' }
const TYPED: StaffCardText = {
  title: '  Lecture 3: entropy  ',
  department: 'School of Physics',
  authors: 'A. Lecturer',
  date: '19 October 2026',
}
const ASSETS: TitleCardAssets = {
  headingFontUrl: 'https://example.test/assets/lora-bold.woff2',
  cjkFontStack: '"PingFang SC", sans-serif',
  colours: { ground: '#10263b', ink: '#ffffff' },
}
const NOON = new Date(2026, 9, 19, 12)

describe('the limit, held in columns (VH-127)', () => {
  it('happy path: text within the limit is left as typed', () => {
    expect(holdToColumns('Lecture 3', 9, STAFF_CARD.title.columns)).toEqual({ value: 'Lecture 3', caret: 9, cut: false })
  })

  it('boundary: a Latin field stops at exactly its limit, and one more is cut', () => {
    const limit = STAFF_CARD.date.columns
    expect(holdToColumns('a'.repeat(limit), limit, limit).cut).toBe(false)
    const over = holdToColumns('a'.repeat(limit + 1), limit + 1, limit)
    expect(over).toEqual({ value: 'a'.repeat(limit), caret: limit, cut: true })
  })

  it('boundary: a Chinese character counts two columns, so half as many fit, never half of one', () => {
    const limit = STAFF_CARD.title.columns
    const held = holdToColumns('标'.repeat(limit), limit, limit)
    expect(held.value).toBe('标'.repeat(limit / 2))
    expect(columnsOf(held.value)).toBe(limit)
    // One column left: a wide character does not fit in it.
    expect(cutToColumns('a标', 2)).toBe('a')
  })

  it('a paste in the middle keeps the text after the caret and cuts the paste', () => {
    // "ab" typed, then 4 x's pasted between them with a limit of 4.
    const held = holdToColumns('axxxxb', 5, 4)
    expect(held).toEqual({ value: 'axxb', caret: 3, cut: true })
  })

  it('never splits a letter from its accent or an emoji from its joiners', () => {
    const accented = 'é'
    expect(cutToColumns(`a${accented}`, 2)).toBe('a')
    expect(cutToColumns('👩‍💻x', 2)).toBe('')
  })

  it('empty: an empty field is no cut', () => {
    expect(holdToColumns('', 0, STAFF_CARD.title.columns)).toEqual({ value: '', caret: 0, cut: false })
  })
})

describe('the date, filled and refilled', () => {
  it('happy path: today, long, in the video language', () => {
    expect(cardDate(NOON, 'en-GB')).toBe('19 October 2026')
    expect(cardDate(NOON, 'zh-Hans')).toBe('2026年10月19日')
    expect(cardDate(NOON, 'ms-MY')).toMatch(/^19 Oktober 2026$/)
  })

  it('fits the date field in every language offered', () => {
    for (const language of ['en-GB', 'zh-Hans', 'ms-MY'] as const) {
      expect(columnsOf(cardDate(new Date(2026, 8, 30), language))).toBeLessThanOrEqual(STAFF_CARD.date.columns)
    }
  })

  it('ticking fills an empty field, or one still as filled, and keeps a typed one', () => {
    const today = cardDate(NOON, 'en-GB')
    expect(dateOnTick('', null, today)).toBe(today)
    expect(dateOnTick('18 October 2026', '18 October 2026', today)).toBe(today)
    expect(dateOnTick('Autumn term', '18 October 2026', today)).toBe('Autumn term')
  })

  it('a change of video language refills only a date still as filled', () => {
    const filled = cardDate(NOON, 'en-GB')
    const chinese = cardDate(NOON, 'zh-Hans')
    expect(dateOnLanguageChange(filled, filled, chinese)).toBe(chinese)
    expect(dateOnLanguageChange('19 Oct', filled, chinese)).toBe('19 Oct')
  })

  it('empty: a cleared date stays cleared through a language change, and nothing is filled before the box is ticked', () => {
    expect(dateOnLanguageChange('', '19 October 2026', '2026年10月19日')).toBe('')
    expect(dateOnLanguageChange('', null, '2026年10月19日')).toBe('')
  })
})

describe('the box on each side of the switch (gating)', () => {
  it('a staff video shows what was chosen, unlocked', () => {
    expect(titleCardBoxState('staff', true)).toEqual({ checked: true, disabled: false, reason: null })
    expect(titleCardBoxState('staff', false)).toEqual({ checked: false, disabled: false, reason: null })
  })

  it('a student submission locks it off and says why, whatever the staff card held', () => {
    for (const held of [true, false]) {
      expect(titleCardBoxState('submission', held)).toEqual({
        checked: false,
        disabled: true,
        reason: t().titleCard.forSubmission,
      })
    }
  })
})

describe('the refusal at Create', () => {
  it('error: ticked with every field empty, or only spaces, is refused beside the box', () => {
    expect(cardStop(true, EMPTY, null)).toEqual({ at: 'empty' })
    expect(cardStop(true, { ...EMPTY, title: '   ' }, null)).toEqual({ at: 'empty' })
    expect(isCardEmpty({ ...EMPTY, date: ' \t' })).toBe(true)
  })

  it('gating: unticked, nothing is refused, however empty', () => {
    expect(cardStop(false, EMPTY, null)).toBeNull()
  })

  it('happy path: one field with text goes', () => {
    expect(cardStop(true, { ...EMPTY, authors: 'A. Lecturer' }, null)).toBeNull()
  })

  it('error: a refused fit is refused at its field, with its own sentence', () => {
    expect(cardStop(true, TYPED, { at: 'field', field: 'title' })).toEqual({ at: 'field', field: 'title', refusal: 'field' })
    expect(cardStop(true, TYPED, { at: 'card', field: 'authors', overPx: 12 })).toEqual({
      at: 'field',
      field: 'authors',
      refusal: 'card',
    })
    expect(refusalText('field')).not.toBe(refusalText('card'))
  })
})

describe('the request (VH-127)', () => {
  it('happy path: ticked with text, the four fields go as typed, with the font, the stack and the colours', () => {
    expect(titleCardRequest(true, TYPED, ASSETS)).toEqual({ text: TYPED, ...ASSETS })
  })

  it('gating: unticked, no card is sent, whatever was typed', () => {
    expect(titleCardRequest(false, TYPED, ASSETS)).toBeNull()
  })

  it('empty: ticked with nothing typed, no card is sent', () => {
    expect(titleCardRequest(true, EMPTY, ASSETS)).toBeNull()
  })

  it('carries only the four fields: nothing else typed reaches the worker', () => {
    const extra = { ...TYPED, secret: 'not a field' } as StaffCardText
    expect(Object.keys(titleCardRequest(true, extra, ASSETS)!.text)).toEqual(['title', 'department', 'authors', 'date'])
  })

  it('sends a missing heading font as null, so the worker falls back to Georgia', () => {
    expect(titleCardRequest(true, TYPED, { ...ASSETS, headingFontUrl: null })!.headingFontUrl).toBeNull()
  })
})
