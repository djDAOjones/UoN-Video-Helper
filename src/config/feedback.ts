/**
 * Where feedback goes, and how much of it fits in one email link (VH-93).
 *
 * Feedback leaves through the user's own email app, never through a request
 * the app makes: "no media egress" and acceptance criterion 9 stay exactly as
 * they were. These are the numbers that shape that email.
 */

/**
 * The maintainer's address, as asked for on 2026-09-30. It is public either
 * way — in the shipped bundle and in this repository. A role address would
 * survive a change of maintainer; changing it is this one line.
 */
export const FEEDBACK_ADDRESS = 'joe.bell@nottingham.ac.uk'

/** The owner's Creators team on Teams; a help link, opened in a new tab (VH-148). */
export const CREATORS_TEAM_URL = 'https://teams.microsoft.com/l/team/19%3A14c7a4d2bf43456fa0c3c52c851fb097%40thread.tacv2/conversations?groupId=bd942b5f-5389-410c-abf2-9ba087360738&tenantId=67bda7ee-fd80-41ef-ac91-358418290a1e'

/** The learning content team's own address, supplied by the owner (VH-148). */
export const LEARNING_CONTENT_TEAM_ADDRESS = 'UI-Learning-Content@nottingham.ac.uk'

/** The email's subject. The build identity is appended, so a report names the code it is about. */
export const FEEDBACK_SUBJECT = 'UoN Video Helper feedback'

/**
 * Where better wording for a machine-translated page goes (VH-105): the
 * owner's own address, chosen on 2026-10-18 with the decision to put the
 * Chinese and Malay pages live. The note on a translated page links to it.
 */
export const TRANSLATION_FEEDBACK_ADDRESS = 'joe.bell@nottingham.ac.uk'

/**
 * That email's subject, before the language's own name: the product and the
 * language, and nothing about the video, the file or the device (the rules'
 * no-egress line). No body is prefilled.
 */
export const TRANSLATION_FEEDBACK_SUBJECT = 'UoN Video Helper translation'

/**
 * The longest `mailto:` link built, in characters. Some mail clients cut a
 * link's body at about 2,000; the details are trimmed from the end to fit, and
 * the user's own words never are.
 */
export const FEEDBACK_MAILTO_MAX_CHARACTERS = 1800

/** How many of the most recent log lines go with a report. Enough for context, short enough to read. */
export const FEEDBACK_RECENT_LOG_LINES = 8

/** The longest single log line kept, in characters; the rest is cut with an ellipsis. */
export const FEEDBACK_LOG_LINE_MAX_CHARACTERS = 140

/**
 * How long the leave warning stays lifted after the email app is asked to
 * open, in milliseconds. Chrome treats a followed `mailto:` link as leaving
 * the page, so with a job running it would ask "Leave site?" over it, although
 * the page stays. The warning is put back after this.
 */
export const FEEDBACK_LEAVE_WARNING_PAUSE_MS = 1000

/**
 * How long opening the dialog waits for the worker's log lines, in
 * milliseconds. A hung job is what most needs reporting, and a hung worker
 * may never answer; the dialog then goes on with the main thread's lines.
 */
export const FEEDBACK_WORKER_LOG_WAIT_MS = 1000
