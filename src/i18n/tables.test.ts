/**
 * VH-105: every table has every message English has and keeps its
 * placeholders; the compiled API fills them in the table's own locale; the
 * page's static bindings all name a message; and the translator's sheet maps
 * onto the table row for row, and back.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { PRESETS } from '../config/presets'
import { attributeBindings, messageAt } from './bind'
import { compile, isCountGroup, placeholdersOf } from './compile'
import { enGB } from './en-GB'
import { LANGUAGE_TABLES, t } from './index'
import {
  FILLED_SHEET,
  messagesOf,
  parseCsv,
  sheetCells,
  sheetRows,
  SHEET_HEADINGS,
  SHEET_LANGUAGES,
  tableFrom,
  toCsv,
  translationsFrom,
} from './sheet'

const english = messagesOf(enGB)
const translated = Object.entries(LANGUAGE_TABLES).filter(([tag]) => tag !== 'en-GB')

/** The same placeholders, as a sorted list, so order may change but names may not. */
const names = (template: string): string[] => placeholdersOf(template).sort()

describe('every table', () => {
  it.each(translated)('%s has every key English has, and no other', (_tag, table) => {
    expect(messagesOf(table).map(({ key }) => key)).toEqual(english.map(({ key }) => key))
  })

  it.each(translated)('%s keeps every placeholder English has, by name', (_tag, table) => {
    const own = new Map(messagesOf(table).map(({ key, english: text }) => [key, text]))
    for (const { key, english: text } of english) {
      expect(names(own.get(key) ?? ''), key).toEqual(names(text))
    }
  })

  it.each(translated)(
    '%s fills every message, with no English left untranslated by mistake',
    (_tag, table) => {
      for (const { key, english: text } of messagesOf(table)) expect(text.trim(), key).not.toBe('')
    },
  )

  it('names the outputs as the config does, so a diagnostics line and the screen agree', () => {
    expect(enGB.preset.labels.best).toBe(PRESETS.best.label)
    expect(enGB.preset.labels.smaller).toBe(PRESETS.smaller.label)
  })
})

describe('the compiled table', () => {
  it('leaves a message without placeholders as a string', () => {
    expect(t().trim.start).toBe('Start')
  })

  it('writes a number in the locale’s own digits', () => {
    expect(t().source.sampleRate({ kilohertz: 48, hertz: 48000 })).toBe(
      '48 kHz — 48,000 samples a second',
    )
  })

  it('joins a list of nouns as the language does', () => {
    const chinese = compile<typeof enGB>(enGB, 'zh-Hans')
    expect(t().source.captionsFound({ found: ['a', 'b', 'c'] })).toBe('Found a, b and c')
    expect(chinese.source.captionsFound({ found: ['a', 'b', 'c'] })).toBe('Found a、b和c')
  })

  it('chooses one or other by the locale’s plural rules', () => {
    expect(t().source.captionTracks({ count: 1 })).toBe('1 caption track')
    expect(t().source.captionTracks({ count: 2 })).toBe('2 caption tracks')
    // Chinese has one form for every count, so its `other` is always the one.
    expect(compile<typeof enGB>(enGB, 'zh-Hans').source.captionTracks({ count: 1 })).toBe(
      '1 caption tracks',
    )
  })

  it('says a count in words where the table has one, and in digits beyond', () => {
    expect(t().preflight.headings.warnSeveral({ count: 3 })).toBe(
      'Ready, with three things to know',
    )
    expect(t().preflight.headings.warnSeveral({ count: 7 })).toBe('Ready, with 7 things to know')
    expect(t().announce.lossesCount({ count: 1 })).toBe(
      'One thing to know about what goes into the new file.',
    )
  })

  it('shows a missing parameter as written, never as "undefined"', () => {
    const fill = t().trim.keeping as (params: Record<string, string>) => string
    expect(fill({ kept: '1 minute' })).toBe('Keeping 1 minute of {duration}.')
  })

  it('treats only one-or-other and numbered groups as counts', () => {
    expect(isCountGroup(enGB.source.captionTracks)).toBe(true)
    expect(isCountGroup(enGB.announce.lossesCount)).toBe(true)
    expect(isCountGroup(enGB.format.channels)).toBe(false)
    expect(isCountGroup(enGB.closing.colours)).toBe(false)
  })
})

describe('the page’s static words', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
  const keys = [
    ...[...html.matchAll(/data-i18n="([^"]+)"/g)].map((match) => match[1]!),
    ...[...html.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap((match) =>
      attributeBindings(match[1]!).map(([, key]) => key),
    ),
  ]

  it('binds every element to a message the table has', () => {
    expect(keys.length).toBeGreaterThan(50)
    for (const key of keys) expect(messageAt(t(), key), key).toBeTypeOf('string')
  })

  it('keeps the no-script English the same as the table’s', () => {
    for (const match of html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)</g)) {
      const shown = match[2]!.replace(/\s+/g, ' ').trim()
      if (shown) expect(shown, match[1]).toBe(messageAt(t(), match[1]!))
    }
  })
})

