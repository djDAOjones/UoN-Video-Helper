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
  resetDiagnosticsContext,
  setDiagnosticsContext,
  type CapturedError,
} from './core/diagnostics'
import {
  KeepAwake,
  shouldHoldWakeLock,
  shouldWarnBeforeLeaving,
  warnBeforeLeaving,
} from './core/keep-awake'
import { adoptLogRecords, log, setMinimumLogLevel } from './core/logger'
import { APP_VERSION, BUILD_ID } from './core/version'
import { CLOSING_DEFAULTS, type BrandingMode } from './config/branding'
import type { PresetId } from './config/presets'
import {
  SELECTION_DEADLINE_MS,
  WORKER_ACKNOWLEDGEMENT_LIMIT_MS,
  WORKER_SILENCE_LIMIT_MS,
} from './config/thresholds'
import { createWatchdog } from './core/watchdog'
import { saveFile, suggestedFileName } from './media/save'
import { countCues } from './media/vtt'
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
const sourceReport = required<HTMLDivElement>('#source-report')
const preflightReport = required<HTMLDivElement>('#preflight-report')
const audioWarnings = required<HTMLDivElement>('#audio-warnings')
const processActions = required<HTMLDivElement>('#process-actions')
const processProgress = required<HTMLProgressElement>('#process-progress')
const processProgressLabel = required<HTMLParagraphElement>('#process-progress-label')
const processResult = required<HTMLDivElement>('#process-result')
const presetChoice = required<HTMLFieldSetElement>('#preset-choice')
const brandingChoice = required<HTMLFieldSetElement>('#branding-choice')
const brandingOptions = required<HTMLDetailsElement>('#branding-options')
const brandingStyleChoice = required<HTMLFieldSetElement>('#branding-style-choice')
const subtitleField = required<HTMLDivElement>('#subtitle-field')
const subtitleInput = required<HTMLInputElement>('#subtitle-input')
const subtitleStatus = required<HTMLParagraphElement>('#subtitle-status')

/**
 * Which selection the screen is currently describing.
 *
 * Every asynchronous answer — inspection, pre-flight, a subtitle read — is
 * about the file and preset that were chosen when it was asked for. Nothing
 * checked that on the way back, so whichever finished LAST won: picking file A
 * then file B could leave B on screen with Start pointing at A, and a slow
 * pre-flight for the old preset could arm Start after the user had chosen
 * another (review R-05). Bumped on every change that invalidates an answer in
 * flight; a stale answer is dropped rather than rendered.
 */
let selectionEpoch = 0

/**
 * Worker requests belonging to the current selection, so a superseded one can
 * be stopped rather than merely ignored.
 *
 * VH-60 made a stale ANSWER harmless; it did not make the work stop. Choosing
 * a two-hour file and then another left the first file's whole-audio analysis
 * and its encode probe running to completion, competing for the same cores as
 * the selection the user is actually waiting on (VH-75).
 */
const selectionRequests = new Set<number>()

/**
 * Requests whose promise has already settled but whose worker-side work has
 * not. Resolved by the message handler when the worker finally answers.
 */
const abandoned = new Map<number, () => void>()

/** Reads the current epoch and gives back a test for whether it still holds. */
function beginSelection(): () => boolean {
  // Everything still running belongs to the selection being replaced.
  for (const id of selectionRequests) {
    worker.postMessage({ kind: 'cancel', id: nextRequestId++, cancelId: id })
  }
  selectionRequests.clear()

  const mine = ++selectionEpoch
  return () => mine === selectionEpoch
}

/**
 * Issues a request that belongs to the current selection.
 *
 * Registered while it runs so {@link beginSelection} can cancel it, and
 * deregistered however it settles — a cancelled request must not be cancelled
 * again under a later id.
 */
async function selectionRequest(
  payload: DistributiveOmit<WorkerRequest, 'id'>,
  timeoutMs: number,
): Promise<WorkerOutbound> {
  const { id, promise } = requestWithId(payload, timeoutMs)
  selectionRequests.add(id)
  try {
    return await promise
  } finally {
    selectionRequests.delete(id)
  }
}

/** The chosen sidecar's text, held until the job runs. */
let subtitleVtt: string | null = null

