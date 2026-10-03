/**
 * Every string the page can show, in English (VH-105): labels, stage names,
 * the live-region announcements, warnings, errors, the browser block, the
 * tab title, the suggested file name. The other tables are typed against
 * this one, so a key English has and another lacks is a type error, and
 * `completeness.test.ts` fails on it at runtime too.
 *
 * Whole messages with named, typed parameters: never a sentence built from
 * a colour noun, a verb and a suffix, because the other two languages order
 * their words differently. Numbers arrive as numbers and are written by this
 * language's own `Intl` formatters, below.
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

import { PRESETS } from '../config/presets'
import { listFormatter, numberFormatter, pluralise, unitFormatter } from './intl'

const LOCALE = 'en-GB'
const nf = numberFormatter(LOCALE)
const nfRate = numberFormatter(LOCALE, { maximumFractionDigits: 2 })
const nfPlain = numberFormatter(LOCALE, { useGrouping: false })
const milliseconds = unitFormatter(LOCALE, 'millisecond')
const bytes = unitFormatter(LOCALE, 'byte', { unitDisplay: 'long', maximumFractionDigits: 0 })
const and = listFormatter(LOCALE)
const plural = (count: number, one: string, other: string): string =>
  pluralise(LOCALE, count, { one, other })

/** Said once in every failure, between what happened and what to do. */
const ORIGINAL_UNCHANGED = 'Your original file has not been changed.'
const REPORT_IT = 'If it happens again, report it with the Send feedback button — the details it adds will help.'
const DEVICE_CHECK_COMPLETE = 'Device check complete.'

