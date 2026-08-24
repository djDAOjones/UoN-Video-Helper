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
