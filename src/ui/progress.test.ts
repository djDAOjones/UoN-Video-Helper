/**
 * VH-109: progress that neither freezes nor chatters.
 */

import { describe, expect, it } from 'vitest'

import {
  NO_PROGRESS,
  outcomeTitle,
  progressView,
  readAnnounceProgress,
  writeAnnounceProgress,
} from './progress'

describe('progressView', () => {
  it('shows no percentage for a stage whose progress is not measured (U-07)', () => {
    const view = progressView('analysing', 0, NO_PROGRESS, true)
    expect(view.shown).toBe('Analysing audio')
    expect(view.indeterminate).toBe(true)
    expect(progressView('checking', 0, NO_PROGRESS, true).shown).toBe('Checking the file')
  })

  it('shows the percentage where it is measured', () => {
    const view = progressView('encoding', 0.634, NO_PROGRESS, true)
    expect(view.shown).toBe('Encoding video — 63%')
    expect(view.indeterminate).toBe(false)
  })

  it('announces a stage change once, then only milestones (U-08)', () => {
    let memo = NO_PROGRESS
    const said: string[] = []
    const report = (stage: 'analysing' | 'encoding', fraction: number): void => {
      const view = progressView(stage, fraction, memo, true)
      memo = view.memo
      if (view.announce) said.push(view.announce)
    }
    report('analysing', 0)
    report('analysing', 0)
    for (let percent = 0; percent <= 100; percent++) report('encoding', percent / 100)
    expect(said).toEqual([
      'Analysing audio',
      'Encoding video',
      'Encoding video — a quarter done',
      'Encoding video — half done',
      'Encoding video — three quarters done',
    ])
  })

  it('says the later milestone when two are passed at once, and never twice', () => {
    const first = progressView('encoding', 0.1, { stage: 'encoding', milestone: -1 }, true)
    expect(first.announce).toBeNull()
    const jump = progressView('encoding', 0.6, first.memo, true)
    expect(jump.announce).toBe('Encoding video — half done')
    expect(progressView('encoding', 0.7, jump.memo, true).announce).toBeNull()
  })

  it('stays quiet when progress announcements are off, but still shows and titles', () => {
    const view = progressView('encoding', 0.5, NO_PROGRESS, false)
    expect(view.announce).toBeNull()
    expect(view.shown).toBe('Encoding video — 50%')
    expect(view.title).toBe('Encoding video — UoN Video Helper')
  })

  it('carries the stage into the tab title (U-22)', () => {
    expect(progressView('finishing', 0.99, NO_PROGRESS, true).title).toBe(
      'Finishing the file — UoN Video Helper',
    )
    expect(outcomeTitle('ready')).toBe('Ready — UoN Video Helper')
    expect(outcomeTitle('none')).toBe('UoN Video Helper')
  })
})

describe('the announce-progress setting', () => {
  it('defaults to on, remembers off, and survives a store that refuses', () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    }
    expect(readAnnounceProgress(storage)).toBe(true)
    writeAnnounceProgress(storage, false)
    expect(readAnnounceProgress(storage)).toBe(false)
    writeAnnounceProgress(storage, true)
    expect(readAnnounceProgress(storage)).toBe(true)

    const refusing = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    expect(readAnnounceProgress(refusing)).toBe(true)
    expect(() => writeAnnounceProgress(refusing, false)).not.toThrow()
    expect(readAnnounceProgress(null)).toBe(true)
  })
})