export const enGB = {
  /** The locale `Intl` formats this table's numbers in. */
  locale: LOCALE,
  /** How `Intl.DurationFormat` writes a duration in this language. */
  durationStyle: { style: 'long' } as Record<string, unknown>,

  app: {
    title: 'UoN Video Helper',
    description:
      'Add approved University of Nottingham branding and consistent audio levels to a video, and get an optimised file back, without uploading it anywhere.',
    skipLink: 'Skip to main content',
  },

  language: {
    /** The switcher's accessible name. */
    label: 'Page language',
    /** Said once, in the new language, when the page changes language. */
    switched: ({ name }: { name: string }) => `Page language: ${name}.`,
  },

  lede: {
    intro: 'This tool does the following to your video:',
    promises: [
      'Adds approved branding.',
      'Ensures consistent audio levels.',
      'Outputs an optimised file type and size.',
    ] as readonly string[],
    privacy:
      'Your video is processed on your device, it is never uploaded, and the original file does not change.',
  },

  browserNote: {
    pending: 'This app is designed and built for Chrome, other browsers may not work.',
    notPassed:
      'This app is designed and built for Chrome, and this browser has not passed all of its checks. The system check at the foot of the page says what is missing.',
    passed: 'This app is designed and built for Chrome, and this browser has passed the checks for it.',
  },

  steps: {
    choose: 'Choose a video',
    trim: 'Trim',
    closing: 'Closing branding',
    preset: 'File size / quality',
    create: 'Create',
  },

  choose: {
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
      several: ({ count }: { count: number }) => `That was ${nf(count)} files. Drop one video at a time.`,
      notVideo:
        'That is not a video file. Drop a video — a file whose name ends .mp4 or .mov, say — or choose one above.',
    },
  },

  source: {
    /** "Video read." then the facts, as a comma list. */
    readSummary: ({ parts }: { parts: readonly string[] }) => `Video read. ${parts.join(', ')}.`,
    variableFrameRate: 'variable frame rate',
    noSound: 'no sound',
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
    rotated: ({ degrees }: { degrees: number }) => `Rotated ${nf(degrees)}°. The output will be upright.`,
    variesOnAverage: ({ rate }: { rate: string }) => `${rate} on average, but it varies`,
    variesNote:
      'Recordings from Teams, Zoom and screen capture often vary. The output will use a steady frame rate, which keeps sound and picture in step.',
    outputRate: ({ rate }: { rate: string }) =>
      `The output will run at ${rate}, so some frames will be repeated.`,
    /** The figure, with its meaning beside it (spec 9.2). */
    sampleRate: ({ kilohertz, hertz }: { kilohertz: number; hertz: number }) =>
      `${nf(kilohertz)} kHz — ${nf(hertz)} samples a second`,
    noSoundTrack: 'No sound track found',
    noSoundNote: 'Levelling needs sound. The rest of the job still runs.',
    captionsUnchecked: 'Could not be checked in this kind of file',
    captionsFound: ({ found }: { found: readonly string[] }) => `Found ${and(found)}`,
    captionsNone: 'None found in this file',
    captionTracks: ({ count }: { count: number }) =>
      plural(count, `${nf(count)} caption track`, `${nf(count)} caption tracks`),
    chapterTracks: ({ count }: { count: number }) =>
      plural(count, `${nf(count)} chapter track`, `${nf(count)} chapter tracks`),
    moreVideoTracks: ({ count }: { count: number }) =>
      plural(count, `${nf(count)} more video track`, `${nf(count)} more video tracks`),
    moreSoundTracks: ({ count }: { count: number }) =>
      plural(count, `${nf(count)} more sound track`, `${nf(count)} more sound tracks`),
    losses: {
      extraTracksTitle: ({ found }: { found: readonly string[] }) => `This file has ${and(found)}`,
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
      'Optional. Cut unwanted material from the start or the end. Left alone, the whole video is kept. The preview plays your original as it is now: the sound is levelled and the closing added when the video is made.',
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
    tooShort: ({ seconds }: { seconds: number }) =>
      `It is shorter than ${nf(seconds)} seconds, so it cannot be trimmed.`,
    keepingWhole: ({ duration }: { duration: string }) => `Keeping the whole video, ${duration}.`,
    keeping: ({ kept, duration }: { kept: string; duration: string }) => `Keeping ${kept} of ${duration}.`,
    handleBeginning: 'the beginning',
    handleEnd: 'the end',
    problem: {
      notATime: ({ which }: { which: 'start' | 'end' }) =>
        `Write the ${which} time as minutes and seconds, like 1:05.5, or as seconds, like 65.5.`,
      afterEnd: ({ which, end }: { which: 'start' | 'end'; end: string }) =>
        `The ${which} time is after the end of the video, which is ${end} long.`,
      notTimes: 'The start or end of the video is not a time.',
      startAfterEnd: 'The start is after the end of the video.',
      endBeforeStart: 'The end must come after the start.',
      keepAtLeast: ({ seconds }: { seconds: number }) =>
        `Keep at least ${nf(seconds)} seconds of the video.`,
    },
    correctToContinue: 'Put the start and end times right in step 2 to continue.',
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
      '— the closing plays over the last second of your video. It covers that second as it builds.',
    helpFreezeTerm: 'Over generated freeze frame',
    helpFreezeText:
      '— your last frame is held for one extra second. The closing plays over that, so nothing in your video is covered.',
    colourLabel: 'Colour',
    colours: { blue: 'Blue', white: 'White' },
    notUsedWith: ({ type }: { type: string }) => `Not used with ${type}.`,
    result: {
      none: 'No University closing will be added.',
      adds: ({ seconds }: { seconds: number }) =>
        `Adds ${plural(seconds, `${nf(seconds)} second`, `${nf(seconds)} seconds`)}.`,
      cut: ({ colour, adds }: { colour: 'blue' | 'white'; adds: string }) =>
        `Your video cuts to the ${colour} closing card. ${adds}`,
      overFreeze: ({ colour, type, adds }: { colour: 'blue' | 'white'; type: 'fade' | 'slide'; adds: string }) =>
        `Your last frame is held while the ${colour} closing ${type === 'slide' ? 'slides' : 'fades'} in, so nothing is covered. ${adds}`,
      overPicture: ({ colour, type, adds }: { colour: 'blue' | 'white'; type: 'fade' | 'slide'; adds: string }) =>
        `The ${colour} closing ${type === 'slide' ? 'slides' : 'fades'} in over your last second of video, covering it as it builds. ${adds}`,
    },
  },

  preset: {
    legend: 'File size / quality',
    /** The names are the config's (`PRESETS[id].label`), so a diagnostics line and the screen agree. */
    labels: { best: PRESETS.best.label, smaller: PRESETS.smaller.label },
    details: { best: 'For EchoVideo or YouTube etc.', smaller: 'For messaging or email etc.' },
  },

  create: {
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
    storageWayOut: ({ smaller }: { smaller: string }) =>
      `Keep less of the video, choose ${smaller}, or free some space, then press Check again.`,
    creating: ({ notice }: { notice: string }) => `Creating your video. ${notice}`,
    ready: 'Your video is ready.',
    couldNotCreate: ({ sentence }: { sentence: string }) => `The video could not be created. ${sentence}`,
    /** That the check has landed, then the verdict itself, heading and all, as one spoken passage. */
    verdictSpoken: ({ heading, lines }: { heading: string; lines: readonly string[] }) =>
      [DEVICE_CHECK_COMPLETE, `${heading}.`, ...lines].join(' '),
  },

  discard: {
    title: 'This video is not saved yet',
    delivered:
      'Your download may still be finishing. Starting again will discard the video you just made.',
    unsaved: 'You have not saved the video you just made. Starting again will discard it.',
    spoken: ({ question }: { question: string }) => `This video is not saved yet. ${question}`,
  },

  result: {
    finished: ({ size }: { size: string }) => `Finished video — ${size}`,
    previous: ({ size }: { size: string }) => `Previous video — ${size}`,
    lifetime: 'It is kept here only until you save it or close this tab.',
    lifetimeDelivered: 'It stays here until you start another video or close this tab.',
    /** "the whole video (4 minutes, 12 seconds)". */
    keptWhole: ({ duration }: { duration: string }) => `the whole video (${duration})`,
    /** "2 minutes of 4 minutes, 12 seconds, from 0:30.0 to 2:30.0". */
    keptPart: ({ kept, duration, from, to }: { kept: string; duration: string; from: string; to: string }) =>
      `${kept} of ${duration}, from ${from} to ${to}`,
    closingNone: 'no University closing',
    closingCut: ({ colour }: { colour: 'blue' | 'white' }) => `a cut to the ${colour} closing card`,
    closingOverFreeze: ({ colour, type }: { colour: 'blue' | 'white'; type: 'fade' | 'slide' }) =>
      `the ${colour} closing ${type === 'slide' ? 'sliding' : 'fading'} in over a held last frame`,
    closingOverPicture: ({ colour, type }: { colour: 'blue' | 'white'; type: 'fade' | 'slide' }) =>
      `the ${colour} closing ${type === 'slide' ? 'sliding' : 'fading'} in over the picture`,
    /** The one-line record: "Made from NAME: PART, OUTPUT, CLOSING." The name is the user's own. */
    summary: ({ name, part, output, closing }: { name: string; part: string; output: string; closing: string }) =>
      `Made from ${name}: ${part}, ${output}, ${closing}.`,
    notLoaded:
      'The closing could not be loaded, so it is not in this video. Everything else was applied as asked.',
    fellBackToCut: ({ colour, type }: { colour: 'blue' | 'white'; type: 'fade' | 'slide' }) =>
      `You chose ${type === 'slide' ? 'Slide' : 'Fade'}, but the animation could not be loaded, so this video cuts to the ${colour} closing card instead.`,
    fellBackToFreeze: ({ colour, type }: { colour: 'blue' | 'white'; type: 'fade' | 'slide' }) =>
      `Your video is shorter than the ${type} animation, so the ${colour} closing ${type === 'slide' ? 'slides' : 'fades'} in over a held last frame rather than over the picture.`,
    fellBackToPicture: ({ colour, type }: { colour: 'blue' | 'white'; type: 'fade' | 'slide' }) =>
      `The ${colour} closing ${type === 'slide' ? 'slides' : 'fades'} in over the picture, not over a held last frame as chosen.`,
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
    milestones: ['a quarter done', 'half done', 'three quarters done'] as readonly string[],
    stagePercent: ({ stage, percent }: { stage: string; percent: string }) => `${stage} — ${percent}`,
    stageMilestone: ({ stage, milestone }: { stage: string; milestone: string }) => `${stage} — ${milestone}`,
    ready: 'Ready',
    title: {
      stage: ({ stage, app }: { stage: string; app: string }) => `${stage} — ${app}`,
      ready: ({ app }: { app: string }) => `Ready — ${app}`,
      failed: ({ app }: { app: string }) => `Not made — ${app}`,
      cancelled: ({ app }: { app: string }) => `Cancelled — ${app}`,
    },
    /** Spec 7.5, said once at the start of every job. */
    jobNotice:
      'Keep this tab visible and your computer awake while the video is made. Closing the tab ends the job.',
  },

  preflight: {
    headings: {
      proceed: 'Ready to go',
      warn: 'Ready, with one thing to know',
      warnSeveral: ({ count }: { count: number }) =>
        `Ready, with ${['two', 'three', 'four', 'five', 'six'][count - 2] ?? nf(count)} things to know`,
      discourage: 'This will work, but it will be slow',
      mobile: 'This may not finish on a phone or tablet',
      block: 'This cannot run here',
    },
    tryChrome: 'Chrome on a computer is the browser this tool is built for — try it there.',
    chromeLacks:
      'This copy of Chrome may be out of date, or a setting on this computer may have turned the feature off. Update Chrome, or ask whoever manages the computer.',
    reasons: {
      noWebCodecs: ({ remedy }: { remedy: string }) => `This browser cannot process video. ${remedy}`,
      noAacEncodeHere: ({ remedy }: { remedy: string }) =>
        `This browser cannot add sound to a video file. ${remedy}`,
      noAacEncodeElsewhere: ({ remedy }: { remedy: string }) =>
        `This browser cannot add sound to a video file. ${remedy} Firefox can play video but cannot create the sound this needs.`,
      noH264Encode: ({ remedy }: { remedy: string }) =>
        `This browser cannot create the video format this tool needs. ${remedy}`,
      noSourceDecodeHere:
        'This browser cannot read the picture or sound inside this file. It was probably saved in a format made for editing software. Export it again as an MP4 — a file whose name ends .mp4 — and choose that file instead.',
      noSourceDecodeElsewhere: ({ remedy }: { remedy: string }) =>
        `This browser cannot read the picture or sound inside this file. ${remedy} If it will not open there either, the file was probably saved in a format made for editing software. Export it again as an MP4 — a file whose name ends .mp4.`,
      noOpfsHere:
        'This browser will not give the tool the working space it needs to build your video. If you are browsing privately, an ordinary window usually works; otherwise a setting on this computer may be blocking site storage — ask whoever manages it.',
      noOpfsElsewhere: ({ remedy }: { remedy: string }) =>
        `This browser will not give the tool the working space it needs to build your video. ${remedy} If you are browsing privately, an ordinary window usually works.`,
      insecureContext:
        'This page needs a secure connection before it can work with your video. Open it at an https:// address, or at localhost if you are running it yourself.',
      insufficientStorageResolvable: ({ size, smaller }: { size: string; smaller: string }) =>
        `There is not enough free space on this device. This job needs about ${size} of working space. Free some space and try again, keep less of the video, or choose ${smaller}.`,
      insufficientStorage: ({ size }: { size: string }) =>
        `There is not enough free space on this device. This job needs about ${size} of working space. Free some space and try again.`,
      storageUnknown:
        'This browser will not say how much free space there is. If it runs out part-way, the job stops and nothing is saved — your original file is not affected.',
      veryLongJob: ({ time }: { time: string }) =>
        `This will take about ${time}. You can carry on, but a desktop computer would be considerably faster.`,
      veryLongJobUnknown:
        'This will take about a long time. You can carry on, but a desktop computer would be considerably faster.',
      longJob: ({ time }: { time: string }) =>
        `This will take about ${time}. Keep this tab open while it runs — closing it stops the job.`,
      longJobUnknown: 'This will take about a while. Keep this tab open while it runs — closing it stops the job.',
      mobileDevice:
        'Phones and tablets are much slower at this than a computer, and the browser there may end the job part-way to free memory. Use a computer if you can.',
      estimateUnavailable:
        'We could not work out how long this will take on this device. You can still continue.',
    },
    shouldTake: ({ time }: { time: string }) => `This should take about ${time}.`,
    shouldTakeFewSeconds: 'This should take a few seconds.',
    sizeUpTo: ({ size }: { size: string }) => `Estimated size up to ${size}.`,
    sameSize:
      'Your video is already compressed as far as this setting would take it, so the new file will be about the same size.',
    slides: ({ best }: { best: string }) =>
      `This looks like slides or a screen recording, so the file is made smaller still. If it is mostly camera footage, choose ${best} instead.`,
  },

  warnings: {
    soundHeading: 'Worth knowing about the sound',
    finishedHeading: 'Worth knowing about the finished video',
    reassurance: 'None of these stop you continuing. Your original file is not changed either way.',
    /** The spoken form: the heading, then each warning's title. */
    spoken: ({ heading, titles }: { heading: string; titles: readonly string[] }) =>
      `${heading}: ${titles.join('; ')}.`,
    noAudio: {
      heading: 'This video has no sound',
      detail:
        'There is no sound to level, so the rest of the job runs without it. If you expected sound, check the recording before publishing.',
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
      detail: ({ duration }: { duration: string }) =>
        `About ${duration} of near-silence in one continuous run. If that is deliberate, nothing is wrong. If not, it is worth checking the recording before you publish it.`,
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
    /** "One thing" / "Two things": counted in words, as the verdict heading is. */
    lossesCount: ({ count }: { count: number }) =>
      `${['One thing', 'Two things', 'Three things', 'Four things'][count - 1] ?? `${nf(count)} things`} to know about what goes into the new file.`,
    lossSaid: ({ title, detail }: { title: string; detail: string }) => `${title}. ${detail}`,
  },

  failure: {
    originalUnchanged: ORIGINAL_UNCHANGED,
    /** What happened, the reassurance, what next: one paragraph. */
    sentence: ({ what, next }: { what: string; next: string }) => `${what} ${ORIGINAL_UNCHANGED} ${next}`,
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
      next: ({ smaller }: { smaller: string }) => `Free some space, or choose ${smaller}, and try again.`,
    },
    encoderRefused: {
      what: 'This browser stopped encoding the video part-way through.',
      next: `Try the other output under File size / quality. ${REPORT_IT}`,
    },
    checkFailed: {
      what: 'The device check did not finish.',
      next: 'Press Check again to run it once more. If it fails again, report it with the Send feedback button.',
    },
    timedOut: { what: 'The job stopped reporting progress, so it was stopped.' },
    unknown: { what: 'Something went wrong while creating the video.' },
    /** "Try again." then the report advice, for the failures whose next step is to try again. */
    tryAgain: `Try again. ${REPORT_IT}`,
    startup: {
      insecure:
        'This page needs a secure connection before it can work with your video. Open it at an address that starts https://.',
      noWebCodecs: ({ remedy }: { remedy: string }) =>
        `This browser cannot process video, so the tool cannot run here. ${remedy}`,
      noH264: ({ remedy }: { remedy: string }) =>
        `This browser cannot create the video format this tool needs, so the tool cannot run here. ${remedy}`,
      noWorkingStore: ({ remedy }: { remedy: string }) =>
        `This browser gives the tool no working space to build a video in. If you are browsing privately, an ordinary window usually works. ${remedy}`,
      workerNotStarted:
        'The part of the tool that does the work did not start. Reload the page. If it happens again, report it with the Send feedback button.',
    },
    captured:
      'Something in the tool went wrong. A video being made may not finish; your original file is not affected. Report it with the Send feedback button, which adds these details.',
  },

  systemCheck: {
    summary: ({ result }: { result: string }) => `System check — ${result}`,
    results: {
      problems: ({ count }: { count: number }) =>
        plural(count, `${nf(count)} problem`, `${nf(count)} problems`),
      warnings: ({ count }: { count: number }) =>
        plural(count, `${nf(count)} warning`, `${nf(count)} warnings`),
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
      readyIn: ({ ms }: { ms: number }) => `Ready in ${milliseconds(ms)}`,
      noResponse: 'No response',
    },
  },

  errors: {
    heading: 'Errors captured',
    technicalDetails: 'Technical details',
    report: 'Report this problem',
  },

  feedback: {
    open: 'Send feedback',
    heading: 'Send feedback',
    intro: ({ address }: { address: string }) =>
      `Your message goes to ${address} from your own email app. You will see the email before it is sent.`,
    messageLabel: 'Your message',
    writeFirst: 'Write a message first.',
    whatSent: 'What will be sent with it',
    whatSentDetail:
      "Details that help find a problem: the app's version, your browser, how far you got, and your video's length, picture size and format. These details never include the video, its name, or anything in it.",
    openEmail: 'Open email app',
    copy: 'Copy message and details',
    close: 'Close',
    tooLong: ({ address }: { address: string }) =>
      `Your message is too long to hand to your email app in one go. Choose "Copy message and details" and paste them into an email to ${address}.`,
    opened: ({ address }: { address: string }) =>
      `Your email app should have opened with your message ready to send. If it did not, choose "Copy message and details" and paste them into an email to ${address}.`,
    someOmitted: 'Some details did not fit in the email; the copy has them all.',
    copied: ({ address }: { address: string }) => `Copied. Paste it into an email to ${address}.`,
    couldNotCopy:
      'Could not copy. Open "What will be sent with it", select the details, and copy them with your message.',
    /** Over the details the email cannot carry, in the disclosure; the details themselves stay English. */
    onlyInCopy: 'Too long for the email, so only in "Copy message and details":',
  },

  save: {
    pickerDescription: 'MP4 video (.mp4)',
    /** The stem when the source's name has none. */
    stem: 'video',
    marks: { branded: 'branded', levelled: 'levelled', converted: 'converted' },
    /** The suggested name: the user's own stem, the mark, and `.mp4`. */
    fileName: ({ stem, mark }: { stem: string; mark: string }) => `${stem} (${mark}).mp4`,
    downloadIos: 'Saving to the Files app, under Downloads',
    downloadOther: 'Saving to your downloads folder',
    download: ({ where }: { where: string }) =>
      `${where} — the browser may still be finishing it. Once it is there, upload it where it is going, or choose another video in step 1. The video stays here until you start another one.`,
  },

  format: {
    unknown: 'unknown',
    lessThanASecond: 'less than a second',
    fewSeconds: 'a few seconds',
    frameRate: ({ rate }: { rate: number }) => `${nfRate(rate)} frames a second`,
    resolution: ({ width, height }: { width: number; height: number }) =>
      `${nfPlain(width)} × ${nfPlain(height)}`,
    channels: {
      mono: 'Mono (one channel)',
      stereo: 'Stereo (two channels)',
      surround51: '5.1 surround',
      surround71: '7.1 surround',
      other: ({ count }: { count: number }) => `${nf(count)} channels`,
    },
    bytes: ({ count }: { count: number }) => bytes(count),
  },
}

/** The shape every table must have: English's keys, with its parameter signatures. */
export type Messages = typeof enGB
