import { afterEach, describe, expect, it, vi } from 'vitest'
import { Mp4OutputFormat, Output } from 'mediabunny'

import {
  OpfsWorkspace,
  ROOT_DIRECTORY,
  createSyncHandleSink,
  initialiseUnderHeldClaim,
  runWithAvailableClaim,
  sweepEntries,
  type ExclusiveLockRequest,
} from './opfs'

afterEach(() => vi.unstubAllGlobals())

/** A deterministic `ifAvailable` exclusive-lock model for ordering regressions. */
class FakeExclusiveLocks {
  private readonly held = new Set<string>()

  readonly request: ExclusiveLockRequest = async (name, callback) => {
    if (this.held.has(name)) {
      await callback(false)
      return
    }

    this.held.add(name)
    try {
      await callback(true)
    } finally {
      this.held.delete(name)
    }
  }

  isHeld(name: string): boolean {
    return this.held.has(name)
  }
}

/** Browser-shaped lock manager whose held state spans the callback promise. */
class FakeBrowserLocks {
  held = false

  readonly request = async (
    name: string,
    options: { readonly ifAvailable?: boolean; readonly mode?: string },
    callback: (lock: Lock | null) => Promise<void>,
  ): Promise<void> => {
    if (this.held) {
      if (options.ifAvailable) {
        await callback(null)
        return
      }
      throw new Error(`Lock already held: ${name}`)
    }

    this.held = true
    try {
      await callback({ name, mode: 'exclusive' })
    } finally {
      this.held = false
    }
  }
}

/** Installs the minimum OPFS surface needed to open and dispose a workspace. */
function installWorkspaceFs(
  removeEntry: (name: string) => Promise<void>,
  workspaceDirectory: FileSystemDirectoryHandle = {} as FileSystemDirectoryHandle,
): FakeBrowserLocks {
  const jobsDirectory = {
    getDirectoryHandle: vi.fn(() => Promise.resolve(workspaceDirectory)),
    removeEntry: vi.fn(removeEntry),
  } as unknown as FileSystemDirectoryHandle
  const originDirectory = {
    getDirectoryHandle: vi.fn((name: string) => {
      expect(name).toBe(ROOT_DIRECTORY)
      return Promise.resolve(jobsDirectory)
    }),
  } as unknown as FileSystemDirectoryHandle
  const locks = new FakeBrowserLocks()

  vi.stubGlobal('navigator', {
    storage: { getDirectory: () => Promise.resolve(originDirectory) },
    locks: { request: locks.request },
  })
  return locks
}

