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
 * The fix is an iteration: measure what the real chain leaves, correct,
 * repeat. The correction is sized by the chain's measured RESPONSE to gain —
 * how many LU the last decibel bought — once two limited passes have shown
 * it. Adding the bare shortfall, which is the response a chain without a
 * limiter has, is right on a lecture the limiter barely touches and hopeless
 * where the limiter has most of the gain: a 29-minute Teams recording (16 kHz
 * mono, −21.3 LUFS, −1.9 dBTP, loudness range 22 LU) answered the last
 * +0.9 dB with 0.03 LU, three bare corrections stopped at −16.9, and the job
 * was refused after the whole encode (VH-106). Loudness against gain is
 * concave there, so a secant through two points below the target overstates
 * the slope ahead and the step undershoots: it still converges from below and
 * never overshoots, only faster.
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
 * The next correction, from the shortfall and what the chain was last seen to
 * answer a decibel with.
 *
 * Pure, so the rule can be tested without a chain. The response is used only
 * when it is usable: below {@link GAIN_SOLVE.minimumResponseLuPerDb} the
 * secant is noise or the curve is falling, and the bare shortfall is the
 * conservative step. Either way the step is bounded, because a response near
 * the floor would otherwise ask for tens of decibels at once.
 *
 * @param errorLu - Target minus the last measurement; positive means too quiet.
 * @param responseLuPerDb - LU gained per dB between the last two limited
 *   passes, or `null` before there are two.
 * @returns The change to make to the gain, in dB.
 */
export function gainStepDb(errorLu: number, responseLuPerDb: number | null): number {
  const usable = responseLuPerDb !== null && responseLuPerDb >= GAIN_SOLVE.minimumResponseLuPerDb
  const wanted = usable ? errorLu / responseLuPerDb : errorLu
  return Math.max(-GAIN_SOLVE.maximumStepDb, Math.min(GAIN_SOLVE.maximumStepDb, wanted))
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
  /** The previous limited pass, for the response between it and this one. */
  let previous: { readonly gainDb: number; readonly measuredLufs: number } | null = null

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

    const responseLuPerDb =
      previous && gainDb !== previous.gainDb
        ? (measured - previous.measuredLufs) / (gainDb - previous.gainDb)
        : null
    previous = { gainDb, measuredLufs: measured }
    gainDb += gainStepDb(errorLu, responseLuPerDb)
  }

  return { gainDb, unlimitedLufs, measuredLufs, refinementPasses, converged: false }
}
