/**
 * Redaction for the diagnostics bundle.
 *
 * This app's sensitive asset is not a token — it is **the user's media and
 * its filename**. `DEV-INFRASTRUCTURE.md` -> "Maintainer diagnostics" sets
 * the rule: dimensions, duration, frame rate and codec strings are useful and
 * allowed; the filename, any path, and any media bytes are not.
 *
 * Over-redaction is the safe failure direction. A bundle that is missing a
 * field is an inconvenience; a bundle carrying a lecture title is a leak.
 */

/** Exact key names that always carry identifying content. */
const DENIED_KEYS = new Set([
  'file',
  'filename',
  'filepath',
  'path',
  'url',
  'src',
  'href',
  'name',
  'title',
  'label',
  'artist',
  'album',
  'comment',
  'description',
  'lyrics',
])

/**
 * Key suffixes that make a key identifying regardless of prefix, so
 * `trackName` and `sourceFilename` are caught alongside `name` and
 * `filename`. Catches `codecName` too — that is accepted over-redaction;
 * the codec is reported under the `codec` key instead.
 */
const DENIED_SUFFIXES = ['filename', 'filepath', 'path', 'url', 'name', 'title', 'label']

/** A string that looks like a filesystem path or a media file. */
const PATH_LIKE = /[/\\][^/\\]+|\.(mp4|mov|mkv|webm|m4v|avi|wav|mp3|m4a|aac|flac|vtt|srt)$/i

const MAX_DEPTH = 6
const MAX_ARRAY = 50
const MAX_STRING = 500

export const REDACTED = '[redacted]'

function isBinary(value: unknown): boolean {
  return (
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    (typeof Blob !== 'undefined' && value instanceof Blob)
  )
}

function binaryMarker(value: unknown): string {
  if (value instanceof ArrayBuffer) return `[binary: ${value.byteLength} bytes]`
  if (ArrayBuffer.isView(value)) return `[binary: ${value.byteLength} bytes]`
  if (typeof Blob !== 'undefined' && value instanceof Blob) return `[binary: ${value.size} bytes]`
  return '[binary]'
}

function keyIsDenied(key: string): boolean {
  const lower = key.toLowerCase()
  if (DENIED_KEYS.has(lower)) return true
  return DENIED_SUFFIXES.some((suffix) => lower.endsWith(suffix))
}

/**
 * Returns a copy of `value` safe to place in a diagnostics bundle.
 *
 * @param value - Any JSON-ish value. Binary and unknown object types are
 *   replaced with a shape marker rather than serialised.
 * @param depth - Internal recursion counter; callers pass nothing.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value
  if (depth > MAX_DEPTH) return '[depth limit]'

  if (isBinary(value)) return binaryMarker(value)

  if (typeof value === 'string') {
    if (PATH_LIKE.test(value)) return REDACTED
    return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…[truncated]` : value
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'function' || typeof value === 'symbol') return `[${typeof value}]`

  if (Array.isArray(value)) {
    const capped = value.slice(0, MAX_ARRAY).map((item) => redact(item, depth + 1))
    if (value.length > MAX_ARRAY) capped.push(`[+${value.length - MAX_ARRAY} more]`)
    return capped
  }

  if (value instanceof Error) {
    return { name: value.name, message: redact(value.message, depth + 1), stack: value.stack }
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = keyIsDenied(key) ? REDACTED : redact(item, depth + 1)
    }
    return out
  }

  return '[unserialisable]'
}
