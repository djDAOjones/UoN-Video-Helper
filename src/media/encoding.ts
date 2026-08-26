/**
 * Mediabunny encoding configurations, derived from the pure preset values.
 *
 * Kept out of `src/config/` so that directory stays free of dependency types:
 * the presets describe *what* we want, this describes how to ask Mediabunny
 * for it.
 *
 * The scaling and frame-rate conform are handed to Mediabunny's `transform`
 * rather than done by hand. `transform.frameRate` normalises the frame stream
 * to a constant rate, which is spec section 6.3, and letting one implementation
 * own it means the probe and the real job cannot drift apart.
 */

import type { AudioEncodingConfig, VideoEncodingConfig } from 'mediabunny'

import {
  KEYFRAME_INTERVAL_SECONDS,
  OUTPUT_SAMPLE_RATE,
  audioBitrateFor,
  type OutputShape,
  type Preset,
} from '../config/presets'

/** How the source is fitted into the output frame when the aspect ratio differs. */
export type FitBehaviour = 'contain' | 'fill'

export function videoEncodingConfigFor(
  shape: OutputShape,
  options: { readonly fit?: FitBehaviour } = {},
): VideoEncodingConfig {
  return {
    codec: 'avc',
    bitrate: shape.videoBitrateBps,
    keyFrameInterval: KEYFRAME_INTERVAL_SECONDS,
    transform: {
      width: shape.width,
      height: shape.height,
      // `contain` never distorts. The main content is already at the output's
      // aspect ratio because the shape is derived from the source's display
      // dimensions, so this only bites for branding (VH-8).
      fit: options.fit ?? 'contain',
      frameRate: shape.frameRate,
      // No `rotate` here, deliberately. Mediabunny ADDS it to the rotation it
      // read from the file (`sample.js`: `this.rotation + (options.rotate ?? 0)`),
      // so setting it to "make the output upright" would double-rotate every
      // phone video that is already tagged. Rotation is applied for us: the
      // decoder stamps it on each sample and the output shape is built from
      // rotation-corrected display dimensions. See VH-26.
    },
  }
}

/**
 * No `process` hook. The audio chain runs in the pipeline's feed loop instead,
 * because that hook sees every sample — including the branding bed, which is
 * mastered at target and must pass through unprocessed (spec section 4.4).
 */
export function audioEncodingConfigFor(preset: Preset, channelCount: number): AudioEncodingConfig {
  return {
    codec: 'aac',
    bitrate: audioBitrateFor(preset, channelCount),
    transform: { sampleRate: OUTPUT_SAMPLE_RATE },
  }
}
