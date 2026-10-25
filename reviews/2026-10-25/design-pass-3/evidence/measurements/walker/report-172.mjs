// PLAN-7 (VH-172): the priority run's parts merged. Coverage against
// PLANS.priority (expected keys, observed ok records, each gap with its
// reason), one digest per instrument (counts, then every row that did not
// pass, grouped by subject and reason, with its measurement and records),
// and a compact merged manifest. The six-fix extraction is written beside
// them as JSON for the verification table.
//
//   OUT_DIR=<bundle measurements> SUMMARY=<scratch>/six-fix.json node report-172.mjs <run dir>...
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, basename } from 'node:path'
import { createHash } from 'node:crypto'
import { Run, recordKey } from './runner.mjs'
import { PLANS, estimate } from './scenarios.mjs'

const OUT = process.env.OUT_DIR
const DATE = process.env.DATE ?? '2026-10-23'
const dirs = process.argv.slice(2)
if (!OUT || !dirs.length) throw new Error('OUT_DIR=<dir> node report-172.mjs <run dir>...')

const runs = dirs.map((d) => { const run = new Run(d); const m = existsSync(join(d, 'manifest.json')) ? JSON.parse(readFileSync(join(d, 'manifest.json'), 'utf8')) : null; return { dir: d, run, manifest: m, verify: run.verify(), recs: run.records() } })
const expected = PLANS.priority().map(recordKey)
const byKey = new Map()
for (const r of runs) for (const rec of r.recs) if (rec.status === 'ok' && !rec.stateExpired) byKey.set(rec.key, { ...rec, run: `${r.run.name}-${r.run.runId}` })
const failedWhy = new Map()
for (const r of runs) {
  for (const rec of r.recs) if (rec.status !== 'ok') failedWhy.set(rec.key, rec.error ?? rec.reached?.problems?.join('; ') ?? 'failed')
  const sup = join(r.dir, 'superseded')
  if (existsSync(sup)) for (const f of readdirSync(sup)) { const rec = JSON.parse(readFileSync(join(sup, f), 'utf8')); if (!failedWhy.has(rec.key)) failedWhy.set(rec.key, rec.error ?? rec.reached?.problems?.join('; ') ?? (rec.stateExpired ? 'state expired' : 'failed')) }
}
const recs = expected.filter((k) => byKey.has(k)).map((k) => byKey.get(k))
const missing = expected.filter((k) => !byKey.has(k)).map((k) => ({ key: k, why: String(failedWhy.get(k) ?? 'not recorded').slice(0, 200) }))
const problems = runs.flatMap((r) => r.verify.problems.filter((p) => !(p.kind === 'failed' && byKey.has(p.key))).map((p) => ({ run: r.run.runId, kind: p.kind, key: p.key, why: String(p.why ?? '').slice(0, 160) })))

