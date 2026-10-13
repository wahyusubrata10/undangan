import { forwardRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { PuraScene } from '@/ornaments/scene'
import { UkiranTiang } from '@/ornaments/ukiran'
import { dotDate } from '@/lib/format'
import { toAksaraBali } from '@/lib/aksara'
import { coupleOrder } from '@/lib/couple'
import { useMediaQuery } from '@/hooks/useEnv'

interface Props {
  onOpen: () => void
  opening: boolean
}

/**
 * Cover — pemandangan pura di malam bulan purnama (ilustrasi SVG) dengan candi bentar bergaris prada,
 * meru, kelapa, kolam teratai; dibingkai tiang ukiran emas di kiri-kanan & sudut patra punggel.
 *  • HP (potret): nama di langit atas, tamu & tombol di area kolam bawah.
 *  • Layar lebar: semua teks di langit atas, pemandangan bebas di bawah.
 * Bagian ini masuk bundle awal → tanpa GSAP. Animasi pembuka di fx/opening.ts.
 */
const Cover = forwardRef<HTMLDivElement, Props>(function Cover({ onOpen, opening }, ref) {
  const { t, c, guest } = useApp()
  const [a, b] = coupleOrder()
  const main = wedding.events[0]
  const landscape = useMediaQuery('(min-aspect-ratio: 5/4)')
  // layar lebar: teks di kiri (di atas siluet gelap), gapura & bulan bebas di tengah-kanan
  const wide = useMediaQuery('(min-width: 1024px) and (min-aspect-ratio: 5/4)')

  const names = (
    <>
      <p className="label">{c(wedding.eventTitle)}</p>
      <h1 className="display-i gold-text mt-3 px-2 text-[clamp(3.2rem,15vw,6rem)] lg:-ml-2 lg:px-0">
        {a.nick}
        <span className="accent mx-2 align-middle text-[0.42em] not-italic">&amp;</span>
        {b.nick}
      </h1>
      <p className="aksara text-[17px]" lang="ban">
        {`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}
      </p>
      {main && <p className="mt-1 text-[12px] tracking-[0.5em] text-gading-soft">{dotDate(main.start, main.tzLabel)}</p>}
    </>
  )

  const guestBlock = (
    <>
      <p className="label">{t.dear}</p>
      <p className="mt-2 text-[13px] text-gading-soft">{guest.salutation}</p>
      <p className="display mt-1 max-w-[20rem] text-[2rem] leading-tight text-gading" data-testid="guest-name">
        {guest.name}
      </p>
      <button type="button" onClick={onOpen} disabled={opening} className="cv-btn btn mt-6" aria-label={t.openInvitation}>
        <span className="relative grid h-2 w-2 place-items-center">
          <span className="absolute h-2 w-2 rounded-full bg-jepun" style={{ animation: 'breathe 2.4s ease-in-out infinite' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-jepun" />
        </span>
        {t.openInvitation}
      </button>
      {guest.personalized && <p className="mt-3 text-[12px] text-gading-mute">{t.sorryTypo}</p>}
    </>
  )

  return (
    <div ref={ref} className="cover fixed inset-0 z-50 overflow-hidden bg-malam select-none" role="dialog" aria-modal="true" aria-label={`${c(wedding.eventTitle)} ${a.nick} & ${b.nick}`}>
      {/* pemandangan */}
      <div className="cv-scene absolute inset-0 will-change-transform" aria-hidden="true">
        <PuraScene landscape={landscape} className="h-full w-full" />
      </div>

      {wide && <div className="pointer-events-none absolute inset-y-0 left-0 w-[58%] bg-[linear-gradient(to_right,rgba(10,8,6,.92)_0%,rgba(10,8,6,.78)_55%,rgba(10,8,6,0))]" aria-hidden="true" />}

      {/* bingkai ukiran: tiang kiri-kanan */}
      <div className="cv-flora-l pointer-events-none absolute inset-y-0 left-0 w-[10%] max-w-[110px] lg:w-[6%]" aria-hidden="true">
        <UkiranTiang side="left" className="h-full w-full" />
      </div>
      <div className="cv-flora-r pointer-events-none absolute inset-y-0 right-0 w-[10%] max-w-[110px] lg:w-[6%]" aria-hidden="true">
        <UkiranTiang side="right" className="h-full w-full" />
      </div>

      {wide ? (
        <>
          <header className="cv-top absolute inset-y-0 left-[9%] z-10 flex w-[38%] flex-col items-start justify-center text-left">
            {names}
            <div className="mt-12 flex flex-col items-start">{guestBlock}</div>
          </header>
        </>
      ) : (
        <>
          <header className="cv-top absolute inset-x-0 top-0 z-10 flex flex-col items-center px-[12%] pt-[max(2.2rem,env(safe-area-inset-top))] text-center">
            {names}
          </header>
          <div className="cv-plaque absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-[12%] pb-[max(2rem,env(safe-area-inset-bottom))] pt-32 text-center bg-[linear-gradient(to_top,rgba(10,8,6,.97)_0%,rgba(10,8,6,.92)_62%,rgba(10,8,6,0))]">
            {guestBlock}
          </div>
        </>
      )}
    </div>
  )
})

export default Cover
