// VH-198 (P-05, P-06): Phase 8's instruments proved to catch their own
// failures before they are trusted, as prove.mjs proved Phase 7's. Each check
// runs the instrument's own code (phase8.mjs, scenarios.mjs MX_INIT) on a
// failing case and its passing twin: a fixture page written to the scratch
// directory, or the app's page with its DOM mutated in the browser. Nothing
// is written to src/.
//
//   the player's two checks, apart: a host with no name, and a control out
//     of reach, each with a passing twin, and each fixture read by both;
//   composed wording pinned with its substituted names (a mutation back to
//     the old output name must fail, where M.matches passed it);
//   heading levels from the accessibility tree (a wrong-level mutation);
//   the warning assertion scoped to the completion's interval (said only in
//     an earlier job's must fail, where the whole history passed it);
//   the warning judged by the bite; the format "?" by keys and its edge;
//   Video language's place and the next-video line; a saved card's player.
//
//   PROVE_DIR=<scratch>/prove FIX=<fixtures> APP_URL=http://localhost:5181/ \
//     CDP_PORT=9231 node prove-8.mjs          (headless Chrome, a Vite dev server)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep } from './walk.mjs'
import { QUAL_INIT, closeAnalysis } from './qualify.mjs'
import { MX_INIT } from './scenarios.mjs'
import { P8_INIT, playerRows, playerKeys, footerRows, limitingRows, videoLanguageRows, formatTip } from './phase8.mjs'

const DIR = process.env.PROVE_DIR
const FIX = process.env.FIX
if (!DIR || !FIX) throw new Error('set PROVE_DIR and FIX')
mkdirSync(DIR, { recursive: true })

const page = (body, style = '', words = {}) => `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>fixture</title><style>body{font:16px/1.5 sans-serif;background:#fff;color:#161616;margin:24px}${style}</style><script>window.__p8words = ${JSON.stringify(words)}</script></head><body><main>${body}</main></body></html>`
const VIDEO = `file://${join(FIX, 'short-2s.mp4')}`
const CARD_WORDS = { 'result.lifetime': 'It is not saved yet. It stays here until you start another video or close this tab.', 'status.saved': 'Saved. Open the saved file to check it.' }
const card = ({ labelled = true, reach = true, saved = false } = {}) => `<button id="before" type="button">Before the card</button><div id="process-result"><section class="notification" data-kind="success" tabindex="-1"><p class="notification-title" id="t">Finished video — 1.1 MB</p><p>Made from short-2s.mp4: the whole video (2 seconds), high quality, a cut to the blue closing card.</p>
  <video class="result-player" controls preload="metadata" src="${VIDEO}" style="width:640px" ${labelled ? 'aria-labelledby="t"' : ''} ${reach ? '' : 'tabindex="-1"'}></video>
  <p>${saved ? '' : CARD_WORDS['result.lifetime']}</p><div class="actions"><button class="button" type="button">Save the video</button></div></section></div>
  <p id="save-status">${saved ? CARD_WORDS['status.saved'] : ''}</p>`
// The finished card's warnings and the status line, driven through two jobs by P8_INIT's own observer.
const WARN_WORDS = { ...CARD_WORDS, 'warnings.heavyLimiting.heading': 'The loudest moments were held down hard', 'warnings.heavyLimiting.detail': 'To reach the usual level, the tool had to hold down the loudest moments.', 'warnings.metadataLost.heading': 'The file’s title, author, and date could not be copied across' }
const WARN_PAGE = page(`<progress id="process-progress" hidden></progress><p id="status" role="status"></p><div id="process-result"></div>`, '', WARN_WORDS)
const TIP_GOOD_SCRIPT = `const b = document.getElementById('format-help-button'), t = document.getElementById('format-help'); const set = (o) => { t.hidden = !o; b.setAttribute('aria-expanded', String(o)); };
  b.addEventListener('click', () => set(t.hidden)); document.addEventListener('focusin', (e) => { if (!b.contains(e.target) && !t.contains(e.target)) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !t.hidden) { set(false); if (!document.activeElement || document.activeElement === document.body || t.contains(document.activeElement) || document.activeElement === b) b.focus(); } });
  document.addEventListener('click', (e) => { if (!b.contains(e.target) && !t.contains(e.target)) set(false); });`
