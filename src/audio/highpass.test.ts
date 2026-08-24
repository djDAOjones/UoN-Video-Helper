import { describe, expect, it } from 'vitest'

import { tone } from '../../test/helpers/signals'
import { HighPassFilter } from './highpass'

const SAMPLE_RATE = 48000

/** Steady-state RMS in dB, skipping the filter's settling time. */
function steadyRmsDb(data: Float32Array, skip = SAMPLE_RATE / 2): number {
  let sum = 0
  for (let i = skip; i < data.length; i++) sum += data[i]! * data[i]!
  return 10 * Math.log10(sum / (data.length - skip))
}

function gainAt(frequency: number): number {
  const channels = tone({
    sampleRate: SAMPLE_RATE, seconds: 2, frequency, peakDbfs: -6, channelCount: 1,
  })
  const before = steadyRmsDb(channels[0]!)
  new HighPassFilter(SAMPLE_RATE, 1).process(channels)
  return steadyRmsDb(channels[0]!) - before
}

describe('60 Hz high-pass', () => {
  it('is -3 dB at the cutoff, as a Butterworth should be', () => {
    expect(gainAt(60)).toBeCloseTo(-3, 0)
  })

  it('removes rumble well below the cutoff', () => {
    expect(gainAt(20)).toBeLessThan(-18)
    expect(gainAt(30)).toBeLessThan(-10)
  })

  it('leaves speech untouched', () => {
    // Nothing that carries intelligibility should move.
    expect(gainAt(200)).toBeGreaterThan(-0.5)
    expect(gainAt(1000)).toBeGreaterThan(-0.1)
    expect(gainAt(4000)).toBeGreaterThan(-0.1)
  })

  it('keeps channels independent', () => {
    const stereo = tone({
      sampleRate: SAMPLE_RATE, seconds: 1, frequency: 1000, peakDbfs: -6, channelCount: 2,
    })
    stereo[1]!.fill(0)
    new HighPassFilter(SAMPLE_RATE, 2).process(stereo)
    // A silent channel must stay silent; state must not leak between them.
    expect(Math.max(...stereo[1]!)).toBe(0)
    expect(Math.max(...stereo[0]!)).toBeGreaterThan(0.4)
  })
})
