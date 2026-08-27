/**
 * The bundle's job-context invariant (VH-77).
 *
 * Context was added so a bundle answers "what file, what device, what did they
 * choose" — the three questions the logs answer only by inference. It is also
 * the largest new surface through which the user's media could escape, so the
 * test that matters is the one proving it cannot.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  buildDiagnosticsBundle,
  resetDiagnosticsContext,
  setDiagnosticsContext,
} from './diagnostics'
import { REDACTED } from './redact'

/** A source report shaped like the real one, with every identifying field populated. */
const sourceReport = {
  container: 'MP4',
  fileSizeBytes: 4_812_004_112,
  durationSeconds: 3612.4,
  video: {
    codec: 'avc1.640028',
    width: 1920,
    height: 1080,
    rotation: 0,
    averageFrameRate: 29.97,
    variableFrameRate: false,
    name: 'Main Presentation',
    language: 'eng',
  },
  audio: { codec: 'mp4a.40.2', sampleRate: 48_000, channels: 2 },
  reportedTrackCount: 2,
  videoTrackCount: 1,
  audioTrackCount: 1,
}

describe('diagnostics context', () => {
  beforeEach(() => {
    resetDiagnosticsContext('idle')
  })

  it('carries what the file is, never which file', () => {
    setDiagnosticsContext({ stage: 'inspected', source: sourceReport })

    const context = buildDiagnosticsBundle().context
    const source = context.source as Record<string, unknown>
    const video = source['video'] as Record<string, unknown>

    expect(context.stage).toBe('inspected')
    expect(source['container']).toBe('MP4')
    expect(source['durationSeconds']).toBe(3612.4)
    expect(video['codec']).toBe('avc1.640028')
    expect(video['width']).toBe(1920)
    expect(video['averageFrameRate']).toBe(29.97)

    // The two fields that name the recording rather than describe it.
    expect(video['name']).toBe(REDACTED)
    expect(JSON.stringify(context)).not.toContain('Main Presentation')
  })

  it('never carries a filename, a path, or the media itself', () => {
    setDiagnosticsContext({
      stage: 'processing',
      source: {
        filename: 'Week 3 Lecture - Prof Smith.mp4',
        path: '/Users/someone/Movies/Week 3 Lecture.mp4',
        sample: new Uint8Array(4096),
      },
      job: { subtitleVtt: 'WEBVTT\n\n00:00.000 --> 00:02.000\nGood morning everyone.' },
    })

    const serialised = JSON.stringify(buildDiagnosticsBundle())

    expect(serialised).not.toContain('Prof Smith')
    expect(serialised).not.toContain('/Users/someone')
    expect(serialised).not.toContain('Good morning everyone')
    expect(serialised).toContain('[binary: 4096 bytes]')
  })

  it('keeps the choices, which is the point of carrying the job at all', () => {
    setDiagnosticsContext({
      stage: 'processing',
      job: {
        presetId: 'quality',
        closing: 'crossfade',
        style: 'build',
        colour: 'blue',
        subtitleSupplied: true,
      },
    })

    const job = buildDiagnosticsBundle().context.job as Record<string, unknown>

    expect(job['presetId']).toBe('quality')
    expect(job['closing']).toBe('crossfade')
    expect(job['colour']).toBe('blue')
    expect(job['subtitleSupplied']).toBe(true)
  })

  it('merges, so a stage change does not erase the file it happened to', () => {
    setDiagnosticsContext({ stage: 'inspected', source: sourceReport })
    setDiagnosticsContext({ stage: 'processing' })

    const context = buildDiagnosticsBundle().context

    expect(context.stage).toBe('processing')
    expect((context.source as Record<string, unknown>)['container']).toBe('MP4')
  })

  it('forgets the previous file when a new one is chosen', () => {
    setDiagnosticsContext({ stage: 'ready', source: sourceReport, capability: { verdict: 'ok' } })
    resetDiagnosticsContext('inspecting')

    const context = buildDiagnosticsBundle().context

    expect(context.stage).toBe('inspecting')
    expect(context.source).toBeUndefined()
    expect(context.capability).toBeUndefined()
  })
})
