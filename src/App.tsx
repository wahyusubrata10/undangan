import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import Cover from '@/sections/Cover'
import { music } from '@/fx/audio'

const loadInvitation = () => import('@/Invitation')
const loadOpening = () => import('@/fx/opening')
const Invitation = lazy(loadInvitation)
const Particles = lazy(() => import('@/components/Particles'))

function whenIdle(fn: () => void, timeout = 1200) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout })
  else window.setTimeout(fn, 300)
}

async function requestImmersive() {
  // Fullscreen hanya di perangkat sentuh (HP) & bila didukung. iOS Safari tidak mendukung → diabaikan.
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
  if (matchMedia('(pointer: coarse)').matches) {
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' })
      else await el.webkitRequestFullscreen?.()
    } catch {
      /* ditolak / tidak didukung */
    }
  }
}

function requestMotionPermission() {
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
  if (typeof DOE?.requestPermission === 'function') DOE.requestPermission().catch(() => {})
}

export default function App() {
  const { opened, setOpened, reduced, fx } = useApp()
  const [mountInvite, setMountInvite] = useState(false)
  const [opening, setOpening] = useState(false)
  const [coverGone, setCoverGone] = useState(false)
  const coverRef = useRef<HTMLDivElement>(null)
  const inviteRef = useRef<HTMLDivElement>(null)
  const fxRef = useRef(fx)
  fxRef.current = fx

  // kunci scroll sebelum dibuka
  useEffect(() => {
    document.body.classList.add('is-locked')
    music.init(wedding.music.src, wedding.music.volume, wedding.music.startAt)
    // Cover tetap ringan: bagian undangan & kelopak bunga baru dimuat saat halaman sudah tenang
    // (±3,5 dtk setelah load) ATAU saat tamu mulai berinteraksi — mana yang lebih dulu.
    let started = false
    const prefetch = () => {
      if (started) return
      started = true
      void loadOpening()
      void loadInvitation().then(() => {
        setMountInvite(true)
        if (!reduced) whenIdle(() => void import('@/fx/petals'), 2500)
      })
    }
    const events = ['pointerdown', 'touchstart', 'keydown', 'wheel'] as const
    events.forEach((e) => window.addEventListener(e, prefetch, { once: true, passive: true }))
    let timer = 0
    const arm = () => (timer = window.setTimeout(() => whenIdle(prefetch, 2000), 3500))
    if (document.readyState === 'complete') arm()
    else window.addEventListener('load', arm, { once: true })
    return () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, prefetch))
      window.removeEventListener('load', arm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onOpen = useCallback(async () => {
    if (opening) return
    setOpening(true)
    // semua yang butuh "user gesture" dipanggil sinkron di sini
    void music.play(true)
    requestMotionPermission()
    void requestImmersive()
    setMountInvite(true)
    const [{ playOpening }] = await Promise.all([loadOpening(), loadInvitation()])
    // tunggu 1 frame agar Invitation ter-render
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    setOpened(true)
    playOpening(coverRef.current!, inviteRef.current, {
      reduced,
      onBurst: () => {
        if (fxRef.current) fxRef.current.burst()
        else (window as Window & { __pendingBurst?: boolean }).__pendingBurst = true
      },
      onDone: () => {
        setCoverGone(true)
        document.body.classList.remove('is-locked')
      },
    })
  }, [opening, reduced, setOpened])

  return (
    <>
      {mountInvite && (
        <Suspense fallback={null}>
          <div ref={inviteRef} style={{ visibility: opened ? 'visible' : 'hidden' }}>
            <Invitation />
          </div>
        </Suspense>
      )}
      {opening && (
        <Suspense fallback={null}>
          <Particles front={!coverGone} />
        </Suspense>
      )}
      {!coverGone && <Cover ref={coverRef} onOpen={onOpen} opening={opening} />}
    </>
  )
}
