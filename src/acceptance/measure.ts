/**
 * Measurements for the acceptance run.
 *
 * The A/V sync check is the reason this file exists. Comparing track durations
 * only tells you the ends line up; it says nothing about whether the picture
 * and the sound agree in the middle, and nothing at all about drift. So the
 * fixtures carry paired markers — a white video frame and an audio impulse at
 * the same instant — and this finds both and reports the difference at each
 * one. Drift shows up as a trend across markers, which a duration comparison
 * can never reveal.
 */

import { AudioSampleSink, BlobSource, Input, VideoSampleSink, ALL_FORMATS } from 'mediabunny'

import { AudioAnalyser, type AudioAnalysis } from '../audio/analyse'

export interface SyncMeasurement {
  /** Times, in seconds, of each white marker frame found in the video. */
  readonly videoMarkers: readonly number[]
  /** Times, in seconds, of each audio impulse found. */
  readonly audioMarkers: readonly number[]
  /** Audio time minus video time at each paired marker, in milliseconds. */
  readonly offsetsMs: readonly number[]
  readonly worstOffsetMs: number
  /**
   * Trend in the offset across the recording, in milliseconds, fitted across
   * every marker rather than taken between the endpoints. This is the number
   * that matters: a constant offset is a fixed delay, while a growing one is
   * drift, and only the second gets worse with duration.
   */
  readonly driftMs: number
}

/**
 * The pipeline's contribution to sync error, with the source's own removed.
 *
 * A fixture cannot place a marker more precisely than its own frame grid
 * allows — at 96 ms between frames, a marker is already up to 96 ms from its
 * nominal time before anything is processed. Comparing output against source
 * marker by marker cancels that, leaving only what the pipeline did.
 */
export function relativeSync(source: SyncMeasurement, output: SyncMeasurement): {
  readonly offsetsMs: readonly number[]
  readonly worstOffsetMs: number
  readonly driftMs: number
  readonly paired: number
} {
  const pairs = Math.min(source.offsetsMs.length, output.offsetsMs.length)
  const offsetsMs: number[] = []
  for (let i = 0; i < pairs; i++) offsetsMs.push(output.offsetsMs[i]! - source.offsetsMs[i]!)
  return {
    offsetsMs,
    worstOffsetMs: offsetsMs.reduce((worst, value) => Math.max(worst, Math.abs(value)), 0),
    driftMs: fittedChange(offsetsMs),
    paired: pairs,
  }
}

/**
 * Trend across a series, as the fitted change from first point to last.
 *
 * A least-squares slope rather than the difference of the endpoints. With
 * frame quantisation scattering each point by up to half a frame period, an
 * endpoint difference is decided by the noise at exactly two samples — on real
 * data here it reported -16 ms where the fit through all twelve points
 * reported +9 ms, which is both a different magnitude and a different sign.
 */
export function fittedChange(values: readonly number[]): number {
  if (values.length < 2) return 0
  const n = values.length
  const meanX = (n - 1) / 2
  const meanY = values.reduce((total, value) => total + value, 0) / n
  let covariance = 0
  let variance = 0
  for (let i = 0; i < n; i++) {
    covariance += (i - meanX) * (values[i]! - meanY)
    variance += (i - meanX) ** 2
  }
  if (variance === 0) return 0
  return (covariance / variance) * (n - 1)
}

/** Mean luminance of a frame, from a small downscale. */
function meanLuminance(
  context: OffscreenCanvasRenderingContext2D,
  size: number,
): number {
  const { data } = context.getImageData(0, 0, size, size)
  let sum = 0
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!
  }
  return sum / (data.length / 4)
}

/** Finds white marker frames and audio impulses, and pairs them. */
export async function measureSync(file: Blob): Promise<SyncMeasurement> {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) })
  const videoTrack = await input.getPrimaryVideoTrack()
  const audioTrack = await input.getPrimaryAudioTrack()
  if (!videoTrack || !audioTrack) throw new Error('Sync measurement needs both tracks')

  const size = 8
  const canvas = new OffscreenCanvas(size, size)
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('Could not create a 2D context for sync measurement')

  const videoMarkers: number[] = []
  let wasMarker = false
  for await (const sample of new VideoSampleSink(videoTrack).samples()) {
    sample.draw(context, 0, 0, size, size)
    const isMarker = meanLuminance(context, size) > 200
    // Leading edge only: a marker held across two frames is one marker.
    if (isMarker && !wasMarker) videoMarkers.push(sample.timestamp)
    wasMarker = isMarker
    sample.close()
  }

  const sampleRate = await audioTrack.getSampleRate()
  const channelCount = await audioTrack.getNumberOfChannels()
  const audioMarkers: number[] = []
  let refractoryUntil = -1

  for await (const sample of new AudioSampleSink(audioTrack).samples()) {
    const frames = sample.numberOfFrames
    const plane = new Float32Array(frames)
    sample.copyTo(plane, { planeIndex: 0, format: 'f32-planar' })
    for (let i = 0; i < frames; i++) {
      // The sample's OWN presentation time, not a running count of decoded
      // frames. Both are the same on a contiguous track starting at zero,
      // which is why the difference went unnoticed — but a count measures
      // audio in decoded-sample time while the video markers above are
      // presentation timestamps, so the two clocks diverge on exactly the
      // cases this meter exists to judge: a track that starts late, a gap in
      // the middle, or an edit list (VH-62, and the reason VH-55 waited).
      const t = sample.timestamp + i / sampleRate
      if (t < refractoryUntil) continue
      if (Math.abs(plane[i]!) > 0.5) {
        audioMarkers.push(t)
        // Impulses are 10 ms; a quarter-second gap cannot merge two of them.
        refractoryUntil = t + 0.25
      }
    }
    sample.close()
    if (channelCount < 1) break
  }

  const pairs = Math.min(videoMarkers.length, audioMarkers.length)
  const offsetsMs: number[] = []
  for (let i = 0; i < pairs; i++) {
    offsetsMs.push((audioMarkers[i]! - videoMarkers[i]!) * 1000)
  }

  const worstOffsetMs = offsetsMs.reduce((worst, value) => Math.max(worst, Math.abs(value)), 0)

  return { videoMarkers, audioMarkers, offsetsMs, worstOffsetMs, driftMs: fittedChange(offsetsMs) }
}

/** Loudness of a whole file, or of one region of it. */
export async function measureLoudness(
  file: Blob,
  region?: { readonly fromSeconds: number; readonly toSeconds: number },
): Promise<AudioAnalysis | null> {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) })
  const track = await input.getPrimaryAudioTrack()
  if (!track) return null

  const sampleRate = await track.getSampleRate()
  const channelCount = await track.getNumberOfChannels()
  const analyser = new AudioAnalyser({ sampleRate, channelCount })

  const samples = region
    ? new AudioSampleSink(track).samples(region.fromSeconds, region.toSeconds)
    : new AudioSampleSink(track).samples()

  for await (const sample of samples) {
    const planes: Float32Array[] = []
    for (let ch = 0; ch < channelCount; ch++) {
      const data = new Float32Array(sample.numberOfFrames)
      sample.copyTo(data, { planeIndex: ch, format: 'f32-planar' })
      planes.push(data)
    }
    analyser.addFrames(planes)
    sample.close()
  }
  return analyser.finish()
}

// The egress instruments moved to `core/egress.ts` when the worker had to run
// one too (VH-62). Re-exported so the harness keeps one import for everything
// it measures.
export {
  EgressWatch,
  carriedBody,
  mergeEgress,
  type EgressRecord,
  type EgressReport,
} from '../core/egress'
