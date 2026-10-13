# Undangan Pawiwahan — Wahyu & Diah

Undangan pernikahan digital bertema **adat Bali**: sinematik, mewah, dan tetap ringan di HP Android kelas menengah.

**Kadek Wahyu Dwi Putra Subrata & Kadek Diah Kencana Putri** · Resepsi, Jumat 1 Januari 2027, 15.00–21.00 WITA

---

## 🚀 Panduan Mudah: Online dalam ±10 Menit (tanpa coding)

Hanya **4 langkah**, semuanya lewat klik di browser. Tidak perlu install apa pun.

**1. Masuk ke Vercel**
Buka **https://vercel.com/signup**, pilih **Continue with GitHub**, lalu login dengan akun GitHub `wahyusubrata10`. Paket gratis (Hobby) sudah cukup.

**2. Pasang undangan**
- Klik **Add New… → Project**.
- Di daftar repo, cari **undangan** lalu klik **Import**. Kalau repo tidak muncul, klik *Adjust GitHub App Permissions* dan izinkan repo `undangan`.
- Buka bagian **Environment Variables**, lalu isi:
  - **Key:** `ADMIN_PASSWORD`
  - **Value:** password bebas buatanmu (untuk masuk halaman admin)
- Klik **Deploy** dan tunggu ±1 menit sampai muncul kembang api 🎉.
- Undangan sudah online di alamat seperti `https://undangan-xxxx.vercel.app`.

**3. Aktifkan penyimpanan ucapan & RSVP**
- Di halaman project, buka tab **Storage**.
- Klik **Create Database → Upstash for Redis** (gratis) → **Continue** → beri nama bebas → **Create**.
- Pastikan project **undangan** tercentang, lalu klik **Connect**. Kunci database terpasang otomatis, tidak perlu copy-paste.

**4. Terapkan**
- Buka tab **Deployments**, klik **⋯** pada deployment teratas, lalu **Redeploy**.

Selesai! ✅

| Yang ingin dibuka | Alamat |
|---|---|
| Undangan | `https://alamatmu.vercel.app` |
| Undangan untuk tamu tertentu | `https://alamatmu.vercel.app/?to=Bapak+Wayan` |
| **Panel admin** (buat link & pesan WA untuk semua tamu, lihat RSVP) | `https://alamatmu.vercel.app/admin` → masukkan `ADMIN_PASSWORD` |

> Mengganti nama alamat (mis. `wahyu-diah.vercel.app`): **Settings → Domains → Edit**.
> Setiap ada perubahan isi di GitHub, Vercel otomatis memperbarui undangan dalam ±1 menit.

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
| # | Tahap | Isi |
|---|---|---|
| 1 | **Cover** | Cahaya pagi: langit ivory, kabut, sawah terasering, candi bentar khas Bali (ramping menjulang, badan bata merah, lis & ukiran batu paras, karang simbar lidah api di tiap tingkat, puncak bermahkota api, pelinggih kecil) tertutup; di desktop gapura di kiri & teks di kanan, nama tamu dari `?to=` (disanitasi dari XSS). **Buka Undangan**: gerbang terbelah, kamera maju, kelopak jepun berhamburan, musik fade-in, fullscreen di HP. |
| 2 | **Pembuka** | Om Swastyastu, kutipan singkat, nama kedua mempelai besar + aksara Bali. |
| 3 | **Mempelai Pria** | Gerbang paras terbuka saat di-scroll, foto pria membesar dari tengah hingga full-bleed; nama, putra ke-, orang tua. |
| 4 | **Mempelai Wanita** | Foto pria bergeser & memudar, foto wanita masuk dengan tirai dari kanan. |
| 5 | **Berdua** (klimaks) | Dua potret bertemu di tengah lalu melebur menjadi foto/video berdua full-bleed. |
| 6 | **Galeri "Momen Kami"** | 5 foto pertama tampil besar dalam strip yang **digeser kiri-kanan biasa** (tidak mengunci scroll), dengan efek kedalaman & penanda 01/05, lalu mosaik editorial untuk sisanya. Ketuk foto → lightbox (swipe, pinch-zoom, tombol back HP). |
| 7 | **Countdown + Acara** | Angka odometer tipis, kartu acara minimal, Google Maps, Google Calendar & `.ics`, live streaming opsional. |
| 8 | **Amplop** | Rekening/e-wallet minimal, salin dengan feedback, QRIS, alamat kado. |
| 9 | **Ucapan & Doa** | Form RSVP + daftar ucapan (**hanya nama, ucapan, waktu**). |
| 10 | **Penutup** | Terima kasih, Om Shanti Shanti Shanti Om, gapura menutup mengikuti scroll. |

