// PLAN-7 (VH-171): a run with no silent passes. The expected records are
// declared before the run, each with the instruments it requires and the
// view it must reach; each lands in a fresh run directory, once, with the
// run's id; verify() fails the run on a missing, duplicate, stale,
// undeclared, failed or state-expired record, a record without a required
// instrument, an instrument passing on nothing, or a record in the wrong
// view. That is run completeness; an instrument failing is a measurement,
// tallied apart (Codex astra's method check, M-01). Every capture is written
// under the run directory, named with the full record key, never over
// another (M-08). The manifest says what ran, on what, which records were
// expected and observed, the fixtures and captures by hash, and what stayed
// unresolved, from the measurements as well as the manual limits.
//
//   node runner.mjs --verify <run dir>     exits 1 when the run is not whole
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, appendFileSync, statSync, renameSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { release, platform, arch } from 'node:os'
import { Buffer } from 'node:buffer'

const HERE = dirname(fileURLToPath(import.meta.url))
const RESERVED = new Set(['run.json', 'manifest.json', 'artifacts.json'])
export const OUTCOMES = new Set(['pass', 'fail', 'cannot-determine', 'not-applicable'])
// Row outcomes kept, with their reason, but not counted toward the verdict.
const EXEMPT = new Set(['inert', 'off-page', 'inactive', 'superseded', 'not-applicable', 'not-counted', 'essential'])

/** The record key: scenario (and variant), language, view, mode. */
export const recordKey = (r) => [r.variant ? `${r.id}~${r.variant}` : r.id, r.lang, r.view, r.mode].join('__')

/**
 * An instrument's verdict from its rows. Exempt rows stay, with their reason;
 * an empty list is never a pass ("cannot determine": nothing measured), nor
 * is a list with nothing counted ("not applicable", with the reasons).
 * `exempt(row)` returns a reason or a falsy value.
 */
export function aggregate(items, { exempt = () => false, empty = 'cannot-determine', why } = {}) {
  const rows = items.map((i) => { const reason = EXEMPT.has(i.outcome) ? i.why ?? i.outcome : exempt(i); return reason ? { ...i, exempt: reason } : i })
  const counted = rows.filter((i) => !i.exempt)
  const n = { rows: rows.length, counted: counted.length, exempt: rows.length - counted.length }
  if (!rows.length) return { outcome: empty, why: why ?? 'nothing measured', ...n, items: rows }
  if (!counted.length) return { outcome: 'not-applicable', why: 'every row exempt: ' + [...new Set(rows.map((r) => String(r.exempt).slice(0, 60)))].join('; '), ...n, items: rows }
  const outcome = counted.some((i) => i.outcome === 'fail') ? 'fail' : counted.some((i) => i.outcome === 'cannot-determine') ? 'cannot-determine' : counted.every((i) => i.outcome === 'pass') ? 'pass' : 'cannot-determine'
  return { outcome, ...n, items: rows }
}

