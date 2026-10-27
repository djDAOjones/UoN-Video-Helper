# Checking UoN Video Helper by hand

For Disability Support Services colleagues, 27 October 2026 (VH-200),
revised from the list of 23 October (VH-173, VH-177) for what the page's
latest round of changes did. The tool trims a teaching video, adds the
University's title card and closing, levels the sound, and saves a new
file. Our automated checks cannot hear a screen reader or hold a real
phone, so we need you. Do the tasks that fit the tools you use; a task you
could not finish is still worth reporting. Tasks I to N are new: if time is
short, do those first.

**The page:** <https://djdaojones.github.io/UoN-Video-Helper/>, built for
Chrome on a computer. In another browser, a sentence above step 1 says the
browser "has not passed all the checks"; tell us whether that was clear.
The page may change while we fix what this list finds. **Report a
problem** adds the version you tested.

**Test clips.** We send these with this list. They stay on your own
machine, since your video never leaves it.

- `lecture-130s.mp4`: 2 minutes 10 seconds of a test picture and a steady
  tone, for most tasks. Your own clip of 1 to 2 minutes with speech works
  too.
- `lecture-360s.mp4`: 6 minutes, so there is time to cancel.
- `notvideo.mp4`: a text file renamed to end `.mp4`.
- `still-3600s.mp4`: one hour of a still picture.
- `clicks-20s.mp4`: 20 seconds of a quiet tone with loud clicks.
- `late-sound-3.4s-10s.mp4`: 10 seconds; a tone starts 3.4 seconds in.
- `silent-10s.mp4`: 10 seconds with no sound at all.
- `hfr-120fps-10s.mp4`: 10 seconds at 120 frames a second.
- For task F, a 30-second recording made on your phone.

**Where things are.** **Page language** is at the top. Above the steps, **Video
type** chooses **Staff video** or **Student submission**. The page has six
steps: **1. Choose a video**, **2. Trim**, **3. Title card**, **4. Closing
graphics**, **5. File size / quality** and **6. Create**; steps 2 to 6
appear once a video is read. At the foot are the **System check**, the
**Accessibility statement** and **Help and feedback**.

**What is new since the last list:**

- Above step 1, five short promises, with a **?** beside "Saves in a
  reliable format." that explains the format.
- **Video language** has moved from the top of the page into step 3.
- Step 4's words: **Plays over**, with **The last second of video** or **A
  held last frame**; and **No closing graphics** under **Animation type**.
- Step 5's choices: **High quality, for publishing** and **Smaller file,
  for assignments and sharing**.
- The finished video plays in its own card before you save it, and leaves
  the card once it is saved.
- A warning, "The loudest moments were held down hard", when the sound
  needed heavy levelling.
- With a finished video on screen, the button under it reads **Create the
  video again**.
- **Send feedback** is now **Report a problem**, under **Help and
  feedback**, beside help links for staff and for students. Problem reports
  go to the learning content team.
- On a long video, Page Up and Page Down move the trim handles further.

## The tasks

**A. Screen reader** (NVDA with Chrome on Windows, or VoiceOver with Safari
on a Mac; VoiceOver with Chrome too, if you have time). Make a video from
start to finish, then save it. *Expected:* each step's number and name is
read; you hear the check finish, the stages, "Your video is ready." and,
after saving, "Saved."; step 4 is read as "4. Closing graphics". When
something you were on goes away because the work moved on, you hear where
you now are, and the next Tab goes on from there. Tasks I, J, L, M and N
have more for a screen reader.

**B. Announce progress.** While a video is being made, untick and tick
**Announce progress** in step 6, and leave focus on it until the video is
made. *Expected:* off, only the result is read; when the box goes, focus
moves to the finished video, never to the top of the page. With VoiceOver
and Safari, also click **Cancel** with the mouse while focus is on
**Announce progress**. *Expected:* focus lands on a control you can use.

**C. Keyboard alone,** Tab, Shift+Tab, Enter, Space, Escape and the
arrows. *Expected:* **Skip to main content** comes first; every control
shows a clear outline; nothing traps you; focus never jumps where you did
not ask; when a control you are on goes away, focus moves to the next one
you need, never to the top of the page. Then:

- **Step 4's two dropdowns,** **Animation type** and **Plays over**, open
  and change by keys. **Plays over** needs **Fade** or **Slide** chosen
  first.
