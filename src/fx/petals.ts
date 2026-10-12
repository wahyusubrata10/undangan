/**
 * Kelopak bunga jepun berjatuhan — Canvas 2D ringan (tanpa WebGL).
 * Sprite dirender sekali ke offscreen canvas, lalu digambar dengan drawImage + transform.
 * Interaksi: menghindari jari/kursor, miring mengikuti gyroscope, burst & hujan bunga.
 * Berhenti saat tab tersembunyi; kualitas turun otomatis bila FPS rendah.
 */
export interface PetalsHandle {
  burst: (x?: number, y?: number) => void
  rain: (seconds?: number) => void
  setTilt: (x: number) => void
  dispose: () => void
}

interface P {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  vr: number
  s: number
  sway: number
  ph: number
  life: number // -1 = abadi (ambient), >0 = sementara (burst/hujan)
  flip: number
}

function makeSprite(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.translate(size / 2, size / 2)
  const l = size * 0.46
  const w = l * 0.48
  const grad = g.createRadialGradient(0, 0, 0, 0, 0, l)
  grad.addColorStop(0, '#f2c94c')
  grad.addColorStop(0.3, '#f8e3a0')
  grad.addColorStop(0.6, '#fffdf7')
  grad.addColorStop(1, '#fbf5ea')
  for (let i = 0; i < 5; i++) {
    g.save()
    g.rotate((i / 5) * Math.PI * 2)
    g.beginPath()
    g.moveTo(0, 0)
    g.bezierCurveTo(-w * 0.55, -l * 0.25, -w * 0.95, -l * 0.72, -w * 0.35, -l * 0.98)
    g.bezierCurveTo(w * 0.2, -l * 1.12, w * 0.95, -l * 0.9, w * 0.62, -l * 0.5)
    g.bezierCurveTo(w * 0.4, -l * 0.22, w * 0.12, -l * 0.06, 0, 0)
    g.fillStyle = grad
    g.shadowColor = 'rgba(110,90,60,.18)'
    g.shadowBlur = size * 0.04
    g.fill()
    g.restore()
  }
  g.beginPath()
  g.arc(0, 0, size * 0.035, 0, Math.PI * 2)
  g.fillStyle = '#e9b93a'
  g.fill()
  return c
}

export function createPetals(canvas: HTMLCanvasElement, opts: { count: number; onFallback?: () => void }): PetalsHandle | null {
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return null
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const sprite = makeSprite(96)
  let W = 0
  let H = 0
  const pts: P[] = []
  let ambient = opts.count
  let tilt = 0
  let tiltNow = 0
  const pointer = { x: -9999, y: -9999, on: 0 }

  const resize = () => {
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
  }
  resize()

  const spawn = (life = -1, x?: number, y?: number, burst = false): P => {
    const s = (W < 700 ? 18 : 22) + Math.random() * 14
    const ang = Math.random() * Math.PI * 2
    const sp = burst ? 2 + Math.random() * 6 : 0
    return {
      x: x ?? Math.random() * W,
      y: y ?? -40 - Math.random() * H,
      vx: burst ? Math.cos(ang) * sp : 0,
      vy: burst ? Math.sin(ang) * sp - 2 : 0.35 + Math.random() * 0.55,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      s,
      sway: 0.4 + Math.random() * 0.8,
      ph: Math.random() * 10,
      life,
      flip: Math.random() * Math.PI * 2,
    }
  }
  for (let i = 0; i < ambient; i++) pts.push(spawn(-1, undefined, Math.random() * H))

  const onPointer = (e: PointerEvent) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.on = 1
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('pointerdown', onPointer, { passive: true })
  window.addEventListener('resize', resize)

  let raf = 0
  let last = performance.now()
  let acc = 0
  let frames = 0
  let strikes = 0
  let t = 0

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(2.5, (now - last) / 16.67)
    last = now
    t += dt * 0.016
    tiltNow += (tilt - tiltNow) * 0.05
    pointer.on = Math.max(0, pointer.on - 0.01 * dt)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]!
      p.vx *= p.life > 0 ? 0.985 : 0.96
      if (p.life > 0) p.vy = Math.min(p.vy + 0.05 * dt, 1.4)
      let x = p.x + (p.vx + Math.sin(t * p.sway + p.ph) * 0.45 + tiltNow * 0.9) * dt
      const y = p.y + p.vy * dt
      // menghindari jari/kursor
      if (pointer.on > 0) {
        const dx = x - pointer.x
        const dy = y - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < 120 * 120) {
          const d = Math.sqrt(d2) || 1
          x += (dx / d) * (1 - d / 120) * 4 * pointer.on * dt
        }
      }
      p.x = x
      p.y = y
      p.r += p.vr * dt
      p.flip += 0.02 * dt
      if (p.life > 0) {
        p.life -= dt
        if (p.life <= 0 || p.y > H + 50) {
          pts.splice(i, 1)
          continue
        }
      } else if (p.y > H + 50) {
        Object.assign(p, spawn(-1), { y: -40 })
      }
      if (p.x < -60) p.x = W + 40
      else if (p.x > W + 60) p.x = -40
      const sx = Math.abs(Math.cos(p.flip)) * 0.6 + 0.4 // berputar 3D semu
      ctx.globalAlpha = p.life > 0 ? Math.min(1, p.life / 40) : 0.92
      ctx.setTransform(dpr * sx * Math.cos(p.r), dpr * sx * Math.sin(p.r), -dpr * Math.sin(p.r), dpr * Math.cos(p.r), p.x * dpr, p.y * dpr)
      ctx.drawImage(sprite, -p.s / 2, -p.s / 2, p.s, p.s)
    }
    ctx.globalAlpha = 1

    // adaptif: bila berat, kurangi partikel & resolusi
    acc += now - (now - dt * 16.67)
    frames++
    if (frames >= 120) {
      const fps = (frames * 1000) / acc
      acc = 0
      frames = 0
      if (fps < 45) {
        strikes++
        if (dpr > 1) {
          dpr = 1
          resize()
        } else if (ambient > 5) {
          ambient = Math.max(5, Math.floor(ambient * 0.6))
          pts.splice(ambient)
        } else if (strikes > 4) opts.onFallback?.()
      } else strikes = 0
    }
  }
  raf = requestAnimationFrame(frame)

  const onVis = () => {
    cancelAnimationFrame(raf)
    if (!document.hidden) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }
  document.addEventListener('visibilitychange', onVis)

  return {
    burst(x = W / 2, y = H * 0.55) {
      for (let i = 0; i < 34; i++) pts.push(spawn(160 + Math.random() * 120, x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, true))
    },
    rain(seconds = 6) {
      const n = Math.round(seconds * 9)
      for (let i = 0; i < n; i++) pts.push(spawn(seconds * 60 + 200, Math.random() * W, -30 - Math.random() * H * 0.8))
    },
    setTilt(x) {
      tilt = Math.max(-1, Math.min(1, x))
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    },
  }
}
