// The metronome's clock. Clicks are scheduled a little ahead on the audio clock, which
// keeps them in time however busy the page gets, and each beat is reported as it is
// heard so the display can follow along.

import { beatLength, beatSound, BeatSound } from "./beats"
import { Pattern } from "./settings"

export interface MetronomeOptions {
  bpm: number
  beatsPerBar: number
  pattern: Pattern
  accent: boolean
  // the beat of the bar being heard, from 0, or undefined once stopped
  onBeat: (beat: number | undefined) => void
}

const scheduleAhead = 0.12
const scheduleInterval = 25

export class Metronome {

  private options: MetronomeOptions
  private ctx?: AudioContext
  private output?: GainNode
  private sounds?: Record<"accent" | "click", AudioBuffer>

  private playing = false
  private timer?: ReturnType<typeof setInterval>
  private frame?: number

  private nextBeat = 0
  private nextTime = 0
  private pending: { beat: number, time: number }[] = []

  constructor(options: MetronomeOptions) {
    this.options = { ...options }
  }

  isPlaying(): boolean {
    return this.playing
  }

  // changes take effect from the next beat scheduled
  update(changes: Partial<Omit<MetronomeOptions, "onBeat">>) {
    Object.assign(this.options, changes)
    if (this.nextBeat >= this.options.beatsPerBar) {
      this.nextBeat = 0
    }
  }

  // start must be called from a tap or click: browsers (iOS Safari especially) only let
  // audio start from one
  start() {
    if (this.playing) {
      return
    }
    if (this.ctx == undefined) {
      this.open()
    }
    const ctx = this.ctx!
    // iOS stays silent with the ringer switched off unless told this is playback
    // rather than incidental sound
    const session = (navigator as any).audioSession
    if (session != undefined) {
      try { session.type = "playback" } catch { /* older browsers */ }
    }
    ctx.resume()

    this.playing = true
    this.nextBeat = 0
    // a moment's grace, so the first click isn't clipped
    this.nextTime = ctx.currentTime + 0.06
    this.pending = []
    this.schedule()
    this.timer = setInterval(() => this.schedule(), scheduleInterval)
    this.frame = requestAnimationFrame(() => this.track())
  }

  stop() {
    this.playing = false
    if (this.timer != undefined) {
      clearInterval(this.timer)
      this.timer = undefined
    }
    if (this.frame != undefined) {
      cancelAnimationFrame(this.frame)
      this.frame = undefined
    }
    // cut off anything already scheduled
    if (this.ctx != undefined) {
      this.output?.disconnect()
      this.output = this.ctx.createGain()
      this.output.connect(this.ctx.destination)
    }
    this.pending = []
    this.options.onBeat(undefined)
  }

  // resume picks up again after the page comes back from the background, where the
  // audio may have been interrupted
  resume() {
    if (!this.playing || this.ctx == undefined) {
      return
    }
    this.ctx.resume()
    this.realign()
  }

  dispose() {
    this.stop()
    this.ctx?.close()
    this.ctx = undefined
  }

  private open() {
    const Context = typeof AudioContext != "undefined"
      ? AudioContext : (window as any).webkitAudioContext
    if (Context == undefined) {
      throw new Error("this browser cannot play audio")
    }
    const ctx: AudioContext = new Context()
    this.ctx = ctx
    this.output = ctx.createGain()
    this.output.connect(ctx.destination)
    this.sounds = {
      click: clickSound(ctx, 1000),
      accent: clickSound(ctx, 1600),
    }
  }

  // after a stall (the page hidden, the audio interrupted) the schedule falls behind;
  // rather than play every missed click at once it starts again from now
  private realign() {
    const now = this.ctx!.currentTime
    if (this.nextTime < now) {
      this.nextTime = now + 0.05
      this.pending = []
    }
  }

  private schedule() {
    const ctx = this.ctx
    if (ctx == undefined || !this.playing) {
      return
    }
    this.realign()
    while (this.nextTime < ctx.currentTime + scheduleAhead) {
      const beat = this.nextBeat
      const sound = beatSound(beat, this.options.pattern, this.options.accent)
      this.play(sound, this.nextTime)
      this.pending.push({ beat, time: this.nextTime })
      this.nextTime += beatLength(this.options.bpm)
      this.nextBeat = (beat + 1) % this.options.beatsPerBar
    }
  }

  private track() {
    const ctx = this.ctx
    if (ctx == undefined || !this.playing) {
      return
    }
    const now = ctx.currentTime
    const unheard = this.pending.findIndex(p => p.time > now)
    const numHeard = unheard == -1 ? this.pending.length : unheard
    if (numHeard > 0) {
      const heard = this.pending[numHeard - 1]
      this.pending.splice(0, numHeard)
      this.options.onBeat(heard.beat)
    }
    this.frame = requestAnimationFrame(() => this.track())
  }

  private play(sound: BeatSound, time: number) {
    if (sound == "silent") {
      return
    }
    const source = this.ctx!.createBufferSource()
    source.buffer = this.sounds![sound]
    source.connect(this.output!)
    source.start(time)
  }
}

// clickSound makes a short woodblock-like click: a pitched ping that dies away fast,
// with a touch of noise at the front for the attack. Made once, it sounds exactly the
// same every time.
function clickSound(ctx: AudioContext, frequency: number): AudioBuffer {
  const rate = ctx.sampleRate
  const length = Math.floor(rate * 0.05)
  const buffer = ctx.createBuffer(1, length, rate)
  const data = buffer.getChannelData(0)
  // the same noise each time, so every click really is identical
  let seed = 1
  const noise = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 1073741823.5 - 1
  }
  for (let i = 0; i < length; i++) {
    const t = i / rate
    const attack = Math.min(1, t / 0.0008)
    const tone = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t / 0.012)
    const tick = noise() * Math.exp(-t / 0.0015)
    data[i] = 0.8 * attack * (tone * 0.8 + tick * 0.35)
  }
  return buffer
}
