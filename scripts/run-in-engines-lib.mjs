/**
 * Parses the small command line accepted by the cross-engine runner.
 * Boolean flags remain booleans instead of consuming the next option.
 */
export function parseRunnerArgs(argv) {
  const positional = []
  const options = {}
  const booleanOptions = new Set(['require-all', 'watch-egress'])

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (!arg.startsWith('--')) {
      positional.push(arg)
      continue
    }

    const equalsAt = arg.indexOf('=')
    if (equalsAt !== -1) {
      options[arg.slice(2, equalsAt)] = arg.slice(equalsAt + 1)
      continue
    }

    const name = arg.slice(2)
    if (booleanOptions.has(name)) {
      options[name] = true
      continue
    }
    const next = argv[index + 1]
    if (next !== undefined && !next.startsWith('--')) {
      options[name] = next
      index++
    } else {
      options[name] = true
    }
  }

  return { positional, options }
}

/** Query key reserved by the dev-only egress rehearsal. */
export const EGRESS_CONTROL_QUERY = 'vh-egress-control'
/** Per-run nonce key which prevents ordinary application traffic becoming a probe. */
export const EGRESS_RUN_QUERY = 'vh-egress-run'
/** The only endpoint whose requests may be classified as deliberate controls. */
export const EGRESS_PROBE_PATH = '/__vh_egress_probe__'

/** Every deliberate violation the protocol observer must prove it can see. */
export const EGRESS_CONTROL_IDS = [
  'request-body',
  'page-fetch',
  'xhr',
  'worker-fetch',
  'beacon',
  'cross-origin',
  'url-canary',
  'header-canary',
  'raw-header-canary',
  'websocket-handshake',
  'websocket-frame',
]

const EGRESS_CONTROL_ID_SET = new Set(EGRESS_CONTROL_IDS)

