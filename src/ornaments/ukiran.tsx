/**
 * Ukiran Bali emas (garis tipis prada di atas latar gelap) — semua SVG orisinal & prosedural.
 *  • Patra punggel: sulur melingkar dengan lobus runcing (motif dasar ukiran Bali)
 *  • Karang simbar: daun/lidah api berpasangan
 *  • Patra sari / padma: bunga di tengah
 * Komponen: UkiranCorner (sudut bingkai), UkiranBand (pembatas), UkiranTiang (tiang ukir vertikal),
 *           Kori (lambang candi kecil), Padma.
 */
import { memo, useId, type CSSProperties } from 'react'
const uidOf = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '')
const f = (n: number) => Math.round(n * 100) / 100

/** gradien emas metalik (userSpace agar garis lurus pun tetap bergradasi) */
function Gold({ id, x1 = 0, y1 = 0, x2 = 200, y2 = 200 }: { id: string; x1?: number; y1?: number; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
      <stop offset="0" stopColor="#a8823d" />
      <stop offset=".35" stopColor="#f0dca6" />
      <stop offset=".55" stopColor="#c9a55c" />
      <stop offset=".8" stopColor="#ecd296" />
      <stop offset="1" stopColor="#a8823d" />
    </linearGradient>
  )
}

/** gradien emas per bidang (mengikuti kotak tiap bentuk) → kesan logam timbul */
function GoldBox({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f6e7bd" />
      <stop offset=".45" stopColor="#d9b56c" />
      <stop offset="1" stopColor="#8f6a2c" />
    </linearGradient>
  )
}

/** lidah api / daun simbar (menunjuk ke atas dari 0,0) */
function flame(h: number, w: number, lean = 0.25) {
  return `M0 0 C${f(-w)} ${f(-h * 0.3)} ${f(-w * 0.6)} ${f(-h * 0.75)} ${f(w * lean)} ${f(-h)} C${f(w * 0.2)} ${f(-h * 0.7)} ${f(w * 0.9)} ${f(-h * 0.35)} 0 0Z`
}

type Pt = [number, number]
/**
 * Punggel "relief": pita sulur yang menebal di pangkal dan menipis ke pusat spiral,
 * dengan lobus runcing (seperti lidah api) di sisi luar yang melengkung ke belakang.
 * Diisi emas + garis pahatan gelap di tengah → terlihat seperti ukiran timbul.
 * Pusat spiral di (0,0); ekor masuk dari arah `tailAngle`.
 */
