/**
 * The closing controls say what the selection will do, and say why a control
 * is disabled. The sentences replaced the descriptions on the old four-way
 * radio, so what those said must survive: what happens to the last second,
 * and how many seconds are added.
 */

import { describe, expect, it } from 'vitest'

import { sentenceGap, t } from '../i18n'

import {
  CLOSING_COLOURS,
  CLOSING_ONSETS,
  CLOSING_TYPES,
  brandingChoiceFor,
  closingAddedSeconds,
  type ClosingControls,
} from '../config/branding'
import {
  closingResultLines,
  colourDisabledReason,
  internalCheckboxState,
  internalDisabledReason,
  onsetDisabledReason,
  visibleClosingReasons,
} from './closing-choice'

/** The result's lines as one string, so a sentence is asserted whole (VH-152: the page draws the lines). */
const shown = (controls: ClosingControls): string => closingResultLines(controls).join(sentenceGap())

const every: ClosingControls[] = CLOSING_TYPES.flatMap((type) =>
  CLOSING_ONSETS.flatMap((onset) => CLOSING_COLOURS.map((colour) => ({ type, onset, colour, internal: false }))),
)

describe('the result line (VH-90)', () => {
  it('says the four sentences the ticket drafted', () => {
    expect(shown({ type: 'cut', onset: 'existing', colour: 'blue', internal: false })).toBe(
      'Your video cuts to the blue closing card. Adds 4 seconds.',
    )
    expect(shown({ type: 'fade', onset: 'existing', colour: 'blue', internal: false })).toBe(
      'The blue closing graphics fade in over your last second of video, covering it as they build. Adds 4 seconds.',
    )
    expect(shown({ type: 'slide', onset: 'freeze', colour: 'white', internal: false })).toBe(
      'Your last frame is held while the white closing graphics slide in, so nothing is covered. Adds 5 seconds.',
    )
    expect(shown({ type: 'none', onset: 'existing', colour: 'blue', internal: false })).toBe(
      'No University closing graphics will be added.',
    )
  })

  it.each(every)('states the seconds the job will really add: $type / $onset / $colour', (controls) => {
    const text = shown(controls)
    const choice = brandingChoiceFor(controls, 'en-GB')
    if (!choice.closing) {
      expect(text).not.toMatch(/Adds/)
      return
    }
    expect(text).toContain(`Adds ${closingAddedSeconds(choice.mode!)} seconds.`)
  })

  it('makes no closing unmistakable, because under "Animation type" it could read as no animation', () => {
    // Cut is the closing with no animation. No closing graphics removes the closing.
    const none = shown({ type: 'none', onset: 'freeze', colour: 'white', internal: false })
    expect(none).toMatch(/No University closing/)
    expect(shown({ type: 'cut', onset: 'freeze', colour: 'white', internal: false })).toMatch(
      /cuts to the white closing card/,
    )
  })

  it('says what happens to the last second, as the old options did', () => {
    expect(shown({ type: 'slide', onset: 'existing', colour: 'blue', internal: false })).toMatch(
      /over your last second of video, covering it/,
    )
    expect(shown({ type: 'fade', onset: 'freeze', colour: 'blue', internal: false })).toMatch(
      /last frame is held.*nothing is covered/,
    )
  })

  it('names the colour for every selection that has a closing', () => {
    for (const controls of every) {
      if (controls.type === 'none') continue
      expect(shown(controls)).toContain(`${controls.colour} closing`)
    }
  })

  it('ignores an onset the type does not use', () => {
    // Onset is disabled under Cut, and its stale value must not leak into the
    // sentence.
    expect(shown({ type: 'cut', onset: 'freeze', colour: 'blue', internal: false })).toBe(
      shown({ type: 'cut', onset: 'existing', colour: 'blue', internal: false }),
    )
  })
})

