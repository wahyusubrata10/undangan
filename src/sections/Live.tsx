import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import { PolengPattern } from '@/ornaments'

export default function Live() {
  const { t, c } = useApp()
  const ls = wedding.liveStream
  if (!ls.enabled) return null
  return (
    <Section id="live" label={t.nav.live} className="px-5 py-16">
      <div className="relative mx-auto max-w-md overflow-hidden rounded-[28px] p-[6px]" data-reveal="up">
        {/* bingkai kain poleng */}
        <PolengPattern className="absolute inset-0" size={10} opacity={0.9} />
        <div className="relative rounded-[22px] bg-hitam px-6 py-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-900/30 px-3 py-1 text-[10px] font-semibold tracking-[0.3em] text-red-200 uppercase">
            <span className="h-2 w-2 rounded-full bg-red-500" style={{ animation: 'pulse-ring 1.6s ease-out infinite' }} />
            Live
          </span>
          <h2 className="mt-4 font-serif text-[2.2rem] italic leading-none text-prada">{t.liveTitle}</h2>
          {ls.note && <p className="mx-auto mt-3 max-w-xs text-[13px] text-gading-dim">{c(ls.note)}</p>}
          <a href={ls.url} target="_blank" rel="noopener noreferrer" className="btn-prada mt-6">
            {t.watchLive} · {ls.platform}
          </a>
        </div>
      </div>
    </Section>
  )
}
