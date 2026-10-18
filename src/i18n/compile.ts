/**
 * Turns a language table — data, `{name}` placeholders — into the API the
 * page calls (VH-105): a message with no placeholder stays a string, one
 * with placeholders becomes a function of exactly those names, and a count
 * group becomes one function of `{count}`. The English table's literal types
 * drive the API's types, so `t().trim.keeping({ kept, duration })` is checked
 * against the English template; the other tables are held to the same
 * placeholders by `tables.test.ts`.
 *
 * No message engine and no dependency: numbers are written by the table's
 * own `Intl.NumberFormat`, a list of nouns by its `Intl.ListFormat`, and a
 * count's form chosen by its `Intl.PluralRules` (`intl.ts`). Pure, so every
 * path is tested in Node.
 */

import { listFormatter, numberFormatter } from './intl'

/** A placeholder: `{` then a name of letters and digits, then `}`. */
const PLACEHOLDER = /\{([A-Za-z][A-Za-z0-9]*)\}/g

/** What a placeholder can be filled with: words as they are, a number in the locale's digits, a noun list joined as the language joins one. */
export type Param = string | number | readonly string[]

/** The placeholder names in a template literal type. */
export type Placeholders<S extends string> = S extends `${string}{${infer Name}}${infer Rest}`
  ? Name | Placeholders<Rest>
  : never

/** One message: a string when it has no placeholder, otherwise a function of exactly its names. */
type Filled<S extends string> = [Placeholders<S>] extends [never]
  ? string
  : (params: { readonly [Name in Placeholders<S>]: Param }) => string

/** A count group: `one` and `other`, or numbered keys and `other`. */
type CountGroup = { readonly other: string }
type IsCountGroup<T> = T extends CountGroup
  ? [Exclude<keyof T, 'other' | 'one'>] extends [`${number}`]
    ? true
    : [Exclude<keyof T, 'other' | 'one'>] extends [never]
      ? true
      : false
  : false

/** A count group's function: `{count}` is a number, and any other placeholder its forms use. */
type Counted<T> = (
  params: { readonly count: number } & {
    readonly [Name in Exclude<Placeholders<Extract<T[keyof T], string>>, 'count'>]: Param
  },
) => string

/** The page's API for a table shaped like `T`. `meta` passes through as data. */
export type Compiled<T> = T extends string
  ? Filled<T>
  : T extends readonly string[]
    ? { readonly [Index in keyof T]: T[Index] extends string ? Filled<T[Index]> : never }
    : IsCountGroup<T> extends true
      ? Counted<T>
      : { readonly [Key in keyof T]: Key extends 'meta' ? T[Key] : Compiled<T[Key]> }

/** The shape of a table with every message widened to `string`: what a translated table is typed against. */
export type Shape<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? { readonly [Index in keyof T]: Shape<T[Index]> }
    : { readonly [Key in keyof T]: Shape<T[Key]> }

/** The names a template's placeholders use, in order of first appearance. */
export function placeholdersOf(template: string): string[] {
  const names: string[] = []
  for (const match of template.matchAll(PLACEHOLDER)) {
    if (!names.includes(match[1]!)) names.push(match[1]!)
  }
  return names
}

/**
 * Whether an object is a count group: an `other` form, and otherwise only
 * `one` or numbered forms. Kept in step with {@link IsCountGroup}.
 */
export function isCountGroup(node: object): node is Readonly<Record<string, string>> {
  const keys = Object.keys(node)
  return (
    keys.includes('other') &&
    keys.every((key) => key === 'other' || key === 'one' || /^\d+$/.test(key)) &&
    Object.values(node).every((value) => typeof value === 'string')
  )
}

/** The writers a table's placeholders are filled with, for one locale. */
interface Writers {
  readonly number: (value: number) => string
  readonly list: (items: readonly string[]) => string
  readonly plural: (count: number) => string
}

function writersFor(locale: string): Writers {
  let rules: Intl.PluralRules | null = null
  try {
    rules = new Intl.PluralRules(locale)
  } catch {
    // No plural rules for this locale: one and other, the English way, below.
  }
  return {
    number: numberFormatter(locale),
    list: listFormatter(locale),
    plural: (count) => (rules ? rules.select(count) : count === 1 ? 'one' : 'other'),
  }
}

/**
 * A template with its placeholders filled. A placeholder with no value is
 * left as written, so a missing parameter shows as `{name}` on the page —
 * visible, and caught by the tests — rather than as "undefined".
 */
export function fill(template: string, params: Readonly<Record<string, Param>>, writers: Writers): string {
  return template.replace(PLACEHOLDER, (whole, name: string) => {
    const value = params[name]
    if (value === undefined) return whole
    if (typeof value === 'number') return writers.number(value)
    if (typeof value === 'string') return value
    return writers.list(value)
  })
}

function compileNode(node: unknown, writers: Writers): unknown {
  if (typeof node === 'string') {
    if (placeholdersOf(node).length === 0) return node
    return (params: Readonly<Record<string, Param>>) => fill(node, params, writers)
  }
  if (Array.isArray(node)) return node.map((item: unknown) => compileNode(item, writers))
  if (node !== null && typeof node === 'object') {
    if (isCountGroup(node)) {
      const forms = node
      return (params: Readonly<Record<string, Param>> & { readonly count: number }) => {
        const form = forms[String(params.count)] ?? forms[writers.plural(params.count)] ?? forms['other']!
        return fill(form, params, writers)
      }
    }
    const compiled: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(node)) compiled[key] = compileNode(value, writers)
    return compiled
  }
  return node
}

/**
 * The page's API for one table, its numbers, lists and plurals written in
 * the table's own `meta.locale`.
 *
 * @param table - A table shaped like English's; its `meta` is passed through.
 */
export function compile<T extends { readonly meta: { readonly locale: string } }>(
  table: Shape<T>,
  locale: string = table.meta.locale,
): Compiled<T> {
  const writers = writersFor(locale)
  const { meta, ...messages } = table as unknown as { meta: unknown } & Record<string, unknown>
  return { meta, ...(compileNode(messages, writers) as object) } as Compiled<T>
}
