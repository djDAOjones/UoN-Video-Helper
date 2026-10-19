/**
 * The video's text language (VH-132): the language of the words the app
 * draws into the video — Internal use only on the closing, and the title
 * cards' labels and date (VH-127, VH-128) — never of what a person types.
 *
 * It shows the page's language until someone picks one; a pick is kept when
 * the page's language changes, and remembered in this browser with the
 * page's guarded read and write (decisions, 2026-10-19). Pure but for
 * `paintParts`, so the rule and a refusing store are tested in Node; the DOM
 * is checked in the browser.
 */

import { VIDEO_LANGUAGE_PREFERENCE_KEY, type LanguageTag } from '../config/languages'
import { readLanguagePreference, writeLanguagePreference } from '../i18n/preference'

/** The remembered pick, or `null` when none is remembered, it is no longer offered, or the store cannot be read. */
export function readVideoLanguagePreference(
  storage: Pick<Storage, 'getItem'> | null,
  offered: readonly LanguageTag[],
): LanguageTag | null {
  return readLanguagePreference(storage, offered, VIDEO_LANGUAGE_PREFERENCE_KEY)
}

/** Remembers a pick; a store that refuses is ignored and the tab keeps it. */
export function writeVideoLanguagePreference(
  storage: Pick<Storage, 'setItem'> | null,
  tag: LanguageTag,
): void {
  writeLanguagePreference(storage, tag, VIDEO_LANGUAGE_PREFERENCE_KEY)
}

/** The video's text language: the pick, or the page's until there is one. */
export function videoLanguageFor(picked: LanguageTag | null, page: LanguageTag): LanguageTag {
  return picked ?? page
}

/** A run of text: the page's language, or a language of its own. */
export interface TextPart {
  readonly text: string
  /** The run's own language, or `null` for the page's. */
  readonly lang: LanguageTag | null
}

/**
 * `text` split so that the video's words quoted in it carry their own
 * language when it is not the page's (WCAG 3.1.2, Language of Parts), and a
 * screen reader says them in that language's voice. The last match only:
 * each sentence quotes the words once, and the result's summary, which also
 * names the file, names it first in every language. Words in the page's own
 * language, or not quoted, leave the text whole.
 */
export function quotedWordsParts(
  text: string,
  words: string,
  wordsLanguage: LanguageTag,
  page: LanguageTag,
): TextPart[] {
  const at = wordsLanguage === page || words === '' ? -1 : text.lastIndexOf(words)
  if (at < 0) return [{ text, lang: null }]
  const parts: TextPart[] = [
    { text: text.slice(0, at), lang: null },
    { text: words, lang: wordsLanguage },
    { text: text.slice(at + words.length), lang: null },
  ]
  return parts.filter((part) => part.text !== '')
}

/** Writes `parts` into `element` in place of what it held: a run in its own language as a `lang` span. */
export function paintParts(element: HTMLElement, parts: readonly TextPart[]): void {
  element.replaceChildren(
    ...parts.map(({ text, lang }) => {
      if (lang === null) return text
      const span = document.createElement('span')
      span.lang = lang
      span.textContent = text
      return span
    }),
  )
}
