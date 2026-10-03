/**
 * The trim step in words and numbers (VH-96): reading and writing times,
 * what the handles say, and whether a range can be used.
 *
 * Validation is the worker's own `normaliseKeptRange`, called here too, so
 * the page cannot accept a range the job would refuse or refuse one it would
 * take. A problem is a descriptor, not a sentence, so the page can keep it
 * across a change of language and say it again in the new one (VH-105).
 * Pure, so the wording and the arithmetic are tested in Node.
 */

import { KEPT_MIN_SECONDS, TRIM_KEY_STEP_SECONDS, TRIM_PAGE_STEP_SECONDS } from '../config/trim'
import { t } from '../i18n'
import {
  KeptRangeError,
  normaliseKeptRange,
  type KeptRange,
  type KeptRangeReason,
} from '../media/kept-range'
import { formatDuration } from './format'

/**
 * A time as the fields show it: `m:ss.s`, or `h:mm:ss.s` past an hour.
 *
 * Latin digits, a colon and a decimal point in every language: the parser's
 * contract, and what the helper's examples show. Tenths, because that is as
 * fine as anyone types; the handles and "Set start here" keep the exact
 * value, and the field only rounds what it displays.
 */
export function formatTrimTime(seconds: number): string {
  const tenths = Math.max(0, Math.round(seconds * 10))
  const hours = Math.floor(tenths / 36000)
  const minutes = Math.floor((tenths % 36000) / 600)
  const rest = (tenths % 600) / 10
  const secondsText = rest.toFixed(1).padStart(4, '0')
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${secondsText}`
    : `${minutes}:${secondsText}`
}

/**
 * Reads a typed time: `75`, `75.5`, `1:15`, `1:15.5` or `1:02:03.4`.
 *
 * @returns Seconds, or `null` for anything that is not a time — never a guess.
 */
export function parseTrimTime(text: string): number | null {
  const parts = text.trim().split(':')
  if (parts.length > 3 || parts.some((part) => !/^\d+(\.\d+)?$/.test(part))) return null
  // Only the last part may carry a fraction, and minutes and seconds after a
  // colon stay under 60.
  if (parts.slice(0, -1).some((part) => part.includes('.'))) return null
  if (parts.slice(1).some((part) => Number(part) >= 60)) return null
  return parts.reduce((total, part) => total * 60 + Number(part), 0)
}

/** Why a trim cannot be used: which field, and what is wrong with it or with the range. */
export type TrimProblem =
  | { readonly kind: 'not-a-time'; readonly which: 'start' | 'end' }
  | { readonly kind: 'after-end'; readonly which: 'start' | 'end'; readonly durationSeconds: number }
  | { readonly kind: 'range'; readonly reason: KeptRangeReason }

/** The problem in words, for beside the field. */
export function trimProblemText(problem: TrimProblem): string {
  const { problem: words } = t().trim
  switch (problem.kind) {
    case 'not-a-time':
      // Both forms, because a phone's decimal keyboard has no colon (VH-113,
      // U-20): seconds alone is what it can type, and the parser takes it.
      return words.notATime({ which: problem.which })
    case 'after-end':
      return words.afterEnd({ which: problem.which, end: formatTrimTime(problem.durationSeconds) })
    case 'range':
      return keptRangeProblemText(problem.reason)
  }
}

/** A refused range in words, by the reason `normaliseKeptRange` gave. */
export function keptRangeProblemText(reason: KeptRangeReason): string {
  const { problem } = t().trim
  switch (reason) {
    case 'not-a-time':
      return problem.notTimes
    case 'start-after-end':
      return problem.startAfterEnd
    case 'end-before-start':
      return problem.endBeforeStart
    case 'too-short':
      return problem.keepAtLeast({ seconds: KEPT_MIN_SECONDS })
  }
}

/**
 * A typed time for one end, or why it cannot be used.
 *
 * Refused here if it is not a time or lies past the end of the video. The
 * worker would bring an end past the file back to the file's end, which is
 * right for a range that arrives that way — but a person who typed it would
 * then see "the whole video" beside a field still holding their number
 * (Codex review).
 */
export function trimFieldValue(
  text: string,
  which: 'start' | 'end',
  durationSeconds: number,
): { readonly seconds: number } | { readonly problem: TrimProblem } {
  const seconds = parseTrimTime(text)
  if (seconds === null) return { problem: { kind: 'not-a-time', which } }
  if (seconds <= durationSeconds) return { seconds }
  // The one exception: the end exactly as the fields show it, rounded to a
  // tenth, which can read later than the video really runs — a 130.46 s
  // video's end reads "2:10.5". Typing back what the page showed is the end;
  // any other time past it is refused (Codex review).
  const shownEnd = parseTrimTime(formatTrimTime(durationSeconds))
  if (shownEnd !== null && Math.abs(seconds - shownEnd) < 1e-9) return { seconds: durationSeconds }
  return { problem: { kind: 'after-end', which, durationSeconds } }
}

/**
 * The range to send, `null` for the whole video, or why it cannot be used.
 *
 * The same function the worker runs, so the two cannot disagree.
 */
export function trimRangeFor(
  startSeconds: number,
  endSeconds: number,
  durationSeconds: number,
): { readonly range: KeptRange | null } | { readonly problem: TrimProblem } {
  try {
    return { range: normaliseKeptRange({ startSeconds, endSeconds }, durationSeconds) }
  } catch (cause) {
    if (cause instanceof KeptRangeError) return { problem: { kind: 'range', reason: cause.reason } }
    throw cause
  }
}

/** What is kept, in words, for the line under the controls. */
export function trimSummary(range: KeptRange | null, durationSeconds: number): string {
  const duration = formatDuration(durationSeconds)
  if (!range) return t().trim.keepingWhole({ duration })
  return t().trim.keeping({ kept: formatDuration(range.endSeconds - range.startSeconds), duration })
}

/** What a handle says to assistive technology: its place in words, not a bare number. */
export function trimHandleText(seconds: number, durationSeconds: number): string {
  if (seconds <= 0) return t().trim.handleBeginning
  if (seconds >= durationSeconds) return t().trim.handleEnd
  return formatDuration(seconds)
}

/**
 * Where a key press moves a handle, or `null` for a key that does not move it.
 *
 * The handles are native range inputs with `step="any"`, so they can hold the
 * exact time "Set start here" gives them; the keys are handled here so one
 * press is a known distance rather than whatever the browser picks.
 */
export function trimKeyTarget(
  key: string,
  value: number,
  bounds: { readonly min: number; readonly max: number },
): number | null {
  const clamp = (target: number) => Math.min(bounds.max, Math.max(bounds.min, target))
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return clamp(value + TRIM_KEY_STEP_SECONDS)
    case 'ArrowLeft':
    case 'ArrowDown':
      return clamp(value - TRIM_KEY_STEP_SECONDS)
    case 'PageUp':
      return clamp(value + TRIM_PAGE_STEP_SECONDS)
    case 'PageDown':
      return clamp(value - TRIM_PAGE_STEP_SECONDS)
    case 'Home':
      return bounds.min
    case 'End':
      return bounds.max
    default:
      return null
  }
}
