/**
 * The pre-flight verdict, spec section 7.3.
 *
 * Pure: given what was measured, decide what to do. Every input arrives from
 * `capability.ts` or `probe.ts`, both of which need a browser; keeping the
 * decision separate means the part that is easy to get subtly wrong is the
 * part that is fully tested.
 */

import type { ContentClass, OutputShape, PresetId } from '../config/presets'
import { ESTIMATE_BANDS, STORAGE_HEADROOM_MULTIPLE } from '../config/thresholds'
import type { AudioWarning } from '../audio/warnings'
import type { CapabilityReport, EncodeSupport } from './capability'
import type { ProbeFailureStage, ProbeResult, VideoProbeStatus } from './probe'

/** Spec 7.3. Ordered by severity: a block always wins, a proceed never does. */
export type PreflightOutcome = 'block' | 'discourage' | 'warn' | 'proceed'

export type PreflightReasonCode =
  | 'insecure-context'
  | 'no-webcodecs'
  | 'working-storage-unavailable'
  | 'video-decode-unsupported'
  | 'audio-decode-unsupported'
  | 'no-h264-encode'
  | 'no-aac-encode'
  | 'insufficient-storage'
  | 'storage-unknown'
  | 'very-long-job'
  | 'mobile-device'
  | 'long-job'
  | 'estimate-unavailable'

export interface PreflightReason {
  readonly code: PreflightReasonCode
  readonly outcome: PreflightOutcome
}

export interface PreflightInput {
  readonly isSecureContext: boolean
  readonly hasWebCodecs: boolean
  readonly canUseOpfs: boolean
  readonly canDecodeVideo: boolean
  /** `true` for a silent source, which asks nothing of an audio decoder. */
  readonly canDecodeAudio: boolean
  /** Result of the real selected-track decode-transform-encode path. */
  readonly videoProbeStatus: VideoProbeStatus
  /** Exact stage returned by the real calibration path, when it failed. */
  readonly probeFailureStage: ProbeFailureStage | null
  /**
   * Whether this browser will encode the AAC track the output needs.
   *
   * `true` when the source has no audio, since nothing will be asked of the
   * audio encoder. Separate from the video probe because the answers
   * genuinely differ: Firefox 154 encodes every video configuration we ask for
   * and refuses AAC at every bitrate (VH-49).
   */
  readonly canEncodeAac: boolean
  /** Free storage the browser will admit to, or `null` when it will not say. */
  readonly availableStorageBytes: number | null
  readonly projectedOutputBytes: number
  readonly isMobileDevice: boolean
  /** Measured estimate for the whole job, or `null` if the probe could not run. */
  readonly estimatedSeconds: number | null
}

export interface PreflightVerdict {
  readonly outcome: PreflightOutcome
  readonly reasons: readonly PreflightReason[]
  /** Free storage the job needs, for the UI to quote. */
  readonly requiredStorageBytes: number
}

const SEVERITY: Record<PreflightOutcome, number> = {
  block: 3,
  discourage: 2,
  warn: 1,
  proceed: 0,
}

export function preflightVerdict(input: PreflightInput): PreflightVerdict {
  const reasons: PreflightReason[] = []
  const requiredStorageBytes = Math.round(input.projectedOutputBytes * STORAGE_HEADROOM_MULTIPLE)

  if (!input.isSecureContext) reasons.push({ code: 'insecure-context', outcome: 'block' })
  else if (!input.hasWebCodecs) reasons.push({ code: 'no-webcodecs', outcome: 'block' })
  else if (!input.canUseOpfs) {
    reasons.push({ code: 'working-storage-unavailable', outcome: 'block' })
  } else if (!input.canDecodeVideo) {
    reasons.push({ code: 'video-decode-unsupported', outcome: 'block' })
  } else if (!input.canDecodeAudio) {
    reasons.push({ code: 'audio-decode-unsupported', outcome: 'block' })
  } else if (input.probeFailureStage === 'video-decode') {
    reasons.push({ code: 'video-decode-unsupported', outcome: 'block' })
  } else if (input.probeFailureStage === 'audio-decode') {
    reasons.push({ code: 'audio-decode-unsupported', outcome: 'block' })
  } else if (input.probeFailureStage === 'video-encode' || input.videoProbeStatus === 'failed') {
    reasons.push({ code: 'no-h264-encode', outcome: 'block' })
  }
  // Blocks rather than warns, and blocks BEFORE the job starts. The failure it
  // replaces was a job that ran, showed progress, and died at the audio encoder
  // with "something went wrong" — the worst version of this available.
  else if (!input.canEncodeAac) reasons.push({ code: 'no-aac-encode', outcome: 'block' })

  if (input.availableStorageBytes === null) {
    // Not a block. Some browsers decline to report a quota, and refusing a job
    // that would have worked is worse than starting one that might run out —
    // the failure is recoverable and the source file is never at risk.
    reasons.push({ code: 'storage-unknown', outcome: 'warn' })
  } else if (input.availableStorageBytes < requiredStorageBytes) {
    reasons.push({ code: 'insufficient-storage', outcome: 'block' })
  }

  if (input.isMobileDevice) reasons.push({ code: 'mobile-device', outcome: 'discourage' })

  if (input.estimatedSeconds === null) {
    reasons.push({ code: 'estimate-unavailable', outcome: 'warn' })
  } else if (input.estimatedSeconds > ESTIMATE_BANDS.discourageAboveSeconds) {
    reasons.push({ code: 'very-long-job', outcome: 'discourage' })
  } else if (input.estimatedSeconds >= ESTIMATE_BANDS.proceedBelowSeconds) {
    reasons.push({ code: 'long-job', outcome: 'warn' })
  }

  const outcome = reasons.reduce<PreflightOutcome>(
    (worst, reason) => (SEVERITY[reason.outcome] > SEVERITY[worst] ? reason.outcome : worst),
    'proceed',
  )

  return { outcome, reasons, requiredStorageBytes }
}

/** Everything pre-flight found, as one value the UI can render. */
export interface PreflightSummary {
  readonly presetId: PresetId
  /** Measured picture type; `unknown` deliberately uses the safer bitrate. */
  readonly contentClass: ContentClass
  readonly capability: CapabilityReport
  readonly encode: EncodeSupport
  readonly probe: ProbeResult
  readonly verdict: PreflightVerdict
  readonly shape: OutputShape
  /** Cautious user-facing planning figure; never feeds the hard storage gate. */
  readonly outputSizeGuidanceBytes: number
  /**
   * Spec 5.4 audio-quality warnings. Advisory, shown before processing, and
   * never a reason to stop — which is why they sit beside the verdict rather
   * than inside it.
   */
  readonly audioWarnings: readonly AudioWarning[]
}
