// A minimal Chrome DevTools Protocol client over Node's own WebSocket.
// VH-198: CDP_PORT names another headless Chrome than :9222's, so a pass can
// run beside one an older session left running.
export async function connectBrowser(port = Number(process.env.CDP_PORT ?? 9222)) {
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
  const ws = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = (e) => reject(new Error('websocket error ' + (e.message ?? '')))
  })
  let nextId = 0
  const pending = new Map()
  const listeners = new Map()
  // A closed socket fails every pending call, so a walk errors rather than the
  // process draining its event loop and exiting 0 mid-run (VH-172's smoke).
  let closed = null
  ws.onclose = (e) => {
    closed = `websocket closed (code ${e.code}${e.reason ? ', ' + e.reason : ''})`
    console.error('cdp: ' + closed)
    for (const p of pending.values()) p.reject(new Error(`${p.method}: ${closed}`))
    pending.clear()
  }
  ws.onmessage = (event) => {
    const m = JSON.parse(event.data)
    if (m.id) {
      const p = pending.get(m.id)
      pending.delete(m.id)
      if (!p) return
      if (m.error) p.reject(new Error(`${p.method}: ${m.error.message}`))
      else p.resolve(m.result)
      return
    }
    const key = (m.sessionId ?? '') + '|' + m.method
    for (const fn of listeners.get(key) ?? []) fn(m.params)
  }
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      if (closed) return reject(new Error(`${method}: ${closed}`))
      const id = ++nextId
      pending.set(id, { resolve, reject, method })
      ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }))
    })
  const on = (sessionId, method, fn) => {
    const key = (sessionId ?? '') + '|' + method
    if (!listeners.has(key)) listeners.set(key, new Set())
    listeners.get(key).add(fn)
    return () => listeners.get(key).delete(fn)
  }
  async function newPage() {
    const { browserContextId } = await send('Target.createBrowserContext', {})
    const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId })
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
    const page = {
      sessionId,
      targetId,
      contextId: browserContextId,
      send: (method, params) => send(method, params, sessionId),
      on: (method, fn) => on(sessionId, method, fn),
      once: (method, predicate = () => true) =>
        new Promise((resolve) => {
          const off = on(sessionId, method, (params) => {
            if (predicate(params)) {
              off()
              resolve(params)
            }
          })
        }),
      async evaluate(expression) {
        const r = await send(
          'Runtime.evaluate',
          { expression, returnByValue: true, awaitPromise: true },
          sessionId,
        )
        if (r.exceptionDetails) {
          throw new Error(
            'evaluate failed: ' +
              (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text) +
              ' in ' +
              expression.slice(0, 120),
          )
        }
        return r.result.value
      },
      async close() {
        try {
          await send('Target.closeTarget', { targetId })
        } catch { /* already closed */ }
        try {
          await send('Target.disposeBrowserContext', { browserContextId })
        } catch { /* already closed */ }
      },
    }
    return page
  }
  return { send, on, newPage, close: () => ws.close(), version }
}
