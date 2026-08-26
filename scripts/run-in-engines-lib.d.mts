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

export type EgressBodyState = 'none' | 'present' | 'unknown'
export type EgressSource = 'page' | 'worker' | 'unknown'

export interface EgressRecord {
  readonly kind: 'request' | 'websocket-handshake' | 'websocket-frame'
  readonly method: string
  readonly origin: string | null
  readonly route: string
  readonly body: EgressBodyState
  readonly crossOrigin: boolean
  readonly control: string | null
  readonly sensitiveUrl: boolean
  readonly sensitiveHeader: boolean
  readonly wireHeaders: boolean
  readonly source: EgressSource
  readonly devInfrastructure: boolean
}

export interface EgressAssessment {
  readonly passed: boolean
  readonly cleanRecordCount: number
  readonly probeRecordCount: number
  readonly findings: string[]
  readonly missingControls: string[]
}

export interface EgressSocketMetadata {
  readonly origin: string | null
  readonly crossOrigin: boolean
  readonly control: string | null
  readonly route: string
  readonly sensitiveUrl: boolean
  readonly source: EgressSource
  readonly viteHmrEndpoint: boolean
  readonly devInfrastructure: boolean
}

export const EGRESS_CONTROL_QUERY: string
export const EGRESS_RUN_QUERY: string
export const EGRESS_PROBE_PATH: string
export const EGRESS_CONTROL_IDS: readonly string[]
export const APPROVED_BRANDING_PATHS: readonly string[]

export function parseRunnerArgs(argv: readonly string[]): {
  positional: string[]
  options: Record<string, string | true>
}

export function normalizeCdpRequest(
  params: unknown,
  options: {
    readonly baseUrl: string
    readonly source?: EgressSource
    readonly probeNonce?: string | null
  },
): EgressRecord

export function normalizeBidiRequest(
  params: unknown,
  options: {
    readonly baseUrl: string
    readonly source?: EgressSource
    readonly probeNonce?: string | null
  },
): EgressRecord

export function headersContainSensitiveMedia(headers: unknown): boolean

export function normalizeCdpExtraHeaders(params: unknown): {
  readonly sensitiveHeader: boolean
  readonly wireHeaders: true
}

export function normalizeCdpWebSocketMetadata(
  url: string,
  options: {
    readonly baseUrl: string
    readonly source?: EgressSource
    readonly probeNonce?: string | null
  },
): EgressSocketMetadata

export function normalizeCdpWebSocketHandshake(
  metadata: EgressSocketMetadata,
  headers?: unknown,
): EgressRecord

export function isExactViteHmr(metadata: EgressSocketMetadata, headers: unknown): boolean

export function classifyEgressWebSocketControl(
  payload: unknown,
  probeNonce?: string | null,
): string | null

export function normalizeCdpWebSocketFrame(
  payloadLength: number,
  options?: {
    readonly origin?: string | null
    readonly crossOrigin?: boolean
    readonly source?: EgressSource
    readonly devInfrastructure?: boolean
    readonly control?: string | null
  },
): EgressRecord

export function assessEgress(records: readonly EgressRecord[]): EgressAssessment

export function protocolReplyError(message: unknown, method: string): Error | null

export function parsePageTerminal(text: string): PageTerminal

export function summarizeEngineResults(
  results: readonly EngineResult[],
  requireAll?: boolean,
): EngineSummary

export function formatEngineSummary(summary: EngineSummary): string
