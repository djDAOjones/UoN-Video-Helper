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
 * - **internal tail** (VH-126) — the tail again with "Internal use only"
 *   building in under the logo, one per language, colour and height. The
 *   words are each language table's `closing.internalWords`, so a corrected
 *   translation is rebuilt from the sheet, never typed here. The onsets are
 *   shared: the words arrive with the wordmark, after the onset has ended.
 *
 * The words are drawn by macOS's own text system, through JavaScript for
 * Automation (`osascript`), because Homebrew's ffmpeg has no `drawtext`: a
 * transparent picture of them, overlaid by ffmpeg. That makes the internal
 * tails a Mac's to build, with Arial Bold and PingFang SC, the faces the page
 * draws in (`tokens.brand.css`).
 *
 * Usage: node scripts/build-branding.mjs [--masters <dir>] [--out <dir>]
 *        [--only official|internal] [--languages en-GB,zh-Hans,ms-MY]
 *
 * `--only internal` leaves the shipped onsets and official tails untouched:
 * a different ffmpeg re-encodes them to different bytes. `--languages`
 * rebuilds only the internal tails of the languages named, say after one
 * translation is corrected; the record of the words keeps the others.
 */

import { Buffer } from 'node:buffer'
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runnerImport } from 'vite'

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
const only = arg('--only', 'all')
if (!['all', 'official', 'internal'].includes(only)) {
  throw new Error(`--only takes official or internal, not ${only}`)
}

/**
 * The first video stream's entries, as strings. JSON, not CSV: ffprobe 9
 * lists a stream again under its stream group, and CSV ran the two together.
 */
function ffprobe(file, entries) {
  const report = execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', entries, '-of', 'json', file],
    { encoding: 'utf8' },
  )
  return JSON.parse(report).streams[0]
}

/**
 * Refuses to build from a master that is not the shape we measured.
 *
 * These assets are authored by hand, so a re-export could silently change
 * resolution, rate or length. Every downstream number — the 1.00 s split, the
 * mode durations, the shared tail — depends on this shape holding.
 */
