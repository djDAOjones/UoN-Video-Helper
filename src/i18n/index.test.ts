/**
 * Switching the language (VH-105): every listener hears of a change once,
 * the words, the locale and the sentence gap follow it at once, a repeated
 * choice tells nobody, and a tag with no table shows English and says so —
 * so the page's `lang` never claims a language its words are not in.
 */

import { afterEach, describe, expect, it } from 'vitest'

import { DEFAULT_LANGUAGE, type LanguageTag } from '../config/languages'
import { enGB } from './en-GB'
import { language, locale, onLanguageChange, sentenceGap, setLanguage, t } from './index'
import { msMY } from './ms-MY'
import { zhHans } from './zh-Hans'

const stops: Array<() => void> = []

/** Listens for the length of one test, recording each tag it is told. */
function heard(): LanguageTag[] {
  const tags: LanguageTag[] = []
  stops.push(onLanguageChange((tag) => tags.push(tag)))
  return tags
}

afterEach(() => {
  for (const stop of stops.splice(0)) stop()
  setLanguage(DEFAULT_LANGUAGE)
})

describe('switching the language', () => {
  it('starts in English', () => {
    expect(language()).toBe('en-GB')
    expect(locale()).toBe('en-GB')
    expect(t().app.skipLink).toBe(enGB.app.skipLink)
  })

  it('tells every listener once, with the tag chosen', () => {
    const first = heard()
    const second = heard()
    setLanguage('zh-Hans')
    expect(first).toEqual(['zh-Hans'])
    expect(second).toEqual(['zh-Hans'])
  })

  it('has the words, the locale and the sentence gap follow at once', () => {
    setLanguage('zh-Hans')
    expect(t().app.skipLink).toBe(zhHans.app.skipLink)
    expect(t().language.switched({ name: '中文' })).toBe(
      zhHans.language.switched.replace('{name}', '中文'),
    )
    expect(locale()).toBe('zh-Hans')
    expect(sentenceGap()).toBe('')
    expect(language()).toBe('zh-Hans')

    setLanguage('ms-MY')
    expect(t().app.skipLink).toBe(msMY.app.skipLink)
    expect(locale()).toBe('ms-MY')
    expect(sentenceGap()).toBe(' ')
    expect(language()).toBe('ms-MY')
  })

  it('tells nobody when the language chosen is the one shown', () => {
    setLanguage('ms-MY')
    const tags = heard()
    setLanguage('ms-MY')
    expect(tags).toEqual([])
    setLanguage('en-GB')
    setLanguage('en-GB')
    expect(tags).toEqual(['en-GB'])
  })

  it('stops telling a listener that has stopped listening', () => {
    const tags: LanguageTag[] = []
    const stop = onLanguageChange((tag) => tags.push(tag))
    setLanguage('zh-Hans')
    stop()
    setLanguage('ms-MY')
    expect(tags).toEqual(['zh-Hans'])
  })

  it('shows English for a tag with no table, and says the page is in English', () => {
    // A tag the type allows but no table answers: what a language turned on
    // before its table exists would be. Cast, because every real tag has one.
    const untranslated = 'fr-FR' as LanguageTag
    const tags = heard()
    setLanguage(untranslated)
    expect(tags).toEqual([untranslated])
    expect(t().app.skipLink).toBe(enGB.app.skipLink)
    expect(locale()).toBe('en-GB')
    expect(language()).toBe('en-GB')
  })
})
