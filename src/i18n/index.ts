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
import { compile, type Compiled, type Shape } from './compile'
import { enGB } from './en-GB'
import { msMY } from './ms-MY'
import { zhHans } from './zh-Hans'

/** The shape every table must have: English's keys, each message a string with English's placeholders. */
export type Messages = Shape<typeof enGB>

/** What the page calls: English's keys, a message with placeholders as a function of them. */
export type PageText = Compiled<typeof enGB>

/**
 * Every table the app has, by tag. A language with no table here falls back
 * to English rather than failing: a missing table is a build-time fact the
 * completeness test reports, never a blank page. Having a table is not being
 * offered: `LANGUAGES_OFFERED` turns a language on.
 */
export const LANGUAGE_TABLES: Readonly<Partial<Record<LanguageTag, Messages>>> = {
  'en-GB': enGB,
  'zh-Hans': zhHans,
  'ms-MY': msMY,
}

const compiled = new Map<LanguageTag, PageText>()

/** A table's API, built once per language. */
function textFor(tag: LanguageTag): PageText {
  let text = compiled.get(tag)
  if (!text) {
    text = compile<typeof enGB>(LANGUAGE_TABLES[tag] ?? enGB)
    compiled.set(tag, text)
  }
  return text
}

let currentTag: LanguageTag = DEFAULT_LANGUAGE
let current: PageText = textFor(DEFAULT_LANGUAGE)
const listeners = new Set<(tag: LanguageTag) => void>()

/** The messages for the page's current language. */
export function t(): PageText {
  return current
}

/** The current language's tag, for `lang` attributes. */
export function language(): LanguageTag {
  return currentTag
}

/** The current language's `Intl` locale: the table's own, so a formatter and its words agree. */
export function locale(): string {
  return current.meta.locale
}

/** The gap between two sentences joined into one passage, in the current language. */
export function sentenceGap(): string {
  return current.meta.separators.sentences
}

/**
 * Switches the language and tells every listener, which is how the page
 * repaints its text in place. Switching to the current language does
 * nothing, so a repeated choice never re-announces itself.
 */
export function setLanguage(tag: LanguageTag): void {
  if (tag === currentTag) return
  currentTag = tag
  current = textFor(tag)
  for (const listener of listeners) listener(tag)
}

/** Registers a listener for a language change. Returns the way to stop listening. */
export function onLanguageChange(listener: (tag: LanguageTag) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
