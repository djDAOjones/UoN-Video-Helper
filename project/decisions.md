# Decisions

<!-- Newest first. Never edit an old entry; supersede it. Rule 1 reads
     exactly the latest ten entries' heading, Decision line and Deferred
     line, newest first. The Decision line states the what and its
     one-line why; Rationale holds evidence and detail, read on demand.
     The slice fails at close over 1,000 words. Entries the migration
     inventory lists are inherited and read as heading and Deferred
     line only; this ledger inherits none — the canon decision log is
     frozen under pm_skills/ and indexed by project/history.md. Grammar:
     ## YYYY-MM-DD — ID — title
     **Decision:** what was decided and its one-line why.
     **Rationale:** evidence and detail, in the terms another session
     would need.
     **Supersedes:** YYYY-MM-DD — ID — title, or "none".
     Optional **Deferred:** comma-separated target IDs, or "none".
     Budget 45 live entries: when the validator warns, tools/archive.mjs
     moves the oldest entries verbatim to project/archive/. -->

## 2026-10-05 — V3-CONFIRM — The OneDrive checkout is the working copy

**Decision:** the owner's OneDrive checkout, pinned with Always Keep on This Device and with `core.fileMode` false, is the working copy; the rules file's Environment line says so and loses "work in a clone outside it [guess]" and the advice to pause syncing — because the owner confirmed it in chat on 2026-10-05, as Route Plotter recorded in route-plotter#81.

**Rationale:** the owner's answer, in the first session on a new Mac, to the line the 2026-10-02 entry left as `[guess]`. Before asking, that session found the checkout sound, read-only: branch `codex/repository-review-remediation` at 051fd48, level with `origin/main`; a clean tree, with `core.fileMode` false because OneDrive restores files with changed permissions; nothing outside `node_modules` cloud-only (`find . -path ./node_modules -prune -o -flags +dataless -print` printed nothing); `samples/` holding its 33 files. Then `rm -rf node_modules && npm ci` and `npm run check` green on Node 24.21.0 from Homebrew. The pin keeps `.git` and the source hydrated, so the canon hazard — OneDrive dehydrating `.git` — is met by the pin and the dataless check rather than by a second clone; `node_modules` can still dehydrate and is rebuilt. This reverses the canon hostile-filesystem guard as the migration carried it (census row C60: cloud-synced paths unsupported). The route-plotter#81 precedent is cited on the owner's word, not fetched (rule 2).

**Supersedes:** none

**Deferred:** none

## 2026-10-02 — V3-CONFIRM — The owner signs the ledger, confirms Network and Handoff, installs the session hooks

**Decision:** the profile, brief and rules carry the owner's reviewed signature of 2026-10-02 in place of the delegated lines; the Network line (listed hosts github.com, registry.npmjs.org) and the Handoff split (Claude Code plans and executes; Codex reviews read-only) are confirmed and lose their `[guess]`; `.claude/settings.json` and `.claude/settings.intake.json` are committed from `tools/harness.mjs`, with the two session hooks — because the owner answered the three open intake questions on 2026-10-02 ("sign both now", the recommended Network and Handoff, "install Claude Code side in both").

**Rationale:** the owner's answers, given in chat on 2026-10-02 after the merge. Two edits to the generated settings, reviewed on his behalf and recorded here: the home directory is written as `~/` rather than an absolute path, since this repository is public; and the denies on `gh`, `git fetch` and `git pull` are removed, since github.com is a listed host and the project's own deployment notes use `gh` for rollback and run checks. The Codex profile is not installed: the lab found the generated profile fails to start a session on Codex 0.155.1, so that side waits for a verified generator. The hooks run only where the client runs them; the desktop app applied no generated setting in the lab's exposed week, so the first attended session should confirm with `/hooks` that the two SessionStart and PostToolUse hooks are loaded. `[guess]` stays on "Prose: en-GB" and on the clone-outside-OneDrive line, which the owner has not addressed.

**Supersedes:** none

**Deferred:** none

## 2026-10-01 — INTAKE — UoN Video Helper adopts pm-next v3 from canon 4.9.2

