// The audit walker: headless Chrome over CDP, driven as a person would drive
// the page. Usage: node walk.mjs <scenario> [more scenarios]
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Buffer } from 'node:buffer'
import { connectBrowser } from './cdp.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const SCRATCH = dirname(HERE)
const FIX = join(SCRATCH, 'fixtures')
const OUT_ROOT = join(SCRATCH, 'out')
const URL_BASE = process.env.APP_URL ?? 'http://localhost:5173/'
const F = (name) => join(FIX, name)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// In-page helpers, installed before every document.
const PAGE_INIT = String.raw`
(() => {
  const A = (window.__audit = { live: [], focus: [], titles: [], errors: [], saves: [], boot: {}, t0: performance.now() });
  const now = () => Math.round(performance.now() - A.t0);
  const desc = (el) => {
    if (!el) return 'none';
    if (el === document.body) return 'body';
    const id = el.id ? '#' + el.id : '';
    const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
    let name = el.getAttribute('aria-label') || '';
    if (!name && el.getAttribute('aria-labelledby')) name = el.getAttribute('aria-labelledby').split(/\s+/).map((i) => (document.getElementById(i) || {}).innerText || '').join(' ');
    if (!name && el.labels && el.labels.length) name = el.labels[0].innerText || '';
    if (!name) name = (el.innerText || el.value || '').trim();
    name = name.replace(/\s+/g, ' ').slice(0, 70);
    const extra = el.type ? '[' + el.type + (el.name ? ' ' + el.name : '') + (el.type === 'radio' && el.value ? '=' + el.value : '') + ']' : '';
    return el.tagName.toLowerCase() + id + cls + extra + ' "' + name + '"';
  };
  A.desc = desc;
  const liveOf = (node) => { const el = node.nodeType === 1 ? node : node.parentElement; return el && el.closest('[aria-live],[role="status"],[role="alert"],[role="log"]'); };
  const mo = new MutationObserver((muts) => {
    const seen = new Set();
    for (const m of muts) {
      const r = liveOf(m.target); if (!r || seen.has(r)) continue; seen.add(r);
      const text = (r.innerText || r.textContent || '').replace(/\s+/g, ' ').trim();
      const region = r.id ? '#' + r.id : r.tagName.toLowerCase() + (r.className ? '.' + String(r.className).split(/\s+/)[0] : '');
      let last = null; for (let i = A.live.length - 1; i >= 0; i--) if (A.live[i].region === region) { last = A.live[i]; break; }
      if (last && last.text === text) continue;
      A.live.push({ t: now(), region, hidden: !!(r.closest('.visually-hidden') || r.hidden), text });
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    A.boot.langAtDCL = document.documentElement.lang;
    A.boot.h1AtDCL = (document.querySelector('h1') || {}).textContent;
    A.boot.tDCL = now();
    mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
    const s = document.createElement('style'); s.id = '__audit-hide-dev'; s.textContent = '#dev-actions{display:none !important}'; document.head.append(s);
    const te = document.querySelector('title');
    if (te) new MutationObserver(() => { const t = document.title; const l = A.titles[A.titles.length - 1]; if (!l || l.title !== t) A.titles.push({ t: now(), title: t }); }).observe(te, { childList: true, characterData: true, subtree: true });
    new MutationObserver(() => { A.boot.langChanges = (A.boot.langChanges || []); A.boot.langChanges.push({ t: now(), lang: document.documentElement.lang }); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  });
  document.addEventListener('focusin', (e) => A.focus.push({ t: now(), el: desc(e.target) }));
  window.addEventListener('error', (e) => A.errors.push({ t: now(), message: e.message }));
  if (window.__auditNoPicker) {
    // A phone's Chrome has no save dialog: the page takes the download route.
    window.showSaveFilePicker = undefined;
  } else {
    window.showSaveFilePicker = async (options) => {
      const name = options && options.suggestedName ? options.suggestedName : 'video.mp4';
      A.saves.push({ t: now(), name });
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle('audit-saves', { create: true });
      return dir.getFileHandle(name, { create: true });
    };
  }
  const visible = (el) => { if (!el || !el.getBoundingClientRect) return false; const r = el.getBoundingClientRect(); if (r.width === 0 && r.height === 0) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return false; if (el.closest('.visually-hidden')) return false; if (el.closest('[hidden]')) return false;
    for (let d = el.closest('details:not([open])'); d; d = d.parentElement && d.parentElement.closest('details:not([open])')) { const s = d.querySelector(':scope > summary'); if (!s || !s.contains(el)) return false; }
    return true; };
  A.visible = visible;
  A.visibleText = (root) => { root = root || document.body; const s = document.createElement('style'); s.textContent = '.visually-hidden{display:none !important}'; document.head.append(s); try { return (root.innerText || '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(); } finally { s.remove(); } };
  const INTERACTIVE = 'button, a[href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), video';
  A.targets = () => Array.from(document.querySelectorAll(INTERACTIVE)).filter(visible).map((el) => {
    const r = el.getBoundingClientRect(); let via = '';
    if ((el.type === 'radio' || el.type === 'checkbox') && el.labels && el.labels[0]) { const lr = el.labels[0].getBoundingClientRect(); via = Math.round(lr.width) + 'x' + Math.round(lr.height); }
    const p = el.parentElement; const inline = el.tagName === 'A' && p && (p.innerText || '').trim().length > (el.innerText || '').trim().length + 2;
    return { el: desc(el), w: Math.round(r.width), h: Math.round(r.height), labelBox: via, inline, disabled: !!el.disabled };
  });
  const parse = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = (el) => { let e = el; let acc = null; while (e && e.nodeType === 1) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { if (c.a >= 1) return acc ? over(acc, c) : c; acc = acc ? over(acc, c) : c; } e = e.parentElement; } const w = { r: 255, g: 255, b: 255, a: 1 }; return acc ? over(acc, w) : w; };
  A.contrast = () => { const out = []; const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; const seen = new Set();
    while ((n = walker.nextNode())) { const el = n.parentElement; if (!el || !n.textContent.trim() || seen.has(el) || !visible(el)) continue; seen.add(el);
      const cs = getComputedStyle(el); const fg = parse(cs.color); if (!fg) continue; const bg = bgOf(el); const f = fg.a < 1 ? over(fg, bg) : fg;
      const L1 = lum(f), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight, 10) >= 700; const large = size >= 24 || (bold && size >= 18.66);
      out.push({ el: desc(el).slice(0, 70), text: n.textContent.trim().slice(0, 36), fg: cs.color, bg: 'rgb(' + Math.round(bg.r) + ', ' + Math.round(bg.g) + ', ' + Math.round(bg.b) + ')', ratio: Math.round(ratio * 100) / 100, size: Math.round(size * 10) / 10, bold, large, need: large ? 4.5 : 7 }); }
    return out; };
  A.lineLengths = () => { const out = []; const probe = document.createElement('span'); probe.textContent = 'the quick brown fox jumps over the lazy dog and runs away 0123456789 then again'; probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:0;top:0';
    for (const el of document.querySelectorAll('p, li, dd, dt, label, legend, summary, h1, h2, h3')) { if (!visible(el)) continue; const text = (el.innerText || '').trim(); if (text.length < 25) continue;
      el.append(probe); const cs = getComputedStyle(el); const avg = probe.getBoundingClientRect().width / probe.textContent.length; probe.remove();
      const range = document.createRange(); range.selectNodeContents(el); const rects = Array.from(range.getClientRects()).filter((r) => r.width > 1); const widest = Math.max(0, ...rects.map((r) => r.width)); const cjk = /[\u3000-\u9fff]/.test(text);
      out.push({ el: desc(el).slice(0, 56), text: text.slice(0, 30), widestPx: Math.round(widest), chars: Math.round(cjk ? widest / parseFloat(cs.fontSize) : widest / avg), cjk, lineHeight: cs.lineHeight, fontSize: cs.fontSize, width: Math.round(el.getBoundingClientRect().width) }); }
    return out; };
  A.overflow = () => { const w = document.documentElement.clientWidth; const bad = []; for (const el of document.querySelectorAll('body *')) { if (!visible(el)) continue; const r = el.getBoundingClientRect(); if (r.right > w + 1 || r.left < -1) bad.push({ el: desc(el).slice(0, 80), left: Math.round(r.left), right: Math.round(r.right) }); } return { clientWidth: w, scrollWidth: document.documentElement.scrollWidth, hscroll: document.documentElement.scrollWidth > w, offenders: bad.slice(0, 25) }; };
  A.focusInfo = () => { const el = document.activeElement; if (!el || el === document.body) return { el: 'body' }; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const vis = el.matches(':focus-visible');
    const corners = [[r.left + 2, r.top + 2], [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2], [(r.left + r.right) / 2, (r.top + r.bottom) / 2]];
    const ownLabel = el.closest('label');
    const obscured = corners.filter(([x, y]) => { const hit = document.elementFromPoint(x, y); return hit && hit !== el && !el.contains(hit) && !hit.contains(el) && !(ownLabel && hit.closest('label') === ownLabel); }).map(([x, y]) => desc(document.elementFromPoint(x, y)).slice(0, 40));
    const inView = r.top >= 0 && r.bottom <= window.innerHeight;
    return { el: desc(el), focusVisible: vis, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, offset: cs.outlineOffset, boxShadow: cs.boxShadow === 'none' ? '' : cs.boxShadow.slice(0, 60), w: Math.round(r.width), h: Math.round(r.height), inView, obscured, disabled: !!el.disabled }; };
  A.rect = (sel) => { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!el) return null; el.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = el.getBoundingClientRect(); return { x: Math.round((r.left + r.width / 2) * 10) / 10, y: Math.round((r.top + r.height / 2) * 10) / 10, w: r.width, h: r.height, left: r.left, top: r.top }; };
  A.ax = () => Array.from(document.querySelectorAll(INTERACTIVE + ', [role], h1, h2, h3, fieldset, legend, [aria-live], dialog')).filter(visible).map((el) => ({ el: desc(el).slice(0, 90), role: el.getAttribute('role') || el.tagName.toLowerCase(), lang: (el.closest('[lang]') || {}).getAttribute ? el.closest('[lang]').getAttribute('lang') : null, expanded: el.getAttribute('aria-expanded'), describedby: el.getAttribute('aria-describedby'), invalid: el.getAttribute('aria-invalid'), disabled: el.disabled || el.getAttribute('aria-disabled') || null, checked: el.checked, required: el.required || null }));
  // The design pass (VH-143): every visible element's computed lengths, type and colours, pseudo-elements included, for the token sweep (tokens.mjs).
  const STYLE_PROPS = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap', 'fontSize', 'lineHeight', 'fontWeight', 'fontFamily', 'letterSpacing', 'textAlign', 'textTransform', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopStyle', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'color', 'backgroundColor', 'borderTopColor', 'borderBottomColor', 'outlineWidth', 'outlineOffset', 'outlineColor', 'outlineStyle', 'minHeight', 'minWidth', 'maxWidth', 'display', 'opacity'];
  A.styles = () => { const out = []; for (const el of document.querySelectorAll('body *')) { if (!visible(el)) continue; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); const langEl = el.closest('[lang]'); const row = { el: desc(el).slice(0, 90), tag: el.tagName.toLowerCase(), cls: typeof el.className === 'string' ? el.className.trim() : '', lang: langEl ? langEl.getAttribute('lang') : '', band: !!el.closest('.on-brand-blue'), w: Math.round(r.width), h: Math.round(r.height) }; for (const p of STYLE_PROPS) row[p] = cs[p]; for (const pe of ['::before', '::after']) { const ps = getComputedStyle(el, pe); if (ps.content && ps.content !== 'none' && ps.content !== 'normal') { const q = { width: ps.width, height: ps.height, content: ps.content.slice(0, 20) }; for (const p of STYLE_PROPS) q[p] = ps[p]; row[pe] = q; } } out.push(row); } return out; };
  A.headings = () => Array.from(document.querySelectorAll('h1,h2,h3,h4')).filter(visible).map((h) => h.tagName + ' ' + (h.innerText || '').trim().slice(0, 60));
})();
`

