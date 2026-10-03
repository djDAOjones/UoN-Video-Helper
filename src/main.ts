/**
 * App entry point.
 *
 * Mounts the shell, installs diagnostics before anything else can throw, and
 * runs the system check that proves the skeleton is actually wired: the worker
 * answers, and the browser has the APIs this app cannot work without.
 */

import './styles/app.css'

import {
  buildDiagnosticsBundle,
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
import {
  brandingChoiceFor,
  closingTypeUsesOnset,
  readClosingControls,
  resolveBrandingBase,
  type ClosingControls,
} from './config/branding'
import {
  FEEDBACK_ADDRESS,
  FEEDBACK_LEAVE_WARNING_PAUSE_MS,
  FEEDBACK_MAILTO_MAX_CHARACTERS,
  FEEDBACK_SUBJECT,
  FEEDBACK_WORKER_LOG_WAIT_MS,
} from './config/feedback'
import {
  BOOT_CHECK_SOURCE,
  OUTPUT_SAMPLE_RATE,
  PRESETS,
  outputShapeFor,
  videoEncoderConfigFor,
  type ContentClass,
  type PresetId,
} from './config/presets'
import {
  SELECTION_DEADLINE_MS,
  WORKER_ACKNOWLEDGEMENT_LIMIT_MS,
  WORKER_SILENCE_LIMIT_MS,
} from './config/thresholds'
import { KEPT_MIN_SECONDS, TRIM_RECHECK_DELAY_MS } from './config/trim'
import { createWatchdog } from './core/watchdog'
import { canEncodeAudio, checkEncodeSupport, detectDeviceClass } from './media/capability'
import type { KeptRange } from './media/kept-range'
import { saveFile, suggestedFileName } from './media/save'
import {
  closingResultText,
  colourDisabledReason,
  onsetDisabledReason,
} from './ui/closing-choice'
import { installDropZone } from './ui/drop-zone'
import {
  describeBrowser,
  feedbackDetails,
  feedbackDisclosure,
  feedbackMailto,
  feedbackText,
} from './ui/feedback'
import { formatFileSize } from './ui/format'
import {
  blockContextFor,
  preflightAnnouncement,
  renderPreflight,
  setupStepsResolve,
} from './ui/preflight-panel'
import {
  NO_PROGRESS,
  outcomeTitle,
  progressView,
  readAnnounceProgress,
  writeAnnounceProgress,
  type ProgressMemo,
} from './ui/progress'
import {
  closingOutcomeText,
  jobSummaryText,
  type ClosingOutcome,
  type JobRecord,
} from './ui/result-summary'
import { body, notification } from './ui/notification'
import { downloadDestinationFor, downloadStatusText } from './ui/save-text'
import { renderWarnings } from './ui/warning-text'
import { failureSentence, failureText, startupFailureText, type FailureText } from './ui/failure-text'
import { t } from './i18n'
import { applyStaticText } from './i18n/bind'
import { buildLosses, renderSourceError, renderSourceReport, summarise } from './ui/source-panel'
import type { SourceReport } from './media/inspect'
import { lossesSpoken, spoken, warningsSpoken } from './ui/announce'
import { browserNote, summariseChecks, type CheckState } from './ui/system-check'
import { installBrandAssets } from './ui/brand-assets'
import {
  formatTrimTime,
  trimFieldValue,
  trimHandleText,
  trimKeyTarget,
  trimProblemText,
  trimRangeFor,
  trimSummary,
  type TrimProblem,
} from './ui/trim'
import type { PipelineStage } from './media/pipeline'
import type { WorkerOutbound, WorkerRequest } from './workers/protocol'
import type { FailureCode, FailureReason } from './workers/failure'

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

// The logo and the heading font, where their files exist. First, so the
// header does not change shape after the rest of the page has settled.
log.info('boot', 'brand assets', installBrandAssets(required<HTMLElement>('#brand-header')))

// The static words, from the table (VH-105). English is what the markup
// already says, so this is a no-op until another language is chosen.
applyStaticText(document)

/**
 * A message, or the way to compose one in the page's current language, so a
 * line can be said again after a change of language (VH-105). Every string
 * that outlives the call that set it is stored as the thunk, never as words.
 */
type Text = string | (() => string)
const textOf = (text: Text): string => (typeof text === 'string' ? text : text())

/**
 * How to paint each dynamic region again in the current language, keyed by
 * the container it fills. A region is registered when something is put on it
 * and forgotten when it is cleared, so a repaint for a change of language
 * says exactly what is on screen and nothing that has gone.
 */
const regions = new Map<HTMLElement, () => void>()

/** Paints `container` now and remembers how, for a repaint. */
function show(container: HTMLElement, paint: () => void): void {
  regions.set(container, paint)
  paint()
}

/** Empties `container` and forgets how it was painted. */
function clear(container: HTMLElement): void {
  regions.delete(container)
  container.replaceChildren()
}

const checksList = required<HTMLUListElement>('#checks')
const systemCheck = required<HTMLDetailsElement>('#system-check')
const systemCheckSummary = required<HTMLElement>('#system-check-summary')
const browserNoteLine = required<HTMLParagraphElement>('#browser-note')
const statusLine = required<HTMLParagraphElement>('#status')
const sourceStatusLine = required<HTMLParagraphElement>('#source-status')
/** Steps 2 to 4, which are not on the page until a video has been read. */
const laterSteps = ['#step-trim', '#step-closing', '#step-preset', '#step-create'].map((selector) =>
  required<HTMLElement>(selector),
)
const versionLine = required<HTMLParagraphElement>('#version-line')
const errorsPanel = required<HTMLElement>('#errors-panel')
const errorsContainer = required<HTMLDivElement>('#errors')
const errorsIntro = required<HTMLParagraphElement>('#errors-intro')
show(errorsIntro, () => {
  errorsIntro.textContent = t().failure.captured
})
const stopActions = required<HTMLDivElement>('#stop-actions')
const devActions = required<HTMLDivElement>('#dev-actions')
const fileInput = required<HTMLInputElement>('#file-input')
const dropZone = required<HTMLDivElement>('#drop-zone')
const dropHint = required<HTMLParagraphElement>('#drop-hint')
const dropError = required<HTMLParagraphElement>('#drop-error')
const sourceReport = required<HTMLDivElement>('#source-report')
const sourceBlock = required<HTMLDivElement>('#source-block')
const preflightReport = required<HTMLDivElement>('#preflight-report')
const audioWarnings = required<HTMLDivElement>('#audio-warnings')
const processActions = required<HTMLDivElement>('#process-actions')
const processProgress = required<HTMLProgressElement>('#process-progress')
const processProgressLabel = required<HTMLParagraphElement>('#process-progress-label')
const processProgressText = required<HTMLParagraphElement>('#process-progress-text')
const jobNotice = required<HTMLParagraphElement>('#job-notice')
const createNote = required<HTMLParagraphElement>('#create-note')
const announceField = required<HTMLDivElement>('#announce-field')
const announceProgressBox = required<HTMLInputElement>('#announce-progress')
const processResult = required<HTMLDivElement>('#process-result')
const presetChoice = required<HTMLFieldSetElement>('#preset-choice')
const brandingChoice = required<HTMLFieldSetElement>('#branding-choice')
const closingType = required<HTMLSelectElement>('#closing-type')
const closingOnset = required<HTMLSelectElement>('#closing-onset')
const closingOnsetReason = required<HTMLParagraphElement>('#closing-onset-reason')
const closingColour = required<HTMLFieldSetElement>('#closing-colour')
const closingColourReason = required<HTMLParagraphElement>('#closing-colour-reason')
const closingResult = required<HTMLParagraphElement>('#closing-result')
const onsetHelpButton = required<HTMLButtonElement>('#onset-help-button')
const onsetHelp = required<HTMLDivElement>('#onset-help')
const trimPreview = required<HTMLVideoElement>('#trim-preview')
const trimPreviewNote = required<HTMLParagraphElement>('#trim-preview-note')
const trimTrack = required<HTMLDivElement>('#trim-track')
const trimStartRange = required<HTMLInputElement>('#trim-start-range')
const trimEndRange = required<HTMLInputElement>('#trim-end-range')
const trimStartField = required<HTMLInputElement>('#trim-start')
const trimEndField = required<HTMLInputElement>('#trim-end')
const trimSetStart = required<HTMLButtonElement>('#trim-set-start')
const trimSetEnd = required<HTMLButtonElement>('#trim-set-end')
const trimStartError = required<HTMLParagraphElement>('#trim-start-error')
const trimEndError = required<HTMLParagraphElement>('#trim-end-error')
const trimResult = required<HTMLParagraphElement>('#trim-result')
const trimClear = required<HTMLButtonElement>('#trim-clear')

/**
 * One line under each step whose controls a running job or save has locked,
 * saying so (VH-112, U-21): a control that cannot change anything says why,
 * in visible text (VH-90's rule).
 */
const lockNotes = ['#step-choose', '#step-trim', '#step-closing', '#step-preset'].map((selector) => {
  const step = required<HTMLElement>(selector)
  const note = document.createElement('p')
  note.className = 'lock-note'
  note.hidden = true
  step.querySelector('h2')?.after(note)
  return note
})

/**
 * Which selection the screen is currently describing.
 *
 * Every asynchronous answer — inspection, pre-flight — is about the file and
 * preset that were chosen when it was asked for. Nothing
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
 * What the three closing controls currently hold.
 *
 * Read through `readClosingControls`, which trusts a value only if it is one
 * the config knows: the DOM is editable, and an unrecognised value would
 * otherwise reach the pipeline as a string that matches no branch.
 */
function chosenClosing(): ClosingControls {
  return readClosingControls({
    type: closingType.value,
    onset: closingOnset.value,
    colour: closingColour.querySelector<HTMLInputElement>('input[name="closing-colour"]:checked')
      ?.value,
  })
}

/**
 * Keeps the three controls in step with each other, and says what they add up
 * to.
 *
 * A control that cannot change anything is disabled rather than hidden
 * (VH-90, reversing VH-46b at the maintainer's word), and a disabled control
 * cannot explain itself — so the reason is visible text beside it. The line
 * beneath states the result of the whole selection.
 */
function syncClosingControls(): void {
  const controls = chosenClosing()

  const onsetReason = onsetDisabledReason(controls.type)
  closingOnset.disabled = onsetReason !== null
  closingOnsetReason.textContent = onsetReason ?? ''
  closingOnsetReason.hidden = onsetReason === null

  const colourReason = colourDisabledReason(controls.type)
  closingColour.disabled = colourReason !== null
  closingColourReason.textContent = colourReason ?? ''
  closingColourReason.hidden = colourReason === null

  closingResult.textContent = closingResultText(controls)
}

brandingChoice.addEventListener('change', () => {
  syncClosingControls()
  // Not a new verdict — the closing is not pre-flight's business — but the
  // question beneath, if one is showing, was asked about another selection.
  withdrawDiscardQuestion()
})
syncClosingControls()

/**
 * The "?" beside "Animation onset": a toggletip.
 *
 * A button that discloses text, so it works by click, Enter and Space and
 * never by hover alone. Focus stays on the button; Escape or a click anywhere
 * else closes it. The text sits in the page flow rather than floating, so it
 * can never cover the control it explains or the focus ring beside it.
 */
function setOnsetHelp(open: boolean): void {
  onsetHelp.hidden = !open
  onsetHelpButton.setAttribute('aria-expanded', String(open))
}

onsetHelpButton.addEventListener('click', () =>
  setOnsetHelp(onsetHelpButton.getAttribute('aria-expanded') !== 'true'),
)

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !onsetHelp.hidden) setOnsetHelp(false)
})