// ---------------------------------------------------------------------------
const ORDER = ['overflow', 'ax', 'targets', 'contrastText', 'contrastExtra', 'measure', 'type', 'focus', 'pressed', 'motion', 'keys']
const names = ORDER.filter((n) => recs.some((r) => r.instruments?.[n]))
const tally = Object.fromEntries(names.map((n) => [n, { records: {}, rows: {} }]))
for (const r of recs) for (const n of names) {
  const ins = r.instruments?.[n]; if (!ins) continue
  const t = tally[n]; t.records[ins.outcome] = (t.records[ins.outcome] ?? 0) + 1
  for (const it of ins.items ?? ins.steps ?? []) { const o = it.exempt ? 'exempt' : it.outcome; t.rows[o] = (t.rows[o] ?? 0) + 1 }
}
const parse = (k) => { const [idv, lang, view, mode] = k.split('__'); return { id: idv, lang, view, mode } }
const short = (s, n = 70) => String(s ?? '').replace(/\s+/g, ' ').replace(/\|/g, '/').trim().slice(0, n)
const range = (xs) => { const v = xs.filter((x) => typeof x === 'number'); if (!v.length) return ''; const a = Math.min(...v), b = Math.max(...v); return a === b ? String(a) : `${a}–${b}` }
// A compact list of record keys: scenario, then language/view/mode cells.
const keysList = (keys, n = 6) => { const s = keys.slice(0, n).map((k) => k.replace(/__/g, ' ')).join('; '); return keys.length > n ? `${s}; +${keys.length - n} more` : s }
const measureOf = {
  focus: (i) => ({ subject: `${i.sel}${i.ref ? ' (' + i.ref + ')' : ''}`, m: [i.areaAt3to1, i.perimeter2px], say: (g) => `${range(g.rows.map((x) => x.areaAt3to1))} px² at 3:1 of ${range(g.rows.map((x) => x.perimeter2px))}` }),
  targets: (i) => ({ subject: short(i.el, 60), say: (g) => `hit ${range(g.rows.map((x) => x.hitW))} × ${range(g.rows.map((x) => x.hitH))} px` }),
  contrastText: (i) => ({ subject: short(i.el, 60), say: (g) => `${range(g.rows.map((x) => x.ratio))}:1, need ${range(g.rows.map((x) => x.need))}` }),
  contrastExtra: (i) => ({ subject: `${short(i.el, 50)} — ${i.what}`, say: (g) => (g.rows.some((x) => typeof x.ratio === 'number') ? `${range(g.rows.map((x) => x.ratio))}:1, need ${range(g.rows.map((x) => x.need))}` : '') }),
  measure: (i) => ({ subject: short(i.el, 60), say: (g) => `worst ${range(g.rows.map((x) => x.worst?.chars))} chars (${range(g.rows.map((x) => x.worst?.cjk))} CJK, ${range(g.rows.map((x) => x.worst?.latin))} Latin), widest ${range(g.rows.map((x) => x.house?.widestLinePx))} of ${range(g.rows.map((x) => x.house?.limitPx))} px; "${short(g.rows[0].worst?.text, 50)}"` }),
  type: (i) => ({ subject: i.look, say: (g) => `${g.rows.reduce((s, x) => s + x.n, 0)} elements; rendered ${short(g.rows[0].rendered, 40)}; e.g. ${short(g.rows[0].samples?.join(', '), 90)}` }),
  pressed: (i) => ({ subject: i.sel, say: (g) => (g.rows[0].disabled ? `rest vs held ${range(g.rows.map((x) => x.restVsDown?.changedAny))} px changed` : `hover vs pressed ${range(g.rows.map((x) => x.hoverVsDown?.changedAny))} px; Space held ${range(g.rows.map((x) => x.keyboard?.upVsHeld?.changedAny))} px, ring ${[...new Set(g.rows.map((x) => x.keyboard?.ringDrawn))].join('/')}`) }),
  motion: (i) => ({ subject: short(i.el ?? i.what, 60), say: () => '' }),
  keys: (i) => ({ subject: short(i.note ?? i.key, 80), say: (g) => `${g.rows[0].key}: ${short(g.rows[0].from, 40)} → ${short(g.rows[0].to, 40)}` }),
}
function groupsOf(n) {
  const G = new Map()
  for (const r of recs) {
    const ins = r.instruments?.[n]; if (!ins) continue
    let rows = (ins.items ?? ins.steps ?? []).filter((i) => !i.exempt && i.outcome !== 'pass')
    if (n === 'overflow' && ins.outcome !== 'pass') rows = [{ outcome: ins.outcome, subject: 'the page', why: [ins.hscroll ? `scrolls to ${ins.scrollWidth} of ${ins.clientWidth}` : '', ...(ins.offenders ?? []).filter((o) => o.outcome === 'fail').slice(0, 2).map((o) => `offender ${short(o.el, 40)} [${o.left}..${o.right}]`), ...(ins.clipped ?? []).slice(0, 2).map((c) => `clipped "${short(c.text, 30)}" by ${short(c.by, 30)}`), ...(ins.spills ?? []).slice(0, 2).map((c) => `spills "${short(c.text, 30)}" from ${short(c.by, 30)}`)].filter(Boolean).join('; ') }]
    if (n === 'ax' && ins.outcome !== 'pass') rows = (ins.problems?.length ? ins.problems : [{ why: ins.why ?? ins.outcome }]).map((p) => ({ outcome: ins.outcome, subject: short(typeof p === 'string' ? p : p.what ?? p.kind ?? JSON.stringify(p), 80), why: typeof p === 'string' ? '' : short(p.why ?? p.name ?? '', 100) }))
    if (!rows.length && ins.outcome !== 'pass' && ins.outcome !== 'not-applicable' && !['overflow', 'ax'].includes(n)) rows = [{ outcome: ins.outcome, subject: '(the instrument)', why: ins.why ?? 'no row' }]
    for (const row of rows) {
      const spec = measureOf[n]?.(row) ?? { subject: row.subject ?? short(row.el ?? row.sel ?? row.what, 60), say: () => '' }
      const subject = row.subject ?? spec.subject
      const why = short(String(row.why ?? '').replace(/\d+(\.\d+)?/g, 'n'), 110)
      const k = [subject, row.outcome, why].join('|')
      const g = G.get(k) ?? { subject, outcome: row.outcome, why: short(row.why, 140), rows: [], keys: [], say: spec.say }
      g.rows.push(row); if (!g.keys.includes(r.key)) g.keys.push(r.key)
      G.set(k, g)
    }
  }
  return [...G.values()].sort((a, b) => (a.outcome === 'fail' ? 0 : 1) - (b.outcome === 'fail' ? 0 : 1) || b.keys.length - a.keys.length)
}
const runIds = runs.map((r) => `\`${r.run.name}-${r.run.runId}\``).join(', ')
const ABOUT = {
  overflow: 'Document width, offenders carrying text or a control, text clipped by an ancestor and text spilling from a set height (M-04).',
  ax: "Chrome's Accessibility tree: names, roles, the modal's background and live regions (exposure, not speech; M-05).",
  targets: 'The clickable area of every control against 44 × 44 px (2.5.5), wrapped labels included; exempt rows (inline, disabled, off-page) kept with their reason.',
  contrastText: 'Text contrast from computed colours, unrounded, 7:1 or 4.5:1 for large text (1.4.6); "cannot determine" for what computed colour cannot see.',
  contrastExtra: 'Contrast beyond text nodes: input values, placeholders, graphics, range paint, and the file button by glyph pixels (M-02).',
  measure: "Every rendered line with its text against 80 characters (40 CJK) and each block's widest line against 28rem (1.4.8; M-03).",
  type: "VH-172's: every drawn text element against the eight type roles (VH-166) by family, size and weight in rem and line height (not under spacing); the rendered face of one sample per look (proved: prove-172).",
  focus: 'Rendered focus: the area changing by 3:1 between focused and unfocused pixels against a 2 px perimeter of the control or its painted sub-component (2.4.13).',
  pressed: "VH-172's: a mouse press against the hover, a held Space with the ring kept, and a disabled control held (VH-169; proved: prove-172).",
  motion: 'document.getAnimations() sampled under reduced motion while the focus measurements drive the page; spatial movement fails (M-05).',
  keys: 'The keyboard routes J1–J4, keys only after setup: each step its focus before and after, the state asserted, a native popup "cannot determine".',
}
// Instrument faults met in the run, fixed, and what they left (VH-172).
const NOTES = {
  contrastExtra: "Instrument fault, fixed between parts: a setup's last click could leave the file button painted hovered, so every pixel of it changed when its text went transparent and the glyph reading was \"cannot determine\" (\"outside the content box\"). `fileButtonInk` now moves the mouse off first (qualify.mjs). Parts 1 to 3 ran before the fix; S-53 and S-07 were measured again in every cell (`priority-part`, 32 records, all pass: 14.31:1 chosen, 15.41:1 unchosen, 12.38:1 dark, 21:1 forced); the 245 records left \"cannot determine\" below are that fault, never a pass, and a later run fills them.",
  focus: 'The file button\'s ring is read against its painted button (VH-171); the range thumbs against their 44 px box and painted disc, "cannot determine" where the two disagree.',
}
const by = (n, f) => { const m = {}; for (const r of recs) { const o = r.instruments?.[n]?.outcome; if (!o) continue; const k = f(parse(r.key)); (m[k] ??= {}); m[k][o] = (m[k][o] ?? 0) + 1 } return m }
const fmt = (o) => ['pass', 'fail', 'cannot-determine', 'not-applicable'].map((x) => o[x] ?? 0).join(' / ')
for (const n of names) {
  const t = tally[n]
  const G = groupsOf(n)
  const L = ['<!-- markdownlint-disable -->', `# ${n} — VH-172's priority run (${DATE})`, '', ABOUT[n] ?? '', '', `Runs ${runIds}. ${Object.values(t.records).reduce((a, b) => a + b, 0)} records carry it, of ${recs.length} observed.`, '',
    '| | pass | fail | cannot determine | not applicable | exempt |', '| --- | --- | --- | --- | --- | --- |',
    `| records | ${t.records.pass ?? 0} | ${t.records.fail ?? 0} | ${t.records['cannot-determine'] ?? 0} | ${t.records['not-applicable'] ?? 0} | — |`,
    `| rows | ${t.rows.pass ?? 0} | ${t.rows.fail ?? 0} | ${t.rows['cannot-determine'] ?? 0} | ${t.rows['not-applicable'] ?? 0} | ${t.rows.exempt ?? 0} |`, '',
    'Records by mode and by view (pass / fail / cannot determine / not applicable):', '',
    `| mode | ${Object.entries(by(n, (k) => k.mode)).map(([k, o]) => `${k} ${fmt(o)}`).join(' · ')} |`, '| --- | --- |',
    `| view | ${Object.entries(by(n, (k) => k.view)).map(([k, o]) => `${k} ${fmt(o)}`).join(' · ')} |`,
    `| language | ${Object.entries(by(n, (k) => k.lang)).map(([k, o]) => `${k} ${fmt(o)}`).join(' · ')} |`, '']
  if (NOTES[n]) L.push(NOTES[n], '')
  if (!G.length) L.push('Every counted row passed.', '')
  else {
    L.push(`Not passing: ${G.length} groups, by subject and reason, failures first.`, '', '| subject | outcome | measurement | reason | records |', '| --- | --- | --- | --- | --- |')
    for (const g of G) L.push(`| ${short(g.subject, 90)} | ${g.outcome} | ${short(g.say(g), 150)} | ${short(g.why, 140)} | ${g.keys.length}: ${keysList(g.keys)} |`)
    L.push('')
  }
  writeFileSync(join(OUT, `digest-${n}-${DATE}.md`), L.join('\n') + '\n')
}

