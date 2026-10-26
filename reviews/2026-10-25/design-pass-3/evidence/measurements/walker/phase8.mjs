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
//                 controls' inventory, names and targets, apart from the host
//                 (geometry at rest and disclosed, hit area by hit test).
//   playerKeys    (active, P-06) the route by the focused accessibility node,
//                 forward and back, each stop's identity held to the
//                 inventory; play/pause and seek proved apart, with the
//                 controls' exposed name and value around them (4.1.2); each
//                 stop on a held frame: 2.4.7 by the ring alone, 2.4.13 by
//                 area with each exception's own evidence, and 2.4.11/2.4.12
//                 by author content over the control, kept apart.
//   formatTip     (active) "About the video format" (VH-196): opening, closing
//                 by Tab, Shift+Tab, Escape and a click, its edge and gap,
//                 apart from the onset "?".
//   footer        the footer's headings (VH-182): one h2, three h3, their
//                 order, levels (from the tree), words and measure, Report a
//                 problem in its group.
//   limiting      the heavy-limiting warning (VH-193): present above
//                 HEAVY_LIMITING_LU, absent below, by the bite the job logged
//                 (a logged null bite and an established no-plan job apart
//                 from missing evidence); first on the card, and in the
//                 completion's own write to the status line with every
//                 warning title in order; unchanged by a save.
//   videoLanguage Video language at the top of step 3 (VH-191): its place, its
//                 lock while a video is made or saved, and the next-video line
//                 under Video type alone.
//
// Words come from the page's own message tables (scenarios.mjs MX_INIT) or,
// on a proof's fixture page, from `window.__p8words`.
import { Buffer } from 'node:buffer'
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
  // writes: every write to the status line, its text after the write, even
  // when the text is unchanged (Codex astra's method check, 25 October, M-01:
  // the line spoken at completion is the completion's own write).
  const P = (window.__p8 = { events: [], status: [], writes: [], warnings: [], plays: [] });
  const shown = (el) => !!el && !el.hidden && el.getClientRects().length > 0;
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  let running = false, awaiting = false, saving = false, statusText = null, warnText = null;
  const warnBox = () => { const c = document.querySelector('${CARD}'); if (!c) return null; for (let e = c.nextElementSibling; e; e = e.nextElementSibling) { const n = e.matches('.notification') ? e : e.querySelector('.notification'); if (n) return n; } return null; };
  P.warnBox = warnBox;
  // cardNew: a write in the same mutation batch as a newly drawn finished card
  // (a new element), so the completion's write is bound to the mutation that
  // drew the card, never to a time window (Codex astra's re-check, 26 October,
  // M-01): the app writes the line in the same task as it draws the card.
  let lastCard = null;
  const tick = (recs) => {
    const line = document.getElementById('status');
    const cardEl = document.querySelector('${CARD}'); const cardNew = !!cardEl && cardEl !== lastCard; lastCard = cardEl;
    if (line && recs && recs.some((m) => m.target === line || line.contains(m.target))) P.writes.push({ t: Date.now(), text: norm(line.textContent), cardNew });
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
  document.addEventListener('DOMContentLoaded', () => { new MutationObserver((recs) => tick(recs)).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'class'] }); tick(); });
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
const r1 = (x) => Math.round(x * 10) / 10
const geo = (b) => (b.error ? { unavailable: b.error } : { w: r1(b.w), h: r1(b.h) })

// ---------------------------------------------------------------------------
// The player's own controls, reached through the protocol (Codex astra's
// method check, 25 October, M-02): they live in the user agent's shadow tree,
// so the page's own scripts see only the <video>. DOM.describeNode with
// pierce, CSS.getMatchedStylesForNode and DOM.getNodeForLocation with
// includeUserAgentShadowDOM reach them (probed on Chrome 156).
const describe = async (w, backendNodeId, depth = 0) => (await w.page.send('DOM.describeNode', { backendNodeId, depth, pierce: true })).node
const attrOf = (node, name) => { const a = node.attributes ?? []; for (let i = 0; i < a.length; i += 2) if (a[i] === name) return a[i + 1]; return undefined }
/** Every backend node id under `backendNodeId`, itself included, user-agent shadow trees too. */
async function subtreeIds(w, backendNodeId) {
  const ids = new Set()
  const walk = (n) => { ids.add(n.backendNodeId); for (const k of [...(n.children ?? []), ...(n.shadowRoots ?? []), ...(n.pseudoElements ?? [])]) walk(k) }
  try { walk(await describe(w, backendNodeId, -1)) } catch { ids.add(backendNodeId) }
  return ids
}
const SIZE_PROPS = /^(width|height|(min|max)-(width|height)|padding|margin|inset|zoom|transform|scale|flex|border|font-size|line-height|aspect-ratio)/
const RING_PROPS = /^(outline|box-shadow|border|background|color|filter|opacity|accent-color|appearance)/
const BACKDROP_PROPS = /^(background|color-scheme|filter|opacity|backdrop-filter|mix-blend-mode)/
// The host's own ring: its outline or shadow (its background is the letterbox, not the ring).
const HOST_RING_PROPS = /^(outline|box-shadow)/
/**
 * The author's rules matching a node (every origin but the user agent's) that
 * set a property `re` names, and its style attribute: the evidence for the
 * user-agent exceptions (2.5.5's, 2.4.13's), where the selector-text search
 * this replaces could establish neither.
 */
async function authorRules(w, backendNodeId, re) {
  try {
    await w.page.send('DOM.getDocument', { depth: 0, pierce: true })
    const { nodeIds } = await w.page.send('DOM.pushNodesByBackendIdsToFrontend', { backendNodeIds: [backendNodeId] })
    await w.page.send('CSS.enable')
    const ms = await w.page.send('CSS.getMatchedStylesForNode', { nodeId: nodeIds[0] })
    const pick = (style) => [...new Set((style?.cssProperties ?? []).filter((p) => !p.disabled && p.value && re.test(p.name)).map((p) => p.name + ': ' + p.value))]
    const rules = (ms.matchedCSSRules ?? []).filter((m) => m.rule.origin !== 'user-agent').map((m) => ({ origin: m.rule.origin, selector: m.rule.selectorList.text.slice(0, 120), props: pick(m.rule.style) })).filter((x) => x.props.length)
    const inline = pick(ms.inlineStyle)
    if (inline.length) rules.push({ origin: 'style attribute', selector: 'style=""', props: inline })
    return { rules }
  } catch (e) { return { error: 'author rules unread: ' + String(e.message ?? e).slice(0, 100) } }
}
/** The CSS domain off again once an instrument has read its rules (authorRules leaves it on between reads). */
const cssOff = (w) => w.page.send('CSS.disable').catch(() => {})
/**
 * The node a point hits, user-agent shadow trees included; `occlusion`
 * hit-tests pointer-events: none too (it still hides what is under it).
 * `x`, `y` are viewport coordinates, as DOM.getBoxModel gives them;
 * DOM.getNodeForLocation takes the document's, so the scroll is added
 * (probed on the app scrolled 2,902 px: viewport coordinates hit nothing).
 */