describe('OpfsWorkspace.createFile', () => {
  it('rejects premature fallback finish and retains disposal ownership', async () => {
    let rawReleased = false
    const abortRaw = vi.fn(() => {
      rawReleased = true
    })
    const writable = new WritableStream<FileSystemWriteChunkType>({
      abort: abortRaw,
    }) as FileSystemWritableFileStream
    const createWritable = vi.fn(() => Promise.resolve(writable))
    const createSyncAccessHandle = vi.fn(() =>
      Promise.reject(new DOMException('Denied', 'SecurityError')),
    )
    const getFile = vi.fn(() => Promise.resolve(new File([], 'output.mp4')))
    const fileHandle = {
      createSyncAccessHandle,
      createWritable,
      getFile,
    } as unknown as FileSystemFileHandle
    const workspaceDirectory = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
    } as unknown as FileSystemDirectoryHandle
    const removeEntry = vi.fn(() => {
      if (!rawReleased) return Promise.reject(new Error('raw writer is still open'))
      return Promise.resolve()
    })
    installWorkspaceFs(removeEntry, workspaceDirectory)
    const workspace = await OpfsWorkspace.open('sync-fallback')

    const output = await workspace.createFile('output.mp4')

    expect(createSyncAccessHandle).toHaveBeenCalledOnce()
    expect(createWritable).toHaveBeenCalledOnce()
    expect(output.writerKind).toBe('create-writable-fallback')
    expect(output.syncAccessAdvertised).toBe(true)
    const pendingOwner = new Output({
      format: new Mp4OutputFormat({ fastStart: false }),
      target: output.target,
    })
    await expect(output.finish(pendingOwner)).rejects.toThrow(
      'OPFS output must be successfully finalized before finish()',
    )
    expect(getFile).not.toHaveBeenCalled()
    expect(abortRaw).not.toHaveBeenCalled()
    expect(removeEntry).not.toHaveBeenCalled()

    await expect(workspace.dispose()).resolves.toBeUndefined()
    expect(abortRaw).toHaveBeenCalledOnce()
    expect(removeEntry).toHaveBeenCalledOnce()
  })

  it('commits and finishes the fallback through Mediabunny public lifecycle', async () => {
    let writtenEnd = 0
    let rawClosed = false
    const rawStream = new WritableStream<FileSystemWriteChunkType>()
    const nativeClose = rawStream.close.bind(rawStream)
    const nativeAbort = rawStream.abort.bind(rawStream)
    const writeRaw = vi.fn(async (chunk: FileSystemWriteChunkType) => {
      const positioned = chunk as unknown as {
        readonly data: Uint8Array
        readonly position: number
      }
      writtenEnd = Math.max(writtenEnd, positioned.position + positioned.data.byteLength)
      const writer = rawStream.getWriter()
      try {
        await writer.write(chunk)
      } finally {
        writer.releaseLock()
      }
    })
    const closeRaw = vi.fn(async () => {
      await nativeClose()
      rawClosed = true
    })
    const abortRaw = vi.fn(() => nativeAbort())
    const rawWritable = Object.assign(rawStream, {
      write: writeRaw,
      close: closeRaw,
      abort: abortRaw,
    }) as unknown as FileSystemWritableFileStream
    const getFile = vi.fn(() =>
      Promise.resolve(new File([new Uint8Array(writtenEnd)], 'output.mp4', { type: 'video/mp4' })),
    )
    const fileHandle = {
      createWritable: vi.fn(() => Promise.resolve(rawWritable)),
      getFile,
    } as unknown as FileSystemFileHandle
    const workspaceDirectory = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
    } as unknown as FileSystemDirectoryHandle
    const removeEntry = vi.fn(() => {
      if (!rawClosed) return Promise.reject(new Error('raw writer is still open'))
      return Promise.resolve()
    })
    installWorkspaceFs(removeEntry, workspaceDirectory)
    const workspace = await OpfsWorkspace.open('fallback-retained-lock')
    const outputFile = await workspace.createFile('output.mp4')

    // MP4's public format contract permits zero tracks. That gives this storage
    // regression the smallest real Output lifecycle: start writes the container
    // header and finalize closes the StreamTarget without codecs or browser APIs.
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: false }),
      target: outputFile.target,
    })
    await output.start()
    await output.finalize()

    expect(output.state).toBe('finalized')
    expect(rawWritable.locked).toBe(false)
    expect(writeRaw).toHaveBeenCalledOnce()
    expect(closeRaw).toHaveBeenCalledOnce()
    const file = await outputFile.finish(output)
    expect(file).toBeInstanceOf(File)
    expect(file.size).toBeGreaterThan(0)
    expect(getFile).toHaveBeenCalledOnce()

    await expect(workspace.dispose()).resolves.toBeUndefined()
    expect(abortRaw).not.toHaveBeenCalled()
    expect(removeEntry).toHaveBeenCalledOnce()
  })

  it('refuses bytes after cancellation even though cancellation closed the stream', async () => {
    const abortRaw = vi.fn(() => Promise.resolve())
    const rawWritable = {
      locked: false,
      write: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
      abort: abortRaw,
    } as unknown as FileSystemWritableFileStream
    const getFile = vi.fn(() => Promise.resolve(new File(['partial'], 'output.mp4')))
    const fileHandle = {
      createWritable: vi.fn(() => Promise.resolve(rawWritable)),
      getFile,
    } as unknown as FileSystemFileHandle
    const workspaceDirectory = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
    } as unknown as FileSystemDirectoryHandle
    const removeEntry = vi.fn(() => Promise.resolve())
    installWorkspaceFs(removeEntry, workspaceDirectory)
    const workspace = await OpfsWorkspace.open('cancelled-output')
    const outputFile = await workspace.createFile('output.mp4')
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: false }),
      target: outputFile.target,
    })

    await output.start()
    await output.cancel()

    expect(output.state).toBe('canceled')
    await expect(outputFile.finish(output)).rejects.toThrow(
      'OPFS output must be successfully finalized before finish()',
    )
    expect(getFile).not.toHaveBeenCalled()
    await expect(workspace.dispose()).resolves.toBeUndefined()
    expect(removeEntry).toHaveBeenCalledOnce()
  })

  it('refuses bytes after finalize fails even when the raw writer was released', async () => {
    const abortRaw = vi.fn(() => Promise.resolve())
    const rawWritable = {
      locked: false,
      write: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.reject(new Error('commit failed'))),
      abort: abortRaw,
    } as unknown as FileSystemWritableFileStream
    const getFile = vi.fn(() => Promise.resolve(new File(['partial'], 'output.mp4')))
    const fileHandle = {
      createWritable: vi.fn(() => Promise.resolve(rawWritable)),
      getFile,
    } as unknown as FileSystemFileHandle
    const workspaceDirectory = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
    } as unknown as FileSystemDirectoryHandle
    const removeEntry = vi.fn(() => Promise.resolve())
    installWorkspaceFs(removeEntry, workspaceDirectory)
    const workspace = await OpfsWorkspace.open('failed-finalize')
    const outputFile = await workspace.createFile('output.mp4')
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: false }),
      target: outputFile.target,
    })

    await output.start()
    await expect(output.finalize()).rejects.toThrow('commit failed')

    expect(output.state).not.toBe('finalized')
    await expect(outputFile.finish(output)).rejects.toThrow(
      'OPFS output must be successfully finalized before finish()',
    )
    expect(getFile).not.toHaveBeenCalled()
    await expect(workspace.dispose()).resolves.toBeUndefined()
    expect(removeEntry).toHaveBeenCalledOnce()
  })

  it('closes an opened sync handle when initial truncation fails', async () => {
    const close = vi.fn()
    const createWritable = vi.fn()
    const fileHandle = {
      createSyncAccessHandle: vi.fn(() =>
        Promise.resolve({
          truncate: () => {
            throw new Error('truncate failed')
          },
          close,
        } as unknown as FileSystemSyncAccessHandle),
      ),
      createWritable,
    } as unknown as FileSystemFileHandle
    const workspaceDirectory = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
    } as unknown as FileSystemDirectoryHandle
    installWorkspaceFs(() => Promise.resolve(), workspaceDirectory)
    const workspace = await OpfsWorkspace.open('truncate-failure')

    await expect(workspace.createFile('output.mp4')).rejects.toThrow('truncate failed')
    expect(close).toHaveBeenCalledOnce()
    expect(createWritable).not.toHaveBeenCalled()
    await workspace.dispose()
  })

  it('retains an untruncated sync handle when its first close also fails', async () => {
    let closeAttempts = 0
    const close = vi.fn(() => {
      closeAttempts++
      if (closeAttempts === 1) throw new Error('handle still busy')
    })
    const handle = {
      truncate: vi.fn(() => {
        throw new Error('truncate failed')
      }),
      close,
    } as unknown as FileSystemSyncAccessHandle
    const fileHandle = {
      createSyncAccessHandle: vi.fn(() => Promise.resolve(handle)),
      createWritable: vi.fn(),
    } as unknown as FileSystemFileHandle
    const workspaceDirectory = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
    } as unknown as FileSystemDirectoryHandle
    const removeEntry = vi.fn(() => Promise.resolve())
    installWorkspaceFs(removeEntry, workspaceDirectory)
    const workspace = await OpfsWorkspace.open('truncate-close-retry')

    await expect(workspace.createFile('output.mp4')).rejects.toThrow('truncate failed')
    expect(close).toHaveBeenCalledOnce()
    expect(removeEntry).not.toHaveBeenCalled()
    await expect(workspace.dispose()).resolves.toBeUndefined()
    expect(close).toHaveBeenCalledTimes(2)
    expect(removeEntry).toHaveBeenCalledOnce()
  })
})

