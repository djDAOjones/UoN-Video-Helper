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

import type { ContentClass } from '../config/presets'

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

/** States the bitrate-budget figure as guidance rather than false precision. */
export function formatOutputSizeGuidance(bytes: number): string {
  const size = formatFileSize(bytes)
  return size === 'unknown' ? 'Could not be estimated' : `Allow up to about ${size}`
}

/** Explains the derived picture class without exposing bitrate terminology. */
export function formatContentClass(contentClass: ContentClass): string {
  switch (contentClass) {
    case 'screen':
      return 'Mostly slides or screen content'
    case 'camera':
      return 'Mostly camera or moving picture'
    case 'unknown':
      return 'Mixed or unclear — using the safer quality setting'
  }
}

/** e.g. `1920 × 1080`. Uses a real multiplication sign, not a letter x. */
export function formatResolution(width: number, height: number): string {
  return `${Math.round(width)} × ${Math.round(height)}`
}

/** e.g. `25 fps`, `29.97 fps`. Trailing zeros are noise. */
export function formatFrameRate(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return 'unknown'
  const rounded = Math.round(rate * 100) / 100
  return `${rounded} fps`
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

/** e.g. `Stereo`, `Mono`, `5.1 surround`, `4 channels`. */
export function formatChannels(count: number): string {
  switch (count) {
    case 1:
      return 'Mono'
    case 2:
      return 'Stereo'
    case 6:
      return '5.1 surround'
    case 8:
      return '7.1 surround'
    default:
      return `${count} channels`
  }
}
