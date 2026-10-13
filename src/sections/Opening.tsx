import { useRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import { Canang, Dupa, PatraSari } from '@/ornaments'
import { FloralCorner } from '@/ornaments/scene'
import { coupleOrder } from '@/lib/couple'
import { toAksaraBali } from '@/lib/aksara'
import { dateParts } from '@/lib/format'

/** 2 · Pembuka: salam, kutipan singkat, nama kedua mempelai. Latar biru kabut pagi. */
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
    <Section id="opening" tone="mist" label={t.nav.opening} className="overflow-hidden px-7 pb-24 pt-[14svh] lg:pb-36">
      <FloralCorner className="pointer-events-none absolute -right-4 -top-2 w-44 sm:w-60" />
      <FloralCorner flip className="pointer-events-none absolute -left-4 bottom-0 w-36 rotate-180 opacity-90 sm:w-48" />
      <div className="relative mx-auto max-w-xl text-center">
        {/* canang sari dengan dupa yang mengepul */}
        <div className="relative mx-auto h-24 w-20" data-anim="fade">
          <Dupa className="absolute bottom-6 left-1/2 h-20 w-8 -translate-x-1/2" />
          <Canang className="absolute bottom-0 left-1/2 w-16 -translate-x-1/2" />
        </div>
        <p className="accent mt-8 text-[1.7rem] text-prada" data-anim="up">
          {c(wedding.greeting.opening)}
        </p>
        <p className="mx-auto mt-3 max-w-xs text-[13px] text-ink-soft" data-anim="up">
          {c(wedding.greeting.openingSub)}
        </p>

        <p className="lead mx-auto mt-14 max-w-sm" data-anim="up">
          {c(wedding.greeting.quote)}
        </p>
        <p className="label mt-4" data-anim="up">
          {c(wedding.greeting.quoteSource)}
        </p>

        <PatraSari className="mx-auto mt-16 w-60" />

        <p className="lead mx-auto mt-10 max-w-md !text-[1.08rem]" data-anim="up">
          {c(wedding.greeting.intro)}
        </p>

        <h2 className="mt-10 cursor-default" onClick={onNameTap} data-anim="up">
          <span className="display-i text-[clamp(2.6rem,11vw,4rem)] text-ink">{a.nick}</span>
          <span className="accent mx-3 align-middle text-2xl text-prada">&amp;</span>
          <span className="display-i text-[clamp(2.6rem,11vw,4rem)] text-ink">{b.nick}</span>
          <span className="aksara block text-lg" lang="ban">{`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}</span>
        </h2>
        {d && (
          <p className="mt-4 text-[12px] tracking-[0.42em] uppercase text-ink-soft" data-anim="up">
            {d.weekday} · {d.day} {d.month} {d.year}
          </p>
        )}
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