const SPACING_CSS = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`

// ---------------------------------------------------------------------------
const KEYS = {
  Tab: { key: 'Tab', code: 'Tab', vk: 9 },
  Enter: { key: 'Enter', code: 'Enter', vk: 13, text: '\r' },
  Space: { key: ' ', code: 'Space', vk: 32, text: ' ' },
  Escape: { key: 'Escape', code: 'Escape', vk: 27 },
  ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', vk: 39 },
  ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', vk: 37 },
  ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', vk: 40 },
  ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', vk: 38 },
  Home: { key: 'Home', code: 'Home', vk: 36 },
  End: { key: 'End', code: 'End', vk: 35 },
  PageUp: { key: 'PageUp', code: 'PageUp', vk: 33 },
  PageDown: { key: 'PageDown', code: 'PageDown', vk: 34 },
  Backspace: { key: 'Backspace', code: 'Backspace', vk: 8 },
}

const lateScenarios = {}
lateScenarios['staff-card'] = async (w) => {
  await w.goto()
  await w.setFiles(F('lecture-60s.mp4'))
  await w.waitSettled()
  await w.click('#title-card-on')
  await sleep(300)
  await w.capture('01-card-on-date-filled', { measure: true })
  const dateValue = await w.evaluate(`document.getElementById('title-card-date').value`)
  w.log('date filled on tick: ' + JSON.stringify(dateValue))
  // nothing typed: Create
  await w.click(w.createButton())
  await sleep(600)
  const started = await w.evaluate(`(() => { const t = document.getElementById('process-progress-text'); return t && !t.hidden && t.textContent.trim().length > 0; })()`)
  w.log('Create with only the filled date: job started = ' + started)
  if (started) {
    await w.waitFinished()
    await w.capture('02-date-only-card-finished', { measure: true })
    await w.click(w.saveButton())
    await w.waitSaved()
  }
  // the date cleared: Create refuses
  await w.evaluate(`(() => { const el = document.getElementById('title-card-date'); el.focus(); el.select(); })()`)
  await w.press('Backspace')
  await w.press('Tab')
  await sleep(300)
  await w.capture('03-card-on-date-cleared', { measure: true })
  await w.click(w.createButton())
  await sleep(600)
  await w.capture('04-card-refused-empty', { walk: true, measure: true })
  await w.matrix('04-card-refused-empty')
  // a title typed long enough to fill its field
  await w.type('#title-card-title', 'A title typed long enough to run past the limit the card can hold at its smallest size, and then some more words to be sure it is cut off here')
  await sleep(300)
  await w.capture('05-title-full', { measure: true })
  await w.type('#title-card-title', 'Introduction to the module')
  await w.type('#title-card-department', 'School of Audits')
  await w.type('#title-card-authors', 'A. Author')
  await w.press('Tab')
  await sleep(300)
  await w.capture('06-card-filled', { walk: true, measure: true })
  await w.matrix('06-card-filled')
  await w.click(w.createButton())
  await sleep(300)
  const asked = await w.evaluate(`!!document.querySelector('#process-result .button--danger')`)
  if (asked) await w.click('#process-result .button--danger')
  await w.waitRunning()
  await w.waitFinished()
  await w.capture('07-card-finished', { measure: true })
  // untick keeps the words
  await w.click('#title-card-on')
  await sleep(200)
  await w.capture('08-card-off', { measure: true })
  await w.click('#title-card-on')
  await sleep(200)
  const kept = await w.evaluate(`document.getElementById('title-card-title').value`)
  w.log('title kept after untick and tick: ' + JSON.stringify(kept))
}

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36'

class Walk {
  constructor(browser, name, { phone = false, noPicker = false } = {}) {
    this.browser = browser
    this.name = name
    this.phone = phone
    this.noPicker = noPicker
    this.dir = join(OUT_ROOT, name)
    mkdirSync(this.dir, { recursive: true })
    this.logPath = join(this.dir, 'log.txt')
    writeFileSync(this.logPath, '')
    this.media = { theme: 'light', pointer: phone ? 'coarse' : 'fine' }
    this.liveIndex = 0
    this.view = phone ? 'phone' : 'desktop'
  }
  log(line) {
    const stamp = new Date().toISOString().slice(11, 19)
    appendFileSync(this.logPath, `${stamp} ${line}\n`)
    console.log(`${stamp} ${line}`)
  }
  async open() {
    const page = (this.page = await this.browser.newPage())
    await page.send('Page.enable')
    await page.send('Runtime.enable')
    await page.send('DOM.enable')
    page.on('Runtime.consoleAPICalled', (e) => {
      if (e.type === 'error' || e.type === 'warning')
        this.log(`console.${e.type}: ${e.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300)}`)
    })
    page.on('Runtime.exceptionThrown', (e) =>
      this.log('exception: ' + (e.exceptionDetails.exception?.description ?? e.exceptionDetails.text).slice(0, 300)),
    )
    await page.send('Page.addScriptToEvaluateOnNewDocument', {
      source: (this.noPicker ? 'window.__auditNoPicker = true;\n' : '') + PAGE_INIT,
    })
    const downloads = join(this.dir, 'downloads')
    mkdirSync(downloads, { recursive: true })
    await this.browser.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloads,
      browserContextId: page.contextId,
    })
    await this.setView(this.view)
  }
  async setView(view) {
    this.view = view
    const p = this.page
    const views = {
      desktop: { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false },
      phone: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 },
      reflow320: { width: 320, height: 568, deviceScaleFactor: 1, mobile: false },
      zoom200: { width: 640, height: 450, deviceScaleFactor: 2, mobile: false },
    }
    const m = views[view] ?? views.desktop
    await p.send('Emulation.setDeviceMetricsOverride', m)
    const phone = view === 'phone'
    await p.send('Emulation.setTouchEmulationEnabled', { enabled: phone, maxTouchPoints: phone ? 5 : 1 })
    if (phone) {
      await p.send('Emulation.setUserAgentOverride', {
        userAgent: MOBILE_UA,
        platform: 'Linux armv8l',
        userAgentMetadata: {
          brands: [{ brand: 'Chromium', version: '155' }, { brand: 'Google Chrome', version: '155' }],
          fullVersionList: [{ brand: 'Chromium', version: '155.0.8059.85' }, { brand: 'Google Chrome', version: '155.0.8059.85' }],
          platform: 'Android',
          platformVersion: '14',
          architecture: '',
          model: 'Pixel 8',
          mobile: true,
        },
      })
    }
    this.media.pointer = phone ? 'coarse' : 'fine'
    await this.applyMedia()
  }
  async applyMedia() {
    const features = [
      { name: 'prefers-color-scheme', value: this.media.theme === 'dark' || this.media.theme === 'forced' ? 'dark' : 'light' },
      { name: 'pointer', value: this.media.pointer },
      { name: 'hover', value: this.media.pointer === 'coarse' ? 'none' : 'hover' },
      { name: 'forced-colors', value: this.media.theme === 'forced' ? 'active' : 'none' },
      { name: 'prefers-reduced-motion', value: 'no-preference' },
    ]
    await this.page.send('Emulation.setEmulatedMedia', { features })
  }
  async setTheme(theme) {
    this.media.theme = theme
    await this.applyMedia()
    await sleep(150)
  }
  async spacing(on) {
    await this.page.evaluate(
      on
        ? `(() => { const s = document.createElement('style'); s.id = '__audit-spacing'; s.textContent = ${JSON.stringify(SPACING_CSS)}; document.head.append(s); })()`
        : `(() => { const s = document.getElementById('__audit-spacing'); if (s) s.remove(); })()`,
    )
    await sleep(150)
  }
  async goto(path = '') {
    const loaded = this.page.once('Page.loadEventFired')
    await this.page.send('Page.navigate', { url: URL_BASE + path })
    await loaded
    await this.waitFor(`!/checking|Loading/i.test((document.getElementById('version-line')||{}).textContent + (document.getElementById('system-check-summary')||{}).textContent)`, { label: 'boot', timeout: 30000 })
    await sleep(300)
    this.log('page loaded ' + URL_BASE + path)
  }
  async evaluate(expr) {
    return this.page.evaluate(expr)
  }
  async waitFor(expr, { timeout = 90000, interval = 200, label } = {}) {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      const v = await this.evaluate(expr)
      if (v) return v
      await sleep(interval)
    }
    throw new Error('timeout waiting for ' + (label ?? expr.slice(0, 100)))
  }
  /** Waits until no status line ends in an ellipsis and no stop button shows. */
  async waitSettled({ timeout = 120000 } = {}) {
    const expr = `(() => {
      const busy = (sel) => /…$|\\.\\.\\.$/.test(((document.querySelector(sel) || {}).textContent || '').trim());
      const stop = Array.from(document.querySelectorAll('#stop-actions button')).some((b) => !b.hidden);
      return !busy('#source-status') && !busy('#status') && !stop;
    })()`
    await sleep(400)
    await this.waitFor(expr, { timeout, label: 'settled' })
    await sleep(300)
    await this.waitFor(expr, { timeout, label: 'settled-twice' })
  }
  async rect(sel) {
    const r = await this.evaluate(`window.__audit.rect(${JSON.stringify(sel)})`)
    if (!r) throw new Error('no element for ' + sel)
    return r
  }
  async click(sel) {
    const r = await this.rect(sel)
    const p = this.page
    if (this.view === 'phone') {
      await p.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] })
      await p.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else {
      await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x, y: r.y })
      await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: r.x, y: r.y, button: 'left', clickCount: 1 })
      await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: r.x, y: r.y, button: 'left', clickCount: 1 })
    }
    await sleep(120)
    this.log(`click ${sel}`)
  }
  async press(name, { shift = false, repeat = 1 } = {}) {
    const k = KEYS[name]
    for (let i = 0; i < repeat; i++) {
      await this.page.send('Input.dispatchKeyEvent', {
        type: k.text ? 'keyDown' : 'rawKeyDown',
        key: k.key,
        code: k.code,
        windowsVirtualKeyCode: k.vk,
        nativeVirtualKeyCode: k.vk,
        modifiers: shift ? 8 : 0,
        ...(k.text ? { text: k.text, unmodifiedText: k.text } : {}),
      })
      await this.page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk, modifiers: shift ? 8 : 0 })
      await sleep(40)
    }
  }
  async type(sel, text, { replace = true } = {}) {
    await this.click(sel)
    if (replace) await this.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); el.focus(); el.select && el.select(); })()`)
    await this.page.send('Input.insertText', { text })
    await sleep(80)
    this.log(`type ${sel} "${text}"`)
  }
  async select(sel, value) {
    const before = await this.evaluate(`document.querySelector(${JSON.stringify(sel)}).value`)
    await this.evaluate(`document.querySelector(${JSON.stringify(sel)}).focus()`)
    const options = await this.evaluate(`Array.from(document.querySelector(${JSON.stringify(sel)}).options).map((o) => o.value)`)
    const from = options.indexOf(before)
    const to = options.indexOf(value)
    const key = to > from ? 'ArrowDown' : 'ArrowUp'
    for (let i = 0; i < Math.abs(to - from); i++) await this.press(key)
    await sleep(100)
    const after = await this.evaluate(`document.querySelector(${JSON.stringify(sel)}).value`)
    if (after !== value) {
      this.log(`select ${sel}: keys left it at ${after}; setting ${value} and dispatching change`)
      await this.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event('change', { bubbles: true })); })()`)
    } else this.log(`select ${sel} -> ${value} by keys`)
    await sleep(100)
  }
  async setFiles(file, sel = '#file-input') {
    const { root } = await this.page.send('DOM.getDocument', { depth: 1 })
    const { nodeId } = await this.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel })
    await this.page.send('DOM.setFileInputFiles', { files: [file], nodeId })
    this.log(`file chosen: ${file.split('/').pop()}`)
  }
  async drag(file, sel, { drop = true, mime = 'video/mp4' } = {}) {
    const r = await this.rect(sel)
    const data = { items: [{ mimeType: mime, data: '' }], files: [file], dragOperationsMask: 1 }
    await this.page.send('Input.dispatchDragEvent', { type: 'dragEnter', x: r.x, y: r.y, data })
    await this.page.send('Input.dispatchDragEvent', { type: 'dragOver', x: r.x, y: r.y, data })
    if (drop) await this.page.send('Input.dispatchDragEvent', { type: 'drop', x: r.x, y: r.y, data })
    await sleep(300)
    this.log(`drag ${file.split('/').pop()} onto ${sel}${drop ? ' and drop' : ''}`)
  }
  async dragCancel(sel) {
    const r = await this.rect(sel)
    const data = { items: [], files: [], dragOperationsMask: 1 }
    await this.page.send('Input.dispatchDragEvent', { type: 'dragCancel', x: r.x, y: r.y, data })
    await sleep(200)
  }
  async swipe(sel, dx, { steps = 10 } = {}) {
    const r = await this.rect(sel)
    const p = this.page
    await p.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] })
    for (let i = 1; i <= steps; i++) {
      await p.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r.x + (dx * i) / steps, y: r.y }] })
      await sleep(30)
    }
    await p.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await sleep(200)
  }
  async dragMouse(sel, dx, { steps = 10 } = {}) {
    const r = await this.rect(sel)
    const p = this.page
    await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x, y: r.y })
    await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: r.x, y: r.y, button: 'left', clickCount: 1 })
    for (let i = 1; i <= steps; i++) {
      await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x + (dx * i) / steps, y: r.y, button: 'left', buttons: 1 })
      await sleep(30)
    }
    await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: r.x + dx, y: r.y, button: 'left', clickCount: 1 })
    await sleep(200)
  }
  async screenshot(name) {
    const m = await this.evaluate(`({ w: document.documentElement.clientWidth, h: document.documentElement.scrollHeight })`)
    const shot = await this.page.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: m.w, height: Math.min(m.h, 12000), scale: 1 },
    })
    writeFileSync(join(this.dir, name + '.png'), Buffer.from(shot.data, 'base64'))
    return m
  }
  /** A screenshot of one element's region, or the region from one element to another. */
  async clip(name, sel, { pad = 16, to } = {}) {
    const r = await this.evaluate(`(() => { const a = document.querySelector(${JSON.stringify(sel)}); if (!a) return null; const b = ${to ? `document.querySelector(${JSON.stringify(to)})` : 'a'} || a; const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); const top = Math.min(ra.top, rb.top) + window.scrollY, bottom = Math.max(ra.bottom, rb.bottom) + window.scrollY; const left = Math.min(ra.left, rb.left) + window.scrollX, right = Math.max(ra.right, rb.right) + window.scrollX; return { x: left, y: top, w: right - left, h: bottom - top }; })()`)
    if (!r) throw new Error('no element ' + sel)
    const clip = { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: Math.max(1, r.w + 2 * pad), height: Math.max(1, r.h + 2 * pad), scale: 1 }
    const shot = await this.page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip })
    writeFileSync(join(this.dir, name + '.png'), Buffer.from(shot.data, 'base64'))
    this.log(`clipped ${name} (${Math.round(clip.width)}x${Math.round(clip.height)})`)
  }
  async capture(name, { walk = false, measure = false, text = true } = {}) {
    const m = await this.screenshot(name)
    const info = {
      view: this.view,
      theme: this.media.theme,
      page: m,
      title: await this.evaluate('document.title'),
      lang: await this.evaluate('document.documentElement.lang'),
      headings: await this.evaluate('window.__audit.headings()'),
      overflow: await this.evaluate('window.__audit.overflow()'),
      liveSinceLast: (await this.evaluate('window.__audit.live')).slice(this.liveIndex),
      focusRecent: (await this.evaluate('window.__audit.focus')).slice(-6),
      titles: await this.evaluate('window.__audit.titles'),
      errors: await this.evaluate('window.__audit.errors'),
      saves: await this.evaluate('window.__audit.saves'),
      boot: await this.evaluate('window.__audit.boot'),
      activeElement: await this.evaluate('window.__audit.focusInfo()'),
    }
    this.liveIndex = (await this.evaluate('window.__audit.live.length'))
    if (text) writeFileSync(join(this.dir, name + '.txt'), await this.evaluate('window.__audit.visibleText(document.body)'))
    if (measure) {
      info.targets = await this.evaluate('window.__audit.targets()')
      const contrast = await this.evaluate('window.__audit.contrast()')
      info.contrastFails = contrast.filter((c) => c.ratio < c.need)
      info.contrastCount = contrast.length
      info.lineLengths = await this.evaluate('window.__audit.lineLengths()')
      info.ax = await this.evaluate('window.__audit.ax()')
    }
    if (walk) info.tabWalk = await this.tabWalk()
    writeFileSync(join(this.dir, name + '-styles.json'), JSON.stringify(await this.evaluate('window.__audit.styles()')))
    writeFileSync(join(this.dir, name + '.json'), JSON.stringify(info, null, 1))
    this.log(`captured ${name} (${m.w}x${m.h}, ${info.overflow.hscroll ? 'HSCROLL' : 'no hscroll'})`)
    return info
  }
  async tabWalk(max = 160) {
    await this.evaluate('(() => { if (document.activeElement) document.activeElement.blur(); window.scrollTo(0, 0); })()')
    const stops = []
    const seen = new Set()
    let left = false
    for (let i = 0; i < max; i++) {
      await this.press('Tab')
      let info = await this.evaluate('window.__audit.focusInfo()')
      if (info.el.startsWith('video')) {
        // The native player's own controls: one stop for the walk, however many inside.
        let inside = 0
        while (info.el.startsWith('video') && inside < 15) {
          await this.press('Tab')
          info = await this.evaluate('window.__audit.focusInfo()')
          inside++
        }
        stops.push({ el: 'video (native controls, ' + inside + ' inner stops)', focusVisible: true, obscured: [], inView: true })
      }
      if (info.el === 'body') {
        if (left) break
        continue
      }
      left = true
      if (stops.length && info.el === stops[0].el) break
      if (seen.has(info.el)) {
        info.repeat = true
        if (stops.filter((s) => s.repeat).length > 3) break
      }
      seen.add(info.el)
      stops.push(info)
    }
    this.log(`tab walk: ${stops.length} stops`)
    return stops
  }
  /** The same state under the other views and themes. */
  async matrix(name, { walk = false } = {}) {
    const startView = this.view
    const startTheme = this.media.theme
    if (startView !== 'phone') {
      for (const view of ['reflow320', 'zoom200']) {
        await this.setView(view)
        await sleep(250)
        await this.capture(`${name}-${view}`, { measure: true, walk: walk && view === 'reflow320' })
      }
      await this.setView(startView)
      await this.spacing(true)
      await this.capture(`${name}-textspacing`, { measure: true })
      await this.spacing(false)
    }
    for (const theme of ['dark', 'forced']) {
      await this.setTheme(theme)
      await this.capture(`${name}-${theme}`, { measure: true })
    }
    await this.setTheme(startTheme)
    await sleep(150)
  }
  // --- page-specific moves ---------------------------------------------
  createButton() {
    return '#process-actions button:nth-child(2)'
  }
  cancelButton() {
    return '#process-actions button:nth-child(3)'
  }
  acknowledgeButton() {
    return '#process-actions button:nth-child(1)'
  }
  saveButton() {
    return '#process-result button.button:not(.button--secondary):not(.button--danger)'
  }
  async chooseLanguage(tag) {
    await this.click(`#language-switcher input[value="${tag}"]`)
    await sleep(300)
  }
  async chooseKind(kind) {
    await this.click(`#video-kind input[value="${kind}"]`)
    await sleep(300)
  }
  async waitRunning() {
    await this.waitFor(`(() => { const t = document.getElementById('process-progress-text'); return t && !t.hidden && t.textContent.trim().length > 0; })()`, { label: 'running', timeout: 60000 })
  }
  async waitEncoding() {
    await this.waitFor(`(() => { const p = document.getElementById('process-progress'); return p && !p.hidden && p.value > 0.03; })()`, { label: 'encoding', timeout: 120000 })
  }
  async waitFinished() {
    await this.waitFor(`(() => { const p = document.getElementById('process-progress'); const s = document.querySelector(${JSON.stringify(this.saveButton())}); return s && (!p || p.hidden); })()`, { label: 'finished', timeout: 600000 })
    await sleep(400)
  }
  async waitFailed() {
    await this.waitFor(`(() => { const p = document.getElementById('process-progress'); const r = document.getElementById('process-result'); return (!p || p.hidden) && r && r.children.length > 0 && !document.querySelector(${JSON.stringify(this.saveButton())}); })()`, { label: 'failed', timeout: 300000 })
    await sleep(500)
  }
  async waitSaved() {
    await this.waitFor(`(() => { const s = document.getElementById('save-status'); const t = (s.textContent || '').trim(); return t.length > 0 && !/…$|\\.\\.\\.$/.test(t); })()`, { label: 'saved', timeout: 120000 })
    await sleep(300)
  }
  async close() {
    await this.page.close()
  }
}

