/**
 * The closing controls say what the selection will do, and say why a control
 * is disabled. The sentences replaced the descriptions on the old four-way
 * radio, so what those said must survive: what happens to the last second,
 * and how many seconds are added.
 */

import { describe, expect, it } from 'vitest'

import {
  CLOSING_COLOURS,
  CLOSING_ONSETS,
  CLOSING_TYPES,
  brandingChoiceFor,
  closingAddedSeconds,
  type ClosingControls,
} from '../config/branding'
import {
  CLOSING_TYPE_LABELS,
  closingResultText,
  colourDisabledReason,
  onsetDisabledReason,
} from './closing-choice'

const every: ClosingControls[] = CLOSING_TYPES.flatMap((type) =>
  CLOSING_ONSETS.flatMap((onset) => CLOSING_COLOURS.map((colour) => ({ type, onset, colour }))),
)

describe('the result line (VH-90)', () => {
  it('says the four sentences the ticket drafted', () => {
    expect(closingResultText({ type: 'cut', onset: 'existing', colour: 'blue' })).toBe(
      'Your video cuts to the blue closing card. Adds 4 seconds.',
    )
    expect(closingResultText({ type: 'fade', onset: 'existing', colour: 'blue' })).toBe(
      'The blue closing fades in over your last second of video, covering it as it builds. Adds 4 seconds.',
    )
    expect(closingResultText({ type: 'slide', onset: 'freeze', colour: 'white' })).toBe(
      'Your last frame is held while the white closing slides in, so nothing is covered. Adds 5 seconds.',
    )
    expect(closingResultText({ type: 'none', onset: 'existing', colour: 'blue' })).toBe(
      'No University closing will be added.',
    )
  })

  it.each(every)('states the seconds the job will really add: $type / $onset / $colour', (controls) => {
    const text = closingResultText(controls)
    const choice = brandingChoiceFor(controls)
    if (!choice.closing) {
      expect(text).not.toMatch(/Adds/)
      return
    }
    expect(text).toContain(`Adds ${closingAddedSeconds(choice.mode!)} seconds.`)
  })

  it('makes "None" unmistakable, because under "Animation type" it reads as no animation', () => {
    // Cut is the closing with no animation. None removes the closing.
    const none = closingResultText({ type: 'none', onset: 'freeze', colour: 'white' })
    expect(none).toMatch(/No University closing/)
    expect(closingResultText({ type: 'cut', onset: 'freeze', colour: 'white' })).toMatch(
      /cuts to the white closing card/,
    )
  })

  it('says what happens to the last second, as the old options did', () => {
    expect(closingResultText({ type: 'slide', onset: 'existing', colour: 'blue' })).toMatch(
      /over your last second of video, covering it/,
    )
    expect(closingResultText({ type: 'fade', onset: 'freeze', colour: 'blue' })).toMatch(
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
    expect(closingResultText({ type: 'cut', onset: 'freeze', colour: 'blue' })).toBe(
      closingResultText({ type: 'cut', onset: 'existing', colour: 'blue' }),
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
    expect(Object.keys(CLOSING_TYPE_LABELS).sort()).toEqual([...CLOSING_TYPES].sort())
  })
})
