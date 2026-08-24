import { describe, expect, it } from 'vitest'

import {
  PRESETS,
  outputShapeFor,
  projectedOutputBytes,
  videoEncoderConfigFor,
} from './presets'

const source1080p30 = { width: 1920, height: 1080, frameRate: 30 }

describe('best quality preset', () => {
  it('leaves resolution and frame rate alone', () => {
    const shape = outputShapeFor(PRESETS.best, { width: 3840, height: 2160, frameRate: 60 })
    expect(shape.width).toBe(3840)
    expect(shape.height).toBe(2160)
    expect(shape.frameRate).toBe(60)
  })

  it('lands near the 8 Mbps the spec quotes for 1080p30', () => {
    const shape = outputShapeFor(PRESETS.best, source1080p30)
    expect(shape.videoBitrateBps).toBeGreaterThan(7_000_000)
    expect(shape.videoBitrateBps).toBeLessThan(8_000_000)
  })
})

describe('smaller file preset', () => {
  it('PRESERVES resolution up to 1080p — the point of the preset', () => {
    // Rationale 4.1: halving resolution is the single most damaging thing that
    // could be done to slide content. The saving comes from bitrate instead.
    const shape = outputShapeFor(PRESETS.smaller, source1080p30)
    expect(shape.width).toBe(1920)
    expect(shape.height).toBe(1080)
  })

  it('reduces only above 1080p', () => {
    const shape = outputShapeFor(PRESETS.smaller, { width: 3840, height: 2160, frameRate: 30 })
    expect(shape.height).toBe(1080)
    expect(shape.width).toBe(1920)
  })

  it('caps frame rate at 30', () => {
    expect(outputShapeFor(PRESETS.smaller, { ...source1080p30, frameRate: 60 }).frameRate).toBe(30)
  })

  it('spends less on screen content than on camera motion', () => {
    const screen = outputShapeFor(PRESETS.smaller, source1080p30, 'screen')
    const camera = outputShapeFor(PRESETS.smaller, source1080p30, 'camera')
    expect(screen.videoBitrateBps).toBeCloseTo(1_500_000, -4)
    expect(camera.videoBitrateBps).toBeCloseTo(2_500_000, -4)
    expect(screen.videoBitrateBps).toBeLessThan(camera.videoBitrateBps)
  })

  it('assumes the higher bitrate while content is unknown', () => {
    // Guessing "slides" on camera footage visibly damages it; the reverse only
    // costs file size.
    const unknown = outputShapeFor(PRESETS.smaller, source1080p30, 'unknown')
    const camera = outputShapeFor(PRESETS.smaller, source1080p30, 'camera')
    expect(unknown.videoBitrateBps).toBe(camera.videoBitrateBps)
  })

  it('is markedly smaller than best quality at the same resolution', () => {
    const best = outputShapeFor(PRESETS.best, source1080p30)
    const smaller = outputShapeFor(PRESETS.smaller, source1080p30)
    expect(smaller.videoBitrateBps).toBeLessThan(best.videoBitrateBps / 2)
  })
})

describe('dimensions', () => {
  it('keeps both dimensions even, as H.264 chroma subsampling requires', () => {
    const shape = outputShapeFor(PRESETS.smaller, { width: 1442, height: 1081, frameRate: 25 })
    expect(shape.width % 2).toBe(0)
    expect(shape.height % 2).toBe(0)
  })

  it('preserves aspect ratio when scaling down', () => {
    const shape = outputShapeFor(PRESETS.smaller, { width: 3840, height: 2160, frameRate: 25 })
    expect(shape.width / shape.height).toBeCloseTo(16 / 9, 2)
  })

  it('handles a 4:3 legacy source', () => {
    const shape = outputShapeFor(PRESETS.smaller, { width: 1440, height: 1080, frameRate: 25 })
    expect(shape.width).toBe(1440)
    expect(shape.height).toBe(1080)
  })
})

describe('projectedOutputBytes', () => {
  it('over-estimates rather than under-estimates', () => {
    const shape = outputShapeFor(PRESETS.best, source1080p30)
    const bytes = projectedOutputBytes(shape, 3600)
    const naive = ((shape.videoBitrateBps + shape.audioBitrateBps) / 8) * 3600
    expect(bytes).toBeGreaterThan(naive)
  })

  it('projects roughly 3.4 GB for an hour at best quality 1080p30', () => {
    const bytes = projectedOutputBytes(outputShapeFor(PRESETS.best, source1080p30), 3600)
    expect(bytes / 1e9).toBeGreaterThan(3)
    expect(bytes / 1e9).toBeLessThan(4)
  })
})

describe('videoEncoderConfigFor', () => {
  it('asks for H.264 High profile in the AVC bitstream format', () => {
    const config = videoEncoderConfigFor(outputShapeFor(PRESETS.best, source1080p30))
    expect(config.codec).toMatch(/^avc1\.64/)
    expect(config.avc?.format).toBe('avc')
    expect(config.width).toBe(1920)
    expect(config.framerate).toBe(30)
  })
})
