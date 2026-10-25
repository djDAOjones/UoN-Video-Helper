// VH-198: the third pass's matrix in its five parts (plan-2026-10-25.md,
// "The matrix"), declared by sizing-2026-10-25.mjs's recipes, and split into
// resumable runs of whole scenarios ("Running it"). The recipes are the
// sizing script's, restated here because that script only prints counts;
// `check` holds the two to each other, count by count (the script run as the
// plan names it) and key by key (its own sets, read from its source), and
// fails on any difference beyond the records of a source-only scenario.
//
//   node parts.mjs check          the parts and runs against the sizing script (exit 1 on a difference)
//   node parts.mjs list           each part and run: records, scenarios, estimate
//   node matrix.mjs part3         a part by name (part1, part2, part3, part3b, part4)
//   node matrix.mjs run-04        a run by name (run-01 to run-12); --resume <dir> as before
//   node transitions.mjs --plan run-03    part 2's transitions, the run that holds them
//
// Part 1 is PLANS.priority, carried. Part 2 is the fix plans' keys beyond it
// and VH-178's transitions, as VH-176 measured them. Part 3 is Phase 8 in
// full. Part 3b is every other walked scenario in the nine light cells.
// Part 4 is the routes whole, less part 1's. A key held by two parts is
// walked once, in the first; its press list is the union of every plan's
// (the plan: as VH-176 re-ran five S-03 records with VH-179's wider list).
import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCENARIOS, ROUTES, PLANS, TRANSITIONS, SOURCE_ONLY, estimate } from './scenarios.mjs'
import { keysSha, recordKey } from './runner.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
export const SIZING = process.env.SIZING ?? resolve(HERE, '../../../sizing-2026-10-25.mjs')

// The plan's table: no part is smaller than this, but by a source-only
// scenario's approved contingency (below).
export const PLAN_COUNTS = { 1: 699, 2: 205, 3: 2162, '3b': 184, 4: 16 }
const ORDER = ['1', '2', '3', '3b', '4']
// Part 1 is VH-172's 699 keys: their hash in VH-172's and VH-176's manifests
// (matrix-manifest-2026-10-23.json, after-manifest-2026-10-24.json).
export const PART1_KEYS_SHA = '7a700694a512de97'
// Source-only scenarios the recipes still name, each with the contingency
// that allows it. S-154's recipe is empty (NONE), so it names no record.
export const CONTINGENT = {
  'S-104': 'scenarios-2026-10-25.md:144, "walked if the pilot shows N11 reads with no duration; otherwise source-only"; N11 reads as 10 seconds (fixtures-proof-2026-10-25.json)',
}

