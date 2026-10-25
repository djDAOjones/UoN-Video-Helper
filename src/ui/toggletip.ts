/**
 * When the onset toggletip closes (VH-124, VH-184).
 *
 * The "?" beside "Plays over" discloses its text in the page flow, and
 * focus stays on the button. Moving focus on to anything else closes it, so
 * Tab and Shift+Tab never leave it open over what comes next; a click on its
 * own text does not, since that moves focus nowhere. Escape closes it from
 * the button, from its text or from nowhere, and hands focus back to the
 * button, but never takes focus from a control elsewhere. Pure but for the
 * elements it is given, so the rule is tested in Node with stand-ins; the
 * page is walked in Chrome.
 */

/** The button or the tip, as the rule reads them. */
export interface TipPart {
  /** `Node.contains`: the part itself, or anything inside it. */
  contains(other: unknown): boolean
}

/**
 * Whether focus arriving at `target` closes the tip: only when it lands on
 * something outside both the button and the tip.
 */
export function focusClosesTip(target: unknown, button: TipPart, tip: TipPart): boolean {
  if (target === null || target === undefined) return false
  return !button.contains(target) && !tip.contains(target)
}

/**
 * Whether Escape, closing the tip, also puts focus back on its button: when
 * focus is on the button, inside the tip, or on nothing (the page body).
 */
export function escapeFocusesButton(
  active: unknown,
  body: unknown,
  button: TipPart,
  tip: TipPart,
): boolean {
  return active === null || active === body || button.contains(active) || tip.contains(active)
}
