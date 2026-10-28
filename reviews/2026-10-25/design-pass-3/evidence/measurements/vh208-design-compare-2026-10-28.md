<!-- markdownlint-disable -->

# VH-208 — design compare: Claude's reading and Codex astra's blind design check

Operational; the item file governs. Written by VH-208 #2, 2026-10-28 ~09:10Z.

## When each was saved
- Claude's reading, `vh208-claude-design.md` (VH-208 #1): saved 2026-10-28T08:30:48Z (file time), sha1 e96c263ce7858fe8815f8fffdf6d5614061dba38, confirmed unchanged at 09:01:17Z before Codex's answer was opened.
- Codex's brief, `vh208-codex-design-brief.md`: written by #2 from the item and `a87e0f5` only; it names no design, layout or preference of Claude's and confines Codex to `$R`. Run started 08:46:14Z (`codex exec -m gpt-6-astra -s read-only`).
- Codex's answer, `vh208-codex-design.md`: saved 09:00:59Z; opened 09:01:17Z, after the confirmation above. Before that, #2 saw only a 300-byte tail of the run's log while checking that it ran (code-search lines, none of its answer).
- #2 made no reading of its own beside #1's: it reads the design as #1 does.

## Agreed
- **The pick.** The whole card stays the one success notification, with the warnings as its content, not a nested notification: title and lines, then the warnings, then the player, the lifetime line and Save's actions row. Codex: "the whole-card success notification with a named, content-only warnings region"; Claude: Design A, leaning to the labelled section without the notification class. The same layout and the same sub-choice: the warnings keep a named region inside the card.
- `renderWarnings` gains a content-only mode for this caller only; the pre-flight sound panel keeps its default notification and reassurance.
- No element and no token added; one local spacing class on existing tokens at most.
- Save stays the notification's action (Carbon's actions row), the one primary; the card's focus target and the player's name (`aria-labelledby` to the card's title) stay.
- The other layouts (the player and Save moved out of the card; a warning-coloured card) break the card's success-kind recognition and the walker's `CARD`, `PLAYER`, `SAVE` selectors across the matrix.
- `paint` repaints words and warnings only, never rebuilding the controls or the Save closure; "Previous video" and Keep it go back through `renderResult`; after a save the player and lifetime line leave (VH-192), leaving title, lines, warnings, then the spent Save.
- The completion's policy belongs in `warningsSpoken`, keyed on the warning's code, not its words; the call site and Announce progress stay as they are, so S-151 gets the same line; other warnings stay heading-only; the pre-flight line has no heavy warning, so it is unchanged.
- The walker: `warnBox` requalified and returning the warnings' text only (W1 does: the card's child holding the titled list); S-136's and S-91's outside-the-card asserts must become order and no-nesting checks (the ruling with the owner).
- "Save stays available" means until saved; after a save it is spent, as now.

## Codex only
- **The detail's place in the line:** right after the heavy title, with the remaining titles after it in a second sentence formatted through `announce.lossSaid` with an empty detail. See Disagreed.
- **prove-8's abbreviated heavy detail** (`prove-8.mjs:53`): Codex would revise it. Taken: W3's fixture uses the full en-GB detail, so "whole" is proved on the real three-sentence string, not a one-sentence stand-in.
- **The M-01 heading-only good twins** (`prove-8.mjs:223, :227`): Codex would revise them. Not taken: W2 is a separate row of the completion check, so those twins still prove the titles row they were written for, unchanged; the heading-only case that must now fail is the new `warning-heading-only-bad`.
- **S-151's own predicate** (`scenarios.mjs:2681`): Codex would strengthen it. Not taken: it checks "ready", then heavy before metadata, which still holds under either placement, so it does not break; changing it is not an approved walker change; S-151's detail is read by W2's row in the limiting instrument, which runs on its records.
- **S-152's local assert** checks only the MediaError: agreed that the order, warning and completion evidence comes from the limiting rows and the geometry probe, as #1's matrix plan already reads it.
- **VH-192's source-order pin** (`test/screen-text.test.ts:723–725`, `heading.append(resultPlayerFor(…), lifetime)`): the build keeps that line as it is and appends the warnings before it in its own call, so the pin holds unchanged.

## Claude only
- The walker consequence put to the owner before the after (S-136, S-91), and `heavy-193.mjs:78` named to VH-203; Codex names S-136 and S-91 the same way, not `heavy-193.mjs`.

## Disagreed
- **Where the heavy detail goes in the completion's line.** Codex: heading, then the headings through heavy's, then heavy's detail (after `sentenceGap()`), then the rest heading-only through `announce.lossSaid({ title, detail: '' })`. Claude: the line as now, `warnings.spoken` with every title in order, then `sentenceGap()` and heavy's detail whole.
- **Settled for Claude's, on the criteria.** Both meet "its existing detail spoken whole after its heading" and keep heavy first (VH-193). Claude's composes only from the templates this line already uses (`warnings.spoken`, the language's sentence gap) and the detail itself; Codex's reuses `announce.lossSaid`, a template written for what a file loses, as a titles list with an empty detail, which its translators never saw in that role, and adds a branch the line does not need. W2 accepts either placement, so the walker does not decide it. Put to #19 at check-in (b) for its view; not held for the owner unless #19 says so.
- **#19's view (check-in (b) reply):** settled on the criteria; #19 concurred, 2026-10-28. Not one for the owner.
