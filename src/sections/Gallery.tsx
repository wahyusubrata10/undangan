import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { Lamak } from '@/ornaments'
import { photoUrl } from '@/lib/media'

gsap.registerPlugin(ScrollTrigger)
const Lightbox = lazy(() => import('@/components/Lightbox'))

/** jumlah foto di strip film (sisanya masuk mosaik) */
const FILM = 5

/**
 * 6 · Galeri sinematik (menggantikan "Kisah Kami").
 *  A. Strip film: section di-pin, foto besar bergeser horizontal mengikuti scroll,
 *     isi foto ber-parallax & garis progres janur.
 *  B. Mosaik editorial: ukuran & rasio berirama, foto terbuka seperti tirai.
 * Semua foto bisa diketuk → lightbox (swipe, pinch-zoom, tombol back HP).
 */
const MOSAIC: { span: string; ratio: string; offset?: string }[] = [
  { span: 'col-span-6', ratio: '4/5' },
  { span: 'col-span-3', ratio: '3/4' },
  { span: 'col-span-3', ratio: '3/4', offset: 'mt-16' },
  { span: 'col-span-4', ratio: '4/5' },
  { span: 'col-span-2', ratio: '2/5', offset: 'mt-24' },
  { span: 'col-span-2', ratio: '2/5' },
  { span: 'col-span-4', ratio: '4/5', offset: 'mt-10' },
]

export default function Gallery() {
  const { t, c, reduced } = useApp()
  const photos = wedding.photos.gallery
  const film = photos.slice(0, FILM)
  const rest = photos.slice(FILM)
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !pinRef.current || !trackRef.current) return
    const ctx = gsap.context(() => {
      const track = trackRef.current!
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => (track.style.willChange = self.isActive ? 'transform' : ''),
          onUpdate: (self) => barRef.current && gsap.set(barRef.current, { scaleX: self.progress }),
        },
      })
      // parallax di dalam tiap foto + sedikit membesar saat melewati tengah
      gsap.utils.toArray<HTMLElement>('.film-img', track).forEach((img) => {
        gsap.fromTo(img, { xPercent: -10, scale: 1.12 }, { xPercent: 10, ease: 'none', scrollTrigger: { trigger: img.parentElement!, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
      })
      gsap.utils.toArray<HTMLElement>('.film-cap', track).forEach((cap) => {
        gsap.from(cap, { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: cap.parentElement!, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' } })
      })
    }, pinRef)
    return () => ctx.revert()
  }, [reduced])

  const tile = (i: number, ratio: string, cls = '') => (
    <button key={i} type="button" className={`group block w-full text-left ${cls}`} onClick={() => setOpen(i)} aria-label={`${t.photo} ${i + 1}`}>
      <div className="overflow-hidden" data-curtain>
        <div>
          <SmartImage
            photo={photos[i]}
            alt={`${t.photo} ${i + 1}`}
            label={`${t.photo} ${i + 1}`}
            ratio={ratio}
            sizes="(min-width:1024px) 520px, 90vw"
            className="w-full"
            style={{ aspectRatio: ratio }}
            imgClassName="transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
          />
        </div>
      </div>
    </button>
  )

  return (
    <Section id="gallery" tone="cream" label={t.nav.gallery}>
      {/* A — strip film */}
      <div ref={pinRef} className={`relative overflow-hidden ${reduced ? 'py-24' : 'h-svh'}`}>
        <div
          ref={trackRef}
          className={reduced ? 'flex snap-x snap-mandatory gap-4 overflow-x-auto px-6' : 'flex h-full items-center gap-5 pl-[11vw] pr-[12vw] sm:gap-8'}
        >
          {/* kartu judul */}
          <div className="flex w-[72vw] shrink-0 flex-col justify-center sm:w-[42vw] lg:w-[34vw]">
            <Lamak className="w-28" />
            <p className="label mt-8">{t.gallerySub}</p>
            <h2 className="display-i mt-4 text-[clamp(3.6rem,17vw,7rem)] text-ink">{t.galleryTitle}</h2>
            <p className="lead mt-5 max-w-xs !text-[1.05rem]">{c(wedding.greeting.coupleLine)}</p>
            {!reduced && (
              <p className="mt-10 flex items-center gap-3 text-[12px] tracking-[0.3em] uppercase text-ink-mute">
                {t.scroll} <span className="inline-block h-px w-10 bg-ink-mute/60" style={{ animation: 'float-y 1.8s ease-in-out infinite' }} />→
              </p>
            )}
          </div>
          {film.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${t.photo} ${i + 1}`}
              className={`relative shrink-0 snap-center overflow-hidden text-left ${i % 2 ? 'h-[58svh] w-[70vw] sm:w-[40vw] lg:w-[28vw]' : 'h-[68svh] w-[80vw] sm:w-[46vw] lg:w-[32vw]'}`}
            >
              <div className="film-img absolute -inset-x-[8%] inset-y-0">
                <SmartImage photo={photos[i]} alt={`${t.photo} ${i + 1}`} label={`${t.photo} ${i + 1}`} sizes="(min-width:1024px) 34vw, 82vw" className="h-full w-full" />
              </div>
              <span className="film-cap absolute bottom-4 left-4 font-display text-[1.1rem] italic text-ivory [text-shadow:0_1px_12px_rgba(0,0,0,.35)]">
                {String(i + 1).padStart(2, '0')} <span className="text-[0.8em] opacity-70">/ {String(film.length).padStart(2, '0')}</span>
              </span>
            </button>
          ))}
        </div>
        {!reduced && (
          <div className="absolute inset-x-[8vw] bottom-[6svh] h-px bg-ink/10">
            <div ref={barRef} className="h-full origin-left scale-x-0 bg-prada" />
          </div>
        )}
      </div>

      {/* B — mosaik editorial */}
      {rest.length > 0 && (
        <div className="mx-auto grid max-w-4xl grid-cols-6 gap-3 px-4 pb-28 pt-10 sm:gap-6">
          {rest.map((_, k) => {
            const m = MOSAIC[k % MOSAIC.length]!
            return (
              <div key={k} className={`${m.span} ${m.offset ?? ''}`} data-parallax={k % 2 ? '0.05' : undefined}>
                {tile(FILM + k, m.ratio)}
              </div>
            )
          })}
        </div>
      )}

      {wedding.galleryVideos.length > 0 && (
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 pb-24">
          {wedding.galleryVideos.map((v, i) => (
            <figure key={i} data-anim="up">
              {/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|player\.vimeo\.com)/.test(v.src) ? (
                <iframe src={v.src} title={c(v.title) || 'Video'} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" className="aspect-video w-full" />
              ) : (
                <video src={v.src} poster={photoUrl(v.poster)} controls playsInline preload="none" className="aspect-video w-full bg-ink object-cover" />
              )}
              {v.title && <figcaption className="label mt-3 text-center">{c(v.title)}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      {open !== null && (
        <Suspense fallback={null}>
          <Lightbox photos={photos} index={open} onClose={close} />
        </Suspense>
      )}
    </Section>
  )
}
