import { execSync } from 'node:child_process'
import { defineConfig } from 'vitest/config'

import pkg from './package.json' with { type: 'json' }

/**
 * Build identity, per DEV-INFRASTRUCTURE.md -> "Version management".
 * Product version answers "what release is this?"; build id answers
 * "exactly what code is live?". Both are non-secret and safe to copy.
 */
function buildId(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let sha = 'nogit'
  try {
    sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    // Not a git checkout (e.g. an extracted tarball). A build without a
    // commit trace is worth shipping; a build that fails to exist is not.
  }
  return `v${pkg.version}+${stamp}.${sha}`
}

export default defineConfig({
  // A GitHub Pages project site serves from `/<repo>/`, not the root. The
  // deploy workflow sets BASE_PATH; local dev and the acceptance run leave it
  // unset and stay at `/`. Runtime asset URLs read `import.meta.env.BASE_URL`
  // so they follow this automatically.
  base: process.env['BASE_PATH'] ?? '/',
  server: {
    // Honour PORT when something upstream assigns one (preview tooling, a
    // container, a shared machine). Falls back to Vite's default otherwise,
    // and `strictPort` stays off so a neighbour holding 5173 moves us rather
    // than stopping us. See DEV-INFRASTRUCTURE.md -> "Dev server".
    port: Number(process.env['PORT']) || 5173,
  },
  define: {
    __APP_VERSION__: JSON.stringify(`v${pkg.version}`),
    __BUILD_ID__: JSON.stringify(buildId()),
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      // Only the app ships. `acceptance.html` is a maintainer tool served in
      // development; building it would put a test harness in production for
      // no one's benefit.
      input: { app: 'index.html' },
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
    // The audio chain tests push 90-120 seconds of synthesised speech through
    // the full DSP chain, which legitimately takes seconds rather than
    // milliseconds. Locally the slowest sits at ~3.9 s, comfortably under
    // vitest's 5 s default — but a shared CI runner is around 1.5x slower and
    // three of them timed out on the first deploy that ran the gate in CI.
    //
    // Raised rather than shortened, because the signal lengths are what make
    // the gating and anti-pumping assertions meaningful. This only changes how
    // long a HUNG test takes to fail; it weakens no assertion.
    testTimeout: 30_000,
  },
})
