/**
 * The video's text language (VH-132): the page's until someone picks one, a
 * pick read back only when it is a language offered, never thrown over by a
 * store that refuses, kept under its own key; and the words it quotes marked
 * in their own language when the page is in another.
 */

import { afterEach, describe, expect, it } from 'vitest'

import {
  LANGUAGE_PREFERENCE_KEY,
  LANGUAGES_OFFERED,
  VIDEO_LANGUAGE_PREFERENCE_KEY,
  type LanguageTag,
} from '../config/languages'
import { closingWords, setLanguage } from '../i18n'
import { closingResultText } from './closing-choice'
import { videoKindResultText } from './video-kind'
import {
  quotedWordsParts,
  readVideoLanguagePreference,
  videoLanguageFor,
  writeVideoLanguagePreference,
} from './video-language'

/** A store over a map, so what was written can be read straight back. */
function memoryStore(initial: Record<string, string> = {}): Pick<Storage, 'getItem' | 'setItem'> & {
  readonly entries: Map<string, string>
} {
  const entries = new Map(Object.entries(initial))
  return {
    entries,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => void entries.set(key, value),
  }
}

/** A private window's store, or one whose site data is blocked: every call throws. */
const refusing: Pick<Storage, 'getItem' | 'setItem'> = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

afterEach(() => setLanguage('en-GB'))

describe('which language the video’s words are in', () => {
  it('follows the page’s until someone picks one', () => {
    for (const page of LANGUAGES_OFFERED) expect(videoLanguageFor(null, page)).toBe(page)
  })

  it('keeps a pick whatever the page’s is, the page’s own included', () => {
    for (const picked of LANGUAGES_OFFERED) {
      for (const page of LANGUAGES_OFFERED) expect(videoLanguageFor(picked, page)).toBe(picked)
    }
  })
})

describe('reading the remembered pick', () => {
  it('gives back a language offered', () => {
    const store = memoryStore({ [VIDEO_LANGUAGE_PREFERENCE_KEY]: 'ms-MY' })
    expect(readVideoLanguagePreference(store, LANGUAGES_OFFERED)).toBe('ms-MY')
  })

  it('ignores a language no longer offered, and anything else', () => {
    const store = memoryStore({ [VIDEO_LANGUAGE_PREFERENCE_KEY]: 'ms-MY' })
    expect(readVideoLanguagePreference(store, ['en-GB', 'zh-Hans'])).toBeNull()
    for (const junk of ['', 'ms', 'zh-CN', 'en-gb', ' en-GB', '{"tag":"en-GB"}']) {
      const junkStore = memoryStore({ [VIDEO_LANGUAGE_PREFERENCE_KEY]: junk })
      expect(readVideoLanguagePreference(junkStore, LANGUAGES_OFFERED), junk).toBeNull()
    }
  })

  it('is not the page’s language: a remembered page language is no pick', () => {
    const store = memoryStore({ [LANGUAGE_PREFERENCE_KEY]: 'zh-Hans' })
    expect(readVideoLanguagePreference(store, LANGUAGES_OFFERED)).toBeNull()
  })

  it('reads nothing from a store that is empty, missing or refuses', () => {
    expect(readVideoLanguagePreference(memoryStore(), LANGUAGES_OFFERED)).toBeNull()
    expect(readVideoLanguagePreference(null, LANGUAGES_OFFERED)).toBeNull()
    expect(readVideoLanguagePreference(refusing, LANGUAGES_OFFERED)).toBeNull()
  })
})

