/**
 * K-weighting, per ITU-R BS.1770-4 section 3.1 and Annex 1.
 *
 * Two cascaded biquads: a high-shelf modelling the acoustic effect of a head,
 * then the RLB (revised low-frequency B-curve) high-pass.
 *
 * BS.1770-4 tabulates coefficients for 48 kHz only. Sources arriving here are
 * whatever the user recorded — 44.1 kHz is common from consumer tools — so the
 * filters are *derived* from the standard's analytic parameters at the actual
 * sample rate rather than resampling to fit a coefficient table. The 48 kHz
 * table is used as a test fixture: kweighting.test.ts asserts that this
 * derivation reproduces it.
 */

import type { BiquadCoefficients } from './biquad'

/**
 * Analytic filter parameters from BS.1770-4 Annex 1. These are the values the
 * standard's own 48 kHz coefficient table is derived from; they are not
 * project choices and must not be moved into `src/config/`.
 */
const SHELF_F0 = 1681.974450955533
const SHELF_GAIN_DB = 3.999843853973347
const SHELF_Q = 0.7071752369554196

const HIGHPASS_F0 = 38.13547087602444
const HIGHPASS_Q = 0.5003270373238773

/** Exponent relating the shelf's mid-band gain to its high-frequency gain. */
const SHELF_VB_EXPONENT = 0.4996667741545416

/** Stage 1: the head-effect high shelf. */
export function designShelf(sampleRate: number): BiquadCoefficients {
  const k = Math.tan((Math.PI * SHELF_F0) / sampleRate)
  const vh = 10 ** (SHELF_GAIN_DB / 20)
  const vb = vh ** SHELF_VB_EXPONENT
  const kSquared = k * k
  const kOverQ = k / SHELF_Q

  const a0 = 1 + kOverQ + kSquared
  return {
    b0: (vh + vb * kOverQ + kSquared) / a0,
    b1: (2 * (kSquared - vh)) / a0,
    b2: (vh - vb * kOverQ + kSquared) / a0,
    a1: (2 * (kSquared - 1)) / a0,
    a2: (1 - kOverQ + kSquared) / a0,
  }
}

/** Stage 2: the RLB high-pass. */
export function designHighPass(sampleRate: number): BiquadCoefficients {
  const k = Math.tan((Math.PI * HIGHPASS_F0) / sampleRate)
  const kSquared = k * k
  const kOverQ = k / HIGHPASS_Q

  const a0 = 1 + kOverQ + kSquared
  return {
    b0: 1,
    b1: -2,
    b2: 1,
    a1: (2 * (kSquared - 1)) / a0,
    a2: (1 - kOverQ + kSquared) / a0,
  }
}

/** The full K-weighting cascade for a given sample rate: shelf, then high-pass. */
export function designKWeighting(sampleRate: number): readonly BiquadCoefficients[] {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new RangeError(`Sample rate must be a positive number, got ${sampleRate}`)
  }
  return [designShelf(sampleRate), designHighPass(sampleRate)]
}

/**
 * The coefficients BS.1770-4 tabulates for 48 kHz, kept as the reference the
 * derivation above is checked against. Not used at runtime.
 */
export const REFERENCE_48K = {
  shelf: {
    b0: 1.53512485958697,
    b1: -2.69169618940638,
    b2: 1.19839281085285,
    a1: -1.69065929318241,
    a2: 0.73248077421585,
  },
  highPass: {
    b0: 1.0,
    b1: -2.0,
    b2: 1.0,
    a1: -1.99004745483398,
    a2: 0.99007225036621,
  },
} as const
