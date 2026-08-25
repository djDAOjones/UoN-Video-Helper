/**
 * Pre-flight thresholds, spec section 7.
 *
 * These are the numbers spec section 7.4 says will be *replaced by
 * measurement* on real University hardware (open decision D8). They are
 * starting positions, not findings, and they live here so answering D8 is a
 * three-line change.
 */

/** Spec 7.2: require this multiple of the projected output size in free storage. */
export const STORAGE_HEADROOM_MULTIPLE = 2.5

/**
 * How long the worker may say nothing during a job before the main thread
 * gives up on it, in milliseconds.
 *
 * This replaced a one-hour bound on the whole job (VH-38), which was a duration
 * cap of exactly the kind spec section 7 opens by disclaiming — and it rejected
 * without telling the worker, so the job ran on, finished, and held its output
 * in memory while the user was told it had failed.
 *
 * Silence is the honest signal. `pipeline.ts` reports a stage every thirty
 * frames, so even the slowest device measured (6.3x real time) speaks several
 * times a second; a minute of nothing means the worker is wedged, not busy.
 * Generous on purpose: the figure only has to be longer than the longest gap a
 * HEALTHY job can produce, and being wrong in the impatient direction would
 * cancel real work.
 */
export const WORKER_SILENCE_LIMIT_MS = 60_000

/** Spec 7.1: seconds of the user's actual file to decode and re-encode when calibrating. */
export const CALIBRATION_PROBE_SECONDS = 3

/** Spec 7.3 bands, in seconds of estimated processing time. */
export const ESTIMATE_BANDS = {
  /** Below this: proceed, showing the estimate. */
  proceedBelowSeconds: 20 * 60,
  /** Between the two: warn, and say to keep the tab open. */
  discourageAboveSeconds: 60 * 60,
} as const

/**
 * A probe short enough to be cheap is also short enough to be noisy — encoder
 * startup, shader compilation and thermal state all land in the first second.
 * Throughput below this is treated as unmeasured rather than believed.
 */
export const MINIMUM_CREDIBLE_PROBE_FRAMES = 10
