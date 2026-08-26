import { describe, expect, it } from 'vitest'

import { emitOwnedAudioSamples } from './pipeline'

describe('emitOwnedAudioSamples', () => {
  it('closes every not-yet-emitted sample when an earlier emission fails', async () => {
    const samples = [1, 2, 3].map((id) => ({
      id,
      closed: false,
      close() {
        this.closed = true
      },
    }))
    const attempted: number[] = []

    await expect(
      emitOwnedAudioSamples(samples, (sample) =>
        Promise.resolve().then(() => {
          try {
            attempted.push(sample.id)
            if (sample.id === 2) throw new Error('encoder rejected the sample')
          } finally {
            // Mirrors the pipeline emitter, which owns the current sample even
            // when `AudioSampleSource.add` rejects.
            sample.close()
          }
        }),
      ),
    ).rejects.toThrow('encoder rejected the sample')

    expect(attempted).toEqual([1, 2])
    expect(samples.map((sample) => sample.closed)).toEqual([true, true, true])
  })

  it('stops a lazy stream without materialising its tail after an emission fails', async () => {
    const created: number[] = []
    const closed: number[] = []
    const attempted: number[] = []
    function* samples(): Generator<{ readonly id: number; close(): void }> {
      for (const id of [1, 2, 3]) {
        created.push(id)
        yield { id, close: () => closed.push(id) }
      }
    }

    await expect(
      emitOwnedAudioSamples(samples(), (sample) =>
        Promise.resolve().then(() => {
          try {
            attempted.push(sample.id)
            if (sample.id === 2) throw new Error('encoder rejected the sample')
          } finally {
            sample.close()
          }
        }),
      ),
    ).rejects.toThrow('encoder rejected the sample')

    expect(created).toEqual([1, 2])
    expect(attempted).toEqual([1, 2])
    expect(closed).toEqual([1, 2, 2])
  })
})
