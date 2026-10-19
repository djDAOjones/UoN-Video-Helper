/**
 * Step 3, the title card: the staff card (VH-127), the limit held in columns,
 * the date filled and refilled, the box on each side of the switch, the empty
 * refusal at Create, and a request built only when there is a card to draw;
 * and Submission (VH-128), its ID numbers checked, each field's problem, and
 * its words resolved in the video's language.
 */

import { describe, expect, it } from 'vitest'

import { STUDENT_IDS_MAX } from '../config/cards'
import { t, textIn } from '../i18n'
import { STAFF_CARD, columnsOf, type StaffCardText } from '../media/title-card'
import {
  cardDate,
  cardStop,
  checkStudentIds,
  cutToColumns,
  dateOnLanguageChange,
  dateOnTick,
  holdToColumns,
  isCardEmpty,
  firstSubmissionProblem,
  refusalText,
  studentIdTokens,
  submissionCardRequest,
  submissionCardText,
  submissionProblems,
  submissionProblemText,
  titleCardBoxState,
  titleCardRequest,
  type SubmissionTyped,
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

  it('a student submission ticks and locks it and says why, whatever the staff card held (VH-128)', () => {
    for (const held of [true, false]) {
      expect(titleCardBoxState('submission', held)).toEqual({
        checked: true,
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
    expect(titleCardRequest(true, TYPED, ASSETS)).toEqual({ layout: 'staff', text: TYPED, ...ASSETS })
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

/* ---- Submission (VH-128) ---------------------------------------------- */

const ID = '20412345'
const TYPED_SUBMISSION: SubmissionTyped = {
  assignment: 'Assignment 2',
  module: 'LIBA2002 Migration and Identity',
  convenor: 'Dr Samuel Okonkwo',
  ids: `${ID} 20412346`,
}

describe('the ID numbers, split and checked (VH-128)', () => {
  it('happy path: spaces, commas, semicolons and new lines all separate', () => {
    expect(studentIdTokens(' 20412345, 20412346;20412347\n20412348\t ')).toEqual([
      '20412345',
      '20412346',
      '20412347',
      '20412348',
    ])
    expect(checkStudentIds(`${ID}, 20412346`)).toEqual({ ok: true, ids: [ID, '20412346'] })
  })

  it('folds full-width digits and punctuation, as a Chinese input method types them', () => {
    expect(studentIdTokens('２０４１２３４５，２０４１２３４６、20412347')).toEqual([ID, '20412346', '20412347'])
  })

  it('empty: nothing typed, or only separators, is no ID at all', () => {
    expect(checkStudentIds('')).toEqual({ ok: false, problem: 'none' })
    expect(checkStudentIds(' ,; \n')).toEqual({ ok: false, problem: 'none' })
  })

  it('error: a number of the wrong length or with a letter is named', () => {
    expect(checkStudentIds(`${ID} 2041234`)).toEqual({ ok: false, problem: 'not-an-id', id: '2041234' })
    expect(checkStudentIds('204123456')).toEqual({ ok: false, problem: 'not-an-id', id: '204123456' })
    expect(checkStudentIds('2041234a')).toEqual({ ok: false, problem: 'not-an-id', id: '2041234a' })
  })

  it('error: a name is not an ID, so none is ever drawn', () => {
    expect(checkStudentIds('Jane Smith')).toEqual({ ok: false, problem: 'not-an-id', id: 'Jane' })
  })

  it('error: a number typed twice is named', () => {
    expect(checkStudentIds(`${ID} 20412346 ${ID}`)).toEqual({ ok: false, problem: 'twice', id: ID })
  })

  it('boundary: eight go, a ninth is too many', () => {
    const ids = (n: number): string => Array.from({ length: n }, (_, i) => String(20412345 + i)).join(' ')
    expect(checkStudentIds(ids(STUDENT_IDS_MAX)).ok).toBe(true)
    expect(checkStudentIds(ids(STUDENT_IDS_MAX + 1))).toEqual({ ok: false, problem: 'too-many', count: 9 })
  })

  it('names a wrong number before counting, so the first thing said is the first to put right', () => {
    const nine = `${Array.from({ length: 9 }, (_, i) => String(20412345 + i)).join(' ')} 123`
    expect(checkStudentIds(nine)).toMatchObject({ problem: 'not-an-id', id: '123' })
  })
})

describe("Submission's problems at Create (VH-128)", () => {
  const BLANK: SubmissionTyped = { assignment: '', module: '', convenor: '', ids: '' }

  it('happy path: four fields put right have no problem, and the card can go', () => {
    const problems = submissionProblems(TYPED_SUBMISSION, null)
    expect(problems).toEqual({})
    expect(firstSubmissionProblem(problems)).toBeNull()
  })

  it('error: every field left empty, or only spaces, is missing, the first in page order to put right', () => {
    const problems = submissionProblems({ ...BLANK, convenor: '   ' }, null)
    expect(problems).toEqual({
      assignment: { kind: 'missing' },
      module: { kind: 'missing' },
      convenor: { kind: 'missing' },
      ids: { kind: 'missing' },
    })
    expect(firstSubmissionProblem(problems)).toBe('assignment')
    expect(submissionProblemText('module', problems.module!)).toBe(t().titleCard.submission.missing.module)
  })

  it('error: a wrong ID number is said beside the box, quoting it', () => {
    const problems = submissionProblems({ ...TYPED_SUBMISSION, ids: '2041234' }, null)
    expect(firstSubmissionProblem(problems)).toBe('ids')
    expect(submissionProblemText('ids', problems.ids!)).toBe(t().titleCard.submission.idNotAnId({ id: '2041234' }))
  })

  it('says too many with the count and the most', () => {
    const text = submissionProblemText('ids', { kind: 'ids', check: { ok: false, problem: 'too-many', count: 9 } })
    expect(text).toBe(t().titleCard.submission.idsTooMany({ count: 9, max: STUDENT_IDS_MAX }))
    expect(text).toContain('9')
  })

  it("a refused fit is said at its field, and the app's own line at the assignment", () => {
    expect(submissionProblems(TYPED_SUBMISSION, { at: 'field', field: 'convenor' })).toEqual({
      convenor: { kind: 'refused', refusal: 'field' },
    })
    expect(submissionProblems(TYPED_SUBMISSION, { at: 'card', field: 'details', overPx: 4 })).toEqual({
      assignment: { kind: 'refused', refusal: 'card' },
    })
  })

  it("a field's own problem comes before a refusal of the fit", () => {
    expect(submissionProblems({ ...TYPED_SUBMISSION, ids: 'x' }, { at: 'field', field: 'ids' })).toEqual({
      ids: { kind: 'ids', check: { ok: false, problem: 'not-an-id', id: 'x' } },
    })
  })
})

describe("Submission's words, in the video's language (VH-128)", () => {
  it("happy path: the labels, the running time and the date, from the video language's table", () => {
    const text = submissionCardText(TYPED_SUBMISSION, [ID, '20412346'], 754.2, NOON, 'en-GB')
    const card = textIn('en-GB').titleCard.card
    expect(text).toEqual({
      assignment: 'Assignment 2',
      module: 'LIBA2002 Migration and Identity',
      convenor: 'Dr Samuel Okonkwo',
      ids: [ID, '20412346'],
      runningTime: '12:34',
      made: card.madeValue({ date: '19 October 2026' }),
      labels: {
        module: card.module,
        convenor: card.convenor,
        ids: card.ids({ count: 2 }),
        running: card.running,
        made: card.made,
      },
    })
    expect(text.made).toContain('19 October 2026')
  })

  it('names one ID number in the singular', () => {
    expect(submissionCardText(TYPED_SUBMISSION, [ID], 60, NOON, 'en-GB').labels.ids).toBe(
      textIn('en-GB').titleCard.card.ids({ count: 1 }),
    )
    expect(textIn('en-GB').titleCard.card.ids({ count: 1 })).not.toBe(textIn('en-GB').titleCard.card.ids({ count: 2 }))
  })

  it("follows the video's language, whatever the page's, and leaves typed text as typed", () => {
    for (const language of ['zh-Hans', 'ms-MY'] as const) {
      const text = submissionCardText(TYPED_SUBMISSION, [ID], 60, NOON, language)
      expect(text.labels.module).toBe(textIn(language).titleCard.card.module)
      expect(text.made).toContain(cardDate(NOON, language))
      expect(text.module).toBe(TYPED_SUBMISSION.module)
    }
    expect(textIn('zh-Hans').titleCard.card.module).not.toBe(textIn('en-GB').titleCard.card.module)
  })

  it('the request goes as Submission, with the font, the stack and the colours', () => {
    const text = submissionCardText(TYPED_SUBMISSION, [ID], 60, NOON, 'en-GB')
    expect(submissionCardRequest(text, ASSETS)).toEqual({ layout: 'submission', text, ...ASSETS })
  })
})
