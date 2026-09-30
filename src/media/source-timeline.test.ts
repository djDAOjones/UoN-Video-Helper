/**
 * VH-74 / review P1-02. The pipeline preserved the video lane's offsets and
 * collapsed the audio lane's, so a late-starting or gapped audio track came
 * out ahead of its picture — silently, which is the failure `AGENTS.md` ranks
 * worst.
 *
 * These pin the arithmetic. `audio-plan.test.ts` pins what it does to a real
 * decoded stream.
 */

import { describe, expect, it } from 'vitest'

import { AudioGapFiller, deriveSourceTimeline } from './source-timeline'

const SAMPLE_RATE = 48000

describe('deriveSourceTimeline with a trim (VH-95)', () => {
  it('changes nothing when there is no cut', () => {
    expect(deriveSourceTimeline(0, 5, null)).toEqual(deriveSourceTimeline(0, 5))
    expect(deriveSourceTimeline(2, 3, null)).toEqual(deriveSourceTimeline(2, 3))
  })

  it('makes the in-point the origin for both lanes', () => {
    const t = deriveSourceTimeline(0, 0, 12.5)
    expect(t.originSeconds).toBe(12.5)
    expect(t.videoOffsetSeconds).toBe(0)
    expect(t.audioOffsetSeconds).toBe(0)
  })

  it('offsets a lane that starts after the cut from the cut, not from the file', () => {
    // Audio joins at 8 s; the user keeps from 5 s. Three seconds of picture
    // before the sound, as in the source.
    const t = deriveSourceTimeline(0, 8, 5)
    expect(t.originSeconds).toBe(5)
    expect(t.videoOffsetSeconds).toBe(0)
    expect(t.audioOffsetSeconds).toBe(3)
  })

  it('starts a late lane at the cut when the cut is after it joined', () => {
    const t = deriveSourceTimeline(0, 8, 10)
    expect(t.originSeconds).toBe(10)
    expect(t.audioOffsetSeconds).toBe(0)
  })

  it('ignores a cut before the file starts', () => {
    expect(deriveSourceTimeline(2, 3, 1)).toEqual(deriveSourceTimeline(2, 3))
  })
})

describe('AudioGapFiller anchored at a cut (VH-95)', () => {
  it('pads a first sample that arrives after the anchor, as it would any late sample', () => {
    const gaps = new AudioGapFiller(SAMPLE_RATE, 2, 7)
    expect(gaps.framesMissingBefore(10)).toBe(3 * SAMPLE_RATE)
  })

  it('pads nothing when the first sample is at the anchor', () => {
    const gaps = new AudioGapFiller(SAMPLE_RATE, 2, 7)
    expect(gaps.framesMissingBefore(7)).toBe(0)
  })
})

describe('deriveSourceTimeline', () => {
  it('starts both lanes at zero when the file does', () => {
    const t = deriveSourceTimeline(0, 0)

    expect(t.originSeconds).toBe(0)
    expect(t.videoOffsetSeconds).toBe(0)
    expect(t.audioOffsetSeconds).toBe(0)
  })

  it('keeps the offset when audio joins late', () => {
    // The defect in one line: this used to be zero, and five seconds of
    // separation between picture and sound went missing.
    const t = deriveSourceTimeline(0, 5)

    expect(t.originSeconds).toBe(0)
    expect(t.videoOffsetSeconds).toBe(0)
    expect(t.audioOffsetSeconds).toBe(5)
  })

  it('keeps the offset when the picture is the late one', () => {
    const t = deriveSourceTimeline(0.5, 0)

    expect(t.originSeconds).toBe(0)
    expect(t.videoOffsetSeconds).toBe(0.5)
    expect(t.audioOffsetSeconds).toBe(0)
  })

  it('measures from the earlier lane when neither starts at zero', () => {
    const t = deriveSourceTimeline(2, 3)

    expect(t.originSeconds).toBe(2)
    expect(t.videoOffsetSeconds).toBe(0)
    expect(t.audioOffsetSeconds).toBe(1)
  })

  it('has no offset to keep when there is no audio track', () => {
    const t = deriveSourceTimeline(1.25, null)

    expect(t.originSeconds).toBe(1.25)
    expect(t.videoOffsetSeconds).toBe(0)
    expect(t.audioOffsetSeconds).toBe(0)
  })

  it('treats a negative or non-finite timestamp as absent, not as truth', () => {
    // A real corpus file (CULT1027) reports its audio at -21.3 ms: decoder
    // priming the edit list says to skip, not sound anyone recorded. Delaying
    // the picture to "preserve" it would move the video to match samples
    // nobody is meant to hear.
    expect(deriveSourceTimeline(-1, 4).originSeconds).toBe(4)
    expect(deriveSourceTimeline(Number.NaN, 4).videoOffsetSeconds).toBe(0)
    expect(deriveSourceTimeline(null, null).originSeconds).toBe(0)
  })
})

