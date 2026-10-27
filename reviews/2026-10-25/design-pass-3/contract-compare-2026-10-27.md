<!-- markdownlint-disable -->

# The Phase 8 contract — Claude's table against Codex astra's blind draft (VH-199, 27 October 2026)

Claude's table was saved first (`contract-claude-draft-2026-10-27.md`). Codex astra then drafted its own from the same evidence, blind to Claude's (`codex-astra-contract-brief-2026-10-27.md`; the reply verbatim, `codex-astra-contract-draft-2026-10-27.md`; session `01a17cec-f816-72c0-84b0-aba8f798f1a3`, 10:33–10:44Z). Each disagreement is settled here on the evidence, with its reason; none is held for the owner. The settled table is `evidence/measurements/contract-2026-10-27.md`.

## Agreed

- **Holds:** VH-184, VH-186, VH-190, VH-193, VH-194, VH-196, VH-179, VH-180 and VH-181, on the same readings (VH-179's V-18 tops 650, 800 and 890 at 1280 × 900 and 950, 1,045 and 1,287 at 320 × 568; VH-180's note under both outputs; VH-181's step count 4 → 5 with no third name).
- **Partial:** VH-183 (the one-check rule unverified: S-92 ×31 and S-93 ×6, the accepted counter gap; S-34 left out by the walker) and VH-192 (the finish+1s rows, the user agent's controls "cannot determine", F15b's intended failures).
- **S-81's statement link** (VH-182): 1,361 of 1,865 px² ×11, pass in VH-176's after-run, reported under VH-182; the perimeter and the 2.4.13 verdict are VH-200's.
- **The finish+1s player row** counts as unverified, "including nominal passes", as Codex put it: all 823 rows, 769 read pass and 54 fail (S-128 ×31, S-109 ×13, S-88 ×6, S-138 ×3, S-59 ×1). Claude's first version of this line said "all 54 records"; corrected on Codex astra's close check, must 1.
- **Against VH-176's 699 keys**, the changes are exactly: S-81 ×11 pass → fail; S-24 en font32 pass → fail and S-15 en and zh font32 "cannot determine" → fail (`#preset-choice input:checked`, 284 of 304); S-86's targets and contrastExtra pass → "cannot determine" (its setup now reads a file); five S-03 press rows newly carried.
- **No stop:** no coverage reduction beyond the accepted gaps, no crash, no media egress.

## Codex only

- **S-133 ×6 is missing from VH-192's row.** Accepted: close #2's evidence script expanded "S-126 to S-134" only over ids with an ok record, so it hid the gap. The script now adds ids that have only missing records, and `contract-evidence-2026-10-27.json` names the six keys under VH-192.
- **S-59's "focus on the card" ×9 is instrument ordering.** Accepted, verified: `matrix.mjs:123` blurs the active element after the focus readings and before the Phase 8 instruments and asserts run, while each of the nine records' `reached.seen.active` is the card (`section.notification "Finished video — …"`). VH-192's "focus on the card after Keep it" holds by the reached state; the assert's fail is an instrument class, added to wish VH-199.1.
- **VH-185: the output's tracks are not read directly.** Accepted: S-100's state and asserts read the finished card, the kept range and the empty plan, not the file's tracks, which the contract names as a measurement. VH-185 is partial.
- **VH-185's sub-400 ms rule as a data-loss path** ("close concern"). Not a VH-199 stop: it is VH-198's blind review D-05, rank 1, already in VH-200's Notes (2026-10-25) with VH-198's decision. VH-199 writes no finding; VH-200 judges it. S-102 is wish VH-185.1's scenario, "not judged against VH-185", by its own row.
- **VH-191 regressed, on S-149.** Accepted, verified in source: before VH-191 the Video language fieldset sat beside Video type, outside the steps (`index.html:88` at `ec26c49`); `3c20550` moved it into `#step-title` (`index.html:259`). The read-failure branch (`clearTrim('unreadable')`, `src/main.ts:1486`, `1500`) withdraws that step with no hand-on, unlike the blocking branch (`focusHeldBy`, `main.ts:1595`), so focus on a radio is lost to `body` (S-149 light ×3). The contract names S-149 as VH-191's neighbour. Reported under VH-191; the root, V-46's unhandled read-failure branch, and its rank are VH-200's.
- **Shared classes** (mixed-script measure, slider geometry and thumb reference, S-76's and S-113's clipped targets, S-113's chooser glyph, S-21's and S-62's disabled focus targets): agreed as classes for VH-200, not passes.

## Claude only

- **Five readings** the contract names and the runs did not take (`rings-179.mjs` `v18`, `colours`, `held`; `note-180.mjs`; `name-181.mjs`), taken for the close. Codex used them.
- **VH-184's edge ratio.** Claude's table said it is not re-read; that was wrong. S-98's assert re-reads it in every record (`found`: 4.08 and 3.91:1 in light, 4.71 and 5.53:1 in dark, 21:1 forced), so Codex's figures are this run's. Corrected on Codex astra's close check, must 2.
- **`#contact-creators` ×8.** Claude's table called it a new element; it is not: the Creators team link is at `ec26c49:index.html:797`, and VH-182 reworded it and moved it into the group, where it now wraps. Its forced-palette failures are newly measured, with no after-run reading on those keys. Codex counts it inside VH-182's partial, which stands. Corrected on Codex astra's close check, must 3.

## Disagreed, and settled

| Item | Claude | Codex | Settled | Reason |
| --- | --- | --- | --- | --- |
| VH-182 | regressed | partial | **partial** | The fail is the instrument's enclosing rectangle: the box grows to 429 × 41 when the address wraps across a line end, while the ring drawn (1,361–1,365 px², all at 3:1) is the size it is on the narrower views, where the link also takes two lines and passes against a tighter box (en w375 1,278 / 1,215). Behaviour worsened is not shown until VH-200 rules on a wrapped link's perimeter. The reading stays under VH-182. |
| VH-185 | holds | partial | **partial** | Codex only, above: the no-track output is inferred, not read. |
| VH-187 | holds | partial | **holds** | The three missing S-107 records are the fallback faces, which VH-187's must does not name ("three languages, at three widths and in four colour modes"); S-107's 28 ok records cover those. The gap is named and VH-203 measures it. |
| VH-188 | holds | partial | **partial** | The 32 px ring on step 5's checked output went pass → fail on a part 1 key (S-24) and fails in VH-188's own S-108 and S-110. A ring pixel counts only where it is 3:1 against what it covers, so step 5's new words beside the radio can move it, as can the 2.4.13 revision. Attribution unresolved, so that part is unverified. |
| VH-189 | holds | partial | **holds** | S-113's overflow at the 32 px font and 401 px or less is what its own scenario row expects, VH-189's recorded limitation (wish VH-189.1); the must is read at the default font. `#onset-help-button` 460 / 464 is in the same condition, with no earlier reading: held for VH-200. |
| VH-191 | holds | regressed | **regressed** | Codex only, above. |
| VH-178 | holds | partial | **holds** | Every VH-178 must holds: 48 of 48 transitions, T-46.1's new figure (6,463–6,625 against 6,224) beside 4,400, the routes as the after-run. The card past the window is VH-192's taller card, in VH-200's Notes since VH-198; S-149's read-failure branch is outside VH-178's three transitions and is reported under VH-191. |

**The outcome:** 12 hold, 5 partial (VH-182, VH-183, VH-185, VH-188, VH-192), 1 regressed (VH-191), none unverified.
