/**
 * The translator's sheet (VH-105): one row per message in the English table,
 * keyed by its dotted path, with where it shows on the page, notes that keep
 * a translation's placeholders and variants straight, and an empty column
 * per language. `scripts/strings-sheet.mjs` writes it as .csv and .xlsx; a
 * filled sheet comes back through {@link parseCsv} and becomes a table.
 *
 * Dev tooling only — nothing in the app imports this — and pure, so the rows
 * and the CSV round trip are tested in Node.
 */

import type { LanguageTag } from '../config/languages'
import { isCountGroup, placeholdersOf } from './compile'
import { enGB } from './en-GB'
import type { Messages } from './index'

/** One message: its key and its English. */
export interface Message {
  readonly key: string
  readonly english: string
}

/** Every message in a table, in the table's order, `meta` left out: it is set per table, never translated. */
export function messagesOf(table: object, prefix = ''): Message[] {
  const messages: Message[] = []
  for (const [key, value] of Object.entries(table)) {
    if (prefix === '' && key === 'meta') continue
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') messages.push({ key: path, english: value })
    else if (value !== null && typeof value === 'object')
      messages.push(...messagesOf(value as object, path))
  }
  return messages
}

/** The node at a dotted path, or `undefined`. */
function nodeAt(table: object, path: readonly string[]): unknown {
  let node: unknown = table
  for (const part of path) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return node
}

