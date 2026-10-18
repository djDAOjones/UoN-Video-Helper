/**
 * The accessibility statement in the footer (VH-130).
 *
 * A panel that is a disclosure, as the System check is, closed until asked
 * for or linked to. Most of its words are bound in the markup
 * (`data-i18n`); the four sentences that carry a date, the contact address
 * or the advice service's link are painted here, because a bound element
 * takes plain words only, never a filled placeholder or a link. Each such
 * sentence stays one message in the table, so the translator sees it whole,
 * and is cut around its slots here, so the link or the date stands wherever
 * that language's grammar puts it.
 *
 * `fragmentOpensStatement` and `messageParts` are pure and tested in Node;
 * the DOM is checked in the browser.
 */

import {
  ACCESSIBILITY_CONTACT_ADDRESS,
  EQUALITY_ADVISORY_SERVICE_URL,
  STATEMENT_NEXT_REVIEW_DATE,
  STATEMENT_PREPARED_DATE,
  WAVE_CHECK_DATE,
} from '../config/accessibility'
import { locale, t } from '../i18n'
import { dateFormatter } from '../i18n/intl'

/** The statement's id in the page, which is also the fragment that opens it. */
export const STATEMENT_ID = 'accessibility-statement'

/**
 * Whether the URL's fragment asks for the statement, so a course page — a
 * Xerte link, say — can point straight at it and find it open.
 *
 * @param hash - `location.hash` as the browser gives it, `#` and all.
 */
export function fragmentOpensStatement(hash: string): boolean {
  return hash === `#${STATEMENT_ID}`
}

/** One piece of a message: words to write, or the slot a placeholder names. */
export type MessagePart<Name extends string> = { readonly text: string } | { readonly slot: Name }

/**
 * A message cut around its placeholders, in the order the language puts
 * them. Each placeholder is filled with a marker from Unicode's private use
 * area, which no translation contains, and the message is cut at the
 * markers; empty pieces between two slots are dropped.
 *
 * @param message - A compiled message whose placeholders are exactly `names`.
 */
export function messageParts<Name extends string>(
  message: (params: Readonly<Record<Name, string>>) => string,
  names: readonly Name[],
): MessagePart<Name>[] {
  const marks = Object.fromEntries(names.map((name, index) => [name, `${index}`]))
  return message(marks as Record<Name, string>)
    .split(/(\d+)/)
    .flatMap((piece, index): MessagePart<Name>[] => {
      if (index % 2 === 1) return [{ slot: names[Number(piece)]! }]
      return piece === '' ? [] : [{ text: piece }]
    })
}

/**
 * Writes a message into `element`, each slot taken by its node. The nodes
 * are the same ones every time, so a link keeps its listener across a
 * change of language.
 */
function paintMessage<Name extends string>(
  element: HTMLElement,
  message: (params: Readonly<Record<Name, string>>) => string,
  nodes: Readonly<Record<Name, Node>>,
): void {
  const parts = messageParts(message, Object.keys(nodes) as Name[])
  element.replaceChildren(...parts.map((part) => ('slot' in part ? nodes[part.slot] : part.text)))
}

/** A day, machine-readable in its `datetime`, its words written at each paint. */
function dayElement(isoDate: string): HTMLTimeElement {
  const time = document.createElement('time')
  time.dateTime = isoDate
  return time
}

/** The statement's parts the page listens to, and how to write its painted sentences again. */
export interface AccessibilityStatement {
  /** The panel: opened by its fragment, and left as the reader set it by a change of language. */
  readonly details: HTMLDetailsElement
  /** The contact address's link, whose click the page sends the way every email link goes. */
  readonly contactLink: HTMLAnchorElement
  /** Writes the four painted sentences, their dates and their links' words in the current language. */
  readonly paint: () => void
}

/**
 * Finds the statement's painted sentences in `details` and builds what goes
 * in their slots; the caller paints, repaints on a change of language, and
 * routes the email link's click.
 */
export function wireAccessibilityStatement(details: HTMLDetailsElement): AccessibilityStatement {
  const sentence = (id: string): HTMLElement => {
    const element = details.querySelector<HTMLElement>(`#${id}`)
    if (!element) throw new Error(`Missing required element: #${id}`)
    return element
  }
  const contact = sentence('statement-contact')
  const enforcement = sentence('statement-enforcement')
  const wave = sentence('statement-wave')
  const about = sentence('statement-about')

  // Inline in their sentences, so WCAG 2.5.5's inline exception covers their
  // height. The address is its own link text: what the link does is in it.
  const contactLink = document.createElement('a')
  contactLink.href = `mailto:${ACCESSIBILITY_CONTACT_ADDRESS}`
  contactLink.textContent = ACCESSIBILITY_CONTACT_ADDRESS
  // An ordinary link, in this tab: a running job's "Leave site?" warning
  // still stands between a click and the job.
  const serviceLink = document.createElement('a')
  serviceLink.href = EQUALITY_ADVISORY_SERVICE_URL

  const waveDay = dayElement(WAVE_CHECK_DATE)
  const preparedDay = dayElement(STATEMENT_PREPARED_DATE)
  const reviewDay = dayElement(STATEMENT_NEXT_REVIEW_DATE)

  const paint = (): void => {
    const words = t().statement
    const writeDate = dateFormatter(locale())
    serviceLink.textContent = words.enforcement.service
    waveDay.textContent = writeDate(WAVE_CHECK_DATE)
    preparedDay.textContent = writeDate(STATEMENT_PREPARED_DATE)
    reviewDay.textContent = writeDate(STATEMENT_NEXT_REVIEW_DATE)
    paintMessage(contact, words.contact.text, { address: contactLink })
    paintMessage(enforcement, words.enforcement.text, { service: serviceLink })
    paintMessage(wave, words.testing.wave, { date: waveDay })
    paintMessage(about, words.about.dates, { date: preparedDay, reviewDate: reviewDay })
  }

  return { details, contactLink, paint }
}
