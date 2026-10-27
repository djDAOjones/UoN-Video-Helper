<!-- markdownlint-disable -->
<!-- VH-211's plan by Claude (VH-211 #1, 2026-10-27), saved in the orchestrator's notes as vh211-claude-plan.md before Codex astra saw anything, verbatim. Its provisional IDs are not the record's; the merged plan's are. -->

# VH-211 — Claude's plan, saved before Codex sees anything (VH-211 #1, 2026-10-27)

At `51a7201`. This is Claude's own reading. Codex astra hasn't seen it, and its blind pack must not include it. There are fourteen pieces: the "?"'s two changes, A's seven and B's six. They become twelve fix items, VH-212 to VH-223 (provisional IDs; the record step confirms the next free ones). None adds a control, checkbox or element, except as V-18's ask flags.

## The stage rule, verbatim from VH-203 (each item carries it whole, with its own scenarios, WCAG criteria and digest rules filled in)

- its before and after measured with the pass's walker, in three languages and light, dark and forced colours, with WCAG re-checked for what it touched;
- our own CSS on the two token files; no control, checkbox or element added; the progress bar kept;
- UI-STANDARDS updated where a rule changes, within its 2,400 words or with the owner asked; a change to `docs/` drafted as a wish line for the owner;
- the gate green with no test deleted or skipped, and the digest rule it applied named (rule 8);
- Codex astra's check before commit, of the final candidate diff with its base and evidence, from a brief; a failing point repaired and re-checked, with the follow-up verdict kept, or, if Claude disagrees, the item left open and the point put to the owner; the commit carries `Checked: gpt-6-astra — <verdict as given> — <scope>`.
- **Each fix linked** to its finding and its verification in the report's Disposition table.

Filled in as VH-209's criteria do it: the before is VH-199's records where the condition matches, and every other before cell is measured on the item's base commit first. Each item keeps its table in the bundle's measurements folder as `vh2NN-…-2026-10-DD.md`. A check item (B) keeps the rule's walker, Codex check, gate and Disposition lines. It has no product diff unless it finds a defect, and a defect it finds becomes a fix item, planned the same way, before VH-203.

## The fourteen pieces

### The "?" (VH-205), two changes → one item, VH-212, size S

1. **The gap, 16 px today, to about 8 px.**
   - *Evidence:* `.promise-with-help .help-button { margin-left: var(--spacing-04) }`, which is 12 px (`src/styles/app.css` VH-205 block, ~:1115–1128; `tokens.carbon.css:35`). On top of that is the collapsed space between the `<span>` and the `<button>` (`index.html:54–55`), about 4 px at 16 px. Together they make the 16 px the owner saw.
   - *Fix, CSS only:* `margin-left: var(--spacing-02)` (4 px), plus the space, for about 8 px. No markup change, and the words untouched.
   - The `::after` target is 44 px centred on the 20 px square, so it reaches 12 px each side (`app.css` ~:1130–1138). At an 8 px gap it would overlap the end of "format." by about 4 px. The owner's check is that it doesn't. So if the measured overlap is above 0, the `::after` moves right by that overlap. It stays 44 × 44 and still contains the whole square.
   - *Measured:* the gap, and the target's left edge against the text's right edge, by elementFromPoint, as VH-205 did. Also no sideways scroll at 320 px (1.4.10) in all three languages, and the 32 px font, where the square is 40 px and the overlap goes away.
