/**
 * Pemandangan pura Bali di malam hari (ilustrasi SVG orisinal).
 * Bulan purnama terbit di balik Gunung Agung, meru & pohon kelapa sebagai siluet bergaris emas,
 * tembok penyengker, candi bentar (bergaris prada), pelita menyala, kolam teratai memantulkan bulan.
 *
 * Kanvas 1600×1300, inti komposisi x 300–1300 → `xMidYMax slice` aman untuk HP (potret)
 * maupun desktop (lanskap memakai viewBox 1600×940 agar langit–gerbang muat).
 */
import { memo, useId, type CSSProperties } from 'react'
import { jepunPetal } from './geometry'
import { CandiBali } from './index'

const PETAL = jepunPetal()
const uidOf = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '')
const f = (n: number) => Math.round(n * 10) / 10
const GOLD = '#c9a55c'
const SIL = '#0c0907' // siluet terdekat

/** bunga jepun krem (tampak bercahaya di malam hari) */
function Frangipani({ x, y, s = 1, rot = 0, id }: { x: number; y: number; s?: number; rot?: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * 0.42})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={PETAL} transform={`rotate(${a}) skewX(-10)`} fill={`url(#fg${id})`} />
      ))}
      <circle r="5" fill="#d9a93a" />
    </g>
  )
}

/** pelepah kelapa */
function Frond({ x, y, rot, len, fill }: { x: number; y: number; rot: number; len: number; fill: string }) {
  const leaflets = []
  for (let i = 3; i < 18; i++) {
    const t = i / 18
    const px = len * t
    const py = len * t * t * 0.32
    const l = 34 * Math.sin(Math.PI * t) + 6
    leaflets.push(<path key={`a${i}`} d={`M${f(px)} ${f(py)} l${f(l * 0.35)} ${f(-l * 0.9)}`} />, <path key={`b${i}`} d={`M${f(px)} ${f(py)} l${f(l * 0.55)} ${f(l * 0.8)}`} />)
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} stroke={fill} strokeWidth="3" strokeLinecap="round" fill="none">
      <path d={`M0 0 Q${f(len * 0.5)} ${f(len * 0.05)} ${len} ${f(len * 0.32)}`} strokeWidth="3.4" />
      {leaflets}
    </g>
  )
}

function Palm({ x, y, h, lean, tone }: { x: number; y: number; h: number; lean: number; tone: string }) {
  const topX = x + lean
  const topY = y - h
  return (
    <g>
      <path d={`M${x - 7} ${y} C${x - 4} ${y - h * 0.5} ${topX - 8} ${topY + h * 0.25} ${topX - 3} ${topY}`} stroke={tone} strokeWidth="9" fill="none" strokeLinecap="round" />
      {[-170, -140, -105, -70, -35, -10, 15].map((r, i) => (
        <Frond key={i} x={topX - 3} y={topY} rot={r} len={110 + (i % 2) * 18} fill={tone} />
      ))}
    </g>
  )
}

/** Meru: siluet atap ijuk bertingkat, tepi tiap atap tersapu cahaya bulan (garis emas). */
function Meru({ x, y, w, tiers }: { x: number; y: number; w: number; tiers: number }) {
  const parts = []
  parts.push(<path key="b0" d={`M${x - w * 0.62} ${y} H${x + w * 0.62} V${y - 26} H${x - w * 0.62}Z`} fill="#1a140f" stroke={GOLD} strokeOpacity=".35" strokeWidth="1" />)
  parts.push(<path key="b1" d={`M${x - w * 0.42} ${y - 26} H${x + w * 0.42} V${y - 78} H${x - w * 0.42}Z`} fill="#22170f" />)
  parts.push(<path key="b2" d={`M${x - w * 0.14} ${y - 26} V${y - 64} H${x + w * 0.14} V${y - 26}`} fill="#0b0806" />)
  let yy = y - 78
  let ww = w
  for (let i = 0; i < tiers; i++) {
    const rh = 26 - i * 1.4
    parts.push(
      <path key={`r${i}`} d={`M${f(x - ww / 2)} ${f(yy)} Q${f(x)} ${f(yy + 5)} ${f(x + ww / 2)} ${f(yy)} L${f(x + ww * 0.32)} ${f(yy - rh)} H${f(x - ww * 0.32)} Z`} fill="#130e0a" />,
      <path key={`e${i}`} d={`M${f(x - ww / 2)} ${f(yy)} Q${f(x)} ${f(yy + 5)} ${f(x + ww / 2)} ${f(yy)}`} stroke={GOLD} strokeOpacity=".75" strokeWidth="1.3" fill="none" />,
      <path key={`s${i}`} d={`M${f(x - ww * 0.22)} ${f(yy - rh)} H${f(x + ww * 0.22)} V${f(yy - rh - 6)} H${f(x - ww * 0.22)}Z`} fill="#3a2a18" />,
    )
    yy -= rh + 6
    ww *= 0.86
  }
  parts.push(<path key="top" d={`M${x - 5} ${yy} C${x - 4} ${yy - 16} ${x + 4} ${yy - 16} ${x + 5} ${yy} Z M${x} ${yy - 16} V${yy - 30}`} fill="#e7d09b" stroke="#e7d09b" strokeWidth="2" />)
  return <g>{parts}</g>
}

