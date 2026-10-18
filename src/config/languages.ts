/**
 * The languages the page is offered in (VH-105).
 *
 * English is the default and the fallback; Simplified Chinese is read at the
 * Ningbo and Malaysia campuses, Bahasa Malaysia at the second. Each table is
 * drafted twice and judged by a native-speaking reviewer the maintainer
 * sources, so a language is OFFERED only once its reviewer has signed it off:
 * every push deploys, and a page in machine-sounding Chinese is worse than a
 * page in English. Until then the two translations are on in development and
 * off in production, which is this one line.
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
 * The languages the switcher offers. The maintainer turns a language on in
 * production here, after its reviewer's sign-off; development sees all three
 * so the switch can be built and checked.
 */
export const LANGUAGES_OFFERED: readonly LanguageTag[] = import.meta.env.DEV
  ? ['en-GB', 'zh-Hans', 'ms-MY']
  : ['en-GB']

/** Where the chosen language is remembered, in this browser only. Nothing about it leaves the device. */
export const LANGUAGE_PREFERENCE_KEY = 'uon-video-helper:language'
