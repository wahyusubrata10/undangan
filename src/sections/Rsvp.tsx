import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section, SectionTitle } from '@/components/Section'
import { Jepun, PatraCorner } from '@/ornaments'
import { relativeTime } from '@/lib/format'
import { emptyStats, getGuestbook, LIMITS, type Attendance, type Stats, type SubmitError, type Wish } from '@/services/guestbook'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

function StatBar({ stats }: { stats: Stats }) {
  const { t } = useApp()
  const total = Math.max(1, stats.yes + stats.no + stats.maybe)
  const rows: [string, number, string][] = [
    [t.attending, stats.yes, 'bg-[linear-gradient(90deg,#8a6a24,#f1d58a)]'],
    [t.maybe, stats.maybe, 'bg-janur'],
    [t.notAttending, stats.no, 'bg-[#6d2a2e]'],
  ]
  return (
    <div className="glass rounded-[22px] p-5" data-reveal="up">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-hitam/60">
        {rows.map(([label, n, cls]) => (
          <span key={label} className={`${cls} h-full transition-[width] duration-1000 ease-[cubic-bezier(.16,1,.3,1)]`} style={{ width: `${(n / total) * 100}%` }} />
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {rows.map(([label, n]) => (
          <div key={label}>
            <dd className="font-display text-2xl text-prada-light">{n}</dd>
            <dt className="text-[10px] uppercase tracking-[0.15em] text-gading-dim">{label}</dt>
          </div>
        ))}
      </dl>
      {stats.guests > 0 && (
        <p className="mt-3 text-center text-[12px] text-gading-dim">
          ± {stats.guests} {t.guestCount.toLowerCase()}
        </p>
      )}
    </div>
  )
}

export default function Rsvp() {
  const { t, c, guest, lang } = useApp()
  const gb = useMemo(() => getGuestbook(), [])
  const size = wedding.rsvp.pageSize
  const shownAt = useRef(Date.now())

  const [name, setName] = useState(guest.personalized ? guest.name : '')
  const [attendance, setAttendance] = useState<Attendance>('yes')
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | SubmitError>('idle')

  const [items, setItems] = useState<Wish[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [stats, setStats] = useState<Stats>(emptyStats())
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    async (p: number) => {
      setLoading(true)
      try {
        const [l, s] = await Promise.all([gb.list(p, size), gb.stats()])
        setItems(l.items)
        setTotal(l.total)
        setStats(s)
      } catch {
        /* backend belum siap */
      } finally {
        setLoading(false)
      }
    },
    [gb, size],
  )

  useEffect(() => {
    void load(page)
  }, [load, page])

  // realtime: ucapan baru masuk di halaman pertama
  useEffect(
    () =>
      gb.subscribe((w) => {
        setItems((prev) => (prev.some((x) => x.id === w.id) ? prev : page === 0 ? [w, ...prev].slice(0, size) : prev))
        setTotal((n) => n + 1)
        void gb.stats().then(setStats)
      }),
    [gb, page, size],
  )

  const pages = Math.max(1, Math.ceil(total / size))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    const res = await gb.submit({ name, attendance, guests, message, website, elapsed: Date.now() - shownAt.current })
    if (res.ok) {
      setStatus('sent')
      setMessage('')
      setPage(0)
      setItems((prev) => (prev.some((x) => x.id === res.wish.id) ? prev : [res.wish, ...prev].slice(0, size)))
      setTotal((n) => n + 1)
      void gb.stats().then(setStats)
    } else setStatus(res.error)
  }

  const errText: Record<SubmitError, string> = { invalid: t.rsvpInvalid, rate: t.rsvpRateLimited, fast: t.rsvpTooFast, server: t.rsvpError }
  const attOpts: [Attendance, string][] = [
    ['yes', t.attending],
    ['maybe', t.maybe],
    ['no', t.notAttending],
  ]

  if (!wedding.rsvp.enabled) return null

  return (
    <Section id="rsvp" sweep label={t.nav.rsvp} bg="lontar" className="px-5 py-28">
      <div className="relative mx-auto max-w-md">
        <SectionTitle eyebrow={t.rsvpSub} title={t.rsvpTitle} />

        <form onSubmit={submit} className="relative overflow-hidden rounded-[28px] border border-prada/30 bg-[linear-gradient(170deg,#25090c,#120a08)] p-6 shadow-[0_40px_80px_-40px_#000]" data-reveal="up" noValidate>
          <PatraCorner className="pointer-events-none absolute right-2 top-2 w-14 rotate-90 opacity-70" />
          <label className="block">
            <span className="eyebrow !text-[10px]">{t.name}</span>
            <input className="field mt-2" value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.name} placeholder={t.namePlaceholder} autoComplete="name" required />
          </label>

          <fieldset className="mt-5">
            <legend className="eyebrow !text-[10px]">{t.attendance}</legend>
            <div className="relative mt-2 grid grid-cols-3 gap-1 rounded-full border border-prada/30 bg-hitam/60 p-1" role="radiogroup">
              {attOpts.map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={attendance === v}
                  onClick={() => setAttendance(v)}
                  className={`relative z-10 rounded-full px-2 py-2.5 text-[12px] font-semibold transition-colors duration-300 ${attendance === v ? 'text-hitam' : 'text-gading-dim'}`}
                >
                  {attendance === v && <motion.span layoutId="att-pill" className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(135deg,#b58c38,#f1d58a_50%,#c9a24b)]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <AnimatePresence initial={false}>
            {attendance === 'yes' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                <div className="mt-5 flex items-center justify-between">
                  <span className="eyebrow !text-[10px]">{t.guestCount}</span>
                  <div className="flex items-center gap-3">
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-prada/40 text-prada-light disabled:opacity-30" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="-1">
                      −
                    </button>
                    <span className="w-6 text-center font-display text-xl text-prada-light" aria-live="polite">
                      {guests}
                    </span>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-prada/40 text-prada-light disabled:opacity-30" onClick={() => setGuests((g) => Math.min(wedding.rsvp.maxGuests, g + 1))} disabled={guests >= wedding.rsvp.maxGuests} aria-label="+1">
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <label className="mt-5 block">
            <span className="eyebrow !text-[10px]">{t.message}</span>
            <textarea className="field mt-2 min-h-28 resize-y" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={LIMITS.message} placeholder={t.messagePlaceholder} required />
            <span className="mt-1 block text-right text-[10px] text-gading-dim/60">
              {message.length}/{LIMITS.message}
            </span>
          </label>

          {/* honeypot: tersembunyi dari manusia */}
          <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>

          <button type="submit" className="btn-prada mt-4 w-full" disabled={status === 'sending'}>
            {status === 'sending' ? t.sending : t.send}
          </button>

          <div aria-live="polite" className="min-h-6">
            <AnimatePresence mode="wait">
              {status !== 'idle' && status !== 'sending' && (
                <motion.p key={status} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-3 text-center text-[13px] ${status === 'sent' ? 'text-janur' : 'text-red-300'}`}>
                  {status === 'sent' ? t.thanksRsvp : errText[status]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          {gb.mode === 'demo' && <p className="mt-2 text-center text-[10px] text-gading-dim/50">{t.demoMode}</p>}
        </form>

        <div className="mt-10">
          <StatBar stats={stats} />
        </div>

        <div className="mt-8">
          <p className="mb-4 text-center font-display text-[11px] tracking-[0.3em] text-gading-dim uppercase">
            {total} {t.wishes}
          </p>
          <ul className="flex flex-col gap-3" aria-busy={loading}>
            {items.length === 0 && !loading && (
              <li className="glass flex flex-col items-center gap-3 rounded-[22px] p-8 text-center text-[13px] text-gading-dim">
                <Jepun className="w-10" />
                {t.noWishes}
              </li>
            )}
            <AnimatePresence initial={false}>
              {items.map((w) => (
                <motion.li
                  key={w.id}
                  layout
                  initial={{ opacity: 0, x: -24, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="glass rounded-[22px] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#4a0e12,#8a6a24)] font-display text-[13px] text-gading">{initials(w.name)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <p className="truncate font-semibold text-gading">{w.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${w.attendance === 'yes' ? 'bg-prada/20 text-prada-light' : w.attendance === 'maybe' ? 'bg-janur/20 text-janur' : 'bg-red-900/30 text-red-200'}`}>
                          {w.attendance === 'yes' ? t.attending : w.attendance === 'maybe' ? t.maybe : t.notAttending}
                        </span>
                      </div>
                      <p className="mt-1.5 whitespace-pre-line break-words text-[13.5px] leading-relaxed text-gading/85">{w.message}</p>
                      <p className="mt-2 text-[10px] text-gading-dim/60">{relativeTime(w.created_at, t, lang)}</p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-2" aria-label={t.page}>
              <button type="button" className="btn-ghost !px-3 !py-2" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label={t.prev}>
                ‹
              </button>
              <span className="px-2 font-display text-[12px] text-gading-dim">
                {page + 1} / {pages}
              </span>
              <button type="button" className="btn-ghost !px-3 !py-2" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} aria-label={t.next}>
                ›
              </button>
            </nav>
          )}
        </div>
        <p className="sr-only">{c(wedding.meta.title)}</p>
      </div>
    </Section>
  )
}
