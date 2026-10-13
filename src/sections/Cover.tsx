import { forwardRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { CandiBali, Kokokan, Penjor, SawahLayer, SunRays } from '@/ornaments'
import { dotDate } from '@/lib/format'
import { toAksaraBali } from '@/lib/aksara'
import { coupleOrder } from '@/lib/couple'

interface Props {
  onOpen: () => void
  opening: boolean
}

/**
 * Cover — cahaya pagi: langit ivory, kabut tipis, sawah terasering, candi bentar batu paras putih.
 * Masuk bundle awal → tanpa GSAP. Animasi pembuka ada di fx/opening.ts.
 */
const Cover = forwardRef<HTMLDivElement, Props>(function Cover({ onOpen, opening }, ref) {
  const { t, c, guest } = useApp()
  const [a, b] = coupleOrder()
  const main = wedding.events[0]

  return (
    <div ref={ref} className="cover fixed inset-0 z-50 overflow-hidden bg-ivory select-none" role="dialog" aria-modal="true" aria-label={`${c(wedding.eventTitle)} ${a.nick} & ${b.nick}`}>
      {/* langit pagi + matahari lembut */}
      <div className="cv-sky absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7f1e6_0%,#fbf8f2_45%,#f3ebdd_100%)]" />
        <div className="cv-sun absolute left-1/2 top-[30%] h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,236,190,.85)_0%,rgba(255,236,190,.25)_40%,transparent_70%)]" />
        <SunRays className="left-1/2 top-[30%] h-[120vh] w-[120vh] -translate-x-1/2 -translate-y-1/2" />
        <Kokokan className="inset-x-0 top-[14%] h-[26%]" count={5} duration={30} />
        <SawahLayer layer="far" className="absolute inset-x-0 bottom-[16%] h-[22vh] w-full opacity-70" />
        <SawahLayer layer="mid" className="absolute inset-x-0 bottom-[6%] h-[22vh] w-full opacity-80" />
        {/* kabut pagi */}
        <div className="absolute inset-x-[-10%] bottom-[14%] h-[18vh] bg-[radial-gradient(50%_60%_at_50%_50%,rgba(255,255,255,.9),transparent)]" style={{ animation: 'mist 14s ease-in-out infinite alternate' }} />
      </div>

      {/* candi bentar paras putih */}
      <div className="cv-gate pointer-events-none absolute inset-x-0 bottom-0 flex h-[min(66svh,calc(50vw*2))] justify-center" aria-hidden="true">
        <div className="cv-left relative h-full w-1/2 will-change-transform">
          <CandiBali side="left" className="absolute bottom-0 right-0 h-full w-auto max-w-none" />
        </div>
        <div className="cv-right relative h-full w-1/2 will-change-transform">
          <CandiBali side="right" className="absolute bottom-0 left-0 h-full w-auto max-w-none" />
        </div>
      </div>
      {/* penjor di kiri & kanan, melambai pelan */}
      <div className="cv-penjor-l pointer-events-none absolute -left-3 bottom-[4vh] h-[58svh] opacity-80" aria-hidden="true">
        <div className="penjor-sway h-full">
          <Penjor className="h-full w-auto -scale-x-100" />
        </div>
      </div>
      <div className="cv-penjor-r pointer-events-none absolute -right-3 bottom-[4vh] h-[58svh] opacity-80" aria-hidden="true">
        <div className="penjor-sway h-full" style={{ animationDelay: '-4s' }}>
          <Penjor className="h-full w-auto" />
        </div>
      </div>
      <SawahLayer layer="near" className="cv-near pointer-events-none absolute inset-x-0 bottom-0 h-[12vh] w-full" />

      {/* teks */}
      <header className="cv-top absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-[max(2.2rem,env(safe-area-inset-top))] text-center">
        <p className="label">{c(wedding.eventTitle)}</p>
        <h1 className="display-i mt-3 text-[clamp(3.4rem,17vw,6.5rem)] text-ink">
          {a.nick}
          <span className="accent mx-2 align-middle text-[0.42em] not-italic text-prada">&amp;</span>
          {b.nick}
        </h1>
        <p className="aksara mt-1 text-[18px]" lang="ban">
          {`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}
        </p>
        {main && <p className="mt-1 text-[12px] tracking-[0.5em] text-ink-soft">{dotDate(main.start, main.tzLabel)}</p>}
      </header>

      <div className="cv-plaque absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-[max(2.2rem,env(safe-area-inset-bottom))] pt-28 text-center bg-[linear-gradient(to_top,rgba(251,248,242,.97)_0%,rgba(251,248,242,.9)_55%,transparent)]">
        <p className="label">{t.dear}</p>
        <p className="mt-2 text-[13px] text-ink-soft">{guest.salutation}</p>
        <p className="display mt-1 max-w-[20rem] text-[2rem] leading-tight text-ink" data-testid="guest-name">
          {guest.name}
        </p>
        <button type="button" onClick={onOpen} disabled={opening} className="cv-btn btn mt-7" aria-label={t.openInvitation}>
          <span className="relative grid h-2 w-2 place-items-center">
            <span className="absolute h-2 w-2 rounded-full bg-jepun" style={{ animation: 'breathe 2.4s ease-in-out infinite' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-jepun" />
          </span>
          {t.openInvitation}
        </button>
        {guest.personalized && <p className="mt-4 text-[12px] text-ink-mute">{t.sorryTypo}</p>}
      </div>
    </div>
  )
})

export default Cover
