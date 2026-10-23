// PLAN-7 (VH-171): the instruments the second pass adds to walk.mjs's Walk.
// Each returns { outcome: 'pass' | 'fail' | 'cannot-determine', ... }, so no
// instrument passes by saying nothing. Built on Chrome's own protocol only:
// the Accessibility domain, Input key events, screenshots compared pixel by
// pixel in a blank analysis tab, Emulation and Page.setFontSizes.
import { route, unroute } from './faults.mjs'
import { Buffer } from 'node:buffer'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// In-page helpers, installed beside walk.mjs's __audit.
export const QUAL_INIT = String.raw`
(() => {
  const Q = (window.__qual = {});
  const parse = (c) => { c = String(c); let m = c.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
    m = c.match(/color\(srgb ([^)]+)\)/); if (m) { const p = m[1].split(/[\s\/]+/).filter(Boolean).map(Number); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 }; } return null; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  // Unrounded: thresholds are compared on the raw ratio; rows show it to 4 places (VH-171, Codex astra's method check M-02).
  const ratio = (a, b) => { const L1 = lum(a), L2 = lum(b); return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };
  const r4 = (x) => Math.round(x * 1e4) / 1e4;
  const rgb = (c) => 'rgb(' + Math.round(c.r) + ', ' + Math.round(c.g) + ', ' + Math.round(c.b) + ')';
  // The background behind an element; unknown when an image or gradient sits under it.
  const bgOf = (el) => { let e = el, acc = null; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') return { unknown: 'background image on ' + e.tagName.toLowerCase() }; const c = parse(cs.backgroundColor); if (c && c.a > 0) { if (c.a >= 1) return { c: acc ? over(acc, c) : c }; acc = acc ? over(acc, c) : c; } e = e.parentElement; }
    const canvas = parse(getComputedStyle(document.documentElement).backgroundColor); const base = canvas && canvas.a >= 1 ? canvas : { r: 255, g: 255, b: 255, a: 1 }; return { c: acc ? over(acc, base) : base }; };
  // Paint computed colours cannot account for: opacity, a filter or a blend on the element or an ancestor.
  const veil = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (parseFloat(cs.opacity) < 1) return 'opacity ' + cs.opacity + ' on ' + e.tagName.toLowerCase() + (e.id ? '#' + e.id : ''); if (cs.filter && cs.filter !== 'none') return 'filter on ' + e.tagName.toLowerCase(); if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') return 'blend mode on ' + e.tagName.toLowerCase(); } return null; };
  const forcedNow = () => matchMedia('(forced-colors: active)').matches;
  // Wholly outside the page (a skip link before it is focused): no reader or pointer reaches it there.
  const offPage = (el) => { const r = el.getBoundingClientRect(); const d = document.documentElement; return r.bottom + scrollY <= 0 || r.right + scrollX <= 0 || r.top + scrollY >= d.scrollHeight || r.left + scrollX >= d.scrollWidth; };
  const largeText = (cs) => { const s = parseFloat(cs.fontSize); return s >= 24 || (parseInt(cs.fontWeight, 10) >= 700 && s >= 18.66); };
  const behindModal = (el) => { const modal = Array.from(document.querySelectorAll('dialog[open]')).find((d) => d.matches(':modal')); return (!!modal && !modal.contains(el)) || !!el.closest('[inert]'); };
  const desc = (el) => (window.__audit ? window.__audit.desc(el) : el.tagName.toLowerCase());
  const cheap = (el) => !el || el.nodeType !== 1 ? String(el && el.nodeName) : el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + (el.type ? '[' + el.type + ']' : '');
  const visible = (el) => (window.__audit ? window.__audit.visible(el) : !!(el.getBoundingClientRect().width));
  const LIVE = '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"], output';
  const regionName = (r) => r.id ? '#' + r.id : cheap(r);

  // A timestamped log of DOM changes: live regions' text and attributes, and
  // the accessibility-relevant attributes anywhere (aria-*, role, hidden,
  // disabled, open, inert). Exposure, not speech (M-05).
  Q.log = []; const t0 = performance.now(); const lastLive = new WeakMap();
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (Q.log.length >= 5000) { if (!Q.logFull) { Q.logFull = true; Q.log.push({ t: Math.round(performance.now() - t0), kind: 'cap', note: 'log capped at 5000 entries' }); } return; }
      const tgt = m.target.nodeType === 1 ? m.target : m.target.parentElement;
      if (!tgt || (tgt.closest && tgt.closest('style, script, #__qual-hide, #__audit-spacing'))) continue;
      const live = tgt.closest ? tgt.closest(LIVE) : null;
      const t = Math.round(performance.now() - t0);
      if (m.type === 'attributes') {
        const a = m.attributeName;
        if (!live && !/^(aria-.*|role|hidden|disabled|open|inert|lang|tabindex)$/.test(a)) continue;
        if (live && /^(style)$/.test(a)) continue;
        Q.log.push({ t, kind: 'attr', el: cheap(tgt), attr: a, from: m.oldValue == null ? null : String(m.oldValue).slice(0, 80), to: tgt.hasAttribute(a) ? String(tgt.getAttribute(a)).slice(0, 80) : null, live: live ? regionName(live) : undefined });
      } else if (live) {
        const text = (live.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 240);
        if (lastLive.get(live) === text) continue; lastLive.set(live, text);
        Q.log.push({ t, kind: 'live-text', region: regionName(live), hidden: !!(live.closest('[hidden]')), text });
      } else if (m.type === 'childList') {
        const els = (list) => Array.from(list).filter((n) => n.nodeType === 1 && !/^(STYLE|SCRIPT|LINK|META)$/.test(n.tagName) && n.id !== '__qual-mirror');
        const added = els(m.addedNodes), removed = els(m.removedNodes);
        if (added.length || removed.length) Q.log.push({ t, kind: 'nodes', el: cheap(tgt), added: added.map(cheap).slice(0, 4), removed: removed.map(cheap).slice(0, 4) });
      }
    }
  }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeOldValue: true });
  Q.mutations = (from) => ({ from: from || 0, to: Q.log.length, label: 'DOM and live-region changes: exposure, not speech', entries: Q.log.slice(from || 0) });

  // The focused element's identity and value, and every status region's text (M-05).
  Q.focused = () => { const a = document.activeElement; if (!a || a === document.body) return { el: 'body' }; return { el: desc(a).slice(0, 90), id: a.id || undefined, value: typeof a.value === 'string' && a.type !== 'file' ? a.value.slice(0, 80) : undefined, checked: typeof a.checked === 'boolean' && /radio|checkbox/.test(a.type) ? a.checked : undefined, valuetext: a.getAttribute('aria-valuetext') || undefined, expanded: a.getAttribute('aria-expanded') || undefined }; };
  Q.statusText = () => { const seen = new Set(); return Array.from(document.querySelectorAll(LIVE + ', #status, #source-status, #process-status, #save-status')).filter((r) => { if (seen.has(r)) return false; seen.add(r); return true; }).map((r) => ({ region: regionName(r), text: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160) })).filter((x) => x.text); };

  // What the page is showing: the state assertion every record carries.
  Q.observed = () => {
    const shown = (id) => { const el = document.getElementById(id); return !!el && visible(el); };
    const dialog = document.querySelector('dialog[open]');
    const checked = (name) => { const el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : null; };
    const body = getComputedStyle(document.body);
    return {
      lang: document.documentElement.lang,
      viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
      rootFontPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
      media: {
        dark: matchMedia('(prefers-color-scheme: dark)').matches,
        forced: matchMedia('(forced-colors: active)').matches,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        coarse: matchMedia('(pointer: coarse)').matches,
      },
      spacing: !!document.getElementById('__audit-spacing'),
      fonts: Array.from(document.fonts).map((f) => f.family.replace(/"/g, '') + ':' + f.status),
      bodyFont: body.fontFamily,
      dialog: dialog ? dialog.id || 'dialog' : null,
      running: shown('process-progress'),
      result: (() => { const r = document.getElementById('process-result'); return !!r && r.children.length > 0 && visible(r); })(),
      statementOpen: !!(document.getElementById('accessibility-statement') || {}).open,
      fileChosen: !!(document.getElementById('file-input') || {}).files?.length,
      kind: checked('video-kind'),
      status: ((document.getElementById('status') || {}).textContent || '').trim().slice(0, 120),
      sourceStatus: ((document.getElementById('source-status') || {}).textContent || '').trim().slice(0, 120),
      active: window.__audit ? window.__audit.focusInfo().el : String(document.activeElement && document.activeElement.tagName),
    };
  };

  // A range thumb's box: the input is pointer-events none and its thumb auto,
  // so a hit test over the thumb reaches the input (VH-171, settled by probe:
  // 22 hits at 2 px across each axis). Its box is where a hit test reaches
  // the input, scanned at 1 px around where the value puts it, never the
  // input's height, which grows with the default font (VH-171, pilot 2: 0 px²
  // at the 32 px font); centred on the value at its rule's size if nothing
  // is hit (off screen).
  Q.thumbBox = (el) => {
    if (typeof el === 'string') el = document.querySelector(el);
    const r = el.getBoundingClientRect();
    const s = parseFloat(getComputedStyle(el).getPropertyValue('--target-min')) || r.height;
    const v = (Number(el.value) - Number(el.min || 0)) / ((Number(el.max || 100) - Number(el.min || 0)) || 1);
    const x0 = r.left + v * (r.width - s);
    let l = Infinity, t = Infinity, rt = -Infinity, b = -Infinity;
    for (let x = Math.max(Math.floor(r.left), Math.floor(x0 - s)); x <= Math.min(r.right, x0 + 2 * s); x += 1)
      for (let y = Math.floor(r.top); y <= r.bottom; y += 1)
        if (document.elementsFromPoint(x + 0.5, y + 0.5).includes(el)) { l = Math.min(l, x); t = Math.min(t, y); rt = Math.max(rt, x + 1); b = Math.max(b, y + 1); }
    if (l === Infinity) return { x: x0, y: r.top + (r.height - s) / 2, w: s, h: s, found: 'centred on the value' };
    return { x: l, y: t, w: rt - l, h: b - t, found: 'hit test' };
  };

  // 2.5.5: the actual clickable area, found by hit-testing on a 2 px grid over
  // the element and its labels (wrapped labels' line boxes included); passes
  // when a 44 x 44 square of hits fits inside it. A range input is tested over
  // its thumb's box with a 4 px margin, never over the track.
  const CTRL ='button, a[href], input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"]), video, [role="slider"], [role="button"]';
  Q.targets = (min = 44, step = 2) => {
    const out = [];
    for (const el of document.querySelectorAll(CTRL)) {
      if (!visible(el)) continue;
      const modal = document.querySelector('dialog[open]:modal');
      if ((modal && !modal.contains(el)) || el.closest('[inert]')) { out.push({ el: desc(el).slice(0, 80), outcome: 'inert', why: 'behind a modal dialog or inert' }); continue; }
      if (offPage(el)) { out.push({ el: desc(el).slice(0, 80), outcome: 'off-page', why: 'positioned off the page until focused: read when shown (person check)' }); continue; }
      const thumb = el.type === 'range';
      const own = thumb ? null : el.closest('label');
      const parts = thumb ? [el] : [el, ...(el.labels ? Array.from(el.labels) : [])].filter(Boolean);
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      const rects = thumb ? (() => { const t = Q.thumbBox(el); return [{ left: t.x - 4, top: t.y - 4, right: t.x + t.w + 4, bottom: t.y + t.h + 4 }]; })() : parts.flatMap((p) => Array.from(p.getClientRects()));
      if (!rects.length) continue;
      const L = Math.floor(Math.min(...rects.map((r) => r.left))), T = Math.floor(Math.min(...rects.map((r) => r.top)));
      const R = Math.ceil(Math.max(...rects.map((r) => r.right))), B = Math.ceil(Math.max(...rects.map((r) => r.bottom)));
      // 2.5.5's inline exception, justified rather than guessed (M-01): a link
      // displayed inline whose line box it shares with text outside it.
      const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline' ? (() => {
        let block = el.parentElement; while (block && /^inline/.test(getComputedStyle(block).display)) block = block.parentElement;
        if (!block) return undefined;
        const own = Array.from(el.getClientRects());
        const tw = document.createTreeWalker(block, NodeFilter.SHOW_TEXT); let n; const range = document.createRange();
        while ((n = tw.nextNode())) { if (el.contains(n) || !n.textContent.trim()) continue; range.selectNodeContents(n);
          for (const r of range.getClientRects()) if (own.some((o) => (r.top + r.bottom) / 2 >= o.top && (r.top + r.bottom) / 2 <= o.bottom)) return 'in a sentence: an inline link sharing its line with text outside it (2.5.5 inline exception)'; }
        return undefined;
      })() : undefined;
      if (L < 0 || T < 0 || R > window.innerWidth || B > window.innerHeight) { out.push({ el: desc(el).slice(0, 80), outcome: 'cannot-determine', why: 'larger than the viewport or clipped', w: R - L, h: B - T, inline }); continue; }
      const cols = Math.max(1, Math.floor((R - L) / step)), rows = Math.max(1, Math.floor((B - T) / step));
      const hit = new Uint8Array(cols * rows); let hits = 0;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const t = document.elementFromPoint(L + i * step + step / 2, T + j * step + step / 2);
        const ok = !!t && (t === el || el.contains(t) || parts.some((q) => q !== el && (q === t || q.contains(t))) || (own && own.contains(t) && own.contains(el)));
        if (ok) { hit[j * cols + i] = 1; hits++; }
      }
      // A square of n x n cells all hit, by a running count of each column's run.
      const n = Math.ceil(min / step); const run = new Uint16Array(cols); let fits = false;
      for (let j = 0; j < rows && !fits; j++) { let streak = 0; for (let i = 0; i < cols; i++) { run[i] = hit[j * cols + i] ? run[i] + 1 : 0; streak = run[i] >= n ? streak + 1 : 0; if (streak >= n) { fits = true; break; } } }
      let hw = 0, hh = 0; { let l = cols, r = -1, t = rows, b = -1; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) if (hit[j * cols + i]) { l = Math.min(l, i); r = Math.max(r, i); t = Math.min(t, j); b = Math.max(b, j); } if (r >= 0) { hw = (r - l + 1) * step; hh = (b - t + 1) * step; } }
      // A disc 44 px across has a 44 x 44 bounding box but no 44 px square inside it: two readings, kept for VH-173.
      const disc = thumb && !fits && hw >= min && hh >= min;
      out.push({ el: desc(el).slice(0, 80), outcome: hits === 0 || disc ? 'cannot-determine' : fits ? 'pass' : 'fail', why: hits === 0 ? 'nothing hit: covered or not hit-testable' : disc ? 'a disc: its hit box is ' + hw + ' x ' + hh + ', no 44 px square fits inside; the reading is VH-173\'s' : undefined, unresolved: disc ? 'interpretation' : undefined, hitW: hw, hitH: hh, hitArea: hits * step * step, inline, disabled: !!el.disabled, thumb: thumb || undefined });
    }
    window.scrollTo(0, 0);
    return out;
  };

  // Contrast beyond text nodes: field values, placeholders, the native file
  // button's text, control boundaries and SVG graphics (1.4.6, 1.4.11).
  // Ordinary text by computed style (1.4.6), replacing walk.mjs's reader in
  // the matrix (M-02): unrounded ratios, 4.5:1 for large text (24 px, or
  // 18.66 px bold), and "cannot determine" — never a silent skip — for an
  // unparsed colour, a background image, or opacity, a filter or a blend on
  // the element or an ancestor. Text behind a modal dialog (under its
  // backdrop) and in an inactive control is kept, exempt, with its reason.
  Q.contrastText = () => {
    const out = []; const seen = new Set();
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      const el = n.parentElement; if (!el || !n.textContent.trim() || seen.has(el) || !visible(el)) continue; seen.add(el);
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(el.tagName)) continue;
      const cs = getComputedStyle(el); const large = largeText(cs); const need = large ? 4.5 : 7;
      const row = { el: desc(el).slice(0, 70), text: n.textContent.trim().slice(0, 36), size: Math.round(parseFloat(cs.fontSize) * 10) / 10, bold: parseInt(cs.fontWeight, 10) >= 700, large, need };
      if (behindModal(el)) { out.push({ ...row, outcome: 'inert', why: 'behind a modal dialog or inert: under its backdrop' }); continue; }
      if (el.closest(':disabled, [aria-disabled="true"]')) { out.push({ ...row, outcome: 'inactive', why: 'part of an inactive control (1.4.6 exception)' }); continue; }
      if (offPage(el)) { out.push({ ...row, outcome: 'off-page', why: 'positioned off the page until focused: read when shown (person check)' }); continue; }
      // Under forced colours Chrome's computed -webkit-text-fill-color keeps the
      // unforced author colour while color is forced (VH-171, probed), so the
      // fill is read only outside forced colours.
      const fill = !forcedNow() && cs.webkitTextFillColor && cs.webkitTextFillColor !== cs.color ? cs.webkitTextFillColor : cs.color;
      const fg = parse(fill); if (!fg) { out.push({ ...row, outcome: 'cannot-determine', why: 'colour unparsed: ' + fill }); continue; }
      const v = veil(el); if (v) { out.push({ ...row, fg: fill, outcome: 'cannot-determine', why: v }); continue; }
      const bg = bgOf(el); if (bg.unknown) { out.push({ ...row, fg: fill, outcome: 'cannot-determine', why: bg.unknown }); continue; }
      const r = ratio(fg.a < 1 ? over(fg, bg.c) : fg, bg.c);
      out.push({ ...row, fg: fill, bg: rgb(bg.c), ratio: r4(r), outcome: r >= need ? 'pass' : 'fail' });
    }
    return out;
  };

  Q.contrastExtra = () => {
    const out = [];
    const push = (el, what, fgCss, need, bgEl) => { const bg = bgOf(bgEl || el); const fg = parse(fgCss); const v = veil(bgEl || el); if (!fg || bg.unknown || v) { out.push({ el: desc(el).slice(0, 70), what, outcome: 'cannot-determine', why: bg.unknown || v || 'colour unparsed: ' + fgCss }); return; } if (fg.a === 0) { out.push({ el: desc(el).slice(0, 70), what, outcome: 'not-applicable', why: 'transparent: nothing painted' }); return; } const f = fg.a < 1 ? over(fg, bg.c) : fg; const r = ratio(f, bg.c); out.push({ el: desc(el).slice(0, 70), what, fg: fgCss, ratio: r4(r), need, outcome: r >= need ? 'pass' : 'fail' }); };
    for (const el of document.querySelectorAll('input, textarea, select')) {
      if (!visible(el) || el.type === 'hidden') continue;
      const cs = getComputedStyle(el);
      const large = largeText(cs);
      if (el.type === 'file') { const b = getComputedStyle(el, '::file-selector-button'); const bb = parse(b.backgroundColor); const need = largeText(b) ? 4.5 : 7;
        if (bb && bb.a >= 1) { const fg = parse(b.color); const r = fg ? ratio(fg.a < 1 ? over(fg, bb) : fg, bb) : 0; out.push({ el: desc(el).slice(0, 70), what: 'file button text', fg: b.color, bg: b.backgroundColor, ratio: r4(r), need, outcome: !fg ? 'cannot-determine' : r >= need ? 'pass' : 'fail' }); } else push(el, 'file button text', b.color, need); if (b.borderTopStyle !== 'none') push(el, 'file button boundary', b.borderTopColor, 3); continue; }
      // A range's thumb and track are painted pseudo-elements; their colours
      // are not the input's border, so they are not read here (M-02).
      if (el.type === 'range') { out.push({ el: desc(el).slice(0, 70), what: 'range thumb and track', outcome: 'cannot-determine', why: 'painted pseudo-elements: non-text contrast needs a pixel reading (person check)' }); continue; }
      if (['radio', 'checkbox', 'color'].includes(el.type)) { if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) push(el, 'control boundary', cs.borderTopColor, 3, el.parentElement); continue; }
      if (el.value) push(el, 'value', cs.color, large ? 4.5 : 7);
      if (el.placeholder) push(el, 'placeholder', getComputedStyle(el, '::placeholder').color, large ? 4.5 : 7);
      if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) push(el, 'field boundary', cs.borderTopColor, 3, el.parentElement);
      else if (cs.borderBottomStyle !== 'none' && parseFloat(cs.borderBottomWidth) > 0) push(el, 'field boundary (bottom)', cs.borderBottomColor, 3, el.parentElement);
    }
    // Every shape in a meaningful graphic, its fill and its stroke each (M-02: the loop stopped after one).
    for (const svg of document.querySelectorAll('svg')) {
      if (!visible(svg) || svg.getAttribute('aria-hidden') === 'true' && !svg.closest('button, a')) continue;
      const done = new Set();
      for (const shape of svg.querySelectorAll('path, circle, ellipse, rect, polygon, polyline, line')) {
        const cs = getComputedStyle(shape);
        for (const [part, paint] of [['fill', cs.fill], ['stroke', cs.stroke]]) {
          if (!paint || paint === 'none' || (part === 'stroke' && parseFloat(cs.strokeWidth) === 0)) continue;
          const css = paint === 'currentcolor' ? cs.color : paint; const k = part + ' ' + css; if (done.has(k)) continue; done.add(k);
          if (/url\(/.test(css)) { out.push({ el: desc(svg).slice(0, 70), what: 'graphic ' + part, outcome: 'cannot-determine', why: 'paint server' }); continue; }
          push(svg, 'graphic ' + part + ' (' + shape.tagName + ')', css, 3);
        }
      }
    }
    return out;
  };

  // 1.4.8: raw rendered-line counts, character by character, visually hidden
  // text left out. A line mixing CJK and Latin is read two ways: each
  // character against 40, and CJK against 40 plus Latin against 80; when the
  // two readings disagree the line is "cannot determine", with both kept.
  // Every rendered line kept with its text (M-03): a character counts when
  // the browser paints it a box, rendered spaces included (a collapsed space
  // has none); inline runs on one visual line are joined by grouping
  // characters on vertical overlap and ordering them left to right; leading
  // and trailing spaces at a wrap are left out.
  const isCjk = (c) => /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef\u3000-\u303f]/.test(c);
  const renderedLines = (root, { maxRight = Infinity } = {}) => {
    const chars = []; const range = document.createRange();
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      if (n.parentElement.closest('.visually-hidden, [hidden]')) continue;
      const t = n.textContent;
      for (let i = 0; i < t.length; i++) {
        range.setStart(n, i); range.setEnd(n, i + 1); const r = range.getClientRects()[0];
        if (!r || r.width === 0 || r.right > maxRight + 0.5) continue;
        chars.push({ c: /\s/.test(t[i]) ? ' ' : t[i], l: r.left, r: r.right, t: r.top, b: r.bottom });
      }
    }
    const lines = [];
    for (const ch of chars) { const mid = (ch.t + ch.b) / 2; let L = lines.find((x) => mid >= x.t && mid <= x.b); if (!L) { L = { t: ch.t, b: ch.b, cs: [] }; lines.push(L); } L.cs.push(ch); }
    return lines.sort((a, b) => a.t - b.t).map((L) => {
      L.cs.sort((a, b) => a.l - b.l);
      let cs = L.cs; while (cs.length && cs[0].c === ' ') cs = cs.slice(1); while (cs.length && cs[cs.length - 1].c === ' ') cs = cs.slice(0, -1);
      const text = cs.map((c) => c.c).join(''); let cjk = 0; for (const c of text) if (isCjk(c)) cjk++;
      const latin = Array.from(text).length - cjk;
      const total = latin + cjk;
      const strict = total <= 40 || (cjk === 0 && total <= 80);
      const mixedOk = cjk / 40 + latin / 80 <= 1;
      const outcome = cjk === 0 ? (latin <= 80 ? 'pass' : 'fail') : latin === 0 ? (cjk <= 40 ? 'pass' : 'fail') : strict === mixedOk ? (strict ? 'pass' : 'fail') : 'cannot-determine';
      return { text, latin, cjk, chars: total, widthPx: cs.length ? Math.round(cs[cs.length - 1].r - cs[0].l) : 0, outcome };
    }).filter((x) => x.chars > 0);
  };
  // An input's value or a textarea's, laid out in a copy of the field's
  // content box with its type settings (a value has no text node to range over).
  const fieldLines = (el) => {
    const cs = getComputedStyle(el); const ta = el.tagName === 'TEXTAREA';
    const d = document.createElement('div'); d.id = '__qual-mirror';
    d.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;margin:0;padding:0;border:0;box-sizing:content-box';
    for (const p of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontStretch', 'fontKerning', 'fontVariant', 'fontFeatureSettings', 'letterSpacing', 'wordSpacing', 'lineHeight', 'textTransform', 'tabSize', 'wordBreak', 'direction']) d.style[p] = cs[p];
    const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    d.style.width = w + 'px'; d.style.whiteSpace = ta ? cs.whiteSpace : 'pre'; d.style.overflowWrap = ta ? cs.overflowWrap : 'normal';
    d.textContent = el.value || el.placeholder; document.body.append(d);
    try { const left = d.getBoundingClientRect().left; return renderedLines(d, { maxRight: ta ? Infinity : left + w }); } finally { d.remove(); }
  };
  // 1.4.8: raw rendered-line counts. A line mixing CJK and Latin is read two
  // ways: each character against 40, and CJK against 40 plus Latin against
  // 80; when the two disagree the line is "cannot determine", both kept. Each
  // block's widest line is also read against the house measure, 28rem (VH-173
  // interprets; the raw count is not its interpretation).
  Q.lines = () => {
    const out = [];
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize); const limitPx = 28 * rootPx;
    const row = (el, kind, lines) => {
      const rank = { fail: 3, 'cannot-determine': 2, pass: 1 };
      let worst = null; for (const L of lines) if (!worst || rank[L.outcome] > rank[worst.outcome] || (rank[L.outcome] === rank[worst.outcome] && L.chars > worst.chars)) worst = L;
      const widest = Math.max(...lines.map((L) => L.widthPx));
      return { el: desc(el).slice(0, 60), kind, lang: (el.closest('[lang]') || document.documentElement).getAttribute('lang'), fontSize: getComputedStyle(el).fontSize, boxPx: Math.round(el.getBoundingClientRect().width), house: { limitPx, widestLinePx: widest, within: widest <= limitPx + 0.5 }, lines, worst: { text: worst.text.slice(0, 120), latin: worst.latin, cjk: worst.cjk, chars: worst.chars, widthPx: worst.widthPx }, outcome: worst.outcome, why: worst.outcome === 'cannot-determine' ? 'mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173\'s' : undefined, unresolved: worst.outcome === 'cannot-determine' ? 'interpretation' : undefined };
    };
    for (const el of document.querySelectorAll('p, li, dd, dt, label, legend, summary, h1, h2, h3, .notification-body, .fact-note, .radio-detail')) {
      if (!visible(el) || el.querySelector('p, li, dd, dt')) continue;
      const lines = renderedLines(el); if (lines.length) out.push(row(el, 'text', lines));
    }
    for (const el of document.querySelectorAll('textarea, input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"], input[type="number"]')) {
      if (!visible(el) || !(el.value || el.placeholder)) continue;
      const lines = fieldLines(el); if (lines.length) out.push(row(el, el.value ? 'value' : 'placeholder', lines));
    }
    return out;
  };

  // 1.4.10 beyond the document's width (M-04): text cut by an ancestor that
  // clips (overflow hidden or clip, an ellipsis included), text spilling out
  // of a box held at a set height, and elements beyond the viewport carrying
  // text or a control. Text an ancestor scrolls is kept as "scrolls", not lost.
  Q.overflow = () => {
    const vw = document.documentElement.clientWidth;
    const hscroll = document.documentElement.scrollWidth > vw;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el)) continue; const r = el.getBoundingClientRect();
      if (!(r.right > vw + 1 || r.left < -1)) continue;
      let content = /^(BUTTON|A|INPUT|SELECT|TEXTAREA|SUMMARY|VIDEO)$/.test(el.tagName) ? 'a control' : null;
      if (!content) for (const n of el.childNodes) { if (n.nodeType !== 3 || !n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); if (Array.from(rg.getClientRects()).some((q) => q.width > 0 && (q.right > vw + 1 || q.left < -1))) { content = 'text'; break; } }
      offenders.push({ el: desc(el).slice(0, 80), left: Math.round(r.left), right: Math.round(r.right), content: content || undefined, outcome: content ? 'fail' : 'not-applicable', why: content ? content + ' beyond the viewport' : 'no text or control beyond the viewport' });
    }
    const clipped = [], scrolls = [], spills = []; const tested = new Map();
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      const p = n.parentElement; if (!p || !n.textContent.trim() || !visible(p)) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      const rs = Array.from(rg.getClientRects()).filter((q) => q.width > 0 && q.height > 0); if (!rs.length) continue;
      const box = { l: Math.min(...rs.map((q) => q.left)), r: Math.max(...rs.map((q) => q.right)), t: Math.min(...rs.map((q) => q.top)), b: Math.max(...rs.map((q) => q.bottom)) };
      const snippet = n.textContent.trim().replace(/\s+/g, ' ').slice(0, 50);
      let block = null;
      for (let a = p; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (!block && !/^(inline|contents)/.test(cs.display)) block = a;
        const cx = cs.overflowX !== 'visible', cy = cs.overflowY !== 'visible';
        if (!cx && !cy) continue;
        const ar = a.getBoundingClientRect();
        const inner = { l: ar.left + parseFloat(cs.borderLeftWidth), r: ar.right - parseFloat(cs.borderRightWidth), t: ar.top + parseFloat(cs.borderTopWidth), b: ar.bottom - parseFloat(cs.borderBottomWidth) };
        const lostX = cx ? Math.max(0, inner.l - box.l, box.r - inner.r) : 0, lostY = cy ? Math.max(0, inner.t - box.t, box.b - inner.b) : 0;
        if (lostX <= 2 && lostY <= 2) continue;
        const how = lostX > 2 ? cs.overflowX : cs.overflowY;
        const rowx = { text: snippet, by: desc(a).slice(0, 70), overflow: cs.overflowX + '/' + cs.overflowY, ellipsis: cs.textOverflow === 'ellipsis' || undefined, lostPx: Math.round(Math.max(lostX, lostY)) };
        if (/auto|scroll/.test(how)) scrolls.push({ ...rowx, outcome: 'not-applicable', why: 'reachable by scrolling its box' }); else clipped.push({ ...rowx, outcome: 'fail', why: 'cut by an ancestor that clips' });
        break;
      }
      // A box held at a set height (overflow visible): text past its bottom overlaps what follows.
      if (block && getComputedStyle(block).overflowY === 'visible') {
        const br = block.getBoundingClientRect(); const bcs = getComputedStyle(block);
        if (box.b > br.bottom - parseFloat(bcs.borderBottomWidth) + 2 || box.t < br.top + parseFloat(bcs.borderTopWidth) - 2) {
          if (!tested.has(block)) {
            const h0 = br.height; const old = block.style.cssText;
            block.style.setProperty('height', 'auto', 'important'); block.style.setProperty('max-height', 'none', 'important');
            const h1 = block.getBoundingClientRect().height; block.style.cssText = old;
            tested.set(block, h1 > h0 + 2);
          }
          if (tested.get(block)) spills.push({ text: snippet, by: desc(block).slice(0, 70), outcome: 'fail', why: 'text spills out of a box held at a set height' });
        }
      }
    }
    const fails = offenders.filter((o) => o.outcome === 'fail').length + clipped.length + spills.length;
    return { outcome: hscroll || fails ? 'fail' : 'pass', hscroll, scrollWidth: document.documentElement.scrollWidth, clientWidth: vw, offenders: offenders.slice(0, 12), offenderCount: offenders.length, clipped: clipped.slice(0, 12), clippedCount: clipped.length, spills: spills.slice(0, 12), spillCount: spills.length, scrolls: scrolls.slice(0, 6), scrollCount: scrolls.length };
  };

  // 2.3.3 under reduced motion (M-05): movement observed, not declarations
  // listed. A watch samples document.getAnimations() while the record is
  // driven (its focus measurements included). Spatial movement fails;
  // colour- or opacity-only change is not motion and is not counted; the
  // progress bar's movement is essential and classified so. A spatial
  // transition or animation declared but never seen running is "cannot
  // determine": nothing in this record triggered it.
  const SPATIAL = /^(transform|translate|rotate|scale|left|right|top|bottom|inset.*|width|height|outline-offset|outline-width|(min|max)-(width|height)|margin.*|padding.*|background-position.*|offset.*|scroll.*|font-size|letter-spacing|word-spacing|line-height|clip-path|perspective.*|all|x|y|cx|cy|r|d)$/;
  const ESSENTIAL = '#process-progress, progress, [role="progressbar"]';
  const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
  const propsOf = (a) => { if (a.transitionProperty) return [a.transitionProperty]; try { const ks = a.effect.getKeyframes(); const set = new Set(); for (const k of ks) for (const p of Object.keys(k)) if (!/^(offset|easing|composite|computedOffset)$/.test(p)) set.add(kebab(p)); return Array.from(set); } catch (e) { return []; } };
  const classify = (props, el) => (el && el.closest && el.closest(ESSENTIAL) ? 'essential' : props.some((p) => SPATIAL.test(p)) ? 'spatial' : 'non-spatial');
  Q.motionStart = () => {
    Q._seen = new Map();
    const tick = () => { for (const a of document.getAnimations()) { if (a.playState !== 'running') continue; const el = a.effect && a.effect.target; const props = propsOf(a); const name = a.animationName || a.transitionProperty || a.id || 'animation'; const k = cheap(el) + '|' + name; if (Q._seen.has(k)) continue; const timing = a.effect ? a.effect.getComputedTiming() : {}; Q._seen.set(k, { el: el ? desc(el).slice(0, 70) : 'none', kind: a.transitionProperty ? 'transition' : 'animation', name, props, durationMs: Math.round(Number(timing.duration) || 0), class: classify(props, el) }); } };
    tick(); clearInterval(Q._motionTimer); Q._motionTimer = setInterval(tick, 40);
  };
  Q.motionStop = () => {
    clearInterval(Q._motionTimer);
    const out = [];
    // A change over 10 ms or less is instant: nothing is seen to move.
    for (const m of (Q._seen || new Map()).values()) { const instant = m.durationMs <= 10 && m.class !== 'essential'; out.push({ ...m, seen: 'running', outcome: instant ? 'not-counted' : m.class === 'spatial' ? 'fail' : m.class === 'essential' ? 'essential' : 'not-counted', why: instant ? 'instant (' + m.durationMs + ' ms): no movement shown' : m.class === 'spatial' ? 'spatial movement ran under reduced motion' : m.class === 'essential' ? 'essential: it shows progress (2.3.3 exception)' : 'colour or opacity only: not motion' }); }
    const dur = (s) => Math.max(0, ...String(s).split(',').map((v) => parseFloat(v) * (/ms/.test(v) ? 1 : 1000) || 0));
    const seenEls = new Set(out.map((m) => m.el));
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el)) continue; const cs = getComputedStyle(el); const d = desc(el).slice(0, 70); if (seenEls.has(d)) continue;
      const props = []; if (cs.animationName !== 'none' && dur(cs.animationDuration) > 10) props.push('animation ' + cs.animationName); if (dur(cs.transitionDuration) > 10) for (const p of cs.transitionProperty.split(',')) props.push(p.trim());
      const spatial = props.filter((p) => SPATIAL.test(p) || /^animation /.test(p));
      if (!spatial.length) continue;
      const cl = el.closest(ESSENTIAL) ? 'essential' : 'spatial';
      out.push({ el: d, kind: 'declared', props: spatial, class: cl, seen: 'not triggered', outcome: cl === 'essential' ? 'essential' : 'cannot-determine', why: cl === 'essential' ? 'essential: it shows progress (2.3.3 exception)' : 'declared, not triggered in this record' });
    }
    return out;
  };

})();
`

