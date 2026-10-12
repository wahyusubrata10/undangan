import { useRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import { Divider, Jepun, PatraCorner } from '@/ornaments'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'
import { dateParts } from '@/lib/format'

export default function Opening() {
  const { c, t, lang, fx } = useApp()
  const [a, b] = coupleOrder()
  const ev = wedding.events[0]
  const d = ev ? dateParts(ev.start, lang, ev.tzLabel) : null
  const taps = useRef<number[]>([])

  // Easter egg: ketuk nama mempelai 3x cepat → hujan bunga jepun
  const onNameTap = () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((x) => now - x < 900), now]
    if (taps.current.length >= 3) {
      taps.current = []
      fx?.rain()
      fx?.burst()
      const toast = document.getElementById('egg-toast')
      if (toast) {
        toast.classList.remove('opacity-0')
        window.setTimeout(() => toast.classList.add('opacity-0'), 2600)
      }
    }
  }

  return (
    <Section id="opening" label={t.nav.opening}>
      {/* hero */}
      <div className="relative flex min-h-svh flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
        <p className="font-display text-[13px] tracking-[0.5em] text-prada-light" data-split="chars">
          {c(wedding.greeting.opening)}
        </p>
        <p className="mt-3 max-w-[18rem] font-serif text-[15px] italic text-gading-dim" data-reveal="fade">
          {c(wedding.greeting.openingSub)}
        </p>
        <p className="aksara text-prada mt-8 text-[28px]" data-reveal="scale" lang="ban">
          {a.aksara || toAksaraBali(a.nick)}
        </p>
        <h1 className="display-name text-prada cursor-default text-[clamp(4.2rem,22vw,6.5rem)]" onClick={onNameTap}>
          <span className="block" data-split="chars">
            {a.nick}
          </span>
          <span className="my-1 block font-display text-[0.32em] not-italic text-prada-light" data-reveal="scale">
            &amp;
          </span>
          <span className="block" data-split="chars">
            {b.nick}
          </span>
        </h1>
        <p className="aksara text-prada mt-1 text-[28px]" data-reveal="scale" lang="ban">
          {b.aksara || toAksaraBali(b.nick)}
        </p>
        {d && (
          <div className="mt-8 flex items-center gap-4 font-display text-gading" data-reveal="up">
            <span className="text-[11px] tracking-[0.3em] uppercase">{d.weekday}</span>
            <span className="h-10 w-px bg-prada/50" />
            <span className="text-4xl text-prada-light">{d.day}</span>
            <span className="h-10 w-px bg-prada/50" />
            <span className="text-[11px] tracking-[0.3em] uppercase">
              {d.month}
              <br />
              {d.year}
            </span>
          </div>
        )}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-gading-dim" aria-hidden="true">
          <span className="text-[10px] tracking-[0.4em] uppercase">Scroll</span>
          <span className="h-10 w-px overflow-hidden bg-prada/20">
            <span className="block h-1/2 w-full bg-prada" style={{ animation: 'float-y 1.8s ease-in-out infinite' }} />
          </span>
        </div>
      </div>

      {/* kutipan suci di atas lontar */}
      <div className="px-5 pb-20">
        <figure className="tex-lontar-light relative mx-auto max-w-md rounded-[28px] px-8 py-12 text-center shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]" data-reveal="up">
          <PatraCorner className="absolute left-2 top-2 w-16 opacity-80" />
          <PatraCorner className="absolute right-2 top-2 w-16 rotate-90 opacity-80" />
          <PatraCorner className="absolute bottom-2 left-2 w-16 -rotate-90 opacity-80" />
          <PatraCorner className="absolute bottom-2 right-2 w-16 rotate-180 opacity-80" />
          {/* lubang tali lontar */}
          <span className="absolute left-1/2 top-4 h-2 w-2 -translate-x-1/2 rounded-full bg-[#7a5a2e]/60" />
          <Jepun className="mx-auto mb-4 w-10" />
          <blockquote className="font-serif text-[1.2rem] italic leading-relaxed text-[#3a2410]" data-split="lines">
            {c(wedding.greeting.quote)}
          </blockquote>
          <Divider className="mx-auto my-5 w-32" />
          <figcaption className="font-display text-[11px] tracking-[0.3em] uppercase text-[#7a4f1c]">{c(wedding.greeting.quoteSource)}</figcaption>
        </figure>
      </div>
      <div
        id="egg-toast"
        role="status"
        className="pointer-events-none fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-full border border-prada/40 bg-hitam/85 px-4 py-2 text-xs text-prada-light opacity-0 transition-opacity duration-500 lg:left-[calc(100%-var(--invite-w)/2)]"
      >
        {t.easterEgg}
      </div>
    </Section>
  )
}
