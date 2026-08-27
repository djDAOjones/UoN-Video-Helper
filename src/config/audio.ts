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
  /** Envelope resolution. 10 Hz is ample for something that moves at 1 dB/s. */
  envelopeStepSeconds: 0.1,
} as const

/** Spec section 5.2 step 4. Gentle by design — this is not a loudness tool. */
export const COMPRESSOR = {
  ratio: 2,
  thresholdDbfs: -18,
  attackMs: 20,
  releaseMs: 200,
  /**
   * Width of the soft knee, in dB, centred on the threshold.
   *
   * Spec 5.2 step 4 asks for a soft knee; this is how wide it is. It replaces
   * a `softKnee: true` that nothing ever read while `compressor.ts` carried
   * its own literal 6 — a boolean that described the shape and a number that
   *decided it, in different files (VH-68).
   */
  kneeDb: 6,
  /**
   * RMS detector window. Long enough to ignore the waveform itself — a 100 Hz
   * cycle is 10 ms, and anything below that has been high-passed away — and
   * short enough to follow syllables.
   */
  detectorMs: 10,
} as const

/**
 * Solving spec section 5.2 step 5's single linear gain.
 *
 * The gain must land the *finished* file on target, and step 6 — the limiter —
 * sits after it. On real speech, whose peaks are already close to full scale,
 * the limiter takes back a few tenths of a LU that a measurement of steps 2-4
 * alone never sees. VH-50: a real lecture came out 0.75 LU low while every
 * synthetic fixture passed, because none of them made the limiter work.
 *
 * So the gain is refined against the chain that actually runs. Correcting by
 * the measured error converges quickly — raising the gain by a tenth of a
 * decibel provokes only a small fraction of that in extra limiting — so the
 * loop is bounded rather than run to convergence.
 */
export const GAIN_SOLVE = {
  /** Close enough to stop. Well inside the +/-0.5 LU release contract. */
  toleranceLu: 0.1,
  /**
   * Extra audio-only traversals the refinement may cost. A traversal is around
   * 3.6 s for an hour of audio and the loop stops as soon as it is inside
   * tolerance, so an easy source pays two and only a heavily-limited one pays
   * the third. `AMCS3059` — the hottest source in the corpus, and the one the
   * limiter works hardest on — was still 0.18 LU out after two.
   * The decoded-output check is the backstop if a pathological source needs
   * more than three.
   */
  maximumRefinementPasses: 3,
} as const

/**
 * Headroom the limiter holds below the published ceiling, for OUR OWN encode.
 *
 * The ceiling above governs the finished file. The limiter governs the signal
 * handed to `AudioEncoder`, and AAC-LC sits between them: an MDCT codec does
 * not preserve peak level, so a stream limited to exactly -2.0 dBTP decodes
 * above it. Measured on four real lectures at the "best quality" preset
 * (2026-08-27, VH-50), the encode raised true peak by:
 *
 *   AMCS3059  44.1 kHz stereo  0.02 dB      MLAC3139  44.1 kHz stereo  0.09 dB
 *   AMCS2007  44.1 kHz stereo  0.10 dB      CULT1027  48 kHz mono      0.39 dB
 *
 * Every one of them therefore breached spec 13 criterion 2 in the delivered
 * file while the limiter had done exactly what it promised. Resampling was
 * ruled out as the cause: the worst of the four is the one file that needs no
 * resampling at all.
 *
 * 1.0 dB rather than the 0.39 measured, because the trade is asymmetric.
 * Too little headroom means a job the user is REFUSED — the decoded-output
 * check fails closed. Too much means a decibel more gain reduction on the
 * loudest transients and nothing else: the target loudness is solved after the
 * limiter, so nothing gets quieter. 1.0 dB is also the customary allowance
 * before a lossy encode rather than a figure fitted to four files.
 *
 * This does not spend the ceiling's own downstream allowance. Spec 5.1 keeps
 * -2.0 to absorb EchoVideo's and YouTube's re-encode; this absorbs ours.
 */
export const ENCODE_TRUE_PEAK_HEADROOM_DB = 1.0

/** Spec section 5.2 step 6. */
export const LIMITER = {
  lookAheadMs: 5,
  releaseMs: 50,
  /** Below the published ceiling; see {@link ENCODE_TRUE_PEAK_HEADROOM_DB}. */
  ceilingDbtp: TRUE_PEAK_CEILING_DBTP - ENCODE_TRUE_PEAK_HEADROOM_DB,
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
  /**
   * Peak level at which onset trimmed by encoder-delay compensation counts as
   * real content rather than room tone.
   *
   * The compensation discards whatever falls before timestamp zero — about
   * 44 ms for AAC. Measured across the real corpus (2026-08-27, VH-55), three
   * files carry energy in that window: two near -26 dBFS and one near -48.
   * -50 catches all three and leaves a genuine noise floor alone.
   */
  onsetTrimmedAboveDbfs: -50,
} as const

/**
 * How far below the median the quiet passages must fall before the noise floor
 * is treated as measurable at all.
 *
 * A genuinely noisy recording still clears this easily — speech at -20 with
 * room tone at -45 is a 25 LU gap. What it excludes is continuous narration
 * with no pauses, where the "floor" is just the speech itself.
 */
export const MINIMUM_GAP_DEPTH_LU = 10
