/**
 * Signal generators shared by the meter tests and the EBU compliance harness.
 *
 * Everything here is synthesised from a formula rather than checked in as
 * audio: the fixtures stay reproducible, the repo stays free of binaries, and
 * the expected values can be derived rather than trusted.
 */

/** Peak amplitude for a given dBFS level, e.g. `dbfsToAmplitude(-23)`. */
export function dbfsToAmplitude(dbfs: number): number {
  return 10 ** (dbfs / 20)
}

export interface ToneOptions {
  readonly sampleRate: number
  readonly seconds: number
  readonly frequency: number
  /** Peak amplitude in dBFS. A sine's RMS sits 3.01 dB below its peak. */
  readonly peakDbfs: number
  readonly channelCount: number
  /** Channels to leave silent, e.g. `[3]` for LFE in a 5.1 layout. */
  readonly silentChannels?: readonly number[]
  readonly phase?: number
  /**
   * Linear fade in and out, in seconds. Worth using for true-peak work: a
   * tone that starts abruptly mid-cycle is a step discontinuity, and its
   * reconstruction genuinely overshoots — so an unfaded tone measures its own
   * onset rather than the steady state. Loudness gating is unaffected.
   */
  readonly fadeSeconds?: number
}

/** A steady sine, planar, one `Float32Array` per channel. */
export function tone(options: ToneOptions): Float32Array[] {
  const { sampleRate, seconds, frequency, peakDbfs, channelCount } = options
  const silent = new Set(options.silentChannels ?? [])
  const phase = options.phase ?? 0
  const frames = Math.round(sampleRate * seconds)
  const amplitude = dbfsToAmplitude(peakDbfs)

  const fadeFrames = Math.round(sampleRate * (options.fadeSeconds ?? 0))

  return Array.from({ length: channelCount }, (_unused, ch) => {
    const data = new Float32Array(frames)
    if (silent.has(ch)) return data
    for (let i = 0; i < frames; i++) {
      let envelope = 1
      if (fadeFrames > 0) {
        envelope = Math.min(1, (i + 1) / fadeFrames, (frames - i) / fadeFrames)
      }
      data[i] = envelope * amplitude * Math.sin((2 * Math.PI * frequency * i) / sampleRate + phase)
    }
    return data
  })
}

/** Digital silence, planar. */
export function silence(sampleRate: number, seconds: number, channelCount: number): Float32Array[] {
  const frames = Math.round(sampleRate * seconds)
  return Array.from({ length: channelCount }, () => new Float32Array(frames))
}

/** Joins planar chunks end to end, channel by channel. */
export function concat(...parts: Float32Array[][]): Float32Array[] {
  const channelCount = parts[0]!.length
  return Array.from({ length: channelCount }, (_unused, ch) => {
    const total = parts.reduce((sum, part) => sum + part[ch]!.length, 0)
    const out = new Float32Array(total)
    let offset = 0
    for (const part of parts) {
      out.set(part[ch]!, offset)
      offset += part[ch]!.length
    }
    return out
  })
}

/** Feeds planar audio to a sink in fixed-size chunks, to exercise streaming. */
export function feedInChunks(
  channels: readonly Float32Array[],
  chunkFrames: number,
  sink: { addFrames(channels: readonly Float32Array[]): void },
): void {
  const total = channels[0]!.length
  for (let offset = 0; offset < total; offset += chunkFrames) {
    const end = Math.min(offset + chunkFrames, total)
    sink.addFrames(channels.map((channel) => channel.subarray(offset, end)))
  }
}
