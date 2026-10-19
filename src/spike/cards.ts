/**
 * VH-126 spike: the cards' type scale, measured in this browser.
 *
 * Draws the Internal use only closing's words over the real closing frame,
 * and both title cards, at full size in three frame shapes and three
 * languages, with the longest realistic text, then reports each field's size,
 * its lines, the room left, and how many characters each field can take at the
 * floor. A card that refuses its worst case, words that leave the safe area,
 * or a size under the floor is a failure. Dev-only; not built.
 *
 * The fitting here is the spike's own: VH-127 builds the renderer, and lifts
 * what this page proves.
 */

import '../styles/tokens.brand.css'
import loraUrl from '../assets/lora-bold.woff2?url'

import {
  CARD_BLOCK_GAP_EM,
  CARD_FIELD_COLUMNS,
  CARD_FIELD_GAP_EM,
  CARD_LABEL_GAP_EM,
  CARD_PAIR_GAP_EM,
  CARD_ROLES,
  CARD_SAFE_AREA,
  CARD_TYPE_FLOOR_PX,
  CLOSING_LOGO_FOOT_PER_1080,
  CLOSING_WORDS_GAP_EM,
  CLOSING_WORDS_ROLE,
  type CardTextRole,
} from '../config/cards'
import { closingTailName, CLOSING_TAIL_SECONDS, type BrandingColour } from '../config/branding'
import type { LanguageTag } from '../config/languages'
import { closingWords } from '../i18n'
import { verdictLine } from '../../scripts/verdict.mjs'

const log = document.getElementById('log') as HTMLPreElement
const cards = document.getElementById('cards') as HTMLDivElement
const lines: string[] = []
let failures = 0

function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

function fail(text: string): void {
  failures++
  say(`FAIL ${text}`)
}

const token = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const BLUE = token('--uon-brand-blue')
const WHITE = token('--uon-white')
const CJK = token('--font-cjk')

/* ---- Shapes and text --------------------------------------------------- */

interface Shape {
  readonly name: string
  readonly width: number
  readonly height: number
}

/** The common landscape, a laptop's screen recording, the narrowest landscape, and a phone's. */
const SHAPES: readonly Shape[] = [
  { name: '16:9', width: 1920, height: 1080 },
  { name: '16:10', width: 1728, height: 1080 },
  { name: '4:3', width: 1440, height: 1080 },
  { name: '9:16', width: 1080, height: 1920 },
]

/** Provisional labels: VH-128 settles the English, the sheet route the rest. */
interface Copy {
  readonly closingWords: string
  readonly heading: string
  readonly subhead: string
  readonly assignment: string
  readonly module: string
  readonly labels: {
    readonly module: string
    readonly convenor: string
    readonly ids: string
    readonly running: string
    readonly made: string
    readonly notSubmission: string
  }
}

const COPY: Readonly<Record<LanguageTag, Copy>> = {
  'en-GB': {
    closingWords: closingWords('en-GB'),
    heading: 'Designing, Running and Reporting a Mixed-Methods Study for Your Dissertation',
    subhead: 'Week 3 lecture for students on the Nottingham, Malaysia and China campuses',
    assignment: 'Assignment 2: Reflective Essay on Placement Learning and Professional Identity',
    module: 'LIBA2002 Migration and Identity in a Global Context',
    labels: {
      module: 'Module',
      convenor: 'Convenor or tutor',
      ids: 'Student ID numbers',
      running: 'Running time',
      made: 'Card made',
      notSubmission: 'not the submission date',
    },
  },
  'zh-Hans': {
    closingWords: closingWords('zh-Hans'),
    heading: '为你的学位论文设计、开展和报告混合方法研究',
    subhead: '第三周讲座，面向诺丁汉、马来西亚和中国校区的学生',
    assignment: '作业二：关于实习学习与职业身份认同的反思性论文',
    module: 'LIBA2002 全球背景下的移民与身份认同',
    labels: {
      module: '模块',
      convenor: '模块负责人或导师',
      ids: '学号',
      running: '时长',
      made: '卡片制作日期',
      notSubmission: '非提交日期',
    },
  },
  'ms-MY': {
    closingWords: closingWords('ms-MY'),
    heading:
      'Mereka Bentuk, Menjalankan dan Melaporkan Kajian Kaedah Campuran untuk Disertasi Anda',
    subhead: 'Kuliah minggu ketiga untuk pelajar di kampus Nottingham, Malaysia dan China',
    assignment:
      'Tugasan 2: Esei Reflektif tentang Pembelajaran Penempatan dan Identiti Profesional',
    module: 'LIBA2002 Migration and Identity in a Global Context',
    labels: {
      module: 'Modul',
      convenor: 'Penyelaras atau tutor',
      ids: 'Nombor ID pelajar',
      running: 'Masa tayangan',
      made: 'Kad dibuat',
      notSubmission: 'bukan tarikh penyerahan',
    },
  },
}

