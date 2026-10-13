import { forwardRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Kokokan } from '@/ornaments'
import { FloralGarland, PuraScene } from '@/ornaments/scene'
import { dotDate } from '@/lib/format'
import { toAksaraBali } from '@/lib/aksara'
import { coupleOrder } from '@/lib/couple'
import { useMediaQuery } from '@/hooks/useEnv'

interface Props {
  onOpen: () => void
  opening: boolean
}

/**
 * Cover — pemandangan pura di pagi hari (ilustrasi SVG) dengan candi bentar, meru, kelapa,
 * kolam teratai, dibingkai bunga jepun & anggrek.
 *  • HP (potret): nama di langit atas, tamu & tombol di area kolam bawah.
 *  • Layar lebar: semua teks di langit atas, pemandangan bebas di bawah.
 * Bagian ini masuk bundle awal → tanpa GSAP. Animasi pembuka di fx/opening.ts.
 */
const Cover = forwardRef<HTMLDivElement, Props>(function Cover({ onOpen, opening }, ref) {
  const { t, c, guest } = useApp()
  const [a, b] = coupleOrder()
  const main = wedding.events[0]
  const landscape = useMediaQuery('(min-aspect-ratio: 5/4)')

  const names = (
    <>
      <p className="label">{c(wedding.eventTitle)}</p>
      <h1 className="display-i mt-3 text-[clamp(3.2rem,15vw,6rem)] text-ink">
        {a.nick}
        <span className="accent mx-2 align-middle text-[0.42em] not-italic text-prada">&amp;</span>
        {b.nick}
      </h1>
      <p className="aksara text-[17px]" lang="ban">
        {`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}
      </p>
      {main && <p className="mt-1 text-[12px] tracking-[0.5em] text-ink-soft">{dotDate(main.start, main.tzLabel)}</p>}
    </>
  )

  const guestBlock = (
    <>
      <p className="label">{t.dear}</p>
      <p className="mt-2 text-[13px] text-ink-soft">{guest.salutation}</p>
      <p className="display mt-1 max-w-[20rem] text-[2rem] leading-tight text-ink" data-testid="guest-name">
        {guest.name}
      </p>
      <button type="button" onClick={onOpen} disabled={opening} className="cv-btn btn mt-6" aria-label={t.openInvitation}>
        <span className="relative grid h-2 w-2 place-items-center">
          <span className="absolute h-2 w-2 rounded-full bg-jepun" style={{ animation: 'breathe 2.4s ease-in-out infinite' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-jepun" />
        </span>
        {t.openInvitation}
      </button>
      {guest.personalized && <p className="mt-3 text-[12px] text-ink-mute">{t.sorryTypo}</p>}
    </>
  )

  return (
    <div ref={ref} className="cover fixed inset-0 z-50 overflow-hidden bg-ivory select-none" role="dialog" aria-modal="true" aria-label={`${c(wedding.eventTitle)} ${a.nick} & ${b.nick}`}>
      {/* pemandangan */}
      <div className="cv-scene absolute inset-0 will-change-transform" aria-hidden="true">
        <PuraScene landscape={landscape} className="h-full w-full" />
        <Kokokan className="inset-x-0 top-[14%] h-[18%]" count={4} duration={30} />
      </div>

      {/* bingkai bunga kiri-kanan */}
      <div className="cv-flora-l pointer-events-none absolute inset-y-0 left-0 w-[21%] max-w-[230px] lg:w-[15%]" aria-hidden="true">
        <FloralGarland side="left" className="h-full w-full" />
      </div>
      <div className="cv-flora-r pointer-events-none absolute inset-y-0 right-0 w-[21%] max-w-[230px] lg:w-[15%]" aria-hidden="true">
        <FloralGarland side="right" className="h-full w-full" />
      </div>

      {landscape ? (
        <header className="cv-top absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-[5svh] text-center">
          {names}
          <div className="mt-5 flex flex-col items-center">{guestBlock}</div>
        </header>
      ) : (
        <>
          <header className="cv-top absolute inset-x-0 top-0 z-10 flex flex-col items-center px-[22%] pt-[max(2rem,env(safe-area-inset-top))] text-center">
            {names}
          </header>
          <div className="cv-plaque absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24 text-center bg-[linear-gradient(to_top,rgba(251,248,242,.97)_0%,rgba(251,248,242,.9)_58%,rgba(251,248,242,0))]">
            {guestBlock}
          </div>
        </>
      )}
    </div>
  )
})

export default Cover
