// PLAN-8's one-page table (the owner's fifth change), built by VH-217 from VH-216's records-2.mjs and compare-2.mjs; outside the walker, for later items to reuse.
// From a walk folder's groups it writes one Markdown page and, beside it, the records folder: each cell's outcomes and rows, the probes, states and logs, whole; a moved cell's whole record, and with --detail-failing an instrument's failing cells'; the page generated, nothing typed but the notes.
// --overlay: a later group's states readings replace an earlier group's, by condition and state, the earlier kept in the records.
//   node table-1page.mjs --walk <dir> --pairs before-a:after-a,before-b:after-b [--states before-states:after-states] [--overlay before-states=before-more,after-states=after-more] [--superseded before-e] [--detail-failing focus] \
//     --title "…" --item VH-217 --out <page.md> --records <dir> [--notes <notes.md>] [--sources a.mjs,b.sh] [--self <this file>]
// A walk folder holds <group>/{conditions.txt,runs/}, <group>.load.log and <group>.launcher.log, as go.sh and walk.sh write them. Neither --out nor --records may exist.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { basename, join } from 'node:path'

const args = (() => { const a = process.argv.slice(2), o = {}; for (let i = 0; i < a.length; i += 2) o[a[i].replace(/^--/, '')] = a[i + 1]; return o })()
for (const need of ['walk', 'pairs', 'title', 'item', 'out', 'records']) if (!args[need]) throw new Error(`--${need} is required`)
for (const p of [args.out, args.records]) if (existsSync(p)) throw new Error(`exists, never rewritten: ${p}`)
const WALK = args.walk, list = (s) => (s ? s.split(',').filter(Boolean) : [])
const pairsOf = (s) => list(s).map((p) => p.split(':'))
const pairs = pairsOf(args.pairs), statePairs = pairsOf(args.states), superseded = list(args.superseded)
const overlay = Object.fromEntries(list(args.overlay).map((p) => p.split('=')))
const groups = [...new Set([...pairs.flat(), ...statePairs.flat(), ...Object.values(overlay)])]
const sha = (p) => createHash('sha1').update(readFileSync(p)).digest('hex')
const pk = (o) => JSON.stringify(o)
const text = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const jsonl = (p) => text(p).trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))

// The walk's own lines: what ran on which tree, at what power and load.
const conditionsOf = (g) => {
  const c = text(join(WALK, g, 'conditions.txt')), one = (re) => re.exec(c)?.[1] ?? '?'
  const load = text(join(WALK, `${g}.load.log`)).trim().split('\n').filter(Boolean).map((l) => l.split(' '))
  const nums = load.map((x) => Number(x[2])).filter(Number.isFinite).sort((a, b) => a - b)
  const sources = [...new Set(load.map((x) => x.slice(3, -2).join(' ')))]
  const high = load.filter((x) => Number(x[2]) >= 8)
  return { commit: one(/commit (\w+)/), porcelain: one(/porcelain lines (\d+)/), diff: one(/diff hash (\w+)/), revision: one(/instrument revision (\w+)/), start: one(/start \S*T(\d\d:\d\d:\d\d)/), end: one(/end \S*T(\d\d:\d\d:\d\d)/),
    power: `${sources.join(', ') || one(/drawing from '(.*?)'/)}, mode ${one(/powermode\s+(\d)/)}`, median: nums[Math.floor(nums.length / 2)] ?? '?', peak: nums.at(-1) ?? '?', high: high.length, samples: load.length }
}
const load = (g) => {
  const runs = join(WALK, g, 'runs'), cells = {}, probe = {}
  if (!existsSync(runs)) return { cells, probe }
  for (const e of readdirSync(runs)) {
    const p = join(runs, e)
    if (statSync(p).isDirectory()) { for (const f of readdirSync(p).filter((x) => /^S-\d+.*\.json$/.test(x))) cells[f.replace('.json', '')] = JSON.parse(readFileSync(join(p, f), 'utf8')) }
    else if (/-probe-/.test(e)) for (const j of jsonl(p)) probe[`${j.cell}/${j.mode}`] = j
  }
  return { cells, probe }
}
const inst = (c) => Object.fromEntries(Object.entries(c.instruments ?? {}).filter(([k]) => k !== 'asserts').map(([k, v]) => [k, v?.outcome]))
const rows = (c) => Object.fromEntries((c.instruments?.asserts?.items ?? []).map((i) => [i.what, i.outcome]))
const reachedAll = (cells) => Object.values(cells).filter((c) => c.reached?.outcome === 'pass').length

