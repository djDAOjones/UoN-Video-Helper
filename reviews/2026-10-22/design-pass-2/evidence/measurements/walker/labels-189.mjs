// VH-189: step 4's labels. For each language, width and colour mode, with a
// file chosen: each control's visible label against its accessible name
// (2.5.3), every option's text against the room its select gives it, the
// colour segments' fit, and nothing running off the page; with Fade, the
// toggletip's words; with the no-closing type, the reason the other controls
// are locked. The "?" sits beside the label where the page's 25rem query
// holds (400 px at 16 px text) and beside the select elsewhere (the owner's
// choice); in both, Tab goes from the
// select to the "?", the tip opens under the select, and Escape closes it
// with focus back on the "?".
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node labels-189.mjs [--langs …] [--views w1280,w640,w401,w400,w375,w320] [--modes …, font32 for 200% text] [--clips]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk } from './walk.mjs'
import { QUAL_INIT, VIEWS, closeAnalysis, setViewport, setMode, key } from './qualify.mjs'
import { MX_INIT, ready } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
for (const width of [401, 400, 640]) VIEWS['w' + width] ??= { width, height: 900, deviceScaleFactor: 1, mobile: false }
const views = opt('--views', ['w1280', 'w640', 'w401', 'w400', 'w375', 'w320'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const clips = args.includes('--clips')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `labels-189-${stamp}`)
mkdirSync(dir, { recursive: true })

// Each select's options measured in the select's own font against its inner
// width less its padding (the arrow sits in the right padding); each label's
// lines; the colour segments' faces against their boxes.
const READ = String.raw`(() => { const doc = document.documentElement;
  const lines = (el) => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size; };
  const probe = document.body.appendChild(document.createElement('span')); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
  const px = (cs, text) => { for (const k of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'fontStretch']) probe.style[k] = cs[k]; probe.textContent = text; return probe.getBoundingClientRect().width; };
  const select = (id) => { const s = document.getElementById(id); const cs = getComputedStyle(s);
    const room = s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const label = document.querySelector('label[for="' + id + '"]');
    return { id, width: Math.round(s.getBoundingClientRect().width), room: Math.round(room), label: label.textContent.trim(), labelLines: lines(label),
      options: [...s.options].map((o) => { const w = px(cs, o.textContent.trim()); return { value: o.value, text: o.textContent.trim(), px: Math.round(w), fits: w <= room }; }) }; };
  const segments = [...document.querySelectorAll('#closing-colour .segment')].map((g) => { const f = g.querySelector('.segment-face'); const b = g.getBoundingClientRect();
    return { text: f.textContent.trim(), lines: lines(f), fits: f.scrollWidth <= f.clientWidth + 1 && f.getBoundingClientRect().right <= b.right + 1 }; });
  const help = document.getElementById('onset-help-button');
  return { type: select('closing-type'), onset: select('closing-onset'), segments, helpName: help.getAttribute('aria-label'), helpText: help.textContent.trim(),
    overflowX: (probe.remove(), doc.scrollWidth > doc.clientWidth) };
})()`
const TIP = `(() => { const t = document.getElementById('onset-help'); const a = document.activeElement;
  const s = document.getElementById('closing-onset').getBoundingClientRect(); const b = t.getBoundingClientRect();
  return { open: !t.hidden, text: t.innerText.replace(/\\s+/g, ' ').trim(), focus: a.id ? '#' + a.id : a.tagName.toLowerCase(), underSelect: t.hidden ? null : b.top >= s.bottom - 1 && b.left >= s.left - 1 }; })()`
// Where the "?" is, against the page's own query (25rem follows the text
// size, so at 32 px text it holds to 800 px): beside the label (its middle on the label's line, above
// the select) or beside the select (on the select's line, to its right).
const PLACE = `(() => { const box = (id) => document.getElementById(id).getBoundingClientRect(); const mid = (r) => (r.top + r.bottom) / 2;
  const b = box('onset-help-button'); const s = box('closing-onset'); const l = document.querySelector('label[for="closing-onset"]').getBoundingClientRect();
  return { narrow: matchMedia('(max-width: 25rem)').matches, besideLabel: b.bottom <= s.top + 1 && Math.abs(mid(b) - mid(l)) < b.height / 2 && b.left >= l.right, besideSelect: Math.abs(mid(b) - mid(s)) < 2 && b.left >= s.right,
    gap: Math.round(s.top - l.bottom), button: Math.round(b.width) + 'x' + Math.round(b.height) }; })()`
const LOCKS = `(() => { const said = (id) => { const e = document.getElementById(id); return e.hidden ? null : e.textContent.trim(); };
  return { none: said('closing-none-reason'), onset: said('closing-onset-reason'), result: said('closing-result'),
    disabled: ['closing-onset'].concat([...document.querySelectorAll('input[name="closing-colour"]')].map((i) => i.value)).map((x) => (document.getElementById(x) ?? document.querySelector('input[name="closing-colour"][value="' + x + '"]')).matches(':disabled')) }; })()`

// The accessible name Chrome computes, for 2.5.3.
async function axName(w, sel) {
  const { root } = await w.page.send('DOM.getDocument', { depth: 0 })
  const { nodeId } = await w.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel })
  const { nodes } = await w.page.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })
  return nodes[0]?.name?.value ?? null
}

