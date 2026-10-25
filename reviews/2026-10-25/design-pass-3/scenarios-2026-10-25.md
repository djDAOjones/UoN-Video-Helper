<!-- markdownlint-disable -->

# The scenarios — pass 3, VH-197, 25 October 2026

The page is described as it stands at `2bcb191`. `src/` and `index.html`
last changed at `e226410` (VH-193); VH-194 changed documents only. Every
`file:line` here is at `2bcb191`. Phase 7's file
([`scenarios-2026-10-22.md`](../../2026-10-22/design-pass-2/scenarios-2026-10-22.md))
is the base, and its columns and terms hold. "Choices" still means Video
type, Video language, trim, card, closing and preset, though Video language
now sits in step 3. "Focus held" means `focusHeldBy` (`src/main.ts:915`),
whose rule is in `src/ui/focus-hand-on.ts` (VH-178). It moves focus only if
focus was on a control the change removes. The walker is Phase 7's
(`reviews/2026-10-22/design-pass-2/evidence/measurements/walker/`), copied
into this bundle by VH-198, with the checks of Phase 8's item runners folded
in as assertions.

## Carried over

S-01 to S-91 carry over by ID from Phase 7's file, and are not copied
again. So do the walker's variants, as its `scenarios.mjs` declares them:
S-01b, S-06a and b, S-16-45 and S-16-120 (VH-180), S-25a and b, S-26a and b,
S-37a and b, S-ID1 to S-ID3, S-45a and b, S-47a to c, S-53-W and -LW, S-54a
to d, S-55a to c, S-58-W and -LW, S-63-W and -LW, S-70a to c, S-72a and b,
S-78k, S-79a and b, S-80a and b, and S-90a and b. VH-178's twelve
transitions (T-46.1 to T-46e-storage) and the routes J1 to J4 and K-dialog
carry over too, revised below. The walker's four left out (S-12, S-13, S-34
and S-51) stay out for the reasons it records, and S-84 is still S-03 at
320 px. Every record now draws the lede's five promises and its "?", Video type
alone above step 1, and the footer's "Help and feedback". So the
page-wide rows of the measure, type, overflow, target and focus instruments
change in every record; the before and after group them by subject, as
VH-176 grouped step 4's new name (504 rows). A carried scenario not in the
table below keeps Phase 7's expectations. Read and unchanged, though they
sit near a change: S-05 (the translation note keeps the owner's address,
Q1a, `src/config/feedback.ts:42`), S-21, S-22, S-23, S-35, S-74 (Errors
captured keeps "Report this problem", `index.html:671–673`), S-85 and S-87.

### Carried scenarios Phase 8 changed

