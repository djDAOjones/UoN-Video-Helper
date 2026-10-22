// VH-163 design pass: the "before" captures. Drives the page with walk.mjs's
// Walk over CDP, takes a full-page PNG per state into the bundle's evidence/
// folder, and writes a design dump (computed type, box, rects, text edges)
// per state into $OUT_ROOT/../styles/ for inventory.mjs.
//
// Usage (headless Chrome already on :9222, Vite on :5173):
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out EVIDENCE=<bundle>/evidence \
//     node design-walk.mjs [run ...]      runs: en-1280 zh-1280 ms-1280 en-375 zh-375 ms-375 en-extras
//                                        en-long-320 zh-long-320 ms-long-320 (VH-165)
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, F, sleep, OUT_ROOT } from './walk.mjs'

const EVIDENCE = process.env.EVIDENCE ?? join(OUT_ROOT, 'evidence')
const PREFIX = process.env.PREFIX ?? 'before'
const STYLES = join(dirname(OUT_ROOT), 'styles')
mkdirSync(EVIDENCE, { recursive: true })
mkdirSync(STYLES, { recursive: true })
const VIDEO = process.env.VIDEO ?? 'lecture-60s.mp4'

// Every visible element: the walker's computed styles plus rects, content box,
// direct-text edges and the panel it sits in.
const DESIGN_DUMP = String.raw`(() => {
  const A = window.__audit;
  const P = ['marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','rowGap','columnGap','fontSize','lineHeight','fontWeight','fontFamily','letterSpacing','textAlign','textTransform','borderTopWidth','borderLeftWidth','color','backgroundColor','maxWidth','width','display','opacity','whiteSpace'];
  const sel = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const PANEL = 'section, fieldset, details, dialog, header, footer, .lede, .panel, .notification, .step';
  const sy = window.scrollY, sx = window.scrollX;
  // The author rules in force now (media and supports evaluated), flattened, for tracing a spacing value to its rule.
  const RULES = [];
  const flat = (list, file) => { for (const r of list) { if (r instanceof CSSStyleRule) RULES.push({ sel: r.selectorText, style: r.style, file }); else if (r instanceof CSSMediaRule) { if (matchMedia(r.media.mediaText).matches) flat(r.cssRules, file); } else if (r instanceof CSSSupportsRule) { if (CSS.supports(r.conditionText)) flat(r.cssRules, file); } else if (r.cssRules) flat(r.cssRules, file); } };
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; } const file = (sh.ownerNode && (sh.ownerNode.getAttribute('data-vite-dev-id') || sh.ownerNode.getAttribute('href'))) || sh.href || 'inline'; flat(rules, String(file).replace(/^.*\/src\//, 'src/')); }
  const SCALE = new Set([0, 2, 4, 8, 12, 16, 24, 32, 40, 48]);
  const SPACE = { marginTop: 'margin-top', marginRight: 'margin-right', marginBottom: 'margin-bottom', marginLeft: 'margin-left', paddingTop: 'padding-top', paddingRight: 'padding-right', paddingBottom: 'padding-bottom', paddingLeft: 'padding-left', rowGap: 'row-gap', columnGap: 'column-gap' };
  // Logical properties and shorthands a rule may use instead (horizontal-tb, ltr); a shorthand holding var() leaves its longhands empty in the CSSOM.
  const ALIAS = { 'margin-left': ['margin-inline-start', 'margin-inline', 'margin'], 'margin-right': ['margin-inline-end', 'margin-inline', 'margin'], 'margin-top': ['margin-block-start', 'margin-block', 'margin'], 'margin-bottom': ['margin-block-end', 'margin-block', 'margin'], 'padding-left': ['padding-inline-start', 'padding-inline', 'padding'], 'padding-right': ['padding-inline-end', 'padding-inline', 'padding'], 'padding-top': ['padding-block-start', 'padding-block', 'padding'], 'padding-bottom': ['padding-block-end', 'padding-block', 'padding'], 'row-gap': ['gap'], 'column-gap': ['gap'] };
  const trace = (el, prop) => { const hits = []; for (const r of RULES) { let v = r.style.getPropertyValue(prop); for (const alt of ALIAS[prop] || []) if (!v) v = r.style.getPropertyValue(alt); if (!v) continue; let m = false; try { m = el.matches(r.sel); } catch {} if (m) hits.push({ sel: r.sel.slice(0, 160), v: v.slice(0, 80), file: r.file, imp: r.style.getPropertyPriority(prop) === 'important' }); } if (el.style && el.style.getPropertyValue(prop)) hits.push({ sel: '[style]', v: el.style.getPropertyValue(prop), file: 'inline style' }); return hits.slice(-3); };
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    // walk.mjs's visible() counts a closed <details> itself as hidden; judge it by its summary.
    if (el.tagName === 'DETAILS' ? !A.visible(el.querySelector(':scope > summary')) : !A.visible(el)) continue;
    if (el.closest('#dev-actions, .visually-hidden')) continue;
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    // Off the page (the skip link waits above the top until focused).
    if (r.bottom + sy <= 0 || r.right + sx <= 0) continue;
    const row = { s: sel(el), tag: el.tagName.toLowerCase(), id: el.id || '', cls: typeof el.className === 'string' ? el.className.trim() : '', lang: (el.closest('[lang]') || document.documentElement).getAttribute('lang') || '' };
    row.parent = el.parentElement === document.body ? 'body' : sel(el.parentElement);
    row.region = el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : el.closest('dialog') ? 'dialog' : el.closest('main') ? 'main' : 'body';
    const chain = []; for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (p.matches(PANEL)) chain.push(sel(p));
    row.chain = chain; row.panel = chain.find((c) => /^(section|details|fieldset)[#.]/.test(c) && !/segment/.test(c)) || chain[0] || row.region;
    row.top = Math.round((r.top + sy) * 10) / 10; row.bottom = Math.round((r.bottom + sy) * 10) / 10;
    row.left = Math.round((r.left + sx) * 10) / 10; row.right = Math.round((r.right + sx) * 10) / 10; row.w = Math.round(r.width * 10) / 10; row.h = Math.round(r.height * 10) / 10;
    for (const p of P) row[p] = cs[p];
    row.gap = cs.gap;
    row.contentLeft = Math.round((r.left + sx + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft)) * 10) / 10;
    row.contentWidth = Math.round((r.width - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * 10) / 10;
    const texts = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (texts.length) {
      row.text = texts.map((n) => n.textContent.trim()).join(' ').replace(/\s+/g, ' ').slice(0, 70);
      row.textLen = texts.reduce((a, n) => a + n.textContent.trim().length, 0);
      let L = Infinity, T = Infinity, B = -Infinity, W = 0, lines = new Set();
      for (const n of texts) { const rg = document.createRange(); rg.selectNodeContents(n); for (const q of rg.getClientRects()) { if (q.width < 1) continue; L = Math.min(L, q.left + sx); T = Math.min(T, q.top + sy); B = Math.max(B, q.bottom + sy); lines.add(Math.round(q.top)); } }
      const rg = document.createRange(); rg.selectNodeContents(el); for (const q of rg.getClientRects()) W = Math.max(W, q.width);
      if (L < Infinity) { row.textLeft = Math.round(L * 10) / 10; row.textTop = Math.round(T * 10) / 10; row.textBottom = Math.round(B * 10) / 10; row.widestLine = Math.round(W * 10) / 10; row.lines = lines.size; }
    }
    row.disabled = !!(el.disabled || el.closest('fieldset:disabled'));
    const off = {}; for (const [k, prop] of Object.entries(SPACE)) { const px = parseFloat(cs[k]); if (!isNaN(px) && !SCALE.has(Math.round(Math.abs(px) * 100) / 100)) off[k] = trace(el, prop); }
    if (Object.keys(off).length) row.trace = off;
    out.push(row);
  }
  const de = document.documentElement;
  return { meta: { lang: de.lang, title: document.title, clientWidth: de.clientWidth, scrollWidth: de.scrollWidth, scrollHeight: de.scrollHeight, hscroll: de.scrollWidth > de.clientWidth, overflow: A.overflow().offenders, bodyFont: getComputedStyle(document.body).fontFamily }, els: out };
})()`

