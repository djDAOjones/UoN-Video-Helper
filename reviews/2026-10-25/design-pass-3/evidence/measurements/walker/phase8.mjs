// VH-198: the instruments for what Phase 8 added (the plan's "The walker gains
// what Phase 8 added"), each a list of rows that runner.mjs `aggregate`s, and
// each "not applicable" where its element is not on the page, never a silent
// pass. Passive parts read the page and its accessibility tree and run in
// every scenario record; active parts press keys or take pixels and run only
// where a scenario declares them (`p8`), and put back what they changed.
//
//   player        the native player in the finished card (VH-192): present
//                 while unsaved, gone once a save completes; named by the
//                 card's title; controls, preload metadata, no autoplay; its
//                 controls' inventory, names and targets, apart from the host.
//   playerKeys    (active, P-06) the route by the focused accessibility node,
//                 forward and back; play/pause and seek proved apart; each
//                 stop's ring by pixels with playback paused on a held frame.
//   formatTip     (active) "About the video format" (VH-196): opening, closing
//                 by Tab, Shift+Tab, Escape and a click, its edge and gap,
//                 apart from the onset "?".
//   footer        the footer's headings (VH-182): one h2, three h3, their
//                 order, levels (from the tree), words and measure, Report a
//                 problem in its group.
//   limiting      the heavy-limiting warning (VH-193): present above
//                 HEAVY_LIMITING_LU, absent below, by the bite the job logged;
//                 first on the card and in the line spoken at completion,
//                 read inside that transition's interval only; unchanged by a save.
//   videoLanguage Video language at the top of step 3 (VH-191): its place, its
//                 lock while a video is made or saved, and the next-video line
//                 under Video type alone.
//
// Words come from the page's own message tables (scenarios.mjs MX_INIT) or,
// on a proof's fixture page, from `window.__p8words`.
import { sleep } from './walk.mjs'
import { key, analyse, DIFF, shot } from './qualify.mjs'

export const HEAVY_LIMITING_LU = 3 // src/config/audio.ts:266, read, not imported
const CARD = '#process-result > .notification[data-kind="success"]'
const PLAYER = `${CARD} video.result-player`

// ---------------------------------------------------------------------------
// In the page, on the wall clock (the worker watcher's clock): when a job
// starts and ends, each distinct text of the status line, and of the output
// warnings beside the card, and when a save starts.
export const P8_INIT = String.raw`
(() => {
  const P = (window.__p8 = { events: [], status: [], warnings: [], plays: [] });
  const shown = (el) => !!el && !el.hidden && el.getClientRects().length > 0;
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  let running = false, awaiting = false, saving = false, statusText = null, warnText = null;
  const warnBox = () => { const c = document.querySelector('${CARD}'); if (!c) return null; for (let e = c.nextElementSibling; e; e = e.nextElementSibling) { const n = e.matches('.notification') ? e : e.querySelector('.notification'); if (n) return n; } return null; };
  P.warnBox = warnBox;
  const tick = () => {
    const on = shown(document.getElementById('process-progress'));
    if (on && !running) { P.events.push({ t: Date.now(), kind: 'start' }); awaiting = true; }
    running = on;
    const card = document.querySelector('${CARD}');
    if (awaiting && card && !on) {
      awaiting = false; P.events.push({ t: Date.now(), kind: 'finish', lang: document.documentElement.lang });
      // No autoplay: the player as it stands a second after it appeared.
      setTimeout(() => { const v = document.querySelector('${PLAYER}'); P.events.push({ t: Date.now(), kind: 'finish+1s', player: !!v, paused: v ? v.paused : null, currentTime: v ? v.currentTime : null }); }, 1000);
    }
    if (awaiting && !on && !card && document.querySelector('#process-result > .notification')) { awaiting = false; P.events.push({ t: Date.now(), kind: 'ended-otherwise' }); }
    const sv = shown(document.getElementById('save-actions'));
    if (sv && !saving) P.events.push({ t: Date.now(), kind: 'save-start' });
    if (!sv && saving) P.events.push({ t: Date.now(), kind: 'save-end', status: norm((document.getElementById('save-status') || {}).textContent) });
    saving = sv;
    const st = norm((document.getElementById('status') || {}).textContent);
    if (st !== statusText) { statusText = st; P.status.push({ t: Date.now(), text: st }); }
    const wb = warnBox(); const wt = wb ? norm(wb.textContent) : '';
    if (wt !== warnText) { warnText = wt; P.warnings.push({ t: Date.now(), text: wt, lang: document.documentElement.lang }); }
  };
  P.tick = tick;
  document.addEventListener('DOMContentLoaded', () => { new MutationObserver(tick).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'class'] }); tick(); });
  document.addEventListener('play', (e) => { if (e.target && e.target.matches && e.target.matches('video.result-player')) P.plays.push({ t: Date.now(), activation: !!(navigator.userActivation && navigator.userActivation.isActive) }); }, true);
})();
`

// Words: the page's table in its language, or the fixture's own.
const WORDS = `const W = (p) => { const m = window.__mx && window.__mx.msg && window.__mx.msg(p); return m != null ? m : (window.__p8words || {})[p]; };`
const row = (what, outcome, extra = {}) => ({ what, outcome, ...extra })

async function backendId(w, sel) {
  const { root } = await w.page.send('DOM.getDocument', { depth: 0 })
  const { nodeId } = await w.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel })
  if (!nodeId) return null
  const { node } = await w.page.send('DOM.describeNode', { nodeId })
  return node.backendNodeId
}
const prop = (n, name) => n.properties?.find((q) => q.name === name)?.value?.value
const CONTROL_ROLES = new Set(['button', 'slider', 'checkbox', 'menuitem', 'combobox', 'link', 'switch', 'spinbutton'])

/** The full tree, raw, for a subtree: the node for `dom`, its descendants in order, and the focused node. */
async function axSubtree(w, dom) {
  await w.page.send('Accessibility.enable')
  const { nodes } = await w.page.send('Accessibility.getFullAXTree')
  const byId = new Map(nodes.map((n) => [n.nodeId, n]))
  const host = nodes.find((n) => n.backendDOMNodeId === dom)
  const out = []
  const walk = (id) => { const n = byId.get(id); if (!n) return; out.push(n); for (const k of n.childIds ?? []) walk(k) }
  if (host) for (const k of host.childIds ?? []) walk(k)
  const focused = nodes.filter((n) => prop(n, 'focused') && n.role?.value !== 'RootWebArea').at(-1) ?? null
  return { host, descendants: out, focused }
}
const axRow = (n) => (n ? { role: n.role?.value, name: n.name?.value ?? '', dom: n.backendDOMNodeId, ignored: !!n.ignored } : null)

