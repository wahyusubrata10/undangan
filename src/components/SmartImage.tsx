import { useState, type CSSProperties } from 'react'
import { resolvePhoto, srcSet } from '@/lib/media'
import { useApp } from '@/context'

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
    // placeholder elegan tanpa bingkai: gradasi pasir lembut + label kecil
    return (
      <div
        className={`relative grid place-items-center overflow-hidden bg-[radial-gradient(120%_80%_at_30%_20%,#f6efe3,#e6d9c3_70%,#dccdb4)] ${className}`}
        style={{ aspectRatio: ratio, ...style }}
        role="img"
        aria-label={label ? `${t.emptyPhoto}: ${label}` : alt}
        onClick={onClick}
      >
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(60%_50%_at_70%_80%,rgba(255,255,255,.7),transparent)]" />
        {label && <span className="label relative px-6 text-center !text-[12px] !text-ink-soft/70">{label}</span>}
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
