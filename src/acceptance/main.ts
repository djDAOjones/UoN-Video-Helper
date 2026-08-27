/**
 * Entry point for the acceptance page.
 *
 * Development only — `vite.config.ts` builds `index.html` alone, so this never
 * reaches production.
 */

import '../styles/app.css'
import { APP_VERSION, BUILD_ID } from '../core/version'
import { runAcceptance, type Check } from './run'

const runButton = document.querySelector<HTMLButtonElement>('#run')
const statusLine = document.querySelector<HTMLParagraphElement>('#status')
const logElement = document.querySelector<HTMLPreElement>('#log')
const results = document.querySelector<HTMLDivElement>('#results')
const versionLine = document.querySelector<HTMLParagraphElement>('#version-line')

if (versionLine) versionLine.textContent = `${APP_VERSION} · ${BUILD_ID}`

const MARK: Record<Check['status'], string> = {
  pass: 'PASS',
  fail: 'FAIL',
  manual: 'NEEDS A PERSON',
  external: 'CHECKED ELSEWHERE',
}

function render(checks: readonly Check[], seconds: number): void {
  if (!results) return
  results.replaceChildren()

  const list = document.createElement('ul')
  list.className = 'checks'
  for (const check of checks) {
    const row = document.createElement('li')
    row.className = 'check'
    row.dataset['state'] = check.status === 'pass' ? 'pass' : check.status === 'fail' ? 'fail' : 'warn'
    row.innerHTML = '<span class="mark"></span><span></span><span class="value"></span>'
    const [mark, name, value] = row.children
    if (mark) mark.textContent = MARK[check.status]
    if (name) {
      const title = document.createElement('span')
      title.textContent = `§13.${check.criterion} — ${check.title}`
      const detail = document.createElement('span')
      detail.className = 'fact-note'
      detail.textContent = check.detail
      name.append(title, detail)
    }
    if (value) value.textContent = ''
    list.append(row)
  }
  results.append(list)

  // Counted separately, all four. A summary that folds "checked elsewhere"
  // into "passed" is the same false comfort the status was added to remove.
  const failed = checks.filter((c) => c.status === 'fail').length
  const manual = checks.filter((c) => c.status === 'manual').length
  const external = checks.filter((c) => c.status === 'external').length
  const summary = document.createElement('p')
  summary.className = 'verdict-detail'
  summary.textContent =
    `${checks.length - failed - manual - external} passed here, ${failed} failed, ` +
    `${manual} need a person, ${external} checked elsewhere. ${seconds.toFixed(1)} s.`
  results.append(summary)
}

runButton?.addEventListener('click', () => {
  runButton.disabled = true
  if (logElement) logElement.textContent = ''
  results?.replaceChildren()
  if (statusLine) statusLine.textContent = 'Running…'

  const log = (message: string): void => {
    if (logElement) logElement.textContent += `${message}\n`
  }

  void runAcceptance(log)
    .then((report) => {
      render(report.checks, report.seconds)
      const failed = report.checks.filter((c) => c.status === 'fail').length
      if (statusLine) {
        statusLine.textContent = failed === 0 ? 'Finished — nothing failed.' : `Finished — ${failed} failed.`
      }
    })
    .catch((cause: unknown) => {
      if (statusLine) statusLine.textContent = 'The run did not finish.'
      log(`ERROR: ${cause instanceof Error ? `${cause.message}\n${cause.stack ?? ''}` : String(cause)}`)
    })
    .finally(() => {
      runButton.disabled = false
    })
})
