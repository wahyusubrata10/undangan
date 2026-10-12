/**
 * Membuat musik placeholder bernuansa gamelan semar pagulingan / rindik yang LEMBUT —
 * disintesis dari nol, bebas hak cipta. Laras pelog (patet selisir), tempo pelan,
 * dua pola kotekan (polos & sangsih) yang saling mengisi + gong/jegog panjang.
 * Output: public/audio/rindik-placeholder.mp3 (butuh ffmpeg). Ganti dengan musikmu sendiri kapan saja.
 *
 *   node scripts/make-placeholder-music.mjs
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SR = 44100
const BPM = 58
const BEAT = 60 / BPM
const STEP = BEAT / 4 // 16-an
const BARS = 16
const STEPS = BARS * 16
const LEN = STEPS * STEP
const N = Math.ceil(LEN * SR)
const out = new Float32Array(N)

// pelog selisir (perkiraan, dalam cent), oktaf dasar ~ E4
const base = 329.6
const pelog = [0, 120, 270, 540, 670].map((c) => base * Math.pow(2, c / 1200))
const note = (deg, oct = 0) => pelog[((deg % 5) + 5) % 5] * Math.pow(2, oct + Math.floor(deg / 5))

// suara bilah bambu: nada dasar + parsial inharmonis, serangan cepat, peluruhan eksponensial
function bamboo(freq, t0, vel = 0.5, decay = 1.1) {
  const start = Math.floor(t0 * SR)
  const len = Math.floor(decay * 2.5 * SR)
  const partials = [
    [1, 1, 1],
    [2.76, 0.32, 2.2],
    [5.4, 0.12, 3.5],
    [0.5, 0.18, 0.7],
  ]
  for (let i = 0; i < len; i++) {
    const t = i / SR
    const atk = Math.min(1, t / 0.012) // serangan lebih lembut
    let v = 0
    for (const [m, a, dk] of partials) v += a * Math.sin(2 * Math.PI * freq * m * t) * Math.exp((-t * dk) / decay)
    // ketukan pemukul yang sangat halus
    v += (Math.random() * 2 - 1) * 0.03 * Math.exp(-t * 160)
    const idx = (start + i) % N // wrap → loop mulus
    out[idx] += v * vel * atk
  }
}

// pola (derajat nada per 16-an, null = diam). polos & sangsih bergantian = kotekan
const polos = [0, null, 2, null, 1, null, 2, null, 0, null, 2, null, 3, null, 2, null]
const sangsih = [null, 4, null, 3, null, 4, null, 3, null, 1, null, 3, null, 4, null, 1]
const melody = [
  [0, 1, 2, 4],
  [3, 2, 1, 0],
  [2, 3, 4, 3],
  [2, 1, 0, -1],
]
for (let s = 0; s < STEPS; s++) {
  const bar = Math.floor(s / 16)
  const t = s * STEP + (s % 2 ? 0.012 : 0) // sedikit swing manusiawi
  const shift = melody[bar % 4][Math.floor((s % 16) / 4)]
  const p = polos[s % 16]
  const q = sangsih[s % 16]
  const dyn = 0.75 + 0.25 * Math.sin((s / STEPS) * Math.PI * 2)
  if (p !== null) bamboo(note(p + shift, 0), t, 0.12 * dyn, 0.7)
  if (q !== null) bamboo(note(q + shift, 0), t, 0.09 * dyn, 0.65)
  // melodi utama (lebih rendah, tiap ketukan)
  if (s % 4 === 0) bamboo(note(shift, -1), t, 0.3, 1.8)
  // jegog/gong panjang tiap birama
  if (s % 16 === 0) bamboo(note(shift, -2), t, 0.4, 3.6)
}

// reverb sederhana (beberapa delay feedback)
const wet = new Float32Array(N)
for (const [ms, g] of [
  [37, 0.3],
  [53, 0.26],
  [79, 0.22],
  [113, 0.18],
]) {
  const d = Math.floor((ms / 1000) * SR)
  for (let i = 0; i < N; i++) wet[i] += g * out[(i - d + N) % N]
}
for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) wet[i] += 0.35 * wet[(i - 2203 + N) % N]

let peak = 0
const mix = new Float32Array(N)
for (let i = 0; i < N; i++) {
  mix[i] = out[i] + wet[i] * 0.35
  peak = Math.max(peak, Math.abs(mix[i]))
}
const gain = 0.7 / peak

// tulis WAV 16-bit mono
const buf = Buffer.alloc(44 + N * 2)
buf.write('RIFF', 0)
buf.writeUInt32LE(36 + N * 2, 4)
buf.write('WAVEfmt ', 8)
buf.writeUInt32LE(16, 16)
buf.writeUInt16LE(1, 20)
buf.writeUInt16LE(1, 22)
buf.writeUInt32LE(SR, 24)
buf.writeUInt32LE(SR * 2, 28)
buf.writeUInt16LE(2, 32)
buf.writeUInt16LE(16, 34)
buf.write('data', 36)
buf.writeUInt32LE(N * 2, 40)
for (let i = 0; i < N; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(mix[i] * gain * 32767))), 44 + i * 2)

const wav = join(tmpdir(), `rindik-${Date.now()}.wav`)
writeFileSync(wav, buf)
mkdirSync('public/audio', { recursive: true })
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', '-ac', '1', 'public/audio/rindik-placeholder.mp3'])
rmSync(wav)
console.log(`✓ public/audio/rindik-placeholder.mp3 (${LEN.toFixed(1)} detik, loop, pelog)`)
