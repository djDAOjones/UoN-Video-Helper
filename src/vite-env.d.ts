/// <reference types="vite/client" />

/** Injected by `define` in `vite.config.ts`. See `src/core/version.ts`. */
declare const __APP_VERSION__: string
/** Injected by `define` in `vite.config.ts`. See `src/core/version.ts`. */
declare const __BUILD_ID__: string

/**
 * File System Access API. Not in TypeScript's DOM lib at the version this
 * project pins. Declared narrowly rather than reaching for `any`.
 */
declare function showDirectoryPicker(options?: {
  id?: string
  mode?: 'read' | 'readwrite'
}): Promise<FileSystemDirectoryHandle>
