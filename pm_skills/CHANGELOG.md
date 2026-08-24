# Changelog

Append-only record of pm-skills framework releases. Newest entry at
the top. Never rewrite a published entry.

This file is the **upgrade instruction set**. Each release lists what
changed and, critically, an **Upgrade actions** block: the mechanical
steps an agent applies to move a project from the previous version to
this one. The upgrade procedure (`prompts/upgrade.md`) reads the
entries between a project's current `VERSION` and the latest, and
executes their Upgrade actions in order — oldest first.

Versioning is semver-style for a docs framework:

- **major** — structural or breaking change that needs a migration
  (renamed/removed files, restructured templates, changed memory
  contracts).
- **minor** — new file or capability, backward compatible (a new
  prompt, integration, or template section).
- **patch** — wording, clarification, or fix with no new files and no
  migration.

Maintainers: every framework change must bump `pm_skills/VERSION` and
add an entry here. See `prompts/release.md`.

---

## Archived epochs

Entries for superseded epochs live in sibling files, moved
verbatim (CL-HORIZON, 4.5.0). The upgrade walk starts in the
oldest file its version gap touches:

- 1.x — `CHANGELOG-1x.md`
- 2.x — `CHANGELOG-2x.md`
- 3.x — `CHANGELOG-3x.md` (3.17.1, the final 3.x entry, stays
  below so a one-gap upgrade never opens the archive)

## 4.9.2 — 2026-08-23

RELEASE-TREE-GLOB: the release checklist's GUIDE-tree check now
honours glob lines. Since 4.5.0 the guide's folder tree lists the
archived changelog epochs as one `CHANGELOG-*.md` line, and the step 6
snippet grepped each shipped basename literally — so the three
archive files reported MISSING at every release (a false positive
reproduced at the 4.9.1 close). Wording and snippet only; no new
files, no behaviour change for consuming projects.

### Changed

- `pm_skills/prompts/release.md` — step 6's "Top-level files missing
  from the GUIDE tree" loop: a basename that matches any `*` pattern
  token in the guide (file-shaped tokens only, `name*name.ext`) now
  passes; a name the guide neither mentions nor covers by pattern
  still reports MISSING. Shell-agnostic (regex via `grep -E`, no
  word-splitting or pathname-expansion dependence); verified under
  sh, bash, and zsh. One explanatory paragraph follows the snippet.

### Upgrade actions

- Replace `pm_skills/prompts/release.md` with this version's copy
  (`framework` class). Source-repo maintainers only — consuming
  projects never run the release checklist; nothing else to do.

## 4.9.1 — 2026-08-23

GUIDE-SYNC: the guide's prose catches up with behaviour that shipped
across 4.4.0–4.9.0 but was only ever reflected in the file tree or
the verb list. Wording only — no new files, no behaviour change.

### Changed

- `pm_skills/GUIDE.md` — the mental model names the optional
  `PROCESS.md` rulebook and the full hot-tier set (root README,
  brief, architecture, conventions); the folder tree states the
  `MANIFEST.md` class names exactly (`root-template`,
  `project-memory`); "Two ways to drive it" lists
  `prompts/backlog-authoring.md` among the prompts carrying workflow
  frontmatter; the daily-loop Pick describes the 4.9.0 empty-queue
  rule (a Re-assess pass is proposed before any Icebox pull) and the
  optional janitor report; the Close steps name the `doc-deltas.md`
  capture and `scaffold/check-memory.mjs` as the whole of step 4
  where it is wired; "Looking after project memory" presents the
  validator as a gate for any project, not only records mode, and
  the model-tier note adds Re-assess's re-grading to the propose
  steps.

### Upgrade actions

- Replace `pm_skills/GUIDE.md` with this version's copy (`framework`
  class).
- No file adds, renames, or removals; no memory migration; nothing
  to do in a consuming project beyond the replace.

## 4.9.0 — 2026-08-18

