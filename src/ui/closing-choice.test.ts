/**
 * The closing controls say what the selection will do, and say why a control
 * is disabled. The sentences replaced the descriptions on the old four-way
 * radio, so what those said must survive: what happens to the last second,
 * and how many seconds are added.
 */

import { describe, expect, it } from 'vitest'

import { t } from '../i18n'

import {
  CLOSING_COLOURS,
  CLOSING_ONSETS,
  CLOSING_TYPES,
  brandingChoiceFor,
  closingAddedSeconds,
  type ClosingControls,
} from '../config/branding'
import {
  closingResultText,
  colourDisabledReason,
  internalDisabledReason,
  onsetDisabledReason,
} from './closing-choice'

const every: ClosingControls[] = CLOSING_TYPES.flatMap((type) =>
  CLOSING_ONSETS.flatMap((onset) => CLOSING_COLOURS.map((colour) => ({ type, onset, colour, internal: false }))),
)

describe('the result line (VH-90)', () => {
  it('says the four sentences the ticket drafted', () => {
    expect(closingResultText({ type: 'cut', onset: 'existing', colour: 'blue', internal: false })).toBe(
      'Your video cuts to the blue closing card. Adds 4 seconds.',
    )
    expect(closingResultText({ type: 'fade', onset: 'existing', colour: 'blue', internal: false })).toBe(
      'The blue closing fades in over your last second of video, covering it as it builds. Adds 4 seconds.',
    )
    expect(closingResultText({ type: 'slide', onset: 'freeze', colour: 'white', internal: false })).toBe(
      'Your last frame is held while the white closing slides in, so nothing is covered. Adds 5 seconds.',
    )
    expect(closingResultText({ type: 'none', onset: 'existing', colour: 'blue', internal: false })).toBe(
      'No University closing will be added.',
    )
  })

  it.each(every)('states the seconds the job will really add: $type / $onset / $colour', (controls) => {
    const text = closingResultText(controls)
    const choice = brandingChoiceFor(controls, 'en-GB')
    if (!choice.closing) {
      expect(text).not.toMatch(/Adds/)
      return
    }
    expect(text).toContain(`Adds ${closingAddedSeconds(choice.mode!)} seconds.`)
  })

  it('makes "None" unmistakable, because under "Animation type" it reads as no animation', () => {
    // Cut is the closing with no animation. None removes the closing.
    const none = closingResultText({ type: 'none', onset: 'freeze', colour: 'white', internal: false })
    expect(none).toMatch(/No University closing/)
    expect(closingResultText({ type: 'cut', onset: 'freeze', colour: 'white', internal: false })).toMatch(
      /cuts to the white closing card/,
    )
  })

  it('says what happens to the last second, as the old options did', () => {
    expect(closingResultText({ type: 'slide', onset: 'existing', colour: 'blue', internal: false })).toMatch(
      /over your last second of video, covering it/,
    )
    expect(closingResultText({ type: 'fade', onset: 'freeze', colour: 'blue', internal: false })).toMatch(
      /last frame is held.*nothing is covered/,
    )
  })

  it('names the colour for every selection that has a closing', () => {
    for (const controls of every) {
      if (controls.type === 'none') continue
      expect(closingResultText(controls)).toContain(`${controls.colour} closing`)
    }
  })

  it('ignores an onset the type does not use', () => {
    // Onset is disabled under Cut, and its stale value must not leak into the
    // sentence.
    expect(closingResultText({ type: 'cut', onset: 'freeze', colour: 'blue', internal: false })).toBe(
      closingResultText({ type: 'cut', onset: 'existing', colour: 'blue', internal: false }),
    )
  })
})

describe('why a control is disabled (VH-90)', () => {
  it('disables onset under Cut and None, and says which', () => {
    expect(onsetDisabledReason('cut')).toBe('Not used with Cut.')
    expect(onsetDisabledReason('none')).toBe('Not used with None.')
    expect(onsetDisabledReason('fade')).toBeNull()
    expect(onsetDisabledReason('slide')).toBeNull()
  })

  it('disables colour under None only', () => {
    expect(colourDisabledReason('none')).toBe('Not used with None.')
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
    expect(closingResultText({ type: 'cut', onset: 'existing', colour: 'blue', internal: true })).toBe(
      'Your video cuts to the blue closing card. Adds 4 seconds. The card says “Internal use only” under the logo.',
    )
  })

  it.each(every)('never changes the seconds: $type / $onset / $colour', (controls) => {
    const marked = closingResultText({ ...controls, internal: true })
    expect(marked.startsWith(closingResultText(controls))).toBe(true)
  })

  it('says nothing of the words under None, which has no card', () => {
    expect(closingResultText({ type: 'none', onset: 'existing', colour: 'blue', internal: true })).toBe(
      'No University closing will be added.',
    )
  })

  it('is disabled under None only, and says why', () => {
    expect(internalDisabledReason('none')).toBe('Not used with None.')
    for (const type of ['cut', 'fade', 'slide'] as const) {
      expect(internalDisabledReason(type)).toBeNull()
    }
  })
})
