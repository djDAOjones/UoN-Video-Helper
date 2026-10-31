<!-- markdownlint-disable -->

# VH-229 — The design compare

Claude's reading saved before Codex's answer was opened (progress notes, 2026-10-31 09:14:29).

**Agreed:** the existing `.lede` becomes the panel, the promises then the privacy line, `#browser-note` a sibling after it, no live region; a non-wrapping flex row with a shrinking heading and a whole 44 px "?"; not `wireToggletip`'s closing rule; an open tip takes the Escape first, listeners' order the trap; Escape from the "?", the panel or nowhere closes and returns focus; never steals focus from a control elsewhere; the dialog keeps its Escape; the rows S-141 to S-144, VH-207's f2 and S-03 and S-142 reported, not edited; VH-216.3 redrawn; VH-175.4 kept.

**Codex only, taken:** `main.ts` inserts the translation notice before the `h1`, and into a flex row it would be a third child: it goes before the wrapper. The direct-main `h1` and notice-insertion assertions need revising. `event.repeat`: one layer per press. The mouse-down reason in the item is imprecise. To be read in the build: `overflow-wrap` on the heading if a word overflows at the 32 px font (measured with "Finisher", and Malay's own title), so the check is the measure, added only if needed.

**Claude only:** closing the tip on collapse needs no code, since focus or a click leaving the tip closes it first; the probe tests it. Keeps `lede.about.label` beside `lede.formatHelp`.

**Disagreed, small, settled on his word:** Escape with focus on a control elsewhere. Codex: the panel closes, focus kept. Claude: the panel stays. His approved §9.2 line says it "stays open until pressed again"; closing would also move the page under a person's focus. The panel stays. Chinese: Codex 此工具, Claude 本工具; the page's own count decides, in the next line of the build.
