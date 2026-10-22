// PLAN-7 (VH-171): the instruments the second pass adds to walk.mjs's Walk.
// Each returns { outcome: 'pass' | 'fail' | 'cannot-determine', ... }, so no
// instrument passes by saying nothing. Built on Chrome's own protocol only:
// the Accessibility domain, Input key events, screenshots compared pixel by
// pixel in a blank analysis tab, Emulation and Page.setFontSizes.
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
  const ratio = (a, b) => { const L1 = lum(a), L2 = lum(b); return Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 100) / 100; };
  // The background behind an element; unknown when an image or gradient sits under it.
  const bgOf = (el) => { let e = el, acc = null; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') return { unknown: 'background image on ' + e.tagName.toLowerCase() }; const c = parse(cs.backgroundColor); if (c && c.a > 0) { if (c.a >= 1) return { c: acc ? over(acc, c) : c }; acc = acc ? over(acc, c) : c; } e = e.parentElement; }
    const canvas = parse(getComputedStyle(document.documentElement).backgroundColor); const base = canvas && canvas.a >= 1 ? canvas : { r: 255, g: 255, b: 255, a: 1 }; return { c: acc ? over(acc, base) : base }; };
  const desc = (el) => (window.__audit ? window.__audit.desc(el) : el.tagName.toLowerCase());
  const visible = (el) => (window.__audit ? window.__audit.visible(el) : !!(el.getBoundingClientRect().width));

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

  // 2.5.5: the actual clickable area, found by hit-testing on a 2 px grid over
  // the element and its labels (wrapped labels' line boxes included); passes
  // when a 44 x 44 square of hits fits inside it.
  const CTRL = 'button, a[href], input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"]), video, [role="slider"], [role="button"]';
  Q.targets = (min = 44, step = 2) => {
    const out = [];
    for (const el of document.querySelectorAll(CTRL)) {
      if (!visible(el)) continue;
      const modal = document.querySelector('dialog[open]:modal');
      if ((modal && !modal.contains(el)) || el.closest('[inert]')) { out.push({ el: desc(el).slice(0, 80), outcome: 'inert', why: 'behind a modal dialog or inert' }); continue; }
      if (el.type === 'range') { out.push({ el: desc(el).slice(0, 80), outcome: 'cannot-determine', why: 'the thumb is a pseudo-element; a hit test reaches only the input box', box: [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)] }); continue; }
      const own = el.closest('label');
      const parts = [el, ...(el.labels ? Array.from(el.labels) : [])].filter(Boolean);
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      const rects = parts.flatMap((p) => Array.from(p.getClientRects()));
      if (!rects.length) continue;
      const L = Math.floor(Math.min(...rects.map((r) => r.left))), T = Math.floor(Math.min(...rects.map((r) => r.top)));
      const R = Math.ceil(Math.max(...rects.map((r) => r.right))), B = Math.ceil(Math.max(...rects.map((r) => r.bottom)));
      const p = el.parentElement;
      const inline = el.tagName === 'A' && !!p && (p.innerText || '').trim().length > (el.innerText || '').trim().length + 2;
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
      out.push({ el: desc(el).slice(0, 80), outcome: hits === 0 ? 'cannot-determine' : fits ? 'pass' : 'fail', why: hits === 0 ? 'nothing hit: covered or not hit-testable' : undefined, hitW: hw, hitH: hh, hitArea: hits * step * step, inline, disabled: !!el.disabled });
    }
    window.scrollTo(0, 0);
    return out;
  };

  // Contrast beyond text nodes: field values, placeholders, the native file
  // button's text, control boundaries and SVG graphics (1.4.6, 1.4.11).
  Q.contrastExtra = () => {
    const out = [];
    const push = (el, what, fgCss, need, bgEl) => { const bg = bgOf(bgEl || el); const fg = parse(fgCss); if (!fg || bg.unknown) { out.push({ el: desc(el).slice(0, 70), what, outcome: 'cannot-determine', why: bg.unknown || 'colour unparsed: ' + fgCss }); return; } if (fg.a === 0) return; const f = fg.a < 1 ? over(fg, bg.c) : fg; const r = ratio(f, bg.c); out.push({ el: desc(el).slice(0, 70), what, fg: fgCss, ratio: r, need, outcome: r >= need ? 'pass' : 'fail' }); };
    for (const el of document.querySelectorAll('input, textarea, select')) {
      if (!visible(el) || el.type === 'hidden') continue;
      const cs = getComputedStyle(el);
      const large = parseFloat(cs.fontSize) >= 24 || (parseInt(cs.fontWeight, 10) >= 700 && parseFloat(cs.fontSize) >= 18.66);
      if (el.type === 'file') { const b = getComputedStyle(el, '::file-selector-button'); const bb = parse(b.backgroundColor);
        if (bb && bb.a >= 1) { const fg = parse(b.color); const r = fg ? ratio(fg.a < 1 ? over(fg, bb) : fg, bb) : 0; out.push({ el: desc(el).slice(0, 70), what: 'file button text', fg: b.color, bg: b.backgroundColor, ratio: r, need: 7, outcome: !fg ? 'cannot-determine' : r >= 7 ? 'pass' : 'fail' }); } else push(el, 'file button text', b.color, 7); if (b.borderTopStyle !== 'none') push(el, 'file button boundary', b.borderTopColor, 3); continue; }
      if (['radio', 'checkbox', 'range', 'color'].includes(el.type)) { if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) push(el, 'control boundary', cs.borderTopColor, 3, el.parentElement); continue; }
      if (el.value) push(el, 'value', cs.color, large ? 4.5 : 7);
      if (el.placeholder) push(el, 'placeholder', getComputedStyle(el, '::placeholder').color, 7);
      if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) push(el, 'field boundary', cs.borderTopColor, 3, el.parentElement);
      else if (cs.borderBottomStyle !== 'none' && parseFloat(cs.borderBottomWidth) > 0) push(el, 'field boundary (bottom)', cs.borderBottomColor, 3, el.parentElement);
    }
    for (const svg of document.querySelectorAll('svg')) {
      if (!visible(svg) || svg.getAttribute('aria-hidden') === 'true' && !svg.closest('button, a')) continue;
      for (const shape of svg.querySelectorAll('path, circle, rect, polygon, line')) { const cs = getComputedStyle(shape); const paint = cs.fill !== 'none' ? cs.fill : cs.stroke; if (/url\(/.test(paint)) { out.push({ el: desc(svg).slice(0, 70), what: 'graphic', outcome: 'cannot-determine', why: 'paint server' }); break; } push(svg, 'graphic', paint === 'currentcolor' ? cs.color : paint, 3); break; }
    }
    return out;
  };

  // 1.4.8: raw rendered-line counts, character by character, visually hidden
  // text left out. A line mixing CJK and Latin is read two ways: each
  // character against 40, and CJK against 40 plus Latin against 80; when the
  // two readings disagree the line is "cannot determine", with both kept.
  Q.lines = () => {
    const out = [];
    const isCjk = (c) => /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef\u3000-\u303f]/.test(c);
    for (const el of document.querySelectorAll('p, li, dd, dt, label, legend, summary, h1, h2, h3, .notification-body, .fact-note, .radio-detail')) {
      if (!visible(el) || el.querySelector('p, li, dd, dt')) continue;
      const lines = new Map();
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) {
        if (n.parentElement.closest('.visually-hidden, [hidden]')) continue;
        const t = n.textContent; const range = document.createRange();
        for (let i = 0; i < t.length; i++) { if (/\s/.test(t[i])) continue; range.setStart(n, i); range.setEnd(n, i + 1); const r = range.getClientRects()[0]; if (!r || r.width === 0) continue; const k = Math.round(r.top + r.height / 2); const L = lines.get(k) || { latin: 0, cjk: 0, left: r.left, right: r.right }; if (isCjk(t[i])) L.cjk++; else L.latin++; L.left = Math.min(L.left, r.left); L.right = Math.max(L.right, r.right); lines.set(k, L); }
      }
      if (!lines.size) continue;
      // characters counted with the spaces between words: the line's span over the average glyph
      let worst = null;
      for (const L of lines.values()) {
        const total = L.latin + L.cjk;
        const strict = total <= 40 || (L.cjk === 0 && total <= 80);
        const mixedOk = L.cjk / 40 + L.latin / 80 <= 1;
        const pureLatin = L.cjk === 0, pureCjk = L.latin === 0;
        const outcome = pureLatin ? (L.latin <= 80 ? 'pass' : 'fail') : pureCjk ? (L.cjk <= 40 ? 'pass' : 'fail') : strict === mixedOk ? (strict ? 'pass' : 'fail') : 'cannot-determine';
        const row = { latin: L.latin, cjk: L.cjk, widthPx: Math.round(L.right - L.left), outcome };
        const rank = { fail: 3, 'cannot-determine': 2, pass: 1 };
        if (!worst || rank[outcome] > rank[worst.outcome] || (rank[outcome] === rank[worst.outcome] && total > worst.latin + worst.cjk)) worst = row;
      }
      out.push({ el: desc(el).slice(0, 60), lang: (el.closest('[lang]') || document.documentElement).getAttribute('lang'), lines: lines.size, fontSize: getComputedStyle(el).fontSize, boxPx: Math.round(el.getBoundingClientRect().width), worst, outcome: worst.outcome });
    }
    return out;
  };
  // Note: the counts leave out spaces; 1.4.8's 80 "characters" include them, so a Latin line passes here on letters and is re-read with spaces in VH-173 when within 15 of the limit.

  // 2.3.3 and reduced motion: what still moves.
  Q.motion = () => Array.from(document.querySelectorAll('body *')).filter(visible).map((el) => { const cs = getComputedStyle(el); const dur = (s) => Math.max(0, ...String(s).split(',').map((v) => parseFloat(v) * (/ms/.test(v) ? 1 : 1000) || 0)); return { el: desc(el).slice(0, 70), animation: cs.animationName !== 'none' ? cs.animationName + ' ' + dur(cs.animationDuration) + 'ms' : '', transition: dur(cs.transitionDuration) > 10 ? cs.transitionProperty.slice(0, 40) + ' ' + dur(cs.transitionDuration) + 'ms' : '' }; }).filter((m) => m.animation || m.transition);

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
  const within = (r, pred) => { for (let q = r; q; q = byId.get(q.parent)) if (pred(q)) return q; return null }
  const exposed = rows.filter((r) => !r.ignored)
  const unnamed = exposed.filter((r) => INTERACTIVE_ROLES.has(r.role) && !r.name.trim())
  const modal = exposed.find((r) => r.role === 'dialog' && r.modal)
  // With a modal dialog open, nothing focusable outside it may stay exposed.
  const leaking = modal ? exposed.filter((r) => r.focusable && r.role !== 'RootWebArea' && !within(r, (q) => q === modal)) : []
  const problems = [
    ...unnamed.map((r) => ({ kind: 'no accessible name', role: r.role, dom: r.dom })),
    ...leaking.map((r) => ({ kind: 'exposed behind the modal dialog', role: r.role, name: r.name.slice(0, 60), dom: r.dom })),
  ]
  const live = exposed.filter((r) => r.live && r.live !== 'off').map((r) => ({ role: r.role, live: r.live, name: r.name.slice(0, 80) }))
  const summary = exposed.filter((r) => INTERACTIVE_ROLES.has(r.role) || /heading|dialog|status|alert|group|radiogroup|progressbar/.test(r.role ?? ''))
    .map((r) => ({ role: r.role, name: r.name.slice(0, 80), description: r.description.slice(0, 80), value: String(r.value).slice(0, 40), disabled: r.disabled || undefined, expanded: r.expanded, checked: r.checked, invalid: r.invalid && r.invalid !== 'false' ? r.invalid : undefined, required: r.required || undefined }))
  return { outcome: rows.length < 3 ? 'cannot-determine' : problems.length ? 'fail' : 'pass', counts: { nodes: rows.length, exposed: exposed.length, interactive: exposed.filter((r) => INTERACTIVE_ROLES.has(r.role)).length }, problems, modal: modal ? modal.name : null, live, summary }
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

