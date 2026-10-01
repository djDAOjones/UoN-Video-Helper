# UI Standards

This file contains the full UI, usability, and accessibility rules for
the project. `AGENTS.md` references this file. Read it before any task
that touches UI, controls, layout, text, states, accessibility, or
user-facing behaviour.

---

## Design system

IBM Carbon Design System is the **reference standard** for this
project. Carbon is not installed as a package dependency. All UI
components are implemented in the project's own code to match Carbon's
productive design language: component anatomy, interaction behaviour,
spacing, sizing, and visual conventions.

### Carbon-first UI discipline

- Prefer Carbon components, patterns, tokens, spacing, and interaction
  conventions wherever a suitable Carbon solution exists. Do not invent
  a custom control if Carbon already provides an appropriate one.
- Use Carbon's **productive** UI style for the working interface, not
  expressive or marketing styling.
- Use semantic design tokens for colour, spacing, typography, layer,
  border, and state. Do not hard-code ad hoc UI values unless there is
  no suitable tokenised equivalent.
- Keep layouts modular, consistent, and task-focused. Reuse an existing
  Carbon pattern before creating a new one.
- Where Carbon defaults meet AA but not this project's stricter AAA
  target, adapt them. Carbon is the baseline, not the ceiling.

### Token systems

Two token systems run side by side. **Do not collapse one into the
other.**

| System | Governs | Source |
| --- | --- | --- |
| **UoN brand tokens** | Colour and typeface: the palette and its tints, and the colour ROLES assigned from it — surfaces, text, borders, interactive, focus — plus the heading and body font stacks and the logo's size and clear space | `src/styles/tokens.brand.css` |
| **Carbon conventions** | Shape: spacing scale, type scale, motion, the 44 px target floor — and status colour, which the brand palette cannot supply at AAA | `src/styles/tokens.carbon.css` — implemented to match Carbon's spec, never installed as a package |

When adding a token, decide which system owns it from the table above.
Colour is the brand's. How big, how far apart and how a control behaves is
Carbon's. The role NAMES — `--layer-01`, `--text-primary`, `--interactive` —
are Carbon's vocabulary and stay what `app.css` uses; since VH-92 their
VALUES are assigned from the University's palette, in the brand file. That
is the division, not a collapse of it: no rule in `app.css` names a brand
colour, and no hex value appears outside the two token files.

The roles are assigned three times — light, dark, and `.on-brand-blue`, the
context inside a Nottingham Blue band — and the last two are identical by
test. A rule written inside a band names roles like any other and comes out
light on blue, focus ring included.

### The brand background (D1)

D1 was answered on 2026-08-27: the colour that pads non-16:9 sources around
the branding (spec §4.3) is Nottingham Blue, verified against the shipped
closing tail. It lives in exactly one place:

```css
--uon-brand-blue: #10263b;
--uon-brand-bg: var(--uon-brand-blue);
```

Reference it as `var(--uon-brand-bg)` everywhere. Never inline the hex.

### What the brand rules require here

Read from the University's brand pages, 2026-09-30, and binding on this
interface:

- **No black.** Text is Nottingham Blue or white.
- **No pure white ground.** The page is the 5% blue tint; panels are Portland
  Stone.
- **Nottingham Blue dominant**, with at most two supporting colours.
- **Bands are not sticky.** A band that follows the scroll can cover the
  focused control (WCAG 2.4.11).
- **Shape stays Carbon productive.** The website's pill buttons are not
  adopted.
- **The logo is a trademark.** It is never redrawn, recoloured or cropped; it
  is drawn as nottingham.ac.uk draws it — 62 px high, top-left against the
  window edge, 12 px clear above and below, 20 px in; its `alt` is
  "University of Nottingham". See `src/assets/README.md`.

### Contrast

The AAA target (7:1 normal text, 4.5:1 large) is checked against the
**brand** palette, not assumed from it — `test/contrast.test.ts` resolves
every role to the hex it is drawn in and measures each pair the app renders,
in all three contexts. If a UoN brand colour cannot reach 7:1 against its
background, that is an exception to be documented per the design review
gate — not a reason to silently drop to AA.

One such exception is settled: **status colour is not the brand's.** Jubilee
Red measures 6.4:1 on white, so error, success and warning keep Carbon's -80
steps on light surfaces and -20 steps on blue ones.

---

## Usability heuristics

Nielsen's heuristics are **hard rules**, not aspirations.

### Content and form (Carbon rules)

- **Sentence case** for all UI text.
- Every input must have a visible label. No colons after labels.
- Visible label text must match the accessible name.
- Labels: concise, 1–3 words where practical.
- Helper text only when it prevents error, clarifies format, or
  explains consequence.
- Prefer native HTML form controls before custom ARIA widgets.
- Use user language, not implementation terms.

### System status

- Every async action must show status: loading, progress, success,
  or error. The UI must never appear frozen.
- Important status changes must be announced programmatically, not
  only shown visually. A live region is for what the user did not cause
  or cannot see — a stage change, an outcome, validation — never a
  control's own result on the keystroke that produced it, which is read
  on demand through `aria-describedby`. Routine progress is announced at
  stage changes and a few milestones, never every percent, and the user
  can switch those announcements off (WCAG 2.2.4; VH-109).
- Auto-save, export, import, and recovery states must be visible.

### Empty and no-data states

- Every panel must have an intentional empty state explaining what
  belongs here and what to do next.
- Distinguish "nothing yet," "filtered out," "failed to load," and
  "not available." No blank panels or silent failures.
- Loading states must preserve layout stability — no content jumps.

### User control and freedom

- Provide cancel, undo, or back-out routes for non-trivial actions.
- Destructive actions require confirmation or reliable undo.
- Do not trap users in modes, overlays, or incomplete flows.

