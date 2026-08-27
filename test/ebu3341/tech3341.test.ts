/**
 * EBU Tech 3341 Table 1 — "Minimum requirements test signals".
 *
 * Spec section 13, acceptance criterion 3, and the hard gate VH-3 exists to
 * be: a bespoke meter that has not been checked against reference material
 * cannot be trusted to level real content. This runs inside `npm run check`,
 * so a change that breaks meter accuracy fails the gate rather than being
 * discovered by ear.
 *
 * Table 1 is quoted per case. Signals are synthesised from those definitions
 * by ./signals.ts rather than downloaded — see the note there.
 */

import { describe, expect, it } from 'vitest'

import { AudioAnalyser } from '../../src/audio/analyse'
import { LoudnessAnalyser } from '../../src/audio/loudness'
import { TruePeakDetector } from '../../src/audio/truepeak'
import { perChannelTone, sequence, truePeakBurst, truePeakTone, type Segment } from './signals'

const SAMPLE_RATE = 48000
/** Table 1 tolerance for every loudness case. */
const LU = 0.1
/** Table 1 tolerance for every true-peak case: +0.2 / -0.4 dBTP. */
const TP_PLUS = 0.2
const TP_MINUS = 0.4

/** "The loudness meter shall be reset before each measurement" — a fresh instance each time. */
function measure(channels: readonly Float32Array[]) {
  const analyser = new LoudnessAnalyser({
    sampleRate: SAMPLE_RATE,
    channelCount: channels.length,
  })
  analyser.addFrames(channels)
  return analyser.finish()
}

function truePeakOf(channels: readonly Float32Array[]): number {
  const detector = new TruePeakDetector(channels.length)
  detector.addFrames(channels)
  // The interpolator is causal, so the final frames are only measured once
  // silence has been clocked through it (VH-50 / review R-02).
  detector.finish()
  return detector.peakDbtp
}

/** Table 1's symmetric +/-0.1 LU tolerance, stated rather than approximated. */
function expectLoudness(actual: number, expected: number, label?: string): void {
  expect(Math.abs(actual - expected), label ?? `${actual} vs ${expected}`).toBeLessThanOrEqual(LU)
}

function expectTruePeak(actual: number, expected: number): void {
  expect(actual).toBeGreaterThanOrEqual(expected - TP_MINUS)
  expect(actual).toBeLessThanOrEqual(expected + TP_PLUS)
}

/** Index of the momentary/short-term value whose window ends at `seconds`. */
function indexAt(seconds: number, windowSeconds: number, stepSeconds: number): number {
  return Math.round((seconds - windowSeconds) / stepSeconds)
}

const stereo = (segments: readonly Segment[]) => sequence(SAMPLE_RATE, 2, segments)

