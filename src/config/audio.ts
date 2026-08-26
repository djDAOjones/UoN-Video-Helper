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

/**
 * Extra limiter headroom for the AAC round trip.
 *
 * The specification's -2.0 dBTP remains the acceptance ceiling. Lossy
 * encoding can reconstruct a peak a few hundredths of a decibel above its PCM
 * input, so the production limiter aims slightly below that final contract
 * instead of relying on display rounding to call an overshoot safe.
 */
export const LOSSY_ENCODER_TRUE_PEAK_HEADROOM_DB = 0.1

/** Spec section 13, criterion 2: how close the output must land. */
export const INTEGRATED_TOLERANCE_LU = 0.5

/**
 * Bounded chunks used when a container timestamp gap must become explicit PCM.
 *
 * Gaps are programme silence: omitting them compresses loudness, warnings and
 * the macro envelope onto a different clock from the encoded file. A fixed
 * frame bound keeps even an hours-long gap streaming, while the periodic task
 * yield lets a worker process cancellation instead of monopolising its event
 * loop until the whole gap has been synthesised.
 */
export const AUDIO_GAP_FILL = {
  chunkFrames: 4096,
  yieldEveryChunks: 64,
} as const

/**
 * One frame absorbs container-to-sample-rate rounding only.
 *
 * A larger timestamp overlap has no lossless one-dimensional representation:
 * appending it changes sync, while trimming it deletes PCM. The pre-flight
 * therefore rejects material overlap instead of silently choosing either.
 */
export const AUDIO_TIMESTAMP_OVERLAP_TOLERANCE_FRAMES = 1

/**
 * The bounded feedback solve for the single gain in spec section 5.2 step 5.
 *
 * The internal tolerance is tighter than the finished-file acceptance band so
 * the AAC round-trip has headroom. The gain bound prevents a corrupt or
 * pathological measurement from asking the chain for an effectively infinite
 * amplification, while the plateau threshold detects when the limiter has
 * stopped letting additional gain raise the programme level.
 */
export const AUDIO_GAIN_SOLVER = {
  toleranceLu: 0.1,
  maxIterations: 8,
  maxAbsoluteGainDb: 60,
  plateauToleranceLu: 0.01,
} as const

/**
 * Fixed marker used to measure the browser's audio-encoder presentation delay.
 *
 * It is deliberately short and synthetic: the measurement asks only when a
 * known marker reappears after one encode/decode round trip, never how the
 * codec sounds. Keeping the marker away from both ends avoids conflating codec
 * delay with container boundary handling.
 */
export const AUDIO_ENCODER_DELAY_PROBE = {
  sampleRate: 48_000,
  durationSeconds: 0.5,
  markerAtSeconds: 0.2,
  markerDurationSeconds: 0.005,
  markerAmplitude: 0.9,
  detectionThreshold: 0.4,
} as const

/** Spec section 5.2 step 2. Removes rumble and handling noise. */
export const HIGH_PASS_HZ = 60

/**
 * Spec section 5.2 step 3 — the conditional macro-leveller.
 *
 * These six values together are what separate transparent long-term
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
  /** Resolution of the applied gain envelope; 10 Hz is ample at a 1 dB/s slew. */
  envelopeStepSeconds: 0.1,
} as const

/** Spec section 5.2 step 4. Gentle by design — this is not a loudness tool. */
export const COMPRESSOR = {
  ratio: 2,
  thresholdDbfs: -18,
  attackMs: 20,
  releaseMs: 200,
  /** Width of the soft transition around the threshold. */
  kneeDb: 6,
  /** RMS detector window: longer than an audible waveform cycle, shorter than a syllable. */
  detectorMs: 10,
  /** Numerical floor used before converting detector power to decibels. */
  minimumPower: 1e-24,
} as const

/** Spec section 5.2 step 6. */
export const LIMITER = {
  lookAheadMs: 5,
  releaseMs: 50,
  ceilingDbtp: TRUE_PEAK_CEILING_DBTP - LOSSY_ENCODER_TRUE_PEAK_HEADROOM_DB,
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
  /** Distinguishes a measurable floor from continuous narration. */
  minimumGapDepthLu: 10,
  extendedSilenceSeconds: 30,
  extendedSilenceBelowLufs: -60,
  /** Post-processing miss against the target. */
  targetMissedByLu: 1,
} as const
