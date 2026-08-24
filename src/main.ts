/**
 * App entry point.
 *
 * Mounts the shell, installs diagnostics before anything else can throw, and
 * runs the system check that proves the skeleton is actually wired: the worker
 * answers, and the browser has the APIs this app cannot work without.
 */

import './styles/app.css'

import {
  copyDiagnostics,
  installGlobalErrorCapture,
  onUncaughtError,
  recordUncaught,
  type CapturedError,
} from './core/diagnostics'
import { adoptLogRecords, log, setMinimumLogLevel } from './core/logger'
import { APP_VERSION, BUILD_ID } from './core/version'
import { renderPreflight, summarisePreflight } from './ui/preflight-panel'
import { renderSourceError, renderSourceReport, summarise } from './ui/source-panel'
import type { WorkerOutbound, WorkerRequest } from './workers/protocol'

const isDev = import.meta.env.DEV

if (!isDev) setMinimumLogLevel('info')
installGlobalErrorCapture('main')

log.info('boot', 'UoN Video Helper starting', { appVersion: APP_VERSION, buildId: BUILD_ID })

// --- DOM handles -----------------------------------------------------------

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`Missing required element: ${selector}`)
  return element
}

const checksList = required<HTMLUListElement>('#checks')
const statusLine = required<HTMLParagraphElement>('#status')
const versionLine = required<HTMLParagraphElement>('#version-line')
const errorsPanel = required<HTMLElement>('#errors-panel')
const errorsContainer = required<HTMLDivElement>('#errors')
const devActions = required<HTMLDivElement>('#dev-actions')
const fileInput = required<HTMLInputElement>('#file-input')
const sourceReport = required<HTMLDivElement>('#source-report')
const preflightReport = required<HTMLDivElement>('#preflight-report')

versionLine.textContent = isDev ? `${APP_VERSION} · ${BUILD_ID} · development` : APP_VERSION

// --- System check rendering ------------------------------------------------

type CheckState = 'pass' | 'fail' | 'warn' | 'pending'

/** Word marks, because status must never be carried by colour alone. */
const MARKS: Record<CheckState, string> = { pass: 'OK', fail: 'No', warn: '!', pending: '…' }

function renderCheck(id: string, label: string, state: CheckState, value: string): void {
  let row = document.querySelector<HTMLLIElement>(`#check-${id}`)
  if (!row) {
    row = document.createElement('li')
    row.id = `check-${id}`
    row.className = 'check'
    row.innerHTML =
      '<span class="mark" aria-hidden="true"></span><span></span><span class="value"></span>'
    checksList.append(row)
  }
  row.dataset['state'] = state
  const [mark, name, result] = row.children
  if (mark) mark.textContent = MARKS[state]
  if (name) name.textContent = label
  if (result) result.textContent = value
}

function setStatus(message: string): void {
  statusLine.textContent = message
}

// --- Error surfacing -------------------------------------------------------

function showError(error: CapturedError): void {
  errorsPanel.hidden = false
  const item = document.createElement('div')
  item.className = 'error-item'

  const heading = document.createElement('p')
  heading.style.margin = '0'
  const strong = document.createElement('strong')
  strong.textContent = `${error.origin} on the ${error.thread} thread`
  heading.append(strong, document.createTextNode(` — ${error.message}`))
  item.append(heading)

  if (error.stack) {
    const stack = document.createElement('pre')
    stack.textContent = error.stack
    item.append(stack)
  }
  errorsContainer.append(item)
}

onUncaughtError(showError)

// --- Capability checks -----------------------------------------------------

renderCheck('secure', 'Secure context (needed for storage access)', 'pending', 'checking')
renderCheck('webcodecs', 'WebCodecs video encoding', 'pending', 'checking')
renderCheck('opfs', 'Private working storage', 'pending', 'checking')
renderCheck('worker', 'Background processing', 'pending', 'checking')

renderCheck(
  'secure',
  'Secure context (needed for storage access)',
  window.isSecureContext ? 'pass' : 'fail',
  window.isSecureContext ? 'available' : 'not available',
)

