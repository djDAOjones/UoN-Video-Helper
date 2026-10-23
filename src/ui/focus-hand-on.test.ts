/**
 * The focus hand-off (VH-111, VH-178): when a transition takes away the
 * control that has focus, focus passes to the first successor that can take
 * it, and is never taken from a reader or the feedback dialogue.
 *
 * Stand-ins for the elements: `focus()` here always succeeds, so a test that
 * passes proves the helper itself refused a successor that could not take
 * focus. The page's own transitions are walked in Chrome (the pass's walker,
 * `transitions.mjs`).
 */

import { describe, expect, it } from 'vitest'

import { canTakeFocus, focusHeldBy } from './focus-hand-on'

interface StandIn {
  isConnected: boolean
  hidden: boolean
  disabled?: boolean
  rendered: boolean
  inside: unknown[]
  contains(other: unknown): boolean
  checkVisibility(): boolean
  focus(): void
}

function scene() {
  const body = { name: 'body' }
  const page: { activeElement: unknown; body: unknown } = { activeElement: body, body }
  const dialog = { open: false }
  const element = (overrides: Partial<StandIn> = {}): StandIn => {
    const el: StandIn = {
      isConnected: true,
      hidden: false,
      rendered: true,
      inside: [],
      contains: (other) => other === el || el.inside.includes(other),
      checkVisibility: () => el.rendered && !el.hidden,
      focus: () => {
        page.activeElement = el
      },
      ...overrides,
    }
    return el
  }
  return { body, page, dialog, element }
}

describe('whether a successor can take focus', () => {
  it('takes one on the page, shown, enabled and rendered', () => {
    const { element } = scene()
    expect(canTakeFocus(element())).toBe(true)
    expect(canTakeFocus(element({ disabled: false }))).toBe(true)
  })

  it('refuses one disconnected, hidden, disabled or not rendered', () => {
    const { element } = scene()
    expect(canTakeFocus(element({ isConnected: false }))).toBe(false)
    expect(canTakeFocus(element({ hidden: true }))).toBe(false)
    expect(canTakeFocus(element({ disabled: true }))).toBe(false)
    // Inside a hidden step: its own `hidden` is false, the browser's test is not.
    expect(canTakeFocus(element({ rendered: false }))).toBe(false)
  })

  it('takes a box made focusable with tabIndex -1, which has no disabled state', () => {
    const { element } = scene()
    const box = element()
    delete box.disabled
    expect(canTakeFocus(box)).toBe(true)
  })
})

describe('handing focus on', () => {
  it('moves focus to the successor when the control that had it is taken away', () => {
    const { page, dialog, element } = scene()
    const cancel = element()
    const result = element()
    page.activeElement = cancel
    const handOn = focusHeldBy([cancel], { page, dialog })
    cancel.hidden = true
    page.activeElement = page.body
    handOn(result)
    expect(page.activeElement).toBe(result)
    expect(handOn.held).toBe(true)
  })

  it('counts focus inside a taken control, such as a checkbox inside its field (V-46)', () => {
    const { page, dialog, element } = scene()
    const box = element()
    const field = element({ inside: [box] })
    const cancel = element()
    const result = element()
    page.activeElement = box
    const handOn = focusHeldBy([cancel, field], { page, dialog })
    field.hidden = true
    page.activeElement = page.body
    handOn(result)
    expect(page.activeElement).toBe(result)
  })

  it('falls back to the next successor when the first cannot take focus (V-46)', () => {
    const { page, dialog, element } = scene()
    const stopCheck = element()
    const create = element({ disabled: true })
    const stopSaving = element()
    page.activeElement = stopCheck
    const handOn = focusHeldBy([stopCheck], { page, dialog })
    stopCheck.hidden = true
    page.activeElement = page.body
    handOn(create, stopSaving)
    expect(page.activeElement).toBe(stopSaving)
  })

  it('keeps the first successor whenever it can take focus', () => {
    const { page, dialog, element } = scene()
    const stopCheck = element()
    const create = element()
    const stopSaving = element()
    page.activeElement = stopCheck
    focusHeldBy([stopCheck], { page, dialog })(create, stopSaving)
    expect(page.activeElement).toBe(create)
  })

  it('focuses nothing when no successor can take focus', () => {
    const { page, dialog, element } = scene()
    const stopCheck = element()
    page.activeElement = stopCheck
    const handOn = focusHeldBy([stopCheck], { page, dialog })
    page.activeElement = page.body
    handOn(element({ hidden: true }), element({ isConnected: false }))
    expect(page.activeElement).toBe(page.body)
  })

  it('hands on from focus held earlier, though it is on the body when noted', () => {
    const { page, dialog, element } = scene()
    const cancel = element()
    const create = element()
    const handOn = focusHeldBy([cancel], { page, dialog, heldEarlier: true })
    expect(handOn.held).toBe(true)
    handOn(create)
    expect(page.activeElement).toBe(create)
  })
})

describe('leaving focus alone', () => {
  it('moves nothing when focus was not on a taken control', () => {
    const { page, dialog, element } = scene()
    const trimStart = element()
    const stopCheck = element()
    const create = element()
    page.activeElement = trimStart
    const handOn = focusHeldBy([stopCheck], { page, dialog })
    expect(handOn.held).toBe(false)
    handOn(create)
    expect(page.activeElement).toBe(trimStart)
  })

  it('takes nothing from a reader on the body before the transition', () => {
    const { page, dialog, element } = scene()
    const handOn = focusHeldBy([element()], { page, dialog })
    handOn(element())
    expect(page.activeElement).toBe(page.body)
  })

  it('leaves focus where the reader moved it between the noting and the hand-on', () => {
    const { page, dialog, element } = scene()
    const announce = element()
    const properties = element()
    page.activeElement = announce
    const handOn = focusHeldBy([announce], { page, dialog })
    page.activeElement = properties
    handOn(element())
    expect(page.activeElement).toBe(properties)
  })

  it('never takes focus out of the feedback dialogue', () => {
    const { page, dialog, element } = scene()
    const stopSaving = element()
    page.activeElement = stopSaving
    const handOn = focusHeldBy([stopSaving], { page, dialog, heldEarlier: true })
    dialog.open = true
    page.activeElement = page.body
    handOn(element())
    expect(page.activeElement).toBe(page.body)
  })
})
