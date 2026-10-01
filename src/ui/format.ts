/**
 * Turning technical facts into the words a novice reads.
 *
 * Spec section 9.2: plain language, user terms not implementation terms. The
 * audience is a lecturer who wants to know whether their video is going to be
 * fine, not what `avc1.640028` means.
 *
 * Pure functions, so the wording is testable rather than a matter of opinion
 * discovered at review time.
 */

import { ESTIMATE_ROUNDING } from '../config/thresholds'

/** e.g. `1 hour 23 minutes`, `4 minutes 12 seconds`, `38 seconds`. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return 'unknown'
  const whole = Math.round(seconds)
  if (whole < 1) return 'less than a second'

  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const remainder = whole % 60

  const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'}`

  if (hours > 0) {
    return minutes > 0
      ? `${plural(hours, 'hour')} ${plural(minutes, 'minute')}`
      : plural(hours, 'hour')
  }
  if (minutes > 0) {
    return remainder > 0
      ? `${plural(minutes, 'minute')} ${plural(remainder, 'second')}`
      : plural(minutes, 'minute')
  }
  return plural(remainder, 'second')
}

/**
 * An estimate, rounded to what it can honestly claim (U-22): "about 5
 * minutes", never "5 minutes 20 seconds" from a probe that differs by a
 * quarter between two loads of one file. The bands are
 * {@link ESTIMATE_ROUNDING}'s; a rounding never reaches zero.
 */
export function formatApproximateDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return 'unknown'
  if (seconds < ESTIMATE_ROUNDING.fewSecondsBelow) return 'a few seconds'
  const band =
    ESTIMATE_ROUNDING.bands.find((candidate) => seconds < candidate.belowSeconds) ??
    ESTIMATE_ROUNDING.bands[ESTIMATE_ROUNDING.bands.length - 1]!
  const step = band.stepSeconds
  return formatDuration(Math.max(step, Math.round(seconds / step) * step))
}

/**
 * e.g. `1.2 GB`, `340 MB`.
 *
 * Decimal units, because that is what every operating system and every upload
 * dialogue the user has ever seen reports. Being technically correct with MiB
 * here would just make the number disagree with Finder.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return 'unknown'
  if (bytes < 1000) return `${Math.round(bytes)} bytes`
  const units = ['kB', 'MB', 'GB', 'TB']
  let value = bytes / 1000
  let unit = 0
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000
    unit++
  }
  return `${value >= 100 ? Math.round(value) : Number(value.toFixed(1))} ${units[unit]}`
}

/** e.g. `1920 × 1080`. Uses a real multiplication sign, not a letter x. */
export function formatResolution(width: number, height: number): string {
  return `${Math.round(width)} × ${Math.round(height)}`
}

/** e.g. `25 frames a second`, `29.97 frames a second`. Trailing zeros are noise. */
export function formatFrameRate(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return 'unknown'
  const rounded = Math.round(rate * 100) / 100
  // Said in words rather than as "fps" (spec 9.2, A-10): plainer than an
  // abbreviation with a meaning beside it.
  return `${rounded} frames a second`
}

/**
 * Codec identifiers in words.
 *
 * Mediabunny's codec strings are short slugs (`avc`, `aac`). Anything not in
 * this map falls through to the slug uppercased, which is still better than
 * showing nothing — and a codec we do not recognise is one we probably cannot
 * handle anyway, which the decode check will say separately.
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

export function formatCodec(codec: string | null): string {
  if (!codec) return 'unknown'
  return CODEC_NAMES[codec] ?? codec.toUpperCase()
}

/** e.g. `Stereo (two channels)`, `Mono (one channel)`, `5.1 surround`, `4 channels`. */
export function formatChannels(count: number): string {
  switch (count) {
    case 1:
      return 'Mono (one channel)'
    case 2:
      return 'Stereo (two channels)'
    case 6:
      return '5.1 surround'
    case 8:
      return '7.1 surround'
    default:
      return `${count} channels`
  }
}
