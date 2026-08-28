/**
 * The acceptance run, against spec section 13.
 *
 * Exists so "it works" is a report with numbers in it rather than an
 * impression. Everything reachable without real University material or real
 * University hardware is exercised here; everything else is reported as
 * outstanding by name, so the gap is visible rather than assumed closed.
 */

import { PRESETS, outputShapeFor } from '../config/presets'
import { TARGET_INTEGRATED_LUFS } from '../config/audio'
import { inspectFile, openInput } from '../media/inspect'
import { OpfsWorkspace, ROOT_DIRECTORY, sweepOrphanedJobs } from '../media/opfs'
import { verifyOutputAudio } from '../media/output-verification'
import { runPipeline } from '../media/pipeline'
import { buildFixture, syncMarkerTimes } from './fixtures'
import {
  EgressWatch,
  ResourceWatch,
  carriedBody,
  measureCoverage,
  measureLoudness,
  measureSync,
  mergeEgress,
  relativeSync,
  type EgressReport,
} from './measure'
import type { WorkerOutbound } from '../workers/protocol'

/**
 * `external` is the one that needed adding. A criterion this harness does not
 * execute was being reported as `pass`, so the page could be entirely green
 * while the gate that actually asserts it had never been run — or was failing
 * (review R-11). `external` says where the evidence is instead of borrowing
 * its colour.
 */
export type CheckStatus = 'pass' | 'fail' | 'manual' | 'external'

export interface Check {
  readonly criterion: string
  readonly title: string
  readonly status: CheckStatus
  readonly detail: string
}

export interface AcceptanceReport {
  readonly checks: readonly Check[]
  readonly ranAt: string
  readonly seconds: number
}

type Report = (message: string) => void

/** Runs one file through the pipeline exactly as the app would. */
async function process(
  file: File,
  options: {
    readonly presetId: 'best' | 'smaller'
    readonly branding: { opening: boolean; closing: boolean }
    readonly jobId: string
    readonly signal?: AbortSignal
  },
): Promise<{ file: File; workspace: OpfsWorkspace; openingSeconds: number; frameRate: number }> {
  const report = await inspectFile(file)
  const preset = PRESETS[options.presetId]
  const shape = outputShapeFor(preset, {
    width: report.video.displayWidth,
    height: report.video.displayHeight,
    frameRate: report.video.conform.frameRate,
    // Both source-relative bitrate rules key off these (VH-41, VH-47). Without
    // them this harness silently takes the unmeasured fallback and proves the
    // new rules on nothing.
    videoBitrateBps: report.video.averageBitrateBps,
    sourceFrameRate: report.video.conform.sourceFrameRate,
  })
  const workspace = await OpfsWorkspace.open(options.jobId)
  const result = await runPipeline({
    input: openInput(file),
    shape,
    preset,
    videoDurationSeconds: report.video.durationSeconds,
    audioDurationSeconds: report.audio?.durationSeconds ?? null,
    workspace,
    branding: options.branding,
    backgroundColour: '#000000',
    ...(options.signal ? { signal: options.signal } : {}),
  })
  // Branding shifts everything; the loudness check needs to know by how much.
  // Taken from the RESULT rather than from config: the pipeline offsets by the
  // clip's actual decoded duration, and `BRANDING_DURATIONS.openingSeconds` is
  // what that duration is supposed to be. They agree only because the
  // placeholder is exactly 5.000 s — a real asset a few frames off would have
  // shifted every window measured here, silently (VH-16).
  return {
    file: result.file,
    workspace,
    openingSeconds: result.contentOffsetSeconds,
    frameRate: shape.frameRate,
  }
}

/**
 * Runs one file through the WORKER, as the app does, rather than in-process.
 *
 * The difference is not cosmetic. `OpfsWorkspace.createFile` prefers a
 * `FileSystemSyncAccessHandle` and falls back to `createWritable()` when the
 * handle is unavailable — and sync handles are worker-only. So a harness that
 * calls `runPipeline` on the main thread exercises the FALLBACK on every run
 * and has never once touched the path the app actually takes (VH-16).
 */
