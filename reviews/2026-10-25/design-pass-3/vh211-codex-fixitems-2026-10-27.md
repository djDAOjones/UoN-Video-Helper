<!-- markdownlint-disable -->
<!-- Codex astra's blind fix items for VH-211 (2026-10-27), from vh211-codex-fixitems-brief-2026-10-27.md.txt, run with codex exec -m gpt-6-astra -s read-only at 51a7201 before it saw Claude's plan, verbatim. Its provisional IDs are not the record's. -->

## 1. Fix and check items

Provisional IDs for comparison, based on `51a7201`. No files changed or runtime checks performed.

References below: **R** = `reviews/2026-10-25/design-pass-3`; **M** = `R/evidence/measurements`; **W** = `M/walker`; **A** = `src/styles/app.css`.

**Acceptance criteria belonging to every draft below**, expanded into each eventual item file:

- Measure its specified before and after with the pass’s walker; use matching VH-199 records only where conditions match, otherwise measure the item’s base before editing. Record source/instrument revisions, keys, measurements and captures.
- Fixes use en-GB, zh-Hans and ms-MY; light, dark, forced-light and forced-dark. Re-check the WCAG criteria specified below.
- Use our own CSS and the separate Carbon/brand token files; add no control, checkbox or element; keep the progress bar.
- Update UI-STANDARDS only where its rule changes, within 2,400 words or ask the owner. Any necessary `docs/` correction becomes a wish line and blocks the dependent change.
- Run `npm run check`, deleting/skipping no test, then `node tools/check.mjs`; name the applied digest rules.
- Codex astra checks the final candidate against its base and evidence, from a saved brief, before commit. Repair and re-check failures, retaining verdicts; disagreement leaves the item open for the owner. Commit with `Checked: gpt-6-astra — <verdict> — <scope>`.
- Link finding, item and verification in Disposition; trace wish promotions and retire fulfilled lines.

These carry `project/items/VH-203.md:9–15`. Check items retain walker, WCAG, gate, Codex and Disposition requirements; discovered defects get separately planned fix items before VH-203.

For compactness, **Layout** means WCAG 1.3.1–2, 1.4.3/6/8/10/11/12, 2.4.3/7/12/13 and 2.5.5; **Words** means 2.4.6, 3.1.5, 3.3.1/3 and 4.1.3, plus text wrapping/measure. Digest rules: Carbon spacing/tokens; Nielsen numbers below; WCAG named criteria; house conventions’ streaming and explicit data-loss handling where applicable.

Every item’s **Now**: updated 2026-10-27; next, capture its missing baseline and execute its criteria; open question none except the owner points below. Inline citations provide **Context and sources**; schema: `project/items/_schema.md:14–38`.

**VH-212 — Help buttons show their open state.**  
Intent: implement both “?” changes within the geometry constraint in part 5. Touch A:1086–1141, 1737; `test/stylesheet.test.ts:268`; contrast pairs at `test/contrast.test.ts:110`. Acceptance: S-17, S-95–98, S-113, S-141–144; widths 1280/640/401/400/375/320, default and 32 px fonts; rest/hover/focus/open/pressed. Layout, 1.4.13, 2.1.1–2, 4.1.2; Carbon tokens, Nielsen 4/6. Walker: qualify pseudo-target geometry and combined font/colour cases, explicitly carrying VH-205.1. **25k**.

**VH-213 — System-check values stop crushing labels.**  
Intent: stack the existing value beneath its label when columns cannot fit. Touch A:300–331; retain DOM order and words. Acceptance: S-82/S-103, pending/pass/warn/fail, variable worker timings; 1280/375/320, default/32 px and spacing. No mid-word splitting where the whole word fits a full row. Layout; Carbon spacing, Nielsen 4. Walker: deterministic worker-value widths. Evidence: `reviews/2026-10-24/vh186-words-2026-10-24.md:14–29`. **25k**.

