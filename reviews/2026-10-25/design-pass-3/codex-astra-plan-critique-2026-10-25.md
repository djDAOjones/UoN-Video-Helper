<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), critique of the draft plan for the third design pass (VH-197), 2026-10-25, at main 7e520f3, kept as written. What was applied is in plan-2026-10-25.md, "After Codex astra's critique". -->

**Revise.** The draft preserves the right structure and most of Phase 7’s breadth, but it does not yet demonstrate “as thorough as before.” Its principal weaknesses are an incompletely specified coverage expansion, missing regression cases from the actual changes, and instruments that could certify the wrong text or the wrong part of the native player. These are repairable within the proposed stages; another redesign is unnecessary. This is a read-only review of checkpoint `7e520f3`, the source and commits through `2bcb191`, and the retained evidence—not a fresh browser run. References below abbreviate `reviews/2026-10-25/design-pass-3/` as **P3**, `reviews/2026-10-22/design-pass-2/` as **P2**, and P2’s `evidence/measurements/walker/` as **W**.

### P-01 Prove coverage by cell, not by the name “Phase 8 in full” — must

The promise to repeat the same 699 keys is correct. The additional 26-cell recipe is not sufficient to establish that every affected cell is covered.

For example, Malay at the 32 px font or with fallback faces is omitted from that recipe, including for the finished card whose player and wording changed. Narrow dark and forced-colour states are also omitted unless another plan happens to supply them. Yet S-98 explicitly requires its edge at 320 px in all four palettes. The finite-list statement promises enlargement, fallback, reduced motion and other views without specifying the language coverage that the matrix subsequently restricts (`P3/plan:133–151`; `P3/scenarios:122`, `274–304`, `379–394`).

There are two further ambiguities:

- `project/items/VH-199.md:9` requires every walked scenario in all nine language × light-view cells; the draft carries the reduced priority plan and expands only changed scenarios.
- `P3/scenarios:29–34` correctly says page-wide measurements change in every record. It then leaves “untouched” cells undefined. A globally changed footer does not necessarily require re-encoding every scenario, but that equivalence must be demonstrated.

**Smallest change:** publish an explicit coverage manifest with the frozen 699 baseline keys, additional keys, item-to-cell mappings, and justified reuse. Compare baseline classes as well as totals:

| Class | VH-172 baseline |
| --- | --- |
| Languages | English 371; Chinese 179; Malay 149 |
| Views | 1280: 376; 375: 76; 320: 207; landscape and short: 9 each; enlargement proxies: 11 each |
| Modes | Light 489; dark and each forced palette: 25; spacing 74; reduced motion 11; fallback and 32 px font: 25 each |

These are recorded in `P2/evidence/measurements/after-run-2026-10-24.md:28`. Add the missing affected combinations or name the proposed reduction explicitly. Reconcile VH-199’s criterion with the authorized matrix. When merging duplicate keys, retain the union of required assertions and press lists: the previous after-run needed five overlapping priority records with wider press checks, not merely 162 distinct extra keys (`after-run:10`).

### P-02 Size the work before closing the plan — must

The draft postpones exact counts to VH-198 (`P3/plan:147`; `P3/scenarios:393–394`), although VH-197’s own next step requires stating the matrix’s sizes (`project/items/VH-197.md:21`). “About one session” and “resumable parts” do not establish feasibility.

The nominal expansion for the 59 new scenarios alone is 1,534 records before exclusions and overlap. Changed carried scenarios, variants, transitions and routes add further work. Phase 7’s 699-record run took 2 h 20 min; its full 1,454-record plan was estimated at 11.6 hours (`P2/evidence/measurements/matrix-2026-10-23.md:9`). Record counts therefore cannot be converted into time by simple proportion.

**Smallest change:** give a generated count now, followed by a pilot-calibrated estimate in VH-198. State expensive setup groups, maximum fixture/job times, resumable part boundaries, and how a changed instrument revision invalidates prior parts.

Avoid paying repeatedly for identical outcomes. S-53/S-126, S-83/S-145 and S-17/S-98 can share setup and carry additional assertions. Separate visual measurements from expensive production runs where equivalent evidence supports that separation. Preserve genuinely different transitions and production-path checks; do not reduce coverage merely to hit a session estimate.