async function boxOf(w, backendNodeId) {
  try {
    const { model } = await w.page.send('DOM.getBoxModel', { backendNodeId })
    const q = model.border; const xs = [q[0], q[2], q[4], q[6]], ys = [q[1], q[3], q[5], q[7]]
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
  } catch (e) { return { error: String(e.message ?? e).slice(0, 100) } }
}

// Whether the author styles the native player's parts or its ring: then the
// user-agent exceptions (2.5.5's and 2.4.13's) no longer hold.
const AUTHOR_STYLES_PLAYER = `(() => { const hits = []; const look = (rules) => { for (const r of rules) { if (r.cssRules) look(r.cssRules); const s = r.selectorText || ''; if (/-webkit-media-controls|::-internal-media|video[^,{]*:focus/.test(s)) hits.push(s.slice(0, 80)); } };
  for (const sh of document.styleSheets) { try { look(sh.cssRules) } catch (e) { hits.push('unreadable sheet ' + (sh.href || '')) } } return hits; })()`

// ---------------------------------------------------------------------------
// The native player: passive.
const PLAYER_READ = `(() => { ${WORDS} const doc = document.documentElement;
  const card = document.querySelector('${CARD}'); const all = [...document.querySelectorAll('video.result-player')];
  const v = card && card.querySelector('video.result-player');
  const savedLine = W('status.saved'); const saveStatus = ((document.getElementById('save-status') || {}).textContent || '').trim();
  const saved = !!savedLine && saveStatus.startsWith(savedLine.split('.')[0]);
  const base = { card: !!card, players: all.length, inCard: !!v, saved, dialogOpen: !!document.querySelector('dialog[open]') };
  if (!v) return base;
  const ps = [...card.querySelectorAll(':scope > p')]; const title = card.querySelector('.notification-title');
  const lifetime = ps.find((p) => p.textContent === W('result.lifetime') || p.textContent === W('result.lifetimeDelivered'));
  const actions = card.querySelector(':scope > .actions');
  const after = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
  const r = v.getBoundingClientRect(); const cap = parseFloat(getComputedStyle(v).maxHeight);
  return { ...base, src: v.getAttribute('src'), blob: (v.getAttribute('src') || '').startsWith('blob:'), controls: v.controls, preload: v.preload, autoplayAttr: v.hasAttribute('autoplay'), autoplay: v.autoplay,
    paused: v.paused, currentTime: v.currentTime, readyState: v.readyState, error: v.error ? v.error.code : null, duration: v.duration,
    labelledBy: v.getAttribute('aria-labelledby'), titleId: title && title.id, title: title ? title.textContent.trim() : null,
    linesBefore: ps.filter((p) => p !== lifetime && !p.hidden).every((p) => after(p, v)), beforeLifetime: lifetime ? after(v, lifetime) : null, beforeActions: after(v, actions),
    host: { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right) }, innerWidth, maxHeight: Number.isFinite(cap) ? cap : null,
    overflowX: doc.scrollWidth > doc.clientWidth, finish: (window.__p8 && window.__p8.events.filter((e) => e.kind === 'finish+1s').at(-1)) || null,
    plays: window.__p8 ? window.__p8.plays.length : null } })()`

/** Rows for the player as the page stands. `opts.sel` and `opts.title` serve a proof's fixture page. */
export async function playerRows(w) {
  const sel = PLAYER
  const r = await w.evaluate(PLAYER_READ)
  const rows = []
  if (!r.card) {
    rows.push(row('no player without a finished card', r.players === 0 ? 'not-applicable' : 'fail', { why: r.players ? `${r.players} result players with no finished card` : 'no finished card on the page', players: r.players }))
    return rows
  }
  if (r.saved) {
    rows.push(row('gone once a save completes', r.players === 0 ? 'pass' : 'fail', { players: r.players }))
    return rows
  }
  rows.push(row('present while unsaved, one, in the card', r.players === 1 && r.inCard ? 'pass' : 'fail', { players: r.players, inCard: r.inCard }))
  if (!r.inCard) return rows
  rows.push(row('controls, preload metadata, no autoplay', r.controls && r.preload === 'metadata' && !r.autoplayAttr && !r.autoplay ? 'pass' : 'fail', { controls: r.controls, preload: r.preload, autoplay: r.autoplay || r.autoplayAttr }))
  if (r.finish) rows.push(row('paused a second after the card appeared', r.finish.paused === true ? 'pass' : 'fail', r.finish))
  else rows.push(row('paused a second after the card appeared', 'cannot-determine', { why: 'no job finished on this page while it was watched' }))
  rows.push(row('an object URL whose metadata loads', r.blob && r.error === null && r.readyState >= 1 ? 'pass' : r.blob && r.error !== null ? 'fail' : 'cannot-determine', { blob: r.blob, error: r.error, readyState: r.readyState, duration: r.duration }))
  rows.push(row('after the card\'s lines, before the lifetime line and Save', r.linesBefore && r.beforeLifetime !== false && r.beforeActions ? 'pass' : 'fail', { linesBefore: r.linesBefore, beforeLifetime: r.beforeLifetime, beforeActions: r.beforeActions }))
  rows.push(row('the host inside the page, no taller than its cap', r.host.w > 0 && r.host.left >= 0 && r.host.right <= r.innerWidth && (r.maxHeight === null || r.host.h <= r.maxHeight + 1) && !r.overflowX ? 'pass' : 'fail', { host: r.host, maxHeight: r.maxHeight, overflowX: r.overflowX }))
  // The name and the controls, from the tree.
  const dom = await backendId(w, sel)
  const t = await axSubtree(w, dom)
  if (!t.host) { rows.push(row('host named by the card\'s title', 'cannot-determine', { why: 'the host has no node in the tree' })); return rows }
  const name = t.host.name?.value ?? ''
  if (r.dialogOpen) rows.push(row('host named by the card\'s title', 'not-applicable', { why: 'behind an open modal dialog: not exposed', name }))
  else rows.push(row('host named by the card\'s title', !name.trim() ? 'fail' : name === r.title && r.labelledBy === r.titleId ? 'pass' : 'fail', { why: !name.trim() ? 'host with no name' : undefined, name, title: r.title, labelledBy: r.labelledBy }))
  const controls = t.descendants.filter((n) => !n.ignored && CONTROL_ROLES.has(n.role?.value) && prop(n, 'focusable'))
  if (!controls.length) { rows.push(row('control inventory', 'cannot-determine', { why: 'no focusable control under the host in the tree' })); return rows }
  rows.push(row('control inventory, each named', controls.every((n) => (n.name?.value ?? '').trim()) ? 'pass' : 'fail', { controls: controls.map(axRow) }))
  // Targets, apart from the host's box, with 2.5.5's user-agent exception where it holds.
  const authored = await w.evaluate(AUTHOR_STYLES_PLAYER)
  for (const n of controls) {
    const b = await boxOf(w, n.backendDOMNodeId)
    const base = { control: n.role?.value + ' "' + (n.name?.value ?? '') + '"', box: b.error ? undefined : { w: Math.round(b.w * 10) / 10, h: Math.round(b.h * 10) / 10 } }
    if (b.error || !(b.w > 0)) { rows.push(row('control target', 'cannot-determine', { ...base, why: 'no box for the control: ' + (b.error ?? 'empty') })); continue }
    const big = b.w >= 44 && b.h >= 44
    rows.push(row('control target', big ? 'pass' : 'fail', { ...base, uaException: !big && !authored.length ? 'user-agent control: its size is the browser\'s, not modified by the author (2.5.5)' : undefined, authored: authored.length ? authored : undefined }))
  }
  return rows
}

