/**
 * What does the AAC round trip cost, and can a short excerpt predict it?
 *
 * VH-83. The chain solves its gain for -16 LUFS and the codec then moves the
 * result: on `AMCS3059` the delivered file measured 0.38 LU below what the
 * chain produced. This measures that cost directly — the chain's own output
 * against the same audio encoded and decoded at the job's exact audio config —
 * over the whole programme and over excerpts of several lengths and positions.
 *
 * Holds the whole processed audio in memory, which the product must never do
 * and a two-minute measurement may. Dev-only; not built.
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
} from 'mediabunny'

import { AudioAnalyser, type AudioAnalysis } from '../audio/analyse'
import { AudioChain } from '../audio/chain'
import { PRESETS, type PresetId } from '../config/presets'
import { toPlanar, toSample } from '../media/audio-frames'
import { planAudio } from '../media/audio-plan'
import { WindowRouter, planProbeWindows } from '../media/codec-probe'
import { audioEncodingConfigFor } from '../media/encoding'
import { openInput } from '../media/inspect'
import { AudioGapFiller } from '../media/source-timeline'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

const query = new URLSearchParams(location.search)
const path = query.get('file') ?? '/samples/AMCS3059 - Module in a Minute (002).mp4'
const presetId: PresetId = query.get('preset') === 'smaller' ? 'smaller' : 'best'

const fixed = (value: number, places = 2): string =>
  Number.isFinite(value) ? value.toFixed(places) : String(value)

function analyse(channels: readonly Float32Array[], sampleRate: number): AudioAnalysis {
  const analyser = new AudioAnalyser({ sampleRate, channelCount: channels.length })
  // In blocks, as the pipeline feeds it, rather than as one giant frame.
  const block = 4096
  const frames = channels[0]?.length ?? 0
  for (let start = 0; start < frames; start += block) {
    analyser.addFrames(channels.map((plane) => plane.subarray(start, Math.min(frames, start + block))))
  }
  return analyser.finish()
}

function join(blocks: Float32Array[][], channelCount: number): Float32Array[] {
  const frames = blocks.reduce((total, block) => total + (block[0]?.length ?? 0), 0)
  const out = Array.from({ length: channelCount }, () => new Float32Array(frames))
  let at = 0
  for (const block of blocks) {
    for (let ch = 0; ch < channelCount; ch++) out[ch]!.set(block[ch]!, at)
    at += block[0]?.length ?? 0
  }
  return out
}

/** Encodes to AAC at the job's exact config and decodes the result. */
async function roundTrip(
  channels: readonly Float32Array[],
  sampleRate: number,
): Promise<{ channels: Float32Array[]; sampleRate: number }> {
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: false }),
    target: new BufferTarget(),
  })
  const source = new AudioSampleSource(audioEncodingConfigFor(PRESETS[presetId], channels.length))
  output.addAudioTrack(source)
  await output.start()

  const block = 4096
  const frames = channels[0]?.length ?? 0
  for (let start = 0; start < frames; start += block) {
    const sample = toSample(
      channels.map((plane) => plane.slice(start, Math.min(frames, start + block))),
      sampleRate,
      start / sampleRate,
    )
    await source.add(sample)
    sample.close()
  }
  source.close()
  await output.finalize()

  const buffer = output.target.buffer
  if (!buffer) throw new Error('round trip produced no buffer')
  const input = new Input({
    formats: [new Mp4InputFormat()],
    source: new BlobSource(new Blob([new Uint8Array(buffer)])),
  })
  const track = await input.getPrimaryAudioTrack()
  if (!track) throw new Error('round trip produced no audio track')
  const [outRate, outChannels] = await Promise.all([
    track.getSampleRate(),
    track.getNumberOfChannels(),
  ])
  const blocks: Float32Array[][] = []
  for await (const decoded of new AudioSampleSink(track).samples()) {
    blocks.push(toPlanar(decoded, outChannels))
    decoded.close()
  }
  return { channels: join(blocks, outChannels), sampleRate: outRate }
}

