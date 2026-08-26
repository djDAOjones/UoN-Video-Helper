import { describe, expect, it, vi } from 'vitest'

import { pickSourceFile, sourceHandlePickerAvailable, type SourceOpenPicker } from './source-picker'

function fakeHandle(file: File): {
  readonly handle: FileSystemFileHandle
  readonly createWritable: ReturnType<typeof vi.fn>
} {
  const createWritable = vi.fn()
  const handle = {
    kind: 'file',
    name: 'source.mp4',
    getFile: vi.fn(() => Promise.resolve(file)),
    isSameEntry: vi.fn(() => Promise.resolve(false)),
    createWritable,
  } as unknown as FileSystemFileHandle
  return { handle, createWritable }
}

describe('sourceHandlePickerAvailable', () => {
  const openPicker = vi.fn() as unknown as SourceOpenPicker

  it('requires open, directory, same-entry and lock support together', () => {
    expect(
      sourceHandlePickerAvailable({
        openPicker,
        directoryPicker: vi.fn(),
        sameEntrySupported: true,
        locksSupported: true,
      }),
    ).toBe(true)
    expect(
      sourceHandlePickerAvailable({
        directoryPicker: vi.fn(),
        sameEntrySupported: true,
        locksSupported: true,
      }),
    ).toBe(false)
    expect(
      sourceHandlePickerAvailable({ openPicker, sameEntrySupported: true, locksSupported: true }),
    ).toBe(false)
    expect(
      sourceHandlePickerAvailable({
        openPicker,
        directoryPicker: vi.fn(),
        locksSupported: true,
      }),
    ).toBe(false)
    expect(
      sourceHandlePickerAvailable({
        openPicker,
        directoryPicker: vi.fn(),
        sameEntrySupported: true,
      }),
    ).toBe(false)
  })
})

describe('pickSourceFile', () => {
  it('returns the file and its source handle without ever opening it writable', async () => {
    const file = new Blob(['source'], { type: 'video/mp4' }) as File
    const { handle, createWritable } = fakeHandle(file)
    const openPicker = vi.fn(() => Promise.resolve([handle]))

    await expect(pickSourceFile(openPicker)).resolves.toEqual({
      kind: 'selected',
      source: { file, handle },
    })
    expect(createWritable).not.toHaveBeenCalled()
    expect(openPicker).toHaveBeenCalledWith(
      expect.objectContaining({
        multiple: false,
        types: [
          expect.objectContaining({
            accept: { 'video/*': ['.mp4', '.mov', '.m4v', '.mkv', '.webm'] },
          }),
        ],
      }),
    )
  })

  it('returns cancellation when the open picker is dismissed', async () => {
    const openPicker = vi.fn(() => Promise.reject(new DOMException('cancelled', 'AbortError')))

    await expect(pickSourceFile(openPicker)).resolves.toEqual({ kind: 'cancelled' })
  })

  it('treats an empty picker result as cancellation', async () => {
    await expect(pickSourceFile(() => Promise.resolve([]))).resolves.toEqual({
      kind: 'cancelled',
    })
  })
})