/** pelita (lampu minyak) dengan cahaya hangat */
function Pelita({ x, y, id, s = 1, still }: { x: number; y: number; id: string; s?: number; still?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle className={still ? undefined : 'sc-glow'} cx="0" cy="-14" r="46" fill={`url(#lamp${id})`} />
      <path d="M-9 0 H9 L6 -6 H-6Z" fill="#6b4b25" />
      <path d="M0 -7 C-4 -12 -2 -18 0 -24 C2 -18 4 -12 0 -7Z" fill="#ffd98a" />
    </g>
  )
}

/** bintang deterministik (tanpa Math.random agar SSR/OG konsisten) */
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = Math.sin(i * 78.233) * 12543.123
  const fx = a - Math.floor(a)
  const fy = b - Math.floor(b)
  return {
    x: f(fx * 1600),
    y: f(fy * fy * 520 + 20),
    r: f(0.6 + ((i * 7) % 5) * 0.32),
    tw: i % 6 === 0,
  }
})

/**
 * Lukisan dibagi 3 lapisan SVG dengan viewBox & pemotongan identik (otomatis sejajar):
 * latar (statis) + gerbang kiri + gerbang kanan. Gerbang digeser dengan CSS transform pada
 * lapisannya sendiri → dikerjakan GPU, latar tidak perlu digambar ulang tiap frame.
 * Geser gerbang dalam satuan lukisan → px: lihat `gateShiftPx`.
 */