// ---------------------------------------------------------------------------
// Scenarios.
const scenarios = {}

scenarios['desktop-en-staff'] = async (w) => {
  await w.goto()
  await w.capture('01-empty', { walk: true, measure: true })
  await w.matrix('01-empty', { walk: true })
  await w.drag(F('lecture-60s.mp4'), '#drop-zone', { drop: false })
  await w.capture('02-drag-held')
  await w.dragCancel('#drop-zone')
  await w.drag(F('notvideo.mp4'), '#drop-zone', { mime: 'text/plain' })
  await sleep(600)
  await w.capture('03-drop-refused')
  await w.click('#feedback-open')
  await sleep(300)
  await w.capture('04-feedback', { walk: true, measure: true })
  await w.press('Escape')
  await sleep(300)
  await w.setFiles(F('lecture-360s.mp4'))
  await sleep(60)
  await w.capture('05-reading')
  await w.waitFor(`Array.from(document.querySelectorAll('#stop-actions button')).some((b) => !b.hidden) || document.getElementById('preflight-report').children.length > 0`, { label: 'checking' })
  await w.capture('06-checking')
  await w.waitSettled()
  await w.capture('07-ready', { walk: true, measure: true })
  await w.matrix('07-ready', { walk: true })
  await w.click('#onset-help-button')
  await sleep(200)
  await w.capture('08-help-open')
  await w.press('Escape')
  await w.type('#trim-start', 'abc')
  await w.press('Tab')
  await sleep(400)
  await w.capture('09-trim-invalid', { measure: true })
  await w.type('#trim-start', '0:05')
  await w.press('Tab')
  await sleep(150)
  await w.capture('10-check-after-trim')
  await w.waitSettled()
  await w.capture('11-ready-trimmed')
  // the preview follows the handle (VH-125)
  await w.evaluate(`document.getElementById('trim-start-range').focus()`)
  await w.press('ArrowRight', { repeat: 3 })
  await sleep(500)
  const t1 = await w.evaluate(`({ handle: document.getElementById('trim-start-range').value, preview: document.getElementById('trim-preview').currentTime, paused: document.getElementById('trim-preview').paused, valuetext: document.getElementById('trim-start-range').getAttribute('aria-valuetext') })`)
  w.log('after 3 arrow presses on the start handle: ' + JSON.stringify(t1))
  await w.dragMouse('#trim-end-range', -120)
  await sleep(500)
  const t2 = await w.evaluate(`({ handle: document.getElementById('trim-end-range').value, preview: document.getElementById('trim-preview').currentTime, paused: document.getElementById('trim-preview').paused })`)
  w.log('after dragging the end handle 120 px left: ' + JSON.stringify(t2))
  await w.capture('12-trim-dragged')
  await w.waitSettled()
  // a stopped check
  await w.type('#trim-end', '1:30')
  await w.press('Tab')
  await sleep(120)
  try {
    await w.click('#stop-actions button:nth-child(1)')
    await sleep(400)
    await w.capture('13-check-stopped')
    await w.click('#stop-actions button:nth-child(2)')
  } catch (e) {
    w.log('could not stop the check in time: ' + e.message)
  }
  await w.waitSettled()
  await w.click('#trim-clear')
  await w.waitSettled()
  // the title card
  await w.click('#title-card-on')
  await sleep(300)
  await w.capture('14-title-card-on', { walk: true, measure: true })
  await w.matrix('14-title-card-on')
  await w.click(w.createButton())
  await sleep(500)
  await w.capture('15-title-card-refused', { measure: true })
  await w.type('#title-card-title', 'Audit title card: a heading that runs long enough to wrap onto a second line')
  await w.type('#title-card-department', 'Audit department')
  await w.type('#title-card-authors', 'A. Author and B. Author')
  await w.press('Tab')
  await sleep(300)
  await w.capture('16-title-card-filled', { measure: true })
  // the closing
  await w.select('#closing-type', 'fade')
  await sleep(300)
  await w.capture('17-closing-fade')
  await w.select('#closing-type', 'none')
  await sleep(300)
  await w.capture('18-closing-none', { measure: true })
  await w.select('#closing-type', 'cut')
  await w.click('#closing-internal')
  await sleep(300)
  await w.capture('19-closing-internal')
  await w.click('#closing-colour input[value="white"]')
  await sleep(200)
  await w.capture('20-closing-white')
  await w.click('input[name="preset"][value="smaller"]')
  await sleep(300)
  await w.capture('21-preset-smaller')
  await w.click('input[name="preset"][value="best"]')
  // a job, cancelled
  await w.click(w.createButton())
  await w.waitRunning()
  await sleep(300)
  await w.capture('22-running-start', { measure: true })
  await w.waitEncoding()
  await w.capture('23-running', { walk: true, measure: true })
  await w.matrix('23-running')
  try {
    await w.waitFor(`(() => { const t = document.getElementById('process-time-left'); return t && !t.hidden && t.textContent.trim().length > 0; })()`, { label: 'time left', timeout: 60000 })
    await w.capture('24-time-left')
  } catch (e) {
    w.log('no time-left line: ' + e.message)
  }
  const cancelVisible = await w.evaluate(`(() => { const b = document.querySelector(${JSON.stringify(w.cancelButton())}); return b && !b.hidden && !b.disabled; })()`)
  if (cancelVisible) {
    await w.click(w.cancelButton())
    await sleep(80)
    await w.capture('25-cancelling')
    await w.waitFor(`(() => { const p = document.getElementById('process-progress'); return !p || p.hidden; })()`, { label: 'cancelled' })
    await sleep(400)
    await w.capture('26-cancelled', { walk: true })
  } else w.log('the job finished before Cancel could be pressed')
  // a job, finished
  const finished = await w.evaluate(`!!document.querySelector(${JSON.stringify(w.saveButton())})`)
  if (!finished) {
    await w.click(w.createButton())
    await w.waitRunning()
    await w.waitFinished()
  }
  await w.capture('27-finished', { walk: true, measure: true })
  await w.matrix('27-finished')
  // the discard question
  await w.click(w.createButton())
  await w.waitFor(`!!document.querySelector('#process-result .button--danger')`, { label: 'discard question', timeout: 10000 })
  await sleep(300)
  await w.capture('28-discard-question', { walk: true, measure: true })
  await w.matrix('28-discard-question')
  await w.click('#process-result button.button--secondary')
  await sleep(400)
  await w.capture('29-kept')
  // the save
  await w.click(w.saveButton())
  await sleep(40)
  await w.capture('30-saving')
  await w.waitSaved()
  await w.capture('31-saved', { walk: true, measure: true })
  await w.matrix('31-saved')
  // the previous video under the next
  await w.setFiles(F('lecture-60s.mp4'))
  await w.waitSettled()
  await w.capture('32-previous-video', { walk: true, measure: true })
  // the footer's disclosures
  await w.click('#accessibility-statement summary')
  await sleep(300)
  await w.capture('33-statement-open', { walk: true, measure: true })
  await w.matrix('33-statement-open')
  await w.click('#accessibility-statement summary')
  await w.click('#system-check summary')
  await sleep(300)
  await w.capture('34-system-check-open', { measure: true })
  await w.click('#system-check summary')
  // the other files
  await w.setFiles(F('prores-1080p.mov'))
  await w.waitSettled()
  await w.capture('35-blocked-file', { walk: true, measure: true })
  await w.matrix('35-blocked-file')
  await w.setFiles(F('notvideo.mp4'))
  await w.waitSettled()
  await w.capture('36-unreadable', { measure: true })
  await w.setFiles(F('short-2s.mp4'))
  await w.waitSettled()
  await w.capture('37-too-short', { measure: true })
  await w.setFiles(F('silent-10s.mp4'))
  await w.waitSettled()
  await w.capture('38-silent', { measure: true })
  await w.setFiles(F('captioned-12s.mp4'))
  await w.waitSettled()
  await w.capture('39-captioned', { measure: true })
  await w.setFiles(F('quiet-30s.mp4'))
  await w.waitSettled()
  await w.capture('40-quiet', { measure: true })
  await w.setFiles(F('loud-30s.mp4'))
  await w.waitSettled()
  await w.capture('41-loud', { measure: true })
  await w.setFiles(F('fourbythree-20s.mp4'))
  await w.waitSettled()
  await w.capture('42-four-by-three')
  // a failure
  await w.setFiles(F('truncated-30s.mp4'))
  await w.waitSettled()
  await w.capture('43-truncated-read', { measure: true })
  const canCreate = await w.evaluate(`(() => { const b = document.querySelector(${JSON.stringify(w.createButton())}); return b && !b.hidden && !b.disabled; })()`)
  if (canCreate) {
    await w.click(w.createButton())
    try {
      await w.waitRunning()
      await w.waitFailed()
      await w.capture('44-failed', { walk: true, measure: true })
    } catch (e) {
      w.log('failure path: ' + e.message)
      await w.capture('44-failed-timeout')
    }
  } else w.log('truncated file: Create not offered')
  // an uncaught error
  await w.evaluate(`window.dispatchEvent(new ErrorEvent('error', { message: 'Deliberate audit error', error: new Error('Deliberate audit error') }))`)
  await sleep(500)
  await w.capture('45-errors-captured', { walk: true, measure: true })
}

