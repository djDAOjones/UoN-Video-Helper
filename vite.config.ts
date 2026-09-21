import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vitest/config'

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

/**
 * Keeps maintainer-only files out of the published build.
 *
 * Vite copies `public/` wholesale, which is exactly right for the branding
 * assets and exactly wrong for the notes sitting beside them: ticket IDs, build
 * instructions and an alpha-decode measurement table are for whoever maintains
 * the assets, not for the site's visitors. Confirmed shipping — the deployed
 * site returned 200 for `/branding/README.md` on 2026-08-25 (VH-40).
 *
 * Deleting after the copy rather than filtering before it, because Vite offers
 * no per-file exclusion for `publicDir` and moving the notes away from the
 * assets they describe would cost more than it saves.
 */
function excludeFromBuild(relativePaths: readonly string[]): Plugin {
  let outDir = 'dist'
  return {
    name: 'uon-exclude-from-build',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      for (const relativePath of relativePaths) {
        const full = resolve(outDir, relativePath)
        if (!existsSync(full)) continue
        rmSync(full, { force: true })
        this.info(`excluded ${relativePath} from the build`)
      }
    },
  }
}

/**
 * Emits the branding masters beside `index.html`, for the flat Xerte package.
 *
 * The Xerte build turns `publicDir` off and emits the masters itself rather
 * than moving Vite's copy afterwards: `closeBundle` hooks run in parallel, so
 * ordering a move against {@link excludeFromBuild} would be luck. It also means
 * nothing else under `public/` can reach the package by accident — only the
 * `.mp4` and `.webm` masters, under their own stable names.
 */
function emitBrandingFlat(): Plugin {
  let root = process.cwd()
  return {
    name: 'uon-emit-branding-flat',
    apply: 'build',
    configResolved(config) {
      root = config.root
    },
    generateBundle() {
      const directory = resolve(root, 'public/branding')
      for (const name of readdirSync(directory)) {
        if (extname(name) !== '.mp4' && extname(name) !== '.webm') continue
        this.emitFile({
          type: 'asset',
          fileName: name,
          source: readFileSync(resolve(directory, name)),
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  // The Xerte package, `vite build --mode xerte` (DEV-INFRASTRUCTURE.md ->
  // "Xerte package"). Relocatable, because Xerte serves it from a folder whose
  // path is unknown until the upload exists; and flat — every file beside
  // `index.html`, no folders — because that is how the maintainer uploads it
  // (2026-09-21).
  const xerte = mode === 'xerte'
  return {
    plugins: [excludeFromBuild(['branding/README.md']), ...(xerte ? [emitBrandingFlat()] : [])],
    // A GitHub Pages project site serves from `/<repo>/`, not the root. The
    // deploy workflow sets BASE_PATH; local dev and the acceptance run leave it
    // unset and stay at `/`. Runtime asset URLs read `import.meta.env.BASE_URL`
    // so they follow this automatically.
    base: xerte ? './' : (process.env['BASE_PATH'] ?? '/'),
    // Off for Xerte, where `emitBrandingFlat` ships the masters instead.
    publicDir: xerte ? false : 'public',
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
      // Where the branding masters sit under `base`: their own folder, except
      // in the flat Xerte package. Read by `src/config/branding.ts`.
      __BRANDING_DIR__: JSON.stringify(xerte ? '' : 'branding/'),
    },
    build: {
      target: 'esnext',
      // Flat for Xerte: chunks beside `index.html` rather than in `assets/`.
      assetsDir: xerte ? '' : 'assets',
      // Kept, deliberately, and re-decided on 2026-08-26 rather than assumed.
      // Shipping sourcemaps normally exposes source — but this repository is
      // PUBLIC, so every line they reveal is already at
      // github.com/djDAOjones/UoN-Video-Helper, and they are what make a
      // diagnostics bundle from a lecturer's machine name real functions instead
      // of minified identifiers. Revisit if the repository ever goes private:
      // that, not the deploy, is the condition this rests on (VH-40).
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
  }
})
