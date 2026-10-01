#!/usr/bin/env node
/**
 * Makes the Xerte upload in one command (VH-103): the flat build, a
 * `README-HOSTING.txt` beside it, zipped and named for the build identity the
 * build carries — `release/uon-video-helper-<build id>-site.zip`.
 *
 * `npm run build:xerte` made the build, and the README and the zip were made
 * by hand from the recipe in DEV-INFRASTRUCTURE.md -> "Xerte package". By hand
 * is how a zip gets named for one build and holds another.
 *
 * So the name is READ from the build, not worked out beside it: the build id
 * is baked into the bundle, and a build that straddles midnight would
 * otherwise be named for a day it does not carry. And a dirty tree is refused,
 * because the build id names a commit, and a build of uncommitted code would
 * claim to be code it is not.
 *
 * The zip itself is the system `zip`, as `build-branding.mjs` uses `ffmpeg`:
 * a maintainer tool, not a dependency. It writes `dist/`, as `build:xerte`
 * always has — the deployable artifact — and `release/`, both gitignored.
 * `check:build` is untouched, and still never writes `dist/`.
 *
 * Usage, from a clean checkout of the commit to ship:
 *
 *   npm run package:xerte
 */

import { execFileSync, spawnSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * The build identity a built bundle carries, read from its scripts.
 *
 * @param {readonly string[]} scripts - The text of every `.js` file in the build.
 * @param {string} version - `package.json`'s version, e.g. `0.1.0`.
 * @returns {string} The one build id, e.g. `v0.1.0+20261001.231c621`.
 * @throws When the build carries none, or more than one — a zip named for
 *   either would be named for something it might not hold.
 */
export function readBuildId(scripts, version) {
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`v${escaped}\\+\\d{8}\\.[0-9a-z]+`, 'g')
  const found = new Set(scripts.flatMap((text) => text.match(pattern) ?? []))
  if (found.size !== 1) {
    throw new Error(
      found.size === 0
        ? `no build id for v${version} in the build`
        : `more than one build id in the build: ${[...found].join(', ')}`,
    )
  }
  return [...found][0]
}

/**
 * The README that travels beside the build.
 *
 * In the shape of Route Plotter's, the package the University already hosts
 * this way, with what this app adds: it needs HTTPS, it needs nothing else
 * from the server, and an update must leave the previous scripts in place.
 *
 * @param {{ appVersion: string, buildId: string, files: readonly { name: string, bytes: number }[] }} build
 * @returns {string}
 */
export function hostingReadme({ appVersion, buildId, files }) {
  const sizes = files.map((file) => file.bytes.toLocaleString('en-GB'))
  const nameWidth = Math.max(...files.map((file) => file.name.length))
  const sizeWidth = Math.max(...sizes.map((size) => size.length))
  const listed = files
    .map((file, i) => `  ${file.name.padEnd(nameWidth)}  ${sizes[i].padStart(sizeWidth)} bytes`)
    .join('\n')
  return `UoN Video Helper ${appVersion} — build ${buildId}
Static site bundle. No server-side code, no database, nothing to compile.
Video is processed in the visitor's browser and never uploaded anywhere.

HOW TO HOST
  Upload the contents of this zip — every file, index.html among them — into
  one folder on the web server, then open that folder's index.html in a
  browser. There are no subfolders: every file sits beside index.html.

  Every path is relative, so it works from any folder, e.g. a Xerte upload.

REQUIREMENTS
  - HTTPS. The app keeps its working files in the browser's private storage
    and saves through the browser's file picker, and both need a secure
    page. Opening index.html from disk (file://) will not work.
  - No special headers. It does not need COOP/COEP, and asks the server for
    nothing but its own files.
  - Chrome or Edge, current versions. Firefox opens the page but cannot make
    a video with sound, and says so.

UPDATING
  Upload the new files over the old ones and leave the previous app-*.js and
  job.worker-*.js in place for a while: a browser still holding the old
  index.html needs the scripts it names.

MIME TYPES
  .js as text/javascript, .css as text/css, .webm as video/webm, .mp4 as
  video/mp4, .svg as image/svg+xml, .woff2 as font/woff2. Default on
  virtually all servers.

FILES
${listed}
`
}

/** Runs a command and fails loudly, with its own output shown. */
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options })
  if (result.error) throw new Error(`${command}: ${result.error.message}`)
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited ${result.status}`)
}

function main() {
  const root = process.cwd()
  const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()
  if (dirty) {
    console.error(
      'package-xerte: the tree has uncommitted changes. The build id names a commit, so a\n' +
        'package of uncommitted code would claim to be code it is not. Commit or stash, then\n' +
        'run this again.\n\n' +
        dirty,
    )
    process.exit(1)
  }

  run('npm', ['run', 'build:xerte'])

  const dist = join(root, 'dist')
  const entries = readdirSync(dist, { withFileTypes: true })
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  if (folders.length > 0) {
    throw new Error(
      `the build is not flat: ${folders.join(', ')} (DEV-INFRASTRUCTURE.md -> "Xerte package")`,
    )
  }
  if (!entries.some((entry) => entry.name === 'index.html'))
    throw new Error('the build has no index.html')

  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const names = entries.map((entry) => entry.name).sort()
  const buildId = readBuildId(
    names
      .filter((name) => name.endsWith('.js'))
      .map((name) => readFileSync(join(dist, name), 'utf8')),
    pkg.version,
  )
  const files = names.map((name) => ({ name, bytes: statSync(join(dist, name)).size }))

  // Beside the build, never in it: `dist/` is the build's output, and nothing
  // else writes there.
  const staging = mkdtempSync(join(tmpdir(), 'uon-video-helper-xerte-'))
  try {
    writeFileSync(
      join(staging, 'README-HOSTING.txt'),
      hostingReadme({ appVersion: `v${pkg.version}`, buildId, files }),
    )
    mkdirSync(join(root, 'release'), { recursive: true })
    const zip = resolve(root, 'release', `uon-video-helper-${buildId}-site.zip`)
    // `zip` adds to an archive that already exists, so a rebuild of the same
    // commit on the same day would carry the last one's files too.
    rmSync(zip, { force: true })
    run('zip', ['-q', '-X', '-r', zip, '.'], { cwd: dist })
    run('zip', ['-q', '-X', '-j', zip, join(staging, 'README-HOSTING.txt')])

    const listing = execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).trim().split('\n')
    if (listing.some((name) => name.includes('/'))) throw new Error('the zip holds a folder')
    for (const wanted of ['index.html', 'README-HOSTING.txt']) {
      if (!listing.includes(wanted)) throw new Error(`the zip has no ${wanted}`)
    }
    console.log(
      `\npackage-xerte: ${zip}\n  ${listing.length} files, ${statSync(zip).size.toLocaleString('en-GB')} bytes, build ${buildId}`,
    )
  } finally {
    rmSync(staging, { recursive: true, force: true })
  }
}

// Importable for its tests without packaging anything.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main()
  } catch (error) {
    console.error(`package-xerte: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}
