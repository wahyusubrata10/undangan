import { gsap } from 'gsap'
import { gateShiftPx } from '@/ornaments/scene'

interface Opts {
  reduced: boolean
  onBurst: () => void
  onDone: () => void
}

/**
 * Pembukaan ±2,6 dtk, tenang: teks memudar → candi bentar terbuka ke samping →
 * kamera maju pelan ke arah gerbang, bingkai bunga tersibak → undangan muncul.
 */
export function playOpening(cover: HTMLElement, invite: HTMLElement | null, { reduced, onBurst, onDone }: Opts) {
  const q = gsap.utils.selector(cover)
  if (reduced) {
    gsap
      .timeline({ onComplete: onDone })
      .to(cover, { autoAlpha: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(invite, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
    return
  }
  const shift = gateShiftPx(cover) // lapisan gerbang digeser dalam px (GPU), setara 170 satuan lukisan
  cover.classList.add('is-opening') // hentikan kelip bintang/pelita selama animasi
  const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: onDone })
  tl.to(q('.cv-top, .cv-plaque'), { autoAlpha: 0, y: (i) => (i === 0 ? -16 : 16), duration: 0.6, ease: 'power2.in' }, 0)
    .call(onBurst, [], 0.6)
    .to(q('.sc-gate-l'), { x: -shift, duration: 1.7 }, 0.35)
    .to(q('.sc-gate-r'), { x: shift, duration: 1.7 }, 0.35)
    .to(q('.cv-flora-l'), { xPercent: -100, duration: 1.6 }, 0.45)
    .to(q('.cv-flora-r'), { xPercent: 100, duration: 1.6 }, 0.45)
    .to(q('.cv-scene'), { scale: 1.32, transformOrigin: '50% 62%', duration: 2.1, ease: 'power2.inOut' }, 0.5)
    .to(cover, { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, 1.85)
  if (invite) tl.fromTo(invite, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'power2.out' }, 1.8)
}
