/**
 * The translator's sheet (VH-105): one row per message in the English table,
 * keyed by its dotted path, with where it shows on the page, notes that keep
 * a translation's placeholders and variants straight, and an empty column
 * per language. `scripts/strings-sheet.mjs` writes it as .csv and .xlsx; a
 * filled sheet comes back through {@link parseCsv} and becomes a table.
 *
 * Dev tooling only — nothing in the app imports this — and pure, so the rows
 * and the CSV round trip are tested in Node.
 */

import type { LanguageTag } from '../config/languages'
import { isCountGroup, placeholdersOf } from './compile'
import { enGB } from './en-GB'
import type { Messages } from './index'

/** One message: its key and its English. */
export interface Message {
  readonly key: string
  readonly english: string
}

/** Every message in a table, in the table's order, `meta` left out: it is set per table, never translated. */
export function messagesOf(table: object, prefix = ''): Message[] {
  const messages: Message[] = []
  for (const [key, value] of Object.entries(table)) {
    if (prefix === '' && key === 'meta') continue
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') messages.push({ key: path, english: value })
    else if (value !== null && typeof value === 'object')
      messages.push(...messagesOf(value as object, path))
  }
  return messages
}

/** The node at a dotted path, or `undefined`. */
function nodeAt(table: object, path: readonly string[]): unknown {
  let node: unknown = table
  for (const part of path) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return node
}

