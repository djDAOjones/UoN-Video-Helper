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
import type { PresetId } from './config/presets'
import { countCues } from './media/vtt'
import { formatFileSize } from './ui/format'
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
const processActions = required<HTMLDivElement>('#process-actions')
const processProgress = required<HTMLProgressElement>('#process-progress')
const processResult = required<HTMLDivElement>('#process-result')
const presetChoice = required<HTMLFieldSetElement>('#preset-choice')
const brandingChoice = required<HTMLFieldSetElement>('#branding-choice')
const brandingOpening = required<HTMLInputElement>('#branding-opening')
const brandingClosing = required<HTMLInputElement>('#branding-closing')
const subtitleField = required<HTMLDivElement>('#subtitle-field')
const subtitleInput = required<HTMLInputElement>('#subtitle-input')
const subtitleStatus = required<HTMLParagraphElement>('#subtitle-status')

/** The chosen sidecar's text, held until the job runs. */
let subtitleVtt: string | null = null

subtitleInput.addEventListener('change', () => {
  const file = subtitleInput.files?.[0]
  subtitleVtt = null
  if (!file) {
    subtitleStatus.textContent = ''
    return
  }
  void (async () => {
    try {
      const text = await file.text()
      const cues = countCues(text)
      if (cues === 0) {
        subtitleStatus.textContent =
          'No subtitles were found in that file. It should be a WebVTT (.vtt) file.'
        return
      }
      subtitleVtt = text
      subtitleStatus.textContent = `${cues} subtitle${cues === 1 ? '' : 's'} will be included, timed to match.`
    } catch {
      subtitleStatus.textContent = 'That subtitle file could not be read.'
    }
  })()
})

/** The D1 brand background, resolved from the token so answering D1 is one line. */
function brandBackground(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--uon-brand-bg').trim() || '#000000'
  )
}

/** Which output the user asked for. Defaults to the quality-preserving one. */
function chosenPreset(): PresetId {
  const checked = presetChoice.querySelector<HTMLInputElement>('input[name="preset"]:checked')
  return checked?.value === 'smaller' ? 'smaller' : 'best'
}

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
  return requestWithId(payload, timeoutMs).promise
}

/** As {@link request}, but exposes the id so the job can be cancelled. */
function requestWithId(
  payload: DistributiveOmit<WorkerRequest, 'id'>,
  timeoutMs = 5000,
): { id: number; promise: Promise<WorkerOutbound> } {
  const id = nextRequestId++
  const promise = new Promise<WorkerOutbound>((resolve, reject) => {
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
  return { id, promise }
}

/** `Omit` applied across a union rather than collapsing it into one member. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

worker.addEventListener('message', (event: MessageEvent<WorkerOutbound>) => {
  const message = event.data
  if (message.kind === 'uncaught') {
    recordUncaught(message.error)
    return
  }
  if (message.kind === 'stage') {
    // Progress never resolves the job's request — it reports on one in flight.
    onStage(message.stage, message.fraction)
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
  processActions.replaceChildren()
  processActions.hidden = true
  presetChoice.hidden = true
  brandingChoice.hidden = true
  subtitleField.hidden = true
  subtitleInput.value = ''
  subtitleStatus.textContent = ''
  subtitleVtt = null
  processResult.replaceChildren()

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

  try {
    const reply = await request({ kind: 'preflight', file, presetId: chosenPreset() }, 180_000)
    if (reply.kind === 'preflighted') {
      renderPreflight(preflightReport, reply.summary)
      setStatus(summarisePreflight(reply.summary))
      presetChoice.hidden = false
      brandingChoice.hidden = false
      subtitleField.hidden = false
      if (reply.summary.verdict.outcome !== 'block') showProcessControls(file)
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

presetChoice.addEventListener('change', () => {
  const file = fileInput.files?.[0]
  // The output shape, projected size and estimate all change with the preset,
  // so the verdict must be recomputed rather than left describing the other one.
  if (file) void runPreflight(file)
})

// --- Processing ---
//
// A minimal trigger so the pipeline is reachable and demonstrable. The real
// workflow — preset choice, branding toggles, named stages, save — is VH-10.

const STAGE_WORDS: Record<string, string> = {
  preparing: 'Getting ready',
  analysing: 'Analysing audio',
  encoding: 'Encoding video',
  finishing: 'Finishing the file',
}

function onStage(stage: string, fraction: number): void {
  const percent = Math.round(fraction * 100)
  setStatus(`${STAGE_WORDS[stage] ?? stage} — ${percent}%`)
  processProgress.value = fraction
  processProgress.hidden = false
}

function showProcessControls(file: File): void {
  processActions.replaceChildren()
  processActions.hidden = false

  const start = document.createElement('button')
  start.type = 'button'
  start.className = 'button'
  start.textContent = 'Create the video'

  const cancel = document.createElement('button')
  cancel.type = 'button'
  cancel.className = 'button button--secondary'
  cancel.textContent = 'Cancel'
  cancel.hidden = true

  start.addEventListener('click', () => {
    start.disabled = true
    cancel.hidden = false
    processResult.replaceChildren()

    const { id, promise } = requestWithId(
      {
        kind: 'process',
        file,
        presetId: chosenPreset(),
        branding: { opening: brandingOpening.checked, closing: brandingClosing.checked },
        backgroundColour: brandBackground(),
        ...(subtitleVtt ? { subtitleVtt } : {}),
      },
      3_600_000,
    )
    cancel.addEventListener('click', () => {
      cancel.disabled = true
      setStatus('Cancelling…')
      worker.postMessage({ kind: 'cancel', id: nextRequestId++, cancelId: id })
    })

    void promise
      .then((reply) => {
        if (reply.kind === 'processed') {
          renderResult(reply.file, reply.jobId)
          setStatus('Your video is ready.')
        } else if (reply.kind === 'cancelled') {
          // Nothing was written anywhere the user can see, and the source is
          // untouched — say so rather than leaving them wondering.
          setStatus('Cancelled. Nothing was saved, and your original file is unchanged.')
        } else if (reply.kind === 'failed') {
          renderSourceError(processResult, reply.message)
          setStatus('The video could not be created.')
        }
      })
      .catch((cause: unknown) => {
        renderSourceError(processResult, 'The job did not finish.')
        log.error('ui', 'process request failed', {
          reason: cause instanceof Error ? cause.message : String(cause),
        })
      })
      .finally(() => {
        start.disabled = false
        cancel.hidden = true
        cancel.disabled = false
        processProgress.hidden = true
      })
  })

  processActions.append(start, cancel)
}

function renderResult(file: File, jobId: string): void {
  processResult.replaceChildren()
  const paragraph = document.createElement('p')
  paragraph.className = 'verdict-detail'
  paragraph.textContent = `Finished: ${formatFileSize(file.size)}.`

  const link = document.createElement('a')
  link.href = URL.createObjectURL(file)
  link.download = 'branded-video.mp4'
  link.textContent = 'Download the video'
  link.className = 'result-link'
  // Provisional. VH-10 saves through the File System Access API so a
  // multi-gigabyte result never has to become an object URL.
  link.addEventListener('click', () => {
    setTimeout(() => {
      void request({ kind: 'discard', jobId }, 10_000)
    }, 2000)
  })

  processResult.append(paragraph, link)
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