export class Run {
  static create(root, name, declared) {
    const runId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomBytes(3).toString('hex')
    const dir = join(root, `${name}-${runId}`)
    if (existsSync(dir)) throw new Error('run directory exists: ' + dir)
    mkdirSync(join(dir, 'captures'), { recursive: true })
    const keys = declared.map(recordKey)
    const dup = keys.filter((k, i) => keys.indexOf(k) !== i)
    if (dup.length) throw new Error('declared twice: ' + dup.join(', '))
    writeFileSync(join(dir, 'run.json'), JSON.stringify({ runId, name, created: new Date().toISOString(), declared }, null, 1))
    return new Run(dir)
  }
  constructor(dir) {
    this.dir = dir
    const meta = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8'))
    Object.assign(this, { runId: meta.runId, name: meta.name, declared: meta.declared })
    this.fixtures = new Set()
  }
  /** Writes one record, once. A second write of the same key is logged as a duplicate. */
  record(r, data) {
    const file = join(this.dir, recordKey(r) + '.json')
    if (existsSync(file)) {
      appendFileSync(join(this.dir, 'duplicates.log'), recordKey(r) + '\n')
      return file
    }
    writeFileSync(file, JSON.stringify({ runId: this.runId, key: recordKey(r), ...r, ...data }, (k, v) => (v && v.type === 'Buffer' ? undefined : v), 1))
    return file
  }
  /**
   * VH-172: the run resumed in place. A declared record already written and
   * ok is kept and skipped; one written but not ok is moved to superseded/
   * (kept, never counted) and measured again. Returns the keys to skip.
   */
  resume() {
    const meta = JSON.parse(readFileSync(join(this.dir, 'run.json'), 'utf8'))
    meta.resumes = [...(meta.resumes ?? []), new Date().toISOString()]
    writeFileSync(join(this.dir, 'run.json'), JSON.stringify(meta, null, 1))
    this.attempt = meta.resumes.length + 1
    const keep = new Set()
    for (const d of this.declared) {
      const k = recordKey(d), f = join(this.dir, k + '.json')
      if (!existsSync(f)) continue
      let rec = null
      try { rec = JSON.parse(readFileSync(f, 'utf8')) } catch { /* unreadable: measured again */ }
      if (rec && rec.status === 'ok' && !rec.stateExpired && rec.runId === this.runId) { keep.add(k); continue }
      mkdirSync(join(this.dir, 'superseded'), { recursive: true })
      renameSync(f, join(this.dir, 'superseded', `${k}~a${this.attempt - 1}.json`))
    }
    return keep
  }
  /** A capture or a persisted reading, under captures/, named by the caller with the full record key; never overwritten (a resumed attempt's own name takes ~a<n>). */
  artifact(name, data) {
    if (/[\\/]|^\./.test(name)) throw new Error('artifact name must be a plain file name: ' + name)
    if (this.attempt && existsSync(join(this.dir, 'captures', name))) name = name.replace(/(\.[a-z]+)$/, `~a${this.attempt}$1`)
    const file = join(this.dir, 'captures', name)
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(typeof data === 'string' ? data : JSON.stringify(data))
    writeFileSync(file, buf, { flag: 'wx' }) // throws EEXIST rather than overwrite
    const a = { path: 'captures/' + name, bytes: buf.length, sha256: sha(buf) }
    appendFileSync(join(this.dir, 'artifacts.jsonl'), JSON.stringify(a) + '\n')
    return a
  }
  /** A fixture the run used, hashed in the manifest. */
  useFixture(file) { this.fixtures.add(file) }
  verify() {
    const declared = new Map(this.declared.map((d) => [recordKey(d), d]))
    const problems = []
    const seen = new Set()
    for (const f of readdirSync(this.dir).filter((f) => f.endsWith('.json') && !RESERVED.has(f))) {
      let rec
      try { rec = JSON.parse(readFileSync(join(this.dir, f), 'utf8')) } catch { problems.push({ kind: 'unreadable', file: f }); continue }
      const k = basename(f, '.json')
      seen.add(k)
      if (rec.runId !== this.runId) problems.push({ kind: 'stale', key: k, runId: rec.runId })
      const d = declared.get(k)
      if (!d) { problems.push({ kind: 'undeclared', key: k }); continue }
      if (rec.key !== k || recordKey(rec) !== k) problems.push({ kind: 'identity', key: k, recorded: rec.key })
      if (rec.stateExpired) { problems.push({ kind: 'state-expired', key: k, why: rec.reachedAfter?.problems?.join('; ') ?? 'the state predicate no longer held after the instruments' }); continue }
      if (rec.status !== 'ok') { problems.push({ kind: 'failed', key: k, why: rec.error ?? rec.reached?.problems?.join('; ') ?? 'no status' }); continue }
      if (rec.reached?.outcome !== 'pass') problems.push({ kind: 'state', key: k, why: 'no passing state assertion' })
      for (const name of d.requires ?? []) {
        const ins = rec.instruments?.[name]
        if (!ins || !OUTCOMES.has(ins.outcome)) problems.push({ kind: 'missing-instrument', key: k, instrument: name, outcome: ins?.outcome })
      }
      for (const [name, ins] of Object.entries(rec.instruments ?? {}))
        if (ins?.outcome === 'pass' && Array.isArray(ins.items) && !ins.items.some((i) => !i.exempt && i.outcome === 'pass')) problems.push({ kind: 'empty-pass', key: k, instrument: name })
      if (d.viewport) {
        const got = rec.reached?.seen?.viewport
        const bad = !got || Object.entries(d.viewport).some(([q, v]) => got[q] !== v)
        if (bad) problems.push({ kind: 'wrong-view', key: k, expected: d.viewport, got: got ?? null })
      }
    }
    for (const k of declared.keys()) if (!seen.has(k)) problems.push({ kind: 'missing', key: k })
    if (existsSync(join(this.dir, 'duplicates.log')))
      for (const k of readFileSync(join(this.dir, 'duplicates.log'), 'utf8').split('\n').filter(Boolean)) problems.push({ kind: 'duplicate', key: k })
    return { whole: problems.length === 0, expected: declared.size, observed: seen.size, expectedKeys: [...declared.keys()].sort(), observedKeys: [...seen].sort(), problems }
  }
  records() {
    return readdirSync(this.dir).filter((f) => f.endsWith('.json') && !RESERVED.has(f)).map((f) => JSON.parse(readFileSync(join(this.dir, f), 'utf8')))
  }
  artifacts() {
    const p = join(this.dir, 'artifacts.jsonl')
    return existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []
  }
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 16)
/** The keys' identity, as VH-172's and VH-176's manifests hashed them (report-172.mjs). */
export const keysSha = (keys) => sha([...keys].sort().join('\n'))
/** The instrument revision: every walker file's hash, and one hash over them (one revision across every part). */
export function instrumentRevision() {
  const files = readdirSync(HERE).filter((f) => /\.(mjs|sh)$/.test(f)).sort().map((f) => ({ file: f, sha256: sha(readFileSync(join(HERE, f))) }))
  return { revision: sha(files.map((i) => i.sha256).join('')), files }
}