// The records: per-cell outcomes, probes, states, ledgers, conditions, load and launcher logs, with a sources list of sha1s.
mkdirSync(args.records, { recursive: true })
const src = []
const cp = (from, to) => { copyFileSync(from, join(args.records, to)); src.push(`${sha(join(args.records, to))}  ${to}  ${basename(WALK)}/${from.startsWith(WALK) ? from.slice(WALK.length + 1) : from}`) }
for (const g of [...groups, ...superseded]) {
  for (const [f, t] of [[`${g}/conditions.txt`, `${g}.conditions.txt`], [`${g}.load.log`, `${g}.load.log.txt`], [`${g}.launcher.log`, `${g}.launcher.log.txt`]]) if (existsSync(join(WALK, f))) cp(join(WALK, f), t)
  const runs = join(WALK, g, 'runs'), out = []
  if (!existsSync(runs)) continue
  for (const e of readdirSync(runs).sort()) {
    const p = join(runs, e)
    if (!statSync(p).isDirectory()) { if (e.endsWith('.jsonl')) cp(p, `${g}.${e}`); continue }
    for (const f of ['manifest.json', 'run.json']) if (existsSync(join(p, f))) cp(join(p, f), `${g}.${e.replace(/-2026.*$/, '')}.${f}`)
    for (const f of readdirSync(p).filter((x) => /^S-\d+.*\.json$/.test(x)).sort()) {
      const j = JSON.parse(readFileSync(join(p, f), 'utf8')), [id, lang, view, mode] = f.replace('.json', '').split('__')
      out.push(pk({ run: e, id, lang, view, mode, status: j.status, reached: j.reached?.outcome, why: j.reached?.why ?? j.reached?.problems ?? null, outcomes: inst(j), rows: (j.instruments?.asserts?.items ?? []).map((i) => ({ what: i.what, outcome: i.outcome })) }))
    }
  }
  if (out.length) { const t = `${g}.outcomes.jsonl`; writeFileSync(join(args.records, t), out.join('\n') + '\n'); src.push(`${sha(join(args.records, t))}  ${t}  written from ${g}/runs`) }
}
for (const s of list(args.sources)) cp(s, basename(s))
if (args.self) cp(args.self, basename(args.self))
if (args.notes) cp(args.notes, basename(args.notes))

