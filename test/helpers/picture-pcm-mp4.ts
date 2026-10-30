/**
 * A picture and sound MP4 built in memory, for the tests that find where a
 * file's picture really ends without decoding it (VH-215).
 *
 * The picture is packets only: bytes of a fixed size that no decoder sees,
 * since the read under test never decodes and Node has no WebCodecs. Each
 * span's packets, their length and the sound beside them are the test's to
 * choose; the sound is {@link pcmMp4}'s PCM. Packets go to the muxer in time
 * order across both tracks, so the file interleaves them as a recording does,
 * and a cut by bytes ({@link cutShort}) stops both at about the same instant.
 */

import {
  ALL_FORMATS,
  BufferSource,
  BufferTarget,
  EncodedAudioPacketSource,
  EncodedPacket,
  EncodedVideoPacketSource,
  Input,
  Mp4OutputFormat,
  Output,
  type InputAudioTrack,
  type InputVideoTrack,
} from 'mediabunny'

import { PCM_BLOCK_SECONDS, PCM_CHANNELS, PCM_SAMPLE_RATE } from './pcm-mp4'

/** 25 fps, as the walk's lecture fixture. */
export const PICTURE_FRAME_SECONDS = 0.04
/** A picture packet's bytes: the PCM's byte rate over one frame, so both tracks fill the file alike. */
const PICTURE_PACKET_BYTES = Math.round(PCM_SAMPLE_RATE * PCM_CHANNELS * 2 * PICTURE_FRAME_SECONDS)
/** A key packet each second, the rest deltas. */
const PICTURE_KEY_EVERY = 25

export interface PicturePcmMp4Options {
  /** Where the picture runs, in seconds; a gap between two spans is a hole. */
  readonly picture: ReadonlyArray<readonly [number, number]>
  /** Where the sound runs, in seconds; none for a file without sound. */
  readonly sound?: ReadonlyArray<readonly [number, number]>
  /** Each picture packet's length, {@link PICTURE_FRAME_SECONDS} unless a test needs another. */
  readonly frameSeconds?: number
}

interface Planned {
  readonly track: 'picture' | 'sound'
  readonly packet: EncodedPacket
}

/** The packets of each span, back to back, each `stepSeconds` long. */
function spanTimes(
  spans: ReadonlyArray<readonly [number, number]>,
  stepSeconds: number,
): readonly number[] {
  const times: number[] = []
  for (const [from, to] of spans) {
    for (let index = 0; from + index * stepSeconds < to - 1e-9; index++) {
      times.push(from + index * stepSeconds)
    }
  }
  return times
}

/** Muxes the picture's packets beside the sound's PCM blocks, interleaved in time. */
export async function picturePcmMp4(options: PicturePcmMp4Options): Promise<Uint8Array> {
  const output = new Output({
    // In memory, for a test, with the index at the front: a file cut short
    // keeps its index whole, as the cut-short recordings this models do.
    format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
    target: new BufferTarget(),
  })
  const picture = new EncodedVideoPacketSource('vp9')
  output.addVideoTrack(picture)
  const sound = options.sound ? new EncodedAudioPacketSource('pcm-s16') : null
  if (sound) output.addAudioTrack(sound)
  await output.start()

  const frameSeconds = options.frameSeconds ?? PICTURE_FRAME_SECONDS
  const blockFrames = Math.round(PCM_BLOCK_SECONDS * PCM_SAMPLE_RATE)
  const planned: Planned[] = [
    ...spanTimes(options.picture, frameSeconds).map((at, index) => ({
      track: 'picture' as const,
      packet: new EncodedPacket(
        new Uint8Array(PICTURE_PACKET_BYTES).fill(index % 251),
        index % PICTURE_KEY_EVERY === 0 ? 'key' : 'delta',
        at,
        frameSeconds,
      ),
    })),
    ...spanTimes(options.sound ?? [], PCM_BLOCK_SECONDS).map((at) => ({
      track: 'sound' as const,
      packet: new EncodedPacket(
        new Uint8Array(new Int16Array(blockFrames * PCM_CHANNELS).fill(1000).buffer),
        'key',
        at,
        PCM_BLOCK_SECONDS,
      ),
    })),
  ].sort((a, b) => a.packet.timestamp - b.packet.timestamp)

  let firstPicture = true
  let firstSound = true
  for (const { track, packet } of planned) {
    if (track === 'picture') {
      await picture.add(
        packet,
        firstPicture
          ? { decoderConfig: { codec: 'vp09.00.10.08', codedWidth: 320, codedHeight: 180 } }
          : undefined,
      )
      firstPicture = false
    } else {
      await sound!.add(
        packet,
        firstSound
          ? {
              decoderConfig: {
                codec: 'pcm-s16',
                sampleRate: PCM_SAMPLE_RATE,
                numberOfChannels: PCM_CHANNELS,
              },
            }
          : undefined,
      )
      firstSound = false
    }
  }
  await output.finalize()
  return new Uint8Array(output.target.buffer!)
}

/** The file's picture and sound tracks, read as the app reads them. */
export async function tracksOf(
  bytes: Uint8Array,
): Promise<{ readonly picture: InputVideoTrack; readonly sound: InputAudioTrack | null }> {
  const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(bytes) })
  const picture = await input.getPrimaryVideoTrack()
  if (!picture) throw new Error('no picture track')
  return { picture, sound: await input.getPrimaryAudioTrack() }
}
