# VH-200 — the unresolved rows: Claude's attribution against Codex astra's blind attribution

VH-200 #2, 2026-10-27. **Claude's file** (`attrib-claude-2026-10-27.md`) was saved before Codex astra's run. Codex had **the same evidence and none of Claude's reading**: brief `codex-astra-attrib-brief-2026-10-27.md`, answer `codex-astra-attrib-2026-10-27.md.txt`, verbatim. Every disagreement below is settled on the evidence; none is held for the owner.

## Agreed

- **S-88:** instrument. The finish+1s row reads whichever player is in the DOM after the scenario's next step (`walker/phase8.mjs:77`). No finding; the row is unverified (VH-199.1).
- **S-128:** scenario. The scenario plays the video itself. No finding; unverified.
- **S-149:** app. `clearTrim('unreadable')` withdraws step 3 with no hand-on, unlike the blocking branch (`src/main.ts:1595`). VH-191 exposed an omission that VH-178 left. One finding under **V-46**, 2.4.3, rank 2.
- **S-81's statement link:** instrument. 2.4.13's perimeter follows the link's fragments, not the rectangle that encloses them with the space between. The walker's denominator is that rectangle (`qualify.mjs:732`). No finding; the fragment perimeter is missing evidence.
- **`#contact-creators` in the forced palettes:** app. A 2.4.13 failure where the wrapped link's ring crosses the next link's text (`vh199-compare-run-07.md:25`). It is a finding. Codex adds that the link is an `inline-flex` box (`app.css:208`), so its rectangular reference is the right one, unlike S-81's.
- **S-127's 2.4.7 and 4.1.2 rows:** undetermined, missing evidence. Neither 2.4.13 exception transfers to them.
- **F15b's host name:** no finding. Chrome's own name for a failed media element under the fault. The app's `aria-labelledby` is correct (`src/main.ts:2882`).

## Codex only

- **The 32 px radio's reference.** The walker gives every ordinary control a rectangular reference, `4(w + h) − 16` (`qualify.mjs:767`), and keeps the disc's `4π(r − 1)` for the trim thumbs.
  - The native radio is a 40 px disc (`--control-size`, `app.css:798–803`). Its 2 px perimeter is about 239 px², so the ring's 284 px² at 3:1 passes against it.
- **The 2.4.13 calculation was unchanged between passes.** Pass 2's `qualify.mjs:654–727` already counted `changed3`, the 3:1 pixels, against the same box. VH-198's revision touched the player's reader. So the instrument revision did not flip S-24. VH-188's words and Chrome 155 → 156 remain, unseparated.
- **The overflow pseudo-element** takes 2.4.13's first exception, since no author style reaches it.

## Claude only

- **The power-mode and visible-page caution** for timing rows. It is not at issue in these nine rows.

## Disagreed, and settled

1. **The 32 px `#preset-choice` ring.** Claude: a 2.4.13 defect, V-48. Codex: an instrument reference error, no finding.
   - **Settled for Codex, on the source.** The radio is a native disc, and the box reference overstates its perimeter by about 65 px² (304 against 239). 284 passes the disc.
   - Claude's premise that the 3:1 revision explained the flip is wrong: pass 2 counted the same way.
   - **No finding.** The disc reading is missing evidence for VH-203's after-run: wish VH-200.1.
2. **`#onset-help-button` 460 of 464.** Claude: the same finding as the radio, rank 3. Codex: an app finding, rank 2.
   - **Settled for Codex.** It is an author-styled rectangular button, so the box reference is right, and 460 < 464 fails 2.4.13 as written.
   - Rank 2 matches Phase 7's ranking of every 2.4.13 failure (V-40, V-41, V-42). It becomes **V-48** alone. Its lost pixels' mechanism is unproved: it occurs only where S-113's page scrolls sideways (wish VH-189.1).
3. **`#contact-creators`'s rank.** Claude: 3. Codex: 2. **Settled at rank 2,** for the same consistency with V-42, a forced-palette 2.4.13 failure. **V-49.**
4. **S-127's 2.4.13 rows.** Claude: the second exception holds in substance, so n-a. Codex: not established or disproved.
   - **Settled for Codex.** The walker reads the host's backdrop, not the background behind each indicator (`phase8.mjs:311`). The author's brand letterbox (`app.css:1359–1364`) can lie behind a control where the picture is pillarboxed.
   - Claude's "the controls sit on the browser's own panel" was not measured. So these rows are **missing evidence**, neither a failure nor n-a: wish VH-200.1, and a person's check.
5. **The F15b host name's class.** Claude: user agent. Codex: scenario. **Both:** the scenario's fault sets the state, and Chrome names it. No finding either way.