// ---------------------------------------------------------------------------
// The native player by keys (P-06): the route by the focused accessibility
// node, play/pause and seek proved apart, the rings by pixels on a held frame.
const MEDIA = (sel) => `document.querySelector(${JSON.stringify(sel)})`
const TABBABLE_BEFORE = (sel) => `(() => { const host = ${MEDIA(sel)}; const card = host.closest('.notification') || host;
  const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[hidden],[inert]');
  const all = [...document.querySelectorAll('a[href], button, input, select, textarea, summary, video[controls], [tabindex]')].filter((el) => el.tabIndex >= 0 && !el.disabled && vis(el) && !(el.type === 'radio' && !el.checked && document.querySelector('input[type=radio][name="' + el.name + '"]:checked')));
  const before = all.filter((el) => el.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING);
  const el = before.at(-1); return el ? { id: el.id || null, tag: el.tagName.toLowerCase(), name: el.name || null, value: el.type === 'radio' ? el.value : null } : null; })()`
const ACTIVE = `(() => { const a = document.activeElement; return a ? { id: a.id || null, tag: a.tagName.toLowerCase(), cls: typeof a.className === 'string' ? a.className : '', name: a.name || null, value: a.type === 'radio' ? a.value : null, card: !!a.matches && a.matches('${CARD}') } : null; })()`

/** Tab from just before the host until focus leaves it; each stop is the focused accessibility node. */
export async function playerRoute(w, sel, { shift = false, max = 20 } = {}) {
  const dom = await backendId(w, sel)
  const stops = []
  let left = null
  for (let i = 0; i < max; i++) {
    await key(w, 'Tab', { shift })
    const inHost = await w.evaluate(`document.activeElement === ${MEDIA(sel)}`)
    const t = await axSubtree(w, dom)
    if (!inHost) { left = { active: await w.evaluate(ACTIVE), ax: axRow(t.focused) }; break }
    stops.push({ ...axRow(t.focused), host: t.focused?.backendDOMNodeId === dom })
  }
  return { stops, left }
}

