/**
 * VH-185, wish line VH-139.6: a part kept that holds less sound than one of
 * the meter's gating blocks is no sound to level. Pre-flight says so and the
 * job runs silent, rather than encoding the whole video for the output check
 * to refuse a loudness measured on nothing. Since VH-206, pre-flight says the
 * part kept has too little audio, not that the video has none.
 *
 * Read from real MP4s built in memory (`test/helpers/pcm-mp4.ts`), whose
 * sound comes in 100 ms blocks of a steady level. The plan's measured bite
 * (VH-193) is read from the same files.
 */

import { describe, expect, it } from 'vitest'

import { cutShort, pcmMp4, soundTrackOf } from '../../test/helpers/pcm-mp4'
import { BLOCK_SECONDS } from '../audio/loudness'
import { clearLogRecords, getLogRecords } from '../core/logger'
import { detectSourceWarnings } from '../audio/warnings'
import { analyseSourceAudio, planAudio } from './audio-plan'
import { declaredExtent, shortfall } from './ends-early'
import { snapKeptRangeToFrames } from './kept-range'

/** Kept from the start to `endSeconds`, as a trim's out-point. */
const keptTo = (endSeconds: number) => ({ startSeconds: 0, endSeconds })

/**
 * Pre-flight's warnings as the worker composes them (`job.worker.ts`): the
 * analysis's own result, silent or not, and where the sound stops short of
 * the index, each as code and cause (VH-206).
 */
async function preflight(
  bytes: Uint8Array,
  range: { readonly startSeconds: number; readonly endSeconds: number },
) {
  const track = await soundTrackOf(bytes)
  const measured = await analyseSourceAudio(track, undefined, range)
  const short = shortfall(
    {
      decodedEndSeconds: measured.decodedEndSeconds ?? null,
      ...(await declaredExtent(track, range)),
    },
    range.startSeconds,
  )
  return detectSourceWarnings(measured, short, false).map((warning) => [warning.code, warning.reason])
}

const TOO_LITTLE_KEPT = [['no-audio', 'kept-too-little']]

