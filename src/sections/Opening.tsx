import { useRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import { Canang, Dupa, JepunBranch, PatraSari } from '@/ornaments'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'
import { dateParts } from '@/lib/format'

/** 2 · Pembuka: salam, kutipan singkat, nama kedua mempelai. Aksen: canang sari. */
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
      const toast = document.getElementById('egg-toast')
      if (toast) {
        toast.classList.remove('opacity-0')
        window.setTimeout(() => toast.classList.add('opacity-0'), 2600)
      }
    }
  }

  return (
    <Section id="opening" tone="ivory" label={t.nav.opening} className="overflow-hidden px-7 pb-24 pt-[16svh]">
      <JepunBranch className="pointer-events-none absolute -right-6 top-0 w-44 sm:w-60" />
      <div className="relative mx-auto max-w-xl text-center">
        {/* canang sari dengan dupa yang mengepul */}
        <div className="relative mx-auto h-24 w-20" data-anim="fade">
          <Dupa className="absolute bottom-6 left-1/2 h-20 w-8 -translate-x-1/2" />
          <Canang className="absolute bottom-0 left-1/2 w-16 -translate-x-1/2" />
        </div>
        <p className="accent mt-8 text-[1.6rem] text-prada" data-anim="lines">
          {c(wedding.greeting.opening)}
        </p>
        <p className="mx-auto mt-3 max-w-xs text-[13px] text-ink-soft" data-anim="up">
          {c(wedding.greeting.openingSub)}
        </p>

        <p className="lead mx-auto mt-16 max-w-sm" data-anim="lines">
          {c(wedding.greeting.quote)}
        </p>
        <p className="label mt-4" data-anim="fade">
          {c(wedding.greeting.quoteSource)}
        </p>

        <h1 className="mt-24 cursor-default" onClick={onNameTap}>
          <span className="display-i block text-[clamp(4.4rem,24vw,9rem)] text-ink" data-anim="lines">
            {a.nick}
          </span>
          <span className="aksara block text-xl" data-anim="fade" lang="ban">
            {a.aksara || toAksaraBali(a.nick)}
          </span>
          <span className="accent my-3 block text-3xl text-prada" data-anim="fade">
            &amp;
          </span>
          <span className="display-i block text-[clamp(4.4rem,24vw,9rem)] text-ink" data-anim="lines">
            {b.nick}
          </span>
          <span className="aksara block text-xl" data-anim="fade" lang="ban">
            {b.aksara || toAksaraBali(b.nick)}
          </span>
        </h1>

        {d && (
          <p className="mt-10 text-[12px] tracking-[0.42em] uppercase text-ink-soft" data-anim="up">
            {d.weekday} · {d.day} {d.month} {d.year}
          </p>
        )}

        <PatraSari className="mx-auto mt-20 w-64" />
        <p className="lead mx-auto mt-12 max-w-md !text-[1.08rem]" data-anim="lines">
          {c(wedding.greeting.intro)}
        </p>
      </div>
      <div
        id="egg-toast"
        role="status"
        className="pointer-events-none fixed left-1/2 top-6 z-[70] -translate-x-1/2 rounded-full bg-ink/85 px-4 py-2 text-xs text-ivory opacity-0 transition-opacity duration-500"
      >
        {t.easterEgg}
      </div>
    </Section>
  )
}