function punggelRelief({ R = 40, W = 7, turns = 1.25, dir = 1, start = 0, lobes = 6, tail = 1.1, reach = 0.9 }: { R?: number; W?: number; turns?: number; dir?: 1 | -1; start?: number; lobes?: number; tail?: number; reach?: number }) {
  const N = 90
  const total = turns * Math.PI * 2
  const k = Math.log(1 / 0.13) / total
  const center: Pt[] = []
  const widths: number[] = []
  // ekor: busur lebar yang menyambung ke spiral (dari luar)
  const tailN = 24
  for (let i = 0; i < tailN; i++) {
    const t = i / tailN
    const a = start - dir * tail * (1 - t)
    const r = R * (1 + reach * (1 - t) ** 1.4)
    center.push([Math.cos(a) * r, Math.sin(a) * r])
    // pangkal runcing → menebal → menyatu dengan spiral
    widths.push(W * (0.12 + 1.08 * Math.sin((Math.PI / 2) * Math.min(1, t * 1.6))))
  }
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const a = start + dir * t * total
    const r = R * Math.exp(-k * t * total)
    center.push([Math.cos(a) * r, Math.sin(a) * r])
    widths.push(W * (1 - 0.82 * t))
  }
  const L: Pt[] = []
  const Rr: Pt[] = []
  const nrm: Pt[] = []
  for (let i = 0; i < center.length; i++) {
    const p = center[i]!
    const q = center[Math.min(center.length - 1, i + 1)]!
    const o = center[Math.max(0, i - 1)]!
    let tx = q[0] - o[0]
    let ty = q[1] - o[1]
    const tl = Math.hypot(tx, ty) || 1
    tx /= tl
    ty /= tl
    const nx = -ty
    const ny = tx
    nrm.push([nx, ny])
    const w = widths[i]! / 2
    L.push([p[0] + nx * w, p[1] + ny * w])
    Rr.push([p[0] - nx * w, p[1] - ny * w])
  }
  const poly = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join(' ')
  const ribbon = `${poly([...L, ...Rr.reverse()])}Z`
  const line = poly(center.slice(4, center.length - 6))
  // sisi luar = sisi yang menjauhi pusat spiral
  const out: string[] = []
  const veins: string[] = []
  const first = Math.round(tailN * 0.55)
  for (let j = 0; j < lobes; j++) {
    const i = Math.round(first + (j / lobes) * (N * 0.7))
    const p = center[i]!
    const [nx, ny] = nrm[i]!
    const sgn = nx * p[0] + ny * p[1] > 0 ? 1 : -1 // arah normal yang menjauhi pusat
    const w = widths[i]! / 2
    const bx = p[0] + nx * w * sgn
    const by = p[1] + ny * w * sgn
    const q = center[i + 1]!
    const tl = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1
    const tx = (q[0] - p[0]) / tl
    const ty = (q[1] - p[1]) / tl
    const len = W * (3.3 - j * 0.3)
    // ujung lobus: keluar + condong ke belakang (melawan arah aliran) → kesan api melengkung
    const ex = bx + (nx * sgn * 0.9 - tx * 0.75) * len
    const ey = by + (ny * sgn * 0.9 - ty * 0.75) * len
    const c1x = bx + (nx * sgn * 0.75 + tx * 0.45) * len
    const c1y = by + (ny * sgn * 0.75 + ty * 0.45) * len
    const back = len * 0.5
    const b2x = bx - tx * back
    const b2y = by - ty * back
    out.push(`M${f(bx + tx * len * 0.3)} ${f(by + ty * len * 0.3)} Q${f(c1x)} ${f(c1y)} ${f(ex)} ${f(ey)} Q${f((ex + b2x) / 2 + nx * sgn * len * 0.12)} ${f((ey + b2y) / 2 + ny * sgn * len * 0.12)} ${f(b2x)} ${f(b2y)}Z`)
    // pahatan di tengah lobus
    veins.push(`M${f(bx)} ${f(by)} Q${f(bx + (nx * sgn * 0.7) * len * 0.6)} ${f(by + (ny * sgn * 0.7) * len * 0.6)} ${f(ex * 0.75 + bx * 0.25)} ${f(ey * 0.75 + by * 0.25)}`)
  }
  // biji (batun timun) di mata spiral
  const eye = center[center.length - 1]!
  const seed = `M${f(eye[0])} ${f(eye[1] - W * 0.55)} C${f(eye[0] + W * 0.5)} ${f(eye[1] - W * 0.2)} ${f(eye[0] + W * 0.3)} ${f(eye[1] + W * 0.5)} ${f(eye[0])} ${f(eye[1] + W * 0.55)} C${f(eye[0] - W * 0.3)} ${f(eye[1] + W * 0.5)} ${f(eye[0] - W * 0.5)} ${f(eye[1] - W * 0.2)} ${f(eye[0])} ${f(eye[1] - W * 0.55)}Z`
  return { ribbon, line, lobes: out.join(' '), veins: veins.join(' '), seed }
}

/** render punggel relief di posisi/rotasi/skala tertentu */
/** geometri punggel hanya dihitung sekali per kombinasi parameter (dipakai berulang di tiang/sudut) */
const reliefCache = new Map<string, ReturnType<typeof punggelRelief>>()
function relief(o: Parameters<typeof punggelRelief>[0]) {
  const key = JSON.stringify(o)
  let r = reliefCache.get(key)
  if (!r) reliefCache.set(key, (r = punggelRelief(o)))
  return r
}

