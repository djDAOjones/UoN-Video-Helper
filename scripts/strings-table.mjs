#!/usr/bin/env node
/**
 * Writes the zh-Hans and ms-MY tables for VH-105 from a filled translator's
 * sheet: one `src/i18n/<tag>.ts` per language column, English's keys in
 * English's order, each with its own `meta`.
 *
 *   node scripts/strings-table.mjs [filled sheet .csv]
 *
 * With no argument it reads `FILLED_SHEET` from `src/i18n/sheet.ts`, the
 * sheet `tables.test.ts` holds the tables to. A sheet with a blank or
 * missing row writes nothing; a broken placeholder is left for the tests to
 * name. Formatted with the project's Prettier, so a regenerated table diffs
 * only where its words changed.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { format, resolveConfig } from 'prettier'
import { runnerImport } from 'vite'

const { module: sheet } = await runnerImport('/src/i18n/sheet.ts', { logLevel: 'error' })
const source = process.argv[2] ?? sheet.FILLED_SHEET
const cells = sheet.parseCsv(readFileSync(source, 'utf8'))

/** `zh-Hans` → `zhHans`, as `en-GB` is `enGB`. */
const exportName = (tag) => tag.replace(/-(.)/g, (_dash, letter) => letter.toUpperCase())

const tables = sheet.SHEET_LANGUAGES.map(({ tag, heading, meta }) => {
  const { table, missing } = sheet.tableFrom(sheet.translationsFrom(cells, heading), meta)
  if (missing.length > 0) {
    console.error(`${heading}: ${missing.length} rows blank or missing, first ${missing[0]}`)
    process.exitCode = 1
  }
  return { tag, heading, table }
})
if (process.exitCode) process.exit()

for (const { tag, heading, table } of tables) {
  const path = `src/i18n/${tag}.ts`
  const text = `/**
 * Every string the page can show (VH-105), from the "${heading}"
 * column of the filled translator's sheet:
 *
 *   ${source}
 *
 * Written by \`scripts/strings-table.mjs\`: change the sheet and regenerate,
 * never this file. Machine translation, with the agent's repairs listed in
 * the sheet's last column, until a native-speaking reviewer signs it off.
 */

import type { Messages } from './index'

export const ${exportName(tag)}: Messages = ${JSON.stringify(table, null, 2)}
`
  const options = { ...(await resolveConfig(path)), filepath: path }
  writeFileSync(path, await format(text, options))
  console.log(`${path}: ${sheet.messagesOf(table).length} messages`)
}
