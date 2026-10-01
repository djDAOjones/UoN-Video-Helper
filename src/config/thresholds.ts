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

/**
 * How long the worker waits for a save to finish reading before it disposes
 * that job's scratch anyway.
 *
 * A save streams from OPFS to the user's disk and the main thread holds a
 * lease for the length of it, so this is only reached when the reader vanished
 * without releasing — which, since the reader is the tab that owns this
 * worker, essentially means never. Ten minutes because the alternative failure
 * is worse than waiting: a lease that never expires is a user who can never
 * start another job (VH-56).
 */
export const SAVE_LEASE_LIMIT_MS = 600_000

/**
 * How long the interface waits for the worker to acknowledge a job it has
 * stopped waiting on.
 *
 * The watchdog posts `cancel` and rejects immediately, so the promise settles
 * while the worker is still winding down. Start must not re-arm in that
 * window: the next `process` begins by disposing every retained workspace.
 * Bounded because a worker that never answers must not lock the interface out
 * of starting another job — that failure is worse than the one it guards
 * against (VH-75).
 */
export const WORKER_ACKNOWLEDGEMENT_LIMIT_MS = 10_000

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

/**
 * What each audio stage of a job costs, in analysis passes.
 *
 * Pre-flight runs the analysis pass over the whole kept part for the spec 5.4
 * warnings, and times it: that one figure, measured on this file and this
 * device, prices every audio stage of the job (VH-100). A job makes up to
 * eight traversals of the audio — planning's passes A and B, up to three
 * refinements and the re-measure a lowered ceiling forces, pass C during the
 * encode, the decoded-output check — and the estimate used to count two at
 * the probe's three-second rate.
 *
 * Measured 2026-10-01 in headless Chrome on the development MacBook, against
 * that pass, on three real recordings of 130, 335 and 374 s. Taken near the
 * top of the range: an estimate that runs a little long only moves a job
 * towards "keep this tab open".
 */
export const AUDIO_STAGE_PASSES = {
  /** One pass through the whole chain, with or without the meter behind it: 1.6-2.1 measured. */
  chain: 2,
  /**
   * The codec probe's encode and decode, per second of audio it covers: 2.4-2.6
   * measured. It covers at most `CODEC_PROBE`'s windows, four minutes, so on
   * a long recording it is a fixed cost rather than one that grows with it
   * (Codex review).
   */
  codecProbe: 2.5,
} as const

/**
 * How long a file selection waits for the worker before giving up on it.
 *
 * Both are generous on purpose: timing out on a file that would have worked
 * costs the user the job, while waiting costs them a progress message they are
 * already reading. Reading structure is fast, but a multi-gigabyte file on a
 * slow disk is not; the pre-flight then decodes and re-encodes a real sample of
 * it, so it gets half again as long.
 */
export const SELECTION_DEADLINE_MS = {
  inspect: 120_000,
  preflight: 180_000,
} as const

/**
 * Deciding what the picture is mostly made of, spec 6.2 (VH-19).
 *
 * Short windows across the recording rather than its opening. Real lecture
 * captures often begin on a static title or black frame, so five positions are
 * the smallest spread that covers both ends and the body without turning
 * classification into another full-file pass.
 */
export const CONTENT_SAMPLE_WINDOW_FRACTIONS = [0, 0.25, 0.5, 0.75, 1] as const

/** One second catches normal slide changes while keeping the sparse decode cheap. */
export const CONTENT_SAMPLE_WINDOW_SECONDS = 1

/** Ten observations per second resolved motion cleanly in the VH-19 source corpus. */
export const CONTENT_SAMPLE_FRAMES_PER_SECOND = 10

/** Tiny analysis dimensions: enough for gross motion, bounded to 2,304 luma bytes. */
export const CONTENT_SAMPLE_WIDTH = 64
export const CONTENT_SAMPLE_HEIGHT = 36

/**
 * Maximum mean adjacent-frame luma change for an unambiguously static source.
 * The ambiguous band above it deliberately keeps the safer camera bitrate.
 */
export const CONTENT_SCREEN_MAX_MEAN_DIFFERENCE = 0.001

/**
 * Minimum mean adjacent-frame luma change that makes motion unambiguous.
 * Values between this and the screen threshold remain unknown.
 */
export const CONTENT_CAMERA_MIN_MEAN_DIFFERENCE = 0.003

/**
 * Static-looking, high-density video may be a nearly still camera shot rather
 * than slides. Above this density a static source is not called screen.
 */
export const CONTENT_SCREEN_MAX_SOURCE_BITS_PER_PIXEL_PER_FRAME = 0.08


/**
 * How far a shown time estimate is rounded (U-22, VH-109): to what the 3 s
 * probe can honestly claim, which differed by a quarter between two loads of
 * one file. Each band rounds anything below `belowSeconds` to `stepSeconds`;
 * the last band covers everything longer. Under `fewSecondsBelow` it reads
 * "a few seconds". We chose these; VH-116 may narrow the probe's spread.
 */
export const ESTIMATE_ROUNDING = {
  fewSecondsBelow: 5,
  bands: [
    { belowSeconds: 60, stepSeconds: 10 },
    { belowSeconds: 600, stepSeconds: 60 },
    { belowSeconds: Number.POSITIVE_INFINITY, stepSeconds: 300 },
  ],
} as const

/**
 * Where the encode's progress is announced (VH-109), as fractions of the
 * stage. Each names its own words in `ui/progress.ts`, which must change with
 * it — a quarter is said as "a quarter done".
 */
export const PROGRESS_MILESTONE_FRACTIONS = [0.25, 0.5, 0.75] as const

/**
 * How recently an empty file at a save destination must have been written to
 * count as the one the save picker made (VH-110). The picker creates it as
 * the user confirms, and the save reads it straight after, so seconds is
 * ample; an empty file the user chose to replace is older, and is never
 * removed when a save is stopped. We chose it.
 */
export const PICKER_CREATED_WITHIN_MS = 10_000
