import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { Person } from '@/config/types'
import { Section } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { ArchFrame, Jepun, PatraCorner, PatraPunggel } from '@/ornaments'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'

function PersonCard({ p, role, side }: { p: Person; role: string; side: 'left' | 'right' }) {
  const { c } = useApp()
  return (
    <article className="flex flex-col items-center text-center">
      <p className="eyebrow mb-5" data-reveal="fade">
        {role}
      </p>
      <div className="relative w-[64%] max-w-[260px]" data-reveal={side}>
        {/* bingkai patra mekar dari sudut */}
        <PatraCorner className="absolute -left-5 -top-5 z-10 w-16" />
        <PatraCorner className="absolute -right-5 -top-5 z-10 w-16 rotate-90" />
        <div className="relative overflow-hidden rounded-t-full" data-mask="arch">
          <SmartImage photo={p.photo} alt={p.fullName} label={role} ratio="3/4" sizes="(min-width:1024px) 260px, 64vw" className="rounded-t-full" />
        </div>
        <ArchFrame className="pointer-events-none absolute -inset-2.5 h-[calc(100%+20px)] w-[calc(100%+20px)]" />
        <Jepun className="absolute -bottom-5 left-1/2 w-11 -translate-x-1/2" />
      </div>
      <p className="aksara text-prada mt-8 text-xl" lang="ban" data-reveal="fade">
        {p.aksara || toAksaraBali(p.nick)}
      </p>
      <h3 className="mt-1 font-serif text-[2rem] italic leading-tight text-prada-light" data-split="words">
        {p.fullName}
      </h3>
      <p className="mt-3 text-[13px] text-gading-dim" data-reveal="up">
        {c(p.childOf)}
      </p>
      <p className="mt-1 font-serif text-[1.1rem] text-gading" data-reveal="up">
        {p.father}
        <br />
        <span className="text-prada">&amp;</span> {p.mother}
      </p>
      {p.origin && (
        <p className="mt-2 text-[12px] text-gading-dim/80" data-reveal="up">
          {c(p.origin)}
        </p>
      )}
      {p.instagram && (
        <a
          href={`https://instagram.com/${p.instagram.replace(/^@/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost mt-5 !py-2 !text-[10px]"
          data-reveal="up"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
          @{p.instagram.replace(/^@/, '')}
        </a>
      )}
    </article>
  )
}

export default function Couple() {
  const { t, c } = useApp()
  const [a, b] = coupleOrder()
  const roleOf = (p: Person) => (p === wedding.groom ? t.groom : t.bride)
  return (
    <Section id="couple" sweep label={t.nav.couple} bg="lontar" className="overflow-hidden px-6 py-28">
      <div className="relative mx-auto max-w-md">
        <p className="mx-auto max-w-sm text-center font-serif text-[1.15rem] italic leading-relaxed text-gading" data-reveal="up">
          {c(wedding.greeting.intro)}
        </p>
        <div className="mt-16 flex flex-col gap-10">
          <PersonCard p={a} role={roleOf(a)} side="left" />
          <div className="relative mx-auto grid h-28 w-28 place-items-center" data-reveal="scale">
            <PatraPunggel className="absolute inset-0 h-full w-full opacity-70" />
            <span className="relative font-serif text-6xl italic text-prada">&amp;</span>
          </div>
          <PersonCard p={b} role={roleOf(b)} side="right" />
        </div>
      </div>
    </Section>
  )
}
