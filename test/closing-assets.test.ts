/**
 * VH-126: the Internal use only tails the app can ask for are shipped, and
 * carry the words the tables have now.
 *
 * The words are drawn into the files by `scripts/build-branding.mjs`, which
 * no test can run (it needs ffmpeg, the masters and a Mac), so the script
 * records what it drew beside them. A translation corrected through the
 * sheet changes the table and not the files: this is what says so.
 */

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  CLOSING_COLOURS,
  CLOSING_INTERNAL_WORDS_RECORD,
  closingInternalTailName,
} from '../src/config/branding'
import { LANGUAGES_OFFERED } from '../src/config/languages'
import { closingWords } from '../src/i18n'

const branding = new URL('../public/branding/', import.meta.url)

describe('the Internal use only tails', () => {
  it.each(LANGUAGES_OFFERED)('are shipped for %s, in both colours at both heights', (language) => {
    for (const colour of CLOSING_COLOURS) {
      for (const height of [1080, 2160] as const) {
        const name = closingInternalTailName(language, colour, height)
        expect(existsSync(new URL(name, branding)), name).toBe(true)
      }
    }
  })

  it('carry the words the tables have now; if not, run node scripts/build-branding.mjs --only internal', () => {
    const record: unknown = JSON.parse(
      readFileSync(new URL(CLOSING_INTERNAL_WORDS_RECORD, branding), 'utf8'),
    )
    expect(record).toEqual(
      Object.fromEntries(LANGUAGES_OFFERED.map((language) => [language, closingWords(language)])),
    )
  })
})
