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

  it('size and place the logo from the brand tokens, not from numbers', () => {
    const logo = /\.brand-logo\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(logo).toMatch(/height:\s*var\(--uon-logo-height\)/)
    // The clear space around it, as nottingham.ac.uk draws it: above and
    // below, and in from the window's left edge.
    const band = /\.band--header \.band-inner\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(band).toMatch(/padding:\s*var\(--uon-logo-clear\)\s+var\(--uon-logo-inset\)/)
  })

  it('put the logo against the window edge, not in the centred column', () => {
    // "Top left, as per website": the header band is full width even though
    // the content beneath it is centred.
    const band = /\.band--header \.band-inner\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(band).toMatch(/max-width:\s*none/)
  })

  it('use square bullets for the list of what the tool does', () => {
    const list = /\.lede ul\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(list).toMatch(/list-style:\s*square/)
  })

  it('name no colour directly: every colour in the app is a token', () => {
    // A hex value here is a colour the contrast test never sees.
    expect(rules).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(rules).not.toMatch(/\brgba?\(/)
  })
})


/**
 * Every length, colour and line height in the app's stylesheet comes from
 * the two token files (VH-124; `AGENTS.md` → "Numbers live in src/config or a
 * CSS token"). What is exempt is structural, and named here rather than
 * waved through: zero; percentages and viewport fills, which are geometry
 * relative to a box or the window; the `.visually-hidden` technique, whose
 * one-pixel box is the technique; the reduced-motion block, whose near-zero
 * duration is the technique; the breakpoint in a media query prelude, which
 * CSS cannot read from a token; and the forced-colour system colours, which
 * `UI-STANDARDS.md` requires outside the brand tokens.
 */
describe('tokens, not literals (VH-124)', () => {
  /** Declarations only: comments gone, media preludes gone, exempt blocks gone. */
  const declarations = rules
    .replace(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\n\}/, '')
    .replace(/@media[^{]*\{/g, '{')
    .replace(/\.visually-hidden\s*\{[^}]*\}/, '')

  it('names no length outside the token files', () => {
    const lengths = [...declarations.matchAll(/-?\d*\.?\d+(?:px|rem|em|ch|vh|vw|vmin|vmax|s|ms)\b/g)]
      .map((match) => match[0])
      .filter((value) => !/^100v[hw]$/.test(value))
    expect(lengths, 'literal lengths in app.css').toEqual([])
  })

  it('takes every line height from a token', () => {
    const literal = [...declarations.matchAll(/line-height:\s*([^;]+);/g)]
      .map((match) => match[1]!.trim())
      .filter((value) => !/^var\(--line-height-[a-z]+\)$/.test(value) && value !== 'inherit')
    expect(literal, 'line heights in app.css').toEqual([])
  })

  it('names no colour outside the token files, system colours aside', () => {
    expect(declarations).not.toMatch(/\b(?:rgba?|hsla?|color-mix)\(/)
    // Named CSS colours would pass the hex check and still be a colour nobody measured.
    expect(declarations).not.toMatch(/:\s*(?:white|black|red|green|blue|grey|gray|yellow)\b/)
  })

  it('still holds a literal only where a token lives', () => {
    // The guard above means nothing if the token files stop carrying the
    // values: the measure, the line heights and the paragraph gap are
    // where the brief's typography lands.
    const tokens = readFileSync(new URL('../src/styles/tokens.carbon.css', import.meta.url), 'utf8')
    expect(tokens).toMatch(/--measure:\s*55ch;/)
    expect(tokens).toMatch(/--line-height-body:\s*1\.5;/)
    expect(tokens).toMatch(/--paragraph-gap:\s*var\(--spacing-05\);/)
  })
})
