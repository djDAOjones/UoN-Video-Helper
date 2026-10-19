/**
 * Staff video or Student submission (VH-131): the page opens on Staff video,
 * anything unknown reads as it, and a submission's closing is always
 * Internal use only — while None still asks for no closing at all.
 */

import { describe, expect, it } from 'vitest'

import {
  CLOSING_COLOURS,
  CLOSING_ONSETS,
  CLOSING_TYPES,
  brandingChoiceFor,
  type ClosingControls,
} from './branding'
import { closingControlsFor, DEFAULT_VIDEO_KIND, readVideoKind, VIDEO_KINDS } from './video-kind'

const every: ClosingControls[] = CLOSING_TYPES.flatMap((type) =>
  CLOSING_ONSETS.flatMap((onset) =>
    CLOSING_COLOURS.flatMap((colour) =>
      [false, true].map((internal) => ({ type, onset, colour, internal })),
    ),
  ),
)

describe('the two sides', () => {
  it('opens on Staff video, the owner’s answer of 2026-10-19', () => {
    expect(DEFAULT_VIDEO_KIND).toBe('staff')
    expect(VIDEO_KINDS).toEqual(['staff', 'submission'])
  })

  it('reads each side it knows', () => {
    for (const kind of VIDEO_KINDS) expect(readVideoKind(kind)).toBe(kind)
  })

  it('reads anything else as Staff video', () => {
    for (const junk of [undefined, null, '', 'Staff', 'student', ' submission', 1, {}]) {
      expect(readVideoKind(junk), JSON.stringify(junk) ?? 'undefined').toBe('staff')
    }
  })
})

describe('the closing on each side', () => {
  it.each(every)(
    'marks every closing on a submission: $type / $onset / $colour / $internal',
    (controls) => {
      expect(closingControlsFor('submission', controls)).toEqual({ ...controls, internal: true })
    },
  )

  it.each(every)('leaves a staff video’s as chosen: $type / $onset / $colour / $internal', (controls) => {
    expect(closingControlsFor('staff', controls)).toEqual(controls)
  })

  it('asks for no closing, and so no words, on a submission under None', () => {
    const none = closingControlsFor('submission', {
      type: 'none',
      onset: 'existing',
      colour: 'blue',
      internal: false,
    })
    const choice = brandingChoiceFor(none, 'en-GB')
    expect(choice.closing).toBe(false)
    expect(choice.internal).toBeUndefined()
  })

  it('asks for the internal tail on a submission whatever the box held', () => {
    const cut = closingControlsFor('submission', {
      type: 'cut',
      onset: 'existing',
      colour: 'white',
      internal: false,
    })
    expect(brandingChoiceFor(cut, 'zh-Hans').internal).toBe('zh-Hans')
  })
})
