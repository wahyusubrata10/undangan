export type Attendance = 'yes' | 'no' | 'maybe'

export interface Wish {
  id: string
  name: string
  attendance: Attendance
  guests: number
  message: string
  created_at: string
}

/**
 * Yang BOLEH dilihat publik: nama, ucapan, waktu.
 * Status kehadiran & jumlah tamu TIDAK PERNAH dikirim ke halaman tamu.
 */
export interface PublicWish {
  id: string
  name: string
  message: string
  created_at: string
}

export function toPublic(w: Pick<Wish, 'id' | 'name' | 'message' | 'created_at'>): PublicWish {
  return { id: w.id, name: w.name, message: w.message, created_at: w.created_at }
}

/** Statistik — HANYA untuk /admin */
export interface Stats {
  yes: number
  no: number
  maybe: number
  /** total orang yang akan hadir (jumlah kolom guests untuk 'yes') */
  guests: number
  total: number
}

export interface SubmitInput {
  name: string
  attendance: Attendance
  guests: number
  message: string
  /** honeypot — harus kosong */
  website: string
  /** ms sejak form tampil (anti-bot) */
  elapsed: number
}

export type SubmitError = 'invalid' | 'rate' | 'fast' | 'server'
export type SubmitResult = { ok: true; wish: PublicWish } | { ok: false; error: SubmitError }

export interface Guestbook {
  mode: 'sheets' | 'api' | 'demo'
  list(page: number, size: number): Promise<{ items: PublicWish[]; total: number }>
  submit(input: SubmitInput): Promise<SubmitResult>
  /** cek ucapan baru berkala. Mengembalikan fungsi berhenti. */
  subscribe(onNew: () => void): () => void
}

export const LIMITS = { name: 60, message: 500, minElapsed: 3000 }

export function validate(i: SubmitInput, maxGuests: number): SubmitError | null {
  if (i.website) return 'invalid'
  if (i.elapsed < LIMITS.minElapsed) return 'fast'
  const name = i.name.trim()
  const msg = i.message.trim()
  if (!name || name.length > LIMITS.name) return 'invalid'
  if (!msg || msg.length > LIMITS.message) return 'invalid'
  if (!['yes', 'no', 'maybe'].includes(i.attendance)) return 'invalid'
  if (!Number.isInteger(i.guests) || i.guests < 0 || i.guests > maxGuests) return 'invalid'
  return null
}

export function emptyStats(): Stats {
  return { yes: 0, no: 0, maybe: 0, guests: 0, total: 0 }
}
