/**
 * The closing controls, in words.
 *
 * Three controls replaced four described radios (VH-90), and what the radios
 * said went with them: what happens to the last second of the user's video,
 * and how many seconds are added. The result line here says it again, for
 * whatever is currently selected — and it is what stops "None" under
 * "Animation type" reading as "no animation", which is what Cut is.
 *
 * Pure, so every combination's sentence is tested in Node.
 */

import {
  closingAddedSeconds,
  closingModeFor,
  closingTypeUsesInternal,
  closingTypeUsesOnset,
  type ClosingControls,
  type ClosingType,
} from '../config/branding'
import { sentenceGap, t } from '../i18n'

/** The option text of "Animation type", which the disabled reasons quote. */
export function closingTypeLabel(type: ClosingType): string {
  return t().closing.types[type]
}

/**
 * One sentence for the current selection: what the viewer sees at the end,
 * and what it costs in seconds — and a second, with Internal use only, that
 * quotes the words the card will carry.
 */
export function closingResultText(controls: ClosingControls): string {
  const { closing } = t()
  const { result } = closing
  if (controls.type === 'none') return result.none

  // The mode, and so the seconds, come from the same mapping the job uses —
  // the sentence cannot promise a different file from the one that is made.
  const adds = result.adds({ count: closingAddedSeconds(closingModeFor(controls)) })
  const { colour } = controls

  const type = controls.type
  const sentence =
    type === 'cut'
      ? result.cut[colour]({ adds })
      : controls.onset === 'freeze'
        ? result.overFreeze[colour][type]({ adds })
        : result.overPicture[colour][type]({ adds })
  // The words are the page's language's until VH-132 lets the video's differ.
  return controls.internal
    ? `${sentence}${sentenceGap()}${result.internal({ words: closing.internalWords })}`
    : sentence
}

/**
 * Why "Animation onset" cannot be changed, or `null` when it can.
 *
 * A disabled control leaves the tab order and cannot explain itself, so the
 * reason is visible text beside it.
 */
export function onsetDisabledReason(type: ClosingType): string | null {
  if (closingTypeUsesOnset(type)) return null
  // The types without an onset are the two the table has a reason for.
  return type === 'cut' || type === 'none' ? t().closing.notUsedWith[type] : null
}

/** Why the colour cannot be changed, or `null` when it can. */
export function colourDisabledReason(type: ClosingType): string | null {
  return type === 'none' ? t().closing.notUsedWith.none : null
}

/** Why "Internal use only" cannot be changed, or `null` when it can: there is no closing to mark. */
export function internalDisabledReason(type: ClosingType): string | null {
  return closingTypeUsesInternal(type) ? null : t().closing.notUsedWith.none
}
