import { wedding } from '@/config/wedding'
import { sanitizeText } from '@/lib/guest'
import { LIMITS, validate, type Guestbook, type PublicWish, type SubmitInput, type SubmitResult, type SubmitError } from './types'

export * from './types'

const SHEETS_URL = import.meta.env.VITE_SHEETS_URL as string | undefined
const POLL_MS = 15_000

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

function poller(check: () => Promise<string | undefined>, onNew: () => void) {
  let last: string | undefined
  let stop = false
  const tick = async () => {
    if (stop || document.hidden) return
    const head = await check().catch(() => undefined)
    if (head && last && head !== last) onNew()
    if (head) last = head
  }
  void tick()
  const id = window.setInterval(tick, POLL_MS)
  return () => {
    stop = true
    window.clearInterval(id)
  }
}

/* ---------------- API Vercel (Supabase atau Redis di server) ---------------- */
function apiBook(fallback: Guestbook): Guestbook {
  // cek sekali apakah server punya database; jika tidak → mode demo
  const probe: Promise<boolean> = fetch('/api/rsvp?page=0&size=1')
    .then(async (r) => r.ok && ((await r.json()) as { mode?: string }).mode === 'live')
    .catch(() => false)
  const book: Guestbook = {
    mode: 'demo',
    async list(page, size) {
      if (!(await probe)) return fallback.list(page, size)
      const r = await fetch(`/api/rsvp?page=${page}&size=${size}`)
      const j = (await r.json()) as { items: PublicWish[]; total: number }
      return { items: j.items, total: j.total }
    },
    async submit(input) {
      if (!(await probe)) return fallback.submit(input)
      try {
        const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
        const body = (await res.json().catch(() => ({}))) as { wish?: PublicWish; error?: SubmitError }
        if (res.ok && body.wish) return { ok: true, wish: body.wish }
        return { ok: false, error: body.error ?? (res.status === 429 ? 'rate' : 'server') }
      } catch {
        return { ok: false, error: 'server' }
      }
    },
    subscribe(onNew) {
      return poller(async () => ((await probe) ? (await book.list(0, 1)).items[0]?.id : undefined), onNew)
    },
  }
  void probe.then((ok) => {
    if (ok) book.mode = 'api'
  })
  return book
}

/* ---------------- Google Sheets (Apps Script) ---------------- */
function sheetsBook(): Guestbook {
  let cache: PublicWish[] | null = null
  let cacheAt = 0
  const load = async () => {
    if (cache && Date.now() - cacheAt < 4000) return cache
    const res = await fetch(`${SHEETS_URL}?action=list`)
    const json = (await res.json()) as { items: PublicWish[] }
    cache = json.items
    cacheAt = Date.now()
    return cache
  }
  return {
    mode: 'sheets',
    async list(page, size) {
      const items = await load()
      return { items: items.slice(page * size, page * size + size), total: items.length }
    },
    async submit(input) {
      try {
        // text/plain menghindari preflight CORS di Apps Script
        const res = await fetch(SHEETS_URL!, { method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify(input) })
        const body = (await res.json()) as { wish?: PublicWish; error?: SubmitError }
        cache = null
        if (body.wish) return { ok: true, wish: body.wish }
        return { ok: false, error: body.error ?? 'server' }
      } catch {
        return { ok: false, error: 'server' }
      }
    },
    subscribe(onNew) {
      return poller(async () => {
        cache = null
        return (await load())[0]?.id
      }, onNew)
    },
  }
}

/* ---------------- Demo (localStorage, hanya di perangkat ini) ---------------- */
function demoBook(): Guestbook {
  const KEY = 'rsvp_demo'
  const read = (): PublicWish[] => {
    try {
      return (JSON.parse(localStorage.getItem(KEY) || '[]') as PublicWish[]).map(({ id, name, message, created_at }) => ({ id, name, message, created_at }))
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
    async submit(input) {
      const wish: PublicWish = { id: crypto.randomUUID?.() ?? String(Date.now()), name: input.name, message: input.message, created_at: new Date().toISOString() }
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
  const base = SHEETS_URL ? sheetsBook() : apiBook(demoBook())
  const inner = base.submit.bind(base)
  // lapisan validasi & anti-spam bersama
  base.submit = async (raw): Promise<SubmitResult> => {
    const input = clean(raw)
    const err = validate(input, wedding.rsvp.maxGuests)
    if (err) return { ok: false, error: err }
    if (!clientRateOk()) return { ok: false, error: 'rate' }
    return inner(input)
  }
  book = base
  return book
}