describe('EBU Tech 3341 Table 1 — loudness', () => {
  it('case 1: stereo 1 kHz at -23.0 dBFS peak, 20 s -> M, S, I = -23.0', () => {
    const report = measure(stereo([{ seconds: 20, peakDbfs: -23 }]))
    expectLoudness(report.integratedLufs, -23)
    expectLoudness(Math.max(...report.momentaryLufs), -23)
    expectLoudness(Math.max(...report.shortTermLufs), -23)
  })

  it('case 2: as case 1 at -33.0 dBFS -> M, S, I = -33.0', () => {
    const report = measure(stereo([{ seconds: 20, peakDbfs: -33 }]))
    expectLoudness(report.integratedLufs, -33)
    expectLoudness(Math.max(...report.momentaryLufs), -33)
    expectLoudness(Math.max(...report.shortTermLufs), -33)
  })

  it('case 3: 10 s -36, 60 s -23, 10 s -36 -> I = -23.0 (relative gate)', () => {
    // The -36 dBFS segments sit below the relative gate and must be excluded.
    const report = measure(
      stereo([
        { seconds: 10, peakDbfs: -36 },
        { seconds: 60, peakDbfs: -23 },
        { seconds: 10, peakDbfs: -36 },
      ]),
    )
    expectLoudness(report.integratedLufs, -23)
  })

  it('case 4: as case 3 wrapped in 10 s of -72 -> I = -23.0 (absolute gate)', () => {
    // -72 dBFS is below the -70 LUFS absolute gate.
    const report = measure(
      stereo([
        { seconds: 10, peakDbfs: -72 },
        { seconds: 10, peakDbfs: -36 },
        { seconds: 60, peakDbfs: -23 },
        { seconds: 10, peakDbfs: -36 },
        { seconds: 10, peakDbfs: -72 },
      ]),
    )
    expectLoudness(report.integratedLufs, -23)
  })

  it('case 5: 20 s -26, 20.1 s -20, 20 s -26 -> I = -23.0 (nothing gated out)', () => {
    // Chosen so every block survives both gates and the energy mean lands
    // exactly on -23. A meter that over-gates fails here.
    const report = measure(
      stereo([
        { seconds: 20, peakDbfs: -26 },
        { seconds: 20.1, peakDbfs: -20 },
        { seconds: 20, peakDbfs: -26 },
      ]),
    )
    expectLoudness(report.integratedLufs, -23)
  })

  it('case 6: 5.0 channel, L/R -28, C -24, Ls/Rs -30 -> I = -23.0', () => {
    // Five channels, no LFE. Passes only with the +1.5 dB surround weighting.
    const report = measure(perChannelTone(SAMPLE_RATE, 20, [-28, -28, -24, -30, -30]))
    expectLoudness(report.integratedLufs, -23)
  })

  it.skip('cases 7 and 8: authentic programme material — needs the EBU audio files', () => {
    // Table 1 cases 7 and 8 are real programme segments (narrow and wide
    // loudness range) distributed by the EBU as audio. They cannot be
    // synthesised from a description, so they are not run here. Cases 3, 4
    // and 5 exercise the same gating behaviour on signals we can derive.
  })

  it('case 9: (1.34 s -20, 1.66 s -30) x5 -> S = -23.0, constant after 3 s', () => {
    const report = measure(
      stereo(
        Array.from({ length: 5 }, () => [
          { seconds: 1.34, peakDbfs: -20 },
          { seconds: 1.66, peakDbfs: -30 },
        ]).flat(),
      ),
    )
    // The pattern's period is exactly 3 s, so every 3 s window sees one whole
    // period and the reading must not move.
    for (const value of report.shortTermLufs) expectLoudness(value, -23)
  })

  it('case 10: 20 segments, tone offset by i x 0.15 s -> Max S = -23.0 each', () => {
    for (let i = 0; i < 20; i++) {
      const report = measure(
        stereo([
          { seconds: i * 0.15, peakDbfs: null },
          { seconds: 3, peakDbfs: -23 },
          { seconds: 1, peakDbfs: null },
        ]),
      )
      expectLoudness(Math.max(...report.shortTermLufs), -23, `segment ${i}`)
    }
  })

  it('case 11: one file, 20 tones rising -38..-19 -> successive Max S', () => {
    const report = measure(
      stereo(
        Array.from({ length: 20 }, (_unused, i) => [
          { seconds: i * 0.15, peakDbfs: null },
          { seconds: 3, peakDbfs: -38 + i },
          { seconds: 3 - i * 0.15, peakDbfs: null },
        ]).flat(),
      ),
    )
    // Each unit is exactly 6 s long.
    for (let i = 0; i < 20; i++) {
      const from = Math.max(0, indexAt(i * 6, 3, report.stepSeconds))
      const to = indexAt((i + 1) * 6, 3, report.stepSeconds)
      const window = report.shortTermLufs.slice(from, to)
      expectLoudness(Math.max(...window), -38 + i, `unit ${i}`)
    }
  })

  it('case 12: (0.18 s -20, 0.22 s -30) x25 -> M = -23.0, constant after 1 s', () => {
    const report = measure(
      stereo(
        Array.from({ length: 25 }, () => [
          { seconds: 0.18, peakDbfs: -20 },
          { seconds: 0.22, peakDbfs: -30 },
        ]).flat(),
      ),
    )
    // Period is exactly 0.4 s — the momentary window length.
    const from = indexAt(1, 0.4, report.stepSeconds)
    for (const value of report.momentaryLufs.slice(from)) expectLoudness(value, -23)
  })

  it('case 13: 20 segments, tone offset by i x 20 ms -> Max M = -23.0 each', () => {
    // The case that a 100 ms update grid cannot pass: at i = 1 the best-aligned
    // 400 ms window would hold only 380 ms of tone and read -23.22.
    for (let i = 0; i < 20; i++) {
      const report = measure(
        stereo([
          { seconds: i * 0.02, peakDbfs: null },
          { seconds: 0.4, peakDbfs: -23 },
          { seconds: 1, peakDbfs: null },
        ]),
      )
      expectLoudness(Math.max(...report.momentaryLufs), -23, `segment ${i}`)
    }
  })

  it('case 14: one file, 20 tones rising -38..-19 -> successive Max M', () => {
    const report = measure(
      stereo(
        Array.from({ length: 20 }, (_unused, i) => [
          { seconds: i * 0.02, peakDbfs: null },
          { seconds: 0.4, peakDbfs: -38 + i },
          { seconds: 0.4 - i * 0.02, peakDbfs: null },
        ]).flat(),
      ),
    )
    // Each unit is exactly 0.8 s long.
    for (let i = 0; i < 20; i++) {
      const from = Math.max(0, indexAt(i * 0.8, 0.4, report.stepSeconds))
      const to = indexAt((i + 1) * 0.8, 0.4, report.stepSeconds)
      const window = report.momentaryLufs.slice(from, to)
      expectLoudness(Math.max(...window), -38 + i, `unit ${i}`)
    }
  })
})