/** One request/response exchange with a worker, correlated by id. */
function ask(worker: Worker, request: Record<string, unknown>, timeoutMs = 180_000) {
  return new Promise<WorkerOutbound>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('the worker never answered')), timeoutMs)
    const onMessage = (event: MessageEvent<WorkerOutbound>): void => {
      const message = event.data
      // Progress reports on a request; it never answers one.
      if (message.kind === 'stage' || message.kind === 'uncaught') return
      if (message.id !== request['id']) return
      clearTimeout(timer)
      worker.removeEventListener('message', onMessage)
      resolve(message)
    }
    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', () => {
      clearTimeout(timer)
      reject(new Error('the worker failed to start'))
    })
    worker.postMessage(request)
  })
}

async function processInWorker(
  file: File,
  presetId: 'best' | 'smaller',
): Promise<{ file: File; jobId: string; worker: Worker; egress: EgressReport }> {
  const worker = new Worker(new URL('../workers/job.worker.ts', import.meta.url), {
    type: 'module',
    name: 'uon-acceptance-job',
  })

  // Started before the job and stopped after it. The worker has its own
  // `fetch` and its own resource timeline, so this is the only vantage point
  // from which the branding request — the one request this app makes at
  // runtime — can be seen at all (VH-62).
  await ask(worker, { kind: 'egress', id: 10, watching: true }, 10_000)

  const reply = await ask(worker, {
    kind: 'process',
    id: 1,
    file,
    presetId,
    // Branding ON, so the run exercises the fetch rather than proving zero
    // requests by never making one.
    branding: { opening: false, closing: true },
    backgroundColour: '#000000',
  })

  const stopped = await ask(worker, { kind: 'egress', id: 11, watching: false }, 10_000)
  const egress =
    stopped.kind === 'egressed'
      ? stopped.report
      : { withBody: [], allRequests: [], crossOrigin: [] }

  if (reply.kind !== 'processed') {
    worker.terminate()
    throw new Error(
      `the worker did not produce a file: ${reply.kind}${reply.kind === 'failed' ? ` — ${reply.message}` : ''}`,
    )
  }
  return { file: reply.file, jobId: reply.jobId, worker, egress }
}

/** Criterion 1, through the path the app actually uses. */
async function checkWorkerPath(log: Report): Promise<{ check: Check; egress: EgressReport }> {
  log('  running a fixture through the worker, not in-process')
  try {
    const fixture = await buildFixture({
      width: 640,
      height: 360,
      seconds: 4,
      frameRate: 25,
      audio: { startPeakDbfs: -20 },
    })
    const { file, jobId, worker, egress } = await processInWorker(fixture, 'best')
    try {
      const produced = await inspectFile(file)
      const ok = file.size > 0 && produced.video.durationSeconds > 3
      log(
        `  worker produced ${(file.size / 1024).toFixed(0)} kB, ${produced.durationSeconds.toFixed(2)}s; ` +
          `${egress.allRequests.length} request(s) seen inside the worker`,
      )
      return {
        egress,
        check: {
          criterion: '1',
          title: 'The pipeline runs in a worker, on the sync-handle path',
          status: ok ? 'pass' : 'fail',
          detail: ok
            ? `A worker job produced a playable ${(file.size / 1024).toFixed(0)} kB MP4. This is the OPFS sync-access-handle path; the main-thread checks below exercise the createWritable fallback, so both are now covered.`
            : `The worker returned a file of ${file.size} bytes lasting ${produced.durationSeconds.toFixed(2)}s.`,
        },
      }
    } finally {
      worker.postMessage({ kind: 'discard', id: 2, jobId })
      // Give the discard a moment to land before tearing the worker down.
      await new Promise((resolve) => setTimeout(resolve, 250))
      worker.terminate()
    }
  } catch (cause) {
    return {
      egress: { withBody: [], allRequests: [], crossOrigin: [] },
      check: {
        criterion: '1',
        title: 'The pipeline runs in a worker, on the sync-handle path',
        status: 'fail',
        detail: cause instanceof Error ? cause.message : String(cause),
      },
    }
  }
}

/**
 * Proves the egress instrument can go red.
 *
 * Criterion 9 is the headline promise, and a watch that never fires is
 * indistinguishable from a watch that cannot (review R-11). This deliberately
 * sends two bodies — one on `init`, one built into a `Request`, which is the
 * shape that used to slip past — and fails if either goes unseen.
 *
 * Run OUTSIDE the real criterion 9 window, obviously: it is the exact thing
 * that criterion forbids.
 */
