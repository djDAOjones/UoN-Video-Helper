// VH-180 (V-47): the frame-rate note as Video properties draws it, for a
// source conformed up (45 fps, to 50) and one conformed down (120 fps, to
// 60), under Larger and then Smaller (which caps the output at 30 fps), in
// each language. VH-174's live `d04` case, repeated on the item's words.
//
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node note-180.mjs [--langs en-GB,zh-Hans,ms-MY]
//   (headless Chrome on :9222, Vite on :5173; fixtures.sh makes the two files)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, F } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { MX_INIT, fresh } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `note-180-${stamp}`)
mkdirSync(dir, { recursive: true })

// The Frame rate row: the fifth fact, found by the table's own term; its value and its note apart.
const ROW = String.raw`(() => {
  const M = window.__mx; const term = M.msg('source.rows.frameRate');
  const dt = [...document.querySelectorAll('#source-report dt')].find((d) => d.textContent.trim() === term);
  const dd = dt && dt.nextElementSibling; const note = dd && dd.querySelector('.fact-note');
  const detail = dd ? [...dd.childNodes].filter((n) => n !== note).map((n) => n.textContent).join('').trim() : null;
  return { term, detail, note: note ? note.textContent.trim() : null, preset: document.querySelector('#preset-choice input:checked')?.value };
})()`

const browser = await connectBrowser()
const out = []
for (const lang of langs) for (const file of ['hfr-45fps-10s.mp4', 'hfr-120fps-10s.mp4']) {
  const key = `${file.replace(/-10s\.mp4$/, '')}__${lang}`
  const w = new Walk(browser, `note-180-${stamp}/${key}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await fresh(w, lang)
    await w.setFiles(F(file))
    await w.waitSettled({ timeout: 180000 })
    const larger = await w.evaluate(ROW)
    await w.click('#preset-choice input[value="smaller"]')
    await w.waitSettled({ timeout: 180000 })
    const smaller = await w.evaluate(ROW)
    const r = { key, lang, file, larger, smaller }
    out.push(r)
    console.log(`${key}: ${larger.preset} "${larger.detail}" | "${larger.note}" ; ${smaller.preset} "${smaller.note}"`)
  } catch (e) { out.push({ key, error: String(e.stack ?? e).slice(0, 300) }); console.log(key + ' error ' + e) } finally { await w.close().catch(() => undefined) }
}
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
console.log('run dir: ' + dir)
browser.close()
process.exit(0)
