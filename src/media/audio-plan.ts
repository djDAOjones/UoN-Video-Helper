/**
 * Planning and applying the audio chain over a real file.
 *
 * The chain needs a number it cannot know until it has been run: the single
 * linear gain in spec 5.2 step 5 must land the *output* on -16 LUFS, and
 * steps 2-4 change the loudness on the way. So the audio is traversed three
 * times:
 *
 *   A. Measure the source — integrated, LRA, short-term curve, true peak.
 *      LRA decides whether the macro-leveller runs at all.
 *   B. Run steps 2-4 and measure what they leave behind.
 *   C. Apply steps 2-6, with the gain that pass B made computable.
 *
 * Three passes sounds expensive and is not: audio-only decode of an hour
 * measured around 3.6 s, and the DSP is cheap next to video encoding. Getting
 * the gain right by measurement rather than by estimating what the compressor
 * did is worth far more than the seconds it costs.
 */

import { AudioSample, AudioSampleSink, type InputAudioTrack } from 'mediabunny'

import { AudioAnalyser, type AudioAnalysis } from '../audio/analyse'
import { AudioChain } from '../audio/chain'
import { buildGainEnvelope, type GainEnvelope } from '../audio/macrolevel'
import { TARGET_INTEGRATED_LUFS } from '../config/audio'
import { log } from '../core/logger'

export interface AudioPlan {
  readonly analysis: AudioAnalysis
  readonly envelope: GainEnvelope
  /** The single linear gain, in dB. */
  readonly gainDb: number
  readonly sampleRate: number
  readonly channelCount: number
}

/** Pulls one sample's audio out as planar `Float32Array`s. */
function toPlanar(sample: AudioSample, channelCount: number): Float32Array[] {
  const frames = sample.numberOfFrames
  const channels: Float32Array[] = []
  for (let ch = 0; ch < channelCount; ch++) {
    const data = new Float32Array(frames)
    sample.copyTo(data, { planeIndex: ch, format: 'f32-planar' })
    channels.push(data)
  }
  return channels
}

/** Packs planar channels back into one interleaved-by-plane buffer for `AudioSample`. */
function toSample(
  channels: readonly Float32Array[],
  sampleRate: number,
  timestamp: number,
): AudioSample {
  const frames = channels[0]?.length ?? 0
  const packed = new Float32Array(frames * channels.length)
  for (let ch = 0; ch < channels.length; ch++) packed.set(channels[ch]!, ch * frames)
  return new AudioSample({
    data: packed,
    format: 'f32-planar',
    numberOfChannels: channels.length,
    sampleRate,
    timestamp,
  })
}

/** Runs one traversal of the track, optionally through a chain, into an analyser. */
async function traverse(
  track: InputAudioTrack,
  sampleRate: number,
  channelCount: number,
  chain: AudioChain | null,
  signal: AbortSignal | undefined,
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
  }
  if (chain) analyser.addFrames(chain.flush())
  return analyser.finish()
}

/** Passes A and B: everything needed before the encode can start. */
export async function planAudio(
  track: InputAudioTrack,
  signal?: AbortSignal,
): Promise<AudioPlan> {
  const [sampleRate, channelCount] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])

  const analysis = await traverse(track, sampleRate, channelCount, null, signal)
  const envelope = buildGainEnvelope({
    integratedLufs: analysis.integratedLufs,
    loudnessRangeLu: analysis.loudnessRangeLu,
    shortTermLufs: analysis.shortTermLufs,
    stepSeconds: analysis.stepSeconds,
  })

  const measured = await traverse(
    track,
    sampleRate,
    channelCount,
    new AudioChain({ sampleRate, channelCount, envelope, gainDb: null }),
    signal,
  )

  // A source with no measurable loudness (pure silence) gets no gain: lifting
  // silence by 60 dB would produce nothing but noise.
  const gainDb = Number.isFinite(measured.integratedLufs)
    ? TARGET_INTEGRATED_LUFS - measured.integratedLufs
    : 0

  log.info('audio', 'chain planned', {
    sourceIntegratedLufs: Number.isFinite(analysis.integratedLufs)
      ? Math.round(analysis.integratedLufs * 10) / 10
      : null,
    loudnessRangeLu: Math.round(analysis.loudnessRangeLu * 10) / 10,
    macroLevelling: envelope.gainDb.length > 0,
    afterChainLufs: Number.isFinite(measured.integratedLufs)
      ? Math.round(measured.integratedLufs * 10) / 10
      : null,
    gainDb: Math.round(gainDb * 10) / 10,
  })

  return { analysis, envelope, gainDb, sampleRate, channelCount }
}

/**
 * Builds the per-sample hook for pass C.
 *
 * Timestamps come from a running frame count rather than from the incoming
 * sample. The chain drops the limiter's look-ahead delay from the head of the
 * stream, so counting frames out is what keeps the result both contiguous and
 * aligned with the picture; copying the input timestamps would leave a gap at
 * the first join.
 */
export function createAudioProcessor(plan: AudioPlan): (sample: AudioSample) => AudioSample | null {
  const { sampleRate, channelCount, envelope, gainDb } = plan
  const chain = new AudioChain({ sampleRate, channelCount, envelope, gainDb })
  let emittedFrames = 0

  return (sample: AudioSample): AudioSample | null => {
    const processed = chain.process(toPlanar(sample, channelCount))
    if ((processed[0]?.length ?? 0) === 0) return null

    const output = toSample(processed, sampleRate, emittedFrames / sampleRate)
    emittedFrames += processed[0]!.length
    return output
  }
}
