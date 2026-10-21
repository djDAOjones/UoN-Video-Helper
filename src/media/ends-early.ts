/**
 * A file that ends before its index says (VH-139, audit V-01).
 *
 * An interrupted copy or a crashed recorder leaves a file whose index lists
 * every frame and sound block while its data stops part-way. Inspection reads
 * the index, so such a file was read as whole, checked as ready, encoded and
 * recorded as "the whole video (30 seconds)" while what it made carried 21 s
 * of sound under a held frame — silent loss, the worst outcome the rules name.
 *
 * Each track is measured against its OWN declared end within the part kept,
 * never against the other track or the file's overall length: a sound track
 * that legitimately starts late, stops early or has a hole is what the file
 * says, and the pipeline already carries it as it is (VH-42, VH-74). Only the
 * passes that decode the whole kept part can say where a track really stops —
 * pre-flight's analysis pass for the sound, the encode for the picture. The
 * 3-second probe never sees the tail, and the output check measures loudness,
 * not length.
 */

import { EncodedPacketSink, type InputTrack } from 'mediabunny'

import { ENDS_EARLY_MARGIN_SECONDS } from '../config/thresholds'
import type { KeptRange } from './kept-range'

/** What a file's index says of one track in the part kept, in source seconds ({@link declaredExtent}). */
export interface DeclaredExtent {
  /** Where the track's content ends: the end a note names. `null` when it declares nothing there. */
  readonly declaredEndSeconds: number | null
  /**
   * Where its last packet in the part kept starts: content certainly reaches
   * this far. What a decode is held to, rather than the end, because an MP4
   * gives the packet before a hole the hole's length as well as its own — the
   * start never moves. `null` when the track declares nothing there.
   */
  readonly lastPacketSeconds: number | null
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
 * What the file's index says of a track within the part kept.
 *
 * Index only: nothing is read or decoded, so a file cut short answers with
 * what it promised. Read through the packet showing at the out-point — the
 * file's last, with no trim — so a track that ended before the cut, or has a
 * hole across it, declares where its own content stops rather than where the
 * cut is.
 *
 * @returns Nulls when the track has nothing at or before the out-point — a
 *   track that starts after the part kept.
 */
export async function declaredExtent(
  track: InputTrack,
  range: KeptRange | null,
): Promise<DeclaredExtent> {
  const durationSeconds = await track.computeDuration()
  const outSeconds = range ? range.endSeconds : durationSeconds
  const packet = await new EncodedPacketSink(track).getPacket(outSeconds, { metadataOnly: true })
  if (!packet) return { declaredEndSeconds: null, lastPacketSeconds: null }
  return {
    declaredEndSeconds: range
      ? Math.min(range.endSeconds, packet.timestamp + packet.duration)
      : durationSeconds,
    lastPacketSeconds: packet.timestamp,
  }
}

/**
 * Whether a track's decode stopped short of its last declared packet by more
 * than the margin.
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
  const stopsAtSeconds = extent.decodedEndSeconds ?? fromSeconds
  return lastPacketSeconds - stopsAtSeconds > marginSeconds ? { stopsAtSeconds, endSeconds } : null
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
