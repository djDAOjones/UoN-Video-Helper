/**
 * Decode damage, silenced before anything hears it: spec 5.4's decode-damage
 * row (VH-122).
 *
 * A corrupt frame in a compressed track can decode to a burst far above full
 * scale — CULT2011's reach +57 dBFS, where no real recording in the corpus
 * passes +1. Measured as it was, one such burst read a whole lecture as
 * +28 LUFS with a loudness range of 40 LU: pre-flight blamed the microphone and
 * the volume, macro-levelling switched on against a level that was never
 * there, and the output kept a 60 ms blast and a 4 LU dip after it while the
 * compressor recovered (VH-115).
 *
 * The unit of damage is the decoded block, not the sample. A transform codec
 * overlap-adds each frame into two output blocks, so one corrupt frame spoils
 * a pair, and the earlier of the two rises from nothing under the window and
 * can peak far below the later. So a block is silenced when it or either
 * neighbour holds a sample beyond the threshold. That holds one block back,
 * and silences a block of good sound either side of the damage — about 23 ms
 * each at 44.1 kHz — rather than leave any of the burst.
 *
 * A sample that is not a finite number is damage too: it is never sound, and
 * one NaN makes every loudness measured after it NaN.
 *
 * Every pass over the source runs its blocks through one of these first, in
 * source time and before the trim: the measurement, the planning passes and
 * the encode all hear the same silence. The finished file's check does not,
 * because damage there is a broken output it exists to catch.
 */

import { DECODE_DAMAGE } from '../config/audio'

/** One decoded block, planar, at the timestamp its decoder gave it. */
export interface TimedBlock {
  readonly planar: Float32Array[]
  readonly timestampSeconds: number
}

/** Whether any sample in any channel is beyond `limit`, or not a number at all. */
function isDamaged(planar: readonly Float32Array[], limit: number): boolean {
  for (const channel of planar) {
    for (let i = 0; i < channel.length; i++) {
      // Negated so that NaN fails: every comparison with NaN is false.
      if (!(Math.abs(channel[i]!) <= limit)) return true
    }
  }
  return false
}

/**
 * Silences decode damage in a stream of decoded blocks, one block behind.
 *
 * Feed every block to {@link push} in order, then call {@link flush} once.
 * Each block comes back exactly once, in order and at its own timestamp,
 * silenced in place when it or a neighbour was damaged.
 */
export class DecodeDamageGate {
  private readonly limit: number
  private held: { readonly block: TimedBlock; readonly damaged: boolean } | null = null
  /** Whether the block released before `held` was damaged. */
  private previousDamaged = false
  /** Whether the block released last was silenced, so a run is counted once. */
  private previousSilenced = false
  private readonly runStarts: number[] = []

  constructor(aboveDbfs: number = DECODE_DAMAGE.aboveDbfs) {
    this.limit = 10 ** (aboveDbfs / 20)
  }

  /**
   * Takes the next decoded block and releases the one before it.
   *
   * @returns The previous block, silenced when it or a neighbour was damaged;
   *   `null` for the first block.
   */
  push(block: TimedBlock): TimedBlock | null {
    const damaged = isDamaged(block.planar, this.limit)
    const released = this.held ? this.release(this.held, damaged) : null
    this.held = { block, damaged }
    return released
  }

  /** The last block, once the stream has ended; `null` if there was none. */
  flush(): TimedBlock | null {
    return this.held ? this.release(this.held, false) : null
  }

  /** Where each silenced stretch starts, in source seconds, earliest first. */
  get silencedAtSeconds(): readonly number[] {
    return this.runStarts
  }

  private release(
    held: { readonly block: TimedBlock; readonly damaged: boolean },
    nextDamaged: boolean,
  ): TimedBlock {
    this.held = null
    const silenced = held.damaged || this.previousDamaged || nextDamaged
    if (silenced) {
      for (const channel of held.block.planar) channel.fill(0)
      if (!this.previousSilenced) this.runStarts.push(held.block.timestampSeconds)
    }
    this.previousDamaged = held.damaged
    this.previousSilenced = silenced
    return held.block
  }
}