describe('initialiseUnderHeldClaim', () => {
  it('initialises under the lock and holds it for the resource lifetime', async () => {
    const locks = new FakeExclusiveLocks()
    let claimRequest: Promise<void> | undefined
    const request: ExclusiveLockRequest = (name, callback) => {
      claimRequest = locks.request(name, callback)
      return claimRequest
    }

    const claim = await initialiseUnderHeldClaim(request, 'job:a', () => {
      expect(locks.isHeld('job:a')).toBe(true)
      return Promise.resolve({ directory: 'a' })
    })

    expect(claim.value).toEqual({ directory: 'a' })
    expect(locks.isHeld('job:a')).toBe(true)
    const competingOperation = vi.fn<() => Promise<void>>(() => Promise.resolve())
    expect(await runWithAvailableClaim(locks.request, 'job:a', competingOperation)).toBe(false)
    expect(competingOperation).not.toHaveBeenCalled()

    claim.release()
    await claimRequest
    expect(locks.isHeld('job:a')).toBe(false)
  })

  it('does not initialise when the claim is unavailable', async () => {
    const initialise = vi.fn<() => Promise<string>>(() => Promise.resolve('directory'))
    const unavailable: ExclusiveLockRequest = async (_name, callback) => {
      await callback(false)
    }

    await expect(initialiseUnderHeldClaim(unavailable, 'job:a', initialise)).rejects.toThrow(
      'Exclusive lock is already held: job:a',
    )
    expect(initialise).not.toHaveBeenCalled()
  })

  it('does not initialise when the lock manager rejects', async () => {
    const initialise = vi.fn<() => Promise<string>>(() => Promise.resolve('directory'))
    const failed: ExclusiveLockRequest = () => Promise.reject(new Error('lock manager failed'))

    await expect(initialiseUnderHeldClaim(failed, 'job:a', initialise)).rejects.toThrow(
      'lock manager failed',
    )
    expect(initialise).not.toHaveBeenCalled()
  })

  it('releases the claim when directory initialisation fails', async () => {
    const locks = new FakeExclusiveLocks()
    let claimRequest: Promise<void> | undefined
    const request: ExclusiveLockRequest = (name, callback) => {
      claimRequest = locks.request(name, callback)
      return claimRequest
    }

    await expect(
      initialiseUnderHeldClaim(request, 'job:a', () =>
        Promise.reject(new Error('directory creation failed')),
      ),
    ).rejects.toThrow('directory creation failed')
    await claimRequest
    expect(locks.isHeld('job:a')).toBe(false)
  })
})

