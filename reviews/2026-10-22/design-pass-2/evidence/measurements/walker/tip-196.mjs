// VH-196: the lede's five promises and the "?" beside the fourth. For each
// language, width and colour mode, on a passing load: the five items in the
// table's words; the "?" on the fourth promise's own line, 44 px square,
// named from the table; its tip's text from the table; where Tab and
// Shift+Tab go from the "?" with the tip closed and open (it must close and
// focus go to the same place); Enter opens, Escape closes with focus on the
// "?", a click on its own text keeps it open, a click elsewhere closes it;
// the tip's edge as VH-184 drew it; nothing off the page with the tip open.
// The onset "?" is walked again by tip-184.mjs.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node tip-196.mjs [--langs …] [--views w1280,w375,w320] [--modes …] [--clips]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode, key } from './qualify.mjs'
import { MX_INIT, LANG_VALUE } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const views = opt('--views', ['w1280', 'w375', 'w320'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const clips = args.includes('--clips')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `tip-196-${stamp}`)
mkdirSync(dir, { recursive: true })

const STATE = `(() => { const a = document.activeElement; const tip = document.getElementById('format-help'); const b = document.getElementById('format-help-button');
  return { open: !tip.hidden, expanded: b.getAttribute('aria-expanded'), focus: a === document.body ? 'body' : (a.id ? '#' + a.id : a.tagName.toLowerCase() + (a.name ? '[name=' + a.name + ']' : '') + (a.value && a.type === 'radio' ? '=' + a.value : '')) }; })()`
const FOCUS_BUTTON = `document.getElementById('format-help-button').focus()`
const CLOSE = `(() => { const b = document.getElementById('format-help-button'); if (b.getAttribute('aria-expanded') === 'true') b.click(); })()`
const READ = String.raw`(() => { const M = window.__mx; const doc = document.documentElement;
  const items = [...document.querySelectorAll('.lede > ul > li')];
  const own = (li) => (li.querySelector('span') || li).childNodes[0] ? (li.querySelector('span') ? li.querySelector('span').textContent : li.textContent).replace(/\s+/g, ' ').trim() : '';
  const b = document.getElementById('format-help-button'); const span = document.querySelector('.promise-with-help > span');
  const br = b.getBoundingClientRect(); const rects = [...span.getClientRects()]; const last = rects[rects.length - 1];
  const tip = document.getElementById('format-help'); const tr = tip.getBoundingClientRect(); const li = b.closest('li').getBoundingClientRect();
  const cs = getComputedStyle(tip);
  return { promises: items.map(own), expected: [0, 1, 2, 3, 4].map((i) => M.msg('lede.promises.' + i)),
    label: b.getAttribute('aria-label'), labelExpected: M.msg('lede.formatHelp.label'),
    tipText: tip.textContent.replace(/\s+/g, ' ').trim(), tipExpected: M.msg('lede.formatHelp.text'),
    button: { w: Math.round(br.width), h: Math.round(br.height), right: Math.round(br.right) },
    // Beside the text: the button's middle within the last text line's box, or the button on the line after it.
    sameLine: br.top < last.bottom && br.bottom > last.top, buttonAfterText: br.left >= last.right - 1 || br.top >= last.bottom - 1,
    tipBox: tip.hidden ? null : { left: Math.round(tr.left), right: Math.round(tr.right), top: Math.round(tr.top), belowButton: tr.top >= br.bottom, insideItem: tr.left >= li.left - 1 && tr.right <= li.right + 1 },
    edge: [cs.borderTopWidth, cs.borderTopStyle, cs.borderLeftColor].join(' '),
    viewport: doc.clientWidth, overflowX: doc.scrollWidth > doc.clientWidth };
})()`

const browser = await connectBrowser()
const out = []
for (const lang of langs) for (const view of views) for (const mode of modes) {
  const keyName = `${lang}__${view}__${mode}`
  const w = new Walk(browser, `tip-196-${stamp}/${keyName}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await setViewport(w, view)
    await setMode(w, mode)
    await w.goto()
    if (lang !== 'en-GB') await w.chooseLanguage(LANG_VALUE[lang])
    await sleep(600)
    const r = { key: keyName, lang, view, mode, closed: await w.evaluate(READ) }
    await w.evaluate(CLOSE); await w.evaluate(FOCUS_BUTTON); await key(w, 'Tab'); r.tabClosed = await w.evaluate(STATE)
    await w.evaluate(FOCUS_BUTTON); await key(w, 'Tab', { shift: true }); r.shiftTabClosed = await w.evaluate(STATE)
    await w.evaluate(FOCUS_BUTTON); await key(w, 'Enter'); r.opened = await w.evaluate(STATE)
    r.open = await w.evaluate(READ)
    if (clips && lang === 'en-GB') await w.clip(`tip196-${view}-${mode}`, '.lede ul')
    await key(w, 'Tab'); r.tabOpen = await w.evaluate(STATE)
    await w.evaluate(CLOSE); await w.evaluate(FOCUS_BUTTON); await key(w, 'Enter'); await key(w, 'Tab', { shift: true }); r.shiftTabOpen = await w.evaluate(STATE)
    await w.evaluate(CLOSE); await w.evaluate(FOCUS_BUTTON); await key(w, 'Space'); r.space = await w.evaluate(STATE)
    await key(w, 'Escape'); r.escape = await w.evaluate(STATE)
    await w.evaluate(FOCUS_BUTTON); await key(w, 'Enter'); await w.click('#format-help p'); r.clickInside = await w.evaluate(STATE)
    await key(w, 'Escape'); r.escapeAfterClick = await w.evaluate(STATE)
    await w.evaluate(FOCUS_BUTTON); await key(w, 'Enter'); await w.click('.page-title'); r.clickOutside = await w.evaluate(STATE)
    const c = r.closed, o = r.open
    r.ok = JSON.stringify(c.promises) === JSON.stringify(c.expected) && c.label === c.labelExpected && c.tipText === c.tipExpected &&
      c.button.w >= 44 && c.button.h >= 44 && c.sameLine && c.buttonAfterText && c.button.right <= c.viewport && !c.overflowX &&
      r.opened.open && r.opened.expanded === 'true' && r.opened.focus === '#format-help-button' && o.tipBox && o.tipBox.belowButton && o.tipBox.insideItem && o.tipBox.right <= o.viewport && !o.overflowX &&
      !r.tabOpen.open && r.tabOpen.focus === r.tabClosed.focus && !r.shiftTabOpen.open && r.shiftTabOpen.focus === r.shiftTabClosed.focus &&
      r.space.open && !r.escape.open && r.escape.expanded === 'false' && r.escape.focus === '#format-help-button' && r.clickInside.open &&
      !r.escapeAfterClick.open && r.escapeAfterClick.focus === '#format-help-button' && !r.clickOutside.open
    out.push(r)
    console.log(`${keyName}: ${r.ok ? 'ok' : 'FAIL'} promises=${JSON.stringify(c.promises) === JSON.stringify(c.expected)} btn ${c.button.w}x${c.button.h} sameLine=${c.sameLine} tab ${r.tabClosed.focus}/${r.tabOpen.focus} shift ${r.shiftTabClosed.focus}/${r.shiftTabOpen.focus} space=${r.space.open} esc ${r.escape.focus} inside=${r.clickInside.open} outside=${r.clickOutside.open} tip ${JSON.stringify(o.tipBox)} edge ${o.edge} overflow ${c.overflowX}/${o.overflowX}`)
  } catch (e) { out.push({ key: keyName, error: String(e.stack ?? e).slice(0, 300) }); console.log(keyName + ' error ' + e) } finally { await w.close().catch(() => undefined) }
}
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
console.log(`${out.filter((r) => r.ok).length}/${out.length} ok — run dir: ${dir}`)
browser.close()
process.exit(out.some((r) => r.error || !r.ok) ? 1 : 0)
