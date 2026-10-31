<!-- markdownlint-disable -->

# VH-229 — Codex's blind check of the verdict, brief

Read-only. You give your own verdict on a candidate change in this repository's working tree. You may read: the tracked diff (`git diff ff44a4f21fdd01d119b54ce3b5bace07e0f43428`), the untracked table `reviews/2026-10-25/design-pass-3/evidence/measurements/vh229-title-help-2026-10-31.md` and its records folder `vh229-records-2026-10-31/` beside it, `project/items/VH-229.md`, `project/wish-list.md`, `UI-STANDARDS.md`, `project/digests/`, the walker read-only, and `/Users/joe/UoN-Video-Helper-side/vh229-walk/` (drivers, logs, runs). You may not read any folder under `side-session-notes/`; nor, in `/Users/joe/UoN-Video-Helper-side/`, any `vh229-claude-*`, `vh229-*compare*`, `vh229-progress.md`, `vh229-handover-*`, or any `vh229-*brief*` but this one.

The owner's words, verbatim: "what about a question mark box after the app title, if clicked expands the promises follwoed by the "Your video is processed on your device, it is never uploaded, and the original file does not change." segment. users then aren't bother by text, the controls are self evident / self guiding, and novices can click the question mark"; "Hide both" (told it was recommended to keep the privacy line in view; "Promises only" not taken); "Approve both" (the §9.2 wording in wish VH-229.1, the name "About this tool").

Approved and nothing else: one "?" button beside the title, one panel element holding today's promises and privacy line, a wrapper for the title row if the layout needs it, one new string "About this tool" (Chinese and Malay marked machine translations), one §9.2 line in `docs/`. `#browser-note` stays in view. Walker unchanged at revision `e0a55331a7155cd3`. VH-216's one order at every width and VH-217's gap and open state stand.

Answer each of the item's Acceptance criteria: met, not met or not shown, with the evidence's file. Then judge these points:

1. Each group's power and load in the table: are the before and after comparable; does the before's higher load put any reading in doubt?
2. The re-walks `c2`, `c3` and `states2`, and the before's clean worktree at the same commit: is any cell's before or after not the reading it is said to be? Do the table's cell counts and "after-only" count mean what they say?
3. Any instrument or row that fails only after; any reading that moved and should not have.
4. The Escape behaviour for every focus position and open layer, by the code and `after-probe3`.
5. The title row at 320 px and the 32 px font, today's name and "UoN Video Finisher"; is "reads well" met? The probe's in-memory rename and what it could miss.
6. Any element, string, `docs/` edit, walker change or test change beyond what is approved or named; a test deleted, skipped or weakened.
7. The Chinese and Malay name, against the page's terms.
8. WCAG 1.3.1, 1.3.2, 1.4.4, 1.4.10, 2.1.1, 2.4.3, 2.4.6, 2.5.5 and 4.1.2; Nielsen 8 and 10.
9. A heading reader and a screen-reader user of the closed page.

Open with one word, Commit or Hold, then the findings, each with file and line, ranked. At most 700 words.
