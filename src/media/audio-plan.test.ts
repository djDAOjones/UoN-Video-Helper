import type * as MediabunnyModule from 'mediabunny'
import { AudioSample, type InputAudioTrack } from 'mediabunny'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { detectSourceWarnings } from '../audio/warnings'
import { AUDIO_GAP_FILL } from '../config/audio'
import { analyseSourceAudio, createContentAudioProcessor, type AudioPlan } from './audio-plan'
import type { SourceTimeline } from './source-timeline'

const decoded = vi.hoisted(() => ({ samples: [] as AudioSample[] }))

vi.mock('mediabunny', async (importOriginal) => {
  const actual = await importOriginal<typeof MediabunnyModule>()
  return {
    ...actual,
    AudioSampleSink: class {
      samples(): AsyncIterable<AudioSample> {
        const samples = decoded.samples[Symbol.iterator]()
        return {
          [Symbol.asyncIterator]: () => ({ next: () => Promise.resolve(samples.next()) }),
        }
      }
    },
  }
})

const SAMPLE_RATE = 1000

beforeEach(() => {
  decoded.samples = []
})

function plan(
  channelCount = 1,
  envelope: AudioPlan['envelope'] = { gainDb: new Float64Array(0), stepSeconds: 0.1 },
): AudioPlan {
  return {
    envelope,
    gainDb: 0,
    sampleRate: SAMPLE_RATE,
    channelCount,
  }
}

function sample(channels: readonly (readonly number[])[], timestamp: number): AudioSample {
  const frameCount = channels[0]?.length ?? 0
  const data = new Float32Array(frameCount * channels.length)
  for (let channel = 0; channel < channels.length; channel++) {
    data.set(channels[channel]!, channel * frameCount)
  }
  return new AudioSample({
    data,
    format: 'f32-planar',
    numberOfChannels: channels.length,
    numberOfFrames: frameCount,
    sampleRate: SAMPLE_RATE,
    timestamp,
  })
}

function timeline(originSeconds: number, audioEndSeconds: number): SourceTimeline {
  return { originSeconds, videoEndSeconds: audioEndSeconds, audioEndSeconds }
}

async function processSamples(
  inputs: AudioSample[],
  options: {
    readonly offsetSeconds?: number
    readonly channelCount?: number
    readonly sourceTimeline?: SourceTimeline
    readonly plan?: AudioPlan
  } = {},
): Promise<{
  readonly values: number[]
  readonly timestamps: number[]
  readonly chunkFrames: number[]
}> {
  const defaultEnd = Math.max(
    0,
    ...inputs.map((input) => input.timestamp + input.numberOfFrames / SAMPLE_RATE),
  )
  const sourceTimeline = options.sourceTimeline ?? timeline(0, defaultEnd)
  const processor = createContentAudioProcessor(options.plan ?? plan(options.channelCount ?? 1), {
    offsetSeconds: options.offsetSeconds ?? 0,
    sourceTimeline,
    durationSeconds: sourceTimeline.audioEndSeconds ?? 0,
    fadeIn: false,
    fadeOut: false,
  })

  const values: number[] = []
  const timestamps: number[] = []
  const chunkFrames: number[] = []
  const drain = async (samples: AsyncIterable<AudioSample>): Promise<void> => {
    for await (const emitted of samples) {
      try {
        chunkFrames.push(emitted.numberOfFrames)
        const plane = new Float32Array(emitted.numberOfFrames)
        emitted.copyTo(plane, { planeIndex: 0, format: 'f32-planar' })
        for (let frame = 0; frame < plane.length; frame++) {
          values.push(plane[frame]!)
          timestamps.push(emitted.timestamp + frame / SAMPLE_RATE)
        }
      } finally {
        emitted.close()
      }
    }
  }

  for (const input of inputs) {
    let processed: AsyncIterable<AudioSample>
    try {
      processed = processor.process(input)
    } finally {
      input.close()
    }
    await drain(processed)
  }
  await drain(processor.flush())
  return { values, timestamps, chunkFrames }
}