/** Where each group of messages shows; the longest matching prefix wins. */
const WHERE: ReadonlyArray<readonly [string, string]> = [
  ['app.title', 'The page heading, and the title in the browser tab'],
  [
    'app.description',
    'Not shown on the page: its description for search engines and link previews',
  ],
  ['app.skipLink', 'A link at the very top, seen when moving through the page with the Tab key'],
  ['language.label', 'The label over the language switcher at the top of the page'],
  ['language.switched', 'Not shown: read out by screen readers when the language changes'],
  [
    'language.machine',
    'Under the language switcher, only when the page is in Chinese or Malay: the note that a computer translated it',
  ],
  ['lede', 'Under the page heading: what the tool does'],
  ['browserNote', 'Under the page heading: the note about the browser'],
  ['videoKind', 'Above Step 1: the switch between a staff video and a student submission'],
  [
    'videoKind.result',
    'Above Step 1: the line under the switch, saying what the choice means for the closing',
  ],
  ['videoLanguage', 'Above Step 1: the choice of language for the words drawn into the video'],
  ['steps', 'The heading of each of the five steps'],
  ['choose', 'Step 1, Choose a video'],
  ['choose.drop', 'Step 1: the message when something is dropped on the drop area'],
  ['source', 'Step 1: what the video is, once it has been read'],
  ['source.rows', 'Step 1: Video properties, the name of each row'],
  ['source.losses', 'Step 1: the box listing what will not be carried into the new file'],
  ['trim', 'Step 2, Trim'],
  ['trim.problem', 'Step 2: the error beside a start or end time that cannot be used'],
  ['closing', 'Step 3, Closing branding'],
  [
    'closing.internalWords',
    'Not on the page: drawn on the finished video itself, on the closing card, under the University logo',
  ],
  ['closing.result', 'Step 3: the line under the controls saying what the closing will do'],
  ['preset', 'Step 4, File size / quality'],
  ['create', 'Step 5, Create: buttons and labels'],
  ['status', 'Step 5: the status line under the buttons, also read out by screen readers'],
  ['status.verdictSpoken', 'Not shown: read out by screen readers when the device check finishes'],
  ['discard', 'Step 5: the question asked before an unsaved video is discarded'],
  ['discard.spoken', 'Not shown: read out by screen readers with the question'],
  ['result', 'Step 5: the finished video and its one-line summary'],
  ['result.closing', 'Step 5: the end of the summary "Made from …", saying how the video closes'],
  ['result.fellBackTo', 'Step 5: under the finished video, when its closing is not the one chosen'],
  ['progress', 'Step 5: the progress bar while the video is made'],
  ['progress.title', 'The title in the browser tab while the video is made'],
  ['progress.jobNotice', 'Step 5: said when the video starts being made'],
  ['preflight', 'Step 5: the device check, which says whether this computer can make the video'],
  ['preflight.headings', 'Step 5: the heading of the device check'],
  ['preflight.reasons', 'Step 5: one reason in the device check'],
  ['warnings', 'Step 5: warnings about the sound or the finished video'],
  ['warnings.spoken', 'Not shown: read out by screen readers'],
  ['announce', 'Not shown: read out by screen readers'],
  ['failure', 'An error box, in the step it affects'],
  ['failure.startup', 'Step 1: the error box when this browser cannot run the tool at all'],
  ['failure.captured', 'The Errors captured panel, when something in the tool goes wrong'],
  ['systemCheck', 'The System check at the foot of the page'],
  ['errors', 'The Errors captured panel, only shown when something in the tool goes wrong'],
  ['feedback', 'The Send feedback dialog'],
  [
    'statement',
    'The Accessibility statement at the foot of the page, a panel that opens: its running text',
  ],
  [
    'statement.heading',
    'The Accessibility statement at the foot of the page: the heading of the panel',
  ],
  [
    'statement.abilities',
    'The Accessibility statement: a list item, completing "You should be able to:"',
  ],
  ['statement.limits.heading', 'The Accessibility statement: a subheading'],
  [
    'statement.limits.items',
    'The Accessibility statement: a list item, under "How accessible this tool is"',
  ],
  ['statement.contact.heading', 'The Accessibility statement: a subheading'],
  ['statement.enforcement.heading', 'The Accessibility statement: a subheading'],
  ['statement.compliance.heading', 'The Accessibility statement: a subheading'],
  ['statement.testing.heading', 'The Accessibility statement: a subheading'],
  ['statement.plans.heading', 'The Accessibility statement: a subheading'],
  [
    'statement.plans.items',
    'The Accessibility statement: a list item, completing "We are thinking of:"',
  ],
  ['statement.about.heading', 'The Accessibility statement: a subheading'],
  [
    'footer.contact.intro',
    'The foot of the page, under the Send feedback button: the line over the two team links',
  ],
  [
    'footer.contact.creators',
    'The foot of the page, under the Send feedback button: a link that opens an email to the creators team',
  ],
  [
    'footer.contact.learningContent',
    'The foot of the page, under the Send feedback button: a link that opens an email to the learning content team',
  ],
  ['save', 'Step 5: saving the finished video'],
  ['save.pickerDescription', 'The save dialog, naming the kind of file'],
  ['save.stem', 'The name suggested for the saved file'],
  ['save.marks', 'The name suggested for the saved file'],
  ['save.fileName', 'The name suggested for the saved file'],
  ['format', 'Wherever a length, size or picture fact is shown, mostly Step 1, Video properties'],
]

