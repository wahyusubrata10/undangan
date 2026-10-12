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
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Di HP biarkan scroll native (lebih hemat & terasa alami).
    syncTouch: false,
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

export function scrollToEl(target: string | HTMLElement, offset = 0) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.6 })
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