describe('createContentAudioProcessor timeline', () => {
  it('preserves a source impulse at sample zero and the exact frame count', async () => {
    const onset = [0.9, ...Array.from({ length: 31 }, () => 0)]
    const { values, timestamps } = await processSamples([sample([onset, onset], 0)], {
      channelCount: 2,
    })

    expect(values).toHaveLength(onset.length)
    expect(Math.abs(values[0]!)).toBeGreaterThan(0.05)
    expect(timestamps[0]).toBe(0)
    expect(timestamps.at(-1)).toBeCloseTo((onset.length - 1) / SAMPLE_RATE, 10)
  })

  it('turns an internal timestamp gap into continuous explicit PCM', async () => {
    const first = Array.from({ length: 10 }, () => 0.2)
    const second = Array.from({ length: 10 }, () => 0.3)
    const { values, timestamps } = await processSamples([
      sample([first], 0),
      sample([second], 0.03),
    ])

    expect(values).toHaveLength(40)
    expect(timestamps[9]).toBeCloseTo(0.009, 10)
    expect(timestamps[10]).toBeCloseTo(0.01, 10)
    expect(timestamps[30]).toBeCloseTo(0.03, 10)
    expect(timestamps.at(-1)).toBeCloseTo(0.039, 10)
  })

  it('preserves a delayed source start after an opening-branding offset', async () => {
    const frames = Array.from({ length: 12 }, () => 0.2)
    const { values, timestamps } = await processSamples([sample([frames], 0.25)], {
      offsetSeconds: 5,
    })

    expect(values).toHaveLength(262)
    expect(timestamps[0]).toBe(5)
    expect(timestamps[250]).toBeCloseTo(5.25, 10)
    expect(timestamps.at(-1)).toBeCloseTo(5.261, 10)
  })

  it('rebases a negative shared origin without dropping its PCM', async () => {
    const first = Array.from({ length: 10 }, () => 0.2)
    const second = Array.from({ length: 10 }, () => 0.3)
    const { values, timestamps } = await processSamples(
      [sample([first], -0.02), sample([second], -0.01)],
      { sourceTimeline: timeline(-0.02, 0.02) },
    )

    expect(values).toHaveLength(20)
    expect(timestamps[0]).toBe(0)
    expect(timestamps.at(-1)).toBeCloseTo(0.019, 10)
  })

  it('accounts exactly across chunks shorter than the limiter look-ahead', async () => {
    const chunks = [
      sample([[0.1, 0.2]], 0),
      sample([[0.3]], 0.002),
      sample([[0.4, 0.5, 0.6]], 0.003),
    ]
    const { values, timestamps } = await processSamples(chunks)

    expect(values).toHaveLength(6)
    expect(timestamps).toEqual([0, 0.001, 0.002, 0.003, 0.004, 0.005])
  })

  it('rejects a material overlap instead of changing sync or deleting PCM', async () => {
    const first = Array.from({ length: 10 }, () => 0.2)
    const second = Array.from({ length: 10 }, () => 0.3)

    await expect(
      processSamples([sample([first], 0), sample([second], 0.005)]),
    ).rejects.toMatchObject({
      name: 'UnsupportedAudioTimelineError',
      overlapFrames: 5,
    })
  })

  it('absorbs only a one-frame timestamp rounding overlap', async () => {
    const first = Array.from({ length: 10 }, () => 0.2)
    const second = Array.from({ length: 10 }, () => 0.3)
    const { values, timestamps } = await processSamples([
      sample([first], 0),
      sample([second], 0.009),
    ])

    expect(values).toHaveLength(20)
    expect(timestamps.at(-1)).toBeCloseTo(0.019, 10)
  })

  it('fills a trailing container gap through the mapped audio endpoint', async () => {
    const frames = Array.from({ length: 10 }, () => 0.2)
    const { values, timestamps } = await processSamples([sample([frames], 0)], {
      sourceTimeline: timeline(0, 0.03),
    })

    expect(values).toHaveLength(30)
    expect(timestamps.at(-1)).toBeCloseTo(0.029, 10)
  })

  it('streams a gap longer than 30 seconds in bounded chunks', async () => {
    const first = Array.from({ length: 100 }, () => 0.2)
    const second = Array.from({ length: 10 }, () => 0.3)
    const { values, timestamps, chunkFrames } = await processSamples([
      sample([first], 0),
      sample([second], 31.1),
    ])

    expect(values).toHaveLength(31_110)
    expect(Math.max(...chunkFrames)).toBeLessThanOrEqual(AUDIO_GAP_FILL.chunkFrames)
    expect(timestamps[31_100]).toBeCloseTo(31.1, 10)
    expect(timestamps.at(-1)).toBeCloseTo(31.109, 10)
  })

  it('advances the envelope identically for implicit and explicit gap PCM', async () => {
    const envelope = { gainDb: new Float64Array([0, 6, -6, 3, 0]), stepSeconds: 0.5 }
    const configuredPlan = plan(1, envelope)
    const first = Array.from({ length: 100 }, () => 0.15)
    const second = Array.from({ length: 100 }, () => 0.2)
    const implicit = await processSamples([sample([first], 0), sample([second], 2.1)], {
      plan: configuredPlan,
    })
    const explicit = await processSamples(
      [sample([[...first, ...Array.from({ length: 2000 }, () => 0), ...second]], 0)],
      { plan: configuredPlan },
    )

    expect(implicit.timestamps).toHaveLength(explicit.timestamps.length)
    for (let index = 0; index < implicit.timestamps.length; index++) {
      expect(implicit.timestamps[index]).toBeCloseTo(explicit.timestamps[index]!, 10)
    }
    expect(implicit.values).toHaveLength(explicit.values.length)
    for (let index = 0; index < implicit.values.length; index++) {
      expect(implicit.values[index]).toBeCloseTo(explicit.values[index]!, 6)
    }
  })

  it('checks cancellation between bounded encode-gap blocks', async () => {
    let checks = 0
    const processor = createContentAudioProcessor(plan(), {
      offsetSeconds: 0,
      sourceTimeline: timeline(0, 20.001),
      durationSeconds: 20.001,
      fadeIn: false,
      fadeOut: false,
      checkCancelled: () => {
        checks++
        if (checks === 3) throw new Error('cancelled during gap')
      },
    })
    const input = sample([[0.2]], 20)
    let processed: AsyncIterable<AudioSample>
    try {
      processed = processor.process(input)
    } finally {
      input.close()
    }

    await expect(
      (async () => {
        for await (const emitted of processed) emitted.close()
      })(),
    ).rejects.toThrow('cancelled during gap')
    expect(checks).toBe(3)
  })
})

