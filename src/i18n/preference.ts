/**
 * Where the chosen language is remembered (VH-105): this browser, this
 * origin, and nowhere else — the same guarded read and write the progress
 * announcement setting uses (`ui/progress.ts`), because a private window or
 * a full store refuses, and the page works without it. Pure, so the storage
 * failing is tested in Node.
 */

import { LANGUAGE_PREFERENCE_KEY, type LanguageTag } from '../config/languages'

/**
 * The remembered language, or `null` when nothing valid is remembered or
 * the store cannot be read. Only a tag in `offered` counts: a language
 * remembered while it was on, and since turned off, falls back rather than
 * showing a page nobody has signed off.
 */
export function readLanguagePreference(
  storage: Pick<Storage, 'getItem'> | null,
  offered: readonly LanguageTag[],
): LanguageTag | null {
  try {
    const stored = storage?.getItem(LANGUAGE_PREFERENCE_KEY)
    return offered.find((tag) => tag === stored) ?? null
  } catch {
    return null
  }
}

/** Remembers the language; a storage that refuses is ignored and the session keeps the choice in memory. */
export function writeLanguagePreference(
  storage: Pick<Storage, 'setItem'> | null,
  tag: LanguageTag,
): void {
  try {
    storage?.setItem(LANGUAGE_PREFERENCE_KEY, tag)
  } catch {
    // Private windows and full stores refuse; the choice lives on in this tab.
  }
}
