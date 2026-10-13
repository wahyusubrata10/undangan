import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { Lamak } from '@/ornaments'
import { photoUrl } from '@/lib/media'

const Lightbox = lazy(() => import('@/components/Lightbox'))

/** jumlah foto di strip film (sisanya masuk mosaik) */
const FILM = 5

/**
 * 6 · Galeri sinematik (menggantikan "Kisah Kami").
 *  A. Strip foto besar yang digeser kiri-kanan biasa (native scroll-snap, tidak
 *     mengunci scroll ke bawah) dengan efek kedalaman & penanda foto aktif.
 *  B. Grid rapi 2 kolom dengan rasio seragam 3:4.
 * Semua foto bisa diketuk → lightbox (swipe, pinch-zoom, tombol back HP).
 */
export default function Gallery() {
  const { t, c, reduced } = useApp()
  const photos = wedding.photos.gallery
  const film = photos.slice(0, FILM)
  const rest = photos.slice(FILM)
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const stripRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // geser kiri-kanan biasa (native, scroll-snap). Efek kedalaman: isi foto bergeser pelan
  // berlawanan arah geser (rAF, hanya transform) + penanda foto aktif.
  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let bestD = Infinity
      el.querySelectorAll<HTMLElement>('[data-film]').forEach((card, i) => {
        const c = card.offsetLeft + card.offsetWidth / 2
        const d = c - mid
        if (Math.abs(d) < bestD) {
          bestD = Math.abs(d)
          best = i
        }
        if (!reduced) {
          const img = card.firstElementChild as HTMLElement | null
          if (img) img.style.transform = `translate3d(${(-d / el.clientWidth) * 9}%,0,0)`
        }
      })
      setActive(best)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reduced])

  const slide = (dir: number) => {
    const el = stripRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: reduced ? 'auto' : 'smooth' })
  }

  const tile = (i: number, ratio: string, cls = '') => (
    <button key={i} type="button" className={`group block w-full text-left ${cls}`} onClick={() => setOpen(i)} aria-label={`${t.photo} ${i + 1}`}>
      <div className="overflow-hidden" data-anim="photo">
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
    <Section id="gallery" tone="sage" label={t.nav.gallery} className="pb-24 lg:pb-36">
      {/* A — judul + strip foto yang digeser kiri-kanan (tidak mengunci scroll) */}
      <div className="px-6 pt-24 text-center lg:pt-36">
        <Lamak className="mx-auto w-28" />
        <p className="label mt-8" data-anim="fade">
          {t.gallerySub}
        </p>
        <h2 className="display-i mt-4 text-[clamp(3.4rem,15vw,6.5rem)] text-ink" data-anim="lines">
          {t.galleryTitle}
        </h2>
      </div>
      <div className="relative mt-14" data-anim="fade">
        <div
          ref={stripRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[9vw] pb-2 [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: 'pan-x pan-y' }}
          aria-label={t.galleryTitle}
        >
          {film.map((_, i) => (
            <button
              key={i}
              type="button"
              data-film
              onClick={() => setOpen(i)}
              aria-label={`${t.photo} ${i + 1}`}
              className="relative h-[64svh] max-h-[640px] w-[82vw] shrink-0 snap-center overflow-hidden text-left sm:w-[46vw] lg:w-[30vw]"
            >
              <div className="absolute -inset-x-[10%] inset-y-0 will-change-transform">
                <SmartImage photo={photos[i]} alt={`${t.photo} ${i + 1}`} label={`${t.photo} ${i + 1}`} sizes="(min-width:1024px) 34vw, 86vw" className="h-full w-full" />
              </div>
            </button>
          ))}
        </div>
        {/* panah (desktop saja) */}
        <div className="hidden lg:block">
          <button type="button" onClick={() => slide(-1)} className="btn-line absolute left-4 top-[32svh] -translate-y-1/2 !bg-ivory/90 !px-4" aria-label={t.prev}>
            ‹
          </button>
          <button type="button" onClick={() => slide(1)} className="btn-line absolute right-4 top-[32svh] -translate-y-1/2 !bg-ivory/90 !px-4" aria-label={t.next}>
            ›
          </button>
        </div>
        {/* penanda */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="font-display text-[1.1rem] italic text-ink">
            {String(active + 1).padStart(2, '0')} <span className="text-ink-mute">/ {String(film.length).padStart(2, '0')}</span>
          </span>
          <div className="flex gap-1.5" aria-hidden="true">
            {film.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === active ? 'w-6 bg-prada' : 'w-1.5 bg-ink/15'}`} />
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-[12px] tracking-[0.3em] uppercase text-ink-mute lg:hidden">← {t.swipe} →</p>
      </div>

      {/* B — grid rapi 2 kolom, rasio seragam */}
      {rest.length > 0 && (
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 px-5 pt-16 sm:gap-5">
          {/* jumlah ganjil → foto terakhir dibuat lebar penuh agar grid tetap rapi */}
          {rest.map((_, k) => (rest.length % 2 === 1 && k === rest.length - 1 ? tile(FILM + k, '3/2', 'col-span-2') : tile(FILM + k, '3/4')))}
        </div>
      )}

      {wedding.galleryVideos.length > 0 && (
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 pt-16">
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