/** Typed, so in any script whatever the page's language: the longest are Latin. */
const CONVENOR = 'Professor Alexandra Montgomery-Fitzwilliam'
/** Eight IDs of eight digits, an em space apart so a line breaks only between them. */
const IDS = Array.from({ length: 8 }, (_, i) => String(20412345 + i)).join(' ')
const RUNNING = '1:02:45'
/** The longest month name in each language's long date. */
const CARD_DATE = new Date(2026, 8, 30)

/* ---- Measuring and wrapping ------------------------------------------- */

type Weight = 'normal' | 'bold'

interface Run {
  readonly text: string
  readonly weight: Weight
}

/** A label's gap before its value, breakable like a space. */
const GAP: Run = { text: '\uE000', weight: 'normal' }
/** The wider gap between two pairs on one line, breakable like a space. */
const PAIR_GAP: Run = { text: '\uE001', weight: 'normal' }

interface Placed {
  readonly text: string
  readonly weight: Weight
  readonly x: number
}

interface Line {
  readonly pieces: readonly Placed[]
  readonly width: number
}

/** A space, a CJK character or punctuation mark, or a run of anything else. */
const TOKEN =
  /\s+|[\uE000\uE001]|[\u2E80-\u9FFF\u3000-\u303F\uF900-\uFAFF\uFF00-\uFFEF]|[^\s\uE000\uE001\u2E80-\u9FFF\u3000-\u303F\uF900-\uFAFF\uFF00-\uFFEF]+/gu

const work = document.createElement('canvas').getContext('2d')!
const widths = new Map<string, number>()

function fontFor(role: CardTextRole, px: number, weight: Weight): string {
  const family = role.face === 'heading' ? `Lora, Georgia, ${CJK}` : `Arial, ${CJK}`
  return `${weight} ${px}px ${family}`
}

function measure(font: string, text: string): number {
  const key = `${font}|${text}`
  let width = widths.get(key)
  if (width === undefined) {
    work.font = font
    width = work.measureText(text).width
    widths.set(key, width)
  }
  return width
}

/** Greedy line fill; null when one unbreakable piece is wider than the line. */
function wrap(role: CardTextRole, runs: readonly Run[], px: number, maxWidth: number): Line[] | null {
  const out: Line[] = []
  let pieces: Placed[] = []
  let width = 0
  let pending = 0
  for (const run of runs) {
    const font = fontFor(role, px, run.weight)
    for (const text of run.text.match(TOKEN) ?? []) {
      if (text === '\uE000' || text === '\uE001') {
        const em = text === '\uE000' ? CARD_LABEL_GAP_EM : CARD_PAIR_GAP_EM
        pending = Math.max(pending, em * px)
        continue
      }
      if (/^\s+$/u.test(text)) {
        pending = Math.max(pending, measure(font, text))
        continue
      }
      const w = measure(font, text)
      if (pieces.length > 0 && width + pending + w > maxWidth) {
        out.push({ pieces, width })
        pieces = []
        width = 0
        pending = 0
      }
      if (pieces.length === 0 && w > maxWidth) return null
      const x = pieces.length === 0 ? 0 : width + pending
      pieces.push({ text, weight: run.weight, x })
      width = x + w
      pending = 0
    }
  }
  if (pieces.length > 0) out.push({ pieces, width })
  return out
}

/* ---- Fitting a card --------------------------------------------------- */

interface Block {
  readonly name: string
  readonly role: CardTextRole
  readonly runs: readonly Run[]
  /** Space above it, as a multiple of the floor; unread for the first. */
  readonly gapEm: number
}