const hasWebCodecs =
  typeof globalThis.VideoEncoder !== 'undefined' && typeof globalThis.VideoDecoder !== 'undefined'
renderCheck(
  'webcodecs',
  'WebCodecs video encoding',
  hasWebCodecs ? 'pass' : 'fail',
  hasWebCodecs ? 'supported' : 'not supported',
)

const hasOpfs = typeof navigator.storage?.getDirectory === 'function'
renderCheck(
  'opfs',
  'Private working storage',
  hasOpfs ? 'pass' : 'fail',
  hasOpfs ? 'available' : 'not available',
)

// --- Worker round-trip -----------------------------------------------------

const worker = new Worker(new URL('./workers/job.worker.ts', import.meta.url), {
  type: 'module',
  name: 'uon-video-helper-job',
})

let nextRequestId = 1
const pending = new Map<number, (message: WorkerOutbound) => void>()

/**
 * Sends a request and resolves with its reply.
 *
 * @param payload - The request without its `id`, which is assigned here.
 * @param timeoutMs - Inspection of a multi-gigabyte file legitimately takes
 *   longer than a ping, so the caller sets the bound rather than sharing one.
 */
function request(
  payload: DistributiveOmit<WorkerRequest, 'id'>,
  timeoutMs = 5000,
): Promise<WorkerOutbound> {
  const id = nextRequestId++
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`Worker did not answer "${payload.kind}" within ${timeoutMs} ms`))
    }, timeoutMs)
    pending.set(id, (message) => {
      clearTimeout(timer)
      resolve(message)
    })
    worker.postMessage({ ...payload, id })
  })
}

/** `Omit` applied across a union rather than collapsing it into one member. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

worker.addEventListener('message', (event: MessageEvent<WorkerOutbound>) => {
  const message = event.data
  if (message.kind === 'uncaught') {
    recordUncaught(message.error)
    return
  }
  pending.get(message.id)?.(message)
  pending.delete(message.id)
})

/**
 * True once the worker has answered a ping. Distinguishes "never started"
 * from "started and later threw" — only the first is a startup failure, and
 * only the first leaves the worker's own error hook uninstalled.
 */
let workerReady = false

worker.addEventListener('error', (event) => {
  event.preventDefault()

  // A worker that booted claims its own errors and forwards them with a
  // stack (see diagnostics.ts). Reaching here after boot would mean a
  // duplicate, so only a genuine startup failure is reported.
  if (workerReady) return

  recordUncaught({
    ts: Date.now(),
    message: event.message || 'The background worker failed to start',
    origin: 'error',
    thread: 'worker',
  })
  renderCheck('worker', 'Background processing', 'fail', 'failed to start')
})

async function checkWorker(): Promise<void> {
  const startedAt = performance.now()
  const reply = await request({ kind: 'ping' })
  if (reply.kind !== 'pong') throw new Error(`Unexpected reply to ping: ${reply.kind}`)
  const roundTripMs = Math.round(performance.now() - startedAt)
  workerReady = true
  renderCheck('worker', 'Background processing', 'pass', `ready in ${roundTripMs} ms`)
  log.info('boot', 'worker round-trip complete', { roundTripMs, workerBootMs: reply.workerBootMs })
}

void checkWorker()
  .then(() => {
    const blocking = !hasWebCodecs || !hasOpfs || !window.isSecureContext
    setStatus(
      blocking
        ? 'This browser is missing something the tool needs. Full guidance arrives with the pre-flight checks.'
        : 'Everything needed is available. Ready for the next milestone.',
    )
  })
  .catch((cause: unknown) => {
    renderCheck('worker', 'Background processing', 'fail', 'no response')
    setStatus('Background processing did not start. See the errors below.')
    recordUncaught({
      ts: Date.now(),
      message: cause instanceof Error ? cause.message : String(cause),
      ...(cause instanceof Error && cause.stack ? { stack: cause.stack } : {}),
      origin: 'error',
      thread: 'main',
    })
  })

