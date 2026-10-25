# Codex astra check — VH-192, 2026-10-25

Model `gpt-6-astra`, read-only, on the candidate against 3c20550. The brief is `codex-astra-vh192-brief-2026-10-25.md`.

## Check

Commit after the musts below

1. **Must — complete the close requirements.** The implementation has no blocking defect that I found. Against `project/items/VH-192.md:9` (VH-192’s acceptance criteria):

   | Criterion | Assessment |
   | --- | --- |
   | Quote the owner’s Q3 choice | Pending close: quote “proceed with your recommendation”, identifying option A. Record the supplied 1A/2A settlement too. |
   | One native, named player; metadata preload; no autoplay or new words | Met: `src/main.ts:2870`, `:3285`. |
   | OPFS streaming and correct lifetime | Met by source inspection; qualifications below. |
   | Playback failure isolated; “Previous video” supported | Met: `src/main.ts:3305`, `:3337`, `:3370`. |
   | Assess the app’s added media | Pending close; point 5 gives the assessment and its limits. |
   | No other control; VH-178 preserved | Met in source and the supplied end-of-job measurements. |
   | Exact S20/S21 within 8,100 words | Met: exact substitutions, **8,059 words**. |
   | Browser checks, gate, digest rules and `Checked:` line | Supplied evidence records **36/36 matrix cases and 9/9 flows**. Gate result and close/commit requirements remain outside this review. |

   The `reviews/2026-10-24/vh192-player-2026-10-25.md:7` appeared during the review; I inspected its JSON and screenshot. I changed nothing and ran neither the walker nor the gate.

