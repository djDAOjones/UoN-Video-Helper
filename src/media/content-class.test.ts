import { describe, expect, it } from 'vitest'

import {
  CONTENT_CAMERA_MIN_MEAN_DIFFERENCE,
  CONTENT_SCREEN_MAX_MEAN_DIFFERENCE,
  CONTENT_SCREEN_MAX_SOURCE_BITS_PER_PIXEL_PER_FRAME,
} from '../config/thresholds'
import { classifyContentMotion, type ContentMotionMeasurement } from './content-class'

function measurement(overrides: Partial<ContentMotionMeasurement> = {}): ContentMotionMeasurement {
  return {
    windowMeanDifferences: [0.0002, 0.0003, 0.0001, 0.0004, 0.0002],
    sourceBitsPerPixelPerFrame: 0.04,
    complete: true,
    ...overrides,
  }
}

describe('classifyContentMotion', () => {
  it('uses the screen class only when every sampled window is decisively static', () => {
    expect(
      classifyContentMotion(
        measurement({
          windowMeanDifferences: [CONTENT_SCREEN_MAX_MEAN_DIFFERENCE],
          sourceBitsPerPixelPerFrame: CONTENT_SCREEN_MAX_SOURCE_BITS_PER_PIXEL_PER_FRAME,
        }),
      ),
    ).toBe('screen')
  })

  it('uses the camera class when any sampled region has decisive motion', () => {
    expect(
      classifyContentMotion(
        measurement({ windowMeanDifferences: [0.0001, CONTENT_CAMERA_MIN_MEAN_DIFFERENCE] }),
      ),
    ).toBe('camera')
  })

  it('keeps ambiguous and incomplete measurements on the safer setting', () => {
    expect(
      classifyContentMotion(measurement({ windowMeanDifferences: [0.002], complete: true })),
    ).toBe('unknown')
    expect(classifyContentMotion(measurement({ complete: false }))).toBe('unknown')
    expect(classifyContentMotion(measurement({ windowMeanDifferences: [] }))).toBe('unknown')
  })

  it('does not mistake a nearly still, high-density camera source for slides', () => {
    expect(
      classifyContentMotion(
        measurement({
          sourceBitsPerPixelPerFrame:
            CONTENT_SCREEN_MAX_SOURCE_BITS_PER_PIXEL_PER_FRAME + Number.EPSILON,
        }),
      ),
    ).toBe('unknown')
    expect(classifyContentMotion(measurement({ sourceBitsPerPixelPerFrame: null }))).toBe('unknown')
  })
})

describe('the thresholds (VH-19)', () => {
  it('leave a band between them, so an in-between source is never forced either way', () => {
    // The asymmetry is the safety: mistaking camera for slides costs picture
    // quality, the reverse costs only file size, so the two are not one line.
    expect(CONTENT_CAMERA_MIN_MEAN_DIFFERENCE).toBeGreaterThan(CONTENT_SCREEN_MAX_MEAN_DIFFERENCE)
  })
})

/**
 * What the classifier measured on the maintainer's own recordings, 2026-09-30,
 * and what a person sees in each. `/spike-content-class.html` reproduces the
 * numbers; the recordings themselves are in `samples/`, which is not committed.
 *
 * This is the evidence the thresholds rest on, written down where changing a
 * threshold runs into it. The rule it protects is one-sided: nothing that is
 * CAMERA to the eye may come out `screen`. A slide deck read as `camera` or
 * `unknown` only keeps the larger budget, and four of them do.
 */
