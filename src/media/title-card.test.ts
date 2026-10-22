/**
 * The title card's fit and draw (VH-127), over a fake measure: a wide
 * character draws one size wide, a space a quarter, anything else a half, so
 * every break below is worked out by hand. The real fonts are measured in
 * `spike-cards.html`, which fits through the same module.
 */

import { describe, expect, it } from 'vitest'

import { LANGUAGE_TABLES } from '../i18n'
import { compile } from '../i18n/compile'
import type { enGB } from '../i18n/en-GB'

import { CARD_BLOCK_GAP_EM, CARD_FIELD_GAP_EM, CARD_ROLES, CARD_SIZE_STEP_PX, CARD_TYPE_FLOOR_PX } from '../config/cards'
import {
  columnsOf,
  drawTitleCard,
  fit,
  safeArea,
  STAFF_CARD_FIELDS,
  staffCardBlocks,
  submissionCardBlocks,
  wrap,
  type CardBlock,
  type CardContext,
  type CardFit,
  type CardFonts,
  type FrameSize,
  type StaffCardText,
  type SubmissionCardText,
} from './title-card'

const WIDE = /[\u2E80-\u9FFF\u3000-\u303F\uF900-\uFAFF\uFF00-\uFFEF]/u

const sizeOf = (font: string): number => Number(/([\d.]+)px/u.exec(font)![1])

function fakeMeasure(font: string, text: string): number {
  const px = sizeOf(font)
  let width = 0
  for (const character of text) width += WIDE.test(character) ? px : /\s/u.test(character) ? px / 4 : px / 2
  return width
}

const FONTS: CardFonts = { families: { heading: 'Heading', body: 'Body' }, measure: fakeMeasure }

const HD: FrameSize = { widthPx: 1920, heightPx: 1080 }
const UHD: FrameSize = { widthPx: 3840, heightPx: 2160 }
const PORTRAIT: FrameSize = { widthPx: 1080, heightPx: 1920 }
const FRAMES: readonly FrameSize[] = [HD, { widthPx: 1728, heightPx: 1080 }, { widthPx: 1440, heightPx: 1080 }, PORTRAIT]

const NONE: StaffCardText = { title: '', department: '', authors: '', date: '' }
const card = (text: Partial<StaffCardText>): CardBlock[] => staffCardBlocks({ ...NONE, ...text })
/** `n` four-letter words: each 2 sizes wide, a quarter-size space between. */
const words = (n: number): string => Array.from({ length: n }, () => 'abcd').join(' ')

const laidOf = (result: CardFit, name: string) => result.laid.find((item) => item.block.name === name)!
const lineTexts = (lines: readonly { pieces: readonly { text: string }[] }[]): string[] =>
  lines.map((line) => line.pieces.map((piece) => piece.text).join(''))

/** Title, department, authors and date that overfill a 16:9 card at full size; worked out in the tests. */
const TALL = { title: words(21), department: words(20), authors: words(20), date: words(2) }

describe('fit, the staff card', () => {
  it('draws a short title at its full size on one line', () => {
    const result = fit(card({ title: 'Welcome' }), HD, FONTS)
    expect(result.refused).toBeNull()
    expect(result.laid).toHaveLength(1)
    expect(result.laid[0]!.sizePx).toBe(CARD_ROLES.staffTitle.maxPx)
    expect(result.laid[0]!.lines).toHaveLength(1)
  })

  it('shrinks a field rather than give it another line, to the largest size that wraps into its lines', () => {
    // 25 words take 4 lines at 104 px; 9 a line, so 3 lines, first fit at 84.
    const result = fit(card({ title: words(25) }), HD, FONTS)
    const title = laidOf(result, 'title')
    expect(result.refused).toBeNull()
    expect(title.lines).toHaveLength(CARD_ROLES.staffTitle.maxLines)
    expect(title.sizePx).toBe(84)
    const larger = wrap(CARD_ROLES.staffTitle, title.block.runs, title.sizePx + CARD_SIZE_STEP_PX, result.safe.widthPx, FONTS)
    expect(larger!.length).toBeGreaterThan(CARD_ROLES.staffTitle.maxLines)
  })

  it('gives way at the largest field first when the card is too tall', () => {
    // At full size: title 3 lines at 104, department and authors 2 at 64, date 1: 938 px of 880.
    const result = fit(card(TALL), HD, FONTS)
    expect(result.refused).toBeNull()
    expect(laidOf(result, 'title').sizePx).toBe(86)
    for (const name of ['department', 'authors', 'date']) expect(laidOf(result, name).sizePx).toBe(64)
    expect(result.heightPx).toBeLessThanOrEqual(result.safe.heightPx)
  })
})

