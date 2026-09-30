/**
 * The feedback email's redaction profile and its `mailto:` link (VH-93).
 *
 * This is the diagnostics bundle's first reader outside the maintainer's own
 * machine, so the invariant worth holding is what it may NOT carry: the file's
 * name, anywhere, in any case; and any fact it does not name. The rest holds
 * the link to what mail clients accept — short enough not to be cut, with the
 * user's own words never the part that is dropped.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  buildDiagnosticsBundle,
  resetDiagnosticsContext,
  setDiagnosticsContext,
} from '../core/diagnostics'
import { clearLogRecords, log } from '../core/logger'
import { REDACTED } from '../core/redact'
import { describeBrowser, feedbackDetails, feedbackMailto, feedbackText } from './feedback'

const FILE = 'Week 3 - Thermodynamics Lecture.mp4'

/** Shaped like the real `SourceReport`, with the fields the details read and some they must not. */
const source = {
  container: 'MP4',
  fileSizeBytes: 4_812_004_112,
  durationSeconds: 3612.4,
  video: {
    codec: 'avc',
    codecString: 'avc1.640028',
    displayWidth: 1920,
    displayHeight: 1080,
    rotation: 0,
    frameRate: { bestGuess: 29.97, average: 29.97, isConstant: true },
    isVariableFrameRate: false,
    averageBitrateBps: 10_000_000,
  },
  audio: { codec: 'aac', sampleRate: 48_000, channelCount: 2 },
}

/** Shaped like the real `PreflightSummary`, likewise. */
const capability = {
  presetId: 'best',
  contentClass: 'screen',
  projectedOutputBytes: 612_000_000,
  verdict: {
    outcome: 'warn',
    reasons: [{ code: 'long-job', outcome: 'warn' }],
    requiredStorageBytes: 1_300_000_000,
  },
}

const details = (fileNames: readonly string[] = [FILE]) =>
  feedbackDetails(buildDiagnosticsBundle(), { browser: 'Chrome 142 on macOS', fileNames })

beforeEach(() => {
  clearLogRecords()
  resetDiagnosticsContext('idle')
})

describe('what a report says', () => {
  it('names the build, the browser and the stage, and nothing else, before a file is chosen', () => {
    const lines = details([])
    expect(lines).toHaveLength(3)
    expect(lines[0]).toMatch(/^App: /)
    expect(lines[1]).toBe('Browser: Chrome 142 on macOS')
    expect(lines[2]).toBe('Stage: idle')
  })

  it('says what the video is, what the device said, and what was chosen', () => {
    setDiagnosticsContext({
      stage: 'processing',
      source,
      capability,
      job: { presetId: 'best', closingType: 'fade', closingOnset: 'freeze', closingColour: 'white' },
    })
    const lines = details()
    expect(lines).toContain('Stage: processing')
    expect(lines).toContain('Choices: output best, closing fade freeze white')
    expect(lines).toContain('Device check: warn (long-job), picture screen')
    expect(lines).toContain('Video: 3612 s, 1920x1080, 29.97 fps, avc, MP4')
    expect(lines).toContain('Audio: aac, 2 ch, 48000 Hz')
  })

  it('says a video has no sound rather than leaving it out', () => {
    setDiagnosticsContext({ stage: 'inspected', source: { ...source, audio: null } })
    expect(details()).toContain('Audio: none')
  })

  it('carries only the facts it names', () => {
    // Everything else the bundle holds stays behind: the file's size, the
    // projected output, the language and core count from the environment.
    setDiagnosticsContext({ stage: 'ready', source, capability })
    const all = details().join('\n')
    expect(all).not.toMatch(/4812004112|612000000|1300000000|10000000/)
    expect(all).not.toMatch(/hardwareConcurrency|language/)
  })

  it('keeps the latest log lines, cut to a readable length', () => {
    for (let i = 0; i < 20; i++) log.info('test', `line ${i}`)
    log.warn('test', 'long', { detail: 'x'.repeat(400) })
    const lines = details()
    const logged = lines.slice(lines.indexOf('Recent log:') + 1)
    expect(logged).toHaveLength(8)
    expect(logged.at(-1)).toMatch(/…$/)
    expect(logged.at(-1)!.length).toBeLessThanOrEqual(140)
    expect(logged[0]).toMatch(/line 13/)
  })
})

