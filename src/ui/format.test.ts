import { describe, expect, it } from 'vitest'

import {
  formatChannels,
  formatCodec,
  formatContentClass,
  formatDuration,
  formatFileSize,
  formatFrameRate,
  formatOutputSizeGuidance,
  formatResolution,
  formatTimeEstimate,
} from './format'

describe('formatContentClass', () => {
  it('states the classification and explains the conservative fallback', () => {
    expect(formatContentClass('screen')).toBe('Mostly slides or screen content')
    expect(formatContentClass('camera')).toBe('Mostly camera or moving picture')
    expect(formatContentClass('unknown')).toBe('Mixed or unclear — using the safer quality setting')
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
})

describe('formatTimeEstimate', () => {
  it('uses a grammatical phrase at the sub-second boundary', () => {
    expect(formatTimeEstimate(0.4)).toBe('Less than a second')
    expect(formatTimeEstimate(252)).toBe('About 4 minutes 12 seconds')
  })

  it('does not put an invalid duration into a sentence', () => {
    expect(formatTimeEstimate(Number.NaN)).toBe('Time could not be estimated')
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

describe('formatOutputSizeGuidance', () => {
  it('describes a cautious planning figure instead of claiming a prediction', () => {
    expect(formatOutputSizeGuidance(340_000_000)).toBe('Allow up to about 340 MB')
  })

  it('does not put an invalid number into a sentence', () => {
    expect(formatOutputSizeGuidance(Number.NaN)).toBe('Could not be estimated')
  })
})

describe('formatFrameRate', () => {
  it('keeps NTSC rates exact and integer rates clean', () => {
    expect(formatFrameRate(25)).toBe('25 fps')
    expect(formatFrameRate(29.97)).toBe('29.97 fps')
    expect(formatFrameRate(30.000001)).toBe('30 fps')
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
    expect(formatChannels(1)).toBe('Mono')
    expect(formatChannels(2)).toBe('Stereo')
    expect(formatChannels(6)).toBe('5.1 surround')
    expect(formatChannels(3)).toBe('3 channels')
  })
})
