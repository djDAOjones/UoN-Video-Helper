/**
 * Frame-rate conform decisions, spec section 6.3.
 *
 * Separated from `inspect.ts` because this is where the judgement lives and
 * it is pure: given a measured rate, which constant rate do we output, and
 * what does that cost? Everything here is unit-tested in Node; the Mediabunny
 * calls that feed it are not.
 */

/**
 * Spec section 6.3: the standard values a rate may be rounded *to*.
 *
 * NTSC rates are deliberately not in the set. A 29.97 fps source conforms to
 * 30, which duplicates about 1 frame in 1000; sync is unaffected because
 * output frames are chosen by timestamp rather than by index, but the frame
 * count grows. That cost is surfaced through {@link conformCost} rather than
 * silently absorbed.
 *
 * The rule does NOT apply below the lowest value here — see
 * {@link conformedFrameRate}.
 */
export const STANDARD_FRAME_RATES = [24, 25, 30, 50, 60] as const

/** The lowest rate the rounding rule applies at. Derived, so reordering the set above cannot break it. */
const LOWEST_STANDARD_FRAME_RATE = Math.min(...STANDARD_FRAME_RATES)

export interface ConformDecision {
  /** The constant rate the output will run at. */
  readonly frameRate: number
  /** The rate measured from the source, before rounding. */
  readonly sourceFrameRate: number
  /**
   * Fraction of output frames that will not correspond one-to-one with a
   * source frame: positive means duplication, negative means frames dropped.
   */
  readonly frameDeltaRatio: number
}

/** Nearest standard rate, by absolute difference; ties resolve to the lower rate. */
export function nearestStandardFrameRate(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new RangeError(`Frame rate must be a positive number, got ${rate}`)
  }
  let best: number = STANDARD_FRAME_RATES[0]
  let bestDistance = Math.abs(rate - best)
  for (const candidate of STANDARD_FRAME_RATES) {
    const distance = Math.abs(rate - candidate)
    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }
  return best
}

/**
 * The constant rate the output runs at, spec section 6.3.
 *
 * Nearest standard value — but **never upward from below the lowest one**.
 * Teams records a rock-solid 16.000 fps, and the literal round-to-nearest rule
 * made that 24: half the output frames duplicated, for a file that gains
 * nothing visible and grows. Such a source is conformed to its own measured
 * rate instead (VH-24; spec 6.3 reconciled 2026-08-25).
 *
 * Above the floor the rule is unchanged, which is what a PowerPoint export at
 * 30.303 fps wants — 30 is a real standard rate and a 1% drop, not a 50%
 * invention. The output is still constant-rate either way; that is the part
 * MP4 compatibility and the branding conform actually depend on.
 */
export function conformedFrameRate(sourceFrameRate: number): number {
  if (!Number.isFinite(sourceFrameRate) || sourceFrameRate <= 0) {
    throw new RangeError(`Frame rate must be a positive number, got ${sourceFrameRate}`)
  }
  if (sourceFrameRate < LOWEST_STANDARD_FRAME_RATE) return sourceFrameRate
  return nearestStandardFrameRate(sourceFrameRate)
}

/** What conforming `sourceFrameRate` to a constant rate will cost. */
export function conformCost(sourceFrameRate: number): ConformDecision {
  const frameRate = conformedFrameRate(sourceFrameRate)
  return {
    frameRate,
    sourceFrameRate,
    frameDeltaRatio: (frameRate - sourceFrameRate) / sourceFrameRate,
  }
}

/**
 * Constant-frame-rate timestamps for a given duration, in microseconds.
 *
 * WebCodecs works in microseconds, so the grid is built there and rounded
 * once. Computing each timestamp from its index rather than accumulating a
 * step keeps the error bounded at one microsecond instead of growing with
 * frame count — over an hour at 60 fps that is the difference between
 * imperceptible and a visible drift.
 */
export function frameTimestampUs(frameIndex: number, frameRate: number): number {
  return Math.round((frameIndex * 1_000_000) / frameRate)
}

/** Number of output frames a duration yields at a constant rate. */
export function frameCountFor(durationSeconds: number, frameRate: number): number {
  return Math.max(0, Math.round(durationSeconds * frameRate))
}
