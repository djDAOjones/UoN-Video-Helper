<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), method check for the third design pass (VH-198, touchpoint 3), 2026-10-25, run read-only in the repository's working tree holding dbda61f's content, from 23:19 to 23:36, exit 0, kept as written. Its brief is codex-astra-method-brief-2026-10-25.md. -->

Fit after the musts below

Paths are repository-relative: `R/` = `reviews/2026-10-25/design-pass-3/`; `E/` = `R/evidence/measurements/`; `W/` = `E/walker/`; `P7/` = `reviews/2026-10-22/design-pass-2/`.

This was a read-only review of source and saved evidence, with in-memory probes of the verdict logic. I changed no files and did not rerun the browser matrix. The current instrument hash recomputes to `6ed245d297623aec`, matching the pilot. (`W/runner.mjs:180`; `E/pilot-manifest-2026-10-25.json:14`.)

## M-01 Missing or weaker evidence can still produce passes — must

**Saw.** Three remaining paths violate the no-silent-pass rule:

- The runner rejects `pass` with an empty `items` array, but accepts bare `{outcome:"pass"}` and `{outcome:"pass",steps:[]}`. `keysRoute(w, [])` itself returns `pass`. In-memory probes confirmed all three behaviours. Required instrument names are declared, but their expected samples are not validated. (`W/runner.mjs:127–132`; `W/qualify.mjs:589–633`.)
- The limiting reader treats an attached worker with **no matching plan log** as a measured null bite. An unreadable log also becomes null. Consequently, an absent warning passes without a bite measurement. Its “completion interval” begins at job start; a warning earlier in that job can satisfy completion, and an expected metadata-warning title may be absent from the spoken line without failing its ordering check. An in-memory case with an early heavy-warning announcement, a warning-free completion, and missing metadata announcement passed every row. (`W/phase8.mjs:419–424`, `:434–438`, `:460–481`.)
- The new footer reader estimates characters from width divided by average Latin character width—or font size for CJK—and assigns a character-limit pass. This bypasses the qualified rendered-character reader, which already includes footer headings. The heading-level mutation does not qualify this separate estimate. (`W/phase8.mjs:374–377`, `:399–400`; `W/qualify.mjs:246–310`; `W/prove-8.mjs:108–125`.)

**Why it matters.** A whole run can contain an empty route, an unobserved limiting decision, an announcement from the wrong moment, or a character-count verdict unsupported by counted characters. The existing proofs do not challenge these cases: the runner tests empty `items`, and the warning proof rejects an earlier **job**, not an earlier announcement within the current job. (`W/prove.mjs:198–209`; `W/prove-8.mjs:129–159`.)

**Smallest change.** Validate each instrument’s evidence shape and expected subjects, including route steps. Distinguish a logged null bite, an explicitly established no-audio/no-plan path, and missing or unreadable evidence. Bind the announcement assertion to the completion update, allowing its documented event ordering, and require every expected title in order. Reuse the qualified line reader for the footer. Add negative cases and passing twins for these gaps before VH-199.

## M-02 The player’s focus settlement exceeds its qualification — must

**Saw.** The player method has sound foundations: actual AX identities, independent name/reach fixtures, separate play/pause and paused-seek checks, and a held video frame. But the native focus calculation calls **any changed pixel** a visible indicator. Blurring then waiting 250 ms can also change native-control disclosure or paint; pausing the video does not isolate those changes. No planted missing-indicator/distractor fixture qualifies that distinction. (`W/prove-8.mjs:67–81`; `W/phase8.mjs:255–295`.)

The exception test is a selector-text search. It does not establish either complete 2.4.13 exception. Reverse traversal checks the number of stops, not their distinct identities. The volume target remains “cannot determine: no box” although the saved proof records its exposed box as 11 × 48. (`W/phase8.mjs:113–116`, `:180–182`, `:238–242`; `E/player-proof-2026-10-25.json:560–562`.)

**Why it matters.** The settlements need separate, bounded conclusions:

