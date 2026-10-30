/**
 * VH-139, audit V-01: a file whose data stops before its index says is told
 * apart from a whole one, each track against its own declared end in the
 * part kept, and a track that legitimately differs raises nothing.
 *
 * The index and the analysis pass are read from real MP4s built in memory
 * (`test/helpers/pcm-mp4.ts`); the picture's half runs only in a browser,
 * where its decoder is.
 */

import { EncodedPacketSink } from 'mediabunny'
import { describe, expect, it } from 'vitest'

import { cutShort, pcmMp4, soundTrackOf } from '../../test/helpers/pcm-mp4'
import {
  PICTURE_FRAME_SECONDS,
  picturePcmMp4,
  tracksOf,
} from '../../test/helpers/picture-pcm-mp4'
import { ENDS_EARLY_MARGIN_SECONDS } from '../config/thresholds'
import { formatClockTime } from '../ui/clock-time'
import { analyseSourceAudio } from './audio-plan'
import {
  cardTellsMade,
  declaredExtent,
  endedEarly,
  madeSpanSeconds,
  pictureMadeEndSeconds,
  shortfall,
} from './ends-early'
import { keptDurationSeconds } from './kept-range'

/** A track whose decode reached its end; its last packet starts a 25 fps frame before it. */
const whole = (endSeconds: number) => ({
  decodedEndSeconds: endSeconds,
  declaredEndSeconds: endSeconds,
  lastPacketSeconds: endSeconds - 0.04,
  lastPacketArrived: true,
})
/** A track declared to `endSeconds` whose data, and so its decode, stopped at `decodedEndSeconds`. */
const cut = (decodedEndSeconds: number | null, endSeconds: number) => ({
  decodedEndSeconds,
  declaredEndSeconds: endSeconds,
  lastPacketSeconds: endSeconds - 0.04,
  lastPacketArrived: false,
})

describe('a track against its own declared end', () => {
  it('says nothing of a track that reached it', () => {
    expect(shortfall(whole(30), 0)).toBeNull()
  })

  it('names where a track cut short stops, and where it should have reached', () => {
    expect(shortfall(cut(20.84, 30), 0)).toEqual({
      stopsAtSeconds: 20.84,
      endSeconds: 30,
    })
  })

  it('holds the decode to its last packet’s start, with the margin and no more', () => {
    const at = (decodedEndSeconds: number) =>
      shortfall(
        {
          decodedEndSeconds,
          declaredEndSeconds: 30,
          lastPacketSeconds: 29.96,
          lastPacketArrived: true,
        },
        0,
      )
    expect(at(29.96 - ENDS_EARLY_MARGIN_SECONDS)).toBeNull()
    expect(at(29.96 - ENDS_EARLY_MARGIN_SECONDS - 0.01)).not.toBeNull()
  })

  it('never counts a hole across the out-point as the file ending', () => {
    // An MP4 gives the packet before a hole the hole's length: its declared
    // end is the out-point, while its sound stops a second and a half before.
    expect(
      shortfall(
        {
          decodedEndSeconds: 1,
          declaredEndSeconds: 2.5,
          lastPacketSeconds: 0.5,
          lastPacketArrived: true,
        },
        0,
      ),
    ).toBeNull()
  })

  it('finds a cut that took only a long final frame, the frame before ending where it starts (Codex review)', () => {
    // Slides at one frame in five seconds, cut before the last frame's bytes:
    // the decode reaches the last packet's start and no further.
    const slides = { declaredEndSeconds: 30, lastPacketSeconds: 25 }
    expect(shortfall({ ...slides, decodedEndSeconds: 25, lastPacketArrived: false }, 0)).toEqual({
      stopsAtSeconds: 25,
      endSeconds: 30,
    })
    // The same file whole: the last frame is there and shown to its end.
    expect(shortfall({ ...slides, decodedEndSeconds: 30, lastPacketArrived: true }, 0)).toBeNull()
  })

  it('gives the start of the part kept for a track that decoded nothing there', () => {
    expect(shortfall(cut(null, 30), 25)).toEqual({
      stopsAtSeconds: 25,
      endSeconds: 30,
    })
  })

  it('says nothing of a track that declares nothing in the part kept', () => {
    expect(
      shortfall(
        {
          decodedEndSeconds: null,
          declaredEndSeconds: null,
          lastPacketSeconds: null,
          lastPacketArrived: false,
        },
        0,
      ),
    ).toBeNull()
  })
})

