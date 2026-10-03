/**
 * The browser's own `Intl` for numbers, lists and durations (VH-105, A-17),
 * each with the fallback the backlog requires where a constructor or a
 * locale is missing. No library: the table files call these with their own
 * locale, so a Chinese count is written as Chinese writes it and an English
 * one as English does, without a message engine between them.
 *
 * Formatting policy stays explicit — precision, grouping, which units — so
 * changing the language never silently changes the meaning or the
 * confidence of a number. Pure, so every path is tested in Node, the
 * absence path included.
 */

/** The parts of a rounded duration worth saying, after the policy in {@link durationParts}. */
export interface DurationParts {
  readonly hours?: number
  readonly minutes?: number
  readonly seconds?: number
}

/**
 * The parts of a duration, rounded to whole seconds: hours with their
 * minutes and no seconds, minutes with their seconds, or seconds alone. The
 * same policy the hand-built English formatter had, so "1 hour 23 minutes"
 * stays "1 hour, 23 minutes" and never "1 hour, 23 minutes, 20 seconds".
 */
export function durationParts(seconds: number): DurationParts {
  const whole = Math.round(seconds)
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const remainder = whole % 60
  if (hours > 0) return minutes > 0 ? { hours, minutes } : { hours }
  if (minutes > 0) return remainder > 0 ? { minutes, seconds: remainder } : { minutes }
  return { seconds: remainder }
}

/** `Intl.DurationFormat`, typed narrowly: the lib does not yet declare it everywhere. */
interface DurationFormatLike {
  format(parts: DurationParts): string
}
interface DurationFormatConstructor {
  new (locale: string, options?: Record<string, unknown>): DurationFormatLike
  supportedLocalesOf(locales: readonly string[]): readonly string[]
}

/** What a duration formatter can be built from — injected so the absence path is tested. */
export interface IntlLike {
  readonly DurationFormat?: DurationFormatConstructor
  readonly NumberFormat?: typeof Intl.NumberFormat
  readonly ListFormat?: typeof Intl.ListFormat
}

/**
 * A duration in words for `locale`, by `Intl.DurationFormat` where the
 * browser has it for that locale, and otherwise by one `NumberFormat` per
 * unit joined with a unit `ListFormat` — the same words, the same order.
 * Where even those are missing the parts are joined with a space, so a
 * formatting feature is never a reason the app cannot run.
 *
 * @param options - The `DurationFormat` options the language wants, such as
 *   `{ style: 'long' }`; each table carries its own.
 */
export function durationFormatter(
  locale: string,
  options: Record<string, unknown>,
  intl: IntlLike = Intl as IntlLike,
): (parts: DurationParts) => string {
  const DurationFormat = intl.DurationFormat
  if (DurationFormat && DurationFormat.supportedLocalesOf([locale]).length > 0) {
    const formatter = new DurationFormat(locale, options)
    return (parts) => formatter.format(parts)
  }
  return fallbackDurationFormatter(locale, intl)
}

/** The absence path on its own, so a test can reach it on an engine that has the constructor. */
export function fallbackDurationFormatter(
  locale: string,
  intl: IntlLike = Intl as IntlLike,
): (parts: DurationParts) => string {
  const { NumberFormat, ListFormat } = intl
  const unitFormatter = (unit: 'hour' | 'minute' | 'second'): ((value: number) => string) => {
    try {
      const formatter = new NumberFormat!(locale, { style: 'unit', unit, unitDisplay: 'long' })
      return (value) => formatter.format(value)
    } catch {
      return (value) => `${value} ${unit}${value === 1 ? '' : 's'}`
    }
  }
  const units = {
    hours: unitFormatter('hour'),
    minutes: unitFormatter('minute'),
    seconds: unitFormatter('second'),
  }
  let join = (items: readonly string[]): string => items.join(' ')
  try {
    const list = new ListFormat!(locale, { type: 'unit', style: 'long' })
    join = (items) => list.format(items)
  } catch {
    // No list formatter: the space join above stands.
  }
  return (parts) => {
    const items: string[] = []
    if (parts.hours !== undefined) items.push(units.hours(parts.hours))
    if (parts.minutes !== undefined) items.push(units.minutes(parts.minutes))
    if (parts.seconds !== undefined) items.push(units.seconds(parts.seconds))
    return join(items)
  }
}

/** A plain number for `locale`, with the locale's grouping unless `grouping` is false. */
export function numberFormatter(
  locale: string,
  options: Intl.NumberFormatOptions = {},
): (value: number) => string {
  try {
    const formatter = new Intl.NumberFormat(locale, options)
    return (value) => formatter.format(value)
  } catch {
    return (value) => String(value)
  }
}

/** A fraction as a percentage, whole numbers only: `0.14` is "14%". Never an already-multiplied value. */
export function percentFormatter(locale: string): (fraction: number) => string {
  return numberFormatter(locale, { style: 'percent', maximumFractionDigits: 0 })
}

/** A quantity with a unit `Intl` knows, such as `megabyte` or `millisecond`. */
export function unitFormatter(
  locale: string,
  unit: string,
  options: Omit<Intl.NumberFormatOptions, 'style' | 'unit'> = {},
): (value: number) => string {
  try {
    const formatter = new Intl.NumberFormat(locale, { style: 'unit', unit, ...options })
    return (value) => formatter.format(value)
  } catch {
    return (value) => `${value} ${unit}`
  }
}

/** A list of nouns joined as the language joins them: "A and B", "A、B和C". For genuine noun lists only, never sentences. */
export function listFormatter(
  locale: string,
  type: 'conjunction' | 'disjunction' | 'unit' = 'conjunction',
): (items: readonly string[]) => string {
  try {
    const formatter = new Intl.ListFormat(locale, { type, style: 'long' })
    return (items) => formatter.format(items)
  } catch {
    return (items) => items.join(', ')
  }
}

/** The grammatical forms a count can take. A language that has one form fills only `other`. */
export interface PluralForms {
  readonly zero?: string
  readonly one?: string
  readonly two?: string
  readonly few?: string
  readonly many?: string
  readonly other: string
}

/**
 * The form `Intl.PluralRules` picks for `count` in `locale`. The rules choose
 * a category; the words — the noun, a Chinese classifier, the Malay phrase —
 * are the table's own.
 */
export function pluralise(locale: string, count: number, forms: PluralForms): string {
  let category: keyof PluralForms = 'other'
  try {
    category = new Intl.PluralRules(locale).select(count) as keyof PluralForms
  } catch {
    category = count === 1 ? 'one' : 'other'
  }
  return forms[category] ?? forms.other
}
