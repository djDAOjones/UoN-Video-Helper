import { describe, expect, it } from 'vitest'

import { closingPreviewMayAutoplay, closingPreviewUrl } from './branding-preview'

describe('closing branding preview', () => {
  it('uses the approved opaque closing card for the selected colour', () => {
    expect(closingPreviewUrl('blue')).toMatch(/branding\/closing-tail-blue-1080p\.mp4$/)
    expect(closingPreviewUrl('white')).toMatch(/branding\/closing-tail-white-1080p\.mp4$/)
  })

  it('does not start motion when reduced motion is requested', () => {
    expect(closingPreviewMayAutoplay(true)).toBe(false)
    expect(closingPreviewMayAutoplay(false)).toBe(true)
  })
})