describe('what a finished job carries short of the index', () => {
  it('is nothing for a whole file, with sound or without', () => {
    expect(endedEarly(whole(30), whole(30), 0)).toBeNull()
    expect(endedEarly(whole(30), null, 0)).toBeNull()
  })

  it('names both tracks of the file the audit found, and the length made', () => {
    expect(endedEarly(cut(20.92, 30), cut(20.84, 30), 0)).toEqual({
      picture: { stopsAtSeconds: 20.92, endSeconds: 30 },
      sound: { stopsAtSeconds: 20.84, endSeconds: 30 },
      made: { startSeconds: 0, endSeconds: 20.92 },
    })
  })

  it('raises nothing where sound and picture legitimately differ, by less than the margin or more', () => {
    // Each track against its own end: a sound that the file says stops early
    // is the file as it is, and the pipeline already carries it (VH-42).
    expect(endedEarly(whole(30), whole(30 - ENDS_EARLY_MARGIN_SECONDS / 2), 0)).toBeNull()
    expect(endedEarly(whole(30), whole(25), 0)).toBeNull()
    expect(endedEarly(whole(25), whole(30), 0)).toBeNull()
  })

  it('keeps the record whole when only the sound stopped: the picture was made in full', () => {
    const ended = endedEarly(whole(30), cut(20, 30), 0)
    expect(ended?.sound).toEqual({ stopsAtSeconds: 20, endSeconds: 30 })
    expect(ended?.picture).toBeNull()
    expect(ended?.made).toBeNull()
  })

  it('measures a trimmed file against the part kept, from its start', () => {
    expect(endedEarly(cut(20.92, 25), cut(20.84, 25), 5)?.made).toEqual({
      startSeconds: 5,
      endSeconds: 20.92,
    })
    // Cut before the file stops: the part kept is whole.
    expect(endedEarly(whole(18), whole(18), 5)).toBeNull()
  })
})

describe('the index, read from a real file', () => {
  it('declares a cut-short file’s whole length, while its data stops part-way', async () => {
    const bytes = await pcmMp4({ spans: [[0, 3]] })
    const whole = await declaredExtent(await soundTrackOf(bytes), null)
    expect(await declaredExtent(await soundTrackOf(cutShort(bytes, 0.7)), null)).toEqual({
      ...whole,
      lastPacketArrived: false,
    })
    expect(whole.lastPacketArrived).toBe(true)
    expect(whole.declaredEndSeconds).toBeCloseTo(3, 6)
    expect(whole.lastPacketSeconds).toBeGreaterThan(2)
    expect(whole.lastPacketSeconds).toBeLessThan(3)
  })

  it('ends at the out-point for a track running through it', async () => {
    const track = await soundTrackOf(await pcmMp4({ spans: [[0, 3]] }))
    const { declaredEndSeconds, lastPacketSeconds } = await declaredExtent(track, {
      startSeconds: 0.5,
      endSeconds: 2.05,
    })
    expect(declaredEndSeconds).toBeCloseTo(2.05, 6)
    expect(lastPacketSeconds).toBeLessThanOrEqual(2.05)
  })

  it('starts its last packet before a hole across the out-point', async () => {
    const track = await soundTrackOf(
      await pcmMp4({
        spans: [
          [0, 1],
          [2, 3],
        ],
      }),
    )
    expect(
      (await declaredExtent(track, { startSeconds: 0, endSeconds: 1.5 })).lastPacketSeconds,
    ).toBeLessThan(1)
  })

  it('declares nothing for a track that starts after the part kept', async () => {
    const track = await soundTrackOf(await pcmMp4({ spans: [[2, 3]] }))
    expect(await declaredExtent(track, { startSeconds: 0, endSeconds: 1.5 })).toEqual({
      declaredEndSeconds: null,
      lastPacketSeconds: null,
      lastPacketArrived: false,
    })
  })

  it('declares nothing for a track that starts at the out-point, which is not kept (Codex review)', async () => {
    const track = await soundTrackOf(await pcmMp4({ spans: [[1.5, 3]] }))
    expect(
      (await declaredExtent(track, { startSeconds: 0, endSeconds: 1.5 })).lastPacketSeconds,
    ).toBeNull()
  })
})

