import { memo, useId, type CSSProperties, type SVGProps } from 'react'
import { candiBentarHalf, janurStrip, jepunPetal, patraPunggel, penjorPath } from './geometry'

type SvgProps = SVGProps<SVGSVGElement> & { className?: string; style?: CSSProperties }

const PUNGGEL = patraPunggel()
const CANDI = candiBentarHalf()
const PENJOR = penjorPath()
const PETAL = jepunPetal()

/** Gradien emas prada yang bisa dipakai bersama via id unik. */
function PradaGradient({ id, angle = 0 }: { id: string; angle?: number }) {
  return (
    <linearGradient id={id} gradientTransform={`rotate(${angle} .5 .5)`}>
      <stop offset="0" stopColor="#8a6a24" />
      <stop offset=".3" stopColor="#d9b25c" />
      <stop offset=".5" stopColor="#f7e3a3" />
      <stop offset=".7" stopColor="#c9a24b" />
      <stop offset="1" stopColor="#8a6a24" />
    </linearGradient>
  )
}

/* ------------------------------------------------------------------ */
/* Candi Bentar (setengah). side="right" dicerminkan.                  */
/* ------------------------------------------------------------------ */
export const CandiBentar = memo(function CandiBentar({ side = 'left', glow = true, ...p }: SvgProps & { side?: 'left' | 'right'; glow?: boolean }) {
  const uid = useId().replace(/:/g, '')
  const { W, H, d, ledges, panels, flames, bricks } = CANDI
  const flip = side === 'right' ? `translate(${W} 0) scale(-1 1)` : undefined
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMax meet" aria-hidden="true" {...p}>
      <defs>
        <PradaGradient id={`g${uid}`} angle={90} />
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a0b0f" />
          <stop offset=".55" stopColor="#24070a" />
          <stop offset="1" stopColor="#0f0605" />
        </linearGradient>
        <linearGradient id={`rim${uid}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#f7e3a3" stopOpacity=".7" />
          <stop offset=".03" stopColor="#f1d58a" stopOpacity=".25" />
          <stop offset=".09" stopColor="#f1d58a" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`c${uid}`}>
          <path d={d} />
        </clipPath>
      </defs>
      <g transform={flip}>
        <path d={d} fill={`url(#b${uid})`} />
        <g clipPath={`url(#c${uid})`}>
          <path d={bricks} stroke="#000" strokeOpacity=".35" strokeWidth="1" fill="none" />
          {glow && <rect x="0" y="0" width={W} height={H} fill={`url(#rim${uid})`} />}
        </g>
        <path d={ledges} stroke={`url(#g${uid})`} strokeWidth="1.6" fill="none" />
        {panels.map((pn, i) => (
          <g key={i}>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx="3" fill="none" stroke={`url(#g${uid})`} strokeWidth="1.2" />
            <rect x={pn.x + 6} y={pn.y + 6} width={pn.w - 12} height={pn.h - 12} rx="2" fill="none" stroke={`url(#g${uid})`} strokeOpacity=".5" strokeWidth=".8" />
            {/* punggel di dalam panel */}
            <g transform={`translate(${pn.x + pn.w / 2 - 44} ${pn.y + pn.h / 2 - 44}) scale(.88)`} stroke={`url(#g${uid})`} fill="none" strokeWidth="2.2">
              <path d={PUNGGEL.curl} strokeLinecap="round" />
              <path d={PUNGGEL.inner} strokeOpacity=".6" strokeWidth="1.4" />
              <path d={PUNGGEL.lobes} fill={`url(#g${uid})`} fillOpacity=".25" strokeWidth="1.2" />
            </g>
          </g>
        ))}
        <path d={flames} fill={`url(#g${uid})`} fillOpacity=".9" />
        <path d={d} fill="none" stroke={`url(#g${uid})`} strokeWidth="1.4" strokeOpacity=".75" />
      </g>
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Patra Punggel                                                       */
/* ------------------------------------------------------------------ */
export const PatraPunggel = memo(function PatraPunggel({ strokeWidth = 2, filled = true, ...p }: SvgProps & { strokeWidth?: number; filled?: boolean }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" {...p}>
      <defs>
        <PradaGradient id={`p${uid}`} angle={45} />
      </defs>
      <g stroke={`url(#p${uid})`} strokeLinecap="round" strokeLinejoin="round">
        <path className="draw" d={PUNGGEL.curl} strokeWidth={strokeWidth} pathLength={1} />
        <path className="draw" d={PUNGGEL.inner} strokeWidth={strokeWidth * 0.6} strokeOpacity=".65" pathLength={1} />
        <path className="draw-fill" d={PUNGGEL.lobes} strokeWidth={strokeWidth * 0.6} fill={filled ? `url(#p${uid})` : 'none'} fillOpacity=".28" />
      </g>
    </svg>
  )
})

/** Ornamen sudut: dua punggel bertemu di sudut kiri atas. Rotasikan untuk sudut lain. */
export const PatraCorner = memo(function PatraCorner(p: SvgProps) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...p}>
      <defs>
        <PradaGradient id={`k${uid}`} angle={45} />
      </defs>
      <g stroke={`url(#k${uid})`} strokeLinecap="round">
        <path d="M4 116 V20 Q4 4 20 4 H116" strokeWidth="1.2" />
        <path d="M12 116 V26 Q12 12 26 12 H116" strokeWidth=".6" strokeOpacity=".6" />
        <g transform="translate(14 14) scale(.5) rotate(-90 50 50) scale(-1 1) translate(-100 0)">
          <path d={PUNGGEL.curl} strokeWidth="3" />
          <path d={PUNGGEL.lobes} strokeWidth="1.6" fill={`url(#k${uid})`} fillOpacity=".3" />
        </g>
        <g transform="translate(14 14) scale(.5)">
          <path d={PUNGGEL.curl} strokeWidth="3" />
          <path d={PUNGGEL.lobes} strokeWidth="1.6" fill={`url(#k${uid})`} fillOpacity=".3" />
        </g>
        <circle cx="16" cy="16" r="3.2" fill={`url(#k${uid})`} stroke="none" />
      </g>
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Bunga Jepun (frangipani)                                            */
/* ------------------------------------------------------------------ */
export const Jepun = memo(function Jepun({ tone = 'white', ...p }: SvgProps & { tone?: 'white' | 'gold' }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg viewBox="-60 -60 120 120" aria-hidden="true" {...p}>
      <defs>
        <radialGradient id={`j${uid}`} cx="0" cy="0" r="52" gradientUnits="userSpaceOnUse">
          {tone === 'white' ? (
            <>
              <stop offset="0" stopColor="#f6c24a" />
              <stop offset=".28" stopColor="#ffe9a8" />
              <stop offset=".55" stopColor="#fffaf0" />
              <stop offset="1" stopColor="#fff3e0" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#f7e3a3" />
              <stop offset=".5" stopColor="#c9a24b" />
              <stop offset="1" stopColor="#8a6a24" />
            </>
          )}
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={PETAL} transform={`rotate(${a}) skewX(-8)`} fill={`url(#j${uid})`} stroke={tone === 'white' ? '#e9d6b0' : '#6b4f17'} strokeWidth=".6" strokeOpacity=".6" />
      ))}
      <circle r="4" fill={tone === 'white' ? '#e9a92a' : '#f7e3a3'} />
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Penjor                                                              */
/* ------------------------------------------------------------------ */
export const Penjor = memo(function Penjor(p: SvgProps) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 120 600" fill="none" aria-hidden="true" {...p}>
      <defs>
        <PradaGradient id={`pj${uid}`} angle={90} />
        <linearGradient id={`jn${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8d48f" />
          <stop offset="1" stopColor="#8fa35a" />
        </linearGradient>
      </defs>
      <path d={PENJOR.pole} stroke={`url(#pj${uid})`} strokeWidth="3.2" strokeLinecap="round" />
      <path d={PENJOR.pole} stroke="#000" strokeOpacity=".35" strokeWidth="1" transform="translate(1.5 0)" />
      <path d={PENJOR.tassels} stroke={`url(#jn${uid})`} strokeWidth="1.4" strokeLinecap="round" opacity=".85" />
      <path d={PENJOR.sampian} stroke={`url(#pj${uid})`} strokeWidth="1.5" fill={`url(#jn${uid})`} fillOpacity=".18" />
    </svg>
  )
})

/* ------------------------------------------------------------------ */
/* Janur (garis waktu)                                                 */
/* ------------------------------------------------------------------ */
export function Janur({ length = 600, ...p }: SvgProps & { length?: number }) {
  return (
    <svg viewBox={`0 -12 ${length} 24`} preserveAspectRatio="none" fill="none" aria-hidden="true" {...p}>
      <path d={janurStrip(length)} stroke="#a9b96e" strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Divider bertema                                                     */
/* ------------------------------------------------------------------ */
export function Divider({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 240 24" className={className} fill="none" aria-hidden="true">
      <defs>
        <PradaGradient id={`d${uid}`} />
      </defs>
      <path d="M0 12 H92 M148 12 H240" stroke={`url(#d${uid})`} strokeWidth="1" />
      <path d="M120 2 L130 12 L120 22 L110 12Z" stroke={`url(#d${uid})`} strokeWidth="1.2" />
      <path d="M120 7 L125 12 L120 17 L115 12Z" fill={`url(#d${uid})`} />
      <circle cx="100" cy="12" r="2" fill={`url(#d${uid})`} />
      <circle cx="140" cy="12" r="2" fill={`url(#d${uid})`} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Pola kain (dipakai sebagai background SVG)                          */
/* ------------------------------------------------------------------ */
/** Kain poleng: kotak-kotak hitam putih (rwa bhineda). */
export function PolengPattern({ size = 14, opacity = 1, className = '' }: { size?: number; opacity?: number; className?: string }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg className={className} aria-hidden="true" width="100%" height="100%" style={{ opacity }}>
      <defs>
        <pattern id={`pl${uid}`} width={size * 2} height={size * 2} patternUnits="userSpaceOnUse">
          <rect width={size * 2} height={size * 2} fill="#0b0807" />
          <rect width={size} height={size} fill="#efe6d4" />
          <rect x={size} y={size} width={size} height={size} fill="#efe6d4" />
          <rect x={size} width={size} height={size} fill="#6d6a63" opacity=".5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#pl${uid})`} />
    </svg>
  )
}

/** Songket/endek prada: belah ketupat & bintang emas di atas marun. */
export function SongketPattern({ className = '', opacity = 1, size = 28 }: { className?: string; opacity?: number; size?: number }) {
  const uid = useId().replace(/:/g, '')
  const s = size
  return (
    <svg className={className} aria-hidden="true" width="100%" height="100%" style={{ opacity }}>
      <defs>
        <PradaGradient id={`sg${uid}`} angle={45} />
        <pattern id={`sp${uid}`} width={s} height={s} patternUnits="userSpaceOnUse">
          <path d={`M${s / 2} 1 L${s - 1} ${s / 2} L${s / 2} ${s - 1} L1 ${s / 2}Z`} fill="none" stroke={`url(#sg${uid})`} strokeWidth=".8" />
          <path d={`M${s / 2} ${s * 0.32} L${s * 0.68} ${s / 2} L${s / 2} ${s * 0.68} L${s * 0.32} ${s / 2}Z`} fill={`url(#sg${uid})`} />
          <circle cx="0" cy="0" r="1.4" fill={`url(#sg${uid})`} />
          <circle cx={s} cy="0" r="1.4" fill={`url(#sg${uid})`} />
          <circle cx="0" cy={s} r="1.4" fill={`url(#sg${uid})`} />
          <circle cx={s} cy={s} r="1.4" fill={`url(#sg${uid})`} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#sp${uid})`} />
    </svg>
  )
}

/** Pita patra sari berulang (untuk transisi "menyapu" & bingkai). */
export function PatraBand({ className = '', height = 40, vertical = false }: { className?: string; height?: number; vertical?: boolean }) {
  const uid = useId().replace(/:/g, '')
  const w = 80
  return (
    <svg className={className} aria-hidden="true" width={vertical ? height : '100%'} height={vertical ? '100%' : height} preserveAspectRatio="none">
      <defs>
        <PradaGradient id={`pb${uid}`} angle={45} />
        <pattern id={`pp${uid}`} width={w} height={height} patternUnits="userSpaceOnUse" patternTransform={vertical ? `rotate(90) translate(0 ${-height})` : undefined}>
          <g stroke={`url(#pb${uid})`} fill="none" strokeWidth="1.2" strokeLinecap="round">
            <path d={`M0 ${height / 2} C${w * 0.2} ${height * 0.05} ${w * 0.3} ${height * 0.95} ${w / 2} ${height / 2} S${w * 0.8} ${height * 0.05} ${w} ${height / 2}`} />
            <circle cx={w / 2} cy={height / 2} r={height * 0.12} fill={`url(#pb${uid})`} />
            <path d={`M${w / 2} ${height / 2} m0 ${-height * 0.32} q${height * 0.18} ${height * 0.2} 0 ${height * 0.64} q${-height * 0.18} ${-height * 0.2} 0 ${-height * 0.64}`} />
            <path d={`M${w * 0.22} ${height * 0.3} q-6 -6 -1 -12 M${w * 0.78} ${height * 0.7} q6 6 1 12`} />
          </g>
          <path d={`M0 1 H${w} M0 ${height - 1} H${w}`} stroke={`url(#pb${uid})`} strokeWidth=".8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#pp${uid})`} />
    </svg>
  )
}

/** Bingkai lengkung gapura (kori) untuk foto. */
export function ArchFrame({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 200 280" className={className} fill="none" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <PradaGradient id={`af${uid}`} angle={90} />
      </defs>
      <path d="M6 276 V96 C6 44 48 6 100 6 C152 6 194 44 194 96 V276" stroke={`url(#af${uid})`} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      <path d="M14 276 V100 C14 54 52 14 100 14 C148 14 186 54 186 100 V276" stroke={`url(#af${uid})`} strokeWidth=".8" strokeOpacity=".55" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Ikon ornamen kecil untuk navigasi. */
export const NavIcons: Record<string, (p: SvgProps) => React.ReactElement> = {
  opening: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M12 3 C9 7 9 10 12 12 C15 10 15 7 12 3Z M12 12 V21 M7 21 H17 M8 14 Q12 17 16 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  countdown: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9 V13 L15 15 M9 3 H15" strokeLinecap="round" />
    </svg>
  ),
  couple: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
    </svg>
  ),
  story: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M3 12 H21 M6 12 L8 15 L10 12 M14 12 L16 9 L18 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  events: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M4 21 V9 L8 9 L8 5 L12 3 L16 5 L16 9 L20 9 V21 Z M10 21 V15 H14 V21" strokeLinejoin="round" />
    </svg>
  ),
  live: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path d="M17 10 L21 8 V16 L17 14" strokeLinejoin="round" />
    </svg>
  ),
  gallery: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M5 20 V10 C5 6 8 3 12 3 C16 3 19 6 19 10 V20 Z" />
      <path d="M5 17 L10 12 L14 16 L16 14 L19 17" strokeLinejoin="round" />
    </svg>
  ),
  gift: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M3 10 L12 15 L21 10" strokeLinejoin="round" />
    </svg>
  ),
  rsvp: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M4 5 H20 V16 H10 L6 20 V16 H4 Z" strokeLinejoin="round" />
      <path d="M8 9 H16 M8 12 H13" strokeLinecap="round" />
    </svg>
  ),
  closing: (p) => (
    <svg viewBox="-60 -60 120 120" fill="currentColor" {...p}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={PETAL} transform={`rotate(${a}) scale(1.05)`} />
      ))}
    </svg>
  ),
}
