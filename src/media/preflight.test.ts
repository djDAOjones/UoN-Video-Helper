/**
 * Spec section 7.3's four outcomes, each triggered deliberately — which is
 * also acceptance criterion 7 ("every pre-flight block and warning has been
 * triggered deliberately").
 */

import { describe, expect, it } from 'vitest'

import { preflightVerdict, type PreflightInput } from './preflight'

const GB = 1_000_000_000

/** A healthy desktop with a short job. Each test perturbs one thing. */
const healthy: PreflightInput = {
  isSecureContext: true,
  hasWebCodecs: true,
  canUseOpfs: true,
  canDecodeVideo: true,
  canDecodeAudio: true,
  videoProbeStatus: 'supported',
  probeFailureStage: null,
  canEncodeAac: true,
  availableStorageBytes: 50 * GB,
  projectedOutputBytes: 2 * GB,
  isMobileDevice: false,
  estimatedSeconds: 5 * 60,
}

const codesOf = (input: PreflightInput) => preflightVerdict(input).reasons.map((r) => r.code)

describe('proceed', () => {
  it('proceeds when everything passes and the job is short', () => {
    const verdict = preflightVerdict(healthy)
    expect(verdict.outcome).toBe('proceed')
    expect(verdict.reasons).toHaveLength(0)
  })

  it('requires 2.5x the projected output in free storage', () => {
    expect(preflightVerdict(healthy).requiredStorageBytes).toBe(5 * GB)
  })
})

describe('block', () => {
  it('blocks without WebCodecs', () => {
    const verdict = preflightVerdict({ ...healthy, hasWebCodecs: false })
    expect(verdict.outcome).toBe('block')
    expect(verdict.reasons.map((r) => r.code)).toContain('no-webcodecs')
  })

  it('blocks outside a secure context before subordinate feature checks', () => {
    expect(codesOf({ ...healthy, isSecureContext: false, canUseOpfs: false })).toEqual([
      'insecure-context',
    ])
  })

  it('blocks when working storage cannot actually be opened', () => {
    expect(codesOf({ ...healthy, canUseOpfs: false })).toContain('working-storage-unavailable')
  })

  it('blocks when the selected video track cannot be decoded', () => {
    expect(codesOf({ ...healthy, canDecodeVideo: false })).toContain('video-decode-unsupported')
  })

  it('blocks when the selected audio track cannot be decoded', () => {
    expect(codesOf({ ...healthy, canDecodeAudio: false })).toContain('audio-decode-unsupported')
  })

  it('blocks when the real-path video probe fails', () => {
    const verdict = preflightVerdict({
      ...healthy,
      videoProbeStatus: 'failed',
      probeFailureStage: 'video-encode',
    })
    expect(verdict.outcome).toBe('block')
    expect(
      codesOf({
        ...healthy,
        videoProbeStatus: 'failed',
        probeFailureStage: 'video-encode',
      }),
    ).toContain('no-h264-encode')
  })

  it('names a real-path video decode failure as decode support', () => {
    expect(
      codesOf({
        ...healthy,
        videoProbeStatus: 'failed',
        probeFailureStage: 'video-decode',
      }),
    ).toContain('video-decode-unsupported')
  })

  it('blocks when the selected audio path fails during calibration', () => {
    expect(codesOf({ ...healthy, probeFailureStage: 'audio-decode' })).toContain(
      'audio-decode-unsupported',
    )
  })

  it('reports only the root cause when WebCodecs is missing entirely', () => {
    // "Cannot encode H.264" is noise when there is no encoder at all.
    expect(
      codesOf({
        ...healthy,
        hasWebCodecs: false,
        videoProbeStatus: 'failed',
        probeFailureStage: 'video-encode',
      }),
    ).not.toContain('no-h264-encode')
  })

  it('blocks when the browser cannot encode the AUDIO (VH-49)', () => {
    // Firefox 154 encodes every video configuration this app asks for and
    // refuses AAC at every bitrate. Before this, only the video question was
    // asked, so the job started, showed progress, and died at the audio
    // encoder with "Something went wrong".
    const verdict = preflightVerdict({ ...healthy, canEncodeAac: false })
    expect(verdict.outcome).toBe('block')
    expect(codesOf({ ...healthy, canEncodeAac: false })).toContain('no-aac-encode')
  })

  it('does not blame the audio encoder when there is no encoder at all', () => {
    expect(codesOf({ ...healthy, hasWebCodecs: false, canEncodeAac: false })).not.toContain(
      'no-aac-encode',
    )
  })

  it('reports the video failure rather than the audio one when both fail', () => {
    // Both are blocks, so the outcome is the same either way — but naming the
    // picture first is the more useful sentence when neither works.
    const codes = codesOf({
      ...healthy,
      videoProbeStatus: 'failed',
      probeFailureStage: 'video-encode',
      canEncodeAac: false,
    })
    expect(codes).toContain('no-h264-encode')
    expect(codes).not.toContain('no-aac-encode')
  })

  it('blocks when storage cannot hold 2.5x the output', () => {
    const verdict = preflightVerdict({ ...healthy, availableStorageBytes: 4 * GB })
    expect(verdict.outcome).toBe('block')
    expect(verdict.reasons.map((r) => r.code)).toContain('insufficient-storage')
  })

  it('accepts storage exactly at the threshold', () => {
    expect(preflightVerdict({ ...healthy, availableStorageBytes: 5 * GB }).outcome).toBe('proceed')
  })
})

