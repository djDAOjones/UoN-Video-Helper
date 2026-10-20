/**
 * VH-116: does the video estimate hold still?
 *
 * Runs real recordings through pre-flight's video probe and then the job, on
 * the job's own kind of worker (`estimate.worker.ts`), and holds three
 * predictions of the encode against what it took:
 *
 * - the probe as shipped: its frames over its whole three seconds;
 * - a warm-up: the same window, with the clock started after its first
 *   sixth, third or half of frames, so pre-flight is no longer;
 * - a correction from the job's early frames: the encode's own rate after
 *   5, 10 or 20 seconds of it, or a tenth of its frames.
 *
 * The spread is the ratio of real to predicted over every run: VH-100 saw
 * 0.5–1.8× for the probe. Each run's raw timings follow its line as JSON, so
 * a later reading needs no re-run.
 *
 * `?files=/samples/a.mp4|/samples/b.mp4&presets=best,smaller&reps=3`.
 * Dev-only; not built.
 */

import { resolveBrandingBase } from '../config/branding'
import type { PresetId } from '../config/presets'
import { verdictLine } from '../../scripts/verdict.mjs'
import type { EstimateRunFailure, EstimateRunResult, StampedProgress } from './estimate.worker'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
let failures = 0
function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

const query = new URLSearchParams(location.search)
const files = (query.get('files') ?? '/samples/AMCS3059 - Module in a Minute (002).mp4').split('|')
const presets = (query.get('presets') ?? 'best,smaller')
  .split(',')
  .filter((id): id is PresetId => id === 'best' || id === 'smaller')
const reps = Math.max(1, Number(query.get('reps') ?? 1))

/**
 * The probe's frames the warm-up variants skip, as a fraction of its window,
 * keyed by that fraction so a 25 fps and a 30 fps recording share a row.
 */
const WARM_UP_FRACTIONS = { '1/6': 1 / 6, '1/3': 1 / 3, '1/2': 1 / 2 } as const
/** Seconds into the encode at which the job's own rate is read. */
const CORRECTION_AFTER_SECONDS = [5, 10, 20] as const
/** And the share of its frames, read the same way. */
const CORRECTION_AFTER_FRACTION = 0.1
/** Frames between the pipeline's encoding progress messages (`pipeline.ts`). */
const FRAMES_PER_PROGRESS = 30

interface Row {
  readonly label: string
  readonly ratios: Record<string, number>
  readonly totals: { readonly estimated: number; readonly warmEstimated: number; readonly real: number }
}

const fixed = (value: number, digits = 2): string => value.toFixed(digits)

/** Real over predicted, for every method, from one run's raw timings. */
function judge(run: EstimateRunResult): Row['ratios'] & { realFps: number; probeFps: number } {
  const { probe } = run.preflight
  const probeFps = probe.frames / probe.seconds
  const encoding = run.job.progress.filter((event) => event.stage === 'encoding')
  const finishing = run.job.progress.find((event) => event.stage === 'finishing')
  const first = encoding[0]
  const second = encoding[1]
  if (!first || !second || !finishing) throw new Error('too few progress messages to judge')
  const expectedFrames = FRAMES_PER_PROGRESS / (second.fraction - first.fraction)
  const spanFrames = (1 - first.fraction) * expectedFrames
  const realSeconds = finishing.atSeconds - first.atSeconds
  const realFps = spanFrames / realSeconds

  const ratios: Record<string, number> = { probe: realFps === 0 ? 0 : probeFps / realFps }
  for (const [name, fraction] of Object.entries(WARM_UP_FRACTIONS)) {
    const skipped = Math.floor(probe.frames * fraction)
    const clockFrom = probe.acceptedAtSeconds[skipped - 1] ?? 0
    const warmFps = (probe.frames - skipped) / (probe.seconds - clockFrom)
    ratios[`warm ${name}`] = warmFps / realFps
  }
  // Predicted seconds for the rest of the encode, read at a checkpoint, as
  // the real time over that prediction (so >1 means it took longer).
  const correctionAt = (reached: (event: StampedProgress) => boolean): number => {
    const at = encoding.find(reached)
    if (!at || at.fraction <= first.fraction) return Number.NaN
    const predicted = ((at.atSeconds - first.atSeconds) * (1 - first.fraction)) / (at.fraction - first.fraction)
    return realSeconds / predicted
  }
  for (const seconds of CORRECTION_AFTER_SECONDS) {
    ratios[`job ${seconds}s`] = correctionAt((event) => event.atSeconds - first.atSeconds >= seconds)
  }
  ratios[`job ${CORRECTION_AFTER_FRACTION * 100}%`] = correctionAt(
    (event) => event.fraction - first.fraction >= CORRECTION_AFTER_FRACTION,
  )
  // Every ratio as real over predicted time: for the probes, real time over
  // predicted is their fps over the real fps.
  return { ...ratios, realFps, probeFps }
}

/**
 * Whether the page was hidden at any point between two `performance.now()`
 * readings: a hidden pane runs as a background page and its timings are off.
 */
function hiddenDuring(fromMs: number, toMs: number): boolean {
  // The timeline's first entry, at 0, is the state the page loaded in.
  let state = 'visible'
  for (const change of performance.getEntriesByType('visibility-state')) {
    if (change.startTime > toMs) break
    if (change.startTime <= fromMs) state = change.name
    else if (change.name === 'hidden') return true
  }
  return state === 'hidden'
}
let hiddenRuns = 0

