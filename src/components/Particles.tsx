import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context'
import { deviceTier } from '@/hooks/useEnv'
import { Jepun } from '@/ornaments'
import type { ParticlesHandle } from '@/fx/particles'

/** Kanvas partikel 3D (di-load terpisah). Jatuh ke versi CSS bila WebGL berat / tidak ada. */
export default function Particles({ front }: { front: boolean }) {
  const { reduced, setFx } = useApp()
  const [raining, setRaining] = useState(false)
  const z = front || raining ? 'z-[60]' : 'z-[5]'
  const canvas = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<'webgl' | 'css'>(() => (reduced ? 'css' : 'webgl'))
  const [cssBurst, setCssBurst] = useState(0)

  useEffect(() => {
    if (mode !== 'webgl' || !canvas.current) return
    let handle: ParticlesHandle | null = null
    let cancelled = false
    let removeTilt = () => {}
    void import('@/fx/particles').then(({ createParticles }) => {
      if (cancelled || !canvas.current) return
      handle = createParticles(canvas.current, {
        quality: deviceTier(),
        onFallback: () => setMode('css'),
      })
      if (!handle) {
        setMode('css')
        return
      }
      const h = handle
      const w = window as Window & { __pendingBurst?: boolean }
      if (w.__pendingBurst) {
        w.__pendingBurst = false
        h.burst()
      }
      setFx({
        burst: (x, y) => h.burst(x, y),
        rain: () => {
          h.rain(7)
          setRaining(true)
          window.setTimeout(() => setRaining(false), 9000)
        },
      })
      // gyroscope (izin iOS diminta di tombol Buka Undangan)
      const onOrient = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return
        h.setTilt(e.gamma / 35, (e.beta - 45) / 45)
      }
      const onMouse = (e: MouseEvent) => h.setTilt((e.clientX / innerWidth - 0.5) * 1.2, (e.clientY / innerHeight - 0.5) * -0.8)
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
      handle?.dispose()
      setFx(null)
    }
  }, [mode, setFx])

  useEffect(() => {
    if (mode !== 'css') return
    setFx({ burst: () => setCssBurst((n) => n + 1), rain: () => setCssBurst((n) => n + 1) })
    return () => setFx(null)
  }, [mode, setFx])

  if (mode === 'css') return <CssPetals key={cssBurst} intense={cssBurst > 0} reduced={reduced} z={cssBurst > 0 ? 'z-[60]' : z} />
  return <canvas ref={canvas} className={`pointer-events-none fixed inset-0 h-full w-full ${z}`} aria-hidden="true" />
}

/** Versi ringan: beberapa bunga SVG jatuh via CSS transform. */
function CssPetals({ intense, reduced, z }: { intense: boolean; reduced: boolean; z: string }) {
  if (reduced && !intense) return null
  const n = intense ? 18 : 8
  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden ${z}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const left = (i * 37) % 100
        const dur = 9 + ((i * 7) % 8)
        const delay = intense ? (i % 6) * 0.25 : -((i * 3) % dur)
        const size = 16 + ((i * 11) % 18)
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: '-8%',
              width: size,
              height: size,
              animation: `petal-fall ${dur}s linear ${delay}s ${intense ? 1 : 'infinite'} both`,
            }}
          >
            <Jepun style={{ width: '100%', height: '100%', animation: `spin-slow ${4 + (i % 4)}s linear infinite` }} />
          </div>
        )
      })}
      <style>{`@keyframes petal-fall{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(${'var(--dx,40px)'},115vh,0)}}`}</style>
    </div>
  )
}
