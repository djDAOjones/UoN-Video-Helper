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
 *
 * Neither route is finished when this function returns. A picker save has
 * written its bytes, but the object URL a fallback download is reading from is
 * still live and the download may not have started — so the caller is handed a
 * {@link SaveResult.release} to call when it releases the result itself,
 * rather than this module guessing on a timer (VH-56).
 */

import { log } from '../core/logger'

export type SaveOutcome = 'saved' | 'downloaded' | 'cancelled' | 'refused-source'

export interface SaveResult {
  readonly outcome: SaveOutcome
  /**
   * Frees what the save still holds — today, the fallback download's object
   * URL. Call it when the finished result is released, never on a timer: a
   * multi-gigabyte download on a slow disk is still reading long after
   * `anchor.click()` returned.
   */
  readonly release: () => void
}

const NOTHING_TO_RELEASE = (): void => {}

/** Typed here because the DOM lib does not describe the picker yet. */
interface SaveFilePickerOptions {
  suggestedName?: string
  types?: { description?: string; accept: Record<string, string[]> }[]
}

function pickerAvailable(): boolean {
  return typeof globalThis.showSaveFilePicker === 'function'
}

/** The identifying facts of a file, as both a `File` and a picked handle can report them. */
export interface FileIdentity {
  readonly name: string
  readonly size: number
  readonly lastModified: number
}

/**
 * Whether a chosen destination is the source file itself.
 *
 * "The source file is never modified" is a headline promise in `README.md` and
 * the interface, and it was falsifiable: the picker hands back whatever the
 * user selected, and selecting the original was allowed (review R-04). The
 * suggested name differs from the source's, but a name is a suggestion.
 *
 * Name, size and modification time together identify a file well enough for
 * this: a different file matching all three is the same file by any practical
 * definition. `FileSystemHandle.isSameEntry()` is the exact answer and is used
 * instead wherever the caller holds a handle for the source — which today it
 * does not, because the source arrives through `<input type="file">` and that
 * yields a `File` and no handle.
 *
 * @param destination - The file currently at the chosen location, or `null`
 *   when nothing is there — a new file cannot be the source.
 */
export function isSourceDestination(
  destination: FileIdentity | null,
  source: FileIdentity,
): boolean {
  if (!destination) return false
  return (
    destination.name === source.name &&
    destination.size === source.size &&
    destination.lastModified === source.lastModified
  )
}

/** Reads what is already at a picked destination, or `null` if nothing is. */
async function existingAt(handle: FileSystemFileHandle): Promise<File | null> {
  try {
    return await handle.getFile()
  } catch {
    // NotFoundError is the ordinary case: the user named a file that does not
    // exist yet, which is what saving usually means.
    return null
  }
}

/**
 * Saves `file` under `suggestedName`.
 *
 * @param source - The user's original file, so a destination that IS the
 *   original can be refused. Pass its handle as `sourceHandle` if one is ever
 *   held; `isSameEntry` is exact where the identity comparison is merely
 *   conclusive.
 * @returns `cancelled` when the user dismissed the dialogue, which is a normal
 *   outcome and not an error — the result stays available to save again.
 *   `refused-source` when they chose their own source file.
 */
export async function saveFile(
  file: File,
  suggestedName: string,
  source?: { readonly identity: FileIdentity; readonly handle?: FileSystemFileHandle | null },
): Promise<SaveResult> {
  if (pickerAvailable()) {
    try {
      const options: SaveFilePickerOptions = {
        suggestedName,
        types: [{ description: 'MP4 video', accept: { 'video/mp4': ['.mp4'] } }],
      }
      const handle = await showSaveFilePicker(options)

      if (source) {
        const sameEntry = source.handle ? await handle.isSameEntry(source.handle) : false
        if (sameEntry || isSourceDestination(await existingAt(handle), source.identity)) {
          log.warn('save', 'refused to write over the source file', {})
          return { outcome: 'refused-source', release: NOTHING_TO_RELEASE }
        }
      }

      const writable = await handle.createWritable()
      // Streamed, not buffered: the point of the whole architecture.
      await file.stream().pipeTo(writable)
      log.info('save', 'saved through the file picker', { bytes: file.size })
      return { outcome: 'saved', release: NOTHING_TO_RELEASE }
    } catch (cause) {
      // AbortError is the user closing the dialogue. Anything else falls
      // through to the download route rather than failing outright.
      if (cause instanceof DOMException && cause.name === 'AbortError') {
        log.debug('save', 'save cancelled by the user')
        return { outcome: 'cancelled', release: NOTHING_TO_RELEASE }
      }
      log.warn('save', 'file picker failed; falling back to a download', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
    }
  }

  // A download cannot overwrite the source: the browser writes into its own
  // downloads folder and renames rather than replaces. So there is nothing to
  // refuse here, only something to keep alive.
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = suggestedName
  anchor.click()
  log.info('save', 'saved through a download', { bytes: file.size })
  return { outcome: 'downloaded', release: () => URL.revokeObjectURL(url) }
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
