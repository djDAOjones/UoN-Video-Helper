// VH-193: a warning with the finished video when levelling needed heavy
// limiting. Three parts, each optional:
//
//   bite: for each file given, a job is started and the limiter's bite read
//     from the worker's own "chain planned" log line (its `limiterBiteLu`,
//     with the three figures it is made from), then cancelled. The corpus
//     listing in the close.
//   teams: the Teams recording's job runs to the end in English at 1280 in
//     light: the warning shows, first among the finished video's warnings
//     (the owner's 1A), and is spoken with the result; the bite it acts on is
//     the one the job logged. A save then completes, proved by the saved line
//     and a spent Save, and the warning stays word for word (the owner's 2A).
//   matrix: a short fixture with heavy limiting (clicks-20s.mp4), in three
//     languages, at 1280, 375 and 320 px, in light, dark and both forced
//     modes: the warning's heading and detail are the language's, the
//     notification fits the page, no horizontal scroll, the spoken line holds
//     the heading; a lecture fixture under the threshold shows none; and per
//     language a completed save leaves the warning word for word, which a
//     page-language change then translates.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node heavy-193.mjs [--bite <file>,<file>…] [--teams <file>] [--matrix]
//       [--langs …] [--views …] [--modes …] [--clips]
//
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { MX_INIT, fresh, ready } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const one = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const views = opt('--views', ['w1280', 'w375', 'w320'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const bites = opt('--bite', [])
const teams = one('--teams')
const matrix = args.includes('--matrix')
const clips = args.includes('--clips')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `heavy-193-${stamp}`)
mkdirSync(dir, { recursive: true })
const HEAVY = 'clicks-20s.mp4'
const LECTURE = 'lecture-30s.mp4'

const mx = (w, expr) => w.evaluate(`(() => { const M = window.__mx; return ${expr}; })()`)

/**
 * The worker's console, which the page's own session does not carry: each
 * dedicated worker is attached as a child session and its "chain planned"
 * record read whole, by value.
 */
async function watchWorkers(browser, w) {
  const seen = { planned: null, workers: 0 }
  browser.on(w.page.sessionId, 'Target.attachedToTarget', async ({ sessionId, targetInfo }) => {
    if (targetInfo.type !== 'worker') return
    seen.workers++
    browser.on(sessionId, 'Runtime.consoleAPICalled', async (e) => {
      if (e.args[1]?.value !== 'chain planned' || !e.args[2]?.objectId) return
      const r = await browser.send('Runtime.callFunctionOn', { objectId: e.args[2].objectId, functionDeclaration: 'function () { return JSON.stringify(this) }', returnByValue: true }, sessionId)
      seen.planned = JSON.parse(r.result.value)
    })
    await browser.send('Runtime.enable', {}, sessionId).catch(() => {})
    await browser.send('Runtime.runIfWaitingForDebugger', {}, sessionId).catch(() => {})
  })
  await w.page.send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true })
  return seen
}

// The finished video's warnings and what was spoken, as the page draws them.
const READ = `(() => { const M = window.__mx; const doc = document.documentElement;
  const result = document.getElementById('process-result');
  const box = result && result.querySelector('section.notification[data-kind="warning"]');
  const items = box ? [...box.querySelectorAll('li, .notification-item')].filter((el) => !el.querySelector('li')) : [];
  const titles = items.map((el) => (el.querySelector('strong, .notification-item-title, h3, h4, p') || el).textContent.trim());
  const text = box ? box.textContent.replace(/\\s+/g, ' ') : '';
  const heading = M.msg('warnings.heavyLimiting.heading'); const detail = M.msg('warnings.heavyLimiting.detail');
  const r = box ? box.getBoundingClientRect() : null;
  const live = (window.__audit.live || []).map((x) => x.text || x).join(' | ');
  const words = (el) => { const range = document.createRange(); range.selectNodeContents(el); return [...range.getClientRects()].every((q) => q.right <= innerWidth + 0.5 && q.left >= -0.5) };
  return { box: !!box, boxText: text, boxTitle: box ? (box.querySelector('.notification-title') || {}).textContent : null, titles, hasHeading: text.includes(heading), hasDetail: text.includes(detail),
    heavyFirst: titles.length > 0 && titles[0] === heading, headingIndex: titles.indexOf(heading), metadataIndex: titles.indexOf(M.msg('warnings.metadataLost.heading')),
    spoken: live.includes(heading), left: r && Math.round(r.left), right: r && Math.round(r.right), innerWidth, inside: box ? words(box) : true,
    overflowX: doc.scrollWidth > doc.clientWidth, lang: doc.lang } })()`

