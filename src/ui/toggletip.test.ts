/**
 * The onset toggletip's dismissal (VH-184): focus moving on closes it, a
 * click on its own text does not, and Escape hands focus back to its button
 * only from the button, the tip or nowhere. The page is walked in Chrome
 * (the pass's walker, `tip-184.mjs`).
 */

import { describe, expect, it } from 'vitest'

import { escapeFocusesButton, focusClosesTip } from './toggletip'

function scene() {
  const part = (inside: unknown[] = []) => {
    const el = { inside, contains: (other: unknown) => other === el || inside.includes(other) }
    return el
  }
  const tipText = { name: 'tip text' }
  return {
    body: { name: 'body' },
    button: part(),
    tip: part([tipText]),
    tipText,
    select: { name: 'Animation onset' },
    colour: { name: 'Colour: Blue' },
  }
}

describe('the toggletip on focus moving', () => {
  it('closes when Tab or Shift+Tab takes focus to a control outside it', () => {
    const s = scene()
    expect(focusClosesTip(s.colour, s.button, s.tip)).toBe(true)
    expect(focusClosesTip(s.select, s.button, s.tip)).toBe(true)
  })

  it('stays open while focus is on its button or inside it', () => {
    const s = scene()
    expect(focusClosesTip(s.button, s.button, s.tip)).toBe(false)
    expect(focusClosesTip(s.tipText, s.button, s.tip)).toBe(false)
  })

  it('stays open when focus goes nowhere, as a click on its text sends it', () => {
    const s = scene()
    expect(focusClosesTip(null, s.button, s.tip)).toBe(false)
    expect(focusClosesTip(undefined, s.button, s.tip)).toBe(false)
  })
})

describe('the toggletip on Escape', () => {
  it('hands focus back to its button from the button, its text or the body', () => {
    const s = scene()
    expect(escapeFocusesButton(s.button, s.body, s.button, s.tip)).toBe(true)
    expect(escapeFocusesButton(s.tipText, s.body, s.button, s.tip)).toBe(true)
    expect(escapeFocusesButton(s.body, s.body, s.button, s.tip)).toBe(true)
    expect(escapeFocusesButton(null, s.body, s.button, s.tip)).toBe(true)
  })

  it('never takes focus from a control elsewhere', () => {
    const s = scene()
    expect(escapeFocusesButton(s.colour, s.body, s.button, s.tip)).toBe(false)
  })
})