### P-03 Add the changed states revealed by the implementation — must

The catalogue is substantial, but “every state” is not yet true. Three concrete omissions matter:

| Change | Missing verification | Smallest addition |
| --- | --- | --- |
| **VH-185** | The regression that prompted the actual repair: 390 ms of requested sound becomes 410 ms after frame snapping. The near-zero sliver and 0.6 s control do not distinguish the formerly inconsistent pre-flight and production classifications. | Add a traced scenario or explicit source/unit verification for the 25 fps, 4.10 s cut, plus the strict 400 ms boundary. Cite `src/media/sub-block-sound.test.ts:97` and the original finding in `reviews/2026-10-24/codex-astra-vh185-check-2026-10-24.md:7`. |
| **VH-186** | The non-finite estimate branches changed in `src/ui/preflight-panel.ts:112–136`. Ordinary S-15 cannot prove “no about unknown”; neither S-24 nor S-25 is identified as changed for this case. | Add long-job and very-long-job variants, source-only where necessary, linked to `src/ui/preflight-panel.test.ts:175`. Include the missing-fact cases beyond duration in the source-only mapping. |
| **VH-182** | Q7’s requirement that both staff and student routes always remain visible, independently of Video type. The footer contract checks their default contents, not their independence from that selection. | Add the Video type switch to S-83/S-145 or J2, asserting unchanged routes and destinations. This is explicit in `project/items/VH-182.md:9` and the wording sheet’s Q7 answer. |

These additions belong in both the scenario trace and the relevant contract row (`P3/contract:25`, `28–29`). They do not require inventing browser fixtures where the record already supports an honest source-only check.

### P-04 Exercise the warning combinations the contract promises — must

The contract promises both production warnings surviving a download, Keep it and Previous video (`P3/contract:53–56`), but S-138 starts from S-135, which has only the limiting warning. S-136 tests both only on the fresh result (`P3/scenarios:159–162`). The listed scenarios therefore do not establish the stated cross-item invariant.

Likewise, naming S-85 does not verify completion with Announce progress off. Its existing state is explicitly **running**, with the checkbox unticked (`W/scenarios.mjs:997–1002`). The outcome and ordered warnings are assembled later in `src/main.ts:3072–3077`.

**Smallest change:**

- Run the retained-result sequence from S-136, preserving both warnings and their order through download, Keep it, Previous video and translation.
- Add completion with Announce progress off, asserting the actual completion-region mutation and ordered warning titles.
- Combine a failed finished-player playback with the limiting warning once: its advice directs the person to listen, so this is a meaningful recovery interaction.
- Tie exact threshold behaviour to the unrounded unit evidence, including the value that logs as `3.00` but exceeds 3 LU (`src/audio/warnings.test.ts:222`). The rounded log cannot establish that boundary.

Also reconcile the proposed deferral of non-finite and lowered-ceiling checks (`P3/plan:89–91`) with `project/wish-list.md:61`, which assigns them to VH-198. Verify them separately from the log using existing tests or a qualified scratch probe; identify absent evidence explicitly and route any implementation work to a fix item. Do not silently turn an assigned obligation into work performed only if later ranked.

### P-05 Re-prove the complete instruments, including semantic false passes — must

The qualification paragraph names three original failures, `pressed`, `type`, and one player failure (`P3/plan:166–171`). Phase 7 actually ended with 77 qualification results, plus the later pressed/type proofs—not merely those examples (`P2/evidence/measurements/instruments-2026-10-22.md:313`). Its widened pilot also covered every mode, additional views and a second language (`W/scenarios.mjs:1281–1287`). VH-198’s minimum pilot of one language and three modes does not explicitly preserve that achieved breadth.

There is a concrete false-pass path in carried wording assertions. `M.matches` ignores placeholder values and accepts any matching leaf (`W/scenarios.mjs:26`). S-31 uses it for `status.storageWayOut` (`:449`). The current template contains `{smaller}` (`src/i18n/en-GB.ts:431`), so the assertion can pass with the old preset name—or nonsense—in precisely the part VH-188 changed.

Other additions need equally specific checks:

