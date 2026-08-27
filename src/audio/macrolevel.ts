/**
 * Spec section 5.2 step 3: conditional macro-levelling.
 *
 * This is the "windowed loudness normalisation" the brief asked for, and the
 * stage rationale section 3.3 warns about: the obvious implementation causes
 * the pumping it is meant to prevent. Applying a moving-window correction
 * unconditionally, with a short window and no rate limit, IS an aggressive
 * automatic gain control.
 *
 * Four properties turn the same idea into a transparent one, and all four are
 * load-bearing:
 *
 *  1. Conditional. Skipped entirely when LRA <= 9 LU. Most single-speaker
 *     recordings never trigger it, and processing that is not needed can only
 *     do harm.
 *  2. A 15 s window. Long enough to track a speaker moving away from the
 *     microphone, far too slow to respond to a syllable.
 *  3. A 1 dB/s slew limit. The single most important one: audible pumping is
 *     by definition a fast level change, and this makes a fast change
 *     impossible however much the envelope wants one.
 *  4. A pause freeze below -45 LUFS. Without it, silence is "too quiet" and
 *     gets turned up into a wash of room tone and air conditioning. Applied to
 *     the raw correction AND to the finished envelope: the first keeps a
 *     pause's enormous demand out of the smoother, the second stops the
 *     centred window reaching forward into the pause and undoing the freeze.
 *
 * The envelope only ever corrects long-term drift. Hitting the target loudness
 * is the single linear gain's job, one stage later.
 */

import { MACRO_LEVEL } from '../config/audio'

/** Envelope resolution. 10 Hz is ample for something that moves at 1 dB/s. */
const ENVELOPE_STEP_SECONDS = 0.1

export interface MacroLevelInput {
  /** Gated integrated loudness of the source, the level the envelope pulls toward. */
  readonly integratedLufs: number
  readonly loudnessRangeLu: number
  /** Short-term loudness curve from the analysis pass. */
  readonly shortTermLufs: readonly number[]
  /** Step between consecutive short-term values, in seconds. */
  readonly stepSeconds: number
}

export interface GainEnvelope {
  /** Gain in dB at each step. Empty when macro-levelling does not apply. */
  readonly gainDb: Float64Array
  readonly stepSeconds: number
}

/** Spec 5.2 step 3: only recordings that actually drift get touched. */
export function shouldApplyMacroLevelling(loudnessRangeLu: number): boolean {
  return loudnessRangeLu > MACRO_LEVEL.applyAboveLraLu
}

/**
 * Builds the gain envelope.
 *
 * Returns an empty envelope when the recording is already consistent, which
 * the caller treats as "do nothing" rather than "apply zero gain" — they are
 * the same arithmetic but not the same intent.
 */
