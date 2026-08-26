import { afterEach, describe, expect, it, vi } from 'vitest'

import { ResultAuthority } from '../core/result-authority'
import {
  DestinationCleanupError,
  releaseFallbackDownloads,
  saveFile,
  SourceOverwriteError,
  suggestedFileName,
} from './save'

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

interface FakeFileEntry {
  readonly handle: FileSystemFileHandle
  readonly createWritable: ReturnType<typeof vi.fn>
  readonly isSameEntry: ReturnType<typeof vi.fn>
  readonly getFile: ReturnType<typeof vi.fn>
  readonly abortWrite: ReturnType<typeof vi.fn>
}

function fakeFileEntry(
  name: string,
  initial = new File([], name),
  overrides: {
    readonly getFile?: () => Promise<File>
    readonly isSameEntry?: (other: FileSystemHandle) => Promise<boolean>
    readonly writable?: FileSystemWritableFileStream
  } = {},
): FakeFileEntry {
  let visibleFile = initial
  const abortWrite = vi.fn()
  const getFile = vi.fn(() => overrides.getFile?.() ?? Promise.resolve(visibleFile))
  const isSameEntry = vi.fn(
    (other: FileSystemHandle) =>
      overrides.isSameEntry?.(other) ?? Promise.resolve(other === handle),
  )
  const createWritable = vi.fn(() => {
    if (overrides.writable) return Promise.resolve(overrides.writable)
    const chunks: ArrayBuffer[] = []
    return Promise.resolve(
      new WritableStream<Uint8Array>({
        write(chunk) {
          const copy = new Uint8Array(chunk.byteLength)
          copy.set(chunk)
          chunks.push(copy.buffer)
        },
        close() {
          visibleFile = new File(chunks, name, { type: 'video/mp4' })
        },
        abort: abortWrite,
      }) as FileSystemWritableFileStream,
    )
  })
  const handle = {
    kind: 'file',
    name,
    getFile,
    isSameEntry,
    createWritable,
  } as unknown as FileSystemFileHandle
  return { handle, createWritable, isSameEntry, getFile, abortWrite }
}

interface FakeDirectory {
  readonly handle: FileSystemDirectoryHandle
  readonly entries: Map<string, FakeFileEntry | 'directory'>
  readonly getFileHandle: ReturnType<typeof vi.fn>
  readonly removeEntry: ReturnType<typeof vi.fn>
}

function fakeDirectory(
  options: {
    readonly entries?: ReadonlyMap<string, FakeFileEntry | 'directory'>
    readonly create?: (name: string) => FakeFileEntry
    readonly get?: (
      name: string,
      options?: FileSystemGetFileOptions,
    ) => Promise<FileSystemFileHandle> | undefined
  } = {},
): FakeDirectory {
  const entries = new Map(options.entries)
  const getFileHandle = vi.fn(
    async (name: string, getOptions?: FileSystemGetFileOptions): Promise<FileSystemFileHandle> => {
      const overridden = options.get?.(name, getOptions)
      if (overridden) return overridden
      const existing = entries.get(name)
      if (existing === 'directory') throw new DOMException('occupied', 'TypeMismatchError')
      if (existing) return existing.handle
      if (!getOptions?.create) throw new DOMException('missing', 'NotFoundError')
      const created = options.create?.(name) ?? fakeFileEntry(name)
      entries.set(name, created)
      return created.handle
    },
  )
  const removeEntry = vi.fn((name: string) => {
    if (!entries.delete(name)) {
      return Promise.reject(new DOMException('missing', 'NotFoundError'))
    }
    return Promise.resolve()
  })
  const handle = {
    kind: 'directory',
    name: 'output',
    getFileHandle,
    removeEntry,
  } as unknown as FileSystemDirectoryHandle
  return { handle, entries, getFileHandle, removeEntry }
}

function installDirectoryRoute(directory: FileSystemDirectoryHandle): {
  readonly picker: ReturnType<typeof vi.fn>
  readonly requestLock: ReturnType<typeof vi.fn>
} {
  const picker = vi.fn(() => Promise.resolve(directory))
  const requestLock = vi.fn(
    async (name: string, _options: LockOptions, callback: (lock: Lock) => Promise<unknown>) =>
      callback({ name, mode: 'exclusive' }),
  )
  vi.stubGlobal('showDirectoryPicker', picker)
  vi.stubGlobal('navigator', { locks: { request: requestLock } })
  return { picker, requestLock }
}