describe('AudioGapFiller', () => {
  it('inserts nothing for a contiguous stream', () => {
    const filler = new AudioGapFiller(SAMPLE_RATE, 2)

    expect(filler.framesMissingBefore(0)).toBe(0)
    filler.accept(1024)
    expect(filler.framesMissingBefore(1024 / SAMPLE_RATE)).toBe(0)
    filler.accept(1024)

    expect(filler.insertedFrames).toBe(0)
  })

  it('never pads a late FIRST sample — that is an offset, not a gap', () => {
    // Padding it would move the track's end as well as its start. The caller
    // carries the offset instead.
    const filler = new AudioGapFiller(SAMPLE_RATE, 2)

    expect(filler.framesMissingBefore(5)).toBe(0)
    expect(filler.firstTimestampSeconds).toBe(5)
    expect(filler.insertedFrames).toBe(0)
  })

  it('fills a midstream hole with exactly the silence it stands for', () => {
    const filler = new AudioGapFiller(SAMPLE_RATE, 2)
    filler.framesMissingBefore(0)
    filler.accept(SAMPLE_RATE) // one second of audio

    // Next sample says it belongs at three seconds: two seconds are missing.
    const missing = filler.framesMissingBefore(3)
    const blocks = [...filler.silence(missing, SAMPLE_RATE)]

    expect(missing).toBe(2 * SAMPLE_RATE)
    expect(blocks.every((block) => block.length === 2)).toBe(true)
    expect(blocks.reduce((total, block) => total + block[0]!.length, 0)).toBe(2 * SAMPLE_RATE)
    expect(blocks.every((block) => block.every((plane) => plane.every((value) => value === 0)))).toBe(true)
    expect(filler.insertedFrames).toBe(2 * SAMPLE_RATE)
  })

  it('does not accumulate rounding across many gaps', () => {
    // Positions come from each sample's own timestamp against the frames
    // consumed, never from adding up per-gap corrections — so the error stays
    // bounded at half a frame for the whole file rather than growing with the
    // number of gaps.
    const filler = new AudioGapFiller(SAMPLE_RATE, 1)
    const blockFrames = 1000
    const gapFrames = 333
    filler.framesMissingBefore(0)

    let position = 0
    for (let i = 0; i < 200; i++) {
      filler.accept(blockFrames)
      position += blockFrames + gapFrames
      expect(filler.framesMissingBefore(position / SAMPLE_RATE)).toBe(gapFrames)
    }

    expect(filler.insertedFrames).toBe(200 * gapFrames)
  })

  it('runs an overlap contiguously rather than inventing audio to remove', () => {
    const filler = new AudioGapFiller(SAMPLE_RATE, 2)
    filler.framesMissingBefore(0)
    filler.accept(SAMPLE_RATE)

    // Claims to start half a second in, when a second has already been read.
    expect(filler.framesMissingBefore(0.5)).toBe(0)
    expect(filler.insertedFrames).toBe(0)
  })

  it('makes a long hole one bounded block at a time, never all at once', () => {
    // Codex review of VH-95: a trim starting inside a 30-minute hole made the
    // whole of it as one array — about 690 MB of zeros for stereo at 48 kHz.
    const filler = new AudioGapFiller(SAMPLE_RATE, 2)
    const blocks = filler.silence(30 * 60 * SAMPLE_RATE, SAMPLE_RATE)
    let largest = 0
    let total = 0
    for (const block of blocks) {
      largest = Math.max(largest, block[0]!.length)
      total += block[0]!.length
    }
    expect(largest).toBe(SAMPLE_RATE)
    expect(total).toBe(30 * 60 * SAMPLE_RATE)
  })
})
