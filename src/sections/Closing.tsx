import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { gateShiftPx, PuraScene } from '@/ornaments/scene'
import { Bingkai, UkiranBand } from '@/ornaments/ukiran'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'
import { useMediaQuery } from '@/hooks/useEnv'

/** 10 · Penutup — terima kasih & Om Shanti; pemandangan pura di malam hari, candi bentar menutup perlahan. */
export default function Closing() {
  const { t, c, reduced } = useApp()
  const [a, b] = coupleOrder()
  const scene = useRef<HTMLDivElement>(null)
  const landscape = useMediaQuery('(min-aspect-ratio: 5/4)')

  useEffect(() => {
    if (reduced || !scene.current) return
    const ctx = gsap.context(() => {
      // gerbang (di dalam lukisan) menutup pelan mengikuti scroll — satu timeline, scrub halus
      gsap
        .timeline({ scrollTrigger: { trigger: scene.current, start: 'top 85%', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } })
        .fromTo('.sc-gate-l', { x: () => -gateShiftPx(scene.current) }, { x: 0, ease: 'none' }, 0)
        .fromTo('.sc-gate-r', { x: () => gateShiftPx(scene.current) }, { x: 0, ease: 'none' }, 0)
    }, scene)
    return () => ctx.revert()
  }, [reduced])

  return (
    <Section id="closing" tone="kayu" label={t.nav.closing} className="overflow-hidden">
      <div className="px-6 pb-16 pt-24 text-center lg:pt-36">
        <div className="relative mx-auto w-[74%] max-w-sm p-3" data-anim="photo">
          <Bingkai className="inset-0" corner="w-14 sm:w-20" />
          <SmartImage photo={wedding.photos.closing} alt={`${a.nick} & ${b.nick}`} label="Foto Penutup" ratio="3/4" sizes="(min-width:1024px) 384px, 72vw" className="w-full" />
        </div>
        <p className="lead mx-auto mt-14 max-w-md" data-anim="up">
          {c(wedding.greeting.closingText)}
        </p>
        <p className="mx-auto mt-4 max-w-sm text-[13px] text-gading-soft" data-anim="up">
          {c(wedding.greeting.thanks)}
        </p>
        <p className="label mt-16" data-anim="up">
          {t.closingTitle}
        </p>
        <p className="display-i gold-text mt-3 text-[clamp(3rem,13vw,5.5rem)]" data-anim="up">
          {a.nick} <span className="accent align-middle text-[0.4em] not-italic">&amp;</span> {b.nick}
        </p>
        <p className="aksara text-lg" lang="ban" data-anim="up">
          {`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}
        </p>
        <UkiranBand className="mx-auto mt-10 w-64" />
        <p className="accent gold-text mt-6 text-[clamp(1.2rem,5.4vw,1.6rem)]" data-anim="up">
          {c(wedding.greeting.closing)}
        </p>
      </div>

      {/* pemandangan pura malam, gerbang menutup. content-visibility: browser melewati render (bintang
          berkelip, nyala pelita) selama bagian ini di luar layar → scroll di atasnya tetap ringan */}
      <div ref={scene} className="relative h-[78svh] overflow-hidden [content-visibility:auto] lg:h-[86svh]" aria-hidden="true">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_18%)]">
          <PuraScene variant="fajar" still landscape={landscape} className="h-full w-full" />
        </div>
      </div>
      <footer className="border-t border-emas/20 bg-[#0b0907] px-6 pb-28 pt-6 text-center text-[12px] tracking-[0.3em] text-emas/80 uppercase">
        {a.nick} &amp; {b.nick} · {new Date(wedding.countdownTo).getFullYear()}
      </footer>
    </Section>
  )
}