| ID | Item(s) | What changed (old → new) | The walker's assertion must now expect |
| --- | --- | --- | --- |
| S-01 | VH-187 | The browser note: `browserNote.pending` above step 1 → hidden and empty while a check is pending (`index.html:82`; `src/ui/system-check.ts:71–74`; `src/main.ts:808–810`) | `#browser-note` hidden and empty; step 1 alone says "Checking whether this browser can run the tool…" (`src/i18n/en-GB.ts:144`) |
| S-01b | VH-187, VH-182 | Held past 5 s, the worker's row fails, so the note now shows; `startup.workerNotStarted` names the renamed button (`en-GB.ts:803–804`) | `browserNote.notPassed` shown; "…report it with the Report a problem button."; Errors captured as before |
| S-02 | VH-187, VH-186 | The note's words are unchanged; the failing rows read B1's labels (`en-GB.ts:821–824`) | `browserNote.notPassed` (`en-GB.ts:99–100`); "Video processing (WebCodecs)"; no bracketed explanation but the format names |
| S-03 | VH-187, VH-196, VH-191 | The lede: "This tool does the following to your video:" and three promises → the owner's five, with "About the video format" beside the fourth (`index.html:48–83`; `en-GB.ts:79–94`). The browser note hidden on a pass. Video language gone from under Video type. Tab: skip link, Page language, Video type, Video language, Choose file → skip link, Page language, About the video format, Video type, Choose file | The five items in order; the "?" 44 × 44 with `aria-expanded="false"` and `aria-controls="format-help"`; `#browser-note` hidden; no `#video-language` before `#step-choose`; the new Tab list; the file button never lower than VH-196's after-reading (S-144). Competes: "Three questions before the first action" → "Two switches and a '?' before the first action" |
| S-04 | VH-191, VH-196 | Page language's three names now repeat only in step 3, once a video is read, not under Video type. The lede's tip has a second polite region | Repainted in place; both tips' `aria-live` wrappers are among the regions `quietLiveRegions` turns off for two frames (`main.ts:3736–3753`); an unpicked Video language follows the page. Competes: "Its three names look like Video language's" → "Its three names are Video language's too, now in step 3" |
| S-06a | VH-191 | The remembered video language now sits in step 3, hidden until a video is read | The pick read from `#video-language`'s checked radio in the DOM, or after a file is read; the side and the page language as before |
| S-07 | VH-191 | Video type's group is described by `video-kind-result video-next` (`index.html:93`); Video language no longer under it; step 3, once shown, opens with Video language above the submission card | `#video-next` inside `#video-kind`, hidden; the line under Video type unchanged |
| S-08 | VH-191 | The choice moved to step 3, so a video must be read first; its helper is B9's (`en-GB.ts:129–131`) | Setup reads `lecture-30s` before choosing ms-MY; the helper reads "Words the tool adds to your video, on the title card and the closing graphics, are in this language." then "What you type is kept as typed."; the card and closing words follow |
| S-13 | VH-192, VH-190 | The redrawn "Previous video" keeps its player; Create's label follows the chosen file | The same `.result-player` element under "Previous video"; Create reads "Create the video" once the new file is chosen (`main.ts:2288–2291`) |
| S-14 | VH-191 | Step 3 opens with Video language, seen here first | `#video-language` after step 3's heading and lock note, before `#title-card-choice` |
| S-15 | VH-188, VH-189, VH-191, VH-190 | Step 5's names, step 4's labels and step 3's order are new; Create reads "Create the video" | B6's names and details; "Plays over" and its options; the "?" beside the select at 1280 px and beside "Plays over" at 375 and 320 px; Create `create.create` (`en-GB.ts:400`), primary |
| S-16 | VH-186 | No change on `captioned-12s`: every fact is read and the scan runs. A fact not read would now say "Unknown" | As Phase 7; and no value cell reads a lower-case "unknown" or "less than a second" alone |
| S-17 | VH-184, VH-189 | The "?" "About animation onset" → "About what the graphics play over" (`en-GB.ts:323`); the terms "Over existing" and "Over generated freeze frame" → "The last second of video" and "A held last frame"; "Escape or a click outside closes it" → Tab and Shift+Tab close it too, and Escape hands focus to the "?" (`src/ui/toggletip.ts:25`, `34`; `main.ts:723–739`); the 4 px rail → a 1 px `--border-subtle` edge (`src/styles/app.css:1094–1099`); below about 400 px the "?" beside "Plays over" | The new name and terms; `aria-expanded`; the edge (S-98); the closings by key (S-95 to S-97). "Expands the page" stands |
| S-20 | VH-185 | Unchanged on `silent-10s`; VH-185 gives the same note to a kept sliver (S-99) | As Phase 7 |
| S-28 | VH-191, VH-178 | No visible change; the steps the block withdraws now hold the Video language radios | As Phase 7; the hand-off from a radio is S-149 |
| S-30 | VH-190, VH-192 | Create beside the kept result reads "Create the video", since the chosen file is the unreadable one; the kept result keeps its player | `create.create`, secondary; the player as S-126 |
| S-31 | VH-188 | "Keep less … choose Smaller / reduced …" → "Keep less of the video, choose the smaller file, or free some space, then press Check again." (`en-GB.ts:431–432`), and the reason's "…or choose the smaller file." (`en-GB.ts:625–626`), both from `preset.inSentence.smaller` | The new sentences in three languages; no old name |
| S-36 | VH-191 | Step 3 opens with Video language above "Add a title card" | Video language before the box; the intro and the empty rule line as before |
| S-40 | VH-191 | Video language now precedes the ticked, locked box | Heading, lock note (hidden), Video language, then the card group with its rule first |
| S-41 | VH-191 | The refusal is unchanged; Video language sits above the four errors | Focus to `#submission-card-assignment`, never to Video language |
| S-43 | VH-191 | Video language locks with step 3 | Its fieldset and radios disabled; step 3's lock note reads `create.lockedMaking` (`en-GB.ts:411`) |
| S-45b | VH-189 | "Not used with None." → "Not used without closing graphics." (`en-GB.ts:340`) | The new reason |
| S-46 | VH-189 | "None" → "No closing graphics" (`en-GB.ts:320`); Plays over and Colour locked with "Not used without closing graphics." | The new option and reason; the line "No University closing graphics will be added." unchanged |
| S-47a to c | VH-189 | "Animation onset" → "Plays over"; its options renamed; below about 400 px the "?" moves beside the label. "Long onset option at phone width (fits)" now fits by that move | Each label its select's accessible name; every option inside its room (168 px at 320 px); the result lines unchanged |
| S-48 | VH-191 | Video language locked; `#video-next` "Changes to the video type or video language apply to the next video you make." → "Changes to the video type apply to the next video you make." (`en-GB.ts:118`) | Step 3's lock note; the new next-video line; the job line unchanged |
| S-50 | VH-191 | Retired in part: Video language can no longer be switched while a job runs. Its replacement is S-123. The Video type half stays | Video type switched, the job keeps Staff video, the new next-video line |
| S-51 | VH-191 | Video language is among the controls held while the job stops | Step 3's lock note reads `create.lockedStopping` (`en-GB.ts:394`) |
| S-52 | VH-190 | Create reads "Create the video" after a cancel | `create.create`, primary; focus on it if held on Cancel |
| S-53, -W, -LW | VH-192, VH-190, VH-188, VH-193 | The card holds the player after its record lines and before the lifetime line and Save (`main.ts:3285`); Create "Create the video again" (`en-GB.ts:401`), secondary; the record's output "high quality" (`preset.inRecord`, `en-GB.ts:388`) | One `.result-player` (S-126); `create.again`; "…, high quality, a cut to the blue closing card."; no "Worth knowing about the finished video" on `lecture-360s`; focus on the card if held on Cancel; the long names inside the page beside the player |
| S-54a to d | VH-188, VH-192 | The record's output in its short form; the card holds the player | "high quality" in each record (the default output); the player present |
| S-55a to c | VH-192 | The fallback line sits in the card above the player | The record, the fallback line, the player, then the lifetime line |
| S-56 | VH-188, VH-190 | "Free some space, or choose Smaller / reduced, and try again." → "Free some space, or choose the smaller file, and try again." (`en-GB.ts:776`); Create relabelled before the outcome (`main.ts:2937`) | The new sentence; `create.create` |
| S-57 | VH-190 | Create reads "Create the video" before the retry | `create.create` |
| S-58, -W, -LW | VH-192, VH-190, VH-188 | The question replaces the card, so the player leaves the page, paused, not released; Create still reads "again"; the question's record says "high quality" | No `.result-player` in the document, its URL not revoked; `create.again`; focus on the question panel (`main.ts:2854`) |
| S-59 | VH-192 | Keep it puts back the same player element and URL | The same element and `src`; focus on the card (`main.ts:2831–2835`) |
| S-60 | VH-192, VH-190 | Discard releases the player: its URL revoked once; the next video gets its own (`main.ts:2890–2908`) | The old element without `src`, its URL no longer fetching; Cancel has focus |
| S-61 | VH-192, VH-191 | The player stays while the save streams; Video language locks with `create.lockedSaving` (`en-GB.ts:412`) | Both |
| S-62 | VH-192, VH-190 | The player leaves before the clean-up (`main.ts:3440–3452`); Create stays "again", secondary, beside the saved video | No player, its URL no longer fetching; `create.again`, secondary |
| S-63, -W, -LW | VH-192, VH-190 | The previous video keeps its player; Create reads "Create the video", secondary | The same player under "Previous video — …"; `create.create`, secondary |
| S-64 | VH-192 | The previous card holds the player with its ended-early line | Both |
| S-65 | VH-192 | The player stays while the previous video saves and the next is checked | As Phase 7, with the player |
| S-66 to S-69 | VH-192 | The result stays unsaved, so the player stays (S-133). S-69's F4e is re-armed (below) | The player, the same URL; the save lines as Phase 7 |
| S-70a to c | VH-192 | The player stays through the hand-off, with the same URL | The player present; `result.lifetimeDelivered` (`en-GB.ts:452`); S-70c's Discard revokes the URL |
| S-71 | VH-191 | Video language sits in step 3 and is free beside a kept result; the next-video line names the video type only | `#video-next` reads `videoKind.nextVideo`; no `videoLanguage.nextVideo` key; the record keeps its own language and kind |
| S-72b | VH-192 | The save's end takes the player out of the card | Focus unmoved on Video properties; no player |
| S-75 | VH-182 | The dialog's heading "Send feedback" → "Report a problem" (`index.html:853`; `en-GB.ts:852`); its address `joe.bell@nottingham.ac.uk` → `UI-Learning-Content@nottingham.ac.uk` (`feedback.ts:15`) | The dialog named "Report a problem"; the intro names the team's address |
| S-76 | VH-182 | Press "Send feedback" → press "Report a problem" (`#feedback-open`, id unchanged, `index.html:835`) | As S-75 |
| S-77 | VH-182 | The dialog's name only | As Phase 7 |
| S-78, S-78k | VH-182 | The email goes to the team; its subject "UoN Video Helper feedback" → "UoN Video Helper problem report" (`feedback.ts:35`); the opened line names the team's address (`en-GB.ts:865–866`) | The caught `mailto:`'s address and subject; the line |
| S-79a and b | VH-182 | The address is 11 characters longer and the subject 6, so under `FEEDBACK_MAILTO_MAX_CHARACTERS` (1,800, `feedback.ts:56`) fewer details fit; `feedback.tooLong` names the team's address | S-79b's drafts re-sized so the message fits and the details do not; the lines name the team's address |
| S-80a and b | VH-182 | "Copied. Paste it into an email to {address}." names the team's address (`en-GB.ts:869`) | The address |
| S-81 | VH-182 | The contact line "…email Joe Bell at {address}." → "…email the learning content team at {address}." (`en-GB.ts:912`), its link to the team; "About this statement" still names Joe Bell. Its media line still names only the preview (wish VH-192.1) | The new line and link; the media line read as it stands, not judged here |
| S-82 | VH-186 | B1's labels (`en-GB.ts:821–824`): at 320 px the English labels take 2, 3, 2 and 2 lines (4, 4, 3 and 3 before). The worker row breaks inside its words at 320 px (wish VH-186.1) | The labels and their line counts; the worker row's break read and recorded against VH-186.1 |
| S-83 | VH-182 | The footer's routes → `.footer-help` (`index.html:822–843`): `h2` "Help and feedback"; `h3` "Need help using the tool?" over "Staff: ask in the Creators team on Teams (new tab)" and "Students: get help through Self Service (new tab)"; `h3` "Something not working?" over Report a problem; `h3` "What do you think of the tool?" over "Please tell us what you think in the feedback form (new tab)". "Email the learning content team" gone. Competes: "Three routes for help next to Send feedback" → "Routes grouped by need under one heading" | The eight nodes in that order; each URL whole (`feedback.ts:18`, `24`, `32`), a new tab, `noopener noreferrer`; each route at least 44 px; at least 7:1 on the band; a `div` with no landmark; no `mailto:` in it; after the statement, before the version line |
| S-84 | VH-191, VH-196 | At 320 px Video language no longer stands under Video type between the band and step 1; the lede's "?" now does, on its promise's line | Still S-03 at 320 px |
| S-86 | VH-191 | The pick is made in step 3, so it needs a file read, and after the reload step 3 is hidden until one is | Read `lecture-30s`, pick ms-MY, reload, read it again; the stored pick (`main.ts:511`) and the checked radio |
| S-88 | VH-191, VH-192 | Video language beside a kept result is free, so a pick still withdraws the question (`main.ts:702`); the redrawn result has the same player | Withdrawn by each change as Phase 7; the same player element |
| S-89 | VH-182 | "…report the problem with the Send feedback button." → "…use the Report a problem button." (`en-GB.ts:784`) | The new words |
| S-90a and b | VH-182, VH-191 | `failure.tryAgain` names Report a problem (`en-GB.ts:793–794`); the held locks include Video language | The new words; Video language disabled until the locks lift |
| S-91 | VH-193 | The output warnings' block was source-only, for want of a source whose metadata cannot be carried. F16 now plants one, and N6 adds heavy limiting | Walked with F6a and F16: the closing line and "The file's title, author, and date could not be copied across" inside "Previous video"; with N6 and F16 both warnings, heavy first (S-136, S-138) |

