/**
 * The page's language, chosen on the page (VH-105).
 *
 * A content switcher at the top of `main`, above the heading — signed off
 * 2026-10-01 — drawn as the closing colour is: native radios under the
 * segmented skin, because Carbon's content switcher is a tablist, and the
 * language is a value, not a set of panels. Each option is written in its own
 * language and script and carries its own `lang`, so a reader who cannot read
 * the page's current language can still find theirs, and a screen reader
 * says each name in its own voice.
 *
 * Beside it, on a page a computer translated, a note that says so and links
 * to an email for better wording (decisions, 2026-10-18: go live, marked as
 * machine translation, checked on the live page).
 *
 * `languageOptions` and `translationFeedbackMailto` are pure and tested in
 * Node; the DOM is checked in the browser.
 */

import { TRANSLATION_FEEDBACK_ADDRESS, TRANSLATION_FEEDBACK_SUBJECT } from '../config/feedback'
import { LANGUAGE_NAMES, MACHINE_TRANSLATED, type LanguageTag } from '../config/languages'
import { language, t } from '../i18n'
import { notification } from './notification'

/** One segment of the switcher. */
export interface LanguageOption {
  /** The language, and the `lang` its label carries. */
  readonly tag: LanguageTag
  /** Its name in its own language and script. */
  readonly name: string
  readonly checked: boolean
}

/**
 * The switcher's segments, in the order offered, with the language shown
 * checked. None when only one language is offered: a switcher with one
 * choice is a control that cannot change anything.
 */
export function languageOptions(
  offered: readonly LanguageTag[],
  shown: LanguageTag,
): LanguageOption[] {
  if (offered.length < 2) return []
  return offered.map((tag) => ({ tag, name: LANGUAGE_NAMES[tag], checked: tag === shown }))
}

/**
 * The email link for better wording in one language: the owner's address,
 * and a subject naming the product and the language — nothing about the
 * video, the file or the device leaves in it (the rules' no-egress line). No
 * body: what to say is the reader's.
 */
export function translationFeedbackMailto(tag: LanguageTag): string {
  const subject = `${TRANSLATION_FEEDBACK_SUBJECT}: ${LANGUAGE_NAMES[tag]}`
  return `mailto:${TRANSLATION_FEEDBACK_ADDRESS}?subject=${encodeURIComponent(subject)}`
}

/** The switcher's parts the page listens to, and how to write its words again. */
export interface LanguageSwitcher {
  /** The label, one segment per language, and the line a switch is said in. */
  readonly fieldset: HTMLFieldSetElement
  /** The note on a machine-translated page. */
  readonly notice: HTMLElement
  /** The note's email link. */
  readonly link: HTMLAnchorElement
  /** The one live region a switch speaks in; every other is quiet while it does. */
  readonly status: HTMLElement
  /** Writes the label and the note in the language shown now, and shows the note only where it applies. */
  readonly paint: () => void
}

/**
 * Builds the switcher and the note; the caller places them, listens for a
 * choice, and calls `paint` whenever the language changes. The radios are
 * never rebuilt, so focus stays on the one chosen.
 */
export function buildLanguageSwitcher(options: readonly LanguageOption[]): LanguageSwitcher {
  const fieldset = document.createElement('fieldset')
  fieldset.className = 'segmented language-switcher'
  fieldset.id = 'language-switcher'
  fieldset.hidden = options.length === 0

  // Seen, like the closing colour's: every input has a visible label.
  const legend = document.createElement('legend')
  legend.className = 'label'

  const segments = document.createElement('div')
  segments.className = 'segments'
  for (const option of options) {
    const label = document.createElement('label')
    label.className = 'segment'
    label.lang = option.tag
    const input = document.createElement('input')
    input.type = 'radio'
    input.name = 'language'
    input.value = option.tag
    input.checked = option.checked
    const face = document.createElement('span')
    face.className = 'segment-face'
    face.textContent = option.name
    label.append(input, face)
    segments.append(label)
  }

  const status = document.createElement('p')
  status.className = 'visually-hidden'
  status.id = 'language-status'
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  fieldset.append(legend, segments, status)

  const notice = notification({ kind: 'info', title: '', lines: [''] }, 'language-notice')
  notice.classList.add('language-notice')
  const [noticeTitle, noticeText] = notice.querySelectorAll('p')
  const link = document.createElement('a')
  link.className = 'notification-link'
  const linkLine = document.createElement('p')
  linkLine.className = 'notification-body'
  linkLine.append(link)
  notice.append(linkLine)

  const paint = (): void => {
    const shown = language()
    const words = t().language
    legend.textContent = words.label
    notice.hidden = !MACHINE_TRANSLATED.includes(shown)
    if (noticeTitle) noticeTitle.textContent = words.machine.title
    if (noticeText) noticeText.textContent = words.machine.text
    link.textContent = words.machine.link({ address: TRANSLATION_FEEDBACK_ADDRESS })
    link.href = translationFeedbackMailto(shown)
  }
  paint()

  return { fieldset, notice, link, status, paint }
}
