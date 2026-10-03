/**
 * The static page's words, bound to the table (VH-105).
 *
 * `index.html` keeps its English as the no-script fallback and marks each
 * leaf that the table owns: `data-i18n="trim.intro"` for an element's text,
 * `data-i18n-attr="aria-label:closing.helpLabel"` for an attribute. Applying
 * the current table writes the words in place — the elements, their ids and
 * their listeners stay exactly where they were, which is what lets the
 * language change under a video, a trim and a running job without
 * disturbing any of them.
 *
 * `messageAt` is pure and tested; `applyStaticText` needs a DOM and is
 * checked in the browser.
 */

import { t, type Messages } from './index'

/** The string at a dotted key in a table, or `undefined` for a key that is not a string. */
export function messageAt(messages: Messages, key: string): string | undefined {
  let node: unknown = messages
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : undefined
}

/** Every static binding under `root`: the key, and whether it is text or an attribute. */
export function staticBindings(root: ParentNode): Array<{ readonly key: string; readonly attribute: string | null }> {
  const bindings: Array<{ key: string; attribute: string | null }> = []
  for (const element of root.querySelectorAll<HTMLElement>('[data-i18n]')) {
    bindings.push({ key: element.dataset['i18n'] ?? '', attribute: null })
  }
  for (const element of root.querySelectorAll<HTMLElement>('[data-i18n-attr]')) {
    for (const [attribute, key] of attributeBindings(element.dataset['i18nAttr'] ?? '')) {
      bindings.push({ key, attribute })
    }
  }
  return bindings
}

/** `"aria-label:closing.helpLabel content:app.description"` as pairs. */
export function attributeBindings(spec: string): Array<readonly [string, string]> {
  return spec
    .split(/\s+/)
    .filter((pair) => pair.includes(':'))
    .map((pair) => {
      const at = pair.indexOf(':')
      return [pair.slice(0, at), pair.slice(at + 1)] as const
    })
}

/** Writes the current table's words into every bound element and attribute under `root`. */
export function applyStaticText(root: ParentNode): void {
  const messages = t()
  for (const element of root.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const text = messageAt(messages, element.dataset['i18n'] ?? '')
    if (text !== undefined) element.textContent = text
  }
  for (const element of root.querySelectorAll<HTMLElement>('[data-i18n-attr]')) {
    for (const [attribute, key] of attributeBindings(element.dataset['i18nAttr'] ?? '')) {
      const text = messageAt(messages, key)
      if (text !== undefined) element.setAttribute(attribute, text)
    }
  }
}
