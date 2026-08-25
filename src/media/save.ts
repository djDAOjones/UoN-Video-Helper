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

export type SaveOutcome = 'saved' | 'downloaded' | 'cancelled'

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
 * @returns `cancelled` when the user dismissed the dialogue, which is a normal
 *   outcome and not an error — the result stays available to save again.
 */
export async function saveFile(file: File, suggestedName: string): Promise<SaveOutcome> {
  if (pickerAvailable()) {
    try {
      const options: SaveFilePickerOptions = {
        suggestedName,
        types: [{ description: 'MP4 video', accept: { 'video/mp4': ['.mp4'] } }],
      }
      const handle = await showSaveFilePicker(options)
      const writable = await handle.createWritable()
      // Streamed, not buffered: the point of the whole architecture.
      await file.stream().pipeTo(writable)
      log.info('save', 'saved through the file picker', { bytes: file.size })
      return 'saved'
    } catch (cause) {
      // AbortError is the user closing the dialogue. Anything else falls
      // through to the download route rather than failing outright.
      if (cause instanceof DOMException && cause.name === 'AbortError') {
        log.debug('save', 'save cancelled by the user')
        return 'cancelled'
      }
      log.warn('save', 'file picker failed; falling back to a download', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
    }
  }

  const url = URL.createObjectURL(file)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = suggestedName
    anchor.click()
    log.info('save', 'saved through a download', { bytes: file.size })
    return 'downloaded'
  } finally {
    // Given a moment for the download to start before the URL is revoked.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
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
