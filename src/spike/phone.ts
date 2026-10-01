/**
 * What is a user told when they choose a phone recording in THIS engine?
 *
 * VH-26. An iPhone records HEVC, and not every engine decodes it. The question
 * is not whether the colour survives — that was measured in Chrome — but
 * whether an engine that cannot read the file says so BEFORE the job, in the
 * pre-flight block's own words, rather than starting and dying part-way.
 *
 * Runs the real job worker through the real protocol, so what is reported is
 * what the app would show. Dev-only; not built. Follows the spike contract
 * `scripts/run-in-engines.mjs` expects: a `#log` that ends with `done`.
 */

import { detectDeviceClass } from '../media/capability'
import type { SourceReport } from '../media/inspect'
import type { PreflightSummary } from '../media/preflight'
import { verdictText } from '../ui/preflight-panel'
import { buildLosses, buildRows } from '../ui/source-panel'
import type { WorkerOutbound, WorkerRequest } from '../workers/protocol'
import { verdictLine } from '../../scripts/verdict.mjs'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
let failures = 0
function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}
function check(passed: boolean, description: string): void {
  if (!passed) failures++
  say(`  ${passed ? 'PASS' : 'FAIL'} — ${description}`)
}

const path =
  new URLSearchParams(location.search).get('file') ??
  '/samples/phone/2020_iPhone12_FloreView_HEVC.MOV'

type Payload = WorkerRequest extends infer R ? (R extends unknown ? Omit<R, 'id'> : never) : never

const worker = new Worker(new URL('../workers/job.worker.ts', import.meta.url), { type: 'module' })
let nextId = 1
/** Sends one request and resolves with the reply that carries its id. */
function ask(payload: Payload, timeoutMs: number): Promise<WorkerOutbound> {
  const id = nextId++
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no answer to ${payload.kind} in ${timeoutMs} ms`)), timeoutMs)
    const listen = (event: MessageEvent<WorkerOutbound>): void => {
      const message = event.data
      if (!('id' in message) || message.id !== id || message.kind === 'stage') return
      clearTimeout(timer)
      worker.removeEventListener('message', listen)
      resolve(message)
    }
    worker.addEventListener('message', listen)
    worker.postMessage({ ...payload, id })
  })
}

try {
  say(`userAgent: ${navigator.userAgent}`)
  say(`file:      ${path}\n`)
  const response = await fetch(path)
  if (!response.ok) throw new Error(`HTTP ${response.status} — is the file at ${path}?`)
  const file = new File([await response.blob()], 'phone-source', { type: 'video/quicktime' })

  say('=== inspect')
  const inspected = await ask({ kind: 'inspect', file }, 60_000)
  let report: SourceReport | null = null
  if (inspected.kind === 'inspected') {
    report = inspected.report
    for (const row of buildRows(report)) {
      say(`  ${row.term}: ${row.detail}${row.note ? ` — ${row.note}` : ''}`)
    }
    for (const loss of buildLosses(report)) say(`  [not carried] ${loss.title}`)
    say(`  video decodes here: ${report.video.canDecode}`)
    say(`  audio decodes here: ${report.audio ? report.audio.canDecode : 'no audio'}`)
  } else if (inspected.kind === 'failed') {
    say(`  could not be read: ${inspected.message}`)
  } else {
    say(`  unexpected reply: ${inspected.kind}`)
  }

  say('\n=== preflight (best quality)')
  const startedAt = performance.now()
  const preflighted = await ask(
    { kind: 'preflight', file, presetId: 'best', deviceClass: detectDeviceClass() },
    120_000,
  )
  const tookMs = Math.round(performance.now() - startedAt)
  let summary: PreflightSummary | null = null
  if (preflighted.kind === 'preflighted') {
    summary = preflighted.summary
    const text = verdictText(summary)
    say(`  outcome: ${summary.verdict.outcome} (${tookMs} ms)`)
    say(`  reasons: ${summary.verdict.reasons.map((reason) => reason.code).join(', ') || 'none'}`)
    say(`  the user reads: "${text.heading}"`)
    for (const line of text.lines) say(`    ${line}`)
  } else if (preflighted.kind === 'failed') {
    say(`  FAILED rather than answered (${tookMs} ms): ${preflighted.message}`)
  } else {
    say(`  unexpected reply: ${preflighted.kind}`)
  }

  say('\n=== verdict')
  // Either outcome is acceptable. What is not acceptable is the third one: a
  // generic failure, or a job that is allowed to start on a source this engine
  // has already said it cannot decode.
  check(report !== null, 'the file was inspected rather than rejected as unreadable')
  check(summary !== null, 'pre-flight answered with a verdict, not a generic failure')
  if (report && summary) {
    const canDecode = report.video.canDecode && (report.audio?.canDecode ?? true)
    const codes = summary.verdict.reasons.map((reason) => reason.code)
    if (canDecode) {
      check(!codes.includes('no-source-decode'), 'an engine that decodes it is not told it cannot')
    } else {
      check(summary.verdict.outcome === 'block', 'an engine that cannot decode it BLOCKS before the job')
      check(codes.includes('no-source-decode'), 'and the block gives the decode reason')
      check(
        verdictText(summary).lines.some((line) => /cannot read the picture or sound/.test(line)),
        'in the words the app shows, naming a browser that will open it',
      )
      check(
        !verdictText(summary).lines.some((line) => /still continue|carry on/.test(line)),
        'with no invitation to continue',
      )
    }
  }
} catch (error) {
  failures++
  say(`ERROR — ${error instanceof Error ? error.message : String(error)}`)
} finally {
  worker.terminate()
}
// The one line `scripts/run-in-engines.mjs` reads (VH-102).
say(`\n${verdictLine(failures)}`)
say('\ndone')
