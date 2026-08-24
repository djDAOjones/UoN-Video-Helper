/**
 * Audio processing configuration.
 *
 * Every value here is a **project choice** traceable to a numbered section of
 * `docs/01-specification.md`, and every one is tuneable in principle. That is
 * the line between this file and the DSP modules: constants defined by
 * ITU-R BS.1770-4 and EBU Tech 3342 (the -0.691 offset, the -70 LUFS absolute
 * gate, the 400 ms block) live in `src/audio/`, because nobody may tune them.
 */

/** Spec section 5.1. Speech-led programme target; suits laptop and phone speakers. */
export const TARGET_INTEGRATED_LUFS = -16

/**
 * Spec section 5.1, revised from the brief's -3 dBTP.
 *
 * Loudness is set by the LUFS target, not the ceiling, so a lower ceiling does
 * not make the video quieter — it makes the limiter work harder. -2.0 leaves
 * roughly 1 dB for the overshoot a downstream lossy re-encode introduces,
 * while touching the speech less than -3 would.
 */
export const TRUE_PEAK_CEILING_DBTP = -2.0

/** Spec section 13, criterion 2: how close the output must land. */
export const INTEGRATED_TOLERANCE_LU = 0.5

/** Spec section 5.2 step 2. Removes rumble and handling noise. */
export const HIGH_PASS_HZ = 60

/**
 * Spec section 5.2 step 3 — the conditional macro-leveller.
 *
 * These five values together are what separate transparent long-term
 * correction from audible pumping. See rationale section 3.3: applying a
 * moving-window correction unconditionally, with a short window and no rate
 * limit, *is* the aggressive AGC the brief was right to worry about.
 */
export const MACRO_LEVEL = {
  /** Skip entirely below this. Most single-speaker recordings never trigger. */
  applyAboveLraLu: 9,
  /** Long enough to track a speaker moving away; far too slow to chase syllables. */
  windowSeconds: 15,
  /** Maximum correction in either direction. */
  clampDb: 6,
  /** The single most important value here: audible pumping is a fast level change. */
  slewDbPerSecond: 1,
  /** Freeze below this so pauses and room tone are never turned up. */
  freezeBelowLufs: -45,
} as const

/** Spec section 5.2 step 4. Gentle by design — this is not a loudness tool. */
export const COMPRESSOR = {
  ratio: 2,
  thresholdDbfs: -18,
  attackMs: 20,
  releaseMs: 200,
  softKnee: true,
} as const

/** Spec section 5.2 step 6. */
export const LIMITER = {
  lookAheadMs: 5,
  releaseMs: 50,
  ceilingDbtp: TRUE_PEAK_CEILING_DBTP,
} as const

/**
 * Open decision D3. Spec section 4.4 assumes a hard cut with a short fade at
 * each branding/content boundary — simplest, most predictable, and impossible
 * to get audibly wrong. Alternatives are a crossfade or ducking the bed.
 */
export const BOUNDARY_FADE_MS = 100

/**
 * Spec section 5.4. Advisory only: every one of these is shown before
 * processing and none of them blocks it.
 */
export const WARNING_THRESHOLDS = {
  /** Clipping: this many samples at or above the level below. */
  clippingSampleCount: 10,
  clippingDbtp: -0.1,
  veryQuietBelowLufs: -35,
  highlyVariableAboveLraLu: 15,
  /** Noise floor taken as the 10th-percentile short-term value. */
  noisyAboveLufs: -50,
  extendedSilenceSeconds: 30,
  extendedSilenceBelowLufs: -60,
  /** Post-processing miss against the target. */
  targetMissedByLu: 1,
} as const