**VH-214 — Enlarged closing selects remain readable.**  
Intent: reclaim horizontal space without shrinking text or replacing selects. Touch A:223–250, 962–1082; `index.html:442–470`. Acceptance: S-111–113, every option, Cut/Fade/Slide/None, both types; six widths used by VH-212, default/32 px and spacing. Measure option ink against usable width, keyboard names, targets and rings. Proposed narrow treatment: full-width fields, smaller token gutters, existing arrow above the text lane. English needs 304 px; merely stacking fields cannot suffice (`reviews/2026-10-24/vh189-labels-2026-10-25.md:54–58`). Layout; Carbon spacing, Nielsen 6. Walker: reuse qualified combined modes. **40k**.

**VH-215 — Choose a video enters the first screen.**  
Intent: resolve both V-18 cases using part 3’s approved arrangement. Touch `index.html:35–157`, `src/main.ts:3722`, A:149–179/223–250. Acceptance: S-03/S-144p and six `v18__LANG__VIEW` records; 1280×900, 800×600, 375×812, 320×568; painted button wholly visible at the required folds, logical DOM/Tab order, privacy persistent, no hidden promises. Layout; Nielsen 6/8. Walker: record constituent heights and painted bounds. **40k; owner remedy first.**

**VH-216 — Measure the content before drawing its running time.**  
Intent: provide a bounded-memory decoded-extent operation for VH-139.5. New `src/media/decoded-extent.ts` and tests, based on `pipeline.ts:608` and `ends-early.ts:148–168`. Acceptance: streamed samples released, cancellation and progress maintained; trimmed/untrimmed, missing tail, legitimate unequal tracks and silent controls distinguished. Walker: S-22/S-23/S-42 variants at 1280/320, retaining pre-change output evidence. Words/status; house streaming, Nielsen 1. **45k**.

**VH-217 — Submission cards state the content actually made.**  
Intent: use VH-216 before card rendering, excluding card/closing seconds. Touch `job.worker.ts:237–257`, `protocol.ts:25–40`, `title-card-step.ts:306–339`, `ui/format.ts:58`, card tests. Acceptance: decode and inspect produced cards; 30-second declared/21-second made case, both presets, closing absent/present, trims and whole-file controls. A mismatch between measured and delivered extent cannot release a falsely labelled output. Same walker matrix as VH-216; Words, house data-loss handling, Nielsen 2/9. Account for extra decoding in timing; spec §7.1 correction requires owner approval. **45k**.

**VH-218 — Whole-file sub-block audio is handled honestly.**  
Intent: settle VH-185.1 without calling audible content absent. S-102 already reaches a loudness refusal (`M/matrix-2026-10-27.md:105`). Recommend an explicit early refusal, preserving the source, rather than silently omitting audio. Touch `audio-plan.ts:115–120/269–285`, `job.worker.ts:534–558/633–652`, failure strings/tests. Acceptance: S-102 plus absent, zero-decoded, just-under/exact/over-block controls; decoded duration, not padded silence, decides; VH-206 trimmed behaviour remains intact. 1280/320; Words, Nielsen 1/9, house data loss. Walker: strengthen S-102’s observational predicate. **40k**.

**VH-219 — Resolve the QuickTime stall report.**  
Intent: verify VH-193.3 before inventing a repair. S-140/S-140n already describe refusal before Create (`W/scenarios.mjs:2361–2380`). Acceptance: original sample and N13, three languages, 1280/320, matched logs and bounded outcome; prove refusal/recovery and compare the historical stall. Touch those scenarios/evidence; product repair only if reproduced, scoped separately if substantial. Read `inspect.ts:167`, `core/watchdog.ts:25`. Words, keyboard/focus; Nielsen 1/9. **25k**.

**VH-220 — Playback advice includes a usable fallback.**  
Intent: replace only the advice clause in the existing limiting warning, as part 4; no listener or element needed. Touch the three `warnings.heavyLimiting.detail` entries, sheet and warning tests. Acceptance: S-131/S-132/S-135–138/S-151/S-152 at 1280/320; advice true with failed playback and retained/saved results, exposed by VH-208’s completion announcement. Words; Nielsen 9/10. Walker expectations follow approved words; F15b remains incompatible with download injection (`W/faults.mjs:230–234`). **25k; owner words first.**