PLAN-ORDER: memory maintenance gains a sixth verb, **Re-assess
(re-judge the queue)** — a maintainer-gated pass that re-grades
standing items, refreshes hold reasons and triggers, re-orders, and
refills empty milestones, so the next pick stands on current
judgement rather than stale grades. Refactor repairs the map's
structure and stops when it is clean; Re-assess re-judges its
substance, which a structurally clean backlog can need all the same
(evidence: two manual precedents on the source repo, 2026-08-17 and
2026-08-18).

### Changed

- `pm_skills/prompts/memory-maintenance.md` — new **Re-assess** verb
  (RA1–RA5 + rules: propose-only, never auto-run, age informs but
  never reorders, quiet no-op when nothing changed); the intro and
  shared-rules lines now count six verbs; the model-tier note adds
  RA3 to the propose steps; Diagnose check 13's action now routes
  ageing standing items to Re-assess.
- `pm_skills/prompts/session-start.md` — Start B step 2: an Icebox
  pull with nothing committed in Active now proposes a Re-assess
  pass first; with Current and Next both empty, that pass is the
  refill mechanism.
- `pm_skills/GUIDE.md` — the folder-tree line and the "Looking after
  project memory" verb list carry all six verbs.

### Upgrade actions

- Re-copy `pm_skills/prompts/memory-maintenance.md`,
  `pm_skills/prompts/session-start.md`, and `pm_skills/GUIDE.md`
  (all `framework` class — replace wholesale).
- No file adds, renames, or removals; no memory migration. Records
  mode needs no record changes: `Last assessed:` is a ticket-body
  line the new verb writes only when an assessment changes
  something.

## 4.8.0 — 2026-08-17

RECORDS-DIST: records mode becomes distributable (BACKLOG-STATE
phase 2) — run-in-place scaffold tooling, a configurable dialect
surface, and adoption grammar guidance. Evidence base: the first
records adoption on a consuming project (2026-08-17), which
canon-shaped tooling mis-served three ways.

### Added

- `pm_skills/scaffold/gen-backlog.mjs` — records-mode backlog-view
  generator (`scaffold` class, the directory default): flat
  frontmatter records under `tickets/` render the backlog's Active
  section between generated markers. Takes `--project-dir` (default
  `pm_skills/project`) and `--check`; first generation creates the
  `## Active` heading when the file lacks one; a record naming a
  milestone outside the configured groups is an error, never a
  silent drop. Dialect
  keys in `tickets/_meta.md`: `milestones: key=Title, …` (ordered;
  absent → Current / Next / Icebox) and per-group `<key>-intent:`
  lines.
- `pm_skills/scaffold/check-memory.mjs` — memory validator: the
  end-of-task size check and the mechanical half of Diagnose as one
  command, reading budgets from `pm_skills/memory-policy.md`.
  Records-aware (record↔view coherence, records-mode repair
  messages, dialect `flags:` extension — custom flags are known,
  never standing); structural failures exit 1, budget overruns
  warn. Optionally wired into a project's `check` gate.

### Changed

- `pm_skills/prompts/backlog-authoring.md` — new "Records mode"
  section: the record frontmatter grammar and field list, the
  `_meta.md` dialect keys, and the grammar the frontmatter forces —
  every item needs an ID (icebox lines included), IDs are
  SCREAMING-KEBAB with no dots, `summary:` is one physical line,
  edit-records-regenerate. The ticket-file lifecycle rule notes the
  records-mode inversion.
- `pm_skills/GUIDE.md` — "Records mode (optional)" adoption path
  under "Looking after project memory"; the scaffold file tree
  lists the two new tools.
- `pm_skills/init.md` — Step 9 notes the run-in-place scaffold
  tooling (nothing new to copy at init).
- `pm_skills/prompts/end-of-task.md` — the step 3 backlog bullet
  gains the records-mode aside: apply changes as record edits and
  regenerate; never hand-edit between the generated markers.
- `pm_skills/project/backlog.md` (template) — one pointer comment
  to the records-mode docs.
- `pm_skills/MANIFEST.md` — the class-inheritance rule now names
  `pm_skills/scaffold/` → `scaffold` explicitly (the paths table's
  wildcard already covered it).

### Upgrade actions

- Add `pm_skills/scaffold/gen-backlog.mjs` and
  `pm_skills/scaffold/check-memory.mjs` from this version
  (`scaffold` class; both run in place from `pm_skills/scaffold/` —
  nothing to copy into the project root).
