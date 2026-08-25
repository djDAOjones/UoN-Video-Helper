/**
 * VH-12 spike: does transparent video survive a real decode in this browser?
 *
 * Mediabunny stores alpha as side data and merges colour and alpha on the CPU
 * (`ColorAlphaMerger`), so this should not depend on native alpha-video
 * support — but "should not" is why the spike exists. Dev-only; not built.
 */

import {
  ALL_FORMATS,
  CanvasSink,
  Input,
  UrlSource,
  VideoSample,
  VideoSampleSink,
} from 'mediabunny'

import { loadBrandingClip, loadClosingOnset } from '../media/branding'
import { BrandingCompositor } from '../media/composite'
import { fitRectangle } from '../media/conform'
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
    say('  this engine composites PREMULTIPLIED (correct here)')
  } else if (r !== undefined && r >= 190 && r <= 215) {
    say('  this engine composites STRAIGHT (double-darkens here)')
  } else {
    say(`  neither 255 nor ~202 — inspect before drawing any conclusion`)
  }
  // Measured 2026-08-25: Chrome 151 and Safari 26.5 return 202, Firefox 152
  // returns 255. The engines disagree, so NO drawImage call is portable and
  // the answer here changes nothing — the blend stays in composite.ts.
  say('  (engines disagree — Chrome/Safari 202, Firefox 255 — so we never')
  say('   rely on drawImage for this; composite.ts does the blend itself)')
} catch (error) {
  say(`  ERROR — ${error instanceof Error ? error.message : String(error)}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// VH-34: does compose()'s READBACK put the engine divergence back?
//
// The blend moved to the CPU because `drawImage` disagrees across engines. But
// `BrandingCompositor.compose()` still reaches the branding pixels through
// `brand.draw(ctx, …)` followed by `getImageData` — and `getImageData` is
// specified to return STRAIGHT (un-premultiplied) RGBA. If an engine holds the
// decoded frame as premultiplied, that readback divides the alpha back out and
// hands `compositePremultiplied` a colour up to 3.4x too bright.
//
// Ground truth, decoded straight from the WebM with ffmpeg (2026-08-25). The
// frame at t=0.40s is uniform across all 1920x1080 pixels, so any pixel does:
//
//     fade white  RGBA (73, 73, 73, 75)     un-premultiplied: (248, 248, 248)
//     fade blue   RGBA ( 4, 10, 17, 75)     un-premultiplied: ( 14,  34,  58)
//
// Both are premultiplied — RGB never exceeds alpha. Composited over BLACK, the
// correct output IS the stored colour; an un-premultiplying engine returns the
// second figure instead. Black is used deliberately: it is the maximum-error
// case and the one a real closing over dark picture would show.

const ONSET_SECONDS = 0.4

const GROUND_TRUTH = {
  white: { premultiplied: [73, 73, 73], straight: [248, 248, 248] },
  blue: { premultiplied: [4, 10, 17], straight: [14, 34, 58] },
} as const

/** Nearest match wins; 6 is wider than any observed YUV rounding and far
 *  narrower than the gap between the two candidates. */
function classify(rgb: readonly number[], colour: 'white' | 'blue'): string {
  const truth = GROUND_TRUTH[colour]
  const distance = (want: readonly number[]): number =>
    Math.max(...want.map((v, i) => Math.abs(v - (rgb[i] ?? -999))))
  const pre = distance(truth.premultiplied)
  const str = distance(truth.straight)
  if (pre <= 6 && pre < str) return `PREMULTIPLIED (matches the file, ±${pre})`
  if (str <= 6 && str < pre) return `STRAIGHT — un-premultiplied on readback (±${str})`
  return 'neither — inspect before concluding anything'
}

async function measureReadback(colour: 'white' | 'blue'): Promise<void> {
  say(`\n=== VH-34 · fade ${colour} onset at t=${ONSET_SECONDS}s`)
  const shape = outputShapeFor(PRESETS.best, { width: 1920, height: 1080, frameRate: 25 })
  const clip = await loadClosingOnset(shape, { style: 'fade', colour })
  const track = clip ? await clip.input.getPrimaryVideoTrack() : null
  if (!track) {
    say('  FAIL — onset did not load')
    return
  }

  const brand = await new VideoSampleSink(track).getSample(ONSET_SECONDS)
  if (!brand) {
    say(`  FAIL — no sample at ${ONSET_SECONDS}s`)
    return
  }

  const centreX = shape.width >> 1
  const centreY = shape.height >> 1
  const fit = fitRectangle({ width: track.displayWidth, height: track.displayHeight }, shape)

  try {
    // 1. The readback alone, performed exactly as compose() performs it.
    const overlay = new OffscreenCanvas(shape.width, shape.height)
    const overlayContext = overlay.getContext('2d', { willReadFrequently: true })
    if (!overlayContext) {
      say('  FAIL — no 2d context')
      return
    }
    overlayContext.clearRect(0, 0, shape.width, shape.height)
    brand.draw(overlayContext, fit.x, fit.y, fit.width, fit.height)
    const read = [...overlayContext.getImageData(centreX, centreY, 1, 1).data]
    say(`  getImageData    RGBA(${read.join(', ')})`)
    say(`                  ${classify(read, colour)}`)

    // 2. The whole path: compose() over a black picture. The result is fully
    //    opaque, so premultiplied and straight agree on it and this second
    //    readback cannot distort the answer.
    const picture = new OffscreenCanvas(shape.width, shape.height)
    const pictureContext = picture.getContext('2d', { alpha: false })
    if (!pictureContext) {
      say('  FAIL — no 2d context for the picture')
      return
    }
    pictureContext.fillStyle = '#000000'
    pictureContext.fillRect(0, 0, shape.width, shape.height)

    const timing = { timestamp: 0, duration: 1 / shape.frameRate }
    const under = new VideoSample(picture, timing)
    const composed = new BrandingCompositor(shape).compose(under, brand, fit, timing)
    const result = new OffscreenCanvas(shape.width, shape.height)
    const resultContext = result.getContext('2d', { willReadFrequently: true })
    if (!resultContext) {
      say('  FAIL — no 2d context for the result')
      return
    }
    composed.draw(resultContext, 0, 0, shape.width, shape.height)
    const out = [...resultContext.getImageData(centreX, centreY, 1, 1).data]
    composed.close()
    under.close()
    say(`  compose/black   RGBA(${out.join(', ')})`)
    say(`                  ${classify(out, colour)}`)

    // 3. Does the CANVAS's own bytes come back un-mangled through a
    //    canvas-backed VideoFrame? The canvas stores premultiplied; the
    //    question is whether copyTo divides the alpha out as getImageData
    //    does. If it does not, the fix is one line and keeps canvas scaling.
    try {
      const frame = new VideoFrame(overlay, { timestamp: 0 })
      try {
        const buffer = new Uint8Array(frame.allocationSize({ format: 'RGBA' }))
        await frame.copyTo(buffer, { format: 'RGBA' })
        const offset = (centreY * shape.width + centreX) * 4
        const canvasBytes = [...buffer.slice(offset, offset + 4)]
        say(`  canvas copyTo   RGBA(${canvasBytes.join(', ')})  (canvas -> VideoFrame)`)
        say(`                  ${classify(canvasBytes, colour)}`)
      } finally {
        frame.close()
      }
    } catch (error) {
      say(
        `  canvas copyTo   unsupported here — ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    // 4. The ticket's open question: is there a readback with no canvas in it?
    try {
      const buffer = new Uint8Array(brand.allocationSize({ format: 'RGBA' }))
      await brand.copyTo(buffer, { format: 'RGBA' })
      const direct = [...buffer.slice(0, 4)]
      say(`  copyTo RGBA     RGBA(${direct.join(', ')})  (no canvas)`)
      say(`                  ${classify(direct, colour)}`)
    } catch (error) {
      say(`  copyTo RGBA     unsupported here — ${error instanceof Error ? error.message : String(error)}`)
    }
  } finally {
    brand.close()
  }
}

for (const colour of ['white', 'blue'] as const) {
  try {
    await measureReadback(colour)
  } catch (error) {
    say(`  ERROR — ${error instanceof Error ? error.message : String(error)}`)
  }
}

say('\ndone')
