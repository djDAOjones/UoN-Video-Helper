/**
 * The probe's arithmetic: what it measured, turned into a time.
 *
 * The invariant is that a job's estimate is finite and describes the job.
 * Audio the probe window never reached is unmeasured, not infinitely slow.
 */

import { describe, expect, it } from 'vitest'

import { probeEstimate } from './probe'

const base = { videoFrames: 75, videoSeconds: 0.25, frameRate: 25, durationSeconds: 60 }

describe('probeEstimate', () => {
  it('counts the video at the measured speed and the audio twice at its own', () => {
    // 300 frames/s against 1,500 frames: 5 s; audio at 100x realtime, twice
    // over 60 s: 1.2 s.
    const estimate = probeEstimate({ ...base, audio: { seconds: 3, wallSeconds: 0.03 } })
    expect(estimate.videoFramesPerSecond).toBe(300)
    expect(estimate.audioRealtimeFactor).toBeCloseTo(100, 9)
    expect(estimate.estimatedSeconds).toBe(6)
  })

  it('treats audio the window never reached as unmeasured, not as infinitely slow', () => {
    // Found on VH-95's review: a track starting after the probe window read
    // zero seconds, the estimate came out infinite, and the job was called
    // "very long".
    const estimate = probeEstimate({ ...base, audio: { seconds: 0, wallSeconds: 0.01 } })
    expect(estimate.audioRealtimeFactor).toBeNull()
    expect(estimate.estimatedSeconds).toBe(5)
    expect(Number.isFinite(estimate.estimatedSeconds)).toBe(true)
  })

  it('counts nothing for a source with no audio track', () => {
    expect(probeEstimate({ ...base, audio: null }).estimatedSeconds).toBe(5)
  })
})
