// VH-178: walks the focus hand-off's transitions (scenarios.mjs TRANSITIONS,
// V-46) in the languages and modes asked, at 1280 px. Each record: focus the
// moment the transition is over, whether it ran as declared, whether focus
// landed where it must, then the rendered ring on that control (2.4.13, the
// focus instrument: 3:1 over a 2 px perimeter). A record passes only when
// focus landed, every condition its transition `asserts` holds, and focus
// entered nothing on the way but where it ended (Codex astra's check,
// VH-178). Kept for VH-176.
//
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node transitions.mjs <ids|all> [--langs en-GB,zh-Hans,ms-MY] [--modes light,dark,forced-light,forced-dark] [--shots]
//   (headless Chrome on :9222, Vite on :5173)
//
//   VH-198: node transitions.mjs --plan run-03   a part's or run's declared
//   transitions (parts.mjs), in a fresh directory, checked whole at the end:
//   a declared record missing, in error or undeclared fails the run (exit 1).
//   node transitions.mjs --resume <dir>   keeps the records already pass or
//   fail, moves those in error to superseded/ and walks them again.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { platform, release, arch } from 'node:os'
import { connectBrowser } from './cdp.mjs'
import { Walk } from './walk.mjs'
import { QUAL_INIT, focusArea, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { TRANSITIONS, MX_INIT } from './scenarios.mjs'
import { transitionsOf, transitionKey, assertParts } from './parts.mjs'
import { instrumentRevision, keysSha, browserCommandLine } from './runner.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const flags = new Set(['--langs', '--modes', '--plan', '--resume'])
const ids = args.filter((a, i) => !a.startsWith('--') && !flags.has(args[i - 1]))
const chosen = ids.includes('all') || !ids.length ? Object.keys(TRANSITIONS) : ids
const langs = opt('--langs', ['en-GB'])
const modes = opt('--modes', ['light'])
const shots = args.includes('--shots')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const resumeDir = opt('--resume', [null])[0]
const plan = opt('--plan', [null])[0]
const fileKey = (t) => (t.set ? transitionKey(t) : `${t.id}__${t.lang}__${t.mode}`)
let dir, declared, planName
if (resumeDir) {
  dir = resumeDir
  ;({ plan: planName, declared } = JSON.parse(readFileSync(join(dir, 'declared.json'), 'utf8')))
  if (planName) { await assertParts(); if (JSON.stringify(transitionsOf(planName).map(fileKey)) !== JSON.stringify(declared.map(fileKey))) throw new Error(`${planName} now declares other transitions than this run did: rerun it whole`) }
} else {
  planName = plan
  if (plan) { await assertParts(); declared = transitionsOf(plan); if (!declared.length) throw new Error(`${plan} declares no transitions`) }
  else declared = chosen.flatMap((id) => langs.flatMap((lang) => modes.map((mode) => ({ id, lang, view: 'w1280', mode }))))
  for (const t of declared) if (!TRANSITIONS[t.id]) throw new Error('no transition ' + t.id)
  const keys = declared.map(fileKey)
  if (new Set(keys).size !== keys.length) throw new Error('a transition declared twice')
  dir = join(RUN_ROOT, `transitions-${plan ? plan + '-' : ''}${stamp}`)
  if (existsSync(dir)) throw new Error('run directory exists: ' + dir)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'declared.json'), JSON.stringify({ plan: plan ?? undefined, created: new Date().toISOString(), declared }, null, 1))
}
// Resumed: a record already pass or fail is kept; one in error is superseded and walked again.
const kept = new Set()
const resumes = []
if (resumeDir) {
  const meta = JSON.parse(readFileSync(join(dir, 'declared.json'), 'utf8'))
  meta.resumes = [...(meta.resumes ?? []), new Date().toISOString()]
  resumes.push(...meta.resumes)
  writeFileSync(join(dir, 'declared.json'), JSON.stringify(meta, null, 1))
  for (const t of declared) {
    const f = join(dir, fileKey(t) + '.json')
    if (!existsSync(f)) continue
    let r = null
    try { r = JSON.parse(readFileSync(f, 'utf8')) } catch { /* unreadable: walked again */ }
    if (r && (r.outcome === 'pass' || r.outcome === 'fail')) { kept.add(fileKey(t)); continue }
    mkdirSync(join(dir, 'superseded'), { recursive: true })
    renameSync(f, join(dir, 'superseded', `${fileKey(t)}~a${meta.resumes.length}.json`))
  }
}

