// PLAN-7: the matrix. Declares its records, reaches each scenario by setup
// (clicks and set values allowed), asserts the language, mode and state it
// reached, then runs every instrument and writes one record per scenario,
// language, view and mode. Keyboard routes are records of their own, keys
// only. A setup may set the declared faults (faults.mjs); each record names
// them. VH-171 runs the pilot; VH-172 extends SCENARIOS and PLANS.
//
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node matrix.mjs pilot          (headless Chrome on :9222, Vite on :5173)
//   VH-172: the scenarios, routes and plans live in scenarios.mjs; plans
//   `smoke` and `matrix`; ids after the plan name keep only those records.
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep } from './walk.mjs'
import { QUAL_INIT, VIEWS, assertReached, axTree, focusArea, fileButtonInk, keysRoute, closeAnalysis, setViewport, setMode, withholdFonts, pageShot } from './qualify.mjs'
import { Run, writeManifest, writeDigest, aggregate, recordKey } from './runner.mjs'
import { SCENARIOS, ROUTES, PLANS, MX_INIT, GAPS } from './scenarios.mjs'
export { SCENARIOS, ROUTES, PLANS }

const HERE = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = process.env.APP_ROOT ?? resolve(HERE, '../../../../../..')
const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')

// ---------------------------------------------------------------------------
// What each record must carry (Codex astra's method check, M-01): a route
// its keys; a scenario every instrument, motion too under reduced motion;
// and the view it must reach, width, height and scale. The runner fails a
// record without them. Whatever SCENARIOS, ROUTES and PLANS hold, these
// apply; a declared record may name its own `requires` and `viewport`.
const SCENARIO_INSTRUMENTS = ['overflow', 'ax', 'targets', 'contrastText', 'contrastExtra', 'measure', 'focus']
export const requiredFor = (r) => (ROUTES[r.id] ? ['keys'] : [...SCENARIO_INSTRUMENTS, ...(r.mode === 'reduced-motion' ? ['motion'] : [])])
const viewportFor = (view) => { const v = VIEWS[view]; return v ? { w: v.width, h: v.height, dpr: v.deviceScaleFactor } : undefined }
// A record's variant (a subcase of a compound scenario) merges over its scenario.
const scenarioFor = (r) => { const sc = SCENARIOS[r.id]; return sc && r.variant && sc.variants?.[r.variant] ? { ...sc, ...sc.variants[r.variant] } : sc }
const slug = (s) => String(s).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

// The DOM change log since the last record on this page, persisted; the AX
// tree too where the instruments did not (M-05: exposure, not speech).
async function persistExposure(w, run, key, { ax = false } = {}) {
  let m = await w.evaluate(`window.__qual.mutations(${w.mutFrom ?? 0})`)
  if (m.to < (w.mutFrom ?? 0)) m = await w.evaluate('window.__qual.mutations(0)') // the page was reloaded
  w.mutFrom = m.to
  const out = { label: 'exposure, not speech', mutations: { ...run.artifact(`${key}__mutations.json`, JSON.stringify(m)), entries: m.entries.length } }
  if (ax) { const a = await axTree(w); out.ax = { ...run.artifact(`${key}__ax.json`, JSON.stringify(a.nodes)), live: a.live } }
  return out
}