// ---------------------------------------------------------------------------
// The assertion each record carries: the language, mode and state reached.
export async function assertReached(w, expect) {
  const seen = await w.evaluate('window.__qual.observed()')
  const problems = []
  if (expect.lang && seen.lang !== expect.lang) problems.push(`lang ${seen.lang}, expected ${expect.lang}`)
  const m = expect.mode ?? 'light'
  const want = {
    light: { dark: false, forced: false },
    dark: { dark: true, forced: false },
    'forced-light': { dark: false, forced: true },
    'forced-dark': { dark: true, forced: true },
    'reduced-motion': { reducedMotion: true },
    spacing: {},
    fallback: {},
    font32: {},
  }[m] ?? {}
  for (const [k, v] of Object.entries(want)) if (seen.media[k] !== v) problems.push(`${k} ${seen.media[k]}, expected ${v}`)
  if (m === 'spacing' && !seen.spacing) problems.push('text spacing sheet absent')
  if (m === 'font32' && seen.rootFontPx !== 32) problems.push(`root font ${seen.rootFontPx}px, expected 32px`)
  if (m === 'fallback' && seen.fonts.some((f) => /:loaded$/.test(f))) problems.push('a brand face loaded: ' + seen.fonts.filter((f) => /:loaded$/.test(f)).join(', '))
  if (expect.width && seen.viewport.w !== expect.width) problems.push(`viewport ${seen.viewport.w}, expected ${expect.width}`)
  // The view actually reached, width, height and scale (M-01).
  if (expect.viewport) for (const [k, v] of Object.entries(expect.viewport)) if (seen.viewport[k] !== v) problems.push(`viewport ${k} ${seen.viewport[k]}, expected ${v}`)
  if (expect.state) {
    const ok = await w.evaluate(`(() => { try { return !!(${expect.state}); } catch (e) { return false; } })()`)
    if (!ok) problems.push('state predicate false: ' + expect.state.slice(0, 120))
  }
  return { outcome: problems.length ? 'fail' : 'pass', problems, seen }
}

