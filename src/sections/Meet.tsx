import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { Person, SectionId } from '@/config/types'
import SmartImage from '@/components/SmartImage'
import { CandiParas } from '@/ornaments'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'
import { navTargets } from '@/fx/scroll'
import { photoUrl } from '@/lib/media'

gsap.registerPlugin(ScrollTrigger)

/**
 * 3 · 4 · 5 — Perkenalan PRIA → WANITA → foto BERDUA dalam satu panggung yang di-pin.
 * Satu master timeline (scrub) agar kesinambungan visual tidak pernah patah:
 *   A. gerbang paras terbuka, foto pria membesar dari tengah
 *   B. foto pria bergeser & memudar, foto wanita masuk dengan mask (tirai) dari kanan
 *   C. kedua foto mengecil jadi dua potret, bergerak ke tengah, lalu melebur jadi foto berdua full-bleed
 */
const PHASE = { groom: 1.7, bride: 4.0, couple: 7.0, end: 7.6 }

function PersonText({ p, role, cls }: { p: Person; role: string; cls: string }) {
  const { c } = useApp()
  return (
    <div className={`${cls} absolute inset-x-0 bottom-0 z-20 px-7 pb-[max(3rem,env(safe-area-inset-bottom))] text-left lg:inset-y-0 lg:flex lg:w-[42%] lg:flex-col lg:justify-center lg:px-14`}>
      <p className="label t-item">{role}</p>
      <p className="aksara t-item mt-2 text-lg" lang="ban">
        {p.aksara || toAksaraBali(p.nick)}
      </p>
      <h3 className="display-i t-item text-[clamp(2.6rem,11vw,4.6rem)] text-ink">{p.fullName}</h3>
      <p className="t-item mt-5 text-[13px] text-ink-soft">{c(p.childOf)}</p>
      <p className="t-item font-display text-[1.25rem] leading-snug text-ink">
        {p.father}
        <br />
        &amp; {p.mother}
      </p>
      {p.origin && <p className="t-item mt-2 text-[12px] text-ink-mute">{c(p.origin)}</p>}
      {p.instagram && (
        <a href={`https://instagram.com/${p.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="t-item link-u mt-4 inline-block self-start text-[12px] tracking-[0.2em] text-ink-soft">
          @{p.instagram.replace(/^@/, '')}
        </a>
      )}
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
  const { t, c, reduced, setActive } = useApp()
  const [a, b] = coupleOrder()
  const roleOf = (p: Person) => (p === wedding.groom ? t.groom : t.bride)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (reduced || !root.current) return
    const el = root.current
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      // kondisi awal
      gsap.set(q('.m-a'), { scale: 0.42, transformOrigin: '50% 55%' })
      gsap.set(q('.m-a-img'), { scale: 1.3 })
      gsap.set(q('.m-b'), { xPercent: 100 })
      gsap.set(q('.m-b-img'), { xPercent: -100, scale: 1.15 })
      gsap.set(q('.m-c'), { opacity: 0, scale: 0.44 })
      gsap.set(q('.m-a-text .t-item, .m-b-text .t-item, .m-c-text .t-item'), { opacity: 0, y: 36 })

      // A — gerbang terbuka, kamera masuk, foto pria membesar dari tengah
      tl.to(q('.m-gate-l'), { xPercent: -105, scale: 1.25, transformOrigin: '100% 100%', duration: 1.2 }, 0)
        .to(q('.m-gate-r'), { xPercent: 105, scale: 1.25, transformOrigin: '0% 100%', duration: 1.2 }, 0)
        .to(q('.m-a'), { scale: 1, duration: 1.2 }, 0.05)
        .to(q('.m-a-img'), { scale: 1, duration: 1.4 }, 0.05)
        .to(q('.m-a-shade'), { opacity: 1, duration: 0.6 }, 0.8)
        .to(q('.m-a-text .t-item'), { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' }, 1.0)
        // B — pria bergeser & memudar, wanita masuk dengan tirai dari kanan
        .to(q('.m-a-text .t-item'), { opacity: 0, y: -24, stagger: 0.04, duration: 0.4, ease: 'power2.in' }, 2.2)
        .to(q('.m-a'), { xPercent: -28, opacity: 0, duration: 1.1 }, 2.35)
        .to(q('.m-b'), { xPercent: 0, duration: 1.1 }, 2.4)
        .to(q('.m-b-img'), { xPercent: 0, scale: 1, duration: 1.2 }, 2.4)
        .to(q('.m-b-shade'), { opacity: 1, duration: 0.5 }, 3.0)
        .to(q('.m-b-text .t-item'), { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' }, 3.3)
        // C — dua potret bertemu di tengah lalu melebur menjadi foto berdua
        .to(q('.m-b-text .t-item'), { opacity: 0, y: -24, stagger: 0.04, duration: 0.4, ease: 'power2.in' }, 4.6)
        .to(q('.m-b-shade'), { opacity: 0, duration: 0.4 }, 4.6)
        .to(q('.m-b'), { scale: 0.44, x: '23vw', duration: 0.9 }, 4.75)
        .set(q('.m-a'), { xPercent: 0, x: '-23vw', scale: 0.44 }, 4.75)
        .set(q('.m-a-shade'), { opacity: 0 }, 4.75)
        .to(q('.m-a'), { opacity: 1, duration: 0.6 }, 4.9)
        .to(q('.m-a, .m-b'), { x: 0, duration: 0.9, ease: 'power3.inOut' }, 5.6)
        .to(q('.m-a, .m-b'), { opacity: 0, duration: 0.5 }, 6.1)
        .to(q('.m-c'), { opacity: 1, duration: 0.5 }, 6.0)
        .to(q('.m-c'), { scale: 1, duration: 1.0, ease: 'power2.out' }, 6.15)
        .to(q('.m-c-shade'), { opacity: 1, duration: 0.6 }, 6.6)
        .to(q('.m-c-text .t-item'), { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power3.out' }, 6.7)
        .to({}, { duration: PHASE.end - 7.3 })

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * 4.2}`,
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        animation: tl,
        invalidateOnRefresh: true,
        onToggle: (self) => {
          q('.m-a, .m-b, .m-c').forEach((n) => ((n as HTMLElement).style.willChange = self.isActive ? 'transform, opacity' : ''))
        },
        onUpdate: (self) => {
          const p = self.progress * PHASE.end
          setActive(p < 2.3 ? 'groom' : p < 4.7 ? 'bride' : 'couple')
        },
      })
      const at = (time: number) => () => st.start + (time / PHASE.end) * (st.end - st.start)
      navTargets.groom = at(PHASE.groom)
      navTargets.bride = at(PHASE.bride)
      navTargets.couple = at(PHASE.couple)
    }, el)
    return () => {
      delete navTargets.groom
      delete navTargets.bride
      delete navTargets.couple
      ctx.revert()
    }
  }, [reduced, setActive])

  const shade = 'pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(to_top,rgba(251,248,242,.97)_0%,rgba(251,248,242,.88)_38%,rgba(251,248,242,0))] lg:hidden'

  // JSX biasa (bukan komponen di dalam komponen) agar tidak di-remount saat re-render
  const coupleText = (
    <div className="m-c-text absolute inset-x-0 bottom-0 z-20 px-7 pb-[max(3.5rem,env(safe-area-inset-bottom))] text-center lg:pb-20">
      <p className="label t-item">{t.nav.couple}</p>
      <h3 className="display-i t-item mt-3 text-[clamp(3.6rem,17vw,8rem)] text-ink">
        {a.nick} <span className="accent align-middle text-[0.4em] not-italic text-prada">&amp;</span> {b.nick}
      </h3>
      <p className="aksara t-item text-lg" lang="ban">{`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}</p>
      <p className="lead t-item mx-auto mt-2 max-w-sm !text-[1.05rem]">{c(wedding.greeting.coupleLine)}</p>
    </div>
  )

  /* ---- reduced motion: tiga section statis berurutan ---- */
  if (reduced) {
    const statik = (id: SectionId, children: React.ReactNode) => (
      <section id={id} data-section={id} data-tone="ivory" className="relative h-svh overflow-hidden">
        {children}
      </section>
    )
    return (
      <>
        {statik(
          'groom',
          <>
            <SmartImage photo={a.photo} alt={a.fullName} label={roleOf(a)} className="absolute inset-0 h-full w-full" />
            <div className={shade} />
            <PersonText p={a} role={roleOf(a)} cls="" />
          </>,
        )}
        {statik(
          'bride',
          <>
            <SmartImage photo={b.photo} alt={b.fullName} label={roleOf(b)} className="absolute inset-0 h-full w-full" />
            <div className={shade} />
            <PersonText p={b} role={roleOf(b)} cls="" />
          </>,
        )}
        {statik(
          'couple',
          <>
            <div className="absolute inset-0">
              <CoupleMedia />
            </div>
            <div className={shade} />
            {coupleText}
          </>,
        )}
      </>
    )
  }

  return (
    <section ref={root} id="groom" data-section="groom" data-tone="ivory" aria-label={`${t.groom}, ${t.bride}, ${t.nav.couple}`} className="relative h-svh overflow-hidden bg-ivory">
      {/* C — foto berdua (paling bawah, melebur ke atas) */}
      <div className="m-c absolute inset-0">
        <CoupleMedia />
        <div className={`m-c-shade opacity-0 ${shade}`} />
      </div>

      {/* A — mempelai pertama */}
      <div className="m-a absolute inset-0 overflow-hidden lg:left-[42%]">
        <div className="m-a-img absolute inset-0">
          <SmartImage photo={a.photo} alt={a.fullName} label={roleOf(a)} sizes="(min-width:1024px) 58vw, 100vw" className="h-full w-full" priority />
        </div>
        <div className={`m-a-shade opacity-0 ${shade}`} />
      </div>

      {/* B — mempelai kedua (tirai dari kanan) */}
      <div className="m-b absolute inset-0 overflow-hidden lg:right-[42%]">
        <div className="m-b-img absolute inset-0">
          <SmartImage photo={b.photo} alt={b.fullName} label={roleOf(b)} sizes="(min-width:1024px) 58vw, 100vw" className="h-full w-full" />
        </div>
        <div className={`m-b-shade opacity-0 ${shade}`} />
      </div>

      {/* gerbang paras yang terbuka saat masuk */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-full justify-center" aria-hidden="true">
        <div className="m-gate-l relative h-full w-1/2">
          <CandiParas side="left" className="absolute bottom-0 right-0 h-[92%] w-auto max-w-none" />
        </div>
        <div className="m-gate-r relative h-full w-1/2">
          <CandiParas side="right" className="absolute bottom-0 left-0 h-[92%] w-auto max-w-none" />
        </div>
      </div>

      <PersonText p={a} role={roleOf(a)} cls="m-a-text" />
      <div className="lg:[&>div]:left-auto lg:[&>div]:right-0">
        <PersonText p={b} role={roleOf(b)} cls="m-b-text" />
      </div>
      {coupleText}
      <span id="bride" className="sr-only" />
      <span id="couple" className="sr-only" />
    </section>
  )
}
