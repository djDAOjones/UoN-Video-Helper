/**
 * Which encoder configurations does THIS engine actually support?
 *
 * `capability.ts` asks `VideoEncoder.isConfigSupported` for the exact video
 * config a job will use, and asks nothing at all about audio beyond whether the
 * `AudioEncoder` constructor exists. A browser that has the class and refuses
 * the config therefore passes pre-flight and fails mid-job — which is what the
 * VH-43 shape checks hit in Firefox.
 *
 * This asks both, for every preset, and for the odd source shapes the corpus
 * actually contains. Dev-only; not built.
 */

import { PRESETS, outputShapeFor, videoEncoderConfigFor, OUTPUT_SAMPLE_RATE } from '../config/presets'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

say(`userAgent: ${navigator.userAgent}`)
say(
  `VideoEncoder: ${typeof globalThis.VideoEncoder}   AudioEncoder: ${typeof globalThis.AudioEncoder}\n`,
)

say('=== video, per preset, at a few real corpus shapes')
for (const preset of [PRESETS.best, PRESETS.smaller]) {
  for (const [width, height, frameRate] of [
    [1920, 1080, 25],
    [852, 480, 25],
    [1280, 800, 25],
    [3840, 2160, 25],
  ] as const) {
    const shape = outputShapeFor(preset, { width, height, frameRate })
    const config = videoEncoderConfigFor(shape)
    try {
      const result = await VideoEncoder.isConfigSupported(config)
      say(`  ${preset.id.padEnd(8)} ${width}x${height}  ${result.supported ? 'supported' : 'REFUSED'}`)
    } catch (error) {
      say(`  ${preset.id.padEnd(8)} ${width}x${height}  THREW — ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

say('\n=== audio — the question capability.ts never asks')
for (const preset of [PRESETS.best, PRESETS.smaller]) {
  for (const [channels, bitrate] of [
    [2, preset.audioBitrateStereoBps],
    [1, preset.audioBitrateMonoBps],
  ] as const) {
    const config: AudioEncoderConfig = {
      codec: 'mp4a.40.2',
      sampleRate: OUTPUT_SAMPLE_RATE,
      numberOfChannels: channels,
      bitrate,
    }
    try {
      const result = await AudioEncoder.isConfigSupported(config)
      say(
        `  ${preset.id.padEnd(8)} aac ${channels}ch ${bitrate} bps  ${result.supported ? 'supported' : 'REFUSED'}`,
      )
    } catch (error) {
      say(
        `  ${preset.id.padEnd(8)} aac ${channels}ch ${bitrate} bps  THREW — ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

say('\n=== audio, other bitrates — is it the codec or the figure?')
for (const bitrate of [64_000, 96_000, 128_000, 160_000, 192_000, 256_000]) {
  try {
    const result = await AudioEncoder.isConfigSupported({
      codec: 'mp4a.40.2',
      sampleRate: OUTPUT_SAMPLE_RATE,
      numberOfChannels: 2,
      bitrate,
    })
    say(`  aac 2ch ${String(bitrate).padStart(7)} bps  ${result.supported ? 'supported' : 'REFUSED'}`)
  } catch (error) {
    say(`  aac 2ch ${String(bitrate).padStart(7)} bps  THREW — ${error instanceof Error ? error.message : String(error)}`)
  }
}

say('\n=== opus, for comparison — a codec Firefox certainly has')
try {
  const result = await AudioEncoder.isConfigSupported({
    codec: 'opus',
    sampleRate: 48000,
    numberOfChannels: 2,
    bitrate: 128_000,
  })
  say(`  opus 2ch 128000 bps  ${result.supported ? 'supported' : 'REFUSED'}`)
} catch (error) {
  say(`  opus  THREW — ${error instanceof Error ? error.message : String(error)}`)
}

say('\ndone')
