const STORAGE_KEY = "dlbd_muted_v1";

interface ToneOptions {
  type?: OscillatorType;
  volume?: number;
  sweepTo?: number;
}

interface NoiseOptions {
  volume?: number;
  filterFreq?: number;
}

// All sound is synthesized at runtime via Web Audio (oscillators + filtered
// noise) rather than shipped audio files, consistent with the procedurally
// generated placeholder art — no external assets, no licensing questions.
class SfxEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean;

  constructor() {
    this.muted = typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";
  }

  // Must be called from a user-gesture handler (browsers block audio until
  // one occurs) — the Menu's Play button is the natural place.
  init(): void {
    if (this.ctx) return;
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextCtor();
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
    } catch {
      // storage unavailable — mute state just won't persist across sessions
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) return null;
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, durationMs: number, opts: ToneOptions = {}): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { type = "sine", volume = 0.15, sweepTo } = opts;
    const end = ctx.currentTime + durationMs / 1000;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (sweepTo !== undefined) {
      osc.frequency.linearRampToValueAtTime(sweepTo, end);
    }
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, end);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(end);
  }

  private noise(durationMs: number, opts: NoiseOptions = {}): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { volume = 0.12, filterFreq = 1200 } = opts;
    const end = ctx.currentTime + durationMs / 1000;

    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * (durationMs / 1000)));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, end);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  leverClick(): void {
    this.tone(520, 90, { type: "square", volume: 0.12 });
  }

  bridgeExtend(): void {
    this.tone(180, 220, { type: "sawtooth", volume: 0.12, sweepTo: 260 });
  }

  sawPause(): void {
    this.tone(700, 140, { type: "triangle", volume: 0.12, sweepTo: 900 });
  }

  springBoing(): void {
    this.tone(220, 260, { type: "sine", volume: 0.18, sweepTo: 660 });
  }

  fanWhoosh(): void {
    this.noise(500, { volume: 0.08, filterFreq: 900 });
  }

  hazardDeath(): void {
    this.tone(300, 260, { type: "sawtooth", volume: 0.16, sweepTo: 60 });
    this.noise(200, { volume: 0.1, filterFreq: 500 });
  }

  fallDeath(): void {
    this.tone(240, 320, { type: "sawtooth", volume: 0.14, sweepTo: 40 });
  }

  win(): void {
    const notes = [523.25, 659.25, 784.0, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => this.tone(freq, 160, { type: "square", volume: 0.14 }), i * 90);
    });
  }
}

export const Sfx = new SfxEngine();
