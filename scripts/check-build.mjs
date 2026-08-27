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
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
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

try {
  execFileSync(
    process.execPath,
    [
      join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'),
      'build',
      '--outDir',
      outputDirectory,
      // The directory is outside the project root, so Vite asks before
      // emptying it. It is ours and was made empty a moment ago.
      '--emptyOutDir',
    ],
    { stdio: 'inherit' },
  )
} finally {
  clean()
}
