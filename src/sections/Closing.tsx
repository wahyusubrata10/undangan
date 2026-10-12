import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { CandiBentar, Divider, Jepun } from '@/ornaments'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'

/** Penutup: foto, terima kasih, salam — lalu gapura menutup perlahan mengikuti scroll. */
export default function Closing() {
  const { t, c, reduced } = useApp()
  const [a, b] = coupleOrder()
  const gate = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !gate.current) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: gate.current, start: 'top 85%', end: 'bottom bottom', scrub: 1 } })
      tl.fromTo('.cl-left', { xPercent: -100 }, { xPercent: 0, ease: 'power2.out' }, 0)
        .fromTo('.cl-right', { xPercent: 100 }, { xPercent: 0, ease: 'power2.out' }, 0)
        .fromTo('.cl-light', { scaleX: 6, opacity: 0.2 }, { scaleX: 1, opacity: 1, ease: 'none' }, 0.2)
    }, gate)
    return () => ctx.revert()
  }, [reduced])

  return (
    <Section id="closing" sweep label={t.nav.closing} className="overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,8,7,.7),rgba(11,8,7,.95)_60%,#0b0807)]" />
      <div className="relative px-6 pb-10 pt-24 text-center">
        <div className="relative mx-auto w-[78%] max-w-[320px]" data-reveal="scale">
          <div data-mask="arch" className="overflow-hidden rounded-t-full">
            <SmartImage photo={wedding.photos.closing} alt={`${a.nick} & ${b.nick}`} label="Foto Penutup" ratio="3/4" sizes="(min-width:1024px) 320px, 78vw" className="rounded-t-full" />
          </div>
          <div className="pointer-events-none absolute -inset-2 rounded-t-full border border-prada/50" />
        </div>
        <p className="mx-auto mt-10 max-w-sm font-serif text-[1.15rem] italic leading-relaxed text-gading" data-reveal="up">
          {c(wedding.greeting.closingText)}
        </p>
        <p className="mx-auto mt-4 max-w-sm text-[13px] text-gading-dim" data-reveal="up">
          {c(wedding.greeting.thanks)}
        </p>
        <h2 className="mt-10 font-display text-[12px] tracking-[0.45em] text-gading-dim uppercase" data-reveal="fade">
          {t.closingTitle}
        </h2>
        <p className="display-name text-prada mt-3 text-[clamp(3rem,15vw,4.6rem)]" data-split="chars">
          {a.nick} &amp; {b.nick}
        </p>
        <p className="aksara text-prada mt-1 text-2xl" lang="ban" data-reveal="fade">
          {`${a.aksara || toAksaraBali(a.nick)} ᭞ ${b.aksara || toAksaraBali(b.nick)}`}
        </p>
        <Divider className="mx-auto my-8 w-40" />
        <p className="font-display text-[14px] tracking-[0.35em] text-prada-light" data-split="chars">
          {c(wedding.greeting.closing)}
        </p>
      </div>

      {/* gapura menutup */}
      <div ref={gate} className="relative h-[70svh] overflow-hidden" aria-hidden="true">
        <div className="cl-light absolute bottom-0 left-1/2 top-[12%] w-[3px] -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(247,227,163,.9)_30%,rgba(247,227,163,.6))]" />
        <div className="absolute inset-0 flex justify-center">
          <div className="cl-left relative h-full w-1/2">
            <CandiBentar side="left" className="absolute bottom-0 right-0 h-[92%] w-auto max-w-none" />
          </div>
          <div className="cl-right relative h-full w-1/2">
            <CandiBentar side="right" className="absolute bottom-0 left-0 h-[92%] w-auto max-w-none" />
          </div>
        </div>
        <Jepun className="absolute bottom-6 left-1/2 w-10 -translate-x-1/2" style={{ animation: 'float-y 4s ease-in-out infinite' }} />
      </div>
      <footer className="relative bg-hitam px-6 pb-28 pt-6 text-center text-[10px] tracking-[0.2em] text-gading-dim/50 uppercase">
        {a.nick} &amp; {b.nick} · {new Date(wedding.countdownTo).getFullYear()}
      </footer>
    </Section>
  )
}