// What stayed unresolved, from the measurements: every "cannot determine",
// grouped by instrument and reason, kept apart as a missing measurement or an
// interpretation left to VH-173.
function unresolvedFrom(recs) {
  const groups = new Map()
  const add = (rec, name, row, fallback) => {
    const why = String(row.why ?? fallback ?? 'no reason given').replace(/\d+(\.\d+)?/g, 'n').slice(0, 140)
    const kind = row.unresolved ?? (/VH-173/.test(why) ? 'interpretation' : 'measurement')
    const k = [name, kind, why].join('|')
    const g = groups.get(k) ?? { instrument: name, kind, why, records: [], rows: 0 }
    g.rows++; if (!g.records.includes(rec.key)) g.records.push(rec.key)
    groups.set(k, g)
  }
  for (const rec of recs) for (const [name, ins] of Object.entries(rec.instruments ?? {})) {
    if (!ins) continue
    const rows = (ins.items ?? ins.steps ?? []).filter((r) => !r.exempt && r.outcome === 'cannot-determine')
    for (const r of rows) add(rec, name, r)
    if (ins.outcome === 'cannot-determine' && !rows.length) add(rec, name, ins, 'the instrument as a whole')
  }
  return [...groups.values()].map((g) => ({ ...g, recordCount: g.records.length, records: g.records.slice(0, 6) })).sort((a, b) => b.rows - a.rows)
}

