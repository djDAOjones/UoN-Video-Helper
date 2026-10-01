/**
 * The System check panel starts closed, so its summary line is the whole of
 * what most users see. A failed check must therefore be in the WORDS of that
 * line and must open the panel — never left to colour, and never hidden.
 */

import { describe, expect, it } from 'vitest'

import { browserNote, summariseChecks } from './system-check'

describe('the system check summary (VH-88)', () => {
  it('says all passed, and stays closed, on a healthy device', () => {
    expect(summariseChecks(['pass', 'pass', 'pass', 'pass'])).toEqual({
      result: 'all passed',
      problems: 0,
      warnings: 0,
    })
  })

  it('names one problem in the singular and opens', () => {
    expect(summariseChecks(['pass', 'fail', 'pass', 'pass'])).toEqual({
      result: '1 problem',
      problems: 1,
      warnings: 0,
    })
  })

  it('counts several problems', () => {
    expect(summariseChecks(['fail', 'fail', 'pass', 'fail'])).toEqual({
      result: '3 problems',
      problems: 3,
      warnings: 0,
    })
  })

  it('reports the same count when an unrelated check lands afterwards', () => {
    // The panel opens when the count RISES. A failure followed by the worker
    // check passing is the same one problem, so a panel the user has closed
    // in between stays closed.
    const before = summariseChecks(['fail', 'pass', 'pass', 'pending'])
    const after = summariseChecks(['fail', 'pass', 'pass', 'pass'])
    expect(after.problems).toBe(before.problems)
  })

  it('does not claim a pass while a check is still running', () => {
    expect(summariseChecks(['pass', 'pass', 'pass', 'pending'])).toEqual({
      result: 'checking',
      problems: 0,
      warnings: 0,
    })
  })

  it('reports a failure without waiting for the slow check', () => {
    // The worker round trip answers last. A missing API is already known, and
    // holding the panel shut until the worker replies would hide it — for
    // ever, if the worker never does.
    expect(summariseChecks(['fail', 'pass', 'pass', 'pending'])).toEqual({
      result: '1 problem',
      problems: 1,
      warnings: 0,
    })
  })

  it('names a warning without counting it as a problem', () => {
    // Changed 2026-10-01: a warning used to read "all passed". The intro's
    // browser sentence now sends a user to this panel to find what was not
    // passed, so the summary has to name it — while still not opening as a
    // failure does, and still not counting it as one.
    expect(summariseChecks(['pass', 'warn', 'pass', 'pass'])).toEqual({
      result: '1 warning',
      problems: 0,
      warnings: 1,
    })
  })

  it('reports a failure ahead of a warning', () => {
    expect(summariseChecks(['warn', 'fail', 'pass', 'pass']).result).toBe('1 problem')
  })

  it('reads as checking before any row exists', () => {
    expect(summariseChecks([])).toEqual({ result: 'checking', problems: 0, warnings: 0 })
  })
})

describe('the browser sentence (2026-10-01)', () => {
  const lead = 'This app is designed and built for Chrome'

  it('keeps the maintainer\'s line in every state', () => {
    for (const states of [[], ['pending'], ['pass'], ['fail'], ['warn']] as const) {
      expect(browserNote(states).startsWith(lead)).toBe(true)
    }
  })

  it('says other browsers may not work until the checks are in', () => {
    expect(browserNote([])).toBe(`${lead}, other browsers may not work.`)
    expect(browserNote(['pass', 'pending'])).toBe(`${lead}, other browsers may not work.`)
  })

  it('does not turn away a browser that has passed every check', () => {
    expect(browserNote(['pass', 'pass', 'pass', 'pass', 'pass', 'pass'])).toBe(
      `${lead}, and this browser has passed the checks for it.`,
    )
  })

  it('says a failed or a warned check has not been passed, and where to look', () => {
    const expected = `${lead}, and this browser has not passed all of its checks. The system check at the foot of the page says what is missing.`
    expect(browserNote(['pass', 'fail', 'pass'])).toBe(expected)
    // The AAC refusal is a warning, not a failure, because a silent video
    // still runs — but it is not a pass for the sentence's purpose.
    expect(browserNote(['pass', 'warn', 'pass'])).toBe(expected)
  })
})