/** What each placeholder stands for. */
const PLACEHOLDERS: Readonly<Record<string, string>> = {
  count: 'a number',
  seconds: 'a number of seconds',
  degrees: 'a number of degrees',
  kilohertz: 'a number',
  hertz: 'a number',
  width: 'a number of pixels',
  height: 'a number of pixels',
  rate: 'a frame rate, like "25 frames a second"',
  duration: 'a length of time in words, like "4 minutes 12 seconds"',
  kept: 'a length of time in words',
  length: 'a time, like 2:10.4',
  from: 'a time, like 0:30.0',
  to: 'a time, like 2:30.0',
  time: 'a length of time in words',
  size: 'a file size, like "120 MB"',
  name: "a name: a language's own name, or the user's file name",
  facts:
    'a list of facts about the video, like "4 minutes 12 seconds, 1920 × 1080, stereo (two channels)"',
  found: 'a list, like "2 caption tracks and 1 chapter track"',
  remedy: 'another sentence from this sheet, saying what to do',
  smaller: 'the name of the smaller output, from preset.labels.smaller',
  best: 'the name of the larger output, from preset.labels.best',
  notice: 'another sentence from this sheet (progress.jobNotice)',
  sentence: 'an error message from this sheet',
  heading: 'a heading from this sheet',
  titles: 'warning headings from this sheet, one after another',
  question: 'the question from discard.delivered or discard.unsaved',
  adds: 'the sentence from closing.result.adds',
  stage: 'a stage name from progress.stages',
  percent: 'a percentage, like 14%',
  milestone: 'a phrase from progress.milestones',
  app: 'the product name, from app.title',
  part: 'what part of the video was kept, from result.keptWhole or result.keptPart',
  output: 'the output chosen, from preset.labels',
  closing: 'how the video closes, from result.closing…',
  title: 'a heading from this sheet',
  detail: 'a sentence from this sheet',
  address: 'an email address',
  stem: "the user's own file name, without its ending",
  mark: 'a word from save.marks',
  where: 'save.downloadIos or save.downloadOther',
  result: 'a count from systemCheck.results',
  date: 'a date the app writes in your language, like "18 October 2026"',
  reviewDate: 'the date of the next review, written by the app, like "18 November 2026"',
  service:
    "the advice service's name, from statement.enforcement.service, as a link to its website",
  words: 'the words drawn on the closing card, from closing.internalWords',
}

/** What a key's last parts say about when the message is used. */
function variantNote(path: readonly string[]): string[] {
  const notes: string[] = []
  const last = path[path.length - 1]!
  const parent = nodeAt(enGB, path.slice(0, -1))
  if (parent !== null && typeof parent === 'object' && isCountGroup(parent)) {
    const numbered = Object.keys(parent).filter((key) => /^\d+$/.test(key))
    if (last === 'one') notes.push('Used when the count is 1.')
    else if (/^\d+$/.test(last)) notes.push(`Used when the count is ${last}, said in words.`)
    else if (numbered.length > 0)
      notes.push(`Used for any count above ${numbered[numbered.length - 1]}, in digits.`)
    else notes.push('Used for any count other than 1. Fill it even if your language has one form.')
  }
  for (const part of path) {
    if (part === 'blue' || part === 'white') notes.push(`Used when the closing colour is ${part}.`)
    if (part === 'fade' && path[0] !== 'closing') notes.push('Used when the closing fades in.')
    if (part === 'slide' && path[0] !== 'closing') notes.push('Used when the closing slides in.')
  }
  if (path[0] === 'closing' && path[1] === 'result' && (last === 'fade' || last === 'slide')) {
    notes.push(`Used when the closing ${last === 'fade' ? 'fades' : 'slides'} in.`)
  }
  if (path.includes('problem') && (last === 'start' || last === 'end'))
    notes.push(`About the ${last} time.`)
  return notes
}

/** The note on each line of a list that completes the sentence above it (VH-130). */
const COMPLETES_ABLE_TO =
  'Completes "You should be able to:", so it starts in lower case, as the English does, and has no full stop.'
const COMPLETES_THINKING_OF =
  'Completes "We are thinking of:", so it starts in lower case, as the English does, and has no full stop.'

/** The same note on every line of a list, keyed `prefix.0`, `prefix.1` and on. */
function listNotes(prefix: string, items: readonly string[], note: string): Record<string, string> {
  return Object.fromEntries(items.map((_, index) => [`${prefix}.${index}`, note]))
}