export async function playerKeys(w, { sel = PLAYER, run, key: recKey } = {}) {
  const there = await w.evaluate(`!!${MEDIA(sel)}`)
  if (!there) return [row('player by keys', 'not-applicable', { why: 'no player on the page' })]
  const rows = []
  const before = await w.evaluate(`(() => { const v = ${MEDIA(sel)}; return { paused: v.paused, t: v.currentTime, muted: v.muted, scrollY } })()`)
  await w.evaluate(`window.__p8restore = document.activeElement`)
  const dom = await backendId(w, sel)
  const { descendants } = await axSubtree(w, dom)
  const inventory = descendants.filter((n) => !n.ignored && CONTROL_ROLES.has(n.role?.value) && prop(n, 'focusable')).map(axRow)
  // A held frame: paused, seeked to a fixed time, muted for the scripted parts (setup, not a key).
  await w.evaluate(`(async () => { const v = ${MEDIA(sel)}; v.muted = true; v.pause(); const at = Math.min(0.5, (v.duration || 1) / 2); if (Math.abs(v.currentTime - at) > 0.01) { v.currentTime = at; await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 3000) }) } })()`)
  // Forward: placed by script on the control before the host (recorded as setup), then keys only.
  const prev = await w.evaluate(TABBABLE_BEFORE(sel))
  const focusPrev = `(() => { const host = ${MEDIA(sel)}; const card = host.closest('.notification') || host; card.focus(); return document.activeElement === card; })()`
  const placed = await w.evaluate(focusPrev)
  const fwd = await playerRoute(w, sel)
  const reached = new Set(fwd.stops.map((s) => s.dom))
  const missed = inventory.filter((c) => !reached.has(c.dom))
  rows.push(row('route forward reaches every control', !inventory.length ? 'cannot-determine' : missed.length ? 'fail' : 'pass', { why: missed.length ? 'control out of reach: ' + missed.map((c) => c.role + ' "' + c.name + '"').join(', ') : !inventory.length ? 'no inventory' : undefined, placedOn: placed ? 'the card, by script (setup)' : 'not placed', stops: fwd.stops, left: fwd.left, inventory }))
  rows.push(row('Tab after the last control leaves the player', fwd.left ? 'pass' : 'fail', { left: fwd.left }))
  // Back: from where the forward route left, Shift+Tab through the controls and out.
  if (fwd.left) {
    const back = await playerRoute(w, sel, { shift: true })
    const out = back.left?.active
    const toPrev = !!out && !!prev && out.id === prev.id && out.tag === prev.tag && (prev.value === null || out.value === prev.value)
    rows.push(row('Shift+Tab goes back through the controls', back.stops.length >= inventory.length ? 'pass' : 'fail', { stops: back.stops.length, inventory: inventory.length }))
    rows.push(row('Shift+Tab leaves for the previous real stop, never the card', out && !out.card && toPrev ? 'pass' : out && out.card ? 'fail' : prev ? 'fail' : 'cannot-determine', { left: back.left, expected: prev, why: out?.card ? 'the card, whose tabIndex is -1, took focus' : undefined }))
  }
  // play/pause and seek, apart, by the controls' own keys.
  const toControl = async (re) => {
    await w.evaluate(focusPrev)
    for (let i = 0; i < 20; i++) {
      await key(w, 'Tab')
      if (!(await w.evaluate(`document.activeElement === ${MEDIA(sel)}`))) return null
      const { focused } = await axSubtree(w, dom)
      if (focused && re.test(focused.name?.value ?? '')) return axRow(focused)
    }
    return null
  }
  const media = () => w.evaluate(`(() => { const v = ${MEDIA(sel)}; return { paused: v.paused, t: Math.round(v.currentTime * 1000) / 1000 } })()`)
  const play = await toControl(/^(play|pause)$/i)
  if (!play) rows.push(row('play/pause by keys', 'cannot-determine', { why: 'no play control reached by Tab' }))
  else {
    const a = await media(); await key(w, 'Space'); await sleep(800); const b = await media(); await key(w, 'Space'); await sleep(300); const c = await media()
    rows.push(row('play/pause by keys', a.paused && !b.paused && c.paused && b.t > a.t ? 'pass' : 'fail', { control: play, before: a, afterSpace: b, afterSecondSpace: c }))
  }
  const scrub = await toControl(/time|scrubber|seek/i)
  if (!scrub) rows.push(row('seek by keys, apart from play', 'cannot-determine', { why: 'no time slider reached by Tab' }))
  else {
    await w.evaluate(`${MEDIA(sel)}.pause()`)
    const a = await media(); await key(w, 'ArrowRight'); await sleep(400); const b = await media()
    rows.push(row('seek by keys, apart from play', a.paused && b.paused && b.t > a.t ? 'pass' : 'fail', { control: scrub, before: a, after: b }))
  }
  // Rings, by pixels, with playback paused on the held frame.
  await w.evaluate(`(async () => { const v = ${MEDIA(sel)}; v.pause(); const at = Math.min(0.5, (v.duration || 1) / 2); v.currentTime = at; await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 3000) }) })()`)
  const authored = await w.evaluate(AUTHOR_STYLES_PLAYER)
  await w.evaluate(focusPrev)
  for (let i = 0; i < inventory.length + 2; i++) {
    await key(w, 'Tab')
    if (!(await w.evaluate(`document.activeElement === ${MEDIA(sel)}`))) break
    const { focused } = await axSubtree(w, dom)
    const b = focused ? await boxOf(w, focused.backendDOMNodeId) : { error: 'no focused node' }
    const label = focused ? focused.role?.value + ' "' + (focused.name?.value ?? '') + '"' : 'unknown'
    if (b.error || !(b.w > 0)) { rows.push(row('ring by pixels', 'cannot-determine', { control: label, why: 'no box: ' + (b.error ?? 'empty') })); continue }
    const vp = await w.evaluate(`({ sx: scrollX, sy: scrollY, vw: innerWidth, vh: innerHeight, dpr: devicePixelRatio })`)
    const m = 6; const x = Math.max(0, b.x - m), y = Math.max(0, b.y - m)
    const clip = { x: x + vp.sx, y: y + vp.sy, width: Math.min(vp.vw - x, b.w + 2 * m), height: Math.min(vp.vh - y, b.h + 2 * m) }
    if (clip.width <= 0 || clip.height <= 0) { rows.push(row('ring by pixels', 'cannot-determine', { control: label, why: 'outside the viewport' })); continue }
    const on = await shot(w, clip)
    // Off: the same controls, the same frame, nothing focused (the controls stay drawn while paused).
    await w.evaluate(`document.activeElement && document.activeElement.blur()`)
    await sleep(250)
    const off = await shot(w, clip)
    const d = await analyse(w, DIFF, off, on)
    const px = vp.dpr * vp.dpr
    const area3 = Math.round(d.changed3 / px), perimeter = Math.round(4 * (b.w + b.h) - 16)
    const visible = d.changedAny > 0
    const outcome = d.error ? 'cannot-determine' : !visible ? 'fail' : area3 >= perimeter ? 'pass' : 'fail'
    const r = row('ring by pixels', outcome, { control: label, host: focused.backendDOMNodeId === dom, box: { w: Math.round(b.w), h: Math.round(b.h) }, areaAt3to1: area3, perimeter2px: perimeter, changedAny: Math.round(d.changedAny / px), bestRatio: d.best, visible,
      uaException: outcome === 'fail' && visible && !authored.length && focused.backendDOMNodeId !== dom ? 'a ring the user agent draws, not modified by the author (2.4.13); 2.4.7 holds: it is visible' : undefined,
      why: !visible ? 'no visible change when focused (2.4.7)' : undefined })
    if (run && recKey) { r.clips = [run.artifact(`${recKey}__p8ring-${i}-off.png`, Buffer.from(off, 'base64')), run.artifact(`${recKey}__p8ring-${i}-on.png`, Buffer.from(on, 'base64'))] }
    rows.push(r)
    // Back to this stop by keys: place on the card and Tab i+1 times.
    await w.evaluate(focusPrev)
    for (let k = 0; k <= i; k++) await key(w, 'Tab')
  }
  // Put back what was there.
  await w.evaluate(`(async () => { const v = ${MEDIA(sel)}; v.pause(); v.muted = ${before.muted}; if (Math.abs(v.currentTime - ${before.t}) > 0.01) { v.currentTime = ${before.t}; await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 3000) }) } const a = window.__p8restore; if (a && a !== document.body && a.isConnected) a.focus(); else if (document.activeElement) document.activeElement.blur(); scrollTo(0, ${before.scrollY}); })()`)
  return rows
}