describe('the translator’s sheet', () => {
  it('has one row per English message, in the table’s order, keyed as the table is', () => {
    expect(sheetRows().map(({ key, english: text }) => ({ key, english: text }))).toEqual(english)
  })

  it('says where every row shows', () => {
    for (const row of sheetRows()) expect(row.where, row.key).not.toBe('')
  })

  it('names every placeholder in the row’s notes', () => {
    for (const row of sheetRows()) {
      for (const name of placeholdersOf(row.english))
        expect(row.notes, row.key).toContain(`{${name}}`)
    }
  })

  it('gives each choice its own row: colour, animation, end and count', () => {
    const keys = new Set(sheetRows().map(({ key }) => key))
    for (const key of [
      'closing.result.overFreeze.white.slide',
      'result.fellBackToCut.blue.fade',
      'trim.problem.afterEnd.end',
      'source.captionTracks.one',
      'preflight.headings.warnSeveral.6',
      'announce.lossesCount.other',
    ]) {
      expect(keys.has(key), key).toBe(true)
    }
  })

  it('comes back from CSV exactly as it went out, quotes, commas and Chinese included', () => {
    const cells = [
      ...sheetCells(),
      ['k', 'w', 'He said "no", then left.\r\nNext line', 'n', '中文，带逗号', 'Bahasa'],
    ]
    expect(parseCsv(toCsv(cells))).toEqual(cells)
    expect(parseCsv(toCsv(cells))[0]).toEqual([...SHEET_HEADINGS])
  })
})

describe('a filled sheet', () => {
  const [chinese, malay] = SHEET_LANGUAGES
  /** The sheet as sent, with the Chinese column filled by `fill` and the Malay left empty. */
  const filled = (fill: (english: string) => string): string[][] =>
    sheetCells().map((row, index) => (index === 0 ? row : [...row.slice(0, 4), fill(row[2]!), '']))

  it('becomes a table with English’s keys in English’s order, and the language’s own meta', () => {
    const { table, missing } = tableFrom(
      translationsFrom(
        filled((text) => text),
        chinese.heading,
      ),
      enGB.meta,
    )
    expect(missing).toEqual([])
    expect(table).toEqual(enGB)
    expect(messagesOf(table)).toEqual(english)
    expect(
      tableFrom(
        translationsFrom(
          filled((text) => text),
          chinese.heading,
        ),
        chinese.meta,
      ).table.meta,
    ).toEqual(chinese.meta)
  })

  it('names every row it leaves blank, so no partial table is written', () => {
    const cells = filled((text) => text)
    cells[1]![4] = '  '
    expect(tableFrom(translationsFrom(cells, chinese.heading), chinese.meta).missing).toEqual([
      english[0]!.key,
    ])
    expect(tableFrom(translationsFrom(cells, malay.heading), malay.meta).missing).toHaveLength(
      english.length,
    )
  })

  it('refuses a sheet without the language’s column', () => {
    expect(() =>
      translationsFrom(
        [
          ['key', 'English'],
          ['app.title', 'UoN Video Helper'],
        ],
        chinese.heading,
      ),
    ).toThrow(chinese.heading)
  })

  it.each(SHEET_LANGUAGES.map((language) => [language.tag, language] as const))(
    'the %s table is the filled sheet, regenerated',
    (tag, { heading, meta }) => {
      const cells = parseCsv(
        readFileSync(new URL(`../../${FILLED_SHEET}`, import.meta.url), 'utf8'),
      )
      expect(LANGUAGE_TABLES[tag]).toEqual(tableFrom(translationsFrom(cells, heading), meta).table)
    },
  )
})

// VH-142: form and naming are shared even while translations await colleagues.
describe('consistent page words (VH-142)', () => {
  it.each(Object.entries(LANGUAGE_TABLES))('%s uses typographic quotation marks', (_tag, table) => {
    for (const { key, english: text } of messagesOf(table)) {
      expect(text, key).not.toContain('"')
    }
  })

  it.each(Object.entries(LANGUAGE_TABLES))('%s names the button under its captured error', (_tag, table) => {
    expect(table.failure.captured).toContain(table.errors.report)
  })

  it('Chinese pending states use one ellipsis, and save refusals still offer saving', () => {
    const zh = LANGUAGE_TABLES['zh-Hans']!
    for (const { key, english: text } of messagesOf(zh)) {
      for (const mark of text.matchAll(/…+/g)) expect(mark[0], key).toBe('……')
    }
    expect(zh.status.saveStopped).toContain('再次尝试保存')
    expect(zh.status.notSaved).toContain('再次尝试保存')
    expect(zh.create.create).toContain(zh.steps.create)
    for (const text of [zh.create.discard, zh.discard.title, zh.systemCheck.values.aacNotSupported]) {
      expect(text).not.toMatch(/。$/)
    }
  })
})

// VH-149: VH-148's "closing graphics", put in word for word, broke sentences
// in the translations; each check is one way it did.
describe('the closing graphics, word for word (VH-149)', () => {
  it.each(Object.entries(LANGUAGE_TABLES))('%s starts every sentence after a stop with a capital', (_tag, table) => {
    for (const { key, english: text } of messagesOf(table)) {
      expect(text, key).not.toMatch(/[.!?] +\p{Ll}/u)
    }
  })

  it('Chinese trims the start or the end of the video, never its closing graphics', () => {
    const zh = LANGUAGE_TABLES['zh-Hans']!
    expect(zh.trim.intro).toContain('剪掉开头或结尾不需要的内容')
    expect(zh.trim.intro).not.toContain('结尾图形不需要')
  })

  it("keeps the statement's first sentence as it was, less the one VH-148 dropped", () => {
    expect(LANGUAGE_TABLES['zh-Hans']!.statement.covers).toBe('本声明适用于 UoN 视频助手，即您当前所在的页面。')
    const ms = LANGUAGE_TABLES['ms-MY']!
    expect(ms.statement.covers).toBe(
      'Kenyataan ini meliputi Pembantu Video UoN, iaitu halaman yang sedang anda gunakan.',
    )
    // One word for the statement: its heading's.
    expect(ms.statement.covers.split(' ')[0]).toBe(ms.statement.heading.split(' ')[0])
  })
})
