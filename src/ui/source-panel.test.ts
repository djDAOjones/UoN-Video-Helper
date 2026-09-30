/**
 * `AGENTS.md`: anything that cannot be carried through warns visibly BEFORE
 * processing starts. This panel is where "before" happens, so the losses it
 * names are an invariant rather than a presentation choice.
 */

import { describe, expect, it } from 'vitest'

import type { SourceReport } from '../media/inspect'
import { buildRows } from './source-panel'

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

describe('extra tracks (VH-59)', () => {
  it('says nothing when there is one of each to carry', () => {
    expect(rowFor(report(), 'Extra tracks')).toBeUndefined()
  })

  it('names a second sound track before the job starts', () => {
    // The OBS case: programme audio plus a commentary mic. Only one survives.
    const row = rowFor(report({ audioTrackCount: 2, reportedTrackCount: 3 }), 'Extra tracks')
    expect(row?.detail).toContain('1 more sound track')
    expect(row?.note).toContain('will not be carried over')
  })

  it('counts plurals rather than saying "1 more sound tracks"', () => {
    const row = rowFor(report({ audioTrackCount: 4 }), 'Extra tracks')
    expect(row?.detail).toContain('3 more sound tracks')
  })

  it('names extra picture tracks too, and both together', () => {
    const row = rowFor(report({ videoTrackCount: 2, audioTrackCount: 3 }), 'Extra tracks')
    expect(row?.detail).toContain('1 more video track')
    expect(row?.detail).toContain('2 more sound tracks')
  })

  it('never reports a negative count for a file with no audio', () => {
    const row = rowFor(report({ audio: null, audioTrackCount: 0 }), 'Extra tracks')
    expect(row).toBeUndefined()
  })
})

describe('what the panel refuses to guess', () => {
  it('does not claim there are no captions in a container it could not scan', () => {
    const rows = buildRows(report({ tracks: scan({ scanned: false }) }))
    expect(rows.find((r) => r.term === 'Captions')).toBeUndefined()
  })

  it('says a caption track cannot come across', () => {
    const row = rowFor(
      report({ tracks: scan({ subtitleTracks: 1 }) }),
      'Captions',
    )
    expect(row?.detail).toContain('1 caption track')
    expect(row?.note).toContain('cannot be carried')
  })

  it('does not send the user to a caption file field that no longer exists', () => {
    // VH-86 removed the field. The warning outlived it, and must not go on
    // promising a way out that is not on the screen.
    const row = rowFor(report({ tracks: scan({ subtitleTracks: 2, chapterTracks: 1 }) }), 'Captions')
    expect(row?.detail).toContain('2 caption tracks and 1 chapter track')
    expect(row?.note).not.toMatch(/below|add a/i)
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
    expect(said).not.toMatch(/subtitle/i)
  })
})
