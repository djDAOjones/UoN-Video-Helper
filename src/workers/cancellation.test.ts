import { describe, expect, it } from 'vitest'

import { CancellationRegistry } from './cancellation'

/** A promise plus the handle to settle it, so a test can control when work resumes. */
function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve = (): void => {}
  const promise = new Promise<void>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('CancellationRegistry', () => {
  it('is cancellable before the work reaches its first await (VH-57)', async () => {
    // The exact shape of the defect: `handleProcess` awaited cleanup and only
    // then registered its controller, so a Cancel during cleanup found an
    // empty map and was dropped without a word.
    const registry = new CancellationRegistry()
    const cleanup = deferred()
    let sawAbort = false

    const work = registry.run(1, async (signal) => {
      await cleanup.promise
      sawAbort = signal.aborted
    })

    // Synchronously after `run` returns — before the work has resumed at all.
    expect(registry.cancel(1)).toBe(true)
    cleanup.resolve()
    await work

    expect(sawAbort).toBe(true)
  })

  it('reports a cancel that reached nothing', () => {
    const registry = new CancellationRegistry()
    expect(registry.cancel(99)).toBe(false)
  })

  it('deregisters when the work settles, however it settles', async () => {
    const registry = new CancellationRegistry()
    await registry.run(1, () => Promise.resolve())
    expect(registry.size).toBe(0)

    await expect(registry.run(2, () => Promise.reject(new Error('boom')))).rejects.toThrow('boom')
    expect(registry.size).toBe(0)
    // A cancel arriving after the fact must not resurrect anything.
    expect(registry.cancel(2)).toBe(false)
  })

  it('cancels only the request it was asked to', async () => {
    const registry = new CancellationRegistry()
    const hold = deferred()
    const seen: Record<number, boolean> = {}
    const runs = [1, 2, 3].map((id) =>
      registry.run(id, async (signal) => {
        await hold.promise
        seen[id] = signal.aborted
      }),
    )

    registry.cancel(2)
    hold.resolve()
    await Promise.all(runs)

    expect(seen).toEqual({ 1: false, 2: true, 3: false })
  })
})
