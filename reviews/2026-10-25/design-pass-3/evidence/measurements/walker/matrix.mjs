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
//   `smoke`, `matrix`, `priority` and its parts `priority-1` to `-4`; ids
//   after the plan name keep only those records.
//   VH-198: the third pass's parts `part1`, `part2`, `part3`, `part3b`,
//   `part4` and their runs `run-01` to `run-12` (parts.mjs), each checked
//   against sizing-2026-10-25.mjs before it starts or resumes.
//     node matrix.mjs --resume <run dir>   resumes a run in place: records
//   already ok are kept and skipped, failed ones moved to superseded/ and
//   measured again, so an interrupted part never restarts.
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectBrowser } from './cdp.mjs'
import { Walk, F, sleep } from './walk.mjs'
import { QUAL_INIT, VIEWS, assertReached, axTree, focusArea, fileButtonInk, keysRoute, closeAnalysis, setViewport, setMode, withholdFonts, pageShot, pressedVsHover, typeRoles } from './qualify.mjs'
import { Run, writeManifest, writeDigest, aggregate, recordKey, browserCommandLine } from './runner.mjs'
import { SCENARIOS, ROUTES, PLANS, MX_INIT, GAPS, READINGS } from './scenarios.mjs'
import { P8_INIT, PHASE8_INSTRUMENTS, PLAYER_KEY_ROWS, FORMAT_TIP_ROWS, phase8Instruments, watchWorkers, assertRows } from './phase8.mjs'
// VH-198: the third pass's five parts and twelve runs, by name (parts.mjs).
import { assertParts, partOf, runOf } from './parts.mjs'
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
// VH-172 adds `type` (the eight roles, VH-166) to every scenario, and `pressed` (VH-169) where a record names controls to press.
// VH-198 adds Phase 8's six (phase8.mjs): the player, the format "?", the footer's
// headings, the limiting warning, Video language, and the scenario's own assertions.
const SCENARIO_INSTRUMENTS = ['overflow', 'ax', 'targets', 'contrastText', 'contrastExtra', 'measure', 'type', 'focus', ...PHASE8_INSTRUMENTS]
// Codex astra's method check, M-04: a scenario may promise what follows its state (a save
// completing after a failed player, a dialog entered, used and left at enlargement, a
// read failure's focus). It declares `subresults` (`when` names the records it holds
// for); they run once the state is measured and kept, and are required in the record.
export const requiredFor = (r) => (ROUTES[r.id] ? ['keys'] : [...SCENARIO_INSTRUMENTS, ...(r.mode === 'reduced-motion' ? ['motion'] : []), ...(r.pressed ? ['pressed'] : []), ...(hasSubresults(r) ? ['subresults'] : [])])
const viewportFor = (view) => { const v = VIEWS[view]; return v ? { w: v.width, h: v.height, dpr: v.deviceScaleFactor } : undefined }
// A record's variant (a subcase of a compound scenario) merges over its scenario.
const scenarioFor = (r) => { const sc = SCENARIOS[r.id]; return sc && r.variant && sc.variants?.[r.variant] ? { ...sc, ...sc.variants[r.variant] } : sc }
export const hasSubresults = (r) => { const s = scenarioFor(r)?.subresults; return !!s && (!s.when || !!s.when(r)) }
// Codex astra's re-check (26 October), M-01: what each record must hold, from its own
// declaration, so a subject dropped from a real record fails the run (runner.mjs `verify`):
// a route's steps; a scenario's focus targets, the controls it presses, its own assertions and
// its subresults' assertions; and the Phase 8 rows it opts into (the player by keys, the format "?").
export function expectsFor(r) {
  const route = ROUTES[r.id]
  if (route) return { keys: { steps: route.steps.length } }
  const sc = scenarioFor(r)
  if (!sc) return undefined
  const out = {}
  const sels = (sc.focus ?? []).map((f) => (typeof f === 'string' ? f : f.sel))
  if (sels.length) out.focus = { subjects: sels }
  if (r.pressed?.length) out.pressed = { subjects: r.pressed }
  if (sc.asserts?.length) out.asserts = { subjects: sc.asserts.map((a) => a.what) }
  if (hasSubresults(r) && sc.subresults.asserts?.length) out.subresults = { subjects: sc.subresults.asserts.map((a) => a.what) }
  const p8 = new Set(sc.p8 ?? [])
  if (p8.has('playerKeys')) out.player = { subjects: PLAYER_KEY_ROWS }
  if (p8.has('formatTip')) out.formatTip = { subjects: FORMAT_TIP_ROWS }
  return out
}
/** A plan's record as a run declares it: what it requires, the view it must reach, and what it must hold. */
export const declareRecord = (r) => ({ ...r, requires: r.requires ?? requiredFor(r), viewport: r.viewport ?? viewportFor(r.view), expects: r.expects ?? expectsFor(r) })
// The fixtures a run's declared records name (each scenario's or route's `fixtures`), pinned by hash when the run is created (M-03).
const declaredFixtures = (declared) => [...new Set(declared.flatMap((r) => (ROUTES[r.id] ?? scenarioFor(r))?.fixtures ?? []))].map((f) => (f.startsWith('/') ? f : F(f)))
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
  out.type = aggregate(await typeRoles(w, { spacing: rec.mode === 'spacing' }))
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
  // VH-169: each named control pressed by mouse against its hover, and by a held Space with focus; the shots kept.
  if (rec.pressed) {
    const rows = []
    for (const sel of rec.pressed) {
      const p = await pressedVsHover(w, sel)
      const name = `${key}__pressed-${rows.length}-${slug(sel)}`
      const shots = p.shots ? Object.fromEntries(Object.entries(p.shots).map(([k, b]) => [k, run.artifact(`${name}-${k}.png`, b).path])) : undefined
      delete p.shots
      rows.push({ ...p, shots })
    }
    await w.evaluate(`(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); window.scrollTo(0, 0); })()`)
    out.pressed = aggregate(rows)
  }
  // VH-198: Phase 8's instruments, after the others, so their keys and clicks
  // never move what those measured; each puts back what it changed.
  Object.assign(out, await phase8Instruments(w, sc, { run, recKey: key, aggregate }))
  return out
}

