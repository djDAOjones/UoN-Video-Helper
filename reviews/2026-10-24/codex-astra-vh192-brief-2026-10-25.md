# Codex astra brief — VH-192, the finished video plays in its card, 2026-10-25

You are checking one Phase 8 item's candidate diff in this repository, read-only. The base is commit 3c20550. The candidate is the working tree against HEAD: `git diff`, plus the new walker `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/player-192.mjs`. Do not run the walker or the gate; both run outside your check, and their results go in the commit.

The item is `project/items/VH-192.md`: read its acceptance criteria in full. Its words are the Phase 8 wording sheet's row B10 (no new words: the player is named by the card's heading) and corrections S20 and S21 (`reviews/2026-10-24/phase-8-wording-sheet-2026-10-24.md`). The owner approved them, so they are final; do not propose rewording them. Phase 8's rule is that the app stays simple: no new control or element beyond the sheet, and this player is the one new element the sheet allows. The owner settled two open points, verbatim: "1A and 2A: the player shows only while the video is unsaved and leaves the card once a save completes; it sits after the card's lines, before the lifetime line and Save". So the player covers an unsaved result, a "Previous video" and a fallback download. The save's clean-up rule is unchanged, and focus at a job's end stays on the card (VH-178).

What the candidate does, in outline:

- `src/main.ts`:
  - `resultPlayer` keeps one `{ jobId, url, video }`.
  - `resultPlayerFor(kept, labelledBy)` makes a native `<video>` with `controls`, `preload = 'metadata'` and `playsInline`. Its `src` is `URL.createObjectURL(kept.file)`, the job's OPFS-backed `File`, and it is `aria-labelledby` the card's title. One player is made per job and reused on a re-render of the same job ("Keep it", another file chosen).
  - `releaseResultPlayer()` pauses the player, drops its `src`, calls `load()`, removes it and revokes its URL.
  - `renderResult` appends the player after the card's lines and before the lifetime line.
  - `releaseUnsavedResult` releases the player first.
  - A completed save releases the player before the scratch's `discard`. If focus was on the player, it is handed to the card.
  - A download (fallback) keeps the player, because the result stays unsaved with the same `jobId`.
  - No `pagehide` listener: a closed tab ends the document's object URLs.
- `src/styles/app.css`: `.result-player` shares `.trim-preview`'s rule, with a top margin.
- `docs/01-specification.md`: §9.1 takes S20, and §9.3 takes S21.
- `test/screen-text.test.ts`: a new block of source-level checks.
- `project/wish-list.md`: VH-192.1, for the accessibility statement's media limitation, which names only the preview.

Check, giving file:line:

1. Each acceptance criterion: met or not, and why.
2. Lifetime and leaks. Is every path that ends an unsaved result covered? That is Discard and a new job, a completed save, a re-render, a page-language change, another file chosen, the discard question withdrawn, a cancelled or failed save, a download followed by Discard, and the start-up or reset paths. On each, is the object URL revoked exactly once and never while the result still shows? Can the worker remove the OPFS scratch while the player still reads it (the `lease` and `discard` messages, `beginJob`)? Is relying on the document's end for a closed tab sound, or is a `pagehide` revoke needed? Consider bfcache.
3. Streaming. Does an object URL over the OPFS `File` keep the whole file out of memory, as the rules' streaming line requires?
4. Focus and announcements. Is VH-178's rule kept at a job's end, after "Keep it", and after a save that completes while focus is on the player (`fromPlayer`)? Is anything stale announced or left focusable?
5. Accessibility. The player's name from `aria-labelledby` (the card's title, which changes to "Previous video"), its place inside the notification `section`, and keyboard access to the native controls. Are 1.2.x and 2.3.x covered by S21 as applied? Is there any flash or autoplay risk?
6. A failed playback. Does anything in the result, the save or the record depend on the player? Should an `error` on the player do anything, given that B10 allows no new words?
7. Is the spec correction exactly S20 and S21, words unchanged, re-wrapped only? Is anything else in the spec, README, `UI-STANDARDS.md`, `project/architecture.md` or the statement now false? (The statement is wish line VH-192.1.)
8. The walker and the tests: any check that would pass when the behaviour is wrong?

Give a verdict line first: "Commit", "Commit after the musts below", or "Do not commit". Then give numbered points, each marked Must, Should or May.
