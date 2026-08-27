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
  it('does not claim there are no subtitles in a container it could not scan', () => {
    const rows = buildRows(report({ tracks: scan({ scanned: false }) }))
    expect(rows.find((r) => r.term === 'Subtitles')).toBeUndefined()
  })

  it('says a subtitle track cannot come across', () => {
    const row = rowFor(
      report({ tracks: scan({ subtitleTracks: 1 }) }),
      'Subtitles',
    )
    expect(row?.detail).toContain('1 subtitle track')
    expect(row?.note).toContain('cannot be carried')
  })
})
