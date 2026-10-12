import { useState } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { WeddingEvent } from '@/config/types'
import { Section, SectionTitle } from '@/components/Section'
import { PatraCorner, SongketPattern, Divider } from '@/ornaments'
import { dateParts, formatTime } from '@/lib/format'
import { downloadIcs, googleCalendarUrl } from '@/lib/calendar'
import { calEventFor } from '@/lib/events'

function EventCard({ ev }: { ev: WeddingEvent }) {
  const { t, c, lang } = useApp()
  const [showMap, setShowMap] = useState(false)
  const [calOpen, setCalOpen] = useState(false)
  const d = dateParts(ev.start, lang, ev.tzLabel)
  const cal = calEventFor(ev, c, lang)

  return (
    <article className="relative overflow-hidden rounded-[30px] border border-prada/30 bg-[linear-gradient(170deg,#2c080b_0%,#16090a_60%,#0e0807_100%)] shadow-[0_40px_80px_-40px_rgba(0,0,0,1)]" data-reveal="up">
      <SongketPattern className="absolute inset-x-0 top-0 h-28" opacity={0.18} size={22} />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-transparent to-[#2c080b]" />
      <PatraCorner className="absolute left-2 top-2 w-14" />
      <PatraCorner className="absolute right-2 top-2 w-14 rotate-90" />
      <div className="relative px-6 pb-7 pt-10 text-center">
        <h3 className="font-serif text-[2.1rem] italic leading-none text-prada" data-split="words">
          {c(ev.name)}
        </h3>
        <Divider className="mx-auto my-5 w-32" />
        <div className="flex items-stretch justify-center gap-4">
          <div className="flex flex-col items-end justify-center text-right">
            <span className="font-display text-[11px] tracking-[0.25em] uppercase text-gading-dim">{d.weekday}</span>
            <span className="font-display text-[11px] tracking-[0.25em] uppercase text-gading-dim">{d.month}</span>
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-2xl border border-prada/50 bg-hitam/50">
            <span className="font-display text-4xl text-prada-light">{d.day}</span>
          </div>
          <div className="flex flex-col items-start justify-center">
            <span className="font-display text-xl text-gading">{d.year}</span>
          </div>
        </div>

        <dl className="mt-6 space-y-4 text-[14px]">
          <div>
            <dt className="eyebrow !text-[10px]">{t.time}</dt>
            <dd className="mt-1 text-gading">
              {formatTime(ev.start, lang, ev.tzLabel)} – {formatTime(ev.end, lang, ev.tzLabel)} {ev.tzLabel}
            </dd>
          </div>
          <div>
            <dt className="eyebrow !text-[10px]">{t.place}</dt>
            <dd className="mt-1">
              <span className="block font-serif text-[1.3rem] text-prada-light">{ev.venue}</span>
              <span className="text-gading-dim">{c(ev.address)}</span>
            </dd>
          </div>
          {ev.note && <p className="text-[12px] italic text-gading-dim">{c(ev.note)}</p>}
        </dl>

        {/* peta: baru dimuat saat diminta (iframe berat) */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-prada/25">
          {showMap ? (
            <iframe
              title={`${t.place}: ${ev.venue}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(ev.mapsQuery)}&z=15&output=embed`}
              className="block h-56 w-full [filter:invert(.92)_hue-rotate(180deg)_sepia(.35)_saturate(1.3)_brightness(.9)]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <button type="button" onClick={() => setShowMap(true)} className="group relative grid h-36 w-full place-items-center overflow-hidden bg-[#120c0a]">
              <svg className="absolute inset-0 h-full w-full opacity-25" aria-hidden="true">
                <defs>
                  <pattern id={`grid-${ev.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M24 0 H0 V24" fill="none" stroke="#c9a24b" strokeWidth=".5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-${ev.id})`} />
                <path d="M0 90 C80 60 140 120 220 80 S360 40 420 70" stroke="#c9a24b" strokeWidth="2" fill="none" />
              </svg>
              <span className="relative flex flex-col items-center gap-2 text-prada-light">
                <svg viewBox="0 0 24 24" className="h-8 w-8 transition-transform duration-500 group-hover:-translate-y-1" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M12 21 C12 21 5 14 5 9 A7 7 0 0 1 19 9 C19 14 12 21 12 21Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span className="font-display text-[10px] tracking-[0.3em] uppercase">{t.showMap}</span>
              </span>
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={ev.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-prada !px-5 !py-3 !text-[10px]">
            {t.openMaps}
          </a>
          <div className="relative">
            <button type="button" className="btn-ghost !py-3" aria-expanded={calOpen} onClick={() => setCalOpen((v) => !v)}>
              {t.addCalendar}
            </button>
            {calOpen && (
              <div className="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-prada/40 bg-hitam/95 text-left text-[13px] shadow-xl">
                <a className="block px-4 py-3 hover:bg-prada/10" href={googleCalendarUrl(cal)} target="_blank" rel="noopener noreferrer" onClick={() => setCalOpen(false)}>
                  {t.googleCalendar}
                </a>
                <button
                  type="button"
                  className="block w-full border-t border-prada/20 px-4 py-3 text-left hover:bg-prada/10"
                  onClick={() => {
                    downloadIcs(cal, `${ev.id}-${wedding.groom.nick}-${wedding.bride.nick}.ics`.toLowerCase())
                    setCalOpen(false)
                  }}
                >
                  {t.downloadIcs}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Events() {
  const { t } = useApp()
  return (
    <Section id="events" sweep label={t.nav.events} bg="dim" className="px-5 py-28">
      <div className="relative mx-auto max-w-md">
        <SectionTitle eyebrow={t.eventsSub} title={t.eventsTitle} />
        <div className="flex flex-col gap-8">
          {wedding.events.map((ev) => (
            <EventCard key={ev.id} ev={ev} />
          ))}
        </div>
      </div>
    </Section>
  )
}
