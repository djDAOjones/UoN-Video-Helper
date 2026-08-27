/**
 * Carrying a source track's identity onto the output track.
 *
 * Spec 8.3.4 asks for creation metadata to survive; `pipeline.ts` already
 * carries the file-level tags. This is the per-track half — the language a
 * player offers in its audio menu, the name a user gave the track, and the
 * disposition flags that say what the track is for. Dropping them is silent
 * loss of something the user put there, which `AGENTS.md` treats as the worst
 * available outcome.
 *
 * Pure by design: it takes the three async accessors rather than an
 * `InputTrack`, so the rules below are provable in Node without a decoder.
 */

import type { TrackDisposition } from 'mediabunny'

import { log } from '../core/logger'

/** The part of Mediabunny's `InputTrack` this reads. */
export interface SourceTrackIdentity {
  getLanguageCode(): Promise<string>
  getName(): Promise<string | null>
  getDisposition(): Promise<TrackDisposition>
}

/** The part of Mediabunny's `BaseTrackMetadata` this writes. */
export interface CarriedTrackMetadata {
  readonly languageCode?: string
  readonly name?: string
  readonly disposition?: Partial<TrackDisposition>
}

/**
 * Reads a source track's identity into output metadata.
 *
 * Two deliberate departures from a straight copy:
 *
 * - `'und'` is Mediabunny's "no language stated", and writing it back states
 *   nothing while looking like a decision. Omitted instead.
 * - `default` and `primary` are always true on the way out. They describe a
 *   track's standing *among others of its type*, and the output has exactly
 *   one of each — a lone audio track marked non-default is a track some
 *   players will not select. The flags that describe the CONTENT (`original`,
 *   `commentary`, `hearingImpaired`, `visuallyImpaired`, `forced`) carry
 *   through untouched, because those are still true of it. MP4 stores only
 *   `default` of these — measured, not assumed — so on today's single output
 *   format the rest are carried in hope of a container that keeps them.
 *
 * Never throws: metadata is worth carrying, and never worth failing a job for.
 * A failure is logged and reported through `onLoss` so it can reach the user,
 * which is the rule for anything that cannot be carried through.
 *
 * @param track - The source track, or `null` when the output has no such track.
 * @param onLoss - Called with the reason when the identity could not be read.
 */
export async function carryTrackMetadata(
  track: SourceTrackIdentity | null,
  onLoss?: (reason: string) => void,
): Promise<CarriedTrackMetadata> {
  if (!track) return {}

  try {
    const [languageCode, name, disposition] = await Promise.all([
      track.getLanguageCode(),
      track.getName(),
      track.getDisposition(),
    ])

    return {
      ...(languageCode && languageCode !== 'und' ? { languageCode } : {}),
      ...(name ? { name } : {}),
      disposition: { ...disposition, default: true, primary: true },
    }
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause)
    log.warn('pipeline', 'could not carry track metadata', { reason })
    onLoss?.(reason)
    return {}
  }
}
