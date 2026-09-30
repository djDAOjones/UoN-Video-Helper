/**
 * Measuring what the audio encoder costs in loudness, on this job's audio.
 *
 * Spec 5.2 step 5's gain is solved so the chain lands on target, and AAC then
 * moves the result — by 0.04 to 0.38 LU across the real corpus (VH-83). This
 * module answers "by how much, here": windows of the chain's own output are
 * encoded at the job's exact audio configuration, decoded again, and measured
 * on both sides.
 *
 * Bounded by design. The windows are a fixed budget however long the source
 * is (`CODEC_PROBE`), they are fed to the encoder as they pass rather than
 * collected, and the only thing held is their AAC — a few megabytes. Nothing
 * here scales with the file, which is the streaming rule in `AGENTS.md`.
 *
 * The window arithmetic is pure and tested in Node. The encode and decode are
 * WebCodecs, cannot be mocked usefully, and are verified in a browser.
 */

import {
  AudioSampleSink,
  AudioSampleSource,
  BlobSource,
  BufferTarget,
  Input,
  Mp4InputFormat,
  Mp4OutputFormat,
  Output,
  type AudioEncodingConfig,
} from 'mediabunny'

import { AudioAnalyser } from '../audio/analyse'
import {
  CODEC_PROBE,
  ENCODE_TRUE_PEAK_HEADROOM_DB,
  LIMITER,
  TRUE_PEAK_CEILING_DBTP,
} from '../config/audio'
import { log } from '../core/logger'
import { toPlanar, toSample } from './audio-frames'

/** A half-open range of frames, `[start, end)`, in the chain's output stream. */
export interface ProbeWindow {
  readonly start: number
  readonly end: number
}

/**
 * Chooses which frames of the programme the probe encodes.
 *
 * Evenly spread, because the codec's cost varies along a file and one
 * contiguous excerpt mis-predicted the whole by up to 0.3 LU. Each window is
 * centred in its own equal share of the programme, so the first and last are
 * not pinned to the title card and the sign-off. A programme no longer than
 * the budget gets one window covering all of it, which is exact.
 *
 * @param totalFrames - Length of the chain's output, in frames.
 * @param sampleRate - Frames per second of that output.
 * @returns Sorted, non-overlapping windows inside `[0, totalFrames)`.
 */
export function planProbeWindows(
  totalFrames: number,
  sampleRate: number,
  budget: { readonly windowSeconds: number; readonly maximumWindows: number } = CODEC_PROBE,
): ProbeWindow[] {
  if (!(totalFrames > 0) || !(sampleRate > 0)) return []

  const windowFrames = Math.round(budget.windowSeconds * sampleRate)
  if (windowFrames <= 0 || budget.maximumWindows <= 0) return []
  if (totalFrames <= windowFrames * budget.maximumWindows) {
    return [{ start: 0, end: totalFrames }]
  }

  const windows: ProbeWindow[] = []
  for (let index = 0; index < budget.maximumWindows; index++) {
    const centre = ((index + 0.5) / budget.maximumWindows) * totalFrames
    const start = Math.round(centre - windowFrames / 2)
    windows.push({ start, end: start + windowFrames })
  }
  return windows
}

/**
 * Cuts the frames that fall inside the windows out of a stream of blocks.
 *
 * The chain hands over blocks of whatever size the decoder produced, and a
 * window may begin or end in the middle of one. This keeps a running position
 * and returns, for each block, the pieces the probe wants — in order, never
 * a frame twice.
 */
export class WindowRouter {
  private position = 0
  private next = 0

  /** @param windows - From {@link planProbeWindows}: sorted and non-overlapping. */
  constructor(private readonly windows: readonly ProbeWindow[]) {}

  /**
   * @param channels - The next block of the stream, planar.
   * @returns The parts of it inside a window, each planar. Usually none or one.
   */
  route(channels: readonly Float32Array[]): Float32Array[][] {
    const frames = channels[0]?.length ?? 0
    const blockStart = this.position
    const blockEnd = blockStart + frames
    this.position = blockEnd

    const pieces: Float32Array[][] = []
    while (this.next < this.windows.length) {
      const window = this.windows[this.next]!
      if (window.start >= blockEnd) break
      const from = Math.max(window.start, blockStart)
      const to = Math.min(window.end, blockEnd)
      if (to > from) {
        pieces.push(channels.map((plane) => plane.slice(from - blockStart, to - blockStart)))
      }
      // The window continues into the next block: come back to it.
      if (window.end > blockEnd) break
      this.next++
    }
    return pieces
  }
}

