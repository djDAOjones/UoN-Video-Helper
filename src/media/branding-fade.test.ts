/**
 * The boundary fade, spec 4.4 and open decision D3.
 *
 * A hard cut between a music sting and speech clicks. D3 assumes a hard cut
 * with a short fade on each side rather than a crossfade or ducking, and these
 * pin what "hard cut with a fade" actually means at the sample level.
 */

import { describe, expect, it } from 'vitest'

import { BOUNDARY_FADE_MS } from '../config/audio'
import { applyBoundaryFade } from './branding'

const SAMPLE_RATE = 48000
const FADE = BOUNDARY_FADE_MS / 1000

function flat(seconds: number): Float32Array[] {
  return [new Float32Array(Math.round(seconds * SAMPLE_RATE)).fill(1)]
}

const at = (channels: readonly Float32Array[], seconds: number) =>
  channels[0]![Math.round(seconds * SAMPLE_RATE)]!

describe('applyBoundaryFade', () => {
  it('ramps in from silence over the fade time', () => {
    const channels = flat(1)
    applyBoundaryFade(channels, {
      chunkStartSeconds: 0, segmentDurationSeconds: 1, sampleRate: SAMPLE_RATE,
      fadeIn: true, fadeOut: false,
    })
    expect(at(channels, 0)).toBeCloseTo(0, 3)
    expect(at(channels, FADE / 2)).toBeCloseTo(0.5, 2)
    expect(at(channels, FADE)).toBeCloseTo(1, 3)
    expect(at(channels, 0.5)).toBeCloseTo(1, 6)
  })

  it('ramps out to silence at the end of the segment', () => {
    const channels = flat(1)
    applyBoundaryFade(channels, {
      chunkStartSeconds: 0, segmentDurationSeconds: 1, sampleRate: SAMPLE_RATE,
      fadeIn: false, fadeOut: true,
    })
    expect(at(channels, 0)).toBeCloseTo(1, 6)
    expect(at(channels, 1 - FADE)).toBeCloseTo(1, 2)
    expect(at(channels, 1 - FADE / 2)).toBeCloseTo(0.5, 2)
    expect(channels[0]!.at(-1)!).toBeLessThan(0.01)
  })

  it('leaves a segment alone when neither side is a boundary', () => {
    // Branding off on both sides: nothing to smooth, so nothing is touched.
    const channels = flat(0.5)
    applyBoundaryFade(channels, {
      chunkStartSeconds: 0, segmentDurationSeconds: 0.5, sampleRate: SAMPLE_RATE,
      fadeIn: false, fadeOut: false,
    })
    expect(Math.min(...channels[0]!)).toBe(1)
  })

  it('places the fade correctly when audio arrives in chunks', () => {
    // The real path feeds chunk by chunk, and the fade position depends on
    // where the chunk sits in the segment — not where it sits in the chunk.
    const whole = flat(1)
    applyBoundaryFade(whole, {
      chunkStartSeconds: 0, segmentDurationSeconds: 1, sampleRate: SAMPLE_RATE,
      fadeIn: true, fadeOut: true,
    })

    const chunked = flat(1)
    const chunkFrames = 1024
    for (let offset = 0; offset < chunked[0]!.length; offset += chunkFrames) {
      const end = Math.min(offset + chunkFrames, chunked[0]!.length)
      applyBoundaryFade([chunked[0]!.subarray(offset, end)], {
        chunkStartSeconds: offset / SAMPLE_RATE,
        segmentDurationSeconds: 1, sampleRate: SAMPLE_RATE,
        fadeIn: true, fadeOut: true,
      })
    }

    for (let i = 0; i < whole[0]!.length; i += 511) {
      expect(chunked[0]![i]!).toBeCloseTo(whole[0]![i]!, 6)
    }
  })

  it('never amplifies', () => {
    const channels = flat(1)
    applyBoundaryFade(channels, {
      chunkStartSeconds: 0, segmentDurationSeconds: 1, sampleRate: SAMPLE_RATE,
      fadeIn: true, fadeOut: true,
    })
    expect(Math.max(...channels[0]!)).toBeLessThanOrEqual(1)
  })
})
