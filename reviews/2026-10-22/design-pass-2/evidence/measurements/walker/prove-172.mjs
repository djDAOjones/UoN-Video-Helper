// PLAN-7 (VH-172): the two instruments VH-172 adds, each proved to catch its
// own failure before the priority run trusts it, as prove.mjs does for
// VH-171's: `pressed` (VH-169: pressed against hover by mouse, a held Space
// with the focus ring kept, disabled wins) and `type` (VH-166: every drawn
// text element on one of the eight roles). Fixtures in a scratch directory.
//
//   PROVE_DIR=<scratch>/prove-172 OUT_ROOT=<scratch>/out node prove-172.mjs   (headless Chrome on :9222)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { connectBrowser } from './cdp.mjs'
import { Walk } from './walk.mjs'
import { QUAL_INIT, pressedVsHover, typeRoles, closeAnalysis } from './qualify.mjs'
import { aggregate } from './runner.mjs'

const DIR = process.env.PROVE_DIR
if (!DIR) throw new Error('set PROVE_DIR to a scratch directory')
mkdirSync(DIR, { recursive: true })

const page = (body, style = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>fixture</title><style>html{font-size:16px}body{font-family:Arial,sans-serif;font-size:1rem;line-height:1.5;font-weight:400;background:#fff;color:#161616;margin:24px}${style}</style></head><body><main>${body}</main></body></html>`
const BTN = 'button{font:inherit;font-size:.875rem;line-height:1.5;padding:12px 16px;border:1px solid #0043ce;background:#0f62fe;color:#fff}button:hover{background:#0050e6}button:focus-visible{outline:2px solid #161616;outline-offset:2px}'
const ACT = 'button:active:not(:disabled){background:#002d9c}'
const ROLES_OK = '<h1 style="font-family:Lora,serif;font-size:1.75rem;line-height:1.25;font-weight:700">Title</h1><h2 style="font-family:Lora,serif;font-size:1.25rem;line-height:1.4;font-weight:700">Panel</h2><p>Body text.</p><p style="font-size:.875rem">Supporting text.</p><pre style="font-family:monospace;font-size:.875rem;line-height:1.5">code</pre>'
const FIXTURES = {
  'pressed-bad': page('<button id="b">Create</button>', BTN),
  'pressed-good': page('<button id="b">Create</button>', BTN + ACT),
  'pressed-ring-bad': page('<button id="b">Create</button>', BTN + ACT + 'button:active{outline:none !important}'),
  'disabled-bad': page('<button id="b" disabled>Create</button>', BTN + 'button:disabled{background:#c6c6c6;color:#525252}button:disabled:active{background:#8d8d8d}'),
  'disabled-good': page('<button id="b" disabled>Create</button>', BTN + 'button:disabled{background:#c6c6c6;color:#525252}' + ACT),
  'clicked-never': page('<button id="b" onclick="document.title=\'clicked\'">Create</button>', BTN + ACT),
  'type-bad': page(ROLES_OK + '<p style="font-size:15px">Fifteen pixels.</p><p style="font-family:Georgia">A browser face.</p>'),
  'type-good': page(ROLES_OK),
}
for (const [name, html] of Object.entries(FIXTURES)) writeFileSync(join(DIR, name + '.html'), html)

const browser = await connectBrowser()
const results = []
const expect = (instrument, fixture, outcome, wanted, detail) => results.push({ instrument, fixture, outcome, wanted, proved: outcome === wanted, detail })
async function on(name, fn) {
  const w = new Walk(browser, 'prove172-' + name)
  await w.open()
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
  const loaded = w.page.once('Page.loadEventFired')
  await w.page.send('Page.navigate', { url: pathToFileURL(join(DIR, name + '.html')).href })
  await loaded
  await new Promise((r) => setTimeout(r, 300))
  try { return await fn(w) } finally { await w.close() }
}
const brief = (p) => ({ why: p.why, active: p.down?.active, hoverBg: p.hover?.bg, downBg: p.down?.bg, hoverVsDown: p.hoverVsDown, restVsDown: p.restVsDown, keyboard: p.keyboard && { outcome: p.keyboard.outcome, ringDrawn: p.keyboard.ringDrawn, upVsHeld: p.keyboard.upVsHeld } })
for (const [fx, want] of [['pressed-bad', 'fail'], ['pressed-good', 'pass'], ['pressed-ring-bad', 'fail'], ['disabled-bad', 'fail'], ['disabled-good', 'pass']])
  await on(fx, async (w) => { const p = await pressedVsHover(w, '#b'); expect('pressed', fx, p.outcome, want, brief(p)) })
await on('clicked-never', async (w) => { await pressedVsHover(w, '#b'); const t = await w.evaluate('document.title'); expect('pressed', 'a press never clicks', t === 'clicked' ? 'fail' : 'pass', 'pass', { title: t }) })
for (const [fx, want] of [['type-bad', 'fail'], ['type-good', 'pass']])
  await on(fx, async (w) => { const a = aggregate(await typeRoles(w)); expect('type', fx, a.outcome, want, a.items.map((i) => ({ look: i.look, role: i.role, rendered: i.rendered, outcome: i.outcome }))) })
await closeAnalysis()
browser.close()
writeFileSync(join(DIR, 'prove-172.json'), JSON.stringify(results, null, 1))
for (const x of results) console.log(`${x.proved ? 'PROVED' : 'NOT PROVED'}  ${x.instrument} on ${x.fixture}: ${x.outcome} (wanted ${x.wanted}) ${JSON.stringify(x.detail).slice(0, 300)}`)
process.exit(results.every((x) => x.proved) ? 0 : 1)
