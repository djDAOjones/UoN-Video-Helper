import type { BaseTrackMetadata, Input, InputAudioTrack, InputVideoTrack } from 'mediabunny'

/** The methods needed to apply Mediabunny's primary-track policy. */
export type TrackSelectableInput = Pick<
  Input,
  'getVideoTracks' | 'getAudioTracks' | 'getPrimaryVideoTrack' | 'getPrimaryAudioTrack'
>

/**
 * The exact picture and sound tracks one processing attempt will inspect,
 * probe and encode, plus the multiplicity that must be disclosed beforehand.
 */
export interface ProcessingTrackSelection {
  readonly video: InputVideoTrack | null
  readonly audio: InputAudioTrack | null
  readonly videoTrackCount: number
  readonly audioTrackCount: number
}

export type TrackMetadataSource = Pick<
  InputVideoTrack,
  'getLanguageCode' | 'getName' | 'getDisposition'
>

/** Reads the source metadata both output A/V track types can preserve. */
export async function readOutputTrackMetadata(
  track: TrackMetadataSource,
): Promise<BaseTrackMetadata> {
  const [languageCode, name, disposition] = await Promise.all([
    track.getLanguageCode(),
    track.getName(),
    track.getDisposition(),
  ])
  return {
    languageCode,
    disposition,
    ...(name === null ? {} : { name }),
  }
}

/**
 * Applies Mediabunny's primary-track policy once for a processing attempt.
 *
 * `getVideoTracks()[0]` means first in container order; `getPrimary*Track()`
 * additionally considers default disposition, A/V pairing and bitrate. Every
 * consumer must share this result so the UI never describes a different track
 * from the one the probe and pipeline use.
 */
export async function selectProcessingTracks(
  input: TrackSelectableInput,
): Promise<ProcessingTrackSelection> {
  const [videoTracks, audioTracks, video, audio] = await Promise.all([
    input.getVideoTracks(),
    input.getAudioTracks(),
    input.getPrimaryVideoTrack(),
    input.getPrimaryAudioTrack(),
  ])

  return Object.freeze({
    video,
    audio,
    videoTrackCount: videoTracks.length,
    audioTrackCount: audioTracks.length,
  })
}