/** The manifest: what ran, on what, and what stayed unresolved. */
export function writeManifest(run, { appRoot, browserVersion, browserCommandLine, fixtures = [], scaling, enlargement, unresolved = [] }) {
  const git = (...a) => { try { return execFileSync('git', ['-C', appRoot, ...a], { encoding: 'utf8' }).trim() } catch { return 'unknown' } }
  const v = run.verify()
  const recs = run.records()
  const tally = {}
  for (const r of recs) for (const [name, res] of Object.entries(r.instruments ?? {})) {
    if (!res) continue
    const t = (tally[name] ??= { pass: 0, fail: 0, 'cannot-determine': 0, 'not-applicable': 0, items: {} })
    t[res.outcome] = (t[res.outcome] ?? 0) + 1
    for (const it of res.items ?? res.steps ?? []) { const o = it.exempt ? 'exempt' : it.outcome; t.items[o] = (t.items[o] ?? 0) + 1 }
  }
  const arts = run.artifacts()
  writeFileSync(join(run.dir, 'artifacts.json'), JSON.stringify(arts, null, 1))
  const used = [...new Set([...fixtures, ...run.fixtures])].filter((f) => existsSync(f)).sort()
  const m = {
    run: run.runId,
    source: { commit: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain', '--', 'src', 'index.html', 'public') !== '' },
    instruments: instrumentRevision(),
    browser: browserVersion,
    // VH-198: the flags the pages ran under (visible pages need --disable-backgrounding-occluded-windows).
    browserCommandLine,
    os: `${platform()} ${release()} ${arch()}`,
    views: [...new Set(recs.map((r) => JSON.stringify({ view: r.view, actual: r.reached?.seen?.viewport, rootFontPx: r.reached?.seen?.rootFontPx })))].map((s) => JSON.parse(s)),
    scaling,
    enlargement,
    fixtures: used.map((f) => ({ file: basename(f), bytes: statSync(f).size, sha256: sha(readFileSync(f)) })),
    faults: [...new Set(recs.flatMap((r) => r.faults ?? []))],
    // Run completeness: every declared record present, whole and in its state and view.
    // VH-198: the keys' identity hashed, as VH-172's and VH-176's manifests (observedKeysSha256).
    coverage: { expected: v.expected, observed: v.observed, whole: v.whole, problems: v.problems, expectedKeysSha256: keysSha(v.expectedKeys), observedKeysSha256: keysSha(v.observedKeys), expectedKeys: v.expectedKeys, observedKeys: v.observedKeys },
    // Measurements, apart from completeness: what the instruments found.
    measurements: { failing: Object.fromEntries(Object.entries(tally).map(([k, t]) => [k, t.fail])), tally },
    artifacts: { count: arts.length, bytes: arts.reduce((s, a) => s + a.bytes, 0), listSha256: sha(JSON.stringify(arts)), list: 'artifacts.json (each capture: path, bytes, sha256)' },
    unresolved: { fromMeasurements: unresolvedFrom(recs), manual: unresolved },
  }
  writeFileSync(join(run.dir, 'manifest.json'), JSON.stringify(m, null, 1))
  return m
}

/** A record-by-record digest: each instrument's verdict, then what did not pass. */
export function writeDigest(run, { title = run.name, intro = '' } = {}) {
  const recs = run.records().sort((a, b) => a.key.localeCompare(b.key))
  const names = [...new Set(recs.flatMap((r) => Object.keys(r.instruments ?? {})))]
  const order = ['overflow', 'ax', 'targets', 'contrastText', 'contrastExtra', 'measure', 'type', 'focus', 'pressed', 'motion', 'keys']
  names.sort((a, b) => (order.indexOf(a) + 99 * (order.indexOf(a) < 0)) - (order.indexOf(b) + 99 * (order.indexOf(b) < 0)))
  const short = { 'cannot-determine': 'c-d', 'not-applicable': 'n/a' }
  const L = ['<!-- markdownlint-disable -->', `# ${title}`, '', intro, '', `| Record | ${names.join(' | ')} |`, `| --- |${names.map(() => ' --- |').join('')}`]
  for (const r of recs) L.push(`| ${r.key}${r.status !== 'ok' ? ' (' + (r.stateExpired ? 'state expired' : 'failed') + ')' : ''} | ${names.map((n) => { const o = r.instruments?.[n]?.outcome; return o ? short[o] ?? o : '—' }).join(' | ')} |`)
  L.push('', 'Not passing (rows, first four per instrument):', '')
  for (const r of recs) for (const n of names) {
    const ins = r.instruments?.[n]; if (!ins || ins.outcome === 'pass') continue
    const rows = (ins.items ?? ins.steps ?? []).filter((i) => !i.exempt && i.outcome !== 'pass').slice(0, 4)
    const say = (i) => [i.el ?? i.sel ?? i.key ?? i.text ?? '', i.areaAt3to1 !== undefined ? `${i.areaAt3to1} px² of ${i.perimeter2px}` : '', i.ratio !== undefined ? `${i.ratio}:1 need ${i.need}` : '', i.worst ? `${i.worst.chars} chars "${i.worst.text.slice(0, 40)}"` : '', i.why ?? ''].filter(Boolean).join(' ').replace(/\s+/g, ' ').slice(0, 200)
    const extra = n === 'overflow' ? [ins.hscroll ? `scrolls to ${ins.scrollWidth}` : '', ...(ins.clipped ?? []).slice(0, 2).map((c) => `clipped "${c.text}" by ${c.by}`), ...(ins.spills ?? []).slice(0, 2).map((c) => `spills "${c.text}" from ${c.by}`), ...(ins.offenders ?? []).filter((o) => o.outcome === 'fail').slice(0, 2).map((o) => `${o.el} [${o.left}..${o.right}]`)].filter(Boolean) : []
    L.push(`- ${r.key} — ${n} ${ins.outcome}: ${[...extra, ...rows.map(say)].join('; ') || ins.why || ''}`.slice(0, 600))
  }
  const text = L.join('\n') + '\n'
  writeFileSync(join(run.dir, 'digest.md'), text)
  return text
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === '--verify') {
  const v = new Run(process.argv[3]).verify()
  console.log(JSON.stringify(v, null, 1))
  process.exit(v.whole ? 0 : 1)
}
