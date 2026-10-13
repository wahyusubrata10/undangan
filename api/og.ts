/**
 * GET /api/og?to=Nama&sapaan=Bapak/Ibu → gambar preview 1200×630 untuk WhatsApp/Instagram.
 * Tema malam: latar coklat kehitaman, cahaya bulan, candi bentar bergaris prada,
 * nama mempelai emas + "Kepada Yth. <nama tamu>".
 */
import { ImageResponse } from '@vercel/og'
import type { ReactElement } from 'react'
import { wedding } from '../src/config/wedding'
import { parseGuest } from '../src/lib/guest'
import { candiBaliParts } from '../src/ornaments/geometry'

export const config = { runtime: 'edge' }

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } }
const h = (type: string, props: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { ...props, children: children.length <= 1 ? children[0] : children },
})

const INK = '#f2e6cd'
const GOLD = '#c9a55c'
const GOLD_SOFT = '#e7d09b'
const SOFT = '#cdbb98'

function gateSvg(): string {
  const { W, H, parts } = candiBaliParts()
  // sama dengan CandiBali (versi malam): garis ukiran emas, bata & paras gelap
  const nightFill: Record<string, string> = { '#cbbda5': GOLD, '#d6c08f': GOLD_SOFT }
  const fillOf = (f?: string) => (f === 'brick' ? 'url(#br)' : f === 'paras' ? 'url(#pr)' : f === 'parasDark' ? '#2e2419' : f === 'shadow' ? 'url(#sd)' : f ? (nightFill[f] ?? f) : 'none')
  const strokeOf = (s: string) => (s === '#9b5a43' ? '#5a3323' : GOLD)
  const body = parts
    .map((p) => `<path d="${p.d}" fill="${fillOf(p.fill)}"${p.stroke ? ` stroke="${strokeOf(p.stroke)}" stroke-opacity=".85" stroke-width="${p.sw ?? 1}"` : ''}${p.opacity != null ? ` opacity="${p.opacity}"` : ''} stroke-linecap="round" stroke-linejoin="round"/>`)
    .join('')
  const defs = `<defs><pattern id="br" width="22" height="10" patternUnits="userSpaceOnUse"><rect width="22" height="10" fill="#5a3022"/><path d="M0 9.5 H22 M11 0 V4.5 M0 4.5 H22 M0 4.5 V9.5 M22 4.5 V9.5" stroke="#2a160e" stroke-width=".9"/></pattern><linearGradient id="pr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b4b39"/><stop offset=".55" stop-color="#3b3024"/><stop offset="1" stop-color="#261e16"/></linearGradient><linearGradient id="sd" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * 2} ${H}">${defs}<g>${body}</g><g transform="translate(${W * 2} 0) scale(-1 1)">${body}</g></svg>`
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
        background: 'linear-gradient(180deg, #0b0807 0%, #15100b 60%, #1f160e 100%)',
        fontFamily: 'Cinzel',
        color: INK,
      },
    },
    // bingkai emas ganda
    h('div', { style: { position: 'absolute', top: 22, left: 22, right: 22, bottom: 22, border: `1.5px solid rgba(201,165,92,.7)`, display: 'flex' } }),
    h('div', { style: { position: 'absolute', top: 32, left: 32, right: 32, bottom: 32, border: `1px solid rgba(201,165,92,.3)`, display: 'flex' } }),
    // gapura di kiri & kanan
    h('img', { src: gate, width: 220, height: 300, style: { position: 'absolute', left: 50, bottom: 28 } }),
    h('img', { src: gate, width: 220, height: 300, style: { position: 'absolute', right: 50, bottom: 28 } }),
    // cahaya bulan di tengah
    h('div', { style: { position: 'absolute', left: 260, top: 20, width: 680, height: 600, borderRadius: 340, background: 'radial-gradient(circle, rgba(201,165,92,.28), rgba(201,165,92,0) 68%)', display: 'flex' } }),
    h(
      'div',
      { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' } },
      h('div', { style: { fontSize: 20, letterSpacing: 12, color: GOLD } }, text(wedding.eventTitle).toUpperCase()),
      h(
        'div',
        { style: { fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 128, lineHeight: 1.05, marginTop: 6, color: GOLD_SOFT, display: 'flex', alignItems: 'center' } },
        a.nick,
        h('span', { style: { fontFamily: 'Cinzel', fontStyle: 'normal', fontSize: 54, margin: '0 26px', color: GOLD } }, '&'),
        b.nick,
      ),
      h('div', { style: { fontSize: 26, letterSpacing: 10, marginTop: 4, color: SOFT } }, date),
      h('div', { style: { width: 220, height: 1, background: GOLD, marginTop: 30, marginBottom: 26, display: 'flex' } }),
      guest.personalized
        ? h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
            h('div', { style: { fontSize: 20, letterSpacing: 6, color: GOLD } }, `KEPADA YTH. ${guest.salutation ? guest.salutation.toUpperCase() : ''}`.trim()),
            h('div', { style: { fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 58, color: INK, marginTop: 6, maxWidth: 820 } }, guest.name),
          )
        : h('div', { style: { fontSize: 22, letterSpacing: 6, color: GOLD } }, 'OM SWASTYASTU'),
    ),
  )

  return new ImageResponse(tree as unknown as ReactElement, {
    width: 1200,
    height: 630,
    fonts: fonts.length ? fonts : undefined,
    headers: { 'cache-control': 'public, max-age=86400, s-maxage=604800, immutable' },
  })
}