// ---------------------------------------------------------------------------
// The recipes, as sizing-2026-10-25.mjs states them.
const L = ['en-GB', 'zh-Hans', 'ms-MY']
const LV = ['w1280', 'w375', 'w320']
const C = ['dark', 'forced-light', 'forced-dark']
const rec = (id, lang, view, mode) => ({ id, lang, view, mode })
// A scenario the walker declares narrower keeps its own languages and views;
// one the walker does not hold (a source-only scenario) passes, as the script counts it.
const fits = (r) => !SCENARIOS[r.id] || ((!SCENARIOS[r.id].langs || SCENARIOS[r.id].langs.includes(r.lang)) && (!SCENARIOS[r.id].views || SCENARIOS[r.id].views.includes(r.view)))
const LIGHT9 = (id) => L.flatMap((l) => LV.map((v) => rec(id, l, v, 'light')))
const WORDS12 = (id) => [...LIGHT9(id), ...L.map((l) => rec(id, l, 'w320', 'spacing'))]
const FULL = (id) => [
  ...WORDS12(id),
  ...L.flatMap((l) => C.map((m) => rec(id, l, 'w1280', m))),
  ...C.map((m) => rec(id, 'en-GB', 'w320', m)),
  ...L.flatMap((l) => ['font32', 'fallback'].map((m) => rec(id, l, 'w1280', m))),
  rec(id, 'en-GB', 'w1280', 'reduced-motion'),
]
const OUTCOME4 = (id) => [...L.map((l) => rec(id, l, 'w1280', 'light')), rec(id, 'en-GB', 'w320', 'light')]
const ONE = (id) => [rec(id, 'en-GB', 'w1280', 'light')]
const NONE = () => []
const COLOUR12 = (id) => L.flatMap((l) => ['light', ...C].map((m) => rec(id, l, 'w1280', m)))
const NEW = {}
for (let n = 92; n <= 154; n++) NEW[`S-${n}`] = FULL
Object.assign(NEW, {
  'S-93': OUTCOME4, 'S-94': ONE, 'S-100': OUTCOME4, 'S-101': ONE, 'S-102': ONE,
  'S-112': (id) => L.flatMap((l) => ['w401', 'w400', 'w375', 'w320'].map((v) => rec(id, l, v, 'light'))),
  'S-113': (id) => L.flatMap((l) => ['w1280', 'w640', 'w401', 'w320'].map((v) => rec(id, l, v, 'font32'))),
  'S-115': OUTCOME4, 'S-118': OUTCOME4, 'S-123': OUTCOME4, 'S-124': OUTCOME4,
  'S-130': (id) => L.map((l) => rec(id, l, 'w375', 'light')),
  'S-131': OUTCOME4, 'S-132': OUTCOME4, 'S-133': OUTCOME4, 'S-134': ONE, 'S-136': OUTCOME4, 'S-138': OUTCOME4, 'S-139': ONE,
  'S-140': (id) => [rec(id, 'en-GB', 'w1280', 'light'), rec(id + 'n', 'en-GB', 'w1280', 'light')],
  'S-144': (id) => [rec(id, 'en-GB', 'w320', 'light'), ...L.flatMap((l) => ['w1280', 'w800', 'w375', 'w320'].map((v) => rec(id + 'p', l, v, 'light')))],
  'S-149': COLOUR12, 'S-150': COLOUR12, 'S-151': OUTCOME4, 'S-152': OUTCOME4, 'S-153': ONE, 'S-154': NONE,
})
const LOOK = ['S-03', 'S-04', 'S-07', 'S-14', 'S-15', 'S-17', 'S-24', 'S-36', 'S-40', 'S-41', 'S-43', 'S-46', 'S-47a', 'S-47b', 'S-47c', 'S-48', 'S-53', 'S-53-W', 'S-53-LW', 'S-55a', 'S-55b', 'S-55c', 'S-58', 'S-58-W', 'S-58-LW', 'S-63', 'S-63-W', 'S-63-LW', 'S-64', 'S-75', 'S-76', 'S-77', 'S-83']
const WORDS = ['S-01', 'S-01b', 'S-02', 'S-06a', 'S-08', 'S-16', 'S-23', 'S-30', 'S-31', 'S-45b', 'S-52', 'S-56', 'S-57', 'S-71', 'S-78', 'S-78k', 'S-79a', 'S-79b', 'S-80a', 'S-80b', 'S-81', 'S-82', 'S-86', 'S-89', 'S-90a', 'S-90b', 'S-91']
const STATE = ['S-50', 'S-54a', 'S-54b', 'S-54c', 'S-54d', 'S-59', 'S-60', 'S-61', 'S-62', 'S-65', 'S-66', 'S-67', 'S-68', 'S-69', 'S-70a', 'S-70b', 'S-70c', 'S-72a', 'S-72b', 'S-88']
const HEAVY = new Set(['S-24', 'S-48', 'S-50', 'S-43', 'S-49', 'S-57', 'S-85', 'S-90a', 'S-90b', 'S-61', 'S-65', 'S-66', 'S-72a', 'S-60'])
const F8 = ['S-53', 'S-126', 'S-127', 'S-135', 'S-17', 'S-141', 'S-83', 'S-119']
// The script's estimate: the walker's, plus the slow Phase 8 setups, scaled by VH-176's ratio.
const RATIO = 8130 / 11324
const SLOW8 = { 'S-93': 130, 'S-94': 200, 'S-100': 40, 'S-101': 40, 'S-102': 40, 'S-115': 60, 'S-118': 70, 'S-122': 30, 'S-123': 150, 'S-124': 160, 'S-128': 30, 'S-129': 40, 'S-130': 40, 'S-131': 60, 'S-132': 40, 'S-133': 140, 'S-134': 40, 'S-135': 50, 'S-136': 50, 'S-137': 60, 'S-138': 90, 'S-139': 40, 'S-140': 900, 'S-140n': 120, 'S-149': 40, 'S-150': 40, 'S-151': 60, 'S-152': 60, 'S-153': 40, J1: 120, J2: 40, J3: 90, J4: 120, 'K-dialog': 20, 'K-player': 60 }
export function est(a) {
  const seen = new Set()
  let extra = 0
  for (const r of a) {
    const g = [r.id, r.lang, r.view].join('|')
    if (SLOW8[r.id] && !seen.has(g)) extra += SLOW8[r.id] - 12
    seen.add(g)
  }
  return Math.round((estimate(a) + extra) * RATIO)
}
const TRANSITIONS_S = 1250 // VH-176's two transition runs (after-run-2026-10-24.md)

