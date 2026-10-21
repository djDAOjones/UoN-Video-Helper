/**
 * Step 3, the title card: the staff video's (VH-127) and Submission (VH-128).
 * What the page decides about it, pure, so it is tested in Node.
 *
 * Each field's limit is held in columns, as the card's fit counts them, not
 * by `maxlength`, which counts UTF-16 units and so would give a Chinese title
 * twice the room the card has for it. Ticking the box fills the date; a
 * change of video language refills it only while it still says what was
 * filled. A student submission ticks and locks the box, shows Submission's
 * fields, and keeps what the staff card held for the way back. The staff
 * request carries a card only when the box is ticked and a field holds text;
 * Submission's always, once its four fields are put right. What is typed is
 * the user's own: nothing here logs it.
 */

import { STUDENT_IDS_MAX, STUDENT_ID_DIGITS, STUDENT_ID_FOLD, STUDENT_ID_PATTERN } from '../config/cards'
import type { LanguageTag } from '../config/languages'
import type { VideoKind } from '../config/video-kind'
import { sentenceGap, t, textIn } from '../i18n'
import {
  STAFF_CARD_FIELDS,
  SUBMISSION_CARD_FIELDS,
  columnsOf,
  type CardColours,
  type CardRefusal,
  type StaffCardField,
  type StaffCardText,
  type SubmissionCardBlockName,
  type SubmissionCardField,
  type SubmissionCardText,
} from '../media/title-card'
import type { TitleCardRequest } from '../workers/protocol'
import { formatClockTime } from './format'

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
 * last chose for it. A student submission's is ticked and locked, because
 * a submission always has its card (VH-128), as the closing's "Internal use
 * only" box is; the staff card's tick and fields are kept for the way back.
 */
export function titleCardBoxState(kind: VideoKind, staffChecked: boolean): TitleCardBoxState {
  if (kind === 'submission') return { checked: true, disabled: true, reason: t().titleCard.forSubmission }
  return { checked: staffChecked, disabled: false, reason: null }
}

/**
 * The line under the box saying what this side's card needs before Create
 * refuses it (VH-140, audit V-06; WCAG 3.3.2): under a student submission,
 * that all four fields are needed; under a staff video, while its fields
 * show, that any one makes a card and the date is filled in. `null` while
 * the staff box is unticked, when no field shows to need anything.
 */
export function titleCardRuleText(kind: VideoKind, staffChecked: boolean): string | null {
  if (kind === 'submission') return t().titleCard.submission.fieldsRule
  return staffChecked ? [t().titleCard.fieldsRule, t().titleCard.fieldsRuleNext].join(sentenceGap()) : null
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
    layout: 'staff',
    text: { title: text.title, department: text.department, authors: text.authors, date: text.date },
    headingFontUrl: assets.headingFontUrl,
    cjkFontStack: assets.cjkFontStack,
    colours: { ground: assets.colours.ground, ink: assets.colours.ink },
  }
}

/* ---- Submission (VH-128) ---------------------------------------------- */

/** Submission's four fields as typed: three lines of text and the ID numbers' box. */
export type SubmissionTyped = Readonly<Record<SubmissionCardField, string>>

/**
 * The pieces typed in the ID numbers' box, split at spaces, commas,
 * semicolons and new lines. Full-width digits and punctuation, as a Chinese
 * input method types them, are folded to their Latin forms first.
 */
export function studentIdTokens(typed: string): string[] {
  return typed
    .normalize(STUDENT_ID_FOLD)
    .split(/[\s,;、]+/u)
    .filter((token) => token !== '')
}

/**
 * The line under the ID numbers' box, its length and its most taken from the
 * config the check uses, so the words and the check cannot part (VH-140,
 * design pass V-29).
 */
export function studentIdsHelperText(): string {
  return studentIdsHelperLines().join(sentenceGap())
}

/** ID format and entry instructions are separate facts on screen (VH-148). */
export function studentIdsHelperLines(): string[] {
  return [
    t().titleCard.submission.idsHelper({ digits: STUDENT_ID_DIGITS }),
    t().titleCard.submission.idsHelperNext({ max: STUDENT_IDS_MAX }),
  ]
}

/** What the ID numbers' box holds: one to {@link STUDENT_IDS_MAX} good numbers, or the first thing wrong. */
export type StudentIdsCheck =
  | { readonly ok: true; readonly ids: readonly string[] }
  | { readonly ok: false; readonly problem: 'none' }
  | { readonly ok: false; readonly problem: 'not-an-id' | 'twice'; readonly id: string }
  | { readonly ok: false; readonly problem: 'too-many'; readonly count: number }

