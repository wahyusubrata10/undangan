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

  it('menolak metode selain POST', async () => {
    const { default: rsvp } = await import('./rsvp')
    expect((await rsvp(new Request('https://wd.id/api/rsvp'))).status).toBe(405)
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
    const body = (await ok.json()) as { wish: { message: string; guests: number } }
    expect(body.wish.message).toBe('xBahagia selalu')
    expect(calls).toContain('POST https://x.supabase.co/rest/v1/rsvp')
    count = 3
    expect((await rsvp(post(valid))).status).toBe(429)
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
