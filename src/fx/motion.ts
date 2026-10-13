/**
 * Sistem gerak terpadu (GSAP ScrollTrigger + Lenis), hanya transform & opacity.
 *
 *  [data-anim="lines"]      teks muncul per baris dari balik mask (SplitText) saat masuk layar
 *  [data-anim="up|fade"]    elemen naik/memudar saat masuk layar
 *  svg .draw                garis ornamen tergambar (stroke)
 *  [data-curtain]           foto terbuka seperti tirai (wrapper & isi bergerak berlawanan)
 *  [data-parallax="0.15"]   lapisan bergerak dengan kecepatan berbeda (foreground/midground/background)
 *  [data-tone="cream|pasir"] warna latar halaman berpindah halus mengikuti section
 *
 * Section pria → wanita → berdua memakai master timeline ber-scrub sendiri (sections/Meet.tsx).
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

/** will-change hanya selama trigger aktif */
const wc = (els: Element | Element[], v: string) => (self: ScrollTrigger) => {
  const list = Array.isArray(els) ? els : [els]
  list.forEach((e) => ((e as HTMLElement).style.willChange = self.isActive ? v : ''))
}

export function setupMotion(root: HTMLElement, reduced: boolean): () => void {
  const ctx = gsap.context(() => {
    if (reduced) return

    /*
     * Konten muncul dengan durasi waktu (≈0,9 dtk) begitu masuk layar — tidak perlu scroll jauh.
     * Berbalik saat di-scroll kembali ke atas (toggleActions), jadi tetap terasa hidup & terhubung scroll.
     * Parallax di bawah tetap scrub (terikat posisi scroll secara kontinu).
     */
    const enter = (trigger: Element, start = 'top 90%') => ({ trigger, start, toggleActions: 'play none none reverse' as const })
    const wcOn = (els: Element | Element[]) => () => (Array.isArray(els) ? els : [els]).forEach((e) => ((e as HTMLElement).style.willChange = 'transform, opacity'))
    const wcOff = (els: Element | Element[]) => () => (Array.isArray(els) ? els : [els]).forEach((e) => ((e as HTMLElement).style.willChange = ''))

    // teks per baris dari balik mask
    gsap.utils.toArray<HTMLElement>('[data-anim="lines"]', root).forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 105,
            opacity: 0,
            duration: 0.95,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: enter(el),
            onStart: wcOn(self.lines),
            onComplete: wcOff(self.lines),
          })
        },
      })
    })

    gsap.utils.toArray<HTMLElement>('[data-anim="up"],[data-anim="fade"]', root).forEach((el) => {
      gsap.from(el, {
        y: el.dataset.anim === 'up' ? 34 : 0,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: enter(el, 'top 94%'),
        onStart: wcOn(el),
        onComplete: wcOff(el),
      })
    })

    // garis ornamen "tergambar" (stroke) saat masuk layar
    gsap.utils.toArray<SVGPathElement>('svg .draw', root).forEach((p) => {
      gsap.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: enter(p.ownerSVGElement ?? p, 'top 92%') })
    })

    // tirai foto: wrapper & isi bergerak berlawanan → seperti mask terbuka (tanpa clip-path)
    gsap.utils.toArray<HTMLElement>('[data-curtain]', root).forEach((el) => {
      const inner = el.firstElementChild as HTMLElement | null
      if (!inner) return
      const dir = el.dataset.curtain === 'x' ? 'xPercent' : 'yPercent'
      gsap
        .timeline({ scrollTrigger: enter(el, 'top 92%'), defaults: { duration: 1.15, ease: 'expo.out' }, onStart: wcOn([el, inner]), onComplete: wcOff([el, inner]) })
        .from(el, { [dir]: 100 }, 0)
        .from(inner, { [dir]: -100, scale: 1.15 }, 0)
    })

    // parallax berlapis (kontinu, terikat scroll)
    gsap.utils.toArray<HTMLElement>('[data-parallax]', root).forEach((el) => {
      const sp = Number(el.dataset.parallax) || 0.15
      gsap.fromTo(
        el,
        { yPercent: sp * 100 },
        { yPercent: -sp * 100, ease: 'none', scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: true, onToggle: wc(el, 'transform') } },
      )
    })
  }, root)

  // warna latar halaman mengikuti section (crossfade lapisan, hanya opacity)
  const offTone = setupTones(root, reduced)

  // posisi trigger dihitung ulang setelah gambar/font selesai dimuat
  const refresh = () => ScrollTrigger.refresh()
  const imgs = Array.from(root.querySelectorAll('img'))
  imgs.forEach((img) => !img.complete && img.addEventListener('load', refresh, { once: true }))
  void document.fonts?.ready.then(refresh)
  window.addEventListener('load', refresh)

  return () => {
    window.removeEventListener('load', refresh)
    offTone()
    ctx.revert()
  }
}

function setupTones(root: HTMLElement, reduced: boolean) {
  const cream = document.getElementById('tone-cream')
  const pasir = document.getElementById('tone-pasir')
  if (!cream || !pasir) return () => {}
  const secs = Array.from(root.querySelectorAll<HTMLElement>('[data-tone]'))
  const target = { cream: 0, pasir: 0 }
  const setC = gsap.quickTo(cream, 'opacity', { duration: reduced ? 0 : 0.9, ease: 'power2.out' })
  const setP = gsap.quickTo(pasir, 'opacity', { duration: reduced ? 0 : 0.9, ease: 'power2.out' })
  const triggers = secs.map((sec) =>
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (!self.isActive) return
        const tone = sec.dataset.tone
        target.cream = tone === 'cream' ? 1 : 0
        target.pasir = tone === 'pasir' ? 1 : 0
        setC(target.cream)
        setP(target.pasir)
      },
    }),
  )
  return () => triggers.forEach((t) => t.kill())
}
