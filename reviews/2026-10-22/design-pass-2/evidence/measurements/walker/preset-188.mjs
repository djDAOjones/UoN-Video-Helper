// VH-188: the preset names. Step 5's two choices and their details read as
// the sheet's B6 has them, each label's line count measured, in each
// language, width and colour mode, with nothing running off the page. The
// sentences that name an output take its words in a sentence
// (preset.inSentence.*). A finished job of each output: its
// record names the output in the record's words (preset.inRecord.*), with no
// name of the old kind left in it.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node preset-188.mjs [--langs …] [--views w1280,w375,w320] [--modes …] [--only step|sentences|record] [--clips]
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
const only = opt('--only', ['step', 'sentences', 'record'])
const clips = args.includes('--clips')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `preset-188-${stamp}`)
mkdirSync(dir, { recursive: true })

const OLD = ['Larger / better', 'Smaller / reduced', 'etc.', '更大/更好', '更小/减少', 'Lebih besar / lebih baik', 'Lebih kecil / dikurangkan', 'dll.']

// Step 5's fieldset: each choice's name and detail as drawn, and its lines.
const READ_STEP = `(() => { const M = window.__mx; const doc = document.documentElement;
  const lines = (el) => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size; };
  const choices = ['best', 'smaller'].map((id) => { const label = document.querySelector('[data-i18n="preset.labels.' + id + '"]'); const detail = document.querySelector('[data-i18n="preset.details.' + id + '"]');
    return { id, label: label.textContent, expected: M.msg('preset.labels.' + id), labelLines: lines(label), detail: detail.textContent, expectedDetail: M.msg('preset.details.' + id), detailLines: lines(detail) }; });
  const legend = document.querySelector('#step-preset legend, #preset-choice legend');
  const text = document.getElementById('step-preset').innerText;
  return { choices, legend: legend ? legend.textContent.trim() : null, old: ${JSON.stringify(OLD)}.filter((s) => text.includes(s)), overflowX: doc.scrollWidth > doc.clientWidth };
})()`

const READ_SENTENCES = `(() => { const M = window.__mx;
  const keys = [['preflight.slides', 'best'], ['status.storageWayOut', 'smaller'], ['preflight.reasons.insufficientStorageResolvable', 'smaller'], ['failure.outOfSpace.next', 'smaller']];
  return { sentences: keys.map(([key, id]) => { const name = M.msg('preset.inSentence.' + id);
    return { key, name, text: M.msg(key).replace('{' + id + '}', name).replace('{size}', '120 MB') }; }) };
})()`

const READ_RECORD = (id) => `(() => { const M = window.__mx; const doc = document.documentElement;
  const said = document.getElementById('process-result').innerText.replace(/\\s+/g, ' ');
  return { said, expected: M.msg('preset.inRecord.${id}'), named: said.includes(M.msg('preset.inRecord.${id}')), label: said.includes(M.msg('preset.labels.${id}')),
    old: ${JSON.stringify(OLD)}.filter((s) => said.includes(s)), overflowX: doc.scrollWidth > doc.clientWidth };
})()`

const browser = await connectBrowser()
const out = []
const run = async (keyName, fn) => {
  const w = new Walk(browser, `preset-188-${stamp}/${keyName}`)
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

if (only.includes('step')) for (const lang of langs) for (const view of views) for (const mode of modes) {
  await run(`step__${lang}__${view}__${mode}`, async (w) => {
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, 'lecture-30s.mp4')
    const r = { lang, view, mode, ...(await w.evaluate(READ_STEP)) }
    if (clips && mode !== 'forced-dark') await w.clip(`step5-${lang}-${view}-${mode}`, '#step-preset')
    r.ok = r.choices.every((c) => c.label === c.expected && c.detail === c.expectedDetail) && r.old.length === 0 && !r.overflowX
    return r
  })
}

// The sentences that name an output, composed as the page composes them. The
// slides line itself needs a high-bitrate screen recording no fixture is;
// preflight-panel.test.ts draws it.
if (only.includes('sentences')) for (const lang of langs) {
  await run(`sentences__${lang}`, async (w) => {
    await w.goto()
    if (lang !== 'en-GB') await w.chooseLanguage(lang)
    const r = { lang, ...(await w.evaluate(READ_SENTENCES)) }
    r.ok = r.sentences.every((x) => !x.text.includes('{') && x.text.includes(x.name))
    return r
  })
}

if (only.includes('record')) for (const lang of langs) for (const id of ['best', 'smaller']) {
  await run(`record__${id}__${lang}__w1280`, async (w) => {
    await setViewport(w, 'w1280')
    await ready(w, lang, 'short-2s.mp4')
    await w.click(`input[name="preset"][value="${id}"]`)
    await w.waitSettled()
    await w.click('#process-actions > button:nth-child(2)')
    await w.waitFinished()
    const r = { lang, id, ...(await w.evaluate(READ_RECORD(id))) }
    if (clips && lang === 'en-GB') await w.clip(`record-${id}`, '#process-result')
    r.ok = r.named && !r.label && r.old.length === 0 && !r.overflowX
    return r
  })
}
await closeAnalysis()
writeFileSync(join(dir, 'results.json'), JSON.stringify(out, null, 1))
console.log(`${out.filter((r) => r.ok).length}/${out.length} ok — ${dir}`)
process.exit(0)
