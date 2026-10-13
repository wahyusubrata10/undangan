/**
 * Sistem gerak — tenang, rapi, konsisten (GSAP ScrollTrigger + Lenis).
 *
 * Prinsip:
 *  • Elemen muncul SEKALI saat masuk layar (fade + naik kecil, ±0,8 dtk) lalu tetap terlihat.
 *    Tidak ada yang menghilang saat scroll ke atas.
 *  • Hanya transform & opacity. Trigger dibuat seminimal mungkin (batch).
 *  • Parallax hanya untuk elemen yang benar-benar ditandai [data-parallax].
 *
 *  [data-anim="up|fade"]    muncul saat masuk layar (di-batch → sedikit trigger)
 *  [data-anim="lines"]      judul besar: per baris dari balik mask (sekali)
 *  [data-anim="photo"]      foto: memudar + skala 1.05 → 1 (sekali)
 *  svg .draw                garis ornamen tergambar (sekali)
 *  [data-parallax="0.1"]    lapisan bergerak pelan mengikuti scroll (scrub)
 *  [data-tone="…"]          warna latar halaman berpindah lembut mengikuti section
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const EASE = 'power2.out'
export const TONES = ['mist', 'cream', 'sage', 'blush'] as const

export function setupMotion(root: HTMLElement, reduced: boolean): () => void {
  const ctx = gsap.context(() => {
    if (reduced) return

    // ---- elemen biasa: di-batch, sekali ----
    const els = gsap.utils.toArray<HTMLElement>('[data-anim="up"],[data-anim="fade"],[data-anim="photo"]', root)
    els.forEach((el) => {
      const kind = el.dataset.anim
      gsap.set(el, { opacity: 0, y: kind === 'up' ? 20 : 0, scale: kind === 'photo' ? 1.04 : 1 })
    })
    ScrollTrigger.batch(els, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: EASE,
          stagger: 0.08,
          overwrite: true,
          clearProps: 'transform,willChange',
          onStart() {
            batch.forEach((b) => ((b as HTMLElement).style.willChange = 'transform, opacity'))
          },
        }),
    })

    // ---- judul besar per baris (sekali) ----
    gsap.utils.toArray<HTMLElement>('[data-anim="lines"]', root).forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 100,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          })
        },
      })
    })

    // ---- garis ornamen tergambar (sekali) ----
    gsap.utils.toArray<SVGPathElement>('svg .draw', root).forEach((p) => {
      gsap.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: p.ownerSVGElement ?? p, start: 'top 92%', once: true } })
    })

    // ---- parallax pelan (hanya yang ditandai) ----
    gsap.utils.toArray<HTMLElement>('[data-parallax]', root).forEach((el) => {
      const sp = Number(el.dataset.parallax) || 0.1
      gsap.fromTo(
        el,
        { yPercent: sp * 100 },
        {
          yPercent: -sp * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') ?? el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            onToggle: (self) => (el.style.willChange = self.isActive ? 'transform' : ''),
          },
        },
      )
    })
  }, root)

  const offTone = setupTones(root, reduced)

  // posisi trigger dihitung ulang setelah gambar/font dimuat
  const refresh = () => ScrollTrigger.refresh()
  root.querySelectorAll('img').forEach((img) => !img.complete && img.addEventListener('load', refresh, { once: true }))
  void document.fonts?.ready.then(refresh)
  window.addEventListener('load', refresh)

  return () => {
    window.removeEventListener('load', refresh)
    offTone()
    ctx.revert()
  }
}

/** Warna latar halaman: lapisan per nada di-crossfade (hanya opacity) mengikuti section aktif. */
function setupTones(root: HTMLElement, reduced: boolean) {
  const layers = Object.fromEntries(TONES.map((t) => [t, document.getElementById(`tone-${t}`)])) as Record<string, HTMLElement | null>
  const setters = Object.fromEntries(
    TONES.map((t) => [t, layers[t] ? gsap.quickTo(layers[t], 'opacity', { duration: reduced ? 0 : 1.1, ease: 'power2.inOut' }) : null]),
  )
  const triggers = Array.from(root.querySelectorAll<HTMLElement>('[data-tone]')).map((sec) =>
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 60%',
      end: 'bottom 60%',
      onToggle: (self) => {
        if (!self.isActive) return
        const tone = sec.dataset.tone
        TONES.forEach((t) => setters[t]?.(t === tone ? 1 : 0))
      },
    }),
  )
  return () => triggers.forEach((t) => t.kill())
}
