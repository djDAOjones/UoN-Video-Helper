/**
 * The title card (VH-127): typed text fitted to a frame, and drawn.
 *
 * Pure but for the draw. A text's width comes from an injected measure, so
 * the page can fit with a document canvas and refuse a field before the job
 * starts, and the worker can fit again on an `OffscreenCanvas` with the fonts
 * it has loaded, by the same rules. `spike-cards.html` fits and draws through
 * this module, so what it measures is what ships.
 *
 * Sizes are px per {@link CARD_SCALE_LINES} lines of the frame's shorter side
 * (`config/cards.ts`), so a 4K frame breaks exactly as a 1080 one does. Each
 * field is drawn at the largest size in its role's range that wraps into its
 * role's lines, the largest shrinking first until the card fits the safe area
 * (VH-126's measured fit). Text that cannot fit at the floor is refused at its
 * field, never clipped and never drawn under the floor.
 */

import {
  CARD_BLOCK_GAP_EM,
  CARD_FIELD_COLUMNS,
  CARD_FIELD_GAP_EM,
  CARD_LABEL_GAP_EM,
  CARD_PAIR_GAP_EM,
  CARD_ROLES,
  CARD_SAFE_AREA,
  CARD_SCALE_LINES,
  CARD_SIZE_STEP_PX,
  CARD_TYPE_FLOOR_PX,
  CARD_WIDE_COLUMNS,
  type CardFace,
  type CardTextRole,
} from '../config/cards'

/** How wide a text draws in a CSS font shorthand, in px: the caller's canvas, or a test's fake. */
export type MeasureText = (font: string, text: string) => number

/** What a fit knows of type: each face's CSS family list, and how wide text draws in it. */
export interface CardFonts {
  readonly families: Readonly<Record<CardFace, string>>
  readonly measure: MeasureText
}

export type CardWeight = CardTextRole['weight']

/** A stretch of text in one weight. */
export interface CardRun {
  readonly text: string
  readonly weight: CardWeight
}

/** A run-in label's gap before its value (VH-128): breakable like a space, {@link CARD_LABEL_GAP_EM} wide. */
export const LABEL_GAP: CardRun = { text: '\uE000', weight: 'normal' }
/** The wider gap between two label-and-value pairs on one line, {@link CARD_PAIR_GAP_EM} wide. */
export const PAIR_GAP: CardRun = { text: '\uE001', weight: 'normal' }

/** One unbreakable piece of a line, at its offset from the line's start. */
export interface CardPiece {
  readonly text: string
  readonly weight: CardWeight
  readonly xPx: number
}

export interface CardLine {
  readonly pieces: readonly CardPiece[]
  readonly widthPx: number
}

/** One field of a card, as the fit sees it. */
export interface CardBlock<Name extends string = string> {
  readonly name: Name
  readonly role: CardTextRole
  readonly runs: readonly CardRun[]
  /** Space above it, as a multiple of the floor; unread for the first. */
  readonly gapEm: number
}

export interface FrameSize {
  readonly widthPx: number
  readonly heightPx: number
}

export interface CardRect {
  readonly xPx: number
  readonly yPx: number
  readonly widthPx: number
  readonly heightPx: number
}

export interface LaidBlock<Name extends string = string> {
  readonly block: CardBlock<Name>
  /** Its size, px per {@link CARD_SCALE_LINES} lines of the shorter side. */
  readonly sizePx: number
  readonly lines: readonly CardLine[]
}

/**
 * Why a card cannot be drawn: a field that will not fit its lines at the
 * floor; the fields together taller than the safe area with every one at its
 * floor, named at the field with the most lines (the later on a tie) so the
 * page still refuses at a field; or no text at all, which the page refuses
 * before a job starts (VH-127).
 */
export type CardRefusal<Name extends string = string> =
  | { readonly at: 'field'; readonly field: Name }
  | { readonly at: 'card'; readonly field: Name; readonly overPx: number }
  | { readonly at: 'empty' }

export interface CardFit<Name extends string = string> {
  readonly frame: FrameSize
  readonly safe: CardRect
  /** Frame px per px of a size: the shorter side over {@link CARD_SCALE_LINES}. */
  readonly scale: number
  /** The fields that were laid; short of the full list when refused at a field. */
  readonly laid: readonly LaidBlock<Name>[]
  /** The laid text's height in frame px; 0 when refused at a field. */
  readonly heightPx: number
  readonly refused: CardRefusal<Name> | null
}

