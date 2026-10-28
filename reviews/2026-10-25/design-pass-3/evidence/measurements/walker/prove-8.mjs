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
//   Codex astra's method check of 25 October, M-01 and M-02, each gap with a
//   failing case and its twin: the completion's own write holding every
//   warning title in order (an early announcement in the same job, a missing
//   metadata title); the bite's evidence (no plan log in the job, an
//   unreadable log, a planned job whose log was unseen, against a logged
//   null bite and an established no-plan job); the footer's measure by
//   counted characters; the player's 2.4.7 by the ring alone (an author
//   outline:none on the controls), 2.4.13's two exceptions apart, author
//   content over a control (2.4.11/2.4.12), the exposed state around
//   play/pause and seek (4.1.2), Shift+Tab's stops by identity, and targets
//   by geometry at rest and disclosed and by hit area.
//
//   PROVE_DIR=<scratch>/prove FIX=<fixtures> APP_URL=http://localhost:5181/ \
//     CDP_PORT=9231 node prove-8.mjs          (headless Chrome, a Vite dev server)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, analyse, DIFF } from './qualify.mjs'
import { MX_INIT } from './scenarios.mjs'
import { P8_INIT, playerRows, playerKeys, footerRows, limitingRows, videoLanguageRows, formatTip, exposedChange, compareStops, targetVerdict, appearanceVerdict, visibleVerdict, RING_INDICATOR } from './phase8.mjs'

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
// The heavy detail is the whole en-GB string (src/i18n/en-GB.ts, heavyLimiting), three sentences, so W2's "whole" is proved on it (VH-208).
const WARN_WORDS = { ...CARD_WORDS, 'status.ready': 'Your video is ready.', 'warnings.heavyLimiting.heading': 'The loudest moments were held down hard', 'warnings.heavyLimiting.detail': 'To reach the usual level, the tool had to hold down the loudest moments of this recording hard. That can make a voice sound flat or squashed, so play the new video before you save it. Next time, try adjusting how you record the sound.', 'warnings.metadataLost.heading': 'The file’s title, author, and date could not be copied across' }
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
async function drive(w, jobs, layout = 'beside') {
  // Each job: start (progress shown), what the status line says, then the finished card with its warnings:
  // beside the card, as drawn until VH-208, or (`layout: 'inside'`, VH-208's W1) inside it, after its title.
  const block = (ws) => ws.map((x) => `<li><strong>${x}</strong> ${x === WARN_WORDS['warnings.heavyLimiting.heading'] ? WARN_WORDS['warnings.heavyLimiting.detail'] : ''}</li>`).join('')
  for (const j of jobs) {
    await w.evaluate(`(() => { document.getElementById('process-result').replaceChildren(); document.getElementById('process-progress').hidden = false; })()`); await sleep(120)
    // A job's status writes, in order: a text, or { text, wait } (M-01, 25 October: an earlier write in the same job).
    // The last is the completion's own write, made in one task with the card, as the app makes it (src/main.ts,
    // the job's .then); `completionWrite: false` draws the card with no write (Codex astra's re-check, 26 October).
    const writes = [].concat(j.status).map((st) => (typeof st === 'string' ? { text: st } : st))
    const last = j.completionWrite === false ? null : writes.pop()
    for (const s of writes) { await w.evaluate(`document.getElementById('status').textContent = ${JSON.stringify(s.text)}`); await sleep(s.wait ?? 60) }
    await w.evaluate(`(() => { ${last ? `document.getElementById('status').textContent = ${JSON.stringify(last.text)};` : ''} document.getElementById('process-progress').hidden = true; const r = document.getElementById('process-result'); r.innerHTML = ${JSON.stringify(layout === 'inside'
      ? `<section class="notification" data-kind="success"><p class="notification-title">Finished video — 1 MB</p>${j.warnings ? `<div><ul class="notification-list">${block(j.warnings)}</ul></div>` : '<div></div>'}<p class="notification-body">${CARD_WORDS['result.lifetime']}</p></section>`
      : `<section class="notification" data-kind="success"><p class="notification-title">Finished video — 1 MB</p></section>${j.warnings ? `<div><section class="notification" data-kind="warning"><ul>${block(j.warnings)}</ul></section></div>` : ''}`)}; })()`); await sleep(150)
  }
}
await tryOne('limiting', async () => {
  const H = WARN_WORDS['warnings.heavyLimiting.heading'], MLOST = WARN_WORDS['warnings.metadataLost.heading'], D = WARN_WORDS['warnings.heavyLimiting.detail']
  const DETAIL = "the heavy warning's detail whole after its title"
  const cases = [
    ['warning-said-in-an-earlier-job-bad', 'first in the line spoken', 'fail', [{ status: `Your video is ready. ${H}.`, warnings: [H] }, { status: 'Your video is ready.', warnings: [H] }], 20.1],
    // VH-208, W3: the completion's write carries the heavy warning's detail whole after its title (both rows
    // pass), and the same write with the heading only, which passed here until VH-208, must fail for that reason.
    ['warning-said-at-this-completion-good', ['first in the line spoken', DETAIL], 'pass', [{ status: 'Your video is ready.' }, { status: `Your video is ready. ${H}. ${MLOST}. ${D}`, warnings: [H, MLOST] }], 20.1],
    ['warning-heading-only-bad', DETAIL, 'fail', [{ status: 'Your video is ready.' }, { status: `Your video is ready. ${H}. ${MLOST}.`, warnings: [H, MLOST] }], 20.1, /^heading only/],
    ['warning-not-first-bad', "first among the card's warnings", 'fail', [{ status: `Your video is ready. ${MLOST}. ${H}.`, warnings: [MLOST, H] }], 20.1],
    ['warning-below-threshold-bad', 'present above the threshold', 'fail', [{ status: `Your video is ready. ${H}.`, warnings: [H] }], 0.5],
    ['warning-above-threshold-good', 'present above the threshold', 'pass', [{ status: `Your video is ready. ${H}.`, warnings: [H] }], 20.1],
    ['no-warning-below-threshold-good', 'present above the threshold', 'pass', [{ status: 'Your video is ready.' }], 0.0],
    ['no-warning-above-threshold-bad', 'present above the threshold', 'fail', [{ status: 'Your video is ready.' }], 20.1],
  ]
  // VH-208, W1: every case drawn in both layouts, the warnings beside the card and inside it.
  for (const layout of ['beside', 'inside']) for (const [fixture, what, wanted, jobs, bite, why] of cases) {
    const name = layout === 'inside' ? fixture + '-inside' : fixture
    const w = await open(name, { html: WARN_PAGE })
    try {
      await drive(w, jobs, layout)
      const ev = await w.evaluate('window.__p8.events')
      const fin = ev.filter((e) => e.kind === 'finish').at(-1), start = ev.filter((e) => e.kind === 'start').at(-1)
      w.p8planned = { workers: 1, planned: [{ t: Math.round((start.t + fin.t) / 2), limiterBiteLu: bite }] }
      const rows = await limitingRows(w)
      const rs = [].concat(what).map((x) => rowOf(rows, x))
      const off = rs.find((x) => x.outcome !== 'pass')
      const outcome = (off ? off.outcome : 'pass') + (why && !why.test(off?.why ?? '') ? ' (another reason)' : '')
      const wholeHistory = (await w.evaluate('window.__p8.status')).some((s) => s.text.includes(H))
      const extra = why ? { titlesRowWouldPass: rowOf(rows, 'first in the line spoken').outcome === 'pass' } : {}
      prove('limiting warning: ' + [].concat(what).join(' + ') + (layout === 'inside' ? ' (inside the card)' : ''), name, outcome, wanted, { row: rs.length === 1 ? rs[0] : rs, layout, box: await w.evaluate('(() => { const b = window.__p8.warnBox(); return b ? b.tagName + (b.className ? "." + b.className : "") + (b.closest(\'#process-result > .notification[data-kind="success"]\') ? " in the card" : " beside the card") : null })()'), wholeHistoryWouldSay: wholeHistory, ...extra })
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

// ---------------------------------------------------------------------------
// Codex astra's method check (25 October), M-01 and M-02: each gap it found,
// a failing case beside a passing twin, each failing for the reason the
// instrument names (its row's `why`), and where the replaced reading would
// have passed the failing case, that reading kept in the detail.
const proveWhy = (instrument, fixture, r, wanted, why, detail = {}) => {
  const outcome = r.outcome === wanted && (!why || why.test(r.why ?? '')) ? r.outcome : `${r.outcome}${why && !why.test(r.why ?? '') ? ' (another reason)' : ''}`
  prove(instrument, fixture, outcome, wanted, { row: r, ...detail })
}
// M-01: the line spoken at completion is the completion's own write, holding every title in order.
await tryOne('limiting, the completion\'s write', async () => {
  const H = WARN_WORDS['warnings.heavyLimiting.heading'], MLOST = WARN_WORDS['warnings.metadataLost.heading']
  const cases = [
    ['heavy-said-early-in-this-job-warning-free-completion-bad', 'fail', /missing from the completion's line/, [{ status: [{ text: `Your video is ready. ${H}. ${MLOST}.`, wait: 400 }, { text: 'Your video is ready.' }], warnings: [H, MLOST] }]],
    ['metadata-title-missing-from-the-completion-bad', 'fail', /missing from the completion's line: The file’s title/, [{ status: `Your video is ready. ${H}.`, warnings: [H, MLOST] }]],
    ['early-heavy-warning-free-completion-metadata-missing-bad', 'fail', /missing from the completion's line/, [{ status: [{ text: `Your video is ready. ${H}.`, wait: 400 }, { text: 'Your video is ready.' }], warnings: [H, MLOST] }]],
    ['every-title-in-the-completion-in-order-good', 'pass', null, [{ status: [{ text: `Your video is ready. ${H}.`, wait: 400 }, { text: `Your video is ready. ${H}. ${MLOST}.` }], warnings: [H, MLOST] }]],
    // Codex astra's re-check (26 October): every title written 500 ms before the card, and no write with the card.
    ['every-title-500-ms-early-no-completion-write-bad', 'fail', /no write to the status line in the mutation that drew the finished card/, [{ status: [{ text: `Your video is ready. ${H}. ${MLOST}.`, wait: 500 }], completionWrite: false, warnings: [H, MLOST] }]],
    ['completion-write-without-the-ready-sentence-bad', 'fail', /does not open with the page's "status.ready"/, [{ status: [{ text: 'Checking the video.', wait: 500 }, { text: `${H}. ${MLOST}.` }], warnings: [H, MLOST] }]],
    ['every-title-in-the-completion-write-500-ms-after-another-good', 'pass', null, [{ status: [{ text: 'Checking the video.', wait: 500 }, { text: `Your video is ready. ${H}. ${MLOST}.` }], warnings: [H, MLOST] }]],
  ]
  for (const [fixture, wanted, why, jobs] of cases) {
    const w = await open(fixture, { html: WARN_PAGE })
    try {
      await drive(w, jobs)
      const ev = await w.evaluate('window.__p8.events')
      const fin = ev.filter((e) => e.kind === 'finish').at(-1), start = ev.filter((e) => e.kind === 'start').at(-1)
      w.p8planned = { workers: 1, planned: [{ t: Math.round((start.t + fin.t) / 2), limiterBiteLu: 20.1 }], completed: [] }
      const r = rowOf(await limitingRows(w), 'first in the line spoken')
      // The reading this replaces: any status text since the job's start holding the heavy title, the metadata title checked only if said.
      const texts = (await w.evaluate('window.__p8.status')).filter((s) => s.t > start.t && s.t <= fin.t + 4000).map((s) => s.text)
      const old = texts.find((t) => t.includes(H)); const oldPass = !!old && (!old.includes(MLOST) || old.indexOf(H) < old.indexOf(MLOST))
      // The reading the re-check replaced: the last write within 1 s at or before the finish, else the first within 1 s after.
      const writes = (await w.evaluate('window.__p8.writes')).filter((s) => s.t > start.t && s.t <= fin.t + 1000)
      const win = writes.filter((s) => s.t <= fin.t && s.t >= fin.t - 1000).at(-1) ?? writes.find((s) => s.t > fin.t)
      const winPass = !!win && win.text.includes(H) && win.text.includes(MLOST) && win.text.indexOf(H) < win.text.indexOf(MLOST)
      proveWhy('limiting warning: the completion\'s own write, every title in order', fixture, r, wanted, why, { replacedReadingWouldPass: oldPass, windowReadingWouldPass: winPass })
    } finally { await w.close() }
  }
})
// M-01: a logged null bite and an established no-plan job, apart from missing or unreadable evidence.
await tryOne('limiting, the bite\'s evidence', async () => {
  const cases = [
    ['no-plan-log-in-this-job-bad', 'cannot-determine', /missing, not null/, (j) => ({ workers: 1, planned: [{ t: j[0].mid, limiterBiteLu: 0 }], completed: [] })],
    ['unreadable-plan-log-bad', 'cannot-determine', /could not be read/, (j) => ({ workers: 1, planned: [{ t: j.at(-1).mid, unread: true }], completed: [] })],
    ['planned-job-plan-log-unseen-bad', 'cannot-determine', /was not seen/, (j) => ({ workers: 1, planned: [], completed: [{ t: j.at(-1).mid, audioGainDb: -3.2 }] })],
    ['logged-null-bite-good', 'pass', null, (j) => ({ workers: 1, planned: [{ t: j.at(-1).mid, limiterBiteLu: null }], completed: [] })],
    ['no-plan-job-established-good', 'pass', null, (j) => ({ workers: 1, planned: [], completed: [{ t: j.at(-1).mid, audioGainDb: null }] })],
  ]
  for (const [fixture, wanted, why, seen] of cases) {
    const w = await open(fixture, { html: WARN_PAGE })
    try {
      await drive(w, [{ status: 'Your video is ready.' }, { status: 'Your video is ready.' }])
      const ev = await w.evaluate('window.__p8.events')
      const starts = ev.filter((e) => e.kind === 'start'), fins = ev.filter((e) => e.kind === 'finish')
      const jobs = starts.map((s, i) => ({ mid: Math.round((s.t + fins[i].t) / 2) }))
      w.p8planned = seen(jobs)
      const r = rowOf(await limitingRows(w), 'present above the threshold')
      // The reading this replaces: an attached worker with no plan in the job read as a null bite; an unreadable plan as null.
      proveWhy('limiting warning: the bite\'s evidence', fixture, r, wanted, why, { replacedReadingWouldPass: true })
    } finally { await w.close() }
  }
})
// M-01: the footer's measure by counted rendered characters (qualify.mjs's reader), not width over an average.
const FOOTER_WORDS = { 'footer.heading': 'Help', 'footer.groups.help': 'Help with videos', 'footer.contact.creators': 'Creators', 'footer.contact.selfService': 'Self Service', 'footer.groups.problem': 'Problem', 'feedback.open': 'Report a problem', 'footer.groups.opinion': 'Opinion', 'footer.feedbackForm': 'Feedback form' }
const FOOTER_PAGE = (h2) => page(`<footer><div class="footer-help"><h2 style="white-space:nowrap">${h2}</h2><h3>Help with videos</h3><p><a href="#c">Creators</a> <a href="#s">Self Service</a></p><h3>Problem</h3><p><button id="feedback-open" type="button">Report a problem</button></p><h3>Opinion</h3><p><a href="#f">Feedback form</a></p></div></footer>`, '', FOOTER_WORDS)
await tryOne('footer measure', async () => {
  for (const [fixture, text, wanted, why] of [['footer-heading-81-narrow-characters-bad', Array(41).fill('l').join(' '), 'fail', null], ['footer-heading-79-wide-characters-good', 'W'.repeat(79), 'pass', null]]) {
    const w = await open(fixture, { html: FOOTER_PAGE(text) })
    try {
      const r = rowOf(await footerRows(w), 'measure')
      // The estimate this replaces: the widest rect over the average width of a Latin pangram.
      const old = await w.evaluate(`(() => { const h = document.querySelector('.footer-help h2'); const range = document.createRange(); range.selectNodeContents(h); const widest = Math.max(0, ...[...range.getClientRects()].map((q) => q.width)); const probe = document.createElement('span'); probe.textContent = 'the quick brown fox jumps over the lazy dog 0123456789'; probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; h.append(probe); const avg = probe.getBoundingClientRect().width / probe.textContent.length; probe.remove(); return Math.round(widest / avg) })()`)
      proveWhy('footer: each heading\'s line by counted characters', fixture, r, wanted, why, { counted: r.worst?.chars ?? r.longest, replacedEstimate: old, replacedReadingWouldPass: old <= 80 })
    } finally { await w.close() }
  }
})

// M-02: the player's focus, targets, traversal and exposed state.
const STYLEABLE = ['play-button', 'mute-button', 'fullscreen-button', 'timeline', 'volume-slider']
const PS = '#process-result video.result-player::-webkit-media-controls-'
const playerPage = (style = '', extra = '') => page(card() + extra, style, CARD_WORDS)
const playerFixture = async (name, style, extra, fn) => {
  const w = await open(name, { html: playerPage(style, extra) })
  try { await w.evaluate(`(async () => { const v = document.querySelector('video.result-player'); for (let i = 0; i < 80 && v.readyState < 2 && !v.error; i++) await new Promise((r) => setTimeout(r, 100)); })()`); return await fn(w) } finally { await w.close() }
}
const inner = (r) => r.control && !/^Video /.test(r.control)
await tryOne('player focus', async () => {
  // 2.4.7: an author outline:none on the controls Chrome lets an author style, the highlight and disclosure redraw kept; its twin, the native page.
  const suppress = STYLEABLE.map((p) => `${PS}${p} { outline: none !important; }`).join('')
  const native = await playerFixture('player-native', '', '', async (w) => ({ keys: await playerKeys(w), passive: await playerRows(w) }))
  const suppressed = await playerFixture('player-rings-suppressed', suppress, '', (w) => playerKeys(w))
  const vis = (rows) => rows.filter((r) => r.what === 'focus visible (2.4.7)' && inner(r) && STYLEABLE.some((p) => r.pseudo === '-webkit-media-controls-' + p))
  const verdict = (rows) => (!rows.length ? 'missing' : rows.some((r) => r.outcome === 'pass') ? 'pass' : rows.some((r) => r.outcome === 'fail') ? 'fail' : 'cannot-determine')
  const sRows = vis(suppressed), nRows = vis(native.keys)
  prove('player 2.4.7: the ring alone, an author outline:none on the controls', 'player-rings-suppressed-bad', sRows.length === STYLEABLE.length ? verdict(sRows) : 'missing', 'cannot-determine', { rows: sRows.map((r) => ({ control: r.control, outcome: r.outcome, ringPx: r.ringPx, residualPx: r.residualPx, why: r.why })), replacedReadingWouldPass: sRows.every((r) => r.onOffPx > 0) })
  prove('player 2.4.7: the ring alone, the native page', 'player-rings-native-good', nRows.length === STYLEABLE.length && nRows.every((r) => r.outcome === 'pass') ? 'pass' : verdict(nRows), 'pass', { rows: nRows.map((r) => ({ control: r.control, outcome: r.outcome, ringPx: r.ringPx })) })
  const overflowVis = native.keys.find((r) => r.what === 'focus visible (2.4.7)' && /more media controls/.test(r.control ?? ''))
  proveWhy('player 2.4.7: a control no author style reaches is not settled', 'player-overflow-not-isolable', overflowVis ?? { outcome: 'missing' }, 'cannot-determine', /cannot be isolated/)
  // 2.4.13's exceptions, apart: (i) refuted by the instrument's own author style, supported for an -internal- control; (ii) from the author rules.
  const app = (rows, re) => rows.find((r) => r.what === 'focus appearance (2.4.13)' && re.test(r.control ?? '')) ?? { outcome: 'missing' }
  const nPlay = app(native.keys, /"play"/), nMore = app(native.keys, /more media controls/)
  prove('player 2.4.13: the second exception, ring and backdrop unmodified', 'player-ring-unmodified-good', nPlay.uaException && /second exception/.test(nPlay.uaException) && nPlay.exceptions?.userAgentOnly?.holds === false ? 'exempt' : nPlay.outcome, 'exempt', { row: nPlay })
  prove('player 2.4.13: the first exception, a ring no author selector reaches', 'player-internal-ring-good', nMore.uaException && /first exception/.test(nMore.uaException) ? 'exempt' : nMore.outcome, 'exempt', { row: nMore })
  const restyled = await playerFixture('player-ring-restyled', `${PS}play-button { outline: 1px dotted #8d8d8d !important; }`, '', (w) => playerKeys(w))
  const rPlay = app(restyled, /"play"/)
  proveWhy('player 2.4.13: an author-styled ring, neither exception', 'player-ring-restyled-bad', rPlay.uaException ? { ...rPlay, outcome: 'exempt' } : rPlay, 'fail', /the author styles the ring/)
  const backdrop = await playerFixture('player-host-backdrop', '#process-result video.result-player { background: #0f62fe; }', '', (w) => playerKeys(w))
  proveWhy('player 2.4.13: an author backdrop leaves the second exception to VH-200', 'player-host-backdrop-undetermined', app(backdrop, /"play"/), 'cannot-determine', /backdrop is set by the author.*VH-200/)
  // Codex astra's re-check (26 October): 2.4.13's area is the ring's own pixels, never the whole focus redraw.
  // In memory: no ring with a disclosure redraw over the area, and a ring not isolated, each with an author
  // backdrop so neither exception settles it; the twin, a ring whose own pixels make the area. The redraw
  // these replace is over the area in both failing cases, so the replaced reading would have passed them.
  const rules0 = { rules: [] }, backdropSet = { rules: [{ selector: '#process-result video.result-player', props: ['background: #0f62fe'] }] }
  const appArgs = { isHost: false, perimeter: 176, pseudo: '-webkit-media-controls-mute-button', indicatorRules: rules0, backdropRules: backdropSet }
  proveWhy('player 2.4.13: no ring, a disclosure redraw over the area (in memory)', 'appearance-no-ring-disclosure-redraw-bad', appearanceVerdict({ ...appArgs, isolated: true, ringArea3: 0, ringAny: 0 }), 'cannot-determine', /the ring's own pixels at 3:1 against unfocused are 0 of 176/, { redrawAt3to1: 900, replacedReadingWouldPass: 900 >= 176 })
  proveWhy('player 2.4.13: a ring not isolated, the redraw over the area (in memory)', 'appearance-ring-not-isolated-bad', appearanceVerdict({ ...appArgs, isolated: false, ringArea3: null, ringAny: 0 }), 'cannot-determine', /area not established/, { redrawAt3to1: 900, replacedReadingWouldPass: 900 >= 176 })
  proveWhy('player 2.4.13: the ring\'s own pixels over the area (in memory)', 'appearance-ring-over-the-area-good', appearanceVerdict({ ...appArgs, isolated: true, ringArea3: 200, ringAny: 220 }), 'pass', null)
  // On the page: an author outline:none on the controls Chrome lets an author style leaves no ring, and the
  // focus redraw (the user agent's highlight, the volume slider's disclosure) never makes 2.4.13 pass.
  const sApp = suppressed.filter((r) => r.what === 'focus appearance (2.4.13)' && inner(r))
  const sAppOutcome = sApp.length < STYLEABLE.length ? 'missing' : sApp.some((r) => r.outcome === 'pass') ? 'pass' : 'no pass'
  prove('player 2.4.13: the rings suppressed, the redraw kept', 'player-rings-suppressed-2413-bad', sAppOutcome, 'no pass', { rows: sApp.map((r) => ({ control: r.control, outcome: r.outcome, areaAt3to1: r.areaAt3to1, redrawAt3to1: r.redrawAt3to1, perimeter2px: r.perimeter2px, why: r.why })), replacedReadingWouldPass: sApp.some((r) => r.redrawAt3to1 >= r.perimeter2px) })
  // 2.4.11 and 2.4.12: author content over the play button; its twin, the native page.
  const cover = `<div id="cover" style="position:absolute;background:#fff;z-index:2"></div><script>addEventListener('load', () => { const r = document.querySelector('video.result-player').getBoundingClientRect(); Object.assign(document.getElementById('cover').style, { left: r.left + scrollX + 'px', top: r.bottom + scrollY - 72 + 'px', width: '60px', height: '30px' }) })</script>`
  const occluded = await playerFixture('player-occluded', '', cover, (w) => playerKeys(w))
  const occ = (rows) => rows.find((r) => r.what.startsWith('not hidden by author content') && /"play"/.test(r.control ?? '')) ?? { outcome: 'missing' }
  proveWhy('player 2.4.11/2.4.12: author content over a control, apart from its ring', 'player-occluded-bad', occ(occluded), 'fail', /2\.4\.12: partly hidden by author content \(div#cover\)/)
  proveWhy('player 2.4.11/2.4.12: author content over a control, apart from its ring', 'player-unoccluded-good', occ(native.keys), 'pass', null)
  // 4.1.2: the exposed name and value around play/pause and seek; their failing cases in memory (a native control cannot be made to hide its own state).
  for (const what of ['play/pause state exposed (4.1.2)', 'time slider value exposed (4.1.2)']) proveWhy('player 4.1.2: ' + what, 'player-native-' + (what.startsWith('play') ? 'play' : 'seek') + '-good', rowOf(native.keys, what), 'pass', null)
  const playBad = exposedChange('play', { a: { paused: true }, b: { paused: false }, c: { paused: true } }, { a: { name: 'play' }, b: { name: 'play' }, c: { name: 'play' } })
  const seekBad = exposedChange('seek', { a: { t: 0.5 }, b: { t: 0.7 } }, { a: { value: 0.5 }, b: { value: 0.5 } })
  proveWhy('player 4.1.2: playback toggles, the name does not (in memory)', 'exposed-name-unchanged-bad', playBad, 'fail', /did not follow it/)
  proveWhy('player 4.1.2: the time moves, the value does not (in memory)', 'exposed-value-unchanged-bad', seekBad, 'fail', /exposed value did not/)
  // Reverse traversal by identity: the same number of stops, one control twice and another never (in memory), against the native page's.
  const inv = [{ dom: 1, role: 'button', name: 'play' }, { dom: 2, role: 'slider', name: 'volume' }, { dom: 3, role: 'slider', name: 'video time scrubber' }]
  const dup = compareStops([{ dom: 3, role: 'slider', name: 'video time scrubber' }, { dom: 2, role: 'slider', name: 'volume' }, { dom: 2, role: 'slider', name: 'volume' }], inv)
  prove('player: Shift+Tab stops by identity, a count that matches (in memory)', 'reverse-stops-repeat-one-miss-one-bad', dup.ok ? 'pass' : 'fail', 'fail', { compared: dup, replacedReadingWouldPass: 3 >= inv.length })
  prove('player: Shift+Tab stops by identity, the native page', 'reverse-stops-native-good', rowOf(native.keys, 'Shift+Tab goes back').outcome, 'pass', { row: rowOf(native.keys, 'Shift+Tab goes back') })
  // Targets: the volume slider's geometry, at rest and disclosed, with its hit area; the three unavailable readings named apart (in memory).
  const vol = native.passive.find((r) => r.what === 'control target' && /volume/.test(r.control ?? '')) ?? { outcome: 'missing' }
  prove('player 2.5.5: a control empty at rest, measured disclosed', 'player-volume-disclosed-good', vol.geometry?.rest?.w === 0 && vol.geometry?.available?.w > 0 && vol.geometry?.disclosedBy && !vol.hitArea?.unavailable ? vol.outcome : 'cannot-determine', 'pass', { row: vol })
  const box = { x: 0, y: 0, w: 48, h: 48 }
  for (const [fixture, args, why] of [
    ['target-geometry-unavailable', { rest: { error: 'Could not compute box model.' }, hit: {}, sizing: { rules: [] } }, /^geometry unavailable/],
    ['target-empty-never-disclosed', { rest: { ...box, w: 0 }, hit: { unavailable: 'no geometry to test' }, sizing: { rules: [] } }, /at rest, and not disclosed/],
    ['target-hit-area-unavailable', { rest: box, hit: { unavailable: 'no point of its box hits the control' }, sizing: { rules: [] } }, /^hit area unavailable/],
  ]) proveWhy('player 2.5.5: unavailable readings named apart (in memory)', fixture, targetVerdict(args), 'cannot-determine', why)
  const sized = await playerFixture('player-target-author-sized', `${PS}mute-button { width: 24px !important; min-width: 24px !important; height: 24px !important; }`, '', (w) => playerRows(w))
  const mute = (rows) => rows.find((r) => r.what === 'control target' && /mute/.test(r.control ?? '')) ?? { outcome: 'missing' }
  proveWhy('player 2.5.5: an author-sized control, no user-agent exception', 'player-target-author-sized-bad', mute(sized).uaException ? { ...mute(sized), outcome: 'exempt' } : mute(sized), 'fail', /the author sets its size/)
  proveWhy('player 2.5.5: the native control by hit area', 'player-target-native-good', mute(native.passive), 'pass', null)
  // The same readings on a scrolled page (the app's card sits 2,900 px down): hit tests take the document's coordinates.
  const scrolled = await (async () => { const w = await open('player-scrolled', { html: page('<div style="height:2400px"></div>' + card(), '', CARD_WORDS) }); try { await w.evaluate(`(async () => { const v = document.querySelector('video.result-player'); for (let i = 0; i < 80 && v.readyState < 2 && !v.error; i++) await new Promise((r) => setTimeout(r, 100)); v.scrollIntoView({ block: 'center' }); })()`); return { passive: await playerRows(w), keys: await playerKeys(w) } } finally { await w.close() } })()
  proveWhy('player 2.5.5: the native control by hit area, the page scrolled', 'player-target-native-scrolled-good', mute(scrolled.passive), 'pass', null)
  proveWhy('player 2.4.11/2.4.12: the native page scrolled, nothing over the control', 'player-unoccluded-scrolled-good', occ(scrolled.keys), 'pass', null)
})

// Codex astra's second re-check (26 October), M-02: a ring's pixels count only where they meet 3:1 against
// the unfocused state. Synthetic shots of one clip (a 20 x 16 control, a 2 px blue ring 3 px outside it),
// analysed as the player's are (unfocused, focused with the ring removed, focused): a ring drawn focused or
// not is no indicator, the same ring drawn only on focus is. Each through 2.4.13's and 2.4.7's verdicts, the
// reading the re-check replaced (the ring removed against focused) kept beside.
await tryOne('ring indicator pixels', async () => {
  const w = await open('ring-indicator-synthetic', { html: page('') })
  try {
    const shotOf = (ring) => w.evaluate(`(() => { const c = document.createElement('canvas'); c.width = 60; c.height = 40; const x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, 60, 40); x.fillStyle = '#8d8d8d'; x.fillRect(20, 12, 20, 16); if (${ring}) { x.strokeStyle = '#0f62fe'; x.lineWidth = 2; x.strokeRect(17, 9, 26, 22); } return c.toDataURL('image/png').split(',')[1]; })()`)
    const withRing = await shotOf(true), noRing = await shotOf(false)
    const perimeter = Math.round(4 * (20 + 16) - 16)
    const args = { isHost: false, perimeter, pseudo: '-webkit-media-controls-play-button', indicatorRules: { rules: [] }, backdropRules: { rules: [{ selector: '#process-result video.result-player', props: ['background: #0f62fe'] }] } }
    for (const [fixture, off, wanted13, wanted7, why] of [
      ['ring-drawn-focused-or-not-bad', withRing, 'cannot-determine', 'not a pass', /the ring's own pixels at 3:1 against unfocused are 0 of 128/],
      ['ring-drawn-on-focus-good', noRing, 'pass', 'pass', null],
    ]) {
      const a = await analyse(w, RING_INDICATOR, off, noRing, withRing)
      const old = await analyse(w, DIFF, noRing, withRing)
      proveWhy('player 2.4.13: ring pixels at 3:1 against unfocused (synthetic shots)', fixture, appearanceVerdict({ ...args, isolated: true, ringArea3: a.indicator3, ringAny: a.ringAny }), wanted13, why, { reading: a, replacedRingArea3: old.changed3, replacedReadingWouldPass: old.changed3 >= perimeter })
      const vis = visibleVerdict({ isolated: true, pseudo: args.pseudo, ringAny: a.indicatorAny, ring3: a.indicator3, residualAny: a.otherAny, residual3: a.other3, onOffAny: a.onOffAny })
      prove('player 2.4.7: ring pixels that change against unfocused (synthetic shots)', fixture, vis.outcome === 'pass' ? 'pass' : 'not a pass', wanted7, { row: vis, reading: a, replacedReadingWouldPass: old.changed3 > 0 })
    }
  } finally { await w.close() }
})

await closeAnalysis()
browser.close()
writeFileSync(join(DIR, 'prove-8.json'), JSON.stringify(results, null, 1))
console.log(`${results.filter((r) => r.proved).length} of ${results.length} proved`)
process.exit(results.every((r) => r.proved) ? 0 : 1)
