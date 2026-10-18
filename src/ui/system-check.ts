/**
 * The System check panel's one-line result.
 *
 * The panel starts closed (VH-88), so its summary is the only part most people
 * ever see — and it has to carry the result in words, because a closed
 * disclosure that hides a failure is a device problem nobody was told about.
 * Pure, so the wording and the open-on-failure rule are tested in Node.
 */

import { t } from '../i18n'

export type CheckState = 'pass' | 'fail' | 'warn' | 'pending'

export interface ChecksSummary {
  /** What the summary says after "System check — ". */
  readonly result: string
  /**
   * How many checks have failed. The panel opens itself when this RISES, not
   * whenever it is above zero: a user who has read a failure and closed the
   * panel must not have it reopened by the next, unrelated row landing.
   */
  readonly problems: number
  /**
   * How many checks have warned. Counted apart from {@link problems} because
   * a warning does not block: the one raised today is a sound encoder the
   * browser refuses, and a silent video still runs (VH-49). It is still named
   * in the summary, since the intro's browser sentence sends a user here to
   * find it (2026-10-01) — a panel that said "all passed" over a warning would
   * send them to nothing.
   */
  readonly warnings: number
}

/**
 * Sums the rows up.
 *
 * A failure is reported even while other rows are still pending: the worker
 * check answers last, and a missing API is already a fact by then. So is a
 * warning, for the same reason.
 *
 * @param states - One per check row, in any order. Empty reads as pending.
 */
export function summariseChecks(states: readonly CheckState[]): ChecksSummary {
  const { results } = t().systemCheck
  const problems = states.filter((state) => state === 'fail').length
  const warnings = states.filter((state) => state === 'warn').length
  if (problems > 0) return { result: results.problems({ count: problems }), problems, warnings }
  if (warnings > 0) return { result: results.warnings({ count: warnings }), problems, warnings }
  if (states.length === 0 || states.includes('pending')) {
    return { result: results.checking, problems, warnings }
  }
  return { result: results.allPassed, problems, warnings }
}

/**
 * The sentence under the intro that says which browser the app is built for.
 *
 * The maintainer's line, "designed and built for Chrome", stays in every
 * state; what follows it is what the load-time check found, so a browser that
 * has passed every check — Edge on a managed laptop, say — is not told it
 * "may not work" by a page that has just found that it does (maintainer,
 * 2026-10-01, revising VH-98's one fixed sentence). A warning counts as not
 * passed: the one warning the check raises is a sound encoder the browser
 * refuses, which stops every video with sound (VH-49).
 *
 * @param states - One per check row, in any order. Empty reads as pending.
 */
export function browserNote(states: readonly CheckState[]): string {
  const { browserNote: note } = t()
  if (states.length === 0 || states.includes('pending')) return note.pending
  if (states.includes('fail') || states.includes('warn')) return note.notPassed
  return note.passed
}
