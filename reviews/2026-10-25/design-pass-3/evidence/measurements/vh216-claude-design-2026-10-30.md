<!-- markdownlint-disable -->

# VH-216 — Claude's design reading

Base `3741193f34c546291248e814b0915d75f3dbf41c`. Written before Codex's answer was opened. The six cases at the base: en-GB 630–674 and 930–974; zh-Hans 780–824 and 1025–1069; ms-MY 870–914 (short by 14) and 1267–1311 (short by 406, 501 and 743 at 320 × 568), by `rings-179.mjs v18`.

## 1. The page order

The markup, one order at every width, nothing moved by CSS or script:

`h1.page-title` → `div.lede` (privacy line, `#browser-note`) → `#step-choose` → `#video-kind` → `#step-trim`, title, `#step-closing`, `#step-preset`, `#step-create` → `#page-announcer` → `#errors-panel` → `ul.promises` → `#dev-actions` → `</main>`.

What paints in each state, the order being the one above:

- **Empty:** title, privacy (and the note if a check has failed), step 1, switch, promises, footer.
- **A video read:** title, privacy, step 1 with its report, switch, steps 2–6, promises, footer.
- **A video that can't be made:** title, privacy, step 1 with its block, switch, promises (and whatever step `revealLaterSteps` keeps, `main.ts:1625`).
- **A job, a result:** as a video read, with the "next video" line under the switch and the job or result in step 6. Errors captured, when it appears, sits between step 6 and the promises.

**The promises go after `#errors-panel`, last in `main` but for the hidden, English, dev-only `#dev-actions`.** His order names no errors panel, so this is a judgement. Errors captured reports on the job: it belongs against step 6, and five promises between them would part them. `#page-announcer` is visually hidden and on the page in every state; its place doesn't paint, so it stays. Against: when Errors captured shows, the list follows that heading in the outline. Placing it before gives the same weakness under step 6's heading, in every state: the list has no heading of its own either way (a heading would be an element and a string). The panel's border and the `section`'s end mark the break.

## 2. Which element holds what

**Option A: the promises leave. `div.lede` stays under the title, holding the privacy line and the note; the `ul` goes alone, with a class, `<ul class="promises">`.**

- CSS: `.lede ul` becomes `.promises` (same three declarations); `.lede ul + p` removed from the rule at `app.css:55`, dead. `.lede`, `.lede p`, `.lede p + p` untouched, so the privacy line, the note and their gaps are pixel for pixel as they are, **including the browser-note state, which no cell walks**. The tip's `p` keeps its margin from `.toggletip p` (`:1101`).
- Tests: `screen-text.test.ts:71`'s regex and `stylesheet.test.ts:79`'s selector follow; `:116`, `:96` hold.
- Walker: **S-03's "the owner's five promises, in order" fails in all 60 after cells** and in `PLANS.matrix()`'s 42 until VH-203's revision; `tip-196.mjs` and `top-187.mjs` read an empty list. `VH207_LEDE` still matches.

**Option B: `div.lede` goes with the promises; the privacy line and note stand bare in `main`.**

- CSS: `.lede` keeps the list, but the two `p`s lose `.lede`'s margin and `.lede p + p`. Hidden, the note must not leave a gap; shown, it needs the paragraph gap and 32 px below it. With no wrapper that takes new rules with `:has()` or a margin on `#step-choose`, in a state no cell walks. `.lede` (an opening) then names a list at the foot of the page.
- Tests: `:71` and `:79` unchanged, and still biting.
- Walker: S-03's promises row keeps passing; `VH207_LEDE` stops matching, so the VH-207 (f2) read's click fails, in the walker's records wherever (f) is walked; `top-187.mjs`'s paragraph count changes.

**I choose A.** B saves one row's failure in my after table and costs new CSS on an unwalked state and a false name. A's failed row is expected, reported, read by the probe meanwhile, and repaired in VH-203's revision by one selector. A is the smaller code change ("minimal change discipline"; "the CSS it needs, and no more").

## 3. The CSS

`.lede ul {…}` → `.promises {…}`, its declarations unchanged (`margin: 0 0 var(--spacing-05)`, `padding-left: var(--spacing-06)`, `list-style: square`); `.lede ul + p` deleted from its selector list. No other rule, no `order`, no literal. The switch keeps `margin-bottom: var(--spacing-07)`; step panels keep `var(--spacing-06)`. Nothing spaces the list against what's above it but those margins.

## 4. The tests (none deleted, none skipped)

