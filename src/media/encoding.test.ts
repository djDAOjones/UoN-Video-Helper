import { describe, expect, it } from 'vitest'

import { PRESETS, audioBitrateFor } from '../config/presets'
import { audioEncodingConfigFor } from './encoding'

describe('audioEncodingConfigFor', () => {
  it('uses the shared mono and stereo bitrate decision', () => {
    for (const channelCount of [1, 2]) {
      expect(audioEncodingConfigFor(PRESETS.smaller, channelCount).bitrate).toBe(
        audioBitrateFor(PRESETS.smaller, channelCount),
      )
    }
  })
})
