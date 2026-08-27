/**
 * The limiter's one hard promise: the output never exceeds -2.0 dBTP. That is
 * what makes the ceiling in spec 5.1 a guarantee rather than an aspiration,
 * and what leaves room for the lossy re-encode EchoVideo and YouTube apply.
 */

import { describe, expect, it } from 'vitest'

import { ENCODE_TRUE_PEAK_HEADROOM_DB, LIMITER, TRUE_PEAK_CEILING_DBTP } from '../config/audio'
import { concat, silence, tone } from '../../test/helpers/signals'
import { TruePeakLimiter } from './limiter'
import { TruePeakDetector } from './truepeak'

const SAMPLE_RATE = 48000
/**
 * What the limiter promises about its OWN output, which is below the published
 * ceiling by the headroom AAC needs (VH-50). Read from config rather than
 * written as -2, so retuning the headroom cannot leave this asserting a figure
 * the limiter no longer targets.
 */
const CEILING = LIMITER.ceilingDbtp

function limit(channels: Float32Array[], chunkFrames = 1024): Float32Array[] {
  const limiter = new TruePeakLimiter({ sampleRate: SAMPLE_RATE, channelCount: channels.length })
  const copies = channels.map((c) => c.slice())
  for (let offset = 0; offset < copies[0]!.length; offset += chunkFrames) {
    const end = Math.min(offset + chunkFrames, copies[0]!.length)
    limiter.process(copies.map((c) => c.subarray(offset, end)))
  }
  const tail = limiter.flush()
  return copies.map((c, ch) => {
    const out = new Float32Array(c.length + tail[ch]!.length)
    out.set(c, 0)
    out.set(tail[ch]!, c.length)
    return out
  })
}

function truePeakDbtp(channels: readonly Float32Array[]): number {
  const detector = new TruePeakDetector(channels.length)
  detector.addFrames(channels)
  detector.finish()
  return detector.peakDbtp
}

