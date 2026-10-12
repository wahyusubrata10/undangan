import { useEffect, useState } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { WeddingEvent } from '@/config/types'
import { Section, SectionTitle } from '@/components/Section'
import { Tedung } from '@/ornaments'
import { dateParts, formatTime } from '@/lib/format'
import { downloadIcs, googleCalendarUrl } from '@/lib/calendar'
import { calEventFor } from '@/lib/events'

function diff(target: number) {
  const ms = Math.max(0, target - Date.now())
  const s = Math.floor(ms / 1000)
  return { done: ms <= 0, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

/** Digit menggulung vertikal (odometer) — hanya transform. */
function Roll({ value }: { value: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.56em] overflow-hidden align-top">
      <span className="absolute left-0 top-0 flex w-full flex-col transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]" style={{ transform: `translateY(${-value * 10}%)` }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] text-center leading-none">
            {i}
          </span>
        ))}
      </span>
    </span>
  )
}

function Unit({ n, label, min = 2 }: { n: number; label: string; min?: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="display text-[clamp(3rem,15vw,5.5rem)] leading-none text-ink [font-variant-numeric:lining-nums_tabular-nums]" aria-hidden="true">
        {String(n)
          .padStart(min, '0')
          .split('')
          .map((v, i) => (
            <Roll key={i} value={Number(v)} />
          ))}
      </span>
      <span className="label mt-3 !text-[12px]">{label}</span>
    </div>
  )
}

function Countdown() {
  const { t } = useApp()
  const target = new Date(wedding.countdownTo).getTime()
  const [v, setV] = useState(() => diff(target))
  useEffect(() => {
    const id = window.setInterval(() => !document.hidden && setV(diff(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])
  if (v.done) return <p className="display-i text-center text-5xl text-ink">{t.dayArrived}</p>
  return (
    <div className="flex items-start justify-center gap-5 sm:gap-10" role="timer" aria-label={`${v.d} ${t.days}, ${v.h} ${t.hours}, ${v.m} ${t.minutes}`} data-anim="up">
      <Unit n={v.d} label={t.days} min={v.d > 99 ? 3 : 2} />
      <Unit n={v.h} label={t.hours} />
      <Unit n={v.m} label={t.minutes} />
      <Unit n={v.s} label={t.seconds} />
    </div>
  )
}

function EventCard({ ev }: { ev: WeddingEvent }) {
  const { t, c, lang } = useApp()
  const [showMap, setShowMap] = useState(false)
  const d = dateParts(ev.start, lang, ev.tzLabel)
  const cal = calEventFor(ev, c, lang)

  return (
    <article className="soft rounded-[2px] px-7 py-12 text-center sm:px-12" data-anim="up">
      <p className="label">{d.weekday}</p>
      <h3 className="display-i mt-4 text-[2.8rem] text-ink">{c(ev.name)}</h3>
      <p className="display mt-6 text-[1.6rem] text-ink">
        {d.day} {d.month} {d.year}
      </p>
      <p className="mt-1 text-[13px] tracking-[0.2em] text-ink-soft">
        {formatTime(ev.start, lang, ev.tzLabel)} – {formatTime(ev.end, lang, ev.tzLabel)} {ev.tzLabel}
      </p>
      <div className="mx-auto my-8 h-px w-10 bg-prada/60" />
      <p className="font-display text-[1.35rem] text-ink">{ev.venue}</p>
      <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-soft">{c(ev.address)}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={ev.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn !px-5 !py-3 !text-[12px]">
          {t.openMaps}
        </a>
        <a href={googleCalendarUrl(cal)} target="_blank" rel="noopener noreferrer" className="btn-line">
          {t.googleCalendar}
        </a>
        <button type="button" className="btn-line" onClick={() => downloadIcs(cal, `${ev.id}-${wedding.groom.nick}-${wedding.bride.nick}.ics`.toLowerCase())}>
          .ics
        </button>
      </div>

      {showMap ? (
        <iframe
          title={`${t.place}: ${ev.venue}`}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(ev.mapsQuery)}&z=15&output=embed`}
          className="mt-8 block h-60 w-full [filter:grayscale(.6)_sepia(.25)_contrast(.95)]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <button type="button" onClick={() => setShowMap(true)} className="link-u mt-8 text-[12px] tracking-[0.3em] uppercase text-ink-soft">
          {t.showMap}
        </button>
      )}
    </article>
  )
}

/** 7 · Countdown + detail acara. Aksen: siluet tedung. */
export default function Events() {
  const { t, c } = useApp()
  const ls = wedding.liveStream
  return (
    <Section id="events" tone="ivory" label={t.nav.events} className="overflow-hidden px-6 py-32">
      <Tedung className="pointer-events-none absolute -right-6 top-24 h-[70vh] w-auto opacity-[.09]" data-parallax="0.2" />
      <SectionTitle label={t.countdownTitle} title={t.saveDate} />
      <div className="mt-14">
        <Countdown />
      </div>
      <div className="mx-auto mt-28 flex max-w-xl flex-col gap-10">
        <p className="label text-center" data-anim="fade">
          {t.eventsTitle}
        </p>
        {wedding.events.map((ev) => (
          <EventCard key={ev.id} ev={ev} />
        ))}
        {ls.enabled && (
          <div className="text-center" data-anim="up">
            <p className="label">{t.liveTitle}</p>
            {ls.note && <p className="mx-auto mt-3 max-w-xs text-[13px] text-ink-soft">{c(ls.note)}</p>}
            <a href={ls.url} target="_blank" rel="noopener noreferrer" className="btn-line mt-5">
              {t.watchLive} · {ls.platform}
            </a>
          </div>
        )}
      </div>
    </Section>
  )
}
