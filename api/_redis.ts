/**
 * Penyimpanan RSVP di Redis (Upstash) lewat REST — dipasang 1 klik dari Vercel → Storage.
 * Env otomatis dari integrasi: KV_REST_API_URL + KV_REST_API_TOKEN
 * (atau UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
 */
import type { Stats, Wish } from '../src/services/guestbook/types'
import { env } from './_shared'

const LIST = 'rsvp:list'
const STATS = 'rsvp:stats'

export function redis() {
  const url = env('KV_REST_API_URL') || env('UPSTASH_REDIS_REST_URL')
  const token = env('KV_REST_API_TOKEN') || env('UPSTASH_REDIS_REST_TOKEN')
  if (!url || !token) return null
  const base = url.replace(/\/$/, '')
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' }

  async function pipeline(cmds: (string | number)[][]): Promise<unknown[]> {
    const res = await fetch(`${base}/pipeline`, { method: 'POST', headers, body: JSON.stringify(cmds) })
    if (!res.ok) throw new Error(`redis ${res.status}: ${await res.text()}`)
    const out = (await res.json()) as { result?: unknown; error?: string }[]
    const err = out.find((r) => r.error)
    if (err) throw new Error(`redis: ${err.error}`)
    return out.map((r) => r.result)
  }

  const parse = (arr: unknown): Wish[] =>
    ((arr as string[] | null) ?? []).flatMap((s) => {
      try {
        return [JSON.parse(s) as Wish]
      } catch {
        return []
      }
    })

  return {
    async list(page: number, size: number): Promise<{ items: Wish[]; total: number }> {
      const from = page * size
      const [items, total] = await pipeline([
        ['LRANGE', LIST, from, from + size - 1],
        ['LLEN', LIST],
      ])
      return { items: parse(items), total: Number(total) || 0 }
    },
    /** statistik — hanya dipanggil dari /api/admin-rsvp */
    async stats(): Promise<Stats> {
      const [raw] = await pipeline([['HGETALL', STATS]])
      return toStats(raw)
    },
    async all(): Promise<Wish[]> {
      const [items] = await pipeline([['LRANGE', LIST, 0, 9999]])
      return parse(items)
    },
    async add(w: Wish): Promise<void> {
      const cmds: (string | number)[][] = [
        ['LPUSH', LIST, JSON.stringify(w)],
        ['HINCRBY', STATS, w.attendance, 1],
        ['HINCRBY', STATS, 'total', 1],
      ]
      if (w.attendance === 'yes') cmds.push(['HINCRBY', STATS, 'guests', w.guests])
      await pipeline(cmds)
    },
    async remove(id: string): Promise<boolean> {
      const all = (await pipeline([['LRANGE', LIST, 0, 9999]]))[0] as string[] | null
      const raw = (all ?? []).find((s) => s.includes(`"id":"${id}"`))
      if (!raw) return false
      const w = JSON.parse(raw) as Wish
      const cmds: (string | number)[][] = [
        ['LREM', LIST, 1, raw],
        ['HINCRBY', STATS, w.attendance, -1],
        ['HINCRBY', STATS, 'total', -1],
      ]
      if (w.attendance === 'yes') cmds.push(['HINCRBY', STATS, 'guests', -w.guests])
      await pipeline(cmds)
      return true
    },
    /** true bila masih boleh mengirim (maks `max` per `windowSec` per IP) */
    async rateOk(ipHash: string, max: number, windowSec: number): Promise<boolean> {
      const key = `rsvp:rl:${ipHash}`
      const [n] = await pipeline([
        ['INCR', key],
        ['EXPIRE', key, windowSec, 'NX'],
      ])
      return Number(n) <= max
    },
  }
}

function toStats(raw: unknown): Stats {
  // HGETALL via REST → ["field","value",...]
  const s: Stats = { yes: 0, no: 0, maybe: 0, guests: 0, total: 0 }
  const arr = Array.isArray(raw) ? (raw as string[]) : []
  for (let i = 0; i + 1 < arr.length; i += 2) {
    const k = arr[i] as keyof Stats
    if (k in s) s[k] = Math.max(0, Number(arr[i + 1]) || 0)
  }
  return s
}