const TIP_PAGE = ({ closesOnFocus = true, rail = false } = {}) => page(`<h1 class="page-title">Fixture</h1><button id="first" type="button">First</button><ul class="lede-list"><li class="promise-with-help"><span>Saves in a reliable format.</span>
  <button id="format-help-button" type="button" aria-label="About the video format" aria-expanded="false" aria-controls="format-help" style="min-width:44px;min-height:44px">?</button>
  <div aria-live="polite"><div id="format-help" hidden style="border:1px solid var(--border-subtle);${rail ? 'border-left:4px solid #0f62fe;' : ''}padding:8px"><p>Videos come in many formats.</p></div></div></li></ul><button id="after" type="button">After</button>
  <script>${closesOnFocus ? TIP_GOOD_SCRIPT : TIP_GOOD_SCRIPT.replace(/document\.addEventListener\('focusin'[^;]*;\s*\}\);/, '')}</script>`, ':root{--border-subtle:#8d8d8d}', { 'lede.formatHelp.label': 'About the video format', 'lede.formatHelp.text': 'Videos come in many formats.' })

const browser = await connectBrowser()
const results = []
const prove = (instrument, fixture, outcome, wanted, detail) => { const proved = outcome === wanted; results.push({ instrument, fixture, outcome, wanted, proved, detail }); console.log(`${proved ? 'PROVED' : 'NOT PROVED'}  ${instrument} on ${fixture}: ${outcome} (wanted ${wanted})`) }
const rowOf = (rows, what) => rows.find((r) => r.what.startsWith(what)) ?? { outcome: 'missing', what }
async function open(name, { app = false, html } = {}) {
  const w = new Walk(browser, 'prove8-' + name)
  await w.open()
  w.browser = browser
  for (const source of app ? [QUAL_INIT, MX_INIT, P8_INIT] : [QUAL_INIT, P8_INIT]) await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source })
  if (app) await w.goto()
  else { const f = join(DIR, name + '.html'); writeFileSync(f, html); const loaded = w.page.once('Page.loadEventFired'); await w.page.send('Page.navigate', { url: 'file://' + f }); await loaded; await sleep(400) }
  return w
}
const tryOne = async (name, fn) => { try { await fn() } catch (e) { results.push({ instrument: name, fixture: 'error', outcome: 'error', wanted: '-', proved: false, detail: String(e.stack ?? e).slice(0, 300) }); console.log('ERROR ' + name + ': ' + e) } }

// 1. The player's two checks, qualified apart, each with its passing twin.
await tryOne('player', async () => {
  for (const [fixture, opts] of [['player-noname-bad', { labelled: false }], ['player-noname-good', { labelled: true }], ['player-reach-bad', { reach: false }], ['player-reach-good', { reach: true }]]) {
    const w = await open(fixture, { html: page(card(opts), '', CARD_WORDS) })
    try {
      await w.evaluate(`(async () => { const v = document.querySelector('video.result-player'); for (let i = 0; i < 80 && v.readyState < 2 && !v.error; i++) await new Promise((r) => setTimeout(r, 100)); })()`)
      const passive = await playerRows(w)
      const keys = await playerKeys(w)
      const name = rowOf(passive, "host named by the card's title"), reach = rowOf(keys, 'route forward reaches every control')
      const which = fixture.startsWith('player-noname') ? name : reach
      const other = fixture.startsWith('player-noname') ? reach : name
      prove(fixture.startsWith('player-noname') ? 'player: host with no name' : 'player: control out of reach', fixture, which.outcome, fixture.endsWith('-bad') ? 'fail' : 'pass', { row: which, otherCheck: { what: other.what, outcome: other.outcome } })
      // Apart: the other check is unmoved by this fixture's fault.
      prove(fixture.startsWith('player-noname') ? 'player: the reach check, on the name fixture' : 'player: the name check, on the reach fixture', fixture, other.outcome, 'pass', { row: other })
    } finally { await w.close() }
  }
})
// 1b. A saved card keeps no player; an unsaved one one.
await tryOne('player saved', async () => {
  for (const [fixture, saved, wanted] of [['player-saved-bad', true, 'fail'], ['player-unsaved-good', false, 'pass']]) {
    const w = await open(fixture, { html: page(card({ saved }), '', CARD_WORDS) })
    try { const rows = await playerRows(w); const r = rows[0]; prove('player: present while unsaved, gone once saved', fixture, r.outcome, wanted, r) } finally { await w.close() }
  }
})