// Before against after, cell by cell.
const moves = {}, alike = {}, add = (m, k, v) => (m[k] ??= []).push(v)
const missing = { before: [], after: [] }
let cellsA = 0, cellsB = 0, reachedA = 0, reachedB = 0, same = 0, probeFields = {}, probeCount = 0
for (const [ga, gb] of pairs) {
  const A = load(ga), B = load(gb)
  cellsA += Object.keys(A.cells).length; cellsB += Object.keys(B.cells).length; reachedA += reachedAll(A.cells); reachedB += reachedAll(B.cells)
  for (const k of Object.keys(B.cells)) if (!A.cells[k]) missing.before.push(k)
  for (const [k, a] of Object.entries(A.cells)) {
    const b = B.cells[k]; if (!b) { missing.after.push(k); continue }
    let moved = false
    if (a.status !== b.status || a.reached?.outcome !== b.reached?.outcome) { add(moves, `reached: ${a.status}/${a.reached?.outcome} → ${b.status}/${b.reached?.outcome}`, k); moved = true }
    const ia = inst(a), ib = inst(b), ra = rows(a), rb = rows(b)
    for (const n of new Set([...Object.keys(ia), ...Object.keys(ib)])) { if (ia[n] !== ib[n]) { add(moves, `${n}: ${ia[n]} → ${ib[n]}`, k); moved = true } else if (ia[n] === 'fail') add(alike, n, k) }
    for (const n of new Set([...Object.keys(ra), ...Object.keys(rb)])) { if (ra[n] !== rb[n]) { add(moves, `row "${n.slice(0, 70)}": ${ra[n]} → ${rb[n]}`, k); moved = true } else if (ra[n] === 'fail') add(alike, `row "${n.slice(0, 70)}"`, k) }
    if (!moved) same++
    if (moved || list(args['detail-failing']).some((n) => ia[n] === 'fail' || ib[n] === 'fail')) for (const [g, c] of [[ga, a], [gb, b]]) {
      mkdirSync(join(args.records, 'detail'), { recursive: true })
      const t = join('detail', `${g}.${k}.json`); writeFileSync(join(args.records, t), JSON.stringify(c)); src.push(`${sha(join(args.records, t))}  ${t}  written from ${g}/runs`)
    }
  }
  for (const [k, a] of Object.entries(A.probe)) {
    const b = B.probe[k]; if (!b) continue
    probeCount++
    for (const f of new Set([...Object.keys(a), ...Object.keys(b)])) if (!['at', 'walk', 'plan'].includes(f) && pk(a[f]) !== pk(b[f])) add(probeFields, f, k)
  }
}
const ranOn = (v) => { const x = {}; for (const c of v) { const [s, , vw, m] = c.split('__'); for (const t of [s, vw, m]) x[t] = (x[t] ?? 0) + 1 } return x }
const show = (v) => (v.length <= 4 ? v.join(', ') : `${v.length}; ${Object.entries(ranOn(v)).filter(([, n]) => n === v.length).map(([t]) => t).join(', ') || 'across cells'}`)

// The states probe, flattened: each field that moved, how often, and its commonest before → after.
const flat = (o, pre = '', out = {}) => { for (const [k, v] of Object.entries(o ?? {})) { if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, `${pre}${k}.`, out); else out[`${pre}${k}`] = pk(v) } return out }
const stateMoves = {}
let stateA = 0, stateB = 0, stateSame = 0
for (const [ga, gb] of statePairs) {
  const one = (g) => Object.fromEntries(readdirSync(join(WALK, g, 'runs')).filter((f) => /states.*\.jsonl$/.test(f)).flatMap((f) => jsonl(join(WALK, g, 'runs', f))).map((r) => [[r.lang, r.view, r.mode, r.which, r.state].join('/'), r]))
  const read = (g) => ({ ...one(g), ...(overlay[g] ? one(overlay[g]) : {}) })
  const A = read(ga), B = read(gb); stateA += Object.keys(A).length; stateB += Object.keys(B).length
  for (const [k, a] of Object.entries(A)) {
    const b = B[k]; if (!b) continue
    const fa = flat(a), fb = flat(b); let moved = false
    for (const f of new Set([...Object.keys(fa), ...Object.keys(fb)])) if (fa[f] !== fb[f]) { moved = true; const m = (stateMoves[f] ??= { n: 0, pairs: {} }); m.n++; const p = `${fa[f]} → ${fb[f]}`; m.pairs[p] = (m.pairs[p] ?? 0) + 1 }
    if (!moved) stateSame++
  }
}

