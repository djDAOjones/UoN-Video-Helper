/**
 * What the static page says, held to the things it must agree with.
 *
 * `index.html` is markup, not a module, so nothing type-checks its words
 * against the config that names the same things. The suite runs in Node with
 * no DOM; the page is read as text, with comments, scripts and tags removed so
 * only what a person would read is left.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  CLOSING_COLOURS,
  CLOSING_CONTROL_DEFAULTS,
  CLOSING_ONSETS,
  CLOSING_TYPES,
} from '../src/config/branding'
import { PRESETS, type PresetId } from '../src/config/presets'
import { CLOSING_TYPE_LABELS, onsetDisabledReason } from '../src/ui/closing-choice'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

/** The markup with comments gone, so prose about a rule cannot satisfy a test for it. */
const markup = html.replace(/<!--[\s\S]*?-->/g, '')

/** What is read on screen: no head, no scripts, no tags, whitespace collapsed. */
const visibleText = markup
  .replace(/<head>[\s\S]*?<\/head>/, '')
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')

describe('the privacy promise (VH-85)', () => {
  it('is on the page, in the words the maintainer asked for', () => {
    expect(visibleText).toContain(
      'Your video is processed on your device, it is never uploaded, and the original file does not change.',
    )
  })

  it('is said once', () => {
    // Spec 9.2 wants it visible throughout; saying it twice was a second
    // sentence to skim, not a second reassurance.
    expect(visibleText.match(/never uploaded/g)).toHaveLength(1)
  })

  it('comes before the file input it is about', () => {
    expect(markup.indexOf('never uploaded')).toBeLessThan(markup.indexOf('id="file-input"'))
  })
})

describe('the output choice (VH-85)', () => {
  /** The name shown beside one preset's radio. */
  function shownName(id: PresetId): string | undefined {
    const pattern = new RegExp(
      `name="preset"\\s+value="${id}"[^>]*>\\s*<span class="radio-label">\\s*<span>([^<]+)</span>`,
    )
    return pattern.exec(markup)?.[1]?.trim()
  }

  it.each(Object.keys(PRESETS) as PresetId[])('names "%s" as the config does', (id) => {
    // The label is duplicated by necessity — the page is static — and a
    // diagnostics line that names a setting the screen never offered is how a
    // support conversation goes wrong.
    expect(shownName(id)).toBe(PRESETS[id].label)
  })

  it('asks the question in the agreed words', () => {
    expect(markup).toMatch(/<legend class="label">File size \/ quality<\/legend>/)
  })
})

describe('captions, not subtitles (VH-86)', () => {
  it('never says "subtitle" on the static page', () => {
    expect(visibleText).not.toMatch(/subtitle/i)
  })

  it('offers no caption file field', () => {
    // Withdrawn with spec 8.3 step 2. One file input: the video.
    expect(markup.match(/type="file"/g)).toHaveLength(1)
  })
})

describe('the status line (VH-88)', () => {
  const systemCheck = /<details[^>]*id="system-check"[\s\S]*?<\/details>/.exec(markup)?.[0] ?? ''

  it('is a live region', () => {
    expect(markup).toMatch(/<p class="status" id="status" role="status" aria-live="polite">/)
  })

  it('is not inside the System check disclosure', () => {
    // That panel starts closed, and a live region inside a closed <details> is
    // neither seen nor announced — which would silence "Reading the video…",
    // every stage, and "Your video is ready."
    expect(systemCheck).not.toBe('')
    expect(systemCheck).not.toContain('id="status"')
  })

  it('sits with the controls it reports on, above the System check', () => {
    const status = markup.indexOf('id="status"')
    expect(status).toBeGreaterThan(markup.indexOf('id="process-actions"'))
    expect(status).toBeLessThan(markup.indexOf('id="process-result"'))
    expect(status).toBeLessThan(markup.indexOf('id="system-check"'))
  })

  it('is never hidden in the markup', () => {
    expect(markup).not.toMatch(/id="status"[^>]*\shidden/)
  })
})

