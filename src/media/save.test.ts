import { describe, expect, it } from 'vitest'

import { isSourceDestination, saveFile, suggestedFileName } from './save'

describe('suggestedFileName', () => {
  it('keeps the name the user recognises and marks it as the new file', () => {
    expect(suggestedFileName('Week 3 Lecture.mp4')).toBe('Week 3 Lecture (branded).mp4')
    expect(suggestedFileName('seminar.mov')).toBe('seminar (branded).mp4')
  })

  it('marks the file with what the job did (U-24, Codex review of VH-114)', () => {
    expect(suggestedFileName('talk.mp4', { closing: true, sound: true })).toBe('talk (branded).mp4')
    expect(suggestedFileName('talk.mp4', { closing: false, sound: true })).toBe('talk (levelled).mp4')
    // Silent, and no closing: nothing was levelled and nothing was branded.
    expect(suggestedFileName('talk.mp4', { closing: false, sound: false })).toBe('talk (converted).mp4')
  })

  it('always ends up as .mp4, whatever went in', () => {
    for (const name of ['a.mkv', 'b.webm', 'c.MP4', 'd']) {
      expect(suggestedFileName(name).endsWith('.mp4')).toBe(true)
    }
  })

  it('only strips the final extension', () => {
    expect(suggestedFileName('lecture.part2.mp4')).toBe('lecture.part2 (branded).mp4')
  })

  it('falls back to something usable for a nameless file', () => {
    expect(suggestedFileName('')).toBe('video (branded).mp4')
    expect(suggestedFileName('   ')).toBe('video (branded).mp4')
    expect(suggestedFileName('.mp4')).toBe('video (branded).mp4')
  })

  it('never returns a name that could overwrite the source', () => {
    for (const name of ['x.mp4', 'Lecture.mp4']) {
      expect(suggestedFileName(name)).not.toBe(name)
    }
  })
})

/**
 * VH-56. "The source file is never modified" is a headline promise in
 * `README.md` and on the screen, and the save picker made it falsifiable: it
 * returns whatever the user selected, and selecting the original was allowed.
 * A suggested name is a suggestion, not a guard.
 */
describe('isSourceDestination', () => {
  const source = { name: 'Week 3 Lecture.mp4', size: 7_089_574, lastModified: 1_648_400_000_000 }

  it('refuses the source itself', () => {
    expect(isSourceDestination({ ...source }, source)).toBe(true)
  })

  it('allows a destination that does not exist yet', () => {
    // The ordinary case: the user typed a new name, so there is nothing there.
    expect(isSourceDestination(null, source)).toBe(false)
  })

  it('allows the suggested name beside the source', () => {
    const destination = { ...source, name: suggestedFileName(source.name) }
    expect(isSourceDestination(destination, source)).toBe(false)
  })

  it('allows a same-named file that is a different file', () => {
    expect(isSourceDestination({ ...source, size: source.size + 1 }, source)).toBe(false)
    expect(isSourceDestination({ ...source, lastModified: 0 }, source)).toBe(false)
  })

  it('does not confuse last year’s copy with this one', () => {
    // Same lecture, re-recorded: same name, different everything else.
    const destination = { name: source.name, size: 9_000_000, lastModified: 1_700_000_000_000 }
    expect(isSourceDestination(destination, source)).toBe(false)
  })
})

describe('a streaming save can be stopped (VH-110)', () => {
  /** Saves a slow ten-chunk stream to a stubbed picker and stops it part-way. */
  async function stopMidSave(existingBytes: number): Promise<{
    outcome: string
    aborted: number
    wrote: number
    removed: number
  }> {
    let aborted = 0
    let wrote = 0
    const writable = new WritableStream<Uint8Array>({
      write: async (chunk) => {
        wrote += chunk.length
        // Slow enough that the stop lands mid-stream.
        await new Promise((resolve) => setTimeout(resolve, 20))
      },
      abort: () => {
        aborted++
      },
    })
    let removed = 0
    const handle = {
      getFile: () => Promise.resolve(new File([new Uint8Array(existingBytes)], 'out.mp4')),
      createWritable: () => Promise.resolve(writable),
      isSameEntry: () => Promise.resolve(false),
      remove: () => {
        removed++
        return Promise.resolve()
      },
      name: 'out.mp4',
    }
    const previous = (globalThis as { showSaveFilePicker?: unknown }).showSaveFilePicker
    ;(globalThis as { showSaveFilePicker?: unknown }).showSaveFilePicker = () => Promise.resolve(handle)
    try {
      // Ten chunks rather than a real File: Node hands a File's bytes to the
      // pipe in one chunk, which leaves nothing to stop mid-stream.
      let pulled = 0
      const file = {
        size: 200_000,
        stream: () =>
          new ReadableStream<Uint8Array>({
            pull: (stream) => {
              if (pulled++ < 10) stream.enqueue(new Uint8Array(20_000))
              else stream.close()
            },
          }),
      } as unknown as File
      const controller = new AbortController()
      const saving = saveFile(file, 'big (branded).mp4', undefined, controller.signal)
      await new Promise((resolve) => setTimeout(resolve, 30))
      controller.abort()
      const result = await saving
      return { outcome: result.outcome, aborted, wrote, removed }
    } finally {
      ;(globalThis as { showSaveFilePicker?: unknown }).showSaveFilePicker = previous
    }
  }

  it('aborts the writable and reports cancelled, leaving the result to try again', async () => {
    const stopped = await stopMidSave(0)
    expect(stopped.outcome).toBe('cancelled')
    expect(stopped.aborted).toBe(1)
    expect(stopped.wrote).toBeLessThan(200_000)
    // Cancel leaves nothing behind: the empty file the picker made is gone.
    expect(stopped.removed).toBe(1)
  })

  it('never removes a file the user chose to replace', async () => {
    // The abort discards the swap file, so their file is as it was.
    const stopped = await stopMidSave(1_000)
    expect(stopped.outcome).toBe('cancelled')
    expect(stopped.removed).toBe(0)
  })
})