describe('timestamp-aware source analysis', () => {
  it('rejects overlapping decoded timestamps during pre-flight analysis', async () => {
    decoded.samples = [sample([[0.1, 0.1]], 0), sample([[0.2, 0.2]], 0)]
    const track = {
      getSampleRate: () => Promise.resolve(SAMPLE_RATE),
      getNumberOfChannels: () => Promise.resolve(1),
    } as unknown as InputAudioTrack

    await expect(analyseSourceAudio(track, timeline(0, 0.003))).rejects.toMatchObject({
      name: 'UnsupportedAudioTimelineError',
      overlapFrames: 2,
    })
  })

  it('includes a greater-than-30-second internal gap in duration and silence warnings', async () => {
    const tone = Array.from(
      { length: 4000 },
      (_, frame) => 0.1 * Math.sin((2 * Math.PI * 100 * frame) / SAMPLE_RATE),
    )
    decoded.samples = [sample([tone], 0), sample([tone], 35)]
    const track = {
      getSampleRate: () => Promise.resolve(SAMPLE_RATE),
      getNumberOfChannels: () => Promise.resolve(1),
    } as unknown as InputAudioTrack

    const analysis = await analyseSourceAudio(track, timeline(0, 39))
    const warnings = detectSourceWarnings(analysis)

    expect(analysis.durationSeconds).toBe(39)
    expect(
      warnings.find((warning) => warning.code === 'extended-silence')?.detail.seconds,
    ).toBeGreaterThan(30)
  })

  it('yields to the worker task queue so cancellation interrupts a large gap', async () => {
    decoded.samples = [sample([[0.1]], 300)]
    const track = {
      getSampleRate: () => Promise.resolve(SAMPLE_RATE),
      getNumberOfChannels: () => Promise.resolve(1),
    } as unknown as InputAudioTrack
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 0)

    await expect(
      analyseSourceAudio(track, timeline(0, 300.001), controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})
