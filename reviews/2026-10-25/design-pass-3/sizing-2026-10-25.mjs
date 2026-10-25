// Sizes pass 3's matrix (VH-197, after Codex astra's P-01 and P-02): the
// frozen 699 priority keys, the fix plans beyond them, the Phase 8 part by
// the plan's cell recipes, VH-199's light-cell criterion and the routes.
// Counts only; VH-198 declares the same recipes in the walker's PLANS and
// calibrates the time on its pilot.
//
//   node sizing-2026-10-25.mjs [walker directory]
//
// The walker defaults to Phase 7's, whose PLANS.priority is the 699 keys.
import { pathToFileURL } from 'node:url'

const W = process.argv[2]
  ? pathToFileURL(process.argv[2].replace(/\/?$/, '/'))
  : new URL('../../2026-10-22/design-pass-2/evidence/measurements/walker/', import.meta.url)
const { SCENARIOS, PLANS, estimate } = await import(new URL('scenarios.mjs', W).href)

const L = ['en-GB', 'zh-Hans', 'ms-MY']
const LV = ['w1280', 'w375', 'w320']
const C = ['dark', 'forced-light', 'forced-dark']
const rec = (id, lang, view, mode) => ({ id, lang, view, mode })
// A scenario the walker declares narrower keeps its own languages and views.
const ok = (id, lang, view) =>
  !SCENARIOS[id] ||
  ((!SCENARIOS[id].langs || SCENARIOS[id].langs.includes(lang)) &&
    (!SCENARIOS[id].views || SCENARIOS[id].views.includes(view)))

// The recipes. FULL is 31 cells: the nine language × view cells in light,
// spacing at 320 px, dark and both forced palettes in each language at
// 1280 px and in English at 320 px, the 32 px font and fallback faces in each
// language at 1280 px, and reduced motion in English at 1280 px (P-01).
const LIGHT9 = (id) => L.flatMap((l) => LV.map((v) => rec(id, l, v, 'light')))
const WORDS12 = (id) => [...LIGHT9(id), ...L.map((l) => rec(id, l, 'w320', 'spacing'))]
const FULL = (id) => [
  ...WORDS12(id),
  ...L.flatMap((l) => C.map((m) => rec(id, l, 'w1280', m))),
  ...C.map((m) => rec(id, 'en-GB', 'w320', m)),
  ...L.flatMap((l) => ['font32', 'fallback'].map((m) => rec(id, l, 'w1280', m))),
  rec(id, 'en-GB', 'w1280', 'reduced-motion'),
]
// A production outcome, its look measured on a cheap equivalent (S-53,
// S-126, S-135): three languages at 1280 px and English at 320 px.
const OUTCOME4 = (id) => [...L.map((l) => rec(id, l, 'w1280', 'light')), rec(id, 'en-GB', 'w320', 'light')]
const ONE = (id) => [rec(id, 'en-GB', 'w1280', 'light')]
const NONE = () => []
const COLOUR12 = (id) => L.flatMap((l) => ['light', ...C].map((m) => rec(id, l, 'w1280', m)))

// New scenarios S-92 to S-154, by recipe; each narrower one has its reason
// in the scenarios file.
const NEW = {}
for (let n = 92; n <= 154; n++) NEW[`S-${n}`] = FULL
Object.assign(NEW, {
  'S-93': OUTCOME4,
  'S-94': ONE,
  'S-100': OUTCOME4,
  'S-101': ONE,
  'S-102': ONE,
  'S-112': (id) => L.flatMap((l) => ['w401', 'w400', 'w375', 'w320'].map((v) => rec(id, l, v, 'light'))),
  'S-113': (id) => L.flatMap((l) => ['w1280', 'w640', 'w401', 'w320'].map((v) => rec(id, l, v, 'font32'))),
  'S-115': OUTCOME4,
  'S-118': OUTCOME4,
  'S-123': OUTCOME4,
  'S-124': OUTCOME4,
  'S-130': (id) => L.map((l) => rec(id, l, 'w375', 'light')),
  'S-131': OUTCOME4,
  'S-132': OUTCOME4,
  'S-133': OUTCOME4,
  'S-134': ONE,
  'S-136': OUTCOME4,
  'S-138': OUTCOME4,
  'S-139': ONE,
  'S-140': (id) => [rec(id, 'en-GB', 'w1280', 'light'), rec(id + 'n', 'en-GB', 'w1280', 'light')],
  'S-144': (id) => [
    rec(id, 'en-GB', 'w320', 'light'),
    ...L.flatMap((l) => ['w1280', 'w800', 'w375', 'w320'].map((v) => rec(id + 'p', l, v, 'light'))),
  ],
  'S-149': COLOUR12,
  'S-150': COLOUR12,
  'S-151': OUTCOME4,
  'S-152': OUTCOME4,
  'S-153': ONE,
  'S-154': NONE,
})

