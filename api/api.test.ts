import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { injectMeta, metaFor } from './_meta'

const html = readFileSync('index.html', 'utf8')

describe('meta OG per tamu', () => {
  it('judul memuat nama tamu & gambar OG absolut', () => {
    const m = metaFor('https://wd.id/?to=bapak+wayan&sapaan=Bapak%2FIbu')
    expect(m.title).toBe('Kepada Yth. Bapak/Ibu Bapak Wayan — Undangan Pawiwahan Wahyu & Diah')
    expect(m.image).toBe('https://wd.id/api/og?to=Bapak+Wayan&sapaan=Bapak%2FIbu')
    const out = injectMeta(html, m)
    expect(out).toContain('<title>Kepada Yth. Bapak/Ibu Bapak Wayan — Undangan Pawiwahan Wahyu &amp; Diah</title>')
    expect(out).toContain('<meta property="og:image" content="https://wd.id/api/og?to=Bapak+Wayan&amp;sapaan=Bapak%2FIbu" />')
    expect(out.match(/og:title/g)?.length).toBe(1)
  })
  it('tanpa nama → judul default dengan tanggal', () => {
    expect(metaFor('https://wd.id/').title).toBe('Undangan Pawiwahan Wahyu & Diah · 01.01.2027')
  })
  it('nama berbahaya tidak bisa menyuntik HTML', () => {
    const out = injectMeta(html, metaFor('https://wd.id/?to=%22%3E%3Cscript%3Ealert(1)%3C/script%3E'))
    expect(out).not.toContain('<script>alert')
    expect(out).not.toMatch(/content="[^"]*"[^/>]*><script/)
  })
})

describe('api/rsvp', () => {
  const post = (body: unknown, headers: Record<string, string> = {}) =>
    new Request('https://wd.id/api/rsvp', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': '1.2.3.4', ...headers }, body: JSON.stringify(body) })
  const valid = { name: 'Wayan', attendance: 'yes', guests: 2, message: 'Selamat!', website: '', elapsed: 5000 }

  it('menolak metode selain GET/POST; GET tanpa database → mode none (klien pakai mode demo)', async () => {
    const { default: rsvp } = await import('./rsvp')
    expect((await rsvp(new Request('https://wd.id/api/rsvp', { method: 'PUT' }))).status).toBe(405)
    expect(await (await rsvp(new Request('https://wd.id/api/rsvp'))).json()).toEqual({ mode: 'none' })
  })
  it('honeypot terisi → pura-pura sukses tanpa menyimpan', async () => {
    const { default: rsvp } = await import('./rsvp')
    const res = await rsvp(post({ ...valid, website: 'spam.com' }))
    expect(res.status).toBe(200)
  })
  it('isi terlalu cepat → ditolak', async () => {
    const { default: rsvp } = await import('./rsvp')
    const res = await rsvp(post({ ...valid, elapsed: 500 }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'fast' })
  })
  it('data tidak valid → ditolak', async () => {
    const { default: rsvp } = await import('./rsvp')
    expect((await rsvp(post({ ...valid, name: '<b></b>' }))).status).toBe(400)
    expect((await rsvp(post({ ...valid, guests: 99 }))).status).toBe(400)
    expect((await rsvp(post({ ...valid, attendance: 'hack' }))).status).toBe(400)
  })
  it('tanpa Supabase → 503', async () => {
    const { default: rsvp } = await import('./rsvp')
    expect((await rsvp(post(valid))).status).toBe(503)
  })
  it('rate limit per IP & penyimpanan via Supabase REST', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service')
    const calls: string[] = []
    let count = 0
    vi.stubGlobal('fetch', async (u: string, init?: RequestInit) => {
      calls.push(`${init?.method ?? 'GET'} ${u.split('?')[0]}`)
      if (u.includes('rsvp_ratelimit') && (!init || init.method !== 'POST')) return new Response('[]', { headers: { 'content-range': `0-0/${count}` } })
      if (u.endsWith('/rsvp')) return new Response(JSON.stringify([{ id: 'a', ...JSON.parse(String(init!.body)), created_at: 'now' }]), { status: 201 })
      return new Response('', { status: 201 })
    })
    const { default: rsvp } = await import('./rsvp')
    const ok = await rsvp(post({ ...valid, message: '<script>x</script>Bahagia selalu' }))
    expect(ok.status).toBe(201)
    const body = (await ok.json()) as { wish: Record<string, unknown> }
    expect(body.wish.message).toBe('xBahagia selalu')
    expect(body.wish.attendance).toBeUndefined()
    expect(body.wish.guests).toBeUndefined()
    expect(calls).toContain('POST https://x.supabase.co/rest/v1/rsvp')
    count = 3
    expect((await rsvp(post(valid))).status).toBe(429)
    // GET publik via Supabase hanya meminta kolom publik
    const urls: string[] = []
    vi.stubGlobal('fetch', async (u: string) => {
      urls.push(u)
      return new Response(JSON.stringify([{ id: 'a', name: 'W', message: 'm', created_at: 't', attendance: 'yes' }]), { headers: { 'content-range': '0-0/1' } })
    })
    const pub = (await (await rsvp(new Request('https://wd.id/api/rsvp'))).json()) as { items: Record<string, unknown>[] }
    expect(urls[0]).toContain('select=id,name,message,created_at')
    expect(pub.items[0]!.attendance).toBeUndefined()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })
})

