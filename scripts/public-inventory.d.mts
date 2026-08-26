export interface PublicInventory {
  readonly files: readonly string[]
  readonly unexpectedFiles: readonly string[]
  readonly missingFiles: readonly string[]
  readonly mismatchedFiles: readonly string[]
  readonly invalidEntries: readonly string[]
}

export function inspectPublicDirectory(
  rootDirectory: string,
  publicDirectory: string,
  approvedAssets: Iterable<readonly [path: string, sha256: string]>,
): PublicInventory