async function hitAt(w, x, y, vp, { occlusion = false } = {}) {
  try { return (await w.page.send('DOM.getNodeForLocation', { x: Math.round(x + vp.sx), y: Math.round(y + vp.sy), includeUserAgentShadowDOM: true, ignorePointerEventsNone: occlusion })).backendNodeId ?? null } catch { return null }
}
const viewport = (w) => w.evaluate(`({ vw: innerWidth, vh: innerHeight, sx: scrollX, sy: scrollY, dpr: devicePixelRatio })`)
/**
 * 2.5.5 by hit test, not the border box: the run of points hitting the
 * control (or a node under it) through its centre, across and down, every
 * 4 px up to 80 px each way, then to the edge by 1 px; where both reach 44 px, a 44 px square centred
 * on that run, sampled at 7 x 7 points, must hit it at every point. Unavailable
 * (never a pass) when no point of the box hits the control.
 */
async function hitArea(w, b, own, vp) {
  const inView = (x, y) => x >= 0 && y >= 0 && x < vp.vw && y < vp.vh
  const mine = async (x, y) => inView(x, y) && own.has(await hitAt(w, x, y, vp))
  let cx = b.x + b.w / 2, cy = b.y + b.h / 2
  if (!(await mine(cx, cy))) {
    let found = null
    for (let i = 1; i < 5 && !found; i++) for (let j = 1; j < 5 && !found; j++) { const x = b.x + (b.w * i) / 5, y = b.y + (b.h * j) / 5; if (await mine(x, y)) found = [x, y] }
    if (!found) return { unavailable: inView(cx, cy) ? 'no point of its box hits the control' : 'the control is outside the viewport' }
    ;[cx, cy] = found
  }
  // Out by 4 px to the first miss, then back to the edge by 1 px.
  const run = async (dx, dy) => { let n = 0; for (let i = 1; i <= 20; i++) { if (!(await mine(cx + dx * i * 4, cy + dy * i * 4))) break; n = i } let e = n * 4; if (n < 20) for (let k = 1; k < 4 && (await mine(cx + dx * (e + 1), cy + dy * (e + 1))); k++) e++; return e }
  const [l, r, u, d] = [await run(-1, 0), await run(1, 0), await run(0, -1), await run(0, 1)]
  const out = { hitW: l + r + 1, hitH: u + d + 1, capped: [l, r, u, d].some((x) => x >= 80) || undefined, square44: false }
  if (out.hitW >= 44 && out.hitH >= 44) {
    // Seven points a side, the outer ones 21.5 px from the centre: a 44 px square's pixel centres.
    const sx = cx + (r - l) / 2, sy = cy + (d - u) / 2
    let hits = 0, n = 0
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { n++; if (await mine(sx - 21.5 + (43 * i) / 6, sy - 21.5 + (43 * j) / 6)) hits++ }
    Object.assign(out, { square44: hits === n, squareHits: `${hits} of ${n}` })
  }
  return out
}
/** 2.4.11 and 2.4.12: an 8 x 8 grid over the focused control, each point the control's own, the player's (the user agent's), or author content painted over it. */
async function coverage(w, b, own, host, vp) {
  const out = { samples: 0, outside: 0, own: 0, userAgent: 0, author: 0, coveredBy: [] }
  const ids = []
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    const x = b.x + 1 + ((b.w - 2) * i) / 7, y = b.y + 1 + ((b.h - 2) * j) / 7
    out.samples++
    if (x < 0 || y < 0 || x >= vp.vw || y >= vp.vh) { out.outside++; continue }
    const id = await hitAt(w, x, y, vp, { occlusion: true })
    if (id === null) out.outside++
    else if (own.has(id)) out.own++
    else if (host.has(id)) out.userAgent++
    else { out.author++; if (!ids.includes(id) && ids.length < 3) ids.push(id) }
  }
  for (const id of ids) { try { const n = await describe(w, id); out.coveredBy.push(n.nodeName.toLowerCase() + (attrOf(n, 'id') ? '#' + attrOf(n, 'id') : '') + (attrOf(n, 'class') ? '.' + attrOf(n, 'class').trim().split(/\s+/)[0] : '')) } catch { out.coveredBy.push('node ' + id) } }
  return out
}
/** A control's box once it has stopped moving (a disclosure runs a transition): two equal readings 100 ms apart, non-empty unless `nonEmpty` is false, up to 1.5 s. */
async function settledBox(w, backendNodeId, { nonEmpty = true } = {}) {
  let last = await boxOf(w, backendNodeId)
  for (let i = 0; i < 15; i++) { await sleep(100); const b = await boxOf(w, backendNodeId); if (!b.error && !last.error && (!nonEmpty || b.w > 0) && Math.abs(b.w - last.w) < 0.5 && Math.abs(b.h - last.h) < 0.5) return b; last = b }
  return last
}

// The verdicts, apart from the readings, so each distinction is proved on its own (prove-8.mjs).
/** 2.5.5: unavailable geometry, an empty box never disclosed, and unavailable hit-area evidence are three "cannot determine"s, each named; the user agent's exception only where no author rule sets the control's size. */
export function targetVerdict({ rest, available, disclosedBy, hit, sizing }) {
  if (rest.error) return { outcome: 'cannot-determine', why: 'geometry unavailable: ' + rest.error }
  const g = available ?? rest
  if (!(g.w > 0 && g.h > 0)) return { outcome: 'cannot-determine', why: `geometry ${r1(g.w)} x ${r1(g.h)} at rest, and not disclosed by hovering the other controls: no target to measure` }
  if (hit.unavailable) return { outcome: 'cannot-determine', why: `hit area unavailable (${hit.unavailable}); geometry ${r1(g.w)} x ${r1(g.h)}${disclosedBy ? ', disclosed by ' + disclosedBy : ''}` }
  if (hit.square44) return { outcome: 'pass' }
  const short = `no 44 px square of hits (a hit run of ${hit.hitW} x ${hit.hitH} px)`
  if (sizing.error) return { outcome: 'cannot-determine', why: `${short}; 2.5.5's user-agent exception neither established nor excluded (${sizing.error})` }
  if (sizing.rules.length) return { outcome: 'fail', why: `${short}; the author sets its size, so 2.5.5's user-agent exception does not hold`, authorSizing: sizing.rules }
  return { outcome: 'fail', why: short, uaException: 'the user agent\'s size: no author rule sets this control\'s size (2.5.5)' }
}
/** 2.4.7: the ring alone, isolated by an author outline:none on the control with focus and disclosure unchanged; any other focus-only change is not settled here. */
export function visibleVerdict({ isolated, pseudo, ringAny, ring3, residualAny, residual3, onOffAny }) {
  if (!isolated) return { outcome: 'cannot-determine', why: `the ring cannot be isolated from the controls' other redraw: no author style reaches ${pseudo ? '::' + pseudo : 'this control'}; focused against unfocused differs by ${onOffAny} px, the highlight and any disclosure included` }
  if (ring3 > 0) return { outcome: 'pass' }
  if (ringAny > 0) return { outcome: 'cannot-determine', why: `a ring of ${ringAny} px, none of it at 3:1 against what it covers: whether it is visible is VH-200's`, unresolved: 'interpretation' }
  if (residualAny > 0) return { outcome: 'cannot-determine', why: `no ring: an outline:none on the control leaves its focused pixels unchanged; a focus-only change other than a ring remains (${residualAny} px, ${residual3} at 3:1: the user agent's hover-and-focus highlight, or a disclosure); whether that alone is a visible indicator is VH-200's`, unresolved: 'interpretation' }
  return { outcome: 'fail', why: 'nothing changes when the control is focused (2.4.7)' }
}
/**
 * 2.4.13 by area, the area the ring's own pixels: those an author outline
 * removal changes with focus and disclosure unchanged (`ringArea3`, at 3:1),
 * never the whole focused-against-unfocused redraw, which holds the user
 * agent's highlight and any disclosure (Codex astra's re-check, 26 October,
 * M-02); where the ring cannot be isolated, its area is not established.
 * Short of the area, or without it, its two exceptions apart: (i) a ring the user
 * agent draws that the author cannot adjust, refuted where the instrument's
 * own author style removed it, supported where no author selector reaches
 * the control (an -internal- pseudo-element); (ii) neither the ring nor its
 * background modified by the author, read from the author rules matching the
 * focused control and the host's backdrop. What neither settles is VH-200's.
 */