const LANG_SHORT = { 'en-GB': 'en', 'zh-Hans': 'zh', 'ms-MY': 'ms' }
let captured = 0

async function shoot(w, { width, lang, theme = '', n, state }) {
  await w.evaluate('window.scrollTo(0, 0)')
  await sleep(200)
  const name = [PREFIX, width, LANG_SHORT[lang] ?? lang, theme, String(n).padStart(2, '0'), state].filter(Boolean).join('-')
  await w.screenshot(name)
  copyFileSync(join(w.dir, name + '.png'), join(EVIDENCE, name + '.png'))
  const dump = await w.evaluate(DESIGN_DUMP)
  Object.assign(dump.meta, { name, width, langWanted: lang, theme: theme || 'light', state, view: w.view })
  writeFileSync(join(STYLES, name + '.json'), JSON.stringify(dump))
  captured++
  w.log(`captured ${name}: lang=${dump.meta.lang} ${dump.meta.clientWidth}x${dump.meta.scrollHeight}${dump.meta.hscroll ? ' HSCROLL ' + dump.meta.scrollWidth : ''} els=${dump.els.length}`)
  if (dump.meta.lang !== lang) w.log(`WARNING: wanted ${lang}, page says ${dump.meta.lang}`)
}

class DesignWalk extends Walk {
  async setView(view) {
    await super.setView(view)
    if (view === 'phone') {
      await this.page.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true, screenWidth: 375, screenHeight: 812 })
    }
  }
}

