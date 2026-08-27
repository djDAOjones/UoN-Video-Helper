/**
 * The picture half of the finished-file contract.
 *
 * `output-verification.ts` next door checks the decoded audio against spec §13
 * criterion 2 and is pure arithmetic. This one asks a cruder question that
 * nothing was asking at all: does the finished file's picture track actually
 * yield a frame?
 *
 * A job could finish with an empty or unreadable video track and still post
 * `processed`, so the screen said "Your video is ready" over a file with no
 * picture in it (VH-73, ported from VH-71 WP1). Decoding one sample is enough
 * — the failure this catches is a track that decodes to nothing, not a subtly
 * wrong one, and walking the whole file again would double the finishing pass
 * that VH-51 already made visible.
 */

import { VideoSampleSink, type Input, type InputVideoTrack } from 'mediabunny'

import { throwIfAborted } from './pipeline'

export class OutputIntegrityError extends Error {
  override readonly name = 'OutputIntegrityError'
}

/** Only the part of `Input` this needs, so a test can hand it two lines. */
type ReadableVideoInput = Pick<Input, 'getPrimaryVideoTrack'>
type ClosableSample = { close(): void }
type VideoSamples = (track: InputVideoTrack) => AsyncIterable<ClosableSample>

const decodedSamples: VideoSamples = (track) => new VideoSampleSink(track).samples()

/**
 * Throws unless the finished file's primary picture track yields a sample.
 *
 * @param signal - Checked through the project's own {@link throwIfAborted},
 *   NOT `AbortSignal.throwIfAborted`. The native one raises a `DOMException`
 *   named `AbortError`, which `job.worker.ts` would report as a failed job;
 *   ours raises `CancelledError`, which it reports as cancelled. VH-57 made
 *   every phase answer Cancel and this is a phase.
 * @param samples - Injectable so the empty-track case can be tested without a
 *   browser. Defaults to a real decode.
 */
export async function requireReadableOutputVideo(
  input: ReadableVideoInput,
  signal?: AbortSignal,
  samples: VideoSamples = decodedSamples,
): Promise<void> {
  const track = await input.getPrimaryVideoTrack()
  throwIfAborted(signal)
  if (!track) throw new OutputIntegrityError('The finished file has no readable picture track')

  let decodedOne = false
  for await (const sample of samples(track)) {
    try {
      throwIfAborted(signal)
      decodedOne = true
    } finally {
      sample.close()
    }
    break
  }
  throwIfAborted(signal)
  if (!decodedOne) throw new OutputIntegrityError('The finished picture track has no samples')
}