// ---------------------------------------------------------------------------
// The merged manifest, compact: what ran, on what, completeness and tallies.
const m0 = runs.find((r) => r.manifest)?.manifest ?? {}
const manifest = {
  item: 'VH-172', plan: 'priority', date: DATE,
  runs: runs.map((r) => ({ run: `${r.run.name}-${r.run.runId}`, declared: r.verify.expected, observed: r.verify.observed, whole: r.verify.whole, resumes: JSON.parse(readFileSync(join(r.dir, 'run.json'), 'utf8')).resumes ?? [], instrumentsRevision: r.manifest?.instruments?.revision ?? 'no manifest' })),
  source: m0.source, instruments: m0.instruments && { revision: m0.instruments.revision, files: m0.instruments.files },
  browser: m0.browser, os: m0.os, scaling: m0.scaling, enlargement: m0.enlargement,
  views: [...new Set(recs.map((r) => JSON.stringify({ view: r.view, actual: r.reached?.seen?.viewport, rootFontPx: r.reached?.seen?.rootFontPx })))].map((s) => JSON.parse(s)),
  fixtures: [...new Map(runs.flatMap((r) => r.manifest?.fixtures ?? []).map((f) => [f.file, f])).values()],
  faults: [...new Set(recs.flatMap((r) => r.faults ?? []))],
  estimateSeconds: estimate(PLANS.priority()),
  // VH-172's two instruments proved before the run (prove-172.mjs), each fixture's outcome against the one wanted.
  proved172: process.env.PROVE172 && existsSync(process.env.PROVE172) ? JSON.parse(readFileSync(process.env.PROVE172, 'utf8')).map((x) => ({ instrument: x.instrument, fixture: x.fixture, outcome: x.outcome, wanted: x.wanted, proved: x.proved })) : 'not given',
  coverage: { expected: expected.length, observed: recs.length, whole: missing.length === 0 && problems.length === 0, missing, problems, byClass: Object.fromEntries(['lang', 'view', 'mode'].map((q) => [q, Object.fromEntries([...new Set(expected.map((k) => parse(k)[q]))].map((v) => [v, { expected: expected.filter((k) => parse(k)[q] === v).length, observed: recs.filter((r) => parse(r.key)[q] === v).length }]))])) },
  measurements: Object.fromEntries(names.map((n) => [n, tally[n]])),
  artifacts: runs.map((r) => ({ run: r.run.runId, count: r.manifest?.artifacts?.count, bytes: r.manifest?.artifacts?.bytes, listSha256: r.manifest?.artifacts?.listSha256 })),
  unresolved: { manual: m0.unresolved?.manual, fromMeasurements: [...new Map(runs.flatMap((r) => r.manifest?.unresolved?.fromMeasurements ?? []).map((g) => [g.instrument + g.kind + g.why, g])).values()].slice(0, 40).map((g) => ({ instrument: g.instrument, kind: g.kind, why: g.why, rows: g.rows })) },
  // Observed = expected (PLANS.priority, in the walker) less `coverage.missing`; the keys' hash ties the two.
  observedKeysSha256: createHash('sha256').update(recs.map((r) => r.key).sort().join('\n')).digest('hex').slice(0, 16),
}
writeFileSync(join(OUT, `matrix-manifest-${DATE}.json`), JSON.stringify(manifest))