// ---------------------------------------------------------------------------
// The accessibility tree, from Chrome's own Accessibility domain.
const INTERACTIVE_ROLES = new Set(['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio', 'slider', 'spinbutton', 'switch', 'tab', 'menuitem', 'option', 'searchbox', 'listbox', 'DisclosureTriangle'])
const prop = (node, name) => node.properties?.find((p) => p.name === name)?.value?.value

export async function axTree(w) {
  const p = w.page
  await p.send('Accessibility.enable')
  const { nodes } = await p.send('Accessibility.getFullAXTree')
  const rows = nodes.map((n) => ({
    id: n.nodeId,
    parent: n.parentId,
    dom: n.backendDOMNodeId,
    role: n.role?.value,
    name: n.name?.value ?? '',
    description: n.description?.value ?? '',
    value: n.value?.value ?? '',
    ignored: !!n.ignored,
    ignoredReasons: (n.ignoredReasons ?? []).map((r) => r.name),
    focusable: !!prop(n, 'focusable'),
    disabled: !!prop(n, 'disabled'),
    expanded: prop(n, 'expanded'),
    checked: prop(n, 'checked'),
    invalid: prop(n, 'invalid'),
    required: prop(n, 'required'),
    modal: !!prop(n, 'modal'),
    live: prop(n, 'live'),
    hiddenRoot: !!prop(n, 'hiddenRoot'),
  }))
  const byId = new Map(rows.map((r) => [r.id, r]))
  const kids = new Map()
  for (const r of rows) if (r.parent) { if (!kids.has(r.parent)) kids.set(r.parent, []); kids.get(r.parent).push(r) }
  const within = (r, pred) => { for (let q = r; q; q = byId.get(q.parent)) if (pred(q)) return q; return null }
  const exposed = rows.filter((r) => !r.ignored)
  const unnamed = exposed.filter((r) => INTERACTIVE_ROLES.has(r.role) && !r.name.trim())
  const modal = exposed.find((r) => r.role === 'dialog' && r.modal)
  // With a modal dialog open, nothing outside it may stay exposed but the
  // unnamed containers that hold it: text and controls alike (M-05: the
  // check had looked only at focusable nodes).
  const holders = new Set(); for (let q = modal && byId.get(modal.parent); q; q = byId.get(q.parent)) holders.add(q)
  const leaking = modal ? exposed.filter((r) => r !== modal && !holders.has(r) && !within(r, (q) => q === modal) && !(/^(none|generic|RootWebArea|LineBreak|InlineTextBox)$/.test(r.role ?? '') && !r.name.trim())) : []
  const problems = [
    ...unnamed.map((r) => ({ kind: 'no accessible name', role: r.role, dom: r.dom })),
    ...leaking.map((r) => ({ kind: 'exposed behind the modal dialog', role: r.role, name: r.name.slice(0, 60), dom: r.dom })),
  ]
  // A live region's content, not only its name: the text under it now.
  const textUnder = (r) => { const out = []; const walk = (q) => { if (q.ignored && q !== r) return; if (q.role === 'StaticText' && q.name) out.push(q.name); for (const k of kids.get(q.id) ?? []) walk(k) }; walk(r); return out.join(' ').replace(/\s+/g, ' ').trim() }
  const live = exposed.filter((r) => (r.live && r.live !== 'off') || /^(status|alert|log)$/.test(r.role ?? '')).map((r) => ({ role: r.role, live: r.live, name: r.name.slice(0, 80), text: textUnder(r).slice(0, 240) }))
  const summary = exposed.filter((r) => INTERACTIVE_ROLES.has(r.role) || /heading|dialog|status|alert|group|radiogroup|progressbar/.test(r.role ?? ''))
    .map((r) => ({ role: r.role, name: r.name.slice(0, 80), description: r.description.slice(0, 80), value: String(r.value).slice(0, 40), disabled: r.disabled || undefined, expanded: r.expanded, checked: r.checked, invalid: r.invalid && r.invalid !== 'false' ? r.invalid : undefined, required: r.required || undefined }))
  // `nodes`: the reader's full rows, parent links and ignored nodes included,
  // for the record to persist as an artifact (M-05). Exposure, not speech.
  return { outcome: rows.length < 3 ? 'cannot-determine' : problems.length ? 'fail' : 'pass', counts: { nodes: rows.length, exposed: exposed.length, interactive: exposed.filter((r) => INTERACTIVE_ROLES.has(r.role)).length }, problems, modal: modal ? modal.name : null, live, summary, label: 'accessibility-tree exposure, not speech', nodes: rows }
}