/**
 * The ceiling the limiter must hold so the FINISHED file stays under spec
 * 5.1's -2.0 dBTP, given what this job's encode was measured to add.
 *
 * Spec 5.2 step 6. The standing allowance (`ENCODE_TRUE_PEAK_HEADROOM_DB`) is
 * the floor: a measurement can ask for more headroom, never for less, because
 * less buys nothing — the loudness target is solved after the limiter — and
 * too little is a job refused at the very end. It is capped as well, so a
 * probe that measured nonsense cannot crush the programme.
 *
 * @param overshootDb - True peak after the round trip minus before it, or
 *   `null` when it was not measured.
 * @returns The limiter's working ceiling, in dBTP.
 */
export function limiterCeilingFor(overshootDb: number | null): number {
  if (overshootDb === null || !Number.isFinite(overshootDb)) return LIMITER.ceilingDbtp
  const wanted = overshootDb + CODEC_PROBE.overshootMarginDb
  const headroom = Math.min(
    CODEC_PROBE.maximumHeadroomDb,
    Math.max(ENCODE_TRUE_PEAK_HEADROOM_DB, wanted),
  )
  return TRUE_PEAK_CEILING_DBTP - headroom
}

/** What the round trip did to the probed audio. */
export interface CodecCost {
  /** Integrated loudness before the encode minus after it. Positive is a loss. */
  readonly costLu: number
  /** True peak after the decode minus before the encode, in dB. */
  readonly overshootDb: number
  /** How much audio the figure rests on. */
  readonly probedSeconds: number
}

/**
 * One probe: fed the chain's output as it is produced, asked for the cost at
 * the end.
 */
export class CodecProbe {
  private readonly router: WindowRouter
  private readonly before: AudioAnalyser
  /** Routed audio not yet handed to the encoder; see {@link add}. */
  private pending: Float32Array[][] = []
  private pendingFrames = 0
  private fedFrames = 0
  private failed = false

  private constructor(
    private readonly output: Output<Mp4OutputFormat, BufferTarget>,
    private readonly source: AudioSampleSource,
    private readonly sampleRate: number,
    channelCount: number,
    windows: readonly ProbeWindow[],
  ) {
    this.router = new WindowRouter(windows)
    this.before = new AudioAnalyser({ sampleRate, channelCount })
  }

