/**
 * The System check panel's one-line result.
 *
 * The panel starts closed (VH-88), so its summary is the only part most people
 * ever see — and it has to carry the result in words, because a closed
 * disclosure that hides a failure is a device problem nobody was told about.
 * Pure, so the wording and the open-on-failure rule are tested in Node.
 */

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
}

/**
 * Sums the rows up.
 *
 * A failure is reported even while other rows are still pending: the worker
 * check answers last, and a missing API is already a fact by then.
 *
 * @param states - One per check row, in any order. Empty reads as pending.
 */
export function summariseChecks(states: readonly CheckState[]): ChecksSummary {
  const problems = states.filter((state) => state === 'fail').length
  if (problems > 0) {
    return { result: problems === 1 ? '1 problem' : `${problems} problems`, problems }
  }
  if (states.length === 0 || states.includes('pending')) {
    return { result: 'checking', problems: 0 }
  }
  return { result: 'all passed', problems: 0 }
}
