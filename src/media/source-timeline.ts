/**
 * Where the source's two tracks actually sit in time, and keeping them there.
 *
 * A container may start its audio after its video, or leave a hole in the
 * middle of one of them. Both are ordinary — a capture that joins late, a
 * recorder that dropped packets — and both are part of what the file says.
 *
 * The pipeline used to preserve the video lane's offsets and collapse the
 * audio lane's, because audio was timestamped from a running count of frames
 * emitted rather than from the samples' own timestamps (review P1-02). The
 * result was silent: a track starting five seconds late came out five seconds
 * early against its picture, and a two-second hole pulled everything after it
 * two seconds forward.
 *
 * This module holds the arithmetic for putting them back, and holds it
 * separately because it is arithmetic — provable in Node, with no decoder.
 */

/** Where each lane starts, measured from the earlier of the two. */
export interface SourceTimeline {
  /**
   * The instant both lanes are measured from: the earlier first timestamp.
   *
   * One origin, not one per lane. Rebasing each track to its own first sample
   * is what destroyed the offset between them.
   */
  readonly originSeconds: number
  /** How far after the origin the picture starts. Zero when video is first. */
  readonly videoOffsetSeconds: number
  /** How far after the origin the sound starts. Zero when audio is first. */
  readonly audioOffsetSeconds: number
}

/**
 * Derives the shared origin from each lane's first timestamp.
 *
 * @param firstVideoSeconds - First video timestamp, or `null` for no video.
 * @param firstAudioSeconds - First audio timestamp, or `null` for no audio.
 *
 * A negative first timestamp is treated as ABSENT rather than as a lane that
 * starts early. Measured: `CULT1027` in the corpus reports its audio starting
 * at -21.3 ms, which is decoder priming the container's edit list says to
 * skip — not sound anyone recorded. Delaying the picture to "preserve" it
 * would move the whole video to match samples nobody is meant to hear. A
 * non-finite timestamp is discarded for the plainer reason that it would
 * propagate into every output timestamp on the lane.
 */
export function deriveSourceTimeline(
  firstVideoSeconds: number | null,
  firstAudioSeconds: number | null,
): SourceTimeline {
  const video = clean(firstVideoSeconds)
  const audio = clean(firstAudioSeconds)

  const present = [video, audio].filter((value): value is number => value !== null)
  const originSeconds = present.length > 0 ? Math.min(...present) : 0

  return {
    originSeconds,
    videoOffsetSeconds: video === null ? 0 : video - originSeconds,
    audioOffsetSeconds: audio === null ? 0 : audio - originSeconds,
  }
}

function clean(value: number | null): number | null {
  if (value === null || !Number.isFinite(value) || value < 0) return null
  return value
}

/**
 * Turns holes in a decoded audio stream into the silence they represent.
 *
 * The chain downstream is a continuous stream processor: frames in equal
 * frames out, so a consumer can keep counting frames to know where it is —
 * but only if nothing was skipped. Feeding the silence a gap stands for keeps
 * that true, and keeps the analysis and the encode agreeing about where in the
 * file any given moment is.
 *
 * Positions are computed from the sample's own timestamp against the frames
 * consumed so far, never by accumulating per-gap corrections. Rounding is
 * therefore bounded at half a frame for the whole file rather than growing
 * with the number of gaps.
 */
export class AudioGapFiller {
  private framesConsumed = 0
  private first: number | null = null
  private inserted = 0

  constructor(
    private readonly sampleRate: number,
    private readonly channelCount: number,
  ) {}

  /** The track's own first timestamp, or `null` before the first sample. */
  get firstTimestampSeconds(): number | null {
    return this.first
  }

  /** Total silence inserted so far, in frames. Zero on a well-formed file. */
  get insertedFrames(): number {
    return this.inserted
  }

  /**
   * Silence that must precede the sample at `timestampSeconds`, or `null`.
   *
   * The FIRST sample never produces silence however late it is: a track that
   * starts late is offset, not gapped, and padding it would move its end as
   * well as its start. The caller carries that offset instead.
   *
   * A sample arriving EARLIER than expected — an overlap — yields nothing.
   * There is no correct amount of audio to remove, and running the two
   * regions contiguously is what a player does with them.
   */
  silenceBefore(timestampSeconds: number): Float32Array[] | null {
    if (this.first === null) {
      this.first = Number.isFinite(timestampSeconds) ? timestampSeconds : 0
      return null
    }

    const expected = Math.round((timestampSeconds - this.first) * this.sampleRate)
    const missing = expected - this.framesConsumed
    if (!Number.isFinite(missing) || missing <= 0) return null

    this.framesConsumed += missing
    this.inserted += missing
    return Array.from({ length: this.channelCount }, () => new Float32Array(missing))
  }

  /** Records frames of real audio consumed, after any silence for them. */
  accept(frames: number): void {
    this.framesConsumed += frames
  }
}
