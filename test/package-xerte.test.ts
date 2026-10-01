/**
 * The Xerte package's two decisions that a mistake would ship silently
 * (VH-103): which build id names the zip, and what the README tells whoever
 * hosts it. Building and zipping need git, npm and `zip`, and were verified by
 * running the command.
 */

import { describe, expect, it } from 'vitest'

import { hostingReadme, readBuildId } from '../scripts/package-xerte.mjs'

describe('readBuildId', () => {
  it('reads the one build id the bundle carries', () => {
    const scripts = ['const a=1', 'const BUILD_ID="v0.1.0+20261001.231c621";x(BUILD_ID)']
    expect(readBuildId(scripts, '0.1.0')).toBe('v0.1.0+20261001.231c621')
  })

  it('takes the same id appearing in several scripts as one', () => {
    // The page and the worker are separate bundles; both carry it.
    const id = 'v0.1.0+20261001.231c621'
    expect(readBuildId([`a("${id}")`, `b("${id}")`], '0.1.0')).toBe(id)
  })

  it('reads a build made outside git', () => {
    expect(readBuildId(['"v0.1.0+20261001.nogit"'], '0.1.0')).toBe('v0.1.0+20261001.nogit')
  })

  it('refuses a build that carries none, or another version', () => {
    expect(() => readBuildId(['const a=1'], '0.1.0')).toThrow(/no build id/)
    expect(() => readBuildId(['"v0.2.0+20261001.231c621"'], '0.1.0')).toThrow(/no build id/)
  })

  it('refuses a build that carries two, rather than pick one', () => {
    // A bundle from one build beside a chunk from another: either name lies.
    expect(() =>
      readBuildId(['"v0.1.0+20261001.231c621"', '"v0.1.0+20260930.18bc242"'], '0.1.0'),
    ).toThrow(/more than one/)
  })
})

describe('hostingReadme', () => {
  const readme = hostingReadme({
    appVersion: 'v0.1.0',
    buildId: 'v0.1.0+20261001.231c621',
    files: [
      { name: 'index.html', bytes: 5120 },
      { name: 'app-abc123.js', bytes: 204_800 },
    ],
  })

  it('names the build it describes', () => {
    expect(readme.split('\n')[0]).toBe('UoN Video Helper v0.1.0 — build v0.1.0+20261001.231c621')
  })

  it('says what the server must do: HTTPS, one flat folder, old scripts kept', () => {
    expect(readme).toContain('HTTPS')
    expect(readme).toContain('There are no subfolders')
    expect(readme).toContain('leave the previous app-*.js and\n  job.worker-*.js in place')
  })

  it('lists every file it travels with', () => {
    // Names padded to the longest, sizes right-aligned beneath each other.
    expect(readme).toMatch(/^ {2}index\.html {7}5,120 bytes$/m)
    expect(readme).toMatch(/^ {2}app-abc123\.js {2}204,800 bytes$/m)
  })
})
