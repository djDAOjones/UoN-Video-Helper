/**
 * The languages the page is offered in (VH-105).
 *
 * English is the default and the fallback; Simplified Chinese is read at the
 * Ningbo and Malaysia campuses, Bahasa Malaysia at the second. Both
 * translations are machine translations, repaired by an agent: the owner
 * chose on 2026-10-18 to offer them live, marked on the page as machine
 * translation, and to have a native-speaking colleague at each campus check
 * the live page rather than sign off a sheet first (decisions, 2026-10-18).
 */

/** BCP 47 tags, as `document.documentElement.lang` and `Intl` take them. */
export type LanguageTag = 'en-GB' | 'zh-Hans' | 'ms-MY'

/** The language the page starts in when nothing is remembered. No negotiation from the browser's own language: a remembered choice is the user's, a guessed one is not. */
export const DEFAULT_LANGUAGE: LanguageTag = 'en-GB'

/**
 * Each language's name in its own language and script — the one label a
 * reader who does not read the page's current language can still find.
 * Signed off 2026-10-01; the exact Chinese and Malay forms are the
 * reviewers' to confirm.
 */
export const LANGUAGE_NAMES: Readonly<Record<LanguageTag, string>> = {
  'en-GB': 'English',
  'zh-Hans': '简体中文',
  'ms-MY': 'Bahasa Malaysia',
}

/**
 * The languages the switcher offers, in its order, in development and
 * production alike. Turning a language off is removing it here; a browser
 * that remembered it falls back to English (`readLanguagePreference`).
 */
export const LANGUAGES_OFFERED: readonly LanguageTag[] = ['en-GB', 'zh-Hans', 'ms-MY']

/**
 * The languages whose tables a computer translated, each marked so on the
 * page with an email link for better wording (decisions, 2026-10-18). A
 * language comes off this list when its campus colleague has checked it.
 */
export const MACHINE_TRANSLATED: readonly LanguageTag[] = ['zh-Hans', 'ms-MY']

/** Where the chosen language is remembered, in this browser only. Nothing about it leaves the device. */
export const LANGUAGE_PREFERENCE_KEY = 'uon-video-helper:language'

/**
 * Where the video's text language is remembered (VH-132), in this browser
 * only, and only once someone picks one: until then it follows the page's.
 */
export const VIDEO_LANGUAGE_PREFERENCE_KEY = 'uon-video-helper:video-language'