// --- File selection ---

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0]
  if (!file) return

  // Never log the filename — DEV-INFRASTRUCTURE.md -> "Redaction".
  log.info('ui', 'file chosen', { sizeBytes: file.size, type: file.type })
  setStatus('Reading the video…')
  sourceReport.replaceChildren()
  preflightReport.replaceChildren()

  void (async () => {
    try {
      // Two minutes: reading structure is fast, but a multi-gigabyte file on a
      // slow disk is not, and timing out on a file that would have worked is
      // worse than waiting.
      const reply = await request({ kind: 'inspect', file }, 120_000)
      if (reply.kind === 'inspected') {
        renderSourceReport(sourceReport, reply.report)
        setStatus(summarise(reply.report))
        // Structure first, then the measurement — the probe really does decode
        // and encode three seconds, so it must not hold up what we already know.
        await runPreflight(file)
        return
      }
      if (reply.kind === 'failed') {
        renderSourceError(sourceReport, reply.message)
        setStatus('That file could not be read.')
        return
      }
      throw new Error(`Unexpected reply to inspect: ${reply.kind}`)
    } catch (cause) {
      renderSourceError(
        sourceReport,
        'Reading this file took longer than expected, or the tool ran into a problem.',
      )
      setStatus('That file could not be read.')
      log.error('ui', 'inspection request failed', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
    }
  })()
})

/**
 * Runs the device check for the chosen file.
 *
 * The preset is fixed to "Best quality" until VH-10 puts the choice in front
 * of the user; the panel names which one it assessed so this is visible rather
 * than assumed.
 */
async function runPreflight(file: File): Promise<void> {
  setStatus('Checking this video against your device…')
  const backgroundColour =
    getComputedStyle(document.documentElement).getPropertyValue('--uon-brand-bg').trim() || '#000000'

  try {
    const reply = await request(
      { kind: 'preflight', file, presetId: 'best', backgroundColour },
      180_000,
    )
    if (reply.kind === 'preflighted') {
      renderPreflight(preflightReport, reply.summary)
      setStatus(summarisePreflight(reply.summary))
      return
    }
    if (reply.kind === 'failed') {
      renderSourceError(preflightReport, reply.message)
      return
    }
    throw new Error(`Unexpected reply to preflight: ${reply.kind}`)
  } catch (cause) {
    renderSourceError(
      preflightReport,
      'The device check did not finish. You can still see what the file is above.',
    )
    log.error('ui', 'preflight request failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
  }
}

// --- Dev-only affordances --------------------------------------------------
// Hidden in production per UI-STANDARDS.md -> "Diagnostics affordance".

if (isDev) {
  devActions.hidden = false

  const copyButton = document.createElement('button')
  copyButton.type = 'button'
  copyButton.className = 'button button--secondary'
  copyButton.textContent = 'Copy diagnostics'
  copyButton.addEventListener('click', () => {
    void (async () => {
      const drained = await request({ kind: 'drainLogs' })
      if (drained.kind === 'logs') adoptLogRecords(drained.records)
      const copied = await copyDiagnostics()
      setStatus(
        copied
          ? 'Copied a redacted diagnostics bundle to the clipboard.'
          : 'Could not copy the diagnostics bundle. Check the console.',
      )
    })()
  })

  const throwMainButton = document.createElement('button')
  throwMainButton.type = 'button'
  throwMainButton.className = 'button button--secondary'
  throwMainButton.textContent = 'Trigger test error (main)'
  throwMainButton.addEventListener('click', () => {
    setTimeout(() => {
      throw new Error('Deliberate test error from the dev toolbar')
    }, 0)
  })

  const throwWorkerButton = document.createElement('button')
  throwWorkerButton.type = 'button'
  throwWorkerButton.className = 'button button--secondary'
  throwWorkerButton.textContent = 'Trigger test error (worker)'
  throwWorkerButton.addEventListener('click', () => {
    // Fire and forget: the worker answers via the unsolicited `uncaught`
    // event, not a reply to this id.
    worker.postMessage({ kind: 'throwTest', id: nextRequestId++ } satisfies WorkerRequest)
  })

  devActions.append(copyButton, throwMainButton, throwWorkerButton)
}

log.info('boot', 'shell mounted')
