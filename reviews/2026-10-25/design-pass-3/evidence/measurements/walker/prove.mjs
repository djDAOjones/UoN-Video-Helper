// PLAN-7 (VH-171): each instrument proved to catch its own failure before
// it is trusted. Temporary failing fixtures and their passing twins are
// written to a scratch directory, never to src/; each instrument must fail
// the one and pass the other. The runner's own checks are proved the same
// way, on a run with a missing, a duplicate, a stale, an undeclared and a
// failed record, and (Codex astra's method check, M-01) an empty
// measurement, a wrong view, a missing instrument, an expired state and a
// missing variant; a capture is never overwritten (M-08). Codex astra's
// method check of 25 October, M-01: a route given no steps is not a pass,
// and the runner rejects a bare pass, a route passing on `steps: []`, a route
// short of its steps or with no count given, a missing expected subject and
// a pass over a counted failing row, each beside a passing twin.
//
//   PROVE_DIR=<scratch>/prove OUT_ROOT=<scratch>/out node prove.mjs   (headless Chrome on :9222)
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { connectBrowser } from './cdp.mjs'
import { Walk } from './walk.mjs'
import { QUAL_INIT, IN_DIALOG, IN_DIALOG_OR_OUT, axTree, focusArea, fileButtonInk, keysRoute, closeAnalysis, withholdFonts, pressedAppearance, motionWatch } from './qualify.mjs'
import { Run, aggregate, recordKey } from './runner.mjs'
import { Buffer } from 'node:buffer'

const DIR = process.env.PROVE_DIR
if (!DIR) throw new Error('set PROVE_DIR to a scratch directory')
mkdirSync(DIR, { recursive: true })

