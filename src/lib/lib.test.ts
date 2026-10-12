import { describe, expect, it } from 'vitest'
import { escapeHtml, guestLink, parseGuest, sanitizeText, titleCase } from './guest'
import { toAksaraBali } from './aksara'
import { buildIcs, googleCalendarUrl } from './calendar'

describe('guest', () => {
  it('membaca nama dari ?to= dan merapikan kapitalisasi', () => {
    const g = parseGuest('?to=bapak+wAYAN+sukadana', 'Tamu Undangan', 'Bapak/Ibu')
    expect(g).toEqual({ name: 'Bapak Wayan Sukadana', salutation: 'Bapak/Ibu', personalized: true })
  })
  it('mendukung sapaan', () => {
    const g = parseGuest('?to=Wayan&sapaan=Bapak%2FIbu', 'Tamu', 'Saudara')
    expect(g.salutation).toBe('Bapak/Ibu')
  })
  it('fallback bila kosong', () => {
    expect(parseGuest('', 'Tamu Undangan', 'X').name).toBe('Tamu Undangan')
    expect(parseGuest('?to=%20%20', 'Tamu Undangan', 'X').personalized).toBe(false)
  })
  it('menetralkan XSS', () => {
    const g = parseGuest('?to=%3Cscript%3Ealert(1)%3C%2Fscript%3EBudi', 'Tamu', '')
    expect(g.name).not.toMatch(/[<>]/)
    expect(g.name).toContain('Budi')
    expect(sanitizeText('<img src=x onerror=alert(1)>Ani')).toBe('Ani')
    expect(sanitizeText('javascript:alert(1)')).not.toContain('javascript:')
    expect(sanitizeText('%253Cb%253EDoble')).toBe('Doble')
  })
  it('memotong nama yang terlalu panjang', () => {
    expect(sanitizeText('a'.repeat(200)).length).toBe(60)
  })
  it('menjaga gelar & kata sambung', () => {
    expect(titleCase('i made agus dan keluarga')).toBe('I Made Agus dan Keluarga')
    expect(titleCase('dr. ni luh ayu')).toBe('dr. Ni Luh Ayu')
  })
  it('membuat link tamu', () => {
    expect(guestLink('https://x.id/?a=1', 'Wayan Sudi', 'Bapak')).toBe('https://x.id/?to=Wayan+Sudi&sapaan=Bapak')
  })
  it('escape html', () => {
    expect(escapeHtml(`"><x>'&`)).toBe('&quot;&gt;&lt;x&gt;&#39;&amp;')
  })
})

describe('aksara', () => {
  it('transliterasi dasar', () => {
    expect(toAksaraBali('Diah')).toBe('ᬤᬶᬬᬄ')
    expect(toAksaraBali('Wahyu')).toBe('ᬯᬳ᭄ᬬᬸ')
    expect(toAksaraBali('Bali')).toBe('ᬩᬮᬶ')
  })
})

describe('calendar', () => {
  const ev = {
    uid: 'x@y',
    title: 'Resepsi Wahyu & Diah',
    description: 'Hadir ya; terima kasih, semua',
    location: 'Denpasar, Bali',
    start: new Date('2027-01-01T15:00:00+08:00'),
    end: new Date('2027-01-01T21:00:00+08:00'),
  }
  it('ICS memakai UTC yang benar (15.00 WITA = 07.00Z)', () => {
    const ics = buildIcs(ev)
    expect(ics).toContain('DTSTART:20270101T070000Z')
    expect(ics).toContain('DTEND:20270101T130000Z')
    expect(ics).toContain('Hadir ya\\; terima kasih\\, semua')
  })
  it('Google Calendar URL', () => {
    expect(googleCalendarUrl(ev)).toContain('dates=20270101T070000Z%2F20270101T130000Z')
  })
})

describe('admin', async () => {
  const { parseGuestList, normalizePhone, toCsv, buildMessage, linkFor } = await import('./admin')
  it('parse daftar tamu (pipa, tab, duplikat, komentar)', () => {
    const rows = parseGuestList('Wayan Sudi | Bapak | 0812-3456\n# komentar\n\nKetut\tIbu\nwayan sudi', 'Bapak/Ibu/Saudara/i')
    expect(rows).toEqual([
      { name: 'Wayan Sudi', salutation: 'Bapak', phone: '628123456' },
      { name: 'Ketut', salutation: 'Ibu', phone: '' },
    ])
  })
  it('nomor WA', () => {
    expect(normalizePhone('+62 812 345')).toBe('62812345')
    expect(normalizePhone('0812')).toBe('62812')
  })
  it('CSV aman dari formula injection & UTF-8 BOM', () => {
    const csv = toCsv(['a'], [['=HYPERLINK("x")'], ['Ni Luh, "Ayu"']])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`)
    expect(csv).toContain('"Ni Luh, ""Ayu"""')
  })
  it('template pesan & link (sapaan default tidak ditulis di URL)', () => {
    expect(buildMessage('{sapaan} {nama}: {link}', { sapaan: 'Bpk', nama: 'Wayan', link: 'L', mempelai: '', tanggal: '' })).toBe('Bpk Wayan: L')
    expect(linkFor('https://x.id', { name: 'Wayan', salutation: 'Def', phone: '' }, 'Def')).toBe('https://x.id/?to=Wayan')
  })
})
