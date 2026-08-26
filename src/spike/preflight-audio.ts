/**
 * VH-49: does pre-flight now REFUSE what the encoder will refuse?
 *
 * Firefox 154 has the `AudioEncoder` class and rejects `mp4a.40.2` at every
 * bitrate and channel count, while accepting every video configuration we ask
 * for. Before this, `capability.ts` checked only that the class existed, so the
 * job started, showed progress, and died at the audio encoder.
 *
 * Dev-only; not built.
 */

import { OUTPUT_SAMPLE_RATE, PRESETS } from '../config/presets'
import { canEncodeAudio } from '../media/capability'
import { preflightVerdict } from '../media/preflight'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
let failures = 0
function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}
function check(passed: boolean, description: string): void {
  if (!passed) failures++
  say(`  ${passed ? 'PASS' : 'FAIL'} — ${description}`)
}

say(`userAgent: ${navigator.userAgent}\n`)

const supported = await canEncodeAudio({
  codec: 'mp4a.40.2',
  sampleRate: OUTPUT_SAMPLE_RATE,
  numberOfChannels: 2,
  bitrate: PRESETS.best.audioBitrateStereoBps,
})
say(`this engine encodes AAC: ${supported}`)

const base = {
  isSecureContext: true,
  hasWebCodecs: true,
  canUseOpfs: true,
  canDecodeVideo: true,
  canDecodeAudio: true,
  videoProbeStatus: 'supported' as const,
  probeFailureStage: null,
  availableStorageBytes: 50_000_000_000,
  projectedOutputBytes: 100_000_000,
  isMobileDevice: false,
  estimatedSeconds: 60,
}

say('\n=== a source WITH audio')
const withAudio = preflightVerdict({ ...base, canEncodeAac: supported })
say(
  `  outcome: ${withAudio.outcome}  reasons: ${withAudio.reasons.map((r) => r.code).join(', ') || 'none'}`,
)
if (supported) {
  check(withAudio.outcome === 'proceed', 'an engine that can encode AAC is not blocked')
} else {
  check(
    withAudio.outcome === 'block',
    'an engine that cannot encode AAC is BLOCKED before the job starts',
  )
  check(
    withAudio.reasons.some((r) => r.code === 'no-aac-encode'),
    'and the reason names the audio encoder rather than something vague',
  )
}

say('\n=== a silent source, which asks nothing of the audio encoder')
const silent = preflightVerdict({ ...base, canEncodeAac: true })
check(silent.outcome === 'proceed', 'a silent source proceeds whatever the engine does with AAC')

say(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
say('\ndone')