export function buildGainEnvelope(input: MacroLevelInput): GainEnvelope {
  const empty: GainEnvelope = { gainDb: new Float64Array(0), stepSeconds: ENVELOPE_STEP_SECONDS }
  if (!shouldApplyMacroLevelling(input.loudnessRangeLu)) return empty
  if (input.shortTermLufs.length === 0 || !Number.isFinite(input.integratedLufs)) return empty

  // Resample the short-term curve onto the envelope grid.
  const stride = Math.max(1, Math.round(ENVELOPE_STEP_SECONDS / input.stepSeconds))
  const shortTerm: number[] = []
  for (let i = 0; i < input.shortTermLufs.length; i += stride) shortTerm.push(input.shortTermLufs[i]!)
  if (shortTerm.length === 0) return empty

  /** Whether step `i` carries speech rather than a pause. */
  const audibleAt = (i: number): boolean => {
    const value = shortTerm[i]
    return value !== undefined && Number.isFinite(value) && value >= MACRO_LEVEL.freezeBelowLufs
  }

  // 1. Raw correction, with pauses held at the last real value BEFORE
  //    smoothing. A pause reads -60 LUFS or lower, which would otherwise
  //    demand a large boost and drag the smoothed envelope up with it for the
  //    surrounding 15 seconds.
  const raw = new Float64Array(shortTerm.length)
  let lastValid = 0
  for (let i = 0; i < shortTerm.length; i++) {
    if (audibleAt(i)) lastValid = input.integratedLufs - shortTerm[i]!
    raw[i] = lastValid
  }

  // 2. Smooth over 15 s, centred, using a running sum.
  const half = Math.max(1, Math.round(MACRO_LEVEL.windowSeconds / ENVELOPE_STEP_SECONDS / 2))
  const smoothed = new Float64Array(raw.length)
  let sum = 0
  let count = 0
  for (let i = 0; i < raw.length; i++) {
    const entering = i + half
    if (entering < raw.length) {
      sum += raw[entering]!
      count++
    }
    if (i === 0) {
      for (let j = 0; j <= Math.min(half - 1, raw.length - 1); j++) {
        sum += raw[j]!
        count++
      }
    }
    const leaving = i - half - 1
    if (leaving >= 0) {
      sum -= raw[leaving]!
      count--
    }
    smoothed[i] = sum / Math.max(1, count)
  }

  // 3. Clamp, 4. slew-limit, and 5. freeze — in that order, which is spec
  //    5.2 step 3's own order and not the one this used to have.
  //
  //    Clamping before the slew limit matters because clamping after it would
  //    let the envelope creep past the bound between steps.
  //
  //    The freeze appears twice on purpose, and the two are doing different
  //    jobs (VH-61 / review R-10). Step 1 stops a pause's enormous raw demand
  //    entering the smoother. This one stops the SMOOTHED envelope moving
  //    during the pause at all — and it is needed because the window is
  //    centred, so speech fifteen seconds later was reaching back and lifting
  //    the gain inside a pause that had been frozen. Measured: a gain frozen
  //    at -5 dB drifted to -1.29 dB mid-pause, and to +1.85 dB in the silence
  //    before a recording's first word. Freezing the applied envelope is what
  //    spec 5.2 step 3 asks for when it lists the freeze last.
  //
  //    Expressed as "do not advance", not as "hold a saved value", so it can
  //    never introduce a step the slew limit would have forbidden.
  const maxStep = MACRO_LEVEL.slewDbPerSecond * ENVELOPE_STEP_SECONDS
  const gainDb = new Float64Array(smoothed.length)
  let previous = 0
  for (let i = 0; i < smoothed.length; i++) {
    if (audibleAt(i)) {
      const clamped = Math.max(-MACRO_LEVEL.clampDb, Math.min(MACRO_LEVEL.clampDb, smoothed[i]!))
      previous += Math.max(-maxStep, Math.min(maxStep, clamped - previous))
    }
    gainDb[i] = previous
  }

  return { gainDb, stepSeconds: ENVELOPE_STEP_SECONDS }
}

/**
 * Applies a gain envelope to streaming audio.
 *
 * Interpolates linearly between envelope steps, so the gain applied to
 * consecutive samples never jumps — a stepped envelope would introduce its own
 * discontinuities at exactly the rate the slew limit exists to prevent.
 */
export class MacroLeveller {
  private frameIndex = 0
  private readonly framesPerStep: number

  constructor(
    private readonly envelope: GainEnvelope,
    sampleRate: number,
  ) {
    this.framesPerStep = envelope.stepSeconds * sampleRate
  }

  /** True when there is nothing to apply, so the caller can skip the work entirely. */
  get isNoOp(): boolean {
    return this.envelope.gainDb.length === 0
  }

  process(channels: readonly Float32Array[]): void {
    if (this.isNoOp) return

    const { gainDb } = this.envelope
    const last = gainDb.length - 1
    const frameCount = channels[0]?.length ?? 0

    for (let i = 0; i < frameCount; i++) {
      const position = (this.frameIndex + i) / this.framesPerStep
      const index = Math.min(last, Math.floor(position))
      const next = Math.min(last, index + 1)
      const fraction = position - index
      const db = gainDb[index]! + (gainDb[next]! - gainDb[index]!) * Math.min(1, Math.max(0, fraction))
      const gain = 10 ** (db / 20)
      for (let ch = 0; ch < channels.length; ch++) channels[ch]![i]! *= gain
    }
    this.frameIndex += frameCount
  }
}
