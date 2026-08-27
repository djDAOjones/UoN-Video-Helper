/**
 * Global error capture and the copy-diagnostics bundle.
 *
 * Per `AGENTS.md` -> "Self-explaining runtime": an uncaught throw is logged,
 * surfaced, and never swallowed. The bundle is dev-only and passes through
 * `redact()` — see `DEV-INFRASTRUCTURE.md` -> "Maintainer diagnostics".
 */

import { getLogRecords, log, type LogRecord } from './logger'
import { redact } from './redact'
import { APP_VERSION, BUILD_ID } from './version'

export interface CapturedError {
  readonly ts: number
  readonly message: string
  readonly stack?: string
  readonly origin: 'error' | 'unhandledrejection'
  /** Which thread threw. Both feed one bundle. */
  readonly thread: 'main' | 'worker'
}

export interface DiagnosticsBundle {
  readonly appVersion: string
  readonly buildId: string
  readonly capturedAt: string
  readonly environment: Record<string, unknown>
  readonly context: DiagnosticsContext
  readonly errors: readonly CapturedError[]
  readonly logs: readonly unknown[]
}

/**
 * What the app was doing when the bundle was taken.
 *
 * Without it a bundle is a stack trace and a user agent, and the first thing
 * anyone reading one asks is what file, what device verdict, and what the user
 * had chosen — the three questions the logs answer only by inference.
 *
 * `stage` is deliberately not a route: this app is one page whose sections
 * appear in turn, so what matters is how far the user has got.
 *
 * Callers pass **already-safe shapes** — never a `File`, never subtitle text,
 * never a filename. `redact()` is the second line of defence, not the first.
 */
export interface DiagnosticsContext {
  readonly stage?: DiagnosticsStage
  /** Redacted {@link SourceReport} shape: what the file is, never which file. */
  readonly source?: unknown
  /** Redacted pre-flight summary: what this device said it could do. */
  readonly capability?: unknown
  /** The three choices the user made, plus whether a sidecar was supplied. */
  readonly job?: unknown
}

export type DiagnosticsStage =
  | 'idle'
  | 'inspecting'
  | 'inspected'
  | 'preflighting'
  | 'ready'
  | 'blocked'
  | 'processing'
  | 'finished'
  | 'saving'
  | 'failed'

let context: DiagnosticsContext = { stage: 'idle' }

/**
 * Merges into the recorded context. Absent keys are left alone, so a stage
 * change does not erase the source report it happened to.
 */
export function setDiagnosticsContext(patch: DiagnosticsContext): void {
  context = { ...context, ...patch }
}

/** Drops everything about the previous file. Called when a new one is chosen. */
export function resetDiagnosticsContext(stage: DiagnosticsStage): void {
  context = { stage }
}

const errors: CapturedError[] = []
const MAX_ERRORS = 50

/** Listeners notified when an uncaught error arrives, so the UI can surface it. */
type ErrorListener = (error: CapturedError) => void
const listeners = new Set<ErrorListener>()

export function onUncaughtError(listener: ErrorListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function recordUncaught(error: CapturedError): void {
  errors.push(error)
  if (errors.length > MAX_ERRORS) errors.shift()
  log.error('diagnostics', `uncaught ${error.origin} (${error.thread})`, {
    message: error.message,
  })
  for (const listener of listeners) listener(error)
}

export function getCapturedErrors(): readonly CapturedError[] {
  return [...errors]
}

/**
 * Installs `error` and `unhandledrejection` hooks on the current global.
 * Safe to call in a worker: it only touches `addEventListener`.
 *
 * @param thread - Labels which side captured the error in the bundle.
 * @param forward - Optional sink so a worker can push errors to the main
 *   thread instead of holding them where nobody will read them.
 */
export function installGlobalErrorCapture(
  thread: 'main' | 'worker',
  forward?: (error: CapturedError) => void,
): void {
  const emit = (error: CapturedError): void => {
    if (forward) forward(error)
    else recordUncaught(error)
  }

  globalThis.addEventListener('error', (event) => {
    // In a worker, claiming the event stops it propagating to the parent's
    // `worker.onerror` *and* to the parent window's own `error` hook. Without
    // this one throw is captured three times: once here with a stack, and
    // twice more on the main thread without one. On the main thread we do NOT
    // claim it — that would also suppress the browser's own console report,
    // which is worth keeping.
    if (forward) event.preventDefault()

    emit({
      ts: Date.now(),
      message: event.message || 'Unknown error',
      ...(event.error instanceof Error && event.error.stack ? { stack: event.error.stack } : {}),
      origin: 'error',
      thread,
    })
  })

  globalThis.addEventListener('unhandledrejection', (event) => {
    const reason: unknown = event.reason
    emit({
      ts: Date.now(),
      message: reason instanceof Error ? reason.message : String(reason),
      ...(reason instanceof Error && reason.stack ? { stack: reason.stack } : {}),
      origin: 'unhandledrejection',
      thread,
    })
  })

  log.debug('diagnostics', `global error capture installed (${thread})`)
}

/** Non-identifying environment facts. Deliberately excludes anything about the user's media. */
function environment(): Record<string, unknown> {
  const nav: Navigator | undefined = typeof navigator === 'undefined' ? undefined : navigator
  return {
    userAgent: nav?.userAgent ?? 'unknown',
    hardwareConcurrency: nav?.hardwareConcurrency ?? null,
    language: nav?.language ?? null,
    hasWebCodecs: typeof globalThis.VideoEncoder !== 'undefined',
    hasOpfs: typeof navigator !== 'undefined' && 'storage' in navigator,
    hasFileSystemAccess: typeof globalThis.showSaveFilePicker === 'function',
  }
}

/** Builds the redacted bundle. Every field passes through `redact()`. */
export function buildDiagnosticsBundle(): DiagnosticsBundle {
  const logs: readonly LogRecord[] = getLogRecords()
  return {
    appVersion: APP_VERSION,
    buildId: BUILD_ID,
    capturedAt: new Date().toISOString(),
    environment: redact(environment()) as Record<string, unknown>,
    context: redact(context) as DiagnosticsContext,
    errors: redact(errors) as readonly CapturedError[],
    logs: redact(logs) as readonly unknown[],
  }
}

/**
 * Copies the redacted bundle to the clipboard.
 *
 * @returns Whether the copy succeeded, so the caller can announce the outcome
 *   programmatically rather than by colour alone (`UI-STANDARDS.md`).
 */
export async function copyDiagnostics(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(JSON.stringify(buildDiagnosticsBundle(), null, 2))
    log.info('diagnostics', 'copied redacted diagnostics bundle')
    return true
  } catch (cause) {
    log.warn('diagnostics', 'could not copy diagnostics bundle', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return false
  }
}