describe('the staff card, empty', () => {
  it('gives no blocks when every field is empty or only spaces, and the fit refuses that as empty', () => {
    expect(card({ title: '  ', date: '\t' })).toEqual([])
    expect(fit(card({}), HD, FONTS).refused).toEqual({ at: 'empty' })
  })

  it('gives an empty field no room: the first typed field has no gap, the title its gap above whatever follows', () => {
    expect(card({ title: 'T', date: 'D' }).map((block) => [block.name, block.gapEm])).toEqual([
      ['title', 0],
      ['date', CARD_BLOCK_GAP_EM],
    ])
    expect(card({ department: 'D', authors: 'A' }).map((block) => [block.name, block.gapEm])).toEqual([
      ['department', 0],
      ['authors', CARD_FIELD_GAP_EM],
    ])
  })

  it('keeps what was typed but for the ends, with no labels', () => {
    const [title] = card({ title: '  Two  spaces  ' })
    expect(title!.runs).toEqual([{ text: 'Two  spaces', weight: 'bold' }])
  })
})

describe('fit, at the boundary', () => {
  it('fits a date that fills its one line only at the floor, and refuses one word more at the date', () => {
    // 13 words are 29 sizes wide: 1624 px at 56, over 1680 at 58.
    const thirteen = fit(card({ date: words(13) }), HD, FONTS)
    expect(thirteen.refused).toBeNull()
    expect(laidOf(thirteen, 'date').sizePx).toBe(CARD_TYPE_FLOOR_PX)
    expect(fit(card({ date: words(14) }), HD, FONTS).refused).toEqual({ at: 'field', field: 'date' })
  })

  it('fits every field at its most lines at the floor in any landscape frame and a 9:16 one', () => {
    const blocks = card({ title: 'a', department: 'a', authors: 'a', date: 'a' })
    const heightAtFloor = (portrait: boolean): number =>
      blocks.reduce((sum, block, i) => {
        const lines = portrait ? block.role.portraitMaxLines : block.role.maxLines
        const gap = i === 0 ? 0 : block.gapEm * CARD_TYPE_FLOOR_PX
        return sum + lines * block.role.minPx * block.role.lineHeight + gap
      }, 0)
    // Every landscape frame is 1080 lines tall at its own scale, so has this safe height.
    expect(heightAtFloor(false)).toBeLessThanOrEqual(safeArea(HD).heightPx)
    expect(heightAtFloor(true)).toBeLessThanOrEqual(safeArea(PORTRAIT).heightPx)
  })

  it('never lays a field under the floor, whatever the text and the frame', () => {
    for (const frame of [...FRAMES, UHD]) {
      for (const n of [1, 4, 9, 16, 25, 40, 80]) {
        const texts = [...STAFF_CARD_FIELDS.map((name) => ({ [name]: words(n) })), { ...TALL, title: words(n) }]
        for (const text of texts) {
          for (const item of fit(card(text), frame, FONTS).laid) {
            expect(item.sizePx).toBeGreaterThanOrEqual(CARD_TYPE_FLOOR_PX)
          }
        }
      }
    }
  })

  it('counts a wide character as two columns against the limits', () => {
    expect(columnsOf('ab中文')).toBe(6)
    expect(columnsOf('')).toBe(0)
  })
})