scenarios['phone-en-staff'] = async (w) => {
  await w.goto()
  await w.capture('01-empty', { walk: true, measure: true })
  await w.setFiles(F('lecture-60s.mp4'))
  await w.waitSettled()
  await w.capture('02-discouraged', { walk: true, measure: true })
  await w.click(w.acknowledgeButton())
  await sleep(300)
  await w.capture('03-acknowledged', { measure: true })
  // a touch drag on the end handle
  await w.swipe('#trim-end-range', -60)
  await sleep(500)
  const t = await w.evaluate(`({ handle: document.getElementById('trim-end-range').value, preview: document.getElementById('trim-preview').currentTime, paused: document.getElementById('trim-preview').paused })`)
  w.log('after a 60 px touch drag on the end handle: ' + JSON.stringify(t))
  await w.capture('04-trim-touched', { measure: true })
  await w.waitSettled()
  await w.click('#trim-clear')
  await w.waitSettled()
  await w.click('#title-card-on')
  await sleep(300)
  await w.capture('05-title-card-on', { walk: true, measure: true })
  await w.type('#title-card-title', 'Audit title card on a phone')
  await w.type('#title-card-department', 'Audit department')
  await w.type('#title-card-authors', 'A. Author')
  await w.press('Tab')
  await w.select('#closing-type', 'fade')
  await sleep(300)
  await w.capture('06-closing-fade', { measure: true })
  const ack = await w.evaluate(`(() => { const b = document.querySelector(${JSON.stringify(w.acknowledgeButton())}); return b && !b.hidden; })()`)
  if (ack) await w.click(w.acknowledgeButton())
  await w.click(w.createButton())
  await w.waitRunning()
  await w.waitEncoding()
  await w.capture('07-running', { walk: true, measure: true })
  await w.waitFinished()
  await w.capture('08-finished', { walk: true, measure: true })
  await w.click(w.saveButton())
  await sleep(300)
  await w.capture('09-download-handed-off', { measure: true })
  await w.waitSaved()
  await w.capture('10-after-download', { walk: true, measure: true })
  await w.click(w.createButton())
  await sleep(400)
  await w.capture('11-discard-question', { walk: true, measure: true })
  await w.click('#process-result button.button--secondary')
  await sleep(300)
  await w.chooseKind('submission')
  await sleep(300)
  await w.capture('12-submission', { walk: true, measure: true })
  await w.click('#accessibility-statement summary')
  await sleep(300)
  await w.capture('13-statement-open', { measure: true })
  await w.click('#accessibility-statement summary')
  await w.click('#feedback-open')
  await sleep(300)
  await w.capture('14-feedback', { walk: true, measure: true })
  await w.press('Escape')
  await w.setFiles(F('prores-1080p.mov'))
  await w.waitSettled()
  await w.capture('15-blocked-file', { measure: true })
}

