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
  setDiagnosticsContext,
  type CapturedError,
} from './core/diagnostics'
import { adoptLogRecords, log, setMinimumLogLevel } from './core/logger'
import { ProcessInterlock } from './core/process-interlock'
import { browserProcessingGuardEnvironment, ProcessingGuard } from './core/processing-guard'
import { ResultAuthority } from './core/result-authority'
import {
  SelectionAuthority,
  type ReadyJob,
  type SelectionAttempt,
} from './core/selection-authority'
import { APP_VERSION, BUILD_ID } from './core/version'
import { CLOSING_DEFAULTS } from './config/branding'
import type { PresetId } from './config/presets'
import { WORKER_SILENCE_LIMIT_MS } from './config/thresholds'
import { createWatchdog } from './core/watchdog'
import {
  DestinationCleanupError,
  releaseFallbackDownloads,
  saveFile,
  SourceOverwriteError,
  suggestedFileName,
} from './media/save'
import { pickSourceFile, sourceHandlePickerAvailable } from './media/source-picker'
import { countCues } from './media/vtt'
import type { OutputVerification } from './media/output-verification'
import { formatFileSize } from './ui/format'
import { renderPreflight, summarisePreflight } from './ui/preflight-panel'
import { renderWarnings } from './ui/warning-text'
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
const sourcePickerActions = required<HTMLDivElement>('#source-picker-actions')
const sourcePickerButton = required<HTMLButtonElement>('#source-picker-button')
const sourcePickerStatus = required<HTMLParagraphElement>('#source-picker-status')
const sourceReport = required<HTMLDivElement>('#source-report')
const preflightReport = required<HTMLDivElement>('#preflight-report')
const audioWarnings = required<HTMLDivElement>('#audio-warnings')
const processActions = required<HTMLDivElement>('#process-actions')
const processProgress = required<HTMLProgressElement>('#process-progress')
const processResult = required<HTMLDivElement>('#process-result')
const presetChoice = required<HTMLFieldSetElement>('#preset-choice')
const brandingChoice = required<HTMLFieldSetElement>('#branding-choice')
const brandingClosing = required<HTMLInputElement>('#branding-closing')
const brandingOptions = required<HTMLDetailsElement>('#branding-options')
const subtitleField = required<HTMLDivElement>('#subtitle-field')
const subtitleInput = required<HTMLInputElement>('#subtitle-input')
const subtitleStatus = required<HTMLParagraphElement>('#subtitle-status')

/** The chosen sidecar's text, held until the job runs. */
let subtitleVtt: string | null = null
let subtitleReadGeneration = 0
let subtitleReadPending = false

interface SelectedSource {
  readonly file: File
  /** Present only when source and destination identity can be compared safely. */
  readonly handle: FileSystemFileHandle | null
}

/** The sole authority for which checked source-and-preset pair Start may use. */
const selectionAuthority = new SelectionAuthority<SelectedSource, PresetId>()
let currentSource: SelectedSource | null = null
/** Source-summary metadata failures that were actually rendered before Start. */
const disclosedMetadataReadFailures = new WeakSet<SelectedSource>()

/**
 * Prefer handles whenever source/destination identity can be proved.
 *
 * The development-only override keeps private real-file rehearsals on the
 * accessible input path. Browser automation cannot populate the operating
 * system picker, and copying staff media into `public/` would risk publishing
 * it. Vite removes the override from production builds.
 */
const forceFileInput =
  import.meta.env.DEV &&
  new URLSearchParams(globalThis.location.search).get('source-picker') === 'file-input'
const useHandleSourcePicker = sourceHandlePickerAvailable() && !forceFileInput
sourcePickerActions.hidden = !useHandleSourcePicker
fileInput.hidden = useHandleSourcePicker
fileInput.disabled = useHandleSourcePicker

interface RetainedOutput {
  readonly file: File
  readonly jobId: string
  readonly sourceName: string
  readonly sourceHandle: FileSystemFileHandle | null
  readonly brandingApplied: { readonly opening: boolean; readonly closing: boolean }
  readonly brandingRequested: { readonly opening: boolean; readonly closing: boolean }
}

/** The one result whose worker workspace must remain readable until release. */
const resultAuthority = new ResultAuthority<RetainedOutput>()
const processingGuard = new ProcessingGuard(browserProcessingGuardEnvironment())

subtitleInput.addEventListener('change', () => {
  const file = subtitleInput.files?.[0]
  const generation = ++subtitleReadGeneration
  subtitleVtt = null
  subtitleReadPending = file !== undefined
  setJobInFlight(jobInFlight)
  if (!file) {
    subtitleStatus.textContent = ''
    return
  }
  void (async () => {
    try {
      const text = await file.text()
      if (generation !== subtitleReadGeneration) return
      const cues = countCues(text)
      if (cues === 0) {
        subtitleStatus.textContent =
          'No subtitles were found in that file. It should be a WebVTT (.vtt) file.'
        return
      }
      subtitleVtt = text
      subtitleStatus.textContent = `${cues} subtitle${cues === 1 ? '' : 's'} will be included, timed to match.`
    } catch {
      if (generation !== subtitleReadGeneration) return
      subtitleStatus.textContent = 'That subtitle file could not be read.'
    } finally {
      if (generation === subtitleReadGeneration) {
        subtitleReadPending = false
        setJobInFlight(jobInFlight)
      }
    }
  })()
})

