/**
 * A minimal ISOBMFF box walk, to find the tracks Mediabunny cannot see.
 *
 * Verified by round-trip during Phase A: an MP4 written by Mediabunny *with* a
 * WebVTT subtitle track reads back as `getTracks().length === 0`. Subtitle and
 * chapter tracks are not merely undecodable to it — they are invisible. A
 * report that stayed silent about them would read as "there are none", and
 * silently discarding a caption track is the worst outcome available here.
 *
 * So this reads handler types and nothing else. It parses no samples, decodes
 * nothing, and deliberately understands as little of the format as it can get
 * away with: every extra thing it claims to know is another thing that can be
 * wrong about a file some recorder wrote unusually.
 */

/** ISO/IEC 14496-12 handler types we care to distinguish. */
const SUBTITLE_HANDLERS = new Set(['sbtl', 'subt', 'text', 'clcp'])
const VIDEO_HANDLER = 'vide'
const AUDIO_HANDLER = 'soun'

/** How much of the file to search for `moov`. */
const MAX_SCAN_BYTES = 64 * 1024 * 1024

export interface TrackScan {
  /** False when the file is not ISOBMFF at all — Matroska, WebM, or unreadable. */
  readonly scanned: boolean
  readonly videoTracks: number
  readonly audioTracks: number
  /** Subtitle, caption or text tracks. These are what Mediabunny cannot see. */
  readonly subtitleTracks: number
  /** Tracks referenced as chapters by another track (`tref` -> `chap`). */
  readonly chapterTracks: number
  /** Handler types encountered, for diagnostics. */
  readonly handlers: readonly string[]
}

const EMPTY: TrackScan = {
  scanned: false,
  videoTracks: 0,
  audioTracks: 0,
  subtitleTracks: 0,
  chapterTracks: 0,
  handlers: [],
}

interface Box {
  readonly type: string
  /** Offset of the box's payload, relative to the buffer. */
  readonly start: number
  /** Offset one past the box's last byte. */
  readonly end: number
}

function readBoxes(view: DataView, from: number, to: number): Box[] {
  const boxes: Box[] = []
  let offset = from

  while (offset + 8 <= to) {
    let size = view.getUint32(offset)
    const type = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7),
    )
    let headerSize = 8

    if (size === 1) {
      // 64-bit size. JavaScript numbers hold this exactly up to 2^53, which is
      // 9 petabytes — comfortably beyond anything this app will ever open.
      if (offset + 16 > to) break
      size = Number(view.getBigUint64(offset + 8))
      headerSize = 16
    } else if (size === 0) {
      // Extends to the end of the file.
      size = to - offset
    }

    if (size < headerSize || offset + size > to) break
    boxes.push({ type, start: offset + headerSize, end: offset + size })
    offset += size
  }

  return boxes
}

function findBox(view: DataView, from: number, to: number, type: string): Box | null {
  return readBoxes(view, from, to).find((box) => box.type === type) ?? null
}

/** Handler type of a `trak`, via `mdia` -> `hdlr`. */
function trackHandler(view: DataView, trak: Box): string | null {
  const mdia = findBox(view, trak.start, trak.end, 'mdia')
  if (!mdia) return null
  const hdlr = findBox(view, mdia.start, mdia.end, 'hdlr')
  if (!hdlr || hdlr.start + 12 > hdlr.end) return null

  // hdlr payload: version(1) flags(3) pre_defined(4) handler_type(4)
  const at = hdlr.start + 8
  return String.fromCharCode(
    view.getUint8(at),
    view.getUint8(at + 1),
    view.getUint8(at + 2),
    view.getUint8(at + 3),
  )
}

/** Track ids this `trak` references as chapters. */
function chapterReferences(view: DataView, trak: Box): number[] {
  const tref = findBox(view, trak.start, trak.end, 'tref')
  if (!tref) return []
  const chap = findBox(view, tref.start, tref.end, 'chap')
  if (!chap) return []

  const ids: number[] = []
  for (let at = chap.start; at + 4 <= chap.end; at += 4) ids.push(view.getUint32(at))
  return ids
}

/** Track id from `tkhd`, needed to match chapter references. */
function trackId(view: DataView, trak: Box): number | null {
  const tkhd = findBox(view, trak.start, trak.end, 'tkhd')
  if (!tkhd || tkhd.start + 4 > tkhd.end) return null
  const version = view.getUint8(tkhd.start)
  // version 0: creation(4) modification(4) track_id(4)
  // version 1: creation(8) modification(8) track_id(4)
  const at = tkhd.start + 4 + (version === 1 ? 16 : 8)
  return at + 4 <= tkhd.end ? view.getUint32(at) : null
}

/**
 * Scans a file for track handler types.
 *
 * @param file - The user's chosen file, read read-only and only in part.
 * @returns `scanned: false` for anything that is not ISOBMFF, which is not an
 *   error: WebM and Matroska simply do not carry these boxes, and the caller
 *   should say nothing rather than guess.
 */
export async function scanTrackHandlers(file: Blob): Promise<TrackScan> {
  try {
    // `moov` may sit at the end of the file, which is where a recorder that
    // did not finalise for streaming will have put it. Read the head for the
    // usual case and fall back to the tail rather than pulling in gigabytes.
    const headBytes = Math.min(file.size, MAX_SCAN_BYTES)
    let buffer = await file.slice(0, headBytes).arrayBuffer()
    let view = new DataView(buffer)
    let moov = findBox(view, 0, buffer.byteLength, 'moov')

    if (!moov && file.size > headBytes) {
      const tailStart = Math.max(0, file.size - MAX_SCAN_BYTES)
      buffer = await file.slice(tailStart).arrayBuffer()
      view = new DataView(buffer)
      moov = findBox(view, 0, buffer.byteLength, 'moov')
    }

    // No ftyp and no moov: not ISOBMFF. Say nothing rather than guess.
    if (!moov) {
      const isIsobmff = findBox(view, 0, buffer.byteLength, 'ftyp') !== null
      return isIsobmff ? { ...EMPTY, scanned: true } : EMPTY
    }

    const traks = readBoxes(view, moov.start, moov.end).filter((box) => box.type === 'trak')
    const handlers: string[] = []
    const chapterIds = new Set<number>()
    const byId = new Map<number, string>()

    for (const trak of traks) {
      const handler = trackHandler(view, trak)
      if (handler) handlers.push(handler)
      const id = trackId(view, trak)
      if (id !== null && handler) byId.set(id, handler)
      for (const referenced of chapterReferences(view, trak)) chapterIds.add(referenced)
    }

    // A chapter track is a text track another track points at. Counting it as
    // a subtitle track as well would double-report one thing.
    let subtitleTracks = 0
    let chapterTracks = 0
    for (const [id, handler] of byId) {
      if (!SUBTITLE_HANDLERS.has(handler)) continue
      if (chapterIds.has(id)) chapterTracks++
      else subtitleTracks++
    }

    return {
      scanned: true,
      videoTracks: handlers.filter((h) => h === VIDEO_HANDLER).length,
      audioTracks: handlers.filter((h) => h === AUDIO_HANDLER).length,
      subtitleTracks,
      chapterTracks,
      handlers,
    }
  } catch {
    // A scan that fails costs a warning we cannot give. It must never cost the
    // job — this runs alongside inspection, not instead of it.
    return EMPTY
  }
}
