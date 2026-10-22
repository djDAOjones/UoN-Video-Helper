# Decisions archive

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

## 2026-10-02 — V3-CONFIRM — The owner signs the ledger, confirms Network and Handoff, installs the session hooks

**Decision:** the profile, brief and rules carry the owner's reviewed signature of 2026-10-02 in place of the delegated lines; the Network line (listed hosts github.com, registry.npmjs.org) and the Handoff split (Claude Code plans and executes; Codex reviews read-only) are confirmed and lose their `[guess]`; `.claude/settings.json` and `.claude/settings.intake.json` are committed from `tools/harness.mjs`, with the two session hooks — because the owner answered the three open intake questions on 2026-10-02 ("sign both now", the recommended Network and Handoff, "install Claude Code side in both").

**Rationale:** the owner's answers, given in chat on 2026-10-02 after the merge. Two edits to the generated settings, reviewed on his behalf and recorded here: the home directory is written as `~/` rather than an absolute path, since this repository is public; and the denies on `gh`, `git fetch` and `git pull` are removed, since github.com is a listed host and the project's own deployment notes use `gh` for rollback and run checks. The Codex profile is not installed: the lab found the generated profile fails to start a session on Codex 0.155.1, so that side waits for a verified generator. The hooks run only where the client runs them; the desktop app applied no generated setting in the lab's exposed week, so the first attended session should confirm with `/hooks` that the two SessionStart and PostToolUse hooks are loaded. `[guess]` stays on "Prose: en-GB" and on the clone-outside-OneDrive line, which the owner has not addressed.

**Supersedes:** none

**Deferred:** none

## 2026-10-05 — V3-CONFIRM — Prose is en-GB, and V3-CONFIRM closes

**Decision:** the profile's Prose line is en-GB, confirmed, and loses its `[guess]`; it was the last intake guess, so V3-CONFIRM, the owner's confirmation of the intake's guesses, closes and its wish line is retired as paid — because the owner said so in chat on 2026-10-05 ("yes, en-GB — record it and close V3-CONFIRM").

**Rationale:** the 2026-10-02 entry left `[guess]` on two lines, "Prose: en-GB" and the clone-outside-OneDrive line; the two working-copy entries of 2026-10-05 settled the second. No `[guess]` now remains in the profile, rules or brief; only the profile's and the rules file's header comments still describe the mark. V3-CONFIRM's commits: 70a1796 (2026-10-02), 051fd48 (2026-10-03), dbba144 and 0f72350 (2026-10-05), and this one. Its one open follow-up, the Always section's length, stays a wish line for the owner. The profile's signature (the owner's, 2026-10-02) stands as signed; this entry is the decision the profile requires for a change above it. Session end: this session passed the profile's Session line (200k tokens) before 0f72350, whose close should have been its last and carried a Session-end line but did not; the owner then directed this close, which carries the line. Before it, the session recorded the owner's instructions the record lacked: VH-105's saved work (an item note) and the `/hooks` confirmation the 2026-10-02 entry asked for (a wish line).

**Supersedes:** none

**Deferred:** none

## 2026-10-05 — V3-CONFIRM — The OneDrive working copy, corrected after Codex's check

**Decision:** the owner's OneDrive checkout, pinned with Always Keep on This Device and with `core.fileMode` false, stays the working copy; the pin stops cloud-only files but not sync reverting a tracked file or leaving a conflict copy, so a change no session made is reported, never committed, and the checks and recovery live in DEV-INFRASTRUCTURE.md — because Codex's read-only check of dbba144 found the earlier entry's guard incomplete, and the owner chose "detect and report" on 2026-10-05.

**Rationale:** Codex (gpt-6-astra, read-only, briefed from the record per verbs/close.md step 6) checked dbba144 and returned BLOCKING: one blocking finding, four should-fix. Blocking: the earlier entry said the pin meets the canon hazard, but the canon guard (canon `AGENTS.md` line 265 at 029ae1e; census row C60) names reverted tracked files and conflict copies as well as dehydration, and the edit dropped its protection ("pause syncing during sessions or exclude `.git`"). Fixed by the guard above, the owner's choice of three offered (detect and report; pause sync in sessions; accept the risk); its mechanism is rule 3, a session stages only its own item's lines. The owner also said they will turn OneDrive syncing off for twelve hours from 2026-10-05; just before, this session's scan found no cloud-only file in the owner's three OneDrive checkouts (this one and Route Plotter's two), so git should keep working while sync is off — evidence at that moment, not a guarantee. Should-fix, each fixed or answered: (1) Supersedes — this entry supersedes the earlier one; the INTAKE entry's Environment line and the `[guess]` the 2026-10-02 entry left on it were proposals awaiting the owner, not decisions, and naming INTAKE would mark the whole migration superseded, so they are named here; (2) a V3-CONFIRM trajectory line — not added: rule 6 applies on finishing, and V3-CONFIRM stays open while the profile's "Prose: en-GB" keeps its `[guess]`, now a wish line (rule 5); (3) the Always warning — the Environment line is shorter, its detail moved to DEV-INFRASTRUCTURE.md, Always is back to its 433 words before dbba144, and the excess over the 400-word guideline is a wish line; (4) dbba144's Verify line says Codex was not installed on this Mac — wrong: codex-cli 0.155.1 was installed at `~/.local/bin` at 00:11 that day, off the shell's PATH (this session read the link's creation time and `codex --version`), and the session had checked only PATH, so no Codex check ran before that push. This commit carries the check; `~/.local/bin` is now on the owner's PATH (`~/.zshenv`). A second, confirmation round on this change accepted those fixes and answers and asked for four more, made here: the installation fact's source, the wish line for V3-CONFIRM's open `[guess]`, the cloud-only check's exit status, and this scan's attribution; its one blocking finding was the review copy's missing `Verify:` line.

**Supersedes:** 2026-10-05 — V3-CONFIRM — The OneDrive checkout is the working copy

**Deferred:** none

## 2026-10-05 — V3-CONFIRM — The OneDrive checkout is the working copy

**Decision:** the owner's OneDrive checkout, pinned with Always Keep on This Device and with `core.fileMode` false, is the working copy; the rules file's Environment line says so and loses "work in a clone outside it [guess]" and the advice to pause syncing — because the owner confirmed it in chat on 2026-10-05, as Route Plotter recorded in route-plotter#81.

**Rationale:** the owner's answer, in the first session on a new Mac, to the line the 2026-10-02 entry left as `[guess]`. Before asking, that session found the checkout sound, read-only: branch `codex/repository-review-remediation` at 051fd48, level with `origin/main`; a clean tree, with `core.fileMode` false because OneDrive restores files with changed permissions; nothing outside `node_modules` cloud-only (`find . -path ./node_modules -prune -o -flags +dataless -print` printed nothing); `samples/` holding its 33 files. Then `rm -rf node_modules && npm ci` and `npm run check` green on Node 24.21.0 from Homebrew. The pin keeps `.git` and the source hydrated, so the canon hazard — OneDrive dehydrating `.git` — is met by the pin and the dataless check rather than by a second clone; `node_modules` can still dehydrate and is rebuilt. This reverses the canon hostile-filesystem guard as the migration carried it (census row C60: cloud-synced paths unsupported). The route-plotter#81 precedent is cited on the owner's word, not fetched (rule 2).

**Supersedes:** none

**Deferred:** none

## 2026-10-05 — V3-HARNESS — Codex runs outside the sandbox, like gh

**Decision:** both `.claude` settings files list `"codex *"` in `sandbox.excludedCommands` beside `"gh *"`, so a Claude Code session can run Codex (`~/.local/bin/codex`) for the Handoff's read-only review — because the owner ruled it in chat on 2026-10-05 ("Codex runs outside the sandbox like gh").

**Rationale:** `~/.local/bin/codex` links into `~/.codex/packages/`, which the sandbox denies reading, so a sandboxed call fails before Codex starts ("operation not permitted", this session, 2026-10-05); its API host is not on the Network line's allowlist either. Excluded, Codex runs with the owner's own credentials through the normal permission flow, each call asking unless the owner pre-approves it; the allowlist, the `~/.codex` denies for every other command and the `Read(~/.codex/**)` permission deny stand. `tools/harness.mjs` does not generate `excludedCommands`: both lines are hand-kept, as `"gh *"` has been since 051fd48, and a regeneration must carry them. The exclusion takes effect in a session started after this commit. In the same session, both session hooks were confirmed on this Mac in the desktop app: the session's state file, `~/.local/state/pm-next/session/claude-1e7b4ba3f76ba3d8-d00a931f456d8601.json`, changed after each tool call (08:05:42 to 08:05:49, `seen` 82 to 94), which is PostToolUse, and carries an `epoch`, which only a SessionStart startup, clear or fork writes; the `/hooks` wish line from V3-CONFIRM is retired as paid. npm audit's dev-only findings are captured as a wish line; dependencies change only by decision.

