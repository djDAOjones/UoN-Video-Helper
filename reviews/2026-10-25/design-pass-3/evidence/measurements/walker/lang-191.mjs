// VH-191: Video language at the top of step 3. In three languages, at 1280,
// 375 and 320 px, in light, dark and both forced-colour modes, with a video
// read: the choice sits in step 3, under its heading and the lock note, before
// the title card choice and outside it; it stays in view with the title card
// off, on, and on a student submission; its legend and helper are the
// sheet's words in the page's language, styled as Video type's legend; its
// three radios are named by their segments, follow the page until picked,
// and fit the page with 44 px targets; Video type's description carries the
// next-video line and Video language's does not. Then, at 1280 in light per
// language, one flow: an arrow key picks another language as before; the pick
// survives a page-language change and a reload; while a video is made the
// choice is disabled, step 3's lock note shows, and the line under Video type
// reads videoKind.nextVideo; after the job the choice is free again, the line
// stays, and the result names the video language.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node lang-191.mjs [--langs …] [--views …] [--modes …] [--clips] [--no-flows] [--no-matrix]
//   Observed in the browser: the cases above, a save's lock, and an unpicked
// job under a page change. Traced in source only (Codex astra): a cancel's
// and a failure's release, which take the same applyControlLock path, and
// the Tab order around the group, which is the document's.
//
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep } from './walk.mjs'
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
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `lang-191-${stamp}`)
mkdirSync(dir, { recursive: true })
const FILE = 'short-2s.mp4'
// Long enough for a page change to land while it is made.
const LONG = 'lecture-30s.mp4'
const TAGS = ['en-GB', 'zh-Hans', 'ms-MY']

const mx = (w, expr) => w.evaluate(`(() => { const M = window.__mx; return ${expr}; })()`)

// The choice as the page draws it.
const READ = `(() => { const M = window.__mx; const doc = document.documentElement;
  const fs = document.getElementById('video-language'); const step = document.getElementById('step-title');
  const heading = document.getElementById('title-heading'); const card = document.getElementById('title-card-choice');
  const note = step.querySelector('.lock-note');
  const after = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  const r = fs.getBoundingClientRect(); const legend = fs.querySelector('legend'); const kindLegend = document.querySelector('#video-kind > legend');
  const style = (el) => { const cs = getComputedStyle(el); return cs.fontSize + '/' + cs.fontWeight + '/' + cs.lineHeight + '/' + cs.fontFamily };
  const faces = [...fs.querySelectorAll('.segment')].map((s) => { const b = s.getBoundingClientRect(); const i = s.querySelector('input'); return { value: i.value, checked: i.checked, disabled: i.disabled, lang: (s.querySelector('[lang]') || s.closest('[lang]')).lang, text: s.textContent.trim(), w: b.width, h: b.height, left: Math.round(b.left), right: Math.round(b.right) } });
  return { lang: doc.lang, shown: !fs.hidden && !step.hidden && r.height > 0 && getComputedStyle(fs).visibility !== 'hidden',
    inStep: step.contains(fs), afterHeading: after(heading, fs), afterNote: !!note && after(note, fs), beforeCard: after(fs, card), inCard: card.contains(fs),
    legend: legend.textContent.trim(), legendMsg: M.msg('videoLanguage.label'), legendStyle: style(legend), kindLegendStyle: style(kindLegend),
    helper: document.getElementById('video-language-helper').textContent.replace(/\\s+/g, ' ').trim(), helperMsg: M.msg('videoLanguage.helper') + ' ' + M.msg('videoLanguage.typed'),
    describedBy: fs.getAttribute('aria-describedby'), kindDescribedBy: document.getElementById('video-kind').getAttribute('aria-describedby'),
    nextInKind: document.getElementById('video-kind').contains(document.getElementById('video-next')),
    faces, disabled: fs.disabled, innerWidth: window.innerWidth, overflowX: doc.scrollWidth > doc.clientWidth,
    cardOn: document.getElementById('title-card-on').checked, kind: M.checked('video-kind') } })()`

async function axNames(w) {
  const names = {}
  const { root } = await w.page.send('DOM.getDocument', { depth: 0 })
  // The group itself: named by its legend, described by its helper alone.
  const group = await w.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#video-language' })
  const { nodes: g } = await w.page.send('Accessibility.getPartialAXTree', { nodeId: group.nodeId, fetchRelatives: false })
  names.group = g[0]?.name?.value ?? null
  names.groupDescription = g[0]?.description?.value ?? null
  for (const tag of TAGS) {
    const { nodeId } = await w.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: `#video-language input[value="${tag}"]` })
    if (!nodeId) continue
    const { nodes } = await w.page.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })
    names[tag] = nodes[0]?.name?.value ?? null
  }
  return names
}