async function checkEgressInstrument(log: Report): Promise<Check> {
  log('  proving the egress watch fires on a deliberate upload')
  const probe = new EgressWatch()
  probe.start()
  const target = new URL('/__acceptance-egress-probe', location.href).href
  try {
    await fetch(target, { method: 'POST', body: 'init-body' }).catch(() => undefined)
    await fetch(new Request(target, { method: 'POST', body: 'request-body' })).catch(
      () => undefined,
    )
  } finally {
    // Nothing here depends on the responses; the point is what was observed.
  }
  const report = probe.stop()
  const caught = report.withBody.filter(carriedBody).length

  return {
    criterion: '9',
    title: 'The egress watch itself detects an upload',
    status: caught >= 2 ? 'pass' : 'fail',
    detail:
      caught >= 2
        ? 'Two deliberate POSTs — one body on `init`, one built into a `Request` — were both recorded. The criterion 9 result above is therefore an observation rather than an absence of instrumentation.'
        : `Only ${caught} of 2 deliberate uploads were recorded. Criterion 9 cannot be trusted until this passes.`,
  }
}

/** Criterion 5, on material where the two presets can actually differ. */
async function checkPresetSeparation(log: Report): Promise<Check> {
  log('  encoding camera-like motion at both presets')
  const workspaces: OpfsWorkspace[] = []
  try {
    // Camera-like on purpose. On the default screen-like fixture H.264 predicts
    // almost everything for free, both presets land within a few percent of
    // each other, and the comparison measures nothing.
    const fixture = await buildFixture({
      width: 1280,
      height: 720,
      seconds: 4,
      frameRate: 25,
      cameraMotion: true,
      audio: { startPeakDbfs: -20 },
    })
    const best = await process(fixture, {
      presetId: 'best',
      branding: { opening: false, closing: false },
      jobId: 'acceptance-preset-best',
    })
    workspaces.push(best.workspace)
    const smaller = await process(fixture, {
      presetId: 'smaller',
      branding: { opening: false, closing: false },
      jobId: 'acceptance-preset-smaller',
    })
    workspaces.push(smaller.workspace)

    const ratio = smaller.file.size / best.file.size
    log(
      `  best ${(best.file.size / 1024).toFixed(0)} kB, smaller ${(smaller.file.size / 1024).toFixed(0)} kB (${(ratio * 100).toFixed(0)}%)`,
    )
    const ok = smaller.file.size < best.file.size
    return {
      criterion: '5',
      title: 'The smaller preset is actually smaller on camera-like motion',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? `Smaller is ${(ratio * 100).toFixed(0)}% of best (${(smaller.file.size / 1024).toFixed(0)} kB against ${(best.file.size / 1024).toFixed(0)} kB) at the same resolution, which is where spec 6.2 says the saving must come from. Whether text stays legible still needs a person and real slides (VH-M1).`
        : `Smaller came out at ${(ratio * 100).toFixed(0)}% of best, which is not smaller.`,
    }
  } catch (cause) {
    return {
      criterion: '5',
      title: 'The smaller preset is actually smaller on camera-like motion',
      status: 'fail',
      detail: cause instanceof Error ? cause.message : String(cause),
    }
  } finally {
    for (const workspace of workspaces) await workspace.dispose()
  }
}

