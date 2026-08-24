---
description: Draft or extend a backlog from loose ideas or a transcript; author tickets to the skeleton
---

# Backlog Authoring

Turn unstructured input — a list of ideas, meeting notes, a
conversational transcript, a brain-dump — into grammar-true backlog
items and, where an item outgrows its line, a ticket file. This is
also the **external authoring contract**: an outside agent asked to
"write the tickets" produces exactly what this file specifies.

## Inputs

- The raw material (pasted, or a file path).
- The project's existing `pm_skills/project/backlog.md` (grammar
  comment + current milestones) and, if present, its grading
  convention.

## Procedure

1. **Extract candidates.** One line per distinct intent found in the
   input. Merge duplicates; keep the source's wording where it is
   already sharp. Nothing is dropped silently — list what you set
   aside and why (out of scope, already shipped, already queued).
2. **Draft items in the grammar.** The canonical grammar lives in
   the backlog template's comments — quick items stay one line
   (`- [ ] **ID Short title** — description`); non-trivial or
   sign-off items add `Intent:` and `Done when:` lines. Mint IDs in
   the project's style. Apply the project's grades if it uses them.
3. **Group by milestone.** Current = the smallest committed slice
   that delivers value next; Next = committed but not next; Icebox =
   kept with an explicit trigger where one exists. State the
   ordering rationale in one line per milestone.
4. **Author tickets for outgrown items.** If an item carries more
   context than its line holds (research, options, acceptance
   detail), create `tickets/<ID>.md` from the skeleton below and add
   the `[detail]` flag, written as a Markdown link targeting the
   ticket file. Working detail only (soft budget per
   `pm_skills/memory-policy.md`); the why still goes to the decision
   log when the item ships.
5. **Present before writing.** Show the proposed items, placements,
   and any tickets; apply on approval. In a gateless run, state the
   placement rationale as assumptions and write directly.

## The ticket skeleton (canonical)

```markdown
# <ID> — <Short title>

> **Status:** <milestone> · **Grades:** <Impact / Difficulty /
> Risk / OpΔ, if the project grades>.

## Intent

## Done when

## Evidence / context

## Approach

## Constraints

## Open questions
```

## Records mode

Some projects run the backlog as **records**: one `tickets/<ID>.md`
per open item, with the Active section of `backlog.md` generated
from them by `pm_skills/scaffold/gen-backlog.mjs` (adoption and
tooling: `pm_skills/GUIDE.md` → "Records mode"). There, author
records, never view lines — the procedure above applies unchanged,
but "draft items in the grammar" means writing flat frontmatter over
the ticket body, and the view follows:

```text
---
id: VENUE-12
name: Short title
status: todo
milestone: current
flags: detail, blocked
blocked-on: what it waits for
date: 2026-08-17
grades: High / Medium / Low / Low
order: 1
summary: one or two sentences; this line becomes the view item text.
---
# VENUE-12 — Short title

(ticket body — the skeleton above, for items with outgrown context)
```

`status` is `todo` / `in-progress` / `cut`; `milestone` must be a
configured group key; `flags` is a comma list (`detail` renders as
the one-hop link, `blocked` pairs with `blocked-on`); `date` is the
creation date standing items need; `grades` and `order` are
optional. `tickets/_meta.md` holds per-group `<key>-intent:` lines
and the dialect keys — `milestones: key=Title, …` (ordered; absent →
Current / Next / Icebox) and `flags: …` (extra validator-known
flags; custom flags are known, never standing).

Grammar notes the frontmatter forces:

- **Every item needs an ID — icebox one-liners included** (mint one
  at adoption). IDs are SCREAMING-KEBAB: capitals, digits, and
  hyphens only — **no dots** (the validator's ID parse stops at
  one, so a `CL-4.4.0-…` style label truncates; write `CL-440-…`).
- **`summary:` is one physical line** — frontmatter cannot
  hard-wrap. Keep it to a sentence or two; the generator wraps the
  rendered view line. Context that outgrows the summary goes in the
  ticket body, exactly as for `[detail]` tickets.
- **Edit records and regenerate — never hand-edit the view** between
  the generated markers. A record naming a milestone outside the
  configured groups is a generation error, never a silent drop.

## Rules

- Grammar-true or not at all: an item that does not parse under the
  template grammar is a defect, not a style choice (a memory
  validator may enforce this mechanically).
- Never invent commitments: milestone placement proposes; the
  maintainer's confirmation disposes.
- Do not create a ticket for an item that fits its line — ticket
  files are for outgrown context, and they are deleted when the item
  ships or is cut. (Records mode inverts this one rule: every item
  is a record; the body simply stays empty until context outgrows
  the summary. Shipped records move to the archive instead of being
  deleted, if the project archives.)
- Ideas that are not work items (questions, observations) go to the
  wish-list, one line each, not the backlog.
