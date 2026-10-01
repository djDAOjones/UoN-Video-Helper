/** Types for `package-xerte.mjs`'s pure parts, so its tests can import them. */

export function readBuildId(scripts: readonly string[], version: string): string

export function hostingReadme(build: {
  readonly appVersion: string
  readonly buildId: string
  readonly files: readonly { readonly name: string; readonly bytes: number }[]
}): string
