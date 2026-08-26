/**
 * Conservatively distinguishes screen/slides from moving-picture content.
 *
 * Spec section 6.2 gives the smaller preset two bitrate budgets. Classification
 * must therefore be cheap, bounded, and biased toward `unknown`: an uncertain
 * source keeping the camera budget costs some bytes; a camera source mistaken
 * for slides visibly damages the user's only output.
 */

import { VideoSampleSink, type InputVideoTrack } from 'mediabunny'

import type { ContentClass } from '../config/presets'
import {
  CONTENT_CAMERA_MIN_MEAN_DIFFERENCE,
  CONTENT_SAMPLE_FRAMES_PER_SECOND,
  CONTENT_SAMPLE_HEIGHT,
  CONTENT_SAMPLE_WIDTH,
  CONTENT_SAMPLE_WINDOW_FRACTIONS,
  CONTENT_SAMPLE_WINDOW_SECONDS,
  CONTENT_SCREEN_MAX_MEAN_DIFFERENCE,
  CONTENT_SCREEN_MAX_SOURCE_BITS_PER_PIXEL_PER_FRAME,
} from '../config/thresholds'
import { log } from '../core/logger'

export interface ContentMotionMeasurement {
  /** Mean normalised adjacent-frame luma change for each sampled window. */
  readonly windowMeanDifferences: readonly number[]
  /** Measured source density; `null` when inspection could not establish it. */
  readonly sourceBitsPerPixelPerFrame: number | null
  /** False when any planned window yielded fewer than two distinct frames. */
  readonly complete: boolean
}

export interface ContentClassOptions {
  readonly firstTimestampSeconds: number
  readonly endTimestampSeconds: number
  readonly width: number
  readonly height: number
  readonly sourceFrameRate: number
  readonly sourceBitrateBps: number | null
  readonly signal?: AbortSignal
}

/**
 * Applies the asymmetric VH-19 classification thresholds to a measurement.
 *
 * @returns `screen` or `camera` only when the evidence is decisive; otherwise
 * the smaller preset retains its safer camera-quality budget via `unknown`.
 */
export function classifyContentMotion(measurement: ContentMotionMeasurement): ContentClass {
  if (
    !measurement.complete ||
    measurement.windowMeanDifferences.length === 0 ||
    measurement.windowMeanDifferences.some((value) => !Number.isFinite(value) || value < 0)
  ) {
    return 'unknown'
  }

  const maximumDifference = Math.max(...measurement.windowMeanDifferences)
  const density = measurement.sourceBitsPerPixelPerFrame
  if (
    maximumDifference <= CONTENT_SCREEN_MAX_MEAN_DIFFERENCE &&
    density !== null &&
    Number.isFinite(density) &&
    density <= CONTENT_SCREEN_MAX_SOURCE_BITS_PER_PIXEL_PER_FRAME
  ) {
    return 'screen'
  }
  if (maximumDifference >= CONTENT_CAMERA_MIN_MEAN_DIFFERENCE) return 'camera'
  return 'unknown'
}

interface SamplePoint {
  readonly timestamp: number
  readonly windowIndices: readonly number[]
}

function samplePoints(
  first: number,
  end: number,
): {
  readonly points: readonly SamplePoint[]
  readonly windowCount: number
} {
  const duration = Math.max(0, end - first)
  const windowSeconds = Math.min(CONTENT_SAMPLE_WINDOW_SECONDS, duration)
  const latestStart = Math.max(first, end - windowSeconds)
  const starts = CONTENT_SAMPLE_WINDOW_FRACTIONS.map(
    (fraction) => first + (latestStart - first) * fraction,
  ).filter((value, index, values) => index === 0 || Math.abs(value - values[index - 1]!) > 1e-6)

  const byTimestamp = new Map<number, number[]>()
  const observations = Math.floor(windowSeconds * CONTENT_SAMPLE_FRAMES_PER_SECOND)
  for (let windowIndex = 0; windowIndex < starts.length; windowIndex++) {
    const start = starts[windowIndex]!
    for (let observation = 0; observation < observations; observation++) {
      const timestamp = start + observation / CONTENT_SAMPLE_FRAMES_PER_SECOND
      // Microsecond rounding merges overlapping windows without inventing a
      // backward seek, allowing Mediabunny's sparse iterator to decode each
      // packet at most once.
      const key = Math.round(timestamp * 1_000_000) / 1_000_000
      const memberships = byTimestamp.get(key) ?? []
      memberships.push(windowIndex)
      byTimestamp.set(key, memberships)
    }
  }

  return {
    points: [...byTimestamp.entries()]
      .sort(([left], [right]) => left - right)
      .map(([timestamp, windowIndices]) => ({ timestamp, windowIndices })),
    windowCount: starts.length,
  }
}