describe('the analysis pass, over a real file', () => {
  /** Pre-flight's comparison, as the worker makes it. */
  const soundShort = async (
    bytes: Uint8Array,
    range: { startSeconds: number; endSeconds: number } | null,
  ) => {
    const track = await soundTrackOf(bytes)
    const analysis = await analyseSourceAudio(track, undefined, range)
    return shortfall(
      {
        decodedEndSeconds: analysis?.decodedEndSeconds ?? null,
        ...(await declaredExtent(track, range)),
      },
      range?.startSeconds ?? 0,
      // The 3 s file needs a margin under its own length; the rule is the same.
      ENDS_EARLY_MARGIN_SECONDS / 4,
    )
  }

  it('raises nothing for a whole file whose sound starts at the out-point (Codex review)', async () => {
    const bytes = await pcmMp4({ spans: [[1.5, 3]] })
    const range = { startSeconds: 0, endSeconds: 1.5 }
    expect(await analyseSourceAudio(await soundTrackOf(bytes), undefined, range)).toEqual({
      silent: true,
      decodedEndSeconds: null,
    })
    expect(await soundShort(bytes, range)).toBeNull()
  })

  it('decodes a whole file to its end, and finds nothing short', async () => {
    const bytes = await pcmMp4({ spans: [[0, 3]] })
    const analysis = await analyseSourceAudio(await soundTrackOf(bytes))
    expect(analysis?.decodedEndSeconds).toBeCloseTo(3, 6)
    expect(await soundShort(bytes, null)).toBeNull()
  })

  it('finds where a file cut at 70% of its bytes stops', async () => {
    const cut = cutShort(await pcmMp4({ spans: [[0, 3]] }), 0.7)
    const short = await soundShort(cut, null)
    expect(short?.endSeconds).toBeCloseTo(3, 6)
    expect(short?.stopsAtSeconds).toBeGreaterThan(1)
    expect(short?.stopsAtSeconds).toBeLessThan(2.2)
  })

  it('measures a trimmed file against the part kept', async () => {
    const cut = cutShort(await pcmMp4({ spans: [[0, 3]] }), 0.7)
    // A part kept before the cut is whole; one past it is short.
    expect(await soundShort(cut, { startSeconds: 0, endSeconds: 1 })).toBeNull()
    expect((await soundShort(cut, { startSeconds: 0.5, endSeconds: 2.9 }))?.endSeconds).toBeCloseTo(
      2.9,
      6,
    )
  })

  it('never counts a hole as decoded sound, nor as the file ending', async () => {
    const bytes = await pcmMp4({
      spans: [
        [0, 1],
        [2, 3],
      ],
    })
    const analysis = await analyseSourceAudio(await soundTrackOf(bytes))
    expect(analysis?.decodedEndSeconds).toBeCloseTo(3, 6)
    expect(await soundShort(bytes, null)).toBeNull()
    expect(await soundShort(bytes, { startSeconds: 0, endSeconds: 1.5 })).toBeNull()
  })
})

