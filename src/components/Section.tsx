import type { ReactNode } from 'react'
import type { SectionId } from '@/config/types'
import { PatraPunggel } from '@/ornaments'

interface Props {
  id: SectionId
  children: ReactNode
  className?: string
  /** latar bertekstur yang memudar di tepi atas & bawah (tanpa garis sambungan) */
  bg?: 'lontar' | 'marun' | 'dim'
  /** transisi patra menyapu saat section ini masuk */
  sweep?: boolean
  label?: string
}

const BG: Record<NonNullable<Props['bg']>, string> = {
  lontar: 'tex-lontar',
  marun: 'bg-[linear-gradient(180deg,#1f0709,#2a0709_50%,#14080a)]',
  dim: 'bg-hitam/80',
}

export function Section({ id, children, className = '', sweep, label, bg }: Props) {
  return (
    <section id={id} data-section={id} data-sweep={sweep ? '' : undefined} aria-label={label} className={`relative ${className}`}>
      {bg && <div className={`section-bg pointer-events-none absolute inset-0 ${BG[bg]}`} aria-hidden="true" />}
      {children}
    </section>
  )
}

export function SectionTitle({ eyebrow, title, sub, light }: { eyebrow?: string; title: string; sub?: string; light?: boolean }) {
  return (
    <header className="relative mb-10 flex flex-col items-center text-center">
      <PatraPunggel className="mb-3 w-12 -rotate-12" strokeWidth={2.6} />
      {eyebrow && (
        <p className="eyebrow" data-reveal="fade">
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-2 font-serif text-[2.6rem] italic leading-none ${light ? 'text-marun' : 'text-prada'}`} data-split="chars">
        {title}
      </h2>
      {sub && (
        <p className={`mt-3 max-w-xs text-[13px] ${light ? 'text-[#5a3b1e]' : 'text-gading-dim'}`} data-reveal="up">
          {sub}
        </p>
      )}
    </header>
  )
}
