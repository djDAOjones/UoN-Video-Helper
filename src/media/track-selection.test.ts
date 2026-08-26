import { describe, expect, it, vi } from 'vitest'
import type { InputAudioTrack, InputVideoTrack, TrackDisposition } from 'mediabunny'

import {
  readOutputTrackMetadata,
  selectProcessingTracks,
  type TrackMetadataSource,
  type TrackSelectableInput,
} from './track-selection'

describe('selectProcessingTracks', () => {
  it('returns Mediabunny primary tracks rather than array position zero', async () => {
    const firstVideo = { id: 1 } as InputVideoTrack
    const primaryVideo = { id: 2 } as InputVideoTrack
    const firstAudio = { id: 3 } as InputAudioTrack
    const primaryAudio = { id: 4 } as InputAudioTrack
    const input: TrackSelectableInput = {
      getVideoTracks: vi.fn(() => Promise.resolve([firstVideo, primaryVideo])),
      getAudioTracks: vi.fn(() => Promise.resolve([firstAudio, primaryAudio])),
      getPrimaryVideoTrack: vi.fn(() => Promise.resolve(primaryVideo)),
      getPrimaryAudioTrack: vi.fn(() => Promise.resolve(primaryAudio)),
    }

    await expect(selectProcessingTracks(input)).resolves.toEqual({
      video: primaryVideo,
      audio: primaryAudio,
      videoTrackCount: 2,
      audioTrackCount: 2,
    })
  })

  it('keeps missing audio legitimate while counting every reported track', async () => {
    const video = { id: 1 } as InputVideoTrack
    const input: TrackSelectableInput = {
      getVideoTracks: vi.fn(() => Promise.resolve([video])),
      getAudioTracks: vi.fn(() => Promise.resolve([])),
      getPrimaryVideoTrack: vi.fn(() => Promise.resolve(video)),
      getPrimaryAudioTrack: vi.fn(() => Promise.resolve(null)),
    }

    await expect(selectProcessingTracks(input)).resolves.toEqual({
      video,
      audio: null,
      videoTrackCount: 1,
      audioTrackCount: 0,
    })
  })
})

describe('readOutputTrackMetadata', () => {
  const disposition: TrackDisposition = {
    default: true,
    primary: true,
    forced: false,
    original: true,
    commentary: false,
    hearingImpaired: false,
    visuallyImpaired: false,
  }

  it('carries language, name and disposition from the selected track', async () => {
    const track: TrackMetadataSource = {
      getLanguageCode: vi.fn(() => Promise.resolve('eng')),
      getName: vi.fn(() => Promise.resolve('Main programme')),
      getDisposition: vi.fn(() => Promise.resolve(disposition)),
    }

    await expect(readOutputTrackMetadata(track)).resolves.toEqual({
      languageCode: 'eng',
      name: 'Main programme',
      disposition,
    })
  })

  it('omits a null source name rather than inventing one', async () => {
    const track: TrackMetadataSource = {
      getLanguageCode: vi.fn(() => Promise.resolve('und')),
      getName: vi.fn(() => Promise.resolve(null)),
      getDisposition: vi.fn(() => Promise.resolve(disposition)),
    }

    await expect(readOutputTrackMetadata(track)).resolves.toEqual({
      languageCode: 'und',
      disposition,
    })
  })
})
