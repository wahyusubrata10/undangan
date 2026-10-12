import { wedding } from '@/config/wedding'
import { sanitizeText } from '@/lib/guest'
import { emptyStats, LIMITS, validate, type Guestbook, type Stats, type SubmitInput, type SubmitResult, type Wish } from './types'

export * from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const SHEETS_URL = import.meta.env.VITE_SHEETS_URL as string | undefined

/** Rate limit sisi klien (server tetap memvalidasi ulang). 3 kiriman / 10 menit. */
function clientRateOk(): boolean {
  try {
    const now = Date.now()
    const arr = (JSON.parse(localStorage.getItem('rsvp_ts') || '[]') as number[]).filter((t) => now - t < 10 * 60_000)
    if (arr.length >= 3) return false
    localStorage.setItem('rsvp_ts', JSON.stringify([...arr, now]))
  } catch {
    /* storage diblokir — biarkan server yang membatasi */
  }
  return true
}

function clean(i: SubmitInput): SubmitInput {
  return {
    ...i,
    name: sanitizeText(i.name, LIMITS.name),
    message: i.message.replace(/<[^>]*>?/g, '').replace(/\s{3,}/g, '\n\n').trim().slice(0, LIMITS.message),
    guests: i.attendance === 'yes' ? Math.max(1, i.guests) : 0,
  }
}

async function postApi(input: SubmitInput): Promise<SubmitResult> {
  try {
    const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
    const body = (await res.json().catch(() => ({}))) as { wish?: Wish; error?: SubmitResult extends { error: infer E } ? E : never }
    if (res.ok && body.wish) return { ok: true, wish: body.wish }
    return { ok: false, error: body.error ?? (res.status === 429 ? 'rate' : 'server') }
  } catch {
    return { ok: false, error: 'server' }
  }
}

/* ---------------- Supabase ---------------- */
function supabaseBook(): Guestbook {
  const clientP = import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL!, SUPABASE_KEY!, { auth: { persistSession: false } }),
  )
  const cols = 'id,name,attendance,guests,message,created_at'
  return {
    mode: 'supabase',
    async list(page, size) {
      const sb = await clientP
      const from = page * size
      const { data, count, error } = await sb.from('rsvp').select(cols, { count: 'exact' }).order('created_at', { ascending: false }).range(from, from + size - 1)
      if (error) throw error
      return { items: (data ?? []) as Wish[], total: count ?? 0 }
    },
    async stats() {
      const sb = await clientP
      const { data, error } = await sb.from('rsvp_stats').select('*').single()
      if (error || !data) return emptyStats()
      return data as Stats
    },
    submit: postApi,
    subscribe(onNew) {
      let off = () => {}
      void clientP.then((sb) => {
        const ch = sb
          .channel('rsvp-feed')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rsvp' }, (p) => onNew(p.new as Wish))
          .subscribe()
        off = () => void sb.removeChannel(ch)
      })
      return () => off()
    },
  }
}

/* ---------------- Google Sheets (Apps Script) ---------------- */
function sheetsBook(): Guestbook {
  let cache: { items: Wish[]; stats: Stats } | null = null
  let cacheAt = 0
  const load = async () => {
    if (cache && Date.now() - cacheAt < 4000) return cache
    const res = await fetch(`${SHEETS_URL}?action=list`, { method: 'GET' })
    const json = (await res.json()) as { items: Wish[]; stats: Stats }
    cache = json
    cacheAt = Date.now()
    return json
  }
  return {
    mode: 'sheets',
    async list(page, size) {
      const d = await load()
      return { items: d.items.slice(page * size, page * size + size), total: d.items.length }
    },
    async stats() {
      return (await load()).stats
    },
    async submit(input) {
      try {
        // text/plain menghindari preflight CORS di Apps Script
        const res = await fetch(SHEETS_URL!, { method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify(input) })
        const body = (await res.json()) as { wish?: Wish; error?: SubmitResult extends { error: infer E } ? E : never }
        cache = null
        if (body.wish) return { ok: true, wish: body.wish }
        return { ok: false, error: body.error ?? 'server' }
      } catch {
        return { ok: false, error: 'server' }
      }
    },
    subscribe(onNew) {
      let known = new Set<string>()
      let first = true
      const tick = async () => {
        if (document.hidden) return
        cache = null
        const d = await load().catch(() => null)
        if (!d) return
        if (!first) d.items.filter((w) => !known.has(w.id)).forEach(onNew)
        known = new Set(d.items.map((w) => w.id))
        first = false
      }
      void tick()
      const id = window.setInterval(tick, 20_000)
      return () => window.clearInterval(id)
    },
  }
}

