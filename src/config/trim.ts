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

/** How far one arrow-key press moves a trim handle, in seconds. The time fields take anything finer. */
export const TRIM_KEY_STEP_SECONDS = 1

/** How far Page Up or Page Down moves a trim handle, in seconds. */
export const TRIM_PAGE_STEP_SECONDS = 10

/**
 * How long the trim must be still before the device check re-runs for it, in
 * milliseconds. An arrow key held down commits a change per step, and each
 * would otherwise start a pre-flight — decoding and encoding three seconds —
 * only to be superseded by the next.
 */
export const TRIM_RECHECK_DELAY_MS = 500

/**
 * How far past the end of the video a typed time may be and still mean the
 * end, in seconds: half the tenth of a second the time fields show. A
 * 130.46 s video's end reads "2:10.5", and typing back what the page showed
 * must not be refused (Codex review of VH-96).
 */
export const TRIM_FIELD_ROUNDING_SECONDS = 0.05