## New scenarios

Each new state Phase 8 added or changed has a row, traced to its item. The
second column names the Phase 8 item, or the wish line, in place of a
catalogue row. VH-194 changed documents only (`2bcb191` touches
`UI-STANDARDS.md` and `docs/01-specification.md`, no page string, markup,
style or script), so it has no scenario; the contract checks it by reading.
Where a row names a runner (`tip-184.mjs` and the rest), its checks become
the pass walker's assertions for that scenario.

| ID | Item(s) | Journey | Scenario | Setup | Expected transition | Focus after | Status (visible / announced) | Values kept | Meant to do | Competes | Repeats | Walk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S-92 | VH-183 | J1 | Trim Page step, a short video | `lecture-130s`; on the start handle: Page Up twice, Page Down, →, End, Page Up, Home, Page Down; on the end handle: Page Down, Page Up, Home, Page Down, End | Each Page key moves the handle by max(10 s, 1%), here 10 s (`src/ui/trim.ts:171`); the arrow by 1 s; Home and End to the bounds; the end handle stops 3 s after the start (`KEPT_MIN_SECONDS`, `src/config/trim.ts:17`). Each move commits and re-checks (S-34) | Stays on the handle | Start 0 → 10 → 20 → 10 → 11 → 127 → 127 → 0 → 0; end 130 → 120 → 130 → 3 → 3 → 130; `aria-valuetext` in words, as before / the value text on each key | The other handle, choices | Reach a point by keys | Each press re-checks | The trim line beside the fields, read on demand | walked (new step), as `page-183.mjs` |
| S-93 | VH-183 | — | Trim Page step, an hour | N2 `still-3600s`; the same keys | 36 s a page (1% of 3,600); a page at either bound stays there | Stays on the handle | Start 0 → 36 → 72 → 36 → 37 → 3,597 → 3,597 → 0 → 0; end 3,600 → 3,564 → 3,600 → 3 → 3 → 3,600; "36 seconds", "1 minute 12 seconds", "59 minutes 57 seconds"; 36秒钟; "36 saat" / the value text | As S-92 | Cross an hour in about a hundred presses | Each press re-checks a long file (S-34, S-35) | — | walked (new step), N2 |
| S-94 | VH-183 | — | Trim Page step at the 1% boundary | N7 `still-1000s` and `still-1100s`; Page Up and Page Down on the start handle | 1,000 s: 10 s, where the floor and 1% agree; 1,100 s: 11 s | Stays on the handle | 0 → 10 → 0; 0 → 11 → 0; "10 seconds", "11 seconds" / the value text | As S-92 | — | — | — | walked (new step), N7; steps under a whole second are source-only (`src/ui/trim.test.ts`, the 1,000 s crossover) |
| S-95 | VH-184 | J1 | Onset help closed by Tab | S-15, Fade; Enter on "About what the graphics play over"; Tab | Focus arriving outside the "?" and its text closes the tip (`focusClosesTip`, `src/ui/toggletip.ts:25`; the `focusin` listener, `main.ts:731–733`) | The Blue colour radio, as with the tip closed | `aria-expanded="false"`; the tip hidden / nothing new | Choices | Move on | It covered what came next (fixed) | — | walked (new step), as `tip-184.mjs` |
| S-96 | VH-184 | J1 | Onset help closed by Shift+Tab | S-95's setup; Shift+Tab | As S-95 | The "Plays over" select | As S-95 | Choices | Move back | — | — | walked (new step) |
| S-97 | VH-184 | J1 | Onset help closed by Escape, or by a click elsewhere | Open, Escape; open, click its text, Escape; open, click the Colour legend | Escape closes it from the "?", from its text or from nowhere (`escapeFocusesButton`, `toggletip.ts:34`); a click on its text keeps it open; a click elsewhere closes it (`main.ts:735–739`) | The "?" after Escape; where the click put it otherwise | `aria-expanded` false each time but after the click on its text / — | Choices | Read and return | — | — | walked (new step) |
| S-98 | VH-184 | — | Onset help's edge | S-17 open, at 1280 and 320 px, in light, dark, forced-light and forced-dark | — | — | 1 px all round in `--border-subtle`, not the notification's rail (`app.css:1094–1099`): 4.08:1 and 3.91:1 in light, 4.71:1 and 5.53:1 in dark, 21:1 forced, against the tip's ground and the step's / — | — | Read it as help | It read as a warning (fixed) | — | walked (new step): `contrastExtra` on the edge |
| S-99 | VH-185 | — | A kept sliver of sound: no audio before Create | N8a `late-sound-10s`; End time `0:04`, Tab | The re-check gives the existing no-audio note, and no ended-early note | Set end here, where Tab put it (S-34) | "Worth knowing about the audio — This video has no audio" (`en-GB.ts:670–674`); no "The file ends early" / said after the verdict | Trim | Create | Video properties still lists the file's audio track | — | walked (new step), as `sliver-185.mjs` |
| S-100 | VH-185 | — | A kept sliver: the job finishes silent | S-99; Create to the end | No audio track; no output-check failure ("invalid-measurement" before VH-185) | The card, if held on Cancel | "Finished video — 1.8 MB"; "4 seconds of 10 seconds, from 0:00.0 to 0:04.0"; no ended-early passage; no heavy-limiting warning, since a silent job makes no plan / "Your video is ready." | Choices | Save | — | — | walked (new step), N8a, 1280 px, light, three languages |
| S-101 | VH-185 | — | The control: 0.6 s of sound kept | N8b `late-sound-3.4s-10s`; End time `0:04`; Create | Levelled as before | As S-100 | No no-audio note before Create; finished and levelled / as S-53 | Choices | Create | — | — | walked (new step), N8b |
| S-102 | wish VH-185.1 | — | An untrimmed file with under 400 ms of sound | N8c `late-sound-9.7s-10s`, untrimmed; Create | Unmeasured: VH-185 left the untrimmed guard as it was | As S-15, then as the outcome gives | Recorded as found: the verdict's notes, then a finished video (silent or levelled) or a failure and its code / as found | — | — | — | — | walked (new step), N8c, its outcome recorded either way; not judged against VH-185, whose scope it is not |
| S-103 | VH-186 | — | "Less than a second" alone | N10 `short-0.4s`; open Video properties | — | Stays on the summary | Duration "Less than a second", 不到一秒, "Kurang daripada satu saat" (`format.alone.lessThanASecond`, `en-GB.ts:1001`; `src/ui/source-panel.ts:135`); the same words lower-case inside a sentence / none | — | Inspect | — | — | walked (new step), as `words-186.mjs`; S-21's trim lock shows too |
| S-104 | VH-186 | — | "Unknown" alone | N11; open Video properties | — | Stays on the summary | Duration "Unknown" (`format.alone.unknown`, `en-GB.ts:1000`; `src/ui/format.ts:44–46`) / none | — | Inspect | — | — | walked if the pilot shows N11 reads with no duration; otherwise source-only, because no fixture is known that the page reads with a fact missing (`src/ui/format.test.ts`, `src/ui/source-panel.test.ts`) |
| S-105 | VH-186 | — | The unchecked caption warning, completed | N9 `lecture-30s.mkv`, whole | The losses box holds the unchecked warning (`source-panel.ts:73–81`) | As S-15 | "Caption and chapter tracks could not be checked"; its detail goes on after "…will not be carried over." with "The new file will have no caption track, so captions must come from wherever you publish it. …" (`en-GB.ts:205–209`) / the count said with the read line | — | Understand the loss | — | The scanned warning's passage, by design (B3) | walked (new step), N9 |
| S-106 | VH-187 | J3 | The browser note on a warn | Load with F17 | The aac row warns and the others pass (`main.ts:1131`); start-up settles ready, so the chooser opens | Unmoved | Above step 1, `browserNote.notPassed`; System check "System check — 1 warning", its aac row "Not supported — a video with audio cannot be made here" (`en-GB.ts:834`) / none: the note is not a live region (`main.ts:804–810`) | — | Follow the system check | — | The System check's row says it again, below | walked, F17 |
| S-107 | VH-187 | — | The browser note beside a check still pending | Load with F1 and F2, then with F1 and F17, read inside the 5 s ping deadline | A fail or warn already seen outranks pending (`system-check.ts:71–74`) | Unmoved | Step 1 still "Checking whether this browser can run the tool…"; the note shows `browserNote.notPassed` above it / none | — | Follow the system check | Two lines about the browser above step 1, both true | — | walked, F1 with F2, F1 with F17; a check settling after a file is chosen is source-only (Not in this pass) |
| S-108 | VH-188 | — | Step 5's names and details | `lecture-30s`; S-15 | — | — | "High quality, for publishing", "For EchoVideo, YouTube, and similar sites."; "Smaller file, for assignments and sharing", "For Moodle assignment uploads, email, and messages." (`index.html:545–558`; `en-GB.ts:382–387`); no "Larger / better", "Smaller / reduced", "etc.", 等 or "dll."; the legend "File size / quality" / none | Choice | Choose an output for its use | The longer English name takes two lines at 375 and 320 px | — | walked (new step), as `preset-188.mjs` |
| S-109 | VH-188 | — | The record names each output | `short-2s` made under each output; then Create (the question), Keep it, and another file chosen | The record's output in its short form, without the purpose (`en-GB.ts:388`) | As S-53 | "Made from short-2s.mp4: the whole video (2 seconds), high quality, a cut to the blue closing card."; "…, a smaller file, …"; 高质量 and 较小的文件; "kualiti tinggi" and "fail yang lebih kecil"; the same in the question and under "Previous video" / with the result | Result | Save | — | One record in the card, the question and the previous video, by design | walked (new step) |
| S-110 | VH-188 | — | The slides sentence | N12 under "Smaller file, for assignments and sharing" | The verdict adds the slides line when the output is the smaller one, the source is classed as screen and the rate is not capped to the source (`src/ui/preflight-panel.ts:223–236`) | As S-15 | "This looks like slides or a screen recording, so the file is made smaller still. If it is mostly camera footage, choose high quality instead." (`en-GB.ts:649–650`) / with the verdict | — | Switch to high quality if it is camera footage | — | — | walked if the pilot shows N12 classed as screen and not capped; otherwise source-only, as VH-188 left it (`src/ui/preflight-panel.test.ts`) |
| S-111 | VH-189 | J1 | Step 4's labels at a wide view | S-15 with Fade, at 1280 and 640 px | — | — | "Animation type" with Cut, Fade, Slide and "No closing graphics"; "Plays over" with "The last second of video" and "A held last frame"; the "?" beside the select, named "About what the graphics play over" (`index.html:441–474`; `en-GB.ts:320–323`); each label its select's accessible name; every option inside its room / none | Choices | Choose | — | The result line beneath says it in a sentence, by design | walked (new step), as `labels-189.mjs` |
| S-112 | VH-189, VH-184 | J1 | Below about 400 px: the "?" beside "Plays over" | S-111 at 400, 375 and 320 px, and at 401 px; open the tip; Tab; open it again; Escape | Under `@media (max-width: 25rem)` the field is a grid and `.control-with-help` is `display: contents` (`app.css:1051–1083`); the markup and Tab order are unchanged | The select, then the "?" by Tab; the "?" after Escape | At 401 px the "?" beside the select; at 400 px and below beside the label; the select 168 px wide at 320 px, and every option fits (152 and 104 px in English); the tip opens under the select / `aria-expanded` | Choices | Read, return | — | — | walked (new step) |
| S-113 | VH-189 | — | Step 4 at the 32 px font | S-111 with the 32 px font, at 1280, 640, 401 and 320 px | `25rem` follows the text size, so the query holds to 800 px | — | At 1280 px the "?" beside the select, 483 px of room; at 640 px beside the label, 340 px; at 401 px and below both selects clip, with 20 to 101 px of room / none | — | — | — | — | walked (new step); 401 px and below recorded against wish VH-189.1, beyond 1.4.4 and 1.4.10 |
| S-114 | VH-190 | J1 | Create again, unsaved | S-53 | — | — | Create reads "Create the video again" (`create.again`), secondary; its accessible name the label, no `aria-label`; not clipped at 320 px / none | Result | Save first, or make it again | Two actions in view, Save the primary | — | walked (new step), as `again-190.mjs`; pressing it is S-58 |
| S-115 | VH-190 | — | Create again, saved | S-62; Create | Nothing is unsaved, so a job starts with no question (`main.ts:2768–2781`) | Cancel | Before: "Create the video again", secondary; then as S-48 | The saved file | Make it again with other settings | — | — | walked (new step) |
| S-116 | VH-190 | J4 | Create beside a Previous video | S-63 unsaved; then that previous video saved | `resultOfChosenFile()` is false beside another file (`main.ts:2162–2165`), the owner's choice A | Stays on the chooser | Unsaved: "Create the video", secondary; saved: "Create the video", primary / none | Result | Create the new video | Two files in view (S-63) | — | walked (new step) |
| S-117 | VH-190 | — | Create's label through a page-language change | S-53, focus on Create; choose zh-Hans, then ms-MY | Relabelled in place (`labelButtons`, `main.ts:2273`) | Stays on Create | `create.again` in each table's words / the language line (S-04) | All | Carry on | — | — | walked (new step) |
| S-118 | VH-190 | — | Made again, then cancelled or failed | S-62; Create; Cancel. Again with F12 | `beginJob` relabels after it clears the result (`main.ts:2930–2937`) | Create after the cancel; the failure box after the failure | "Create the video", primary; no result standing / as S-52 or S-56 | Choices | Create | — | — | walked (new step), F12 for the failure |
| S-119 | VH-191 | J1 | Video language at the top of step 3, the card off | S-15, Staff video, the box unticked, nothing picked | — | — | Step 3: its heading, the lock note (hidden), "Video language" with three segments and its two helper lines (`index.html:259–265`; `en-GB.ts:129–131`), then "Add a title card"; the page's language checked; each segment its own `lang`, at least 44 × 44 px; the group named by its legend and described by `video-language-helper` alone / none | The remembered pick | Choose the words' language where the words are | Page language's three names, now apart | — | walked (new step), as `lang-191.mjs` |
| S-120 | VH-191 | — | Video language, the card on | S-119; tick "Add a title card" | The fields show; Video language stays above them, outside `#title-card-choice` | Stays on the box | As S-119, then the four fields, the date in the video language / none | Typed values | Fill the card | — | The date's helper says "in the video language" below it | walked (new step) |
| S-121 | VH-191 | J2 | Video language on a submission | S-40 | — | — | Video language above the ticked, locked box and its four fields / none | Staff card | Fill four fields | — | — | walked (new step) |
| S-122 | VH-191 | J2 | Video language picked by keys | S-119; Tab to its checked radio; ArrowRight; then another page language; then reload and read a file | The pick is kept and remembered (`main.ts:692–703`, `511`); the closing line and Video type's line quote in it | Stays on the radio | The picked segment checked over the page's language / none | The pick | Carry on | — | — | walked (new step) |
| S-123 | VH-191 | J1, J4 | Video language locked while running | S-48 with nothing picked; then another page language | `applyControlLock` disables it with step 3 (`main.ts:2458`); Video type stays free; the shown choice follows the new page language while disabled; the job keeps the language it started with | Unmoved | Step 3's lock note "Locked while your video is being made."; the radios disabled; `#video-next` "Changes to the video type apply to the next video you make."; the job line names the job's language / none | Job | Wait | — | The job line and the shown choice can differ, rightly | walked (new step); replaces S-50's video-language half |
| S-124 | VH-191 | — | Video language locked while saving, and freed | S-61 with F4b at 3 s a chunk; then a cancelled job (S-52) and a failed one (S-56, F12) | The save locks it and frees it; the same path frees it after a cancel and a failure | Stop saving, then the card | "Locked while your video is being saved."; then free / as S-61 and S-62 | Result | Wait | — | — | walked (new step), F4b, F12 |
| S-125 | VH-191 | — | Video language and the card's date | S-120, the date untouched; pick ms-MY; then, with nothing picked, another page language | An untouched date is filled again in the video language (`fillCardDate`, `main.ts:699`, `3792`) | Stays on the radio | The date in Malay after the pick; after a page-language change only while nothing is picked / none | A typed date | Carry on | — | — | walked (new step) |
| S-126 | VH-192 | J1 | The finished card's player | S-53, by `short-2s` and by J1's job | One `<video class="result-player">` in the card, after the title and record lines, before the lifetime line and Save (`main.ts:2870–2884`, `3285`) | The card, if held on Cancel; never the player | Native controls; `preload="metadata"`; no `autoplay`; paused; a `blob:` source whose metadata loads; the new video's duration (6.04 s against step 2's 2 s on `short-2s`); `aria-labelledby` the card's title, so named "Finished video — …" in the page's language; inside the page and no taller than `--preview-max-height` (`app.css:1331–1342`) / "Your video is ready." and its notes | Result | Watch, then save | Step 2's player, above, plays the original and says so | Two players, by design | walked (new step), as `player-192.mjs` |
| S-127 | VH-192 | K-player | The player's controls by keys | S-126; Tab from the card into the player, through its controls to Save; Shift+Tab back | Chrome's own controls take focus in turn; `document.activeElement` is the `<video>` throughout | Each control, then Save; back to the card | A visible ring on each control (2.4.7); 2.4.13's exception for a ring the user agent draws / Chrome's own names | Result | Play, pause, seek | — | — | walked (new step): the stops counted; a ring drawn inside the shadow tree that pixels cannot reach is "cannot determine"; wish VH-192.2's first point |
| S-128 | VH-192 | — | Played, then a language change, the question and Keep it | S-126; play (muted, so a scripted press is not refused); another page language; Create; Keep it | The same element plays on and is renamed; the question takes the card off the page, which pauses it; Keep it puts back the same element and URL | The card after Keep it | `currentTime` advancing about 0.76 s in 0.8 s; the name in the new language / the question once | Result, its URL | Watch, then decide | — | — | walked (new step) |
| S-129 | VH-192 | J4 | The player under a Previous video | S-126; choose `silent-10s` | The card is repainted as the previous video, not rebuilt (`main.ts:3329`) | Stays on the chooser | The same player under "Previous video — …"; Create "Create the video" / the new verdict | Result | Watch, save, or create the new | Two files in view (S-63) | — | walked (new step) |
| S-130 | VH-192 | J1 (phone) | The player through a download hand-off | `phone-en-staff`, or F4d; Save; then Create and Discard | The player stays with the same URL, which still fetches; Discard revokes it once | Save, if held | `result.lifetimeDelivered`; the download line (S-70) / said | Result | Check the download; watch | — | — | walked (new step); never with F15b |
| S-131 | VH-192 | K-player | Saved: the player leaves | S-126; play; Save with F4b at 3 s a chunk; focus put on the player while it streams | It plays while the save streams; when the save completes it is paused, its source dropped, its URL revoked, and it leaves the card before the clean-up (`main.ts:3440–3452`) | The card, since focus was in the player | No player, its URL no longer fetching; "Saved. Open the saved file to check it, …"; no lifetime line; Save "Saved", disabled / "Saved. …" | Result | Use the file | — | — | walked (new step), F4b |
| S-132 | VH-192 | J3 | A failed playback | S-126 with F15a, then F15b | Nothing reads the player, so nothing else changes | Unmoved | The card, record, warnings and Save as S-53; under F15b the player's `MediaError` code recorded; Save then completes as S-62 / nothing new | Result | Save anyway | Chrome's own face for a broken player | — | walked (new step), F15a, F15b; wish VH-192.2's second point |
| S-133 | VH-192 | J3 | A cancelled or failed save keeps the player | S-126; Save with F4a (picker cancelled), F4b then Stop saving, F4c (refused), F4e revised (failed) | The result stays unsaved, so the player stays | Save, if held | The player with the same URL, its metadata loaded; S-66 to S-69's lines / said | Result | Save again | — | — | walked (new step), F4a, F4b, F4c, F4e revised; wish VH-192.2's third point |
| S-134 | VH-192 | — | A back-forward-cache restore | S-126, unsaved; F19 | Restored from the cache, or loaded afresh | Recorded | If `pageshow` reports `persisted`: the same player, its URL still fetching, and it plays; if not, Chrome's reasons recorded / — | Result, if restored | Come back to it | — | — | walked (new step), F19, its outcome recorded either way; "cannot determine" when Chrome does not cache the page; wish VH-192.2's fourth point |
| S-135 | VH-193 | — | The heavy-limiting warning | N6 `clicks-20s`; Create to the end | The job's measured bite, over `HEAVY_LIMITING_LU` (3, `src/config/audio.ts:266`), adds `heavy-limiting` first (`src/audio/warnings.ts:207–208`) | The card, if held on Cancel | Under "Worth knowing about the finished video": "The loudest moments were held down hard" and its detail, word for word (`en-GB.ts:719–723`), first; Save enabled / its heading among the result's spoken warnings | Result | Listen in the player, then save | The player in the card above it | — | walked (new step), N6; the bite read from the worker's "chain planned" log line, as `heavy-193.mjs` reads it |
| S-136 | VH-193 | — | Both production warnings | N6 with F16 | `metadata-lost` follows `heavy-limiting` (`warnings.ts:210`) | As S-135 | Both, heavy first, in the card and in the spoken line / both titles, heavy first | Result | As S-135 | — | — | walked (new step), N6 and F16; wish VH-193.2's first point |
| S-137 | VH-193 | — | The warning unchanged after a save | S-135; Save completes; then another page language | `paint` draws the warnings again from the kept result (`main.ts:3325`) | The card | The warning word for word beside "Saved."; then in the new language / the saved line | Result | Use the file | — | — | walked (new step) |
| S-138 | VH-193 | J4 | The warning on a retained result | S-135; a download (F4d); Create and Keep it; another file chosen | The warning stays with the card each time | As S-70, S-59 and S-63 | The warning beside the card, under "Previous video" too / none new | Result | Understand before saving | — | — | walked (new step); wish VH-193.2's second point |
| S-139 | VH-193 | — | A level file does not warn | `lecture-30s` (bite 0.00) to the end | No `heavy-limiting` | As S-53 | No "Worth knowing about the finished video" / as S-53 | — | Save | — | — | walked (new step) |
| S-140 | wish VH-193.3 | — | A QuickTime Animation file with no audio | `samples/UoN Closing Logo Fade Blue 2025.mov`, then N13; Create | Unknown: VH-193's corpus walk stood ten minutes with no result | Recorded | A finished video, a failure and its code, or still running at the limit, with its last stage and the worker's log / as found | — | — | — | — | walked (new step) with a 15-minute limit, longer than VH-193's ten and than the 120 s watchdog (`WORKER_SILENCE_LIMIT_MS`, `src/config/thresholds.ts:37`); its outcome recorded either way |
| S-141 | VH-196 | J1 | "About the video format" open | S-03; Tab to the "?"; Enter; again with Space | The tip opens in the page's flow, inside the fourth promise's list item | Stays on the "?" | The hint word for word (`en-GB.ts:89–92`); the "?" 44 × 44 on the promise's line, after its text; the tip under it, edged as S-98 / its text, by its polite region (`index.html:66`) | — | Read, return | It pushes Video type and step 1 down | — | walked (new step), as `tip-196.mjs` |
| S-142 | VH-196 | J1 | "About the video format" closed | S-141; Tab. Open, Shift+Tab. Open, Escape. Open, click its text, click the page title | As S-95 to S-97 | Tab: Video type's checked radio; Shift+Tab: Page language's checked radio; Escape: the "?" | Closed each time but after the click on its text / — | — | Move on | — | — | walked (new step) |
| S-143 | VH-196, VH-184 | — | Two toggletips | A file read, Fade; open the format tip; Tab on to the onset "?"; Enter; click the format "?"; Escape | Each tip has its own listeners (`main.ts:715–743`): focus moving or a click elsewhere closes the other; Escape closes only the open one | After Escape, that tip's own "?" | Never both open; each `aria-expanded` its own / — | — | Read either | — | — | walked (new step) |
| S-144 | VH-196, VH-187, VH-191 | — | The lede at 320 px with its tip open; the file button | S-141 at 320 px; then, closed, at 1280 × 900, 800 × 600, 375 × 812 and 320 × 568 in three languages | — | — | Nothing off the page with the tip open; the file button's top read beside VH-196's (804, 954 and 1,065 at 1280 × 900; 1,169, 1,243 and 1,527 at 320) / none | — | — | The first action below the first screen but in English at 1280 (V-18) | — | walked (new step), with `top-187.mjs` and `rings-179.mjs` `v18` |
| S-145 | VH-182 | — | The footer's headings | S-83 at 1280 and 320 px | — | — | After the statement, the `h2` "Help and feedback" in the panel heading's role and three `h3` questions in the section heading's role, each over its route; the footer's heading list reads System check, Accessibility statement, Help and feedback and its three questions / none | — | Find the route by need | — | The questions are headings, never part of a link's name (2.4.9) | walked (new step), as `footer-182.mjs` |
| S-146 | VH-182 | K-dialog | Report a problem's dialog and email | S-03; Report a problem; type; Open email app | The dialog opens; the `mailto:` is caught before it is followed | The message field; after Escape, Report a problem | Heading "Report a problem"; the intro names `UI-Learning-Content@nottingham.ac.uk` (`feedback.ts:15`); the email to that address, its subject starting "UoN Video Helper problem report" (`feedback.ts:35`) / the dialog's name, then the opened line | Draft | Send from the email app | — | — | walked (new step) |
| S-147 | VH-182 | J3 | The errors that name the button | F1 held past 5 s (S-01b); F10 (S-89); F11 (S-90); F18 | Each failure's next step names Report a problem | As each scenario | "…report it with the Report a problem button." (`en-GB.ts:803–804`); "…use the Report a problem button." (`784`); `failure.tryAgain` (`793–794`); `failure.encoderRefused.next` / said | — | Report it | — | — | walked, F1, F10, F11, F18; `failure.unlevellable.next` is source-only, because no fault is known that makes a recording unlevellable (`src/ui/failure-text.test.ts`) |
| S-148 | VH-182 | J3 | Two report buttons | F8 (S-74); Report this problem; Escape; Report a problem | Either opens the one dialog (`main.ts:3665–3666`); the panel keeps "Report this problem" | After Escape, the button that opened it | Both buttons in view; two names for one dialog / the dialog's name | Draft | Report it | Two names for one route | — | walked (new step) |
| S-149 | VH-191, VH-178 | — | Focus on Video language when a check blocks | A file read; F14; focus on a Video language radio; `prores-1080p.mov` set | The blocking branch withdraws steps 2 to 5, Video language with them (`main.ts:1595`) | The file input | As S-28 / said once | — | Re-export | — | — | walked (new step), F14; T-46.2's case for the moved control |
| S-150 | VH-192, VH-178 | — | A job made with focus on Announce progress | T-46.1 on a card that holds the player | The ending hands focus to the card, now taller | The card | The card's ring read on its new box / as S-53 | — | Watch, then save | — | — | walked, `transitions.mjs` T-46.1, three languages, four colour modes |

