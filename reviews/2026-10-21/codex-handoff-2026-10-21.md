# Codex hand-off, 2026-10-21 — VH-148, then Phase 3 and Phase 4

Claude usage is paused for the week on the owner's word ("you can continue
to blitz chatgpt as lots of usage left"; decisions, 2026-10-21, VH-148).
You, Codex, are the writer in this worktree until the run below is done.
Claude Code writes nothing here meanwhile.

## Where you work

- Worktree `.claude/worktrees/overnight`, branch
  `claude/overnight-design-and-phases`, level with `origin/main` at the
  start. Work only there; never in the repository root above it (a stale
  checkout on another branch).
- Push after every close as the profile's Push line says and as the
  overnight run did: the branch, and `main` (`git push origin HEAD` and
  `git push origin HEAD:main`). A push to `main` publishes the pilot.
- The owner is away. Where the record or a verb would stop for the owner,
  take the conservative choice, record it as taken gateless, and carry on
  (decisions, 2026-10-21, VH-143, the overnight instruction).

## Before your first change (AGENTS.md rule 1)

Read `AGENTS.md`, `project/profile.md`, `project/rules.md`, the Direction
in `project/brief.md`, the open items in `project/backlog.md`, the latest
ten entries of `project/decisions.md` (heading, Decision, Deferred), and
the latest trajectory lines. For UI work, the routed documents in
`project/rules.md`'s By task table: `UI-STANDARDS.md`, the Carbon, Nielsen,
WCAG and house-conventions digests, `project/architecture.md`.
Read `reviews/2026-10-20/overnight-handoff-2026-10-21-04.md` for how the
run has worked (the walker, the trajectory budget, the archive's two slips).

## The run, in order

1. **VH-148** — `project/items/VH-148.md`. All its criteria, the footer
   included (details below). VH-124 closes with it.
2. **VH-141** — `project/items/VH-141.md`.
3. **VH-142** — `project/items/VH-142.md`.
4. **Phase 3's close** — rule 11 and `verbs/recall.md`, as PLAN-1's and
   PLAN-2's closes did (decisions, 2026-10-20, PLAN-2).
5. **VH-144**, **VH-145**, **VH-146** — their item files; then Phase 4's
   close the same way.
6. A short report at `reviews/2026-10-21/codex-run-report-2026-10-21.md`:
   each item's outcome, the gate at each close, what only a person can
   check, and anything taken gateless.

Not in the run: the writing review's 24 proposals
(`reviews/2026-10-21/writing-review-2026-10-21.md`) wait for the owner's
approval. Do not apply them. Where VH-142 or another item touches the same
string, leave the review's proposal for the owner and do only what the
item asks.

## VH-148 in detail

The owner's words are quoted in the item's Notes. What to build:

1. `browser.passed` becomes "This app is designed and built for Chrome,
   and this browser has passed the checks for it to run." Keep "This app".
2. The switch headings (Page language, Video type, Video language) read as
   the heading of their group: larger or semibold, from type tokens in
   `tokens.carbon.css`, never a literal. VH-135 made the segments reserve
   their bold width so nothing moves on a choice; keep that. If you add a
   weight token, name it as a type role so VH-145 can reuse it.
3. Every bare noun "closing" in user-facing strings becomes "closing
   graphics", with the verb agreeing ("the blue closing graphics fade
   in"). "Closing card" and the legend "Closing branding" stay. All three
   languages where the translation names the closing on its own.
4. `videoLanguage.helper` puts "What you type is kept as typed." on a line
   of its own. In step 3 (title card and closing branding), a helper that
   holds two separate facts gives the second its own line, for example
   "The card says “Internal use only” under the logo." Prefer two strings
   or two elements over a `<br>` inside a translated string; follow how
   the page already draws multi-sentence helpers.
5. The read line (`choose.readSummary` and the code that composes its
   facts) drops the duration and the frame size. With sound it says
   "Video read." alone; with no sound, "Video read." then "No sound." in
   bold, still heard by a screen reader (check the live region). Check
   that Video properties still shows the duration and size.
6. The trim bar's parts outside the handles look cut: lighter and hatched,
   or a distinct colour, at 3:1 against the part kept (WCAG 1.4.11), in
   light, dark and forced colours (a pattern or border survives forced
   colours where a fill does not). Tokens only.
7. A select's chevron has room on its right, from a spacing token; the
   44 px target and forced colours kept.
8. `details.smaller` becomes "For Moodle assignment uploads, messaging, or
   email etc." in all three languages.
9. The statement drops "Joe Bell runs it at the University of
   Nottingham." and its translations; the rest of the statement stays.
10. The footer (`footer.contact`, `src/config/feedback.ts`): the first
    link goes to the Creators team on Teams, opening in a new tab and
    saying so in its words as VH-135's Equality Advisory link does; the
    second stays "Email the learning content team", a mailto to
    `UI-Learning-Content@nottingham.ac.uk`. Both addresses are named
    constants in `src/config/`. The Teams address, exactly:
    `https://teams.microsoft.com/l/team/19%3A14c7a4d2bf43456fa0c3c52c851fb097%40thread.tacv2/conversations?groupId=bd942b5f-5389-410c-abf2-9ba087360738&tenantId=67bda7ee-fd80-41ef-ac91-358418290a1e`.
    The feedback dialog and `ACCESSIBILITY_CONTACT_ADDRESS` keep the
    owner's address. Update the JSDoc above `footer`.
11. A disabled button takes the dashed edge a disabled field takes, in
    light, dark and forced colours, with the same border width so nothing
    shifts.
12. The footer's panel headings (14 px, near `app.css:885`) take the 16 px
    subheading step from the type token the other subheadings use.
13. The footer's two contact links take no full stop, since a link is a
    label like a button's. If a test pins VH-124's full-stop rule over
    them, name them there as an exception with that reason; do not loosen
    the rule.

Strings go through the strings sheet and `scripts/strings-table.mjs`, as
VH-139 (`7e38144`, `b3b7c2b`) and VH-140 (`b05121a`) did. The Chinese and
Malay are your drafts, marked "drafted by the agent" in the sheet. Update
`test/screen-text.test.ts` and every other pin; weaken none. Do not edit
`docs/`; a spec sentence now out of date is a wish line with your drafted
wording, for the owner to approve.

## Each close (AGENTS.md rules 6 to 10)

- `npm run check` green, no test deleted or skipped. Run it on a settled
  machine; a slow DSP timeout means rerun, not change.
- A Chrome check of what changed, at 1280 px and 375 px, in all three
  languages, light, dark and forced colours, with the walker or headless
  Chrome; recorded in the item's Notes. Name what only a person can check
  as a wish line.
- The ledger: a decisions entry (Decision, Rationale, Supersedes,
  Deferred), the backlog line struck, one trajectory line under 55 words
  (the last four must stay within 300), any deferral as a wish line.
  VH-148's close also strikes VH-124 and adds its trajectory line, and
  retires the wish line "The owner's walk-through of VH-124 judges three
  readings from the design pass", which VH-148 answers.
- `node tools/check.mjs`: no structural or budget failure.
- Commit as `ID: summary` with a `Verify:` line giving the gate result,
  and `Co-Authored-By` as earlier commits do if your harness adds one.
  No `Checked:` line: no second model reviews this run.
- Commit only that item's files, then push as above.
