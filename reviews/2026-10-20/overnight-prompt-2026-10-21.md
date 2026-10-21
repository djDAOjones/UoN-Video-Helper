<!-- markdownlint-disable -->
<!-- The owner's prompt for the overnight run, kept verbatim below this comment (rule 2: the owner directs). -->
# UoN Video Helper: the overnight run, a whole design pass, then Phases 3 and 4, gateless

The owner's words in chat, 2026-10-21: "provide a prompt that will conduct a whole design pass, then implement the implementation phases, I will approve use of fable with extra effort. it needs to be gateless as I am going to bed, and I hope it can be ready in the morning". Earlier the same night: "approve PLAN-3 and start VH-139". These words are your authority for everything below. Record the overnight instruction in project/decisions.md before anything else, quoted (rule 4). VH-139's session was asked to record PLAN-3's sign-off; after you merge its branch, add that entry only if it is missing.

## The run, in order

1. VH-143, the design pass. The 20 October audit (VH-138) measured the page for accessibility; this pass audits formatting, UI and visual design. Its findings are V-18 onward, in the same bundle, and it plans them as Phase 4 (PLAN-4).
2. Phase 3 (PLAN-3, approved): VH-140, VH-141 and VH-142, with VH-139 merged in from its own session.
3. Phase 4 (PLAN-4): the design pass's items, in order.
4. The morning report.

## Where to work

