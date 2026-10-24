// VH-184: the onset toggletip. For each language, width and colour mode,
// with a file chosen and Fade set: where Tab and Shift+Tab go from the "?"
// with the tip closed, then with it open (it must close and focus go to the
// same place); Escape (closes, focus on the "?"); a click on its own text
// (stays open); a click elsewhere (closes). Then its edge: colour, width and
// style on each side, against the tip's ground and the ground around it.
//
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node tip-184.mjs [--langs …] [--views w1280,w375,w320] [--modes …] [--clips]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode, key } from './qualify.mjs'
import { MX_INIT, ready } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const views = opt('--views', ['w1280', 'w375', 'w320'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const clips = args.includes('--clips')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `tip-184-${stamp}`)
mkdirSync(dir, { recursive: true })

const STATE = `(() => { const a = document.activeElement; const tip = document.getElementById('onset-help'); const b = document.getElementById('onset-help-button');
  return { open: !tip.hidden, expanded: b.getAttribute('aria-expanded'), focus: a === document.body ? 'body' : (a.id ? '#' + a.id : a.tagName.toLowerCase() + (a.name ? '[name=' + a.name + ']' : '') + (a.value && a.type === 'radio' ? '=' + a.value : '')) }; })()`
const FOCUS_BUTTON = `document.getElementById('onset-help-button').focus()`
const CLOSE = `(() => { const b = document.getElementById('onset-help-button'); if (b.getAttribute('aria-expanded') === 'true') b.click(); })()`
// The edge as drawn: each side's width, style and colour; the tip's ground
// and the first opaque ground behind it; the contrast of the edge with each.
const EDGE = String.raw`(() => {
  const tip = document.getElementById('onset-help'); const cs = getComputedStyle(tip);
  const rgb = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 } };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) };
  const ratio = (x, y) => { const a = lum(rgb(x)), b = lum(rgb(y)); return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100 };
  let el = tip.parentElement; let around = 'rgb(255, 255, 255)';
  while (el) { const bg = getComputedStyle(el).backgroundColor; if (rgb(bg).a > 0) { around = bg; break } el = el.parentElement }
  const sides = ['Top', 'Right', 'Bottom', 'Left'].map((s) => ({ side: s, width: cs['border' + s + 'Width'], style: cs['border' + s + 'Style'], color: cs['border' + s + 'Color'] }));
  return { sides, ground: cs.backgroundColor, around, vsGround: ratio(sides[3].color, cs.backgroundColor), vsAround: ratio(sides[3].color, around), text: ratio(cs.color, cs.backgroundColor) };
})()`

const browser = await connectBrowser()
const out = []
for (const lang of langs) for (const view of views) for (const mode of modes) {
  const keyName = `${lang}__${view}__${mode}`
  const w = new Walk(browser, `tip-184-${stamp}/${keyName}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, 'lecture-30s.mp4')
    await w.select('#closing-type', 'fade')
    const r = { key: keyName, lang, view, mode }
    // Where Tab and Shift+Tab go with the tip closed: the reference.
    await w.evaluate(CLOSE); await w.evaluate(FOCUS_BUTTON); await key(w, 'Tab'); r.tabClosed = await w.evaluate(STATE)
    await w.evaluate(FOCUS_BUTTON); await key(w, 'Tab', { shift: true }); r.shiftTabClosed = await w.evaluate(STATE)
    // Open by Enter, then Tab.
    await w.evaluate(FOCUS_BUTTON); await key(w, 'Enter'); r.opened = await w.evaluate(STATE)
    await key(w, 'Tab'); r.tabOpen = await w.evaluate(STATE)
    // Open, then Shift+Tab.
    await w.evaluate(CLOSE); await w.evaluate(FOCUS_BUTTON); await key(w, 'Enter'); await key(w, 'Tab', { shift: true }); r.shiftTabOpen = await w.evaluate(STATE)
    // Open, Escape.
    await w.evaluate(CLOSE); await w.evaluate(FOCUS_BUTTON); await key(w, 'Enter'); await key(w, 'Escape'); r.escape = await w.evaluate(STATE)
    // Open, a click on its own text, then Escape (focus back to the "?").
    await w.evaluate(FOCUS_BUTTON); await key(w, 'Enter'); await w.click('#onset-help p')
    r.clickInside = await w.evaluate(STATE)
    r.edge = await w.evaluate(EDGE)
    if (clips && view === 'w1280') await w.clip(`tip-${mode}`, '#onset-help-button', { to: '#onset-help' })
    await key(w, 'Escape'); r.escapeAfterClick = await w.evaluate(STATE)
    // Open, a click on the step's heading.
    await w.evaluate(FOCUS_BUTTON); await key(w, 'Enter'); await w.click('#closing-colour legend'); r.clickOutside = await w.evaluate(STATE)
    r.ok = r.opened.open && !r.tabOpen.open && r.tabOpen.focus === r.tabClosed.focus && !r.shiftTabOpen.open && r.shiftTabOpen.focus === r.shiftTabClosed.focus &&
      !r.escape.open && r.escape.focus === '#onset-help-button' && r.clickInside.open && !r.escapeAfterClick.open && r.escapeAfterClick.focus === '#onset-help-button' && !r.clickOutside.open &&
      r.edge.sides.every((s) => s.style === 'solid' && s.width === r.edge.sides[0].width) && r.edge.vsGround >= 3 && r.edge.vsAround >= 3
    out.push(r)
    console.log(`${keyName}: ${r.ok ? 'ok' : 'FAIL'} tab ${r.tabClosed.focus}/${r.tabOpen.focus} open=${r.tabOpen.open} shift ${r.shiftTabClosed.focus}/${r.shiftTabOpen.focus} open=${r.shiftTabOpen.open} esc ${r.escape.focus} inside=${r.clickInside.open} outside=${r.clickOutside.open} edge ${r.edge.sides.map((s) => s.width + ' ' + s.style).join(',')} ${r.edge.sides[3].color} ${r.edge.vsGround}/${r.edge.vsAround}`)
  } catch (e) { out.push({ key: keyName, error: String(e.stack ?? e).slice(0, 300) }); console.log(keyName + ' error ' + e) } finally { await w.close().catch(() => undefined) }
}
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
console.log('run dir: ' + dir)
browser.close()
process.exit(out.some((r) => r.error || !r.ok) ? 1 : 0)