// ---------------------------------------------------------------------------
// Keyboard verification, apart from setup: keys only, never a click or a set
// value. Each step is a key and, optionally, what focus or state must follow.
const KEY = {
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
  Shift: { key: 'Shift', code: 'ShiftLeft', vk: 16 },
}
export async function key(w, name, { shift = false } = {}) {
  const k = KEY[name]
  const mods = shift ? 8 : 0
  await w.page.send('Input.dispatchKeyEvent', { type: k.text ? 'keyDown' : 'rawKeyDown', key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk, modifiers: mods, ...(k.text ? { text: k.text, unmodifiedText: k.text } : {}) })
  await w.page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk, modifiers: mods })
  await sleep(60)
}

/** A key held: keydown, then `during()` (a capture), then keyup (M-05: the pressed state). */
export async function holdKey(w, name, during, { shift = false } = {}) {
  const k = KEY[name]
  const mods = shift ? 8 : 0
  await w.page.send('Input.dispatchKeyEvent', { type: k.text ? 'keyDown' : 'rawKeyDown', key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk, modifiers: mods, ...(k.text ? { text: k.text, unmodifiedText: k.text } : {}) })
  try { await sleep(80); return await during() } finally {
    await w.page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk, modifiers: mods })
    await sleep(60)
  }
}

