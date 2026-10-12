import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context'
import { deviceTier } from '@/hooks/useEnv'
import type { PetalsHandle } from '@/fx/petals'

/** Kelopak jepun (canvas 2D). Di belakang konten saat membaca; di depan saat pembukaan & hujan bunga. */
export default function Particles({ front }: { front: boolean }) {
  const { reduced, setFx } = useApp()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [raining, setRaining] = useState(false)
  const [off, setOff] = useState(false)

  useEffect(() => {
    if (reduced || off || !canvas.current) return
    let h: PetalsHandle | null = null
    let cancelled = false
    let removeTilt = () => {}
    void import('@/fx/petals').then(({ createPetals }) => {
      if (cancelled || !canvas.current) return
      h = createPetals(canvas.current, { count: deviceTier() === 'low' ? 7 : 11, onFallback: () => setOff(true) })
      if (!h) return
      const handle = h
      const w = window as Window & { __pendingBurst?: boolean }
      if (w.__pendingBurst) {
        w.__pendingBurst = false
        handle.burst()
      }
      setFx({
        burst: (x, y) => handle.burst(x, y),
        rain: () => {
          handle.rain(6)
          setRaining(true)
          window.setTimeout(() => setRaining(false), 9000)
        },
      })
      const onOrient = (e: DeviceOrientationEvent) => e.gamma != null && handle.setTilt(e.gamma / 35)
      const onMouse = (e: MouseEvent) => handle.setTilt((e.clientX / innerWidth - 0.5) * 1.2)
      window.addEventListener('deviceorientation', onOrient, { passive: true })
      window.addEventListener('mousemove', onMouse, { passive: true })
      removeTilt = () => {
        window.removeEventListener('deviceorientation', onOrient)
        window.removeEventListener('mousemove', onMouse)
      }
    })
    return () => {
      cancelled = true
      removeTilt()
      h?.dispose()
      setFx(null)
    }
  }, [reduced, off, setFx])

  if (reduced || off) return null
  return <canvas ref={canvas} className={`pointer-events-none fixed inset-0 h-full w-full ${front || raining ? 'z-[60]' : 'z-[5]'}`} aria-hidden="true" />
}
