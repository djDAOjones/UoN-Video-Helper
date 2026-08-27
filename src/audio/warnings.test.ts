/**
 * Spec 5.4, each row triggered deliberately — which is also acceptance
 * criterion 7 ("every pre-flight block and warning has been triggered
 * deliberately and reads clearly to a non-technical reader"). The reading
 * clearly half is the UI's; this half is the numbers.
 */

import { describe, expect, it } from 'vitest'

import { TARGET_INTEGRATED_LUFS, WARNING_THRESHOLDS } from '../config/audio'
import type { AudioAnalysis } from './analyse'
import { detectOnsetWarning, detectOutputWarning, detectSourceWarnings } from './warnings'

/** A healthy recording. Each test perturbs exactly one thing. */
function healthy(overrides: Partial<AudioAnalysis> = {}): AudioAnalysis {
  // Speech around -20 with clean pauses, which is what a real lecture looks
  // like — and what the noise-floor rule needs in order to mean anything.
  const shortTerm = Array.from({ length: 600 }, (_v, i) =>
    i % 100 < 15 ? -68 : -20 + Math.sin(i / 30) * 2,
  )
  return {
    integratedLufs: -20,
    loudnessRangeLu: 4,
    shortTermLufs: shortTerm,
    momentaryLufs: shortTerm,
    durationSeconds: 60,
    stepSeconds: 0.1,
    truePeakDbtp: -6,
    clippedSampleCount: 0,
    sampleRate: 48000,
    channelCount: 2,
    ...overrides,
  }
}

const codes = (analysis: AudioAnalysis | null) => detectSourceWarnings(analysis).map((w) => w.code)

describe('spec 5.4 source warnings', () => {
  it('says nothing about a healthy recording', () => {
    expect(detectSourceWarnings(healthy())).toEqual([])
  })

  it('no audio track', () => {
    expect(codes(null)).toEqual(['no-audio'])
  })

  it('clipping — ten or more samples at the threshold', () => {
    expect(codes(healthy({ clippedSampleCount: 9 }))).not.toContain('clipping')
    expect(codes(healthy({ clippedSampleCount: 10 }))).toContain('clipping')
  })

  it('clipping — a true peak over full scale, whatever the count', () => {
    // One sample above 0 dBTP is a problem on its own; no count needed.
    expect(codes(healthy({ clippedSampleCount: 0, truePeakDbtp: 0.4 }))).toContain('clipping')
  })

  it('very quiet — below -35 LUFS', () => {
    expect(codes(healthy({ integratedLufs: -34.9 }))).not.toContain('very-quiet')
    expect(codes(healthy({ integratedLufs: -40 }))).toContain('very-quiet')
  })

  it('highly variable — LRA above 15 LU', () => {
    expect(codes(healthy({ loudnessRangeLu: 15 }))).not.toContain('highly-variable')
    expect(codes(healthy({ loudnessRangeLu: 18 }))).toContain('highly-variable')
  })

  it('background noise — even the quietest parts sit above -50 LUFS', () => {
    // A recording whose gaps never drop below -45: something is audible in them.
    const noisy = Array.from({ length: 600 }, (_v, i) => (i % 10 < 3 ? -45 : -20))
    expect(codes(healthy({ shortTermLufs: noisy }))).toContain('noisy')
  })

  it('background noise — quiet gaps do not trigger it', () => {
    const clean = Array.from({ length: 600 }, (_v, i) => (i % 10 < 3 ? -65 : -20))
    expect(codes(healthy({ shortTermLufs: clean }))).not.toContain('noisy')
  })

  it('background noise — a recording with no pauses is not accused', () => {
    // Continuous narration has a 10th percentile close to its own speech
    // level. There is no gap to measure a floor in, so claiming one would be
    // a false accusation — which spec 5.4 treats as worse than silence.
    const gapless = Array.from({ length: 600 }, (_v, i) => -20 + Math.sin(i / 30) * 1.5)
    expect(codes(healthy({ shortTermLufs: gapless }))).not.toContain('noisy')
  })

  it('extended silence — a continuous span over 30 s', () => {
    const stepSeconds = 0.1
    const under = [
      ...Array.from({ length: 100 }, () => -20),
      ...Array.from({ length: 250 }, () => -70), // 25 s
      ...Array.from({ length: 100 }, () => -20),
    ]
    const over = [
      ...Array.from({ length: 100 }, () => -20),
      ...Array.from({ length: 350 }, () => -70), // 35 s
      ...Array.from({ length: 100 }, () => -20),
    ]
    expect(codes(healthy({ shortTermLufs: under, stepSeconds }))).not.toContain('extended-silence')
    expect(codes(healthy({ shortTermLufs: over, stepSeconds }))).toContain('extended-silence')
  })

  it('does not mistake many short gaps for one long silence', () => {
    // Forty separate two-second pauses is a normal lecture, not a fault.
    const gappy: number[] = []
    for (let i = 0; i < 40; i++) {
      gappy.push(...Array.from({ length: 20 }, () => -70))
      gappy.push(...Array.from({ length: 80 }, () => -20))
    }
    expect(codes(healthy({ shortTermLufs: gappy }))).not.toContain('extended-silence')
  })

  it('reports several problems at once rather than only the first', () => {
    const found = codes(
      healthy({ integratedLufs: -45, loudnessRangeLu: 20, clippedSampleCount: 50 }),
    )
    expect(found).toContain('very-quiet')
    expect(found).toContain('highly-variable')
    expect(found).toContain('clipping')
  })

  it('carries the measured numbers, so the wording can be specific', () => {
    const [warning] = detectSourceWarnings(healthy({ integratedLufs: -42 }))
    expect(warning?.code).toBe('very-quiet')
    expect(warning?.detail['integratedLufs']).toBe(-42)
  })
})