// ---------------------------------------------------------------------------
export const key = (r) => [r.id, r.lang, r.view, r.mode].join('|')
const union = (...lists) => [...new Set(lists.flat().filter(Boolean))]

function build() {
  const pri = PLANS.priority()
  const priK = new Set(pri.map(key))
  // Every fix plan's press list, by key.
  const fixPlans = { vh179: PLANS.vh179(), vh180: PLANS.vh180(), vh181: PLANS.vh181() }
  const press = new Map()
  for (const rs of Object.values(fixPlans)) for (const r of rs) if (r.pressed) press.set(key(r), union(press.get(key(r)), r.pressed))
  // Part 1: the frozen keys, each press list widened by the fix plans' where they hold the key.
  const part1 = pri.map((r) => {
    const p = union(r.pressed, press.get(key(r)))
    const widened = p.length > (r.pressed?.length ?? 0)
    return { ...r, ...(p.length ? { pressed: p } : {}), ...(widened ? { pressedWidened: (r.pressed ?? []).length } : {}), part: '1' }
  })
  // Part 2: the fix plans' own keys beyond part 1, once each, naming every plan that holds it.
  const fixes = new Map()
  for (const [plan, rs] of Object.entries(fixPlans)) for (const r of rs) {
    const k = key(r)
    if (priK.has(k)) continue
    const was = fixes.get(k)
    fixes.set(k, was ? { ...was, plans: union(was.plans, [plan]) } : { ...rec(r.id, r.lang, r.view, r.mode), plans: [plan] })
  }
  const part2 = [...fixes.values()].map((r) => ({ ...r, ...(press.has(key(r)) ? { pressed: press.get(key(r)) } : {}), part: '2' }))
  const fixK = new Set(part2.map(key))
  // Part 3: Phase 8 in full; a key already held is not walked twice.
  const p3 = new Map()
  const add = (r, why) => { if (!fits(r)) return; const k = key(r); if (priK.has(k) || fixK.has(k) || p3.has(k)) return; p3.set(k, { ...r, part: '3', why }) }
  for (const [id, f] of Object.entries(NEW)) for (const r of f(id)) add(r, 'new')
  for (const id of LOOK) for (const r of (HEAVY.has(id) ? OUTCOME4 : FULL)(id)) add(r, 'look')
  for (const id of WORDS) for (const r of (HEAVY.has(id) ? OUTCOME4 : WORDS12)(id)) add(r, 'words')
  for (const id of STATE) for (const r of (HEAVY.has(id) ? OUTCOME4 : LIGHT9)(id)) add(r, 'state')
  for (const id of F8) {
    for (const v of ['landscape', 'short', 'zoom200proxy', 'zoom400proxy']) add(rec(id, 'en-GB', v, 'light'), 'finite')
    for (const l of ['zh-Hans', 'ms-MY']) for (const v of ['zoom200proxy', 'zoom400proxy']) add(rec(id, l, v, 'light'), 'finite')
  }
  // Part 3b: VH-199's criterion, every other walked scenario in the nine light cells.
  const rest = new Map()
  for (const id of Object.keys(SCENARIOS).filter((i) => !SCENARIOS[i].fixOnly))
    for (const r of (HEAVY.has(id) ? OUTCOME4 : LIGHT9)(id)) {
      const k = key(r)
      if (fits(r) && !priK.has(k) && !fixK.has(k) && !p3.has(k)) rest.set(k, { ...r, part: '3b', why: 'light9' })
    }
  // Part 4: the routes whole, less part 1's.
  const routes = ['J1', 'J2', 'J3', 'J4', 'K-dialog', 'K-player'].flatMap((id) => OUTCOME4(id)).filter((r) => !priK.has(key(r))).map((r) => ({ ...r, part: '4' }))
  // As the script counts them, then less a source-only scenario's records.
  const counted = { 1: part1, 2: part2, 3: [...p3.values()], '3b': [...rest.values()], 4: routes }
  const dropped = []
  const parts = {}
  for (const p of ORDER) {
    const rs = counted[p]
    parts[p] = []
    for (const r of rs) {
      if (SCENARIOS[r.id] || ROUTES[r.id]) parts[p].push(r)
      else if (SOURCE_ONLY[r.id]) dropped.push(r)
      else throw new Error(`part ${p} names ${r.id}, which the walker neither holds nor declares source-only`)
    }
  }
  // Part 2's transitions, as VH-176 measured them: all twelve in English at
  // 1280 px, light, then the three cases in three languages and four colour
  // modes. The three English light keys are in both sets, as they were then.
  const transitions = [
    ...Object.keys(TRANSITIONS).map((id) => ({ set: 'all', id, lang: 'en-GB', view: 'w1280', mode: 'light', part: '2' })),
    ...['T-46.1', 'T-46.2', 'T-46.3'].flatMap((id) => L.flatMap((lang) => ['light', 'dark', 'forced-light', 'forced-dark'].map((mode) => ({ set: 'cases', id, lang, view: 'w1280', mode, part: '2' })))),
  ]
  // The records as the script holds them (its press lists: priority's own; a fix key's last plan's), for its estimate.
  const asScript = { ...counted, 1: pri, 2: [...new Map(Object.values(fixPlans).flat().filter((r) => !priK.has(key(r))).map((r) => [key(r), r])).values()] }
  return { counted, asScript, parts, dropped, transitions }
}