function Relief({ t, g, cut = '#120d09', ...o }: { t: string; g: string; cut?: string } & Parameters<typeof punggelRelief>[0]) {
  const r = relief(o)
  return (
    <g transform={t}>
      <path d={r.lobes} fill={g} />
      <path d={r.veins} fill="none" stroke={cut} strokeOpacity=".45" strokeWidth={(o.W ?? 7) * 0.12} strokeLinecap="round" />
      <path d={r.ribbon} fill={g} />
      <path d={r.line} fill="none" stroke={cut} strokeOpacity=".55" strokeWidth={(o.W ?? 7) * 0.16} strokeLinecap="round" />
      <path d={r.seed} fill={g} />
    </g>
  )
}

/** kuntum bunga (jepun 5 kelopak) bergaris emas */
function Bloom({ x, y, r, g }: { x: number; y: number; r: number; g: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={`M0 0 C${f(-r * 0.5)} ${f(-r * 0.35)} ${f(-r * 0.45)} ${f(-r)} 0 ${f(-r)} C${f(r * 0.45)} ${f(-r)} ${f(r * 0.5)} ${f(-r * 0.35)} 0 0Z`} transform={`rotate(${a})`} fill="none" stroke={g} strokeWidth=".9" />
      ))}
      <circle r={r * 0.16} fill={g} />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Sudut bingkai                                                       */
