/**
 * The switch above the five steps, Staff video or Student submission
 * (VH-131), in words, and remembered.
 *
 * Remembered in this browser, as the language is (`i18n/preference.ts`), and
 * with the same guarded read and write, because a private window or a full
 * store refuses and the page works without it. Pure, so the storage failing
 * is tested in Node; the DOM is checked in the browser.
 */

import {
  VIDEO_KIND_PREFERENCE_KEY,
  VIDEO_KINDS,
  type VideoKind,
} from '../config/video-kind'
import { t } from '../i18n'

/** The remembered side, or `null` when nothing valid is remembered or the store cannot be read. */
export function readVideoKindPreference(storage: Pick<Storage, 'getItem'> | null): VideoKind | null {
  try {
    const stored = storage?.getItem(VIDEO_KIND_PREFERENCE_KEY)
    return VIDEO_KINDS.find((kind) => kind === stored) ?? null
  } catch {
    return null
  }
}

/** Remembers the side; a store that refuses is ignored and the tab keeps the choice. */
export function writeVideoKindPreference(
  storage: Pick<Storage, 'setItem'> | null,
  kind: VideoKind,
): void {
  try {
    storage?.setItem(VIDEO_KIND_PREFERENCE_KEY, kind)
  } catch {
    // Private windows and full stores refuse; the choice lives on in this tab.
  }
}

/**
 * The line under the switch: what the side chosen means for the closing,
 * quoting the words the card would carry. Read on demand, never announced:
 * it is the switch's own result. The words are the page's language's until
 * VH-132 lets the video's differ.
 */
export function videoKindResultText(kind: VideoKind): string {
  const { videoKind, closing } = t()
  return videoKind.result[kind]({ words: closing.internalWords })
}
