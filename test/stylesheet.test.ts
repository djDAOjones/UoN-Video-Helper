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

/** The declarations of the type role a selector wears: the one rule whose list names it and sets a size (VH-166). */
const roleOf = (selector: string): string => {
  const found = [...rules.matchAll(/(?:^|(?<=\}))\s*([^{}@]+?)\s*\{([^}]*)\}/g)].filter(
    (match) => match[1]!.split(',').some((name) => name.trim() === selector) && /font-size:/.test(match[2]!),
  )
  expect(found, `type roles naming ${selector}`).toHaveLength(1)
  return found[0]![2]!
}

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

  it('put the page language on the right of the logo, and wrap it under the logo where both do not fit (VH-154)', () => {
    // Page language moved up from above the heading, where it pushed step 1
    // below the first screen (V-18).
    const band = /\.band--header \.band-inner\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(band).toMatch(/display:\s*flex;/)
    expect(band).toMatch(/flex-wrap:\s*wrap;/)
    expect(band).toMatch(/justify-content:\s*space-between;/)
    // Beside the segments, one target high, only where there is room; on a
    // phone the label goes back above them.
    const beside = /@media \(min-width: 34rem\)\s*\{\s*\.language-switcher > legend\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(beside).toMatch(/float:\s*left;/)
    expect(beside).toMatch(/min-height:\s*var\(--target-min\);/)
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
      .filter((value) => !/^var\(--line-height-[a-z0-9-]+\)$/.test(value) && value !== 'inherit')
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
    expect(tokens).toMatch(/--measure:\s*28rem;/)
    expect(tokens).toMatch(/--line-height-body:\s*1\.5;/)
    expect(tokens).toMatch(/--paragraph-gap:\s*var\(--spacing-05\);/)
  })
})

describe('the content-sized switchers (VH-135)', () => {
  /** A rule's declarations, by its exact selector list. */
  const block = (selectors: string): string =>
    new RegExp(`${selectors.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/,\s*/g, ',\\s*')}\\s*\\{([^}]*)\\}`).exec(rules)?.[1] ?? ''
  const switchers = ['.language-switcher', '.video-kind', '.video-language']
  const chosen = roleOf('.segment input:checked + .segment-face')

  it('reserve each face\u2019s bold width, so a choice moves no neighbour', () => {
    // A segment as wide as its words widened as its face turned bold, and
    // pushed the one beside it on every choice.
    const reserve = block(switchers.map((name) => `${name} .segment-face::after`).join(', '))
    expect(reserve).toMatch(/content:\s*attr\(data-text\)\s*\/\s*''/)
    expect(reserve).toMatch(/height:\s*0;/)
    expect(reserve).toMatch(/overflow:\s*hidden;/)
    expect(reserve).toMatch(/visibility:\s*hidden;/)
    // The reserved words are exactly as heavy as the chosen face's.
    const weight = /font-weight:\s*(var\(--type-weight-[\w-]+\))/.exec(chosen)?.[1]
    expect(weight).toBeDefined()
    expect(reserve).toContain(`font-weight: ${weight};`)
  })

  it('stack the reserve under the words, with no gap to add height', () => {
    const face = block(switchers.map((name) => `${name} .segment-face`).join(', '))
    expect(face).toMatch(/flex-direction:\s*column;/)
    expect(face).toMatch(/gap:\s*0;/)
  })
})


describe('trim time rows (VH-144)', () => {
  it('wraps only those rows and keeps the field’s minimum reading width', () => {
    expect(rules).toMatch(/\.trim-time-row\s*\{[^}]*flex-wrap:\s*wrap/)
    // The floor gives way to a row narrower than itself (VH-151, R2-11).
    expect(rules).toMatch(/\.trim-time-row \.text-input\s*\{[^}]*flex:\s*1 0 min\(var\(--field-min-width\), 100%\);[^}]*min-width:\s*min\(var\(--field-min-width\), 100%\)/)
    expect(rules).not.toMatch(/\.control-with-help\s*\{[^}]*flex-wrap/)
  })
})