interface Laid {
  readonly block: Block
  /** px per 1080 of the shorter side. */
  readonly size: number
  readonly lines: readonly Line[]
}

interface Fit {
  readonly laid: readonly Laid[]
  readonly height: number
  readonly safe: { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
  readonly unit: number
  readonly refused: string | null
}

const STEP_PX = 2

function safeArea(shape: Shape): Fit['safe'] {
  const x = shape.width * CARD_SAFE_AREA.side
  const y = shape.height * CARD_SAFE_AREA.top
  return {
    x,
    y,
    width: shape.width - 2 * x,
    height: shape.height * (1 - CARD_SAFE_AREA.top - CARD_SAFE_AREA.bottom),
  }
}

/**
 * Each block at the largest size in its range that wraps into its lines,
 * shrinking the largest first until the card fits; refused at the block that
 * cannot fit at its floor, or at the card when nothing is left to shrink.
 */
function fit(blocks: readonly Block[], shape: Shape): Fit {
  const unit = Math.min(shape.width, shape.height) / 1080
  const portrait = shape.height > shape.width
  const safe = safeArea(shape)
  const sizes = blocks.map((block) => block.role.maxPx)
  for (;;) {
    const laid: Laid[] = []
    let refused: string | null = null
    for (const [i, block] of blocks.entries()) {
      const wrapped = wrap(block.role, block.runs, sizes[i]! * unit, safe.width)
      const maxLines = portrait ? block.role.portraitMaxLines : block.role.maxLines
      if (wrapped === null || wrapped.length > maxLines) {
        if (sizes[i]! > block.role.minPx) {
          sizes[i] = sizes[i]! - STEP_PX
          refused = ''
          break
        }
        refused = block.name
        break
      }
      laid.push({ block, size: sizes[i]!, lines: wrapped })
    }
    if (refused === '') continue
    if (refused !== null) return { laid, height: 0, safe, unit, refused }
    const height = laid.reduce(
      (sum, item, i) =>
        sum +
        item.lines.length * item.size * unit * item.block.role.lineHeight +
        (i > 0 ? item.block.gapEm * CARD_TYPE_FLOOR_PX * unit : 0),
      0,
    )
    if (height <= safe.height) return { laid, height, safe, unit, refused: null }
    let largest = -1
    for (const [i, block] of blocks.entries()) {
      if (sizes[i]! > block.role.minPx && (largest < 0 || sizes[i]! > sizes[largest]!)) largest = i
    }
    if (largest < 0) return { laid, height, safe, unit, refused: 'the card' }
    sizes[largest] = sizes[largest]! - STEP_PX
  }
}

/* ---- Drawing ---------------------------------------------------------- */

const full = document.createElement('canvas')
const fullContext = full.getContext('2d')!

/** Draws a fitted card full size, left-aligned, centred in the safe area's height. */
function drawCard(result: Fit, shape: Shape, ground: string, ink: string): void {
  full.width = shape.width
  full.height = shape.height
  fullContext.fillStyle = ground
  fullContext.fillRect(0, 0, shape.width, shape.height)
  fullContext.fillStyle = ink
  fullContext.textBaseline = 'alphabetic'
  let y = result.safe.y + (result.safe.height - result.height) / 2
  for (const [i, item] of result.laid.entries()) {
    if (i > 0) y += item.block.gapEm * CARD_TYPE_FLOOR_PX * result.unit
    const px = item.size * result.unit
    const pitch = px * item.block.role.lineHeight
    for (const line of item.lines) {
      for (const piece of line.pieces) {
        fullContext.font = fontFor(item.block.role, px, piece.weight)
        const metrics = fullContext.measureText(piece.text)
        const box = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
        const baseline = y + (pitch - box) / 2 + metrics.fontBoundingBoxAscent
        fullContext.fillText(piece.text, result.safe.x + piece.x, baseline)
      }
      y += pitch
    }
  }
}

/** Copies the full-size canvas into a figure, scaled down to view. */
function show(row: HTMLElement, caption: string): void {
  const figure = document.createElement('figure')
  const view = document.createElement('canvas')
  const scale = full.width >= full.height ? 640 / full.width : 360 / full.height
  view.width = Math.round(full.width * scale)
  view.height = Math.round(full.height * scale)
  view.getContext('2d')!.drawImage(full, 0, 0, view.width, view.height)
  view.setAttribute('role', 'img')
  view.setAttribute('aria-label', caption)
  const text = document.createElement('figcaption')
  text.textContent = caption
  figure.append(view, text)
  row.append(figure)
}

function section(title: string): HTMLElement {
  const block = document.createElement('section')
  const heading = document.createElement('h2')
  heading.textContent = title
  const row = document.createElement('div')
  row.className = 'row'
  block.append(heading, row)
  cards.append(block)
  return row
}

/* ---- The cards -------------------------------------------------------- */

function generalBlocks(copy: Copy, heading = copy.heading, subhead = copy.subhead): Block[] {
  return [
    {
      name: 'heading',
      role: CARD_ROLES.generalHeading,
      runs: [{ text: heading, weight: 'bold' }],
      gapEm: 0,
    },
    {
      name: 'subhead',
      role: CARD_ROLES.generalSubhead,
      runs: [{ text: subhead, weight: 'normal' }],
      gapEm: CARD_BLOCK_GAP_EM,
    },
  ]
}

function field(name: string, label: string, value: string, gapEm = CARD_FIELD_GAP_EM): Block {
  return {
    name,
    role: CARD_ROLES.submissionField,
    runs: [{ text: label, weight: 'normal' }, GAP, { text: value, weight: 'bold' }],
    gapEm,
  }
}

const WIDE = /[\u2E80-\u9FFF\u3000-\u303F\uF900-\uFAFF\uFF00-\uFFEF]/u

/** The longest start of a text that keeps within a column count, a wide character counting two. */
function cut(text: string, columns: number): string {
  let used = 0
  let out = ''
  for (const character of text) {
    used += WIDE.test(character) ? 2 : 1
    if (used > columns) break
    out += character
  }
  return out
}

function submissionBlocks(
  language: LanguageTag,
  copy: Copy,
  assignment = copy.assignment,
  module = copy.module,
  convenor = cut(CONVENOR, CARD_FIELD_COLUMNS.convenor),
): Block[] {
  const date = new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(CARD_DATE)
  const made =
    language === 'zh-Hans'
      ? `${date}（${copy.labels.notSubmission}）`
      : `${date} — ${copy.labels.notSubmission}`
  return [
    {
      name: 'assignment',
      role: CARD_ROLES.submissionHeading,
      runs: [{ text: assignment, weight: 'bold' }],
      gapEm: 0,
    },
    field('module', copy.labels.module, module, CARD_BLOCK_GAP_EM),
    field('convenor', copy.labels.convenor, convenor),
    field('ids', copy.labels.ids, IDS),
    {
      name: 'running and made',
      role: CARD_ROLES.submissionField,
      runs: [
        { text: copy.labels.running, weight: 'normal' },
        GAP,
        { text: RUNNING, weight: 'bold' },
        PAIR_GAP,
        { text: copy.labels.made, weight: 'normal' },
        GAP,
        { text: made, weight: 'bold' },
      ],
      gapEm: CARD_FIELD_GAP_EM,
    },
  ]
}

function describe(result: Fit): string {
  if (result.refused === 'the card') {
    const over = Math.round((result.height - result.safe.height) / result.unit)
    return `refused at the card, ${over}px/1080 over at the floor`
  }
  if (result.refused !== null) return `refused at ${result.refused}`
  const parts = result.laid.map(
    (item) => `${item.block.name} ${item.size}px×${item.lines.length}`,
  )
  const room = Math.round((result.safe.height - result.height) / result.unit)
  return `${parts.join(', ')}; ${room}px/1080 to spare`
}

function checkFloor(result: Fit, where: string): void {
  for (const item of result.laid) {
    if (item.size < CARD_TYPE_FLOOR_PX) fail(`${where}: ${item.block.name} at ${item.size}px`)
  }
}

/**
 * How many characters a field takes at most, with the rest of the card as
 * given: the longest prefix of a long text that the card still fits.
 */
function capacity(
  blocksFor: (text: string) => Block[],
  long: string,
  shape: Shape,
): number {
  const characters = [...long]
  let low = 0
  let high = characters.length
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (fit(blocksFor(characters.slice(0, mid).join('')), shape).refused === null) low = mid
    else high = mid - 1
  }
  return low
}