| Criterion | Settlement on this copy |
|---|---|
| **4.1.2** | Host naming and named control inventory are supported. The player’s compact AX rows omit values and states; media `currentTime` is not evidence of an exposed slider value or notification. Preserve relevant AX readings around operations, or leave that portion unverified. (`W/phase8.mjs:103`, `:168–174`, `:255–267`; [WCAG 4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value).) |
| **2.4.7** | Not yet qualified: pixel change does not by itself establish a visible focus indicator. (`W/phase8.mjs:284–296`; [WCAG 2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible).) |
| **2.4.11 / 2.4.12** | Border geometry and ring crops do not establish absence of author-created occlusion. Keep these separate from ring appearance and native-control exceptions. (`W/phase8.mjs:277–295`; [WCAG focus obscuration](https://www.w3.org/TR/WCAG22/#focus-not-obscured-enhanced).) |
| **2.4.13** | A native exception may apply, but establish either an indicator the author cannot adjust, or that both indicator and its background remain unmodified. The selector heuristic establishes neither completely. (`W/phase8.mjs:113–116`, `:295`; [W3C focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).) |
| **2.5.5** | Separating controls from the host is correct. A border box is not necessarily the pointer target; the user-agent-size exception is sound where author-unmodified sizing is established. Measure disclosed controls in their available state, and distinguish unavailable hit-area evidence from unavailable geometry. (`W/phase8.mjs:105–109`, `:175–182`; [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).) |

**Smallest change.** Qualify focus against a missing-indicator case that retains native-control redraw, or record the distinction as unverified. Retain reverse AX identities and compare them with the inventory. Record the volume control’s exposed geometry. State the evidence supporting each native exception separately; leave contested interpretation to VH-200. The current blanket “2.4.7 holds” settlement is premature. (`E/player-proof-2026-10-25.json:561`.)

## M-03 Pin provenance before a run, including its transitions — must

**Saw.** The ordinary pilot manifest contains the required fields, but the runner computes source commit and instrument hash **when writing the final manifest**. Run creation stores neither. Resume checks declaration keys and retains successful records without checking their originating revision; its fixture set starts empty again. A changed instrument can therefore be named over retained older measurements, and fixtures used only before resumption can disappear from the manifest. (`W/runner.mjs:49–64`, `:81–96`, `:221–233`; `W/matrix.mjs:138–148`.)

The transition runner has a weaker evidence contract. Its manifest lacks source commit, observed viewport/scaling, fixture identities and unresolved measurements. It checks visibility but does not validate observed language, mode and viewport. Its `pass` concerns landing/assertions, excluding `ringReading`; the manifest reports only that aggregate. Ring images are optional, with only the focused image retained. (`W/transitions.mjs:89–114`, `:122–139`.)

**Why it matters.** A promise of one revision across parts is not proof that retained records used that revision. Nor does “48 pass” mean 48 satisfactory focus measurements. These are gaps in the plan’s manifest and no-silent-pass requirements. (`R/plan-2026-10-25.md:216–242`; `E/pilot-manifest-2026-10-25.json:170`.)

**Smallest change.** Store source identity, instrument hash and fixture identities at run creation/use; validate them on resume and across parts. Reject changed-revision resumption and retain the original fixture ledger. Give transitions the same identity, observed-state, artifact and unresolved accounting as scenarios. Report transition success and ring verdicts separately, retaining both pixel images where a pixel claim needs them. Add a changed-revision resume proof.

## M-04 Complete the checks the scenario record promises — must

**Saw.** The declarations and execution differ in four material places:

- **N14:** the recipe requires reading packet timing and establishing the under/over-400 ms ranges after priming and frame placement. The proof observes warning presence at two requested ends, but writes `370`, `390` and `410` as constants. It reads the requested range value, not independent decoded-start and snapped-end evidence. That proves a behavioural boundary, not the claimed physical fixture. (`R/scenarios-2026-10-25.md:296–302`; `W/prove-fixtures-8.mjs:85–90`; `E/fixtures-proof-2026-10-25.json:116–129`.)
- **S-132 and S-152:** both promise successful saving after actual playback failure. Their scenario implementations stop at `MediaError` with Save enabled. The fault qualification demonstrates saving separately, but does not fulfil these matrix subresults; J3 uses synthetic F15a. (`R/scenarios-2026-10-25.md:172`, `:192`; `W/scenarios.mjs:2132–2150`, `:2439–2446`, `:2720–2723`; `E/faults-check-2026-10-25.json:218`.)
- **Enlarged operation:** the plan requires content and function, including dialogs and the player. Dialog entry/use/exit at enlargement remains explicitly unresolved. The additional 320 px route is useful reflow evidence, but does not replace default-font, spacing and enlargement operations. (`R/plan-2026-10-25.md:117–122`; `W/matrix.mjs:226–236`; `E/instruments-2026-10-25.md:375–382`.)
- **Blind-review coverage:** S-149 exercises a ProRes preflight block through F14, not the read/inspection-failure branch relevant to the blind review’s V-46/VH-178 observation. This matrix therefore cannot independently rediscover that observation through S-149. (`W/scenarios.mjs:2408–2415`; `R/codex-astra-blind-review-2026-10-25.md:50`.)

**Why it matters.** Traced IDs and matching record counts do not establish the promised branch, recovery or operation.

**Smallest change.** Add actual timing evidence to N14’s qualification, or apply its existing source-only contingency. Capture the failed-player state and then record successful saving as an explicit subresult for S-132/S-152. Qualify representative enlarged dialog operations with a failure/twin. Add the distinct read-failure focus case without replacing S-149 or reducing existing coverage.

## M-05 Treat visibility as a comparison-method change — should

**Saw.** Requiring visible pages and recording the three launch flags is sound. The saved probe demonstrates substantial timer throttling on later hidden pages; the current scenario and transition readers reject hidden pages. (`E/instruments-2026-10-25.md:88–107`; `W/qualify.mjs:416–423`; `W/transitions.mjs:98–100`.)

**Why it matters.** VH-176 remains a useful baseline, but timing, media readiness and interaction-triggered paint were measured under different conditions. A changed measurement cannot automatically be attributed to Phase 8. This particularly matters because VH-199 must explain every difference beside the after-run. (`R/plan-2026-10-25.md:23–25`; `project/items/VH-199.md:11`; `E/phase8-app-proof-2026-10-25.json:15`.)

**Smallest change.** Keep the visible-page method. Record the environmental difference in the comparison ledger; for affected comparisons, use a small matched baseline probe or label attribution unresolved. Static geometry comparisons need not all be discarded.

## Phase 7’s eight musts

“Does not fully hold” distinguishes surviving repairs from incomplete or newly weakened coverage.

| Phase 7 must | Holds on this copy? |
|---|---|
| **M-01 — usable measurements and run validation** (`P7/codex-astra-method-check-2026-10-23.md:8`) | **Does not fully hold.** Empty aggregates, retained exemptions, identity and viewport checks are repaired; missing evidence shapes and empty routes remain accepted. See M-01 above. (`W/runner.mjs:38–45`, `:120–136`.) |
| **M-02 — correct contrast pixels and graphics** (`P7/…method-check-2026-10-23.md:18`) | **Holds within the declared scope.** Glyph isolation, contrasting-border twins, unrounded computed contrast and multiple SVG shapes are qualified; unsupported paint stays unresolved. (`W/qualify.mjs:767–802`; `W/prove.mjs:161–163`, `:175–176`.) |
| **M-03 — raw line counts, editable text and house measure** (`P7/…method-check-2026-10-23.md:30`) | **Does not fully hold.** The main reader now retains spaces, inline runs, editable values and house width; the new footer estimator reintroduces an unsupported character verdict. (`W/qualify.mjs:246–316`; `W/phase8.mjs:374–400`.) |
| **M-04 — enlarged content and function** (`P7/…method-check-2026-10-23.md:40`) | **Does not fully hold.** Internal clipping/spill proofs and distinct enlargement labels hold; representative enlarged dialog operations remain unverified. (`W/prove.mjs:167`, `:174`; `W/matrix.mjs:226–236`.) |
| **M-05 — transition, AX and motion depth** (`P7/…method-check-2026-10-23.md:50`) | **Does not fully hold.** Async keyboard evidence, live exposure, held keys and triggered-motion distinctions are qualified. The new completion interval and native-player conclusions need M-01/M-02. (`W/prove.mjs:168–177`; `W/phase8.mjs:434–481`.) |
| **M-06 — complete scenarios and executable journeys** (`P7/…method-check-2026-10-23.md:62`) | **Does not fully hold.** Carried variants and revised journeys survive, but promised failed-player save subresults are absent. (`R/scenarios-2026-10-25.md:20–30`; `W/scenarios.mjs:2132–2150`, `:2439–2446`.) |
| **M-07 — fixture/fault claims proved** (`P7/…method-check-2026-10-23.md:76`) | **Holds for the original repairs.** The clipping-room pair, clipping fixture, slow-band evidence, F1 deadline and F4b stopping checks are present. N14 is a new qualification gap, identified above. (`W/prove.mjs:172`; `W/fixtures.sh:28`; `E/faults-check-2026-10-25.json:3`, `:99`, `:154`.) |
| **M-08 — durable artifacts and complete unresolved accounting** (`P7/…method-check-2026-10-23.md:89`) | **Does not fully hold.** Ordinary scenario artifacts resist overwriting and unresolved rows are derived from measurements. Resume provenance and transition accounting remain weaker. (`W/runner.mjs:99–107`, `:188–241`; `W/transitions.mjs:114`, `:139`.) |

## What held up

**Proofs: substantial, but not complete qualification.** The saved suites report 77, 8 and 31 proved results, plus 27 passing fault checks. The composed-wording mutation really challenges the substituted old name; the heading mutation retains an `h2` tag while changing its AX level. The player’s name and reachability failures are tested independently, with the unaffected check also required to pass. Those parts of P-05/P-06 are fit. The new native-focus settlement and footer character estimate lack the corresponding negative qualification. (`E/pilot-manifest-2026-10-25.json:1615–1646`; `W/prove-8.mjs:67–81`, `:92–125`; `W/phase8.mjs:284–295`, `:374–400`.)

**Faults: fit for their stated environment.** F15 distinguishes a synthetic event from a real media load error; F16 identifies metadata-carry rejection; F17 reaches the warning branch; F18 identifies production encoding at frame 61 for both throw and callback; F19 records an actual persisted restoration. Revised F4e preserves the player URL before failing saving. The Vite-only scope of F16 and environment-specific BFcache outcome are explicitly bounded. (`E/faults-check-2026-10-25.json:191`, `:218`, `:237`, `:248`, `:283`, `:308`, `:333`, `:364`; `E/player-proof-2026-10-25.json:553–557`.)

**Parts: fit in coverage, with the stated reconciliation.** The in-memory `checkParts()` returns `ok`, no problems and 3,267 records. The accounting is:

| Part | Declared | Assessment |
|---|---:|---|
| 1 | 699 | Preserves baseline keys and merges the wider press lists. |
| 2 | 157 + 48 | Preserves fix verification. The 48 transition records contain 45 distinct cells: three inherited English/light repetitions are explicit. |
| 3 | 2,131 | The −31 is exactly S-104’s FULL recipe. |
| 3b | 216 | +6 S-113 light cells and +26 Chinese/Malay narrow production cells. |
| 4 | 16 | Completes the additional journey/dialog/player routes. |
| **Total** | **3,267** | **3,266 + 32 − 31.** |

The 26 production cells exceed the prose recipe for 3b; they are supplemental coverage arising from the sizing script’s carried-only `HEAVY` set, not missing coverage or a reduction. Retaining them is defensible. The three repeated transition cells are repetitions, not three additional distinct states. (`W/parts.mjs:236–295`; `E/instruments-2026-10-25.md:176–195`.)

**Source-only accounting: S-104 is justified.** N11 demonstrably reads as “10 seconds”; its failure correctly activates S-104’s own contingency. S-154 explicitly lacks a non-finite-estimate fixture and names source tests. The four carried exclusions remain declared rather than silently dropped; VH-194 is correctly document-only. N14’s conditional status still needs M-04. (`E/fixtures-proof-2026-10-25.json:81–86`; `R/scenarios-2026-10-25.md:20–30`, `:122–126`, `:144`, `:193–194`.)

**Manifest: the saved scenario pilot is informative; the VH-199 runner contract is not yet fit.** The pilot records source, hashed instruments, browser/OS and flags, actual views/scaling, hashed fixtures, expected/observed identities and hashes, and unresolved checks. M-03 concerns preserving that evidence through resumption and extending it consistently to transitions. (`E/pilot-manifest-2026-10-25.json:7`, `:14`, `:171`, `:185`, `:259`, `:288`, `:318`, `:695`.)

**Pilot: fit in breadth.** Its 77 records contain Phase 7’s 43-record second pilot plus 34 Phase 8 records; the additional route and transition qualification runs extend that coverage. The S-15 font32 ring reading is a measured candidate for VH-200. T-46.1’s taller focused card is also a real geometry observation, but viewport overflow alone is not a finding under the author-created-obscuration wording of 2.4.11/2.4.12. Neither observation is demonstrated here to be an instrument fault. (`E/instruments-2026-10-25.md:240–254`, `:290–307`, `:384–390`; `E/pilot-digest-2026-10-25.md:247`; [W3C focus obscuration](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html).)

**Blind-review limits remain.** Word-for-word assertions cannot adjudicate the semantic issue behind D-05; ordering warnings among themselves does not assess the action relationship behind D-06. Those need the plan’s source/UX lenses. The distinct V-46/VH-178 branch omission is addressed in M-04, without repeating its product finding. (`R/codex-astra-blind-review-2026-10-25.md:6`, `:30`, `:50`; `W/scenarios.mjs:39`; `W/phase8.mjs:474–481`.)

**VH-193.2: fit as scoped scratch evidence.** N1–N3 exercise real planning with non-finite measurements, including the solver’s single limited-pass stop; N4 separately bounds warning behaviour. L1 forces codec overshoot, verifies remeasurement at the same gain under the lowered ceiling, and compares the resulting bite with fresh real-chain measurements under both ceilings. The saved run reports six passes. This establishes the claimed planning paths, not an actual browser codec’s overshoot. Permanent regression tests remain absent and are already retained under VH-193.2 for VH-202. (`E/vh193-2-bite-probe-2026-10-25.ts.txt:193–252`, `:261–310`; `E/vh193-2-probe-run-2026-10-25.txt:220–223`; `E/vh193-2-paths-2026-10-25.md:44`, `:63–75`; `project/wish-list.md:61`.)

The digest rules applied were measured contrast, keyboard operation, focus obscuration/appearance, target exceptions and text presentation. These method repairs require no new app element and do not alter the progress bar. (`project/digests/wcag-2.2-aaa.md:18–44`, `:55–58`; `R/plan-2026-10-25.md:34–43`.)