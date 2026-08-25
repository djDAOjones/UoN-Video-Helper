/**
 * VH-12 spike: does transparent video survive a real decode in this browser?
 *
 * Mediabunny stores alpha as side data and merges colour and alpha on the CPU
 * (`ColorAlphaMerger`), so this should not depend on native alpha-video
 * support — but "should not" is why the spike exists. Dev-only; not built.
 */

import { ALL_FORMATS, CanvasSink, Input, UrlSource } from 'mediabunny'

import { loadBrandingClip, loadClosingOnset } from '../media/branding'
import { outputShapeFor, PRESETS } from '../config/presets'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []

function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

async function probe(label: string, url: string): Promise<void> {
  say(`\n=== ${label} — ${url}`)
  try {
    const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(url) })
    const track = await input.getPrimaryVideoTrack()
    if (!track) {
      say('  no video track')
      return
    }

    const transparent = await track.canBeTransparent()
    say(`  codec ${await track.getCodec()} · ${track.displayWidth}x${track.displayHeight}`)
    say(`  canBeTransparent(): ${transparent}`)
    say(`  canDecode(): ${await track.canDecode()}`)

    const sink = new CanvasSink(track, { alpha: true, width: 160, height: 90, fit: 'contain' })
    const result = await sink.getCanvas(0.4)
    if (!result) {
      say('  FAIL — no canvas returned at t=0.4s')
      return
    }

    // `CanvasSink` yields an HTMLCanvasElement in a DOM context and an
    // OffscreenCanvas otherwise, so the 2d context is a union of the two.
    const { canvas } = result
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null
    if (!ctx) {
      say('  FAIL — no 2d context')
      return
    }

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let min = 255
    let max = 0
    for (let i = 3; i < data.length; i += 4) {
      const a = data[i]!
      if (a < min) min = a
      if (a > max) max = a
    }
    say(`  decoded alpha range: ${min}–${max}`)
    const wantsAlpha = url.includes('onset')
    if (wantsAlpha) {
      say(min < 250 ? '  PASS — transparency survived the decode' : '  FAIL — came back fully opaque')
    } else {
      say(min === 255 ? '  PASS — opaque as expected' : `  FAIL — unexpected transparency (${min})`)
    }
  } catch (error) {
    say(`  ERROR — ${error instanceof Error ? error.message : String(error)}`)
  }
}

say(`userAgent: ${navigator.userAgent}`)

for (const style of ['fade', 'slide'] as const) {
  for (const colour of ['blue', 'white'] as const) {
    await probe(
      `onset ${style} ${colour}`,
      `/branding/closing-onset-${style}-${colour}-2160p.webm`,
    )
  }
}
await probe('tail blue (opaque, H.264)', '/branding/closing-tail-blue-2160p.mp4')

// The checks above go straight to Mediabunny. This one drives the app's own
// loader, which is the path that actually has to work — it must accept WebM
// for the onsets as well as MP4 for the tails.
say('\n=== through the app loader (src/media/branding.ts)')
const shape = outputShapeFor(PRESETS.best, { width: 3840, height: 2160, frameRate: 25 })
const onset = await loadClosingOnset(shape, { style: 'slide', colour: 'white' })
say(
  onset
    ? `  loadClosingOnset  -> ${onset.durationSeconds.toFixed(3)}s  PASS`
    : '  loadClosingOnset  -> null  FAIL (WebM not accepted?)',
)
const tail = await loadBrandingClip('closing', shape, { colour: 'white' })
say(
  tail
    ? `  loadBrandingClip  -> ${tail.durationSeconds.toFixed(3)}s  PASS`
    : '  loadBrandingClip  -> null  FAIL',
)

// Decisive check for VH-22: does canvas `drawImage` treat our onset's colour
// as PREMULTIPLIED (which it is) or as straight?
//
// The white onset at t=0.40s is RGB 75 with alpha 75. Composited over white:
//   premultiplied  ->  75 + 255x(1-75/255) = 255   (white logo over white
//                                                   background stays white)
//   straight       ->  75x(75/255) + 255x(1-75/255) = 202   (a grey smear)
//
// If the canvas gets this right, compositing is a GPU drawImage. If not, every
// frame has to go through src/media/composite.ts on the CPU.
say('\n=== how does canvas treat our premultiplied colour?')
try {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource('/branding/closing-onset-fade-white-2160p.webm'),
  })
  const track = await input.getPrimaryVideoTrack()
  const sink = new CanvasSink(track!, { alpha: true, width: 64, height: 36, fit: 'contain' })
  const frame = await sink.getCanvas(0.4)

  const scratch = new OffscreenCanvas(64, 36)
  const ctx = scratch.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 64, 36)
  ctx.drawImage(frame!.canvas, 0, 0)
  const [r] = ctx.getImageData(32, 18, 1, 1).data

  say(`  onset over white via drawImage -> R=${r}`)
  if (r !== undefined && r >= 250) {
    say('  canvas composites PREMULTIPLIED — drawImage is correct, use the GPU')
  } else if (r !== undefined && r >= 190 && r <= 215) {
    say('  canvas composites STRAIGHT — drawImage double-darkens; use composite.ts')
  } else {
    say('  inconclusive — neither 255 nor ~202; inspect before choosing')
  }
} catch (error) {
  say(`  ERROR — ${error instanceof Error ? error.message : String(error)}`)
}

say('\ndone')
