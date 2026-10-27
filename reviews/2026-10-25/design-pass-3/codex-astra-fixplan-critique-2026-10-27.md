<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), its critique of pass 3's fix plan before the owner's ask, VH-202, 2026-10-27, run read-only in the working tree at f012bc9 with the draft uncommitted, session 01a17dbc-aa3a-7900-aae2-f5bce31c2b2b, exit 0, kept as written. Its brief is codex-astra-fixplan-critique-brief-2026-10-27.md. Its line references to the draft are to the draft it read, before its points were applied. -->

Approve after the musts below

References: **Plan** = `reviews/2026-10-25/design-pass-3/fix-plan-2026-10-27.md`; **Report** = that directory’s `design-pass-3-2026-10-27.md`; **W/** = its `evidence/measurements/walker/`; **Items/** = `project/items/`.

Read-only review of `main` at `f012bc9` plus the draft. I inspected `git status` and `git diff`; no files changed.

## P-01 VH-207 captures after some promised controls have already lost focus — must

**Rank 2.** VH-207 promises recovery from trim controls and preservation of focus on a standing Save (`Items/VH-207.md:9–11`). Capturing immediately before `clearTrim('unreadable')` cannot fulfil both promises.

Selection already calls `clearTrim('reading')`, which disables the trim fields, before awaiting inspection (`src/main.ts:1432`, `:1765`, `:2462–2469`). It also calls `renderResult(unsavedResult)`, which creates another Save button and replaces the result’s DOM (`src/main.ts:1443–1444`, `:3292`, `:3327`). Keeping step 6 visible does not preserve the focused Save element.

**Smallest change:** distinguish focus held before replacement from focus acquired while inspection is pending. Amend the item to capture before the relevant disabling or replacement, preserve the surviving result’s logical focus, and retain the capture before withdrawal for later focus. Require variants for both timings, including the trim and standing Save, with the existing reader/dialog guards.

Also replace “the walker’s existing fault” with a named inspection-failure variant: F14 holds `preflighted` replies, while F11 drops messages only after processing starts; neither supplies the promised inspection timeout (`Items/VH-207.md:12`; `W/faults.mjs:190–220`).

## P-02 The promised measurement matrix needs new baselines and combined modes — must

**Rank 2.** The items repeatedly identify VH-199 as their before-evidence (`Items/VH-206.md:15`; `VH-207.md:15`; `VH-209.md:15`; `VH-210.md:13`). That evidence expressly lacks the audible-sliver walk, output-track reading, J4 failure case and V-18 at HEAD (`Report:156–163`). S-149’s read-failure subresult runs only in light mode (`W/scenarios.mjs:1632–1635`).

Moreover, the walker makes `font32` light and unforced; selecting dark or forced colours resets the font to 16 px (`W/qualify.mjs:995–1007`). Merely running the existing modes cannot establish VH-209’s and VH-210’s promised 32 px results in all four colour conditions.

VH-209 also compares the chooser against “VH-203’s reading at HEAD”, although VH-203 follows the CSS change (`Items/VH-209.md:12`; `Plan:47–53`). That is not a fixed before.

**Smallest change:** require missing before-cells on each item’s named base, retain inherited evidence only for matching conditions, and declare and qualify the combined font/colour cells. Assign these verification changes explicitly, preserving CSS-only product remedies. Capture V-18’s six painted-button bounds before the CSS work; compare after it, then repeat at VH-203.

## P-03 The warning walkers still encode the old behaviour — must

**Rank 2.** VH-206 lists S-99 without owning its required walker change (`Items/VH-206.md:15`; `Plan:58–69`). S-99’s state and wait both require `warnings.noAudio.heading`, which must remain the absent-track wording. The corrected kept-part message therefore makes that wait time out. S-101 and S-153 also check only for the old heading, so their negative checks would miss an incorrectly displayed new warning (`W/scenarios.mjs:1777–1778`, `:1799–1802`, `:2569–2574`).

VH-208 correctly owns `warnBox`, but the completion checker tests warning **titles**, not the newly required detail; its qualification fixture explicitly passes heading-only completion text (`Items/VH-208.md:10–11`; `W/phase8.mjs:833–847`; `W/prove-8.mjs:159`).

**Smallest change:** make VH-206 own the affected scenario predicates, waits and declarations, preserving S-20’s absent-track check. Add the promised zero-decoded keep and declared-but-undelivered contrast to its explicit tests; neither appears in its test inventory (`Items/VH-206.md:9`, `:12`, `:15`; `src/audio/warnings.ts:90–92`).

For VH-208, require the completion assertion and qualification fixtures to reject heading-only speech and accept the full existing detail, alongside updating `src/ui/announce.test.ts:31–35`. Keep exposure distinct from actual screen-reader speech.

## P-04 The written dependencies prevent VH-207 from leading when words wait — must

**Rank 2.** The order allows VH-207 to lead while VH-206’s words remain unsettled (`Plan:35–39`). But VH-207 cannot start until VH-202 closes, and VH-202’s close requires the approved words to be written into VH-206 (`Items/VH-207.md:27`; `Items/VH-202.md:20`; `Plan:168–170`).

This contradicts the stage criterion that only a contested remedy waits and approved items proceed (`Items/VH-202.md:12`).

**Smallest change:** make approval of the plan/order the dependency for uncontested work. Explicitly allow a partial owner answer to leave VH-206’s wording pending while VH-207 proceeds, with that state recorded in the backlog and decision. Apply the same distinction if F15b is accepted but its new wording still needs approval; the draft presently promises to add words it has not yet proposed (`Plan:156`, `:170`).

## P-05 Restore the qualification on Codex’s V-18 position — must

**Rank 2.** The ask says both reviewers agree and recommends that acceptance stands, with measurement later (`Plan:157`). My blind draft retained acceptance **pending HEAD measurements**, with no structural move yet; the comparison preserves that qualification (`codex-astra-fixitems-2026-10-27.md:99`, `:118`, in the report directory; `fixplan-compare-2026-10-27.md:17`).

The distinction matters because the reported geometry predates VH-205; HEAD’s improvement is subtraction, not measurement (`Report:413–417`).

**Smallest change:** state both recommendations accurately, mark present geometry unmeasured, and explicitly say that the 320 × 568 condition concerns **all three languages**. Keep the owner’s acceptance decision separate from the later non-regression check.

## What held up

**Coverage is substantially complete.** V-51, V-46 and V-52 each have an item; V-48 and V-49 share VH-210. V-50 carries the full offender inventory: both language switches, Video type, both Set buttons, closing colour and the Malay statement heading (`Plan:23–27`; `Items/VH-209.md:5`). The report’s unresolved list remains incorporated whole through VH-203, rather than silently becoming passes (`Plan:55–69`; `Items/VH-203.md:37–38`).

**VH-206’s distinction is sound.** A typed reason avoids abusing numeric measurement detail; zero decoded frames satisfy the kept-range guard, while `ends-early` retains precedence (`src/audio/warnings.ts:33–34`, `:90–92`; `src/media/audio-plan.ts:120`, `:279–285`). Preserve untrimmed **behaviour**, rather than imply every untrimmed file displays `noAudio`: untrimmed analysis bypasses this guard (`Items/VH-206.md:10`; `src/media/sub-block-sound.test.ts:115–119`).

**The proposed words have no demonstrated factual or terminology error for S-99 or N14.** They state cause and consequence and ask for more of the portion containing audio, without claiming that the omitted material was audible (`Plan:149–151`; `Report:241–260`). Start/End terminology matches all three tables (`src/i18n/en-GB.ts:221–222`; `zh-Hans.ts:164–165`; `ms-MY.ts:170–171`). Applying the repository’s English formula gives approximately grades **3.7 and 3.8**, below its limit of 10; this does not establish Chinese or Malay reading level (`test/readability.test.ts:23`, `:89–106`; `docs/01-specification.md:730–735`). I accept “audio” and the named trim fields as improvements over my blind draft; final wording remains the owner’s.

**VH-208’s remedy is appropriately small.** One notification shell, warnings before player/Save, and the existing heavy-limiting detail avoid another control or translation. The instruction against nesting is necessary because `renderWarnings` currently creates a complete notification (`Items/VH-208.md:9–12`; `src/ui/warning-text.ts:119–130`).

**The grouping and stage rule hold.** The five scopes are plausible session units, with VH-208 the largest. I accept separate VH-209 before VH-210: layout precedes ring measurement, and V-48 must still close if V-50 is declined (`Plan:30–51`; `Items/VH-210.md:9`). Every item carries the substantive stage requirements—languages, modes, WCAG, tokens, document routing, gate, digest naming and final-candidate review with repair/re-check or an open owner decision (`Items/VH-206.md:14–21`; `VH-207.md:14–21`; `VH-208.md:14–21`; `VH-209.md:14–21`; `VH-210.md:12–19`).

**The record’s structure passes.** `node tools/check.mjs` reports **0 structural or budget failures**, backlog **891/1,000 words**, and one warning: **47 live decisions against 45**. Resolve that warning or link an existing follow-up before close (`project/decisions.md:17–18`; `AGENTS.md:46–49`). Items/Deferred grammar and the new wish line are present; I found no currently unrecorded deferral (`project/decisions.md:36–48`; `project/wish-list.md:71`). The deliberate critique placeholder still needs its actual disposition before the checkpoint’s completion claim is valid (`project/decisions.md:23–31`).

No full gate or browser matrix was run. Applied digest rules: focus appearance and evidence, consistent terminology and recovery, token-based layout, and meaningful regression tests (`project/digests/wcag-2.2-aaa.md:27–44`; `nielsen.md:23–34`; `carbon.md:25–38`; `house-conventions.md:110–127`).

## For the owner

- **V-50:** I retain rank 2 for real friction, while accepting its separate CSS item (`Report:667–673`; `Plan:155`).
- **F15b:** I retain rank 2 and favour recovery in existing text—save, then listen locally before publishing—without another control (`Report:674–680`; `codex-astra-fixitems-2026-10-27.md:117`).
- **V-18:** I favour provisional continuation of the existing acceptance pending measured HEAD geometry, with no structural move yet (`codex-astra-fixitems-2026-10-27.md:118`).
- **Statement:** I retain rank 2 documentation debt under VH-192.1, with wording and timing remaining VH-137’s (`Report:686–693`).