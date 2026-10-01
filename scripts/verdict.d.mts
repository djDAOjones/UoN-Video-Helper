/** Types for `verdict.mjs`, so the TypeScript spike pages and tests can import it. */

export type Verdict =
  | { readonly kind: 'pass' }
  | { readonly kind: 'fail'; readonly failures: number }
  | { readonly kind: 'missing' }

export function verdictLine(failures: number): string

export function readVerdict(text: string): Verdict