/** Where each group of messages shows; the longest matching prefix wins. */
const WHERE: ReadonlyArray<readonly [string, string]> = [
  ['app.title', 'The page heading, and the title in the browser tab'],
  [
    'app.description',
    'Not shown on the page: its description for search engines and link previews',
  ],
  ['app.skipLink', 'A link at the very top, seen when moving through the page with the Tab key'],
  ['language.label', 'The label over the language switcher at the top of the page'],
  ['language.switched', 'Not shown: read out by screen readers when the language changes'],
  [
    'language.machine',
    'Under the language switcher, only when the page is in Chinese or Malay: the note that a computer translated it',
  ],
  ['lede', 'Under the page heading: what the tool does'],
  [
    'lede.formatHelp',
    'Under the page heading: the "?" beside "Saves in a reliable format." and the text it shows when pressed',
  ],
  ['browserNote', 'Under the page heading: the note about the browser'],
  ['videoKind', 'Above Step 1: the switch between a staff video and a student submission'],
  [
    'videoKind.result',
    'Above Step 1: the line under the switch, saying what the choice means for the closing',
  ],
  [
    'videoKind.nextVideo',
    'Above Step 1: under the video type, only while a video is being made or a finished one is on screen',
  ],
  [
    'videoLanguage',
    'Step 3, at the top, before the title card: the choice of language for the words drawn into the video',
  ],
  [
    'videoLanguage.typed',
    'Step 3, at the top: under the video language choice, on the line after videoLanguage.helper',
  ],
  ['steps', 'The heading of each of the six steps'],
  ['choose', 'Step 1, Choose a video'],
  ['choose.drop', 'Step 1: the message when something is dropped on the drop area'],
  ['source', 'Step 1: what the video is, once it has been read'],
  ['source.rows', 'Step 1: Video properties, the name of each row'],
  ['source.losses', 'Step 1: the box listing what will not be carried into the new file'],
  ['trim', 'Step 2, Trim'],
  ['trim.problem', 'Step 2: the error beside a start or end time that cannot be used'],
  ['titleCard', 'Step 3, Title card: the checkbox and the four fields for the card shown before the video'],
  ['titleCard.dateHelperNext', 'Step 3: under the Date field, on the line after titleCard.dateHelper'],
  [
    'titleCard.fieldsRuleNext',
    'Step 3: under the Add a title card checkbox, for a staff video, after titleCard.fieldsRule',
  ],
  [
    'titleCard.submission.idsHelperNext',
    'Step 3: under the student ID numbers field, on the line after titleCard.submission.idsHelper',
  ],
  ['titleCard.forSubmission', 'Step 3: beside the Add a title card checkbox, when it is locked'],
  [
    'titleCard.fieldsRule',
    'Step 3: under the Add a title card checkbox, for a staff video, while the four fields show',
  ],
  [
    'titleCard.submission',
    'Step 3, Title card, for a student submission: the four fields for the card shown before the video',
  ],
  [
    'titleCard.submission.fieldsRule',
    'Step 3: under the Add a title card checkbox, for a student submission, above its four fields',
  ],
  ['titleCard.submission.missing', "Step 3: the error beside a student submission's field left empty, when Create is pressed"],
  ['titleCard.submission.idNotAnId', 'Step 3: the error beside the student ID numbers, when Create is pressed'],
  ['titleCard.submission.idTwice', 'Step 3: the error beside the student ID numbers, when Create is pressed'],
  ['titleCard.submission.idsTooMany', 'Step 3: the error beside the student ID numbers, when Create is pressed'],
  [
    'titleCard.card',
    "Not on the page: drawn on the finished video itself, on a student submission's title card, as a label before what the student typed",
  ],
  ['titleCard.full', 'Step 3: beside a field when what was typed reached its limit'],
  ['titleCard.refused', 'Step 3: the error beside a field whose words do not fit on the card'],
  ['titleCard.empty', 'Step 3: the error beside the Add a title card checkbox, when Create is pressed'],
  [
    'titleCard.correctToContinue',
    'Step 6: the status line under the buttons, when the title card stops the video being made',
  ],
  ['closing', 'Step 4, Closing graphics'],
  [
    'closing.internalWords',
    'Not on the page: drawn on the finished video itself, on the closing card, under the University logo',
  ],
  ['closing.result', 'Step 4: the line under the controls saying what the closing will do'],
  ['preset', 'Step 5, File size / quality'],
  ['preset.inRecord', 'Step 6: the finished video\'s one-line summary, "Made from …"'],
  ['preset.inSentence', 'Inside other sentences: the device check, the status line and an error box'],
  ['create', 'Step 6, Create: buttons and labels'],
  ['status', 'Step 6: the status line under the buttons, also read out by screen readers'],
  ['status.verdictSpoken', 'Not shown: read out by screen readers when the device check finishes'],
  ['discard', 'Step 6: the question asked before an unsaved video is discarded'],
  ['discard.spoken', 'Not shown: read out by screen readers with the question'],
  ['result', 'Step 6: the finished video and its one-line summary'],
  [
    'result.summaryWithCard',
    'Step 6: the finished video and its one-line summary, when the video has a title card',
  ],
  [
    'result.videoLanguage',
    "Step 6: after the finished video's one-line summary, and in the question before it is discarded, when the video's words are in another language than the page",
  ],
  ['result.closing', 'Step 6: the end of the summary "Made from …", saying how the video closes'],
  ['result.fellBackTo', 'Step 6: under the finished video, when its closing is not the one chosen'],
  [
    'result.endedEarly',
    'Step 6: under the finished video, and in the question before it is discarded, when the file chosen stops part-way',
  ],
  ['progress', 'Step 6: the progress bar while the video is made'],
  ['progress.title', 'The title in the browser tab while the video is made'],
  ['progress.jobNotice', 'Step 6: said when the video starts being made'],
  ['progress.withTimeLeft', 'Not shown: read out by screen readers while the video is made'],
  ['progress.job', 'Step 6: under the progress bar while the video is made'],
  ['preflight', 'Step 6: the device check, which says whether this computer can make the video'],
  ['preflight.headings', 'Step 6: the heading of the device check'],
  ['preflight.reasons', 'Step 6: one reason in the device check'],
  ['warnings', 'Step 6: warnings about the audio or the finished video'],
  ['warnings.spoken', 'Not shown: read out by screen readers'],
  ['announce', 'Not shown: read out by screen readers'],
  ['failure', 'An error box, in the step it affects'],
  ['failure.startup', 'Step 1: the error box when this browser cannot run the tool at all'],
  ['failure.captured', 'The Errors captured panel, when something in the tool goes wrong'],
  ['systemCheck', 'The System check at the foot of the page'],
  ['errors', 'The Errors captured panel, only shown when something in the tool goes wrong'],
  ['feedback', 'The Report a problem dialog'],
  [
    'feedback.open',
    'The foot of the page, under "Something not working?": the button that opens the Report a problem dialog',
  ],
  [
    'statement',
    'The Accessibility statement at the foot of the page, a panel that opens: its running text',
  ],
  [
    'statement.heading',
    'The Accessibility statement at the foot of the page: the heading of the panel',
  ],
  [
    'statement.abilities',
    'The Accessibility statement: a list item, completing "You should be able to:"',
  ],
  ['statement.limits.heading', 'The Accessibility statement: a subheading'],
  [
    'statement.limits.items',
    'The Accessibility statement: a list item, under "How accessible this tool is"',
  ],
  ['statement.contact.heading', 'The Accessibility statement: a subheading'],
  ['statement.enforcement.heading', 'The Accessibility statement: a subheading'],
  ['statement.compliance.heading', 'The Accessibility statement: a subheading'],
  ['statement.testing.heading', 'The Accessibility statement: a subheading'],
  ['statement.plans.heading', 'The Accessibility statement: a subheading'],
  [
    'statement.plans.items',
    'The Accessibility statement: a list item, under "What we plan to test next", the tests still needed',
  ],
  [
    'statement.plans.optionalItems',
    'The Accessibility statement: a list item, under "We are also thinking of:"',
  ],
  ['statement.about.heading', 'The Accessibility statement: a subheading'],
  ['footer.heading', 'The foot of the page: the heading over the help and feedback routes'],
  ['footer.groups', 'The foot of the page: a small heading, a question over the route or routes for it'],
  [
    'footer.feedbackForm',
    'The foot of the page, under "What do you think of the tool?": a link that opens the feedback form, in a new tab',
  ],
  [
    'footer.contact.creators',
    'The foot of the page, under "Need help using the tool?": a link for staff that opens the creators team on Microsoft Teams, in a new tab',
  ],
  [
    'footer.contact.selfService',
    'The foot of the page, under "Need help using the tool?": a link for students that opens the University’s Self Service website, in a new tab',
  ],
  ['save', 'Step 6: saving the finished video'],
  ['save.pickerDescription', 'The save dialog, naming the kind of file'],
  ['save.stem', 'The name suggested for the saved file'],
  ['save.marks', 'The name suggested for the saved file'],
  ['save.fileName', 'The name suggested for the saved file'],
  ['format', 'Wherever a length, size or picture fact is shown, mostly Step 1, Video properties'],
]

