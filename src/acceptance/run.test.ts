import { describe, expect, it } from 'vitest'

import {
  cancellationStageHasPartialOutput,
  countDirectoryEntries,
  type DirectoryKeySource,
} from './run'

describe('acceptance OPFS evidence', () => {
  it('counts each observable job directory', async () => {
    const values = ['session-a-job-1', 'session-b-job-2'][Symbol.iterator]()
    const directory: DirectoryKeySource = {
      keys: () => ({
        [Symbol.asyncIterator]() {
          return this
        },
        next: () => Promise.resolve(values.next()),
      }),
    }

    await expect(countDirectoryEntries(directory)).resolves.toBe(2)
  })

  it('propagates enumeration failure instead of reporting an empty directory', async () => {
    const directory: DirectoryKeySource = {
      keys: () => ({
        [Symbol.asyncIterator]() {
          return this
        },
        next: () => Promise.reject(new DOMException('permission lost', 'NotAllowedError')),
      }),
    }

    await expect(countDirectoryEntries(directory)).rejects.toThrow('permission lost')
  })
})

describe('acceptance cancellation evidence', () => {
  it('waits for encoding so a partial output writer exists before cancellation', () => {
    expect(cancellationStageHasPartialOutput('preparing')).toBe(false)
    expect(cancellationStageHasPartialOutput('analysing')).toBe(false)
    expect(cancellationStageHasPartialOutput('encoding')).toBe(true)
    expect(cancellationStageHasPartialOutput('finishing')).toBe(false)
  })
})