// Carried scenarios Phase 8 changed, by what changed: a look takes FULL,
// words take WORDS12, a state takes LIGHT9, and a production outcome OUTCOME4.
const LOOK = ['S-03', 'S-04', 'S-07', 'S-14', 'S-15', 'S-17', 'S-24', 'S-36', 'S-40', 'S-41', 'S-43', 'S-46', 'S-47a', 'S-47b', 'S-47c', 'S-48', 'S-53', 'S-53-W', 'S-53-LW', 'S-55a', 'S-55b', 'S-55c', 'S-58', 'S-58-W', 'S-58-LW', 'S-63', 'S-63-W', 'S-63-LW', 'S-64', 'S-75', 'S-76', 'S-77', 'S-83']
const WORDS = ['S-01', 'S-01b', 'S-02', 'S-06a', 'S-08', 'S-16', 'S-23', 'S-30', 'S-31', 'S-45b', 'S-52', 'S-56', 'S-57', 'S-71', 'S-78', 'S-78k', 'S-79a', 'S-79b', 'S-80a', 'S-80b', 'S-81', 'S-82', 'S-86', 'S-89', 'S-90a', 'S-90b', 'S-91']
const STATE = ['S-50', 'S-54a', 'S-54b', 'S-54c', 'S-54d', 'S-59', 'S-60', 'S-61', 'S-62', 'S-65', 'S-66', 'S-67', 'S-68', 'S-69', 'S-70a', 'S-70b', 'S-70c', 'S-72a', 'S-72b', 'S-88']
const HEAVY = new Set(['S-24', 'S-48', 'S-50', 'S-43', 'S-49', 'S-57', 'S-85', 'S-90a', 'S-90b', 'S-61', 'S-65', 'S-66', 'S-72a', 'S-60'])
for (const id of [...LOOK, ...WORDS, ...STATE]) if (!SCENARIOS[id]) console.error('unknown', id)

const key = (r) => [r.id, r.lang, r.view, r.mode].join('|')
// Part 1: the frozen keys. Part 2: the fix plans' own records beyond them.
const pri = PLANS.priority()
const priK = new Set(pri.map(key))
const fixes = [
  ...new Map(
    [...PLANS.vh179(), ...PLANS.vh180(), ...PLANS.vh181()].filter((r) => !priK.has(key(r))).map((r) => [key(r), r]),
  ).values(),
]
const fixK = new Set(fixes.map(key))
// Part 3: a key already held is not walked twice; the walker merges its
// assertions and press lists (P-01).
const p3 = new Map()
const add = (r, why) => {
  if (!ok(r.id, r.lang, r.view)) return
  const k = key(r)
  if (priK.has(k) || fixK.has(k) || p3.has(k)) return
  p3.set(k, { ...r, why })
}
for (const [id, f] of Object.entries(NEW)) for (const r of f(id)) add(r, 'new')
for (const id of LOOK) for (const r of (HEAVY.has(id) ? OUTCOME4 : FULL)(id)) add(r, 'look')
for (const id of WORDS) for (const r of (HEAVY.has(id) ? OUTCOME4 : WORDS12)(id)) add(r, 'words')
for (const id of STATE) for (const r of (HEAVY.has(id) ? OUTCOME4 : LIGHT9)(id)) add(r, 'state')
// The finite list's Phase 8 states: the four other views in English, both
// proxies in Chinese and Malay.
const F8 = ['S-53', 'S-126', 'S-127', 'S-135', 'S-17', 'S-141', 'S-83', 'S-119']
for (const id of F8) {
  for (const v of ['landscape', 'short', 'zoom200proxy', 'zoom400proxy']) add(rec(id, 'en-GB', v, 'light'), 'finite')
  for (const l of ['zh-Hans', 'ms-MY']) for (const v of ['zoom200proxy', 'zoom400proxy']) add(rec(id, l, v, 'light'), 'finite')
}
// Part 3b: VH-199's criterion, every other walked scenario in the nine light cells.
const rest = new Map()
for (const id of Object.keys(SCENARIOS).filter((i) => !SCENARIOS[i].fixOnly)) {
  for (const r of (HEAVY.has(id) ? OUTCOME4 : LIGHT9)(id)) {
    const k = key(r)
    if (ok(r.id, r.lang, r.view) && !priK.has(k) && !fixK.has(k) && !p3.has(k)) rest.set(k, { ...r, why: 'light9' })
  }
}
// Part 4: the routes whole.
const routes = []
for (const id of ['J1', 'J2', 'J3', 'J4', 'K-dialog', 'K-player']) for (const r of OUTCOME4(id)) if (!priK.has(key(r))) routes.push(r)

