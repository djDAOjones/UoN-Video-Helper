// PLAN-7 (VH-171): a run with no silent passes. The expected records are
// declared before the run; each lands in a fresh run directory, once, with
// the run's id; verify() fails the run on a missing, duplicate, stale,
// undeclared or failed record. The manifest says what ran, on what, and what
// stayed unresolved.
//
//   node runner.mjs --verify <run dir>     exits 1 when the run is not whole
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, appendFileSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { release, platform, arch } from 'node:os'

const HERE = dirname(fileURLToPath(import.meta.url))
const RESERVED = new Set(['run.json', 'manifest.json'])

export const recordKey = (r) => [r.id, r.lang, r.view, r.mode].join('__')

export class Run {
  static create(root, name, declared) {
    const runId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomBytes(3).toString('hex')
    const dir = join(root, `${name}-${runId}`)
    if (existsSync(dir)) throw new Error('run directory exists: ' + dir)
    mkdirSync(dir, { recursive: true })
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
  verify() {
    const want = new Set(this.declared.map(recordKey))
    const problems = []
    const seen = new Set()
    for (const f of readdirSync(this.dir).filter((f) => f.endsWith('.json') && !RESERVED.has(f))) {
      let rec
      try { rec = JSON.parse(readFileSync(join(this.dir, f), 'utf8')) } catch { problems.push({ kind: 'unreadable', file: f }); continue }
      const k = basename(f, '.json')
      if (rec.runId !== this.runId) problems.push({ kind: 'stale', key: k, runId: rec.runId })
      if (!want.has(k)) problems.push({ kind: 'undeclared', key: k })
      if (rec.status !== 'ok') problems.push({ kind: 'failed', key: k, why: rec.error ?? rec.reached?.problems?.join('; ') ?? 'no status' })
      seen.add(k)
    }
    for (const k of want) if (!seen.has(k)) problems.push({ kind: 'missing', key: k })
    if (existsSync(join(this.dir, 'duplicates.log')))
      for (const k of readFileSync(join(this.dir, 'duplicates.log'), 'utf8').split('\n').filter(Boolean)) problems.push({ kind: 'duplicate', key: k })
    return { whole: problems.length === 0, expected: want.size, observed: seen.size, problems }
  }
  records() {
    return readdirSync(this.dir).filter((f) => f.endsWith('.json') && !RESERVED.has(f)).map((f) => JSON.parse(readFileSync(join(this.dir, f), 'utf8')))
  }
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 16)

/** The manifest: what ran, on what, and what stayed unresolved. */
export function writeManifest(run, { appRoot, browserVersion, fixtures = [], scaling, unresolved = [] }) {
  const git = (...a) => { try { return execFileSync('git', ['-C', appRoot, ...a], { encoding: 'utf8' }).trim() } catch { return 'unknown' } }
  const instruments = readdirSync(HERE).filter((f) => /\.(mjs|sh)$/.test(f)).sort().map((f) => ({ file: f, sha256: sha(readFileSync(join(HERE, f))) }))
  const v = run.verify()
  const recs = run.records()
  const tally = {}
  for (const r of recs) for (const [name, res] of Object.entries(r.instruments ?? {})) {
    const t = (tally[name] ??= { pass: 0, fail: 0, 'cannot-determine': 0, items: { pass: 0, fail: 0, 'cannot-determine': 0 } })
    t[res.outcome] = (t[res.outcome] ?? 0) + 1
    for (const it of res.items ?? []) t.items[it.outcome] = (t.items[it.outcome] ?? 0) + 1
  }
  const m = {
    run: run.runId,
    source: { commit: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain', '--', 'src', 'index.html', 'public') !== '' },
    instruments: { revision: sha(instruments.map((i) => i.sha256).join('')), files: instruments },
    browser: browserVersion,
    os: `${platform()} ${release()} ${arch()}`,
    views: [...new Set(recs.map((r) => JSON.stringify({ view: r.view, actual: r.reached?.seen?.viewport, rootFontPx: r.reached?.seen?.rootFontPx })))].map((s) => JSON.parse(s)),
    scaling,
    fixtures: fixtures.map((f) => ({ file: basename(f), bytes: statSync(f).size, sha256: sha(readFileSync(f)) })),
    coverage: { expected: v.expected, observed: v.observed, whole: v.whole, problems: v.problems },
    tally,
    unresolved,
  }
  writeFileSync(join(run.dir, 'manifest.json'), JSON.stringify(m, null, 1))
  return m
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === '--verify') {
  const v = new Run(process.argv[3]).verify()
  console.log(JSON.stringify(v, null, 1))
  process.exit(v.whole ? 0 : 1)
}