- **The preview** plays and pauses; the **Start** and **End** handles move.
- **The one-hour clip:** choose `still-3600s.mp4`, Tab to the **Start**
  handle and press Page Up once. *Expected:* it moves 36 seconds (**Start
  time** reads 0:36.0, and a screen reader says "36 seconds"); Page Up again
  takes it to 1 minute 12 seconds, and the right arrow one second more. Page
  Down on **End** moves it back 36 seconds. Each time you stop pressing,
  step 6 checks the video again.
- **Errors:** choose the text file. *Expected:* it says what to do, and
  the later steps go. Then choose `lecture-130s.mp4` again, so that step 2
  comes back, and type `abc` in **Start time**. *Expected:* it says what
  to do.
- **Cancel** the long clip, then press **Create the video** once more.
  *Expected:* "Cancelled. Nothing was saved…", then it is made.
- **A kept result:** do task K by keys.
- **Report a problem:** press it at the foot. *Expected:* focus is in
  **Your message**; empty, **Open email app** says "Write a message
  first."; Escape returns focus to **Report a problem**.

**D. A Windows contrast theme,** one of Aquatic, Desert, Dusk or Night sky
each. Repeat C briefly. *Expected:* all text, edges, chosen options,
sliders and outlines can be seen; look closely at the outline on the file
button, on **Page language** at the top and **Video language** in step 3,
on the slider handles, on each **?**, and on the finished video's player
buttons. Point at **Create the video** and **Save the video**. *Expected:*
the button's edge changes; tell us whether you would notice it. Then:

- **The five promises:** do task M's **The look** in the theme.
- **Links that run onto two lines.** Narrow the window, or zoom to 400%,
  until "Staff: ask in the Creators team on Teams (new tab)" and the links
  in the **Accessibility statement** (open it first) wrap, then Tab to
  each. *Expected:* the outline is clear and hides none of the next
  link's words. We know the Creators link's outline can run over them in
  a contrast theme; tell us whether it gets in your way.

**E. Larger text,** in English, 简体中文 and Bahasa Malaysia: Chrome's own
zoom (Ctrl and +, or Cmd and + on a Mac) at 200% and at 400%; a
320-pixel-wide window; your text-spacing tool; and a very large font in
Chrome's settings (Appearance, Font size, Very large; or 32 under Customise
fonts, if you can). *Expected:* nothing cut off, no sideways scrolling to
read a line, the slider handles' outline still clear, the **Report a
problem** dialog still usable, and the finished video's player inside the
page. You need not judge the translations. Then:

- **The five promises:** do task M's **The look** at 320 pixels and at
  the very large font.
- **Outlines at font size 32** (Customise fonts), on step 5's chosen option
  and on the **?** beside **Plays over**, in a full window and in a
  320-pixel one. *Expected:* clear all the way round.
- **The file button at font size 32,** in a 320-pixel window.
  *Expected:* its words are whole and easy to read.
- We know that at the very large font in a narrow window, step 4's two
  dropdowns are cut off, and that the **Video type** and **Video
  language** choices, the closing colour and the trim's **Set** buttons
  push the page sideways; both are on our list.

**F. Real phones,** Android with Chrome and an iPhone. Make a video from a
30-second recording, switch to another app for a minute while it is made,
then return to it. Play it in its card, then save it and find the file.
*Expected:* the page says plainly what happened; nothing plays until you
tap it; the saved file plays. Then do task M's touch part.

**G. Speech input** (Voice Access, Voice Control or Dragon). Say what you
see, such as "Click Create the video", "Click Report a problem" and "Click
Choose File". *Expected:* each control answers to its visible words. We
know **Choose File** may not answer, because the browser draws it; try
"Click Choose a video" too, and tell us which worked. Try to open a **?**
by voice, and tell us what you said and what worked.