/* ------------------------------------------------------------------ */
export const UkiranCorner = memo(function UkiranCorner({ className = '', style, flip = '' }: { className?: string; style?: CSSProperties; flip?: '' | 'x' | 'y' | 'xy' }) {
  const u = uidOf(useId())
  const g = `url(#g${u})`
  const gl = `url(#l${u})`
  const tf = flip === 'x' ? 'translate(220 0) scale(-1 1)' : flip === 'y' ? 'translate(0 220) scale(1 -1)' : flip === 'xy' ? 'translate(220 220) scale(-1 -1)' : undefined
  // satu sisi: tangkai dari bunga pojok menyusuri tepi atas → gulungan sulur; sisi lain = cermin diagonal
  const half = (
    <>
      <Relief t="translate(122 46)" g={g} R={22} W={7.5} dir={1} start={Math.PI + 1.25} tail={1.25} reach={2.6} lobes={7} />
      <Relief t="translate(188 26) scale(-.5 .5)" g={g} R={22} W={7.5} dir={1} start={Math.PI + 1.25} tail={1.25} reach={2.2} lobes={5} turns={1.1} />
    </>
  )
  return (
    <svg viewBox="0 0 220 220" className={className} style={style} aria-hidden="true">
      <defs>
        <GoldBox id={`g${u}`} />
        <Gold id={`l${u}`} x2={220} y2={220} />
      </defs>
      <g transform={tf}>
        {/* garis bingkai ganda */}
        <path d="M220 4 H4 V220" fill="none" stroke={gl} strokeWidth="1.3" />
        <path d="M220 10 H10 V220" fill="none" stroke={gl} strokeWidth=".6" opacity=".55" />
        <g transform="translate(17 17) scale(.86)">
          {half}
          <g transform="matrix(0 1 1 0 0 0)">{half}</g>
          <Bloom x={30} y={30} r={15} g={gl} />
          <circle cx="30" cy="30" r="21" fill="none" stroke={gl} strokeWidth=".8" opacity=".6" />
        </g>
      </g>
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Pembatas horizontal: bunga di tengah, sulur punggel ke dua sisi      */
/* ------------------------------------------------------------------ */
export const UkiranBand = memo(function UkiranBand({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const u = uidOf(useId())
  const g = `url(#g${u})`
  const gl = `url(#l${u})`
  const side = (flip: boolean) => (
    <g transform={flip ? 'translate(400 0) scale(-1 1)' : undefined}>
      <Relief t="translate(150 30)" g={g} R={13} W={5.4} dir={-1} start={-1.15} tail={1.3} reach={3.1} lobes={6} />
      <Relief t="translate(118 44) scale(-.6 -.6)" g={g} R={13} W={5.4} dir={-1} start={-1.15} tail={1.3} reach={3.1} lobes={5} />
      <path d="M128 40 C110 50 92 44 4 42" fill="none" stroke={gl} strokeWidth=".9" strokeLinecap="round" />
      <path d="M70 40 l5 2.2 l-5 2.2 l-5 -2.2Z M40 39.8 l3.4 1.6 l-3.4 1.6 l-3.4 -1.6Z" fill={gl} />
    </g>
  )
  return (
    <svg viewBox="0 -10 400 84" className={className} style={style} aria-hidden="true">
      <defs>
        <GoldBox id={`g${u}`} />
        <Gold id={`l${u}`} x2={400} y2={76} />
      </defs>
      {side(false)}
      {side(true)}
      <path d={flame(30, 8, 0)} transform="translate(200 36)" fill={g} />
      <Bloom x={200} y={46} r={12} g={gl} />
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Tiang ukir vertikal (sisi kiri/kanan cover)                          */
/* ------------------------------------------------------------------ */
export const UkiranTiang = memo(function UkiranTiang({ className = '', style, side = 'left' }: { className?: string; style?: CSSProperties; side?: 'left' | 'right' }) {
  const u = uidOf(useId())
  const g = `url(#g${u})`
  const gl = `url(#l${u})`
  const N = 8
  const step = 150
  const H = N * step
  // satu unit: sepasang tangkai tumbuh dari bawah-tengah, bergulung ke kiri & kanan,
  // lidah api di tengah, bunga di pangkal → ditumpuk vertikal seperti tiang ukir
  const unit = (
    <>
      <Relief t="translate(33 66)" g={g} R={16} W={6.2} dir={-1} start={-0.1} tail={1.35} reach={4} lobes={6} />
      <Relief t="translate(87 66) scale(-1 1)" g={g} R={16} W={6.2} dir={-1} start={-0.1} tail={1.35} reach={4} lobes={6} />
      <path d={flame(46, 9, 0)} transform="translate(60 120)" fill={g} />
      <path d="M60 116 V80" stroke="#120d09" strokeOpacity=".5" strokeWidth="1.2" />
      <Bloom x={60} y={146} r={8} g={gl} />
    </>
  )
  return (
    <svg viewBox={`0 0 120 ${H}`} preserveAspectRatio="xMidYMid slice" className={className} style={style} aria-hidden="true">
      <defs>
        <GoldBox id={`g${u}`} />
        <Gold id={`l${u}`} x1={0} y1={0} x2={120} y2={240} />
      </defs>
      <g transform={side === 'right' ? 'translate(120 0) scale(-1 1)' : undefined}>
        <path d={`M4 0 V${H} M116 0 V${H}`} stroke={gl} strokeWidth="1.1" />
        <path d={`M10 0 V${H} M110 0 V${H}`} stroke={gl} strokeWidth=".5" opacity=".5" />
        {Array.from({ length: N }, (_, i) => (
          <g key={i} transform={`translate(0 ${i * step})`}>
            {unit}
          </g>
        ))}
      </g>
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Lambang kecil: kori/candi bergaris emas                              */
/* ------------------------------------------------------------------ */
export const Kori = memo(function Kori({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const u = uidOf(useId())
  const g = `url(#g${u})`
  const cut = '#120d09'
  const tiers = [0, 1, 2, 3, 4, 5]
  return (
    <svg viewBox="0 0 120 156" className={className} style={style} aria-hidden="true">
      <defs>
        <GoldBox id={`g${u}`} />
      </defs>
      {/* kaki bertingkat & badan dengan pintu */}
      <path d="M12 154 H108 V146 H100 V138 H20 V146 H12Z" fill={g} />
      <path d="M28 138 V98 H92 V138Z M50 138 V114 C50 106 55 102 60 102 C65 102 70 106 70 114 V138Z" fill={g} fillRule="evenodd" />
      <path d="M32 104 H88 M32 132 H48 M72 132 H88" stroke={cut} strokeOpacity=".5" strokeWidth="1" />
      {/* tingkat atap + simbar */}
      {tiers.map((i) => {
        const y = 98 - i * 11.5
        const w = 40 - i * 5.4
        return (
          <g key={i}>
            <path d={`M${f(60 - w)} ${y} H${f(60 + w)} L${f(60 + w - 4)} ${y - 8} H${f(60 - w + 4)} Z`} fill={g} />
            <path d={`M${f(60 - w + 5)} ${y - 4} H${f(60 + w - 5)}`} stroke={cut} strokeOpacity=".5" strokeWidth=".9" strokeDasharray="1.5 2.5" />
            <path d={flame(11, 3, 0.4)} transform={`translate(${f(60 - w + 1)} ${y - 1}) rotate(-34)`} fill={g} />
            <path d={flame(11, 3, 0.4)} transform={`translate(${f(60 + w - 1)} ${y - 1}) rotate(34) scale(-1 1)`} fill={g} />
          </g>
        )
      })}
      <path d="M60 30 C54 21 56 12 60 3 C64 12 66 21 60 30Z" fill={g} />
      <path d="M60 26 V12" stroke={cut} strokeOpacity=".5" strokeWidth="1" />
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Padma (teratai) — lambang kesucian, bergaris emas                    */
/* ------------------------------------------------------------------ */
export function ReliefTest() {
  const g = 'url(#gt)'
  return (
    <svg viewBox="-120 -120 480 240" className="w-[960px]">
      <defs><GoldBox id="gt" /></defs>
      <Relief t="" g={g} />
      <Relief t="translate(160 0)" g={g} R={50} W={10} lobes={7} />
      <Relief t="translate(300 0) scale(-1 1)" g={g} R={36} W={6} turns={1.5} start={1.5} />
    </svg>
  )
}

export const Padma = memo(function Padma({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const u = uidOf(useId())
  const g = `url(#g${u})`
  const petal = (a: number, l: number, w: number, k: string) => (
    <g key={k} transform={`rotate(${a})`}>
      <path d={`M0 0 C${-w} ${f(-l * 0.4)} ${f(-w * 0.6)} ${f(-l * 0.85)} 0 ${-l} C${f(w * 0.6)} ${f(-l * 0.85)} ${w} ${f(-l * 0.4)} 0 0Z`} fill={g} stroke="#120d09" strokeOpacity=".55" strokeWidth=".8" />
      <path d={`M0 -3 V${f(-l * 0.78)}`} stroke="#120d09" strokeOpacity=".45" strokeWidth=".8" />
    </g>
  )
  return (
    <svg viewBox="-60 -56 120 62" className={className} style={style} aria-hidden="true">
      <defs>
        <GoldBox id={`g${u}`} />
      </defs>
      {[-72, 72, -48, 48, -24, 24].map((a) => petal(a, 40 - Math.abs(a) * 0.1, 10, `o${a}`))}
      {petal(0, 50, 11, 'c')}
      <rect x="-46" y="1.3" width="92" height="1.4" fill={g} />
      <rect x="-30" y="4.6" width="60" height=".8" fill={g} opacity=".6" />
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Bingkai: garis emas tipis + 4 sudut ukiran (seperti kartu undangan)  */
/* ------------------------------------------------------------------ */
export function Bingkai({ className = 'inset-3 sm:inset-5', corner = 'w-16 sm:w-24' }: { className?: string; corner?: string }) {
  return (
    <div className={`pointer-events-none absolute z-20 ${className}`} aria-hidden="true">
      <div className="absolute inset-0 border border-emas/25" />
      <UkiranCorner className={`absolute -left-px -top-px ${corner}`} />
      <UkiranCorner flip="x" className={`absolute -right-px -top-px ${corner}`} />
      <UkiranCorner flip="y" className={`absolute -bottom-px -left-px ${corner}`} />
      <UkiranCorner flip="xy" className={`absolute -bottom-px -right-px ${corner}`} />
    </div>
  )
}
