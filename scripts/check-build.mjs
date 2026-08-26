#!/usr/bin/env node
/**
 * Verifies the production bundle without writing the repository's `dist/`.
 *
 * `npm run build` deliberately produces the deployable artifact in `dist/`.
 * The quality gate has a different contract: it is report-only, so its bundle
 * check uses an isolated temporary output and removes it on every exit path.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const outputDirectory = mkdtempSync(join(tmpdir(), 'uon-video-helper-check-build-'))

try {
  execFileSync(
    process.execPath,
    [
      join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'),
      'build',
      '--outDir',
      outputDirectory,
      '--emptyOutDir',
    ],
    { stdio: 'inherit' },
  )
} finally {
  rmSync(outputDirectory, { recursive: true, force: true })
}
