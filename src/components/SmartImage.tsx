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

const TINTS = [
  'linear-gradient(160deg,#f6efe3 0%,#e9dcc6 100%)',
  'linear-gradient(160deg,#f1f6f5 0%,#d9e6e8 100%)',
  'linear-gradient(160deg,#f3f5ee 0%,#dde5d3 100%)',
  'linear-gradient(160deg,#fbf3f1 0%,#f0dcdc 100%)',
]
const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)

/**
 * Gambar responsif: AVIF → WebP fallback, srcset, lazy load, blur-up LQIP.
 * Jika foto belum diisi → placeholder ornamen yang elegan.
 */
export default function SmartImage({ photo, alt, sizes = '100vw', className = '', imgClassName = '', style, label, priority, ratio, onClick }: Props) {
  const r = resolvePhoto(photo)
  const [loaded, setLoaded] = useState(false)
  const { t } = useApp()

  if (r.kind === 'empty') {
    // placeholder: gradasi lembut bernada palet (pasir/kabut/sage/anggrek, dipilih dari label)
    // + bunga jepun garis tipis & lengkung gapura samar → tetap cantik walau foto belum diisi
    const tint = TINTS[hash(label || alt) % TINTS.length]
    return (
      <div
        className={`relative grid place-items-center overflow-hidden ${className}`}
        style={{ aspectRatio: ratio, background: tint, ...style }}
        role="img"
        aria-label={label ? `${t.emptyPhoto}: ${label}` : alt}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_42%,rgba(255,255,255,.55),transparent_70%)]" />
        <div className="relative flex flex-col items-center">
          <svg viewBox="0 0 64 64" className="w-12 text-prada/60" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
            {[0, 72, 144, 216, 288].map((a) => (
              <path key={a} d="M32 32 C25 25 24 12 32 7 C40 12 39 25 32 32Z" transform={`rotate(${a} 32 32)`} />
            ))}
            <circle cx="32" cy="32" r="2.4" fill="currentColor" stroke="none" opacity=".7" />
          </svg>
          {label && <span className="label mt-4 px-6 text-center !text-[11px] !text-ink-soft/70">{label}</span>}
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