/** What each placeholder stands for. */
const PLACEHOLDERS: Readonly<Record<string, string>> = {
  count: 'a number',
  seconds: 'a number of seconds',
  degrees: 'a number of degrees',
  kilohertz: 'a number',
  hertz: 'a number',
  width: 'a number of pixels',
  height: 'a number of pixels',
  rate: 'a frame rate, like "25 frames a second"',
  duration: 'a length of time in words, like "4 minutes 12 seconds"',
  kept: 'a length of time in words',
  length: 'a time, like 2:10.4',
  from: 'a time, like 0:30.0',
  to: 'a time, like 2:30.0',
  time: 'a length of time in words',
  size: 'a file size, like "120 MB"',
  name: "a name: a language's own name, or the user's file name",
  facts:
    'a list of facts about the video, like "4 minutes 12 seconds, 1920 × 1080, stereo (two channels)"',
  found: 'a list, like "2 caption tracks and 1 chapter track"',
  remedy: 'another sentence from this sheet, saying what to do',
  smaller: 'the smaller output, named in a sentence, from preset.inSentence.smaller',
  best: 'the larger output, named in a sentence, from preset.inSentence.best',
  notice: 'another sentence from this sheet (progress.jobNotice)',
  sentence: 'an error message from this sheet',
  heading: 'a heading from this sheet',
  times:
    'a list of times in the video, like "1:22 and 3:05", perhaps ending "2 other moments" (warnings.decodeDamage.more)',
  titles: 'warning headings from this sheet, one after another',
  question: 'the question from discard.delivered or discard.unsaved',
  adds: 'the sentence from closing.result.adds',
  stage: 'a stage name from progress.stages',
  percent: 'a percentage, like 14%',
  milestone: 'a phrase from progress.milestones',
  progress: 'a stage name and a milestone, from progress.stageMilestone, like "Encoding video — half done"',
  left: 'the time left, from progress.timeLeft or progress.fewSecondsLeft',
  app: 'the product name, from app.title',
  part: 'what part of the video was kept, from result.keptWhole or result.keptPart',
  output: 'the output chosen, from preset.inRecord',
  closing: 'how the video closes, from result.closing…',
  title: 'a heading from this sheet',
  detail: 'a sentence from this sheet',
  address: 'an email address',
  stem: "the user's own file name, without its ending",
  mark: 'a word from save.marks',
  where: 'save.downloadIos or save.downloadOther',
  result: 'a count from systemCheck.results',
  date: 'a date the app writes in your language, like "18 October 2026"',
  updatedDate: 'the date the statement was last updated, written by the app, like "24 October 2026"',
  reviewDate: 'the date of the next review, written by the app, like "18 November 2026"',
  service:
    "the advice service's name, from statement.enforcement.service, as a link to its website",
  words: 'the words drawn on the closing card, from closing.internalWords',
  running: 'a length of time as a clock shows it, like 12:34',
  stops: 'a time in the video, like 0:20',
  end: 'a time in the video, like 0:30',
  picture: 'a time in the video, like 0:20',
  sound: 'a time in the video, like 0:20',
  id: 'what the student typed as a student ID number, like 20412345',
  max: 'the most student ID numbers one card holds, a number',
  digits: 'how many digits a student ID number has, a number',
  kind: 'the video type, from videoKind.options',
  language: "a language's name in its own language, as the Video language choice shows it, like English or 简体中文",
}

