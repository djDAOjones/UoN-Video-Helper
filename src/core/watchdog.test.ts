/**
 * The silence watchdog, VH-38.
 *
 * It replaced a one-hour deadline on the whole `process` request — a duration
 * cap of exactly the kind spec section 7 opens by disclaiming. Worse, that
 * deadline rejected without telling the worker, so the job ran on, finished,
 * and held its output in the worker's `finished` map while the user was told it
 * had not finished.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createWatchdog } from './watchdog'

describe('createWatchdog', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires after the limit when nothing happens', () => {
    const onSilence = vi.fn()
    createWatchdog(1000, onSilence)
    vi.advanceTimersByTime(999)
    expect(onSilence).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onSilence).toHaveBeenCalledOnce()
  })

  it('never fires while something keeps reporting in', () => {
    // The whole point: a three-hour lecture reporting a stage every few seconds
    // is healthy, and the old whole-job deadline would have killed it.
    const onSilence = vi.fn()
    const watchdog = createWatchdog(1000, onSilence)
    for (let elapsed = 0; elapsed < 60_000; elapsed += 500) {
      vi.advanceTimersByTime(500)
      watchdog.reset()
    }
    expect(onSilence).not.toHaveBeenCalled()
    // ...and still fires once the reports stop.
    vi.advanceTimersByTime(1000)
    expect(onSilence).toHaveBeenCalledOnce()
  })

  it('measures silence from the last sign of life, not from the start', () => {
    const onSilence = vi.fn()
    const watchdog = createWatchdog(1000, onSilence)
    vi.advanceTimersByTime(900)
    watchdog.reset()
    vi.advanceTimersByTime(900)
    expect(onSilence).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(onSilence).toHaveBeenCalledOnce()
  })

  it('stops watching once cleared', () => {
    const onSilence = vi.fn()
    const watchdog = createWatchdog(1000, onSilence)
    watchdog.clear()
    vi.advanceTimersByTime(10_000)
    expect(onSilence).not.toHaveBeenCalled()
  })

  it('is safe to clear more than once, and after it has fired', () => {
    const onSilence = vi.fn()
    const watchdog = createWatchdog(1000, onSilence)
    vi.advanceTimersByTime(1000)
    watchdog.clear()
    watchdog.clear()
    vi.advanceTimersByTime(10_000)
    expect(onSilence).toHaveBeenCalledOnce()
  })

  it('cannot be resurrected by a late sign of life', () => {
    // Once it has fired, the caller has already been told the request failed
    // and the worker has already been sent a cancel. A straggling progress
    // message must not restart a watch on a request nobody is waiting for.
    const onSilence = vi.fn()
    const watchdog = createWatchdog(1000, onSilence)
    vi.advanceTimersByTime(1000)
    expect(onSilence).toHaveBeenCalledOnce()
    watchdog.reset()
    vi.advanceTimersByTime(10_000)
    expect(onSilence).toHaveBeenCalledOnce()
  })

  it('fires at most once even if never cleared', () => {
    const onSilence = vi.fn()
    createWatchdog(500, onSilence)
    vi.advanceTimersByTime(60_000)
    expect(onSilence).toHaveBeenCalledOnce()
  })
})
