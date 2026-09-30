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
      failing: false,
    })
  })

  it('names one problem in the singular and opens', () => {
    expect(summariseChecks(['pass', 'fail', 'pass', 'pass'])).toEqual({
      result: '1 problem',
      failing: true,
    })
  })

  it('counts several problems', () => {
    expect(summariseChecks(['fail', 'fail', 'pass', 'fail']).result).toBe('3 problems')
  })

  it('does not claim a pass while a check is still running', () => {
    expect(summariseChecks(['pass', 'pass', 'pass', 'pending'])).toEqual({
      result: 'checking',
      failing: false,
    })
  })

  it('reports a failure without waiting for the slow check', () => {
    // The worker round trip answers last. A missing API is already known, and
    // holding the panel shut until the worker replies would hide it — for
    // ever, if the worker never does.
    expect(summariseChecks(['fail', 'pass', 'pass', 'pending'])).toEqual({
      result: '1 problem',
      failing: true,
    })
  })

  it('does not count a warning as a problem', () => {
    expect(summariseChecks(['pass', 'warn', 'pass', 'pass'])).toEqual({
      result: 'all passed',
      failing: false,
    })
  })

  it('reads as checking before any row exists', () => {
    expect(summariseChecks([])).toEqual({ result: 'checking', failing: false })
  })
})
