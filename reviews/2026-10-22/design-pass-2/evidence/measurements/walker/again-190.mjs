// VH-190: Create under a finished video says it makes the video again. In
// each language, width and colour mode: before a job the button reads
// create.create; with the finished video on screen it reads create.again,
// its accessible name the same, nothing running off the page. Then a change
// of page language with focus on the button relabels it in place, focus
// unmoved; and pressing it with the video unsaved still asks the discard
// question. At 1280 in light, per language, three flows: saved, the label
// stays, and another file chosen, it reads create.create; saved, made again
// and cancelled, it reads create.create (a failure takes the same path:
// beginJob relabels before the outcome); and a finished video left on screen
// as the previous one when another file is chosen, unsaved then saved, read
// against the owner's choice (--previous A: create.create beside a previous
// video; B: create.again).
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node again-190.mjs [--langs …] [--views w1280,w375,w320] [--modes …] [--clips] [--no-flows]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep, F } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { MX_INIT, ready } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const views = opt('--views', ['w1280', 'w375', 'w320'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const clips = args.includes('--clips')
const flows = !args.includes('--no-flows')
const matrix = !args.includes('--no-matrix')
const PREVIOUS = opt('--previous', ['A'])[0]
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `again-190-${stamp}`)
mkdirSync(dir, { recursive: true })
const FILE = 'short-2s.mp4'
const OTHER = 'lecture-30s.mp4'

const mx = (w, expr) => w.evaluate(`(() => { const M = window.__mx; return ${expr}; })()`)
// Create as the page draws it, and the accessibility tree's name for it.
async function read(w) {
  const r = await mx(w, `(() => { const b = M.btn(2); const doc = document.documentElement;
    return { label: b.textContent, isCreate: M.is('create.create', b), isAgain: M.is('create.again', b), shown: M.shown(b), secondary: b.classList.contains('button--secondary'),
      ariaLabel: b.getAttribute('aria-label'), lang: doc.lang, res: M.res(),
      clipped: b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1 || (() => { const rb = b.getBoundingClientRect(); for (let a = b.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflow === 'visible') continue; const ra = a.getBoundingClientRect(); if (rb.left < ra.left - 1 || rb.right > ra.right + 1 || rb.top < ra.top - 1 || rb.bottom > ra.bottom + 1) return true; } return rb.left < 0 || rb.right > doc.clientWidth + 1; })(),
      overflowX: doc.scrollWidth > doc.clientWidth }; })()`)
  const { root } = await w.page.send('DOM.getDocument', { depth: 0 })
  const { nodeId } = await w.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#process-actions > button:nth-child(2)' })
  const { nodes } = await w.page.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })
  r.axName = nodes[0]?.name?.value ?? null
  r.nameFollows = r.axName === r.label.trim()
  return r
}
async function job(w) {
  if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(200) }
  await w.click(w.createButton())
  await w.waitRunning()
  await w.waitFor(`(() => { const M = window.__mx; return M.res() === 'result' || M.res() === 'failure'; })()`, { timeout: 600000, interval: 500, label: 'the job’s end' })
  await sleep(400)
  return mx(w, 'M.finished()')
}
// Save, and proof it went: the result's own button reads create.saved, spent.
async function save(w) {
  await w.click(w.saveButton())
  await w.waitSaved()
  return mx(w, `(() => { const b = document.querySelector('#process-result .actions > button'); return !!b && M.is('create.saved', b) && b.disabled; })()`)
}
// The page language changed as the switcher would, without taking focus.
async function relabelIn(w, tag) {
  await w.evaluate(`(() => { const r = document.querySelector('#language-switcher input[value="${tag}"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); })()`)
  await sleep(300)
}