async function setLanguage(w, lang) {
  const now = await w.evaluate('document.documentElement.lang')
  if (now !== lang) {
    // The segment's label, not the visually hidden radio: as a person would.
    const sel = `#language-switcher input[value="${lang}"]`
    const ok = await w.evaluate(`!!document.querySelector(${JSON.stringify(sel)})`)
    if (!ok) throw new Error('no language radio ' + lang)
    await w.evaluate(`document.querySelector(${JSON.stringify(sel)}).closest('label').setAttribute('data-audit-target', '1')`)
    await w.click('[data-audit-target="1"]')
    await w.evaluate(`document.querySelector('[data-audit-target]').removeAttribute('data-audit-target')`)
    await sleep(500)
  }
  const after = await w.evaluate('document.documentElement.lang')
  w.log('document.documentElement.lang = ' + after)
  if (after !== lang) throw new Error('language did not switch: ' + after)
}

async function setStaff(w) {
  const staff = await w.evaluate(`document.querySelector('#video-kind input[value="staff"]').checked`)
  if (!staff) await w.click('#video-kind input[value="staff"]')
}

async function startJob(w) {
  // A phone shows "Continue anyway" (the memory warning) in Create's place first.
  const ack = await w.evaluate(`(() => { const b = document.querySelector(${JSON.stringify(w.acknowledgeButton())}); return !!b && !b.hidden; })()`)
  if (ack) { await w.click(w.acknowledgeButton()); await sleep(300) }
  await w.click(w.createButton())
  await sleep(400)
  const asked = await w.evaluate(`!!document.querySelector('#process-result .button--danger')`)
  if (asked) await w.click('#process-result .button--danger')
  await w.waitRunning()
}

async function mainRun(w, lang, width, { themes = false } = {}) {
  await w.goto()
  await setLanguage(w, lang)
  await setStaff(w)
  await sleep(300)
  const base = { width, lang }
  await shoot(w, { ...base, n: 1, state: 'empty' })
  if (themes) for (const theme of ['dark', 'forced']) { await w.setTheme(theme); await shoot(w, { ...base, theme, n: 1, state: 'empty' }); await w.setTheme('light') }
  await w.setFiles(F(VIDEO))
  await w.waitSettled()
  await sleep(500)
  await shoot(w, { ...base, n: 2, state: 'ready' })
  if (themes) for (const theme of ['dark', 'forced']) { await w.setTheme(theme); await shoot(w, { ...base, theme, n: 2, state: 'ready' }); await w.setTheme('light') }
  await startJob(w)
  try { await w.waitEncoding() } catch (e) { w.log('no encoding progress seen: ' + e.message) }
  await shoot(w, { ...base, n: 3, state: 'running' })
  await w.waitFinished()
  await shoot(w, { ...base, n: 4, state: 'finished' })
}