const by = (a, f) => a.reduce((o, r) => ((o[f(r)] = (o[f(r)] ?? 0) + 1), o), {})
const p3a = [...p3.values()]
const resta = [...rest.values()]
// VH-176's after-run took 8,130 s where Phase 7's estimate said 11,324 s.
const RATIO = 8130 / 11324
// Seconds a record for the slow Phase 8 setups, beyond the walker's own.
const SLOW8 = { 'S-93': 130, 'S-94': 200, 'S-100': 40, 'S-101': 40, 'S-102': 40, 'S-115': 60, 'S-118': 70, 'S-122': 30, 'S-123': 150, 'S-124': 160, 'S-128': 30, 'S-129': 40, 'S-130': 40, 'S-131': 60, 'S-132': 40, 'S-133': 140, 'S-134': 40, 'S-135': 50, 'S-136': 50, 'S-137': 60, 'S-138': 90, 'S-139': 40, 'S-140': 900, 'S-140n': 120, 'S-149': 40, 'S-150': 40, 'S-151': 60, 'S-152': 60, 'S-153': 40, J1: 120, J2: 40, J3: 90, J4: 120, 'K-dialog': 20, 'K-player': 60 }
const est = (a) => {
  const seen = new Set()
  let extra = 0
  for (const r of a) {
    const g = [r.id, r.lang, r.view].join('|')
    if (SLOW8[r.id] && !seen.has(g)) extra += SLOW8[r.id] - 12
    seen.add(g)
  }
  return Math.round((estimate(a) + extra) * RATIO)
}
const TRANSITIONS = 48
const TRANSITIONS_S = 1250
const parts = {
  part1: pri.length,
  part1Est_s: est(pri),
  part2_fixRecords: fixes.length,
  part2_transitions: TRANSITIONS,
  part2Est_s: est(fixes) + TRANSITIONS_S,
  part3: p3a.length,
  part3ByWhy: by(p3a, (r) => r.why),
  part3ByLang: by(p3a, (r) => r.lang),
  part3ByView: by(p3a, (r) => r.view),
  part3ByMode: by(p3a, (r) => r.mode),
  part3Est_s: est(p3a),
  part3b_light9Rest: resta.length,
  part3bEst_s: est(resta),
  part4_routes: routes.length,
  part4Est_s: est(routes),
  newScenarioIds: Object.keys(NEW).length,
}
parts.total = parts.part1 + parts.part2_fixRecords + TRANSITIONS + parts.part3 + parts.part3b_light9Rest + parts.part4_routes
parts.totalEst_h = +((parts.part1Est_s + parts.part2Est_s + parts.part3Est_s + parts.part3bEst_s + parts.part4Est_s) / 3600).toFixed(1)
console.log(JSON.stringify(parts, null, 1))