async function checkLoudnessCorpus(log: Report): Promise<Check> {
  const corpus = [
    { name: 'quiet talking head', audio: { startPeakDbfs: -34 } },
    { name: 'hot recording', audio: { startPeakDbfs: -4 } },
    { name: 'speaker drifting away', audio: { startPeakDbfs: -10, endPeakDbfs: -30 } },
    {
      name: 'inconsistent with pauses',
      audio: { startPeakDbfs: -8, endPeakDbfs: -28, pauseSeconds: 2, pauseEverySeconds: 10 },
    },
  ] as const

  const results: string[] = []
  let worstLoudness = 0
  let worstPeak = Number.NEGATIVE_INFINITY
  let allVerified = true

  for (const [index, entry] of corpus.entries()) {
    log(`  measuring: ${entry.name}`)
    const fixture = await buildFixture({
      width: 640,
      height: 360,
      seconds: 70,
      frameRate: 25,
      audio: entry.audio,
    })
    const { file, workspace, openingSeconds, frameRate } = await process(fixture, {
      presetId: 'best',
      branding: { opening: true, closing: true },
      jobId: `acceptance-loudness-${index}`,
    })
    // Content region only: the branding bed is mastered separately and
    // measuring it alongside would answer a different question.
    const measuredContent = await measureLoudness(file, {
      fromSeconds: openingSeconds + 1,
      toSeconds: openingSeconds + 69,
    })
    // Peak is a whole-file ceiling. Cropping it with the loudness region hid
    // precisely the t=0/EOF failures this criterion exists to catch (VH-50).
    const measuredFull = await measureLoudness(file)
    // Loudness is an average and is nearly blind to missing content: a file
    // can hit target exactly having dropped a third of its frames. So the
    // verdict also asks whether the samples tile the span they claim (VH-62).
    const videoCoverage = await measureCoverage(file, 'video', 1 / 25 + 0.001)
    await workspace.dispose()
    const measurement =
      measuredContent && measuredFull
        ? {
            integratedLufs: measuredContent.integratedLufs,
            truePeakDbtp: measuredFull.truePeakDbtp,
          }
        : null
    if (!measurement) {
      allVerified = false
      results.push(`${entry.name}: FAIL (missing-audio)`)
      continue
    }

    if (!videoCoverage) {
      allVerified = false
      results.push(`${entry.name}: FAIL (no video packets)`)
      continue
    }
    // Three separate questions, because each can fail with the others intact.
    //
    // Truncation: the output must still contain the 70 s of source, whatever
    // branding was added around it. Derived from the fixture rather than from
    // the branding lengths, which vary by mode.
    const spanSeconds = videoCoverage.lastEndSeconds - videoCoverage.firstSeconds
    if (spanSeconds < 70 + openingSeconds - 0.5) {
      allVerified = false
      results.push(`${entry.name}: FAIL (picture spans ${spanSeconds.toFixed(2)}s, source was 70s)`)
      continue
    }
    // Silent drops: the frames must actually fill the span they claim. A file
    // can state the right duration while having encoded a third of the frames.
    const expectedFrames = Math.round(spanSeconds * frameRate)
    if (Math.abs(videoCoverage.sampleCount - expectedFrames) / expectedFrames > 0.02) {
      allVerified = false
      results.push(
        `${entry.name}: FAIL (${videoCoverage.sampleCount} frames across ${spanSeconds.toFixed(2)}s at ${frameRate} fps, expected ~${expectedFrames})`,
      )
      continue
    }
    // Holes and pile-ups: one frame period of slack absorbs the CFR grid's
    // rounding at the branding joins; anything larger is a real discontinuity.
    const slack = 1 / frameRate + 0.001
    if (videoCoverage.largestGapSeconds > slack || videoCoverage.largestOverlapSeconds > slack) {
      allVerified = false
      results.push(
        `${entry.name}: FAIL (largest gap ${videoCoverage.largestGapSeconds.toFixed(3)}s, largest overlap ${videoCoverage.largestOverlapSeconds.toFixed(3)}s)`,
      )
      continue
    }

    const off = Math.abs(measurement.integratedLufs - TARGET_INTEGRATED_LUFS)
    if (Number.isFinite(off)) worstLoudness = Math.max(worstLoudness, off)
    if (Number.isFinite(measurement.truePeakDbtp)) {
      worstPeak = Math.max(worstPeak, measurement.truePeakDbtp)
    }
    const measuredSummary =
      `${measurement.integratedLufs.toFixed(2)} LUFS, ` +
      `peak ${measurement.truePeakDbtp.toFixed(4)} dBTP`
    const verification = verifyOutputAudio(measurement)
    if (!verification.ok) {
      allVerified = false
      results.push(`${entry.name}: ${measuredSummary} — FAIL (${verification.code})`)
      continue
    }

    results.push(`${entry.name}: ${measuredSummary}`)
  }

  const highestPeak = Number.isFinite(worstPeak) ? `${worstPeak.toFixed(4)} dBTP` : 'unavailable'
  return {
    criterion: '2',
    title: 'Output is −16 ±0.5 LUFS, never exceeds −2.0 dBTP, and is complete',
    status: allVerified ? 'pass' : 'fail',
    detail: `${results.join('; ')}. Worst deviation ${worstLoudness.toFixed(2)} LU, highest peak ${highestPeak}. Frame count and timeline coverage checked on every entry, because loudness alone cannot tell a complete file from one missing a third of its frames.`,
  }
}

