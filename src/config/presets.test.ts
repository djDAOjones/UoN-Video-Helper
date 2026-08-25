import { describe, expect, it } from 'vitest'

import {
  PRESETS,
  bitrateWasCappedToSource,
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

/**
 * VH-41: spec 6.2's never-exceed-source cap.
 *
 * The figures are the real ones, measured across the corpus on 2026-08-25 and
 * recorded in `tickets/VH-43.md`. They are named rather than inlined because
 * the whole defect was a preset asking for more than a real file carries.
 */
describe('never exceeding the source bitrate', () => {
  /** Teams meeting recording: 1920x1080, 16.000 fps, 1.006 Mbps of video. */
  const TEAMS = { width: 1920, height: 1080, frameRate: 16, videoBitrateBps: 1_006_000 }
  /** Engineering Placements briefing: a Mac export carrying 2.08 Mbps. */
  const MAC_EXPORT = { width: 1920, height: 1080, frameRate: 25, videoBitrateBps: 2_080_000 }

  it('does not inflate the Teams recording, which is the whole defect', () => {
    const shape = outputShapeFor(PRESETS.smaller, TEAMS)
    expect(shape.requestedVideoBitrateBps).toBeGreaterThan(1_006_000)
    expect(shape.videoBitrateBps).toBe(1_006_000)
    expect(bitrateWasCappedToSource(shape)).toBe(true)
  })

  it('caps the second real case too', () => {
    const shape = outputShapeFor(PRESETS.smaller, MAC_EXPORT)
    expect(shape.videoBitrateBps).toBe(2_080_000)
    expect(bitrateWasCappedToSource(shape)).toBe(true)
  })

  it('leaves a generous source alone — the cap is a ceiling, not a target', () => {
    const shape = outputShapeFor(PRESETS.smaller, { ...TEAMS, videoBitrateBps: 20_000_000 })
    expect(shape.videoBitrateBps).toBe(shape.requestedVideoBitrateBps)
    expect(bitrateWasCappedToSource(shape)).toBe(false)
  })

  it("does not apply the cap to best quality, and that asymmetry is the spec's", () => {
    // Best quality goes where the file is re-encoded on ingest; headroom above
    // the source is what stops a second generation showing.
    const shape = outputShapeFor(PRESETS.best, TEAMS)
    expect(shape.videoBitrateBps).toBeGreaterThan(1_006_000)
    expect(bitrateWasCappedToSource(shape)).toBe(false)
  })

  it('does not guess when the source bitrate could not be measured', () => {
    for (const unmeasured of [undefined, null, 0]) {
      const shape = outputShapeFor(PRESETS.smaller, { ...TEAMS, videoBitrateBps: unmeasured })
      expect(shape.videoBitrateBps).toBe(shape.requestedVideoBitrateBps)
      expect(bitrateWasCappedToSource(shape)).toBe(false)
    }
  })

  it('shrinks the projected size along with the capped bitrate', () => {
    // The estimate must follow the cap, or the storage check and the figure the
    // user decides on would both describe a bitrate nothing will ask for.
    const capped = outputShapeFor(PRESETS.smaller, TEAMS)
    const uncapped = outputShapeFor(PRESETS.smaller, { ...TEAMS, videoBitrateBps: null })
    expect(projectedOutputBytes(capped, 60)).toBeLessThan(projectedOutputBytes(uncapped, 60))
  })

  it('asks the encoder for the capped figure, not the requested one', () => {
    const shape = outputShapeFor(PRESETS.smaller, TEAMS)
    expect(videoEncoderConfigFor(shape).bitrate).toBe(1_006_000)
  })
})