**VH-221 — Job, recovery and translated status checks.**  
Covers VH-150.3/VH-153.1 (`project/wish-list.md:44–45`). Acceptance: all six VH-150 states (`project/items/VH-150.md:48–54`), plus every listed translated row. Use S-01/02/30/31/48/62/66–69/74/90a–b/114/138 and Set-button variants, 1280/375, all languages/modes. Explicitly add persistent storage-recheck failure, second-job progress reset and save-picker file-kind capture; do not count a stub as native-dialog evidence. Record removed browser sentences as superseded by `system-check.ts:71–73`. Touch W scenarios/faults and evidence. Layout/Words; Nielsen 1/4/9. **45k**.

**VH-222 — Warning and failure wording checks.**  
Covers VH-155.2/VH-156.1/VH-158.1 (`wish-list.md:46–48`). Acceptance: every listed row, not merely matching scenario counts; S-18–27/56/62/64/79a–b/82/89/91 and named audio-only, unlevellable and cut-WebM variants. Chinese/Malay plus English controls, 1280/375/320, four modes. Read source facts, warning and finished record together. Touch W scenarios/faults/evidence; Layout/Words, Nielsen 2/9. **45k**.

**VH-223–227 — Read the five remaining matrix batches.**  
Each is a separate check item with part 6’s exact key rule, its inherited scenario assertions, language/view/mode settings and all declared instruments (`W/matrix.mjs:92–147`). Before: explicitly “no previous after-reading”, with earlier evidence linked where available. After: final-build record plus human-readable judgement for every key. Touch manifests/evidence; Layout/Words and reduced-motion criteria where applicable; Carbon, Nielsen 1/4/6/9. **30–40k each**.

**VH-228 — Qualify the already-required after-run repairs.**  
Extract VH-203’s existing instrument prerequisite, not new E work: VH-199.1/VH-200.1/VH-205.1 (`wish-list.md:66–68`). Touch named W files; qualify routing, counters, player timing, target/ring readings and focus ordering. Keep old/new instrument evidence distinct; Codex method check before use. **40k**.

## 2. Order

206 → 207 → 208 → 218 → 219 → 216 → 217 → 220 → 209 → 213 → 214 → 212 → 215 → 210 → 228 → 221 → 222 → 223–227 → 203.

VH-206 stays first; existing relative order remains. Media/text precede layout; VH-210 measures final geometry. Owner-dependent work need not block independent items.

Update VH-209:10 to route selects to VH-214; VH-210:25 to follow all geometry changes; VH-208:13 to link VH-220; VH-203:26/38–40 to name dependencies. Grouping isolates expensive media work and shared CSS verification.

## 3. V-18

Recorded minimum rises are **426/521/763 px** at 320×568 and **34 px** for Malay at 1280×900 (`R/design-pass-3-2026-10-27.md:405–417`). Subtracting VH-205’s approximately 20 px gives **406/501/743 and 14 px**, estimates only.

Spacing alone cannot plausibly recover 743 px. Shorter translations alone cannot promise it either. Recommend moving existing promises, translation notice and video-type group below the chooser on the narrow layout, retaining heading and privacy above it; use actual DOM order, not visual ordering. No new element. This needs the owner’s layout decision and a wish correcting “above the steps” in `docs/01-specification.md:585`.

For desktop Malay, first test a 24 px token-based reduction in top/lede spacing; A:228/234 currently provides 32 px in each place. Preserve the six-case baseline and measure, rather than assuming the inferred 14 px.

## 4. F15b’s words

“Before you save” gives an unavailable action under F15b. Words live at `src/i18n/en-GB.ts:722`, `zh-Hans.ts:603`, `ms-MY.ts:643`.

Keep the warning’s cause, consequence and final recording advice; replace its playback instruction with:

- **en-GB:** “Try playing the new video here to check its audio. If it will not play, save it and open the saved file to check its audio before you share it.”
- **zh-Hans, draft:** “请先尝试在此处播放新视频，检查音频。如果无法播放，请保存视频，再打开保存的文件检查音频，然后再分享。”
- **ms-MY, draft:** “Cuba mainkan video baharu di sini untuk menyemak audionya. Jika video tidak dapat dimainkan, simpan video itu dan buka fail yang disimpan untuk menyemak audionya sebelum berkongsi.”

## 5. The “?”

A:1124 uses `--spacing-04`: **12 px**, plus collapsed inline whitespace (`tokens.carbon.css:35`; `index.html:54–56`), explaining approximately 16 px visually.

