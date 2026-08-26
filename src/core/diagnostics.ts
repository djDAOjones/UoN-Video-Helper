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
  readonly view: string
  readonly sourceReport: unknown
  readonly capability: unknown
  readonly jobSpec: unknown
  readonly environment: Record<string, unknown>
  readonly errors: readonly CapturedError[]
  readonly logs: readonly unknown[]
}

const errors: CapturedError[] = []
const MAX_ERRORS = 50

/** Stable task context kept outside the bounded log ring. */
let context: {
  view: string
  sourceReport: unknown
  capability: unknown
  jobSpec: unknown
} = {
  view: 'select',
  sourceReport: null,
  capability: null,
  jobSpec: null,
}

/**
 * Updates first-class diagnostic context without logging media or filenames.
 * Callers pass deliberately shaped values; the bundle still redacts every
 * field at copy time as the final safety boundary.
 */
export function setDiagnosticsContext(update: Partial<typeof context>): void {
  context = { ...context, ...update }
}

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
    view: context.view,
    sourceReport: redact(context.sourceReport),
    capability: redact(context.capability),
    jobSpec: redact(context.jobSpec),
    environment: redact(environment()) as Record<string, unknown>,
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