- Replace `pm_skills/GUIDE.md`, `pm_skills/init.md`,
  `pm_skills/prompts/backlog-authoring.md`,
  `pm_skills/prompts/end-of-task.md`, and `pm_skills/MANIFEST.md`
  with this version's copies.
- Do **not** replace `pm_skills/project/backlog.md` in a consuming
  project (`project-memory` class — the class wins): the template's
  records-mode pointer comment reaches populated backlogs by
  adoption at the next backlog touch, never by file replacement.
- Optional adoption: a project that wants a generated backlog
  follows `pm_skills/GUIDE.md` → "Records mode" (records under
  `tickets/`, `_meta.md` dialect keys, the two tools optionally in
  its `check` gate). Prose backlogs remain first-class; no action
  otherwise.

## 4.7.2 — 2026-08-17

Correction release (CL-440-WORDING): 4.4.0's Upgrade actions name a
project-memory path in a replace list; plus the precedence rule in
`prompts/upgrade.md` and a `prompts/release.md` snippet completion.

### Corrections

- **4.4.0 → Upgrade actions** (published entry stays byte-untouched
  — append-only rule): the replace list names
  `pm_skills/project/backlog.md` "(template)". That path is
  `project-memory` class in `MANIFEST.md` and is **never replaced**
  in a consuming project — a populated backlog must survive every
  upgrade. What 4.4.0 should have said: the backlog-template deltas
  (linked `[detail]` grammar, legibility guidance) reach populated
  backlogs by adoption at the next backlog touch — see that entry's
  own "Optional adoptions" line — never by file replacement. For
  every walk: when an entry's literal action list conflicts with a
  path's MANIFEST class, **the class wins** (`prompts/upgrade.md`
  Step 3).

### Changed

- `prompts/upgrade.md` — Step 3 now states the precedence rule: an
  entry's action list never overrides a path's class; a
  `project-memory` path is never replaced whatever an entry says.
- `prompts/release.md` — step 6 snippet: the `TOP=` awk anchors to
  version headings (`^## [0-9]`), completing 4.7.1's grep fix (the
  coverage check was comparing against the "Archived epochs"
  section).

### Upgrade actions

- Replace `pm_skills/prompts/upgrade.md` and
  `pm_skills/prompts/release.md` with the 4.7.2 copies (`framework`
  class).
- No memory changes. If a past upgrade across 4.4.0 replaced a
  populated `pm_skills/project/backlog.md`, restore it from git
  history — 4.4.0 never licensed that replace.

## 4.7.1 — 2026-08-17

Advisory harness check joins the release close (RELEASE-EVALS).

### Changed

- `prompts/release.md` — new step 7, "Harness check (advisory)":
  repos keeping a behavioural eval harness run the scenarios
  applicable to the release — upgrade scenario for upgrade-machinery
  changes, close scenario for close-protocol changes — and note the
  results (or "no applicable scenarios" plus the reason) in the
  closing report. Advisory, never a gate; repos without a harness
  skip it. Also fixes the step 6 consistency snippet: the top-entry
  grep now matches version headings (`^## [0-9]`), not the
  "Archived epochs" section CL-HORIZON added above the entries.

### Upgrade actions

- Replace `pm_skills/prompts/release.md` with the 4.7.1 copy
  (`framework` class — no customisation check expected). No memory
  migration. Projects without an eval harness see no behavioural
  change.

## 4.7.0 — 2026-08-17

PAR-DISPATCH: a dispatch verb initiates parallel dev work in
parallel chats; the per-close transcript reminder retires.

### Added

- `pm_skills/integrations/dispatch.md` — the parallel-work entry
  move: pick two or three disjoint backlog items (at most one
  touching the release-bearing tree), assign lanes (branch, mode,
  a working tree each) and the primary, and emit one paste-ready
  brief per chat; the dispatching session integrates the returning
  lanes, applies their handoff blocks, and releases once. Composes
  the Start B pick, the GUIDE parallel conventions, and the
  secondary close; verified by a live two-lane dispatched exercise
  before release.

