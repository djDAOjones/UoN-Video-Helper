/**
 * Trimming the ends of the source (VH-30, VH-95).
 *
 * The one cut the conveyor allows: unwanted material off the start and the
 * end. Cutting from the middle stays out, so there is no number here for it.
 */

/**
 * The shortest video a trim may keep, in seconds.
 *
 * Set by the meter rather than by taste: short-term loudness is a 3 s window
 * (BS.1770-4 via EBU Tech 3341), and the macro-leveller and the source
 * warnings both read that curve. A shorter keep measures on too little to
 * level honestly. The closing build needs only 1 s of picture, and a keep
 * shorter than that is handled already by holding a freeze frame.
 */
export const KEPT_MIN_SECONDS = 3

/**
 * How close to either end of the file a cut may fall and still count as not
 * cutting there, in seconds.
 *
 * A trim the user never moved arrives as exactly 0 and the duration, but a
 * handle nudged back to the edge can come back a rounding away from it. Well
 * under one frame at any rate the app accepts, so no picture is kept or lost
 * by the tolerance.
 */
export const KEPT_EDGE_TOLERANCE_SECONDS = 0.001