const page = (body, style = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>fixture</title><style>body{font:16px/1.5 sans-serif;background:#fff;color:#161616;margin:24px}${style}</style></head><body><main>${body}</main></body></html>`
const FILE_CSS = '#f{display:block;width:100%;min-height:44px;padding:0;border:0;font:inherit}#f:focus{outline:none}#f::file-selector-button{min-height:44px;padding:8px 24px;border:1px solid transparent;background:#0043ce;color:#fff;font:inherit}'
const RANGE_HTML = '<div style="position:relative;height:44px;width:600px;background:#fff"><input id="r" type="range" min="0" max="60" value="30" aria-label="Start"></div>'
const RANGE_CSS = '#r{position:absolute;inset:0;width:100%;height:100%;margin:0;background:transparent;appearance:none;pointer-events:none}#r:focus{outline:none}#r::-webkit-slider-runnable-track{height:100%;background:transparent}#r::-webkit-slider-thumb{width:44px;height:44px;border:0;border-radius:50%;background:radial-gradient(circle,#0043ce 0 14px,transparent 15px);appearance:none;pointer-events:auto}'
const FILE_RING = '#f:focus-visible::file-selector-button{outline:2px solid #0f62fe;outline-offset:2px}'
const MOTION_HTML = '<button id="b" onclick="document.getElementById(\'box\').classList.add(\'go\')">Go</button><div id="box"></div>'
const MOTION_CSS = '@keyframes slide{from{transform:translateX(0)}to{transform:translateX(200px)}}#box{width:40px;height:40px;background:#0043ce}#box.go{animation:slide 2s linear}'
const PRESS_CSS = 'button{font:inherit;padding:12px 16px;border:1px solid #161616;background:#fff;color:#161616}button:focus-visible{outline:2px solid #0f62fe;outline-offset:2px}'
const ASYNC_HTML = '<label for="t">Title</label> <input id="t" type="text"> <button id="go">Save</button><p id="st" role="status"></p><h2 id="done" tabindex="-1">Done</h2>'
const FIXTURES = {
  'overflow-bad': page('<p>Text</p><div style="width:2000px;height:20px;background:#ddd">a row wider than the page</div>'),
  'overflow-good': page('<p>Text</p><div style="max-width:100%;height:20px;background:#ddd">a row inside the page</div>'),
  'focus-bad': page('<button id="b">Continue</button>', 'button{font:inherit;padding:12px 16px;border:1px solid #161616;background:#fff}button:focus{outline:none}button:focus-visible{outline:1px dotted #8d8d8d;outline-offset:0}'),
  'focus-good': page('<button id="b">Continue</button>', 'button{font:inherit;padding:12px 16px;border:1px solid #161616;background:#fff}button:focus{outline:none}button:focus-visible{outline:2px solid #0f62fe;outline-offset:2px}'),
  'name-bad': page('<button id="b"><svg aria-hidden="true" width="20" height="20"><path d="M2 2h16v16H2z" fill="#161616"/></svg></button> <input id="t" type="text">'),
  'name-good': page('<button id="b" aria-label="Close"><svg aria-hidden="true" width="20" height="20"><path d="M2 2h16v16H2z" fill="#161616"/></svg></button> <label for="t">Title</label> <input id="t" type="text">'),
  'target-bad': page('<button id="b" style="width:20px;height:20px;padding:0">x</button>'),
  'target-good': page('<button id="b" style="min-width:48px;min-height:48px">Go</button>'),
  'placeholder-bad': page('<label for="t">Title</label><input id="t" placeholder="For example, Week 3" style="color:#161616">', 'input::placeholder{color:#c6c6c6}'),
  'placeholder-good': page('<label for="t">Title</label><input id="t" placeholder="For example, Week 3" style="color:#161616">', 'input::placeholder{color:#525252}'),
  'modal-bad': page('<button id="open">Open</button><div role="dialog" aria-modal="true" aria-label="Feedback" id="d"><button>Close</button></div>'),
  'modal-good': page('<button id="open">Open</button><dialog id="d" aria-label="Feedback"><button>Close</button></dialog><script>document.getElementById("d").showModal()</script>'),
  'focus-scrolled-bad': page('<div style="height:2400px"></div><button id="b">Continue</button><div style="height:600px"></div>', 'button{font:inherit;padding:12px 16px;border:1px solid #161616;background:#fff}button:focus{outline:none}button:focus-visible{outline:1px dotted #8d8d8d;outline-offset:0}'),
  'focus-scrolled-good': page('<div style="height:2400px"></div><button id="b">Continue</button><div style="height:600px"></div>', 'button{font:inherit;padding:12px 16px;border:1px solid #161616;background:#fff}button:focus{outline:none}button:focus-visible{outline:2px solid #0f62fe;outline-offset:2px}'),
  'lines-bad': page('<p style="max-width:none">' + 'This sentence is long enough that one rendered line of it runs well past eighty characters on a wide page. '.repeat(3) + '</p><p lang="zh-Hans" style="max-width:none">' + '这是一个很长的中文句子，用来检查每行的字数是否超过四十个汉字的限制。'.repeat(4) + '</p>'),
  'lines-good': page('<p style="max-width:28rem">' + 'This sentence is long enough that one rendered line of it runs well past eighty characters on a wide page. '.repeat(3) + '</p><p lang="zh-Hans" style="max-width:28rem">' + '这是一个很长的中文句子，用来检查每行的字数是否超过四十个汉字的限制。'.repeat(4) + '</p><p class="visually-hidden" style="position:absolute;width:1px;height:1px;overflow:hidden;white-space:nowrap">' + 'Hidden status text that must not count. '.repeat(6) + '</p>'),
  // VH-171's instrument questions, each proved: a ring on the file chooser's
  // button and on a range thumb measured against the sub-component, the
  // button's text read by pixels, a thumb's target, and the dialog route.
  'file-focus-bad': page('<input id="f" type="file">', FILE_CSS + '#f:focus-visible::file-selector-button{outline:1px dotted #8d8d8d;outline-offset:0}'),
  'file-focus-good': page('<input id="f" type="file">', FILE_CSS + '#f{padding:4px}#f:focus-visible::file-selector-button{outline:2px solid #0f62fe;outline-offset:2px}'),
  'file-ink-bad': page('<input id="f" type="file">', FILE_CSS.replace('background:#0043ce;color:#fff', 'background:#e0e0e0;color:#8d8d8d')),
  'file-ink-good': page('<input id="f" type="file">', FILE_CSS),
  'thumb-focus-bad': page(RANGE_HTML, RANGE_CSS + 'input:focus-visible::-webkit-slider-thumb{outline:1px dotted #c6c6c6;outline-offset:-1px}'),
  'thumb-focus-good': page(RANGE_HTML, RANGE_CSS + 'input:focus-visible::-webkit-slider-thumb{outline:3px solid #0f62fe;outline-offset:-3px}'),
  'thumb-target-bad': page(RANGE_HTML, RANGE_CSS.replace(/width:44px;height:44px/, 'width:20px;height:20px')),
  'thumb-target-good': page(RANGE_HTML, RANGE_CSS.replace('border-radius:50%', 'border-radius:0')),
  'thumb-target-disc': page(RANGE_HTML, RANGE_CSS),
  'dialog-keys-bad': page('<button id="behind">Behind</button><dialog id="d" aria-label="Feedback"><textarea id="feedback-message"></textarea><button id="feedback-close">Close</button></dialog><script>document.getElementById("d").show()</script>'),
  'dialog-keys-good': page('<button id="behind">Behind</button><dialog id="d" aria-label="Feedback"><textarea id="feedback-message"></textarea><button id="feedback-close">Close</button></dialog><script>document.getElementById("d").showModal()</script>'),
  'keys-bad': page('<button id="a">First</button><div id="go" onclick="1">Go</div>'),
  'keys-good': page('<button id="a">First</button><button id="go">Go</button>'),
  // Pilot 2's three instrument faults, each proved: a thumb found at a taller
  // input (the 32 px font), the file button exempt behind a modal dialog, and
  // the brand faces withheld by type while a script named like a font loads.
  'thumb-target-tall-bad': page(RANGE_HTML.replace('height:44px', 'height:88px'), RANGE_CSS.replace(/width:44px;height:44px/, 'width:20px;height:20px')),
  'thumb-target-tall-good': page(RANGE_HTML.replace('height:44px', 'height:88px'), RANGE_CSS.replace('border-radius:50%', 'border-radius:0')),
  'file-ink-inert': page('<input id="f" type="file"><dialog id="d" aria-label="Feedback"><button>Close</button></dialog><script>document.getElementById("d").showModal()</script>', FILE_CSS),
  'fonts': page('<p style="font:40px F, monospace">Text</p><script src="face.woff2.js"></script>', '@font-face{font-family:F;src:url(face.woff2) format("woff2")}'),
  // Codex astra's method check (23 October), each point proved.
  // M-02: the file button's text by glyph pixels, beside a contrasting border;
  // ordinary text with unrounded ratios and the large-text threshold; paint
  // the computed reader cannot see; every shape of a graphic; a range's paint.
  'file-ink-border-bad': page('<input id="f" type="file">', FILE_CSS.replace('border:1px solid transparent;background:#0043ce;color:#fff', 'border:2px solid #000;background:#fff;color:rgb(180,180,180)')),
  'file-ink-border-good': page('<input id="f" type="file">', FILE_CSS.replace('border:1px solid transparent;background:#0043ce;color:#fff', 'border:2px solid #000;background:#fff;color:#161616')),
  'contrast-text-bad': page('<p style="color:rgb(81,91,92)">Nearly seven to one, which rounds up to it.</p><p style="color:#767676;font-size:23px">Grey at 23 px, under the large size.</p>'),
  'contrast-text-good': page('<p style="color:#161616">Dark text, well over seven to one.</p><p style="color:#767676;font-size:24px">Grey at 24 px: large, 4.5 to 1.</p>'),
  'contrast-text-unknown': page('<p style="background-image:linear-gradient(#fff,#e0e0e0)">Text on a gradient.</p><div style="opacity:.6"><p>Text under an ancestor at 60% opacity.</p></div>'),
  'svg-bad': page('<svg role="img" aria-label="Chart" width="60" height="30"><rect x="0" y="0" width="28" height="30" fill="#161616"/><circle cx="45" cy="15" r="12" fill="#d0d0d0"/></svg>'),
  'svg-good': page('<svg role="img" aria-label="Chart" width="60" height="30"><rect x="0" y="0" width="28" height="30" fill="#161616"/><circle cx="45" cy="15" r="12" fill="#161616"/></svg>'),
  // M-03: rendered spaces counted, near the limit; mixed scripts; a textarea's value.
  'lines-latin-81': page('<p style="white-space:nowrap;max-width:none">' + Array(41).fill('a').join(' ') + '</p>'),
  'lines-latin-79': page('<p style="white-space:nowrap;max-width:none">' + Array(40).fill('a').join(' ') + '</p>'),
  'lines-mixed-bad': page('<p lang="zh-Hans" style="white-space:nowrap">' + '汉'.repeat(30) + 'a b c d e f g h i j k</p>'),
  'lines-mixed-good': page('<p lang="zh-Hans" style="white-space:nowrap">' + '汉'.repeat(20) + 'abc de fghi jk lmnop</p>'),
  'textarea-bad': page('<label for="t">Message</label><textarea id="t" rows="4" style="display:block;width:900px;font:inherit"></textarea><script>document.getElementById("t").value = ' + JSON.stringify('This sentence is long enough that one rendered line of it runs well past eighty characters on a wide page. '.repeat(3)) + '</script>'),
  'textarea-good': page('<label for="t">Message</label><textarea id="t" rows="8" style="display:block;width:28rem;font:inherit"></textarea><script>document.getElementById("t").value = ' + JSON.stringify('This sentence is long enough that one rendered line of it runs well past eighty characters on a wide page. '.repeat(3)) + '</script>'),
  // M-04: content lost without widening the document.
  'clip-bad': page('<div style="width:300px;height:24px;overflow:hidden">' + 'This text runs onto several lines in a box held one line high, so most of it is cut. '.repeat(2) + '</div>'),
  'spill-bad': page('<div style="width:200px;height:24px;border:1px solid #161616">This text spills out of a box held one line high and overlaps what follows.</div><p>What follows.</p>'),
  'clip-good': page('<div style="width:300px;overflow:hidden">' + 'This text runs onto several lines in a box held one line high, so most of it is cut. '.repeat(2) + '</div>'),
  // M-05: movement under reduced motion, triggered; colour only; essential; a held key; an asynchronous keys route; live exposure.
  'motion-bad': page(MOTION_HTML, MOTION_CSS),
  'motion-good': page(MOTION_HTML, MOTION_CSS + '@media (prefers-reduced-motion: reduce){#box.go{animation:none}}'),
  'motion-colour': page(MOTION_HTML, '#box{width:40px;height:40px;background:#0043ce;transition:background-color 1s linear}#box.go{background-color:#da1e28}'),
  'motion-essential': page('<button id="b" onclick="document.getElementById(\'box\').style.width=\'80%\'">Go</button><div role="progressbar" aria-label="Progress" aria-valuenow="10" style="width:300px;background:#e0e0e0"><div id="box" style="height:8px;width:10%;background:#0043ce;transition:width 1s linear"></div></div>'),
  'pressed-bad': page('<button id="b">Save</button>', PRESS_CSS),
  'pressed-good': page('<button id="b">Save</button>', PRESS_CSS + 'button:active{background:#0043ce;color:#fff}'),
  'keys-async-bad': page(ASYNC_HTML + '<script>document.getElementById("go").onclick = () => { document.getElementById("go").hidden = true; setTimeout(() => { document.getElementById("st").textContent = "Saved " + document.getElementById("t").value; }, 300); };</script>'),
  'keys-async-good': page(ASYNC_HTML + '<script>document.getElementById("go").onclick = () => { document.getElementById("go").hidden = true; setTimeout(() => { document.getElementById("st").textContent = "Saved " + document.getElementById("t").value; document.getElementById("done").focus(); }, 300); };</script>'),
  'live-bad': page('<p id="st"></p><script>setTimeout(() => { document.getElementById("st").textContent = "Upload ready"; }, 150)</script>'),
  'live-good': page('<p id="st" role="status"></p><script>setTimeout(() => { document.getElementById("st").textContent = "Upload ready"; }, 150)</script>'),
  // M-07: an identical 2 px ring on the file button, without and with room inside the input.
  'file-focus-clipped': page('<input id="f" type="file">', FILE_CSS + FILE_RING),
  'file-focus-room': page('<input id="f" type="file">', FILE_CSS + '#f{padding:4px}' + FILE_RING),
}
for (const [name, html] of Object.entries(FIXTURES)) writeFileSync(join(DIR, name + '.html'), html)
copyFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../src/assets/lora-bold.woff2'), join(DIR, 'face.woff2'))
writeFileSync(join(DIR, 'face.woff2.js'), 'window.booted = true')

const browser = await connectBrowser()
const results = []
const expect = (instrument, fixture, outcome, wanted, detail) => results.push({ instrument, fixture, outcome, wanted, proved: outcome === wanted, detail })

async function on(name, fn, before = async () => undefined) {
  const w = new Walk(browser, 'prove-' + name)
  await w.open()
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
  await before(w)
  const loaded = w.page.once('Page.loadEventFired')
  await w.page.send('Page.navigate', { url: pathToFileURL(join(DIR, name + '.html')).href })
  await loaded
  await new Promise((r) => setTimeout(r, 300))
  try { return await fn(w) } finally { await w.close() }
}

for (const v of ['bad', 'good']) {
  const want = v === 'bad' ? 'fail' : 'pass'
  await on('overflow-' + v, async (w) => { const o = await w.evaluate('window.__qual.overflow()'); expect('overflow', 'overflow-' + v, o.outcome, want, { scrollWidth: o.scrollWidth, clientWidth: o.clientWidth }) })
  await on('focus-' + v, async (w) => { const f = await focusArea(w, '#b'); expect('rendered focus', 'focus-' + v, f.outcome, want, { areaAt3to1: f.areaAt3to1, perimeter2px: f.perimeter2px, bestRatio: f.bestRatio }); writeFileSync(join(DIR, `focus-${v}-on.png`), f.on); writeFileSync(join(DIR, `focus-${v}-off.png`), f.off) })
  await on('focus-scrolled-' + v, async (w) => { const f = await focusArea(w, '#b'); expect('rendered focus, scrolled', 'focus-scrolled-' + v, f.outcome, want, { areaAt3to1: f.areaAt3to1, perimeter2px: f.perimeter2px, bestRatio: f.bestRatio }) })
  await on('lines-' + v, async (w) => { const l = await w.evaluate('window.__qual.lines()'); expect('rendered lines', 'lines-' + v, l.some((x) => x.outcome === 'fail') ? 'fail' : 'pass', want, l.map((x) => ({ lang: x.lang, worst: x.worst }))) })
  await on('name-' + v, async (w) => { const a = await axTree(w); expect('accessibility tree: names', 'name-' + v, a.outcome, want, a.problems) })
  await on('target-' + v, async (w) => { const t = await w.evaluate('window.__qual.targets()'); const b = t.find((x) => x.el.startsWith('button')); expect('target area', 'target-' + v, b.outcome, want, b) })
  await on('placeholder-' + v, async (w) => { const c = await w.evaluate('window.__qual.contrastExtra()'); const p = c.find((x) => x.what === 'placeholder'); expect('contrast beyond text', 'placeholder-' + v, p.outcome, want, p) })
  await on('modal-' + v, async (w) => { const a = await axTree(w); expect('accessibility tree: modal background', 'modal-' + v, a.outcome, want, a.problems) })
  await on('file-focus-' + v, async (w) => { const f = await focusArea(w, '#f', { ref: 'file-button' }); expect('rendered focus, file button', 'file-focus-' + v, f.outcome, want, { areaAt3to1: f.areaAt3to1, perimeter2px: f.perimeter2px, paintedPx: f.paintedPx, controlPx: f.controlPx }) })
  await on('file-ink-' + v, async (w) => { const c = await fileButtonInk(w, '#f'); expect('file button text by pixels', 'file-ink-' + v, c.outcome, want, { ratio: c.ratio, fill: c.fill, ink: c.ink, buttonPx: c.buttonPx }) })
  await on('thumb-focus-' + v, async (w) => { const f = await focusArea(w, '#r', { ref: 'thumb' }); expect('rendered focus, range thumb', 'thumb-focus-' + v, f.outcome, want, { areaAt3to1: f.areaAt3to1, readings: f.readings, paintedPx: f.paintedPx, why: f.why }) })
  await on('thumb-target-' + v, async (w) => { const t = await w.evaluate('window.__qual.targets()'); const b = t.find((x) => x.thumb); expect('target area, range thumb', 'thumb-target-' + v, b.outcome, want, b) })
  if (v === 'good') await on('thumb-target-disc', async (w) => { const t = await w.evaluate('window.__qual.targets()'); const b = t.find((x) => x.thumb); expect('target area, a 44 px disc', 'thumb-target-disc', b.outcome, 'cannot-determine', b) })
  await on('dialog-keys-' + v, async (w) => { await w.evaluate('document.getElementById("feedback-message").focus()'); const k = await keysRoute(w, [...Array.from({ length: 4 }, () => ({ key: 'Tab', state: IN_DIALOG_OR_OUT, noFocusRing: true })), { key: 'Tab', until: 'feedback-', repeat: 4, state: IN_DIALOG, noFocusRing: true }]); expect('keys-only route, modal dialog', 'dialog-keys-' + v, k.outcome, want, k.steps.map((s) => s.to)) })
  await on('keys-' + v, async (w) => { const k = await keysRoute(w, [{ key: 'Tab', expect: '#a' }, { key: 'Tab', expect: '#go' }]); expect('keys-only route', 'keys-' + v, k.outcome, want, k.steps.map((s) => s.to)) })
}
for (const v of ['bad', 'good']) {
  const want = v === 'bad' ? 'fail' : 'pass'
  await on('thumb-target-tall-' + v, async (w) => { const t = await w.evaluate('window.__qual.targets()'); const b = t.find((x) => x.thumb); expect('target area, range thumb, tall input', 'thumb-target-tall-' + v, b.outcome, want, b) })
  // Fails when a face loaded (not withheld) or the font-named script did not run.
  await on('fonts', async (w) => { const f = await w.evaluate('document.fonts.ready.then(() => ({ booted: !!window.booted, faces: [...document.fonts].map((x) => x.status) }))'); expect('fallback faces withheld', 'fonts-' + (v === 'bad' ? 'not-withheld' : 'withheld'), f.booted && f.faces.length && f.faces.every((s) => s === 'error') ? 'pass' : 'fail', want, { ...f, failed: w.fontsFailed }) }, (w) => withholdFonts(w, v === 'good'))
}
await on('file-ink-inert', async (w) => { const c = await fileButtonInk(w, '#f'); expect('file button text by pixels, behind a modal', 'file-ink-inert', c.outcome, 'inert', c) })
// Codex astra's method check (25 October), M-01: a route given no steps walked nothing, never a pass.
let emptyRoute = null
await on('keys-good', async (w) => { emptyRoute = await keysRoute(w, []); expect('keys-only route, given no steps', 'empty-route', emptyRoute.outcome, 'cannot-determine', emptyRoute) })

// Codex astra's method check (23 October): M-02 to M-05 and M-07, each proved.
const linesOf = (l) => l.map((x) => ({ kind: x.kind, house: x.house.within, worst: x.worst }))
const reduced = (w) => w.page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
for (const v of ['bad', 'good']) {
  const want = v === 'bad' ? 'fail' : 'pass'
  await on('file-ink-border-' + v, async (w) => { const c = await fileButtonInk(w, '#f'); expect('file button text by glyph pixels, contrasting border', 'file-ink-border-' + v, c.outcome, want, { ratio: c.ratio, fill: c.fill, ink: c.ink, glyphPx: c.glyphPx, why: c.why }) })
  await on('contrast-text-' + v, async (w) => { const a = aggregate(await w.evaluate('window.__qual.contrastText()')); expect('text contrast (computed, unrounded, large text)', 'contrast-text-' + v, a.outcome, want, a.items.map((i) => ({ text: i.text, ratio: i.ratio, need: i.need, outcome: i.outcome }))) })
  await on('svg-' + v, async (w) => { const a = aggregate((await w.evaluate('window.__qual.contrastExtra()')).filter((c) => /^graphic/.test(c.what))); expect('graphic contrast, every shape', 'svg-' + v, a.outcome, want, a.items.map((i) => ({ what: i.what, ratio: i.ratio }))) })
  await on('lines-latin-' + (v === 'bad' ? 81 : 79), async (w) => { const l = await w.evaluate('window.__qual.lines()'); expect('rendered lines, spaces counted', 'lines-latin-' + (v === 'bad' ? 81 : 79), aggregate(l).outcome, want, linesOf(l)) })
  await on('lines-mixed-' + v, async (w) => { const l = await w.evaluate('window.__qual.lines()'); expect('rendered lines, mixed scripts', 'lines-mixed-' + v, aggregate(l).outcome, want, linesOf(l)) })
  await on('textarea-' + v, async (w) => { const l = await w.evaluate('window.__qual.lines()'); expect('rendered lines, a textarea\'s value', 'textarea-' + v, aggregate(l).outcome, want, linesOf(l)) })
  await on(v === 'bad' ? 'clip-bad' : 'clip-good', async (w) => { const o = await w.evaluate('window.__qual.overflow()'); expect('overflow: text clipped inside the page', v === 'bad' ? 'clip-bad' : 'clip-good', o.outcome, want, { hscroll: o.hscroll, clipped: o.clipped, spills: o.spills }) })
  await on('motion-' + v, async (w) => { const rows = await motionWatch(w, () => w.evaluate('document.getElementById("b").click()')); expect('motion under reduced motion, triggered', 'motion-' + v, aggregate([...rows, { what: 'watch', outcome: rows.some((r) => r.outcome === 'fail') ? 'fail' : 'pass' }]).outcome, want, rows) }, reduced)
  await on('pressed-' + v, async (w) => { const p = await pressedAppearance(w, '#b'); expect('pressed appearance, key held', 'pressed-' + v, p.outcome, want, { active: p.active, changedAny: p.changedAny, changedAt3to1: p.changedAt3to1 }) })
  await on('keys-async-' + v, async (w) => { const k = await keysRoute(w, [{ key: 'Tab', expect: '#t' }, { type: 'Week 3', expect: '#t', value: '^Week 3$' }, { key: 'Tab', expect: '#go' }, { key: 'Enter', wait: 700, expect: '#done', noFocusRing: true, state: `/Saved Week 3/.test(document.getElementById('st').textContent) && document.getElementById('t').value === 'Week 3'` }]); expect('keys-only route, text entry and a disappearing control', 'keys-async-' + v, k.outcome, want, k.steps.map((s) => ({ key: s.key, to: s.to, value: s.after.focused.value, status: s.after.status.map((x) => x.text).join(' | '), outcome: s.outcome }))) })
  await on('live-' + v, async (w) => { await new Promise((r) => setTimeout(r, 300)); const m = await w.evaluate('window.__qual.mutations(0)'); const a = await axTree(w); const logged = m.entries.some((e) => e.kind === 'live-text' && /Upload ready/.test(e.text)); const exposed = a.live.some((x) => /Upload ready/.test(x.text)); expect('live-region exposure: DOM log and AX text', 'live-' + v, logged && exposed ? 'pass' : 'fail', want, { logged, exposed, live: a.live, entries: m.entries.filter((e) => e.kind !== 'nodes').slice(0, 6) }) })
  await on(v === 'bad' ? 'file-focus-clipped' : 'file-focus-room', async (w) => { const f = await focusArea(w, '#f', { ref: 'file-button' }); expect('rendered focus, file button: only the clipping room differs', v === 'bad' ? 'file-focus-clipped' : 'file-focus-room', f.outcome, want, { areaAt3to1: f.areaAt3to1, perimeter2px: f.perimeter2px, paintedPx: f.paintedPx }) })
}
await on('spill-bad', async (w) => { const o = await w.evaluate('window.__qual.overflow()'); expect('overflow: text spilling from a set height', 'spill-bad', o.outcome, 'fail', { hscroll: o.hscroll, spills: o.spills }) })
await on('contrast-text-unknown', async (w) => { const a = aggregate(await w.evaluate('window.__qual.contrastText()')); expect('text contrast: a gradient and ancestor opacity', 'contrast-text-unknown', a.outcome, 'cannot-determine', a.items.map((i) => ({ text: i.text, why: i.why }))) })
await on('thumb-target-disc', async (w) => { const c = (await w.evaluate('window.__qual.contrastExtra()')).find((x) => x.what === 'range thumb and track'); expect('range paint: cannot determine without pixels', 'range-paint', c?.outcome, 'cannot-determine', c) })
for (const name of ['motion-colour', 'motion-essential']) await on(name, async (w) => { const rows = await motionWatch(w, () => w.evaluate('document.getElementById("b").click()')); expect('motion: ' + (name === 'motion-colour' ? 'colour only, not counted' : 'essential, classified'), name, aggregate([...rows, { what: 'watch', outcome: rows.some((r) => r.outcome === 'fail') ? 'fail' : 'pass' }]).outcome === 'pass' && rows.length && rows.every((r) => r.outcome === (name === 'motion-colour' ? 'not-counted' : 'essential')) ? 'pass' : 'fail', 'pass', rows) }, reduced)
await closeAnalysis()
browser.close()

// The runner: a run that is not whole must say so, each way.
const vp = { w: 1280, h: 900, dpr: 1 }
const r = (id, extra = {}) => ({ id, lang: 'en-GB', view: 'w1280', mode: 'light', ...extra })
const d = (id, extra = {}) => r(id, { requires: ['focus'], viewport: vp, ...extra })
const ok = (over = {}) => ({ status: 'ok', reached: { outcome: 'pass', seen: { viewport: vp } }, instruments: { focus: aggregate([{ outcome: 'pass' }]) }, ...over })
const run = Run.create(join(DIR, 'runs'), 'prove', ['A', 'B', 'C', 'D', 'F'].map((id) => d(id)))
run.record(r('A'), ok())
run.record(r('B'), ok())
run.record(r('B'), ok())
writeFileSync(join(run.dir, 'C__en-GB__w1280__light.json'), JSON.stringify({ runId: 'an-earlier-run', status: 'ok' }))
run.record(r('E'), ok())
run.record(r('F'), { status: 'failed', error: 'the state predicate was false' })
const v = run.verify()
const kinds = new Set(v.problems.map((p) => p.kind))
for (const k of ['duplicate', 'stale', 'missing', 'undeclared', 'failed']) results.push({ instrument: 'runner', fixture: k, outcome: kinds.has(k) ? 'fail' : 'pass', wanted: 'fail', proved: kinds.has(k) })
// M-01's negatives: each record is otherwise whole.
const neg = Run.create(join(DIR, 'runs'), 'prove-neg', [d('EMPTY'), d('VIEW'), d('INSTR'), d('EXPIRED'), d('S-80', { variant: 'copied' }), d('S-80', { variant: 'denied' })])
neg.record(r('EMPTY'), ok({ instruments: { focus: { outcome: 'pass', items: [] } } }))
neg.record(r('VIEW'), ok({ reached: { outcome: 'pass', seen: { viewport: { w: 1024, h: 900, dpr: 1 } } } }))
neg.record(r('INSTR'), ok({ instruments: {} }))
neg.record(r('EXPIRED'), ok({ status: 'failed', stateExpired: true, reachedAfter: { outcome: 'fail', problems: ['state predicate false'] } }))
neg.record(r('S-80', { variant: 'copied' }), ok())
const nv = neg.verify()
const has = (kind, key) => nv.problems.some((p) => p.kind === kind && p.key.startsWith(key))
for (const [fixture, kind, key] of [['empty measurement', 'empty-pass', 'EMPTY'], ['wrong view', 'wrong-view', 'VIEW'], ['missing instrument', 'missing-instrument', 'INSTR'], ['expired state', 'state-expired', 'EXPIRED'], ['missing variant', 'missing', 'S-80~denied']]) results.push({ instrument: 'runner', fixture, outcome: has(kind, key) ? 'fail' : 'pass', wanted: 'fail', proved: has(kind, key) && !nv.problems.some((p) => p.key?.startsWith('S-80~copied')), detail: nv.problems.filter((p) => p.key?.startsWith(key)) })
// aggregate: nothing measured is never a pass; nothing counted is "not applicable"; exempt rows stay.
const a0 = aggregate([]), a1 = aggregate([{ outcome: 'inert', why: 'behind a modal dialog' }, { outcome: 'pass', disabled: true }], { exempt: (t) => t.disabled && 'disabled' })
results.push({ instrument: 'aggregate', fixture: 'empty list', outcome: a0.outcome, wanted: 'cannot-determine', proved: a0.outcome === 'cannot-determine' })
results.push({ instrument: 'aggregate', fixture: 'every row exempt', outcome: a1.outcome, wanted: 'not-applicable', proved: a1.outcome === 'not-applicable' && a1.items.length === 2, detail: a1 })
// M-08: a capture is never written over.
let threw = false
neg.artifact('S-80~copied__en-GB__w1280__light__page.png', Buffer.from('one'))
try { neg.artifact('S-80~copied__en-GB__w1280__light__page.png', Buffer.from('two')) } catch { threw = true }
results.push({ instrument: 'runner', fixture: 'capture overwritten', outcome: threw ? 'fail' : 'pass', wanted: 'fail', proved: threw })
// Codex astra's method check (25 October), M-01: no pass without its evidence. Each failing
// record fails for its own reason, named by the runner; each has a passing twin in prove-clean.
const step = (outcome = 'pass') => ({ key: 'Tab', outcome })
const route = (id, extra = {}) => d(id, { requires: ['keys'], ...extra })
const rec = (instruments) => ok({ instruments })
const ev = Run.create(join(DIR, 'runs'), 'prove-evidence', [d('BARE'), route('NOSTEPS'), route('EMPTYROUTE'), route('SHORT', { expects: { keys: { steps: 3 } } }), route('UNDECLARED'), d('SUBJECT', { expects: { focus: { subjects: ['#a', '#b'] } } }), d('OVERPASS')])
ev.record(r('BARE'), rec({ focus: { outcome: 'pass' } }))
ev.record(r('NOSTEPS'), rec({ keys: { outcome: 'pass', steps: [] } }))
ev.record(r('EMPTYROUTE'), rec({ keys: { ...emptyRoute, outcome: 'pass' } }))
ev.record(r('SHORT'), rec({ keys: { outcome: 'pass', declared: 3, steps: [step(), step()] } }))
ev.record(r('UNDECLARED'), rec({ keys: { outcome: 'pass', steps: [step(), step()] } }))
ev.record(r('SUBJECT'), rec({ focus: aggregate([{ el: '#a', outcome: 'pass' }]) }))
ev.record(r('OVERPASS'), rec({ focus: { outcome: 'pass', items: [{ el: '#a', outcome: 'pass' }, { el: '#b', outcome: 'fail' }] } }))
const evv = ev.verify()
const said = (key) => evv.problems.filter((p) => p.key?.startsWith(key + '__'))
for (const [fixture, key, kind, why] of [
  ['a bare pass', 'BARE', 'no-evidence', /no rows, steps or readings/],
  ['a route passing on steps: []', 'NOSTEPS', 'empty-pass', /no steps/],
  ['an empty route (keysRoute given no steps) recorded as a pass', 'EMPTYROUTE', 'empty-pass', /no steps/],
  ['a route short of its declared steps', 'SHORT', 'evidence', /2 steps recorded of 3 given/],
  ['a route passing with no step count given', 'UNDECLARED', 'evidence', /no step count given/],
  ['a row subject the declaration expects, missing', 'SUBJECT', 'evidence', /expected subjects missing: #b/],
  ['a pass over a counted failing row', 'OVERPASS', 'evidence', /counted row that did not pass/],
]) results.push({ instrument: 'runner: evidence', fixture, outcome: said(key).some((p) => p.kind === kind && why.test(p.why)) ? 'fail' : 'pass', wanted: 'fail', proved: said(key).length === 1 && said(key)[0].kind === kind && why.test(said(key)[0].why), detail: said(key) })
const clean = Run.create(join(DIR, 'runs'), 'prove-clean', [d('A'), d('S-80', { variant: 'copied' }), route('ROUTE', { expects: { keys: { steps: 2 } } }), d('SUBJECTS', { expects: { focus: { subjects: ['#a', '#b'] } } })])
clean.record(r('A'), ok())
clean.record(r('S-80', { variant: 'copied' }), ok())
clean.record(r('ROUTE'), rec({ keys: { outcome: 'pass', declared: 2, steps: [step(), step()] } }))
clean.record(r('SUBJECTS'), rec({ focus: aggregate([{ el: '#a', outcome: 'pass' }, { el: '#b', outcome: 'pass' }]) }))
results.push({ instrument: 'runner', fixture: 'whole', outcome: clean.verify().whole ? 'pass' : 'fail', wanted: 'pass', proved: clean.verify().whole, detail: clean.verify().problems })
// Codex astra's re-check (26 October), M-01: the real declarations carry what each record must hold
// (matrix.mjs `expectsFor`): the pilot's and part 4's own records, one for each kind of expectation. A
// subject dropped from one fails the run for that reason alone; the same records whole pass.
process.env.RUN_ROOT ??= join(DIR, 'runs')
const { declareRecord, PLANS: REAL } = await import('./matrix.mjs')
const realDecls = [...REAL.pilot3(), ...REAL.part4()].map(declareRecord)
// A record for each kind, each a different record (a run declares a key once), the kind with the fewest records chosen first.
const KINDS = ['keys', 'focus', 'asserts', 'subresults', 'player', 'formatTip'], taken = new Set(), chosen = {}
for (const name of [...KINDS].sort((a, b) => realDecls.filter((x) => x.expects?.[a]).length - realDecls.filter((x) => x.expects?.[b]).length)) {
  const decl = realDecls.find((x) => x.expects?.[name] && !taken.has(recordKey(x)))
  if (decl) taken.add(recordKey(decl))
  chosen[name] = decl
}
const picks = KINDS.map((name) => ({ name, decl: chosen[name] }))
const fill = (decl, drop) => {
  const ins = {}
  for (const name of decl.requires) {
    const want = decl.expects?.[name]
    if (name === 'overflow') ins[name] = { outcome: 'pass', scrollWidth: 1280, clientWidth: 1280, hscroll: false }
    else if (name === 'ax') ins[name] = { outcome: 'pass', counts: { nodes: 3 }, problems: [] }
    else if (name === 'keys') ins[name] = { outcome: 'pass', declared: want.steps, steps: Array.from({ length: want.steps - (drop === name ? 1 : 0) }, () => step()) }
    else ins[name] = aggregate((want?.subjects ?? ['a row']).filter((x, i, all) => !(drop === name && i === all.length - 1)).map((x) => ({ what: x, sel: x, outcome: 'pass' })))
  }
  return ok({ reached: { outcome: 'pass', seen: { viewport: decl.viewport } }, instruments: ins })
}
const found = picks.filter((p) => p.decl)
results.push({ instrument: 'runner: real declarations', fixture: 'every kind of expectation found in the pilot and part 4', outcome: found.length === picks.length ? 'pass' : 'fail', wanted: 'pass', proved: found.length === picks.length, detail: picks.map((p) => ({ name: p.name, key: p.decl ? recordKey(p.decl) : null, expects: p.decl?.expects?.[p.name] })) })
const dropRun = Run.create(join(DIR, 'runs'), 'prove-declared-drop', found.map((p) => p.decl))
for (const p of found) dropRun.record(p.decl, fill(p.decl, p.name))
const dv = dropRun.verify()
for (const p of found) {
  const k = recordKey(p.decl), got = dv.problems.filter((x) => x.key === k)
  const last = p.decl.expects[p.name].subjects?.at(-1)
  const why = p.name === 'keys' ? new RegExp(`${p.decl.expects.keys.steps - 1} steps recorded of ${p.decl.expects.keys.steps} given`) : new RegExp('expected subjects missing: ' + last.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const proved = got.length === 1 && got[0].kind === 'evidence' && got[0].instrument === p.name && why.test(got[0].why)
  results.push({ instrument: 'runner: real declarations', fixture: `${k}: a ${p.name === 'keys' ? 'step' : 'subject'} dropped from ${p.name}`, outcome: got.length ? 'fail' : 'pass', wanted: 'fail', proved, detail: got })
}
const wholeRun = Run.create(join(DIR, 'runs'), 'prove-declared-whole', found.map((p) => p.decl))
for (const p of found) wholeRun.record(p.decl, fill(p.decl, null))
const wv = wholeRun.verify()
results.push({ instrument: 'runner: real declarations', fixture: 'the same records whole', outcome: wv.whole ? 'pass' : 'fail', wanted: 'pass', proved: wv.whole, detail: wv.problems })

writeFileSync(join(DIR, 'prove.json'), JSON.stringify(results, null, 1))
for (const x of results) console.log(`${x.proved ? 'PROVED' : 'NOT PROVED'}  ${x.instrument} on ${x.fixture}: ${x.outcome} (wanted ${x.wanted})`)
process.exit(results.every((x) => x.proved) ? 0 : 1)