/** Text typed by keys, one character at a time (a keys-only route's text entry). */
export async function typeKeys(w, text) {
  for (const ch of text) {
    await w.page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ch, text: ch, unmodifiedText: ch })
    await w.page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch })
  }
  await sleep(60)
}

// Where focus may be while a native modal dialog is open: inside it, or out
// to the browser's own controls (body), never on the page behind it.
export const IN_DIALOG = `(() => { const d = document.querySelector('dialog[open]'); return !!d && d.contains(document.activeElement); })()`
export const IN_DIALOG_OR_OUT = `(() => { const d = document.querySelector('dialog[open]'); const a = document.activeElement; return !!d && (d.contains(a) || a === document.body || a === null); })()`

const truthy = (w, expr) => w.evaluate(`(() => { try { return !!(${expr}); } catch (e) { return false; } })()`)

/**
 * steps: [{ key, shift?, repeat?, expect?: RegExp source the focused element's
 * description must match, state?: a page expression, native?: true when the
 * step drives a native control the keys may not reach (its failure is
 * "cannot determine", never a pass), until?: RegExp source — Tab until focus
 * matches, at most `repeat` presses, type?: text typed by keys instead of
 * a key, value?: RegExp source the focused element's value must match }]
 * Each step keeps the focused element's identity and value, and every status
 * region's text, before and after it (M-05).
 *
 * VH-172 adds, each optional: `untilState` — press until a page expression
 * holds (a control whose name is the page's language, found by structure);
 * `text` — characters typed as key events (the same as `type`); `waitFor` —
 * a page expression awaited before the step is judged (a check, a job, a
 * save), `timeout` its bound; and `setup` — a documented non-key action
 * inside the route (the native file chooser is the browser's own, VH-168; a
 * fault), logged as setup, never counted as a key.
 */
export async function keysRoute(w, steps, { settle } = {}) {
  const log = []
  let failed = false, unknown = false
  for (const s of steps) {
    const before = await w.evaluate('window.__qual.observed().active')
    const beforeEvidence = await w.evaluate('({ focused: window.__qual.focused(), status: window.__qual.statusText() })')
    let presses = 0
    let waited = null
    const typed = s.type ?? s.text
    if (s.setup) {
      await s.setup(w)
    } else if (typed !== undefined) {
      await typeKeys(w, typed); presses = [...typed].length
    } else if (s.until || s.untilState) {
      const re = s.until ? new RegExp(s.until) : null
      for (; presses < (s.repeat ?? 40); ) { await key(w, s.key ?? 'Tab', { shift: s.shift }); presses++; if (re ? re.test(await w.evaluate('window.__qual.observed().active')) : await truthy(w, s.untilState)) break }
    } else if (s.key) for (let i = 0; i < (s.repeat ?? 1); i++) { await key(w, s.key, { shift: s.shift }); presses++ }
    if (settle && s.settle) await settle()
    if (s.wait) await sleep(s.wait)
    if (s.waitFor) {
      const t0 = Date.now()
      try { await w.waitFor(`(() => { try { return !!(${s.waitFor}); } catch (e) { return false; } })()`, { timeout: s.timeout ?? 120000, label: s.note }); waited = Date.now() - t0 } catch { waited = 'timed out after ' + (Date.now() - t0) + ' ms' }
    }
    const after = await w.evaluate('window.__qual.observed()')
    const visibleFocus = await w.evaluate(`(() => { const el = document.activeElement; return !!el && el !== document.body && el.matches(':focus-visible'); })()`)
    let outcome = 'pass'
    const want = s.until ?? s.expect
    if (typeof waited === 'string') outcome = s.native ? 'cannot-determine' : 'fail'
    if (outcome === 'pass' && want && !new RegExp(want).test(after.active)) outcome = s.native ? 'cannot-determine' : 'fail'
    if (outcome === 'pass' && s.untilState && !(await truthy(w, s.untilState))) outcome = s.native ? 'cannot-determine' : 'fail'
    if (outcome === 'pass' && s.state && !(await truthy(w, s.state))) outcome = s.native ? 'cannot-determine' : 'fail'
    const afterEvidence = await w.evaluate('({ focused: window.__qual.focused(), status: window.__qual.statusText() })')
    if (outcome === 'pass' && s.value !== undefined && !new RegExp(s.value).test(afterEvidence.focused.value ?? '')) outcome = 'fail'
    if (outcome === 'pass' && !s.setup && after.active !== 'body' && !visibleFocus && !s.noFocusRing) outcome = 'fail'
    if (outcome === 'fail') failed = true
    if (outcome === 'cannot-determine') unknown = true
    log.push({ key: s.setup ? 'setup' : typed !== undefined ? 'type ' + JSON.stringify(typed) : !s.key && !s.until && !s.untilState ? 'wait' : (s.shift ? 'Shift+' : '') + (s.key ?? 'Tab'), presses, from: before, to: after.active, focusVisible: visibleFocus, expect: want ?? s.untilState ?? null, value: s.value, waited: waited ?? undefined, outcome, note: s.note, before: beforeEvidence, after: afterEvidence })
  }
  return { outcome: failed ? 'fail' : unknown ? 'cannot-determine' : 'pass', steps: log }
}

