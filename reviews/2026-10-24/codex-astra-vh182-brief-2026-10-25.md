# Codex astra brief — VH-182, the footer's contact routes grouped by need, 2026-10-25

You are checking one Phase 8 item's candidate diff in this repository, read-only. The base is commit 56fb631. The candidate is the working tree against HEAD: `git diff`, plus the new walker `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/footer-182.mjs` and its evidence `reviews/2026-10-24/vh182-footer-2026-10-25.json`. Do not run the walker or the gate; the gate has run green (1546 passed, the 1 skipped is the base's EBU 3341 skipIf), and its result goes in the commit.

The item is `project/items/VH-182.md`: read its acceptance criteria in full. The words are the Phase 8 wording sheet's VH-182 rows, Q7 and corrections S22 and S24 (`reviews/2026-10-24/phase-8-wording-sheet-2026-10-24.md`), which the owner approved with his own changes; they are final, do not propose rewording them. Phase 8's rule is that the app stays simple: no new control or element beyond the sheet. The orchestrator settled that "Help and feedback" stays unboxed in the footer band, as the links were, since a panel or disclosure would add a control.

What the candidate does, in outline: `index.html`'s footer replaces the button, the form link and the two team links with one `div.footer-help` (an `h2`, three `h3` questions, each over its routes); `src/config/feedback.ts` moves `FEEDBACK_ADDRESS` to the learning content team, drops `LEARNING_CONTENT_TEAM_ADDRESS`, adds `SELF_SERVICE_URL`, renames the subject; `src/main.ts` drops the learning-content mailto handler and wires the Self Service link; `en-GB.ts`, `sheet.ts`, the filled CSV and the regenerated zh-Hans and ms-MY tables (agent's drafts, marked); CSS puts the new headings in the existing panel-heading and section-heading roles; tests; README; spec §9.2 and §11.

Check, giving file:line:

1. Each acceptance criterion: met or not, and why.
2. Any "Send feedback", any reference to the removed key, constant, id or handler, left anywhere in `src/`, `index.html`, `README.md`, `docs/`, `UI-STANDARDS.md` or tests that should have changed.
3. Accessibility of the new structure: heading levels in the page's outline (the footer's two disclosures carry `h2`s in their summaries), each link's name standing alone (2.4.9), targets, no new landmark.
4. Are the spec corrections exactly S22 and S24, words unchanged, and is anything else in the spec now false (for example a sentence elsewhere that says feedback goes to the maintainer, or names Send feedback)?
5. The Chinese and Malay drafts: any wrong sense, or terms out of step with the rest of their tables (the button's name as quoted in the error messages, "new tab", the team names).
6. The filled sheet: consistent with `sheetRows()` for every changed row; did anything change that should not have?
7. The walker: any check that would pass when the behaviour is wrong?

Give a verdict line first: "Commit", "Commit after the musts below", or "Do not commit", then numbered points marked Must, Should or May.
