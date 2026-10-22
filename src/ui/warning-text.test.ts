/**
 * Acceptance criterion 7 asks that every warning "reads clearly to a
 * non-technical reader". That is a human judgement, but some of it is
 * mechanical: no jargon, no blame, and always a next step.
 */

import { describe, expect, it } from 'vitest'

import type { AudioWarningCode } from '../audio/warnings'
import { DECODE_DAMAGE } from '../config/audio'
import { damageTimes, shortfallTimes, warningText } from './warning-text'

/**
 * Exhaustive by construction, not by hand. A `Record` keyed on the union makes
 * TypeScript refuse to compile when a code is added without words to go with
 * it — which is how a warning would otherwise ship untested.
 */
const ALL = Object.keys({
  'ends-early': true,
  'no-audio': true,
  'decode-damage': true,
  clipping: true,
  'very-quiet': true,
  'highly-variable': true,
  noisy: true,
  'extended-silence': true,
  'target-missed': true,
  'metadata-lost': true,
} satisfies Record<AudioWarningCode, true>) as AudioWarningCode[]

const sample = (code: AudioWarningCode) =>
  warningText({
    code,
    detail: {
      integratedLufs: -42,
      loudnessRangeLu: 18.4,
      seconds: 95,
      missedBy: 2.5,
      milliseconds: 44,
      peakDbfs: -26.4,
      stopsAtSeconds: 20.84,
      endSeconds: 30,
    },
    atSeconds: [82.41, 185.34],
  })

describe('every warning has words', () => {
  it.each(ALL)('%s', (code) => {
    const { heading, detail } = sample(code)
    expect(heading.length).toBeGreaterThan(10)
    expect(detail.length).toBeGreaterThan(40)
  })

  it('never leaves a number unformatted', () => {
    for (const code of ALL) {
      const { heading, detail } = sample(code)
      expect(`${heading} ${detail}`).not.toMatch(/NaN|undefined|Infinity|\[object/)
    }
  })

  it('avoids implementation jargon', () => {
    // Spec 9.2: user language, not implementation terms. LUFS and LU used to
    // survive, for the meters people are told to check against; they went
    // with VH-114 — the sentences around them already said what mattered.
    const banned = /codec|bitrate|dBTP|dBFS|LUFS|\bLU\b|re-encod|demux|mux|WebCodecs|OPFS|percentile|K-weight/i
    for (const code of ALL) {
      const { heading, detail } = sample(code)
      expect(`${heading} ${detail}`, code).not.toMatch(banned)
    }
  })

  it('never blames the person who made the recording', () => {
    const blaming = /you should have|your mistake|incorrectly|badly|wrong setting|failed to/i
    for (const code of ALL) {
      expect(`${sample(code).heading} ${sample(code).detail}`, code).not.toMatch(blaming)
    }
  })

  it('states what happens next rather than only what is wrong', () => {
    // Each one has to leave the reader knowing whether to carry on.
    const forwardLooking = /will|can|worth|check|fine to use|still/i
    for (const code of ALL) {
      expect(sample(code).detail, code).toMatch(forwardLooking)
    }
  })

  it('phrases findings as possibilities, not verdicts', () => {
    for (const code of ['clipping', 'noisy'] as const) {
      expect(sample(code).heading, code).toMatch(/\bmay\b/)
    }
  })
})

describe('decode damage, said with its times (VH-122)', () => {
  const said = (atSeconds: number[]) =>
    warningText({ code: 'decode-damage', detail: { moments: atSeconds.length }, atSeconds })

  it('names one time, floored, so seeking to it lands before the damage', () => {
    const { heading, detail } = said([82.9])
    expect(heading).toBe('A damaged moment will be silenced')
    expect(detail).toMatch(/^At 1:22 in the original recording, the file holds a burst of noise/)
  })

  it('lists several as the language lists them', () => {
    const { heading, detail } = said([82.41, 185.34])
    expect(heading).toBe('Damaged moments will be silenced')
    expect(detail).toMatch(/^At 1:22 and 3:05 in the original recording, the file holds bursts of noise/)
  })

  it('says a time once, however many stretches share its second', () => {
    expect(damageTimes([82.1, 82.7, 185.3])).toEqual(['1:22', '3:05'])
  })

  it('counts the rest past the most it lists', () => {
    const atSeconds = Array.from({ length: DECODE_DAMAGE.timesSaid + 2 }, (_v, i) => 60 * (i + 1))
    expect(damageTimes(atSeconds)).toHaveLength(DECODE_DAMAGE.timesSaid + 1)
    expect(damageTimes(atSeconds).at(-1)).toBe('2 other moments')
    expect(said(atSeconds).detail).toContain('5:00 and 2 other moments')
    expect(damageTimes(atSeconds.slice(0, DECODE_DAMAGE.timesSaid))).not.toContain('other moments')
  })
})

describe('a file that ends early, said with where its sound stops (VH-139)', () => {
  const said = (stopsAtSeconds: number, endSeconds: number) =>
    warningText({ code: 'ends-early', detail: { stopsAtSeconds, endSeconds } })

  it('names the stop, floored, and the end the file declares', () => {
    const { heading, detail } = said(20.84, 30)
    expect(heading).toBe('The file ends early')
    expect(detail).toMatch(/^Its audio stops at 0:20 of 0:30\. /)
    expect(detail).toContain('After 0:20, the new video will be silent.')
  })

  it('gives times as the trim’s fields do, past a minute and an hour', () => {
    expect(said(2465.7, 3480).detail).toMatch(/^Its audio stops at 41:05 of 58:00\. /)
    expect(said(3725.2, 4000).detail).toMatch(/^Its audio stops at 1:02:05 of 1:06:40\. /)
  })

  it('times a stop and an end the same way wherever they are said', () => {
    expect(shortfallTimes({ stopsAtSeconds: 20.99, endSeconds: 29.6 })).toEqual({ stops: '0:20', end: '0:30' })
  })
})
