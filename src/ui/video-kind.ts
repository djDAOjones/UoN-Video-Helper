/**
 * The switch below step 1, above the other five, Staff video or Student
 * submission (VH-131, VH-216), in words, and remembered.
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
import type { LanguageTag } from '../config/languages'
import { closingWords, language, t } from '../i18n'

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
 * quoting the words the card would carry, in the video's text language
 * (VH-132), the page's unless another is given. Read on demand, never
 * announced: it is the switch's own result.
 */
export function videoKindResultText(
  kind: VideoKind,
  wordsLanguage: LanguageTag = language(),
): string {
  return t().videoKind.result[kind]({ words: closingWords(wordsLanguage) })
}