- The AX summary omits heading level (`W/qualify.mjs:450–469`); an inventory of headings cannot establish the footer’s `h2`/`h3` hierarchy.
- `heavy-193.mjs:84–88` searches accumulated live-region history for the heavy-warning heading. That does not establish the current completion announcement, both warnings, or their order.
- A fault must prove it reached its intended production branch. An encoder failure during pre-flight is not evidence for a closing failure during production.

**Smallest change:** explicitly rerun the complete existing proof suites and widened pilot, then add positive and negative fixtures for the changed assertions. Pin composed wording—including substituted preset names—to approved expectations; reject an old-name mutation. Retain AX heading levels and test a wrong-level mutation. Scope warning assertions to the relevant transition interval. Require each new fault to report that its intended branch was reached.

### P-06 Measure individual native controls and correct the keyboard route — must

The proposed player failure is not enough to validate the claimed measurements.

`Q.focused` records `document.activeElement` (`W/qualify.mjs:70`). As the draft recognizes, that remains the `<video>` while focus moves among native controls. Counting repeated host observations cannot prove which controls were visited, whether one was skipped, or whether seeking works. The target instrument traverses light DOM and includes the whole `<video>` (`:129–170`), so a large player rectangle can pass while its actual control targets remain unmeasured. The generic unnamed-interactive check also excludes the video host’s role (`:443`, `:475`).

There is an outright route error: K-player expects Shift+Tab to return to the result card (`P3/scenarios:364–375`), but that card has `tabIndex = -1` (`src/main.ts:3277`). Programmatic focus on completion does not make it a normal backwards Tab stop.

**Smallest change:** make the pilot establish and record the native control inventory and actual forward/backward route. Use focused AX-node identity and observable action results where available; prove play/pause and seek separately. Correct the return destination without adding a product tab stop. Distinguish tests that deliberately place focus from journeys that reach it using keys.

Qualify missing host name and missing/unreachable controls independently, with a passing counterpart. For focus pixels, hold playback and surrounding paint steady so changing video frames cannot masquerade as a ring. Report control measurements separately from the host rectangle; apply the recorded user-agent exceptions where appropriate, and retain “cannot determine” where necessary.

Similarly, S-117 and S-122 should distinguish programmatic relabel/focus-preservation checks from a person changing Page language by keyboard: that action necessarily moves focus to the Page language control (`P3/scenarios:141`, `146`).

### P-07 Correct three contradictory contract invariants — must

These are small textual repairs with significant effects on what the walker will assert:

| Draft statement | Why it is wrong | Required correction |
| --- | --- | --- |
| Each Page-key press starts another check (`P3/contract:26`, `91–93`; scenarios S-92/S-93). | `commitTrim` withdraws the verdict and cancels superseded work immediately, but debounces the new pre-flight until input settles (`src/main.ts:1878–1912`). | Assert immediate invalidation, updated values and stoppability; then one check for the settled range, with stale work unable to win. |
| On a passing load **and** while pending, step 1 says “Checking…” (`contract:30`). | This merges the pending state with the settled passing state. | Give pending and settled-pass separate expectations. |
| One player URL is revoked once, “on Discard” (`contract:35`). | The same row correctly says completed saving revokes it too. `releaseResultPlayer` serves both paths (`src/main.ts:2890–2904`, `3440–3452`). | Say one URL per retained result, preserved across rerenders and revoked once on release; enumerate successful save and discard/replacement paths. |

Do not change the application to satisfy these draft errors.

### P-08 Preserve the distinctions in the four lenses — should

The lenses are mostly carried correctly, but three details should be explicit:

- The weighted CJK count is the house measure rule. `UI-STANDARDS.md:208–215` separately identifies G204’s reflow mechanism for 1.4.8. Keep raw counts, the house-rule result and the criterion’s mechanism evidence distinct (`P3/plan:234–236`).
- “The user’s own video, never autoplayed” is not a passing argument for media accessibility. Spec §9.3 explicitly records non-conformance for player content, includes **2.3.1–2.3.2**, and distinguishes the generated cards (`docs/01-specification.md:740–747`). Carry that scope and accepted limitation into the player analysis; neither silent cards nor no autoplay establishes captions, alternatives or flash safety.
- Phase 7 compared density with both 20 October and its starting build (`P2/plan:144–149`). P3 names only Phase 7’s after-run (`P3/plan:214–217`). Restore the older contextual comparator from retained measurements, without turning page height into a target.

