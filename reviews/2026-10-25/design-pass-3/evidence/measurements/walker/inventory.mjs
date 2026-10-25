// VH-163 design pass: the type / measure / grid / spacing inventory, from
// design-walk.mjs's per-state dumps.
// Usage: node inventory.mjs <styles-dir> [out-prefix]
//   writes <out-prefix>.md and <out-prefix>.json (default: ../inventory-before-2026-10-22)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../../../../../..')
const STYLES = process.argv[2]
const OUT = process.argv[3] ?? join(HERE, '..', 'inventory-before-2026-10-22')
if (!STYLES) { console.error('usage: node inventory.mjs <styles-dir> [out-prefix]'); process.exit(1) }

// --- inputs ----------------------------------------------------------------
const caps = readdirSync(STYLES).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(STYLES, f), 'utf8')))
const SHORT = { 'en-GB': 'en', 'zh-Hans': 'zh', 'ms-MY': 'ms' }
for (const c of caps) { c.meta.l = SHORT[c.meta.lang] ?? c.meta.lang; c.els.forEach((e, i) => (e.i = i)) }
const light = caps.filter((c) => c.meta.theme === 'light')

const read = (p) => readFileSync(join(REPO, p), 'utf8')
const remPx = (v) => { const m = String(v).trim().match(/^(-?[\d.]+)(rem|px)$/); return m ? (m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1])) : null }
const tokens = (file) => { const out = []; for (const m of read(file).matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) out.push({ name: m[1], value: m[2].trim(), px: remPx(m[2]) }); return out }
const carbon = tokens('src/styles/tokens.carbon.css')
const brand = tokens('src/styles/tokens.brand.css')
const SPACING = carbon.filter((t) => t.name.startsWith('--spacing-'))
const SCALE = new Set(SPACING.map((t) => t.px))
const tokenAt = (px) => SPACING.find((t) => t.px === px)?.name

// app.css rules, by normalized selector, with their line numbers.
const norm = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/'/g, '"').replace(/\s*([>+~,])\s*/g, ' $1 ').replace(/\s+/g, ' ').replace(/ , /g, ', ').trim()
function ruleLines(file) {
  const src = read(file)
  const map = new Map()
  let buf = '', line = 1, startLine = 1, inComment = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (!inComment && ch === '/' && src[i + 1] === '*') { inComment = true; i++; continue }
    if (inComment) { if (ch === '*' && src[i + 1] === '/') { inComment = false; i++ } else if (ch === '\n') line++; continue }
    if (ch === '\n') line++
    if (ch === '{') { const sel = norm(buf); if (sel && !sel.startsWith('@')) { if (!map.has(sel)) map.set(sel, []); map.get(sel).push(startLine) } buf = ''; continue }
    if (ch === '}' || ch === ';') { buf = ''; continue }
    if (!buf.trim() && /\S/.test(ch)) startLine = line
    buf += ch
  }
  return map
}
const CSSFILES = ['src/styles/app.css', 'src/styles/tokens.brand.css', 'src/styles/tokens.carbon.css']
const RULEMAP = Object.fromEntries(CSSFILES.map((f) => [f, ruleLines(f)]))
function lineOf(sel, file) {
  const n = norm(sel)
  const files = file && RULEMAP[file] ? [file, ...CSSFILES.filter((f) => f !== file)] : CSSFILES
  for (const f of files) { const hit = RULEMAP[f].get(n); if (hit) return `${f}:${hit.join(',')}` }
  // a rule written as a list: find any rule whose list contains the first part
  const first = n.split(', ')[0]
  for (const f of files) for (const [k, v] of RULEMAP[f]) if (k.split(', ').includes(first)) return `${f}:${v.join(',')} (in a list)`
  return `${file ?? '?'} (selector not found: ${n.slice(0, 60)})`
}

