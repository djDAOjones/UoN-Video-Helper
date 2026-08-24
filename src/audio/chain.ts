/**
 * The spec section 5.2 chain, assembled in order.
 *
 * Two shapes, because the chain is used twice. Steps 2-4 are deterministic
 * without knowing the final gain, so a measuring pass runs those alone and
 * reports what loudness they produce; the real pass then applies the same
 * stages plus a single constant gain and the limiter.
 *
 * That is why step 5 can be one constant gain across the whole file — the
 * transparent equivalent of a two-pass linear normalisation — rather than
 * something that moves. Everything dynamic happens above it, deliberately
 * gently, and the gain only has to move a number it already knows.
 */

import { Compressor } from './compressor'
import { HighPassFilter } from './highpass'
import { TruePeakLimiter } from './limiter'
import { MacroLeveller, type GainEnvelope } from './macrolevel'

export interface AudioChainOptions {
  readonly sampleRate: number
  readonly channelCount: number
  /** Empty envelope means the recording was consistent enough to leave alone. */
  readonly envelope: GainEnvelope
  /**
   * The single linear gain in dB, or `null` for the measuring pass — which
   * runs steps 2-4 only, so the caller can find out what gain is needed.
   */
  readonly gainDb: number | null
}

export class AudioChain {
  private readonly highPass: HighPassFilter
  private readonly leveller: MacroLeveller
  private readonly compressor: Compressor
  private readonly limiter: TruePeakLimiter | null
  private readonly gain: number
  /** Samples of limiter look-ahead still to be discarded, to undo its delay. */
  private latencyToDrop: number

  constructor(private readonly options: AudioChainOptions) {
    const { sampleRate, channelCount, envelope, gainDb } = options
    this.highPass = new HighPassFilter(sampleRate, channelCount)
    this.leveller = new MacroLeveller(envelope, sampleRate)
    this.compressor = new Compressor({ sampleRate })
    this.gain = gainDb === null ? 1 : 10 ** (gainDb / 20)
    this.limiter = gainDb === null ? null : new TruePeakLimiter({ sampleRate, channelCount })
    this.latencyToDrop = this.limiter?.latencySamples ?? 0
  }

  /**
   * Runs the chain over one chunk of planar audio.
   *
   * @returns The processed audio, which may be shorter than the input while
   *   the limiter's look-ahead delay is being compensated. Compensating it
   *   here rather than leaving a 5 ms offset keeps the audio aligned with the
   *   picture, which matters more than the handful of samples it costs.
   */
  process(channels: readonly Float32Array[]): Float32Array[] {
    this.highPass.process(channels)
    this.leveller.process(channels)
    this.compressor.process(channels)

    if (this.gain !== 1) {
      for (const channel of channels) {
        for (let i = 0; i < channel.length; i++) channel[i]! *= this.gain
      }
    }

    if (!this.limiter) return channels.map((channel) => channel)
    this.limiter.process(channels)

    if (this.latencyToDrop > 0) {
      const drop = Math.min(this.latencyToDrop, channels[0]?.length ?? 0)
      this.latencyToDrop -= drop
      return channels.map((channel) => channel.subarray(drop))
    }
    return channels.map((channel) => channel)
  }

  /** The limiter's remaining look-ahead buffer. Append after the last chunk. */
  flush(): Float32Array[] {
    if (!this.limiter) return Array.from({ length: this.options.channelCount }, () => new Float32Array(0))
    const tail = this.limiter.flush()
    if (this.latencyToDrop > 0) {
      const drop = Math.min(this.latencyToDrop, tail[0]?.length ?? 0)
      this.latencyToDrop -= drop
      return tail.map((channel) => channel.subarray(drop))
    }
    return tail
  }
}