try {
  say(`file:   ${path}`)
  say(`preset: ${presetId}`)
  const response = await fetch(path)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const file = new File([await response.blob()], 'source', { type: 'video/mp4' })

  const track = await openInput(file).getPrimaryAudioTrack()
  if (!track) throw new Error('no audio track')

  const plan = await planAudio(track)
  if (!plan) throw new Error('no sound to plan')
  const { sampleRate, channelCount } = plan
  say(
    `source: ${fixed(plan.analysis.integratedLufs)} LUFS, LRA ${fixed(plan.analysis.loudnessRangeLu, 1)}, ` +
      `peak ${fixed(plan.analysis.truePeakDbtp)} dBTP · ${sampleRate} Hz x${channelCount} · gain ${fixed(plan.gainDb)} dB`,
  )

  // Pass C, collected.
  const chain = new AudioChain({
    sampleRate,
    channelCount,
    envelope: plan.envelope,
    gainDb: plan.gainDb,
    limiterCeilingDbtp: plan.limiterCeilingDbtp,
  })
  const gaps = new AudioGapFiller(sampleRate, channelCount)
  const blocks: Float32Array[][] = []
  for await (const sample of new AudioSampleSink(track).samples()) {
    const silence = gaps.silenceBefore(sample.timestamp)
    if (silence) blocks.push(chain.process(silence))
    const planar = toPlanar(sample, channelCount)
    gaps.accept(planar[0]?.length ?? 0)
    blocks.push(chain.process(planar))
    sample.close()
  }
  blocks.push(chain.flush())
  const processed = join(blocks, channelCount)
  const seconds = (processed[0]?.length ?? 0) / sampleRate

  const before = analyse(processed, sampleRate)
  const roundTripStartedAt = performance.now()
  const decoded = await roundTrip(processed, sampleRate)
  const roundTripMs = performance.now() - roundTripStartedAt
  const after = analyse(decoded.channels, decoded.sampleRate)
  const fullCost = before.integratedLufs - after.integratedLufs
  say('')
  say(`WHOLE PROGRAMME (${fixed(seconds, 1)} s)`)
  say(`  chain output:    ${fixed(before.integratedLufs, 3)} LUFS, ${fixed(before.truePeakDbtp)} dBTP`)
  say(`  after AAC:       ${fixed(after.integratedLufs, 3)} LUFS, ${fixed(after.truePeakDbtp)} dBTP`)
  say(`  loudness cost:   ${fixed(fullCost, 3)} LU`)
  say(`  peak overshoot:  ${fixed(after.truePeakDbtp - before.truePeakDbtp, 3)} dB`)
  say(`  round trip took: ${fixed(roundTripMs, 0)} ms (${fixed(seconds / (roundTripMs / 1000), 0)}x real time)`)

  // What the PRODUCT's probe would have said: its own windows, its own router.
  {
    const total = processed[0]?.length ?? 0
    const planned = planProbeWindows(total, sampleRate)
    const router = new WindowRouter(planned)
    const pieces: Float32Array[][] = []
    const size = 1024
    for (let at = 0; at < total; at += size) {
      pieces.push(...router.route(processed.map((plane) => plane.subarray(at, Math.min(total, at + size)))))
    }
    const joined = join(pieces, channelCount)
    const pre = analyse(joined, sampleRate)
    const post = await roundTrip(joined, sampleRate)
    const cost = pre.integratedLufs - analyse(post.channels, post.sampleRate).integratedLufs
    say('')
    say(
      `PRODUCT PROBE: ${planned.length} window(s), ${fixed((joined[0]?.length ?? 0) / sampleRate, 0)} s ` +
        `-> cost ${fixed(cost, 3)} LU, error ${fixed(cost - fullCost, 3)} LU against the whole`,
    )
  }

  // Windows spread evenly through the programme and joined into one stream:
  // the shape a product probe would take, because cost varies along the file.
  say('')
  say('SPREAD WINDOWS — joined, encoded once; error against the whole')
  say('  windows   total    cost (LU)   error (LU)   overshoot (dB)     ms')
  for (const [count, lengthSeconds] of [
    [3, 10],
    [5, 6],
    [6, 5],
    [6, 10],
    [10, 3],
    [12, 5],
    [12, 10],
    [20, 3],
    [24, 5],
  ] as const) {
    if (count * lengthSeconds >= seconds) continue
    const frames = Math.round(lengthSeconds * sampleRate)
    const total = processed[0]?.length ?? 0
    const parts: Float32Array[][] = []
    for (let i = 0; i < count; i++) {
      const centre = Math.round(((i + 0.5) / count) * total)
      const from = Math.max(0, Math.min(total - frames, centre - Math.round(frames / 2)))
      parts.push(processed.map((plane) => plane.slice(from, from + frames)))
    }
    const joined = join(parts, channelCount)
    const pre = analyse(joined, sampleRate)
    const startedAt = performance.now()
    const post = await roundTrip(joined, sampleRate)
    const took = performance.now() - startedAt
    const postAnalysis = analyse(post.channels, post.sampleRate)
    const cost = pre.integratedLufs - postAnalysis.integratedLufs
    say(
      `  ${`${count} x ${lengthSeconds} s`.padEnd(9)} ${String(count * lengthSeconds).padStart(4)} s  ` +
        `${fixed(cost, 3).padStart(8)}    ${fixed(cost - fullCost, 3).padStart(8)}     ` +
        `${fixed(postAnalysis.truePeakDbtp - pre.truePeakDbtp, 3).padStart(8)}   ${fixed(took, 0).padStart(6)}`,
    )
  }

  // Where the programme is loudest, by the chain output's own short-term curve.
  const curve = before.shortTermLufs
  const step = before.stepSeconds
  const loudestStart = (lengthSeconds: number): number => {
    const span = Math.max(1, Math.round(lengthSeconds / step))
    let best = 0
    let bestSum = -Infinity
    for (let i = 0; i + span <= curve.length; i++) {
      let sum = 0
      for (let j = i; j < i + span; j++) sum += 10 ** ((curve[j] ?? -70) / 10)
      if (sum > bestSum) {
        bestSum = sum
        best = i
      }
    }
    return best * step
  }

  say('')
  say('EXCERPTS — cost measured on the excerpt alone, and its error against the whole')
  say('  length  where     start    cost (LU)   error (LU)   overshoot (dB)')
  for (const lengthSeconds of [5, 10, 20, 30]) {
    if (lengthSeconds >= seconds) continue
    const positions: ReadonlyArray<readonly [string, number]> = [
      ['start', 0],
      ['middle', (seconds - lengthSeconds) / 2],
      ['loudest', Math.min(loudestStart(lengthSeconds), seconds - lengthSeconds)],
    ]
    for (const [where, startSeconds] of positions) {
      const from = Math.round(startSeconds * sampleRate)
      const to = from + Math.round(lengthSeconds * sampleRate)
      const excerpt = processed.map((plane) => plane.slice(from, to))
      const pre = analyse(excerpt, sampleRate)
      const post = await roundTrip(excerpt, sampleRate)
      const postAnalysis = analyse(post.channels, post.sampleRate)
      const cost = pre.integratedLufs - postAnalysis.integratedLufs
      say(
        `  ${String(lengthSeconds).padStart(4)} s  ${where.padEnd(8)} ${fixed(startSeconds, 1).padStart(6)}   ` +
          `${fixed(cost, 3).padStart(8)}    ${fixed(cost - fullCost, 3).padStart(8)}     ` +
          `${fixed(postAnalysis.truePeakDbtp - pre.truePeakDbtp, 3).padStart(8)}`,
      )
    }
  }
} catch (error) {
  say(`ERROR — ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`)
}
say('\ndone')
