/**
 * Planning and applying the audio chain over a real file.
 *
 * The chain needs a number it cannot know until it has been run: the single
 * linear gain in spec 5.2 step 5 must land the *output* on -16 LUFS, and both
 * the stages above it and the limiter below it change the loudness on the way.
 * So the audio is traversed several times:
 *
 *   A. Measure the source — integrated, LRA, short-term curve, true peak.
 *      LRA decides whether the macro-leveller runs at all.
 *   B. Run steps 2-4 and measure what they leave behind — the first estimate.
 *   B'. Run the WHOLE chain at that estimate and correct it, until the number
 *      the chain really produces is on target. See `audio/gain-solve.ts`:
 *      solving against a chain that does not limit is what put a real lecture
 *      0.75 LU below target while the synthetic corpus passed (VH-50).
 *      The first of these passes also encodes a sample of its own output,
 *      and every pass subtracts what that showed the codec costs — so "on
 *      target" means in the delivered file rather than at the encoder's input
 *      (VH-83, `codec-probe.ts`).
 *   C. Apply steps 2-6 with the solved gain.
 *
 * Several passes sounds expensive and is not: audio-only decode of an hour
 * measured around 3.6 s, and the DSP is cheap next to video encoding. Getting
 * the gain right by measurement rather than by estimating what the compressor
 * and limiter did is worth far more than the seconds it costs.
 */

import {
  AudioSampleSink,
  type AudioEncodingConfig,
  type AudioSample,
  type InputAudioTrack,
} from 'mediabunny'

import { AudioAnalyser, type AudioAnalysis } from '../audio/analyse'
import { AudioChain } from '../audio/chain'
import { solveChainGainDb } from '../audio/gain-solve'
import { buildGainEnvelope, type GainEnvelope } from '../audio/macrolevel'
import { LIMITER } from '../config/audio'
import { log } from '../core/logger'
import { applyBoundaryFade } from './branding'
import { toPlanar, toSample } from './audio-frames'
import { CodecProbe, limiterCeilingFor, type CodecCost } from './codec-probe'
import { AudioGapFiller } from './source-timeline'

export interface AudioPlan {
  readonly analysis: AudioAnalysis
  readonly envelope: GainEnvelope
  /** The single linear gain, in dB. */
  readonly gainDb: number
  readonly sampleRate: number
  readonly channelCount: number
  /**
   * What the encode was measured to cost at this gain, which the gain already
   * allows for. `null` when it was not measured — no encoder config was given,
   * or the probe failed — and the gain then aims the CHAIN at target, as it
   * did before VH-83.
   */
  readonly codec: CodecCost | null
  /**
   * The ceiling the limiter holds for this job, in dBTP. The standing one
   * unless the encode was measured to overshoot by more than it allows for.
   */
  readonly limiterCeilingDbtp: number
}

/** What one traversal produced. */
interface Traversal {
  readonly analysis: AudioAnalysis
  /** Frames the traversal emitted, gap-fill and flush included. */
  readonly frames: number
}

/**
 * Runs one traversal of the track, optionally through a chain, into an
 * analyser.
 *
 * @param tap - Given every block exactly as it goes to the analyser, in order.
 *   Awaited, so a consumer that encodes can apply backpressure.
 */
async function traverse(
  track: InputAudioTrack,
  sampleRate: number,
  channelCount: number,
  chain: AudioChain | null,
  signal: AbortSignal | undefined,
  onSample?: () => void,
  tap?: (block: Float32Array[]) => Promise<void>,
): Promise<Traversal> {
  const analyser = new AudioAnalyser({ sampleRate, channelCount })
  const sink = new AudioSampleSink(track)
  // Every pass fills gaps identically, or the short-term curve this pass
  // produces would be indexed differently from the envelope pass C applies
  // (VH-74).
  const gaps = new AudioGapFiller(sampleRate, channelCount)
  let frames = 0

  const emit = async (block: Float32Array[]): Promise<void> => {
    frames += block[0]?.length ?? 0
    analyser.addFrames(block)
    if (tap) await tap(block)
  }

  for await (const sample of sink.samples()) {
    // Closed before breaking. The loop is handed a decoded sample and only
    // then checks the signal, so an aborted traversal used to drop that one on
    // the floor — Mediabunny then reported "An AudioSample was garbage
    // collected without first being closed", which is how VH-75's supersede
    // test found it (VH-77 hygiene, fixed here because the cancel path is
    // what makes it reachable).
    if (signal?.aborted) {
      sample.close()
      break
    }
    try {
      const silence = gaps.silenceBefore(sample.timestamp)
      if (silence) await emit(chain ? chain.process(silence) : silence)
      const planar = toPlanar(sample, channelCount)
      gaps.accept(planar[0]?.length ?? 0)
      await emit(chain ? chain.process(planar) : planar)
    } finally {
      sample.close()
    }
    // The analysis pass used to say nothing at all from start to finish, and it
    // scales with the file. That was invisible until VH-38 made silence the
    // signal a job is wedged (VH-51).
    onSample?.()
  }
  if (chain) await emit(chain.flush())
  if (gaps.insertedFrames > 0) {
    log.info('audio', 'source audio has gaps; filled with silence', {
      insertedSeconds: Math.round((gaps.insertedFrames / sampleRate) * 1000) / 1000,
    })
  }
  return { analysis: analyser.finish(), frames }
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
  signal?: AbortSignal,
): Promise<AudioAnalysis> {
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])
  return (await traverse(track, sampleRate, channelCount, null, signal)).analysis
}