/** What a key's last parts say about when the message is used. */
function variantNote(path: readonly string[]): string[] {
  const notes: string[] = []
  const last = path[path.length - 1]!
  const parent = nodeAt(enGB, path.slice(0, -1))
  if (parent !== null && typeof parent === 'object' && isCountGroup(parent)) {
    const numbered = Object.keys(parent).filter((key) => /^\d+$/.test(key))
    if (last === 'one') notes.push('Used when the count is 1.')
    else if (/^\d+$/.test(last)) notes.push(`Used when the count is ${last}, said in words.`)
    else if (numbered.length > 0)
      notes.push(`Used for any count above ${numbered[numbered.length - 1]}, in digits.`)
    else notes.push('Used for any count other than 1. Fill it even if your language has one form.')
  }
  for (const part of path) {
    if (part === 'blue' || part === 'white') notes.push(`Used when the closing graphics are ${part}.`)
    if (part === 'fade' && path[0] !== 'closing') notes.push('Used when the closing graphics fade in.')
    if (part === 'slide' && path[0] !== 'closing') notes.push('Used when the closing graphics slide in.')
  }
  if (path[0] === 'closing' && path[1] === 'result' && (last === 'fade' || last === 'slide')) {
    notes.push(`Used when the closing graphics ${last} in.`)
  }
  if (path.includes('problem') && (last === 'start' || last === 'end'))
    notes.push(`About the ${last} time.`)
  return notes
}

/** The note on each line of a list that completes the sentence above it (VH-130). */
const COMPLETES_ABLE_TO =
  'Follows "You should be able to:". It starts with a capital, where your language has one, and ends with your language’s full stop, as the English does (VH-137).'
const NEXT_TEST =
  'A test still needed, under "What we plan to test next". It starts with a capital, where your language has one, and ends with your language’s full stop, as the English does (VH-137).'
const COMPLETES_THINKING_OF =
  'Follows "We are also thinking of:". It starts with a capital, where your language has one, and ends with your language’s full stop, as the English does (VH-137).'
/** The footer's three questions (VH-182). */
const FOOTER_QUESTION =
  'A small heading, a question the route or routes under it answer. It is never part of a link’s words, so each link still says alone where it goes.'

/** The same note on every line of a list, keyed `prefix.0`, `prefix.1` and on. */
function listNotes(prefix: string, items: readonly string[], note: string): Record<string, string> {
  return Object.fromEntries(items.map((_, index) => [`${prefix}.${index}`, note]))
}

