/**
 * Moving audio between Mediabunny's `AudioSample` and the planar
 * `Float32Array`s every DSP module in `src/audio/` works on.
 *
 * Shared by the chain and by branding pass-through, so both sides of a
 * boundary are unpacked and repacked identically — a difference here would
 * show up as a click at exactly the join the fades exist to smooth.
 */

import { AudioSample } from 'mediabunny'

/** Unpacks one sample into planar channels. */
export function toPlanar(sample: AudioSample, channelCount: number): Float32Array[] {
  const frames = sample.numberOfFrames
  const channels: Float32Array[] = []
  for (let ch = 0; ch < channelCount; ch++) {
    const data = new Float32Array(frames)
    sample.copyTo(data, { planeIndex: ch, format: 'f32-planar' })
    channels.push(data)
  }
  return channels
}

/** Packs planar channels back into an `AudioSample` at the given timestamp. */
export function toSample(
  channels: readonly Float32Array[],
  sampleRate: number,
  timestampSeconds: number,
): AudioSample {
  const frames = channels[0]?.length ?? 0
  const packed = new Float32Array(frames * channels.length)
  for (let ch = 0; ch < channels.length; ch++) packed.set(channels[ch]!, ch * frames)
  return new AudioSample({
    data: packed,
    format: 'f32-planar',
    numberOfChannels: channels.length,
    sampleRate,
    timestamp: timestampSeconds,
  })
}
