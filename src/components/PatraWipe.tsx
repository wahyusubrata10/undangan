import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useApp } from '@/context'
import { PatraBand, PatraPunggel } from '@/ornaments'

/**
 * Transisi bertema: pita patra emas "menyapu" layar diagonal saat masuk section bertanda [data-sweep].
 * Hanya transform & opacity, sekali per section, tidak menghalangi interaksi.
 */
export default function PatraWipe() {
  const { reduced } = useApp()
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !el.current) return
    const node = el.current
    const sections = document.querySelectorAll<HTMLElement>('[data-sweep]')
    let busy = false
    const play = () => {
      if (busy) return
      busy = true
      gsap
        .timeline({ onComplete: () => void (busy = false) })
        .set(node, { autoAlpha: 1, xPercent: -130, rotation: -14 })
        .to(node, { xPercent: 130, duration: 1.25, ease: 'power3.inOut' })
        .set(node, { autoAlpha: 0 })
    }
    const triggers = Array.from(sections).map((s) =>
      ScrollTrigger.create({ trigger: s, start: 'top 70%', once: true, onEnter: play }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [reduced])

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-40 w-[var(--invite-w)] overflow-hidden" aria-hidden="true">
      <div ref={el} className="invisible absolute -inset-y-1/4 left-0 w-full will-change-transform">
        <div className="absolute inset-y-0 left-1/2 w-[46%] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(42,7,9,.85)_25%,rgba(42,7,9,.92)_50%,rgba(42,7,9,.85)_75%,transparent)]" />
        <div className="absolute inset-y-0 left-[36%] w-10">
          <PatraBand vertical height={40} />
        </div>
        <div className="absolute inset-y-0 right-[30%] w-px bg-prada/70" />
        <div className="absolute inset-y-0 left-[33%] w-px bg-prada/50" />
        <PatraPunggel className="absolute left-1/2 top-1/2 w-24 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}