// ---------------------------------------------------------------------------
// Rendered focus: the focused against the unfocused pixels of one control.
// The area whose colour changes by at least 3:1, against the area of a 2 CSS
// px perimeter of the unfocused control (2.4.13), in a blank analysis tab.
let analysis = null
async function analysisPage(browser) {
  if (!analysis) { analysis = await browser.newPage(); await analysis.send('Runtime.enable') }
  return analysis
}
export async function closeAnalysis() { if (analysis) { await analysis.close(); analysis = null } }

async function shot(w, clip) {
  const r = await w.page.send('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 }, captureBeyondViewport: false })
  return r.data
}

/** Focus `sel` as a keyboard user would see it: a real key event first, so Chrome shows :focus-visible. */
export async function focusByKeyboard(w, sel) {
  await key(w, 'Shift')
  await w.evaluate(`document.querySelector(${JSON.stringify(sel)}).focus()`)
  await sleep(120)
}

// The reference a ring is measured against (VH-171's instrument questions).
// Where the ring is drawn on a sub-component the browser paints as a
// pseudo-element, the perimeter is the sub-component's, never the whole
// input's: the file chooser's button, found by drawing the clip with and
// without it; a range thumb, read two ways, its 44 px box and its painted
// disc, and "cannot determine" when the two readings disagree.
const REFS = {
  'file-button': { hide: (sel) => `${sel}::file-selector-button { visibility: hidden !important; }` },
  thumb: { hide: (sel) => `${sel}::-webkit-slider-thumb { background: none !important; }` },
}

async function analyse(w, fn, ...b64s) {
  const a = await analysisPage(w.browser)
  return a.evaluate(`(async () => {
    const load = async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
    const L = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const K = (la, lb) => (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    const imgs = await Promise.all(${JSON.stringify(b64s)}.map(load));
    return (${fn})(imgs, L, K);
  })()`)
}

// The changed pixels between two shots: count at 3:1, any change, and the box of any change.
const DIFF = `(([A, B], L, K) => {
  if (A.width !== B.width || A.height !== B.height) return { error: 'size differs' };
  let changed3 = 0, changedAny = 0, best = 1, l = A.width, r = -1, t = A.height, b = -1;
  for (let i = 0; i < A.data.length; i += 4) {
    const k = K(L(A.data[i], A.data[i + 1], A.data[i + 2]), L(B.data[i], B.data[i + 1], B.data[i + 2]));
    if (k > 1.02) { changedAny++; const p = i / 4, x = p % A.width, y = (p - x) / A.width; l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); }
    if (k >= 3) changed3++; if (k > best) best = k;
  }
  return { w: A.width, h: A.height, changed3, changedAny, best: Math.round(best * 100) / 100, box: r < 0 ? null : { x: l, y: t, w: r - l + 1, h: b - t + 1 } };
})`

// Text contrast by glyph pixels (M-02): the pixels that change when only the
// text is made transparent (every other paint pinned to its computed value)
// are the glyphs; the shot without text gives the background under each.
// Each glyph pixel's contrast against its own background; the ratio is the
// one reached by the top 2% (glyph cores reach the ink's colour at the body
// size; a stray pixel cannot carry it). Unrounded; the glyphs must lie inside
// the button's content box, else "cannot determine".
const GLYPHS = (content) => `(([A, B], L, K) => {
  const cb = ${JSON.stringify(content)}; const ks = []; let l = A.width, r = -1, t = A.height, b = -1; const bg = new Map();
  for (let p = 0; p < A.width * A.height; p++) { const i = p * 4;
    const k = K(L(A.data[i], A.data[i + 1], A.data[i + 2]), L(B.data[i], B.data[i + 1], B.data[i + 2]));
    if (k <= 1.02) continue; const x = p % A.width, y = (p - x) / A.width;
    l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y);
    ks.push([k, i]); const bk = B.data[i] + ',' + B.data[i + 1] + ',' + B.data[i + 2]; bg.set(bk, (bg.get(bk) || 0) + 1); }
  if (ks.length < 10) return { glyphPx: ks.length };
  ks.sort((x, y) => y[0] - x[0]); const [ratio, at] = ks[Math.floor(ks.length * 0.02)];
  let fill = null, n = 0; for (const [k, c] of bg) if (c > n) { n = c; fill = k; }
  const box = { x: l, y: t, w: r - l + 1, h: b - t + 1 };
  const inside = l >= cb.x - 1 && t >= cb.y - 1 && r <= cb.x + cb.w && b <= cb.y + cb.h;
  return { glyphPx: ks.length, ratio, ink: 'rgb(' + A.data[at] + ',' + A.data[at + 1] + ',' + A.data[at + 2] + ')', fill: 'rgb(' + fill + ')', glyphBox: box, contentBox: cb, inside };
})`

async function withStyle(w, css, fn) {
  const id = '__qual-hide'
  await w.evaluate(`(() => { const s = document.createElement('style'); s.id = ${JSON.stringify(id)}; s.textContent = ${JSON.stringify(css)}; document.head.append(s); })()`)
  await sleep(120)
  try { return await fn() } finally { await w.evaluate(`document.getElementById(${JSON.stringify(id)})?.remove()`); await sleep(120) }
}

export async function focusArea(w, sel, { margin = 12, focus, ref } = {}) {
  const box = await w.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null; el.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = ${ref === 'thumb' ? 'window.__qual.thumbBox(el)' : '(() => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; })()'}; return { ...r, sx: scrollX, sy: scrollY, vw: innerWidth, vh: innerHeight, dpr: devicePixelRatio }; })()`)
  if (!box) return { sel, outcome: 'cannot-determine', why: 'no element' }
  if (box.w === 0 || box.h === 0) return { sel, outcome: 'cannot-determine', why: 'not rendered' }
  // The clip is in document coordinates: the viewport rectangle plus the scroll (VH-171's pilot caught the clip landing above a scrolled control).
  const vx = Math.max(0, box.x - margin), vy = Math.max(0, box.y - margin)
  const clip = { x: vx + box.sx, y: vy + box.sy, width: Math.min(box.vw - vx, box.w + 2 * margin), height: Math.min(box.vh - vy, box.h + 2 * margin) }
  await w.evaluate(`(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); })()`)
  await sleep(150)
  const off = await shot(w, clip)
  // The sub-component's painted box: the clip drawn without it, against the clip with it.
  let painted = null
  if (ref) {
    const without = await withStyle(w, REFS[ref].hide(sel), () => shot(w, clip))
    const d = await analyse(w, DIFF, off, without)
    if (!d.error && d.box) painted = { w: Math.round(d.box.w / box.dpr), h: Math.round(d.box.h / box.dpr), box: d.box }
    if (!painted) return { sel, outcome: 'cannot-determine', why: 'the sub-component paints nothing to measure', ref }
  }
  if (focus) await focus(); else await focusByKeyboard(w, sel)
  const state = await w.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const a = document.activeElement; return { focused: !!a && (a === el || el.contains(a)), visible: !!a && a.matches(':focus-visible') }; })()`)
  await sleep(150)
  const on = await shot(w, clip)
  if (!state.focused) return { sel, outcome: 'cannot-determine', why: 'focus did not land on the control' }
  const r = await analyse(w, DIFF, off, on)
  if (r.error) return { sel, outcome: 'cannot-determine', why: r.error }
  const px = box.dpr * box.dpr
  const area3 = Math.round(r.changed3 / px)
  const clipped = clip.width < box.w + 2 * margin || clip.height < box.h + 2 * margin
  // A 2 px perimeter's area, exactly: wh − (w − 4)(h − 4) = 4(w + h) − 16 for a box,
  // π(r² − (r − 2)²) = 4π(r − 1) for a disc (the pilot's 4(w + h) overstated it by 16).
  let perimeter, readings
  if (ref === 'thumb') {
    readings = { box: Math.round(4 * Math.PI * (box.w / 2 - 1)), painted: Math.round(4 * Math.PI * (Math.max(painted.w, painted.h) / 2 - 1)) }
    perimeter = readings.box
  } else if (ref === 'file-button') perimeter = Math.round(4 * (painted.w + painted.h) - 16)
  else perimeter = Math.round(4 * (box.w + box.h) - 16)
  let outcome = area3 >= perimeter ? 'pass' : clipped ? 'cannot-determine' : 'fail'
  let why = outcome === 'cannot-determine' ? 'the clip is cut by the viewport' : undefined
  let unresolved = outcome === 'cannot-determine' ? 'measurement' : undefined
  if (readings && outcome === 'fail' && area3 >= readings.painted) { outcome = 'cannot-determine'; unresolved = 'interpretation'; why = 'passes against the painted disc, fails against the 44 px circular reference: the reading is VH-173\'s' }
  return { sel, outcome, why, unresolved, ref, focusVisible: state.visible, controlPx: [Math.round(box.w), Math.round(box.h)], paintedPx: painted ? [painted.w, painted.h] : undefined, areaAt3to1: area3, perimeter2px: perimeter, readings, changedAny: Math.round(r.changedAny / px), bestRatio: r.best, off: Buffer.from(off, 'base64'), on: Buffer.from(on, 'base64') }
}