export function appearanceVerdict({ isHost, ringArea3, perimeter, error, pseudo, isolated, ringAny, indicatorRules, backdropRules }) {
  if (error) return { outcome: 'cannot-determine', why: 'pixels unread: ' + error }
  if (isolated && ringArea3 >= perimeter) return { outcome: 'pass' }
  const short = isolated ? `under 2.4.13's area: the ring's own pixels at 3:1 are ${ringArea3} of ${perimeter}` : `2.4.13's area not established: the ring's own pixels cannot be told from the controls' other redraw (${pseudo ? 'no author style reaches ::' + pseudo : 'no author style reaches this control'})`
  if (isHost) {
    if (indicatorRules.error) return { outcome: 'cannot-determine', why: short + '; ' + indicatorRules.error }
    if (indicatorRules.rules.length) return { outcome: 'fail', why: short + ': the author styles the host\'s ring', indicatorRules: indicatorRules.rules }
    return { outcome: 'cannot-determine', why: short + ': the host\'s ring is the user agent\'s default on an author element, which an author outline can change; whether the page around it is an unmodified background is VH-200\'s', unresolved: 'interpretation' }
  }
  const internal = !!pseudo && pseudo.startsWith('-internal-')
  const userAgentOnly = isolated
    ? ringAny > 0 ? { holds: false, evidence: `an author outline:none on ::${pseudo} removed ${ringAny} px of the ring: the author can adjust it` } : { holds: null, evidence: 'an author outline:none changed nothing: no ring to adjust' }
    : internal ? { holds: true, evidence: `no author selector reaches ::${pseudo}` } : { holds: null, evidence: 'not probed: no pseudo-element an author style could name' }
  const indicator = indicatorRules.error ? null : !indicatorRules.rules.length
  const background = backdropRules.error ? null : !backdropRules.rules.length
  const unmodified = { holds: indicator === false ? false : indicator && background ? true : null, indicator, indicatorRules: indicatorRules.rules ?? indicatorRules.error, background, backgroundRules: backdropRules.rules ?? backdropRules.error }
  const exceptions = { userAgentOnly, unmodified }
  if (indicator === false) return { outcome: 'fail', exceptions, why: short + ', and the author styles the ring, so neither exception holds' }
  if (userAgentOnly.holds) return { outcome: 'fail', exceptions, uaException: `2.4.13's first exception: the user agent's ring, which the author cannot adjust (${userAgentOnly.evidence})` }
  if (unmodified.holds) return { outcome: 'fail', exceptions, uaException: '2.4.13\'s second exception: neither the ring nor its background is modified by the author (no author rule on the control or the host\'s backdrop)' }
  const bgSaid = background === false ? `the host's backdrop is set by the author (${backdropRules.rules.map((x) => x.selector + ' { ' + x.props.join('; ') + ' }').join(', ').slice(0, 160)})` : 'the backdrop\'s rules unread'
  return { outcome: 'cannot-determine', exceptions, why: `${short}; the first exception ${userAgentOnly.holds === false ? 'does not hold' : 'is not established'} (${userAgentOnly.evidence}); the second: the ring is unmodified, but ${bgSaid}: whether that is the indicator's background is VH-200's`, unresolved: 'interpretation' }
}
/** 2.4.11 and 2.4.12: author content painted over the focused control, apart from the ring's appearance and the exceptions; the viewport's edge is not author content. */
export function occlusionVerdict(c) {
  const inView = c.samples - c.outside
  if (!inView) return { outcome: 'cannot-determine', why: 'no part of the control inside the viewport to sample (the viewport\'s edge is not author content)' }
  if (!c.author) return { outcome: 'pass' }
  return { outcome: 'fail', why: c.author < inView ? `2.4.12: partly hidden by author content (${c.coveredBy.join(', ')}), ${c.author} of ${inView} points; 2.4.11 holds: not entirely hidden` : `2.4.11 and 2.4.12: entirely hidden by author content (${c.coveredBy.join(', ')})` }
}
/** The stops a route reached, by accessibility identity, against the inventory: every control reached, none from outside it. */
export function compareStops(stops, inventory) {
  const inv = new Map(inventory.map((c) => [c.dom, c]))
  const controls = stops.filter((s) => !s.host)
  const reached = new Set(controls.map((s) => s.dom))
  const missing = inventory.filter((c) => !reached.has(c.dom)).map((c) => c.role + ' "' + c.name + '"')
  const foreign = controls.filter((s) => !inv.has(s.dom)).map((s) => s.role + ' "' + s.name + '"')
  return { ok: inventory.length > 0 && !missing.length && !foreign.length, missing, foreign, repeats: controls.length - reached.size }
}
/** 4.1.2: the control's exposed name (play/pause) or value (the time slider) read from the tree around the operation, not the media element's state alone. */
export function exposedChange(kind, m, ax) {
  if (kind === 'play') {
    if (!(m.a.paused && !m.b.paused && m.c.paused)) return { outcome: 'cannot-determine', why: 'playback did not toggle by keys, so there was no change to expose (the play/pause row says why)' }
    if (!ax.a || !ax.b || !ax.c) return { outcome: 'cannot-determine', why: 'no accessibility reading of the control around the presses' }
    const ok = ax.a.name !== ax.b.name && ax.c.name === ax.a.name
    return { outcome: ok ? 'pass' : 'fail', why: ok ? undefined : 'playback toggled, but the control\'s exposed name did not follow it' }
  }
  if (!(m.b.t > m.a.t)) return { outcome: 'cannot-determine', why: 'the time did not move by keys, so there was no change to expose (the seek row says why)' }
  const va = Number(ax.a?.value), vb = Number(ax.b?.value)
  if (!ax.a || !ax.b || !Number.isFinite(va) || !Number.isFinite(vb)) return { outcome: 'cannot-determine', why: 'no exposed value read from the slider around the key' }
  return { outcome: vb > va ? 'pass' : 'fail', why: vb > va ? undefined : 'the time moved, but the slider\'s exposed value did not' }
}

