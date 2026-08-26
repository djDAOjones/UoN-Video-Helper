/**
 * Getting the finished file out of the browser.
 *
 * Two routes, and the difference matters at this scale. Where the File System
 * Access API can grant a directory, the result is streamed straight from OPFS
 * into a new, app-named file — nothing is ever held in memory, so a
 * multi-gigabyte output costs no more than a small one. Where it cannot, the
 * fallback is an object URL, which may materialise the whole file.
 *
 * `showSaveFilePicker()` is deliberately forbidden here. Its specification
 * clears an existing selected file before its promise resolves, which makes a
 * later `isSameEntry()` check incapable of protecting the source. See File
 * System Access §3.4:
 * https://wicg.github.io/file-system-access/#api-showsavefilepicker
 */

import { log } from '../core/logger'

export type SaveOutcome =
  | { readonly kind: 'saved'; readonly fileName: string }
  | { readonly kind: 'download-started'; readonly fileName: string }
  | { readonly kind: 'cancelled' }

/** Raised before write access if destination identity cannot be kept source-safe. */
export class SourceOverwriteError extends Error {
  override readonly name = 'SourceOverwriteError'
  constructor() {
    super('The destination is the original source file')
  }
}

/** Raised when post-allocation destination safety or cleanup cannot be proved. */
export class DestinationCleanupError extends Error {
  override readonly name = 'DestinationCleanupError'
  constructor(cause?: unknown) {
    super('The destination could not be verified or cleaned up safely', { cause })
  }
}

/** Fallback URLs live for exactly as long as their retained result does. */
const fallbackUrls = new WeakMap<File, Set<string>>()

/** One origin-wide name allocator prevents two app tabs choosing the same path. */
const SAVE_ALLOCATION_LOCK = 'uon-video-helper:save-destination-allocation'

/** A stable picker id lets the browser remember the user's output folder. */
const OUTPUT_DIRECTORY_PICKER_ID = 'uon-video-output'

interface DirectoryPickerOptions {
  readonly id?: string
  readonly mode?: 'read' | 'readwrite'
}

