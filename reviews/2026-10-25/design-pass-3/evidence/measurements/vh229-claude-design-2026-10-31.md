<!-- markdownlint-disable -->

# VH-229 — Claude's design reading

Saved before Codex's design answer is opened.

## Markup (index.html)

Title row, panel, note, step 1, in this DOM order, one order at every width:

    <div class="page-title-row">
      <h1 class="page-title" data-i18n="app.title">…</h1>
      <button class="button button--secondary help-button" type="button" id="about-help-button"
        aria-label="About this tool" data-i18n-attr="aria-label:lede.about.label"
        aria-expanded="false" aria-controls="about-help">?</button>
    </div>
    <div class="lede" id="about-help" hidden>
      <ul class="promises">… today's five, the format "?" and tip unchanged …</ul>
      <p data-i18n="lede.privacy">…</p>
    </div>
    <p id="browser-note" hidden></p>

- The panel IS the existing `.lede`: no new container but the row. So `VH207_LEDE` and S-03's `.lede > ul > li` still match without a walker edit, and the words are moved, not retyped.
- `#browser-note` leaves `.lede`, or a press would hide it, and stays a sibling under the title, after the panel, in view whatever the panel does.
- The "?" outside the `h1`, so the heading's name stays the title; before the file input in Tab order, and the format "?" (when open) too.
- The panel directly after its button, so reading order follows the press. No live region: the state is on the button, the words are next in the reading order. The format tip's own `aria-live` stays.
- Plain flow, no box round the panel: a box would nest the format tip's hairline box; today's text was unboxed.

## Layout (app.css)

    .page-title-row { display: flex; align-items: center; gap: var(--spacing-03); margin: 0 0 var(--spacing-05); }
    .page-title { margin: 0; min-width: 0; }

- The whole 44 x 44 square, as beside "Plays over", not the format "?"'s compact drawing: he asked for a "question mark box", a first-time user has to see it, and it lies over no ink.
- Flex nowrap, the `h1` shrinking: at 320 px "UoN Video Helper" (239 px in 272) takes two lines with the "?" beside them, about 70 px tall, where inline would keep one line and drop the "?" alone beneath it, about 79 px, and flex-wrap would do the same. Longest word against 220 px at the 32 px font: "Finisher" estimated about 210 px, to be measured with VH-225's name by the probe, never by a page change. No `overflow-wrap` unless the measure asks.
- `#browser-note` takes `margin: 0 0 var(--spacing-07)`, what `.lede` gave it; `.lede` keeps its margin when open. A hidden note or panel has no box. Closed, step 1 sits `--spacing-05` under the title row.

## Behaviour (src/main.ts)

- Not `wireToggletip`: no focus-moved and no click-elsewhere closing. A press on the "?" toggles it. Closed at every load, not remembered: no storage, `hidden` in the markup.
- Escape: registered before both `wireToggletip` calls, so it reads a tip's state before that tip's own listener closes it. An open tip takes the Escape: the tip closes, the panel stays. Otherwise, with focus on the "?", in the panel, or nowhere (`escapeFocusesButton`, reused unchanged): the panel closes and focus goes to its "?".
- **A refinement of the item's draft:** Escape with focus on a control elsewhere does not close the panel. The panel covers nothing, closing it would move the page under that person, and Escape there (a select's list, the problem report's dialog) means something else. Not below his words: he asked for it to stay open until pressed.
- Closing by the "?" while the format tip is open: the tip already closes, since focus moving to or a click on the "?" is outside it. A press leaves no tip open in a closed panel.
- Outside every fieldset, so a job's lock never disables it; §9.2's "one press away" holds during a job.

## Words

- One new string, `lede.about.label`: "About this tool"; 关于本工具 (as 关于视频格式, 本工具 the page's word); Malay "Perihal alat ini" (as "Perihal format video"), the term to be checked against the page's. Both marked machine translations as VH-212's were.
- The sheet's `where` cells for `lede`, `lede.promises`, `lede.formatHelp` say the panel; `browserNote.notPassed` stays "Under the page heading". A new note row: not shown, the screen reader's name. Comments at index.html's privacy and promises blocks, the test's comment at "is said once".
- Spec §9.2, wish VH-229.1's one line, exactly.

## Tests

`test/screen-text.test.ts`: the whole-order test takes the new order (changed, not deleted); new: the "?" outside the `h1`, name, `aria-expanded`, `aria-controls`; panel `hidden` in the markup and holding the five then the privacy line; the note outside it; no CSS `order`. `tables.test.ts`: where-cells. Behaviour in Chrome by the probe.

## Standards

Nielsen 8 (nothing on the empty page that does not earn its place) and 10 (help findable, short, on request). Carbon: one primary per state, the "?" stays secondary. WCAG 1.3.1, 1.3.2 (DOM order), 1.4.4, 1.4.10 (no sideways scroll at 320), 2.1.1 (a button), 2.4.3, 2.4.6 (heading unchanged), 2.5.5 (44), 4.1.2 (name, state, relationship). What the design costs, for him: a person who never presses sees no privacy line and no purpose line; he was told that and chose it. Heading: nothing changes.

## Walks and reports

S-141 to S-144 cannot reach the format "?" while the panel is closed: a driver opens the panel first, named as such; the walker unchanged. Rows pinning the old order are reported. The six cases closed and open.
