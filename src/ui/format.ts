/**
 * Turning technical facts into the words a novice reads.
 *
 * Spec section 9.2: plain language, user terms not implementation terms. The
 * audience is a lecturer who wants to know whether their video is going to be
 * fine, not what `avc1.640028` means.
 *
 * Numbers are written by the browser's own `Intl` for the page's current
 * language (VH-105), with the precision policy kept explicit here so a change
 * of language never changes what a figure claims. Pure, so the wording is
 * testable rather than a matter of opinion discovered at review time.
 */

import { ESTIMATE_ROUNDING } from '../config/thresholds'
import { locale, t } from '../i18n'
import { durationFormatter, durationParts, unitFormatter, type DurationParts } from '../i18n/intl'

// Its own module, free of the language tables, so the worker can print by it (VH-215).
export { formatClockTime } from './clock-time'

/** One duration formatter per language, built on first use. */
const durationFormatters = new Map<string, (parts: DurationParts) => string>()

function formatParts(parts: DurationParts): string {
  const tag = locale()
  let formatter = durationFormatters.get(tag)
  if (!formatter) {
    formatter = durationFormatter(tag, t().meta.durationList)
    durationFormatters.set(tag, formatter)
  }
  return formatter(parts)
}

/**
 * Where a value stands. Alone, as a Video properties row's whole value, the
 * words for a fact not read start with a capital, as every other value does;
 * inside a sentence they do not (VH-186). A trim handle's spoken place keeps
 * the in-sentence form, lower-case beside "the beginning" and "the end".
 */
export type Placement = 'alone' | 'in-sentence'

/** "unknown", or "Unknown" alone. */
function unknownWords(placement: Placement): string {
  return placement === 'alone' ? t().format.alone.unknown : t().format.unknown
}

/** e.g. `1 hour, 23 minutes`, `4 minutes, 12 seconds`, `38 seconds`. */
export function formatDuration(seconds: number, placement: Placement = 'in-sentence'): string {
  if (!Number.isFinite(seconds) || seconds < 0) return unknownWords(placement)
  if (Math.round(seconds) < 1) {
    return placement === 'alone' ? t().format.alone.lessThanASecond : t().format.lessThanASecond
  }
  return formatParts(durationParts(seconds))
}

/** An estimate, as a kind rather than words, so nothing branches on a translated string. */
export type ApproximateDuration =
  | { readonly kind: 'unknown' }
  | { readonly kind: 'few-seconds' }
  | { readonly kind: 'about'; readonly seconds: number }

/**
 * An estimate, rounded to what it can honestly claim (U-22): "about 5
 * minutes", never "5 minutes 20 seconds" from a probe that differs by a
 * quarter between two loads of one file. The bands are
 * {@link ESTIMATE_ROUNDING}'s; a rounding never reaches zero.
 */
export function approximateDuration(seconds: number): ApproximateDuration {
  if (!Number.isFinite(seconds) || seconds < 0) return { kind: 'unknown' }
  if (seconds < ESTIMATE_ROUNDING.fewSecondsBelow) return { kind: 'few-seconds' }
  const band =
    ESTIMATE_ROUNDING.bands.find((candidate) => seconds < candidate.belowSeconds) ??
    ESTIMATE_ROUNDING.bands[ESTIMATE_ROUNDING.bands.length - 1]!
  const step = band.stepSeconds
  return { kind: 'about', seconds: Math.max(step, Math.round(seconds / step) * step) }
}

/** {@link approximateDuration} in words: "a few seconds", "5 minutes". */
export function formatApproximateDuration(seconds: number): string {
  const estimate = approximateDuration(seconds)
  if (estimate.kind === 'unknown') return t().format.unknown
  if (estimate.kind === 'few-seconds') return t().format.fewSeconds
  return formatDuration(estimate.seconds)
}

const SIZE_UNITS = ['kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const

/**
 * e.g. `1.2 GB`, `340 MB`.
 *
 * Decimal units, because that is what every operating system and every upload
 * dialogue the user has ever seen reports. Being technically correct with MiB
 * here would just make the number disagree with Finder. One decimal below a
 * hundred of a unit, none above, whole bytes under a thousand.
 */
export function formatFileSize(bytes: number, placement: Placement = 'in-sentence'): string {
  if (!Number.isFinite(bytes) || bytes < 0) return unknownWords(placement)
  if (bytes < 1000) return unitFormatter(locale(), 'byte', { unitDisplay: 'long', maximumFractionDigits: 0 })(Math.round(bytes))
  let value = bytes / 1000
  let unit = 0
  while (value >= 1000 && unit < SIZE_UNITS.length - 1) {
    value /= 1000
    unit++
  }
  return unitFormatter(locale(), SIZE_UNITS[unit]!, { maximumFractionDigits: value >= 100 ? 0 : 1 })(value)
}

/** e.g. `1920 × 1080`. A real multiplication sign, not a letter x; no digit grouping. */
export function formatResolution(width: number, height: number): string {
  return t().format.resolution({ width: String(Math.round(width)), height: String(Math.round(height)) })
}

/** e.g. `25 frames a second`, `29.97 frames a second`. Trailing zeros are noise. */
export function formatFrameRate(rate: number, placement: Placement = 'in-sentence'): string {
  if (!Number.isFinite(rate) || rate <= 0) return unknownWords(placement)
  // Said in words rather than as "fps" (spec 9.2, A-10): plainer than an
  // abbreviation with a meaning beside it.
  return t().format.frameRate({ rate: Math.round(rate * 100) / 100 })
}

/**
 * Codec identifiers in words.
 *
 * Mediabunny's codec strings are short slugs (`avc`, `aac`). Anything not in
 * this map falls through to the slug uppercased, which is still better than
 * showing nothing — and a codec we do not recognise is one we probably cannot
 * handle anyway, which the decode check will say separately. Proper names,
 * the same in every language.
 */
const CODEC_NAMES: Readonly<Record<string, string>> = {
  avc: 'H.264',
  hevc: 'H.265',
  vp8: 'VP8',
  vp9: 'VP9',
  av1: 'AV1',
  prores: 'ProRes',
  aac: 'AAC',
  opus: 'Opus',
  mp3: 'MP3',
  vorbis: 'Vorbis',
  flac: 'FLAC',
  ac3: 'Dolby Digital',
  eac3: 'Dolby Digital Plus',
}

export function formatCodec(codec: string | null, placement: Placement = 'in-sentence'): string {
  if (!codec) return unknownWords(placement)
  return CODEC_NAMES[codec] ?? codec.toUpperCase()
}

/** e.g. `Stereo (two channels)`, `Mono (one channel)`, `5.1 surround`, `4 channels`. */
export function formatChannels(count: number): string {
  const { channels } = t().format
  switch (count) {
    case 1:
      return channels.mono
    case 2:
      return channels.stereo
    case 6:
      return channels.surround51
    case 8:
      return channels.surround71
    default:
      return channels.several({ count })
  }
}