### Changed

- `pm_skills/integrations/next.md` — gains a pointer to the
  dispatch verb; the trigger itself stays strictly one-item.
- `pm_skills/GUIDE.md` — the file tree, the daily-loop Pick, and
  "Parallel and multi-machine work" gain dispatch pointers;
  "Saving session transcripts" is demoted to an optional on-demand
  reference (the 4.2.0 per-close reminder never fired in consuming
  evidence).
- `pm_skills/prompts/end-of-task.md` — the closing report's
  non-blocking save-your-transcript reminder paragraph is removed;
  the report step is otherwise unchanged.

### Upgrade actions

- Copy the new `pm_skills/integrations/dispatch.md` into place; if
  your AI tool runs workflows from a directory, copy it there
  alongside `task.md` and `next.md`.
- Replace `pm_skills/integrations/next.md`, `pm_skills/GUIDE.md`,
  and `pm_skills/prompts/end-of-task.md` with this version's
  copies (all `framework` class).
- Behaviour note: task closes no longer print the
  save-your-transcript reminder. The `_transcripts/` convention is
  unchanged and stays documented in `GUIDE.md` → "Saving session
  transcripts".

## 4.6.0 — 2026-08-17

PAR-BRANCH: branch-per-session coordination for records-mode
projects, with the regenerate-the-view merge rule.

### Changed

- `pm_skills/GUIDE.md` — "Parallel and multi-machine work" gains
  the records-mode path: sessions on branches, item work needs no
  claims, record files merge clean, and any view conflict is
  resolved by regenerating from the merged records — never by
  hand-merging the view. Advisory claims remain for prose-memory
  projects and the shared append files.
- `pm_skills/prompts/end-of-task.md` — the secondary-session close
  shrinks under records mode: the handoff block carries only the
  shared-file appends; backlog changes ride the branch as record
  edits.

### Upgrade actions

- Replace `pm_skills/GUIDE.md` and
  `pm_skills/prompts/end-of-task.md` with this version's copies.
  No action for prose-memory projects — the new paths activate only
  where a project runs a generated backlog over per-item records.

## 4.5.0 — 2026-08-17

JANITOR-READ + CL-HORIZON: session start can read a standing
janitor report instead of computing its nags, and the changelog's
superseded epochs move to archive files behind an index.

### Added

- `pm_skills/CHANGELOG-1x.md`, `pm_skills/CHANGELOG-2x.md`,
  `pm_skills/CHANGELOG-3x.md` — archived epochs, moved verbatim
  (49 entries verified byte-identical across the split; the live
  file drops from ~17.9k to ~1.9k words). `framework` class.

### Changed

- `pm_skills/CHANGELOG.md` — gains the "Archived epochs" index;
  keeps the 4.x epoch plus 3.17.1 live so a one-gap upgrade never
  opens the archive.
- `pm_skills/prompts/upgrade.md` — Step 2's walk follows the index
  into archived epoch files when the version gap starts there.
- `pm_skills/prompts/session-start.md` — new "Janitor report"
  section: a fresh report (under ~24 h, Start SHA in branch
  history) supplies the counts and banners; stale or absent falls
  back to computing. Read-only report; never canonical.
- `pm_skills/GUIDE.md` — folder tree lists the archive files.
- `pm_skills/MANIFEST.md` — rows for the three archive files.

### Upgrade actions

- Copy the three new `CHANGELOG-*x.md` files; replace
  `pm_skills/CHANGELOG.md`, `pm_skills/prompts/upgrade.md`,
  `pm_skills/prompts/session-start.md`, `pm_skills/GUIDE.md`, and
  `pm_skills/MANIFEST.md` with this version's copies.
- No action on project memory. A janitor script is optional
  maintainer tooling (the reference implementation lives in the
  framework source repo; a scaffold copy may ship once proven) —
  the session-start path activates only where a report exists.

## 4.4.0 — 2026-08-17

Ticket-sweep release: the optional PROCESS template (PROCESS-TPL,
option A), backlog authoring + ticket skeleton + navigation
(BACKLOG-AUTH — the TICKET-GEN authoring cluster), deprecation
shims on consolidation (DEPREC-SHIM), the `[security]`-flag
cross-reference, and harness auto-memory guidance.