async function checkSync(log: Report): Promise<Check[]> {
  log('  building a variable-frame-rate fixture with paired markers')
  const fixture = await buildFixture({
    width: 854,
    height: 480,
    seconds: 60,
    frameRate: 25,
    variableFrameRate: true,
    audio: { startPeakDbfs: -20, syncMarkers: true },
  })
  const expected = syncMarkerTimes(60)

  // Measured before processing too: a fixture cannot place a marker more
  // precisely than its own frame grid, and that error is not the pipeline's.
  const sourceSync = await measureSync(fixture)

  const { file, workspace } = await process(fixture, {
    presetId: 'best',
    branding: { opening: false, closing: false },
    jobId: 'acceptance-sync',
  })
  const outputSync = await measureSync(file)
  const sync = relativeSync(sourceSync, outputSync)

  const playable = await new Promise<boolean>((resolve) => {
    const element = document.createElement('video')
    element.src = URL.createObjectURL(file)
    element.onloadedmetadata = () => resolve(element.videoWidth > 0)
    element.onerror = () => resolve(false)
    setTimeout(() => resolve(false), 8000)
  })
  await workspace.dispose()

  const found = sync.paired
  const mean = sync.offsetsMs.length
    ? sync.offsetsMs.reduce((total, value) => total + value, 0) / sync.offsetsMs.length
    : 0
  const spread = sync.worstOffsetMs

  // Two different things were conflated in the first version of this check,
  // and separating them is the point rather than a relaxation.
  //
  // The SYSTEMATIC offset — the mean — is what perception responds to, and
  // what an encoder can get wrong. ITU-R BT.1359 puts audio-after-video
  // detection near +45 ms; this holds it to 10, which is strict.
  //
  // The per-marker SPREAD is frame quantisation. A source frame can only be
  // shown when the output grid allows, so a marker lands within half a frame
  // period of its true time — +/-20 ms at 25 fps — and no amount of correct
  // encoding removes that. Asserting better than one frame would be asserting
  // something that cannot exist. On a constant-frame-rate source, where the
  // grids align, the same measurement reads 0.0 ms at every marker.
  //
  // Both are reported either way, so a regression in either is visible.
  const outputFramePeriodMs = 1000 / 25
  const syncPass =
    found >= expected.length &&
    Math.abs(mean) <= 10 &&
    Math.abs(sync.driftMs) <= 10 &&
    spread <= outputFramePeriodMs

  return [
    {
      criterion: '6',
      title: 'A variable-frame-rate source keeps sound and picture in step',
      status: syncPass ? 'pass' : 'fail',
      detail: `${found} of ${expected.length} markers paired. Systematic offset ${mean.toFixed(1)} ms (limit 10), drift ${sync.driftMs.toFixed(1)} ms (limit 10), spread ${spread.toFixed(1)} ms (bounded by the ${outputFramePeriodMs.toFixed(0)} ms output frame period). Per marker: ${sync.offsetsMs.map((v) => v.toFixed(1)).join(', ')} ms.`,
    },
    {
      criterion: '1 (partial)',
      title: 'Output is a valid MP4 that plays',
      status: playable ? 'manual' : 'fail',
      detail: playable
        ? 'Decodes and reports its dimensions in Chrome. VLC, QuickTime and an EchoVideo upload need a person and real material — VH-M1.'
        : 'The output did not decode in this browser.',
    },
  ]
}

/**
 * Criterion 6's other half: the source's own timeline, not just its sync.
 *
 * The sync check pairs markers on a fixture whose lanes start together and
 * run without holes. Neither of the two ways a real capture breaks that —
 * audio joining late, and a hole mid-track — was measured anywhere until
 * VH-74, and both used to be collapsed silently. These are the acceptance-level
 * guard for that: the Node tests prove the arithmetic, and this proves it
 * survives a real encoder round trip.
 */