- `screen-text.test.ts:71`: the regex takes `<ul class="promises">…</ul>`; the five promises' words still bite.
- `screen-text.test.ts:656` "sits above Step 1" becomes the whole order, by `indexOf`: `page-title` < `class="lede"` < `lede.privacy` < `browser-note` < `step-choose` < `video-kind` < `step-trim` < `step-create` < `errors-panel` < `class="promises"` < `</main>`; `.lede`'s own markup holds no `<ul`; the locked-fieldset half kept whole.
- `stylesheet.test.ts:79`: `.promises`. A new assertion that `app.css` declares no CSS `order` (the owner's word and 1.3.2).
- A sheet test: `whereShown` for `lede.promises.0`, `lede.formatHelp.text`, `lede.privacy` and `videoKind.label`.
- The markup's comments at `index.html:37` and `:86` follow.

## 5. The sheet and comments

`WHERE`: add `['lede.promises', 'Below the steps: what the tool does']`; `lede` stays for `lede.privacy`, still true; `lede.formatHelp` "Below the steps: the "?"…"; the three `videoKind` rows "Below Step 1: …"; `browserNote` stands. `:466`'s note "the video type above the steps" → "below Step 1".

**The filled sheet follows,** where-cells on `lede.promises.*`, `lede.formatHelp.*`, `videoKind.*` and `progress.job`'s note if it repeats it, as VH-212's and VH-227's rows did; its translated words never change, and `tables.test.ts:226` proves it.

**No string is made false:** `en-GB.ts:155` ("The message below says what to do") is step 1's own status, and `:159` ("or choose one above") is under the input: both stay beside what they name. The grep of `above|below|at the top|scroll` finds no other. Comments: `en-GB.ts:103`, `main.ts:499`, `video-kind.ts:2`. `zh-Hans.ts` and `ms-MY.ts` carry no such comment. "The lede's fourth promise" in comments names the keys' family (`lede.*`) and stays, by minimal change.

`docs/`: the three substitutions, `:31`, `:585`, `:586`, proved by the word diff; 8,125 words. `:779` and `:592` stay true: the note stays above step 1 and the line stays in the switch.

## 6. The instruments

- **The six cases:** `rings-179.mjs v18`, unchanged, before (done) and after.
- **The 120 cells:** a driver under `vh216-walk/` runs `matrix.mjs` unchanged on an in-memory plan. S-03: 3 languages × 4 widths × 5 modes, one plan. S-144: declared in memory beyond its `langs`/`views` (`matrix.mjs` doesn't read them; `okLang`/`okView` are `PLANS`' own), **one run per mode**, since a mode after the first is "not reached" once focus has been blurred; proved by each mode's state being reached on two modes first.
- **The probe,** read-only, on `afterMode`, no focus moved: the DOM index of each landmark above; the heading sequence (tag, text, shown) in DOM order; the promises by `#format-help-button.closest('ul') > li`, which both sides share; the input's box; the "?"'s box; `scrollWidth` against `clientWidth`.
- **The Tab order:** a separate driver, 60 cells, fresh page each: from the body through every stop to the footer's first. **Expected:** before skip link, Page language, (notice link), "?", Video type, Choose file, footer; after skip link, Page language, (notice link), Choose file, Video type, "?", footer. Then the tip, as `formatTip` and S-142: Enter opens, focus stays; Tab closes, on to the next; Shift+Tab closes, back to the previous; Escape closes, on the "?"; a click on its text keeps it, a click on the title closes it.
- **Expected to fail after, and only these:** S-03's "Tab from the top…" (W1) and "the owner's five promises, in order" (W2), in all 60. S-144: none. `formatTip`'s rows take their own Tab reference, so should pass. A row that moves otherwise is a finding. V-50's font32 phone failures should stand the same on both sides.
- **Gap, stated:** S-03 and S-144 are the empty page. The other states' order rests on one static markup, pinned by the new test.

Checked by loading it: `PLANS.matrix()` holds S-03 42, S-144 1, S-144p 9, S-141 9, S-142 9. So VH-203 carries W1, W2, S-142 and J1's rows in a wish line.

## 7. WCAG and Nielsen

- **1.3.1:** list, fieldset, legend and `aria-describedby` are carried whole. **1.3.2:** DOM and paint agree, no `order`, pinned. **2.4.3:** chooser → switch → steps → "?": the sequence is the page's; the switch is never locked and shapes steps 2–6, still ahead of it. **2.4.6:** no heading changes or moves against another; the sequence is the same before and after, read by the probe. **1.4.4, 1.4.10:** no width or fixed size added; read at font32 and 320 px; the tip opens at the page's foot, S-144's row reads its overflow.
- **Nielsen 6:** the first action is on the first screen where it fits. **8:** the first screen holds less.
- **The risk, plainly:** a person who doesn't scroll, on a phone, sees the title, the privacy line and the chooser, and not what the tool does; and the switch may fall below the fold. That is the owner's chosen trade, shown to him. "Saves in a reliable format." and its "?" are one Tab further from the top. Nothing about the promises goes false in any state: they describe the tool, not a step.

## 8. Stops

None found. No element, no string, no `docs/` beyond the three, no walker change, and the remedy is within "the markup move, the CSS it needs, the tests and the sheet". Digest rules to name at close: wcag-2.2-aaa 1.3.2, 2.4.3; nielsen 6, 8. UI-STANDARDS: no rule changes.
