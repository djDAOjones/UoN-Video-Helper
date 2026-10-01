/**
 * Carbon's inline notification, the one treatment on this page for anything
 * worth knowing (VH-124): the device verdict, the sound and output notes,
 * what the new file will not carry, a failure, a captured error, the
 * finished video and the question before it is discarded. Five anatomies
 * became this one, so the eye learns one shape.
 *
 * Anatomy: a rail in the status colour, a title, body paragraphs, or a list
 * of titled items, then any closing paragraphs. The kind is never carried by
 * colour alone — the title says the thing — and the title names the region
 * for assistive technology.
 */

export type NotificationKind = 'info' | 'success' | 'warning' | 'error'

/** One of several things worth knowing, with its own title. */
export interface NotificationItem {
  readonly title: string
  readonly detail: string
}

export interface NotificationContent {
  readonly kind: NotificationKind
  readonly title: string
  /** Paragraphs after the title. */
  readonly lines?: readonly string[]
  /** Titled items, each on its own, after the lines. */
  readonly items?: readonly NotificationItem[]
  /** Paragraphs after the items: a reassurance, a next step. */
  readonly tail?: readonly string[]
}

let nextId = 0

/**
 * Builds a notification. The caller places it; nothing is announced here —
 * each live region says what its panel shows through its own spoken tail
 * (VH-111).
 *
 * @param id - The element's id, where a caller needs to find it again.
 *   Otherwise one is generated for the title's `aria-labelledby`.
 */
export function notification(content: NotificationContent, id?: string): HTMLElement {
  const section = document.createElement('section')
  section.className = 'notification'
  section.dataset['kind'] = content.kind
  if (id) section.id = id

  const title = document.createElement('p')
  title.className = 'notification-title'
  title.id = `${id ?? 'notification'}-title-${++nextId}`
  title.textContent = content.title
  section.setAttribute('aria-labelledby', title.id)
  section.append(title)

  for (const line of content.lines ?? []) section.append(body(line))

  if (content.items && content.items.length > 0) {
    const list = document.createElement('ul')
    list.className = 'notification-list'
    for (const entry of content.items) {
      const item = document.createElement('li')
      const itemTitle = document.createElement('p')
      itemTitle.className = 'notification-item-title'
      itemTitle.textContent = entry.title
      item.append(itemTitle, body(entry.detail))
      list.append(item)
    }
    section.append(list)
  }

  for (const line of content.tail ?? []) section.append(body(line))
  return section
}

/** A body paragraph of a notification. */
export function body(text: string): HTMLParagraphElement {
  const paragraph = document.createElement('p')
  paragraph.className = 'notification-body'
  paragraph.textContent = text
  return paragraph
}
