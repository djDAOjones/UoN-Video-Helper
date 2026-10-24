// VH-185: a sliver of late sound in the part kept. A 10 s file whose sound
// starts at 4 s (its AAC priming at 3.979 s), kept 0:00–0:04: before Create
// the existing "This video has no audio" warning shows, in each language,
// width and colour mode, with nothing running off the page. Then, at 1280 in
// light, Create runs to a finished video rather than failing at the output
// check. A control whose sound starts at 3.4 s (0.6 s kept) shows no such
// warning and finishes, levelled.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node sliver-185.mjs [--langs …] [--views w1280,w375,w320] [--modes …] [--clips] [--no-jobs]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode, key } from './qualify.mjs'
import { MX_INIT, ready } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const views = opt('--views', ['w1280', 'w375', 'w320'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const clips = args.includes('--clips')
const jobs = !args.includes('--no-jobs')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `sliver-185-${stamp}`)
mkdirSync(dir, { recursive: true })

const mx = (w, expr) => w.evaluate(`(() => { const M = window.__mx; return ${expr}; })()`)
// The no-audio warning as the page draws it: its heading's element, visible.
const READ = `(() => { const M = window.__mx;
  const doc = document.documentElement;
  const box = document.getElementById('audio-warnings');
  return { noAudio: !!box && M.vis(box) && M.has('warnings.noAudio.heading', '#audio-warnings'), endsEarly: !!box && M.vis(box) && M.has('warnings.endsEarly.heading', '#audio-warnings'), warnings: box && M.vis(box) ? box.innerText.trim().slice(0, 300) : null, verdict: M.verdict(), trimEnd: document.getElementById('trim-end').value,
    overflowX: doc.scrollWidth > doc.clientWidth, checking: M.checking() };
})()`

async function keep04(w) {
  await w.type('#trim-end', '0:04')
  await key(w, 'Tab')
  await sleep(600)
  await w.waitSettled({ timeout: 180000 })
  await w.waitFor(`(() => { const M = window.__mx; return !!M.verdict() && !M.checking(); })()`, { timeout: 180000, label: 'the verdict after the trim' })
  await sleep(400)
}

async function job(w) {
  if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(200) }
  await w.click(w.createButton())
  await w.waitRunning()
  await w.waitFor(`(() => { const M = window.__mx; return M.res() === 'result' || M.res() === 'failure'; })()`, { timeout: 600000, interval: 500, label: 'the job’s end' })
  await sleep(400)
  return mx(w, `({ res: M.res(), finished: M.finished(), title: M.text('#process-result > .notification > .notification-title').trim(),
    text: document.getElementById('process-result').innerText.trim().slice(0, 600),
    endsEarly: M.has('result.endedEarly.sound', '#process-result') || M.has('result.endedEarly.both', '#process-result') }) `)
}

const browser = await connectBrowser()
const out = []
const run = async (keyName, fn) => {
  const w = new Walk(browser, `sliver-185-${stamp}/${keyName}`)
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
  await run(`${lang}__${view}__${mode}`, async (w) => {
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, 'late-sound-10s.mp4')
    await keep04(w)
    const r = { lang, view, mode, ...(await w.evaluate(READ)) }
    if (clips && view === 'w1280' && lang === 'en-GB') await w.screenshot(`sliver-${mode}`)
    r.ok = r.noAudio && !r.endsEarly && r.trimEnd.startsWith('0:04') && !r.overflowX && !!r.verdict
    return r
  })
}
if (jobs) for (const lang of langs) for (const [name, file, expectNoAudio] of [['sliver', 'late-sound-10s.mp4', true], ['control', 'late-sound-3.4s-10s.mp4', false]]) {
  await run(`job__${name}__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, file)
    await keep04(w)
    const before = await w.evaluate(READ)
    const end = await job(w)
    return { lang, file, before, end, ok: before.noAudio === expectNoAudio && !before.endsEarly && end.finished && !end.endsEarly }
  })
}
await closeAnalysis()
writeFileSync(join(dir, 'results.json'), JSON.stringify(out, null, 1))
console.log(`${out.filter((r) => r.ok).length}/${out.length} ok — ${dir}`)
process.exit(0)