// ---------------------------------------------------------------------------
// The six-fix extraction, for the verification table (scratch, not the bundle).
if (process.env.SUMMARY) {
  const pick = (pred) => recs.filter((r) => pred(parse(r.key), r))
  const ov = (r) => ({ key: r.key, overflow: r.instruments.overflow?.outcome, scroll: r.instruments.overflow?.scrollWidth, client: r.instruments.overflow?.clientWidth, clipped: r.instruments.overflow?.clippedCount, spills: r.instruments.overflow?.spillCount })
  const thumbs = (r) => (r.instruments.focus?.items ?? []).filter((i) => i.ref === 'thumb').map((i) => ({ key: r.key, sel: i.sel, outcome: i.outcome, area: i.areaAt3to1, box: i.readings?.box, painted: i.readings?.painted, why: i.why }))
  const looks = (r) => ({ key: r.key, outcome: r.instruments.type?.outcome, looks: (r.instruments.type?.items ?? []).map((i) => `${i.look} → ${i.role ?? 'NONE'} ×${i.n} [${i.rendered}]`) })
  const lines = (r, re) => (r.instruments.measure?.items ?? []).filter((i) => re.test(i.el)).map((i) => ({ key: r.key, el: short(i.el, 50), outcome: i.outcome, chars: i.worst?.chars, cjk: i.worst?.cjk, latin: i.worst?.latin, widest: i.house?.widestLinePx, limit: i.house?.limitPx, within: i.house?.within, lines: i.lines?.length }))
  const S = {
    'VH-164': pick((k) => /^S-7[5-9]|^S-80|^S-78k/.test(k.id)).map((r) => ({ key: r.key, state: r.reached?.outcome, status: r.reached?.seen?.status, handoff: r.readings?.handoff, kept: r.readings?.kept })),
    'VH-165': { overflow: pick((k) => /-L?W$|^S-ID1$/.test(k.id)).map(ov), thumbs: recs.flatMap(thumbs) },
    'VH-166': { type: recs.map(looks).filter((x) => x.outcome !== 'pass' || /fallback|font32/.test(x.key) || /^S-(03|83|82|07|39|15)__/.test(x.key)), segments: pick((k) => ['S-03', 'S-07', 'S-78k'].includes(k.id)).map((r) => ({ key: r.key, segments: r.readings?.segments })), footer: pick((k) => ['S-83', 'S-82', 'S-81', 'S-03'].includes(k.id)).map((r) => ({ key: r.key, inset: r.readings?.inset, footer: r.readings?.footer, viewport: r.readings?.viewport })) },
    'VH-167': { notes: recs.flatMap((r) => lines(r, /fact-note|radio-detail|toggletip|#onset-help/)), toggletip: pick((k) => k.id === 'S-17').map((r) => ({ key: r.key, toggletip: r.readings?.toggletip, measure: r.instruments.measure?.outcome })), measure: recs.map((r) => ({ key: r.key, outcome: r.instruments.measure?.outcome, worst: Math.max(0, ...(r.instruments.measure?.items ?? []).filter((i) => !i.exempt).map((i) => i.worst?.chars ?? 0)) })) },
    'VH-168': pick((k) => k.id === 'S-03' || k.id === 'S-15').map((r) => ({ key: r.key, file: (r.instruments.ax?.summary ?? []).filter((x) => /button|textbox/.test(x.role) && /file|文件|fail|pilih|選擇|选择/i.test(JSON.stringify(x))).slice(0, 3) })),
    'VH-169': recs.filter((r) => r.instruments.pressed).flatMap((r) => r.instruments.pressed.items.map((i) => ({ key: r.key, sel: i.sel, outcome: i.outcome, why: i.why, disabled: i.disabled, hover: i.hover?.bg, down: i.down?.bg, rest: i.rest?.bg, hoverVsDown: i.hoverVsDown?.changedAny, restVsDown: i.restVsDown?.changedAny, keyboard: i.keyboard ? { outcome: i.keyboard.outcome, changed: i.keyboard.upVsHeld?.changedAny, ring: i.keyboard.ringDrawn, outline: i.keyboard.held?.outline, fv: i.keyboard.held?.focusVisible } : undefined, shots: i.shots }))),
    keys: recs.filter((r) => r.instruments.keys).map((r) => ({ key: r.key, outcome: r.instruments.keys.outcome, notPass: r.instruments.keys.steps.filter((s) => s.outcome !== 'pass').map((s) => ({ note: s.note, key: s.key, from: short(s.from, 50), to: short(s.to, 50), outcome: s.outcome })) })),
  }
  writeFileSync(process.env.SUMMARY, JSON.stringify(S, null, 1))
}
console.log(JSON.stringify({ expected: expected.length, observed: recs.length, missing: missing.length, problems: problems.length, tally: Object.fromEntries(names.map((n) => [n, tally[n].records])), manifestBytes: JSON.stringify(manifest).length, files: names.map((n) => basename(join(OUT, `digest-${n}-${DATE}.md`))) }, null, 1))
