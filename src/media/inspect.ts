/**
 * Turns a chosen file into an honest report of what it actually is.
 *
 * "Honest" is doing work in that sentence. Mediabunny exposes video and audio
 * tracks only — it cannot see subtitle or chapter tracks at all, verified by
 * round-trip (see `architecture.md` -> "Known constraints in the dependency").
 * So this module reports what it can see and says nothing about what it
 * cannot; detecting those needs the ISOBMFF handler scan in VH-9. A report
 * that quietly implied "no subtitles" would be worse than one that stays
 * silent.
 */

import {
  BlobSource,
  Input,
  MatroskaInputFormat,
  Mp4InputFormat,
  QuickTimeInputFormat,
  WebMInputFormat,
} from 'mediabunny'

import { log } from '../core/logger'
import { conformCost, type ConformDecision } from './framerate'
import { throwIfAborted } from './pipeline'
import { scanTrackHandlers, type TrackScan } from './isobmff'

/**
 * The containers this tool accepts, rather than Mediabunny's `ALL_FORMATS`.
 *
 * Two reasons. `ALL_FORMATS` defeats tree-shaking and pulls every demuxer
 * Mediabunny has — HLS, Ogg, FLAC, ADTS, MPEG-TS — adding roughly 300 kB to
 * the worker bundle for containers no lecture recording arrives in. And
 * advertising that we can read a format we cannot then process is a promise
 * broken later rather than a clear refusal now.
 *
 * This covers what the sources in spec section 2 actually produce: Teams,
 * Zoom, PowerPoint, QuickTime and OBS all write MP4, MOV, MKV or WebM.
 */
export const ACCEPTED_FORMATS = [
  new Mp4InputFormat(),
  new QuickTimeInputFormat(),
  new MatroskaInputFormat(),
  new WebMInputFormat(),
]

export interface FrameRateReport {
  /** Mediabunny's best guess, snapped to a common rate where it is confident. */
  readonly bestGuess: number
  /** Non-null only when a single consistent rate was found. `null` means VFR. */
  readonly underlying: number | null
  readonly min: number
  readonly max: number
  readonly average: number
  readonly median: number
  /** Mediabunny's own verdict, not a threshold of ours. */
  readonly isConstant: boolean
  /** How many packets the metrics were derived from — these are probed, not exhaustive. */
  readonly probedPacketCount: number
}

export interface VideoStreamReport {
  readonly codec: string | null
  readonly codecString: string | null
  /** Dimensions as stored, before rotation or pixel-aspect correction. */
  readonly codedWidth: number
  readonly codedHeight: number
  /** Dimensions as they should be presented. This is what the output matches. */
  readonly displayWidth: number
  readonly displayHeight: number
  readonly rotation: number
  readonly durationSeconds: number
  readonly frameRate: FrameRateReport
  /** True when no single consistent rate was found — common in screen and meeting captures. */
  readonly isVariableFrameRate: boolean
  /**
   * Bits per second the video track actually carries, from its packets.
   *
   * MEASURED, not declared — the same reason the frame rate is. It is what
   * spec 6.2's never-exceed-source cap is measured against, so a container
   * claiming a bitrate it does not carry must not be able to set it. `null`
   * when the packets could not be summed.
   */
  readonly averageBitrateBps: number | null
  /** The constant rate the output will use, and what conforming to it costs. */
  readonly conform: ConformDecision
  /** Whether this browser can decode this specific configuration. */
  readonly canDecode: boolean
}

export interface AudioStreamReport {
  readonly codec: string | null
  readonly codecString: string | null
  readonly sampleRate: number
  readonly channelCount: number
  readonly durationSeconds: number
  readonly canDecode: boolean
}

