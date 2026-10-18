/**
 * The remembered language (VH-105): read back only when it is still offered,
 * never thrown over by a store that refuses, and kept under the one key the
 * config names — this browser's, and nothing that leaves the device.
 */

import { describe, expect, it } from 'vitest'

import { LANGUAGE_PREFERENCE_KEY, type LanguageTag } from '../config/languages'
import { readLanguagePreference, writeLanguagePreference } from './preference'

const ALL: readonly LanguageTag[] = ['en-GB', 'zh-Hans', 'ms-MY']

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

describe('reading the remembered language', () => {
  it('gives back a remembered language that is still offered', () => {
    const store = memoryStore({ [LANGUAGE_PREFERENCE_KEY]: 'zh-Hans' })
    expect(readLanguagePreference(store, ALL)).toBe('zh-Hans')
  })

  it('falls back when the language remembered is no longer offered', () => {
    // Turned off since it was chosen: English, not a page nobody offers.
    const store = memoryStore({ [LANGUAGE_PREFERENCE_KEY]: 'ms-MY' })
    expect(readLanguagePreference(store, ['en-GB', 'zh-Hans'])).toBeNull()
  })

  it('ignores anything that is not an offered tag', () => {
    for (const junk of ['', 'zh', 'ZH-HANS', 'fr-FR', ' en-GB', '{"tag":"en-GB"}']) {
      expect(
        readLanguagePreference(memoryStore({ [LANGUAGE_PREFERENCE_KEY]: junk }), ALL),
        junk,
      ).toBeNull()
    }
  })

  it('reads nothing from a store that is empty, missing or refuses', () => {
    expect(readLanguagePreference(memoryStore(), ALL)).toBeNull()
    expect(readLanguagePreference(null, ALL)).toBeNull()
    expect(readLanguagePreference(refusing, ALL)).toBeNull()
  })
})

describe('remembering the language', () => {
  it('reads back what it wrote, under the config’s key, and the latest choice wins', () => {
    const store = memoryStore()
    writeLanguagePreference(store, 'ms-MY')
    expect(store.entries.get(LANGUAGE_PREFERENCE_KEY)).toBe('ms-MY')
    expect(readLanguagePreference(store, ALL)).toBe('ms-MY')
    writeLanguagePreference(store, 'en-GB')
    expect(readLanguagePreference(store, ALL)).toBe('en-GB')
    // One key, the tag alone: nothing else about the page is kept.
    expect([...store.entries.keys()]).toEqual([LANGUAGE_PREFERENCE_KEY])
  })

  it('carries on when the store refuses, or there is none', () => {
    expect(() => writeLanguagePreference(refusing, 'zh-Hans')).not.toThrow()
    expect(() => writeLanguagePreference(null, 'zh-Hans')).not.toThrow()
  })
})
