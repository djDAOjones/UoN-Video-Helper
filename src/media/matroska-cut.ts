/**
 * A Matroska or WebM file cut short (VH-158).
 *
 * VH-139 finds an MP4 cut short because its index declares packets the file
 * no longer holds. A Matroska file has no such index: Mediabunny lists only
 * the clusters it can read, drops a partial last one without a word, and
 * reports the shorter length as the file's. So this reads the file's own
 * bytes for two promises it cannot keep:
 *
 * - the Segment's size, declared at the start, running past the file's end —
 *   every file written where it could be finished: ffmpeg, OBS's remux,
 *   HandBrake, mkvmerge, a Chrome recording saved in one piece;
 * - the last element, at the end, running past it: a cluster, a block, or a
 *   header cut through — every cut that is not exactly between two elements,
 *   including a Chrome recording saved chunk by chunk, whose sizes are unknown.
 *
 * A Segment that runs past the end while the file's declared Duration is met
 * lost only its trailing index, not a frame, and is not said. A file of
 * unknown sizes and no Duration, cut exactly between two elements, promises
 * nothing it lacks and cannot be told from a whole one: no signal exists.
 *
 * Measured on 52 files (19 whole, among them two real Chrome recordings and
 * the repo's eight closing WebMs; 33 cut): no whole file raised it.
 * Like `isobmff.ts`, it understands as little of the format as it can.
 */

import type { Input } from 'mediabunny'

import { ENDS_EARLY_MARGIN_SECONDS, MATROSKA_CUT_READ } from '../config/thresholds'

/** The containers this applies to, by Mediabunny's format names. */
const MATROSKA_CONTAINERS = new Set(['Matroska', 'WebM'])

const EBML_ID = 0x1a45dfa3
const SEGMENT_ID = 0x18538067
const CLUSTER_ID = 0x1f43b675
const CLUSTER_ID_BYTES = [0x1f, 0x43, 0xb6, 0x75] as const
const TIMESTAMP_ID = 0xe7
/** Allowed anywhere, as a cluster's first child among them. */
const CRC32_ID = 0xbf
/** The Segment's children: where an unknown-size cluster ends. Void and CRC-32 may sit at any level, so they do not. */
const TOP_LEVEL_IDS = new Set([
  0x114d9b74, // SeekHead
  0x1549a966, // Info
  0x1654ae6b, // Tracks
  0x1c53bb6b, // Cues
  CLUSTER_ID,
  0x1254c367, // Tags
  0x1043a770, // Chapters
  0x1941a469, // Attachments
])
const VOID_ID = 0xec
const MAX_ID_BYTES = 4
const MAX_SIZE_BYTES = 8
/** A Cluster Timestamp holds an unsigned integer of one to eight bytes. */
const MAX_TIMESTAMP_BYTES = 8

/** An element's header: its ID, where its data starts, and its size, `null` when the writer left it unknown. */
interface Header {
  readonly id: number
  readonly dataStart: number
  readonly size: number | null
}

/** A header read at a position: whole, run out of bytes, or not a header at all. */
type HeaderRead = Header | 'short' | 'invalid'

/** Reads the variable-length integer's width from its first byte, or 0 when the byte has no marker in range. */
function vintWidth(first: number, maxBytes: number): number {
  for (let width = 1, marker = 0x80; width <= maxBytes; width++, marker >>= 1) {
    if (first & marker) return width
  }
  return 0
}

/** Reads the element header at `at`. */
function readHeader(bytes: Uint8Array, at: number): HeaderRead {
  if (at >= bytes.length) return 'short'
  const idWidth = vintWidth(bytes[at]!, MAX_ID_BYTES)
  if (idWidth === 0) return 'invalid'
  if (at + idWidth >= bytes.length) return 'short'
  let id = 0
  for (let index = 0; index < idWidth; index++) id = id * 256 + bytes[at + index]!
  const sizeAt = at + idWidth
  const sizeWidth = vintWidth(bytes[sizeAt]!, MAX_SIZE_BYTES)
  if (sizeWidth === 0) return 'invalid'
  if (sizeAt + sizeWidth > bytes.length) return 'short'
  const valueMask = 0xff >> sizeWidth
  let size = bytes[sizeAt]! & valueMask
  let unknown = size === valueMask
  for (let index = 1; index < sizeWidth; index++) {
    const byte = bytes[sizeAt + index]!
    size = size * 256 + byte
    if (byte !== 0xff) unknown = false
  }
  if (!unknown && !Number.isSafeInteger(size)) return 'invalid'
  return { id, dataStart: sizeAt + sizeWidth, size: unknown ? null : size }
}

/** True when anything but zero padding lies from `at` to the end: bytes too few for a header, cut through. */
function bytesRemain(bytes: Uint8Array, at: number): boolean {
  for (let index = at; index < bytes.length; index++) if (bytes[index] !== 0) return true
  return false
}

/**
 * Whether the Segment's declared size runs past the file's end, from the
 * file's first bytes. False for a Segment of unknown size, which promises
 * nothing, and for bytes that are not a Matroska header.
 */
export function segmentPastEnd(head: Uint8Array, fileBytes: number): boolean {
  const ebml = readHeader(head, 0)
  if (typeof ebml === 'string' || ebml.id !== EBML_ID || ebml.size === null) return false
  const segment = readHeader(head, ebml.dataStart + ebml.size)
  if (typeof segment === 'string' || segment.id !== SEGMENT_ID || segment.size === null) return false
  return segment.dataStart + segment.size > fileBytes
}