// 2. Composed wording pinned with its substituted names, on the app's own tables.
await tryOne('composed wording', async () => {
  const w = await open('composed', { app: true })
  try {
    await w.waitFor(`!!(window.__mx && window.__mx.msg('status.storageWayOut'))`, { label: 'tables', timeout: 20000 })
    const said = await w.evaluate(`window.__mx.compose('status.storageWayOut', { smaller: { msg: 'preset.inSentence.smaller' } })`)
    for (const [fixture, text, wanted] of [['composed-old-name-bad', said?.replace('the smaller file', 'Smaller / reduced'), 'fail'], ['composed-new-name-good', said, 'pass']]) {
      await w.evaluate(`(() => { let p = document.getElementById('p8-proof'); if (!p) { p = document.createElement('p'); p.id = 'p8-proof'; document.body.append(p); } p.textContent = ${JSON.stringify(text)}; })()`)
      const says = await w.evaluate(`window.__mx.says('status.storageWayOut', { smaller: { msg: 'preset.inSentence.smaller' } }, '#p8-proof')`)
      const matches = await w.evaluate(`window.__mx.matches(document.getElementById('p8-proof').textContent, 'status.storageWayOut')`)
      prove('composed wording (M.says)', fixture, says ? 'pass' : 'fail', wanted, { text, phase7Matches: matches })
    }
  } finally { await w.close() }
})

// 3. Heading levels from the tree: the app's footer, then a wrong-level mutation.
await tryOne('footer', async () => {
  const w = await open('footer', { app: true })
  try {
    await w.waitFor(`!!(window.__mx && window.__mx.msg('footer.heading'))`, { label: 'tables', timeout: 20000 })
    const good = await footerRows(w)
    const bad1 = good.filter((r) => r.outcome !== 'pass' && r.outcome !== 'not-applicable')
    prove('footer headings (AX levels)', 'footer-app-good', bad1.length ? 'fail' : 'pass', 'pass', { failing: bad1 })
    await w.evaluate(`(() => { const h = document.querySelector('.footer-help h2'); h.setAttribute('role', 'heading'); h.setAttribute('aria-level', '3'); })()`)
    await sleep(200)
    const bad = await footerRows(w)
    prove('footer headings (AX levels)', 'footer-h2-at-level-3-bad', rowOf(bad, 'one h2').outcome === 'fail' && rowOf(bad, 'order and levels').outcome === 'fail' ? 'fail' : 'pass', 'fail', { oneH2: rowOf(bad, 'one h2'), order: rowOf(bad, 'order and levels') })
    // The tag alone would still read h2: the level is the tree's.
    const tag = await w.evaluate(`document.querySelector('.footer-help h2').tagName`)
    results.at(-1).detail.tagStill = tag
    await w.evaluate(`(() => { const h = document.querySelector('.footer-help h2'); h.removeAttribute('role'); h.removeAttribute('aria-level'); const b = document.getElementById('feedback-open').closest('p'); document.querySelector('.footer-help h3:last-of-type').after(b); })()`)
    await sleep(200)
    const moved = await footerRows(w)
    prove('footer: Report a problem in its group', 'footer-button-moved-bad', rowOf(moved, 'Report a problem in its group').outcome, 'fail', rowOf(moved, 'Report a problem in its group'))
  } finally { await w.close() }
})