describe('why a control is disabled (VH-90)', () => {
  it('disables onset under Cut and None, and says which', () => {
    expect(onsetDisabledReason('cut')).toBe('Not used with Cut.')
    expect(onsetDisabledReason('none')).toBe('Not used without closing graphics.')
    expect(onsetDisabledReason('fade')).toBeNull()
    expect(onsetDisabledReason('slide')).toBeNull()
  })

  it('disables colour under None only', () => {
    expect(colourDisabledReason('none')).toBe('Not used without closing graphics.')
    for (const type of ['cut', 'fade', 'slide'] as const) {
      expect(colourDisabledReason(type)).toBeNull()
    }
  })

  it('has a label for every type, so a reason can always name it', () => {
    expect(Object.keys(t().closing.types).sort()).toEqual([...CLOSING_TYPES].sort())
  })
})

describe('Internal use only in the result line (VH-126)', () => {
  it('says the words the card will carry, after the closing’s own sentence', () => {
    expect(shown({ type: 'cut', onset: 'existing', colour: 'blue', internal: true })).toBe(
      'Your video cuts to the blue closing card. Adds 4 seconds. The card says “Internal use only” under the logo.',
    )
  })

  it.each(every)('never changes the seconds: $type / $onset / $colour', (controls) => {
    const marked = shown({ ...controls, internal: true })
    expect(marked.startsWith(shown(controls))).toBe(true)
  })

  it('says nothing of the words under None, which has no card', () => {
    expect(shown({ type: 'none', onset: 'existing', colour: 'blue', internal: true })).toBe(
      'No University closing graphics will be added.',
    )
  })

  it('is disabled under None only, and says why', () => {
    expect(internalDisabledReason('none')).toBe('Not used without closing graphics.')
    for (const type of ['cut', 'fade', 'slide'] as const) {
      expect(internalDisabledReason(type)).toBeNull()
    }
  })
})

describe('the Internal use only box on each side of the switch (VH-131)', () => {
  it('holds a staff video’s own choice, locked only under None', () => {
    for (const type of ['cut', 'fade', 'slide'] as const) {
      for (const staffChecked of [false, true]) {
        expect(internalCheckboxState('staff', type, staffChecked)).toEqual({
          checked: staffChecked,
          disabled: false,
          reason: null,
        })
      }
    }
    expect(internalCheckboxState('staff', 'none', true)).toEqual({
      checked: true,
      disabled: true,
      reason: 'Not used without closing graphics.',
    })
  })

  it('is ticked and locked on a submission, whatever the staff choice, and says why', () => {
    for (const type of ['cut', 'fade', 'slide'] as const) {
      for (const staffChecked of [false, true]) {
        expect(internalCheckboxState('submission', type, staffChecked)).toEqual({
          checked: true,
          disabled: true,
          reason: 'Always on for a student submission.',
        })
      }
    }
  })

  it('gives None’s reason on a submission under None, which has no closing to mark', () => {
    expect(internalCheckboxState('submission', 'none', false)).toEqual({
      checked: true,
      disabled: true,
      reason: 'Not used without closing graphics.',
    })
  })

  it('names the side in the switch’s own words', () => {
    expect(t().closing.internalForSubmission.toLowerCase()).toContain(
      t().videoKind.options.submission.toLowerCase(),
    )
  })
})


describe('one visible reason for None (VH-144)', () => {
  it('shares None across the three locks, on both sides of the switch', () => {
    for (const kind of ['staff', 'submission'] as const) {
      const internal = internalCheckboxState(kind, 'none', false)
      expect(visibleClosingReasons('none', internal.reason)).toEqual({ shared: 'Not used without closing graphics.', onset: null, internal: null })
    }
  })
  it('shows the shared reason for None alone, every other type keeping its own', () => {
    // Keyed to None, not to the colour's rule (VH-152).
    for (const type of CLOSING_TYPES) {
      const { shared } = visibleClosingReasons(type, null)
      expect(shared === null, type).toBe(type !== 'none')
    }
  })
  it('keeps Cut’s onset reason and Submission’s separate internal rule', () => {
    const internal = internalCheckboxState('submission', 'cut', false)
    expect(visibleClosingReasons('cut', internal.reason)).toEqual({ shared: null, onset: 'Not used with Cut.', internal: internal.reason })
    expect(internal.reason).not.toBeNull()
  })
})
