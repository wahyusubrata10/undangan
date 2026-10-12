/**
 * Halaman utama "/" (via rewrite di vercel.json): HTML undangan + meta OG berisi nama tamu.
 * WhatsApp/Instagram tidak menjalankan JavaScript, jadi meta harus dari server.
 * Bila ada kendala apa pun → alihkan ke /app.html (halaman statis) agar undangan TETAP terbuka.
 */
import { injectMeta, metaFor } from './_meta'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const publicUrl = new URL(`/${url.search}`, url.origin)
  const fallback = () => Response.redirect(new URL(`/app.html${url.search}`, url.origin).toString(), 307)
  try {
    const res = await fetch(new URL('/app.html', url.origin), { headers: { accept: 'text/html' } })
    const ctype = res.headers.get('content-type') || ''
    if (!res.ok || !ctype.includes('text/html')) return fallback()
    const html = injectMeta(await res.text(), metaFor(publicUrl.toString()))
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
      },
    })
  } catch {
    return fallback()
  }
}
