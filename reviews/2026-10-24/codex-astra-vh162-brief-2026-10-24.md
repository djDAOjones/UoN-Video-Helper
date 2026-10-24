# Codex astra brief — VH-162, the 0.2.0 cut, 2026-10-24

You are checking one item's candidate diff in this repository, read-only. The base is commit d926bd3 (VH-137's 0.2.0 statement edits). The candidate is the working tree against HEAD: `git diff`, plus this brief. Do not run the gate or build anything.

The item is `project/items/VH-162.md`: read its acceptance criteria. The owner's call and its quotes are in the new `project/decisions.md` entry "2026-10-24 — VH-162". The approved hosting wording, to be applied verbatim:

- A1, brief Direction: "Public on a UoN Xerte upload; GitHub Pages stays as the unadvertised preview from `main`."
- A2, brief Platform and deployment: "Hosting is answered (D5, PLAN-6): the public home is a flat Xerte package on `xerte.nottingham.ac.uk`, which the owner uploads by hand from each release (`npm run package:xerte`). GitHub Pages stays up as the unadvertised preview, and every push to `main` updates it."
- A3, brief Open questions, D5's working assumption: "Answered: Xerte is the public home, GitHub Pages the unadvertised preview (PLAN-6)"
- A4, profile Hosting and deploy: "Xerte, the public home: a flat upload by the owner from each release, `npm run package:xerte`; GitHub Pages, the unadvertised preview from `main`"
- A5, profile Push: "a push to `main` publishes the pilot" becomes "a push to `main` publishes the preview".
- `docs/03-open-decisions.md` D5 gains an "Answered 2026-10-22 (PLAN-6)" line: Xerte the public home, Pages the unadvertised preview.

Also: `package.json` version 0.2.0 via `npm version --no-git-tag-version` (the lockfile's root version follows); VH-162 struck from the backlog with a trajectory line; the item's Now and a note; wish line VH-162.1 for DEV-INFRASTRUCTURE.md's stale hosting lines, outside the approved wording; `tools/archive.mjs` moved the oldest decision. After commit, the commit is tagged `v0.2.0` and `npm run package:xerte` builds the zip on a clean tree.

Please judge, with file:line references: (1) A1–A5 and D5 applied verbatim, nothing else in the signed text changed; (2) the version change touches nothing but the two root versions; (3) nothing claims v1 or full conformance, and VH-137 stays open with its November date; (4) the ledger edits obey AGENTS.md rules 4 to 6; (5) anything that should block the commit.

Reply with a one-line verdict first ("Commit", "Commit after the musts below" or "Do not commit"), then numbered points, each marked must, should or may.
