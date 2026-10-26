// Codex astra's method check (25 October), M-03: a resume is refused once
// the walker, the source or a fixture differs from what the run pinned when
// it was created, before anything in the run is changed; its passing twin,
// unchanged, resumes, keeps the fixture ledger of the attempt before it, and
// ends whole. For the matrix (an interrupted run: killed after its first
// record) and for the transitions (a whole run, resumed). Everything happens
// in a scratch copy of the walker, never by changing the walker itself, with
// a scratch git repository standing for the source (APP_ROOT) and scratch
// copies of the fixtures it uses.
//
//   FIX=<fixtures> PROVE_DIR=<scratch> APP_URL=http://localhost:5182/ CDP_PORT=9252 \
//     node prove-resume.mjs          (headless Chrome, a Vite dev server)
import { spawn, execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync, appendFileSync, existsSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const { FIX, PROVE_DIR } = process.env
if (!FIX || !PROVE_DIR) throw new Error('set FIX and PROVE_DIR')
const D = join(PROVE_DIR, 'resume-' + new Date().toISOString().replace(/[:.]/g, '-'))
const WALKER = join(D, 'walker'), APP = join(D, 'app'), FIXTURES = join(D, 'fixtures'), RUNS = join(D, 'runs')
for (const d of [WALKER, join(APP, 'src'), FIXTURES, RUNS]) mkdirSync(d, { recursive: true })
for (const f of readdirSync(HERE).filter((f) => /\.(mjs|sh)$/.test(f))) copyFileSync(join(HERE, f), join(WALKER, f))
for (const f of ['prores-1080p.mov', 'notvideo.mp4', 'lecture-60s.mp4']) copyFileSync(join(FIX, f), join(FIXTURES, f))
const git = (...a) => execFileSync('git', ['-C', APP, ...a], { encoding: 'utf8' }).trim()
git('init', '-q')
writeFileSync(join(APP, 'src', 'a.ts'), 'export const a = 1\n')
git('add', '-A'); git('-c', 'user.name=prove', '-c', 'user.email=prove@localhost', 'commit', '-q', '-m', 'one')
const env = { ...process.env, APP_ROOT: APP, FIX: FIXTURES, RUN_ROOT: RUNS, OUT_ROOT: join(D, 'out') }
// The matrix's two records: S-29 chooses two fixtures; S-76 none. The run is killed once S-29 is recorded.
writeFileSync(join(D, 'driver.mjs'), `const { PLANS } = await import(${JSON.stringify(join(WALKER, 'scenarios.mjs'))})
PLANS['resume-proof'] = () => [{ id: 'S-29', lang: 'en-GB', view: 'w1280', mode: 'light' }, { id: 'S-76', lang: 'en-GB', view: 'w1280', mode: 'light' }]
process.argv = [process.argv[0], ${JSON.stringify(join(WALKER, 'matrix.mjs'))}, 'resume-proof']
await import(${JSON.stringify(join(WALKER, 'matrix.mjs'))})
`)
/** A child node process; `killOn` kills it once a line of its output matches. */
function node(args, { killOn } = {}) {
  return new Promise((done) => {
    const c = spawn(process.execPath, args, { env, cwd: D })
    let out = ''
    const take = (b) => { out += b; if (killOn && killOn.test(out) && c.exitCode === null) c.kill('SIGKILL') }
    c.stdout.on('data', take); c.stderr.on('data', take)
    c.on('close', (code, signal) => done({ code, signal, out }))
  })
}
const sha = (b) => createHash('sha256').update(b).digest('hex').slice(0, 16)
/** The run directory's state: every file's name, size and hash (captures/ by name and size). */
const snapshot = (dir) => { const walk = (d) => readdirSync(d).sort().flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [`${p.slice(dir.length)} ${statSync(p).size} ${/captures/.test(p) ? '' : sha(readFileSync(p))}`] }); return sha(walk(dir).join('\n')) }
const results = []
const prove = (fixture, wanted, outcome, proved, detail) => { results.push({ fixture, wanted, outcome, proved, detail }); console.log(`${proved ? 'PROVED' : 'NOT PROVED'}  ${fixture}: ${outcome} (wanted ${wanted})`) }