const BODY_CONTROLS = new Set([
  'request-body',
  'page-fetch',
  'xhr',
  'worker-fetch',
  'beacon',
  'websocket-frame',
])
const SENSITIVE_FIELD_NAMES = new Set([
  'file',
  'file-name',
  'filename',
  'file-size',
  'filesize',
  'size',
  'duration',
  'width',
  'height',
  'resolution',
  'rotation',
  'aspect-ratio',
  'frame-rate',
  'framerate',
  'fps',
  'bitrate',
  'video-bitrate',
  'audio-bitrate',
  'codec',
  'video-codec',
  'audio-codec',
  'channels',
  'channel-count',
  'sample-rate',
  'samplerate',
  'lufs',
  'true-peak',
  'vh-media-filename',
  'vh-media-width',
])
const MEDIA_FILENAME =
  /\.(?:3g2|3gp|aac|ac3|aiff|amr|avi|caf|dv|f4v|flac|flv|m2ts|m2v|m4a|m4v|mkv|mov|mp3|mp4|mpeg|mpg|mts|mxf|oga|ogg|ogv|opus|ts|vob|wav|webm|wma|wmv)(?:$|[/?&#\s])/i
const MEDIA_CHARACTERISTIC =
  /(?:aspect[-_ ]?ratio|bitrate|channels?|codec|duration|file[-_ ]?size|fps|frame[-_ ]?rate|height|lufs|resolution|rotation|sample[-_ ]?rate|size|true[-_ ]?peak|width)\s*[=:]\s*[^\s,;]+/i

function canonicalFieldName(name) {
  return String(name).toLowerCase().replaceAll('_', '-')
}

function isSensitiveFieldName(name) {
  const canonical = canonicalFieldName(name)
  const withoutCommonPrefix = canonical.replace(/^(?:x-vh-media-|x-vh-|x-media-|x-)/, '')
  return (
    SENSITIVE_FIELD_NAMES.has(canonical) ||
    SENSITIVE_FIELD_NAMES.has(withoutCommonPrefix) ||
    canonical.startsWith('x-vh-media-')
  )
}

function headerEntries(headers) {
  if (Array.isArray(headers)) {
    return headers.map((header) => {
      const raw = header?.value
      const value = raw && typeof raw === 'object' ? raw.value : raw
      return [String(header?.name ?? '').toLowerCase(), String(value ?? '')]
    })
  }
  if (headers && typeof headers === 'object') {
    return Object.entries(headers).map(([name, value]) => [name.toLowerCase(), String(value)])
  }
  return []
}

function canonicalOrigin(url, baseUrl) {
  try {
    const parsed = new URL(url, baseUrl)
    if (parsed.protocol === 'ws:') parsed.protocol = 'http:'
    if (parsed.protocol === 'wss:') parsed.protocol = 'https:'
    return parsed.origin
  } catch {
    return null
  }
}

/** Runtime branding URLs duplicated from the hash-reviewed public manifest. */
export const APPROVED_BRANDING_PATHS = [
  '/branding/closing-onset-fade-blue-1080p.webm',
  '/branding/closing-onset-fade-blue-2160p.webm',
  '/branding/closing-onset-fade-white-1080p.webm',
  '/branding/closing-onset-fade-white-2160p.webm',
  '/branding/closing-onset-slide-blue-1080p.webm',
  '/branding/closing-onset-slide-blue-2160p.webm',
  '/branding/closing-onset-slide-white-1080p.webm',
  '/branding/closing-onset-slide-white-2160p.webm',
  '/branding/closing-tail-blue-1080p.mp4',
  '/branding/closing-tail-blue-2160p.mp4',
  '/branding/closing-tail-white-1080p.mp4',
  '/branding/closing-tail-white-2160p.mp4',
  '/branding/opening-1080p25.mp4',
  '/branding/opening-1080p30.mp4',
  '/branding/opening-2160p25.mp4',
  '/branding/opening-2160p30.mp4',
]
const APPROVED_BRANDING_PATH_SET = new Set(APPROVED_BRANDING_PATHS)

function isApprovedBrandingPath(pathname) {
  return APPROVED_BRANDING_PATH_SET.has(pathname)
}

function isViteTypeScriptModule(value) {
  try {
    const parsed = new URL(value)
    return parsed.pathname.startsWith('/src/') && parsed.pathname.endsWith('.ts')
  } catch {
    return value.startsWith('/src/') && value.endsWith('.ts')
  }
}

function containsSensitiveFilename(value) {
  return MEDIA_FILENAME.test(value) && !isViteTypeScriptModule(value)
}

/** Reduces headers to the one privacy fact the rehearsal needs to retain. */
export function headersContainSensitiveMedia(headers) {
  return headerEntries(headers).some(
    ([name, value]) =>
      isSensitiveFieldName(name) ||
      containsSensitiveFilename(value) ||
      MEDIA_CHARACTERISTIC.test(value),
  )
}

function requestFacts(url, headers, baseUrl, probeNonce = null) {
  let parsed = null
  try {
    parsed = new URL(url, baseUrl)
  } catch {
    // An invalid URL is retained as a finding without retaining the value.
  }

  const requestedControl = parsed?.searchParams.get(EGRESS_CONTROL_QUERY) ?? null
  const requestedNonce = parsed?.searchParams.get(EGRESS_RUN_QUERY) ?? null
  const control =
    parsed?.pathname === EGRESS_PROBE_PATH &&
    probeNonce !== null &&
    requestedNonce === probeNonce &&
    requestedControl !== null &&
    EGRESS_CONTROL_ID_SET.has(requestedControl)
      ? requestedControl
      : null
  const pathnameContainsFilename =
    parsed !== null &&
    !isApprovedBrandingPath(parsed.pathname) &&
    containsSensitiveFilename(parsed.pathname)
  const queryContainsMedia =
    parsed !== null &&
    [...parsed.searchParams].some(
      ([key, value]) =>
        isSensitiveFieldName(key) ||
        containsSensitiveFilename(value) ||
        MEDIA_CHARACTERISTIC.test(value),
    )
  const sensitiveUrl = parsed === null || pathnameContainsFilename || queryContainsMedia
  const sensitiveHeader = headersContainSensitiveMedia(headers)
  const origin = canonicalOrigin(url, baseUrl)

  return {
    control,
    crossOrigin: origin === null || origin !== canonicalOrigin(baseUrl, baseUrl),
    origin,
    route: control === null ? '<redacted>' : `control:${control}`,
    sensitiveHeader,
    sensitiveUrl,
  }
}

function bodyFromMethod(method, explicitState) {
  if (explicitState !== null) return explicitState
  return method === 'GET' || method === 'HEAD' ? 'none' : 'unknown'
}

/**
 * Normalises one CDP `Network.requestWillBeSent` event without retaining its
 * URL, headers or body. `hasPostData` is deliberately enough: retrieving post
 * data would turn the safety instrument into another holder of sensitive data.
 */
export function normalizeCdpRequest(params, { baseUrl, source = 'unknown', probeNonce = null }) {
  const request = params?.request ?? {}
  const method = String(request.method ?? 'UNKNOWN').toUpperCase()
  const facts = requestFacts(String(request.url ?? ''), request.headers, baseUrl, probeNonce)
  const contentLength = Number(
    headerEntries(request.headers).find(([name]) => name === 'content-length')?.[1] ?? Number.NaN,
  )
  const explicitBody =
    request.hasPostData === true || (Number.isFinite(contentLength) && contentLength > 0)
      ? 'present'
      : request.hasPostData === false
        ? 'none'
        : null

  return {
    kind: 'request',
    method,
    origin: facts.origin,
    route: facts.route,
    body: bodyFromMethod(method, explicitBody),
    crossOrigin: facts.crossOrigin,
    control: facts.control,
    sensitiveUrl: facts.sensitiveUrl,
    sensitiveHeader: facts.sensitiveHeader,
    wireHeaders: false,
    source,
    devInfrastructure: false,
  }
}

/** Normalises one WebDriver BiDi `network.beforeRequestSent` event. */
export function normalizeBidiRequest(params, { baseUrl, source = 'unknown', probeNonce = null }) {
  const request = params?.request ?? {}
  const method = String(request.method ?? 'UNKNOWN').toUpperCase()
  const facts = requestFacts(String(request.url ?? ''), request.headers, baseUrl, probeNonce)
  const size = request.bodySize
  const explicitBody = typeof size === 'number' ? (size > 0 ? 'present' : 'none') : null

  return {
    kind: 'request',
    method,
    origin: facts.origin,
    route: facts.route,
    body: bodyFromMethod(method, explicitBody),
    crossOrigin: facts.crossOrigin,
    control: facts.control,
    sensitiveUrl: facts.sensitiveUrl,
    sensitiveHeader: facts.sensitiveHeader,
    wireHeaders: true,
    source,
    devInfrastructure: false,
  }
}

/** Reduces CDP's raw on-wire header event without retaining a header or cookie value. */
export function normalizeCdpExtraHeaders(params) {
  return {
    sensitiveHeader: headersContainSensitiveMedia(params?.headers),
    wireHeaders: true,
  }
}

function isViteHmrEndpoint(url, baseUrl) {
  try {
    const parsed = new URL(url, baseUrl)
    const query = [...parsed.searchParams]
    return (
      canonicalOrigin(parsed.href, baseUrl) === canonicalOrigin(baseUrl, baseUrl) &&
      parsed.pathname === '/' &&
      parsed.hash === '' &&
      query.length === 1 &&
      query[0]?.[0] === 'token' &&
      query[0][1].length > 0
    )
  } catch {
    return false
  }
}

/**
 * Redacts a CDP WebSocket URL as soon as `webSocketCreated` arrives. The exact
 * Vite endpoint is reduced to a boolean; raw paths and tokens are never kept.
 */
export function normalizeCdpWebSocketMetadata(
  url,
  { baseUrl, source = 'unknown', probeNonce = null },
) {
  const request = normalizeCdpRequest(
    { request: { url, method: 'GET', headers: {}, hasPostData: false } },
    { baseUrl, source, probeNonce },
  )
  return {
    origin: request.origin,
    crossOrigin: request.crossOrigin,
    control: request.control,
    route: request.route,
    sensitiveUrl: request.sensitiveUrl,
    source: request.source,
    viteHmrEndpoint: isViteHmrEndpoint(url, baseUrl),
    devInfrastructure: false,
  }
}

/** Creates the redacted record assessed even when a socket never sends a frame. */
export function normalizeCdpWebSocketHandshake(metadata, headers = null) {
  return {
    kind: 'websocket-handshake',
    method: 'WS CONNECT',
    origin: metadata.origin,
    route: metadata.route,
    body: 'none',
    crossOrigin: metadata.crossOrigin,
    control: metadata.control,
    sensitiveUrl: metadata.sensitiveUrl,
    sensitiveHeader: headers !== null && headersContainSensitiveMedia(headers),
    wireHeaders: headers !== null,
    source: metadata.source,
    devInfrastructure: metadata.devInfrastructure,
  }
}

/**
 * Identifies only Vite's own same-origin HMR socket. A broad same-origin
 * WebSocket exemption would hide exactly the future regression this watcher
 * exists to catch.
 */
export function isExactViteHmr(metadata, headers) {
  const entries = headerEntries(headers)
  const protocol = entries.find(([name]) => name === 'sec-websocket-protocol')?.[1]
  return metadata.viteHmrEndpoint === true && protocol === 'vite-hmr'
}

/**
 * Recognises only the dev spike's exact Vite custom-event frame. The payload
 * is inspected transiently and reduced to a control id; callers never retain
 * its content.
 */
export function classifyEgressWebSocketControl(payload, probeNonce = null) {
  if (typeof payload !== 'string') return null
  try {
    const parsed = JSON.parse(payload)
    return parsed?.type === 'custom' &&
      parsed.event === EGRESS_CONTROL_QUERY &&
      parsed.data?.control === 'websocket-frame' &&
      probeNonce !== null &&
      parsed.data?.run === probeNonce
      ? 'websocket-frame'
      : null
  } catch {
    return null
  }
}

/** Creates a redacted record for one outgoing CDP WebSocket frame. */
export function normalizeCdpWebSocketFrame(
  payloadLength,
  {
    origin = null,
    crossOrigin = true,
    source = 'unknown',
    devInfrastructure = false,
    control = null,
  } = {},
) {
  return {
    kind: 'websocket-frame',
    method: 'WS SEND',
    origin,
    route: control === null ? '<redacted>' : `control:${control}`,
    body: payloadLength > 0 ? 'present' : 'none',
    crossOrigin,
    control,
    sensitiveUrl: false,
    sensitiveHeader: false,
    wireHeaders: true,
    source,
    devInfrastructure: control === null && devInfrastructure,
  }
}

/**
 * Fails closed on clean-phase bodies, foreign origins and canaries, and also
 * proves that every deliberate violation reached the protocol observer.
 */
export function assessEgress(records) {
  const clean = records.filter((record) => record.control === null && !record.devInfrastructure)
  const probes = records.filter((record) => record.control !== null)
  const findings = []

  for (const record of clean) {
    const label = `${record.method} ${record.origin ?? '<invalid-origin>'}/${record.route}`
    if (record.body === 'present') findings.push(`${label}: outbound body`)
    if (record.body === 'unknown') findings.push(`${label}: body presence unknown`)
    if (record.crossOrigin) findings.push(`${label}: foreign origin`)
    if (record.sensitiveUrl) findings.push(`${label}: filename or media data in URL`)
    if (record.sensitiveHeader) findings.push(`${label}: filename or media data in header`)
  }

  const missingControls = EGRESS_CONTROL_IDS.filter((id) => {
    const matching = probes.filter((record) => record.control === id)
    if (matching.length === 0) return true
    if (BODY_CONTROLS.has(id)) return !matching.some((record) => record.body === 'present')
    if (id === 'cross-origin') return !matching.some((record) => record.crossOrigin)
    if (id === 'url-canary') return !matching.some((record) => record.sensitiveUrl)
    if (id === 'header-canary') return !matching.some((record) => record.sensitiveHeader)
    if (id === 'raw-header-canary') {
      return !matching.some((record) => record.sensitiveHeader && record.wireHeaders)
    }
    if (id === 'websocket-handshake') {
      return !matching.some(
        (record) =>
          (record.kind === 'websocket-handshake' ||
            (record.kind === 'request' && record.method === 'GET')) &&
          record.sensitiveUrl &&
          record.sensitiveHeader &&
          record.wireHeaders,
      )
    }
    return false
  })

  return {
    passed: findings.length === 0 && missingControls.length === 0,
    cleanRecordCount: clean.length,
    probeRecordCount: probes.length,
    findings,
    missingControls,
  }
}

/** Converts CDP and BiDi command-error replies into a bounded, redacted error. */
export function protocolReplyError(message, method) {
  if (!message || typeof message !== 'object') return null
  const isBidiError = message.type === 'error'
  const cdpError =
    message.error && typeof message.error === 'object' && !Array.isArray(message.error)
      ? message.error
      : null
  if (!isBidiError && cdpError === null) return null

  const code = isBidiError ? String(message.error ?? 'unknown') : String(cdpError.code ?? 'unknown')
  return new Error(`${method} failed (${code})`)
}

const RESULT_LINE = /^result: (pass|fail|informational)$/
const FAILURE_MARKER = /(?:^|\s)(?:FAIL|ERROR)(?:\s|$|—)/
const PASS_MARKER = /(?:^|\s)PASS(?:\s|$|—)/

/**
 * Parses the exact terminal protocol emitted by a spike page.
 *
 * New pages put `result: pass|fail|informational` immediately before an exact
 * `done` line. Existing assertion pages are kept honest while they migrate:
 * their exact `ALL PASS` / `N FAILURE(S)` summaries and uppercase PASS/FAIL
 * markers are recognised rather than treated as successful completion.
 */
export function parsePageTerminal(text) {
  const lines = text.replaceAll('\r\n', '\n').trimEnd().split('\n')
  if (lines.at(-1) !== 'done') return { finished: false, result: null }

  lines.pop()
  while (lines.at(-1)?.trim() === '') lines.pop()
  const terminalLine = lines.at(-1)?.trim() ?? ''
  const explicit = RESULT_LINE.exec(terminalLine)
  if (explicit) return { finished: true, result: explicit[1] }
  if (terminalLine === 'ALL PASS') return { finished: true, result: 'pass' }
  if (/^\d+ FAILURE\(S\)$/.test(terminalLine)) return { finished: true, result: 'fail' }

  const trimmed = lines.map((line) => line.trim())
  if (trimmed.some((line) => FAILURE_MARKER.test(line))) {
    return { finished: true, result: 'fail' }
  }
  if (trimmed.some((line) => PASS_MARKER.test(line))) {
    return { finished: true, result: 'pass' }
  }
  return { finished: true, result: 'informational' }
}

/**
 * Produces an honest matrix tally and exit status.
 * A missing browser remains a skip unless the caller requested a strict run.
 */
export function summarizeEngineResults(results, requireAll = false) {
  const completed = results.filter((result) => result === 'completed').length
  const skipped = results.filter((result) => result === 'skipped').length
  const failed = results.filter((result) => result === 'failed').length

  return {
    completed,
    skipped,
    failed,
    requested: results.length,
    exitCode: failed > 0 || (requireAll && skipped > 0) ? 1 : 0,
  }
}

/** Formats the final line so completed, skipped and failed cannot be conflated. */
export function formatEngineSummary(summary) {
  return `${summary.completed} completed, ${summary.skipped} skipped, ${summary.failed} failed (${summary.requested} requested)`
}
