import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section, SectionTitle } from '@/components/Section'
import { FloralCorner } from '@/ornaments/scene'
import { relativeTime } from '@/lib/format'
import { getGuestbook, LIMITS, type Attendance, type PublicWish, type SubmitError } from '@/services/guestbook'

/**
 * 10 · Ucapan & Doa.
 * Tamu hanya melihat form + daftar ucapan (nama, ucapan, waktu).
 * Status kehadiran & statistik TIDAK ditampilkan (hanya di /admin).
 */
export default function Rsvp() {
  const { t, guest, lang } = useApp()
  const gb = useMemo(() => getGuestbook(), [])
  const size = wedding.rsvp.pageSize
  const shownAt = useRef(Date.now())

  const [name, setName] = useState(guest.personalized ? guest.name : '')
  const [attendance, setAttendance] = useState<Attendance>('yes')
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | SubmitError>('idle')

  const [items, setItems] = useState<PublicWish[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    async (p: number) => {
      setLoading(true)
      try {
        const l = await gb.list(p, size)
        setItems(l.items)
        setTotal(l.total)
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
  useEffect(() => gb.subscribe(() => void load(page)), [gb, page, load])

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
    <Section id="rsvp" tone="cream" label={t.nav.rsvp} className="overflow-hidden px-6 py-24 lg:py-36">
      <FloralCorner flip className="pointer-events-none absolute -left-4 -top-2 w-40 sm:w-56" />
      <SectionTitle label={t.rsvpSub} title={t.rsvpTitle} />

      <form onSubmit={submit} className="mx-auto mt-16 max-w-md" data-anim="up" noValidate>
        <label className="block">
          <span className="label !text-[12px]">{t.name}</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.name} placeholder={t.namePlaceholder} autoComplete="name" required />
        </label>

        <fieldset className="mt-8">
          <legend className="label !text-[12px]">{t.attendance}</legend>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup">
            {attOpts.map(([v, label]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={attendance === v}
                onClick={() => setAttendance(v)}
                className={`rounded-full px-4 py-2 text-[12.5px] transition-colors duration-300 ${attendance === v ? 'bg-ink text-ivory' : 'bg-ink/[.05] text-ink-soft hover:bg-ink/10'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <AnimatePresence initial={false}>
          {attendance === 'yes' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
              <div className="mt-8 flex items-center justify-between">
                <span className="label !text-[12px]">{t.guestCount}</span>
                <div className="flex items-center gap-4">
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-ink/[.06] text-ink disabled:opacity-30" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="-1">
                    −
                  </button>
                  <span className="display w-6 text-center text-2xl" aria-live="polite">
                    {guests}
                  </span>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-ink/[.06] text-ink disabled:opacity-30" onClick={() => setGuests((g) => Math.min(wedding.rsvp.maxGuests, g + 1))} disabled={guests >= wedding.rsvp.maxGuests} aria-label="+1">
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <label className="mt-8 block">
          <span className="label !text-[12px]">{t.message}</span>
          <textarea className="field min-h-28 resize-y" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={LIMITS.message} placeholder={t.messagePlaceholder} required />
        </label>

        {/* honeypot */}
        <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>

        <button type="submit" className="btn mt-10 w-full" disabled={status === 'sending'}>
          {status === 'sending' ? t.sending : t.send}
        </button>
        <p className="mt-3 text-center text-[12px] text-ink-mute">{t.rsvpPrivate}</p>
        <div aria-live="polite" className="min-h-6">
          <AnimatePresence mode="wait">
            {status !== 'idle' && status !== 'sending' && (
              <motion.p key={status} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-3 text-center text-[13px] ${status === 'sent' ? 'text-[#6f7a3e]' : 'text-[#a34a3a]'}`}>
                {status === 'sent' ? t.thanksRsvp : errText[status]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {gb.mode === 'demo' && <p className="mt-1 text-center text-[12px] text-ink-mute/70">{t.demoMode}</p>}
      </form>

      {/* daftar ucapan: nama + ucapan + waktu */}
      <div className="mx-auto mt-24 max-w-xl">
        <ul className="flex flex-col" aria-busy={loading}>
          {items.length === 0 && !loading && <li className="lead py-10 text-center !text-base">{t.noWishes}</li>}
          {items.map((w) => (
            <li key={w.id} className="border-t border-ink/10 py-8 first:border-t-0">
              <p className="lead !text-[1.12rem] !text-ink">“{w.message}”</p>
              <p className="mt-3 text-[12px] tracking-[0.12em] text-ink-soft">
                — {w.name} <span className="text-ink-mute">· {relativeTime(w.created_at, t, lang)}</span>
              </p>
            </li>
          ))}
        </ul>
        {pages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-4" aria-label={t.page}>
            <button type="button" className="btn-line !px-4" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label={t.prev}>
              ‹
            </button>
            <span className="text-[12px] tracking-[0.2em] text-ink-soft">
              {page + 1} / {pages}
            </span>
            <button type="button" className="btn-line !px-4" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} aria-label={t.next}>
              ›
            </button>
          </nav>
        )}
      </div>
    </Section>
  )
}
