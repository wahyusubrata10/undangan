import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const EASE = 'power3.out'

/**
 * Satu sistem reveal untuk seluruh undangan (konsisten durasi & easing):
 *  [data-reveal="up|fade|scale|left|right"]  → muncul saat masuk viewport (batch + stagger)
 *  [data-split="chars|words|lines"]          → SplitText dengan mask
 *  svg .draw (pathLength=1)                  → garis ornamen "tergambar"
 *  [data-mask]                               → clip-path terbuka (foto)
 *  .text-prada                               → kilau emas hanya saat terlihat
 */
export function setupReveals(root: HTMLElement, reduced: boolean): () => void {
  const ctx = gsap.context(() => {
    const els = gsap.utils.toArray<HTMLElement>('[data-reveal]', root)
    if (reduced) {
      gsap.set(els, { autoAlpha: 1 })
      return
    }

    const from: Record<string, gsap.TweenVars> = {
      up: { y: 42, autoAlpha: 0 },
      fade: { autoAlpha: 0 },
      scale: { scale: 0.88, autoAlpha: 0 },
      left: { x: -48, autoAlpha: 0 },
      right: { x: 48, autoAlpha: 0 },
    }
    els.forEach((el) => gsap.set(el, from[el.dataset.reveal || 'up'] ?? from.up!))
    ScrollTrigger.batch(els, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 1.1,
          ease: EASE,
          stagger: 0.09,
          overwrite: true,
          clearProps: 'transform',
        }),
    })

    // SplitText
    gsap.utils.toArray<HTMLElement>('[data-split]', root).forEach((el) => {
      const type = (el.dataset.split || 'chars') as 'chars' | 'words' | 'lines'
      SplitText.create(el, {
        type: type === 'lines' ? 'lines' : `lines,${type}`,
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          const targets = type === 'lines' ? self.lines : type === 'words' ? self.words : self.chars
          // background-clip:text tidak menembus elemen ber-transform → pasang gradien emas per potongan
          if (el.closest('.text-prada')) targets.forEach((t) => t.classList.add('text-prada', 'text-prada-piece'))
          return gsap.from(targets, {
            yPercent: 110,
            rotate: type === 'chars' ? 6 : 0,
            duration: type === 'chars' ? 1.2 : 1.1,
            ease: 'expo.out',
            stagger: type === 'chars' ? 0.035 : 0.06,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          })
        },
      })
    })

    // garis ornamen tergambar
    gsap.utils.toArray<SVGPathElement>('svg .draw', root).forEach((p) => {
      gsap.fromTo(
        p,
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: p.ownerSVGElement ?? p, start: 'top 90%', once: true } },
      )
    })
    gsap.utils.toArray<SVGPathElement>('svg .draw-fill', root).forEach((p) => {
      gsap.from(p, { opacity: 0, duration: 1.2, delay: 1, scrollTrigger: { trigger: p.ownerSVGElement ?? p, start: 'top 90%', once: true } })
    })

    // foto terbuka dengan mask
    gsap.utils.toArray<HTMLElement>('[data-mask]', root).forEach((el, i) => {
      const shape = el.dataset.mask
      const start =
        shape === 'arch'
          ? 'inset(100% 0% 0% 0% round 50% 50% 0 0)'
          : shape === 'petal'
            ? 'circle(0% at 50% 50%)'
            : 'inset(0% 50% 0% 50%)'
      const end = shape === 'arch' ? 'inset(0% 0% 0% 0% round 50% 50% 0 0)' : shape === 'petal' ? 'circle(75% at 50% 50%)' : 'inset(0% 0% 0% 0%)'
      gsap.fromTo(
        el,
        { clipPath: start },
        {
          clipPath: end,
          duration: 1.4,
          ease: 'expo.out',
          delay: (i % 3) * 0.08,
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onComplete: () => {
            if (shape !== 'arch') el.style.clipPath = ''
          },
        },
      )
      const img = el.querySelector('img')
      if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
    })
  }, root)

  // kilau prada hanya saat terlihat (hemat paint)
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('is-shimmer', e.isIntersecting && !reduced)),
    { rootMargin: '50px' },
  )
  root.querySelectorAll('.text-prada').forEach((el) => io.observe(el))

  // perbarui posisi setelah font & gambar dimuat
  const refresh = () => ScrollTrigger.refresh()
  void document.fonts?.ready.then(refresh)
  window.addEventListener('load', refresh)

  return () => {
    io.disconnect()
    window.removeEventListener('load', refresh)
    ctx.revert()
  }
}