const worker = new Worker(new URL('./estimate.worker.ts', import.meta.url), { type: 'module' })
let status = ''
function runOne(file: Blob, presetId: PresetId, runId: number): Promise<EstimateRunResult> {
  return new Promise((resolve, reject) => {
    worker.onmessage = (
      event: MessageEvent<EstimateRunResult | EstimateRunFailure | { kind: 'status'; text: string }>,
    ) => {
      const message = event.data
      if (message.kind === 'status') {
        status = message.text
        log.textContent = `${lines.join('\n')}\n… ${status}`
      } else if (message.kind === 'result') resolve(message)
      else reject(new Error(message.message))
    }
    worker.postMessage({
      kind: 'run',
      file,
      presetId,
      brandingBaseUrl: resolveBrandingBase(document.baseURI),
      runId,
    })
  })
}

say(`userAgent: ${navigator.userAgent}`)
say(`hardwareConcurrency: ${navigator.hardwareConcurrency}`)
say(`files: ${files.join(' | ')}; presets: ${presets.join(', ')}; reps: ${reps}\n`)

const blobs = new Map<string, Blob>()
const rows: Row[] = []
let runId = 0
for (let rep = 1; rep <= reps; rep++) {
  for (const path of files) {
    for (const presetId of presets) {
      runId++
      const label = `${path.replace(/^.*\//, '').slice(0, 12)} ${presetId} #${rep}`
      try {
        let blob = blobs.get(path)
        if (!blob) {
          const response = await fetch(path)
          if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`)
          blob = await response.blob()
          blobs.set(path, blob)
        }
        const startedMs = performance.now()
        const run = await runOne(blob, presetId, runId)
        const hidden = hiddenDuring(startedMs, performance.now())
        if (hidden) hiddenRuns++
        const judged = judge(run)
        const { realFps, probeFps, ...ratios } = judged
        const { estimate, probe } = run.preflight
        const warm = ratios['warm 1/3'] ?? Number.NaN
        // The product's total with the probe's video and branding stages
        // re-priced at the warm-up's rate (a third skipped).
        const warmScale = (ratios.probe ?? Number.NaN) / warm
        const warmEstimated =
          estimate.totalSeconds - (estimate.videoSeconds + estimate.brandingSeconds) * (1 - warmScale)
        rows.push({
          label,
          ratios,
          totals: { estimated: estimate.totalSeconds, warmEstimated, real: run.job.totalSeconds },
        })
        say(
          `${label}: ${run.width}x${run.height}@${run.frameRate} ${run.contentClass} · ` +
            `probe ${probe.frames}f in ${fixed(probe.seconds)}s, first at ${fixed(probe.acceptedAtSeconds[0] ?? 0)}s · ` +
            `${fixed(probeFps, 0)} fps probed, ${fixed(realFps, 0)} real · ` +
            `total est ${fixed(estimate.totalSeconds, 1)}s, warm ${fixed(warmEstimated, 1)}s, real ${fixed(run.job.totalSeconds, 1)}s` +
            (hidden ? ' · PANE HIDDEN, timings off' : ''),
        )
        say(
          `  real/predicted: ${Object.entries(ratios)
            .map(([method, ratio]) => `${method} ${fixed(ratio)}`)
            .join(' · ')}`,
        )
        say(
          `  RAW ${JSON.stringify({
            label,
            preflight: {
              ...run.preflight,
              probe: {
                ...probe,
                acceptedAtSeconds: probe.acceptedAtSeconds.map((seconds) => Math.round(seconds * 1000) / 1000),
              },
            },
            job: {
              ...run.job,
              progress: run.job.progress.map((event) => [
                Math.round(event.atSeconds * 1000) / 1000,
                event.stage,
                Math.round(event.fraction * 1e5) / 1e5,
              ]),
            },
          })}`,
        )
      } catch (error) {
        failures++
        say(`${label}: ERROR — ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
}

if (rows.length > 0) {
  say('\nSpread over every run, real time over predicted (1 is exact):')
  const methods = Object.keys(rows[0]!.ratios)
  for (const method of methods) {
    const values = rows
      .map((row) => row.ratios[method] ?? Number.NaN)
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b)
    if (values.length === 0) continue
    const low = values[0]!
    const high = values[values.length - 1]!
    const median = values[Math.floor(values.length / 2)]!
    say(
      `  ${method.padEnd(10)} ${fixed(low)}–${fixed(high)}  median ${fixed(median)}  ` +
        `high/low ${fixed(high / low)}  (${values.length} runs)`,
    )
  }
  const totalRatios = (pick: (row: Row) => number): string => {
    const values = rows.map(pick).sort((a, b) => a - b)
    return `${fixed(values[0]!)}–${fixed(values[values.length - 1]!)}`
  }
  say(`  total, as shipped: ${totalRatios((row) => row.totals.real / row.totals.estimated)}`)
  say(`  total, warm-up:    ${totalRatios((row) => row.totals.real / row.totals.warmEstimated)}`)
  say(`  runs with the page hidden: ${hiddenRuns} of ${rows.length}`)
}

say(`\n${verdictLine(failures)}`)
say('\ndone')
