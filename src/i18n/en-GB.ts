/**
 * Every string the page can show, in English (VH-105): labels, stage names,
 * the live-region announcements, warnings, errors, the browser block, the
 * tab title, the suggested file name. The other tables are typed against
 * this one (`Messages`), so a key English has and another lacks is a type
 * error, and `tables.test.ts` fails on it at runtime too.
 *
 * Data only, so a translator's sheet maps onto it row for row
 * (`sheet.ts`): every leaf is a whole message, and a parameter is a
 * `{name}` placeholder that `compile.ts` fills, writing numbers with this
 * language's own `Intl` formatters. Where English would choose a word inside
 * a sentence — blue or white, fade or slide, start or end, one or many — each
 * choice is its own key, because the other two languages order and inflect
 * their words differently:
 *
 * - a group of `one` and `other` is a count, chosen by `Intl.PluralRules`
 *   on its `{count}`;
 * - a group of numbered keys and `other` is a count said in words — the
 *   number's own key, else `other`;
 * - any other group is chosen by the code, by name.
 *
 * The keys are settled (VH-105, 2026-10-18): the translation sheet is keyed
 * by them, so a key renamed here orphans a translated row. Change a key only
 * with the tables and the sheet in the same commit.
 *
 * Copy rules for English (spec 9.2, VH-114, VH-124): sentence case;
 * capitalise sentence starts and proper names; keep the approved acronyms;
 * a complete sentence ends with a full stop and a label or heading does
 * not; plain words at a lower-secondary reading level, which
 * `test/readability.test.ts` measures over this file.
 *
 * Diagnostic prose — logs, captured errors, the feedback details — is not
 * here. It stays English for the maintainer and is marked `lang="en-GB"`
 * on the page.
 */