async function languageSetup(w, tag, kind, label) {
  await w.chooseLanguage(tag)
  await w.chooseKind(kind)
  await sleep(300)
  await w.capture(`${label}-01-empty`, { walk: true, measure: true })
  await w.setFiles(F('lecture-60s.mp4'))
  await w.waitSettled()
  await w.capture(`${label}-02-ready`, { walk: true, measure: true })
  await w.matrix(`${label}-02-ready`)
  if (kind === 'staff') {
    await w.click('#title-card-on')
    await sleep(300)
  }
  await w.capture(`${label}-03-card-on`, { measure: true })
  await w.click(w.createButton())
  await sleep(500)
  await w.capture(`${label}-04-card-refused`, { measure: true })
  if (kind === 'staff') {
    await w.type('#title-card-title', '测试标题 Tajuk ujian: a title that wraps')
    await w.type('#title-card-department', 'Audit department')
    await w.type('#title-card-authors', 'A. Author')
  } else {
    await w.type('#submission-card-assignment', 'Assignment 2: audit')
    await w.type('#submission-card-module', 'AUD1001 Auditing the page')
    await w.type('#submission-card-convenor', 'Dr A. Convenor')
    await w.type('#submission-card-ids', '12345678 23456789 34567890')
  }
  await w.press('Tab')
  await sleep(300)
  await w.capture(`${label}-05-card-filled`, { measure: true })
  await w.matrix(`${label}-05-card-filled`)
  if (kind === 'staff') await w.click('#closing-internal')
  await w.select('#closing-type', 'fade')
  await sleep(300)
  await w.capture(`${label}-06-closing`, { measure: true })
  await w.click(`#video-language input[value="${tag === 'en-GB' ? 'ms-MY' : 'en-GB'}"]`)
  await sleep(300)
  await w.capture(`${label}-07-video-language-changed`, { measure: true })
  await w.click(`#video-language input[value="${tag}"]`)
}

