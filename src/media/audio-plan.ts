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
 *   C. Apply steps 2-6 with the solved gain.
 *
 * Several passes sounds expensive and is not: audio-only decode of an hour
 * measured around 3.6 s, and the DSP is cheap next to video encoding. Getting
 * the gain right by measurement rather than by estimating what the compressor
 * and limiter did is worth far more than the seconds it costs.
 */

import { AudioSampleSink, type AudioSample, type InputAudioTrack } from 'mediabunny'

import { AudioAnalyser, type AudioAnalysis } from '../audio/analyse'
import { AudioChain } from '../audio/chain'
import { solveChainGainDb } from '../audio/gain-solve'
import { buildGainEnvelope, type GainEnvelope } from '../audio/macrolevel'
import { log } from '../core/logger'
import { applyBoundaryFade } from './branding'
import { toPlanar, toSample } from './audio-frames'

export interface AudioPlan {
  readonly analysis: AudioAnalysis
  readonly envelope: GainEnvelope
  /** The single linear gain, in dB. */
  readonly gainDb: number
  readonly sampleRate: number
  readonly channelCount: number
}

/** Runs one traversal of the track, optionally through a chain, into an analyser. */
async function traverse(
  track: InputAudioTrack,
  sampleRate: number,
  channelCount: number,
  chain: AudioChain | null,
  signal: AbortSignal | undefined,
  onSample?: () => void,
): Promise<AudioAnalysis> {
  const analyser = new AudioAnalyser({ sampleRate, channelCount })
  const sink = new AudioSampleSink(track)

  for await (const sample of sink.samples()) {
    if (signal?.aborted) break
    try {
      const planar = toPlanar(sample, channelCount)
      analyser.addFrames(chain ? chain.process(planar) : planar)
    } finally {
      sample.close()
    }
    // The analysis pass used to say nothing at all from start to finish, and it
    // scales with the file. That was invisible until VH-38 made silence the
    // signal a job is wedged (VH-51).
    onSample?.()
  }
  if (chain) analyser.addFrames(chain.flush())
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
  signal?: AbortSignal,
): Promise<AudioAnalysis> {
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])
  return traverse(track, sampleRate, channelCount, null, signal)
}

/** Passes A and B: everything needed before the encode can start. */
export async function planAudio(
  track: InputAudioTrack,
  signal?: AbortSignal,
  /** Called for every sample analysed, so a long analysis can prove it is alive. */
  onSample?: () => void,
): Promise<AudioPlan> {
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])

  const analysis = await traverse(track, sampleRate, channelCount, null, signal, onSample)
  const envelope = buildGainEnvelope({
    integratedLufs: analysis.integratedLufs,
    loudnessRangeLu: analysis.loudnessRangeLu,
    shortTermLufs: analysis.shortTermLufs,
    stepSeconds: analysis.stepSeconds,
  })

  const solution = await solveChainGainDb(async (candidateGainDb) => {
    const measured = await traverse(
      track,
      sampleRate,
      channelCount,
      new AudioChain({ sampleRate, channelCount, envelope, gainDb: candidateGainDb }),
      signal,
      onSample,
    )
    return measured.integratedLufs
  })

  const round = (value: number): number | null =>
    Number.isFinite(value) ? Math.round(value * 100) / 100 : null

  log.info('audio', 'chain planned', {
    sourceIntegratedLufs: round(analysis.integratedLufs),
    loudnessRangeLu: Math.round(analysis.loudnessRangeLu * 10) / 10,
    macroLevelling: envelope.gainDb.length > 0,
    afterChainLufs: round(solution.unlimitedLufs),
    // What the chain that actually runs produced at the solved gain. The
    // difference between this and `afterChainLufs` is the limiter's bite, and
    // it is the number VH-50 was hiding.
    limitedLufs: solution.measuredLufs === null ? null : round(solution.measuredLufs),
    refinementPasses: solution.refinementPasses,
    converged: solution.converged,
    gainDb: Math.round(solution.gainDb * 100) / 100,
  })

  return { analysis, envelope, gainDb: solution.gainDb, sampleRate, channelCount }
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
 * Timestamps come from a running frame count rather than the incoming sample:
 * the chain drops the limiter's look-ahead from the head of the stream, so
 * counting frames out is what keeps the result contiguous and aligned.
 */
export function createContentAudioProcessor(
  plan: AudioPlan,
  options: {
    /** Where the content sits on the output timeline. */
    readonly offsetSeconds: number
    readonly durationSeconds: number
    /** Fade the content in — true when an opening sequence precedes it. */
    readonly fadeIn: boolean
    /** Fade the content out — true when a closing sequence follows it. */
    readonly fadeOut: boolean
  },
): ContentAudioProcessor {
  const { sampleRate, channelCount, envelope, gainDb } = plan
  const chain = new AudioChain({ sampleRate, channelCount, envelope, gainDb })
  let emittedFrames = 0

  /** Fades, timestamps and emits one block of already-processed audio. */
  const emit = (processed: Float32Array[]): AudioSample | null => {
    const frames = processed[0]?.length ?? 0
    if (frames === 0) return null

    const chunkStartSeconds = emittedFrames / sampleRate
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
    process: (sample: AudioSample) => emit(chain.process(toPlanar(sample, channelCount))),
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
