import type { L } from '@/config/types'
import type { Lang } from '@/i18n'

/** Ambil teks sesuai bahasa, jatuh ke 'id' lalu nilai pertama. */
export function tx(v: L | undefined, lang: Lang): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  return v[lang] ?? v.id ?? Object.values(v)[0] ?? ''
}