Tahap 3–5 adalah **satu panggung yang di-pin** dengan satu master timeline, sehingga perpindahan pria → wanita → berdua tidak pernah patah.

**Ekstra:** `/admin` (generator link, pesan WhatsApp, QR check-in, export CSV, statistik & moderasi ucapan), OG image per tamu untuk preview WhatsApp, kontrol musik dengan visualizer, auto-scroll "Nikmati Undangan", navigasi section, kelopak jepun yang menghindari jari/kursor & mengikuti gyroscope, dan easter egg (**ketuk nama mempelai 3x** untuk hujan bunga jepun).

**Privasi tamu:** status kehadiran, jumlah tamu, dan statistik **tidak pernah** dikirim ke halaman tamu (API publik hanya mengembalikan nama, ucapan, waktu; database tertutup untuk publik). Semua itu hanya ada di `/admin`.

**Gaya:** editorial tanpa bingkai, palet ivory/cream/pasir dengan teks coklat hangat, prada redup, janur muda, dan kuning jepun. Ornamen Bali orisinal dipakai sebagai aksen yang bergerak halus: candi bentar bata merah & paras dengan karang, penjor melambai, sinar pagi, burung kokokan terbang, canang sari dengan asap dupa, ranting jepun bergoyang, sulur patra sari yang tergambar sendiri, gebogan, tedung, lamak, janur, dan sawah terasering. Font: Cormorant Garamond Light, Italiana, dan Jost.

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
- `groom.photo` / `bride.photo`: foto perkenalan masing-masing (portrait, full-bleed)
- `photos`: **`couple` (foto berdua, momen klimaks)**, penutup, galeri (12+)

Tips:

- **Waktu** ditulis dalam ISO dengan offset: WITA `+08:00`, WIB `+07:00`, WIT `+09:00`.
- **Teks multi-bahasa:** `'teks'` atau `{ id: 'teks', en: 'text' }`.
- **Aksara Bali** dibuat otomatis lewat transliterasi sederhana. Untuk hasil yang benar secara adat, isi `aksara: '...'` di `groom`/`bride` dan minta dicek oleh penutur atau ahli aksara Bali.
- **Salam & kutipan suci:** `greeting`. **Template pesan WhatsApp:** `share.whatsappTemplate`.
- **Matikan section:** `liveStream.enabled`, `gift.enabled`, `rsvp.enabled`.
- **Urutan mempelai:** `order: 'groom-first' | 'bride-first'`.

---

## Foto

1. Taruh foto asli (JPG/PNG/HEIC, sebaiknya ≥ 1600 px) di `media-src/photos/`.
2. Jalankan:
   ```bash
   npm run media
   ```
   Script membuat versi **AVIF + WebP + JPG** (480/960/1600 px), blur placeholder, dan manifest rasio aspek (tanpa layout shift) ke `public/media/photos/`.
3. Tulis nama filenya di config, misalnya `couple: 'berdua.jpg'`, `gallery: ['g01.jpg', 'g02.jpg', …]`.

Slot yang dikosongkan (`''`) tampil sebagai placeholder ornamen yang elegan. Foto mentah di `media-src/` tidak ikut di-commit, sedangkan hasil kompres di `public/media/` ikut di-commit.

