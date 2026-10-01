---
standard: UoN Video Helper house conventions — code style, naming, documentation, testing, patterns
source: project/digests/house-conventions.md and the engineering sections of AGENTS.md, frozen at 029ae1e
version: 2026-10-01 (commit 029ae1e)
retrieved: 2026-10-01
next-check: 2027-04-01
licence: the owner's; a house digest with a repository source
---
# House conventions — digest

The owner's own standards, carried verbatim from the canon record at the
v3 migration: the conventions file and the engineering rules the canon
contract stated for every change. Adopted in the profile and routed by
the rules file for every code change; a task that touches them names
the rule it applied at close (rule 8). Where the carried text named a
canon record path, it now names the v3 one (the wish-list, this digest);
section names it cites refer to the canon AGENTS.md at 029ae1e, whose
engineering sections are carried below.

## Rules that bite here

### Code style

- TypeScript, `strict: true`. `noUncheckedIndexedAccess` on — this is a
  codebase full of buffer indexing, and an off-by-one in a DSP loop is
  invisible at runtime.
- ES modules only. All imports at the top (an `AGENTS.md` hard rule).
- Prefer pure functions over classes. The DSP, the conform maths and the
  threshold logic are all pure; only the pipeline, the OPFS store and the
  UI hold state.
- No `any`. Where a browser API is ahead of its types, declare a narrow
  local interface and comment why.

### Naming

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

### Patterns to follow

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

### Patterns to avoid

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

### Minimal change discipline

- Don't reorganise code you weren't asked to touch.
- Don't add or remove comments in code you weren't asked to touch.
  New code should follow the documentation rules below.
- Don't introduce new abstractions for a single use case.
- Match existing style (indent size, quote style, semicolons, etc.).
- Avoid speculative abstractions unless there is duplication, unstable
  logic, or a clear reuse case.

### Code documentation

JSDoc is the standard. One project-specific addition: a DSP function's
doc block must cite the clause it implements — `BS.1770-4 §4.1`,
`EBU Tech 3341 case 3`, `spec §5.2 step 3` — so the code can be checked
against its source of truth without archaeology.

- New and modified functions, classes, and modules should have
  meaningful comments explaining **why**, not restating **what**.
- Use **JSDoc** for exported functions, classes, and modules. Document
  purpose, parameters, return values, and side effects.
- Comments are for AI agents first and future humans second. Write
  them to provide context that is not obvious from the code alone.
- Do not add boilerplate or redundant comments that restate the code.
  Every comment should earn its place.

Project-specific documentation conventions (what to document, depth,
exceptions) are in `project/digests/house-conventions.md`.

### Testing

Tests protect invariants — behaviours that would do real damage if they
silently broke. Write a test to prove an invariant, not to chase a
coverage number; coverage is a warning light, never a target.

**Named categories, never "add tests" in the abstract.** When a change
warrants tests, cover the categories that apply: happy path, empty,
error, boundary, permission/gating, regression (one per fixed bug), and
a persistence round-trip (write → reload) for stateful changes.
**"Not applicable" is a valid outcome** — if no meaningful invariant is
at risk, say so rather than manufacture tests.

**Fast and hermetic.** Prefer in-process injection, fakes, and temp
directories over live servers and real I/O — fast enough to run on
every change.

**Two layers.** The automated safety net never replaces the manual gate
(real browsers, devices, permissions, rehearsal). Name what only a
human can verify.

**Hard rules.**

- Run build and tests after every change; if no runner exists yet,
  verify manually and note what was checked.
- Never silently delete, skip, or weaken a test to make a change pass.
  If a test is genuinely obsolete because the intended behaviour
  changed, say so and update or remove it as part of the approved
  change.
- Never write hollow tests (assertion-free, snapshot-everything, or
  mocking the unit under test). A test that cannot fail protects
  nothing.
- Rigour ramps with maturity; before invariants stabilise (e.g. the
  first MVP build), deferring tests and saying so is correct.

Tooling and project-specific policy (runner, config, what to test) live
in `project/digests/house-conventions.md`.

### Anti-patterns to reject — the project-specific list (carried from the canon AGENTS.md)

- Proposing ffmpeg.wasm, a wasm codec, or anything needing
  `SharedArrayBuffer` / COOP+COEP headers. Settled in rationale §1.
- Buffering the whole file — including `fastStart: 'in-memory'`, and
  including leaving `fastStart` unset so the library may choose it.
- Measuring loudness on the concatenated timeline instead of source
  content only.
- Applying macro-levelling unconditionally, with a short window, or
  without the slew limit and pause freeze. That combination _is_ the
  pumping the spec exists to avoid.
- Adding a control "for power users". Every exposed control is a decision
  a novice is forced to make.
- Mocking `VideoEncoder` / `AudioEncoder` in a test. A mocked encoder
  proves nothing about whether the real one accepts the config.
- Dropping a track, a caption, or a metadata field without a visible
  warning.
- Hard-coding a threshold, duration, bitrate or colour outside
  `src/config/` or a CSS token.

## Checklist by task type

### Documentation

- JSDoc on everything exported. For DSP modules, the doc block must cite
  the spec section or standard clause it implements — e.g. `BS.1770-4
  §4.1` or `spec §5.2 step 3` — so the code can be checked against the
  source of truth without archaeology.
- Every magic-looking constant in `config/` carries a one-line comment
  saying where the number came from. If the answer is "we chose it",
  say that too.
- Skip JSDoc on trivial internal helpers.

### Testing

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

### Commit messages

Short imperative subject, no type prefix. Body when the change needs a
why. Reference the backlog ID when there is one: `VH-3: validate meter
against EBU Tech 3341 cases 1-9`.

### Tooling

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

## Exceptions recorded

- none yet; an exception is a decision in project/decisions.md

## Deeper references

- [The canon conventions file](../../project/digests/house-conventions.md), frozen at 029ae1e
- The canon AGENTS.md's engineering sections are above; the whole file's obligations are traced row by row in [the census](../migration/census.md)
- [The project's rulebooks](../rules.md) — UI-STANDARDS.md and DEV-INFRASTRUCTURE.md are routed there
