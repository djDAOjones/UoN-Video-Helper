# Codex astra brief — PLAN-8 round 2 and the sheet's approval, 2026-10-24

You are checking a planning commit in this repository, read-only. The base is HEAD, 57bf247 (PLAN-8). The candidate is the working tree against HEAD: `git diff`, plus this brief. Do not run the gate or build anything. Nothing in `src/` or `docs/` changes in this commit, by design; the spec and UI-STANDARDS corrections stay drafts applied later by their items.

What changed: the owner approved the Phase 8 wording sheet and round 2's three recommendations ("all seems good."), with four wording changes of the owner's own. The owner's words are quoted verbatim in the new `project/decisions.md` entry "PLAN-8 — the sheet approved"; the settled words from them are:

- heavyLimiting's last sentence: "Next time, try adjusting how you record the sound." (less specific than round 2's microphone, keyboard and desk advice).
- Lede promises 2 and 3: "Levels the audio for a consistent listening experience." and "Makes a video file sized and formatted for your intended use."; promise 1 stays; `app.description` follows.
- The help group holds only "Staff: ask in the Creators team on Teams (new tab)" and "Students: get help through Self Service (new tab)"; "Email the learning content team" leaves the footer. Problem reports still go to that team through Report a problem, and the statement's contact still moves to it (Q1a).
- The feedback form link: "Please tell us what you think in the feedback form (new tab)".
- Q5, Q6 and Q7 settled on round 2's options 1: "High quality, for publishing" / "Smaller file, for assignments and sharing"; a measured after-job warning above 3 LU (`HEAVY_LIMITING_LU`); labelled routes, nothing following the Video type.

The sheet (`reviews/2026-10-24/phase-8-wording-sheet-2026-10-24.md`) now reads as approved: B4, B6, B11 and the VH-182 rows carry the final words, S1–S10 and S25 are round 2's redrafts (each produced by a script against the current spec and matched exactly once; all corrections in build order take the spec from 8,074 to 8,098 of 8,100), and the Round 2 section at the end keeps the working. The backlog's Phase 8 `[!]` marks are lifted to `[ ]`; item files VH-182, VH-186 to VH-194 have their Now, and where words changed their criteria, updated. `tools/archive.mjs` moved one old decision to the monthly file.

The owner's standing rule is that the app stays simple: the only new elements allowed are the finished card's player (VH-192), the footer's headings and the Self Service link (VH-182).

Please judge, with file:line references:

1. The owner's changes are applied exactly as the settled words above, everywhere they appear (sheet rows, round 2 section, decision, items), and no superseded word survives as a final word (search for "easy to hear", "sized for where", "Best quality" as a label, "Fill in the feedback form", "speak close to the microphone", "6 LU", "provisional", "Being worked out").
2. VH-193 is coherent: measured, not predicted; the bite is `afterChainLufs` + the solved gain − `limitedLufs` (compare `src/audio/gain-solve.ts` and `src/media/audio-plan.ts`); through `detectOutputWarning`'s path (`src/audio/warnings.ts`); S25's row fits spec §5.4's table, whose intro says warnings are shown before processing.
3. VH-182 is buildable: removing the learning content link (`index.html`, `src/main.ts`, `src/config/feedback.ts`, the three i18n tables and `src/i18n/sheet.ts`) is covered, WCAG 2.4.9 holds for the new link words, and nothing else depends on the removed link.
4. VH-188: the new names, `preset.inSentence.*` and the record prose are consistent with current `{smaller}`/`{best}` sentences in `src/i18n/en-GB.ts`; S1–S10 quote the current spec exactly.
5. The ledger obeys AGENTS.md rules 3 to 6: the decision's Items and Deferred lines, the backlog marks, nothing deferred without a line.
6. Anything that adds an element or control beyond the three allowed, or any word budget broken.

Reply with a verdict first ("Commit", "Commit after the musts below", or "Do not commit"), then numbered findings marked must, should or could, each with a file:line reference and a concrete fix. Be brief.
