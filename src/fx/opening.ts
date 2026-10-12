import { gsap } from 'gsap'

interface Opts {
  reduced: boolean
  onBurst: () => void
  onDone: () => void
}

/**
 * Timeline pembuka sinematik ±3.2 detik:
 * tombol → celah bercahaya → gerbang terbelah (parallax kedalaman) → kamera maju → undangan muncul.
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
  tl.to(q('.cv-btn'), { scale: 0.86, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, 0)
    .to(q('.cv-plaque'), { y: 60, autoAlpha: 0, duration: 0.8, ease: 'power3.in' }, 0.05)
    .to(q('.cv-top'), { y: -30, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, 0.1)
    // celah gerbang bersinar
    .to(q('.cv-crack'), { scaleX: 14, opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.25)
    .to(q('.cv-glow'), { scale: 1.6, opacity: 1, duration: 1.6, ease: 'power2.out' }, 0.25)
    .call(onBurst, [], 0.85)
    // gerbang terbelah: lapisan depan bergerak lebih jauh dari belakang (parallax)
    .to(q('.cv-left'), { xPercent: -112, scale: 1.18, transformOrigin: '100% 100%', duration: 2.2 }, 0.55)
    .to(q('.cv-right'), { xPercent: 112, scale: 1.18, transformOrigin: '0% 100%', duration: 2.2 }, 0.55)
    .to(q('.cv-penjor-l'), { xPercent: -140, scale: 1.4, duration: 2.0 }, 0.6)
    .to(q('.cv-penjor-r'), { xPercent: 140, scale: 1.4, duration: 2.0 }, 0.6)
    // kamera maju melewati gerbang
    .to(q('.cv-gate'), { scale: 1.45, transformOrigin: '50% 70%', duration: 2.4 }, 0.6)
    .to(q('.cv-sky'), { scale: 1.25, transformOrigin: '50% 60%', duration: 2.6, ease: 'power2.inOut' }, 0.6)
    .to(q('.cv-crack'), { opacity: 0, duration: 0.8, ease: 'power1.out' }, 1.3)
    .to(cover, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' }, 2.3)
  if (invite) tl.fromTo(invite, { scale: 1.08, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.6, ease: 'expo.out', clearProps: 'transform' }, 2.0)
}
