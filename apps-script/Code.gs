/**
 * Backend RSVP GRATIS memakai Google Sheets + Apps Script (alternatif Supabase).
 *
 * Cara pasang:
 *  1. Buat Google Sheet baru → Extensions → Apps Script → tempel seluruh file ini.
 *  2. Klik Deploy → New deployment → Type: Web app
 *       Execute as: Me   |   Who has access: Anyone
 *  3. Salin URL Web App (…/exec) → isi VITE_SHEETS_URL di Vercel → redeploy.
 *
 * Anti-spam: honeypot, jeda minimum isi form, validasi, rate limit (CacheService).
 * Catatan: Apps Script tidak memberi IP pengunjung, jadi rate limit memakai
 * kombinasi nama + jendela waktu global. Untuk acara besar, gunakan Supabase.
 */

const SHEET = 'RSVP'
const MAX_GUESTS = 5
const LIMIT = { name: 60, message: 500, minElapsed: 3000, perMinute: 20 }

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sh = ss.getSheetByName(SHEET)
  if (!sh) {
    sh = ss.insertSheet(SHEET)
    sh.appendRow(['id', 'name', 'attendance', 'guests', 'message', 'created_at'])
    sh.setFrozenRows(1)
  }
  return sh
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

function clean_(s, max) {
  return String(s || '')
    .replace(/<[^>]*>?/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function doGet(e) {
  // PUBLIK: hanya nama, ucapan, waktu. Status kehadiran & jumlah tamu cukup dilihat di Sheet-nya.
  const rows = sheet_().getDataRange().getValues().slice(1)
  const items = rows.map((r) => ({ id: String(r[0]), name: r[1], message: r[4], created_at: new Date(r[5]).toISOString() })).reverse()
  return out_({ items: items })
}

function doPost(e) {
  let b
  try {
    b = JSON.parse(e.postData.contents)
  } catch (err) {
    return out_({ error: 'invalid' })
  }
  const name = clean_(b.name, LIMIT.name)
  const message = String(b.message || '').replace(/<[^>]*>?/g, '').trim().slice(0, LIMIT.message)
  const attendance = ['yes', 'no', 'maybe'].indexOf(b.attendance) >= 0 ? b.attendance : null
  const guests = attendance === 'yes' ? Math.min(MAX_GUESTS, Math.max(1, Math.floor(Number(b.guests) || 1))) : 0

  if (b.website) return out_({ wish: { id: 'ok', name: name, message: message, created_at: new Date().toISOString() } })
  if ((Number(b.elapsed) || 0) < LIMIT.minElapsed) return out_({ error: 'fast' })
  if (!name || !message || !attendance) return out_({ error: 'invalid' })

  const cache = CacheService.getScriptCache()
  const minuteKey = 'rl_' + Math.floor(Date.now() / 60000)
  const n = Number(cache.get(minuteKey) || 0)
  if (n >= LIMIT.perMinute) return out_({ error: 'rate' })
  const nameKey = 'nm_' + Utilities.base64EncodeWebSafe(name.toLowerCase()).slice(0, 200)
  if (Number(cache.get(nameKey) || 0) >= 3) return out_({ error: 'rate' })

  const lock = LockService.getScriptLock()
  lock.waitLock(5000)
  try {
    const wish = { id: Utilities.getUuid(), name: name, attendance: attendance, guests: guests, message: message, created_at: new Date().toISOString() }
    sheet_().appendRow([wish.id, wish.name, wish.attendance, wish.guests, wish.message, wish.created_at])
    cache.put(minuteKey, String(n + 1), 120)
    cache.put(nameKey, String(Number(cache.get(nameKey) || 0) + 1), 600)
    return out_({ wish: { id: wish.id, name: wish.name, message: wish.message, created_at: wish.created_at } })
  } finally {
    lock.releaseLock()
  }
}
