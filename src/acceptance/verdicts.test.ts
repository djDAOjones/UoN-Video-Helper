import { describe, expect, it } from 'vitest'

import { loudnessCorpusVerdict, type OutputLoudnessMeasurement } from './verdicts'

const measurement = (
  integratedLufs: number,
  truePeakDbtp: number,
  overrides: Partial<OutputLoudnessMeasurement> = {},
): OutputLoudnessMeasurement => ({
  integratedLufs,
  truePeakDbtp,
  contentFrames: 3_360_000,
  expectedContentFrames: 3_360_000,
  contentCoverageComplete: true,
  ...overrides,
})

const verdict = (
  measurements: readonly OutputLoudnessMeasurement[],
  expected = measurements.length,
) => loudnessCorpusVerdict(measurements, expected, -16, 0.5, -2)

describe('loudnessCorpusVerdict', () => {
  it('fails when no decoded measurement was produced', () => {
    expect(verdict([], 4).pass).toBe(false)
  })

  it('fails when even one expected corpus result is missing', () => {
    const result = verdict([measurement(-16, -2)], 2)

    expect(result.pass).toBe(false)
    expect(result.measured).toBe(1)
  })

  it('accepts the exact loudness and true-peak boundaries', () => {
    expect(verdict([measurement(-15.5, -2), measurement(-16.5, -3)]).pass).toBe(true)
  })

  it('fails an otherwise quiet corpus when true peak exceeds the ceiling', () => {
    expect(verdict([measurement(-16, -1.99)]).pass).toBe(false)
  })

  it('fails non-finite evidence', () => {
    expect(verdict([measurement(Number.NaN, -2)]).pass).toBe(false)
  })

  it('fails a numerically on-target result whose content tail is truncated', () => {
    const result = verdict([
      measurement(-16, -2, {
        contentFrames: 3_359_999,
        contentCoverageComplete: false,
      }),
    ])

    expect(result.pass).toBe(false)
    expect(result.fullyCovered).toBe(0)
  })
})
