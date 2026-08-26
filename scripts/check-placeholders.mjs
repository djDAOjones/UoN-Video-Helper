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

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { inspectPublicDirectory } from './public-inventory.mjs'

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

/**
 * `public/` is copied verbatim. Every permitted file is named so a forgotten
 * recording cannot ship merely because it used a different folder or suffix.
 */
const APPROVED_PUBLIC_ASSETS = new Map([
  ['public/branding/README.md', 'f9ae229b918f06de0edb429e16fbbbd4d63bbb83da89bcc05b5fd31486f65e31'],
  [
    'public/branding/closing-onset-fade-blue-1080p.webm',
    '94aa09f5cf5295e39401f0805643b164d231a21f2063eb13378eed7e7fe47f76',
  ],
  [
    'public/branding/closing-onset-fade-blue-2160p.webm',
    'dca3eefd5e3b9d7e6ffe7c9875082098d8f34ed5ff39e10789619ab121c61c85',
  ],
  [
    'public/branding/closing-onset-fade-white-1080p.webm',
    '1268b29826a882d4716ea5afd4015461bfd736b62bf30781e54ee7cb1bf3530e',
  ],
  [
    'public/branding/closing-onset-fade-white-2160p.webm',
    'c08209b438c4178a44485ffbfc92f850cdb30eb54dab7a9e40dc9a87aae738ba',
  ],
  [
    'public/branding/closing-onset-slide-blue-1080p.webm',
    'a5ecc81c8d74914944b2cb79af0739ab2e32bd03088c06defddc63833712901b',
  ],
  [
    'public/branding/closing-onset-slide-blue-2160p.webm',
    '4eb52634f3000fe381bbda267d62c387c5da8b47d630c6c8b52271d6d7598dae',
  ],
  [
    'public/branding/closing-onset-slide-white-1080p.webm',
    '7f07836c7d875b59fc5717ab39b168f9dee3458036e98c68398db7e61f0a6157',
  ],
  [
    'public/branding/closing-onset-slide-white-2160p.webm',
    'cd8a9754a5e3c748b4b68bca59637a799604b939bcea3ca77670ca3576c03477',
  ],
  [
    'public/branding/closing-tail-blue-1080p.mp4',
    '55c72de1c66a27d9a17de9085c5789ee1b7f8a2e2d736c3de672eb8f555f0861',
  ],
  [
    'public/branding/closing-tail-blue-2160p.mp4',
    '2cf1b28bd279beea8008dd7fa45fe80276af3dbb06430ff85beab31661469777',
  ],
  [
    'public/branding/closing-tail-white-1080p.mp4',
    'ac4177281340bc2e8f696c519fe6e18db6fa3ed68de7e826e42468acd9a01846',
  ],
  [
    'public/branding/closing-tail-white-2160p.mp4',
    '43108dc6d74f570121faa8095e258eac635fbcdc02437ce41b70fb1a2f975e78',
  ],
  [
    'public/branding/opening-1080p25.mp4',
    '05da64bfd65b4317344eb5de8538f9bf502d02a9344a8997bbf87e27f8cd7d58',
  ],
  [
    'public/branding/opening-1080p30.mp4',
    '88e7c7a433da836a863b3c40bba9c840d62ee55d7ec8750003eed1653fecfe73',
  ],
  [
    'public/branding/opening-2160p25.mp4',
    '787f1773931c6131e1611b31186f81737526ef6d01fdbeac34e6057b9a435b28',
  ],
  [
    'public/branding/opening-2160p30.mp4',
    '3978adb250855022197bf4821546dcddfec6d1b1e6ae7b65533aee68c160bbd3',
  ],
])

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

const publicDir = join(ROOT, 'public')
const publicInventory = inspectPublicDirectory(ROOT, publicDir, APPROVED_PUBLIC_ASSETS)
const unexpectedPublicFiles = publicInventory.unexpectedFiles
const missingPublicFiles = publicInventory.missingFiles
const mismatchedPublicFiles = publicInventory.mismatchedFiles
const invalidPublicEntries = publicInventory.invalidEntries

if (
  unexpectedPublicFiles.length > 0 ||
  missingPublicFiles.length > 0 ||
  mismatchedPublicFiles.length > 0 ||
  invalidPublicEntries.length > 0
) {
  console.error(
    `check-placeholders: public asset review failed (${unexpectedPublicFiles.length} unexpected, ${missingPublicFiles.length} missing, ${mismatchedPublicFiles.length} changed, ${invalidPublicEntries.length} unsafe):`,
  )
  for (const file of unexpectedPublicFiles) console.error(`  ${file}`)
  for (const file of missingPublicFiles) console.error(`  ${file} (missing)`)
  for (const file of mismatchedPublicFiles) console.error(`  ${file} (contents changed)`)
  for (const entry of invalidPublicEntries) console.error(`  ${entry}`)
  console.error(
    '  Restore the reviewed bytes, or update the manifest only after reviewing the asset.',
  )
  process.exit(1)
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