async function languageJob(w, label) {
  await w.click(w.createButton())
  await w.waitRunning()
  await w.waitEncoding()
  await w.capture(`${label}-08-running`, { walk: true, measure: true })
  await w.matrix(`${label}-08-running`)
  await w.waitFinished()
  await w.capture(`${label}-09-finished`, { walk: true, measure: true })
  await w.matrix(`${label}-09-finished`)
  await w.click(w.createButton())
  await sleep(400)
  await w.capture(`${label}-10-discard-question`, { walk: true, measure: true })
  await w.click('#process-result button.button--secondary')
  await sleep(300)
  await w.click(w.saveButton())
  await w.waitSaved()
  await w.capture(`${label}-11-saved`, { walk: true, measure: true })
  await w.matrix(`${label}-11-saved`)
  await w.click('#accessibility-statement summary')
  await sleep(300)
  await w.capture(`${label}-12-statement-open`, { walk: true, measure: true })
  await w.matrix(`${label}-12-statement-open`)
  await w.click('#accessibility-statement summary')
  await w.click('#feedback-open')
  await sleep(300)
  await w.capture(`${label}-13-feedback`, { walk: true, measure: true })
  await w.press('Escape')
  await w.setFiles(F('prores-1080p.mov'))
  await w.waitSettled()
  await w.capture(`${label}-14-blocked-file`, { measure: true })
  await w.setFiles(F('captioned-12s.mp4'))
  await w.waitSettled()
  await w.capture(`${label}-15-captioned`, { measure: true })
}

