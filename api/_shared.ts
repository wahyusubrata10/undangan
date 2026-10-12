/**
 * Utilitas bersama untuk Vercel Functions (file berawalan "_" bukan endpoint).
 * Semua fungsi memakai Web API standar (Edge runtime).
 */

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  })

export function env(name: string): string | undefined {
  const v = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name]
  return v && v.trim() ? v.trim() : undefined
}

const enc = new TextEncoder()

export async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function sha256(msg: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(msg))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Perbandingan string waktu-konstan (mencegah timing attack). */
export function safeEqual(a: string, b: string): boolean {
  const ea = enc.encode(a)
  const eb = enc.encode(b)
  let diff = ea.length ^ eb.length
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0)
  return diff === 0
}

export function clientIp(req: Request): string {
  return (req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim()
}

/* ---------------- Supabase REST (tanpa SDK → ringan di Edge) ---------------- */
export function supabase() {
  const url = env('SUPABASE_URL') || env('VITE_SUPABASE_URL')
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return null
  const base = `${url.replace(/\/$/, '')}/rest/v1`
  const headers = { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' }
  return {
    async select<T>(path: string, extra: Record<string, string> = {}): Promise<{ data: T; count: number | null }> {
      const res = await fetch(`${base}/${path}`, { headers: { ...headers, ...extra } })
      if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`)
      const range = res.headers.get('content-range')
      const count = range && range.includes('/') ? Number(range.split('/')[1]) : null
      const text = await res.text()
      return { data: (text ? JSON.parse(text) : null) as T, count: Number.isFinite(count) ? count : null }
    },
    async insert<T>(table: string, row: unknown, returning = true): Promise<T> {
      const res = await fetch(`${base}/${table}`, {
        method: 'POST',
        headers: { ...headers, prefer: returning ? 'return=representation' : 'return=minimal' },
        body: JSON.stringify(row),
      })
      if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`)
      return (returning ? ((await res.json()) as T[])[0] : undefined) as T
    },
    async remove(table: string, filter: string): Promise<void> {
      const res = await fetch(`${base}/${table}?${filter}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`)
    },
  }
}

/* ---------------- Sesi admin (cookie bertanda tangan HMAC) ---------------- */
export const ADMIN_COOKIE = 'adm_sess'
const SESSION_HOURS = 12

function secret(): string | undefined {
  return env('APP_SECRET') || env('ADMIN_PASSWORD')
}

export async function makeSession(): Promise<string> {
  const exp = Date.now() + SESSION_HOURS * 3600_000
  return `${exp}.${await hmac(secret()!, `admin:${exp}`)}`
}

export async function verifySession(req: Request): Promise<boolean> {
  const s = secret()
  if (!s) return false
  const cookie = req.headers.get('cookie') || ''
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`))
  if (!m) return false
  const [expStr, sig] = decodeURIComponent(m[1]!).split('.')
  const exp = Number(expStr)
  if (!exp || !sig || exp < Date.now()) return false
  return safeEqual(sig, await hmac(s, `admin:${exp}`))
}

export function sessionCookie(value: string, maxAge = SESSION_HOURS * 3600) {
  return `${ADMIN_COOKIE}=${encodeURIComponent(value)}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`
}
