import type { Lang } from '@/i18n'

/** Teks yang bisa satu bahasa (string) atau multi-bahasa ({ id, en, ban }). */
export type L = string | Partial<Record<Lang, string>>

/**
 * Referensi foto. Isi dengan:
 *  - nama file di `media-src/photos` (mis. 'hero.jpg') lalu jalankan `npm run media`, atau
 *  - URL lengkap (https://...), atau
 *  - '' (kosong) → tampil placeholder ornamen.
 */
export type PhotoRef = string

export interface Person {
  /** Nama panggilan, dipakai di judul besar. */
  nick: string
  fullName: string
  /** Opsional: tulis aksara Bali manual (lebih akurat dari transliterasi otomatis). */
  aksara?: string
  /** Mis. "Putra kedua dari" */
  childOf: L
  father: string
  mother: string
  /** Alamat/banjar keluarga, opsional. */
  origin?: L
  instagram?: string
  photo: PhotoRef
}

export interface WeddingEvent {
  id: string
  /** Mis. "Resepsi", "Mesakapan", "Pawiwahan" */
  name: L
  /** Format ISO dengan offset zona waktu, mis. '2027-01-01T15:00:00+08:00' (WITA = +08:00). */
  start: string
  end: string
  /** Label zona waktu yang ditampilkan. */
  tzLabel: 'WITA' | 'WIB' | 'WIT'
  venue: string
  address: L
  /** Link Google Maps (share link). */
  mapsUrl: string
  /** Query/koordinat untuk embed peta, mis. '-8.6705,115.2126' atau 'Puri Agung Denpasar'. */
  mapsQuery: string
  note?: L
}

export interface StoryChapter {
  date: L
  title: L
  text: L
  photo: PhotoRef
}

export interface GiftAccount {
  kind: 'bank' | 'ewallet'
  provider: string
  number: string
  holder: string
}

export interface VideoSource {
  /** Path di /public, mis. '/media/video/prewedding.mp4' */
  mp4?: string
  webm?: string
  /** Gambar poster (wajib jika video diisi). Bisa PhotoRef. */
  poster?: PhotoRef
}

export interface WeddingConfig {
  meta: {
    title: L
    description: L
    /** URL produksi, mis. https://wahyu-diah.vercel.app (dipakai link admin & OG). Kosongkan → otomatis. */
    siteUrl?: string
    defaultLang: Lang
    /** Bahasa yang muncul di pemilih bahasa. */
    langs: Lang[]
  }
  groom: Person
  bride: Person
  /** Urutan tampil: 'groom-first' atau 'bride-first' */
  order: 'groom-first' | 'bride-first'
  /** Nama acara utama, tampil di cover & OG. */
  eventTitle: L
  /** Tanggal utama untuk countdown (ISO dengan offset). */
  countdownTo: string
  greeting: {
    opening: L
    openingSub: L
    intro: L
    quote: L
    quoteSource: L
    closing: L
    closingText: L
    thanks: L
  }
  guest: {
    /** Nama default jika tidak ada ?to= */
    fallbackName: L
    /** Sapaan default jika tidak ada ?sapaan= */
    defaultSalutation: L
  }
  events: WeddingEvent[]
  liveStream: {
    enabled: boolean
    platform: string
    url: string
    note?: L
  }
  story: {
    enabled: boolean
    chapters: StoryChapter[]
  }
  photos: {
    hero: PhotoRef
    closing: PhotoRef
    gallery: PhotoRef[]
  }
  /** Video tambahan di galeri (YouTube embed URL atau path mp4 di /public). */
  galleryVideos: { title?: L; src: string; poster?: PhotoRef }[]
  video: {
    /** Video background utama. */
    background: VideoSource
    /**
     * Opsional: video berbeda per section (id section → video). Akan di-crossfade.
     * Contoh: { story: { mp4: '/media/video/story.mp4', poster: 'story-poster.jpg' } }
     */
    perSection?: Partial<Record<SectionId, VideoSource>>
  }
  gift: {
    enabled: boolean
    intro: L
    accounts: GiftAccount[]
    qris?: PhotoRef
    address?: { recipient: string; phone?: string; text: L }
  }
  rsvp: {
    enabled: boolean
    maxGuests: number
    /** Jumlah ucapan per halaman */
    pageSize: number
  }
  music: {
    src: string
    title: L
    /** Mulai dari detik ke- */
    startAt?: number
    volume: number
  }
  share: {
    /**
     * Template pesan WhatsApp untuk generator link di /admin.
     * Placeholder: {sapaan} {nama} {link} {mempelai} {tanggal}
     */
    whatsappTemplate: L
  }
}

export type SectionId =
  | 'cover'
  | 'opening'
  | 'countdown'
  | 'couple'
  | 'story'
  | 'events'
  | 'live'
  | 'gallery'
  | 'gift'
  | 'rsvp'
  | 'closing'