/** M-04: a scenario's subresults, after its record's state is measured: the steps, then their assertions as rows, the page kept. */
async function subresultsOf(w, sc, rec, run) {
  const s = sc.subresults
  try {
    await s.run(w, rec)
    const out = aggregate(await assertRows(w, { asserts: s.asserts }))
    return { what: s.what, ...out, page: run.artifact(`${recordKey(rec)}__subresults.png`, await pageShot(w)) }
  } catch (e) {
    return { what: s.what, outcome: 'cannot-determine', why: 'the subresults did not run: ' + String(e.message ?? e).slice(0, 240), rows: 0, counted: 0, exempt: 0, items: [] }
  }
}

async function openWalk(browser, name, run) {
  const w = new Walk(browser, name)
  await w.open()
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
  // Every fixture a setup chooses is hashed in the manifest (M-08).
  if (run) for (const m of ['setFiles', 'drag']) { const real = w[m].bind(w); w[m] = async (file, ...rest) => { run.useFixture(file); return real(file, ...rest) } }
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
  // VH-198: the job's events on the wall clock, and the worker's "chain planned" (the limiter's bite).
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: P8_INIT })
  await watchWorkers(browser, w)
  return w
}

async function main() {
  const resuming = process.argv[2] === '--resume'
  let run, declared, planName, skip = new Set()
  if (resuming) {
    run = new Run(process.argv[3])
    declared = run.declared
    planName = run.name
    // A part or run resumed only while its declaration stands (the walker unchanged in what it declares).
    if (partOf(planName) || runOf(planName)) {
      await assertParts()
      const now = PLANS[planName]().map(recordKey).sort().join('\n')
      if (now !== declared.map(recordKey).sort().join('\n')) throw new Error(`${planName} now declares other records than this run did: rerun it whole`)
    }
    // M-03: refused unless the source, the instrument revision and every fixture are what the run pinned.
    skip = run.resume({ appRoot: APP_ROOT })
  } else {
    planName = process.argv[2] ?? 'pilot'
    if (!PLANS[planName]) throw new Error('no plan ' + planName)
    // A part or a run of one, held to the sizing script and the plan before it starts.
    if (partOf(planName) || runOf(planName)) { const c = await assertParts(); console.log(`parts as declared: ${c.total} records in ${c.runs.length} runs (the script's ${c.scriptTotal}, less ${c.sourceOnly.length} source-only); split ${c.runsSha}`) }
    const only = process.argv.slice(3)
    declared = PLANS[planName]().filter((r) => !only.length || only.includes(r.id)).map(declareRecord)
    run = Run.create(RUN_ROOT, planName + (only.length ? '-part' : ''), declared, { appRoot: APP_ROOT, fixtures: declaredFixtures(declared) })
  }
  const started = Date.now()
  const browser = await connectBrowser()
  console.log(`run ${run.runId}: ${declared.length} records declared${resuming ? `, ${skip.size} kept from before (attempt ${run.attempt})` : ''}, ${browser.version.Browser}`)
  // Group by scenario, variant, language, view and fonts: one setup, then each mode.
  // A record with subresults changes its page after it is measured, so it has a setup of its own (M-04).
  const groups = new Map()
  for (const r of declared.filter((d) => !skip.has(recordKey(d)))) { const k = [r.id, r.variant ?? '', r.lang, r.view, r.mode === 'fallback', hasSubresults(r) ? r.mode : ''].join('|'); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r) }
  for (const recs of groups.values()) {
    const { id, lang, view, variant } = recs[0]
    const route = ROUTES[id]
    const sc = scenarioFor(recs[0])
    // VH-198: each record's time, its group's setup apart, for the estimate's calibration.
    const t0 = Date.now()
    let setupMs
    // The walk's own log lives under the run's unique id, never a shared folder (M-08).
    const w = await openWalk(browser, `${run.name}-${run.runId}/${slug([id, variant, lang, view, recs[0].mode === 'fallback' ? 'fallback' : ''].filter(Boolean).join('-'))}`, run)
    try {
      if (!route && !sc) throw new Error('no scenario or route ' + id)
      await setViewport(w, view)
      await withholdFonts(w, recs[0].mode === 'fallback')
      await (route ?? sc).setup(w, lang)
      setupMs = Date.now() - t0
      for (const rec of recs) {
        const key = recordKey(rec)
        const r0 = Date.now()
        const timing = () => ({ setupMs, recordMs: Date.now() - r0, firstOfGroup: rec === recs[0] })
        try {
          await setMode(w, rec.mode)
          if (sc?.afterMode) await sc.afterMode(w)
          if (route) {
            const k = await keysRoute(w, route.steps)
            const reached = await assertReached(w, { lang, mode: rec.mode, viewport: rec.viewport })
            const exposure = await persistExposure(w, run, key, { ax: true })
            run.record(rec, { timing: timing(), status: reached.outcome === 'pass' ? 'ok' : 'failed', reached, faults: w.faults ?? [], instruments: { keys: k }, exposure })
          } else {
            const reached = await assertReached(w, { lang, mode: rec.mode, state: sc.state, viewport: rec.viewport })
            if (reached.outcome !== 'pass') { run.record(rec, { timing: timing(), status: 'failed', reached }); console.log('not reached ' + key + ': ' + reached.problems.join('; ').slice(0, 200)); continue }
            const ins = await instruments(w, sc, rec, run)
            // The state asserted again after the instruments: a record whose state expired fails (M-01);
            // a scenario may name what must still hold (VH-172's `hold`, default its state).
            const reachedAfter = await assertReached(w, { lang, mode: rec.mode, state: sc.hold ?? sc.state, viewport: rec.viewport })
            const readings = await w.evaluate(READINGS).catch((e) => ({ error: String(e.message ?? e).slice(0, 120) }))
            const page = run.artifact(`${key}__page.png`, await pageShot(w))
            const exposure = await persistExposure(w, run, key)
            const expired = reachedAfter.outcome !== 'pass'
            // M-04: what the scenario promises after its state, once the state is measured and kept, as its own instrument.
            if (!expired && hasSubresults(rec)) ins.subresults = await subresultsOf(w, sc, rec, run)
            if (expired) console.log('state lost ' + key)
            run.record(rec, { timing: timing(), status: expired ? 'failed' : 'ok', stateExpired: expired || undefined, reached, reachedAfter, faults: w.faults ?? [], instruments: ins, readings, page, exposure })
          }
          console.log('recorded ' + key)
        } catch (e) {
          run.record(rec, { timing: timing(), status: 'failed', error: String(e.stack ?? e).slice(0, 400) })
        }
      }
    } catch (e) {
      for (const rec of recs) run.record(rec, { timing: { setupMs: Date.now() - t0, failedInSetup: true }, status: 'failed', error: 'setup: ' + String(e.message ?? e).slice(0, 300) })
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
    browserCommandLine: await browserCommandLine(browser),
    scaling: 'Emulation.setDeviceMetricsOverride per view; Page.setFontSizes for the default font; Chrome page zoom not settable over the protocol (proxy views only)',
    // Four enlargement categories, kept apart (M-04).
    enlargement: {
      reflow: { what: 'a CSS viewport 320 px wide (and the 375 px phone)', views: ['w320', 'w375'], records: keysOf((r) => ['w320', 'w375'].includes(r.view)).length },
      proxy: { what: "the CSS viewport and device pixel ratio Chrome's 200% and 400% page zoom give a 1280 x 900 window", views: ['zoom200proxy', 'zoom400proxy'], records: keysOf((r) => /zoom\d+proxy/.test(r.view)).length, realZoom: 'unresolved: Chrome page zoom cannot be set over the protocol; on the person list' },
      defaultFont32: { what: "the browser's default-font preference at 32 px (Page.setFontSizes)", mode: 'font32', records: keysOf((r) => r.mode === 'font32').length },
      // M-04: a representative dialog operated, not only measured, at enlargement.
      dialogOperated: { what: "Report a problem's dialog (S-76) entered by Enter on its opener, used (the message typed, every control reached by Tab inside the window and uncovered, the email handed off) and left by Escape and by Close, focus back on the opener, by keys, at 320 px, both proxies and the 32 px font (the record's subresults)", records: keysOf((r) => r.id === 'S-76' && hasSubresults(r)).length },
      syntheticTextOnly: { status: 'not run', what: 'text-only enlargement by an injected style: not implemented, so unqualified' },
    },
    unresolved: [
      "Chrome page zoom at 200% and 400% itself (proxy views stand in; on the person list)",
      'what a screen reader says (exposure only: the AX tree and the DOM change log are persisted per record)',
      "native select popups by keys; the video player's inner controls are walked by the focused accessibility node (P-06) and held to the inventory by identity both ways (S-127 fails a control it does not reach; a native step of K-player's that misses is cannot determine); the volume slider, empty at rest, is measured once disclosed by hovering the control beside it, its target by hit test; each ring is read on a held frame three ways apart (M-02), and stays cannot determine for 2.4.7 where no author style can isolate it (the overflow button's -internal- pseudo-element) or where only a focus-only change other than a ring is left (the user agent's hover-and-focus highlight), for 2.4.13 short of its area where neither exception is established (the host's backdrop is the author's), and for 4.1.2 whether a change is notified (not observed)",
      'transient states: asserted before and after the instruments, not captured mid-transition',
      "the read failure's exception path (src/main.ts:1495–1500, the inspection request itself failing): S-149's subresults reach the failed reply (main.ts:1481–1486) with notvideo.mp4; no fault makes the request throw",
      "a dialog's entry, use and exit at enlargement: operated by keys for Report a problem's dialog (S-76's subresults) at 320 px, both proxies and the 32 px font; the K-dialog route itself runs at 1280 and 320 px only, and the other dialog states are measured there for overflow and clipping",
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
