import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  APPROVED_BRANDING_PATHS,
  assessEgress,
  classifyEgressWebSocketControl,
  EGRESS_CONTROL_IDS,
  EGRESS_CONTROL_QUERY,
  EGRESS_PROBE_PATH,
  EGRESS_RUN_QUERY,
  formatEngineSummary,
  headersContainSensitiveMedia,
  isExactViteHmr,
  normalizeBidiRequest,
  normalizeCdpExtraHeaders,
  normalizeCdpRequest,
  normalizeCdpWebSocketFrame,
  normalizeCdpWebSocketHandshake,
  normalizeCdpWebSocketMetadata,
  parsePageTerminal,
  parseRunnerArgs,
  protocolReplyError,
  summarizeEngineResults,
  type EgressRecord,
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

  it('parses the egress watcher as an independent boolean flag', () => {
    expect(
      parseRunnerArgs(['/spike-egress.html', '--watch-egress', '--engines', 'chrome,firefox']),
    ).toEqual({
      positional: ['/spike-egress.html'],
      options: { 'watch-egress': true, engines: 'chrome,firefox' },
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

const BASE_URL = 'http://localhost:5173/spike-egress.html'
const PROBE_NONCE = '11223344-5566-4788-99aa-bbccddeeff00'

function controlUrl(control: string, extras: Record<string, string> = {}): string {
  const url = new URL(EGRESS_PROBE_PATH, BASE_URL)
  url.searchParams.set(EGRESS_CONTROL_QUERY, control)
  url.searchParams.set(EGRESS_RUN_QUERY, PROBE_NONCE)
  for (const [key, value] of Object.entries(extras)) url.searchParams.set(key, value)
  return url.href
}

function probeRecord(control: string, overrides: Partial<EgressRecord> = {}): EgressRecord {
  return {
    kind: 'request',
    method: 'GET',
    origin: 'http://localhost:5173',
    route: `control:${control}`,
    body: 'none',
    crossOrigin: false,
    control,
    sensitiveUrl: false,
    sensitiveHeader: false,
    wireHeaders: false,
    source: 'page',
    devInfrastructure: false,
    ...overrides,
  }
}

function completeProbeRecords(): EgressRecord[] {
  return EGRESS_CONTROL_IDS.map((control) => {
    if (
      ['request-body', 'page-fetch', 'xhr', 'worker-fetch', 'beacon', 'websocket-frame'].includes(
        control,
      )
    ) {
      return probeRecord(control, {
        method: control === 'websocket-frame' ? 'WS SEND' : 'POST',
        body: 'present',
        source: control === 'worker-fetch' ? 'worker' : 'page',
      })
    }
    if (control === 'raw-header-canary') {
      return probeRecord(control, { sensitiveHeader: true, wireHeaders: true })
    }
    if (control === 'websocket-handshake') {
      return probeRecord(control, {
        kind: 'websocket-handshake',
        method: 'WS CONNECT',
        sensitiveUrl: true,
        sensitiveHeader: true,
        wireHeaders: true,
      })
    }
    if (control === 'cross-origin') {
      return probeRecord(control, { origin: 'http://127.0.0.1:5173', crossOrigin: true })
    }
    if (control === 'url-canary') return probeRecord(control, { sensitiveUrl: true })
    if (control === 'header-canary') return probeRecord(control, { sensitiveHeader: true })
    throw new Error(`Unhandled control ${control}`)
  })
}

describe('protocol-level egress evidence', () => {
  it('keeps the observer allowlist in parity with the hash-reviewed public manifest', () => {
    const manifest = readFileSync(
      new URL('../scripts/check-placeholders.mjs', import.meta.url),
      'utf8',
    )
    const reviewedMediaPaths = [
      ...manifest.matchAll(/['"](public\/branding\/[^'"]+\.(?:mp4|webm))['"]/g),
    ]
      .map((match) => match[1]!.replace(/^public/, ''))
      .sort()

    expect([...APPROVED_BRANDING_PATHS].sort()).toEqual(reviewedMediaPaths)
  })

  it('normalises CDP request bodies without retaining URLs or headers', () => {
    const record = normalizeCdpRequest(
      {
        request: {
          url: 'http://localhost:5173/probe?filename=private-recording.mp4',
          method: 'POST',
          headers: { 'X-VH-Media-Width': '3840' },
          hasPostData: true,
          postData: 'must-never-be-retained',
        },
      },
      { baseUrl: BASE_URL, source: 'worker' },
    )

    expect(record).toMatchObject({
      body: 'present',
      origin: 'http://localhost:5173',
      route: '<redacted>',
      sensitiveUrl: true,
      sensitiveHeader: true,
      source: 'worker',
    })
    expect(JSON.stringify(record)).not.toContain('private-recording')
    expect(JSON.stringify(record)).not.toContain('must-never-be-retained')
  })

  it('uses Firefox BiDi bodySize for page and worker requests', () => {
    const page = normalizeBidiRequest(
      {
        request: {
          url: controlUrl('page-fetch'),
          method: 'POST',
          headers: [],
          bodySize: 13,
        },
      },
      { baseUrl: BASE_URL, source: 'page', probeNonce: PROBE_NONCE },
    )
    const worker = normalizeBidiRequest(
      {
        request: {
          url: controlUrl('worker-fetch'),
          method: 'POST',
          headers: [],
          bodySize: 15,
        },
      },
      { baseUrl: BASE_URL, source: 'unknown', probeNonce: PROBE_NONCE },
    )

    expect(page).toMatchObject({ control: 'page-fetch', body: 'present' })
    expect(worker).toMatchObject({ control: 'worker-fetch', body: 'present' })
  })

  it('detects filename and media-characteristic leaks without flagging approved branding paths', () => {
    const leaked = normalizeCdpRequest(
      {
        request: {
          url: 'http://localhost:5173/private-recording.mp4',
          method: 'GET',
          headers: { 'X-Debug': 'duration=123.4' },
          hasPostData: false,
        },
      },
      { baseUrl: BASE_URL },
    )
    const branding = normalizeCdpRequest(
      {
        request: {
          url: 'http://localhost:5173/branding/opening-1080p25.mp4',
          method: 'GET',
          headers: {},
          hasPostData: false,
        },
      },
      { baseUrl: BASE_URL },
    )

    expect(leaked).toMatchObject({ sensitiveUrl: true, sensitiveHeader: true })
    expect(branding).toMatchObject({ sensitiveUrl: false, sensitiveHeader: false })
    expect(JSON.stringify(leaked)).not.toContain('private-recording')
  })

  it('does not exempt an unapproved media filename merely because it is under branding', () => {
    const forged = normalizeCdpRequest(
      {
        request: {
          url: 'http://localhost:5173/branding/private-recording.mp4',
          method: 'GET',
          headers: {},
          hasPostData: false,
        },
      },
      { baseUrl: BASE_URL },
    )

    expect(forged).toMatchObject({ route: '<redacted>', sensitiveUrl: true })
    expect(JSON.stringify(forged)).not.toContain('private-recording')
  })

  it('detects alternate media extensions and characteristic key variants', () => {
    const record = normalizeCdpRequest(
      {
        request: {
          url: 'http://localhost:5173/private-recording.3gp?video_codec=avc1.640028&fps=60',
          method: 'GET',
          headers: { 'X-Debug': 'resolution=1920x1080' },
          hasPostData: false,
        },
      },
      { baseUrl: BASE_URL },
    )

    expect(record).toMatchObject({ sensitiveUrl: true, sensitiveHeader: true })
    expect(JSON.stringify(record)).not.toContain('private-recording')
    expect(JSON.stringify(record)).not.toContain('avc1')
  })

  it('does not confuse Vite TypeScript modules with MPEG transport-stream filenames', () => {
    const moduleRequest = normalizeCdpRequest(
      {
        request: {
          url: 'http://localhost:5173/src/workers/job.worker.ts?worker_file&type=module',
          method: 'GET',
          headers: { Referer: 'http://localhost:5173/src/main.ts' },
          hasPostData: false,
        },
      },
      { baseUrl: BASE_URL },
    )

    expect(moduleRequest).toMatchObject({ sensitiveUrl: false, sensitiveHeader: false })
  })

  it('classifies only the exact nonce-bound probe path and redacts collisions', () => {
    const wrongPath = normalizeCdpRequest(
      {
        request: {
          url: `http://localhost:5173/leak?${EGRESS_CONTROL_QUERY}=request-body&${EGRESS_RUN_QUERY}=${PROBE_NONCE}`,
          method: 'POST',
          headers: {},
          hasPostData: true,
        },
      },
      { baseUrl: BASE_URL, probeNonce: PROBE_NONCE },
    )
    const rawUnknown = normalizeCdpRequest(
      {
        request: {
          url: controlUrl('private-recording.mp4'),
          method: 'GET',
          headers: {},
          hasPostData: false,
        },
      },
      { baseUrl: BASE_URL, probeNonce: PROBE_NONCE },
    )

    expect(wrongPath).toMatchObject({ control: null, route: '<redacted>', body: 'present' })
    expect(rawUnknown).toMatchObject({ control: null, route: '<redacted>', sensitiveUrl: true })
    expect(JSON.stringify(rawUnknown)).not.toContain('private-recording')
    expect(assessEgress([wrongPath, rawUnknown, ...completeProbeRecords()]).passed).toBe(false)
  })

  it('exempts only the exact same-origin Vite HMR socket', () => {
    const exact = normalizeCdpWebSocketMetadata('ws://localhost:5173/?token=dev-token', {
      baseUrl: BASE_URL,
    })
    const wrongPath = normalizeCdpWebSocketMetadata(
      'ws://localhost:5173/application?token=dev-token',
      { baseUrl: BASE_URL },
    )
    const wrongOrigin = normalizeCdpWebSocketMetadata('ws://127.0.0.1:5173/?token=dev-token', {
      baseUrl: BASE_URL,
    })

    expect(isExactViteHmr(exact, { 'Sec-WebSocket-Protocol': 'vite-hmr' })).toBe(true)
    expect(isExactViteHmr(exact, { 'Sec-WebSocket-Protocol': 'application-data' })).toBe(false)
    expect(isExactViteHmr(wrongPath, { 'Sec-WebSocket-Protocol': 'vite-hmr' })).toBe(false)
    expect(isExactViteHmr(wrongOrigin, { 'Sec-WebSocket-Protocol': 'vite-hmr' })).toBe(false)
  })

  it('redacts the WebSocket path and token before retaining handshake metadata', () => {
    const metadata = normalizeCdpWebSocketMetadata('ws://localhost:5173/?token=private-dev-token', {
      baseUrl: BASE_URL,
      source: 'page',
    })

    expect(metadata).toEqual({
      origin: 'http://localhost:5173',
      crossOrigin: false,
      control: null,
      route: '<redacted>',
      sensitiveUrl: false,
      source: 'page',
      viteHmrEndpoint: true,
      devInfrastructure: false,
    })
    expect(JSON.stringify(metadata)).not.toContain('private-dev-token')
  })

  it('reduces only the reserved outgoing WebSocket frame to control metadata', () => {
    const payload = JSON.stringify({
      type: 'custom',
      event: 'vh-egress-control',
      data: {
        control: 'websocket-frame',
        run: PROBE_NONCE,
        canary: 'must-never-be-retained',
      },
    })
    const control = classifyEgressWebSocketControl(payload, PROBE_NONCE)
    const record = normalizeCdpWebSocketFrame(payload.length, {
      origin: 'http://localhost:5173',
      crossOrigin: false,
      devInfrastructure: true,
      control,
    })

    expect(control).toBe('websocket-frame')
    expect(record).toMatchObject({
      method: 'WS SEND',
      route: 'control:websocket-frame',
      body: 'present',
      control: 'websocket-frame',
      devInfrastructure: false,
    })
    expect(JSON.stringify(record)).not.toContain('must-never-be-retained')
    expect(
      classifyEgressWebSocketControl(
        JSON.stringify({
          type: 'custom',
          event: 'application-event',
          data: { control: 'websocket-frame', run: PROBE_NONCE },
        }),
        PROBE_NONCE,
      ),
    ).toBeNull()
  })

  it('retains only redacted WebSocket handshake findings and requires URL plus wire headers', () => {
    const metadata = normalizeCdpWebSocketMetadata(
      controlUrl('websocket-handshake', { 'vh-media-filename': 'private-recording.mp4' }).replace(
        'http:',
        'ws:',
      ),
      { baseUrl: BASE_URL, source: 'page', probeNonce: PROBE_NONCE },
    )
    const record = normalizeCdpWebSocketHandshake(metadata, {
      'Sec-WebSocket-Protocol': 'private-recording.mp4',
    })

    expect(record).toMatchObject({
      kind: 'websocket-handshake',
      control: 'websocket-handshake',
      sensitiveUrl: true,
      sensitiveHeader: true,
      wireHeaders: true,
    })
    expect(JSON.stringify(record)).not.toContain('private-recording')
  })

  it('accepts Firefox BiDi request evidence for the nonce-bound WebSocket handshake', () => {
    const handshake = normalizeBidiRequest(
      {
        request: {
          url: controlUrl('websocket-handshake', {
            'vh-media-filename': 'private-recording.mp4',
          }).replace('http:', 'ws:'),
          method: 'GET',
          headers: [
            { name: 'Sec-WebSocket-Protocol', value: { type: 'string', value: 'private.mp4' } },
          ],
          bodySize: 0,
        },
      },
      { baseUrl: BASE_URL, probeNonce: PROBE_NONCE },
    )
    const probes = completeProbeRecords().map((record) =>
      record.control === 'websocket-handshake' ? handshake : record,
    )

    expect(handshake).toMatchObject({
      kind: 'request',
      method: 'GET',
      control: 'websocket-handshake',
      sensitiveUrl: true,
      sensitiveHeader: true,
      wireHeaders: true,
    })
    expect(assessEgress(probes).passed).toBe(true)
  })

  it('reduces raw CDP headers without retaining cookie values', () => {
    const reduced = normalizeCdpExtraHeaders({
      headers: { Cookie: 'vh-egress-raw-header=private-recording.mp4' },
    })

    expect(reduced).toEqual({ sensitiveHeader: true, wireHeaders: true })
    expect(JSON.stringify(reduced)).not.toContain('private-recording')
    expect(headersContainSensitiveMedia({ Cookie: 'ordinary-session=value' })).toBe(false)
  })

  it('passes only when clean traffic is safe and every control is observed', () => {
    const clean = normalizeBidiRequest(
      {
        request: {
          url: 'http://localhost:5173/src/workers/job.worker.ts',
          method: 'GET',
          headers: [],
          bodySize: 0,
        },
      },
      { baseUrl: BASE_URL },
    )

    expect(assessEgress([clean, ...completeProbeRecords()])).toEqual({
      passed: true,
      cleanRecordCount: 1,
      probeRecordCount: EGRESS_CONTROL_IDS.length,
      findings: [],
      missingControls: [],
    })
  })

  it('fails when a negative control is absent or was not detected', () => {
    const probes = completeProbeRecords()
      .filter((record) => record.control !== 'worker-fetch')
      .map((record) => (record.control === 'xhr' ? { ...record, body: 'none' as const } : record))

    const result = assessEgress(probes)
    expect(result.passed).toBe(false)
    expect(result.missingControls).toEqual(['xhr', 'worker-fetch'])
  })

  it('does not let an ordinary header event impersonate the raw-header control', () => {
    const probes = completeProbeRecords().map((record) =>
      record.control === 'raw-header-canary' ? { ...record, wireHeaders: false } : record,
    )

    expect(assessEgress(probes).missingControls).toEqual(['raw-header-canary'])
  })

  it('fails clean traffic on bodies, unknown bodies, foreign origins and canaries', () => {
    const unsafe: EgressRecord[] = [
      probeRecord('unused', { control: null, route: '<redacted>', body: 'present' }),
      probeRecord('unused', {
        control: null,
        route: '<redacted>',
        method: 'POST',
        body: 'unknown',
      }),
      probeRecord('unused', {
        control: null,
        route: '<redacted>',
        origin: 'https://example.invalid',
        crossOrigin: true,
      }),
      probeRecord('unused', { control: null, route: '<redacted>', sensitiveUrl: true }),
      probeRecord('unused', { control: null, route: '<redacted>', sensitiveHeader: true }),
    ]

    const result = assessEgress([...unsafe, ...completeProbeRecords()])
    expect(result.passed).toBe(false)
    expect(result.findings).toHaveLength(5)
    expect(result.findings.every((finding) => finding.includes('/<redacted>:'))).toBe(true)
  })

  it('ignores only records already proved to be Vite development infrastructure', () => {
    const hmr = normalizeCdpWebSocketFrame(20, {
      origin: 'http://localhost:5173',
      crossOrigin: false,
      devInfrastructure: true,
    })
    const appSocket = normalizeCdpWebSocketFrame(20, {
      origin: 'http://localhost:5173',
      crossOrigin: false,
    })

    expect(assessEgress([hmr, ...completeProbeRecords()]).passed).toBe(true)
    expect(assessEgress([appSocket, ...completeProbeRecords()]).findings).toHaveLength(1)
  })

  it('rejects CDP and BiDi command errors without retaining their messages', () => {
    const cdp = protocolReplyError(
      { id: 1, error: { code: -32601, message: 'private-recording.mp4' } },
      'Network.enable',
    )
    const bidi = protocolReplyError(
      { id: 2, type: 'error', error: 'invalid argument', message: 'private-recording.mp4' },
      'session.subscribe',
    )

    expect(cdp?.message).toBe('Network.enable failed (-32601)')
    expect(bidi?.message).toBe('session.subscribe failed (invalid argument)')
    expect(protocolReplyError({ id: 3, result: {} }, 'Page.enable')).toBeNull()
    expect(`${cdp?.message}${bidi?.message}`).not.toContain('private-recording')
  })
})