// ---------------------------------------------------------------------------
// The native player: passive.
// Read once the player's metadata has loaded or failed, up to 10 s: Chrome
// loads a headless page's media lazily, and until then it draws fewer
// controls (no mute, volume or full screen before it knows the tracks).
const PLAYER_READ = `(async () => { ${WORDS} const doc = document.documentElement;
  const card = document.querySelector('${CARD}'); const all = [...document.querySelectorAll('video.result-player')];
  const v = card && card.querySelector('video.result-player');
  const savedLine = W('status.saved'); const saveStatus = ((document.getElementById('save-status') || {}).textContent || '').trim();
  const saved = !!savedLine && saveStatus.startsWith(savedLine.split('.')[0]);
  const base = { card: !!card, players: all.length, inCard: !!v, saved, dialogOpen: !!document.querySelector('dialog[open]') };
  if (!v) return base;
  const t0 = performance.now(); for (let i = 0; i < 100 && v.readyState < 1 && !v.error; i++) await new Promise((r) => setTimeout(r, 100)); const waitedMs = Math.round(performance.now() - t0);
  const ps = [...card.querySelectorAll(':scope > p')]; const title = card.querySelector('.notification-title');
  const lifetime = ps.find((p) => p.textContent === W('result.lifetime') || p.textContent === W('result.lifetimeDelivered'));
  const actions = card.querySelector(':scope > .actions');
  const after = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
  const r = v.getBoundingClientRect(); const cap = parseFloat(getComputedStyle(v).maxHeight);
  return { ...base, src: v.getAttribute('src'), blob: (v.getAttribute('src') || '').startsWith('blob:'), controls: v.controls, preload: v.preload, autoplayAttr: v.hasAttribute('autoplay'), autoplay: v.autoplay,
    paused: v.paused, currentTime: v.currentTime, readyState: v.readyState, waitedMs, error: v.error ? v.error.code : null, duration: v.duration,
    labelledBy: v.getAttribute('aria-labelledby'), titleId: title && title.id, title: title ? title.textContent.trim() : null,
    linesBefore: ps.filter((p) => p !== lifetime && !p.hidden).every((p) => after(p, v)), beforeLifetime: lifetime ? after(v, lifetime) : null, beforeActions: after(v, actions),
    host: { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right) }, innerWidth, maxHeight: Number.isFinite(cap) ? cap : null,
    overflowX: doc.scrollWidth > doc.clientWidth, finish: (window.__p8 && window.__p8.events.filter((e) => e.kind === 'finish+1s').at(-1)) || null,
    plays: window.__p8 ? window.__p8.plays.length : null } })()`

