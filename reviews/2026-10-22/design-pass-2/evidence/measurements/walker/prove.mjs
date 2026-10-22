// PLAN-7 (VH-171): each instrument proved to catch its own failure before
// it is trusted. Temporary failing fixtures and their passing twins are
// written to a scratch directory, never to src/; each instrument must fail
// the one and pass the other. The runner's own checks are proved the same
// way, on a run with a missing, a duplicate, a stale, an undeclared and a
// failed record.
//
//   PROVE_DIR=<scratch>/prove OUT_ROOT=<scratch>/out node prove.mjs   (headless Chrome on :9222)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { connectBrowser } from './cdp.mjs'
import { Walk } from './walk.mjs'
import { QUAL_INIT, axTree, focusArea, keysRoute, closeAnalysis } from './qualify.mjs'
import { Run } from './runner.mjs'

const DIR = process.env.PROVE_DIR
if (!DIR) throw new Error('set PROVE_DIR to a scratch directory')
mkdirSync(DIR, { recursive: true })

const page = (body, style = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>fixture</title><style>body{font:16px/1.5 sans-serif;background:#fff;color:#161616;margin:24px}${style}</style></head><body><main>${body}</main></body></html>`
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
  'keys-bad': page('<button id="a">First</button><div id="go" onclick="1">Go</div>'),
  'keys-good': page('<button id="a">First</button><button id="go">Go</button>'),
}
for (const [name, html] of Object.entries(FIXTURES)) writeFileSync(join(DIR, name + '.html'), html)

const browser = await connectBrowser()
const results = []
const expect = (instrument, fixture, outcome, wanted, detail) => results.push({ instrument, fixture, outcome, wanted, proved: outcome === wanted, detail })

async function on(name, fn) {
  const w = new Walk(browser, 'prove-' + name)
  await w.open()
  await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
  const loaded = w.page.once('Page.loadEventFired')
  await w.page.send('Page.navigate', { url: pathToFileURL(join(DIR, name + '.html')).href })
  await loaded
  await new Promise((r) => setTimeout(r, 300))
  try { return await fn(w) } finally { await w.close() }
}

for (const v of ['bad', 'good']) {
  const want = v === 'bad' ? 'fail' : 'pass'
  await on('overflow-' + v, async (w) => { const o = await w.evaluate('window.__audit.overflow()'); expect('overflow', 'overflow-' + v, o.hscroll ? 'fail' : 'pass', want, { scrollWidth: o.scrollWidth, clientWidth: o.clientWidth }) })
  await on('focus-' + v, async (w) => { const f = await focusArea(w, '#b'); expect('rendered focus', 'focus-' + v, f.outcome, want, { areaAt3to1: f.areaAt3to1, perimeter2px: f.perimeter2px, bestRatio: f.bestRatio }); writeFileSync(join(DIR, `focus-${v}-on.png`), f.on); writeFileSync(join(DIR, `focus-${v}-off.png`), f.off) })
  await on('focus-scrolled-' + v, async (w) => { const f = await focusArea(w, '#b'); expect('rendered focus, scrolled', 'focus-scrolled-' + v, f.outcome, want, { areaAt3to1: f.areaAt3to1, perimeter2px: f.perimeter2px, bestRatio: f.bestRatio }) })
  await on('lines-' + v, async (w) => { const l = await w.evaluate('window.__qual.lines()'); expect('rendered lines', 'lines-' + v, l.some((x) => x.outcome === 'fail') ? 'fail' : 'pass', want, l.map((x) => ({ lang: x.lang, worst: x.worst }))) })
  await on('name-' + v, async (w) => { const a = await axTree(w); expect('accessibility tree: names', 'name-' + v, a.outcome, want, a.problems) })
  await on('target-' + v, async (w) => { const t = await w.evaluate('window.__qual.targets()'); const b = t.find((x) => x.el.startsWith('button')); expect('target area', 'target-' + v, b.outcome, want, b) })
  await on('placeholder-' + v, async (w) => { const c = await w.evaluate('window.__qual.contrastExtra()'); const p = c.find((x) => x.what === 'placeholder'); expect('contrast beyond text', 'placeholder-' + v, p.outcome, want, p) })
  await on('modal-' + v, async (w) => { const a = await axTree(w); expect('accessibility tree: modal background', 'modal-' + v, a.outcome, want, a.problems) })
  await on('keys-' + v, async (w) => { const k = await keysRoute(w, [{ key: 'Tab', expect: '#a' }, { key: 'Tab', expect: '#go' }]); expect('keys-only route', 'keys-' + v, k.outcome, want, k.steps.map((s) => s.to)) })
}
await closeAnalysis()
browser.close()

// The runner: a run that is not whole must say so, each way.
const run = Run.create(join(DIR, 'runs'), 'prove', ['A', 'B', 'C', 'D', 'F'].map((id) => ({ id, lang: 'en-GB', view: 'w1280', mode: 'light' })))
const r = (id) => ({ id, lang: 'en-GB', view: 'w1280', mode: 'light' })
run.record(r('A'), { status: 'ok' })
run.record(r('B'), { status: 'ok' })
run.record(r('B'), { status: 'ok' })
writeFileSync(join(run.dir, 'C__en-GB__w1280__light.json'), JSON.stringify({ runId: 'an-earlier-run', status: 'ok' }))
run.record(r('E'), { status: 'ok' })
run.record(r('F'), { status: 'failed', error: 'the state predicate was false' })
const v = run.verify()
const kinds = new Set(v.problems.map((p) => p.kind))
for (const k of ['duplicate', 'stale', 'missing', 'undeclared', 'failed']) results.push({ instrument: 'runner', fixture: k, outcome: kinds.has(k) ? 'fail' : 'pass', wanted: 'fail', proved: kinds.has(k) })
const clean = Run.create(join(DIR, 'runs'), 'prove-clean', [r('A')])
clean.record(r('A'), { status: 'ok' })
results.push({ instrument: 'runner', fixture: 'whole', outcome: clean.verify().whole ? 'pass' : 'fail', wanted: 'pass', proved: clean.verify().whole })

writeFileSync(join(DIR, 'prove.json'), JSON.stringify(results, null, 1))
for (const x of results) console.log(`${x.proved ? 'PROVED' : 'NOT PROVED'}  ${x.instrument} on ${x.fixture}: ${x.outcome} (wanted ${x.wanted})`)
process.exit(results.every((x) => x.proved) ? 0 : 1)
