import { mediaManifest } from '@/config/media.generated'

export interface MediaEntry {
  /** lebar & tinggi asli (untuk rasio aspek, mencegah layout shift) */
  w: number
  h: number
  /** data URI blur kecil */
  lqip: string
  /** lebar yang tersedia */
  widths: number[]
  /** path dasar tanpa ekstensi & ukuran, mis. /media/photos/hero */
  base: string
  formats: ('avif' | 'webp' | 'jpg')[]
}

export type ResolvedMedia =
  | { kind: 'manifest'; entry: MediaEntry }
  | { kind: 'url'; src: string }
  | { kind: 'empty' }

export function resolvePhoto(ref: string | undefined): ResolvedMedia {
  if (!ref) return { kind: 'empty' }
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('/') || ref.startsWith('data:')) return { kind: 'url', src: ref }
  const key = ref.replace(/\.[a-z0-9]+$/i, '').toLowerCase()
  const entry = mediaManifest[key]
  if (entry) return { kind: 'manifest', entry }
  if (import.meta.env.DEV) console.warn(`[media] "${ref}" belum diproses. Jalankan: npm run media`)
  return { kind: 'empty' }
}

export function srcSet(e: MediaEntry, fmt: string): string {
  return e.widths.map((w) => `${e.base}-${w}.${fmt} ${w}w`).join(', ')
}

export function largestSrc(e: MediaEntry, fmt: 'webp' | 'jpg' = 'webp'): string {
  return `${e.base}-${e.widths[e.widths.length - 1]}.${fmt}`
}

/** URL gambar terbaik untuk dipakai sebagai poster / background. */
export function photoUrl(ref: string | undefined, preferredWidth = 1280): string | undefined {
  const r = resolvePhoto(ref)
  if (r.kind === 'url') return r.src
  if (r.kind === 'manifest') {
    const w = r.entry.widths.find((x) => x >= preferredWidth) ?? r.entry.widths[r.entry.widths.length - 1]
    return `${r.entry.base}-${w}.webp`
  }
  return undefined
}