/** Each change: the resume refused, naming it, the run unchanged; then put back. */
async function refusals(kind, dir, resumeArgs) {
  const cases = [
    ['a changed walker file', () => { const f = join(WALKER, 'qualify.mjs'), b = readFileSync(f); appendFileSync(f, '\n// a changed line\n'); return () => writeFileSync(f, b) }, /instrument revision .* \(changed: qualify\.mjs\)/],
    ['a new source commit', () => { writeFileSync(join(APP, 'src', 'a.ts'), 'export const a = 2\n'); git('-c', 'user.name=prove', '-c', 'user.email=prove@localhost', 'commit', '-q', '-am', 'two'); return () => git('reset', '-q', '--hard', 'HEAD~1') }, /source commit /],
    ['an uncommitted source change', () => { writeFileSync(join(APP, 'src', 'a.ts'), 'export const a = 3\n'); return () => git('checkout', '-q', '--', 'src/a.ts') }, /source tree differs/],
    ['a changed fixture', () => { const f = join(FIXTURES, kind === 'matrix' ? 'notvideo.mp4' : 'lecture-60s.mp4'), b = readFileSync(f); appendFileSync(f, 'x'); return () => writeFileSync(f, b) }, /fixture (notvideo|lecture-60s)\.mp4 is /],
  ]
  for (const [what, change, says] of cases) {
    const before = snapshot(dir)
    const undo = change()
    const r = await node(resumeArgs)
    undo()
    const refused = r.code !== 0 && /resume refused/.test(r.out) && says.test(r.out)
    const unchanged = snapshot(dir) === before
    prove(`${kind}: resume after ${what}`, 'refused, the run unchanged', refused ? (unchanged ? 'refused, the run unchanged' : 'refused, but the run changed') : `not refused (exit ${r.code})`, refused && unchanged, r.out.split('\n').filter((l) => /resume refused| {2}(instrument|source|fixture)/.test(l)).slice(0, 3))
  }
}