type DirectoryPicker = (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>

type DirectoryPickerGlobal = typeof globalThis & {
  readonly showDirectoryPicker?: DirectoryPicker
}

interface AllocatedDestination {
  readonly directory: FileSystemDirectoryHandle
  readonly handle: FileSystemFileHandle
  readonly fileName: string
}

function directoryPicker(): DirectoryPicker | null {
  const picker = (globalThis as DirectoryPickerGlobal).showDirectoryPicker
  return typeof picker === 'function' ? picker : null
}

function isNamedDomError(cause: unknown, name: string): boolean {
  return cause instanceof DOMException && cause.name === name
}

/** Adds a readable collision suffix while preserving the final extension. */
function numberedFileName(suggestedName: string, number: number): string {
  if (number === 1) return suggestedName
  const extensionAt = suggestedName.toLowerCase().lastIndexOf('.mp4')
  if (extensionAt === -1) return `${suggestedName} (${number})`
  return `${suggestedName.slice(0, extensionAt)} (${number})${suggestedName.slice(extensionAt)}`
}

/**
 * Allocates an empty destination without opening a writer or replacing a file.
 *
 * The absence probe and `create: true` call are separate Web API operations;
 * the Web Lock closes the same-origin/tab race. An external program or cloud
 * sync client is outside Web Locks, so the returned entry is checked again for
 * source identity and non-empty content before it is trusted. A simultaneous
 * external creation of the same empty name remains an API-level residual — the
 * File System API has no exclusive-create primitive — but the numbered probe,
 * global lock and post-create checks reduce that window without ever touching
 * an existing non-empty file. The full result is also staged with
 * `preventClose` and the entry is checked once more immediately before commit;
 * only the final check-to-close interval remains outside our control.
 */
async function allocateDestination(
  directory: FileSystemDirectoryHandle,
  suggestedName: string,
  sourceHandle: FileSystemFileHandle,
  signal?: AbortSignal,
): Promise<AllocatedDestination> {
  if (!navigator.locks) {
    throw new Error('Web Locks are unavailable; refusing unsafe destination allocation')
  }

  const options: LockOptions = signal ? { mode: 'exclusive', signal } : { mode: 'exclusive' }

  return navigator.locks.request(SAVE_ALLOCATION_LOCK, options, async () => {
    for (let number = 1; ; number++) {
      if (signal?.aborted) throw signal.reason
      const fileName = numberedFileName(suggestedName, number)
      try {
        await directory.getFileHandle(fileName, { create: false })
        continue
      } catch (cause) {
        // A directory with this name reports TypeMismatchError and is occupied.
        if (isNamedDomError(cause, 'TypeMismatchError')) continue
        // Permission, I/O and unknown failures are uncertainty, never absence.
        if (!isNamedDomError(cause, 'NotFoundError')) throw cause
      }

      if (signal?.aborted) throw signal.reason
      const handle = await directory.getFileHandle(fileName, { create: true })
      const destination = { directory, handle, fileName }
      let isSource: boolean
      try {
        isSource = await handle.isSameEntry(sourceHandle)
      } catch (cause) {
        // `create: true` may already have made a placeholder, but identity
        // uncertainty means it could be the source. Retain it: deletion would
        // turn a failed safety check into the source loss it exists to prevent.
        throw new DestinationCleanupError(cause)
      }
      if (isSource) throw new SourceOverwriteError()

      // `create: true` also returns an entry created by an external racer. A
      // non-empty one is certainly not ours, so leave it untouched and advance.
      try {
        if ((await handle.getFile()).size !== 0) continue
      } catch (cause) {
        // Source identity is already known to differ, so cleanup is permitted
        // only if a second lookup proves this exact handle is still empty.
        // Surface the uncertainty either way; never turn a post-create failure
        // into a silent download fallback.
        await removeOwnedPlaceholder(destination)
        throw new DestinationCleanupError(cause)
      }
      return destination
    }
  })
}

/** Proves the placeholder is still the empty entry we allocated, then removes it. */
async function removeOwnedPlaceholder(destination: AllocatedDestination): Promise<void> {
  let current: FileSystemFileHandle
  try {
    current = await destination.directory.getFileHandle(destination.fileName, { create: false })
  } catch (cause) {
    if (isNamedDomError(cause, 'NotFoundError')) return
    throw new DestinationCleanupError(cause)
  }

  try {
    if (!(await current.isSameEntry(destination.handle))) throw new DestinationCleanupError()
    if ((await current.getFile()).size !== 0) throw new DestinationCleanupError()
    await destination.directory.removeEntry(destination.fileName)
  } catch (cause) {
    if (cause instanceof DestinationCleanupError) throw cause
    throw new DestinationCleanupError(cause)
  }
}

/** Best-effort writer rollback followed by proof-based placeholder cleanup. */
async function abandonDestination(
  destination: AllocatedDestination,
  writable: FileSystemWritableFileStream | null,
): Promise<void> {
  let abortFailure: unknown = null
  if (writable !== null) {
    try {
      await writable.abort()
    } catch (cause) {
      // `pipeTo` may already have aborted/errored the stream. Cleanup below is
      // the authority: removal succeeds only if the visible entry is still the
      // exact empty placeholder allocated by this attempt.
      abortFailure = cause
    }
  }

  try {
    await removeOwnedPlaceholder(destination)
  } catch (cause) {
    throw new DestinationCleanupError(cause ?? abortFailure)
  }
}

/** Streams to a new file in a directory explicitly selected by the user. */
async function saveToDirectory(
  picker: DirectoryPicker,
  file: File,
  suggestedName: string,
  sourceHandle: FileSystemFileHandle,
  signal?: AbortSignal,
): Promise<SaveOutcome> {
  const directory = await picker({ id: OUTPUT_DIRECTORY_PICKER_ID, mode: 'readwrite' })
  if (signal?.aborted) return { kind: 'cancelled' }

  let destination: AllocatedDestination | null = null
  let writable: FileSystemWritableFileStream | null = null
  try {
    destination = await allocateDestination(directory, suggestedName, sourceHandle, signal)
    if (signal?.aborted) {
      await removeOwnedPlaceholder(destination)
      return { kind: 'cancelled' }
    }

    // Recheck immediately before content write access. `create: true` may have
    // made an empty placeholder; `createWritable()` is the first operation
    // capable of replacing its content.
    const current = await directory.getFileHandle(destination.fileName, { create: false })
    if (!(await current.isSameEntry(destination.handle))) throw new DestinationCleanupError()
    if (await current.isSameEntry(sourceHandle)) throw new SourceOverwriteError()
    if ((await current.getFile()).size !== 0) throw new DestinationCleanupError()

    writable = await destination.handle.createWritable()
    if (signal?.aborted) {
      await abandonDestination(destination, writable)
      return { kind: 'cancelled' }
    }

    const stream = file.stream()
    // File System Standard §2.3.2 stages writes in a temporary backing file until
    // close. Keep that commit under app control so a cloud-sync/external change
    // during a long copy is detected before it can be replaced. The standard
    // still provides no exclusive create-or-close operation, so an external
    // empty-file race in the last check-to-close interval remains unavoidable.
    // https://fs.spec.whatwg.org/#api-filesystemwritablefilestream
    if (signal) await stream.pipeTo(writable, { preventClose: true, signal })
    else await stream.pipeTo(writable, { preventClose: true })
    if (signal?.aborted) {
      await abandonDestination(destination, writable)
      return { kind: 'cancelled' }
    }

    const beforeCommit = await directory.getFileHandle(destination.fileName, { create: false })
    if (!(await beforeCommit.isSameEntry(destination.handle))) {
      throw new DestinationCleanupError()
    }
    if (await beforeCommit.isSameEntry(sourceHandle)) throw new SourceOverwriteError()
    if ((await beforeCommit.getFile()).size !== 0) throw new DestinationCleanupError()
    await writable.close()
    log.info('save', 'saved through the selected directory', {
      bytes: file.size,
      fileName: destination.fileName,
    })
    return { kind: 'saved', fileName: destination.fileName }
  } catch (cause) {
    // A source identity match is authority to preserve that entry, never to
    // feed it into placeholder cleanup. A writer opened on a path that was
    // externally replaced is safe to abort, but the visible entry is not ours
    // to remove.
    if (cause instanceof SourceOverwriteError) {
      if (writable !== null) {
        try {
          await writable.abort()
        } catch (abortCause) {
          throw new DestinationCleanupError(abortCause)
        }
      }
      throw cause
    }
    if (destination !== null) await abandonDestination(destination, writable)
    if (signal?.aborted || isNamedDomError(cause, 'AbortError')) return { kind: 'cancelled' }
    throw cause
  }
}

/** Starts a browser-managed fallback download while retaining its object URL. */
function startFallbackDownload(file: File, suggestedName: string): SaveOutcome {
  const url = URL.createObjectURL(file)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = suggestedName
    anchor.click()
    const urls = fallbackUrls.get(file) ?? new Set<string>()
    urls.add(url)
    fallbackUrls.set(file, urls)
    log.info('save', 'fallback download requested', { bytes: file.size })
    return { kind: 'download-started', fileName: suggestedName }
  } catch (cause) {
    URL.revokeObjectURL(url)
    throw cause
  }
}