Rekomendasi: **mempelai pria/wanita** & **berdua** portrait 3:4 atau 9:16 (tampil full-bleed, subjek di tengah atas), **galeri**: 5 foto pertama sebaiknya yang paling sinematik (tampil besar di strip film), sisanya campuran portrait & landscape.

---

## Video background

Video prewedding (opsional) diputar di momen **Berdua** menggantikan foto berdua: `muted loop playsinline` dengan poster, hanya diputar saat terlihat, dan otomatis memakai foto bila data saver aktif.

```bash
# taruh video di media-src/video/ lalu:
npm run media:video      # → public/media/video/<nama>.mp4 (H.264) + .webm (VP9) + poster
npm run media            # proses posternya
```

Lalu di config:

```ts
video: {
  couple: { mp4: '/media/video/prewedding.mp4', webm: '/media/video/prewedding.webm', poster: 'prewedding-poster.jpg' },
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

Default: `public/audio/rindik-placeholder.mp3`, loop lembut bernuansa semar pagulingan/rindik dengan laras **pelog** yang **disintesis sendiri** (bebas hak cipta) via `npm run music:placeholder`.

Untuk mengganti, taruh file musikmu (mp3, < 3 MB, pastikan punya hak pakai) di `public/audio/`, lalu ubah `music.src` di config. Musik mulai dengan fade-in saat tamu menekan **Buka Undangan** (browser mewajibkan interaksi dulu sebelum audio boleh diputar).

---

## Backend RSVP & ucapan

Backend dipilih otomatis dari environment variable:

| Env yang diisi | Mode |
|---|---|
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` (otomatis dari **Vercel → Storage → Upstash for Redis**) | **Redis**: paling mudah, 1 klik, rate limit per IP, moderasi di `/admin`, ucapan baru muncul tiap 15 detik |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server saja) | **Supabase**: cocok untuk ribuan tamu |
| `VITE_SHEETS_URL` | **Google Sheets** via Apps Script: gratis, ucapan diperbarui tiap 20 detik |
| (kosong) | **Demo**: ucapan hanya tersimpan di perangkat tamu |

### Redis via Vercel Storage (paling mudah)

