/**
 * Plain language, measured: spec 9.2 and 9.3 (WCAG 3.1.5, 3.1.3, 3.1.4), VH-114.
 *
 * Every string the page can show — the static markup, the message tables in
 * `src/ui/*.ts`, the strings in `src/main.ts`, `src/config/` and the worker's
 * error paths — is read here as text and held to two rules: prose reads at a
 * lower-secondary level, and every abbreviation it keeps has its meaning
 * beside it, bar the exceptions spec 9.3 records one by one.
 *
 * The reading level is Flesch–Kincaid grade, computed per string over the
 * sentences it holds. The estimate is rough on short interface sentences and
 * runs high on one-sentence strings, so the limit is one grade above the
 * lower-secondary band (grades 7 to 9) rather than inside it; a string that
 * trips it wants a shorter sentence or a plainer word, not a looser limit.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/** One grade above the top of lower-secondary; see the module comment. */
const READING_GRADE_LIMIT = 10
/** Strings this long are prose; shorter ones are labels, where the formula is noise. */
const PROSE_WORDS = 8

const root = new URL('../', import.meta.url)
const read = (path: string): string => readFileSync(new URL(path, root), 'utf8')

const FILES = [
  'index.html',
  'src/main.ts',
  'src/config/presets.ts',
  'src/config/branding.ts',
  'src/workers/job.worker.ts',
  'src/media/inspect.ts',
  'src/media/kept-range.ts',
  'src/media/save.ts',
  ...readdirSync(new URL('src/ui/', root))
    .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
    .map((name) => `src/ui/${name}`),
]

/** What a person would read, from one file: the markup's text, or a module's string literals. */
export function visibleStrings(path: string, source: string): string[] {
  if (path.endsWith('.html')) {
    return source
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<head>[\s\S]*?<\/head>/, '')
      .replace(/<script[\s\S]*?<\/script>/g, '')
      // Inline elements join their surroundings; block ones end a passage.
      // Source line breaks inside a passage are only wrapping.
      .replace(/<\/?(?:span|strong|em|b|i|code|a|abbr)\b[^>]*>/g, '')
      .replace(/<[^>]+>/g, '\u0000')
      .split('\u0000')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter((line) => line.length > 0)
  }
  // Block comments start on their own line here, and matching `/*` anywhere
  // ate from a `video/*` accept string to the next doc block, hiding the drop
  // zone's refusals from the check (Codex review of VH-114).
  const withoutComments = source.replace(/^\s*\/\*[\s\S]*?\*\//gm, '').replace(/^\s*\/\/.*$/gm, '')
  const strings: string[] = []
  for (const match of withoutComments.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
    const raw = match[1] ?? match[2] ?? match[3] ?? ''
    // A placeholder stands in for whatever is interpolated.
    const text = raw.replace(/\$\{[^}]*\}/g, '9').replace(/\\n/g, ' ').trim()
    if (text.length === 0) continue
    // Code, not copy: selectors, keys, log scopes, and a path or file name
    // on its own — never a sentence that happens to mention a file ending
    // (Codex review of VH-114).
    if (/[{}<>;=#]|^[a-z][a-z0-9-]*(?:[:.][a-z0-9-]+)*$|^[A-Za-z]+\/|https?:/.test(text)) continue
    if (!/\s/.test(text) && /^[./]|\.[a-z0-9]+$/.test(text)) continue
    strings.push(text)
  }
  return strings
}

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length === 0) return 0
  if (w.length <= 3) return 1
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups ? groups.length : 1)
}

/** Flesch–Kincaid grade over the sentences in `text`, or `null` with no words. */
export function readingGrade(text: string): number | null {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((part) => /\w/.test(part))
  const words = text.split(/\s+/).filter((word) => /[a-zA-Z]/.test(word))
  if (words.length === 0 || sentences.length === 0) return null
  const syllableCount = words.reduce((total, word) => total + syllables(word), 0)
  return 0.39 * (words.length / sentences.length) + 11.8 * (syllableCount / words.length) - 15.59
}

/**
 * Abbreviations the page keeps, each with the meaning that must sit beside
 * it in the same file (spec 9.2: an in-place meaning). A new abbreviation
 * fails here until it is given one, or recorded under spec 9.3.
 */