const LONG: Readonly<Record<LanguageTag, string>> = {
  'en-GB': `${COPY['en-GB'].heading}: ${COPY['en-GB'].subhead}, ${COPY['en-GB'].assignment}, ${COPY['en-GB'].heading}`,
  'zh-Hans': `${COPY['zh-Hans'].heading}${COPY['zh-Hans'].subhead}${COPY['zh-Hans'].assignment}${COPY['zh-Hans'].heading}${COPY['zh-Hans'].subhead}`,
  'ms-MY': `${COPY['ms-MY'].heading}: ${COPY['ms-MY'].subhead}, ${COPY['ms-MY'].assignment}, ${COPY['ms-MY'].heading}`,
}

/** Submission with every typed field at its column limit. */
function worstSubmission(language: LanguageTag): Block[] {
  const long = LONG[language]
  return submissionBlocks(
    language,
    COPY[language],
    cut(`${COPY[language].assignment.split(/[:：]/u)[0]}: ${long}`, CARD_FIELD_COLUMNS.assignment),
    cut(`LIBA2002 ${long}`, CARD_FIELD_COLUMNS.module),
    cut(CONVENOR, CARD_FIELD_COLUMNS.convenor),
  )
}

/* ---- The closing ------------------------------------------------------ */

async function settledFrame(colour: BrandingColour): Promise<ImageBitmap> {
  const video = document.createElement('video')
  video.muted = true
  video.preload = 'auto'
  video.src = `/branding/${closingTailName(colour, 1080)}`
  await new Promise((resolve) => video.addEventListener('loadeddata', resolve, { once: true }))
  // The last whole second is the settled logo; a frame inside it.
  video.currentTime = CLOSING_TAIL_SECONDS - 0.1
  await new Promise((resolve) => video.addEventListener('seeked', resolve, { once: true }))
  return createImageBitmap(video)
}