export interface SourceReport {
  /** Container as detected, e.g. `MP4`, `Matroska`. */
  readonly container: string
  readonly fileSizeBytes: number
  readonly durationSeconds: number
  /**
   * Always present. A file with no video track cannot be branded or encoded,
   * so {@link inspectFile} rejects it rather than returning a report that
   * describes a video which is not there.
   */
  readonly video: VideoStreamReport
  /**
   * Absent is legitimate, not fatal. Spec section 5.4 lists a missing audio
   * track as an advisory warning: branding and re-encoding still work, only
   * levelling has nothing to do.
   */
  readonly audio: AudioStreamReport | null
  /**
   * Tracks Mediabunny reported. NOT the number of tracks in the file:
   * subtitle and chapter tracks are invisible to it. Named to make that
   * impossible to misread.
   */
  readonly reportedTrackCount: number
  /**
   * What a direct read of the container's handler types found — including the
   * tracks Mediabunny cannot see. `scanned: false` for non-ISOBMFF files,
   * where the caller must say nothing rather than guess.
   */
  readonly tracks: TrackScan
}

/**
 * Opens a file for reading with the formats this tool accepts.
 *
 * One place, because every caller must use the same list: a reader that
 * accepts more than the pipeline can process would let a file through
 * inspection only to fail later.
 */
export function openInput(file: Blob): Input {
  return new Input({ formats: ACCEPTED_FORMATS, source: new BlobSource(file) })
}

/** Raised when a file cannot be read at all, as opposed to being readable but unusable. */
export class UnreadableFileError extends Error {
  override readonly name = 'UnreadableFileError'

  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message)
  }
}