/** The file chooser's button text by pixels (VH-171): computed style read 1:1 under forced colours. */
export async function fileButtonInk(w, sel = '#file-input', { margin = 4 } = {}) {
  const box = await w.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el || !el.getBoundingClientRect().width) return null; el.scrollIntoView({ block: 'center' }); const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, sx: scrollX, sy: scrollY, dpr: devicePixelRatio }; })()`)
  if (!box) return { el: sel, what: 'file button text (pixels)', outcome: 'cannot-determine', why: 'not rendered' }
  // Behind an open modal dialog the button is inert and dimmed by the
  // backdrop; it is exempt there, as targets are (VH-171, pilot 2).
  if (await w.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const modal = [...document.querySelectorAll('dialog[open]')].find((d) => d.matches(':modal')); return (!!modal && !modal.contains(el)) || !!el.closest('[inert]'); })()`)) return { el: sel, what: 'file button text (pixels)', outcome: 'inert', why: 'behind a modal dialog or inert' }
  const what = 'file button text (pixels)'
  // VH-172: the mouse moved off first. A setup's last click can leave the button painted hovered while
  // the style changes below repaint it unhovered, so every pixel of it changed ("outside the content box").
  await w.page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
  await sleep(150)
  const clip = { x: Math.max(0, box.x - margin) + box.sx, y: Math.max(0, box.y - margin) + box.sy, width: box.w + 2 * margin, height: box.h + 2 * margin }
  // The button's own paint, pinned to its computed values (forced colours'
  // system colours included), so that only the text changes below.
  const g = await w.evaluate(`(() => { const b = getComputedStyle(document.querySelector(${JSON.stringify(sel)}), '::file-selector-button'); const n = (v) => parseFloat(v) || 0;
    return { l: n(b.borderLeftWidth) + n(b.paddingLeft), r: n(b.borderRightWidth) + n(b.paddingRight), t: n(b.borderTopWidth) + n(b.paddingTop), b: n(b.borderBottomWidth) + n(b.paddingBottom),
      paint: 'background-color:' + b.backgroundColor + ' !important;background-image:' + b.backgroundImage + ' !important;border-color:' + b.borderTopColor + ' ' + b.borderRightColor + ' ' + b.borderBottomColor + ' ' + b.borderLeftColor + ' !important;box-shadow:' + b.boxShadow + ' !important;',
      size: n(b.fontSize), weight: parseInt(b.fontWeight, 10) }; })()`)
  const need = g.size >= 24 || (g.weight >= 700 && g.size >= 18.66) ? 4.5 : 7
  await w.evaluate(`(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); })()`)
  await sleep(120)
  const off = await shot(w, clip)
  const without = await withStyle(w, REFS['file-button'].hide(sel), () => shot(w, clip))
  const d = await analyse(w, DIFF, off, without)
  if (d.error || !d.box) return { el: sel, what, outcome: 'cannot-determine', why: 'the button paints nothing to measure' }
  // Same paint, no text: the forced-colour adjustment off so a transparent colour holds.
  const noText = await withStyle(w, `${sel}::file-selector-button { forced-color-adjust: none !important; ${g.paint} color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }`, () => shot(w, clip))
  const content = { x: d.box.x + Math.round(g.l * box.dpr), y: d.box.y + Math.round(g.t * box.dpr), w: d.box.w - Math.round((g.l + g.r) * box.dpr), h: d.box.h - Math.round((g.t + g.b) * box.dpr) }
  const ink = await analyse(w, GLYPHS(content), off, noText)
  const disabled = await w.evaluate(`!!document.querySelector(${JSON.stringify(sel)}).disabled`)
  const base = { el: sel, what, need, buttonPx: [Math.round(d.box.w / box.dpr), Math.round(d.box.h / box.dpr)], glyphPx: ink.glyphPx, disabled }
  if (ink.ratio === undefined) return { ...base, outcome: 'cannot-determine', why: 'no glyph pixels found' }
  if (!ink.inside) return { ...base, ...ink, ratio: Math.round(ink.ratio * 1e4) / 1e4, outcome: 'cannot-determine', why: 'changed pixels lie outside the button\'s content box: not glyphs alone' }
  const outcome = ink.ratio >= need ? 'pass' : 'fail'
  return { ...base, ...ink, ratio: Math.round(ink.ratio * 1e4) / 1e4, outcome: disabled ? 'inactive' : outcome, why: disabled ? 'part of an inactive control (1.4.6 exception); reading kept: ' + outcome : undefined }
}

