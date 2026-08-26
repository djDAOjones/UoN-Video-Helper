/**
 * Synthesised test material for the acceptance run.
 *
 * Generated rather than checked in: the repository stays free of binaries, the
 * fixtures stay reproducible, and — the part that matters — their properties
 * are known exactly, so a measurement can be compared against a number rather
 * than against an impression.
 *
 * These stand in for the corpus in spec section 13, not for it. Real
 * recordings (VH-M1) are the only way to answer whether EchoVideo accepts the
 * output or whether a slide is legible to a person.
 */

import {
  AudioSample,
  AudioSampleSource,
  BufferTarget,
  Mp4OutputFormat,
  Output,
  VideoSample,
  VideoSampleSource,
} from 'mediabunny'

export interface FixtureOptions {
  readonly width: number
  readonly height: number
  readonly seconds: number
  /**
   * How long the AUDIO runs, when it must differ from the picture. Defaults to
   * `seconds`. Real recordings whose audio outruns their picture are the case
   * VH-42 exists for, and the corpus contains none — so the only way to have
   * one is to build it.
   */
  readonly audioSeconds?: number
  /** Nominal frame rate. Ignored when `variableFrameRate` is set. */
  readonly frameRate: number
  /** Irregular frame gaps, as a screen recorder under load produces. */
  readonly variableFrameRate?: boolean
  /** Draw fine text, to stand in for slide content. */
  readonly slideText?: boolean
  /**
   * Change the WHOLE frame every frame, to stand in for camera motion.
   *
   * The default fixture is screen-like: a static background with one moving
   * box, which H.264 predicts almost for free. Both presets therefore produce
   * nearly the same file on it, so comparing them there measures nothing —
   * which is why the acceptance harness needs this (VH-16).
   */
  readonly cameraMotion?: boolean
  /** Lossless audio, so clipping and exact levels survive into the file. */
  readonly losslessAudio?: boolean
  readonly audio?: AudioShape
}

export interface AudioShape {
  readonly startPeakDbfs: number
  /**
   * 1 for mono. The corpus has one mono lecture, and mono is where the
   * estimate and the encoder disagree about which bitrate is being spent.
   */
  readonly channels?: number
  /**
   * Source sample rate. The corpus splits nine/nine between 44.1 and 48 kHz,
   * and everything downstream is conformed to 48 (VH-43).
   */
  readonly sampleRate?: number
  readonly endPeakDbfs?: number
  /** Impulses at whole-second marks, paired with a white video frame. */
  readonly syncMarkers?: boolean
  readonly pauseSeconds?: number
  readonly pauseEverySeconds?: number
}

/** Times, in seconds, at which a sync marker starts. */
export function syncMarkerTimes(seconds: number): number[] {
  const times: number[] = []
  for (let t = 1; t < seconds - 0.5; t += 5) times.push(t)
  return times
}

/**
 * How long each marker is held.
 *
 * Not one frame. A single-frame marker is exactly what constant-frame-rate
 * conform is entitled to drop or duplicate — the first version of this
 * harness lost one marker in twelve that way and reported it as five seconds
 * of drift. Holding the marker across several frames at any plausible rate
 * makes its presence robust while its ONSET stays the thing being measured.
 */
export const SYNC_MARKER_SECONDS = 0.2

function drawFrame(
  context: OffscreenCanvasRenderingContext2D,
  options: FixtureOptions,
  index: number,
  time: number,
  isMarker: boolean,
): void {
  const { width, height } = options

  if (isMarker) {
    // A full white frame. Unmistakable against everything else here, which
    // is what makes it findable without guessing a threshold.
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    return
  }

  context.fillStyle = '#101820'
  context.fillRect(0, 0, width, height)

  if (options.slideText) {
    context.fillStyle = '#f4f4f4'
    const size = Math.max(12, Math.round(height / 34))
    context.font = `${size}px sans-serif`
    for (let row = 0; row < 12; row++) {
      context.fillText(
        `Body text at ${size}px — legibility row ${row} — the quick brown fox`,
        Math.round(width * 0.04),
        Math.round(height * 0.1) + row * Math.round(size * 1.6),
      )
    }
  }

  if (options.cameraMotion) {
    // A field that is different everywhere on every frame, so inter-frame
    // prediction has nothing cheap to lean on. Deterministic rather than
    // random: a fixture that differs between runs turns a size comparison into
    // a coin toss.
    let seed = (index + 1) * 2654435761
    const next = (): number => {
      seed = (seed ^ (seed << 13)) >>> 0
      seed = (seed ^ (seed >>> 17)) >>> 0
      seed = (seed ^ (seed << 5)) >>> 0
      return seed / 0xffffffff
    }
    const cell = Math.max(8, Math.round(width / 40))
    for (let y = 0; y < height; y += cell) {
      for (let x = 0; x < width; x += cell) {
        context.fillStyle = `hsl(${Math.round(next() * 360)} 60% ${Math.round(25 + next() * 50)}%)`
        context.fillRect(x, y, cell, cell)
      }
    }
    return
  }

  // Something moving, so the encoder is not handed a static image.
  context.fillStyle = `hsl(${(index * 7) % 360} 80% 55%)`
  const boxWidth = Math.round(width * 0.15)
  context.fillRect(
    Math.round((index * 11) % Math.max(1, width - boxWidth)),
    Math.round(height * 0.78),
    boxWidth,
    Math.round(height * 0.14),
  )

  context.fillStyle = '#f4f4f4'
  context.font = `${Math.max(12, Math.round(height / 20))}px sans-serif`
  context.fillText(`t=${time.toFixed(2)}s`, Math.round(width * 0.04), Math.round(height * 0.72))
}

