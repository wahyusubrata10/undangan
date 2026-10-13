import { useEffect, useMemo, useRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { SectionId } from '@/config/types'
import { lockScroll, startSmoothScroll, ScrollTrigger } from '@/fx/scroll'
import { setupMotion } from '@/fx/motion'
import Dock from '@/components/Dock'
import Opening from '@/sections/Opening'
import Meet from '@/sections/Meet'
import Events from '@/sections/Events'
import Gallery from '@/sections/Gallery'
import Gift from '@/sections/Gift'
import Rsvp from '@/sections/Rsvp'
import Closing from '@/sections/Closing'

/**
 * Alur (urutan tetap):
 * Cover → Pembuka → Pria → Wanita → Berdua → Galeri sinematik → Countdown+Acara → Amplop → Ucapan → Penutup
 */
export default function Invitation() {
  const { opened, reduced, setActive } = useApp()
  const root = useRef<HTMLDivElement>(null)

  const ids = useMemo(() => {
    const list: SectionId[] = ['opening', 'groom', 'bride', 'couple', 'gallery', 'events']
    if (wedding.gift.enabled) list.push('gift')
    if (wedding.rsvp.enabled) list.push('rsvp')
    list.push('closing')
    return list
  }, [])

  useEffect(() => {
    if (!opened || !root.current) return
    startSmoothScroll(reduced)
    const cleanup = setupMotion(root.current, reduced)
    const id = window.setTimeout(() => {
      lockScroll(false)
      ScrollTrigger.refresh()
    }, 50)
    // tinggi konten berubah (ucapan dimuat, gambar, font) → hitung ulang posisi trigger
    let t = 0
    let lastH = root.current.offsetHeight
    const ro = new ResizeObserver(() => {
      const h = root.current?.offsetHeight ?? 0
      if (Math.abs(h - lastH) < 4) return
      lastH = h
      window.clearTimeout(t)
      t = window.setTimeout(() => ScrollTrigger.refresh(), 200)
    })
    ro.observe(root.current)
    return () => {
      window.clearTimeout(id)
      window.clearTimeout(t)
      ro.disconnect()
      cleanup()
    }
  }, [opened, reduced])

  // section aktif untuk navigasi
  useEffect(() => {
    if (!opened) return
    const triggers = ids
      .map((id) =>
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(id),
        }),
      )
    return () => triggers.forEach((tr) => tr.kill())
  }, [opened, ids, setActive])

  return (
    <>
      {/* warna latar halaman: malam dasar + lapisan bernuansa (nila/kayu/hutan/merah) yang di-crossfade (opacity) */}
      <div className="pointer-events-none fixed inset-0 -z-0" aria-hidden="true">
        <div id="tone-nila" className="absolute inset-0 bg-tone-nila opacity-0" />
        <div id="tone-kayu" className="absolute inset-0 bg-tone-kayu opacity-0" />
        <div id="tone-hutan" className="absolute inset-0 bg-tone-hutan opacity-0" />
        <div id="tone-merah" className="absolute inset-0 bg-tone-merah opacity-0" />
        <div className="grain absolute inset-0" />
      </div>
      <main ref={root} className="relative z-10">
        <Opening />
        <Meet />
        <Gallery />
        <Events />
        <Gift />
        <Rsvp />
        <Closing />
      </main>
      {opened && <Dock ids={ids} />}
    </>
  )
}
