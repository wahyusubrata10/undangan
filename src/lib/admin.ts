import { guestLink, sanitizeText } from './guest'

export interface GuestRow {
  name: string
  salutation: string
  phone: string
}

/**
 * Parse daftar tamu yang di-paste. Satu tamu per baris. Pemisah kolom: "|" atau TAB (salin dari Excel/Sheets).
 *   Wayan Sudarma
 *   Wayan Sudarma | Bapak/Ibu
 *   Wayan Sudarma | Bapak/Ibu | 081234567890
 */
export function parseGuestList(text: string, defaultSalutation: string): GuestRow[] {
  const seen = new Set<string>()
  const rows: GuestRow[] = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const [n = '', s = '', p = ''] = line.split(/\t|\|/).map((x) => x.trim())
    const name = sanitizeText(n, 60)
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({ name, salutation: sanitizeText(s, 30) || defaultSalutation, phone: normalizePhone(p) })
  }
  return rows
}

/** 0812… / +62 812… / 62812… → 62812… (format wa.me). */
export function normalizePhone(p: string): string {
  const d = p.replace(/[^\d+]/g, '').replace(/^\+/, '')
  if (!d) return ''
  if (d.startsWith('0')) return '62' + d.slice(1)
  return d
}

export function buildMessage(template: string, vars: { sapaan: string; nama: string; link: string; mempelai: string; tanggal: string }): string {
  return template.replace(/\{(sapaan|nama|link|mempelai|tanggal)\}/g, (_m, k: keyof typeof vars) => vars[k])
}

export function linkFor(base: string, row: GuestRow, defaultSalutation: string): string {
  // sapaan default tidak perlu ditulis di URL → link lebih pendek
  return guestLink(base, row.name, row.salutation !== defaultSalutation ? row.salutation : undefined)
}

export function waUrl(message: string, phone?: string): string {
  return `https://wa.me/${phone ?? ''}?text=${encodeURIComponent(message)}`
}

function csvCell(v: string | number): string {
  const s = String(v)
  // cegah CSV/formula injection di Excel
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",\n\r;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  // BOM agar Excel membaca UTF-8 (aksara & tanda baca) dengan benar
  return '\uFEFF' + [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
}

export function download(filename: string, content: string | Blob, type = 'text/csv;charset=utf-8') {
  const blob = typeof content === 'string' ? new Blob([content], { type }) : content
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}
