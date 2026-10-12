import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
let tickerFn: ((time: number) => void) | null = null

/** Lenis + GSAP memakai satu ticker → tidak ada jitter antara scroll & animasi. */
export function startSmoothScroll(reduced: boolean): Lenis | null {
  if (lenis) return lenis
  if (reduced) {
    ScrollTrigger.refresh()
    return null
  }
  lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    // HP: scroll sentuh native (momentum alami, paling ringan). Kehalusan animasi
    // datang dari `scrub` ScrollTrigger yang menghaluskan perubahan posisi.
    syncTouch: false,
    touchMultiplier: 1,
  })
  lenis.on('scroll', ScrollTrigger.update)
  tickerFn = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tickerFn)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function getLenis() {
  return lenis
}

/** Titik navigasi khusus (mis. fase di dalam section yang di-pin): id → posisi scroll. */
export const navTargets: Record<string, () => number> = {}

export function scrollToEl(target: string | HTMLElement, offset = 0) {
  if (typeof target === 'string' && navTargets[target.replace('#', '')]) {
    const y = navTargets[target.replace('#', '')]!()
    if (lenis) lenis.scrollTo(y, { duration: 1.8 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.8 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function stopSmoothScroll() {
  if (tickerFn) gsap.ticker.remove(tickerFn)
  lenis?.destroy()
  lenis = null
}

export function lockScroll(locked: boolean) {
  document.body.classList.toggle('is-locked', locked)
  if (locked) lenis?.stop()
  else lenis?.start()
}

export { gsap, ScrollTrigger }
