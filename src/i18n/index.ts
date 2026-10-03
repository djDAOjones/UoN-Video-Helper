/**
 * The current language (VH-105): one table at a time, read at the moment a
 * message is needed, so a module that composes a sentence after an `await`
 * composes it in the language the page is in by then — never in one
 * captured before the wait.
 *
 * `t()` is the whole API for the modules that say things; `setLanguage`
 * and `onLanguageChange` are the switcher's. The pure modules stay pure:
 * in Node the language is English unless a test says otherwise.
 */

import { DEFAULT_LANGUAGE, type LanguageTag } from '../config/languages'
import { enGB, type Messages } from './en-GB'

/**
 * Every table the app has, by tag. A language with no table here falls back
 * to English rather than failing: a missing table is a build-time fact the
 * completeness test reports, never a blank page.
 */
export const LANGUAGE_TABLES: Readonly<Partial<Record<LanguageTag, Messages>>> = {
  'en-GB': enGB,
}

let currentTag: LanguageTag = DEFAULT_LANGUAGE
let current: Messages = enGB
const listeners = new Set<(tag: LanguageTag) => void>()

/** The messages for the page's current language. */
export function t(): Messages {
  return current
}

/** The current language's tag, for `lang` attributes. */
export function language(): LanguageTag {
  return currentTag
}

/** The current language's `Intl` locale: the table's own, so a formatter and its words agree. */
export function locale(): string {
  return current.locale
}

/**
 * Switches the language and tells every listener, which is how the page
 * repaints its text in place. Switching to the current language does
 * nothing, so a repeated choice never re-announces itself.
 */
export function setLanguage(tag: LanguageTag): void {
  if (tag === currentTag) return
  currentTag = tag
  current = LANGUAGE_TABLES[tag] ?? enGB
  for (const listener of listeners) listener(tag)
}

/** Registers a listener for a language change. Returns the way to stop listening. */
export function onLanguageChange(listener: (tag: LanguageTag) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export type { Messages }
