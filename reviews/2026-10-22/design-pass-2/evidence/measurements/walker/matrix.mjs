// PLAN-7: the matrix. Declares its records, reaches each scenario by setup
// (clicks and set values allowed), asserts the language, mode and state it
// reached, then runs every instrument and writes one record per scenario,
// language, view and mode. Keyboard routes are records of their own, keys
// only. A setup may set the declared faults (faults.mjs); each record names
// them. VH-171 runs the pilot; VH-172 extends SCENARIOS and PLANS.
//
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node matrix.mjs pilot          (headless Chrome on :9222, Vite on :5173)
import { writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectBrowser } from './cdp.mjs'
import { Walk, F, sleep } from './walk.mjs'
import { QUAL_INIT, IN_DIALOG, IN_DIALOG_OR_OUT, assertReached, axTree, focusArea, fileButtonInk, keysRoute, closeAnalysis, setViewport, setMode, withholdFonts } from './qualify.mjs'
import { Run, writeManifest } from './runner.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(HERE, '../../../../../..')
const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')

// ---------------------------------------------------------------------------
// Scenarios: setup, the state predicate the record must reach, and the
// controls whose rendered focus is measured in it.
const LANG_VALUE = { 'en-GB': 'en-GB', 'zh-Hans': 'zh-Hans', 'ms-MY': 'ms-MY' }
async function fresh(w, lang) {
  await w.goto()
  if (lang !== 'en-GB') await w.chooseLanguage(LANG_VALUE[lang])
}
export const SCENARIOS = {
  'S-03': {
    name: 'Empty',
    state: `!window.__qual.observed().fileChosen && !document.querySelector('dialog[open]')`,
    setup: async (w, lang) => fresh(w, lang),
    focus: [{ sel: '#file-input', ref: 'file-button' }, '#video-kind input:checked', '#feedback-open', '#language-switcher input:checked'],
  },
  'S-15': {
    name: 'Ready',
    state: `window.__qual.observed().fileChosen && !document.querySelector('#process-progress:not([hidden])') && !!document.querySelector('#process-actions button:not([hidden])')`,
    setup: async (w, lang) => { await fresh(w, lang); await w.setFiles(F('lecture-60s.mp4')); await w.waitSettled() },
    focus: ['#process-actions button:nth-child(2)', '#trim-start', { sel: '#trim-start-range', ref: 'thumb' }, { sel: '#trim-end-range', ref: 'thumb' }, '#preset-choice input:checked', '#closing-type'],
  },
  'S-76': {
    name: 'Feedback dialog, empty',
    state: `!!document.querySelector('dialog#feedback-dialog[open]')`,
    setup: async (w, lang) => { await fresh(w, lang); await w.click('#feedback-open'); await sleep(300) },
    focus: ['#feedback-message', '#feedback-close', '#feedback-copy'],
  },
}

// Keyboard routes: keys only after setup. A route is a record of its own.
// A native modal dialog in Chrome lets Tab past its last control leave the
// page for the browser's own controls (focus reads body), then come back to
// the dialog's first; it never reaches the page behind it (VH-171, settled:
// the route says where focus may go rather than failing on it).
export const ROUTES = {
  'K-dialog': {
    name: 'The dialog entered and left by keys, focus returned',
    setup: async (w, lang) => fresh(w, lang),
    steps: [
      { key: 'Tab', until: 'feedback-open', repeat: 80, note: 'Tab forward to Send feedback' },
      { key: 'Enter', state: `(() => { const d = document.querySelector('dialog[open]'); return !!d && d.contains(document.activeElement); })()`, note: 'Enter opens the dialog; focus moves inside' },
      ...Array.from({ length: 6 }, (_, i) => ({ key: 'Tab', state: IN_DIALOG_OR_OUT, note: 'Tab ' + (i + 1) + ' stays inside the dialog or leaves for the browser\'s own controls' })),
      { key: 'Tab', until: 'feedback-(?!open)', repeat: 8, state: IN_DIALOG, note: 'Tab comes back into the dialog, never to the page behind it' },
      ...Array.from({ length: 6 }, (_, i) => ({ key: 'Tab', shift: true, state: IN_DIALOG_OR_OUT, note: 'Shift+Tab ' + (i + 1) + ' stays inside or leaves for the browser' })),
      { key: 'Tab', until: 'feedback-(?!open)', repeat: 8, state: IN_DIALOG, note: 'and Tab comes back into the dialog' },
      { key: 'Escape', expect: 'feedback-open', state: `!document.querySelector('dialog[open]')`, note: 'Escape closes; focus returns to Send feedback' },
      { key: 'Tab', shift: true, expect: '.', note: 'Shift+Tab moves back from it' },
    ],
  },
}

