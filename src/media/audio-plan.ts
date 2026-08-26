/**
 * Planning and applying the audio chain over a real file.
 *
 * The chain needs a number it cannot know until it has been run: the single
 * linear gain in spec 5.2 step 5 must land the *output* on -16 LUFS, and
 * steps 2-4 change the loudness on the way, and the limiter after that gain is
 * non-linear. Planning therefore uses two named passes plus a bounded solve:
 *
 *   A. Measure the source — integrated, LRA, short-term curve, true peak.
 *      LRA decides whether the macro-leveller runs at all.
 *   B. Run steps 2-4 and measure what they leave behind.
 *   Solve. Measure steps 2-6 with that estimate, feeding any remaining error
 *      back until the COMPLETE chain is on target or an explicit plateau/bound
 *      is reached.
 *
 * The later encode applies the solved gain in one final streaming pass. No
 * traversal retains decoded PCM; only the small analysis curves and scalar
 * solve readings survive a pass.
 */

import { AudioSampleSink, type AudioSample, type InputAudioTrack } from 'mediabunny'

import { AudioAnalyser, type AudioAnalysis } from '../audio/analyse'
import { AudioChain } from '../audio/chain'
import { buildGainEnvelope, type GainEnvelope } from '../audio/macrolevel'
import {
  AUDIO_GAP_FILL,
  AUDIO_TIMESTAMP_OVERLAP_TOLERANCE_FRAMES,
  TARGET_INTEGRATED_LUFS,
} from '../config/audio'
import { log } from '../core/logger'
import { applyBoundaryFade } from './branding'
import { toPlanar, toSample } from './audio-frames'
import { solveAudioGain } from './audio-gain-solver'
import { mapSourceTimestamp, type SourceTimeline } from './source-timeline'

export interface AudioPlan {
  /**
   * The source analysis is deliberately not retained here. Its large curves
   * have served their purpose once the envelope and gain are derived, while
   * this plan remains live for the whole video encode (R-16).
   */
  readonly envelope: GainEnvelope
  /** The single linear gain, in dB. */
  readonly gainDb: number
  readonly sampleRate: number
  readonly channelCount: number
}

/** Allocates one bounded planar block of timeline silence. */
function silence(channelCount: number, frameCount: number): Float32Array[] {
  return Array.from({ length: channelCount }, () => new Float32Array(frameCount))
}

