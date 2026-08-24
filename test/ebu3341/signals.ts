/**
 * EBU Tech 3341 Table 1 test signals, synthesised from their published
 * definitions.
 *
 * The EBU distributes these as 48 kHz audio files. Synthesising instead keeps
 * the repository free of binaries and — more usefully — makes each signal's
 * definition readable next to the expectation it feeds, so a failure can be
 * traced to either the meter or the signal.
 *
 * Every duration in Table 1 is an exact whole number of 1 kHz cycles
 * (1.34 s = 1340, 0.15 s = 150, 20 ms = 20), so phase is continuous across
 * segment boundaries without any special handling.
 */

/** One stretch of the signal. `null` means digital silence. */
export interface Segment {
  readonly seconds: number
  readonly peakDbfs: number | null
}

const REFERENCE_HZ = 1000

function amplitude(peakDbfs: number | null): number {
  return peakDbfs === null ? 0 : 10 ** (peakDbfs / 20)
}

/**
 * A sequence of 1 kHz segments, applied in phase to every channel — which is
 * what Table 1 means by "signal applied in phase to both channels
 * simultaneously".
 */
export function sequence(
  sampleRate: number,
  channelCount: number,
  segments: readonly Segment[],
): Float32Array[] {
  const total = segments.reduce((sum, s) => sum + Math.round(s.seconds * sampleRate), 0)
  const mono = new Float32Array(total)

  let offset = 0
  for (const segment of segments) {
    const frames = Math.round(segment.seconds * sampleRate)
    const amp = amplitude(segment.peakDbfs)
    for (let i = 0; i < frames; i++) {
      // Phase from the absolute sample index, so segments join seamlessly.
      const n = offset + i
      mono[n] = amp * Math.sin((2 * Math.PI * REFERENCE_HZ * n) / sampleRate)
    }
    offset += frames
  }

  return Array.from({ length: channelCount }, () => mono.slice())
}

/** A steady 1 kHz tone with an independent level per channel (Table 1 case 6). */
export function perChannelTone(
  sampleRate: number,
  seconds: number,
  perChannelPeakDbfs: readonly number[],
): Float32Array[] {
  const frames = Math.round(seconds * sampleRate)
  return perChannelPeakDbfs.map((dbfs) => {
    const amp = amplitude(dbfs)
    const data = new Float32Array(frames)
    for (let i = 0; i < frames; i++) {
      data[i] = amp * Math.sin((2 * Math.PI * REFERENCE_HZ * i) / sampleRate)
    }
    return data
  })
}

/**
 * A stereo sine specified the way Table 1 cases 15-19 do: by a divisor of the
 * sample rate, a linear amplitude (not dBFS), and a phase in degrees.
 *
 * Case 15 requires a 10 ms taper, and the reason is worth stating: a tone that
 * begins mid-cycle is a step discontinuity whose reconstruction genuinely
 * overshoots, so an untapered tone would measure its own onset rather than the
 * steady state the test is about.
 */
export function truePeakTone(
  sampleRate: number,
  options: {
    readonly divisor: number
    readonly amplitude: number
    readonly phaseDegrees: number
    readonly seconds?: number
    readonly fadeSeconds?: number
  },
): Float32Array[] {
  const seconds = options.seconds ?? 1
  const fadeFrames = Math.round(sampleRate * (options.fadeSeconds ?? 0.01))
  const frames = Math.round(seconds * sampleRate)
  const frequency = sampleRate / options.divisor
  const phase = (options.phaseDegrees * Math.PI) / 180

  const mono = new Float32Array(frames)
  for (let i = 0; i < frames; i++) {
    const envelope =
      fadeFrames > 0 ? Math.min(1, (i + 1) / fadeFrames, (frames - i) / fadeFrames) : 1
    mono[i] = envelope * options.amplitude * Math.sin((2 * Math.PI * frequency * i) / sampleRate + phase)
  }
  return [mono, mono.slice()]
}

/** Windowed-sinc low-pass, used as the anti-aliasing filter for cases 20-23. */
function lowPass(input: Float64Array, normalisedCutoff: number, taps: number): Float64Array {
  const centre = (taps - 1) / 2
  const kernel = new Float64Array(taps)
  let sum = 0
  for (let n = 0; n < taps; n++) {
    const x = n - centre
    const sincValue = x === 0 ? 1 : Math.sin(2 * Math.PI * normalisedCutoff * x) / (Math.PI * x)
    const base = x === 0 ? 2 * normalisedCutoff : sincValue
    const ratio = (2 * Math.PI * n) / (taps - 1)
    const window = 0.42 - 0.5 * Math.cos(ratio) + 0.08 * Math.cos(2 * ratio)
    kernel[n] = base * window
    sum += kernel[n]!
  }
  for (let n = 0; n < taps; n++) kernel[n]! /= sum

  const out = new Float64Array(input.length)
  for (let i = 0; i < input.length; i++) {
    let acc = 0
    for (let n = 0; n < taps; n++) {
      const j = i - n + Math.floor(centre)
      if (j >= 0 && j < input.length) acc += kernel[n]! * input[j]!
    }
    out[i] = acc
  }
  return out
}

/**
 * Table 1 cases 20-23: an fs/6 sine at amplitude 0.50 carrying a single period
 * of fs/4 at amplitude 1.00, synthesised at 4x fs, anti-alias filtered, and
 * decimated back to fs with a sample offset.
 *
 * INTERPRETATION NOTE. Table 1 says the signal is "continuous in phase at both
 * sides of the single period" but does not say where the burst sits or how the
 * two frequencies are joined. This builds it with a continuous phase
 * accumulator — instantaneous frequency switches to fs/4 for exactly one
 * period (phase advancing 2*pi) and then back, so phase never jumps, while
 * amplitude steps 0.5 -> 1.0 -> 0.5. That is the reading that makes the phrase
 * true as written, but it is an interpretation, and a failure here should be
 * weighed against that before it is read as a meter fault.
 */
export function truePeakBurst(sampleRate: number, sampleOffset: number): Float32Array[] {
  const oversampled = sampleRate * 4
  const seconds = 0.25
  const frames = Math.round(seconds * oversampled)

  const baseHz = sampleRate / 6
  const burstHz = sampleRate / 4
  const burstFrames = Math.round(oversampled / burstHz) // exactly one period
  const burstStart = Math.round(frames / 2)

  const high = new Float64Array(frames)
  let phase = 0
  for (let i = 0; i < frames; i++) {
    const inBurst = i >= burstStart && i < burstStart + burstFrames
    const amp = inBurst ? 1.0 : 0.5
    high[i] = amp * Math.sin(phase)
    phase += (2 * Math.PI * (inBurst ? burstHz : baseHz)) / oversampled
  }

  // Taper, so the ends of the synthesised tone are not themselves transients.
  const fade = Math.round(oversampled * 0.01)
  for (let i = 0; i < frames; i++) {
    const envelope = Math.min(1, (i + 1) / fade, (frames - i) / fade)
    high[i]! *= envelope
  }

  const filtered = lowPass(high, 1 / 8, 127) // cutoff at fs/2 of the target rate
  const outFrames = Math.floor((frames - sampleOffset) / 4)
  const mono = new Float32Array(outFrames)
  for (let i = 0; i < outFrames; i++) mono[i] = filtered[sampleOffset + i * 4]!

  return [mono, mono.slice()]
}
