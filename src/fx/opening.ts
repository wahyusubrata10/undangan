import { gsap } from 'gsap'

interface Opts {
  reduced: boolean
  onBurst: () => void
  onDone: () => void
}

/**
 * Pembukaan ±2,8 dtk: teks memudar → gerbang paras terbelah (lapisan depan lebih cepat)
 * → kamera maju menembus kabut → undangan muncul dari cahaya.
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
  const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' }, onComplete: onDone })
  tl.to(q('.cv-plaque'), { y: 40, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, 0)
    .to(q('.cv-top'), { y: -24, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, 0.05)
    .to(q('.cv-sun'), { scale: 1.8, duration: 2.2, ease: 'power2.out' }, 0.2)
    .call(onBurst, [], 0.75)
    .to(q('.cv-left'), { xPercent: -110, scale: 1.25, transformOrigin: '100% 100%', duration: 2 }, 0.45)
    .to(q('.cv-right'), { xPercent: 110, scale: 1.25, transformOrigin: '0% 100%', duration: 2 }, 0.45)
    .to(q('.cv-gate'), { scale: 1.35, transformOrigin: '50% 75%', duration: 2.2 }, 0.5)
    .to(q('.cv-near'), { yPercent: 60, scale: 1.3, duration: 1.8 }, 0.5)
    .to(q('.cv-sky'), { scale: 1.2, transformOrigin: '50% 60%', duration: 2.4, ease: 'power2.inOut' }, 0.5)
    .to(cover, { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, 2.0)
  if (invite) tl.fromTo(invite, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'expo.out', clearProps: 'transform' }, 1.8)
}
