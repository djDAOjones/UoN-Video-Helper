/**
 * VH-12 spike: does transparent video survive a real decode in this browser?
 *
 * Mediabunny stores alpha as side data and merges colour and alpha on the CPU
 * (`ColorAlphaMerger`), so this should not depend on native alpha-video
 * support — but "should not" is why the spike exists. Dev-only; not built.
 */

import { ALL_FORMATS, CanvasSink, Input, UrlSource } from 'mediabunny'

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

say('\ndone')
