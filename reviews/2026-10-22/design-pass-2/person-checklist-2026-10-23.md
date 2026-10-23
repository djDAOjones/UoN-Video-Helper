# Checking UoN Video Helper by hand

For Disability Support Services colleagues, 23 October 2026 (VH-173). The
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
card**, **4. Closing branding**, **5. File size / quality** and **6.
Create**. **Send feedback** and the **Accessibility statement** are at the
foot.

## The tasks

**A. Screen reader** (NVDA with Chrome on Windows, or VoiceOver with Safari
on a Mac; VoiceOver with Chrome too, if you have time). Make a video from start to finish, then save
it. *Expected:* each step's number and name is read; you hear the check
finish, the stages, "Your video is ready." and, after saving, "Saved.".

**B. Announce progress.** While a video is being made, untick and tick
**Announce progress** in step 6, and leave focus on it until the video is
made. *Expected:* off, only the result is read; focus stays on a control
you can use when the box goes.

**C. Keyboard alone,** Tab, Shift+Tab, Enter, Space, Escape and the
arrows. *Expected:* **Skip to main content** comes first; every control
shows a clear outline; nothing traps you; focus never jumps where you did
not ask. Then:

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
button and on the language buttons at the top.

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
each control answers to its visible words.

## Report form

Email <joe.bell@nottingham.ac.uk>, one block per task. **Send feedback** in
the tool also works; it adds the version and your browser, never your
video.

```text
Device:
Browser and version:
Assistive tool and version (or none):
Page language:
Task (A to G, and which part):
What happened:
What you expected:
Did you need help? With what:
Anything confusing or tiring:
```

Your results feed the statement's review (VH-137), the assistive-technology
and phone checks (VH-M4, VH-113) and the specification's hand walk (§13,
criterion 10). A task not done is recorded as deferred, in writing, never as
passed, and we will not claim the tool conforms because of them. Thank you.
