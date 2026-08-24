/**
 * The two-part version identity required by `AGENTS.md` -> "Traceable
 * version identity". Both values are injected at build time by
 * `vite.config.ts` and are non-secret, so they are safe to show in the UI
 * and to copy in a diagnostics bundle.
 */

/** Human-readable release name, e.g. `v0.1.0`. Answers "what release is this?". */
export const APP_VERSION: string = __APP_VERSION__

/** Commit-pinned build trace, e.g. `v0.1.0+20260824.82ad18b`. Answers "exactly what code is live?". */
export const BUILD_ID: string = __BUILD_ID__
