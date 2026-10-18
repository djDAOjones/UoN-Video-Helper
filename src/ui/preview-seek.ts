/**
 * The trim preview follows the handle (VH-125): moving a handle, or typing a
 * time, shows that point of the video in the preview.
 *
 * A drag asks for a new time on every input event, faster than a long video
 * can decode a frame from its last keyframe. Setting `currentTime` again
 * while a seek is running abandons it, so a straight write on each event
 * shows nothing until the pointer stops. Instead the latest time waits for
 * the running seek to land, and every earlier one is dropped: the preview
 * keeps drawing frames during the drag, and always comes to rest on the
 * last time asked for.
 */

/** The parts of a media element the seeker uses; narrow, so the scheduling is tested in Node. */
export type SeekableMedia = Pick<HTMLMediaElement, 'currentTime' | 'seeking' | 'paused' | 'pause'> &
  Pick<EventTarget, 'addEventListener'>

/**
 * Wraps one preview element.
 *
 * @returns `seekTo`, which pauses a playing preview — a handle being placed
 *   wants the frame at the handle, not the frames after it — and shows
 *   `seconds` as soon as the element can take it.
 */
export function createPreviewSeeker(media: SeekableMedia): { seekTo(seconds: number): void } {
  let pendingSeconds: number | null = null

  media.addEventListener('seeked', () => {
    if (pendingSeconds === null) return
    const next = pendingSeconds
    pendingSeconds = null
    media.currentTime = next
  })
  // A new file, or none: a time waiting for the old one belongs to nothing.
  media.addEventListener('emptied', () => {
    pendingSeconds = null
  })

  return {
    seekTo(seconds: number): void {
      if (!media.paused) media.pause()
      if (media.seeking) {
        pendingSeconds = seconds
        return
      }
      media.currentTime = seconds
    },
  }
}
