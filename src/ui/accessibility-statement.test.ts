/**
 * The accessibility statement (VH-130): the fragment that opens it, its
 * sentences cut around their links and dates in every language, and its
 * dates written as each language writes a date. The DOM — the panel opening,
 * staying open through a change of language, the links' targets — needs a
 * real browser and was checked in Chrome; what is pinned here is every
 * decision it is built from.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  ACCESSIBILITY_CONTACT_ADDRESS,
  EQUALITY_ADVISORY_SERVICE_URL,
  STATEMENT_NEXT_REVIEW_DATE,
  STATEMENT_PREPARED_DATE,
  WAVE_CHECK_DATE,
} from '../config/accessibility'
import { FEEDBACK_ADDRESS } from '../config/feedback'
import { compile } from '../i18n/compile'
import type { enGB } from '../i18n/en-GB'
import { LANGUAGE_TABLES } from '../i18n/index'
import { dateFormatter } from '../i18n/intl'
import { fragmentOpensStatement, messageParts, STATEMENT_ID } from './accessibility-statement'

const markup = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

describe('fragmentOpensStatement', () => {
  it('opens the statement for its own fragment', () => {
    expect(fragmentOpensStatement('#accessibility-statement')).toBe(true)
  })

  it('leaves it shut for no fragment, another one, or one that only looks like it', () => {
    for (const hash of ['', '#', '#main', '#Accessibility-statement', 'accessibility-statement']) {
      expect(fragmentOpensStatement(hash), hash).toBe(false)
    }
  })

  it('names the statement the page has, so a link to it lands on it', () => {
    expect(markup).toContain(`<details class="panel statement" id="${STATEMENT_ID}">`)
  })
})

describe('messageParts', () => {
  it('cuts a sentence around its one slot, keeping the words either side', () => {
    const english = compile<typeof enGB>(LANGUAGE_TABLES['en-GB']!)
    expect(messageParts(english.statement.contact.text, ['address'])).toEqual([
      {
        text: 'If you find a problem with this tool, or need its information in another way, email Joe Bell at ',
      },
      { slot: 'address' },
      { text: '.' },
    ])
  })

  it('keeps the slots in the order the language puts them, and drops empty pieces', () => {
    const both = (params: Readonly<Record<'first' | 'second', string>>): string =>
      `${params.second}${params.first} and nothing else`
    expect(messageParts(both, ['first', 'second'])).toEqual([
      { slot: 'second' },
      { slot: 'first' },
      { text: ' and nothing else' },
    ])
  })

  it.each(Object.entries(LANGUAGE_TABLES))(
    '%s puts each link and date in its sentence exactly once',
    (_tag, table) => {
      // A slot said twice would move its one link or date to the second
      // place; a slot missing would lose it. Either is a broken sentence.
      const words = compile<typeof enGB>(table).statement
      const sentences = [
        [words.contact.text, ['address']],
        [words.enforcement.text, ['service']],
        [words.testing.wave, ['date']],
        [words.about.dates, ['date', 'reviewDate']],
      ] as const
      for (const [message, names] of sentences) {
        const slots = messageParts(
          message as (params: Readonly<Record<string, string>>) => string,
          names,
        ).flatMap((part) => ('slot' in part ? [part.slot] : []))
        expect([...slots].sort()).toEqual([...names].sort())
      }
    },
  )
})

describe('the statement’s dates (VH-130)', () => {
  it('writes a date as each language writes one, long', () => {
    expect(dateFormatter('en-GB')(WAVE_CHECK_DATE)).toBe('18 October 2026')
    expect(dateFormatter('zh-Hans')(WAVE_CHECK_DATE)).toBe('2026年10月18日')
    expect(dateFormatter('ms-MY')(WAVE_CHECK_DATE)).toBe('18 Oktober 2026')
    expect(dateFormatter('en-GB')(STATEMENT_NEXT_REVIEW_DATE)).toBe('18 November 2026')
  })

  it('shows anything that is not a real ISO date as given, never a wrong day', () => {
    const write = dateFormatter('en-GB')
    // `Date` would roll 31 February on to 3 March without a word.
    expect(write('2026-02-31')).toBe('2026-02-31')
    expect(write('18/10/2026')).toBe('18/10/2026')
    expect(write('')).toBe('')
  })

  it('shows the ISO date where the locale cannot be formatted', () => {
    expect(dateFormatter('not a locale')(WAVE_CHECK_DATE)).toBe(WAVE_CHECK_DATE)
  })

  it('holds real dates, with the next review after the statement was written', () => {
    for (const date of [STATEMENT_PREPARED_DATE, STATEMENT_NEXT_REVIEW_DATE, WAVE_CHECK_DATE]) {
      expect(dateFormatter('en-GB')(date), date).not.toBe(date)
    }
    expect(STATEMENT_NEXT_REVIEW_DATE > STATEMENT_PREPARED_DATE).toBe(true)
  })
})

describe('where the statement sends a reader', () => {
  it('names the feedback address as its contact, not a second copy of it', () => {
    expect(ACCESSIBILITY_CONTACT_ADDRESS).toBe(FEEDBACK_ADDRESS)
  })

  it('links the advice service over a secure connection', () => {
    expect(new URL(EQUALITY_ADVISORY_SERVICE_URL).protocol).toBe('https:')
  })
})

describe('the advice service’s link (VH-135)', () => {
  const source = readFileSync(new URL('./accessibility-statement.ts', import.meta.url), 'utf8')
  /** How each language says a link opens in a new tab. */
  const NEW_TAB: Record<keyof typeof LANGUAGE_TABLES, string> = {
    'en-GB': '(new tab)',
    'zh-Hans': '在新标签页中打开',
    'ms-MY': 'dibuka dalam tab baharu',
  }

  it('opens in a new tab, sending no referrer', () => {
    // Inside a Xerte frame the service's site may refuse to load.
    expect(source).toMatch(/serviceLink\.target = '_blank'/)
    expect(source).toMatch(/serviceLink\.rel = 'noopener noreferrer'/)
  })

  it('says so in its own words, in every language (WCAG technique G201)', () => {
    for (const [tag, table] of Object.entries(LANGUAGE_TABLES)) {
      expect(table.statement.enforcement.service, tag).toContain(
        NEW_TAB[tag as keyof typeof NEW_TAB],
      )
    }
  })

  it('is the only link that changes: the contact address stays in this tab', () => {
    expect(source).not.toMatch(/contactLink\.(target|rel)\b/)
    expect(source.match(/\.target = /g)).toHaveLength(1)
  })
})