describe('api/admin-login', () => {
  it('login → cookie sesi → terverifikasi', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'rahasia')
    vi.stubEnv('APP_SECRET', 'secret123')
    const { default: login } = await import('./admin-login')
    const bad = await login(new Request('https://wd.id/api/admin-login', { method: 'POST', body: JSON.stringify({ password: 'salah' }) }))
    expect(bad.status).toBe(401)
    const good = await login(new Request('https://wd.id/api/admin-login', { method: 'POST', body: JSON.stringify({ password: 'rahasia' }) }))
    expect(good.status).toBe(200)
    const cookie = good.headers.get('set-cookie')!
    expect(cookie).toMatch(/HttpOnly/)
    const check = await login(new Request('https://wd.id/api/admin-login', { headers: { cookie: cookie.split(';')[0]! } }))
    expect(check.status).toBe(200)
    const forged = await login(new Request('https://wd.id/api/admin-login', { headers: { cookie: 'adm_sess=99999999999999.deadbeef' } }))
    expect(forged.status).toBe(401)
    vi.unstubAllEnvs()
  }, 10000)
})

describe('mode Redis (Vercel Storage / Upstash)', () => {
  it('simpan, baca, statistik, rate limit, hapus', async () => {
    vi.stubEnv('KV_REST_API_URL', 'https://kv.upstash.io')
    vi.stubEnv('KV_REST_API_TOKEN', 'tok')
    vi.stubEnv('ADMIN_PASSWORD', 'pw')
    // Redis palsu di memori yang meniru REST pipeline Upstash
    const list: string[] = []
    const hash: Record<string, number> = {}
    const counters: Record<string, number> = {}
    vi.stubGlobal('fetch', async (_u: string, init: RequestInit) => {
      const cmds = JSON.parse(String(init.body)) as (string | number)[][]
      const out = cmds.map(([c, ...a]) => {
        switch (c) {
          case 'LPUSH': list.unshift(String(a[1])); return { result: list.length }
          case 'LRANGE': return { result: list.slice(Number(a[1]), Number(a[2]) + 1) }
          case 'LLEN': return { result: list.length }
          case 'LREM': { const i = list.indexOf(String(a[2])); if (i >= 0) list.splice(i, 1); return { result: i >= 0 ? 1 : 0 } }
          case 'HINCRBY': hash[String(a[1])] = (hash[String(a[1])] ?? 0) + Number(a[2]); return { result: hash[String(a[1])] }
          case 'HGETALL': return { result: Object.entries(hash).flatMap(([k, v]) => [k, String(v)]) }
          case 'INCR': counters[String(a[0])] = (counters[String(a[0])] ?? 0) + 1; return { result: counters[String(a[0])] }
          case 'EXPIRE': return { result: 1 }
        }
        return { error: 'unknown ' + c }
      })
      return new Response(JSON.stringify(out))
    })
    const { default: rsvp } = await import('./rsvp')
    const post = (b: object) => rsvp(new Request('https://wd.id/api/rsvp', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': '9.9.9.9' }, body: JSON.stringify({ website: '', elapsed: 5000, ...b }) }))
    expect((await post({ name: 'Wayan', attendance: 'yes', guests: 3, message: 'Rahajeng' })).status).toBe(201)
    expect((await post({ name: 'Ketut', attendance: 'no', guests: 0, message: 'Maaf' })).status).toBe(201)
    const g = (await (await rsvp(new Request('https://wd.id/api/rsvp?page=0&size=6'))).json()) as Record<string, unknown> & { items: Record<string, unknown>[]; total: number }
    expect(g.mode).toBe('live')
    expect(g.total).toBe(2)
    expect(g.items[0]!.name).toBe('Ketut')
    // PRIVASI: publik hanya mendapat nama, ucapan, waktu
    expect(g.stats).toBeUndefined()
    for (const it of g.items) expect(Object.keys(it).sort()).toEqual(['created_at', 'id', 'message', 'name'])
    expect(JSON.stringify(g)).not.toMatch(/attendance|guests|"yes"|"no"/)
    expect(hash.yes).toBe(1) // statistik tetap tercatat untuk admin
    expect((await post({ name: 'Spam', attendance: 'no', message: 'x' })).status).toBe(201)
    expect((await post({ name: 'Spam', attendance: 'no', message: 'x' })).status).toBe(429)

    // admin: hapus ucapan
    const { default: login } = await import('./admin-login')
    const cookie = (await login(new Request('https://wd.id/api/admin-login', { method: 'POST', body: JSON.stringify({ password: 'pw' }) }))).headers.get('set-cookie')!.split(';')[0]!
    const { default: admin } = await import('./admin-rsvp')
    const all = (await (await admin(new Request('https://wd.id/api/admin-rsvp', { headers: { cookie } }))).json()) as { items: { id: string }[] }
    expect(all.items.length).toBe(3)
    await admin(new Request(`https://wd.id/api/admin-rsvp?id=${all.items[0]!.id}`, { method: 'DELETE', headers: { cookie } }))
    expect(list.length).toBe(2)
    expect(hash.total).toBe(2)
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  }, 10000)
})

describe('api/invite (halaman utama + meta OG)', () => {
  it('menyisipkan nama tamu ke HTML', async () => {
    vi.stubGlobal('fetch', async () => new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } }))
    const { default: invite } = await import('./invite')
    const res = await invite(new Request('https://wd.id/api/invite?to=wayan'))
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('<title>Kepada Yth. Wayan — Undangan Pawiwahan Wahyu &amp; Diah</title>')
    expect(body).toContain('content="https://wd.id/?to=wayan"')
    vi.unstubAllGlobals()
  })
  it('gagal → dialihkan ke /app.html (undangan tetap terbuka)', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('down')
    })
    const { default: invite } = await import('./invite')
    const res = await invite(new Request('https://wd.id/api/invite?to=wayan'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://wd.id/app.html?to=wayan')
    vi.unstubAllGlobals()
  })
})
