import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { Kokokan, PatraSari } from '@/ornaments'
import { FloralCorner, PuraScene } from '@/ornaments/scene'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'
import { useMediaQuery } from '@/hooks/useEnv'

/** 10 · Penutup — terima kasih & Om Shanti; pemandangan pura senja, candi bentar menutup perlahan. */
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
        .timeline({ scrollTrigger: { trigger: scene.current, start: 'top 85%', end: 'bottom bottom', scrub: 0.6 } })
        .fromTo('.sc-gate-l', { x: -170 }, { x: 0, ease: 'none' }, 0)
        .fromTo('.sc-gate-r', { x: 170 }, { x: 0, ease: 'none' }, 0)
    }, scene)
    return () => ctx.revert()
  }, [reduced])

  return (
    <Section id="closing" tone="cream" label={t.nav.closing} className="overflow-hidden">
      <FloralCorner className="pointer-events-none absolute -right-4 top-10 w-40 sm:w-56" />
      <div className="px-6 pb-16 pt-24 text-center lg:pt-36">
        <div className="mx-auto w-[72%] max-w-sm overflow-hidden" data-anim="photo">
          <SmartImage photo={wedding.photos.closing} alt={`${a.nick} & ${b.nick}`} label="Foto Penutup" ratio="3/4" sizes="(min-width:1024px) 384px, 72vw" className="w-full" />
        </div>
        <p className="lead mx-auto mt-14 max-w-md" data-anim="up">
          {c(wedding.greeting.closingText)}
        </p>
        <p className="mx-auto mt-4 max-w-sm text-[13px] text-ink-soft" data-anim="up">
          {c(wedding.greeting.thanks)}
        </p>
        <p className="label mt-16" data-anim="up">
          {t.closingTitle}
        </p>
        <p className="display-i mt-3 text-[clamp(3rem,13vw,5.5rem)] text-ink" data-anim="up">
          {a.nick} <span className="accent align-middle text-[0.4em] not-italic text-prada">&amp;</span> {b.nick}
        </p>
        <p className="aksara text-lg" lang="ban" data-anim="up">
          {`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}
        </p>
        <PatraSari className="mx-auto mt-10 w-56" />
        <p className="accent mt-6 text-[1.5rem] text-prada" data-anim="up">
          {c(wedding.greeting.closing)}
        </p>
      </div>

      {/* pemandangan pura senja, gerbang menutup */}
      <div ref={scene} className="relative h-[78svh] overflow-hidden lg:h-[86svh]" aria-hidden="true">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_18%)]">
          <PuraScene variant="senja" landscape={landscape} className="h-full w-full" />
        </div>
        <Kokokan className="inset-x-0 top-[18%] h-[22%]" count={5} duration={26} delay={-6} />
      </div>
      <footer className="bg-[#a3b489] px-6 pb-28 pt-5 text-center text-[12px] tracking-[0.3em] text-ink/70 uppercase">
        {a.nick} &amp; {b.nick} · {new Date(wedding.countdownTo).getFullYear()}
      </footer>
    </Section>
  )
}
