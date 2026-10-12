import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { SectionId } from '@/config/types'
import { music } from '@/fx/audio'
import { getLenis, scrollToEl } from '@/fx/scroll'
import { NavIcons } from '@/ornaments'
import { langLabels } from '@/i18n'

/* ---------------- Musik + visualizer gamelan ---------------- */
function MusicButton() {
  const { t } = useApp()
  const [playing, setPlaying] = useState(music.playing)
  const bars = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => music.subscribe(setPlaying), [])

  // visualizer: 5 bilah seperti bilah rindik, digerakkan AnalyserNode (fallback: animasi CSS)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const data = new Uint8Array(32)
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const an = music.analyser
      if (!an) return
      an.getByteFrequencyData(data)
      const bands = [2, 4, 6, 9, 13]
      bands.forEach((b, i) => {
        const v = (data[b] ?? 0) / 255
        const el = bars.current[i]
        if (el) el.style.transform = `scaleY(${0.2 + v * 0.95})`
      })
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [playing])

  return (
    <button
      type="button"
      onClick={() => music.toggle()}
      className="relative grid h-11 w-11 place-items-center rounded-full border border-prada/50 bg-hitam/70 text-prada-light shadow-[0_10px_30px_-10px_#000] backdrop-blur"
      aria-label={playing ? t.musicPause : t.musicPlay}
      aria-pressed={playing}
      title={typeof wedding.music.title === 'string' ? wedding.music.title : undefined}
    >
      <span className="absolute inset-0 rounded-full border border-prada/30" style={{ animation: playing ? 'spin-slow 8s linear infinite' : undefined, borderStyle: 'dashed' }} />
      <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            ref={(el) => {
              bars.current[i] = el
            }}
            className="block w-[3px] origin-bottom rounded-full bg-[linear-gradient(to_top,#8a6a24,#f1d58a)] transition-transform duration-100"
            style={{
              height: `${10 + (i % 3) * 4}px`,
              transform: playing ? undefined : 'scaleY(.25)',
              animation: playing && !music.analyser ? `eq ${0.5 + i * 0.13}s ease-in-out ${i * 0.07}s infinite alternate` : undefined,
            }}
          />
        ))}
      </span>
      <style>{`@keyframes eq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}`}</style>
    </button>
  )
}

/* ---------------- Auto scroll ---------------- */
function AutoScrollButton() {
  const { t } = useApp()
  const [on, setOn] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.autoscroll = on ? 'on' : ''
    if (!on) return
    let raf = 0
    let last = performance.now()
    const speed = 42 // px per detik — tenang & nyaman dibaca
    const stop = () => setOn(false)
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const lenis = getLenis()
      const max = document.documentElement.scrollHeight - innerHeight
      const cur = lenis ? lenis.animatedScroll : scrollY
      if (cur >= max - 2) return stop()
      if (lenis) lenis.scrollTo(cur + speed * dt, { immediate: true, force: true })
      else window.scrollTo(0, cur + speed * dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    // berhenti saat pengguna menyentuh / scroll sendiri
    const opts = { passive: true } as const
    window.addEventListener('wheel', stop, opts)
    window.addEventListener('touchstart', stop, opts)
    window.addEventListener('keydown', stop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [on])

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className={`grid h-11 w-11 place-items-center rounded-full border border-prada/50 shadow-[0_10px_30px_-10px_#000] backdrop-blur transition-colors ${on ? 'bg-prada text-hitam' : 'bg-hitam/70 text-prada-light'}`}
      aria-label={on ? t.autoScrollStop : t.autoScroll}
      aria-pressed={on}
      title={on ? t.autoScrollStop : t.autoScroll}
    >
      {on ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <rect x="7" y="6" width="3.5" height="12" rx="1" />
          <rect x="13.5" y="6" width="3.5" height="12" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 4 V18 M6 12 L12 18 L18 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

/* ---------------- Navigasi section ---------------- */
function SectionNav({ ids }: { ids: SectionId[] }) {
  const { t, active } = useApp()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-16 right-0 w-52 overflow-hidden rounded-[22px] border border-prada/40 bg-hitam/92 p-2 shadow-2xl backdrop-blur"
            aria-label={t.navigate}
          >
            {ids.map((id) => {
              const Icon = NavIcons[id]
              const label = t.nav[id as keyof typeof t.nav]
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    scrollToEl(`#${id}`)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${active === id ? 'bg-prada/15 text-prada-light' : 'text-gading-dim hover:bg-prada/10'}`}
                  aria-current={active === id ? 'true' : undefined}
                >
                  {Icon && <Icon width={18} height={18} />}
                  {label}
                </button>
              )
            })}
            <LangSwitch />
          </motion.nav>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-full border border-prada/50 bg-hitam/70 text-prada-light shadow-[0_10px_30px_-10px_#000] backdrop-blur"
        aria-label={t.navigate}
        aria-expanded={open}
      >
        {(() => {
          const Icon = NavIcons[active] ?? NavIcons.opening!
          return <Icon width={20} height={20} />
        })()}
      </button>
    </div>
  )
}

function LangSwitch() {
  const { lang, setLang, t } = useApp()
  if (wedding.meta.langs.length < 2) return null
  return (
    <div className="mt-1 flex items-center gap-1 border-t border-prada/20 px-2 pt-2" role="group" aria-label={t.language}>
      {wedding.meta.langs.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`flex-1 rounded-lg py-1.5 font-display text-[10px] tracking-wider transition-colors ${lang === l ? 'bg-prada text-hitam' : 'text-gading-dim hover:bg-prada/10'}`}
        >
          {langLabels[l]}
        </button>
      ))}
    </div>
  )
}

/**
 * Sembunyikan dock saat tamu scroll ke bawah (membaca) atau sedang mengetik (keyboard HP terbuka),
 * tampil lagi saat scroll ke atas / berhenti sejenak.
 */
function useAutoHide() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let last = scrollY
    let t = 0
    let typing = false
    const onScroll = () => {
      const y = scrollY
      // jangan sembunyi saat auto-scroll berjalan (tombol stop harus tetap terlihat)
      const auto = document.documentElement.dataset.autoscroll === 'on'
      if (!typing) setHidden(!auto && y > last + 2 && y > 200)
      last = y
      window.clearTimeout(t)
      t = window.setTimeout(() => !typing && setHidden(false), 1200)
    }
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
    const onFocus = (e: FocusEvent) => {
      if (isField(e.target) && matchMedia('(pointer: coarse)').matches) {
        typing = true
        setHidden(true)
      }
    }
    const onBlur = (e: FocusEvent) => {
      if (isField(e.target)) {
        typing = false
        setHidden(false)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
    }
  }, [])
  return hidden
}

/** Dock melayang kanan bawah (di dalam kolom undangan pada desktop). */
export default function Dock({ ids }: { ids: SectionId[] }) {
  const hidden = useAutoHide()
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={hidden ? { opacity: 0, x: 70, y: 0 } : { opacity: 1, x: 0, y: 0 }}
      transition={hidden ? { duration: 0.35, ease: [0.16, 1, 0.3, 1] } : { delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex flex-col items-end gap-2.5"
      style={{ pointerEvents: hidden ? 'none' : undefined }}
    >
      <AutoScrollButton />
      <SectionNav ids={ids} />
      <MusicButton />
    </motion.div>
  )
}
