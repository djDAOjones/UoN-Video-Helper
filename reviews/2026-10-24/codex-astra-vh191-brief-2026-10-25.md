# Codex astra brief — VH-191, Video language into step 3, 2026-10-25

You are checking one Phase 8 item's candidate diff in this repository, read-only. The base is commit 330a7ad. The candidate is the working tree against HEAD: `git diff`, plus the new walker `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/lang-191.mjs`. Do not run the walker or the gate; both run outside your check, and their results go in the commit.

The item is `project/items/VH-191.md`: read its acceptance criteria in full. The words are the Phase 8 wording sheet's row B9 and correction S19 (`reviews/2026-10-24/phase-8-wording-sheet-2026-10-24.md`), which the owner approved; they are final, so do not propose rewording them. Phase 8's rule is that the app stays simple: no new control or element beyond the sheet. The owner chose the placement, verbatim: "A: Video language at the top of step 3, under the heading, before the title card choice". It must stay in view whether or not the title card is on, since it also sets the closing graphics' words. The `#video-next` line is settled by S19 and B9: it stays under Video type only, with B9's `nextVideo`, and Video language locks with step 3 while a video is made or saved.

What the candidate does, in outline:

- `index.html` moves the `#video-language` fieldset out from under the Video type switch to the top of `#step-title`, after its `h2` and before `#title-card-choice`. It drops `video-next` from its `aria-describedby`, moves `<p id="video-next">` into `#video-kind`, and updates the comments.
- `src/main.ts` drops the code that moved `#video-next` "under the switch" when the language choice is hidden. It disables `#video-language` in `applyControlLock` beside `titleCardChoice`, and `paintVideoNext` reads `t().videoKind.nextVideo`.
- `en-GB.ts` moves `nextVideo` from `videoLanguage` to `videoKind` with B9's words, and takes B9's `videoLanguage.helper`.
- `sheet.ts`, the filled CSV and the regenerated zh-Hans and ms-MY tables follow. The Chinese and Malay rows are the agent's drafts, marked as such.
- `test/screen-text.test.ts` is updated, and the spec's §9.1 takes S19.

Check, giving file:line:

1. Each acceptance criterion: met or not, and why.
2. Any reference to the old placement ("above Step 1", "under the switch", "never locked" for Video language, "both switches"), to `videoLanguage.nextVideo`, or to `#video-next` inside `#video-language`, left anywhere it should have changed: `src/`, `index.html`, `README.md`, `docs/`, `UI-STANDARDS.md`, `project/architecture.md` or the tests.
3. The lock. Is `videoLanguageChoice.disabled` set and cleared on every path `titleCardChoice.disabled` is, including a save, a cancel, a failure and the start-up check? Does disabling it while a job starts strand focus (VH-178's rule: focus passes on when finished work takes its control away)? A page-language change during a job still moves the shown Video language while it is locked, if nobody has picked one. The date field in the same locked step already follows the page in the same way. Is that acceptable, or a must?
4. Accessibility: the step's outline (its `h2`, the lock note, then two sibling fieldsets), the legend's role, its description, and the keyboard order. Does a screen reader still hear the next-video line on Video type, and nothing stale on Video language?
5. Is the spec correction exactly S19, words unchanged? Is anything else in the spec now false about Video language's place or its locking, for example §9.1's later sentences, the step 3 section or §10?
6. The Chinese and Malay drafts: any wrong sense, or terms out of step with the rest of their tables ("title card", "closing graphics", "video type").
7. The filled sheet: is it consistent with `sheetRows()` for every changed row, and did anything change that should not have?
8. The walker: any check that would pass when the behaviour is wrong?

Give a verdict line first: "Commit", "Commit after the musts below", or "Do not commit". Then give numbered points, each marked Must, Should or May.
