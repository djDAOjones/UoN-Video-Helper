# UoN Video Helper

A browser-based tool that helps University of Nottingham staff prepare
educational video for publication: approved opening and closing branding,
consistent audio levels, and a correctly encoded MP4 — with no software to
install and no media leaving the user's device.

## Status

**Specification phase.** No application code yet.

## Documents

| Document | Purpose |
| --- | --- |
| [`docs/00-original-brief.md`](docs/00-original-brief.md) | The original brief, verbatim. Historical record. |
| [`docs/01-specification.md`](docs/01-specification.md) | The current specification. **Start here.** |
| [`docs/02-technical-rationale.md`](docs/02-technical-rationale.md) | Why each decision was made, with evidence. |
| [`docs/03-open-decisions.md`](docs/03-open-decisions.md) | What still needs a human decision. |

## How it works

The app runs entirely in the browser using the **WebCodecs API**, which
gives access to the browser's own hardware-accelerated video encoders.
Nothing is uploaded, and no server-side processing exists.

This choice is deliberate and load-bearing — it is what makes long files
possible, keeps the University clear of codec licensing obligations, and
allows deployment as plain static files. See
[`docs/02-technical-rationale.md`](docs/02-technical-rationale.md).

## Project management

This repository uses the [PM Skills](https://github.com/djDAOjones/PM-Skills-lab)
framework (v4.6.0) in [`pm_skills/`](pm_skills/) for AI-assisted
development: project memory, standards, and workflows.

Project memory lives in `pm_skills/project/` and is populated by running
`pm_skills/integrations/init-mvp.md`.
