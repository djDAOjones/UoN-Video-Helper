/**
 * Acceptance criterion 7 asks that every warning "reads clearly to a
 * non-technical reader". That is a human judgement, but some of it is
 * mechanical: no jargon, no blame, and always a next step.
 */

import { describe, expect, it } from 'vitest'

import type { AudioWarningCode } from '../audio/warnings'
import { warningText } from './warning-text'

/**
 * Exhaustive by construction, not by hand. A `Record` keyed on the union makes
 * TypeScript refuse to compile when a code is added without words to go with
 * it — which is how a warning would otherwise ship untested.
 */
const ALL = Object.keys({
  'no-audio': true,
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
    },
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
    // Spec 9.2: user language, not implementation terms. LUFS and LU survive
    // because they appear on the meters people are told to check against.
    const banned = /codec|bitrate|dBTP|dBFS|demux|mux|WebCodecs|OPFS|percentile|K-weight/i
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
