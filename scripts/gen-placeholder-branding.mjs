#!/usr/bin/env node
/**
 * Generates placeholder branding masters.
 *
 * WHY FFMPEG IS ACCEPTABLE HERE, AND ONLY HERE.
 *
 * This project deliberately does not use FFmpeg — see docs/02-technical-
 * rationale.md section 1. That decision is about what the app *ships* and what
 * it runs at runtime: no GPL code in the bundle, no AVC patent obligation
 * assumed by the University, no wasm memory ceiling.
 *
 * None of that is engaged by using a locally-installed ffmpeg as an authoring
 * tool to make stand-in assets. Nothing it produces is code; the output is
 * eight short MP4 files that exist only until the real After Effects renders
 * arrive, and it is not a build or runtime dependency of the app. Running this
 * script is optional: the assets it makes are committed.
 *
 * Usage: node scripts/gen-placeholder-branding.mjs
 * Requires: ffmpeg on PATH (brew install ffmpeg).
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const OUTPUT_DIR = join(process.cwd(), 'public', 'branding')
const FONT = '/System/Library/Fonts/Helvetica.ttc'

/** Spec section 4.2. Kept in step with src/config/branding.ts. */
const MASTERS = [
  { label: '1080p25', width: 1920, height: 1080, frameRate: 25 },
  { label: '1080p30', width: 1920, height: 1080, frameRate: 30 },
  { label: '2160p25', width: 3840, height: 2160, frameRate: 25 },
  { label: '2160p30', width: 3840, height: 2160, frameRate: 30 },
]

/**
 * Open decision D2. Kept in step with BRANDING_DURATIONS.
 *
 * Openings only. The real closing assets arrived with VH-12 and are built by
 * `build-branding.mjs` as `closing-tail-*` and `closing-onset-*`; this script
 * went on emitting a flat `closing-{label}.mp4` that nothing fetches, so
 * running it dropped four stale files beside the real ones (VH-66). There are
 * still no approved OPENING assets (VH-23), which is what this is for.
 */
const SEGMENTS = [{ name: 'opening', seconds: 5 }]

/**
 * Reads the D1 brand colour from the token file, so there is exactly one place
 * to change when the real hex arrives.
 */
function brandBackground() {
  const css = readFileSync(join(process.cwd(), 'src', 'styles', 'tokens.brand.css'), 'utf8')
  const match = /--uon-brand-bg:\s*(#[0-9a-fA-F]{6})/.exec(css)
  if (!match) throw new Error('Could not find --uon-brand-bg in src/styles/tokens.brand.css')
  return match[1]
}

function build(segment, master, colour) {
  const file = join(OUTPUT_DIR, `${segment.name}-${master.label}.mp4`)
  const fontSize = Math.round(master.height / 14)

  const text = [
    `drawtext=fontfile=${FONT}`,
    `text='PLACEHOLDER — ${segment.name} — ${master.label}'`,
    `fontcolor=white:fontsize=${fontSize}`,
    'x=(w-text_w)/2:y=(h-text_h)/2',
  ].join(':')

  // A decaying chord, then loudnorm to the project target. Spec section 4.4
  // requires the bed to be MASTERED at target and passed through unprocessed
  // at runtime, so the level has to be right in the file itself.
  const audio =
    `aevalsrc='0.5*sin(2*PI*220*t)*exp(-1.2*t)+0.35*sin(2*PI*330*t)*exp(-1.0*t)` +
    `+0.25*sin(2*PI*440*t)*exp(-0.8*t)':d=${segment.seconds}:s=48000:c=stereo`

  execFileSync(
    'ffmpeg',
    [
      '-y', '-loglevel', 'error',
      '-f', 'lavfi', '-i',
      `color=c=${colour}:s=${master.width}x${master.height}:r=${master.frameRate}:d=${segment.seconds}`,
      '-f', 'lavfi', '-i', audio,
      '-vf', `${text},fade=t=in:d=0.4,fade=t=out:st=${segment.seconds - 0.4}:d=0.4`,
      '-af', 'loudnorm=I=-16:TP=-2:LRA=7',
      // High profile, level 5.1 so the 4K variants are in spec. CRF rather
      // than the real masters' ~20 Mbps: this content is static, and a
      // placeholder should not cost 12 MB. The real renders set their own.
      '-c:v', 'libx264', '-profile:v', 'high', '-level', '5.1', '-pix_fmt', 'yuv420p',
      '-crf', '18', '-preset', 'medium',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
      '-movflags', '+faststart',
      file,
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )
  return { file, bytes: statSync(file).size }
}

mkdirSync(OUTPUT_DIR, { recursive: true })
const colour = brandBackground()
console.log(`Brand background (open decision D1): ${colour}`)

let total = 0
for (const segment of SEGMENTS) {
  for (const master of MASTERS) {
    const { file, bytes } = build(segment, master, colour)
    total += bytes
    console.log(`  ${file.replace(process.cwd() + '/', '')} — ${(bytes / 1024).toFixed(0)} kB`)
  }
}
console.log(`Total: ${(total / 1024 / 1024).toFixed(2)} MB`)
