import { afterEach, describe, expect, it } from 'vitest'

import { buildDiagnosticsBundle, setDiagnosticsContext } from './diagnostics'
import { REDACTED } from './redact'

afterEach(() => {
  setDiagnosticsContext({ view: 'select', sourceReport: null, capability: null, jobSpec: null })
})

describe('diagnostics context', () => {
  it('keeps durable job facts outside the bounded log history', () => {
    setDiagnosticsContext({
      view: 'processing',
      sourceReport: { width: 1920, durationSeconds: 3600 },
      capability: { hasWebCodecs: true, encodeSupported: true },
      jobSpec: { presetId: 'best', closing: true, sidecarPresent: false },
    })

    const bundle = buildDiagnosticsBundle()

    expect(bundle.view).toBe('processing')
    expect(bundle.sourceReport).toEqual({ width: 1920, durationSeconds: 3600 })
    expect(bundle.capability).toEqual({ hasWebCodecs: true, encodeSupported: true })
    expect(bundle.jobSpec).toEqual({ presetId: 'best', closing: true, sidecarPresent: false })
  })

  it('redacts identifying or binary fields even when a caller passes them accidentally', () => {
    setDiagnosticsContext({
      sourceReport: {
        filename: 'Week 3 Lecture.mp4',
        file: new Blob(['media bytes'], { type: 'video/mp4' }),
        codec: 'avc1.640028',
      },
    })

    const report = buildDiagnosticsBundle().sourceReport as Record<string, unknown>
    expect(report['filename']).toBe(REDACTED)
    expect(report['file']).toBe(REDACTED)
    expect(report['codec']).toBe('avc1.640028')
  })
})
