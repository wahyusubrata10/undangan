/**
 * Vercel Routing Middleware: sisipkan meta OG (judul dengan nama tamu + gambar /api/og)
 * ke HTML halaman utama. WhatsApp/Instagram tidak menjalankan JavaScript, jadi meta
 * harus sudah ada di HTML dari server.
 */
import { injectMeta, metaFor } from './api/_meta'

export const config = { matcher: ['/'] }

export default async function middleware(request: Request): Promise<Response | undefined> {
  if (request.method !== 'GET') return undefined
  try {
    const res = await fetch(new URL('/index.html', request.url), { headers: { accept: 'text/html' } })
    if (!res.ok) return undefined
    const html = injectMeta(await res.text(), metaFor(request.url))
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // cache di CDN per URL (per tamu) sebentar saja agar perubahan konten cepat tampil
        'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
      },
    })
  } catch {
    return undefined // lanjutkan ke file statis biasa
  }
}
