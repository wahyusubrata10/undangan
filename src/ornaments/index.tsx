/**
 * Ornamen Bali orisinal (SVG, digambar dari rumus — bukan aset pihak lain).
 * Gaya: aksen halus berwarna paras putih, prada redup, janur muda, kuning jepun.
 * Aturan desain: maksimal SATU ornamen per section.
 */
import { memo, useId, type CSSProperties, type SVGProps } from 'react'
import { candiBaliParts, candiBentarHalf, jepunPetal, penjorPath } from './geometry'

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
/* Candi bentar gaya Bali: bata merah + ukiran paras + karang           */
/* ------------------------------------------------------------------ */
const BALI = candiBaliParts()
/** warna malam: garis (lis, ukiran) menjadi emas prada, bata & paras gelap diterangi bulan */
const NIGHT_STROKE: Record<string, string> = { '#9b5a43': '#5a3323' }
const NIGHT_FILL: Record<string, string> = { '#cbbda5': '#c9a55c', '#d6c08f': '#e7d09b' }
export const CandiBali = memo(function CandiBali({ side = 'left', ...p }: SvgProps & { side?: 'left' | 'right' }) {
  const u = uidOf(useId())
  const { W, H, parts } = BALI
  const flip = side === 'right' ? `translate(${W} 0) scale(-1 1)` : undefined
  const fillOf = (fl?: string) =>
    fl === 'brick' ? `url(#br${u})` : fl === 'paras' ? `url(#pr${u})` : fl === 'parasDark' ? '#2e2419' : fl === 'shadow' ? `url(#sd${u})` : fl ? (NIGHT_FILL[fl] ?? fl) : 'none'
  const strokeOf = (st?: string) => (st ? (NIGHT_STROKE[st] ?? '#c9a55c') : undefined)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMax meet" aria-hidden="true" {...p}>
      <defs>
        {/* bata merah terakota di malam hari, nat gelap */}
        <pattern id={`br${u}`} width="22" height="10" patternUnits="userSpaceOnUse">
          <rect width="22" height="10" fill="#5a3022" />
          <rect width="22" height="10" fill={`url(#bt${u})`} />
          <path d="M0 9.5 H22 M11 0 V4.5 M0 4.5 H22 M0 4.5 V9.5 M22 4.5 V9.5" stroke="#2a160e" strokeWidth=".9" />
        </pattern>
        <linearGradient id={`bt${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4630" stopOpacity=".55" />
          <stop offset="1" stopColor="#3a1d12" stopOpacity=".4" />
        </linearGradient>
        {/* batu paras: abu-coklat gelap, sisi atas tersentuh cahaya bulan */}
        <linearGradient id={`pr${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b4b39" />
          <stop offset=".55" stopColor="#3b3024" />
          <stop offset="1" stopColor="#261e16" />
        </linearGradient>
        <linearGradient id={`sd${u}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={flip}>
        {parts.map((pt, i) => (
          <path key={i} d={pt.d} fill={fillOf(pt.fill)} stroke={strokeOf(pt.stroke)} strokeWidth={pt.sw} strokeOpacity={pt.stroke ? 0.85 : undefined} opacity={pt.opacity} strokeLinecap="round" strokeLinejoin="round" />
        ))}
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

/* ================================================================== */
/*  Ornamen tambahan (bergerak halus — hanya transform/opacity)        */
/* ================================================================== */

/** Patra sari: sulur bunga simetris yang "tergambar" sendiri saat masuk layar (pemisah section). */
export function PatraSari({ className = '' }: { className?: string }) {
  // satu sisi sulur (kanan), dicerminkan untuk sisi kiri
  const vine = 'M160 30 C178 30 186 18 200 18 S224 32 238 26 S258 10 272 16 C282 20 284 30 276 34 C270 37 264 31 268 26'
  const curl2 = 'M200 18 C204 10 214 8 218 14 C221 19 216 23 212 20'
  const leaves = [
    'M222 30 C228 38 238 40 244 36 C238 30 230 28 222 30Z',
    'M186 24 C190 14 198 10 204 12 C202 20 194 25 186 24Z',
    'M252 18 C256 10 264 6 270 8 C268 15 260 20 252 18Z',
  ]
  const side = (flip: boolean) => (
    <g transform={flip ? 'translate(320 0) scale(-1 1)' : undefined}>
      <path className="draw" d={vine} pathLength={1} stroke="#b8975a" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path className="draw" d={curl2} pathLength={1} stroke="#b8975a" strokeWidth="1" fill="none" strokeLinecap="round" />
      {leaves.map((d, i) => (
        <path key={i} d={d} fill="#a7b07a" opacity=".55" />
      ))}
      <circle cx="268" cy="26" r="1.6" fill="#f2c94c" />
    </g>
  )
  return (
    <svg viewBox="0 0 320 50" className={className} aria-hidden="true">
      {side(false)}
      {side(true)}
      {/* bunga tengah */}
      <g transform="translate(160 28)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-7" rx="4.2" ry="7.5" transform={`rotate(${a})`} fill="#fffdf7" stroke="#d6c08f" strokeWidth=".8" />
        ))}
        <circle r="2.6" fill="#f2c94c" />
      </g>
    </svg>
  )
}

/** Ranting bunga jepun dengan daun panjang — bergoyang pelan (sudut/aksen). */
export const JepunBranch = memo(function JepunBranch({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const leaf = (x: number, y: number, rot: number, len: number, fill: string) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0 C${len * 0.3} ${-len * 0.16} ${len * 0.75} ${-len * 0.14} ${len} 0 C${len * 0.75} ${len * 0.14} ${len * 0.3} ${len * 0.16} 0 0Z`} fill={fill} />
      <path d={`M2 0 H${len - 4}`} stroke="#8e9866" strokeWidth=".7" opacity=".6" />
    </g>
  )
  const flower = (x: number, y: number, s: number, r: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={PETAL} transform={`rotate(${a}) skewX(-8)`} fill="#fffdf7" stroke="#e8dcc6" strokeWidth="1.2" />
      ))}
      <circle r="6" fill="#f2c94c" />
    </g>
  )
  return (
    <svg viewBox="0 0 220 180" className={className} style={style} aria-hidden="true">
      <g className="sway" style={{ transformOrigin: '210px 6px' }}>
        <path d="M212 4 C190 20 170 40 150 52 C126 66 104 72 84 92" stroke="#8a7a5a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M150 52 C146 70 140 84 128 98" stroke="#8a7a5a" strokeWidth="2" fill="none" strokeLinecap="round" />
        {leaf(150, 52, 150, 70, '#b9c18c')}
        {leaf(150, 52, 115, 62, '#a7b07a')}
        {leaf(150, 52, 190, 58, '#c7cd9f')}
        {leaf(84, 92, 160, 56, '#a7b07a')}
        {leaf(84, 92, 120, 50, '#b9c18c')}
        {flower(80, 96, 0.36, 10)}
        {flower(108, 108, 0.3, -20)}
        {flower(126, 100, 0.26, 40)}
        {flower(60, 116, 0.28, 0)}
      </g>
    </svg>
  )
})

