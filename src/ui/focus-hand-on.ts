/**
 * Focus handed on when a transition takes away the control that has it
 * (VH-111, VH-178; WCAG 2.4.3).
 *
 * Noted BEFORE the transition: whether focus is on a control it will take
 * away. The returned hand-on then moves focus to the first successor that
 * can take it, and only if focus is still lost. Focus is never moved from
 * where a user has gone to read, nor out of the feedback dialogue — and "on
 * the page body" is not taken as displaced, because it is also where focus
 * sits while someone reads. Pure but for the elements it is given, so the
 * rule is tested in Node with stand-ins; the page's transitions are walked
 * in Chrome.
 */

/** A control a transition takes away, as the hand-on reads it. */
export interface TakenControl {
  /** `Node.contains`: the control itself, or anything inside it. */
  contains(other: unknown): boolean
}

/** A successor, as the hand-on reads it: enough to tell whether it can take focus. */
export interface Successor {
  readonly isConnected: boolean
  /** `true`, or `'until-found'`: either way not shown. */
  readonly hidden: boolean | string
  /** A form control's own; an element without one is never disabled. */
  readonly disabled?: boolean
  /** The browser's test that it is rendered: no `display: none` on it or above it. */
  checkVisibility?(): boolean
  focus(): void
}

/** Where focus is: the document, or a stand-in for it. */
export interface FocusPage {
  readonly activeElement: unknown
  readonly body: unknown
}

/** Moves focus to the first successor that can take it, if focus was held and is still lost. */
export interface HandOn {
  (...successors: readonly Successor[]): void
  /** Whether focus was on one of the controls when noted, or held earlier. */
  readonly held: boolean
}

/**
 * Whether `target` can take focus now: on the page, not hidden, not
 * disabled, and rendered. A box made focusable with `tabIndex = -1` counts;
 * the transitions hand focus to one (a result, a failure's explanation).
 */
export function canTakeFocus(target: Successor): boolean {
  return (
    target.isConnected &&
    !target.hidden &&
    target.disabled !== true &&
    (target.checkVisibility?.() ?? true)
  )
}

/**
 * @param controls - Every control the transition takes away.
 * @param heldEarlier - True when focus was on one of them at an earlier
 *   moment the caller noted (a button pressed and disabled before the work
 *   it stopped has answered).
 * @param page - `document`.
 * @param dialog - The feedback dialogue, which focus is never taken out of.
 * @returns The hand-on. Its successors are in the caller's order: the
 *   control that continues the task, then any that continues it when that
 *   one cannot take focus (Stop saving, while a save has shut the rest).
 */
export function focusHeldBy(
  controls: readonly TakenControl[],
  {
    heldEarlier = false,
    page,
    dialog,
  }: {
    readonly heldEarlier?: boolean
    readonly page: FocusPage
    readonly dialog: { readonly open: boolean }
  },
): HandOn {
  // Any element inside a control counts. `main.ts` counted an HTML element
  // only; no control holds a focusable element of another kind (SVG, MathML).
  const active = page.activeElement
  const held =
    heldEarlier ||
    (active !== null && controls.some((control) => control === active || control.contains(active)))
  const handOn = (...successors: readonly Successor[]): void => {
    if (!held || dialog.open) return
    // Still lost: on the page body, or on one of the controls. Anywhere else
    // means the user moved it themselves in the meantime, and it stays.
    const now = page.activeElement
    const stillLost =
      now === null ||
      now === page.body ||
      controls.some((control) => control === now || control.contains(now))
    if (stillLost) successors.find(canTakeFocus)?.focus()
  }
  return Object.assign(handOn, { held })
}
