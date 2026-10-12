#!/usr/bin/env bash
# Kompres video prewedding untuk background (butuh ffmpeg).
#
#   npm run media:video                 → proses semua video di media-src/video/
#   bash scripts/compress-video.sh a.mov → proses satu file
#
# Hasil di public/media/video/:
#   <nama>.mp4   H.264, 720p, tanpa audio, faststart (diputar sambil diunduh)
#   <nama>.webm  VP9,   720p, tanpa audio (lebih kecil di Chrome/Android)
#   media-src/photos/<nama>-poster.jpg  frame pertama → lalu jalankan `npm run media`
#
# Target ukuran: < 4 MB per 20 detik. Video background sebaiknya 10–25 detik & loop.
set -euo pipefail

OUT=public/media/video
mkdir -p "$OUT" media-src/photos
WIDTH=${WIDTH:-1280}     # lebar maks (720p). Untuk portrait: atur HEIGHT
CRF_H264=${CRF_H264:-27} # makin besar = makin kecil & buram (23–30)
CRF_VP9=${CRF_VP9:-36}   # 31–40
MAXDUR=${MAXDUR:-25}     # potong ke N detik pertama

files=("$@")
if [ ${#files[@]} -eq 0 ]; then
  shopt -s nullglob nocaseglob
  files=(media-src/video/*.{mp4,mov,m4v,webm,mkv})
fi
if [ ${#files[@]} -eq 0 ]; then
  echo "Tidak ada video di media-src/video/"; exit 0
fi

for f in "${files[@]}"; do
  name=$(basename "${f%.*}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  echo "▶ $f"
  # skala: sisi terpanjang = WIDTH, jaga rasio, dimensi genap
  scale="scale='if(gt(iw,ih),min($WIDTH,iw),-2)':'if(gt(iw,ih),-2,min($WIDTH,ih))'"

  ffmpeg -y -loglevel error -i "$f" -t "$MAXDUR" -an \
    -vf "$scale,fps=30,format=yuv420p" \
    -c:v libx264 -profile:v high -preset slow -crf "$CRF_H264" -movflags +faststart \
    "$OUT/$name.mp4"

  ffmpeg -y -loglevel error -i "$f" -t "$MAXDUR" -an \
    -vf "$scale,fps=30" \
    -c:v libvpx-vp9 -b:v 0 -crf "$CRF_VP9" -row-mt 1 -deadline good -cpu-used 2 \
    "$OUT/$name.webm"

  ffmpeg -y -loglevel error -i "$f" -vf "$scale" -frames:v 1 -q:v 3 "media-src/photos/$name-poster.jpg"

  echo "  ✓ $OUT/$name.mp4  ($(du -h "$OUT/$name.mp4" | cut -f1))"
  echo "  ✓ $OUT/$name.webm ($(du -h "$OUT/$name.webm" | cut -f1))"
  echo "  ✓ media-src/photos/$name-poster.jpg  → jalankan: npm run media"
  echo "  Config: background: { mp4: '/media/video/$name.mp4', webm: '/media/video/$name.webm', poster: '$name-poster.jpg' }"
done
