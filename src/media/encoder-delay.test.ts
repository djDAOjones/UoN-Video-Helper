import { AudioSample } from 'mediabunny'
import { describe, expect, it } from 'vitest'

import { AudioTimelineShift } from './encoder-delay'

const SAMPLE_RATE = 48000
const DELAY_SECONDS = 0.044

/** One interleaved stereo sample block whose every frame holds `amplitude`. */
function block(seconds: number, timestamp: number, amplitude: number): AudioSample {
  const frames = Math.round(SAMPLE_RATE * seconds)
  const data = new Float32Array(frames * 2).fill(amplitude)
  return new AudioSample({
    data,
    format: 'f32',
    numberOfChannels: 2,
    sampleRate: SAMPLE_RATE,
    timestamp,
  })
}

/**
 * VH-55 / review R-03. Compensating the AAC encoder's ~44 ms delay shifts the
 * audio timeline earlier, and whatever lands before zero is discarded. Three
 * files in the real corpus carry energy in that window, so what goes is
 * sometimes the attack of the first word.
 *
 * These pin that the loss is MEASURED. Not losing it at all is the second half
 * of VH-55 and needs the video lane re-timed.
 */
describe('AudioTimelineShift', () => {
  it('discards nothing when there is no delay to cancel', () => {
    const shift = new AudioTimelineShift(0, 2)
    const sample = shift.apply(block(0.02, 0, 0.5), SAMPLE_RATE)
    expect(sample).not.toBeNull()
    expect(shift.discarded.frames).toBe(0)
    expect(shift.discarded.peakDbfs).toBe(-Infinity)
    sample?.close()
  })

  it('reports the level of a block dropped whole', () => {
    const shift = new AudioTimelineShift(DELAY_SECONDS, 2)
    // 20 ms at timestamp 0 lands entirely before zero once shifted back 44.
    expect(shift.apply(block(0.02, 0, 0.5), SAMPLE_RATE)).toBeNull()
    expect(shift.discarded.frames).toBe(Math.round(SAMPLE_RATE * 0.02))
    expect(shift.discarded.peakDbfs).toBeCloseTo(20 * Math.log10(0.5), 6)
  })

  it('reports only the part of a straddling block that was dropped', () => {
    const shift = new AudioTimelineShift(DELAY_SECONDS, 2)
    // 100 ms from zero: the first 44 ms go, the remaining 56 ms are kept.
    const kept = shift.apply(block(0.1, 0, 0.25), SAMPLE_RATE)
    expect(kept).not.toBeNull()
    expect(kept?.timestamp).toBe(0)
    expect(shift.discarded.frames).toBe(Math.round(SAMPLE_RATE * DELAY_SECONDS))
    expect(shift.discarded.peakDbfs).toBeCloseTo(20 * Math.log10(0.25), 6)
    expect(kept?.numberOfFrames).toBe(
      Math.round(SAMPLE_RATE * 0.1) - Math.round(SAMPLE_RATE * DELAY_SECONDS),
    )
    kept?.close()
  })

  it('leaves a block that never crossed zero alone', () => {
    const shift = new AudioTimelineShift(DELAY_SECONDS, 2)
    const kept = shift.apply(block(0.02, 1, 0.5), SAMPLE_RATE)
    expect(kept?.timestamp).toBeCloseTo(1 - DELAY_SECONDS, 6)
    expect(shift.discarded.frames).toBe(0)
    kept?.close()
  })

  it('accumulates across blocks and keeps the loudest', () => {
    const shift = new AudioTimelineShift(DELAY_SECONDS, 2)
    shift.apply(block(0.01, 0, 0.01), SAMPLE_RATE)
    shift.apply(block(0.01, 0.01, 0.4), SAMPLE_RATE)
    shift.apply(block(0.01, 0.02, 0.02), SAMPLE_RATE)
    expect(shift.discarded.frames).toBe(3 * Math.round(SAMPLE_RATE * 0.01))
    expect(shift.discarded.peakDbfs).toBeCloseTo(20 * Math.log10(0.4), 6)
  })
})
