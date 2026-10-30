/**
 * The clock time a card prints, in a module of its own with no language
 * table behind it, so the job's worker can print the length it made by the
 * card's own rule and hold the two against each other (VH-215) without the
 * page's words travelling into the worker. `./format` re-exports it, so the
 * page reads it where it always has.
 */

/**
 * A length as a clock shows it, to the nearest second: `0:54`, `12:34`,
 * `1:02:45`. Latin digits and a colon in every language, as the trim's
 * fields show a time; Submission's running time (VH-128).
 */
export function formatClockTime(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds))
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const rest = String(whole % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`
}