/** Notes for single keys, where the key and its English need more. */
const NOTES: Readonly<Record<string, string>> = {
  'app.title': 'The product name. UoN stands for University of Nottingham.',
  'language.label': 'The label over the language switcher, also read out by screen readers.',
  'language.machine.title': 'The heading of the note, so no full stop.',
  'language.machine.link':
    'The words of a link that opens an email to the maintainer, with your language in its subject.',
  'trim.format': 'Keep the example times 1:05.5 and 65.5 as they are.',
  'trim.problem.notATime.start': 'Keep the example times 1:05.5 and 65.5 as they are.',
  'trim.problem.notATime.end': 'Keep the example times 1:05.5 and 65.5 as they are.',
  'trim.handleBeginning': 'Completes "Start, at the beginning" for screen readers.',
  'trim.handleEnd': 'Completes "End, at the end" for screen readers.',
  'closing.helpExistingText':
    'Follows "The last second of video" on the same line, so it starts with a dash; "it" is that second.',
  'closing.helpFreezeText': 'Follows "A held last frame" on the same line, so it starts with a dash.',
  'lede.formatHelp.label':
    'Not shown: read out by screen readers as the name of the "?" button beside lede.promises.3.',
  'lede.formatHelp.text':
    'Keep "MP4", the name of the video format. "Interoperable" means it works with many devices and apps.',
  'closing.notUsedWith.cut':
    'Names the animation type "Cut"; use the same word as closing.types.cut.',
  'closing.notUsedWith.none':
    'Says the animation type "No closing graphics" is chosen; use the same words for "closing graphics" as closing.types.none.',
  'videoKind.label': 'The label over the switch, also read out by screen readers.',
  'videoLanguage.label':
    'The label over the choice, also read out by screen readers. Use the same word for "video" as videoKind.label and for "language" as language.label.',
  'videoLanguage.helper':
    'The words the app draws into the video, such as closing.internalWords and the title card’s labels, follow this choice; the page itself does not. Use the same words as titleCard.add for "title card" and closing.types.none for "closing graphics".',
  'videoKind.nextVideo':
    'The video type is not locked while a video is made, and a change does not alter that video. Use the same words as videoKind.label.',
  'titleCard.add':
    'The label of a checkbox that adds the card before the video. titleCard.empty quotes it: use the same words there.',
  'titleCard.title':
    'The label over a field the user types the video’s title in. The card shows only what is typed, never this label.',
  'titleCard.department':
    'The label over a field the user types a department or school in. The card shows only what is typed, never this label.',
  'titleCard.authors':
    'The label over a field the user types one or more names in. The card shows only what is typed, never this label.',
  'titleCard.date':
    'The label over a field that is filled with today’s date. The card shows only what is in it, never this label.',
  'titleCard.dateHelper':
    'Use the same words for "video language" as videoLanguage.label.',
  'titleCard.forSubmission':
    'Why the checkbox titleCard.add is ticked and cannot be unticked. Use the same words for "student submission" as videoKind.options.submission.',
  'titleCard.fieldsRule':
    'For a staff video: a card needs at least one of the four fields, and the app fills the date when the box is ticked.',
  'titleCard.submission.fieldsRule':
    'For a student submission: every one of the four fields must be filled in before the video is made.',
  'titleCard.submission.idsHelper':
    'Use the same words for "student ID number" as titleCard.submission.ids.',
  'titleCard.submission.idsHelperNext':
    'Follows titleCard.submission.idsHelper, on a line of its own: how to type the student ID numbers.',
  'titleCard.submission.idNotAnId':
    'Use the same words for "student ID number" as titleCard.submission.ids.',
  'titleCard.submission.filled':
    'Use the same words for "running time" as titleCard.card.running, and for "the date the card was made" as titleCard.card.made.',
  'titleCard.card.madeValue':
    'Drawn after titleCard.card.made. It must say plainly that {date} is not the date the work was submitted.',
  'titleCard.empty':
    'Names the checkbox titleCard.add; use the same words.',
  'titleCard.correctToContinue':
    'Said under the Create button. Use the same words for "title card" as steps.titleCard.',
  'failure.titleCardRefused.next':
    'Use the same words for "title card" as steps.titleCard.',
  'closing.internalForSubmission':
    'Why the "Internal use only" checkbox cannot be unticked. Use the same words for "student submission" as videoKind.options.submission.',
  'closing.internalLabel':
    'The label of a checkbox that adds the words of closing.internalWords to the closing card. Use the same words.',
  'closing.internalWords':
    'Drawn in bold under the logo at the end of the video, like a stamp on a document, so it must fit on one line: keep it about as short as the English. A change here means the closing videos are built again.',
  'result.closingInternal':
    'Adds to how the video closes, like "a cut to the blue closing card, marked “Internal use only”". Keep the quotation marks.',
  'preset.labels.best': 'The name of the larger output: what it is, then what it is for.',
  'preset.labels.smaller': 'The name of the smaller output: what it is, then what it is for.',
  'preset.inRecord.best':
    'The larger output, in the list after "Made from …" (result.summary): the start of preset.labels.best, without what it is for.',
  'preset.inRecord.smaller':
    'The smaller output, in the list after "Made from …" (result.summary): the start of preset.labels.smaller, without what it is for.',
  'preset.inSentence.best':
    'The larger output, named inside a sentence, after "choose": the start of preset.labels.best. Other rows quote it.',
  'preset.inSentence.smaller':
    'The smaller output, named inside a sentence, after "choose": the start of preset.labels.smaller. Other rows quote it.',
  'systemCheck.marks.pass': 'A one-word mark beside a check that passed.',
  'systemCheck.marks.fail': 'A one-word mark beside a check that failed.',
  'systemCheck.marks.warn':
    'A mark, not a word: keep it as it is unless your language uses another.',
  'systemCheck.marks.pending': 'A mark, not a word: keep it as it is.',
  'save.stem': 'Used as the file name when the original has none.',
  'save.marks.branded':
    'Goes in brackets in the saved file\'s name, like "Lecture 3 (branded).mp4".',
  'save.marks.levelled': "Goes in brackets in the saved file's name.",
  'save.marks.converted': "Goes in brackets in the saved file's name.",
  'save.fileName': 'Keep the brackets and .mp4.',
  'progress.milestones.0': 'Follows a stage name, like "Encoding video — a quarter done".',
  'progress.milestones.1': 'Follows a stage name, like "Encoding video — half done".',
  'progress.milestones.2': 'Follows a stage name, like "Encoding video — three quarters done".',
  'progress.timeLeft':
    'How long the video still needs, on a line of its own under "Encoding video — 45%": "About 2 minutes left".',
  'progress.fewSecondsLeft': 'In place of progress.timeLeft when under five seconds are left.',
  'progress.withTimeLeft':
    'Read out by screen readers, not shown: a milestone, then the time left, as two sentences, like "Encoding video — half done. About 2 minutes left".',
  'warnings.endsEarly.heading':
    'Said when the file stops part-way, as an interrupted copy or a crashed recorder leaves it. Warning headings are read one after another inside warnings.spoken, so no full stop.',
  'warnings.endsEarly.detail':
    '"of {end}" means the audio should run until {end}. A fact, not a guess: only the cause ("probably cut off") is uncertain.',
  'warnings.cutShort.heading':
    'Said when an MKV or WebM file stops part-way and its own bytes show it, as an interrupted copy leaves it. Warning headings are read one after another inside warnings.spoken, so no full stop.',
  'warnings.cutShort.detail':
    'Said in place of warnings.endsEarly.detail for an MKV or WebM file, which gives no time the audio should reach. "The new video" is the one this tool makes.',
  'warnings.keptTooLittleAudio.heading':
    'Said in place of warnings.noAudio.heading when the file has audio but the part the trim kept holds too little of it to level. Warning headings are read one after another inside warnings.spoken, so no full stop.',
  'warnings.keptTooLittleAudio.detail':
    'Said in place of warnings.noAudio.detail. "The start or end time" are the trim\'s two times: use the same words as trim.startTime and trim.endTime. "The new video" is the one this tool makes.',
  'result.summaryWithCard.staff':
    'The card a staff video opens with. Use the same words for "staff" as videoKind.options.staff and for "title card" as steps.titleCard.',
  'result.summaryWithCard.submission':
    'The card a student submission opens with. Use the same words for "submission" as videoKind.options.submission.',
  'result.videoLanguage':
    'Follows the summary when the words the app drew into the video are in another language than the page. Use the same words as videoLanguage.label.',
  'progress.job':
    'Names the video being made as it was started, since the video type above the steps may have changed since. Use the same words as videoLanguage.label.',
  'result.endedEarly.together': 'In place of result.endedEarly.both when the picture and the audio stop in the same second.',
  'result.endedEarly.held':
    'Follows one of the sentences above when the picture stopped and the video has closing graphics: until they start, the last picture stays on screen.',
  'create.again':
    'Replaces create.create while the video made from the file now chosen is on screen, saved or not; never beside a previous video. Use the same words as "create the video again" in result.endedEarly.next.',
  'result.endedEarly.next': 'Ends the passage. Use the same words for "create the video" as create.create.',
  'format.unknown': 'Inside a sentence, in place of a fact the app could not read.',
  'format.alone.unknown':
    'Shown alone, as a whole value, in place of a fact the app could not read. The same words as format.unknown, with a capital where the language has one.',
  'format.alone.lessThanASecond':
    'Shown alone, as a whole value. The same words as format.lessThanASecond, with a capital where the language has one.',
  'statement.heading':
    'The heading of the panel, so no full stop. A formal statement, as on any official website.',
  'statement.covers':
    'UoN Video Helper is the product name: use the same name as app.title. A formal statement: use a formal register throughout.',
  'statement.aim': 'Introduces the five lines that follow, which complete its last sentence.',
  ...listNotes('statement.abilities', enGB.statement.abilities, COMPLETES_ABLE_TO),
  'statement.limits.intro': 'Introduces the six lines that follow.',
  'statement.limits.items.0': 'Keep the name Google Chrome as it is.',
  'statement.limits.items.1': '"Malay" is the language this page calls Bahasa Malaysia.',
  'statement.limits.items.5':
    'Choose File is the button the browser draws: give it the words your language’s Chrome shows on it. Quote steps.choose in the same words.',
  'statement.limits.items.4':
    'Keep UoN, MB, GB, H.264 and AAC as they are: these short forms are what the sentence is about. Keep University of Nottingham as app.title’s note gives it.',
  'statement.contact.text':
    '"The learning content team" is the name of a University team: translate it plainly. The email address is shown as a link.',
  'statement.enforcement.text':
    'The Equality and Human Rights Commission is an official UK body: give its English name with a translation in brackets, or name it as your language normally would.',
  'statement.enforcement.service':
    'The name of an official UK advice service, shown as a link that opens its website in a new tab: keep saying so in the link. Give its English name with a translation in brackets, or name it as your language normally would.',
  'statement.compliance.text':
    'Keep WCAG, AA and AAA as they are; 2.2 is a version number. Use the usual name in your language for the Web Content Accessibility Guidelines, if there is one.',
  'statement.testing.wave':
    'Keep the names WAVE and WebAIM as they are. The score is 10 out of 10.',
  'statement.testing.manual': 'Keep the name Chrome as it is.',
  'statement.testing.walk': 'Keep the name Chrome as it is.',
  'statement.plans.intro':
    'Introduces the four lines that follow: the tests needed before the tool can be said to meet the guidelines in full.',
  ...listNotes('statement.plans.items', enGB.statement.plans.items, NEXT_TEST),
  'statement.plans.items.1': `${NEXT_TEST} Keep the names NVDA, Chrome, Windows, VoiceOver and Mac as they are.`,
  'statement.plans.items.3': `${NEXT_TEST} Keep the name Windows as it is.`,
  'statement.plans.optionalIntro': 'Introduces the two lines that follow: tests that are not required.',
  ...listNotes('statement.plans.optionalItems', enGB.statement.plans.optionalItems, COMPLETES_THINKING_OF),
  'statement.plans.optionalItems.0': `${COMPLETES_THINKING_OF} Keep axe and Lighthouse as they are: they are the names of tools.`,
  'statement.about.dates': 'Keep the name Joe Bell as it is.',
  'footer.groups.help': FOOTER_QUESTION,
  'footer.groups.problem': FOOTER_QUESTION,
  'footer.groups.opinion': FOOTER_QUESTION,
  'footer.feedbackForm':
    'The words of a link on a line of its own, so they must say alone where it goes and that it opens in a new tab: use the same words for "new tab" as footer.contact.creators. The form asks what people think of the tool; the words are warm and invite them to say.',
  'footer.contact.creators':
    'The words of a link on a line of its own, so they must say alone who it is for, where it goes and that it opens in a new tab: use the same words for "new tab" as statement.enforcement.service. Keep the name Teams as it is. "Creators team" is the name of a University team: translate it plainly. "Staff:" says who the link is for; use the same pattern as "Students:" in footer.contact.selfService.',
  'footer.contact.selfService':
    'The words of a link on a line of its own, so they must say alone who it is for, where it goes and that it opens in a new tab: use the same words for "new tab" as footer.contact.creators. "Self Service" is the name of the University’s own help website: keep it as it is. "Students:" says who the link is for; use the same pattern as "Staff:" in footer.contact.creators.',
}