// ---------------------------------------------------------------------------
// "About the video format", by keys and clicks.
const TIP_STATE = `(() => { const a = document.activeElement; const tip = document.getElementById('format-help'); const b = document.getElementById('format-help-button'); const o = document.getElementById('onset-help');
  return { open: !!tip && !tip.hidden, expanded: b && b.getAttribute('aria-expanded'), onsetOpen: !!o && !o.hidden, focus: !a || a === document.body ? 'body' : (a.id ? '#' + a.id : a.tagName.toLowerCase() + (a.name ? '[name=' + a.name + ']' : '') + (a.type === 'radio' ? '=' + a.value : '')) }; })()`
const TIP_READ = `(() => { ${WORDS} const b = document.getElementById('format-help-button'); const tip = document.getElementById('format-help'); if (!b || !tip) return null;
  const br = b.getBoundingClientRect(); const tr = tip.getBoundingClientRect(); const li = b.closest('li'); const lr = li ? li.getBoundingClientRect() : null; const cs = getComputedStyle(tip);
  const probe = document.createElement('div'); probe.style.borderTop = '1px solid var(--border-subtle)'; document.body.append(probe); const token = getComputedStyle(probe).borderTopColor; probe.remove();
  const sides = ['Top', 'Right', 'Bottom', 'Left'].map((s) => ({ w: cs['border' + s + 'Width'], style: cs['border' + s + 'Style'], color: cs['border' + s + 'Color'] }));
  return { label: b.getAttribute('aria-label'), labelExpected: W('lede.formatHelp.label'), controls: b.getAttribute('aria-controls'), text: tip.textContent.replace(/\\s+/g, ' ').trim(), textExpected: W('lede.formatHelp.text'),
    button: { w: Math.round(br.width), h: Math.round(br.height) }, open: !tip.hidden, sides, token, forced: matchMedia('(forced-colors: active)').matches,
    gap: tip.hidden ? null : Math.round((tr.top - br.bottom) * 10) / 10, belowButton: tip.hidden ? null : tr.top >= br.bottom - 0.5, insideItem: tip.hidden || !lr ? null : tr.left >= lr.left - 1 && tr.right <= lr.right + 1,
    inPage: tip.hidden ? null : tr.left >= 0 && tr.right <= document.documentElement.clientWidth + 0.5, rail: cs.borderLeftWidth !== cs.borderTopWidth } })()`

export async function formatTip(w) {
  const r0 = await w.evaluate(TIP_READ)
  if (!r0) return [row('format "?"', 'not-applicable', { why: 'no "About the video format" on the page' })]
  const shownBtn = await w.evaluate(`(() => { const b = document.getElementById('format-help-button'); return b.getClientRects().length > 0 && !b.closest('[inert]') && !document.querySelector('dialog[open]'); })()`)
  if (!shownBtn) return [row('format "?"', 'not-applicable', { why: 'the "?" is not reachable in this state (hidden, inert or behind a modal dialog)' })]
  const rows = []
  const startOpen = r0.open
  await w.evaluate(`window.__p8restore = document.activeElement`)
  const state = () => w.evaluate(TIP_STATE)
  const close = `(() => { const b = document.getElementById('format-help-button'); if (b.getAttribute('aria-expanded') === 'true') b.click(); })()`
  const focusBtn = `document.getElementById('format-help-button').focus()`
  rows.push(row('named, and its text, in the page\'s words', r0.label === r0.labelExpected && r0.text === r0.textExpected && r0.controls === 'format-help' ? 'pass' : r0.labelExpected === undefined ? 'cannot-determine' : 'fail', { label: r0.label, text: r0.text.slice(0, 80) }))
  rows.push(row('the "?" at least 44 x 44', r0.button.w >= 44 && r0.button.h >= 44 ? 'pass' : 'fail', r0.button))
  // Where Tab and Shift+Tab go with it closed: the reference for "closes by focus".
  await w.evaluate(close); await w.evaluate(focusBtn); await key(w, 'Tab'); const tabClosed = await state()
  await w.evaluate(focusBtn); await key(w, 'Tab', { shift: true }); const shiftClosed = await state()
  await w.evaluate(focusBtn); await key(w, 'Enter'); const opened = await state(); const open = await w.evaluate(TIP_READ)
  rows.push(row('Enter opens it; focus stays on the "?"', opened.open && opened.expanded === 'true' && opened.focus === '#format-help-button' ? 'pass' : 'fail', opened))
  const sides = open.sides
  const oneAll = sides.every((s) => s.w === '1px' && s.style === 'solid')
  const tokenColour = open.forced || sides.every((s) => s.color === open.token)
  rows.push(row('edge: 1 px all round in --border-subtle, not a rail', oneAll && tokenColour && !open.rail ? 'pass' : 'fail', { sides, token: open.token, forced: open.forced }))
  rows.push(row('gap: under the "?", inside its item and the page', open.belowButton && open.insideItem && open.inPage ? 'pass' : 'fail', { gap: open.gap, belowButton: open.belowButton, insideItem: open.insideItem, inPage: open.inPage }))
  await key(w, 'Tab'); const tabOpen = await state()
  rows.push(row('Tab closes it; focus goes where it goes with it closed', !tabOpen.open && tabOpen.focus === tabClosed.focus ? 'pass' : 'fail', { open: tabOpen, closed: tabClosed }))
  await w.evaluate(close); await w.evaluate(focusBtn); await key(w, 'Enter'); await key(w, 'Tab', { shift: true }); const shiftOpen = await state()
  rows.push(row('Shift+Tab closes it; focus goes where it goes with it closed', !shiftOpen.open && shiftOpen.focus === shiftClosed.focus ? 'pass' : 'fail', { open: shiftOpen, closed: shiftClosed }))
  await w.evaluate(close); await w.evaluate(focusBtn); await key(w, 'Space'); const space = await state(); await key(w, 'Escape'); const esc = await state()
  rows.push(row('Space opens it; Escape closes it, focus on the "?"', space.open && !esc.open && esc.expanded === 'false' && esc.focus === '#format-help-button' ? 'pass' : 'fail', { space, escape: esc }))
  await w.evaluate(focusBtn); await key(w, 'Enter'); await w.click('#format-help p'); const inside = await state(); await key(w, 'Escape'); const escInside = await state()
  rows.push(row('a click on its text keeps it open; Escape then closes it, focus on the "?"', inside.open && !escInside.open && escInside.focus === '#format-help-button' ? 'pass' : 'fail', { inside, escape: escInside }))
  await w.evaluate(focusBtn); await key(w, 'Enter'); await w.click('.page-title'); const outside = await state()
  rows.push(row('a click elsewhere closes it', !outside.open ? 'pass' : 'fail', outside))
  // Apart from the onset "?": never both open.
  const onset = await w.evaluate(`(() => { const b = document.getElementById('onset-help-button'); return !!b && b.getClientRects().length > 0 && !b.disabled; })()`)
  if (!onset) rows.push(row('apart from the onset "?"', 'not-applicable', { why: 'the onset "?" is not on the page in this state' }))
  else {
    await w.evaluate(close); await w.evaluate(focusBtn); await key(w, 'Enter'); await w.click('#onset-help-button'); const both = await state(); await key(w, 'Escape'); const after = await state()
    rows.push(row('apart from the onset "?": never both open', !(both.open && both.onsetOpen) && both.onsetOpen && !after.onsetOpen && after.focus === '#onset-help-button' ? 'pass' : 'fail', { afterOnsetClick: both, afterEscape: after }))
  }
  // Put back the state found.
  await w.evaluate(close)
  if (startOpen) { await w.evaluate(focusBtn); await key(w, 'Enter') }
  else await w.evaluate(`(() => { const a = window.__p8restore; if (a && a !== document.body && a.isConnected) a.focus(); else if (document.activeElement) document.activeElement.blur(); })()`)
  return rows
}

