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

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

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
 *
 * The allow-list is "committed to this repository", not a list of names
 * (VH-65). The branding assets are tracked; a lecture copied in by hand is
 * not, wherever under `public/` it was put. A list of names would have to be
 * updated every time an asset is added, and the day it is not is the day the
 * guard stops guarding.
 */
const MEDIA_EXTENSIONS = /\.(mp4|mov|mkv|webm|m4v|avi|mp3|wav|m4a|aac|flac|ogg)$/i

/** Files git knows about, or `null` when this is not a checkout. */
function trackedFiles() {
  try {
    const listed = execFileSync('git', ['ls-files', '-z', 'public'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return new Set(listed.split('\0').filter(Boolean))
  } catch {
    // Not a checkout, or no git. Fall back to the directory rule below rather
    // than to trusting everything.
    return null
  }
}

function mediaUnder(dir, found = []) {
  if (!existsSync(dir)) return found
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) mediaUnder(full, found)
    else if (MEDIA_EXTENSIONS.test(name)) found.push(relative(ROOT, full).split(sep).join('/'))
  }
  return found
}

const publicDir = join(ROOT, 'public')
const tracked = trackedFiles()
const strays = mediaUnder(publicDir).filter((path) =>
  // Without git, fall back to the original rule: anything under public/spike/
  // is a hand-copied fixture by definition.
  tracked ? !tracked.has(path) : path.startsWith('public/spike/'),
)

if (strays.length > 0) {
  console.error(
    `check-placeholders: ${strays.length} media file(s) under public/ would be copied into the build:`,
  )
  for (const stray of strays) console.error(`  ${stray}`)
  console.error(
    tracked
      ? '  Only media committed to this repository may be published. These are not.'
      : '  Spike fixtures are real recordings. Remove them before building.',
  )
  process.exit(1)
}

// Anything else left in public/spike/ still says so, because that directory
// exists only for hand-copied fixtures.
const spikeDir = join(publicDir, 'spike')
if (existsSync(spikeDir)) {
  const leftovers = readdirSync(spikeDir).filter((name) => !name.startsWith('.'))
  if (leftovers.length > 0) {
    console.error(
      `check-placeholders: ${leftovers.length} file(s) in public/spike/ would be copied into the build:`,
    )
    for (const stray of leftovers) console.error(`  public/spike/${stray}`)
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
