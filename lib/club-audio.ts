/** Original 128 BPM electronic loop; no third-party recordings or audio downloads. */
export class ClubAudio {
  private master: GainNode
  private bus: DynamicsCompressorNode
  private noise: AudioBuffer
  private timer: ReturnType<typeof setInterval> | null = null
  private step = 0
  private next = 0

  constructor(private context: AudioContext) {
    this.master = context.createGain()
    this.master.gain.value = 0
    this.bus = context.createDynamicsCompressor()
    this.bus.threshold.value = -18
    this.bus.ratio.value = 5
    this.bus.connect(this.master)
    this.master.connect(context.destination)
    this.noise = context.createBuffer(1, context.sampleRate * .25, context.sampleRate)
    const data = this.noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }

  private tone(time: number, frequency: number, duration: number, volume: number, type: OscillatorType = 'triangle') {
    const oscillator = this.context.createOscillator(), gain = this.context.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(.0001, time)
    gain.gain.exponentialRampToValueAtTime(volume, time + .012)
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration)
    oscillator.connect(gain).connect(this.bus)
    oscillator.start(time)
    oscillator.stop(time + duration + .02)
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
  }

  private percussion(time: number, clap: boolean) {
    const source = this.context.createBufferSource(), filter = this.context.createBiquadFilter(), gain = this.context.createGain()
    source.buffer = this.noise
    filter.type = 'highpass'
    filter.frequency.value = clap ? 1100 : 7000
    gain.gain.setValueAtTime(clap ? .15 : .045, time)
    gain.gain.exponentialRampToValueAtTime(.0001, time + (clap ? .16 : .045))
    source.connect(filter).connect(gain).connect(this.bus)
    source.start(time)
    source.stop(time + .2)
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect() }
  }

  private schedule() {
    const sixteenth = 60 / 128 / 4
    // Resume cleanly after browser background-tab throttling, without catch-up bursts.
    if (this.next < this.context.currentTime - .2) this.next = this.context.currentTime + .03
    while (this.next < this.context.currentTime + .15) {
      const beat = this.step % 16, bar = Math.floor(this.step / 16) % 8, time = this.next
      const root = [45, 41, 48, 43][Math.floor(bar / 2)]
      const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)
      if (beat % 4 === 0) {
        const kick = this.context.createOscillator(), gain = this.context.createGain()
        kick.frequency.setValueAtTime(145, time)
        kick.frequency.exponentialRampToValueAtTime(43, time + .14)
        gain.gain.setValueAtTime(.5, time)
        gain.gain.exponentialRampToValueAtTime(.0001, time + .28)
        kick.connect(gain).connect(this.bus); kick.start(time); kick.stop(time + .3)
        kick.onended = () => { kick.disconnect(); gain.disconnect() }
      }
      if (beat % 2 === 1) this.percussion(time, false)
      if (beat === 4 || beat === 12) this.percussion(time, true)
      if ([2, 6, 10, 14].includes(beat)) this.tone(time, hz(root), .17, .17, 'sine')
      if (beat === 0 || beat === 8) for (const note of [0, 7, 12]) this.tone(time + .035, hz(root + note + 12), .65, .025)
      if (beat % 2 === 0) {
        const motif = [0, 7, 12, 10, 7, 3, 7, 14]
        this.tone(time, hz(root + 24 + motif[beat / 2]), .16, bar < 4 ? .027 : .04)
      }
      this.step = (this.step + 1) % 128
      this.next += sixteenth
    }
  }

  async start() {
    await this.context.resume()
    this.next = this.context.currentTime + .03
    this.master.gain.cancelScheduledValues(this.context.currentTime)
    this.master.gain.setValueAtTime(0, this.context.currentTime)
    this.master.gain.linearRampToValueAtTime(.45, this.context.currentTime + .3)
    this.schedule()
    if (!this.timer) this.timer = setInterval(() => this.schedule(), 50)
  }

  async stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.master.gain.cancelScheduledValues(this.context.currentTime)
    this.master.gain.setTargetAtTime(0, this.context.currentTime, .025)
    await new Promise(resolve => setTimeout(resolve, 120))
    if (this.context.state !== 'closed') await this.context.suspend()
  }

  dispose() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    if (this.context.state !== 'closed') void this.context.close()
  }
}