/** Notes for single keys, where the key and its English need more. */
const NOTES: Readonly<Record<string, string>> = {
  'app.title': 'The product name. UoN stands for University of Nottingham.',
  'language.label': 'The label over the language switcher, also read out by screen readers.',
  'language.machine.title': 'The heading of the note, so no full stop.',
  'language.machine.link':
    'The words of a link that opens an email to the maintainer, with your language in its subject.',
  'lede.intro': 'Introduces the three lines that follow.',
  'trim.format': 'Keep the example times 1:05.5 and 65.5 as they are.',
  'trim.problem.notATime.start': 'Keep the example times 1:05.5 and 65.5 as they are.',
  'trim.problem.notATime.end': 'Keep the example times 1:05.5 and 65.5 as they are.',
  'trim.handleBeginning': 'Completes "Start, at the beginning" for screen readers.',
  'trim.handleEnd': 'Completes "End, at the end" for screen readers.',
  'closing.helpExistingText': 'Follows "Over existing" on the same line, so it starts with a dash.',
  'closing.helpFreezeText':
    'Follows "Over generated freeze frame" on the same line, so it starts with a dash.',
  'closing.notUsedWith.cut':
    'Names the animation type "Cut"; use the same word as closing.types.cut.',
  'closing.notUsedWith.none':
    'Names the animation type "None"; use the same word as closing.types.none.',
  'videoKind.label': 'The label over the switch, also read out by screen readers.',
  'videoLanguage.label':
    'The label over the choice, also read out by screen readers. Use the same word for "video" as videoKind.label and for "language" as language.label.',
  'videoLanguage.helper':
    'The words the app draws into the video, such as closing.internalWords, follow this choice; the page itself does not.',
  'closing.internalForSubmission':
    'Why the "Internal use only" checkbox cannot be unticked. Use the same words for "student submission" as videoKind.options.submission.',
  'closing.internalLabel':
    'The label of a checkbox that adds the words of closing.internalWords to the closing card. Use the same words.',
  'closing.internalWords':
    'Drawn in bold under the logo at the end of the video, like a stamp on a document, so it must fit on one line: keep it about as short as the English. A change here means the closing videos are built again.',
  'result.closingInternal':
    'Adds to how the video closes, like "a cut to the blue closing card, marked “Internal use only”". Keep the quotation marks.',
  'preset.labels.best': 'The name of the larger output. Other rows quote it.',
  'preset.labels.smaller': 'The name of the smaller output. Other rows quote it.',
  'systemCheck.marks.pass': 'A one-word mark beside a check that passed.',
  'systemCheck.marks.fail': 'A one-word mark beside a check that failed.',
  'systemCheck.marks.warn':
    'A mark, not a word: keep it as it is unless your language uses another.',
  'systemCheck.marks.pending': 'A mark, not a word: keep it as it is.',
  'save.stem': 'Used as the file name when the original has none.',
  'save.marks.branded':
    'Goes in brackets in the saved file\'s name, like "Lecture 3 (branded).mp4".',
  'save.marks.levelled': "Goes in brackets in the saved file's name.",
  'save.marks.converted': "Goes in brackets in the saved file's name.",
  'save.fileName': 'Keep the brackets and .mp4.',
  'progress.milestones.0': 'Follows a stage name, like "Encoding video — a quarter done".',
  'progress.milestones.1': 'Follows a stage name, like "Encoding video — half done".',
  'progress.milestones.2': 'Follows a stage name, like "Encoding video — three quarters done".',
  'format.unknown': 'Shown alone in place of a fact the app could not read.',
  'statement.heading':
    'The heading of the panel, so no full stop. A formal statement, as on any official website.',
  'statement.covers':
    'UoN Video Helper is the product name: use the same name as app.title. Keep the name Joe Bell as it is. A formal statement: use a formal register throughout.',
  'statement.aim': 'Introduces the five lines that follow, which complete its last sentence.',
  ...listNotes('statement.abilities', enGB.statement.abilities, COMPLETES_ABLE_TO),
  'statement.limits.intro': 'Introduces the five lines that follow.',
  'statement.limits.items.0': 'Keep the name Google Chrome as it is.',
  'statement.limits.items.1': '"Malay" is the language this page calls Bahasa Malaysia.',
  'statement.limits.items.4':
    'Keep MB, GB, H.264 and AAC as they are: these short forms are what the sentence is about.',
  'statement.contact.text':
    'Keep the name Joe Bell as it is. The email address is shown as a link.',
  'statement.enforcement.text':
    'The Equality and Human Rights Commission is an official UK body: give its English name with a translation in brackets, or name it as your language normally would.',
  'statement.enforcement.service':
    'The name of an official UK advice service, shown as a link to its website. Give its English name with a translation in brackets, or name it as your language normally would.',
  'statement.compliance.text':
    'Keep WCAG, AA and AAA as they are; 2.2 is a version number. Use the usual name in your language for the Web Content Accessibility Guidelines, if there is one.',
  'statement.testing.wave':
    'Keep the names WAVE and WebAIM as they are. The score is 10 out of 10.',
  'statement.testing.manual': 'Keep the name Chrome as it is.',
  'statement.plans.intro':
    'Introduces the six lines that follow, which complete its last sentence.',
  ...listNotes('statement.plans.items', enGB.statement.plans.items, COMPLETES_THINKING_OF),
  'statement.plans.items.1': `${COMPLETES_THINKING_OF} Keep the names NVDA, Chrome, Windows, VoiceOver and Mac as they are.`,
  'statement.plans.items.3':
    'Completes "We are thinking of:", so it has no full stop. Keep the name Windows as it is.',
  'statement.plans.items.4': `${COMPLETES_THINKING_OF} Keep axe and Lighthouse as they are: they are the names of tools.`,
  'statement.about.dates': 'Keep the name Joe Bell as it is.',
  'footer.contact.intro':
    'Introduces the two links that follow, one under the other. Each link makes sense on its own.',
  'footer.contact.creators':
    'The words of a link on a line of its own, so they must say alone that it opens an email. "The creators team" is the name of a University team: translate it plainly, and use the same word for "team" as in footer.contact.learningContent.',
  'footer.contact.learningContent':
    'The words of a link on a line of its own, so they must say alone that it opens an email. "The learning content team" is the name of a University team: translate it plainly, and use the same word for "team" as in footer.contact.creators.',
}

