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

/**
 * Speech-like material: a voiced carrier with harmonics, gated into syllables,
 * with pauses and a slow level drift.
 *
 * Not speech, but it has the properties the audio chain actually reacts to —
 * a syllable rate the compressor must not chase, pauses the macro-leveller
 * must not amplify, and drift it should correct. Fully deterministic, so a
 * failure is reproducible.
 */
export function speechLike(options: {
  readonly sampleRate: number
  readonly seconds: number
  readonly channelCount: number
  /** Peak amplitude in dBFS at the start of the recording. */
  readonly startPeakDbfs: number
  /** Peak amplitude in dBFS at the end — differ from the start to create drift. */
  readonly endPeakDbfs?: number
  /** Seconds of silence inserted every `pauseEverySeconds`. */
  readonly pauseSeconds?: number
  readonly pauseEverySeconds?: number
}): Float32Array[] {
  const { sampleRate, seconds, channelCount, startPeakDbfs } = options
  const endPeakDbfs = options.endPeakDbfs ?? startPeakDbfs
  const pauseSeconds = options.pauseSeconds ?? 0
  const pauseEverySeconds = options.pauseEverySeconds ?? 0
  const frames = Math.round(sampleRate * seconds)

  const mono = new Float32Array(frames)
  for (let i = 0; i < frames; i++) {
    const t = i / sampleRate

    if (pauseSeconds > 0 && pauseEverySeconds > 0) {
      const phase = t % (pauseEverySeconds + pauseSeconds)
      if (phase >= pauseEverySeconds) continue
    }

    // Syllables: ~4 per second, raised-cosine so there are no edges of their own.
    const syllable = t * 4
    const within = syllable - Math.floor(syllable)
    const envelope = within < 0.7 ? 0.5 - 0.5 * Math.cos((Math.PI * within) / 0.35) : 0
    if (envelope <= 0) continue

    // Drift from start level to end level across the recording.
    const drift = startPeakDbfs + (endPeakDbfs - startPeakDbfs) * (t / seconds)
    const amplitude = dbfsToAmplitude(drift)

    const f0 = 150 + 20 * Math.sin(2 * Math.PI * 0.3 * t)
    const voiced =
      0.6 * Math.sin(2 * Math.PI * f0 * t) +
      0.3 * Math.sin(2 * Math.PI * 2 * f0 * t) +
      0.15 * Math.sin(2 * Math.PI * 3 * f0 * t) +
      0.08 * Math.sin(2 * Math.PI * 5 * f0 * t)

    mono[i] = amplitude * envelope * voiced * 0.75
  }

  return Array.from({ length: channelCount }, () => mono.slice())
}
