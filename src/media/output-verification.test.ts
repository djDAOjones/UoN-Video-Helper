import { describe, expect, it } from 'vitest'

import { verifyOutputAudio } from './output-verification'

describe('verifyOutputAudio', () => {
  it('accepts a decoded output inside both limits', () => {
    expect(verifyOutputAudio({ integratedLufs: -16, truePeakDbtp: -2.1 })).toEqual({ ok: true })
  })

  it('accepts both contract boundaries exactly', () => {
    expect(verifyOutputAudio({ integratedLufs: -15.5, truePeakDbtp: -2 })).toEqual({ ok: true })
    expect(verifyOutputAudio({ integratedLufs: -16.5, truePeakDbtp: -2 })).toEqual({ ok: true })
  })

  it('fails when expected output audio is missing', () => {
    expect(verifyOutputAudio(null)).toMatchObject({ ok: false, code: 'missing-audio' })
  })

  it('fails closed when either measurement is non-finite', () => {
    expect(verifyOutputAudio({ integratedLufs: Number.NaN, truePeakDbtp: -2.1 })).toMatchObject({
      ok: false,
      code: 'invalid-measurement',
    })
    expect(
      verifyOutputAudio({ integratedLufs: -16, truePeakDbtp: Number.NEGATIVE_INFINITY }),
    ).toMatchObject({ ok: false, code: 'invalid-measurement' })
  })

  it('fails either side of the loudness tolerance', () => {
    expect(verifyOutputAudio({ integratedLufs: -15.49, truePeakDbtp: -2.1 })).toMatchObject({
      ok: false,
      code: 'loudness-out-of-range',
    })
    expect(verifyOutputAudio({ integratedLufs: -16.51, truePeakDbtp: -2.1 })).toMatchObject({
      ok: false,
      code: 'loudness-out-of-range',
    })
  })

  it('fails any true-peak overshoot', () => {
    expect(verifyOutputAudio({ integratedLufs: -16, truePeakDbtp: -1.99 })).toMatchObject({
      ok: false,
      code: 'true-peak-exceeded',
    })
  })
})
