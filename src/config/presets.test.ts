import { describe, expect, it } from 'vitest'

import {
  PRESETS,
  avcLevelFor,
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

  it('is markedly smaller than best quality when neither consults the source', () => {
    // Scoped deliberately to the unmeasured fixture. Once a source bitrate is
    // present the two presets converge — VH-41 caps this one AT the source
    // while VH-47 blends the other DOWN toward it — and they meet at exactly a
    // factor of two wherever both bounds bind, so a `/ 2` strict inequality is
    // false. The ordering invariant that holds in every case is pinned in
    // "anchoring best quality to the source".
    const best = outputShapeFor(PRESETS.best, source1080p30)
    const smaller = outputShapeFor(PRESETS.smaller, source1080p30)
    expect(best.bitrateBasis).toBe('preset')
    expect(smaller.bitrateBasis).toBe('preset')
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
    const bytes = projectedOutputBytes(shape, 3600, true)
    const naive = ((shape.videoBitrateBps + shape.audioBitrateBps) / 8) * 3600
    expect(bytes).toBeGreaterThan(naive)
  })

  it('projects roughly 3.4 GB for an hour at best quality 1080p30', () => {
    const bytes = projectedOutputBytes(outputShapeFor(PRESETS.best, source1080p30), 3600, true)
    expect(bytes / 1e9).toBeGreaterThan(3)
    expect(bytes / 1e9).toBeLessThan(4)
  })

  it('does not charge a silent source for an audio track it will not contain', () => {
    const shape = outputShapeFor(PRESETS.smaller, source1080p30)
    const durationSeconds = 4
    expect(projectedOutputBytes(shape, durationSeconds, false)).toBe(
      Math.round((shape.videoBitrateBps / 8) * durationSeconds * 1.02),
    )
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
 * Real corpus sources, re-measured with ffprobe on 2026-08-25 rather than taken
 * on trust: packet sizes summed over the video stream, divided by the stream
 * duration. `samples/` is gitignored, so these figures ARE the record — nobody
 * without the corpus can re-derive them, which is why each names its file.
 *
 * `frameRate` is the CONFORMED rate the pipeline will use; `sourceFrameRate` is
 * what the file actually runs at. They differ on the PowerPoint exports and
 * that difference is load-bearing: a bitrate divided by the wrong rate misreads
 * the source's density by exactly that ratio.
 */
const CORPUS = {
  /** `Meeting with Joe Bell…` — Teams, 28081 packets over 1755.008 s = 16.000 fps. */
  teams: {
    width: 1920,
    height: 1080,
    frameRate: 16,
    sourceFrameRate: 16,
    videoBitrateBps: 1_005_714,
  },
  /** `AMCS3068 North American Film Adaptations 2023.mov` — the thinnest in the corpus. */
  amcs3068: {
    width: 1920,
    height: 1080,
    frameRate: 30,
    sourceFrameRate: 30,
    videoBitrateBps: 484_914,
  },
  /** `Engineering Placements…` — a PowerPoint export at 1000/33, conforming to 30. */
  placements: {
    width: 1920,
    height: 1080,
    frameRate: 30,
    sourceFrameRate: 1000 / 33,
    videoBitrateBps: 2_084_821,
  },
  /** `Paul Smith NSS 2026-01-21.mp4` — 17.3 Mbps at 1080p25, far above the anchor. */
  paulSmith: {
    width: 1920,
    height: 1080,
    frameRate: 25,
    sourceFrameRate: 25,
    videoBitrateBps: 17_295_540,
  },
  /** `Nonreligion 1 v3.mp4` — 19.1 Mbps at 4K25; blends DOWN without hitting the ceiling. */
  nonreligion: {
    width: 3840,
    height: 2160,
    frameRate: 25,
    sourceFrameRate: 25,
    videoBitrateBps: 19_105_327,
  },
} as const

/**
 * VH-41: spec 6.2's never-exceed-source cap, on "Smaller file".
 *
 * The whole defect was a preset asking for more than a real file carries, so
 * every figure here is a real file's.
 */
describe('never exceeding the source bitrate', () => {
  it('does not inflate the Teams recording, which is the whole defect', () => {
    const shape = outputShapeFor(PRESETS.smaller, CORPUS.teams)
    expect(shape.requestedVideoBitrateBps).toBeGreaterThan(1_005_714)
    expect(shape.videoBitrateBps).toBe(1_005_714)
    expect(shape.bitrateBasis).toBe('capped-to-source')
    expect(bitrateWasCappedToSource(shape)).toBe(true)
  })

  it('caps the second real case too', () => {
    // The frame rate here was wrong until 2026-08-25 — 25, where the file
    // measures 1000/33 and conforms to 30. At 25 the assertion cleared the cap
    // by 3,333 bps (0.16%) and would have flipped on any nudge to the
    // reference figure; at the real rate it clears by 420,000.
    const shape = outputShapeFor(PRESETS.smaller, CORPUS.placements)
    expect(shape.videoBitrateBps).toBe(2_084_821)
    expect(shape.bitrateBasis).toBe('capped-to-source')
  })

  it('leaves a generous source alone — the cap is a ceiling, not a target', () => {
    const shape = outputShapeFor(PRESETS.smaller, {
      ...CORPUS.teams,
      videoBitrateBps: 20_000_000,
    })
    expect(shape.videoBitrateBps).toBe(shape.requestedVideoBitrateBps)
    expect(bitrateWasCappedToSource(shape)).toBe(false)
  })

  it('does not guess when the source bitrate could not be measured', () => {
    for (const unmeasured of [undefined, null, 0]) {
      const shape = outputShapeFor(PRESETS.smaller, {
        ...CORPUS.teams,
        videoBitrateBps: unmeasured,
      })
      expect(shape.videoBitrateBps).toBe(shape.requestedVideoBitrateBps)
      expect(shape.bitrateBasis).toBe('preset')
      expect(bitrateWasCappedToSource(shape)).toBe(false)
    }
  })

  it('shrinks the projected size along with the capped bitrate', () => {
    // The estimate must follow the cap, or the storage check and the figure the
    // user decides on would both describe a bitrate nothing will ask for.
    const capped = outputShapeFor(PRESETS.smaller, CORPUS.teams)
    const uncapped = outputShapeFor(PRESETS.smaller, { ...CORPUS.teams, videoBitrateBps: null })
    expect(projectedOutputBytes(capped, 60, true)).toBeLessThan(
      projectedOutputBytes(uncapped, 60, true),
    )
  })

  it('asks the encoder for the capped figure, not the requested one', () => {
    const shape = outputShapeFor(PRESETS.smaller, CORPUS.teams)
    expect(videoEncoderConfigFor(shape).bitrate).toBe(1_005_714)
  })
})

/**
 * VH-47: spec 6.1's source-anchored band, on "Best quality".
 *
 * The preset is exempt from VH-41's CAP — re-encoding at exactly the source
 * bitrate compounds the first encoder's artefacts — but it was exempt from
 * looking at the source at all, which made its headroom meaningless: 4.0x for
 * the file with nothing left to protect, 0.37x for a pristine master.
 *
 * The rule may only ever LOWER the figure. That is measured rather than
 * cautious: raising a well-encoded master toward its own density was scored
 * with real encodes and costs up to 933 MB per file for +0.60 VMAF against a
 * roughly 6-point just-noticeable difference. See decision-log 2026-08-25.
 */
describe('anchoring best quality to the source', () => {
  it('halves the ask on the Teams recording — the headline case', () => {
    const shape = outputShapeFor(PRESETS.best, CORPUS.teams)
    expect(shape.videoBitrateBps).toBe(2_001_015)
    expect(shape.requestedVideoBitrateBps).toBe(3_981_312)
    expect(shape.bitrateBasis).toBe('blended-with-source')
    // Still nearly 2x the source: headroom, not a cap.
    expect(shape.videoBitrateBps / 1_005_714).toBeGreaterThan(1.9)
  })

  it("never reports the smaller preset's cap message on best quality", () => {
    // The regression guard for an inversion this nearly shipped with: while
    // `bitrateWasCappedToSource` compared the two figures, best quality
    // reported TRUE (3,981,312 > 2,001,015) and the pre-flight panel announced
    // "already compressed as far as this setting would take it" about an output
    // running at twice the source.
    for (const source of Object.values(CORPUS)) {
      expect(bitrateWasCappedToSource(outputShapeFor(PRESETS.best, source))).toBe(false)
    }
  })

  it('cuts the thinnest source in the corpus to a quarter of today', () => {
    const shape = outputShapeFor(PRESETS.best, CORPUS.amcs3068)
    expect(shape.videoBitrateBps).toBe(1_902_594)
    expect(shape.requestedVideoBitrateBps).toBe(7_464_960)
  })

  it('divides by the SOURCE rate, not the conformed one', () => {
    // Engineering Placements runs at 1000/33 and conforms to 30. Dividing by 30
    // would read its density 1% high; the error grows with the conform ratio and
    // reaches 15% on a 40 fps source conforming to 30.
    const correct = outputShapeFor(PRESETS.best, CORPUS.placements)
    const wrong = outputShapeFor(PRESETS.best, { ...CORPUS.placements, sourceFrameRate: 30 })
    expect(correct.videoBitrateBps).toBe(3_925_236)
    expect(wrong.videoBitrateBps).toBeGreaterThan(correct.videoBitrateBps)
  })

  it('holds at the anchor rather than raising a well-encoded master', () => {
    const shape = outputShapeFor(PRESETS.best, CORPUS.paulSmith)
    expect(shape.videoBitrateBps).toBe(6_220_800)
    expect(shape.videoBitrateBps).toBe(shape.requestedVideoBitrateBps)
    expect(shape.bitrateBasis).toBe('anchor-ceiling')
  })

  it('still blends down a 4K source that sits below the anchor', () => {
    const shape = outputShapeFor(PRESETS.best, CORPUS.nonreligion)
    expect(shape.videoBitrateBps).toBe(21_803_708)
    expect(shape.bitrateBasis).toBe('blended-with-source')
  })

  it('bounds a mis-measured source at the floor', () => {
    // Unreachable through the app — inspect.ts walks every packet — but it is
    // the guard that keeps a future packet budget from producing a prefix
    // average and a genuinely under-encoded output.
    const shape = outputShapeFor(PRESETS.best, { ...CORPUS.amcs3068, videoBitrateBps: 150_000 })
    expect(shape.videoBitrateBps).toBe(1_866_240)
    expect(shape.bitrateBasis).toBe('floor')
  })

  it('takes the fallback for every unmeasurable value, Infinity included', () => {
    // Infinity is the one that nearly slipped through: it is a number and it is
    // greater than zero, so a `typeof` guard admits it and the division that
    // follows yields Infinity.
    for (const unmeasured of [undefined, null, 0, Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      const shape = outputShapeFor(PRESETS.best, {
        ...CORPUS.amcs3068,
        videoBitrateBps: unmeasured,
      })
      expect(shape.videoBitrateBps).toBe(7_464_960)
      expect(shape.bitrateBasis).toBe('preset')
    }
  })

  it('NEVER asks for more than the preset alone would have', () => {
    // The safety property the whole design rests on. Because the figure can
    // only fall, no job that runs today can be refused tomorrow for storage it
    // suddenly needs, and no encoder config that is supported today can become
    // unsupported.
    for (const [w, h] of [
      [640, 480],
      [852, 480],
      [1280, 720],
      [1920, 1080],
      [3840, 2160],
      [3840, 2400],
    ]) {
      for (const fps of [16, 24, 25, 30, 50, 60]) {
        for (let src = 50_000; src <= 120_000_000; src *= 1.3) {
          const shape = outputShapeFor(PRESETS.best, {
            width: w!,
            height: h!,
            frameRate: fps,
            sourceFrameRate: fps,
            videoBitrateBps: src,
          })
          expect(shape.videoBitrateBps).toBeLessThanOrEqual(shape.requestedVideoBitrateBps)
        }
      }
    }
  })

  it('is never below what "Smaller file" would ask for the same source', () => {
    // Replaces the old `smaller < best / 2`, which held only because its
    // fixture carried no bitrate. Once one does, the two presets meet exactly
    // at a factor of two wherever both bounds bind, and a strict inequality is
    // false. The real invariant is ordering, not separation.
    for (const [w, h] of [
      [852, 480],
      [1280, 720],
      [1920, 1080],
      [3840, 2160],
    ]) {
      for (const fps of [16, 25, 30, 60]) {
        for (let src = 50_000; src <= 60_000_000; src *= 1.4) {
          const source = {
            width: w!,
            height: h!,
            frameRate: fps,
            sourceFrameRate: fps,
            videoBitrateBps: src,
          }
          const best = outputShapeFor(PRESETS.best, source)
          for (const content of ['screen', 'camera', 'unknown'] as const) {
            const smaller = outputShapeFor(PRESETS.smaller, source, content)
            expect(best.videoBitrateBps).toBeGreaterThanOrEqual(smaller.videoBitrateBps)
          }
        }
      }
    }
  })

  it('rises monotonically with the source bitrate, with no cliff at a bound', () => {
    // Guards against a future edit reintroducing branches that cross.
    for (const [w, h, fps] of [
      [1920, 1080, 30],
      [3840, 2160, 25],
      [852, 480, 30],
    ]) {
      let previous = 0
      for (let src = 10_000; src <= 200_000_000; src *= 1.05) {
        const shape = outputShapeFor(PRESETS.best, {
          width: w!,
          height: h!,
          frameRate: fps!,
          sourceFrameRate: fps!,
          videoBitrateBps: src,
        })
        expect(shape.videoBitrateBps).toBeGreaterThanOrEqual(previous - 1)
        previous = shape.videoBitrateBps
      }
    }
  })

  it('carries the lower figure all the way to the encoder and the estimate', () => {
    const shape = outputShapeFor(PRESETS.best, CORPUS.teams)
    expect(videoEncoderConfigFor(shape).bitrate).toBe(2_001_015)
    const unmeasured = outputShapeFor(PRESETS.best, { ...CORPUS.teams, videoBitrateBps: null })
    expect(projectedOutputBytes(shape, 60, true)).toBeLessThan(
      projectedOutputBytes(unmeasured, 60, true),
    )
  })
})

/**
 * VH-60 / review R-06. The codec string declared level 5.1 for every shape.
 * ITU-T H.264 Table A-1 gives 5.1 a ceiling of 983,040 macroblocks per second,
 * and 3840x2160 at 60 fps needs 1,944,000 — so a 4K60 job either failed the
 * capability probe or declared a level it did not conform to.
 */
describe('avcLevelFor', () => {
  const level = (w: number, h: number, fps: number) => avcLevelFor(w, h, fps)

  it('asks for no more than the shape needs', () => {
    // 1080p30 is 120 x 68 = 8,160 macroblocks, 244,800 a second. Level 4.2
    // carries it with room to spare, and is more widely accelerated than 5.1.
    expect(level(1920, 1080, 30)).toBe('2a')
    expect(level(1280, 720, 30)).toBe('2a')
    expect(level(1920, 1080, 60)).toBe('2a')
  })

  it('reaches 5.2 for 4K60, which 5.1 cannot carry', () => {
    // 240 x 135 x 60 = 1,944,000 MB/s against 5.1's 983,040.
    expect(level(3840, 2160, 60)).toBe('34')
  })

  it('still uses 5.1 for 4K30, which it can carry', () => {
    // 972,000 MB/s, just inside 983,040 — the case the old fixed string was
    // right about, and the reason it survived this long.
    expect(level(3840, 2160, 30)).toBe('33')
  })

  it('rounds partial macroblocks up rather than down', () => {
    // 852x480 is not a multiple of 16 in either direction; a level chosen from
    // the rounded-down count would be chosen from a smaller picture.
    expect(level(852, 480, 30)).toBe('2a')
  })

  it('does not throw on a shape past every listed level', () => {
    expect(level(15360, 8640, 120)).toBe('3c')
  })
})

describe('videoEncoderConfigFor codec string', () => {
  it('declares High profile at the level the shape needs', () => {
    const uhd = outputShapeFor(PRESETS.best, {
      width: 3840, height: 2160, frameRate: 60, videoBitrateBps: null, sourceFrameRate: 60,
    })
    expect(videoEncoderConfigFor(uhd).codec).toBe('avc1.640034')

    const hd = outputShapeFor(PRESETS.best, {
      width: 1920, height: 1080, frameRate: 30, videoBitrateBps: null, sourceFrameRate: 30,
    })
    expect(videoEncoderConfigFor(hd).codec).toBe('avc1.64002a')
  })
})
