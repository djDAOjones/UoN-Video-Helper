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

/** Where a download lands, as far as the user agent tells. */
export type DownloadDestination = 'ios' | 'other'

/** Reads where a download will land from the user agent string. */
export function downloadDestinationFor(userAgent: string): DownloadDestination {
  return /iPhone|iPad|iPod/.test(userAgent) ? 'ios' : 'other'
}

/** The status line for a download handed to the browser. */
export function downloadStatusText(destination: DownloadDestination): string {
  const where =
    destination === 'ios'
      ? 'Saving to the Files app, under Downloads'
      : 'Saving to your downloads folder'
  return (
    `${where} — the browser may still be finishing it. Once it is there, upload it where it is ` +
    'going, or choose another video in step 1. The video stays here until you start another one.'
  )
}
