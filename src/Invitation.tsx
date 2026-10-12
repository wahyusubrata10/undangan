import { useEffect, useMemo, useRef } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { SectionId } from '@/config/types'
import { lockScroll, startSmoothScroll, ScrollTrigger } from '@/fx/scroll'
import { setupReveals } from '@/fx/reveal'
import Backdrop from '@/components/Backdrop'
import PatraWipe from '@/components/PatraWipe'
import Dock from '@/components/Dock'
import Opening from '@/sections/Opening'
import Countdown from '@/sections/Countdown'
import Couple from '@/sections/Couple'
import Story from '@/sections/Story'
import Events from '@/sections/Events'
import Live from '@/sections/Live'
import Gallery from '@/sections/Gallery'
import Gift from '@/sections/Gift'
import Rsvp from '@/sections/Rsvp'
import Closing from '@/sections/Closing'

export default function Invitation() {
  const { opened, reduced, setActive } = useApp()
  const root = useRef<HTMLDivElement>(null)

  const ids = useMemo(() => {
    const list: SectionId[] = ['opening', 'countdown', 'couple']
    if (wedding.story.enabled && wedding.story.chapters.length) list.push('story')
    list.push('events')
    if (wedding.liveStream.enabled) list.push('live')
    list.push('gallery')
    if (wedding.gift.enabled) list.push('gift')
    if (wedding.rsvp.enabled) list.push('rsvp')
    list.push('closing')
    return list
  }, [])

  // animasi reveal & smooth scroll baru aktif setelah gerbang dibuka
  useEffect(() => {
    if (!opened || !root.current) return
    startSmoothScroll(reduced)
    const cleanup = setupReveals(root.current, reduced)
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

  // section aktif (untuk navigasi & crossfade video)
  useEffect(() => {
    if (!opened) return
    const triggers = ids.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(id),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [opened, ids, setActive])

  return (
    <>
      <Backdrop />
      <main ref={root} className="invite-col z-10 lg:border-l lg:border-prada/20 lg:bg-hitam/40">
        <Opening />
        <Countdown />
        <Couple />
        <Story />
        <Events />
        <Live />
        <Gallery />
        <Gift />
        <Rsvp />
        <Closing />
      </main>
      {opened && (
        <>
          <PatraWipe />
          <Dock ids={ids} />
        </>
      )}
    </>
  )
}