async function checkSourceTimeline(log: Report): Promise<Check> {
  const AUDIO_PACKET_SLACK = 0.05
  const cases = [
    {
      name: 'audio joining 8 s late',
      audio: { startPeakDbfs: -20, startSeconds: 8 },
      jobId: 'acceptance-timeline-late',
      // The picture starts at the origin, so the sound must still be 8 s in.
      expect: (source: { firstSeconds: number }, output: { firstSeconds: number }, offset: number) =>
        Math.abs(output.firstSeconds - (offset + source.firstSeconds)) <= 0.15,
      describe: 'the sound still starts where the source put it',
    },
    {
      name: 'a 6 s hole mid-track',
      audio: { startPeakDbfs: -20, gap: [10, 16] as const },
      jobId: 'acceptance-timeline-gap',
      // Filled with silence rather than left as a hole, so what must survive
      // is the SPAN: collapsing the hole shortened it by six seconds.
      expect: (
        source: { firstSeconds: number; lastEndSeconds: number },
        output: { firstSeconds: number; lastEndSeconds: number },
      ) =>
        Math.abs(
          output.lastEndSeconds -
            output.firstSeconds -
            (source.lastEndSeconds - source.firstSeconds),
        ) <= 0.3,
      describe: 'the sound still lasts as long as the source did',
    },
  ]

  const results: string[] = []
  let allHeld = true

  for (const testCase of cases) {
    log(`  ${testCase.name}`)
    const fixture = await buildFixture({
      width: 640,
      height: 360,
      seconds: 30,
      frameRate: 25,
      audio: testCase.audio,
    })
    const source = await measureCoverage(fixture, 'audio', AUDIO_PACKET_SLACK)
    const { file, workspace, openingSeconds } = await process(fixture, {
      presetId: 'best',
      branding: { opening: false, closing: false },
      jobId: testCase.jobId,
    })
    const output = await measureCoverage(file, 'audio', AUDIO_PACKET_SLACK)
    await workspace.dispose()

    if (!source || !output) {
      allHeld = false
      results.push(`${testCase.name}: FAIL (no audio packets)`)
      continue
    }
    const held = testCase.expect(source, output, openingSeconds)
    if (!held) allHeld = false
    results.push(
      `${testCase.name}: ${held ? 'held' : 'FAIL'} — source starts ${source.firstSeconds.toFixed(2)}s ` +
        `spanning ${(source.lastEndSeconds - source.firstSeconds).toFixed(2)}s, ` +
        `output starts ${output.firstSeconds.toFixed(2)}s spanning ` +
        `${(output.lastEndSeconds - output.firstSeconds).toFixed(2)}s`,
    )
  }

  return {
    criterion: '6',
    title: 'A late-starting or gapped audio track keeps its place',
    status: allHeld ? 'pass' : 'fail',
    detail: `${results.join('; ')}. Each case asserts ${cases.map((c) => c.describe).join(', and ')}.`,
  }
}

/**
 * Criterion 1, on the shape a phone actually produces.
 *
 * Portrait phone video is landscape PIXELS plus a rotation flag. Every frame
 * therefore arrives at 1920x1080 while the branding card is rendered at the
 * 1080x1920 output shape, and the encoder's constant-size guard — which runs
 * before the transform that would have normalised both — refused the job. The
 * closing card is on by default, so that was every portrait upload (VH-26).
 *
 * Both conventions are covered because a fixture that simply swaps width and
 * height does NOT stand in for a phone file, and only the flagged one failed.
 */
async function checkPortrait(log: Report): Promise<Check> {
  const cases = [
    { name: 'rotation flag, as a phone writes', width: 1920, height: 1080, rotation: 90 as const },
    { name: 'portrait pixels, no flag', width: 1080, height: 1920, rotation: undefined },
  ]

  const results: string[] = []
  let allHeld = true

  for (const [index, testCase] of cases.entries()) {
    log(`  ${testCase.name}`)
    let workspace: OpfsWorkspace | null = null
    try {
      const fixture = await buildFixture({
        width: testCase.width,
        height: testCase.height,
        seconds: 4,
        frameRate: 25,
        audio: { startPeakDbfs: -20 },
        ...(testCase.rotation ? { rotation: testCase.rotation } : {}),
      })
      // Branding ON: without it the two lanes never disagree and this proves
      // nothing. That is exactly why the bug survived — it needs the card.
      const produced = await process(fixture, {
        presetId: 'best',
        branding: { opening: false, closing: true },
        jobId: `acceptance-portrait-${index}`,
      })
      workspace = produced.workspace
      const report = await inspectFile(produced.file)
      const upright =
        report.video.displayHeight > report.video.displayWidth &&
        report.video.codedHeight > report.video.codedWidth
      if (!upright) allHeld = false
      results.push(
        `${testCase.name}: ${upright ? 'upright' : 'FAIL'} ${report.video.codedWidth}x${report.video.codedHeight}`,
      )
    } catch (cause) {
      allHeld = false
      results.push(
        `${testCase.name}: FAIL — ${cause instanceof Error ? cause.message : String(cause)}`,
      )
    } finally {
      if (workspace) await workspace.dispose()
    }
  }

  return {
    criterion: '1',
    title: 'A portrait phone video survives branding and comes out upright',
    status: allHeld ? 'pass' : 'fail',
    detail: `${results.join('; ')}. The output is portrait in CODED pixels, not merely flagged as rotated, so a player that ignores the flag still shows it the right way up.`,
  }
}

