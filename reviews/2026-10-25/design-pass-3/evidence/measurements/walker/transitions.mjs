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
//     node transitions.mjs <ids|all> [--langs en-GB,zh-Hans,ms-MY] [--modes light,dark,forced-light,forced-dark]
//   (headless Chrome on :9222, Vite on :5173)
//
//   VH-198: node transitions.mjs --plan run-03   a part's or run's declared
//   transitions (parts.mjs), in a fresh directory, checked whole at the end:
//   a declared record missing, in error or undeclared fails the run (exit 1).
//   node transitions.mjs --resume <dir>   keeps the records already pass or
//   fail, moves those in error to superseded/ and walks them again.
//
// Codex astra's method check, M-03: the scenarios' evidence contract. The
// source, the instrument revision and the declared fixtures are pinned by
// hash in declared.json when the run is created, each fixture hashed into
// fixtures.jsonl as it is used; a resume is refused, before anything is
// changed, if any of them differs, and keeps the ledger. Each record asserts
// the observed language, mode, viewport and a visible page the moment the
// transition is over (a record elsewhere is an error, never a reading), keeps
// both ring images by hash wherever its ring verdict rests on pixels, and
// carries its ring verdict apart from the transition's: the manifest tallies
// transitions (landing and assertions) and rings separately, and accounts
// every ring "cannot determine" as unresolved.
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { platform, release, arch } from 'node:os'
import { connectBrowser } from './cdp.mjs'
import { Walk, F } from './walk.mjs'
import { QUAL_INIT, VIEWS, assertReached, focusArea, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { TRANSITIONS, MX_INIT } from './scenarios.mjs'
import { transitionsOf, transitionKey, assertParts } from './parts.mjs'
import { keysSha, browserCommandLine, APP_ROOT, provenanceNow, provenanceProblems, fixtureIdentity, FixtureLedger, fixturesForManifest, unresolvedFrom } from './runner.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const VIEW = 'w1280'
const VIEWPORT = { w: VIEWS[VIEW].width, h: VIEWS[VIEW].height, dpr: VIEWS[VIEW].deviceScaleFactor }
const RESERVED = new Set(['declared.json', 'summary.json', 'manifest.json', 'artifacts.json'])
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const flags = new Set(['--langs', '--modes', '--plan', '--resume'])
const ids = args.filter((a, i) => !a.startsWith('--') && !flags.has(args[i - 1]))
const chosen = ids.includes('all') || !ids.length ? Object.keys(TRANSITIONS) : ids
const langs = opt('--langs', ['en-GB'])
const modes = opt('--modes', ['light'])
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const resumeDir = opt('--resume', [null])[0]
const plan = opt('--plan', [null])[0]
const fileKey = (t) => (t.set ? transitionKey(t) : `${t.id}__${t.lang}__${t.mode}`)
let dir, declared, planName
if (resumeDir) {
  dir = resumeDir
  const meta = JSON.parse(readFileSync(join(dir, 'declared.json'), 'utf8'))
  ;({ plan: planName, declared } = meta)
  if (planName) { await assertParts(); if (JSON.stringify(transitionsOf(planName).map(fileKey)) !== JSON.stringify(declared.map(fileKey))) throw new Error(`${planName} now declares other transitions than this run did: rerun it whole`) }
  // M-03: refused unless the source, the instrument revision and every pinned or used fixture are those the run pinned.
  const problems = meta.provenance ? provenanceProblems(meta.provenance, meta.provenance.appRoot ?? APP_ROOT, new FixtureLedger(dir, meta.provenance.fixtures).entries()) : ['the run pinned no provenance when it was created (a run from before M-03): rerun it whole']
  if (problems.length) throw new Error(`resume refused: ${dir} no longer stands on what it pinned:\n  ${problems.join('\n  ')}`)
} else {
  planName = plan
  if (plan) { await assertParts(); declared = transitionsOf(plan); if (!declared.length) throw new Error(`${plan} declares no transitions`) }
  else declared = chosen.flatMap((id) => langs.flatMap((lang) => modes.map((mode) => ({ id, lang, view: VIEW, mode }))))
  for (const t of declared) if (!TRANSITIONS[t.id]) throw new Error('no transition ' + t.id)
  const keys = declared.map(fileKey)
  if (new Set(keys).size !== keys.length) throw new Error('a transition declared twice')
  dir = join(RUN_ROOT, `transitions-${plan ? plan + '-' : ''}${stamp}`)
  if (existsSync(dir)) throw new Error('run directory exists: ' + dir)
  // M-03: pinned before anything is walked: the source, the instrument revision, the declared fixtures by hash.
  const fixtures = [...new Set(declared.flatMap((t) => TRANSITIONS[t.id].fixtures ?? []))].map((f) => (f.startsWith('/') ? f : F(f))).sort()
  const provenance = { ...provenanceNow(APP_ROOT), appRoot: APP_ROOT, fixtures: fixtures.map(fixtureIdentity) }
  mkdirSync(join(dir, 'captures'), { recursive: true })
  writeFileSync(join(dir, 'declared.json'), JSON.stringify({ plan: plan ?? undefined, created: new Date().toISOString(), provenance, declared }, null, 1))
}
// Resumed: a record already pass or fail, under the pinned revision, is kept; one in error is superseded and walked again.
const kept = new Set()
const resumes = []
const pinned = JSON.parse(readFileSync(join(dir, 'declared.json'), 'utf8')).provenance
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
    if (r && (r.outcome === 'pass' || r.outcome === 'fail') && r.revision === pinned.instruments.revision) { kept.add(fileKey(t)); continue }
    mkdirSync(join(dir, 'superseded'), { recursive: true })
    renameSync(f, join(dir, 'superseded', `${fileKey(t)}~a${meta.resumes.length}.json`))
  }
}
const attempt = resumes.length + 1
const ledger = new FixtureLedger(dir, pinned.fixtures, attempt)
/** A capture under captures/, hashed into artifacts.jsonl, never written over (a resumed attempt's own name takes ~a<n>). */
function artifact(name, buf) {
  mkdirSync(join(dir, 'captures'), { recursive: true })
  if (attempt > 1 && existsSync(join(dir, 'captures', name))) name = name.replace(/(\.[a-z]+)$/, `~a${attempt}$1`)
  writeFileSync(join(dir, 'captures', name), buf, { flag: 'wx' })
  const a = { path: 'captures/' + name, bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex').slice(0, 16) }
  appendFileSync(join(dir, 'artifacts.jsonl'), JSON.stringify(a) + '\n')
  return a
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
    // Every fixture a transition chooses is hashed into the ledger (M-03).
    for (const m of ['setFiles', 'drag']) { const real = w[m].bind(w); w[m] = async (file, ...rest) => { ledger.use(file); return real(file, ...rest) } }
    const started = Date.now()
    const rec = { key, revision: pinned.instruments.revision, attempt, ...(d.set ? { set: d.set, part: d.part } : {}), id, name: t.name, lang, mode, view: VIEW, successor: t.successor }
    try {
      await w.open()
      await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
      await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
      await setViewport(w, VIEW)
      await setMode(w, mode)
      const r = await t.run(w, lang)
      Object.assign(rec, r, { faults: w.faults ?? [], faultsSeen: w.faultsSeen ?? [] })
      // M-03: the language, mode and viewport observed, and a visible page (a hidden one runs throttled), asserted the moment it is over: elsewhere, the record is an error.
      rec.reached = await assertReached(w, { lang, mode, viewport: VIEWPORT })
      rec.visibility = rec.reached.seen?.visibility
      if (rec.reached.outcome !== 'pass') throw new Error('not in the declared state: ' + rec.reached.problems.join('; '))
      const asserted = { ...t.asserts(r.ran ?? {}), noDetour: (r.moves ?? []).every((m) => r.el.startsWith(m)) }
      rec.asserted = asserted
      rec.unmet = Object.keys(asserted).filter((k) => asserted[k] !== true)
      // The ring on the control focus reached: the successor, never the reader's own choice.
      const ring = t.ring ?? (t.successor !== 'moved' && t.successor !== 'dialog[open]' ? t.successor : null)
      if (ring && r.landed) {
        const sel = typeof ring === 'string' ? ring : ring.sel
        const f = await focusArea(w, sel, typeof ring === 'string' ? {} : { ref: ring.ref })
        const { on, off } = f
        const reading = { ...f }
        delete reading.off
        delete reading.on
        // Both images kept wherever the verdict rests on pixels; a pixel verdict without them has no evidence, so it is "cannot determine".
        if (on && off) reading.images = { off: artifact(`${key}__ring-off.png`, off), on: artifact(`${key}__ring-on.png`, on) }
        else if (reading.outcome === 'pass' || reading.outcome === 'fail') Object.assign(reading, { pixelVerdict: reading.outcome, outcome: 'cannot-determine', why: 'the ring images were not both captured, so the pixel verdict has no evidence kept' })
        rec.ringReading = reading
      }
    } catch (e) {
      rec.error = String(e.stack ?? e).slice(0, 400)
    } finally {
      rec.seconds = Math.round((Date.now() - started) / 1000)
      await w.close().catch(() => undefined)
    }
    // The transition's verdict (landing and its conditions) and the ring's, apart (M-03).
    rec.outcome = rec.error ? 'error' : rec.landed && !rec.unmet.length ? 'pass' : 'fail'
    rec.ring = rec.ringReading
      ? { outcome: rec.ringReading.outcome, ...(rec.ringReading.why ? { why: rec.ringReading.why } : {}) }
      : { outcome: 'not-read', why: rec.error ? 'the record is in error' : !rec.landed ? 'focus did not land on the successor' : 'the successor is not a control whose ring is read (focus moved by the reader, or the dialog)' }
    writeFileSync(join(dir, `${key}.json`), JSON.stringify(rec, null, 1))
    out.push(rec)
    console.log(`${rec.outcome.padEnd(5)} ${key}: ${rec.el ?? ''}${rec.unmet?.length ? ' unmet ' + rec.unmet.join(',') : ''} inView ${JSON.stringify(rec.inView)} ring ${rec.ring.outcome}${rec.ringReading ? ` ${rec.ringReading.areaAt3to1}/${rec.ringReading.perimeter2px}` : ''} ${JSON.stringify(rec.ran ?? {})} ${rec.error ? rec.error.split('\n')[0] : ''} (${rec.seconds} s)`)
  }
}
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
// Whole only if every declared record is here, once, as pass or fail (an error is a missing measurement), under the provenance the run pinned.
const want = new Set(declared.map(fileKey))
const seen = readdirSync(dir).filter((f) => f.endsWith('.json') && !RESERVED.has(f)).map((f) => f.slice(0, -5))
const drift = provenanceProblems(pinned, pinned.appRoot ?? APP_ROOT, ledger.entries())
const offRevision = out.filter((r) => r.revision !== pinned.instruments.revision).map((r) => r.key)
const problems = [
  ...[...want].filter((k) => !seen.includes(k)).map((key) => ({ kind: 'missing', key })),
  ...seen.filter((k) => !want.has(k)).map((key) => ({ kind: 'undeclared', key })),
  ...out.filter((r) => r.outcome === 'error').map((r) => ({ kind: 'failed', key: r.key, why: r.error?.split('\n')[0] })),
  ...drift.map((why) => ({ kind: 'provenance', why })),
  ...offRevision.map((key) => ({ kind: 'off-revision', key, why: 'walked under another instrument revision than the run pinned' })),
]
const tally = (f) => out.reduce((o, r) => ((o[f(r)] = (o[f(r)] ?? 0) + 1), o), {})
const arts = existsSync(join(dir, 'artifacts.jsonl')) ? readFileSync(join(dir, 'artifacts.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []
writeFileSync(join(dir, 'artifacts.json'), JSON.stringify(arts, null, 1))
const fx = fixturesForManifest(ledger, pinned.fixtures)
const manifest = {
  plan: planName ?? undefined,
  dir,
  resumes,
  // What the run pinned when it was created (M-03); `provenance` says whether it still held when this manifest was written.
  source: pinned.source,
  instruments: pinned.instruments,
  provenance: { pinnedAtCreation: true, held: !drift.length, problems: drift, recordsOffRevision: offRevision.length },
  browser: browser.version.Browser,
  browserCommandLine: await browserCommandLine(browser),
  os: `${platform()} ${release()} ${arch()}`,
  views: [...new Set(out.map((r) => JSON.stringify({ view: r.view, actual: r.reached?.seen?.viewport ?? null, rootFontPx: r.reached?.seen?.rootFontPx ?? null })))].map((s) => JSON.parse(s)),
  scaling: 'Emulation.setDeviceMetricsOverride at 1280 x 900, scale 1 (setViewport), asserted per record after the transition',
  fixtures: fx.used,
  fixturesPinned: fx.pinned,
  faults: [...new Set(out.flatMap((r) => r.faults ?? []))],
  coverage: { expected: want.size, observed: seen.filter((k) => want.has(k)).length, whole: !problems.length, problems, expectedKeysSha256: keysSha([...want]), observedKeysSha256: keysSha(seen) },
  // M-03: the transitions' verdicts (focus landed, every condition held) apart from the rings' (2.4.13 on the successor).
  transitions: tally((r) => r.outcome),
  rings: tally((r) => r.ring?.outcome ?? 'not-read'),
  outcomes: tally((r) => r.outcome),
  artifacts: { count: arts.length, bytes: arts.reduce((s, a) => s + a.bytes, 0), listSha256: createHash('sha256').update(JSON.stringify(arts)).digest('hex').slice(0, 16), list: 'artifacts.json (each ring image: path, bytes, sha256)' },
  unresolved: {
    fromMeasurements: unresolvedFrom(out.filter((r) => r.ring).map((r) => ({ key: r.key, instruments: { ring: { ...r.ring, items: [] } } }))),
    errors: out.filter((r) => r.outcome === 'error').map((r) => ({ key: r.key, why: r.error?.split('\n')[0] })),
  },
  seconds: out.reduce((n, r) => n + (r.seconds ?? 0), 0),
}
writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 1))
console.log(JSON.stringify({ expected: manifest.coverage.expected, observed: manifest.coverage.observed, whole: manifest.coverage.whole, problems, transitions: manifest.transitions, rings: manifest.rings }, null, 1))
console.log('run dir: ' + dir)
browser.close()
process.exit(manifest.coverage.whole ? 0 : 1)
