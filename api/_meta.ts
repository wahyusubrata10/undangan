import { wedding } from '../src/config/wedding'
import { escapeHtml, parseGuest } from '../src/lib/guest'

function text(v: unknown): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object') return (v as Record<string, string>).id ?? Object.values(v as Record<string, string>)[0] ?? ''
  return ''
}

export interface PageMeta {
  title: string
  description: string
  image: string
  url: string
}

/** Meta preview untuk link undangan (judul memuat nama tamu bila ada ?to=). */
export function metaFor(requestUrl: string): PageMeta {
  const url = new URL(requestUrl)
  const guest = parseGuest(url.searchParams, '', '')
  const couple = `${wedding.groom.nick} & ${wedding.bride.nick}`
  const ev = wedding.events[0]
  const date = ev
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Makassar' }).format(new Date(ev.start)).replace(/\//g, '.')
    : ''
  const base = `${text(wedding.eventTitle)} ${couple}`
  const og = new URL('/api/og', url.origin)
  if (guest.personalized) {
    og.searchParams.set('to', guest.name)
    if (guest.salutation) og.searchParams.set('sapaan', guest.salutation)
  }
  return {
    title: guest.personalized ? `Kepada Yth. ${guest.salutation ? guest.salutation + ' ' : ''}${guest.name} — Undangan ${base}` : `Undangan ${base}${date ? ` · ${date}` : ''}`,
    description: text(wedding.meta.description),
    image: og.toString(),
    url: url.toString(),
  }
}

const setMeta = (html: string, attr: 'property' | 'name', key: string, value: string) => {
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[.:]/g, '\\$&')}"\\s+content="[^"]*"\\s*/?>`, 'i')
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

export function injectMeta(html: string, m: PageMeta): string {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(m.title)}</title>`)
  out = setMeta(out, 'name', 'description', m.description)
  out = setMeta(out, 'property', 'og:title', m.title)
  out = setMeta(out, 'property', 'og:description', m.description)
  out = setMeta(out, 'property', 'og:image', m.image)
  out = setMeta(out, 'property', 'og:url', m.url)
  out = setMeta(out, 'name', 'twitter:title', m.title)
  out = setMeta(out, 'name', 'twitter:image', m.image)
  return out
}
