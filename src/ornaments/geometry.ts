/**
 * Generator path SVG prosedural untuk ornamen Bali orisinal.
 * Semua bentuk dihitung dari rumus (spiral, kurva) — bukan jiplakan aset siapa pun.
 */

type Pt = [number, number]
const f = (n: number) => Math.round(n * 100) / 100

function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return ''
  let d = `M${f(pts[0]![0])} ${f(pts[0]![1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i]!
    const [nx, ny] = pts[i + 1]!
    d += ` Q${f(x)} ${f(y)} ${f((x + nx) / 2)} ${f((y + ny) / 2)}`
  }
  const last = pts[pts.length - 1]!
  d += ` L${f(last[0])} ${f(last[1])}`
  return d
}

/** Spiral logaritmik dari luar ke dalam (inti "punggel"). */
export function spiral(cx: number, cy: number, r0: number, turns: number, startAngle: number, dir = 1, steps = 48): Pt[] {
  const pts: Pt[] = []
  const total = turns * Math.PI * 2
  const k = Math.log(r0 / (r0 * 0.12)) / total
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * total
    const r = r0 * Math.exp(-k * t)
    const a = startAngle + dir * t
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  return pts
}

/** Daun runcing (lobus) dari titik base ke arah sudut tertentu. */
function lobe(x: number, y: number, angle: number, len: number, width: number, curl = 0.35): string {
  const tx = x + Math.cos(angle) * len
  const ty = y + Math.sin(angle) * len
  const nx = Math.cos(angle + Math.PI / 2) * width
  const ny = Math.sin(angle + Math.PI / 2) * width
  const mx = x + Math.cos(angle) * len * 0.55
  const my = y + Math.sin(angle) * len * 0.55
  // ujung sedikit melengkung (khas patra)
  const cx2 = tx + Math.cos(angle + Math.PI / 2) * len * curl
  const cy2 = ty + Math.sin(angle + Math.PI / 2) * len * curl
  return `M${f(x)} ${f(y)} Q${f(mx + nx)} ${f(my + ny)} ${f(cx2)} ${f(cy2)} Q${f(mx - nx * 0.4)} ${f(my - ny * 0.4)} ${f(x)} ${f(y)}Z`
}

/**
 * Patra punggel: sulur melingkar dengan lobus runcing di sisi luar.
 * Mengembalikan { curl, lobes } dalam viewBox 0 0 100 100.
 */
export function patraPunggel(): { curl: string; inner: string; lobes: string } {
  const sp = spiral(50, 52, 34, 1.35, Math.PI * 0.95, 1, 60)
  // ekor sulur keluar ke kiri bawah
  const tail: Pt[] = [
    [4, 96],
    [10, 84],
    [18, 74],
  ]
  const curl = smoothPath([...tail, ...sp])
  const inner = smoothPath(spiral(50, 52, 22, 1.1, Math.PI * 1.05, 1, 40))
  const lobes: string[] = []
  // lobus di sepanjang sisi luar spiral (indeks awal = bagian terluar)
  const idx = [6, 13, 20, 27, 34]
  idx.forEach((i, n) => {
    const p = sp[i]!
    const q = sp[i + 1]!
    const tangent = Math.atan2(q[1] - p[1], q[0] - p[0])
    const outward = tangent - Math.PI / 2
    lobes.push(lobe(p[0], p[1], outward + 0.55, 15 - n * 1.8, 4.2 - n * 0.4))
  })
  // bunga kecil di ekor
  lobes.push(lobe(12, 82, Math.PI * 1.15, 12, 3.5))
  lobes.push(lobe(12, 82, Math.PI * 0.75, 10, 3))
  return { curl, inner, lobes: lobes.join(' ') }
}

/** Kelopak bunga jepun (frangipani) — bentuk tetes asimetris, berpusat di (0,0) menunjuk ke atas. */
export function jepunPetal(len = 46, width = 22): string {
  const w = width
  const l = len
  return `M0 0 C${f(-w * 0.55)} ${f(-l * 0.25)} ${f(-w * 0.95)} ${f(-l * 0.72)} ${f(-w * 0.35)} ${f(-l * 0.98)} C${f(w * 0.2)} ${f(-l * 1.12)} ${f(w * 0.95)} ${f(-l * 0.9)} ${f(w * 0.62)} ${f(-l * 0.5)} C${f(w * 0.4)} ${f(-l * 0.22)} ${f(w * 0.12)} ${f(-l * 0.06)} 0 0Z`
}

export interface Tier {
  y: number
  h: number
  /** batas kiri (sisi luar) tier; sisi kanan selalu = W (garis belah) */
  x: number
}

/**
 * Siluet setengah candi bentar (sisi kiri). Garis belah tegak lurus di x = W.
 * viewBox 0 0 W H, W=220, H=600.
 */
export function candiBentarHalf() {
  const W = 220
  const H = 600
  // dari bawah ke atas
  const base = { y: 520, h: 80, x: 6 } // bebaturan / undag
  const body = { y: 340, h: 180, x: 34 } // pengawak
  const tiers: Tier[] = []
  let y = 340
  let x = 18
  const heights = [34, 30, 27, 24, 21, 18, 15]
  heights.forEach((h, i) => {
    // pelipit (lis menonjol) lalu badan tier yang lebih sempit
    tiers.push({ y: y - 6, h: 6, x: x - 6 })
    tiers.push({ y: y - 6 - h, h, x: x + 4 })
    y -= 6 + h
    x += 14 + i * 3
  })
  const top = y
  // puncak (murdha) — bentuk tetes di garis belah
  const crownX = x + 6

  // siluet: mulai kanan bawah, ke kiri bawah, naik bertingkat, ke puncak, turun di garis belah
  let d = `M${W} ${H} L${base.x} ${H} L${base.x} ${base.y + 26} L${base.x + 10} ${base.y + 26} L${base.x + 10} ${base.y} L${body.x - 8} ${base.y} L${body.x - 8} ${body.y + body.h - 14} L${body.x} ${body.y + body.h - 14} L${body.x} ${body.y + 22} L${body.x - 10} ${body.y + 22} L${body.x - 10} ${body.y}`
  tiers.forEach((t) => {
    d += ` L${t.x} ${t.y + t.h} L${t.x} ${t.y}`
  })
  d += ` L${crownX} ${top} C${crownX + 4} ${top - 22} ${W - 24} ${top - 40} ${W} ${top - 70} Z`

  // garis emas horizontal (lis)
  const ledges: string[] = []
  ledges.push(`M${base.x + 10} ${base.y} H${W}`)
  ledges.push(`M${base.x} ${base.y + 26} H${W}`)
  ledges.push(`M${body.x - 10} ${body.y + 22} H${W}`)
  ledges.push(`M${body.x} ${body.y + body.h - 14} H${W}`)
  tiers.forEach((t, i) => {
    if (i % 2 === 0) {
      ledges.push(`M${t.x} ${t.y} H${W}`)
      ledges.push(`M${t.x} ${t.y + t.h} H${W}`)
    }
  })

  // panel ukiran di badan
  const panels = [
    { x: body.x + 14, y: body.y + 40, w: W - body.x - 34, h: 104 },
  ]

  // karang/ancak di sudut luar tiap tier (ornamen api melengkung)
  const flames: string[] = []
  tiers.forEach((t, i) => {
    if (i % 2 === 1) {
      const fx = t.x
      const fy = t.y
      const s = 1 - i * 0.05
      flames.push(
        `M${fx} ${fy} c${f(-8 * s)} ${f(-3 * s)} ${f(-12 * s)} ${f(-12 * s)} ${f(-6 * s)} ${f(-20 * s)} c${f(-1 * s)} ${f(6 * s)} ${f(3 * s)} ${f(9 * s)} ${f(7 * s)} ${f(9 * s)} c${f(-2 * s)} ${f(-6 * s)} ${f(1 * s)} ${f(-11 * s)} ${f(6 * s)} ${f(-14 * s)} c${f(-2 * s)} ${f(7 * s)} ${f(2 * s)} ${f(14 * s)} ${f(-1 * s)} ${f(25 * s)} z`,
      )
    }
  })
  // karang di sudut badan & dasar
  flames.push(`M${body.x - 10} ${body.y} c-10 -4 -15 -15 -8 -26 c-1 8 4 12 9 12 c-3 -8 1 -14 8 -18 c-3 9 3 18 -1 32 z`)

  // bata: garis halus horizontal tiap 14px di badan
  const bricks: string[] = []
  for (let by = body.y + 30; by < body.y + body.h - 14; by += 14) {
    bricks.push(`M${body.x} ${by} H${W}`)
    const off = ((by / 14) % 2) * 18
    for (let bx = body.x + 10 + off; bx < W; bx += 36) bricks.push(`M${bx} ${by} V${by + 14}`)
  }

  return { W, H, d, ledges: ledges.join(' '), panels, flames: flames.join(' '), bricks: bricks.join(' '), top, crownX }
}

/** Penjor: tiang bambu melengkung dengan sampian di ujung. viewBox 0 0 120 600, pangkal di kanan bawah. */
export function penjorPath() {
  const pole = 'M100 600 C104 420 102 260 90 160 C78 70 50 26 18 30'
  // ornamen gantung di sepanjang tiang
  const tassels: string[] = []
  const pts: Pt[] = [
    [100, 520],
    [101, 440],
    [100, 360],
    [97, 285],
    [92, 215],
    [84, 150],
    [70, 95],
    [52, 58],
  ]
  pts.forEach(([x, y], i) => {
    const l = 16 + (i % 2) * 8
    tassels.push(`M${x} ${y} q-8 ${l * 0.5} -3 ${l} q4 -${l * 0.35} 3 -${l}`)
    tassels.push(`M${x} ${y} q8 ${l * 0.45} 4 ${l * 0.9}`)
  })
  // sampian penjor (ujung menggantung)
  const sampian =
    'M18 30 C14 46 10 62 14 84 C18 106 26 120 22 140 M18 30 C26 48 30 70 26 92 C22 112 30 126 28 146 M14 84 C6 94 6 110 14 118 C22 110 22 96 14 84Z M22 140 c-8 4 -10 16 -2 22 c8 -6 8 -18 2 -22z'
  return { pole, tassels: tassels.join(' '), sampian }
}

/** Untaian janur (garis waktu): garis dengan potongan segitiga berulang. */
export function janurStrip(length: number, step = 22, h = 9): string {
  let d = `M0 0 H${length}`
  for (let x = step / 2; x < length; x += step) {
    d += ` M${f(x - 6)} 0 L${f(x)} ${h} L${f(x + 6)} 0`
    d += ` M${f(x - 4)} 0 L${f(x)} ${-h * 0.6} L${f(x + 4)} 0`
  }
  return d
}
