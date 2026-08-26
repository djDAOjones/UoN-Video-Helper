import { describe, expect, it } from 'vitest'

import { estimateJobDurationSeconds } from './probe'

describe('estimateJobDurationSeconds', () => {
  it('returns the rounded measured video estimate for a silent source', () => {
    expect(estimateJobDurationSeconds(42.6, false)).toBe(43)
  })

  it('makes an audio job estimate explicitly unavailable', () => {
    expect(estimateJobDurationSeconds(42.6, true)).toBeNull()
  })
})
