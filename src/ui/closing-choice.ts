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
  brandingChoiceFor,
  closingAddedSeconds,
  closingTypeUsesOnset,
  type BrandingMode,
  type ClosingControls,
  type ClosingType,
} from '../config/branding'
import { t } from '../i18n'

/** The option text of "Animation type", which the disabled reasons quote. */
export function closingTypeLabel(type: ClosingType): string {
  return t().closing.types[type]
}

/**
 * One sentence for the current selection: what the viewer sees at the end,
 * and what it costs in seconds.
 */
export function closingResultText(controls: ClosingControls): string {
  const { result } = t().closing
  if (controls.type === 'none') return result.none

  // The mode, and so the seconds, come from the same mapping the job uses —
  // the sentence cannot promise a different file from the one that is made.
  const mode = brandingChoiceFor(controls).mode as BrandingMode
  const adds = result.adds({ seconds: closingAddedSeconds(mode) })
  const { colour } = controls

  if (controls.type === 'cut') return result.cut({ colour, adds })
  const type = controls.type
  return controls.onset === 'freeze'
    ? result.overFreeze({ colour, type, adds })
    : result.overPicture({ colour, type, adds })
}

/**
 * Why "Animation onset" cannot be changed, or `null` when it can.
 *
 * A disabled control leaves the tab order and cannot explain itself, so the
 * reason is visible text beside it.
 */
export function onsetDisabledReason(type: ClosingType): string | null {
  return closingTypeUsesOnset(type) ? null : t().closing.notUsedWith({ type: closingTypeLabel(type) })
}

/** Why the colour cannot be changed, or `null` when it can. */
export function colourDisabledReason(type: ClosingType): string | null {
  return type === 'none' ? t().closing.notUsedWith({ type: closingTypeLabel(type) }) : null
}
