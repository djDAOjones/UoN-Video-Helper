# VH-200 — Claude's attribution of the unresolved rows, saved before Codex astra's blind attribution

VH-200 #2, 2026-10-27. Evidence: VH-199's run (3,207 records on `a3039c3`, instrument revision `2e7b0c044ce11f2b`, Chrome 156), its digests, contract and matrix under `reviews/2026-10-25/design-pass-3/evidence/measurements/`, and the source at `25b6ccb`. Classes: **app** (the page as built), **scenario** (what the scenario itself does), **instrument** (how the walker reads), **unresolved** (the evidence cannot separate them).

## S-88 — finish+1s "paused a second after the card appeared", `player: false` ×6

- **Instrument, with the scenario's sequence.** S-88 (`scenarios-2026-10-25.md:115`) picks Video language beside a kept result, which withdraws the discard question and redraws the result with the same player. The finish+1s row is sampled after that next step has begun, so the player is momentarily off the page: `player: false` reads the redraw, not a failure to pause.
- Not playback and not an app failure (hand-over 10; `vh199-compare-run-08.md:14`). It is the finish+1s class, unverified as a whole (823 rows), and its sampling fix is wish VH-199.1.
- **Verdict:** no finding. The row counts as neither pass nor fail.

## S-128 — finish+1s row reads the video playing ×31

- **Scenario.** S-128 (`scenarios-2026-10-25.md:168`) plays the video itself, muted, so that a scripted press is not refused, and then changes the language. A row that reads "paused a second after the card appeared" after the scenario has pressed Play reads the scenario's own action.
- **Verdict:** no finding. The unverified class applies, as for S-88.

## S-149 — focus on `body` after an unreadable file ×3 (light records)

- **App.** With focus on a Video language radio, choosing `notvideo.mp4` after a readable file reaches the read-failure branch. `clearTrim('unreadable')` (`src/main.ts:1486`, `1500`) withdraws the setup steps, step 3 among them, through `revealLaterSteps({ setup: false, … })` with no `focusHeldBy` capture and no named successor. The blocking branch has one (`main.ts:1595`).
- Since `3c20550` (VH-191), Video language sits in `#step-title`, so the radios are now among the withdrawn controls. Before it, the fieldset sat beside Video type, outside the steps (`index.html:88` at `ec26c49`).
- **Root:** V-46's (VH-178) hand-on was never applied to the read-failure paths. The blind review's V-46 section (`codex-astra-blind-review-2026-10-25.md:50–74`) is the same defect, found in source before the run.
- **Verdict:** one finding under V-46, an incomplete fix that VH-191 made reachable from Video language. It is VH-191's regression in the contract. 2.4.3, rank 2: focus is lost, but no work is.

## The 32 px `#preset-choice input:checked` ring — 284 of 304 px² at 3:1 ×10

- **Records:** S-15 ×3, S-24 ×1, S-108 ×3, S-110 ×3, all at the 32 px default font (`digest-focus-2026-10-27.md:20`, `:33`). S-24 en-GB w1280 font32 passed in VH-176's after-run.
- **Two changes since that pass:** VH-188 rewrote step 5's words beside the radio (B6's names and details), and the instrument's 2.4.13 revision counts a ring pixel only where it is 3:1 against the same pixel unfocused. A ring pixel drawn over the label's glyphs, or over anything near the ring's colour, does not count.
- **What flipped the verdict between VH-176 and pass 3 is unresolved.** No matched probe separates the instrument revision from the new words.
- **The present reading is the app's, under 2.4.13 as written.** 2.4.13 counts the pixels that change by 3:1, so 20 px² of the ring, 6.6 %, lies where it does not contrast with what it covers.
- **Verdict:** a 2.4.13 defect at the 32 px default font (UI-STANDARDS names that font among 2.4.13's conditions, VH-194). Rank 3, a small shortfall at AAA in one condition. Its cause in pixels is to be confirmed by VH-203's after-run.

## `#onset-help-button` — 460 of 464 px² ×1 (S-113 ms-MY w320 font32)

- **The app, probably by the same mechanism:** 4 px² of ring not at 3:1. It occurs only where S-113's page already scrolls sideways (wish VH-189.1).
- **Verdict:** the same finding as the 32 px ring, as a second instance. There is no earlier reading.

## The rows I can attribute without Codex

- **S-59** "focus on the card" ×9: the walker's ordering (`walker/matrix.mjs:123` blurs before the asserts run), settled at VH-199's close and put on VH-199.1. Not re-opened.
- **S-152's and S-132's host named "Unable to play media."** while `aria-labelledby` points at the card's title.
  - The app holds no such string (`grep -rn "Unable to play" src` is empty), so it is Chrome's own name for a media element that failed to load under F15b. User agent, not the app.
  - The name is true of the state. The card's title still heads the card.
  - **Verdict:** accepted user-agent behaviour, recorded under 4.1.2; no finding.
- **`#contact-creators` in the forced palettes, wrapped** ×8: 1,108 of 1,264 and 1,595 of 1,968 px².
  - **App.** The link wraps (S-83, S-145), and the ring's lower edge runs over the next link's text. Under forced colours that text is a system colour that is not 3:1 from the ring.
  - **Verdict:** a 2.4.13 defect in forced colours, rank 3.
- **S-81's `#accessibility-statement a`** ×11: 1,361 of 1,865 px².
  - **App geometry and the instrument's denominator.** VH-182's contact line wraps the address, so the link's box is 429 × 41. The 1,865 is a 2 px perimeter of that bounding box. changedAny 1,363 is all the ring drawn, and all of it is at 3:1.
  - 2.4.13 measures "the perimeter of the unfocused component". A link in two line fragments is those fragments, not the empty corners of their bounding box.
  - **Verdict:** not a defect on the evidence. The fragment perimeter was not measured, so that is missing evidence for VH-203's after-run (a wish line).
- **S-127's player controls**, 183 2.4.13 rows (Play 90 of 368, for example).
  - The first exception (user-agent indicator that the author cannot adjust) fails the walker's test: an author `outline: none` injected on the pseudo-element removes ring pixels (`walker/phase8.mjs:313`).
  - The second exception ("the focus indicator and the indicator's background colour are not modified by the author") holds in substance. `src/styles/` styles neither the media controls nor their ring. `.result-player`'s `background: var(--uon-brand-bg)` (`app.css:1359–1364`) colours only the letterbox where the picture does not fill the box, and the controls sit on the browser's own panel.
  - **Verdict:** under the second exception, 2.4.13 does not apply to the native controls. This is an interpretation, so it goes to Codex for a blind verdict. The 39 2.4.7 and 39 4.1.2 rows are missing evidence (a person's check).
- **T-46.1's card past the window** (292 to 990 px of 900): not a 2.4.11 or 2.4.12 failure, since no author content covers it; the rest lies below the fold. A journey note (Save below the fold at 1280 × 900 with the player), not a finding.