### Added

- `pm_skills/templates/PROCESS.md` — optional fourth root template
  (`root-template` class) for complex multi-phase projects: macro
  phases with definitions of done, the decision/ADR closure
  protocol, always-four-stage triggers, demo/spike cadence, risk
  watch list. Conditional read tier; skippable without nag.
- `pm_skills/prompts/backlog-authoring.md` — loose ideas or a
  transcript → grammar-true backlog items grouped by milestone,
  plus `tickets/<ID>.md` files from its canonical ticket skeleton;
  doubles as the contract an external agent follows when asked to
  write tickets.

### Changed

- `pm_skills/prompts/upgrade.md` — Step 6 gains deprecation-shim
  handling for removed user-invocable files (workflow-dir sweep,
  optional tombstones); Step 5 and the report carry the
  backups-are-for-recovery-never-invocation rule.
- `pm_skills/prompts/release.md` — verify step requires an
  old → new mapping table whenever a release removes or renames a
  user-invocable file.
- `pm_skills/prompts/session-start.md` — stops any workflow
  invoked from `archive/upgrade-backup-*`; Start B triage now
  creates a ticket (skeleton + `[detail]`) for a promoted line
  that has outgrown one line, before the line is deleted.
- `pm_skills/project/backlog.md` — ticket grammar: the `[detail]`
  flag is written as a Markdown link targeting `tickets/<ID>.md`,
  so backlog → ticket is one hop; legibility guidance (lean
  milestones, one
  intent line per heading, shipped work never lingers even as
  comments); pointer to the authoring prompt.
- `pm_skills/templates/AGENTS.md` — conditional read tier gains
  the optional `PROCESS.md` line; the Security baseline states
  that leaked-credential tracking items are flagged `[security]`
  on creation.
- `pm_skills/init.md` — Step 0 mentions the optional fourth
  template.
- `pm_skills/GUIDE.md` — templates tree + prompts list updated;
  new "Harness auto-memories" guidance (tool memories are a
  per-tool cache; the files are the record); backlog-authoring
  usage note.
- `README.md` — commands table gains "Draft a backlog from these
  notes".
- `pm_skills/MANIFEST.md` — row for the new template.

### Upgrade actions

- Copy the two new files (`pm_skills/templates/PROCESS.md`,
  `pm_skills/prompts/backlog-authoring.md`); replace
  `pm_skills/prompts/upgrade.md`, `pm_skills/prompts/release.md`,
  `pm_skills/prompts/session-start.md`,
  `pm_skills/project/backlog.md` (template),
  `pm_skills/init.md`, `pm_skills/GUIDE.md`, and
  `pm_skills/MANIFEST.md` with this version's copies.
- `pm_skills/templates/AGENTS.md` is `root-template`: 3-way merge
  the two additive changes into your populated root copy (one
  conditional-tier bullet; one Security-baseline sentence).
- Optional adoptions, no action required: copy and populate
  `PROCESS.md` only if your project is multi-phase; rewrite
  existing `[detail]` flags as links at your next backlog touch.

## 4.3.0 — 2026-08-09

PRUNE-HYST + CTX-IMPORTS: prune actions gain a hysteresis target so
maintenance stops re-firing immediately, and the read-tier guidance
gains measured rules-import advice.

### Changed

- `pm_skills/memory-policy.md` — new "Prune-to targets (hysteresis)"
  rule: prune to at most 70% of a budget, never merely under it;
  `pruneToFraction` added to the machine-readable block.
- `pm_skills/GUIDE.md` — "How it works" gains rules-import guidance:
  import the identity documents into the rules position where the
  tool supports it (measured: about a third fewer tool round-trips,
  about a seventh fewer tokens at equal verified quality); pre-load
  identity documents only, never work-target files.
- `pm_skills/prompts/session-start.md` — one note under the hot
  whole-file list pointing at the same guidance.

### Upgrade actions

- Replace the three files above with this version's copies (all
  `framework`-class, standard replace). If your project customised
  budget numbers, re-apply them in both the JSON block and the
  table; the new `pruneToFraction` key defaults to 0.7.

