import { describe, expect, it, vi } from 'vitest'

import { checkOpfsUsable, type OpfsUsabilityEnvironment } from './capability'

type FailureStage =
  | 'root'
  | 'directory'
  | 'file'
  | 'writer'
  | 'write'
  | 'close'
  | 'remove-file'
  | 'remove-directory'
  | 'cleanup-recursive'

interface FakeCanary {
  readonly environment: OpfsUsabilityEnvironment
  readonly calls: string[]
  readonly state: {
    lockHeld: boolean
    directoryExists: boolean
    fileExists: boolean
    writerOpen: boolean
  }
}

/** Browser-shaped OPFS and Web Locks fakes with observable persistent state. */
function fakeCanary(
  options: {
    readonly secure?: boolean
    readonly hasLocks?: boolean
    readonly lockAvailable?: boolean
    readonly failures?: readonly FailureStage[]
  } = {},
): FakeCanary {
  const failures = new Set(options.failures ?? [])
  const calls: string[] = []
  const state = {
    lockHeld: false,
    directoryExists: false,
    fileExists: false,
    writerOpen: false,
  }
  const record = (call: string): void => {
    expect(state.lockHeld).toBe(true)
    calls.push(call)
  }

  const writable = {
    write: vi.fn((data: unknown) => {
      record('write')
      expect(data).toEqual(new Uint8Array([0x55, 0x4f, 0x4e]))
      if (failures.has('write')) return Promise.reject(new Error('write failed'))
      return Promise.resolve()
    }),
    close: vi.fn(() => {
      record('close')
      if (failures.has('close')) return Promise.reject(new Error('close failed'))
      state.writerOpen = false
      return Promise.resolve()
    }),
    abort: vi.fn(() => {
      record('abort')
      state.writerOpen = false
      return Promise.resolve()
    }),
  } as unknown as FileSystemWritableFileStream

  const file = {
    createWritable: vi.fn(() => {
      record('create-writer')
      if (failures.has('writer')) return Promise.reject(new Error('writer failed'))
      state.writerOpen = true
      return Promise.resolve(writable)
    }),
  } as unknown as FileSystemFileHandle

  const directory = {
    getFileHandle: vi.fn((name: string, create: { readonly create?: boolean }) => {
      record(`create-file:${name}`)
      expect(create.create).toBe(true)
      if (failures.has('file')) return Promise.reject(new Error('file failed'))
      state.fileExists = true
      return Promise.resolve(file)
    }),
    removeEntry: vi.fn((name: string) => {
      record(`remove-file:${name}`)
      if (failures.has('remove-file')) return Promise.reject(new Error('file removal failed'))
      state.fileExists = false
      return Promise.resolve()
    }),
  } as unknown as FileSystemDirectoryHandle

  const root = {
    getDirectoryHandle: vi.fn((name: string, create: { readonly create?: boolean }) => {
      record(`create-directory:${name}`)
      expect(create.create).toBe(true)
      if (failures.has('directory')) return Promise.reject(new Error('directory failed'))
      state.directoryExists = true
      return Promise.resolve(directory)
    }),
    removeEntry: vi.fn((name: string, remove?: { readonly recursive?: boolean }) => {
      const kind = remove?.recursive ? 'recursive' : 'empty'
      record(`remove-directory:${name}:${kind}`)
      if (remove?.recursive && failures.has('cleanup-recursive')) {
        return Promise.reject(new Error('recursive cleanup failed'))
      }
      if (!remove?.recursive && failures.has('remove-directory')) {
        return Promise.reject(new Error('directory removal failed'))
      }
      state.directoryExists = false
      state.fileExists = false
      return Promise.resolve()
    }),
  } as unknown as FileSystemDirectoryHandle

  const getDirectory = vi.fn(() => {
    record('get-root')
    if (failures.has('root')) return Promise.reject(new Error('root failed'))
    return Promise.resolve(root)
  })
  const requestLock: NonNullable<OpfsUsabilityEnvironment['requestLock']> = async (
    name,
    callback,
  ) => {
    calls.push(`request-lock:${name}`)
    if (options.lockAvailable === false) {
      await callback(false)
      return
    }

    state.lockHeld = true
    calls.push(`lock-acquired:${name}`)
    try {
      await callback(true)
    } finally {
      state.lockHeld = false
      calls.push(`lock-released:${name}`)
    }
  }

  return {
    environment: {
      isSecureContext: options.secure ?? true,
      hasWebLocks: options.hasLocks ?? true,
      getDirectory,
      requestLock,
      randomUUID: () => 'fixed-id',
    },
    calls,
    state,
  }
}

describe('checkOpfsUsable', () => {
  it('proves the locked create-write-close-delete lifecycle without residue', async () => {
    const canary = fakeCanary()

    await expect(checkOpfsUsable(canary.environment)).resolves.toBe(true)
    expect(canary.calls).toEqual([
      'request-lock:opfs-capability:uon-video-helper-capability-fixed-id',
      'lock-acquired:opfs-capability:uon-video-helper-capability-fixed-id',
      'get-root',
      'create-directory:uon-video-helper-capability-fixed-id',
      'create-file:canary.bin',
      'create-writer',
      'write',
      'close',
      'remove-file:canary.bin',
      'remove-directory:uon-video-helper-capability-fixed-id:empty',
      'lock-released:opfs-capability:uon-video-helper-capability-fixed-id',
    ])
    expect(canary.state).toEqual({
      lockHeld: false,
      directoryExists: false,
      fileExists: false,
      writerOpen: false,
    })
  })

  it('does not touch OPFS outside a secure context', async () => {
    const canary = fakeCanary({ secure: false })

    await expect(checkOpfsUsable(canary.environment)).resolves.toBe(false)
    expect(canary.calls).toEqual([])
  })

  it('requires Web Locks before touching OPFS', async () => {
    const canary = fakeCanary({ hasLocks: false })

    await expect(checkOpfsUsable(canary.environment)).resolves.toBe(false)
    expect(canary.calls).toEqual([])
  })

  it('fails closed without touching OPFS when the unique lock is unavailable', async () => {
    const canary = fakeCanary({ lockAvailable: false })

    await expect(checkOpfsUsable(canary.environment)).resolves.toBe(false)
    expect(canary.calls).toEqual([
      'request-lock:opfs-capability:uon-video-helper-capability-fixed-id',
    ])
  })

  it.each<FailureStage>([
    'root',
    'directory',
    'file',
    'writer',
    'write',
    'close',
    'remove-file',
    'remove-directory',
  ])('fails closed and removes all canary state when %s fails', async (failure) => {
    const canary = fakeCanary({ failures: [failure] })

    await expect(checkOpfsUsable(canary.environment)).resolves.toBe(false)
    expect(canary.state).toEqual({
      lockHeld: false,
      directoryExists: false,
      fileExists: false,
      writerOpen: false,
    })
  })

  it('falls back to explicit cleanup when recursive recovery is rejected', async () => {
    const canary = fakeCanary({ failures: ['write', 'cleanup-recursive'] })

    await expect(checkOpfsUsable(canary.environment)).resolves.toBe(false)
    expect(canary.calls).toContain('abort')
    expect(canary.calls).toContain(
      'remove-directory:uon-video-helper-capability-fixed-id:recursive',
    )
    expect(canary.calls).toContain('remove-file:canary.bin')
    expect(canary.calls).toContain('remove-directory:uon-video-helper-capability-fixed-id:empty')
    expect(canary.state).toEqual({
      lockHeld: false,
      directoryExists: false,
      fileExists: false,
      writerOpen: false,
    })
  })
})
