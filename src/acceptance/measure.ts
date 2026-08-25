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
   * Change in offset from the first marker to the last, in milliseconds. This
   * is the number that matters: a constant offset is a fixed delay, while a
   * growing one is drift, and only the second gets worse with duration.
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
    driftMs: offsetsMs.length >= 2 ? offsetsMs[offsetsMs.length - 1]! - offsetsMs[0]! : 0,
    paired: pairs,
  }
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
  let elapsedFrames = 0

  for await (const sample of new AudioSampleSink(audioTrack).samples()) {
    const frames = sample.numberOfFrames
    const plane = new Float32Array(frames)
    sample.copyTo(plane, { planeIndex: 0, format: 'f32-planar' })
    for (let i = 0; i < frames; i++) {
      const t = (elapsedFrames + i) / sampleRate
      if (t < refractoryUntil) continue
      if (Math.abs(plane[i]!) > 0.5) {
        audioMarkers.push(t)
        // Impulses are 10 ms; a quarter-second gap cannot merge two of them.
        refractoryUntil = t + 0.25
      }
    }
    elapsedFrames += frames
    sample.close()
    if (channelCount < 1) break
  }

  const pairs = Math.min(videoMarkers.length, audioMarkers.length)
  const offsetsMs: number[] = []
  for (let i = 0; i < pairs; i++) {
    offsetsMs.push((audioMarkers[i]! - videoMarkers[i]!) * 1000)
  }

  const worstOffsetMs = offsetsMs.reduce((worst, value) => Math.max(worst, Math.abs(value)), 0)
  const driftMs =
    offsetsMs.length >= 2 ? offsetsMs[offsetsMs.length - 1]! - offsetsMs[0]! : 0

  return { videoMarkers, audioMarkers, offsetsMs, worstOffsetMs, driftMs }
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

export interface EgressRecord {
  readonly url: string
  readonly method: string
  /** Bytes sent in the request body, which is what "media egress" would mean. */
  readonly bodyBytes: number
}

export interface EgressReport {
  /** Requests that carried an outbound body. Any entry here is a finding. */
  readonly withBody: readonly EgressRecord[]
  /** Every request the page made, from the browser's own resource timeline. */
  readonly allRequests: readonly string[]
  /** Requests to an origin other than this one. */
  readonly crossOrigin: readonly string[]
}

/**
 * Watches for any data leaving the page.
 *
 * Spec section 13, criterion 9: zero media egress. Two instruments, because
 * neither is sufficient alone.
 *
 * `fetch` and `sendBeacon` are wrapped to catch request BODIES, which is what
 * an upload actually is and which no passive observer reports. Separately, the
 * browser's own resource timeline is read, which catches every request however
 * it was made — including by code that does not exist yet and would not think
 * to use the wrapped paths. Neither XHR nor any other API can hide from the
 * second, which is why the first does not need to cover them.
 */
export class EgressWatch {
  private readonly records: EgressRecord[] = []
  private restore: (() => void)[] = []
  private startedAt = 0

  start(): void {
    this.startedAt = performance.now()
    const records = this.records

    const originalFetch = globalThis.fetch
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const method = init?.method ?? (input instanceof Request ? input.method : 'GET')
      records.push({ url, method, bodyBytes: bodySize(init?.body) })
      return originalFetch(input, init)
    }
    this.restore.push(() => {
      globalThis.fetch = originalFetch
    })

    if (typeof navigator.sendBeacon === 'function') {
      const originalBeacon = navigator.sendBeacon.bind(navigator)
      navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) => {
        records.push({ url: String(url), method: 'beacon', bodyBytes: bodySize(data) })
        return originalBeacon(url, data)
      }
      this.restore.push(() => {
        navigator.sendBeacon = originalBeacon
      })
    }
  }

  stop(): EgressReport {
    for (const undo of this.restore) undo()
    this.restore = []

    const since = this.startedAt
    const entries = performance
      .getEntriesByType('resource')
      .filter((entry) => entry.startTime >= since)
      .map((entry) => entry.name)

    return {
      withBody: this.records.filter((record) => record.bodyBytes > 0),
      allRequests: entries,
      crossOrigin: entries.filter((url) => {
        try {
          return new URL(url, location.href).origin !== location.origin
        } catch {
          return true
        }
      }),
    }
  }
}

function bodySize(body: unknown): number {
  if (typeof body === 'string') return body.length
  if (body instanceof Blob) return body.size
  if (body instanceof ArrayBuffer) return body.byteLength
  if (ArrayBuffer.isView(body)) return body.byteLength
  if (body instanceof FormData || body instanceof URLSearchParams) return 1
  return 0
}
