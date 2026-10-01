/**
 * The line every spike page ends on, and the runner reading only that (VH-102).
 *
 * `scripts/run-in-engines.mjs` used to read verdict words out of a page's
 * prose, and a source named "lecture FAIL — retake.mp4" sat where a verdict
 * goes. Now the runner reads one line and the prose cannot reach it. The pages
 * themselves need a browser; what is pinned here is the contract between them
 * and the runner, and that every page keeps it.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readVerdict, verdictLine } from '../scripts/verdict.mjs'

/** A page's log as the runner reads it: prose, the verdict, the sentinel. */
const log = (...lines: string[]): string => lines.join('\n')

describe('verdictLine', () => {
  it('says ALL PASS for nothing counted, and the count otherwise', () => {
    expect(verdictLine(0)).toBe('ALL PASS')
    expect(verdictLine(1)).toBe('1 FAILURE(S)')
    expect(verdictLine(12)).toBe('12 FAILURE(S)')
  })

  it('is read back as what it says', () => {
    expect(readVerdict(log('prose', '', verdictLine(0), '', 'done'))).toEqual({ kind: 'pass' })
    expect(readVerdict(log('prose', '', verdictLine(3), '', 'done'))).toEqual({
      kind: 'fail',
      failures: 3,
    })
  })
})

describe('readVerdict', () => {
  it('passes a run whose source is named like a verdict', () => {
    // The VH-26 review's fourth pass: this name in a verdict position failed a
    // run that passed.
    const text = log(
      'file: /samples/lecture FAIL — retake.mp4',
      '  lecture FAIL — retake.mp4  FAIL',
      'ERROR — in a name, not a verdict',
      '',
      'ALL PASS',
      '',
      'done',
    )
    expect(readVerdict(text)).toEqual({ kind: 'pass' })
  })

  it('fails a run that says ALL PASS anywhere but last', () => {
    // A name can say ALL PASS too; only the closing line counts.
    const text = log('file: ALL PASS.mp4', '', '2 FAILURE(S)', '', 'done')
    expect(readVerdict(text)).toEqual({ kind: 'fail', failures: 2 })
  })

  it('finds no verdict on a page that ends without the line', () => {
    expect(readVerdict(log('  PASS — something', '', 'done'))).toEqual({ kind: 'missing' })
    // Prose after the verdict means the verdict is not the closing line.
    expect(readVerdict(log('ALL PASS', 'one more thing', 'done'))).toEqual({ kind: 'missing' })
    // A count of nothing is not a line any page prints.
    expect(readVerdict(log('0 FAILURE(S)', 'done'))).toEqual({ kind: 'missing' })
  })

  it('finds no verdict on a page that never reached done', () => {
    expect(readVerdict(log('ALL PASS'))).toEqual({ kind: 'missing' })
    expect(readVerdict('')).toEqual({ kind: 'missing' })
  })
})

describe('the spike pages', () => {
  const pages = readdirSync(new URL('..', import.meta.url)).filter((name) =>
    /^spike-.*\.html$/.test(name),
  )

  it('are the eleven the runner is pointed at', () => {
    expect(pages).toHaveLength(11)
  })

  for (const page of pages) {
    it(`${page} ends on the verdict line, then done`, () => {
      const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8')
      const script = /<script type="module" src="\/(src\/spike\/[^"]+\.ts)"><\/script>/.exec(
        html,
      )?.[1]
      expect(script, 'the page loads a spike script').toBeDefined()
      const source = readFileSync(new URL(`../${script!}`, import.meta.url), 'utf8')
      expect(source).toContain("import { verdictLine } from '../../scripts/verdict.mjs'")
      // The last two things the page says, in this order and nothing after.
      expect(source.trimEnd()).toMatch(/say\(`\\n\$\{verdictLine\([^)]*\)\}`\)\nsay\('\\ndone'\)$/)
    })
  }
})
