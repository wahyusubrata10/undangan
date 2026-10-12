/**
 * Sistem gerak terpadu — semua terikat scroll (scrub), hanya transform & opacity.
 *
 *  [data-anim="lines"]      teks muncul per baris dari balik mask (SplitText)
 *  [data-anim="up|fade"]    elemen naik/memudar mengikuti scroll
 *  [data-curtain]           foto terbuka seperti tirai (wrapper & isi bergerak berlawanan)
 *  [data-parallax="0.15"]   lapisan bergerak dengan kecepatan berbeda (foreground/midground/background)
 *  [data-tone="cream|pasir"] warna latar halaman berpindah halus mengikuti section
 *
 * Koreografi: di dalam satu section, elemen diberi offset berdasarkan urutan
 * kemunculannya → foto, judul, teks, aksen mengalir dengan jeda konsisten.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const SCRUB = 1
const STEP = 3 // % jarak antar elemen berurutan dalam satu section

/** will-change hanya selama trigger aktif */
const wc = (els: Element | Element[], v: string) => (self: ScrollTrigger) => {
  const list = Array.isArray(els) ? els : [els]
  list.forEach((e) => ((e as HTMLElement).style.willChange = self.isActive ? v : ''))
}

export function setupMotion(root: HTMLElement, reduced: boolean): () => void {
  const ctx = gsap.context(() => {
    if (reduced) return

    // urutan elemen per section → offset koreografi
    const orderOf = new Map<Element, number>()
    root.querySelectorAll('section').forEach((sec) => {
      sec.querySelectorAll('[data-anim],[data-curtain]').forEach((el, i) => orderOf.set(el, i))
    })
    const startFor = (_el: Element, base = 92) => `top ${base}%`
    const endFor = (el: Element) => `top ${Math.max(40, 64 - Math.min(6, orderOf.get(el) ?? 0) * STEP)}%`

    // teks per baris
    gsap.utils.toArray<HTMLElement>('[data-anim="lines"]', root).forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'line-mask-inner',
        autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(
            self.lines,
            { yPercent: 105, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              ease: 'none',
              stagger: 0.12,
              scrollTrigger: { trigger: el, start: startFor(el), end: endFor(el), scrub: SCRUB, onToggle: wc(self.lines, 'transform, opacity') },
            },
          )
        },
      })
    })

    gsap.utils.toArray<HTMLElement>('[data-anim="up"],[data-anim="fade"]', root).forEach((el) => {
      const up = el.dataset.anim === 'up'
      gsap.fromTo(
        el,
        { y: up ? 46 : 0, opacity: 0 },
        { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: startFor(el, 96), end: endFor(el), scrub: SCRUB, onToggle: wc(el, 'transform, opacity') } },
      )
    })

    // tirai foto: wrapper naik dari bawah, isi turun → terlihat seperti mask terbuka (tanpa clip-path)
    gsap.utils.toArray<HTMLElement>('[data-curtain]', root).forEach((el) => {
      const inner = el.firstElementChild as HTMLElement | null
      if (!inner) return
      const dir = el.dataset.curtain === 'x' ? 'xPercent' : 'yPercent'
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 45%', scrub: SCRUB, onToggle: wc([el, inner], 'transform') },
      })
      tl.fromTo(el, { [dir]: 100 }, { [dir]: 0, ease: 'none' }, 0).fromTo(inner, { [dir]: -100, scale: 1.18 }, { [dir]: 0, scale: 1, ease: 'none' }, 0)
    })

    // parallax berlapis
    gsap.utils.toArray<HTMLElement>('[data-parallax]', root).forEach((el) => {
      const s = Number(el.dataset.parallax) || 0.15
      gsap.fromTo(
        el,
        { yPercent: s * 100 },
        { yPercent: -s * 100, ease: 'none', scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: true, onToggle: wc(el, 'transform') } },
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
