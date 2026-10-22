/**
 * VH-158: a Matroska or WebM file cut short is told apart from a whole one,
 * from the promises its own bytes make, and a file whose cut took only its
 * trailing index, or that promises nothing, raises nothing.
 *
 * The files are real Matroska built in memory (`test/helpers/pcm-mkv.ts`);
 * the 52 recordings the research measured, ffmpeg's and Chrome's among them,
 * are in the item's decision.
 */

import { describe, expect, it } from 'vitest'

import { cutShort } from '../../test/helpers/pcm-mp4'
import { openMkv, pcmMkv } from '../../test/helpers/pcm-mkv'
import { isCutShort, matroskaCutShort, segmentPastEnd, tailPastEnd } from './matroska-cut'

const CUES_ID = [0x1c, 0x53, 0xbb, 0x6b]
const CLUSTER_ID = [0x1f, 0x43, 0xb6, 0x75]

/** Where `pattern` last starts in `bytes`. */
function lastIndexOf(bytes: Uint8Array, pattern: readonly number[]): number {
  for (let at = bytes.length - pattern.length; at >= 0; at--) {
    if (pattern.every((byte, index) => bytes[at + index] === byte)) return at
  }
  return -1
}

async function said(bytes: Uint8Array): Promise<boolean> {
  const { file, container, input } = await openMkv(bytes)
  return matroskaCutShort(file, container, input)
}

const finished = await pcmMkv({ seconds: 10 })
const appendOnly = await pcmMkv({ seconds: 10, appendOnly: true })

describe('a whole file', () => {
  it('happy path: a finished file says nothing', async () => {
    expect(await said(finished)).toBe(false)
  })

  it('happy path: a file saved as it went, every size unknown, says nothing', async () => {
    expect(segmentPastEnd(appendOnly, appendOnly.length)).toBe(false)
    expect(await said(appendOnly)).toBe(false)
  })

  it('empty: zero padding after the last element says nothing', () => {
    expect(tailPastEnd(Uint8Array.from([...appendOnly, 0, 0, 0, 0]))).toBe(false)
  })
})

describe('a file cut short', () => {
  it('error: a finished file cut part-way is said, by its Segment and its last cluster', async () => {
    for (const fraction of [0.5, 0.9]) {
      const cut = cutShort(finished, fraction)
      expect(segmentPastEnd(cut, cut.length)).toBe(true)
      expect(tailPastEnd(cut)).toBe(true)
      expect(await said(cut)).toBe(true)
    }
  })

  it('error: a file saved as it went, cut part-way, is said by its last block alone', async () => {
    for (const fraction of [0.5, 0.9]) {
      const cut = cutShort(appendOnly, fraction)
      expect(segmentPastEnd(cut, cut.length)).toBe(false)
      expect(await said(cut)).toBe(true)
    }
  })

  it('error: a header cut through, as a recording saved chunk by chunk ends, is said', () => {
    expect(tailPastEnd(Uint8Array.from([...appendOnly, ...CLUSTER_ID.slice(0, 3)]))).toBe(true)
  })
})

describe('what is not said', () => {
  it('gating: a finished file that lost only its trailing Cues, every frame there, says nothing', async () => {
    const cues = lastIndexOf(finished, CUES_ID)
    expect(cues).toBeGreaterThan(lastIndexOf(finished, CLUSTER_ID))
    const cut = finished.subarray(0, cues)
    expect(segmentPastEnd(cut, cut.length)).toBe(true)
    expect(await said(cut)).toBe(false)
  })

  it('gating: a file saved as it went, cut exactly between two clusters, cannot be told and says nothing', async () => {
    expect(await said(appendOnly.subarray(0, lastIndexOf(appendOnly, CLUSTER_ID)))).toBe(false)
  })

  it('gating: another container is never read, whatever its bytes', async () => {
    const { file, input } = await openMkv(cutShort(finished, 0.5))
    expect(await matroskaCutShort(file, 'MP4', input)).toBe(false)
  })
})

describe('the decision', () => {
  const segmentOnly = { segmentPastEnd: true, tailPastEnd: false }

  it('a broken last element is a cut, whatever the lengths say', () => {
    expect(isCutShort({ segmentPastEnd: false, tailPastEnd: true }, 10, 10)).toBe(true)
  })

  it('a Segment past the end is a cut when the Duration is missed by more than the margin, or absent', () => {
    expect(isCutShort(segmentOnly, 10, 6)).toBe(true)
    expect(isCutShort(segmentOnly, null, 6)).toBe(true)
  })

  it('a Segment past the end with its Duration met lost only its index', () => {
    expect(isCutShort(segmentOnly, 10, 9.5)).toBe(false)
  })

  it('no broken promise is no cut', () => {
    expect(isCutShort({ segmentPastEnd: false, tailPastEnd: false }, 10, 2)).toBe(false)
  })
})