  /**
   * Opens a probe for one traversal.
   *
   * @param config - The job's exact audio encoding config: the cost belongs to
   *   a codec at a bitrate, and another bitrate's answer is another answer.
   * @returns `null` when the encoder could not be set up. Unmeasurable means
   *   uncorrected, not broken — the same rule `encoder-delay.ts` follows.
   */
  static async open(options: {
    readonly config: AudioEncodingConfig
    readonly sampleRate: number
    readonly channelCount: number
    readonly totalFrames: number
  }): Promise<CodecProbe | null> {
    const windows = planProbeWindows(options.totalFrames, options.sampleRate)
    if (windows.length === 0) return null
    try {
      const output = new Output({
        // Named, as always. In memory is deliberate HERE and nowhere else: what
        // is written is a fixed few minutes of AAC, not the media file.
        format: new Mp4OutputFormat({ fastStart: false }),
        target: new BufferTarget(),
      })
      const source = new AudioSampleSource(options.config)
      output.addAudioTrack(source)
      await output.start()
      return new CodecProbe(output, source, options.sampleRate, options.channelCount, windows)
    } catch (cause) {
      log.warn('codec-probe', 'could not start; the gain will not allow for the codec', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      return null
    }
  }

  /**
   * Takes the next block of chain output and encodes whatever of it is wanted.
   *
   * Handed to the encoder a second at a time rather than block by block. The
   * decoder's blocks are about 20 ms, so a second's worth per call cuts the
   * encoder calls roughly fiftyfold. The saving is modest — about 0.4 s on a
   * 130 s probe, measured 2026-09-30 — and it costs one second of held audio,
   * which is the whole of what is held.
   */
  async add(channels: readonly Float32Array[]): Promise<void> {
    const pieces = this.router.route(channels)
    if (this.failed) return
    for (const piece of pieces) {
      const frames = piece[0]?.length ?? 0
      if (frames === 0) continue
      this.before.addFrames(piece)
      this.pending.push(piece)
      this.pendingFrames += frames
      if (this.pendingFrames >= this.sampleRate) await this.feedPending()
    }
  }

  /** Joins what is pending into one sample and gives it to the encoder. */
  private async feedPending(): Promise<void> {
    if (this.pendingFrames === 0 || this.failed) return
    const channelCount = this.pending[0]?.length ?? 0
    const joined = Array.from({ length: channelCount }, () => new Float32Array(this.pendingFrames))
    let at = 0
    for (const piece of this.pending) {
      for (let ch = 0; ch < channelCount; ch++) joined[ch]!.set(piece[ch]!, at)
      at += piece[0]?.length ?? 0
    }
    this.pending = []
    this.pendingFrames = 0

    // Stamped from a running count, so the windows form one gapless stream
    // whatever distance apart they were in the source.
    const sample = toSample(joined, this.sampleRate, this.fedFrames / this.sampleRate)
    this.fedFrames += at
    try {
      await this.source.add(sample)
    } catch (cause) {
      // Stop feeding, keep the traversal: the loudness it is measuring is
      // still wanted, and the job can run without this figure.
      this.failed = true
      log.warn('codec-probe', 'encode failed; the gain will not allow for the codec', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
    } finally {
      sample.close()
    }
  }

  /** Abandons the probe without measuring. For a cancelled traversal. */
  async cancel(): Promise<void> {
    try {
      await this.output.cancel()
    } catch {
      // Already finalized or never started. Nothing to undo.
    }
  }

  /**
   * Decodes what was encoded and compares.
   *
   * @returns `null` when there is no figure worth using: the probe failed,
   *   nothing measurable was fed, or the answer is outside
   *   `CODEC_PROBE.plausibleCostLu`.
   */
  async finish(): Promise<CodecCost | null> {
    await this.feedPending()
    if (this.failed || this.fedFrames === 0) {
      await this.cancel()
      return null
    }
    try {
      this.source.close()
      await this.output.finalize()
      const buffer = this.output.target.buffer
      if (!buffer) return null

      const input = new Input({
        formats: [new Mp4InputFormat()],
        source: new BlobSource(new Blob([new Uint8Array(buffer)])),
      })
      const track = await input.getPrimaryAudioTrack()
      if (!track) return null
      const [sampleRate, channelCount] = await Promise.all([
        track.getSampleRate(),
        track.getNumberOfChannels(),
      ])
      const after = new AudioAnalyser({ sampleRate, channelCount })
      for await (const decoded of new AudioSampleSink(track).samples()) {
        try {
          after.addFrames(toPlanar(decoded, channelCount))
        } finally {
          decoded.close()
        }
      }

      const measuredBefore = this.before.finish()
      const measuredAfter = after.finish()
      const costLu = measuredBefore.integratedLufs - measuredAfter.integratedLufs
      const { minimum, maximum } = CODEC_PROBE.plausibleCostLu
      // Silence on either side gives -Infinity and a difference that is not a
      // number; a wild figure means the probe measured something other than
      // the codec. Neither may move the gain.
      if (!Number.isFinite(costLu) || costLu < minimum || costLu > maximum) {
        log.warn('codec-probe', 'implausible figure ignored', {
          costLu: Number.isFinite(costLu) ? Math.round(costLu * 1000) / 1000 : null,
        })
        return null
      }
      return {
        costLu,
        overshootDb: measuredAfter.truePeakDbtp - measuredBefore.truePeakDbtp,
        probedSeconds: this.fedFrames / this.sampleRate,
      }
    } catch (cause) {
      log.warn('codec-probe', 'could not measure; the gain will not allow for the codec', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      return null
    }
  }
}
