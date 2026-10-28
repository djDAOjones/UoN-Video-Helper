<!-- markdownlint-disable -->

# VH-208 — Claude's design reading (saved before any Codex design answer)

Saved 2026-10-28 ~08:45Z by VH-208 #1, from `a87e0f5`'s source. Operational; the item file governs.

## The card

At `a87e0f5` the finished card is one success `section.notification` (title, record line, ended line, differs line, then the player, the lifetime line and the actions row with Save, all inside it), and `resultWarnings` is a sibling `div` after it holding a separate warning `section.notification` (`processResult.replaceChildren(heading, resultWarnings)`).

**Design A (chosen): the warnings inside the one success shell, before the player.** `heading.append(resultWarnings, player, lifetime)` (then the actions row, as now), and `processResult.replaceChildren(heading)`. `renderWarnings` gains an option that draws the same content without its notification shell for this caller only: the warnings' title ("Worth knowing about the finished video") and the existing titled-items list, the same words, no reassurance tail, and no `section.notification`, so no notification is nested in another and the card keeps one rail. The pre-flight sound panel, its other caller, keeps the default (its shell) unchanged.
- Order, DOM and painted alike: title, lines, warnings, player, lifetime, Save. `paint` redraws the warnings in place on a language change and after a save; "Previous video", Keep it and the re-render after a file choice go through the same `paint`.
- No element added: the `div` is reused, the section that wrapped the warnings goes; its title `p` and list are the ones the notification drew. One class may be added to the reused `div` for its top spacing (`--spacing-05`, as the player's), in `app.css` on existing tokens.
- What is lost: the warnings' own amber rail and their separate region. The title still says the thing (UI-STANDARDS: never colour alone). Whether to keep a region name for the warnings inside the card (a `section` with `aria-labelledby`, not a `.notification`) or a plain title paragraph and list is the one open sub-choice; Claude leans to keeping the labelled section without the notification class, so the tree still reads a region "Worth knowing about the finished video", now inside the card and before the Video.

**Design B (rejected): the warnings as a sibling notification, with the player, lifetime and Save moved out of the card after it.** It keeps two rails apart, but Save and the player leave the card's region and its focus target, Save loses the notification's action row (Carbon), and the walker's `P8_PLAYER` and `SAVE` selectors (inside the card) break across the matrix.

## The completion line

`warningsSpoken` (announce.ts) keeps every warning's heading in the series, as now, and appends heavy limiting's existing `detail`, whole, after the line: "…finished video: The loudest moments were held down hard[; other titles]. To reach the usual level, … record the sound." No string is new or split; other warnings stay heading-only; the call site and Announce progress (S-151) are unchanged, since the completion is an outcome, always announced.

## The walker consequence

Design A puts the warnings' text inside `P8_CARD`, so S-136's and S-91's "beside the card, not inside it" asserts (scenarios.mjs:2453, :2845) fail. Changing them is not among the approved walker changes: put to #19 before the after.