function installFallback(): {
  readonly click: ReturnType<typeof vi.fn>
  readonly createObjectURL: ReturnType<typeof vi.fn>
  readonly revokeObjectURL: ReturnType<typeof vi.fn>
} {
  const click = vi.fn()
  const createObjectURL = vi.fn(() => 'blob:result')
  const revokeObjectURL = vi.fn()
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  vi.stubGlobal('document', {
    createElement: vi.fn(() => ({ href: '', download: '', click })),
  })
  return { click, createObjectURL, revokeObjectURL }
}

describe('saveFile', () => {
  const file = new File(['finished video'], 'opfs-result.mp4', { type: 'video/mp4' })

  it('streams into an app-named file and returns the actual saved name', async () => {
    const source = fakeFileEntry('source.mp4', new File(['source'], 'source.mp4'))
    const directory = fakeDirectory()
    const { picker, requestLock } = installDirectoryRoute(directory.handle)

    await expect(saveFile(file, 'result.mp4', source.handle)).resolves.toEqual({
      kind: 'saved',
      fileName: 'result.mp4',
    })
    expect(picker).toHaveBeenCalledWith({ id: 'uon-video-output', mode: 'readwrite' })
    expect(requestLock).toHaveBeenCalledOnce()
    const destination = directory.entries.get('result.mp4')
    expect(destination).not.toBe('directory')
    if (!destination || destination === 'directory') throw new Error('missing destination')
    expect(destination.createWritable).toHaveBeenCalledOnce()
    expect((await destination.handle.getFile()).size).toBe(file.size)
    expect(source.createWritable).not.toHaveBeenCalled()
  })

  it('uses readable numbered names instead of overwriting an existing entry', async () => {
    const source = fakeFileEntry('source.mp4', new File(['source'], 'source.mp4'))
    const occupied = fakeFileEntry('result.mp4', new File(['already here'], 'result.mp4'))
    const directory = fakeDirectory({ entries: new Map([['result.mp4', occupied]]) })
    installDirectoryRoute(directory.handle)

    await expect(saveFile(file, 'result.mp4', source.handle)).resolves.toEqual({
      kind: 'saved',
      fileName: 'result (2).mp4',
    })
    expect(occupied.createWritable).not.toHaveBeenCalled()
    expect((await occupied.handle.getFile()).size).toBeGreaterThan(0)
  })

  it('treats an existing directory as an occupied numbered name', async () => {
    const source = fakeFileEntry('source.mp4')
    const directory = fakeDirectory({ entries: new Map([['result.mp4', 'directory']]) })
    installDirectoryRoute(directory.handle)

    await expect(saveFile(file, 'result.mp4', source.handle)).resolves.toEqual({
      kind: 'saved',
      fileName: 'result (2).mp4',
    })
  })

  it('rejects a source identity match before opening any writer or cleanup path', async () => {
    const source = fakeFileEntry('source.mp4', new File(['source'], 'source.mp4'))
    const directory = fakeDirectory({ create: () => source })
    const fallback = installFallback()
    installDirectoryRoute(directory.handle)

    await expect(saveFile(file, 'result.mp4', source.handle)).rejects.toBeInstanceOf(
      SourceOverwriteError,
    )
    expect(source.createWritable).not.toHaveBeenCalled()
    expect(directory.removeEntry).not.toHaveBeenCalled()
    expect(fallback.createObjectURL).not.toHaveBeenCalled()
  })

  it('retains a post-create entry when source identity cannot be proved', async () => {
    const source = fakeFileEntry('source.mp4')
    const uncertain = fakeFileEntry('result.mp4', new File([], 'result.mp4'), {
      isSameEntry: () => Promise.reject(new DOMException('unavailable', 'SecurityError')),
    })
    const directory = fakeDirectory({ create: () => uncertain })
    const fallback = installFallback()
    installDirectoryRoute(directory.handle)

    await expect(saveFile(file, 'result.mp4', source.handle)).rejects.toBeInstanceOf(
      DestinationCleanupError,
    )
    expect(directory.entries.get('result.mp4')).toBe(uncertain)
    expect(directory.removeEntry).not.toHaveBeenCalled()
    expect(uncertain.createWritable).not.toHaveBeenCalled()
    expect(fallback.createObjectURL).not.toHaveBeenCalled()
  })

  it('removes a proved empty placeholder but still surfaces post-create inspection failure', async () => {
    const source = fakeFileEntry('source.mp4')
    let fileReads = 0
    const uncertain = fakeFileEntry('result.mp4', new File([], 'result.mp4'), {
      getFile: () => {
        fileReads++
        if (fileReads === 1)
          return Promise.reject(new DOMException('unavailable', 'NotReadableError'))
        return Promise.resolve(new File([], 'result.mp4'))
      },
    })
    const directory = fakeDirectory({ create: () => uncertain })
    const fallback = installFallback()
    installDirectoryRoute(directory.handle)

    await expect(saveFile(file, 'result.mp4', source.handle)).rejects.toBeInstanceOf(
      DestinationCleanupError,
    )
    expect(directory.removeEntry).toHaveBeenCalledWith('result.mp4')
    expect(directory.entries.has('result.mp4')).toBe(false)
    expect(fallback.createObjectURL).not.toHaveBeenCalled()
  })

  it('preserves a placeholder when its empty state cannot be proved during cleanup', async () => {
    const source = fakeFileEntry('source.mp4')
    const uncertain = fakeFileEntry('result.mp4', new File([], 'result.mp4'), {
      getFile: () => Promise.reject(new DOMException('unavailable', 'NotReadableError')),
    })
    const directory = fakeDirectory({ create: () => uncertain })
    const fallback = installFallback()
    installDirectoryRoute(directory.handle)

    await expect(saveFile(file, 'result.mp4', source.handle)).rejects.toBeInstanceOf(
      DestinationCleanupError,
    )
    expect(directory.entries.get('result.mp4')).toBe(uncertain)
    expect(directory.removeEntry).not.toHaveBeenCalled()
    expect(fallback.createObjectURL).not.toHaveBeenCalled()
  })

  it('treats only NotFoundError as absence and falls back before creating on uncertainty', async () => {
    const source = fakeFileEntry('source.mp4')
    const directory = fakeDirectory({
      get: (_name, options) =>
        options?.create
          ? undefined
          : Promise.reject(new DOMException('permission changed', 'SecurityError')),
    })
    const fallback = installFallback()
    installDirectoryRoute(directory.handle)

    await expect(saveFile(file, 'result.mp4', source.handle)).resolves.toEqual({
      kind: 'download-started',
      fileName: 'result.mp4',
    })
    expect(directory.getFileHandle).toHaveBeenCalledTimes(1)
    expect(directory.entries.size).toBe(0)
    expect(fallback.click).toHaveBeenCalledOnce()
    releaseFallbackDownloads(file)
  })

  it('detects an external replacement during staging before committing any bytes', async () => {
    const source = fakeFileEntry('source.mp4')
    const replacement = fakeFileEntry('result.mp4', new File(['cloud copy'], 'result.mp4'))
    const abortWrite = vi.fn()
    const writable = new WritableStream<Uint8Array>({
      write() {
        directory.entries.set('result.mp4', replacement)
      },
      abort: abortWrite,
    }) as FileSystemWritableFileStream
    const destination = fakeFileEntry('result.mp4', new File([], 'result.mp4'), { writable })
    const directory = fakeDirectory({ create: () => destination })
    const fallback = installFallback()
    installDirectoryRoute(directory.handle)

    await expect(saveFile(file, 'result.mp4', source.handle)).rejects.toBeInstanceOf(
      DestinationCleanupError,
    )
    expect(abortWrite).toHaveBeenCalledOnce()
    expect(directory.entries.get('result.mp4')).toBe(replacement)
    expect((await replacement.handle.getFile()).size).toBeGreaterThan(0)
    expect(directory.removeEntry).not.toHaveBeenCalled()
    expect(fallback.createObjectURL).not.toHaveBeenCalled()
  })

  it('retains cancellation as a distinct normal outcome without fallback', async () => {
    const source = fakeFileEntry('source.mp4')
    const fallback = installFallback()
    vi.stubGlobal('navigator', { locks: { request: vi.fn() } })
    vi.stubGlobal(
      'showDirectoryPicker',
      vi.fn(() => Promise.reject(new DOMException('cancelled', 'AbortError'))),
    )

    await expect(saveFile(file, 'result.mp4', source.handle)).resolves.toEqual({
      kind: 'cancelled',
    })
    expect(source.createWritable).not.toHaveBeenCalled()
    expect(fallback.createObjectURL).not.toHaveBeenCalled()
  })

  it('aborts a pending write, removes its proved empty placeholder, and retains result ownership', async () => {
    const abortWrite = vi.fn()
    const cancelRead = vi.fn()
    const writable = new WritableStream<Uint8Array>({ abort: abortWrite })
    const pendingFile = {
      size: 14,
      stream: () => new ReadableStream<Uint8Array>({ cancel: cancelRead }),
    } as File
    const source = fakeFileEntry('source.mp4')
    const destination = fakeFileEntry('result.mp4', new File([], 'result.mp4'), {
      writable: writable as FileSystemWritableFileStream,
    })
    const directory = fakeDirectory({ create: () => destination })
    const fallback = installFallback()
    installDirectoryRoute(directory.handle)

    const authority = new ResultAuthority<object>()
    const result = {}
    authority.retain(result)
    authority.beginSave(result)
    authority.markDownloadStarted(result)
    authority.beginSave(result)

    const controller = new AbortController()
    const saving = saveFile(pendingFile, 'result.mp4', source.handle, controller.signal)
    await vi.waitFor(() => expect(destination.createWritable).toHaveBeenCalledOnce())
    controller.abort()
    const outcome = await saving
    if (outcome.kind === 'cancelled') authority.retainAfterSave(result)

    expect(outcome).toEqual({ kind: 'cancelled' })
    expect(authority.active).toEqual({ value: result, status: 'download-started' })
    expect(cancelRead).toHaveBeenCalledOnce()
    expect(abortWrite).toHaveBeenCalledOnce()
    expect(directory.removeEntry).toHaveBeenCalledWith('result.mp4')
    expect(fallback.createObjectURL).not.toHaveBeenCalled()
  })

  it('surfaces cancellation cleanup uncertainty and preserves a changed destination', async () => {
    const writable = new WritableStream<Uint8Array>()
    const pendingFile = {
      size: 14,
      stream: () => new ReadableStream<Uint8Array>(),
    } as File
    const source = fakeFileEntry('source.mp4')
    const destination = fakeFileEntry('result.mp4', new File([], 'result.mp4'), {
      writable: writable as FileSystemWritableFileStream,
    })
    const replacement = fakeFileEntry('result.mp4', new File(['external'], 'result.mp4'))
    const directory = fakeDirectory({ create: () => destination })
    const fallback = installFallback()
    installDirectoryRoute(directory.handle)

    const controller = new AbortController()
    const saving = saveFile(pendingFile, 'result.mp4', source.handle, controller.signal)
    await vi.waitFor(() => expect(destination.createWritable).toHaveBeenCalledOnce())
    directory.entries.set('result.mp4', replacement)
    controller.abort()

    await expect(saving).rejects.toBeInstanceOf(DestinationCleanupError)
    expect(directory.entries.get('result.mp4')).toBe(replacement)
    expect(directory.removeEntry).not.toHaveBeenCalled()
    expect(fallback.createObjectURL).not.toHaveBeenCalled()
  })

  it('does not start any save route for an already-aborted request', async () => {
    const controller = new AbortController()
    const picker = vi.fn()
    const fallback = installFallback()
    controller.abort()
    vi.stubGlobal('showDirectoryPicker', picker)
    vi.stubGlobal('navigator', { locks: { request: vi.fn() } })

    await expect(saveFile(file, 'result.mp4', null, controller.signal)).resolves.toEqual({
      kind: 'cancelled',
    })
    expect(picker).not.toHaveBeenCalled()
    expect(fallback.createObjectURL).not.toHaveBeenCalled()
  })

  it('uses the fallback when no comparable source handle exists', async () => {
    const picker = vi.fn()
    const fallback = installFallback()
    vi.stubGlobal('showDirectoryPicker', picker)
    vi.stubGlobal('navigator', { locks: { request: vi.fn() } })

    await expect(saveFile(file, 'result.mp4', null)).resolves.toEqual({
      kind: 'download-started',
      fileName: 'result.mp4',
    })
    expect(picker).not.toHaveBeenCalled()
    expect(fallback.click).toHaveBeenCalledOnce()

    releaseFallbackDownloads(file)
    expect(fallback.revokeObjectURL).toHaveBeenCalledWith('blob:result')
  })

  it('falls back when the directory picker fails before any destination exists', async () => {
    const source = fakeFileEntry('source.mp4')
    const fallback = installFallback()
    vi.stubGlobal('navigator', { locks: { request: vi.fn() } })
    vi.stubGlobal(
      'showDirectoryPicker',
      vi.fn(() => Promise.reject(new Error('directory unavailable'))),
    )

    await expect(saveFile(file, 'result.mp4', source.handle)).resolves.toEqual({
      kind: 'download-started',
      fileName: 'result.mp4',
    })
    expect(fallback.click).toHaveBeenCalledOnce()
    releaseFallbackDownloads(file)
  })

  it('revokes a fallback URL immediately when the download click fails', async () => {
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('showDirectoryPicker', undefined)
    vi.stubGlobal('navigator', {})
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