describe('explicit browser defaults and type roles (VH-145)', () => {
  const block = (selector: string): string => rules.split('\n' + selector + ' {')[1]?.split('}')[0] ?? ''
  it('uses named font weights and the diagnostics face', () => {
    expect(rules).not.toMatch(/font-weight:\s*(?:\d+|normal|bold|bolder|lighter)/)
    expect(rules).toContain('font-family: var(--font-mono)')
  })
  it('pins the defaults that shape the controls and status lines', () => {
    expect(block('.status')).toContain('margin: var(--spacing-05) 0 0')
    expect(block('.status')).toContain('var(--type-body-compact) * var(--line-height-body)')
    expect(block('.step > .status--save:empty')).toContain('min-height: 0')
    expect(block('.segmented > legend')).toContain('padding: 0')
    expect(block('.radio input')).toContain('margin: 0')
    expect(block('.radio--described input')).toContain('margin-top: var(--spacing-01)')
    expect(roleOf('.select')).toContain('line-height: var(--line-height-body)')
    expect(block('.choice')).toContain('min-width: 0')
    expect(block('.dialog')).toContain('max-width: calc(100vw - 2 * var(--spacing-05))')
    expect(readFileSync(new URL('../index.html', import.meta.url), 'utf8')).toContain('class="step-intro" id="errors-intro"')
  })
  it('groups the identical rules and removes the unused result link', () => {
    expect(rules).not.toContain('.result-link')
    expect(rules).toContain('.footer-contact-link,\n.notification-link {')
    expect(rules).toContain('.closing-result,\n.trim-result {')
  })
})

describe('disabled fields (VH-141, pinned by VH-150)', () => {
  it('draw a locked description field like a locked select or text field: no fill, a dashed edge', () => {
    // VH-141 added the textarea to the group; a field that keeps its fill
    // reads as live while the job runs (VH-112, U-12).
    const group = /\.select:disabled,\s*\.text-input:disabled,\s*\.textarea:disabled\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(group).toContain('background: transparent')
    expect(group).toMatch(/border:\s*var\(--border-width\) dashed var\(--border-subtle\)/)
  })
})

