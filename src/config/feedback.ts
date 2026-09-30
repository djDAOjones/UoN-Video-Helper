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

/** The email's subject. The build identity is appended, so a report names the code it is about. */
export const FEEDBACK_SUBJECT = 'UoN Video Helper feedback'

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