describe('runWithAvailableClaim', () => {
  it('keeps orphan deletion inside the same lock observation', async () => {
    const locks = new FakeExclusiveLocks()
    const deleted = vi.fn<() => Promise<void>>(() => Promise.resolve())

    const removed = await runWithAvailableClaim(locks.request, 'job:orphan', async () => {
      expect(locks.isHeld('job:orphan')).toBe(true)
      const competingOperation = vi.fn<() => Promise<void>>(() => Promise.resolve())
      expect(await runWithAvailableClaim(locks.request, 'job:orphan', competingOperation)).toBe(
        false,
      )
      expect(competingOperation).not.toHaveBeenCalled()
      await deleted()
    })

    expect(removed).toBe(true)
    expect(deleted).toHaveBeenCalledOnce()
    expect(locks.isHeld('job:orphan')).toBe(false)
  })

  it('does not delete when lock-manager state is uncertain', async () => {
    const deleted = vi.fn<() => Promise<void>>(() => Promise.resolve())
    const failed: ExclusiveLockRequest = () => Promise.reject(new Error('lock manager failed'))

    await expect(runWithAvailableClaim(failed, 'job:orphan', deleted)).rejects.toThrow(
      'lock manager failed',
    )
    expect(deleted).not.toHaveBeenCalled()
  })
})

