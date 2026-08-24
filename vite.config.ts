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
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
  },
})