document.addEventListener('click', (event) => {
  if (onsetHelp.hidden || !(event.target instanceof Node)) return
  if (onsetHelpButton.contains(event.target) || onsetHelp.contains(event.target)) return
  setOnsetHelp(false)
})

// Both, in production too. `AGENTS.md` -> "Traceable version identity" wants
// "what release is this?" AND "exactly what code is live?" answerable from a
// running app, and the diagnostics bundle that carries the build id is
// dev-only — so production could answer neither (VH-66). Non-secret: this
// repository is public and the commit is already in the shipped sourcemaps.
versionLine.textContent = isDev ? `${APP_VERSION} · ${BUILD_ID} · development` : BUILD_ID

// --- System check rendering ------------------------------------------------

/** The rows of the System check, named so each label is the table's. */
type CheckId = keyof ReturnType<typeof t>['systemCheck']['rows']

/** What each row says, kept so a change of language can say it again. */
const checkRows = new Map<CheckId, { readonly state: CheckState; readonly value: Text }>()

function renderCheck(id: CheckId, state: CheckState, value: Text): void {
  checkRows.set(id, { state, value })
  paintCheck(id)
  updateSystemCheckSummary()
}

/** Writes one row as it stands, in the current language. The word marks carry the state, never colour alone. */
function paintCheck(id: CheckId): void {
  const entry = checkRows.get(id)
  if (!entry) return
  let row = document.querySelector<HTMLLIElement>(`#check-${id}`)
  if (!row) {
    row = document.createElement('li')
    row.id = `check-${id}`
    row.className = 'check'
    row.innerHTML =
      '<span class="mark" aria-hidden="true"></span><span></span><span class="value"></span>'
    checksList.append(row)
  }
  row.dataset['state'] = entry.state
  const [mark, name, result] = row.children
  if (mark) mark.textContent = t().systemCheck.marks[entry.state]
  if (name) name.textContent = t().systemCheck.rows[id]
  if (result) result.textContent = textOf(entry.value)
}

/** Failures already shown, so the panel opens for a new one and not again. */
let problemsShown = 0

/**
 * Restates the panel's result in its summary line, and opens it on a failure.
 *
 * The panel starts closed, so the summary is all most people see of it. It
 * is only ever opened here, never shut: someone who opened it to look should
 * not have it close under them when the last check lands. And it is opened
 * once per failure, not on every update while one stands — otherwise a user
 * who closes it has it thrown open again by the next row to land.
 */
function updateSystemCheckSummary(): void {
  const states = [...checksList.querySelectorAll<HTMLLIElement>('.check')].map(
    (row) => row.dataset['state'] as CheckState,
  )
  const { result, problems } = summariseChecks(states)
  systemCheckSummary.textContent = t().systemCheck.summary({ result })
  // The intro's browser sentence reports the same result, in the one place a
  // user reads before choosing anything. Not a live region: it settles within
  // the first second, long before a screen reader reaches it.
  browserNoteLine.textContent = browserNote(states)
  if (problems > problemsShown) systemCheck.open = true
  problemsShown = problems
}

/**
 * Says what is happening to the JOB — the device check, a stage, a save.
 *
 * The Create step's status line. It is not on the page until a video has been read, so
 * anything about the FILE goes through {@link setSourceStatus} instead: a live
 * region inside a hidden section is neither seen nor announced.
 */
function setStatus(message: Text, spokenOnly: Text = ''): void {
  show(statusLine, () => paintStatus(statusLine, message, spokenOnly))
}

/**
 * Says what is happening to the FILE, beside the input that chose it, with
 * the same spoken-only tail as {@link setStatus}: what the panel below shows
 * — the losses — is said by the live region too (VH-111).
 */
function setSourceStatus(message: Text, spokenOnly: Text = ''): void {
  show(sourceStatusLine, () => paintStatus(sourceStatusLine, message, spokenOnly))
}

/** Writes a status line: the shown words, then the spoken-only tail. */
function paintStatus(line: HTMLParagraphElement, message: Text, spokenOnly: Text): void {
  line.textContent = textOf(message)
  // For a message whose detail is already on screen beside it: the live region
  // still has to say it, and must not print it a second time.
  const said = textOf(spokenOnly)
  if (said) {
    const spoken = document.createElement('span')
    spoken.className = 'visually-hidden'
    spoken.textContent = ` ${said}`
    line.append(spoken)
  }
}

/**
 * Notes, BEFORE a transition, whether focus is on a control it will take
 * away; the returned hand-on then moves focus to `target` only if it was
 * (VH-111, A-07). Focus is never moved from where a user has gone to read,
 * nor out of the feedback dialogue — and "on the page body" is not taken as
 * displaced, because it is also where focus sits while someone reads.
 */
function focusHeldBy(
  controls: readonly HTMLElement[],
  heldEarlier = false,
): (target: HTMLElement) => void {
  const active = document.activeElement
  const held =
    heldEarlier ||
    (active instanceof HTMLElement &&
      controls.some((control) => control === active || control.contains(active)))
  return (target) => {
    if (!held || feedbackDialog.open) return
    // Still lost: on the page body, or on one of the controls. Anywhere else
    // means the user moved it themselves in the meantime, and it stays.
    const now = document.activeElement
    const stillLost =
      now === null ||
      now === document.body ||
      controls.some((control) => control === now || control.contains(now))
    if (stillLost) target.focus()
  }
}

/**
 * Puts steps 2 to 5 on the page, or takes them off it.
 *
 * They hold nothing a new file invalidates that is not reset for it — the
 * trim goes back to the whole video, two choices keep their safe defaults,
 * and the Create step's verdict and Start are cleared and re-earned per file
 * — so hiding them again for each new file only made the page jump. They
 * are withdrawn for one thing: a file the device check has blocked, which
 * steps 2 to 4 must not invite work on (U-05). It moves no focus: the user
 * is still on the file input they just used.
 */
function revealLaterSteps(
  shown: { readonly setup: boolean; readonly create: boolean } = { setup: true, create: true },
): void {
  const [trim, closing, preset, create] = laterSteps
  for (const step of [trim, closing, preset]) step!.hidden = !shown.setup
  create!.hidden = !shown.create
}

/**
 * Takes a verdict off the screen that no longer describes the selection.
 *
 * "Ready to go", and the sound notes under it, stayed up while the trim was
 * in error, after the preset changed, after the job and after a failure
 * (U-04). A verdict is about one file, one trim and one preset; when any of
 * those moves, or the job it priced has run, it is withdrawn here and the
 * step leads with what is true now — the re-check, or the outcome.
 */
function withdrawVerdict(): void {
  clear(preflightReport)
  clear(audioWarnings)
}

/**
 * The page's sentences for a worker's `failed` reply (VH-110). The worker's
 * own sentence is kept where it has one — an unreadable file, a trim that
 * cannot be honoured — and anything else it sent is a development-only
 * reason, which rides along after the next step.
 */
function failureFor(reply: { readonly code: FailureCode; readonly message: string }): FailureText {
  const carries = reply.code === 'unreadable-source' || reply.code === 'bad-trim'
  const text = failureText(reply.code, carries && reply.message ? reply.message : undefined)
  return carries || !reply.message ? text : { ...text, next: `${text.next} ${reply.message}` }
}

// --- Error surfacing -------------------------------------------------------

function showError(error: CapturedError): void {
  errorsPanel.hidden = false
  const item = notification({
    kind: 'error',
    title: `${error.origin} on the ${error.thread} thread`,
    lines: [error.message],
  })
  if (error.stack) {
    const stack = document.createElement('pre')
    stack.textContent = error.stack
    item.append(stack)
  }
  errorsContainer.append(item)
}

onUncaughtError(showError)

// --- Capability checks -----------------------------------------------------

// Each value a line a person reads as a line, so it starts with a capital (VH-124).
const checkValue = (key: keyof ReturnType<typeof t>['systemCheck']['values']) => (): string => {
  const value = t().systemCheck.values[key]
  return typeof value === 'string' ? value : ''
}
for (const id of ['secure', 'webcodecs', 'h264', 'aac', 'opfs', 'worker'] as const) {
  renderCheck(id, 'pending', checkValue('checking'))
}

renderCheck(
  'secure',
  window.isSecureContext ? 'pass' : 'fail',
  checkValue(window.isSecureContext ? 'available' : 'notAvailable'),
)

const hasWebCodecs =
  typeof globalThis.VideoEncoder !== 'undefined' && typeof globalThis.VideoDecoder !== 'undefined'
renderCheck(
  'webcodecs',
  hasWebCodecs ? 'pass' : 'fail',
  checkValue(hasWebCodecs ? 'supported' : 'notSupported'),
)

const hasOpfs = typeof navigator.storage?.getDirectory === 'function'
renderCheck('opfs', hasOpfs ? 'pass' : 'fail', checkValue(hasOpfs ? 'available' : 'notAvailable'))

/**
 * Asks the browser, before any file is chosen, whether it can make the output
 * every job needs (spec §7.2, §10: the support check runs at load and again
 * against the chosen file). WebCodecs being present is not the same thing:
 * Firefox has every class and refuses AAC at every bitrate (VH-49), and a
 * browser can carry a decoder and no H.264 encoder. The H.264 answer is a
 * failure, since nothing can be made without it; the AAC answer is a warning,
 * since a silent video still runs (VH-49), and the browser sentence treats
 * both as not passed.
 */