/**
 * Criterion 8, through the protocol the app actually uses.
 *
 * It used to build an `AbortController`, hand it to `runPipeline` on the main
 * thread, and abort it — which proves the PIPELINE unwinds. It says nothing
 * about the thing a user's Cancel actually does: post a `cancel` message to a
 * worker that owns the job, and have that worker abort it, release its Web
 * Lock, delete its scratch directory, and answer `cancelled`. Every one of
 * those steps was outside the check (P2-07).
 */
async function checkCancellation(log: Report): Promise<Check> {
  log('  starting a worker job and cancelling it through the worker protocol')
  const fixture = await buildFixture({
    width: 854,
    height: 480,
    seconds: 60,
    frameRate: 25,
    audio: { startPeakDbfs: -20 },
  })

  const root = await navigator.storage.getDirectory()
  const jobDirectories = async (): Promise<string[]> => {
    const names: string[] = []
    try {
      const dir = await root.getDirectoryHandle(ROOT_DIRECTORY, { create: true })
      const iterable = dir as FileSystemDirectoryHandle & { keys(): AsyncIterableIterator<string> }
      for await (const name of iterable.keys()) if (name) names.push(name)
    } catch {
      return []
    }
    return names
  }

  const fail = (detail: string): Check => ({
    criterion: '8',
    title: 'Cancelling leaves no partial file and no orphaned data',
    status: 'fail',
    detail,
  })

  await sweepOrphanedJobs()
  const before = await jobDirectories()

  const worker = new Worker(new URL('../workers/job.worker.ts', import.meta.url), {
    type: 'module',
    name: 'uon-acceptance-cancel',
  })

  try {
    const PROCESS_ID = 1
    const replied = new Promise<WorkerOutbound>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('the worker never answered')), 180_000)
      worker.addEventListener('message', (event: MessageEvent<WorkerOutbound>) => {
        const message = event.data
        if (message.kind === 'stage' || message.kind === 'uncaught') return
        if (message.id !== PROCESS_ID) return
        clearTimeout(timer)
        resolve(message)
      })
      worker.addEventListener('error', () => {
        clearTimeout(timer)
        reject(new Error('the worker failed to start'))
      })
    })

    worker.postMessage({
      kind: 'process',
      id: PROCESS_ID,
      file: fixture,
      presetId: 'best',
      branding: { opening: false, closing: false },
      backgroundColour: '#000000',
    })

    // Cancel only once the job has genuinely started writing. Cancelling a job
    // that has not opened its workspace yet proves nothing about cleanup, and
    // a fixed delay is exactly how that becomes a flaky pass.
    let during: string[] = []
    const deadline = performance.now() + 30_000
    while (performance.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      during = await jobDirectories()
      if (during.length > before.length) break
    }
    if (during.length <= before.length) {
      return fail(
        `No job directory ever appeared, so nothing was cancelled mid-write and this check proves nothing. Directories before: ${before.length}.`,
      )
    }

    worker.postMessage({ kind: 'cancel', id: 2, cancelId: PROCESS_ID })
    const reply = await replied

    if (reply.kind !== 'cancelled') {
      return fail(
        `The worker answered \`${reply.kind}\` rather than \`cancelled\`. A job that finishes anyway, or fails, is not a cancellation.`,
      )
    }

    // The worker answers before its cleanup has necessarily settled, so give it
    // a bounded window rather than a fixed sleep that is either flaky or slow.
    let after = await jobDirectories()
    const cleanupBy = performance.now() + 10_000
    while (after.length > before.length && performance.now() < cleanupBy) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      after = await jobDirectories()
    }

    const leaked = after.filter((name) => !before.includes(name))
    return {
      criterion: '8',
      title: 'Cancelling leaves no partial file and no orphaned data',
      status: leaked.length === 0 ? 'pass' : 'fail',
      detail:
        leaked.length === 0
          ? `A worker job was started, confirmed writing (${during.length} directories against ${before.length}), cancelled by the \`cancel\` message the Cancel button sends, and answered \`cancelled\`. Its scratch directory was gone afterwards. This exercises the worker's own abort, lock release and cleanup — not an in-process AbortController.`
          : `${leaked.length} job director${leaked.length === 1 ? 'y' : 'ies'} survived the cancellation: ${leaked.join(', ')}.`,
    }
  } catch (cause) {
    return fail(cause instanceof Error ? cause.message : String(cause))
  } finally {
    worker.terminate()
  }
}

