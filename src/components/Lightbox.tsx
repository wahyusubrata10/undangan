import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '@/context'
import { resolvePhoto, srcSet } from '@/lib/media'
import { getLenis } from '@/fx/scroll'

interface Props {
  photos: string[]
  index: number
  onClose: () => void
}

/**
 * Lightbox layar penuh: swipe kiri/kanan, swipe bawah untuk tutup, pinch-zoom,
 * double-tap zoom, keyboard, dan tombol "kembali" HP menutup lightbox.
 */
export default function Lightbox({ photos, index, onClose }: Props) {
  const { t } = useApp()
  const [i, setI] = useState(index)
  const stage = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLDivElement>(null)
  const st = useRef({ scale: 1, x: 0, y: 0, dx: 0, dy: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ startDist: number; startScale: number; sx: number; sy: number; ox: number; oy: number; lastTap: number }>({
    startDist: 0,
    startScale: 1,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
    lastTap: 0,
  })

  const apply = useCallback((animate = false) => {
    const s = st.current
    if (!img.current) return
    img.current.style.transition = animate ? 'transform .45s cubic-bezier(.16,1,.3,1)' : 'none'
    img.current.style.transform = `translate3d(${s.x + s.dx}px, ${s.y + s.dy}px, 0) scale(${s.scale})`
    if (stage.current) stage.current.style.backgroundColor = `rgba(28,22,17,${s.scale === 1 ? Math.max(0.4, 0.96 - Math.abs(s.dy) / 600) : 0.96})`
  }, [])

  const reset = useCallback(() => {
    st.current = { scale: 1, x: 0, y: 0, dx: 0, dy: 0 }
    apply(true)
  }, [apply])

  const go = useCallback(
    (d: number) => {
      setI((v) => (v + d + photos.length) % photos.length)
      st.current = { scale: 1, x: 0, y: 0, dx: 0, dy: 0 }
      requestAnimationFrame(() => apply(false))
    },
    [photos.length, apply],
  )

  // tombol back HP menutup lightbox
  useEffect(() => {
    history.pushState({ lightbox: true }, '')
    const onPop = () => onClose()
    window.addEventListener('popstate', onPop)
    getLenis()?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') history.back()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    stage.current?.focus()
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
      getLenis()?.start()
    }
  }, [onClose, go])

  const close = () => history.back()

  const onDown = (e: React.PointerEvent) => {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      g.startDist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      g.startScale = st.current.scale
    } else {
      g.sx = e.clientX
      g.sy = e.clientY
      g.ox = st.current.x
      g.oy = st.current.y
      const now = Date.now()
      if (now - g.lastTap < 280) {
        // double-tap zoom
        st.current.scale = st.current.scale > 1 ? 1 : 2.4
        if (st.current.scale === 1) {
          st.current.x = 0
          st.current.y = 0
        }
        apply(true)
        g.lastTap = 0
        return
      }
      g.lastTap = now
    }
  }

  const onMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    const s = st.current
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      s.scale = Math.min(4, Math.max(1, g.startScale * (dist / (g.startDist || dist))))
      apply()
      return
    }
    const dx = e.clientX - g.sx
    const dy = e.clientY - g.sy
    if (s.scale > 1) {
      s.x = g.ox + dx
      s.y = g.oy + dy
      s.dx = 0
      s.dy = 0
    } else if (Math.abs(dx) > Math.abs(dy)) {
      s.dx = dx
      s.dy = 0
    } else {
      s.dy = dy
      s.dx = 0
    }
    apply()
  }

  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    const s = st.current
    if (pointers.current.size > 0) return
    if (s.scale <= 1.02) {
      if (s.dx < -60) return go(1)
      if (s.dx > 60) return go(-1)
      if (Math.abs(s.dy) > 110) return close()
      reset()
    }
  }

  const ref = photos[i]!
  const r = resolvePhoto(ref)

  return createPortal(
    <div
      ref={stage}
      role="dialog"
      aria-modal="true"
      aria-label={`${t.photo} ${i + 1} / ${photos.length}`}
      tabIndex={-1}
      className="fixed inset-0 z-[80] flex touch-none select-none items-center justify-center bg-[#1c1611]/95 outline-none"
      style={{ animation: 'lb-in .4s cubic-bezier(.16,1,.3,1)' }}
    >
      <style>{`@keyframes lb-in{from{opacity:0}to{opacity:1}}`}</style>
      <div className="absolute inset-0" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div ref={img} className="flex h-full w-full items-center justify-center will-change-transform">
          {r.kind === 'empty' ? (
            <div className="grid aspect-[3/4] w-[70%] max-w-sm place-items-center rounded-3xl bg-white/5 text-xs tracking-[0.3em] text-ivory/60 uppercase">
              {t.emptyPhoto} {i + 1}
            </div>
          ) : (
            <picture>
              {r.kind === 'manifest' && r.entry.formats.includes('avif') && <source type="image/avif" srcSet={srcSet(r.entry, 'avif')} sizes="100vw" />}
              {r.kind === 'manifest' && <source type="image/webp" srcSet={srcSet(r.entry, 'webp')} sizes="100vw" />}
              <img
                src={r.kind === 'url' ? r.src : `${r.entry.base}-${r.entry.widths[r.entry.widths.length - 1]}.webp`}
                alt={`${t.photo} ${i + 1}`}
                draggable={false}
                className="max-h-[100svh] max-w-[100vw] object-contain"
              />
            </picture>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="text-xs tracking-[0.3em] text-ivory/70">
          {String(i + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
        </span>
        <button type="button" onClick={close} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-white/10 text-ivory backdrop-blur" aria-label={t.close}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-ivory backdrop-blur md:grid" aria-label={t.prev}>
            ‹
          </button>
          <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-ivory backdrop-blur md:grid" aria-label={t.next}>
            ›
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}
