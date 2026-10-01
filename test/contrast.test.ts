/**
 * Makes the AAA contrast claim in UI-STANDARDS.md mechanical.
 *
 * The invariant: every text/background pair the app actually renders meets
 * WCAG 2.2 AAA (7:1), and every component border meets 1.4.11 (3:1) — in the
 * light theme, in the dark theme, and on a Nottingham Blue band. Changing a
 * token fails this test until the new value is checked — which is the point.
 * Colour choices are not a matter of taste in a project with a stated AAA
 * target.
 *
 * Since VH-92 the colour roles are assigned from the University's palette in
 * `tokens.brand.css`, as `var()` references, while status colour stays in
 * `tokens.carbon.css`. Both files are read and the references resolved, so
 * what is measured is the colour that is drawn.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (name: string) =>
  readFileSync(new URL(`../src/styles/${name}`, import.meta.url), 'utf8')
    // Comments out, so a hex value mentioned in prose is never parsed as one.
    .replace(/\/\*[\s\S]*?\*\//g, '')

// In import order: a later declaration of the same property wins.
const css = `${read('tokens.carbon.css')}\n${read('tokens.brand.css')}`

/** Pulls custom properties out of a block of declarations. */
function parseBlock(source: string): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match
    if (name && value) tokens[name] = value.trim()
  }
  return tokens
}

/** The body of the first block whose prelude matches, braces balanced. */
function blockAfter(source: string, prelude: string): string {
  const start = source.indexOf(prelude)
  if (start < 0) throw new Error(`no block for ${prelude}`)
  const open = source.indexOf('{', start)
  let depth = 0
  for (let index = open; index < source.length; index++) {
    if (source[index] === '{') depth++
    if (source[index] === '}' && --depth === 0) return source.slice(open + 1, index)
  }
  throw new Error(`unbalanced block for ${prelude}`)
}

const darkBlock = blockAfter(css, '@media (prefers-color-scheme: dark)')
const bandBlock = blockAfter(css, '.on-brand-blue')

// Everything that is not inside the dark media query or the band rule is a
// plain `:root` declaration, which is the light theme.
const lightSource = css
  .replace(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/, '')
  .replace(/\.on-brand-blue\s*\{[\s\S]*?\n\}/, '')

const light = parseBlock(lightSource)
const dark = { ...light, ...parseBlock(darkBlock) }
const band = { ...light, ...parseBlock(bandBlock) }

/** Follows `var(--x)` until it reaches a literal. */
function resolve(tokens: Record<string, string>, name: string, seen = new Set<string>()): string {
  const value = tokens[name]
  if (value === undefined) throw new Error(`missing token ${name}`)
  const reference = /^var\((--[a-z0-9-]+)\)$/.exec(value)?.[1]
  if (!reference) return value
  if (seen.has(reference)) throw new Error(`circular token ${name}`)
  return resolve(tokens, reference, seen.add(name))
}

function channel(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const int = Number.parseInt(clean, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

/** WCAG 2.x relative luminance. */
function luminance(hex: string): number {
  const [r, g, b] = channel(hex)
  const linear = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

/** Foreground token, background token. Mirrors what app.css actually pairs. */
const TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['--text-primary', '--layer-00'],
  ['--text-primary', '--layer-01'],
  ['--text-primary', '--layer-02'],
  ['--text-secondary', '--layer-00'],
  ['--text-secondary', '--layer-01'],
  ['--text-secondary', '--layer-02'],
  ['--interactive', '--layer-00'],
  ['--interactive', '--layer-01'],
  ['--interactive', '--layer-02'],
  ['--support-error', '--layer-01'],
  ['--support-error', '--layer-02'],
  ['--support-success', '--layer-01'],
  ['--support-warning', '--layer-01'],
  ['--text-on-interactive', '--interactive'],
  ['--text-on-interactive', '--interactive-hover'],
  // The danger button (VH-124): white on red-80 at rest, on red-70 hovered.
  ['--text-on-danger', '--button-danger'],
  ['--text-on-danger', '--button-danger-hover'],
]

const BORDER_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['--border-subtle', '--layer-00'],
  ['--border-subtle', '--layer-01'],
  ['--border-strong', '--layer-01'],
  // The focus ring against everything it can be drawn over (WCAG 2.4.13).
  ['--focus', '--layer-00'],
  ['--focus', '--layer-01'],
  ['--focus', '--layer-02'],
  // The progress bar's filled part against its track.
  ['--interactive', '--border-divider'],
]

describe.each([
  ['light', light],
  ['dark', dark],
  ['on a blue band', band],
])('%s', (_contextName, tokens) => {
  it.each(TEXT_PAIRS)('%s on %s meets AAA (7:1)', (fg, bg) => {
    expect(contrast(resolve(tokens, fg), resolve(tokens, bg))).toBeGreaterThanOrEqual(7)
  })

  it.each(BORDER_PAIRS)('%s on %s meets 1.4.11 (3:1)', (fg, bg) => {
    expect(contrast(resolve(tokens, fg), resolve(tokens, bg))).toBeGreaterThanOrEqual(3)
  })

  it('resolves every colour role to a hex value', () => {
    for (const name of new Set([...TEXT_PAIRS, ...BORDER_PAIRS].flat())) {
      expect(resolve(tokens, name), name).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('uses no black: the brand palette has none', () => {
    // Text is Nottingham Blue or white. A role that resolved to black would
    // pass every contrast test above and still be off-brand.
    for (const name of ['--text-primary', '--text-secondary', '--interactive', '--layer-00']) {
      expect(luminance(resolve(tokens, name)), name).toBeGreaterThan(luminance('#0a0a0a'))
    }
  })
})

describe('the brand assignments (VH-92)', () => {
  it('sets text in Nottingham Blue on light surfaces, and white on blue', () => {
    expect(resolve(light, '--text-primary')).toBe('#10263b')
    expect(resolve(dark, '--text-primary')).toBe('#ffffff')
    expect(resolve(band, '--text-primary')).toBe('#ffffff')
  })

  it('grounds a band, and the dark theme, in Nottingham Blue', () => {
    expect(resolve(band, '--layer-00')).toBe(resolve(light, '--uon-brand-blue'))
    expect(resolve(dark, '--layer-00')).toBe(resolve(light, '--uon-brand-blue'))
  })

  it('does not use pure white as the page ground', () => {
    // The brand discourages it for digital; the ground is the 5% blue tint.
    expect(resolve(light, '--layer-00')).not.toBe('#ffffff')
  })

  it('keeps a blue band and the dark theme on exactly the same roles', () => {
    // They are the same context — light things on Nottingham Blue — written
    // twice because CSS cannot share a block between a media query and a
    // class. If they drift, a band in the light theme stops being tested by
    // the dark theme's eye.
    expect(parseBlock(bandBlock)).toEqual(parseBlock(darkBlock))
  })

  it('pads non-16:9 video in the brand blue, as D1 was answered', () => {
    expect(resolve(light, '--uon-brand-bg')).toBe('#10263b')
  })
})

describe('token hygiene', () => {
  it('defines the AAA pointer-target floor', () => {
    expect(light['--target-min']).toBe('44px')
  })
})
