/**
 * The trim step in words and numbers (VH-96): reading and writing times,
 * what the handles say, and whether a range can be used.
 *
 * Validation is the worker's own `normaliseKeptRange`, called here too, so
 * the page cannot accept a range the job would refuse or refuse one it would
 * take. Pure, so the wording and the arithmetic are tested in Node.
 */

import { TRIM_KEY_STEP_SECONDS, TRIM_PAGE_STEP_SECONDS } from '../config/trim'
import { KeptRangeError, normaliseKeptRange, type KeptRange } from '../media/kept-range'
import { formatDuration } from './format'

/**
 * A time as the fields show it: `m:ss.s`, or `h:mm:ss.s` past an hour.
 *
 * Tenths, because that is as fine as anyone types; the handles and "Set start
 * here" keep the exact value, and the field only rounds what it displays.
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

/**
 * The range to send, `null` for the whole video, or why it cannot be used.
 *
 * The same function the worker runs, so the two cannot disagree.
 */
export function trimRangeFor(
  startSeconds: number,
  endSeconds: number,
  durationSeconds: number,
): { readonly range: KeptRange | null } | { readonly problem: string } {
  try {
    return { range: normaliseKeptRange({ startSeconds, endSeconds }, durationSeconds) }
  } catch (cause) {
    if (cause instanceof KeptRangeError) return { problem: cause.message }
    throw cause
  }
}

/** What is kept, in words, for the line under the controls. */
export function trimSummary(range: KeptRange | null, durationSeconds: number): string {
  if (!range) return `Keeping the whole video, ${formatDuration(durationSeconds)}.`
  return `Keeping ${formatDuration(range.endSeconds - range.startSeconds)} of ${formatDuration(durationSeconds)}.`
}

/** What a handle says to assistive technology: its place in words, not a bare number. */
export function trimHandleText(seconds: number, durationSeconds: number): string {
  if (seconds <= 0) return 'the beginning'
  if (seconds >= durationSeconds) return 'the end'
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
