/**
 * The scan exists because Mediabunny cannot see subtitle or chapter tracks at
 * all — verified by round-trip in Phase A. Everything here is built from
 * synthetic boxes so each case states exactly what shape of file it stands for.
 */

import { describe, expect, it } from 'vitest'

import { scanTrackHandlers } from './isobmff'

/**
 * Builds one ISOBMFF box.
 *
 * Typed as `Uint8Array<ArrayBuffer>` rather than plain `Uint8Array`: a
 * `SharedArrayBuffer`-backed array is not a valid `BlobPart`, and the wider
 * type would not be accepted below.
 */
function box(type: string, ...payloads: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const body = payloads.reduce((sum, p) => sum + p.length, 0)
  const out = new Uint8Array(8 + body)
  new DataView(out.buffer).setUint32(0, out.length)
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i)
  let at = 8
  for (const payload of payloads) {
    out.set(payload, at)
    at += payload.length
  }
  return out
}

function bytes(...values: number[]): Uint8Array<ArrayBuffer> {
  return new Uint8Array(values)
}

function uint32(value: number): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(4)
  new DataView(out.buffer).setUint32(0, value)
  return out
}

/** `hdlr`: version+flags(4), pre_defined(4), handler_type(4). */
function hdlr(handler: string): Uint8Array<ArrayBuffer> {
  return box(
    'hdlr',
    bytes(0, 0, 0, 0),
    bytes(0, 0, 0, 0),
    new Uint8Array([...handler].map((c) => c.charCodeAt(0))),
  )
}

/** `tkhd` version 0: version+flags(4), creation(4), modification(4), track_id(4). */
function tkhd(id: number): Uint8Array<ArrayBuffer> {
  return box('tkhd', bytes(0, 0, 0, 0), uint32(0), uint32(0), uint32(id))
}

function trak(id: number, handler: string, chapterRefs?: number[]): Uint8Array<ArrayBuffer> {
  const parts = [tkhd(id), box('mdia', hdlr(handler))]
  if (chapterRefs) parts.push(box('tref', box('chap', ...chapterRefs.map(uint32))))
  return box('trak', ...parts)
}

function file(...traks: Uint8Array<ArrayBuffer>[]): Blob {
  return new Blob([box('ftyp', new Uint8Array(8)), box('moov', ...traks)])
}

describe('scanTrackHandlers', () => {
  it('reports an ordinary video with sound and nothing else', async () => {
    const scan = await scanTrackHandlers(file(trak(1, 'vide'), trak(2, 'soun')))
    expect(scan.scanned).toBe(true)
    expect(scan.videoTracks).toBe(1)
    expect(scan.audioTracks).toBe(1)
    expect(scan.subtitleTracks).toBe(0)
    expect(scan.chapterTracks).toBe(0)
  })

  it('finds a subtitle track — the case Mediabunny reports as no tracks at all', async () => {
    const scan = await scanTrackHandlers(file(trak(1, 'vide'), trak(2, 'soun'), trak(3, 'sbtl')))
    expect(scan.subtitleTracks).toBe(1)
  })

  it('recognises every subtitle handler type in the wild', async () => {
    for (const handler of ['sbtl', 'subt', 'text', 'clcp']) {
      const scan = await scanTrackHandlers(file(trak(1, 'vide'), trak(2, handler)))
      expect(scan.subtitleTracks, handler).toBe(1)
    }
  })

  it('counts a chapter track as a chapter, not as a subtitle', async () => {
    // QuickTime chapters are a text track another track points at through
    // tref/chap. Counting both would report one thing twice.
    const scan = await scanTrackHandlers(
      file(trak(1, 'vide', [3]), trak(2, 'soun'), trak(3, 'text')),
    )
    expect(scan.chapterTracks).toBe(1)
    expect(scan.subtitleTracks).toBe(0)
  })

  it('handles both at once', async () => {
    const scan = await scanTrackHandlers(
      file(trak(1, 'vide', [4]), trak(2, 'soun'), trak(3, 'sbtl'), trak(4, 'text')),
    )
    expect(scan.subtitleTracks).toBe(1)
    expect(scan.chapterTracks).toBe(1)
  })

  it('says nothing about a file that is not ISOBMFF', async () => {
    // WebM and Matroska have no such boxes. Guessing would be worse than
    // staying quiet, so `scanned` is false and the caller says nothing.
    const scan = await scanTrackHandlers(new Blob([bytes(0x1a, 0x45, 0xdf, 0xa3, 1, 2, 3, 4)]))
    expect(scan.scanned).toBe(false)
    expect(scan.subtitleTracks).toBe(0)
  })

  it('survives a truncated file rather than throwing', async () => {
    const whole = await file(trak(1, 'vide'), trak(2, 'sbtl')).arrayBuffer()
    const scan = await scanTrackHandlers(new Blob([whole.slice(0, whole.byteLength - 20)]))
    expect(scan.subtitleTracks).toBeLessThanOrEqual(1)
  })

  it('finds moov when it sits at the end of the file', async () => {
    // A recorder that did not finalise for streaming leaves moov last.
    const tail = new Blob([
      box('ftyp', new Uint8Array(8)),
      box('mdat', new Uint8Array(4096)),
      box('moov', trak(1, 'vide'), trak(2, 'sbtl')),
    ])
    const scan = await scanTrackHandlers(tail)
    expect(scan.scanned).toBe(true)
    expect(scan.subtitleTracks).toBe(1)
  })

  it('skips a large mdat without reading it', async () => {
    const scan = await scanTrackHandlers(
      new Blob([
        box('ftyp', new Uint8Array(8)),
        box('mdat', new Uint8Array(2_000_000)),
        box('moov', trak(1, 'vide'), trak(2, 'soun'), trak(3, 'subt')),
      ]),
    )
    expect(scan.subtitleTracks).toBe(1)
  })
})