describe('EBU Tech 3341 Table 1 — true peak', () => {
  it('case 15: fs/4, amplitude 0.50, phase 0 deg -> -6.0 dBTP', () => {
    expectTruePeak(
      truePeakOf(truePeakTone(SAMPLE_RATE, { divisor: 4, amplitude: 0.5, phaseDegrees: 0 })),
      -6,
    )
  })

  it('case 16: fs/4, amplitude 0.50, phase 45 deg -> -6.0 dBTP', () => {
    // Every sample sits at +/-0.354 (-9 dBFS); the peak is entirely between them.
    expectTruePeak(
      truePeakOf(truePeakTone(SAMPLE_RATE, { divisor: 4, amplitude: 0.5, phaseDegrees: 45 })),
      -6,
    )
  })

  it('case 17: fs/6, amplitude 0.50, phase 60 deg -> -6.0 dBTP', () => {
    expectTruePeak(
      truePeakOf(truePeakTone(SAMPLE_RATE, { divisor: 6, amplitude: 0.5, phaseDegrees: 60 })),
      -6,
    )
  })

  it('case 18: fs/8, amplitude 0.50, phase 67.5 deg -> -6.0 dBTP', () => {
    expectTruePeak(
      truePeakOf(truePeakTone(SAMPLE_RATE, { divisor: 8, amplitude: 0.5, phaseDegrees: 67.5 })),
      -6,
    )
  })

  it('case 19: fs/4, amplitude 1.41, phase 45 deg -> +3.0 dBTP', () => {
    // Above full scale by design — the meter must not clamp at 0 dBTP.
    expectTruePeak(
      truePeakOf(truePeakTone(SAMPLE_RATE, { divisor: 4, amplitude: 1.41, phaseDegrees: 45 })),
      3,
    )
  })

  it.each([0, 1, 2, 3])(
    'cases 20-23: fs/4 burst downsampled with offset %i -> 0.0 dBTP',
    (offset) => {
      expectTruePeak(truePeakOf(truePeakBurst(SAMPLE_RATE, offset)), 0)
    },
  )
})

describe('EBU Tech 3341 section 2.9 — calibration', () => {
  it('a 1 kHz stereo sine at -18 dBFS peak reads -18.0 LUFS', () => {
    // The document's own alignment check, quoted: "a 1 kHz stereo sine-wave
    // (signal applied in phase to both channels simultaneously), with its peak
    // level at -18 dBFS ... The meter should read -18.0 LUFS."
    const analyser = new AudioAnalyser({ sampleRate: SAMPLE_RATE, channelCount: 2 })
    analyser.addFrames(stereo([{ seconds: 20, peakDbfs: -18 }]))
    expectLoudness(analyser.finish().integratedLufs, -18)
  })
})
