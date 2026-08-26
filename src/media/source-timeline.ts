/**
 * One source clock shared by the content video and audio lanes.
 *
 * Container timestamps need not start at zero, and the two tracks need not
 * start together. Normalising each track independently destroys their relative
 * offset; this helper instead subtracts the earliest selected-track origin
 * from both. That deliberately rebases raw negative starts rather than
 * discarding their decoded frames: the encoder sees only non-negative time,
 * while the source's relative A/V offset and all real PCM remain intact.
 */

/** The first sample timestamp and final sample end on one container track. */
export interface TrackTiming {
  readonly firstTimestampSeconds: number
  readonly endTimestampSeconds: number
}

/** Non-negative content endpoints expressed on one shared source clock. */
export interface SourceTimeline {
  readonly originSeconds: number
  readonly videoEndSeconds: number
  readonly audioEndSeconds: number | null
}

/** Rejects corrupt or internally impossible timing before it reaches a muxer. */
function validateTrackTiming(label: string, timing: TrackTiming): void {
  if (!Number.isFinite(timing.firstTimestampSeconds)) {
    throw new RangeError(`${label} first timestamp must be finite`)
  }
  if (!Number.isFinite(timing.endTimestampSeconds)) {
    throw new RangeError(`${label} end timestamp must be finite`)
  }
  if (timing.endTimestampSeconds < timing.firstTimestampSeconds) {
    throw new RangeError(`${label} end timestamp must not precede its first timestamp`)
  }
}

/**
 * Derives the immutable source timeline used by both content lanes.
 *
 * Subtracting the earliest track start maps at least one track to zero, keeps a
 * delayed track delayed by the same amount, and shifts negative origins into
 * the encoder's non-negative timestamp domain without deleting source frames.
 */
export function deriveSourceTimeline(
  video: TrackTiming,
  audio: TrackTiming | null,
): SourceTimeline {
  validateTrackTiming('Video', video)
  if (audio) validateTrackTiming('Audio', audio)

  const originSeconds = Math.min(
    video.firstTimestampSeconds,
    audio?.firstTimestampSeconds ?? video.firstTimestampSeconds,
  )
  return Object.freeze({
    originSeconds,
    videoEndSeconds: Math.max(0, video.endTimestampSeconds - originSeconds),
    audioEndSeconds: audio === null ? null : Math.max(0, audio.endTimestampSeconds - originSeconds),
  })
}

/**
 * Maps a decoded sample timestamp onto the shared, non-negative source clock.
 *
 * Mediabunny permits negative decoded timestamps and advises against
 * presenting samples that end before the container's zero point. This product
 * instead defines programme zero as the earliest selected-track origin. The
 * policy is intentionally conservative: it never feeds a negative timestamp
 * to WebCodecs, never deletes decoded source content, and shifts both tracks by
 * the same amount so their relative timing survives.
 */
export function mapSourceTimestamp(timeline: SourceTimeline, timestampSeconds: number): number {
  if (!Number.isFinite(timestampSeconds)) {
    throw new RangeError('Sample timestamp must be finite')
  }
  return Math.max(0, timestampSeconds - timeline.originSeconds)
}
