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
import { PHASE_TAPS, TruePeakDetector } from '../audio/truepeak'

export interface AudioRegion {
  readonly fromSeconds: number
  readonly toSeconds: number
}

export interface AudioFrameSlice {
  /** First frame to copy from this decoded sample. */
  readonly frameOffset: number
  readonly frameCount: number
  /** Absolute output-timeline frame index after applying {@link frameOffset}. */
  readonly timelineStartFrame: number
}

export interface AudioFrameCoverage {
  readonly expectedStartFrame: number
  readonly expectedEndFrame: number
  readonly expectedFrames: number
  /** Unique frames covered; overlapping decoder output is not counted twice. */
  readonly coveredFrames: number
  readonly gapFrames: number
  readonly overlapFrames: number
  readonly firstCoveredFrame: number | null
  readonly lastCoveredFrameExclusive: number | null
  readonly complete: boolean
}

export interface AcceptanceAudioAnalysis extends AudioAnalysis {
  /** Present for a requested region; `null` when measuring the entire track. */
  readonly coverage: AudioFrameCoverage | null
}

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
export function relativeSync(
  source: SyncMeasurement,
  output: SyncMeasurement,
): {
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

export interface AudioImpulseScan {
  readonly markers: readonly number[]
  readonly refractoryUntilSeconds: number
}

/**
 * Finds fixture impulses in one decoded sample using its presentation timestamp.
 *
 * Counting decoded frames from zero would erase a track's real onset and any
 * timestamp gaps between samples, allowing the sync check to approve exactly
 * the timing loss it exists to catch.
 */
export function findAudioImpulseMarkers(
  sampleTimestampSeconds: number,
  frames: Float32Array,
  sampleRate: number,
  initialRefractoryUntilSeconds = Number.NEGATIVE_INFINITY,
): AudioImpulseScan {
  if (!Number.isFinite(sampleTimestampSeconds)) {
    throw new RangeError(`Audio sample timestamp must be finite, got ${sampleTimestampSeconds}`)
  }
  if (!Number.isInteger(sampleRate) || sampleRate < 1) {
    throw new RangeError(`Sample rate must be a positive integer, got ${sampleRate}`)
  }

  const markers: number[] = []
  let refractoryUntilSeconds = initialRefractoryUntilSeconds
  for (let frame = 0; frame < frames.length; frame++) {
    const timestampSeconds = sampleTimestampSeconds + frame / sampleRate
    if (timestampSeconds < refractoryUntilSeconds) continue
    if (Math.abs(frames[frame]!) > 0.5) {
      markers.push(timestampSeconds)
      // Fixture impulses last 10 ms; a quarter-second gap cannot merge two.
      refractoryUntilSeconds = timestampSeconds + 0.25
    }
  }

  return { markers, refractoryUntilSeconds }
}

/** Runs a synchronous sample consumer and closes the resource on success or failure. */
export function withClosedSample<T extends { close(): void }, Result>(
  sample: T,
  consume: (sample: T) => Result,
): Result {
  try {
    return consume(sample)
  } finally {
    sample.close()
  }
}

function regionFrameBounds(
  region: AudioRegion,
  sampleRate: number,
): { readonly start: number; readonly end: number } {
  if (!Number.isFinite(region.fromSeconds) || !Number.isFinite(region.toSeconds)) {
    throw new RangeError('Audio region boundaries must be finite')
  }
  if (region.fromSeconds < 0 || region.toSeconds <= region.fromSeconds) {
    throw new RangeError(
      `Audio region must have a non-negative start before its end, got ${region.fromSeconds}..${region.toSeconds}`,
    )
  }
  if (!Number.isInteger(sampleRate) || sampleRate < 1) {
    throw new RangeError(`Sample rate must be a positive integer, got ${sampleRate}`)
  }
  return {
    start: Math.round(region.fromSeconds * sampleRate),
    end: Math.round(region.toSeconds * sampleRate),
  }
}

/**
 * Clips one decoded sample to the exact sample-grid interval `[from, to)`.
 *
 * Mediabunny's range iterator deliberately returns samples that overlap the
 * requested edges. Copying them whole would include branding frames outside
 * the content window, so the acceptance meter performs the final frame trim.
 */
export function audioFrameSlice(
  sampleTimestampSeconds: number,
  sampleFrameCount: number,
  sampleRate: number,
  region: AudioRegion,
): AudioFrameSlice {
  if (!Number.isFinite(sampleTimestampSeconds)) {
    throw new RangeError(`Audio sample timestamp must be finite, got ${sampleTimestampSeconds}`)
  }
  if (!Number.isInteger(sampleFrameCount) || sampleFrameCount < 0) {
    throw new RangeError(
      `Audio sample frame count must be a non-negative integer, got ${sampleFrameCount}`,
    )
  }

  const bounds = regionFrameBounds(region, sampleRate)
  const sampleStart = Math.round(sampleTimestampSeconds * sampleRate)
  const sampleEnd = sampleStart + sampleFrameCount
  const overlapStart = Math.max(sampleStart, bounds.start)
  const overlapEnd = Math.min(sampleEnd, bounds.end)
  if (overlapEnd <= overlapStart) {
    return { frameOffset: 0, frameCount: 0, timelineStartFrame: overlapStart }
  }

  return {
    frameOffset: overlapStart - sampleStart,
    frameCount: overlapEnd - overlapStart,
    timelineStartFrame: overlapStart,
  }
}

/** Streaming, constant-space proof that a requested audio interval was fully decoded once. */
export class AudioFrameCoverageTracker {
  private readonly expectedStartFrame: number
  private readonly expectedEndFrame: number
  private coveredFrames = 0
  private gapFrames = 0
  private overlapFrames = 0
  private firstCoveredFrame: number | null = null
  private lastCoveredFrameExclusive: number | null = null
  private cursor: number

  constructor(region: AudioRegion, sampleRate: number) {
    const bounds = regionFrameBounds(region, sampleRate)
    this.expectedStartFrame = bounds.start
    this.expectedEndFrame = bounds.end
    this.cursor = bounds.start
  }

  /** Adds a slice after it has been copied and accepted by the analysers. */
  add(slice: AudioFrameSlice): void {
    if (slice.frameCount === 0) return
    const start = slice.timelineStartFrame
    const end = start + slice.frameCount
    if (start < this.expectedStartFrame || end > this.expectedEndFrame) {
      throw new RangeError(`Audio slice ${start}..${end} falls outside the requested region`)
    }

    this.firstCoveredFrame ??= start
    if (start > this.cursor) this.gapFrames += start - this.cursor
    if (start < this.cursor) this.overlapFrames += Math.min(this.cursor, end) - start

    const newlyCoveredStart = Math.max(start, this.cursor)
    if (end > newlyCoveredStart) this.coveredFrames += end - newlyCoveredStart
    this.cursor = Math.max(this.cursor, end)
    this.lastCoveredFrameExclusive = Math.max(this.lastCoveredFrameExclusive ?? end, end)
  }

  /** Final coverage, including any missing tail after the last decoded sample. */
  finish(): AudioFrameCoverage {
    const trailingGap = Math.max(0, this.expectedEndFrame - this.cursor)
    const gapFrames = this.gapFrames + trailingGap
    const expectedFrames = this.expectedEndFrame - this.expectedStartFrame
    return {
      expectedStartFrame: this.expectedStartFrame,
      expectedEndFrame: this.expectedEndFrame,
      expectedFrames,
      coveredFrames: this.coveredFrames,
      gapFrames,
      overlapFrames: this.overlapFrames,
      firstCoveredFrame: this.firstCoveredFrame,
      lastCoveredFrameExclusive: this.lastCoveredFrameExclusive,
      complete:
        this.firstCoveredFrame === this.expectedStartFrame &&
        this.lastCoveredFrameExclusive === this.expectedEndFrame &&
        this.coveredFrames === expectedFrames &&
        gapFrames === 0 &&
        this.overlapFrames === 0,
    }
  }
}

/**
 * Acceptance-only analyser whose independent true-peak detector is drained at EOF.
 *
 * The zero post-roll clocks the causal FIR without feeding synthetic duration
 * into the production loudness analyser. This makes the harness able to detect
 * an output transient in the final {@link PHASE_TAPS} samples while the
 * protected production detector remains unchanged.
 */
export class AcceptanceAudioAnalyser {
  private readonly analyser: AudioAnalyser
  private readonly truePeak: TruePeakDetector
  private readonly channelCount: number
  private finished = false

  constructor(options: { readonly sampleRate: number; readonly channelCount: number }) {
    this.analyser = new AudioAnalyser(options)
    this.truePeak = new TruePeakDetector(options.channelCount)
    this.channelCount = options.channelCount
  }

  addFrames(channels: readonly Float32Array[]): void {
    if (this.finished) throw new Error('Acceptance audio analyser has already finished')
    this.analyser.addFrames(channels)
    this.truePeak.addFrames(channels)
  }

  finish(): AudioAnalysis {
    if (this.finished) throw new Error('Acceptance audio analyser has already finished')
    this.finished = true
    const measured = this.analyser.finish()
    this.truePeak.addFrames(
      Array.from({ length: this.channelCount }, () => new Float32Array(PHASE_TAPS - 1)),
    )
    return {
      ...measured,
      truePeakDbtp: this.truePeak.peakDbtp,
      // The post-roll is synthetic. Keep the source-frame clip count from the
      // undrained analyser while using the drained detector only for its peak.
      clippedSampleCount: measured.clippedSampleCount,
    }
  }
}

/** Mean luminance of a frame, from a small downscale. */
function meanLuminance(context: OffscreenCanvasRenderingContext2D, size: number): number {
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
    withClosedSample(sample, (current) => {
      current.draw(context, 0, 0, size, size)
      const isMarker = meanLuminance(context, size) > 200
      // Leading edge only: a marker held across two frames is one marker.
      if (isMarker && !wasMarker) videoMarkers.push(current.timestamp)
      wasMarker = isMarker
    })
  }

  const sampleRate = await audioTrack.getSampleRate()
  const channelCount = await audioTrack.getNumberOfChannels()
  const audioMarkers: number[] = []
  let refractoryUntil = Number.NEGATIVE_INFINITY

  for await (const sample of new AudioSampleSink(audioTrack).samples()) {
    withClosedSample(sample, (current) => {
      const frames = current.numberOfFrames
      const plane = new Float32Array(frames)
      current.copyTo(plane, { planeIndex: 0, format: 'f32-planar' })
      const found = findAudioImpulseMarkers(current.timestamp, plane, sampleRate, refractoryUntil)
      audioMarkers.push(...found.markers)
      refractoryUntil = found.refractoryUntilSeconds
    })
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
  region?: AudioRegion,
): Promise<AcceptanceAudioAnalysis | null> {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) })
  const track = await input.getPrimaryAudioTrack()
  if (!track) return null

  const sampleRate = await track.getSampleRate()
  const channelCount = await track.getNumberOfChannels()
  const analyser = new AcceptanceAudioAnalyser({ sampleRate, channelCount })
  const coverage = region ? new AudioFrameCoverageTracker(region, sampleRate) : null

  const samples = region
    ? new AudioSampleSink(track).samples(region.fromSeconds, region.toSeconds)
    : new AudioSampleSink(track).samples()

  for await (const sample of samples) {
    withClosedSample(sample, (current) => {
      const slice = region
        ? audioFrameSlice(current.timestamp, current.numberOfFrames, sampleRate, region)
        : {
            frameOffset: 0,
            frameCount: current.numberOfFrames,
            timelineStartFrame: Math.round(current.timestamp * sampleRate),
          }
      if (slice.frameCount === 0) return

      const planes: Float32Array[] = []
      for (let ch = 0; ch < channelCount; ch++) {
        const data = new Float32Array(slice.frameCount)
        current.copyTo(data, {
          planeIndex: ch,
          format: 'f32-planar',
          frameOffset: slice.frameOffset,
          frameCount: slice.frameCount,
        })
        planes.push(data)
      }
      analyser.addFrames(planes)
      coverage?.add(slice)
    })
  }
  return { ...analyser.finish(), coverage: coverage?.finish() ?? null }
}

export interface EgressRecord {
  readonly url: string
  readonly method: string
  /** Bytes sent, or 1 when a streaming body's exact size is not observable. */
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
 * browser's own resource timeline is read, which catches main-context request
 * URLs however they were made. Worker resource timing is not guaranteed to
 * appear in this context, so a clean report remains manual evidence rather
 * than a criterion-9 pass until the worker has its own instrument.
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
      const body = init?.body ?? (input instanceof Request ? input.body : null)
      records.push({ url, method, bodyBytes: bodySize(body) })
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
  // A Request can carry a streaming body whose exact byte count is not
  // synchronously observable. Presence is enough for this safety check: one
  // is a sentinel meaning "non-empty or unknown", not a claimed byte length.
  return body === null || body === undefined ? 0 : 1
}
