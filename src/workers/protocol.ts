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

/** Worker -> main thread, in reply to a request. */
export type WorkerResponse =
  | { readonly kind: 'pong'; readonly id: number; readonly workerBootMs: number }
  | { readonly kind: 'logs'; readonly id: number; readonly records: readonly LogRecord[] }

/**
 * Worker -> main thread, unsolicited. An uncaught throw inside the worker is
 * useless where it lands, so it is forwarded to the thread that can show it.
 */
export type WorkerEvent = { readonly kind: 'uncaught'; readonly error: CapturedError }

export type WorkerOutbound = WorkerResponse | WorkerEvent