describe('sweepEntries', () => {
  it('attempts later entries after a claim or removal failure', async () => {
    const attempted: string[] = []
    const failed: string[] = []

    const removed = await sweepEntries(
      ['broken', 'claimed', 'orphan'],
      (name) => {
        attempted.push(name)
        if (name === 'broken') return Promise.reject(new Error('cannot remove'))
        return Promise.resolve(name === 'orphan')
      },
      (name) => failed.push(name),
    )

    expect(removed).toBe(1)
    expect(attempted).toEqual(['broken', 'claimed', 'orphan'])
    expect(failed).toEqual(['broken'])
  })

  it('does nothing for an empty root', async () => {
    const remove = vi.fn<(name: string) => Promise<boolean>>()
    const failed = vi.fn<(name: string, cause: unknown) => void>()

    expect(await sweepEntries([], remove, failed)).toBe(0)
    expect(remove).not.toHaveBeenCalled()
    expect(failed).not.toHaveBeenCalled()
  })
})

describe('createSyncHandleSink', () => {
  it('accepts a complete positioned write', async () => {
    const handle: Pick<FileSystemSyncAccessHandle, 'write' | 'flush' | 'close'> = {
      write: vi.fn((data: AllowSharedBufferSource) => data.byteLength),
      flush: vi.fn(),
      close: vi.fn(),
    }
    const onClosed = vi.fn()
    const sink = createSyncHandleSink(handle, onClosed)
    const writer = sink.writable.getWriter()
    const data = new Uint8Array([1, 2, 3, 4])

    await expect(writer.write({ type: 'write', data, position: 11 })).resolves.toBeUndefined()
    expect(handle.write).toHaveBeenCalledWith(data, { at: 11 })
    await writer.close()
    expect(handle.flush).toHaveBeenCalledOnce()
    expect(handle.close).toHaveBeenCalledOnce()
    expect(onClosed).toHaveBeenCalledOnce()
  })

  it('rejects a short synchronous write instead of finalising corrupt bytes', async () => {
    const handle: Pick<FileSystemSyncAccessHandle, 'write' | 'flush' | 'close'> = {
      write: vi.fn(() => 3),
      flush: vi.fn(),
      close: vi.fn(),
    }
    const sink = createSyncHandleSink(handle, vi.fn())
    const writer = sink.writable.getWriter()

    await expect(
      writer.write({ type: 'write', data: new Uint8Array([1, 2, 3, 4]), position: 20 }),
    ).rejects.toThrow('OPFS short write at byte 20: wrote 3 of 4 bytes')
  })

  it('retains close ownership after a transient close failure', () => {
    let closeAttempts = 0
    const handle: Pick<FileSystemSyncAccessHandle, 'write' | 'flush' | 'close'> = {
      write: vi.fn((data: AllowSharedBufferSource) => data.byteLength),
      flush: vi.fn(),
      close: vi.fn(() => {
        closeAttempts++
        if (closeAttempts === 1) throw new Error('handle still busy')
      }),
    }
    const onClosed = vi.fn()
    const sink = createSyncHandleSink(handle, onClosed)

    expect(() => sink.close()).toThrow('handle still busy')
    expect(onClosed).not.toHaveBeenCalled()
    expect(() => sink.close()).not.toThrow()
    expect(onClosed).toHaveBeenCalledOnce()
    expect(handle.close).toHaveBeenCalledTimes(2)
  })
})