/** Rows for the player as the page stands. */
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
  rows.push(row('an object URL whose metadata loads', r.blob && r.error === null && r.readyState >= 1 ? 'pass' : r.blob && r.error !== null ? 'fail' : 'cannot-determine', { blob: r.blob, error: r.error, readyState: r.readyState, waitedMs: r.waitedMs, duration: r.duration, why: r.readyState < 1 && r.error === null ? 'metadata not loaded within 10 s' : undefined }))
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
  if (r.dialogOpen) { rows.push(row('control target', 'not-applicable', { why: 'behind an open modal dialog: not operable' })); return rows }
  // Targets (2.5.5), apart from the host's box (Codex astra's method check,
  // 25 October, M-02): each control's geometry at rest; where its box is
  // empty at rest (the volume slider), its geometry once disclosed, by
  // hovering the other controls as a pointer user would; its hit area by hit
  // test; and 2.5.5's user-agent exception only where no author rule sets
  // its size. The host is scrolled into view for the hit tests, and the
  // scroll and the pointer put back.
  const placed = await w.evaluate(`(() => { const v = document.querySelector(${JSON.stringify(sel)}); const at = { x: scrollX, y: scrollY }; const hov = [...document.querySelectorAll(':hover')].at(-1);
    const h = hov && hov !== document.documentElement && hov !== document.body ? hov.getBoundingClientRect() : null; v.scrollIntoView({ block: 'center', inline: 'nearest' });
    return { at, hover: h ? { x: h.left + h.width / 2 + at.x, y: h.top + h.height / 2 + at.y } : null }; })()`)
  await sleep(150)
  const vp = await viewport(w)
  const hostSizing = await authorRules(w, dom, SIZE_PROPS)
  let moved = false
  const unhover = async (n) => { const v2 = await viewport(w); await w.page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.max(0, Math.round((placed.hover?.x ?? v2.sx) - v2.sx)), y: Math.max(0, Math.round((placed.hover?.y ?? v2.sy) - v2.sy)) }); if (n) await settledBox(w, n.backendDOMNodeId, { nonEmpty: false }); else await sleep(400) }
  for (const n of controls) {
    const label = n.role?.value + ' "' + (n.name?.value ?? '') + '"'
    const rest = await boxOf(w, n.backendDOMNodeId)
    let available = null, disclosedBy
    if (!rest.error && !(rest.w > 0 && rest.h > 0)) {
      // The nearest control first: the volume slider opens from the mute button beside it.
      const near = []
      for (const o of controls) { if (o === n) continue; const ob = await boxOf(w, o.backendDOMNodeId); if (!ob.error && ob.w > 0 && ob.h > 0) near.push({ o, ob, d: Math.hypot(ob.x + ob.w / 2 - rest.x, ob.y + ob.h / 2 - (rest.y + rest.h / 2)) }) }
      for (const { o, ob } of near.sort((a, b) => a.d - b.d)) {
        await w.page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(ob.x + ob.w / 2), y: Math.round(ob.y + ob.h / 2) }); moved = true
        const b = await settledBox(w, n.backendDOMNodeId)
        if (!b.error && b.w > 0 && b.h > 0) { available = b; disclosedBy = 'hovering ' + o.role?.value + ' "' + (o.name?.value ?? '') + '"'; break }
      }
    }
    const g = available ?? rest
    const hit = rest.error || !(g.w > 0 && g.h > 0) ? { unavailable: 'no geometry to test' } : await hitArea(w, g, await subtreeIds(w, n.backendDOMNodeId), vp)
    const sizing = await authorRules(w, n.backendDOMNodeId, SIZE_PROPS)
    const v = targetVerdict({ rest, available, disclosedBy, hit, sizing })
    rows.push(row('control target', v.outcome, { control: label, box: available ? geo(available) : geo(rest), geometry: { rest: geo(rest), available: available ? geo(available) : undefined, disclosedBy }, hitArea: hit,
      uaException: v.uaException, authorSizing: v.authorSizing, hostAuthorSizing: v.uaException && hostSizing.rules?.length ? hostSizing.rules : undefined, why: v.why }))
    if (available) { await unhover(n); moved = false }
  }
  if (moved) await unhover()
  await cssOff(w)
  await w.evaluate(`scrollTo(${placed.at.x}, ${placed.at.y})`)
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
  // A held frame: paused, seeked to a fixed time, muted for the scripted parts (setup, not a key),
  // once the frame data has loaded (up to 10 s), so play and seek have something to move.
  const loaded = await w.evaluate(`(async () => { const v = ${MEDIA(sel)}; for (let i = 0; i < 100 && v.readyState < 2 && !v.error; i++) await new Promise((r) => setTimeout(r, 100)); return { readyState: v.readyState, error: v.error ? v.error.code : null } })()`)
  if (loaded.readyState < 2) rows.push(row('the player\'s frames loaded for the keys', 'cannot-determine', { ...loaded, why: 'no frame data within 10 s: play and seek cannot be proved' }))
  await w.evaluate(`(async () => { const v = ${MEDIA(sel)}; v.muted = true; v.pause(); const at = Math.min(0.5, (v.duration || 1) / 2); if (Math.abs(v.currentTime - at) > 0.01) { v.currentTime = at; await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 3000) }) } })()`)
  const { descendants } = await axSubtree(w, dom)
  const inventory = descendants.filter((n) => !n.ignored && CONTROL_ROLES.has(n.role?.value) && prop(n, 'focusable')).map(axRow)
  // Forward: placed by script on the card before the host (recorded as setup), then keys only.
  const prev = await w.evaluate(TABBABLE_BEFORE(sel))
  const focusPrev = `(() => { const host = ${MEDIA(sel)}; const card = host.closest('.notification') || host; card.focus(); return document.activeElement === card; })()`
  const placed = await w.evaluate(focusPrev)
  const fwd = await playerRoute(w, sel)
  const ahead = compareStops(fwd.stops, inventory)
  rows.push(row('route forward reaches every control', !inventory.length ? 'cannot-determine' : ahead.missing.length ? 'fail' : 'pass', { why: ahead.missing.length ? 'control out of reach: ' + ahead.missing.join(', ') : !inventory.length ? 'no inventory' : undefined, placedOn: placed ? 'the card, by script (setup)' : 'not placed', stops: fwd.stops, foreign: ahead.foreign.length ? ahead.foreign : undefined, left: fwd.left, inventory }))
  rows.push(row('Tab after the last control leaves the player', fwd.left ? 'pass' : 'fail', { left: fwd.left }))
  // Back: from where the forward route left, Shift+Tab through the controls and out; each stop's
  // identity kept and held to the inventory (M-02, 25 October), not only their number.
  if (fwd.left) {
    const back = await playerRoute(w, sel, { shift: true })
    const out = back.left?.active
    const toPrev = !!out && !!prev && out.id === prev.id && out.tag === prev.tag && (prev.value === null || out.value === prev.value)
    const cmp = compareStops(back.stops, inventory)
    rows.push(row('Shift+Tab goes back through the controls', !inventory.length ? 'cannot-determine' : cmp.ok ? 'pass' : 'fail', { why: cmp.missing.length ? 'not reached going back: ' + cmp.missing.join(', ') : cmp.foreign.length ? 'a stop outside the inventory: ' + cmp.foreign.join(', ') : undefined, stops: back.stops, repeats: cmp.repeats || undefined, inventory: inventory.length }))
    rows.push(row('Shift+Tab leaves for the previous real stop, never the card', out && !out.card && toPrev ? 'pass' : out && out.card ? 'fail' : prev ? 'fail' : 'cannot-determine', { left: back.left, expected: prev, why: out?.card ? 'the card, whose tabIndex is -1, took focus' : undefined }))
  }
  // play/pause and seek, apart, by the controls' own keys; each with the control's exposed state read around it (4.1.2).
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
  const exposed = async () => { const { focused } = await axSubtree(w, dom); return focused ? { role: focused.role?.value, name: focused.name?.value ?? '', value: focused.value?.value, valuetext: prop(focused, 'valuetext') } : null }
  const media = () => w.evaluate(`(() => { const v = ${MEDIA(sel)}; return { paused: v.paused, t: Math.round(v.currentTime * 1000) / 1000 } })()`)
  let read412 = false
  const play = await toControl(/^(play|pause)$/i)
  if (!play) rows.push(row('play/pause by keys', 'cannot-determine', { why: 'no play control reached by Tab' }))
  else {
    const a = await media(); const axA = await exposed(); await key(w, 'Space'); await sleep(800); const b = await media(); const axB = await exposed(); await key(w, 'Space'); await sleep(300); const c = await media(); const axC = await exposed()
    rows.push(row('play/pause by keys', a.paused && !b.paused && c.paused && b.t > a.t ? 'pass' : 'fail', { control: play, before: a, afterSpace: b, afterSecondSpace: c }))
    const v = exposedChange('play', { a, b, c }, { a: axA, b: axB, c: axC })
    rows.push(row('play/pause state exposed (4.1.2)', v.outcome, { exposed: [axA, axB, axC], why: v.why })); read412 = true
  }
  const scrub = await toControl(/time|scrubber|seek/i)
  if (!scrub) rows.push(row('seek by keys, apart from play', 'cannot-determine', { why: 'no time slider reached by Tab' }))
  else {
    await w.evaluate(`${MEDIA(sel)}.pause()`)
    const a = await media(); const axA = await exposed(); await key(w, 'ArrowRight'); await sleep(400); const b = await media(); const axB = await exposed()
    rows.push(row('seek by keys, apart from play', a.paused && b.paused && b.t > a.t ? 'pass' : 'fail', { control: scrub, before: a, after: b }))
    const v = exposedChange('seek', { a, b }, { a: axA, b: axB })
    rows.push(row('time slider value exposed (4.1.2)', v.outcome, { exposed: [axA, axB], media: [a.t, b.t], why: v.why })); read412 = true
  }
  if (read412) rows.push(row('notification of these changes (4.1.2)', 'cannot-determine', { why: 'the exposed name and value are read from the tree before and after; whether a change event reaches assistive technology is not observed', unresolved: 'measurement' }))
  // Each stop with playback paused on the held frame, three readings kept apart (M-02, 25 October):
  // 2.4.7, the ring alone, isolated by an author outline:none on the control with focus and any
  // disclosure unchanged; 2.4.13, the area changed at 3:1 focused against unfocused, and short of
  // it each exception's own evidence; 2.4.11 and 2.4.12, author content painted over the control.
  await w.evaluate(`(async () => { const v = ${MEDIA(sel)}; v.pause(); const at = Math.min(0.5, (v.duration || 1) / 2); v.currentTime = at; await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 3000) }) })()`)
  const hostIds = await subtreeIds(w, dom)
  const backdropRules = await authorRules(w, dom, BACKDROP_PROPS)
  const style = async (css, fn) => { await w.evaluate(`(() => { const s = document.createElement('style'); s.id = '__p8-ring-off'; s.textContent = ${JSON.stringify(css)}; document.head.append(s); })()`); await sleep(150); try { return await fn() } finally { await w.evaluate(`document.getElementById('__p8-ring-off')?.remove()`); await sleep(150) } }
  await w.evaluate(focusPrev)
  for (let i = 0; i < inventory.length + 2; i++) {
    await key(w, 'Tab')
    if (!(await w.evaluate(`document.activeElement === ${MEDIA(sel)}`))) break
    const { focused } = await axSubtree(w, dom)
    // Settled first: focus discloses the volume slider by a transition (12 px wide 60 ms after Tab, 52 px once done).
    const b = focused ? await settledBox(w, focused.backendDOMNodeId) : { error: 'no focused node' }
    const label = focused ? focused.role?.value + ' "' + (focused.name?.value ?? '') + '"' : 'unknown'
    const isHost = focused?.backendDOMNodeId === dom
    if (b.error || !(b.w > 0)) { for (const what of ['focus visible (2.4.7)', 'focus appearance (2.4.13)', 'not hidden by author content (2.4.11, 2.4.12)']) rows.push(row(what, 'cannot-determine', { control: label, why: 'no box: ' + (b.error ?? 'empty') })); continue }
    const vp = await viewport(w)
    const m = 6; const x = Math.max(0, b.x - m), y = Math.max(0, b.y - m)
    const clip = { x: x + vp.sx, y: y + vp.sy, width: Math.min(vp.vw - x, b.w + 2 * m), height: Math.min(vp.vh - y, b.h + 2 * m) }
    const cover = await coverage(w, b, isHost ? hostIds : await subtreeIds(w, focused.backendDOMNodeId), hostIds, vp)
    const occ = occlusionVerdict(cover)
    rows.push(row('not hidden by author content (2.4.11, 2.4.12)', occ.outcome, { control: label, host: isHost, coverage: cover, why: occ.why }))
    if (clip.width <= 0 || clip.height <= 0) { for (const what of ['focus visible (2.4.7)', 'focus appearance (2.4.13)']) rows.push(row(what, 'cannot-determine', { control: label, why: 'outside the viewport' })); continue }
    const pseudo = isHost ? null : attrOf(await describe(w, focused.backendDOMNodeId), 'pseudo') ?? null
    const ringOff = isHost ? `${sel} { outline: none !important; box-shadow: none !important; }` : pseudo && /^-webkit-media-controls-/.test(pseudo) ? `${sel}::${pseudo} { outline: none !important; }` : null
    const indicatorRules = await authorRules(w, focused.backendDOMNodeId, isHost ? HOST_RING_PROPS : RING_PROPS)
    const on = await shot(w, clip)
    const ref = ringOff ? await style(ringOff, () => shot(w, clip)) : null
    // Off: the same controls, the same frame, nothing focused (the controls stay drawn while paused).
    await w.evaluate(`document.activeElement && document.activeElement.blur()`)
    await sleep(250)
    const off = await shot(w, clip)
    const px = vp.dpr * vp.dpr
    const d = await analyse(w, DIFF, off, on)
    const ring = ref ? await analyse(w, DIFF, ref, on) : null
    const residual = ref ? await analyse(w, DIFF, off, ref) : null
    const n = (q, k) => (q && !q.error ? Math.round(q[k] / px) : 0)
    const vis = visibleVerdict({ isolated: !!ref && !ring.error && !residual.error, pseudo, ringAny: n(ring, 'changedAny'), ring3: n(ring, 'changed3'), residualAny: n(residual, 'changedAny'), residual3: n(residual, 'changed3'), onOffAny: n(d, 'changedAny') })
    rows.push(row('focus visible (2.4.7)', vis.outcome, { control: label, host: isHost, pseudo: pseudo ?? undefined, ringPx: ring ? { any: n(ring, 'changedAny'), at3to1: n(ring, 'changed3') } : undefined, residualPx: residual ? { any: n(residual, 'changedAny'), at3to1: n(residual, 'changed3') } : undefined, onOffPx: n(d, 'changedAny'), why: vis.why, unresolved: vis.unresolved }))
    // 2.4.13's area is the ring's own pixels (ring: focused with the ring removed against focused), never the whole redraw (re-check, 26 October).
    const ringIsolated = !!ref && !ring.error
    const ringArea3 = ringIsolated ? n(ring, 'changed3') : null, redraw3 = n(d, 'changed3'), perimeter = Math.round(4 * (b.w + b.h) - 16)
    const app = appearanceVerdict({ isHost, ringArea3, perimeter, error: d.error, pseudo, isolated: ringIsolated, ringAny: n(ring, 'changedAny'), indicatorRules, backdropRules })
    const r = row('focus appearance (2.4.13)', app.outcome, { control: label, host: isHost, box: { w: Math.round(b.w), h: Math.round(b.h) }, areaAt3to1: ringArea3, redrawAt3to1: redraw3, perimeter2px: perimeter, bestRatio: d.best, exceptions: app.exceptions, uaException: app.uaException, why: app.why, unresolved: app.unresolved })
    if (run && recKey) { r.clips = [run.artifact(`${recKey}__p8ring-${i}-off.png`, Buffer.from(off, 'base64')), run.artifact(`${recKey}__p8ring-${i}-on.png`, Buffer.from(on, 'base64')), ...(ref ? [run.artifact(`${recKey}__p8ring-${i}-ringoff.png`, Buffer.from(ref, 'base64'))] : [])] }
    rows.push(r)
    // Back to this stop by keys: place on the card and Tab i+1 times.
    await w.evaluate(focusPrev)
    for (let k = 0; k <= i; k++) await key(w, 'Tab')
  }
  // Put back what was there.
  await cssOff(w)
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
// Each heading's rendered lines by qualify.mjs's reader (window.__qual.renderedLines):
// characters counted as the browser paints them, CJK against 40 and Latin
// against 80, a mixed line "cannot determine" where the two readings disagree
// (Codex astra's method check, 25 October, M-01: no width-based estimate).
const FOOTER_READ = `(() => { ${WORDS} const box = document.querySelector('.footer-help'); if (!box) return null; const vis = box.getClientRects().length > 0;
  const Q = window.__qual; const reader = !!(Q && Q.renderedLines);
  const headings = [...box.querySelectorAll('h2, h3, [role=heading]')].map((h) => ({ text: h.textContent.trim().slice(0, 50), lines: reader ? Q.renderedLines(h).map((L) => ({ text: L.text.slice(0, 120), latin: L.latin, cjk: L.cjk, chars: L.chars, outcome: L.outcome })) : null }));
  return { vis, reader, inert: !!box.closest('[inert]') || !!document.querySelector('dialog[open]'), words: Object.fromEntries(${JSON.stringify(FOOTER_ORDER.map((o) => o[2]))}.map((k) => [k, W(k)])), headings }; })()`

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
  const order = seq.length === FOOTER_ORDER.length && FOOTER_ORDER.every(([role, level], i) => seq[i].role === role && (level === null || seq[i].level === level))
  rows.push(row('order and levels: h2, h3 over the two help links, h3 over Report a problem, h3 over the form', order ? 'pass' : 'fail', { seq }))
  rows.push(row('each in the page\'s words', !known ? 'cannot-determine' : seq.length === FOOTER_ORDER.length && FOOTER_ORDER.every(([, , k], i) => seq[i].name === words[k]) ? 'pass' : 'fail', { names: seq.map((s) => s.name), expected: FOOTER_ORDER.map(([, , k]) => words[k]) }))
  const iProblem = seq.findIndex((s) => s.role === 'heading' && s.name === words['footer.groups.problem']), iButton = seq.findIndex((s) => s.role === 'button' && s.name === words['feedback.open']), iOpinion = seq.findIndex((s) => s.role === 'heading' && s.name === words['footer.groups.opinion'])
  rows.push(row('Report a problem in its group', iProblem >= 0 && iButton > iProblem && (iOpinion < 0 || iButton < iOpinion) ? 'pass' : 'fail', { iProblem, iButton, iOpinion }))
  const what = 'measure: each heading under 80 characters a line (40 CJK), counted as rendered'
  if (!r.reader) rows.push(row(what, 'cannot-determine', { why: 'qualify.mjs\'s rendered-line reader is not on the page (QUAL_INIT)' }))
  else {
    const lines = r.headings.flatMap((h) => h.lines.map((L) => ({ heading: h.text, ...L })))
    const worst = lines.find((L) => L.outcome === 'fail') ?? lines.find((L) => L.outcome === 'cannot-determine') ?? null
    const outcome = !lines.length ? 'cannot-determine' : worst ? worst.outcome : 'pass'
    rows.push(row(what, outcome, { headings: r.headings, longest: lines.reduce((m, L) => Math.max(m, L.chars), 0), worst: worst ?? undefined,
      why: !lines.length ? 'no rendered line under the footer\'s headings' : worst?.outcome === 'cannot-determine' ? 'mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-200\'s' : undefined,
      unresolved: worst?.outcome === 'cannot-determine' ? 'interpretation' : undefined }))
  }
  return rows
}

