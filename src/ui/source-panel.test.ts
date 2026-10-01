/**
 * `AGENTS.md`: anything that cannot be carried through warns visibly BEFORE
 * processing starts. This panel is where "before" happens, so the losses it
 * names are an invariant rather than a presentation choice.
 */

import { describe, expect, it } from 'vitest'

import type { SourceReport } from '../media/inspect'
import { buildLosses, buildRows } from './source-panel'

/** The ISOBMFF handler scan; separate from Mediabunny's own track counts. */
function scan(overrides: Partial<SourceReport['tracks']> = {}): SourceReport['tracks'] {
  return {
    scanned: true,
    videoTracks: 1,
    audioTracks: 1,
    subtitleTracks: 0,
    chapterTracks: 0,
    handlers: ['vide', 'soun'],
    ...overrides,
  }
}

function report(overrides: Partial<SourceReport> = {}): SourceReport {
  return {
    container: 'MP4',
    fileSizeBytes: 7_089_574,
    durationSeconds: 130.4,
    video: {
      codec: 'avc',
      codecString: 'avc1.640033',
      codedWidth: 852,
      codedHeight: 480,
      displayWidth: 852,
      displayHeight: 480,
      rotation: 0,
      durationSeconds: 130.4,
      frameRate: {
        bestGuess: 30.303,
        underlying: null,
        min: 29.9,
        max: 30.4,
        average: 30.303,
        median: 30.3,
        isConstant: false,
        probedPacketCount: 512,
      },
      isVariableFrameRate: false,
      averageBitrateBps: 400_000,
      canDecode: true,
      conform: {
        frameRate: 30,
        sourceFrameRate: 30.303,
        frameDeltaRatio: -0.01,
      },
    },
    audio: {
      codec: 'aac',
      codecString: 'mp4a.40.2',
      sampleRate: 44_100,
      channelCount: 2,
      durationSeconds: 130.4,
      canDecode: true,
    },
    reportedTrackCount: 2,
    videoTrackCount: 1,
    audioTrackCount: 1,
    tracks: scan(),
    ...overrides,
  }
}

const rowFor = (source: SourceReport, term: string) => buildRows(source).find((r) => r.term === term)

/** Everything a loss says, so a test can ask what the user was told. */
const lossesSaid = (source: SourceReport) =>
  buildLosses(source)
    .map((loss) => `${loss.title} ${loss.detail}`)
    .join(' ')

const extraTracksLoss = (source: SourceReport) =>
  buildLosses(source).find((loss) => loss.title.startsWith('This file has'))

describe('extra tracks (VH-59)', () => {
  it('says nothing when there is one of each to carry', () => {
    expect(extraTracksLoss(report())).toBeUndefined()
  })

  it('names a second sound track before the job starts', () => {
    // The OBS case: programme audio plus a commentary mic. Only one survives.
    const loss = extraTracksLoss(report({ audioTrackCount: 2, reportedTrackCount: 3 }))
    expect(loss?.title).toContain('1 more sound track')
    expect(loss?.detail).toContain('will not be carried over')
  })

  it('counts plurals rather than saying "1 more sound tracks"', () => {
    const loss = extraTracksLoss(report({ audioTrackCount: 4 }))
    expect(loss?.title).toContain('3 more sound tracks')
  })

  it('names extra picture tracks too, and both together', () => {
    const loss = extraTracksLoss(report({ videoTrackCount: 2, audioTrackCount: 3 }))
    expect(loss?.title).toContain('1 more video track')
    expect(loss?.title).toContain('2 more sound tracks')
  })

  it('never reports a negative count for a file with no audio', () => {
    const loss = extraTracksLoss(report({ audio: null, audioTrackCount: 0 }))
    expect(loss).toBeUndefined()
  })
})

describe('what the panel refuses to guess', () => {
  it('does not claim there are no captions in a container it could not scan', () => {
    const source = report({ tracks: scan({ scanned: false }) })
    expect(rowFor(source, 'Captions')?.detail).toBe('Could not be checked in this kind of file')
    expect(rowFor(source, 'Captions')?.detail).not.toMatch(/none/i)
  })

  it('says a caption track cannot come across', () => {
    const source = report({ tracks: scan({ subtitleTracks: 1 }) })
    expect(lossesSaid(source)).toContain('1 caption track')
    expect(lossesSaid(source)).toContain('will have no caption track')
  })

  it('does not send the user to a caption file field that no longer exists', () => {
    // VH-86 removed the field. The warning outlived it, and must not go on
    // promising a way out that is not on the screen.
    const source = report({ tracks: scan({ subtitleTracks: 2, chapterTracks: 1 }) })
    expect(lossesSaid(source)).toContain('2 caption tracks and 1 chapter track')
    expect(lossesSaid(source)).not.toMatch(/below|add a/i)
  })
})