/** Lets a worker receive cancellation messages during a large timestamp gap. */
function yieldToTask(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/** Maps a source timestamp onto the shared clock's nearest audio frame. */
function mappedFrame(
  timeline: SourceTimeline,
  timestampSeconds: number,
  sampleRate: number,
): number {
  return Math.round(mapSourceTimestamp(timeline, timestampSeconds) * sampleRate)
}

/** A source overlap cannot be both lossless and aligned, so reject it before Start. */
function safeStartFrame(mappedStartFrame: number, nextFrame: number): number {
  const overlapFrames = nextFrame - mappedStartFrame
  if (overlapFrames > AUDIO_TIMESTAMP_OVERLAP_TOLERANCE_FRAMES) {
    throw new UnsupportedAudioTimelineError(overlapFrames)
  }
  return Math.max(mappedStartFrame, nextFrame)
}

/** A decoded sound timeline whose samples materially occupy the same time. */
export class UnsupportedAudioTimelineError extends Error {
  override readonly name = 'UnsupportedAudioTimelineError'

  constructor(readonly overlapFrames: number) {
    super(
      'The main sound track contains overlapping timestamps that cannot be preserved without changing sync or deleting sound.',
    )
  }
}

/** Runs one timestamp-aware traversal, optionally through a chain, into an analyser. */
async function traverse(
  track: InputAudioTrack,
  timeline: SourceTimeline,
  sampleRate: number,
  channelCount: number,
  chain: AudioChain | null,
  signal: AbortSignal | undefined,
  onProgress?: () => void,
): Promise<AudioAnalysis> {
  signal?.throwIfAborted()
  const analyser = new AudioAnalyser({ sampleRate, channelCount })
  const sink = new AudioSampleSink(track)
  let nextFrame = 0
  let gapChunksSinceYield = 0

  const add = (channels: Float32Array[]): void => {
    analyser.addFrames(chain ? chain.process(channels) : channels)
  }

  const fillUntil = async (targetFrame: number): Promise<void> => {
    while (nextFrame < targetFrame) {
      signal?.throwIfAborted()
      const frameCount = Math.min(AUDIO_GAP_FILL.chunkFrames, targetFrame - nextFrame)
      add(silence(channelCount, frameCount))
      nextFrame += frameCount
      gapChunksSinceYield++
      onProgress?.()

      if (gapChunksSinceYield >= AUDIO_GAP_FILL.yieldEveryChunks) {
        gapChunksSinceYield = 0
        await yieldToTask()
        signal?.throwIfAborted()
      }
    }
  }

  for await (const sample of sink.samples()) {
    let channels: Float32Array[]
    let startFrame: number
    try {
      // Check inside the ownership block so an abort after the iterator yields
      // still closes this sample instead of leaking a decoder resource.
      signal?.throwIfAborted()
      channels = toPlanar(sample, channelCount)
      startFrame = safeStartFrame(
        mappedFrame(timeline, sample.timestamp, sampleRate),
        nextFrame,
      )
    } finally {
      sample.close()
    }

    await fillUntil(startFrame)
    signal?.throwIfAborted()
    add(channels)
    nextFrame = startFrame + (channels[0]?.length ?? 0)
    // The analysis pass used to say nothing at all from start to finish. Real
    // decoded samples and synthetic gap chunks both prove forward progress.
    onProgress?.()
  }

  const audioEndSeconds = timeline.audioEndSeconds
  if (audioEndSeconds === null) {
    throw new Error('An audio traversal requires an audio endpoint')
  }
  await fillUntil(Math.max(nextFrame, Math.round(audioEndSeconds * sampleRate)))
  // Cancellation must not turn the samples seen so far into a plausible but
  // partial loudness report. The caller either gets the whole track or a throw.
  signal?.throwIfAborted()
  if (chain) analyser.addFrames(chain.flush())
  signal?.throwIfAborted()
  return analyser.finish()
}

/**
 * Pass A alone: measure the source.
 *
 * Used by pre-flight, because spec 5.4 requires the audio-quality warnings to
 * be shown BEFORE processing rather than discovered during it. The pipeline
 * measures again when it runs, which costs a second traversal of the audio —
 * around 3.6 s for an hour — and buys not having to hold analysis state
 * between two independent worker requests.
 */
export async function analyseSourceAudio(
  track: InputAudioTrack,
  timeline: SourceTimeline,
  signal?: AbortSignal,
): Promise<AudioAnalysis> {
  signal?.throwIfAborted()
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])
  signal?.throwIfAborted()
  return traverse(track, timeline, sampleRate, channelCount, null, signal)
}