/**
 * Whether a cluster really starts at `at`: its header, then a Timestamp
 * (after a CRC-32, if the writer adds one), or the end of the bytes before
 * either could be read. Four bytes alone could be any compressed frame's.
 */
function clusterStartsAt(bytes: Uint8Array, at: number): boolean {
  const cluster = readHeader(bytes, at)
  if (cluster === 'short') return true
  if (cluster === 'invalid' || cluster.id !== CLUSTER_ID) return false
  let child = readHeader(bytes, cluster.dataStart)
  if (typeof child !== 'string' && child.id === CRC32_ID && child.size !== null) {
    child = readHeader(bytes, child.dataStart + child.size)
  }
  if (child === 'short') return true
  return child !== 'invalid' && child.id === TIMESTAMP_ID && child.size !== null && child.size >= 1 && child.size <= MAX_TIMESTAMP_BYTES
}

/** Where the last cluster in `bytes` starts, or `null` when none does. */
function lastClusterStart(bytes: Uint8Array): number | null {
  const [a, b, c, d] = CLUSTER_ID_BYTES
  for (let at = bytes.length - CLUSTER_ID_BYTES.length; at >= 0; at--) {
    if (bytes[at] === a && bytes[at + 1] === b && bytes[at + 2] === c && bytes[at + 3] === d && clusterStartsAt(bytes, at)) {
      return at
    }
  }
  return null
}

/**
 * Walks an unknown-size cluster's children from `at`: where the next
 * top-level element starts, `'cut'` when a child runs past the end, or
 * `'end'` when the bytes end on a child's boundary or stop making sense.
 */
function walkCluster(bytes: Uint8Array, at: number): number | 'cut' | 'end' {
  let position = at
  while (position < bytes.length) {
    const child = readHeader(bytes, position)
    if (child === 'short') return bytesRemain(bytes, position) ? 'cut' : 'end'
    if (child === 'invalid' || child.id === EBML_ID || child.id === SEGMENT_ID) return 'end'
    if (TOP_LEVEL_IDS.has(child.id)) return position
    if (child.size === null) return 'end'
    const end = child.dataStart + child.size
    if (end > bytes.length) return 'cut'
    position = end
  }
  return 'end'
}

/**
 * Whether the elements from the last cluster to the end of `bytes` promise
 * more than is there: a size past the end, or a header cut through. Zero
 * padding, or bytes that are not elements, say nothing.
 */
export function tailPastEnd(bytes: Uint8Array): boolean {
  let position = lastClusterStart(bytes)
  if (position === null) return false
  while (position < bytes.length) {
    const element = readHeader(bytes, position)
    if (element === 'short') return bytesRemain(bytes, position)
    if (element === 'invalid' || !(TOP_LEVEL_IDS.has(element.id) || element.id === VOID_ID)) return false
    if (element.size !== null) {
      const end = element.dataStart + element.size
      if (end > bytes.length) return true
      position = end
      continue
    }
    if (element.id !== CLUSTER_ID) return false
    const next = walkCluster(bytes, element.dataStart)
    if (next === 'cut') return true
    if (next === 'end') return false
    position = next
  }
  return false
}

/** The two promises a Matroska file's bytes make about its length, each kept or broken. */
export interface MatroskaPromises {
  readonly segmentPastEnd: boolean
  readonly tailPastEnd: boolean
}

/**
 * Whether a file is cut short, from its broken promises and its lengths.
 *
 * @param declaredSeconds - The file's declared Duration, `null` when it has none.
 * @param readSeconds - How far the file's packets reach as Mediabunny reads them.
 */
export function isCutShort(
  promises: MatroskaPromises,
  declaredSeconds: number | null,
  readSeconds: number,
  marginSeconds: number = ENDS_EARLY_MARGIN_SECONDS,
): boolean {
  if (promises.tailPastEnd) return true
  if (!promises.segmentPastEnd) return false
  // The Segment ran past the end. Only its trailing index may be what is
  // missing, every frame there: a Duration met says so.
  return declaredSeconds === null || declaredSeconds - readSeconds > marginSeconds
}

/** Reads the file's first bytes, then its last, growing the window until it holds a cluster's start. */
async function readPromises(file: Blob): Promise<MatroskaPromises> {
  const head = new Uint8Array(await file.slice(0, MATROSKA_CUT_READ.headBytes).arrayBuffer())
  const segment = segmentPastEnd(head, file.size)
  for (let window = MATROSKA_CUT_READ.firstTailBytes; ; window *= 2) {
    const start = Math.max(0, file.size - window)
    const tail = new Uint8Array(await file.slice(start).arrayBuffer())
    if (lastClusterStart(tail) !== null) return { segmentPastEnd: segment, tailPastEnd: tailPastEnd(tail) }
    if (start === 0 || window >= MATROSKA_CUT_READ.lastTailBytes) return { segmentPastEnd: segment, tailPastEnd: false }
  }
}

/**
 * Whether a Matroska or WebM file is cut short: always false for any other
 * container, which VH-139's index check covers.
 *
 * @param container - Mediabunny's name for the file's format.
 * @param input - The file opened, for its declared and read lengths.
 */
export async function matroskaCutShort(file: Blob, container: string, input: Input): Promise<boolean> {
  if (!MATROSKA_CONTAINERS.has(container)) return false
  const promises = await readPromises(file)
  if (!promises.tailPastEnd && !promises.segmentPastEnd) return false
  return isCutShort(promises, await input.getDurationFromMetadata(), await input.computeDuration())
}
