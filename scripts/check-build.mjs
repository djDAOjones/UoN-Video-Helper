#!/usr/bin/env node
/**
 * Verifies the production bundle without writing the repository's `dist/`.
 *
 * `npm run build` deliberately produces the deployable artifact in `dist/`.
 * The quality gate has a different contract — `AGENTS.md` → "One-command
 * quality gate": it reports, it never writes. Running `build` inside `check`
 * broke that on every run, and it is not a theoretical breach: a gate that
 * rewrites `dist/` cannot honestly certify a change to what `dist/` contains,
 * because it has already replaced the evidence (VH-76).
 *
 * So the gate's bundle check goes to an isolated temporary directory, which is
 * removed on every exit path INCLUDING a signal — `finally` alone does not run
 * on SIGINT, and a gate interrupted with Ctrl-C is an ordinary event rather
 * than an exceptional one.
 *
 * Two bundles ship, so both are built: the site (`npm run build`) and the
 * Xerte package (`npm run build:xerte`). The package's one structural promise
 * is checked too — no folders — because the maintainer uploads it to Xerte as
 * a single flat folder, where a subdirectory is a broken upload (2026-09-21).
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const outputDirectory = mkdtempSync(join(tmpdir(), 'uon-video-helper-check-build-'))

const clean = () => {
  rmSync(outputDirectory, { recursive: true, force: true })
}

// Signals first, so an interrupt during the build cannot leave the directory
// behind. `process.exit` in the handler is deliberate: without it Node would
// carry on and the default handler would never run.
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.once(signal, () => {
    clean()
    process.exit(1)
  })
}

/** Builds one bundle into its own subdirectory of the temporary directory. */
function build(name, modeArguments) {
  const directory = join(outputDirectory, name)
  execFileSync(
    process.execPath,
    [
      join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'),
      'build',
      ...modeArguments,
      '--outDir',
      directory,
      // The directory is outside the project root, so Vite asks before
      // emptying it. It is ours and was made empty a moment ago.
      '--emptyOutDir',
    ],
    { stdio: 'inherit' },
  )
  return directory
}

try {
  build('site', [])
  const xerte = build('xerte', ['--mode', 'xerte'])
  const folders = readdirSync(xerte, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  if (folders.length > 0) {
    console.error(
      `check:build: the Xerte package must be flat, but contains ${folders.map((entry) => `${entry.name}/`).join(', ')}`,
    )
    process.exitCode = 1
  }
} finally {
  clean()
}
