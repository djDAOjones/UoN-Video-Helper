/**
 * The drift estimator, pinned.
 *
 * This is here because getting it wrong cost real time: taking the difference
 * between the first and last measurement reported -16 ms of drift on data
 * whose actual trend was +9 ms — wrong in magnitude and in sign — and that
 * false reading was the only thing keeping acceptance criterion 6 failing
 * after the underlying defect had been fixed.
 */

import { describe, expect, it } from 'vitest'

import { fittedChange } from './measure'

describe('fittedChange', () => {
  it('finds no trend in a flat series', () => {
    expect(fittedChange([5, 5, 5, 5, 5])).toBeCloseTo(0, 9)
  })

  it('finds the trend in a clean ramp', () => {
    // 0 to 10 across the series.
    expect(fittedChange([0, 2, 4, 6, 8, 10])).toBeCloseTo(10, 9)
  })

  it('is not fooled by noise at the endpoints', () => {
    // A flat series with one high first point and one low last point. The
    // endpoint difference says -20; there is no actual trend.
    const values = [10, 0, 0, 0, 0, 0, 0, 0, 0, -10]
    expect(values[values.length - 1]! - values[0]!).toBe(-20)
    expect(Math.abs(fittedChange(values))).toBeLessThan(13)
  })

  it('reproduces the measurement that exposed the flaw', () => {
    const measured = [12, 0, 6, -12, -4, -10, 18, 24, 21, -6, 24, -4]
    expect(measured[measured.length - 1]! - measured[0]!).toBe(-16)
    expect(fittedChange(measured)).toBeCloseTo(9.0, 1)
  })

  it('recovers a real trend buried in scatter', () => {
    // A 20 ms trend with +/-10 ms of alternating noise on top. The fit returns
    // 17.1, not 20, and that is correct rather than sloppy: alternating noise
    // over an even-length series correlates slightly with the index, biasing
    // the slope by -2.86 ms here. A finite noisy sample cannot recover a trend
    // exactly, and a test claiming otherwise would be asserting a fiction.
    const values = Array.from({ length: 20 }, (_v, i) => i * (20 / 19) + (i % 2 === 0 ? 10 : -10))
    const fitted = fittedChange(values)
    expect(fitted).toBeGreaterThan(15)
    expect(fitted).toBeLessThan(25)
  })

  it('handles degenerate input rather than returning NaN', () => {
    expect(fittedChange([])).toBe(0)
    expect(fittedChange([7])).toBe(0)
  })
})
