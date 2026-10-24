# Checking UoN Video Helper by hand

For Disability Support Services colleagues, 23 October 2026 (VH-173),
updated 24 October with the checks the fixes added (VH-177). The
tool trims a teaching video, adds the University's title card and closing,
and saves a new file. Our automated checks cannot hear a screen reader or
hold a real phone, so we need you. Do the tasks that fit the tools you use;
a task you could not finish is still worth reporting.

**The page:** <https://djdaojones.github.io/UoN-Video-Helper/>, built for
Chrome. If another browser says it has not passed its checks, tell us
whether that was clear.

**Test clips,** on your own machine, since your video never leaves it: an
MP4 of 1 to 2 minutes with speech; a clip of 5 minutes or more, so there is
time to cancel; and a text file renamed to end `.mp4`. We can send a set.

The page has six steps: **1. Choose a video**, **2. Trim**, **3. Title
card**, **4. Closing graphics**, **5. File size / quality** and **6.
Create**. **Send feedback** and the **Accessibility statement** are at the
foot.

## The tasks

**A. Screen reader** (NVDA with Chrome on Windows, or VoiceOver with Safari
on a Mac; VoiceOver with Chrome too, if you have time). Make a video from start to finish, then save
it. *Expected:* each step's number and name is read; you hear the check
finish, the stages, "Your video is ready." and, after saving, "Saved.";
step 4 is read as "4. Closing graphics". When something you were on goes
away because the work moved on, you hear where you now are, and the next
Tab goes on from there.

**B. Announce progress.** While a video is being made, untick and tick
**Announce progress** in step 6, and leave focus on it until the video is
made. *Expected:* off, only the result is read; when the box goes, focus
moves to the finished video, never to the top of the page. With VoiceOver
and Safari, also click **Cancel** with the mouse while focus is on
**Announce progress**. *Expected:* focus lands on a control you can use.

**C. Keyboard alone,** Tab, Shift+Tab, Enter, Space, Escape and the
arrows. *Expected:* **Skip to main content** comes first; every control
shows a clear outline; nothing traps you; focus never jumps where you did
not ask; when a control you are on goes away, focus moves to the next
one you need, never to the top of the page. Then:

- **Step 4's two dropdowns** open and change by keys.
- **The preview** plays and pauses; the Start and End handles move.
- **Errors:** choose the text file; type `abc` in **Start time**.
  *Expected:* each says what to do.
- **Cancel** the long clip, then **Create the video** again. *Expected:*
  "Cancelled. Nothing was saved…", then it is made.
- **A kept result:** make a video, do not save, choose another clip.
  *Expected:* "Previous video" keeps its own **Save the video**;
  **Create the video** asks first, and **Keep it** returns to the result.
- **Feedback:** press **Send feedback**. *Expected:* focus is in **Your
  message**; empty, **Open email app** says "Write a message first.";
  Escape returns focus to **Send feedback**.

**D. A Windows contrast theme,** one of Aquatic, Desert, Dusk or Night sky
each. Repeat C briefly. *Expected:* all text, edges, chosen options,
sliders and outlines can be seen; look closely at the outline on the file
button, on the language buttons at the top and on the slider handles. Point
at **Create the video** and **Save the video**. *Expected:* the button's
edge changes; tell us whether you would notice it.

**E. Larger text,** in English, 简体中文 and Bahasa Malaysia: Chrome zoom at
200% and 400%, a 320-pixel-wide window, your text-spacing tool, and a very
large font in Chrome's settings. *Expected:* nothing cut off, no sideways
scrolling to read a line, the slider handles' outline still clear, and the
**Send feedback** dialog still usable. You need not judge the translations.

**F. Real phones,** Android with Chrome and an iPhone. Make a video from a
30-second recording, switch to another app for a minute while it is made,
then return to it. Save it and find the file. *Expected:* the page says
plainly what happened, and the file plays.