### Consistency

- Same words, icons, patterns, and spacing for the same concepts
  throughout. Do not create synonyms for existing concepts.
- Follow existing Carbon conventions and established design tokens.

### Error prevention and recovery

- Constrain invalid input, validate early, disable impossible actions.
- Prefer safe defaults. No silent propagation of invalid states.
- Error messages must say what happened and what to do next.
- Errors must be specific, human-readable, and linked to the relevant
  control. No vague "Something went wrong" without actionable detail.

### Recognition over recall

- Keep key controls visible. Show current selection, mode, and state
  explicitly. Surface context near the point of action.

### Flexibility and efficiency

- Support novice and repeat use. Expose shortcuts for common actions.
- Provide click, tap, and keyboard alternatives — avoid drag-only
  interactions.

### Minimalist design

- Keep interfaces lean and task-relevant. No decorative chrome,
  redundant copy, or competing calls to action.

### Motion discipline

- Motion must be subtle, purposeful, and easy to ignore.
- Respect `prefers-reduced-motion`. No motion as the only carrier
  of meaning. No content flashing more than 3 times per second.

### Help and contextual guidance

- Provide contextual help (tooltips, helper text, inline guidance)
  for non-obvious controls and workflows.
- Help content must be task-focused, concrete, and brief.

---

## Accessibility — WCAG 2.2 AAA by default

Target **WCAG 2.2 AAA** for all applicable UI. Document exceptions
explicitly. Where a criterion cannot reasonably apply, record it in
implementation notes.

### Perceivable

- Text contrast: **7:1** (large text may use **4.5:1** where WCAG
  permits).
- Do not rely on colour alone for state, status, or meaning.
- Link text must make sense on its own — no "click here."
- Use headings and landmarks for substantial content. Provide text
  alternatives for meaningful non-text content.

### Operable

- All functionality must be keyboard operable without traps.
- Focus order must be logical. Focus indicators must be visible and
  not obscured by sticky headers or overlays.
- Pointer targets: **≥ 44 × 44 CSS px** unless a WCAG exception
  applies.
- Do not require path-based gestures or fine motor precision when a
  simpler alternative exists.
- Provide pause/stop/hide for moving or auto-updating content.
- Warn before timeouts that could cause data loss.

### Understandable

- Predictable behaviour. No unexpected context changes on focus or
  input.
- Form instructions and validation near the relevant control.
- Visible labels and accessible names must match for speech input.

### Robust

- Semantic HTML before ARIA. No ARIA is better than bad ARIA.
- Dynamic updates (loading, validation, errors) exposed
  programmatically. Custom widgets must expose role, name, value,
  and state correctly.

---

## Diagnostics affordance

The "copy diagnostics" control is how a maintainer hands the app's own
diagnostic snapshot to an AI agent. The underlying logger, the bundle
contents, and the redaction rules live in `DEV-INFRASTRUCTURE.md` →
"Maintainer diagnostics"; this section governs how the control looks and
behaves. It applies to any project with meaningful UI. A Tier 0 project
with no UI has no affordance — it still logs errors legibly.

### Placement

Do not drop a floating debug wart over the working UI. Prefer, in order:

- An existing dev or status toolbar, if the app has one.
- An app-shell utility menu, if there is a permanent header or sidebar.
- A small floating debug button only if no suitable permanent surface
  exists. Allow a position token: `bottom-right` (default),
  `bottom-left`, `top-right`, or `relative`.

Never let it cover primary navigation, submit buttons, chat inputs,
toasts, or critical status.

### Behaviour and styling

- **Dev-only by default.** Hidden in production unless an explicit
  opt-in is set (gated per `DEV-INFRASTRUCTURE.md` → "Maintainer
  diagnostics"); production exposure requires a redaction review.
  The one production reader is the feedback dialog (VH-93, reviewed in
  the decision log): it sends a short allow-list of named facts
  (`src/ui/feedback.ts`), never the whole bundle, shows every line
  before it goes, and leaves through the user's own email app.
- **Carbon icon button** with a tooltip naming the action in sentence
  case (e.g. "Copy diagnostics"). Visible label and accessible name
  must match.
- **≥ 44 × 44 CSS px** target, visible focus ring, fully keyboard
  operable.
- **Feedback after copy.** Announce success or failure programmatically,
  not by colour alone (e.g. an inline status or toast) — never a silent
  copy. Say what was copied (a redacted bundle) so expectations are set.
- Honour `prefers-reduced-motion` for any reveal or animation.

---

## Design review gate

Before sign-off on any UI-affecting change, verify:

1. Which Carbon component or pattern this change follows.
2. Why a custom pattern was necessary if Carbon was not used.
3. Which Nielsen heuristics were most at risk.
4. Text contrast meets **7:1** for normal text and **4.5:1** for large
   text where permitted.
5. Focus order, focus visibility, and focus non-obscuration still work.
6. All pointer targets meet **44 × 44 CSS px** unless a documented WCAG
   exception applies.
7. Visible labels match accessible names.
8. Link text is self-describing without surrounding context.
9. Empty, loading, success, validation, and error states were all
   considered and are not visual-only.
10. Keyboard, pointer, and assistive-technology routes all still work.
11. Motion can be reduced or disabled where non-essential.
12. Critical submissions or destructive actions support validation,
    confirmation, undo, or reversal as appropriate.
13. Any exception to the AAA-by-default rule is documented explicitly.
14. If a diagnostics affordance is present: it is dev-only by default,
    Carbon-styled, ≥ 44 × 44 CSS px, keyboard operable, gives copy
    feedback, and sits on a permanent surface without covering primary
    controls.
