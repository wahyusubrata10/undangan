/**
 * Membaca nama tamu & sapaan dari query string dengan aman.
 * Dipakai di browser (src/) DAN di Edge Middleware (middleware.ts) — jangan import modul browser di sini.
 */

const MAX_NAME = 60
const MAX_SALUTATION = 30
// Karakter kontrol & pengubah arah teks (bidi) yang bisa dipakai untuk spoofing.
const CONTROL_CHARS = new RegExp('[\\u0000-\\u001F\\u007F-\\u009F\\u200B-\\u200F\\u2028-\\u202E\\u2066-\\u2069]', 'g')

/** Kata yang tetap ditulis seperti aslinya (gelar, singkatan). Kunci huruf kecil. */
const KEEP_CASE: Record<string, string> = {
  dr: 'dr.',
  'dr.': 'dr.',
  ir: 'Ir.',
  'ir.': 'Ir.',
  st: 'S.T.',
  'st.': 'S.T.',
  'drs.': 'Drs.',
  'h.': 'H.',
  'hj.': 'Hj.',
  'prof.': 'Prof.',
  sh: 'S.H.',
  se: 'S.E.',
  spd: 'S.Pd.',
  'skom': 'S.Kom.',
  mm: 'M.M.',
  ida: 'Ida',
  i: 'I',
  ni: 'Ni',
  ii: 'II',
  iii: 'III',
  pt: 'PT',
  cv: 'CV',
}
const LOWER_WORDS = new Set(['dan', 'and', '&', 'beserta', 'bin', 'binti', 'de', 'van', 'di'])

function safeDecode(raw: string): string {
  let s = raw.replace(/\+/g, ' ')
  // decode berulang maksimal 2x (link yang ter-encode ganda dari aplikasi chat)
  for (let i = 0; i < 2; i++) {
    try {
      const d = decodeURIComponent(s)
      if (d === s) break
      s = d
    } catch {
      break
    }
  }
  return s
}

/**
 * Bersihkan teks dari URL: buang tag HTML, karakter kontrol, karakter berbahaya,
 * rapikan spasi & potong panjangnya. Hasilnya HANYA dirender sebagai teks.
 */
export function sanitizeText(raw: string | null | undefined, max = MAX_NAME): string {
  if (!raw) return ''
  let s = safeDecode(String(raw))
  s = s.normalize('NFC')
  s = s.replace(/<[^>]*>?/g, ' ') // tag HTML
  s = s.replace(CONTROL_CHARS, '')
  s = s.replace(/[<>"`{}\\]|javascript:/gi, '')
  s = s.replace(/\s+/g, ' ').trim()
  if (s.length > max) s = s.slice(0, max).trim()
  return s
}

function capWord(w: string): string {
  const lower = w.toLowerCase()
  if (KEEP_CASE[lower]) return KEEP_CASE[lower]
  if (LOWER_WORDS.has(lower)) return lower
  // pertahankan singkatan semua-kapital pendek (mis. "BCA", "TNI")
  if (w.length <= 4 && w === w.toUpperCase() && /[A-Z]/.test(w) && w.length > 1 && !/[aeiou]/i.test(w.slice(1)))
    return w
  return lower.replace(/(^|[-'’./])(\p{L})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
}

/** "bapak  wAYAN suKADANA & keluarga" → "Bapak Wayan Sukadana & Keluarga" */
export function titleCase(s: string): string {
  const words = s.split(' ')
  return words
    .map((w, i) => {
      const c = capWord(w)
      // kata pertama selalu kapital
      return i === 0 && LOWER_WORDS.has(c) ? c.charAt(0).toUpperCase() + c.slice(1) : c
    })
    .join(' ')
    .replace(/\b(keluarga|kel\.)/gi, (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
}

export interface Guest {
  name: string
  salutation: string
  /** true bila nama berasal dari URL */
  personalized: boolean
}

export function parseGuest(
  search: string | URLSearchParams,
  fallbackName: string,
  defaultSalutation: string,
): Guest {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  // URLSearchParams sudah decode sekali; sanitizeText menangani encode ganda.
  const rawName = params.get('to') ?? params.get('kpd') ?? params.get('u') ?? ''
  const rawSal = params.get('sapaan') ?? params.get('s') ?? ''
  const name = titleCase(sanitizeText(rawName, MAX_NAME))
  const salutation = sanitizeText(rawSal, MAX_SALUTATION)
  return {
    name: name || fallbackName,
    salutation: salutation || defaultSalutation,
    personalized: !!name,
  }
}

/** Membuat link personal tamu. */
export function guestLink(base: string, name: string, salutation?: string): string {
  const u = new URL(base)
  u.search = ''
  u.searchParams.set('to', name.trim())
  if (salutation && salutation.trim()) u.searchParams.set('sapaan', salutation.trim())
  return u.toString()
}

/** Escape untuk disisipkan ke atribut HTML (dipakai middleware OG). */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