2. **The open state.**
   - *Evidence:* `.segment input:checked + .segment-face` fills `--interactive` with `--text-on-interactive` (`app.css` ~:1196–1199). Both "?"s carry `.button--secondary.help-button` (`index.html:56`, `:464`), and `wireToggletip` sets `aria-expanded` (`src/main.ts:716–721`).
   - *Fix:* `.help-button[aria-expanded="true"]` takes the same fill, border and text tokens, and keeps them on hover and press, since `.button--secondary:hover`'s `--layer-02` (~:368) would repaint it. The disabled rule still wins.
   - In forced colours it takes the chosen segment's Highlight/HighlightText, with `forced-color-adjust: none`, beside the forced block (~:1737). The onset "?" changes too.
   - *WCAG:* 1.4.6 for the glyph on the fill, a pinned pair in `test/contrast.test.ts`; 1.4.11; 2.4.13 for the ring on and beside the fill; 2.5.5 kept; 1.4.1, since state is not colour alone (`aria-expanded` and the tip shown).
   - *Carbon,* "one primary per state": the filled "?" must not read as a second primary. The chosen segment is the precedent the owner named. Codex should weigh this; it isn't re-scoped.
   - *Walker:* digest-formatTip, -targets and -focus readings in each state. The walker's 2.5.5 reading doesn't count a target drawn round the control (wish VH-205.1). Until VH-205.1 lands, the item's 2.5.5 after-reading is the elementFromPoint probe, named as such: a coverage question.
   - *Order:* after the behaviour items and before VH-209 and VH-210, so their rings and overflow are read on the final "?".

### A, seven page defects

3. **V-18 (VH-175.4) → VH-213, `[!]`, size M.**
   - *Evidence:* report V-18 (`design-pass-3-2026-10-27.md:400–427`). The file button's painted top and bottom at `a3039c3`, at 1280 × 900: en-GB 650–694, zh-Hans 800–844, ms-MY 890–934, so Malay is 34 px below the fold. At 320 × 568: 950–994, 1,045–1,089 and 1,287–1,331. VH-205 brought it about 20 px higher, by subtraction and unmeasured.
   - At 320 × 568 the rise needed is roughly 400 to 740 px. Spacing or shorter words (the Phase 7 route) can't give that.
   - *Options, argued, none measured:*
     - (a) the lede moved below step 1's chooser in the markup, at every width;
     - (b) the lede shown after step 1 by CSS `order` at narrow widths only. Refused: visual and focus order would part, under 2.4.3 and 1.3.2, since the lede holds the format "?";
     - (c) the promises behind a disclosure. This adds an element;
     - (d) shorter native wording. At most it fixes Malay at 1280.
   - *Recommend (a):* it adds no element and changes no words, and it is the one remedy big enough for 320 × 568. Its cost is that the promises are read after the first action.
   - *The item, once the owner answers:* read the heights above the button at HEAD in six cases first. Check `docs/01-specification.md` for the page's order: if the spec fixes it, a wish line for the owner and a stop. Then build the owner's choice and re-read all six cases.
   - *WCAG/Nielsen:* 1.3.2, 2.4.3, 2.4.6, 1.4.10, and Nielsen 8. Before VH-209, which then guards the new place.
4. **VH-189.1 and VH-186.1 → VH-214, size M (two narrow-width layout defects).**
   - *VH-189.1:* at the 32 px font and 401 px or less, step 4's selects keep 20–101 px and clip their options (`reviews/2026-10-24/vh189-labels-2026-10-25.md`). The fix: every step 4 field takes the `field--wide` pattern at that condition, with the select on its own row across the column (`app.css` ~:1060–1081), plus `min-width: 0`. A native select's own closed text may still clip, so that is measured, and a residue goes to the owner as a recorded limit.
   - *VH-186.1:* the System check's worker row breaks inside words at 320 px ("Backgrou / nd", ten lines in Malay), because its "Ready in … ms" value takes the width and `overflow-wrap: anywhere` breaks the label (`reviews/2026-10-24/vh186-words-2026-10-24.md`). The fix: at narrow widths the value goes beneath the label, and the label wraps only between words.
   - *Updates VH-209:* its "Out of scope, kept" line for the selects now names VH-214.
   - *WCAG:* 1.4.4, 1.4.8, 1.4.10, 1.4.12, 2.5.5. The before for the selects is S-113 ×6 and the combined cells VH-209 qualifies.
   - *Order:* after VH-209.