**H. Your own language** (campus colleagues who read Chinese or Malay
natively; a separate check, and we send the full list of new words with
it). On the 简体中文 or Bahasa Malaysia page, read: step 4's name (结尾图形,
"Grafik penutup"); the note under a video with an unusual frame rate, such
as `hfr-120fps-10s.mp4`; in Chinese, the closing card's two names (结束卡
and 结束卡片), to choose one; the words above step 1, which on a laptop
still push **Choose File** below the first screen; and the new words: the
five promises and the format **?**'s text, **Video language**'s line in
step 3, step 4's **Plays over** and its choices, step 5's two names,
**Help and feedback** with its questions and links, **Report a problem**,
and the warning about the loudest moments (above all its "flat or
squashed"). *Expected:* each reads naturally; tell us what you would write
instead, and anything shorter above step 1. The page's own link for better
wording, beside **Page language**, also works.

### New in this version

**I. The finished video** (screen reader and keyboard). Make a video from
`lecture-130s.mp4` and do not save it yet.

- **Two players.** *Expected:* step 2's preview plays your original, as its
  words say; the player in step 6 is named "Finished video —" and its size,
  is a few seconds longer, and ends with the closing graphics. Tell us
  whether you could tell which was which.
- **No sound until asked.** *Expected:* nothing plays until you press play.
- **Play, pause and move along by keys.** Tab into the finished player and
  through each of its own buttons, the three-dot menu included; Shift+Tab
  back out. *Expected:* each button shows a clear outline and your screen
  reader names it; Space or Enter plays and pauses, and you hear that it
  changed; the arrow keys on its timeline move along.
- **Outlines over the picture.** Tab through the finished player's
  buttons, **Play** included, with the video paused near its start, in
  its middle and on its closing graphics. If you can, do it again with
  an upright clip, such as your phone recording from task F, where blue
  bands show beside the picture. *Expected:* each button shows a clear
  outline, whatever part of the video is behind it.
- **Saving.** Press **Save the video**, and save. *Expected:* "Saved. Open
  the saved file to check it, …"; the player leaves the card; focus moves
  to the finished video's card, never the top of the page, and the next Tab
  goes on from there. If you can, make a video from `lecture-360s.mp4` and
  Shift+Tab back into the player while it saves. *Expected:* when the save
  ends, focus moves to the finished video's card.
- **A player that cannot play** (with us: we must make it fail on purpose,
  on our machine). *Expected:* the card's words and **Save the video** stay
  as they were, and saving still works. Tell us what your screen reader
  says for the player.

**J. Page language and Video language.** Read `lecture-130s.mp4`.

- **Telling them apart.** *Expected:* **Page language**, at the top,
  changes the page's words. **Video language**, at the top of step 3,
  changes only the words the tool adds to your video, as its line says:
  "Words the tool adds to your video, on the title card and the closing
  graphics, are in this language." Until you pick one, it follows **Page
  language**; once you pick one, it stays when **Page language** changes.
- **With the card off, on, and on a student submission.** Untick and tick
  **Add a title card**, then switch **Video type** to **Student
  submission**. *Expected:* **Video language** stays at the top of step 3
  each time, above the card's fields; on a student submission the box says
  "A student submission always has a title card."
- **Locked while making.** Make a video. *Expected:* while it is made, step
  3 says "Locked while your video is being made." and **Video language**
  cannot be changed; **Video type** still can, and says "Changes to the
  video type apply to the next video you make."
- **An unreadable file while on Video language** (with a mouse, and your
  screen reader on if you use one). With `lecture-130s.mp4` read, click a
  **Video language** option, then drag `notvideo.mp4` from your desktop
  onto step 1, where it says "Or drop it here." *Expected:* "This file
  could not be read as a video.", the later steps go, and focus moves to a
  control you can use, such as step 1's file button. Press Tab once and
  tell us where you land. We know that today focus falls to the page
  itself here (V-46); we do not know where the next Tab goes, so please
  tell us.

**K. Choosing what to make.**

- **The right file for the job.** Imagine two jobs: a lecture for
  EchoVideo, and a short clip to email to a student. For each, choose in
  step 5. *Expected:* **High quality, for publishing** ("For EchoVideo,
  YouTube, and similar sites.") for the first, and **Smaller file, for
  assignments and sharing** ("For Moodle assignment uploads, email, and
  messages.") for the second, without help. Once made, the line under
  "Finished video" names your choice: "high quality" or "a smaller file".
- **Create the video again.** Make a video and do not save it. *Expected:*
  the button under it reads **Create the video again**; pressing it asks
  first, "This video is not saved yet", and **Keep it** returns you to the
  video.
- **A different file instead.** Then choose another clip. *Expected:* the
  first becomes "Previous video", with its own player and **Save the
  video**, and the button reads **Create the video**. Tell us whether you
  knew, each time, which video the button would make.

**L. Getting help and reporting a problem.**

- **Help, found by headings.** With your screen reader's list of headings,
  find help for staff and for students. *Expected:* "Help and feedback",
  then three questions: "Need help using the tool?", "Something not
  working?" and "What do you think of the tool?". Under the first, "Staff:
  ask in the Creators team on Teams (new tab)" and "Students: get help
  through Self Service (new tab)", each opening a new tab. Both show
  whether **Video type** is **Staff video** or **Student submission**.
- **From the foot.** Press **Report a problem**, type a message and press
  **Open email app**. *Expected:* the dialog says your message goes to
  <UI-Learning-Content@nottingham.ac.uk> from your own email app; your email
  app opens with it to that address, its subject starting "UoN Video Helper
  problem report". Check it; you need not send it. Back on the page, Escape
  returns focus to **Report a problem**.
- **From Errors captured** (with us: it shows only when something inside
  the tool goes wrong, so we set it up). Press **Report this problem**.
  *Expected:* the same dialog opens, and Escape returns focus to **Report
  this problem**.

**M. The two ? buttons:** one beside "Saves in a reliable format." at the
top, and one beside **Plays over** in step 4 (choose **Fade** under
**Animation type** first).

- **By keys.** Tab to each; press Enter, then try Space. *Expected:* its
  text appears just below it, and your screen reader reads it. Escape
  closes it and leaves you on its **?**; Tab on closes it and moves on. The
  two are never open at once.
- **By mouse and by touch.** *Expected:* a click or tap opens it; a click or
  tap elsewhere closes it; pointing at it without clicking opens nothing;
  a click or tap just beside the small **?** still opens it.
- **The words around the top ?.** It sits between "Evens out the audio
  level for better audience experience." above and "Makes the file the
  right size for your purpose." below. Select words in each of those two
  lines close to the **?**, by dragging or double-clicking, and click or
  tap on them there. *Expected:* each does what you would expect for
  text, and the tip does not open by surprise; tell us if it does. When
  the tip opens, it sits wholly clear of the **?**, covering none of it.
- **The look.** *Expected:* the five promises evenly spaced, the line with
  the **?** no taller than the others, in light and in dark (your
  computer's dark mode), and in task D's theme and task E's width and
  font.
- **Text spacing.** Turn on your text-spacing bookmarklet or extension, set
  to WCAG's values (line height 1.5 times the text size, space after
  paragraphs 2 times, letter spacing 0.12 times, word spacing 0.16 times).
  *Expected:* nothing in the promises or either **?**'s text is cut off or
  overlaps.

**N. Notices about the sound.**

- **Heavy levelling, with Announce progress off.** Turn off **Announce
  progress** first. It shows in step 6 only while a video is being made,
  so start making a video from any clip, untick it while it runs, then
  press **Cancel**; the page remembers it. Then make a video from
  `clicks-20s.mp4`. *Expected:* you
  hear "Your video is ready." and "Worth knowing about the finished video:
  The loudest moments were held down hard." The warning's detail ends "…so
  play the new video before you save it. Next time, try adjusting how you
  record the sound." Tell us: did you find that advice before you reached
  **Save the video**? What would you do next, and what does "adjusting how
  you record the sound" mean to you? We know the advice comes after **Save
  the video** when you read down the page, and the announcement gives only
  its title.
- **A very short sound kept.** Choose `late-sound-3.4s-10s.mp4`. Play the
  preview: a tone starts 3.4 seconds in. Type `0:03.6` in **End time** and
  press Tab. *Expected, today:* under "Worth knowing about the audio",
  "This video has no audio", though the part you keep holds about a fifth
  of a second of the tone. We know these words are wrong here: the tool
  leaves out a sound this short, because it is too short to level. Tell us
  what you think happened, and whether you would trust the finished video.
  Then choose `silent-10s.mp4`, which really has no sound, and compare the
  words.

## Report form

Email <UI-Learning-Content@nottingham.ac.uk>, one block per task. **Report
a problem** in the tool also works; it adds the tool's version, your
browser and your video's length, picture size and format, never the video
or its name.

```text
Device:
Browser and version:
Assistive tool and version (or none):
Page language:
Zoom, text size, window width or colours (if changed):
Task (A to N, and which part):
What happened:
What you expected:
Did you need help? With what:
Anything confusing or tiring:
```

Your results feed the statement's review (VH-137), the assistive-technology
and phone checks (VH-M4, VH-113), the specification's hand walk (§13,
criterion 10) and the follow-ups still open. A task not done is recorded as
deferred, in writing, never as passed, and we will not claim the tool
conforms because of them. Thank you.

## For the owner: what each task settles

None of these settles spec §13 criterion 10 alone: the criterion needs
every part, in each language, and a deferred part is written down, never
passed. Nothing here claims full conformance. The last column names pass
3's findings and the open wish lines a task gives a person's evidence for;
a fix's own check stays VH-203's.

| Task | VH-137, the statement | VH-113, phones | VH-M4, staff | §13 criterion 10 | Findings and open lines |
| --- | --- | --- | --- | --- | --- |
| A. Screen reader | The screen readers and browsers actually used can be named as run, and "no one has yet tested it with a screen reader" reworded | — | Its screen-reader part | The pairings and states actually walked toward the NVDA + Chrome and VoiceOver + Safari part | VH-150.2, VH-127.1, VH-128.1, VH-122.1, VH-135.1, VH-136.1, VH-139.2, VH-148.2 |
| B. Announce progress | Whether "reads out each stage" holds | — | Its screen-reader part | Part of the screen-reader walk; Safari's Cancel click (VH-178) | VH-150.2's Announce progress |
| C. Keyboard alone | The keyboard test can be named as run, for the states walked | — | — | The states actually walked toward the keyboard-only part, VH-183's Page step among them; states the tasks do not reach, such as every feedback failure, stay open | VH-138.4's two closing selects by arrow key |
| D. Windows theme | The contrast-theme test can be named as run; "your computer's high contrast mode" confirmed | — | Its Windows high contrast part | The contrast-theme part; the rings and hover VH-179 drew (V-40, V-42, V-44) in a real theme | V-49, the wrapped Creators link; S-81's wrapped statement link, by eye; the player's rings in a theme (S-127); VH-205's "?" in forced colours, "missing"; VH-148.2's theme part |
| E. Larger text | The 400% and 320 px test can be named as run | — | — | The 200%, 320 px and text-spacing part in each language; the handles at a real large font (V-41) | V-48 at a real large font; step 5's radio ring by eye, its disc wish VH-200.1; VH-138.4's browser zoom at 200%; the file button's words at 32 (1.4.3); VH-189.1 and V-50, already known |
| F. Real phones | A phone line in "How we tested", if the owner wants one | Its last criterion: seen on a real Android phone and an iPhone | Its real-phone part | The phone check, completed or deferred in writing | The player through a download hand-off (S-130), by a person |
| G. Speech input | The Choose File limitation (V-43) confirmed or reworded, with VH-194.2 | — | Its speech-input part | The speech-input check, completed or deferred in writing | How a "?" answers to voice, its visible label a symbol: evidence only, no finding |
| H. Your own language | Corrections toward VH-105.2; the language-wide machine-translation line comes off only after that language's whole page is checked live and corrected through the sheet | — | — | Not part of it | VH-105.2, VH-175.4, VH-181.1, VH-193.1; Phase 8's strings listed at VH-195 |
| I. The finished video | VH-192.1, the statement's media limitation | — | Its screen-reader part | The player in the keyboard and screen-reader parts (VH-138.4's native player by keyboard) | S-127's 2.4.7 and 4.1.2 rows, and its 2.4.13 rings over the picture and the letterbox (wish VH-200.1), missing evidence; the failed player's name (S-152, accepted user-agent behaviour) heard |
| J. Two languages | — | — | Whether the two are told apart | Keyboard and screen-reader states for the moved control | V-46, regressed: S-149's focus on `body`, seen by a person |
| K. Choosing what to make | — | — | Whether the output names and "Create the video again" read plainly | The kept-result state | — |
| L. Help and reporting | The address the "Feedback and contact" line names, reached by Report a problem | — | Whether staff and students find their route | The feedback state and the dialog's focus return, from both buttons | — |
| M. The two "?" | — | — | — | Keyboard, text-spacing and contrast-theme parts for both toggletips | VH-205's 1.4.12 and forced colours, "missing"; its line rhythm, which no scenario checks; its 44 px target over the third and fifth promises, and its tip clear of the "?"; both "?" by touch |
| N. Notices about the sound | — | — | Whether the advice is understood and acted on | — | D-06 (rank 2), D-05 (rank 1), for VH-202's plan |

Checks for the owner's own machine, not for the testers: a headed Chrome
and Safari's Cancel click (VH-178); the trim handles in Firefox, read only
in source (VH-179); the file button's text contrast at device scale 3, where
4 landscape records read "cannot determine" by one pixel (VH-176); setting
up, for a tester, a player that cannot play (the walker's F15b) and an
Errors captured panel, since neither can be caused from the page alone; and, in VH-M4's
staff session, whether "some frames will be repeated or left out" reads
plainly (V-47). VH-M4's observed staff sessions, and the wider judgement of
the page in use, stay outstanding whatever these tasks find. The measured
readings stay VH-203's after-run's: 2.4.13's areas, 2.5.5's target round
the format "?", the finish+1s player row, and wish VH-200.1's radio disc,
wrapped-link fragments and background behind each player ring. A
person's eye adds to them, never replaces them.
