/**
 * Bounded feedback solve for the audio chain's one constant gain.
 *
 * A linear estimate is only a starting point: the true-peak limiter sits after
 * that gain and can attenuate the result. Each measurement supplied here must
 * therefore traverse the complete chain, including its flush. The solver
 * retains only scalar readings and is agnostic to how the caller streams the
 * source, so repeated passes never require buffering a file in memory.
 */

import { AUDIO_GAIN_SOLVER, TARGET_INTEGRATED_LUFS } from '../config/audio'

export type AudioGainSolveStatus =
  'converged' | 'silence' | 'plateau' | 'infeasible' | 'iteration-limit'

export interface AudioGainSolveResult {
  readonly status: AudioGainSolveStatus
  /** Best finite candidate measured, or zero for silence/invalid input. */
  readonly gainDb: number
  readonly measuredIntegratedLufs: number | null
  /** Complete-chain traversals performed. */
  readonly iterations: number
}

export interface AudioGainSolveOptions {
  readonly targetLufs?: number
  /** Linear pass estimate used for the first complete-chain traversal. */
  readonly initialGainDb?: number
  readonly toleranceLu?: number
  readonly maxIterations?: number
  readonly maxAbsoluteGainDb?: number
  readonly plateauToleranceLu?: number
}

type CompleteChainMeasurement = (gainDb: number) => Promise<number>

function clampGain(gainDb: number, maximum: number): number {
  return Math.max(-maximum, Math.min(maximum, gainDb))
}

/**
 * Finds the best bounded gain using complete-chain loudness feedback.
 *
 * The update is the remaining loudness error in dB. Without limiting this
 * converges in one traversal; under limiting it iterates until the actual
 * output is within tolerance. A response that no longer changes is reported
 * as a plateau, and a required gain outside the configured bound is explicitly
 * infeasible. The best measured candidate is returned on every bounded exit.
 */
export async function solveAudioGain(
  measureCompleteChain: CompleteChainMeasurement,
  options: AudioGainSolveOptions = {},
): Promise<AudioGainSolveResult> {
  const targetLufs = options.targetLufs ?? TARGET_INTEGRATED_LUFS
  const toleranceLu = options.toleranceLu ?? AUDIO_GAIN_SOLVER.toleranceLu
  const maxIterations = options.maxIterations ?? AUDIO_GAIN_SOLVER.maxIterations
  const maxAbsoluteGainDb = options.maxAbsoluteGainDb ?? AUDIO_GAIN_SOLVER.maxAbsoluteGainDb
  const plateauToleranceLu = options.plateauToleranceLu ?? AUDIO_GAIN_SOLVER.plateauToleranceLu

  if (!Number.isFinite(targetLufs)) throw new RangeError('Target loudness must be finite')
  if (!(toleranceLu > 0) || !Number.isFinite(toleranceLu)) {
    throw new RangeError('Gain-solver tolerance must be finite and positive')
  }
  if (!Number.isInteger(maxIterations) || maxIterations < 1) {
    throw new RangeError('Gain-solver iteration bound must be a positive integer')
  }
  if (!(maxAbsoluteGainDb > 0) || !Number.isFinite(maxAbsoluteGainDb)) {
    throw new RangeError('Gain-solver bound must be finite and positive')
  }
  if (!(plateauToleranceLu >= 0) || !Number.isFinite(plateauToleranceLu)) {
    throw new RangeError('Gain-solver plateau tolerance must be finite and non-negative')
  }

  const requestedInitial = options.initialGainDb ?? 0
  let candidate = clampGain(
    Number.isFinite(requestedInitial) ? requestedInitial : 0,
    maxAbsoluteGainDb,
  )
  let previous: { readonly gainDb: number; readonly integratedLufs: number } | null = null
  let best: {
    readonly gainDb: number
    readonly integratedLufs: number
    readonly errorLu: number
  } | null = null

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    const integratedLufs = await measureCompleteChain(candidate)

    // -Infinity is the meter's defined result for digital silence. No amount
    // of gain creates programme content, so zero dB is the only honest plan.
    if (integratedLufs === Number.NEGATIVE_INFINITY) {
      return {
        status: 'silence',
        gainDb: 0,
        measuredIntegratedLufs: integratedLufs,
        iterations: iteration,
      }
    }
    if (!Number.isFinite(integratedLufs)) {
      return {
        status: 'infeasible',
        gainDb: best?.gainDb ?? 0,
        measuredIntegratedLufs: best?.integratedLufs ?? null,
        iterations: iteration,
      }
    }

    const errorLu = Math.abs(targetLufs - integratedLufs)
    if (best === null || errorLu < best.errorLu)
      best = { gainDb: candidate, integratedLufs, errorLu }
    if (errorLu <= toleranceLu) {
      return {
        status: 'converged',
        gainDb: candidate,
        measuredIntegratedLufs: integratedLufs,
        iterations: iteration,
      }
    }

    if (
      previous !== null &&
      candidate !== previous.gainDb &&
      Math.abs(integratedLufs - previous.integratedLufs) <= plateauToleranceLu
    ) {
      return {
        status: 'plateau',
        gainDb: best.gainDb,
        measuredIntegratedLufs: best.integratedLufs,
        iterations: iteration,
      }
    }

    const next = clampGain(candidate + targetLufs - integratedLufs, maxAbsoluteGainDb)
    if (next === candidate) {
      return {
        status: 'infeasible',
        gainDb: best.gainDb,
        measuredIntegratedLufs: best.integratedLufs,
        iterations: iteration,
      }
    }
    previous = { gainDb: candidate, integratedLufs }
    candidate = next
  }

  return {
    status: 'iteration-limit',
    gainDb: best?.gainDb ?? 0,
    measuredIntegratedLufs: best?.integratedLufs ?? null,
    iterations: maxIterations,
  }
}
