import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { Janur, Jepun, PatraPunggel } from '@/ornaments'

/**
 * Love story: section di-pin, scroll vertikal menggeser timeline horizontal.
 * Janur (garis waktu) tumbuh mengikuti progres. Reduced motion → susunan vertikal biasa.
 */
export default function Story() {
  const { t, c, reduced } = useApp()
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLDivElement>(null)
  const chapters = wedding.story.chapters

  useEffect(() => {
    if (reduced || !wrap.current || !track.current) return
    const ctx = gsap.context(() => {
      const tr = track.current!
      const distance = () => tr.scrollWidth - tr.clientWidth
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      if (line.current) gsap.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: wrap.current, start: 'top top', end: () => `+=${distance()}`, scrub: true } })
      // parallax foto di dalam kartu
      gsap.utils.toArray<HTMLElement>('.story-photo img', tr).forEach((img) => {
        gsap.fromTo(img, { xPercent: -8, scale: 1.15 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: img, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
      })
      gsap.utils.toArray<HTMLElement>('.story-card', tr).forEach((card) => {
        gsap.from(card.querySelectorAll('.story-text > *'), {
          y: 30,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 75%' },
        })
      })
    }, wrap)
    return () => ctx.revert()
  }, [reduced])

  if (!wedding.story.enabled || chapters.length === 0) return null

  return (
    <Section id="story" sweep label={t.nav.story} bg="dim">
      <div ref={wrap} className={`relative overflow-hidden ${reduced ? '' : 'h-svh'}`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,rgba(74,14,18,.55),transparent)]" />
        <header className="relative px-6 pt-[max(4.5rem,9vh)] text-center">
          <p className="eyebrow">{t.storySub}</p>
          <h2 className="mt-2 font-serif text-[2.6rem] italic leading-none text-prada">{t.storyTitle}</h2>
        </header>

        {/* garis janur */}
        {!reduced && (
          <div className="absolute inset-x-6 bottom-[9vh] h-6">
            <Janur length={400} className="absolute inset-0 h-full w-full opacity-25" />
            <div ref={line} className="absolute inset-0 origin-left">
              <Janur length={400} className="h-full w-full" />
            </div>
          </div>
        )}

        <div
          ref={track}
          className={reduced ? 'relative flex flex-col gap-10 px-6 py-12' : 'relative mt-6 flex h-[calc(100%-11rem)] items-center gap-6 pl-6 pr-[10vw] will-change-transform'}
        >
          {chapters.map((ch, i) => (
            <article key={i} className={`story-card relative shrink-0 ${reduced ? '' : 'w-[78vw] max-w-[340px] lg:w-[calc(var(--invite-w)*.72)]'}`}>
              <div className="glass overflow-hidden rounded-[26px] p-3">
                <div className="story-photo relative overflow-hidden rounded-[20px]">
                  <SmartImage photo={ch.photo} alt={c(ch.title)} label={`${t.photo} ${i + 1}`} ratio="4/5" sizes="(min-width:1024px) 360px, 78vw" className="max-h-[38svh] w-full" />
                  <span className="absolute left-3 top-3 rounded-full bg-hitam/70 px-3 py-1 font-display text-[11px] tracking-[0.3em] text-prada-light">{c(ch.date)}</span>
                </div>
                <div className="story-text px-3 pb-3 pt-4">
                  <div className="flex items-center gap-2">
                    <Jepun className="w-5" />
                    <h3 className="font-serif text-[1.55rem] italic leading-tight text-prada-light">{c(ch.title)}</h3>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-gading/85">{c(ch.text)}</p>
                </div>
              </div>
              <span className="absolute -bottom-3 left-1/2 hidden h-3 w-3 -translate-x-1/2 rotate-45 border border-prada bg-hitam" />
            </article>
          ))}
          {!reduced && (
            <div className="flex shrink-0 flex-col items-center justify-center px-6 text-center">
              <PatraPunggel className="w-20" />
              <p className="mt-3 font-serif text-xl italic text-prada">…{c({ id: 'dan selamanya', en: 'and forever' })}</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

// pastikan plugin terdaftar bila modul ini dimuat lebih dulu
gsap.registerPlugin(ScrollTrigger)