// The page.
const P = [`<!-- markdownlint-disable -->`, `# ${args.title}`, '', `${args.item}'s stage-rule measure, one page by \`table-1page.mjs\`. The records are in [\`${basename(args.records)}/\`](${basename(args.records)}/): each cell's outcomes and rows, the probes, states and logs whole, and in \`detail/\` the whole record of each moved or named failing cell.`, '']
const first = conditionsOf(pairs[0][0]), last = conditionsOf(pairs[0][1])
P.push('## Provenance', '', '| | Before | After |', '| --- | --- | --- |', `| Commit | \`${first.commit.slice(0, 12)}\` | \`${last.commit.slice(0, 12)}\` |`, `| Diff hash | \`${first.diff}\` (${first.porcelain} lines of status) | \`${last.diff}\` (${last.porcelain} lines of status) |`, `| Instrument revision | \`${first.revision}\` | \`${last.revision}\` |`, '')
const vary = (f) => [...new Set(groups.map((g) => conditionsOf(g)[f]))]
for (const [f, name] of [['commit', 'commit'], ['diff', 'diff hash'], ['revision', 'revision']]) if (vary(f).length > 2) P.push(`**Differs between groups:** ${name}: ${vary(f).join(', ')}.`, '')
for (const s of list(args.sources)) P.push(`- \`${basename(s)}\` sha1 \`${sha(s)}\``)
if (list(args.sources).length) P.push('')
P.push('## Runs, power and load', '', '| Group | UTC | Cells, reached | Power | Load median, peak | Samples at 8 or above |', '| --- | --- | --- | --- | --- | --- |')
for (const g of [...groups, ...superseded]) {
  const c = conditionsOf(g), { cells } = load(g), n = Object.keys(cells).length
  P.push(`| ${g}${superseded.includes(g) ? ' (set aside)' : ''} | ${c.start}–${c.end} | ${n ? `${n}, ${reachedAll(cells)}` : 'probe'} | ${c.power} | ${c.median}, ${c.peak} | ${c.high} of ${c.samples} |`)
}
P.push('', '## Before → after', '', `Scenario cells: ${cellsA} before (${reachedA} reached), ${cellsB} after (${reachedB} reached); **${same} unmoved**. Not on the other side: ${missing.before.length} after-only, ${missing.after.length} before-only.`, '')
const entries = Object.entries(moves).sort(([, a], [, b]) => b.length - a.length)
if (entries.length) { P.push('| What moved | Cells |', '| --- | --- |'); for (const [m, v] of entries) P.push(`| ${m.replace(/\|/g, '\\|')} | ${show(v)} |`); P.push('') } else P.push('Nothing moved, row by row.', '')
const fa = Object.entries(alike).sort(([, a], [, b]) => b.length - a.length)
if (fa.length) { P.push('Failing alike on both sides, so not moved by this change:', '', '| Instrument or row | Cells |', '| --- | --- |'); for (const [m, v] of fa) P.push(`| ${m.replace(/\|/g, '\\|')} | ${v.length} |`); P.push('') }
const pf = Object.entries(probeFields).sort(([, a], [, b]) => b.length - a.length)
if (probeCount) P.push(`Page probe, ${probeCount} readings a side: ${pf.length ? pf.map(([f, v]) => `\`${f}\` moved in ${v.length}`).join('; ') : 'nothing moved'}.`, '')
if (statePairs.length) {
  P.push(`States probe: ${stateA} readings before, ${stateB} after; ${stateSame} unmoved.`, '')
  const sm = Object.entries(stateMoves).sort(([, a], [, b]) => b.n - a.n)
  if (sm.length) { P.push('| Field | Readings moved | Commonest before → after |', '| --- | --- | --- |'); for (const [f, m] of sm) { const top = Object.entries(m.pairs).sort(([, a], [, b]) => b - a)[0]; P.push(`| \`${f}\` | ${m.n} | ${top[0].replace(/\|/g, '\\|').replace(/"/g, '')} (${top[1]}) |`) } P.push('') }
}
if (args.notes) P.push('## Notes', '', text(args.notes).trim(), '')
writeFileSync(join(args.records, 'sources.txt'), src.join('\n') + '\n')
writeFileSync(args.out, P.join('\n'))
console.log(`${args.out}: ${P.join('\n').split(/\s+/).length} words, ${src.length} files in the records`)
