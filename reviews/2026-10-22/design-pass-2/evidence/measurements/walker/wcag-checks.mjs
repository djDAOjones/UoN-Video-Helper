// VH-163 design pass: WCAG 2.2 AAA measurements of the current page, built on
// walk.mjs's Walk and its in-page __audit helpers (contrast, targets,
// overflow, the text-spacing sheet and the views reflow320 / zoom200).
//
// Usage (headless Chrome on :9222, Vite on :5173):
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out EVIDENCE=<bundle>/evidence \
//     node wcag-checks.mjs [en] [zh] [ms]      -> <scratch>/wcag/*.json
//   node wcag-checks.mjs --report <scratch>/wcag <bundle>/evidence/measurements/wcag-checks-<date>.md
/* eslint-disable no-irregular-whitespace, @typescript-eslint/no-unused-vars -- a measurement script; the regex holds CJK and no-break spaces on purpose */
import { Buffer } from 'node:buffer'
import { mkdirSync, writeFileSync, copyFileSync, readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// In-page instruments, installed beside walk.mjs's __audit.
const WCAG_INIT = String.raw`
(() => {
  const W = (window.__wcag = {});
  const A = () => window.__audit;
  const parse = (c) => { c = String(c); let m = c.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
    m = c.match(/color\(srgb ([^)]+)\)/); if (m) { const p = m[1].split(/[\s\/]+/).filter(Boolean).map(Number); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 }; } return null; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const ratio = (a, b) => { const L1 = lum(a), L2 = lum(b); return Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 100) / 100; };
  const rgb = (c) => 'rgb(' + Math.round(c.r) + ', ' + Math.round(c.g) + ', ' + Math.round(c.b) + ')';
  const bgOf = (el) => { let e = el, acc = null, image = false; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') image = true; const c = parse(cs.backgroundColor); if (c && c.a > 0) { if (c.a >= 1) return { c: acc ? over(acc, c) : c, image }; acc = acc ? over(acc, c) : c; } e = e.parentElement; } const w = { r: 255, g: 255, b: 255, a: 1 }; return { c: acc ? over(acc, w) : w, image }; };
  W.bgOf = bgOf; W.ratio = ratio; W.parse = parse;
  const sel = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const path = (el) => { const p = el.parentElement; return (p && p !== document.body ? sel(p) + ' > ' : '') + sel(el); };
  W.sel = sel; W.path = path;
  const onPage = (el) => { const r = el.getBoundingClientRect(); return r.bottom + scrollY > 0 && r.right + scrollX > 0; };
  const shown = (el) => A().visible(el) && onPage(el);

  // 1.4.6: every text run.
  W.contrast = () => { const out = []; const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; const seen = new Set();
    while ((n = tw.nextNode())) { const el = n.parentElement; if (!el || !n.textContent.trim() || seen.has(el) || !shown(el)) continue; seen.add(el);
      if (el.closest('#dev-actions, script, style, option')) continue;
      const cs = getComputedStyle(el); let fg = parse(cs.color); if (!fg) continue;
      let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
      fg = { ...fg, a: fg.a * op };
      const bg = bgOf(el); const f = fg.a < 1 ? over(fg, bg.c) : fg;
      const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight, 10) >= 700; const large = size >= 24 || (bold && size >= 18.66);
      const disabled = !!el.closest(':disabled, [aria-disabled="true"], fieldset:disabled');
      out.push({ el: path(el).slice(0, 90), text: n.textContent.trim().replace(/\s+/g, ' ').slice(0, 40), fg: rgb(f), bg: rgb(bg.c), bgImage: bg.image, ratio: ratio(f, bg.c), size: Math.round(size * 10) / 10, weight: cs.fontWeight, large, need: large ? 4.5 : 7, band: !!el.closest('.on-brand-blue'), disabled, opacity: op });
    }
    return out; };

  // 2.5.5: every pointer target (walk.mjs's list, off-page ones left out).
  W.targets = () => A().targets().filter((t) => !/skip-link/.test(t.el));

  // 1.4.10 / 1.4.4: page scroll, outside the viewport, outside the parent.
  W.overflow = () => { const de = document.documentElement; const cw = de.clientWidth; const out = { clientWidth: cw, scrollWidth: de.scrollWidth, hscroll: de.scrollWidth > cw, outsideViewport: [], outsideParent: [], scrollers: [] };
    for (const el of document.querySelectorAll('body *')) { if (!shown(el)) continue; const r = el.getBoundingClientRect(); if (r.width === 0) continue;
      if (r.right > cw + 1 || r.left < -1) out.outsideViewport.push({ el: path(el).slice(0, 90), left: Math.round(r.left), right: Math.round(r.right) });
      const p = el.parentElement; if (p && p !== document.body && p !== de) { const pr = p.getBoundingClientRect(); const pcs = getComputedStyle(p); const pl = pr.left + parseFloat(pcs.borderLeftWidth), prr = pr.right - parseFloat(pcs.borderRightWidth);
        const by = Math.max(r.right - prr, pl - r.left); if (by > 1.5) out.outsideParent.push({ el: path(el).slice(0, 90), by: Math.round(by * 10) / 10, w: Math.round(r.width), parentW: Math.round(pr.width) }); }
      const cs = getComputedStyle(el); if (cs.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1) out.scrollers.push({ el: path(el).slice(0, 90), overflowX: cs.overflowX, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }); }
    out.outsideViewport = out.outsideViewport.slice(0, 30); out.outsideParent = out.outsideParent.slice(0, 40); return out; };

  // 1.4.12: clipped boxes, text spilling out of its box, text on text.
  W.textSpacing = () => { const clipped = [], spills = [], overlaps = []; const lines = [];
    for (const el of document.querySelectorAll('body *')) { if (!shown(el)) continue; const cs = getComputedStyle(el);
      const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      const ox = cs.overflowX, oy = cs.overflowY; const sw = el.scrollWidth, cw = el.clientWidth, sh = el.scrollHeight, ch = el.clientHeight;
      if (el.tagName !== 'VIDEO' && el.tagName !== 'TEXTAREA' && ((ox !== 'visible' && sw > cw + 1) || (oy !== 'visible' && sh > ch + 1))) clipped.push({ el: path(el).slice(0, 90), overflow: ox + '/' + oy, scroll: sw + 'x' + sh, client: cw + 'x' + ch, text: (el.innerText || '').trim().slice(0, 40) });
      if (/^(INPUT|SELECT|BUTTON)$/.test(el.tagName) && sh > ch + 1) clipped.push({ el: path(el).slice(0, 90), overflow: 'control', scroll: sw + 'x' + sh, client: cw + 'x' + ch, text: (el.value || el.innerText || '').trim().slice(0, 40) });
      if (hasText && ox === 'visible' && oy === 'visible' && ch > 0 && sh > ch + 2 && cs.display !== 'inline') spills.push({ el: path(el).slice(0, 90), scrollH: sh, clientH: ch, height: cs.height });
      if (hasText) { for (const n of el.childNodes) { if (n.nodeType !== 3 || !n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > 1 && q.height > 1) lines.push({ el, r: { l: q.left, t: q.top, r: q.right, b: q.bottom } }); } }
    }
    for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) { const a = lines[i], b = lines[j]; if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.r, b.r.r) - Math.max(a.r.l, b.r.l), h = Math.min(a.r.b, b.r.b) - Math.max(a.r.t, b.r.t);
      if (w > 2 && h > 2) overlaps.push({ a: path(a.el).slice(0, 70), b: path(b.el).slice(0, 70), w: Math.round(w), h: Math.round(h) }); }
    const seen = new Set(); return { clipped, spills: spills.slice(0, 30), overlaps: overlaps.filter((o) => { const k = o.a + '|' + o.b; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 30) }; };

  // 1.4.8: characters (en/ms, spaces included) or glyphs (zh, spaces left out) per rendered line.
  W.lines = () => { const BLOCK = 'p, li, dd, .helper, .notification-body'; const by = new Map();
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) { if (!n.textContent.trim()) continue; const el = n.parentElement; const block = el && el.closest(BLOCK); if (!block || !shown(el) || block.closest('#dev-actions')) continue;
      if (!by.has(block)) by.set(block, new Map()); const lines = by.get(block); const t = n.textContent; const rg = document.createRange();
      for (let i = 0; i < t.length; i++) { rg.setStart(n, i); rg.setEnd(n, i + 1); const q = rg.getClientRects()[0]; if (!q) continue; const k = Math.round((q.top + q.bottom) / 2 / 4); if (!lines.has(k)) lines.set(k, []); lines.get(k).push(t[i]); } }
    const out = []; for (const [block, lines] of by) { const cs = getComputedStyle(block); const lang = (block.closest('[lang]') || document.documentElement).getAttribute('lang'); let idx = 0;
      for (const [, chars] of [...lines].sort((a, b) => a[0] - b[0])) { const s = chars.join('').replace(/\s+/g, ' ').trim(); if (!s) continue; const cjk = /[　-鿿＀-￯]/.test(s); const nb = s.replace(/\s/g, ''); const wide = (nb.match(/[\u3000-\u9fff\uff00-\uffef]/g) || []).length; out.push({ block: sel(block).slice(0, 60), key: (block.innerText || '').slice(0, 50) + '#' + idx++, lang, fontSize: parseFloat(cs.fontSize), cjk, chars: s.length, glyphs: nb.length, fwe: wide + (nb.length - wide) / 2, text: s.slice(0, 60) }); } }
    return out; };

  // 2.4.13 / 2.4.12: the ring of the focused element.
  W.ring = () => { const el = document.activeElement; if (!el || el === document.body) return { el: 'body' };
    let face = el, pseudo = '';
    if (el.matches('.segment input')) face = el.nextElementSibling;
    let cs = getComputedStyle(face);
    if (cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) === 0) { for (const p of ['::file-selector-button', '::-webkit-slider-thumb']) { try { const ps = getComputedStyle(el, p); if (ps.outlineStyle !== 'none' && parseFloat(ps.outlineWidth) > 0) { cs = ps; pseudo = p; break; } } catch {} } }
    // A range input's ring is on its ::-webkit-slider-thumb, which getComputedStyle cannot read: take it from the author rule and the thumb's own size.
    if (el.matches('input[type=range]') && (cs.outlineStyle === 'none')) {
      let rule = null; const walkRules = (list) => { for (const x of list) { if (x.cssRules && !(x instanceof CSSStyleRule)) { if (!(x instanceof CSSMediaRule) || matchMedia(x.media.mediaText).matches) walkRules(x.cssRules); } else if (x.selectorText && /:focus-visible::-webkit-slider-thumb/.test(x.selectorText) && x.style.outlineColor !== undefined) { try { if (el.matches(x.selectorText.replace(/::-webkit-slider-thumb/g, '').split(',').filter((q) => !/-moz-/.test(q)).join(',') || '#none')) rule = x; } catch {} } } };
      for (const sh of document.styleSheets) { try { walkRules(sh.cssRules); } catch {} }
      const probe = document.createElement('span'); probe.style.position = 'absolute'; if (rule) { probe.style.outline = rule.style.getPropertyValue('outline'); probe.style.outlineOffset = rule.style.getPropertyValue('outline-offset'); } el.parentElement.append(probe); const pcs = getComputedStyle(probe);
      const th = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--target-min')) || 44;
      const val = (a) => parseFloat(a) || 0; const res = { style: rule ? 'solid' : 'none', width: val(pcs.outlineWidth), offset: val(pcs.outlineOffset), color: pcs.outlineColor }; probe.remove();
      const oc2 = parse(res.color); const panel = bgOf(el).c;
      return { el: A().desc(el).slice(0, 80), face: '::-webkit-slider-thumb (rule ' + (rule ? rule.selectorText.slice(0, 50) : 'none found') + ', ' + th + 'px thumb)', focusVisible: el.matches(':focus-visible'), style: res.style, width: res.width, offset: res.offset, color: res.color, vsAdjacent: oc2 ? ratio(oc2, panel) : null, adjacentBg: rgb(panel), vsInner: null, innerBg: '', band: false, inView: true, clippedBy: [], coveredBy: [], obscuredInside: [], w: th, h: th, note: 'thumb ring read from CSS; checked by screenshot' };
    }
    const r = face.getBoundingClientRect(); const ow = parseFloat(cs.outlineWidth) || 0, oo = parseFloat(cs.outlineOffset) || 0;
    const ext = oo + ow; const ring = { l: r.left - ext, t: r.top - ext, r: r.right + ext, b: r.bottom + ext };
    const oc = parse(cs.outlineColor); const outer = bgOf(face.parentElement).c; const inner = bgOf(face).c;
    const clippedBy = []; for (let a = face.parentElement; a && a !== document.documentElement; a = a.parentElement) { const acs = getComputedStyle(a); if (acs.overflowX === 'visible' && acs.overflowY === 'visible') continue; const ar = a.getBoundingClientRect(); const L = ar.left + a.clientLeft, T = ar.top + a.clientTop, R = L + a.clientWidth, B = T + a.clientHeight; if (ring.l < L - 0.5 || ring.t < T - 0.5 || ring.r > R + 0.5 || ring.b > B + 0.5) clippedBy.push(sel(a) + ' (' + acs.overflowX + '/' + acs.overflowY + ')'); }
    const mid = ext - ow / 2; const pts = [[r.left - mid, (r.top + r.bottom) / 2], [r.right + mid, (r.top + r.bottom) / 2], [(r.left + r.right) / 2, r.top - mid], [(r.left + r.right) / 2, r.bottom + mid]];
    const covered = []; for (const [x, y] of pts) { if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const hit = document.elementFromPoint(x, y); if (!hit || hit === face || face.contains(hit) || hit.contains(face)) continue; for (let h = hit; h && h !== document.body; h = h.parentElement) { const p = getComputedStyle(h).position; if (p === 'fixed' || p === 'sticky') { covered.push(sel(h) + ' (' + p + ')'); break; } } }
    const fi = A().focusInfo();
    return { el: A().desc(el).slice(0, 80), face: face === el ? (pseudo || 'self') : 'segment-face', focusVisible: el.matches(':focus-visible'), style: cs.outlineStyle, width: ow, offset: oo, color: cs.outlineColor, vsAdjacent: oc ? ratio(oc, outer) : null, adjacentBg: rgb(outer), vsInner: oc ? ratio(oc, inner) : null, innerBg: rgb(inner), band: !!el.closest('.on-brand-blue'), inView: r.top >= 0 && r.bottom <= innerHeight, clippedBy, coveredBy: covered, obscuredInside: fi.obscured || [], w: Math.round(r.width), h: Math.round(r.height) }; };
  W.fixedCount = () => Array.from(document.querySelectorAll('body *')).filter((e) => { const p = getComputedStyle(e).position; return (p === 'fixed' || p === 'sticky') && A().visible(e); }).map(sel);
})();
`

// ---------------------------------------------------------------------------
async function run(langs) {
  const { connectBrowser } = await import('./cdp.mjs')
  const { Walk, F, OUT_ROOT } = await import('./walk.mjs')
  const EVIDENCE = process.env.EVIDENCE ?? join(OUT_ROOT, 'evidence')
  const DATA = join(dirname(OUT_ROOT), 'wcag')
  mkdirSync(DATA, { recursive: true })
  const SHORT = { en: 'en-GB', zh: 'zh-Hans', ms: 'ms-MY' }

  class WWalk extends Walk {
    async open() {
      await super.open()
      await this.page.send('Page.addScriptToEvaluateOnNewDocument', { source: WCAG_INIT })
    }
    async setView(view) {
      await super.setView(view)
      if (view === 'phone') await this.page.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true, screenWidth: 375, screenHeight: 812 })
    }
    async shot(name) {
      await this.evaluate('window.scrollTo(0, 0)')
      await this.screenshot(name)
      copyFileSync(join(this.dir, name + '.png'), join(EVIDENCE, name + '.png'))
      this.log('screenshot ' + name)
    }
    async clipTo(name, sel, opts) {
      await this.clip(name, sel, opts)
      copyFileSync(join(this.dir, name + '.png'), join(EVIDENCE, name + '.png'))
    }
  }
  const save = (name, data) => writeFileSync(join(DATA, name + '.json'), JSON.stringify(data))

  async function prepare(w, lang) {
    await w.goto()
    const tag = SHORT[lang]
    if ((await w.evaluate('document.documentElement.lang')) !== tag) {
      await w.evaluate(`document.querySelector('#language-switcher input[value="${tag}"]').closest('label').setAttribute('data-audit-target', '1')`)
      await w.click('[data-audit-target="1"]')
      await w.evaluate(`document.querySelector('[data-audit-target]').removeAttribute('data-audit-target')`)
      await sleep(500)
    }
    const now = await w.evaluate('document.documentElement.lang')
    if (now !== tag) throw new Error('language not switched: ' + now)
    if (!(await w.evaluate(`document.querySelector('#video-kind input[value="staff"]').checked`))) await w.click('#video-kind input[value="staff"]')
    await sleep(300)
  }
  async function toReady(w) {
    await w.setFiles(F('lecture-60s.mp4'))
    await w.waitSettled()
    await sleep(400)
  }
  async function toFinished(w) {
    // A phone shows "Continue anyway" in Create's place, sometimes a moment after the check settles.
    const ackShown = `(() => { const b = document.querySelector(${JSON.stringify(w.acknowledgeButton())}); return !!b && !b.hidden; })()`
    for (let attempt = 0; attempt < 3; attempt++) {
      await sleep(800)
      if (await w.evaluate(ackShown)) { await w.click(w.acknowledgeButton()); await sleep(300) }
      await w.click(w.createButton())
      await sleep(400)
      if (await w.evaluate(`!!document.querySelector('#process-result .button--danger')`)) await w.click('#process-result .button--danger')
      try { await w.waitFor(`(() => { const t = document.getElementById('process-progress-text'); return t && !t.hidden && t.textContent.trim().length > 0; })()`, { timeout: 8000, label: 'running' }); break } catch (e) { w.log('not running yet, attempt ' + attempt) }
    }
    await w.waitRunning()
    await w.waitFinished()
    await w.evaluate('document.activeElement && document.activeElement.blur()')
  }
  async function tabWalk(w, max = 140) {
    await w.evaluate('(() => { if (document.activeElement) document.activeElement.blur(); window.scrollTo(0, 0); })()')
    // Start from the very top: a throwaway button first in <body>, focused, then Tab, so the skip link is the first stop.
    await w.evaluate(`(() => { const p = document.createElement('button'); p.id = '__start'; p.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;opacity:0'; document.body.prepend(p); p.focus(); })()`)
    const stops = []
    let left = false, last = ''
    for (let i = 0; i < max; i++) {
      await w.press('Tab')
      if (i === 0) await w.evaluate(`document.getElementById('__start').remove()`)
      await sleep(30)
      const info = await w.evaluate('window.__wcag.ring()')
      if (info.el === 'body') { if (left) break; continue }
      left = true
      if (info.el === last) continue // the native player's inner controls
      if (stops.length && info.el === stops[0].el) break
      last = info.el
      stops.push(info)
    }
    return stops
  }

  // Desktop: 1280 measures, then the 320 and 640 views of the same state.
  for (const lang of langs) {
    const w = new WWalk(browser, `wcag-${lang}-desktop`)
    await w.open()
    try {
      await prepare(w, lang)
      const states = [['01', 'empty', null], ['02', 'ready', toReady], ['03', 'finished', toFinished]]
      for (const [nn, state, go] of states) {
        if (go) await go(w)
        const name = `${lang}-${nn}-${state}`
        const rec = { lang, state, fixed: await w.evaluate('window.__wcag.fixedCount()') }
        await w.evaluate('document.activeElement && document.activeElement.blur()')
        rec.contrastLight = await w.evaluate('window.__wcag.contrast()')
        await w.setTheme('dark')
        rec.contrastDark = await w.evaluate('window.__wcag.contrast()')
        await w.setTheme('light')
        rec.targets1280 = await w.evaluate('window.__wcag.targets()')
        rec.lines1280 = await w.evaluate('window.__wcag.lines()')
        rec.overflow1280 = await w.evaluate('window.__wcag.overflow()')
        await w.spacing(true)
        rec.spacing1280 = await w.evaluate('window.__wcag.textSpacing()')
        if (lang === 'en' && state === 'ready') await w.shot('before-1280-en-textspacing-02-ready')
        await w.spacing(false)
        if (lang === 'en' && state !== 'finished') {
          for (const theme of ['light', 'dark', 'forced']) {
            await w.setTheme(theme)
            rec['tab-' + theme] = await tabWalk(w)
            if (state === 'ready') { await w.evaluate(`(() => { const el = document.getElementById('trim-start-range'); const p = document.createElement('button'); p.id = '__probe'; p.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0'; el.parentElement.insertBefore(p, el); p.focus(); })()`); await w.press('Tab'); await w.evaluate(`document.getElementById('__probe').remove()`); rec['thumb-' + theme] = await w.evaluate('window.__wcag.ring()'); await w.clip('thumb-focus-' + theme, '#trim-track', { pad: 24 }) }
            w.log(`${name} tab walk ${theme}: ${rec['tab-' + theme].length} stops`)
            if (theme === 'forced' && state === 'empty') {
              await w.evaluate('(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); })()')
              await w.page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 4, y: 4, button: 'left', clickCount: 1 })
              await w.page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 4, y: 4, button: 'left', clickCount: 1 })
              for (let i = 0; i < 6; i++) { await w.press('Tab'); if (await w.evaluate(`!!document.activeElement.closest('#language-switcher')`)) break }
              rec.forcedHeaderRing = await w.evaluate('window.__wcag.ring()')
              const shot = await w.page.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1280, height: 120, scale: 1 } })
              writeFileSync(join(EVIDENCE, 'before-1280-en-forced-focus-header.png'), Buffer.from(shot.data, 'base64'))
            }
          }
          await w.setTheme('light')
        }
        for (const view of ['reflow320', 'zoom200']) {
          await w.setView(view)
          await sleep(400)
          rec['overflow-' + view] = await w.evaluate('window.__wcag.overflow()')
          if (view === 'reflow320') {
            await w.spacing(true)
            rec.spacing320 = await w.evaluate('window.__wcag.textSpacing()')
            await w.spacing(false)
            if (lang === 'ms' && state === 'ready') await w.shot('before-320-ms-02-ready')
          }
          if (view === 'zoom200' && lang === 'en' && state === 'ready') await w.shot('before-640-en-zoom200-02-ready')
          const o = rec['overflow-' + view]
          if (o.hscroll) await w.shot(`wcag-hscroll-${view}-${lang}-${nn}-${state}`)
        }
        await w.setView('desktop')
        await sleep(300)
        save(name, rec)
        w.log(`${name}: saved`)
      }
    } catch (e) {
      w.log('FAILED: ' + (e.stack ?? e.message))
    } finally { await w.close() }

    // Phone: 375 targets.
    const p = new WWalk(browser, `wcag-${lang}-phone`, { phone: true, noPicker: true })
    await p.open()
    try {
      await prepare(p, lang)
      const out = {}
      out.empty = await p.evaluate('window.__wcag.targets()')
      await toReady(p)
      out.ready = await p.evaluate('window.__wcag.targets()')
      await toFinished(p)
      out.finished = await p.evaluate('window.__wcag.targets()')
      save(`${lang}-phone-targets`, out)
    } catch (e) {
      p.log('FAILED: ' + (e.stack ?? e.message))
    } finally { await p.close() }
  }
}