/**
 * Saves `file` under an app-owned, non-overwriting name.
 *
 * @param signal - Cancels a pending directory stream without releasing the
 *   retained result or starting a fallback download.
 * @returns `saved` only after the directory stream has closed successfully.
 *   `download-started` means a fallback anchor was clicked, not that the
 *   browser finished downloading; both it and `cancelled` retain the result.
 */
export async function saveFile(
  file: File,
  suggestedName: string,
  sourceHandle: FileSystemFileHandle | null,
  signal?: AbortSignal,
): Promise<SaveOutcome> {
  if (signal?.aborted) return { kind: 'cancelled' }

  const picker = directoryPicker()
  // A directory route is safe only when source identity is comparable and the
  // allocation can be serialized. Otherwise use the non-mutating download.
  if (picker && sourceHandle && navigator.locks) {
    try {
      return await saveToDirectory(picker, file, suggestedName, sourceHandle, signal)
    } catch (cause) {
      if (cause instanceof SourceOverwriteError || cause instanceof DestinationCleanupError) {
        throw cause
      }
      if (signal?.aborted || isNamedDomError(cause, 'AbortError')) {
        log.debug('save', 'save cancelled by the user')
        return { kind: 'cancelled' }
      }
      log.warn('save', 'directory save failed; falling back to a download', {
        errorName: cause instanceof Error ? cause.name : 'unknown',
      })
    }
  }

  if (signal?.aborted) return { kind: 'cancelled' }
  return startFallbackDownload(file, suggestedName)
}

/** Revokes fallback URLs only when their retained result is explicitly released. */
export function releaseFallbackDownloads(file: File): void {
  const urls = fallbackUrls.get(file)
  if (!urls) return
  for (const url of urls) URL.revokeObjectURL(url)
  fallbackUrls.delete(file)
}

/**
 * A filename derived from the source's.
 *
 * Keeps the user's own name so they can recognise the result, and marks it so
 * it cannot be confused with the original — which this tool never modifies,
 * but which may sit in the selected output folder.
 */
export function suggestedFileName(sourceName: string): string {
  const withoutExtension = sourceName.replace(/\.[^./\\]+$/, '')
  const trimmed = withoutExtension.trim() || 'video'
  return `${trimmed} (branded).mp4`
}
