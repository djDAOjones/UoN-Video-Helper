/**
 * Where a problem report goes, and how much of it fits in one email link
 * (VH-93), and the footer's other routes (VH-182).
 *
 * A report leaves through the user's own email app, never through a request
 * the app makes: "no media egress" and acceptance criterion 9 stay exactly as
 * they were. These are the numbers that shape that email.
 */

/**
 * The learning content team's address, where problem reports go (VH-182, the
 * owner's answer of 2026-10-24). A role address, so it survives a change of
 * maintainer; the accessibility statement's contact follows it.
 */
export const FEEDBACK_ADDRESS = 'UI-Learning-Content@nottingham.ac.uk'

/** The learning content team's own Creators team on Teams; staff's help link, opened in a new tab (VH-148). */
export const CREATORS_TEAM_URL = 'https://teams.microsoft.com/l/team/19%3A14c7a4d2bf43456fa0c3c52c851fb097%40thread.tacv2/conversations?groupId=bd942b5f-5389-410c-abf2-9ba087360738&tenantId=67bda7ee-fd80-41ef-ac91-358418290a1e'

/**
 * University Self Service, students' help link, opened in a new tab: students
 * cannot open the Creators team (VH-182, the owner's answer of 2026-10-24).
 */
export const SELF_SERVICE_URL = 'https://selfservice.nottingham.ac.uk'

/**
 * The feedback form, supplied by the owner for the public release (VH-160):
 * what people think of the tool, beside Report a problem, which stays the
 * route for a problem. A plain address, opened in a new tab: nothing from the
 * page is ever added to it (the rules' no-egress line).
 */
export const FEEDBACK_FORM_URL = 'https://forms.cloud.microsoft/e/Meg347QQvs'

/** The email's subject. The build identity is appended, so a report names the code it is about. */
export const FEEDBACK_SUBJECT = 'UoN Video Helper problem report'

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
