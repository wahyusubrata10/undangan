import { useEffect, useState } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import { Jepun, SongketPattern } from '@/ornaments'
import { googleCalendarUrl } from '@/lib/calendar'
import { calEventFor } from '@/lib/events'

function diff(target: number) {
  const ms = Math.max(0, target - Date.now())
  const s = Math.floor(ms / 1000)
  return { done: ms <= 0, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

/** Satu digit yang "menggulung" vertikal seperti odometer — hanya transform. */
function RollDigit({ value }: { value: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-top">
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
  const digits = String(n).padStart(min, '0').split('').map(Number)
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative grid h-[5.2rem] min-w-[4.6rem] place-items-center overflow-hidden rounded-2xl border border-prada/35 bg-[linear-gradient(160deg,#3a0b0f,#1a0709)] px-2 shadow-[inset_0_1px_0_rgba(241,213,138,.25),0_20px_40px_-20px_rgba(0,0,0,.9)]">
        <SongketPattern className="absolute inset-0" opacity={0.12} size={18} />
        <span className="relative font-display text-[2.6rem] leading-none text-prada-light tabular-nums" aria-hidden="true">
          {digits.map((v, i) => (
            <RollDigit key={i} value={v} />
          ))}
        </span>
        <span className="absolute inset-x-2 top-1/2 h-px bg-black/40" />
      </div>
      <span className="mt-2 font-display text-[10px] tracking-[0.3em] uppercase text-gading-dim">{label}</span>
    </div>
  )
}

export default function Countdown() {
  const { t, c, lang } = useApp()
  const target = new Date(wedding.countdownTo).getTime()
  const [v, setV] = useState(() => diff(target))

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setV(diff(target))
    }, 1000)
    return () => window.clearInterval(id)
  }, [target])

  const ev = wedding.events[0]
  const label = `${v.d} ${t.days}, ${v.h} ${t.hours}, ${v.m} ${t.minutes}`

  return (
    <Section id="countdown" label={t.nav.countdown} className="px-5 py-24">
      <div className="mx-auto max-w-md text-center">
        <p className="eyebrow" data-reveal="fade">
          {t.saveDate}
        </p>
        <h2 className="mt-3 font-serif text-[2.3rem] italic leading-tight text-prada" data-split="words">
          {v.done ? t.dayArrived : t.countdownTitle}
        </h2>
        {v.done ? (
          <Jepun className="mx-auto mt-8 w-20" />
        ) : (
          <div className="mt-10 flex justify-center gap-2.5" data-reveal="up" role="timer" aria-label={label}>
            <Unit n={v.d} label={t.days} min={v.d > 99 ? 3 : 2} />
            <Unit n={v.h} label={t.hours} />
            <Unit n={v.m} label={t.minutes} />
            <Unit n={v.s} label={t.seconds} />
          </div>
        )}
        {ev && (
          <a
            href={googleCalendarUrl(calEventFor(ev, c, lang))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost mt-10"
            data-reveal="up"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10 H21 M8 3 V7 M16 3 V7" strokeLinecap="round" />
            </svg>
            {t.saveDate}
          </a>
        )}
      </div>
    </Section>
  )
}
