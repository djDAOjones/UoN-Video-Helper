/**
 * How the two feed lanes fail together, VH-37.
 *
 * The video and audio lanes push into one `Output`. `Promise.all` rejects on
 * the first failure and leaves the loser RUNNING — still decoding and pushing
 * into an output the caller is already tearing down.
 *
 * It does not leak an unhandled rejection, which this file originally claimed:
 * `PerformPromiseAll` calls `.then` on every element as it iterates, so the
 * sibling is always observed. Corrected 2026-08-26 after the claim was checked
 * in Node and found false; the assertion that rested on it is gone with it.
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

  it('waits for both lanes even when both fail, so neither is still writing', async () => {
    // The point is ORDER, not rejection handling: `Promise.all` rejects on the
    // first failure and the caller begins tearing the `Output` down while the
    // loser is still pushing into it. This must not resolve until both are
    // finished with the output.
    const finished: string[] = []
    await expect(
      settleLanes(
        [
          lane({ throws: new Error('video died') }),
          lane({
            ticks: 5,
            throws: new Error('audio died'),
            onFinish: () => finished.push('never'),
          }),
        ],
        () => finished.push('signalled'),
      ),
    ).rejects.toThrow(/video died|audio died/)
    // Both lanes have settled by the time it rejects — the slow one had five
    // turns to run and its failure is accounted for.
    expect(finished).toContain('signalled')
  })

  it('starts both lanes even if the first throws immediately', async () => {
    let started = 0
    await expect(
      settleLanes(
        [
          () => {
            started++
            return Promise.reject(new Error('first'))
          },
          () => {
            started++
            return Promise.resolve()
          },
        ],
        () => {},
      ),
    ).rejects.toThrow('first')
    expect(started).toBe(2)
  })
})
