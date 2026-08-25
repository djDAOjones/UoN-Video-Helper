/**
 * Choosing the frame that sustains under a closing transition (VH-22).
 *
 * "Transition with freeze frame" holds the final picture for a second while
 * the branding fades in over it. Holding the LAST decoded frame is the obvious
 * implementation and the wrong one: a source whose final frame is black-
 * flashed, half-drawn or torn — not rare in screen recordings — would show
 * that flaw, full-screen, for a whole second. Every source in the corpus ends
 * on a bright frame (VH-25), so nothing hides it.
 *
 * So we walk back from the end and take the last frame that looks like its
 * neighbours. The walk is bounded and always yields something: a source that
 * is genuinely unstable at the end still gets a freeze, just not a better one.
 *
 * Known limitation: outlier rejection compares against the window's median,
 * which is only meaningful when the window is roughly level. On a window that
 * both slopes AND ends badly — a fade that finishes on a blown frame — the bad
 * frame is correctly rejected but the walk goes further back than the end of
 * the fade. Handling that properly means fitting the slope and predicting from
 * it, which is more machinery than the case is worth; the combination is rare,
 * and the result is still a reasonable frame rather than a broken one.
 */

import type { VideoSample, VideoSampleSink } from 'mediabunny'

/** How far back to look. Beyond this the freeze stops matching what preceded it. */
export const CLEAN_FRAME_SEARCH_SECONDS = 0.5

/**
 * How far a frame's mean luma may sit from the median of the window before it
 * is treated as an outlier, in 0–255. Roughly 6%: wide enough to accept an
 * ordinary cut or a gesture, narrow enough to reject a black flash or a blown
 * frame.
 */
export const CLEAN_FRAME_TOLERANCE = 16

/** Luma steps at or below this are noise, not movement. */
const NOISE_FLOOR = 3

/**
 * Whether the window is a deliberate TREND rather than a defect.
 *
 * This distinction is the whole difficulty. A source that fades to black ends
 * on frames that look nothing like the median — but that ending is intended,
 * and freezing mid-fade would look like a bug. A source with a black flash on
 * its final frame looks superficially similar and must be walked back.
 *
 * What separates them is that a fade moves repeatedly in one direction, while
 * a flash is a single jump. So a trend needs at least two significant steps,
 * all the same way; one big step is a discontinuity however large it is.
 */
function isTrend(lumas: readonly number[]): boolean {
  let rising = 0
  let falling = 0
  for (let i = 1; i < lumas.length; i++) {
    const step = lumas[i]! - lumas[i - 1]!
    if (step > NOISE_FLOOR) rising++
    else if (step < -NOISE_FLOOR) falling++
  }
  const significant = rising + falling
  return significant >= 2 && (rising === 0 || falling === 0)
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = sorted.length >> 1
  return sorted.length % 2 === 0 ? (sorted[middle - 1]! + sorted[middle]!) / 2 : sorted[middle]!
}

/**
 * Picks which frame to freeze, given the mean luma of a window of candidates.
 *
 * @param lumas - Mean luma per frame in presentation order, so the LAST entry
 *   is the final frame of the source.
 * @returns The index into `lumas` to freeze. Takes the final frame when the
 *   window is a deliberate trend such as a fade; otherwise the latest frame
 *   that is not an outlier; and the final frame if every candidate is one.
 */
export function pickCleanFrameIndex(lumas: readonly number[]): number {
  if (lumas.length === 0) throw new RangeError('Need at least one candidate frame')
  if (lumas.length === 1) return 0

  // A fade or a dissolve is the picture the author intended. Take its last
  // frame; walking back would freeze the middle of the fade.
  if (isTrend(lumas)) return lumas.length - 1

  const reference = median(lumas)
  for (let i = lumas.length - 1; i >= 0; i--) {
    if (Math.abs(lumas[i]! - reference) <= CLEAN_FRAME_TOLERANCE) return i
  }
  return lumas.length - 1
}

/**
 * Finds the frame to freeze at the end of a track.
 *
 * Walks back from `endSeconds` using random access rather than buffering: a
 * ring of candidate frames would cost 33 MB each at 4K, and the search only
 * needs their brightness. Luma is measured on a deliberately tiny canvas —
 * this is a whole-frame average, so resolution buys nothing.
 *
 * @returns The chosen sample, which the caller owns and must close, or `null`
 *   if the track yielded nothing in the window.
 */
export async function findFreezeFrame(
  sink: VideoSampleSink,
  endSeconds: number,
  frameRate: number,
): Promise<VideoSample | null> {
  const step = 1 / frameRate
  const count = Math.max(1, Math.round(CLEAN_FRAME_SEARCH_SECONDS * frameRate))

  const canvas = new OffscreenCanvas(32, 18)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Could not get a 2d context to measure frames')

  // Oldest first, so the index that `pickCleanFrameIndex` returns lines up
  // with presentation order.
  const candidates: { sample: VideoSample; luma: number }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const at = endSeconds - i * step
    if (at < 0) continue
    const sample = await sink.getSample(at)
    if (!sample) continue
    // The same frame can answer two nearby timestamps on a low-rate source;
    // keeping both would weight it twice in the median.
    if (candidates.at(-1)?.sample.timestamp === sample.timestamp) {
      sample.close()
      continue
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    sample.draw(context, 0, 0, canvas.width, canvas.height)
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    candidates.push({ sample, luma: meanLuma(data) })
  }

  if (candidates.length === 0) return null

  const chosen = pickCleanFrameIndex(candidates.map((entry) => entry.luma))
  for (const [index, entry] of candidates.entries()) {
    if (index !== chosen) entry.sample.close()
  }
  return candidates[chosen]!.sample
}

/** Mean luma of an RGBA buffer, using Rec. 709 coefficients. */
export function meanLuma(rgba: Uint8ClampedArray): number {
  let total = 0
  const pixels = rgba.length / 4
  for (let i = 0; i < rgba.length; i += 4) {
    total += 0.2126 * rgba[i]! + 0.7152 * rgba[i + 1]! + 0.0722 * rgba[i + 2]!
  }
  return pixels === 0 ? 0 : total / pixels
}