async function closing(): Promise<void> {
  const row = section('The closing: Internal use only, drawn over the settled logo')
  const frames = { blue: await settledFrame('blue'), white: await settledFrame('white') }
  const shape = SHAPES[0]!
  const safe = safeArea(shape)
  const portrait = SHAPES[3]!
  /** Spec §4.3: a portrait output letterboxes the 16:9 closing across its width. */
  const portraitScale = portrait.width / shape.width
  say('Closing words, Arial Bold, px per 1080 lines of the 16:9 asset')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    const words = COPY[language].closingWords
    const px = CLOSING_WORDS_ROLE.maxPx
    const font = fontFor(CLOSING_WORDS_ROLE, px, 'bold')
    const width = measure(font, words)
    work.font = font
    const metrics = work.measureText(words)
    const capTop = CLOSING_LOGO_FOOT_PER_1080 + CLOSING_WORDS_GAP_EM * px
    const baseline = capTop + work.measureText('H').actualBoundingBoxAscent
    const foot = baseline + metrics.actualBoundingBoxDescent
    const bottom = shape.height * (1 - CARD_SAFE_AREA.bottom)
    const effective = px * portraitScale
    say(
      `  ${language}: "${words}" ${Math.round(width)}px wide of ${Math.round(safe.width)}; ` +
        `foot at ${Math.round(foot)} of ${Math.round(bottom)}; ${effective.toFixed(2)}px in 9:16`,
    )
    if (width > safe.width) fail(`${language} closing words wider than the safe area`)
    if (foot > bottom) fail(`${language} closing words below the safe area`)
    if (effective < CARD_TYPE_FLOOR_PX) fail(`${language} closing words under the floor in 9:16`)
    for (const colour of ['blue', 'white'] as const) {
      full.width = shape.width
      full.height = shape.height
      fullContext.drawImage(frames[colour], 0, 0)
      fullContext.font = font
      fullContext.textAlign = 'center'
      fullContext.textBaseline = 'alphabetic'
      fullContext.fillStyle = colour === 'blue' ? WHITE : BLUE
      fullContext.fillText(words, shape.width / 2, baseline)
      fullContext.textAlign = 'start'
      show(row, `${language}, ${colour}, 16:9: ${px}px`)
    }
  }
  // The portrait view of one, as a 9:16 output shows it.
  const asset = document.createElement('canvas')
  asset.width = full.width
  asset.height = full.height
  asset.getContext('2d')!.drawImage(full, 0, 0)
  full.width = portrait.width
  full.height = portrait.height
  fullContext.fillStyle = BLUE
  fullContext.fillRect(0, 0, portrait.width, portrait.height)
  const scaledHeight = shape.height * portraitScale
  fullContext.drawImage(asset, 0, (portrait.height - scaledHeight) / 2, portrait.width, scaledHeight)
  show(row, `ms-MY, white, 9:16 letterboxed: ${(CLOSING_WORDS_ROLE.maxPx * portraitScale).toFixed(2)}px`)
}

