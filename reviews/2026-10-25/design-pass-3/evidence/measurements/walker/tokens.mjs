// The token sweep (VH-143): every computed length, type and colour the walker recorded for every
// visible element in every captured state, traced to a token in the two token files on Carbon's
// scale. Anything else is listed, grouped by element, value and theme, for the design pass to judge.
// Usage: node tokens.mjs <out-root> [scenario...]      REPO=<repo root> locates src/styles (default: this bundle's repo)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = process.env.REPO ?? resolve(HERE, '../../../../..')
const [outRoot, ...only] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const FULL = process.argv.includes('--full')
if (!outRoot) {
  console.log('usage: node tokens.mjs <out-root> [scenario...]')
  process.exit(1)
}

// --- the token model --------------------------------------------------------
const carbon = readFileSync(join(REPO, 'src/styles/tokens.carbon.css'), 'utf8')
const brand = readFileSync(join(REPO, 'src/styles/tokens.brand.css'), 'utf8')
const declsOf = (body) => {
  const out = {}
  for (const d of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[d[1]] = d[2].replace(/\s+/g, ' ').trim()
  return out
}
const block = (css, re) => {
  const m = css.match(re)
  return m ? declsOf(m[1]) : {}
}
const carbonRoot = block(carbon, /:root\s*\{([^}]*)\}/)
const brandRoot = block(brand, /:root\s*\{([^}]*)\}/)
const brandDark = block(brand, /@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([^}]*)\}/)
const brandBand = block(brand, /\.on-brand-blue\s*\{([^}]*)\}/)
const light = { ...carbonRoot, ...brandRoot }
const dark = { ...light, ...brandDark }
const band = { ...light, ...brandBand }
const deref = (v, table, depth = 0) =>
  depth > 8 ? v : v.replace(/var\((--[a-z0-9-]+)\)/g, (m, n) => (table[n] !== undefined ? deref(table[n], table, depth + 1) : m))
const resolved = (table) => Object.fromEntries(Object.entries(table).map(([k, v]) => [k, deref(v, table)]))
const THEMES = { light: resolved(light), dark: resolved(dark), band: resolved(band) }

