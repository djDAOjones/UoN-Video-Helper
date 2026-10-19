/**
 * The title card as the job's frames (VH-127): the worker's own fit and draw,
 * how long the card holds on the output's frame grid, and the silence under it.
 *
 * The page fits the card first and refuses at a field; the worker fits again
 * with the fonts it has loaded, because a document and a worker can measure
 * the same text differently, and a card that does not fit is never drawn. The
 * card's text is the user's own words: nothing here logs it or puts it in an
 * error's message, which `handleProcess` logs.
 *
 * Kept apart from `title-card.ts`, which the page imports too: this module
 * reaches the worker's failure codes and fonts.
 */

import { GAP_SILENCE_BLOCK_SECONDS } from '../config/audio'
import { LONGEST_CLOSING_SECONDS } from '../config/branding'
import { TITLE_CARD_SECONDS } from '../config/cards'
import { log } from '../core/logger'
import { JobFailureError } from '../workers/failure'
import type { TitleCardRequest, TitleCardText } from '../workers/protocol'
import {
  CARD_HEADING_FAMILY,
  cardFamilies,
  drawTitleCard,
  fit,
  staffCardBlocks,
  submissionCardBlocks,
  type CardBlock,
  type CardFit,
  type CardFonts,
  type FrameSize,
} from './title-card'

/** How long the card holds, in the output's whole frames. */
export interface TitleCardSpan {
  readonly frames: number
  /** Those frames' length, so the content after the card starts on the frame grid. */
  readonly durationSeconds: number
}

/**
 * {@link TITLE_CARD_SECONDS} rounded to the output's whole frames: 125 at
 * 25 fps, 150 at 29.97 (5.005 s). The content offset is that count over the
 * rate, never the nominal five seconds, so the first content frame lands on
 * the grid the card's frames are on.
 */
export function titleCardSpan(frameRate: number): TitleCardSpan {
  const frames = Math.round(TITLE_CARD_SECONDS * frameRate)
  return { frames, durationSeconds: frames / frameRate }
}

/**
 * What pre-flight adds to the kept length for the size and time estimates:
 * the longest closing and the title card, whether or not either is chosen,
 * since both are chosen after pre-flight (VH-31). Over-stating by a few
 * seconds on a job without them is the safe direction, and ticking the card's
 * box moves no estimate.
 */
export function brandingAllowanceSeconds(frameRate: number): number {
  return LONGEST_CLOSING_SECONDS + titleCardSpan(frameRate).durationSeconds
}

/** One block of the card's silence, planar, at its place on the output's clock. */
export interface SilenceBlock {
  readonly timestampSeconds: number
  readonly channels: Float32Array[]
}

/**
 * Silence from `fromSeconds` to `toSeconds` at the source plan's rate and
 * channel count, a block of at most {@link GAP_SILENCE_BLOCK_SECONDS} at a
 * time and each made only when asked for (AGENTS.md, "Streaming, not
 * buffering"). It is not the source's sound, so it bypasses the chain, as a
 * branding bed does (spec §4.4); the output check's gate leaves it out.
 */
export function* cardSilence(
  fromSeconds: number,
  toSeconds: number,
  sampleRate: number,
  channelCount: number,
): Generator<SilenceBlock> {
  const frames = Math.max(0, Math.round((toSeconds - fromSeconds) * sampleRate))
  const size = Math.max(1, Math.floor(sampleRate * GAP_SILENCE_BLOCK_SECONDS))
  for (let done = 0; done < frames; done += size) {
    const length = Math.min(size, frames - done)
    yield {
      timestampSeconds: fromSeconds + done / sampleRate,
      channels: Array.from({ length: channelCount }, () => new Float32Array(length)),
    }
  }
}

/** A card's blocks, by its layout: the staff card's fields, or Submission's. */
export function titleCardBlocks(card: TitleCardText): CardBlock[] {
  return card.layout === 'staff' ? staffCardBlocks(card.text) : submissionCardBlocks(card.text)
}

/**
 * The worker's own fit of the card, staff or Submission.
 *
 * @throws JobFailureError `title-card-refused` when the fit refuses. The
 *   message says only that: not the field, and never the text, because the
 *   worker logs it and the diagnostics may say no more than that a card was on.
 */
export function fitTitleCardForJob(card: TitleCardText, frame: FrameSize, fonts: CardFonts): CardFit {
  const fitted = fit(titleCardBlocks(card), frame, fonts)
  if (fitted.refused !== null) {
    throw new JobFailureError('title-card-refused', "The worker's own fit refused the title card")
  }
  return fitted
}

/**
 * Loads Lora Bold into the worker's own fonts, which a document's never reach.
 * One that fails to load leaves Georgia in place, as on the page
 * (`brand-assets.ts`), and the fit then measures Georgia.
 */
async function loadHeadingFont(url: string): Promise<void> {
  const face = new FontFace(CARD_HEADING_FAMILY, `url(${JSON.stringify(url)}) format('woff2')`, {
    weight: '700',
    style: 'normal',
  })
  try {
    self.fonts.add(await face.load())
  } catch (cause) {
    log.warn('worker', 'heading font did not load; the title card falls back to Georgia', {
      error: cause instanceof Error ? cause.name : 'unknown',
    })
  }
}

/**
 * The card, fitted with the worker's fonts and drawn once at the output's size.
 * The pipeline holds this one picture for the card's frames.
 *
 * @throws JobFailureError `title-card-refused` when the worker's fit refuses.
 */
export async function drawTitleCardFrame(
  request: TitleCardRequest,
  frame: FrameSize,
): Promise<OffscreenCanvas> {
  if (request.headingFontUrl !== null) await loadHeadingFont(request.headingFontUrl)
  const canvas = new OffscreenCanvas(frame.widthPx, frame.heightPx)
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('Could not create a 2D context for the title card')
  const families = cardFamilies(request.cjkFontStack)
  const measure = (font: string, text: string): number => {
    context.font = font
    return context.measureText(text).width
  }
  const card = fitTitleCardForJob(request, frame, { families, measure })
  drawTitleCard(context, card, families, request.colours)
  return canvas
}