/* ---- Contrast --------------------------------------------------------- */

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

function contrast(): void {
  const ratio = (luminance(WHITE) + 0.05) / (luminance(BLUE) + 0.05)
  say(`Contrast: white and Nottingham Blue ${ratio.toFixed(2)}:1 (both grounds; 7:1 needed)`)
  if (ratio < 7) fail('contrast under 7:1')
}

/* ---- Run -------------------------------------------------------------- */

async function run(): Promise<void> {
  const lora = new FontFace('Lora', `url(${JSON.stringify(loraUrl)}) format('woff2')`, {
    weight: '700',
  })
  document.fonts.add(await lora.load())
  if (!document.fonts.check('bold 56px Lora')) fail('Lora Bold did not load')

  contrast()
  await closing()

  say('\nGeneral, each field at its column limit')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    const row = section(`General — ${language}, each field at its limit`)
    const blocks = generalBlocks(
      COPY[language],
      cut(LONG[language], CARD_FIELD_COLUMNS.generalHeading),
      cut(LONG[language], CARD_FIELD_COLUMNS.generalSubhead),
    )
    for (const shape of SHAPES) {
      const result = fit(blocks, shape)
      const where = `general ${language} ${shape.name}`
      say(`  ${where}: ${describe(result)}`)
      if (result.refused !== null) fail(`${where} refused`)
      checkFloor(result, where)
      drawCard(result, shape, BLUE, WHITE)
      show(row, `${shape.name}: ${describe(result)}`)
    }
  }

  say('\nSubmission, each typed field at its column limit, eight IDs')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    const row = section(`Submission — ${language}, each field at its limit, eight IDs`)
    const blocks = worstSubmission(language)
    for (const shape of SHAPES) {
      const result = fit(blocks, shape)
      const where = `submission ${language} ${shape.name}`
      say(`  ${where}: ${describe(result)}`)
      if (result.refused !== null) fail(`${where} refused`)
      checkFloor(result, where)
      drawCard(result, shape, BLUE, WHITE)
      show(row, `${shape.name}: ${describe(result)}`)
    }
  }

  say('\nRunway: the most characters a field takes before it is refused, the rest at realistic length')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    const copy = COPY[language]
    for (const shape of SHAPES) {
      const heading = capacity((text) => generalBlocks(copy, text), LONG[language], shape)
      const subhead = capacity((text) => generalBlocks(copy, copy.heading, text), LONG[language], shape)
      const assignment = capacity(
        (text) => submissionBlocks(language, copy, text),
        LONG[language],
        shape,
      )
      const module = capacity(
        (text) => submissionBlocks(language, copy, copy.assignment, text),
        LONG[language],
        shape,
      )
      say(
        `  ${language} ${shape.name}: General heading ${heading}, subhead ${subhead} (with the other at its longest); ` +
          `Submission assignment ${assignment}, module ${module}`,
      )
    }
  }

  // 4K: the same card, twice the pixels, must break the same way.
  const shape = SHAPES[0]!
  const at4k = { name: '16:9 4K', width: shape.width * 2, height: shape.height * 2 }
  const one = fit(worstSubmission('ms-MY'), shape)
  const two = fit(worstSubmission('ms-MY'), at4k)
  const same = describe(one) === describe(two)
  say(`\n4K: ms-MY Submission at 3840 × 2160 ${same ? 'breaks as at 1080' : `differs: ${describe(two)}`}`)
  if (!same) fail('4K layout differs from 1080')
}

try {
  await run()
} catch (error) {
  fail(`ERROR ${error instanceof Error ? error.message : String(error)}`)
}
// The one line `scripts/run-in-engines.mjs` reads (VH-102).
say(`\n${verdictLine(failures)}`)
say('\ndone')
