// VH-181 (V-45): step 4's name as the page draws it, once a video is read
// (S-15's Ready), in each language at 1280 x 900 and 320 x 568, light: the
// heading's words, box and lines; the legend's words and the fieldset's
// accessible name; and, across the step's own text (the onset help
// included) and the whole page, how often each name for the closing
// occurs: the step's name, the noun its lines use and the three old names.
//
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node name-181.mjs [--langs en-GB,zh-Hans,ms-MY]
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
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `name-181-${stamp}`)
mkdirSync(dir, { recursive: true })

// The noun step 4's own lines use, and the old names, by language.
const NOUN = { 'en-GB': 'closing graphics', 'zh-Hans': '结尾图形', 'ms-MY': 'grafik penutup' }
const OLD = ['Closing branding', '结尾品牌标识', 'Penjenamaan penutup']

const READ = (lang) => String.raw`(() => {
  const count = (text, word) => text.toLowerCase().split(word.toLowerCase()).length - 1;
  const h = document.getElementById('closing-heading');
  const span = h.querySelector('[data-i18n="steps.closing"]');
  const legend = document.querySelector('legend[data-i18n="closing.legend"]');
  const range = document.createRange(); range.selectNodeContents(h);
  const tops = new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top)));
  const box = h.getBoundingClientRect(); const cs = getComputedStyle(h);
  const step = document.getElementById('step-closing').textContent.replace(/\s+/g, ' ');
  const page = document.body.textContent.replace(/\s+/g, ' ');
  const old = ${JSON.stringify(OLD)};
  const noun = ${JSON.stringify(NOUN[lang])};
  const name = span.textContent.trim();
  return {
    heading: h.textContent.replace(/\s+/g, ' ').trim(), name, legend: legend.textContent.trim(),
    box: { width: Math.round(box.width), height: Math.round(box.height) }, lines: tops.size,
    font: cs.fontSize + ' ' + cs.fontWeight + ' / ' + cs.lineHeight,
    stepCounts: { name: count(step, name), noun: count(step, noun), old: old.map((o) => count(step, o)) },
    pageOld: old.map((o) => count(page, o)),
  };
})()`

async function namesInTree(w) {
  await w.page.send('Accessibility.enable')
  const { nodes } = await w.page.send('Accessibility.getFullAXTree')
  return nodes.filter((n) => !n.ignored && /^(heading|group)$/.test(n.role?.value ?? '')).map((n) => ({ role: n.role.value, name: n.name?.value ?? '' }))
}

const browser = await connectBrowser()
const out = []
for (const lang of langs) for (const view of ['w1280', 'w320']) {
  const key = `${lang}__${view}`
  const w = new Walk(browser, `name-181-${stamp}/${key}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await setViewport(w, view)
    await setMode(w, 'light')
    await ready(w, lang)
    const r = await w.evaluate(READ(lang))
    const tree = await namesInTree(w)
    r.axHeading = tree.find((n) => n.role === 'heading' && n.name.includes(r.name))?.name ?? null
    r.axGroup = tree.find((n) => n.role === 'group' && n.name === r.legend)?.name ?? null
    out.push({ key, lang, view, ...r })
    console.log(`${key}: "${r.heading}" legend "${r.legend}" ax heading "${r.axHeading}" group "${r.axGroup}"; ${r.lines} line(s), ${r.box.width}x${r.box.height}, ${r.font}; step: name ${r.stepCounts.name}, noun ${r.stepCounts.noun}, old ${r.stepCounts.old.join('/')}; page old ${r.pageOld.join('/')}`)
  } catch (e) { out.push({ key, error: String(e.stack ?? e).slice(0, 300) }); console.log(key + ' error ' + e) } finally { await w.close().catch(() => undefined) }
}
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
console.log('run dir: ' + dir)
browser.close()
process.exit(0)