function sourceDensity(options: ContentClassOptions): number | null {
  const pixelRate = options.width * options.height * options.sourceFrameRate
  return Number.isFinite(options.sourceBitrateBps) && (options.sourceBitrateBps as number) > 0
    ? (options.sourceBitrateBps as number) / pixelRate
    : null
}

function lumaFromRgba(rgba: Uint8ClampedArray): Uint8Array {
  const luma = new Uint8Array(rgba.length / 4)
  for (let source = 0, target = 0; source < rgba.length; source += 4, target++) {
    // Integer Rec. 709 approximation. Exact colour is irrelevant here; only
    // the frame-to-frame change in perceived brightness is compared.
    luma[target] = (54 * rgba[source]! + 183 * rgba[source + 1]! + 19 * rgba[source + 2]!) >> 8
  }
  return luma
}

function meanDifference(left: Uint8Array, right: Uint8Array): number {
  let total = 0
  for (let index = 0; index < left.length; index++) {
    total += Math.abs(left[index]! - right[index]!)
  }
  return total / (left.length * 255)
}

/**
 * Sparsely decodes five one-second windows and classifies their gross motion.
 *
 * Side effects are limited to decoding, a fixed-size offscreen canvas, and a
 * redacted structured diagnostic record. Every yielded sample is closed.
 */
export async function measureContentClass(
  track: InputVideoTrack,
  options: ContentClassOptions,
): Promise<ContentClass> {
  const startedAt = performance.now()

  try {
    options.signal?.throwIfAborted()
    const { points, windowCount } = samplePoints(
      options.firstTimestampSeconds,
      options.endTimestampSeconds,
    )
    if (windowCount === 0 || points.length === 0) return 'unknown'

    const canvas = new OffscreenCanvas(CONTENT_SAMPLE_WIDTH, CONTENT_SAMPLE_HEIGHT)
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return 'unknown'

    const previousLuma: Array<Uint8Array | null> = Array.from({ length: windowCount }, () => null)
    const previousTimestamp: Array<number | null> = Array.from({ length: windowCount }, () => null)
    const differences: number[][] = Array.from({ length: windowCount }, () => [])
    const sink = new VideoSampleSink(track)
    let pointIndex = 0

    for await (const sample of sink.samplesAtTimestamps(points.map((point) => point.timestamp))) {
      const point = points[pointIndex++]
      if (!point || !sample) continue
      try {
        options.signal?.throwIfAborted()
        sample.draw(context, 0, 0, CONTENT_SAMPLE_WIDTH, CONTENT_SAMPLE_HEIGHT)
        const luma = lumaFromRgba(
          context.getImageData(0, 0, CONTENT_SAMPLE_WIDTH, CONTENT_SAMPLE_HEIGHT).data,
        )
        for (const windowIndex of point.windowIndices) {
          if (previousTimestamp[windowIndex] === sample.timestamp) continue
          const previous = previousLuma[windowIndex]
          if (previous) differences[windowIndex]!.push(meanDifference(previous, luma))
          previousLuma[windowIndex] = luma.slice()
          previousTimestamp[windowIndex] = sample.timestamp
        }
      } finally {
        sample.close()
      }
    }
    options.signal?.throwIfAborted()

    const measurement: ContentMotionMeasurement = {
      windowMeanDifferences: differences.map(
        (window) => window.reduce((total, value) => total + value, 0) / window.length,
      ),
      sourceBitsPerPixelPerFrame: sourceDensity(options),
      complete: pointIndex === points.length && differences.every((window) => window.length > 0),
    }
    const contentClass = classifyContentMotion(measurement)
    log.info('content-class', 'picture type measured', {
      contentClass,
      maximumMeanDifference: measurement.complete
        ? Number(Math.max(...measurement.windowMeanDifferences).toFixed(5))
        : null,
      sourceBitsPerPixelPerFrame:
        measurement.sourceBitsPerPixelPerFrame === null
          ? null
          : Number(measurement.sourceBitsPerPixelPerFrame.toFixed(5)),
      elapsedMs: Math.round(performance.now() - startedAt),
    })
    return contentClass
  } catch (cause) {
    if (options.signal?.aborted) throw cause
    log.warn('content-class', 'picture type measurement failed; using safer setting', {
      reason: cause instanceof Error ? cause.message : String(cause),
      elapsedMs: Math.round(performance.now() - startedAt),
    })
    return 'unknown'
  }
}
