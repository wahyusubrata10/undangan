import { lazy, Suspense, useCallback, useState } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section, SectionTitle } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { photoUrl } from '@/lib/media'

const Lightbox = lazy(() => import('@/components/Lightbox'))

/**
 * Pola editorial berulang (bukan grid seragam): tiap 6 foto membentuk satu "bait".
 * col = lebar kolom (dari 6), ratio = rasio aspek, mask = bentuk reveal.
 */
const RHYTHM: { col: string; ratio: string; mask: 'arch' | 'petal' | 'split'; round: string }[] = [
  { col: 'col-span-6', ratio: '4/5', mask: 'arch', round: 'rounded-t-full rounded-b-[28px]' },
  { col: 'col-span-3', ratio: '3/4', mask: 'split', round: 'rounded-[22px]' },
  { col: 'col-span-3', ratio: '3/4', mask: 'split', round: 'rounded-[22px] translate-y-8' },
  { col: 'col-span-4', ratio: '4/5', mask: 'petal', round: 'rounded-[24px]' },
  { col: 'col-span-2', ratio: '1/2', mask: 'split', round: 'rounded-full' },
  { col: 'col-span-6', ratio: '16/10', mask: 'split', round: 'rounded-[24px]' },
]

export default function Gallery() {
  const { t, c } = useApp()
  const photos = wedding.photos.gallery
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])

  return (
    <Section id="gallery" sweep label={t.nav.gallery} bg="lontar" className="px-4 py-28">
      <div className="relative mx-auto max-w-md">
        <SectionTitle eyebrow={t.gallerySub} title={t.galleryTitle} />
        <div className="grid grid-cols-6 gap-3">
          {photos.map((p, i) => {
            const r = RHYTHM[i % RHYTHM.length]!
            return (
              <button
                key={i}
                type="button"
                className={`${r.col} group relative block overflow-hidden text-left ${r.round}`}
                onClick={() => setOpen(i)}
                aria-label={`${t.photo} ${i + 1}`}
              >
                <div data-mask={r.mask} className={`overflow-hidden ${r.round}`}>
                  <SmartImage
                    photo={p}
                    alt={`${t.photo} ${i + 1}`}
                    label={`${t.photo} ${i + 1}`}
                    ratio={r.ratio}
                    sizes={r.col === 'col-span-6' ? '(min-width:1024px) 480px, 92vw' : '(min-width:1024px) 240px, 46vw'}
                    className={`w-full ${r.round}`}
                    imgClassName="transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                    style={{ aspectRatio: r.ratio }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {wedding.galleryVideos.length > 0 && (
          <div className="mt-14 flex flex-col gap-6">
            {wedding.galleryVideos.map((v, i) => (
              <figure key={i} className="overflow-hidden rounded-[24px] border border-prada/30" data-reveal="up">
                {/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|player\.vimeo\.com)/.test(v.src) ? (
                  <iframe
                    src={v.src}
                    title={c(v.title) || 'Video'}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    className="aspect-video w-full"
                  />
                ) : (
                  <video src={v.src} poster={photoUrl(v.poster)} controls playsInline preload="none" className="aspect-video w-full bg-black object-cover" />
                )}
                {v.title && <figcaption className="px-4 py-3 text-center font-serif italic text-prada-light">{c(v.title)}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </div>
      {open !== null && (
        <Suspense fallback={null}>
          <Lightbox photos={photos} index={open} onClose={close} />
        </Suspense>
      )}
    </Section>
  )
}
