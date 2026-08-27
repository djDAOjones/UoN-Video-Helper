/**
 * The decoded-output audio contract from spec section 13 criterion 2.
 *
 * This is deliberately separate from the advisory warning thresholds in
 * `audio/warnings.ts`: a result may be worth warning about before it becomes
 * unacceptable, but a finished file either satisfies the release invariant or
 * it must not be reported as successful.
 */

import {
  INTEGRATED_TOLERANCE_LU,
  TARGET_INTEGRATED_LUFS,
  TRUE_PEAK_CEILING_DBTP,
} from '../config/audio'

export type OutputAudioFailureCode =
  | 'missing-audio'
  | 'invalid-measurement'
  | 'loudness-out-of-range'
  | 'true-peak-exceeded'

export type OutputAudioVerification =
  | { readonly ok: true }
  | {
      readonly ok: false
      readonly code: OutputAudioFailureCode
      readonly integratedLufs: number | null
      readonly truePeakDbtp: number | null
    }

/**
 * Checks a decoded finished file against the hard audio invariant.
 *
 * @param measurement - The decoded output measurements, or `null` when the
 * expected audio track is absent.
 * @returns A fail-closed verdict suitable for both the worker and acceptance
 * harness.
 */
export function verifyOutputAudio(
  measurement: { readonly integratedLufs: number; readonly truePeakDbtp: number } | null,
): OutputAudioVerification {
  if (!measurement) {
    return { ok: false, code: 'missing-audio', integratedLufs: null, truePeakDbtp: null }
  }

  const { integratedLufs, truePeakDbtp } = measurement
  if (!Number.isFinite(integratedLufs) || !Number.isFinite(truePeakDbtp)) {
    return {
      ok: false,
      code: 'invalid-measurement',
      integratedLufs: Number.isFinite(integratedLufs) ? integratedLufs : null,
      truePeakDbtp: Number.isFinite(truePeakDbtp) ? truePeakDbtp : null,
    }
  }

  if (Math.abs(integratedLufs - TARGET_INTEGRATED_LUFS) > INTEGRATED_TOLERANCE_LU) {
    return { ok: false, code: 'loudness-out-of-range', integratedLufs, truePeakDbtp }
  }

  if (truePeakDbtp > TRUE_PEAK_CEILING_DBTP) {
    return { ok: false, code: 'true-peak-exceeded', integratedLufs, truePeakDbtp }
  }

  return { ok: true }
}