describe('what a report never says', () => {
  it("removes the file's name wherever it appears, whole or without its extension, in any case", () => {
    // The logs never carry a name by rule. This proves the report does not
    // depend on the rule being kept.
    log.info('test', `opened ${FILE} for reading`)
    log.warn('test', 'decoder gave up on week 3 - thermodynamics lecture at 00:14')
    const all = details().join('\n')
    expect(all).not.toMatch(/thermodynamics/i)
    expect(all).toContain(`opened ${REDACTED} for reading`)
  })

  it('leaves a very short name alone rather than blanking every line', () => {
    log.info('test', 'a line about audio')
    expect(details(['a.mp4']).join('\n')).toContain('a line about audio')
  })
})

describe('the mailto link', () => {
  const lines = ['App: v0.1.0+20260930.abc1234', 'Browser: Chrome 142 on macOS', 'Stage: failed', 'Recent log:', '  info a: one', '  info a: two']

  it('addresses the maintainer, with the subject and a CRLF body', () => {
    const { url, trimmed } = feedbackMailto({
      address: 'someone@example.ac.uk',
      subject: 'Feedback v0.1.0',
      message: 'It stopped.\nTwice.',
      details: lines,
      maxCharacters: 1800,
    })
    expect(trimmed).toBe(false)
    expect(url.startsWith('mailto:someone@example.ac.uk?subject=Feedback%20v0.1.0&body=')).toBe(true)
    const body = decodeURIComponent(url.split('&body=')[1]!)
    expect(body).toBe(feedbackText('It stopped.\nTwice.', lines).replace(/\n/g, '\r\n'))
  })

  it('drops details from the end to fit, never the message, and never leaves a bare heading', () => {
    const message = 'm'.repeat(150)
    const full = feedbackMailto({ address: 'a@b.c', subject: 's', message, details: lines, maxCharacters: 10_000 }).url
    const { url, trimmed } = feedbackMailto({
      address: 'a@b.c',
      subject: 's',
      message,
      details: lines,
      maxCharacters: full.length - 40,
    })
    const body = decodeURIComponent(url.split('&body=')[1]!)
    expect(trimmed).toBe(true)
    expect(url.length).toBeLessThanOrEqual(full.length - 40)
    expect(body).toContain(message)
    expect(body).toContain('Stage: failed')
    expect(body).not.toContain('two')
    expect(body.trimEnd().endsWith('Recent log:')).toBe(false)
  })

  it('carries a message longer than the limit whole, with no details, and says it trimmed', () => {
    const message = 'w'.repeat(3000)
    const { url, trimmed } = feedbackMailto({ address: 'a@b.c', subject: 's', message, details: lines, maxCharacters: 1800 })
    expect(trimmed).toBe(true)
    expect(decodeURIComponent(url.split('&body=')[1]!)).toBe(`${message}\r\n`)
  })
})

describe('the browser, in a few words', () => {
  it.each([
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Chrome 142 on macOS'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'Edge 142 on Windows'],
    ['Mozilla/5.0 (X11; Linux x86_64; rv:154.0) Gecko/20100101 Firefox/154.0', 'Firefox 154 on Linux'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', 'Safari 26 on iOS'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15', 'Safari 26 on macOS'],
    ['Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Chrome 142 on ChromeOS'],
    ['', 'an unrecognised browser on an unrecognised system'],
  ])('%s', (userAgent, expected) => {
    expect(describeBrowser(userAgent)).toBe(expected)
  })
})
