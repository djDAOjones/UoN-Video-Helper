/**
 * The verdict line every spike page ends on, and how `run-in-engines.mjs`
 * reads it (VH-102).
 *
 * A spike page's log is prose for a person. The runner used to read verdict
 * words out of that prose by position, and a source NAMED
 * "lecture FAIL — retake.mp4" could sit where a verdict goes and fail a run
 * that passed. So each page now closes with one line the runner reads and
 * nothing else: `ALL PASS`, or `N FAILURE(S)` with errors counted among the
 * failures, as the last line before the `done` sentinel. The prose above it
 * can say anything.
 *
 * Plain JavaScript, so the runner imports it with no build step; the pages,
 * which are TypeScript, import it through `verdict.d.mts`.
 */

/**
 * The closing line for a page that counted `failures` problems, errors
 * included.
 *
 * @param {number} failures
 * @returns {string}
 */
export function verdictLine(failures) {
  return failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`
}

/**
 * Reads a finished page's verdict: its last non-empty line before `done`.
 *
 * Only that line. A page that ends without one is `missing`, and the runner
 * fails it: a page that cannot say whether it passed has not shown that it
 * did.
 *
 * @param {string} text - The page's whole log.
 * @returns {{ kind: 'pass' } | { kind: 'fail', failures: number } | { kind: 'missing' }}
 */
export function readVerdict(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (lines.at(-1) !== 'done') return { kind: 'missing' }
  const line = lines.at(-2) ?? ''
  if (line === 'ALL PASS') return { kind: 'pass' }
  const counted = /^([1-9]\d*) FAILURE\(S\)$/.exec(line)
  return counted ? { kind: 'fail', failures: Number(counted[1]) } : { kind: 'missing' }
}
