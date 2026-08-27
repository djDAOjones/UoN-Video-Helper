/**
 * VH-56 and VH-75. Two rules here cost a user their finished file if they are
 * wrong, and both were: a save could be deleted mid-stream, and a disposal
 * that failed could not be retried — or, worse, could stop the next job from
 * starting at all.
 */

import { describe, expect, it, vi } from 'vitest'

import { RetainedResults } from './retained'

/** A workspace that records disposals and can be told to fail them. */
function workspace(options: { failTimes?: number } = {}) {
  let remaining = options.failTimes ?? 0
  const calls = { dispose: 0 }
  return {
    calls,
    dispose: () => {
      calls.dispose++
      if (remaining > 0) {
        remaining--
        return Promise.reject(new Error('handle still open'))
      }
      return Promise.resolve()
    },
  }
}

describe('releasing a retained result', () => {
  it('disposes it and forgets it', async () => {
    const held = new RetainedResults()
    const ws = workspace()
    held.retain('job-1', ws)
    expect(await held.release('job-1')).toBe(true)
    expect(ws.calls.dispose).toBe(1)
    expect(held.has('job-1')).toBe(false)
  })

  it('keeps the entry when disposal fails, so it can be retried', async () => {
    // Deleting the entry first meant a failed disposal left nothing in this
    // session able to try again — only the next boot's orphan sweep.
    const held = new RetainedResults()
    const ws = workspace({ failTimes: 1 })
    held.retain('job-1', ws)

    expect(await held.release('job-1')).toBe(false)
    expect(held.has('job-1')).toBe(true)

    expect(await held.release('job-1')).toBe(true)
    expect(held.has('job-1')).toBe(false)
    expect(ws.calls.dispose).toBe(2)
  })

  it('never rejects, because the next job is what awaits it', async () => {
    // `releaseAll` is the first thing a new job does. A rejection here would
    // mean one undeletable directory stops the user working at all.
    const held = new RetainedResults()
    held.retain('job-1', workspace({ failTimes: 99 }))
    await expect(held.releaseAll()).resolves.toBeUndefined()
  })

  it('releases the others when one of them cannot be disposed', async () => {
    const held = new RetainedResults()
    const stuck = workspace({ failTimes: 99 })
    const fine = workspace()
    held.retain('stuck', stuck)
    held.retain('fine', fine)

    await held.releaseAll()
    expect(held.has('fine')).toBe(false)
    expect(held.has('stuck')).toBe(true)
    expect(fine.calls.dispose).toBe(1)
  })

  it('is a no-op for a result it never held', async () => {
    expect(await new RetainedResults().release('never-seen')).toBe(true)
  })
})

describe('read leases', () => {
  it('makes disposal wait for the reader', async () => {
    const held = new RetainedResults()
    const ws = workspace()
    held.retain('job-1', ws)
    held.lease('job-1', true)

    let released = false
    const releasing = held.release('job-1').then(() => {
      released = true
    })

    // Still reading: nothing may be disposed yet.
    await Promise.resolve()
    expect(ws.calls.dispose).toBe(0)
    expect(released).toBe(false)

    held.lease('job-1', false)
    await releasing
    expect(ws.calls.dispose).toBe(1)
  })

  it('expires a lease whose reader never came back', async () => {
    // A lease that cannot expire is a workspace nobody may ever dispose.
    vi.useFakeTimers()
    try {
      const held = new RetainedResults()
      const ws = workspace()
      held.retain('job-1', ws)
      held.lease('job-1', true)
      const releasing = held.release('job-1')
      await vi.advanceTimersByTimeAsync(600_000)
      await releasing
      expect(ws.calls.dispose).toBe(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('ignores a second claim on one already held', async () => {
    const held = new RetainedResults()
    held.retain('job-1', workspace())
    held.lease('job-1', true)
    held.lease('job-1', true)
    held.lease('job-1', false)
    await expect(held.release('job-1')).resolves.toBe(true)
  })
})

describe('forgetting without disposing', () => {
  it('drops a result the caller owns, and its lease with it', () => {
    // The failure path: the job never handed the workspace over, so it
    // disposes it itself and only needs the retention dropped.
    const held = new RetainedResults()
    const ws = workspace()
    held.retain('job-1', ws)
    held.lease('job-1', true)
    held.forget('job-1')

    expect(held.has('job-1')).toBe(false)
    expect(ws.calls.dispose).toBe(0)
    expect(held.size).toBe(0)
  })
})
