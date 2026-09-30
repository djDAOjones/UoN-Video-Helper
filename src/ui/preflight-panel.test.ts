/**
 * What the verdict says, held to spec 7.3 and to the shape VH-89 gave it.
 *
 * Two things are worth protecting. A `proceed` is three lines and nothing
 * else, so the screen a novice decides on carries only what they are deciding.
 * And no other outcome may lose a sentence in the shortening: every reason is
 * still said, a `warn` still states a time, and the time is never said twice.
 */

import { describe, expect, it } from 'vitest'

import type { OutputShape } from '../config/presets'
import type {
  PreflightOutcome,
  PreflightReasonCode,
  PreflightSummary,
} from '../media/preflight'
import { summarisePreflight, verdictText } from './preflight-panel'

const shape: OutputShape = {
  width: 1920,
  height: 1080,
  frameRate: 30,
  videoBitrateBps: 3_000_000,
  requestedVideoBitrateBps: 7_464_960,
  bitrateBasis: 'blended-with-source',
  audioBitrateBps: 192_000,
}

function summary(
  outcome: PreflightOutcome,
  reasons: readonly [PreflightReasonCode, PreflightOutcome][] = [],
  overrides: Partial<PreflightSummary> = {},
): PreflightSummary {
  return {
    presetId: 'best',
    capability: {
      hasWebCodecs: true,
      hasOpfs: true,
      isSecureContext: true,
      deviceClass: 'desktop',
      hardwareConcurrency: 8,
      storage: { availableBytes: 50_000_000_000, quotaBytes: 60_000_000_000, usageBytes: 0 },
    },
    encode: {
      supported: true,
      config: { codec: 'avc1.64002a', width: 1920, height: 1080 },
      hardwareAccelerated: true,
    },
    probe: {
      measured: true,
      framesEncoded: 90,
      videoFramesPerSecond: 281,
      audioRealtimeFactor: 900,
      estimatedSeconds: 37,
    },
    shape,
    projectedOutputBytes: 28_500_000,
    audioWarnings: [],
    verdict: {
      outcome,
      reasons: reasons.map(([code, reasonOutcome]) => ({ code, outcome: reasonOutcome })),
      requiredStorageBytes: 71_250_000,
    },
    ...overrides,
  }
}

const unmeasured = {
  measured: false,
  framesEncoded: 0,
  videoFramesPerSecond: 0,
  audioRealtimeFactor: null,
  estimatedSeconds: null,
} as const

describe('proceed (VH-89)', () => {
  it('is three lines and nothing else', () => {
    expect(verdictText(summary('proceed'))).toEqual({
      heading: 'Ready to go',
      lines: ['This should take about 37 seconds.', 'Estimated size up to 28.5 MB.'],
    })
  })

  it('does not say "about less than a second" for a very short clip', () => {
    const quick = summary('proceed', [], { probe: { ...summary('proceed').probe, estimatedSeconds: 0.3 } })
    expect(verdictText(quick).lines[0]).toBe('This should take less than a second.')
  })

  it('says "up to", because the figure is an upper bound and not a prediction', () => {
    // VH-31: 27.7 MB was shown for a 7.5 MB file. A bare number reads as a
    // promise; two words keep the screen true.
    const { lines } = verdictText(summary('proceed'))
    expect(lines.at(-1)).toMatch(/^Estimated size up to /)
  })

  it('does not list the setting, the output shape or the measured speed', () => {
    const said = verdictText(summary('proceed')).lines.join(' ')
    expect(said).not.toMatch(/1920|1080|fps|frames per second|Larger|Setting|Output/)
  })

  it('keeps the already-compressed note, because the user acts on it', () => {
    // VH-41: someone who chose the smaller output to fit a limit must be told
    // when it will not make the file smaller.
    const capped = summary('proceed', [], {
      presetId: 'smaller',
      shape: { ...shape, bitrateBasis: 'capped-to-source' },
    })
    const { lines } = verdictText(capped)
    expect(lines).toHaveLength(3)
    expect(lines[2]).toContain('about the same size')
  })
})

describe('warn and discourage keep every sentence (VH-89)', () => {
  it('states a time for a warn that used to show none', () => {
    // An unknown-storage warn showed its reason and no estimate at all.
    const { heading, lines } = verdictText(summary('warn', [['storage-unknown', 'warn']]))
    expect(heading).toBe('Ready, with one thing to know')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('will not say how much free space')
    expect(lines[1]).toBe('This should take about 37 seconds.')
    expect(lines[2]).toBe('Estimated size up to 28.5 MB.')
  })

  it.each([
    ['long-job', 'warn', 45 * 60],
    ['very-long-job', 'discourage', 3 * 60 * 60],
  ] as const)('says the time once when %s already states it', (code, outcome, seconds) => {
    const { lines } = verdictText(
      summary(outcome, [[code, outcome]], { probe: { ...summary('proceed').probe, estimatedSeconds: seconds } }),
    )
    expect(lines.filter((line) => /take about/.test(line))).toHaveLength(1)
    expect(lines.at(-1)).toBe('Estimated size up to 28.5 MB.')
  })

  it('does not invent a time when none could be measured', () => {
    const { lines } = verdictText(
      summary('warn', [['estimate-unavailable', 'warn']], { probe: unmeasured }),
    )
    expect(lines).toEqual([
      'We could not work out how long this will take on this device. You can still continue.',
      'Estimated size up to 28.5 MB.',
    ])
  })

  it('keeps every reason, in order, when there are several', () => {
    const { lines } = verdictText(
      summary('discourage', [
        ['mobile-device', 'discourage'],
        ['storage-unknown', 'warn'],
      ]),
    )
    expect(lines).toHaveLength(4)
    expect(lines[0]).toContain('Phones and tablets')
    expect(lines[1]).toContain('free space')
    expect(lines[2]).toBe('This should take about 37 seconds.')
  })
})

describe('block (VH-89)', () => {
  const blocked = summary(
    'block',
    [
      ['no-source-decode', 'block'],
      ['estimate-unavailable', 'warn'],
    ],
    { probe: unmeasured },
  )

  it('states neither a time nor a size', () => {
    const said = verdictText(blocked).lines.join(' ')
    expect(said).not.toMatch(/take about|Estimated size|how long/)
  })

  it('does not say "you can still continue" under "this cannot run here"', () => {
    // The probe does not run for a job that cannot, so every block used to
    // arrive with the unmeasured-estimate sentence and its invitation.
    const { heading, lines } = verdictText(blocked)
    expect(heading).toBe('This cannot run here')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('cannot read the picture or sound')
    expect(lines.join(' ')).not.toMatch(/still continue/)
  })

  it('names a browser that will work', () => {
    // Spec 9.2: a block that says "unsupported" and stops has told the user
    // nothing they can act on.
    const { lines } = verdictText(summary('block', [['no-aac-encode', 'block']], { probe: unmeasured }))
    expect(lines[0]).toMatch(/Chrome or Edge/)
  })

  it('still quotes the space a job needs when storage is the block', () => {
    const { lines } = verdictText(summary('block', [['insufficient-storage', 'block']]))
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('71.3 MB')
  })
})

describe('the live-region line', () => {
  it.each([
    ['proceed', 'Device check complete. Ready to go.'],
    ['warn', 'Device check complete. Ready, with one thing to know.'],
    ['discourage', 'Device check complete. This will work, but it will be slow.'],
    ['block', 'This video cannot be processed in this browser.'],
  ] as const)('announces the outcome for %s', (outcome, expected) => {
    expect(summarisePreflight(summary(outcome))).toBe(expected)
  })
})
