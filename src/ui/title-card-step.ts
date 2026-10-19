/**
 * Step 3, the staff video's title card (VH-127): what the page decides about
 * it, pure, so it is tested in Node.
 *
 * Each field's limit is held in columns, as the card's fit counts them, not
 * by `maxlength`, which counts UTF-16 units and so would give a Chinese title
 * twice the room the card has for it. Ticking the box fills the date; a
 * change of video language refills it only while it still says what was
 * filled. A student submission locks the box off and keeps what the staff
 * card held for the way back. The request carries a card only when the box
 * is ticked and a field holds text. What is typed is the user's own: nothing
 * here logs it.
 */

import type { LanguageTag } from '../config/languages'
import type { VideoKind } from '../config/video-kind'
import { t } from '../i18n'
import {
  STAFF_CARD_FIELDS,
  columnsOf,
  type CardColours,
  type CardRefusal,
  type StaffCardField,
  type StaffCardText,
} from '../media/title-card'
import type { TitleCardRequest } from '../workers/protocol'

/** One character as a reader sees it: a letter with its accents, an emoji with its joiners. */
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

/** The longest start of `text` within `columns`, cut between characters, never inside one. */
export function cutToColumns(text: string, columns: number): string {
  let used = 0
  let end = 0
  for (const { segment } of graphemes.segment(text)) {
    used += columnsOf(segment)
    if (used > columns) break
    end += segment.length
  }
  return text.slice(0, end)
}

/** A field's value after typing, held to its limit. */
export interface HeldField {
  readonly value: string
  /** Where the caret goes: the end of what was kept of the typing. */
  readonly caret: number
  /** True when typing went past the limit and the overflow was left out. */
  readonly cut: boolean
}

/**
 * Holds what was just typed or pasted to the field's limit, as `maxlength`
 * does but in columns: the text after the caret is kept, and the typing
 * that ends at the caret is cut where the limit falls.
 */
export function holdToColumns(value: string, caret: number, columns: number): HeldField {
  if (columnsOf(value) <= columns) return { value, caret, cut: false }
  const after = value.slice(caret)
  const before = cutToColumns(value.slice(0, caret), Math.max(0, columns - columnsOf(after)))
  const kept = cutToColumns(before + after, columns)
  return { value: kept, caret: Math.min(before.length, kept.length), cut: true }
}

/** Today, as the card's date: the long form, in the video's language. */
export function cardDate(now: Date, wordsLanguage: LanguageTag): string {
  return new Intl.DateTimeFormat(wordsLanguage, { dateStyle: 'long' }).format(now)
}

/**
 * The date field as the box is ticked: today's date when the field is empty
 * or still says what was last filled, and what was typed otherwise.
 *
 * @param filled - What the page last filled, or `null` before it has.
 */
export function dateOnTick(current: string, filled: string | null, today: string): string {
  return current.trim() === '' || current === filled ? today : current
}

/**
 * The date field after the video's language changes: the new language's date
 * while the field still says what was filled, and otherwise as typed, edited
 * or cleared (VH-132's rule: what you type is kept as typed).
 */
export function dateOnLanguageChange(current: string, filled: string | null, today: string): string {
  return filled !== null && current === filled ? today : current
}

/** What the "Add a title card" box shows: ticked or not, locked or not, and why. */
export interface TitleCardBoxState {
  readonly checked: boolean
  readonly disabled: boolean
  /** Visible beside the box whenever it is locked, because a disabled control cannot explain itself. */
  readonly reason: string | null
}

/**
 * The box on each side of the switch. A staff video's holds what the user
 * last chose for it. A student submission's is unticked and locked until
 * VH-128 builds its own card; the staff card's tick and fields are kept, as
 * the closing's "Internal use only" box is (the owner, 2026-10-19).
 */
export function titleCardBoxState(kind: VideoKind, staffChecked: boolean): TitleCardBoxState {
  if (kind === 'submission') return { checked: false, disabled: true, reason: t().titleCard.forSubmission }
  return { checked: staffChecked, disabled: false, reason: null }
}

/** True when no field holds anything but spaces, which is a card with nothing on it. */
export function isCardEmpty(text: StaffCardText): boolean {
  return STAFF_CARD_FIELDS.every((field) => text[field].trim() === '')
}

/** Why the card stops Create: nothing typed, said beside the box, or a field that will not fit. */
export type CardStop =
  | { readonly at: 'empty' }
  | { readonly at: 'field'; readonly field: StaffCardField; readonly refusal: 'field' | 'card' }

/**
 * What stops Create while the box is ticked, or `null` when the card can go.
 *
 * @param refused - The page's fit, or `null` when it fits or could not be
 *   tried (no frame yet); the worker fits again and refuses what this missed.
 */
export function cardStop(
  on: boolean,
  text: StaffCardText,
  refused: CardRefusal<StaffCardField> | null,
): CardStop | null {
  if (!on) return null
  if (isCardEmpty(text)) return { at: 'empty' }
  if (refused === null || refused.at === 'empty') return null
  return { at: 'field', field: refused.field, refusal: refused.at }
}

/** The sentence beside a field the card cannot fit. */
export function refusalText(refusal: 'field' | 'card'): string {
  return t().titleCard.refused[refusal]
}

/** What the page reads to draw a card, beside the text: the font, the CJK stack and the colours. */
export interface TitleCardAssets {
  readonly headingFontUrl: string | null
  readonly cjkFontStack: string
  readonly colours: CardColours
}

/**
 * The process request's `titleCard`: only while the box is ticked and a
 * field holds text, so a job without a card sends nothing. The four fields
 * go as typed; the renderer trims their ends.
 */
export function titleCardRequest(
  on: boolean,
  text: StaffCardText,
  assets: TitleCardAssets,
): TitleCardRequest | null {
  if (!on || isCardEmpty(text)) return null
  return {
    text: { title: text.title, department: text.department, authors: text.authors, date: text.date },
    headingFontUrl: assets.headingFontUrl,
    cjkFontStack: assets.cjkFontStack,
    colours: { ground: assets.colours.ground, ink: assets.colours.ink },
  }
}
