/**
 * ============================================================================
 *  KONTEN UNDANGAN — satu-satunya file yang perlu kamu edit.
 * ============================================================================
 *  • Bagian bertanda  TODO  masih berisi data contoh, ganti dengan data asli.
 *  • Foto: taruh file di `media-src/photos/`, tulis nama filenya di sini,
 *    lalu jalankan `npm run media`. Slot kosong ('') tampil sebagai placeholder.
 *  • Waktu memakai format ISO + offset. WITA = +08:00, WIB = +07:00, WIT = +09:00.
 * ============================================================================
 */
import type { WeddingConfig } from './types'

export const wedding: WeddingConfig = {
  meta: {
    title: 'Pawiwahan Wahyu & Diah',
    description:
      'Dengan memohon Asung Kertha Wara Nugraha Ida Sang Hyang Widhi Wasa, kami mengundang Anda pada hari bahagia kami. 1 Januari 2027.',
    siteUrl: '',
    defaultLang: 'id',
    langs: ['id', 'en'],
  },

  groom: {
    nick: 'Wahyu',
    fullName: 'Kadek Wahyu Dwi Putra Subrata',
    childOf: { id: 'Putra kedua dari', en: 'Second son of' },
    father: 'Bapak I Made ............', // TODO nama ayah
    mother: 'Ibu Ni Nyoman ............', // TODO nama ibu
    origin: { id: 'Br. ........, Bali', en: 'Br. ........, Bali' }, // TODO
    instagram: '', // TODO mis. 'wahyusubrata'
    photo: '', // TODO mis. 'groom.jpg'
  },

  bride: {
    nick: 'Diah',
    fullName: 'Kadek Diah Kencana Putri',
    childOf: { id: 'Putri kedua dari', en: 'Second daughter of' },
    father: 'Bapak I Wayan ............', // TODO
    mother: 'Ibu Ni Ketut ............', // TODO
    origin: { id: 'Br. ........, Bali', en: 'Br. ........, Bali' }, // TODO
    instagram: '',
    photo: '', // TODO mis. 'bride.jpg'
  },

  order: 'groom-first',

  eventTitle: { id: 'Pawiwahan', en: 'The Wedding of', ban: 'Pawiwahan' },

  // Countdown menuju mulai resepsi
  countdownTo: '2027-01-01T15:00:00+08:00',

  greeting: {
    opening: 'Om Swastyastu',
    openingSub: {
      id: 'Atas Asung Kertha Wara Nugraha Ida Sang Hyang Widhi Wasa',
      en: 'By the grace of Ida Sang Hyang Widhi Wasa',
    },
    intro: {
      id: 'Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i pada upacara Manusa Yadnya Pawiwahan (pernikahan) putra-putri kami:',
      en: 'With great respect, we joyfully invite you to celebrate the Manusa Yadnya Pawiwahan (wedding ceremony) of our beloved children:',
    },
    quote: {
      id: '“Wahai pasangan suami-istri, semoga kalian tetap bersatu dan tidak pernah terpisahkan. Semoga kalian mencapai hidup penuh kebahagiaan, tinggal di rumah yang penuh kegembiraan bersama seluruh keturunanmu.”',
      en: '“O couple, may you stay together here and never be separated. May you reach a full span of life, rejoicing in your home with your children and grandchildren.”',
    },
    quoteSource: 'Rgveda X.85.42',
    closing: 'Om Shanti Shanti Shanti Om',
    closingText: {
      id: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
      en: 'It would be an honour and a joy for us to have you with us and to receive your blessings.',
    },
    thanks: { id: 'Atas kehadiran dan doa restunya, kami ucapkan terima kasih.', en: 'Thank you for your presence and blessings.' },
  },

  guest: {
    fallbackName: { id: 'Tamu Undangan', en: 'Honoured Guest' },
    defaultSalutation: { id: 'Bapak/Ibu/Saudara/i', en: '' },
  },

  events: [
    // Contoh acara adat (hapus komentar & sesuaikan bila ingin ditampilkan):
    // {
    //   id: 'mesakapan',
    //   name: { id: 'Mesakapan', en: 'Mesakapan Ceremony' },
    //   start: '2027-01-01T09:00:00+08:00',
    //   end: '2027-01-01T12:00:00+08:00',
    //   tzLabel: 'WITA',
    //   venue: 'Kediaman Mempelai Pria',
    //   address: 'Jl. ..........., Bali',
    //   mapsUrl: 'https://maps.google.com/?q=Denpasar',
    //   mapsQuery: 'Denpasar, Bali',
    // },
    {
      id: 'resepsi',
      name: { id: 'Resepsi Pernikahan', en: 'Wedding Reception', ban: 'Resepsi' },
      start: '2027-01-01T15:00:00+08:00',
      end: '2027-01-01T21:00:00+08:00',
      tzLabel: 'WITA',
      venue: 'Kediaman Mempelai Pria', // TODO nama tempat
      address: 'Jl. ..........., Kab. ........, Bali', // TODO alamat lengkap
      mapsUrl: 'https://maps.google.com/?q=Denpasar,Bali', // TODO link Google Maps
      mapsQuery: 'Denpasar, Bali', // TODO koordinat "-8.65,115.21" atau nama tempat
      note: { id: 'Pukul 15.00 – 21.00 WITA', en: '3 PM – 9 PM (Central Indonesia Time)' },
    },
  ],

  liveStream: {
    enabled: false, // ubah ke true bila ada siaran langsung
    platform: 'YouTube',
    url: 'https://youtube.com/',
    note: { id: 'Bagi yang berhalangan hadir, saksikan momen bahagia kami secara langsung.', en: 'Can’t make it? Watch our special moment live.' },
  },

  story: {
    enabled: true,
    chapters: [
      // TODO isi cerita & foto kalian
      {
        date: '2019',
        title: { id: 'Pertemuan Pertama', en: 'First Meeting' },
        text: { id: 'Semesta mempertemukan kami di sebuah sore yang sederhana. Tak ada yang istimewa, selain senyum yang tertinggal lama.', en: 'The universe brought us together on an ordinary afternoon — nothing special, except a smile that lingered.' },
        photo: '',
      },
      {
        date: '2021',
        title: { id: 'Menjalin Kasih', en: 'Falling in Love' },
        text: { id: 'Dari obrolan panjang hingga perjalanan kecil, kami belajar saling memahami dan bertumbuh bersama.', en: 'From long conversations to small journeys, we learned to understand each other and grow together.' },
        photo: '',
      },
      {
        date: '2025',
        title: { id: 'Mesedek', en: 'The Proposal' },
        text: { id: 'Keluarga besar bertemu, restu diberikan. Kami memantapkan hati melangkah ke jenjang berikutnya.', en: 'Our families met and gave their blessing. We made up our minds to take the next step.' },
        photo: '',
      },
      {
        date: '2027',
        title: { id: 'Pawiwahan', en: 'The Wedding' },
        text: { id: 'Di hadapan Ida Sang Hyang Widhi, keluarga, dan sahabat, kami mengikat janji suci untuk selamanya.', en: 'Before the Divine, our families and friends, we make our sacred vow — forever.' },
        photo: '',
      },
    ],
  },

  photos: {
    hero: '', // TODO mis. 'hero.jpg' (portrait, min. 1600px)
    closing: '', // TODO mis. 'closing.jpg'
    // TODO isi 12+ foto galeri, mis. ['g01.jpg', 'g02.jpg', ...]
    gallery: ['', '', '', '', '', '', '', '', '', '', '', ''],
  },

  galleryVideos: [
    // { title: 'Prewedding Film', src: 'https://www.youtube.com/embed/XXXXXXXX', poster: 'video-poster.jpg' },
  ],

  video: {
    // TODO setelah `npm run media:video`, isi seperti:
    // background: { mp4: '/media/video/prewedding.mp4', webm: '/media/video/prewedding.webm', poster: 'prewedding-poster.jpg' },
    background: {},
    perSection: {},
  },

  gift: {
    enabled: true,
    intro: {
      id: 'Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, dapat melalui:',
      en: 'Your blessing is the greatest gift. Should you wish to send a token of love, you may do so through:',
    },
    accounts: [
      // TODO ganti dengan rekening asli
      { kind: 'bank', provider: 'BCA', number: '1234567890', holder: 'Kadek Wahyu Dwi Putra Subrata' },
      { kind: 'bank', provider: 'BRI', number: '0987654321098', holder: 'Kadek Diah Kencana Putri' },
      { kind: 'ewallet', provider: 'DANA', number: '081234567890', holder: 'Kadek Diah Kencana Putri' },
    ],
    qris: '', // TODO mis. 'qris.png'
    address: {
      recipient: 'Kadek Wahyu Dwi Putra Subrata',
      phone: '', // TODO
      text: 'Jl. ..........., Bali', // TODO
    },
  },

  rsvp: {
    enabled: true,
    maxGuests: 5,
    pageSize: 6,
  },

  music: {
    // Ganti dengan file musikmu sendiri di /public/audio (mp3, < 3 MB disarankan)
    src: '/audio/rindik-placeholder.mp3',
    title: 'Rindik — placeholder',
    startAt: 0,
    volume: 0.6,
  },

  share: {
    whatsappTemplate: {
      id: `Om Swastyastu

Kepada Yth.
{sapaan} *{nama}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang {sapaan} {nama} untuk hadir pada acara pernikahan kami:

*{mempelai}*
{tanggal}

Info lengkap & konfirmasi kehadiran:
{link}

Merupakan suatu kebahagiaan bagi kami apabila {sapaan} berkenan hadir dan memberikan doa restu.

Om Shanti Shanti Shanti Om`,
      en: `Om Swastyastu

Dear {nama},

We joyfully invite you to celebrate our wedding:

*{mempelai}*
{tanggal}

Details & RSVP:
{link}

Om Shanti Shanti Shanti Om`,
    },
  },
}