/** Runs the whole suite. */
export async function runAcceptance(log: Report): Promise<AcceptanceReport> {
  const startedAt = performance.now()
  const checks: Check[] = []

  const egress = new EgressWatch()
  egress.start()

  // Running for the whole suite: a leaked decoded sample is reported on the
  // console and by nothing else, so a run could print it and still come out
  // green (VH-62). VH-75 found a real one on the cancel path exactly this way.
  const resources = new ResourceWatch()
  resources.start()

  log('Criterion 2 — loudness and true peak across a corpus')
  checks.push(await checkLoudnessCorpus(log))

  log('Criterion 6 — A/V sync on a variable-frame-rate source')
  checks.push(...(await checkSync(log)))

  log('Criterion 1 — portrait sources')
  checks.push(await checkPortrait(log))

  log('Criterion 6 — the source timeline')
  checks.push(await checkSourceTimeline(log))

  log('Criterion 8 — cancellation')
  checks.push(await checkCancellation(log))

  log('Criterion 1 — the worker path')
  const workerPath = await checkWorkerPath(log)
  checks.push(workerPath.check)

  log('Criterion 5 — preset separation')
  checks.push(await checkPresetSeparation(log))

  log('Criterion 9 — media egress')
  // Both realms, merged. The main thread's watch cannot see the worker's
  // `fetch` or its resource timeline, and the job — branding request included
  // — runs in the worker, so a verdict from one of them describes the realm
  // the media never enters (VH-62).
  const report = mergeEgress(egress.stop(), workerPath.egress)
  checks.push({
    criterion: '9',
    title: 'Nothing leaves the device',
    status: report.withBody.length === 0 && report.crossOrigin.length === 0 ? 'pass' : 'fail',
    detail: `${report.allRequests.length} requests across the page and the job worker, all same-origin, none carrying a request body. Cross-origin: ${report.crossOrigin.length}. With a body: ${report.withBody.length}. The verdict rests on the body wrapper, which records at the moment of the call; the count joins that with the resource timeline, which only lists requests that finished (VH-84).`,
  })
  checks.push(await checkEgressInstrument(log))

  // Covered elsewhere, named here so the picture is complete rather than
  // flattering. NOT `pass`: this page did not run it, and a status it did not
  // earn is the difference between a report and an advertisement.
  checks.push({
    criterion: '3',
    title: 'The meter matches EBU Tech 3341 within ±0.1 LU',
    status: 'external',
    detail:
      'Asserted by `npm run check` — test/ebu3341 — not by this page, so this run is no evidence either way. At the last run: worst error 0.021 LU, and cases 7 and 8 skipped for want of the EBU audio files.',
  })
  checks.push({
    criterion: '4',
    title: 'No audible pumping on variable material',
    status: 'manual',
    detail:
      'The short-term plot side is asserted in src/audio/chain.test.ts — the chain adds under 1.5 LU to the worst one-second swing. The listening half needs a person and real material (VH-M1).',
  })
  checks.push({
    criterion: '5',
    title: 'Slide text stays legible in the smaller output',
    status: 'manual',
    detail:
      'The size half is now measured above, on camera-like motion. That resolution is preserved to 1080p is asserted in src/config/presets.test.ts. Whether text is legible to a person still needs real slides (VH-M1).',
  })
  checks.push({
    criterion: '7',
    title: 'Every block and warning triggers deliberately and reads clearly',
    status: 'manual',
    detail:
      'All four §7.3 outcomes and all seven §5.4 warnings are triggered in unit tests, and the wording is checked for jargon and blame. Whether it reads clearly to a lecturer needs a lecturer.',
  })

  const leaks = resources.stop()
  checks.push({
    criterion: '8',
    title: 'The run leaks no decoded samples',
    status: leaks.length === 0 ? 'pass' : 'fail',
    detail:
      leaks.length === 0
        ? 'No resource warning was printed during this run. Main-thread work only: a worker has its own console and this cannot see it, so a leak inside the worker job would not appear here.'
        : `${leaks.length} resource warning(s): ${[...new Set(leaks)].join(' | ')}. A decoded sample was dropped without being closed, which is a leak whatever else the run reported.`,
  })

  return {
    checks,
    ranAt: new Date().toISOString(),
    seconds: (performance.now() - startedAt) / 1000,
  }
}
