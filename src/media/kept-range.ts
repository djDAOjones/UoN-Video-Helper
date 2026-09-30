/**
 * The kept range: the one cut the conveyor makes (VH-30, VH-95).
 *
 * A start and an end, in seconds of source time — the clock the demuxer's
 * timestamps count, which is the clock the preview's `currentTime` counts too.
 * Everything that reads the source honours it, and every audio pass honours it
 * identically, or the gain envelope measured in one pass would be applied to a
 * stream indexed differently in another (VH-74).
 *
 * Validated once, where a request arrives, and passed down as plain data.
 * `null` means the whole file, and takes exactly the code path that ran before
 * trimming existed.
 *
 * Pure, so the arithmetic is proved in Node.
 */

import { KEPT_EDGE_TOLERANCE_SECONDS, KEPT_MIN_SECONDS } from '../config/trim'

export interface KeptRange {
  /** Where the kept video starts, in source seconds. Zero keeps the start. */
  readonly startSeconds: number
  /** Where it ends, in source seconds, exclusive. The duration keeps the end. */
  readonly endSeconds: number
}

/** A range the user cannot have meant, said in words they can act on. */
export class KeptRangeError extends Error {
  override readonly name = 'KeptRangeError'
}

/**
 * Checks a requested range against the file, and says whether it cuts at all.
 *
 * Refuses rather than clamps: a start after the end, or a keep shorter than
 * {@link KEPT_MIN_SECONDS}, is a range the user did not mean, and quietly
 * making it one they did not ask for would produce a file they did not choose.
 * The trim controls validate first; this is the backstop for anything that
 * gets past them.
 *
 * @param requested - The range as it crossed the worker boundary, or absent.
 * @param durationSeconds - The file's end, `SourceReport.durationSeconds`.
 * @returns `null` when nothing is cut; otherwise the range, with an end past
 *   the file brought back to the file's end.
 * @throws KeptRangeError when the range cannot be honoured.
 */
export function normaliseKeptRange(
  requested: KeptRange | undefined | null,
  durationSeconds: number,
): KeptRange | null {
  if (!requested) return null
  const { startSeconds, endSeconds } = requested
  if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds)) {
    throw new KeptRangeError('The start or end of the video is not a time.')
  }
  const start = startSeconds <= KEPT_EDGE_TOLERANCE_SECONDS ? 0 : startSeconds
  const end =
    endSeconds >= durationSeconds - KEPT_EDGE_TOLERANCE_SECONDS ? durationSeconds : endSeconds
  // Before the minimum: the whole of a file shorter than it is no cut, and an
  // untouched pair of handles must never refuse what no range would keep
  // (Codex review).
  if (start === 0 && end === durationSeconds) return null
  if (start >= durationSeconds) {
    throw new KeptRangeError('The start is after the end of the video.')
  }
  if (end <= start) {
    throw new KeptRangeError('The end must come after the start.')
  }
  if (end - start < KEPT_MIN_SECONDS) {
    throw new KeptRangeError(`Keep at least ${KEPT_MIN_SECONDS} seconds of the video.`)
  }
  return { startSeconds: start, endSeconds: end }
}

/**
 * Where the kept audio is measured from: the in-point, or the track's own
 * start if that is later.
 *
 * A track already running at the cut must count a hole that spans the cut as
 * the silence it is. Without this, sound resuming 3 s after the in-point was
 * placed AT it, 3 s ahead of its picture (Codex review). A track that starts
 * after the cut is offset instead, by the shared timeline, so it is anchored
 * at its own start and not padded twice.
 *
 * @returns `null` with no range, which keeps the untrimmed rule that a
 *   track's first sample is never padded.
 */
export function keptAudioAnchorSeconds(
  range: KeptRange | null,
  firstAudioSeconds: number | null,
): number | null {
  if (!range) return null
  return firstAudioSeconds !== null && Number.isFinite(firstAudioSeconds)
    ? Math.max(range.startSeconds, firstAudioSeconds)
    : range.startSeconds
}

/** A frame's place on the source clock, as its packet records it. */
export interface FrameSpan {
  readonly timestampSeconds: number
  readonly durationSeconds: number
}

/**
 * Moves each cut to the edge of the frame it falls in: the in-point back to
 * the start of the frame showing there, the out-point on to the end of the
 * frame showing there.
 *
 * A picture is made of whole frames and sound of samples, so a cut mid-frame
 * cannot land on the same instant in both. The sound would start at the cut
 * and the picture at the next frame boundary — measured on a 25 fps source, a
 * constant 24 ms offset at every sync marker, against a 10 ms limit, where the
 * same file untrimmed reads 0.0. On a frame edge the two lanes share the
 * instant, and the first and last frames kept are the ones showing at the
 * points the user chose. The most this moves a cut is one frame.
 *
 * @param atStart - The frame showing at the in-point, or `null` if none.
 * @param atEnd - The frame showing at the out-point, or `null` if none.
 */
export function snapKeptRangeToFrames(
  range: KeptRange,
  atStart: FrameSpan | null,
  atEnd: FrameSpan | null,
): KeptRange {
  const startSeconds =
    atStart && atStart.timestampSeconds < range.startSeconds
      ? Math.max(0, atStart.timestampSeconds)
      : range.startSeconds
  const endSeconds =
    atEnd &&
    atEnd.timestampSeconds < range.endSeconds &&
    atEnd.timestampSeconds + atEnd.durationSeconds > range.endSeconds
      ? atEnd.timestampSeconds + atEnd.durationSeconds
      : range.endSeconds
  return { startSeconds, endSeconds }
}

/** How long a range keeps, or the whole file when there is none. */
export function keptDurationSeconds(range: KeptRange | null, durationSeconds: number): number {
  return range ? range.endSeconds - range.startSeconds : durationSeconds
}

/**
 * Slices a decoded audio block to the kept range.
 *
 * The sinks' ranged reads start on the block that CONTAINS the in-point and
 * stop before the first block at or after the out-point (Mediabunny's
 * `samples(start, end)`), and a block is roughly 20 ms. Without slicing, the
 * sound would start up to a block before the picture and the two lanes would
 * part company at the cut.
 *
 * @returns The frames inside the range and the timestamp of the first of
 *   them, or `null` when none of the block is kept.
 */
export function clipAudioBlock(
  planar: readonly Float32Array[],
  timestampSeconds: number,
  sampleRate: number,
  range: KeptRange | null,
): { readonly planar: Float32Array[]; readonly timestampSeconds: number } | null {
  const frames = planar[0]?.length ?? 0
  if (!range) return { planar: [...planar], timestampSeconds }
  const from = Math.min(frames, Math.max(0, Math.round((range.startSeconds - timestampSeconds) * sampleRate)))
  const to = Math.min(frames, Math.max(0, Math.round((range.endSeconds - timestampSeconds) * sampleRate)))
  if (to <= from) return null
  if (from === 0 && to === frames) return { planar: [...planar], timestampSeconds }
  return {
    planar: planar.map((plane) => plane.subarray(from, to)),
    timestampSeconds: timestampSeconds + from / sampleRate,
  }
}
