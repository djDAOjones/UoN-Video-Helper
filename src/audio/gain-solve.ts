/**
 * Solving the single linear gain of spec section 5.2 step 5.
 *
 * Step 5 is one constant gain across the whole file — the transparent
 * equivalent of a two-pass linear normalisation — and it has to land the
 * finished file on {@link TARGET_INTEGRATED_LUFS}. The difficulty is that step
 * 6, the true-peak limiter, comes *after* it and takes some of it back.
 *
 * Solving against a chain that does not limit therefore over-states the gain
 * that will survive. On synthesised fixtures with a modest crest factor the
 * error is invisible; on a real lecture, where peaks already sit near full
 * scale and a +7 dB gain drives them 5 dB over the ceiling, it was measured at
 * 0.45 LU and rose past 2 LU on quiet sources (VH-50). The contract is
 * +/-0.5 LU, so that is a release failure hiding behind a green harness.
 *
 * The fix is a fixed-point iteration: measure what the real chain leaves, add
 * the shortfall, repeat. It converges from below and never overshoots, because
 * adding gain costs only the small extra limiting that gain provokes.
 *
 * Deliberately expressed over an injected measurement function rather than
 * over audio. The pipeline's measurement is a full decode traversal and the
 * harness's is an in-memory array walk; making both go through this one solver
 * is what stops the harness proving a gain rule the product does not use.
 */

import { GAIN_SOLVE, TARGET_INTEGRATED_LUFS } from '../config/audio'

/**
 * Measures the integrated loudness the chain leaves at a given gain.
 *
 * @param gainDb - The gain to run the chain at, or `null` for the measuring
 *   configuration: steps 2-4 only, no gain and no limiter.
 * @returns Integrated LUFS, or a non-finite value for material with no
 *   measurable loudness.
 */
export type ChainLoudnessMeasurement = (gainDb: number | null) => Promise<number>

export interface GainSolution {
  /** The gain to give the chain, in dB. */
  readonly gainDb: number
  /** Integrated loudness of the unlimited chain — the first estimate's basis. */
  readonly unlimitedLufs: number
  /** What the limiting chain last measured, or `null` if it was never run. */
  readonly measuredLufs: number | null
  /** Refinement traversals actually spent. */
  readonly refinementPasses: number
  /** Whether the last measurement was inside {@link GAIN_SOLVE.toleranceLu}. */
  readonly converged: boolean
}

/**
 * Solves the step 5 gain against the chain that will actually run.
 *
 * @param measure - Runs one traversal of the audio through the chain and
 *   returns the integrated loudness it produced.
 * @returns The gain plus the evidence for it, so a caller can log or assert on
 *   how it was reached rather than trusting the number alone.
 */
export async function solveChainGainDb(
  measure: ChainLoudnessMeasurement,
): Promise<GainSolution> {
  const unlimitedLufs = await measure(null)

  // A source with no measurable loudness (pure silence) gets no gain: lifting
  // silence by 60 dB would produce nothing but noise.
  if (!Number.isFinite(unlimitedLufs)) {
    return {
      gainDb: 0,
      unlimitedLufs,
      measuredLufs: null,
      refinementPasses: 0,
      converged: true,
    }
  }

  let gainDb = TARGET_INTEGRATED_LUFS - unlimitedLufs
  let measuredLufs: number | null = null
  let refinementPasses = 0

  for (let pass = 0; pass < GAIN_SOLVE.maximumRefinementPasses; pass++) {
    const measured = await measure(gainDb)
    refinementPasses++
    // Material that measured a level unlimited but not limited is pathological
    // rather than merely quiet; keep the estimate we have and let the
    // decoded-output check speak.
    if (!Number.isFinite(measured)) break
    measuredLufs = measured

    const errorLu = TARGET_INTEGRATED_LUFS - measured
    if (Math.abs(errorLu) <= GAIN_SOLVE.toleranceLu) {
      return { gainDb, unlimitedLufs, measuredLufs, refinementPasses, converged: true }
    }
    gainDb += errorLu
  }

  return { gainDb, unlimitedLufs, measuredLufs, refinementPasses, converged: false }
}
