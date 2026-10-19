/**
 * Staff video or Student submission: the switch at the top of the page
 * (VH-131).
 *
 * The owner asked for it on 2026-10-19 and answered its questions the same
 * day (decisions, 2026-10-19): the page opens on Staff video; the choice is
 * remembered in this browser, as the language is; a submission may have no
 * closing, and whenever it has one, that closing is Internal use only; a
 * staff video keeps Internal use only as a toggle. The title cards that sit
 * under each side are VH-127's and VH-128's.
 */

import type { ClosingControls } from './branding'

export type VideoKind = 'staff' | 'submission'

/** The switch's options, in its order. */
export const VIDEO_KINDS: readonly VideoKind[] = ['staff', 'submission']

/** The side chosen before anyone touches the switch: the owner's answer, 2026-10-19. */
export const DEFAULT_VIDEO_KIND: VideoKind = 'staff'

/** Where the chosen side is remembered, in this browser only. Nothing about it leaves the device. */
export const VIDEO_KIND_PREFERENCE_KEY = 'uon-video-helper:video-kind'

/**
 * Reads the switch's raw value, falling back to the default for anything the
 * config does not know: the DOM is editable, and a stored value may be junk.
 */
export function readVideoKind(raw: unknown): VideoKind {
  return VIDEO_KINDS.find((kind) => kind === raw) ?? DEFAULT_VIDEO_KIND
}

/**
 * The closing controls as the job reads them on each side: a submission's
 * closing is always Internal use only, whatever the checkbox holds, so an
 * edited page cannot unmark one. Under None there is no closing to mark, and
 * `brandingChoiceFor` asks for none.
 */
export function closingControlsFor(kind: VideoKind, controls: ClosingControls): ClosingControls {
  return kind === 'submission' ? { ...controls, internal: true } : controls
}
