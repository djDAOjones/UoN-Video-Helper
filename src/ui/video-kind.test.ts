/**
 * The switch's side, remembered (VH-131): read back only when it is a side
 * the config knows, never thrown over by a store that refuses, and kept under
 * the one key the config names. And the line beneath, quoting the words the
 * card would carry.
 */

import { describe, expect, it } from 'vitest'

import { VIDEO_KIND_PREFERENCE_KEY } from '../config/video-kind'
import { setLanguage, t } from '../i18n'
import { readVideoKindPreference, videoKindResultText, writeVideoKindPreference } from './video-kind'

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

describe('reading the remembered side', () => {
  it('gives back a side the config knows', () => {
    const store = memoryStore({ [VIDEO_KIND_PREFERENCE_KEY]: 'submission' })
    expect(readVideoKindPreference(store)).toBe('submission')
  })

  it('ignores anything else', () => {
    for (const junk of ['', 'Submission', 'student', 'staff ', '{"kind":"staff"}']) {
      expect(readVideoKindPreference(memoryStore({ [VIDEO_KIND_PREFERENCE_KEY]: junk })), junk).toBeNull()
    }
  })

  it('reads nothing from a store that is empty, missing or refuses', () => {
    expect(readVideoKindPreference(memoryStore())).toBeNull()
    expect(readVideoKindPreference(null)).toBeNull()
    expect(readVideoKindPreference(refusing)).toBeNull()
  })
})

describe('remembering the side', () => {
  it('reads back what it wrote, under the config’s key, and the latest choice wins', () => {
    const store = memoryStore()
    writeVideoKindPreference(store, 'submission')
    expect(store.entries.get(VIDEO_KIND_PREFERENCE_KEY)).toBe('submission')
    expect(readVideoKindPreference(store)).toBe('submission')
    writeVideoKindPreference(store, 'staff')
    expect(readVideoKindPreference(store)).toBe('staff')
    expect([...store.entries.keys()]).toEqual([VIDEO_KIND_PREFERENCE_KEY])
  })

  it('carries on when the store refuses, or there is none', () => {
    expect(() => writeVideoKindPreference(refusing, 'submission')).not.toThrow()
    expect(() => writeVideoKindPreference(null, 'submission')).not.toThrow()
  })
})

describe('the line under the switch', () => {
  it('says what each side means for the closing, in English', () => {
    expect(videoKindResultText('staff')).toBe(
      'You choose the closing graphics, and whether they say “Internal use only”.',
    )
    expect(videoKindResultText('submission')).toBe(
      'If the video has closing graphics, they say “Internal use only”.',
    )
  })

  it('quotes the words the card carries, in each language', () => {
    for (const tag of ['zh-Hans', 'ms-MY', 'en-GB'] as const) {
      setLanguage(tag)
      for (const kind of ['staff', 'submission'] as const) {
        expect(videoKindResultText(kind), `${tag} ${kind}`).toContain(t().closing.internalWords)
      }
    }
  })
})
