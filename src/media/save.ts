/**
 * Getting the finished file out of the browser.
 *
 * Two routes, and the difference matters at this scale. Where the File System
 * Access API exists, the result is streamed straight from OPFS into the
 * location the user picked — nothing is ever held in memory, so a multi-gigabyte
 * output costs no more than a small one. Where it does not (Firefox), the
 * fallback is an object URL, which does materialise the whole file. That is
 * the compromise, and it is the reason the streaming path is tried first
 * rather than treated as an optimisation.
 */

import { log } from '../core/logger'

export type SaveOutcome = 'saved' | 'download-started' | 'cancelled'

/** Raised before write access when the chosen destination is the source entry. */
export class SourceOverwriteError extends Error {
  override readonly name = 'SourceOverwriteError'
  constructor() {
    super('The destination is the original source file')
  }
}

/** Fallback URLs live for exactly as long as their retained result does. */
const fallbackUrls = new WeakMap<File, Set<string>>()

/** Typed here because the DOM lib does not describe the picker yet. */
interface SaveFilePickerOptions {
  suggestedName?: string
  types?: { description?: string; accept: Record<string, string[]> }[]
}

function pickerAvailable(): boolean {
  return typeof globalThis.showSaveFilePicker === 'function'
}

/**
 * Saves `file` under `suggestedName`.
 *
 * @returns `saved` only after the picker stream has closed successfully.
 *   `download-started` means a fallback anchor was clicked, not that the
 *   browser finished downloading; both it and `cancelled` retain the result.
 */
export async function saveFile(
  file: File,
  suggestedName: string,
  sourceHandle: FileSystemFileHandle | null,
): Promise<SaveOutcome> {
  // A picker is safe only when the source came from a handle too. A plain File
  // cannot be compared to the destination, so that path uses download instead.
  if (pickerAvailable() && sourceHandle) {
    try {
      const options: SaveFilePickerOptions = {
        suggestedName,
        types: [{ description: 'MP4 video', accept: { 'video/mp4': ['.mp4'] } }],
      }
      const handle = await showSaveFilePicker(options)
      if (await handle.isSameEntry(sourceHandle)) throw new SourceOverwriteError()
      const writable = await handle.createWritable()
      // Streamed, not buffered: the point of the whole architecture.
      await file.stream().pipeTo(writable)
      log.info('save', 'saved through the file picker', { bytes: file.size })
      return 'saved'
    } catch (cause) {
      // Never downgrade this to a download or request write access. The user
      // explicitly chose the source entry as the destination.
      if (cause instanceof SourceOverwriteError) throw cause
      // AbortError is the user closing the dialogue. Anything else falls
      // through to the download route rather than failing outright.
      if (cause instanceof DOMException && cause.name === 'AbortError') {
        log.debug('save', 'save cancelled by the user')
        return 'cancelled'
      }
      log.warn('save', 'file picker failed; falling back to a download', {
        errorName: cause instanceof Error ? cause.name : 'unknown',
      })
    }
  }

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
    return 'download-started'
  } catch (cause) {
    URL.revokeObjectURL(url)
    throw cause
  }
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
 * but which sits in the same folder.
 */
export function suggestedFileName(sourceName: string): string {
  const withoutExtension = sourceName.replace(/\.[^./\\]+$/, '')
  const trimmed = withoutExtension.trim() || 'video'
  return `${trimmed} (branded).mp4`
}