/** A row of the translator's sheet. */
export interface SheetRow {
  readonly key: string
  readonly where: string
  readonly english: string
  readonly notes: string
}

/** Where a key shows, by the longest prefix in {@link WHERE}. */
export function whereShown(key: string): string {
  let best: readonly [string, string] | undefined
  for (const entry of WHERE) {
    const [prefix] = entry
    if (
      (key === prefix || key.startsWith(`${prefix}.`)) &&
      (!best || prefix.length > best[0].length)
    )
      best = entry
  }
  return best?.[1] ?? ''
}

/** The rows of the sheet, one per English message, in the table's order. */
export function sheetRows(): SheetRow[] {
  return messagesOf(enGB).map(({ key, english }) => {
    const notes = [...(NOTES[key] ? [NOTES[key]] : []), ...variantNote(key.split('.'))]
    const names = placeholdersOf(english)
    if (names.length > 0) {
      notes.push(
        `Keep ${names.map((name) => `{${name}}`).join(', ')} as written: ` +
          names
            .map((name) => `{${name}} is ${PLACEHOLDERS[name] ?? 'filled in by the app'}`)
            .join('; ') +
          '.',
      )
    }
    return { key, where: whereShown(key), english, notes: notes.join(' ') }
  })
}

/**
 * The languages the sheet carries a column for, by column heading, each with
 * the `meta` its table is written with — set here, never translated: Chinese
 * joins facts and sentences with full-width marks and no gap; Malay as English.
 */
