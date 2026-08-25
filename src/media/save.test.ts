import { describe, expect, it } from 'vitest'

import { suggestedFileName } from './save'

describe('suggestedFileName', () => {
  it('keeps the name the user recognises and marks it as the new file', () => {
    expect(suggestedFileName('Week 3 Lecture.mp4')).toBe('Week 3 Lecture (branded).mp4')
    expect(suggestedFileName('seminar.mov')).toBe('seminar (branded).mp4')
  })

  it('always ends up as .mp4, whatever went in', () => {
    for (const name of ['a.mkv', 'b.webm', 'c.MP4', 'd']) {
      expect(suggestedFileName(name).endsWith('.mp4')).toBe(true)
    }
  })

  it('only strips the final extension', () => {
    expect(suggestedFileName('lecture.part2.mp4')).toBe('lecture.part2 (branded).mp4')
  })

  it('falls back to something usable for a nameless file', () => {
    expect(suggestedFileName('')).toBe('video (branded).mp4')
    expect(suggestedFileName('   ')).toBe('video (branded).mp4')
    expect(suggestedFileName('.mp4')).toBe('video (branded).mp4')
  })

  it('never returns a name that could overwrite the source', () => {
    for (const name of ['x.mp4', 'Lecture.mp4']) {
      expect(suggestedFileName(name)).not.toBe(name)
    }
  })
})