5. **VH-139.5 → VH-215, size M.**
   - *Evidence:* the submission card's `{seconds}` and the job line take the running time of the part kept, read before the encode (`src/i18n/en-GB.ts:256`, `:492–494`). A cut-short file with no closing draws "30 seconds" on a 21-second video.
   - *The item:* find where the card's time comes from, and whether the cut is known (VH-158's ends-early reading) before the card is drawn. If it is, the card takes the length made. If it isn't, the fix needs the card drawn after the decode, a pipeline change, or a spec change (§ on the card). Either is a stop for the owner, not built.
   - *Test:* a cut-short fixture, with the card's time read from the output.
   - *WCAG:* 3.3.x n/a; Nielsen 1 and 2. House conventions: "Fail loudly on data loss" weighed.
6. **VH-185.1 → VH-216, size M, after VH-206.**
   - *Evidence:* VH-185's guard is on the trimmed path only, so an untrimmed file with under 400 ms of sound is unmeasured (wish line).
   - *The item:* a fixture of the whole track with about 300 ms of sound. Measure what the job does and what it says. If it is treated as no sound, it takes VH-206's typed reason, with words for a whole video, not "the part you kept". Those words are the owner's, so the ask carries a draft (below), and if he hasn't approved it the item waits for that line alone.
   - *Same files as VH-206:* `src/media/audio-plan.ts`, `src/audio/warnings.ts`, the tables, S-99/S-101/S-153's walker checks.
7. **VH-193.3 → VH-217, size M.**
   - *Evidence:* in VH-193's corpus walk, "UoN Closing Logo Fade Blue 2025.mov" (QuickTime Animation, no audio, 5 s) was offered Create, then stood ten minutes with no result.
   - *The item:* reproduce in Chrome. The file is the owner's corpus, read only, and if it isn't on the machine a fixture of the same codec is made. Time it, then find out whether the page hangs or the walk did.
   - If the page hangs, it is to fail in existing words: either the unsupported-codec refusal before Create (inspection) or the watchdog's failure (VH-150). There are no new words unless none fits, and then it goes to the owner.
   - *WCAG:* 4.1.3, 3.3.1; Nielsen 1 and 9.
8. **F15b → VH-218, `[!]` on its words, size S, after VH-208.**
   - *Evidence:* the heavy-limiting detail says "so play the new video before you save it" (`src/i18n/en-GB.ts:722`). Under F15b the finished player can't play (S-152), and the card and Save stay.
   - *Fix:* when the finished player reports an error, a sentence in the existing warning, in the owner's words, says what to do instead. It goes in VH-208's spoken detail, with no new element.
   - *WCAG:* 4.1.3, 3.3.x; Nielsen 9. S-152 ×6 in three languages, and the walker's F15b assertions moved to the new words.

### B, six checks in Chrome (they stand as their own items: see "Folding")

The method for each is the same. First, map every row the wish names to VH-199's records (`matrix-coverage-2026-10-27.json`, the digests) by scenario × language. A row a record already read is cited, not re-walked. The rest are walked with existing scenarios and faults on the final build, or, where nothing reaches a row, with a new scenario or fault. That is a walker change, named and qualified by VH-198's method; the owner's "yes to … A and B" covers it. Every row ends read or named unreachable with a reason. A defect becomes a fix item before VH-203.

9 and 13. **VH-150.3 and VH-158.1 → VH-219, size M.**
   - VH-150.3: the watchdog failure, a storage re-check that still fails, a kept result with warnings, and all of VH-150's states at 375 px and in zh-Hans and ms-MY.
   - VH-158.1: the cut-short warning on an MKV or WebM in zh-Hans and ms-MY, with the source panel and result record saying nothing false beside it.
10. **VH-153.1 → VH-220, size M.**
    - The rows only a job or a failing browser reaches, in zh-Hans and ms-MY.
    - The save dialog's file kind is native. It is read from the `showSaveFilePicker` argument, and by a person where only one can see it.
