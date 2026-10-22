/**
 * A sound-only Matroska file built in memory, for the tests that need one
 * read by Mediabunny in Node (VH-158).
 *
 * Two shapes, as the files the page meets come in two: a finished file, with
 * its Segment's size, its Duration and its Cues written once it closed, as
 * ffmpeg or a Chrome recording saved in one piece leaves one; and an
 * append-only one, every size unknown and no Duration, as a Chrome recording
 * saved chunk by chunk does. PCM blocks, as `pcm-mp4.ts` muxes them.
 */

import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  EncodedAudioPacketSource,
  EncodedPacket,
  Input,
  MkvOutputFormat,
  Output,
} from 'mediabunny'

import { PCM_BLOCK_SECONDS, PCM_CHANNELS, PCM_SAMPLE_RATE } from './pcm-mp4'

export interface PcmMkvOptions {
  readonly seconds: number
  /** Every size unknown and no Duration or Cues, as a recording saved as it goes. */
  readonly appendOnly?: boolean
}

/** Muxes `seconds` of 16-bit PCM blocks at a quiet, steady level. */
export async function pcmMkv(options: PcmMkvOptions): Promise<Uint8Array> {
  const output = new Output({
    format: new MkvOutputFormat({ appendOnly: options.appendOnly ?? false }),
    target: new BufferTarget(),
  })
  const source = new EncodedAudioPacketSource('pcm-s16')
  output.addAudioTrack(source)
  await output.start()
  const blockFrames = Math.round(PCM_BLOCK_SECONDS * PCM_SAMPLE_RATE)
  for (let index = 0; index * PCM_BLOCK_SECONDS < options.seconds - 1e-9; index++) {
    const samples = new Int16Array(blockFrames * PCM_CHANNELS).fill(1000)
    const packet = new EncodedPacket(new Uint8Array(samples.buffer), 'key', index * PCM_BLOCK_SECONDS, PCM_BLOCK_SECONDS)
    await source.add(
      packet,
      index === 0
        ? { decoderConfig: { codec: 'pcm-s16', sampleRate: PCM_SAMPLE_RATE, numberOfChannels: PCM_CHANNELS } }
        : undefined,
    )
  }
  await output.finalize()
  return new Uint8Array(output.target.buffer!)
}

/** The bytes as a file, opened as the app opens one, with Mediabunny's name for its format. */
export async function openMkv(bytes: Uint8Array): Promise<{ file: Blob; container: string; input: Input }> {
  // A copy, so the Blob owns a plain ArrayBuffer whatever the bytes were cut from.
  const file = new Blob([bytes.slice()])
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) })
  return { file, container: (await input.getFormat()).name, input }
}