const judge = (r, want) => {
  const why = []
  if (!r.shown) why.push('not shown')
  if (!r.inStep || !r.afterHeading || !r.afterNote || !r.beforeCard || r.inCard) why.push(`place ${r.inStep}/${r.afterHeading}/${r.afterNote}/${r.beforeCard}/${r.inCard}`)
  if (r.legend !== r.legendMsg) why.push(`legend "${r.legend}"`)
  if (r.legendStyle !== r.kindLegendStyle) why.push(`legend style ${r.legendStyle} vs ${r.kindLegendStyle}`)
  if (r.helper !== r.helperMsg) why.push(`helper "${r.helper}"`)
  if (r.describedBy !== 'video-language-helper') why.push(`describedby ${r.describedBy}`)
  if (r.kindDescribedBy !== 'video-kind-result video-next' || !r.nextInKind) why.push(`kind describedby ${r.kindDescribedBy} ${r.nextInKind}`)
  if (r.axNames.group !== r.legendMsg) why.push(`group name "${r.axNames.group}"`)
  if ((r.axNames.groupDescription ?? '').replace(/\s+/g, ' ').trim() !== r.helperMsg) why.push(`group description "${r.axNames.groupDescription}"`)
  if (r.faces.length !== 3) why.push(`faces ${r.faces.length}`)
  for (const f of r.faces) {
    if (f.checked !== (f.value === want)) why.push(`${f.value} checked ${f.checked}`)
    if (f.lang !== f.value) why.push(`${f.value} lang ${f.lang}`)
    if (r.axNames[f.value] !== f.text) why.push(`${f.value} name "${r.axNames[f.value]}"`)
    if (f.h < 44 || f.w < 44) why.push(`${f.value} target ${f.w} x ${f.h}`)
    if (f.left < 0 || f.right > r.innerWidth) why.push(`${f.value} off the page ${f.left}..${f.right}`)
    if (f.disabled) why.push(`${f.value} disabled`)
  }
  if (r.disabled) why.push('fieldset disabled')
  if (r.overflowX) why.push('overflowX')
  return why
}