/* ---------------- API Vercel + Redis (dideteksi saat runtime) ---------------- */
function apiBook(fallback: Guestbook): Guestbook {
  // cek sekali apakah /api/rsvp punya database; jika tidak → mode demo
  const probe: Promise<boolean> = fetch('/api/rsvp?page=0&size=1')
    .then(async (r) => r.ok && ((await r.json()) as { mode?: string }).mode === 'redis')
    .catch(() => false)
  const book: Guestbook = {
    mode: 'demo',
    async list(page, size) {
      if (!(await probe)) return fallback.list(page, size)
      const r = await fetch(`/api/rsvp?page=${page}&size=${size}`)
      const j = (await r.json()) as { items: Wish[]; total: number }
      return { items: j.items, total: j.total }
    },
    async stats() {
      if (!(await probe)) return fallback.stats()
      const r = await fetch('/api/rsvp?page=0&size=1')
      return ((await r.json()) as { stats: Stats }).stats
    },
    async submit(input) {
      return (await probe) ? postApi(input) : fallback.submit(input)
    },
    subscribe(onNew) {
      // "realtime" sederhana: cek ucapan baru tiap 15 detik saat tab terlihat
      let known: Set<string> | null = null
      let stop = false
      const tick = async () => {
        if (stop || document.hidden || !(await probe)) return
        try {
          const { items } = await book.list(0, 10)
          if (known) items.filter((w) => !known!.has(w.id)).reverse().forEach(onNew)
          known = new Set([...(known ?? []), ...items.map((w) => w.id)])
        } catch {
          /* coba lagi nanti */
        }
      }
      void tick()
      const id = window.setInterval(tick, 15_000)
      return () => {
        stop = true
        window.clearInterval(id)
      }
    },
  }
  void probe.then((ok) => {
    if (ok) book.mode = 'api'
  })
  return book
}

/* ---------------- Demo (localStorage) ---------------- */
function demoBook(): Guestbook {
  const KEY = 'rsvp_demo'
  const read = (): Wish[] => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]') as Wish[]
    } catch {
      return []
    }
  }
  return {
    mode: 'demo',
    async list(page, size) {
      const all = read()
      return { items: all.slice(page * size, page * size + size), total: all.length }
    },
    async stats() {
      const all = read()
      const s = emptyStats()
      all.forEach((w) => {
        s[w.attendance]++
        if (w.attendance === 'yes') s.guests += w.guests
      })
      s.total = all.length
      return s
    },
    async submit(input) {
      const wish: Wish = {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        name: input.name,
        attendance: input.attendance,
        guests: input.guests,
        message: input.message,
        created_at: new Date().toISOString(),
      }
      try {
        localStorage.setItem(KEY, JSON.stringify([wish, ...read()].slice(0, 200)))
      } catch {
        /* abaikan */
      }
      return { ok: true, wish }
    },
    subscribe() {
      return () => {}
    },
  }
}

let book: Guestbook | null = null
export function getGuestbook(): Guestbook {
  if (book) return book
  const base = SUPABASE_URL && SUPABASE_KEY ? supabaseBook() : SHEETS_URL ? sheetsBook() : apiBook(demoBook())
  const inner = base.submit.bind(base)
  // lapisan validasi & anti-spam bersama untuk semua backend
  base.submit = async (raw) => {
    const input = clean(raw)
    const err = validate(input, wedding.rsvp.maxGuests)
    if (err) return { ok: false, error: err }
    if (!clientRateOk()) return { ok: false, error: 'rate' }
    return inner(input)
  }
  book = base
  return book
}