describe('OpfsWorkspace.dispose', () => {
  it('retains a sync handle for a later cleanup attempt when close fails', async () => {
    let closeAttempts = 0
    const close = vi.fn(() => {
      closeAttempts++
      if (closeAttempts === 1) throw new Error('handle still busy')
    })
    const handle = {
      truncate: vi.fn(),
      write: vi.fn((data: AllowSharedBufferSource) => data.byteLength),
      flush: vi.fn(),
      close,
    } as unknown as FileSystemSyncAccessHandle
    const fileHandle = {
      createSyncAccessHandle: vi.fn(() => Promise.resolve(handle)),
    } as unknown as FileSystemFileHandle
    const workspaceDirectory = {
      getFileHandle: vi.fn(() => Promise.resolve(fileHandle)),
    } as unknown as FileSystemDirectoryHandle
    const removeEntry = vi.fn(() => Promise.resolve())
    const locks = installWorkspaceFs(removeEntry, workspaceDirectory)
    const workspace = await OpfsWorkspace.open('retry-handle-close')
    await workspace.createFile('output.mp4')

    await expect(workspace.dispose()).rejects.toThrow('Temporary file handles could not be closed')
    expect(removeEntry).not.toHaveBeenCalled()
    expect(locks.held).toBe(true)

    await expect(workspace.dispose()).resolves.toBeUndefined()
    expect(close).toHaveBeenCalledTimes(2)
    expect(removeEntry).toHaveBeenCalledOnce()
    await vi.waitFor(() => expect(locks.held).toBe(false))
  })

  it('joins a concurrent failed attempt, keeps its claim, and retries later', async () => {
    const removalFailure = new Error('directory is temporarily busy')
    let attempts = 0
    let rejectFirst: ((cause: unknown) => void) | undefined
    const removeEntry = vi.fn((_name: string): Promise<void> => {
      attempts++
      return attempts === 1
        ? new Promise((_resolve, reject) => {
            rejectFirst = reject
          })
        : Promise.resolve()
    })
    const locks = installWorkspaceFs(removeEntry)
    const workspace = await OpfsWorkspace.open('retry-dispose')

    expect(locks.held).toBe(true)
    const first = workspace.dispose()
    const joined = workspace.dispose()
    expect(joined).toBe(first)
    await vi.waitFor(() => expect(removeEntry).toHaveBeenCalledTimes(1))

    rejectFirst?.(removalFailure)
    await expect(first).rejects.toBe(removalFailure)
    await expect(joined).rejects.toBe(removalFailure)
    expect(removeEntry).toHaveBeenCalledTimes(1)
    expect(locks.held).toBe(true)

    await expect(workspace.dispose()).resolves.toBeUndefined()
    expect(removeEntry).toHaveBeenCalledTimes(2)
    await vi.waitFor(() => expect(locks.held).toBe(false))

    // Successful disposal is idempotent; only the failed attempt was retried.
    await expect(workspace.dispose()).resolves.toBeUndefined()
    expect(removeEntry).toHaveBeenCalledTimes(2)
  })

  it('joins a concurrent successful removal and remains idempotent', async () => {
    let resolveRemoval: (() => void) | undefined
    const removeEntry = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRemoval = resolve
        }),
    )
    installWorkspaceFs(removeEntry)
    const workspace = await OpfsWorkspace.open('joined-dispose')

    const first = workspace.dispose()
    const joined = workspace.dispose()
    expect(joined).toBe(first)
    await vi.waitFor(() => expect(removeEntry).toHaveBeenCalledTimes(1))

    resolveRemoval?.()
    await expect(Promise.all([first, joined])).resolves.toEqual([undefined, undefined])
    await expect(workspace.dispose()).resolves.toBeUndefined()
    expect(removeEntry).toHaveBeenCalledTimes(1)
  })
})