describe('a sliver of late sound in the part kept (VH-185)', () => {
  // VH-139's case: a sound starting at 4 s, kept to 0:04, held 22 ms of the
  // encoder's priming. Here the first block starts 20 ms before the cut.
  const sliver = () => pcmMp4({ spans: [[3.98, 6]] })

  it('is no sound to pre-flight, which says the part kept has too little and nothing else', async () => {
    const track = await soundTrackOf(await sliver())
    const measured = await analyseSourceAudio(track, undefined, keptTo(4))
    expect(measured).toEqual({ silent: true, decodedEndSeconds: 4 })
    // The sliver decoded whole, so the sound did not stop early, as the
    // worker compares it.
    const short = shortfall(
      {
        decodedEndSeconds: measured.decodedEndSeconds ?? null,
        ...(await declaredExtent(track, keptTo(4))),
      },
      0,
    )
    expect(short).toBeNull()
    expect(await preflight(await sliver(), keptTo(4))).toEqual(TOO_LITTLE_KEPT)
  })

  it('says too little kept, not no audio, for a part with no sound decoded at all (VH-206)', async () => {
    // The track starts after the out-point: the file has audio, and keeping
    // more is the way forward.
    expect(await preflight(await pcmMp4({ spans: [[5, 6]] }), keptTo(4))).toEqual(TOO_LITTLE_KEPT)
  })

  it('says the file ends early, not too little kept, where the sound it declares never arrives (VH-206)', async () => {
    // Cut at half its bytes, the sound stops near 5 s; the 2 s kept after it,
    // over the 1 s margin, is declared and never decoded.
    const cut = cutShort(await pcmMp4({ spans: [[0, 10]] }), 0.5)
    const range = { startSeconds: 6, endSeconds: 8 }
    expect(await analyseSourceAudio(await soundTrackOf(cut), undefined, range)).toMatchObject({
      silent: true,
    })
    expect(await preflight(cut, range)).toEqual([['ends-early', undefined]])
  })

  it('makes the job a silent one, with no plan to level and the decode’s end kept', async () => {
    expect(
      await planAudio(
        await soundTrackOf(await sliver()),
        undefined,
        undefined,
        undefined,
        keptTo(4),
      ),
    ).toEqual({ silent: true, decodedEndSeconds: 4 })
  })

  it('is measured against the meter’s own block, not a second figure', async () => {
    // Kept to 1.5 s: 50 ms of sound is under the block; exactly one block is not.
    const under = await pcmMp4({ spans: [[1.5 - 0.05, 3]] })
    const whole = await pcmMp4({ spans: [[1.5 - BLOCK_SECONDS, 3]] })
    expect(
      await analyseSourceAudio(await soundTrackOf(under), undefined, keptTo(1.5)),
    ).toMatchObject({ silent: true })
    expect(
      await analyseSourceAudio(await soundTrackOf(whole), undefined, keptTo(1.5)),
    ).not.toHaveProperty('silent')
    // Pre-flight says the cause of the one under, and nothing of the whole block (VH-206).
    expect(await preflight(under, keptTo(1.5))).toEqual(TOO_LITTLE_KEPT)
    expect(await preflight(whole, keptTo(1.5))).not.toContainEqual(TOO_LITTLE_KEPT[0])
  })

  it('still levels a part kept with a block of sound or more', async () => {
    const plan = await planAudio(
      await soundTrackOf(await pcmMp4({ spans: [[1, 3]] })),
      undefined,
      undefined,
      undefined,
      keptTo(1.5),
    )
    expect(plan).not.toHaveProperty('silent')
    expect('silent' in plan ? null : plan.analysis.integratedLufs).toBeGreaterThan(-70)
  })

  it('levels exactly one block of sound, when planning as when checking', async () => {
    const whole = await pcmMp4({ spans: [[1.5 - BLOCK_SECONDS, 3]] })
    const plan = await planAudio(
      await soundTrackOf(whole),
      undefined,
      undefined,
      undefined,
      keptTo(1.5),
    )
    expect(plan).not.toHaveProperty('silent')
  })

  it('is judged on the range placed on frame edges, as the job places it (Codex review)', async () => {
    // Kept to 4.10 s of a 25 fps picture, sound from 3.71 s: 390 ms as asked,
    // 410 ms once the cut sits on the edge of the frame it falls in, which is
    // the range both pre-flight and the job measure (`keptRangeOnFrames`).
    const track = await soundTrackOf(await pcmMp4({ spans: [[3.71, 6]] }))
    const asked = keptTo(4.1)
    const placed = snapKeptRangeToFrames(asked, null, {
      timestampSeconds: 4.08,
      durationSeconds: 0.04,
    })
    expect(placed.endSeconds).toBeCloseTo(4.12, 9)
    expect(await analyseSourceAudio(track, undefined, asked)).toMatchObject({ silent: true })
    expect(await analyseSourceAudio(track, undefined, placed)).not.toHaveProperty('silent')
    // As asked, it is too little kept (VH-206); as placed, it is levelled and
    // pre-flight says nothing of it.
    const bytes = await pcmMp4({ spans: [[3.71, 6]] })
    expect(await preflight(bytes, asked)).toEqual(TOO_LITTLE_KEPT)
    expect(await preflight(bytes, placed)).not.toContainEqual(TOO_LITTLE_KEPT[0])
    expect(await planAudio(track, undefined, undefined, undefined, placed)).not.toHaveProperty(
      'silent',
    )
  })

  it('leaves an untrimmed file as it was', async () => {
    // Out of this item's scope (decisions, VH-185): the guard is the trim's.
    expect(
      await analyseSourceAudio(await soundTrackOf(await pcmMp4({ spans: [[0, 0.2]] }))),
    ).not.toHaveProperty('silent')
  })
})

describe('the limiter’s bite, measured in the plan (VH-193)', () => {
  it('is the logged figures’ own: the unlimited chain plus the gain, less the limited pass', async () => {
    clearLogRecords()
    const plan = await planAudio(
      await soundTrackOf(await pcmMp4({ spans: [[0, 3]] })),
      undefined,
      undefined,
      undefined,
      keptTo(3),
    )
    if ('silent' in plan) throw new Error('levelled, not silent')
    const logged = getLogRecords().find((entry) => entry.message === 'chain planned')?.data as
      Record<string, number> | undefined
    expect(plan.limiterBiteLu).not.toBeNull()
    // Unrounded in the plan; the log's figures are rounded to the hundredth.
    expect(logged?.['limiterBiteLu']).toBeCloseTo(plan.limiterBiteLu ?? Number.NaN, 2)
    expect(plan.limiterBiteLu).toBeCloseTo(
      (logged?.['afterChainLufs'] ?? 0) + plan.gainDb - (logged?.['limitedLufs'] ?? 0),
      1,
    )
  })
})