export const enGB = {
  /** How this language writes what is not a word: never translated in the sheet, set per table. */
  meta: {
    /** The locale `Intl` formats this table's numbers, lists and plurals in. */
    locale: 'en-GB',
    /** How a duration's units are joined (`Intl.ListFormat` unit style): "4 minutes 12 seconds". */
    durationList: 'narrow',
    separators: {
      /** Between the facts in one sentence: "1 minute, 1920 × 1080". */
      list: ', ',
      /** Between whole items said in a row: warning titles. */
      series: '; ',
      /** Between sentences joined into one passage. Chinese uses none. */
      sentences: ' ',
    },
  },

  app: {
    title: 'UoN Video Helper',
    description:
      'Add approved University of Nottingham branding and consistent audio levels to a video, and get an optimised file back, without uploading it anywhere.',
    skipLink: 'Skip to main content',
  },

  language: {
    /** The switcher's visible label, which is also its accessible name. */
    label: 'Page language',
    /** Said once, in the new language, when the page changes language. */
    switched: 'Page language: {name}.',
    /**
     * The note beside the switcher on a page a computer translated (decisions,
     * 2026-10-18: go live, marked as machine translation). Never shown in
     * English; here so every table has it, and so the sheet has the source.
     */
    machine: {
      title: 'Machine translation',
      text: 'A computer translated this page from English, so some words may be wrong.',
      /** A link that opens an email to the address it names. */
      link: 'Email better wording to {address}',
    },
  },

  lede: {
    intro: 'This tool does the following to your video:',
    promises: [
      'Adds approved branding.',
      'Ensures consistent audio levels.',
      'Outputs an optimised file type and size.',
    ],
    privacy:
      'Your video is processed on your device, it is never uploaded, and the original file does not change.',
  },

  browserNote: {
    pending: 'This app is designed and built for Chrome, other browsers may not work.',
    notPassed:
      'This app is designed and built for Chrome, and this browser has not passed all of its checks. The system check at the foot of the page says what is missing.',
    passed: 'This app is designed and built for Chrome, and this browser has passed the checks for it to run.',
  },

  /** The switch above the six steps (VH-131). */
  videoKind: {
    /** Its visible label, which is also its accessible name. */
    label: 'Video type',
    options: { staff: 'Staff video', submission: 'Student submission' },
    /** The line under the switch: what the side chosen means for the closing. */
    result: {
      staff: 'You choose the closing graphics, and whether they say “{words}”.',
      submission: 'If the video has closing graphics, they say “{words}”.',
    },
  },

  /** The choice under the switch: the language of the words drawn into the video (VH-132). */
  videoLanguage: {
    /** Its visible label, which is also its accessible name. */
    label: 'Video language',
    /** The line under it: what the choice changes, and so what it does not. */
    helper: 'Words the app adds to your video are in this language.',
    typed: 'What you type is kept as typed.',
    /**
     * Under both switches while a video is being made or a finished one is on
     * screen (VH-140): neither is locked, and a change is not for that video.
     */
    nextVideo: 'Changes to the video type or video language apply to the next video you make.',
  },

  steps: {
    choose: 'Choose a video',
    trim: 'Trim',
    titleCard: 'Title card',
    closing: 'Closing branding',
    preset: 'File size / quality',
    create: 'Create',
  },

  choose: {
    starting: 'Checking whether this browser can run the tool…',
    dropHint: 'Or drop it here.',
    dropHeld: 'Let go to read this video.',
    reading: 'Reading the video…',
    drop: {
      making: 'A video is being made. Cancel it, or wait for it to finish, before choosing another.',
      saving: 'A video is being saved. Stop the save, or wait for it to finish, before choosing another.',
      starting: 'The tool is still getting ready. Drop the video again in a moment.',
      unavailable:
        'This browser cannot run the tool, so no video can be read here. The message below says what to do.',
      nothing: 'Nothing was dropped that could be read. Drop a video file.',
      several: 'That was {count} files. Drop one video at a time.',
      notVideo:
        'That is not a video file. Drop a video — a file whose name ends .mp4 or .mov, say — or choose one above.',
    },
  },

  source: {
    /** The read outcome; no sound is added separately, emphasised on screen (VH-148). */
    readSummary: 'Video read.',
    variableFrameRate: 'variable frame rate',
    noSound: 'No sound.',
    properties: 'Video properties',
    lossesTitle: 'Not carried into the new file',
    rows: {
      duration: 'Duration',
      videoFormat: 'Video format',
      fileSize: 'File size',
      resolution: 'Resolution',
      frameRate: 'Frame rate',
      soundFormat: 'Sound format',
      soundChannels: 'Sound channels',
      sampleRate: 'Sound sample rate',
      sound: 'Sound',
      captions: 'Captions',
      fileType: 'File type',
    },
    cannotDecodeVideo: 'This browser cannot read this video format.',
    cannotDecodeAudio: 'This browser cannot read this audio format.',
    rotated: 'Rotated {degrees}°. The output will be upright.',
    variesOnAverage: '{rate} on average, but it varies',
    variesNote:
      'Recordings from Teams, Zoom and screen capture often vary. The output will use a steady frame rate, which keeps sound and picture in step.',
    outputRate: 'The output will run at {rate}, so some frames will be repeated.',
    /** The figure, with its meaning beside it (spec 9.2). */
    sampleRate: '{kilohertz} kHz — {hertz} samples a second',
    noSoundTrack: 'No sound track found',
    noSoundNote: 'Levelling needs sound. The rest of the job still runs.',
    captionsUnchecked: 'Could not be checked in this kind of file',
    captionsFound: 'Found {found}',
    captionsNone: 'None found in this file',
    captionTracks: { one: '{count} caption track', other: '{count} caption tracks' },
    chapterTracks: { one: '{count} chapter track', other: '{count} chapter tracks' },
    moreVideoTracks: { one: '{count} more video track', other: '{count} more video tracks' },
    moreSoundTracks: { one: '{count} more sound track', other: '{count} more sound tracks' },
    losses: {
      extraTracksTitle: 'This file has {found}',
      extraTracksDetail:
        'The new file keeps one picture and one sound track — the ones listed under Video properties. The others will not be carried over, and one of them may hold an alternative, such as another language or an audio description. If you need them, keep the original alongside.',
      uncheckedTitle: 'Caption and chapter tracks could not be checked',
      uncheckedDetail:
        'This kind of file cannot be checked for them. If yours has them, they will not be carried over.',
      captionsConsequence:
        'The new file will have no caption track, so wherever you publish it must supply captions. EchoVideo makes its own after upload — check them. A file sent directly needs captions added by you. Captions drawn into the picture stay.',
      chaptersConsequence: 'The chapters will not be in the new file.',
      keepOriginals: 'If you need the originals, keep this file alongside.',
    },
  },

  trim: {
    intro:
      'Optional. Cut unwanted material from the start or the end. Left alone, the whole video is kept. The preview plays your original as it is now: the sound is levelled and the closing graphics added when the video is made.',
    noPreview: 'A preview is not available for this file. You can still set the times.',
    start: 'Start',
    end: 'End',
    startTime: 'Start time',
    endTime: 'End time',
    setStart: 'Set start here',
    setEnd: 'Set end here',
    /** Both forms: a phone's decimal keyboard has no colon (VH-113). The parser takes exactly these. */
    format: 'Minutes and seconds, like 1:05.5, or seconds, like 65.5.',
    useWhole: 'Use the whole video',
    reading: 'Reading the video…',
    unreadable: 'There is no video to trim: that file could not be read.',
    tooShort: 'It is shorter than {seconds} seconds, so it cannot be trimmed.',
    keepingWhole: 'Keeping the whole video, {duration}.',
    keeping: 'Keeping {kept} of {duration}.',
    handleBeginning: 'the beginning',
    handleEnd: 'the end',
    problem: {
      notATime: {
        start: 'Write the start time as minutes and seconds, like 1:05.5, or as seconds, like 65.5.',
        end: 'Write the end time as minutes and seconds, like 1:05.5, or as seconds, like 65.5.',
      },
      afterEnd: {
        start: 'The start time is after the end of the video, which is {length} long.',
        end: 'The end time is after the end of the video, which is {length} long.',
      },
      notTimes: 'The start or end of the video is not a time.',
      startAfterEnd: 'The start is after the end of the video.',
      endBeforeStart: 'The end must come after the start.',
      keepAtLeast: 'Keep at least {seconds} seconds of the video.',
    },
    correctToContinue: 'Put the start and end times right in step 2 to continue.',
  },

  /** Step 3, the staff video's title card before the video (VH-127). The card itself has no labels. */
  titleCard: {
    legend: 'Title card',
    intro: 'A card shown for {seconds} seconds before your video starts, in white text on blue.',
    add: 'Add a title card',
    title: 'Title',
    department: 'Department',
    authors: 'Authors',
    date: 'Date',
    dateHelper: 'Filled with today’s date in the video language.',
    dateHelperNext: 'You can change it or clear it.',
    /** Why the box is ticked and locked, naming the side of the switch that locks it (VH-128). */
    forSubmission: 'A student submission always has a title card.',
    /** Under the box while the staff card's fields show: what a card needs, before Create says it (VH-140). */
    fieldsRule: 'Any one field is enough to make a card.',
    fieldsRuleNext: 'The date is filled in for you.',
    /** Beside a field whose typing reached its limit and was cut there. */
    full: 'This field is full, so the rest was not added.',
    /** Beside the field the card cannot fit, even at its smallest size. */
    refused: {
      field: 'This is too long to fit on the card. Shorten it.',
      card: 'Together, the fields are too long to fit on the card. Shorten this one or another.',
    },
    /** Beside the box, when Create is pressed with the box ticked and every field empty. */
    empty: 'Fill in at least one of the four fields, or untick Add a title card.',
    correctToContinue: 'Put the title card right in step 3 to continue.',
    /** Submission's four fields on the page (VH-128); the card draws its own labels, from `card`. */
    submission: {
      /** Under the box, before the four fields: every one is needed, before Create says so (VH-140). */
      fieldsRule: 'All four fields are needed.',
      assignment: 'Assignment title or number',
      module: 'Module code and title',
      convenor: 'Module convenor or tutor',
      ids: 'Student ID numbers',
      /** {digits} and {max} come from `config/cards.ts`, so the words and the check cannot part (VH-140, V-29). */
      idsHelper:
        'Each student ID (identity) number is {digits} digits.',
    idsHelperNext: 'Type up to {max}, with spaces, commas or new lines between them. Do not add names.',
      /** Under the fields: what the app adds to the card itself, the running time as a clock time. */
      filled:
        'The card also shows the running time, {running}, and today’s date, marked as the date the card was made, not the submission date.',
      /** Beside a field left empty, when Create is pressed. */
      missing: {
        assignment: 'Type the assignment’s title or number.',
        module: 'Type the module’s code and title.',
        convenor: 'Type the name of the module convenor or tutor.',
        ids: 'Type at least one student ID number.',
      },
      /** Beside the ID numbers, when Create is pressed: what is wrong, quoting the number. */
      idNotAnId: '“{id}” is not a student ID number. Each is {digits} digits.',
      idTwice: '{id} is in the list twice. Take one out.',
      idsTooMany: 'That is {count} numbers. The card takes up to {max}.',
    },
    /** Drawn on Submission in the video's language, never shown on the page (VH-128). */
    card: {
      module: 'Module',
      convenor: 'Convenor or tutor',
      ids: { one: 'Student ID number', other: 'Student ID numbers' },
      running: 'Running time',
      made: 'Card made',
      madeValue: '{date} — not the submission date',
    },
  },

  closing: {
    legend: 'Closing branding',
    typeLabel: 'Animation type',
    types: { cut: 'Cut', fade: 'Fade', slide: 'Slide', none: 'None' },
    onsetLabel: 'Animation onset',
    onsets: { existing: 'Over existing', freeze: 'Over generated freeze frame' },
    helpLabel: 'About animation onset',
    helpExistingTerm: 'Over existing',
    helpExistingText:
      '— the closing graphics play over the last second of your video. They cover that second as they build.',
    helpFreezeTerm: 'Over generated freeze frame',
    helpFreezeText:
      '— your last frame is held for one extra second. The closing graphics play over that, so nothing in your video is covered.',
    colourLabel: 'Colour',
    colours: { blue: 'Blue', white: 'White' },
    /** The checkbox: the same closing, with the words below drawn under the logo (VH-126). */
    internalLabel: 'Internal use only',
    /**
     * Not shown on the page: the words drawn into the video's closing card,
     * under the logo. `scripts/build-branding.mjs` builds the closing files
     * from this, so a change here needs them rebuilt (a test says so).
     */
    internalWords: 'Internal use only',
    /** Why a control is locked, naming the animation type that locks it. */
    notUsedWith: { cut: 'Not used with Cut.', none: 'Not used with None.' },
    /** Why "Internal use only" is locked on, naming the side of the switch that locks it (VH-131). */
    internalForSubmission: 'Always on for a student submission.',
    result: {
      none: 'No University closing graphics will be added.',
      adds: { one: 'Adds {count} second.', other: 'Adds {count} seconds.' },
      /** Follows the closing's sentence when Internal use only is on. */
      internal: 'The card says “{words}” under the logo.',
      cut: {
        blue: 'Your video cuts to the blue closing card. {adds}',
        white: 'Your video cuts to the white closing card. {adds}',
      },
      overFreeze: {
        blue: {
          fade: 'Your last frame is held while the blue closing graphics fade in, so nothing is covered. {adds}',
          slide: 'Your last frame is held while the blue closing graphics slide in, so nothing is covered. {adds}',
        },
        white: {
          fade: 'Your last frame is held while the white closing graphics fade in, so nothing is covered. {adds}',
          slide: 'Your last frame is held while the white closing graphics slide in, so nothing is covered. {adds}',
        },
      },
      overPicture: {
        blue: {
          fade: 'The blue closing graphics fade in over your last second of video, covering it as they build. {adds}',
          slide: 'The blue closing graphics slide in over your last second of video, covering it as they build. {adds}',
        },
        white: {
          fade: 'The white closing graphics fade in over your last second of video, covering it as they build. {adds}',
          slide: 'The white closing graphics slide in over your last second of video, covering it as they build. {adds}',
        },
      },
    },
  },

  preset: {
    legend: 'File size / quality',
    /** The English names are the config's (`PRESETS[id].label`), so a diagnostics line and the screen agree; `tables.test.ts` holds them equal. */
    labels: { best: 'Larger / better', smaller: 'Smaller / reduced' },
    details: { best: 'For EchoVideo or YouTube etc.', smaller: 'For Moodle assignment uploads, messaging, or email etc.' },
  },

  create: {
    lockedStopping: 'Locked while the job stops.',
    showProgressHelp:
      'Untick to hide the changing bar, stage and time left. The video keeps being made.',
    showProgress: 'Show progress',
    note: 'The finished video is kept here until you save it or close this tab.',
    announceProgress: 'Announce progress',
    announceHelp:
      'Says each stage out loud for a screen reader as the video is made. The result is always announced.',
    progressLabel: 'Creating your video',
    create: 'Create the video',
    cancel: 'Cancel',
    continueAnyway: 'Continue anyway',
    stopCheck: 'Stop the check',
    checkAgain: 'Check again',
    stopSaving: 'Stop saving',
    save: 'Save the video',
    saved: 'Saved',
    discard: 'Discard it and start again',
    keep: 'Keep it',
    lockedMaking: 'Locked while your video is being made.',
    lockedSaving: 'Locked while your video is being saved.',
  },

  status: {
    saveFailedNext: 'It is still here to try again.',
    saveFailedWhat: 'The video could not be saved.',
    stoppingAfterFailure: 'The job is stopping. Please wait before trying again.',
    checking: 'Checking this video against your device…',
    checkStopped: 'Check stopped.',
    stoppingSave: 'Stopping the save…',
    cancelling: 'Cancelling…',
    cancelled: 'Cancelled. Nothing was saved, and your original file is unchanged.',
    saving: 'Saving…',
    saveStopped: 'Save stopped. The video is still here when you want it.',
    notSaved: 'Not saved. The video is still here when you want it.',
    refusedSource:
      'That is the file you started with. Choose a different name or folder — this tool never changes your original.',
    saved: 'Saved. Check it where you saved it, then upload it where it is going — or choose another video in step 1.',
    saveFailed: 'The video could not be saved. It is still here to try again.',
    storageWayOut: 'Keep less of the video, choose {smaller}, or free some space, then press Check again.',
    creating: 'Creating your video. {notice}',
    ready: 'Your video is ready.',
    couldNotCreate: 'The video could not be created. {sentence}',
    /** That the check has landed and the verdict's heading; the verdict's lines follow, spoken as one passage. */
    verdictSpoken: 'Device check complete. {heading}.',
  },

  discard: {
    title: 'This video is not saved yet',
    delivered:
      'Your download may still be finishing. Starting again will discard the video you just made.',
    unsaved: 'You have not saved the video you just made. Starting again will discard it.',
    spoken: 'This video is not saved yet. {question}',
  },

  result: {
    finished: 'Finished video — {size}',
    previous: 'Previous video — {size}',
    lifetime: 'It is kept here only until you save it or close this tab.',
    lifetimeDelivered: 'It stays here until you start another video or close this tab.',
    /** "the whole video (4 minutes, 12 seconds)". */
    keptWhole: 'the whole video ({duration})',
    /** "2 minutes of 4 minutes, 12 seconds, from 0:30.0 to 2:30.0". */
    keptPart: '{kept} of {duration}, from {from} to {to}',
    closingNone: 'no University closing graphics',
    /** "a cut to the blue closing card, marked “Internal use only”". */
    closingInternal: '{closing}, marked “{words}”',
    closingCut: { blue: 'a cut to the blue closing card', white: 'a cut to the white closing card' },
    closingOverFreeze: {
      blue: {
        fade: 'the blue closing graphics fading in over a held last frame',
        slide: 'the blue closing graphics sliding in over a held last frame',
      },
      white: {
        fade: 'the white closing graphics fading in over a held last frame',
        slide: 'the white closing graphics sliding in over a held last frame',
      },
    },
    closingOverPicture: {
      blue: { fade: 'the blue closing graphics fading in over the picture', slide: 'the blue closing graphics sliding in over the picture' },
      white: {
        fade: 'the white closing graphics fading in over the picture',
        slide: 'the white closing graphics sliding in over the picture',
      },
    },
    /** The one-line record: "Made from NAME: PART, OUTPUT, CLOSING." The name is the user's own. */
    summary: 'Made from {name}: {part}, {output}, {closing}.',
    /**
     * The same record with a title card (VH-127), naming which: the staff
     * card or a student submission's (VH-140). It never quotes the card's words.
     */
    summaryWithCard: {
      staff: 'Made from {name}: a {seconds}-second staff title card, then {part}, {output}, {closing}.',
      submission: 'Made from {name}: a {seconds}-second submission card, then {part}, {output}, {closing}.',
    },
    /**
     * Follows the record when the video's own words are in another language
     * than the page's (VH-140), naming it as the Video language choice does.
     */
    videoLanguage: 'Video language: {language}.',
    notLoaded:
      'The closing graphics could not be loaded, so they are not in this video. Everything else was applied as asked.',
    /**
     * Beside the record when the file stopped before its index said (VH-139).
     * {stops}, {picture}, {sound} and {end} are times, like "0:20".
     */
    endedEarly: {
      picture: 'The file you chose ends early: its picture stops at {stops} of {end}.',
      sound: 'The file you chose ends early: its sound stops at {stops} of {end}.',
      /** Both stop within the same second. */
      together: 'The file you chose ends early: its picture and sound stop at {stops} of {end}.',
      both: 'The file you chose ends early: its picture stops at {picture} and its sound at {sound}, of {end}.',
      /** Follows when the picture stopped and a closing follows it. */
      held: 'From there until the closing graphics, the video holds its last picture.',
      next: 'If you have a complete copy, create the video again from that one.',
    },
    fellBackToCut: {
      blue: {
        fade: 'You chose Fade, but the animation could not be loaded, so this video cuts to the blue closing card instead.',
        slide:
          'You chose Slide, but the animation could not be loaded, so this video cuts to the blue closing card instead.',
      },
      white: {
        fade: 'You chose Fade, but the animation could not be loaded, so this video cuts to the white closing card instead.',
        slide:
          'You chose Slide, but the animation could not be loaded, so this video cuts to the white closing card instead.',
      },
    },
    fellBackToFreeze: {
      blue: {
        fade: 'Your video is shorter than the fade animation. The blue closing graphics fade in over a held last frame instead of over the picture.',
        slide:
          'Your video is shorter than the slide animation. The blue closing graphics slide in over a held last frame instead of over the picture.',
      },
      white: {
        fade: 'Your video is shorter than the fade animation. The white closing graphics fade in over a held last frame instead of over the picture.',
        slide:
          'Your video is shorter than the slide animation. The white closing graphics slide in over a held last frame instead of over the picture.',
      },
    },
    fellBackToPicture: {
      blue: {
        fade: 'The blue closing graphics fade in over the picture, not over a held last frame as chosen.',
        slide: 'The blue closing graphics slide in over the picture, not over a held last frame as chosen.',
      },
      white: {
        fade: 'The white closing graphics fade in over the picture, not over a held last frame as chosen.',
        slide: 'The white closing graphics slide in over the picture, not over a held last frame as chosen.',
      },
    },
  },

  progress: {
    stages: {
      preparing: 'Getting ready',
      analysing: 'Analysing audio',
      encoding: 'Encoding video',
      finishing: 'Finishing the file',
      checking: 'Checking the file',
    },
    /** One per milestone fraction in `config/thresholds.ts`, in its order. */
    milestones: ['a quarter done', 'half done', 'three quarters done'],
    stagePercent: '{stage} — {percent}',
    stageMilestone: '{stage} — {milestone}',
    /** The encode's time left, under the stage line once the job's own rate is known (VH-136). */
    timeLeft: 'About {time} left',
    fewSecondsLeft: 'A few seconds left',
    /** Said, not shown: a milestone, then the time left. */
    withTimeLeft: '{progress}. {left}',
    /**
     * Under the bar: the video being made, as it was started (VH-140), since
     * the switches above may say otherwise by now.
     */
    job: 'This video: {kind}. Video language: {language}.',
    ready: 'Ready',
    title: {
      stage: '{stage} — {app}',
      ready: 'Ready — {app}',
      failed: 'Not made — {app}',
      cancelled: 'Cancelled — {app}',
    },
    /** Spec 7.5, said once at the start of every job. */
    jobNotice:
      'Keep this tab visible and your computer awake while the video is made. Closing the tab ends the job.',
  },

  preflight: {
    headings: {
      proceed: 'Ready to go',
      warn: 'Ready, with one thing to know',
      /** Counted in words up to six. */
      warnSeveral: {
        '2': 'Ready, with two things to know',
        '3': 'Ready, with three things to know',
        '4': 'Ready, with four things to know',
        '5': 'Ready, with five things to know',
        '6': 'Ready, with six things to know',
        other: 'Ready, with {count} things to know',
      },
      discourage: 'This will work, but it will be slow',
      mobile: 'This may not finish on a phone or tablet',
      block: 'This cannot run here',
    },
    tryChrome: 'Chrome on a computer is the browser this tool is built for — try it there.',
    chromeLacks:
      'This copy of Chrome may be out of date, or a setting on this computer may have turned the feature off. Update Chrome, or ask whoever manages the computer.',
    reasons: {
      noWebCodecs: 'This browser cannot process video. {remedy}',
      noAacEncodeHere: 'This browser cannot add sound to a video file. {remedy}',
      noAacEncodeElsewhere:
        'This browser cannot add sound to a video file. {remedy} Firefox can play video but cannot create the sound this needs.',
      noH264Encode: 'This browser cannot create the video format this tool needs. {remedy}',
      noSourceDecodeHere:
        'This browser cannot read the picture or sound inside this file. It was probably saved in a format made for editing software. Export it again as an MP4 — a file whose name ends .mp4 — and choose that file instead.',
      noSourceDecodeElsewhere:
        'This browser cannot read the picture or sound inside this file. {remedy} If it will not open there either, the file was probably saved in a format made for editing software. Export it again as an MP4 — a file whose name ends .mp4.',
      noOpfsHere:
        'This browser will not give the tool the working space it needs to build your video. If you are browsing privately, an ordinary window usually works; otherwise a setting on this computer may be blocking site storage — ask whoever manages it.',
      noOpfsElsewhere:
        'This browser will not give the tool the working space it needs to build your video. {remedy} If you are browsing privately, an ordinary window usually works.',
      insecureContext:
        'This page needs a secure connection before it can work with your video. Open it at an https:// address, or at localhost if you are running it yourself.',
      insufficientStorageResolvable:
        'There is not enough free space on this device. This job needs about {size} of working space. Free some space and try again, keep less of the video, or choose {smaller}.',
      insufficientStorage:
        'There is not enough free space on this device. This job needs about {size} of working space. Free some space and try again.',
      storageUnknown:
        'This browser will not say how much free space there is. If it runs out part-way, the job stops and nothing is saved — your original file is not affected.',
      veryLongJob:
        'This will take about {time}. You can carry on, but a desktop computer would be considerably faster.',
      veryLongJobUnknown:
        'This will take about a long time. You can carry on, but a desktop computer would be considerably faster.',
      longJob: 'This will take about {time}. Keep this tab open while it runs — closing it stops the job.',
      longJobUnknown: 'This will take about a while. Keep this tab open while it runs — closing it stops the job.',
      mobileDevice:
        'Phones and tablets are much slower at this than a computer, and the browser there may end the job part-way to free memory. Use a computer if you can.',
      estimateUnavailable:
        'We could not work out how long this will take on this device. You can still continue.',
    },
    shouldTake: 'This should take about {time}.',
    shouldTakeFewSeconds: 'This should take a few seconds.',
    sizeUpTo: 'Estimated size up to {size}.',
    sameSize:
      'Your video is already compressed as far as this setting would take it, so the new file will be about the same size.',
    slides:
      'This looks like slides or a screen recording, so the file is made smaller still. If it is mostly camera footage, choose {best} instead.',
  },

  warnings: {
    soundHeading: 'Worth knowing about the sound',
    finishedHeading: 'Worth knowing about the finished video',
    reassurance: 'None of these stop you continuing. Your original file is not changed either way.',
    /** The spoken form: the heading, then each warning's title, joined by `meta.separators.series`. */
    spoken: '{heading}: {titles}.',
    /** Said when the file's sound stops before its index says it should (VH-139). {stops} and {end} are times, like "0:20". */
    endsEarly: {
      heading: 'The file ends early',
      detail:
        'Its sound stops at {stops} of {end}. The file was probably cut off while it was copied or recorded. After {stops}, the new video will be silent. If you have a complete copy, choose that one instead.',
    },
    noAudio: {
      heading: 'This video has no sound',
      detail:
        'There is no sound to level, so the rest of the job runs without it. If you expected sound, check the recording before publishing.',
    },
    /** Said when a damaged moment in the file's sound is made silent (VH-122). {times} is a list of times, like "1:22 and 3:05". */
    decodeDamage: {
      heading: {
        one: 'A damaged moment has been silenced',
        other: 'Damaged moments have been silenced',
      },
      detail: {
        one: 'At {times}, the file holds a burst of noise louder than any recording can be. It comes from damage to the file, not from your recording. That fraction of a second will be silent instead, so no one hears it and the levelling still works as it should.',
        other:
          'At {times}, the file holds bursts of noise louder than any recording can be. They come from damage to the file, not from your recording. Each fraction of a second will be silent instead, so no one hears them and the levelling still works as it should.',
      },
      /** Ends the list of times when there are more than the warning lists. */
      more: { one: '{count} other moment', other: '{count} other moments' },
    },
    clipping: {
      heading: 'The sound may be distorted in places',
      detail:
        'The recording often reaches its maximum level, so some of it may be clipped. That usually means the microphone was set too high. Levelling still runs, but distortion already in the recording cannot be removed.',
    },
    veryQuiet: {
      heading: 'This recording is very quiet',
      detail:
        'It is well below a comfortable listening level. Levelling will bring it up — but turning up quiet speech turns up whatever else was in the room too.',
    },
    highlyVariable: {
      heading: 'The volume varies a lot',
      detail:
        'The loudest and quietest parts are far apart. Levelling corrects slow drifts gradually, too slowly to hear, but sudden differences between sentences will remain.',
    },
    noisy: {
      heading: 'There may be background noise',
      detail:
        'Even the quietest moments carry some sound — a fan, air conditioning, or a noisy room. This tool does not remove noise, and making the speech louder will make the background louder with it.',
    },
    extendedSilence: {
      heading: 'There is a long silent stretch',
      detail:
        'About {duration} of near-silence in one continuous run. If that is deliberate, nothing is wrong. If not, it is worth checking the recording before you publish it.',
    },
    targetMissed: {
      heading: 'The finished sound is not quite at the usual level',
      detail:
        'The video is fine to use; it may just sound slightly quieter or louder than other videos levelled with this tool.',
    },
    metadataLost: {
      heading: 'The file’s title and date could not be copied across',
      detail:
        'The picture and sound are unaffected. If your original carried a title, author or date, the new file will not have them — you can still add them wherever you upload it.',
    },
  },

  announce: {
    /** Counted in words, as the verdict heading is. */
    lossesCount: {
      '1': 'One thing to know about what goes into the new file.',
      '2': 'Two things to know about what goes into the new file.',
      '3': 'Three things to know about what goes into the new file.',
      '4': 'Four things to know about what goes into the new file.',
      other: '{count} things to know about what goes into the new file.',
    },
    lossSaid: '{title}. {detail}',
  },

  failure: {
    /** Said once in every failure, between what happened and what to do. */
    originalUnchanged: 'Your original file has not been changed.',
    unreadable: {
      what: 'This file could not be read as a video.',
      notAVideo:
        'This file could not be read as a video. It needs to be a video file — one whose name ends .mp4, .mov, .mkv or .webm — and it may be damaged.',
      soundOnly:
        'This file has sound but no video. This tool adds branding to a video, so it needs a file with a picture.',
      noTracks:
        'No video or sound was found in this file. It may be incomplete, or it may have been saved incorrectly.',
      readError:
        'Something went wrong reading this file. It may be damaged, or in a format this tool cannot read.',
      tookTooLong: 'Reading this file took longer than expected, or the tool ran into a problem.',
      next: 'Choose a different file, or save this one again from the app that made it, as a file whose name ends .mp4.',
    },
    badTrim: {
      what: 'The start and end times could not be used.',
      next: 'Put the start and end times right in step 2 and try again.',
    },
    unlevellable: {
      what: 'The sound of this recording cannot be brought to the usual level, so the video was not made.',
      next: 'Report it with the Send feedback button — the details it adds will help.',
    },
    outputLoudness: {
      what: 'The finished sound did not come out at the usual level, so the video was not kept.',
    },
    outputPeak: {
      what: 'The finished sound came out louder at its peaks than allowed, so the video was not kept.',
    },
    outputUnreadable: { what: 'The finished video could not be read back, so it was not kept.' },
    outOfSpace: {
      what: 'This device ran out of working space part-way through.',
      next: 'Free some space, or choose {smaller}, and try again.',
    },
    encoderRefused: {
      what: 'This browser stopped encoding the video part-way through.',
      next: 'Try the other output under File size / quality. If it happens again, report it with the Send feedback button — the details it adds will help.',
    },
    checkFailed: {
      what: 'The device check did not finish.',
      next: 'Press Check again to run it once more. If it fails again, report it with the Send feedback button.',
    },
    timedOut: { what: 'The job stopped reporting progress, so it was stopped.' },
    titleCardRefused: {
      what: 'The title card’s words did not fit on the video, so it was not made.',
      next: 'Shorten the title card’s fields in step 3 and try again.',
    },
    unknown: { what: 'Something went wrong while creating the video.' },
    /** The next step for the failures whose remedy is to try again. */
    tryAgain:
      'Try again. If it happens again, report it with the Send feedback button — the details it adds will help.',
    startup: {
      insecure:
        'This page needs a secure connection before it can work with your video. Open it at an address that starts https://.',
      noWebCodecs: 'This browser cannot process video, so the tool cannot run here. {remedy}',
      noH264: 'This browser cannot create the video format this tool needs, so the tool cannot run here. {remedy}',
      noWorkingStore:
        'This browser gives the tool no working space to build a video in. If you are browsing privately, an ordinary window usually works. {remedy}',
      workerNotStarted:
        'The part of the tool that does the work did not start. Reload the page. If it happens again, report it with the Send feedback button.',
    },
    captured:
      'Something in the tool went wrong. A video being made may not finish; your original file is not affected. Report it with the Send feedback button, which adds these details.',
  },

  systemCheck: {
    summary: 'System check — {result}',
    results: {
      problems: { one: '{count} problem', other: '{count} problems' },
      warnings: { one: '{count} warning', other: '{count} warnings' },
      checking: 'checking',
      allPassed: 'all passed',
    },
    /** Word marks, because status must never be carried by colour alone. */
    marks: { pass: 'OK', fail: 'No', warn: '!', pending: '…' },
    rows: {
      secure: 'Secure connection (needed for storage access)',
      webcodecs: 'Video processing in the browser (WebCodecs)',
      h264: 'Video format the tool makes (H.264)',
      aac: 'Sound format the tool makes (AAC)',
      opfs: 'Private working storage',
      worker: 'Background processing',
    },
    values: {
      checking: 'Checking',
      available: 'Available',
      notAvailable: 'Not available',
      supported: 'Supported',
      notSupported: 'Not supported',
      aacNotSupported: 'Not supported — a video with sound cannot be made here',
      failedToStart: 'Failed to start',
      /** `{time}` is a number of milliseconds, written by `Intl`. */
      readyIn: 'Ready in {time}',
      noResponse: 'No response',
    },
  },

  errors: {
    revealed:
      'A problem was found. Use Report this problem in Errors captured to send the details.',
    heading: 'Errors captured',
    technicalDetails: 'Technical details',
    report: 'Report this problem',
  },

  feedback: {
    open: 'Send feedback',
    heading: 'Send feedback',
    intro: 'Your message goes to {address} from your own email app. You will see the email before it is sent.',
    messageLabel: 'Your message',
    writeFirst: 'Write a message first.',
    whatSent: 'What will be sent with it',
    whatSentDetail:
      "Details that help find a problem: the app's version, your browser, how far you got, and your video's length, picture size and format. These details never include the video, its name, or anything in it.",
    openEmail: 'Open email app',
    copy: 'Copy message and details',
    close: 'Close',
    tooLong:
      'Your message is too long to hand to your email app in one go. Choose "Copy message and details" and paste them into an email to {address}.',
    opened:
      'Your email app should have opened with your message ready to send. If it did not, choose "Copy message and details" and paste them into an email to {address}.',
    someOmitted: 'Some details did not fit in the email; the copy has them all.',
    copied: 'Copied. Paste it into an email to {address}.',
    couldNotCopy:
      'Could not copy. Open "What will be sent with it", select the details, and copy them with your message.',
    /** Over the details the email cannot carry, in the disclosure; the details themselves stay English. */
    onlyInCopy: 'Too long for the email, so only in "Copy message and details":',
  },

  /**
   * The accessibility statement in the footer (VH-130), after the GOV.UK
   * model statement, in this page's plain words. Self-certified by the owner
   * on 2026-10-18 and translated in full, not kept in English. Dates arrive
   * as placeholders, written by `Intl` from `config/accessibility.ts`; the
   * address and the advice service are links the page puts in their slots.
   */
  statement: {
    heading: 'Accessibility statement',
    covers:
      'This statement covers UoN Video Helper, the page you are on.',
    aim: 'We want as many people as possible to be able to use this tool. You should be able to:',
    /** Each completes "You should be able to:". */
    abilities: [
      'use it with a keyboard alone',
      'use it with a screen reader, which reads out each stage and result',
      'zoom in to 200% without the text going off the screen',
      "use your own colours, and your computer's high contrast mode",
      "turn off movement on the page in your computer's settings",
    ],
    plain: 'The words are plain, and the text has strong contrast with its background.',
    limits: {
      heading: 'How accessible this tool is',
      intro: 'We know some parts are not fully accessible:',
      /** The recorded limitations: Chrome only, the machine translations, the Chinese font, the preview (spec 9.3), the kept short forms. */
      items: [
        'It is built for Google Chrome on a computer. In other browsers, it may not work.',
        'The Chinese and Malay pages were translated by a computer. Colleagues who speak each language are checking them on the live page.',
        "Chinese text uses your computer's own Chinese font, so it may look different from one computer to another.",
        'The preview plays your own video. Its captions, and whether it flashes, depend on your recording.',
        'Some short forms are not spelled out: file sizes, such as MB and GB, and video format names, such as H.264 and AAC.',
      ],
    },
    contact: {
      heading: 'Feedback and contact',
      /** `{address}` is a link that opens an email to it. */
      text: 'If you find a problem with this tool, or need its information in another way, email Joe Bell at {address}.',
    },
    enforcement: {
      heading: 'Enforcement procedure',
      /** `{service}` is `service` below, as a link to its website. */
      text: 'The Equality and Human Rights Commission enforces the accessibility regulations. If you are not happy with how we answer your complaint, you can get in touch with the {service}.',
      service: 'Equality Advisory and Support Service (new tab)',
    },
    compliance: {
      heading: 'Compliance status',
      text: 'This tool is partially compliant with version 2.2 of the Web Content Accessibility Guidelines (WCAG), at level AA, the middle of their three levels. Only automated checks have been run so far, so we cannot yet say it fully meets them. We aim for level AAA, the highest.',
    },
    testing: {
      heading: 'How we tested this tool',
      wave: 'On {date}, we checked this page with WAVE, a web accessibility evaluation tool from WebAIM. It gave the page a score of 10 out of 10.',
      automated:
        'Each time the code changes, automated tests check the contrast of the text against its background, and the reading level of the words.',
      manual:
        'We have also checked it by hand in Chrome, at computer and phone widths, while building it.',
    },
    plans: {
      heading: 'What we plan to test next',
      intro: 'We have not yet chosen the next tests. We are thinking of:',
      /** Each completes "We are thinking of:". The owner chooses among them. */
      items: [
        'using the tool with a keyboard alone',
        'using it with the NVDA screen reader in Chrome on Windows, and with VoiceOver on a Mac',
        'zooming in to 400%, and a screen 320 pixels wide',
        'Windows contrast themes',
        'a second automated tool, such as axe or Lighthouse',
        'a session with disabled staff who use the tool',
      ],
    },
    about: {
      heading: 'About this statement',
      dates:
        'This statement was written on {date}. Joe Bell reviewed it. We will review it again by {reviewDate}.',
    },
  },

  /**
   * The two help routes at the foot of the page (VH-148): the Creators team
   * on Teams in a new tab, and the learning content team by email, both
   * from `config/feedback.ts`. Each link's words say where it goes
   * on their own (WCAG 2.4.9), so neither leans on the line above.
   */
  footer: {
    contact: {
      intro: 'For help with this tool:',
      creators: 'Creators team on Teams (opens in a new tab)',
      learningContent: 'Email the learning content team',
    },
  },

  save: {
    pickerDescription: 'MP4 video (.mp4)',
    /** The stem when the source's name has none. */
    stem: 'video',
    marks: { branded: 'branded', levelled: 'levelled', converted: 'converted' },
    /** The suggested name: the user's own stem, the mark, and `.mp4`. */
    fileName: '{stem} ({mark}).mp4',
    downloadIos: 'Saving to the Files app, under Downloads',
    downloadOther: 'Saving to your downloads folder',
    download:
      '{where} — the browser may still be finishing it. Once it is there, upload it where it is going, or choose another video in step 1.',
  },

  format: {
    unknown: 'unknown',
    lessThanASecond: 'less than a second',
    fewSeconds: 'a few seconds',
    frameRate: '{rate} frames a second',
    /** Width and height arrive as plain digits, never grouped. */
    resolution: '{width} × {height}',
    channels: {
      mono: 'Mono (one channel)',
      stereo: 'Stereo (two channels)',
      surround51: '5.1 surround',
      surround71: '7.1 surround',
      several: '{count} channels',
    },
  },
} as const