## 4.2.0 — 2026-08-09

Wave 1 batch — TRANSCRIPT-SHA + OPT-PROTO + RETIRE-COMP +
CLOSE-COMMIT: four small capability and policy changes from the
machine-native programme, shipped as one listed release.
**Behaviour change:** the close now commits — and pushes when a
remote is already configured — as a standard step instead of a
proposal.

### Changed

- `pm_skills/GUIDE.md` — the transcript convention gains a
  `Start SHA:` first-line header (TRANSCRIPT-SHA: a saved transcript
  becomes a scenario seed for behavioural evaluations); "Commit as
  you close" reflects the standard commit-and-push close
  (CLOSE-COMMIT).
- `pm_skills/prompts/end-of-task.md` — the step 5 commit status
  reflects the standard commit-and-push close; the transcript
  reminder carries the `Start SHA:` header.
- `pm_skills/integrations/task.md` — step 11 becomes "Commit and
  push (standard close step)", keeping the staged-set echo and
  parallel-session staging rules and adding a no-habitual-bypass
  rule (never step past a failing gate with `--no-verify`); step 8
  drops the obsolete "imports at the top" compensation
  (RETIRE-COMP — a lint rule owns it where the stack supports one;
  evidence: two blinded evaluation runs showed frontier agents
  reconstruct sensible conventions regardless).
- `pm_skills/prompts/design-options.md` — new rule (OPT-PROTO):
  when options differ on an empirically checkable claim costing
  roughly fifteen minutes or less to check, run the check in a
  scratch location first and present measured comparisons, not
  argued ones.
- `pm_skills/prompts/memory-maintenance.md` — the shared verb rules
  keep stop-and-report-on-failure and drop the obsolete
  no-ad-hoc-scripts compensation (RETIRE-COMP).

### Upgrade actions

- Replace the five files above with this version's copies (all
  `framework`-class, standard replace).
- **Flag the behaviour change to the project owner:** closes now
  commit and push by default. A project that prefers the previous
  propose-only behaviour states it in its root `AGENTS.md` (one
  line, e.g. "Closes propose commits; never auto-commit or push").

## 4.1.0 — 2026-08-09

MEM-CHECK: budgets become machine-readable and the end-of-task size
check gains a validator hook — the first enforcement-over-exhortation
release from the 2026-08-08 machine-native evaluation series:
mechanical memory checks move from prose instructions to a tool a
project can run, gate on, and build evaluations against.

### Changed

- `pm_skills/memory-policy.md` — new "Machine-readable budgets"
  section: the canonical budget numbers as a fenced JSON block a
  memory validator parses; the table below it explains the same
  numbers for humans. Update block and table together.
- `pm_skills/prompts/end-of-task.md` — step 4 gains a "Memory
  validator (preferred when the project keeps one)" paragraph:
  structural failures must be fixed before closing, WARN lines feed
  the maintenance proposals, and the manual counts remain the
  fallback when no validator exists.

### Upgrade actions

- Replace `pm_skills/memory-policy.md` and
  `pm_skills/prompts/end-of-task.md` with this version's copies
  (both `framework`-class, standard replace). If your project
  customised budget numbers, re-apply them inside BOTH the new JSON
  block and the table — they must stay in step.
- No new distributed files: the reference validator
  (`check-memory.mjs`) lives in the framework source repo only; a
  scaffold copy ships in a later release once proven on a consuming
  project. Nothing else to do.

## 4.0.0 — 2026-07-17

DIST-BOUNDARY: the three rulebook templates lived at the framework
repo's root, so the natural acquisition act — cloning or downloading
the repo — carried the maintainer's own tree (repo README, tooling,
CI, self-hosted memory) into consuming projects, and IDE global-rule
loading in the source repo picked up the placeholder template instead
of the operative contract (both observed on a real consuming project,
2026-07-16). The distributable is now exactly one folder: `pm_skills/`
contains everything, including the templates. Major: distributed
files moved (root → `pm_skills/templates/`).

### Changed