// ---------------------------------------------------------------------------
// The heavy-limiting warning, judged by the bite the job logged.
/**
 * The worker's console from the page's session: each "chain planned" record,
 * whole, on the wall clock; and each "encode complete" record's audio gain
 * (src/media/pipeline.ts logs `audioGainDb: null` when the job had no plan:
 * no audio track, or a kept part too quiet to level, VH-185), the evidence
 * that a job with no plan log had no plan to log (M-01, 25 October).
 */
export async function watchWorkers(browser, w) {
  const seen = (w.p8planned = { planned: [], completed: [], workers: 0 })
  browser.on(w.page.sessionId, 'Target.attachedToTarget', async ({ sessionId, targetInfo }) => {
    // Every auto-attached target waits for the debugger: anything but the job's
    // worker (a media or audio target, a frame) is resumed at once, untouched,
    // or it would hang the page (VH-198's first proof run, a playing player).
    seen.targets = [...(seen.targets ?? []), targetInfo.type]
    if (targetInfo.type !== 'worker') { await browser.send('Runtime.runIfWaitingForDebugger', {}, sessionId).catch(() => {}); return }
    seen.workers++
    browser.on(sessionId, 'Runtime.consoleAPICalled', async (e) => {
      // A fault's prelude says where it fired (faults.mjs F18): kept, by value.
      if (/^fault F\d+/.test(String(e.args?.[0]?.value ?? ''))) { (seen.faults = seen.faults ?? []).push({ t: Date.now(), args: e.args.map((x) => x.value ?? x.description ?? null) }); return }
      const said = e.args?.[1]?.value
      if (said === 'encode complete') {
        const t = Date.now()
        try {
          const r = await browser.send('Runtime.callFunctionOn', { objectId: e.args[2].objectId, functionDeclaration: 'function () { return JSON.stringify({ has: "audioGainDb" in this, audioGainDb: this.audioGainDb }) }', returnByValue: true }, sessionId)
          const v = JSON.parse(r.result.value)
          seen.completed.push(v.has ? { t, audioGainDb: v.audioGainDb ?? null } : { t, unread: true, why: 'no audioGainDb in the record' })
        } catch { seen.completed.push({ t, unread: true }) }
        return
      }
      if (said !== 'chain planned' || !e.args[2]?.objectId) return
      const t = Date.now()
      try {
        const r = await browser.send('Runtime.callFunctionOn', { objectId: e.args[2].objectId, functionDeclaration: 'function () { return JSON.stringify(this) }', returnByValue: true }, sessionId)
        seen.planned.push({ t, ...JSON.parse(r.result.value) })
      } catch { seen.planned.push({ t, unread: true }) }
    })
    // Both sent at once: a paused worker may not answer Runtime.enable until it
    // runs, and awaiting it first could leave the job's worker paused for good.
    await Promise.all([browser.send('Runtime.enable', {}, sessionId).catch(() => {}), browser.send('Runtime.runIfWaitingForDebugger', {}, sessionId).catch(() => {})])
  })
  await w.page.send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true })
  return seen
}

