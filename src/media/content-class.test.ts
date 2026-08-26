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
