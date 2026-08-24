/**
 * Turning a decoded source frame into the frame the encoder wants.
 *
 * Two things can differ: the size (the smaller preset scales sources above
 * 1080p) and the shape (a 4:3 or vertical source inside a 16:9 frame). Both
 * are handled here so the pipeline, the probe and the branding conform all
 * scale identically — a probe that measured a cheaper operation than the real
 * job would produce an estimate that flatters the machine.
 */

import type { VideoSample } from 'mediabunny'

import type { OutputShape } from '../config/presets'

/**
 * The colour used to pad a source whose aspect ratio does not match the output
 * frame, per spec section 4.3.
 *
 * Reads the D1 brand token at runtime rather than hard-coding a hex, so
 * answering D1 stays a one-line change in `tokens.brand.css`. Falls back to
 * black only when there is no document to read from — inside a worker, where
 * the caller passes the resolved value in.
 */
export function resolveBrandBackground(fallback = '#000000'): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--uon-brand-bg')
    .trim()
  return value || fallback
}

/** Scaled rectangle that fits `source` inside `target` without distorting it. */
export function fitRectangle(
  source: { readonly width: number; readonly height: number },
  target: { readonly width: number; readonly height: number },
): { x: number; y: number; width: number; height: number } {
  const scale = Math.min(target.width / source.width, target.height / source.height)
  const width = Math.round(source.width * scale)
  const height = Math.round(source.height * scale)
  return {
    x: Math.round((target.width - width) / 2),
    y: Math.round((target.height - height) / 2),
    width,
    height,
  }
}

/** True when a sample already matches the output frame and can be passed straight through. */
export function matchesShape(sample: VideoSample, shape: OutputShape): boolean {
  return sample.displayWidth === shape.width && sample.displayHeight === shape.height
}

/**
 * A reusable scaling surface.
 *
 * Held open across frames rather than allocated per frame: at 60 fps for an
 * hour that is 216,000 canvases, and the allocation alone would dominate.
 */
export class FrameScaler {
  private readonly canvas: OffscreenCanvas
  private readonly context: OffscreenCanvasRenderingContext2D

  constructor(
    private readonly shape: OutputShape,
    private readonly backgroundColour: string,
  ) {
    this.canvas = new OffscreenCanvas(shape.width, shape.height)
    const context = this.canvas.getContext('2d', { alpha: false })
    if (!context) throw new Error('Could not create a 2D context for frame scaling')
    this.context = context
  }

  /**
   * Draws `sample` into the output frame, scaled to fit and padded if needed.
   *
   * @returns A `VideoFrame` the caller owns and must close.
   */
  scale(sample: VideoSample): VideoFrame {
    const fit = fitRectangle(
      { width: sample.displayWidth, height: sample.displayHeight },
      this.shape,
    )

    // Only paint the background when there is padding to cover; on a matching
    // aspect ratio the draw covers every pixel anyway.
    if (fit.width !== this.shape.width || fit.height !== this.shape.height) {
      this.context.fillStyle = this.backgroundColour
      this.context.fillRect(0, 0, this.shape.width, this.shape.height)
    }

    sample.draw(this.context, fit.x, fit.y, fit.width, fit.height)

    return new VideoFrame(this.canvas, {
      timestamp: sample.microsecondTimestamp,
      duration: sample.microsecondDuration,
    })
  }
}

/**
 * The frame to hand the encoder, scaling only when necessary.
 *
 * @returns A `VideoFrame` the caller owns and must close.
 */
export function toOutputFrame(
  sample: VideoSample,
  shape: OutputShape,
  scaler: FrameScaler | null,
): VideoFrame {
  if (matchesShape(sample, shape) || !scaler) return sample.toVideoFrame()
  return scaler.scale(sample)
}