export const PLANS = {
  pilot: () => [
    ...['S-03', 'S-15', 'S-76'].flatMap((id) => ['light', 'dark', 'forced-light'].map((mode) => ({ id, lang: 'en-GB', view: 'w1280', mode }))),
    { id: 'K-dialog', lang: 'en-GB', view: 'w1280', mode: 'light' },
  ],
  // The pilot widened (VH-171's second chat): every mode at 1280, every view
  // and enlargement record, the dialog enlarged, and a second language.
  pilot2: () => [
    ...['S-03', 'S-15', 'S-76'].flatMap((id) => ['light', 'dark', 'forced-light', 'forced-dark', 'spacing', 'reduced-motion', 'fallback', 'font32'].map((mode) => ({ id, lang: 'en-GB', view: 'w1280', mode }))),
    ...['S-03', 'S-15'].flatMap((id) => ['w375', 'w320', 'landscape', 'short', 'zoom200proxy', 'zoom400proxy'].map((view) => ({ id, lang: 'en-GB', view, mode: 'light' }))),
    ...['w320', 'zoom200proxy', 'zoom400proxy'].map((view) => ({ id: 'S-76', lang: 'en-GB', view, mode: 'light' })),
    ...['S-03', 'S-15', 'S-76'].map((id) => ({ id, lang: 'zh-Hans', view: 'w1280', mode: 'light' })),
    { id: 'K-dialog', lang: 'en-GB', view: 'w1280', mode: 'light' },
  ],
}

// ---------------------------------------------------------------------------
const aggregate = (items, { exempt = () => false } = {}) => {
  const counted = items.filter((i) => !exempt(i))
  return { outcome: counted.some((i) => i.outcome === 'fail') ? 'fail' : counted.some((i) => i.outcome === 'cannot-determine') ? 'cannot-determine' : 'pass', items: counted, exempt: items.length - counted.length }
}

async function instruments(w, sc, rec, run) {
  const out = {}
  const o = await w.evaluate('window.__audit.overflow()')
  out.overflow = { outcome: o.hscroll ? 'fail' : 'pass', scrollWidth: o.scrollWidth, clientWidth: o.clientWidth, offenders: o.offenders.slice(0, 8) }
  out.ax = await axTree(w)
  out.targets = aggregate((await w.evaluate('window.__qual.targets()')).map((t) => ({ ...t, outcome: t.disabled && t.outcome === 'fail' ? 'pass' : t.outcome })), { exempt: (t) => t.inline || t.outcome === 'inert' })
  out.contrastText = aggregate((await w.evaluate('window.__audit.contrast()')).map((c) => ({ ...c, outcome: c.ratio >= c.need ? 'pass' : 'fail' })))
  // The file button's text is read by pixels; the computed reading is kept beside it, not counted (VH-171: it read 1:1 under forced colours).
  const extra = (await w.evaluate('window.__qual.contrastExtra()')).map((c) => (c.what === 'file button text' ? { ...c, outcome: 'superseded' } : c))
  if (await w.evaluate(`!!document.querySelector('#file-input') && !!document.querySelector('#file-input').getBoundingClientRect().width`)) extra.push(await fileButtonInk(w))
  out.contrastExtra = aggregate(extra, { exempt: (c) => c.outcome === 'superseded' || c.outcome === 'inert' })
  out.measure = aggregate(await w.evaluate('window.__qual.lines()'))
  if (rec.mode === 'reduced-motion') { const m = await w.evaluate('window.__qual.motion()'); out.motion = { outcome: m.length ? 'fail' : 'pass', items: m } }
  const focus = []
  for (const spec of sc.focus ?? []) {
    const { sel, ref } = typeof spec === 'string' ? { sel: spec } : spec
    const f = await focusArea(w, sel, { ref })
    const shot = `${rec.id}__${rec.view}__${rec.mode}__focus-${focus.length}`
    if (f.on) { writeFileSync(join(run.dir, shot + '-on.png'), f.on); writeFileSync(join(run.dir, shot + '-off.png'), f.off) }
    delete f.on; delete f.off
    focus.push({ ...f, clip: f.outcome === 'cannot-determine' && !f.controlPx ? undefined : shot })
  }
  await w.evaluate(`(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); window.scrollTo(0, 0); })()`)
  out.focus = aggregate(focus)
  return out
}

