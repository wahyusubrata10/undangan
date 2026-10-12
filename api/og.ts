/**
 * GET /api/og?to=Nama&sapaan=Bapak/Ibu → gambar preview 1200×630 untuk WhatsApp/Instagram.
 * Gapura candi bentar emas + nama mempelai + "Kepada Yth. <nama tamu>".
 */
import { ImageResponse } from '@vercel/og'
import type { ReactElement } from 'react'
import { wedding } from '../src/config/wedding'
import { parseGuest } from '../src/lib/guest'
import { candiBentarHalf } from '../src/ornaments/geometry'

export const config = { runtime: 'edge' }

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } }
const h = (type: string, props: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { ...props, children: children.length <= 1 ? children[0] : children },
})

const GOLD = '#e9c97a'
const GOLD_DIM = '#b8954a'

function gateSvg(): string {
  const g = candiBentarHalf()
  const half = (flip: boolean) =>
    `<g ${flip ? `transform="translate(${g.W * 2} 0) scale(-1 1)"` : ''}>
      <path d="${g.d}" fill="#2a0709" stroke="${GOLD}" stroke-width="2" stroke-opacity=".8"/>
      <path d="${g.ledges}" stroke="${GOLD}" stroke-width="1.6" fill="none" stroke-opacity=".9"/>
      <path d="${g.flames}" fill="${GOLD}" fill-opacity=".9"/>
    </g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W * 2} ${g.H}">${half(false)}${half(true)}</svg>`
}

function text(v: unknown): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object') return (v as Record<string, string>).id ?? Object.values(v as Record<string, string>)[0] ?? ''
  return ''
}

let fontsP: Promise<[ArrayBuffer, ArrayBuffer]> | null = null

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const guest = parseGuest(url.searchParams, '', '')
  const a = wedding.order === 'bride-first' ? wedding.bride : wedding.groom
  const b = wedding.order === 'bride-first' ? wedding.groom : wedding.bride
  const ev = wedding.events[0]
  const d = ev ? new Date(ev.start) : null
  const date = d
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Makassar' }).format(d).replace(/\//g, ' · ')
    : ''

  fontsP ??= Promise.all([
    fetch(new URL('/og/cormorant-500-italic.woff', url)).then((r) => r.arrayBuffer()),
    fetch(new URL('/og/cinzel-400.woff', url)).then((r) => r.arrayBuffer()),
  ])
  let fonts: { name: string; data: ArrayBuffer; style: 'normal' | 'italic'; weight: 400 | 500 }[] = []
  try {
    const [corm, cinzel] = await fontsP
    fonts = [
      { name: 'Cormorant', data: corm, style: 'italic', weight: 500 },
      { name: 'Cinzel', data: cinzel, style: 'normal', weight: 400 },
    ]
  } catch {
    fontsP = null
  }

  const gate = `data:image/svg+xml;base64,${btoa(gateSvg())}`

  const tree = h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background: 'radial-gradient(70% 90% at 50% 100%, #5a1a12 0%, #2a0709 45%, #0b0807 100%)',
        fontFamily: 'Cinzel',
        color: GOLD,
      },
    },
    // bingkai emas
    h('div', { style: { position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, border: `1.5px solid ${GOLD_DIM}`, borderRadius: 18, display: 'flex' } }),
    h('div', { style: { position: 'absolute', top: 34, left: 34, right: 34, bottom: 34, border: `1px solid rgba(201,162,75,.35)`, borderRadius: 12, display: 'flex' } }),
    // gapura di kiri & kanan
    h('img', { src: gate, width: 300, height: 409, style: { position: 'absolute', left: 40, bottom: 34, opacity: 0.55 } }),
    h('img', { src: gate, width: 300, height: 409, style: { position: 'absolute', right: 40, bottom: 34, opacity: 0.55 } }),
    // cahaya tengah
    h('div', { style: { position: 'absolute', left: 300, top: 60, width: 600, height: 520, borderRadius: 300, background: 'radial-gradient(circle, rgba(241,213,138,.18), transparent 70%)', display: 'flex' } }),
    h(
      'div',
      { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' } },
      h('div', { style: { fontSize: 22, letterSpacing: 12, color: GOLD_DIM } }, text(wedding.eventTitle).toUpperCase()),
      h(
        'div',
        { style: { fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 128, lineHeight: 1.05, marginTop: 6, color: GOLD, display: 'flex', alignItems: 'center' } },
        a.nick,
        h('span', { style: { fontFamily: 'Cinzel', fontStyle: 'normal', fontSize: 54, margin: '0 26px', color: '#f7e3a3' } }, '&'),
        b.nick,
      ),
      h('div', { style: { fontSize: 26, letterSpacing: 10, marginTop: 4, color: '#cdbf9f' } }, date),
      h('div', { style: { width: 220, height: 1, background: GOLD_DIM, marginTop: 30, marginBottom: 26, display: 'flex' } }),
      guest.personalized
        ? h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
            h('div', { style: { fontSize: 20, letterSpacing: 6, color: '#cdbf9f' } }, `KEPADA YTH. ${guest.salutation ? guest.salutation.toUpperCase() : ''}`.trim()),
            h('div', { style: { fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 58, color: '#f3e9d2', marginTop: 6, maxWidth: 820 } }, guest.name),
          )
        : h('div', { style: { fontSize: 22, letterSpacing: 6, color: '#cdbf9f' } }, 'OM SWASTYASTU'),
    ),
  )

  return new ImageResponse(tree as unknown as ReactElement, {
    width: 1200,
    height: 630,
    fonts: fonts.length ? fonts : undefined,
    headers: { 'cache-control': 'public, max-age=86400, s-maxage=604800, immutable' },
  })
}
