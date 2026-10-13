/**
 * Pemandangan pura Bali (ilustrasi SVG orisinal) & bingkai bunga.
 * Terinspirasi suasana pura di pagi hari: langit berkabut, Gunung Agung, meru bertingkat,
 * pohon kelapa, tembok penyengker, tangga batu, kolam teratai, bunga jepun & anggrek.
 *
 * viewBox 1600×1000, inti komposisi di tengah (x 300–1300) → `xMidYMax slice` aman untuk
 * layar potret (HP memotong sisi) maupun lanskap (desktop hanya memotong sedikit langit).
 */
import { memo, useId, type CSSProperties } from 'react'
import { jepunPetal } from './geometry'
import { CandiBali } from './index'

const PETAL = jepunPetal()
const uidOf = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '')
const f = (n: number) => Math.round(n * 10) / 10

/* ------------------------------------------------------------------ */
/* Elemen dasar                                                        */
/* ------------------------------------------------------------------ */

/** daun runcing dengan tulang daun */
function leafPath(len: number, w: number, bend = 0.15) {
  return `M0 0 C${f(len * 0.25)} ${f(-w)} ${f(len * 0.7)} ${f(-w * (1 - bend))} ${len} ${f(len * bend * 0.3)} C${f(len * 0.7)} ${f(w * (1 + bend) * 0.6)} ${f(len * 0.25)} ${f(w * 0.8)} 0 0Z`
}
function Leaf({ x, y, rot, len, w, fill, vein = '#5f7553', bend }: { x: number; y: number; rot: number; len: number; w: number; fill: string; vein?: string; bend?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={leafPath(len, w, bend)} fill={fill} />
      <path d={`M2 0 Q${f(len * 0.5)} ${f(-w * 0.12)} ${f(len - 4)} ${f(len * (bend ?? 0.15) * 0.3)}`} stroke={vein} strokeWidth={Math.max(0.6, w * 0.06)} fill="none" opacity=".45" />
    </g>
  )
}

/** bunga jepun putih-kuning */
function Frangipani({ x, y, s = 1, rot = 0, id }: { x: number; y: number; s?: number; rot?: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * 0.42})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={PETAL} transform={`rotate(${a}) skewX(-10)`} fill={`url(#fg${id})`} stroke="#e6d9bf" strokeWidth="1.4" />
      ))}
      <circle r="5" fill="#e9b93a" />
    </g>
  )
}

/** bunga anggrek (bulan) merah muda */
function Orchid({ x, y, s = 1, rot = 0, id }: { x: number; y: number; s?: number; rot?: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* kelopak (sepal) atas & bawah */}
      <ellipse cx="0" cy="-15" rx="6.5" ry="13" fill={`url(#og${id})`} />
      <ellipse cx="-11" cy="11" rx="5.5" ry="12" transform="rotate(40 -11 11)" fill={`url(#og${id})`} />
      <ellipse cx="11" cy="11" rx="5.5" ry="12" transform="rotate(-40 11 11)" fill={`url(#og${id})`} />
      {/* mahkota lebar kiri-kanan */}
      <ellipse cx="-14" cy="-2" rx="13" ry="11" transform="rotate(-12 -14 -2)" fill={`url(#og${id})`} />
      <ellipse cx="14" cy="-2" rx="13" ry="11" transform="rotate(12 14 -2)" fill={`url(#og${id})`} />
      {/* bibir */}
      <path d="M-6 4 C-7 12 -3 17 0 17 C3 17 7 12 6 4 C3 7 -3 7 -6 4Z" fill="#c9667e" />
      <circle cx="0" cy="1" r="3" fill="#f2d27a" />
    </g>
  )
}

