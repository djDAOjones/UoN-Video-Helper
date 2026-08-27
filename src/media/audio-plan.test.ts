/**
 * VH-74 / review P1-02, at the level the defect actually lived.
 *
 * `createContentAudioProcessor` timestamped its output from a running count of
 * frames emitted and never read `AudioSample.timestamp`, so a track that
 * started late or had a hole in it was silently packed contiguous while the
 * video lane kept its offsets. These fail on that behaviour.
 */

import { AudioSample } from 'mediabunny'
import { describe, expect, it } from 'vitest'

import { createContentAudioProcessor, type AudioPlan } from './audio-plan'

const SAMPLE_RATE = 48000
const CHANNELS = 2
const BLOCK_FRAMES = 4800 // 100 ms, comfortably longer than the limiter's look-ahead

/** A plan with no macro-levelling and no gain change: the chain passes audio through. */
const plan: AudioPlan = {
  analysis: {
    integratedLufs: -16,
    shortTermLufs: [],
    stepSeconds: 0.1,
    loudnessRangeLu: 0,
    truePeakDbtp: -20,
  } as unknown as AudioPlan['analysis'],
  envelope: { gainDb: new Float64Array(0), stepSeconds: 0.1 },
  gainDb: 0,
  sampleRate: SAMPLE_RATE,
  channelCount: CHANNELS,
}

function block(timestampSeconds: number, frames = BLOCK_FRAMES): AudioSample {
  const data = new Float32Array(frames * CHANNELS).fill(0.1)
  return new AudioSample({
    data,
    format: 'f32',
    numberOfChannels: CHANNELS,
    sampleRate: SAMPLE_RATE,
    timestamp: timestampSeconds,
  })
}

/**
 * Feeds blocks and reports what came out.
 *
 * `starts` are output timestamps in seconds; `totalFrames` is the whole
 * emitted stream. Note the chain removes the limiter's look-ahead from the
 * head and returns it on flush, so an emitted block is NOT the same audio as
 * the input block that produced it — output frame k carries input frame k, a
 * fixed number of frames earlier in the block ordering. Assertions here are
 * therefore about the stream, not about block-for-block correspondence.
 */
function run(
  blocks: readonly AudioSample[],
  options: { offsetSeconds: number; startOffsetSeconds: number; durationSeconds: number },
): { starts: number[]; totalFrames: number; ends: number[] } {
  const processor = createContentAudioProcessor(plan, {
    ...options,
    fadeIn: false,
    fadeOut: false,
  })
  const starts: number[] = []
  const ends: number[] = []
  let totalFrames = 0
  const record = (sample: AudioSample | null): void => {
    if (!sample) return
    starts.push(sample.timestamp)
    ends.push(sample.timestamp + sample.numberOfFrames / SAMPLE_RATE)
    totalFrames += sample.numberOfFrames
    sample.close()
  }
  for (const input of blocks) {
    record(processor.process(input))
    input.close()
  }
  record(processor.flush())
  return { starts, totalFrames, ends }
}

/** The output must be one unbroken stream: no seam, no overlap. */
function expectContiguous(starts: readonly number[], ends: readonly number[]): void {
  for (let i = 1; i < starts.length; i++) expect(starts[i]).toBeCloseTo(ends[i - 1]!, 9)
}

describe('createContentAudioProcessor timing', () => {
  it('starts at the content offset when the source lanes start together', () => {
    const { starts, totalFrames } = run([block(0), block(0.1), block(0.2)], {
      offsetSeconds: 3,
      startOffsetSeconds: 0,
      durationSeconds: 10,
    })

    expect(starts[0]).toBeCloseTo(3, 9)
    // Frames in equal frames out: the limiter's look-ahead comes back on flush.
    expect(totalFrames).toBe(3 * BLOCK_FRAMES)
  })

  it('keeps a late audio start instead of pulling the sound forward', () => {
    // The picture began at the origin; the sound joins five seconds later.
    // Packing it from the content offset put it five seconds early.
    const { starts, ends } = run([block(5), block(5.1)], {
      offsetSeconds: 3,
      startOffsetSeconds: 5,
      durationSeconds: 10,
    })

    expect(starts[0]).toBeCloseTo(8, 9)
    expect(ends[ends.length - 1]).toBeCloseTo(8.2, 6)
  })

  it('turns a midstream hole into the silence it stands for', () => {
    // Blocks at 0, 0.1 and 2.1: the audio runs to 0.2 and resumes at 2.1, so
    // 1.9 s is missing. Collapsing that pulled everything after it 1.9 s
    // forward, against a picture that had not moved.
    const { starts, ends, totalFrames } = run([block(0), block(0.1), block(2.1)], {
      offsetSeconds: 0,
      startOffsetSeconds: 0,
      durationSeconds: 10,
    })

    // The invariant: the output lasts exactly as long as the source's own span
    // — first timestamp to last timestamp plus its block — hole included.
    expect(totalFrames).toBe(Math.round(2.2 * SAMPLE_RATE))
    expect(starts[0]).toBeCloseTo(0, 9)
    expect(ends[ends.length - 1]).toBeCloseTo(2.2, 6)
    expectContiguous(starts, ends)
  })

  it('holds the gap and the late start together', () => {
    const { starts, ends, totalFrames } = run([block(5), block(5.1), block(7.1)], {
      offsetSeconds: 3,
      startOffsetSeconds: 5,
      durationSeconds: 10,
    })

    // Content offset 3, audio five seconds after the shared origin: sound
    // starts at 8 and ends 2.2 s later, its hole preserved.
    expect(starts[0]).toBeCloseTo(8, 9)
    expect(ends[ends.length - 1]).toBeCloseTo(10.2, 6)
    expect(totalFrames).toBe(Math.round(2.2 * SAMPLE_RATE))
    expectContiguous(starts, ends)
  })

  it('does not drift over many small gaps', () => {
    // 50 blocks of 100 ms, each 110 ms apart — a 10 ms hole before every one
    // but the first. A per-gap correction that accumulated would land short.
    const blocks: AudioSample[] = []
    for (let i = 0; i < 50; i++) blocks.push(block(i * 0.11))

    const { totalFrames } = run(blocks, {
      offsetSeconds: 0,
      startOffsetSeconds: 0,
      durationSeconds: 10,
    })

    expect(totalFrames).toBe(Math.round(49 * 0.11 * SAMPLE_RATE) + BLOCK_FRAMES)
  })
})