const browser = await connectBrowser()
const out = []
const run = async (keyName, fn, { init = [] } = {}) => {
  const w = new Walk(browser, `heavy-193-${stamp}/${keyName}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    for (const source of init) await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source })
    const seen = await watchWorkers(browser, w)
    out.push({ key: keyName, ...(await fn(w, seen)) })
  } catch (e) {
    out.push({ key: keyName, ok: false, error: String(e && e.message || e) })
  } finally {
    await w.close().catch(() => {})
  }
  const last = out.at(-1)
  console.log(JSON.stringify({ key: last.key, ok: last.ok, bite: last.planned?.limiterBiteLu, why: last.why, error: last.error }))
}
const create = async (w) => {
  if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(200) }
  await w.click(w.createButton())
}
const planned = async (w, seen, timeout) => {
  const t0 = Date.now()
  while (!seen.planned) {
    if (Date.now() - t0 > timeout) throw new Error(`no "chain planned" in ${timeout / 1000} s (${seen.workers} workers)`)
    const failed = await w.evaluate(`(() => { const p = document.getElementById('process-progress'); const r = document.getElementById('process-result'); return (!p || p.hidden) && !!r && r.children.length > 0 })()`)
    if (failed) throw new Error('the job ended before planning')
    await sleep(500)
  }
  return seen.planned
}
/**
 * Save, and prove it completed (Codex astra's must 3): the status line is the
 * saved line, and Save is spent, reading "Saved" and disabled.
 */
async function savedWhole(w) {
  await w.click(w.saveButton())
  await w.waitSaved()
  await sleep(500)
  return mx(w, `(() => { const s = document.getElementById('save-status').textContent; const b = document.querySelector(${JSON.stringify(w.saveButton())});
    const done = s.startsWith(M.msg('status.saved').split('.')[0]) && !!b && b.textContent.trim() === M.msg('create.saved') && b.disabled;
    return { status: s.slice(0, 120), button: b && b.textContent.trim(), disabled: b && b.disabled, done } })()`)
}
// The bite from the log's own rounded figures, to set beside the logged one.
const recomputed = (p) => p.afterChainLufs === null || p.limitedLufs === null ? null : Math.round((p.afterChainLufs + p.gainDb - p.limitedLufs) * 100) / 100

for (const path of bites) {
  await run(`bite__${basename(path).replace(/[^A-Za-z0-9.-]+/g, '_')}`, async (w, seen) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await fresh(w, 'en-GB')
    await w.setFiles(path)
    await w.waitSettled({ timeout: 900000 })
    await w.waitFor(`(() => { const M = window.__mx; return M.verdict() || M.kindIn("#source-block") || M.kindIn("#source-report") === "error" })()`, { label: 'a verdict', timeout: 900000 })
    const canCreate = await w.evaluate(`(() => { const b = document.querySelector(${JSON.stringify(w.createButton())}); return !!b && !b.hidden && !b.disabled })()`)
    // A file the page will not make: the reason is the page's own words (Codex astra's must 2).
    if (!canCreate) {
      const reason = await w.evaluate(`(() => { const t = (s) => { const e = document.querySelector(s); return e && !e.hidden ? e.textContent.replace(/\\s+/g, ' ').trim() : '' }; return [t('#source-block'), t('#source-report'), t('#preflight-report')].filter(Boolean).join(' / ').slice(0, 300) })()`)
      return { file: basename(path), created: false, reason, ok: reason.length > 0, why: reason ? [] : ['not made, and no reason on the page'] }
    }
    await create(w)
    let p
    try { p = await planned(w, seen, 1800000) } catch (e) {
      // A job that ends before planning has no bite: say why, in the page's words.
      const said = await mx(w, `({ noAudio: M.matches(document.body.textContent, 'warnings.noAudio.heading'), result: (document.querySelector('#process-result .notification-title') || {}).textContent || null })`)
      // A finished video whose worker never planned levelling had no sound to level.
      const silent = said.result !== null && !String(e.message).startsWith('no "chain planned"')
      return { file: basename(path), created: true, planned: null, silent, reason: silent ? 'no audio: a silent job, no plan and no bite' : String(e.message), said, ok: silent, why: silent ? [] : [String(e.message)] }
    }
    await w.click(w.cancelButton()).catch(() => {})
    await sleep(1500)
    const why = []
    if (p.limiterBiteLu !== null && Math.abs(p.limiterBiteLu - recomputed(p)) > 0.02) why.push(`logged ${p.limiterBiteLu}, from its figures ${recomputed(p)}`)
    // Measured at planning, then cancelled: whether the job WOULD warn, from the
    // log's figure, rounded to the hundredth. Within 0.005 LU of the threshold
    // the rounding cannot say, and the file is marked to be run to the end
    // (Codex astra's must 2).
    const boundary = p.limiterBiteLu !== null && Math.abs(p.limiterBiteLu - 3) <= 0.005
    if (boundary) why.push('within rounding of 3 LU: run it to the end')
    return { file: basename(path), created: true, planned: p, wouldWarn: p.limiterBiteLu !== null && p.limiterBiteLu > 3, boundary, cancelled: true, why, ok: why.length === 0 }
  })
}

if (teams) {
  await run('teams__en-GB', async (w, seen) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await fresh(w, 'en-GB')
    await w.setFiles(teams)
    await w.waitSettled({ timeout: 900000 })
    await w.waitFor(`(() => { const M = window.__mx; return M.verdict() })()`, { label: 'a verdict', timeout: 900000 })
    await create(w)
    const p = await planned(w, seen, 1800000)
    await w.waitFor(`(() => { const p = document.getElementById('process-progress'); const s = document.querySelector(${JSON.stringify(w.saveButton())}); return s && (!p || p.hidden); })()`, { label: 'finished', timeout: 3600000, interval: 2000 })
    await sleep(1000)
    const r = await w.evaluate(READ)
    await w.clip('teams-finished', '#process-result', { pad: 8 })
    const why = []
    if (!(p.limiterBiteLu > 3)) why.push(`bite ${p.limiterBiteLu}`)
    if (!r.box || !r.hasHeading || !r.hasDetail || !r.heavyFirst || !r.spoken) why.push(`shown ${JSON.stringify(r)}`)
    // A save completes; the warning stays as it was, with no new words (2A).
    const saved = await savedWhole(w)
    const s = await w.evaluate(READ)
    if (!saved.done) why.push(`save ${JSON.stringify(saved)}`)
    if (s.boxText !== r.boxText) why.push(`after save "${s.boxText}"`)
    return { planned: p, recomputed: recomputed(p), shown: r, saved, afterSave: s, why, ok: why.length === 0 }
  })
}

if (matrix) for (const lang of langs) for (const view of views) for (const mode of modes) {
  await run(`matrix__${lang}__${view}__${mode}`, async (w, seen) => {
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, HEAVY)
    await create(w)
    await w.waitFinished()
    const r = await w.evaluate(READ)
    if (clips && (lang === 'en-GB' || view === 'w320')) await w.clip(`heavy193-${lang}-${view}-${mode}`, '#process-result', { pad: 8 })
    const why = []
    if (!(seen.planned?.limiterBiteLu > 3)) why.push(`bite ${seen.planned?.limiterBiteLu}`)
    if (!r.box || !r.hasHeading || !r.hasDetail || !r.heavyFirst || !r.spoken) why.push(`shown ${JSON.stringify({ box: r.box, titles: r.titles, h: r.hasHeading, d: r.hasDetail, spoken: r.spoken })}`)
    if (!r.inside || r.overflowX || r.left < 0 || r.right > r.innerWidth) why.push(`fit ${r.left}..${r.right} of ${r.innerWidth} inside ${r.inside} overflowX ${r.overflowX}`)
    if (r.lang !== lang) why.push(`lang ${r.lang}`)
    return { lang, view, mode, planned: seen.planned, r, why, ok: why.length === 0 }
  })
}
if (matrix) for (const lang of langs) {
  await run(`under__${lang}`, async (w, seen) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, LECTURE)
    await create(w)
    await w.waitFinished()
    const r = await w.evaluate(READ)
    const why = []
    if (!(seen.planned?.limiterBiteLu <= 3)) why.push(`bite ${seen.planned?.limiterBiteLu}`)
    if (r.hasHeading || r.spoken) why.push(`warned ${JSON.stringify(r.titles)}`)
    return { lang, planned: seen.planned, r, why, ok: why.length === 0 }
  })
}
// 2A on the short fixture, per language: a completed save leaves the warning
// word for word; a page-language change then says it in the other language.
if (matrix) for (const lang of langs) {
  const other = lang === 'en-GB' ? 'zh-Hans' : 'en-GB'
  await run(`save__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, HEAVY)
    await create(w)
    await w.waitFinished()
    const r = await w.evaluate(READ)
    const saved = await savedWhole(w)
    const s = await w.evaluate(READ)
    await w.chooseLanguage(other)
    const o = await w.evaluate(READ)
    const why = []
    if (!r.hasHeading || !r.hasDetail) why.push('not shown')
    if (!saved.done) why.push(`save ${JSON.stringify(saved)}`)
    if (s.boxText !== r.boxText) why.push(`after save "${s.boxText}"`)
    if (!o.hasHeading || !o.hasDetail || o.lang !== other) why.push(`in ${other} ${JSON.stringify(o.titles)}`)
    return { lang, saved, before: r.boxText, after: s.boxText, other: o.titles, why, ok: why.length === 0 }
  })
}
await closeAnalysis()
writeFileSync(join(dir, 'results.json'), JSON.stringify(out, null, 1))
const passed = out.filter((r) => r.ok).length
console.log(`${passed}/${out.length} ok — ${dir}`)
process.exit(passed === out.length ? 0 : 1)