// ---------------------------------------------------------------------------
// The matrix: created, interrupted after S-29's record.
const first = await node([join(D, 'driver.mjs')], { killOn: /recorded S-29__en-GB__w1280__light/ })
const runDir = readdirSync(RUNS).filter((d) => d.startsWith('resume-proof-')).map((d) => join(RUNS, d))[0]
const meta = runDir && JSON.parse(readFileSync(join(runDir, 'run.json'), 'utf8'))
const ledger0 = runDir && existsSync(join(runDir, 'fixtures.jsonl')) ? readFileSync(join(runDir, 'fixtures.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []
const recs0 = runDir ? readdirSync(runDir).filter((f) => /^S-.*\.json$/.test(f)) : []
const pinnedOk = !!meta?.provenance?.instruments?.revision && !!meta.provenance.source?.commit && meta.provenance.fixtures.length === 2
prove('matrix: provenance pinned at creation, the run interrupted after its first record', 'pinned, one record, two fixtures in the ledger', `${pinnedOk ? 'pinned' : 'not pinned'}, ${recs0.length} record(s), ${ledger0.length} in the ledger (killed: ${first.signal})`, pinnedOk && first.signal === 'SIGKILL' && recs0.length === 1 && ledger0.length === 2, { provenance: meta?.provenance && { source: meta.provenance.source, revision: meta.provenance.instruments.revision, fixtures: meta.provenance.fixtures }, ledger: ledger0 })
if (runDir) {
  await refusals('matrix', runDir, [join(WALKER, 'matrix.mjs'), '--resume', runDir])
  // The twin: nothing changed, the resume goes on, keeps S-29 and the ledger of the first attempt.
  const twin = await node([join(WALKER, 'matrix.mjs'), '--resume', runDir])
  const m = existsSync(join(runDir, 'manifest.json')) ? JSON.parse(readFileSync(join(runDir, 'manifest.json'), 'utf8')) : null
  const after = JSON.parse(readFileSync(join(runDir, 'run.json'), 'utf8'))
  const kept = m?.fixtures?.filter((f) => ['prores-1080p.mov', 'notvideo.mp4'].includes(f.file) && f.firstUsedInAttempt === 1) ?? []
  const s29 = JSON.parse(readFileSync(join(runDir, 'S-29__en-GB__w1280__light.json'), 'utf8'))
  const s76 = existsSync(join(runDir, 'S-76__en-GB__w1280__light.json')) ? JSON.parse(readFileSync(join(runDir, 'S-76__en-GB__w1280__light.json'), 'utf8')) : null
  const ok = twin.code === 0 && m?.coverage?.whole && m.provenance?.held && kept.length === 2 && (after.resumes ?? []).length === 1 && s29.attempt === 1 && s76?.attempt === 2 && !existsSync(join(runDir, 'superseded'))
  prove('matrix: resume with nothing changed (the twin)', 'resumed, whole, the first attempt\'s fixtures kept', ok ? 'resumed, whole, the ledger kept' : `exit ${twin.code}, whole ${m?.coverage?.whole}, held ${m?.provenance?.held}, kept ${kept.length}`, ok, { fixtures: m?.fixtures, provenance: m?.provenance, resumes: after.resumes, attempts: { 'S-29': s29.attempt, 'S-76': s76?.attempt }, problems: m?.coverage?.problems })
}

// ---------------------------------------------------------------------------
// The transitions: one walked whole, then resumed.
const t1 = await node([join(WALKER, 'transitions.mjs'), 'T-46e-ready'])
const tDir = readdirSync(RUNS).filter((d) => d.startsWith('transitions-')).map((d) => join(RUNS, d))[0]
const tm = tDir && JSON.parse(readFileSync(join(tDir, 'manifest.json'), 'utf8'))
const tr = tDir && JSON.parse(readFileSync(join(tDir, 'T-46e-ready__en-GB__light.json'), 'utf8'))
const contract = !!tm && !!tm.source?.commit && !!tm.instruments?.revision && tm.fixtures.some((f) => f.file === 'lecture-60s.mp4' && f.sha256) && tr.reached?.outcome === 'pass' && tm.views[0]?.actual?.w === 1280 && 'transitions' in tm && 'rings' in tm && (tr.ring?.outcome !== 'pass' && tr.ring?.outcome !== 'fail' || (!!tr.ringReading?.images?.off?.sha256 && !!tr.ringReading?.images?.on?.sha256))
prove('transitions: the run\'s contract (provenance, ledger, observed state, both ring images, verdicts apart)', 'all present', contract ? 'all present' : 'missing', contract && t1.code === 0, tm && { source: tm.source, revision: tm.instruments.revision, fixtures: tm.fixtures, views: tm.views, transitions: tm.transitions, rings: tm.rings, reached: tr.reached?.outcome, ring: tr.ring, images: tr.ringReading?.images, unresolved: tm.unresolved })
if (tDir) {
  await refusals('transitions', tDir, [join(WALKER, 'transitions.mjs'), '--resume', tDir])
  const twin = await node([join(WALKER, 'transitions.mjs'), '--resume', tDir])
  const m = JSON.parse(readFileSync(join(tDir, 'manifest.json'), 'utf8'))
  const ok = twin.code === 0 && m.coverage.whole && m.provenance.held && m.resumes.length === 1 && m.fixtures.some((f) => f.file === 'lecture-60s.mp4' && f.firstUsedInAttempt === 1)
  prove('transitions: resume with nothing changed (the twin)', 'resumed, whole, the ledger kept', ok ? 'resumed, whole, the ledger kept' : `exit ${twin.code}`, ok, { resumes: m.resumes, fixtures: m.fixtures, provenance: m.provenance })
}

writeFileSync(join(PROVE_DIR, 'prove-resume.json'), JSON.stringify({ dir: D, results }, null, 1))
console.log(`${results.filter((r) => r.proved).length} of ${results.length} proved; ${join(PROVE_DIR, 'prove-resume.json')}`)
process.exit(results.every((r) => r.proved) ? 0 : 1)