## Faults and fixtures this needs

**Faults, from F15.** Phase 7's `faults.mjs` declares F1 to F14, not F1 to
F13: F13 runs the job worker's clock at twice real time for S-25, and F14,
VH-178's, holds the pre-flight's answer 8 s for the transitions by keys. So
this pass's faults start at F15. Each is setup, never part of a keyboard
route, and each is proved by `node faults.mjs check` before the matrix uses
it, as Phase 7's were.

- **F15:** the finished video's player fails. a; the `error` event
  dispatched on `#process-result .result-player` in place, as F7 does for
  the preview. It proves only that nothing listens. b; a real refusal: an
  init script wraps `URL.createObjectURL` so that, for a `Blob` that is not
  the chosen source file, it revokes the URL it made before returning it, so
  the player's load fails and `video.error` is set. It spares the preview's
  URL (`main.ts:1782`) as F4e does. The download hand-off makes its URL the
  same way (`src/media/save.ts:193`), so F15b is never set with a download:
  not with S-70, S-130 or S-138's download. Used by S-132.
- **F16:** the metadata's carry fails. The prebundled `mediabunny` module,
  as the worker requests it from Vite (`/node_modules/.vite/deps/mediabunny.js`),
  is rewritten over CDP `Fetch` at the Response stage, through the router
  F9's prelude uses (`faults.mjs` `route`). One line is appended that makes
  `Input.prototype.getMetadataTags` reject, the class's local name read from
  the bundle's own `export { … }` list. Only `src/media/pipeline.ts:508`
  calls it, inside the `try` that sets `metadataCarried = false` (`:517`),
  so `detectProductionWarnings` adds `metadata-lost` (`warnings.ts:210`).
  Used by S-91 and S-136.
