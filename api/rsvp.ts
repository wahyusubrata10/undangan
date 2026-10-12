/**
 * GET  /api/rsvp?page=0&size=6 — daftar ucapan + statistik (mode Redis)
 * POST /api/rsvp — simpan konfirmasi kehadiran & ucapan (Supabase atau Redis).
 * Anti-spam berlapis: honeypot, jeda minimum isi form, validasi & sanitasi, rate limit per IP (hash).
 */
import { wedding } from '../src/config/wedding'
import { sanitizeText } from '../src/lib/guest'
import { LIMITS, toPublic, validate, type PublicWish, type SubmitInput, type Wish } from '../src/services/guestbook/types'
import { clientIp, env, json, sha256, supabase } from './_shared'
import { redis } from './_redis'

export const config = { runtime: 'edge' }

const RATE = { max: 3, windowMin: 10 }

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    // PUBLIK: hanya nama, ucapan, waktu. Tanpa status kehadiran, jumlah tamu, atau statistik.
    const u = new URL(req.url)
    const page = Math.max(0, Math.floor(Number(u.searchParams.get('page')) || 0))
    const size = Math.min(50, Math.max(1, Math.floor(Number(u.searchParams.get('size')) || 6)))
    const cache = { 'cache-control': 'public, max-age=0, s-maxage=5' }
    try {
      const db = supabase()
      if (db) {
        const from = page * size
        const { data, count } = await db.select<PublicWish[]>(`rsvp?select=id,name,message,created_at&order=created_at.desc&offset=${from}&limit=${size}`, { prefer: 'count=exact' })
        return json({ mode: 'live', items: (data ?? []).map(toPublic), total: count ?? 0 }, 200, cache)
      }
      const kv = redis()
      if (kv) {
        const { items, total } = await kv.list(page, size)
        return json({ mode: 'live', items: items.map(toPublic), total }, 200, cache)
      }
      return json({ mode: 'none' }) // klien beralih ke mode demo
    } catch (e) {
      console.error(e)
      return json({ error: 'server' }, 500)
    }
  }
  if (req.method !== 'POST') return json({ error: 'method' }, 405, { allow: 'GET, POST' })
  const ctype = req.headers.get('content-type') || ''
  if (!ctype.includes('application/json')) return json({ error: 'invalid' }, 415)
  const len = Number(req.headers.get('content-length') || 0)
  if (len > 4096) return json({ error: 'invalid' }, 413)

  let raw: Partial<SubmitInput>
  try {
    raw = (await req.json()) as Partial<SubmitInput>
  } catch {
    return json({ error: 'invalid' }, 400)
  }

  const attendance = raw.attendance === 'yes' || raw.attendance === 'no' || raw.attendance === 'maybe' ? raw.attendance : ('x' as never)
  const input: SubmitInput = {
    name: sanitizeText(String(raw.name ?? ''), LIMITS.name),
    message: String(raw.message ?? '')
      .replace(/<[^>]*>?/g, '')
      .replace(/\s{3,}/g, '\n\n')
      .trim()
      .slice(0, LIMITS.message),
    attendance,
    guests: attendance === 'yes' ? Math.max(1, Math.floor(Number(raw.guests) || 1)) : 0,
    website: String(raw.website ?? ''),
    elapsed: Number(raw.elapsed) || 0,
  }

  const err = validate(input, wedding.rsvp.maxGuests)
  // honeypot terisi → pura-pura sukses agar bot tidak belajar
  if (input.website) return json({ wish: { id: 'ok', name: input.name, message: input.message, created_at: new Date().toISOString() } }, 200)
  if (err) return json({ error: err }, 400)

  const db = supabase()
  const ipHash = await sha256(`${env('APP_SECRET') ?? env('ADMIN_PASSWORD') ?? 'salt'}:${clientIp(req)}`)

  if (!db) {
    const kv = redis()
    if (!kv) return json({ error: 'server', detail: 'Database belum dihubungkan (Vercel → Storage)' }, 503)
    try {
      if (!(await kv.rateOk(ipHash, RATE.max, RATE.windowMin * 60))) return json({ error: 'rate' }, 429, { 'retry-after': String(RATE.windowMin * 60) })
      const wish: Wish = {
        id: crypto.randomUUID(),
        name: input.name,
        attendance: input.attendance,
        guests: input.guests,
        message: input.message,
        created_at: new Date().toISOString(),
      }
      await kv.add(wish)
      return json({ wish: toPublic(wish) }, 201)
    } catch (e) {
      console.error(e)
      return json({ error: 'server' }, 500)
    }
  }

  try {
    const since = new Date(Date.now() - RATE.windowMin * 60_000).toISOString()
    const { count } = await db.select<unknown[]>(`rsvp_ratelimit?select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}`, {
      prefer: 'count=exact',
      range: '0-0',
    })
    if ((count ?? 0) >= RATE.max) return json({ error: 'rate' }, 429, { 'retry-after': String(RATE.windowMin * 60) })

    const wish = await db.insert<Wish>('rsvp', {
      name: input.name,
      attendance: input.attendance,
      guests: input.guests,
      message: input.message,
    })
    await db.insert('rsvp_ratelimit', { ip_hash: ipHash }, false)
    return json({ wish: toPublic(wish) }, 201)
  } catch (e) {
    console.error(e)
    return json({ error: 'server' }, 500)
  }
}
