// Summarises a capture's JSON: what breaks a rule, in a few lines.
// Usage: node digest.mjs <out-dir> [name-prefix]   (--full prints every target and line)
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const [dir, prefix = ''] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const full = process.argv.includes('--full')
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && f.startsWith(prefix)).sort()
for (const f of files) {
  const j = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  const lines = []
  lines.push(`## ${f.replace('.json', '')}  [${j.view}/${j.theme}] ${j.page.w}x${j.page.h} title="${j.title}" lang=${j.lang}${j.overflow.hscroll ? '  HSCROLL ' + j.overflow.scrollWidth : ''}`)
  if (j.overflow.offenders.length) lines.push('  overflow: ' + j.overflow.offenders.map((o) => `${o.el} [${o.left}..${o.right}]`).join(' | '))
  if (j.liveSinceLast.length) lines.push('  live: ' + j.liveSinceLast.map((l) => `${l.t}ms ${l.region}${l.hidden ? '(hidden)' : ''}: "${l.text.slice(0, 110)}"`).join('\n        '))
  if (j.activeElement && j.activeElement.el !== 'body') lines.push(`  focus: ${j.activeElement.el} vis=${j.activeElement.focusVisible} outline=${j.activeElement.outline} inView=${j.activeElement.inView}`)
  if (j.errors && j.errors.length) lines.push('  page errors: ' + j.errors.map((e) => e.message).join(' | '))
  if (j.saves && j.saves.length) lines.push('  saves: ' + j.saves.map((s) => s.name).join(' | '))
  if (j.contrastFails) {
    const fails = j.contrastFails.filter(() => j.theme !== 'forced')
    lines.push(`  contrast: ${j.contrastCount} runs, ${fails.length} under target` + (fails.length ? ': ' + fails.map((c) => `${c.el} "${c.text}" ${c.ratio}:1 (${c.fg} on ${c.bg}, ${c.size}px${c.bold ? ' bold' : ''}, need ${c.need})`).join(' | ') : ''))
  }
  if (j.targets) {
    const small = j.targets.filter((t) => (t.w < 44 || t.h < 44) && !t.inline && !(t.labelBox && t.labelBox.split('x').every((n) => Number(n) >= 44)))
    lines.push(`  targets: ${j.targets.length}, under 44: ${small.length}` + (small.length ? ': ' + small.map((t) => `${t.el} ${t.w}x${t.h}${t.labelBox ? ' label ' + t.labelBox : ''}${t.disabled ? ' disabled' : ''}`).join(' | ') : ''))
    if (full) for (const t of j.targets) lines.push(`    ${t.w}x${t.h} ${t.labelBox ? 'label ' + t.labelBox + ' ' : ''}${t.inline ? 'inline ' : ''}${t.el}`)
  }
  if (j.lineLengths) {
    const long = j.lineLengths.filter((l) => (l.cjk ? l.chars > 40 : l.chars > 80))
    const widest = j.lineLengths.reduce((m, l) => (l.chars > m.chars ? l : m), { chars: 0 })
    lines.push(`  lines: ${j.lineLengths.length} blocks, widest ${widest.chars} chars (${widest.el}), over the limit: ${long.length}` + (long.length ? ': ' + long.map((l) => `${l.el} ${l.chars}ch/${l.widestPx}px`).join(' | ') : ''))
    if (full) for (const l of j.lineLengths) lines.push(`    ${l.chars}ch ${l.widestPx}px lh=${l.lineHeight} fs=${l.fontSize} ${l.el} "${l.text}"`)
  }
  if (j.tabWalk) {
    const bad = j.tabWalk.filter((s) => !s.focusVisible || s.obscured.length || !s.inView)
    lines.push(`  tab walk: ${j.tabWalk.length} stops; not focus-visible/obscured/out of view: ${bad.length}` + (bad.length ? ': ' + bad.map((s) => `${s.el} vis=${s.focusVisible} obscured=${s.obscured.join('+')} inView=${s.inView}`).join(' | ') : ''))
    lines.push('    order: ' + j.tabWalk.map((s) => s.el.replace(/\.[^ []*/g, '').slice(0, 44)).join(' > '))
  }
  if (j.headings) lines.push('  headings: ' + j.headings.join(' | '))
  if (j.boot && j.boot.langChanges) lines.push('  boot: ' + JSON.stringify(j.boot))
  console.log(lines.join('\n'))
}