const browser = await connectBrowser()
const out = []
for (const d of declared) {
  const { id, lang, mode } = d
  const t = TRANSITIONS[id]
  {
    const key = fileKey(d)
    if (kept.has(key)) { out.push(JSON.parse(readFileSync(join(dir, key + '.json'), 'utf8'))); continue }
    const w = new Walk(browser, `transitions-${stamp}/${key}`)
    const started = Date.now()
    const rec = { key, ...(d.set ? { set: d.set, part: d.part } : {}), id, name: t.name, lang, mode, view: 'w1280', successor: t.successor }
    try {
      await w.open()
      await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
      await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
      await setViewport(w, 'w1280')
      await setMode(w, mode)
      const r = await t.run(w, lang)
      Object.assign(rec, r, { faults: w.faults ?? [], faultsSeen: w.faultsSeen ?? [] })
      // VH-198: a hidden page runs throttled (assertReached's rule): its record is an error, never a reading.
      rec.visibility = await w.evaluate('document.visibilityState')
      if (rec.visibility !== 'visible') throw new Error(`the page was ${rec.visibility}, not visible`)
      const asserted = { ...t.asserts(r.ran ?? {}), noDetour: (r.moves ?? []).every((m) => r.el.startsWith(m)) }
      rec.asserted = asserted
      rec.unmet = Object.keys(asserted).filter((k) => asserted[k] !== true)
      // The ring on the control focus reached: the successor, never the reader's own choice.
      const ring = t.ring ?? (t.successor !== 'moved' && t.successor !== 'dialog[open]' ? t.successor : null)
      if (ring && r.landed) {
        const sel = typeof ring === 'string' ? ring : ring.sel
        const f = await focusArea(w, sel, typeof ring === 'string' ? {} : { ref: ring.ref })
        const { on } = f
        const reading = { ...f }
        delete reading.off
        delete reading.on
        rec.ringReading = reading
        if (shots && on) { writeFileSync(join(dir, `${key}__ring-on.png`), on); rec.ringShot = `${key}__ring-on.png` }
      }
    } catch (e) {
      rec.error = String(e.stack ?? e).slice(0, 400)
    } finally {
      rec.seconds = Math.round((Date.now() - started) / 1000)
      await w.close().catch(() => undefined)
    }
    rec.outcome = rec.error ? 'error' : rec.landed && !rec.unmet.length ? 'pass' : 'fail'
    writeFileSync(join(dir, `${key}.json`), JSON.stringify(rec, null, 1))
    out.push(rec)
    console.log(`${rec.outcome.padEnd(5)} ${key}: ${rec.el ?? ''}${rec.unmet?.length ? ' unmet ' + rec.unmet.join(',') : ''} inView ${JSON.stringify(rec.inView)} ${rec.ringReading ? `ring ${rec.ringReading.outcome} ${rec.ringReading.areaAt3to1}/${rec.ringReading.perimeter2px}` : ''} ${JSON.stringify(rec.ran ?? {})} ${rec.error ? rec.error.split('\n')[0] : ''} (${rec.seconds} s)`)
  }
}
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
// Whole only if every declared record is here, once, as pass or fail (an error is a missing measurement).
const want = new Set(declared.map(fileKey))
const seen = readdirSync(dir).filter((f) => f.endsWith('.json') && !['declared.json', 'summary.json', 'manifest.json'].includes(f)).map((f) => f.slice(0, -5))
const problems = [
  ...[...want].filter((k) => !seen.includes(k)).map((key) => ({ kind: 'missing', key })),
  ...seen.filter((k) => !want.has(k)).map((key) => ({ kind: 'undeclared', key })),
  ...out.filter((r) => r.outcome === 'error').map((r) => ({ kind: 'failed', key: r.key, why: r.error?.split('\n')[0] })),
]
const tally = out.reduce((o, r) => ((o[r.outcome] = (o[r.outcome] ?? 0) + 1), o), {})
const manifest = { plan: planName ?? undefined, dir, resumes, instruments: instrumentRevision(), browser: browser.version.Browser, browserCommandLine: await browserCommandLine(browser), os: `${platform()} ${release()} ${arch()}`, coverage: { expected: want.size, observed: seen.filter((k) => want.has(k)).length, whole: !problems.length, problems, expectedKeysSha256: keysSha([...want]), observedKeysSha256: keysSha(seen) }, outcomes: tally, seconds: out.reduce((n, r) => n + (r.seconds ?? 0), 0) }
writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 1))
console.log(JSON.stringify({ expected: manifest.coverage.expected, observed: manifest.coverage.observed, whole: manifest.coverage.whole, problems, outcomes: tally }, null, 1))
console.log('run dir: ' + dir)
browser.close()
process.exit(manifest.coverage.whole ? 0 : 1)
