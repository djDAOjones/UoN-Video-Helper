# Rules — UoN Video Helper

<!-- Owner-signed; rule 1 reads this file. Always holds the invariants,
     the protected paths and the Environment; By task routes the
     documents a task type reads, with budgets. Written by the v3 intake
     from the canon AGENTS.md at 029ae1e on 2026-10-01; the census in
     project/migration/census.md traces every canon obligation to its
     home. [guess] marks what intake could not source. -->

## Always

- No media egress, ever: no fetch, upload, beacon or analytics call carries media, a filename or a media characteristic; branding assets travel inbound only.
- The source file is never modified; every output is a new file.
- WebCodecs, not ffmpeg.wasm (rationale §1): no wasm codec, `SharedArrayBuffer` or COOP/COEP headers.
- One runtime dependency, mediabunny; anything else stops and asks.
- Loudness is measured on source content only, never the concatenated timeline; the meter is proved against EBU Tech 3341 (±0.1 LU) before anything trusts it.
- Streaming, not buffering: no step holds the whole file; `fastStart` is always set explicitly, never `'in-memory'`.
- Numbers live in `src/config/` or a CSS token; a literal elsewhere is a defect.
- Silent data loss is the worst outcome: what cannot be carried through warns before processing starts; cancel leaves no partial file or orphaned OPFS data.
- No control for power users; Carbon productive in our own code; WCAG 2.2 AAA, exceptions recorded.
- All imports at the top; build output is read-only. Search the full source tree before proposing a change; check `src/config/` and existing controls before adding a value or a control.
- One structured logger; the diagnostics bundle is redacted (never a filename, path or media bytes) and dev-only.
- A two-part version identity (product version, build id). Secrets never in source, URLs, logs or the bundle; a leak is rotated first, then a `[!]` line.
- Protected paths: `docs/*.md` — a correction is a wish line the owner approves; `src/audio/kweighting.ts`, `loudness.ts`, `truepeak.ts` — a change re-runs the EBU harness; `test/ebu3341/` — never weakened; `samples/` — never written, moved or deleted; `test/fixtures/`, `dist/`, `node_modules/`, `package-lock.json` — generated; `pm_skills/` — the frozen canon record (`project/history.md`).
- Push and network follow the profile's Push and Network lines; a blocked push is reported as pending.

### Environment

- Run the environment preflight at session start (warn-only), blocking before any memory-file surgery. The working copy is the owner's OneDrive checkout, pinned Always Keep on This Device, `core.fileMode` false: before git work nothing outside `node_modules` may be cloud-only (`find . -path ./node_modules -prune -o -flags +dataless -print`); a dehydrated `node_modules` is rebuilt with `rm -rf node_modules && npm ci`.
- Local `main` is stale by design; what is published is `origin/main`.
- Run `npm run check` on a settled machine, never beside `run-in-engines.mjs`; a slow DSP failure reports the machine.
- The owner, a vibe coder, owns structure and design: do the work; explain only when asked.
- `CLAUDE.local.md` holds personal instructions; harness memories are not the record.
- The spike pages and cross-engine runs are the manual gate; name what only a person verified.

## By task

| Task type | Document to read | Budget (words) | Approver |
| --- | --- | --- | --- |
| UI, controls, text, states, accessibility, user-facing behaviour | UI-STANDARDS.md | 2,400 | AAA exceptions documented (design review gate) |
| UI | project/digests/carbon.md | 460 | |
| UI | project/digests/nielsen.md | 350 | |
| UI | project/digests/wcag-2.2-aaa.md | 600 | |
| build, dev server, scripts, deploy, versioning, diagnostics | DEV-INFRASTRUCTURE.md | 4,600 | |
| code change | project/architecture.md | 3,100 | |
| code change | project/digests/house-conventions.md | 1,700 | |
| a change the specification governs | docs/01-specification.md | 6,400 | the owner approves every edit to docs/ |
| re-opening a settled choice | docs/02-technical-rationale.md | 2,600 | the owner |

## Signed

- Owner: Joe, 2026-10-02.
