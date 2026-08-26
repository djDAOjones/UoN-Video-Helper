import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { inspectPublicDirectory } from '../scripts/public-inventory.mjs'

describe('public deployment inventory', () => {
  const roots: string[] = []

  const temporaryRoot = (): string => {
    const root = mkdtempSync(join(tmpdir(), 'uon-public-inventory-'))
    roots.push(root)
    return root
  }

  afterEach(() => {
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
  })

  it('does not inherit the repository scan exclusion for a public/samples directory', () => {
    const root = temporaryRoot()
    const publicDirectory = join(root, 'public')
    mkdirSync(join(publicDirectory, 'samples'), { recursive: true })
    writeFileSync(join(publicDirectory, 'samples', 'lecture.mp4'), 'private lecture bytes')

    const inventory = inspectPublicDirectory(root, publicDirectory, new Map())

    expect(inventory.files).toEqual(['public/samples/lecture.mp4'])
    expect(inventory.unexpectedFiles).toEqual(['public/samples/lecture.mp4'])
    expect(inventory.missingFiles).toEqual([])
    expect(inventory.mismatchedFiles).toEqual([])
    expect(inventory.invalidEntries).toEqual([])
  })

  it('rejects a symlink even when its public path is allowlisted', () => {
    const root = temporaryRoot()
    const publicDirectory = join(root, 'public')
    const brandingDirectory = join(publicDirectory, 'branding')
    mkdirSync(brandingDirectory, { recursive: true })
    const target = join(root, 'unreviewed-recording.mp4')
    const publicPath = 'public/branding/opening-1080p25.mp4'
    writeFileSync(target, 'unreviewed bytes')
    symlinkSync(target, join(root, publicPath))

    const inventory = inspectPublicDirectory(
      root,
      publicDirectory,
      new Map([[publicPath, '0'.repeat(64)]]),
    )

    expect(inventory.files).toEqual([])
    expect(inventory.unexpectedFiles).toEqual([])
    expect(inventory.missingFiles).toEqual([publicPath])
    expect(inventory.mismatchedFiles).toEqual([])
    expect(inventory.invalidEntries).toEqual([`${publicPath} (symbolic link)`])
  })

  it('accepts only regular files with reviewed content', () => {
    const root = temporaryRoot()
    const publicDirectory = join(root, 'public')
    const publicPath = 'public/branding/approved.mp4'
    mkdirSync(join(publicDirectory, 'branding'), { recursive: true })
    writeFileSync(join(root, publicPath), 'reviewed bytes')
    const digest = createHash('sha256').update('reviewed bytes').digest('hex')

    expect(inspectPublicDirectory(root, publicDirectory, new Map([[publicPath, digest]]))).toEqual({
      files: [publicPath],
      unexpectedFiles: [],
      missingFiles: [],
      mismatchedFiles: [],
      invalidEntries: [],
    })
  })

  it('fails when a reviewed asset is missing or its bytes change', () => {
    const root = temporaryRoot()
    const publicDirectory = join(root, 'public')
    const changedPath = 'public/branding/changed.mp4'
    const missingPath = 'public/branding/missing.mp4'
    mkdirSync(join(publicDirectory, 'branding'), { recursive: true })
    writeFileSync(join(root, changedPath), 'private lecture bytes')

    const inventory = inspectPublicDirectory(
      root,
      publicDirectory,
      new Map([
        [changedPath, createHash('sha256').update('reviewed bytes').digest('hex')],
        [missingPath, createHash('sha256').update('expected bytes').digest('hex')],
      ]),
    )

    expect(inventory.unexpectedFiles).toEqual([])
    expect(inventory.missingFiles).toEqual([missingPath])
    expect(inventory.mismatchedFiles).toEqual([changedPath])
  })

  it('fails closed when the public directory is absent', () => {
    const root = temporaryRoot()
    const publicPath = 'public/branding/required.mp4'

    const inventory = inspectPublicDirectory(
      root,
      join(root, 'public'),
      new Map([[publicPath, '0'.repeat(64)]]),
    )

    expect(inventory.files).toEqual([])
    expect(inventory.missingFiles).toEqual([publicPath])
  })
})
