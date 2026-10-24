// VH-187: the top of the page. The file button's place on a passing load at
// 1280 x 900, 800 x 600, 375 and 320 px in three languages, before and after
// (the after is never lower); the lede's words (B4); and the browser note
// (B5): hidden while the checks run and when they pass, shown in its "not
// passed" words on a fail (F2), a warn (the sound encoder refused), and a
// fail or warn beside a check still pending (F1, the worker held). The pass
// and fail pages in each language, width and colour mode, nothing off the page.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node top-187.mjs [--langs …] [--views …] [--modes …] [--only top|states|modes] [--clips]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode, VIEWS } from './qualify.mjs'
import { MX_INIT, LANG_VALUE } from './scenarios.mjs'
import { applyFault, gotoNoWait } from './faults.mjs'

VIEWS.w800 = { width: 800, height: 600, deviceScaleFactor: 1, mobile: false }

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const only = opt('--only', ['top', 'states', 'modes'])
const clips = args.includes('--clips')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `top-187-${stamp}`)
mkdirSync(dir, { recursive: true })

// A sound encoder refused for AAC: the aac row warns, the others pass.
const NO_AAC = `(() => { const real = AudioEncoder.isConfigSupported.bind(AudioEncoder);
  AudioEncoder.isConfigSupported = async (c) => (String(c.codec).startsWith('mp4a') ? { supported: false, config: c } : real(c)); })();`

const READ = `(() => { const M = window.__mx; const doc = document.documentElement;
  const note = document.getElementById('browser-note');
  const shown = !!note && !note.hidden && getComputedStyle(note).display !== 'none' && note.getBoundingClientRect().height > 0;
  const input = document.getElementById('file-input');
  const r = input.getBoundingClientRect();
  const lede = document.querySelector('.lede');
  const states = [...document.querySelectorAll('#checks li.check')].map((li) => li.id.replace('check-', '') + ':' + li.dataset.state);
  const has = (k) => { try { return M.msg(k) } catch (e) { return null } };
  return { fileTop: Math.round(r.top + window.scrollY), fileBottom: Math.round(r.bottom + window.scrollY), innerHeight: window.innerHeight,
    inFirstScreen: r.bottom + window.scrollY <= window.innerHeight,
    noteShown: shown, noteText: note ? note.textContent.trim() : null, noteHidden: note ? note.hidden : null,
    notPassed: has('browserNote.notPassed'),
    ledeText: lede.innerText.replace(/\\s+/g, ' ').trim(),
    lede: [...lede.querySelectorAll('li')].map((li) => li.textContent.trim()), ledeParas: lede.querySelectorAll('p').length,
    sourceStatus: (document.getElementById('source-status') || {}).textContent || '',
    starting: has('choose.starting'),
    states, description: document.querySelector('meta[name=description]').content,
    overflowX: doc.scrollWidth > doc.clientWidth };
})()`

const browser = await connectBrowser()
const out = []
const run = async (keyName, fn) => {
  const w = new Walk(browser, `top-187-${stamp}/${keyName}`)
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
// The page loaded in a language with every check settled (or held).
const load = async (w, lang, { held = false } = {}) => {
  if (held) await gotoNoWait(w); else await w.goto()
  if (lang !== 'en-GB') await w.chooseLanguage(LANG_VALUE[lang])
  await sleep(held ? 1500 : 600)
}

if (only.includes('top')) for (const lang of langs) for (const view of opt('--views', ['w1280', 'w800', 'w375', 'w320'])) {
  await run(`top__${lang}__${view}`, async (w) => {
    await setViewport(w, view)
    await load(w, lang)
    const r = { lang, view, ...(await w.evaluate(READ)) }
    if (clips && lang === 'en-GB') await w.clip(`top-${view}`, '.page-title', { to: '#file-input' })
    r.ok = r.states.every((s) => s.endsWith(':pass')) && !r.overflowX
    return r
  })
}

const CASES = {
  fail: { faults: ['F2'], shown: true },
  warn: { init: NO_AAC, shown: true },
  pending: { faults: ['F1'], held: true, shown: false },
  pendingFail: { faults: ['F1', 'F2'], held: true, shown: true },
  pendingWarn: { faults: ['F1'], init: NO_AAC, held: true, shown: true },
}
if (only.includes('states')) for (const lang of langs) for (const [name, c] of Object.entries(CASES)) {
  await run(`state__${name}__${lang}__w1280`, async (w) => {
    await setViewport(w, 'w1280')
    for (const f of c.faults ?? []) await applyFault(w, f)
    if (c.init) await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: c.init })
    await load(w, lang, { held: c.held })
    const r = { lang, case: name, ...(await w.evaluate(READ)) }
    if (clips && lang === 'en-GB') await w.clip(`state-${name}`, '.lede', { to: '#file-input' })
    const expectedStates = { fail: (s) => s.some((x) => x.endsWith(':fail')), warn: (s) => s.some((x) => x.endsWith(':warn')),
      pending: (s) => s.some((x) => x.endsWith(':pending')), pendingFail: (s) => s.some((x) => x.endsWith(':pending')) && s.some((x) => x.endsWith(':fail')),
      pendingWarn: (s) => s.some((x) => x.endsWith(':pending')) && s.some((x) => x.endsWith(':warn')) }[name]
    r.reached = expectedStates(r.states)
    r.ok = r.reached && r.noteShown === c.shown && (!c.shown || r.noteText === r.notPassed) && !r.overflowX
    return r
  })
}

if (only.includes('modes')) for (const lang of langs) for (const view of opt('--views', ['w1280', 'w375', 'w320'])) for (const mode of opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])) for (const name of ['pass', 'fail']) {
  await run(`mode__${name}__${lang}__${view}__${mode}`, async (w) => {
    await setViewport(w, view)
    await setMode(w, mode)
    if (name === 'fail') await applyFault(w, 'F2')
    await load(w, lang)
    const r = { lang, view, mode, case: name, ...(await w.evaluate(READ)) }
    if (clips && lang === 'en-GB' && view === 'w320') await w.clip(`${name}-${mode}`, '.lede', { to: '#file-input' })
    r.ok = r.noteShown === (name === 'fail') && (name === 'pass' || r.noteText === r.notPassed) && !r.overflowX
    return r
  })
}
await closeAnalysis()
writeFileSync(join(dir, 'results.json'), JSON.stringify(out, null, 1))
console.log(`${out.filter((r) => r.ok).length}/${out.length} ok — ${dir}`)
process.exit(0)