// ---------------------------------------------------------------------------
// The runs: each part split into about an hour's work by the script's
// estimate, a scenario's records of that part in one run (largest first, to
// the lightest run). A run never mixes parts. Part 2's transitions are in its
// run. The split is frozen by RUNS_SHA: a change to it fails `check`.
const TARGET_S = 3600
export const RUNS_SHA = '05493ee20ebbfc06'
function split(records) {
  const ids = [...new Set(records.map((r) => r.id))]
  const by = Object.fromEntries(ids.map((id) => [id, records.filter((r) => r.id === id)]))
  const cost = Object.fromEntries(ids.map((id) => [id, est(by[id])]))
  const k = Math.max(1, Math.round(est(records) / TARGET_S))
  const bins = Array.from({ length: k }, () => ({ ids: new Set(), s: 0 }))
  for (const id of [...ids].sort((a, b) => cost[b] - cost[a] || ids.indexOf(a) - ids.indexOf(b))) {
    const bin = bins.reduce((m, x) => (x.s < m.s ? x : m))
    bin.ids.add(id)
    bin.s += cost[id]
  }
  return bins.map((b) => records.filter((r) => b.ids.has(r.id)))
}

const BUILT = build()
export const PARTS = ORDER.map((part) => ({ part, name: `part${part}`, records: BUILT.parts[part], transitions: part === '2' ? BUILT.transitions : [] }))
export const RUNS = []
for (const p of PARTS) for (const records of split(p.records)) {
  const name = `run-${String(RUNS.length + 1).padStart(2, '0')}`
  RUNS.push({ name, part: p.part, records, ids: [...new Set(records.map((r) => r.id))], transitions: [] })
}
// Part 2's transitions go with the part's (one) run.
RUNS.find((r) => r.part === '2').transitions = BUILT.transitions
export const runOf = (name) => RUNS.find((r) => r.name === name)
export const partOf = (name) => PARTS.find((p) => p.name === name)
const copy = (rs) => rs.map((r) => ({ ...r }))
for (const p of PARTS) PLANS[p.name] = () => copy(p.records)
for (const r of RUNS) PLANS[r.name] = () => copy(r.records)
/** The transitions a part or run declares (transitions.mjs --plan). */
export const transitionsOf = (name) => copy((runOf(name) ?? partOf(name))?.transitions ?? [])
export const transitionKey = (t) => [t.set, t.id, t.lang, t.mode].join('__')
export const runsSha = () => createHash('sha256').update(JSON.stringify(RUNS.map((r) => [r.name, r.part, r.ids, r.transitions.map(transitionKey)]))).digest('hex').slice(0, 16)
export const estimateOf = (records, transitions = []) => est(records) + (transitions.length ? Math.round((TRANSITIONS_S * transitions.length) / 48) : 0)

// ---------------------------------------------------------------------------
/** The sizing script's own output, run as the plan names it. */
function sizingCounts() {
  return JSON.parse(execFileSync(process.execPath, [SIZING, HERE], { encoding: 'utf8' }))
}
/** The sizing script's own key sets: its source, run with its last line keeping the sets. */
async function sizingKeys() {
  const src = readFileSync(SIZING, 'utf8')
  const last = 'console.log(JSON.stringify(parts, null, 1))'
  if (!src.includes(last)) throw new Error('sizing script: its last line moved; the key comparison cannot read its sets')
  const body = src.replace(last, 'globalThis.__sizingKeys = { 1: pri.map(key), 2: fixes.map(key), 3: p3a.map(key), "3b": resta.map(key), 4: routes.map(key) }')
  const argv = process.argv[2]
  process.argv[2] = HERE
  try {
    await import('data:text/javascript;base64,' + Buffer.from(body + `\n// ${Date.now()}`).toString('base64'))
  } finally {
    process.argv[2] = argv
  }
  return globalThis.__sizingKeys
}