/** The D1 brand background, resolved from the token so answering D1 is one line. */
function brandBackground(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--uon-brand-bg').trim() ||
    '#000000'
  )
}

/** Which output the user asked for. Defaults to the quality-preserving one. */
function chosenPreset(): PresetId {
  const checked = presetChoice.querySelector<HTMLInputElement>('input[name="preset"]:checked')
  return checked?.value === 'smaller' ? 'smaller' : 'best'
}

/**
 * Reads one closing-sequence radio group, falling back to the default.
 *
 * The value is trusted only if it is one the config actually knows: the DOM is
 * editable, and an unrecognised mode would reach the pipeline as a string that
 * matches no branch.
 */
function chosenBranding<T extends string>(
  group: 'style' | 'colour' | 'mode',
  fallback: T,
  allowed: readonly string[] = BRANDING_VALUES[group],
): T {
  const checked = brandingChoice.querySelector<HTMLInputElement>(
    `input[name="branding-${group}"]:checked`,
  )
  const value = checked?.value
  return value !== undefined && allowed.includes(value) ? (value as T) : fallback
}

const BRANDING_VALUES = {
  style: ['fade', 'slide'],
  colour: ['blue', 'white'],
  mode: ['hard-cut', 'over-picture', 'over-freeze'],
} as const

/**
 * Shows the closing options only when a closing is wanted.
 *
 * Mode and animation used to be chosen here too. VH-44 fixed and verified the
 * Firefox compositing defect; VH-46b then kept both controls hidden until the
 * VH-32 interface redesign decides whether and how to present them. Fade and
 * Slide differ only during the build a hard cut discards, so with the modes
 * hidden the animation choice could not change anything. {@link
 * chosenBranding} falls back to {@link CLOSING_DEFAULTS} for both.
 */
function syncBrandingOptions(): void {
  const wantsClosing = brandingClosing.checked
  brandingOptions.hidden = !wantsClosing
  if (!wantsClosing) brandingOptions.open = false
}

brandingChoice.addEventListener('change', syncBrandingOptions)
syncBrandingOptions()

versionLine.textContent = `${APP_VERSION} · ${BUILD_ID}${isDev ? ' · development' : ''}`

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
let workerFailed = false

let nextRequestId = 1
const pending = new Map<
  number,
  {
    readonly resolve: (message: WorkerOutbound) => void
    readonly reject: (cause: Error) => void
  }
>()
/** Resets the watchdog for a request that is still being answered. */
const keepAlive = new Map<number, () => void>()
/**
 * Process ownership whose caller timed out but whose worker may still answer.
 *
 * The terminal reply cannot simply be ignored: a late `processed` owns an
 * OPFS workspace until the main thread explicitly discards it. The interlock
 * also keeps Start and browser lifecycle protection closed over that gap.
 */
const processInterlock = new ProcessInterlock()

/**
 * Sends a request and resolves with its reply.
 *
 * @param payload - The request without its `id`, which is assigned here.
 * @param timeoutMs - Inspection of a multi-gigabyte file legitimately takes
 *   longer than a ping, so the caller sets the bound rather than sharing one.
 */
function request(
  payload: DistributiveOmit<WorkerRequest, 'id'>,
  timeoutMs: number | null = 5000,
): Promise<WorkerOutbound> {
  return requestWithId(payload, timeoutMs).promise
}

/**
 * As {@link request}, but exposes the id so the job can be cancelled.
 *
 * `bound` chooses what the watchdog measures. A number is a deadline for the
 * whole exchange, which suits a request that should answer promptly. `idleMs`
 * measures SILENCE instead, resetting on every message the worker sends about
 * this request — which is what a job needs, because spec section 7 opens with
 * "no arbitrary file-size or duration cap" and a whole-exchange deadline is
 * exactly such a cap (VH-38). A three-hour lecture that is reporting progress
 * every few seconds is healthy; one that has said nothing for a minute is not,
 * however long it has been running.
 */
