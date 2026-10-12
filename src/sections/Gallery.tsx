import { lazy, Suspense, useCallback, useState } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section, SectionTitle } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { Lamak } from '@/ornaments'
import { photoUrl } from '@/lib/media'

const Lightbox = lazy(() => import('@/components/Lightbox'))

/**
 * 8 · Galeri — editorial frameless: dua kolom dengan kecepatan parallax berbeda,
 * ukuran & rasio berirama (tidak seragam), foto terbuka seperti tirai. Aksen: lamak.
 */
const RATIOS = ['3/4', '4/5', '2/3', '1/1', '4/5', '3/4']

export default function Gallery() {
  const { t, c } = useApp()
  const photos = wedding.photos.gallery
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const cols: [number[], number[]] = [[], []]
  photos.forEach((_, i) => cols[i % 2]!.push(i))

  // fungsi render biasa (bukan komponen) agar elemen tidak di-remount saat lightbox dibuka
  const item = (i: number) => (
    <button key={i} type="button" className="group block w-full overflow-hidden text-left" onClick={() => setOpen(i)} aria-label={`${t.photo} ${i + 1}`}>
      <div className="overflow-hidden" data-curtain>
        <div>
          <SmartImage
            photo={photos[i]}
            alt={`${t.photo} ${i + 1}`}
            label={`${t.photo} ${i + 1}`}
            ratio={RATIOS[i % RATIOS.length]}
            sizes="(min-width:1024px) 420px, 46vw"
            className="w-full"
            imgClassName="transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
          />
        </div>
      </div>
    </button>
  )

  return (
    <Section id="gallery" tone="pasir" label={t.nav.gallery} className="px-4 py-32">
      <Lamak className="mx-auto mb-10 w-32" />
      <SectionTitle label={t.gallerySub} title={t.galleryTitle} />
      <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-3 sm:gap-6">
        <div className="flex flex-col gap-3 sm:gap-6" data-parallax="0.04">
          {cols[0].map(item)}
        </div>
        <div className="mt-20 flex flex-col gap-3 sm:gap-6" data-parallax="-0.06">
          {cols[1].map(item)}
        </div>
      </div>

      {wedding.galleryVideos.length > 0 && (
        <div className="mx-auto mt-20 flex max-w-3xl flex-col gap-10">
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