- **F17:** the AAC encoder refused. VH-187's `NO_AAC`
  (`walker/top-187.mjs:33–35`), declared: an init script makes
  `AudioEncoder.isConfigSupported` answer `supported: false` for any
  `mp4a` codec, so the System check's aac row warns (`main.ts:1131`) and
  the rest pass. Used by S-106 and S-107.
- **F18:** the encoder refuses part-way, by F9's route. A worker prelude
  makes `VideoEncoder.prototype.encode` throw
  `DOMException('fault F18', 'EncodingError')` once a set number of frames
  has been fed, once only, which `classifyFailure` names `encoder-refused`
  (`src/workers/failure.ts:89`). Used by S-147. If the check does not show
  `failure.encoderRefused` on the page, that error stays source-only.
- **F19:** the page left and come back. With an unsaved result the leave
  warning is set (`main.ts:2372–2383`), so `Page.navigate` to `about:blank`
  raises "Leave site?", accepted by `Page.handleJavaScriptDialog`; then
  `Page.navigateToHistoryEntry` goes back. An init script records
  `pageshow`'s `persisted`, and `Page.backForwardCacheNotUsed` gives Chrome's
  reasons when it loads the page afresh. Used by S-134.
- **F4e, revised.** Phase 7's F4e throws from `URL.createObjectURL` for any
  `video/` Blob but the chosen file. Since VH-192 the card calls it for the
  job's working file when the job ends (`main.ts:2878`), and that file is
  `output-<preset>.mp4` in OPFS (`pipeline.ts:472`). If its `File` carries a
  `video/` type, the throw lands in the job's outcome handler
  (`main.ts:3053`) and the job reads as failed before Save is offered. So
  F4e is armed in place once the card stands, or spares the first URL made
  for each Blob; the pilot shows which. Used by S-69 and S-133.