describe('captions, not subtitles (VH-86)', () => {
  // Identifiers keep `subtitle`; the screen never says it. Every shape that
  // produces a caption sentence is walked, because the word hid in three.
  const shapes: ReadonlyArray<readonly [string, SourceReport]> = [
    ['none found', report()],
    ['one track', report({ tracks: scan({ subtitleTracks: 1 }) })],
    ['several, with chapters', report({ tracks: scan({ subtitleTracks: 3, chapterTracks: 2 }) })],
    ['a container that could not be scanned', report({ tracks: scan({ scanned: false }) })],
  ]

  it.each(shapes)('says "caption" throughout: %s', (_name, source) => {
    const said = buildRows(source)
      .map((row) => `${row.term} ${row.detail} ${row.note ?? ''}`)
      .join(' ')
    expect(`${said} ${lossesSaid(source)}`).not.toMatch(/subtitle/i)
  })
})

describe('video properties (VH-87)', () => {
  const terms = (source: SourceReport) => buildRows(source).map((row) => row.term)

  it('lists the rows in the agreed order', () => {
    expect(terms(report())).toEqual([
      'Duration',
      'Video format',
      'File size',
      'Resolution',
      'Frame rate',
      'Sound format',
      'Sound channels',
      'Sound sample rate',
      'Captions',
      'File type',
    ])
  })

  it('gives each audio fact its own row', () => {
    const source = report()
    expect(rowFor(source, 'Sound format')?.detail).toBe('AAC')
    expect(rowFor(source, 'Sound channels')?.detail).toBe('Stereo (two channels)')
    expect(rowFor(source, 'Sound sample rate')?.detail).toBe('44.1 kHz — 44,100 samples a second')
  })

  it('states the picture facts separately', () => {
    const source = report()
    expect(rowFor(source, 'Duration')?.detail).toBe('2 minutes 10 seconds')
    expect(rowFor(source, 'Video format')?.detail).toBe('H.264')
    expect(rowFor(source, 'Resolution')?.detail).toBe('852 × 480')
  })

  it('says a file has no audio once, not three times', () => {
    const source = report({ audio: null, audioTrackCount: 0 })
    expect(terms(source)).toEqual([
      'Duration',
      'Video format',
      'File size',
      'Resolution',
      'Frame rate',
      'Sound',
      'Captions',
      'File type',
    ])
    expect(rowFor(source, 'Sound')?.detail).toBe('No sound track found')
    expect(rowFor(source, 'Sound')?.note).toContain('Levelling needs sound')
  })

  it('keeps the rotation note with the resolution it explains', () => {
    const rotated = report({ video: { ...report().video, rotation: 90 } })
    expect(rowFor(rotated, 'Resolution')?.note).toContain('Rotated 90°')
    expect(rowFor(report(), 'Resolution')?.note).toBeUndefined()
  })

  it('says which codec the browser cannot read, on that codec', () => {
    const base = report()
    const unreadable = report({
      video: { ...base.video, canDecode: false },
      audio: { ...base.audio!, canDecode: false },
    })
    expect(rowFor(unreadable, 'Video format')?.note).toContain('cannot read this video format')
    expect(rowFor(unreadable, 'Sound format')?.note).toContain('cannot read this audio format')
    expect(rowFor(base, 'Video format')?.note).toBeUndefined()
  })
})

describe('losses against facts (VH-87)', () => {
  // The facts sit in a disclosure that starts closed. Anything the new file
  // will not carry therefore has to be a LOSS, which is always in view — a
  // loss that lived only in a row would be hidden before processing.

  it('has nothing to warn about for an ordinary file', () => {
    expect(buildLosses(report())).toEqual([])
  })

  it('reports a caption track as a loss AND as a fact', () => {
    const source = report({ tracks: scan({ subtitleTracks: 1 }) })
    expect(buildLosses(source)).toHaveLength(1)
    expect(rowFor(source, 'Captions')?.detail).toBe('Found 1 caption track')
  })

  it('keeps the consequence out of the row and in the loss', () => {
    // If the row carried "cannot be carried", the loss could be dropped one
    // day and the sentence would still exist — inside a closed disclosure.
    const source = report({
      audioTrackCount: 2,
      tracks: scan({ subtitleTracks: 1, chapterTracks: 1 }),
    })
    const rowsSaid = buildRows(source)
      .map((row) => `${row.detail} ${row.note ?? ''}`)
      .join(' ')
    expect(rowsSaid).not.toMatch(/carried/i)
    expect(lossesSaid(source)).toMatch(/will not be carried over/)
    expect(lossesSaid(source)).toMatch(/will not be carried over/)
  })

  it('treats "could not be checked" as a loss, because it may be one', () => {
    const source = report({ tracks: scan({ scanned: false }) })
    const losses = buildLosses(source)
    expect(losses).toHaveLength(1)
    expect(losses[0]?.title).toBe('Caption and chapter tracks could not be checked')
    expect(losses[0]?.detail).toContain('will not be carried over')
  })

  it('reports every loss at once, in a stable order', () => {
    const source = report({
      videoTrackCount: 2,
      tracks: scan({ subtitleTracks: 2 }),
    })
    expect(buildLosses(source).map((loss) => loss.title)).toEqual([
      'This file has 1 more video track',
      'Found 2 caption tracks',
    ])
  })
})
