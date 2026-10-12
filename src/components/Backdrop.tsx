import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import type { VideoSource } from '@/config/types'
import { networkQuality } from '@/hooks/useEnv'
import { photoUrl } from '@/lib/media'
import { coupleOrder } from '@/lib/couple'
import { dotDate } from '@/lib/format'
import { toAksaraBali } from '@/lib/aksara'
import { CandiBentar, Divider } from '@/ornaments'

/**
 * Latar sinematik: video prewedding (atau foto / ambient emas sebagai fallback).
 * Mobile: layar penuh di belakang konten. Desktop: panel kiri (layout split).
 */
export default function Backdrop() {
  const { active, reduced, opened } = useApp()
  const lowNet = useMemo(() => networkQuality() === 'low', [])
  const per = wedding.video.perSection ?? {}
  const current: VideoSource = per[active] ?? wedding.video.background
  const useVideo = !lowNet && !reduced && !!(current.mp4 || current.webm)
  const poster = photoUrl(current.poster || wedding.photos.hero, 1280)

  return (
    <div className="fixed inset-y-0 left-0 right-0 z-0 overflow-hidden lg:right-[var(--invite-w)]" aria-hidden="true">
      {/* ambient emas (selalu ada sebagai dasar) */}
      <Ambient />
      {poster && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" decoding="async" />}
      {useVideo && opened && <CrossfadeVideo source={current} poster={poster} />}
      {/* overlay agar teks terbaca */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,8,7,.6)_0%,rgba(11,8,7,.3)_35%,rgba(11,8,7,.5)_65%,rgba(11,8,7,.94)_100%)]" />
      <div className="vignette absolute inset-0" />
      <div className="grain absolute inset-0" />
      <StageInfo />
    </div>
  )
}

function Ambient() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_100%,#4a0e12_0%,#1a0a08_55%,#0b0807_100%)]">
      <div
        className="absolute -left-1/4 top-1/4 h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(201,162,75,.22),transparent_65%)]"
        style={{ animation: 'float-y 9s ease-in-out infinite' }}
      />
      <div
        className="absolute -right-1/4 bottom-0 h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(201,162,75,.16),transparent_65%)]"
        style={{ animation: 'float-y 12s ease-in-out -4s infinite' }}
      />
      {/* siluet gerbang samar */}
      <div className="absolute inset-x-0 bottom-0 flex h-[70%] justify-center opacity-[.18]">
        <div className="relative h-full w-[42%]">
          <CandiBentar side="left" glow={false} className="absolute bottom-0 right-0 h-full w-auto max-w-none" />
        </div>
        <div className="relative h-full w-[42%]">
          <CandiBentar side="right" glow={false} className="absolute bottom-0 left-0 h-full w-auto max-w-none" />
        </div>
      </div>
    </div>
  )
}

/** Dua <video> bergantian untuk crossfade antar section. Pause saat tab tersembunyi / tak terlihat. */
function CrossfadeVideo({ source, poster }: { source: VideoSource; poster?: string }) {
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]
  const [slots, setSlots] = useState<[VideoSource | null, VideoSource | null]>([source, null])
  const [front, setFront] = useState(0)
  const key = (s: VideoSource | null) => (s ? `${s.mp4}|${s.webm}` : '')

  useEffect(() => {
    if (key(slots[front]) === key(source)) return
    const back = front === 0 ? 1 : 0
    setSlots((s) => {
      const n: [VideoSource | null, VideoSource | null] = [...s]
      n[back] = source
      return n
    })
    setFront(back)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])

  useEffect(() => {
    const onVis = () => {
      refs.forEach((r, i) => {
        const v = r.current
        if (!v) return
        if (document.hidden || i !== front) v.pause()
        else void v.play().catch(() => {})
      })
    }
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front, slots])

  return (
    <>
      {slots.map((s, i) =>
        s ? (
          <video
            key={key(s) + i}
            ref={refs[i]}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms]"
            style={{ opacity: i === front ? 1 : 0 }}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={photoUrl(s.poster, 1280) ?? poster}
            disablePictureInPicture
            disableRemotePlayback
          >
            {s.webm && <source src={s.webm} type="video/webm" />}
            {s.mp4 && <source src={s.mp4} type="video/mp4" />}
          </video>
        ) : null,
      )}
    </>
  )
}

/** Info besar di panel kiri desktop. */
function StageInfo() {
  const { c } = useApp()
  const [a, b] = coupleOrder()
  const ev = wedding.events[0]
  return (
    <div className="absolute inset-0 hidden flex-col items-center justify-end pb-[10vh] text-center lg:flex">
      <p className="eyebrow">{c(wedding.eventTitle)}</p>
      <p className="aksara text-prada mt-2 text-3xl">{`${a.aksara || toAksaraBali(a.nick)} ᭞ ${b.aksara || toAksaraBali(b.nick)}`}</p>
      <h2 className="display-name text-prada is-shimmer mt-2 text-[clamp(4rem,7vw,7.5rem)]">
        {a.nick} <span className="font-display text-[.4em] not-italic align-middle">&amp;</span> {b.nick}
      </h2>
      <Divider className="my-5 w-56" />
      {ev && <p className="font-display text-sm tracking-[0.5em] text-gading-dim">{dotDate(ev.start, ev.tzLabel)}</p>}
    </div>
  )
}