describe('spec 5.4 output warning', () => {
  it('says nothing when the target was reached', () => {
    expect(detectOutputWarning(TARGET_INTEGRATED_LUFS, TARGET_INTEGRATED_LUFS)).toBeNull()
    expect(detectOutputWarning(-16.9, TARGET_INTEGRATED_LUFS)).toBeNull()
  })

  it('warns when the result missed by more than 1 LU', () => {
    const warning = detectOutputWarning(-18.5, TARGET_INTEGRATED_LUFS)
    expect(warning?.code).toBe('target-missed')
    expect(warning?.detail['missedBy']).toBeCloseTo(2.5, 6)
  })

  it('says nothing about a silent result rather than reporting -Infinity', () => {
    expect(detectOutputWarning(Number.NEGATIVE_INFINITY, TARGET_INTEGRATED_LUFS)).toBeNull()
  })
})

/**
 * VH-55 / review R-03. Encoder-delay compensation discards whatever falls
 * before timestamp zero. Room tone going is fine; the attack of the first word
 * going quietly is not, and `AGENTS.md` puts silent data loss top of the list.
 */
describe('detectOnsetWarning', () => {
  const SAMPLE_RATE = 48000
  const frames = Math.round(SAMPLE_RATE * 0.044)

  it('says nothing when nothing was discarded', () => {
    expect(detectOnsetWarning({ frames: 0, peakDbfs: -Infinity }, SAMPLE_RATE)).toBeNull()
  })

  it('says nothing about discarded silence', () => {
    expect(detectOnsetWarning({ frames, peakDbfs: -Infinity }, SAMPLE_RATE)).toBeNull()
    // Room tone, comfortably under the threshold.
    expect(detectOnsetWarning({ frames, peakDbfs: -72 }, SAMPLE_RATE)).toBeNull()
  })

  it('warns about the levels the real corpus actually carries', () => {
    // The three measured files: -26.4, -27.0 and -47.8 dBFS in the first 44 ms.
    for (const peakDbfs of [-26.4, -27, -47.8]) {
      const warning = detectOnsetWarning({ frames, peakDbfs }, SAMPLE_RATE)
      expect(warning?.code, `${peakDbfs} dBFS`).toBe('onset-trimmed')
      expect(warning?.detail['milliseconds']).toBe(44)
      expect(warning?.detail['peakDbfs']).toBeCloseTo(peakDbfs, 1)
    }
  })

  it('holds the line exactly at the configured threshold', () => {
    const at = WARNING_THRESHOLDS.onsetTrimmedAboveDbfs
    expect(detectOnsetWarning({ frames, peakDbfs: at }, SAMPLE_RATE)).toBeNull()
    expect(detectOnsetWarning({ frames, peakDbfs: at + 0.1 }, SAMPLE_RATE)?.code).toBe(
      'onset-trimmed',
    )
  })
})
