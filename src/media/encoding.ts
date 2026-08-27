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
  videoEncoderConfigFor,
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
    // The SAME string pre-flight validated, not one Mediabunny derives for
    // itself. Left to itself it calls `buildVideoCodecString`, which picks the
    // AVC level from macroblock count and bitrate and never looks at frame
    // rate — so 4K60 and 4K30 come out identical, and production asked for
    // Level 5.1 where pre-flight had derived 5.2 (VH-72, P2-02).
    //
    // What that costs is NOT a malformed file. Measured 2026-08-27: Chrome's
    // encoder treats the level as a floor and writes what the content actually
    // needs — asked for 5.1 at 4K60 it still emits an avcC declaring 5.2, and
    // asked for 4.2 at 852x480 it emits 3.1. The output was always conformant.
    //
    // What it costs is the capability check. `isConfigSupported` was asked
    // about a configuration the encoder was never given, so a "yes, this will
    // encode" described something else — and on the one engine where that
    // answer already differs from the obvious guess (Firefox and AAC, VH-49),
    // guessing is exactly what we must not do. `fullCodecString` is
    // Mediabunny's own override for this, and the two are now one string.
    fullCodecString: videoEncoderConfigFor(shape).codec,
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
  const bitrate = channelCount <= 1 ? preset.audioBitrateMonoBps : preset.audioBitrateStereoBps

  return {
    codec: 'aac',
    bitrate,
    transform: { sampleRate: OUTPUT_SAMPLE_RATE },
  }
}
