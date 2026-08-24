# Conventions

<!-- Hot whole-file read. See pm_skills/memory-policy.md for limits. -->

## Code style

- TypeScript, `strict: true`. `noUncheckedIndexedAccess` on — this is a
  codebase full of buffer indexing, and an off-by-one in a DSP loop is
  invisible at runtime.
- ES modules only. All imports at the top (an `AGENTS.md` hard rule).
- Prefer pure functions over classes. The DSP, the conform maths and the
  threshold logic are all pure; only the pipeline, the OPFS store and the
  UI hold state.
- No `any`. Where a browser API is ahead of its types, declare a narrow
  local interface and comment why.

## Naming

- Files: `kebab-case.ts`. Directories: lower-case, singular where it reads
  better (`audio/`, `media/`, `config/`).
- Units live in the identifier, always: `thresholdDbfs`, `windowSeconds`,
  `slewDbPerSecond`, `ceilingDbtp`, `offsetMicroseconds`. An unqualified
  number in a signature is a bug waiting to happen.
- Loudness units are never mixed silently. LUFS (absolute), LU
  (relative), dBFS (sample peak), dBTP (true peak) are distinct — convert
  explicitly through a named helper, never inline.
- Timestamps: WebCodecs works in **microseconds**. Say so in the name
  (`timestampUs`) whenever a number crosses a module boundary.

## Commit messages

Short imperative subject, no type prefix. Body when the change needs a
why. Reference the backlog ID when there is one: `VH-3: validate meter
against EBU Tech 3341 cases 1-9`.

## Documentation

- JSDoc on everything exported. For DSP modules, the doc block must cite
  the spec section or standard clause it implements — e.g. `BS.1770-4
  §4.1` or `spec §5.2 step 3` — so the code can be checked against the
  source of truth without archaeology.
- Every magic-looking constant in `config/` carries a one-line comment
  saying where the number came from. If the answer is "we chose it",
  say that too.
- Skip JSDoc on trivial internal helpers.

## Testing

- Runner: **Vitest**. The DSP suite runs in Node — it is pure maths over
  `Float32Array` and needs no browser.
- Anything touching WebCodecs, OPFS or the File System Access API cannot
  run in Node. Those are verified in a real browser and the check is
  recorded in the task's verification notes. Do not mock WebCodecs — a
  mocked encoder proves nothing about whether the real one accepts the
  config.
- Invariants this project must protect, in priority order:
  1. Meter accuracy against EBU Tech 3341 (±0.1 LU). Non-negotiable.
  2. Output loudness −16 ±0.5 LUFS, true peak never above −2.0 dBTP.
  3. CFR conform preserves A/V sync across the full duration.
  4. Cancellation leaves no partial file and no orphaned OPFS data.
  5. Zero media egress.
- Fixtures are **generated**, not committed. `test/fixtures/` is built by
  a script so the repo stays free of binaries and the fixtures stay
  reproducible.

## Patterns to follow

- **Config is the only home for numbers.** Every threshold, target,
  duration, bitrate and colour lives in `src/config/` or a CSS token. A
  literal threshold anywhere else is a defect, not a style preference —
  it is how the open decisions (D1, D2, D3, D8) stay one-line changes.
- **The worker owns the job; the main thread owns the UI.** No DOM in the
  worker, no decoding on the main thread.
- **Transfer, never copy.** `ArrayBuffer`s cross the worker boundary as
  transferables.
- **Fail loudly on data loss.** Anything that cannot be carried through
  (a subtitle track we cannot read, a chapter list) produces a visible
  warning before processing starts. Silent loss is the worst outcome
  available to this app.
- **Streaming everywhere.** If a design step would hold the whole media
  file in memory, it is the wrong design step — that is the ceiling this
  architecture exists to escape.

## Patterns to avoid

- `fastStart: 'in-memory'` on the Mediabunny output — or, just as bad,
  leaving `fastStart` unset, because the library then picks between
  `false` and `'in-memory'` on its own. Always name the value.
- Measuring loudness on the concatenated timeline. Analysis runs on
  **source content only** — a 5-second music sting averaged with 50
  minutes of speech mis-levels the whole video (spec §4.4).
- Applying macro-levelling unconditionally. It is gated on LRA > 9 LU
  precisely because processing that is not needed can only do harm.
- Reaching for a library. One runtime dependency, and it is Mediabunny.
- Exposing a technical setting "just in case". Every exposed control is a
  decision a novice is forced to make (spec §9.2).

## Tooling

- Bundler / dev server: **Vite**
- Test runner: **Vitest**
- Types: `tsc --noEmit`
- Linter: **ESLint** + `typescript-eslint`, strict on correctness
  (unused/broken imports, floating promises, dead code), taste rules off
- Formatter: **Prettier**, auto-fix on save — never a `check` failure.
  **Markdown is out of its scope** (`.prettierignore`): Prettier pads table
  cells to align them, which rewrites every table in `docs/` for no gain, and
  `docs/` is protected infrastructure agents read rather than restyle.
  markdownlint governs Markdown.
- Docs: `markdownlint` + `check-links.mjs` (scaffolded)

The `check` command that composes these is defined in
`DEV-INFRASTRUCTURE.md` → "Quality gate".