export const PuraScene = memo(function PuraScene({
  className = '',
  variant = 'malam',
  landscape = false,
  gate = true,
  still = false,
  style,
}: {
  className?: string
  /** 'malam' = bulan terbit; 'fajar' = ufuk sedikit lebih hangat (untuk penutup) */
  variant?: 'malam' | 'fajar'
  landscape?: boolean
  gate?: boolean
  /** tanpa bintang berkelip / nyala pelita beranimasi (lebih ringan saat di-scroll) */
  still?: boolean
  style?: CSSProperties
}) {
  const u = uidOf(useId())
  const fajar = variant === 'fajar'
  // potret: langit ditinggikan (ruang untuk nama di atas bulan); lanskap: bulan di kanan atas
  const viewBox = landscape ? '0 60 1600 1000' : '0 -200 1600 1500'
  const M = landscape ? { x: 1190, y: 300, r: 76 } : { x: 800, y: 330, r: 104 }
  const layer = 'absolute inset-0 h-full w-full'
  return (
    <div className={`relative overflow-hidden ${className}`} style={style} aria-hidden="true">
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMax slice" className={layer}>
        <defs>
          <linearGradient id={`sky${u}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#07070b" />
            <stop offset=".3" stopColor={fajar ? '#16101a' : '#0f0d14'} />
            <stop offset=".5" stopColor={fajar ? '#3a2316' : '#241811'} />
            <stop offset=".56" stopColor={fajar ? '#4a2c17' : '#2c1d12'} />
          </linearGradient>
          <radialGradient id={`moonGlow${u}`} cx={M.x} cy={M.y + 20} r={M.r * 5} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f3dca2" stopOpacity=".42" />
            <stop offset=".35" stopColor="#c9a55c" stopOpacity=".14" />
            <stop offset="1" stopColor="#c9a55c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`moon${u}`} cx={M.x - 20} cy={M.y - 10} r={M.r * 1.06} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff8e4" />
            <stop offset=".7" stopColor="#f4e2b4" />
            <stop offset="1" stopColor="#e2c787" />
          </radialGradient>
          <linearGradient id={`mt${u}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2119" />
            <stop offset="1" stopColor="#140f0b" />
          </linearGradient>
          <linearGradient id={`pa${u}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4f4232" />
            <stop offset="1" stopColor="#261e16" />
          </linearGradient>
          <pattern id={`br${u}`} width="16" height="8" patternUnits="userSpaceOnUse">
            <rect width="16" height="8" fill="#3d2216" />
            <path d="M0 7.5 H16 M8 0 V3.5 M0 3.5 H16 M0 3.5 V7.5" stroke="#1f110a" strokeWidth=".8" />
          </pattern>
          <linearGradient id={`wa${u}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b1813" />
            <stop offset="1" stopColor="#0a0908" />
          </linearGradient>
          <linearGradient id={`gr${u}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#15110d" />
            <stop offset="1" stopColor="#0b0907" />
          </linearGradient>
          <radialGradient id={`fg${u}`} cx="0" cy="0" r="52" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e9bd4f" />
            <stop offset=".35" stopColor="#efdcae" />
            <stop offset="1" stopColor="#d9ccb2" />
          </radialGradient>
          <radialGradient id={`lamp${u}`}>
            <stop offset="0" stopColor="#ffcf73" stopOpacity=".55" />
            <stop offset=".4" stopColor="#e9a948" stopOpacity=".16" />
            <stop offset="1" stopColor="#e9a948" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`cl${u}`}>
            <stop offset="0" stopColor="#0b0a0e" stopOpacity=".8" />
            <stop offset="1" stopColor="#0b0a0e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`refl${u}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4e2b4" stopOpacity=".7" />
            <stop offset="1" stopColor="#c9a55c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* langit, bintang, bulan */}
        <rect y="-200" width="1600" height="1500" fill={`url(#sky${u})`} />
        <g className="sc-stars" fill="#f3e6c8">
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              opacity={s.tw && !still ? undefined : 0.55}
              className={s.tw && !still ? 'sc-twinkle' : undefined}
              style={s.tw && !still ? { animationDelay: `${-i * 0.37}s` } : undefined}
            />
          ))}
        </g>
        <circle className="sc-sun" cx={M.x} cy={M.y + 20} r={M.r * 5} fill={`url(#moonGlow${u})`} />
        <circle cx={M.x} cy={M.y} r={M.r} fill={`url(#moon${u})`} />
        <g fill="#d8bf86" opacity=".28" transform={`translate(${M.x} ${M.y}) scale(${M.r / 104})`}>
          <circle cx="-30" cy="-30" r="18" />
          <circle cx="30" cy="20" r="12" />
          <circle cx="-10" cy="40" r="9" />
        </g>
        {/* awan tipis (tepi memudar) melintas di depan bulan */}
        <g className="sc-cloud" fill={`url(#cl${u})`}>
          <ellipse cx={M.x - 120} cy={M.y + M.r * 0.45} rx="230" ry="16" />
          <ellipse cx={M.x + 150} cy={M.y - M.r * 0.25} rx="200" ry="12" />
          <ellipse cx="260" cy="300" rx="200" ry="14" />
        </g>

        {/* Gunung Agung: siluet, punggung bukit tersapu cahaya bulan */}
        <g className="sc-far">
          <path d="M300 660 C520 610 640 480 752 368 C778 344 822 344 848 368 C960 480 1080 610 1300 660 Z" fill={`url(#mt${u})`} />
          <path d="M420 628 C580 590 660 480 752 368 C778 344 822 344 848 368 C940 480 1020 590 1180 628" stroke={GOLD} strokeOpacity=".4" strokeWidth="1.6" fill="none" />
        </g>
        {/* barisan pohon jauh + kabut */}
        <path
          d="M0 650 C80 624 150 648 220 630 C300 610 360 640 440 628 C520 616 580 646 660 636 C740 626 800 640 880 628 C960 614 1040 642 1120 630 C1200 618 1280 640 1360 628 C1440 616 1520 642 1600 630 V740 H0Z"
          fill="#100c0a"
        />
        <rect y="660" width="1600" height="60" fill="#c9a55c" opacity=".035" />

        {/* meru */}
        <g className="sc-meru">
          <Meru x={1000} y={724} w={150} tiers={9} />
          <Meru x={600} y={724} w={100} tiers={5} />
        </g>

        {/* pohon kelapa (siluet) */}
        <g className="sc-palm">
          <Palm x={520} y={770} h={310} lean={-30} tone="#0f0b08" />
          <Palm x={1110} y={772} h={340} lean={40} tone="#0f0b08" />
          <Palm x={420} y={790} h={250} lean={-22} tone="#0d0a07" />
          <Palm x={90} y={790} h={330} lean={30} tone="#0d0a07" />
          <Palm x={1510} y={790} h={320} lean={-34} tone="#0d0a07" />
        </g>

        {/* tembok penyengker */}
        <g>
          <path d="M0 724 H700 V800 H0Z" fill={`url(#br${u})`} />
          <path d="M900 724 H1600 V800 H900Z" fill={`url(#br${u})`} />
          {Array.from({ length: 16 }, (_, i) => (
            <path key={`tl${i}`} d={`M${i * 46 - 4} 724 h40 v-10 h-6 v-6 h-28 v6 h-6 Z`} fill={`url(#pa${u})`} stroke={GOLD} strokeOpacity=".45" strokeWidth=".8" />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <path key={`tr${i}`} d={`M${900 + i * 46 - 4} 724 h40 v-10 h-6 v-6 h-28 v6 h-6 Z`} fill={`url(#pa${u})`} stroke={GOLD} strokeOpacity=".45" strokeWidth=".8" />
          ))}
          <path d="M0 800 H1600 V812 H0Z" fill={`url(#pa${u})`} />
          <path d="M0 800 H1600" stroke={GOLD} strokeOpacity=".35" strokeWidth="1" />
        </g>

        {/* halaman */}
        <path d="M0 812 H1600 V1300 H0Z" fill={`url(#gr${u})`} />

        {/* tangga batu */}
        <g fill={`url(#pa${u})`} stroke={GOLD} strokeOpacity=".4" strokeWidth=".9">
          <path d="M700 860 H900 L912 880 H688Z" />
          <path d="M686 880 H914 L928 902 H672Z" />
          <path d="M670 902 H930 L946 926 H654Z" />
        </g>
        {/* pelita di kaki gerbang */}
        <Pelita x={672} y={864} id={u} still={still} />
        <Pelita x={928} y={864} id={u} still={still} />

        {/* semak di kaki tembok + jepun */}
        <g>
          <ellipse cx="420" cy="822" rx="150" ry="40" fill="#0e0b08" />
          <ellipse cx="1180" cy="822" rx="150" ry="40" fill="#0e0b08" />
          <Frangipani x={380} y={804} s={0.7} id={u} />
          <Frangipani x={440} y={816} s={0.6} rot={30} id={u} />
          <Frangipani x={1160} y={808} s={0.7} rot={-20} id={u} />
          <Frangipani x={1220} y={818} s={0.55} id={u} />
        </g>

        {/* kolam teratai, memantulkan bulan */}
        <g className="sc-pond">
          <path
            d="M380 990 C470 944 620 934 660 934 H940 C980 934 1130 944 1220 990 C1300 1030 1280 1150 1180 1170 C1020 1200 580 1200 420 1170 C320 1150 300 1030 380 990Z"
            fill={`url(#wa${u})`}
            stroke={GOLD}
            strokeOpacity=".3"
            strokeWidth="1.2"
          />
          <g fill={`url(#refl${u})`}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <rect key={i} x={800 - (70 - i * 8)} y={958 + i * 26} width={(70 - i * 8) * 2} height="3" rx="1.5" />
            ))}
          </g>
          <path d="M480 1010 H640 M960 1030 H1130 M520 1090 H660 M940 1110 H1100" stroke={GOLD} strokeOpacity=".22" strokeWidth="1.5" strokeLinecap="round" />
          {[
            [500, 1050, 24],
            [580, 1120, 20],
            [1080, 1060, 26],
            [1150, 1120, 18],
            [980, 1140, 15],
            [660, 1150, 16],
          ].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx={r} ry={r! * 0.42} fill="#141a12" stroke={GOLD} strokeOpacity=".3" strokeWidth=".8" />
          ))}
          {[
            [524, 1040],
            [1060, 1050],
            [700, 1140],
          ].map(([x, y], i) => (
            <g key={`l${i}`} transform={`translate(${x} ${y})`}>
              {[-50, -25, 0, 25, 50].map((a) => (
                <ellipse key={a} cx="0" cy="-10" rx="5" ry="12" transform={`rotate(${a} 0 0)`} fill="#e9d6ad" opacity=".85" />
              ))}
            </g>
          ))}
        </g>

        {/* latar depan */}
        <g>
          <ellipse cx="300" cy="1250" rx="260" ry="70" fill={SIL} />
          <ellipse cx="1300" cy="1250" rx="260" ry="70" fill={SIL} />
          <Frangipani x={280} y={1220} s={0.9} id={u} />
          <Frangipani x={340} y={1240} s={0.8} rot={30} id={u} />
          <Frangipani x={1290} y={1222} s={0.9} rot={-15} id={u} />
          <Frangipani x={1340} y={1246} s={0.75} id={u} />
        </g>
      </svg>
      {gate && (
        <>
          <div className={`sc-gate-l ${layer}`}>
            <svg viewBox={viewBox} preserveAspectRatio="xMidYMax slice" className="h-full w-full">
              <CandiBali side="left" x={652} y={440} width={148} height={420} />
            </svg>
          </div>
          <div className={`sc-gate-r ${layer}`}>
            <svg viewBox={viewBox} preserveAspectRatio="xMidYMax slice" className="h-full w-full">
              <CandiBali side="right" x={800} y={440} width={148} height={420} />
            </svg>
          </div>
        </>
      )}
    </div>
  )
})

/** konversi geser gerbang (satuan lukisan) → px sesuai skala lukisan di layar saat ini */
export function gateShiftPx(root: Element | null, units = 170): number {
  const svg = root?.querySelector<SVGSVGElement>('.sc-gate-l svg')
  const m = svg?.getScreenCTM()
  return units * (m ? Math.abs(m.a) : 1)
}
