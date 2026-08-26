import { describe, expect, it } from 'vitest'

import { describeAdditionalTracks, describeMetadataRisk } from './source-panel'

describe('describeAdditionalTracks', () => {
  it('warns before processing when extra picture and sound tracks will be omitted', () => {
    expect(describeAdditionalTracks(2, 3)).toEqual({
      detail: 'Found 2 picture tracks and 3 sound tracks',
      note: 'Only the main picture and main sound described above will be used. The other tracks cannot be carried into the new file. Check that the summary matches what you expect before continuing.',
    })
  })

  it('warns when only picture tracks are additional', () => {
    expect(describeAdditionalTracks(2, 1)?.detail).toBe('Found 2 picture tracks')
  })

  it('does not warn for the single selected picture and sound', () => {
    expect(describeAdditionalTracks(1, 1)).toBeNull()
  })
})

describe('describeMetadataRisk', () => {
  it('warns before processing when file-level details were unreadable', () => {
    expect(describeMetadataRisk(false)).toEqual({
      detail: 'Some file details could not be read',
      note: 'Creation, title or other file details may not be carried into the new video. Keep the original alongside if those details matter.',
    })
  })

  it('stays silent when file-level details were readable', () => {
    expect(describeMetadataRisk(true)).toBeNull()
  })
})
