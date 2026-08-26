/**
 * Parses the small command line accepted by the cross-engine runner.
 * Boolean flags remain booleans instead of consuming the next option.
 */
export function parseRunnerArgs(argv) {
  const positional = []
  const options = {}
  const booleanOptions = new Set(['require-all'])

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (!arg.startsWith('--')) {
      positional.push(arg)
      continue
    }

    const equalsAt = arg.indexOf('=')
    if (equalsAt !== -1) {
      options[arg.slice(2, equalsAt)] = arg.slice(equalsAt + 1)
      continue
    }

    const name = arg.slice(2)
    if (booleanOptions.has(name)) {
      options[name] = true
      continue
    }
    const next = argv[index + 1]
    if (next !== undefined && !next.startsWith('--')) {
      options[name] = next
      index++
    } else {
      options[name] = true
    }
  }

  return { positional, options }
}

const RESULT_LINE = /^result: (pass|fail|informational)$/
const FAILURE_MARKER = /(?:^|\s)(?:FAIL|ERROR)(?:\s|$|—)/
const PASS_MARKER = /(?:^|\s)PASS(?:\s|$|—)/

/**
 * Parses the exact terminal protocol emitted by a spike page.
 *
 * New pages put `result: pass|fail|informational` immediately before an exact
 * `done` line. Existing assertion pages are kept honest while they migrate:
 * their exact `ALL PASS` / `N FAILURE(S)` summaries and uppercase PASS/FAIL
 * markers are recognised rather than treated as successful completion.
 */
export function parsePageTerminal(text) {
  const lines = text.replaceAll('\r\n', '\n').trimEnd().split('\n')
  if (lines.at(-1) !== 'done') return { finished: false, result: null }

  lines.pop()
  while (lines.at(-1)?.trim() === '') lines.pop()
  const terminalLine = lines.at(-1)?.trim() ?? ''
  const explicit = RESULT_LINE.exec(terminalLine)
  if (explicit) return { finished: true, result: explicit[1] }
  if (terminalLine === 'ALL PASS') return { finished: true, result: 'pass' }
  if (/^\d+ FAILURE\(S\)$/.test(terminalLine)) return { finished: true, result: 'fail' }

  const trimmed = lines.map((line) => line.trim())
  if (trimmed.some((line) => FAILURE_MARKER.test(line))) {
    return { finished: true, result: 'fail' }
  }
  if (trimmed.some((line) => PASS_MARKER.test(line))) {
    return { finished: true, result: 'pass' }
  }
  return { finished: true, result: 'informational' }
}

/**
 * Produces an honest matrix tally and exit status.
 * A missing browser remains a skip unless the caller requested a strict run.
 */
export function summarizeEngineResults(results, requireAll = false) {
  const completed = results.filter((result) => result === 'completed').length
  const skipped = results.filter((result) => result === 'skipped').length
  const failed = results.filter((result) => result === 'failed').length

  return {
    completed,
    skipped,
    failed,
    requested: results.length,
    exitCode: failed > 0 || (requireAll && skipped > 0) ? 1 : 0,
  }
}

/** Formats the final line so completed, skipped and failed cannot be conflated. */
export function formatEngineSummary(summary) {
  return `${summary.completed} completed, ${summary.skipped} skipped, ${summary.failed} failed (${summary.requested} requested)`
}
