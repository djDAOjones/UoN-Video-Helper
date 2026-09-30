/**
 * Invariants of the stylesheet that no component test can see.
 *
 * The suite runs in Node with no layout engine, so what is protected here is
 * the rule's presence in the source rather than its computed effect — which is
 * checked in a real browser and recorded in the task's verification notes.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../src/styles/app.css', import.meta.url), 'utf8')

/** Comments out, so a rule described in prose cannot satisfy a test for it. */
const rules = css.replace(/\/\*[\s\S]*?\*\//g, '')

describe('the hidden attribute (VH-94)', () => {
  it('outranks every author display rule', () => {
    // Without `!important` the attribute loses to any class that sets
    // `display`, and the script's `element.hidden = true` does nothing: Start
    // stayed on screen before a file was chosen and under a block verdict.
    expect(rules).toMatch(/(^|\})\s*\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/)
  })

  it('is not undone by a later rule that targets hidden elements', () => {
    // The one way to defeat the rule above is another `[hidden]` selector
    // carrying its own `display`, so there must be exactly one.
    expect(rules.match(/\[hidden\]/g)).toHaveLength(1)
  })
})

describe('the brand bands (VH-92)', () => {
  it('are never sticky or fixed', () => {
    // A band that follows the scroll can sit on top of the focused control
    // (WCAG 2.4.11). Nothing in this stylesheet may pin itself to the window.
    expect(rules).not.toMatch(/position:\s*(sticky|fixed)/)
  })

  it('size the logo from the brand token, not from a number', () => {
    const logo = /\.brand-logo\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(logo).toMatch(/height:\s*var\(--uon-logo-height\)/)
    // The exclusion zone: half the logo's height, on every side.
    expect(logo).toMatch(/var\(--uon-logo-clear\)/)
  })

  it('name no colour directly: every colour in the app is a token', () => {
    // A hex value here is a colour the contrast test never sees.
    expect(rules).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(rules).not.toMatch(/\brgba?\(/)
  })
})

