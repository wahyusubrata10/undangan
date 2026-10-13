import type { ReactNode } from 'react'
import type { SectionId } from '@/config/types'

interface Props {
  id: SectionId
  children: ReactNode
  className?: string
  /** warna latar halaman saat section ini aktif (crossfade halus) */
  tone?: 'ivory' | 'mist' | 'cream' | 'sage' | 'blush'
  label?: string
}

export function Section({ id, children, className = '', tone = 'ivory', label }: Props) {
  return (
    <section id={id} data-section={id} data-tone={tone} aria-label={label} className={`relative ${className}`}>
      {children}
    </section>
  )
}

/** Judul section editorial: label kecil berjarak lebar + judul serif tipis besar. */
export function SectionTitle({ label, title, align = 'center', className = '' }: { label?: string; title: string; align?: 'center' | 'left'; className?: string }) {
  return (
    <header className={`relative ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      {label && (
        <p className="label" data-anim="fade">
          {label}
        </p>
      )}
      <h2 className="display-i mt-4 text-[clamp(3rem,13vw,5.5rem)] text-ink" data-anim="lines">
        {title}
      </h2>
    </header>
  )
}
