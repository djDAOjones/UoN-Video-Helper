import type * as MediabunnyModule from 'mediabunny'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  feedBrandingAudio,
  feedBrandingVideo,
  type BrandingClip,
  type BrandingRenderer,
} from './branding'

const yielded = vi.hoisted(() => ({
  audio: [] as Array<{ close(): void }>,
  video: [] as Array<{ close(): void }>,
}))

vi.mock('mediabunny', async (importOriginal) => {
  const actual = await importOriginal<typeof MediabunnyModule>()
  return {
    ...actual,
    AudioSampleSink: class {
      samples(): AsyncIterable<{ close(): void }> {
        const samples = yielded.audio[Symbol.iterator]()
        return {
          [Symbol.asyncIterator]: () => ({ next: () => Promise.resolve(samples.next()) }),
        }
      }
    },
    VideoSampleSink: class {
      samples(): AsyncIterable<{ close(): void }> {
        const samples = yielded.video[Symbol.iterator]()
        return {
          [Symbol.asyncIterator]: () => ({ next: () => Promise.resolve(samples.next()) }),
        }
      }
    },
  }
})

beforeEach(() => {
  yielded.audio = []
  yielded.video = []
})

describe('branding sample ownership on cancellation', () => {
  it('closes a video sample yielded after the signal was aborted', async () => {
    const close = vi.fn()
    yielded.video.push({ close })
    const clip = {
      input: { getPrimaryVideoTrack: vi.fn(() => Promise.resolve({})) },
      durationSeconds: 1,
      segment: 'closing',
    } as unknown as BrandingClip
    const target = { add: vi.fn() }
    const renderer = { render: vi.fn() }
    const controller = new AbortController()
    controller.abort()

    await feedBrandingVideo(
      clip,
      target as never,
      0,
      renderer as unknown as BrandingRenderer,
      controller.signal,
    )

    expect(close).toHaveBeenCalledOnce()
    expect(renderer.render).not.toHaveBeenCalled()
    expect(target.add).not.toHaveBeenCalled()
  })

  it('closes an audio sample yielded after the signal was aborted', async () => {
    const close = vi.fn()
    yielded.audio.push({ close })
    const clip = {
      input: {
        getPrimaryAudioTrack: vi.fn(() =>
          Promise.resolve({
            getSampleRate: () => Promise.resolve(48_000),
            getNumberOfChannels: () => Promise.resolve(2),
          }),
        ),
      },
      durationSeconds: 1,
      segment: 'closing',
    } as unknown as BrandingClip
    const emit = vi.fn()
    const controller = new AbortController()
    controller.abort()

    await feedBrandingAudio(
      clip,
      emit,
      0,
      { fadeIn: false, fadeOut: false },
      controller.signal,
    )

    expect(close).toHaveBeenCalledOnce()
    expect(emit).not.toHaveBeenCalled()
  })
})
