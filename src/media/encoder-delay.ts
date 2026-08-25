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
 * The compensation here shifts the whole audio timeline earlier by the
 * measured delay, which costs the first few tens of milliseconds of sound. On
 * a lecture that is either silence or the start of a branding fade, and it
 * buys sync that a viewer would otherwise notice.
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
import { toPlanar, toSample } from './audio-frames'

/** Measured once per codec configuration; the delay is a property of the encoder. */
const cache = new Map<string, Promise<number>>()

const PROBE_SAMPLE_RATE = 48000
const PROBE_SECONDS = 0.5
const IMPULSE_AT_SECONDS = 0.2

/**
 * Encodes an impulse at a known time, decodes it back, and reports how far it
 * moved.
 *
 * @returns The delay in seconds. Zero when nothing could be measured, which
 *   leaves behaviour exactly as it was rather than applying a guess.
 */
export async function measureEncoderDelay(config: AudioEncodingConfig): Promise<number> {
  const key = JSON.stringify({ codec: config.codec, bitrate: config.bitrate })
  const existing = cache.get(key)
  if (existing) return existing

  const measurement = (async (): Promise<number> => {
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
      if (!buffer) return 0

      const input = new Input({
        formats: [new Mp4InputFormat()],
        source: new BlobSource(new Blob([new Uint8Array(buffer)])),
      })
      const track = await input.getPrimaryAudioTrack()
      if (!track) return 0

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

      const delay = foundAt === null ? 0 : Math.max(0, foundAt - IMPULSE_AT_SECONDS)
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
      return 0
    }
  })()

  cache.set(key, measurement)
  return measurement
}

/**
 * Shifts an audio sample earlier to cancel the encoder's delay.
 *
 * Content that would land before zero is dropped rather than clamped: clamping
 * would pile the first few frames on top of each other at timestamp zero,
 * which is worse than losing them.
 */
export class AudioTimelineShift {
  constructor(
    private readonly delaySeconds: number,
    private readonly channelCount: number,
  ) {}

  get isNoOp(): boolean {
    return this.delaySeconds <= 0
  }

  apply(sample: AudioSample, sampleRate: number): AudioSample | null {
    if (this.isNoOp) return sample

    const shifted = sample.timestamp - this.delaySeconds
    const durationSeconds = sample.numberOfFrames / sampleRate

    if (shifted + durationSeconds <= 0) {
      sample.close()
      return null
    }

    if (shifted >= 0) {
      sample.setTimestamp(shifted)
      return sample
    }

    // Straddles zero: keep the part at or after it.
    const dropFrames = Math.round(-shifted * sampleRate)
    const planes = toPlanar(sample, this.channelCount).map((plane) => plane.subarray(dropFrames))
    sample.close()
    return toSample(planes, sampleRate, 0)
  }
}
