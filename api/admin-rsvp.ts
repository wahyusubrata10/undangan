/**
 * /api/admin-rsvp (butuh sesi admin)
 *   GET            → semua RSVP (untuk tabel & export CSV di /admin)
 *   DELETE ?id=…   → hapus ucapan (moderasi spam)
 */
import { json, supabase, verifySession } from './_shared'
import { redis } from './_redis'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (!(await verifySession(req))) return json({ error: 'unauthorized' }, 401)
  const db = supabase()
  if (!db) {
    const kv = redis()
    if (!kv) return json({ error: 'Database belum dihubungkan (Vercel → Storage → Upstash Redis)', items: [] }, 200)
    try {
      if (req.method === 'GET') return json({ items: await kv.all() })
      if (req.method === 'DELETE') {
        const id = new URL(req.url).searchParams.get('id') || ''
        if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'invalid' }, 400)
        return json({ ok: await kv.remove(id) })
      }
    } catch (e) {
      console.error(e)
      return json({ error: 'server' }, 500)
    }
    return json({ error: 'method' }, 405)
  }

  try {
    if (req.method === 'GET') {
      const { data } = await db.select<unknown[]>('rsvp?select=id,name,attendance,guests,message,created_at&order=created_at.desc&limit=5000')
      return json({ items: data ?? [] })
    }
    if (req.method === 'DELETE') {
      const id = new URL(req.url).searchParams.get('id') || ''
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'invalid' }, 400)
      await db.remove('rsvp', `id=eq.${id}`)
      return json({ ok: true })
    }
  } catch (e) {
    console.error(e)
    return json({ error: 'server' }, 500)
  }
  return json({ error: 'method' }, 405)
}