2. **May — keep the lifetime implementation and omit `pagehide` revocation.** `src/main.ts:2890` (The release helper) pauses, removes `src`, resets loading, detaches, revokes and clears its reference. Subsequent releases are harmless.

   | Path | Finding |
   | --- | --- |
   | Discard and new job | `main.ts:2824` releases the player before `beginJob`; worker `job.worker.ts:199` subsequently releases retained scratch. |
   | Completed save | `main.ts:3441` releases the player before the discard request at `:3457`. |
   | Same-job re-render / Keep it | `main.ts:2871` reuses the element and URL; updates its heading reference. |
   | Page-language change | `main.ts:3785` repaints the existing heading; no replacement URL. |
   | Another file chosen | `main.ts:1443` retains the previous result and reuses its player. |
   | Discard question withdrawn | `main.ts:2196` restores the retained result without revocation. |
   | Cancelled, refused or failed save | `main.ts:3383`, `:3391`, `:3463` retain the player; lease release alone does not delete scratch. |
   | Download followed by Discard | `main.ts:3401` retains the download release callback; `:2903` releases the player before releasing the download and starting another job. |
   | Start-up and reset | No result player exists at boot. Selection resets retain unsaved results; job resets follow confirmed release. Worker cancellation disposes unfinished scratch at `job.worker.ts:342`. |

   The worker does not independently expire a visible result: leases delay deletion; they do not schedule it. Supported UI paths stop the player before either deletion trigger. The existing Web Lock protects retained scratch against another tab’s boot sweep.

   A discarded document’s blob URLs are cleaned up by the browser. A bfcache entry retains its document for restoration, so unconditional `pagehide` revocation would break that restored player. The current omission is sound. [File API lifetime](https://w3c.github.io/FileAPI/#lifeTime), [bfcache lifecycle](https://web.dev/articles/bfcache).

3. **May — keep the OPFS `File` object URL.** `src/media/opfs.ts:349` returns the file handle’s `File`; `src/main.ts:2878` references that file directly. There is no whole-file `arrayBuffer()`, data URL or byte-copying Blob construction.

   This meets the application’s streaming rule: Chrome supports file-backed blob data and ranged file references. It does not establish a bound on Chrome’s own buffering or operating-system caching. Likewise, `preload="metadata"` is a browser hint, not a hard byte limit. [Chromium blob storage design](https://github.com/chromium/chromium/blob/main/storage/browser/blob/README.md).

4. **Should — strengthen focus verification; the implementation preserves VH-178.** Job-end capture and hand-on remain at `src/main.ts:3040` and `:3143`; Keep it captures before replacement at `:2833`; completed saving captures the player before removing it at `:3440`.

   `src/ui/focus-hand-on.ts:85` checks the active element and retains its reader/dialog safeguards. Native-control focus is exposed through the video host at document level. The notification remains a focusable, labelled `section`, rather than an alert containing interactive controls (`src/ui/notification.ts:43`; `index.html:633`). Discard-question announcements are withdrawn before restoring the result.

   The supplied JSON shows focus on the restored card in all three Keep flows, but the walker never asserts `kept.focusOnCard` at `player-192.mjs:169`. Add that assertion. Also exercise Tab/Shift+Tab and native playback controls: `.focus()` at `:208` proves the save hand-on, not keyboard reachability or a visible keyboard focus indicator.

5. **Must — record the media assessment without claiming that silence proves 1.2.x conformance.** S21 is correctly applied and approved; its words need no revision.

   The staff and submission cards are one static picture held over silence (`src/media/title-card-frame.ts:76`, `:132`). Existing closing graphics are silent, with the recorded cut/fade/slide and word reveal (`docs/01-specification.md:139`, `:219`). These additions introduce no repeated flashing mechanism; the player introduces no autoplay. Flashing in the user’s recording remains the recorded limitation.

   Silence creates no new speech requiring captions, but meaningful visual words can still require media alternatives or description. The logotype exemption is specifically 1.4.9, not a general exemption from 1.2.x. Record the additions under **S21’s accepted limitation**, rather than repeating the overbroad assertion in `project/items/VH-192.md:35`. Also retain §8.3’s qualification that separate embedded captions do not survive processing.

   The player’s heading-based name and position are sound. “Previous video” updates that name through the heading. Native target sizing uses the existing user-agent exception at `docs/01-specification.md:723`; screen-reader announcements remain the explicitly recorded human check.

   Applicable digest rules: Carbon’s existing notification and spacing tokens; Nielsen 3, 4 and 8; WCAG keyboard access, focus continuity, accessible naming, native target sizing and media limitations; house conventions’ streaming rule.

6. **May — leave playback errors independent of the result.** No playback event changes the retained file, record or save state. Saving reads `kept.file`, independently of the video element (`src/main.ts:3258`, `:3370`). A media error therefore cannot turn a completed job into a failed job or disable saving.

   No new application error message or control is required under B10. The native player can expose its own failure. An error handler that releases the result, changes the record or blocks Save would violate the criterion.

7. **May — keep the documentation diff as written.** I compared HEAD with the candidate after applying only S20 and S21 and normalising whitespace: they match exactly. The relevant changes are `docs/01-specification.md:630` (§9.1) and §9.3 at line 741; the ledger count is **8,059/8,100**.

   I found no additional contradiction introduced by this player in the spec, README, UI-STANDARDS or architecture. The after-save instruction to check the saved file remains valid because the player disappears after saving. The statement’s incomplete preview-only description is correctly tracked by `project/wish-list.md:58`, VH-192.1.

8. **Must — make the playback check distinguish the finished video from the source.** In `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/player-192.mjs:84` (the walker), the media assertion accepts any positive duration. The source tests at `test/screen-text.test.ts:728` count `createObjectURL` occurrences but do not establish which file it receives.

   Changing the implementation to `URL.createObjectURL(kept.source)` would pass these checks while defeating VH-192’s central purpose. Assert the expected finished duration for this fixture and closing, or another observable property distinguishing the output from the original. The recorded output is about 6.04 seconds; the fixture’s source is two seconds.

9. **Should — narrow the remaining test claims or strengthen their evidence.** `player-192.mjs:152` explicitly pauses playback before opening the discard question, so `:164` cannot prove that withdrawing a playing element stops it. The browser’s removal algorithm does pause it, but this particular check does not demonstrate that behaviour. [HTML media removal](https://html.spec.whatwg.org/multipage/media.html#playing-the-media-resource).

   Similarly, failed fetches at `:98` establish unreadability, not exactly one revocation; count URL creation/revocation to prove that stronger claim. The flows also omit failed playback, cancelled/failed saves, automatic withdrawal of the discard question and navigation restoration. The source-only limitation at `vh192-player-2026-10-25.md:38` is appropriately candid. Keep those distinctions in the close and route any deferred instrument coverage explicitly to VH-198.

## Disposition

- 1 (Must): done in VH-192's close, the decision entry and the item file.
- 5 (Must): done. The close records the added cards under S21's accepted limitation: silent, no flashing mechanism, and their words chosen on the page. It does not claim 1.2.x conformance. The item note's logotype line is qualified there.
- 8 (Must): done. The walker asserts that the player's duration is more than 1 s from the original's (the finished `short-2s.mp4` is 6.04 s, the original 2 s), and the unit test asserts `URL.createObjectURL(kept.file)`.
- 4 (Should): taken in part. The keep flow asserts focus on the card after "Keep it". Tab reachability and the native controls' keyboard focus go to VH-198, pass 3's instruments, and VH-70 keeps the screen reader.
- 9 (Should): taken in part. The player is left playing into the discard question, which must pause it, and every object URL is counted so that Discard is shown to revoke the old one exactly once. Failed playback, cancelled or failed saves and bfcache restoration stay traced in source, as the evidence file says, and go to VH-198 with point 4.
- 2, 3, 6 and 7 (May): kept as written.