describe('warn', () => {
  it('warns for a job between 20 and 60 minutes', () => {
    const verdict = preflightVerdict({ ...healthy, estimatedSeconds: 35 * 60 })
    expect(verdict.outcome).toBe('warn')
    expect(verdict.reasons.map((r) => r.code)).toContain('long-job')
  })

  it('treats exactly 20 minutes as the start of the warn band', () => {
    expect(preflightVerdict({ ...healthy, estimatedSeconds: 20 * 60 }).outcome).toBe('warn')
  })

  it('warns rather than blocks when the browser will not report a quota', () => {
    // Refusing a job that would have worked is worse than starting one that
    // might run out: the failure is recoverable and the source is never at risk.
    const verdict = preflightVerdict({ ...healthy, availableStorageBytes: null })
    expect(verdict.outcome).toBe('warn')
    expect(verdict.reasons.map((r) => r.code)).toContain('storage-unknown')
  })

  it('warns when the probe could not produce an estimate', () => {
    const verdict = preflightVerdict({ ...healthy, estimatedSeconds: null })
    expect(verdict.outcome).toBe('warn')
    expect(verdict.reasons.map((r) => r.code)).toContain('estimate-unavailable')
  })
})

describe('discourage', () => {
  it('discourages a job over an hour', () => {
    const verdict = preflightVerdict({ ...healthy, estimatedSeconds: 90 * 60 })
    expect(verdict.outcome).toBe('discourage')
    expect(verdict.reasons.map((r) => r.code)).toContain('very-long-job')
  })

  it('discourages on a phone or tablet regardless of how short the job is', () => {
    const verdict = preflightVerdict({ ...healthy, isMobileDevice: true, estimatedSeconds: 60 })
    expect(verdict.outcome).toBe('discourage')
    expect(verdict.reasons.map((r) => r.code)).toContain('mobile-device')
  })
})

describe('severity ordering', () => {
  it('lets a block win over everything else', () => {
    const verdict = preflightVerdict({
      ...healthy,
      hasWebCodecs: false,
      isMobileDevice: true,
      estimatedSeconds: 90 * 60,
      availableStorageBytes: null,
    })
    expect(verdict.outcome).toBe('block')
    // Every reason is still reported, so the UI can explain the whole picture.
    expect(verdict.reasons.length).toBeGreaterThan(1)
  })

  it('lets discourage win over warn', () => {
    const verdict = preflightVerdict({
      ...healthy,
      isMobileDevice: true,
      availableStorageBytes: null,
    })
    expect(verdict.outcome).toBe('discourage')
  })
})
