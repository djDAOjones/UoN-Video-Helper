/**
 * Frame-rate conform decisions, spec section 6.3.
 *
 * Separated from `inspect.ts` because this is where the judgement lives and
 * it is pure: given a measured rate, which constant rate do we output, and
 * what does that cost? Everything here is unit-tested in Node; the Mediabunny
 * calls that feed it are not.
 */

/**
 * Spec section 6.3: "rounded to the nearest standard value (24/25/30/50/60)".
 *
 * Taken literally, and the literal reading has two consequences worth knowing
 * about — both surfaced through {@link conformCost} rather than silently
 * absorbed:
 *
 *  - NTSC rates are not in the set. A 29.97 fps source conforms to 30, which
 *    duplicates about 1 frame in 1000. Sync is unaffected because output
 *    frames are chosen by timestamp, not by index, but the frame count grows.
 *  - Low-rate sources snap upward. A 15 fps screen recording conforms to 24,
 *    duplicating 37.5% of frames for no visible benefit. Teams and Zoom do
 *    drop to 15-20 fps under load, so this is not hypothetical.
 */
export const STANDARD_FRAME_RATES = [24, 25, 30, 50, 60] as const

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

/** What conforming `sourceFrameRate` to a constant standard rate will cost. */
export function conformCost(sourceFrameRate: number): ConformDecision {
  const frameRate = nearestStandardFrameRate(sourceFrameRate)
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
