/**
 * VH-107 / spec gap review A-05: the finished video's record, in words.
 */

import { describe, expect, it } from 'vitest'

import { CLOSING_CONTROL_DEFAULTS, type ClosingControls } from '../config/branding'
import { closingOutcomeText, jobSummaryText, keptPartText, type JobRecord } from './result-summary'

const whole: JobRecord = {
  sourceName: 'Lecture 3.mp4',
  keptRange: null,
  durationSeconds: 252,
  presetId: 'best',
  closing: CLOSING_CONTROL_DEFAULTS,
}

describe('jobSummaryText', () => {
  it('names the file, the whole video, the output and the closing', () => {
    expect(jobSummaryText(whole)).toBe(
      'Made from Lecture 3.mp4: the whole video (4 minutes 12 seconds), Larger / better, a cut to the blue closing card.',
    )
  })

  it('says what part was kept, with its times, when the video was trimmed', () => {
    const trimmed: JobRecord = {
      ...whole,
      keptRange: { startSeconds: 30, endSeconds: 150 },
      presetId: 'smaller',
      closing: { type: 'fade', onset: 'freeze', colour: 'white' },
    }
    expect(jobSummaryText(trimmed)).toBe(
      'Made from Lecture 3.mp4: 2 minutes of 4 minutes 12 seconds, from 0:30.0 to 2:30.0, Smaller / reduced, the white closing fading in over a held last frame.',
    )
  })

  it('says when no closing was chosen', () => {
    expect(jobSummaryText({ ...whole, closing: { ...whole.closing, type: 'none' } })).toContain(
      'no University closing.',
    )
  })

  it('describes a slide over the picture', () => {
    expect(keptPartText(null, 61)).toBe('the whole video (1 minute 1 second)')
    expect(
      jobSummaryText({ ...whole, closing: { type: 'slide', onset: 'existing', colour: 'blue' } }),
    ).toContain('the blue closing sliding in over the picture.')
  })
})

describe('closingOutcomeText', () => {
  const fade: ClosingControls = { type: 'fade', onset: 'existing', colour: 'blue' }

  it('is silent when the file has what was chosen', () => {
    expect(closingOutcomeText(fade, { applied: true, mode: 'over-picture' })).toBeNull()
    expect(closingOutcomeText(CLOSING_CONTROL_DEFAULTS, { applied: true, mode: 'hard-cut' })).toBeNull()
    expect(closingOutcomeText({ ...fade, type: 'none' }, { applied: false, mode: null })).toBeNull()
  })

  it('says when a fade or slide became a cut (U-14)', () => {
    expect(closingOutcomeText(fade, { applied: true, mode: 'hard-cut' })).toBe(
      'You chose Fade, but the animation could not be loaded, so this video cuts to the blue closing card instead.',
    )
    expect(closingOutcomeText({ ...fade, type: 'slide', colour: 'white' }, { applied: true, mode: 'hard-cut' })).toContain(
      'You chose Slide',
    )
  })

  it('says when a short source put the closing over a held frame instead (Codex review)', () => {
    expect(closingOutcomeText(fade, { applied: true, mode: 'over-freeze' })).toBe(
      'Your video is shorter than the fade animation, so the blue closing fades in over a held last frame rather than over the picture.',
    )
    // The other way round cannot happen today, but a mode that differs is never silent.
    expect(closingOutcomeText({ ...fade, onset: 'freeze' }, { applied: true, mode: 'over-picture' })).toContain(
      'not over a held last frame as chosen',
    )
    // A cut is a cut, whatever the onset control held.
    expect(closingOutcomeText({ type: 'cut', onset: 'freeze', colour: 'white' }, { applied: true, mode: 'hard-cut' })).toBeNull()
  })

  it('says when the closing is missing altogether (VH-22)', () => {
    expect(closingOutcomeText(fade, { applied: false, mode: null })).toContain('not in this video')
  })
})