describe('fit, refusing', () => {
  it('refuses at its field a word too wide for the line at the floor, and lays nothing from there', () => {
    // 70 letters at 56 px are 1960 px; the line is 1680.
    const result = fit(card({ title: 'Title', department: 'x'.repeat(70), authors: 'A' }), HD, FONTS)
    expect(result.refused).toEqual({ at: 'field', field: 'department' })
    expect(result.laid.map((item) => item.block.name)).toEqual(['title'])
  })

  it('names the field with the most lines when the fields overfill the card at the floor', () => {
    // A 3:4 portrait frame: 945 px lines, 7 words a line at the floor, and
    // every field at its most lines is 1260 px of 1174.
    const frame = { widthPx: 1080, heightPx: 1440 }
    const result = fit(card({ title: words(35), department: words(28), authors: words(28), date: words(14) }), frame, FONTS)
    expect(result.refused).toMatchObject({ at: 'card', field: 'title' })
    for (const item of result.laid) expect(item.sizePx).toBe(item.block.role.minPx)
  })

  it('never draws a refused card', () => {
    const { context, calls } = recorder()
    const refused = fit(card({ date: words(14) }), HD, FONTS)
    expect(() => drawTitleCard(context, refused, FONTS.families, { ground: '#10263b', ink: '#ffffff' })).toThrow()
    expect(calls).toEqual([])
  })
})

describe('Chinese line breaking', () => {
  const role = CARD_ROLES.staffDate
  /** Five wide characters a line at 56 px. */
  const breaks = (text: string) => lineTexts(wrap(role, [{ text, weight: 'normal' }], 56, 5 * 56, FONTS)!)

  it('keeps closing punctuation off the start of a line, taking the character before it along', () => {
    expect(breaks('一二三四五，六七')).toEqual(['一二三四', '五，六七'])
    expect(breaks('一二三四五》。六')).toEqual(['一二三四', '五》。六'])
  })

  it('keeps opening punctuation off the end of a line', () => {
    expect(breaks('一二三四《五六》')).toEqual(['一二三四', '《五六》'])
  })

  it('still breaks between characters where no punctuation is near', () => {
    expect(breaks('一二三四五六七')).toEqual(['一二三四五', '六七'])
  })
})

describe('fit, at 4K', () => {
  it('breaks a 4K frame exactly as a 1080 one, at twice the pixels', () => {
    for (const [small, large] of [
      [HD, UHD],
      [PORTRAIT, { widthPx: 2160, heightPx: 3840 }],
    ] as const) {
      const one = fit(card(TALL), small, FONTS)
      const two = fit(card(TALL), large, FONTS)
      expect(two.refused).toEqual(one.refused)
      expect(two.laid.map((item) => [item.sizePx, lineTexts(item.lines)])).toEqual(
        one.laid.map((item) => [item.sizePx, lineTexts(item.lines)]),
      )
      expect(two.heightPx).toBeCloseTo(one.heightPx * 2, 6)
    }
  })
})

/* ---- Submission (VH-128) ---------------------------------------------- */

const SUBMISSION: SubmissionCardText = {
  assignment: '  Assignment 2: Reflective Essay  ',
  module: 'LIBA2002 Migration and Identity',
  convenor: 'Dr Samuel Okonkwo',
  ids: ['20412345', '20412346'],
  runningTime: '12:34',
  made: '19 October 2026 — not the submission date',
  labels: { module: 'Module', convenor: 'Convenor or tutor', ids: 'Student ID numbers', running: 'Running time', made: 'Card made' },
}
const runTexts = (block: CardBlock): string[] => block.runs.map((run) => run.text)