const browser = await connectBrowser()
const out = []
for (const lang of langs) for (const view of views) for (const mode of modes) {
  const keyName = `${lang}__${view}__${mode}`
  const w = new Walk(browser, `labels-189-${stamp}/${keyName}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, 'lecture-30s.mp4')
    const r = { key: keyName, lang, view, mode, ...(await w.evaluate(READ)) }
    r.typeName = await axName(w, '#closing-type')
    r.onsetName = await axName(w, '#closing-onset')
    await w.select('#closing-type', 'fade')
    r.place = await w.evaluate(PLACE)
    await w.evaluate(`document.getElementById('closing-onset').focus()`); await key(w, 'Tab'); r.tabFromSelect = (await w.evaluate(TIP)).focus
    await key(w, 'Enter'); r.tip = await w.evaluate(TIP)
    await key(w, 'Escape'); r.escape = await w.evaluate(TIP)
    if (clips && view === 'w320' && mode === 'light') await w.clip(`step4-${lang}`, '#step-closing')
    await w.select('#closing-type', 'none')
    r.locks = await w.evaluate(LOCKS)
    r.ok = r.typeName === r.type.label && r.onsetName === r.onset.label && [r.type, r.onset].every((s) => s.options.every((o) => o.fits)) &&
      r.segments.every((g) => g.fits) && !r.overflowX && r.tip.open && r.tip.underSelect && !r.escape.open && r.escape.focus === '#onset-help-button' &&
      r.tabFromSelect === '#onset-help-button' && (r.place.narrow ? r.place.besideLabel : r.place.besideSelect) && r.locks.none && r.locks.disabled.every(Boolean)
    out.push(r)
    console.log(`${keyName}: ${r.ok ? 'ok' : 'FAIL'} type ${r.type.room}px ${r.type.options.map((o) => o.px + (o.fits ? '' : '!')).join('/')} onset ${r.onset.room}px ${r.onset.options.map((o) => o.px + (o.fits ? '' : '!')).join('/')} labels ${r.type.labelLines}/${r.onset.labelLines} ? ${r.place.besideLabel ? 'label' : r.place.besideSelect ? 'select' : 'NEITHER'} tip ${r.tip.underSelect} esc ${r.escape.focus} segs ${r.segments.map((g) => g.lines).join('/')} none "${r.locks.none}"`)
  } catch (e) { out.push({ key: keyName, error: String(e.stack ?? e).slice(0, 300) }); console.log(keyName + ' error ' + e) } finally { await w.close().catch(() => undefined) }
}
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
console.log(`${out.filter((r) => r.ok).length}/${out.length} ok — ${dir}`)
browser.close()
process.exit(out.some((r) => r.error || !r.ok) ? 1 : 0)
