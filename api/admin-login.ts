/**
 * /api/admin-login
 *   POST   { password } → set cookie sesi (HttpOnly, 12 jam)
 *   GET                 → 200 bila sesi valid, 401 bila tidak
 *   DELETE              → logout
 */
import { env, json, makeSession, safeEqual, sessionCookie, verifySession } from './_shared'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const password = env('ADMIN_PASSWORD')
  if (!password) return json({ error: 'ADMIN_PASSWORD belum diatur di Environment Variables Vercel' }, 503)

  if (req.method === 'GET') return (await verifySession(req)) ? json({ ok: true }) : json({ ok: false }, 401)

  if (req.method === 'DELETE') return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) })

  if (req.method === 'POST') {
    let body: { password?: unknown }
    try {
      body = (await req.json()) as { password?: unknown }
    } catch {
      return json({ ok: false }, 400)
    }
    const ok = typeof body.password === 'string' && body.password.length < 200 && safeEqual(body.password, password)
    if (!ok) {
      // perlambat percobaan tebak password
      await new Promise((r) => setTimeout(r, 700))
      return json({ ok: false }, 401)
    }
    return json({ ok: true }, 200, { 'set-cookie': sessionCookie(await makeSession()) })
  }
  return json({ error: 'method' }, 405)
}
