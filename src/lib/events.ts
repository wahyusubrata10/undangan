import type { L, WeddingEvent } from '@/config/types'
import type { Lang } from '@/i18n'
import { wedding } from '@/config/wedding'
import type { CalEvent } from './calendar'

export function calEventFor(ev: WeddingEvent, c: (v: L | undefined) => string, _lang: Lang): CalEvent {
  const names = `${wedding.groom.nick} & ${wedding.bride.nick}`
  const site = wedding.meta.siteUrl || (typeof location !== 'undefined' ? location.origin : '')
  return {
    uid: `${ev.id}-${names.replace(/\W+/g, '').toLowerCase()}@undangan`,
    title: `${c(ev.name)} — ${names}`,
    description: `${c(wedding.eventTitle)} ${names}\n${ev.venue}\n${c(ev.address)}`,
    location: `${ev.venue}, ${c(ev.address)}`,
    start: new Date(ev.start),
    end: new Date(ev.end),
    url: site || undefined,
  }
}