- **F4b**'s `ms` option (VH-178) gives 3 s a chunk to S-124, S-131 and
  S-133.

**Fixtures, from N6.** N5 is `clipped-30s` (S-19). Phase 8's item runners
made their fixtures in scratch; these move into `fixtures.sh`, so the pass's
walker makes them. Its rule "Nothing here comes from samples/" stands.

- **N6:** `clicks-20s.mp4`, heavy limiting, as VH-193's matrix used it:
  20 s of `testsrc2` with a 440 Hz tone at about −46 dBFS (amplitude
  0.005) and a 3 ms burst at about −10.5 dBFS (amplitude 0.3) every
  250 ms, by `aevalsrc`. VH-193 read its bite as 20.13 LU. The pilot reads
  the bite again from the worker's "chain planned" line and keeps the
  fixture only if it is over `HEAVY_LIMITING_LU` by a clear margin. It is
  the only fixture known to give a bite over 3 LU. The corpus's two that
  warn, the 29-minute Teams recording (7.94 LU) and `C0413.MP4` (5.17 LU),
  are in `samples/`; the Teams recording is walked once (Not in this pass).
- **N7:** `still-1000s.mp4` and `still-1100s.mp4`, N2's recipe at those
  lengths (`fixtures.sh`'s N2 loop), for the 1% boundary.
- **N8:** late sound, as VH-185 made it. a; `late-sound-10s.mp4`, 10 s of
  `testsrc2`, H.264, with AAC sound from 4 s (`-itsoffset 4` on the sound's
  input), whose first packet, the encoder's priming, starts at 3.978667 s
  and lasts 21.3 ms. b; `late-sound-3.4s-10s.mp4`, the control, sound from
  3.4 s. c; `late-sound-9.7s-10s.mp4`, sound from 9.7 s, so the whole track
  holds about 300 ms, for wish VH-185.1.
- **N9:** `lecture-30s.mkv`, whole: `lecture-30s.mp4` remuxed to Matroska
  with `-c copy`, which the caption scan cannot read. `fixtures.sh` makes
  the same file for N1 and then deletes it.
- **N10:** `short-0.4s.mp4`, the first 0.4 s of `lecture-30s.mp4`,
  re-encoded. N4's 0.8 s rounds to "1 second" (`format.ts:47`), so it
  cannot give "Less than a second".
- **N11 (to be proved):** `noduration-10s.webm`, 10 s of VP9 and Opus
  written to a pipe (`-f webm pipe:1`), so the muxer cannot go back to
  write its duration. The pilot shows whether the page reads its duration
  as unknown.
- **N12 (to be proved):** a slides stand-in for S-110: N2's still 1080p
  picture held for 60 s and encoded at a constant 2.6 Mbit/s with filler
  (x264 `nal-hrd=cbr`), so its frames do not change
  (`CONTENT_SCREEN_MAX_MEAN_DIFFERENCE`, 0.001) and its density, about
  0.05 bits a pixel a frame, sits under
  `CONTENT_SCREEN_MAX_SOURCE_BITS_PER_PIXEL_PER_FRAME` (0.08,
  `thresholds.ts:203`) and above what the smaller output spends on
  slides. The pilot shows whether it is classed as screen and not capped.
- **N13:** `qtrle-5s.mov`, 5 s of 1920 × 1080 `testsrc2` as QuickTime
  Animation (`-c:v qtrle`), no audio: a made twin of the closing assets, so
  S-140 does not rest on `samples/` alone.

## The finite list for the other modes

These run in dark, forced colours light and dark, enlargement (the 32 px
font and both proxies), text spacing, reduced motion, fallback faces, and
landscape or short height. Phase 7's eleven stay, now drawing what Phase 8
changed in them, and six Phase 8 states join them:

| The state | Scenario |
| --- | --- |
| Empty | S-03, with the five promises and the format "?" |
| Ready with warnings | S-24, with Video language in step 3 and step 4's and step 5's new words |
| An open disclosure | S-16 |
| An invalid submission | S-41 |
| Running | S-48, with Video language locked and the new next-video line |
| Finished, with its player | S-53, with S-126's assertions |
| A previous result | S-63, its player kept |
| Discard | S-58 |
| A failure | S-56; S-29 as the fallback |
| The dialog | S-76, "Report a problem" |
| The statement | S-81 |
| The player's controls focused | S-127 |
| The limiting warning | S-135 |
| The onset "?" open, its new edge | S-17 |
| The format "?" open | S-141 |
| The footer | S-83 |
| Video language in step 3 | S-119 |

"Ready with warnings" is still the warn verdict (S-24), and S-73 gives it by
F9 if N2 is not ready. At the 32 px font on a phone width, step 4's selects
clip in every state that shows them; that is recorded against wish VH-189.1,
as VH-189 measured it.

## Keyboard route per journey

The keys-only route runs apart from setup. Choosing the file is setup
(`DOM.setFileInputFiles`), since the native chooser is the browser's own
(VH-168), and so is each fault. Each route runs in three languages at
1280 px and in English at 320 px. At 320 px the onset "?" sits beside
"Plays over" (S-112), with the same Tab order.

- **J1:** S-03 → S-141 → S-142 → S-12 → S-14 → S-15 → S-16 → S-92 →
  S-119 → S-17 → S-95 → S-97 → S-36 → S-37 → S-39 → S-44 → S-47 →
  S-48 → S-123 → S-49 → S-72 → S-53 → S-126 → S-127 → S-114 → S-58 →
  S-59 → S-61 → S-62.
  - S-141 and S-142: from Page language, Tab to "About the video
    format"; Enter opens it; Tab closes it on Video type.
  - S-92: from Video properties, Tab to the start handle; Page Up twice,
    Page Down (10 s on `lecture-360s`, whose 1% is 3.6 s); Home puts it
    back, so the job keeps the whole video.
  - S-119: Tab on through the trim to step 3; Video language is one stop,
    its checked radio, then "Add a title card".
  - S-17, S-95, S-97: on to step 4's "?"; Enter opens it; Tab closes it on
    the Blue radio; Shift+Tab back to the "?", Enter, Escape: focus on the
    "?".
  - S-123: while the job runs, Tab passes the disabled Video language.
  - S-126, S-127: from the card, Tab enters the player's controls, then
    Save; Shift+Tab back to the card (K-player is the long form).
  - S-114: Tab to Create, which reads "Create the video again".
  - At 375 px the end is S-26 → … → S-70 → S-130.
- **J2:** S-03 → S-07 → S-12 → S-14 → S-15 → S-121 → S-122 → S-40 →
  S-41 → S-42 → S-45 → S-48 → S-43 → S-123 → S-53 → S-61 → S-62.
  - S-121 and S-122: Tab from the trim reaches Video language, then the
    first of the four fields, the box being locked; ArrowRight on Video
    language picks Malay, focus on the radio; Tab on to the fields.
- **J3:**
  - S-02 (its own load);
  - S-106 (its own load, F17): the note above step 1; Tab reaches Choose
    file, which is open;
  - then S-28 → S-29 → S-15;
  - then S-31 → S-35;
  - then S-56 → S-57 → S-53 → S-132 (F15a, in place) → S-69 (F4e
    revised) → S-62;
  - then S-74 → S-75 → S-77 → S-80 → S-148: Escape returns focus to
    "Report this problem"; Tab on to the footer's Report a problem; Enter
    opens the same dialog; Escape returns focus to it.
- **J4:** S-53 → S-13 → S-63 → S-116 → S-129 → S-64 → S-65 → S-71 →
  S-30 → S-58 → S-60 → S-48 → S-50 → S-123 → S-53.
  - S-71: Shift+Tab to Video type, Student submission; then Tab on to
    Video language in step 3, free beside the kept result, another
    language; the next-video line names the video type only.
  - S-50 and S-123: while the job runs, Video type switches and Video
    language is disabled.
- **K-dialog:** from the top of the page, Tab forward past the lede's "?",
  Video type, Choose file, the System check's and the statement's
  summaries and the two help links, to Report a problem (`#feedback-open`);
  Enter opens the dialog named "Report a problem", focus on the message;
  six Tabs and six Shift+Tabs stay inside or leave for the browser's own
  controls, never the page behind; Escape closes it, focus back on Report a
  problem; Shift+Tab moves back to the Self Service link. The entry from
  Errors captured is in J3 (S-148).
- **K-player (new):** from S-53, focus on the card.
  - Tab enters the player: each of Chrome's controls in turn, with
    `document.activeElement` the `<video>` throughout; the route counts the
    stops and asserts that the next Tab reaches Save the video.
  - Space on play plays, muted by setup; Space again pauses.
  - Shift+Tab goes back through the same controls to the card.
  - With F4b at 3 s a chunk: Tab to Save; Enter, and Stop saving takes
    focus; Shift+Tab passes the disabled Save into the player while it
    streams; the save completes, the player leaves and focus is on the
    card (S-131).
  - A control Chrome does not let Tab reach is "cannot determine", never a
    pass.

## The matrix's Phase 8 part, by count

The plan sizes the matrix; this is what the scenarios give it. There are 59
new scenarios, S-92 to S-150, and 60 carried rows in the table above,
some holding several of the walker's variants (S-53, -W and -LW is one row
and three scenarios). Each scenario runs in up to the plan's 26 cells: the nine language and view cells in light;
dark and both forced palettes in each language at 1280 px; text spacing at
320 px in each language; the 32 px font and fallback faces in English and
Chinese at 1280 px; reduced motion in English at 1280 px. The finite list's
six Phase 8 states also take landscape, short height and both proxies, 24
records. The six routes take four cells each, 24 records. Some scenarios
are declared narrower, each with its reason, as the walker's `views` and
`langs` are: S-94 (English at 1280 px: key steps, not a look), S-102
(1280 px in light: an outcome), S-112 (400, 401, 375 and 320 px), S-113
(the 32 px font), S-130 (375 px), S-134 (English at 1280 px: Chrome's
cache), S-140 (English at 1280 px: one outcome a file), S-144 (its own
positions) and S-149 and S-150 (the transitions' cells). VH-198 subtracts
the cells `PLANS.priority` already holds and declares the exact counts.

## Not in this pass

- Phase 7's three: the other drop refusals, a card field that does not
  fit, and the re-check after a preset change, for its reasons.
- `failure.unlevellable.next`: no fault is known that makes a recording
  unlevellable; `src/ui/failure-text.test.ts` holds it.
- A load-time check settling after a file is chosen (VH-187's criterion):
  at `2bcb191` it cannot happen. The chooser is shut until start-up settles
  (`main.ts:1299`, `2454`), and the AAC check settles with H.264's
  (`main.ts:1131`). Source-only.
- The limiter's non-finite and lowered-ceiling paths (wish VH-193.2's
  unit-test part): test code, not a page state.
- The logged bite in Report a problem's details: the 140-character line
  clip (`FEEDBACK_LOG_LINE_MAX_CHARACTERS`, `feedback.ts:62`) leaves it
  out, as VH-193.2 records; no criterion asks the page to carry it or drop
  it.
- The Teams recording in the matrix: 29 minutes a job. It runs once, in
  English at 1280 px in light, as VH-193's check did. `C0413.MP4` is listed
  only, as the owner judged it ("it's not typical").
- What a screen reader says for the player, both "?", the footer's
  headings and the warning; playback with sound; whether the warning's
  advice is understood; real phones, Windows contrast themes and real zoom:
  the person checklist.
- Chrome's own drawing of the player's controls, beyond what the tree and
  the pixels reach: "cannot determine", and on the person checklist.
- Wish VH-196.1, a Colours setting: a proposal, not a page state.
- The statement's media line (wish VH-192.1) and its file chooser line
  (wish VH-194.2): statement words for VH-137's review; S-81 reads them as
  they stand.
- The Chinese and Malay drafts (wishes VH-193.1, VH-181.1 and VH-175.4):
  a native reader's check, not the walker's.
- VH-194: documents only; no page state.
- `PLANS.matrix`'s 641 unrun cells (wish VH-172.1): the plan's concern;
  only those a Phase 8 item touched run here.
