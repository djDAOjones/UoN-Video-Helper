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

import type { AudioEncodingConfig, AudioSample, VideoEncodingConfig } from 'mediabunny'

import { KEYFRAME_INTERVAL_SECONDS, OUTPUT_SAMPLE_RATE, type OutputShape, type Preset } from '../config/presets'

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
    },
  }
}

/**
 * @param processSample - Where the audio chain hooks in (VH-7). Until then the
 *   audio is decoded and re-encoded untouched, which is still the correct
 *   behaviour for the branding bed: it is mastered at target and must pass
 *   through unprocessed (spec section 4.4).
 */
export function audioEncodingConfigFor(
  preset: Preset,
  channelCount: number,
  processSample?: (sample: AudioSample) => AudioSample | AudioSample[] | null,
): AudioEncodingConfig {
  const bitrate =
    channelCount <= 1 ? preset.audioBitrateMonoBps : preset.audioBitrateStereoBps

  return {
    codec: 'aac',
    bitrate,
    transform: {
      sampleRate: OUTPUT_SAMPLE_RATE,
      ...(processSample ? { process: processSample } : {}),
    },
  }
}
