// Procedural Calming Web Audio API Service
// 100% offline, zero network dependencies, non-jarring soft acoustic synthesis

export type AmbientSoundType = 'rain' | 'ocean' | 'birds' | 'forest' | 'tones' | 'bells';

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeAmbients: Map<AmbientSoundType, { stop: () => void; gainNode: GainNode }> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  // Quick unlock for touch events
  public unlock() {
    this.initContext();
  }

  // --- SHORT CALMING INTERACTION SOUNDS ---

  // 1. Soft bubble pop
  public playBubblePop(pitchMod: number = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      osc.type = 'sine';
      const baseFreq = (260 + Math.random() * 80) * pitchMod;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.07);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext might be blocked until gesture
    }
  }

  // 2. Soft water droplet
  public playWaterDrop(pitch: number = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = (480 + (Math.random() - 0.5) * 80) * pitch;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.1, now + 0.14);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch {
      // Ignore
    }
  }

  // 3. Gentle pentatonic chime
  public playChime(noteIndex?: number) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      const note = noteIndex !== undefined 
        ? pentatonic[noteIndex % pentatonic.length]
        : pentatonic[Math.floor(Math.random() * pentatonic.length)];

      const now = this.ctx.currentTime;
      
      // Fundamental
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(note, now);

      // Soft harmonic
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(note * 2, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.06, now + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(this.masterGain);
      gain2.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.65);
      osc2.stop(now + 1.65);
    } catch {
      // Ignore
    }
  }

  // 4. Drawing soft whisper stroke
  public playDrawingStroke() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320 + Math.random() * 100, now);
      filter.Q.setValueAtTime(3, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore
    }
  }

  // 5. Firefly glow hum
  public playFireflyGlow() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.linearRampToValueAtTime(580, now + 0.3);
      osc.frequency.linearRampToValueAtTime(520, now + 0.6);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.75);
    } catch {
      // Ignore
    }
  }

  // --- AMBIENT SOUND GENERATORS ---

  public isAmbientPlaying(type: AmbientSoundType): boolean {
    return this.activeAmbients.has(type);
  }

  public getPlayingAmbients(): AmbientSoundType[] {
    return Array.from(this.activeAmbients.keys());
  }

  public toggleAmbient(type: AmbientSoundType): boolean {
    if (this.activeAmbients.has(type)) {
      this.stopAmbient(type);
      return false;
    } else {
      this.startAmbient(type);
      return true;
    }
  }

  public stopAllAmbients() {
    this.activeAmbients.forEach((item) => {
      item.stop();
    });
    this.activeAmbients.clear();
  }

  public stopAmbient(type: AmbientSoundType) {
    const active = this.activeAmbients.get(type);
    if (active) {
      active.stop();
      this.activeAmbients.delete(type);
    }
  }

  public startAmbient(type: AmbientSoundType) {
    if (this.activeAmbients.has(type)) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    let stopFn: () => void = () => {};
    const ambientGain = this.ctx.createGain();
    ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 1.2);
    ambientGain.connect(this.masterGain);

    switch (type) {
      case 'rain':
        stopFn = this.createRainSynthesizer(ambientGain);
        break;
      case 'ocean':
        stopFn = this.createOceanSynthesizer(ambientGain);
        break;
      case 'birds':
        stopFn = this.createBirdsSynthesizer(ambientGain);
        break;
      case 'forest':
        stopFn = this.createForestSynthesizer(ambientGain);
        break;
      case 'tones':
        stopFn = this.createTonesSynthesizer(ambientGain);
        break;
      case 'bells':
        stopFn = this.createBellsSynthesizer(ambientGain);
        break;
    }

    this.activeAmbients.set(type, {
      stop: () => {
        if (this.ctx) {
          ambientGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.4);
          setTimeout(() => {
            stopFn();
            ambientGain.disconnect();
          }, 800);
        } else {
          stopFn();
        }
      },
      gainNode: ambientGain
    });
  }

  // Create pink/brown noise buffer
  private createNoiseBuffer(duration: number = 3): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Gentle brown noise filtering
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  // 1. Rain Synthesizer
  private createRainSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const noiseBuffer = this.createNoiseBuffer(4);
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Filter for gentle rain sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 1.2;

    source.connect(filter);
    filter.connect(targetGain);
    source.start();

    return () => {
      try { source.stop(); } catch { /* ignore */ }
    };
  }

  // 2. Ocean Waves Synthesizer
  private createOceanSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const noiseBuffer = this.createNoiseBuffer(5);
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    // LFO to modulate wave surge volume every 7-8 seconds
    const waveGain = this.ctx.createGain();
    waveGain.gain.value = 0.5;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // ~8 second cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.35;

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(targetGain);

    source.start();
    lfo.start();

    return () => {
      try {
        source.stop();
        lfo.stop();
      } catch { /* ignore */ }
    };
  }

  // 3. Birds Synthesizer
  private createBirdsSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    let isRunning = true;
    let timeoutId: number | null = null;

    const chirp = () => {
      if (!isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 2200 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.12);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(targetGain);

      osc.start(now);
      osc.stop(now + 0.15);

      // Schedule next chirp in 2.5 - 6 seconds
      const nextTime = 2500 + Math.random() * 3500;
      timeoutId = window.setTimeout(chirp, nextTime);
    };

    chirp();

    return () => {
      isRunning = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }

  // 4. Forest Synthesizer
  private createForestSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const noiseBuffer = this.createNoiseBuffer(4);
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 320;

    source.connect(windFilter);
    windFilter.connect(targetGain);
    source.start();

    return () => {
      try { source.stop(); } catch { /* ignore */ }
    };
  }

  // 5. Soft Tones (Calm 432Hz ambient chord)
  private createTonesSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const chord = [216, 324, 432, 540]; // Harmonic series based on 432Hz
    const oscs: OscillatorNode[] = [];

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slight detune for warm chorusing
      osc.detune.value = (i % 2 === 0 ? 3 : -3);

      gain.gain.value = 0.12 / chord.length;
      osc.connect(gain);
      gain.connect(targetGain);
      osc.start();
      oscs.push(osc);
    });

    return () => {
      oscs.forEach((osc) => {
        try { osc.stop(); } catch { /* ignore */ }
      });
    };
  }

  // 6. Gentle Bells / Singing Bowl
  private createBellsSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    let isRunning = true;
    let timerId: number | null = null;

    const bellNotes = [330, 392, 440, 523.25, 659.25]; // E, G, A, C, E

    const strikeBell = () => {
      if (!isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = bellNotes[Math.floor(Math.random() * bellNotes.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);

      osc.connect(gain);
      gain.connect(targetGain);

      osc.start(now);
      osc.stop(now + 4.1);

      // Repeat every 4-7 seconds
      timerId = window.setTimeout(strikeBell, 4000 + Math.random() * 3000);
    };

    strikeBell();

    return () => {
      isRunning = false;
      if (timerId) clearTimeout(timerId);
    };
  }
}

export const audioService = new AudioService();
