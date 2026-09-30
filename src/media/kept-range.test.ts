/**
 * The kept range (VH-95): what counts as a cut, what is refused, and how a
 * decoded block is sliced to it.
 *
 * The slicing is the invariant that matters most. Every audio pass runs it,
 * and if two passes disagreed by a frame, the gain envelope measured in one
 * would be applied to a stream indexed differently in the other.
 */

import { describe, expect, it } from 'vitest'

import { KEPT_MIN_SECONDS } from '../config/trim'
import {
  KeptRangeError,
  clipAudioBlock,
  keptAudioAnchorSeconds,
  keptDurationSeconds,
  normaliseKeptRange,
  snapKeptRangeToFrames,
} from './kept-range'

const RATE = 48000

describe('normaliseKeptRange', () => {
  it('is no cut at all when nothing was asked for', () => {
    expect(normaliseKeptRange(undefined, 120)).toBeNull()
    expect(normaliseKeptRange(null, 120)).toBeNull()
  })

  it('is no cut when the range is the whole file, so the job takes the untrimmed path', () => {
    expect(normaliseKeptRange({ startSeconds: 0, endSeconds: 120 }, 120)).toBeNull()
    // A handle nudged back to the edge comes back a rounding away from it.
    expect(normaliseKeptRange({ startSeconds: 0.0004, endSeconds: 119.9996 }, 120)).toBeNull()
  })

  it('keeps a cut at one end only', () => {
    expect(normaliseKeptRange({ startSeconds: 12.5, endSeconds: 120 }, 120)).toEqual({
      startSeconds: 12.5,
      endSeconds: 120,
    })
    expect(normaliseKeptRange({ startSeconds: 0, endSeconds: 90 }, 120)).toEqual({
      startSeconds: 0,
      endSeconds: 90,
    })
  })

  it('brings an end past the file back to the file', () => {
    expect(normaliseKeptRange({ startSeconds: 10, endSeconds: 500 }, 120)).toEqual({
      startSeconds: 10,
      endSeconds: 120,
    })
  })

  it.each([
    [{ startSeconds: Number.NaN, endSeconds: 10 }, /not a time/],
    [{ startSeconds: 0, endSeconds: Number.POSITIVE_INFINITY }, /not a time/],
    [{ startSeconds: 130, endSeconds: 140 }, /after the end of the video/],
    [{ startSeconds: 50, endSeconds: 40 }, /end must come after the start/],
    [{ startSeconds: 50, endSeconds: 50 }, /end must come after the start/],
    [{ startSeconds: 50, endSeconds: 50 + KEPT_MIN_SECONDS - 0.01 }, /at least 3 seconds/],
  ])('refuses %o rather than guessing what was meant', (range, message) => {
    expect(() => normaliseKeptRange(range, 120)).toThrow(KeptRangeError)
    expect(() => normaliseKeptRange(range, 120)).toThrow(message)
  })

  it('treats the whole of a file shorter than the minimum as no cut, not a refusal', () => {
    // Codex review of VH-95: untouched handles on a 2 s file sent 0–2 s, and
    // the minimum refused a file an absent range would have kept whole.
    expect(normaliseKeptRange({ startSeconds: 0, endSeconds: 2 }, 2)).toBeNull()
  })

  it('accepts a keep of exactly the minimum', () => {
    expect(normaliseKeptRange({ startSeconds: 50, endSeconds: 50 + KEPT_MIN_SECONDS }, 120)).not.toBeNull()
  })
})

describe('keptDurationSeconds', () => {
  it('is the range when there is one, and the file when there is not', () => {
    expect(keptDurationSeconds({ startSeconds: 10, endSeconds: 70 }, 120)).toBe(60)
    expect(keptDurationSeconds(null, 120)).toBe(120)
  })
})

