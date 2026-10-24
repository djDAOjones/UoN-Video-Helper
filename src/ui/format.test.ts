import { describe, expect, it } from 'vitest'

import {
  formatChannels,
  formatClockTime,
  formatCodec,
  formatApproximateDuration,
  formatDuration,
  formatFileSize,
  formatFrameRate,
  formatResolution,
} from './format'

describe('formatClockTime (VH-128)', () => {
  it('happy path: minutes and seconds, then hours past an hour', () => {
    expect(formatClockTime(754)).toBe('12:34')
    expect(formatClockTime(3765)).toBe('1:02:45')
    expect(formatClockTime(36000)).toBe('10:00:00')
  })

  it('rounds to the nearest second, the way a trimmed range lands', () => {
    expect(formatClockTime(54.07)).toBe('0:54')
    expect(formatClockTime(59.5)).toBe('1:00')
    expect(formatClockTime(3599.6)).toBe('1:00:00')
  })

  it('edge: nothing, or less, reads as no time at all', () => {
    expect(formatClockTime(0)).toBe('0:00')
    expect(formatClockTime(-3)).toBe('0:00')
  })
})

describe('formatDuration', () => {
  it('reads naturally at every scale a lecture recording reaches', () => {
    expect(formatDuration(0.4)).toBe('less than a second')
    expect(formatDuration(1)).toBe('1 second')
    expect(formatDuration(38)).toBe('38 seconds')
    expect(formatDuration(60)).toBe('1 minute')
    expect(formatDuration(252)).toBe('4 minutes 12 seconds')
    expect(formatDuration(3600)).toBe('1 hour')
    expect(formatDuration(5000)).toBe('1 hour 23 minutes')
    expect(formatDuration(7260)).toBe('2 hours 1 minute')
  })

  it('says unknown rather than NaN', () => {
    expect(formatDuration(Number.NaN)).toBe('unknown')
    expect(formatDuration(-5)).toBe('unknown')
  })

  it('starts with a capital alone, as every other value does, and not in a sentence (VH-186)', () => {
    expect(formatDuration(Number.NaN, 'alone')).toBe('Unknown')
    expect(formatDuration(0.4, 'alone')).toBe('Less than a second')
    expect(formatDuration(0.4, 'in-sentence')).toBe('less than a second')
    expect(formatDuration(90, 'alone')).toBe(formatDuration(90))
    expect(formatFileSize(Number.NaN, 'alone')).toBe('Unknown')
    expect(formatFrameRate(0, 'alone')).toBe('Unknown')
    expect(formatCodec(null, 'alone')).toBe('Unknown')
    expect(formatCodec('avc', 'alone')).toBe('H.264')
  })
})

describe('formatApproximateDuration (VH-109)', () => {
  it('rounds an estimate to what it can claim', () => {
    expect(formatApproximateDuration(3)).toBe('a few seconds')
    expect(formatApproximateDuration(24)).toBe('20 seconds')
    expect(formatApproximateDuration(37)).toBe('40 seconds')
    expect(formatApproximateDuration(320)).toBe('5 minutes')
    expect(formatApproximateDuration(402)).toBe('7 minutes')
    expect(formatApproximateDuration(45 * 60)).toBe('45 minutes')
    expect(formatApproximateDuration(47 * 60)).toBe('45 minutes')
    expect(formatApproximateDuration(3 * 60 * 60 + 100)).toBe('3 hours')
    expect(formatApproximateDuration(Number.NaN)).toBe('unknown')
  })
})

describe('formatFileSize', () => {
  it('agrees with what the operating system would show', () => {
    expect(formatFileSize(512)).toBe('512 bytes')
    expect(formatFileSize(340_000_000)).toBe('340 MB')
    expect(formatFileSize(1_200_000_000)).toBe('1.2 GB')
    expect(formatFileSize(3_600_000_000)).toBe('3.6 GB')
  })

  it('drops the decimal once the number is large enough not to need it', () => {
    expect(formatFileSize(150_000_000)).toBe('150 MB')
  })
})

describe('formatFrameRate', () => {
  it('keeps NTSC rates exact and integer rates clean', () => {
    expect(formatFrameRate(25)).toBe('25 frames a second')
    expect(formatFrameRate(29.97)).toBe('29.97 frames a second')
    expect(formatFrameRate(30.000001)).toBe('30 frames a second')
  })
})

describe('formatCodec', () => {
  it('uses the name a person would recognise', () => {
    expect(formatCodec('avc')).toBe('H.264')
    expect(formatCodec('aac')).toBe('AAC')
    expect(formatCodec('hevc')).toBe('H.265')
  })

  it('falls back to the slug rather than showing nothing', () => {
    expect(formatCodec('somethingnew')).toBe('SOMETHINGNEW')
    expect(formatCodec(null)).toBe('unknown')
  })
})

describe('formatResolution and formatChannels', () => {
  it('formats the way a spec sheet would', () => {
    expect(formatResolution(1920, 1080)).toBe('1920 × 1080')
    expect(formatChannels(1)).toBe('Mono (one channel)')
    expect(formatChannels(2)).toBe('Stereo (two channels)')
    expect(formatChannels(6)).toBe('5.1 surround')
    expect(formatChannels(3)).toBe('3 channels')
  })
})
