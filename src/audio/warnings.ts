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

import { HEAVY_LIMITING_LU, MINIMUM_GAP_DEPTH_LU, WARNING_THRESHOLDS } from '../config/audio'
import type { KeptSilence } from '../media/audio-plan'
import type { Shortfall } from '../media/ends-early'
import type { AudioAnalysis } from './analyse'

export type AudioWarningCode =
  | 'cut-short'
  | 'ends-early'
  | 'no-audio'
  | 'decode-damage'
  | 'clipping'
  | 'very-quiet'
  | 'highly-variable'
  | 'noisy'
  | 'extended-silence'
  | 'target-missed'
  | 'metadata-lost'
  | 'heavy-limiting'

/**
 * Why there is no audio to level (VH-206): the file has no audio track, or
 * the part kept holds less sound than one of the meter's gating blocks
 * (VH-185), or the whole video does, untrimmed (VH-213). One spec 5.4 row and
 * one outcome, a new video with no audio, so one code; the cause decides the
 * words, since "check the recording" is the wrong way forward for a person
 * who hears sound in the part they kept, and "keep more" is for a trim.
 */
export type NoAudioReason = 'no-track' | 'kept-too-little' | 'whole-too-little'

export interface AudioWarning {
  readonly code: AudioWarningCode
  /** Measured values, so the wording can be specific rather than vague. */
  readonly detail: Readonly<Record<string, number>>
  /** The moments a warning is about, in source seconds, earliest first: decode damage's (VH-122). */
  readonly atSeconds?: readonly number[]
  /** Why there is no audio: the no-audio warning's, and only its (VH-206). */
  readonly reason?: NoAudioReason
}

/** Nth percentile of an ascending set, nearest-rank. */
function percentile(ascending: Float64Array, fraction: number): number {
  const index = Math.min(
    ascending.length - 1,
    Math.max(0, Math.round((ascending.length - 1) * fraction)),
  )
  return ascending[index] ?? Number.NEGATIVE_INFINITY
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
 * @param analysis - The pass-A measurement; a {@link KeptSilence} when the part
 *   kept, trimmed or whole, holds too little sound to level, none decoded
 *   included (VH-185, VH-213); or `null` when the file has no audio track at all.
 * @param soundShort - Where the sound stops short of what the file's index
 *   declares (VH-139, `media/ends-early.ts`), or `null` when it does not.
 * @param fileCutShort - Whether a Matroska or WebM file's own bytes show it
 *   cut short (VH-158, `media/matroska-cut.ts`), which has no index to name
 *   the times by.
 */
export function detectSourceWarnings(
  analysis: AudioAnalysis | KeptSilence | null,
  soundShort: Shortfall | null = null,
  fileCutShort = false,
): AudioWarning[] {
  // First of all: the file itself is incomplete, and every row below measures
  // only what arrived. The detail is in source seconds, as decode damage's
  // times are, so the note names the times the trim's fields show.
  const cutShort: AudioWarning[] = fileCutShort ? [{ code: 'cut-short', detail: {} }] : []
  const endsEarly: AudioWarning[] = soundShort
    ? [{ code: 'ends-early', detail: { stopsAtSeconds: soundShort.stopsAtSeconds, endSeconds: soundShort.endSeconds } }]
    : []
  // A kept part whose sound the file declares and never delivers is cut
  // short, not silent: saying "no sound" there would name the wrong cause.
  // Otherwise the cause is said too: a track with too little kept, whose
  // recovery is to keep more, is not a file with none (VH-206), and a whole
  // video with too little has no more to keep (VH-213).
  if (!analysis || 'silent' in analysis) {
    const reason: NoAudioReason = !analysis
      ? 'no-track'
      : analysis.whole
        ? 'whole-too-little'
        : 'kept-too-little'
    return [...cutShort, ...(endsEarly.length > 0 ? endsEarly : [{ code: 'no-audio' as const, detail: {}, reason }])]
  }

  const warnings: AudioWarning[] = [...cutShort, ...endsEarly]
  const { clippedSampleCount, truePeakDbtp, integratedLufs, loudnessRangeLu } = analysis

  // First, because it is what the tool did rather than what it measured, and
  // because it is why none of the rows below hears the burst: before VH-122,
  // one corrupt frame raised the clipping and highly-variable rows on a
  // recording that had neither (VH-115).
  const damage = analysis.damageSilencedAtSeconds ?? []
  if (damage.length > 0) {
    warnings.push({ code: 'decode-damage', detail: { moments: damage.length }, atSeconds: damage })
  }

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
  //
  // Sorted once, for both percentiles below. The curve holds a value every
  // 10 ms — 360,000 for an hour — and sorting it twice with a comparator cost
  // about 260 ms where one typed-array sort, numeric by default, costs 30
  // (VH-99).
  const audible = Float64Array.from(
    analysis.shortTermLufs.filter((value) => Number.isFinite(value)),
  ).sort()
  if (audible.length > 0) {
    const noiseFloor = percentile(audible, 0.1)
    const median = percentile(audible, 0.5)
    const hasMeasurableGaps = median - noiseFloor >= MINIMUM_GAP_DEPTH_LU

    if (hasMeasurableGaps && noiseFloor > WARNING_THRESHOLDS.noisyAboveLufs) {
      warnings.push({ code: 'noisy', detail: { noiseFloorLufs: noiseFloor, gapDepthLu: median - noiseFloor } })
    }

  }

  // Outside the `audible` guard, deliberately. That guard exists so a
  // recording with no pauses is not accused of background noise it may not
  // have — a judgement about the NOISE test. Applying it here meant an
  // entirely silent track, whose every short-term value is -Infinity, left
  // `audible` empty and could never raise the one warning that describes it
  // (VH-68). Silence is exactly what this row is for.
  const silence = longestRunBelow(
    analysis.shortTermLufs,
    WARNING_THRESHOLDS.extendedSilenceBelowLufs,
    analysis.stepSeconds,
  )
  if (silence > WARNING_THRESHOLDS.extendedSilenceSeconds) {
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

/**
 * What producing the file cost, spec 5.4's post-processing rows, in the order
 * the finished video shows them: heavy limiting first, since it asks something
 * of the user before they save (VH-193, the owner's 1A), then the carried
 * metadata.
 *
 * @param produced.limiterBiteLu - The plan's measured bite, never predicted,
 *   or `null` when none was measured.
 * @param produced.metadataCarried - Whether the file's tags were carried across.
 */
export function detectProductionWarnings(produced: {
  readonly limiterBiteLu: number | null
  readonly metadataCarried: boolean
}): AudioWarning[] {
  const found: AudioWarning[] = []
  const { limiterBiteLu } = produced
  if (limiterBiteLu !== null && limiterBiteLu > HEAVY_LIMITING_LU) {
    found.push({ code: 'heavy-limiting', detail: { limiterBiteLu } })
  }
  if (!produced.metadataCarried) found.push({ code: 'metadata-lost', detail: {} })
  return found
}
