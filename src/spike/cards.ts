/**
 * VH-126 spike: the cards' type scale, measured in this browser.
 *
 * Draws the Internal use only closing's words over the real closing frame,
 * and both title cards, at full size in four frame shapes and three
 * languages, with every typed field at its column limit, then reports each
 * field's size, its lines, the room left, and how many columns each field can
 * take with the others at their limits. A card that refuses its worst case,
 * words that leave the safe area, a size under the floor, or a 4K card that
 * breaks differently from its 1080 one is a failure. Dev-only; not built.
 *
 * The cards are fitted and drawn by the renderer, `src/media/title-card.ts`
 * (VH-127), with this page's canvas as its measure, so what this page proves
 * is what the app draws.
 */

import '../styles/tokens.brand.css'
import loraUrl from '../assets/lora-bold.woff2?url'

import {
  CARD_FIELD_COLUMNS,
  CARD_SAFE_AREA,
  CARD_TYPE_FLOOR_PX,
  CLOSING_LOGO_FOOT_PER_1080,
  CLOSING_WORDS_GAP_EM,
  CLOSING_WORDS_ROLE,
} from '../config/cards'
import {
  cardFont,
  columnsOf,
  drawTitleCard,
  fit,
  safeArea,
  STAFF_CARD,
  STAFF_CARD_FIELDS,
  staffCardBlocks,
  submissionCardBlocks,
  type CardBlock,
  type CardFit,
  type CardFonts,
  type FrameSize,
  type StaffCardText,
} from '../media/title-card'
import { closingTailName, CLOSING_TAIL_SECONDS, type BrandingColour } from '../config/branding'
import type { LanguageTag } from '../config/languages'
import { closingWords } from '../i18n'
import { submissionCardText } from '../ui/title-card-step'
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

interface Shape extends FrameSize {
  readonly name: string
}

/** The common landscape, a laptop's screen recording, the narrowest landscape, and a phone's. */
const SHAPES: readonly Shape[] = [
  { name: '16:9', widthPx: 1920, heightPx: 1080 },
  { name: '16:10', widthPx: 1728, heightPx: 1080 },
  { name: '4:3', widthPx: 1440, heightPx: 1080 },
  { name: '9:16', widthPx: 1080, heightPx: 1920 },
]

/** The same shape at twice the lines, as a 4K output is. */
const at4k = (shape: Shape): Shape => ({
  name: `${shape.name} 4K`,
  widthPx: shape.widthPx * 2,
  heightPx: shape.heightPx * 2,
})

/** Typical typed copy per language; the labels Submission draws come from the tables (VH-128). */
interface Copy {
  readonly closingWords: string
  readonly title: string
  readonly department: string
  readonly authors: string
  readonly assignment: string
  readonly module: string
}

const COPY: Readonly<Record<LanguageTag, Copy>> = {
  'en-GB': {
    closingWords: closingWords('en-GB'),
    title: 'Designing, Running and Reporting a Mixed-Methods Study for Your Dissertation',
    department: 'School of Sociology and Social Policy, Faculty of Social Sciences',
    authors: 'Professor Alexandra Montgomery-Fitzwilliam and Dr Samuel Okonkwo-Hartley',
    assignment: 'Assignment 2: Reflective Essay on Placement Learning and Professional Identity',
    module: 'LIBA2002 Migration and Identity in a Global Context',
  },
  'zh-Hans': {
    closingWords: closingWords('zh-Hans'),
    title: '为你的学位论文设计、开展和报告混合方法研究',
    department: '社会科学学院社会学与社会政策系',
    authors: '亚历山德拉·蒙哥马利-菲茨威廉教授和塞缪尔·奥孔科沃博士',
    assignment: '作业二：关于实习学习与职业身份认同的反思性论文',
    module: 'LIBA2002 全球背景下的移民与身份认同',
  },
  'ms-MY': {
    closingWords: closingWords('ms-MY'),
    title:
      'Mereka Bentuk, Menjalankan dan Melaporkan Kajian Kaedah Campuran untuk Disertasi Anda',
    department: 'Sekolah Sosiologi dan Dasar Sosial, Fakulti Sains Sosial',
    authors: 'Profesor Alexandra Montgomery-Fitzwilliam dan Dr Samuel Okonkwo-Hartley',
    assignment:
      'Tugasan 2: Esei Reflektif tentang Pembelajaran Penempatan dan Identiti Profesional',
    module: 'LIBA2002 Migration and Identity in a Global Context',
  },
}

/** Typed, so in any script whatever the page's language: the longest are Latin. */
const CONVENOR = 'Professor Alexandra Montgomery-Fitzwilliam'
/** Eight IDs of eight digits; the card sets them an em space apart. */
const IDS = Array.from({ length: 8 }, (_, i) => String(20412345 + i))
/** A running time past an hour, 1:02:45, so the shared last line is at its longest. */
const RUNNING_SECONDS = 3765
/** The longest month name in each language's long date. */
const CARD_DATE = new Date(2026, 8, 30)

