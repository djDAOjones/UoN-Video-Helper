/**
 * VH-73. A job could finish with an unreadable picture track and still post
 * `processed`, so the screen announced "Your video is ready" over a file with
 * no picture in it. Nothing checked; `verifyOutputAudio` only ever looked at
 * the sound.
 */

import { describe, expect, it } from 'vitest'

import { CancelledError } from './pipeline'
import { OutputIntegrityError, requireReadableOutputVideo } from './output-integrity'

const closable = () => ({ close: () => {} })

/** An input whose primary video track is whatever is passed. */
const inputWith = (track: unknown) =>
  ({ getPrimaryVideoTrack: () => Promise.resolve(track) }) as never

/* eslint-disable @typescript-eslint/require-await */
async function* nothing(): AsyncGenerator<{ close(): void }> {
  // A track that decodes to no samples at all — the case that used to pass.
}
async function* one(): AsyncGenerator<{ close(): void }> {
  yield closable()
}
async function* many(): AsyncGenerator<{ close(): void }> {
  yield closable()
  yield closable()
  yield closable()
}
/* eslint-enable @typescript-eslint/require-await */

describe('requireReadableOutputVideo', () => {
  it('accepts a track that yields a frame', async () => {
    await expect(
      requireReadableOutputVideo(inputWith({}), undefined, one),
    ).resolves.toBeUndefined()
  })

  it('rejects a file with no picture track', async () => {
    await expect(requireReadableOutputVideo(inputWith(null), undefined, one)).rejects.toThrow(
      OutputIntegrityError,
    )
  })

  it('rejects a picture track that decodes to nothing', async () => {
    await expect(requireReadableOutputVideo(inputWith({}), undefined, nothing)).rejects.toThrow(
      OutputIntegrityError,
    )
  })

  it('stops after the first frame rather than walking the file', async () => {
    // The finishing pass already traverses the whole output once for loudness;
    // doing it again for a question one frame answers would double it (VH-51).
    let drawn = 0
    // eslint-disable-next-line @typescript-eslint/require-await
    async function* counted(): AsyncGenerator<{ close(): void }> {
      for (const sample of [closable(), closable(), closable()]) {
        drawn++
        yield sample
      }
    }
    await requireReadableOutputVideo(inputWith({}), undefined, counted)
    expect(drawn).toBe(1)
  })

  it('closes every sample it takes', async () => {
    let closed = 0
    // eslint-disable-next-line @typescript-eslint/require-await
    async function* tracked(): AsyncGenerator<{ close(): void }> {
      yield { close: () => closed++ }
    }
    await requireReadableOutputVideo(inputWith({}), undefined, tracked)
    expect(closed).toBe(1)
  })

  it('reports a cancel as cancelled, not as a broken file', async () => {
    // The distinction VH-57 established. `AbortSignal.throwIfAborted` would
    // raise an AbortError here, which the worker reports as a failed job.
    const controller = new AbortController()
    controller.abort()
    await expect(
      requireReadableOutputVideo(inputWith({}), controller.signal, many),
    ).rejects.toThrow(CancelledError)
  })
})