**G. Speech input** (Voice Access, Voice Control or Dragon). Say what you
see, such as "Click Create the video" and "Click Choose File". *Expected:*
each control answers to its visible words. We know **Choose File** may
not answer, because the browser draws it; try "Click Choose a video" too,
and tell us which worked.

**H. Your own language** (campus colleagues who read Chinese or Malay
natively). On the 简体中文 or Bahasa Malaysia page, read: step 4's name
(结尾图形, "Grafik penutup"); the note under a video with an unusual frame
rate, such as 120 frames a second; in Chinese, the closing card's two names
(结束卡 and 结束卡片), to choose one; and the words above step 1, which on a
laptop push **Choose File** below the first screen. *Expected:* each reads
naturally; tell us what you would write instead, and anything shorter above
step 1.

## Report form

Email <joe.bell@nottingham.ac.uk>, one block per task. **Send feedback** in
the tool also works; it adds the version and your browser, never your
video.

```text
Device:
Browser and version:
Assistive tool and version (or none):
Page language:
Task (A to H, and which part):
What happened:
What you expected:
Did you need help? With what:
Anything confusing or tiring:
```

Your results feed the statement's review (VH-137), the assistive-technology
and phone checks (VH-M4, VH-113) and the specification's hand walk (§13,
criterion 10). A task not done is recorded as deferred, in writing, never as
passed, and we will not claim the tool conforms because of them. Thank you.

## For the owner: what each task settles

None of these settles spec §13 criterion 10 alone: the criterion needs
every part, in each language, and a deferred part is written down, never
passed. Nothing here claims full conformance.

| Task | VH-137, the statement | VH-113, phones | VH-M4, staff | §13 criterion 10 |
| --- | --- | --- | --- | --- |
| A. Screen reader | The screen readers and browsers actually used can be named as run, and "no one has yet tested it with a screen reader" reworded | — | Its screen-reader part | The pairings and states actually walked toward the NVDA + Chrome and VoiceOver + Safari part; also VH-150.2, VH-127.1, VH-128.1, VH-122.1, VH-135.1, VH-136.1, VH-139.2 and VH-148.2 |
| B. Announce progress | Whether "reads out each stage" holds; the hand-on after a job (V-46) heard | — | Its screen-reader part | Part of the screen-reader walk; Safari's Cancel click (VH-178) |
| C. Keyboard alone | The keyboard test can be named as run, for the states walked | — | — | The states actually walked toward the keyboard-only part; states the tasks do not reach, such as every feedback failure, stay open |
| D. Windows theme | The contrast-theme test can be named as run; "your computer's high contrast mode" confirmed | — | Its Windows high contrast part | The contrast-theme part; the rings and hover VH-179 drew (V-40, V-42, V-44) in a real theme |
| E. Larger text | The 400% and 320 px test can be named as run | — | — | The 200%, 320 px and text-spacing part in each language; the handles at a real large font (V-41) |
| F. Real phones | A phone line in "How we tested", if the owner wants one | Its last criterion: seen on a real Android phone and an iPhone | Its real-phone part | The phone check, completed or deferred in writing |
| G. Speech input | V-43's limitation confirmed or reworded (VH-175.2) | — | Its speech-input part | The speech-input check, completed or deferred in writing |
| H. Your own language | Corrections toward VH-105.2; the language-wide machine-translation line comes off only after that language's whole page is checked live and corrected through the sheet | — | — | Not part of it; the native-reader work is VH-175.4 and VH-181.1 |

Checks for the owner's own machine, not for the testers: a headed Chrome
and Safari's Cancel click (VH-178); the trim handles in Firefox, read only
in source (VH-179); the file button's text contrast at device scale 3, where
4 landscape records read "cannot determine" by one pixel (VH-176); and, in
VH-M4's staff session, whether "some frames will be repeated or left out"
reads plainly (V-47). VH-M4's observed staff sessions, and the wider judgement of the page in use, stay outstanding whatever these tasks find.
