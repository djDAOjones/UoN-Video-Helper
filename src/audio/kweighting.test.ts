/**
 * The derivation must reproduce BS.1770-4's own 48 kHz coefficient table.
 * If it does not, every loudness figure downstream is wrong in a way that
 * looks plausible — which is exactly the failure mode the EBU validation
 * exists to catch, caught one layer earlier and far more cheaply.
 */

import { describe, expect, it } from 'vitest'

import { BiquadCascade } from './biquad'
import { REFERENCE_48K, designHighPass, designKWeighting, designShelf } from './kweighting'

describe('K-weighting coefficient derivation', () => {
  it('reproduces the standard 48 kHz shelf coefficients', () => {
    const shelf = designShelf(48000)
    for (const key of ['b0', 'b1', 'b2', 'a1', 'a2'] as const) {
      expect(shelf[key], key).toBeCloseTo(REFERENCE_48K.shelf[key], 12)
    }
  })

  it('reproduces the standard 48 kHz high-pass coefficients', () => {
    const highPass = designHighPass(48000)
    for (const key of ['b0', 'b1', 'b2', 'a1', 'a2'] as const) {
      expect(highPass[key], key).toBeCloseTo(REFERENCE_48K.highPass[key], 8)
    }
  })

  it('derives usable filters at non-48 kHz rates', () => {
    for (const rate of [44100, 32000, 96000, 192000]) {
      const [shelf, highPass] = designKWeighting(rate)
      for (const section of [shelf!, highPass!]) {
        for (const value of Object.values(section)) expect(Number.isFinite(value)).toBe(true)
      }
      // Stability: both poles inside the unit circle, i.e. |a2| < 1 and
      // |a1| < 1 + a2. A filter that fails this rings or explodes.
      expect(Math.abs(shelf!.a2)).toBeLessThan(1)
      expect(Math.abs(highPass!.a2)).toBeLessThan(1)
      expect(Math.abs(highPass!.a1)).toBeLessThan(1 + highPass!.a2)
    }
  })

  it('has +0.6977 dB gain at 1 kHz — what the standard offset cancels', () => {
    // BS.1770-4's `L = -0.691 + 10log10(sum G_i z_i)` offset is not arbitrary:
    // it cancels K-weighting's own gain at the 1 kHz reference. Working the
    // chain through for a stereo sine of peak amplitude A:
    //
    //   z per channel = (A^2 / 2) * g        (sine RMS^2, times the power gain g)
    //   sum over 2 channels                  = A^2 * g
    //   L = -0.691 + 20log10(A) + 10log10(g)
    //
    // so L == 20log10(A) exactly when 10log10(g) == 0.691. The filter's
    // actual gain here is 0.6977 dB, leaving a 0.0067 dB residual — a stereo
    // 1 kHz sine at -23 dBFS *peak* therefore reads -22.993 LUFS, not a flat
    // -23.000. That is EBU Tech 3341 test case 1, and the residual is 15x
    // inside its +/-0.1 LU tolerance. Asserting the real 0.6977 rather than
    // the nominal 0.691 keeps this test honest: if the gain drifts, every
    // reading drifts with it, plausibly, which is the dangerous kind.
    const sampleRate = 48000
    const cascade = new BiquadCascade(designKWeighting(sampleRate))
    const samples = sampleRate * 2
    const input = new Float32Array(samples)
    for (let i = 0; i < samples; i++) input[i] = Math.sin((2 * Math.PI * 1000 * i) / sampleRate)
    const output = new Float32Array(samples)
    cascade.process(input, output)

    // Skip the first half-second so the filter has settled.
    const start = sampleRate / 2
    let sum = 0
    for (let i = start; i < samples; i++) sum += output[i]! * output[i]!
    const rms = Math.sqrt(sum / (samples - start))
    const gainDb = 20 * Math.log10(rms / Math.SQRT1_2)

    expect(gainDb).toBeCloseTo(0.6977, 3)
  })
})