describe('true-peak limiter', () => {
  it('targets a working ceiling below the ceiling the file must meet', () => {
    // The limiter is not the last thing that touches the signal: AAC is. A
    // stream limited to exactly the published ceiling decodes above it, which
    // is how four of four real lectures breached criterion 2 while the limiter
    // was doing exactly what it said (VH-50).
    expect(CEILING).toBeLessThan(TRUE_PEAK_CEILING_DBTP)
    expect(CEILING).toBeCloseTo(TRUE_PEAK_CEILING_DBTP - ENCODE_TRUE_PEAK_HEADROOM_DB, 9)
  })

  it('holds the ceiling on a signal that reaches full scale between samples', () => {
    // fs/4 at 45 degrees: every sample sits at +/-0.707 while the waveform
    // itself touches 0 dBFS. A sample-peak limiter would not even see this.
    const channels = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 2,
      frequency: SAMPLE_RATE / 4,
      peakDbfs: 0,
      channelCount: 2,
      phase: Math.PI / 4,
      fadeSeconds: 0.01,
    })
    expect(truePeakDbtp(channels)).toBeGreaterThan(CEILING)
    expect(truePeakDbtp(limit(channels))).toBeLessThanOrEqual(CEILING + 0.01)
  })

  it('holds the ceiling on a signal far above it', () => {
    const channels = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 1,
      frequency: 997,
      peakDbfs: 0,
      channelCount: 2,
      fadeSeconds: 0.01,
    })
    expect(truePeakDbtp(limit(channels))).toBeLessThanOrEqual(CEILING + 0.01)
  })

  it('leaves material below the ceiling completely untouched', () => {
    const channels = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 1,
      frequency: 997,
      peakDbfs: -12,
      channelCount: 2,
      fadeSeconds: 0.01,
    })
    const limited = limit(channels)
    const latency = new TruePeakLimiter({ sampleRate: SAMPLE_RATE, channelCount: 2 }).latencySamples
    // Aligned for the look-ahead delay, the samples should be identical.
    for (let i = 5000; i < 20000; i += 97) {
      expect(limited[0]![i + latency]!).toBeCloseTo(channels[0]![i]!, 6)
    }
  })

  it('recovers after a loud passage instead of holding the level down', () => {
    // A burst, then quiet. Without a release the quiet part would stay ducked.
    const signal = concat(
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 0.3,
        frequency: 997,
        peakDbfs: -20,
        channelCount: 1,
      }),
      tone({ sampleRate: SAMPLE_RATE, seconds: 0.2, frequency: 997, peakDbfs: 0, channelCount: 1 }),
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 0.5,
        frequency: 997,
        peakDbfs: -20,
        channelCount: 1,
      }),
    )
    const limited = limit(signal)

    // 200 ms after the burst ends — four release time constants — the quiet
    // material should be back to its own level.
    const wellAfter = Math.round(SAMPLE_RATE * 0.72)
    let peak = 0
    for (let i = wellAfter; i < wellAfter + 4000; i++)
      peak = Math.max(peak, Math.abs(limited[0]![i]!))
    expect(20 * Math.log10(peak)).toBeCloseTo(-20, 0)
  })

  it('gives the same result regardless of chunk size', () => {
    const channels = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 0.5,
      frequency: SAMPLE_RATE / 4,
      peakDbfs: -1,
      channelCount: 2,
      phase: Math.PI / 4,
      fadeSeconds: 0.01,
    })
    const readings = [1, 33, 1024, channels[0]!.length].map((n) => truePeakDbtp(limit(channels, n)))
    for (const reading of readings) expect(reading).toBeCloseTo(readings[0]!, 9)
  })

  it('holds the ceiling on a transient in the final frames (VH-50)', () => {
    // The tail used to be copied out of the delay line at one frozen gain,
    // which skipped both the detector post-roll and the sliding minimum. A
    // full-scale sample in the last frame therefore left the limiter at
    // 0 dBTP — 2 dB above the ceiling — while the meter reported -64.
    const frames = new Float32Array(480)
    frames[frames.length - 1] = 1
    const limited = limit([frames])
    expect(truePeakDbtp(limited)).toBeLessThanOrEqual(CEILING + 0.01)
  })

  it('holds the ceiling wherever the transient sits relative to the end', () => {
    // Swept, because the defect was position-dependent: 0, 1 and 3 frames from
    // the end escaped the limiter while 6 and beyond did not.
    for (const fromEnd of [0, 1, 3, 6, 7, 12, 240, 480]) {
      const frames = new Float32Array(1200)
      frames[frames.length - 1 - fromEnd] = 1
      expect(truePeakDbtp(limit([frames])), `${fromEnd} frames from EOF`).toBeLessThanOrEqual(
        CEILING + 0.01,
      )
    }
  })

  it('does not wrap its sample counter on an impossibly long stream (VH-68)', () => {
    // The sliding minimum counts samples for the length of the file and never
    // resets. In an Int32Array that wraps past 2^31 — 12.4 hours at 48 kHz —
    // after which the expiry comparison goes negative and the ring cycles
    // forever. Reached here by pushing the counter past the boundary directly,
    // because clocking 2.1 billion samples through is not a test.
    const limiter = new TruePeakLimiter({ sampleRate: SAMPLE_RATE, channelCount: 1 })
    const minimum = (
      limiter as unknown as { minimum: { position: number; push(v: number): number } }
    ).minimum
    minimum.position = 2 ** 31 + 1000

    // Ten pushes either side of where the wrap used to be. Each must return
    // the running minimum and, above all, must return.
    for (let i = 0; i < 20; i++) {
      expect(minimum.push(1 - i / 100)).toBeCloseTo(1 - i / 100, 9)
    }
    expect(minimum.position).toBeGreaterThan(2 ** 31)
  })

  it('passes silence through as silence', () => {
    const limited = limit(silence(SAMPLE_RATE, 0.5, 2))
    expect(Math.max(...limited[0]!)).toBe(0)
  })
})
