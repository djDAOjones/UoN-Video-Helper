/**
 * The trim preview following the handle (VH-125).
 *
 * The invariant: the preview comes to rest on the last time asked for, never
 * on one a drag passed through, and a time asked for one file is never shown
 * on the next. The element is a stand-in with a seek that lands when the
 * test says; the real decode is checked in Chrome.
 */

import { describe, expect, it } from 'vitest'

import { createPreviewSeeker } from './preview-seek'

/** A media element whose seeks start when `currentTime` is written and land on `land()`. */
class FakeMedia extends EventTarget {
  seeking = false
  paused = true
  readonly seeks: number[] = []
  private time = 0

  get currentTime(): number {
    return this.time
  }

  set currentTime(seconds: number) {
    this.time = seconds
    this.seeking = true
    this.seeks.push(seconds)
  }

  pause(): void {
    this.paused = true
  }

  land(): void {
    this.seeking = false
    this.dispatchEvent(new Event('seeked'))
  }
}

describe('the preview following a handle', () => {
  it('shows the time at once when no seek is running', () => {
    const media = new FakeMedia()
    createPreviewSeeker(media).seekTo(12.5)
    expect(media.seeks).toEqual([12.5])
  })

  it('comes to rest on the last time of a drag, skipping the ones in between', () => {
    const media = new FakeMedia()
    const seeker = createPreviewSeeker(media)
    seeker.seekTo(5)
    seeker.seekTo(6)
    seeker.seekTo(7)
    media.land()
    expect(media.seeks).toEqual([5, 7])
    media.land()
    expect(media.seeks).toEqual([5, 7])
    expect(media.currentTime).toBe(7)
  })

  it('keeps drawing during a long drag: each landed seek takes the latest time', () => {
    const media = new FakeMedia()
    const seeker = createPreviewSeeker(media)
    seeker.seekTo(1)
    seeker.seekTo(2)
    media.land()
    seeker.seekTo(3)
    seeker.seekTo(4)
    media.land()
    media.land()
    expect(media.seeks).toEqual([1, 2, 4])
  })

  it('pauses a playing preview, so it shows the frame at the handle', () => {
    const media = new FakeMedia()
    media.paused = false
    createPreviewSeeker(media).seekTo(30)
    expect(media.paused).toBe(true)
  })

  it('leaves the preview alone when the user seeks it themselves', () => {
    const media = new FakeMedia()
    createPreviewSeeker(media)
    media.currentTime = 40
    media.land()
    expect(media.seeks).toEqual([40])
  })

  it('drops a time waiting for the previous file when the preview is emptied', () => {
    const media = new FakeMedia()
    const seeker = createPreviewSeeker(media)
    seeker.seekTo(5)
    seeker.seekTo(90)
    media.dispatchEvent(new Event('emptied'))
    media.land()
    expect(media.seeks).toEqual([5])
  })
})
