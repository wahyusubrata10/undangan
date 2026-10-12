import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { GiftAccount } from '@/config/types'
import { Section, SectionTitle } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { Jepun, SongketPattern } from '@/ornaments'

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

function CopyButton({ text, label }: { text: string; label: string }) {
  const { t } = useApp()
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle')
  const onClick = async () => {
    const ok = await copyText(text)
    setState(ok ? 'ok' : 'fail')
    if (ok) navigator.vibrate?.(18)
    window.setTimeout(() => setState('idle'), 1800)
  }
  return (
    <button type="button" onClick={onClick} className="btn-prada relative !px-4 !py-2.5 !text-[10px]" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5"
        >
          {state === 'ok' ? '✓ ' + t.copied : state === 'fail' ? t.copyFailed : label}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

/** Kartu bank/e-wallet bergaya kartu premium: tilt 3D + kilau mengikuti sudut. */
function AccountCard({ acc, i }: { acc: GiftAccount; i: number }) {
  const { t } = useApp()
  const card = useRef<HTMLDivElement>(null)
  const shine = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  const tilt = (px: number, py: number) => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      if (!card.current || !shine.current) return
      const rx = (0.5 - py) * 16
      const ry = (px - 0.5) * 20
      card.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
      shine.current.style.transform = `translate3d(${(px - 0.5) * 60}%, ${(py - 0.5) * 60}%, 0)`
      shine.current.style.opacity = '1'
    })
  }
  // di HP: kemiringan kartu mengikuti gyroscope saat kartu terlihat
  useEffect(() => {
    const el = card.current
    if (!el || !('DeviceOrientationEvent' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting))
    io.observe(el)
    const onOrient = (e: DeviceOrientationEvent) => {
      if (!visible || e.gamma == null || e.beta == null) return
      tilt(0.5 + Math.max(-1, Math.min(1, e.gamma / 30)) * 0.5, 0.5 + Math.max(-1, Math.min(1, (e.beta - 50) / 30)) * 0.5)
    }
    window.addEventListener('deviceorientation', onOrient, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('deviceorientation', onOrient)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onMove = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    tilt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    cancelAnimationFrame(raf.current)
    if (card.current) card.current.style.transform = ''
    if (shine.current) shine.current.style.opacity = '0'
  }

  const themes = [
    'from-[#3b0a0e] via-[#5a1218] to-[#1a0507]',
    'from-[#14100c] via-[#2a2016] to-[#0b0807]',
    'from-[#2a1c06] via-[#4d3610] to-[#1a1004]',
  ]
  const chip = acc.kind === 'bank'

  return (
    <div className="[perspective:900px]" data-reveal="up">
      <div
        ref={card}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerUp={onLeave}
        className={`relative aspect-[1.586] w-full overflow-hidden rounded-[22px] border border-prada/40 bg-gradient-to-br ${themes[i % themes.length]} p-5 shadow-[0_30px_60px_-25px_rgba(0,0,0,1)] transition-transform duration-300 ease-out will-change-transform`}
      >
        <SongketPattern className="absolute inset-0" opacity={0.14} size={24} />
        <div ref={shine} className="pointer-events-none absolute -inset-1/2 opacity-0 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(255,240,200,.35),transparent_40%)]" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-display text-xl font-semibold tracking-wider text-prada-light">{acc.provider}</span>
            <Jepun tone="gold" className="w-9 opacity-90" />
          </div>
          {chip && (
            <div className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#8a6a24,#f1d58a,#b58c38)] shadow-inner">
              <div className="m-1.5 h-5 rounded-sm border border-[#6b4f17]/60" />
            </div>
          )}
          <div>
            <p className="font-mono text-[1.15rem] tracking-[0.14em] text-gading" aria-label={t.accountNumber}>
              {acc.number.replace(/(.{4})/g, '$1 ').trim()}
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="truncate text-[12px] uppercase tracking-wider text-gading-dim">
                {t.accountHolder} {acc.holder}
              </p>
              <CopyButton text={acc.number} label={t.copy} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Gift() {
  const { t, c } = useApp()
  const g = wedding.gift
  if (!g.enabled) return null
  return (
    <Section id="gift" sweep label={t.nav.gift} bg="marun" className="px-5 py-28">
      <div className="relative mx-auto max-w-md">
        <SectionTitle eyebrow={t.sendGift} title={t.giftTitle} sub={c(g.intro)} />
        <div className="flex flex-col gap-6">
          {g.accounts.map((a, i) => (
            <AccountCard key={i} acc={a} i={i} />
          ))}
        </div>
        {g.qris && (
          <div className="mt-8 rounded-[24px] border border-prada/30 bg-gading p-5 text-center" data-reveal="up">
            <p className="eyebrow !text-marun">{t.scanQris}</p>
            <SmartImage photo={g.qris} alt="QRIS" className="mx-auto mt-3 w-56" ratio="1/1" />
          </div>
        )}
        {g.address && (
          <div className="glass mt-8 rounded-[24px] p-6 text-center" data-reveal="up">
            <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8 text-prada" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="8" width="18" height="13" rx="1.5" />
              <path d="M3 12 H21 M12 8 V21 M12 8 C10 4 6 4 7 7 C8 9 12 8 12 8 C12 8 16 9 17 7 C18 4 14 4 12 8Z" strokeLinejoin="round" />
            </svg>
            <p className="eyebrow mt-3">{t.sendGift}</p>
            <p className="mt-3 font-serif text-xl text-prada-light">{g.address.recipient}</p>
            {g.address.phone && <p className="text-[13px] text-gading-dim">{g.address.phone}</p>}
            <p className="mt-1 text-[14px] text-gading/85">{c(g.address.text)}</p>
            <div className="mt-4 flex justify-center">
              <CopyButton text={`${g.address.recipient}${g.address.phone ? ` (${g.address.phone})` : ''}\n${c(g.address.text)}`} label={t.copyAddress} />
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}
