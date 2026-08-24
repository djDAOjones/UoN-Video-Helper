/**
 * Spec section 5.2 step 2: a 60 Hz high-pass.
 *
 * Removes rumble, desk bumps and handling noise — the energy below speech that
 * costs bitrate and pushes the limiter around without ever being heard on a
 * laptop speaker.
 *
 * Second-order Butterworth (Q = 1/sqrt(2)): maximally flat in the passband, so
 * it takes out what is below 60 Hz without colouring what is above it.
 */

import { BiquadCascade, type BiquadCoefficients } from './biquad'
import { HIGH_PASS_HZ } from '../config/audio'

const BUTTERWORTH_Q = Math.SQRT1_2

export function designHighPass(sampleRate: number, frequency = HIGH_PASS_HZ): BiquadCoefficients {
  const k = Math.tan((Math.PI * frequency) / sampleRate)
  const kSquared = k * k
  const a0 = 1 + k / BUTTERWORTH_Q + kSquared
  return {
    b0: 1 / a0,
    b1: -2 / a0,
    b2: 1 / a0,
    a1: (2 * (kSquared - 1)) / a0,
    a2: (1 - k / BUTTERWORTH_Q + kSquared) / a0,
  }
}

/** One independent filter per channel, since each carries its own state. */
export class HighPassFilter {
  private readonly channels: BiquadCascade[]

  constructor(sampleRate: number, channelCount: number, frequency = HIGH_PASS_HZ) {
    const coefficients = [designHighPass(sampleRate, frequency)]
    this.channels = Array.from({ length: channelCount }, () => new BiquadCascade(coefficients))
  }

  /** Filters planar audio in place. */
  process(channels: readonly Float32Array[]): void {
    for (let ch = 0; ch < channels.length; ch++) {
      const data = channels[ch]!
      this.channels[ch]!.process(data, data)
    }
  }
}