**Decision:** the project's contract, verbs and tools are pm-next v3's (PM-Skills-lab commit 155f145), the ledger under `project/` is written from the canon record at 029ae1e — Direction and the full brief from the brief, the rules file from `AGENTS.md` with `UI-STANDARDS.md` and `DEV-INFRASTRUCTURE.md` kept in place and routed, the architecture carried as a routed file and the conventions as a house digest, every open item as a backlog line with an item file holding its canon text verbatim, every wish and open doc-delta line carried — and the canon record under `pm_skills/` is frozen in place, pinned by `project/migration/inventory.json`, because the maintainer named this project for the lab's V3-FIELD on 2026-10-01 and v3's intake verb is the route for a canon project.

**Rationale:** the maintainer's word of 2026-10-01 ("V3-FIELD with uon video helper and route plotter"); the lab's item is V3-FIELD-1 and the pre-registration row is in the lab's V2-FIELD-1 record. Inventory: `project/migration/inventory.json` at the snapshot commit 029ae1e, written by the lab's `lab/tools/migrate-canon.mjs`; census: `project/migration/census.md`, 703 rows from seven sources — the canon `AGENTS.md`, `CLAUDE.md`, `UI-STANDARDS.md`, `DEV-INFRASTRUCTURE.md`, the brief, the conventions and the architecture; the source list was closed by reading the canon contract, its two rulebooks, the three hot memory files it names, the README (product description, no rule) and the two tickets (whose obligations are their own items' criteria, carried into the item files, not standing rules); every row was read in its destination's context by this session and, read-only, by Codex Astra, whose twelve findings — a narrowed search rule, the filesystem preflight, the recordings' move-and-delete prohibitions, four partial destinations, the capture rules, VH-28's blocker, the Node range, the Carbon typeface conflict, the unconfirmed intake choices, the credential scan skipped with the placeholders, the publish gate, the frozen validator's warnings — were each repaired or recorded before the push (the lab's V3-FIELD-1 item). Where each obligation went: the project invariants and protected paths to the rules file's Always; the read tiers, workflow modes, memory budgets, document ownership and memory anti-patterns retired as canon machinery, replaced by v3's rule 1, the verbs and the checker; the data model, subsystems, communication pattern and OPFS checklist to `project/architecture.md`; the engineering rules (minimal change, documentation, testing) and the conventions to the house digest; the generic rulebook rules to their kept files, routed by task; the brief to the full brief, summarised by Direction. The canon framework files beside the record (prompts, integrations, templates, scaffold) stay frozen with it: nothing routes to them, the gate's `check:memory` keeps validating the frozen memory — its seven warnings (a Refactor, an archive split) are historical diagnostics against a record that is never edited, not work — and retiring it with the framework copies is a wish line on the owner's word, not this commit's work. The gate itself now ends with the v3 checker (`npm run check`), so the publishing workflow runs it. What the tool cannot establish, and this session does not claim: that the source list is complete, that each destination keeps its obligation's force; the owner has not yet confirmed the Network line or the Handoff split, nor reviewed the signatures — all proposals until he does. Settings: `tools/harness.mjs` output recorded in the lab's raw-evidence lane, nothing written into the tree; the two session hooks are offered, installed only on the owner's word. The Network line is proposed from recorded practice and marked `[guess]`; the Handoff split likewise; the three signatures are delegated under the instruction to run V3-FIELD and name it, the owner's reviewed lines due within two weeks (3.8). Known hazard, recorded: the owner's OneDrive checkout carried an in-flight run on branch `codex/repository-review-remediation` with a dirty tree at migration time; that work closes under canon or v3 on the owner's word, and any canon write after the snapshot is a reconciliation against the inventory, never a loss. The migration commit carries no product work; the backlog and the rulebooks' routed files are untouched.

- Migration edit: AGENTS.md — retired — replaced by v3's contract verbatim; every canon obligation routed by the census
- Migration edit: package.json — re-applied — `check` ends with `node tools/check.mjs`, so the gate and the publishing workflow run the v3 checker
- Migration edit: eslint.config.js — re-applied — ignores `tools/**`, v3's tools, linted upstream
- Migration edit: scripts/check-placeholders.mjs — re-applied — the placeholder pass skips `project/migration`, which quotes the rulebooks' own marker names; the key-shape scan still covers it
- Migration edit: .markdownlint-cli2.jsonc — re-applied — skips `project/migration`
- Migration edit: CLAUDE.md — retired — v3's adapter; its three notes moved to the profile's Harness line and the rules file's Environment

**Supersedes:** none

**Deferred:** none