const browser = await connectBrowser()
const out = []
const run = async (keyName, fn) => {
  const w = new Walk(browser, `again-190-${stamp}/${keyName}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await w.page.send('Accessibility.enable').catch(() => {})
    out.push({ key: keyName, ...(await fn(w)) })
  } catch (e) {
    out.push({ key: keyName, ok: false, error: String(e && e.message || e) })
  } finally {
    await w.close().catch(() => {})
  }
  console.log(JSON.stringify(out.at(-1)))
}

if (matrix) for (const lang of langs) for (const view of views) for (const mode of modes) {
  await run(`${lang}__${view}__${mode}`, async (w) => {
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, FILE)
    const before = await read(w)
    const finished = await job(w)
    const after = await read(w)
    if (clips && lang !== 'zh-Hans' && view !== 'w375') await w.clip(`again-${lang}-${view}-${mode}`, '#process-actions', { pad: 24 })
    // Focus on Create, the language changed under it: relabelled, focus kept.
    const other = lang === 'en-GB' ? 'ms-MY' : 'en-GB'
    await w.evaluate(`document.querySelector('#process-actions > button:nth-child(2)').focus()`)
    await relabelIn(w, other)
    const relabel = { ...(await read(w)), focusKept: await mx(w, 'M.focused(M.btn(2))') }
    await relabelIn(w, lang)
    // Pressed with the video unsaved: the discard question, as before.
    await w.click(w.createButton())
    await sleep(400)
    const asked = await mx(w, 'M.res() === "question"')
    const r = { lang, view, mode, finished, before, after, relabel, asked }
    r.ok = finished && before.lang === lang && after.lang === lang && after.res === 'result' && before.isCreate && !before.isAgain && after.isAgain && after.secondary && after.nameFollows && before.nameFollows && !after.ariaLabel &&
      !after.clipped && !after.overflowX && relabel.isAgain && relabel.lang === other && relabel.focusKept && relabel.nameFollows && asked
    return r
  })
}
if (flows) for (const lang of langs) {
  await run(`flow__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, FILE)
    const finished = await job(w)
    const unsaved = await read(w)
    const went = await save(w)
    const saved = await read(w)
    await w.setFiles(F(OTHER))
    await w.waitSettled({ timeout: 300000 })
    await sleep(400)
    const another = await read(w)
    const r = { lang, finished, unsaved, went, saved, another }
    r.ok = finished && went && unsaved.lang === lang && unsaved.isAgain && saved.res === 'result' && saved.isAgain && saved.secondary && another.isCreate && !another.secondary && another.nameFollows
    return r
  })
  await run(`restart__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, OTHER)
    const finished = await job(w)
    const went = await save(w)
    const saved = await read(w)
    // Made again from the saved result, then stopped: no finished video stands.
    await w.click(w.createButton())
    await w.waitRunning()
    await w.click(w.cancelButton())
    await w.waitFor(`(() => { const M = window.__mx; return M.idle() && M.create(); })()`, { timeout: 120000, interval: 300, label: 'Create back after the cancel' })
    await sleep(300)
    const cancelled = await read(w)
    const r = { lang, finished, went, saved, cancelled }
    r.ok = finished && went && saved.lang === lang && saved.isAgain && cancelled.res !== 'result' && cancelled.isCreate && !cancelled.secondary && cancelled.nameFollows
    return r
  })
  await run(`previous__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, FILE)
    const finished = await job(w)
    await w.setFiles(F(OTHER))
    await w.waitSettled({ timeout: 300000 })
    await w.waitFor(`(() => { const M = window.__mx; return M.previous() && M.create(); })()`, { timeout: 300000, interval: 300, label: 'the previous video beside the new file' })
    await sleep(300)
    const unsaved = { ...(await read(w)), previous: await mx(w, 'M.previous()') }
    const went = await save(w)
    const saved = { ...(await read(w)), previous: await mx(w, 'M.previous()') }
    const want = PREVIOUS === 'B' ? 'isAgain' : 'isCreate'
    const r = { lang, previousRule: PREVIOUS, finished, unsaved, went, saved }
    // Emphasis unchanged: secondary beside the unsaved previous video, primary once it is saved.
    r.ok = finished && went && unsaved.secondary && !saved.secondary && unsaved.lang === lang && unsaved.previous && saved.previous && unsaved[want] && saved[want] && unsaved.nameFollows && saved.nameFollows
    return r
  })
}
await closeAnalysis()
writeFileSync(join(dir, 'results.json'), JSON.stringify(out, null, 1))
const passed = out.filter((r) => r.ok).length
console.log(`${passed}/${out.length} ok — ${dir}`)
process.exit(passed === out.length ? 0 : 1)