function verifyMaster(path) {
  const {
    width,
    height,
    r_frame_rate: rate,
    nb_frames: frames,
  } = ffprobe(path, 'stream=width,height,r_frame_rate,nb_frames')
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

for (const { style, colour, master } of only === 'internal' ? [] : STYLES) {
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

for (const [colour, master] of only === 'internal' ? [] : Object.entries(TAIL_SOURCE)) {
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


/* -------------------------------------------------------------------------
 * Internal use only (VH-126)
 * ---------------------------------------------------------------------- */

/**
 * The faces, by PostScript name: the closing's words are Arial Bold
 * (`CLOSING_WORDS_ROLE`), and Chinese falls back to PingFang SC, the first of
 * `--font-cjk`, at Semibold, the weight Chrome picks for bold.
 */
const WORDS_FACE = 'Arial-BoldMT'
const CJK_FACE = 'PingFangSC-Semibold'

/**
 * Draws one line of words, white on transparent, into a PNG the size of the
 * frame, and prints its advance. Placed as `spike-cards.html` measured it:
 * centred on the advance, the cap top given, the baseline below it by the
 * cap height of Arial Bold — what `measureText('H')` reports in Chrome.
 * Without NSStringDrawingUsesLineFragmentOrigin a rectangle's origin is the
 * baseline; the context is unflipped, so y counts up from the foot.
 */
const DRAW_WORDS = `
ObjC.import('AppKit')
function run(argv) {
  const [text, sizeText, widthText, heightText, centreText, capTopText, out] = argv
  const size = Number(sizeText)
  const width = Number(widthText)
  const height = Number(heightText)
  const cascade = $.NSMutableDictionary.alloc.init
  cascade.setObjectForKey(
    $.NSArray.arrayWithObject($.NSFontDescriptor.fontDescriptorWithNameSize('${CJK_FACE}', size)),
    $.NSFontCascadeListAttribute,
  )
  const latin = $.NSFont.fontWithNameSize('${WORDS_FACE}', size)
  const font = $.NSFont.fontWithDescriptorSize(latin.fontDescriptor.fontDescriptorByAddingAttributes(cascade), size)
  const attributes = $.NSMutableDictionary.alloc.init
  attributes.setObjectForKey(font, $.NSFontAttributeName)
  attributes.setObjectForKey($.NSColor.whiteColor, $.NSForegroundColorAttributeName)
  const words = $(text)
  const advance = words.sizeWithAttributes(attributes).width
  const baseline = Number(capTopText) + latin.capHeight
  const rep = $.NSBitmapImageRep.alloc.initWithBitmapDataPlanesPixelsWidePixelsHighBitsPerSampleSamplesPerPixelHasAlphaIsPlanarColorSpaceNameBytesPerRowBitsPerPixel(
    null, width, height, 8, 4, true, false, $.NSCalibratedRGBColorSpace, 0, 0)
  $.NSGraphicsContext.saveGraphicsState
  $.NSGraphicsContext.setCurrentContext($.NSGraphicsContext.graphicsContextWithBitmapImageRep(rep))
  words.drawWithRectOptionsAttributes(
    $.NSMakeRect(Number(centreText) - advance / 2, height - baseline, advance * 2, size * 2), 0, attributes)
  $.NSGraphicsContext.restoreGraphicsState
  // Written in place: an atomic write stages its copy outside the folder given.
  const png = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $.NSDictionary.dictionary)
  if (!png.writeToFileOptionsError(out, 0, null)) throw new Error('could not write ' + out)
  return String(advance)
}
`

/** A module of the app's own, read through Vite so the script cannot drift from it. */
async function appModule(path) {
  const { module } = await runnerImport(path, {
    logLevel: 'error',
    define: { __BRANDING_DIR__: JSON.stringify('branding/') },
  })
  return module
}

/** A colour token from `tokens.brand.css`, as `[r, g, b]`. */
function brandColour(name) {
  const css = readFileSync(join('src', 'styles', 'tokens.brand.css'), 'utf8')
  const hex = css.match(new RegExp(`${name}:\\s*#([0-9a-f]{6})\\b`, 'i'))?.[1]
  if (!hex) throw new Error(`no ${name} in tokens.brand.css`)
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
}

/** Raw 8-bit frames from ffmpeg, one plane. */
function rawFrames(args) {
  return execFileSync('ffmpeg', ['-v', 'error', ...args, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], {
    maxBuffer: 1 << 30,
  })
}

/**
 * The wordmark's progress in each frame of the tail, 0 to 1, measured.
 *
 * The wordmark slides out to the right from behind the crest. In the settled
 * frame the ink above the logo's foot is two runs, the crest and then the
 * wordmark; progress is how far the ink's right edge has travelled from the
 * middle of the gap between them to the wordmark's settled edge. The middle,
 * not the crest's edge, because the crest overshoots its edge by a pixel or
 * two while it builds. Measured on a 1080-line copy: the curve is all that
 * is wanted.
 */
function wordmarkProgress(source, logoFootPer1080) {
  const width = 1920
  const height = 1080
  const frames = rawFrames([
    '-ss', String(ONSET_SECONDS), '-t', String(MASTER_SECONDS - ONSET_SECONDS),
    '-i', source, '-vf', `scale=${width}:${height}`,
  ])
  const size = width * height
  const count = frames.length / size
  const ground = frames[5 * width + 5]
  /** Which columns have ink above the logo's foot in frame `n`. */
  const columns = (n) => {
    const ink = new Uint8Array(width)
    for (let y = 0; y < logoFootPer1080; y++) {
      for (let x = 0; x < width; x++) {
        if (Math.abs(frames[n * size + y * width + x] - ground) > 60) ink[x] = 1
      }
    }
    return ink
  }
  const settled = columns(count - 1)
  const crestLeft = settled.indexOf(1)
  const gapLeft = settled.indexOf(0, crestLeft)
  const wordmarkLeft = settled.indexOf(1, gapLeft)
  const settledRight = settled.lastIndexOf(1)
  if (crestLeft < 0 || gapLeft < 0 || wordmarkLeft < 0) {
    throw new Error(`${source}: no crest and wordmark found in the settled frame`)
  }
  const start = Math.round((gapLeft + wordmarkLeft) / 2)
  return Array.from({ length: count }, (_, n) => {
    const right = columns(n).lastIndexOf(1)
    return Math.min(1, Math.max(0, (right - start) / (settledRight - start)))
  })
}

/**
 * Feeds the words' frames to ffmpeg and encodes one internal tail: the
 * master's tail, the words overlaid at the master's own size, then scaled
 * and encoded exactly as the official tail is.
 */
function encodeInternalTail({ source, out, height, words, frameCount }) {
  const width = Math.round((height * EXPECTED.width) / EXPECTED.height)
  const ffmpeg = spawn('ffmpeg', [
    '-v', 'error',
    '-ss', String(ONSET_SECONDS), '-t', String(MASTER_SECONDS - ONSET_SECONDS), '-i', source,
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${words.width}x${words.height}`,
    '-framerate', String(EXPECTED.frameRate), '-i', 'pipe:0',
    '-filter_complex',
    `[0:v][1:v]overlay=x=${words.x}:y=${words.y}:format=rgb,scale=${width}:${height},format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '18', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-an', '-y', out,
  ], { stdio: ['pipe', 'ignore', 'pipe'] })
  let errors = ''
  ffmpeg.stderr.on('data', (chunk) => (errors += chunk))
  const done = new Promise((resolve, reject) => {
    ffmpeg.on('error', reject)
    ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${out}: ffmpeg ${code}\n${errors}`))))
  })
  const write = async () => {
    for (let n = 0; n < frameCount; n++) {
      if (!ffmpeg.stdin.write(words.frame(n))) {
        await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve))
      }
    }
    ffmpeg.stdin.end()
  }
  return Promise.all([write(), done])
}

/**
 * The words as a layer: drawn once at the master's size, cropped to their
 * ink with room for the wipe's soft edge, and revealed frame by frame as the
 * wordmark travels.
 */
function wordsLayer({ png, rgb, featherPx, progress }) {
  const alpha = rawFrames(['-i', png, '-vf', 'alphaextract'])
  const { width, height } = EXPECTED
  let left = width
  let right = -1
  let top = height
  let bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (alpha[y * width + x] === 0) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  }
  if (right < 0) throw new Error(`${png}: nothing drawn`)
  const x = Math.max(0, left - 2)
  const y = Math.max(0, top - 2)
  const boxWidth = Math.min(width, right + 3) - x
  const boxHeight = Math.min(height, bottom + 3) - y
  const reach = right - left + featherPx
  return {
    x,
    y,
    width: boxWidth,
    height: boxHeight,
    frame(n) {
      const edge = left + progress[n] * reach
      const out = Buffer.alloc(boxWidth * boxHeight * 4)
      for (let row = 0; row < boxHeight; row++) {
        for (let column = 0; column < boxWidth; column++) {
          const reveal = Math.min(1, Math.max(0, (edge - (x + column)) / featherPx))
          const at = (row * boxWidth + column) * 4
          out[at] = rgb[0]
          out[at + 1] = rgb[1]
          out[at + 2] = rgb[2]
          out[at + 3] = Math.round(alpha[(y + row) * width + x + column] * reveal)
        }
      }
      return out
    },
  }
}

async function buildInternalTails() {
  const cards = await appModule('/src/config/cards.ts')
  const branding = await appModule('/src/config/branding.ts')
  const { LANGUAGES_OFFERED } = await appModule('/src/config/languages.ts')
  const { LANGUAGE_TABLES } = await appModule('/src/i18n/index.ts')
  const named = arg('--languages', '')
  const languages = named ? named.split(',') : LANGUAGES_OFFERED
  for (const language of languages) {
    if (!LANGUAGES_OFFERED.includes(language)) throw new Error(`${language} is not a language the page offers`)
  }

  /** The masters are 2160 lines; the type scale is per 1080. */
  const scale = EXPECTED.height / 1080
  const size = cards.CLOSING_WORDS_PX * scale
  const capTop = (cards.CLOSING_LOGO_FOOT_PER_1080 + cards.CLOSING_WORDS_GAP_EM * cards.CLOSING_WORDS_PX) * scale
  /** Blue's words are white, white's are Nottingham Blue: 15.4:1 either way. */
  const ink = { blue: brandColour('--uon-white'), white: brandColour('--uon-brand-blue') }

  const scratch = mkdtempSync(join(tmpdir(), 'vh-words-'))
  const recordPath = join(outDir, branding.CLOSING_INTERNAL_WORDS_RECORD)
  /** What each language's tails were built with; a language not rebuilt keeps its line. */
  let record = {}
  try {
    record = JSON.parse(readFileSync(recordPath, 'utf8'))
  } catch {
    record = {}
  }
  try {
    for (const [colour, master] of Object.entries(TAIL_SOURCE)) {
      const source = join(mastersDir, master)
      verifyMaster(source)
      const progress = wordmarkProgress(source, cards.CLOSING_LOGO_FOOT_PER_1080)
      const moving = progress.map((p, n) => ({ p, n })).filter(({ p }) => p > 0 && p < 1)
      console.log(
        `  ${colour}: the wordmark moves from ${(moving[0].n / EXPECTED.frameRate).toFixed(2)} s ` +
          `to ${(moving.at(-1).n / EXPECTED.frameRate).toFixed(2)} s of the tail`,
      )
      for (const language of languages) {
        const words = LANGUAGE_TABLES[language]?.closing.internalWords
        if (!words) throw new Error(`${language}: no closing.internalWords in its table`)
        record[language] = words
        const png = join(scratch, `${language}.png`)
        execFileSync('osascript', [
          '-l', 'JavaScript', '-e', DRAW_WORDS,
          words, String(size), String(EXPECTED.width), String(EXPECTED.height),
          String(EXPECTED.width / 2), String(capTop), png,
        ])
        const layer = wordsLayer({
          png,
          rgb: ink[colour],
          featherPx: cards.CLOSING_WORDS_WIPE_FEATHER_EM * size,
          progress,
        })
        for (const height of HEIGHTS) {
          const out = join(outDir, branding.closingInternalTailName(language, colour, height))
          await encodeInternalTail({ source, out, height, words: layer, frameCount: progress.length })
          built.push(out)
        }
      }
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
  const ordered = Object.fromEntries(LANGUAGES_OFFERED.filter((tag) => tag in record).map((tag) => [tag, record[tag]]))
  writeFileSync(recordPath, `${JSON.stringify(ordered, null, 2)}\n`)
  built.push(recordPath)
}

/* ---------------------------------------------------------------------- */

if (only !== 'official') await buildInternalTails()

let total = 0
for (const path of built.sort()) {
  total += statSync(path).size
  console.log(`  ${path}  ${kb(path)}`)
}
console.log(`\n${built.length} files, ${(total / 1048576).toFixed(2)} MB total`)