async function extras(w) {
  const base = { width: 1280, lang: 'en-GB' }
  await w.goto()
  await setLanguage(w, 'en-GB')
  await setStaff(w)
  await w.setFiles(F(VIDEO))
  await w.waitSettled()
  await w.click('#title-card-on')
  await sleep(400)
  await shoot(w, { ...base, n: 5, state: 'title-card' })
  await w.click('#title-card-on')
  await sleep(300)
  await w.type('#trim-start', 'abc')
  await w.press('Tab')
  await sleep(500)
  await shoot(w, { ...base, n: 6, state: 'trim-invalid' })
  await w.type('#trim-start', '0:00')
  await w.press('Tab')
  await w.waitSettled()
  await w.select('#closing-type', 'none')
  await sleep(400)
  await shoot(w, { ...base, n: 7, state: 'closing-none-disabled' })
  await w.select('#closing-type', 'cut')
  await sleep(300)
  await w.click('#system-check > summary')
  await sleep(400)
  await shoot(w, { ...base, n: 8, state: 'system-check-open' })
  await w.click('#system-check > summary')
  await w.click('#accessibility-statement > summary')
  await sleep(400)
  // Any disclosure nested inside the statement, opened too.
  await w.evaluate(`document.querySelectorAll('#accessibility-statement details:not([open])').forEach((d) => d.open = true)`)
  await sleep(200)
  await shoot(w, { ...base, n: 9, state: 'statement-open' })
}

// VH-165 (V-34): long names and a long student ID at 320 px. Each state is
// measured in light, dark and forced colours, with and without 1.4.12's
// spacing: the document's width, and every text range that runs past its own
// block or the window, which catches spill a clipped box hides from the width.
const LONG_W = 'W'.repeat(100) + '.mp4'
const LONG_UNDERSCORES = 'Lecture_Week_3_Introduction_to_Biochemistry_v2.mp4'
const LONG_ID = '9'.repeat(100)
const SPILL = String.raw`(() => {
  const de = document.documentElement, vw = de.clientWidth, out = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode()); ) {
    const el = n.parentElement;
    if (!n.textContent.trim() || !el || el.closest('#dev-actions, .visually-hidden, [hidden], select, script, style')) continue;
    let block = el; while (block.parentElement && getComputedStyle(block).display.startsWith('inline')) block = block.parentElement;
    // A box that scrolls its own content (a stack trace) is allowed to.
    let scrolls = false; for (let p = el; p && p !== document.body; p = p.parentElement) if (/auto|scroll/.test(getComputedStyle(p).overflowX)) scrolls = true;
    if (scrolls) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    let right = -Infinity; for (const q of r.getClientRects()) if (q.width > 0) right = Math.max(right, q.right);
    if (right === -Infinity) continue;
    const b = block.getBoundingClientRect(), cs = getComputedStyle(block);
    const limit = Math.min(vw, b.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight));
    if (right > limit + 1) out.push({ el: block.tagName.toLowerCase() + (block.id ? '#' + block.id : '') + (block.className ? '.' + String(block.className).split(' ')[0] : ''), right: Math.round(right), limit: Math.round(limit), text: n.textContent.trim().slice(0, 40) });
  }
  return { vw, scrollWidth: de.scrollWidth, hscroll: de.scrollWidth > vw, spill: out.length, offenders: out.slice(0, 5) };
})()`
const longResults = []