/* ---- Measuring and drawing, through the renderer ---------------------- */

const work = document.createElement('canvas').getContext('2d')!
const widths = new Map<string, number>()

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

const FONTS: CardFonts = {
  families: { heading: `Lora, Georgia, ${CJK}`, body: `Arial, ${CJK}` },
  measure,
}

const full = document.createElement('canvas')
const fullContext = full.getContext('2d')!

/** Draws a fitted card full size; a refused one is only its ground, since the renderer never draws it. */
function drawCard(result: CardFit): void {
  full.width = result.frame.widthPx
  full.height = result.frame.heightPx
  if (result.refused === null) {
    drawTitleCard(fullContext, result, FONTS.families, { ground: BLUE, ink: WHITE })
  } else {
    fullContext.fillStyle = BLUE
    fullContext.fillRect(0, 0, full.width, full.height)
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

/** The longest start of a text that keeps within a column count, a wide character counting two. */
function cut(text: string, columns: number): string {
  let used = 0
  let out = ''
  for (const character of text) {
    used += columnsOf(character)
    if (used > columns) break
    out += character
  }
  return out
}

/** Submission through the shipped blocks and the tables' labels, so what is measured is what the app draws (VH-128). */
function submissionBlocks(
  language: LanguageTag,
  copy: Copy,
  assignment = copy.assignment,
  module = copy.module,
  convenor = cut(CONVENOR, CARD_FIELD_COLUMNS.convenor),
): CardBlock[] {
  const typed = { assignment, module, convenor, ids: IDS.join(' ') }
  return submissionCardBlocks(submissionCardText(typed, IDS, RUNNING_SECONDS, CARD_DATE, language))
}

function describe(result: CardFit): string {
  const refused = result.refused
  if (refused?.at === 'card') {
    return `refused at the card, ${Math.round(refused.overPx)}px/1080 over at the floor`
  }
  if (refused?.at === 'field') return `refused at ${refused.field}`
  if (refused?.at === 'empty') return 'refused as empty'
  const parts = result.laid.map(
    (item) => `${item.block.name} ${item.sizePx}px×${item.lines.length}`,
  )
  const room = Math.round((result.safe.heightPx - result.heightPx) / result.scale)
  return `${parts.join(', ')}; ${room}px/1080 to spare`
}

function checkFloor(result: CardFit, where: string): void {
  for (const item of result.laid) {
    if (item.sizePx < CARD_TYPE_FLOOR_PX) fail(`${where}: ${item.block.name} at ${item.sizePx}px`)
  }
}

/**
 * How many columns a field takes at most, with the rest of the card as
 * given: the longest prefix of a long text that the card still fits.
 */
function capacity(
  blocksFor: (text: string) => CardBlock[],
  long: string,
  shape: Shape,
): number {
  const characters = [...long]
  let low = 0
  let high = characters.length
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (fit(blocksFor(characters.slice(0, mid).join('')), shape, FONTS).refused === null) low = mid
    else high = mid - 1
  }
  return columnsOf(characters.slice(0, low).join(''))
}

const LONG: Readonly<Record<LanguageTag, string>> = {
  'en-GB': `${COPY['en-GB'].title}: ${COPY['en-GB'].department}, ${COPY['en-GB'].assignment}, ${COPY['en-GB'].title}`,
  'zh-Hans': `${COPY['zh-Hans'].title}${COPY['zh-Hans'].department}${COPY['zh-Hans'].assignment}${COPY['zh-Hans'].title}${COPY['zh-Hans'].department}`,
  'ms-MY': `${COPY['ms-MY'].title}: ${COPY['ms-MY'].department}, ${COPY['ms-MY'].assignment}, ${COPY['ms-MY'].title}`,
}

/** The staff card with every field at its column limit, or the fields given as given and the rest at theirs. */
function worstStaff(language: LanguageTag, given?: Partial<StaffCardText>): StaffCardText {
  const atLimit = (name: keyof StaffCardText): string =>
    given?.[name] ?? cut(LONG[language], STAFF_CARD[name].columns)
  return {
    title: atLimit('title'),
    department: atLimit('department'),
    authors: atLimit('authors'),
    date: atLimit('date'),
  }
}

/** The staff card as it is usually typed, with the longest month's long date. */
function typicalStaff(language: LanguageTag): StaffCardText {
  const copy = COPY[language]
  const date = new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(CARD_DATE)
  return { title: copy.title, department: copy.department, authors: copy.authors, date }
}

/** Submission with every typed field at its column limit. */
function worstSubmission(language: LanguageTag): CardBlock[] {
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
  const portraitScale = portrait.widthPx / shape.widthPx
  say('Closing words, Arial Bold, px per 1080 lines of the 16:9 asset')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    const words = COPY[language].closingWords
    const px = CLOSING_WORDS_ROLE.maxPx
    const font = cardFont(CLOSING_WORDS_ROLE, px, 'bold', FONTS.families)
    const width = measure(font, words)
    work.font = font
    const metrics = work.measureText(words)
    const capTop = CLOSING_LOGO_FOOT_PER_1080 + CLOSING_WORDS_GAP_EM * px
    const baseline = capTop + work.measureText('H').actualBoundingBoxAscent
    const foot = baseline + metrics.actualBoundingBoxDescent
    const bottom = shape.heightPx * (1 - CARD_SAFE_AREA.bottom)
    const effective = px * portraitScale
    say(
      `  ${language}: "${words}" ${Math.round(width)}px wide of ${Math.round(safe.widthPx)}; ` +
        `foot at ${Math.round(foot)} of ${Math.round(bottom)}; ${effective.toFixed(2)}px in 9:16`,
    )
    if (width > safe.widthPx) fail(`${language} closing words wider than the safe area`)
    if (foot > bottom) fail(`${language} closing words below the safe area`)
    if (effective < CARD_TYPE_FLOOR_PX) fail(`${language} closing words under the floor in 9:16`)
    for (const colour of ['blue', 'white'] as const) {
      full.width = shape.widthPx
      full.height = shape.heightPx
      fullContext.drawImage(frames[colour], 0, 0)
      fullContext.font = font
      fullContext.textAlign = 'center'
      fullContext.textBaseline = 'alphabetic'
      fullContext.fillStyle = colour === 'blue' ? WHITE : BLUE
      fullContext.fillText(words, shape.widthPx / 2, baseline)
      fullContext.textAlign = 'start'
      show(row, `${language}, ${colour}, 16:9: ${px}px`)
    }
  }
  // The portrait view of one, as a 9:16 output shows it.
  const asset = document.createElement('canvas')
  asset.width = full.width
  asset.height = full.height
  asset.getContext('2d')!.drawImage(full, 0, 0)
  full.width = portrait.widthPx
  full.height = portrait.heightPx
  fullContext.fillStyle = BLUE
  fullContext.fillRect(0, 0, portrait.widthPx, portrait.heightPx)
  const scaledHeight = shape.heightPx * portraitScale
  fullContext.drawImage(asset, 0, (portrait.heightPx - scaledHeight) / 2, portrait.widthPx, scaledHeight)
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

  say('\nStaff card, all four fields at their column limits at once, and each at 4K')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    const row = section(`Staff card — ${language}, all four fields at their limits`)
    const blocks = staffCardBlocks(worstStaff(language))
    for (const shape of SHAPES) {
      const result = fit(blocks, shape, FONTS)
      const where = `staff ${language} ${shape.name}`
      say(`  ${where}: ${describe(result)}`)
      if (result.refused !== null) fail(`${where} refused`)
      checkFloor(result, where)
      const big = fit(blocks, at4k(shape), FONTS)
      if (describe(big) !== describe(result)) fail(`${where} 4K breaks differently: ${describe(big)}`)
      drawCard(result)
      show(row, `${shape.name}: ${describe(result)}`)
    }
  }

  say('\nStaff card, as usually typed')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    const row = section(`Staff card — ${language}, as usually typed`)
    for (const shape of [SHAPES[0]!, SHAPES[3]!]) {
      const result = fit(staffCardBlocks(typicalStaff(language)), shape, FONTS)
      const where = `staff typical ${language} ${shape.name}`
      say(`  ${where}: ${describe(result)}`)
      if (result.refused !== null) fail(`${where} refused`)
      checkFloor(result, where)
      drawCard(result)
      show(row, `${shape.name}: ${describe(result)}`)
    }
  }

  say('\nSubmission, each typed field at its column limit, eight IDs')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    const row = section(`Submission — ${language}, each field at its limit, eight IDs`)
    const blocks = worstSubmission(language)
    for (const shape of SHAPES) {
      const result = fit(blocks, shape, FONTS)
      const where = `submission ${language} ${shape.name}`
      say(`  ${where}: ${describe(result)}`)
      if (result.refused !== null) fail(`${where} refused`)
      checkFloor(result, where)
      drawCard(result)
      show(row, `${shape.name}: ${describe(result)}`)
    }
  }

  say('\nRunway: the most columns each staff field takes, the other three at their limits')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    for (const shape of SHAPES) {
      const runway = STAFF_CARD_FIELDS.map((name) => {
        const columns = capacity(
          (text) => staffCardBlocks(worstStaff(language, { [name]: text })),
          LONG[language],
          shape,
        )
        return `${name} ${columns}/${STAFF_CARD[name].columns}`
      })
      say(`  ${language} ${shape.name}: ${runway.join(', ')}`)
    }
  }

  say('\nRunway: Submission, the rest at realistic length')
  for (const language of Object.keys(COPY) as LanguageTag[]) {
    const copy = COPY[language]
    for (const shape of SHAPES) {
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
      say(`  ${language} ${shape.name}: Submission assignment ${assignment}, module ${module}`)
    }
  }

  // 4K: the same card, twice the pixels, must break the same way.
  const shape = SHAPES[0]!
  const one = fit(worstSubmission('ms-MY'), shape, FONTS)
  const two = fit(worstSubmission('ms-MY'), at4k(shape), FONTS)
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
