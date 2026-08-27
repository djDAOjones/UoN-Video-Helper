/**
 * VH-72 / P2-02 residual. Pre-flight asks `VideoEncoder.isConfigSupported`
 * about one codec string and production used to let Mediabunny derive its own,
 * so the two could disagree about what was being encoded.
 *
 * They disagree in a specific way. Mediabunny's `buildVideoCodecString` picks
 * the AVC level from macroblock count and bitrate and never looks at frame
 * rate, so 4K60 gets the same level as 4K30 — Level 5.1, which ITU-T H.264
 * Table A-1 caps at 983,040 macroblocks a second against the 1,944,000 that
 * 4K60 needs.
 *
 * The harm is narrower than it first looks, and worth stating so nobody
 * re-litigates it. Measured in Chrome on 2026-08-27, the encoder treats the
 * requested level as a floor: asked for 5.1 at 4K60 it still writes an avcC
 * declaring 5.2, and asked for 4.2 at 852x480 it writes 3.1. No malformed
 * file was ever produced. What was wrong is that `isConfigSupported` vetted a
 * configuration the encoder never received, so pre-flight's "yes" was about
 * something else.
 */

import { describe, expect, it } from 'vitest'

import { PRESETS, outputShapeFor, videoEncoderConfigFor } from '../config/presets'
import { videoEncodingConfigFor } from './encoding'

const shapeFor = (width: number, height: number, frameRate: number) =>
  outputShapeFor(PRESETS.best, {
    width,
    height,
    frameRate,
    videoBitrateBps: null,
    sourceFrameRate: frameRate,
  })

describe('one codec string for pre-flight and production', () => {
  const cases = [
    ['4K60', 3840, 2160, 60],
    ['4K30', 3840, 2160, 30],
    ['1080p60', 1920, 1080, 60],
    ['1080p30', 1920, 1080, 30],
    ['720p30', 1280, 720, 30],
  ] as const

  it.each(cases)('%s validates and encodes the same string', (_name, w, h, fps) => {
    const shape = shapeFor(w, h, fps)
    expect(videoEncodingConfigFor(shape).fullCodecString).toBe(videoEncoderConfigFor(shape).codec)
  })

  it('separates 4K60 from 4K30, which is the whole point', () => {
    // Identical macroblock count, different throughput. A level chosen without
    // the frame rate cannot tell these apart, and that is the defect.
    const uhd60 = videoEncodingConfigFor(shapeFor(3840, 2160, 60)).fullCodecString
    const uhd30 = videoEncodingConfigFor(shapeFor(3840, 2160, 30)).fullCodecString
    expect(uhd60).toBe('avc1.640034') // Level 5.2
    expect(uhd30).toBe('avc1.640033') // Level 5.1
    expect(uhd60).not.toBe(uhd30)
  })

  it('still asks Mediabunny for the abstract codec it expects', () => {
    // `fullCodecString` is an override, not a replacement: the docs require it
    // to match `codec`, and Mediabunny keys its muxing on the abstract name.
    const config = videoEncodingConfigFor(shapeFor(1920, 1080, 30))
    expect(config.codec).toBe('avc')
    expect(config.fullCodecString?.startsWith('avc1.')).toBe(true)
  })
})
