# Undangan Pawiwahan — Wahyu & Diah

Undangan pernikahan digital bertema **adat Bali**: sinematik, mewah, dan tetap ringan di HP Android kelas menengah.

**Kadek Wahyu Dwi Putra Subrata & Kadek Diah Kencana Putri** · Resepsi, Jumat 1 Januari 2027, 15.00–21.00 WITA

---

## Isi

- [Fitur](#fitur)
- [Menjalankan di komputer](#menjalankan-di-komputer)
- [Mengganti konten](#mengganti-konten) (satu file: `src/config/wedding.ts`)
- [Foto](#foto)
- [Video background](#video-background)
- [Musik](#musik)
- [Backend RSVP & ucapan](#backend-rsvp--ucapan) (Supabase atau Google Sheets)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Halaman admin: link tamu, WhatsApp, QR](#halaman-admin)
- [Arsitektur & performa](#arsitektur--performa)

---

## Fitur

| Bagian | Isi |
|---|---|
| **Cover** | Dua sisi candi bentar (SVG orisinal) tertutup, penjor, asap dupa, nama tamu dari `?to=` (disanitasi dari XSS, kapitalisasi rapi). Tombol **Buka Undangan** menjalankan animasi: celah gerbang bercahaya, gapura terbelah dengan parallax kedalaman, kamera maju, kelopak jepun 3D berhamburan, musik fade-in, dan fullscreen di HP. |
| **Pembuka** | Om Swastyastu, nama dalam aksara Bali, nama mempelai dengan SplitText, dan kutipan suci di atas kartu lontar. |
| **Countdown** | Angka bergulir seperti odometer di atas plakat bermotif songket, plus tombol simpan tanggal. |
| **Mempelai** | Foto berbingkai lengkung kori dengan ornamen patra, nama lengkap, putra/putri ke-, orang tua, dan Instagram. |
| **Love Story** | Section di-pin: scroll vertikal menggeser timeline horizontal, garis janur tumbuh, dan foto ber-parallax. |
| **Acara** | Kartu per acara (WITA/WIB/WIT), Google Maps, peta bergaya gelap yang dimuat saat diketuk, serta Google Calendar dan file `.ics`. |
| **Live streaming** | Bisa dinyalakan atau dimatikan di config, dengan bingkai kain poleng. |
| **Galeri** | Grid editorial yang tidak monoton dan muncul lewat mask (lengkung/kelopak). Lightbox fullscreen mendukung swipe, pinch-zoom, double-tap, keyboard, dan tombol back HP. |
| **Amplop digital** | Kartu bank/e-wallet bermotif songket dengan tilt 3D (kursor atau gyroscope) dan kilau, salin nomor dengan getaran kecil, QRIS, dan alamat kado. |
| **RSVP & ucapan** | Nama terisi otomatis dari `?to=`, hadir/ragu/tidak, jumlah tamu, ucapan realtime, pagination, statistik, dan anti-spam (honeypot, jeda minimum, rate limit per IP). |
| **Penutup** | Terima kasih, Om Shanti Shanti Shanti Om, dan gapura menutup perlahan mengikuti scroll. |
| **Ekstra** | `/admin` (generator link, pesan WhatsApp, QR check-in, export CSV, moderasi ucapan), OG image per tamu untuk preview WhatsApp, kontrol musik dengan visualizer bilah rindik, auto-scroll "Nikmati Undangan", navigasi section, transisi patra menyapu layar, partikel jepun dan debu emas yang bereaksi ke jari/kursor dan gyroscope, serta easter egg (**ketuk nama mempelai 3x** untuk hujan bunga jepun). |

**Bahasa:** Indonesia dan English (`?lang=en`, atau lewat menu navigasi). Struktur Bahasa Bali sudah disiapkan di `src/i18n/ban.ts`.

---

## Menjalankan di komputer

Butuh **Node.js 20+**.

```bash
npm install
npm run dev          # http://localhost:5173  (coba: /?to=Bapak+Wayan&sapaan=Bapak/Ibu)
npm test             # unit test (sanitasi nama, kalender, API, CSV, dll.)
npm run build        # build produksi + typecheck → folder dist/
npm run preview      # cek hasil build
```

> `npm run dev` hanya menjalankan frontend. Endpoint `/api/*` (RSVP Supabase, admin, OG) berjalan di Vercel.
> Untuk mencobanya di lokal, pakai `npx vercel dev`. Tanpa backend, RSVP otomatis berjalan dalam **mode demo** (tersimpan di browser).

---

## Mengganti konten

**Semua teks, nama, tanggal, lokasi, rekening, foto, video, dan musik ada di [`src/config/wedding.ts`](src/config/wedding.ts).**
Komponen tidak perlu disentuh. Bagian bertanda `// TODO` masih berisi data contoh:

- `groom` / `bride`: nama orang tua, asal (banjar), Instagram, foto
- `events`: nama tempat, alamat, link Google Maps, `mapsQuery` (koordinat, mis. `'-8.6705,115.2126'`). Contoh acara **Mesakapan** sudah disiapkan dalam komentar.
- `gift.accounts`: nomor rekening asli, QRIS, alamat kado
- `story.chapters`: cerita dan foto kalian
- `photos`: hero, penutup, galeri (12+)

Tips:

- **Waktu** ditulis dalam ISO dengan offset: WITA `+08:00`, WIB `+07:00`, WIT `+09:00`.
- **Teks multi-bahasa:** `'teks'` atau `{ id: 'teks', en: 'text' }`.
- **Aksara Bali** dibuat otomatis lewat transliterasi sederhana. Untuk hasil yang benar secara adat, isi `aksara: '...'` di `groom`/`bride` dan minta dicek oleh penutur atau ahli aksara Bali.
- **Salam & kutipan suci:** `greeting`. **Template pesan WhatsApp:** `share.whatsappTemplate`.
- **Matikan section:** `liveStream.enabled`, `story.enabled`, `gift.enabled`, `rsvp.enabled`.
- **Urutan mempelai:** `order: 'groom-first' | 'bride-first'`.

---

## Foto

1. Taruh foto asli (JPG/PNG/HEIC, sebaiknya ≥ 1600 px) di `media-src/photos/`.
2. Jalankan:
   ```bash
   npm run media
   ```
   Script membuat versi **AVIF + WebP + JPG** (480/960/1600 px), blur placeholder, dan manifest rasio aspek (tanpa layout shift) ke `public/media/photos/`.
3. Tulis nama filenya di config, misalnya `hero: 'hero.jpg'`, `gallery: ['g01.jpg', 'g02.jpg', …]`.

Slot yang dikosongkan (`''`) tampil sebagai placeholder ornamen yang elegan. Foto mentah di `media-src/` tidak ikut di-commit, sedangkan hasil kompres di `public/media/` ikut di-commit.

Rekomendasi: **hero** portrait 4:5 atau 3:4, **mempelai** 3:4, **love story** 4:5, **galeri** campuran portrait dan landscape.

---

## Video background

Video diputar di belakang konten (`autoplay muted loop playsinline` + poster). Video otomatis **di-pause** saat tab tidak aktif, dan diganti **foto poster** bila koneksi lambat atau data saver aktif (Network Information API) atau bila `prefers-reduced-motion` aktif.

```bash
# taruh video di media-src/video/ lalu:
npm run media:video      # → public/media/video/<nama>.mp4 (H.264) + .webm (VP9) + poster
npm run media            # proses posternya
```

Lalu di config:

```ts
video: {
  background: { mp4: '/media/video/prewedding.mp4', webm: '/media/video/prewedding.webm', poster: 'prewedding-poster.jpg' },
  // opsional: video berbeda per section, otomatis crossfade
  perSection: { story: { mp4: '/media/video/story.mp4', poster: 'story-poster.jpg' } },
},
```

Perintah ffmpeg manual (bila ingin mengatur sendiri):

```bash
# MP4 H.264 720p tanpa audio, siap streaming (faststart)
ffmpeg -i input.mov -t 20 -an -vf "scale=-2:1280,fps=30,format=yuv420p" \
  -c:v libx264 -profile:v high -preset slow -crf 27 -movflags +faststart prewedding.mp4

# WebM VP9 (lebih kecil di Android/Chrome)
ffmpeg -i input.mov -t 20 -an -vf "scale=-2:1280,fps=30" \
  -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 prewedding.webm

# Poster (frame pertama)
ffmpeg -i input.mov -frames:v 1 -q:v 3 media-src/photos/prewedding-poster.jpg
```

Target: **10–25 detik, < 4 MB**. Variabel `WIDTH`, `CRF_H264`, `CRF_VP9`, dan `MAXDUR` bisa diatur, misalnya `CRF_H264=30 npm run media:video`.

---

## Musik

Default: `public/audio/rindik-placeholder.mp3`, loop bernuansa rindik dengan laras selendro yang **disintesis sendiri** (bebas hak cipta) via `npm run music:placeholder`.

Untuk mengganti, taruh file musikmu (mp3, < 3 MB, pastikan punya hak pakai) di `public/audio/`, lalu ubah `music.src` di config. Musik mulai dengan fade-in saat tamu menekan **Buka Undangan** (browser mewajibkan interaksi dulu sebelum audio boleh diputar).

---

## Backend RSVP & ucapan

Backend dipilih otomatis dari environment variable:

| Env yang diisi | Mode |
|---|---|
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (+ server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) | **Supabase**: realtime, rate limit per IP, moderasi di `/admin` (direkomendasikan) |
| `VITE_SHEETS_URL` | **Google Sheets** via Apps Script: gratis, ucapan diperbarui tiap 20 detik |
| (kosong) | **Demo**: ucapan hanya tersimpan di perangkat tamu |

### Supabase (direkomendasikan)

1. Buat project di [supabase.com](https://supabase.com) (paket gratis cukup).
2. Buka **SQL Editor → New query**, tempel isi [`supabase/schema.sql`](supabase/schema.sql), lalu **Run**.
   Ini membuat tabel `rsvp`, view statistik, Row Level Security (publik hanya bisa *membaca*), tabel rate limit, dan mengaktifkan Realtime.
3. Ambil kredensial di **Project Settings → API**:
   - `Project URL` → `VITE_SUPABASE_URL` **dan** `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**rahasia**, hanya di Vercel, jangan diawali `VITE_`)

Alur keamanannya: browser membaca ucapan langsung dari Supabase (anon key, read-only). Menulis hanya lewat `POST /api/rsvp` di Vercel, yang menjalankan honeypot, cek jeda minimum 3 detik, validasi panjang/isi, sanitasi HTML, dan **rate limit 3 kiriman per 10 menit per IP** (IP disimpan sebagai hash).

### Google Sheets (gratis, tanpa Supabase)

Ikuti petunjuk di bagian atas [`apps-script/Code.gs`](apps-script/Code.gs): buat Sheet, tempel script, **Deploy → Web app** (Execute as: *Me*, Access: *Anyone*), lalu isi `VITE_SHEETS_URL` dengan URL `/exec`-nya.

---

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di [vercel.com](https://vercel.com): **Add New → Project → Import** repo ini. Framework terdeteksi **Vite** dan `vercel.json` sudah disiapkan.
3. **Settings → Environment Variables** (lihat [`.env.example`](.env.example)):

   | Nama | Wajib | Keterangan |
   |---|---|---|
   | `ADMIN_PASSWORD` | ✓ | password halaman `/admin` |
   | `APP_SECRET` | ✓ | string acak panjang (`openssl rand -hex 32`) untuk menandatangani sesi & hash IP |
   | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase | |
   | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase | server only |
   | `VITE_SHEETS_URL` | Sheets | alternatif Supabase |

4. **Deploy**. Setelah dapat domain (mis. `https://wahyu-diah.vercel.app`), isi `meta.siteUrl` di config agar link di `/admin` memakai domain itu, lalu push lagi.
5. Cek preview link: buka [opengraph.xyz](https://www.opengraph.xyz) atau kirim link ke diri sendiri di WhatsApp. WhatsApp menyimpan cache preview; tambahkan `&v=2` untuk memaksa refresh.

**Yang berjalan di Vercel:**

- `middleware.ts` menyisipkan meta OG (judul berisi nama tamu) ke HTML, karena WhatsApp tidak menjalankan JavaScript.
- `api/og.ts` menghasilkan gambar preview 1200×630 per tamu (gapura emas + "Kepada Yth. …").
- `api/rsvp.ts`, `api/admin-login.ts`, dan `api/admin-rsvp.ts` berjalan di Edge Functions.

---

## Halaman admin

Buka `https://domainmu/admin` lalu masukkan `ADMIN_PASSWORD`.

**Link Tamu & QR**

- Paste daftar tamu, satu per baris: `Nama | Sapaan | No. WA` (sapaan dan nomor opsional). Bisa juga menyalin kolom langsung dari Excel atau Google Sheets.
- Halaman ini menghasilkan link personal `?to=` per tamu, teks undangan WhatsApp siap kirim (tombol **Kirim WA** langsung ke nomor tamu), **QR code** per tamu (unduh PNG, atau **Cetak QR** sebagai kartu check-in), dan **Export CSV**.
- Daftar tersimpan otomatis di browser admin.

**Data RSVP:** statistik, tabel semua ucapan, hapus ucapan spam, dan export CSV.

Format link tamu: `https://domainmu/?to=Bapak+Wayan&sapaan=Bapak/Ibu`. Parameter `sapaan` opsional (default diatur di `guest.defaultSalutation`).

---

## Arsitektur & performa

```
Tamu buka link WA ─► Vercel Middleware (meta OG + nama tamu)
                         │
                         ▼
   index.html + cover (React, tanpa GSAP/Three; ±85 KB JS gzip)
                         │ halaman tenang / tamu berinteraksi
                         ▼
   chunk terpisah: [undangan + GSAP + Lenis] [Three.js partikel] [lightbox] [admin]
                         │
   RSVP ─► /api/rsvp (honeypot, validasi, rate limit) ─► Supabase ─► Realtime ─► daftar ucapan
```

```
src/
  config/wedding.ts       ← konten (satu-satunya yang perlu diedit)
  config/media.generated  ← dibuat otomatis oleh `npm run media`
  i18n/                   ← teks UI (id, en, ban)
  ornaments/              ← SVG orisinal: candi bentar, patra punggel, jepun, penjor, janur, poleng, songket
  sections/               ← Cover, Opening, Countdown, Couple, Story, Events, Live, Gallery, Gift, Rsvp, Closing
  components/             ← Backdrop (video), Dock (musik/nav/auto-scroll), Lightbox, PatraWipe, Particles, SmartImage
  fx/                     ← opening timeline, reveal (GSAP), scroll (Lenis), particles (Three.js shader), audio
  services/guestbook/     ← adapter Supabase / Sheets / demo
  pages/Admin.tsx         ← /admin
api/                      ← Vercel Edge Functions (rsvp, admin, og)
middleware.ts             ← meta OG per tamu
supabase/schema.sql       ← skema database
apps-script/Code.gs       ← backend Google Sheets
scripts/                  ← optimasi foto, kompres video, musik placeholder
```

**Standar yang diterapkan**

- Animasi hanya memakai `transform`/`opacity`, dengan easing `expo`/`power3` yang konsisten. `prefers-reduced-motion` dihormati: efek berat dimatikan, love story jadi vertikal, dan partikel diganti fade.
- Partikel 3D dihitung di **vertex shader** (1 draw call). FPS dipantau: bila turun, DPR dan jumlah partikel diturunkan; bila tetap berat, diganti versi CSS ringan.
- Video/partikel/musik di-pause saat tab disembunyikan. Iframe peta baru dimuat saat diminta.
- Hasil Lighthouse mobile (build lokal): **Performance 95 · Accessibility 100 · Best Practices 100 · SEO 100**.
- Aman di in-app browser WhatsApp/Instagram: fallback clipboard, fullscreen opsional, dan izin gyroscope iOS diminta di tombol buka.

**Catatan:** iPhone (Safari/in-app) tidak mendukung Fullscreen API untuk halaman web, jadi di iOS undangan tetap berjalan normal tanpa fullscreen.
