import { forwardRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { CandiBentar, Divider, Jepun, Penjor } from '@/ornaments'
import { dotDate } from '@/lib/format'
import { toAksaraBali } from '@/lib/aksara'
import { coupleOrder } from '@/lib/couple'

interface Props {
  onOpen: () => void
  opening: boolean
}

/**
 * Cover: dua sisi candi bentar tertutup. Bagian ini masuk bundle awal → tanpa GSAP/Three.
 * Animasi pembuka dijalankan dari fx/opening.ts (di-load saat idle).
 */
const Cover = forwardRef<HTMLDivElement, Props>(function Cover({ onOpen, opening }, ref) {
  const { t, c, guest } = useApp()
  const [a, b] = coupleOrder()
  const aksara = `${a.aksara || toAksaraBali(a.nick)} ᭞ ${b.aksara || toAksaraBali(b.nick)}`
  const main = wedding.events[0]

  return (
    <div
      ref={ref}
      className="cover fixed inset-0 z-50 overflow-hidden bg-hitam select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`${c(wedding.eventTitle)} ${a.nick} & ${b.nick}`}
    >
      {/* langit & cahaya di balik gerbang */}
      <div className="cv-sky absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_58%,#5a1a12_0%,#2a0709_45%,#0b0807_100%)]" />
        <div className="cv-glow absolute left-1/2 top-[52%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,227,163,.55)_0%,rgba(201,162,75,.18)_35%,transparent_70%)]" />
        {/* tangga menuju gerbang */}
        <svg className="absolute bottom-0 left-1/2 h-[24vh] w-[140%] -translate-x-1/2" viewBox="0 0 400 100" preserveAspectRatio="none">
          {Array.from({ length: 9 }, (_, i) => {
            const y = 100 - i * 11
            const inset = 40 + i * 14
            return <path key={i} d={`M${inset} ${y} H${400 - inset}`} stroke="#c9a24b" strokeOpacity={0.12 + i * 0.03} strokeWidth=".6" />
          })}
        </svg>
      </div>

      {/* sinar di celah gerbang */}
      <div className="cv-crack pointer-events-none absolute left-1/2 top-[22%] bottom-0 w-[3px] -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(247,227,163,.95)_25%,rgba(247,227,163,.8)_75%,transparent)] blur-[1px]" aria-hidden="true" />

      {/* gerbang */}
      <div className="cv-gate pointer-events-none absolute inset-x-0 bottom-0 flex h-[min(84svh,calc(50vw*3.4))] justify-center" aria-hidden="true">
        <div className="cv-left relative h-full w-1/2 will-change-transform">
          <CandiBentar side="left" className="absolute bottom-0 right-0 h-full w-auto max-w-none" />
        </div>
        <div className="cv-right relative h-full w-1/2 will-change-transform">
          <CandiBentar side="right" className="absolute bottom-0 left-0 h-full w-auto max-w-none" />
        </div>
      </div>

      {/* asap dupa */}
      <div className="cv-smoke pointer-events-none absolute bottom-[8%] left-1/2 h-0 w-0" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute -left-10 -top-10 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(243,233,210,.22),transparent_65%)]"
            style={{ animation: `smoke-rise ${9 + i * 1.7}s ease-out ${i * 1.9}s infinite`, ['--dx' as string]: `${(i % 2 ? 1 : -1) * (14 + i * 9)}px` }}
          />
        ))}
      </div>

      {/* penjor di depan */}
      <div className="cv-penjor-l pointer-events-none absolute -left-4 bottom-0 h-[64svh] opacity-75" aria-hidden="true">
        <Penjor className="h-full w-auto -scale-x-100" />
      </div>
      <div className="cv-penjor-r pointer-events-none absolute -right-4 bottom-0 h-[64svh] opacity-75" aria-hidden="true">
        <Penjor className="h-full w-auto" />
      </div>

      <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* teks atas */}
      <header className="cv-top absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-center">
        <p className="eyebrow">{c(wedding.eventTitle)}</p>
        <p className="aksara text-prada mt-1 text-[22px]" lang="ban">
          {aksara}
        </p>
      </header>

      {/* plakat bawah */}
      <div className="cv-plaque absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24 text-center bg-[linear-gradient(to_top,rgba(11,8,7,.96)_0%,rgba(11,8,7,.88)_55%,transparent)]">
        <h1 className="display-name text-prada is-shimmer text-[clamp(3.2rem,15vw,5.5rem)]">
          {a.nick}
          <span className="mx-2 font-display text-[0.45em] not-italic align-middle text-prada-light">&amp;</span>
          {b.nick}
        </h1>
        {main && <p className="mt-2 font-display text-[12px] tracking-[0.42em] text-gading-dim">{dotDate(main.start, main.tzLabel)}</p>}
        <Divider className="my-4 w-40" />
        <p className="text-[12px] tracking-[0.18em] uppercase text-gading-dim">{t.dear}</p>
        <p className="mt-0.5 text-[13px] text-gading-dim">{guest.salutation}</p>
        <p className="mt-1 max-w-[18rem] font-serif text-[1.65rem] leading-tight text-gading" data-testid="guest-name">
          {guest.name}
        </p>
        <button type="button" onClick={onOpen} disabled={opening} className="cv-btn btn-prada mt-6" aria-label={t.openInvitation}>
          <span className="relative -ml-1 grid h-6 w-6 place-items-center">
            <span className="absolute inset-0 rounded-full bg-prada-light/60" style={{ animation: 'pulse-ring 2.2s ease-out infinite' }} />
            <Jepun className="relative h-6 w-6" />
          </span>
          {t.openInvitation}
        </button>
        {guest.personalized && <p className="mt-3 text-[10px] text-gading/40">{t.sorryTypo}</p>}
      </div>
    </div>
  )
})

export default Cover
