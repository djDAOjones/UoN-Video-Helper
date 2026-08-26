import { afterEach, describe, expect, it, vi } from 'vitest'

import { releaseFallbackDownloads, saveFile, SourceOverwriteError, suggestedFileName } from './save'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('suggestedFileName', () => {
  it('keeps the name the user recognises and marks it as the new file', () => {
    expect(suggestedFileName('Week 3 Lecture.mp4')).toBe('Week 3 Lecture (branded).mp4')
    expect(suggestedFileName('seminar.mov')).toBe('seminar (branded).mp4')
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

describe('saveFile', () => {
  const file = new Blob(['finished video'], { type: 'video/mp4' }) as File

  function fakeHandle(options?: {
    readonly sameEntry?: boolean
    readonly writable?: WritableStream<Uint8Array>
  }): {
    readonly handle: FileSystemFileHandle
    readonly isSameEntry: ReturnType<typeof vi.fn>
    readonly createWritable: ReturnType<typeof vi.fn>
  } {
    const isSameEntry = vi.fn(() => Promise.resolve(options?.sameEntry ?? false))
    const createWritable = vi.fn(() =>
      Promise.resolve(options?.writable ?? new WritableStream<Uint8Array>()),
    )
    const handle = {
      kind: 'file',
      name: 'video.mp4',
      getFile: vi.fn(() => Promise.resolve(file)),
      isSameEntry,
      createWritable,
    } as unknown as FileSystemFileHandle
    return { handle, isSameEntry, createWritable }
  }

  it('writes a different destination and reports success only after it closes', async () => {
    let closed = false
    const writable = new WritableStream<Uint8Array>({
      close() {
        closed = true
      },
    })
    const source = fakeHandle()
    const destination = fakeHandle({ writable })
    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(() => Promise.resolve(destination.handle)),
    )

    await expect(saveFile(file, 'result.mp4', source.handle)).resolves.toBe('saved')
    expect(destination.isSameEntry).toHaveBeenCalledWith(source.handle)
    expect(destination.createWritable).toHaveBeenCalledOnce()
    expect(source.createWritable).not.toHaveBeenCalled()
    expect(closed).toBe(true)
  })

  it('rejects the source as destination before requesting write access', async () => {
    const source = fakeHandle()
    const destination = fakeHandle({ sameEntry: true })
    const createObjectURL = vi.fn()
    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(() => Promise.resolve(destination.handle)),
    )
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })

    await expect(saveFile(file, 'result.mp4', source.handle)).rejects.toBeInstanceOf(
      SourceOverwriteError,
    )
    expect(destination.isSameEntry).toHaveBeenCalledWith(source.handle)
    expect(destination.createWritable).not.toHaveBeenCalled()
    expect(source.createWritable).not.toHaveBeenCalled()
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('retains cancellation as a distinct normal outcome', async () => {
    const source = fakeHandle()
    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(() => Promise.reject(new DOMException('cancelled', 'AbortError'))),
    )

    await expect(saveFile(file, 'result.mp4', source.handle)).resolves.toBe('cancelled')
    expect(source.createWritable).not.toHaveBeenCalled()
  })

  it('uses the fallback when no comparable source handle exists', async () => {
    const click = vi.fn()
    const revokeObjectURL = vi.fn()
    const savePicker = vi.fn()
    vi.stubGlobal('showSaveFilePicker', savePicker)
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:result'),
      revokeObjectURL,
    })
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({ href: '', download: '', click })),
    })

    await expect(saveFile(file, 'result.mp4', null)).resolves.toBe('download-started')
    expect(savePicker).not.toHaveBeenCalled()
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).not.toHaveBeenCalled()

    releaseFallbackDownloads(file)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:result')
  })

  it('does not turn a picker failure plus fallback into durable success', async () => {
    const source = fakeHandle()
    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(() => Promise.reject(new Error('disk full'))),
    )
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:result'),
      revokeObjectURL: vi.fn(),
    })
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({ href: '', download: '', click: vi.fn() })),
    })

    await expect(saveFile(file, 'result.mp4', source.handle)).resolves.toBe('download-started')
    releaseFallbackDownloads(file)
  })

  it('revokes a fallback URL immediately when the download click fails', async () => {
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('showSaveFilePicker', undefined)
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:failed-result'),
      revokeObjectURL,
    })
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        href: '',
        download: '',
        click: () => {
          throw new Error('download blocked')
        },
      })),
    })

    await expect(saveFile(file, 'result.mp4', null)).rejects.toThrow('download blocked')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:failed-result')
  })
})
