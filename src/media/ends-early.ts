/**
 * A file that ends before its index says (VH-139, audit V-01).
 *
 * An interrupted copy or a crashed recorder leaves a file whose index lists
 * every frame and sound block while its data stops part-way. Inspection reads
 * the index, so such a file was read as whole, checked as ready, encoded and
 * recorded as "the whole video (30 seconds)" while what it made carried 21 s
 * of sound under a held frame — silent loss, the worst outcome the rules name.
 *
 * Each track is measured against the last packet its OWN index declares in
 * the part kept, never against the other track or the file's overall length:
 * a sound track that legitimately starts late, stops early or has a hole is
 * what the file says, and the pipeline already carries it as it is (VH-42,
 * VH-74). Only the passes that decode the whole kept part can say where a
 * track really stops — pre-flight's analysis pass for the sound, the encode
 * for the picture. The 3-second probe never sees the tail, and the output
 * check measures loudness, not length.
 */

import { EncodedPacketSink, type InputTrack } from 'mediabunny'

import { ENDS_EARLY_MARGIN_SECONDS } from '../config/thresholds'
import { KEPT_EDGE_TOLERANCE_SECONDS } from '../config/trim'
import type { KeptRange } from './kept-range'

/** What a file's index says of one track in the part kept, in source seconds ({@link declaredExtent}). */
export interface DeclaredExtent {
  /** Where the track's content ends: the end a note names. `null` when it declares nothing there. */
  readonly declaredEndSeconds: number | null
  /**
   * Where its last packet in the part kept starts, or `null` when the track
   * declares nothing there. Content certainly reaches this far: an MP4 gives
   * the packet before a hole the hole's length as well as its own, so its
   * declared end can overstate the content, and its start never does.
   */
  readonly lastPacketSeconds: number | null
  /**
   * Whether that packet's bytes are in the file. A file cut short declares
   * packets it does not hold, and Mediabunny answers a read of one with
   * nothing; a whole file's last packet always reads.
   */
  readonly lastPacketArrived: boolean
}

const NOTHING_DECLARED: DeclaredExtent = {
  declaredEndSeconds: null,
  lastPacketSeconds: null,
  lastPacketArrived: false,
}

/** Where one track's content ends, decoded and declared, in source seconds. */
export interface TrackExtent extends DeclaredExtent {
  /** The end of the last content decoded in the part kept, or `null` when none was. */
  readonly decodedEndSeconds: number | null
}

/** A track that stopped short: where, and where it should have reached, in source seconds. */
export interface Shortfall {
  readonly stopsAtSeconds: number
  readonly endSeconds: number
}

/** What a finished job's decode found short of the file's index (VH-139). */
export interface EndedEarly {
  /** The picture's shortfall, or `null` when it reached its declared end. */
  readonly picture: Shortfall | null
  /** The sound's, or `null` when it reached its end or the file has none. */
  readonly sound: Shortfall | null
  /**
   * The part of the source the file actually carries — from the kept start to
   * where the later track stopped — when that is short of the part kept;
   * otherwise `null`, and the record's part stands as it was asked for.
   */
  readonly made: KeptRange | null
}

/**
 * What the file's index says of a track within the part kept, and whether the
 * last packet it declares there is in the file.
 *
 * Nothing is decoded: the index answers for what the file promised, and one
 * packet's bytes for whether it kept the promise. Read through the last packet
 * the part kept holds — the file's last, with no trim — so a track that ended
 * before the cut, or has a hole across it, declares where its own content
 * stops rather than where the cut is. The out-point is exclusive, as the
 * sinks' ranged reads are, so a packet starting at it is not kept: it is
 * looked up just inside, by the tolerance a cut is already given
 * ({@link KEPT_EDGE_TOLERANCE_SECONDS}, under any packet's length) (Codex
 * review).
 *
 * @returns Nothing declared when the track has no packet reaching into the
 *   part kept — one that starts at or after the out-point, or ended before
 *   the in-point.
 */
export async function declaredExtent(
  track: InputTrack,
  range: KeptRange | null,
): Promise<DeclaredExtent> {
  const durationSeconds = await track.computeDuration()
  const sink = new EncodedPacketSink(track)
  const lookupSeconds = range ? range.endSeconds - KEPT_EDGE_TOLERANCE_SECONDS : durationSeconds
  const last = await sink.getPacket(lookupSeconds, { metadataOnly: true })
  if (!last || (range && last.timestamp + last.duration <= range.startSeconds))
    return NOTHING_DECLARED
  return {
    declaredEndSeconds: range
      ? Math.min(range.endSeconds, last.timestamp + last.duration)
      : durationSeconds,
    lastPacketSeconds: last.timestamp,
    lastPacketArrived: (await sink.getPacket(last.timestamp)) !== null,
  }
}

/**
 * Whether a track's decode stopped short of where its content certainly
 * reaches by more than the margin: the last declared packet's start when its
 * bytes are in the file, and its declared end when they are not — so a cut
 * that took only a long final frame, the frame before ending where it starts,
 * is still a cut (Codex review).
 *
 * @param fromSeconds - Where the part kept starts: the stop given for a track
 *   that decoded nothing there.
 * @returns The shortfall, with the declared end to name, or `null` for a
 *   track that reached its last packet, declares nothing in the part kept, or
 *   stopped within {@link ENDS_EARLY_MARGIN_SECONDS} of it.
 */
export function shortfall(
  extent: TrackExtent,
  fromSeconds: number,
  marginSeconds: number = ENDS_EARLY_MARGIN_SECONDS,
): Shortfall | null {
  const { declaredEndSeconds: endSeconds, lastPacketSeconds } = extent
  if (endSeconds === null || lastPacketSeconds === null) return null
  const reachesSeconds = extent.lastPacketArrived ? lastPacketSeconds : endSeconds
  const stopsAtSeconds = extent.decodedEndSeconds ?? fromSeconds
  return reachesSeconds - stopsAtSeconds > marginSeconds ? { stopsAtSeconds, endSeconds } : null
}

/**
 * What a finished job carries short of the file's index, or `null` for a
 * whole file — the usual answer.
 *
 * @param picture - The encode's picture: its last frame's end, and the
 *   picture's declared end.
 * @param sound - The encode's sound, or `null` when the file has none.
 * @param fromSeconds - Where the part kept starts; zero for the whole file.
 */
export function endedEarly(
  picture: TrackExtent,
  sound: TrackExtent | null,
  fromSeconds: number,
  marginSeconds: number = ENDS_EARLY_MARGIN_SECONDS,
): EndedEarly | null {
  const pictureShort = shortfall(picture, fromSeconds, marginSeconds)
  const soundShort = sound ? shortfall(sound, fromSeconds, marginSeconds) : null
  if (!pictureShort && !soundShort) return null

  const tracks = sound ? [picture, sound] : [picture]
  const declaredEnd = Math.max(...tracks.map((track) => track.declaredEndSeconds ?? fromSeconds))
  const madeEnd = Math.max(...tracks.map((track) => track.decodedEndSeconds ?? fromSeconds))
  return {
    picture: pictureShort,
    sound: soundShort,
    made:
      declaredEnd - madeEnd > marginSeconds
        ? { startSeconds: fromSeconds, endSeconds: madeEnd }
        : null,
  }
}