// --- helpers ---------------------------------------------------------------
const uniq = (a) => [...new Set(a)]
const r1 = (n) => Math.round(n * 10) / 10
const px = (v) => { const n = parseFloat(v); return isNaN(n) ? v : r1(n) }
const short = (e) => { const cls = e.cls ? '.' + e.cls.split(/\s+/).slice(0, 2).join('.') : ''; const own = e.tag + (cls || (e.id ? '#' + e.id : '')); return own === e.tag && e.parent ? e.parent.replace(/#[\w-]+/, '').replace(/^(\w+(\.[\w-]+)?).*$/, '$1') + ' > ' + e.tag : own }
const fam = (f) => { const first = f.split(',')[0].replace(/["']/g, '').trim(); return /PingFang|YaHei|Noto Sans SC|Hiragino/.test(f) ? first + ' (+CJK stack)' : first }
const tally = (arr, key) => { const m = new Map(); for (const x of arr) { const k = key(x); m.set(k, (m.get(k) ?? 0) + 1) } return [...m].sort((a, b) => b[1] - a[1]) }
const reps = (els, n = 8) => tally(els, short).slice(0, n).map(([k, c]) => `${k}×${c}`).join(', ')
const table = (head, rows) => `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n` + rows.map((r) => `| ${r.map((c) => String(c).replace(/\|/g, '\\|')).join(' | ')} |`).join('\n') + '\n'
const stateTag = (c) => `${c.meta.width}/${c.meta.state}`
const md = []
const J = {}

// --- 0. how to run ------------------------------------------------------------
md.push("<!-- markdownlint-disable -->", "")
md.push(`# Design inventory — before (VH-163, 2026-10-22)

**How to run again.** With the Vite dev server on :5173 and a headless Chrome on :9222
(\`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9222 --user-data-dir=<scratch>/chrome-profile --no-first-run about:blank\`),
from \`measurements/walker/\`: \`zsh fixtures.sh <scratch>/fixtures\`, then
\`FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out EVIDENCE=<bundle>/evidence PREFIX=after node design-walk.mjs\`
(runs en/zh/ms × 1280/375 × empty, ready, running, finished, the 1280 en dark and forced-colours empty/ready, and the en extras),
then \`node inventory.mjs <scratch>/styles <bundle>/evidence/measurements/inventory-after-<date>\`.
Diff the two \`.json\` files. All values are CSS px from \`getComputedStyle\` / \`getBoundingClientRect\` in Chrome ${'155'}; 375 runs use mobile emulation (375×812, DPR 2, touch).
Type, measure, grid and spacing tables count the **light-theme** captures only (dark and forced colours change colour, not geometry).

Captures: ${caps.length} (${light.length} light). States: ${uniq(caps.map((c) => c.meta.name.replace(/^\w+-/, ''))).join(', ')}.
Spacing scale (\`tokens.carbon.css\`): ${SPACING.map((t) => `${t.name} ${t.px}px`).join(', ')}.
Brand lengths (\`tokens.brand.css\`): ${brand.filter((t) => t.px !== null).map((t) => `${t.name} ${t.value}`).join(', ')}.
Other shape tokens (\`tokens.carbon.css\`): ${carbon.filter((t) => !t.name.startsWith('--spacing-') && /rem|px|ch|em/.test(t.value) && !/^#/.test(t.value)).map((t) => `${t.name} ${t.value}`).join(', ')}.
`)

// --- 1. TYPE ---------------------------------------------------------------
const textEls = []
for (const c of light) for (const e of c.els) if (e.text) textEls.push({ ...e, cap: c })
const typeKey = (e) => [fam(e.fontFamily), px(e.fontSize), e.lineHeight === 'normal' ? 'normal' : px(e.lineHeight), e.fontWeight, e.letterSpacing].join(' / ')
function typeRows(els) {
  const g = new Map()
  for (const e of els) { const k = typeKey(e); if (!g.has(k)) g.set(k, []); g.get(k).push(e) }
  return [...g].sort((a, b) => parseFloat(b[0].split(' / ')[1]) - parseFloat(a[0].split(' / ')[1]) || b[1].length - a[1].length)
}
const allTypes = typeRows(textEls)
J.type = { distinct: allTypes.length, rows: allTypes.map(([k, els]) => ({ style: k, count: els.length, langs: uniq(els.map((e) => e.cap.meta.l)), reps: reps(els) })) }
md.push(`## 1. Type\n\nElements that directly hold non-whitespace text. Style = first family / font-size / line-height / weight / letter-spacing. **${allTypes.length} distinct text styles overall.**\n`)
md.push(table(['style', 'n', 'langs', 'states', 'representative (tag.class × occurrences)'], allTypes.map(([k, els]) => [k, els.length, uniq(els.map((e) => e.cap.meta.l)).join(' '), uniq(els.map((e) => stateTag(e.cap))).length + ' of ' + light.length, reps(els)])))
J.type.perLang = {}
for (const l of ['en', 'zh', 'ms']) {
  const rows = typeRows(textEls.filter((e) => e.cap.meta.l === l))
  J.type.perLang[l] = rows.length
  md.push(`\n### 1.${l} — page language ${l}: ${rows.length} distinct styles\n`)
  md.push(table(['style', 'n', 'representative'], rows.map(([k, els]) => [k, els.length, reps(els, 6)])))
}
const stacks = tally(textEls, (e) => e.cap.meta.l + ' :: ' + e.fontFamily)
md.push(`\n### 1.stacks — full font-family stacks in use, by page language\n\n` + stacks.map(([k, n]) => `- ${k} — ${n}`).join('\n') + '\n')

// headings
const headingKind = (e) => /^h[1-6]$/.test(e.tag) ? e.tag : e.tag === 'legend' ? 'legend' : e.tag === 'summary' ? 'summary' : /notification-title|notification-item-title/.test(e.cls) ? '.' + e.cls.split(/\s+/).find((c) => /title/.test(c)) : e.tag === 'dt' ? 'dt' : null
const hEls = []
for (const c of light) for (const e of c.els) { const k = headingKind(e); if (k && (e.text || /^h[1-6]$/.test(e.tag) || e.tag === 'legend')) hEls.push({ ...e, cap: c, kind: k }) }
J.headings = {}
md.push(`\n### 1.headings — same tag or role, different style\n\nIncludes headings whose words sit in a child span (the step headings). Family is the first family only, so a Chinese page's CJK fallback does not count as a difference. More than one row per kind = inconsistency.\n`)
const hrows = []
for (const kind of uniq(hEls.map((e) => e.kind)).sort()) {
  const els = hEls.filter((e) => e.kind === kind)
  const g = typeRows(els.map((e) => ({ ...e, fontFamily: e.fontFamily.split(',')[0] })))
  J.headings[kind] = g.map(([k, es]) => ({ style: k, n: es.length, reps: reps(es, 5) }))
  for (const [k, es] of g) hrows.push([kind + (g.length > 1 ? ' **(' + g.length + ' styles)**' : ''), k, es.length, uniq(es.map((e) => e.cap.meta.l)).join(' '), uniq(es.map((e) => e.cap.meta.width)).join(' '), tally(es, (e) => (e.tag === 'legend' || e.tag === 'summary' ? e.parent + ' > ' : '') + e.s).slice(0, 4).map(([s]) => s).join(', ')])
}
md.push(table(['kind', 'style', 'n', 'langs', 'widths', 'where'], hrows))

// --- 2. MEASURE ------------------------------------------------------------
const kindOf = (e) => {
  const ch = (e.chain || []).join(' ')
  if (/helper/.test(e.cls) || /helper/.test(e.parent)) return 'helper'
  if (/notification/.test(ch) || /notification/.test(e.cls)) return 'notification'
  if (/accessibility-statement/.test(ch)) return 'statement'
  if (/system-check/.test(ch)) return 'system-check'
  if (/lede/.test(ch)) return 'lede'
  if (/step-intro|step-lead/.test(e.cls)) return 'step-intro'
  if (/reason|note|result|status/.test(e.cls + ' ' + e.id)) return 'status/reason line'
  if (e.region === 'footer') return 'footer'
  if (e.tag === 'label' || e.tag === 'legend' || /label/.test(e.cls)) return 'label'
  return e.tag
}
const isRunning = (e) => e.text && e.textLen >= 30 && !/^h[1-6]$|^button$|^summary$|^a$|^option$|^code$|^pre$/.test(e.tag) && !/segment-face|button/.test(e.cls)
const runEls = []
for (const c of light) for (const e of c.els) if (isRunning(e)) runEls.push({ ...e, cap: c, kind: kindOf(e) })
md.push(`\n## 2. Measure\n\nElements holding ≥30 characters of running text (p, li, dd, helper lines, notification bodies, labels, statement text). \`max\` = computed max-width (px); \`w\` = rendered box width; \`line\` = widest rendered line. Grouped at 1280 px by page language and kind.\n`)
J.measure = {}
for (const width of [1280, 375]) {
  const rows = []
  for (const l of ['en', 'zh', 'ms']) {
    const els = runEls.filter((e) => e.cap.meta.width === width && e.cap.meta.l === l)
    for (const kind of uniq(els.map((e) => e.kind)).sort()) {
      const ks = els.filter((e) => e.kind === kind)
      const maxes = tally(ks, (e) => px(e.maxWidth)).map(([k, n]) => `${k}${n > 1 ? '×' + n : ''}`).join(', ')
      const widths = tally(ks, (e) => Math.round(e.w)).slice(0, 6).map(([k, n]) => `${k}${n > 1 ? '×' + n : ''}`).join(', ')
      const fs = uniq(ks.map((e) => px(e.fontSize))).join('/')
      const line = Math.round(Math.max(...ks.map((e) => e.widestLine || 0)))
      rows.push([l, kind, ks.length, fs, maxes, widths, line, tally(ks, short).slice(0, 3).map(([k]) => k).join(', ')])
      ;(J.measure[width] ??= {})[l + ':' + kind] = { n: ks.length, fontSize: fs, max: maxes, widths, widestLine: line }
    }
  }
  md.push(`\n### 2.${width}\n\n` + table(['lang', 'kind', 'n', 'font px', 'max-width px (×n)', 'rendered w (×n)', 'widest line', 'who'], rows))
}
// body text vs helper / notification at 1280
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN }
md.push(`\n### 2.short — how far helper and notification text stops short of body text (1280, max-width px, median)\n`)
const shortRows = []
J.measureShort = {}
for (const l of ['en', 'zh', 'ms']) {
  const at = runEls.filter((e) => e.cap.meta.width === 1280 && e.cap.meta.l === l)
  const m = (kinds) => med(at.filter((e) => kinds.includes(e.kind) && e.maxWidth !== 'none').map((e) => parseFloat(e.maxWidth)))
  const body = m(['lede', 'step-intro', 'p', 'li', 'statement'])
  const helper = m(['helper'])
  const notif = m(['notification'])
  const reason = m(['status/reason line'])
  J.measureShort[l] = { body, helper, notification: notif, reason }
  shortRows.push([l, r1(body), r1(helper), r1(body - helper), r1(notif), r1(body - notif), r1(reason)])
}
md.push(table(['lang', 'body max', 'helper max', 'helper short by', 'notification max', 'notification short by', 'reason/status max'], shortRows))
const mainW = (c) => c.els.find((e) => e.id === 'main')
md.push(`\nMain column content width at 1280: ${['en', 'zh', 'ms'].map((l) => { const c = light.find((x) => x.meta.width === 1280 && x.meta.l === l && x.meta.state === 'ready'); return c ? `${l} ${mainW(c)?.contentWidth}px` : '' }).join(', ')}.\n`)

// --- 3. GRID ---------------------------------------------------------------
md.push(`\n## 3. Grid and left edges\n`)
const gridRows = []
J.grid = {}
for (const c of light.filter((c) => c.meta.state === 'ready' || c.meta.state === 'statement-open')) {
  const by = (f) => c.els.find(f)
  const main = by((e) => e.id === 'main')
  const inner = by((e) => e.id === 'brand-header')
  const logo = by((e) => e.region === 'header' && (e.tag === 'img' || e.tag === 'svg'))
  const sw = by((e) => e.id === 'language-switcher')
  const finner = c.els.find((e) => e.region === 'footer' && /band-inner/.test(e.cls))
  const ftext = c.els.filter((e) => e.region === 'footer' && e.textLeft != null)
  const row = { w: c.meta.width, l: c.meta.l, state: c.meta.state, mainLeft: main?.contentLeft, mainWidth: main?.contentWidth, headerInnerLeft: inner?.contentLeft, headerInnerRight: inner ? r1(inner.contentLeft + inner.contentWidth) : null, logoLeft: logo?.left, logoW: logo?.w, switcherLeft: sw?.left, switcherRight: sw?.right, footerInnerLeft: finner?.contentLeft, footerInnerWidth: finner?.contentWidth, footerTextLeftMin: ftext.length ? Math.min(...ftext.map((e) => e.textLeft)) : null, h1Left: by((e) => e.tag === 'h1')?.textLeft, hscroll: c.meta.hscroll, scrollWidth: c.meta.scrollWidth }
  J.grid[c.meta.name] = row
  gridRows.push([row.w, row.l, row.state, `${row.mainLeft} / ${row.mainWidth}`, row.h1Left, `${row.headerInnerLeft}–${row.headerInnerRight}`, `${row.logoLeft} (w ${row.logoW})`, `${row.switcherLeft}–${row.switcherRight}`, `${row.footerInnerLeft} / ${row.footerInnerWidth}`, row.footerTextLeftMin, row.hscroll ? 'YES ' + row.scrollWidth : 'no'])
}
md.push(table(['width', 'lang', 'state', 'main content left / width', 'h1 text left', 'header inner left–right', 'logo left', 'switcher left–right', 'footer inner left / width', 'footer min text left', 'h-scroll'], gridRows))

md.push(`\n### 3.edges — distinct left edges of text inside each panel (text start x, px)\n\nPer panel: \`edge: what sits there (×n)\`. Panels are the nearest section / details / fieldset (else the nearest .lede/.notification/header/footer). Inline elements that continue a line (a link or date inside a sentence, the words after a step number) are left out.\n`)
J.edges = {}
// An inline element that continues a line (inside running text, or after a text sibling on the same line) is not an edge.
function midLine(els, e) {
  if (e.display !== 'inline') return false
  let parent = null
  for (let i = e.i - 1; i >= 0; i--) if (els[i].s === e.parent) { parent = els[i]; break }
  if (parent && parent.text) return true
  return els.some((x) => x.i < e.i && x.parent === e.parent && x.textLeft != null && Math.abs(x.textTop - e.textTop) <= 3 && x.textLeft < e.textLeft)
}
for (const name of light.filter((c) => (c.meta.l === 'en' && ['ready', 'title-card', 'statement-open', 'finished', 'system-check-open'].includes(c.meta.state)) || (c.meta.state === 'ready')).map((c) => c.meta.name)) {
  const c = light.find((x) => x.meta.name === name)
  const panels = new Map()
  for (const e of c.els) { if (e.textLeft == null || midLine(c.els, e)) continue; if (!panels.has(e.panel)) panels.set(e.panel, []); panels.get(e.panel).push(e) }
  const lines = []
  J.edges[name] = {}
  for (const [p, els] of panels) {
    const edges = tally(els, (e) => Math.round(e.textLeft)).sort((a, b) => a[0] - b[0])
    J.edges[name][p] = edges.map(([x]) => x)
    lines.push(`- **${p}** — ${edges.length} edges: ` + edges.map(([x]) => `${x}: ${tally(els.filter((e) => Math.round(e.textLeft) === x), short).slice(0, 4).map(([k, n]) => k + (n > 1 ? '×' + n : '')).join(', ')}`).join(' · '))
  }
  // Only show 375 and non-en at a summary level to keep the file readable.
  const full = c.meta.width === 1280 && c.meta.l === 'en'
  md.push(`\n#### ${name}${full ? '' : ' (edge counts only)'}\n\n` + (full ? lines.join('\n') : [...panels].map(([p]) => `- ${p}: ${J.edges[name][p].length} edges (${J.edges[name][p].join(', ')})`).join('\n')) + '\n')
}

// Whole steps: a step section with every fieldset and notification inside it merged.
md.push(`\n### 3.steps — distinct text left edges per whole step (descendant fieldsets and notifications merged), ready state\n`)
J.stepEdges = {}
const stepRows = []
for (const c of light.filter((c) => c.meta.state === 'ready')) {
  const g = new Map()
  for (const e of c.els) { if (e.textLeft == null || midLine(c.els, e)) continue; const k = [e.s, ...(e.chain || [])].find((x) => /^section#step-|^details#|^div\.lede|^fieldset#video-|^footer/.test(x)); if (!k) continue; if (!g.has(k)) g.set(k, []); g.get(k).push(e) }
  J.stepEdges[c.meta.name] = {}
  for (const [k, els] of g) { const edges = uniq(els.map((e) => Math.round(e.textLeft))).sort((a, b) => a - b); J.stepEdges[c.meta.name][k] = edges; stepRows.push([c.meta.width, c.meta.l, k.replace(/\.panel.*$/, ''), edges.length, edges.join(', ')]) }
}
md.push(table(['width', 'lang', 'step / block', 'edges', 'x (px)'], stepRows))

// --- 4. SPACING ------------------------------------------------------------
const PROPS = { marginTop: 'margin-top', marginRight: 'margin-right', marginBottom: 'margin-bottom', marginLeft: 'margin-left', paddingTop: 'padding-top', paddingRight: 'padding-right', paddingBottom: 'padding-bottom', paddingLeft: 'padding-left', rowGap: 'row-gap', columnGap: 'column-gap' }
const off = new Map()
const onScale = new Map()
for (const c of light) for (const e of c.els) for (const [k, prop] of Object.entries(PROPS)) {
  const v = parseFloat(e[k]); if (isNaN(v) || v === 0) continue
  const pxv = r1(Math.abs(v))
  if (k === 'columnGap' && e.columnGap === 'normal') continue
  if (SCALE.has(pxv)) { onScale.set(pxv, (onScale.get(pxv) ?? 0) + 1); continue }
  const hit = e.trace?.[k]?.at(-1)
  const src = hit ? `${hit.sel.length > 70 ? hit.sel.slice(0, 70) + '…' : hit.sel} → \`${hit.v}\` @ ${hit.file === 'inline style' ? 'inline style' : lineOf(hit.sel, hit.file)}` : 'browser default (no author rule)'
  const auto = hit && /^auto$/.test(hit.v.trim()) || (hit && /\bauto\b/.test(hit.v) && /^margin/.test(prop))
  const brandTok = brand.find((t) => t.px === pxv && /^--uon-/.test(t.name) && hit && hit.v.includes(t.name))
  const kind = auto ? 'auto (centring)' : brandTok ? 'brand token ' + brandTok.name : 'off-scale'
  const key = [r1(v), prop, short(e), src].join('||')
  if (!off.has(key)) off.set(key, { px: r1(v), prop, sel: short(e), src, kind, n: 0, where: new Set() })
  const o = off.get(key); o.n++; o.where.add(`${c.meta.l}${c.meta.width}`)
}
const allOff = [...off.values()].sort((a, b) => a.px - b.px || b.n - a.n)
const offRows = allOff.filter((o) => o.kind === 'off-scale')
const byPx = tally(offRows.flatMap((o) => Array(o.n).fill(o.px)), (x) => x)
J.spacing = { scale: SPACING.map((t) => t.px), onScale: Object.fromEntries(onScale), offScaleDistinctValues: byPx.length, offScale: offRows.map((o) => ({ ...o, where: [...o.where] })), notOnScaleButExplained: allOff.filter((o) => o.kind !== 'off-scale').map((o) => ({ ...o, where: [...o.where] })) }
md.push(`\n## 4. Spacing\n\nNon-zero margin / padding / row-gap / column-gap on visible elements, light captures. On-scale values (×occurrences): ${[...onScale].sort((a, b) => a[0] - b[0]).map(([k, n]) => `${k}px ${tokenAt(k)} ×${n}`).join(', ')}.\n\n**Off-scale: ${byPx.length} distinct px values, ${offRows.length} value/property/selector rows, ${offRows.reduce((a, o) => a + o.n, 0)} occurrences.** By value: ${byPx.map(([k, n]) => `${k}px ×${n}`).join(', ')}.\n\nThe rule is the last matching author rule in source order that sets the longhand (a cascade approximation: a more specific earlier rule can win; check the line).\n`)
md.push(table(['px', 'property', 'element', 'n', 'where', 'rule → declared value @ file:line'], offRows.map((o) => [o.px, o.prop, o.sel, o.n, [...o.where].join(' '), o.src])))
md.push(`\nNot on the spacing scale but explained (auto centring, or a brand token from \`tokens.brand.css\`):\n\n` + table(['px', 'property', 'element', 'n', 'kind', 'rule'], allOff.filter((o) => o.kind !== 'off-scale').map((o) => [o.px, o.prop, o.sel, o.n, o.kind, o.src])))

// vertical rhythm
md.push(`\n### 4.rhythm — rendered vertical gaps\n\n\`box\` = next box top − previous box bottom; \`ink\` = first text top − previous text bottom (glyph boxes, so half-leading excluded).\n`)
J.rhythm = {}
const rh = { 'heading→next block': [], 'label→control': [], 'control→helper': [], 'label→helper (field label to its helper)': [], 'panel→panel (main)': [], 'block→block (footer)': [] }
const textBottomOf = (els, h, upto) => h.textBottom ?? els.filter((x) => x.i > h.i && x.i < upto && x.textBottom != null && x.bottom <= h.bottom + 1).reduce((m, x) => Math.max(m, x.textBottom), -Infinity)
const textTopFrom = (els, b) => b.textTop ?? (els.find((x) => x.i > b.i && x.textTop != null && x.top >= b.top - 1 && x.bottom <= b.bottom + 1) || {}).textTop
const nameOf = (e) => short(e) + (e.id && !short(e).includes('#') ? '#' + e.id : '')
for (const c of light.filter((c) => c.meta.width === 1280 || c.meta.state === 'ready')) {
  const tag = `${c.meta.l}${c.meta.width}`
  const els = c.els
  for (const h of els.filter((e) => e.tag === 'h2' || e.tag === 'h3')) {
    const next = els.slice(h.i + 1).find((e) => e.top >= h.bottom - 1)
    if (!next || (next.panel !== h.panel && !next.chain.includes(h.panel) && !(next.s === h.panel))) continue
    const hb = textBottomOf(els, h, next.i); const nt = textTopFrom(els, next)
    rh['heading→next block'].push({ tag, a: h.tag + (h.id ? '#' + h.id : ' in ' + h.parent), b: nameOf(next), box: r1(next.top - h.bottom), ink: nt != null && isFinite(hb) ? r1(nt - hb) : null })
  }
  for (const lab of els.filter((e) => e.tag === 'label' && /\blabel\b/.test(e.cls))) {
    const ctl = els.slice(lab.i + 1).find((e) => /^(input|select|textarea)$/.test(e.tag) && e.top >= lab.bottom - 1)
    if (ctl && ctl.top - lab.bottom < 80) rh['label→control'].push({ tag, a: nameOf(lab), b: nameOf(ctl), box: r1(ctl.top - lab.bottom), ink: null })
  }
  for (const hp of els.filter((e) => /\bhelper\b/.test(e.cls) && e.tag !== 'span')) {
    let above = null
    for (let i = hp.i - 1; i >= 0; i--) { const e = els[i]; if (e.bottom <= hp.top + 1 && e.right > hp.left && e.left < hp.right && (!above || e.bottom > above.bottom)) above = e; if (e.top < hp.top - 400) break }
    const htop = textTopFrom(els, hp)
    if (above) rh['control→helper'].push({ tag, a: nameOf(above), b: nameOf(hp), box: r1(hp.top - above.bottom), ink: null })
    let lab = null
    for (let i = hp.i - 1; i >= 0; i--) { const e = els[i]; if (e.panel !== hp.panel && !hp.chain.includes(e.s)) break; if ((e.tag === 'legend' || (e.tag === 'label' && !/segment/.test(e.cls)) || /\blabel\b/.test(e.cls)) && e.bottom <= hp.top + 1) { lab = e; break } }
    if (lab) { const lb = textBottomOf(els, lab, hp.i); rh['label→helper (field label to its helper)'].push({ tag, a: nameOf(lab), b: nameOf(hp), box: r1(hp.top - lab.bottom), ink: htop != null && isFinite(lb) ? r1(htop - lb) : null }) }
  }
  const kids = els.filter((e) => e.parent === 'main#main.main')
  for (let i = 1; i < kids.length; i++) rh['panel→panel (main)'].push({ tag, a: kids[i - 1].s, b: kids[i].s, box: r1(kids[i].top - kids[i - 1].bottom), ink: null })
  const fin = els.find((e) => e.region === 'footer' && /band-inner/.test(e.cls))
  if (fin) { const fk = els.filter((e) => e.parent === fin.s); for (let i = 1; i < fk.length; i++) rh['block→block (footer)'].push({ tag, a: fk[i - 1].s, b: fk[i].s, box: r1(fk[i].top - fk[i - 1].bottom), ink: null }) }
}
for (const [k, list] of Object.entries(rh)) {
  const g = new Map()
  for (const x of list) { const key = `${x.box}|${x.ink ?? ''}|${x.a} → ${x.b}`; if (!g.has(key)) g.set(key, { ...x, tags: new Set() }); g.get(key).tags.add(x.tag) }
  const rows = [...g.values()].sort((a, b) => a.box - b.box)
  J.rhythm[k] = { distinctBox: uniq(list.map((x) => x.box)).sort((a, b) => a - b), distinctInk: uniq(list.map((x) => x.ink).filter((x) => x != null)).sort((a, b) => a - b), rows: rows.map((r) => ({ box: r.box, ink: r.ink, pair: `${r.a} → ${r.b}`, where: [...r.tags] })) }
  md.push(`\n#### ${k} — distinct box gaps: ${J.rhythm[k].distinctBox.join(', ')}${J.rhythm[k].distinctInk.length ? ' · ink gaps: ' + J.rhythm[k].distinctInk.join(', ') : ''}\n\n` + table(['box', 'ink', 'pair', 'where'], rows.map((r) => [r.box, r.ink ?? '', `${r.a} → ${r.b}`, [...r.tags].join(' ')])))
}

// --- overflow / clipping notes --------------------------------------------
md.push(`\n## 5. Overflow\n\n` + caps.map((c) => `- ${c.meta.name}: ${c.meta.hscroll ? `**sideways scroll** (scrollWidth ${c.meta.scrollWidth})` : 'no sideways scroll'}${c.meta.overflow?.length ? '; outside the viewport: ' + c.meta.overflow.slice(0, 5).map((o) => o.el).join('; ') : ''}`).join('\n') + '\n')
J.overflow = Object.fromEntries(caps.map((c) => [c.meta.name, { hscroll: c.meta.hscroll, offenders: (c.meta.overflow || []).length }]))

writeFileSync(OUT + '.md', md.join('\n'))
writeFileSync(OUT + '.json', JSON.stringify(J))
console.log(`wrote ${OUT}.md and .json from ${caps.length} captures`)
