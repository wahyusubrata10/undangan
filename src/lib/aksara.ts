/**
 * Transliterasi sederhana Latin → Aksara Bali (Unicode U+1B00–U+1B7F).
 *
 * Ini pendekatan fonetis dasar: cukup untuk dekorasi nama panggilan pendek,
 * tetapi BELUM mengikuti seluruh kaidah pasang aksara (mis. pepet vs taling,
 * aksara murda, wréastra vs swalalita). Untuk hasil yang benar secara adat,
 * isi `aksara` manual di config dan minta dicek penutur/ahli aksara Bali.
 */

const CONS: Record<string, string> = {
  kh: 'ᬔ', gh: 'ᬖ', ng: 'ᬗ', ny: 'ᬜ', th: 'ᬣ', dh: 'ᬥ', ph: 'ᬨ', bh: 'ᬪ', sy: 'ᬰ',
  k: 'ᬓ', g: 'ᬕ', c: 'ᬘ', j: 'ᬚ', t: 'ᬢ', d: 'ᬤ', n: 'ᬦ', p: 'ᬧ', b: 'ᬩ', m: 'ᬫ',
  y: 'ᬬ', r: 'ᬭ', l: 'ᬮ', w: 'ᬯ', v: 'ᬯ', s: 'ᬲ', h: 'ᬳ', f: 'ᬧ', z: 'ᬚ', q: 'ᬓ', x: 'ᬓ᭄ᬲ',
}
const VOWEL_IND: Record<string, string> = { a: 'ᬅ', i: 'ᬇ', u: 'ᬉ', e: 'ᬏ', o: 'ᬑ' }
const VOWEL_SIGN: Record<string, string> = { a: '', i: 'ᬶ', u: 'ᬸ', e: 'ᬾ', o: 'ᭀ' }
const ADEG = '᭄' // adeg-adeg / virama (juga membentuk gantungan bila diikuti konsonan)
const CECEK = 'ᬂ' // -ng
const SURANG = 'ᬃ' // -r
const BISAH = 'ᬄ' // -h
const CARIK = '᭞'

const VOWELS = 'aeiou'
const consKeys = Object.keys(CONS).sort((a, b) => b.length - a.length)

function readCons(s: string, i: number): string | null {
  for (const k of consKeys) if (s.startsWith(k, i)) return k
  return null
}

function wordToAksara(word: string): string {
  const w = word.toLowerCase().replace(/[^a-zé]/g, '').replace(/é/g, 'e')
  let out = ''
  let i = 0
  while (i < w.length) {
    const ch = w[i]!
    if (VOWELS.includes(ch)) {
      const prev = w[i - 1]
      // vokal bertemu vokal: sisipkan semivokal (i+a → ya, u+a → wa), mis. Diah → di-yah
      if (prev === 'i' || prev === 'e') out += CONS.y + VOWEL_SIGN[ch]
      else if (prev === 'u' || prev === 'o') out += CONS.w + VOWEL_SIGN[ch]
      else out += VOWEL_IND[ch]
      i++
      continue
    }
    const c = readCons(w, i)
    if (!c) {
      i++
      continue
    }
    const after = i + c.length
    const next = w[after]
    if (next && VOWELS.includes(next)) {
      out += CONS[c] + VOWEL_SIGN[next]
      i = after + 1
      continue
    }
    // konsonan tanpa vokal
    const atEnd = after >= w.length
    if (atEnd) {
      if (c === 'ng') out += CECEK
      else if (c === 'r') out += SURANG
      else if (c === 'h') out += BISAH
      else out += CONS[c] + ADEG
    } else if (c === 'ng') {
      out += CECEK
    } else if (c === 'r') {
      out += SURANG
    } else {
      // gugus konsonan → gantungan (virama + konsonan berikut)
      out += CONS[c] + ADEG
    }
    i = after
  }
  return out
}

export function toAksaraBali(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w === '&' ? CARIK : wordToAksara(w)))
    .join(' ')
}
