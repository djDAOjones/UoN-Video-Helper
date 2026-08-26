import { describe, expect, it, vi } from 'vitest'
import type { InputVideoTrack } from 'mediabunny'

import { OutputIntegrityError, requireReadableOutputVideo } from './output-integrity'

describe('requireReadableOutputVideo', () => {
  const track = {} as InputVideoTrack

  it('rejects a finished file with no primary picture track', async () => {
    await expect(
      requireReadableOutputVideo(
        { getPrimaryVideoTrack: () => Promise.resolve(null) },
        new AbortController().signal,
      ),
    ).rejects.toBeInstanceOf(OutputIntegrityError)
  })

  it('rejects a primary picture track that yields no decoded sample', async () => {
    await expect(
      requireReadableOutputVideo(
        { getPrimaryVideoTrack: () => Promise.resolve(track) },
        new AbortController().signal,
        () => ({
          [Symbol.asyncIterator]: () => ({
            next: () => Promise.resolve({ done: true, value: undefined }),
          }),
        }),
      ),
    ).rejects.toBeInstanceOf(OutputIntegrityError)
  })

  it('accepts one readable sample and closes it', async () => {
    const close = vi.fn()
    await requireReadableOutputVideo(
      { getPrimaryVideoTrack: () => Promise.resolve(track) },
      new AbortController().signal,
      async function* () {
        await Promise.resolve()
        yield { close }
      },
    )
    expect(close).toHaveBeenCalledOnce()
  })

  it('closes a sample yielded at the cancellation boundary', async () => {
    const close = vi.fn()
    const controller = new AbortController()
    await expect(
      requireReadableOutputVideo(
        { getPrimaryVideoTrack: () => Promise.resolve(track) },
        controller.signal,
        async function* () {
          await Promise.resolve()
          controller.abort()
          yield { close }
        },
      ),
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(close).toHaveBeenCalledOnce()
  })
})