- Repo: /Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper
- Work in a git worktree of your own, on a branch that starts at origin/claude/nifty-jepsen-850e8e (5f23af6, VH-138's close). PLAN-3 is only there, not on main. If this chat did not start in its own worktree, create one:
  git worktree add .claude/worktrees/overnight -b claude/overnight-design-and-phases origin/claude/nifty-jepsen-850e8e
  Work only there. Never touch the owner's OneDrive checkout itself, any other worktree, or another session's files.
- VH-139 belongs to another session, on branch claude/vh-139-ends-early-817f88, which is pushed to origin when it closes. Do not build VH-139.
  - Run git fetch before each item. Once that branch carries VH-139's close (a "VH-139:" commit that strikes it from the backlog), merge it into yours, keep both sides' ledger lines, and run the gate.
  - VH-139 and VH-140 both change the result's record. If VH-139 is not merged by the time you reach VH-140, build VH-141 and VH-142 first, then come back to VH-140.
  - If VH-139 never closes, build around it and report.
- If your tools let you ask the app to keep the Mac awake, do it at the start.

## Gateless

- Wherever the record or a verb says to stop for the owner, take the conservative decision and carry on. Do not stop the run to ask.
  - The decision must keep to the brief's Direction and the adopted standards.
  - Record it as a decision entry saying it was taken gateless on the owner's instruction above.
  - Sign-off of PLAN-4 is pre-approved by the same words. Record that too.
- Conservative means:
  - the smallest change that meets the standard;
  - existing components, tokens and words before new ones;
  - nothing the owner has reserved.
- Reserved, and never decided tonight:
  - the page's structure: the three switchers above step 1, and folding (VH-97);
  - the sign-offs of VH-124 and VH-113;
  - VH-137 and V-09, the statement's review;
  - the date-only title card;
  - anything the brief's Direction does not cover.

  Each becomes a [!] line or a wish line, with your recommendation.
- Hard limits. If a piece of work hits one, skip that piece, record why, and carry on with the rest.
  - No new runtime dependency.
  - Never edit docs/*.md. A spec correction is a wish line.
  - If you change src/audio/kweighting.ts, loudness.ts or truepeak.ts, re-run the EBU harness in the same task. Never weaken test/ebu3341/.
  - No test deleted, skipped or weakened, and no pin loosened to make a check pass.
  - Never write to samples/. No media egress.
  - Nothing destructive: no force-push, no history rewrite, and no deleting a branch or worktree that is not yours.
  - Never push or merge to main, because that publishes the pilot. The owner merges in the morning.
- Translations: draft the Chinese and Malay for every new or changed string as machine translation, like the rest of the tables, as the VH-122, VH-127 and VH-128 decisions did. The drafts stand, and the morning report lists every one for approval.

## Read first

1. The rule-1 set, as AGENTS.md says. Read it again after any compaction.
2. For UI work, follow project/rules.md → By task:
   - UI-STANDARDS.md in full, including its Design review gate;
   - the carbon, nielsen and wcag-2.2-aaa digests;
   - project/architecture.md and the house conventions;
   - docs/01-specification.md, read only, chiefly §9 and §13.
3. The 20 October bundle, starting at reviews/2026-10-20/README.md: the audit, the regression table, the state table, the WCAG table, and Codex astra's audit and critique. The walker is in reviews/2026-10-20/evidence/measurements/walker/.
4. The 1 October design standard: reviews/2026-10-01/vh-124/README.md with its before/ and after/ captures, and the acceptance criteria in project/items/VH-124.md.
5. PLAN-3's items: project/items/VH-139.md to VH-142.md.

## 1. VH-143, the design pass

Open the item:
- First check that VH-143 and PLAN-4 are still free on every branch. If either is taken, use the next free ID throughout.
- Add a heading under Current, "### Design pass", with the line:
  - [~] VH-143 — The design pass: formatting, UI and visual design against the 2026-10-01 standard — since 2026-10-21
- Create project/items/VH-143.md to the schema in project/items/_schema.md.

The standard, beyond what VH-138 measured:
- VH-124's design criteria, on every state, new ones included:
  - one clear next action, and nothing competing with it;
  - no line repeating another in view;
  - every list item and sentence starts with a capital and ends with a full stop;
  - layout, spacing and type come only from the two token files, on the Carbon scale;
  - every control meets VH-112's rules.
- Spec §13's wider GUI review: design and layout against Carbon's productive patterns, clarity of language and of process, the word count per state, and distraction.
- All 14 points of UI-STANDARDS' Design review gate, for each surface added since 1 October:
  - the switchers and the machine-translation notice;
  - Video type and Video language;
  - Step 3's title cards;
  - the closings and the Internal use only box;
  - the decode-damage note;
  - the accessibility statement and the footer;
  - the trim preview.

What to measure and judge:
- **Tokens.** Sweep the computed styles of every element in every state. Trace every margin, padding, gap, font size, line height, border, radius and colour to a token in the two token files on Carbon's scale. Anything else is a finding.
- **Hierarchy and rhythm.**
  - The type scale and weights in each state.
  - Paragraph and section spacing.
  - Alignment to one grid.
  - The visual weight of the three switchers and the notice above step 1.
  - The page's growth: the ready page was 2,765 px tall on 1 October and is 3,722 px now. Judge it for distraction, not as a case for folding.
- **One component for one job.** Compare the verdict, warnings, losses, failures and every note added since (decode damage, the card's refusals, the notice, the statement) against VH-124's single inline notification. Do the same for buttons, segments and checkboxes.
- **Formatting of every string in all three tables.**
  - Capitals, full stops, punctuation and quotation marks.
  - en-GB spelling.
  - The same word for the same thing everywhere (the kind of fault V-08 found).
  - Numbers, times, dates, sizes and units going through Intl as the code intends.
  - Chinese full-width punctuation and spacing, per the VH-122 decision.
  - Malay consistency.

  The verdict on meaning stays with the native-speaking colleagues.
- **Word count** per state, against VH-124's after-states.
- **The Chinese measure.** Check the 40ic limit, this time with a state that has long Chinese text (the statement).
- **The frames the app draws.** The title cards and closings at 16:9, 9:16, 3:4 and 4:3, in all three languages, against their type scale (VH-127, VH-128).
- **Before against after.** Capture the same states as VH-124's after/ captures, side by side, and note what has drifted since 1 October.

Method, as on 20 October:
- Rebuild the walker from the bundle.
- ffmpeg fixtures only. Never use samples/.
- Views: 1280 × 900; 390 × 844 with mobile emulation; 320 px; text spacing; light, dark and forced colours.
- Walk all three languages, both switch positions, with a card on and off, and with every closing.
- Codex astra (codex exec -m gpt-6-astra -s read-only) does a blind design review from the same brief, in the background while you walk.
  - Verify each of its findings live, or in source where the browser cannot reach.
  - Before you commit, have it critique the merged draft, and apply what holds.
  - Keep its review and its critique as written.

Deliverables, in reviews/2026-10-20/:
- design-pass-2026-10-21.md:
  - findings V-18 onward, in the audit's format: saw, standard, direction, source, evidence, and the same three ranks;
  - "What held up";
  - "Set aside, with reasons".
- The token sweep and the word counts, in evidence/measurements/.
- Screenshots in evidence/, named by finding.
- The audit's Disposition table and README extended, so that all the findings read as one list.

Then plan, with verbs/plan.md on V-18 onward:
- A design finding that lands on the same lines as a Phase 3 item joins that item's acceptance criteria, through a dated note and a decision, so no line is changed twice.
- The rest become "### Phase 4 — <name>", with items numbered from the next free ID, in order, each with its own file.
- Record PLAN-4 with its Items line, signed off gateless as above.
- Close VH-143 per verbs/close.md.

## 2 and 3. Build Phase 3, then Phase 4

Take each item in order, with VH-139's merge handled as above, following Step 5 of verbs/plan.md and verbs/close.md:
- Meet every acceptance criterion. Tests by category. New English passes the readability gate.
- Check the item in Chrome with the walker: the states it changes, in the views and languages it reaches.
- node tools/check.mjs and npm run check must both be green.
  - Kill your headless browsers first.
  - Never run the check beside run-in-engines.mjs.
  - Never time anything in the built-in browser pane.
- Commit as "ID: summary" with a Verify: line.
- Then run codex exec review --commit <sha> -m gpt-6-astra. Fix what holds in a follow-up commit and record the rest. The close carries a Checked: line.
- Push your branch to origin after each close. Stage explicit paths only.
- When every item in a phase is closed, close the phase as rule 11 says.

## Context and time

- At the start, commit this prompt verbatim as reviews/2026-10-20/overnight-prompt-2026-10-21.md, so each later session can read it.
- The profile's Session line is 200k tokens, and a hook ends a session that passes it at its next close. When that happens, do not stop the run. At that close:
  1. Write a hand-off note in reviews/2026-10-20/ saying where the run is, what is next, and anything in flight.
  2. Commit it with the Session-end line the hook asks for, and push.
  3. Start the next session yourself with start_session. The owner asked for this chain. Use initiation "user_asked", context "fresh", model claude-fable-5-1 and effort xhigh. Give it a prompt that:
     - names this worktree's absolute path and branch, and says to work only there;
     - says: "Continue the overnight run: read reviews/2026-10-20/overnight-prompt-2026-10-21.md, then the latest hand-off note."
- Before starting each item, check the time. After 07:00 UK time, start no new item: finish the one in hand, close it, and report.

## The morning report

Write it as reviews/2026-10-20/overnight-report-2026-10-21.md, commit and push it, and end with the same text in chat:
- the branch, its last commit and how to merge it to main, and whether VH-139's branch is merged in;
- for each item: shipped or not, its commits, the gate result, and what was and was not checked in Chrome;
- the design pass: the findings by rank, and where each one went;
- every decision taken gateless, one line each, for the owner to confirm or reverse;
- every new or changed Chinese and Malay string, for approval;
- the owner's questions and the reserved items, each with your recommendation;
- anything skipped at a hard limit, and why.