/** Planning passes and bounded complete-chain solve before the encode starts. */
export async function planAudio(
  track: InputAudioTrack,
  timeline: SourceTimeline,
  signal?: AbortSignal,
  /** Called for every decoded sample or gap chunk, so analysis proves it is alive. */
  onProgress?: () => void,
): Promise<AudioPlan> {
  signal?.throwIfAborted()
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])
  signal?.throwIfAborted()

  const analysis = await traverse(
    track,
    timeline,
    sampleRate,
    channelCount,
    null,
    signal,
    onProgress,
  )
  const sourceIntegratedLufs = analysis.integratedLufs
  const sourceLoudnessRangeLu = analysis.loudnessRangeLu
  const envelope = buildGainEnvelope({
    integratedLufs: sourceIntegratedLufs,
    loudnessRangeLu: sourceLoudnessRangeLu,
    shortTermLufs: analysis.shortTermLufs,
    stepSeconds: analysis.stepSeconds,
  })

  const preGain = await traverse(
    track,
    timeline,
    sampleRate,
    channelCount,
    new AudioChain({ sampleRate, channelCount, envelope, gainDb: null }),
    signal,
    onProgress,
  )
  signal?.throwIfAborted()
  const beforeGainLufs = preGain.integratedLufs

  // Pass B is a linear starting estimate only. The limiter sits after this
  // gain and may take some of it back, so every solver reading below traverses
  // the complete chain, including the limiter flush (R-01).
  const initialGainDb = Number.isFinite(beforeGainLufs)
    ? TARGET_INTEGRATED_LUFS - beforeGainLufs
    : 0
  const solved = await solveAudioGain(
    async (gainDb) =>
      (
        await traverse(
          track,
          timeline,
          sampleRate,
          channelCount,
          new AudioChain({ sampleRate, channelCount, envelope, gainDb }),
          signal,
          onProgress,
        )
      ).integratedLufs,
    { initialGainDb },
  )
  signal?.throwIfAborted()
  const gainDb = solved.gainDb

  if (
    solved.status === 'plateau' ||
    solved.status === 'infeasible' ||
    solved.status === 'iteration-limit'
  ) {
    log.warn('audio', 'complete-chain gain target was not reachable', {
      status: solved.status,
      iterations: solved.iterations,
      integratedLufs:
        solved.measuredIntegratedLufs !== null && Number.isFinite(solved.measuredIntegratedLufs)
          ? Math.round(solved.measuredIntegratedLufs * 100) / 100
          : null,
      gainDb: Math.round(gainDb * 100) / 100,
    })
  }

  log.info('audio', 'chain planned', {
    sourceIntegratedLufs: Number.isFinite(sourceIntegratedLufs)
      ? Math.round(sourceIntegratedLufs * 10) / 10
      : null,
    loudnessRangeLu: Math.round(sourceLoudnessRangeLu * 10) / 10,
    macroLevelling: envelope.gainDb.length > 0,
    beforeGainLufs: Number.isFinite(beforeGainLufs) ? Math.round(beforeGainLufs * 10) / 10 : null,
    completeChainLufs:
      solved.measuredIntegratedLufs !== null && Number.isFinite(solved.measuredIntegratedLufs)
        ? Math.round(solved.measuredIntegratedLufs * 10) / 10
        : null,
    gainSolveStatus: solved.status,
    gainSolveIterations: solved.iterations,
    gainDb: Math.round(gainDb * 10) / 10,
  })

  return { envelope, gainDb, sampleRate, channelCount }
}

/**
 * The pass-C processor for CONTENT audio only.
 *
 * Deliberately not wired into the encoder's transform hook. That hook sees
 * every sample, including the branding bed — which is mastered at target and
 * must pass through unprocessed (spec 4.4). Levelling it would undo the
 * mastering and, worse, would do so inconsistently depending on where it fell
 * relative to the content.
 *
 * Incoming timestamps remain authoritative. The chain returns its limiter
 * look-ahead later than the input call that supplied it, so source spans are
 * queued and drained against processed frames. This preserves a delayed audio
 * start and internal gaps without deleting or duplicating PCM (R-03).
 */
