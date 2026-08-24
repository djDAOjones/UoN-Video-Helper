/**
 * The four anti-pumping properties from rationale 3.3, each tested on its own.
 * Any one of them missing turns this stage into the aggressive AGC the brief
 * was right to worry about.
 */

import { describe, expect, it } from 'vitest'

import { MACRO_LEVEL } from '../config/audio'
import { MacroLeveller, buildGainEnvelope, shouldApplyMacroLevelling } from './macrolevel'

const STEP = 0.01

/** A short-term curve at 10 ms, built from level segments given in seconds. */
function curve(segments: ReadonlyArray<readonly [seconds: number, lufs: number]>): number[] {
  const out: number[] = []
  for (const [seconds, lufs] of segments) {
    for (let i = 0; i < Math.round(seconds / STEP); i++) out.push(lufs)
  }
  return out
}

describe('property 1: conditional application', () => {
  it('does nothing at or below 9 LU, where most single-speaker recordings sit', () => {
    expect(shouldApplyMacroLevelling(9)).toBe(false)
    expect(shouldApplyMacroLevelling(4)).toBe(false)
    expect(shouldApplyMacroLevelling(9.1)).toBe(true)
  })

  it('returns an empty envelope for consistent audio', () => {
    const envelope = buildGainEnvelope({
      integratedLufs: -20,
      loudnessRangeLu: 5,
      shortTermLufs: curve([[60, -20]]),
      stepSeconds: STEP,
    })
    expect(envelope.gainDb).toHaveLength(0)
    expect(new MacroLeveller(envelope, 48000).isNoOp).toBe(true)
  })
})

describe('property 3: the slew limit', () => {
  it('never moves faster than 1 dB per second, however hard the envelope pulls', () => {
    // A brutal step: 20 dB down, instantly. The envelope must crawl.
    const envelope = buildGainEnvelope({
      integratedLufs: -20,
      loudnessRangeLu: 20,
      shortTermLufs: curve([
        [30, -14],
        [30, -34],
      ]),
      stepSeconds: STEP,
    })

    const maxStep = MACRO_LEVEL.slewDbPerSecond * envelope.stepSeconds
    for (let i = 1; i < envelope.gainDb.length; i++) {
      const delta = Math.abs(envelope.gainDb[i]! - envelope.gainDb[i - 1]!)
      expect(delta).toBeLessThanOrEqual(maxStep + 1e-9)
    }
  })
})

describe('property 2 and the clamp', () => {
  it('never exceeds +/-6 dB', () => {
    const envelope = buildGainEnvelope({
      integratedLufs: -20,
      loudnessRangeLu: 30,
      shortTermLufs: curve([
        [40, -50],
        [40, -8],
      ]),
      stepSeconds: STEP,
    })
    for (const value of envelope.gainDb) {
      expect(Math.abs(value)).toBeLessThanOrEqual(MACRO_LEVEL.clampDb + 1e-9)
    }
  })

  it('does not chase a brief dip, because the window is 15 s', () => {
    // Two seconds quieter in the middle of a steady recording. A short window
    // would ride it; a 15 s window barely notices.
    const envelope = buildGainEnvelope({
      integratedLufs: -20,
      loudnessRangeLu: 12,
      shortTermLufs: curve([
        [30, -20],
        [2, -26],
        [30, -20],
      ]),
      stepSeconds: STEP,
    })
    const duringDip = envelope.gainDb[Math.round(31 / envelope.stepSeconds)]!
    expect(Math.abs(duringDip)).toBeLessThan(1)
  })
})

describe('property 4: the pause freeze', () => {
  it('does not turn a pause up into room tone', () => {
    // Twelve seconds of near-silence. Without the freeze this reads as
    // "40 dB too quiet" and the envelope climbs to its +6 dB clamp.
    const envelope = buildGainEnvelope({
      integratedLufs: -20,
      loudnessRangeLu: 15,
      shortTermLufs: curve([
        [30, -20],
        [12, -60],
        [30, -20],
      ]),
      stepSeconds: STEP,
    })
    const duringPause = envelope.gainDb[Math.round(36 / envelope.stepSeconds)]!
    expect(duringPause).toBeLessThan(0.5)
  })

  it('holds the last real value through the pause rather than resetting', () => {
    const envelope = buildGainEnvelope({
      integratedLufs: -20,
      loudnessRangeLu: 15,
      shortTermLufs: curve([
        [40, -25],
        [20, -70],
      ]),
      stepSeconds: STEP,
    })
    // The speech before the pause wants a boost; the pause must not undo it.
    const beforePause = envelope.gainDb[Math.round(38 / envelope.stepSeconds)]!
    const insidePause = envelope.gainDb[Math.round(52 / envelope.stepSeconds)]!
    expect(beforePause).toBeGreaterThan(0.5)
    expect(insidePause).toBeGreaterThan(beforePause - 0.5)
  })
})

describe('correcting real drift', () => {
  it('lifts a speaker who moved away from the microphone', () => {
    const envelope = buildGainEnvelope({
      integratedLufs: -20,
      loudnessRangeLu: 14,
      shortTermLufs: curve([
        [40, -17],
        [60, -26],
      ]),
      stepSeconds: STEP,
    })
    // By the end of the quiet stretch the envelope should have climbed —
    // slowly, but it should have got there.
    expect(envelope.gainDb.at(-1)!).toBeGreaterThan(3)
  })
})

describe('application to audio', () => {
  it('interpolates so the gain never jumps between envelope steps', () => {
    const envelope = buildGainEnvelope({
      integratedLufs: -20,
      loudnessRangeLu: 20,
      shortTermLufs: curve([
        [30, -14],
        [30, -30],
      ]),
      stepSeconds: STEP,
    })
    const sampleRate = 48000
    const leveller = new MacroLeveller(envelope, sampleRate)
    const frames = sampleRate * 30
    const channels = [new Float32Array(frames).fill(0.5)]
    leveller.process(channels)

    let biggestJump = 0
    for (let i = 1; i < frames; i++) {
      biggestJump = Math.max(biggestJump, Math.abs(channels[0]![i]! - channels[0]![i - 1]!))
    }
    // 1 dB/s on a 0.5 amplitude signal is about 1.2e-6 per sample at 48 kHz.
    expect(biggestJump).toBeLessThan(1e-5)
  })
})
