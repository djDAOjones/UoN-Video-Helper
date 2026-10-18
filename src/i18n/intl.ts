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
 * never becomes "1 hour 23 minutes 20 seconds".
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

/** What a duration formatter is built from — injected so the absence path is tested. */
export interface IntlLike {
  readonly NumberFormat?: typeof Intl.NumberFormat
  readonly ListFormat?: typeof Intl.ListFormat
}

/**
 * A duration in words for `locale`: one `NumberFormat` per unit, long, joined
 * by a unit `ListFormat` in the table's own list style. Not
 * `Intl.DurationFormat`: its long style puts commas between the units, which
 * English here has never had ("4 minutes 12 seconds"), and not every engine
 * has it. Where a formatter is missing the parts are joined with a space, so
 * a formatting feature is never a reason the app cannot run.
 *
 * @param listStyle - How the units are joined; each table's `meta.durationList`.
 */
export function durationFormatter(
  locale: string,
  listStyle: Intl.ListFormatStyle,
  intl: IntlLike = Intl,
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
    const list = new ListFormat!(locale, { type: 'unit', style: listStyle })
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

/**
 * A calendar day, given as an ISO date (`2026-10-18`), written long as the
 * language writes one: "18 October 2026", "2026年10月18日", "18 Oktober 2026"
 * (VH-130). A day is not an instant, so it is read and written in UTC and
 * never moves to the day before in a reader's time zone west of London. A
 * missing formatter, or a value that is not a real ISO date — `2026-02-31`
 * included, which `Date` would quietly roll on to 3 March — shows the value
 * as given rather than a wrong day or "Invalid Date".
 */
export function dateFormatter(locale: string): (isoDate: string) => string {
  let formatter: Intl.DateTimeFormat | null = null
  try {
    formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' })
  } catch {
    // No date formatter for this locale: the ISO date stands, below.
  }
  return (isoDate) => {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
    if (!formatter || !parts) return isoDate
    const [year, month, date] = [Number(parts[1]), Number(parts[2]), Number(parts[3])]
    const day = new Date(Date.UTC(year, month - 1, date))
    if (day.getUTCMonth() !== month - 1 || day.getUTCDate() !== date) return isoDate
    return formatter.format(day)
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
