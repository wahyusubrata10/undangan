/**
 * Optimasi foto otomatis.
 *   1. Taruh foto mentah (jpg/png/webp/heic*) di  media-src/photos/
 *   2. Jalankan: npm run media
 *   3. Tulis nama filenya di src/config/wedding.ts (mis. hero: 'hero.jpg')
 *
 * Hasil: public/media/photos/<nama>-<lebar>.{avif,webp,jpg} + blur placeholder (LQIP)
 * dan manifest src/config/media.generated.ts (rasio aspek → tanpa layout shift).
 * File yang tidak berubah dilewati (cache berdasarkan ukuran & waktu ubah).
 */
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const SRC = 'media-src/photos'
const OUT = 'public/media/photos'
const MANIFEST = 'src/config/media.generated.ts'
const CACHE = 'media-src/.cache.json'
const WIDTHS = [480, 960, 1600]
const QUALITY = { avif: 52, webp: 74, jpg: 78 }

mkdirSync(OUT, { recursive: true })
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}
const manifest = {}

const files = existsSync(SRC) ? readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp|tiff?|avif|heic|heif)$/i.test(f)) : []
if (!files.length) console.log(`(Belum ada foto di ${SRC}/ — slot akan tampil sebagai placeholder.)`)

for (const file of files) {
  const path = join(SRC, file)
  const key = parse(file).name.toLowerCase()
  const st = statSync(path)
  const sig = `${st.size}-${st.mtimeMs}`
  if (cache[key]?.sig === sig && existsSync(join(OUT, `${key}-${cache[key].entry.widths.at(-1)}.webp`))) {
    manifest[key] = cache[key].entry
    console.log(`= ${file} (tidak berubah)`)
    continue
  }
  const img = sharp(path, { failOn: 'none' }).rotate() // hormati orientasi EXIF
  const meta = await img.metadata()
  const ow = meta.autoOrient?.width ?? meta.width
  const oh = meta.autoOrient?.height ?? meta.height
  const widths = WIDTHS.filter((w) => w < ow).concat(ow < WIDTHS.at(-1) ? [ow] : [])
  const uniq = [...new Set(widths.length ? widths : [ow])].sort((a, b) => a - b)
  for (const w of uniq) {
    const r = img.clone().resize({ width: w, withoutEnlargement: true })
    await r.clone().avif({ quality: QUALITY.avif, effort: 4 }).toFile(join(OUT, `${key}-${w}.avif`))
    await r.clone().webp({ quality: QUALITY.webp }).toFile(join(OUT, `${key}-${w}.webp`))
    await r.clone().jpeg({ quality: QUALITY.jpg, mozjpeg: true }).toFile(join(OUT, `${key}-${w}.jpg`))
  }
  const lqipBuf = await img.clone().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer()
  const entry = {
    w: ow,
    h: oh,
    lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
    widths: uniq,
    base: `/media/photos/${key}`,
    formats: ['avif', 'webp', 'jpg'],
  }
  manifest[key] = entry
  cache[key] = { sig, entry }
  console.log(`✓ ${file} → ${uniq.join('/')}px (avif, webp, jpg)`)
}

writeFileSync(CACHE, JSON.stringify(cache))
writeFileSync(
  MANIFEST,
  `// File ini DIBUAT OTOMATIS oleh \`npm run media\`. Jangan diedit manual.\nimport type { MediaEntry } from '@/lib/media'\n\nexport const mediaManifest: Record<string, MediaEntry> = ${JSON.stringify(manifest, null, 2)}\n`,
)
console.log(`\nManifest: ${MANIFEST} (${Object.keys(manifest).length} foto)`)
