// VH-229 #1: rings-179.mjs v18, copied, the title's "?" pressed first: the six cases with the panel open. The walker's own file is unchanged.
// VH-179: the readings the matrix does not take. Kept for VH-180 and VH-176,
// which repeat V-18's reading on their final words.
//   v18     the painted Choose file button's bounds in J1's first screen
//           (a fresh page, nothing scrolled), at 1280 x 900 and 320 x 568,
//           light: the button's own pixels, never the input's box, which
//           VH-179's room enlarges.
//   colours the rings' computed colours, focused by keys and then held
//           with Space: the chooser unchosen (S-03) and chosen (S-15), and
//           the language switcher's chosen face (S-03), with the face and
//           its right-hand neighbour's fills.
//   held    the chooser's ring by pixels while Space holds it down (S-03
//           unchosen, S-15 chosen): the clip at rest and unfocused against
//           the clip focused and held, counted outside the painted button
//           alone, since the press changes the button's own fill.
//
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node rings-179.mjs <v18|colours|held> [--langs en-GB,zh-Hans,ms-MY] [--modes light,dark,forced-light,forced-dark]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './walker-ln/cdp.mjs'
import { Walk, sleep } from './walker-ln/walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode, focusByKeyboard, holdKey } from './walker-ln/qualify.mjs'
import { SCENARIOS, MX_INIT, fresh } from './walker-ln/scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const what = args[0]
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `rings-179-${what}-${stamp}`)
mkdirSync(dir, { recursive: true })

async function openWalk(browser, name) {
  const w = new Walk(browser, name)
  await w.open()
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
  return w
}

