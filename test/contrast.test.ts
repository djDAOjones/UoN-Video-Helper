/**
 * Makes the AAA contrast claim in UI-STANDARDS.md mechanical.
 *
 * The invariant: every text/background pair the app actually renders meets
 * WCAG 2.2 AAA (7:1), in both light and dark themes, and every component
 * border meets 1.4.11 (3:1). Changing a token fails this test until the new
 * value is checked — which is the point. Colour choices are not a matter of
 * taste in a project with a stated AAA target.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../src/styles/tokens.carbon.css', import.meta.url), 'utf8')

/** Pulls custom properties out of a `:root` block. */
function parseBlock(source: string): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match
    if (name && value) tokens[name] = value.trim()
  }
  return tokens
}

const darkStart = css.indexOf('@media (prefers-color-scheme: dark)')
const light = parseBlock(css.slice(0, darkStart))
const dark = { ...light, ...parseBlock(css.slice(darkStart)) }

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
]

const BORDER_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['--border-subtle', '--layer-00'],
  ['--border-subtle', '--layer-01'],
  ['--border-strong', '--layer-01'],
]

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme', (_themeName, tokens) => {
  it.each(TEXT_PAIRS)('%s on %s meets AAA (7:1)', (fg, bg) => {
    const fgHex = tokens[fg]
    const bgHex = tokens[bg]
    expect(fgHex, `missing token ${fg}`).toBeDefined()
    expect(bgHex, `missing token ${bg}`).toBeDefined()
    expect(contrast(fgHex!, bgHex!)).toBeGreaterThanOrEqual(7)
  })

  it.each(BORDER_PAIRS)('%s on %s meets 1.4.11 (3:1)', (fg, bg) => {
    expect(contrast(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(3)
  })
})

describe('token hygiene', () => {
  it('defines the AAA pointer-target floor', () => {
    expect(light['--target-min']).toBe('44px')
  })
})
