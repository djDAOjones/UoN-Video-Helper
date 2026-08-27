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
import type { BrandingChoice } from '../config/branding'
import type { PresetId } from '../config/presets'
import type { SourceReport } from '../media/inspect'
import type { PreflightSummary } from '../media/preflight'
import type { AudioWarning } from '../audio/warnings'
import type { PipelineStage } from '../media/pipeline'

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
    }
  /** Run the job. Progress arrives as `stage` events carrying this same id. */
  | {
      readonly kind: 'process'
      readonly id: number
      readonly file: Blob
      readonly presetId: PresetId
      /** Spec 4.1: independent toggles, all four combinations valid. */
      readonly branding: BrandingChoice
      /** Resolved D1 brand background; the worker has no document. */
      readonly backgroundColour: string
      /** A user-supplied WebVTT sidecar, verbatim. */
      readonly subtitleVtt?: string
    }
  /** Stop the job started by `cancelId`. Answered by that job, not by this request. */
  | { readonly kind: 'cancel'; readonly id: number; readonly cancelId: number }
  /** Release a finished job's OPFS scratch once the result has been saved. */
  | { readonly kind: 'discard'; readonly id: number; readonly jobId: string }
  /**
   * Declare that the main thread is reading a finished job's file, or has
   * stopped.
   *
   * The `File` in a `processed` reply reads out of that job's OPFS scratch, so
   * anything that disposes the scratch while a save is streaming destroys the
   * file mid-write. A held lease makes the worker wait rather than trusting the
   * UI to sequence it (VH-56). Fire-and-forget in both directions; a lease that
   * is never released expires.
   */
  | {
      readonly kind: 'lease'
      readonly id: number
      readonly jobId: string
      readonly held: boolean
    }

/** Worker -> main thread, in reply to a request. */
export type WorkerResponse =
  | { readonly kind: 'pong'; readonly id: number; readonly workerBootMs: number }
  | { readonly kind: 'logs'; readonly id: number; readonly records: readonly LogRecord[] }
  | { readonly kind: 'inspected'; readonly id: number; readonly report: SourceReport }
  | { readonly kind: 'preflighted'; readonly id: number; readonly summary: PreflightSummary }
  /**
   * The finished file, plus the job whose scratch still holds it. The
   * workspace is deliberately NOT disposed here: the `File` reads from it, so
   * removing it first would hand back a file that cannot be read. The caller
   * sends `discard` once the result is safely saved, and an app-start sweep
   * catches anything a closed tab left behind.
   */
  | {
      readonly kind: 'processed'
      readonly id: number
      readonly jobId: string
      readonly file: File
      /** What was actually applied — a branding asset may have failed to load. */
      readonly brandingApplied: { readonly opening: boolean; readonly closing: boolean }
      readonly brandingRequested: { readonly opening: boolean; readonly closing: boolean }
      readonly subtitleCues: number
      /** Measured from the finished file — spec 5.4's post-processing row. */
      readonly outputWarnings: readonly AudioWarning[]
    }
  | { readonly kind: 'cancelled'; readonly id: number }
  | { readonly kind: 'discarded'; readonly id: number }
  /** A request that failed for a reason the user should read, not a crash. */
  | { readonly kind: 'failed'; readonly id: number; readonly message: string }

/**
 * Worker -> main thread, unsolicited. An uncaught throw inside the worker is
 * useless where it lands, so it is forwarded to the thread that can show it.
 */
export type WorkerEvent =
  | { readonly kind: 'uncaught'; readonly error: CapturedError }
  /**
   * Progress. Fire-and-forget and safe to drop — `id` identifies the job it
   * belongs to but never resolves that job's request, which is why it lives
   * here rather than among the responses.
   */
  | {
      readonly kind: 'stage'
      readonly id: number
      readonly stage: PipelineStage
      readonly fraction: number
    }

export type WorkerOutbound = WorkerResponse | WorkerEvent
