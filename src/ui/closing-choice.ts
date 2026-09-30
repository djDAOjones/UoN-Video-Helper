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

/** The option text of "Animation type", which the disabled reasons quote. */
export const CLOSING_TYPE_LABELS: Readonly<Record<ClosingType, string>> = {
  cut: 'Cut',
  fade: 'Fade',
  slide: 'Slide',
  none: 'None',
}

const plural = (seconds: number) => `${seconds} second${seconds === 1 ? '' : 's'}`

/**
 * One sentence for the current selection: what the viewer sees at the end,
 * and what it costs in seconds.
 */
export function closingResultText(controls: ClosingControls): string {
  if (controls.type === 'none') return 'No University closing will be added.'

  // The mode, and so the seconds, come from the same mapping the job uses —
  // the sentence cannot promise a different file from the one that is made.
  const mode = brandingChoiceFor(controls).mode as BrandingMode
  const adds = `Adds ${plural(closingAddedSeconds(mode))}.`
  const closing = `the ${controls.colour} closing`

  if (controls.type === 'cut') return `Your video cuts to ${closing} card. ${adds}`

  const verb = controls.type === 'slide' ? 'slides' : 'fades'
  return controls.onset === 'freeze'
    ? `Your last frame is held while ${closing} ${verb} in, so nothing is covered. ${adds}`
    : `${capitalise(closing)} ${verb} in over your last second of video, covering it as it builds. ${adds}`
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Why "Animation onset" cannot be changed, or `null` when it can.
 *
 * A disabled control leaves the tab order and cannot explain itself, so the
 * reason is visible text beside it.
 */
export function onsetDisabledReason(type: ClosingType): string | null {
  return closingTypeUsesOnset(type) ? null : `Not used with ${CLOSING_TYPE_LABELS[type]}.`
}

/** Why the colour cannot be changed, or `null` when it can. */
export function colourDisabledReason(type: ClosingType): string | null {
  return type === 'none' ? `Not used with ${CLOSING_TYPE_LABELS[type]}.` : null
}