Lihat langkah 3 di [Panduan Mudah](#-panduan-mudah-online-dalam-10-menit-tanpa-coding). Tidak ada kunci yang perlu disalin.

### Supabase (opsional, untuk acara besar)

1. Buat project di [supabase.com](https://supabase.com) (paket gratis cukup).
2. Buka **SQL Editor → New query**, tempel isi [`supabase/schema.sql`](supabase/schema.sql), lalu **Run**.
   Ini membuat tabel `rsvp`, view statistik, tabel rate limit, dan Row Level Security yang **menutup tabel sepenuhnya dari publik**.
3. Ambil kredensial di **Project Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**rahasia**, hanya di Vercel, jangan diawali `VITE_`)

Alur keamanannya: browser **tidak** mengakses database langsung. Membaca lewat `GET /api/rsvp` (hanya nama, ucapan, waktu); menulis hanya lewat `POST /api/rsvp` di Vercel, yang menjalankan honeypot, cek jeda minimum 3 detik, validasi panjang/isi, sanitasi HTML, dan **rate limit 3 kiriman per 10 menit per IP** (IP disimpan sebagai hash).

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
   | `APP_SECRET` | opsional | string acak panjang (`openssl rand -hex 32`). Bila kosong, memakai `ADMIN_PASSWORD` |
   | `KV_REST_API_URL`, `KV_REST_API_TOKEN` | otomatis | terisi sendiri saat Upstash Redis di-Connect |
   | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase | server only |
   | `VITE_SHEETS_URL` | Sheets | alternatif Supabase |

4. **Deploy**. Setelah dapat domain (mis. `https://wahyu-diah.vercel.app`), isi `meta.siteUrl` di config agar link di `/admin` memakai domain itu, lalu push lagi.
5. Cek preview link: buka [opengraph.xyz](https://www.opengraph.xyz) atau kirim link ke diri sendiri di WhatsApp. WhatsApp menyimpan cache preview; tambahkan `&v=2` untuk memaksa refresh.

**Yang berjalan di Vercel:**

- `api/invite.ts` melayani halaman utama dan menyisipkan meta OG (judul berisi nama tamu) ke HTML, karena WhatsApp tidak menjalankan JavaScript. Bila gagal, otomatis dialihkan ke `/app.html` sehingga undangan tetap terbuka.
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
Tamu buka link WA ─► api/invite (meta OG + nama tamu; gagal → /app.html)
                         │
                         ▼
   app.html + cover (React, tanpa GSAP; ±83 KB JS gzip)
                         │ halaman tenang / tamu berinteraksi
                         ▼
   chunk terpisah: [undangan + GSAP + Lenis] [kelopak jepun canvas 2D ±2 KB] [lightbox] [admin]
                         │
   Ucapan ─► /api/rsvp (honeypot, validasi, rate limit) ─► Redis/Supabase
   Daftar ─► GET /api/rsvp → hanya {nama, ucapan, waktu}   ·   statistik → /admin saja
```

```
src/
  config/wedding.ts       ← konten (satu-satunya yang perlu diedit)
  config/media.generated  ← dibuat otomatis oleh `npm run media`
  i18n/                   ← teks UI (id, en, ban)
  ornaments/              ← SVG orisinal: candi bentar paras, jepun, penjor, janur, canang sari, tedung, lamak, sawah
  sections/               ← Cover, Opening, Meet (pria→wanita→berdua), Gallery (strip geser + mosaik), Events, Gift, Rsvp, Closing
  components/             ← Backdrop (video), Dock (musik/nav/auto-scroll), Lightbox, PatraWipe, Particles, SmartImage
  fx/                     ← opening timeline, motion (ScrollTrigger scrub), scroll (Lenis), petals (canvas 2D), audio
  services/guestbook/     ← adapter Supabase / Sheets / demo
  pages/Admin.tsx         ← /admin
api/                      ← Vercel Edge Functions (rsvp, admin, og) + penyimpanan Redis/Supabase
supabase/schema.sql       ← skema database
apps-script/Code.gs       ← backend Google Sheets
scripts/                  ← optimasi foto, kompres video, musik placeholder
```

**Standar yang diterapkan**

- Satu sistem gerak: **Lenis + GSAP ScrollTrigger** dalam satu loop RAF (`lerp 0.09`). Konten muncul dalam ±0,9 detik begitu masuk layar dan berbalik saat di-scroll kembali; parallax & sekuens pria→wanita→berdua (±2,5 layar) **terikat scroll** (`scrub`), hanya `transform`/`opacity`, `will-change` dipasang hanya selama trigger aktif. Framer Motion hanya untuk micro-interaction (tombol salin, form, menu).
- Warna latar berpindah ivory → cream → pasir lewat lapisan yang di-crossfade (opacity).
- `prefers-reduced-motion`: semua diganti fade sederhana; sekuens pria/wanita/berdua jadi tiga section biasa; kelopak dimatikan.
- Kelopak jepun memakai **canvas 2D** (±2 KB), berhenti saat tab tersembunyi, dan mengurangi jumlah/resolusi otomatis bila FPS turun.
- Video/partikel/musik di-pause saat tab disembunyikan. Iframe peta baru dimuat saat diminta.
- Hasil Lighthouse mobile (build lokal): **Performance 95–99 · Accessibility 100 · Best Practices 100 · SEO 100**.
- Aman di in-app browser WhatsApp/Instagram: fallback clipboard, fullscreen opsional, dan izin gyroscope iOS diminta di tombol buka.

**Catatan:** iPhone (Safari/in-app) tidak mendukung Fullscreen API untuk halaman web, jadi di iOS undangan tetap berjalan normal tanpa fullscreen.
