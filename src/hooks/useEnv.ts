import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

export function useMediaQuery(q: string): boolean {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

interface NetworkInformation {
  saveData?: boolean
  effectiveType?: string
  downlink?: number
  addEventListener?: (t: string, l: () => void) => void
}

/** 'low' bila data saver aktif / koneksi lambat → pakai foto, bukan video. */
export function networkQuality(): 'low' | 'high' {
  const c = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (!c) return 'high'
  if (c.saveData) return 'low'
  if (c.effectiveType && /(^|-)2g|3g/.test(c.effectiveType)) return 'low'
  if (typeof c.downlink === 'number' && c.downlink > 0 && c.downlink < 1.5) return 'low'
  return 'high'
}

/** Perkiraan kemampuan perangkat untuk efek berat. */
export function deviceTier(): 'low' | 'mid' | 'high' {
  const n = navigator as Navigator & { deviceMemory?: number }
  const mem = n.deviceMemory ?? 4
  const cores = n.hardwareConcurrency ?? 4
  if (mem <= 2 || cores <= 4) return 'low'
  if (mem <= 4 || cores <= 6) return 'mid'
  return 'high'
}

export function useInView<T extends Element>(ref: React.RefObject<T | null>, rootMargin = '0px'): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}

export const isInAppBrowser = () => /FBAN|FBAV|Instagram|WhatsApp|Line\/|; wv\)/i.test(navigator.userAgent)