async function openWalk(browser, name) {
  const w = new Walk(browser, name)
  await w.open()
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
  return w
}

async function main() {
  const planName = process.argv[2] ?? 'pilot'
  const declared = PLANS[planName]()
  const run = Run.create(RUN_ROOT, planName, declared)
  const browser = await connectBrowser()
  console.log(`run ${run.runId}: ${declared.length} records declared, ${browser.version.Browser}`)
  // Group by scenario, language, view and fonts: one setup, then each mode.
  const groups = new Map()
  for (const r of declared) { const k = [r.id, r.lang, r.view, r.mode === 'fallback'].join('|'); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r) }
  for (const recs of groups.values()) {
    const { id, lang, view } = recs[0]
    const route = ROUTES[id]
    const sc = SCENARIOS[id]
    const w = await openWalk(browser, `${run.name}-${id}-${lang}-${view}`)
    try {
      await setViewport(w, view)
      await withholdFonts(w, recs[0].mode === 'fallback')
      await (route ?? sc).setup(w, lang)
      for (const rec of recs) {
        try {
          if (route) {
            await setMode(w, rec.mode)
            const k = await keysRoute(w, route.steps)
            const reached = await assertReached(w, { lang, mode: rec.mode, width: w.qualView ? undefined : undefined })
            run.record(rec, { status: reached.outcome === 'pass' ? 'ok' : 'failed', reached, faults: w.faults ?? [], instruments: { keys: k } })
          } else {
            await setMode(w, rec.mode)
            const reached = await assertReached(w, { lang, mode: rec.mode, state: sc.state })
            if (reached.outcome !== 'pass') { run.record(rec, { status: 'failed', reached }); continue }
            const ins = await instruments(w, sc, rec, run)
            await w.screenshot(`${rec.id}__${rec.lang}__${rec.view}__${rec.mode}`)
            run.record(rec, { status: 'ok', reached, faults: w.faults ?? [], instruments: ins })
          }
          console.log('recorded ' + Object.values(rec).join(' '))
        } catch (e) {
          run.record(rec, { status: 'failed', error: String(e.stack ?? e).slice(0, 400) })
        }
      }
    } catch (e) {
      for (const rec of recs) run.record(rec, { status: 'failed', error: 'setup: ' + String(e.message ?? e).slice(0, 300) })
    } finally {
      await w.close()
    }
  }
  await closeAnalysis()
  const fixtures = [F('lecture-60s.mp4')]
  const m = writeManifest(run, {
    appRoot: APP_ROOT,
    browserVersion: browser.version.Browser,
    fixtures,
    scaling: 'Emulation.setDeviceMetricsOverride per view; Page.setFontSizes for the default font; Chrome page zoom not settable over the protocol (proxy views only)',
    unresolved: ['Chrome page zoom at 200% and 400% itself (proxy views stand in; on the person list)', 'what a screen reader says (exposure only)', 'native select popups and the video player\'s inner controls by keys'],
  })
  browser.close()
  console.log(JSON.stringify(m.coverage, null, 1))
  console.log('run dir: ' + run.dir)
  process.exit(m.coverage.whole ? 0 : 1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); process.exit(1) })