export function createContentAudioProcessor(
  plan: AudioPlan,
  options: {
    /** Where the content sits on the output timeline. */
    readonly offsetSeconds: number
    /** The one source clock shared with the video lane. */
    readonly sourceTimeline: SourceTimeline
    readonly durationSeconds: number
    /** Fade the content in — true when an opening sequence precedes it. */
    readonly fadeIn: boolean
    /** Fade the content out — true when a closing sequence follows it. */
    readonly fadeOut: boolean
    /** Checked before every bounded gap block and real input block. */
    readonly checkCancelled?: () => void
  },
): ContentAudioProcessor {
  const { sampleRate, channelCount, envelope, gainDb } = plan
  const chain = new AudioChain({ sampleRate, channelCount, envelope, gainDb })
  const pending: Array<{
    readonly startFrame: number
    readonly frameCount: number
    consumedFrames: number
  }> = []
  const audioEndSeconds = options.sourceTimeline.audioEndSeconds
  if (audioEndSeconds === null) {
    throw new Error('A content audio processor requires an audio endpoint')
  }
  const timelineEndFrame = Math.round(audioEndSeconds * sampleRate)
  let nextFrame = 0
  let realFrames = 0
  let timelineFrames = 0
  let emittedFrames = 0
  let gapChunksSinceYield = 0
  let flushed = false

  /** Fades and timestamps processed frames against their queued timeline spans. */
  function* emit(processed: Float32Array[]): Generator<AudioSample> {
    const frames = processed[0]?.length ?? 0
    if (frames === 0) return

    let processedOffset = 0
    while (processedOffset < frames) {
      const span = pending[0]
      if (!span) {
        throw new Error('Audio chain emitted more frames than the timeline supplied')
      }

      const remaining = span.frameCount - span.consumedFrames
      const take = Math.min(remaining, frames - processedOffset)
      const startFrame = span.startFrame + span.consumedFrames
      const channels = processed.map((channel) =>
        channel.subarray(processedOffset, processedOffset + take),
      )
      const chunkStartSeconds = startFrame / sampleRate
      applyBoundaryFade(channels, {
        chunkStartSeconds,
        segmentDurationSeconds: options.durationSeconds,
        sampleRate,
        fadeIn: options.fadeIn,
        fadeOut: options.fadeOut,
      })

      span.consumedFrames += take
      emittedFrames += take
      processedOffset += take
      if (span.consumedFrames === span.frameCount) pending.shift()
      yield toSample(channels, sampleRate, options.offsetSeconds + chunkStartSeconds)
    }
  }

  /** Advances the DSP clock for one bounded real-or-silent block. */
  function* processChannels(startFrame: number, channels: Float32Array[]): Generator<AudioSample> {
    const frameCount = channels[0]?.length ?? 0
    if (frameCount === 0) return
    pending.push({ startFrame, frameCount, consumedFrames: 0 })
    timelineFrames += frameCount
    nextFrame = startFrame + frameCount
    yield* emit(chain.process(channels))
  }

  /** Streams explicit silence up to a shared-clock frame without retaining the gap. */
  async function* fillUntil(targetFrame: number): AsyncGenerator<AudioSample> {
    while (nextFrame < targetFrame) {
      options.checkCancelled?.()
      const frameCount = Math.min(AUDIO_GAP_FILL.chunkFrames, targetFrame - nextFrame)
      yield* processChannels(nextFrame, silence(channelCount, frameCount))
      gapChunksSinceYield++
      if (gapChunksSinceYield >= AUDIO_GAP_FILL.yieldEveryChunks) {
        gapChunksSinceYield = 0
        await yieldToTask()
        options.checkCancelled?.()
      }
    }
  }

  return {
    process: (sample: AudioSample) => {
      if (flushed) throw new Error('Content audio processor has already been flushed')

      const frameCount = sample.numberOfFrames
      // Copy synchronously, before returning the lazy stream, so the decoder's
      // AudioSample can be closed immediately by the caller.
      const channels = toPlanar(sample, channelCount)
      const timestampFrame = mappedFrame(options.sourceTimeline, sample.timestamp, sampleRate)
      const startFrame = safeStartFrame(timestampFrame, nextFrame)
      realFrames += frameCount

      return (async function* (): AsyncGenerator<AudioSample> {
        yield* fillUntil(startFrame)
        options.checkCancelled?.()
        yield* processChannels(startFrame, channels)
      })()
    },
    flush: () => {
      if (flushed) return (async function* (): AsyncGenerator<AudioSample> {})()
      flushed = true
      return (async function* (): AsyncGenerator<AudioSample> {
        yield* fillUntil(Math.max(nextFrame, timelineEndFrame))
        options.checkCancelled?.()
        yield* emit(chain.flush())
        if (pending.length > 0 || emittedFrames !== timelineFrames) {
          throw new Error(
            `Audio chain frame mismatch: received ${realFrames} real / ${timelineFrames} timeline frames, emitted ${emittedFrames}`,
          )
        }
      })()
    },
  }
}

/**
 * The content audio path, as two calls rather than one.
 *
 * `flush` exists because the limiter delays its output by a look-ahead window
 * and the streaming path used to just stop, dropping that window from the end
 * of every job (VH-20). The analysis pass already flushed
 * (`analyseSourceAudio`), so loudness was being MEASURED over samples the
 * output did not contain — a small inconsistency, but between the two things
 * that are supposed to describe the same audio.
 */
export interface ContentAudioProcessor {
  /**
   * Copies one decoder sample, then lazily emits bounded timeline blocks.
   * Drain the iterable before calling this method again.
   */
  process(sample: AudioSample): AsyncIterable<AudioSample>
  /**
   * Streams trailing timeline silence and the limiter look-ahead. Call once,
   * after the last sample, and drain before closing the encoder source.
   *
   * @returns Zero or more samples carrying every remaining timeline frame.
   */
  flush(): AsyncIterable<AudioSample>
}