/** A row of the translator's sheet. */
export interface SheetRow {
  readonly key: string
  readonly where: string
  readonly english: string
  readonly notes: string
}

/** Where a key shows, by the longest prefix in {@link WHERE}. */
export function whereShown(key: string): string {
  let best: readonly [string, string] | undefined
  for (const entry of WHERE) {
    const [prefix] = entry
    if (
      (key === prefix || key.startsWith(`${prefix}.`)) &&
      (!best || prefix.length > best[0].length)
    )
      best = entry
  }
  return best?.[1] ?? ''
}

/** The rows of the sheet, one per English message, in the table's order. */
export function sheetRows(): SheetRow[] {
  return messagesOf(enGB).map(({ key, english }) => {
    const notes = [...(NOTES[key] ? [NOTES[key]] : []), ...variantNote(key.split('.'))]
    const names = placeholdersOf(english)
    if (names.length > 0) {
      notes.push(
        `Keep ${names.map((name) => `{${name}}`).join(', ')} as written: ` +
          names
            .map((name) => `{${name}} is ${PLACEHOLDERS[name] ?? 'filled in by the app'}`)
            .join('; ') +
          '.',
      )
    }
    return { key, where: whereShown(key), english, notes: notes.join(' ') }
  })
}

/**
 * The languages the sheet carries a column for, by column heading, each with
 * the `meta` its table is written with — set here, never translated: Chinese
 * joins facts and sentences with full-width marks and no gap; Malay as English.
 */
