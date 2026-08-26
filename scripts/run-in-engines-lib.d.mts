export type EngineResult = 'completed' | 'skipped' | 'failed'
export type PageResult = 'pass' | 'fail' | 'informational'

export interface PageTerminal {
  readonly finished: boolean
  readonly result: PageResult | null
}

export interface EngineSummary {
  completed: number
  skipped: number
  failed: number
  requested: number
  exitCode: 0 | 1
}

export function parseRunnerArgs(argv: readonly string[]): {
  positional: string[]
  options: Record<string, string | true>
}

export function parsePageTerminal(text: string): PageTerminal

export function summarizeEngineResults(
  results: readonly EngineResult[],
  requireAll?: boolean,
): EngineSummary

export function formatEngineSummary(summary: EngineSummary): string
