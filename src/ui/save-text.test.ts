import { describe, expect, it } from 'vitest'

import { downloadDestinationFor, downloadStatusText } from './save-text'

describe('where a download lands (VH-113, spec 9.1 step 5)', () => {
  it('names the Files app and Downloads on an iPhone or iPad', () => {
    const iphone =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1'
    expect(downloadDestinationFor(iphone)).toBe('ios')
    const text = downloadStatusText('ios')
    expect(text).toContain('Files app, under Downloads')
    expect(text).toContain('may still be finishing')
  })

  it('says the downloads folder everywhere else, and never claims a completed write', () => {
    const chrome =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'
    expect(downloadDestinationFor(chrome)).toBe('other')
    const text = downloadStatusText('other')
    expect(text).toContain('downloads folder')
    expect(text).not.toMatch(/^Saved\./)
    expect(text).toContain('choose another video in step 1')
  })
})