/* ---- Measuring and wrapping ------------------------------------------- */

/** A space, a label gap, one CJK character or mark, or a run of anything else. */
const TOKEN =
  /\s+|[\uE000\uE001]|[\u2E80-\u9FFF\u3000-\u303F\uF900-\uFAFF\uFF00-\uFFEF]|[^\s\uE000\uE001\u2E80-\u9FFF\u3000-\u303F\uF900-\uFAFF\uFF00-\uFFEF]+/gu

/** Characters drawn about twice as wide as a Latin letter: the CJK ranges {@link TOKEN} breaks between. */
const WIDE = /[\u2E80-\u9FFF\u3000-\u303F\uF900-\uFAFF\uFF00-\uFFEF]/u

/**
 * Chinese line breaking (W3C clreq §3.1.7): closing punctuation never starts a
 * line, and opening punctuation never ends one. A piece starting with the one
 * is joined to the piece before it, and a piece ending with the other to the
 * piece after it, so the break falls on either side of the pair.
 */
const NO_LINE_START = /^[、。，．：；！？）］｝〕〉》」』】〙〗〟｠’”…‥·・!),.:;?\]}]/u
const NO_LINE_END = /[（［｛〔〈《「『【〘〖〝｟‘“([{]$/u

const isBreak = (token: string): boolean => token === '\uE000' || token === '\uE001' || /^\s+$/u.test(token)

/** The pieces a run's text breaks into, with Chinese punctuation kept to its neighbour. */
function pieces(text: string): string[] {
  const out: string[] = []
  for (const token of text.match(TOKEN) ?? []) {
    const last = out.length - 1
    if (last >= 0 && !isBreak(token) && !isBreak(out[last]!) && NO_LINE_START.test(token)) {
      out[last] += token
    } else {
      out.push(token)
    }
  }
  for (let i = out.length - 2; i >= 0; i--) {
    if (!isBreak(out[i]!) && !isBreak(out[i + 1]!) && NO_LINE_END.test(out[i]!)) {
      out[i] += out[i + 1]!
      out.splice(i + 1, 1)
    }
  }
  return out
}

/** The CSS font shorthand a role draws in, at a size in frame px. */
export function cardFont(
  role: CardTextRole,
  sizePx: number,
  weight: CardWeight,
  families: CardFonts['families'],
): string {
  return `${weight} ${sizePx}px ${families[role.face]}`
}

/**
 * Greedy line fill at one size in frame px; null when one unbreakable piece is
 * wider than the line, which no wrapping can fix.
 */
export function wrap(
  role: CardTextRole,
  runs: readonly CardRun[],
  sizePx: number,
  maxWidthPx: number,
  fonts: CardFonts,
): CardLine[] | null {
  const out: CardLine[] = []
  let line: CardPiece[] = []
  let widthPx = 0
  let pendingPx = 0
  for (const run of runs) {
    const font = cardFont(role, sizePx, run.weight, fonts.families)
    for (const text of pieces(run.text)) {
      if (text === LABEL_GAP.text || text === PAIR_GAP.text) {
        const em = text === LABEL_GAP.text ? CARD_LABEL_GAP_EM : CARD_PAIR_GAP_EM
        pendingPx = Math.max(pendingPx, em * sizePx)
        continue
      }
      if (isBreak(text)) {
        pendingPx = Math.max(pendingPx, fonts.measure(font, text))
        continue
      }
      const w = fonts.measure(font, text)
      if (line.length > 0 && widthPx + pendingPx + w > maxWidthPx) {
        out.push({ pieces: line, widthPx })
        line = []
        widthPx = 0
        pendingPx = 0
      }
      if (line.length === 0 && w > maxWidthPx) return null
      const xPx = line.length === 0 ? 0 : widthPx + pendingPx
      line.push({ text, weight: run.weight, xPx })
      widthPx = xPx + w
      pendingPx = 0
    }
  }
  if (line.length > 0) out.push({ pieces: line, widthPx })
  return out
}

/* ---- Fitting a card --------------------------------------------------- */

/** The card's safe area in frame px: title-safe sides and top, a deeper foot for a player's controls. */
export function safeArea(frame: FrameSize): CardRect {
  const xPx = frame.widthPx * CARD_SAFE_AREA.side
  const yPx = frame.heightPx * CARD_SAFE_AREA.top
  return {
    xPx,
    yPx,
    widthPx: frame.widthPx - 2 * xPx,
    heightPx: frame.heightPx * (1 - CARD_SAFE_AREA.top - CARD_SAFE_AREA.bottom),
  }
}

function laidHeightPx(laid: readonly LaidBlock[], scale: number): number {
  return laid.reduce(
    (sum, item, i) =>
      sum +
      item.lines.length * item.sizePx * scale * item.block.role.lineHeight +
      (i > 0 ? item.block.gapEm * CARD_TYPE_FLOOR_PX * scale : 0),
    0,
  )
}

/**
 * Each block at the largest size in its range that wraps into its lines,
 * shrinking the largest first until the card fits; refused at the block that
 * cannot fit at its floor, or at the card when nothing is left to shrink.
 * A size never falls under its role's floor, whatever the step.
 */
export function fit<Name extends string>(
  blocks: readonly CardBlock<Name>[],
  frame: FrameSize,
  fonts: CardFonts,
): CardFit<Name> {
  const scale = Math.min(frame.widthPx, frame.heightPx) / CARD_SCALE_LINES
  const portrait = frame.heightPx > frame.widthPx
  const safe = safeArea(frame)
  const base = { frame, safe, scale }
  if (blocks.length === 0) return { ...base, laid: [], heightPx: 0, refused: { at: 'empty' } }
  const sizes = blocks.map((block) => block.role.maxPx)
  const shrink = (i: number): void => {
    sizes[i] = Math.max(blocks[i]!.role.minPx, sizes[i]! - CARD_SIZE_STEP_PX)
  }
  for (;;) {
    const laid: LaidBlock<Name>[] = []
    let shrunk = false
    for (const [i, block] of blocks.entries()) {
      const sizePx = sizes[i]!
      const lines = wrap(block.role, block.runs, sizePx * scale, safe.widthPx, fonts)
      const maxLines = portrait ? block.role.portraitMaxLines : block.role.maxLines
      if (lines === null || lines.length > maxLines) {
        if (sizePx <= block.role.minPx) {
          return { ...base, laid, heightPx: 0, refused: { at: 'field', field: block.name } }
        }
        shrink(i)
        shrunk = true
        break
      }
      laid.push({ block, sizePx, lines })
    }
    if (shrunk) continue
    const heightPx = laidHeightPx(laid, scale)
    if (heightPx <= safe.heightPx) return { ...base, laid, heightPx, refused: null }
    let largest = -1
    for (const [i, block] of blocks.entries()) {
      if (sizes[i]! > block.role.minPx && (largest < 0 || sizes[i]! > sizes[largest]!)) largest = i
    }
    if (largest < 0) {
      const longest = laid.reduce((most, item) => (item.lines.length >= most.lines.length ? item : most))
      const overPx = (heightPx - safe.heightPx) / scale
      return { ...base, laid, heightPx, refused: { at: 'card', field: longest.block.name, overPx } }
    }
    shrink(largest)
  }
}

/* ---- The staff card --------------------------------------------------- */

/** The staff card's four fields, in the order they are drawn (the owner, 2026-10-19). */
export const STAFF_CARD_FIELDS = ['title', 'department', 'authors', 'date'] as const

export type StaffCardField = (typeof STAFF_CARD_FIELDS)[number]

export type StaffCardText = Readonly<Record<StaffCardField, string>>

/** Each staff field's role and column limit, so the page, the worker and the spike read one table. */
export const STAFF_CARD: Readonly<Record<StaffCardField, { readonly role: CardTextRole; readonly columns: number }>> = {
  title: { role: CARD_ROLES.staffTitle, columns: CARD_FIELD_COLUMNS.staffTitle },
  department: { role: CARD_ROLES.staffDepartment, columns: CARD_FIELD_COLUMNS.staffDepartment },
  authors: { role: CARD_ROLES.staffAuthors, columns: CARD_FIELD_COLUMNS.staffAuthors },
  date: { role: CARD_ROLES.staffDate, columns: CARD_FIELD_COLUMNS.staffDate },
}

/**
 * The staff card's blocks: the title large and the rest as plain lines, with
 * no labels, as typed but for the ends' whitespace. The title keeps a heading's
 * gap under it and the plain lines a field's between them. A field left empty
 * takes no room; every field empty gives no blocks, which {@link fit} refuses
 * as empty.
 */
export function staffCardBlocks(text: StaffCardText): CardBlock<StaffCardField>[] {
  const blocks: CardBlock<StaffCardField>[] = []
  for (const name of STAFF_CARD_FIELDS) {
    const typed = text[name].trim()
    if (typed === '') continue
    const role = STAFF_CARD[name].role
    const above = blocks.at(-1)?.name
    blocks.push({
      name,
      role,
      runs: [{ text: typed, weight: role.weight }],
      gapEm: above === undefined ? 0 : above === 'title' ? CARD_BLOCK_GAP_EM : CARD_FIELD_GAP_EM,
    })
  }
  return blocks
}

/** Between two ID numbers: an em space, so they read apart and a line breaks only between them, as measured. */
const ID_GAP = '\u2003'

/** Submission's typed fields, in the order they are drawn (the owner, 2026-10-18 and 2026-10-19). */
export const SUBMISSION_CARD_FIELDS = ['assignment', 'module', 'convenor', 'ids'] as const

export type SubmissionCardField = (typeof SUBMISSION_CARD_FIELDS)[number]

/** Submission's blocks: the four typed fields, then the line the app fills in. */
export type SubmissionCardBlockName = SubmissionCardField | 'details'

/** The three typed fields held to a column limit; the ID numbers are held by their own rule. */
export type SubmissionTextField = Exclude<SubmissionCardField, 'ids'>

/** Each held field's role and column limit, so the page, the worker and the spike read one table. */
export const SUBMISSION_CARD: Readonly<
  Record<SubmissionTextField, { readonly role: CardTextRole; readonly columns: number }>
> = {
  assignment: { role: CARD_ROLES.submissionHeading, columns: CARD_FIELD_COLUMNS.assignment },
  module: { role: CARD_ROLES.submissionField, columns: CARD_FIELD_COLUMNS.module },
  convenor: { role: CARD_ROLES.submissionField, columns: CARD_FIELD_COLUMNS.convenor },
}

/** The labels Submission draws, in the video's language, from its table. */
export interface SubmissionCardLabels {
  readonly module: string
  readonly convenor: string
  /** "Student ID number" or "Student ID numbers", chosen for the count. */
  readonly ids: string
  readonly running: string
  readonly made: string
}

/**
 * Submission as it is drawn, every word resolved on the page, so the worker
 * reads no language table. The typed fields and the ID numbers are the
 * user's own: never logged, never in a message.
 */
export interface SubmissionCardText {
  readonly assignment: string
  readonly module: string
  readonly convenor: string
  /** One to eight ID numbers, already checked. */
  readonly ids: readonly string[]
  /** The kept range's length, without the card or the closing, as a clock time: `12:34`. */
  readonly runningTime: string
  /** The date the card was made with its caveat: `19 October 2026 — not the submission date`. */
  readonly made: string
  readonly labels: SubmissionCardLabels
}

/**
 * Submission's blocks, as `spike-cards.html` measured them (VH-126): the
 * assignment as the heading, unlabelled; then module, convenor and the ID
 * numbers, each a label run in before its value in bold; then the running
 * time and the card's date sharing the last line. A typed field left empty
 * takes no room, so a label is never drawn without its value; the page
 * refuses an empty one before a job starts.
 */
export function submissionCardBlocks(text: SubmissionCardText): CardBlock<SubmissionCardBlockName>[] {
  const blocks: CardBlock<SubmissionCardBlockName>[] = []
  const assignment = text.assignment.trim()
  if (assignment !== '') {
    blocks.push({
      name: 'assignment',
      role: CARD_ROLES.submissionHeading,
      runs: [{ text: assignment, weight: 'bold' }],
      gapEm: 0,
    })
  }
  const labelled = (name: SubmissionCardBlockName, runs: readonly CardRun[]): void => {
    blocks.push({
      name,
      role: CARD_ROLES.submissionField,
      runs,
      gapEm: blocks.at(-1)?.name === 'assignment' ? CARD_BLOCK_GAP_EM : CARD_FIELD_GAP_EM,
    })
  }
  const pair = (label: string, value: string): CardRun[] => [
    { text: label, weight: 'normal' },
    LABEL_GAP,
    { text: value, weight: 'bold' },
  ]
  for (const [name, value] of [
    ['module', text.module.trim()],
    ['convenor', text.convenor.trim()],
    ['ids', text.ids.join(ID_GAP)],
  ] as const) {
    if (value !== '') labelled(name, pair(text.labels[name], value))
  }
  labelled('details', [
    ...pair(text.labels.running, text.runningTime),
    PAIR_GAP,
    ...pair(text.labels.made, text.made),
  ])
  return blocks
}

/** The columns a text takes against {@link CARD_FIELD_COLUMNS}: a wide character counts {@link CARD_WIDE_COLUMNS}. */
export function columnsOf(text: string): number {
  let columns = 0
  for (const character of text) columns += WIDE.test(character) ? CARD_WIDE_COLUMNS : 1
  return columns
}

/* ---- Faces ------------------------------------------------------------ */

/** The family Lora Bold is loaded under, on the page (`brand-assets.ts`) and in the worker. */
export const CARD_HEADING_FAMILY = 'Lora'

/**
 * Each face's family list on a card: the brand face, its fallback, then the
 * device's CJK fonts, as `tokens.brand.css` stacks them under `:lang(zh)`.
 * The CJK fonts are there in every language, because a title typed in Chinese
 * must draw in an English video too. The stack is `--font-cjk`, read on the
 * page and passed to the worker, which has no document; so the page and the
 * worker fit with the same families.
 */
export function cardFamilies(cjkFontStack: string): CardFonts['families'] {
  return {
    heading: `${CARD_HEADING_FAMILY}, Georgia, ${cjkFontStack}`,
    body: `Arial, ${cjkFontStack}`,
  }
}

/* ---- Drawing ---------------------------------------------------------- */

/** The 2D drawing a card needs, which a document canvas and an `OffscreenCanvas` both give. */
export type CardContext = Pick<
  CanvasRenderingContext2D,
  'fillStyle' | 'font' | 'textAlign' | 'textBaseline' | 'fillRect' | 'fillText' | 'measureText'
>

/** The card's colours, passed in from the brand tokens: Nottingham Blue and white. */
export interface CardColours {
  readonly ground: string
  readonly ink: string
}

/**
 * Draws a fitted card over the whole frame: the ground, then the text in the
 * ink, left-aligned and centred in the safe area's height, with no logo (the
 * owner, 2026-10-19). Each line sits centred in its pitch on the font's own
 * box, so a CJK fallback and Lora share one rhythm.
 *
 * @throws when the fit was refused: a refused card is never drawn, so nothing
 *   is ever clipped or drawn under the floor.
 */
export function drawTitleCard(
  context: CardContext,
  card: CardFit,
  families: CardFonts['families'],
  colours: CardColours,
): void {
  if (card.refused !== null) throw new Error(`a refused title card cannot be drawn (${card.refused.at})`)
  context.fillStyle = colours.ground
  context.fillRect(0, 0, card.frame.widthPx, card.frame.heightPx)
  context.fillStyle = colours.ink
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'
  let yPx = card.safe.yPx + (card.safe.heightPx - card.heightPx) / 2
  for (const [i, item] of card.laid.entries()) {
    if (i > 0) yPx += item.block.gapEm * CARD_TYPE_FLOOR_PX * card.scale
    const sizePx = item.sizePx * card.scale
    const pitchPx = sizePx * item.block.role.lineHeight
    for (const line of item.lines) {
      for (const piece of line.pieces) {
        context.font = cardFont(item.block.role, sizePx, piece.weight, families)
        const metrics = context.measureText(piece.text)
        const boxPx = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
        const baselinePx = yPx + (pitchPx - boxPx) / 2 + metrics.fontBoundingBoxAscent
        context.fillText(piece.text, card.safe.xPx + piece.xPx, baselinePx)
      }
      yPx += pitchPx
    }
  }
}
