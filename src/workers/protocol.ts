/**
 * The typed message contract across the worker boundary.
 *
 * `AGENTS.md` -> "Communication pattern": the main thread renders, the worker
 * owns the job. Requests are correlated by `id`; unsolicited events carry no
 * id. Kept deliberately small — stage/progress messages arrive with the
 * pipeline that emits them, not before.
 */

import type { CapturedError } from '../core/diagnostics'
import type { LogRecord } from '../core/logger'
import type { PresetId } from '../config/presets'
import type { SourceReport } from '../media/inspect'
import type { PreflightSummary } from '../media/preflight'

/** Main thread -> worker. */
export type WorkerRequest =
  | { readonly kind: 'ping'; readonly id: number }
  | { readonly kind: 'drainLogs'; readonly id: number }
  /**
   * Dev-only probe. The worker's uncaught-error path has a forwarding hop the
   * main thread's does not, so it gets exercised rather than assumed. Wired to
   * a dev-gated control; never reachable in a production build.
   */
  | { readonly kind: 'throwTest'; readonly id: number }
  /**
   * Read a chosen file's structure. The `Blob` is structured-cloned rather
   * than read on the main thread, keeping the rule that decoding and demuxing
   * never happen where the UI runs.
   */
  | { readonly kind: 'inspect'; readonly id: number; readonly file: Blob }
  /**
   * Check the device against this exact job and measure it. Separate from
   * `inspect` so the UI can show what the file is straight away, while the
   * probe — which really does decode and encode three seconds — runs after.
   */
  | {
      readonly kind: 'preflight'
      readonly id: number
      readonly file: Blob
      readonly presetId: PresetId
      /** Resolved D1 brand colour; the worker has no document to read it from. */
      readonly backgroundColour: string
    }

/** Worker -> main thread, in reply to a request. */
export type WorkerResponse =
  | { readonly kind: 'pong'; readonly id: number; readonly workerBootMs: number }
  | { readonly kind: 'logs'; readonly id: number; readonly records: readonly LogRecord[] }
  | { readonly kind: 'inspected'; readonly id: number; readonly report: SourceReport }
  | { readonly kind: 'preflighted'; readonly id: number; readonly summary: PreflightSummary }
  /** A request that failed for a reason the user should read, not a crash. */
  | { readonly kind: 'failed'; readonly id: number; readonly message: string }

/**
 * Worker -> main thread, unsolicited. An uncaught throw inside the worker is
 * useless where it lands, so it is forwarded to the thread that can show it.
 */
export type WorkerEvent = { readonly kind: 'uncaught'; readonly error: CapturedError }

export type WorkerOutbound = WorkerResponse | WorkerEvent
