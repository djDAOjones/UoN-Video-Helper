import { VideoSampleSink, type Input, type InputVideoTrack } from 'mediabunny'

export class OutputIntegrityError extends Error {
  override readonly name = 'OutputIntegrityError'
}

type ReadableVideoInput = Pick<Input, 'getPrimaryVideoTrack'>
type ClosableSample = { close(): void }
type VideoSamples = (track: InputVideoTrack) => AsyncIterable<ClosableSample>

const decodedSamples: VideoSamples = (track) => new VideoSampleSink(track).samples()

/** A result is not saveable until its primary picture yields a real sample. */
export async function requireReadableOutputVideo(
  input: ReadableVideoInput,
  signal: AbortSignal,
  samples: VideoSamples = decodedSamples,
): Promise<void> {
  const track = await input.getPrimaryVideoTrack()
  signal.throwIfAborted()
  if (!track) throw new OutputIntegrityError('The finished file has no readable picture track')

  let foundSample = false
  for await (const sample of samples(track)) {
    try {
      signal.throwIfAborted()
      foundSample = true
    } finally {
      sample.close()
    }
    break
  }
  signal.throwIfAborted()
  if (!foundSample) throw new OutputIntegrityError('The finished picture track has no samples')
}
