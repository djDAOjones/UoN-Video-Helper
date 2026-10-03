/**
 * What the page says after a save that was handed to the browser as a
 * download (spec 9.1 step 5, VH-113, A-04).
 *
 * A download is not a completed write: the browser may still be fetching
 * it. The sentence says so, and names where the file lands as far as the
 * page can know — on an iPhone or iPad that is the Files app, under
 * Downloads, which a first-time user has no reason to guess. Pure, so the
 * wording is tested in Node and read by the gate.
 */

import { t } from '../i18n'

/** Where a download lands, as far as the user agent tells. */
export type DownloadDestination = 'ios' | 'other'

/**
 * Reads where a download will land from the user agent.
 *
 * Safari on an iPad asks for desktop sites by default and calls itself a
 * Macintosh, so the name alone misses it (Codex review): a Mac with a touch
 * screen is an iPad.
 */
export function downloadDestinationFor(userAgent: string, maxTouchPoints = 0): DownloadDestination {
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'ios'
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1 ? 'ios' : 'other'
}

/** The status line for a download handed to the browser. */
export function downloadStatusText(destination: DownloadDestination): string {
  const { save } = t()
  return save.download({ where: destination === 'ios' ? save.downloadIos : save.downloadOther })
}
