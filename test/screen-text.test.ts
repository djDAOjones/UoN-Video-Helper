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
import {
  CREATORS_TEAM_URL,
  FEEDBACK_ADDRESS,
  LEARNING_CONTENT_TEAM_ADDRESS,
} from '../src/config/feedback'
import { PRESETS, type PresetId } from '../src/config/presets'
import { DEFAULT_VIDEO_KIND, VIDEO_KINDS } from '../src/config/video-kind'
import { enGB } from '../src/i18n/en-GB'
import { closingTypeLabel, onsetDisabledReason } from '../src/ui/closing-choice'

/**
 * The page's English, with the table bindings (VH-105) taken out: a
 * `data-i18n` attribute names where a string comes from, not what it says,
 * and the words between the tags are still the no-script English.
 */
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8').replace(
  /\s+data-i18n(?:-attr)?="[^"]*"/g,
  '',
)

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

describe('what the tool does, and where it works (2026-09-30)', () => {
  const lede = /<div class="lede">([\s\S]*?)<\/div>/.exec(markup)?.[1] ?? ''

  it('lists the three things it does, in the maintainer\'s words', () => {
    const items = [...lede.matchAll(/<li>([^<]+)<\/li>/g)].map((match) => match[1]!.trim())
    // Each a line a person reads as a line: a capital and a full stop
    // (VH-124); the words are the maintainer's (VH-85).
    expect(items).toEqual([
      'Adds approved branding.',
      'Ensures consistent audio levels.',
      'Outputs an optimised file type and size.',
    ])
  })

  it('says which browser it is built for, before anything is chosen', () => {
    // The answer to "does it work in Edge, Firefox and Safari": it is built
    // and tested for Chrome, and says so, rather than let another browser
    // fail part-way through a job. Since 2026-10-01 the sentence is rewritten
    // once the load-time check lands (`browserNote`), so this is what a
    // browser reads before that — and what one without scripts reads at all.
    expect(visibleText).toContain(
      'This tool is designed and built for Chrome, so other browsers may not work.',
    )
    expect(markup).toMatch(/<p id="browser-note">This tool is designed and built for Chrome/)
    expect(markup.indexOf('designed and built for Chrome')).toBeLessThan(
      markup.indexOf('id="file-input"'),
    )
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
    // Seen as the step's heading; named again, for assistive technology only,
    // as the legend of the radio group it heads (VH-91).
    expect(visibleText).toContain('File size / quality')
    expect(markup).toMatch(/<legend class="visually-hidden">File size \/ quality<\/legend>/)
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
    // Under the verdict and above what it reports on — the bar, the outcome,
    // Create (VH-124) — and never down in the footer.
    const status = markup.indexOf('id="status"')
    expect(status).toBeGreaterThan(markup.indexOf('id="preflight-report"'))
    expect(status).toBeLessThan(markup.indexOf('id="process-progress"'))
    expect(status).toBeLessThan(markup.indexOf('id="process-result"'))
    expect(status).toBeLessThan(markup.indexOf('id="system-check"'))
  })

  it('is never hidden in the markup', () => {
    expect(markup).not.toMatch(/id="status"[^>]*\shidden/)
  })
})

describe('a sentence for a screen reader alone (VH-149)', () => {
  const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const showError = /function showError\([^)]*\): void \{([\s\S]*?)\n\}/.exec(mainSource)?.[1] ?? ''
  const previewError = /trimPreview\.addEventListener\('error', \(\) => \{([\s\S]*?)\n\}\)/.exec(mainSource)?.[1] ?? ''

  it('is a polite live region on the page in every state, outside every step and the errors panel', () => {
    expect(markup).toContain('<p class="visually-hidden" id="page-announcer" role="status" aria-live="polite"></p>')
    const announcer = markup.indexOf('id="page-announcer"')
    expect(announcer).toBeGreaterThan(markup.lastIndexOf('</section>', markup.indexOf('id="errors-panel"')))
    expect(announcer).toBeLessThan(markup.indexOf('id="errors-panel"'))
  })

  it("says Errors captured once, as it appears, and leaves step 1's line its words", () => {
    // The worker that never answers: settleStartup writes the block's reason
    // to step 1's line, then its error reaches showError, which emptied it.
    expect(showError).toContain('if (errorsPanel.hidden) announce(() => t().errors.revealed)')
    expect(showError).not.toMatch(/setSourceStatus|setSourceReadStatus|sourceStatusLine/)
  })

  it('says a refused preview without emptying "Video read." and its "No sound."', () => {
    expect(previewError).toContain('announce(() => t().trim.noPreview)')
    expect(previewError).not.toMatch(/setSourceStatus|setSourceReadStatus|sourceStatusLine/)
  })
})