**Supersedes:** none

**Deferred:** none

## 2026-10-18 — VH-105 — Translate the current copy now, by machine first

**Decision:** VH-105 translates the page's current English now, without waiting for VH-124's sign-off, and the first translation is automated: the agent exports every string as one sheet, the owner fills it with Google Translate and ChatGPT Astra, and the agent builds the zh-Hans and ms-MY tables from what comes back; a native-speaking reviewer from each campus checks it later — because the owner started the resuming session as their go-ahead and set the route in chat on 2026-10-18, answering the question the item's 2026-10-18 note left open.

**Rationale:** the item note of 2026-10-18 asked whether to translate the current copy now or sign off VH-124 first, and recommended that the agent draft both languages; the owner chose now, and chose to do the machine pass themselves. The sheet's keys are the English table's keys, settled before the export, so English that VH-124 later changes is re-translated row by row by key, not re-matched. Machine translation of plain language reads as machine translation (the item's Risks), so the criterion "each language is signed off by its reviewer" stands; whether the two languages go live before that review, marked as machine translation, is asked once the tables are in and recorded then. Until then `src/config/languages.ts` offers them in development only.

**Supersedes:** none

**Deferred:** none

## 2026-10-18 — VH-125 — The trim preview follows the handle

**Decision:** moving a trim handle, by pointer or key, or typing a valid time shows that point in the preview, paused, and only the latest time waits for a running seek; the two "Set … here" buttons and "Use the whole video" leave the preview where it is — because the owner asked for it in chat on 2026-10-18 ("can the trim feature show the point of the video in the preview window when changing the handle position").

**Rationale:** writing `currentTime` on every input event abandons the running seek, so on a long file with sparse keyframes a drag would show nothing until the pointer stopped; `src/ui/preview-seek.ts` holds the latest time until `seeked`, drops the ones in between, and forgets a waiting time on `emptied`, so the next file never shows the last file's time. The preview shows where the handle came to rest after the 3 s minimum keep clamps it, not where the pointer is. A playing preview pauses, because a handle being placed wants its own frame. Standards applied: Nielsen 1, visibility of system status (the frame at the cut is shown); WCAG 3.2.5, change on request (focus stays on the handle, nothing autoplays); spec §9.3's live-region rule (no announcement: a control's own result is read on demand, through the handle's `aria-valuetext`). No new words, so VH-105's tables gain nothing. The spec does not describe the behaviour; a wish line carries the §9.1 doc-delta.

**Supersedes:** none

**Deferred:** none

## 2026-10-18 — VH-105 — The language tables are data, keyed for the translator's sheet

**Decision:** every language table is data — whole messages with `{name}` placeholders, each word the English chooses inside a sentence its own key, a count a `one`/`other` or numbered group — compiled once per language by `src/i18n/compile.ts` into the `t()` API, typed from English's literals; the English table's 373 keys are settled, and `scripts/strings-sheet.mjs` writes the translator's sheet from them — because the owner's machine-translation route needs a sheet that maps back to the tables row for row, and a table of functions could neither be exported nor generated from one.

**Rationale:** the saved draft (fa98b05) held each message as a function that chose "blue"/"white", "fades"/"slides" and "start"/"end" inside an English sentence, which no other language can reuse. A shown failure is now kept as its code, the worker's reason and any dev-only detail (`showFailure`, `failureWords` in `src/main.ts`), so a language switch says it again; the worker's English stays for the logs. Durations are written by `Intl.NumberFormat` units joined by a unit `Intl.ListFormat` in each table's `meta.durationList`, not `Intl.DurationFormat`, whose long style adds commas English never had ("4 minutes 12 seconds") and which not every engine has. Separators between facts, items and sentences live in each table's `meta`, set per table and never translated. The readability gate now reads the table, the copy's home: the four "shorter than the animation" fallbacks measured grade 10.5 once their words were real rather than `${…}`, so each became two sentences — the only English changed, for VH-124's review — and the meta description, never shown, is exempt as the `<head>` already was. Tests changed where behaviour did: trim problems are structured and read through `trimProblemText`, failure reasons are names, and the page-text tests read past `data-i18n` bindings; `tables.test.ts` adds the completeness and placeholder tests, which run once a second table exists. The `.xlsx` is a stored zip written by hand, so no dependency. Standards applied: house conventions (no library; named test categories — happy path, boundary counts, a CSV round trip), Nielsen 4 (one whole message per meaning), spec 9.2's reading level, kept by the gate.

**Supersedes:** none

**Deferred:** none

## 2026-10-18 — VH-105 — The language switcher repaints in place, and a translated page says so

**Decision:** the page's language is chosen in segmented native radios at the top of `main`, each option in its own language with its own `lang`, read from this browser's preference before the first paint and repainted in place by one listener, so nothing on the page is lost; Chinese and Malay carry a "Machine translation" note with an email link to `TRANSLATION_FEEDBACK_ADDRESS` whose subject names only the product and the language — because the owner's go-live decision of 2026-10-18 needs the switch built and the machine translation marked.

**Rationale:** built to the item's 2026-10-18 plan, with four changes: the switcher is built in `src/ui/language-switcher.ts` and inserted before the heading, because `test/screen-text.test.ts` holds `<main>`'s first child to be the `h1` in the static markup; the `<title>` is set at boot rather than bound; `MACHINE_TRANSLATED` in `src/config/languages.ts` lists the languages that show the note, so a language comes off it once its colleague has checked it; spoken stage announcements are composed again from the same report, so they too follow the language. Every other live region is set to `aria-live="off"` for two animation frames while `language.switched` is said, and focus stays on the radio. `--font-cjk` names the system's Chinese faces and `--measure-cjk` stops Chinese at 40 glyphs. The note's link lifts the leave warning as the feedback email does. The three new keys' Chinese and Malay are drafted by the agent in the filled sheet. Checked in Chrome at 1280 px and 375 px with a sample loaded: the trim and a typed-invalid time with its error, the closing choices, a running job, an unsaved result and its discard question, a feedback draft and a drop refusal all survived each switch; `html[lang]`, the title and `aria-valuetext` followed; a remembered language painted first on reload. Standards applied: Carbon (component first: the content switcher as the page's segmented radios, as the closing colour), WCAG 2.2 (3.1.2 language of parts, 1.4.8's 40-glyph CJK measure, 2.5.5 targets, 4.1.3 status messages), Nielsen 1 and 4, house conventions (the address in `src/config/`; named test categories — happy path, junk, a throwing store, a round trip, no table, one language offered).

**Supersedes:** none

**Deferred:** none

## 2026-10-18 — VH-105 — Chinese and Malay go live as machine translation, checked on the live page

**Decision:** zh-Hans and ms-MY are offered in production as soon as the switcher is built, each marked on the page as machine translation with an email link for better wording, and a native-speaking colleague at each campus checks the live page instead of signing off the sheet first; the item's criterion "each language is signed off by its reviewer" becomes "each language is marked as machine translation and open to its campus colleague's check on the live page" — because the owner chose it in chat on 2026-10-18 ("go live, colleague check live app").

**Rationale:** the earlier route held both languages in development until a reviewer signed off `VH-105-strings-filled.csv`, because every push to `main` publishes the pilot. The owner weighed a page in machine Chinese and Malay against no page at all for those colleagues and chose to publish, with the mark saying so, so the check happens where the words are read. `LANGUAGES_OFFERED` in `src/config/languages.ts` lists all three languages in development and production alike. Corrections still come back by key through the filled sheet and `scripts/strings-table.mjs`; the repairing agent's doubts stay in the item file for the colleagues. The translation feedback goes to the owner's own address, kept in `src/config/`. Only the superseded entry's clause "both languages stay development-only" is replaced; its sheet-and-generator route stands.

**Supersedes:** 2026-10-18 — VH-105 — The translated tables are generated from the filled sheet

**Deferred:** none

## 2026-10-18 — VH-105 — The translated tables are generated from the filled sheet

**Decision:** the zh-Hans and ms-MY tables are written from one filled sheet by `scripts/strings-table.mjs`, never by hand, and a test holds each table to that sheet; the owner's Google Translate pass is kept verbatim as `reviews/2026-10-18/VH-105-strings-returned.csv`, and the agent's 224 repairs are applied in `VH-105-strings-filled.csv`, each with what it was, in a "changed by the agent" column; both languages stay development-only — because a reviewer's corrections come back the same way, by key, and a hand-edited table would drift from the sheet the reviewers see.

**Rationale:** the returned workbook (`UoN Video Helper Translate v01.xlsx`, read with Python's `zipfile`) held 746 `GOOGLETRANSLATE` formulas with their values cached: every cell filled, keys and English unchanged. 55 cells broke a placeholder — the name translated (`{事实}`, `{tambah}`) or the placeholder dropped (`{count} problems` → 问题数量). A review agent read every row and repaired, besides those, 120 wrong senses that would mislead (the Chinese said the tool uploads the video, "no closing" read "the University will not close", a processing stage was a theatre stage, the Malay said an unsaved video was already saved), 23 rows that quote another row's label, 12 count forms, 12 punctuation faults and 2 cells left in English; style was not polished, and its doubts are in the item. Each table's `meta` is set in `SHEET_LANGUAGES`: Chinese joins facts with ，, items with ； and sentences with no gap; Malay as English. Standards applied: house conventions (no new dependency — Prettier, already a dev dependency, formats the output; named test categories — a round trip, a blank row refused, a missing column, the committed tables against the committed sheet).

**Supersedes:** none

**Deferred:** none

## 2026-10-18 — VH-130 — An accessibility statement on the page, translated, and two team contacts in the footer

**Decision:** a self-certified accessibility statement, in the GOV.UK model's structure and the page's plain words, translated in full into Chinese and Malay, sits in the footer as a disclosure that `#accessibility-statement` opens, and says the tool is partially compliant with WCAG 2.2 AA because only automated checks are done; the footer's "Email the creators team" and "Email the learning content team" both go to the owner's address until the teams' own are given — because the owner asked for both on 2026-10-18 and said to go on the information the record has.

**Rationale:** the owner's answers on 2026-10-18: self-certified, no University template; the contact and reviewer is the owner's address; review in one month; "all on one page is ok"; the whole statement translated; the WAVE check (10/10) run that day; "Joe Bell runs it at the University of Nottingham" is right; the teams' addresses were not given. Numbered VH-130 because the pushed Band 8 plan (PLAN-1) holds VH-126 to VH-129. The statement sits after the System check, so the two disclosures read as one group, with Send feedback beside the version line; its dates live in `src/config/accessibility.ts`, formatted per language by `Intl` in UTC, and its address re-uses `FEEDBACK_ADDRESS`, as do both team addresses in `src/config/feedback.ts`; every link's click goes through `openMailto`. The limitations it names are the record's: Chrome only, the machine translations, the computer's own Chinese font, and spec §9.3's two recorded exceptions (the preview's content, and short forms left unexpanded) — `UI-STANDARDS.md` records none to the AAA target, only status colour taken off the brand palette to keep 7:1. Forty new keys are drafted by the agent in the filled sheet; one English sentence was reworded for the readability gate, which gained meanings for WCAG, AA, AAA, NVDA and WAVE, its designed route for a new short form. Checked in Chrome at 1280 px and 375 px in the three languages; forced colours, the light theme and a screen reader were not. Standards applied: Carbon (the disclosure as the System check's panel), WCAG 2.2 (2.4.9 link purpose, 2.4.10 headings, 2.5.5 targets, 1.4.8 the measure), Nielsen 10 (help findable, short), house conventions (addresses and dates in `src/config/`; named test categories).

**Supersedes:** none

**Deferred:** none

## 2026-10-18 — PLAN-1 — Band 8: a title card and an Internal only closing, in one app for staff and students

**Decision:** Band 8 adds an optional title card before the video, General or Submission, and an "Internal only" closing, a plain card with no logo, beside the official closings and none; both go in the one app, which staff and students now share, and the brief's Direction says so — because the owner asked for it in chat on 2026-10-14 and settled its open questions on 2026-10-18.

**Items:** VH-126, VH-127, VH-128

**Rationale:** The owner's answers on 2026-10-18: the label reads "Internal only", on the closing card only; cards only, no mark on every frame; students may choose no branding; the Submission fields are module title and code, assignment title or number, module convenor or tutor, student ID numbers (added for anonymous marking: no names), the running time ("not including anything added by the app, but discounting trimmed material") and the date of the card ("clarify: not submission date"); on hosting, "just one instance for now. we might separate later", which the owner, offered two readings, confirmed as one app for everyone now. Accepted consequences: a card is removed by trimming in any editor, so the Internal only card is designed to resist reuse rather than removal (opaque, logo-free, carrying that video's date, so it cannot be lifted as a generic stamp); and the official closings stay in the public repository and on the GitHub Pages pilot, so nothing yet stops a student using them; the student edition, VH-129 in the Icebox, is where that is answered, together with hosting (VH-14). The Internal only card carries no University branding, so it is not the per-department variant D12 asks governance for, and D12 stays open. The title card is generated text, not an opening graphic: VH-23 stays iceboxed, but the timeline's dormant opening slot is where the card joins. Review findings the band answers: the spec's §2 (staff only), §4.1 (closing only) and §12 (no branding variants) no longer describe the product; a wish line carries that sign-off debt, and each item drafts its sections for the owner's approval. Order: the Internal only closing first, because it proves the card renderer in the closing slot the pipeline already has; the General card second, which opens the opening slot; the Submission card last, on both. Open points for the owner sit in each item's notes, asked when that item starts.

**Supersedes:** none

**Deferred:** VH-129

## 2026-10-18 — PLAN-1 — Internal use only is the official closing with words added; no card text under 28 pt

**Decision:** the Internal use only closing is the official closing, Nottingham Blue and branded, with "Internal use only" added, pre-built as new source media from the masters rather than drawn at run time; the title cards' labels follow the page's language, a Submission card takes up to eight student ID numbers, and no card text is under 28 pt at PowerPoint sizes, in a layout the agent sets for plenty of room — because the owner said so in chat on 2026-10-18.

**Items:** VH-126, VH-127, VH-128

**Rationale:** The owner's words, 2026-10-18: "internal card still the blue. it can be branded, just clearly with 'Internal use only'"; "it can be the same, just with extra text - perhaps make a new precreated source media"; "you should figure out font sizes and layout that allow a lot of runway but is highly readable from an accessibility perspective - not less than 28pt at powerpoint sizes"; "labels should follow page language. up to 8 student ID numbers." This replaces the first PLAN-1 entry's plain, logo-free "Internal only" card, and its D12 reasoning with it: this variant is the owner's own call, and D12 stays open for per-department variants. The phase and its items stand. The card renderer moves from VH-126 to VH-127, the first item that still draws a card; the type scale and layouts for all three cards are VH-126's first criterion, because its words are the first text to set. The floor in pixels: a 16:9 PowerPoint slide is 540 pt tall, so 28 pt is 28/540 of the frame, 56 px at 1080 lines and 112 px at 2160, taken on the frame's shorter side so a portrait video keeps it. `scripts/build-branding.mjs` builds the masters and needs ffmpeg, which is not on this Mac's PATH (2026-10-18). Standards: WCAG 2.2 1.4.6, contrast (enhanced): white on Nottingham Blue (#10263B) is about 15.4:1 by calculation, not yet measured; 1.4.8's line spacing and length are the layout work's to apply. Session end: this session passed the profile's Session line (200k) before this close, so the typography the owner asked for is the next session's, from VH-126's notes.

**Supersedes:** 2026-10-18 — PLAN-1 — Band 8: a title card and an Internal only closing, in one app for staff and students

**Deferred:** none

## 2026-10-19 — VH-126 — Internal use only: an option in blue or white, its words building in with the logo

**Decision:** Internal use only is offered in blue and white, its words building in with the logo inside the opaque 4 s card, so only the four card files change — because the owner answered on 2026-10-19, and the masters build the logo in the card, not the onset.

**Rationale:** The owner's words, 2026-10-19: asked how it is chosen, "it's options, blue or white"; asked when the words appear, "With the logo build". The question described the words arriving with the 1 s onset, at the cost of eight more transparent files; measuring the masters afterwards showed that description wrong. The onsets carry only the colour field (Fade a uniform alpha ramp, Slide the field moving in); the logo builds in the tail, the crest from 0.25 to 0.75 s and the wordmark wiping in from 1.5 to 3.0 s, settled for the last second, in a box at x 528 to 1404, y 358 to 686 at 1080. The owner's answer is kept, at lower cost: no new alpha decode, and VH-44's premultiplication finding is not engaged. Whether the option is a switch beside Cut, Fade and Slide or a type of its own changes the controls and not the assets, and is asked with the type scale.

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — VH-126 — The cards' type scale, measured: list-style fields, a shared last line, limits in columns

**Decision:** the cards' type scale is `src/config/cards.ts`, measured in Chrome by `spike-cards.html`: a floor of 56 px per 1080 lines of the shorter side, Submission's fields run in as list items at 1.25, its running time and card date sharing a line, and typed fields capped in columns — because then every card fits 16:9, 16:10, 4:3 and 9:16 in all three languages at every limit.

**Rationale:** Measured in Chrome on 2026-10-19. Sizes: General's heading Lora Bold 104 to 56 in three lines (five in portrait), its subhead Arial 64 to 56 at 1.5; Submission's heading Lora Bold 80 to 56 in two (four), its fields a run-in label and value at 56, 0.375 em apart; a wide character counts two columns; the closing's words Arial Bold at 100 per 1080 of the asset, which a letterboxed portrait output shows at 56. The first run, fields at WCAG 1.4.8's 1.5 with 0.75 em between them, overflowed 16:9 in Malay and refused every 4:3 case. 1.4.8 binds blocks of text, more than one sentence; a field is not one, so it sets at 1.25 and the gap groups it, while General's subhead, which can be a sentence, keeps 1.5. Sharing the last field saved the row that 16:10 (10 px over) and 4:3 (80 px over) needed. Limits in columns: General 100 and 120, assignment 80, module 60, convenor 40, proposed for VH-127 and VH-128 to adopt; the renderer still refuses at its field what measures too long. Tightest fit: 4:3 Chinese, 1 px to spare with the heading at 60; the most room, 16:9 Chinese, 163. A 4K frame breaks exactly as 1080 does. The closing's words measure 795 px (English), 600 (Chinese) and 1,256 (Malay) of a 1,680 px safe width, their foot at 854 above the 961 line, centred under the settled logo; white and Nottingham Blue 15.41:1 by calculation. The labels are provisional until VH-128 settles their English; Chinese line breaking that keeps punctuation off a line's start is VH-127's renderer's.

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — PLAN-1 — Staff video or Student submission, and the video's text in any of the three languages

**Decision:** a switch at the top chooses Staff video or Student submission: a submission always has the Submission card and the Internal use only closing; a staff video has an optional basic card and Internal use only as a toggle; the video's text follows the page's language unless a selector picks another — because the owner said so on 2026-10-19.

**Items:** VH-126, VH-127, VH-128, VH-131, VH-132

**Rationale:** The owner's words, 2026-10-19, answering VH-126's notes: the type scale "looks great"; "maybe a switch at the top between 'Student submission' and 'Staff video' where student submission has the card + details and the all the logo animation options but always with Internal Only; the staff options have a basic card with title, department, author(s), and date (all optional), and the internal use text is a toggle along with other graphic options"; on the closing's language, "follow language is great as default, but offer a selector on all language versions to change the video text to any of the three"; and that ffmpeg is installed, though at this close Homebrew's install still waited at its confirmation prompt, so the next session checks. Consequences: General becomes the staff card, its heading and subhead replaced by four optional fields (VH-127, re-scoped by the owner); the Submission card is always on for a submission (VH-128); the closing gains an internal tail per language and colour at both heights, twelve, the onsets untouched (VH-126); the switch is new, VH-131; the selector is new, VH-132, and sets the cards' labels and the closing's words, never what is typed. This also replaces the first PLAN-1 entry's General-or-Submission toggle. Order: VH-126, whose assets need only ffmpeg and the two translations; VH-131, which it is chosen under; VH-132; VH-127; VH-128. Open, for the owner when each item starts: in each item's notes. The brief's Direction says so.

**Supersedes:** 2026-10-19 — VH-126 — Internal use only: an option in blue or white, its words building in with the logo

**Deferred:** none

## 2026-10-19 — VH-126 — Internal use only: twelve tails drawn by the Mac, its words from the tables, and a checkbox

**Decision:** Internal use only is twelve pre-built tails and a checkbox: `scripts/build-branding.mjs --only internal` draws each table's `closing.internalWords` with macOS's own text system and wipes it in under the logo at the wordmark's measured pace, and the checkbox, off by default and locked under None, swaps the tail and nothing else — because Homebrew's ffmpeg has no `drawtext`, and a translation corrected through the sheet must reach the pixels.

**Rationale:** ffmpeg 9.0.2 from Homebrew has no `drawtext`. Headless Chrome could not bind its singleton socket in the agent's sandbox, and Swift's compiler did not match its SDK, so AppKit draws the words through JavaScript for Automation (`osascript`), present on every Mac, no dependency: Arial Bold with PingFang SC Semibold behind it (the weight Chrome picks for bold), 200 px on the 2160-line master, the cap top at 1522; at 1080 the widths are 795, 600 and 1,551 px of 1,680, the first two the spike's to the pixel. The wipe follows the wordmark's right edge, measured per frame from each master (1.72 to 2.96 s of the tail) and counted from the middle of the gap after the crest, because the crest overshoots its edge by two pixels while it builds; its edge is soft over 0.5 em (`CLOSING_WORDS_WIPE_FEATHER_EM`). Above the words each tail matches the official one to 59 dB PSNR. The owner chose 仅供内部使用 and Untuk kegunaan dalaman sahaja on 2026-10-19 ("Standard stamp"); the other three new keys' Chinese and Malay are the agent's drafts in the filled sheet. `closing-internal-words.json` records the words drawn, `test/closing-assets.test.ts` holds it to the tables, and Vite leaves it out of the build. A job reads the page's language once, at its start, as the words' language until VH-132; an internal tail that fails to load is reported as no closing, never replaced by the unmarked one. The script's ffprobe reads JSON now: ffprobe 9 lists a stream again under its stream group, which ran the CSV together. Standards applied: Carbon (the page's native checkbox, its reason in visible text as the colour's), WCAG 2.2 (1.4.6, white and Nottingham Blue 15.4:1 by calculation; 2.5.5, the target floor; 3.3.2, a label that says what it does), Nielsen 1 (the result line and the summary say the card is marked), house conventions (the feather in `src/config/`, the words in the tables; named test categories — the mapping, the names, the shipped files against the tables, junk read as off).

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — VH-131 — The switch opens on Staff video and is remembered; a submission may have no closing

**Decision:** the switch at the top opens on Staff video and is remembered in this browser, as the page's language is; a student submission may choose None, and whenever it has a closing, that closing is Internal use only; a staff video's graphic options are the basic card (VH-127), the closing's controls and the Internal use only toggle, and nothing more — because the owner answered VH-131's open questions in chat on 2026-10-19.

**Rationale:** The owner's answers, 2026-10-19, to four questions asked as VH-131 started: which side is chosen before anyone touches it, "Staff video"; whether None is offered on a submission, "Yes, None is allowed"; whether a staff video holds other graphic options, "No, just those"; whether the choice is remembered between visits, "Yes, remembered". The second changes PLAN-1's "a submission always has … the Internal use only closing" to "a submission's closing, when it has one, is Internal use only"; the item's criterion naming Cut, Fade, Slide, the onset and the colour stands, with None offered beside them. Spec §4.1's "A student submission always has it." no longer says exactly this; VH-131's spec draft corrects it, for the owner's approval. The fourth follows VH-105's guarded read and write: this browser only, and a store that refuses leaves the default.

**Supersedes:** 2026-10-19 — PLAN-1 — Staff video or Student submission, and the video's text in any of the three languages

**Deferred:** none

## 2026-10-19 — VH-132 — Video language sits under Video type, follows the page until chosen, and is remembered

**Decision:** the video's text language is chosen in "Video language", native radios in the segmented skin directly under the Video type switch, each option its language's own name with its own `lang`; it shows the page's language until someone picks one, then keeps that pick when the page's language changes and remembers it in this browser, as the page's language and the switch are; it is never locked, and a job reads it once, at its start — because the owner answered VH-132's open questions in chat on 2026-10-19.

**Rationale:** The owner's answers, 2026-10-19, to three questions asked as VH-132 started: where it sits, "Under Video type"; what it is called, "Video language"; whether a pick is remembered, "Yes, remembered". Under Video type because both say what the video is, and the selector serves the title card before the video and the closing after it, so no one step owns it. A pick of the page's own language is still a pick, kept when the page changes. Remembered with VH-105's guarded read and write; a store that refuses, or a remembered language no longer offered, leaves it following the page.

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — VH-127 — The staff card: its own step, a checkbox, five seconds, text only, no labels, today's date

**Decision:** the staff title card is Step 3, "Title card", between Trim and Closing branding; an "Add a title card" checkbox, off at first, shows its four fields and keeps what was typed when turned off; turned on, the date fills with today's date in the video's language and can be changed or cleared; the card holds 5 s, white text on Nottingham Blue with no logo and no labels, the title large and the other three as plain lines; on with every field empty is refused at Create — because the owner answered VH-127's open questions in chat on 2026-10-19.

**Rationale:** The owner's answers, 2026-10-19, to six questions asked as VH-127 started, each the recommended option: how long, "5 seconds"; the logo, "No logo", text only, white on Nottingham Blue like the closing, so the measured layout keeps all its room; where, "Own step after Trim", so the steps follow the video's own order and the later steps renumber; on or off, "A checkbox, off at first", refused at Create when on and empty; the date, "Today, editable", filled only when the card is turned on; labels, "No labels", so the card has no words of its own to translate. A date still as filled follows a change of video language; one edited is kept as typed (VH-132).

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — VH-127 — Under Student submission, the staff card's box is locked off and its fields kept

**Decision:** under Student submission, Step 3's "Add a title card" box is unticked and locked, with its reason in visible text, and no card is sent; the staff card's tick and typed fields are kept and come back when the switch returns to Staff video, until VH-128 builds the submission card — because the owner chose the recommended option in chat on 2026-10-19.

**Rationale:** Asked as slice (c) started, "what Step 3 shows under Student submission before VH-128 builds its card", the owner chose "Locked off, kept" over hiding the step or offering the staff card to students. A locked control says why in visible text (VH-90's rule), and the fields are kept as `staffInternal` keeps the closing's Internal use only box, so a switch to and fro loses nothing typed.

**Supersedes:** none

**Deferred:** VH-128

## 2026-10-19 — VH-127 — The result's one-line record says when a title card opens the video

**Decision:** with the card on, the result's record reads "Made from NAME: a 5-second title card, then PART, OUTPUT, CLOSING.", never quoting the card's words; the discard question's own sentences are unchanged, and the record it repeats gains the card as the result's does — because the owner chose the recommended option in chat on 2026-10-19.

**Rationale:** Asked in slice (d) whether the result summary and the discard question should mention the card, the owner chose "the summary only" over neither or both. The discard question says no choice in its own words; it repeats the result's record (VH-107, A-05), so the card reaches it through that one line. `JobRecord.titleCard` is a boolean fixed when the job starts; `result.summaryWithCard` went through VH-105's sheet route.

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — VH-127 — A card field wraps into its lines first, then shrinks to the floor

**Decision:** each card field takes the largest size at which it wraps into its role's lines, shrinks only when it would need more lines than its role allows, and the largest field shrinks first until the card fits, never under the 56 px floor; the acceptance's "shrinks to the floor, then wraps" is read so — because the owner chose the fit as built in chat on 2026-10-19.

**Rationale:** Slice (a) built VH-126's measured fit (`fit` in `src/media/title-card.ts`) and left the order open. Read literally, the criterion would hold a long title on one small line; the fit keeps a 50-character title large on two. The owner chose "keep it large, wrap first" over a change to `fit` and a re-run of `spike-cards.html`. A field still too many lines at its floor is refused at that field; every field at its floor and the card still too tall is refused at the field with the most lines (`at: 'card'`).

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — VH-127 — The staff card's Chinese and Malay stand as the agent drafted them

**Decision:** the agent's Chinese and Malay for `steps.titleCard`, the `titleCard` group, `failure.titleCardRefused`, `videoLanguage.helper`'s second sentence and `result.summaryWithCard` stand as drafted, machine translation like the rest of the translated pages — because the owner approved them in chat on 2026-10-19.

**Rationale:** Slice (c) drafted eighteen rows and slice (d) one more, each marked "drafted by the agent" in `reviews/2026-10-18/VH-105-strings-filled.csv`. The owner was shown every row beside its English and approved the eighteen as drafted, then the record line's. The marks stay in the sheet, so a translator's review can still find them; a correction goes through the sheet and `scripts/strings-table.mjs`.

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — VH-128 — Submission: one box of 8-digit ID numbers, one module field, the measured labels, five seconds

**Decision:** student ID numbers are typed in one box, separated by spaces, commas or new lines, each exactly 8 digits, one to eight of them; the module's code and title are one field; the card's English is VH-126's measured wording, the assignment as the unlabelled heading, then "Module", "Convenor or tutor", "Student ID numbers", and "Running time" with a clock time beside "Card made" with the date and "— not the submission date"; the card holds 5 s, as the staff card does — because the owner chose the recommended options in chat on 2026-10-19.

**Rationale:** The University's student numbers are 8 digits; one box takes a pasted list and names a wrong number by itself. One module field is the layout `spike-cards.html` measured at 60 columns, so nothing is re-measured. The labels are the ones the measured fit used, so the worst case is already proved to fit 16:9, 16:10, 4:3 and 9:16 in all three languages. Five seconds keeps the pre-flight allowance and the pipeline's one card span; a marker pauses the card to read it, which is why the safe area's foot is deep.

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — VH-128 — Under Student submission, Step 3's box is ticked and locked, and Submission's fields show

**Decision:** under Student submission, Step 3's "Add a title card" box is ticked and locked, with its reason in visible text, and Submission's four typed fields show in place of the staff card's; each side keeps its own fields for the way back, and neither is remembered beyond the page — because the acceptance makes the card always on under a submission, and VH-131 locks the closing's box ticked with its reason the same way.

**Rationale:** VH-127 locked the box off under a submission only until this item built its card. Ticked and locked says the card is coming and why, as the closing's Internal use only box does; a separate control for an always-on card would be a control with nothing to choose. The staff card's tick and fields are kept, as before.

**Supersedes:** 2026-10-19 — VH-127 — Under Student submission, the staff card's box is locked off and its fields kept

**Deferred:** none

## 2026-10-19 — VH-128 — Submission's Chinese and Malay stand as the agent drafted them; VH-122 follows Band 8

**Decision:** the agent's Chinese and Malay for `titleCard.forSubmission`, `titleCard.submission` and `titleCard.card` stand as drafted, machine translation like the rest of the translated pages; when Band 8 closes, VH-122 opens the next work — because the owner approved both in chat on 2026-10-19.

**Rationale:** Slice (a) drafted twenty rows, each marked "drafted by the agent" in `reviews/2026-10-18/VH-105-strings-filled.csv`; the owner was shown every row beside its English and approved them as drafted. The marks stay in the sheet for a translator's review; a correction goes through the sheet and `scripts/strings-table.mjs`. VH-122 is the first open, unblocked line in Current, Band 6 waiting on the owner. In the same round the owner approved the spec text for §4.1 and §9.1, kept word for word in VH-128's notes until the close applies it.

**Supersedes:** none

**Deferred:** none

## 2026-10-19 — PLAN-1 — Band 8 closes with VH-128; VH-122 opens the next work

**Decision:** Band 8 closed on 2026-10-19 with every PLAN-1 item shipped, its backlog heading now "Phase 1 — Band 8, … — CLOSED 2026-10-19" so the checker holds it to PLAN-1's Items; the next item is VH-122 in Band 7 — because it is the first open, unblocked line in Current while Band 6 waits on the owner, as the owner chose on 2026-10-19.

**Rationale:** Reconciled against PLAN-1's Items (VH-126, VH-127, VH-128, VH-131, VH-132): each has its line under Band 8 in project/trajectory.md, and none is open in project/backlog.md; PLAN-1's own deferral, VH-129, waits in the backlog's Icebox. The heading takes "Phase 1" because the closed-phase grammar ties a phase to its PLAN by number, and keeps "Band 8" so the band's name still reads. The owner chose VH-122 in chat on 2026-10-19, recorded in "2026-10-19 — VH-128 — Submission's Chinese and Malay stand as the agent drafted them; VH-122 follows Band 8". Recall, local (this session, from the record alone, not a fresh session): 1, project/trajectory.md under Band 8, newest first: VH-128, VH-127, VH-132, VH-131 — 2; 2, "2026-10-19 — PLAN-1 — Staff video or Student submission, and the video's text in any of the three languages", because the owner said so on 2026-10-19 — 2; 3, deferred: VH-129 in project/backlog.md's Icebox (from PLAN-1, 2026-10-18), and project/wish-list.md's open lines, among them Band 8's from PLAN-1, VH-126, VH-131, VH-127 and VH-128 — 2; 4, VH-122, Band 7 — measured, not yet fixed, in project/backlog.md, named by this entry — 2.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — VH-122 — Decode damage: a block beyond +6 dBFS is silenced with one either side, and said first with its times

**Decision:** a decoded block holding a sample beyond +6 dBFS (`DECODE_DAMAGE.aboveDbfs`), or one not a number, is silenced with one block either side, in every pass over the source and in the encode, but never in the finished file's check; the decode-damage warning comes first in pre-flight and lists each stretch's time — because the corpus's real decodes peak at +0.96 dBFS while CULT2011's damage reaches +36 and +57, and one corrupt frame spoils two blocks, the earlier far weaker.

**Rationale:** Measured on 2026-10-20 with ffmpeg's AAC decoder, every corpus file decoded unclipped: no real recording passes +3 dBFS, LIBA2002 peaks at +0.96 (830 samples over full scale, a hot master's encode); CULT2011's first stretch rises from −24 to +13 dBFS across one 1,024-frame block, then reaches +57 across the next, its second +36. A transform codec overlap-adds a frame into two output blocks, so the gate holds one block back and silences the neighbours too: about 23 ms of good sound either side at 44.1 kHz, against leaving a weak edge audible. The gate runs before the trim in source time, so the planning passes and pass C silence the same blocks, and the gain is solved over what is encoded. The finished file is measured ungated (`analyseOutputAudio`): a sample beyond full scale there is a broken output the check must refuse. Times are floored for the words, so seeking to one lands before the damage; at most five are listed, then counted. Chrome's own decode is VH-122 slice (b)'s check.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — VH-122 — The decode-damage words stand, the Chinese without a space after 在, and §5.4 gains its row first

**Decision:** the warning's English stands as built; the agent's Chinese and Malay stand as drafted, machine translation like the rest, except that the Chinese detail's "在 {times}" is now "在{times}"; spec §5.4's table gains the decode-damage row word for word as drafted, as its first row — because the owner chose the recommended options in chat on 2026-10-20, after CULT2011 passed in Chrome.

**Rationale:** Asked in slice (b)'s one round, after the Chrome check in VH-122's notes: for the English, "Keep as built" over a shorter detail without the levelling clause; for the translations, "Stand, Chinese space fixed" over standing exactly as drafted; for the row, "As drafted, first row" over last, since the warning comes first in pre-flight and the row says it is the one that reports what was done. The fix went through the sheet: both detail rows keep "drafted by the agent" and add the repair, and `scripts/strings-table.mjs` regenerated `src/i18n/zh-Hans.ts`. The reason put to the owner, that the Chinese page sets no space before a number, holds for the Step 6 lines beside the warning (需要1分钟, 可达189 MB) but not for every placeholder (另外 {count} 条音轨), so `warnings.decodeDamage.more` keeps its spaces, as its sibling rows do. Chrome's decode put the damage in the blocks ffmpeg's did, so the +6 dBFS threshold and the one-block neighbours stand as decided.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — VH-116 — Slice (a) counts the 10 runs with the pane shown; Philosophy on Smaller is unmeasured

**Decision:** slice (a)'s record is the 10 of 18 runs made while the in-app browser's pane was shown. The 8 that overlapped a hidden stretch are left out, so Philosophy on Smaller has no measured run — because a hidden pane runs as a background page and those runs were up to 15% slower, and the owner chose on 2026-10-20 to record the 10 rather than re-run while other sessions held the load near 30.

**Rationale:** The page's `visibility-state` timeline put the hidden stretches at 177–204, 414–570 and 607–684 s, and summing each run's own times put runs 6 and 12–18 in them. Over the 10, the probe reads 0.51–0.70 real over predicted, the warm-ups 0.64–0.86, and the job's own rate after 10 s 0.96–1.00; VH-116's notes hold the table. Slice (b) chooses from these. The page now flags a hidden run itself, so a later run needs no reconstruction.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — VH-116 — The probe's clock starts after a sixth of its frames; a time left during the job is wished, not built

**Decision:** the calibration probe still encodes its 3 s window, but times only the frames after its first sixth (`CALIBRATION_PROBE_WARM_UP_FRACTION`), so pre-flight takes no longer; the job's own rate, the closer remedy, is not built, because the page shows no time during a job, and a time-left display is a wish line — because the owner chose the recommended option in chat on 2026-10-20.

**Rationale:** Over slice (a)'s 10 runs, real time over predicted was 0.51–0.70 for the probe as shipped (high/low 1.37) and 0.69–0.86 skipping a sixth (1.25), 0.67–0.82 a third (1.22), 0.64–0.77 half (1.20): a sixth has the median nearest 1 (0.82) and the smallest worst case (an estimate 1.45× the real time, against 1.49× and 1.56×), and it clears the smoke run's stall at frame 5. The job's own rate after 10 s was 0.96–1.00. The estimate still runs long by about a fifth, so §7.3's bands now warn later than before but still early. `warmedUpTiming` is pure and tested by category in `probe.test.ts`; the spike page's "probe" row stays the probe before this change. The §7.1 sentence is a doc-delta for the owner.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — VH-116 — Band 7 closes with VH-116; no unblocked item follows, so the next work is the owner's

**Decision:** Band 7 closed on 2026-10-20 with both its items shipped, its backlog heading now "Band 7 — measured, not yet fixed — CLOSED 2026-10-20"; no open, unblocked line remains in Current or Next, so the next item is the owner's to name — because Band 3's VH-17, Band 6's VH-124 and VH-113 and every Standing line wait on the owner, and Next's VH-13 waits on VH-M2.

**Rationale:** Reconciled against the canon Band 7 list (pm_skills/project/backlog.md: VH-122, VH-116): each has its line under Band 7 in project/trajectory.md, and neither is open in project/backlog.md. The heading keeps the band's name without "Phase N", since no PLAN lists Band 7's items. Recall, local (this session, from the record alone, not a fresh session): 1, project/trajectory.md, newest first: VH-116 and VH-122 under Band 7, then VH-128 and VH-127 under Band 8 — 2; 2, "2026-10-20 — VH-122 — Decode damage: a block beyond +6 dBFS is silenced…", because real decodes peak at +0.96 dBFS while CULT2011's damage reaches +36 and +57 — 2; 3, deferred: project/wish-list.md's lines from VH-116 (the §7.1 doc-delta, a time left during the job, the stale structure.md) and from VH-122 (the screen-reader and listening check), and the backlog's Icebox — 2; 4, no next open item: Current and Next hold only lines blocked on the owner, as this entry records — 2.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — VH-116 — The §7.1 sentence stands as worded; the wishes stay wishes, and the next item waits on the owner

**Decision:** spec §7.1's sentence on the probe's warm-up stands as worded and is applied; every wish stays on the wish list, none promoted; nothing new is added unless it is really needed, so the next item stays "none" until the owner names one — because the owner said so in chat on 2026-10-20.

**Rationale:** The owner approved "measures throughput — timed from after the first sixth of those frames, so the encoder's start-up, which a job pays once, is not extrapolated (VH-116) — and extrapolates" in chat on 2026-10-20; its wish line is retired, and the spec's routed-budget wish line now quotes 7,386 words. Asked what comes next, the owner chose to keep the wishes on the wish list for now and is inclined to add nothing new unless it is really needed. The agent advised watching three to five staff use the pilot first (VH-M4), and testing one Smaller output on SharePoint (VH-17); both are the owner's own work and already open in the backlog.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — PLAN-2 — The spec's budget rises to 7,800; the Always section drops two lines the profile holds; the Xerte link opens a new tab

**Decision:** rules.md's routed budget for the spec rises from 6,400 to 7,800 words; the Always section drops its standards line and its push line, both already in the profile, to come under its 400-word guideline; the statement's Equality Advisory link opens in a new tab and says so in its words (VH-135) — because the owner applied the agent's recommendations in chat on 2026-10-20.

**Rationale:** The spec is 7,386 words, grown by approved edits for features the owner asked for (Band 8, VH-122, VH-116); 7,800 leaves room for VH-134's six edits and VH-136's, where a trim would cost the owner a review of cuts to the authoritative document. The Always section was 433 words and is now 398. "No control for power users; Carbon productive in our own code; WCAG 2.2 AAA, exceptions recorded." is the profile's Standards adopted: Carbon in our own code, never the packages; AAA, every exception recorded; Nielsen, no control for power users. "Push and network follow the profile's Push and Network lines; a blocked push is reported as pending." is the profile's Push and Network lines and the close verb's step 7. No obligation is lost, and the census rows that named the cut line, C53, C54, C163 and C181, now name the profile as the destination; their first three cells are unchanged. The Equality Advisory and Support Service's site may refuse to load inside a Xerte frame, so the same-frame link can fail outright; a new tab, said in the link's text, is WCAG technique G201 and keeps the reader's place in the tool.

**Supersedes:** none

**Deferred:** VH-135

## 2026-10-20 — PLAN-2 — Phase 2: the owner's corrections, the spec caught up, three page defects, a time left

**Decision:** the wish list is triaged: Phase 2 is VH-133 (the owner's translation corrections), VH-134 (six spec edits drafted for approval), VH-135 (three page defects and the Xerte link) and VH-136 (a time left during the job), in that order; the statement's review is VH-137, the owner's, due 2026-11-18; two lines already paid are retired; fifteen stay wishes — because the owner applied the agent's triage in chat on 2026-10-20 and added the time left.

**Items:** VH-133, VH-134, VH-135, VH-136

**Rationale:** The owner asked what to cut, keep as a wish or add now, then said "yes, apply it with your recommendations" and "but add Time left during a job for now". Promoted, each line quoted verbatim in its item file's Notes: the returned translation sheet (VH-133); the six spec sign-off debts for §9, §9.1 step 2, §9.2 and §9.3 (VH-134); the stale discard question in `#status`, the shared status line, the bold segment's width and the Equality Advisory link in Xerte (VH-135); the time left (VH-136); the statement's review, its further tests and the two teams' addresses (VH-137). Retired as paid: "the planner can tell before the encode", since VH-110 refuses a plan whose predicted loudness misses the contract before a frame is encoded (`src/media/pipeline.ts`); and the Band 8 spec line, every part of which was applied on 2026-10-19 before Phase 1 closed. Kept as wishes: the trim step that scales (typing a time already reaches any point by keyboard, VH-125); the Teams listen and the heavy-limiting note (listen first); VH-124's four polish lines (for VH-124's sign-off); the person checks for VH-127, VH-128, VH-122, the switcher and the campus colleagues; the `pm_skills/` retirement, npm audit's dev-only findings and the stale `project/structure.md`. Order: VH-133 first, since the live pages show wording the owner has corrected and later items add keys to the same sheet; the spec next, since it is authoritative and wrong in six places; then the defects; VH-136 last, the only item with open questions on its design. VH-137 sits under Standing so Phase 2 can close before its date. This supersedes the earlier entry's "every wish stays on the wish list" and "the next item stays none"; its §7.1 sentence stands. No new dependency. Open, for the owner when each item starts: in its Notes.

**Supersedes:** 2026-10-20 — VH-116 — The §7.1 sentence stands as worded; the wishes stay wishes, and the next item waits on the owner

**Deferred:** VH-137

## 2026-10-20 — PLAN-2 — The owner's standing word: the agent's recommendations answer Phase 2's open questions, and the phase runs

**Decision:** Phase 2 runs item by item to its close, and on every open question in its items, the six spec edits included, the agent's recommendation stands as the owner's answer, recorded in the item's decision and shown at its close — because the owner said "happy for your recommendations on all matters, proceed" in chat on 2026-10-20.

**Rationale:** The owner gave this after PLAN-2 was recorded, while VH-133's questions (the 14 cells both changed, `choose.dropHeld`) and VH-136's (where the time left shows, its rounding, what it counts, how often it is heard) were open. VH-134's criterion that the six drafts be shown before anything is written to the spec is met by showing the applied diff at its close, which the owner can reverse; the rules file still has the owner approve every spec edit, and this is that approval, given in advance for this phase only. The session that recorded this ended at VH-133's close, past the profile's 200k Session line; the next session resumes at VH-134.

**Supersedes:** none

**Deferred:** VH-134

## 2026-10-20 — VH-133 — The returned workbook's changes are Google's re-run, not corrections; nothing is merged

**Decision:** none of the 21 cells that differ in `UoN Video Helper Translate v01 (1).xlsx` is merged, and VH-133 closes with the sheet and tables unchanged — because every one is still an unedited `GOOGLETRANSLATE` formula on unchanged English, so they are machine output from a later recalculation, not a person's corrections.

**Rationale:** The workbook's XML, read in Node: all 746 language cells are Google Sheets' export of `GOOGLETRANSLATE(C<row>,"en",<lang>)` with a cached value; each of the 21 points at its own row, and those rows' English matches the returned sheet. A person's edit in Sheets replaces the formula with text, and none did. The drift shows Google's marks: `{app}` renamed `{aplikasi}`, and "put down your phone" kept in `choose.dropHeld`. In the 14 cells the agent had repaired, the new output still gets the meaning wrong where the repair fixed it; in the other 7 it is no more right than the reviewed text. The 2026-10-18 rule stands: a reviewer's corrections come back by key through the filled sheet. Recommended by the agent and applied on the owner's standing word ("happy for your recommendations on all matters, proceed"). Item file: VH-133.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — VH-134 — The spec caught up: the six edits applied as drafted, with three 3.1.4 exceptions

**Decision:** the six edits stand in `docs/01-specification.md` as the agent drafted them: the page's three languages (§9), a handle or typed time moving the preview (§9.1 step 2), the five stages (§9.2), the paragraph gap's mechanism and figure, and kB–TB, UoN and eleven codec names as 3.1.4 exceptions with their four fields (§9.3) — because PLAN-2's standing word makes the drafts the owner's approval, shown at this close for reversal.

**Rationale:** Each sentence says what the shipped code does, read in the source: `LANGUAGES_OFFERED` and `MACHINE_TRANSLATED` in `src/config/languages.ts`, each table's `meta.separators`, `--font-cjk`; `src/ui/preview-seek.ts` and VH-125's decision; `PipelineStage` in `src/media/pipeline.ts`, the encode capped at 0.98 and the bar set full only at ready in `src/main.ts`; `--paragraph-gap` at 1rem on a 1.5 line height, 2.5× top to top, with no `!important` on spacing. The 3.1.4 list is `EXCEPTED` in `test/readability.test.ts` less "OK", which the test calls an ordinary word; "Dolby Digital", in the doc-delta line but not the test, is a name in words, which 3.1.4 does not reach. The reasons are VH-114's (canon decision log, 2026-10-01): sizes as every device shows them, the name under its logo, codec names as read-only facts behind a closed disclosure; each is dated today, when the spec takes it in. "2.5× top to top" is credited as VH-124's reading of 1.4.8, since Codex's VH-124 critique notes it is not a universal calculation. The machine-translation note, not in the doc-delta line, is in §9 because VH-105 shipped it. 306 words added; the spec is 7,692 of 7,800, leaving 108 for VH-136. No code changed.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — VH-136 — The time left: a line of its own under the stage after 10 s of encoding, from the job's own rate, heard only at the milestones

**Decision:** ten seconds into the encode (`TIME_LEFT_AFTER_ENCODING_SECONDS`), a line under the stage line shows the time left from the encode's own rate, rounded as pre-flight's estimate is ("About 2 minutes left", "A few seconds left"); it counts the encode, the closing included, not the seconds of finishing and checking; a screen reader hears it only with the three milestones, as a second sentence; it stays out of the tab title; the Chinese and Malay and the §9.2 sentence stand as the agent drafted them — because PLAN-2's standing word makes the agent's answers the owner's, shown at this close for reversal.

**Rationale:** The rate is VH-116's arithmetic, clocked from the encode's first report: the seconds since, over the share of frames encoded since, times the share to go. Over three samples in Chrome (Claude's in-app browser, page visible), real over predicted was 0.91–1.04 at 10 s and 0.91–1.08 until the last five seconds; finishing and checking took 1.1–1.3 s, so the stage line names them rather than the figure carrying pre-flight's error. Its own line, because on the stage line Chrome wrapped the Malay at 375 px and the English at an hour, and the notice and checkbox below jumped; `.progress-time-left` holds one line from the first report, and nothing moved at 320, 375 or 1280 px in any language. Not the tab title: the job notice asks for this tab to stay visible, and the title would change on every report. Rounded as pre-flight's, so "about" means one thing on the page. Heard at the milestones only, behind the 2.2.4 checkbox, at most three times an encode. VH-136's notes hold the runs; the spec is 7,757 of 7,800 words. Applied: WCAG 2.2.4 and 4.1.3, Nielsen 1, 4 and 8, Carbon helper text, UI-STANDARDS.md's layout stability, numbers in `src/config/`, tests by category.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — VH-135 — The save says itself on a line of its own; the switchers reserve their bold width; the advice link opens a new tab

**Decision:** a save writes only to its own line under the result, with Stop saving beneath it, and the line goes with the result; the discard question's spoken words leave the status line when the question goes; the three content-sized switchers reserve each face's bold width; the advice service's link opens in a new tab and says so in all three languages, the Chinese and Malay as the agent drafted them — because these meet the item's criteria, and PLAN-2's standing word makes the agent's choices the owner's, shown at this close for reversal.

**Rationale:** The save line is `#save-status`, a live region never `hidden`, collapsed while empty so a page with no result gains no blank line; it arrives with Stop saving, which moved from the check's row so each status sits over its own stop. `clearResult()` empties it with the result: a new job, or a new file when nothing is unsaved. The discard words are cleared only while the line still holds them (`statusAsksDiscard`), so a title-card refusal written while the question stood survives a withdrawal. The reserve is a `::after` of the face's own `data-text`, bold, no height, hidden, with `content: … / ''` so it is never read; the video type's `data-text` is bound by `data-i18n-attr`, so it follows a language change. The link takes `target="_blank"` and `rel="noopener noreferrer"`; its words add "(new tab)" in English, because "(opens in a new tab)" graded 10.7 against the readability gate's 10, and Chrome's own phrases "在新标签页中打开" and "tab baharu", through the filled sheet and `scripts/strings-table.mjs`. No spec section governs these details, so the spec is unchanged. Checked in Chrome (Claude's in-app browser) at 1280 and 375 px: no segment's left edge or width moved on any choice in any page language, against 5.67 px with the reserve switched off, and the face's accessible text is its words once; the switch and Keep it each left `#status` empty after the question; with AMCS3059's unsaved result, MLAC 3139 chosen and Save pressed during its check, the verdict landed on `#status` and "Saving…" then "Saved." on `#save-status`, neither overwritten, 7,222,021 bytes written through a slowed stand-in picker, since removed; the link's words in each language, the only link with a target. Applied: WCAG technique G201 and 4.1.3, Nielsen 1 and 4, Carbon's segmented skin kept, the house rule of a regression test per fixed bug — each mutation of a fix fails its test.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — PLAN-2 — Phase 2 closes with VH-136; no unblocked item follows, so the next is the owner's

**Decision:** Phase 2 closed on 2026-10-20 with every PLAN-2 item shipped, its backlog heading now "Phase 2 — … — CLOSED 2026-10-20"; no open, unblocked line remains in Current or Next, so the owner names the next item, and PLAN-2's standing word, given for this phase only, ends with it — because VH-17, VH-124, VH-113 and every Standing line wait on the owner, and Next's VH-13 waits on VH-M2.

**Rationale:** Reconciled against PLAN-2's Items (VH-133, VH-134, VH-135, VH-136): each has its line under Phase 2 in project/trajectory.md, and none is open in project/backlog.md; PLAN-2's deferral, VH-137, sits under Standing, due 2026-11-18. Recall, local (this session, from the record alone, not a fresh session): 1, project/trajectory.md under Phase 2, newest first: VH-136, VH-135, VH-134, VH-133 — 2; 2, "2026-10-20 — VH-133 — The returned workbook's changes are Google's re-run, not corrections; nothing is merged", because every changed cell is still an unedited GOOGLETRANSLATE formula on unchanged English — 2; 3, deferred: VH-137 under Standing in project/backlog.md, project/wish-list.md's open lines, this phase's among them (VH-135's and VH-136's person checks), and the backlog's Icebox — 2; 4, no next open item: Current and Next hold only lines blocked on the owner, as this entry records — 2.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-138 — The page audited again: 17 findings, two at rank 1, with the ranks and tables as Codex astra's critique left them

**Decision:** the audit stands as `reviews/2026-10-20/`: 17 findings, 2 at rank 1, 13 at rank 2, 2 at rank 3; 20 of 25 UX findings hold, 10 of 20 spec findings, 16 of 29 states; all 86 WCAG criteria judged live; the item is VH-138 and the plan PLAN-3, not the brief's VH-133 and PLAN-2 — because main already held those IDs when the session opened (rule 3), and because every finding was reproduced live or verified in source and then argued against by Codex astra before commit.

**Rationale:** the method is the 1 October one, rebuilt: headless Chrome 155 over CDP, real file input, drags, keys and touches, a stub save dialog writing into OPFS, ffmpeg fixtures only, in three languages, both switch positions, with and without a card, every closing, at 1280, 390 and 320 px, a 640 px stand-in for 200%, text spacing, light, dark and forced colours; Codex astra blind from the same brief, then an adversarial critique in three parts (one call could not finish inside the sandbox's ten-minute cap). The walker and digests are kept in `evidence/measurements/` because the critique showed the bundle was not self-contained without them. The sandbox could not start Chrome or bind a port, so Chrome and the walker ran in the owner's Terminal panel; `codex` ran through the settings' exclusion only as a plain command with the brief inline. Applied from the critique: V-02 (the record) restored to rank 1, since "Previous video" names only a different file; V-11 (a previous video's warnings lost) and V-12 (focus dropped at a save's completion) added from source; V-13, V-14 and V-15 raised to rank 2 as status breaches; V-01's standard narrowed (§13 criterion 2 is loudness) and its direction rewritten around each track's decoded extent, the probe unable to certify the tail; V-04 extended to every re-draw and its 3.2.4 citation dropped; V-07 marked reproducible with a long draft; V-08 as a house rule, not WCAG 3.2.4; V-09's two over-claims removed (an unreturned workbook does not show no one is reading; only the reading-level gate is English-only); V-10 given a live route that exists before a file is read and the focus point; V-17's source corrected to `failure.captured`; the WCAG rows for 1.4.4, 1.4.8, 2.1.1, 2.4.13, 2.3.3, 2.5.2 and 3.2.4 narrowed to what the method shows, the §9.3 list split into four kinds, the statement rows qualified (announcements present, screen readers unverified; the reading gate's reach; colleagues' review unconfirmed; UoN omitted; WAVE owner-reported); the regression totals recounted; U-01 marked unverified here; A-05 and states 18 and 19 regressed; U-24 and A-17 as new breaches; A-18 and state 09 as accepted deferrals; states 06, 12, 21, 22, 25 and 29 corrected; the missing recovery states added as source-only rows; the heights given their conditions; the verdict's "every" claims narrowed. Withdrawn at the critique's objection: the first draft's V-02, a date-only card as a defect, because spec §9.1 step 3 fills the date and refuses only a card with nothing on it, which `isCardEmpty` implements; it is the owner's question, a wish line. Refused: raising V-16 (the damage note's tense) to rank 2, since the body says "will" and the harm is polish; the unreadable-replacement path as a finding of its own, unobserved here and carried in VH-141's clause instead. Standards applied (rule 8): the WCAG 2.2 AAA digest's 1.4.6, 2.5.5, 2.4.13, 2.1.3, 2.2.4, 1.4.8 and 3.3.6 lines; Nielsen's 1, 4, 5 and 6; Carbon's interaction states and one primary per state. The brief's note that VH-116 might change the time estimate was moot: VH-116 had closed. VH-124 and VH-113 are not closed by this item; the bundle is evidence for the owner's walk-through.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — PLAN-3 — Phase 3: what the second audit found

**Decision:** Phase 3 is VH-139 (a file that ends early), VH-140 (the record, the switches, Step 3's rules), VH-141 (nine small page defects) and VH-142 (the words), in that order, each with a file carrying its findings' clauses, run only on the owner's sign-off — because the 20 October audit found two rank-1 and thirteen rank-2 shortfalls against the 1 October standard, all the page's to fix but the date-only card, which is the owner's question.

**Rationale:** the findings answered: V-01 by VH-139; V-02, V-05, V-06 by VH-140; V-03, V-04, V-07, V-10, V-11, V-12, V-13, V-14, V-15 by VH-141; V-08, V-16, V-17 by VH-142. Deferred as wish lines (rule 5): V-09, the statement's contradictions, to the owner's VH-137; the date-only card as the owner's question; the spec's §7.2, §5.4 and §9.3 corrections, which the owner approves; the person's checks the audit could not make; A-14's unscanned-container wording. VH-139 goes first because it is the one rank-1 finding the page can fix without a design decision (V-02's fix is a wording change but shares VH-140 with the switches' line). Direction: Phase 3 brings the page back to the 1 October standard on its new surfaces; nothing in it is new design, and VH-124 and VH-113 stay the owner's to sign off. The plan is written so another harness could run it from the record: each item's file names its clauses, sources and evidence.

**Supersedes:** none

**Items:** VH-139, VH-140, VH-141, VH-142

**Deferred:** none

## 2026-10-21 — PLAN-3 — The owner signs off Phase 3, and VH-139 starts

**Decision:** PLAN-3 stands as recorded and VH-139 runs now; VH-140 starts only on the owner's next word — because the owner said "approve PLAN-3 and start VH-139" in chat on 2026-10-21.

**Rationale:** The words reached this session through the VH-138 session that planned the phase, which started VH-139 in its own worktree from VH-138's close (5f23af6, branch `claude/nifty-jepsen-850e8e`, not yet merged to `main`) and set that the session stops after VH-139. The sign-off covers the plan's order and items as PLAN-3's entry lists them; it is not a standing word like PLAN-2's, so open questions in later items still go to the owner.

**Supersedes:** none

**Deferred:** none
