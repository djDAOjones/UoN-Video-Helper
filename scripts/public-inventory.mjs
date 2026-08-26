import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const repositoryPath = (rootDirectory, path) => relative(rootDirectory, path).split(sep).join('/')

const nonRegularKind = (stat) => {
  if (stat.isFIFO()) return 'FIFO'
  if (stat.isSocket()) return 'socket'
  if (stat.isCharacterDevice()) return 'character device'
  if (stat.isBlockDevice()) return 'block device'
  return 'non-regular entry'
}

/**
 * Inventories every deployable `public/` entry without repository scan exclusions.
 *
 * Vite follows the directory recursively and copies regular files verbatim, so
 * a directory named `samples` is no safer than one named `branding`. Symlinks
 * are rejected even at allowlisted paths because the bytes copied would belong
 * to the target rather than to the reviewed path.
 */
export function inspectPublicDirectory(rootDirectory, publicDirectory, approvedAssets) {
  const files = []
  const invalidEntries = []
  const approved = new Map(approvedAssets)
  if (!existsSync(publicDirectory)) {
    return {
      files,
      unexpectedFiles: [],
      missingFiles: [...approved.keys()].sort(),
      mismatchedFiles: [],
      invalidEntries,
    }
  }

  const publicStat = lstatSync(publicDirectory)
  if (publicStat.isSymbolicLink()) {
    invalidEntries.push(`${repositoryPath(rootDirectory, publicDirectory)} (symbolic link)`)
    return {
      files,
      unexpectedFiles: [],
      missingFiles: [...approved.keys()].sort(),
      mismatchedFiles: [],
      invalidEntries,
    }
  }
  if (!publicStat.isDirectory()) {
    invalidEntries.push(
      `${repositoryPath(rootDirectory, publicDirectory)} (${nonRegularKind(publicStat)})`,
    )
    return {
      files,
      unexpectedFiles: [],
      missingFiles: [...approved.keys()].sort(),
      mismatchedFiles: [],
      invalidEntries,
    }
  }

  const walk = (directory) => {
    for (const entry of readdirSync(directory).sort()) {
      const full = join(directory, entry)
      const path = repositoryPath(rootDirectory, full)
      const stat = lstatSync(full)
      if (stat.isSymbolicLink()) {
        invalidEntries.push(`${path} (symbolic link)`)
      } else if (stat.isDirectory()) {
        walk(full)
      } else if (stat.isFile()) {
        files.push(path)
      } else {
        invalidEntries.push(`${path} (${nonRegularKind(stat)})`)
      }
    }
  }

  walk(publicDirectory)
  const present = new Set(files)
  const mismatchedFiles = files.filter((file) => {
    const expected = approved.get(file)
    if (expected === undefined) return false
    const digest = createHash('sha256')
      .update(readFileSync(join(rootDirectory, file)))
      .digest('hex')
    return digest !== expected
  })
  return {
    files,
    unexpectedFiles: files.filter((file) => !approved.has(file)),
    missingFiles: [...approved.keys()].filter((file) => !present.has(file)).sort(),
    mismatchedFiles,
    invalidEntries,
  }
}