/** Checks the box against {@link STUDENT_ID_PATTERN} and {@link STUDENT_IDS_MAX}: a wrong number first, then one typed twice, then too many. */
export function checkStudentIds(typed: string): StudentIdsCheck {
  const tokens = studentIdTokens(typed)
  if (tokens.length === 0) return { ok: false, problem: 'none' }
  const wrong = tokens.find((token) => !STUDENT_ID_PATTERN.test(token))
  if (wrong !== undefined) return { ok: false, problem: 'not-an-id', id: wrong }
  const twice = tokens.find((token, index) => tokens.indexOf(token) !== index)
  if (twice !== undefined) return { ok: false, problem: 'twice', id: twice }
  if (tokens.length > STUDENT_IDS_MAX) return { ok: false, problem: 'too-many', count: tokens.length }
  return { ok: true, ids: tokens }
}

/** Why a Submission field stops Create: left empty, an ID number wrong, or a fit refused. */
export type SubmissionProblem =
  | { readonly kind: 'missing' }
  | { readonly kind: 'ids'; readonly check: Exclude<StudentIdsCheck, { readonly ok: true }> }
  | { readonly kind: 'refused'; readonly refusal: 'field' | 'card' }

/**
 * Every field's problem, in the order the fields are drawn. A field the
 * card cannot fit is named only when it has no problem of its own; a refusal
 * at the line the app fills in is said at the assignment, the longest field
 * the user can shorten.
 *
 * @param refused - The page's fit, or `null` when it fits or could not be tried.
 */
export function submissionProblems(
  typed: SubmissionTyped,
  refused: CardRefusal<SubmissionCardBlockName> | null,
): Partial<Record<SubmissionCardField, SubmissionProblem>> {
  const problems: Partial<Record<SubmissionCardField, SubmissionProblem>> = {}
  for (const field of SUBMISSION_CARD_FIELDS) {
    if (field !== 'ids' && typed[field].trim() === '') problems[field] = { kind: 'missing' }
  }
  const ids = checkStudentIds(typed.ids)
  if (!ids.ok) problems.ids = ids.problem === 'none' ? { kind: 'missing' } : { kind: 'ids', check: ids }
  if (refused !== null && refused.at !== 'empty') {
    const field = refused.field === 'details' ? 'assignment' : refused.field
    problems[field] ??= { kind: 'refused', refusal: refused.at }
  }
  return problems
}

/** The first field to put right, in the order the page shows them, or `null` when the card can go. */
export function firstSubmissionProblem(
  problems: Partial<Record<SubmissionCardField, SubmissionProblem>>,
): SubmissionCardField | null {
  return SUBMISSION_CARD_FIELDS.find((field) => problems[field] !== undefined) ?? null
}

/** The sentence beside a Submission field. */
export function submissionProblemText(field: SubmissionCardField, problem: SubmissionProblem): string {
  const words = t().titleCard.submission
  switch (problem.kind) {
    case 'missing':
      return words.missing[field]
    case 'refused':
      return refusalText(problem.refusal)
    case 'ids': {
      const check = problem.check
      if (check.problem === 'none') return words.missing.ids
      if (check.problem === 'too-many') return words.idsTooMany({ count: check.count, max: STUDENT_IDS_MAX })
      return check.problem === 'twice'
        ? words.idTwice({ id: check.id })
        : words.idNotAnId({ id: check.id, digits: STUDENT_ID_DIGITS })
    }
  }
}

/**
 * Submission as the card draws it, every word in the video's language: the
 * typed fields, the ID numbers, the kept range's length as a clock time, and
 * the date the card is made with its caveat (the owner: "not submission
 * date"). The page fits it as the user types, with the ID numbers as split
 * so far, and sends it when Create is pressed, with them checked.
 *
 * @param keptSeconds - The kept range after trimming, without the card or the
 *   closing (the owner: "not including anything added by the app").
 */
export function submissionCardText(
  typed: SubmissionTyped,
  ids: readonly string[],
  keptSeconds: number,
  now: Date,
  wordsLanguage: LanguageTag,
): SubmissionCardText {
  const words = textIn(wordsLanguage).titleCard.card
  return {
    assignment: typed.assignment,
    module: typed.module,
    convenor: typed.convenor,
    ids,
    runningTime: formatClockTime(keptSeconds),
    made: words.madeValue({ date: cardDate(now, wordsLanguage) }),
    labels: {
      module: words.module,
      convenor: words.convenor,
      ids: words.ids({ count: ids.length }),
      running: words.running,
      made: words.made,
    },
  }
}

/** The process request's `titleCard` for Submission: always sent, once its fields are put right. */
export function submissionCardRequest(text: SubmissionCardText, assets: TitleCardAssets): TitleCardRequest {
  return {
    layout: 'submission',
    text,
    headingFontUrl: assets.headingFontUrl,
    cjkFontStack: assets.cjkFontStack,
    colours: { ground: assets.colours.ground, ink: assets.colours.ink },
  }
}
