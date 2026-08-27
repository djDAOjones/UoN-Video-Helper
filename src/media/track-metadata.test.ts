/**
 * The track-identity carry rules (VH-77, spec 8.3.4).
 *
 * These exist because the loss they prevent is silent: a player showing
 * "Undetermined" where the source said "English" looks like the file was
 * always that way.
 */

import type { TrackDisposition } from 'mediabunny'
import { describe, expect, it } from 'vitest'

import { carryTrackMetadata, type SourceTrackIdentity } from './track-metadata'

const NOTHING_SET: TrackDisposition = {
  default: false,
  primary: false,
  forced: false,
  original: false,
  commentary: false,
  hearingImpaired: false,
  visuallyImpaired: false,
}

function track(overrides: Partial<{
  languageCode: string
  name: string | null
  disposition: TrackDisposition
}> = {}): SourceTrackIdentity {
  return {
    getLanguageCode: () => Promise.resolve(overrides.languageCode ?? 'eng'),
    getName: () =>
      Promise.resolve(overrides.name === undefined ? 'Main Presentation' : overrides.name),
    getDisposition: () => Promise.resolve(overrides.disposition ?? NOTHING_SET),
  }
}

describe('carryTrackMetadata', () => {
  it('carries the language and the name the user gave the track', async () => {
    const carried = await carryTrackMetadata(track())

    expect(carried.languageCode).toBe('eng')
    expect(carried.name).toBe('Main Presentation')
  })

  it('omits an undetermined language rather than restating it', async () => {
    // 'und' is Mediabunny's "nobody said", and writing it back would look like
    // a decision the source never made.
    const carried = await carryTrackMetadata(track({ languageCode: 'und', name: null }))

    expect(carried.languageCode).toBeUndefined()
    expect(carried.name).toBeUndefined()
  })

  it('makes the surviving track default and primary whatever the source said', async () => {
    // The output has exactly one track of each type. A lone audio track marked
    // non-default is one some players will not select.
    const carried = await carryTrackMetadata(track())

    expect(carried.disposition?.default).toBe(true)
    expect(carried.disposition?.primary).toBe(true)
  })

  it('keeps the flags that describe the content, not the track order', async () => {
    const carried = await carryTrackMetadata(
      track({
        disposition: { ...NOTHING_SET, commentary: true, hearingImpaired: true, forced: true },
      }),
    )

    expect(carried.disposition?.commentary).toBe(true)
    expect(carried.disposition?.hearingImpaired).toBe(true)
    expect(carried.disposition?.forced).toBe(true)
    expect(carried.disposition?.original).toBe(false)
  })

  it('reports the loss instead of failing the job', async () => {
    const losses: string[] = []
    const broken: SourceTrackIdentity = {
      getLanguageCode: () => Promise.reject(new Error('track metadata unreadable')),
      getName: () => Promise.resolve(null),
      getDisposition: () => Promise.resolve(NOTHING_SET),
    }

    const carried = await carryTrackMetadata(broken, (reason) => losses.push(reason))

    expect(carried).toEqual({})
    expect(losses).toEqual(['track metadata unreadable'])
  })

  it('carries nothing for a track the output does not have', async () => {
    expect(await carryTrackMetadata(null)).toEqual({})
  })
})
