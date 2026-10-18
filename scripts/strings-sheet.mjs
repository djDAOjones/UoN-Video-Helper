#!/usr/bin/env node
/**
 * Writes the translator's sheet for VH-105: every message the page can show,
 * one row each, as `.csv` and `.xlsx`, with an instructions sheet in the
 * workbook and the same instructions as a `.txt` beside the CSV.
 *
 *   node scripts/strings-sheet.mjs reviews/2026-10-18
 *
 * The rows come from `src/i18n/sheet.ts`, loaded through Vite's module
 * runner, so the sheet is the table and cannot drift from it. The workbook
 * is written by hand — a zip of a few XML parts, stored uncompressed — so
 * the sheet costs no dependency (the profile's one-dependency rule).
 */

import { Buffer } from 'node:buffer'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { crc32 } from 'node:zlib'
import { runnerImport } from 'vite'

const outDir = process.argv[2]
if (!outDir) {
  console.error('usage: node scripts/strings-sheet.mjs <output folder>')
  process.exit(1)
}

const { module: sheet } = await runnerImport('/src/i18n/sheet.ts', { logLevel: 'error' })
const cells = sheet.sheetCells()
const [zh, ms] = sheet.SHEET_LANGUAGES

const INSTRUCTIONS = [
  'How to fill this sheet',
  '',
  'There is one row for every piece of text the UoN Video Helper page can show or read out.',
  `Translate only the English column (C), into the "${zh.heading}" column (E) and the "${ms.heading}" column (F).`,
  'Do not change the key (column A). It is how each translation finds its place on the page.',
  'Keep every {placeholder} exactly as written, braces and all, for example {count} or {size}. The page puts a number or a name there. You may move a placeholder within the sentence to suit your language.',
  'Some messages have a row for each choice, for example blue and white, fade and slide, or one and other. Translate every row, even where your language uses the same words.',
  'Columns B and D say where the text shows and what to watch for. They do not need translating.',
  '',
  'Machine translation',
  `In Google Sheets, put =GOOGLETRANSLATE(C2,"en","${zh.googleCode}") in E2 and =GOOGLETRANSLATE(C2,"en","${ms.googleCode}") in F2, then fill each formula down its column. Before sending the sheet back, copy columns E and F and use Paste special, Values only, so the translations stay as text.`,
  'ChatGPT can take the .csv file whole: ask it to fill the last two columns, keeping the key column and every {placeholder} unchanged, and to return the file as .csv.',
  '',
  'Sending it back',
  'Send the filled sheet back as .csv (easiest), or as .xlsx. A native speaker at each campus will check the translations later.',
]

const csvPath = join(outDir, 'VH-105-strings.csv')
const xlsxPath = join(outDir, 'VH-105-strings.xlsx')
const txtPath = join(outDir, 'VH-105-strings-instructions.txt')
mkdirSync(outDir, { recursive: true })
writeFileSync(csvPath, sheet.toCsv(cells))
writeFileSync(txtPath, `${INSTRUCTIONS.join('\n')}\n`)
writeFileSync(xlsxPath, workbook([
  { name: 'Strings', rows: cells, widths: [34, 34, 60, 50, 50, 50], header: true },
  { name: 'Instructions', rows: INSTRUCTIONS.map((line) => [line]), widths: [120], header: false },
]))
console.log(`${cells.length - 1} rows → ${csvPath}, ${xlsxPath}, ${txtPath}`)

/** XML text, escaped. */
function xml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** A column letter for a zero-based index. */
function column(index) {
  let name = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name
  return name
}

/** One worksheet: inline strings, wrapped text, the header row bold and frozen. */
function worksheet({ rows, widths, header }) {
  const cols = widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
  const body = rows.map((row, r) => {
    const style = header && r === 0 ? 1 : 2
    const cellsXml = row.map((text, c) =>
      `<c r="${column(c)}${r + 1}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xml(text)}</t></is></c>`)
    return `<row r="${r + 1}">${cellsXml.join('')}</row>`
  })
  const pane = header
    ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
    : ''
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${pane}<cols>${cols.join('')}</cols><sheetData>${body.join('')}</sheetData></worksheet>`
}

/** The workbook's parts, zipped. */
function workbook(sheets) {
  const parts = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs></styleSheet>`,
  }
  sheets.forEach((s, i) => { parts[`xl/worksheets/sheet${i + 1}.xml`] = worksheet(s) })
  return zip(parts)
}

/** A zip of stored (uncompressed) entries: local headers, then the central directory. */
function zip(files) {
  const locals = []
  const central = []
  let offset = 0
  for (const [name, text] of Object.entries(files)) {
    const data = Buffer.from(text, 'utf8')
    const nameBytes = Buffer.from(name, 'utf8')
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // UTF-8 names
    local.writeUInt16LE(0, 8) // stored
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBytes.length, 26)
    locals.push(local, nameBytes, data)
    const entry = Buffer.alloc(46)
    entry.writeUInt32LE(0x02014b50, 0)
    entry.writeUInt16LE(20, 4)
    entry.writeUInt16LE(20, 6)
    entry.writeUInt16LE(0x0800, 8)
    entry.writeUInt32LE(crc, 16)
    entry.writeUInt32LE(data.length, 20)
    entry.writeUInt32LE(data.length, 24)
    entry.writeUInt16LE(nameBytes.length, 28)
    entry.writeUInt32LE(offset, 42)
    central.push(entry, nameBytes)
    offset += local.length + nameBytes.length + data.length
  }
  const directory = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(Object.keys(files).length, 8)
  end.writeUInt16LE(Object.keys(files).length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, directory, end])
}