11 and 12. **VH-155.2 and VH-156.1 → VH-221, size M.** The warnings', failures' and records' rows in zh-Hans and ms-MY. These are string rows, read against the tables.
14. **VH-172.1's 214 cells → two batches, each its own item, size M.**
    - **VH-222, batch A, 108 cells:** w375/light 42, landscape/light 24, short/light 24, w1280 dark 6, forced-dark 6 and forced-light 6.
    - **VH-223, batch B, 106 cells:** zoom200proxy 22, zoom400proxy 20, w1280 reduced-motion 22, spacing 22, fallback 10 and font32 10.
    - The keys come from `unrun-2026-10-27.json` `stillUnrun`. Batch B's item checks by script that the two lists are disjoint and that their union is the 214, each read once.
    - Every NOT-OK record is attributed by Claude, then by Codex blind, and compared.
    - *Coverage question:* whether the walker's runner takes an explicit key list. If not, a `--keys` input is a walker change, named and qualified.
    - Once both batches close, VH-172.1 retires.

## Folding B into VH-203: no

VH-203's existing work doesn't fit one worker. It is the whole matrix again, about 3,219 records and about 9.8 h, VH-199's twelve runs across about eight workers, plus the "?" captures and the integrated check. B's checks would only add sessions to it, so they stand as their own items, VH-219 to VH-223. Separately, VH-203 itself exceeds the sizing rule. It runs across sessions under one ID, as VH-199 did, and the record step should say so in its Now, not re-scope it.

## Order and sizes (VH-206 stays first)

| # | Item | Size |
| --- | --- | --- |
| 1 | VH-206 (V-51) | as planned |
| 2 | VH-216 (VH-185.1) | M |
| 3 | VH-207 (V-46) | as planned |
| 4 | VH-208 (V-52) | as planned |
| 5 | VH-218 (F15b) `[!]` words | S |
| 6 | VH-217 (VH-193.3) | M |
| 7 | VH-215 (VH-139.5) | M |
| 8 | VH-213 (V-18) `[!]` | M |
| 9 | VH-212 (the "?") | S |
| 10 | VH-209 (V-50) | as planned |
| 11 | VH-214 (VH-189.1, VH-186.1) | M |
| 12 | VH-210 (V-48, V-49) | as planned |
| 13–17 | VH-219, VH-220, VH-221, VH-222, VH-223 | M each |

Then VH-203, VH-195 and VH-204.

The reasons for the order:
- Behaviour and words come before the CSS (VH-202's rule).
- VH-216 follows VH-206 on the same files.
- VH-218 follows VH-208 on the same card.
- V-18 comes before VH-209, so the column fix guards its new place.
- The "?" comes before VH-209 and VH-210, so their rings and overflow are read on it.
- VH-214 follows VH-209 on the same records.
- The rings come last among the fixes.
- The checks come last, on the final build, so the words they read are final.

A `[!]` item blocked on the owner doesn't hold the next one: its successor leads, as VH-202's P-04 set.

## For the ask (at most 300 words, the record step's)

- **V-18 at 320 × 568,** option (a) recommended, with no element added. Whether the spec fixes the page's order goes with it.
- **F15b's words.** The draft (zh-Hans and ms-MY are machine translations):
  - en-GB: "If the new video will not play here, save it and play it on your computer before you share it."
  - zh-Hans: "如果新视频无法在此播放，请先保存，并在您的电脑上播放后再分享。"
  - ms-MY: "Jika video baharu tidak dapat dimainkan di sini, simpan video itu dan mainkan pada komputer anda sebelum anda berkongsinya."
- **VH-185.1's words, if measured as no sound:** V-51's approved words with "This video" for "The part you kept". Recommend: approve now, so VH-216 isn't held.
- **The backlog budget,** if twelve lines can't fit 1,000 words losslessly.
