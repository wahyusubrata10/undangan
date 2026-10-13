import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { CandiParas, Kokokan, PatraSari, SawahLayer } from '@/ornaments'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'

/** 11 · Penutup — terima kasih, Om Shanti; gapura paras menutup perlahan mengikuti scroll. */
export default function Closing() {
  const { t, c, reduced } = useApp()
  const [a, b] = coupleOrder()
  const gate = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !gate.current) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: gate.current, start: 'top 90%', end: 'bottom bottom', scrub: 1.2 } })
        .fromTo('.cl-left', { xPercent: -100 }, { xPercent: 0, ease: 'none' }, 0)
        .fromTo('.cl-right', { xPercent: 100 }, { xPercent: 0, ease: 'none' }, 0)
        .fromTo('.cl-far', { yPercent: 30 }, { yPercent: 0, ease: 'none' }, 0)
        .fromTo('.cl-mid', { yPercent: 50 }, { yPercent: 0, ease: 'none' }, 0)
    }, gate)
    return () => ctx.revert()
  }, [reduced])

  return (
    <Section id="closing" tone="cream" label={t.nav.closing} className="overflow-hidden">
      <div className="px-6 pb-12 pt-32 text-center">
        <div className="mx-auto w-[74%] max-w-sm overflow-hidden" data-curtain>
          <div>
            <SmartImage photo={wedding.photos.closing} alt={`${a.nick} & ${b.nick}`} label="Foto Penutup" ratio="3/4" sizes="(min-width:1024px) 384px, 74vw" className="w-full" />
          </div>
        </div>
        <p className="lead mx-auto mt-16 max-w-md" data-anim="lines">
          {c(wedding.greeting.closingText)}
        </p>
        <p className="mx-auto mt-5 max-w-sm text-[13px] text-ink-soft" data-anim="up">
          {c(wedding.greeting.thanks)}
        </p>
        <p className="label mt-20" data-anim="fade">
          {t.closingTitle}
        </p>
        <p className="display-i mt-4 text-[clamp(3.4rem,17vw,7rem)] text-ink" data-anim="lines">
          {a.nick} &amp; {b.nick}
        </p>
        <p className="aksara text-lg" lang="ban" data-anim="fade">
          {`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}
        </p>
        <PatraSari className="mx-auto mt-12 w-56" />
        <p className="accent mt-8 text-[1.5rem] text-prada" data-anim="lines">
          {c(wedding.greeting.closing)}
        </p>
      </div>

      {/* gapura menutup + sawah pagi */}
      <div ref={gate} className="relative h-[75svh] overflow-hidden" aria-hidden="true">
        <Kokokan className="inset-x-0 top-[6%] h-[30%]" count={6} duration={24} delay={-6} />
        <SawahLayer layer="far" className="cl-far absolute inset-x-0 bottom-[22%] h-[30%] w-full opacity-70" />
        <SawahLayer layer="mid" className="cl-mid absolute inset-x-0 bottom-[8%] h-[30%] w-full" />
        <div className="absolute inset-0 flex justify-center">
          <div className="cl-left relative h-full w-1/2">
            <CandiParas side="left" className="absolute bottom-0 right-0 h-[90%] w-auto max-w-none" />
          </div>
          <div className="cl-right relative h-full w-1/2">
            <CandiParas side="right" className="absolute bottom-0 left-0 h-[90%] w-auto max-w-none" />
          </div>
        </div>
        <SawahLayer layer="near" className="absolute inset-x-0 bottom-0 h-[14%] w-full" />
      </div>
      <footer className="bg-[#d3d8a6] px-6 pb-28 pt-4 text-center text-[12px] tracking-[0.3em] text-ink/60 uppercase">
        {a.nick} &amp; {b.nick} · {new Date(wedding.countdownTo).getFullYear()}
      </footer>
    </Section>
  )
}
