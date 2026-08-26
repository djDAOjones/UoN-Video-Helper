/**
 * Spec 5.4, each row triggered deliberately — which is also acceptance
 * criterion 7 ("every pre-flight block and warning has been triggered
 * deliberately and reads clearly to a non-technical reader"). The reading
 * clearly half is the UI's; this half is the numbers.
 */

import { describe, expect, it } from 'vitest'

import { TARGET_INTEGRATED_LUFS } from '../config/audio'
import type { AudioAnalysis } from './analyse'
import { detectOutputWarning, detectSourceWarnings } from './warnings'

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

/** Curve length emitted by the 3 s short-term window on its 10 ms grid. */
function shortTermLength(durationSeconds: number, stepSeconds = 0.01): number {
  const completedSteps = Math.floor(durationSeconds / stepSeconds + 1e-9)
  const windowSteps = Math.round(3 / stepSeconds)
  return Math.max(0, completedSteps - windowSteps + 1)
}

function silent(durationSeconds: number): AudioAnalysis {
  const stepSeconds = 0.01
  return healthy({
    integratedLufs: Number.NEGATIVE_INFINITY,
    shortTermLufs: Array.from(
      { length: shortTermLength(durationSeconds, stepSeconds) },
      () => Number.NEGATIVE_INFINITY,
    ),
    momentaryLufs: [],
    durationSeconds,
    stepSeconds,
    truePeakDbtp: Number.NEGATIVE_INFINITY,
  })
}

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
    expect(codes(healthy({
      shortTermLufs: under, durationSeconds: under.length * stepSeconds + 2.9, stepSeconds,
    }))).not.toContain('extended-silence')
    expect(codes(healthy({
      shortTermLufs: over, durationSeconds: over.length * stepSeconds + 2.9, stepSeconds,
    }))).toContain('extended-silence')
  })

  it('extended silence — an entirely silent file uses the exact strict boundary', () => {
    expect(codes(silent(30))).not.toContain('extended-silence')

    const oneSampleOver = 30 + 1 / 48000
    const warnings = detectSourceWarnings(silent(oneSampleOver))
    const extended = warnings.find((warning) => warning.code === 'extended-silence')
    expect(extended?.detail['seconds']).toBeCloseTo(oneSampleOver, 8)
  })

  it('extended silence — accounts for the short-term window at startup', () => {
    const stepSeconds = 0.01
    const durationSeconds = 40
    const length = shortTermLength(durationSeconds, stepSeconds)
    const leading = (seconds: number) => [
      ...Array.from({ length: Math.round((seconds - 2.99) / stepSeconds) }, () => -70),
      ...Array.from({ length }, () => -20),
    ].slice(0, length)

    expect(codes(healthy({
      shortTermLufs: leading(30), durationSeconds, stepSeconds,
    }))).not.toContain('extended-silence')
    expect(codes(healthy({
      shortTermLufs: leading(30.01), durationSeconds, stepSeconds,
    }))).toContain('extended-silence')
  })

  it('extended silence — accounts for the short-term window inside the file', () => {
    const stepSeconds = 0.01
    const exact = Array.from({ length: Math.round((30 - 2.99) / stepSeconds) }, () => -70)
    const curve = [-20, ...exact, -20]

    expect(codes(healthy({
      shortTermLufs: curve, durationSeconds: curve.length * stepSeconds + 2.99, stepSeconds,
    }))).not.toContain('extended-silence')
    expect(codes(healthy({
      shortTermLufs: [-20, ...exact, -70, -20],
      durationSeconds: (curve.length + 1) * stepSeconds + 2.99,
      stepSeconds,
    }))).toContain('extended-silence')
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
