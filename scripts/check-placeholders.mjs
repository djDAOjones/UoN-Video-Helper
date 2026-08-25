#!/usr/bin/env node
/**
 * Tier 0 of the quality gate: catch stray template markers and key-shaped
 * strings before they ship.
 *
 * Two passes with different severities:
 *   - Placeholder markers  -> FAIL. An unpopulated rulebook section is a lie
 *                             about what the project has decided.
 *   - Key-shaped strings   -> REPORT ONLY. This exists to catch a pasted
 *                             credential, not to gate.
 *
 * Text inside `backticks` is skipped: a marker quoted in documentation is
 * writing *about* the marker, not an unpopulated one.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', 'pm_skills', 'samples'])

const PLACEHOLDERS = [/<!--\s*CUSTOMISE/, /\[Project Name\]/, /\[short product description\]/]

const KEY_SHAPES = [
  { name: 'OpenAI-style key', re: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
  { name: 'Private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
]

/** Strips inline code spans and fenced blocks so quoted markers do not trip the scan. */
function stripCode(line) {
  return line.replace(/`[^`]*`/g, '``')
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else yield full
  }
}

const SCANNED = /\.(md|ts|js|mjs|css|html|json|jsonc)$/

const failures = []
const notices = []

for (const file of walk(ROOT)) {
  if (!SCANNED.test(file)) continue
  const rel = relative(ROOT, file)
  if (rel === relative(ROOT, join(ROOT, 'scripts', 'check-placeholders.mjs'))) continue

  const lines = readFileSync(file, 'utf8').split('\n')
  let inFence = false

  lines.forEach((raw, index) => {
    if (/^\s*```/.test(raw)) inFence = !inFence
    if (inFence) return

    const line = stripCode(raw)
    for (const re of PLACEHOLDERS) {
      if (re.test(line)) failures.push(`${rel}:${index + 1}  ${raw.trim().slice(0, 100)}`)
    }
    for (const { name, re } of KEY_SHAPES) {
      if (re.test(raw)) notices.push(`${rel}:${index + 1}  possible ${name}`)
    }
  })
}

/**
 * `public/` is copied verbatim into `dist`, so anything left there ships.
 *
 * Spike fixtures are real lecture recordings copied in from `samples/` by
 * hand. They are gitignored, which stops them being committed but does NOT
 * stop Vite copying them into a build — and this project's first invariant is
 * that no media leaves the device. A forgotten fixture in a deployed build
 * would publish someone's lecture.
 */
const spikeDir = join(ROOT, 'public', 'spike')
if (existsSync(spikeDir)) {
  const strays = readdirSync(spikeDir).filter((name) => !name.startsWith('.'))
  if (strays.length > 0) {
    console.error(
      `check-placeholders: ${strays.length} file(s) in public/spike/ would be copied into the build:`,
    )
    for (const stray of strays) console.error(`  public/spike/${stray}`)
    console.error('  Spike fixtures are real recordings. Remove them before building.')
    process.exit(1)
  }
}

if (notices.length) {
  console.warn('check-placeholders: key-shaped strings found (report only):')
  for (const notice of notices) console.warn(`  ${notice}`)
}

if (failures.length) {
  console.error(`check-placeholders: ${failures.length} unpopulated placeholder(s):`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log('check-placeholders: clean')
