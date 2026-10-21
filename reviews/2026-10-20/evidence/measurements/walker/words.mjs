// Word counts per state (VH-143): the visible text the walker saved beside each capture, counted
// as words (Latin, split on spaces) and as glyphs (CJK), against VH-124's after-captures where a
// state matches. Usage: node words.mjs <out-root> <vh-124 after dir>
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const [outRoot, afterDir] = process.argv.slice(2)
if (!outRoot) {
  console.log('usage: node words.mjs <out-root> [vh-124 after dir]')
  process.exit(1)
}
const CJK = new RegExp('[' + String.fromCharCode(0x3000) + '-' + String.fromCharCode(0x9fff) + String.fromCharCode(0xff00) + '-' + String.fromCharCode(0xffef) + ']', 'g')
const count = (text) => {
  const cjk = (text.match(CJK) ?? []).length
  const latin = text.replace(CJK, ' ').split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length
  return { words: latin, cjk, lines: text.split('\n').filter((l) => l.trim()).length }
}
// VH-124's 29 states against the walker's desktop-en-staff and phone-en-staff captures.
const MAP = [
  ['01', 'Empty', 'desktop-en-staff/01-empty'],
  ['02', 'Drag held', 'desktop-en-staff/02-drag-held'],
  ['03', 'Drop refused', 'desktop-en-staff/03-drop-refused'],
  ['04', 'Feedback', 'desktop-en-staff/04-feedback'],
  ['05', 'Errors captured', 'desktop-en-staff/45-errors-captured'],
  ['06', 'Reading', 'desktop-en-staff/05-reading'],
  ['07', 'Checking', 'desktop-en-staff/06-checking'],
  ['08', 'Ready', 'desktop-en-staff/07-ready'],
  ['09', 'Help open', 'desktop-en-staff/08-help-open'],
  ['10', 'Trim invalid', 'desktop-en-staff/09-trim-invalid'],
  ['11', 'Check after trim', 'desktop-en-staff/10-check-after-trim'],
  ['12', 'Check stopped', 'desktop-en-staff/13-check-stopped'],
  ['13', 'Ready trimmed', 'desktop-en-staff/11-ready-trimmed'],
  ['14', 'Running', 'desktop-en-staff/23-running'],
  ['15', 'Cancelling', 'desktop-en-staff/25-cancelling'],
  ['16', 'Cancelled', 'desktop-en-staff/26-cancelled'],
  ['17', 'Ready with sound notes', 'desktop-en-staff/40-quiet'],
  ['18', 'Finished', 'desktop-en-staff/27-finished'],
  ['19', 'Discard question', 'desktop-en-staff/28-discard-question'],
  ['20', 'Saving', 'desktop-en-staff/30-saving'],
  ['21', 'Saved', 'desktop-en-staff/31-saved'],
  ['22', 'Previous video and losses', 'desktop-en-staff/32-previous-video'],
  ['23', 'Download handed off', 'phone-en-staff/09-download-handed-off'],
  ['24', 'Blocked file', 'desktop-en-staff/35-blocked-file'],
  ['25', 'Unreadable', 'desktop-en-staff/36-unreadable'],
  ['26', 'Too short', 'desktop-en-staff/37-too-short'],
  ['27', 'Silent', 'desktop-en-staff/38-silent'],
  ['28', 'Storage block', null],
  ['29', 'Failed', 'desktop-en-staff/44-failed'],
]
const lines = ['# Word counts — ' + new Date().toISOString().slice(0, 10), '']
if (afterDir && existsSync(afterDir)) {
  const after = JSON.parse(readFileSync(join(afterDir, 'desktop-text.json'), 'utf8'))
  const afterPhone = existsSync(join(afterDir, 'phone-text.json')) ? JSON.parse(readFileSync(join(afterDir, 'phone-text.json'), 'utf8')) : {}
  lines.push('## VH-124\'s 29 states, 1 October against now (English, desktop unless the state is the phone\'s)', '')
  lines.push('| # | State | 1 Oct words | Now words | Change | Now lines | Capture |', '| --- | --- | --- | --- | --- | --- | --- |')
  for (const [n, title, cap] of MAP) {
    const key = Object.keys(after).find((k) => k.startsWith(n + '-')) ?? Object.keys(afterPhone).find((k) => k.startsWith(n + '-'))
    const src = after[key] ?? afterPhone[key]
    const before = src ? count(src.text ?? '') : null
    const file = cap ? join(outRoot, cap + '.txt') : null
    const now = file && existsSync(file) ? count(readFileSync(file, 'utf8')) : null
    const delta = before && now ? (now.words - before.words > 0 ? '+' : '') + (now.words - before.words) : ''
    lines.push(`| ${n} | ${title} | ${before ? before.words : '—'} | ${now ? now.words : '—'} | ${delta} | ${now ? now.lines : '—'} | ${cap ?? 'not walked (source only)'} |`)
  }
  lines.push('')
}
lines.push('## Every capture, by walk (words, CJK glyphs, non-empty lines)', '')
for (const sc of readdirSync(outRoot).filter((d) => statSync(join(outRoot, d)).isDirectory()).sort()) {
  const files = readdirSync(join(outRoot, sc)).filter((f) => f.endsWith('.txt') && !/-(dark|forced|reflow320|zoom200|textspacing)\.txt$/.test(f) && f !== 'log.txt').sort()
  if (!files.length) continue
  lines.push(`### ${sc}`, '', '| capture | words | CJK | lines |', '| --- | --- | --- | --- |')
  for (const f of files) {
    const c = count(readFileSync(join(outRoot, sc, f), 'utf8'))
    lines.push(`| ${f.replace('.txt', '')} | ${c.words} | ${c.cjk} | ${c.lines} |`)
  }
  lines.push('')
}
console.log(lines.join('\n'))
