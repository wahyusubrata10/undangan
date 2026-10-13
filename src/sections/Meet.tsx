import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { Person } from '@/config/types'
import SmartImage from '@/components/SmartImage'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'
import { photoUrl } from '@/lib/media'
import { Bingkai } from '@/ornaments/ukiran'

gsap.registerPlugin(ScrollTrigger)

/**
 * 3 · 4 · 5 — PRIA → WANITA → BERDUA sebagai panel bertumpuk.
 * Tiap panel `position: sticky` → panel berikutnya meluncur naik menutupi panel sebelumnya
 * dengan scroll NATIVE (tanpa pin JavaScript) sehingga paling mulus di HP.
 * Di antara panel ada jeda kosong (tak terlihat) agar tiap panel sempat diam utuh.
 * Sentuhan halus (scrub, hanya transform/opacity):
 *  • foto di panel yang masuk perlahan zoom-out (1.08 → 1)
 *  • panel yang tertutup sedikit mengecil & meredup → terasa berlapis/berkesinambungan
 */
function PersonPanel({ p, role, mirror }: { p: Person; role: string; mirror?: boolean }) {
  const { c } = useApp()
  return (
    <div className="mt-panel-inner relative h-full w-full bg-malam">
      <Bingkai />
      {/* foto: HP full-bleed, desktop 58% */}
      <div className={`absolute inset-0 overflow-hidden ${mirror ? 'lg:right-[42%]' : 'lg:left-[42%]'}`}>
        <div className="mt-photo absolute inset-0">
          <SmartImage photo={p.photo} alt={p.fullName} sizes="(min-width:1024px) 58vw, 100vw" className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-[linear-gradient(to_top,rgba(14,10,7,.97)_0%,rgba(14,10,7,.86)_40%,rgba(14,10,7,0))] lg:hidden" />
      </div>
      {/* teks */}
      <div
        className={`absolute inset-x-0 bottom-0 z-10 px-9 pb-[max(3.5rem,env(safe-area-inset-bottom))] lg:inset-y-0 lg:flex lg:w-[42%] lg:flex-col lg:justify-center lg:px-16 ${mirror ? 'lg:left-auto lg:right-0' : ''}`}
      >
        <p className="label" data-anim="up">
          {role}
        </p>
        <p className="aksara mt-2 text-lg" lang="ban" data-anim="up">
          {p.aksara || toAksaraBali(p.nick)}
        </p>
        <h3 className="display-i text-[clamp(2.5rem,10.5vw,4.4rem)] text-gading" data-anim="up">
          {p.fullName}
        </h3>
        <div data-anim="up">
          <p className="mt-5 text-[13px] text-gading-soft">{c(p.childOf)}</p>
          <p className="font-display text-[1.25rem] leading-snug text-gading">
            {p.father}
            <br />
            &amp; {p.mother}
          </p>
          {p.origin && <p className="mt-2 text-[12px] text-gading-mute">{c(p.origin)}</p>}
          {p.instagram && (
            <a href={`https://instagram.com/${p.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="link-u mt-4 inline-block text-[12px] tracking-[0.2em] text-gading-soft">
              @{p.instagram.replace(/^@/, '')}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function CoupleMedia() {
  const v = wedding.video.couple
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = video.current
    if (!el) return
    // putar hanya saat terlihat (hemat baterai)
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting && !document.hidden) void el.play().catch(() => {})
      else el.pause()
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const lowData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  if ((v.mp4 || v.webm) && !lowData)
    return (
      <video ref={video} className="h-full w-full object-cover" muted loop playsInline preload="metadata" poster={photoUrl(v.poster || wedding.photos.couple, 1280)} disablePictureInPicture>
        {v.webm && <source src={v.webm} type="video/webm" />}
        {v.mp4 && <source src={v.mp4} type="video/mp4" />}
      </video>
    )
  return <SmartImage photo={wedding.photos.couple} alt={`${wedding.groom.nick} & ${wedding.bride.nick}`} label="Foto Berdua" sizes="100vw" className="h-full w-full" />
}

export default function Meet() {
  const { t, c, reduced } = useApp()
  const [a, b] = coupleOrder()
  const roleOf = (p: Person) => (p === wedding.groom ? t.groom : t.bride)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (reduced || !root.current) return
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.mt-panel', root.current)
      panels.forEach((panel, i) => {
        const photo = panel.querySelector<HTMLElement>('.mt-photo')
        // foto zoom-out pelan saat panel naik masuk layar
        if (photo && i > 0)
          gsap.fromTo(photo, { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'top top', scrub: true } })
        // panel yang akan tertutup: mengecil & meredup sedikit
        const next = panels[i + 1]
        const inner = panel.querySelector<HTMLElement>('.mt-panel-inner')
        if (next && inner)
          gsap.fromTo(
            inner,
            { scale: 1, opacity: 1 },
            {
              scale: 0.94,
              opacity: 0.55,
              ease: 'none',
              scrollTrigger: {
                trigger: next,
                start: 'top bottom',
                end: 'top top',
                scrub: true,
                onToggle: (self) => (inner.style.willChange = self.isActive ? 'transform, opacity' : ''),
              },
            },
          )
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  // jeda: panel diam penuh selama ±45% layar sebelum panel berikutnya naik → teks sempat terbaca
  const hold = <div className="h-[45svh]" aria-hidden="true" />

  const coupleText = (
    <div className="absolute inset-x-0 bottom-0 z-10 px-7 pb-[max(3.5rem,env(safe-area-inset-bottom))] text-center lg:pb-20">
      <p className="label" data-anim="up">
        {t.nav.couple}
      </p>
      <h3 className="display-i gold-text mt-3 text-[clamp(3.4rem,16vw,7.5rem)]" data-anim="up">
        {a.nick} <span className="accent align-middle text-[0.4em] not-italic">&amp;</span> {b.nick}
      </h3>
      <p className="aksara text-lg" lang="ban" data-anim="up">{`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}</p>
      <p className="lead mx-auto mt-2 max-w-sm !text-[1.05rem]" data-anim="up">
        {c(wedding.greeting.coupleLine)}
      </p>
    </div>
  )

  return (
    <section ref={root} data-section="meet" aria-label={`${t.groom}, ${t.bride}, ${t.nav.couple}`} className="relative">
      {/* jangkar navigasi (dalam alur normal, tidak ikut sticky) */}
      <div aria-hidden="true">
        <div id="groom" data-tone="malam" className="pointer-events-none absolute inset-x-0 top-0 h-svh" />
        <div id="bride" data-tone="malam" className="pointer-events-none absolute inset-x-0 top-[145svh] h-svh" />
        <div id="couple" data-tone="malam" className="pointer-events-none absolute inset-x-0 top-[290svh] h-svh" />
      </div>

      <div className="mt-panel sticky top-0 h-svh overflow-hidden bg-malam-3">
        <PersonPanel p={a} role={roleOf(a)} />
      </div>
      {hold}
      <div className="mt-panel sticky top-0 h-svh overflow-hidden bg-malam-3 shadow-[0_-30px_60px_-20px_rgba(0,0,0,.7)]">
        <PersonPanel p={b} role={roleOf(b)} mirror />
      </div>
      {hold}
      <div className="mt-panel relative h-svh overflow-hidden shadow-[0_-30px_60px_-20px_rgba(0,0,0,.7)]">
        <div className="mt-panel-inner relative h-full w-full bg-malam">
          <Bingkai />
          <div className="mt-photo absolute inset-0">
            <CoupleMedia />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(to_top,rgba(18,13,9,1)_0%,rgba(18,13,9,.85)_40%,rgba(18,13,9,0))]" />
          {coupleText}
        </div>
      </div>
    </section>
  )
}