// 4. The warning judged by the bite, and the spoken line scoped to the completion's interval.
async function drive(w, jobs) {
  // Each job: start (progress shown), what the status line says, then the finished card with its warnings.
  for (const j of jobs) {
    await w.evaluate(`(() => { document.getElementById('process-result').replaceChildren(); document.getElementById('process-progress').hidden = false; })()`); await sleep(120)
    await w.evaluate(`document.getElementById('status').textContent = ${JSON.stringify(j.status)}`); await sleep(60)
    await w.evaluate(`(() => { document.getElementById('process-progress').hidden = true; const r = document.getElementById('process-result'); r.innerHTML = '<section class="notification" data-kind="success"><p class="notification-title">Finished video — 1 MB</p></section>' + ${JSON.stringify(j.warnings ? `<div><section class="notification" data-kind="warning"><ul>${j.warnings.map((x) => `<li><strong>${x}</strong> ${x === WARN_WORDS['warnings.heavyLimiting.heading'] ? WARN_WORDS['warnings.heavyLimiting.detail'] : ''}</li>`).join('')}</ul></section></div>` : '')}; })()`); await sleep(150)
  }
}
await tryOne('limiting', async () => {
  const H = WARN_WORDS['warnings.heavyLimiting.heading'], MLOST = WARN_WORDS['warnings.metadataLost.heading']
  const cases = [
    ['warning-said-in-an-earlier-job-bad', 'first in the line spoken', 'fail', [{ status: `Your video is ready. ${H}.`, warnings: [H] }, { status: 'Your video is ready.', warnings: [H] }], 20.1],
    ['warning-said-at-this-completion-good', 'first in the line spoken', 'pass', [{ status: 'Your video is ready.' }, { status: `Your video is ready. ${H}. ${MLOST}.`, warnings: [H, MLOST] }], 20.1],
    ['warning-not-first-bad', "first among the card's warnings", 'fail', [{ status: `Your video is ready. ${MLOST}. ${H}.`, warnings: [MLOST, H] }], 20.1],
    ['warning-below-threshold-bad', 'present above the threshold', 'fail', [{ status: `Your video is ready. ${H}.`, warnings: [H] }], 0.5],
    ['warning-above-threshold-good', 'present above the threshold', 'pass', [{ status: `Your video is ready. ${H}.`, warnings: [H] }], 20.1],
    ['no-warning-below-threshold-good', 'present above the threshold', 'pass', [{ status: 'Your video is ready.' }], 0.0],
    ['no-warning-above-threshold-bad', 'present above the threshold', 'fail', [{ status: 'Your video is ready.' }], 20.1],
  ]
  for (const [fixture, what, wanted, jobs, bite] of cases) {
    const w = await open(fixture, { html: WARN_PAGE })
    try {
      await drive(w, jobs)
      const ev = await w.evaluate('window.__p8.events')
      const fin = ev.filter((e) => e.kind === 'finish').at(-1), start = ev.filter((e) => e.kind === 'start').at(-1)
      w.p8planned = { workers: 1, planned: [{ t: Math.round((start.t + fin.t) / 2), limiterBiteLu: bite }] }
      const rows = await limitingRows(w)
      const r = rowOf(rows, what)
      const wholeHistory = (await w.evaluate('window.__p8.status')).some((s) => s.text.includes(H))
      prove('limiting warning: ' + what, fixture, r.outcome, wanted, { row: r, wholeHistoryWouldSay: wholeHistory })
    } finally { await w.close() }
  }
})

// 5. The format "?": closing by focus, and its edge.
await tryOne('format tip', async () => {
  for (const [fixture, opts, what, wanted] of [['tip-stays-open-on-tab-bad', { closesOnFocus: false }, 'Tab closes it', 'fail'], ['tip-closes-on-tab-good', {}, 'Tab closes it', 'pass'], ['tip-rail-bad', { rail: true }, 'edge', 'fail'], ['tip-edge-good', {}, 'edge', 'pass']]) {
    const w = await open(fixture, { html: TIP_PAGE(opts) })
    try { const rows = await formatTip(w); const r = rowOf(rows, what); prove('format "?": ' + what, fixture, r.outcome, wanted, r) } finally { await w.close() }
  }
})

// 6. Video language's place and the next-video line, on the app with a video read, then mutated.
await tryOne('video language', async () => {
  const w = await open('video-language', { app: true })
  try {
    await w.setFiles(join(FIX, 'short-2s.mp4')); await w.waitSettled()
    await w.waitFor(`!document.getElementById('step-title').hidden`, { label: 'step 3', timeout: 60000 })
    const good = await videoLanguageRows(w)
    prove('Video language: place', 'video-language-app-good', rowOf(good, 'at the top of step 3').outcome, 'pass', rowOf(good, 'at the top of step 3'))
    prove('Video language: the next-video line', 'video-next-app-good', rowOf(good, 'the next-video line').outcome, 'pass', rowOf(good, 'the next-video line'))
    await w.evaluate(`document.getElementById('title-card-choice').append(document.getElementById('video-language'))`)
    prove('Video language: place', 'video-language-inside-the-card-choice-bad', rowOf(await videoLanguageRows(w), 'at the top of step 3').outcome, 'fail')
    await w.evaluate(`document.getElementById('title-card-choice').before(document.getElementById('video-language')); document.getElementById('video-kind').after(document.getElementById('video-next'))`)
    prove('Video language: the next-video line', 'video-next-outside-video-type-bad', rowOf(await videoLanguageRows(w), 'the next-video line').outcome, 'fail')
    await w.evaluate(`document.getElementById('video-language').disabled = true`)
    prove('Video language: locked only while made, saved or stopping', 'video-language-locked-when-idle-bad', rowOf(await videoLanguageRows(w), 'locked while').outcome, 'fail')
  } finally { await w.close() }
})

await closeAnalysis()
browser.close()
writeFileSync(join(DIR, 'prove-8.json'), JSON.stringify(results, null, 1))
console.log(`${results.filter((r) => r.proved).length} of ${results.length} proved`)
process.exit(results.every((r) => r.proved) ? 0 : 1)