describe('remembering a pick', () => {
  it('reads back what it wrote, under its own key, and the latest pick wins', () => {
    const store = memoryStore()
    writeVideoLanguagePreference(store, 'zh-Hans')
    expect(store.entries.get(VIDEO_LANGUAGE_PREFERENCE_KEY)).toBe('zh-Hans')
    expect(readVideoLanguagePreference(store, LANGUAGES_OFFERED)).toBe('zh-Hans')
    writeVideoLanguagePreference(store, 'en-GB')
    expect(readVideoLanguagePreference(store, LANGUAGES_OFFERED)).toBe('en-GB')
    expect([...store.entries.keys()]).toEqual([VIDEO_LANGUAGE_PREFERENCE_KEY])
  })

  it('carries on when the store refuses, or there is none', () => {
    expect(() => writeVideoLanguagePreference(refusing, 'ms-MY')).not.toThrow()
    expect(() => writeVideoLanguagePreference(null, 'ms-MY')).not.toThrow()
  })
})

describe('the words quoted in their own language', () => {
  it('marks the words when they are not in the page’s language', () => {
    const words = closingWords('zh-Hans')
    expect(
      quotedWordsParts(`The card says “${words}” under the logo.`, words, 'zh-Hans', 'en-GB'),
    ).toEqual([
      { text: 'The card says “', lang: null },
      { text: words, lang: 'zh-Hans' },
      { text: '” under the logo.', lang: null },
    ])
  })

  it('leaves the text whole when the words are the page’s, or not there', () => {
    const text = 'The card says “Internal use only” under the logo.'
    expect(quotedWordsParts(text, 'Internal use only', 'en-GB', 'en-GB')).toEqual([
      { text, lang: null },
    ])
    expect(quotedWordsParts(text, closingWords('ms-MY'), 'ms-MY', 'en-GB')).toEqual([
      { text, lang: null },
    ])
    expect(quotedWordsParts(text, '', 'ms-MY', 'en-GB')).toEqual([{ text, lang: null }])
  })

  it('marks the last match, so a file name that holds the words is left alone', () => {
    const words = closingWords('ms-MY')
    const parts = quotedWordsParts(
      `Made from ${words}.mp4: Blue cut, “${words}”.`,
      words,
      'ms-MY',
      'en-GB',
    )
    expect(parts.map((part) => part.text).join('')).toBe(
      `Made from ${words}.mp4: Blue cut, “${words}”.`,
    )
    expect(parts.filter((part) => part.lang !== null)).toEqual([{ text: words, lang: 'ms-MY' }])
    expect(parts.at(-1)).toEqual({ text: '”.', lang: null })
  })

  it('drops an empty run at either end', () => {
    expect(quotedWordsParts('仅供内部使用', '仅供内部使用', 'zh-Hans', 'ms-MY')).toEqual([
      { text: '仅供内部使用', lang: 'zh-Hans' },
    ])
  })
})

describe('the lines that quote the words, in every page and video language', () => {
  const marked = { type: 'cut', onset: 'existing', colour: 'blue', internal: true } as const

  it('quote the video’s words, in the page’s sentence', () => {
    for (const page of LANGUAGES_OFFERED) {
      setLanguage(page)
      for (const video of LANGUAGES_OFFERED) {
        const words = closingWords(video)
        expect(closingResultText(marked, video), `${page} ${video}`).toContain(`${words}`)
        for (const kind of ['staff', 'submission'] as const) {
          expect(videoKindResultText(kind, video), `${page} ${video} ${kind}`).toContain(words)
        }
      }
    }
  })

  it('never quote another language’s words', () => {
    for (const page of LANGUAGES_OFFERED) {
      setLanguage(page)
      for (const video of LANGUAGES_OFFERED) {
        const others = LANGUAGES_OFFERED.filter((tag) => tag !== video).map((tag: LanguageTag) =>
          closingWords(tag),
        )
        for (const other of others) {
          expect(closingResultText(marked, video), `${page} ${video}`).not.toContain(other)
          expect(videoKindResultText('staff', video), `${page} ${video}`).not.toContain(other)
        }
      }
    }
  })

  it('follow the page’s language when no video language is given', () => {
    setLanguage('ms-MY')
    expect(closingResultText(marked)).toContain(closingWords('ms-MY'))
    expect(videoKindResultText('submission')).toContain(closingWords('ms-MY'))
  })
})