describe('clipAudioBlock', () => {
  /** A block whose every frame holds its own index, so a slice is legible. */
  const block = (frames: number) => [
    Float32Array.from({ length: frames }, (_, i) => i),
    Float32Array.from({ length: frames }, (_, i) => -i),
  ]

  it('passes a block through untouched when there is no range', () => {
    const planar = block(960)
    const kept = clipAudioBlock(planar, 5, RATE, null)
    expect(kept?.timestampSeconds).toBe(5)
    expect(kept?.planar[0]).toBe(planar[0])
  })

  it('starts the sound exactly at the in-point, not on the block that contains it', () => {
    // The ranged read hands over the block containing the cut: 20 ms from
    // 9.99, cut at 10.0 — the first 480 frames are before it.
    const kept = clipAudioBlock(block(960), 9.99, RATE, { startSeconds: 10, endSeconds: 60 })
    expect(kept?.timestampSeconds).toBeCloseTo(10, 9)
    expect(kept?.planar[0]?.length).toBe(480)
    expect(kept?.planar[0]?.[0]).toBe(480)
    expect(kept?.planar[1]?.[0]).toBe(-480)
  })

  it('stops the sound exactly at the out-point', () => {
    const kept = clipAudioBlock(block(960), 59.99, RATE, { startSeconds: 10, endSeconds: 60 })
    expect(kept?.timestampSeconds).toBe(59.99)
    expect(kept?.planar[0]?.length).toBe(480)
    expect(kept?.planar[0]?.at(-1)).toBe(479)
  })

  it('keeps nothing of a block wholly outside the range', () => {
    expect(clipAudioBlock(block(960), 5, RATE, { startSeconds: 10, endSeconds: 60 })).toBeNull()
    expect(clipAudioBlock(block(960), 60, RATE, { startSeconds: 10, endSeconds: 60 })).toBeNull()
  })

  it('tiles: consecutive blocks sliced to a range give exactly the range, frame for frame', () => {
    // 20 ms blocks from 9.99 to 60.01; the range is 50 s, so 2,400,000 frames.
    const range = { startSeconds: 10, endSeconds: 60 }
    let frames = 0
    let expectedNext: number | null = null
    for (let t = 9.99; t < 60.01; t += 0.02) {
      const kept = clipAudioBlock(block(960), t, RATE, range)
      if (!kept) continue
      if (expectedNext !== null) expect(kept.timestampSeconds).toBeCloseTo(expectedNext, 6)
      frames += kept.planar[0]!.length
      expectedNext = kept.timestampSeconds + kept.planar[0]!.length / RATE
    }
    expect(frames).toBe(50 * RATE)
  })
})

describe('snapKeptRangeToFrames', () => {
  const frame = (timestampSeconds: number) => ({ timestampSeconds, durationSeconds: 0.04 })

  it('starts on the frame showing at the in-point, so both lanes start on its edge', () => {
    // Measured before this existed: a cut at 12.3 s on a 25 fps source, half
    // way through the frame from 12.28, put the picture 24 ms behind the sound
    // at every marker.
    expect(snapKeptRangeToFrames({ startSeconds: 12.3, endSeconds: 47.7 }, frame(12.28), null)).toEqual({
      startSeconds: 12.28,
      endSeconds: 47.7,
    })
  })

  it('ends at the end of the frame showing at the out-point, keeping it whole', () => {
    const snapped = snapKeptRangeToFrames({ startSeconds: 12.28, endSeconds: 47.7 }, null, frame(47.68))
    expect(snapped.endSeconds).toBeCloseTo(47.72, 9)
  })

  it('leaves a cut that is already on a frame edge where it is', () => {
    expect(snapKeptRangeToFrames({ startSeconds: 12.28, endSeconds: 47.72 }, frame(12.28), frame(47.72))).toEqual({
      startSeconds: 12.28,
      endSeconds: 47.72,
    })
  })

  it('leaves the cuts alone when there is no frame to measure against', () => {
    expect(snapKeptRangeToFrames({ startSeconds: 1, endSeconds: 9 }, null, null)).toEqual({
      startSeconds: 1,
      endSeconds: 9,
    })
  })
})

describe('keptAudioAnchorSeconds', () => {
  const range = { startSeconds: 7, endSeconds: 30 }

  it('anchors a track already running at the cut to the cut', () => {
    expect(keptAudioAnchorSeconds(range, 0)).toBe(7)
  })

  it('anchors a track that starts after the cut to its own start, so it is not padded twice', () => {
    expect(keptAudioAnchorSeconds(range, 8)).toBe(8)
  })

  it('is nothing without a range, keeping the untrimmed rule', () => {
    expect(keptAudioAnchorSeconds(null, 0)).toBeNull()
  })

  it('falls back to the cut when the track start is unknown', () => {
    expect(keptAudioAnchorSeconds(range, null)).toBe(7)
    expect(keptAudioAnchorSeconds(range, Number.NaN)).toBe(7)
  })
})
