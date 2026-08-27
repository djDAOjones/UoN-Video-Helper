/**
 * Measuring and cancelling the audio encoder's own delay.
 *
 * An AAC encoder emits priming samples before the first real audio, and the
 * conventional fix is an edit list in the container telling the player to skip
 * them. Mediabunny writes no edit list, and the decoder does not strip them
 * either, so the audio content ends up late by exactly the encoder's delay.
 *
 * Measured on this machine: AAC 44.0 ms, Opus 0 ms, PCM 0 ms. That is right on
 * the threshold where audio-after-video starts to be noticed at all
 * (ITU-R BT.1359 puts it near 45 ms), so it is not something to wave through.
 *
 * The compensation is applied to the PICTURE, not the sound: the pipeline
 * delays every video timestamp by this figure, so the video arrives as late as
 * the priming makes the audio arrive and the two are in step. Shifting the
 * audio earlier instead was the first fix and it discarded whatever landed
 * before timestamp zero — three files in the real corpus carry energy there,
 * sometimes the attack of the first word (VH-55, review R-03).
 *
 * This module only measures. Where the number is applied is `pipeline.ts`.
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

/** Measured once per codec configuration; the delay is a property of the encoder. */
const cache = new Map<string, Promise<number | null>>()

const PROBE_SAMPLE_RATE = 48000
const PROBE_SECONDS = 0.5
const IMPULSE_AT_SECONDS = 0.2

/**
 * Encodes an impulse at a known time, decodes it back, and reports how far it
 * moved.
 *
 * @returns The delay in seconds, or `null` when it could not be measured.
 *
 * The two are different facts and used to be the same number (review R-03):
 * Opus and PCM genuinely have no delay, and an encoder whose probe threw also
 * reported zero. Both left the audio uncompensated, but only one of them was
 * correct to. A caller that cannot tell them apart cannot say so either.
 */
export async function measureEncoderDelay(config: AudioEncodingConfig): Promise<number | null> {
  const key = JSON.stringify({ codec: config.codec, bitrate: config.bitrate })
  const existing = cache.get(key)
  if (existing) return existing

  const measurement = (async (): Promise<number | null> => {
    try {
      const channels = 2
      const output = new Output({
        format: new Mp4OutputFormat({ fastStart: false }),
        target: new BufferTarget(),
      })
      const source = new AudioSampleSource(config)
      output.addAudioTrack(source)
      await output.start()

      const frames = Math.round(PROBE_SAMPLE_RATE * PROBE_SECONDS)
      const data = new Float32Array(frames * channels)
      const impulseStart = Math.round(PROBE_SAMPLE_RATE * IMPULSE_AT_SECONDS)
      const impulseFrames = Math.round(PROBE_SAMPLE_RATE * 0.005)
      for (let n = impulseStart; n < impulseStart + impulseFrames; n++) {
        for (let ch = 0; ch < channels; ch++) data[n * channels + ch] = 0.9
      }

      const sample = new AudioSample({
        data,
        format: 'f32',
        numberOfChannels: channels,
        sampleRate: PROBE_SAMPLE_RATE,
        timestamp: 0,
      })
      await source.add(sample)
      sample.close()
      source.close()
      await output.finalize()

      const buffer = output.target.buffer
      if (!buffer) return null

      const input = new Input({
        formats: [new Mp4InputFormat()],
        source: new BlobSource(new Blob([new Uint8Array(buffer)])),
      })
      const track = await input.getPrimaryAudioTrack()
      if (!track) return null

      let elapsed = 0
      let foundAt: number | null = null
      for await (const decoded of new AudioSampleSink(track).samples()) {
        const plane = new Float32Array(decoded.numberOfFrames)
        decoded.copyTo(plane, { planeIndex: 0, format: 'f32-planar' })
        for (let i = 0; i < plane.length && foundAt === null; i++) {
          if (Math.abs(plane[i]!) > 0.4) foundAt = (elapsed + i) / PROBE_SAMPLE_RATE
        }
        elapsed += decoded.numberOfFrames
        decoded.close()
      }

      // No impulse found at all is a failed probe, not a zero delay: the
      // impulse was put there by this function.
      if (foundAt === null) {
        log.warn('encoder-delay', 'probe found no impulse; continuing uncompensated', {
          codec: config.codec,
        })
        return null
      }
      const delay = Math.max(0, foundAt - IMPULSE_AT_SECONDS)
      log.info('encoder-delay', 'measured', {
        codec: config.codec,
        delayMs: Math.round(delay * 10000) / 10,
      })
      return delay
    } catch (cause) {
      // Unmeasurable means uncompensated, not broken. Better to ship the
      // known offset than to apply a number we did not actually measure.
      log.warn('encoder-delay', 'could not measure; continuing uncompensated', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      return null
    }
  })()

  cache.set(key, measurement)
  return measurement
}
