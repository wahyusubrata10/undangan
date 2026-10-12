import { id } from './id'
import { en } from './en'
import { ban } from './ban'

export type Lang = 'id' | 'en' | 'ban'
export type Dict = typeof id

/** Kamus teks UI. Bahasa Bali (`ban`) mewarisi Bahasa Indonesia untuk kunci yang belum diterjemahkan. */
export const dictionaries: Record<Lang, Dict> = {
  id,
  en,
  ban: { ...id, ...ban },
}

export const langLabels: Record<Lang, string> = { id: 'ID', en: 'EN', ban: 'BALI' }

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
}