// ---------------------------------------------------------------------------
// The footer's headings, from the tree: level, order, words and group.
const FOOTER_ORDER = [
  ['heading', 2, 'footer.heading'], ['heading', 3, 'footer.groups.help'], ['link', null, 'footer.contact.creators'], ['link', null, 'footer.contact.selfService'],
  ['heading', 3, 'footer.groups.problem'], ['button', null, 'feedback.open'], ['heading', 3, 'footer.groups.opinion'], ['link', null, 'footer.feedbackForm'],
]
const FOOTER_READ = `(() => { ${WORDS} const box = document.querySelector('.footer-help'); if (!box) return null; const vis = box.getClientRects().length > 0;
  const lines = [...box.querySelectorAll('h2, h3, [role=heading]')].map((h) => { const range = document.createRange(); range.selectNodeContents(h); const rects = [...range.getClientRects()].filter((q) => q.width > 1); const text = h.textContent.trim(); const cjk = /[\\u3000-\\u9fff]/.test(text);
    const probe = document.createElement('span'); probe.textContent = 'the quick brown fox jumps over the lazy dog 0123456789'; probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; h.append(probe); const avg = probe.getBoundingClientRect().width / probe.textContent.length; probe.remove();
    const widest = Math.max(0, ...rects.map((q) => q.width)); return { text: text.slice(0, 50), lines: new Set(rects.map((q) => Math.round(q.top))).size, chars: Math.round(cjk ? widest / parseFloat(getComputedStyle(h).fontSize) : widest / avg), cjk }; });
  return { vis, inert: !!box.closest('[inert]') || !!document.querySelector('dialog[open]'), words: Object.fromEntries(${JSON.stringify(FOOTER_ORDER.map((o) => o[2]))}.map((k) => [k, W(k)])), lines }; })()`

export async function footerRows(w) {
  const r = await w.evaluate(FOOTER_READ)
  if (!r) return [row('footer headings', 'fail', { why: 'no .footer-help on the page' })]
  if (!r.vis) return [row('footer headings', 'not-applicable', { why: 'the footer is not drawn in this state' })]
  if (r.inert) return [row('footer headings', 'not-applicable', { why: 'behind an open modal dialog: not exposed' })]
  const dom = await backendId(w, '.footer-help')
  const t = await axSubtree(w, dom)
  const seq = t.descendants.filter((n) => !n.ignored && ['heading', 'link', 'button'].includes(n.role?.value)).map((n) => ({ role: n.role.value, level: prop(n, 'level') ?? null, name: (n.name?.value ?? '').trim() }))
  const rows = []
  const h2 = seq.filter((s) => s.role === 'heading' && s.level === 2), h3 = seq.filter((s) => s.role === 'heading' && s.level === 3)
  rows.push(row('one h2, by its level in the tree', h2.length === 1 ? 'pass' : 'fail', { h2: h2.map((h) => h.name) }))
  rows.push(row('three h3, by their level in the tree', h3.length === 3 ? 'pass' : 'fail', { h3: h3.map((h) => h.name) }))
  const words = r.words
  const known = Object.values(words).every((x) => typeof x === 'string')
  const order = seq.length === FOOTER_ORDER.length && FOOTER_ORDER.every(([role, level, k], i) => seq[i].role === role && (level === null || seq[i].level === level))
  rows.push(row('order and levels: h2, h3 over the two help links, h3 over Report a problem, h3 over the form', order ? 'pass' : 'fail', { seq }))
  rows.push(row('each in the page\'s words', !known ? 'cannot-determine' : seq.length === FOOTER_ORDER.length && FOOTER_ORDER.every(([, , k], i) => seq[i].name === words[k]) ? 'pass' : 'fail', { names: seq.map((s) => s.name), expected: FOOTER_ORDER.map(([, , k]) => words[k]) }))
  const iProblem = seq.findIndex((s) => s.role === 'heading' && s.name === words['footer.groups.problem']), iButton = seq.findIndex((s) => s.role === 'button' && s.name === words['feedback.open']), iOpinion = seq.findIndex((s) => s.role === 'heading' && s.name === words['footer.groups.opinion'])
  rows.push(row('Report a problem in its group', iProblem >= 0 && iButton > iProblem && (iOpinion < 0 || iButton < iOpinion) ? 'pass' : 'fail', { iProblem, iButton, iOpinion }))
  const longest = r.lines.reduce((m, l) => Math.max(m, l.chars), 0)
  rows.push(row('measure: each heading under 80 characters a line (40 CJK)', r.lines.every((l) => l.chars <= (l.cjk ? 40 : 80)) ? 'pass' : 'fail', { lines: r.lines, longest }))
  return rows
}

