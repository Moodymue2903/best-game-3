// SKYFLOCK — synthesized sound. WebAudio only, no audio files: every
// sound is a few oscillators and a noise buffer built at runtime.
export class SkyflockAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  tone(freq, dur, type, vol, slideTo, delay = 0) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(dur, vol, filterFreq, delay = 0) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(t0);
  }

  // One named cue per sim event.
  play(event) {
    if (!this.ctx) return;
    switch (event.type) {
      case 'roost':
        // A happy two-note chirp.
        this.tone(880, 0.09, 'sine', 0.25, 1320);
        this.tone(1320, 0.12, 'sine', 0.2, 1760, 0.08);
        break;
      case 'zap':
        this.tone(1800, 0.08, 'square', 0.18, 300);
        this.noise(0.12, 0.22, 4000);
        break;
      case 'crowDown':
        this.tone(320, 0.25, 'sawtooth', 0.2, 90);
        this.noise(0.2, 0.15, 1200);
        break;
      case 'scatter':
        // A sad descending caw.
        this.tone(520, 0.22, 'sawtooth', 0.18, 220);
        break;
      case 'sulk':
        this.tone(440, 0.18, 'triangle', 0.18, 330);
        break;
      case 'peck':
        this.tone(140, 0.15, 'square', 0.25, 70);
        this.noise(0.1, 0.2, 800);
        break;
      case 'chest':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'sine', 0.22, 0, i * 0.07));
        break;
      case 'waveClear':
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.22, 0, i * 0.09));
        break;
      case 'waveFail':
        [392, 330, 262].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.22, 0, i * 0.12));
        break;
      case 'relic':
        this.tone(784, 0.15, 'sine', 0.22, 1175);
        this.tone(1175, 0.2, 'sine', 0.2, 1568, 0.1);
        break;
      case 'bossHit':
        this.noise(0.25, 0.3, 2500);
        this.tone(220, 0.3, 'sawtooth', 0.22, 55);
        break;
      case 'victory':
        [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.25, 0, i * 0.13));
        break;
      case 'defeat':
        [330, 294, 262, 196].forEach((f, i) => this.tone(f, 0.4, 'triangle', 0.22, 0, i * 0.18));
        break;
      default:
        break;
    }
  }
}