export const SHEET_LANGUAGES = [
  {
    tag: 'zh-Hans',
    heading: 'Chinese (Simplified)',
    googleCode: 'zh-CN',
    meta: {
      locale: 'zh-Hans',
      durationList: 'narrow',
      separators: { list: '，', series: '；', sentences: '' },
    },
  },
  {
    tag: 'ms-MY',
    heading: 'Bahasa Malaysia',
    googleCode: 'ms',
    meta: {
      locale: 'ms-MY',
      durationList: 'narrow',
      separators: { list: ', ', series: '; ', sentences: ' ' },
    },
  },
] as const satisfies readonly {
  readonly tag: LanguageTag
  readonly heading: string
  readonly googleCode: string
  readonly meta: Messages['meta']
}[]

/** The filled sheet the zh-Hans and ms-MY tables are generated from (`scripts/strings-table.mjs`). */
export const FILLED_SHEET = 'reviews/2026-10-18/VH-105-strings-filled.csv'

/** The sheet's column headings, in order. */
export const SHEET_HEADINGS = [
  'key',
  'where it shows on the page',
  'English',
  'notes',
  ...SHEET_LANGUAGES.map(({ heading }) => heading),
] as const

/** A cell for CSV: quoted when it holds a comma, a quote or a line break. */
function csvCell(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * The sheet as CSV — UTF-8 with a byte-order mark, so Excel opens Chinese
 * correctly, and CRLF line ends, as RFC 4180 has them.
 */
export function toCsv(rows: readonly (readonly string[])[]): string {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
}

/** The sheet's rows as cells, headings first, with the language columns empty. */
export function sheetCells(): string[][] {
  return [
    [...SHEET_HEADINGS],
    ...sheetRows().map((row) => [
      row.key,
      row.where,
      row.english,
      row.notes,
      ...SHEET_LANGUAGES.map(() => ''),
    ]),
  ]
}

/**
 * CSV back into rows of cells: RFC 4180 quoting, either line end, a leading
 * byte-order mark ignored. What Google Sheets, Excel and Numbers write.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const source = text.startsWith('\uFEFF') ? text.slice(1) : text
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"'
        index++
      } else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') index++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += char
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

/** A filled sheet's translations in one language column, by key. Throws when the sheet has no such column. */
export function translationsFrom(
  cells: readonly (readonly string[])[],
  heading: string,
): Map<string, string> {
  const [headings = [], ...rows] = cells
  const keyColumn = headings.indexOf('key')
  const column = headings.indexOf(heading)
  if (keyColumn < 0 || column < 0) throw new Error(`The sheet has no "key" or "${heading}" column.`)
  return new Map(
    rows.filter((row) => row[keyColumn]).map((row) => [row[keyColumn]!, row[column] ?? '']),
  )
}

/** English's structure, `meta` left out, with each message replaced by its translation, collecting the keys left blank. */
function translate(
  node: object,
  prefix: string,
  translations: ReadonlyMap<string, string>,
  missing: string[],
): unknown {
  const entries = Object.entries(node)
    .filter(([key]) => prefix !== '' || key !== 'meta')
    .map(([key, value]): [string, unknown] => {
      const path = prefix ? `${prefix}.${key}` : key
      if (typeof value !== 'string')
        return [key, translate(value as object, path, translations, missing)]
      const text = translations.get(path) ?? ''
      if (text.trim() === '') missing.push(path)
      return [key, text]
    })
  return Array.isArray(node) ? entries.map(([, value]) => value) : Object.fromEntries(entries)
}

/**
 * A language table from a filled sheet's translations: English's keys, in
 * English's order, with the language's own `meta`. A key the sheet leaves
 * blank or lacks comes back in `missing`, so the caller refuses a partial table.
 */
export function tableFrom(
  translations: ReadonlyMap<string, string>,
  meta: Messages['meta'],
): { readonly table: Messages; readonly missing: readonly string[] } {
  const missing: string[] = []
  const table = { meta, ...(translate(enGB, '', translations, missing) as object) } as Messages
  return { table, missing }
}
