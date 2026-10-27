<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), its critique of the third design pass's merged report (VH-201), 2026-10-27, run in the repository's working tree at 86b1200 with the uncommitted draft, kept as written. Its brief is codex-astra-report-brief-2026-10-27.md. Its line numbers are the draft's, before its musts were applied. -->

Commit after the musts below

References: `B` is `reviews/2026-10-25/design-pass-3/`; `D` is its `design-pass-3-2026-10-27.md`; `M` is `B/evidence/measurements/`. Raw run abbreviations resolve through `M/matrix-2026-10-27.md:20–32`, under `/Users/joe/UoN-Video-Helper-evidence/pass3-vh199/runs/`.

## R-01 Keep the success claims within their evidence — must

**Saw.** “Each state keeps one filled action” is repeated in the Verdict, J1 and What held up (`D:19–20`, `:458–459`, `:512–513`). Running hides Create and shows secondary Cancel; VH-200 explicitly records that exception (`src/main.ts:2224`, `:2395–2400`; `B/judged-2026-10-27.md:368`). Phase 7’s report already said “at most one” and named running’s exception (`reviews/2026-10-22/design-pass-2/design-pass-2-2026-10-23.md:19–21`).

V-52 says the completion line “spoke” its text (`D:257`). The raw record explicitly labels its evidence “exposure, not speech”; actual delivery remains a person’s check (`run-04/S-135__en-GB__w1280__light.json:5060–5062`, `:5302`; `B/wcag-2026-10-27.md:148`).

Finally, “hold in full” includes VH-189 and VH-193 despite V-48 and V-52. Their contract verdicts concern their original musts, not freedom from findings (`D:524–526`; `M/contract-2026-10-27.md:9`, `:22`, `:26`).

**Why it matters.** These sentences turn scoped successes into broader claims contradicted elsewhere in the report.

**Smallest change.** Say “at most one filled action; running shows secondary Cancel”; replace “spoke” with “the completion live-region write contained”; and qualify the item successes as “hold against their original contract musts”.

Also preserve the height attribution’s limits: VH-200 attributes the empty-page change jointly to the lede, Video language’s relocation and the footer, not solely VH-187 and VH-196 (`D:28–31`; `B/judged-2026-10-27.md:105–109`).

## R-02 V-51 needs a truthful remedy throughout the data path — must

**Saw.** The Direction presents the repair as words distinguishing insufficient sound from absent sound, then promises that “keeping more of the original keeps it” (`D:228–235`). But the worker currently reduces every silent result to `analysis = null`; the warning builder then emits the same `no-audio` code (`src/workers/job.worker.ts:534–536`, `:555`; `src/audio/warnings.ts:92`).

The threshold counts decoded source frames, not the length of retained picture or gap-fill. Extending the interval therefore cannot guarantee preserving sound: it must actually include enough additional decoded audio (`src/media/audio-plan.ts:104–120`, `:279–284`).

**Why it matters.** Changing one shared translation cannot make the requested distinction. An unconditional recovery promise could replace one misleading explanation with another.

**Smallest change.** Permit the minimal propagation of the omission reason into the existing warning, retaining the threshold unless the owner changes it. Specify the information the owner’s wording must communicate—cause, output consequence and an applicable recovery—without drafting that wording. Make extending the keep conditional on additional sound being available and sufficient. Preserve genuinely absent-audio behaviour and the separate VH-185.1 disposition (`D:233–236`).

## R-03 V-50’s affected elements are incompletely reported — must

**Saw.** The list names Video language but omits **Page language**, and places overflowing Set buttons only in Chinese at 320 px and Malay at 401 px (`D:398–402`). The raw records additionally show:

