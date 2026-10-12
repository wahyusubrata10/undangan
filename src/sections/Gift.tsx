import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { GiftAccount } from '@/config/types'
import { Section, SectionTitle } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { Jepun } from '@/ornaments'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // fallback untuk in-app browser lama
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

/** micro-interaction (Framer Motion): label tombol berganti saat tersalin */
function CopyButton({ text, label }: { text: string; label: string }) {
  const { t } = useApp()
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle')
  const onClick = async () => {
    const ok = await copyText(text)
    setState(ok ? 'ok' : 'fail')
    if (ok) navigator.vibrate?.(15)
    window.setTimeout(() => setState('idle'), 1800)
  }
  return (
    <button type="button" onClick={onClick} className="btn-line relative min-w-28 overflow-hidden" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={state} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
          {state === 'ok' ? `✓ ${t.copied}` : state === 'fail' ? t.copyFailed : label}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function Account({ acc }: { acc: GiftAccount }) {
  const { t } = useApp()
  return (
    <div className="soft px-7 py-8" data-anim="up">
      <p className="label">{acc.provider}</p>
      <p className="display mt-4 text-[1.9rem] tracking-[0.06em] text-ink [font-variant-numeric:lining-nums_tabular-nums]">{acc.number.replace(/(.{4})/g, '$1 ').trim()}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-soft">
          {t.accountHolder} {acc.holder}
        </p>
        <CopyButton text={acc.number} label={t.copy} />
      </div>
    </div>
  )
}

/** 9 · Amplop digital — kartu minimal tanpa bingkai. Aksen: bunga jepun. */
export default function Gift() {
  const { t, c } = useApp()
  const g = wedding.gift
  if (!g.enabled) return null
  return (
    <Section id="gift" tone="cream" label={t.nav.gift} className="px-6 py-32">
      <Jepun className="mx-auto mb-10 w-10" />
      <SectionTitle label={t.sendGift} title={t.giftTitle} />
      <p className="lead mx-auto mt-8 max-w-md text-center !text-[1.05rem]" data-anim="lines">
        {c(g.intro)}
      </p>
      <div className="mx-auto mt-16 flex max-w-lg flex-col gap-5">
        {g.accounts.map((a, i) => (
          <Account key={i} acc={a} />
        ))}
        {g.qris && (
          <div className="soft px-7 py-8 text-center" data-anim="up">
            <p className="label">{t.scanQris}</p>
            <SmartImage photo={g.qris} alt="QRIS" className="mx-auto mt-5 w-56" ratio="1/1" />
          </div>
        )}
        {g.address && (
          <div className="px-2 pt-10 text-center" data-anim="up">
            <p className="label">{t.sendGift}</p>
            <p className="display-i mt-4 text-[1.8rem] text-ink">{g.address.recipient}</p>
            {g.address.phone && <p className="text-[13px] text-ink-soft">{g.address.phone}</p>}
            <p className="mx-auto mt-2 max-w-xs text-[14px] text-ink-soft">{c(g.address.text)}</p>
            <div className="mt-5">
              <CopyButton text={`${g.address.recipient}${g.address.phone ? ` (${g.address.phone})` : ''}\n${c(g.address.text)}`} label={t.copyAddress} />
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}