// ---------------------------------------------------------------------------
// The heavy-limiting warning, judged by the bite the job logged.
/** The worker's console from the page's session: each "chain planned" record, whole, on the wall clock. */
export async function watchWorkers(browser, w) {
  const seen = (w.p8planned = { planned: [], workers: 0 })
  browser.on(w.page.sessionId, 'Target.attachedToTarget', async ({ sessionId, targetInfo }) => {
    if (targetInfo.type !== 'worker') return
    seen.workers++
    browser.on(sessionId, 'Runtime.consoleAPICalled', async (e) => {
      // A fault's prelude says where it fired (faults.mjs F18): kept, by value.
      if (/^fault F\d+/.test(String(e.args?.[0]?.value ?? ''))) { (seen.faults = seen.faults ?? []).push({ t: Date.now(), args: e.args.map((x) => x.value ?? x.description ?? null) }); return }
      if (e.args?.[1]?.value !== 'chain planned' || !e.args[2]?.objectId) return
      const t = Date.now()
      try {
        const r = await browser.send('Runtime.callFunctionOn', { objectId: e.args[2].objectId, functionDeclaration: 'function () { return JSON.stringify(this) }', returnByValue: true }, sessionId)
        seen.planned.push({ t, ...JSON.parse(r.result.value) })
      } catch { seen.planned.push({ t, unread: true }) }
    })
    await browser.send('Runtime.enable', {}, sessionId).catch(() => {})
    await browser.send('Runtime.runIfWaitingForDebugger', {}, sessionId).catch(() => {})
  })
  await w.page.send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true })
  return seen
}

/** The status line's texts inside the completion transition: after the last job started, to 4 s after it finished; never earlier history. */
export async function spokenAtCompletion(w) {
  return w.evaluate(`(() => { const P = window.__p8; if (!P) return null; const fin = P.events.filter((e) => e.kind === 'finish').at(-1); if (!fin) return null;
    const start = P.events.filter((e) => e.kind === 'start' && e.t <= fin.t).at(-1); const from = start ? start.t : fin.t - 1;
    return { from, to: fin.t + 4000, texts: P.status.filter((s) => s.t > from && s.t <= fin.t + 4000).map((s) => s.text) }; })()`)
}

const LIMIT_READ = `(() => { ${WORDS} const P = window.__p8 || { events: [], warnings: [] };
  const card = document.querySelector('${CARD}'); const box = P.warnBox ? P.warnBox() : null;
  const items = box ? [...box.querySelectorAll('li, .notification-item')].filter((el) => !el.querySelector('li')) : [];
  const titles = items.map((el) => (el.querySelector('strong, .notification-item-title, h3, h4, p') || el).textContent.trim());
  const heavy = W('warnings.heavyLimiting.heading'), detail = W('warnings.heavyLimiting.detail'), meta = W('warnings.metadataLost.heading');
  const text = box ? box.textContent.replace(/\\s+/g, ' ') : '';
  const fin = P.events.filter((e) => e.kind === 'finish').at(-1) || null; const start = fin ? P.events.filter((e) => e.kind === 'start' && e.t <= fin.t).at(-1) : null;
  const saves = P.events.filter((e) => e.kind === 'save-end' && fin && e.t > fin.t); const saveStarts = P.events.filter((e) => e.kind === 'save-start' && fin && e.t > fin.t);
  const savedLine = W('status.saved'); const saved = !!savedLine && ((document.getElementById('save-status') || {}).textContent || '').trim().startsWith(savedLine.split('.')[0]);
  const lang = document.documentElement.lang;
  const beforeSave = saveStarts.length ? P.warnings.filter((x) => x.t <= saveStarts[0].t).at(-1) : null;
  return { card: !!card, box: !!box, titles, heavy, detail, meta, hasHeavy: !!heavy && text.includes(heavy), hasDetail: !!detail && text.includes(detail), heavyIndex: titles.indexOf(heavy), metaIndex: titles.indexOf(meta),
    fin, start, saved, lang, text, beforeSave, langChanges: P.warnings.filter((x) => fin && x.t > fin.t).map((x) => x.lang) }; })()`

export async function limitingRows(w) {
  const r = await w.evaluate(LIMIT_READ)
  if (!r.card) return [row('heavy-limiting warning', 'not-applicable', { why: 'no finished card on the page' })]
  const rows = []
  const seen = w.p8planned
  let bite = null, why
  if (!r.fin) why = 'the job that made this card finished before the page was watched'
  else if (!seen) why = 'the worker was not watched'
  else {
    const mine = seen.planned.filter((p) => p.t >= (r.start?.t ?? 0) - 50 && p.t <= r.fin.t + 50)
    if (mine.length) bite = mine.at(-1).limiterBiteLu ?? null
    else if (!seen.workers) why = 'no worker attached, so no bite was read'
  }
  const expectHeavy = bite !== null && bite > HEAVY_LIMITING_LU
  const near = bite !== null && Math.abs(bite - HEAVY_LIMITING_LU) < 0.02
  if (why) rows.push(row('present above the threshold, absent below', 'cannot-determine', { why, hasHeavy: r.hasHeavy }))
  else rows.push(row('present above the threshold, absent below', near ? 'cannot-determine' : r.hasHeavy === expectHeavy ? 'pass' : 'fail', { bite, threshold: HEAVY_LIMITING_LU, hasHeavy: r.hasHeavy, why: near ? 'the logged bite is rounded and sits on the threshold' : undefined }))
  if (!r.hasHeavy) return rows
  rows.push(row('heading and detail word for word', r.hasDetail ? 'pass' : 'fail'))
  rows.push(row('first among the card\'s warnings', r.heavyIndex === 0 ? 'pass' : 'fail', { titles: r.titles }))
  const spoken = await spokenAtCompletion(w)
  if (!spoken) rows.push(row('first in the line spoken at completion, inside its interval', 'cannot-determine', { why: 'no completion was watched on this page' }))
  else {
    const said = spoken.texts.find((t) => r.heavy && t.includes(r.heavy)) ?? null
    const order = said ? (r.metaIndex < 0 || !said.includes(r.meta) || said.indexOf(r.heavy) < said.indexOf(r.meta)) : false
    const langNow = r.lang === r.fin.lang
    rows.push(row('first in the line spoken at completion, inside its interval', !langNow && !said ? 'cannot-determine' : said && order ? 'pass' : 'fail', { interval: [spoken.from, spoken.to], texts: spoken.texts.slice(-4), why: !langNow && !said ? 'the page language changed since the completion' : undefined }))
  }
  if (r.saved) {
    const unchanged = r.beforeSave && r.beforeSave.lang === r.lang ? r.beforeSave.text === r.text.replace(/\s+/g, ' ').trim() : null
    rows.push(row('unchanged after a save', unchanged === null ? 'cannot-determine' : unchanged ? 'pass' : 'fail', { why: unchanged === null ? 'no reading before the save in the same language' : undefined }))
  }
  return rows
}

