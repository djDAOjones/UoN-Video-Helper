// VH-183: the trim handles' Page step, max(10 s, 1% of the video), read live.
// For a 130 s lecture and an hour-long still, each language, width and mode:
// focus a handle by script, press Page Up, Page Down, End, Home and an arrow
// as keys, and read the value and what the handle says (aria-valuetext).
//
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node page-183.mjs [--langs en-GB,zh-Hans,ms-MY] [--views w1280,w375,w320] \
//       [--modes light,dark,forced-light,forced-dark]
//   (headless Chrome on :9222, Vite on :5173; fixtures.sh makes still-3600s.mp4)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, F, sleep } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { MX_INIT, fresh } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const views = opt('--views', ['w1280', 'w375', 'w320'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const files = opt('--files', ['lecture-130s.mp4', 'still-3600s.mp4'])
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `page-183-${stamp}`)
mkdirSync(dir, { recursive: true })

const KEYS = {
  PageUp: { key: 'PageUp', code: 'PageUp', vk: 33 },
  PageDown: { key: 'PageDown', code: 'PageDown', vk: 34 },
  End: { key: 'End', code: 'End', vk: 35 },
  Home: { key: 'Home', code: 'Home', vk: 36 },
  ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', vk: 39 },
}
async function press(w, name) {
  const k = KEYS[name]
  await w.page.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk })
  await w.page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk })
  await sleep(80)
}
const READ = (id) => `(() => { const r = document.getElementById('${id}'); return { value: Math.round(r.valueAsNumber * 1000) / 1000, text: r.getAttribute('aria-valuetext'), max: Number(r.max), focused: document.activeElement === r, lang: document.documentElement.lang }; })()`

const browser = await connectBrowser()
const out = []
for (const file of files) for (const lang of langs) for (const view of views) for (const mode of modes) {
  const key = `${file.replace(/\.mp4$/, '')}__${lang}__${view}__${mode}`
  const w = new Walk(browser, `page-183-${stamp}/${key}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await setViewport(w, view)
    await setMode(w, mode)
    await fresh(w, lang)
    await w.setFiles(F(file))
    await w.waitFor(`(() => { const r = document.getElementById('trim-end-range'); return r && Number(r.max) > 0 && r.valueAsNumber > 0; })()`, { timeout: 180000, label: 'the trim track' })
    const steps = []
    for (const [id, seq] of [['trim-start-range', ['PageUp', 'PageUp', 'PageDown', 'ArrowRight', 'End', 'PageUp', 'Home', 'PageDown']], ['trim-end-range', ['PageDown', 'PageUp', 'Home', 'PageDown', 'End']]]) {
      await w.evaluate(`document.getElementById('${id}').focus()`)
      steps.push({ id, key: 'start', ...(await w.evaluate(READ(id))) })
      for (const k of seq) { await press(w, k); steps.push({ id, key: k, ...(await w.evaluate(READ(id))) }) }
    }
    const r = { key, file, lang, view, mode, steps }
    out.push(r)
    console.log(key + ': ' + steps.map((s) => `${s.id === 'trim-start-range' ? 'S' : 'E'}${s.key}=${s.value}`).join(' '))
  } catch (e) { out.push({ key, error: String(e.stack ?? e).slice(0, 300) }); console.log(key + ' error ' + e) } finally { await w.close().catch(() => undefined) }
}
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
console.log('run dir: ' + dir)
browser.close()
process.exit(out.some((r) => r.error) ? 1 : 0)
