/**
 * Audio-quality warnings, spec section 5.4.
 *
 * Every one of these is advisory. They are shown BEFORE processing, phrased as
 * possibilities, and none of them blocks anything — a lecturer who knows their
 * recording is quiet does not need to be stopped, only told.
 *
 * Detection is separated from wording on purpose: the thresholds are the
 * spec's and belong with the numbers, while the sentences a novice reads
 * belong in the UI. Keeping them apart is what lets both be tested.
 */

import { WARNING_THRESHOLDS } from '../config/audio'
import type { AudioAnalysis } from './analyse'

/**
 * How far below the median the quiet passages must fall before the noise floor
 * is treated as measurable at all.
 *
 * A genuinely noisy recording still clears this easily — speech at -20 with
 * room tone at -45 is a 25 LU gap. What it excludes is continuous narration
 * with no pauses, where the "floor" is just the speech itself.
 */
const MINIMUM_GAP_DEPTH_LU = 10

export type AudioWarningCode =
  | 'no-audio'
  | 'clipping'
  | 'very-quiet'
  | 'highly-variable'
  | 'noisy'
  | 'extended-silence'
  | 'target-missed'
  | 'onset-trimmed'

export interface AudioWarning {
  readonly code: AudioWarningCode
  /** Measured values, so the wording can be specific rather than vague. */
  readonly detail: Readonly<Record<string, number>>
}

/** Nth percentile of an unsorted set, nearest-rank. */
function percentile(values: readonly number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * fraction)))
  return sorted[index] ?? Number.NEGATIVE_INFINITY
}

/** Longest continuous run below `threshold`, in seconds. */
function longestRunBelow(
  curve: readonly number[],
  threshold: number,
  stepSeconds: number,
): number {
  let longest = 0
  let run = 0
  for (const value of curve) {
    if (value < threshold) {
      run++
      if (run > longest) longest = run
    } else {
      run = 0
    }
  }
  return longest * stepSeconds
}

/**
 * Warnings derived from the source, before anything is processed.
 *
 * @param analysis - The pass-A measurement, or `null` when the file has no
 *   audio track at all.
 */
export function detectSourceWarnings(analysis: AudioAnalysis | null): AudioWarning[] {
  if (!analysis) return [{ code: 'no-audio', detail: {} }]

  const warnings: AudioWarning[] = []
  const { clippedSampleCount, truePeakDbtp, integratedLufs, loudnessRangeLu } = analysis

  // Either enough individual samples reached the ceiling, or the peak went
  // over full scale outright — the second needs no count to be a problem.
  if (
    clippedSampleCount >= WARNING_THRESHOLDS.clippingSampleCount ||
    truePeakDbtp > 0
  ) {
    warnings.push({
      code: 'clipping',
      detail: { samples: clippedSampleCount, truePeakDbtp },
    })
  }

  if (Number.isFinite(integratedLufs) && integratedLufs < WARNING_THRESHOLDS.veryQuietBelowLufs) {
    warnings.push({ code: 'very-quiet', detail: { integratedLufs } })
  }

  if (loudnessRangeLu > WARNING_THRESHOLDS.highlyVariableAboveLraLu) {
    warnings.push({ code: 'highly-variable', detail: { loudnessRangeLu } })
  }

  // The quietest parts of the recording. If even those sit above -50 LUFS,
  // something is audible in the gaps — room tone, air conditioning, a fan.
  //
  // Guarded, because the rule taken literally misfires. A recording with no
  // pauses at all has a 10th percentile close to its own speech level, which
  // is far above -50, and would be accused of background noise it may not
  // have. There has to be a gap before a floor can be measured in it. Spec 5.4
  // dropped pumping detection for exactly this reason — a false accusation is
  // worse than silence — and the same judgement applies here.
  const audible = analysis.shortTermLufs.filter((value) => Number.isFinite(value))
  if (audible.length > 0) {
    const noiseFloor = percentile(audible, 0.1)
    const median = percentile(audible, 0.5)
    const hasMeasurableGaps = median - noiseFloor >= MINIMUM_GAP_DEPTH_LU

    if (hasMeasurableGaps && noiseFloor > WARNING_THRESHOLDS.noisyAboveLufs) {
      warnings.push({ code: 'noisy', detail: { noiseFloorLufs: noiseFloor, gapDepthLu: median - noiseFloor } })
    }

    const silence = longestRunBelow(
      analysis.shortTermLufs,
      WARNING_THRESHOLDS.extendedSilenceBelowLufs,
      analysis.stepSeconds,
    )
    if (silence > WARNING_THRESHOLDS.extendedSilenceSeconds) {
      warnings.push({ code: 'extended-silence', detail: { seconds: silence } })
    }
  }

  return warnings
}

/**
 * Encoder-delay compensation discarded audio that was not silence.
 *
 * Not a spec 5.4 row: it describes something the tool DID, not something the
 * recording is. It exists because `AGENTS.md` forbids losing content quietly,
 * and until VH-55's second half lands the compensation genuinely costs the
 * first few tens of milliseconds (review R-03).
 *
 * @param discarded - What `AudioTimelineShift` threw away.
 * @param sampleRate - Needed to turn a frame count into something sayable.
 */
export function detectOnsetWarning(
  discarded: { readonly frames: number; readonly peakDbfs: number },
  sampleRate: number,
): AudioWarning | null {
  if (discarded.frames === 0) return null
  if (!(discarded.peakDbfs > WARNING_THRESHOLDS.onsetTrimmedAboveDbfs)) return null
  return {
    code: 'onset-trimmed',
    detail: {
      milliseconds: Math.round((discarded.frames / sampleRate) * 1000),
      peakDbfs: Math.round(discarded.peakDbfs * 10) / 10,
    },
  }
}

/**
 * The one warning that can only be known afterwards, spec 5.4's last row.
 *
 * @param outputIntegratedLufs - Measured loudness of the finished content.
 * @param targetLufs - What it was aiming for.
 */
export function detectOutputWarning(
  outputIntegratedLufs: number,
  targetLufs: number,
): AudioWarning | null {
  if (!Number.isFinite(outputIntegratedLufs)) return null
  const missedBy = Math.abs(outputIntegratedLufs - targetLufs)
  if (missedBy <= WARNING_THRESHOLDS.targetMissedByLu) return null
  return {
    code: 'target-missed',
    detail: { integratedLufs: outputIntegratedLufs, missedBy },
  }
}