scenarios['desktop-zh-submission'] = async (w) => {
  await w.goto()
  await languageSetup(w, 'zh-Hans', 'submission', 'zh-sub')
  await languageJob(w, 'zh-sub')
}
scenarios['desktop-ms-staff'] = async (w) => {
  await w.goto()
  await languageSetup(w, 'ms-MY', 'staff', 'ms-staff')
  await languageJob(w, 'ms-staff')
}
scenarios['desktop-en-submission'] = async (w) => {
  await w.goto()
  await languageSetup(w, 'en-GB', 'submission', 'en-sub')
  await languageJob(w, 'en-sub')
}
scenarios['desktop-zh-staff'] = async (w) => {
  await w.goto()
  await languageSetup(w, 'zh-Hans', 'staff', 'zh-staff')
}
scenarios['desktop-ms-submission'] = async (w) => {
  await w.goto()
  await languageSetup(w, 'ms-MY', 'submission', 'ms-sub')
}

scenarios['closings'] = async (w) => {
  await w.goto()
  await w.setFiles(F('lecture-60s.mp4'))
  await w.waitSettled()
  const set = {
    cut: async () => { await w.select('#closing-type', 'cut') },
    fade: async () => { await w.select('#closing-type', 'fade') },
    slide: async () => { await w.select('#closing-type', 'slide'); await w.select('#closing-onset', 'freeze') },
    none: async () => { await w.select('#closing-type', 'none') },
    internal: async () => { await w.select('#closing-type', 'cut'); await w.click('#closing-internal') },
  }
  for (const closing of ['cut', 'fade', 'slide', 'none', 'internal']) {
    await set[closing]()
    await sleep(300)
    await w.capture(`${closing}-step4`, { measure: true })
    await w.click(w.createButton())
    await sleep(300)
    const asked = await w.evaluate(`!!document.querySelector('#process-result .button--danger')`)
    if (asked) {
      await w.click('#process-result .button--danger')
    }
    await w.waitRunning()
    await w.waitFinished()
    await w.capture(`${closing}-finished`, { measure: true })
    if (closing === 'internal') await w.evaluate(`document.getElementById('closing-internal').checked && document.getElementById('closing-internal').click()`)
  }
  await w.click(w.saveButton())
  await w.waitSaved()
  await w.capture('internal-saved')
}

scenarios['remembered-language'] = async (w) => {
  await w.goto()
  await w.chooseLanguage('zh-Hans')
  await w.chooseKind('submission')
  await sleep(300)
  await w.goto()
  await w.capture('reloaded-zh-submission', { measure: true })
  const boot = await w.evaluate('window.__audit.boot')
  w.log('boot after reload: ' + JSON.stringify(boot))
  await w.page.send('Page.navigate', { url: 'about:blank' })
  await sleep(300)
  await w.goto('#accessibility-statement')
  await sleep(300)
  await w.capture('fragment-statement', { measure: true })
}

scenarios['visual-checks'] = async (w) => {
  await w.goto()
  for (const theme of ['light', 'dark', 'forced']) {
    await w.setTheme(theme)
    await w.evaluate(`(() => { if (document.activeElement) document.activeElement.blur(); window.scrollTo(0, 0); })()`)
    await w.press('Tab')
    await w.press('Tab')
    await w.clip(`switchers-language-focused-${theme}`, '#language-switcher', { to: '#video-language' })
    await w.press('Tab')
    await w.clip(`switchers-kind-focused-${theme}`, '#video-kind')
    await w.clip(`page-top-${theme}`, 'header', { to: '#step-choose' })
  }
  await w.setTheme('light')
  await w.setFiles(F('lecture-60s.mp4'))
  await w.waitSettled()
  await w.click('#title-card-on')
  await sleep(200)
  for (const theme of ['light', 'dark', 'forced']) {
    await w.setTheme(theme)
    await w.clip(`step1-read-${theme}`, '#step-choose')
    await w.clip(`step2-trim-${theme}`, '#step-trim')
    await w.clip(`step3-card-on-${theme}`, '#step-title')
    await w.clip(`step4-closing-${theme}`, '#step-closing')
    await w.clip(`step5-preset-${theme}`, '#step-preset')
    await w.clip(`step6-ready-${theme}`, '#step-create')
  }
  await w.setTheme('light')
  await w.evaluate(`document.getElementById('trim-start-range').focus()`)
  await w.clip('focus-start-handle-light', '#trim-track', { pad: 24 })
  await w.setTheme('forced')
  await w.clip('focus-start-handle-forced', '#trim-track', { pad: 24 })
  await w.setTheme('light')
  await w.click('#closing-colour input[value="white"]')
  await w.evaluate(`document.querySelector('#closing-colour input[value="white"]').focus()`)
  await w.clip('focus-colour-white-light', '#closing-colour')
  await w.setTheme('forced')
  await w.clip('focus-colour-white-forced', '#closing-colour')
  await w.setTheme('light')
  await w.click('#closing-colour input[value="blue"]')
  await w.click('#onset-help-button')
  await sleep(200)
  await w.clip('help-open', '#step-closing')
  await w.press('Escape')
  // the submission side, and its textarea locked during a job (C-04)
  await w.chooseKind('submission')
  await sleep(300)
  await w.clip('step3-submission-empty', '#step-title')
  await w.clip('step4-closing-submission', '#step-closing')
  await w.click(w.createButton())
  await sleep(500)
  await w.clip('step3-submission-refused', '#step-title')
  await w.type('#submission-card-assignment', 'Assignment 2: the audit')
  await w.type('#submission-card-module', 'AUD1001 Auditing the page')
  await w.type('#submission-card-convenor', 'Dr A. Convenor')
  await w.type('#submission-card-ids', '12345678 23456789')
  await w.press('Tab')
  await sleep(300)
  await w.clip('step3-submission-filled', '#step-title')
  await w.click(w.createButton())
  await w.waitRunning()
  await w.waitEncoding()
  for (const theme of ['light', 'dark', 'forced']) {
    await w.setTheme(theme)
    await w.clip(`step3-submission-locked-${theme}`, '#step-title')
    await w.clip(`step6-running-${theme}`, '#step-create')
  }
  await w.setTheme('light')
  const fields = await w.evaluate(`(() => { const d = (el) => { const cs = getComputedStyle(el); return { disabled: el.disabled, bg: cs.backgroundColor, border: cs.borderStyle + ' ' + cs.borderWidth + ' ' + cs.borderColor, opacity: cs.opacity }; }; return { textarea: d(document.getElementById('submission-card-ids')), input: d(document.getElementById('submission-card-assignment')), select: d(document.getElementById('closing-type')) }; })()`)
  w.log('fields during the job: ' + JSON.stringify(fields))
  await w.waitFinished()
  await w.clip('step6-finished', '#step-create')
  // an unsaved result, then another file: the previous video
  await w.setFiles(F('captioned-12s.mp4'))
  await w.waitSettled()
  await w.capture('previous-video-unsaved', { walk: true, measure: true })
  for (const theme of ['light', 'dark', 'forced']) {
    await w.setTheme(theme)
    await w.clip(`step6-previous-video-${theme}`, '#step-create')
  }
  await w.setTheme('light')
  // the result's lifetime line after Keep it
  await w.click(w.createButton())
  await sleep(400)
  await w.clip('previous-video-discard-question', '#step-create')
  await w.click('#process-result button.button--secondary')
  await sleep(300)
  await w.clip('previous-video-kept', '#step-create')
  // feedback, and the statement
  await w.click('#feedback-open')
  await sleep(300)
  for (const theme of ['light', 'dark', 'forced']) {
    await w.setTheme(theme)
    await w.clip(`feedback-${theme}`, '#feedback-dialog', { pad: 8 })
  }
  await w.setTheme('light')
  await w.press('Escape')
  await w.click('#accessibility-statement summary')
  await sleep(300)
  await w.clip('statement-open', '#accessibility-statement')
  await w.click('#accessibility-statement summary')
  await w.click('#system-check summary')
  await sleep(300)
  await w.clip('system-check-open', '#system-check')
}

