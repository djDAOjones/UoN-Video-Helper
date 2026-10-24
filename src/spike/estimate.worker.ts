/**
 * VH-116's measurement, on the worker a job runs on: pre-flight's sequence up
 * to the video probe, then the job itself, every step timed.
 *
 * The page (`estimate.ts`) sends one recording and one output; this replies
 * with the raw timings and nothing judged, so the page can hold the probe's
 * figure, a probe that waits out its first frames, and a correction from the
 * job's own early frames against the same real encode.
 *
 * Dev-only; not built.
 */

import { PRESETS, outputShapeFor, type ContentClass, type PresetId } from '../config/presets'
import { analyseOutputAudio, analyseSourceAudio } from '../media/audio-plan'
import { measureContentClass } from '../media/content-class'
import { inspectFile, openInput } from '../media/inspect'
import { OpfsWorkspace } from '../media/opfs'
import { requireReadableOutputVideo } from '../media/output-integrity'
import { runPipeline } from '../media/pipeline'
import { jobTimeEstimate, probeVideo, type JobTimeEstimate } from '../media/probe'
import { brandingAllowanceSeconds } from '../media/title-card-frame'

export interface EstimateRunRequest {
  readonly kind: 'run'
  readonly file: Blob
  readonly presetId: PresetId
  readonly brandingBaseUrl: string
  readonly runId: number
}

/** One progress message from the job, stamped on arrival, in seconds from the job's start. */
export interface StampedProgress {
  readonly atSeconds: number
  readonly stage: string
  readonly fraction: number
}

export interface EstimateRunResult {
  readonly kind: 'result'
  readonly runId: number
  readonly presetId: PresetId
  readonly durationSeconds: number
  readonly frameRate: number
  readonly sourceFrameRate: number
  readonly width: number
  readonly height: number
  readonly contentClass: ContentClass
  readonly preflight: {
    readonly contentClassSeconds: number
    readonly analysis: { readonly wallSeconds: number; readonly audioSeconds: number } | null
    readonly probe: {
      readonly frames: number
      readonly seconds: number
      readonly acceptedAtSeconds: readonly number[]
    }
    /** What the product shows, from exactly these measurements. */
    readonly estimate: JobTimeEstimate
  }
  readonly job: {
    readonly progress: readonly StampedProgress[]
    readonly pipelineSeconds: number
    readonly checkSeconds: number
    readonly totalSeconds: number
  }
}

export interface EstimateRunFailure {
  readonly kind: 'error'
  readonly runId: number
  readonly message: string
}

const post = (message: EstimateRunResult | EstimateRunFailure | { kind: 'status'; text: string }): void =>
  self.postMessage(message)

const since = (startedAt: number): number => (performance.now() - startedAt) / 1000

self.onmessage = async (event: MessageEvent<EstimateRunRequest>): Promise<void> => {
  const { file, presetId, brandingBaseUrl, runId } = event.data
  let workspace: OpfsWorkspace | null = null
  try {
    // ---- pre-flight, in `handlePreflight`'s order, untrimmed
    const report = await inspectFile(file)
    const preset = PRESETS[presetId]
    const source = {
      width: report.video.displayWidth,
      height: report.video.displayHeight,
      frameRate: report.video.conform.frameRate,
      videoBitrateBps: report.video.averageBitrateBps,
      sourceFrameRate: report.video.conform.sourceFrameRate,
    }

    const classStartedAt = performance.now()
    let contentClass: ContentClass = 'unknown'
    if (presetId === 'smaller') {
      const track = await openInput(file).getPrimaryVideoTrack()
      if (track) {
        contentClass = (
          await measureContentClass(track, {
            width: source.width,
            height: source.height,
            sourceFrameRate: source.sourceFrameRate,
            sourceBitrateBps: source.videoBitrateBps,
            keptRange: null,
          })
        ).contentClass
      }
    }
    const contentClassSeconds = since(classStartedAt)
    const shape = outputShapeFor(preset, source, contentClass)

    post({ kind: 'status', text: 'pre-flight: analysis pass' })
    const audioTrack = await openInput(file).getPrimaryAudioTrack()
    const analysisStartedAt = performance.now()
    const analysed = audioTrack ? await analyseSourceAudio(audioTrack) : null
    const analysis = analysed && !('silent' in analysed)
      ? { wallSeconds: since(analysisStartedAt), audioSeconds: analysed.durationSeconds }
      : null

    post({ kind: 'status', text: 'pre-flight: video probe' })
    const videoTrack = await openInput(file).getPrimaryVideoTrack()
    if (!videoTrack) throw new Error('no video track')
    const probe = await probeVideo(videoTrack, shape, undefined, 0)
    const estimate = jobTimeEstimate({
      videoFrames: probe.frames,
      videoSeconds: probe.seconds,
      frameRate: shape.frameRate,
      durationSeconds: report.durationSeconds,
      closingSeconds: brandingAllowanceSeconds(shape.frameRate),
      analysis,
    })

    // ---- the job, in `handleProcess`'s order, with the default closing
    post({ kind: 'status', text: 'job' })
    const progress: StampedProgress[] = []
    const jobStartedAt = performance.now()
    const jobReport = await inspectFile(file)
    workspace = await OpfsWorkspace.open(`spike-estimate-${runId}`)
    const result = await runPipeline({
      input: openInput(file),
      shape,
      preset,
      videoDurationSeconds: jobReport.video.durationSeconds,
      audioDurationSeconds: jobReport.audio?.durationSeconds ?? null,
      workspace,
      branding: { opening: false, closing: true },
      backgroundColour: '#000000',
      brandingBaseUrl,
      onProgress: ({ stage, fraction }) =>
        progress.push({ atSeconds: since(jobStartedAt), stage, fraction }),
    })
    const pipelineSeconds = since(jobStartedAt)

    const check = openInput(result.file)
    await requireReadableOutputVideo(check)
    const checkTrack = await check.getPrimaryAudioTrack()
    if (result.audioIncluded && checkTrack) await analyseOutputAudio(checkTrack)
    const totalSeconds = since(jobStartedAt)

    post({
      kind: 'result',
      runId,
      presetId,
      durationSeconds: report.durationSeconds,
      frameRate: shape.frameRate,
      sourceFrameRate: source.sourceFrameRate,
      width: shape.width,
      height: shape.height,
      contentClass,
      preflight: { contentClassSeconds, analysis, probe, estimate },
      job: { progress, pipelineSeconds, checkSeconds: totalSeconds - pipelineSeconds, totalSeconds },
    })
  } catch (cause) {
    post({ kind: 'error', runId, message: cause instanceof Error ? cause.message : String(cause) })
  } finally {
    await workspace?.dispose()
  }
}
