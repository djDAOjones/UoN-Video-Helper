// Codex astra's method check (25 October), M-04: the subresults the matrix
// now records, proved to detect on the app, each with a failing case and its
// passing twin, the mutated pages in the browser only:
//   - Report a problem's dialog operated at enlargement (S-76's subresults)
//     at the 400 % proxy: the dialog clipping its own overflow (nothing
//     scrolls a focused control into the window) fails; focus not returned to
//     the opener on closing fails; the app as it is passes; and at the 32 px
//     font, the app as it is passes;
//   - Save after a failed player (S-132's subresults): a save that is refused
//     (F4e revised, armed in place) fails; the save as it is passes;
//   - the read-failure branch (S-149's subresults, V-46 and VH-178): with
//     notvideo.mp4 the branch is reached (its row passes, and where focus went
//     is recorded, pass or fail: a finding, not the instrument's); with a
//     readable replacement it is not, and both rows are "cannot determine",
//     never a pass.
//
//   FIX=<fixtures> PROVE_DIR=<scratch> APP_URL=http://localhost:5182/ CDP_PORT=9252 \
//     node prove-m04.mjs [case …]          (headless Chrome, a Vite dev server)
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk } from './walk.mjs'
import { QUAL_INIT, setViewport, setMode, assertReached } from './qualify.mjs'
import { SCENARIOS, MX_INIT, readFailureBranch } from './scenarios.mjs'
import { P8_INIT, watchWorkers, assertRows } from './phase8.mjs'
import { applyFault } from './faults.mjs'
import { aggregate } from './runner.mjs'

const DIR = process.env.PROVE_DIR
if (!DIR) throw new Error('set PROVE_DIR to a scratch directory')
mkdirSync(DIR, { recursive: true })
const only = process.argv.slice(2)
const browser = await connectBrowser()
const results = []
const rowsOf = (sub, w) => assertRows(w, { asserts: sub.asserts })

/** One case: the scenario reached in its view and mode, `mutate` applied, then its subresults (or `run`), judged against `wanted`. */
async function one(name, { id, lang = 'en-GB', view = 'w1280', mode = 'light', mutate, run, judge, wanted }) {
  if (only.length && !only.includes(name)) return
  const sc = SCENARIOS[id]
  const w = new Walk(browser, 'prove-m04-' + name)
  await w.open()
  for (const source of [QUAL_INIT, MX_INIT, P8_INIT]) await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source })
  await watchWorkers(browser, w)
  const t0 = Date.now()
  try {
    await setViewport(w, view)
    await setMode(w, mode)
    await sc.setup(w, lang)
    const reached = await assertReached(w, { lang, mode, state: sc.state })
    if (reached.outcome !== 'pass') throw new Error('the scenario\'s state not reached: ' + reached.problems.join('; '))
    if (mutate) await mutate(w)
    if (run) await run(w); else await sc.subresults.run(w, { id, lang, view, mode })
    const rows = await rowsOf(sc.subresults, w)
    const agg = aggregate(rows)
    const { outcome, proved } = judge ? judge(agg, rows) : { outcome: agg.outcome, proved: agg.outcome === wanted }
    results.push({ case: name, scenario: id, view, mode, wanted, outcome, proved, rows: rows.map((r) => ({ what: r.what, outcome: r.outcome, ...(r.why ? { why: r.why } : {}), ...(r.missing ? { missing: r.missing } : {}), ...(r.notSeen ? { notSeen: r.notSeen.map((f) => `${f.el} ${JSON.stringify(f.box)} shows ${f.shows} covered ${f.covered}`) } : {}), ...(r.focus ? { focus: r.focus } : {}), ...(r.onOpener !== undefined ? { onOpener: r.onOpener } : {}) })), seconds: Math.round((Date.now() - t0) / 1000) })
  } catch (e) {
    results.push({ case: name, scenario: id, view, mode, wanted, outcome: 'error', proved: false, why: String(e.message ?? e).slice(0, 300) })
  } finally {
    await w.close()
  }
  const r = results.at(-1)
  console.log(`${r.proved ? 'PROVED' : 'NOT PROVED'}  ${name}: ${r.outcome} (wanted ${wanted})${r.why ? ' ' + r.why : ''}`)
}

// The dialog at the 400 % proxy (320 x 225 CSS px), and at the 32 px font.
const CLIP = `(() => { const s = document.createElement('style'); s.id = 'prove-m04-clip'; s.textContent = '#feedback-dialog { max-height: 100vh !important; overflow: clip !important; }'; document.head.append(s); })()`
const LOSE_FOCUS = `(() => { document.getElementById('feedback-dialog').addEventListener('close', () => setTimeout(() => { const a = document.activeElement; if (a && a.blur) a.blur(); }, 0)); })()`
const dialogRow = (rows, start) => rows.find((r) => r.what.startsWith(start))?.outcome
await one('dialog-enlarged-clipped-bad', { id: 'S-76', view: 'zoom400proxy', mutate: (w) => w.evaluate(CLIP), wanted: 'fail', judge: (a, rows) => ({ outcome: a.outcome, proved: a.outcome === 'fail' && dialogRow(rows, 'use: Tab reaches') === 'fail' }) })
await one('dialog-enlarged-focus-lost-bad', { id: 'S-76', view: 'zoom400proxy', mutate: (w) => w.evaluate(LOSE_FOCUS), wanted: 'fail', judge: (a, rows) => ({ outcome: a.outcome, proved: a.outcome === 'fail' && dialogRow(rows, 'exit by Escape') === 'fail' && dialogRow(rows, 'exit by Close') === 'fail' && dialogRow(rows, 'use: Tab reaches') === 'pass' }) })
await one('dialog-enlarged-good', { id: 'S-76', view: 'zoom400proxy', wanted: 'pass' })
await one('dialog-font32-good', { id: 'S-76', mode: 'font32', wanted: 'pass' })

// Save after the failed player: refused in place (F4e revised), then as it is.
await one('save-after-failed-player-refused-bad', { id: 'S-132', mutate: (w) => applyFault(w, 'F4e', { inPlace: true }), wanted: 'fail', judge: (a, rows) => ({ outcome: a.outcome, proved: a.outcome === 'fail' && rows[0].outcome === 'pass' && rows[1].outcome === 'fail' }) })
await one('save-after-failed-player-good', { id: 'S-132', wanted: 'pass' })

// The read-failure branch: reached with notvideo.mp4; not reached with a readable replacement.
await one('read-failure-branch-reached', { id: 'S-149', wanted: 'branch row pass; focus row pass or fail (recorded)', judge: (a, rows) => ({ outcome: `branch ${rows[0].outcome}, focus ${rows[1].outcome}`, proved: rows[0].outcome === 'pass' && ['pass', 'fail'].includes(rows[1].outcome) }) })
await one('read-failure-branch-readable-twin', { id: 'S-149', run: (w) => readFailureBranch(w, 'short-2s.mp4'), wanted: 'cannot-determine (both rows)', judge: (a, rows) => ({ outcome: `branch ${rows[0].outcome}, focus ${rows[1].outcome}`, proved: rows[0].outcome === 'cannot-determine' && rows[1].outcome === 'cannot-determine' && a.outcome !== 'pass' }) })

browser.close()
writeFileSync(join(DIR, 'prove-m04.json'), JSON.stringify(results, null, 1))
console.log(`${results.filter((r) => r.proved).length} of ${results.length} proved`)
process.exit(results.every((r) => r.proved) ? 0 : 1)
