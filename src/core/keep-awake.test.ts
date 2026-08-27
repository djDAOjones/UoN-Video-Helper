/**
 * Spec section 7.5 asks for a wake lock and an unload warning during a job.
 * The lock is browser behaviour and is checked in a real one; WHEN to warn is
 * a rule, and both ways of getting it wrong cost the user something (VH-63).
 */

import { describe, expect, it } from 'vitest'

import { shouldHoldWakeLock, shouldWarnBeforeLeaving } from './keep-awake'

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

/**
 * VH-75. VH-63 tied the wake lock to a running JOB only, so a multi-gigabyte
 * save — pure sustained I/O, no keypress, no progress bar moving — was exactly
 * the phase during which the machine was free to sleep.
 */
describe('shouldHoldWakeLock', () => {
  const state = (over: Partial<Parameters<typeof shouldHoldWakeLock>[0]> = {}) => ({
    jobInFlight: false,
    saveInFlight: false,
    ...over,
  })

  it('holds while a job is encoding', () => {
    expect(shouldHoldWakeLock(state({ jobInFlight: true }))).toBe(true)
  })

  it('holds while a save is streaming', () => {
    expect(shouldHoldWakeLock(state({ saveInFlight: true }))).toBe(true)
  })

  it('lets go when nothing is running', () => {
    expect(shouldHoldWakeLock(state())).toBe(false)
  })

  it('does not hold merely because a result is unsaved', () => {
    // Deliberately narrower than the unload warning. Nothing is running, and
    // keeping a screen awake over a file already safely on disk spends the
    // user's battery for nothing.
    expect(shouldWarnBeforeLeaving({ ...state(), hasUnsavedResult: true })).toBe(true)
    expect(shouldHoldWakeLock(state())).toBe(false)
  })
})
