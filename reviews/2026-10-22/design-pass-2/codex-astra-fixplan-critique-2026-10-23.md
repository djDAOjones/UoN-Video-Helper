<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), critique of the second design pass's fix plan (VH-175, PLAN-7 touchpoint 5), 2026-10-23, at main 6278fd2 with the draft fix-plan-2026-10-23.md, VH-178 to VH-180 and their backlog lines uncommitted, kept as written. Its brief is codex-astra-fixplan-brief-2026-10-23.md; what was applied, refused or sent to the owner is in fix-plan-2026-10-23.md, "After Codex astra's critique". -->

Approve after the musts below

References use **Plan** for `reviews/2026-10-22/design-pass-2/fix-plan-2026-10-23.md`, **Report** for that directory’s `design-pass-2-2026-10-23.md`, and **M/** for its `evidence/measurements/` directory. This review checked source and retained evidence, without changing files or rerunning the browser matrix.

## F-01 VH-178 cannot meet its ring criterion before VH-179 — must

**Rank 2.** VH-178 requires the blocked-check transition to focus the file input, then requires the destination’s ring to meet 2.4.13 (`project/items/VH-178.md:10`, `:13`). But VH-179 owns the repair of that ring, which currently fails every one of its 110 measured records (`project/items/VH-179.md:9`; `M/digest-focus-2026-10-23.md:26`). VH-179 cannot start until VH-178 ships (`project/items/VH-179.md:23`).

That makes the proposed order impossible under the written acceptance criteria. Moving focus correctly does not repair the destination’s CSS.

**Smallest change:** keep VH-178 first, but distinguish its focus-transfer acceptance from the existing V-40 failure. Its evidence should record the destination and the still-failing chooser ring, explicitly assigned to VH-179. Add the blocked-check hand-off to VH-179’s verification, then repeat it in VH-176’s integrated check. This preserves the report’s separation between V-46’s behaviour and V-40’s appearance (`Report:196–206`, `:245–254`).

## F-02 The words can move the chooser after its position has been approved — must

**Rank 2.** The plan calls VH-179 “the one change that can move layout” and treats its result as “the final geometry” (`Plan:33–39`). VH-180 also changes `videoKind.result`, which appears **above** the chooser (`src/i18n/zh-Hans.ts:57–58`; `src/i18n/ms-MY.ts:64–65`; `index.html:77`, `:113`). Replacing 结尾图形 with 结尾品牌标识 and “grafik penutup” with “penjenamaan penutup” can change wrapping.

V-18’s position check currently belongs only to VH-179. It records all six language/viewport cases, but supplies an explicit stopping condition only for English at 1280 × 900 (`project/items/VH-179.md:14`). The ruling accepts the other cases **as they stand**, and says they must not worsen (`Plan:95–102`).

**Smallest change:** carry the position comparison into VH-180 and VH-176, after the final words are present. State the non-regression condition for every accepted case, alongside the English whole-button condition. Measure the painted button’s bounds, distinguishing them from the input box that VH-179’s padding enlarges (`src/styles/app.css:539–554`). Describe VH-179 as establishing the final **CSS**, not final geometry.

## F-03 The named focus scenario does not verify the transition being fixed — must

**Rank 2.** VH-178 names S-65 and F4b as its concurrent-save proof (`project/items/VH-178.md:11`). Existing S-65 asserts that the check **is still running**; it never asserts the hand-off after that check settles (`M/walker/scenarios.mjs:786–791`). Stock F4b delays each write by 400 ms, whereas the confirming report used 3 seconds per chunk to keep saving active through settlement (`M/walker/faults.mjs:92–98`; `Report:178–184`).

The reader guard also needs a more precise check. S-72 moves focus to Video properties before the operation finishes; it does not exercise focus moving elsewhere **after** the helper captures ownership (`M/walker/scenarios.mjs:850–865`). That distinction matters in the watchdog branch, which captures focus, hides Announce progress, awaits worker settlement, and only then invokes the hand-off (`src/main.ts:3008–3040`, `:3046–3050`).

**Smallest change:** require declared transition variants in the walker, retained for VH-176:

- Assert saving remains active when checking ends, then assert focus reaches Stop saving before any focus-measurement instrument moves it.
- Exercise Announce progress through completion, cancellation, reported failure and watchdog rejection—the two ending branches VH-178 promises to cover.
- Exercise a reader moving elsewhere during the captured-to-settled interval, and the open-dialog guard.
- Assert that ordinary successful checks and recoverable storage blocks leave focus in surviving setup controls. Adding every setup step unconditionally to the shared capture would steal that focus (`src/main.ts:1535`, `:1579–1592`, `:1614`).

These are verification changes, so the plan’s claim that VH-178 lives in `main.ts` alone should also be corrected (`Plan:30–32`). Remove its unsupported assertion that users “start again from the top”: the report expressly limits the evidence to DOM focus reaching `body` (`project/items/VH-178.md:5`; `Report:186–189`).

## F-04 Give the settled rulings concrete record exits — must

**Rank 2.** The plan assigns V-18’s shorter-wording wish and V-43’s statement follow-up to “the orchestrator” without giving either a ledger line (`Plan:84–85`, `:100–101`, `:115–117`). The wish list currently ends with VH-174.1, and Phase 7 contains only the stage and fix items (`project/wish-list.md:58–60`; `project/backlog.md:39–44`). Rule 5 requires actual lines, not promises to write them (`AGENTS.md:30–33`).

The weighted-count ruling also changes the house interpretation, but no item explicitly owns incorporating it into the rule future sessions read. UI-STANDARDS still states the unqualified 80-character/40-CJK wording, while the walker deliberately reports conflicting mixed-script readings as unresolved (`UI-STANDARDS.md:208–215`; `M/walker/qualify.mjs:243–275`). “No fix” is correct for product code; it does not complete the record change (`Plan:64–69`).

**Smallest change:** make these explicit VH-175 close requirements:

- Write and link the two wish/trace lines.
- Record the weighted house interpretation within UI-STANDARDS’ existing budget, keeping G204’s WCAG mechanism separate from the house count.
- Update the report’s Disposition with the seven fix IDs and the settled V-18/V-43/V-44 outcomes; those rows still say “To plan” or await a ruling (`Report:700–709`).
- Carry the interpretation into VH-176’s evidence accounting without turning retained raw “cannot determine” results into purported instrument passes.

This implements the rulings; it does not reopen them.

## F-05 Make VH-180’s inventory and source impact precise — should

**Rank 3.** The prescribed repair is sensible, but several descriptions are narrower than the actual work:

- The fallback references omit the third occurrence at `index.html:454–455`; VH-180 names only `:160` and `:459` (`project/items/VH-180.md:9`).
- Chinese and Malay contain secondary references within the same sentence—“图形会” and “grafik itu”—which a ban on the complete old phrase will not catch (`src/i18n/zh-Hans.ts:58`; `src/i18n/ms-MY.ts:64–65`). They need sentence-level review against the chosen terminology.
- Removing `{rate}` necessarily changes the compiled message from a function to a string. The caller must read `source.outputRate`, not merely call it without an argument (`src/i18n/compile.ts:29–32`, `:125–128`; `src/ui/source-panel.ts:127`). This is already substantially allowed by VH-180, but its conditional wording and the plan’s “string tables alone” claim obscure it (`project/items/VH-180.md:12`; `Plan:23–24`).

**Smallest change:** enumerate all three HTML fallbacks, retain the sentence-by-sentence review, and state the single required call-site adaptation explicitly. Preserve the existing threshold and preset behaviour, as the ruling requires. Include all translator notes, including the separate held-picture note (`src/i18n/sheet.ts:300–305`, `:433`).

## What held up

**Coverage and stage discipline are substantially sound.** All seven findings requiring fixes have an owner: V-46 in VH-178; V-40/V-41/V-42/V-33 in VH-179; V-45/V-47 in VH-180 (`Plan:47–53`). Each item carries the substantive VH-176 requirements: before/after evidence, languages and colour modes, relevant WCAG checks, token discipline, no added elements, the retained progress bar, documentation constraints, the gate, and a review of the final candidate diff with re-checking after repair (`project/items/VH-176.md:9–15`; `project/items/VH-178.md:15`; `project/items/VH-179.md:16`; `project/items/VH-180.md:15`). F-01 concerns whether those criteria can close in the proposed order.

**The CSS remedies follow the demonstrated mechanisms.** The file ring needs 4 px of room from its 2 px width and 2 px offset; the drop zone has 16 px padding at the default root size, so the proposed compensating negative margin is plausible and appropriately subject to measurement (`src/styles/tokens.carbon.css:36`, `:96–97`; `src/styles/app.css:623–625`; `project/items/VH-179.md:9`). The passing twin supports padding, not an inward brand-blue ring (`M/instruments-2026-10-22.md:114–121`; `src/styles/tokens.brand.css:123–125`).

Sizing the thumb’s disc independently of root-font enlargement addresses the fixed-thumb/rem-stop mismatch. Choosing a contrasting system colour on the inset band face addresses both placement and colour. Capping the feedback field with `max-width`, while preserving its yielding width, is the smallest V-33 repair (`src/styles/app.css:1351–1360`, `:1498–1507`, `:1771–1774`; `project/items/VH-179.md:11–13`). At integration, retain the existing checks for thumb ends/near-overlap and keyboard-pressed focus, alongside the newly fixed hand-offs (`reviews/2026-10-22/design-pass-2/plan-2026-10-22.md:133–138`, `:180–184`).

**The neutral frame-rate route works within the ruling.** The current note sees source conformance, while Smaller independently caps the output at 30 fps. Removing the numerical promise and covering repetition or omission avoids needing selected-output data or a repaint (`src/ui/source-panel.ts:118–128`; `src/config/presets.ts:63`, `:220–223`). The planned 45/120 fps checks under both presets, translation parity, and review beside `variesNote` are appropriate (`project/items/VH-180.md:12–14`). The existing reading-level test supplies English evidence only; it is not a comprehension check for all three languages (`test/readability.test.ts:20`, `:30–31`).

**The grouping is workable.** VH-179 is the largest item, but V-33 adds a cap and its existing selector test in the same files. Moving it to VH-180 would split CSS ownership without removing its browser verification (`src/styles/app.css:1435–1439`; `test/stylesheet.test.ts:343–347`; `Plan:21–26`). Keeping VH-179 before VH-180 remains sensible once F-01 and F-02 are addressed.

**The structural record passes.** The item headings, sections and Now fields follow the schema, and the backlog lines have the required dates and provenance (`project/items/_schema.md:13–56`; `project/backlog.md:40–42`). I ran `node tools/check.mjs`: **0 structural or budget failures, 0 warnings**; backlog 838/1,000 words and UI-STANDARDS 2,400/2,400. This is not a full-gate or browser-verification claim. VH-175 still requires the saved critique’s disposition, the owner’s approval record, the PLAN-7 Items line, generated view and gate before close (`project/items/VH-175.md:11–14`).

The digest rules applied were rendered focus and presentation evidence, consistent terminology and user control, and token-based component states (`project/digests/wcag-2.2-aaa.md:27–44`; `project/digests/nielsen.md:19–24`; `project/digests/carbon.md:36–45`).

## For the owner

- **V-33’s grouping:** I favour Claude’s placement with VH-179 over the orchestrator’s suggestion to put it with the words, because its implementation and regression test belong to the CSS files VH-179 already owns (`Plan:21–26`; `src/styles/app.css:1435–1439`; `test/stylesheet.test.ts:343–347`).
