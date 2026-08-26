# Dev Infrastructure

This file defines the permanent rules for how the project is built,
run, tested, versioned, and shipped. `AGENTS.md` references this file.
Read it before any task that involves the build system, dev server,
scripts, configuration, or deployment.

---

## Package management

**npm.** No pnpm, no yarn — one lockfile, no corepack setup step, and
nothing a maintainer on a managed University laptop has to install first.

**Runtime dependencies: exactly one.**

| Package | Version | Licence | Why |
| --- | --- | --- | --- |
| `mediabunny` | ^1.55.2 | MPL-2.0 | MP4 demux and mux. WebCodecs handles codecs but not containers. Zero runtime deps of its own. |

Adding any second runtime dependency **stops and asks** (an `AGENTS.md`
hard rule). Licence floor is MPL-2.0 or more permissive; no GPL component
ever ships, because avoiding that exposure is a reason this architecture
exists.

Dev dependencies are tooling, ship nothing to the user, and do not count
against that rule — but keep the set small and boring: `vite`, `vitest`,
`typescript`, `eslint` + `typescript-eslint`, `prettier`, `markdownlint-cli2`.

**`npm ci` in CI, `npm install` locally.** The lockfile is committed and
is not hand-edited.

---

## Canonical scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Dev server with HMR at <http://localhost:5173> |
| `build` | `tsc --noEmit && vite build` | Static production output to `dist/` |
| `preview` | `vite preview` | Serve the built output at <http://localhost:4173> |
| `test` | `vitest run` | Full test suite, once |
| `test:watch` | `vitest` | Watch mode during development |
| `typecheck` | `tsc --noEmit` | Types only |
| `lint` | `eslint . --max-warnings 0` | Correctness lint, non-mutating |
| `lint:fix` | `eslint . --fix` | Auto-fix. **Never** part of `check`. |
| `format` | `prettier --write .` | Auto-fix. **Never** part of `check`. |
| `docs:lint` | `markdownlint-cli2 "**/*.md" "#node_modules" "#pm_skills"` | Markdown lint |
| `docs:links` | `node check-links.mjs` | Internal Markdown link check |
| `check:placeholders` | `node scripts/check-placeholders.mjs` | Stray template markers, plus a report-only key-shape scan |
| `check:memory` | `node pm_skills/scaffold/check-memory.mjs` | Project-memory structure and budgets. Structural drift exits 1; budget overruns are advisory |
| `fixtures` | `node scripts/gen-fixtures.mjs` | Regenerate test media fixtures — **arrives with VH-16**; not yet in `package.json` |
| `check` | see **Quality gate** below | The one gate |

Any script added here is added to this table in the same change. A script
that exists in `package.json` and not here is a defect.

---

## Dev server

**Canonical URL: <http://localhost:5173>** — Vite's default, and what the
runtime lifecycle below assumes.

Vite falls back to the next free port if 5173 is occupied (another project,
another session), and honours `PORT` when something upstream assigns one.
Read the port it prints rather than assuming. `strictPort` is deliberately
not set: failing to boot because a neighbour holds a port is a worse default
than moving, and nothing here depends on 5173 — there are no OAuth callbacks,
webhooks, or CORS origins to keep stable.

```bash
npm run dev
```

Serves `index.html` from the project root with the TypeScript entry at
`src/main.ts`, HMR on, and worker modules bundled automatically.

Two things to know:

- **No special response headers are needed.** No COOP, no COEP, no
  `SharedArrayBuffer`. That is a deliberate property of the WebCodecs
  architecture (rationale §1.3) and one of the reasons this app can be
  hosted as plain static files. If a change ever seems to need those
  headers, the change is wrong.
- **OPFS and the File System Access API need a secure context.**
  `localhost` counts as secure, so the dev server works. A LAN IP does
  not — test on `localhost`, or over HTTPS.

The built output is testable the same way via `npm run preview`.

---

## Runtime lifecycle

### Boot

```bash
npm install && npm run dev
```

**Readiness check — not just "a process started":**

```bash
curl -sf http://localhost:5173/ > /dev/null && echo "ready"
```

A launched Vite process that is serving a 500 is not ready. Check the
response, and then confirm in a browser that the page mounts and the
console shows the app's own boot log line (see **Maintainer diagnostics**).

### Reboot / recovery

```bash
npm run dev
```

Vite owns its own process; stopping it is `Ctrl-C` in its terminal. If a
stale process holds port 5173:

```bash
lsof -ti tcp:5173 | xargs -r kill
```

That command kills only what is listening on **this project's** port. It
does not pattern-match process names, and it never touches anything else.

### When the toolchain stalls on this filesystem

The repository sits on a OneDrive path. If `tsc` hangs, or ESLint fails with
`ETIMEDOUT: connection timed out, read`, the cause is almost certainly that
Files-On-Demand has dehydrated `node_modules` and reads are waiting on the
network — not anything in the code.

