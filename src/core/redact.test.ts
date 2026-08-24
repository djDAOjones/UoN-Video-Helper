/**
 * The redaction invariant: a diagnostics bundle may carry media
 * *characteristics* but never the media, its filename, or its path.
 * See DEV-INFRASTRUCTURE.md -> "Maintainer diagnostics".
 */

import { describe, expect, it } from 'vitest'

import { REDACTED, redact } from './redact'

describe('redact', () => {
  it('strips identifying keys but keeps media characteristics', () => {
    const result = redact({
      filename: 'Week 3 Lecture - Prof Smith.mp4',
      trackName: 'Main Presentation',
      title: 'Introduction to Pharmacology',
      codec: 'avc1.640028',
      width: 1920,
      height: 1080,
      frameRate: 29.97,
      durationSeconds: 3612.4,
    }) as Record<string, unknown>

    expect(result['filename']).toBe(REDACTED)
    expect(result['trackName']).toBe(REDACTED)
    expect(result['title']).toBe(REDACTED)

    expect(result['codec']).toBe('avc1.640028')
    expect(result['width']).toBe(1920)
    expect(result['height']).toBe(1080)
    expect(result['frameRate']).toBe(29.97)
    expect(result['durationSeconds']).toBe(3612.4)
  })

  it('redacts path-like strings even under an innocent key', () => {
    const result = redact({ note: '/Users/joe/Movies/lecture.mov' }) as Record<string, unknown>
    expect(result['note']).toBe(REDACTED)
  })

  it('redacts a bare media filename even under an innocent key', () => {
    const result = redact({ note: 'seminar-recording.mkv' }) as Record<string, unknown>
    expect(result['note']).toBe(REDACTED)
  })

  it('never serialises binary data', () => {
    const result = redact({
      pcm: new Float32Array(1024),
      frame: new ArrayBuffer(8192),
    }) as Record<string, unknown>

    expect(result['pcm']).toBe('[binary: 4096 bytes]')
    expect(result['frame']).toBe('[binary: 8192 bytes]')
  })

  it('bounds runaway structures', () => {
    const deep = { a: { b: { c: { d: { e: { f: { g: { h: 'too far' } } } } } } } }
    expect(JSON.stringify(redact(deep))).toContain('[depth limit]')

    const wide = redact(Array.from({ length: 200 }, (_, i) => i)) as unknown[]
    expect(wide).toHaveLength(51)
    expect(wide[50]).toBe('[+150 more]')

    const long = redact({ note: 'x'.repeat(2000) }) as Record<string, unknown>
    expect(String(long['note'])).toContain('[truncated]')
  })

  it('keeps an error legible while redacting its message', () => {
    const result = redact(new Error('failed reading /tmp/lecture.mp4')) as Record<string, unknown>
    expect(result['message']).toBe(REDACTED)
    expect(result['name']).toBe('Error')
  })

  it('passes through primitives and null unchanged', () => {
    expect(redact(null)).toBeNull()
    expect(redact(42)).toBe(42)
    expect(redact(true)).toBe(true)
    expect(redact('1080p, 29.97 fps')).toBe('1080p, 29.97 fps')
  })
})