function buildAudio(options: FixtureOptions, sampleRate: number, channels: number): Float32Array {
  const shape = options.audio
  const seconds = options.audioSeconds ?? options.seconds
  const frames = Math.round(seconds * sampleRate)
  const data = new Float32Array(frames * channels)
  if (!shape) return data

  const markerStarts = shape.syncMarkers
    ? syncMarkerTimes(seconds).map((t) => Math.round(t * sampleRate))
    : []
  const markerFrames = Math.round(sampleRate * SYNC_MARKER_SECONDS)
  const endPeak = shape.endPeakDbfs ?? shape.startPeakDbfs

  for (let n = 0; n < frames; n++) {
    const t = n / sampleRate
    let value = 0

    // A loud burst at each marker, held for the same span as the white frames
    // so both survive re-encoding. Only the onset is measured.
    let inMarker = false
    for (const start of markerStarts) {
      if (n >= start && n < start + markerFrames) {
        inMarker = true
        break
      }
    }

    if (inMarker) {
      value = 0.9 * Math.sin(2 * Math.PI * 1000 * (t - Math.floor(t)))
    } else {
      const paused =
        shape.pauseSeconds && shape.pauseEverySeconds
          ? t % (shape.pauseEverySeconds + shape.pauseSeconds) >= shape.pauseEverySeconds
          : false
      if (!paused) {
        const drift = shape.startPeakDbfs + (endPeak - shape.startPeakDbfs) * (t / seconds)
        const amplitude = 10 ** (drift / 20)
        const syllable = t * 4
        const within = syllable - Math.floor(syllable)
        const envelope = within < 0.7 ? 0.5 - 0.5 * Math.cos((Math.PI * within) / 0.35) : 0
        if (envelope > 0) {
          const f0 = 150 + 20 * Math.sin(2 * Math.PI * 0.3 * t)
          value =
            amplitude *
            envelope *
            (0.6 * Math.sin(2 * Math.PI * f0 * t) + 0.3 * Math.sin(2 * Math.PI * 2 * f0 * t)) *
            0.75
        }
      }
    }

    for (let ch = 0; ch < channels; ch++) data[n * channels + ch] = value
  }

  return data
}

/** Irregular gaps averaging roughly the nominal rate, as a loaded screen recorder produces. */
const VFR_GAPS = [0.02, 0.055, 0.031, 0.078, 0.024, 0.096, 0.04, 0.018]

/** Builds one fixture and returns it as a file. */
export async function buildFixture(options: FixtureOptions): Promise<File> {
  const sampleRate = options.audio?.sampleRate ?? 48000
  const channels = options.audio?.channels ?? 2

  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: false }),
    target: new BufferTarget(),
  })
  const video = new VideoSampleSource({ codec: 'avc', bitrate: 6_000_000 })
  output.addVideoTrack(
    video,
    options.variableFrameRate ? {} : { frameRate: options.frameRate },
  )

  const hasAudio = options.audio !== undefined
  const audioSource = hasAudio
    ? new AudioSampleSource(
        options.losslessAudio ? { codec: 'pcm-f32' } : { codec: 'aac', bitrate: 192_000 },
      )
    : null
  if (audioSource) output.addAudioTrack(audioSource)

  await output.start()

  const canvas = new OffscreenCanvas(options.width, options.height)
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('Could not create a 2D context for the fixture')

  const markerTimes = options.audio?.syncMarkers ? syncMarkerTimes(options.seconds) : []
  const isMarkerFrame = (time: number, duration: number): boolean =>
    markerTimes.some(
      (marker) => time + duration > marker && time < marker + SYNC_MARKER_SECONDS,
    )

  let time = 0
  let index = 0
  while (time < options.seconds) {
    const duration = options.variableFrameRate
      ? VFR_GAPS[index % VFR_GAPS.length]!
      : 1 / options.frameRate
    drawFrame(context, options, index, time, isMarkerFrame(time, duration))
    const sample = new VideoSample(canvas, { timestamp: time, duration })
    await video.add(sample)
    sample.close()
    time += duration
    index++
  }
  video.close()

  if (audioSource) {
    const sample = new AudioSample({
      data: buildAudio(options, sampleRate, channels),
      format: 'f32',
      numberOfChannels: channels,
      sampleRate,
      timestamp: 0,
    })
    await audioSource.add(sample)
    sample.close()
    audioSource.close()
  }

  await output.finalize()
  const buffer = output.target.buffer
  if (!buffer) throw new Error('Fixture produced no data')
  return new File([new Uint8Array(buffer)], 'fixture.mp4', { type: 'video/mp4' })
}
