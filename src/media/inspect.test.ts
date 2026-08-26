import type { Input } from 'mediabunny'
import { describe, expect, it } from 'vitest'

import { inspectMetadataTags } from './inspect'

type MetadataInput = Pick<Input, 'getMetadataTags'>

describe('metadata inspection', () => {
  it('records readable metadata and its tag count', async () => {
    const input: MetadataInput = {
      getMetadataTags: () => Promise.resolve({ title: 'Lecture', artist: 'UoN' }),
    }

    const report = await inspectMetadataTags(input)

    expect(report).toEqual({ readable: true, tagCount: 2 })
    expect(Object.isFrozen(report)).toBe(true)
  })

  it('fails closed to a visible pre-processing warning when tags cannot be read', async () => {
    const input: MetadataInput = {
      getMetadataTags: () => Promise.reject(new Error('unsupported metadata')),
    }

    await expect(inspectMetadataTags(input)).resolves.toEqual({
      readable: false,
      tagCount: null,
    })
  })
})
