/**
 * Ornamen Bali orisinal (SVG, digambar dari rumus — bukan aset pihak lain).
 * Gaya: aksen halus berwarna paras putih, prada redup, janur muda, kuning jepun.
 * Aturan desain: maksimal SATU ornamen per section.
 */
import { memo, useId, type CSSProperties, type SVGProps } from 'react'
import { candiBentarHalf, jepunPetal, penjorPath } from './geometry'

type SvgProps = SVGProps<SVGSVGElement> & { className?: string; style?: CSSProperties }

const CANDI = candiBentarHalf()
const PENJOR = penjorPath()
const PETAL = jepunPetal()
const uidOf = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '')

/* ------------------------------------------------------------------ */
/* Candi bentar — batu paras putih (setengah sisi)                     */
/* ------------------------------------------------------------------ */
export const CandiParas = memo(function CandiParas({ side = 'left', ...p }: SvgProps & { side?: 'left' | 'right' }) {
  const u = uidOf(useId())
  const { W, H, d, ledges, panels, flames, bricks } = CANDI
  const flip = side === 'right' ? `translate(${W} 0) scale(-1 1)` : undefined
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMax meet" aria-hidden="true" {...p}>
      <defs>
        <linearGradient id={`s${u}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#f7f3ec" />
          <stop offset=".6" stopColor="#ece4d7" />
          <stop offset="1" stopColor="#d9cdb9" />
        </linearGradient>
        {/* bayangan lembut di sisi belahan (kedalaman) */}
        <linearGradient id={`sh${u}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#8c7a62" stopOpacity=".16" />
          <stop offset=".07" stopColor="#8c7a62" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`fg${u}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fbf8f2" stopOpacity=".9" />
          <stop offset=".35" stopColor="#fbf8f2" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`c${u}`}>
          <path d={d} />
        </clipPath>
      </defs>
      <g transform={flip}>
        <path d={d} fill={`url(#s${u})`} />
        <g clipPath={`url(#c${u})`}>
          <path d={bricks} stroke="#b9ab94" strokeOpacity=".28" strokeWidth=".8" fill="none" />
          <rect width={W} height={H} fill={`url(#sh${u})`} />
          <rect width={W} height={H} fill={`url(#fg${u})`} />
        </g>
        <path d={ledges} stroke="#c9bba3" strokeWidth="1.2" fill="none" />
        {panels.map((pn, i) => (
          <rect key={i} x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx="2" fill="#e2d8c7" opacity=".55" />
        ))}
        <path d={flames} fill="#d6c08f" opacity=".75" />
      </g>
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Bunga jepun putih-kuning                                            */
/* ------------------------------------------------------------------ */
export const Jepun = memo(function Jepun(p: SvgProps) {
  const u = uidOf(useId())
  return (
    <svg viewBox="-60 -60 120 120" aria-hidden="true" {...p}>
      <defs>
        <radialGradient id={`j${u}`} cx="0" cy="0" r="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2c94c" />
          <stop offset=".3" stopColor="#f8e3a0" />
          <stop offset=".58" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#fbf6ec" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={PETAL} transform={`rotate(${a}) skewX(-8)`} fill={`url(#j${u})`} stroke="#e8dcc6" strokeWidth=".8" />
      ))}
      <circle r="3.6" fill="#e9b93a" />
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Penjor — garis aksen vertikal melengkung                            */
/* ------------------------------------------------------------------ */
export const Penjor = memo(function Penjor(p: SvgProps) {
  return (
    <svg viewBox="0 0 120 600" fill="none" aria-hidden="true" {...p}>
      <path d={PENJOR.pole} stroke="#b8975a" strokeWidth="1.6" strokeLinecap="round" />
      <path d={PENJOR.tassels} stroke="#a7b07a" strokeWidth="1.1" strokeLinecap="round" />
      <path d={PENJOR.sampian} stroke="#a7b07a" strokeWidth="1.1" fill="#a7b07a" fillOpacity=".12" />
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Tedung (payung upacara) putih-kuning                                */
/* ------------------------------------------------------------------ */
export const Tedung = memo(function Tedung(p: SvgProps) {
  // kanopi kubah + rumbai berlekuk + tiang panjang
  const fringe = Array.from({ length: 12 }, (_, i) => {
    const x = 8 + i * 8.67
    return `M${x.toFixed(1)} 44 q4.3 9 8.67 0`
  }).join(' ')
  return (
    <svg viewBox="0 0 120 400" fill="none" aria-hidden="true" {...p}>
      <path d="M60 6 C26 8 8 26 8 44 H112 C112 26 94 8 60 6Z" fill="#fffdf8" stroke="#d6c08f" strokeWidth="1.2" />
      <path d="M8 44 H112" stroke="#f2c94c" strokeWidth="3" />
      <path d={fringe} stroke="#f2c94c" strokeWidth="1.4" fill="#f8e3a0" fillOpacity=".5" />
      <path d="M60 0 V6 M60 44 V400" stroke="#b8975a" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="60" cy="2" r="2.5" fill="#b8975a" />
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Canang sari (tampak atas)                                           */
/* ------------------------------------------------------------------ */
export const Canang = memo(function Canang(p: SvgProps) {
  const scallop = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2
    const r = 46
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`
  })
  return (
    <svg viewBox="-60 -60 120 120" aria-hidden="true" {...p}>
      <rect x="-38" y="-38" width="76" height="76" rx="6" transform="rotate(45)" fill="#eef0dc" stroke="#a7b07a" strokeWidth="1.4" />
      <polygon points={scallop.join(' ')} fill="none" stroke="#a7b07a" strokeWidth=".8" strokeDasharray="3 4" opacity=".8" />
      {/* empat penjuru: bunga putih, kuning, krem, hijau janur (palet lembut) */}
      {[
        [0, -22, '#ffffff'],
        [22, 0, '#f2c94c'],
        [0, 22, '#f3ebdd'],
        [-22, 0, '#c9d29b'],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-6" rx="4" ry="6.5" transform={`rotate(${a})`} fill={c as string} stroke="#d9cdb9" strokeWidth=".5" />
          ))}
        </g>
      ))}
      <g transform="scale(.36)">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={PETAL} transform={`rotate(${a}) skewX(-8)`} fill="#fffdf7" stroke="#e8dcc6" strokeWidth="1.5" />
        ))}
        <circle r="6" fill="#f2c94c" />
      </g>
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Lamak — pemisah section (anyaman janur)                             */
/* ------------------------------------------------------------------ */
export function Lamak({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 40" className={className} fill="none" aria-hidden="true">
      <path d="M0 8 H160" stroke="#a7b07a" strokeWidth="1" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 8 + i * 18
        return (
          <g key={i} stroke="#a7b07a" strokeWidth="1">
            <path d={`M${x} 8 L${x + 9} 22 L${x + 18} 8`} />
            {i % 2 === 0 && <path d={`M${x + 9} 22 V30`} />}
          </g>
        )
      })}
      <circle cx="80" cy="34" r="2.2" fill="#f2c94c" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Janur — garis vertikal halus                                        */
/* ------------------------------------------------------------------ */
export function JanurLine({ length = 400, className = '', style }: { length?: number; className?: string; style?: CSSProperties }) {
  let d = `M0 0 V${length}`
  for (let y = 14; y < length - 10; y += 28) d += ` M0 ${y - 6} L7 ${y} L0 ${y + 6} M0 ${y + 8} L-6 ${y + 14} L0 ${y + 20}`
  return (
    <svg viewBox={`-10 0 20 ${length}`} preserveAspectRatio="none" className={className} style={style} fill="none" aria-hidden="true">
      <path d={d} stroke="#a7b07a" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Sawah terasering berkabut (latar landscape, berlapis untuk parallax) */
/* ------------------------------------------------------------------ */
function terrace(y0: number, amp: number, n: number, seed: number) {
  let d = ''
  for (let k = 0; k < n; k++) {
    const y = y0 + k * 9
    const a = amp * (1 - k * 0.05)
    d += `M-20 ${y} C 120 ${y - a + Math.sin(seed + k) * 4} 260 ${y + a} 420 ${y - a * 0.4} S 700 ${y + a * 0.6} 820 ${y} `
  }
  return d
}
export function SawahLayer({ layer, className = '', style }: { layer: 'far' | 'mid' | 'near'; className?: string; style?: CSSProperties }) {
  const cfg = {
    far: { fill: '#e9e3c9', line: '#d3d1a8', y: 40, amp: 16, n: 6, top: 'M-20 60 C 160 20 300 70 420 40 S 700 20 820 50 V200 H-20Z' },
    mid: { fill: '#dfe0bd', line: '#c3c891', y: 70, amp: 22, n: 8, top: 'M-20 90 C 140 50 320 110 460 70 S 720 60 820 90 V200 H-20Z' },
    near: { fill: '#d3d8a6', line: '#b0b977', y: 110, amp: 26, n: 8, top: 'M-20 120 C 180 80 300 140 480 105 S 720 100 820 125 V200 H-20Z' },
  }[layer]
  return (
    <svg viewBox="0 0 800 200" preserveAspectRatio="xMidYMax slice" className={className} style={style} aria-hidden="true">
      <path d={cfg.top} fill={cfg.fill} />
      <path d={terrace(cfg.y, cfg.amp, cfg.n, layer.length)} stroke={cfg.line} strokeWidth="1" fill="none" opacity=".7" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Ikon navigasi (garis tipis)                                         */
/* ------------------------------------------------------------------ */
const ico = (d: string) =>
  function Icon(p: SvgProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <path d={d} />
      </svg>
    )
  }
export const NavIcons: Record<string, (p: SvgProps) => React.ReactElement> = {
  opening: ico('M12 3 C9 7 9 10 12 12 C15 10 15 7 12 3Z M12 12 V21 M7 21 H17'),
  groom: ico('M12 12 a4 4 0 1 0 0-8 a4 4 0 1 0 0 8 M5 21 c0-4 3-6 7-6 s7 2 7 6'),
  bride: ico('M12 12 a4 4 0 1 0 0-8 a4 4 0 1 0 0 8 M5 21 c1-5 3-6 7-6 s6 1 7 6 M9 4 q3-2 6 0'),
  couple: ico('M9 12 a5 5 0 1 0 0.01 0 M15 12 a5 5 0 1 0 0.01 0'),
  story: ico('M4 19 C8 13 10 15 12 10 S17 6 20 5'),
  events: ico('M4 21 V9 L8 9 L8 5 L12 3 L16 5 L16 9 L20 9 V21 M10 21 V15 H14 V21'),
  gallery: ico('M5 20 V10 C5 6 8 3 12 3 C16 3 19 6 19 10 V20 Z M5 17 L10 12 L14 16 L16 14 L19 17'),
  gift: ico('M3 7 H21 V19 H3 Z M3 10 L12 15 L21 10'),
  rsvp: ico('M4 5 H20 V16 H10 L6 20 V16 H4 Z'),
  closing: ico('M12 21 C12 21 4 15 4 9 a4 4 0 0 1 8-1 a4 4 0 0 1 8 1 c0 6-8 12-8 12Z'),
}
