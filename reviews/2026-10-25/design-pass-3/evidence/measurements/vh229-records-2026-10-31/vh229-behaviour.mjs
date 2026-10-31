// VH-229 #1: the title's "?" and its panel read in Chrome, by the page, outside the walker, on the walker's own Walk, setViewport and setMode. Writes jsonl; nothing is written to the repository.
//   WALKER=… OUT=… node vh229-behaviour.mjs
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { appendFileSync } from 'node:fs'
const WALKER = process.env.WALKER, OUT = process.env.OUT
const imp = (f) => import(pathToFileURL(join(WALKER, f)).href)
const { connectBrowser } = await imp('cdp.mjs')
const { Walk, sleep } = await imp('walk.mjs')
const { QUAL_INIT, closeAnalysis, setViewport, setMode, key, focusByKeyboard } = await imp('qualify.mjs')
const { MX_INIT, ready, fresh } = await imp('scenarios.mjs')
const browser = await connectBrowser()
const put = (o) => appendFileSync(OUT, JSON.stringify(o) + '\n')
const state = `(() => { const b = document.getElementById('about-help-button'), p = document.getElementById('about-help'), t = document.getElementById('format-help'); const a = document.activeElement; return { open: !p.hidden, expanded: b.getAttribute('aria-expanded'), tipOpen: !t.hidden, focus: !a || a === document.body ? 'body' : (a.id || a.tagName + ':' + (a.name || a.value || '')) } })()`
const layout = String.raw`(() => {
  const row = document.querySelector('.page-title-row'), h = document.querySelector('.page-title'), b = document.getElementById('about-help-button'), r = (e) => { const x = e.getBoundingClientRect(); return { l: Math.round(x.left * 10) / 10, r: Math.round(x.right * 10) / 10, t: Math.round(x.top * 10) / 10, bo: Math.round(x.bottom * 10) / 10, w: Math.round(x.width * 10) / 10, h: Math.round(x.height * 10) / 10 } };
  const range = document.createRange(); range.selectNodeContents(h); const lines = new Set([...range.getClientRects()].map((c) => Math.round(c.top))).size;
  const root = document.documentElement, words = range.getBoundingClientRect();
  const s = document.getElementById('step-choose'), f = document.getElementById('file-input');
  return { root: parseFloat(getComputedStyle(root).fontSize), vw: innerWidth, scrollW: root.scrollWidth, clientW: root.clientWidth, row: r(row), h1: r(h), q: r(b), step: r(s), input: r(f), lines, wordsRight: Math.round(words.right * 10) / 10, h1Over: h.scrollWidth > h.clientWidth, name: h.textContent.trim(), gapWordsToQ: Math.round((b.getBoundingClientRect().left - words.right) * 10) / 10, qFont: getComputedStyle(b).fontSize, children: [...row.children].map((c) => c.tagName) };
})()`
const tabOrder = async (w, n = 7) => { const out = []; await w.evaluate(`(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0) })()`); for (let i = 0; i < n; i++) { await key(w, 'Tab'); await sleep(60); out.push(await w.evaluate(`(() => { const a = document.activeElement; return a.id || a.className || a.tagName })()`)) } return out }
let bad = 0
// Layout: three languages, every width the stage names plus 401 and 400, both fonts, closed and open, today's name and VH-225's (set in memory by the probe).
for (const lang of ['en-GB', 'zh-Hans', 'ms-MY']) for (const view of ['w1280', 'w640', 'w401', 'w400', 'w375', 'w320']) for (const mode of ['light', 'font32']) {
  const w = new Walk(browser, `behaviour/${lang}__${view}__${mode}`)
  try {
    await w.open(); await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT }); await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await setViewport(w, view); await setMode(w, mode); await fresh(w, lang); await sleep(200)
    put({ kind: 'layout', lang, view, mode, name: 'today', panel: 'closed', ...(await w.evaluate(layout)) })
    await w.evaluate(`document.getElementById('about-help-button').click()`); await sleep(120)
    put({ kind: 'layout', lang, view, mode, name: 'today', panel: 'open', ...(await w.evaluate(layout)) })
    await w.evaluate(`document.getElementById('about-help-button').click(); document.querySelector('.page-title').textContent = document.documentElement.lang === 'en-GB' ? 'UoN Video Finisher' : (document.documentElement.lang === 'ms-MY' ? 'Penyiap Video UoN' : 'UoN 视频完成工具')`); await sleep(120)
    put({ kind: 'layout', lang, view, mode, name: 'finisher', panel: 'closed', ...(await w.evaluate(layout)) })
  } catch (e) { bad++; put({ kind: 'error', lang, view, mode, error: String(e.stack ?? e).slice(0, 300) }) } finally { await w.close().catch(() => undefined) }
}
// Behaviour, at each of two widths and fonts in English, one width in the others.
for (const [lang, view, mode] of [['en-GB', 'w1280', 'light'], ['en-GB', 'w320', 'light'], ['en-GB', 'w320', 'font32'], ['zh-Hans', 'w1280', 'light'], ['ms-MY', 'w320', 'light']]) {
  const w = new Walk(browser, `behaviour2/${lang}__${view}__${mode}`)
  const step = async (name, extra = {}) => put({ kind: 'behaviour', lang, view, mode, step: name, ...extra, ...(await w.evaluate(state)) })
  const open = async () => { await focusByKeyboard(w, '#about-help-button'); if (!(await w.evaluate(state)).open) await key(w, 'Enter'); await sleep(120) }
  try {
    await w.open(); await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT }); await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await setViewport(w, view); await setMode(w, mode); await fresh(w, lang); await sleep(200)
    await step('at load')
    put({ kind: 'name', lang, view, mode, name: await w.evaluate(`document.getElementById('about-help-button').getAttribute('aria-label')`), heading: await w.evaluate(`document.querySelector('h1').textContent.trim()`), noteInPanel: await w.evaluate(`!!document.getElementById('about-help').contains(document.getElementById('browser-note'))`) })
    put({ kind: 'taborder', lang, view, mode, panel: 'closed', order: await tabOrder(w) })
    await focusByKeyboard(w, '#about-help-button'); await key(w, 'Enter'); await sleep(120); await step('Enter opens')
    await key(w, 'Enter'); await sleep(120); await step('Enter closes')
    await w.page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: ' ' }); await w.page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 }); await sleep(120); await step('Space opens')
    await w.click('#about-help-button'); await sleep(120); await step('click closes')
    await w.click('#about-help-button'); await sleep(120); await step('click opens')
    put({ kind: 'taborder', lang, view, mode, panel: 'open', order: await tabOrder(w) })
    await focusByKeyboard(w, '#about-help-button'); await key(w, 'Tab'); await sleep(100); await step('Tab moves on: stays open')
    await w.click('.page-title'); await sleep(100); await step('click elsewhere: stays open')
    // The press on Choose file: down, read, away, released outside, so no chooser opens.
    const b0 = await w.evaluate(`(() => { const e = document.getElementById('file-input'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + 40, y: r.top + r.height / 2, top: r.top } })()`)
    await w.page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: b0.x, y: b0.y }); await w.page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: b0.x, y: b0.y, button: 'left', buttons: 1, clickCount: 1 }); await sleep(120)
    const b1 = await w.evaluate(`document.getElementById('file-input').getBoundingClientRect().top`)
    await w.page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1, button: 'left', buttons: 1 }); await w.page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 1, y: 1, button: 'left', clickCount: 1 }); await sleep(120)
    await step('press on Choose file', { moved: Math.round((b1 - b0.top) * 10) / 10 })
    await w.evaluate('window.scrollTo(0, 0)')
    // Escape, each state.
    await open(); await w.evaluate(`document.getElementById('format-help-button').focus()`); await key(w, 'Enter'); await sleep(120); await step('format tip open')
    await key(w, 'Escape'); await sleep(120); await step('Escape 1: the tip')
    await key(w, 'Escape'); await sleep(120); await step('Escape 2: the panel, focus on its "?"')
    await open(); await key(w, 'Escape'); await sleep(120); await step('Escape on the "?"')
    await open(); await w.evaluate(`document.activeElement.blur()`); await key(w, 'Escape'); await sleep(120); await step('Escape from nowhere')
    await open(); await focusByKeyboard(w, 'input[name="video-kind"]'); await key(w, 'Escape'); await sleep(120); await step('Escape on a control elsewhere: stays, focus kept')
    await w.evaluate(`document.getElementById('feedback-open').click()`); await sleep(200); await step('dialog open', { dialog: await w.evaluate(`document.getElementById('feedback-dialog').open`) })
    await key(w, 'Escape'); await sleep(200); await step('Escape in the dialog: the dialog alone', { dialog: await w.evaluate(`document.getElementById('feedback-dialog').open`) })
    // The panel closed by its "?" with the format tip open: no tip left open in a closed panel, by the keyboard and by the pointer.
    await focusByKeyboard(w, '#format-help-button'); await key(w, 'Enter'); await sleep(100); await w.click('#about-help-button'); await sleep(120); await step('"?" pressed with the tip open: by the pointer')
    await w.click('#about-help-button'); await sleep(120); await focusByKeyboard(w, '#format-help-button'); await key(w, 'Enter'); await sleep(100); await focusByKeyboard(w, '#about-help-button'); await key(w, 'Enter'); await sleep(120); await step('"?" pressed with the tip open: by the keyboard')
    // The browser note: shown in memory, panel closed and open, painted in both.
    const note = `(() => { const n = document.getElementById('browser-note'); return { shown: n.getClientRects().length > 0, top: Math.round(n.getBoundingClientRect().top), mb: getComputedStyle(n).marginBottom } })()`
    await w.evaluate(`(() => { const n = document.getElementById('browser-note'); n.hidden = false; n.textContent = 'x' })()`); put({ kind: 'note', lang, view, mode, panel: 'closed', ...(await w.evaluate(note)) })
    await w.click('#about-help-button'); await sleep(100); put({ kind: 'note', lang, view, mode, panel: 'open', ...(await w.evaluate(note)) })
    // A language switched with the panel open, and a reload: closed at every load.
    const other = lang === 'en-GB' ? 'ms-MY' : 'en-GB'
    await w.chooseLanguage(other === 'ms-MY' ? 'ms-MY' : 'en-GB'); await sleep(300); await step('language switched', { name: await w.evaluate(`document.getElementById('about-help-button').getAttribute('aria-label')`) })
    await w.goto(); await sleep(200); await step('after a reload')
  } catch (e) { bad++; put({ kind: 'error', lang, view, mode, error: String(e.stack ?? e).slice(0, 300) }) } finally { await w.close().catch(() => undefined) }
}
// The onset tip: open with the panel open, Escape takes the tip alone.
{
  const w = new Walk(browser, 'behaviour3/onset')
  try {
    await w.open(); await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT }); await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await setViewport(w, 'w1280'); await setMode(w, 'light'); await ready(w, 'en-GB')
    if (!(await w.evaluate(`document.getElementById('onset-help-button')?.getClientRects().length > 0`))) { await w.select('#closing-type', 'fade'); await sleep(300) }
    await w.evaluate(`document.getElementById('about-help-button').click()`); await sleep(100)
    await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Enter'); await sleep(120)
    const read = () => w.evaluate(`({ tip: !document.getElementById('onset-help').hidden, panel: !document.getElementById('about-help').hidden, focus: document.activeElement.id })`)
    put({ kind: 'onset', step: 'open', ...(await read()) }); await key(w, 'Escape'); await sleep(120); put({ kind: 'onset', step: 'Escape', ...(await read()) }); await key(w, 'Escape'); await sleep(120); put({ kind: 'onset', step: 'Escape again, focus on the onset "?"', ...(await read()) })
  } catch (e) { bad++; put({ kind: 'error', where: 'onset', error: String(e.stack ?? e).slice(0, 300) }) } finally { await w.close().catch(() => undefined) }
}
await closeAnalysis(); browser.close(); console.log('errors ' + bad); process.exit(bad ? 1 : 0)
