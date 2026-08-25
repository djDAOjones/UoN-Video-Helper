/**
 * How the two feed lanes fail together, VH-37.
 *
 * The video and audio lanes push into one `Output`. `Promise.all` rejected on
 * the first failure and left the other lane running unobserved, still feeding
 * an output that was already cancelling — so it rejected later with nothing
 * awaiting it. `diagnostics.ts` hooks `unhandledrejection`, so the user was
 * shown the real error AND a spurious second entry for the lane that only
 * failed because the first one did.
 */

import { describe, expect, it } from 'vitest'

import { CancelledError, settleLanes } from './pipeline'

/** A lane that resolves after `ticks` microtask turns, unless aborted first. */
function lane(options: {
  readonly ticks?: number
  readonly throws?: Error
  readonly aborted?: () => boolean
  readonly onFinish?: () => void
}): () => Promise<void> {
  return async () => {
    for (let i = 0; i < (options.ticks ?? 0); i++) {
      await Promise.resolve()
      if (options.aborted?.()) throw new CancelledError()
    }
    if (options.throws !== undefined) throw options.throws
    options.onFinish?.()
  }
}

describe('settleLanes', () => {
  it('resolves when both lanes finish', async () => {
    const finished: string[] = []
    await expect(
      settleLanes(
        [
          lane({ ticks: 2, onFinish: () => finished.push('video') }),
          lane({ ticks: 1, onFinish: () => finished.push('audio') }),
        ],
        () => {
          throw new Error('onFailure must not fire when both lanes succeed')
        },
      ),
    ).resolves.toBeUndefined()
    expect(finished.sort()).toEqual(['audio', 'video'])
  })

  it('signals failure as soon as a lane rejects, not after both settle', async () => {
    let aborted = false
    const stillRunning = { finished: false }
    await expect(
      settleLanes(
        [
          lane({ throws: new Error('encoder rejected the frame') }),
          lane({
            ticks: 50,
            aborted: () => aborted,
            onFinish: () => (stillRunning.finished = true),
          }),
        ],
        () => {
          aborted = true
        },
      ),
    ).rejects.toThrow('encoder rejected the frame')
    // The survivor stopped rather than running to completion into an output
    // that is already cancelling.
    expect(stillRunning.finished).toBe(false)
  })

  it('reports the real cause, not the cancellation it triggered', async () => {
    // The whole point. The second lane fails only BECAUSE the first did, so
    // naming its CancelledError would report the symptom.
    let aborted = false
    const real = new Error('OPFS write failed')
    await expect(
      settleLanes([lane({ throws: real }), lane({ ticks: 20, aborted: () => aborted })], () => {
        aborted = true
      }),
    ).rejects.toBe(real)
  })

  it('reports the real cause whichever lane raised it', async () => {
    let aborted = false
    const real = new Error('audio chain blew up')
    await expect(
      settleLanes([lane({ ticks: 20, aborted: () => aborted }), lane({ throws: real })], () => {
        aborted = true
      }),
    ).rejects.toBe(real)
  })

  it('reports cancellation when cancellation is genuinely all that happened', async () => {
    // A user pressing Cancel aborts both lanes, so both raise CancelledError
    // and there is no truer cause to prefer.
    await expect(
      settleLanes(
        [lane({ throws: new CancelledError() }), lane({ throws: new CancelledError() })],
        () => {},
      ),
    ).rejects.toBeInstanceOf(CancelledError)
  })

  it('leaves no rejection unobserved when both lanes fail independently', async () => {
    // `Promise.all` would surface one and abandon the other, and the abandoned
    // one is what reached the errors panel as a second, unexplained entry.
    const unhandled: unknown[] = []
    const track = (event: PromiseRejectionEvent): void => {
      unhandled.push(event.reason)
    }
    globalThis.addEventListener?.('unhandledrejection', track as EventListener)
    try {
      await expect(
        settleLanes(
          [lane({ throws: new Error('video died') }), lane({ throws: new Error('audio died') })],
          () => {},
        ),
      ).rejects.toThrow(/video died|audio died/)
      // Let any stray rejection surface before asserting none did.
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(unhandled).toEqual([])
    } finally {
      globalThis.removeEventListener?.('unhandledrejection', track as EventListener)
    }
  })

  it('starts the lanes itself, so nothing is in flight if it throws', async () => {
    let started = 0
    await settleLanes(
      [lane({ onFinish: () => started++ }), lane({ onFinish: () => started++ })],
      () => {},
    )
    expect(started).toBe(2)
  })
})