subtitleInput.addEventListener('change', () => {
  const file = subtitleInput.files?.[0]
  const current = beginSelection()
  subtitleVtt = null
  if (!file) {
    subtitleStatus.textContent = ''
    return
  }
  void (async () => {
    try {
      const text = await file.text()
      // A large sidecar read can outlive the choice that started it.
      if (!current()) return
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
  // `none` is a UI value, not a pipeline one: it means "no closing at all",
  // which the pipeline expresses as `closing: false` rather than as a mode
  // (VH-46b). Every other value is a `BrandingMode`.
  mode: ['none', 'hard-cut', 'over-picture', 'over-freeze'],
} as const

/** Modes that play the 1 s animated build, and so make Animation mean something. */
const MODES_USING_THE_BUILD = ['over-picture', 'over-freeze']

/** The chosen mode, or `null` for "no closing sequence". */
function chosenClosingMode(): BrandingMode | null {
  // Widened explicitly: `chosenBranding` infers its return from the fallback,
  // which is a `BrandingMode` literal and cannot represent "none".
  const mode = chosenBranding<BrandingMode | 'none'>('mode', CLOSING_DEFAULTS.mode)
  return mode === 'none' ? null : mode
}

/**
 * Keeps the refinements in step with the choice they refine.
 *
 * Two rules, and both exist so no control is ever offered that cannot change
 * anything (VH-46b). The options disclosure is meaningless without a closing.
 * Animation is meaningless without the build: a clean cut discards it, so Fade
 * and Slide would differ by nothing at all — the exact control `AGENTS.md`
 * singles out as the one never to expose.
 *
 * Hidden rather than disabled. A disabled control still says "there is a
 * decision here you are not allowed to make", and there is not one.
 */
function syncBrandingOptions(): void {
  const mode = chosenClosingMode()
  brandingOptions.hidden = mode === null
  if (mode === null) brandingOptions.open = false
  brandingStyleChoice.hidden = mode === null || !MODES_USING_THE_BUILD.includes(mode)
}

brandingChoice.addEventListener('change', syncBrandingOptions)
syncBrandingOptions()

// Both, in production too. `AGENTS.md` -> "Traceable version identity" wants
// "what release is this?" AND "exactly what code is live?" answerable from a
// running app, and the diagnostics bundle that carries the build id is
// dev-only — so production could answer neither (VH-66). Non-secret: this
// repository is public and the commit is already in the shipped sourcemaps.
versionLine.textContent = isDev ? `${APP_VERSION} · ${BUILD_ID} · development` : BUILD_ID

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
/** Resets the watchdog for a request that is still being answered. */
const keepAlive = new Map<number, () => void>()

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
  bound: number | { readonly idleMs: number } = 5000,
): { id: number; promise: Promise<WorkerOutbound> } {
  const id = nextRequestId++
  const idleMs = typeof bound === 'number' ? null : bound.idleMs
  const limitMs = typeof bound === 'number' ? bound : bound.idleMs

  const promise = new Promise<WorkerOutbound>((resolve, reject) => {
    const watchdog = createWatchdog(limitMs, () => {
      pending.delete(id)
      keepAlive.delete(id)
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

    if (idleMs !== null) keepAlive.set(id, () => watchdog.reset())
    pending.set(id, (message) => {
      watchdog.clear()
      keepAlive.delete(id)
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
    // Progress never resolves the job's request — it reports on one in flight,
    // which is exactly what the watchdog needs to hear.
    keepAlive.get(message.id)?.()
    onStage(message.stage, message.fraction)
    return
  }
  pending.get(message.id)?.(message)
  pending.delete(message.id)
  keepAlive.delete(message.id)
  // An answer to something nobody is waiting for any more still matters: it is
  // how a timed-out job says it has finished winding down (VH-75).
  abandoned.get(message.id)?.()
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
  // Everything already in flight described the previous file.
  const current = beginSelection()

  // Never log the filename — DEV-INFRASTRUCTURE.md -> "Redaction".
  log.info('ui', 'file chosen', { sizeBytes: file.size, type: file.type })
  // A bundle taken now must not describe the file before this one.
  resetDiagnosticsContext('inspecting')
  setStatus('Reading the video…')
  sourceReport.replaceChildren()
  preflightReport.replaceChildren()
  audioWarnings.replaceChildren()
  // Hidden, not replaced: the Start and Cancel buttons live for the whole
  // session now, and emptying this container would throw them away (VH-36).
  processActions.hidden = true
  jobFile = null
  presetChoice.hidden = true
  brandingChoice.hidden = true
  subtitleField.hidden = true
  subtitleInput.value = ''
  subtitleStatus.textContent = ''
  subtitleVtt = null
  // Kept when there is something to lose: the result panel describes a video
  // that already exists, and the source panel describes what was just chosen.
  // Clearing it here removed the only route to a finished file (VH-56).
  if (!unsavedResult) processResult.replaceChildren()

  void (async () => {
    try {
      const reply = await selectionRequest({ kind: 'inspect', file }, SELECTION_DEADLINE_MS.inspect)
      // The commit boundary on this side. A report for a file the picker no
      // longer shows must not reach the screen, whatever order it arrived in.
      if (!current()) return
      if (reply.kind === 'inspected') {
        renderSourceReport(sourceReport, reply.report)
        setStatus(summarise(reply.report))
        setDiagnosticsContext({ stage: 'inspected', source: reply.report })
        // Structure first, then the measurement — the probe really does decode
        // and encode three seconds, so it must not hold up what we already know.
        await runPreflight(file, current)
        return
      }
      if (reply.kind === 'failed') {
        renderSourceError(sourceReport, reply.message)
        setStatus('That file could not be read.')
        setDiagnosticsContext({ stage: 'failed' })
        return
      }
      // Reachable since VH-57 made inspection cancellable. It means this
      // request was abandoned for a newer one, so it says nothing: whatever
      // replaced it owns the screen now.
      if (reply.kind === 'cancelled') return
      throw new Error(`Unexpected reply to inspect: ${reply.kind}`)
    } catch (cause) {
      if (!current()) return
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
/**
 * @param current - Whether the selection this was started for still holds.
 *   Passed in rather than taken here, so a pre-flight that follows an
 *   inspection belongs to the SAME epoch as the inspection did.
 */
async function runPreflight(file: File, current: () => boolean): Promise<void> {
  setStatus('Checking this video against your device…')
  setDiagnosticsContext({ stage: 'preflighting' })

  try {
    const reply = await selectionRequest(
      { kind: 'preflight', file, presetId: chosenPreset() },
      SELECTION_DEADLINE_MS.preflight,
    )
    // A verdict about a file or preset the user has since changed must not
    // reach the screen — and above all must not reveal Start (review R-05).
    if (!current()) return
    if (reply.kind === 'preflighted') {
      renderPreflight(preflightReport, reply.summary)
      renderWarnings(audioWarnings, reply.summary.audioWarnings, {
        heading: 'Worth knowing about the sound',
      })
      setStatus(summarisePreflight(reply.summary))
      setDiagnosticsContext({
        stage: reply.summary.verdict.outcome === 'block' ? 'blocked' : 'ready',
        capability: reply.summary,
      })
      presetChoice.hidden = false
      brandingChoice.hidden = false
      subtitleField.hidden = false
      if (reply.summary.verdict.outcome !== 'block') {
        showProcessControls(file, reply.summary.verdict.outcome === 'discourage')
      }
      return
    }
    if (reply.kind === 'failed') {
      renderSourceError(preflightReport, reply.message)
      return
    }
    // Abandoned for a newer check — see the inspect path (VH-57).
    if (reply.kind === 'cancelled') return
    throw new Error(`Unexpected reply to preflight: ${reply.kind}`)
  } catch (cause) {
    if (!current()) return
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
  if (!file) return
  // The output shape, projected size and estimate all change with the preset,
  // so the verdict must be recomputed rather than left describing the other
  // one — and the one it replaces must not be allowed to land afterwards.
  // Start comes down for the interval, because the verdict that revealed it
  // described a different preset (review R-05).
  const current = beginSelection()
  processActions.hidden = true
  jobFile = null
  void runPreflight(file, current)
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
  // The bar's accessible name tracks the stage, so it announces "Encoding
  // video, 63%" rather than "63%" of nothing in particular (VH-64).
  processProgressLabel.textContent = STAGE_WORDS[stage] ?? stage
  processProgressLabel.hidden = false
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

/** The file the Start button will act on. Set by {@link showProcessControls}. */
let jobFile: File | null = null

/** The running job's request id, so Cancel reaches the right one. */
let jobCancelId: number | null = null

/**
 * A finished result the user has not put anywhere yet.
 *
 * The worker keeps its OPFS scratch alive so the `File` stays readable, and
 * releases it when the next job starts. That made starting again a silent
 * destruction of finished work — one click, no warning, nothing recoverable
 * (VH-56). Holding it here is what lets Start ask first.
 */
interface RetainedResult {
  readonly file: File
  readonly jobId: string
  /** The file this result was made from — the one a save must never write over. */
  readonly source: File
  /**
   * True once a fallback download has been started for it.
   *
   * Not the same as saved. `anchor.click()` returns before the browser has
   * read a byte, and an object URL over an OPFS-backed file reads lazily — so
   * a "delivered" result is one whose bytes may still be being pulled out of
   * the scratch this is holding open.
   */
  readonly delivered: boolean
  readonly applied: { opening: boolean; closing: boolean }
  readonly requested: { opening: boolean; closing: boolean }
  /** Frees whatever the last save attempt still held — see `save.ts`. */
  readonly release: () => void
}

let unsavedResult: RetainedResult | null = null

/**
 * True while a save is streaming out of OPFS.
 *
 * A picker save reads from the job's scratch for as long as it takes, and
 * starting another job disposes exactly that scratch. Nothing stopped the two
 * overlapping, because saving disabled only the Save button.
 */
let saveInFlight = false

// Built ONCE, at module scope, and never replaced. The previous version
// rebuilt both buttons on every preflight — so changing the preset mid-job
// detached the running job's Cancel and handed back a fresh, enabled Start,
// leaving the job uncancellable and a second one launchable (VH-36).
const startButton = document.createElement('button')
startButton.type = 'button'
startButton.className = 'button'
startButton.textContent = 'Create the video'

const cancelButton = document.createElement('button')
cancelButton.type = 'button'
cancelButton.className = 'button button--secondary'
cancelButton.textContent = 'Cancel'
cancelButton.hidden = true

/**
 * Spec 7.3: a discouraged job may continue "after acknowledgement".
 *
 * There was no acknowledgement. Start appeared for every outcome short of a
 * block, so agreement was inferred from the user pressing the button they were
 * being warned about (review R-14). This is the deliberate act that separates
 * "read the warning" from "clicked past it", and it is built once for the same
 * reason Start and Cancel are (VH-36).
 */
const acknowledgeButton = document.createElement('button')
acknowledgeButton.type = 'button'
acknowledgeButton.className = 'button button--secondary'
acknowledgeButton.textContent = 'I understand — carry on anyway'
acknowledgeButton.hidden = true
acknowledgeButton.addEventListener('click', () => {
  acknowledgeButton.hidden = true
  startButton.hidden = false
  startButton.focus()
})

processActions.append(acknowledgeButton, startButton, cancelButton)

/**
 * Spec 7.5: keep the device awake while a job runs, and warn before the page
 * is closed with something to lose.
 *
 * Neither existed (VH-63). A forty-minute encode on a laptop that sleeps is
 * forty minutes gone, and a reload during one — or with an unsaved result on
 * screen — discards it without a word.
 */
const keepAwake = new KeepAwake()
let stopLeaveWarning: (() => void) | null = null

/**
 * Attaches the leave warning only while there is genuinely something to lose.
 *
 * A page that always warns is a page whose warning is ignored, and the browser
 * will not show one at all without a user gesture behind it.
 */
function updateLeaveWarning(): void {
  const atRisk = shouldWarnBeforeLeaving({
    jobInFlight,
    saveInFlight,
    hasUnsavedResult: unsavedResult !== null,
  })
  if (atRisk && !stopLeaveWarning) stopLeaveWarning = warnBeforeLeaving()
  if (!atRisk && stopLeaveWarning) {
    stopLeaveWarning()
    stopLeaveWarning = null
  }
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
  cancelButton.hidden = !running
  cancelButton.disabled = false
  applyControlLock()
  applyKeepAwake()
  updateLeaveWarning()
}

/**
 * Holds the screen wake lock for as long as there is work to lose.
 *
 * A save counts. It streams a whole file out of OPFS, which on a multi-
 * gigabyte result takes long enough for an idle machine to sleep — and VH-63
 * only ever tied the lock to a running JOB, so the one phase that is pure
 * sustained I/O was the one phase it did not cover (VH-75).
 */
function applyKeepAwake(): void {
  const wanted = shouldHoldWakeLock({ jobInFlight, saveInFlight })
  void (wanted ? keepAwake.start() : keepAwake.stop())
}

/**
 * Locks the same controls while a save is streaming.
 *
 * A save is not a job, so Cancel stays hidden — but everything a new job would
 * pull out from under it is held exactly as if one were running.
 */
function setSaveInFlight(saving: boolean): void {
  saveInFlight = saving
  setDiagnosticsContext({ stage: saving ? 'saving' : 'finished' })
  applyControlLock()
  applyKeepAwake()
  updateLeaveWarning()
}

/** Applies whichever of the two locks is active. */
function applyControlLock(): void {
  const locked = jobInFlight || saveInFlight
  fileInput.disabled = locked
  subtitleInput.disabled = locked
  presetChoice.disabled = locked
  brandingChoice.disabled = locked
  startButton.disabled = locked
}

startButton.addEventListener('click', () => {
  const file = jobFile
  if (!file || jobInFlight || saveInFlight) return

  // Starting again disposes the previous result's scratch, and the previous
  // result may be the only copy of an hour's work (VH-56). Ask once; the
  // answer starts the job.
  if (unsavedResult) {
    confirmDiscardThenStart(file)
    return
  }
  beginJob(file)
})

/**
 * Asks before a new job destroys a finished one nobody saved.
 *
 * Inline rather than a modal: the result and the question belong in the same
 * place, and a dialogue that steals focus to say "are you sure" is the pattern
 * `UI-STANDARDS.md` reserves for something irreversible the user did not
 * initiate. VH-32 owns how this looks.
 */
function confirmDiscardThenStart(file: File): void {
  processResult.replaceChildren()

  const question = document.createElement('p')
  question.className = 'verdict-detail'
  question.textContent = unsavedResult?.delivered
    ? 'Your download may still be finishing. Starting again will discard the video you just made.'
    : 'You have not saved the video you just made. Starting again will discard it.'

  const discard = document.createElement('button')
  discard.type = 'button'
  discard.className = 'button'
  discard.textContent = 'Discard it and start again'
  discard.addEventListener('click', () => {
    releaseUnsavedResult()
    beginJob(file)
  })

  const keep = document.createElement('button')
  keep.type = 'button'
  keep.className = 'button button--secondary'
  keep.textContent = 'Keep it'
  keep.addEventListener('click', () => {
    const kept = unsavedResult
    if (kept) renderResult(kept.file, kept.jobId, kept.source, kept.applied, kept.requested)
  })

  const actions = document.createElement('div')
  actions.className = 'actions'
  actions.append(discard, keep)
  processResult.append(question, actions)
  setStatus('Your video is not saved yet.')
  discard.focus()
}

/** Forgets the retained result, freeing whatever the save route still held. */
function releaseUnsavedResult(): void {
  unsavedResult?.release()
  unsavedResult = null
  updateLeaveWarning()
}

function beginJob(file: File): void {
  processResult.replaceChildren()

  const { id, promise } = requestWithId(
    {
      kind: 'process',
      file,
      presetId: chosenPreset(),
      branding: {
        // Always false: VH-33 withdrew the control, and no approved opening
        // asset exists to turn back on. The pipeline's opening path is intact
        // and VH-23 restores the choice when there is something to choose.
        opening: false,
        // `none` is the absence of a closing, not a way of having one, so it
        // becomes `closing: false` and the mode falls back to the default
        // nothing will read (VH-46b).
        closing: chosenClosingMode() !== null,
        style: chosenBranding('style', CLOSING_DEFAULTS.style),
        colour: chosenBranding('colour', CLOSING_DEFAULTS.colour),
        mode: chosenClosingMode() ?? CLOSING_DEFAULTS.mode,
      },
      backgroundColour: brandBackground(),
      ...(subtitleVtt ? { subtitleVtt } : {}),
    },
    // Silence, not duration. A job reports a stage every thirty frames, so a
    // minute without a word means something is genuinely wrong — while an
    // hour of honest work no longer trips anything (VH-38).
    { idleMs: WORKER_SILENCE_LIMIT_MS },
  )
  jobCancelId = id
  setJobInFlight(true)
  // The three choices, and whether a sidecar was supplied — never its text.
  setDiagnosticsContext({
    stage: 'processing',
    job: {
      presetId: chosenPreset(),
      closing: chosenClosingMode(),
      style: chosenBranding('style', CLOSING_DEFAULTS.style),
      colour: chosenBranding('colour', CLOSING_DEFAULTS.colour),
      subtitleSupplied: subtitleVtt !== null,
    },
  })

  void promise
    .then((reply) => {
      if (reply.kind === 'processed') {
        renderResult(reply.file, reply.jobId, file, reply.brandingApplied, reply.brandingRequested)
        renderWarnings(audioWarnings, reply.outputWarnings, {
          heading: 'Worth knowing about the finished video',
        })
        setStatus('Your video is ready.')
        setDiagnosticsContext({ stage: 'finished' })
      } else if (reply.kind === 'cancelled') {
        // Nothing was written anywhere the user can see, and the source is
        // untouched — say so rather than leaving them wondering.
        setStatus('Cancelled. Nothing was saved, and your original file is unchanged.')
        setDiagnosticsContext({ stage: 'idle' })
      } else if (reply.kind === 'failed') {
        renderSourceError(processResult, reply.message)
        setStatus('The video could not be created.')
        setDiagnosticsContext({ stage: 'failed' })
      }
    })
    .catch(async (cause: unknown) => {
      renderSourceError(processResult, 'The job did not finish.')
      setDiagnosticsContext({ stage: 'failed' })
      log.error('ui', 'process request failed', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      // The watchdog posts `cancel` and rejects in the same breath, so this
      // path is reached while the worker is still winding the job down. Start
      // must not re-arm yet: the next `process` begins by disposing every
      // retained workspace, and doing that to a job still finalizing is how a
      // finished file gets deleted out from under its own muxer (VH-75).
      await settled(id)
    })
    .finally(() => {
      jobCancelId = null
      setJobInFlight(false)
      processProgress.hidden = true
      processProgressLabel.hidden = true
    })
}

/**
 * Waits for the worker to answer conclusively about a request we have stopped
 * waiting on.
 *
 * Bounded, because a worker that never answers must not lock the interface out
 * of ever starting another job — the failure this guards against is worse than
 * the one it would create.
 */
function settled(id: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      abandoned.delete(id)
      log.warn('ui', 'worker never acknowledged an abandoned job', { id })
      resolve()
    }, WORKER_ACKNOWLEDGEMENT_LIMIT_MS)
    abandoned.set(id, () => {
      clearTimeout(timer)
      abandoned.delete(id)
      resolve()
    })
  })
}

// Bound once, here, rather than inside the Start handler — where it added
// another listener on every Start click, so the second job posted two cancels
// (VH-36).
cancelButton.addEventListener('click', () => {
  if (jobCancelId === null) return
  cancelButton.disabled = true
  setStatus('Cancelling…')
  worker.postMessage({ kind: 'cancel', id: nextRequestId++, cancelId: jobCancelId })
})

/**
 * Points the Start button at this file and reveals the controls.
 *
 * @param needsAcknowledgement - True for a `discourage` verdict, where spec 7.3
 *   allows continuing only after the user says so. Start is withheld until
 *   they do, and every new selection asks again — an acknowledgement is about
 *   one job, not about the session.
 */
function showProcessControls(file: File, needsAcknowledgement = false): void {
  jobFile = file
  acknowledgeButton.hidden = !needsAcknowledgement
  startButton.hidden = needsAcknowledgement
  processActions.hidden = false
}

function renderResult(
  file: File,
  jobId: string,
  source: File,
  applied: { opening: boolean; closing: boolean },
  requested: { opening: boolean; closing: boolean },
): void {
  processResult.replaceChildren()

  const summary = document.createElement('p')
  summary.className = 'verdict-detail'
  summary.textContent = `Your video is ready — ${formatFileSize(file.size)}.`
  processResult.append(summary)

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

  // Retained until the user has it somewhere. Everything that would destroy it
  // now has to go through `unsavedResult` first (VH-56).
  //
  // Preserved when this is a re-render of the same job — "Keep it" comes back
  // through here, and a fresh record would drop the download's object URL and
  // the worker lease that record is holding.
  unsavedResult =
    unsavedResult?.jobId === jobId
      ? unsavedResult
      : { file, jobId, source, applied, requested, delivered: false, release: () => {} }
  updateLeaveWarning()

  const save = document.createElement('button')
  save.type = 'button'
  save.className = 'button'
  save.textContent = 'Save the video'
  /** Set once the file is out and the scratch has gone; the control is then spent. */
  let saved = false
  save.addEventListener('click', () => {
    if (saved) return
    save.disabled = true
    // Not just this button: a save streams out of the job's OPFS scratch, and
    // starting another job disposes exactly that scratch.
    setSaveInFlight(true)
    // A multi-gigabyte save streams for a while and used to say nothing at
    // all, which is the same silence VH-38 established means "wedged".
    setStatus('Saving…')
    // Declared to the worker as well as locked in the UI: the UI lock is a
    // convention, and a convention is what VH-36 turned out to be.
    worker.postMessage({ kind: 'lease', id: nextRequestId++, jobId, held: true })
    // Cleared by whichever route takes ownership of the lease instead.
    let leaseHeld = true
    void (async () => {
      try {
        const result = await saveFile(file, suggestedFileName(source.name), {
          identity: { name: source.name, size: source.size, lastModified: source.lastModified },
        })
        if (result.outcome === 'cancelled') {
          setStatus('Not saved. The video is still here when you want it.')
          return
        }
        if (result.outcome === 'refused-source') {
          setStatus(
            'That is the file you started with. Choose a different name or folder — this tool never changes your original.',
          )
          return
        }
        if (result.outcome === 'downloaded') {
          // `anchor.click()` returns before the browser has read a byte, and
          // an object URL over an OPFS-backed file reads lazily — so the
          // scratch, the URL and the worker's lease all have to outlive this
          // handler. They are released together when the result is.
          leaseHeld = false
          unsavedResult = {
            file,
            jobId,
            source,
            applied,
            requested,
            delivered: true,
            release: () => {
              result.release()
              worker.postMessage({ kind: 'lease', id: nextRequestId++, jobId, held: false })
            },
          }
          setStatus('Saving to your downloads. The video stays here until you start another one.')
          return
        }
        setStatus('Saved.')
        // Only once it is safely out: the File reads from OPFS, so releasing
        // the workspace first would hand back something unreadable.
        //
        // The lease goes back BEFORE the discard, not in the `finally` after
        // it. `discard` waits on the lease, so releasing it afterwards is a
        // deadlock the request timeout would break ten seconds later.
        unsavedResult = null
        updateLeaveWarning()
        leaseHeld = false
        worker.postMessage({ kind: 'lease', id: nextRequestId++, jobId, held: false })
        // Saving again would read a workspace that no longer exists, so the
        // control stops offering it rather than failing when taken up.
        saved = true
        save.textContent = 'Saved'
        await request({ kind: 'discard', jobId }, 10_000)
      } catch (cause) {
        setStatus('The video could not be saved. It is still here to try again.')
        log.error('ui', 'save failed', {
          reason: cause instanceof Error ? cause.message : String(cause),
        })
      } finally {
        if (leaseHeld) {
          worker.postMessage({ kind: 'lease', id: nextRequestId++, jobId, held: false })
        }
        save.disabled = saved
        setSaveInFlight(false)
      }
    })()
  })
  processResult.append(save)
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