The centred target protrudes **(44−20)/2 = 12 px**. A true 8 px gap overlaps the text box by 4 px. With target geometry fixed, recommend `--spacing-03` margin: 8 px CSS plus whitespace, approximately 12 px visible; verify glyph bounds and hit-testing. Exact 8 px and an untouched centred target are incompatible.

Open state uses `--interactive`/`--text-on-interactive`, hover/active counterparts, with selectors overriding secondary hover. Dark mode follows the selected segment’s reversed palette. Calculated token contrasts: light **15.41/8.17/11.35:1**, dark **14.31/10.32/12.66:1** (`tokens.brand.css:41–67/119–129/167–175`). Forced colours: Highlight/HighlightText, explicit opt-out, CanvasText focus, border-only hover, inverted press (A:1756–1798). Keep `aria-expanded` and revealed content.

## 6. VH-172.1 batches

Apply only to `M/unrun-2026-10-27.json.stillUnrun`:

| Item | Exclusive rule | Count |
|---|---|---:|
| 223 | view `w375` | 42 |
| 224 | view `landscape` or `short` | 48 |
| 225 | view `zoom200proxy` or `zoom400proxy` | 42 |
| 226 | mode `spacing` or `reduced-motion` | 44 |
| 227 | remaining fallback/font32/dark/forced keys | 38 |

The file contains 214 unique keys. Assert pairwise-disjoint batches, union equality, zero extras/missing keys, and exactly one accepted reviewed record per key. Retried attempts remain traceable. Device-scale uncertainty remains uncertainty (`M/matrix-2026-10-27.md:73–87`).

## 7. B and VH-203

**Stand alone.** After extracting qualification to VH-228, budget VH-203 at **45–50k**: run/manifest reconciliation 12k, changed-measurement and contract reading 15k, integrated Codex review/repairs 15k, close 8k. These are estimates, not measured token usage.

Its existing 3,219 records plus 48 transitions, added fix variants and owner captures remain required (`M/matrix-2026-10-27.md:33`; `VH-203.md:16–20`). B would exceed this envelope.

## 8. Risks

VH-216/217 split the largest architectural change; extra decoding affects estimates and watchdog/progress behaviour. CSS items share A; media items share worker code: serial writers and rebased baselines are essential. Native select fit is especially tight; no font reduction counts as resolution. Any over-budget repair becomes a separately scoped item before VH-203, never silently absorbed. Protected-spec stops apply to VH-215/217.

## 9. For the owner

- Approve the narrow chooser-first arrangement and corresponding §9.1 wish; recommend moving existing content rather than hiding it.
- Approve F15b’s three advice drafts.
- Resolve the gap conflict: recommend approximately 12 px visible, preserving the centred 44 px target.
- Approve a narrowly drafted §7.1 correction accounting for Submission’s extra extent measurement before VH-217 integrates it.

| Item | Pieces | Principal files | Work | Order |
|---|---|---|---:|---:|
| 206–208 | Existing fixes | Existing item scopes | Existing | 1–3 |
| 218 | VH-185.1 | audio-plan, worker, strings | 40k | 4 |
| 219 | VH-193.3 | W scenarios, evidence | 25k | 5 |
| 216–217 | VH-139.5 | extent helper, worker, cards | 45k each | 6–7 |
| 220 | F15b | i18n, warning tests | 25k | 8 |
| 209 | Existing overflow | A | Existing | 9 |
| 213 | VH-186.1 | A, W | 25k | 10 |
| 214 | VH-189.1 | A, W | 40k | 11 |
| 212 | Both “?” changes | A, CSS tests, W | 25k | 12 |
| 215 | Both V-18 cases | index, main, A | 40k | 13 |
| 210 | Existing rings | A, W | Existing | 14 |
| 228 | Existing qualification | W | 40k | 15 |
| 221 | VH-150.3, VH-153.1 | W, evidence | 45k | 16 |
| 222 | VH-155.2/156.1/158.1 | W, evidence | 45k | 17 |
| 223–227 | All 214 cells | Manifests, evidence | 30–40k each | 18–22 |
| 203 | Integrated after-run | Evidence, Disposition | 45–50k | 23 |