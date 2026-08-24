/**
 * The project's single structured logger.
 *
 * `AGENTS.md` -> "Self-explaining runtime" bans scattered `console.log`:
 * notable runtime behaviour goes through here, which writes to the console
 * *and* to a bounded in-memory buffer that the diagnostics bundle drains.
 *
 * Deliberately free of DOM and Web API dependencies so the identical module
 * runs on the main thread and inside the job worker.
 */

/** Ordered by severity. `debug` is dropped from the console in production. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** Where a record came from. Matches the module tree, e.g. `pipeline`, `audio`. */
export type LogScope = string

/**
 * Structured payload attached to a record. Anything placed here may end up in
 * a copied diagnostics bundle, so it passes through `redact()` first — see
 * `diagnostics.ts`. Never put media bytes or a filename in here directly.
 */
export type LogData = Record<string, unknown>

export interface LogRecord {
  /** Milliseconds since the epoch, from `Date.now()`. */
  readonly ts: number
  readonly level: LogLevel
  readonly scope: LogScope
  readonly message: string
  readonly data?: LogData
}

/**
 * Ring-buffer capacity. A one-hour encode emits progress steadily, so this is
 * a hard cap rather than a target: old records are dropped, memory is not.
 */
export const LOG_BUFFER_CAPACITY = 500

const LEVEL_RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

const buffer: LogRecord[] = []
let minimumLevel: LogLevel = 'debug'

/** Console method per level. `debug` maps to `log` for legible dev output. */
const CONSOLE_METHOD: Record<LogLevel, 'log' | 'info' | 'warn' | 'error'> = {
  debug: 'log',
  info: 'info',
  warn: 'warn',
  error: 'error',
}

function record(level: LogLevel, scope: LogScope, message: string, data?: LogData): void {
  if (LEVEL_RANK[level] < LEVEL_RANK[minimumLevel]) return

  const entry: LogRecord =
    data === undefined
      ? { ts: Date.now(), level, scope, message }
      : { ts: Date.now(), level, scope, message, data }

  buffer.push(entry)
  if (buffer.length > LOG_BUFFER_CAPACITY) buffer.shift()

  const prefix = `[${scope}]`
  if (data === undefined) {
    console[CONSOLE_METHOD[level]](prefix, message)
  } else {
    console[CONSOLE_METHOD[level]](prefix, message, data)
  }
}

export const log = {
  debug: (scope: LogScope, message: string, data?: LogData) =>
    record('debug', scope, message, data),
  info: (scope: LogScope, message: string, data?: LogData) => record('info', scope, message, data),
  warn: (scope: LogScope, message: string, data?: LogData) => record('warn', scope, message, data),
  error: (scope: LogScope, message: string, data?: LogData) =>
    record('error', scope, message, data),
}

/** A copy of the buffered records, oldest first. */
export function getLogRecords(): readonly LogRecord[] {
  return [...buffer]
}

/** Adopt records emitted inside the worker so one bundle covers both threads. */
export function adoptLogRecords(records: readonly LogRecord[]): void {
  for (const entry of records) {
    buffer.push(entry)
    if (buffer.length > LOG_BUFFER_CAPACITY) buffer.shift()
  }
  buffer.sort((a, b) => a.ts - b.ts)
}

export function clearLogRecords(): void {
  buffer.length = 0
}

/** Raise the floor in production so `debug` never reaches a user's console. */
export function setMinimumLogLevel(level: LogLevel): void {
  minimumLevel = level
}
