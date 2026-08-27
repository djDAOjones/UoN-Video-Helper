import { describe, expect, it } from 'vitest'

import { sweepUnclaimed } from './opfs'

/**
 * VH-35: a second tab used to delete the first tab's work.
 * VH-58: it could still do so between deciding and deleting.
 *
 * `sweepOrphanedJobs` runs at worker boot, when this context has no jobs of its
 * own — so every directory it sees belongs to another tab, and OPFS is
 * origin-scoped, so it can see them all. The rule that keeps them safe is
 * tested here; the Web Locks that supply the answers are browser-only and
 * verified there.
 *
 * The seam changed shape with VH-58. It used to select names and remove them
 * afterwards, which is the race: a claim tested under one lock and acted on
 * after that lock is released says nothing about the moment of deletion. The
 * attempt now removes under its own claim, so what these tests pin is that the
 * sweep asks once per directory, counts only real removals, and lets a failure
 * end that directory rather than the sweep.
 */
describe('sweepUnclaimed', () => {
  /** An attempt that removes whatever is not in `live`, recording what it took. */
  function attemptOver(live: ReadonlySet<string>, removed: string[]) {
    return (name: string): Promise<boolean> => {
      if (live.has(name)) return Promise.resolve(false)
      removed.push(name)
      return Promise.resolve(true)
    }
  }

  it('removes a directory nobody claims', async () => {
    const removed: string[] = []
    const count = await sweepUnclaimed(['s1-job-1'], attemptOver(new Set(), removed))
    expect(removed).toEqual(['s1-job-1'])
    expect(count).toBe(1)
  })

  it('keeps a directory another tab still holds', async () => {
    const removed: string[] = []
    const count = await sweepUnclaimed(['s2-job-1'], attemptOver(new Set(['s2-job-1']), removed))
    expect(removed).toEqual([])
    expect(count).toBe(0)
  })

  it('sweeps around a retained job rather than through it', async () => {
    // The shape of the real failure: one tab mid-job, one holding a finished
    // result the user has not saved, and two genuinely dead.
    const removed: string[] = []
    const count = await sweepUnclaimed(
      ['s1-job-1', 's2-job-6', 's2-job-7', 's3-job-2'],
      attemptOver(new Set(['s2-job-7', 's2-job-6']), removed),
    )
    expect(removed).toEqual(['s1-job-1', 's3-job-2'])
    expect(count).toBe(2)
  })

  it('keeps a directory whose attempt failed', async () => {
    // Uncertainty must never delete a user's output: leaking scratch costs
    // disk, and disk is recoverable.
    const count = await sweepUnclaimed(['s1-job-1'], () =>
      Promise.reject(new Error('lock manager unavailable')),
    )
    expect(count).toBe(0)
  })

  it('lets one undeletable directory fail without abandoning the rest', async () => {
    // VH-35 in Firefox: an open handle made `removeEntry` throw, and the throw
    // took every orphan after it with it.
    const removed: string[] = []
    const count = await sweepUnclaimed(['a', 'stuck', 'c'], (name) => {
      if (name === 'stuck') return Promise.reject(new Error('handle still open'))
      removed.push(name)
      return Promise.resolve(true)
    })
    expect(removed).toEqual(['a', 'c'])
    expect(count).toBe(2)
  })

  it('keeps every directory when no claim can be granted', async () => {
    const names = ['s1-job-1', 's2-job-1', 's3-job-1']
    const count = await sweepUnclaimed(names, () => Promise.resolve(false))
    expect(count).toBe(0)
  })

  it('attempts every directory exactly once', async () => {
    const asked: string[] = []
    await sweepUnclaimed(['a', 'b', 'c'], (name) => {
      asked.push(name)
      return Promise.resolve(true)
    })
    expect(asked).toEqual(['a', 'b', 'c'])
  })

  it('has nothing to do with an empty root', async () => {
    const count = await sweepUnclaimed([], () => Promise.reject(new Error('never asked')))
    expect(count).toBe(0)
  })
})
