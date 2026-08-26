import { describe, expect, it } from 'vitest'

import {
  formatEngineSummary,
  parsePageTerminal,
  parseRunnerArgs,
  summarizeEngineResults,
} from '../scripts/run-in-engines-lib.mjs'

describe('cross-engine runner accounting', () => {
  it('parses a boolean flag without consuming the following option', () => {
    expect(
      parseRunnerArgs(['/spike-alpha.html', '--require-all', '--engines', 'chrome,firefox']),
    ).toEqual({
      positional: ['/spike-alpha.html'],
      options: { 'require-all': true, engines: 'chrome,firefox' },
    })
  })

  it('does not consume a following positional page as a boolean flag value', () => {
    expect(parseRunnerArgs(['--require-all', '/spike-alpha.html'])).toEqual({
      positional: ['/spike-alpha.html'],
      options: { 'require-all': true },
    })
  })

  it('reports skips separately without failing the default policy', () => {
    const summary = summarizeEngineResults(['completed', 'skipped', 'completed'])

    expect(summary).toEqual({
      completed: 2,
      skipped: 1,
      failed: 0,
      requested: 3,
      exitCode: 0,
    })
    expect(formatEngineSummary(summary)).toBe('2 completed, 1 skipped, 0 failed (3 requested)')
  })

  it('fails a strict matrix when any requested engine is skipped', () => {
    expect(summarizeEngineResults(['completed', 'skipped'], true).exitCode).toBe(1)
  })

  it('fails whenever an engine run fails', () => {
    expect(summarizeEngineResults(['completed', 'failed']).exitCode).toBe(1)
  })

  it('requires an exact done line rather than any text ending in done', () => {
    expect(parsePageTerminal('still not done')).toEqual({ finished: false, result: null })
    expect(parsePageTerminal('result: pass\ndone')).toEqual({ finished: true, result: 'pass' })
  })

  it('parses explicit pass, fail and informational terminal results', () => {
    expect(parsePageTerminal('result: pass\ndone').result).toBe('pass')
    expect(parsePageTerminal('result: fail\ndone').result).toBe('fail')
    expect(parsePageTerminal('result: informational\ndone').result).toBe('informational')
  })

  it('does not treat an existing failure summary followed by done as completion', () => {
    const terminal = parsePageTerminal('3 FAILURE(S)\ndone')
    const engineResult = terminal.result === 'fail' ? 'failed' : 'completed'

    expect(terminal).toEqual({ finished: true, result: 'fail' })
    expect(summarizeEngineResults([engineResult], true).exitCode).toBe(1)
  })

  it('recognises legacy assertion markers until pages emit an explicit result', () => {
    expect(parsePageTerminal('loudness on target PASS\ntrue peak too high FAIL\ndone').result).toBe(
      'fail',
    )
    expect(parsePageTerminal('PASS — plausible frame rate\ndone').result).toBe('pass')
    expect(parsePageTerminal('measured codec support\ndone').result).toBe('informational')
  })
})
