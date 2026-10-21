/**
 * The cards' type scale (VH-126): the Internal use only closing's words, and
 * both title cards, the staff card (VH-127) and Submission (VH-128).
 *
 * Every size is in px per 1080 lines of the frame's SHORTER side, so a 4K
 * frame doubles it and a portrait frame keeps it. The floor is the owner's
 * (2026-10-18): nothing under 28 pt at PowerPoint sizes. A 16:9 slide is
 * 540 pt tall, so 28 pt is 28/540 of the frame, 56 px at 1080.
 *
 * Measured, not assumed: `spike-cards.html` draws every card at landscape,
 * portrait and 4K with the longest text in each language, and reports what
 * fits. These figures are the ones that page proved.
 */

/** The owner's floor: 28 pt on a 540 pt slide, at 1080 lines. */
export const CARD_TYPE_FLOOR_PX = 56

/** The lines of the shorter side every card size is given against. */
export const CARD_SCALE_LINES = 1080

/** The two brand faces a card draws in (`tokens.brand.css`), and the device's CJK face behind them. */
export type CardFace = 'heading' | 'body'

/** One kind of text on a card: its face, weight, size range and wrapping. */
export interface CardTextRole {
  readonly face: CardFace
  readonly weight: 'normal' | 'bold'
  /** The size it starts at, px per 1080 of the shorter side. */
  readonly maxPx: number
  /** The size it may shrink to before it must wrap or be refused; never under the floor. */
  readonly minPx: number
  /**
   * Line pitch as a multiple of the size. Running text keeps WCAG 1.4.8's
   * one and a half; a heading, never a block of text, sets tighter.
   */
  readonly lineHeight: number
  /** The most lines it may take in a landscape frame before it is refused at its field. */
  readonly maxLines: number
  /** The same in a portrait frame, which is narrower and has the height to spare. */
  readonly portraitMaxLines: number
}

/**
 * The roles, largest first.
 *
 * A field's text is drawn at the largest size in its range that wraps into
 * its lines and leaves the whole card inside the safe area; text that cannot
 * fit at its floor is refused at its field, never clipped.
 */
export const CARD_ROLES = {
  /** The staff card's title: what the video is. */
  staffTitle: {
    face: 'heading',
    weight: 'bold',
    maxPx: 104,
    minPx: CARD_TYPE_FLOOR_PX,
    lineHeight: 1.2,
    maxLines: 3,
    portraitMaxLines: 5,
  },
  /**
   * The staff card's three plain lines under the title, unlabelled (the owner,
   * 2026-10-19): the department, the author or authors, and the date. Every
   * field's most lines at the floor, with the gaps, fit the safe area's height
   * in any landscape frame and a 9:16 one (706 of 880 px, 1260 of 1565), so
   * there a card is refused only at a field it overfills; `title-card.test.ts`
   * holds that sum. A squarer portrait frame can still overfill the card, and
   * the renderer then names its longest field.
   */
  staffDepartment: {
    face: 'body',
    weight: 'normal',
    maxPx: 64,
    minPx: CARD_TYPE_FLOOR_PX,
    lineHeight: 1.5,
    maxLines: 2,
    portraitMaxLines: 4,
  },
  staffAuthors: {
    face: 'body',
    weight: 'normal',
    maxPx: 64,
    minPx: CARD_TYPE_FLOOR_PX,
    lineHeight: 1.5,
    maxLines: 2,
    portraitMaxLines: 4,
  },
  staffDate: {
    face: 'body',
    weight: 'normal',
    maxPx: 64,
    minPx: CARD_TYPE_FLOOR_PX,
    lineHeight: 1.5,
    maxLines: 1,
    portraitMaxLines: 2,
  },
  /** Submission's heading: the assignment title or number. */
  submissionHeading: {
    face: 'heading',
    weight: 'bold',
    maxPx: 80,
    minPx: CARD_TYPE_FLOOR_PX,
    lineHeight: 1.2,
    maxLines: 2,
    portraitMaxLines: 4,
  },
  /**
   * Submission's fields: a label in the regular weight, run in before its
   * value in bold, so a field is one line where it can be and the labels
   * need no column of their own. A field is a list item, not a block of
   * text, so it sets at 1.25 and the gap between fields does the grouping;
   * at 1.5 the worst case did not fit a 16:9 frame (measured 2026-10-19).
   */
  submissionField: {
    face: 'body',
    weight: 'normal',
    maxPx: CARD_TYPE_FLOOR_PX,
    minPx: CARD_TYPE_FLOOR_PX,
    lineHeight: 1.25,
    maxLines: 3,
    portraitMaxLines: 5,
  },
} as const satisfies Record<string, CardTextRole>

export type CardRoleName = keyof typeof CARD_ROLES

/** Space under a heading, as a multiple of the floor. */
export const CARD_BLOCK_GAP_EM = 0.75

/** Space between Submission's fields, and between the staff card's plain lines, as a multiple of the floor. */
export const CARD_FIELD_GAP_EM = 0.375

