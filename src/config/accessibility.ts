/**
 * The facts the accessibility statement states (VH-130): its dates, who to
 * write to, and where to go after that. Dates are calendar days as ISO
 * strings, written in the page's language by `Intl` (`dateFormatter`), so a
 * review moves the date here and never touches a word in the tables.
 *
 * The statement is self-certified: the owner chose on 2026-10-18 that it
 * needs no University template or approval.
 */

import { FEEDBACK_ADDRESS } from './feedback'

/** When the statement was written and reviewed by the owner: 2026-10-18, the day it was asked for and answered. */
export const STATEMENT_PREPARED_DATE = '2026-10-18'

/**
 * When it was last updated: 2026-10-24, the day of the 0.2.0 cut (VH-162),
 * for which the owner asked it be brought up to date — "update accessibility
 * statement as appropiate. another review in november".
 */
export const STATEMENT_UPDATED_DATE = '2026-10-24'

/** When it is reviewed again: one month on, as the owner asked on 2026-10-18. */
export const STATEMENT_NEXT_REVIEW_DATE = '2026-11-18'

/**
 * When the page was checked with WebAIM's WAVE, scoring 10 out of 10: the
 * owner, on 2026-10-18 — "wave was checked today".
 */
export const WAVE_CHECK_DATE = '2026-10-18'

/**
 * Who a reader writes to about a barrier, and who reviewed the statement:
 * the owner, named on 2026-10-18 as the contact and reviewer. The same
 * address feedback goes to, so it is the feedback config's, not a copy.
 */
export const ACCESSIBILITY_CONTACT_ADDRESS = FEEDBACK_ADDRESS

/**
 * The Equality Advisory and Support Service's website, where the GOV.UK
 * model statement sends a reader unhappy with the answer to a complaint
 * (England, Scotland and Wales).
 */
export const EQUALITY_ADVISORY_SERVICE_URL = 'https://www.equalityadvisoryservice.com/'
