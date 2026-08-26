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
 * Silence is the honest signal — but only once every long phase actually
 * speaks. The first version of this rested on "the encode loop reports every
 * thirty frames", which was true and insufficient: inspection, the two-pass
 * audio analysis and the post-encode verification each said nothing at all and
 * each scales with the source, so a long job could sit silent for minutes and
 * be cancelled for being slow. That is the duration cap spec section 7
 * disclaims, reintroduced at a lower threshold. All three report now (VH-51).
 *
 * Generous on purpose, and deliberately larger than it needs to be. The figure
 * only has to exceed the longest gap a HEALTHY job can produce, and the two
 * errors are not symmetric: too patient costs a wedged worker some seconds
 * nobody is watching, too impatient destroys work the user was waiting for.
 * Two minutes also matches the bound `main.ts` already allows a standalone
 * inspection of a multi-gigabyte file.
 */
export const WORKER_SILENCE_LIMIT_MS = 120_000

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