describe('Submission, its blocks (VH-128)', () => {
  it('happy path: the assignment heads the card unlabelled, then three labelled fields and the line the app fills in', () => {
    const blocks = submissionCardBlocks(SUBMISSION)
    expect(blocks.map((block) => block.name)).toEqual(['assignment', 'module', 'convenor', 'ids', 'details'])
    expect(blocks[0]).toMatchObject({ role: CARD_ROLES.submissionHeading, gapEm: 0 })
    expect(runTexts(blocks[0]!)).toEqual(['Assignment 2: Reflective Essay'])
    expect(blocks.slice(1).every((block) => block.role === CARD_ROLES.submissionField)).toBe(true)
    expect(blocks.slice(1).map((block) => block.gapEm)).toEqual([
      CARD_BLOCK_GAP_EM,
      CARD_FIELD_GAP_EM,
      CARD_FIELD_GAP_EM,
      CARD_FIELD_GAP_EM,
    ])
  })

  it('runs each label in before its value, the label regular and the value bold', () => {
    const module = submissionCardBlocks(SUBMISSION)[1]!
    expect(module.runs.map((run) => run.weight)).toEqual(['normal', 'normal', 'bold'])
    expect(module.runs[0]!.text).toBe('Module')
    expect(module.runs[2]!.text).toBe('LIBA2002 Migration and Identity')
  })

  it('sets the ID numbers an em space apart, so a line breaks only between them', () => {
    const ids = submissionCardBlocks(SUBMISSION)[3]!
    expect(ids.runs[2]!.text).toBe('20412345\u200320412346')
  })

  it('shares the last line between the running time and the date the card was made', () => {
    const details = submissionCardBlocks(SUBMISSION).at(-1)!
    expect(runTexts(details).filter((text) => !/^[\uE000\uE001]$/u.test(text))).toEqual([
      'Running time',
      '12:34',
      'Card made',
      '19 October 2026',
      ' ',
      '— not the submission date',
    ])
  })

  it('edge: a typed field left empty takes no room, so no label is drawn without its value', () => {
    const blocks = submissionCardBlocks({ ...SUBMISSION, assignment: ' ', convenor: '', ids: [] })
    expect(blocks.map((block) => block.name)).toEqual(['module', 'details'])
    expect(blocks[0]!.gapEm).toBe(CARD_FIELD_GAP_EM)
  })

  it('fits eight IDs and long fields in every shape, and breaks at 4K as at 1080', () => {
    const eight = {
      ...SUBMISSION,
      assignment: words(16),
      module: words(12),
      ids: Array.from({ length: 8 }, (_, i) => String(20412345 + i)),
    }
    for (const frame of FRAMES) expect(fit(submissionCardBlocks(eight), frame, FONTS).refused).toBeNull()
    const one = fit(submissionCardBlocks(eight), HD, FONTS)
    const two = fit(submissionCardBlocks(eight), UHD, FONTS)
    expect(two.laid.map((item) => [item.sizePx, lineTexts(item.lines)])).toEqual(
      one.laid.map((item) => [item.sizePx, lineTexts(item.lines)]),
    )
  })

  it('error: a field too long for its lines at the floor is refused at that field', () => {
    const result = fit(submissionCardBlocks({ ...SUBMISSION, convenor: words(80) }), HD, FONTS)
    expect(result.refused).toEqual({ at: 'field', field: 'convenor' })
  })
})

describe('regression', () => {
  it('stops at the floor when a range is not a whole number of steps (the spike could reach 55)', () => {
    // 59 letters fit 1680 px at 56 but not at 57; from 61 the steps are 59, 57, then the floor.
    const block: CardBlock = {
      name: 'odd',
      role: { ...CARD_ROLES.staffDate, maxPx: 61 },
      runs: [{ text: 'x'.repeat(59), weight: 'normal' }],
      gapEm: 0,
    }
    const result = fit([block], HD, FONTS)
    expect(result.refused).toBeNull()
    expect(result.laid[0]!.sizePx).toBe(CARD_TYPE_FLOOR_PX)
  })
})

/* ---- Drawing ---------------------------------------------------------- */

interface Call {
  readonly op: 'rect' | 'text'
  readonly style: string
  readonly text?: string
  readonly font?: string
  readonly xPx: number
  readonly yPx: number
  readonly widthPx: number
  readonly heightPx?: number
}

/** A 2D context that records what is drawn, measuring with the fake. */
function recorder(): { context: CardContext; calls: Call[] } {
  const calls: Call[] = []
  const context = {
    fillStyle: '' as CardContext['fillStyle'],
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    fillRect(xPx: number, yPx: number, widthPx: number, heightPx: number) {
      calls.push({ op: 'rect', style: this.fillStyle as string, xPx, yPx, widthPx, heightPx })
    },
    fillText(text: string, xPx: number, yPx: number) {
      const widthPx = fakeMeasure(this.font, text)
      calls.push({ op: 'text', style: this.fillStyle as string, text, font: this.font, xPx, yPx, widthPx })
    },
    measureText(text: string) {
      const px = sizeOf(this.font)
      return {
        width: fakeMeasure(this.font, text),
        fontBoundingBoxAscent: px * 0.8,
        fontBoundingBoxDescent: px * 0.2,
      } as TextMetrics
    },
  }
  return { context, calls }
}

