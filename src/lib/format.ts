import type { Lang } from '@/i18n'

const TZ: Record<string, string> = { WIB: 'Asia/Jakarta', WITA: 'Asia/Makassar', WIT: 'Asia/Jayapura' }
const locale = (lang: Lang) => (lang === 'en' ? 'en-GB' : 'id-ID')

export function formatDateLong(iso: string, lang: Lang, tzLabel = 'WITA'): string {
  return new Intl.DateTimeFormat(locale(lang), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ[tzLabel] ?? 'Asia/Makassar',
  }).format(new Date(iso))
}

export function formatTime(iso: string, lang: Lang, tzLabel = 'WITA'): string {
  return new Intl.DateTimeFormat(locale(lang), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ[tzLabel] ?? 'Asia/Makassar',
  })
    .format(new Date(iso))
    .replace(':', '.')
}

export function dateParts(iso: string, lang: Lang, tzLabel = 'WITA') {
  const d = new Date(iso)
  const tz = TZ[tzLabel] ?? 'Asia/Makassar'
  const get = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale(lang), { ...o, timeZone: tz }).format(d)
  return {
    weekday: get({ weekday: 'long' }),
    day: get({ day: '2-digit' }),
    month: get({ month: 'long' }),
    monthNum: get({ month: '2-digit' }),
    year: get({ year: 'numeric' }),
  }
}

/** "01 . 01 . 2027" */
export function dotDate(iso: string, tzLabel = 'WITA'): string {
  const p = dateParts(iso, 'id', tzLabel)
  return `${p.day} · ${p.monthNum} · ${p.year}`
}

export function relativeTime(iso: string, t: { justNow: string; minutesAgo: string; hoursAgo: string; daysAgo: string }, lang: Lang): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return t.justNow
  if (diff < 3600) return t.minutesAgo.replace('{n}', String(Math.floor(diff / 60)))
  if (diff < 86400) return t.hoursAgo.replace('{n}', String(Math.floor(diff / 3600)))
  if (diff < 86400 * 7) return t.daysAgo.replace('{n}', String(Math.floor(diff / 86400)))
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}
