/**
 * The System check panel starts closed, so its summary line is the whole of
 * what most users see. A failed check must therefore be in the WORDS of that
 * line and must open the panel — never left to colour, and never hidden.
 */

import { describe, expect, it } from 'vitest'

import { summariseChecks } from './system-check'

describe('the system check summary (VH-88)', () => {
  it('says all passed, and stays closed, on a healthy device', () => {
    expect(summariseChecks(['pass', 'pass', 'pass', 'pass'])).toEqual({
      result: 'all passed',
      problems: 0,
    })
  })

  it('names one problem in the singular and opens', () => {
    expect(summariseChecks(['pass', 'fail', 'pass', 'pass'])).toEqual({
      result: '1 problem',
      problems: 1,
    })
  })

  it('counts several problems', () => {
    expect(summariseChecks(['fail', 'fail', 'pass', 'fail'])).toEqual({
      result: '3 problems',
      problems: 3,
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
    })
  })

  it('reports a failure without waiting for the slow check', () => {
    // The worker round trip answers last. A missing API is already known, and
    // holding the panel shut until the worker replies would hide it — for
    // ever, if the worker never does.
    expect(summariseChecks(['fail', 'pass', 'pass', 'pending'])).toEqual({
      result: '1 problem',
      problems: 1,
    })
  })

  it('does not count a warning as a problem', () => {
    expect(summariseChecks(['pass', 'warn', 'pass', 'pass'])).toEqual({
      result: 'all passed',
      problems: 0,
    })
  })

  it('reads as checking before any row exists', () => {
    expect(summariseChecks([])).toEqual({ result: 'checking', problems: 0 })
  })
})
