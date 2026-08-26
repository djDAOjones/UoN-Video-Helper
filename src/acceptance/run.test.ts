import { describe, expect, it, vi } from 'vitest'

import {
  cancellationStageHasPartialOutput,
  countDirectoryEntries,
  discardRetainedWorkerResult,
  isKnownAacEncoderUnsupported,
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

describe('supplemental acceptance classification', () => {
  it('distinguishes the known Firefox AAC-LC encoder gap from unrelated failures', () => {
    expect(
      isKnownAacEncoderUnsupported(
        new Error(
          'This specific encoder configuration (mp4a.40.2, 192000 bps, 2 channels, 48000 Hz) is not supported in this environment. Consider using another codec or changing your audio parameters.',
        ),
      ),
    ).toBe(true)
    expect(
      isKnownAacEncoderUnsupported(
        new Error('This specific encoder configuration (avc1.640028) is not supported'),
      ),
    ).toBe(false)
    expect(isKnownAacEncoderUnsupported(new Error('OPFS permission was lost'))).toBe(false)
  })
})

describe('silent worker failure cleanup', () => {
  it('acknowledges a failed process reply retained job before ownership is released', async () => {
    const discard = vi.fn<(jobId: string) => Promise<void>>().mockResolvedValue(undefined)

    await expect(
      discardRetainedWorkerResult(
        { kind: 'failed', id: 1, message: 'cleanup needs retry', retainedJobId: 'job-retained' },
        discard,
      ),
    ).resolves.toBe(true)
    expect(discard).toHaveBeenCalledExactlyOnceWith('job-retained')
  })

  it('does not invent cleanup ownership when the worker reported none', async () => {
    const discard = vi.fn<(jobId: string) => Promise<void>>().mockResolvedValue(undefined)

    await expect(
      discardRetainedWorkerResult({ kind: 'failed', id: 1, message: 'ordinary failure' }, discard),
    ).resolves.toBe(false)
    expect(discard).not.toHaveBeenCalled()
  })
})