/** Burung kokokan (bangau putih) terbang melintas — sayap mengepak (scaleY), melintas (translateX). */
export function Kokokan({ className = '', count = 5, duration = 26, delay = 0 }: { className?: string; count?: number; duration?: number; delay?: number }) {
  return (
    <div className={`pointer-events-none absolute overflow-hidden ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute left-0"
          style={{
            top: `${10 + ((i * 37) % 60)}%`,
            animation: `fly ${duration + (i % 3) * 3}s linear ${delay + i * 1.6}s infinite`,
          }}
        >
          <svg viewBox="0 0 40 20" width={22 + (i % 3) * 6} height={11 + (i % 3) * 3} style={{ animation: `flap ${0.9 + (i % 2) * 0.25}s ease-in-out infinite alternate`, transformOrigin: '50% 60%' }}>
            <path d="M2 10 Q11 2 20 11 Q29 2 38 10" stroke="#8a7a62" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".55" />
          </svg>
        </div>
      ))}
    </div>
  )
}

/** Dupa: batang + asap tipis yang naik & memudar. */
export function Dupa({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none relative ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          viewBox="0 0 30 120"
          className="absolute bottom-[38px] left-1/2 h-28 w-8 -translate-x-1/2"
          style={{ animation: `smoke ${6 + i * 1.4}s ease-out ${i * 2}s infinite`, opacity: 0 }}
        >
          <path d="M15 120 C5 100 25 86 15 66 C6 48 24 34 14 14 C10 6 14 2 16 0" stroke="#b9ab94" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      ))}
      <svg viewBox="0 0 20 44" className="absolute bottom-0 left-1/2 h-11 w-5 -translate-x-1/2">
        <path d="M10 6 V44" stroke="#8a6a3a" strokeWidth="1.6" />
        <circle cx="10" cy="5" r="2.2" fill="#e9b93a" style={{ animation: 'ember 2.4s ease-in-out infinite' }} />
      </svg>
    </div>
  )
}

/** Sinar matahari pagi yang berputar sangat pelan (conic gradient, hanya rotate). */
export function SunRays({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <div
        className="h-full w-full rounded-full"
        style={{
          background: 'repeating-conic-gradient(from 0deg, rgba(255,236,190,.38) 0deg 5deg, rgba(255,236,190,0) 5deg 18deg)',
          WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,.6) 35%, transparent 68%)',
          maskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,.6) 35%, transparent 68%)',
          animation: 'spin-slow 140s linear infinite',
        }}
      />
    </div>
  )
}

/** Gebogan: susunan persembahan buah & bunga berbentuk kerucut di atas dulang. */
export const Gebogan = memo(function Gebogan(p: SvgProps) {
  const tiers = [
    { y: 112, n: 6, r: 9, c: ['#f2c94c', '#e8a15a', '#c7cd9f'] },
    { y: 96, n: 5, r: 8.5, c: ['#e8a15a', '#f2c94c', '#fffdf7'] },
    { y: 81, n: 4, r: 8, c: ['#c7cd9f', '#f2c94c', '#e8a15a'] },
    { y: 67, n: 3, r: 7.5, c: ['#f2c94c', '#fffdf7', '#e8a15a'] },
    { y: 54, n: 2, r: 7, c: ['#e8a15a', '#c7cd9f'] },
  ]
  return (
    <svg viewBox="0 0 120 170" aria-hidden="true" {...p}>
      {/* dulang */}
      <path d="M30 128 H90 L84 138 H36Z" fill="#d6c08f" />
      <path d="M52 138 H68 L72 160 H48Z" fill="#cbb47f" />
      <path d="M40 160 H80 V166 H40Z" fill="#b8975a" />
      {tiers.map((t, k) => {
        const w = t.n * t.r * 2
        return Array.from({ length: t.n }, (_, i) => (
          <circle key={`${k}-${i}`} cx={60 - w / 2 + t.r + i * t.r * 2} cy={t.y + 8} r={t.r} fill={t.c[i % t.c.length]} stroke="#d9cdb9" strokeWidth=".6" />
        ))
      })}
      {/* janur & bunga di puncak */}
      <path d="M60 46 C54 30 56 18 60 6 C64 18 66 30 60 46Z" fill="#c7cd9f" stroke="#a7b07a" strokeWidth=".8" />
      <path d="M60 44 C48 36 42 26 40 16 M60 44 C72 36 78 26 80 16" stroke="#a7b07a" strokeWidth="1.2" fill="none" />
      <g transform="translate(60 44) scale(.16)">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={PETAL} transform={`rotate(${a}) skewX(-8)`} fill="#fffdf7" stroke="#e8dcc6" strokeWidth="3" />
        ))}
        <circle r="8" fill="#f2c94c" />
      </g>
    </svg>
  )
})
