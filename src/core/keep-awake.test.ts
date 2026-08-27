/**
 * Spec section 7.5 asks for a wake lock and an unload warning during a job.
 * The lock is browser behaviour and is checked in a real one; WHEN to warn is
 * a rule, and both ways of getting it wrong cost the user something (VH-63).
 */

import { describe, expect, it } from 'vitest'

import { shouldWarnBeforeLeaving } from './keep-awake'

const state = (over: Partial<Parameters<typeof shouldWarnBeforeLeaving>[0]> = {}) => ({
  jobInFlight: false,
  saveInFlight: false,
  hasUnsavedResult: false,
  ...over,
})

describe('shouldWarnBeforeLeaving', () => {
  it('says nothing when there is nothing to lose', () => {
    // The important half. A page that always warns trains people to dismiss
    // the warning, and then it protects nothing at all.
    expect(shouldWarnBeforeLeaving(state())).toBe(false)
  })

  it('warns while a job is encoding', () => {
    expect(shouldWarnBeforeLeaving(state({ jobInFlight: true }))).toBe(true)
  })

  it('warns while a save is still streaming', () => {
    // The file exists but is not out yet; leaving now loses it mid-write.
    expect(shouldWarnBeforeLeaving(state({ saveInFlight: true }))).toBe(true)
  })

  it('warns while a finished result has nowhere to go', () => {
    // Nothing is running, and an hour of work is sitting in OPFS.
    expect(shouldWarnBeforeLeaving(state({ hasUnsavedResult: true }))).toBe(true)
  })

  it('warns once, not three times, when everything is true at once', () => {
    expect(
      shouldWarnBeforeLeaving(
        state({ jobInFlight: true, saveInFlight: true, hasUnsavedResult: true }),
      ),
    ).toBe(true)
  })
})