describe('drawTitleCard', () => {
  it('fills the whole frame with the ground, then draws every line in the ink inside the safe area', () => {
    const { context, calls } = recorder()
    const result = fit(card(TALL), HD, FONTS)
    drawTitleCard(context, result, FONTS.families, { ground: 'GROUND', ink: 'INK' })
    expect(calls[0]).toEqual({ op: 'rect', style: 'GROUND', xPx: 0, yPx: 0, widthPx: 1920, heightPx: 1080 })
    const texts = calls.slice(1)
    expect(texts.every((call) => call.op === 'text' && call.style === 'INK')).toBe(true)
    const { safe } = result
    for (const call of texts) {
      expect(call.xPx).toBeGreaterThanOrEqual(safe.xPx)
      expect(call.xPx + call.widthPx).toBeLessThanOrEqual(safe.xPx + safe.widthPx + 1e-6)
      expect(call.yPx).toBeGreaterThan(safe.yPx)
      expect(call.yPx).toBeLessThan(safe.yPx + safe.heightPx)
    }
    // Every word of every field is drawn once, in order.
    expect(texts.map((call) => call.text).join(' ')).toBe(
      [TALL.title, TALL.department, TALL.authors, TALL.date].join(' '),
    )
  })

  it('draws at the fitted size in frame pixels, so a 4K card is drawn twice as large', () => {
    const { context, calls } = recorder()
    drawTitleCard(context, fit(card({ title: 'Welcome' }), UHD, FONTS), FONTS.families, { ground: 'G', ink: 'I' })
    expect(calls[1]!.font).toBe(`bold ${2 * CARD_ROLES.staffTitle.maxPx}px Heading`)
  })
})


describe('Submission’s generated date and caveat (VH-146)', () => {
  it.each(Object.entries(LANGUAGE_TABLES))('%s keeps each complete at a line break', (tag, table) => {
    const words = compile<typeof enGB>(table, tag).titleCard.card
    const date = tag === 'zh-Hans' ? '2026年10月19日' : tag === 'ms-MY' ? '19 Oktober 2026' : '19 October 2026'
    const value = words.madeValue({ date })
    const details = submissionCardBlocks({ ...SUBMISSION, made: value }).at(-1)!
    const runs = details.runs.slice(6)
    expect(runs.map((run) => run.text).join('')).toBe(value)
    const note = value.slice(date.length).trim()
    const maxWidth = Math.max(fakeMeasure('bold 20px Body', date), fakeMeasure('bold 20px Body', note))
    const lines = wrap(details.role, runs, 20, maxWidth, FONTS)!
    expect(lines).not.toBeNull()
    expect(lineTexts(lines)).toEqual([date, note])
    // An indivisible phrase refuses an impossibly narrow line instead of clipping.
    expect(wrap(details.role, runs, 20, maxWidth - 1, FONTS)).toBeNull()
    // Each piece on its own, one pixel short of itself, so the refusal cannot
    // come from the wider one alone: in Chinese the note is wider, and a
    // breakable date passed the line above (VH-152, R2-12).
    const [dateRun, , noteRun] = runs
    expect(dateRun!.text).toBe(date)
    expect(noteRun!.text).toBe(note)
    expect(wrap(details.role, [dateRun!], 20, fakeMeasure('bold 20px Body', date) - 1, FONTS)).toBeNull()
    expect(wrap(details.role, [noteRun!], 20, fakeMeasure('bold 20px Body', note) - 1, FONTS)).toBeNull()
  })

  it('wraps a template it cannot split as ordinary text, never one unbreakable piece', () => {
    // A future template with no em dash or full-width bracket (VH-152).
    const made = 'Card made on 19 October 2026 and not the submission date'
    const details = submissionCardBlocks({ ...SUBMISSION, made }).at(-1)!
    const runs = details.runs.slice(6)
    expect(runs.map((run) => run.text).join('')).toBe(made)
    expect(runs.every((run) => !run.unbreakable)).toBe(true)
    const lines = wrap(details.role, runs, 20, fakeMeasure('bold 20px Body', 'submission'), FONTS)
    expect(lines).not.toBeNull()
    expect(lines!.length).toBeGreaterThan(1)
  })

  it('leaves a typed staff date free to break at ordinary spaces', () => {
    const date = '19 October 2026'
    const block = staffCardBlocks({ ...NONE, date })[0]!
    const lines = wrap(block.role, block.runs, 20, 80, FONTS)!
    expect(lines.length).toBeGreaterThan(1)
    expect(lineTexts(lines).join('')).toBe(date.replaceAll(' ', ''))
  })
})