const browser = await connectBrowser()
const out = []
const run = async (keyName, fn) => {
  const w = new Walk(browser, `lang-191-${stamp}/${keyName}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    // Each case starts with no pick remembered, so the choice follows the page.
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: `if (!sessionStorage.getItem('lang191')) { sessionStorage.setItem('lang191', '1'); localStorage.removeItem('uon-video-helper:video-language') }` })
    await w.page.send('Accessibility.enable').catch(() => {})
    out.push({ key: keyName, ...(await fn(w)) })
  } catch (e) {
    out.push({ key: keyName, ok: false, error: String(e && e.message || e) })
  } finally {
    await w.close().catch(() => {})
  }
  const last = out.at(-1)
  console.log(JSON.stringify({ key: last.key, ok: last.ok, why: last.why, error: last.error }))
}
const look = async (w, want) => {
  const r = { ...(await w.evaluate(READ)), axNames: await axNames(w) }
  r.why = judge(r, want)
  return r
}

if (matrix) for (const lang of langs) for (const view of views) for (const mode of modes) {
  await run(`matrix__${lang}__${view}__${mode}`, async (w) => {
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, FILE)
    // Staff, card off; card on; a student submission (the card locked on).
    const off = await look(w, lang)
    if (clips && (lang === 'en-GB' || view === 'w320')) await w.clip(`lang191-${lang}-${view}-${mode}`, '#step-title', { pad: 8 })
    await w.click('#title-card-on')
    await sleep(200)
    const on = await look(w, lang)
    await w.chooseKind('submission')
    await sleep(300)
    const sub = await look(w, lang)
    const why = [...off.why.map((x) => `off: ${x}`), ...on.why.map((x) => `on: ${x}`), ...sub.why.map((x) => `submission: ${x}`)]
    if (off.cardOn || !on.cardOn || sub.kind !== 'submission') why.push(`states ${off.cardOn}/${on.cardOn}/${sub.kind}`)
    if (off.lang !== lang) why.push(`lang ${off.lang}`)
    return { lang, view, mode, off, on, sub, why, ok: why.length === 0 }
  })
}

if (flows) for (const lang of langs) {
  await run(`flow__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, FILE)
    const why = []
    // The keyboard as before: focus the checked radio, an arrow picks the next.
    await w.evaluate(`document.querySelector('#video-language input:checked').focus()`)
    await w.press('ArrowRight')
    await sleep(200)
    const picked = await mx(w, `M.checked('video-language')`)
    const focusKept = await mx(w, `document.activeElement && document.activeElement.name === 'video-language' && document.activeElement.checked`)
    if (picked === lang || !focusKept) why.push(`arrow ${picked} ${focusKept}`)
    // Kept through a page-language change, and through a reload.
    const other = lang === 'en-GB' ? 'zh-Hans' : 'en-GB'
    await w.chooseLanguage(other)
    await sleep(300)
    const afterPage = await mx(w, `M.checked('video-language')`)
    if (afterPage !== picked) why.push(`page change ${afterPage}`)
    await w.chooseLanguage(lang)
    await w.goto()
    await ready(w, lang, FILE)
    const afterReload = await mx(w, `M.checked('video-language')`)
    if (afterReload !== picked) why.push(`reload ${afterReload}`)
    // While a video is made: locked with step 3, the lock note, the line under Video type.
    if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(200) }
    await w.click(w.createButton())
    await w.waitRunning()
    const running = await mx(w, `(() => { const fs = document.getElementById('video-language'); const note = document.querySelector('#step-title .lock-note'); const next = document.getElementById('video-next');
      return { disabled: fs.disabled, radiosDisabled: [...fs.querySelectorAll('input')].every((i) => i.matches(':disabled')), cardLocked: document.getElementById('title-card-choice').disabled,
        note: !note.hidden && note.textContent === M.msg('create.lockedMaking'), next: !next.hidden && next.textContent === M.msg('videoKind.nextVideo'),
        kindFree: !document.getElementById('video-kind').disabled } })()`)
    if (!running.disabled || !running.radiosDisabled || !running.cardLocked || !running.note || !running.next || !running.kindFree) why.push(`running ${JSON.stringify(running)}`)
    // A click on a locked segment changes nothing.
    await w.evaluate(`document.querySelector('#video-language input:not(:checked)').click()`)
    const stillPicked = await mx(w, `M.checked('video-language')`)
    if (stillPicked !== picked) why.push(`locked click ${stillPicked}`)
    await w.waitFor(`(() => { const M = window.__mx; return M.res() === 'result' || M.res() === 'failure'; })()`, { timeout: 600000, interval: 500, label: 'the job’s end' })
    await sleep(400)
    const done = await mx(w, `(() => { const fs = document.getElementById('video-language'); const next = document.getElementById('video-next');
      const name = document.querySelector('#video-language input[value="${picked}"]').closest('.segment').textContent.trim();
      return { finished: M.finished(), free: !fs.disabled, next: !next.hidden && next.textContent === M.msg('videoKind.nextVideo'), name,
        named: document.getElementById('process-result').textContent.includes(M.msg('result.videoLanguage').replace('{language}', name)) } })()`)
    // The record names the video language in full, the pick's own name: it is not the page's.
    if (!done.finished || !done.free || !done.next || !done.named) why.push(`done ${JSON.stringify(done)}`)
    // A save locks it too, and frees it after: every disabled change is kept.
    await w.evaluate(`(() => { window.__vl = []; const fs = document.getElementById('video-language');
      new MutationObserver(() => window.__vl.push(fs.disabled)).observe(fs, { attributes: true, attributeFilter: ['disabled'] }) })()`)
    await w.click(w.saveButton())
    await w.waitSaved()
    await sleep(300)
    const saved = await mx(w, `({ seen: window.__vl, free: !document.getElementById('video-language').disabled })`)
    if (!saved.seen.includes(true) || !saved.free) why.push(`save ${JSON.stringify(saved)}`)
    return { lang, picked, afterPage, afterReload, running, done, saved, why, ok: why.length === 0 }
  })
  // Unpicked: a page-language change under a running job moves the shown
  // choice, still locked, while the job keeps the language it started with.
  await run(`unpicked__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, LONG)
    const why = []
    const other = lang === 'en-GB' ? 'zh-Hans' : 'en-GB'
    const nameOf = (tag) => mx(w, `document.querySelector('#video-language input[value="${tag}"]').closest('.segment').textContent.trim()`)
    const [startName, otherName] = [await nameOf(lang), await nameOf(other)]
    if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(200) }
    await w.click(w.createButton())
    await w.waitRunning()
    await w.chooseLanguage(other)
    await sleep(300)
    const during = await mx(w, `({ shown: M.checked('video-language'), disabled: document.getElementById('video-language').disabled, job: document.getElementById('process-job').textContent, running: M.running() })`)
    if (during.running && (during.shown !== other || !during.disabled || !during.job.includes(startName) || during.job.includes(otherName))) why.push(`during ${JSON.stringify(during)}`)
    if (!during.running) why.push('the job ended before the page changed')
    await w.waitFor(`(() => { const M = window.__mx; return M.res() === 'result' || M.res() === 'failure'; })()`, { timeout: 600000, interval: 500, label: 'the job’s end' })
    await sleep(400)
    // On the other page the result names the job's language in full …
    const onOther = await mx(w, `document.getElementById('process-result').textContent.includes(M.msg('result.videoLanguage').replace('{language}', ${JSON.stringify(startName)}))`)
    if (!onOther) why.push('result on the other page does not name the job’s language')
    // … and back on its own page it names none.
    await w.chooseLanguage(lang)
    await sleep(300)
    const onOwn = await mx(w, `document.getElementById('process-result').textContent.includes(M.msg('result.videoLanguage').split('{language}')[0].trim())`)
    if (onOwn) why.push('result on the job’s own page names a video language')
    return { lang, startName, otherName, during, onOther, onOwn, why, ok: why.length === 0 }
  })
}
await closeAnalysis()
writeFileSync(join(dir, 'results.json'), JSON.stringify(out, null, 1))
const passed = out.filter((r) => r.ok).length
console.log(`${passed}/${out.length} ok — ${dir}`)
process.exit(passed === out.length ? 0 : 1)