- `pm_skills/templates/AGENTS.md`, `pm_skills/templates/UI-STANDARDS.md`,
  `pm_skills/templates/DEV-INFRASTRUCTURE.md` — the three root-template
  files move from the source repo root into the distributed tree.
  Content unchanged; class unchanged (`root-template`).
- `pm_skills/MANIFEST.md` — root-template path rows moved to
  `pm_skills/templates/*`; the `root-template` class description now
  states the ship-in-templates / populate-at-root split; new files
  under `pm_skills/templates/` default to `root-template`.
- `pm_skills/init.md` — new **Step 0: Copy the rulebook templates**
  (`cp -n` from `pm_skills/templates/` to the project root); agent
  mode executes Steps 0–10; preamble and minimum-viable list updated.
- `pm_skills/GUIDE.md` — folder tree gains `templates/`; the rulebooks
  bullet notes they are copied out of `templates/` at init.
- `pm_skills/prompts/upgrade.md` — intro and Step 7 name the template
  source location (`pm_skills/templates/` at 4.0.0+, the source repo
  root in older sources); the merge target is always the project's
  populated root copy.
- `pm_skills/integrations/adopt.md` — framework-source-tree detection
  heuristic updated for the new template location; the framework
  context read copies missing root rulebooks from
  `pm_skills/templates/` per init Step 0.
- `pm_skills/integrations/init-mvp.md` — same framework context read
  update.

### Upgrade actions

- Framework sync (Step 6): overwrite `init.md`, `GUIDE.md`,
  `MANIFEST.md`, `prompts/upgrade.md`, `integrations/adopt.md`,
  `integrations/init-mvp.md`, `VERSION`, `CHANGELOG.md`; **add** the
  new `pm_skills/templates/` directory (three files) from the source.
- Your populated root `AGENTS.md`, `UI-STANDARDS.md`, and
  `DEV-INFRASTRUCTURE.md` are your project's own copies — **no
  action**; nothing moves, merges, or is overwritten at the project
  root. Future template merges (upgrade Step 7) read the base
  structure from `pm_skills/templates/` instead of the source root.
- Housekeeping (optional, propose per file — never batch-delete): if
  an earlier whole-repo copy left framework-repo files in your
  project that were never part of the distribution (the framework's
  own `README.md`/`CONTRIBUTING.md`, a `scripts/check-docs.mjs`, a
  `.github/workflows/lint.yml`, a `package.json` named `pm-skills`,
  `self/` ignores), confirm each is unused in your project and remove
  it.

---

## 3.17.1 — 2026-07-16

ARCH-INTEG: the append-only doctrine had no integrity check — content
could vanish from the decision-log + archives while `trajectory.md`
still pointed at it, and nothing noticed (a real incident: four
2026-06-23/24 entries dropped by a revert, referenced but present in no
archive, unflagged across three prunes and a Diagnose pass). Adds a
cheap referential check to Diagnose so silent loss surfaces at the next
health pass. Patch: one new Diagnose check + a Prune note, no new files,
no migration.

### Changed

- `pm_skills/prompts/memory-maintenance.md` — Diagnose gains check 7,
  **Archive referential integrity**, inserted after archive-hygiene
  check 6 (the two content-adjacent checks): it harvests dated
  `decision-log YYYY-MM(-DD)` pointers from `trajectory.md` and its
  archive chunks, harvests coverage from the live log's `## YYYY-MM-DD`
  headings plus each archive INDEX date range, and FAILs on any
  referenced date covered by neither — with a git-recovery hint and a
  propose-restore (never auto-edit) action. The former checks 7–12
  (Version drift, ADR status, Orphan ticket files, Unreconciled lite
  closes, Doc-delta ledger health, Ageing standing items) renumber to
  8–13. Prune P5 (Verify) gains a note to re-run this check after a
  `decision-log.md` / `trajectory.md` split.

### Upgrade actions

- `memory-maintenance.md` is `framework` — overwrite wholesale with the
  new version after the Step 4 customisation check. No project-memory,
  MANIFEST, or root-template change; no migration. Diagnose check
  numbers shifted (7 is now Archive referential integrity; 8–13 are the
  former 7–12) — update any local notes that cite a check by number.