/** Every part and run held to the sizing script and the plan; problems listed, none means whole. */
export async function checkParts() {
  const s = sizingCounts()
  const sk = await sizingKeys()
  const script = { 1: s.part1, 2: s.part2_fixRecords + s.part2_transitions, 3: s.part3, '3b': s.part3b_light9Rest, 4: s.part4_routes }
  const scriptEst = { 1: s.part1Est_s, 2: s.part2Est_s, 3: s.part3Est_s, '3b': s.part3bEst_s, 4: s.part4Est_s }
  const problems = []
  const rows = []
  const all = new Map()
  for (const p of PARTS) {
    const declared = p.records.length + p.transitions.length
    const dropped = BUILT.dropped.filter((r) => r.part === p.part)
    const counted = BUILT.counted[p.part]
    // Counts: declared plus the source-only records equal the script's.
    if (declared + dropped.length !== script[p.part]) problems.push(`part ${p.part}: declared ${declared} + source-only ${dropped.length} ≠ the script's ${script[p.part]}`)
    // Keys: the same set as the script's (part 2's transitions are counted, not keyed, by the script).
    const mine = new Set(counted.map(key))
    const theirs = new Set(sk[p.part])
    const only = [...mine].filter((k) => !theirs.has(k)), missing = [...theirs].filter((k) => !mine.has(k))
    if (only.length || missing.length || mine.size !== sk[p.part].length) problems.push(`part ${p.part}: keys differ from the script's: ${only.length} only here (${only.slice(0, 3).join(', ')}), ${missing.length} only there (${missing.slice(0, 3).join(', ')})`)
    if (p.part === '2' && p.transitions.length !== s.part2_transitions) problems.push(`part 2: ${p.transitions.length} transitions ≠ the script's ${s.part2_transitions}`)
    // The script's estimate, on its own records; then the declared records' own
    // (the union press lists add 3 s a press, a source-only scenario's records go).
    const e = est(BUILT.asScript[p.part]) + (p.part === '2' ? TRANSITIONS_S : 0)
    if (e !== scriptEst[p.part]) problems.push(`part ${p.part}: estimate ${e} s ≠ the script's ${scriptEst[p.part]} s`)
    // Nothing smaller than the plan but by an approved contingency.
    const short = PLAN_COUNTS[p.part] - declared
    const allowed = dropped.filter((r) => CONTINGENT[r.id]).length
    if (short > allowed) problems.push(`part ${p.part}: ${declared} declared, smaller than the plan's ${PLAN_COUNTS[p.part]} by ${short}, of which only ${allowed} is a source-only contingency: a coverage reduction, the owner's to approve`)
    for (const id of new Set(dropped.map((r) => r.id))) if (!CONTINGENT[id]) problems.push(`part ${p.part}: ${id} is source-only with no recorded contingency`)
    // A key in one part only, once.
    for (const r of p.records) {
      const k = key(r)
      if (r.variant) problems.push(`part ${p.part}: ${k} has a variant, which the recipes do not name`)
      if (all.has(k)) problems.push(`${k} in part ${all.get(k)} and part ${p.part}`)
      all.set(k, p.part)
    }
    const tk = p.transitions.map(transitionKey)
    if (new Set(tk).size !== tk.length) problems.push(`part ${p.part}: a transition declared twice in one set`)
    rows.push({ part: p.part, name: p.name, declared, scenarioRecords: p.records.length, transitions: p.transitions.length, sourceOnly: dropped.length, script: script[p.part], plan: PLAN_COUNTS[p.part], scenarios: new Set(p.records.map((r) => r.id)).size, scriptEstimate_s: e, estimate_s: estimateOf(p.records, p.transitions) })
  }
  if (keysSha(PARTS[0].records.map(recordKey)) !== PART1_KEYS_SHA) problems.push(`part 1's keys hash to ${keysSha(PARTS[0].records.map(recordKey))}, not VH-172's ${PART1_KEYS_SHA}`)
  // The runs: every part's records in exactly one run of that part, a scenario's in one run.
  const inRuns = new Map()
  for (const r of RUNS) for (const x of r.records) {
    const k = key(x)
    if (inRuns.has(k)) problems.push(`${k} in ${inRuns.get(k)} and ${r.name}`)
    inRuns.set(k, r.name)
    if (x.part !== r.part) problems.push(`${k} of part ${x.part} in ${r.name}, a part ${r.part} run`)
  }
  for (const [k] of all) if (!inRuns.has(k)) problems.push(`${k} in no run`)
  for (const p of PARTS) {
    const runsOf = RUNS.filter((r) => r.part === p.part)
    for (const id of new Set(p.records.map((r) => r.id))) { const n = runsOf.filter((r) => r.ids.includes(id)).length; if (n !== 1) problems.push(`part ${p.part}: ${id}'s records in ${n} runs`) }
    if (runsOf.reduce((n, r) => n + r.transitions.length, 0) !== p.transitions.length) problems.push(`part ${p.part}: transitions not all in its runs`)
  }
  if (runsSha() !== RUNS_SHA) problems.push(`the runs' split is ${runsSha()}, not the declared RUNS_SHA ${RUNS_SHA}: the split moved`)
  const runs = RUNS.map((r) => ({ name: r.name, part: r.part, records: r.records.length, transitions: r.transitions.length, scenarios: r.ids.length, estimate_s: estimateOf(r.records, r.transitions) }))
  const total = rows.reduce((n, r) => n + r.declared, 0)
  return { ok: !problems.length, problems, rows, runs, total, scriptTotal: s.total, sourceOnly: BUILT.dropped.map(key), runsSha: runsSha() }
}