async function checkBootEncodeSupport(): Promise<{ h264: boolean; aac: boolean }> {
  if (!hasWebCodecs) {
    renderCheck('h264', 'fail', checkValue('notSupported'))
    renderCheck('aac', 'fail', checkValue('notSupported'))
    return { h264: false, aac: false }
  }
  const best = PRESETS.best
  const shape = outputShapeFor(best, BOOT_CHECK_SOURCE)
  const [video, stereo, mono] = await Promise.all([
    checkEncodeSupport(videoEncoderConfigFor(shape)),
    canEncodeAudio({
      codec: 'mp4a.40.2',
      sampleRate: OUTPUT_SAMPLE_RATE,
      numberOfChannels: 2,
      bitrate: best.audioBitrateStereoBps,
    }),
    canEncodeAudio({
      codec: 'mp4a.40.2',
      sampleRate: OUTPUT_SAMPLE_RATE,
      numberOfChannels: 1,
      bitrate: best.audioBitrateMonoBps,
    }),
  ])
  const aac = stereo && mono
  renderCheck(
    'h264',
    video.supported ? 'pass' : 'fail',
    checkValue(video.supported ? 'supported' : 'notSupported'),
  )
  renderCheck('aac', aac ? 'pass' : 'warn', checkValue(aac ? 'supported' : 'aacNotSupported'))
  return { h264: video.supported, aac }
}

const bootEncodeSupport = checkBootEncodeSupport()

/**
 * Phone or computer, decided here and handed to every device check: the
 * worker has no `matchMedia`, so left to decide for itself it called an
 * iPhone a desktop and skipped the mobile warning (VH-113, U-16).
 */
const deviceClass = detectDeviceClass()
log.info('boot', 'device class', { deviceClass })

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
        idleMs === null
          ? new Error(`Worker did not answer "${payload.kind}" within ${limitMs} ms`)
          : new WorkerSilenceError(`Worker went quiet for ${limitMs} ms during "${payload.kind}"`),
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

/** A request that went quiet for longer than its silence bound (VH-38), named so the page can say so (VH-110). */
class WorkerSilenceError extends Error {
  override readonly name = 'WorkerSilenceError'
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
    // A report from a job that has already ended — cancelled, failed — must
    // not put a stage back over the outcome.
    if (jobInFlight) onStage(message.stage, message.fraction)
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
  renderCheck('worker', 'fail', checkValue('failedToStart'))
})

async function checkWorker(): Promise<void> {
  const startedAt = performance.now()
  const reply = await request({ kind: 'ping' })
  if (reply.kind !== 'pong') throw new Error(`Unexpected reply to ping: ${reply.kind}`)
  const roundTripMs = Math.round(performance.now() - startedAt)
  workerReady = true
  renderCheck('worker', 'pass', () => t().systemCheck.values.readyIn({ ms: roundTripMs }))
  log.info('boot', 'worker round-trip complete', { roundTripMs, workerBootMs: reply.workerBootMs })
}

/**
 * Says a start-up block at Choose, in words, and takes the file input out of
 * reach (VH-110, U-06). "The system check below says what" sent a novice to a
 * row reading "WebCodecs: not supported"; the sentence now names what the
 * tool cannot do here and the remedy that fits, and choosing a file the tool
 * cannot process is not offered. The system check keeps the detail.
 */
/**
 * Where the start-up check has got to. The picker and the drop stay shut
 * until it settles: a file chosen before then could have its reading
 * overwritten by the verdict, or its own failure overwrite a block (Codex
 * review). It settles within the first second.
 */
let startup: 'pending' | 'ready' | 'blocked' = 'pending'
fileInput.disabled = true

function settleStartup(workerStarted: boolean, h264: boolean): void {
  const blocked = startupFailureText(
    {
      secureContext: window.isSecureContext,
      webCodecs: hasWebCodecs,
      h264,
      workingStore: hasOpfs,
      workerStarted,
    },
    blockContextFor(navigator.userAgent),
  )
  startup = blocked === null ? 'ready' : 'blocked'
  applyControlLock()
  // No resting line: the heading and the one filled button already say
  // what to do (VH-124). A block is said here, under the control it shuts —
  // composed again, from the same flags, after a change of language.
  setSourceStatus(
    blocked === null
      ? ''
      : () =>
          startupFailureText(
            {
              secureContext: window.isSecureContext,
              webCodecs: hasWebCodecs,
              h264,
              workingStore: hasOpfs,
              workerStarted,
            },
            blockContextFor(navigator.userAgent),
          ) ?? '',
  )
}

void Promise.all([checkWorker(), bootEncodeSupport])
  .then(([, encode]) => settleStartup(true, encode.h264))
  .catch(async (cause: unknown) => {
    renderCheck('worker', 'fail', checkValue('noResponse'))
    // The encode check answers on its own, whatever became of the worker.
    settleStartup(false, (await bootEncodeSupport.catch(() => ({ h264: false }))).h264)
    recordUncaught({
      ts: Date.now(),
      message: cause instanceof Error ? cause.message : String(cause),
      ...(cause instanceof Error && cause.stack ? { stack: cause.stack } : {}),
      origin: 'error',
      thread: 'main',
    })
  })

// --- File selection ---

/**
 * The file whose inspection has succeeded, or `null` while none has.
 *
 * Steps 2 to 4 stay on the page between files (VH-91), so the preset can now
 * be changed while a NEW file is still being read. A pre-flight started then
 * would cancel that read and run against a file with no report on screen. The
 * read's own continuation runs pre-flight when it lands, with whatever preset
 * is chosen by then — so a change made before that has nothing to do.
 */
let inspectedFile: File | null = null
/** Its report, so step 1's line can be restored once a block clears (VH-124). */
let inspectedReport: SourceReport | null = null