const MEANINGS: Readonly<Record<string, RegExp>> = {
  kHz: /samples a second/,
  MP4: /\.mp4/,
  WebCodecs: /video processing in the browser/i,
}

/**
 * Left unexpanded, each considered and recorded under spec 9.3 (doc-delta
 * 2026-10-01, VH-114): the units of file size every device's own screens
 * use; the product's name, whose logo beside it reads "University of
 * Nottingham"; and the codec names the Video properties disclosure shows as
 * read-only facts about the file, where expansion makes nothing plainer.
 */
const EXCEPTED = new Set([
  'MB', 'GB', 'kB', 'TB',
  'UoN',
  'H.264', 'H.265', 'VP8', 'VP9', 'AV1', 'ProRes', 'AAC', 'Opus', 'MP3', 'Vorbis', 'FLAC',
  // An ordinary word the pattern catches.
  'OK',
])

const ABBREVIATION = /\b(?:[A-Z][A-Za-z]?[A-Z0-9][A-Za-z0-9.]*|fps|kHz|kB|MB|GB|TB|dB)\b/g

describe('plain language, measured (spec 9.2, VH-114)', () => {
  const corpus = FILES.map((path) => ({ path, strings: visibleStrings(path, read(path)) }))

  it('reads every file it is told to', () => {
    for (const { path, strings } of corpus) expect(strings.length, path).toBeGreaterThan(0)
  })

  it('reads a sentence that mentions a file ending, and skips a bare path', () => {
    // The drop zone's refusal names ".mp4"; it is copy, and the check must
    // see it (Codex review of VH-114).
    const dropZone = corpus.find(({ path }) => path === 'src/ui/drop-zone.ts')
    expect(dropZone?.strings.some((text) => text.includes('ends .mp4'))).toBe(true)
    expect(visibleStrings('x.ts', "const a = './styles/app.css'; const b = 'video/mp4'")).toEqual([])
  })

  it('keeps prose at a lower-secondary reading level', () => {
    const over: string[] = []
    for (const { path, strings } of corpus) {
      for (const text of strings) {
        if (text.split(/\s+/).length < PROSE_WORDS) continue
        const grade = readingGrade(text)
        if (grade !== null && grade > READING_GRADE_LIMIT) over.push(`${path} (${grade.toFixed(1)}): ${text}`)
      }
    }
    expect(over, 'strings over the reading grade limit').toEqual([])
  })

  it('gives every abbreviation it keeps a meaning beside it', () => {
    const unexplained: string[] = []
    for (const { path, strings } of corpus) {
      const everything = strings.join('\n')
      for (const text of strings) {
        for (const found of text.match(ABBREVIATION) ?? []) {
          const token = found.replace(/\.$/, '')
          if (EXCEPTED.has(token)) continue
          const meaning = MEANINGS[token]
          if (meaning === undefined) unexplained.push(`${path}: "${token}" in "${text}" has no meaning recorded`)
          else if (!meaning.test(everything)) unexplained.push(`${path}: "${token}" is used without its meaning in that file`)
        }
      }
    }
    expect(unexplained).toEqual([])
  })

  it('keeps units and codec words off the main path', () => {
    const banned = /\bLUFS\b|\bLU\b|\bdBTP\b|\bdBFS\b|re-encod|bitrate|\bfps\b/
    const hits: string[] = []
    for (const { path, strings } of corpus) {
      for (const text of strings) if (banned.test(text)) hits.push(`${path}: ${text}`)
    }
    expect(hits).toEqual([])
  })
})

describe('sentences the spec names (VH-114)', () => {
  const page = read('index.html')
  it('says the preview plays the original (spec 9.1 step 2)', () => {
    expect(page).toMatch(/The preview plays your original as it is now/)
  })
  it('promises nothing about a reply (spec 9.2)', () => {
    expect(page).not.toMatch(/reply will come/)
  })
  it('says "picture size", and scopes the never-sent promise to the details (A-20)', () => {
    expect(page).toMatch(/picture size and format/)
    expect(page).toMatch(/These details never include the video/)
  })
})