/**
 * How far a field's size falls at each try while the card is fitted, px per
 * 1080 of the shorter side. We chose it: fine enough that a field lands within
 * a hair of the largest size that fits, coarse enough that a fit takes a few
 * dozen measures.
 */
export const CARD_SIZE_STEP_PX = 2

/**
 * The most each typed field takes, in columns: a wide character, such as
 * Chinese, counts two, since it draws about twice as wide as a Latin letter.
 * Proposed from the measured runway; VH-127 and VH-128 adopt them, and the
 * renderer still refuses, at its field, anything that measures too long. The
 * staff card's four are the ones `spike-cards.html` fits with all four at
 * their limits at once (VH-127, 2026-10-19).
 */
export const CARD_FIELD_COLUMNS = {
  staffTitle: 100,
  staffDepartment: 80,
  staffAuthors: 80,
  staffDate: 40,
  assignment: 80,
  module: 60,
  convenor: 40,
} as const

/** The columns a wide character takes against those limits: it draws about twice as wide. */
export const CARD_WIDE_COLUMNS = 2

/**
 * How long a title card holds before the video, in seconds, the staff card's
 * and Submission's alike: the owner's answers of 2026-10-19 (decisions,
 * VH-127 and VH-128).
 */
export const TITLE_CARD_SECONDS = 5

/**
 * How many digits a University student ID number has (the owner,
 * 2026-10-19). Defined once: the check below and the words that state the
 * rule (`titleCard.submission.idsHelper`, `idNotAnId`) both take it, so they
 * cannot part (VH-140, design pass V-29).
 */
export const STUDENT_ID_DIGITS = 8

/**
 * A student ID number on Submission: the University's student number,
 * {@link STUDENT_ID_DIGITS} digits, Latin, once the page has folded
 * full-width digits to them (the owner, 2026-10-19). No field asks for a
 * name, so marking stays anonymous.
 */
export const STUDENT_ID_PATTERN = new RegExp(`^\\d{${STUDENT_ID_DIGITS}}$`, 'u')

/** The Unicode form the ID numbers' box is read in: it folds full-width digits and commas, as a Chinese input method types them, to Latin ones. */
export const STUDENT_ID_FOLD = 'NFKC'

/** The most student ID numbers one Submission card takes (the owner, 2026-10-18). */
export const STUDENT_IDS_MAX = 8

/** Space between a run-in label and its value, as a multiple of the size. */
export const CARD_LABEL_GAP_EM = 0.5

/**
 * Space between two label-and-value pairs that share a line, as a multiple of
 * the size: Submission's running time and card date, the two things the app
 * fills in, share the last field, which is what lets the worst case fit a
 * 16:10 and a 4:3 frame (measured 2026-10-19).
 */
export const CARD_PAIR_GAP_EM = 1

/**
 * The safe area, as fractions of the frame's own width and height.
 *
 * The sides and the top are title-safe with room to spare; the bottom is
 * deeper because a player's controls cover it while the card is paused on,
 * which is when a card is read.
 */
export const CARD_SAFE_AREA = {
  side: 0.0625,
  top: 0.075,
  bottom: 0.11,
} as const

/**
 * The closing's words, "Internal use only", drawn into the 16:9 closing
 * masters at build time rather than into the output.
 *
 * In px per 1080 lines of the ASSET, not of the output. A portrait output
 * shows the 16:9 closing letterboxed across its width (spec §4.3), which
 * scales it by 9/16; 100 is the size that still lands on the floor there
 * (100 × 0.5625 = 56.25), so the words hold 28 pt in every shape the app
 * makes.
 */
export const CLOSING_WORDS_PX = 100

/** The closing's words: Arial Bold, as the brand's substitute for Circular. */
export const CLOSING_WORDS_ROLE: CardTextRole = {
  face: 'body',
  weight: 'bold',
  maxPx: CLOSING_WORDS_PX,
  minPx: CLOSING_WORDS_PX,
  lineHeight: 1.2,
  maxLines: 1,
  portraitMaxLines: 1,
}

/**
 * Where the closing's words sit: centred, under the settled logo.
 *
 * The masters' logo settles at x 528–1404, y 358–686 in a 1920 × 1080 frame,
 * measured from `closing-tail-blue-1080p.mp4` on 2026-10-19. The words' cap
 * height starts this far below the logo's foot, in the words' own size, so the
 * gap scales with them.
 */
export const CLOSING_LOGO_FOOT_PER_1080 = 686
export const CLOSING_WORDS_GAP_EM = 0.75

/**
 * How the words build in (VH-126): a wipe from left to right whose progress
 * is the wordmark's own, measured from each master by
 * `scripts/build-branding.mjs`, so the two arrive together and settle
 * together. The wipe's edge is soft across this much of the words' size,
 * as the wordmark's motion blur is.
 */
export const CLOSING_WORDS_WIPE_FEATHER_EM = 0.5