let browser
// ---------------------------------------------------------------------------
// Report.
function report(dataDir, outFile) {
  const files = readdirSync(dataDir).filter((f) => f.endsWith('.json'))
  const D = Object.fromEntries(files.map((f) => [f.replace('.json', ''), JSON.parse(readFileSync(join(dataDir, f), 'utf8'))]))
  const states = Object.keys(D).filter((k) => !k.includes('phone')).sort()
  const md = []
  const uniqBy = (arr, key) => { const m = new Map(); for (const x of arr) { const k = key(x); if (!m.has(k)) m.set(k, { ...x, where: new Set() }); m.get(k).where.add(x.where) } return [...m.values()] }
  const table = (head, rows) => rows.length ? `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n` + rows.map((r) => `| ${r.map((c) => String(c ?? '').replace(/\|/g, '\\|')).join(' | ')} |`).join('\n') + '\n' : '_none_\n'
  md.push("<!-- markdownlint-disable -->", "")
  md.push(`# WCAG 2.2 AAA checks — current page (VH-163, 2026-10-22)

Measured with \`walker/wcag-checks.mjs\` (walk.mjs's Walk and __audit helpers plus its own in-page instruments), headless Chrome 155, Vite dev build, staff video type, en-GB / zh-Hans / ms-MY, states empty → ready (lecture-60s read) → finished. Views: 1280×900 desktop; 375×812 mobile emulation (targets); 320×568 (reflow, walk.mjs \`reflow320\`); 640×450 at DPR 2 (what 200 % zoom of a 1280 window lays out as, walk.mjs \`zoom200\`). Re-run: \`FIX=… OUT_ROOT=… EVIDENCE=… node wcag-checks.mjs\` then \`node wcag-checks.mjs --report <scratch>/wcag <this file>\`.
`)
  // 1. contrast
  const cfails = []
  let runs = 0
  for (const k of states) for (const [theme, list] of [['light', D[k].contrastLight], ['dark', D[k].contrastDark]]) { runs += list.length; for (const c of list) if (c.ratio < c.need) cfails.push({ ...c, theme, where: `${D[k].lang}/${D[k].state}/${theme}` }) }
  const cf = uniqBy(cfails, (c) => c.theme + c.el + c.fg + c.bg)
  const exempt = cf.filter((c) => c.disabled)
  const real = cf.filter((c) => !c.disabled)
  const bandRuns = states.flatMap((k) => [...D[k].contrastLight, ...D[k].contrastDark]).filter((c) => c.band)
  const minOf = (list) => list.reduce((m, c) => (c.ratio < m.ratio ? c : m), { ratio: 99 })
  md.push(`## 1. 1.4.6 Contrast (enhanced) — ${real.length ? 'FAIL' : 'PASS'}\n\n${runs} text-run measurements (light + dark, 3 languages × 3 states). Under target: **${real.length}** distinct element/colour pairs on enabled content; ${exempt.length} more on disabled controls (exempt as inactive components). Band runs (header/footer blue): ${bandRuns.length}, lowest ${minOf(bandRuns).ratio}:1 (${minOf(bandRuns).el}). Lowest light: ${minOf(states.flatMap((k) => D[k].contrastLight)).ratio}:1 (${minOf(states.flatMap((k) => D[k].contrastLight)).el}); lowest dark: ${minOf(states.flatMap((k) => D[k].contrastDark)).ratio}:1 (${minOf(states.flatMap((k) => D[k].contrastDark)).el}). Text over a background image or gradient: ${states.flatMap((k) => [...D[k].contrastLight, ...D[k].contrastDark]).filter((c) => c.bgImage).length} runs (ratio taken against the colour behind it).\n`)
  md.push(table(['theme', 'element', 'text', 'ratio', 'need', 'fg on bg', 'size/weight', 'band', 'disabled', 'where'], cf.map((c) => [c.theme, c.el, c.text, c.ratio, c.need, `${c.fg} on ${c.bg}`, `${c.size}/${c.weight}`, c.band ? 'yes' : '', c.disabled ? 'yes' : '', [...c.where].join(' ')])))
  // 2. targets
  const small = (t) => (t.w < 44 || t.h < 44) && !(t.labelBox && t.labelBox.split('x').every((n) => Number(n) >= 44))
  const trows = []
  let tcount = 0
  for (const k of states) for (const t of D[k].targets1280) { tcount++; if (small(t)) trows.push({ ...t, width: 1280, where: `${D[k].lang}/${D[k].state}` }) }
  for (const k of Object.keys(D).filter((k) => k.includes('phone'))) for (const [st, list] of Object.entries(D[k])) for (const t of list) { tcount++; if (small(t)) trows.push({ ...t, width: 375, where: `${k.slice(0, 2)}/${st}` }) }
  const tu = uniqBy(trows, (t) => t.width + t.el.replace(/"[^"]*"/, '') + t.w + 'x' + t.h)
  const texc = tu.filter((t) => t.inline || /^video/.test(t.el))
  const tfail = tu.filter((t) => !t.inline && !/^video/.test(t.el))
  md.push(`\n## 2. 2.5.5 Target size (enhanced) — ${tfail.length ? 'FAIL' : 'PASS'}\n\n${tcount} target measurements at 1280 and 375. Under 44×44 (a radio or checkbox counts by its label box): **${tfail.length}** distinct non-exempt targets; ${texc.length} exempt (inline links in a sentence, or the browser's own video controls).\n`)
  md.push(table(['width', 'target', 'w×h', 'label box', 'inline', 'disabled', 'where'], tu.map((t) => [t.width, t.el, `${t.w}×${t.h}`, t.labelBox, t.inline ? 'inline (exempt)' : /^video/.test(t.el) ? 'UA control (exempt)' : '', t.disabled ? 'yes' : '', [...t.where].join(' ')])))
  // 3. reflow / zoom
  md.push(`\n## 3. 1.4.10 Reflow (320) and 1.4.4 Resize text (640 = 200 % of 1280)\n`)
  const rrows = []
  let rf = 0
  for (const k of states) for (const v of ['reflow320', 'zoom200', '1280']) { const o = v === '1280' ? D[k].overflow1280 : D[k]['overflow-' + v]; if (!o) continue; if (o.hscroll || o.outsideViewport.length) rf++; rrows.push([D[k].lang, D[k].state, v, o.hscroll ? `**YES** ${o.scrollWidth}/${o.clientWidth}` : `no (${o.scrollWidth}/${o.clientWidth})`, o.outsideViewport.map((x) => `${x.el} [${x.left}..${x.right}]`).slice(0, 4).join('; '), o.outsideParent.map((x) => `${x.el} +${x.by}`).slice(0, 5).join('; '), o.scrollers.map((x) => `${x.el} ${x.scrollWidth}/${x.clientWidth}`).join('; ')]) }
  md.push(`${rf ? 'FAIL' : 'PASS'} — page sideways scroll or content outside the viewport in **${rf}** of ${rrows.length} view/state measurements. "Outside parent" lists boxes poking past their parent's border box by more than 1.5 px (often harmless: a ring, a -1 px seam, a native control).\n\n` + table(['lang', 'state', 'view', 'h-scroll (scrollWidth/clientWidth)', 'outside viewport', 'outside parent', 'own sideways scroller'], rrows))
  // 4. text spacing
  const srows = []
  let sf = 0
  for (const k of states) for (const v of ['1280', '320']) { const s = D[k]['spacing' + v]; if (!s) continue; if (s.clipped.length || s.overlaps.length) sf++; srows.push([D[k].lang, D[k].state, v, s.clipped.map((c) => `${c.el} ${c.overflow} ${c.scroll} in ${c.client} "${c.text}"`).join('; ') || 'none', s.overlaps.map((o) => `${o.a} × ${o.b} (${o.w}×${o.h})`).slice(0, 4).join('; ') || 'none', s.spills.map((x) => `${x.el} ${x.scrollH}/${x.clientH}`).slice(0, 4).join('; ')]) }
  md.push(`\n## 4. 1.4.12 Text spacing — ${sf ? 'FAIL' : 'PASS'}\n\nwalk.mjs's sheet injected as !important (line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em, p margin-bottom 2em). Clipped = a box with overflow other than visible whose content is larger than it, or a form control whose text is taller than it; overlap = glyph boxes of two unrelated elements intersecting by more than 2×2 px; spill = text taller than a visible-overflow box (not clipped, listed for review). Measurements with clipping or overlap: **${sf}** of ${srows.length}.\n\n` + table(['lang', 'state', 'width', 'clipped', 'overlap', 'spill (review)'], srows))
  // 5. focus
  md.push(`\n## 5. 2.4.13 Focus appearance / 2.4.12 Focus not obscured (enhanced) — en, 1280\n`)
  const frows = []
  let ff = 0
  for (const k of states.filter((k) => k.startsWith('en-'))) for (const theme of ['light', 'dark', 'forced']) { const stops = D[k]['tab-' + theme]; if (!stops) continue
    for (const s of stops) { const bad = []; if (!s.focusVisible) bad.push('not :focus-visible'); if (s.style === 'none' || s.width < 2) bad.push('ring under 2px'); if (theme !== 'forced' && s.vsAdjacent != null && s.vsAdjacent < 3) bad.push('ring under 3:1'); if (s.clippedBy.length) bad.push('clipped by ' + s.clippedBy.join(',')); if (s.coveredBy.length || s.obscuredInside.length) bad.push('covered ' + [...s.coveredBy, ...s.obscuredInside].join(',')); if (bad.length) ff++
      frows.push([D[k].state, theme, s.el.slice(0, 60), s.face, `${s.style} ${s.width}px +${s.offset}`, s.color, s.vsAdjacent != null ? `${s.vsAdjacent}:1 on ${s.adjacentBg}` : '', s.vsInner != null ? `${s.vsInner}:1` : '', bad.join('; ') || 'ok']) } }
  const ring = D['en-01-empty']?.forcedHeaderRing
  md.push(`${ff ? 'FAIL' : 'PASS'} — stops with a problem: **${ff}** of ${frows.length}. Fixed or sticky elements on the page: ${D['en-01-empty']?.fixed.length ? D['en-01-empty'].fixed.join(', ') : 'none'}. In forced colours the contrast column is what Chrome computes before the user's palette, so it is listed but not judged.\n\nHeader Page language segment under forced colours: ring ${ring ? `${ring.style} ${ring.width}px +${ring.offset} ${ring.color} on ${ring.adjacentBg} (${ring.vsAdjacent}:1), face ${ring.face}` : 'not reached'} — ${ring && /255, 255, 255/.test(ring.color) ? 'white, as --focus' : 'NOT white'}.\n\n` + table(['state', 'theme', 'stop', 'ring on', 'style', 'colour', 'vs adjacent bg', 'vs inner', 'verdict'], frows))
  // 6. line length
  md.push(`\n## 6. 1.4.8 Line length (1280, running text: p, li, dd, .helper, .notification-body)\n\nPer rendered line, via a Range per character grouped by line. en/ms count characters with spaces; zh counts glyphs without spaces (lines that hold any CJK). Lines are de-duplicated across the three states. Limit: 80 characters, 40 CJK glyphs.\n`)
  const lrows = []
  for (const lang of ['en', 'zh', 'ms']) { const all = new Map(); for (const k of states.filter((k) => k.startsWith(lang + '-'))) for (const l of D[k].lines1280) all.set(l.key + '|' + l.fontSize, l)
    const ls = [...all.values()]; for (const fs of [...new Set(ls.map((l) => l.fontSize))].sort((a, b) => b - a)) { const xs = ls.filter((l) => l.fontSize === fs); const val = (l) => (lang === 'zh' && l.cjk ? l.glyphs : l.chars); const fw = xs.filter((l) => l.cjk).map((l) => l.fwe ?? l.glyphs).sort((a, b) => a - b); const vs = xs.map(val).sort((a, b) => a - b); const p95 = vs[Math.min(vs.length - 1, Math.ceil(vs.length * 0.95) - 1)]; const top = xs.reduce((m, l) => (val(l) > val(m) ? l : m)); const lim = lang === 'zh' && top.cjk ? 40 : 80; const over = xs.filter((l) => val(l) > (lang === 'zh' && l.cjk ? 40 : 80)).length
      lrows.push([lang, fs, xs.length, vs[vs.length - 1], p95, fw.length ? `${fw[fw.length - 1]} / ${fw[Math.min(fw.length - 1, Math.ceil(fw.length * 0.95) - 1)]}` : '', over ? `**${over}** (${xs.filter((l) => val(l) > (lang === 'zh' && l.cjk ? 40 : 80)).map((l) => (l.cjk ? l.glyphs + ' glyphs' : l.chars + ' chars') + ' in ' + l.block).join('; ')})` : '0', `${top.block} "${top.text}"`]) } }
  md.push(table(['lang', 'font px', 'lines', 'max', 'p95', 'CJK lines in full-width equivalents (max / p95; Latin = ½)', 'over limit', 'longest line'], lrows))
  writeFileSync(outFile, md.join('\n'))
  console.log('wrote ' + outFile)
}

// ---------------------------------------------------------------------------
if (process.argv[2] === '--report') {
  report(process.argv[3], process.argv[4])
} else {
  const { connectBrowser } = await import('./cdp.mjs')
  browser = await connectBrowser()
  console.log('connected to ' + browser.version.Browser)
  const langs = process.argv.slice(2).length ? process.argv.slice(2) : ['en', 'zh', 'ms']
  await run(langs)
  browser.close()
}
