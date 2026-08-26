/**
 * Measuring the audio encoder's own delay for the real-output browser gate.
 *
 * An AAC encoder emits priming samples before the first real audio, and the
 * conventional fix is codec priming metadata or an edit in the container.
 * Mediabunny's public audio-track metadata exposes decoder configuration and a
 * codec priming packet, but no encoder-delay sample count or trim edit.
 *
 * Measured on this machine: AAC 44.0 ms, Opus 0 ms, PCM 0 ms. That is right on
 * the threshold where audio-after-video starts to be noticed at all
 * (ITU-R BT.1359 puts it near 45 ms), so it is not something to wave through.
 *
 * This module measures the delay so the pipeline can move picture and subtitle
 * presentation later by the same amount. A previous timeline shifter instead
 * dropped or sliced every source frame that moved before zero; real recordings
 * contain speech there. Presentation compensation preserves both that PCM and
 * the source's A/V offsets, at the cost of a sub-frame leading picture hold
 * that remains part of the real-player gate.
 */

import {
  AudioSample,
  AudioSampleSink,
  AudioSampleSource,
  BlobSource,
  BufferTarget,
  Input,
  Mp4InputFormat,
  Mp4OutputFormat,
  Output,
  type AudioEncodingConfig,
} from 'mediabunny'

import { log } from '../core/logger'
import { AUDIO_ENCODER_DELAY_PROBE } from '../config/audio'

/** Measured once per codec configuration; the delay is a property of the encoder. */
const cache = new Map<string, Promise<number>>()

/**
 * Encodes an impulse at a known time, decodes it back, and reports how far it
 * moved.
 *
 * @returns The measured delay in seconds. A genuine zero remains valid.
 * @throws When the round trip cannot prove a delay; uncompensated AAC already
 *   fails the product sync bound, so absence of evidence must fail closed.
 */
export async function measureEncoderDelay(
  config: AudioEncodingConfig,
  channelCount: number,
): Promise<number> {
  if (!Number.isSafeInteger(channelCount) || channelCount < 1) {
    throw new RangeError('Audio encoder delay needs a positive channel count')
  }
  const key = JSON.stringify({
    codec: config.codec,
    bitrate: config.bitrate,
    channelCount,
    sampleRate: AUDIO_ENCODER_DELAY_PROBE.sampleRate,
  })
  const existing = cache.get(key)
  if (existing) return existing

  const measurement = (async (): Promise<number> => {
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: false }),
      target: new BufferTarget(),
    })
    try {
      const source = new AudioSampleSource(config)
      output.addAudioTrack(source)
      await output.start()

      const frames = Math.round(
        AUDIO_ENCODER_DELAY_PROBE.sampleRate * AUDIO_ENCODER_DELAY_PROBE.durationSeconds,
      )
      const data = new Float32Array(frames * channelCount)
      const impulseStart = Math.round(
        AUDIO_ENCODER_DELAY_PROBE.sampleRate * AUDIO_ENCODER_DELAY_PROBE.markerAtSeconds,
      )
      const impulseFrames = Math.round(
        AUDIO_ENCODER_DELAY_PROBE.sampleRate * AUDIO_ENCODER_DELAY_PROBE.markerDurationSeconds,
      )
      for (let n = impulseStart; n < impulseStart + impulseFrames; n++) {
        for (let ch = 0; ch < channelCount; ch++) {
          data[n * channelCount + ch] = AUDIO_ENCODER_DELAY_PROBE.markerAmplitude
        }
      }

      const sample = new AudioSample({
        data,
        format: 'f32',
        numberOfChannels: channelCount,
        sampleRate: AUDIO_ENCODER_DELAY_PROBE.sampleRate,
        timestamp: 0,
      })
      try {
        await source.add(sample)
      } finally {
        sample.close()
      }
      source.close()
      await output.finalize()

      const buffer = output.target.buffer
      if (!buffer) throw new Error('The delay probe produced no encoded buffer')

      const input = new Input({
        formats: [new Mp4InputFormat()],
        source: new BlobSource(new Blob([new Uint8Array(buffer)])),
      })
      const track = await input.getPrimaryAudioTrack()
      if (!track) throw new Error('The delay probe produced no audio track')

      let foundAt: number | null = null
      for await (const decoded of new AudioSampleSink(track).samples()) {
        try {
          const plane = new Float32Array(decoded.numberOfFrames)
          decoded.copyTo(plane, { planeIndex: 0, format: 'f32-planar' })
          for (let i = 0; i < plane.length && foundAt === null; i++) {
            if (Math.abs(plane[i]!) > AUDIO_ENCODER_DELAY_PROBE.detectionThreshold) {
              foundAt = decoded.timestamp + i / decoded.sampleRate
            }
          }
        } finally {
          decoded.close()
        }
      }

      if (foundAt === null) throw new Error('The encoded delay marker could not be decoded')
      const delay = Math.max(0, foundAt - AUDIO_ENCODER_DELAY_PROBE.markerAtSeconds)
      log.info('encoder-delay', 'measured', {
        codec: config.codec,
        delayMs: Math.round(delay * 10000) / 10,
      })
      return delay
    } catch (cause) {
      await output.cancel().catch(() => undefined)
      // The browser gate proved that uncompensated AAC misses the sync limit.
      // Missing evidence therefore stops this output rather than turning a
      // known failure back into an implicit zero.
      log.warn('encoder-delay', 'could not measure; refusing uncompensated output', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      throw new Error('The audio encoder delay could not be measured safely', { cause })
    }
  })()

  cache.set(key, measurement)
  void measurement.catch(() => {
    // A transient codec/permission failure must not poison every retry until
    // reload. The failed job remains fail-closed; a later job measures anew.
    if (cache.get(key) === measurement) cache.delete(key)
  })
  return measurement
}