function requestWithId(
  payload: DistributiveOmit<WorkerRequest, 'id'>,
  bound: number | { readonly idleMs: number } | null = 5000,
): { id: number; promise: Promise<WorkerOutbound> } {
  const id = nextRequestId++
  if (workerFailed) {
    return {
      id,
      promise: Promise.reject(
        new Error('The background worker is unavailable. Reload the page to restart it.'),
      ),
    }
  }
  const idleMs = bound !== null && typeof bound !== 'number' ? bound.idleMs : null
  const limitMs = bound === null ? null : typeof bound === 'number' ? bound : bound.idleMs

  const promise = new Promise<WorkerOutbound>((resolve, reject) => {
    const watchdog =
      limitMs === null
        ? null
        : createWatchdog(limitMs, () => {
            pending.delete(id)
            keepAlive.delete(id)
            if (payload.kind === 'process') processInterlock.markTimedOut(id)
            // Tell the worker to stop before walking away. Without this the job kept
            // encoding, its result landed in the worker's `finished` map, and nothing
            // ever released it — the user was told the job had not finished while it
            // quietly ran to completion and held its output forever (VH-38).
            worker.postMessage({ kind: 'cancel', id: nextRequestId++, cancelId: id })
            reject(
              new Error(
                idleMs === null
                  ? `Worker did not answer "${payload.kind}" within ${limitMs} ms`
                  : `Worker went quiet for ${limitMs} ms during "${payload.kind}"`,
              ),
            )
          })

    if (idleMs !== null && watchdog !== null) keepAlive.set(id, () => watchdog.reset())
    const settle = (complete: () => void): void => {
      watchdog?.clear()
      keepAlive.delete(id)
      pending.delete(id)
      complete()
    }
    pending.set(id, {
      resolve: (message) => settle(() => resolve(message)),
      reject: (cause) => settle(() => reject(cause)),
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
    if (processInterlock.hasTimedOut(message.id)) return
    // Progress never resolves the job's request — it reports on one in flight,
    // which is exactly what the watchdog needs to hear.
    keepAlive.get(message.id)?.()
    onStage(message.stage, message.fraction)
    return
  }

  if (processInterlock.acknowledgeTimedOut(message.id)) {
    if (message.kind === 'processed') {
      holdCleanupOwnership(message.jobId)
      const cleanupNotice = document.createElement('p')
      cleanupNotice.className = 'verdict-detail'
      cleanupNotice.textContent =
        'The stopped job returned a late result. Its temporary files are being removed before another video can start.'
      processResult.replaceChildren(cleanupNotice)
      setStatus('Removing a late result from the stopped job…')
      void request({ kind: 'discard', jobId: message.jobId }, null)
        .then((reply) => {
          if (reply.kind === 'failed' && reply.retainedJobId) {
            renderCleanupRetry(reply.retainedJobId, reply.message)
            return
          }
          if (reply.kind !== 'discarded')
            throw new Error(`Unexpected late-result discard reply: ${reply.kind}`)
          log.info('ui', 'late result from timed-out job was discarded')
          completeCleanupOwnership(
            message.jobId,
            'The stopped job was cleaned up. Your original video is unchanged.',
          )
        })
        .catch((cause: unknown) => {
          log.error('ui', 'late result from timed-out job could not be discarded', {
            errorName: cause instanceof Error ? cause.name : 'unknown',
          })
          renderCleanupRetry(
            message.jobId,
            workerFailed
              ? 'The stopped job left temporary files. Save any visible result and reload this page to release them.'
              : 'The stopped job left a temporary result that could not be removed. Try the cleanup again.',
          )
        })
    } else if (message.kind === 'failed' && message.retainedJobId) {
      renderCleanupRetry(message.retainedJobId, message.message)
    } else {
      // Cancelled, or failed without retained scratch: the terminal reply is
      // the proof that watchdog ownership may finally be released.
      setJobInFlight(jobInFlight)
    }
    return
  }
  pending.get(message.id)?.resolve(message)
})

/**
 * True once the worker has answered a ping. Distinguishes "never started"
 * from "started and later threw" — only the first is a startup failure, and
 * only the first leaves the worker's own error hook uninstalled.
 */
worker.addEventListener('error', (event) => {
  event.preventDefault()
  workerFailed = true
  worker.terminate()
  const failure = new Error(event.message || 'The background worker failed')
  for (const request of [...pending.values()]) request.reject(failure)
  pending.clear()
  keepAlive.clear()
  processInterlock.clearTimedOut()

  recordUncaught({
    ts: Date.now(),
    message: event.message || 'The background worker failed to start',
    origin: 'error',
    thread: 'worker',
  })
  renderCheck('worker', 'Background processing', 'fail', 'stopped')
  setStatus('Background processing stopped. Save any visible result, then reload this page.')
  setJobInFlight(false)
})

async function checkWorker(): Promise<void> {
  const startedAt = performance.now()
  const reply = await request({ kind: 'ping' })
  if (reply.kind !== 'pong') throw new Error(`Unexpected reply to ping: ${reply.kind}`)
  const roundTripMs = Math.round(performance.now() - startedAt)
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
  selectSource(file ? Object.freeze({ file, handle: null }) : null)
})

sourcePickerButton.addEventListener('click', () => {
  if (jobInFlight || workerFailed) return
  sourcePickerButton.disabled = true
  void (async () => {
    try {
      const outcome = await pickSourceFile()
      if (outcome.kind === 'cancelled') {
        setStatus('No different video was chosen.')
        return
      }
      // Never display or log the filename. The File itself remains the source
      // of the eventual suggested output name, entirely on this device.
      sourcePickerStatus.textContent = 'Video selected.'
      fileInput.value = ''
      selectSource(outcome.source)
    } catch (cause) {
      setStatus('The video picker could not be opened. Try again.')
      log.error('ui', 'source picker failed', {
        errorName: cause instanceof Error ? cause.name : 'unknown',
      })
    } finally {
      sourcePickerButton.disabled = jobInFlight || workerFailed
    }
  })()
})

/** Starts a new generation for a source selected by either accessible route. */
function selectSource(source: SelectedSource | null): void {
  currentSource = source
  setDiagnosticsContext({
    view: source ? 'inspect' : 'select',
    sourceReport: null,
    capability: null,
    jobSpec: null,
  })
  const file = source?.file
  const selection = source ? selectionAuthority.begin(source, chosenPreset()) : null

  sourceReport.replaceChildren()
  preflightReport.replaceChildren()
  audioWarnings.replaceChildren()
  // Hidden, not replaced: the Start and Cancel buttons live for the whole
  // session now, and emptying this container would throw them away (VH-36).
  hideProcessControls()
  presetChoice.hidden = true
  brandingChoice.hidden = true
  subtitleField.hidden = true
  subtitleInput.value = ''
  subtitleStatus.textContent = ''
  subtitleVtt = null
  subtitleReadGeneration++
  subtitleReadPending = false
  if (!resultAuthority.active && pendingCleanupJobId === null) processResult.replaceChildren()

  if (!file || !selection) {
    selectionAuthority.invalidate()
    setStatus('Choose a video to begin.')
    return
  }

  // Never log the filename — DEV-INFRASTRUCTURE.md -> "Redaction".
  log.info('ui', 'file chosen', { sizeBytes: file.size, type: file.type })
  setStatus('Reading the video…')

  void (async () => {
    try {
      // Two minutes: reading structure is fast, but a multi-gigabyte file on a
      // slow disk is not, and timing out on a file that would have worked is
      // worse than waiting.
      const reply = await request({ kind: 'inspect', file }, 120_000)
      if (!selectionAuthority.isCurrent(selection)) return
      if (reply.kind === 'inspected') {
        setDiagnosticsContext({ sourceReport: reply.report })
        renderSourceReport(sourceReport, reply.report)
        if (reply.report.metadata.readable) disclosedMetadataReadFailures.delete(selection.file)
        else disclosedMetadataReadFailures.add(selection.file)
        setStatus(summarise(reply.report))
        // Structure first, then the measurement — the probe really does decode
        // and encode three seconds, so it must not hold up what we already know.
        await runPreflight(selection)
        return
      }
      if (reply.kind === 'failed') {
        renderSourceError(sourceReport, reply.message)
        setStatus('That file could not be read.')
        return
      }
      throw new Error(`Unexpected reply to inspect: ${reply.kind}`)
    } catch (cause) {
      if (!selectionAuthority.isCurrent(selection)) return
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
}

/**
 * Runs the device check for the chosen file.
 *
 * The captured selection, rather than current DOM state, decides what is
 * measured. That same generation must still be current before any reply is
 * rendered or accepted as runnable.
 */
async function runPreflight(selection: SelectionAttempt<SelectedSource, PresetId>): Promise<void> {
  setStatus('Checking this video against your device…')

  try {
    const reply = await request(
      { kind: 'preflight', file: selection.file.file, presetId: selection.presetId },
      180_000,
    )
    if (!selectionAuthority.isCurrent(selection)) return
    if (reply.kind === 'preflighted') {
      setDiagnosticsContext({
        view: 'preflight',
        capability: {
          capability: reply.summary.capability,
          encode: reply.summary.encode,
          probe: reply.summary.probe,
          shape: reply.summary.shape,
          verdict: reply.summary.verdict,
        },
      })
      renderPreflight(preflightReport, reply.summary, {
        onDiscourageAcknowledgement: (acknowledged) => {
          if (!selectionAuthority.isCurrent(selection)) return
          if (acknowledged) showProcessControls(selection)
          else {
            selectionAuthority.revoke(selection)
            hideProcessControls()
          }
        },
      })
      renderWarnings(audioWarnings, reply.summary.audioWarnings, {
        heading: 'Worth knowing about the sound',
      })
      setStatus(summarisePreflight(reply.summary))
      presetChoice.hidden = false
      brandingChoice.hidden = false
      subtitleField.hidden = false
      if (reply.summary.verdict.outcome === 'proceed' || reply.summary.verdict.outcome === 'warn') {
        showProcessControls(selection)
      }
      return
    }
    if (reply.kind === 'failed') {
      renderSourceError(preflightReport, reply.message)
      return
    }
    throw new Error(`Unexpected reply to preflight: ${reply.kind}`)
  } catch (cause) {
    if (!selectionAuthority.isCurrent(selection)) return
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
  const source = currentSource
  // The output shape, projected size and estimate all change with the preset,
  // so the verdict must be recomputed rather than left describing the other one.
  if (!source) {
    selectionAuthority.invalidate()
    hideProcessControls()
    return
  }
  const selection = selectionAuthority.begin(source, chosenPreset())
  hideProcessControls()
  preflightReport.replaceChildren()
  audioWarnings.replaceChildren()
  void runPreflight(selection)
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

/**
 * The one fact the screen is arranged around: is a job running right now?
 *
 * It is a single flag with a single applier because the alternative — each
 * control deciding for itself — is what VH-36 was. VH-32 inherits this rather
 * than re-deciding it.
 */
let jobInFlight = false
/** A failed/cancelled job whose temporary workspace still needs a confirmed retry. */
let pendingCleanupJobId: string | null = null

/** The running job's request id, so Cancel reaches the right one. */
let jobCancelId: number | null = null
/** The exact job for which the user has asked to cancel, including a late reply race. */
let cancelRequestedForId: number | null = null

// Built ONCE, at module scope, and never replaced. The previous version
// rebuilt both buttons on every preflight — so changing the preset mid-job
// detached the running job's Cancel and handed back a fresh, enabled Start,
// leaving the job uncancellable and a second one launchable (VH-36).
const startButton = document.createElement('button')
startButton.type = 'button'
startButton.className = 'button'
startButton.textContent = 'Create the video'
startButton.disabled = true

const cancelButton = document.createElement('button')
cancelButton.type = 'button'
cancelButton.className = 'button button--secondary'
cancelButton.textContent = 'Cancel'
cancelButton.hidden = true

processActions.append(startButton, cancelButton)

/** Moves focus to the next visible workflow control before removing its owner. */
function focusNextWorkflowControl(includeResult = true): void {
  if (includeResult) {
    const resultControl = [...processResult.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) =>
        !button.disabled && !button.hidden && button.closest<HTMLElement>('[hidden]') === null,
    )
    if (resultControl) {
      resultControl.focus()
      return
    }
  }

  if (!processActions.hidden && !startButton.disabled) {
    startButton.focus()
    return
  }
  if (useHandleSourcePicker && !sourcePickerButton.disabled && !sourcePickerButton.hidden) {
    sourcePickerButton.focus()
    return
  }
  if (!fileInput.disabled && !fileInput.hidden) {
    fileInput.focus()
    return
  }

  statusLine.tabIndex = -1
  statusLine.focus()
  statusLine.removeAttribute('tabindex')
}

/**
 * Locks or releases everything a running job must not have changed under it.
 *
 * Changing the file or the preset mid-job re-runs preflight and invalidates
 * what the job was started for; changing the branding changes what is being
 * built. Disabling is the mechanism spec 9.2 and `UI-STANDARDS.md` ->
 * "Error prevention" call for — constrain rather than warn afterwards.
 */
function setJobInFlight(running: boolean): void {
  jobInFlight = running
  processInterlock.setRunning(running)
  const locked = processInterlock.locked
  if (locked) processingGuard.start()
  else void processingGuard.stop()
  fileInput.disabled = locked || workerFailed || useHandleSourcePicker
  sourcePickerButton.disabled = locked || workerFailed
  subtitleInput.disabled = locked || workerFailed
  presetChoice.disabled = locked || workerFailed
  brandingChoice.disabled = locked || workerFailed
  startButton.disabled =
    locked ||
    subtitleReadPending ||
    workerFailed ||
    pendingCleanupJobId !== null ||
    selectionAuthority.readyJob === null ||
    resultAuthority.active !== null
  if (!running && document.activeElement === cancelButton) focusNextWorkflowControl()
  cancelButton.hidden = !running
  cancelButton.disabled = false
}

/** Makes one worker workspace a first-class owner before starting its cleanup. */
function holdCleanupOwnership(jobId: string): void {
  pendingCleanupJobId = jobId
  processingGuard.setRetainedResult(true)
  setJobInFlight(jobInFlight)
}

/** Clears cleanup ownership only after the worker acknowledges removal. */
function completeCleanupOwnership(jobId: string, status: string): void {
  if (pendingCleanupJobId !== jobId) return
  pendingCleanupJobId = null
  processingGuard.setRetainedResult(resultAuthority.active !== null)
  setDiagnosticsContext({ view: currentSource ? 'preflight' : 'select', jobSpec: null })
  setStatus(status)
  setJobInFlight(jobInFlight)
  focusNextWorkflowControl(false)
  processResult.replaceChildren()
}

/**
 * Keeps failed temporary storage under visible UI ownership until removal is
 * acknowledged. Reload remains protected while the worker still holds it.
 */
function renderCleanupRetry(jobId: string, message: string): void {
  holdCleanupOwnership(jobId)
  processResult.replaceChildren()

  const notice = document.createElement('p')
  notice.className = 'verdict-detail'
  notice.textContent = message

  const retry = document.createElement('button')
  retry.type = 'button'
  retry.className = 'button button--secondary'
  retry.textContent = 'Retry temporary-file cleanup'
  retry.addEventListener('click', () => {
    if (pendingCleanupJobId !== jobId) return
    retry.disabled = true
    setStatus('Removing temporary working files…')
    void request({ kind: 'discard', jobId }, null)
      .then((reply) => {
        if (reply.kind !== 'discarded') {
          notice.textContent =
            reply.kind === 'failed'
              ? reply.message
              : 'The temporary files could not be confirmed as removed. Try again.'
          retry.disabled = false
          setStatus('Temporary cleanup did not finish. The files remain protected for another try.')
          return
        }
        completeCleanupOwnership(
          jobId,
          'Temporary working files removed. Your original video is unchanged.',
        )
      })
      .catch((cause: unknown) => {
        retry.disabled = false
        setStatus(
          'Cleanup could not contact the background worker. Reload this page before retrying.',
        )
        log.error('ui', 'temporary cleanup retry failed', {
          errorName: cause instanceof Error ? cause.name : 'unknown',
        })
      })
  })

  processResult.append(notice, retry)
  setStatus('Temporary working files still need to be removed before another video can start.')
  setJobInFlight(jobInFlight)
}

startButton.addEventListener('click', () => {
  const readyJob: ReadyJob<SelectedSource, PresetId> | null = selectionAuthority.readyJob
  if (
    !readyJob ||
    workerFailed ||
    processInterlock.locked ||
    resultAuthority.active ||
    pendingCleanupJobId !== null
  )
    return
  const { file: source, presetId, generation } = readyJob
  const { file } = source
  const branding = Object.freeze({
    opening: false,
    closing: brandingClosing.checked,
    style: chosenBranding('style', CLOSING_DEFAULTS.style),
    colour: chosenBranding('colour', CLOSING_DEFAULTS.colour),
    mode: chosenBranding('mode', CLOSING_DEFAULTS.mode),
  })

  setDiagnosticsContext({
    view: 'processing',
    jobSpec: {
      selectionGeneration: generation,
      metadataReadFailureDisclosed: disclosedMetadataReadFailures.has(source),
      presetId,
      branding,
      sidecarPresent: subtitleVtt !== null,
    },
  })

  processResult.replaceChildren()

  const { id, promise } = requestWithId(
    {
      kind: 'process',
      file,
      presetId,
      selectionGeneration: generation,
      metadataReadFailureDisclosed: disclosedMetadataReadFailures.has(source),
      // Opening stays false: VH-33 withdrew the control until an approved
      // asset exists. The immutable value above also enters diagnostics.
      branding,
      backgroundColour: brandBackground(),
      ...(subtitleVtt ? { subtitleVtt } : {}),
    },
    // Silence, not duration. A job reports a stage every thirty frames, so a
    // minute without a word means something is genuinely wrong — while an
    // hour of honest work no longer trips anything (VH-38).
    { idleMs: WORKER_SILENCE_LIMIT_MS },
  )
  jobCancelId = id
  cancelRequestedForId = null
  setJobInFlight(true)

  void promise
    .then(async (reply) => {
      if (reply.kind === 'processed') {
        const cancellationWasRequested = cancelRequestedForId === id
        if (cancellationWasRequested) {
          try {
            const discardReply = await request({ kind: 'discard', jobId: reply.jobId }, null)
            if (discardReply.kind === 'discarded') {
              setStatus('Cancelled. Nothing was saved, and your original file is unchanged.')
              setDiagnosticsContext({ view: 'preflight', jobSpec: null })
              return
            }
            log.error('ui', 'late-cancel result was not discarded', {
              replyKind: discardReply.kind,
            })
          } catch (cause) {
            // Retain the completed file when cleanup cannot be proved. Losing a
            // readable result is worse than asking for an explicit retry.
            log.error('ui', 'late-cancel result discard failed', {
              errorName: cause instanceof Error ? cause.name : 'unknown',
            })
          }
        }

        const result = Object.freeze({
          file: reply.file,
          jobId: reply.jobId,
          sourceName: file.name,
          sourceHandle: source.handle,
          brandingApplied: reply.brandingApplied,
          brandingRequested: reply.brandingRequested,
        })
        if (!resultAuthority.retain(result)) {
          // The worker rejects a second result, so this is defensive only. Keep
          // the earlier user-visible result and release the impossible extra.
          log.error('ui', 'worker returned a second retained result')
          void request({ kind: 'discard', jobId: reply.jobId }, null)
          return
        }
        processingGuard.setRetainedResult(true)
        setDiagnosticsContext({ view: 'result' })
        renderResult(result, reply.outputVerification)
        renderWarnings(audioWarnings, reply.outputWarnings, {
          heading: 'Worth knowing about the finished video',
        })
        if (cancellationWasRequested) {
          setStatus(
            'The video finished before cancellation could be confirmed. The result is still here to save or discard.',
          )
        } else if (reply.outputVerification.status === 'failed') {
          setStatus('Your video is ready, but its finished sound did not pass the checks.')
        } else if (reply.outputVerification.status === 'unverified') {
          setStatus('Your video is ready, but its finished sound could not be checked.')
        } else {
          setStatus('Your video is ready.')
        }
      } else if (reply.kind === 'cancelled') {
        // Nothing was written anywhere the user can see, and the source is
        // untouched — say so rather than leaving them wondering.
        setStatus('Cancelled. Nothing was saved, and your original file is unchanged.')
        setDiagnosticsContext({ view: 'preflight', jobSpec: null })
      } else if (reply.kind === 'failed') {
        if (reply.retainedJobId) {
          renderCleanupRetry(reply.retainedJobId, reply.message)
        } else {
          if (!resultAuthority.active) renderSourceError(processResult, reply.message)
          setStatus('The video could not be created.')
        }
        setDiagnosticsContext({ view: 'preflight', jobSpec: null })
      }
    })
    .catch((cause: unknown) => {
      if (!resultAuthority.active) renderSourceError(processResult, 'The job did not finish.')
      setDiagnosticsContext({ view: 'preflight', jobSpec: null })
      log.error('ui', 'process request failed', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
    })
    .finally(() => {
      jobCancelId = null
      if (cancelRequestedForId === id) cancelRequestedForId = null
      setJobInFlight(false)
      processProgress.hidden = true
    })
})

// Bound once, here, rather than inside the Start handler — where it added
// another listener on every Start click, so the second job posted two cancels
// (VH-36).
cancelButton.addEventListener('click', () => {
  if (jobCancelId === null) return
  cancelRequestedForId = jobCancelId
  cancelButton.disabled = true
  setStatus('Cancelling…')
  worker.postMessage({ kind: 'cancel', id: nextRequestId++, cancelId: jobCancelId })
})

/** Hides and disables Start while a new selection is being checked. */
function hideProcessControls(): void {
  processActions.hidden = true
  startButton.disabled = true
}

/** Accepts this checked selection as Start's immutable authority and reveals it. */
function showProcessControls(selection: SelectionAttempt<SelectedSource, PresetId>): void {
  if (!selectionAuthority.accept(selection)) return
  processActions.hidden = false
  startButton.disabled =
    jobInFlight ||
    subtitleReadPending ||
    workerFailed ||
    pendingCleanupJobId !== null ||
    resultAuthority.active !== null
}

function renderResult(result: RetainedOutput, verification: OutputVerification): void {
  const { file, jobId, sourceName, brandingApplied: applied, brandingRequested: requested } = result
  processResult.replaceChildren()

  const summary = document.createElement('p')
  summary.className = 'verdict-detail'
  summary.textContent = `Your video is ready — ${formatFileSize(file.size)}.`
  processResult.append(summary)

  if (verification.status === 'failed' || verification.status === 'unverified') {
    const verificationNotice = document.createElement('p')
    verificationNotice.className = 'verdict-detail'
    verificationNotice.textContent =
      verification.status === 'failed'
        ? 'The finished audio did not meet one or more required sound checks. Review it before sharing.'
        : 'The finished audio could not be checked. Listen to it before sharing.'
    processResult.append(verificationNotice)
  }

  // Exact decoded-output figures are useful during a private real-file
  // rehearsal, but are implementation detail for the production audience.
  // Keeping them dev-only preserves the app's novice-facing conveyor model.
  if (isDev && (verification.status === 'passed' || verification.status === 'failed')) {
    const verificationMeasurement = document.createElement('p')
    verificationMeasurement.className = 'verdict-detail'
    verificationMeasurement.dataset.outputVerification = verification.status
    verificationMeasurement.textContent =
      `Development verification: ${verification.integratedLufs.toFixed(2)} LUFS; ` +
      `${verification.truePeakDbtp.toFixed(2)} dBTP (${verification.status}).`
    processResult.append(verificationMeasurement)
  }

  // VH-22: branding that was asked for but could not be loaded is skipped
  // rather than failing the job, so the result has to say so. A video missing
  // its branding, delivered silently, is the failure this prevents.
  const missing: string[] = []
  if (requested.opening && !applied.opening) missing.push('opening')
  if (requested.closing && !applied.closing) missing.push('closing')
  if (missing.length > 0) {
    const notice = document.createElement('p')
    notice.className = 'verdict-detail'
    notice.textContent = `The ${missing.join(' and ')} sequence could not be loaded, so it is not in this video. Everything else was applied as asked.`
    processResult.append(notice)
  }

  const ownership = document.createElement('p')
  ownership.className = 'verdict-detail'
  ownership.textContent =
    'Save or discard this result before creating another video. Choosing a different source will not remove it.'
  processResult.append(ownership)

  const save = document.createElement('button')
  save.type = 'button'
  save.className = 'button'
  save.textContent = 'Save the video'

  const discard = document.createElement('button')
  discard.type = 'button'
  discard.className = 'button button--secondary'
  discard.textContent = 'Discard this result'

  const cancelSaving = document.createElement('button')
  cancelSaving.type = 'button'
  cancelSaving.className = 'button button--secondary'
  cancelSaving.textContent = 'Cancel saving'
  cancelSaving.hidden = true
  cancelSaving.disabled = true

  const confirmation = document.createElement('div')
  confirmation.id = `discard-confirmation-${jobId}`
  confirmation.hidden = true
  confirmation.setAttribute('role', 'group')

  const confirmationText = document.createElement('p')
  confirmationText.id = `discard-confirmation-text-${jobId}`
  confirmationText.className = 'verdict-detail'
  confirmationText.textContent =
    'Discard this result? You will not be able to save it afterwards. If a browser download is still running, it may not finish. Your original video is unchanged.'
  confirmation.setAttribute('aria-labelledby', confirmationText.id)

  const keep = document.createElement('button')
  keep.type = 'button'
  keep.className = 'button button--secondary'
  keep.textContent = 'Keep result'

  const confirmDiscard = document.createElement('button')
  confirmDiscard.type = 'button'
  confirmDiscard.className = 'button'
  confirmDiscard.textContent = 'Discard result'

  const resultActions = document.createElement('div')
  resultActions.className = 'actions'
  resultActions.append(save, discard, cancelSaving)

  const confirmationActions = document.createElement('div')
  confirmationActions.className = 'actions'
  confirmationActions.append(keep, confirmDiscard)
  confirmation.append(confirmationText, confirmationActions)

  discard.setAttribute('aria-controls', confirmation.id)
  discard.setAttribute('aria-expanded', 'false')

  /** Keeps every ownership-changing control in one coherent busy state. */
  const setResultBusy = (busy: boolean): void => {
    save.disabled = busy
    discard.disabled = busy
    keep.disabled = busy
    confirmDiscard.disabled = busy
  }

  let activeSaveController: AbortController | null = null
  let statusHasTemporaryFocus = false

  /** Never leave keyboard focus on a button at the instant it becomes hidden. */
  const hideCancelSaving = (): void => {
    if (document.activeElement === cancelSaving) {
      statusLine.tabIndex = -1
      statusLine.focus()
      statusHasTemporaryFocus = true
    }
    cancelSaving.hidden = true
    cancelSaving.disabled = true
  }

  /** Removes the programmatic stop only after the final intentional focus move. */
  const releaseTemporaryStatusFocus = (): void => {
    if (!statusHasTemporaryFocus) return
    statusLine.removeAttribute('tabindex')
    statusHasTemporaryFocus = false
  }

  cancelSaving.addEventListener('click', () => {
    const controller = activeSaveController
    if (!controller || controller.signal.aborted) return
    controller.abort()
    cancelSaving.disabled = true
    setStatus('Stopping the save…')
  })

  /** Releases the UI only after the worker confirms workspace disposal. */
  const finishDiscard = async (): Promise<void> => {
    const reply = await request({ kind: 'discard', jobId }, null)
    if (reply.kind !== 'discarded') {
      throw new Error(`Unexpected reply to discard: ${reply.kind}`)
    }
    if (!resultAuthority.release(result)) {
      throw new Error('Discard completed for a result that is no longer current')
    }
    processingGuard.setRetainedResult(false)
    setDiagnosticsContext({ view: currentSource ? 'preflight' : 'select', jobSpec: null })
    releaseFallbackDownloads(file)
    setJobInFlight(jobInFlight)
    focusNextWorkflowControl(false)
    processResult.replaceChildren()
  }

  save.addEventListener('click', () => {
    if (!resultAuthority.beginSave(result)) return
    const saveController = new AbortController()
    activeSaveController = saveController
    setResultBusy(true)
    // A comparable source handle means this route can stream through the save
    // picker. Its write may be large enough to need an explicit way back out.
    cancelSaving.hidden = result.sourceHandle === null
    cancelSaving.disabled = result.sourceHandle === null
    if (!cancelSaving.hidden) cancelSaving.focus()
    void processingGuard.setSaving(true)
    setStatus('Saving the video…')
    void (async () => {
      try {
        const outcome = await saveFile(
          file,
          suggestedFileName(sourceName),
          result.sourceHandle,
          saveController.signal,
        )
        // The cancellable part ends with the picker write. Workspace cleanup
        // may still be running, but presenting Cancel then would be a lie.
        if (activeSaveController === saveController) activeSaveController = null
        if (outcome.kind === 'cancelled') {
          resultAuthority.retainAfterSave(result)
          setStatus('Not saved. The video is still here when you want it.')
          hideCancelSaving()
          return
        }
        if (outcome.kind === 'download-started') {
          resultAuthority.markDownloadStarted(result)
          ownership.textContent =
            'A download was started, but the browser cannot confirm when it finishes. Keep this result until the download is safely complete, then discard it.'
          setStatus(
            `Download of “${outcome.fileName}” started. The browser does not report when it finishes, so this result is still available. Discard it only after the download is safely complete.`,
          )
          hideCancelSaving()
          return
        }

        // `saved` means the picker pipe closed successfully. Until then the
        // OPFS-backed File is still owned here and must remain readable.
        if (!resultAuthority.beginDiscard(result)) {
          throw new Error('Saved result could not enter the discard state')
        }
        setStatus(`Saved as “${outcome.fileName}”. Releasing the temporary working copy…`)
        hideCancelSaving()
        await finishDiscard()
        setStatus(`Saved as “${outcome.fileName}”.`)
      } catch (cause) {
        const discardFailed = resultAuthority.active?.status === 'discarding'
        const sourceOverwrite = cause instanceof SourceOverwriteError
        const destinationUncertain = cause instanceof DestinationCleanupError
        if (discardFailed) resultAuthority.retainAfterDiscardFailure(result)
        else resultAuthority.retainAfterSave(result)
        if (discardFailed) {
          ownership.textContent =
            'The video was saved, but its temporary result is still retained. Discard it before creating another video.'
        }
        setStatus(
          discardFailed
            ? 'The video was saved, but its temporary working copy could not be released. The result is still here to discard.'
            : sourceOverwrite
              ? 'Choose a different destination. The original source file cannot be replaced.'
              : destinationUncertain
                ? 'The save stopped because the destination could not be verified safely. Check the folder you chose. The video is still here to try again.'
                : 'The video could not be saved. It is still here to try again.',
        )
        log.error('ui', 'save failed', {
          errorName: cause instanceof Error ? cause.name : 'unknown',
        })
      } finally {
        if (activeSaveController === saveController) activeSaveController = null
        hideCancelSaving()
        await processingGuard.setSaving(false)
        if (resultAuthority.owns(result)) {
          setResultBusy(false)
          save.focus()
        }
        releaseTemporaryStatusFocus()
      }
    })()
  })

  discard.addEventListener('click', () => {
    confirmation.hidden = false
    discard.disabled = true
    save.disabled = true
    discard.setAttribute('aria-expanded', 'true')
    keep.focus()
  })

  keep.addEventListener('click', () => {
    discard.disabled = false
    save.disabled = false
    discard.setAttribute('aria-expanded', 'false')
    discard.focus()
    confirmation.hidden = true
  })

  confirmDiscard.addEventListener('click', () => {
    if (!resultAuthority.beginDiscard(result)) return
    setResultBusy(true)
    setStatus('Discarding the result…')
    void (async () => {
      try {
        await finishDiscard()
        setStatus('Result discarded. Your original video is unchanged.')
      } catch (cause) {
        resultAuthority.retainAfterDiscardFailure(result)
        discard.setAttribute('aria-expanded', 'false')
        setStatus('The result could not be discarded. It is still here to save or try again.')
        log.error('ui', 'result discard failed', {
          reason: cause instanceof Error ? cause.message : String(cause),
        })
      } finally {
        if (resultAuthority.owns(result)) {
          setResultBusy(false)
          discard.focus()
          confirmation.hidden = true
        }
      }
    })()
  })

  processResult.append(resultActions, confirmation)
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