**Smallest change:** add these distinctions to the lens paragraph and resulting evidence-table columns. No standard or settled decision needs reopening.

### P-09 Make the person checks reproducible and preserve the full inherited checklist — must

The new topics are appropriate, but “watch the finished video,” “understand the warning” and “trim a long video” are headings for tasks, not yet reproducible checks (`P3/plan:314–324`). Ordinary speech clips may never produce the warning; the inherited five-minute clip never exercises a Page step above the ten-second floor.

The summary also names only 200% enlargement. The inherited checklist includes 400%, a very large default font, and separate owner checks including Firefox’s trim handles (`P2/person-checklist:66–70`, `132–137`). Linking the old checklist is useful, but the revised checklist must explicitly preserve those tasks while updating its obsolete labels and contact instructions.

**Smallest change:** require the revised sheet to include supplied, identified clips and short expected outcomes:

- A one-hour trim fixture: one Page Up moves 36 seconds; ordinary arrows still move one second.
- A warning-producing clip: the warning is heard with completion even when routine progress announcements are off; ask the person to explain what they would do next.
- The finished player: identify original versus finished video, play/pause/seek, then save while focus is in its controls; check where focus lands and where the next Tab goes.
- Page language versus Video language, including finding Video language with the title card off and on a student submission, and understanding its temporary lock.
- Choose an output for a stated purpose; distinguish Create again from creating a different chosen file.
- Find the appropriate staff/student help route and open Report a problem from both entrances, checking focus return.

Keep the report fields for assistance needed and confusing or tiring steps. Say “open the prepared email” separately from actually sending it; reaching a hand-off is not proof of delivery.

### P-10 Reconcile the plan with recorded authority and the approved sheet — must

The simplicity rule is correctly retained, including the progress bar and truthful reporting of unmet criteria. Its history is incomplete: `P3/plan:35–38` says Phase 8 added two elements by permission, omitting the approved footer headings and new Self Service link in the wording sheet (`phase-8-wording-sheet-2026-10-24.md:75–76`). That can make authorized work appear to violate the rule.

The four prescribed approval stops (`P3/plan:361–365`) also ignore the owner’s later instruction recorded in `project/items/VH-197.md:36`: “please go gateless where possible, you have my permission to use your recommendations.”

**Smallest change:** list the approved additions accurately and distinguish standing implementation authority from decisions genuinely reserved to the owner, such as a proposed coverage reduction, a contested remedy or a new element. Retain quality gates and independent checks; remove routine requests to approve work already delegated. Keep the Colours proposal outside the authorized remedies.

Record any changed obligation through the normal decision/item/wish-list links. Correct the checkpoint note’s “seventeen rows” to **eighteen**. The record currently passes its structural and budget checker, but the spec is exactly 8,100/8,100 words and UI-STANDARDS is 2,393/2,400; these plan repairs belong principally in the review bundle and item records, not appended to protected documents.

### What is right

- The seven review stages, separate fix items and final close reproduce Phase 7’s structure. Blind review, method review, report critique, fix-plan critique, individual checks and integrated verification remain appropriately separated.
- The disagreement rule preserves both positions, distinguishes fact from judgement and blocks only the contested remedy.
- The contract covers all fourteen Phase 8 items and VH-178–VH-181. Most neighbours are well chosen: saved versus previous results, player lifetime, language locks, shared toggletip listeners, changed footer routes and file-button position.
- The draft correctly catches consequential setup changes, especially F4e’s collision with the player’s new object URL, and distinguishes a synthetic playback error from a real `MediaError`.
- Proxy enlargement, DOM exposure versus actual speech, native-language review, unresolved native behaviour and outstanding person evidence are generally described honestly.
- `node tools/check.mjs` reports **zero structural/budget failures and zero warnings**. No files were changed. I did not run the full application gate or browser matrix.

### What I would ask the owner

Nothing is needed to make these revisions. The record already settles the product choices and supplies standing authority for routine recommendations.

If the counted, timed matrix still requires reducing explicitly required coverage, bring the owner one concrete proposal: the exact omitted cells and assertions, the risk, and the time saved. Do not ask them to approve an unspecified “smaller but equivalent” pass.