- Page language’s Malay option beyond 320 px, separately from Video language (`run-05/S-113__ms-MY__w320__font32.json:137–142`, `:197–202`).
- Both Set buttons beyond 320 px in Malay **and English** (`run-05/S-113__ms-MY__w320__font32.json:174–187`; `run-05/S-113__en-GB__w320__font32.json:175–188`).
- The Malay closing-colour choice and statement heading beyond 401 px; the heading reaches 448 px (`run-05/S-113__ms-MY__w401__font32.json:152–181`).

**Why it matters.** Correcting 520 to 528 did not finish correcting the grouped digest’s omissions. A fix aimed only at the listed controls could leave the same page overflowing.

**Smallest change.** Expand Saw and Direction to include these observed elements, retaining one V-50 finding. Require containment of the affected text and controls across all six failing records. CSS remains the proposed route; neither moving switchers nor rewriting the statement follows from this correction. Step 4’s select limitation remains separately identified as VH-189.1 (`D:414–416`).

## R-04 Do not settle a later judgement by citing an earlier one — must

**Saw.** The compare file calls the statement-scope finding “settled as set aside”, invoking my earlier blind review (`B/ranks-compare-2026-10-27.md:15`). That earlier position was indeed to retain VH-192.1 without a new identity. My later blind ranking explicitly classified the omission as a rank-2 documentation finding (`B/codex-astra-blind-review-2026-10-25.md:284`; `B/codex-astra-ranks-2026-10-27.md:36`, `:58`). The report preserves only the earlier disposition (`D:598–600`).

The factual mismatch is established: the public limitation names the preview, while the specification covers both players (`src/i18n/en-GB.ts:904`; `docs/01-specification.md:740–746`). Whether to call that existing debt a finding is judgement. Reserving the wording to the owner does not settle it.

Similarly, V-50’s comparison moves from separately specified enlargement/reflow conditions to “no named standard is breached” as a settled fact (`B/ranks-compare-2026-10-27.md:24`). That supports withholding a standalone WCAG failure; it does not settle the rank rubric’s independent “real friction” ground (`B/codex-astra-ranks-2026-10-27.md:24`; `B/codex-astra-ranks-brief-2026-10-27.md:33`).

**Smallest change.** Preserve both statement-scope positions under For the owner. I accept **no duplicate V-ID**: VH-192.1 can own the rank-2 documentation debt, with wording still reserved to VH-137. Replace V-50’s universal standards acquittal with the narrower WCAG conclusion and keep its rank contested. This follows VH-201’s disagreement criterion (`project/items/VH-201.md:12`).

## R-05 Carry forward the remaining visual evidence gaps and method limits — must

**Saw.** The principal required gaps survive at `D:129–162`, but How it was done omits several limitations VH-200 expressly records:

- No refreshed spacing inventory, including Video language’s gap and the player’s rendered gap (`B/judged-2026-10-27.md:354–369`).
- No per-role coverage tally establishing which roles were drawn, including diagnostics’ code role (`B/judged-2026-10-27.md:407–410`).
- Unread chosen/unchosen segment widths and the player’s letterbox under forced colours (`B/judged-2026-10-27.md:468–470`, `:505–508`).
- Unmeasured warning position, an unattributed extra 21 px in English ready states, and the unreported widest Latin line (`B/judged-2026-10-27.md:109`, `:200–203`, `:434–435`).

The matrix also preserves power/load differences, the visible-page comparison-method change and the desktop signal at 375 px; these qualifications disappear from the merged methodology (`M/matrix-2026-10-27.md:68–71`).

**Why it matters.** The merged report is the handoff to VH-203. Linking the judgement does not make its missing readings visible in a supposedly consolidated unresolved list.

**Smallest change.** Add a compact, linked group of these unresolved readings and their disposition, retaining VH-173.1 for the existing role-coverage work (`project/wish-list.md:50`). Carry the gaps forward without inventing passes or silently expanding the agreed run.

