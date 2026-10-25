// VH-186: the small words. A whole 30 s Matroska file, which the caption
// scan cannot read: the System check's six rows read as the sheet's B1 has
// them, each label's line count is measured, and the unchecked warning goes
// on with the scanned one's caption passage (B3). A 0.4 s clip: Video
// properties says its duration alone with a capital (B2). In each language,
// width and colour mode, with nothing running off the page.
//
//   FIX=<fixtures> RUN_ROOT=<scratch>/runs \
//     node words-186.mjs [--langs …] [--views w1280,w375,w320] [--modes …] [--clips]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { MX_INIT, ready } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const views = opt('--views', ['w1280', 'w375', 'w320'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const clips = args.includes('--clips')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `words-186-${stamp}`)
mkdirSync(dir, { recursive: true })

// The System check opened, each row's label as drawn and its line count,
// and the unchecked loss's words.
// The four English labels before, from the sheet's B1, measured in the same
// cell for the line count they replace.
const BEFORE = { secure: 'Secure connection (needed for storage access)', webcodecs: 'Video processing in the browser (WebCodecs)', h264: 'Video format the tool makes (H.264)', aac: 'Audio format the tool makes (AAC)' }
const READ_CHECKS = `(() => { const M = window.__mx; const BEFORE = ${JSON.stringify(BEFORE)};
  const doc = document.documentElement;
  const panel = document.getElementById('system-check'); panel.open = true;
  const rows = [...panel.querySelectorAll('li.check')].map((li) => { const name = li.children[1];
    const range = document.createRange(); range.selectNodeContents(name);
    const count = () => new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top))).size;
    const id = li.id.replace('check-', ''); const label = name.textContent; const lines = count();
    let linesBefore = null;
    if (document.documentElement.lang === 'en-GB' && BEFORE[id]) { name.textContent = BEFORE[id]; range.selectNodeContents(name); linesBefore = count(); name.textContent = label; }
    return { id, label, expected: M.msg('systemCheck.rows.' + id), lines, linesBefore, state: li.dataset.state }; });
  const report = document.getElementById('source-report');
  const said = report ? report.innerText.replace(/\\s+/g, ' ') : '';
  const norm = (s) => String(s || '').replace(/\\s+/g, ' ').trim();
  const unchecked = norm(M.msg('source.losses.uncheckedDetail'));
  const passage = norm(M.msg('source.losses.captionsConsequence'));
  const at = said.indexOf(unchecked);
  return { rows, uncheckedTitle: said.includes(norm(M.msg('source.losses.uncheckedTitle'))), unchecked: at >= 0,
    passageFollows: at >= 0 && said.indexOf(passage, at + unchecked.length) > at,
    overflowX: doc.scrollWidth > doc.clientWidth };
})()`

// Video properties opened, its Duration row's value.
const READ_PROPS = `(() => { const M = window.__mx;
  const doc = document.documentElement;
  const d = document.querySelector('#source-report details'); if (d) d.open = true;
  const pairs = [...document.querySelectorAll('#source-report dt')].map((dt) => [dt.textContent.trim(), dt.nextElementSibling ? dt.nextElementSibling.textContent.trim() : null]);
  const duration = (pairs.find(([term]) => term === M.msg('source.rows.duration')) || [])[1] ?? null;
  return { duration, expected: M.msg('format.alone.lessThanASecond'), inSentence: M.msg('format.lessThanASecond'), overflowX: doc.scrollWidth > doc.clientWidth };
})()`

const browser = await connectBrowser()
const out = []
const run = async (keyName, fn) => {
  const w = new Walk(browser, `words-186-${stamp}/${keyName}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    out.push({ key: keyName, ...(await fn(w)) })
  } catch (e) {
    out.push({ key: keyName, ok: false, error: String(e && e.message || e) })
  } finally {
    await w.close().catch(() => {})
  }
  console.log(JSON.stringify(out.at(-1)))
}

for (const lang of langs) for (const view of views) for (const mode of modes) {
  await run(`checks__${lang}__${view}__${mode}`, async (w) => {
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, 'lecture-30s.mkv')
    const r = { lang, view, mode, ...(await w.evaluate(READ_CHECKS)) }
    if (clips && lang === 'en-GB' && mode === 'light') { await w.clip(`checks-${view}`, '#system-check'); await w.clip(`unchecked-${view}`, '#source-report') }
    r.ok = r.rows.length === 6 && r.rows.every((row) => row.label === row.expected) && r.uncheckedTitle && r.unchecked && r.passageFollows && !r.overflowX
    return r
  })
  await run(`props__${lang}__${view}__${mode}`, async (w) => {
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, 'short-0.4s.mp4')
    const r = { lang, view, mode, ...(await w.evaluate(READ_PROPS)) }
    r.ok = r.duration === r.expected && !r.overflowX
    return r
  })
}
await closeAnalysis()
writeFileSync(join(dir, 'results.json'), JSON.stringify(out, null, 1))
console.log(`${out.filter((r) => r.ok).length}/${out.length} ok — ${dir}`)
process.exit(0)