/**
 * steps: [{ key, shift?, repeat?, expect?: RegExp source the focused element's
 * description must match, state?: a page expression, native?: true when the
 * step drives a native control the keys may not reach (its failure is
 * "cannot determine", never a pass), until?: RegExp source — Tab until focus
 * matches, at most `repeat` presses }]
 */
export async function keysRoute(w, steps, { settle } = {}) {
  const log = []
  let failed = false, unknown = false
  for (const s of steps) {
    const before = await w.evaluate('window.__qual.observed().active')
    let presses = 0
    if (s.until) {
      const re = new RegExp(s.until)
      for (; presses < (s.repeat ?? 40); ) { await key(w, s.key ?? 'Tab', { shift: s.shift }); presses++; if (re.test(await w.evaluate('window.__qual.observed().active'))) break }
    } else for (let i = 0; i < (s.repeat ?? 1); i++) { await key(w, s.key, { shift: s.shift }); presses++ }
    if (settle && s.settle) await settle()
    if (s.wait) await sleep(s.wait)
    const after = await w.evaluate('window.__qual.observed()')
    const visibleFocus = await w.evaluate(`(() => { const el = document.activeElement; return !!el && el !== document.body && el.matches(':focus-visible'); })()`)
    let outcome = 'pass'
    const want = s.until ?? s.expect
    if (want && !new RegExp(want).test(after.active)) outcome = s.native ? 'cannot-determine' : 'fail'
    if (outcome === 'pass' && s.state) { const ok = await w.evaluate(`(() => { try { return !!(${s.state}); } catch (e) { return false; } })()`); if (!ok) outcome = s.native ? 'cannot-determine' : 'fail' }
    if (outcome === 'pass' && after.active !== 'body' && !visibleFocus && !s.noFocusRing) outcome = 'fail'
    if (outcome === 'fail') failed = true
    if (outcome === 'cannot-determine') unknown = true
    log.push({ key: (s.shift ? 'Shift+' : '') + (s.key ?? 'Tab'), presses, from: before, to: after.active, focusVisible: visibleFocus, expect: want ?? null, outcome, note: s.note })
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

export async function focusArea(w, sel, { margin = 12, focus } = {}) {
  const box = await w.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null; el.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, sx: scrollX, sy: scrollY, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight, dpr: devicePixelRatio }; })()`)
  if (!box) return { sel, outcome: 'cannot-determine', why: 'no element' }
  if (box.w === 0 || box.h === 0) return { sel, outcome: 'cannot-determine', why: 'not rendered' }
  // The clip is in document coordinates: the viewport rectangle plus the scroll (VH-171's pilot caught the clip landing above a scrolled control).
  const vx = Math.max(0, box.x - margin), vy = Math.max(0, box.y - margin)
  const clip = { x: vx + box.sx, y: vy + box.sy, width: Math.min(box.vw - vx, box.w + 2 * margin), height: Math.min(box.vh - vy, box.h + 2 * margin) }
  await w.evaluate(`(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); })()`)
  await sleep(150)
  const off = await shot(w, clip)
  if (focus) await focus(); else await focusByKeyboard(w, sel)
  const state = await w.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const a = document.activeElement; return { focused: !!a && (a === el || el.contains(a)), visible: !!a && a.matches(':focus-visible') }; })()`)
  await sleep(150)
  const on = await shot(w, clip)
  if (!state.focused) return { sel, outcome: 'cannot-determine', why: 'focus did not land on the control' }
  const a = await analysisPage(w.browser)
  const r = await a.evaluate(`(async () => {
    const load = async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
    const A = await load(${JSON.stringify(off)}), B = await load(${JSON.stringify(on)});
    if (A.width !== B.width || A.height !== B.height) return { error: 'size differs' };
    const L = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    let changed3 = 0, changedAny = 0, best = 1;
    for (let i = 0; i < A.data.length; i += 4) {
      const la = L(A.data[i], A.data[i + 1], A.data[i + 2]), lb = L(B.data[i], B.data[i + 1], B.data[i + 2]);
      const k = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
      if (k > 1.02) changedAny++; if (k >= 3) changed3++; if (k > best) best = k;
    }
    return { w: A.width, h: A.height, changed3, changedAny, best: Math.round(best * 100) / 100 };
  })()`)
  if (r.error) return { sel, outcome: 'cannot-determine', why: r.error }
  const px = box.dpr * box.dpr
  const area3 = Math.round(r.changed3 / px)
  const perimeter = Math.round(4 * (box.w + box.h))
  const clipped = clip.width < box.w + 2 * margin || clip.height < box.h + 2 * margin
  const outcome = area3 >= perimeter ? 'pass' : clipped ? 'cannot-determine' : 'fail'
  return { sel, outcome, focusVisible: state.visible, controlPx: [Math.round(box.w), Math.round(box.h)], areaAt3to1: area3, perimeter2px: perimeter, changedAny: Math.round(r.changedAny / px), bestRatio: r.best, why: outcome === 'cannot-determine' ? 'the clip is cut by the viewport' : undefined, off: Buffer.from(off, 'base64'), on: Buffer.from(on, 'base64') }
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

/** The brand faces withheld: font files blocked before load; reload after. */
export async function withholdFonts(w, on) {
  await w.page.send('Network.enable')
  await w.page.send('Network.setBlockedURLs', { urls: on ? ['*.woff2', '*.woff', '*.ttf', '*.otf'] : [] })
  await w.page.send('Network.setCacheDisabled', { cacheDisabled: on })
}