describe('the length made, known before the card is drawn (VH-215)', () => {
  /** Ten seconds of picture and sound, as a recording interleaves them. */
  const lecture = () => picturePcmMp4({ picture: [[0, 10]], sound: [[0, 10]] })

  /** Pre-flight's length made, as the worker joins it: the sound's pass, the picture's read. */
  const madeBeforeTheCard = async (
    bytes: Uint8Array,
    range: { startSeconds: number; endSeconds: number } | null,
  ) => {
    const { picture, sound } = await tracksOf(bytes)
    const measured = sound ? await analyseSourceAudio(sound, undefined, range) : null
    return madeSpanSeconds(
      await pictureMadeEndSeconds(picture, range),
      measured?.decodedEndSeconds ?? null,
      range?.startSeconds ?? 0,
    )
  }

  describe("the picture's end, read from a real file", () => {
    it('takes a whole file’s end from its index, its last declared packet having arrived', async () => {
      const { picture } = await tracksOf(await lecture())
      expect((await declaredExtent(picture, null)).lastPacketArrived).toBe(true)
      expect(await pictureMadeEndSeconds(picture, null)).toBeCloseTo(10, 6)
    })

    it('reads a cut file’s packets to the first the file does not hold, and ends there', async () => {
      const { picture } = await tracksOf(cutShort(await lecture(), 0.7))
      const declared = await declaredExtent(picture, null)
      expect(declared.lastPacketArrived).toBe(false)
      expect(declared.declaredEndSeconds).toBeCloseTo(10, 6)

      const end = (await pictureMadeEndSeconds(picture, null))!
      expect(end).toBeGreaterThan(5)
      expect(end).toBeLessThan(9)
      // Exactly where the bytes stop: the packet ending there arrived, the
      // one starting there did not.
      const sink = new EncodedPacketSink(picture)
      expect(await sink.getPacket(end - PICTURE_FRAME_SECONDS / 2)).not.toBeNull()
      expect(await sink.getPacket(end + PICTURE_FRAME_SECONDS / 2)).toBeNull()
    })

    it('measures a trimmed cut file within the part kept', async () => {
      const bytes = cutShort(await lecture(), 0.7)
      const { picture } = await tracksOf(bytes)
      const untrimmed = (await pictureMadeEndSeconds(picture, null))!
      expect(await pictureMadeEndSeconds(picture, { startSeconds: 2, endSeconds: 9.6 })).toBeCloseTo(
        untrimmed,
        6,
      )
    })

    it('reads the index alone for a keep that ends before the damage', async () => {
      const { picture } = await tracksOf(cutShort(await lecture(), 0.7))
      const range = { startSeconds: 1, endSeconds: 4 }
      expect((await declaredExtent(picture, range)).lastPacketArrived).toBe(true)
      expect(await pictureMadeEndSeconds(picture, range)).toBeCloseTo(4, 6)
    })

    it('finds nothing of a keep that starts after the bytes stop', async () => {
      const { picture } = await tracksOf(cutShort(await lecture(), 0.7))
      expect(await pictureMadeEndSeconds(picture, { startSeconds: 9, endSeconds: 9.8 })).toBeNull()
    })
  })

  describe("the span's composition", () => {
    it('runs from the kept start to the later of the two tracks’ ends, with no margin', () => {
      expect(madeSpanSeconds(7.04, 7.0, 0)).toBeCloseTo(7.04, 9)
      expect(madeSpanSeconds(6.2, 7.0, 0)).toBeCloseTo(7.0, 9)
      expect(madeSpanSeconds(7.04, 7.0, 2)).toBeCloseTo(5.04, 9)
      // Within the record's 1 s margin, the span still says the shortfall.
      expect(madeSpanSeconds(9.6, 9.6, 0)).toBeCloseTo(9.6, 9)
    })

    it('takes the one track there is', () => {
      expect(madeSpanSeconds(7.04, null, 0)).toBeCloseTo(7.04, 9)
      expect(madeSpanSeconds(null, 7.0, 1)).toBeCloseTo(6.0, 9)
    })

    it('is no span when neither track has content, or the length is not finite', () => {
      expect(madeSpanSeconds(null, null, 0)).toBeNull()
      expect(madeSpanSeconds(Number.POSITIVE_INFINITY, 7, 0)).toBeNull()
      expect(madeSpanSeconds(Number.NaN, null, 0)).toBeNull()
      expect(madeSpanSeconds(2, null, 5)).toBeNull()
    })

    it('says the length made of a cut file, never the declared length', async () => {
      const bytes = cutShort(await lecture(), 0.7)
      const made = (await madeBeforeTheCard(bytes, null))!
      const { picture } = await tracksOf(bytes)
      const declared = keptDurationSeconds(null, await picture.computeDuration())
      expect(formatClockTime(declared)).toBe('0:10')
      // The later track: here the sound, which ran past the picture's last
      // whole packet before the bytes stopped.
      expect(made).toBeGreaterThanOrEqual((await pictureMadeEndSeconds(picture, null))!)
      expect(formatClockTime(made)).toBe('0:07')
    })

    it('says a trimmed cut file’s length made from the kept start', async () => {
      const bytes = cutShort(await lecture(), 0.7)
      const whole = (await madeBeforeTheCard(bytes, null))!
      expect(await madeBeforeTheCard(bytes, { startSeconds: 2, endSeconds: 9.6 })).toBeCloseTo(
        whole - 2,
        1,
      )
    })

    it('leaves a whole file’s card as it was: the kept range', async () => {
      const bytes = await lecture()
      expect(formatClockTime((await madeBeforeTheCard(bytes, null))!)).toBe('0:10')
      expect(
        formatClockTime((await madeBeforeTheCard(bytes, { startSeconds: 1, endSeconds: 7 }))!),
      ).toBe(formatClockTime(keptDurationSeconds({ startSeconds: 1, endSeconds: 7 }, 10)))
    })

    it('runs to the sound when it outlasts the picture, and to the picture when it outlasts the sound', async () => {
      const longSound = await picturePcmMp4({ picture: [[0, 6]], sound: [[0, 10]] })
      expect(await madeBeforeTheCard(longSound, null)).toBeCloseTo(10, 6)
      const longPicture = await picturePcmMp4({ picture: [[0, 10]], sound: [[0, 6]] })
      expect(await madeBeforeTheCard(longPicture, null)).toBeCloseTo(10, 6)
      const silent = await picturePcmMp4({ picture: [[0, 10]] })
      expect(await madeBeforeTheCard(silent, null)).toBeCloseTo(10, 6)
    })
  })

  describe('the release guard', () => {
    it('lets a card go that says the length made, to the second', () => {
      expect(cardTellsMade('0:07', 7.04)).toBe(true)
      expect(cardTellsMade('0:07', 6.6)).toBe(true)
    })

    it('refuses a card that says another length, or a length the encode cannot give', () => {
      expect(cardTellsMade('0:10', 7.04)).toBe(false)
      expect(cardTellsMade('0:07', 7.6)).toBe(false)
      expect(cardTellsMade('0:07', null)).toBe(false)
      expect(cardTellsMade('', 7.04)).toBe(false)
    })

    it('refuses a whole file’s card when the encode made less than its last packet, which arrived (Codex re-check)', async () => {
      const bytes = await lecture()
      const { picture } = await tracksOf(bytes)
      // The index's read: the last declared packet is in the file.
      expect((await declaredExtent(picture, null)).lastPacketArrived).toBe(true)
      const card = formatClockTime((await madeBeforeTheCard(bytes, null))!)
      expect(card).toBe('0:10')
      // A decoder that stopped before the last packet that arrived: the
      // encode's own span prints shorter, so the card is never released.
      const encodeMade = madeSpanSeconds(7.0, 7.0, 0)
      expect(cardTellsMade(card, encodeMade)).toBe(false)
      // The encode that reached the end lets the same card go.
      expect(cardTellsMade(card, madeSpanSeconds(10, 10, 0))).toBe(true)
    })
  })
})