/**
 * Passes A and B: everything needed before the encode can start.
 *
 * @param encodingFor - The audio encoder config this job will use, given the
 *   channel count. When supplied, the gain is solved for the loudness of the
 *   DELIVERED file: what the codec costs is measured once and the solver aims
 *   through it (VH-83). Omit it and the chain itself is aimed at target,
 *   which is the pre-VH-83 behaviour and what a caller with no encoder to
 *   ask — a test, a probe of the chain alone — wants.
 */
export async function planAudio(
  track: InputAudioTrack,
  signal?: AbortSignal,
  /** Called for every sample analysed, so a long analysis can prove it is alive. */
  onSample?: () => void,
  encodingFor?: (channelCount: number) => AudioEncodingConfig,
): Promise<AudioPlan> {
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])

  const startedAt = performance.now()
  const source = await traverse(track, sampleRate, channelCount, null, signal, onSample)
  const { analysis } = source
  const envelope = buildGainEnvelope({
    integratedLufs: analysis.integratedLufs,
    loudnessRangeLu: analysis.loudnessRangeLu,
    shortTermLufs: analysis.shortTermLufs,
    stepSeconds: analysis.stepSeconds,
  })

  /** What the codec was measured to cost, once it has been. */
  let codec: CodecCost | null = null
  /** True once a probe has been tried, whether or not it produced a figure. */
  let probed = false
  /** What the chain itself produced on the last limited pass, before the codec. */
  let chainLufs: number | null = null
  /**
   * What the limiter holds. Starts at the standing ceiling and is lowered,
   * once, if the probe finds this job's encode overshoots by more than that
   * allows — after which every later pass, and pass C, limits to the new one,
   * so the gain is solved against the chain that will actually run.
   */
  let limiterCeilingDbtp: number = LIMITER.ceilingDbtp

  const solution = await solveChainGainDb(async (candidateGainDb) => {
    // Probed ONCE, on the first pass that runs the chain as it will be
    // encoded. The cost is a property of the programme's spectrum far more
    // than of a few tenths of a decibel of gain — 0.379 and 0.384 LU on the
    // same lecture, 0.6 dB apart — and probing every pass trebled the
    // analysis stage for a figure that did not move (measured 2026-09-30:
    // 5.8 s of planning became 16.4 s). Never for the measuring
    // configuration: with no gain and no limiter it is not the signal that
    // gets encoded.
    const probe =
      candidateGainDb !== null && encodingFor && !probed && !signal?.aborted
        ? await CodecProbe.open({
            config: encodingFor(channelCount),
            sampleRate,
            channelCount,
            // The chain returns every frame it is given — the limiter's
            // look-ahead comes back in the flush — so the source's length is
            // the output's.
            totalFrames: source.frames,
          })
        : null
    if (candidateGainDb !== null) probed = true

    const measured = await traverse(
      track,
      sampleRate,
      channelCount,
      new AudioChain({
        sampleRate,
        channelCount,
        envelope,
        gainDb: candidateGainDb,
        limiterCeilingDbtp,
      }),
      signal,
      onSample,
      probe ? (block) => probe.add(block) : undefined,
    )
    if (candidateGainDb === null) return measured.analysis.integratedLufs

    if (probe) {
      // A cancelled traversal stopped early; its windows are not the
      // programme and nothing downstream will use the answer.
      if (signal?.aborted) await probe.cancel()
      else codec = await probe.finish()
      // The other figure the round trip gives. A codec that raises true peak
      // by more than the standing allowance would put the finished file over
      // the ceiling and have the job refused at the end (VH-83).
      limiterCeilingDbtp = limiterCeilingFor(codec?.overshootDb ?? null)
    }

    chainLufs = measured.analysis.integratedLufs
    // What the solver is told is the loudness AFTER the codec, so its
    // fixed-point lands the delivered file on target instead of the encoder's
    // input. An unmeasured cost is zero: the chain is aimed as before.
    return measured.analysis.integratedLufs - (codec?.costLu ?? 0)
  })

  const round = (value: number): number | null =>
    Number.isFinite(value) ? Math.round(value * 100) / 100 : null

  // Read through a widened local: TypeScript cannot see the closure's writes.
  const cost = codec as CodecCost | null
  const limited = chainLufs as number | null

  log.info('audio', 'chain planned', {
    sourceIntegratedLufs: round(analysis.integratedLufs),
    loudnessRangeLu: Math.round(analysis.loudnessRangeLu * 10) / 10,
    macroLevelling: envelope.gainDb.length > 0,
    afterChainLufs: round(solution.unlimitedLufs),
    // What the chain that actually runs produced at the solved gain. The
    // difference between this and `afterChainLufs` is the limiter's bite, and
    // it is the number VH-50 was hiding.
    limitedLufs:
      limited !== null
        ? round(limited)
        : solution.measuredLufs === null
          ? null
          : round(solution.measuredLufs),
    // What the codec then took, and what that predicts for the finished
    // file. The decoded-output check in the worker measures the real thing.
    codecCostLu: cost ? Math.round(cost.costLu * 1000) / 1000 : null,
    codecOvershootDb: cost ? Math.round(cost.overshootDb * 1000) / 1000 : null,
    codecProbedSeconds: cost ? Math.round(cost.probedSeconds) : null,
    limiterCeilingDbtp: Math.round(limiterCeilingDbtp * 100) / 100,
    predictedOutputLufs:
      cost && solution.measuredLufs !== null ? round(solution.measuredLufs) : null,
    refinementPasses: solution.refinementPasses,
    converged: solution.converged,
    gainDb: Math.round(solution.gainDb * 100) / 100,
    // Every pass above, together. The stage the user watches is this number.
    planningMs: Math.round(performance.now() - startedAt),
  })

  return {
    analysis,
    envelope,
    gainDb: solution.gainDb,
    sampleRate,
    channelCount,
    codec: cost,
    limiterCeilingDbtp,
  }
}