describe('the corpus the thresholds were checked against (VH-19)', () => {
  type Seen = 'slides' | 'slides with a webcam inset' | 'animation' | 'camera'
  const corpus: ReadonlyArray<
    readonly [name: string, seen: Seen, density: number, windows: readonly number[], expected: string]
  > = [
    ['AMCS3059', 'slides', 0.0206, [0.00002, 0, 0.00002, 0, 0], 'screen'],
    ['AMCS2007', 'slides', 0.0643, [0, 0, 0, 0, 0], 'screen'],
    ['AMCS2038', 'slides', 0.0302, [0.00001, 0, 0, 0, 0.00002], 'screen'],
    ['AMCS3068', 'slides', 0.0078, [0.00001, 0, 0, 0, 0], 'screen'],
    ['MLAC3139', 'slides with a webcam inset', 0.052, [0.00001, 0.00029, 0.00027, 0.00039, 0], 'screen'],
    ['CULT2011', 'slides with a webcam inset', 0.0362, [0.00001, 0.00029, 0.00049, 0.00043, 0.00003], 'screen'],
    ['CULT3033', 'slides with a webcam inset', 0.0397, [0, 0.0005, 0.00055, 0.00094, 0], 'screen'],
    // Slides to the eye, and read as camera for one animated transition each.
    // The safe direction: they keep the larger budget.
    ['CULT1027', 'slides', 0.0223, [0.00002, 0, 0, 0.00223, 0.02209], 'camera'],
    ['LIBA3005', 'slides', 0.0528, [0.07252, 0, 0, 0.00003, 0], 'camera'],
    ['MLAC3186', 'slides', 0.0151, [0.00001, 0, 0, 0, 0.00317], 'camera'],
    ['Engineering Placements', 'animation', 0.0332, [0.00074, 0.01125, 0.00003, 0.00002, 0], 'camera'],
    ['Branded video graphics demo', 'animation', 0.0439, [0, 0.00178, 0, 0.0131, 0.00002], 'camera'],
    ['River Evolution', 'animation', 0.0356, [0.00021, 0.00138, 0.00213, 0.00003, 0], 'unknown'],
    // A studio talking head on a static camera: the case most like slides that
    // is not slides. Every window is five times the camera threshold.
    ['Paul Smith NSS', 'camera', 0.3338, [0.01402, 0.01531, 0.01388, 0.01823, 0.01175], 'camera'],
    // A 29-minute Teams webcam recording at 0.03 bits per pixel — as thin as
    // the slide decks. Its FIRST window reads 0.0003, inside the screen band:
    // a still moment at the start. It is the other four that decide it, which
    // is why the rule takes the loudest of five spread windows.
    ['Teams meeting, webcam', 'camera', 0.0303, [0.0003, 0.01415, 0.00432, 0.01201, 0.00629], 'camera'],
    // A conference keynote filmed in a lecture theatre, opening and closing on
    // still cards: two of its five windows read 0.
    ['T&L Conf Keynote', 'camera', 0.1761, [0, 0.00809, 0.01014, 0.03883, 0], 'camera'],
    ['iPhone 12, HEVC 1080p', 'camera', 0.1379, [0.01357, 0.02174, 0.01235, 0.01316, 0.01488], 'camera'],
    ['iPhone 12 Pro Max, 4K30', 'camera', 0.1032, [0.02856, 0.02541, 0.02136, 0.02104, 0.01883], 'camera'],
    ['iPhone 12 Pro Max, 4K30 (2)', 'camera', 0.1836, [0.04418, 0.0406, 0.0318, 0.02892, 0.03195], 'camera'],
    ['iPhone 13 Pro, 4K60', 'camera', 0.1076, [0.04163, 0.03634, 0.04068, 0.05822, 0.03643], 'camera'],
    ['Lenovo Tab, 3GP', 'camera', 0.4905, [0.04702, 0.02414, 0.02933, 0.02091, 0.02388], 'camera'],
  ]

  it.each(corpus)('%s (%s) is classified as measured', (_name, _seen, density, windows, expected) => {
    expect(
      classifyContentMotion({
        windowMeanDifferences: windows,
        sourceBitsPerPixelPerFrame: density,
        complete: true,
      }),
    ).toBe(expected)
  })

  it('never calls camera footage screen', () => {
    // The one misclassification that damages a video.
    for (const [name, seen, density, windows] of corpus) {
      if (seen !== 'camera') continue
      const result = classifyContentMotion({
        windowMeanDifferences: windows,
        sourceBitsPerPixelPerFrame: density,
        complete: true,
      })
      expect(result, name).toBe('camera')
    }
  })

  it('keeps camera footage clear of the screen threshold by a wide margin', () => {
    // Not merely on the right side of it: the loudest window of every camera
    // recording is more than ten times the screen ceiling, so a verdict is not
    // one noisy window away from the wrong side.
    const leastMotion = Math.min(
      ...corpus.filter(([, seen]) => seen === 'camera').map(([, , , windows]) => Math.max(...windows)),
    )
    expect(leastMotion).toBeGreaterThan(10 * CONTENT_SCREEN_MAX_MEAN_DIFFERENCE)
  })

  it('needs every window, not the first: camera can open on a still moment', () => {
    // The Teams recording read as screen from its first window alone. Judged
    // on the first window, it would have lost 40% of its bits.
    const teams = corpus.find(([name]) => name.startsWith('Teams'))!
    expect(teams[3][0]!).toBeLessThanOrEqual(CONTENT_SCREEN_MAX_MEAN_DIFFERENCE)
    expect(
      classifyContentMotion({
        windowMeanDifferences: teams[3].slice(0, 1),
        sourceBitsPerPixelPerFrame: teams[2],
        complete: true,
      }),
    ).toBe('screen')
    expect(
      classifyContentMotion({
        windowMeanDifferences: teams[3],
        sourceBitsPerPixelPerFrame: teams[2],
        complete: true,
      }),
    ).toBe('camera')
  })

  it('rests on more than five recordings, of more than one kind', () => {
    expect(corpus.length).toBeGreaterThan(5)
    expect(new Set(corpus.map(([, seen]) => seen)).size).toBeGreaterThanOrEqual(3)
  })
})