async function instruments(w, sc, rec, run) {
  const key = recordKey(rec)
  const out = {}
  // Document width, offenders, text clipped by an ancestor and text spilling from a set height (M-04).
  out.overflow = await w.evaluate('window.__qual.overflow()')
  const ax = await axTree(w)
  const nodes = run.artifact(`${key}__ax.json`, JSON.stringify(ax.nodes))
  delete ax.nodes
  out.ax = { ...ax, nodes }
  // Exempt rows stay with their reason (M-01): inert, the justified inline exception, a disabled control.
  out.targets = aggregate(await w.evaluate('window.__qual.targets()'), { exempt: (t) => t.inline || (t.disabled && t.outcome !== 'pass' ? 'disabled: not operable while disabled; kept for VH-173' : false) })
  out.contrastText = aggregate(await w.evaluate('window.__qual.contrastText()'))
  // The file button's text is read by its glyph pixels; the computed reading is kept beside it, superseded (VH-171: it read 1:1 under forced colours).
  const extra = (await w.evaluate('window.__qual.contrastExtra()')).map((c) => (c.what === 'file button text' ? { ...c, outcome: 'superseded', why: 'computed reading, superseded by the glyph-pixel reading' } : c))
  if (await w.evaluate(`!!document.querySelector('#file-input') && !!document.querySelector('#file-input').getBoundingClientRect().width`)) extra.push(await fileButtonInk(w))
  out.contrastExtra = aggregate(extra)
  out.measure = aggregate(await w.evaluate('window.__qual.lines()'))
  // Motion is watched while the focus measurements drive the page (M-05).
  const watching = rec.mode === 'reduced-motion'
  const t0 = Date.now()
  if (watching) await w.evaluate('window.__qual.motionStart()')
  const focus = []
  for (const spec of sc.focus ?? []) {
    const { sel, ref } = typeof spec === 'string' ? { sel: spec } : spec
    const f = await focusArea(w, sel, { ref })
    const name = `${key}__focus-${focus.length}-${slug(sel)}`
    const clips = f.on ? [run.artifact(name + '-off.png', f.off), run.artifact(name + '-on.png', f.on)] : undefined
    delete f.on; delete f.off
    focus.push({ ...f, clips })
  }
  await w.evaluate(`(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); window.scrollTo(0, 0); })()`)
  out.focus = aggregate(focus, sc.focus === undefined ? { why: 'the scenario declares no focus targets' } : { empty: 'not-applicable', why: 'the scenario declares an empty focus list' })
  if (watching) {
    await sleep(400)
    const rows = await w.evaluate('window.__qual.motionStop()')
    const watchedMs = Date.now() - t0
    rows.push({ el: 'the page', what: 'watch', watchedMs, outcome: rows.some((r) => r.outcome === 'fail') ? 'fail' : 'pass', why: `document.getAnimations() sampled every 40 ms for ${watchedMs} ms while the focus measurements ran` })
    out.motion = aggregate(rows)
  }
  return out
}

async function openWalk(browser, name, run) {
  const w = new Walk(browser, name)
  await w.open()
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
  // Every fixture a setup chooses is hashed in the manifest (M-08).
  if (run) for (const m of ['setFiles', 'drag']) { const real = w[m].bind(w); w[m] = async (file, ...rest) => { run.useFixture(file); return real(file, ...rest) } }
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
  return w
}

