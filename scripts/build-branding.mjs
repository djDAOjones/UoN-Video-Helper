#!/usr/bin/env node
/**
 * Converts the UoN closing masters into the assets the app ships (VH-12).
 *
 * The masters are QuickTime Animation (`qtrle`/`argb`), which no browser can
 * decode, so they cannot ship as-is. This runs once on a maintainer's machine
 * and is not part of `npm run build` — the outputs are committed.
 *
 * Each 5 s master splits at exactly 1.00 s:
 *
 * - **onset** [0, 1) — alpha ramps 0 -> 255. Needs transparency, so VP9 in
 *   WebM. Only the "transition" and "transition with freeze frame" modes use
 *   it (VH-22).
 * - **tail** [1, 5] — fully opaque, and byte-identical between Fade and Slide
 *   within a colour, so one tail per colour serves both styles. Shipped as
 *   H.264 MP4 deliberately: "clean cut" uses only the tail, so keeping it in
 *   the most universally decodable format means that mode works even where
 *   alpha decode does not.
 *
 * Usage: node scripts/build-branding.mjs [--masters <dir>] [--out <dir>]
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Where the alpha ramp completes. Measured, not assumed — see tickets/VH-12.md. */
const ONSET_SECONDS = 1.0
/** Total master length. */
const MASTER_SECONDS = 5.0

const EXPECTED = { width: 3840, height: 2160, frameRate: 25, frames: 125 }

/** Output heights. 4K sources get the 4K asset so branding is never upscaled. */
const HEIGHTS = [2160, 1080]

const STYLES = [
  { style: 'fade', colour: 'blue', master: 'UoN Closing Logo Fade Blue 2025.mov' },
  { style: 'fade', colour: 'white', master: 'UoN Closing Logo Fade White 2025.mov' },
  { style: 'slide', colour: 'blue', master: 'UoN Closing Logo Slide Blue 2025.mov' },
  { style: 'slide', colour: 'white', master: 'UoN Closing Logo Slide White 2025.mov' },
]

/** One tail per colour: Fade and Slide are identical after the onset. */
const TAIL_SOURCE = {
  blue: 'UoN Closing Logo Fade Blue 2025.mov',
  white: 'UoN Closing Logo Fade White 2025.mov',
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const mastersDir = arg('--masters', 'samples')
const outDir = arg('--out', join('public', 'branding'))

function ffprobe(file, entries) {
  return execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', entries, '-of', 'csv=p=0', file],
    { encoding: 'utf8' },
  ).trim()
}

/**
 * Refuses to build from a master that is not the shape we measured.
 *
 * These assets are authored by hand, so a re-export could silently change
 * resolution, rate or length. Every downstream number — the 1.00 s split, the
 * mode durations, the shared tail — depends on this shape holding.
 */
function verifyMaster(path) {
  const [width, height, rate, frames] = ffprobe(
    path,
    'stream=width,height,r_frame_rate,nb_frames',
  ).split(',')
  const [num, den] = rate.split('/').map(Number)
  const frameRate = num / den
  const problems = []
  if (Number(width) !== EXPECTED.width || Number(height) !== EXPECTED.height) {
    problems.push(`expected ${EXPECTED.width}x${EXPECTED.height}, got ${width}x${height}`)
  }
  if (Math.abs(frameRate - EXPECTED.frameRate) > 0.001) {
    problems.push(`expected ${EXPECTED.frameRate} fps, got ${frameRate.toFixed(3)}`)
  }
  if (Number(frames) !== EXPECTED.frames) {
    problems.push(`expected ${EXPECTED.frames} frames, got ${frames}`)
  }
  if (problems.length > 0) {
    throw new Error(`${path}\n  ${problems.join('\n  ')}\n  Re-check tickets/VH-12.md before changing the expectations.`)
  }
}

function run(args) {
  execFileSync('ffmpeg', ['-v', 'error', ...args], { stdio: ['ignore', 'ignore', 'pipe'] })
}

function kb(path) {
  return `${(statSync(path).size / 1024).toFixed(1)} KB`
}

mkdirSync(outDir, { recursive: true })

const built = []

for (const { style, colour, master } of STYLES) {
  const source = join(mastersDir, master)
  verifyMaster(source)
  for (const height of HEIGHTS) {
    const width = Math.round((height * EXPECTED.width) / EXPECTED.height)
    const out = join(outDir, `closing-onset-${style}-${colour}-${height}p.webm`)
    run([
      '-t', String(ONSET_SECONDS),
      '-i', source,
      '-vf', `scale=${width}:${height}`,
      '-c:v', 'libvpx-vp9',
      '-pix_fmt', 'yuva420p', // the 'a' is the whole point
      '-b:v', '0', '-crf', '20', '-row-mt', '1',
      '-an', '-y', out,
    ])
    built.push(out)
  }
}

for (const [colour, master] of Object.entries(TAIL_SOURCE)) {
  const source = join(mastersDir, master)
  verifyMaster(source)
  for (const height of HEIGHTS) {
    const width = Math.round((height * EXPECTED.width) / EXPECTED.height)
    const out = join(outDir, `closing-tail-${colour}-${height}p.mp4`)
    run([
      '-ss', String(ONSET_SECONDS),
      '-t', String(MASTER_SECONDS - ONSET_SECONDS),
      '-i', source,
      '-vf', `scale=${width}:${height},format=yuv420p`,
      '-c:v', 'libx264', '-profile:v', 'high', '-crf', '18', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      '-an', '-y', out,
    ])
    built.push(out)
  }
}

let total = 0
for (const path of built.sort()) {
  total += statSync(path).size
  console.log(`  ${path}  ${kb(path)}`)
}
console.log(`\n${built.length} files, ${(total / 1048576).toFixed(2)} MB total`)