// clip: the region kept as evidence beside the 22 October v34- captures.
async function measureLong(w, lang, state, { clip } = {}) {
  for (const theme of ['light', 'dark', 'forced']) {
    for (const spaced of [false, true]) {
      await w.setTheme(theme)
      await w.spacing(spaced)
      const m = await w.evaluate(SPILL)
      longResults.push({ lang, state, theme, spaced, ...m })
      w.log(`${state} ${theme}${spaced ? ' spaced' : ''}: width ${m.scrollWidth}/${m.vw}${m.hscroll ? ' HSCROLL' : ''}, spill ${m.spill}${m.spill ? ' ' + JSON.stringify(m.offenders) : ''}`)
    }
  }
  await w.spacing(false)
  await w.setTheme('light')
  if (clip) {
    const name = `v34-320-${LANG_SHORT[lang]}-${state}-${PREFIX}`
    await w.clip(name, clip.from, { to: clip.to })
    copyFileSync(join(w.dir, name + '.png'), join(EVIDENCE, name + '.png'))
    captured++
  }
}

async function longRun(w, lang) {
  await w.setView('reflow320')
  await w.goto()
  await setLanguage(w, lang)
  await setStaff(w)
  const shot = lang === 'en-GB'
  await w.setFiles(F(LONG_W))
  await w.waitSettled()
  await measureLong(w, lang, 'ready-longname')
  await startJob(w)
  await w.waitFinished()
  await measureLong(w, lang, 'finished-longname', shot ? { clip: { from: '#process-result' } } : {})
  // Create again with the result unsaved: the discard question, not answered.
  await w.click(w.createButton())
  await sleep(500)
  await measureLong(w, lang, 'discard-longname')
  // Another file chosen: the unsaved result stays as the previous video.
  await w.setFiles(F(LONG_UNDERSCORES))
  await w.waitSettled()
  await measureLong(w, lang, 'previous-longname')
  await startJob(w)
  await w.waitFinished()
  await measureLong(w, lang, 'finished-underscores')
  await w.chooseKind('submission')
  await w.type('#submission-card-ids', LONG_ID)
  await w.press('Tab')
  await w.click(w.createButton())
  await sleep(500)
  await measureLong(w, lang, 'id-error', shot ? { clip: { from: '#submission-card-ids', to: '#submission-card-ids-error' } } : {})
}

const RUNS = {
  'en-1280': (w) => mainRun(w, 'en-GB', 1280, { themes: true }),
  'zh-1280': (w) => mainRun(w, 'zh-Hans', 1280),
  'ms-1280': (w) => mainRun(w, 'ms-MY', 1280),
  'en-375': (w) => mainRun(w, 'en-GB', 375),
  'zh-375': (w) => mainRun(w, 'zh-Hans', 375),
  'ms-375': (w) => mainRun(w, 'ms-MY', 375),
  'en-extras': extras,
  'en-long-320': (w) => longRun(w, 'en-GB'),
  'zh-long-320': (w) => longRun(w, 'zh-Hans'),
  'ms-long-320': (w) => longRun(w, 'ms-MY'),
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(RUNS)
const browser = await connectBrowser()
console.log('connected to ' + browser.version.Browser)
for (const name of names) {
  const phone = name.endsWith('375')
  const w = new DesignWalk(browser, 'design-' + name, { phone, noPicker: phone })
  await w.open()
  const t = Date.now()
  try {
    await RUNS[name](w)
    w.log(`${name} done in ${Math.round((Date.now() - t) / 1000)} s`)
  } catch (e) {
    w.log(`${name} FAILED: ` + (e.stack ?? e.message))
    try { await w.screenshot('zz-failure') } catch { /* gone */ }
  } finally {
    await w.close()
  }
}
if (longResults.length) {
  writeFileSync(join(OUT_ROOT, 'long-320.json'), JSON.stringify(longResults, null, 1))
  const bad = longResults.filter((r) => r.hscroll || r.spill)
  console.log(`long names: ${longResults.length} measurements, ${bad.length} with sideways scroll or spill`)
}
console.log('captures: ' + captured)
browser.close()