async function main() {
  const planName = process.argv[2] ?? 'pilot'
  if (!PLANS[planName]) throw new Error('no plan ' + planName)
  const only = process.argv.slice(3)
  const declared = PLANS[planName]().filter((r) => !only.length || only.includes(r.id)).map((r) => ({ ...r, requires: r.requires ?? requiredFor(r), viewport: r.viewport ?? viewportFor(r.view) }))
  const run = Run.create(RUN_ROOT, planName + (only.length ? '-part' : ''), declared)
  const started = Date.now()
  const browser = await connectBrowser()
  console.log(`run ${run.runId}: ${declared.length} records declared, ${browser.version.Browser}`)
  // Group by scenario, variant, language, view and fonts: one setup, then each mode.
  const groups = new Map()
  for (const r of declared) { const k = [r.id, r.variant ?? '', r.lang, r.view, r.mode === 'fallback'].join('|'); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r) }
  for (const recs of groups.values()) {
    const { id, lang, view, variant } = recs[0]
    const route = ROUTES[id]
    const sc = scenarioFor(recs[0])
    // The walk's own log lives under the run's unique id, never a shared folder (M-08).
    const w = await openWalk(browser, `${run.name}-${run.runId}/${slug([id, variant, lang, view, recs[0].mode === 'fallback' ? 'fallback' : ''].filter(Boolean).join('-'))}`, run)
    try {
      if (!route && !sc) throw new Error('no scenario or route ' + id)
      await setViewport(w, view)
      await withholdFonts(w, recs[0].mode === 'fallback')
      await (route ?? sc).setup(w, lang)
      for (const rec of recs) {
        const key = recordKey(rec)
        try {
          await setMode(w, rec.mode)
          if (route) {
            const k = await keysRoute(w, route.steps)
            const reached = await assertReached(w, { lang, mode: rec.mode, viewport: rec.viewport })
            const exposure = await persistExposure(w, run, key, { ax: true })
            run.record(rec, { status: reached.outcome === 'pass' ? 'ok' : 'failed', reached, faults: w.faults ?? [], instruments: { keys: k }, exposure })
          } else {
            const reached = await assertReached(w, { lang, mode: rec.mode, state: sc.state, viewport: rec.viewport })
            if (reached.outcome !== 'pass') { run.record(rec, { status: 'failed', reached }); console.log('not reached ' + key + ': ' + reached.problems.join('; ').slice(0, 200)); continue }
            const ins = await instruments(w, sc, rec, run)
            // The state asserted again after the instruments: a record whose state expired fails (M-01);
            // a scenario may name what must still hold (VH-172's `hold`, default its state).
            const reachedAfter = await assertReached(w, { lang, mode: rec.mode, state: sc.hold ?? sc.state, viewport: rec.viewport })
            const page = run.artifact(`${key}__page.png`, await pageShot(w))
            const exposure = await persistExposure(w, run, key)
            const expired = reachedAfter.outcome !== 'pass'
            if (expired) console.log('state lost ' + key)
            run.record(rec, { status: expired ? 'failed' : 'ok', stateExpired: expired || undefined, reached, reachedAfter, faults: w.faults ?? [], instruments: ins, page, exposure })
          }
          console.log('recorded ' + key)
        } catch (e) {
          run.record(rec, { status: 'failed', error: String(e.stack ?? e).slice(0, 400) })
        }
      }
    } catch (e) {
      for (const rec of recs) run.record(rec, { status: 'failed', error: 'setup: ' + String(e.message ?? e).slice(0, 300) })
      console.log('setup failed ' + [id, lang, view].join(' ') + ': ' + String(e.message ?? e).slice(0, 200))
    } finally {
      await w.close()
    }
  }
  await closeAnalysis()
  const keysOf = (pred) => declared.filter(pred).map(recordKey)
  const m = writeManifest(run, {
    appRoot: APP_ROOT,
    browserVersion: browser.version.Browser,
    scaling: 'Emulation.setDeviceMetricsOverride per view; Page.setFontSizes for the default font; Chrome page zoom not settable over the protocol (proxy views only)',
    // Four enlargement categories, kept apart (M-04).
    enlargement: {
      reflow: { what: 'a CSS viewport 320 px wide (and the 375 px phone)', views: ['w320', 'w375'], records: keysOf((r) => ['w320', 'w375'].includes(r.view)).length },
      proxy: { what: "the CSS viewport and device pixel ratio Chrome's 200% and 400% page zoom give a 1280 x 900 window", views: ['zoom200proxy', 'zoom400proxy'], records: keysOf((r) => /zoom\d+proxy/.test(r.view)).length, realZoom: 'unresolved: Chrome page zoom cannot be set over the protocol; on the person list' },
      defaultFont32: { what: "the browser's default-font preference at 32 px (Page.setFontSizes)", mode: 'font32', records: keysOf((r) => r.mode === 'font32').length },
      syntheticTextOnly: { status: 'not run', what: 'text-only enlargement by an injected style: not implemented, so unqualified' },
    },
    unresolved: [
      "Chrome page zoom at 200% and 400% itself (proxy views stand in; on the person list)",
      'what a screen reader says (exposure only: the AX tree and the DOM change log are persisted per record)',
      "native select popups and the video player's inner controls by keys",
      'transient states: asserted before and after the instruments, not captured mid-transition',
      "a dialog's entry, use and exit at enlargement: overflow and clipping are measured there; the keys route runs at 1280 only",
      'a range thumb and track: non-text contrast by pixels (cannot determine in contrastExtra)',
      'synthetic text-only enlargement: not run',
      'off-page elements (the skip link before focus): target and contrast read when shown, by the person',
      ...GAPS,
    ],
  })
  writeDigest(run, { title: `${planName} — record by record`, intro: `Run \`${run.name}-${run.runId}\`. ${m.coverage.expected} declared, ${m.coverage.observed} observed, ${m.coverage.whole ? 'whole' : 'not whole'}. c-d is "cannot determine"; n/a "not applicable".` })
  browser.close()
  console.log(JSON.stringify({ expected: m.coverage.expected, observed: m.coverage.observed, whole: m.coverage.whole, problems: m.coverage.problems, failing: m.measurements.failing }, null, 1))
  console.log('run dir: ' + run.dir)
  console.log(`took ${Math.round((Date.now() - started) / 1000)} s`)
  process.exit(m.coverage.whole ? 0 : 1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); process.exit(1) })
