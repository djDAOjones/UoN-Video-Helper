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

import { ABRUPT_AUDIO_START, WARNING_THRESHOLDS } from '../config/audio'
import type { AudioAnalysis } from './analyse'

export type AudioWarningCode =
  | 'no-audio'
  | 'abrupt-start'
  | 'clipping'
  | 'very-quiet'
  | 'highly-variable'
  | 'noisy'
  | 'extended-silence'
  | 'target-missed'

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
  startupSeconds: number,
): number {
  let longest = 0
  let runStart = -1
  for (let i = 0; i < curve.length; i++) {
    const value = curve[i]!
    if (value < threshold) {
      if (runStart < 0) runStart = i
      const represented = (i - runStart + 1) * stepSeconds
      // Every short-term point represents a full overlapping window. A run of
      // N points therefore spans the window pre-roll plus N curve steps,
      // whether it begins at file start or in the middle of the programme.
      longest = Math.max(longest, startupSeconds + represented)
    } else {
      runStart = -1
    }
  }
  return longest
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
  const { clippedSampleCount, truePeakDbtp, integratedLufs, loudnessRangeLu, leadingRmsDbfs } =
    analysis

  if (leadingRmsDbfs >= ABRUPT_AUDIO_START.atOrAboveDbfs) {
    warnings.push({ code: 'abrupt-start', detail: { leadingRmsDbfs } })
  }

  // Either enough individual samples reached the ceiling, or the peak went
  // over full scale outright — the second needs no count to be a problem.
  if (clippedSampleCount >= WARNING_THRESHOLDS.clippingSampleCount || truePeakDbtp > 0) {
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
    const hasMeasurableGaps = median - noiseFloor >= WARNING_THRESHOLDS.minimumGapDepthLu

    if (hasMeasurableGaps && noiseFloor > WARNING_THRESHOLDS.noisyAboveLufs) {
      warnings.push({
        code: 'noisy',
        detail: { noiseFloorLufs: noiseFloor, gapDepthLu: median - noiseFloor },
      })
    }
  }

  // A short-term value represents a full window, not merely one curve step.
  // Attribute the otherwise-unrepresented window pre-roll to every run, so a
  // 30.00 s gap stays below the strict threshold while 30.01 s crosses it.
  // This also lets an all-silent curve of -Infinity values reach the check
  // without making it "audible".
  const startupSeconds = Math.max(
    0,
    analysis.durationSeconds - analysis.shortTermLufs.length * analysis.stepSeconds,
  )
  const silence = longestRunBelow(
    analysis.shortTermLufs,
    WARNING_THRESHOLDS.extendedSilenceBelowLufs,
    analysis.stepSeconds,
    startupSeconds,
  )
  const boundary = WARNING_THRESHOLDS.extendedSilenceSeconds
  const comparisonEpsilon = Number.EPSILON * Math.max(1, silence, boundary) * 4
  if (silence - boundary > comparisonEpsilon) {
    warnings.push({ code: 'extended-silence', detail: { seconds: silence } })
  }

  return warnings
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
