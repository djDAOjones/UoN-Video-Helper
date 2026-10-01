/**
 * What kind of failure a job had, so the page can say what to do next.
 *
 * "Something went wrong" with the reassurance said twice and advice to choose
 * a different file was the whole of a failed job's message (U-06), whatever
 * had happened — a sound that could not be levelled, a device out of space,
 * an encoder that gave up. The worker knows the cause at the point it is
 * caught; this names it, and `ui/failure-text.ts` turns the name into a
 * sentence and a next step. No DOM here: the worker imports it.
 */

/** The failures the page has a sentence for. */
export type FailureCode =
  /** The source could not be read; the message says why (inspect.ts). */
  | 'unreadable-source'
  /** The trim could not be honoured; the message says why (kept-range.ts). */
  | 'bad-trim'
  /** The planner could not bring the sound to target before any encode. */
  | 'unlevellable'
  /** The finished file's sound missed the target after the encode. */
  | 'output-loudness'
  /** The finished file's true peak was over the ceiling. */
  | 'output-peak'
  /** The finished file could not be read back. */
  | 'output-unreadable'
  /** The working store ran out of room. */
  | 'out-of-space'
  /** The browser's encoder refused or failed part-way. */
  | 'encoder-refused'
  /** The device check could not finish. */
  | 'check-failed'
  /** The job stopped reporting and was stopped (the main thread's watchdog). */
  | 'timed-out'
  | 'unknown'

/** A failure the worker names at the point it knows the cause. */
export class JobFailureError extends Error {
  override readonly name = 'JobFailureError'
  constructor(
    readonly code: FailureCode,
    message: string,
    options?: { readonly cause?: unknown },
  ) {
    super(message, options)
  }
}

/** The shape of a `DOMException` without depending on the DOM lib in the worker. */
interface NamedError {
  readonly name?: unknown
  readonly message?: unknown
}

/**
 * Names a caught failure from what is known about it.
 *
 * A {@link JobFailureError} carries its own code. Otherwise the error's name
 * is read: the working store refuses with `QuotaExceededError` when the
 * device is full, and WebCodecs reports a refused or broken encode as
 * `NotSupportedError` or `EncodingError`. Anything else is unknown — said as
 * such, never dressed up as a cause it is not.
 */
export function classifyFailure(cause: unknown): FailureCode {
  if (cause instanceof JobFailureError) return cause.code
  const named = cause as NamedError | null
  const name = typeof named?.name === 'string' ? named.name : ''
  const message = typeof named?.message === 'string' ? named.message : ''
  if (name === 'UnreadableFileError') return 'unreadable-source'
  if (name === 'KeptRangeError') return 'bad-trim'
  if (name === 'QuotaExceededError' || /quota|no space|disk full/i.test(message)) return 'out-of-space'
  if (name === 'NotSupportedError' || name === 'EncodingError') return 'encoder-refused'
  return 'unknown'
}