// The button's painted box: the input's box drawn with and without the button, compared in page pixels.
const PAINTED = String.raw`(async () => {
  const el = document.getElementById('file-input'); const b = el.getBoundingClientRect();
  return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height, vh: innerHeight, vw: innerWidth, sy: scrollY };
})()`
// Beyond the viewport for the first screen's reading (the button may lie below it); in view otherwise.
async function shot(w, clip, beyond = true) {
  const r = await w.page.send('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 }, captureBeyondViewport: beyond })
  return r.data
}
async function paintedButton(w) {
  const box = await w.evaluate(PAINTED)
  const clip = { x: box.x, y: box.y, width: box.w, height: box.h }
  await w.page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
  await sleep(150)
  const on = await shot(w, clip)
  await w.evaluate(`(() => { const s = document.createElement('style'); s.id = '__r179'; s.textContent = '#file-input::file-selector-button { visibility: hidden !important; }'; document.head.append(s); })()`)
  await sleep(150)
  const off = await shot(w, clip)
  await w.evaluate(`document.getElementById('__r179')?.remove()`)
  const a = await w.browser.newPage()
  try {
    const p = await a.evaluate(`(async () => {
      const load = async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
      const [A, B] = await Promise.all([${JSON.stringify(on)}, ${JSON.stringify(off)}].map(load));
      let l = A.width, r = -1, t = A.height, b = -1;
      for (let i = 0; i < A.data.length; i += 4) if (A.data[i] !== B.data[i] || A.data[i + 1] !== B.data[i + 1] || A.data[i + 2] !== B.data[i + 2]) { const p = i / 4, x = p % A.width, y = (p - x) / A.width; l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); }
      return r < 0 ? null : { x: l, y: t, w: r - l + 1, h: b - t + 1 };
    })()`)
    if (!p) return { input: box, painted: null }
    // At scroll 0 the page's y is the first screen's y.
    const top = Math.round(box.y + p.y), bottom = Math.round(box.y + p.y + p.h)
    return { input: { top: Math.round(box.y), bottom: Math.round(box.y + box.h), left: Math.round(box.x), height: Math.round(box.h) }, painted: { top, bottom, left: Math.round(box.x + p.x), width: p.w, height: p.h }, firstScreen: box.vh, insideFirstScreen: bottom <= box.vh, scrolled: box.sy }
  } finally { await a.close() }
}

// The ring while Space holds the chooser down: changed pixels at 3:1 outside the painted button.
async function heldRing(w) {
  const m = 12
  const box = await w.evaluate(`(() => { const el = document.getElementById('file-input'); el.scrollIntoView({ block: 'center' }); const b = el.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; })()`)
  const clip = { x: box.x - m, y: box.y - m, width: box.w + 2 * m, height: box.h + 2 * m }
  await w.page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
  await w.evaluate(`(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); })()`)
  await sleep(150)
  const rest = await shot(w, clip, false)
  await w.evaluate(`(() => { const s = document.createElement('style'); s.id = '__r179'; s.textContent = '#file-input::file-selector-button { visibility: hidden !important; }'; document.head.append(s); })()`)
  await sleep(150)
  const hidden = await shot(w, clip, false)
  await w.evaluate(`document.getElementById('__r179')?.remove()`)
  // The click a release makes is swallowed, so measuring the press never opens the chooser.
  await w.evaluate(`(() => { const stop = (e) => { e.preventDefault(); e.stopImmediatePropagation(); }; window.__r179stop = stop; window.addEventListener('click', stop, true); })()`)
  let held
  try {
    await focusByKeyboard(w, '#file-input')
    await sleep(150)
    held = await holdKey(w, 'Space', async () => ({ shot: await shot(w, clip, false), state: await w.evaluate(`(() => { const el = document.getElementById('file-input'); return { active: el.matches(':active'), focusVisible: el.matches(':focus-visible') }; })()`) }))
  } finally {
    await w.evaluate(`(() => { window.removeEventListener('click', window.__r179stop, true); const a = document.activeElement; if (a && a !== document.body) a.blur(); })()`)
  }
  const a = await w.browser.newPage()
  try {
    const r = await a.evaluate(`(async () => {
      const load = async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
      const L = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const K = (la, lb) => (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
      const [R, H, P] = await Promise.all([${JSON.stringify(rest)}, ${JSON.stringify(hidden)}, ${JSON.stringify(held.shot)}].map(load));
      let l = R.width, rr = -1, t = R.height, b = -1;
      for (let i = 0; i < R.data.length; i += 4) if (R.data[i] !== H.data[i] || R.data[i + 1] !== H.data[i + 1] || R.data[i + 2] !== H.data[i + 2]) { const p = i / 4, x = p % R.width, y = (p - x) / R.width; l = Math.min(l, x); rr = Math.max(rr, x); t = Math.min(t, y); b = Math.max(b, y); }
      if (rr < 0) return null;
      let ring = 0, best = 1;
      for (let i = 0; i < R.data.length; i += 4) { const p = i / 4, x = p % R.width, y = (p - x) / R.width; if (x >= l && x <= rr && y >= t && y <= b) continue;
        const k = K(L(R.data[i], R.data[i + 1], R.data[i + 2]), L(P.data[i], P.data[i + 1], P.data[i + 2])); if (k >= 3) ring++; if (k > best) best = k; }
      return { button: { w: rr - l + 1, h: b - t + 1 }, ringAt3to1: ring, best: Math.round(best * 100) / 100 };
    })()`)
    if (!r) return { outcome: 'cannot-determine', why: 'the button paints nothing to measure' }
    const perimeter = 4 * (r.button.w + r.button.h) - 16
    return { ...held.state, button: r.button, ringAt3to1: r.ringAt3to1, perimeter2px: perimeter, best: r.best, outcome: !held.state.active ? 'cannot-determine' : r.ringAt3to1 >= perimeter ? 'pass' : 'fail' }
  } finally { await a.close() }
}

const RING = (sel, pseudo) => String.raw`(() => {
  const el = document.querySelector(${JSON.stringify(sel)});
  const face = ${pseudo ? 'el' : 'el.nextElementSibling'};
  const c = getComputedStyle(face, ${pseudo ? JSON.stringify(pseudo) : 'null'});
  const n = el.closest('.segment')?.nextElementSibling?.querySelector('.segment-face');
  return { focusVisible: el.matches(':focus-visible'), active: el.matches(':active'), outline: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor, offset: c.outlineOffset, face: c.backgroundColor, border: c.borderTopColor, text: c.color, neighbour: n ? getComputedStyle(n).backgroundColor : undefined, forcedColors: matchMedia('(forced-colors: active)').matches };
})()`

const browser = await connectBrowser()
const out = []
if (what === 'v18') {
  for (const view of ['w1280', 'w320']) for (const lang of langs) {
    const key = `v18__${lang}__${view}`
    const w = await openWalk(browser, `rings-179-${stamp}/${key}`)
    try {
      await setViewport(w, view)
      await setMode(w, 'light')
      await fresh(w, lang)
      await w.evaluate(`(() => { const b = document.getElementById('about-help-button'); if (b && b.getAttribute('aria-expanded') === 'false') b.click() })()`)
      await w.evaluate('window.scrollTo(0, 0)')
      await sleep(300)
      const r = { key, lang, view, panelOpen: await w.evaluate(`!!document.getElementById('about-help')?.getClientRects().length`), ...(await paintedButton(w)) }
      out.push(r)
      console.log(`${key}: painted ${r.painted?.top}–${r.painted?.bottom} px of ${r.firstScreen} (${r.insideFirstScreen ? 'inside' : 'below'}); input box ${r.input.top}–${r.input.bottom}`)
    } catch (e) { out.push({ key, error: String(e.stack ?? e).slice(0, 300) }); console.log(key + ' error ' + e) } finally { await w.close().catch(() => undefined) }
  }
} else if (what === 'colours') {
  const cases = [
    { id: 'S-03', subject: 'chooser unchosen', sel: '#file-input', pseudo: '::file-selector-button' },
    { id: 'S-03', subject: 'band, chosen face', sel: '#language-switcher input:checked' },
    { id: 'S-15', subject: 'chooser chosen', sel: '#file-input', pseudo: '::file-selector-button' },
  ]
  for (const id of ['S-03', 'S-15']) for (const lang of langs) {
    const w = await openWalk(browser, `rings-179-${stamp}/${id}-${lang}`)
    try {
      await setViewport(w, 'w1280')
      await SCENARIOS[id].setup(w, lang)
      for (const mode of modes) {
        await setMode(w, mode)
        for (const c of cases.filter((x) => x.id === id)) {
          const key = `${id}__${lang}__${mode}__${c.subject.replace(/[^a-z]+/g, '-')}`
          await focusByKeyboard(w, c.sel)
          const focused = await w.evaluate(RING(c.sel, c.pseudo))
          // Held with Space: the press, the ring kept. The band's radio takes no press.
          const held = c.pseudo ? await holdKey(w, 'Space', () => w.evaluate(RING(c.sel, c.pseudo))) : undefined
          await w.evaluate(`(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); })()`)
          const r = { key, id, lang, mode, subject: c.subject, focused, held }
          out.push(r)
          console.log(`${key}: ${focused.outline} offset ${focused.offset} on ${focused.face}${focused.neighbour ? ' beside ' + focused.neighbour : ''}${held ? ' | held ' + held.outline + ' on ' + held.face + (held.active ? '' : ' (not :active)') : ''}`)
        }
      }
    } catch (e) { out.push({ id, lang, error: String(e.stack ?? e).slice(0, 300) }); console.log(id + ' ' + lang + ' error ' + e) } finally { await w.close().catch(() => undefined) }
  }
} else if (what === 'held') {
  for (const id of ['S-03', 'S-15']) for (const lang of langs) {
    const w = await openWalk(browser, `rings-179-${stamp}/held-${id}-${lang}`)
    try {
      await setViewport(w, 'w1280')
      await SCENARIOS[id].setup(w, lang)
      for (const mode of [...modes, 'font32']) {
        await setMode(w, mode)
        const key = `${id}__${lang}__${mode}__held`
        const r = { key, id, lang, mode, ...(await heldRing(w)) }
        out.push(r)
        console.log(`${key}: ${r.outcome} ${r.ringAt3to1} / ${r.perimeter2px} px² (best ${r.best}) active ${r.active} focus-visible ${r.focusVisible}`)
      }
    } catch (e) { out.push({ id, lang, error: String(e.stack ?? e).slice(0, 300) }); console.log(id + ' ' + lang + ' error ' + e) } finally { await w.close().catch(() => undefined) }
  }
} else throw new Error('v18, colours or held')
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
console.log('run dir: ' + dir)
browser.close()
process.exit(0)