// A dropped video arrives as a `change` on the picker, so everything below
// reads it exactly as a chosen one (VH-101). Busy is read at the drop: the
// lock below is what keeps the picker from starting a second video too.
installDropZone({
  zone: dropZone,
  input: fileInput,
  hint: dropHint,
  message: dropError,
  busy: () =>
    startup === 'pending'
      ? 'starting'
      : startup === 'blocked'
        ? 'unavailable'
        : jobInFlight
          ? 'making'
          : saveInFlight
            ? 'saving'
            : null,
})

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0]
  if (!file) return
  // Everything already in flight described the previous file.
  const current = beginSelection()

  // Never log the filename — DEV-INFRASTRUCTURE.md -> "Redaction".
  log.info('ui', 'file chosen', { sizeBytes: file.size, type: file.type })
  // Choosing was the one thing to do; now it is one thing among the steps,
  // and the picker's button steps down from primary (VH-124, Codex critique).
  fileInput.classList.add('file-input--chosen')
  // A bundle taken now must not describe the file before this one.
  resetDiagnosticsContext('inspecting')
  setSourceStatus(() => t().choose.reading)
  // Whatever the Create step last said was about the previous file's job.
  setStatus('')
  offerStop(null)
  syncCreateEmphasis()
  setTitle('none')
  clear(sourceReport)
  clear(sourceBlock)
  withdrawVerdict()
  // Hidden, not replaced: the Start and Cancel buttons live for the whole
  // session now, and emptying this container would throw them away (VH-36).
  processActions.hidden = true
  createNote.hidden = true
  jobFile = null
  jobContentClass = 'unknown'
  jobKeptRange = null
  inspectedFile = null
  inspectedReport = null
  // The trim described the previous video. Nothing of it is kept, and a
  // re-check still waiting to run for it must not (Codex review).
  cancelTrimRecheck()
  clearTrim('reading')
  // Kept when there is something to lose: the result panel describes a video
  // that already exists, and the source panel describes what was just chosen.
  // Clearing it here removed the only route to a finished file (VH-56).
  //
  // Re-rendered rather than merely kept, because what is on screen may be the
  // "starting again will discard it" question — and that question's Discard
  // button is bound to the file that was current when it was asked. Leaving it
  // there after the picker has moved on offers to process the file the user
  // just replaced (VH-79). Re-rendering restores the result the question
  // interrupted, which is also the only route back to saving it.
  if (unsavedResult) {
    renderResult(unsavedResult)
  } else {
    clear(processResult)
  }

  void (async () => {
    try {
      const reply = await selectionRequest({ kind: 'inspect', file }, SELECTION_DEADLINE_MS.inspect)
      // The commit boundary on this side. A report for a file the picker no
      // longer shows must not reach the screen, whatever order it arrived in.
      if (!current()) return
      if (reply.kind === 'inspected') {
        const { report } = reply
        // Painted again for a change of language with its disclosure as the
        // user left it, open or shut (VH-105).
        show(sourceReport, () => {
          const open = sourceReport.querySelector('details')?.open ?? false
          renderSourceReport(sourceReport, report, { open })
        })
        // The losses panel is on screen beside this; the live region says it
        // too, caption consequence included (U-10, A-14).
        setSourceStatus(
          () => summarise(report),
          () => lossesSpoken(buildLosses(report)),
        )
        inspectedFile = file
        inspectedReport = reply.report
        resetTrim(file, reply.report.durationSeconds)
        revealLaterSteps()
        setDiagnosticsContext({ stage: 'inspected', source: reply.report })
        // Structure first, then the measurement — the probe really does decode
        // and encode three seconds, so it must not hold up what we already know.
        await runPreflight(file, current)
        return
      }
      if (reply.kind === 'failed') {
        const failure = failureFor(reply)
        showFailure(sourceReport, failure)
        // The failure box beside this says it; the line only speaks it (VH-124).
        setSourceStatus('', () => failureSentence(failureWords(failure)))
        clearTrim('unreadable')
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
      const failure: Failure = { code: 'unreadable-source', reason: 'took-too-long' }
      showFailure(sourceReport, failure)
      setSourceStatus('', () => failureSentence(failureWords(failure)))
      clearTrim('unreadable')
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
  // A trim that cannot be used has nothing to check; its error is beside the
  // fields, and Start stays down until it is put right.
  const trim = currentTrim()
  if ('problem' in trim) {
    offerStop(null)
    setStatus(() => t().trim.correctToContinue)
    return
  }
  const keptRange = trim.range
  // A failed check's box, or a stale verdict, must not sit above "Checking…"
  // (VH-124, pre-work defect 3).
  withdrawVerdict()
  setStatus(() => t().status.checking)
  offerStop('check')
  setDiagnosticsContext({ stage: 'preflighting' })

  try {
    const reply = await selectionRequest(
      { kind: 'preflight', file, presetId: chosenPreset(), deviceClass, ...(keptRange ? { keptRange } : {}) },
      SELECTION_DEADLINE_MS.preflight,
    )
    // A verdict about a file or preset the user has since changed must not
    // reach the screen — and above all must not reveal Start (review R-05).
    if (!current()) return
    const fromStop = focusHeldBy([stopCheckButton])
    // Settled: whatever replaces the stop is said below. Only a check that
    // did not finish offers itself again.
    offerStop(reply.kind === 'failed' && reply.code === 'check-failed' ? 'check-again' : null)
    if (reply.kind === 'preflighted') {
      // What the verdict no longer lists (VH-89): the setting, the output
      // shape and the measured speed are the tool's decisions, not the
      // user's, and this is where they stay legible. No filename, no title —
      // `DEV-INFRASTRUCTURE.md` -> "Redaction".
      log.info('ui', 'preflight verdict', {
        outcome: reply.summary.verdict.outcome,
        reasons: reply.summary.verdict.reasons.map((reason) => reason.code),
        presetId: reply.summary.presetId,
        contentClass: reply.summary.contentClass,
        bitrateBasis: reply.summary.shape.bitrateBasis,
        width: reply.summary.shape.width,
        height: reply.summary.shape.height,
        frameRate: reply.summary.shape.frameRate,
        projectedOutputBytes: reply.summary.projectedOutputBytes,
        probeMeasured: reply.summary.probe.measured,
        videoFramesPerSecond: Math.round(reply.summary.probe.videoFramesPerSecond),
        estimatedSeconds: reply.summary.probe.estimatedSeconds,
      })
      const context = blockContextFor(navigator.userAgent, keptRange !== null)
      const { summary } = reply
      setDiagnosticsContext({
        stage: summary.verdict.outcome === 'block' ? 'blocked' : 'ready',
        capability: summary,
      })
      if (summary.verdict.outcome === 'block') {
        // Said at step 1, beside the file, and steps 2 to 5 withdrawn: a
        // file that cannot be made must not be offered a trim and a closing
        // first (U-05). No sound notes either — "none of these stop you
        // continuing" under a block was the contradiction U-05 found.
        show(sourceBlock, () => renderPreflight(sourceBlock, summary, context))
        withdrawVerdict()
        setStatus('')
        // Two exceptions to withdrawing the steps (Codex review of VH-108).
        // Too little storage is a block the setup steps can resolve — a
        // shorter keep or the smaller output needs less — so they stay, and
        // the re-check they trigger lands here again. And step 5 holds the
        // previous video's Save while one is unsaved: hiding it hid the only
        // way to that file.
        const recoverable = setupStepsResolve(summary.verdict)
        revealLaterSteps({ setup: recoverable, create: recoverable || unsavedResult !== null })
        // The block panel says it; the line only speaks it (pre-work defect 1).
        setSourceStatus('', () => preflightAnnouncement(summary, context).spokenOnly)
        if (recoverable) {
          // Too little storage: the way out is above, and step 5 says so
          // rather than standing empty, with a Check again for the "free
          // some space" route that changes nothing on the page (Codex
          // critique).
          setStatus(() => t().status.storageWayOut({ smaller: t().preset.labels.smaller }))
          offerStop('check-again')
        }
        // Stop the check has gone; the block is said beside the file.
        fromStop(fileInput)
        return
      }
      // A storage block the trim or the preset has just cleared: step 1's
      // line goes back to the read summary it carried before the block, and
      // says so once (pre-work defect 2).
      if (sourceBlock.childElementCount > 0 && inspectedReport) {
        const restored = inspectedReport
        setSourceStatus(() => summarise(restored))
      }
      clear(sourceBlock)
      revealLaterSteps()
      show(preflightReport, () => renderPreflight(preflightReport, summary, context))
      show(audioWarnings, () =>
        renderWarnings(audioWarnings, summary.audioWarnings, { heading: t().warnings.soundHeading }),
      )
      setStatus(
        () => preflightAnnouncement(summary, context).shown,
        () =>
          spoken(
            preflightAnnouncement(summary, context).spokenOnly,
            warningsSpoken(t().warnings.soundHeading, summary.audioWarnings),
          ),
      )
      showProcessControls(file, summary.contentClass, keptRange, summary.verdict.outcome === 'discourage')
      // Stop the check has gone; what it was holding up takes focus.
      fromStop(acknowledgeButton.hidden ? startButton : acknowledgeButton)
      return
    }
    if (reply.kind === 'failed') {
      const failure = failureFor(reply)
      showFailure(preflightReport, failure)
      // The status line sits beside this now (VH-88), and left alone it went
      // on saying "Checking this video against your device…" under an error.
      // The box says what; the line speaks it (VH-124).
      setStatus('', () => failureSentence(failureWords(failure)))
      fromStop(checkAgainButton.hidden ? fileInput : checkAgainButton)
      return
    }
    // Abandoned for a newer check — see the inspect path (VH-57).
    if (reply.kind === 'cancelled') return
    throw new Error(`Unexpected reply to preflight: ${reply.kind}`)
  } catch (cause) {
    if (!current()) return
    const fromStop = focusHeldBy([stopCheckButton])
    offerStop('check-again')
    const failure: Failure = { code: 'check-failed' }
    showFailure(preflightReport, failure)
    setStatus('', () => failureSentence(failureWords(failure)))
    fromStop(checkAgainButton)
    log.error('ui', 'preflight request failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
  }
}

presetChoice.addEventListener('change', () => {
  const file = fileInput.files?.[0]
  // Nothing to re-check until this file has been read: see `inspectedFile`.
  if (!file || file !== inspectedFile) return
  // The output shape, projected size and estimate all change with the preset,
  // so the verdict must be recomputed rather than left describing the other
  // one — and the one it replaces must not be allowed to land afterwards.
  // Start comes down for the interval, because the verdict that revealed it
  // described a different preset (review R-05).
  const current = beginSelection()
  cancelTrimRecheck()
  processActions.hidden = true
  createNote.hidden = true
  jobFile = null
  jobContentClass = 'unknown'
  jobKeptRange = null
  withdrawDiscardQuestion()
  // The verdict priced the other preset (U-04).
  withdrawVerdict()
  void runPreflight(file, current)
})

// --- Trim (VH-96) ----------------------------------------------------------
// The one cut: unwanted material off the start and the end, over the engine
// VH-95 built. Left alone it keeps the whole video and sends no range.

/** How long the chosen video is, on the demuxer's clock — the clock the job cuts on. */
let trimDuration = 0
/** The trim as the user has set it, in source seconds; checked, not trusted. */
let trimStart = 0
let trimEnd = 0
/**
 * Each time field whose text could not be read, with what to say about it.
 *
 * One per field, not one for the step: a bad start time used to be forgotten
 * — and the field silently rewritten to 0:00.0 — the moment a valid end time
 * was typed, which re-enabled Create on a start the user never chose (U-17).
 * A field keeps its own text and its own error until that field is put right.
 */
const trimFieldProblems = new Map<HTMLInputElement, TrimProblem>()
/** The preview's object URL, revoked when the file changes. */
let previewUrl: string | null = null
let trimRecheck: ReturnType<typeof setTimeout> | null = null
/**
 * Why the step has no video to trim — one is being read, or it could not be
 * — said in place of times that belong to another video, in whatever
 * language the page is in when it is painted. `null` once a video is ready.
 */
let trimNotice: 'reading' | 'unreadable' | null = null

/** Stops a device check that is waiting to run for a trim that no longer applies. */
function cancelTrimRecheck(): void {
  if (trimRecheck !== null) clearTimeout(trimRecheck)
  trimRecheck = null
}

/** The range to send, `null` for the whole video, or why the trim cannot be used. */
function currentTrim(): { readonly range: KeptRange | null } | { readonly problem: TrimProblem } {
  if (trimNotice !== null) return { range: null }
  // The start's problem first, in reading order.
  for (const field of [trimStartField, trimEndField]) {
    const problem = trimFieldProblems.get(field)
    if (problem !== undefined) return { problem }
  }
  return trimRangeFor(trimStart, trimEnd, trimDuration)
}

/** Stops the preview and lets its object URL go. Nothing is kept for the old file. */
function clearTrimPreview(): void {
  trimPreview.pause()
  trimPreview.removeAttribute('src')
  trimPreview.load()
  if (previewUrl) URL.revokeObjectURL(previewUrl)
  previewUrl = null
}

/**
 * No video to trim: nothing from the last one shown, every control down, and
 * the step says why — reading, or unreadable.
 */
function clearTrim(notice: 'reading' | 'unreadable'): void {
  clearTrimPreview()
  trimPreviewNote.hidden = true
  trimNotice = notice
  trimDuration = 0
  trimStart = 0
  trimEnd = 0
  trimFieldProblems.clear()
  for (const range of [trimStartRange, trimEndRange]) range.max = '0'
  applyControlLock()
}

/**
 * A new video: preview it and keep all of it.
 *
 * The preview reads the file where it is, through a local object URL — no
 * request, and nothing read into memory.
 */
function resetTrim(file: File, durationSeconds: number): void {
  clearTrimPreview()
  previewUrl = URL.createObjectURL(file)
  trimPreview.src = previewUrl
  trimPreviewNote.hidden = true
  trimNotice = null
  trimDuration = durationSeconds
  trimStart = 0
  trimEnd = durationSeconds
  trimFieldProblems.clear()
  for (const range of [trimStartRange, trimEndRange]) {
    range.min = '0'
    range.max = String(durationSeconds)
  }
  renderTrim()
  applyControlLock()
}

/** Shows the trim as it stands: handles, fields, the kept part in words, and any problem. */
function renderTrim(): void {
  if (trimNotice !== null) {
    trimStartField.value = ''
    trimEndField.value = ''
    for (const field of [trimStartField, trimEndField]) field.removeAttribute('aria-invalid')
    for (const line of [trimStartError, trimEndError]) line.hidden = true
    trimResult.textContent = trimNotice === 'reading' ? t().trim.reading : t().trim.unreadable
    trimClear.disabled = true
    trimTrack.style.setProperty('--start-fraction', '0')
    trimTrack.style.setProperty('--end-fraction', '0')
    return
  }
  trimStartRange.value = String(trimStart)
  trimEndRange.value = String(trimEnd)
  trimStartRange.setAttribute('aria-valuetext', trimHandleText(trimStart, trimDuration))
  trimEndRange.setAttribute('aria-valuetext', trimHandleText(trimEnd, trimDuration))
  const fraction = (value: number) =>
    trimDuration > 0 ? Math.min(1, Math.max(0, value / trimDuration)) : 0
  trimTrack.style.setProperty('--start-fraction', String(fraction(trimStart)))
  trimTrack.style.setProperty('--end-fraction', String(fraction(trimEnd)))
  trimStartRange.classList.toggle('range-input--on-top', fraction(trimStart) > 0.5)

  // A field the user is correcting keeps what they typed, and so does one
  // they are typing in now (a repaint must not reach under a draft).
  for (const [field, seconds] of [
    [trimStartField, trimStart],
    [trimEndField, trimEnd],
  ] as const) {
    if (!trimFieldProblems.has(field) && document.activeElement !== field) {
      field.value = formatTrimTime(seconds)
    }
  }

  const trim = currentTrim()
  const problem = 'problem' in trim ? trimProblemText(trim.problem) : null
  // Each field's own problem beside it, so a second bad time is not hidden
  // behind the first; a problem with the range as a whole — the end before
  // the start, too little kept — marks both fields and is said under End
  // (VH-124).
  const rangeProblem = problem !== null && trimFieldProblems.size === 0 ? problem : null
  for (const [field, line] of [
    [trimStartField, trimStartError],
    [trimEndField, trimEndError],
  ] as const) {
    const fieldProblem = trimFieldProblems.get(field)
    const own =
      fieldProblem !== undefined
        ? trimProblemText(fieldProblem)
        : field === trimEndField
          ? rangeProblem
          : null
    line.textContent = own ?? ''
    line.hidden = own === null
    // A problem with the range is shown once, under End, and described to
    // both fields: Start takes End's line into its description while one
    // shows (Codex review of VH-124).
    if (field === trimStartField) {
      field.setAttribute(
        'aria-describedby',
        rangeProblem === null
          ? 'trim-format trim-start-error trim-result'
          : 'trim-format trim-start-error trim-end-error trim-result',
      )
    }
    const invalid = problem !== null && (rangeProblem !== null || trimFieldProblems.has(field))
    if (invalid) field.setAttribute('aria-invalid', 'true')
    else field.removeAttribute('aria-invalid')
  }
  trimResult.textContent =
    problem !== null
      ? ''
      : trimSummary('range' in trim ? trim.range : null, trimDuration) +
        (trimDuration < KEPT_MIN_SECONDS ? ` ${t().trim.tooShort({ seconds: KEPT_MIN_SECONDS })}` : '')
  trimClear.disabled =
    jobInFlight || saveInFlight || (problem === null && 'range' in trim && trim.range === null)
}

/**
 * A committed change to the trim. The verdict on screen described another
 * range, so Start comes down at once and anything in flight is stopped; the
 * device check re-runs once the trim has been still for a moment, so a held
 * arrow key does not queue a check per step.
 */
function commitTrim(): void {
  renderTrim()
  const file = fileInput.files?.[0]
  if (!file || file !== inspectedFile) return
  const current = beginSelection()
  processActions.hidden = true
  createNote.hidden = true
  jobFile = null
  jobContentClass = 'unknown'
  jobKeptRange = null
  cancelTrimRecheck()
  withdrawDiscardQuestion()
  // The verdict priced the previous trim (U-04); the step now leads with the
  // re-check, or with the trim error that stops it.
  withdrawVerdict()
  if ('problem' in currentTrim()) {
    offerStop(null)
    setStatus(() => t().trim.correctToContinue)
    return
  }
  setStatus(() => t().status.checking)
  // Stoppable from now, not from when the pause ends (A-11).
  offerStop('check')
  trimRecheck = setTimeout(() => {
    trimRecheck = null
    // Belt and braces: every path that supersedes this also cancels it.
    if (!current()) return
    void runPreflight(file, current)
  }, TRIM_RECHECK_DELAY_MS)
}

/**
 * Keeps each handle on its own side of the other, at least the shortest keep
 * apart. That is a constraint on the slider, never a correction of a typed
 * time: those are refused beside the field instead.
 */
function onRangeInput(which: 'start' | 'end', value: number): void {
  // A handle moved for this end replaces whatever its field held.
  trimFieldProblems.delete(which === 'start' ? trimStartField : trimEndField)
  if (which === 'start') trimStart = Math.max(0, Math.min(value, trimEnd - KEPT_MIN_SECONDS))
  else trimEnd = Math.min(trimDuration, Math.max(value, trimStart + KEPT_MIN_SECONDS))
  renderTrim()
}

trimStartRange.addEventListener('input', () => onRangeInput('start', trimStartRange.valueAsNumber))
trimEndRange.addEventListener('input', () => onRangeInput('end', trimEndRange.valueAsNumber))
trimStartRange.addEventListener('change', commitTrim)
trimEndRange.addEventListener('change', commitTrim)

for (const [range, which] of [
  [trimStartRange, 'start'],
  [trimEndRange, 'end'],
] as const) {
  range.addEventListener('keydown', (event) => {
    const bounds =
      which === 'start'
        ? { min: 0, max: Math.max(0, trimEnd - KEPT_MIN_SECONDS) }
        : { min: Math.min(trimDuration, trimStart + KEPT_MIN_SECONDS), max: trimDuration }
    const target = trimKeyTarget(event.key, which === 'start' ? trimStart : trimEnd, bounds)
    if (target === null) return
    event.preventDefault()
    onRangeInput(which, target)
    commitTrim()
  })
}

for (const [field, which] of [
  [trimStartField, 'start'],
  [trimEndField, 'end'],
] as const) {
  field.addEventListener('change', () => {
    const value = trimFieldValue(field.value, which, trimDuration)
    if ('problem' in value) {
      trimFieldProblems.set(field, value.problem)
    } else {
      trimFieldProblems.delete(field)
      if (which === 'start') trimStart = value.seconds
      else trimEnd = value.seconds
    }
    commitTrim()
  })
}

trimSetStart.addEventListener('click', () => {
  trimFieldProblems.delete(trimStartField)
  trimStart = trimPreview.currentTime
  commitTrim()
})

trimSetEnd.addEventListener('click', () => {
  trimFieldProblems.delete(trimEndField)
  trimEnd = trimPreview.currentTime
  commitTrim()
})

trimClear.addEventListener('click', () => {
  trimFieldProblems.clear()
  trimStart = 0
  trimEnd = trimDuration
  commitTrim()
  // The button disables itself; focus goes somewhere that still works.
  trimStartRange.focus()
})

// The browser's player and WebCodecs do not accept the same files. A source
// the job can process may not preview; the times still work without it.
trimPreview.addEventListener('error', () => {
  if (!previewUrl) return
  trimPreviewNote.hidden = false
  applyControlLock()
})

// --- Processing ---
//
// A minimal trigger so the pipeline is reachable and demonstrable. The real
// workflow — preset choice, branding toggles, named stages, save — is VH-10.

/** What the last progress report said, so the next announces only what is new. */
let progressMemo: ProgressMemo = NO_PROGRESS

/**
 * The user's choice on routine progress announcements (WCAG 2.2.4). Read
 * once; the checkbox beside the status line writes it back.
 */
const localStore = ((): Storage | null => {
  try {
    return window.localStorage
  } catch {
    return null
  }
})()
announceProgressBox.checked = readAnnounceProgress(localStore)
announceProgressBox.addEventListener('change', () => {
  writeAnnounceProgress(localStore, announceProgressBox.checked)
})

/** The last progress report, so a change of language can write the stage line again without announcing it. */
let lastProgress: { readonly stage: PipelineStage; readonly fraction: number } | null = null

function onStage(stage: PipelineStage, fraction: number): void {
  lastProgress = { stage, fraction }
  const view = progressView(stage, fraction, progressMemo, announceProgressBox.checked)
  progressMemo = view.memo
  // The stage and the percentage beside the bar, every report; the live
  // region only at a stage change or a milestone (U-08).
  processProgressText.textContent = view.shown
  processProgressText.hidden = false
  // Spoken, not shown: the line beside the bar is the one visible account
  // (VH-124), and "Cancelling…" is never written over (pre-work defect 7).
  if (view.announce && !cancelRequested) setStatus('', view.announce)
  // No value at all for a stage whose progress is not measured: the bar is
  // indeterminate rather than stuck at 0% (U-07).
  if (view.indeterminate) processProgress.removeAttribute('value')
  else processProgress.value = fraction
  // The bar's accessible name tracks the stage, so it announces "Encoding
  // video, 63%" rather than "63%" of nothing in particular (VH-64).
  processProgressLabel.textContent = view.shown
  processProgressLabel.hidden = false
  processProgress.hidden = false
  setTitle('stage')
}

/** What the tab title is about, so it can be written again in another language. */
let titleOf: 'none' | 'ready' | 'failed' | 'cancelled' | 'stage' = 'none'

/** Writes the tab title: the job's outcome, or the running stage. */
function setTitle(of: typeof titleOf): void {
  titleOf = of
  document.title =
    of === 'stage' && lastProgress
      ? progressView(lastProgress.stage, lastProgress.fraction, progressMemo, false).title
      : outcomeTitle(of === 'stage' ? 'none' : of)
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

/**
 * What pre-flight measured that file's picture to be, for the preset then
 * chosen. Handed back with the job so it encodes at the bitrate the verdict
 * described; set and cleared with {@link jobFile}, so a class can never
 * outlive the verdict it came from (VH-19).
 */
let jobContentClass: ContentClass = 'unknown'

/**
 * The trim that verdict was checked for, handed to the job with the file so
 * the file is cut where the verdict's time and size said (VH-96). Set and
 * cleared with {@link jobFile}.
 */
let jobKeptRange: KeptRange | null = null

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
  /** What the job was, read once when it started (VH-107). */
  readonly record: JobRecord
  /** What the finished file carries, which is not always what was asked for. */
  readonly outcome: ClosingOutcome
  /** Frees whatever the last save attempt still held — see `save.ts`. */
  readonly release: () => void
}

let unsavedResult: RetainedResult | null = null

/**
 * Whether the "starting again will discard it" question is on screen.
 *
 * The question is about one selection. Pressed after the trim, preset or
 * closing had changed, it threw away the unsaved video and started a job
 * nothing on screen described — with no Cancel, because the trim error had
 * hidden the row Cancel lives in (U-02). Any change to the selection now
 * retires it and restores the result it interrupted.
 */
let discardAsked = false

/** Puts back the result the discard question interrupted, if it is showing. */
function withdrawDiscardQuestion(): void {
  if (!discardAsked) return
  discardAsked = false
  if (unsavedResult) renderResult(unsavedResult)
  else clear(processResult)
  syncCreateNote()
}

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

const cancelButton = document.createElement('button')
cancelButton.type = 'button'
cancelButton.className = 'button button--secondary'
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
acknowledgeButton.hidden = true
acknowledgeButton.addEventListener('click', () => {
  acknowledgeButton.hidden = true
  startButton.hidden = false
  startButton.focus()
})

processActions.append(acknowledgeButton, startButton, cancelButton)

/**
 * Spec 9.2: cancel is always available — and it reached only a running job
 * (U-18). The device check can run for a while on a long recording, and a
 * save streams a whole file; each gets a stop of its own, beside the status
 * line that says it is happening. A stopped check is offered again, because
 * nothing else re-runs it for the same file and trim.
 */
function stopButton(): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'button button--secondary'
  button.hidden = true
  return button
}
const stopCheckButton = stopButton()
const checkAgainButton = stopButton()
const stopSaveButton = stopButton()
stopActions.append(stopCheckButton, checkAgainButton, stopSaveButton)

/**
 * The labels of the buttons built once and kept for the session, written in
 * the current language — at boot, and again on a change of language.
 */
function labelButtons(): void {
  const { create } = t()
  startButton.textContent = create.create
  cancelButton.textContent = create.cancel
  acknowledgeButton.textContent = create.continueAnyway
  stopCheckButton.textContent = create.stopCheck
  checkAgainButton.textContent = create.checkAgain
  stopSaveButton.textContent = create.stopSaving
}
labelButtons()

/**
 * What the row offers for the device check. Kept apart from the save's stop:
 * a previous video can be saving while the next file is checked, and the
 * check finishing must not take the save's way out with it (Codex review).
 */
function offerStop(offer: 'check' | 'check-again' | null): void {
  stopCheckButton.hidden = offer !== 'check'
  checkAgainButton.hidden = offer !== 'check-again'
  syncStopRow()
}

/** Whether the row offers Stop saving. */
function offerSaveStop(offered: boolean): void {
  stopSaveButton.hidden = !offered
  stopSaveButton.disabled = false
  syncStopRow()
}

/** The row is on the page while any of its controls is. */
function syncStopRow(): void {
  stopActions.hidden = [stopCheckButton, checkAgainButton, stopSaveButton].every(
    (button) => button.hidden,
  )
}

stopCheckButton.addEventListener('click', () => {
  // Everything the check was doing belongs to the selection being stopped,
  // including a re-check still waiting out the trim's pause (A-11).
  beginSelection()
  cancelTrimRecheck()
  setDiagnosticsContext({ stage: 'inspected' })
  // Check again is beside it, and explains itself (VH-124).
  setStatus(() => t().status.checkStopped)
  offerStop('check-again')
  // The control under focus has just gone; its replacement takes it.
  checkAgainButton.focus()
})

checkAgainButton.addEventListener('click', () => {
  const file = fileInput.files?.[0]
  if (!file || file !== inspectedFile) return
  void runPreflight(file, beginSelection())
  if (!stopCheckButton.hidden) stopCheckButton.focus()
})

/** The save in progress, so Stop saving can reach it. */
let saveStop: AbortController | null = null

/** Whether Stop saving had focus when pressed; disabling it can drop focus to the body (VH-111). */
let stopSavePressedWithFocus = false

stopSaveButton.addEventListener('click', () => {
  if (!saveStop) return
  stopSavePressedWithFocus = document.activeElement === stopSaveButton
  stopSaveButton.disabled = true
  setStatus(() => t().status.stoppingSave)
  saveStop.abort()
})

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
  // Cancel is the one control while a job runs; Create comes back with the
  // outcome (VH-124). Under a discouraging verdict the acknowledgement stands
  // where Create will.
  startButton.hidden = running || !acknowledgeButton.hidden
  syncCreateNote()
  // Spec 7.5: visible for the whole job, said once at its start (`beginJob`).
  jobNotice.textContent = running ? t().progress.jobNotice : ''
  jobNotice.hidden = !running
  announceField.hidden = !running
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
  const lockText = jobInFlight ? t().create.lockedMaking : saveInFlight ? t().create.lockedSaving : ''
  for (const note of lockNotes) {
    note.textContent = lockText
    note.hidden = lockText === ''
  }
  // Shut until the start-up check settles, and for good if it blocked.
  fileInput.disabled = locked || startup !== 'ready'
  presetChoice.disabled = locked
  brandingChoice.disabled = locked
  startButton.disabled = locked
  // The trim is part of what the job was started for. A video too short to
  // trim has nothing to move, and says so in the line beneath.
  const trimLocked = locked || trimNotice !== null || trimDuration < KEPT_MIN_SECONDS
  for (const control of [trimStartRange, trimEndRange, trimStartField, trimEndField]) {
    control.disabled = trimLocked
  }
  // "Here" is the preview's position, so without a preview there is none.
  const noPreview = !trimPreviewNote.hidden || previewUrl === null
  trimSetStart.disabled = trimLocked || noPreview
  trimSetEnd.disabled = trimLocked || noPreview
  renderTrim()
}

startButton.addEventListener('click', () => {
  const file = jobFile
  if (!file || jobInFlight || saveInFlight) return

  // Starting again disposes the previous result's scratch, and the previous
  // result may be the only copy of an hour's work (VH-56). Ask once; the
  // answer starts the job.
  if (unsavedResult) {
    confirmDiscardThenStart()
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
function confirmDiscardThenStart(): void {
  const asked = unsavedResult
  if (!asked) return
  discardAsked = true
  syncCreateNote()

  const question = (): string => (asked.delivered ? t().discard.delivered : t().discard.unsaved)

  // The same record the result shows, so the question names what would go —
  // outcome included: a fade that became a cut is a cut here too (Codex
  // review of VH-107).
  const summary = (): string => {
    const differs = closingOutcomeText(asked.record.closing, asked.outcome)
    return differs === null ? jobSummaryText(asked.record) : `${jobSummaryText(asked.record)} ${differs}`
  }

  // Built once; painted in the current language now and on a change of
  // language, with focus kept where it is (VH-105).
  const panel = notification({ kind: 'warning', title: '', lines: ['', ''] })
  const [title, questionLine, summaryLine] = panel.querySelectorAll('p')

  // Carbon's danger button: the one destructive action on the page looks
  // like one, and does not take focus by default — the question does, so
  // Enter pressed in haste discards nothing (VH-124).
  const discard = document.createElement('button')
  discard.type = 'button'
  discard.className = 'button button--danger'
  discard.addEventListener('click', () => {
    // The same gate as Create: a file the verdict stands for, and nothing in
    // flight. The question is retired by every change that drops the gate,
    // so this is belt and braces (U-02).
    const file = jobFile
    if (!file || jobInFlight || saveInFlight) return
    releaseUnsavedResult()
    beginJob(file)
  })

  const keep = document.createElement('button')
  keep.type = 'button'
  keep.className = 'button button--secondary'
  keep.addEventListener('click', () => {
    // Keep it removes itself; the result it restores takes focus.
    const fromKeep = focusHeldBy([keep])
    if (unsavedResult) fromKeep(renderResult(unsavedResult))
  })

  const actions = document.createElement('div')
  actions.className = 'actions'
  actions.append(discard, keep)
  panel.append(actions)
  panel.tabIndex = -1
  show(processResult, () => {
    if (title) title.textContent = t().discard.title
    if (questionLine) questionLine.textContent = question()
    if (summaryLine) summaryLine.textContent = summary()
    discard.textContent = t().create.discard
    keep.textContent = t().create.keep
    if (!panel.isConnected) processResult.replaceChildren(panel)
  })
  // The panel says it; the live region only speaks it.
  setStatus('', () => t().discard.spoken({ question: question() }))
  panel.focus()
}

/** Forgets the retained result, freeing whatever the save route still held. */
function releaseUnsavedResult(): void {
  unsavedResult?.release()
  unsavedResult = null
  updateLeaveWarning()
  syncCreateEmphasis()
}

/** The source of a saved result still on screen, so Create stays stepped down beside it. */
let savedResultFor: File | null = null

/**
 * One primary action per state (VH-112, U-13; Carbon). While a finished video
 * is on screen — unsaved, or saved and still the chosen file's — Save or what
 * follows it is the next step, and Create, which starts again, steps down.
 */
function syncCreateEmphasis(): void {
  const resultShown =
    unsavedResult !== null || (savedResultFor !== null && savedResultFor === fileInput.files?.[0])
  startButton.classList.toggle('button--secondary', resultShown)
  syncCreateNote()
}

/**
 * Spec 7.5's "not kept past the tab", said before Create — and only then:
 * not while a job runs, and not beside a result that carries the same
 * sentence as its own (VH-124; spec 9.1 wants both, never both at once).
 */
function syncCreateNote(): void {
  createNote.hidden = processActions.hidden || jobInFlight || processResult.childElementCount > 0
}

function beginJob(file: File): void {
  savedResultFor = null
  // Create, or the question's Discard, is about to go: Cancel takes focus.
  const fromCreate = focusHeldBy([startButton, processResult])
  clear(processResult)
  discardAsked = false
  // A running job always shows its row — Cancel lives in it (U-02).
  processActions.hidden = false
  // Decoding the preview competes with the encode for the same hardware.
  trimPreview.pause()

  // Read once, so the job and the record of it cannot disagree.
  const closing = chosenClosing()
  const branding = brandingChoiceFor(closing)
  const keptRange = jobKeptRange
  /** What this job is, fixed now: the result and the discard question carry it (A-05). */
  const record: JobRecord = {
    sourceName: file.name,
    keptRange,
    durationSeconds: trimDuration,
    presetId: chosenPreset(),
    closing,
  }

  const { id, promise } = requestWithId(
    {
      kind: 'process',
      file,
      presetId: chosenPreset(),
      branding,
      backgroundColour: brandBackground(),
      brandingBaseUrl: resolveBrandingBase(document.baseURI),
      contentClass: jobContentClass,
      ...(keptRange ? { keptRange } : {}),
    },
    // Silence, not duration. A job reports a stage every thirty frames, so a
    // minute without a word means something is genuinely wrong — while an
    // hour of honest work no longer trips anything (VH-38).
    { idleMs: WORKER_SILENCE_LIMIT_MS },
  )
  jobCancelId = id
  progressMemo = NO_PROGRESS
  cancelPressedWithFocus = false
  cancelRequested = false
  // The verdict priced this job; while it runs, the bar and Cancel lead
  // (VH-124). The outcome takes its place when the job ends.
  withdrawVerdict()
  setJobInFlight(true)
  fromCreate(cancelButton)
  // Said once, at the start, whatever the estimate (spec 7.5, A-03); the
  // stages follow in the same live region. Spoken only: the notice is on
  // screen beneath the bar for the whole job.
  setStatus('', () => t().status.creating({ notice: t().progress.jobNotice }))
  // The choices the job was started with.
  setDiagnosticsContext({
    stage: 'processing',
    job: {
      presetId: chosenPreset(),
      // The controls as the user left them, with `null` for one the type does
      // not use — a stale onset under Cut is not something they chose.
      closingType: closing.type,
      closingOnset: closingTypeUsesOnset(closing.type) ? closing.onset : null,
      closingColour: branding.closing ? closing.colour : null,
      closingMode: branding.closing ? (branding.mode ?? null) : null,
      // Times only, never anything about what is in them.
      keptRange,
    },
  })

  /** Where focus goes when the job ends, if it was on Cancel when it did. */
  let handTo: HTMLElement | null = null
  let fromCancel = focusHeldBy([])
  void promise
    .then((reply) => {
      fromCancel = focusHeldBy([cancelButton], cancelPressedWithFocus)
      // Whatever the job's outcome, the verdict that priced it has been spent:
      // the step leads with the outcome, not with "Ready to go" above it
      // (U-04). The output warnings below take the sound notes' place.
      withdrawVerdict()
      if (reply.kind === 'processed') {
        const outcome: ClosingOutcome = {
          applied: reply.brandingApplied.closing,
          mode: reply.closingModeApplied,
          sound: reply.audioIncluded,
          opening: reply.brandingApplied.opening,
        }
        handTo = renderResult({
          file: reply.file,
          jobId: reply.jobId,
          source: file,
          delivered: false,
          record,
          outcome,
          release: () => {},
        })
        const { outputWarnings } = reply
        show(audioWarnings, () =>
          renderWarnings(audioWarnings, outputWarnings, { heading: t().warnings.finishedHeading }),
        )
        // 100% is said here and nowhere earlier: the file has passed its
        // checks (U-07).
        processProgress.value = 1
        processProgressText.textContent = t().progress.ready
        lastProgress = null
        // What the result and its warnings show is said too (U-10): a closing
        // that did not land as chosen, and each output warning.
        // The result box says it; the line speaks it (VH-124).
        setStatus('', () =>
          spoken(
            t().status.ready,
            closingOutcomeText(record.closing, outcome),
            warningsSpoken(t().warnings.finishedHeading, outputWarnings),
          ),
        )
        setTitle('ready')
        setDiagnosticsContext({ stage: 'finished' })
      } else if (reply.kind === 'cancelled') {
        // Nothing was written anywhere the user can see, and the source is
        // untouched — say so rather than leaving them wondering.
        setStatus(() => t().status.cancelled)
        handTo = startButton
        setTitle('cancelled')
        setDiagnosticsContext({ stage: 'idle' })
      } else if (reply.kind === 'failed') {
        const failure = failureFor(reply)
        handTo = showFailure(processResult, failure)
        // The failure's next step is announced, not only shown (U-10); the
        // box says what, and the line speaks it (VH-124).
        setStatus('', () => t().status.couldNotCreate({ sentence: failureSentence(failureWords(failure)) }))
        handTo.tabIndex = -1
        setTitle('failed')
        setDiagnosticsContext({ stage: 'failed' })
      }
    })
    .catch(async (cause: unknown) => {
      fromCancel = focusHeldBy([cancelButton], cancelPressedWithFocus)
      withdrawVerdict()
      // The watchdog is the only thing that rejects this promise; anything
      // else reaching here threw while the outcome was being shown, and is
      // not the job going quiet.
      const failure: Failure = { code: cause instanceof WorkerSilenceError ? 'timed-out' : 'unknown' }
      handTo = showFailure(processResult, failure)
      handTo.tabIndex = -1
      setStatus('', () => t().status.couldNotCreate({ sentence: failureSentence(failureWords(failure)) }))
      setTitle('failed')
      setDiagnosticsContext({ stage: 'failed' })
      log.error('ui', 'process request failed', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      // The watchdog posts `cancel` and rejects in the same breath, so this
      // path is reached while the worker is still winding the job down. Start
      // must not re-arm yet: the next `process` begins by disposing every
      // retained workspace, and doing that to a job still finalizing is how a
      // finished file gets deleted out from under its own muxer (VH-75). The
      // locks stay for that reason; the bar, its stale percentage and Cancel
      // do not sit beside "could not be created" meanwhile (Codex critique).
      hideProgress()
      cancelButton.disabled = true
      await settled(id)
    })
    .finally(() => {
      jobCancelId = null
      setJobInFlight(false)
      syncCreateNote()
      if (handTo) fromCancel(handTo)
      hideProgress()
    })
}

/** Takes the bar, its label and the stage line off the page. */
function hideProgress(): void {
  processProgress.hidden = true
  processProgressLabel.hidden = true
  processProgressText.hidden = true
  lastProgress = null
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
/**
 * Whether Cancel had focus when pressed. Disabling it can drop focus to the
 * page body before the job answers, so the job's end could not tell
 * (VH-111). Reset when a job starts.
 */
let cancelPressedWithFocus = false
/** True from Cancel until the job answers, so no stage report overwrites "Cancelling…" (VH-124). */
let cancelRequested = false

cancelButton.addEventListener('click', () => {
  if (jobCancelId === null) return
  cancelPressedWithFocus = document.activeElement === cancelButton
  cancelRequested = true
  cancelButton.disabled = true
  setStatus(() => t().status.cancelling)
  worker.postMessage({ kind: 'cancel', id: nextRequestId++, cancelId: jobCancelId })
})

/**
 * Points the Start button at this file and reveals the controls.
 *
 * @param contentClass - What pre-flight measured the picture to be, kept with
 *   the file so the job is encoded as the verdict said it would be.
 * @param keptRange - The trim that verdict was checked for, likewise.
 * @param needsAcknowledgement - True for a `discourage` verdict, where spec 7.3
 *   allows continuing only after the user says so. Start is withheld until
 *   they do, and every new selection asks again — an acknowledgement is about
 *   one job, not about the session.
 */
function showProcessControls(
  file: File,
  contentClass: ContentClass,
  keptRange: KeptRange | null,
  needsAcknowledgement = false,
): void {
  jobFile = file
  jobContentClass = contentClass
  jobKeptRange = keptRange
  acknowledgeButton.hidden = !needsAcknowledgement
  startButton.hidden = needsAcknowledgement
  processActions.hidden = false
  syncCreateNote()
}

/**
 * Shows a finished video: what it is, what it was made from, and Save.
 *
 * @param kept - The result to show. A fresh record when the job has just
 *   finished; the retained one when it is put back after "Keep it" or while
 *   the next file is being read.
 */
function renderResult(kept: RetainedResult): HTMLElement {
  discardAsked = false
  const { file, jobId, source, record, outcome } = kept

  // VH-22: branding that was asked for but could not be loaded is skipped
  // rather than failing the job, so the result has to say so — and so does a
  // fade or slide that fell back to a cut (U-14). A video whose closing is
  // not the one described, delivered silently, is the failure this prevents.
  // One success notification (VH-124): the title, the job's own record —
  // fixed when it ended (A-05), since two outputs of one recording can differ
  // in trim, output and closing — a closing that did not land as chosen, the
  // lifetime, and Save as its action. Built once here, and its words written
  // by `paint` below: now, and again on a change of language, without the
  // Save closure or its state being rebuilt (VH-105).
  const heading = notification({ kind: 'success', title: '', lines: ['', ''] })
  const [title, recordLine, differsLine] = heading.querySelectorAll('p')
  // Where focus lands when the job finishes, "Keep it" restores this, or
  // Save is spent (VH-111): what there now is.
  heading.tabIndex = -1

  // Spec 7.5: not kept past the tab, and the page says so beside the result.
  // The leave warning catches a reload; it cannot catch a crash or a
  // discarded tab, which is why the sentence is here. Gone once it is saved.
  const lifetime = body('')
  heading.append(lifetime)
  /** Which lifetime sentence stands: until saved, or — after a download — until the next video. */
  let lifetimeOf: 'unsaved' | 'delivered' = 'unsaved'

  const save = document.createElement('button')
  save.type = 'button'
  save.className = 'button'
  /** Set once the file is out and the scratch has gone; the control is then spent. */
  let saved = false

  const paint = (): void => {
    // Not "Your video is ready": the status line says that, directly above,
    // and this block also stands on its own later — after "Keep it", or
    // while the next file is being read — where "ready" would be news about
    // the wrong thing (VH-88). Once another file has been chosen it is the
    // PREVIOUS video, and says so: a result sitting unnamed under the next
    // file's verdict was the wrong lecture saved and published (U-03).
    const previous = fileInput.files?.[0] !== source
    const size = formatFileSize(file.size)
    if (title) title.textContent = previous ? t().result.previous({ size }) : t().result.finished({ size })
    if (recordLine) recordLine.textContent = jobSummaryText(record)
    const differs = closingOutcomeText(record.closing, outcome)
    if (differsLine) {
      differsLine.textContent = differs ?? ''
      differsLine.hidden = differs === null
    }
    lifetime.textContent = lifetimeOf === 'unsaved' ? t().result.lifetime : t().result.lifetimeDelivered
    save.textContent = saved ? t().create.saved : t().create.save
    if (!heading.isConnected) processResult.replaceChildren(heading)
  }
  show(processResult, paint)

  // Retained until the user has it somewhere. Everything that would destroy it
  // now has to go through `unsavedResult` first (VH-56).
  //
  // Preserved when this is a re-render of the same job — "Keep it" comes back
  // through here, and a fresh record would drop the download's object URL and
  // the worker lease that record is holding.
  unsavedResult = unsavedResult?.jobId === jobId ? unsavedResult : kept
  updateLeaveWarning()

  save.addEventListener('click', () => {
    if (saved) return
    // Noted before Save disables itself, which can drop focus to the body.
    const fromSave = focusHeldBy([save])
    save.disabled = true
    // Not just this button: a save streams out of the job's OPFS scratch, and
    // starting another job disposes exactly that scratch.
    setSaveInFlight(true)
    // A multi-gigabyte save streams for a while and used to say nothing at
    // all, which is the same silence VH-38 established means "wedged".
    setStatus(() => t().status.saving)
    // Declared to the worker as well as locked in the UI: the UI lock is a
    // convention, and a convention is what VH-36 turned out to be.
    worker.postMessage({ kind: 'lease', id: nextRequestId++, jobId, held: true })
    // Cleared by whichever route takes ownership of the lease instead.
    let leaseHeld = true
    const stop = new AbortController()
    saveStop = stop
    offerSaveStop(true)
    // Save has disabled itself under focus; the stop takes it (VH-111).
    fromSave(stopSaveButton)
    stopSavePressedWithFocus = false
    /**
     * Whichever of Save and Stop saving held focus when the save settled —
     * taken the moment it does, before either is hidden or spent, so the
     * hand-on below can still tell (Codex review of VH-124).
     */
    let fromGone = focusHeldBy([])
    void (async () => {
      try {
        const result = await saveFile(
          file,
          // What the file carries, not what was asked for (VH-123).
          suggestedFileName(source.name, {
            branded: outcome.applied || (outcome.opening ?? false),
            sound: outcome.sound ?? true,
          }),
          {
            identity: { name: source.name, size: source.size, lastModified: source.lastModified },
          },
          stop.signal,
        )
        fromGone = focusHeldBy([save, stopSaveButton], stopSavePressedWithFocus)
        if (result.outcome === 'cancelled') {
          // "Nothing was kept there" would overclaim: an empty file the
          // picker made is removed where the browser allows, and may not be
          // (Codex critique). What is certain is said.
          const stopped = stop.signal.aborted
          setStatus(() => (stopped ? t().status.saveStopped : t().status.notSaved))
          return
        }
        if (result.outcome === 'refused-source') {
          setStatus(() => t().status.refusedSource)
          return
        }
        if (result.outcome === 'downloaded') {
          // `anchor.click()` returns before the browser has read a byte, and
          // an object URL over an OPFS-backed file reads lazily — so the
          // scratch, the URL and the worker's lease all have to outlive this
          // handler. They are released together when the result is.
          leaseHeld = false
          unsavedResult = {
            ...kept,
            delivered: true,
            release: () => {
              result.release()
              worker.postMessage({ kind: 'lease', id: nextRequestId++, jobId, held: false })
            },
          }
          // A hand-off, not a completed write (spec 9.1 step 5): the browser
          // may still be fetching it. Where it lands, and what next, are said
          // for this route too (VH-113) — and the result's own lifetime line
          // agrees with it (Codex critique).
          setStatus(() =>
            downloadStatusText(downloadDestinationFor(navigator.userAgent, navigator.maxTouchPoints)),
          )
          lifetimeOf = 'delivered'
          paint()
          return
        }
        // A completed write, and what next (U-25, spec 9.1 step 5).
        setStatus(() => t().status.saved)
        // Only once it is safely out: the File reads from OPFS, so releasing
        // the workspace first would hand back something unreadable.
        //
        // The lease goes back BEFORE the discard, not in the `finally` after
        // it. `discard` waits on the lease, so releasing it afterwards is a
        // deadlock the request timeout would break ten seconds later.
        unsavedResult = null
        updateLeaveWarning()
        savedResultFor = source
        syncCreateEmphasis()
        leaseHeld = false
        worker.postMessage({ kind: 'lease', id: nextRequestId++, jobId, held: false })
        // Saving again would read a workspace that no longer exists, so the
        // control stops offering it rather than failing when taken up.
        saved = true
        lifetime.remove()
        paint()
        // The save is over when the file is out, not when the scratch is
        // gone: Stop saving and the locks go now, before the clean-up below,
        // which could otherwise be "stopped" after "Saved." (pre-work
        // defect 4).
        saveStop = null
        offerSaveStop(false)
        setSaveInFlight(false)
        // Clean-up is not delivery. The file is out; a scratch that cannot be
        // removed is logged, never announced as a failed save under a button
        // that already reads "Saved" (U-15).
        try {
          await request({ kind: 'discard', jobId }, 10_000)
        } catch (cause) {
          log.warn('ui', 'scratch clean-up failed after a save', {
            reason: cause instanceof Error ? cause.message : String(cause),
          })
        }
      } catch (cause) {
        fromGone = focusHeldBy([save, stopSaveButton], stopSavePressedWithFocus)
        setStatus(() => t().status.saveFailed)
        log.error('ui', 'save failed', {
          reason: cause instanceof Error ? cause.message : String(cause),
        })
      } finally {
        if (leaseHeld) {
          worker.postMessage({ kind: 'lease', id: nextRequestId++, jobId, held: false })
        }
        // A spent Save hands on to the result; one that can be pressed again
        // takes focus back — and a reader elsewhere is left alone (VH-111).
        saveStop = null
        offerSaveStop(false)
        save.disabled = saved
        setSaveInFlight(false)
        fromGone(saved ? heading : save)
      }
    })()
  })
  // In the same block as every other button row, so it is spaced from the
  // line above it rather than butted against it.
  const actions = document.createElement('div')
  actions.className = 'actions'
  actions.append(save)
  heading.append(actions)
  syncCreateEmphasis()
  return heading
}

// --- Feedback (VH-93) ------------------------------------------------------
// The user's own email app sends it. The page makes no request, so "no media
// egress" and the network watch are exactly as they were.

const feedbackDialog = required<HTMLDialogElement>('#feedback-dialog')
const feedbackForm = required<HTMLFormElement>('#feedback-form')
const feedbackMessage = required<HTMLTextAreaElement>('#feedback-message')
const feedbackMessageError = required<HTMLElement>('#feedback-message-error')
const feedbackDetailsBlock = required<HTMLElement>('#feedback-details')
const feedbackStatus = required<HTMLElement>('#feedback-status')
const feedbackIntro = required<HTMLElement>('#feedback-intro')
show(feedbackIntro, () => {
  feedbackIntro.textContent = t().feedback.intro({ address: FEEDBACK_ADDRESS })
})

/** What the dialog's status line says, as a thunk, so a change of language says it again. */
function setFeedbackStatus(message: Text): void {
  show(feedbackStatus, () => {
    feedbackStatus.textContent = textOf(message)
  })
}

/** Every file chosen in this tab, so a report cannot carry any of their names. */
const chosenFileNames = new Set<string>()
fileInput.addEventListener('change', () => {
  for (const chosen of fileInput.files ?? []) chosenFileNames.add(chosen.name)
})

/** The details as last gathered. Copy carries them all; the email what fits. */
let feedbackLines: string[] = []

/** The email as the message stands now: its link, and how many details it carries. */
function feedbackEmail(): ReturnType<typeof feedbackMailto> {
  return feedbackMailto({
    address: FEEDBACK_ADDRESS,
    subject: `${FEEDBACK_SUBJECT} (${BUILD_ID})`,
    message: feedbackMessage.value,
    details: feedbackLines,
    maxCharacters: FEEDBACK_MAILTO_MAX_CHARACTERS,
  })
}

/**
 * Shows what the email will carry. Recomputed as the message is typed, since
 * a longer message leaves room for fewer details — what the user reviews is
 * what is sent (Codex review).
 */
function renderFeedbackDisclosure(): void {
  feedbackDetailsBlock.textContent = feedbackDisclosure(feedbackLines, feedbackEmail().keptDetails)
}

function gatherFeedbackDetails(): void {
  feedbackLines = feedbackDetails(buildDiagnosticsBundle(), {
    browser: describeBrowser(navigator.userAgent),
    fileNames: [...chosenFileNames],
  })
  renderFeedbackDisclosure()
}

function openFeedback(): void {
  setFeedbackStatus('')
  showFeedbackError(false)
  feedbackDialog.showModal()
  // The main thread's lines at once, so the dialog is never empty and Send
  // never waits; the worker's are added when it answers. A hung worker may
  // never answer, and a hung job is the thing most worth reporting.
  gatherFeedbackDetails()
  void (async () => {
    try {
      const drained = await request({ kind: 'drainLogs' }, FEEDBACK_WORKER_LOG_WAIT_MS)
      if (drained.kind === 'logs') adoptLogRecords(drained.records)
    } catch {
      log.warn('feedback', 'worker did not answer with its log lines; reporting without them')
    }
    if (feedbackDialog.open) gatherFeedbackDetails()
  })()
}

function showFeedbackError(show: boolean): void {
  feedbackMessageError.hidden = !show
  if (show) feedbackMessage.setAttribute('aria-invalid', 'true')
  else feedbackMessage.removeAttribute('aria-invalid')
}

/** The message, or null with the error shown beside the field and focus on it. */
function feedbackMessageOrError(): string | null {
  const message = feedbackMessage.value.trim()
  if (message.length > 0) return message
  showFeedbackError(true)
  feedbackMessage.focus()
  return null
}

/**
 * Follows a `mailto:` link without raising "Leave site?" over a running job.
 *
 * Chrome treats the link as leaving the page and fires `beforeunload`,
 * although the page stays and the job carries on. The warning is lifted for
 * the click and put back once the hand-off is over.
 */
function openMailto(url: string): void {
  if (stopLeaveWarning) {
    stopLeaveWarning()
    stopLeaveWarning = null
  }
  const link = document.createElement('a')
  link.href = url
  link.click()
  setTimeout(updateLeaveWarning, FEEDBACK_LEAVE_WARNING_PAUSE_MS)
}

feedbackMessage.addEventListener('input', () => {
  if (feedbackMessage.value.trim().length > 0) showFeedbackError(false)
  renderFeedbackDisclosure()
})

feedbackForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const message = feedbackMessageOrError()
  if (message === null) return
  const { url, keptDetails } = feedbackEmail()
  if (url === null) {
    // A mail client that cuts a long link cuts the message with it, so none
    // is opened (Codex review). The copy route carries every word.
    setFeedbackStatus(() => t().feedback.tooLong({ address: FEEDBACK_ADDRESS }))
    return
  }
  openMailto(url)
  const trimmed = keptDetails < feedbackLines.length
  log.info('feedback', 'asked the email app to open', { trimmed })
  // "Should have": the page cannot know whether it did, or whether the email
  // was then sent.
  setFeedbackStatus(() =>
    spoken(t().feedback.opened({ address: FEEDBACK_ADDRESS }), trimmed ? t().feedback.someOmitted : null),
  )
})

required<HTMLButtonElement>('#feedback-copy').addEventListener('click', () => {
  const message = feedbackMessageOrError()
  if (message === null) return
  void (async () => {
    try {
      await navigator.clipboard.writeText(feedbackText(message, feedbackLines))
      setFeedbackStatus(() => t().feedback.copied({ address: FEEDBACK_ADDRESS }))
    } catch (cause) {
      log.warn('feedback', 'could not copy', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      setFeedbackStatus(() => t().feedback.couldNotCopy)
    }
  })()
})

required<HTMLButtonElement>('#feedback-close').addEventListener('click', () => {
  feedbackDialog.close()
})
required<HTMLButtonElement>('#feedback-open').addEventListener('click', openFeedback)
required<HTMLButtonElement>('#feedback-report').addEventListener('click', openFeedback)

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
      // Step 1's line: the only status text that is always on the page.
      setSourceStatus(
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