describe('the System check panel (VH-88)', () => {
  it('keeps a level-two heading, inside its summary', () => {
    // A <details> has no heading of its own. Without one the panel drops out
    // of the list a screen-reader user navigates by — even when a failure has
    // opened it.
    expect(markup).toMatch(
      /<details[^>]*id="system-check"[^>]*>\s*<summary[^>]*>\s*<h2 id="system-check-summary">System check/,
    )
  })

  it('starts closed', () => {
    expect(markup).not.toMatch(/<details[^>]*id="system-check"[^>]*\sopen/)
  })
})

describe('the closing controls (VH-90)', () => {
  /** One `<select>`'s options, as `[value, text, selected]`. */
  function options(id: string): Array<readonly [string, string, boolean]> {
    const select = new RegExp(`<select[^>]*id="${id}"[^>]*>([\\s\\S]*?)</select>`).exec(markup)?.[1] ?? ''
    return [...select.matchAll(/<option value="([^"]+)"(\s+selected)?>([^<]+)<\/option>/g)].map(
      (match) => [match[1]!, match[3]!.trim(), match[2] !== undefined] as const,
    )
  }

  it('offers every animation type the config knows, under the name the reasons quote', () => {
    const shown = options('closing-type')
    expect(shown.map(([value]) => value)).toEqual([...CLOSING_TYPES])
    for (const [value, text] of shown) {
      expect(text).toBe(CLOSING_TYPE_LABELS[value as keyof typeof CLOSING_TYPE_LABELS])
    }
  })

  it('offers every onset the config knows, in the order asked for', () => {
    expect(options('closing-onset').map(([value, text]) => [value, text])).toEqual([
      ['existing', 'Over existing'],
      ['freeze', 'Over generated freeze frame'],
    ])
    expect(options('closing-onset').map(([value]) => value)).toEqual([...CLOSING_ONSETS])
  })

  it('offers both colours as native radios', () => {
    const values = [...markup.matchAll(/type="radio" name="closing-colour" value="([^"]+)"/g)].map(
      (match) => match[1],
    )
    expect(values).toEqual([...CLOSING_COLOURS])
  })

  it('starts on the defaults: Cut, blue', () => {
    // The page is static, so its resting state is a second copy of the
    // default. If they drift, the first job is not the one the screen shows.
    const selected = (id: string) => options(id).find(([, , isSelected]) => isSelected)?.[0]
    expect(selected('closing-type')).toBe(CLOSING_CONTROL_DEFAULTS.type)
    expect(selected('closing-onset')).toBe(CLOSING_CONTROL_DEFAULTS.onset)
    expect(markup).toMatch(
      new RegExp(`name="closing-colour" value="${CLOSING_CONTROL_DEFAULTS.colour}" checked`),
    )
  })

  it('starts with onset disabled and saying why, before any script runs', () => {
    expect(markup).toMatch(/<select[^>]*id="closing-onset"[^>]*\sdisabled/)
    expect(visibleText).toContain(onsetDisabledReason(CLOSING_CONTROL_DEFAULTS.type))
  })

  it('names the "?" and ties it to the text it discloses', () => {
    // A toggletip: a button that discloses, never hover alone. The name says
    // what it is about, because "?" says nothing to a screen reader.
    const button = /<button[^>]*id="onset-help-button"[^>]*>/.exec(markup)?.[0] ?? ''
    expect(button).toContain('type="button"')
    expect(button).toContain('aria-label="About animation onset"')
    expect(button).toContain('aria-expanded="false"')
    expect(button).toContain('aria-controls="onset-help"')
    expect(markup).toMatch(/id="onset-help"[^>]*\shidden/)
  })

  it('keeps all three inside the one fieldset the job lock disables', () => {
    const fieldset = /<fieldset[^>]*id="branding-choice"[\s\S]*?<fieldset class="choice" id="preset-choice"/.exec(markup)?.[0] ?? ''
    for (const id of ['closing-type', 'closing-onset', 'closing-colour', 'onset-help-button']) {
      expect(fieldset).toContain(`id="${id}"`)
    }
  })
})

