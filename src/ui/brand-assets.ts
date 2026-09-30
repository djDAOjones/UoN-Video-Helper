/**
 * Brand assets that are wanted and may not be in the repository (VH-92).
 *
 * The logo is a trademark the maintainer has to supply, and Lora is a font
 * file nobody has added yet. Rather than fail the build on a missing import,
 * or ship a broken image, each is looked up by name at BUILD time:
 * `import.meta.glob` yields an empty object when nothing matches, so the page
 * is complete without them and picks them up, with no code change, the day
 * the file is dropped into `src/assets/`.
 *
 * Both go through the module graph rather than `public/`, because the Xerte
 * package turns `public/` off and must stay one flat folder — a hashed asset
 * beside `index.html` is flat; a copied folder is not.
 */

/** The white-out logo, for the blue header band. `{}` when the file is absent. */
const logoUrls = import.meta.glob<string>('../assets/uon-logo-white.{svg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** Lora Bold, for headings. `{}` when the file is absent. */
const loraUrls = import.meta.glob<string>('../assets/lora-bold.woff2', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** The first URL a glob found, or `null` when it found nothing. */
function firstUrl(found: Record<string, string>): string | null {
  return Object.values(found)[0] ?? null
}

/**
 * Puts the logo in the header and registers the heading font, where each
 * exists.
 *
 * @param header - The blue header band. The logo becomes its first child, so
 *   it sits top-left, as the brand requires.
 * @returns What was found, for the boot log — a missing asset should be
 *   legible in a diagnostics bundle rather than noticed by eye.
 */
export function installBrandAssets(header: HTMLElement): { logo: boolean; headingFont: boolean } {
  const logoUrl = firstUrl(logoUrls)
  if (logoUrl) {
    const logo = document.createElement('img')
    logo.className = 'brand-logo'
    logo.src = logoUrl
    // The brand's name for itself. Not "logo": a screen reader should hear
    // whose page this is, not that there is a picture on it.
    logo.alt = 'University of Nottingham'
    header.prepend(logo)
  }

  const loraUrl = firstUrl(loraUrls)
  if (loraUrl && 'fonts' in document) {
    // `swap`: headings are readable in Georgia at once and change face when
    // the file arrives, rather than being invisible until it does.
    const lora = new FontFace('Lora', `url(${JSON.stringify(loraUrl)}) format('woff2')`, {
      weight: '700',
      style: 'normal',
      display: 'swap',
    })
    document.fonts.add(lora)
    // A font that fails to load leaves Georgia in place, which is the design.
    void lora.load().catch(() => undefined)
  }

  return { logo: logoUrl !== null, headingFont: loraUrl !== null }
}
