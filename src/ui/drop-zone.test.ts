/**
 * Dropping a video on the Choose step (VH-101): which drops are taken, what a
 * refused one is told, and that the picker stays the route a drop feeds.
 *
 * The DOM half — the drag-over state, the hand-off to the input, a drop
 * outside the zone — needs a real browser and was verified in Chrome. What is
 * pinned here is every decision it makes.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { acceptsFile, dropProblem } from './drop-zone'

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
const markup = html.replace(/<!--[\s\S]*?-->/g, '')
/** The picker's own list, so these tests describe the file the page offers. */
const accept = /id="file-input"[\s\S]*?accept="([^"]*)"/.exec(markup)?.[1] ?? ''

const mp4 = { name: 'lecture.mp4', type: 'video/mp4' }

describe('acceptsFile', () => {
  it("reads the picker's list from the page", () => {
    expect(accept).toContain('video/*')
  })

  it('takes a video by its type, as the picker does', () => {
    expect(acceptsFile(accept, mp4)).toBe(true)
    expect(acceptsFile(accept, { name: 'clip', type: 'video/quicktime' })).toBe(true)
  })

  it('takes a video by its extension when the browser gives no type', () => {
    // Some browsers report an MKV with an empty type; the list names it.
    expect(acceptsFile(accept, { name: 'Seminar.MKV', type: '' })).toBe(true)
  })

  it('refuses what is not a video', () => {
    expect(acceptsFile(accept, { name: 'slides.pdf', type: 'application/pdf' })).toBe(false)
    expect(acceptsFile(accept, { name: 'poster.png', type: 'image/png' })).toBe(false)
    // A dropped folder arrives with no type and no extension.
    expect(acceptsFile(accept, { name: 'Lectures', type: '' })).toBe(false)
    // An extension is matched at the end, not anywhere in the name.
    expect(acceptsFile(accept, { name: 'notes.mp4.txt', type: 'text/plain' })).toBe(false)
  })

  it('takes anything when the list is empty, as an input without one does', () => {
    expect(acceptsFile('', { name: 'anything', type: '' })).toBe(true)
  })
})

describe('dropProblem', () => {
  it('takes one video', () => {
    expect(dropProblem([mp4], accept, null)).toBeNull()
  })

  it('refuses several files, and says how many and what to do', () => {
    expect(dropProblem([mp4, mp4, mp4], accept, null)).toBe(
      'That was 3 files. Drop one video at a time.',
    )
  })

  it('refuses a file that is not a video, and names what is wanted', () => {
    const problem = dropProblem([{ name: 'slides.pdf', type: 'application/pdf' }], accept, null)
    expect(problem).toMatch(/^That is not a video file\./)
    expect(problem).toContain('.mp4')
  })

  it('refuses a drop that carried no file', () => {
    expect(dropProblem([], accept, null)).toMatch(/Drop a video file\.$/)
  })

  it('refuses any drop while a video is being made, and says how to go on', () => {
    // Checked first: one video or three, the answer is to wait or cancel.
    for (const files of [[mp4], [mp4, mp4]]) {
      const problem = dropProblem(files, accept, 'making')
      expect(problem).toContain('being made')
      expect(problem).toContain('Cancel')
    }
  })

  it('refuses any drop while a video is being saved, and names the stop the save has', () => {
    const problem = dropProblem([mp4], accept, 'saving')
    expect(problem).toContain('being saved')
    expect(problem).not.toContain('Cancel')
    expect(problem).toContain('Stop the save')
  })

  it('refuses a drop before the start-up check has settled (VH-110)', () => {
    expect(dropProblem([mp4], accept, 'starting')).toContain('getting ready')
  })

  it('refuses any drop in a browser the start-up check blocked (VH-110)', () => {
    const problem = dropProblem([mp4], accept, 'unavailable')
    expect(problem).toContain('cannot run the tool')
    // The start-up message sits under the drop zone, not above it (VH-124).
    expect(problem).toContain('below')
  })
})

describe('the drop zone on the page', () => {
  const zone =
    /<div class="field drop-zone" id="drop-zone">([\s\S]*?)<\/div>/.exec(markup)?.[1] ?? ''

  it('holds the picker, which stays the primary route', () => {
    expect(zone).toContain('type="file"')
    expect(zone).toContain('id="file-input"')
    expect(zone.indexOf('id="file-input"')).toBeLessThan(zone.indexOf('id="drop-hint"'))
  })

  it('says a refusal where it is announced and tied to the picker', () => {
    expect(zone).toMatch(/<p class="field-error drop-error" id="drop-error" role="alert"><\/p>/)
    expect(zone).toContain('aria-describedby="drop-error"')
  })

  it('invites the drop in words', () => {
    expect(zone).toContain('Or drop it here.')
  })
})
