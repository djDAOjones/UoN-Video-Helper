/**
 * VH-109: progress that neither freezes nor chatters. VH-136: the time left,
 * from the encode's own rate.
 */

import { describe, expect, it } from 'vitest'

import { TIME_LEFT_AFTER_ENCODING_SECONDS } from '../config/thresholds'
import { setLanguage } from '../i18n'
import {
  encodeSecondsLeft,
  NO_PROGRESS,
  outcomeTitle,
  progressView,
  readAnnounceProgress,
  writeAnnounceProgress,
  type ProgressMemo,
} from './progress'

describe('progressView', () => {
  it('shows no percentage for a stage whose progress is not measured (U-07)', () => {
    const view = progressView('analysing', 0, NO_PROGRESS, true, 0)
    expect(view.shown).toBe('Analysing audio')
    expect(view.indeterminate).toBe(true)
    expect(progressView('checking', 0, NO_PROGRESS, true, 0).shown).toBe('Checking the file')
  })

  it('shows the percentage where it is measured', () => {
    const view = progressView('encoding', 0.634, NO_PROGRESS, true, 0)
    expect(view.shown).toBe('Encoding video — 63%')
    expect(view.indeterminate).toBe(false)
  })

  it('announces a stage change once, then only milestones (U-08)', () => {
    let memo = NO_PROGRESS
    const said: string[] = []
    const report = (stage: 'analysing' | 'encoding', fraction: number): void => {
      const view = progressView(stage, fraction, memo, true, 0)
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
    const first = progressView('encoding', 0.1, { stage: 'encoding', milestone: -1, encodeFrom: null }, true, 0)
    expect(first.announce).toBeNull()
    const jump = progressView('encoding', 0.6, first.memo, true, 0)
    expect(jump.announce).toBe('Encoding video — half done')
    expect(progressView('encoding', 0.7, jump.memo, true, 0).announce).toBeNull()
  })

  it('stays quiet when progress announcements are off, but still shows and titles', () => {
    const view = progressView('encoding', 0.5, NO_PROGRESS, false, 0)
    expect(view.announce).toBeNull()
    expect(view.shown).toBe('Encoding video — 50%')
    expect(view.title).toBe('Encoding video — UoN Video Helper')
  })

  it('carries the stage into the tab title (U-22)', () => {
    expect(progressView('finishing', 0.99, NO_PROGRESS, true, 0).title).toBe(
      'Finishing the file — UoN Video Helper',
    )
    expect(outcomeTitle('ready')).toBe('Ready — UoN Video Helper')
    expect(outcomeTitle('none')).toBe('UoN Video Helper')
  })
})

describe('the time left (VH-136)', () => {
  const afterMs = TIME_LEFT_AFTER_ENCODING_SECONDS * 1000

  /** Reports in order, as the page receives them: each stage line, each time left, and what was said. */
  function run(
    reports: readonly (readonly ['analysing' | 'encoding', number, number])[],
    announceProgress = true,
  ): { shown: string[]; left: (string | null)[]; said: string[]; memo: ProgressMemo } {
    let memo = NO_PROGRESS
    const shown: string[] = []
    const left: (string | null)[] = []
    const said: string[] = []
    for (const [stage, fraction, atMs] of reports) {
      const view = progressView(stage, fraction, memo, announceProgress, atMs)
      memo = view.memo
      shown.push(view.shown)
      left.push(view.timeLeft)
      if (view.announce) said.push(view.announce)
    }
    return { shown, left, said, memo }
  }

  /** A steady encode, one report a percent, `msPerPercent` apart. */
  const steady = (msPerPercent: number): (readonly ['encoding', number, number])[] =>
    Array.from({ length: 101 }, (_, index) => ['encoding', index / 100, index * msPerPercent] as const)

  it('shows the time left from the encode’s own rate once it has run long enough', () => {
    // 20 s for 40% of the frames: the other 55% take 27.5 s, said as 30.
    const { shown, left } = run([
      ['encoding', 0.05, 1_000],
      ['encoding', 0.45, 21_000],
    ])
    expect(shown).toEqual(['Encoding video — 5%', 'Encoding video — 45%'])
    expect(left).toEqual([null, 'About 30 seconds left'])
    expect(
      encodeSecondsLeft({ atMs: 1_000, fraction: 0.05 }, { atMs: 21_000, fraction: 0.45 }),
    ).toBeCloseTo(27.5, 9)
  })

  it('shows nothing new until the encode has run the set time, and the time left from then', () => {
    const from = { atMs: 0, fraction: 0.1 }
    expect(encodeSecondsLeft(from, { atMs: afterMs - 1, fraction: 0.3 })).toBeNull()
    expect(encodeSecondsLeft(from, { atMs: afterMs, fraction: 0.3 })).toBeCloseTo(
      (TIME_LEFT_AFTER_ENCODING_SECONDS * 0.7) / 0.2,
      9,
    )
    const { left } = run([
      ['encoding', 0.1, 0],
      ['encoding', 0.3, afterMs - 1],
      ['encoding', 0.3, afterMs],
    ])
    expect(left).toEqual([null, null, 'About 40 seconds left'])
  })

  it('clocks from the encode’s first report, not from the start of the job', () => {
    // A minute of analysis, then 5 s of encoding: not yet long enough.
    const { left } = run([
      ['analysing', 0, 0],
      ['analysing', 0, 60_000],
      ['encoding', 0.02, 60_500],
      ['encoding', 0.2, 65_500],
    ])
    expect(left).toEqual([null, null, null, null])
  })

  it('says a few seconds near the end, never “about a few seconds”', () => {
    // 31 s for 94%: the last 4% take 1.3 s.
    const { left } = run([
      ['encoding', 0.02, 0],
      ['encoding', 0.92, 30_000],
      ['encoding', 0.96, 31_000],
    ])
    expect(left[2]).toBe('A few seconds left')
  })

  it('shows no time left while no frame has been counted since the first report', () => {
    expect(encodeSecondsLeft({ atMs: 0, fraction: 0.4 }, { atMs: afterMs * 2, fraction: 0.4 })).toBeNull()
    const { left } = run([
      ['encoding', 0.4, 0],
      ['encoding', 0.4, afterMs * 2],
    ])
    expect(left).toEqual([null, null])
  })

  it('is heard only with the milestones, never on every update, and never when announcements are off', () => {
    // 40 s of encoding: the quarter comes at 10 s, just as the rate is trusted.
    const { left, said } = run(steady(400))
    expect(said).toEqual([
      'Encoding video',
      'Encoding video — a quarter done. About 30 seconds left',
      'Encoding video — half done. About 20 seconds left',
      'Encoding video — three quarters done. About 10 seconds left',
    ])
    expect(left.filter((line) => line !== null).length).toBe(76)
    expect(run(steady(400), false).said).toEqual([])
  })

  it('says a milestone without the time when it comes before the time is known', () => {
    expect(run(steady(1_000)).said.slice(1)).toEqual([
      'Encoding video — a quarter done. About 1 minute left',
      'Encoding video — half done. About 50 seconds left',
      'Encoding video — three quarters done. About 30 seconds left',
    ])
    // 20 s of encoding: the quarter comes at 5 s, the half at 10.
    expect(run(steady(200)).said.slice(1)).toEqual([
      'Encoding video — a quarter done',
      'Encoding video — half done. About 10 seconds left',
      'Encoding video — three quarters done. About 10 seconds left',
    ])
  })

  it('writes the same line again from the memo after the report, as a change of language does', () => {
    const { memo } = run([
      ['encoding', 0.05, 0],
      ['encoding', 0.5, 15_000],
    ])
    expect(progressView('encoding', 0.5, memo, false, 15_000).timeLeft).toBe('About 20 seconds left')
    try {
      setLanguage('zh-Hans')
      expect(progressView('encoding', 0.5, memo, false, 15_000).timeLeft).toMatch(/^大约还剩\S+$/)
      setLanguage('ms-MY')
      expect(progressView('encoding', 0.5, memo, false, 15_000).timeLeft).toMatch(/^Kira-kira .+ lagi$/)
      // Said as two sentences, with the language's own full stop between them.
      expect(run(steady(400)).said[2]).toMatch(/^Pengekodan video — separuh siap\. Kira-kira .+ lagi$/)
      setLanguage('zh-Hans')
      expect(run(steady(400)).said[2]).toMatch(/^视频编码 — 完成一半。大约还剩\S+$/)
    } finally {
      setLanguage('en-GB')
    }
  })

  it('keeps the time left out of the stage line and the tab title, and leaves it behind when the encode ends', () => {
    const { memo } = run([
      ['encoding', 0.05, 0],
      ['encoding', 0.5, 15_000],
    ])
    const view = progressView('encoding', 0.5, memo, false, 15_000)
    expect(view.shown).toBe('Encoding video — 50%')
    expect(view.title).toBe('Encoding video — UoN Video Helper')
    const finishing = progressView('finishing', 0.99, memo, true, 40_000)
    expect(finishing.shown).toBe('Finishing the file')
    expect(finishing.timeLeft).toBeNull()
    expect(finishing.memo.encodeFrom).toBeNull()
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