/** Joins two planar blocks channel by channel. Only a gap makes one needed. */
function concatPlanar(a: Float32Array[], b: Float32Array[]): Float32Array[] {
  if (a.length === 0) return b
  if (b.length === 0) return a
  return a.map((plane, channel) => {
    const other = b[channel] ?? new Float32Array(0)
    const joined = new Float32Array(plane.length + other.length)
    joined.set(plane)
    joined.set(other, plane.length)
    return joined
  })
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
 * Timestamps come from a running frame count, NOT from each incoming sample:
 * the chain drops the limiter's look-ahead from the head of the stream, so a
 * block's output is not the same audio as its input, and stamping it with the
 * input's timestamp would be wrong by the look-ahead.
 *
 * Counting is only sound while nothing is skipped, which is why the gap filler
 * runs first: a hole in the source becomes the silence it stands for, and the
 * count keeps meaning source time (VH-74). Where the audio STARTS is carried
 * separately, in `startOffsetSeconds` — padding a late start would move its
 * end as well.
 */
export function createContentAudioProcessor(
  plan: AudioPlan,
  options: {
    /** Where the content sits on the output timeline. */
    readonly offsetSeconds: number
    /**
     * How far after the shared source origin this track's own audio starts.
     * Zero when audio is the earlier of the two lanes.
     */
    readonly startOffsetSeconds: number
    readonly durationSeconds: number
    /** Fade the content in — true when an opening sequence precedes it. */
    readonly fadeIn: boolean
    /** Fade the content out — true when a closing sequence follows it. */
    readonly fadeOut: boolean
  },
): ContentAudioProcessor {
  const { sampleRate, channelCount, envelope, gainDb, limiterCeilingDbtp } = plan
  const chain = new AudioChain({ sampleRate, channelCount, envelope, gainDb, limiterCeilingDbtp })
  const gaps = new AudioGapFiller(sampleRate, channelCount)
  let emittedFrames = 0

  /** Fades, timestamps and emits one block of already-processed audio. */
  const emit = (processed: Float32Array[]): AudioSample | null => {
    const frames = processed[0]?.length ?? 0
    if (frames === 0) return null

    // Measured from the shared origin, because that is the clock the fade
    // boundaries and the picture are on.
    const chunkStartSeconds = options.startOffsetSeconds + emittedFrames / sampleRate
    applyBoundaryFade(processed, {
      chunkStartSeconds,
      segmentDurationSeconds: options.durationSeconds,
      sampleRate,
      fadeIn: options.fadeIn,
      fadeOut: options.fadeOut,
    })

    const output = toSample(processed, sampleRate, options.offsetSeconds + chunkStartSeconds)
    emittedFrames += frames
    return output
  }

  return {
    process: (sample: AudioSample) => {
      // Silence for the hole this sample sits after, then the sample itself.
      // Fed through the chain as one continuous stream, and emitted as one
      // block, so the caller never has to know a gap happened.
      const silence = gaps.silenceBefore(sample.timestamp)
      const planar = toPlanar(sample, channelCount)
      gaps.accept(planar[0]?.length ?? 0)
      if (!silence) return emit(chain.process(planar))
      return emit(concatPlanar(chain.process(silence), chain.process(planar)))
    },
    flush: () => emit(chain.flush()),
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
  /** @returns `null` when the chain emitted nothing for this input. */
  process(sample: AudioSample): AudioSample | null
  /**
   * The limiter's remaining look-ahead, timestamped to follow the last block.
   * Call once, after the last sample.
   *
   * @returns `null` when there is no tail — no limiter, or nothing buffered.
   */
  flush(): AudioSample | null
}
