import { describe, expect, it } from 'vitest'

import { isSourceDestination, suggestedFileName } from './save'

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

/**
 * VH-56. "The source file is never modified" is a headline promise in
 * `README.md` and on the screen, and the save picker made it falsifiable: it
 * returns whatever the user selected, and selecting the original was allowed.
 * A suggested name is a suggestion, not a guard.
 */
describe('isSourceDestination', () => {
  const source = { name: 'Week 3 Lecture.mp4', size: 7_089_574, lastModified: 1_648_400_000_000 }

  it('refuses the source itself', () => {
    expect(isSourceDestination({ ...source }, source)).toBe(true)
  })

  it('allows a destination that does not exist yet', () => {
    // The ordinary case: the user typed a new name, so there is nothing there.
    expect(isSourceDestination(null, source)).toBe(false)
  })

  it('allows the suggested name beside the source', () => {
    const destination = { ...source, name: suggestedFileName(source.name) }
    expect(isSourceDestination(destination, source)).toBe(false)
  })

  it('allows a same-named file that is a different file', () => {
    expect(isSourceDestination({ ...source, size: source.size + 1 }, source)).toBe(false)
    expect(isSourceDestination({ ...source, lastModified: 0 }, source)).toBe(false)
  })

  it('does not confuse last year’s copy with this one', () => {
    // Same lecture, re-recorded: same name, different everything else.
    const destination = { name: source.name, size: 9_000_000, lastModified: 1_700_000_000_000 }
    expect(isSourceDestination(destination, source)).toBe(false)
  })
})