describe('disabled controls look disabled (VH-151)', () => {
  /** A rule's declarations, by its exact selector, wherever it sits. */
  const block = (source: string, selector: string): string =>
    new RegExp(`(?:^|[}\\s])${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(source)?.[1] ?? ''
  const forced = /@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}/.exec(rules)?.[1] ?? ''

  it('draw a locked select\u2019s arrow in the disabled text colour, and GrayText in forced colours', () => {
    // The arrow took the wrapper's colour and stayed live beside a dashed,
    // secondary-text select (R2-6).
    expect(block(rules, '.select-wrap:has(.select:disabled)::after')).toContain('color: var(--text-secondary)')
    expect(block(forced, '.select-wrap:has(.select:disabled)::after')).toContain('border-color: GrayText')
  })

  it('give the browser-drawn Choose file button the dashed edge every disabled button has', () => {
    const button = block(rules, '.file-input:disabled::file-selector-button,\n.file-input:disabled:hover::file-selector-button')
    expect(button).toContain('border-style: dashed')
    expect(block(rules, '.button:disabled,\n.button--secondary:disabled')).toContain('border-style: dashed')
  })

  it('keep a locked field\u2019s dashed edge when it is also marked invalid', () => {
    // The invalid rule came later at equal specificity and drew a solid edge.
    expect(rules).not.toMatch(/\.(?:text-input|textarea)\[aria-invalid='true'\]\s*\{/)
    expect(rules).toContain(".text-input[aria-invalid='true']:not(:disabled) {")
    expect(rules).toContain(".textarea[aria-invalid='true']:not(:disabled) {")
  })
})

describe('type weights (VH-145, pinned by VH-151)', () => {
  const tokens = readFileSync(new URL('../src/styles/tokens.carbon.css', import.meta.url), 'utf8')

  it('hold the three weights and the status mark\u2019s own role', () => {
    expect(tokens).toMatch(/--type-weight-body:\s*400;/)
    expect(tokens).toMatch(/--type-weight-emphasis:\s*600;/)
    expect(tokens).toMatch(/--type-weight-heading:\s*700;/)
    expect(tokens).toMatch(/--type-weight-mark:\s*700;/)
    // A status glyph is not a heading (VH-151).
    expect(rules).toMatch(/\.check \.mark\s*\{[^}]*font-weight:\s*var\(--type-weight-mark\)/)
  })

  it('set the body\u2019s weight from the body role', () => {
    expect(roleOf('body')).toContain('font-weight: var(--type-weight-body)')
  })

  it('refuse a literal weight inside a font shorthand', () => {
    const shorthands = [...rules.matchAll(/(?:^|[;{\s])font:\s*([^;]+);/g)].map((match) => match[1]!.trim())
    expect(shorthands.length).toBeGreaterThan(0)
    for (const value of shorthands) expect(value, `font: ${value}`).not.toMatch(/\b(?:[1-9]00|normal|bold|bolder|lighter)\b/)
  })

  it('keep the reason a link on its own line is a 44 px target', () => {
    expect(css).toMatch(/44 px target like any control \(WCAG 2\.5\.5\)\. \*\/\s*\.footer-contact-link,\s*\.notification-link \{/)
  })
})

describe('long words and the trim handles under forced colours (VH-165)', () => {
  const forced = /@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}/.exec(rules)?.[1] ?? ''

  it('lets a word longer than its line break in running text, and nowhere else', () => {
    // A file name or a student ID with no space ran past a phone's width (V-34).
    expect(rules).toMatch(/(?:^|\})\s*p,\s*li,\s*dd\s*\{[^}]*max-width:\s*var\(--measure\);[^}]*overflow-wrap:\s*anywhere;/)
    // Every character stays: no break between any two letters, no clipping.
    expect(rules).not.toMatch(/word-break:\s*break-all/)
    expect(rules).not.toMatch(/\.(?:notification-body|field-error|status)\s*\{[^}]*text-overflow/)
  })

  it('gives each engine its own focus-ring rule, so Chrome keeps its own', () => {
    // A list naming the other engine's pseudo-element is dropped whole (V-38).
    expect(forced).not.toMatch(/::-webkit-slider-thumb,\s*\.range-input[^{]*::-moz-range-thumb\s*\{/)
    expect(forced).toMatch(/\.range-input:focus-visible::-webkit-slider-thumb\s*\{\s*outline-color:\s*CanvasText;\s*\}/)
    expect(forced).toMatch(/\.range-input:focus-visible::-moz-range-thumb\s*\{\s*outline-color:\s*CanvasText;\s*\}/)
  })
})

describe('one type set (VH-166)', () => {
  const tokens = readFileSync(new URL('../src/styles/tokens.carbon.css', import.meta.url), 'utf8')
  const roles: Record<string, [string, string, string, string[]]> = {
    'page title': ['heading-04', 'heading', 'heading', ['.page-title']],
    'panel heading': ['heading-03', 'heading', 'heading-03', ['.panel h2', '.dialog h2']],
    'section heading': ['heading-compact', 'emphasis', 'body', ['.notification-title', '.statement-body h3', '.language-switcher > legend', '.video-kind > legend', '.video-language > legend']],
    body: ['body', 'body', 'body', ['body', '.text-input', '.textarea']],
    supporting: ['body-compact', 'body', 'body', ['.button', '.label', '.helper', '.select', '.file-input', '.notification-body', '.field-error', '.segment-face', '.disclosure-summary']],
    'compact emphasis': ['body-compact', 'emphasis', 'body', ['.segment input:checked + .segment-face', '.notification-item-title', '.help-button', '.toggletip strong', '.status strong']],
    'status mark': ['body-compact', 'mark', 'body', ['.check .mark']],
    code: ['body-compact', 'body', 'body', ['.notification pre', '.feedback-details', '.log']],
  }

  it('gives each of the eight roles one size, weight and line height, in one rule', () => {
    for (const [role, [size, weight, line, selectors]] of Object.entries(roles)) {
      const first = roleOf(selectors[0]!)
      expect(first, role).toContain(`font-size: var(--type-${size});`)
      expect(first, role).toContain(`font-weight: var(--type-weight-${weight});`)
      expect(first, role).toContain(`line-height: var(--line-height-${line});`)
      for (const selector of selectors) expect(roleOf(selector), `${selector} wears ${role}`).toBe(first)
    }
    const sized = [...rules.matchAll(/font-size:/g)].length
    expect(sized, 'only the eight roles set a size').toBe(8)
  })

  it('sets the panel heading on Carbon heading-03\u2019s 28 px line', () => {
    expect(tokens).toMatch(/--line-height-heading-03:\s*1\.4;/)
    expect(tokens).toMatch(/--type-heading-03:\s*1\.25rem;/)
  })

  it('draws the footer\u2019s two headings as panel headings, not as the summary\u2019s text', () => {
    expect(rules).not.toMatch(/\.disclosure-summary h2\s*\{[^}]*font:/)
    expect(rules).not.toMatch(/\.statement > \.disclosure-summary\s*\{[^}]*font-/)
  })

  it('spaces the footer\u2019s panels as the steps are (V-37)', () => {
    expect(rules).not.toMatch(/\.band--footer \.(?:system-check|statement)\b[^{]*\{[^}]*margin-bottom/)
  })

  it('gives the header band the column\u2019s inset below the layout width (V-36)', () => {
    expect(tokens).toMatch(/--layout-width:\s*60rem;/)
    expect(rules).toMatch(/@media \(max-width: 60rem\)\s*\{\s*\.band--header \.band-inner\s*\{\s*padding-inline:\s*var\(--spacing-06\);/)
  })
})

describe('one reading measure (VH-167)', () => {
  const tokens = readFileSync(new URL('../src/styles/tokens.carbon.css', import.meta.url), 'utf8')

  it('is one rem width, so no size or language resolves it to a width of its own', () => {
    // 55ch and 40em held four widths in one column (V-33); a rem does not follow the element's font.
    expect(tokens).toMatch(/--measure:\s*\d+(?:\.\d+)?rem;/)
    expect(tokens).not.toMatch(/--measure-cjk/)
    expect(rules).not.toMatch(/max-width:\s*var\(--measure-cjk\)/)
    expect(rules).not.toMatch(/:lang\(zh\)[^{]*\{[^}]*max-width/)
  })

  it('stops the prose inside a row and the fields where running text stops', () => {
    expect(rules).toMatch(/(?:^|\})\s*\.fact-note,\s*\.radio-detail\s*\{\s*max-width:\s*var\(--measure\);\s*\}/)
    expect(rules).toMatch(/#title-card-fields \.text-input,\s*#submission-card-fields \.text-input,\s*#submission-card-fields \.textarea\s*\{\s*max-width:\s*var\(--measure\);/)
    // A cap, never a width: on a phone each yields to its container.
    expect(rules).not.toMatch(/(?:min-width|[^-]width):\s*var\(--measure\)/)
  })

  it('puts one blank line between the toggletip\u2019s paragraphs, as between any two', () => {
    expect(rules).toMatch(/\.toggletip p \+ p\s*\{\s*margin-top:\s*var\(--paragraph-gap\);\s*\}/)
  })
})

describe('a pressed state for each button kind (VH-169)', () => {
  const forced = /@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}/.exec(rules)?.[1] ?? ''
  const fill = (source: string, selector: string): string =>
    new RegExp(`(?:^|\\})\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(source)?.[1] ?? ''

  it('gives the primary, the secondary, the danger button and both Choose file looks a fill of their own when held', () => {
    // Held down, each drew its hover fill (V-39).
    expect(fill(rules, '.button:active:not(:disabled)')).toContain('background: var(--interactive-active)')
    expect(fill(rules, '.button--secondary:active:not(:disabled)')).toContain('background: var(--layer-active)')
    expect(fill(rules, '.button--danger:active:not(:disabled)')).toContain('background: var(--button-danger-active)')
    expect(fill(rules, '.file-input:not(:disabled):active::file-selector-button')).toContain('background: var(--interactive-active)')
    expect(fill(rules, '.file-input--chosen:not(:disabled):active::file-selector-button')).toContain('background: var(--layer-active)')
  })

  it('never presses a disabled button', () => {
    for (const match of rules.matchAll(/([^{}]*:active[^{}]*)\{/g)) {
      for (const selector of match[1]!.split(',')) expect(selector, selector.trim()).toContain(':not(:disabled)')
    }
  })

  it('inverts the system colours under forced colours, since hover cannot change them', () => {
    expect(
      fill(forced, '.button:not(.button--secondary):not(:disabled):active,\n  .file-input:not(:disabled):not(.file-input--chosen):active::file-selector-button'),
    ).toMatch(/background: HighlightText;\s*color: Highlight;/)
    expect(
      fill(forced, '.button--secondary:not(:disabled):active,\n  .file-input--chosen:not(:disabled):active::file-selector-button'),
    ).toMatch(/forced-color-adjust: none;[\s\S]*background: ButtonText;\s*color: ButtonFace;/)
  })
})