describe('the save\'s own line (VH-135)', () => {
  const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  /** Every message a save writes, as the script names it. */
  const saveMessages = [
    'saving',
    'stoppingSave',
    'saveStopped',
    'notSaved',
    'refusedSource',
    'saved',
  ]

  it('is a live region of its own, never hidden in the markup', () => {
    expect(markup).toMatch(/<p class="status status--save" id="save-status" role="status" aria-live="polite">/)
    expect(markup).not.toMatch(/id="save-status"[^>]*\shidden/)
  })

  it('writes every save message there, and none on the job\'s line', () => {
    // A previous video can be saving while the next file is checked: on one
    // line, the verdict replaced "Saving…" and "Saved." replaced the verdict.
    for (const message of saveMessages) {
      expect(mainSource).toMatch(new RegExp(`setSaveStatus\\(\\(\\) =>[^;]*t\\(\\)\\.status\\.${message}\\b`))
      expect(mainSource).not.toMatch(new RegExp(`\\bsetStatus\\([^;]*t\\(\\)\\.status\\.${message}\\b`))
    }
    // VH-153: a failed save is said from its own two rows, one per sentence.
    expect(mainSource).toContain(
      "setSaveStatus('', () => `${t().status.saveFailedWhat}${sentenceGap()}${t().status.saveFailedNext}`)",
    )
    // VH-141 took saveFailed out of the list above and with it this half
    // (VH-149): spoken on the save's line, never on the job's.
    expect(mainSource).not.toMatch(/\bsetStatus\([^;]*t\(\)\.status\.saveFailed/)
    expect(mainSource).toMatch(/setSaveStatus\(\(\) =>\s*downloadStatusText\(/)
    expect(mainSource).not.toMatch(/\bsetStatus\([^;]*downloadStatusText\(/)
  })

  it('keeps Stop saving under the save\'s line, not in the check\'s row', () => {
    expect(mainSource).toContain('saveActions.append(stopSaveButton)')
    expect(mainSource).toContain('stopActions.append(stopCheckButton, checkAgainButton)\n')
  })

  it('goes with the result it describes', () => {
    // Its words are about one video; a new job or a new file clearing the
    // result takes them too, and nothing else empties the result.
    expect(mainSource).not.toMatch(/\bclear\(processResult\)(?![\s\S]{0,40}clear\(saveStatusLine\))/)
    expect(/function clearResult\(\): void \{\s*clear\(processResult\)\s*clear\(saveStatusLine\)/.test(mainSource)).toBe(true)
  })
})

describe('the job\'s state (VH-150)', () => {
  const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  /** The body of one top-level function in the script, whatever it returns. */
  const body = (name: string): string =>
    new RegExp(`function ${name}\\([^)]*\\): [^{]+\\{([\\s\\S]*?)\\n\\}`).exec(mainSource)?.[1] ?? ''

  it('offers no Show progress control: the owner withdrew it, and Announce progress stays, remembered', () => {
    expect(markup).not.toMatch(/show-progress|Show progress/)
    expect(mainSource).not.toMatch(/showProgress|show-progress|syncProgressVisibility/)
    expect(Object.keys(enGB.create)).not.toContain('showProgress')
    expect(Object.keys(enGB.create)).not.toContain('showProgressHelp')
    expect(markup).toMatch(/<input type="checkbox" id="announce-progress" checked/)
    expect(mainSource).toContain('announceProgressBox.checked = readAnnounceProgress(localStore)')
    expect(mainSource).toContain('writeAnnounceProgress(localStore, announceProgressBox.checked)')
  })

  it('moves nothing once Cancel is pressed or a failure shows: the report is dropped first', () => {
    // VH-141's V-14, WCAG 2.2.2: a report in flight must not restart the bar.
    expect(body('onStage')).toMatch(/^(\s*\/\/[^\n]*)*\s*if \(cancelRequested \|\| jobEnding\) return\n/)
    expect(body('onStage')).not.toContain('!cancelRequested')
    expect(body('onStage')).toContain("setTitle('stage')")
  })

  it('starts every job on an empty bar, never the last job\'s figure', () => {
    expect(body('beginJob')).toMatch(/progressMemo = NO_PROGRESS\s*resetProgress\(\)/)
    const reset = body('resetProgress')
    expect(reset).toContain('processProgress.value = 0')
    expect(reset).toContain("processProgressText.textContent = ''")
    expect(reset).toContain("processTimeLeft.textContent = ''")
    expect(reset).toContain('lastProgress = null')
  })

  it('regression: withdraws "The job is stopping" once the worker has settled', () => {
    const settledThen = /await settled\(id\)([\s\S]*?)\n {4}\}\)/.exec(mainSource)?.[1] ?? ''
    expect(settledThen).toMatch(/setStatus\('', \(\) => t\(\)\.status\.couldNotCreate\(/)
    expect(settledThen).not.toContain('stoppingAfterFailure')
  })

  it('keeps Save the one primary button when an unreadable file is chosen beside a result', () => {
    expect(body('clearTrim')).toContain("if (!resultStanding) fileInput.classList.remove('file-input--chosen')")
    expect(mainSource.match(/classList\.remove\('file-input--chosen'\)/g)).toHaveLength(1)
  })

  it('keeps a result\'s lifetime and warnings across a redraw', () => {
    const result = body('renderResult')
    // A downloaded result put back says "until the next video", not "until you save it".
    expect(result).toContain("let lifetimeOf: 'unsaved' | 'delivered' = kept.delivered ? 'delivered' : 'unsaved'")
    // Painted from the retained result, so "Keep it" and a language change keep them.
    expect(result).toMatch(/const paint = \(\): void => \{[\s\S]*renderWarnings\(resultWarnings, kept\.warnings,/)
  })

  it('regression: puts a result\'s warnings beside its notification, not inside it, and without "None of these stop you continuing"', () => {
    const result = body('renderResult')
    expect(result).not.toContain('heading.append(resultWarnings)')
    expect(result).toContain('processResult.replaceChildren(heading, resultWarnings)')
    expect(result).toContain('{ heading: t().warnings.finishedHeading, reassure: false }')
  })

  it('clears a failed save\'s notification with any later save message', () => {
    expect(body('setSaveStatus')).toMatch(/^\s*clear\(saveError\)/)
  })

  it('regression: says a block that holds after a re-check without "Video read." first', () => {
    // Its parameter list holds a `() => boolean`, which `body` cannot step over.
    const preflight = /async function runPreflight\([\s\S]*?\n\}\n/.exec(mainSource)?.[0] ?? ''
    expect(body('withdrawVerdict')).not.toContain('setSourceReadStatus')
    expect(body('withdrawVerdict')).toContain('readLineOwed = true')
    expect(preflight).not.toContain('sourceBlock.childElementCount')
    // The block takes step 1's line, and the debt with it.
    expect(preflight).toMatch(/withdrawVerdict\(\)\s*readLineOwed = false\s*show\(sourceBlock/)
    // Anything else that settles the check pays it back, once.
    expect(body('payReadLine')).toMatch(/if \(readLineOwed && inspectedReport\) setSourceReadStatus\(inspectedReport\)\s*readLineOwed = false/)
    expect(preflight.match(/payReadLine\(\)/g)).toHaveLength(4)
  })

  it('regression: hands focus from each Set button to its own time field', () => {
    const previewError = /trimPreview\.addEventListener\('error', \(\) => \{([\s\S]*?)\n\}\)/.exec(mainSource)?.[1] ?? ''
    expect(previewError).toContain('document.activeElement === trimSetEnd ? trimEndField : trimStartField')
    expect(previewError).toContain('fromPreview(field)')
  })
})

describe('the discard question\'s spoken words (VH-135)', () => {
  const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  /** The body of one top-level function in the script. */
  const body = (name: string): string => new RegExp(`function ${name}\\([^)]*\\): void \\{([\\s\\S]*?)\\n\\}`).exec(mainSource)?.[1] ?? ''

  it('are marked as the status line\'s when the question is asked', () => {
    expect(mainSource).toMatch(/setStatus\('', \(\) => t\(\)\.discard\.spoken\([^\n]*\n\s*statusAsksDiscard = true/)
  })

  it('are forgotten by anything else the line says', () => {
    expect(body('setStatus')).toMatch(/^\s*statusAsksDiscard = false/)
  })

  it('go when the question does: withdrawn by a change, or answered Keep it', () => {
    // Spoken-only words linger unseen: a screen-reader user browsing the page
    // could still find "Starting again will discard it." after it had gone.
    expect(body('unsayDiscardQuestion')).toMatch(/if \(statusAsksDiscard\) setStatus\(''\)/)
    expect(body('withdrawDiscardQuestion')).toContain('unsayDiscardQuestion()')
    expect(mainSource).toMatch(/const fromKeep = focusHeldBy\(\[keep\]\)\s*unsayDiscardQuestion\(\)/)
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

describe('the accessibility statement (VH-130)', () => {
  const statement =
    /<details[^>]*id="accessibility-statement"[\s\S]*?<\/details>/.exec(markup)?.[0] ?? ''
  const footer = /<footer[\s\S]*?<\/footer>/.exec(markup)?.[0] ?? ''

  it('keeps a level-two heading inside its summary, as the System check does', () => {
    expect(statement).toMatch(
      /^<details[^>]*>\s*<summary class="disclosure-summary">\s*<h2[^>]*>Accessibility statement<\/h2>/,
    )
  })

  it('starts closed', () => {
    expect(markup).not.toMatch(/<details[^>]*id="accessibility-statement"[^>]*\sopen/)
  })

  it('sits in the footer, beside the System check and above the feedback button', () => {
    expect(footer).toContain(statement)
    expect(footer.indexOf('id="accessibility-statement"')).toBeGreaterThan(
      footer.indexOf('id="system-check"'),
    )
    expect(footer.indexOf('id="accessibility-statement"')).toBeLessThan(
      footer.indexOf('id="feedback-open"'),
    )
  })

  it('follows the model statement’s sections, each under a level-three heading', () => {
    const subheadings = [...statement.matchAll(/<h3>([^<]+)<\/h3>/g)].map((match) => match[1])
    expect(subheadings).toEqual([
      'How accessible this tool is',
      'Feedback and contact',
      'Enforcement procedure',
      'Compliance status',
      'How we tested this tool',
      'What we plan to test next',
      'About this statement',
    ])
  })

  it('writes its lists as lists, one item per line of the table', () => {
    const lists = [...statement.matchAll(/<ul>([\s\S]*?)<\/ul>/g)].map(
      (match) => match[1]!.match(/<li>/g)?.length ?? 0,
    )
    expect(lists).toEqual([
      enGB.statement.abilities.length,
      enGB.statement.limits.items.length,
      enGB.statement.plans.items.length,
    ])
  })

  it('leaves a place for each sentence the script paints with a link or a date', () => {
    for (const id of ['statement-contact', 'statement-enforcement', 'statement-wave', 'statement-about']) {
      expect(statement).toContain(`<p id="${id}"></p>`)
    }
  })
})

describe('the footer\'s team contacts (VH-130)', () => {
  const footer = /<footer[\s\S]*?<\/footer>/.exec(markup)?.[0] ?? ''
  const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  /** Any email address written out, as a literal would be. */
  const anAddress = /[\w.%+-]+@[\w-]+(?:\.[\w-]+)+/

  it('offers each team as a link on a line of its own, under the feedback button and above the version', () => {
    for (const [id, words] of [
      ['contact-creators', enGB.footer.contact.creators],
      ['contact-learning-content', enGB.footer.contact.learningContent],
    ] as const) {
      expect(footer).toMatch(new RegExp(`<li>\\s*<a class="footer-contact-link" id="${id}">${words.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</a>\\s*</li>`))
      expect(footer.indexOf(`id="${id}"`)).toBeGreaterThan(footer.indexOf('id="feedback-open"'))
      expect(footer.indexOf(`id="${id}"`)).toBeLessThan(footer.indexOf('id="version-line"'))
    }
  })

  it('takes each address from config, never from the page or the script', () => {
    // The script sets each `href` from config/feedback.ts; a literal address
    // in either file would be a second copy to forget when a team's arrives.
    expect(html).not.toMatch(anAddress)
    expect(mainSource).not.toMatch(anAddress)
    expect(mainSource).toContain('creatorsLink.href = CREATORS_TEAM_URL')
    expect(mainSource).toContain('learningContentLink.href = `mailto:${LEARNING_CONTENT_TEAM_ADDRESS}`')
  })

  it('uses the owner’s two supplied destinations, leaving feedback at the owner’s address (VH-148)', () => {
    // The whole address the hand-off gave, not only its host (VH-153).
    expect(CREATORS_TEAM_URL).toBe(
      'https://teams.microsoft.com/l/team/19%3A14c7a4d2bf43456fa0c3c52c851fb097%40thread.tacv2/conversations?groupId=bd942b5f-5389-410c-abf2-9ba087360738&tenantId=67bda7ee-fd80-41ef-ac91-358418290a1e',
    )
    expect(LEARNING_CONTENT_TEAM_ADDRESS).toBe('UI-Learning-Content@nottingham.ac.uk')
    expect(FEEDBACK_ADDRESS).toBe('joe.bell@nottingham.ac.uk')
    expect(mainSource).toContain("creatorsLink.target = '_blank'")
    expect(mainSource).toContain("creatorsLink.rel = 'noopener noreferrer'")
    // VH-124’s full-stop rule excludes these two links: a link is a label like a button.
    expect(enGB.footer.contact.creators).not.toMatch(/\.$/)
    expect(enGB.footer.contact.learningContent).not.toMatch(/\.$/)
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
      expect(text).toBe(closingTypeLabel(value as (typeof CLOSING_TYPES)[number]))
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
    const fieldset =
      /<fieldset[^>]*id="branding-choice"[\s\S]*?<\/fieldset>\s*<\/section>/.exec(markup)?.[0] ?? ''
    for (const id of ['closing-type', 'closing-onset', 'closing-colour', 'onset-help-button']) {
      expect(fieldset).toContain(`id="${id}"`)
    }
  })
})

describe('Staff video or Student submission (VH-131)', () => {
  const fieldset = /<fieldset[^>]*id="video-kind"[\s\S]*?<\/fieldset>/.exec(markup)?.[0] ?? ''

  it('offers both sides as native radios, in the config’s order and words', () => {
    const values = [...fieldset.matchAll(/type="radio" name="video-kind" value="([^"]+)"/g)].map(
      (match) => match[1],
    )
    expect(values).toEqual([...VIDEO_KINDS])
    expect(fieldset).toContain(enGB.videoKind.options.staff)
    expect(fieldset).toContain(enGB.videoKind.options.submission)
  })

  it('gives each face its own words to reserve its bold width from, in every language (VH-135)', () => {
    // The stylesheet reserves the chosen weight from `data-text`; bound to the
    // same message as the face, it follows a change of language.
    const raw = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
    const faces = [...raw.matchAll(/<span class="segment-face" data-i18n="(videoKind\.options\.\w+)"([^>]*)>([^<]+)<\/span>/g)]
    expect(faces).toHaveLength(VIDEO_KINDS.length)
    for (const [, key, attributes, words] of faces) {
      expect(attributes).toContain(`data-text="${words}"`)
      expect(attributes).toContain(`data-i18n-attr="data-text:${key}"`)
    }
  })

  it('starts on the default side, before any script runs', () => {
    expect(fieldset).toMatch(new RegExp(`name="video-kind" value="${DEFAULT_VIDEO_KIND}" checked`))
    expect(fieldset.match(/\schecked/g)).toHaveLength(1)
  })

  it('has a visible label, and ties the line beneath to the group', () => {
    expect(fieldset).toMatch(/<legend class="label">Video type<\/legend>/)
    // The next-video line is the group's too (VH-140), after its own.
    expect(fieldset).toContain('aria-describedby="video-kind-result video-next"')
    expect(fieldset).toContain('id="video-kind-result"')
  })

  it('sits above Step 1, outside every fieldset the job lock disables', () => {
    expect(markup.indexOf('id="video-kind"')).toBeLessThan(markup.indexOf('id="step-choose"'))
    expect(markup.indexOf('id="video-kind"')).toBeGreaterThan(markup.indexOf('class="lede"'))
    for (const id of ['branding-choice', 'preset-choice']) {
      const locked = new RegExp(`<fieldset[^>]*id="${id}"[\\s\\S]*?<\\/fieldset>`).exec(markup)?.[0] ?? ''
      expect(locked).not.toContain('name="video-kind"')
    }
  })
})

describe('the video’s language (VH-132)', () => {
  const fieldset = /<fieldset[^>]*id="video-language"[\s\S]*?<\/fieldset>/.exec(markup)?.[0] ?? ''

  it('has a visible label, and ties the line beneath to the group', () => {
    expect(fieldset).toMatch(/<legend class="label">Video language<\/legend>/)
    // The next-video line is the group's too (VH-140), after its own.
    expect(fieldset).toContain('aria-describedby="video-language-helper video-next"')
    expect(fieldset).toContain('id="video-language-helper"')
    expect(fieldset).toContain(enGB.videoLanguage.helper)
  })

  it('sits under the switch and above Step 1, outside every fieldset the job lock disables', () => {
    expect(markup.indexOf('id="video-language"')).toBeGreaterThan(markup.indexOf('id="video-kind"'))
    expect(markup.indexOf('id="video-language"')).toBeLessThan(markup.indexOf('id="step-choose"'))
    for (const id of ['branding-choice', 'preset-choice']) {
      const locked = new RegExp(`<fieldset[^>]*id="${id}"[\\s\\S]*?<\\/fieldset>`).exec(markup)?.[0] ?? ''
      expect(locked).not.toContain('id="video-language"')
    }
  })
})

describe('which video a change is for (VH-140)', () => {
  const language = /<fieldset[^>]*id="video-language"[\s\S]*?<\/fieldset>/.exec(markup)?.[0] ?? ''

  it('has one line under both switches, hidden and empty until a job runs or a result stands', () => {
    expect(language).toMatch(/<p class="helper" id="video-next" hidden><\/p>/)
    expect(markup.match(/id="video-next"/g)).toHaveLength(1)
  })

  it('names the running job beside its progress, not in a live region', () => {
    const line = /<p[^>]*id="process-job"[^>]*>/.exec(markup)?.[0] ?? ''
    expect(line).toContain('hidden')
    expect(line).not.toContain('aria-live')
    expect(markup.indexOf('id="process-job"')).toBeGreaterThan(markup.indexOf('id="process-progress"'))
    expect(markup.indexOf('id="process-job"')).toBeLessThan(markup.indexOf('id="process-result"'))
  })
})

describe('Step 3 says its rules before Create (VH-140)', () => {
  const step = /<section[^>]*id="step-title"[\s\S]*?<\/section>/.exec(markup)?.[0] ?? ''
  const submission = /<div id="submission-card-fields"[\s\S]*?<p class="helper" id="submission-card-filled">/.exec(step)?.[0] ?? ''
  const staff = /<div id="title-card-fields"[\s\S]*?<div id="submission-card-fields"/.exec(step)?.[0] ?? ''

  it('has a line under the box for the side’s rule, tied to the box, empty until painted', () => {
    expect(step).toMatch(/<p class="helper" id="title-card-rule" hidden><\/p>/)
    expect(step).toContain('aria-describedby="title-card-reason title-card-rule title-card-empty-error"')
    expect(step.indexOf('id="title-card-rule"')).toBeLessThan(step.indexOf('id="title-card-fields"'))
  })

  it('marks every one of Submission’s four fields required, and none of the staff card’s', () => {
    for (const field of ['assignment', 'module', 'convenor', 'ids']) {
      const control = new RegExp(`<(?:input|textarea)[^>]*id="submission-card-${field}"[^>]*>`).exec(submission)?.[0] ?? ''
      expect(control, field).toContain('aria-required="true"')
    }
    expect(submission.match(/aria-required="true"/g)).toHaveLength(4)
    expect(staff).not.toBe('')
    expect(staff).not.toContain('aria-required')
  })

  it('keeps every per-field error line as it was, beside its field', () => {
    for (const id of ['title', 'department', 'authors', 'date']) expect(step).toContain(`id="title-card-${id}-error"`)
    for (const id of ['assignment', 'module', 'convenor', 'ids']) expect(step).toContain(`id="submission-card-${id}-error"`)
  })
})

describe('steps that read as steps (VH-91)', () => {
  /** Each step panel, in document order: its id, its number, its heading text, whether it starts hidden. */
  const steps = [
    ...markup.matchAll(
      /<section class="panel step" id="([^"]+)" aria-labelledby="([^"]+)"(\s+hidden)?>\s*<h2 id="([^"]+)"><span class="step-number">(\d+)\.<\/span>\s*(?:<span>)?([^<]+)(?:<\/span>)?<\/h2>/g,
    ),
  ].map((match) => ({
    id: match[1]!,
    labelledBy: match[2]!,
    hidden: match[3] !== undefined,
    headingId: match[4]!,
    number: Number(match[5]),
    title: match[6]!.trim(),
  }))

  it('has the six steps, in order', () => {
    // Trim second (VH-96): see the video and choose its ends before deciding
    // how it closes and how big it is. The title card third, in the video's
    // own order (VH-127): it plays before the video, the closing after.
    expect(steps.map((step) => step.title)).toEqual([
      'Choose a video',
      'Trim',
      'Title card',
      'Closing branding',
      'File size / quality',
      'Create',
    ])
  })

  it('numbers them consecutively from 1, with no gap', () => {
    // A missing "2" reads as a fault. Trim moved every number after it
    // (VH-96); this is what makes sure they all moved.
    expect(steps.map((step) => step.number)).toEqual(steps.map((_, index) => index + 1))
  })

  it('labels each region by its own numbered heading', () => {
    for (const step of steps) expect(step.labelledBy).toBe(step.headingId)
    expect(new Set(steps.map((step) => step.headingId)).size).toBe(steps.length)
  })

  it('shows only the first step until a video has been read', () => {
    expect(steps.map((step) => step.hidden)).toEqual([false, true, true, true, true, true])
  })

  it('never reorders focus away from the visual order', () => {
    // Focus order is document order unless something overrides it, and
    // nothing may.
    expect(markup).not.toMatch(/tabindex="[1-9]/)
  })

  it('keeps everything about the job together in Create, in reading order', () => {
    const create = /<section class="panel step" id="step-create"[\s\S]*?<\/section>/.exec(markup)?.[0] ?? ''
    // The verdict and notes; what is happening now, with its stop and bar;
    // the outcome; then the action that follows it (VH-124).
    const order = [
      'preflight-report',
      'audio-warnings',
      'status',
      'stop-actions',
      'process-progress',
      'process-result',
      'save-status',
      'save-actions',
      'process-actions',
    ]
    const positions = order.map((id) => create.indexOf(`id="${id}"`))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('gives the file its own status line, in the step that is always on the page', () => {
    // Step 4's status line is inside a section that starts hidden, where a
    // live region says nothing. "Reading the video…" and "That file could not
    // be read." happen before that section exists.
    const choose = /<section class="panel step" id="step-choose"[\s\S]*?<\/section>/.exec(markup)?.[0] ?? ''
    expect(choose).toMatch(/<p class="status" id="source-status" role="status" aria-live="polite">/)
    // The heading is the input's one visible label (VH-124): no second
    // "Video file" label, and the accessible name is the heading's words.
    expect(choose).toMatch(/<input[^>]*id="file-input"[^>]*aria-labelledby="choose-heading"/)
    expect(choose).not.toMatch(/<label[^>]*for="file-input"/)
    expect(choose).not.toMatch(/id="source-status"[^>]*\shidden/)
    expect(choose).not.toContain('<details')
    expect(choose.indexOf('id="source-status"')).toBeGreaterThan(choose.indexOf('id="file-input"'))
  })
})

describe('the page frame (VH-92)', () => {
  const header = /<header[\s\S]*?<\/header>/.exec(markup)?.[0] ?? ''
  const footer = /<footer[\s\S]*?<\/footer>/.exec(markup)?.[0] ?? ''

  it('draws both bands as light on Nottingham Blue', () => {
    // `on-brand-blue` is what re-assigns the colour roles. Without it a band
    // would be blue with Nottingham Blue text on it.
    expect(header).toMatch(/class="band band--header on-brand-blue"/)
    expect(footer).toMatch(/class="band band--footer on-brand-blue"/)
  })

  it('heads the page with its name, once, in the content rather than the band', () => {
    // The band holds the logo and the page language; the title lines up with
    // the text beneath it (maintainer, 2026-09-30).
    expect(markup.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(header).not.toContain('<h1')
    expect(markup).toMatch(/<main[^>]*>\s*<h1 class="page-title">UoN Video Helper<\/h1>/)
  })

  it('puts the page language in the header band and its note above the heading (VH-154)', () => {
    const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
    expect(mainSource).toContain("required<HTMLElement>('#brand-header').append(languageSwitcher.fieldset)")
    expect(mainSource).toContain("required<HTMLHeadingElement>('.page-title').before(languageSwitcher.notice)")
    // The skip link still comes before the band, so it passes over the switcher.
    expect(markup.indexOf('class="skip-link"')).toBeLessThan(markup.indexOf('<header'))
  })

  it('puts System check and the version in the footer', () => {
    expect(footer).toContain('id="system-check"')
    expect(footer).toContain('id="version-line"')
  })

  it('ships no logo file reference in the markup', () => {
    // The logo is inserted by `brand-assets.ts` only when its file exists. A
    // hard-coded <img> would be a broken image until the maintainer adds it.
    expect(markup).not.toMatch(/<img\b/)
  })
})

describe('the trim step (VH-96)', () => {
  const trim = /<section class="panel step" id="step-trim"[\s\S]*?<\/section>/.exec(markup)?.[0] ?? ''

  it('says it is optional and that leaving it keeps the whole video', () => {
    expect(trim).toMatch(/Optional\. Cut unwanted material from the start or the end\. Left alone, the whole video\s+is kept\./)
  })

  it('never makes a handle drag-only: each end has a range input, a time field and a button', () => {
    // WCAG 2.5.7. The range inputs take the arrow keys; the field takes a
    // typed time; the button takes the preview's position.
    for (const id of ['trim-start-range', 'trim-end-range']) {
      expect(trim).toMatch(new RegExp(`<input class="range-input" type="range" id="${id}"`))
    }
    expect(trim).toMatch(/<label class="label" for="trim-start-range">Start<\/label>/)
    expect(trim).toMatch(/<label class="label" for="trim-end-range">End<\/label>/)
    expect(trim).toMatch(/<label class="label" for="trim-start">Start time<\/label>/)
    expect(trim).toMatch(/<label class="label" for="trim-end">End time<\/label>/)
    expect(trim).toMatch(/>\s*Set start here\s*</)
    expect(trim).toMatch(/>\s*Set end here\s*</)
  })

  it('ties the format, its own error and the result to each time field', () => {
    // An error beside the field it concerns (VH-124), not one shared line.
    expect(trim).toContain('aria-describedby="trim-format trim-start-error trim-result"')
    expect(trim).toContain('aria-describedby="trim-format trim-end-error trim-result"')
    expect(trim.indexOf('id="trim-start-error"')).toBeLessThan(trim.indexOf('id="trim-end"'))
  })

  it('ends on its result line, after the reset action', () => {
    expect(trim.indexOf('id="trim-clear"')).toBeLessThan(trim.indexOf('id="trim-result"'))
  })

  it('plays nothing by itself', () => {
    expect(trim).toMatch(/<video[^>]*id="trim-preview"[^>]*controls/)
    expect(trim).not.toMatch(/autoplay/)
  })
})


describe('None’s shared reason (VH-144, pinned by VH-152)', () => {
  it('describes each of the three controls None locks', () => {
    // A control that loses the id loses the reason a screen reader hears.
    for (const id of ['closing-onset', 'closing-colour', 'closing-internal']) {
      const tag = new RegExp(`<[a-z]+\\b[^>]*\\bid="${id}"[^>]*>`).exec(markup)?.[0] ?? ''
      expect(tag, id).toMatch(/aria-describedby="[^"]*\bclosing-none-reason\b/)
    }
    expect(markup).toMatch(/<p class="helper" id="closing-none-reason" hidden><\/p>/)
  })
})
