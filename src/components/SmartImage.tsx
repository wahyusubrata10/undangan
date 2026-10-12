import { useState, type CSSProperties } from 'react'
import { resolvePhoto, srcSet } from '@/lib/media'
import { useApp } from '@/context'
import { PatraPunggel } from '@/ornaments'

interface Props {
  photo: string | undefined
  alt: string
  /** atribut sizes untuk srcset */
  sizes?: string
  className?: string
  imgClassName?: string
  style?: CSSProperties
  /** label placeholder bila foto kosong, mis. "Foto Hero" */
  label?: string
  priority?: boolean
  /** rasio aspek untuk placeholder, mis. '3/4' */
  ratio?: string
  onClick?: () => void
}

/**
 * Gambar responsif: AVIF → WebP fallback, srcset, lazy load, blur-up LQIP.
 * Jika foto belum diisi → placeholder ornamen yang elegan.
 */
export default function SmartImage({ photo, alt, sizes = '100vw', className = '', imgClassName = '', style, label, priority, ratio, onClick }: Props) {
  const r = resolvePhoto(photo)
  const [loaded, setLoaded] = useState(false)
  const { t } = useApp()

  if (r.kind === 'empty') {
    return (
      <div
        className={`relative grid place-items-center overflow-hidden bg-[radial-gradient(120%_90%_at_50%_30%,#3a0b0f,#150b08_70%)] ${className}`}
        style={{ aspectRatio: ratio, ...style }}
        role="img"
        aria-label={label ? `${t.emptyPhoto}: ${label}` : alt}
        onClick={onClick}
      >
        <div className="absolute inset-3 rounded-[inherit] border border-prada/25" />
        <div className="absolute inset-0 opacity-[.08] bg-[repeating-linear-gradient(45deg,#c9a24b_0_1px,transparent_1px_12px)]" />
        <div className="relative flex flex-col items-center gap-2 px-4 text-center">
          <PatraPunggel className="w-14 opacity-80" strokeWidth={2.4} />
          {label && <span className="font-display text-[10px] tracking-[0.3em] uppercase text-prada/70">{label}</span>}
        </div>
      </div>
    )
  }

  const src = r.kind === 'url' ? r.src : `${r.entry.base}-${r.entry.widths[Math.min(1, r.entry.widths.length - 1)]}.webp`
  const lqip = r.kind === 'manifest' ? r.entry.lqip : undefined
  const ar = r.kind === 'manifest' ? `${r.entry.w}/${r.entry.h}` : ratio

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ar, backgroundImage: lqip ? `url(${lqip})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', ...style }}
      onClick={onClick}
    >
      <picture>
        {r.kind === 'manifest' && r.entry.formats.includes('avif') && <source type="image/avif" srcSet={srcSet(r.entry, 'avif')} sizes={sizes} />}
        {r.kind === 'manifest' && <source type="image/webp" srcSet={srcSet(r.entry, 'webp')} sizes={sizes} />}
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          width={r.kind === 'manifest' ? r.entry.w : undefined}
          height={r.kind === 'manifest' ? r.entry.h : undefined}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      </picture>
    </div>
  )
}
