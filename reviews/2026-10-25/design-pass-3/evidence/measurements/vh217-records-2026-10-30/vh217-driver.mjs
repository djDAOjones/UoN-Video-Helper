// VH-217 #1's driver, VH-216's retargeted (the plan and the probe's onset reading): the stage rule's cells walked by the pass's own runner (matrix.mjs),
// unchanged, on a plan declared in memory, with a read-only probe wrapping each walked scenario's `afterMode` in memory (after
// the runner's setMode, before the state is asserted and the instruments run). It moves no focus. Nothing here is written into
// the walker or the repository. A scenario's `langs`/`views` are read by the walker's own plans only, so a plan in memory declares it
// beyond them. One plan per mode (`--modes` one name): a state needing focus on the "?" is blurred by the instruments, and each scenario's
// setup, wrapped here in memory, sets that mode first, so a route run in setup runs at the cell's own font and colours.
//
//   APP_URL=… CDP_PORT=9251 FIX=<empty dir> OUT_ROOT=<out> RUN_ROOT=<runs> node vh217-driver.mjs walk --walker <dir> --label before \
//     --name a --scenarios S-03 [--langs …] [--views …] [--modes …]
import { pathToFileURL, fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'
import { appendFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const list = (s) => String(s ?? '').split(',').map((x) => x.trim()).filter(Boolean)
const args = (() => { const a = process.argv.slice(2), o = { _: [] }; for (let i = 0; i < a.length; i++) { if (a[i].startsWith('--')) { o[a[i].slice(2)] = a[++i] } else o._.push(a[i]) } return o })()

// Read-only: the landmarks in DOM order, the headings, the promises by the "?"'s own list (which both sides share), boxes, overflow, the mode.
const PROBE = String.raw`(() => {
  const M = window.__mx;
  const promises = document.getElementById('format-help-button')?.closest('ul') ?? null;
  const marks = { title: document.querySelector('.page-title'), lede: document.querySelector('.lede'), privacy: document.querySelector('[data-i18n="lede.privacy"]'), browserNote: document.getElementById('browser-note'), step1: document.getElementById('step-choose'), switch: document.getElementById('video-kind'), step2: document.getElementById('step-trim'), step3: document.getElementById('step-title'), step4: document.getElementById('step-closing'), step5: document.getElementById('step-preset'), step6: document.getElementById('step-create'), announcer: document.getElementById('page-announcer'), errors: document.getElementById('errors-panel'), promises, dev: document.getElementById('dev-actions') };
  const present = Object.entries(marks).filter(([, e]) => e);
  const order = present.slice().sort(([, a], [, b]) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)).map(([k]) => k);
  const missing = Object.entries(marks).filter(([, e]) => !e).map(([k]) => k);
  const shown = (e) => e.getClientRects().length > 0;
  const box = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY), left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width), h: Math.round(b.height) }; };
  const items = promises ? [...promises.children].map((li) => (li.querySelector('span') || li).textContent.replace(/\s+/g, ' ').trim()) : [];
  const a = document.activeElement;
  return {
    lang: document.documentElement.lang, order, missing,
    painted: present.filter(([, e]) => shown(e)).map(([k]) => k),
    headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({ tag: h.tagName, text: h.textContent.replace(/\s+/g, ' ').trim(), shown: shown(h) })),
    promises: { n: items.length, ok: items.length === 5 && !!M?.msg && items.every((t, i) => t === M.msg('lede.promises.' + i)), parentClass: promises?.parentElement?.className ?? null, ownClass: promises?.className ?? null, listStyle: promises ? getComputedStyle(promises).listStyleType : null, box: box(promises), privacyInLede: !!marks.privacy?.closest('.lede') },
    input: box(document.getElementById('file-input')), help: box(document.getElementById('format-help-button')), tip: box(document.getElementById('format-help')), tipShown: !document.getElementById('format-help')?.hidden, onset: box(document.getElementById('onset-help-button')), onsetTip: box(document.getElementById('onset-help')), onsetExpanded: document.getElementById('onset-help-button')?.getAttribute('aria-expanded') ?? null, formatExpanded: document.getElementById('format-help-button')?.getAttribute('aria-expanded') ?? null,
    overflow: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth },
    modeRead: { fontPx: parseFloat(getComputedStyle(document.documentElement).fontSize), forced: matchMedia('(forced-colors: active)').matches, dark: matchMedia('(prefers-color-scheme: dark)').matches, vw: innerWidth, vh: innerHeight },
    focus: !a || a === document.body ? 'body' : (a.id || a.tagName), scrollY,
  };
})()`

function power() {
  const sh = (cmd, a) => execFileSync(cmd, a, { encoding: 'utf8' })
  const batt = sh('pmset', ['-g', 'batt']), pm = sh('pmset', ['-g']), up = sh('uptime', []).trim()
  const ac = /AC Power/.test(batt), level = Number((batt.match(/(\d+)%/) ?? [])[1])
  const mode = Number((pm.match(/^\s*powermode\s+(\d+)/m) ?? [])[1]), low = /lowpowermode\s+1/.test(pm) || mode === 1
  const load = Number((up.match(/load averages?: ([\d.]+)/) ?? [])[1])
  return { at: new Date().toISOString(), source: ac ? 'AC' : 'battery', level, powermode: mode, low, load, uptime: up, ok: ac || (level > 50 && !low) }
}

async function walk() {
  for (const k of ['APP_URL', 'CDP_PORT', 'FIX', 'OUT_ROOT', 'RUN_ROOT']) if (!process.env[k]) throw new Error('set ' + k)
  if (!args.walker) throw new Error('--walker <walker dir>')
  const walker = resolve(args.walker), label = args.label ?? 'before', scenarios = list(args.scenarios)
  const langs = list(args.langs ?? 'en-GB,zh-Hans,ms-MY'), views = list(args.views ?? 'w1280,w640,w401,w400,w375,w320'), modes = list(args.modes ?? 'light,dark,forced-light,forced-dark,font32,dark-font32,forced-light-font32,forced-dark-font32')
  const records = scenarios.flatMap((id) => langs.flatMap((lang) => views.flatMap((view) => modes.map((mode) => ({ id, lang, view, mode })))))
  if (!records.length) throw new Error('nothing declared')
  const plan = `vh217-${label}-${args.name ?? 'run'}`, p = power()
  mkdirSync(process.env.RUN_ROOT, { recursive: true })
  appendFileSync(join(process.env.RUN_ROOT, 'vh217-ledger.jsonl'), JSON.stringify({ plan, label, power: p, walker, appUrl: process.env.APP_URL, cdpPort: process.env.CDP_PORT, records: records.length, ids: [...new Set(records.map((r) => r.id))], langs, views, modes }) + '\n')
  console.log('power: ' + JSON.stringify(p))
  if (!p.ok) { console.log('POWER-STOP: battery at or below 50%, or Low Power'); process.exit(3) }
  const matrixUrl = pathToFileURL(join(walker, 'matrix.mjs')).href
  const { PLANS, SCENARIOS } = await import(new URL('./scenarios.mjs', matrixUrl).href)
  const { setMode } = await import(new URL('./qualify.mjs', matrixUrl).href)
  for (const r of records) if (!SCENARIOS[r.id]) throw new Error('the walker holds no scenario ' + r.id)
  const OUT = join(process.env.RUN_ROOT, `vh217-probe-${plan}.jsonl`)
  for (const id of new Set(records.map((r) => r.id))) {
    const sc = SCENARIOS[id], orig = sc.afterMode, origSetup = sc.setup
    if (modes.length === 1) sc.setup = async (w, lang) => { await setMode(w, modes[0]); await origSetup(w, lang) }
    sc.afterMode = async (w) => {
      if (orig) await orig(w)
      let g
      try { g = await w.evaluate(PROBE) } catch (e) { g = { error: String(e.message ?? e).slice(0, 200) } }
      appendFileSync(OUT, JSON.stringify({ plan, cell: w.name.split('/').pop(), walk: w.name, id, mode: w.qualMode, at: new Date().toISOString(), ...g }) + '\n')
    }
  }
  PLANS[plan] = () => records.map((r) => ({ ...r }))
  // matrix.mjs runs its main when it is the entry point: it is made so, unchanged.
  process.argv = [process.argv[0], fileURLToPath(matrixUrl), plan]
  await import(matrixUrl)
}

if (args._[0] === 'walk') await walk()
else { console.log('usage: node vh217-driver.mjs walk --walker <dir> --label <l> --name <n> --scenarios … [--langs --views --modes]'); process.exit(2) }
