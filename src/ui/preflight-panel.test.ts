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
import { blockContextFor, preflightAnnouncement, verdictText } from './preflight-panel'

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
    contentClass: 'unknown',
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

describe('the heading counts what there is to know (U-24)', () => {
  it('says "one thing" for one and counts the rest', () => {
    expect(verdictText(summary('warn', [['storage-unknown', 'warn']])).heading).toBe(
      'Ready, with one thing to know',
    )
    expect(
      verdictText(summary('warn', [['storage-unknown', 'warn'], ['long-job', 'warn']])).heading,
    ).toBe('Ready, with two things to know')
  })

  it('claims "about the same size" only for an untrimmed job, and nothing about what else is applied', () => {
    const capped = summary('proceed', [], {
      shape: { ...shape, videoBitrateBps: 1_000_000, requestedVideoBitrateBps: 3_000_000, bitrateBasis: 'capped-to-source' },
    })
    const whole = verdictText(capped).lines.join(' ')
    expect(whole).toContain('about the same size')
    expect(whole).not.toMatch(/branding|levelling/i)
    const trimmedSaid = verdictText(capped, { chromeOnComputer: true, trimmed: true }).lines.join(' ')
    expect(trimmedSaid).not.toContain('about the same size')
    // ...and a trimmed, capped screen recording is not told the slides made
    // it smaller: the cap set the size (Codex review of VH-114).
    const cappedScreen = summary('proceed', [], {
      presetId: 'smaller',
      contentClass: 'screen',
      shape: { ...shape, bitrateBasis: 'capped-to-source' },
    })
    expect(verdictText(cappedScreen, { chromeOnComputer: true, trimmed: true }).lines.join(' ')).not.toMatch(
      /smaller still/,
    )
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

  it('recommends a browser, as a recommendation rather than a guarantee', () => {
    // Spec 9.2: a block that says "unsupported" and stops has told the user
    // nothing they can act on. Spec 7.3 (A-12): Chrome on a computer is
    // recommended, not promised.
    const { lines } = verdictText(summary('block', [['no-aac-encode', 'block']], { probe: unmeasured }))
    expect(lines[0]).toMatch(/Chrome on a computer is the browser this tool is built for/)
    expect(lines[0]).not.toMatch(/will work/)
  })

  const browserBlocks = ['no-webcodecs', 'no-aac-encode', 'no-h264-encode', 'no-source-decode', 'no-opfs'] as const

  it.each(browserBlocks)(
    'names only Chrome when %s blocks elsewhere, as the page promises nothing else',
    (code) => {
      // VH-98: the page says it is built for Chrome and other browsers may not
      // work. A block that sent the user to Edge or Safari would contradict it.
      const { lines } = verdictText(summary('block', [[code, 'block']], { probe: unmeasured }))
      expect(lines[0]).toMatch(/Chrome on a computer/)
      expect(lines[0]).not.toMatch(/Edge|Safari/)
    },
  )

  it.each(browserBlocks)(
    'never sends someone already in Chrome on a computer to Chrome when %s blocks (U-05, A-12)',
    (code) => {
      const { lines } = verdictText(summary('block', [[code, 'block']], { probe: unmeasured }), {
        chromeOnComputer: true,
      })
      expect(lines[0]).not.toMatch(/Chrome on a computer/)
      // ...and still says what to do.
      expect(lines[0]).toMatch(/update Chrome|ask whoever manages|export it again|ordinary window/i)
    },
  )

  it('tells a decode block in Chrome to re-export the file, not to change browser', () => {
    const { lines } = verdictText(summary('block', [['no-source-decode', 'block']], { probe: unmeasured }), {
      chromeOnComputer: true,
    })
    expect(lines[0]).toContain('Export it again as an MP4')
  })

  it('reads where the user is from the user agent', () => {
    const chromeMac =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    const edgeWindows =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
    const chromeAndroid =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
    const firefoxMac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0'
    const safariMac =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
    expect(blockContextFor(chromeMac).chromeOnComputer).toBe(true)
    // Edge is the same engine, and the default on a managed University laptop.
    expect(blockContextFor(edgeWindows).chromeOnComputer).toBe(true)
    expect(blockContextFor(chromeAndroid).chromeOnComputer).toBe(false)
    expect(blockContextFor(firefoxMac).chromeOnComputer).toBe(false)
    expect(blockContextFor(safariMac).chromeOnComputer).toBe(false)
  })

  it('still quotes the space a job needs when storage is the block', () => {
    const { lines } = verdictText(summary('block', [['insufficient-storage', 'block']]))
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('71.3 MB')
    // ...and the ways out that the setup steps offer (Codex review of VH-108).
    expect(lines[0]).toContain('keep less of the video')
  })
})

describe('the picture type is said when it changes the file (VH-19)', () => {
  const smallerScreen = (overrides: Partial<PreflightSummary> = {}) =>
    summary('proceed', [], {
      presetId: 'smaller',
      contentClass: 'screen',
      shape: { ...shape, bitrateBasis: 'preset' },
      ...overrides,
    })
  const said = (value: PreflightSummary) => verdictText(value).lines.join(' ')

  it('says slides were detected, and how to overrule it', () => {
    // The one way the classifier can be wrong — camera taken for slides —
    // costs picture quality, and only the person looking can tell. So the
    // decision is never silent, and the way out is named.
    const { lines } = verdictText(smallerScreen())
    expect(lines).toHaveLength(3)
    expect(lines[2]).toContain('slides or a screen recording')
    expect(lines[2]).toContain('Larger / better')
  })

  it.each(['camera', 'unknown'] as const)('says nothing for %s, which is the ordinary setting', (contentClass) => {
    expect(said(smallerScreen({ contentClass }))).not.toMatch(/slides|camera footage/)
  })

  it('says nothing on the larger output, which the class does not change', () => {
    expect(said(smallerScreen({ presetId: 'best' }))).not.toMatch(/slides/)
  })

  it('gives way to the already-compressed note, which is what decided the size', () => {
    // Capped to the source: the class changed nothing, and saying the file is
    // "made smaller still" beside "about the same size" would be untrue.
    const capped = smallerScreen({ shape: { ...shape, bitrateBasis: 'capped-to-source' } })
    expect(said(capped)).toContain('about the same size')
    expect(said(capped)).not.toMatch(/smaller still/)
  })

  it('says nothing under a block', () => {
    const blocked = smallerScreen({
      verdict: {
        outcome: 'block',
        reasons: [{ code: 'no-source-decode', outcome: 'block' }],
        requiredStorageBytes: 0,
      },
    })
    expect(said(blocked)).not.toMatch(/slides/)
  })

  it('uses no jargon to say it', () => {
    expect(said(smallerScreen())).not.toMatch(/bitrate|Mbps|codec|classif/i)
  })
})

describe('a block says only why it is blocked (VH-89 review)', () => {
  it.each([
    ['long-job', 'warn', 45 * 60],
    ['very-long-job', 'discourage', 3 * 60 * 60],
  ] as const)('drops %s when storage is what blocks', (code, outcome, seconds) => {
    // Too little space AND a long job: the verdict carries both reasons. The
    // second is advice about running a job that cannot run — "you can carry
    // on" beside a Start button that is not there.
    const { lines } = verdictText(
      summary(
        'block',
        [
          ['insufficient-storage', 'block'],
          [code, outcome],
        ],
        { probe: { ...summary('proceed').probe, estimatedSeconds: seconds } },
      ),
    )
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('not enough free space')
    expect(lines.join(' ')).not.toMatch(/carry on|will take|Keep this tab open/)
  })

  it('drops device advice too, and keeps every reason that blocks', () => {
    const { lines } = verdictText(
      summary(
        'block',
        [
          ['no-opfs', 'block'],
          ['insecure-context', 'block'],
          ['mobile-device', 'discourage'],
          ['storage-unknown', 'warn'],
        ],
        { probe: unmeasured },
      ),
    )
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('working space')
    expect(lines[1]).toContain('secure connection')
  })
})

describe('the status line for a finished check', () => {
  it.each([
    // Only what the box does not show (U-25): the box says the outcome.
    ['proceed', 'Device check complete.'],
    ['warn', 'Device check complete.'],
    ['discourage', 'Device check complete.'],
    ['block', 'This video cannot be processed in this browser.'],
  ] as const)('shows the outcome for %s', (outcome, expected) => {
    expect(preflightAnnouncement(summary(outcome)).shown).toBe(expected)
  })

  it('still SAYS the time and size, without showing them twice', () => {
    // The status line sits under the verdict, so it shows only the outcome —
    // but it is the live region, and the verdict is not. A screen-reader user
    // must hear the estimate, not just that there is one.
    const { shown, spokenOnly } = preflightAnnouncement(summary('proceed'))
    expect(shown).not.toMatch(/37 seconds|28\.5 MB|Ready/)
    expect(spokenOnly).toBe('Ready to go. This should take about 37 seconds. Estimated size up to 28.5 MB.')
  })

  it('says what the "one thing to know" is', () => {
    const { spokenOnly } = preflightAnnouncement(summary('warn', [['long-job', 'warn']], {
      probe: { ...summary('proceed').probe, estimatedSeconds: 45 * 60 },
    }))
    expect(spokenOnly).toContain('This will take about 45 minutes')
    expect(spokenOnly).toContain('Keep this tab open')
  })

  it('says why a block is a block, and what to do', () => {
    const { spokenOnly } = preflightAnnouncement(
      summary('block', [['no-aac-encode', 'block']], { probe: unmeasured }),
    )
    expect(spokenOnly).toMatch(/cannot add sound.*Chrome on a computer/)
  })

  it('speaks exactly what the verdict shows, so the two cannot drift', () => {
    const warned = summary('warn', [['storage-unknown', 'warn']])
    const { heading, lines } = verdictText(warned)
    expect(preflightAnnouncement(warned).spokenOnly).toBe([`${heading}.`, ...lines].join(' '))
  })
})