const hexToRgb = (hex) => {
  const h = hex.slice(1)
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const v = parseInt(n, 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
const rgbKey = (r, g, b, a = 1) => (a >= 0.999 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`)
/** A computed colour normalised to rgb()/rgba() with rounded channels. */
const normColour = (c) => {
  if (!c) return c
  let m = c.match(/^rgba?\(([^)]+)\)$/)
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
    return rgbKey(Math.round(p[0]), Math.round(p[1]), Math.round(p[2]), p.length > 3 ? p[3] : 1)
  }
  m = c.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/)
  if (m) return rgbKey(Math.round(+m[1] * 255), Math.round(+m[2] * 255), Math.round(+m[3] * 255), m[4] === undefined ? 1 : +m[4])
  return c
}
/** The colours a theme's tokens resolve to, keyed by normalised rgb, naming the tokens. */
const colourSet = (table) => {
  const out = new Map()
  const add = (key, name) => out.set(key, (out.get(key) ? out.get(key) + ', ' : '') + name)
  for (const [name, v] of Object.entries(table)) {
    let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
    if (m) {
      const [r, g, b] = hexToRgb(v)
      add(rgbKey(r, g, b), name)
      continue
    }
    m = v.match(/^color-mix\(in srgb, (#[0-9a-f]{6}) (\d+)%, transparent\)$/i)
    if (m) {
      const [r, g, b] = hexToRgb(m[1])
      add(rgbKey(r, g, b, +m[2] / 100), name)
    }
  }
  add('rgba(0, 0, 0, 0)', 'transparent')
  return out
}
const COLOURS = { light: colourSet(THEMES.light), dark: colourSet(THEMES.dark), band: colourSet(THEMES.band) }
/** Every px length a token resolves to (rem at 16 px), naming the tokens; ch, em and vh stay unresolved. */
const lengthSet = () => {
  const out = new Map()
  const unresolved = []
  for (const [name, v] of Object.entries(THEMES.light)) {
    const m = v.match(/^(-?\d*\.?\d+)(px|rem)$/)
    if (m) {
      const px = m[2] === 'rem' ? +m[1] * 16 : +m[1]
      const key = String(Math.round(px * 100) / 100)
      out.set(key, (out.get(key) ? out.get(key) + ', ' : '') + name)
    } else if (/^-?\d*\.?\d+(ch|em|vh)$/.test(v)) unresolved.push(`${name}: ${v}`)
  }
  out.set('0', '0')
  return { set: out, unresolved }
}
const LENGTHS = lengthSet()
const FONT_SIZES = new Map()
for (const [name, v] of Object.entries(THEMES.light)) if (name.startsWith('--type-')) FONT_SIZES.set(String(parseFloat(v) * 16), name)
const LINE_HEIGHTS = { 1.5: '--line-height-body', 1.25: '--line-height-heading' }
const BORDER_WIDTHS = new Set(['0', '1', '2', '4'])
const FONT_OK = /^(Arial|Lora|Georgia|"Lora"|"Times New Roman"|PingFang SC|"PingFang SC"|system-ui|-apple-system|"Segoe UI"|Roboto|"Hiragino Sans GB"|"Microsoft YaHei"|"Noto Sans SC"|"Source Han Sans SC"|sans-serif|serif)/

// --- the sweep ---------------------------------------------------------------
const px = (v) => {
  const m = String(v).match(/^(-?\d*\.?\d+)px$/)
  return m ? Math.round(+m[1] * 100) / 100 : null
}
const SPACING = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap']
const BORDERS = ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'outlineWidth', 'outlineOffset']
const RADII = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius']
const COLOUR_PROPS = ['color', 'backgroundColor', 'borderTopColor', 'borderBottomColor', 'outlineColor']
const SIZES = ['minHeight', 'minWidth', 'maxWidth']

const findings = new Map() // key -> { theme, group, prop, value, who, count, where: Set, note }
const totals = { captures: 0, elements: 0, values: 0, off: 0 }
const note = (theme, group, prop, value, who, where, extra = '') => {
  const key = [theme, group, prop, value, who, extra].join('|')
  const f = findings.get(key) ?? { theme, group, prop, value, who, extra, count: 0, where: new Set() }
  f.count++
  if (f.where.size < 4) f.where.add(where)
  findings.set(key, f)
  totals.off++
}
const judgeLengths = (row, pfx, theme, who, where) => {
  for (const p of SPACING) {
    const v = row[p]
    if (v === undefined) continue
    totals.values++
    if (v === 'auto' || v === 'normal' || v === '0px') continue
    const n = px(v)
    if (n === null) { note(theme, 'spacing', pfx + p, v, who, where, 'not px'); continue }
    if (!LENGTHS.set.has(String(Math.abs(n)))) note(theme, 'spacing', pfx + p, v, who, where)
  }
  for (const p of BORDERS) {
    const v = row[p]
    if (v === undefined) continue
    totals.values++
    const n = px(v)
    if (n === null || !BORDER_WIDTHS.has(String(Math.abs(n)))) note(theme, 'edges', pfx + p, v, who, where)
  }
  for (const p of RADII) {
    const v = row[p]
    if (v === undefined) continue
    totals.values++
    if (v !== '0px') note(theme, 'radius', pfx + p, v, who, where)
  }
  for (const p of SIZES) {
    const v = row[p]
    if (v === undefined) continue
    totals.values++
    if (v === 'none' || v === 'auto' || v === '0px' || /%$/.test(v)) continue
    const n = px(v)
    if (n === null) { note(theme, 'sizes', pfx + p, v, who, where); continue }
    if (!LENGTHS.set.has(String(n))) {
      // a measure (55ch, 40em) or a viewport cap (60vh) resolves per element; say so rather than judge
      const fs = px(row.fontSize)
      const asEm = fs ? Math.round((n / fs) * 100) / 100 : null
      note(theme, 'sizes', pfx + p, v, who, where, asEm ? `= ${asEm}em at ${row.fontSize}` : '')
    }
  }
  // type
  if (row.fontSize !== undefined) {
    totals.values++
    const fs = px(row.fontSize)
    if (fs === null || !FONT_SIZES.has(String(fs))) note(theme, 'type', pfx + 'fontSize', row.fontSize, who, where)
    totals.values++
    const lh = row.lineHeight
    if (lh === 'normal') note(theme, 'type', pfx + 'lineHeight', 'normal (the browser\'s own)', who, where)
    else if (fs) {
      const ratio = Math.round((px(lh) / fs) * 100) / 100
      if (!LINE_HEIGHTS[ratio]) note(theme, 'type', pfx + 'lineHeight', `${lh} = ${ratio} × ${row.fontSize}`, who, where)
    }
    totals.values++
    if (!['400', '700'].includes(String(row.fontWeight))) note(theme, 'type', pfx + 'fontWeight', String(row.fontWeight), who, where)
    totals.values++
    if (row.fontFamily && !FONT_OK.test(row.fontFamily)) note(theme, 'type', pfx + 'fontFamily', row.fontFamily.slice(0, 60), who, where)
    if (row.letterSpacing && row.letterSpacing !== 'normal' && row.letterSpacing !== '0px') note(theme, 'type', pfx + 'letterSpacing', row.letterSpacing, who, where)
    if (row.textAlign === 'justify') note(theme, 'type', pfx + 'textAlign', 'justify', who, where)
    if (row.textTransform && row.textTransform !== 'none') note(theme, 'type', pfx + 'textTransform', row.textTransform, who, where)
  }
}
const judgeColours = (row, pfx, theme, who, where) => {
  if (theme === 'forced') return
  const set = COLOURS[row.band ? 'band' : theme] ?? COLOURS.light
  for (const p of COLOUR_PROPS) {
    const v = row[p]
    if (v === undefined) continue
    if (p === 'outlineColor' && row.outlineStyle === 'none') continue
    if ((p === 'borderTopColor' || p === 'borderBottomColor') && row.borderTopStyle === 'none' && px(row.borderTopWidth) === 0) continue
    totals.values++
    const key = normColour(v)
    if (key === 'rgba(0, 0, 0, 0)') continue
    if (!set.has(key)) note(theme, 'colour', pfx + p, key, who, where)
  }
  if (row.opacity !== undefined && row.opacity !== '1') note(theme, 'colour', pfx + 'opacity', row.opacity, who, where)
}

const scenarios = readdirSync(outRoot).filter((d) => statSync(join(outRoot, d)).isDirectory() && (!only.length || only.includes(d)))
for (const sc of scenarios) {
  const dir = join(outRoot, sc)
  for (const f of readdirSync(dir).filter((f) => f.endsWith('-styles.json')).sort()) {
    const state = f.replace('-styles.json', '')
    const meta = existsSync(join(dir, state + '.json')) ? JSON.parse(readFileSync(join(dir, state + '.json'), 'utf8')) : {}
    const theme = meta.theme ?? (/-dark$/.test(state) ? 'dark' : /-forced$/.test(state) ? 'forced' : 'light')
    const where = `${sc}/${state}`
    const rows = JSON.parse(readFileSync(join(dir, f), 'utf8'))
    totals.captures++
    for (const row of rows) {
      totals.elements++
      const who = row.tag + (row.cls ? '.' + row.cls.split(/\s+/).slice(0, 2).join('.') : '')
      judgeLengths(row, '', theme, who, where)
      judgeColours(row, '', theme, who, where)
      for (const pe of ['::before', '::after']) {
        if (!row[pe]) continue
        judgeLengths(row[pe], pe + ' ', theme, who, where)
        judgeColours({ ...row[pe], band: row.band }, pe + ' ', theme, who, where)
      }
    }
  }
}

// --- the report --------------------------------------------------------------
const lines = []
lines.push('# Token sweep — ' + new Date().toISOString().slice(0, 10))
lines.push('')
lines.push(`Captures swept: ${totals.captures}; visible elements: ${totals.elements}; values judged: ${totals.values}; values off a token: ${totals.off} (${findings.size} distinct, grouped by theme, property, value and element).`)
lines.push('')
lines.push('## The model')
lines.push('')
lines.push('Lengths accepted (px → token): ' + Array.from(LENGTHS.set.entries()).sort((a, b) => +a[0] - +b[0]).map(([k, v]) => `${k} (${v})`).join('; '))
lines.push('Unresolved tokens, judged per element in "sizes": ' + LENGTHS.unresolved.join('; '))
lines.push('Font sizes accepted: ' + Array.from(FONT_SIZES.entries()).map(([k, v]) => `${k} (${v})`).join('; ') + '. Line heights: 1.5, 1.25. Weights: 400, 700. Edges: 0, 1, 2, 4. Radius: 0 (Carbon productive has no radius token).')
for (const t of ['light', 'dark', 'band']) lines.push(`Colours, ${t}: ` + Array.from(COLOURS[t].entries()).map(([k, v]) => `${k} (${v.split(', ').slice(0, 3).join(', ')}${v.split(', ').length > 3 ? ', …' : ''})`).join('; '))
lines.push('Forced colours are system colours and are not judged here; the band (`.on-brand-blue`) takes the dark roles.')
lines.push('')
const groups = ['spacing', 'type', 'edges', 'radius', 'colour', 'sizes']
for (const g of groups) {
  const rows = Array.from(findings.values()).filter((f) => f.group === g).sort((a, b) => b.count - a.count || a.who.localeCompare(b.who))
  lines.push(`## ${g} — ${rows.reduce((n, r) => n + r.count, 0)} values off a token in ${rows.length} groups`)
  lines.push('')
  if (!rows.length) { lines.push('None.'); lines.push(''); continue }
  lines.push('| theme | property | value | element | count | where (first) | note |')
  lines.push('| --- | --- | --- | --- | --- | --- | --- |')
  const cap = FULL ? rows.length : 120
  for (const r of rows.slice(0, cap)) lines.push(`| ${r.theme} | ${r.prop} | ${r.value} | ${r.who} | ${r.count} | ${Array.from(r.where).slice(0, 2).join(', ')} | ${r.extra} |`)
  if (rows.length > cap) lines.push(`| … | ${rows.length - cap} more groups (run with --full) | | | | | |`)
  lines.push('')
}
console.log(lines.join('\n'))
