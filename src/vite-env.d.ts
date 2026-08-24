/// <reference types="vite/client" />

/** Injected by `define` in `vite.config.ts`. See `src/core/version.ts`. */
declare const __APP_VERSION__: string
/** Injected by `define` in `vite.config.ts`. See `src/core/version.ts`. */
declare const __BUILD_ID__: string

/**
 * File System Access API. Not in TypeScript's DOM lib at the version this
 * project pins, and we only feature-detect it today (`save.ts` will use it
 * properly). Declared narrowly rather than reaching for `any`.
 */
declare function showSaveFilePicker(options?: {
  suggestedName?: string
  types?: { description?: string; accept: Record<string, string[]> }[]
}): Promise<FileSystemFileHandle>