```bash
rm -rf node_modules && npm ci
```

That rewrites every dependency locally and takes a few seconds. It is a
recovery, not a fix: see the `[maintainer]` backlog item on excluding this
folder from sync.

### Generated output — safe to delete

| Path | Regenerated by |
| --- | --- |
| `dist/` | `npm run build` |
| `node_modules/` | `npm install` |
| `test/fixtures/` | `npm run fixtures` |
| `.vite/` cache | automatically |

### Never deleted by any script

`src/`, `docs/`, `pm_skills/`, `samples/`, and the lockfile. `samples/`
holds the maintainer's real recordings and is irreplaceable — no script
may write to it, move it, or remove it.

### In-browser state

The app's only persistent state is its **OPFS working store**, which is
scratch space for in-progress jobs. It is swept at app start and cleaned
on every job exit path (see `AGENTS.md` → "OPFS working-store
checklist"). To clear it by hand, use the browser's site-data controls —
there is no script, because no Node process can reach it.

### Environment

There is no `.env` and no environment workflow. The app has no secrets,
no API keys, and no backend. If that ever changes, this section changes
with it.

---

## Maintainer diagnostics

### The logger

One structured logger in `src/core/logger.ts`. Never scattered
`console.log`.

```ts
log.info('pipeline', 'pass 1 complete', { integratedLufs, lra, truePeakDbtp })
```

Each record is `{ ts, level, scope, message, data }`. It writes to the
console **and** to a bounded in-memory ring buffer (last 500 records, so
a long job cannot grow it without limit). The buffer lives in both the
main thread and the worker; the worker's is drained across the boundary
when diagnostics are copied.

Scopes match the module tree: `boot`, `inspect`, `capability`, `probe`,
`pipeline`, `audio`, `branding`, `opfs`, `ui`.

### Global capture

`src/core/diagnostics.ts` installs, at boot and before anything else:

- `window.addEventListener('error', …)`
- `window.addEventListener('unhandledrejection', …)`
- the same pair inside the worker, forwarded to the main thread as an
  `error` message

An uncaught throw is logged, surfaced in the UI as a real error state,
and never swallowed.

### The copy-diagnostics bundle

Dev-only (`import.meta.env.DEV`), per `UI-STANDARDS.md` → "Diagnostics
affordance". Contains:

- `appVersion` and `buildId`
- recent log records from both threads
- uncaught errors with stacks
- capability report: browser, WebCodecs support, encode-config results,
  OPFS quota, device class
- the `SourceReport` **shape** and the `JobSpec`

### Redaction — specific to this app

The obvious secret here is not a token, it is **the user's media and
their filename.** The bundle must never carry:

- the filename, or any path
- any media bytes, frame data, or PCM
- OPFS file contents
- anything derived from the media that could identify it

Dimensions, duration, frame rate and codec strings are fine and are what
makes the bundle useful. The filename is not. `redact()` in
`diagnostics.ts` owns this, and it is tested.

---

## Quality gate

The gate also runs in CI before every deploy (`.github/workflows/deploy-pages.yml`).
A GitHub-hosted runner is roughly 1.5x slower than a development machine, which
is why `testTimeout` is raised to 30 s in `vite.config.ts`: the audio chain
tests process 90-120 seconds of audio and three of them timed out against
vitest's 5 s default the first time the gate ran in CI. If a test starts
failing only in CI, check its duration before its assertions.

**Gate on a settled machine.** The 30 s bound covers CI's ~1.5x, and it cannot
cover contention — nothing sensible can. Measured here on 2026-08-26:
`chain.test.ts` took **540 s** and failed a test while three headless browsers
were encoding alongside it, against ~4 s idle. That is ~138x, so a timeout large
enough to survive it would take nine minutes to report a genuinely hung test.
The bound is the wrong lever for this and the operating rule is the right one:
do not run `npm run check` next to anything heavy — a browser fleet, an ffmpeg
batch, `scripts/run-in-engines.mjs`. A DSP test that fails after an unusually
long duration is reporting the machine, not the code; re-run it idle before
believing it.

```bash
npm run check
```

```bash
npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:lint && npm run docs:links && npm run check:placeholders && npm run check:memory
```

**Non-mutating and CI-safe.** It reports; it never reformats or writes.
`lint:fix` and `format` are separate verbs and are never part of the
gate.

Runs, in order:

| Step | Catches |
| --- | --- |
| `typecheck` | Type errors, broken imports |
| `lint` | Unused/broken imports, dead code, floating promises |
| `test` | Unit suite — **including the EBU Tech 3341 harness** |
| `build` | Anything that only breaks in a production bundle |
| `docs:lint` + `docs:links` | Broken Markdown and dead cross-references in `docs/` and project memory |
| `check:placeholders` | Stray `CUSTOMISE` / `[Project Name]` markers (the init Step 10 lint, folded in) |
| `check:memory` | Project-memory drift — shipped items left in the backlog, ticket-grammar violations, dangling `[detail]` links, stale file-map paths |

**The EBU Tech 3341 harness is inside `check`, deliberately.** It is the
project's headline acceptance criterion, and a change that silently
breaks meter accuracy must fail the gate rather than be discovered by
ear.

**Deliberately omitted:** anything needing a real browser — WebCodecs
encode/decode, OPFS, the File System Access API, and the full pipeline
end-to-end. Those cannot run in Node and are verified manually in a
browser, with the check recorded in the task's verification notes. This
is the "two layers" rule in `AGENTS.md` → Testing: the automated net
never replaces the manual gate.

**Formatting is not in the gate.** Prettier runs on save. A formatting
difference is never a build failure.

Green `check` is the precondition for calling a task done. A failure is
signal: fix the cause, or record why the rule is wrong and change it.
Never `|| true` a step.

---

## Security baseline

This project's threat model is unusual and worth stating plainly: **there
are no credentials to leak, and the sensitive asset is the user's own
media.**

- **No secrets, no `.env`, no API keys, no backend.** Nothing to rotate,
  because nothing exists. If that changes, this section changes first.
- **`.gitignore` discipline.** `samples/`, `*.mov`, `*.mkv`, `dist/`,
  `node_modules/`, and `.env*` are ignored. `samples/` matters most —
  real recordings of University staff must never reach a public remote.
  Verify before any first push to a new remote.
- **The secret-shaped scan** in `check:placeholders` also greps for
  key-shaped strings (long base64/hex runs, `sk-`, `ghp_`, AWS-style
  ids). Report-only. It exists to catch a pasted credential, not to
  gate.
- **No media egress** is the security property that actually matters
  here, and it is enforced as a product invariant, not a config: no
  fetch, upload, beacon, or analytics call may carry media, filenames,
  or media characteristics. It is verified by network inspection during
  a full job (spec §13 criterion 9).
- **Diagnostics redaction** is the other real exposure and is covered
  under **Maintainer diagnostics** above — the filename is treated as
  sensitive.
- **Dependency advisories:** `npm audit` at every dependency change and
  at each milestone close. With one runtime dependency the surface is
  small, which is the point.
- **If a credential ever is leaked:** rotate at the provider first,
  then decide on history cleanup. Rotation is the fix. Track it with a
  `[security]` backlog item on creation.

---

## Build system

- **Bundler:** Vite (Rollup under the hood for production).
- **Entry point:** `index.html` at the project root → `src/main.ts`.
- **Output:** `dist/` — plain static files. **Read-only to agents.**
- **Workers:** bundled via
  `new Worker(new URL('./workers/job.worker.ts', import.meta.url), { type: 'module' })`.
  Vite handles this natively; do not hand-roll a worker build step.
- **Target:** `esnext`. This app already requires WebCodecs; there is no
  browser that supports WebCodecs and needs ES5 output, so downlevelling
  would add weight for nobody.
- **Source maps:** on in production. The app is open, has no secrets,
  and a legible stack trace from a University laptop is worth far more
  than obscurity.
- **Minification:** default (esbuild).
- **Static assets:** branding masters live in `public/branding/` and are
  copied verbatim — never inlined, never hashed into a bundle. They are
  fetched at runtime and cached, so they must keep stable URLs.
- **No polyfills.** If the browser lacks the API, it is unsupported and
  says so clearly (spec §10).

---

## Version management

Two parts, per `AGENTS.md` → "Traceable version identity".

| Part | Format | Source |
| --- | --- | --- |
| **Product version** | `v0.1.0` | `version` in `package.json`; git tag on release |
| **Build identity** | `v0.1.0+20260824.92e9791` | Injected at build time from the date and `git rev-parse --short HEAD` |

Injected by Vite `define` as `__APP_VERSION__` and `__BUILD_ID__`, read
once in `src/core/version.ts`. Both appear in the diagnostics bundle and
in the UI's About/footer line — both are non-secret and safe to copy.

**Bump rule:** patch for fixes; minor for a completed milestone; `v1.0.0`
when staff can be told to trust it — which, per spec §13, means the
acceptance criteria pass on the real test corpus, not on synthesised
fixtures.

The MVP starts at **`v0.1.0`**.

---

## Deployment

**Not yet defined — open decision D5.** Hosting location and URL are
with UoN IT / the web team.

The Band 0 MVP is **local only**. Nothing deploys until D5 is answered
and this section is populated with sign-off, per `prompts/deploy.md`
step 1.

What is already known, and constrains the eventual answer:

- Static files only. No server-side processing, no build step on the
  host, no special response headers.
- Must be a **secure context** (HTTPS) — OPFS and the File System Access
  API require it.
- Branding assets must keep stable URLs and be cacheable, so the app can
  work offline after first load (spec §11).
- No analytics that carries filenames or media characteristics.

---

## Utility scripts

| Script | Path | Purpose |
| --- | --- | --- |
| `build-branding.mjs` | `scripts/` | Transcodes the After Effects closing masters into the WebM onsets and MP4 tails the app ships. Maintainer-run; needs `ffmpeg`. Its output is committed. |
| `check-placeholders.mjs` | `scripts/` | Tier 0 of the quality gate: stray template markers fail, key-shaped strings are reported. |
| `run-in-engines.mjs` | `scripts/` | Runs a spike page in Chrome, Firefox and Safari and prints all three side by side. See "Cross-engine verification" below. |
| `gen-placeholder-branding.mjs` | `scripts/` | Generates stand-in branding masters for all four §4.2 variants, so real After Effects renders drop in unchanged (VH-12). |
| `check-links.mjs` | root | Scaffolded internal Markdown link checker. |
| `gen-fixtures.mjs` | `scripts/` | **Not written yet — arrives with VH-16.** Will generate synthesised test media: slide-like frames with fine text, a variable-level speech bed, a VFR clip. |

### Cross-engine verification

WebCodecs, OPFS and the File System Access API cannot be usefully mocked, so
`conventions.md` puts browser-only checks in a real browser and has the result
recorded. The spike pages are those checks; `run-in-engines.mjs` runs one of
them in all three supported engines and prints what each reported:

```bash
npm run dev                                        # in one terminal
node scripts/run-in-engines.mjs /spike-alpha.html  # in another
```

Every spike page carries the same contract — a `<pre id="log">` ending with a
line of exactly `done` — and the script knows nothing beyond that: it
navigates, waits for the sentinel, prints the text. `--base` points at a
different origin (the dev server moves off 5173 when something else holds it);
`--engines chrome,firefox` narrows the set. A missing browser is skipped, not
an error.

Each engine speaks a different protocol and there is no choice about it:
Chrome over CDP, Firefox over WebDriver BiDi (it dropped CDP), Safari over
`safaridriver`. **Safari needs a one-time human step** — Settings → Advanced →
"Show features for web developers", then Develop → "Allow Remote Automation" —
without which `safaridriver` refuses the session and says so.

**Never run it alongside `npm run check`.** Three browsers saturate the machine
and the DSP suite then fails on timeout rather than on merit: `chain.test.ts`
took 540 s and failed a test the one time they overlapped, against ~4 s idle.
That is also why this is not part of the gate and must not become part of it.

Framework tooling in `pm_skills/scaffold/` (`gen-file-map.mjs`) runs in
place and is not copied.

---

## Configuration strategy

**Every tuneable value lives in `src/config/`, or in a CSS token.**
Nothing in `media/`, `audio/`, `branding/` or `ui/` may hard-code a
threshold, target, duration, bitrate or colour. This is an invariant, not
a preference — it is what keeps the open decisions cheap.

| File | Owns |
| --- | --- |
| `config/presets.ts` | The two output presets (spec §6.1, §6.2) |
| `config/audio.ts` | Loudness targets and every chain constant (§5.1, §5.2), plus the D3 boundary fade |
| `config/branding.ts` | D2 durations, the §4.2 master variant table |
| `config/thresholds.ts` | Pre-flight bands (§7.3), audio-warning triggers (§5.4) |
| `styles/tokens.brand.css` | The D1 brand background colour, and the UoN palette |
| `styles/tokens.carbon.css` | Carbon structural tokens |

Each constant carries a one-line comment saying where the number came
from. User-facing copy lives with its component, not in a config file —
it is content, not configuration.

---

## Editor config

`.editorconfig` at the root (scaffolded). Mechanical rules only: UTF-8,
LF line endings, final newline, trimmed trailing whitespace, 2-space
indent for JS/TS/CSS/JSON, 4-space for Markdown continuation.

Prettier owns everything beyond that and runs on save. The two do not
disagree; if they ever do, Prettier wins and `.editorconfig` is corrected.

---

## Files agents must not hand-edit

| Path | Why |
| --- | --- |
| `dist/` | Build output. Overwritten by `npm run build`. |
| `node_modules/` | Installed. |
| `package-lock.json` | Written by npm. Change it through `npm install`, never by hand. |
| `samples/` | The maintainer's real recordings. Read-only, irreplaceable, gitignored. |
| `test/fixtures/` | Generated by `npm run fixtures`. Regenerate; do not edit. |
| `docs/*.md` | The specification set. Protected — propose corrections, do not rewrite. |
| `pm_skills/` (except `pm_skills/project/`) | Framework files, replaced on upgrade. |