Also distinguish **3,267 planned** from **3,255 observed**, including transitions (`D:106–109`; `M/matrix-2026-10-27.md:33`); state that keyboard routes ran in light mode (`M/digest-keys-2026-10-27.md:15–18`); and preserve VH-205’s limited manual target evidence—two hit points at 1024 px in light—alongside “to be measured”, rather than dropping that label (`D:139–143`; `B/vh205-compare-2026-10-27.md:7`).

## What held up

The substantive blind merge is sound:

| Finding | Assessment |
|---|---|
| **D-05 → V-51** | Verified in source: the threshold includes real generated sound, and the pipeline adds audio only with a plan (`src/media/audio-plan.ts:120`; `src/media/sub-block-sound.test.ts:61–70`; `src/media/pipeline.ts:536–539`). S-99’s retained AX capture contains the cited notice at array entries 538–539 (`run-09/captures/S-99__en-GB__w1280__light__ax.json:1`). It does not measure audible sound removed. Rank 1 and Nielsen 1/2/9 are appropriate; keep its own ID. |
| **D-06 → V-52** | Source and S-135 establish the warning after the player/Save and the headings-only completion write (`src/main.ts:3285`, `:3327`, `:3497`; `src/ui/announce.ts:42`; `run-04/S-135__en-GB__w1280__light.json:5062`). Rank 2, Nielsen 5/6 and the existing-content remedy stand. No 3.3.3 failure is established. |
| **V-46 → V-46, regressed** | S-149 records body focus; both failure paths omit the handoff (`run-04/S-149__en-GB__w1280__light.json:2375–2400`; `src/main.ts:1486`, `:1500`). Video language was outside the steps before VH-191 (`ec26c49:index.html:88`). “Regressed” describes the newly affected radios; “VH-178 omission” correctly describes the older mechanism. Rank 2, 2.4.3 and the proposed handoff are appropriate. J4 remains unmeasured (`D:298–309`). |
| **V-48 and V-49** | The measured shortfalls support rank 2 under 2.4.13 (`M/digest-focus-2026-10-27.md:34–35`). Investigation/spacing changes using existing tokens are suitably small, subject to measuring repaired area and contrast (`D:333–336`, `:354–357`). |
| **V-18** | The recorded coordinates, incomplete status and rank 2 stand. HEAD’s estimated improvement remains explicitly unmeasured, and structure remains the owner’s (`M/readings-2026-10-27/rings-179-v18.json:13–14`, `:55–56`; `D:375–386`). |

All eighteen contract verdicts and their held-row destinations match the retained contract: 12 hold, five partial, one regressed (`D:431–450`; `M/contract-2026-10-27.md:15–32`). The WCAG counts faithfully reproduce the scoped table, including both defects and eleven missing-evidence criteria (`D:487–508`; `B/wcag-2026-10-27.md:154–161`).

The four accepted gaps, all 823 finish+1s rows, VH-200.1’s three readings, contrast gaps, unread output tracks and V-46’s J4 case remain explicit. The instrument-limited radio, wrapped-link and player-ring readings are appropriately withheld from page-defect findings (`D:129–151`, `:542–554`).

The applied digest rules are truthful status/recovery, rendered focus area and contrast, and token-based component review (`project/digests/nielsen.md:17–34`; `project/digests/wcag-2.2-aaa.md:27–31`; `project/digests/carbon.md:36–49`).

## For the owner

- **V-50:** I retain rank 2 for real friction; Claude retains rank 3, which would make its repair a proposal rather than planned work (`D:618–624`).
- **Failed-playback guidance:** I retain rank 2 for advice that cannot be followed in the observed fault state; Claude considers the deliberately induced state insufficient for a finding (`D:625–631`; `B/codex-astra-ranks-2026-10-27.md:32`).
- **Statement scope:** I retain rank-2 documentation debt under existing VH-192.1, with no duplicate finding ID and no drafted wording; Claude sets it aside from the findings (`B/codex-astra-ranks-2026-10-27.md:36`; `B/ranks-compare-2026-10-27.md:15`; `project/wish-list.md:58`).