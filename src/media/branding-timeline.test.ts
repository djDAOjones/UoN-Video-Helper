/**
 * Where the branding sits on the output timeline, spec 4.3 (VH-42).
 *
 * The defect these pin: every boundary used to be measured against
 * `SourceReport.durationSeconds`, which is `max(video, audio)`. Two things
 * followed, both silent. Audio outrunning the picture put the closing where the
 * AUDIO ended, opening a video gap with nothing in it, and pushed the composite
 * point past anything the picture reached — so the build never appeared and no
 * error said why. A source shorter than the 1.00 s build computed a negative
 * start.
 *
 * Neither case exists in the corpus, so nothing would have caught them by being
 * run. They are here because the arithmetic is now pure and can be.
 */

import { describe, expect, it } from 'vitest'

import { closingTimeline } from './branding'

/** The real closing masters: 1.00 s alpha build, then a 4.00 s opaque card. */
const ONSET = 1
const CLOSING = 4

const base = {
  mode: 'hard-cut' as const,
  openingSeconds: 0,
  closingSeconds: CLOSING,
  onsetSeconds: ONSET,
  closingHasAudio: false,
}

describe('closingTimeline', () => {
  it('puts the closing where the picture ends when the tracks agree', () => {
    const t = closingTimeline({
      ...base,
      videoDurationSeconds: 600,
      audioDurationSeconds: 600,
    })
    expect(t.closingOffsetSeconds).toBe(600)
    expect(t.timelineSeconds).toBe(604)
  })

  describe('when the audio outruns the picture', () => {
    // The case the corpus does not contain and the pipeline got wrong.
    const t = closingTimeline({
      ...base,
      mode: 'over-picture',
      videoDurationSeconds: 600,
      audioDurationSeconds: 604,
    })

    it('keys the closing off the picture, not the longer track', () => {
      expect(t.closingOffsetSeconds).toBe(600)
      // Against max(video, audio) this was 604, leaving four seconds of video
      // timeline with nothing fed into it.
      expect(t.closingOffsetSeconds).not.toBe(604)
    })

    it('leaves the build reachable, which is what silently failed', () => {
      // `sourceTime` only ever reaches `videoDurationSeconds`. Measured against
      // the audio this was 603 — past the end of the picture — so the composite
      // branch never ran and the build was simply absent from the output.
      expect(t.overlayFromSeconds).toBe(599)
      expect(t.overlayFromSeconds).toBeLessThan(600)
    })

    it('lets the trailing audio play under the closing rather than cutting it', () => {
      // The real masters carry no audio, so nothing collides — and truncating a
      // lecturer's last words to match the picture is the worse error.
      expect(t.audioEndsAtSeconds).toBe(604)
    })

    it('reports the output as long as the LATER track, not the sum', () => {
      // Video ends at 600 + 0 freeze + 4 closing = 604; the audio also ends at
      // 604. This asserted 608 until 2026-08-26 — the audio overrun added ON TOP
      // of the closing — which is a length no track reaches. The test was
      // written against the implementation rather than against the timeline,
      // and locked the error in.
      expect(t.timelineSeconds).toBe(604)
    })
  })

  it('cuts the trailing audio only when the closing has a bed to collide with', () => {
    const t = closingTimeline({
      ...base,
      videoDurationSeconds: 600,
      audioDurationSeconds: 604,
      closingHasAudio: true,
    })
    // Two sources writing the same stretch of one audio track is corruption,
    // not a mix, so the content yields.
    expect(t.audioEndsAtSeconds).toBe(600)
    expect(t.timelineSeconds).toBe(604)
  })

  it('handles a picture that outruns its audio', () => {
    const t = closingTimeline({
      ...base,
      videoDurationSeconds: 600,
      audioDurationSeconds: 590,
    })
    expect(t.closingOffsetSeconds).toBe(600)
    expect(t.audioEndsAtSeconds).toBe(590)
    expect(t.timelineSeconds).toBe(604)
  })

  it('treats a silent source as running for the length of its picture', () => {
    const t = closingTimeline({
      ...base,
      videoDurationSeconds: 215,
      audioDurationSeconds: null,
    })
    expect(t.audioEndsAtSeconds).toBe(215)
    expect(t.closingOffsetSeconds).toBe(215)
  })

  describe('when the source is shorter than the build', () => {
    const t = closingTimeline({
      ...base,
      mode: 'over-picture',
      videoDurationSeconds: 0.4,
      audioDurationSeconds: 0.4,
    })

    it('degrades to over-freeze rather than erroring', () => {
      expect(t.mode).toBe('over-freeze')
      expect(t.downgradedForShortSource).toBe(true)
    })

    it('never computes a negative start', () => {
      // 0.4 - 1.00 = -0.6 before the clamp. Every source frame then satisfied
      // `buildTime >= 0`, so the build played from the first frame, shifted.
      expect(t.overlayFromSeconds).toBe(0)
    })

    it('adds the freeze second the downgraded mode implies', () => {
      // over-freeze holds a frame under the build, so it costs its own second
      // where over-picture would not have. 0.4 picture + 1.0 freeze + 4.0 tail.
      expect(t.closingOffsetSeconds).toBeCloseTo(1.4, 6)
      expect(t.timelineSeconds).toBeCloseTo(5.4, 6)
    })
  })

  it('does not downgrade a source exactly as long as the build', () => {
    const t = closingTimeline({
      ...base,
      mode: 'over-picture',
      videoDurationSeconds: ONSET,
      audioDurationSeconds: ONSET,
    })
    expect(t.mode).toBe('over-picture')
    expect(t.downgradedForShortSource).toBe(false)
    expect(t.overlayFromSeconds).toBe(0)
  })

  it('leaves hard cut alone however short the source is', () => {
    // hard cut composites nothing, so it has no build to run out of room for.
    const t = closingTimeline({ ...base, videoDurationSeconds: 0.2, audioDurationSeconds: 0.2 })
    expect(t.mode).toBe('hard-cut')
    expect(t.downgradedForShortSource).toBe(false)
    expect(t.closingOffsetSeconds).toBeCloseTo(0.2, 6)
  })

  it('offsets everything by an opening sequence when one is used', () => {
    // The opening is withdrawn from the interface (VH-33) but intact in the
    // pipeline for VH-23, so the arithmetic still has to be right.
    const t = closingTimeline({
      ...base,
      openingSeconds: 5,
      videoDurationSeconds: 600,
      audioDurationSeconds: 600,
    })
    expect(t.contentOffsetSeconds).toBe(5)
    expect(t.closingOffsetSeconds).toBe(605)
    expect(t.timelineSeconds).toBe(609)
    // The overlay point is in SOURCE time, so the opening must not move it.
    expect(t.overlayFromSeconds).toBe(599)
  })

  it('charges over-freeze its extra second and over-picture nothing', () => {
    const shared = { ...base, videoDurationSeconds: 600, audioDurationSeconds: 600 }
    const overPicture = closingTimeline({ ...shared, mode: 'over-picture' })
    const overFreeze = closingTimeline({ ...shared, mode: 'over-freeze' })
    expect(overPicture.timelineSeconds).toBe(604)
    expect(overFreeze.timelineSeconds).toBe(605)
    expect(overFreeze.closingOffsetSeconds - overPicture.closingOffsetSeconds).toBe(ONSET)
  })
})
