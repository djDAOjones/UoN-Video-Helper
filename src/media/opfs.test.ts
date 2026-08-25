import { describe, expect, it } from 'vitest'

import { selectSweepable } from './opfs'

/**
 * VH-35: a second tab used to delete the first tab's work.
 *
 * `sweepOrphanedJobs` runs at worker boot, when this context has no jobs of its
 * own — so every directory it sees belongs to another tab, and OPFS is
 * origin-scoped, so it can see them all. The rule that keeps them safe is
 * tested here; the Web Locks that supply the answers are browser-only and
 * verified there.
 */
describe('selectSweepable', () => {
  it('removes a directory nobody claims', async () => {
    const sweepable = await selectSweepable(['s1-job-1'], () => Promise.resolve(false))
    expect(sweepable).toEqual(['s1-job-1'])
  })

  it('keeps a directory another tab still holds', async () => {
    const sweepable = await selectSweepable(['s2-job-1'], () => Promise.resolve(true))
    expect(sweepable).toEqual([])
  })

  it('sweeps around a retained job rather than through it', async () => {
    // The shape of the real failure: one tab mid-job, one holding a finished
    // result the user has not saved, and two genuinely dead.
    const live = new Set(['s2-job-7', 's2-job-6'])
    const sweepable = await selectSweepable(
      ['s1-job-1', 's2-job-6', 's2-job-7', 's3-job-2'],
      (name) => Promise.resolve(live.has(name)),
    )
    expect(sweepable).toEqual(['s1-job-1', 's3-job-2'])
  })

  it('keeps a directory it could not ask about', async () => {
    // Uncertainty must never delete a user's output: leaking scratch costs
    // disk, and disk is recoverable.
    const sweepable = await selectSweepable(['s1-job-1'], () =>
      Promise.reject(new Error('lock manager unavailable')),
    )
    expect(sweepable).toEqual([])
  })

  it('keeps every directory when no claim can be tested', async () => {
    const names = ['s1-job-1', 's2-job-1', 's3-job-1']
    const sweepable = await selectSweepable(names, () => Promise.resolve(true))
    expect(sweepable).toEqual([])
  })

  it('asks about every directory exactly once', async () => {
    const asked: string[] = []
    await selectSweepable(['a', 'b', 'c'], (name) => {
      asked.push(name)
      return Promise.resolve(false)
    })
    expect(asked).toEqual(['a', 'b', 'c'])
  })

  it('has nothing to do with an empty root', async () => {
    const sweepable = await selectSweepable([], () => Promise.reject(new Error('never asked')))
    expect(sweepable).toEqual([])
  })
})