// ---------------------------------------------------------------------------
// Video language at the top of step 3.
const LANG_READ = `(() => { ${WORDS} const M = window.__mx;
  const fs = document.getElementById('video-language'); const step = document.getElementById('step-title'); const kind = document.getElementById('video-kind'); const next = document.getElementById('video-next');
  const shown = (el) => !!el && !el.hidden && el.getClientRects().length > 0;
  const after = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
  const heading = document.getElementById('title-heading'); const card = document.getElementById('title-card-choice'); const note = step && step.querySelector('.lock-note');
  const running = !!(M && M.running && M.running()); const saving = !!(M && M.saving && M.saving());
  const noteText = note && shown(note) ? note.textContent.trim() : '';
  return { fs: !!fs, stepShown: shown(step), fsShown: shown(fs), inStep: !!step && !!fs && step.contains(fs), afterHeading: after(heading, fs), afterNote: !!note && after(note, fs), beforeCard: after(fs, card), inCard: !!card && !!fs && card.contains(fs),
    disabled: !!fs && fs.disabled, running, saving, noteText, making: W('create.lockedMaking'), savingNote: W('create.lockedSaving'), stopping: W('create.lockedStopping'),
    nextInKind: !!kind && !!next && kind.contains(next), kindDescribedBy: kind && kind.getAttribute('aria-describedby'), langDescribedBy: fs && fs.getAttribute('aria-describedby'),
    nextShown: shown(next), nextText: next ? next.textContent.trim() : null, nextExpected: W('videoKind.nextVideo'), oldKey: M && M.msg ? M.msg('videoLanguage.nextVideo') : undefined }; })()`

export async function videoLanguageRows(w) {
  const r = await w.evaluate(LANG_READ)
  const rows = []
  rows.push(row('the next-video line under Video type alone', r.nextInKind && /\bvideo-next\b/.test(r.kindDescribedBy ?? '') && r.langDescribedBy === 'video-language-helper' && r.oldKey === undefined && (!r.nextShown || r.nextText === r.nextExpected) ? 'pass' : 'fail', { nextInKind: r.nextInKind, kindDescribedBy: r.kindDescribedBy, langDescribedBy: r.langDescribedBy, nextShown: r.nextShown, nextText: r.nextText, oldKeyPresent: r.oldKey !== undefined }))
  if (!r.fs) { rows.push(row('Video language in step 3', 'fail', { why: 'no #video-language' })); return rows }
  if (!r.stepShown) { rows.push(row('Video language in step 3', 'not-applicable', { why: 'step 3 is not shown in this state' })); return rows }
  rows.push(row('at the top of step 3: under its heading and lock note, before the title card choice, outside it', r.inStep && r.afterHeading && r.afterNote && r.beforeCard && !r.inCard && r.fsShown ? 'pass' : 'fail', { inStep: r.inStep, afterHeading: r.afterHeading, afterNote: r.afterNote, beforeCard: r.beforeCard, inCard: r.inCard, shown: r.fsShown }))
  const want = r.running || r.saving || (!!r.noteText && r.noteText === r.stopping)
  const noteOk = !r.disabled ? true : r.saving ? r.noteText === r.savingNote : r.running ? r.noteText === r.making : r.noteText === r.stopping
  rows.push(row('locked while a video is made, saved or stopping, and only then; the lock note says why', r.disabled === want && noteOk ? 'pass' : 'fail', { disabled: r.disabled, running: r.running, saving: r.saving, note: r.noteText }))
  return rows
}

// ---------------------------------------------------------------------------
/** A scenario's own assertions: `{ what, expr }` read in the page with M, or `{ what, fn(w) }` returning a row. */
export async function assertRows(w, sc) {
  if (!sc.asserts?.length) return [row('the scenario\'s own assertions', 'not-applicable', { why: 'the scenario declares none beyond its state' })]
  const rows = []
  for (const a of sc.asserts) {
    try {
      if (a.fn) { const r = await a.fn(w); rows.push({ what: a.what, ...(typeof r === 'object' ? r : { outcome: r ? 'pass' : 'fail' }) }); continue }
      const v = await w.evaluate(`(() => { const M = window.__mx; try { const v = (${a.expr}); return { ok: !!v, v: typeof v === 'object' ? v : undefined }; } catch (e) { return { error: String(e.message || e).slice(0, 160) }; } })()`)
      rows.push(row(a.what, v.error ? 'cannot-determine' : v.ok ? 'pass' : a.native ? 'cannot-determine' : 'fail', { why: v.error, expr: a.expr.slice(0, 160) }))
    } catch (e) { rows.push(row(a.what, 'cannot-determine', { why: String(e.message ?? e).slice(0, 160) })) }
  }
  return rows
}

/** Every Phase 8 instrument for a record: passive ones always, active ones where `sc.p8` names them. */
export async function phase8Instruments(w, sc, { run, recKey, aggregate }) {
  const out = {}
  const p8 = new Set(sc.p8 ?? [])
  const safe = async (name, fn, opts) => { try { return aggregate(await fn(), opts) } catch (e) { return { outcome: 'cannot-determine', why: 'the instrument failed: ' + String(e.message ?? e).slice(0, 200), rows: 0, counted: 0, exempt: 0, items: [] } } }
  // A user-agent exception is an exemption with its reason, never a pass.
  out.player = await safe('player', async () => [...(await playerRows(w)), ...(p8.has('playerKeys') ? await playerKeys(w, { run, key: recKey }) : [])], { exempt: (i) => i.uaException || false })
  out.formatTip = await safe('formatTip', async () => (p8.has('formatTip') ? formatTip(w) : [row('format "?" by keys', 'not-applicable', { why: 'walked in the scenarios that own it (S-03, S-141 to S-144)' })]))
  out.footer = await safe('footer', () => footerRows(w))
  out.limiting = await safe('limiting', () => limitingRows(w))
  out.videoLanguage = await safe('videoLanguage', () => videoLanguageRows(w))
  out.asserts = await safe('asserts', () => assertRows(w, sc))
  return out
}
export const PHASE8_INSTRUMENTS = ['player', 'formatTip', 'footer', 'limiting', 'videoLanguage', 'asserts']
