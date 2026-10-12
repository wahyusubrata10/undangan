/**
 * Pemutar musik tunggal dengan fade-in (WebAudio) & analyser untuk visualizer.
 * Jatuh ke <audio> biasa bila WebAudio tidak tersedia / gagal.
 */
type Listener = (playing: boolean) => void

class MusicPlayer {
  private el: HTMLAudioElement | null = null
  private ctx: AudioContext | null = null
  private gain: GainNode | null = null
  analyser: AnalyserNode | null = null
  private listeners = new Set<Listener>()
  private targetVolume = 0.6
  private userPaused = false
  playing = false

  init(src: string, volume: number, startAt = 0) {
    if (this.el || typeof window === 'undefined') return
    const el = new Audio()
    el.src = src
    el.loop = true
    el.preload = 'none'
    el.crossOrigin = 'anonymous'
    el.currentTime = startAt
    this.targetVolume = volume
    el.addEventListener('play', () => this.set(true))
    el.addEventListener('pause', () => this.set(false))
    this.el = el
    // pause otomatis saat tab disembunyikan, lanjut saat kembali (kecuali user menjeda)
    document.addEventListener('visibilitychange', () => {
      if (!this.el) return
      if (document.hidden) this.el.pause()
      else if (!this.userPaused && this.ctxStarted) void this.play(false)
    })
  }

  private ctxStarted = false

  private ensureGraph() {
    if (!this.el || this.ctx) return
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      const srcNode = this.ctx.createMediaElementSource(this.el)
      this.gain = this.ctx.createGain()
      this.gain.gain.value = 0
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 64
      this.analyser.smoothingTimeConstant = 0.8
      srcNode.connect(this.gain).connect(this.analyser).connect(this.ctx.destination)
    } catch {
      this.ctx = null
      this.gain = null
      this.analyser = null
    }
  }

  /** Harus dipanggil dari gesture pengguna (tap) agar diizinkan browser. */
  async play(fade = true) {
    if (!this.el) return
    this.ensureGraph()
    this.ctxStarted = true
    this.userPaused = false
    try {
      if (this.ctx?.state === 'suspended') await this.ctx.resume()
      if (this.gain && this.ctx) {
        const now = this.ctx.currentTime
        this.gain.gain.cancelScheduledValues(now)
        this.gain.gain.setValueAtTime(fade ? 0 : this.gain.gain.value, now)
        this.gain.gain.linearRampToValueAtTime(this.targetVolume, now + (fade ? 2.4 : 0.4))
      } else {
        this.el.volume = this.targetVolume
      }
      await this.el.play()
    } catch {
      /* autoplay ditolak — tombol musik tetap bisa dipakai */
    }
  }

  pause() {
    if (!this.el) return
    this.userPaused = true
    if (this.gain && this.ctx) {
      const now = this.ctx.currentTime
      this.gain.gain.cancelScheduledValues(now)
      this.gain.gain.setValueAtTime(this.gain.gain.value, now)
      this.gain.gain.linearRampToValueAtTime(0, now + 0.35)
      window.setTimeout(() => this.el?.pause(), 360)
    } else this.el.pause()
  }

  toggle() {
    if (this.playing) this.pause()
    else void this.play(false)
  }

  private set(v: boolean) {
    this.playing = v
    this.listeners.forEach((l) => l(v))
  }

  subscribe(l: Listener) {
    this.listeners.add(l)
    return () => {
      this.listeners.delete(l)
    }
  }
}

export const music = new MusicPlayer()
