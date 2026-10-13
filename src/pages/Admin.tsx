import { useCallback, useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { wedding } from '@/config/wedding'
import { tx } from '@/lib/i18nText'
import { formatDateLong, formatTime } from '@/lib/format'
import { buildMessage, download, linkFor, parseGuestList, toCsv, waUrl } from '@/lib/admin'
import { Canang, Jepun } from '@/ornaments'
import type { Wish } from '@/services/guestbook'

type Auth = 'checking' | 'out' | 'in' | 'dev'

const LS_LIST = 'admin_guest_list'
const LS_BASE = 'admin_base_url'

function lsGet(k: string, d = '') {
  try {
    return localStorage.getItem(k) ?? d
  } catch {
    return d
  }
}
function lsSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* abaikan */
  }
}

export default function Admin() {
  const [auth, setAuth] = useState<Auth>('checking')
  const [tab, setTab] = useState<'links' | 'rsvp'>('links')

  useEffect(() => {
    document.title = 'Admin · Undangan'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    fetch('/api/admin-login', { credentials: 'same-origin' })
      .then((r) => {
        const isJson = r.headers.get('content-type')?.includes('json')
        if (r.ok && isJson) setAuth('in')
        else if (!isJson && import.meta.env.DEV) setAuth('dev') // `npm run dev` tidak menjalankan /api
        else setAuth('out')
      })
      .catch(() => setAuth(import.meta.env.DEV ? 'dev' : 'out'))
  }, [])

  if (auth === 'checking') return <Shell />
  if (auth === 'out') return <Login onIn={() => setAuth('in')} />

  return (
    <Shell>
      {auth === 'dev' && (
        <p className="mb-6 rounded-xl border border-emas/40 bg-malam-2 p-3 text-[13px] text-gading">
          Mode pengembangan: API Vercel tidak berjalan di <code>npm run dev</code>, login dilewati. Di produksi halaman ini dilindungi password (<code>ADMIN_PASSWORD</code>).
        </p>
      )}
      <div className="mb-6 flex gap-2">
        {(
          [
            ['links', 'Link Tamu & QR'],
            ['rsvp', 'Data RSVP'],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm transition-colors ${tab === k ? 'bg-emas text-malam' : 'bg-gading/[.05] text-gading-soft hover:bg-gading/10'}`}>
            {label}
          </button>
        ))}
        <button
          type="button"
          className="ml-auto text-xs text-gading-soft underline"
          onClick={async () => {
            await fetch('/api/admin-login', { method: 'DELETE' }).catch(() => {})
            setAuth('out')
          }}
        >
          Keluar
        </button>
      </div>
      {tab === 'links' ? <LinkGenerator /> : <RsvpTable />}
    </Shell>
  )
}

function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-malam text-gading">
      <header className="border-b border-gading/10 bg-malam-2">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-5">
          <Jepun className="w-8" />
          <div>
            <p className="label">Panel Admin</p>
            <h1 className="font-display text-2xl italic text-gading">
              {wedding.groom.nick} &amp; {wedding.bride.nick}
            </h1>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  )
}

function Login({ onIn }: { onIn: () => void }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const r = await fetch('/api/admin-login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) })
      if (r.ok) onIn()
      else if (r.status === 503) setErr('ADMIN_PASSWORD belum diatur di Vercel → Settings → Environment Variables.')
      else setErr('Password salah.')
    } catch {
      setErr('Tidak dapat terhubung ke server.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Shell>
      <form onSubmit={submit} className="soft mx-auto mt-10 max-w-sm rounded-3xl p-8 text-center">
        <Canang className="mx-auto w-14" />
        <h2 className="mt-3 font-display text-2xl italic text-gading-mute">Masuk Admin</h2>
        <input type="password" className="field mt-6" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus autoComplete="current-password" />
        <button className="btn mt-4 w-full" disabled={busy || !pw}>
          {busy ? 'Memeriksa…' : 'Masuk'}
        </button>
        {err && <p className="mt-3 text-sm text-[#a34a3a]">{err}</p>}
      </form>
    </Shell>
  )
}

/* ------------------------------------------------------------------ */

function LinkGenerator() {
  const defaultSal = tx(wedding.guest.defaultSalutation, 'id')
  const [base, setBase] = useState(() => lsGet(LS_BASE) || wedding.meta.siteUrl || location.origin)
  const [list, setList] = useState(() => lsGet(LS_LIST, 'Wayan Sudarma | Bapak/Ibu | 081234567890\nIbu Ketut Ayu\nI Made Agus & Keluarga | Bapak/Ibu/Saudara/i'))
  const [template, setTemplate] = useState(() => tx(wedding.share.whatsappTemplate, 'id'))
  const [qrs, setQrs] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState('')

  useEffect(() => lsSet(LS_LIST, list), [list])
  useEffect(() => lsSet(LS_BASE, base), [base])

  const ev = wedding.events[0]
  const tanggal = ev ? `${formatDateLong(ev.start, 'id', ev.tzLabel)}, ${formatTime(ev.start, 'id', ev.tzLabel)} ${ev.tzLabel}` : ''
  const mempelai = `${wedding.groom.nick} & ${wedding.bride.nick}`

  const rows = useMemo(() => {
    let validBase = base
    try {
      new URL(base)
    } catch {
      validBase = location.origin
    }
    return parseGuestList(list, defaultSal).map((r) => {
      const link = linkFor(validBase, r, defaultSal)
      const message = buildMessage(template, { sapaan: r.salutation, nama: r.name, link, mempelai, tanggal })
      return { ...r, link, message }
    })
  }, [list, base, template, defaultSal, mempelai, tanggal])

  // QR per tamu (berisi link personal → bisa dipindai untuk check-in di lokasi)
  useEffect(() => {
    let cancelled = false
    void Promise.all(rows.map(async (r) => [r.link, await QRCode.toDataURL(r.link, { margin: 1, width: 320, color: { dark: '#3b2f25', light: '#fffdf8' }, errorCorrectionLevel: 'M' })] as const)).then((pairs) => {
      if (!cancelled) setQrs(Object.fromEntries(pairs))
    })
    return () => {
      cancelled = true
    }
  }, [rows])

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(''), 1500)
    } catch {
      /* abaikan */
    }
  }

  const exportCsv = () =>
    download(
      `link-tamu-${mempelai.replace(/\W+/g, '-').toLowerCase()}.csv`,
      toCsv(
        ['No', 'Nama', 'Sapaan', 'Telepon', 'Link', 'Pesan WhatsApp'],
        rows.map((r, i) => [i + 1, r.name, r.salutation, r.phone, r.link, r.message]),
      ),
    )

  const printQr = () => {
    const w = window.open('', '_blank')
    if (!w) return
    const cards = rows
      .map(
        (r) =>
          `<div class="c"><img src="${qrs[r.link] ?? ''}"/><b>${r.name.replace(/[<>&]/g, '')}</b><small>${r.salutation.replace(/[<>&]/g, '')}</small></div>`,
      )
      .join('')
    w.document.write(
      `<!doctype html><title>QR Tamu</title><style>body{font-family:Georgia,serif;margin:12mm;color:#2a0709}h1{font-weight:normal;font-style:italic;text-align:center}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:8mm}.c{border:1px solid #c9a24b;border-radius:8px;padding:4mm;text-align:center;break-inside:avoid}.c img{width:100%}.c b{display:block;font-size:12px;margin-top:2mm}.c small{font-size:10px;color:#7a5a2e}</style><h1>${mempelai.replace(/[<>&]/g, '')} — QR Check-in</h1><div class="g">${cards}</div><script>setTimeout(()=>print(),400)<\/script>`,
    )
    w.document.close()
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
      <section className="space-y-5">
        <label className="block">
          <span className="label !text-[10px]">URL undangan</span>
          <input className="field mt-2 !border !border-gading/15 !rounded-lg !px-3" value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://wahyu-diah.vercel.app" />
        </label>
        <label className="block">
          <span className="label !text-[10px]">Daftar tamu (satu per baris)</span>
          <textarea className="field mt-2 !border !border-gading/15 !rounded-lg !px-3 min-h-56 font-mono text-[13px]" value={list} onChange={(e) => setList(e.target.value)} spellCheck={false} />
          <span className="mt-1 block text-[11px] leading-relaxed text-gading-soft">
            Format: <code>Nama | Sapaan | No. WA</code> (sapaan & nomor opsional). Bisa juga salin kolom langsung dari Excel/Google Sheets. Sapaan default: “{defaultSal}”.
          </span>
        </label>
        <label className="block">
          <span className="label !text-[10px]">Template pesan WhatsApp</span>
          <textarea className="field mt-2 !border !border-gading/15 !rounded-lg !px-3 min-h-56 text-[13px]" value={template} onChange={(e) => setTemplate(e.target.value)} />
          <span className="mt-1 block text-[11px] text-gading-soft">
            Placeholder: <code>{'{sapaan} {nama} {link} {mempelai} {tanggal}'}</code>. Ubah default-nya di <code>wedding.ts → share</code>.
          </span>
        </label>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="mr-auto text-sm text-gading-soft">
            <b className="text-gading">{rows.length}</b> tamu
          </p>
          <button type="button" className="btn-line" onClick={exportCsv} disabled={!rows.length}>
            Export CSV
          </button>
          <button type="button" className="btn-line" onClick={printQr} disabled={!rows.length}>
            Cetak QR
          </button>
        </div>
        <ul className="space-y-3">
          {rows.map((r, i) => (
            <li key={r.link} className="soft flex gap-4 rounded-2xl p-4">
              {qrs[r.link] ? (
                <a href={qrs[r.link]} download={`qr-${r.name.replace(/\W+/g, '-').toLowerCase()}.png`} title="Unduh QR" className="shrink-0">
                  <img src={qrs[r.link]} alt={`QR ${r.name}`} className="h-24 w-24 rounded-lg" />
                </a>
              ) : (
                <div className="h-24 w-24 shrink-0 rounded-lg bg-gading/5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gading">
                  <span className="mr-2 text-gading-soft">{i + 1}.</span>
                  {r.name}
                </p>
                <p className="text-[12px] text-gading-soft">
                  {r.salutation}
                  {r.phone && ` · +${r.phone}`}
                </p>
                <p className="mt-1 truncate font-mono text-[12px] text-gading-mute">{r.link}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="btn !px-4 !py-2 !text-[10px]" href={waUrl(r.message, r.phone || undefined)} target="_blank" rel="noopener noreferrer">
                    Kirim WA
                  </a>
                  <button type="button" className="btn-line !px-3 !py-2 !text-[10px]" onClick={() => copy(r.message, `m${i}`)}>
                    {copied === `m${i}` ? '✓ Tersalin' : 'Salin pesan'}
                  </button>
                  <button type="button" className="btn-line !px-3 !py-2 !text-[10px]" onClick={() => copy(r.link, `l${i}`)}>
                    {copied === `l${i}` ? '✓ Tersalin' : 'Salin link'}
                  </button>
                  <a className="btn-line !px-3 !py-2 !text-[10px]" href={r.link} target="_blank" rel="noopener noreferrer">
                    Pratinjau
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function RsvpTable() {
  const [items, setItems] = useState<Wish[] | null>(null)
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin-rsvp')
      const j = (await r.json()) as { items?: Wish[]; error?: string }
      setItems(j.items ?? [])
      setNote(j.error ?? '')
    } catch {
      setItems([])
      setNote('API tidak tersedia (jalankan di Vercel / `vercel dev`).')
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])

  const remove = async (id: string) => {
    if (!confirm('Hapus ucapan ini?')) return
    await fetch(`/api/admin-rsvp?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    void load()
  }

  const stats = useMemo(() => {
    const s = { yes: 0, no: 0, maybe: 0, guests: 0 }
    items?.forEach((w) => {
      s[w.attendance]++
      if (w.attendance === 'yes') s.guests += w.guests
    })
    return s
  }, [items])

  const label = { yes: 'Hadir', no: 'Berhalangan', maybe: 'Ragu' } as const

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ['Hadir', stats.yes],
            ['Total orang', stats.guests],
            ['Ragu', stats.maybe],
            ['Berhalangan', stats.no],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="soft rounded-2xl p-4 text-center">
            <p className="font-display text-3xl text-gading">{v}</p>
            <p className="text-[11px] uppercase tracking-wider text-gading-soft">{k}</p>
          </div>
        ))}
      </div>
      <div className="mb-4 flex items-center gap-3">
        {note && <p className="mr-auto text-sm text-[#8a6a24]">{note}</p>}
        <button type="button" className="btn-line ml-auto" onClick={() => void load()}>
          Muat ulang
        </button>
        <button
          type="button"
          className="btn-line"
          disabled={!items?.length}
          onClick={() =>
            download(
              'rsvp.csv',
              toCsv(
                ['Waktu', 'Nama', 'Kehadiran', 'Jumlah', 'Ucapan'],
                (items ?? []).map((w) => [new Date(w.created_at).toLocaleString('id-ID'), w.name, label[w.attendance], w.guests, w.message]),
              ),
            )
          }
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gading/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-malam-2 text-[11px] uppercase tracking-wider text-gading-mute">
            <tr>
              <th className="p-3">Waktu</th>
              <th className="p-3">Nama</th>
              <th className="p-3">Kehadiran</th>
              <th className="p-3">Jml</th>
              <th className="p-3">Ucapan</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr>
                <td className="p-4 text-gading-soft" colSpan={6}>
                  Memuat…
                </td>
              </tr>
            )}
            {items?.length === 0 && (
              <tr>
                <td className="p-4 text-gading-soft" colSpan={6}>
                  Belum ada RSVP.
                </td>
              </tr>
            )}
            {items?.map((w) => (
              <tr key={w.id} className="border-t border-gading/10 align-top">
                <td className="whitespace-nowrap p-3 text-gading-soft">{new Date(w.created_at).toLocaleString('id-ID')}</td>
                <td className="p-3 font-semibold">{w.name}</td>
                <td className="p-3">{label[w.attendance]}</td>
                <td className="p-3">{w.guests}</td>
                <td className="max-w-md whitespace-pre-line p-3 text-gading-soft">{w.message}</td>
                <td className="p-3">
                  <button type="button" className="text-xs text-[#a34a3a] underline" onClick={() => void remove(w.id)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