/**
 * The line spoken at completion: the completion's own write to the status
 * line, bound to the mutation that drew the finished card, never to a time
 * window (Codex astra's method check, 25 October, M-01, and its re-check,
 * 26 October). The app writes the line in the same task as it draws the card
 * and hides the progress in the job's `finally`, a microtask later
 * (src/main.ts, the job's `.then` and `.finally`), so the completion's write
 * is the write recorded in the same mutation batch as the new card
 * (`cardNew`), inside this job (its start to its "finish" tick), and it opens
 * with the page's "status.ready". A job whose card was drawn with no such
 * write has no completion write: `texts` is empty and `why` says so. `earlier`
 * holds the job's other writes, as evidence, never as the completion.
 */
export async function spokenAtCompletion(w) {
  return w.evaluate(`(() => { ${WORDS} const P = window.__p8; if (!P) return null; const fin = P.events.filter((e) => e.kind === 'finish').at(-1); if (!fin) return null;
    const start = P.events.filter((e) => e.kind === 'start' && e.t <= fin.t).at(-1); const from = start ? start.t : null;
    const ready = W('status.ready');
    const writes = (P.writes || []).filter((s) => (from === null || s.t >= from) && s.t <= fin.t);
    const c = writes.filter((s) => s.cardNew).at(-1) || null;
    const opens = !!c && !!ready && c.text.startsWith(ready);
    return { from, to: fin.t, finish: fin.t, ready: ready ?? null, completion: c ? { ...c, opensWithReady: opens } : null, texts: opens ? [c.text] : [],
      earlier: writes.filter((s) => s !== c).map((s) => ({ t: s.t, text: s.text.slice(0, 160), cardNew: !!s.cardNew })).slice(-3),
      why: !start ? 'the job\\'s start was not watched' : !c ? 'no write to the status line in the mutation that drew the finished card' : !opens ? 'the write in the mutation that drew the card does not open with the page\\'s "status.ready"' : undefined }; })()`)
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

/**
 * The bite this job logged, or why there is none (Codex astra's method check,
 * 25 October, M-01), from the worker's records inside the job (its start to
 * its finish): (a) a plan logged with `limiterBiteLu` null, a measured null
 * bite; (b) no plan, established by the job's "encode complete" record with
 * `audioGainDb` null; (c) anything else (no record in this job, a record that
 * could not be read, a plan without the field, a planned job whose plan log
 * was not seen) is missing evidence: "cannot determine", never a null bite.
 */
export function biteEvidence(seen, { start, fin } = {}) {
  if (!fin) return { why: 'the job that made this card finished before the page was watched' }
  if (!start) return { why: 'the job\'s start was not watched, so its records cannot be told from an earlier job\'s' }
  if (!seen) return { why: 'the worker was not watched' }
  const inJob = (p) => p.t >= start.t - 50 && p.t <= fin.t + 50
  const plan = seen.planned.filter(inJob).at(-1), done = (seen.completed ?? []).filter(inJob).at(-1)
  if (plan?.unread) return { why: 'the job\'s "chain planned" record could not be read' }
  if (plan && !('limiterBiteLu' in plan)) return { why: 'the job\'s "chain planned" record has no limiterBiteLu' }
  if (plan) return { bite: plan.limiterBiteLu, evidence: plan.limiterBiteLu === null ? 'a logged null bite ("chain planned", limiterBiteLu null)' : 'the logged bite ("chain planned")' }
  if (done?.unread) return { why: 'the job\'s "encode complete" record could not be read, and no plan was logged' }
  if (done && done.audioGainDb === null) return { bite: null, evidence: 'no plan: "encode complete" logged audioGainDb null (no audio, or a kept part too quiet to level), so the job had no bite' }
  if (done) return { why: 'the job planned its sound ("encode complete" logged an audio gain), but its "chain planned" record was not seen' }
  if (!seen.workers) return { why: 'no worker attached, so no bite was read' }
  return { why: 'no "chain planned" or "encode complete" record inside this job: the bite is missing, not null' }
}

export async function limitingRows(w) {
  const r = await w.evaluate(LIMIT_READ)
  if (!r.card) return [row('heavy-limiting warning', 'not-applicable', { why: 'no finished card on the page' })]
  const rows = []
  const { bite, evidence, why } = biteEvidence(w.p8planned, r)
  const expectHeavy = bite !== null && bite !== undefined && bite > HEAVY_LIMITING_LU
  const near = typeof bite === 'number' && Math.abs(bite - HEAVY_LIMITING_LU) < 0.02
  if (why) rows.push(row('present above the threshold, absent below', 'cannot-determine', { why, hasHeavy: r.hasHeavy }))
  else rows.push(row('present above the threshold, absent below', near ? 'cannot-determine' : r.hasHeavy === expectHeavy ? 'pass' : 'fail', { bite, evidence, threshold: HEAVY_LIMITING_LU, hasHeavy: r.hasHeavy, why: near ? 'the logged bite is rounded and sits on the threshold' : undefined }))
  if (!r.hasHeavy) return rows
  rows.push(row('heading and detail word for word', r.hasDetail ? 'pass' : 'fail'))
  rows.push(row('first among the card\'s warnings', r.heavyIndex === 0 ? 'pass' : 'fail', { titles: r.titles }))
  // The completion's own write, holding every title on the card, the heavy one first, then the others in the card's order.
  const spoken = await spokenAtCompletion(w)
  const what = 'first in the line spoken at completion, with every warning title in order'
  if (!spoken) rows.push(row(what, 'cannot-determine', { why: 'no completion was watched on this page' }))
  else if (r.lang !== r.fin.lang) rows.push(row(what, 'cannot-determine', { why: 'the page language changed since the completion: the titles on the card are in another language now', completion: spoken.completion }))
  else if (!spoken.from) rows.push(row(what, 'cannot-determine', { why: spoken.why, completion: spoken.completion }))
  else {
    // Only the write bound to the card's mutation counts; none is a fail, as the app always makes it (re-check, 26 October).
    const said = spoken.texts[0] ?? null
    const expected = [r.heavy, ...r.titles.filter((t) => t !== r.heavy)]
    const at = expected.map((t) => (said ? said.indexOf(t) : -1))
    const missing = expected.filter((t, i) => at[i] < 0)
    const inOrder = at.every((x, i) => i === 0 || x > at[i - 1])
    rows.push(row(what, said && !missing.length && inOrder ? 'pass' : 'fail', { completion: spoken.completion, job: [spoken.from, spoken.to], expected, earlier: spoken.earlier,
      why: !said ? spoken.why : missing.length ? 'missing from the completion\'s line: ' + missing.join('; ') : !inOrder ? 'the titles are not in order, the heavy one first' : undefined }))
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
      // Awaited: an assertion may wait for the page (a player's metadata), and a promise is never truthy by itself.
      const v = await w.evaluate(`(async () => { const M = window.__mx; try { const v = await (${a.expr}); return { ok: !!v, v: v && typeof v === 'object' ? v : undefined }; } catch (e) { return { error: String(e.message || e).slice(0, 160) }; } })()`)
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
// The rows a scenario that opts in must hold (Codex astra's re-check, 26 October, M-01; matrix.mjs `expectsFor`):
// the player by keys, with a player on the page, and the format "?" where it can be reached.
export const PLAYER_KEY_ROWS = ['route forward reaches every control', 'Tab after the last control leaves the player', 'play/pause by keys', 'seek by keys, apart from play', 'focus visible (2.4.7)', 'focus appearance (2.4.13)', 'not hidden by author content (2.4.11, 2.4.12)']
export const FORMAT_TIP_ROWS = ['named, and its text, in the page\'s words', 'the "?" at least 44 x 44', 'Enter opens it; focus stays on the "?"', 'edge: 1 px all round in --border-subtle, not a rail', 'gap: under the "?", inside its item and the page', 'Tab closes it; focus goes where it goes with it closed', 'Shift+Tab closes it; focus goes where it goes with it closed', 'Space opens it; Escape closes it, focus on the "?"', 'a click on its text keeps it open; Escape then closes it, focus on the "?"', 'a click elsewhere closes it']
