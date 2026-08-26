# UoN Video Helper

A browser-based tool that helps University of Nottingham staff prepare
educational video for publication: approved opening and closing branding,
consistent audio levels, and a correctly encoded MP4 — with no software to
install and **no media leaving the user's device**.

## Status

**Live as an unadvertised pilot**, built from `main` on every push. The MVP
shipped 2026-08-25: a real recording goes in and a branded, correctly-levelled
MP4 comes out, entirely on the user's device.

What it does NOT yet do is in [`pm_skills/project/backlog.md`](pm_skills/project/backlog.md).
Three things are worth knowing before using it in anger:

- **Firefox cannot make the audio.** It refuses to encode AAC at any bitrate, so
  a video with sound is refused before the job starts, with a message naming a
  browser that works. Silent sources are fine there (VH-49).
- **Opening sequences are withdrawn**, because no approved asset exists (VH-33).
- **So are the two closing transition modes**, and every job takes the hard cut.
  They were withdrawn for being wrong in Firefox; that is fixed and verified,
  and putting the controls back is an open decision (VH-46b).

## Quick start

```bash
npm install && npm run dev
```

Then open <http://localhost:5173>. Readiness is a page that mounts and a
`boot` line in the console — not merely a running process.

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server at <http://localhost:5173> |
| `npm run build` | Static output to `dist/` |
| `npm run check` | The one quality gate — types, lint, tests, build, docs |
| `npm test` | Test suite, including the EBU Tech 3341 meter validation |

Full detail: [`DEV-INFRASTRUCTURE.md`](DEV-INFRASTRUCTURE.md).

## Documents

| Document | Purpose |
| --- | --- |
| [`docs/01-specification.md`](docs/01-specification.md) | The specification. **Start here.** Authoritative. |
| [`docs/02-technical-rationale.md`](docs/02-technical-rationale.md) | Why each decision was made, with evidence. Read before re-opening one. |
| [`docs/03-open-decisions.md`](docs/03-open-decisions.md) | What still needs a human decision (D1–D13). |
| [`docs/00-original-brief.md`](docs/00-original-brief.md) | The original brief, verbatim. Historical record. |

## How it works

The app runs entirely in the browser using the **WebCodecs API**, which
gives access to the browser's own hardware-accelerated video encoders.
Nothing is uploaded, and no server-side processing exists.

This choice is deliberate and load-bearing — it is what makes long files
possible, keeps the University clear of codec licensing obligations, and
allows deployment as plain static files. See
[`docs/02-technical-rationale.md`](docs/02-technical-rationale.md).

A job is two passes over the source. Pass 1 decodes audio only and
measures loudness; pass 2 decodes video and audio, conforms to constant
frame rate, applies the audio chain with the now-known gain, encodes, and
muxes to OPFS. Branding joins as a third lane at the muxer. The whole job
runs in one Web Worker; the main thread only renders UI.

## Key entry points

| Path | What |
| --- | --- |
| `src/main.ts` | App entry — mounts the shell, installs diagnostics |
| `src/workers/job.worker.ts` | The job: both passes, progress, cancellation |
| `src/audio/loudness.ts` | The BS.1770-4 meter everything downstream trusts |
| `src/media/pipeline.ts` | Decode → conform → encode → mux |
| `src/config/` | Every tuneable value in the project |
| `test/ebu3341/` | The meter's acceptance harness |

## Invariants — do not break these

1. **No media egress.** No fetch, upload, beacon or analytics call carries
   media, filenames, or media characteristics. Verifiable by network
   inspection.
2. **The source file is never modified.**
3. **One runtime dependency:** `mediabunny`. Adding another stops and asks.
4. **Nothing buffers the whole file.** Streaming throughout. `fastStart`
   is always set explicitly — unset lets Mediabunny choose `'in-memory'`,
   which buffers everything.
5. **Loudness is measured on source content only** — never on the
   concatenated timeline with branding included.
6. **The meter is validated against EBU Tech 3341** (±0.1 LU) before
   anything that consumes loudness data ships.
7. **Numbers live in `src/config/`** or a CSS token, nowhere else.
8. **Cancel leaves no partial file and no orphaned OPFS data.**

Full rules: [`AGENTS.md`](AGENTS.md), [`UI-STANDARDS.md`](UI-STANDARDS.md),
[`DEV-INFRASTRUCTURE.md`](DEV-INFRASTRUCTURE.md).

## Gotchas

- **OPFS and the File System Access API need a secure context.**
  `localhost` counts; a LAN IP does not.
- **No COOP/COEP headers are needed, ever.** If something seems to want
  `SharedArrayBuffer`, the design is wrong (rationale §1.3).
- **WebCodecs cannot be mocked usefully.** A mocked encoder proves nothing
  about whether the real one accepts the config. Browser-only checks are
  verified by hand and recorded.
- **Mediabunny cannot even see subtitle tracks** — a subtitle-bearing MP4
  reads back as zero tracks. It writes them fine. Detecting one needs our
  own `hdlr` scan. See
  [`architecture.md`](pm_skills/project/architecture.md) → "Known
  constraints in the dependency".
- **This repo lives on OneDrive, and that has already bitten.** Files-On-Demand
  dehydrates `node_modules`, after which every read is a network fetch. The
  symptom is `tsc` hanging or ESLint failing with
  `ETIMEDOUT: connection timed out, read` — neither of which looks like a
  storage problem. `npm ci` rewrites the files locally and fixes it in seconds.
  Cloud sync can also revert tracked files mid-session. Exclude this folder
  from sync, or mark it "always keep on this device"; `.gitignore` has no
  effect, because OneDrive does not read it.

## Project management

This repository uses the [PM Skills](https://github.com/djDAOjones/PM-Skills-lab)
framework (v4.9.2) in [`pm_skills/`](pm_skills/) for AI-assisted
development. Project memory is in [`pm_skills/project/`](pm_skills/project/).