export const SHEET_LANGUAGES = [
  {
    tag: 'zh-Hans',
    heading: 'Chinese (Simplified)',
    googleCode: 'zh-CN',
    meta: {
      locale: 'zh-Hans',
      durationList: 'narrow',
      separators: { list: '，', series: '；', sentences: '' },
    },
  },
  {
    tag: 'ms-MY',
    heading: 'Bahasa Malaysia',
    googleCode: 'ms',
    meta: {
      locale: 'ms-MY',
      durationList: 'narrow',
      separators: { list: ', ', series: '; ', sentences: ' ' },
    },
  },
] as const satisfies readonly {
  readonly tag: LanguageTag
  readonly heading: string
  readonly googleCode: string
  readonly meta: Messages['meta']
}[]

/** The filled sheet the zh-Hans and ms-MY tables are generated from (`scripts/strings-table.mjs`). */
export const FILLED_SHEET = 'reviews/2026-10-18/VH-105-strings-filled.csv'

/** The sheet's column headings, in order. */
export const SHEET_HEADINGS = [
  'key',
  'where it shows on the page',
  'English',
  'notes',
  ...SHEET_LANGUAGES.map(({ heading }) => heading),
] as const

/** A cell for CSV: quoted when it holds a comma, a quote or a line break. */
function csvCell(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * The sheet as CSV — UTF-8 with a byte-order mark, so Excel opens Chinese
 * correctly, and CRLF line ends, as RFC 4180 has them.
 */
export function toCsv(rows: readonly (readonly string[])[]): string {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
}

/** The sheet's rows as cells, headings first, with the language columns empty. */
export function sheetCells(): string[][] {
  return [
    [...SHEET_HEADINGS],
    ...sheetRows().map((row) => [
      row.key,
      row.where,
      row.english,
      row.notes,
      ...SHEET_LANGUAGES.map(() => ''),
    ]),
  ]
}

/**
 * CSV back into rows of cells: RFC 4180 quoting, either line end, a leading
 * byte-order mark ignored. What Google Sheets, Excel and Numbers write.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const source = text.startsWith('\uFEFF') ? text.slice(1) : text
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"'
        index++
      } else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') index++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += char
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

/** A filled sheet's translations in one language column, by key. Throws when the sheet has no such column. */
export function translationsFrom(
  cells: readonly (readonly string[])[],
  heading: string,
): Map<string, string> {
  const [headings = [], ...rows] = cells
  const keyColumn = headings.indexOf('key')
  const column = headings.indexOf(heading)
  if (keyColumn < 0 || column < 0) throw new Error(`The sheet has no "key" or "${heading}" column.`)
  return new Map(
    rows.filter((row) => row[keyColumn]).map((row) => [row[keyColumn]!, row[column] ?? '']),
  )
}

/** English's structure, `meta` left out, with each message replaced by its translation, collecting the keys left blank. */
function translate(
  node: object,
  prefix: string,
  translations: ReadonlyMap<string, string>,
  missing: string[],
): unknown {
  const entries = Object.entries(node)
    .filter(([key]) => prefix !== '' || key !== 'meta')
    .map(([key, value]): [string, unknown] => {
      const path = prefix ? `${prefix}.${key}` : key
      if (typeof value !== 'string')
        return [key, translate(value as object, path, translations, missing)]
      const text = translations.get(path) ?? ''
      if (text.trim() === '') missing.push(path)
      return [key, text]
    })
  return Array.isArray(node) ? entries.map(([, value]) => value) : Object.fromEntries(entries)
}

/**
 * A language table from a filled sheet's translations: English's keys, in
 * English's order, with the language's own `meta`. A key the sheet leaves
 * blank or lacks comes back in `missing`, so the caller refuses a partial table.
 */
export function tableFrom(
  translations: ReadonlyMap<string, string>,
  meta: Messages['meta'],
): { readonly table: Messages; readonly missing: readonly string[] } {
  const missing: string[] = []
  const table = { meta, ...(translate(enGB, '', translations, missing) as object) } as Messages
  return { table, missing }
}