/** `canDecode()` reaches for WebCodecs; treat any failure as "no", never as a crash. */
async function safeCanDecode(track: { canDecode(): Promise<boolean> }): Promise<boolean> {
  try {
    return await track.canDecode()
  } catch (cause) {
    log.warn('inspect', 'decode support check failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return false
  }
}

/**
 * Reads a file's structure without decoding it.
 *
 * @param file - The user's chosen file. Opened read-only; never modified.
 * @param options.frameRateProbePackets - How many packets to examine when
 *   deriving frame-rate metrics. More is more certain and slower. The default
 *   leaves Mediabunny's own choice alone.
 */
/**
 * @param options.signal - Checked at each seam. Mediabunny's packet walk takes
 *   no signal of its own, so cancellation is granular to the step rather than
 *   to the packet — but a cancelled inspection stops at the next boundary and
 *   raises `CancelledError` instead of returning a report nobody asked for any
 *   more (VH-57).
 */
export async function inspectFile(
  file: Blob,
  options: { readonly frameRateProbePackets?: number; readonly signal?: AbortSignal } = {},
): Promise<SourceReport> {
  const input = openInput(file)
  const { signal } = options
  throwIfAborted(signal)

  let container: string
  try {
    const format = await input.getFormat()
    container = format.name
  } catch (cause) {
    throw new UnreadableFileError(
      'This file could not be read as a video. It needs to be an MP4, MOV, MKV or WebM file, and it may be corrupted.',
      cause,
    )
  }

  const [videoTracks, audioTracks, allTracks, tracks] = await Promise.all([
    input.getVideoTracks(),
    input.getAudioTracks(),
    input.getTracks(),
    // Runs alongside, never instead of, the demux. A failed scan costs a
    // warning we cannot give; it must never cost the inspection.
    scanTrackHandlers(file),
  ])

  throwIfAborted(signal)

  const videoTrack = videoTracks[0]
  const audioTrack = audioTracks[0] ?? null

  if (!videoTrack) {
    // Reached by a truncated or header-only file as readily as by a genuine
    // audio-only one: the container parses, and there is simply nothing in it.
    // Reporting that as a successful read of a zero-length video would be a
    // lie the rest of the pipeline then acts on.
    throw new UnreadableFileError(
      audioTrack
        ? 'This file has sound but no video. This tool adds branding to a video, so it needs a file with a picture.'
        : 'No video or sound was found in this file. It may be incomplete, or it may have been saved incorrectly.',
    )
  }

  const video: VideoStreamReport = await (async () => {
    const [
      codec,
      codecString,
      codedWidth,
      codedHeight,
      displayWidth,
      displayHeight,
      rotation,
      durationSeconds,
      metrics,
      packetStats,
      canDecode,
    ] = await Promise.all([
      videoTrack.getCodec(),
      videoTrack.getCodecParameterString(),
      videoTrack.getCodedWidth(),
      videoTrack.getCodedHeight(),
      videoTrack.getDisplayWidth(),
      videoTrack.getDisplayHeight(),
      videoTrack.getRotation(),
      videoTrack.computeDuration(),
      videoTrack.computeFrameRateMetrics(
        options.frameRateProbePackets === undefined
          ? undefined
          : { targetPacketCount: options.frameRateProbePackets },
      ),
      // Same packet walk the frame-rate metrics do, and the same probe budget.
      // A failure here costs the never-exceed-source cap, not the job.
      videoTrack.computePacketStats(options.frameRateProbePackets).catch(() => null),
      safeCanDecode(videoTrack),
    ])

    // Prefer the rate Mediabunny is confident about; fall back to its best
    // guess when the source is variable.
    const measured = metrics.underlyingFrameRate ?? metrics.bestGuessFrameRate

    return {
      codec,
      codecString,
      codedWidth,
      codedHeight,
      displayWidth,
      displayHeight,
      rotation,
      durationSeconds,
      frameRate: {
        bestGuess: metrics.bestGuessFrameRate,
        underlying: metrics.underlyingFrameRate,
        min: metrics.minFrameRate,
        max: metrics.maxFrameRate,
        average: metrics.averageFrameRate,
        median: metrics.medianFrameRate,
        isConstant: metrics.frameRateIsConstant,
        probedPacketCount: metrics.probedPacketCount,
      },
      isVariableFrameRate: !metrics.frameRateIsConstant,
      averageBitrateBps:
        packetStats && Number.isFinite(packetStats.averageBitrate) && packetStats.averageBitrate > 0
          ? packetStats.averageBitrate
          : null,
      conform: conformCost(measured),
      canDecode,
    } satisfies VideoStreamReport
  })()

  const audio: AudioStreamReport | null = audioTrack
    ? await (async () => {
        const [codec, codecString, sampleRate, channelCount, durationSeconds, canDecode] =
          await Promise.all([
            audioTrack.getCodec(),
            audioTrack.getCodecParameterString(),
            audioTrack.getSampleRate(),
            audioTrack.getNumberOfChannels(),
            audioTrack.computeDuration(),
            safeCanDecode(audioTrack),
          ])
        return {
          codec,
          codecString,
          sampleRate,
          channelCount,
          durationSeconds,
          canDecode,
        } satisfies AudioStreamReport
      })()
    : null

  const report: SourceReport = {
    container,
    fileSizeBytes: file.size,
    durationSeconds: Math.max(video?.durationSeconds ?? 0, audio?.durationSeconds ?? 0),
    video,
    audio,
    reportedTrackCount: allTracks.length,
    tracks,
  }

  // Deliberately logs characteristics and not the filename — see
  // DEV-INFRASTRUCTURE.md -> "Redaction".
  log.info('inspect', 'source inspected', {
    container,
    durationSeconds: report.durationSeconds,
    videoCodec: video?.codec ?? null,
    resolution: video ? `${video.displayWidth}x${video.displayHeight}` : null,
    frameRate: video?.frameRate.bestGuess ?? null,
    variableFrameRate: video?.isVariableFrameRate ?? null,
    audioCodec: audio?.codec ?? null,
    channels: audio?.channelCount ?? null,
    subtitleTracks: tracks.scanned ? tracks.subtitleTracks : null,
    chapterTracks: tracks.scanned ? tracks.chapterTracks : null,
  })

  return report
}
