import { useRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section } from '@/components/Section'
import { Bingkai, Padma, UkiranBand } from '@/ornaments/ukiran'
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
    <Section id="opening" tone="nila" label={t.nav.opening} className="overflow-hidden px-3 pb-24 pt-[10svh] sm:px-8 lg:pb-36">
      {/* seperti kartu undangan: bingkai emas dengan sudut ukiran */}
      <div className="relative mx-auto max-w-2xl px-9 py-20 text-center sm:px-16 sm:py-24">
        <Bingkai className="inset-0" corner="w-20 sm:w-28" />
        <div data-anim="fade">
          <Padma className="mx-auto w-24" />
        </div>
        <p className="accent gold-text mt-6 text-[1.8rem]" data-anim="up">
          {c(wedding.greeting.opening)}
        </p>
        <p className="mx-auto mt-3 max-w-xs text-[13px] text-gading-soft" data-anim="up">
          {c(wedding.greeting.openingSub)}
        </p>

        <p className="lead mx-auto mt-14 max-w-sm" data-anim="up">
          {c(wedding.greeting.quote)}
        </p>
        <p className="label mt-4" data-anim="up">
          {c(wedding.greeting.quoteSource)}
        </p>

        <UkiranBand className="mx-auto mt-14 w-64" />

        <p className="lead mx-auto mt-10 max-w-md !text-[1.08rem]" data-anim="up">
          {c(wedding.greeting.intro)}
        </p>

        <h2 className="mt-10 cursor-default" onClick={onNameTap} data-anim="up">
          <span className="display-i gold-text text-[clamp(2.6rem,11vw,4rem)]">{a.nick}</span>
          <span className="accent mx-3 align-middle text-2xl text-emas">&amp;</span>
          <span className="display-i gold-text text-[clamp(2.6rem,11vw,4rem)]">{b.nick}</span>
          <span className="aksara block text-lg" lang="ban">{`${a.aksara || toAksaraBali(a.nick)}  ${b.aksara || toAksaraBali(b.nick)}`}</span>
        </h2>
        {d && (
          <p className="mt-4 text-[12px] tracking-[0.42em] uppercase text-gading-soft" data-anim="up">
            {d.weekday} · {d.day} {d.month} {d.year}
          </p>
        )}
      </div>
      <div
        id="egg-toast"
        role="status"
        className="pointer-events-none fixed left-1/2 top-6 z-[70] -translate-x-1/2 rounded-full bg-gading/85 px-4 py-2 text-xs text-malam opacity-0 transition-opacity duration-500"
      >
        {t.easterEgg}
      </div>
    </Section>
  )
}