/** The pressed appearance under a held key (M-05): the focused control's pixels with the key down against key up. */
export async function pressedAppearance(w, sel, { keyName = 'Space', margin = 8 } = {}) {
  const box = await w.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null; el.scrollIntoView({ block: 'center' }); const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, sx: scrollX, sy: scrollY, dpr: devicePixelRatio }; })()`)
  if (!box || !box.w) return { sel, outcome: 'cannot-determine', why: 'not rendered' }
  const clip = { x: Math.max(0, box.x - margin) + box.sx, y: Math.max(0, box.y - margin) + box.sy, width: box.w + 2 * margin, height: box.h + 2 * margin }
  await focusByKeyboard(w, sel)
  await sleep(150)
  const up = await shot(w, clip)
  const held = await holdKey(w, keyName, async () => ({ down: await shot(w, clip), active: await w.evaluate(`document.querySelector(${JSON.stringify(sel)}).matches(':active')`) }))
  const r = await analyse(w, DIFF, up, held.down)
  if (r.error) return { sel, outcome: 'cannot-determine', why: r.error }
  const px = box.dpr * box.dpr
  return { sel, key: keyName, active: held.active, changedAny: Math.round(r.changedAny / px), changedAt3to1: Math.round(r.changed3 / px), bestRatio: r.best, outcome: r.changedAny > 0 ? 'pass' : 'fail', why: r.changedAny > 0 ? undefined : 'nothing changes while the key is held', up: Buffer.from(up, 'base64'), down: Buffer.from(held.down, 'base64') }
}

/**
 * VH-172: pressed against hover, by mouse, and a keyboard press with focus
 * visible (VH-169's contract). A capturing listener on the window swallows
 * the click a release would make, so measuring a press never acts; the
 * mouse is released away from the control. Enabled: the pressed pixels must
 * differ from the hovered ones while `:active` holds, and a held Space must
 * change the control with `:focus-visible` and a drawn outline kept.
 * Disabled: a press must leave the rest pixels unchanged (disabled wins).
 */
export async function pressedVsHover(w, sel, { margin = 6 } = {}) {
  const S = JSON.stringify(sel)
  const box = await w.evaluate(`(() => { const el = document.querySelector(${S}); if (!el) return null; el.scrollIntoView({ block: 'center' }); const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, sx: scrollX, sy: scrollY, dpr: devicePixelRatio, disabled: !!el.disabled, file: el.type === 'file' }; })()`)
  if (!box || !box.w) return { sel, outcome: 'cannot-determine', why: 'not rendered' }
  const clip = { x: Math.max(0, box.x - margin) + box.sx, y: Math.max(0, box.y - margin) + box.sy, width: box.w + 2 * margin, height: box.h + 2 * margin }
  const paint = `(() => { const el = document.querySelector(${S}); const c = getComputedStyle(el, ${box.file ? "'::file-selector-button'" : 'null'}); return { bg: c.backgroundColor, fg: c.color, border: c.borderTopColor, active: el.matches(':active'), hover: el.matches(':hover'), focusVisible: el.matches(':focus-visible'), outline: c.outlineStyle + ' ' + c.outlineWidth }; })()`
  const mouse = (type, x, y, extra = {}) => w.page.send('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' ? 'none' : 'left', clickCount: type === 'mouseMoved' ? 0 : 1, ...extra })
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2, away = { x: 2, y: 2 }
  const px = box.dpr * box.dpr
  const diff = async (a, b) => { const r = await analyse(w, DIFF, a, b); return r.error ? { error: r.error } : { changedAny: Math.round(r.changedAny / px), changedAt3to1: Math.round(r.changed3 / px), best: r.best } }
  await w.evaluate(`(() => { const stop = (e) => { e.preventDefault(); e.stopImmediatePropagation(); }; window.__pressStop = stop; for (const t of ['click', 'auxclick', 'dblclick']) window.addEventListener(t, stop, true); const a = document.activeElement; if (a && a !== document.body) a.blur(); })()`)
  try {
    await mouse('mouseMoved', away.x, away.y); await sleep(150)
    const rest = await shot(w, clip); const restPaint = await w.evaluate(paint)
    await mouse('mouseMoved', cx, cy); await sleep(150)
    const hover = await shot(w, clip); const hoverPaint = await w.evaluate(paint)
    await mouse('mousePressed', cx, cy); await sleep(150)
    const down = await shot(w, clip); const downPaint = await w.evaluate(paint)
    await w.page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: away.x, y: away.y, button: 'left', buttons: 1 })
    await mouse('mouseReleased', away.x, away.y); await sleep(120)
    const base = { sel, disabled: box.disabled, rest: restPaint, hover: hoverPaint, down: downPaint, shots: { rest: Buffer.from(rest, 'base64'), hover: Buffer.from(hover, 'base64'), down: Buffer.from(down, 'base64') } }
    if (box.disabled) {
      const d = await diff(rest, down)
      if (d.error) return { ...base, outcome: 'cannot-determine', why: d.error }
      return { ...base, what: 'disabled held by mouse', restVsDown: d, outcome: d.changedAny === 0 ? 'pass' : 'fail', why: d.changedAny === 0 ? 'disabled wins: the press leaves the rest look' : 'a disabled control changes when held' }
    }
    const m = await diff(hover, down)
    if (m.error) return { ...base, outcome: 'cannot-determine', why: m.error }
    let outcome = !downPaint.active ? 'cannot-determine' : m.changedAny > 0 ? 'pass' : 'fail'
    let why = !downPaint.active ? 'the mouse press did not take (:active false)' : m.changedAny > 0 ? undefined : 'pressed looks as hovered'
    // The keyboard press: Space held on the focused control.
    await focusByKeyboard(w, sel); await sleep(150)
    const kUp = await shot(w, clip)
    const held = await holdKey(w, 'Space', async () => ({ shot: await shot(w, clip), paint: await w.evaluate(paint) }))
    const k = await diff(kUp, held.shot)
    const ring = held.paint.focusVisible && !/^none /.test(held.paint.outline)
    const kOutcome = k.error || !held.paint.active ? 'cannot-determine' : k.changedAny > 0 && ring ? 'pass' : 'fail'
    if (kOutcome === 'fail' && outcome !== 'fail') { outcome = 'fail'; why = k.changedAny > 0 ? 'the focus ring is not drawn while Space is held' : 'nothing changes while Space is held' }
    else if (kOutcome === 'cannot-determine' && outcome === 'pass') { outcome = 'cannot-determine'; why = k.error ?? 'the key press did not take (:active false)' }
    return { ...base, what: 'pressed against hover, and Space held with focus', hoverVsDown: m, keyboard: { upVsHeld: k, held: held.paint, ringDrawn: ring, outcome: kOutcome }, outcome, why, shots: { ...base.shots, keyUp: Buffer.from(kUp, 'base64'), keyHeld: Buffer.from(held.shot, 'base64') } }
  } finally {
    await w.evaluate(`(() => { const stop = window.__pressStop; for (const t of ['click', 'auxclick', 'dblclick']) window.removeEventListener(t, stop, true); delete window.__pressStop; const a = document.activeElement; if (a && a !== document.body) a.blur(); })()`)
    await mouse('mouseMoved', away.x, away.y)
  }
}

/**
 * VH-172: every drawn text element on one of the eight type roles (VH-166),
 * by computed family, size and weight in rem and line height as a ratio; the
 * line height is not compared under 1.4.12's spacing, which sets it. One row
 * per look, its role or none, with samples; the face Chrome rendered for the
 * first sample (CSS.getPlatformFontsForNode), so fallback faces are seen.
 * The file chooser's button text is a pseudo-element: not read here.
 */
export const TYPE_ROLES = [
  { role: 'page title', fam: 'Lora', size: 1.75, lh: 1.25, w: 700 },
  { role: 'panel heading', fam: 'Lora', size: 1.25, lh: 1.4, w: 700 },
  { role: 'section heading', fam: 'Arial', size: 1, lh: 1.5, w: 600 },
  { role: 'body', fam: 'Arial', size: 1, lh: 1.5, w: 400 },
  { role: 'supporting', fam: 'Arial', size: 0.875, lh: 1.5, w: 400 },
  { role: 'compact emphasis', fam: 'Arial', size: 0.875, lh: 1.5, w: 600 },
  { role: 'status mark', fam: 'Arial', size: 0.875, lh: 1.5, w: 700 },
  { role: 'code', fam: 'monospace', size: 0.875, lh: 1.5, w: 400 },
]
const TYPE_READ = (spacing) => `(() => {
  const ROLES = ${JSON.stringify(TYPE_ROLES)}; const spacing = ${!!spacing};
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const vis = (el) => (window.__audit ? window.__audit.visible(el) : el.getClientRects().length > 0);
  const desc = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
  const els = new Set();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) { const el = n.parentElement; if (el && n.textContent.trim() && !el.closest('script,style,noscript,template,option,svg') && vis(el)) els.add(el); }
  for (const el of document.querySelectorAll('input[type=text],input[type=number],input[type=date],input:not([type]),textarea,select')) if (vis(el) && (el.value || el.placeholder)) els.add(el);
  const looks = new Map(); window.__typeSamples = [];
  for (const el of els) {
    const c = getComputedStyle(el);
    const fam = c.fontFamily.split(',')[0].trim().replace(/["']/g, '');
    const size = Math.round(parseFloat(c.fontSize) / root * 1000) / 1000;
    const lh = c.lineHeight === 'normal' ? null : Math.round(parseFloat(c.lineHeight) / parseFloat(c.fontSize) * 100) / 100;
    const w = parseInt(c.fontWeight, 10);
    const key = [fam, size + 'rem', spacing ? 'lh(spacing)' : lh, w].join(' / ');
    let L = looks.get(key);
    if (!L) {
      const role = ROLES.find((r) => r.fam === fam && Math.abs(r.size - size) < 0.01 && r.w === w && (spacing || (lh !== null && Math.abs(r.lh - lh) < 0.02)));
      L = { look: key, role: role ? role.role : null, n: 0, samples: [], px: Math.round(parseFloat(c.fontSize) * 10) / 10, sample: window.__typeSamples.length };
      window.__typeSamples.push(el); looks.set(key, L);
    }
    L.n++; if (L.samples.length < 4) L.samples.push(desc(el) + ' "' + (el.value || el.textContent || el.placeholder || '').trim().replace(/\\s+/g, ' ').slice(0, 24) + '"');
  }
  return { root, looks: [...looks.values()] };
})()`
export async function typeRoles(w, { spacing = false } = {}) {
  const t = await w.evaluate(TYPE_READ(spacing))
  await w.page.send('CSS.enable').catch(() => {})
  await w.page.send('DOM.getDocument', { depth: 0 })
  for (const L of t.looks) {
    try {
      const { result } = await w.page.send('Runtime.evaluate', { expression: `window.__typeSamples[${L.sample}]` })
      const { nodeId } = await w.page.send('DOM.requestNode', { objectId: result.objectId })
      const f = await w.page.send('CSS.getPlatformFontsForNode', { nodeId })
      L.rendered = f.fonts.map((x) => `${x.familyName}${x.isCustomFont ? ' (web)' : ''} ×${x.glyphCount}`).join(', ')
    } catch (e) { L.rendered = 'unread: ' + String(e.message ?? e).slice(0, 60) }
    delete L.sample
  }
  await w.evaluate('delete window.__typeSamples')
  await w.page.send('CSS.disable').catch(() => {})
  return t.looks.map((L) => ({ ...L, el: L.samples[0], outcome: L.role ? 'pass' : 'fail', why: L.role ? undefined : 'on none of the eight roles' }))
}

/** A whole-page capture, as walk.mjs's screenshot, returned rather than written (M-08: the run writes it). */
export async function pageShot(w) {
  const m = await w.evaluate(`({ w: document.documentElement.clientWidth, h: document.documentElement.scrollHeight })`)
  const s = await w.page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: m.w, height: Math.min(m.h, 12000), scale: 1 } })
  return Buffer.from(s.data, 'base64')
}

/** Motion under reduced motion, watched while `drive()` runs (M-05). */
export async function motionWatch(w, drive, { settle = 400 } = {}) {
  await w.evaluate('window.__qual.motionStart()')
  try { if (drive) await drive(); await sleep(settle) } finally { /* stopped below */ }
  return w.evaluate('window.__qual.motionStop()')
}

// ---------------------------------------------------------------------------
// Views, modes and enlargement, each recorded with what was actually set.
export const VIEWS = {
  w1280: { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false },
  w375: { width: 375, height: 812, deviceScaleFactor: 3, mobile: true, screenWidth: 375, screenHeight: 812 },
  w320: { width: 320, height: 568, deviceScaleFactor: 1, mobile: false },
  landscape: { width: 812, height: 375, deviceScaleFactor: 3, mobile: true, screenWidth: 812, screenHeight: 375 },
  short: { width: 1280, height: 480, deviceScaleFactor: 1, mobile: false },
  // Chrome's 200% and 400% page zoom on a 1280 x 900 window give these CSS
  // viewports and device pixel ratios. Recorded as a proxy: Chrome's own
  // zoom cannot be set over the protocol, so it stays on the person list.
  zoom200proxy: { width: 640, height: 450, deviceScaleFactor: 2, mobile: false },
  zoom400proxy: { width: 320, height: 225, deviceScaleFactor: 4, mobile: false },
}
export const UA_MOBILE = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36'

export async function setViewport(w, name) {
  const m = VIEWS[name]
  await w.page.send('Emulation.setDeviceMetricsOverride', m)
  await w.page.send('Emulation.setTouchEmulationEnabled', { enabled: m.mobile, maxTouchPoints: m.mobile ? 5 : 1 })
  await w.page.send('Emulation.setUserAgentOverride', m.mobile ? { userAgent: UA_MOBILE, platform: 'Linux armv8l' } : { userAgent: '' })
  w.view = m.mobile ? 'phone' : 'desktop'
  w.media.pointer = m.mobile ? 'coarse' : 'fine'
  w.qualView = name
  await setMode(w, w.qualMode ?? 'light')
}

/** Modes: light, dark, forced-light, forced-dark, reduced-motion, spacing, fallback, font32. */
export async function setMode(w, mode) {
  const forced = mode.startsWith('forced')
  const dark = mode === 'dark' || mode === 'forced-dark'
  const features = [
    { name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' },
    { name: 'forced-colors', value: forced ? 'active' : 'none' },
    { name: 'prefers-reduced-motion', value: mode === 'reduced-motion' ? 'reduce' : 'no-preference' },
    { name: 'pointer', value: w.media.pointer },
    { name: 'hover', value: w.media.pointer === 'coarse' ? 'none' : 'hover' },
  ]
  await w.page.send('Emulation.setEmulatedMedia', { features })
  await w.page.send('Page.setFontSizes', { fontSizes: { standard: mode === 'font32' ? 32 : 16, fixed: mode === 'font32' ? 26 : 13 } })
  await w.spacing(mode === 'spacing')
  w.qualMode = mode
  await sleep(200)
}

/** The brand faces withheld: font requests failed before load; reload after.
 *  By resource type, never by URL: Vite serves a font's `?url` import as a
 *  module script whose URL ends in the font's name, and blocking that stopped
 *  the app's boot (VH-171, pilot 2). Only requests Chrome loads as a font fail. */
export async function withholdFonts(w, on) {
  await w.page.send('Network.enable')
  await w.page.send('Network.setCacheDisabled', { cacheDisabled: on })
  w.fontsFailed = w.fontsFailed ?? []
  if (!on) return unroute(w, 'fonts')
  await route(w, 'fonts', {
    urlPattern: '*', resourceType: 'Font', requestStage: 'Request', match: () => true,
    handle: async (p) => { w.fontsFailed.push(p.request.url.replace(/^.*\//, '')); await w.page.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' }) },
  })
}