/** Throws unless every part and run is as declared (matrix.mjs calls it before a part or run). */
export async function assertParts() {
  const c = await checkParts()
  if (!c.ok) throw new Error('the parts are not as declared:\n  ' + c.problems.join('\n  '))
  return c
}

// The reconciliation: what each part holds beyond, or short of, the plan's count.
export function reconcile() {
  const byId = (rs) => Object.entries(rs.reduce((o, r) => ((o[r.id] = (o[r.id] ?? 0) + 1), o), {})).map(([id, n]) => `${id} ${n}`)
  const newIds = new Set(Object.keys(NEW).flatMap((id) => [id, id + 'n', id + 'p']))
  const p3b = BUILT.parts['3b']
  return {
    part3bBeyondPlan: { records: p3b.filter((r) => newIds.has(r.id)).length, byScenario: byId(p3b.filter((r) => newIds.has(r.id))), cells: [...new Set(p3b.filter((r) => newIds.has(r.id)).map((r) => [r.lang, r.view, r.mode].join(' ')))] },
    part3SourceOnly: { records: BUILT.dropped.length, byScenario: byId(BUILT.dropped) },
    part1Widened: BUILT.parts[1].filter((r) => r.pressedWidened !== undefined).map((r) => `${key(r)}: ${r.pressedWidened} → ${r.pressed.length} (${r.pressed.join(', ')})`),
    transitionsInBothSets: BUILT.transitions.filter((t) => t.set === 'cases' && BUILT.transitions.some((u) => u.set === 'all' && u.id === t.id && u.lang === t.lang && u.mode === t.mode)).map((t) => [t.id, t.lang, t.mode].join(' ')),
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2] ?? 'check'
  const c = await checkParts()
  if (cmd === 'list') {
    for (const r of c.rows) console.log(`part ${r.part}: ${r.declared} declared (${r.scenarioRecords} records${r.transitions ? ` + ${r.transitions} transitions` : ''}), ${r.scenarios} scenarios; script ${r.script}${r.sourceOnly ? ` less ${r.sourceOnly} source-only` : ''}; plan ${r.plan}; about ${r.estimate_s} s (the script's ${r.scriptEstimate_s} s)`)
    for (const r of c.runs) console.log(`  ${r.name} (part ${r.part}): ${r.records} records${r.transitions ? ` + ${r.transitions} transitions` : ''}, ${r.scenarios} scenarios, about ${r.estimate_s} s — ${runOf(r.name).ids.join(' ')}`)
    console.log(JSON.stringify(reconcile(), null, 1))
  }
  console.log(JSON.stringify({ ok: c.ok, total: c.total, scriptTotal: c.scriptTotal, sourceOnly: c.sourceOnly.length, runs: c.runs.length, runsSha: c.runsSha, problems: c.problems }, null, 1))
  process.exit(c.ok ? 0 : 1)
}