/** daun palem (pelepah kelapa) dengan anak daun */
function Frond({ x, y, rot, len, fill }: { x: number; y: number; rot: number; len: number; fill: string }) {
  const leaflets = []
  for (let i = 3; i < 18; i++) {
    const t = i / 18
    const px = len * t
    const py = len * t * t * 0.32 // melengkung turun
    const l = 34 * Math.sin(Math.PI * t) + 6
    leaflets.push(
      <path key={`a${i}`} d={`M${f(px)} ${f(py)} l${f(l * 0.35)} ${f(-l * 0.9)}`} stroke={fill} strokeWidth="3" strokeLinecap="round" />,
      <path key={`b${i}`} d={`M${f(px)} ${f(py)} l${f(l * 0.55)} ${f(l * 0.8)}`} stroke={fill} strokeWidth="3" strokeLinecap="round" />,
    )
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0 Q${f(len * 0.5)} ${f(len * 0.05)} ${len} ${f(len * 0.32)}`} stroke={fill} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      {leaflets}
    </g>
  )
}

function Palm({ x, y, h, lean, tone }: { x: number; y: number; h: number; lean: number; tone: string }) {
  const topX = x + lean
  const topY = y - h
  return (
    <g>
      <path d={`M${x - 7} ${y} C${x - 4} ${y - h * 0.5} ${topX - 8} ${topY + h * 0.25} ${topX - 3} ${topY}`} stroke="#9c8a72" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d={`M${x - 7} ${y} C${x - 4} ${y - h * 0.5} ${topX - 8} ${topY + h * 0.25} ${topX - 3} ${topY}`} stroke="#b9a88e" strokeWidth="4" fill="none" strokeDasharray="2 9" />
      {[-170, -140, -105, -70, -35, -10, 15].map((r, i) => (
        <Frond key={i} x={topX - 3} y={topY} rot={r} len={110 + (i % 2) * 18} fill={tone} />
      ))}
      <circle cx={topX - 2} cy={topY + 6} r="7" fill="#8a7a5a" />
    </g>
  )
}

/** Meru: pura bertingkat beratap ijuk. */
function Meru({ x, y, w, tiers, id }: { x: number; y: number; w: number; tiers: number; id: string }) {
  const parts = []
  // dasar (bebaturan) & badan
  parts.push(<path key="b0" d={`M${x - w * 0.62} ${y} H${x + w * 0.62} V${y - 26} H${x - w * 0.62}Z`} fill={`url(#pa${id})`} stroke="#b9ab94" strokeWidth=".8" />)
  parts.push(<path key="b1" d={`M${x - w * 0.42} ${y - 26} H${x + w * 0.42} V${y - 78} H${x - w * 0.42}Z`} fill={`url(#br${id})`} />)
  parts.push(<path key="b2" d={`M${x - w * 0.14} ${y - 26} V${y - 64} H${x + w * 0.14} V${y - 26}`} fill="#6b5240" />)
  let yy = y - 78
  let ww = w
  for (let i = 0; i < tiers; i++) {
    const rh = 26 - i * 1.4
    // atap ijuk: trapesium sedikit melengkung + tiang penyangga
    parts.push(
      <path
        key={`r${i}`}
        d={`M${f(x - ww / 2)} ${f(yy)} Q${f(x)} ${f(yy + 5)} ${f(x + ww / 2)} ${f(yy)} L${f(x + ww * 0.32)} ${f(yy - rh)} H${f(x - ww * 0.32)} Z`}
        fill={`url(#ij${id})`}
      />,
      <path key={`s${i}`} d={`M${f(x - ww * 0.22)} ${f(yy - rh)} H${f(x + ww * 0.22)} V${f(yy - rh - 6)} H${f(x - ww * 0.22)}Z`} fill="#c9a77a" />,
    )
    yy -= rh + 6
    ww *= 0.86
  }
  parts.push(<path key="top" d={`M${x - 5} ${yy} C${x - 4} ${yy - 16} ${x + 4} ${yy - 16} ${x + 5} ${yy} Z M${x} ${yy - 16} V${yy - 30}`} fill="#d6b56a" stroke="#d6b56a" strokeWidth="2" />)
  return <g>{parts}</g>
}

/* ------------------------------------------------------------------ */
/* Pemandangan                                                         */
/* ------------------------------------------------------------------ */

export const PuraScene = memo(function PuraScene({
  className = '',
  variant = 'pagi',
  landscape = false,
  gate = true,
  style,
}: {
  className?: string
  variant?: 'pagi' | 'senja'
  /** layar lebar: potong latar depan agar langit-gunung-gerbang muat */
  landscape?: boolean
  gate?: boolean
  style?: CSSProperties
}) {
  const u = uidOf(useId())
  const senja = variant === 'senja'
  // kanvas 1600×1300: inti komposisi x 300–1300; gerbang berpusat di x 800, kaki di y 860
  const viewBox = landscape ? '0 0 1600 940' : '0 0 1600 1300'
  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMax slice" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`sky${u}`} x1="0" y1="0" x2="0" y2="1">
          {senja ? (
            <>
              <stop offset="0" stopColor="#e6d6df" />
              <stop offset=".3" stopColor="#f6e1d2" />
              <stop offset=".55" stopColor="#fbeedd" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#c9dce2" />
              <stop offset=".3" stopColor="#e6efed" />
              <stop offset=".55" stopColor="#fbf4e6" />
            </>
          )}
        </linearGradient>
        <radialGradient id={`sun${u}`} cx="800" cy="560" r="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={senja ? '#ffd7a4' : '#fff2cc'} stopOpacity=".95" />
          <stop offset=".5" stopColor={senja ? '#ffe2be' : '#fff7e2'} stopOpacity=".4" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`cl${u}`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset=".6" stopColor="#ffffff" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`mi${u}`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity=".85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`mt${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b5c8ca" />
          <stop offset="1" stopColor="#e4ece9" />
        </linearGradient>
        <linearGradient id={`ij${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d5148" />
          <stop offset="1" stopColor="#3d342d" />
        </linearGradient>
        <linearGradient id={`pa${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5efe4" />
          <stop offset="1" stopColor="#d9cdb8" />
        </linearGradient>
        <pattern id={`br${u}`} width="16" height="8" patternUnits="userSpaceOnUse">
          <rect width="16" height="8" fill="#c47a5c" />
          <path d="M0 7.5 H16 M8 0 V3.5 M0 3.5 H16 M0 3.5 V7.5" stroke="#ead6c3" strokeWidth=".8" />
        </pattern>
        <linearGradient id={`wa${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d3e5df" />
          <stop offset="1" stopColor="#9dbdb3" />
        </linearGradient>
        <linearGradient id={`gr${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8d3b0" />
          <stop offset="1" stopColor="#a3b489" />
        </linearGradient>
        <radialGradient id={`fg${u}`} cx="0" cy="0" r="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2c94c" />
          <stop offset=".32" stopColor="#f8e3a0" />
          <stop offset=".6" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#fbf5ea" />
        </radialGradient>
        <radialGradient id={`lo${u}`}>
          <stop offset="0" stopColor="#fbe3e8" />
          <stop offset="1" stopColor="#e3a9b4" />
        </radialGradient>
      </defs>

      {/* langit, matahari, awan */}
      <rect width="1600" height="1300" fill={`url(#sky${u})`} />
      <circle className="sc-sun" cx="800" cy="560" r="360" fill={`url(#sun${u})`} />
      <g className="sc-cloud">
        <ellipse cx="520" cy="250" rx="180" ry="38" fill={`url(#cl${u})`} />
        <ellipse cx="610" cy="228" rx="110" ry="28" fill={`url(#cl${u})`} />
        <ellipse cx="1080" cy="300" rx="200" ry="40" fill={`url(#cl${u})`} />
        <ellipse cx="960" cy="186" rx="120" ry="26" fill={`url(#cl${u})`} />
        <ellipse cx="180" cy="330" rx="160" ry="30" fill={`url(#cl${u})`} />
        <ellipse cx="1440" cy="220" rx="170" ry="32" fill={`url(#cl${u})`} />
      </g>

      {/* Gunung Agung */}
      <g className="sc-far">
        <path d="M380 640 C580 600 660 470 760 360 C782 338 818 338 840 360 C940 470 1020 600 1220 640 Z" fill={`url(#mt${u})`} />
        <path d="M760 360 C772 382 786 386 800 372 C814 386 828 382 840 360" stroke="#f7faf8" strokeWidth="6" fill="none" opacity=".65" />
      </g>
      {/* barisan pohon jauh + kabut */}
      <path d="M0 650 C80 624 150 648 220 630 C300 610 360 640 440 628 C520 616 580 646 660 636 C740 626 800 640 880 628 C960 614 1040 642 1120 630 C1200 618 1280 640 1360 628 C1440 616 1520 642 1600 630 V720 H0Z" fill="#c7d5bb" />
      <ellipse cx="800" cy="680" rx="760" ry="46" fill={`url(#mi${u})`} />

      {/* meru: besar di kanan gerbang, kecil di kiri */}
      <g className="sc-meru">
        <Meru x={1000} y={724} w={150} tiers={9} id={u} />
        <Meru x={600} y={724} w={100} tiers={5} id={u} />
      </g>

      {/* pohon kelapa */}
      <g className="sc-palm">
        <Palm x={520} y={770} h={310} lean={-30} tone="#8fa37f" />
        <Palm x={1110} y={772} h={340} lean={40} tone="#869b76" />
        <Palm x={420} y={790} h={250} lean={-22} tone="#9cae8c" />
        <Palm x={90} y={790} h={330} lean={30} tone="#8fa37f" />
        <Palm x={1510} y={790} h={320} lean={-34} tone="#8ea27e" />
      </g>

      {/* tembok penyengker */}
      <g>
        <path d="M0 724 H700 V800 H0Z" fill={`url(#br${u})`} />
        <path d="M900 724 H1600 V800 H900Z" fill={`url(#br${u})`} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={`tl${i}`} d={`M${i * 46 - 4} 724 h40 v-10 h-6 v-6 h-28 v6 h-6 Z`} fill={`url(#pa${u})`} stroke="#b9ab94" strokeWidth=".6" />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <path key={`tr${i}`} d={`M${900 + i * 46 - 4} 724 h40 v-10 h-6 v-6 h-28 v6 h-6 Z`} fill={`url(#pa${u})`} stroke="#b9ab94" strokeWidth=".6" />
        ))}
        <path d="M0 800 H1600 V812 H0Z" fill={`url(#pa${u})`} />
      </g>

      {/* halaman */}
      <path d="M0 812 H1600 V1300 H0Z" fill={`url(#gr${u})`} />

      {/* candi bentar di dalam lukisan (dua sisi, dianimasikan saat dibuka) */}
      {gate && (
        <g>
          <g className="sc-gate-l">
            <CandiBali side="left" x={652} y={440} width={148} height={420} />
          </g>
          <g className="sc-gate-r">
            <CandiBali side="right" x={800} y={440} width={148} height={420} />
          </g>
        </g>
      )}

      {/* tangga batu */}
      <g fill={`url(#pa${u})`} stroke="#b9ab94" strokeWidth=".8">
        <path d="M700 860 H900 L912 880 H688Z" />
        <path d="M686 880 H914 L928 902 H672Z" />
        <path d="M670 902 H930 L946 926 H654Z" />
      </g>

      {/* semak di kaki tembok */}
      <g>
        <ellipse cx="420" cy="822" rx="150" ry="40" fill="#9aae8a" />
        <ellipse cx="1180" cy="822" rx="150" ry="40" fill="#93a883" />
        <Frangipani x={380} y={804} s={0.7} id={u} />
        <Frangipani x={440} y={816} s={0.6} rot={30} id={u} />
        <Frangipani x={1160} y={808} s={0.7} rot={-20} id={u} />
        <Frangipani x={1220} y={818} s={0.55} id={u} />
      </g>

      {/* kolam teratai */}
      <g className="sc-pond">
        <path d="M380 990 C470 944 620 934 660 934 H940 C980 934 1130 944 1220 990 C1300 1030 1280 1150 1180 1170 C1020 1200 580 1200 420 1170 C320 1150 300 1030 380 990Z" fill={`url(#wa${u})`} />
        <path d="M480 1010 H700 M900 1030 H1130 M560 1080 H820 M940 1110 H1120" stroke="#ffffff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
        {[
          [500, 1050, 24],
          [580, 1120, 20],
          [1080, 1060, 26],
          [1150, 1120, 18],
          [980, 1140, 15],
          [700, 1150, 16],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={r} ry={r! * 0.42} fill="#8fa37f" />
            <path d={`M${x} ${y} L${x! + r!} ${y! - 2}`} stroke="#a9c6be" strokeWidth="2" />
          </g>
        ))}
        {[
          [524, 1040],
          [1060, 1050],
          [760, 1140],
        ].map(([x, y], i) => (
          <g key={`l${i}`} transform={`translate(${x} ${y})`}>
            {[-50, -25, 0, 25, 50].map((a) => (
              <ellipse key={a} cx="0" cy="-10" rx="5" ry="12" transform={`rotate(${a} 0 0)`} fill={`url(#lo${u})`} />
            ))}
          </g>
        ))}
      </g>

      {/* latar depan: rumpun jepun */}
      <g>
        <ellipse cx="300" cy="1250" rx="260" ry="70" fill="#97ab86" />
        <ellipse cx="1300" cy="1250" rx="260" ry="70" fill="#8ea47d" />
        <Frangipani x={280} y={1220} s={0.9} id={u} />
        <Frangipani x={340} y={1240} s={0.8} rot={30} id={u} />
        <Frangipani x={1290} y={1222} s={0.9} rot={-15} id={u} />
        <Frangipani x={1340} y={1246} s={0.75} id={u} />
      </g>
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Bingkai bunga (jepun + anggrek + daun) — sisi kiri; cermin untuk kanan */
/* ------------------------------------------------------------------ */

export const FloralGarland = memo(function FloralGarland({ side = 'left', className = '', style }: { side?: 'left' | 'right'; className?: string; style?: CSSProperties }) {
  const u = uidOf(useId())
  const flip = side === 'right' ? 'translate(220 0) scale(-1 1)' : undefined
  const greens = ['#7e9471', '#93a886', '#6d8462', '#a6b796']
  // susunan berulang menurun: daun panjang, rumpun jepun, anggrek
  const clusters = [0, 1, 2, 3, 4, 5]
  return (
    <svg viewBox="0 0 220 1000" preserveAspectRatio="xMinYMid slice" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`fg${u}`} cx="0" cy="0" r="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2c94c" />
          <stop offset=".32" stopColor="#f8e3a0" />
          <stop offset=".6" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#fbf5ea" />
        </radialGradient>
        <radialGradient id={`og${u}`}>
          <stop offset="0" stopColor="#fbe4e9" />
          <stop offset=".7" stopColor="#efbfca" />
          <stop offset="1" stopColor="#e3a9b4" />
        </radialGradient>
      </defs>
      <g transform={flip}>
        {clusters.map((k) => {
          const y = 40 + k * 165
          const dx = k % 2 ? 18 : 0
          return (
            <g key={k} className="sway" style={{ transformOrigin: `0px ${y}px`, animationDelay: `${-k * 1.3}s` }}>
              <Leaf x={-10} y={y} rot={-25 + (k % 3) * 8} len={170} w={28} fill={greens[k % 4]!} />
              <Leaf x={-10} y={y + 30} rot={12 + (k % 2) * 10} len={150} w={24} fill={greens[(k + 1) % 4]!} />
              <Leaf x={-6} y={y + 70} rot={38} len={120} w={20} fill={greens[(k + 2) % 4]!} />
              <Leaf x={-4} y={y - 30} rot={-55} len={110} w={18} fill={greens[(k + 3) % 4]!} />
              <Frangipani x={70 + dx} y={y + 6} s={1} rot={k * 20} id={u} />
              <Frangipani x={108 + dx} y={y + 34} s={0.82} rot={k * 35 + 15} id={u} />
              <Frangipani x={52 + dx} y={y + 52} s={0.74} rot={k * 12} id={u} />
              {k % 2 === 0 ? (
                <>
                  <Orchid x={128 + dx} y={y - 22} s={1.05} rot={-10} id={u} />
                  <Orchid x={150 + dx} y={y + 12} s={0.8} rot={15} id={u} />
                </>
              ) : (
                <Orchid x={140 + dx} y={y + 70} s={0.9} rot={8} id={u} />
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
})

/** Rangkaian bunga kecil untuk sudut section (aksen). */
export const FloralCorner = memo(function FloralCorner({ className = '', style, flip = false }: { className?: string; style?: CSSProperties; flip?: boolean }) {
  const u = uidOf(useId())
  return (
    <svg viewBox="0 0 240 200" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`fg${u}`} cx="0" cy="0" r="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2c94c" />
          <stop offset=".32" stopColor="#f8e3a0" />
          <stop offset=".6" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#fbf5ea" />
        </radialGradient>
        <radialGradient id={`og${u}`}>
          <stop offset="0" stopColor="#fbe4e9" />
          <stop offset=".7" stopColor="#efbfca" />
          <stop offset="1" stopColor="#e3a9b4" />
        </radialGradient>
      </defs>
      <g transform={flip ? 'translate(240 0) scale(-1 1)' : undefined}>
        <g className="sway" style={{ transformOrigin: '240px 0px' }}>
          <Leaf x={240} y={0} rot={150} len={150} w={24} fill="#93a886" />
          <Leaf x={240} y={10} rot={125} len={130} w={22} fill="#7e9471" />
          <Leaf x={236} y={4} rot={175} len={120} w={18} fill="#a6b796" />
          <Frangipani x={150} y={52} s={1} rot={10} id={u} />
          <Frangipani x={186} y={84} s={0.85} rot={40} id={u} />
          <Frangipani x={122} y={90} s={0.7} rot={-10} id={u} />
          <Orchid x={96} y={48} s={0.95} rot={-14} id={u} />
          <Orchid x={150} y={124} s={0.75} rot={20} id={u} />
        </g>
      </g>
    </svg>
  )
})
