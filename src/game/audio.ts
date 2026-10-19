// Synthesized Web Audio API sound effects for Block Blast

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Check initial mute state from localStorage
    try {
      const stored = localStorage.getItem('block_blast_muted');
      this.muted = stored === 'true';
    } catch {
      this.muted = false;
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('block_blast_muted', String(this.muted));
    } catch {}
    return this.muted;
  }

  public playButtonClick() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playPick() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.07);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playDrop() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub thud
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.09);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // Click snap
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(600, now);
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.04);
  }

  public playLineClear(linesCleared: number, comboCount: number) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Pentatonic scale base notes (C, D, E, G, A)
    const baseScale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const comboIndex = Math.min(comboCount, baseScale.length - 3);
    const rootFreq = baseScale[comboIndex];

    const notes = [
      rootFreq,
      rootFreq * (linesCleared >= 2 ? 1.25 : 1.2), // Major 3rd or minor 3rd
      rootFreq * 1.5, // 5th
    ];
    if (linesCleared >= 3) {
      notes.push(rootFreq * 2.0); // Octave
    }
    if (linesCleared >= 4) {
      notes.push(rootFreq * 2.5);
    }

    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      const noteDuration = 0.35 + idx * 0.05;
      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + noteDuration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + noteDuration);
    });
  }

  public playComboFanfare(comboCount: number) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;

    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.06);

      gain.gain.setValueAtTime(0.18, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.35);
    });
  }

  public playGameOver() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [440, 415.3, 392, 349.23];
    const now = this.ctx.currentTime;

    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.12);

      gain.gain.setValueAtTime(0.2, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.45);
    });
  }
}

export const soundEngine = new SoundEngine();