scenarios['focus-rings'] = async (w) => {
  await w.goto()
  await w.setFiles(F('lecture-60s.mp4'))
  await w.waitSettled()
  await w.click('#title-card-on')
  await sleep(200)
  const targets = [
    ['language-english', '#language-switcher input[value="en-GB"]', '#language-switcher'],
    ['kind-staff', '#video-kind input[value="staff"]', '#video-kind'],
    ['file-input', '#file-input', '#drop-zone'],
    ['properties-summary', '#source-report summary', '#source-report'],
    ['start-handle', '#trim-start-range', '#trim-track'],
    ['start-time', '#trim-start', '#trim-start'],
    ['set-start', '#trim-set-start', '#trim-set-start'],
    ['title-card-on', '#title-card-on', '#title-card-box-field'],
    ['title-field', '#title-card-title', '#title-card-title'],
    ['closing-type', '#closing-type', '#closing-type'],
    ['help-button', '#onset-help-button', '#onset-help-button'],
    ['colour-blue', '#closing-colour input[value="blue"]', '#closing-colour'],
    ['internal', '#closing-internal', '#closing-internal-field'],
    ['preset-best', 'input[name="preset"][value="best"]', '#preset-choice'],
    ['create', '#process-actions button:nth-child(2)', '#process-actions'],
    ['system-check', '#system-check summary', '#system-check summary'],
    ['feedback', '#feedback-open', '#feedback-open'],
    ['contact', '#contact-creators', '#contact-creators'],
  ]
  const results = []
  for (const theme of ['light', 'dark', 'forced']) {
    await w.setTheme(theme)
    for (const [name, sel, clipSel] of targets) {
      // Focus by keyboard: put focus on the element's predecessor by script, then Tab onto it.
      await w.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); el.scrollIntoView({ block: 'center' }); const probe = document.createElement('button'); probe.id = '__probe'; probe.textContent = '.'; probe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0'; el.parentElement.insertBefore(probe, el.closest('label, .control-with-help') && el.closest('label, .control-with-help').parentElement === el.parentElement ? el.closest('label, .control-with-help') : el); probe.focus(); })()`)
      await w.press('Tab')
      await w.evaluate(`(() => { const p = document.getElementById('__probe'); if (p) p.remove(); })()`)
      const info = await w.evaluate(`(() => { const el = document.activeElement; const face = el.matches && el.matches('.segment input') ? el.nextElementSibling : el; const cs = getComputedStyle(face); const r = face.getBoundingClientRect(); return { want: ${JSON.stringify(sel)}, got: window.__audit.desc(el), focusVisible: el.matches(':focus-visible'), ringOn: face === el ? 'self' : 'face', outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, offset: cs.outlineOffset, background: cs.backgroundColor, border: cs.borderWidth + ' ' + cs.borderColor, w: Math.round(r.width), h: Math.round(r.height) }; })()`)
      info.theme = theme
      info.name = name
      results.push(info)
      await w.clip(`ring-${theme}-${name}`, clipSel, { pad: 12 })
    }
  }
  writeFileSync(join(w.dir, 'rings.json'), JSON.stringify(results, null, 1))
  w.log('rings recorded: ' + results.length)
}

lateScenarios['truncated-download'] = async (w) => {
  await w.goto()
  await w.setFiles(F('truncated-30s.mp4'))
  await w.waitSettled()
  await w.capture('01-read', { measure: true })
  await w.click(w.createButton())
  await w.waitRunning()
  await w.waitFinished()
  await w.capture('02-finished', { measure: true })
  await w.click(w.saveButton())
  await w.waitSaved()
  await w.capture('03-downloaded')
  await sleep(3000)
}

// The frames the app draws (VH-143): VH-126's spike page fits and draws both title cards and the
// closing's words at four shapes in three languages with the real renderer, and reports each
// field's size against its floor. Needs spike-cards.html at the dev server's root.
scenarios['cards'] = async (w) => {
  await w.goto('spike-cards.html')
  await w.waitFor(`(() => { const l = document.getElementById('log'); return !!l && /4K: ms-MY Submission/.test(l.textContent); })()`, { label: 'cards drawn', timeout: 240000 })
  await sleep(800)
  writeFileSync(join(w.dir, 'cards-log.txt'), await w.evaluate(`document.getElementById('log').textContent`))
  await w.screenshot('cards-page')
  const n = await w.evaluate(`(() => { const cs = Array.from(document.querySelectorAll('#cards canvas, #cards img')); cs.forEach((c, i) => { c.id = 'audit-card-' + i; }); return cs.map((c) => { const f = c.closest('figure'); const cap = f && f.querySelector('figcaption'); return (cap ? cap.textContent : (c.getAttribute('aria-label') || c.title || c.alt || '')).replace(/\\s+/g, ' ').trim().slice(0, 120); }); })()`)
  w.log('cards drawn: ' + n.length)
  const captions = []
  for (let i = 0; i < n.length; i++) {
    const name = 'card-' + String(i + 1).padStart(2, '0')
    await w.clip(name, '#audit-card-' + i, { pad: 0 })
    captions.push(name + ': ' + n[i])
  }
  writeFileSync(join(w.dir, 'cards-captions.txt'), captions.join('\n') + '\n')
}

Object.assign(scenarios, lateScenarios)

// ---------------------------------------------------------------------------
async function main() {
  const names = process.argv.slice(2)
  if (!names.length) {
    console.log('scenarios: ' + Object.keys(scenarios).join(', '))
    return
  }
  const browser = await connectBrowser()
  console.log('connected to ' + browser.version.Browser)
  for (const name of names) {
    const fn = scenarios[name]
    if (!fn) {
      console.log('no scenario ' + name)
      continue
    }
    const w = new Walk(browser, name, { phone: name.startsWith('phone'), noPicker: name.startsWith('phone') || name.includes('download') })
    await w.open()
    const started = Date.now()
    try {
      await fn(w)
      w.log(`done in ${Math.round((Date.now() - started) / 1000)} s`)
    } catch (e) {
      w.log('FAILED: ' + (e.stack ?? e.message))
      try {
        await w.capture('zz-failure')
      } catch { /* already gone */ }
    } finally {
      await w.close()
    }
  }
  browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
