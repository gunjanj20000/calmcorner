// High-Fidelity Procedural Calming Web Audio Service
// 100% offline, zero network dependencies, non-jarring acoustic & ambient synthesis

export type AmbientSoundType = 'rain' | 'ocean' | 'birds' | 'forest' | 'tones' | 'bells' | 'custom';

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientMasterGain: GainNode | null = null;
  private activeAmbients: Map<AmbientSoundType, { stop: () => void; gainNode: GainNode }> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private customAudioEl: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientMasterGain = this.ctx.createGain();
      this.ambientMasterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.ambientMasterGain.connect(this.masterGain);

      // Visibility change handler to resume context when returning to tab
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        });
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setCustomAudioBlob(blob: Blob | null) {
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
      this.customAudioUrl = null;
    }
    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl.src = '';
      this.customAudioEl = null;
    }

    if (blob) {
      try {
        this.customAudioUrl = URL.createObjectURL(blob);
        this.customAudioEl = new Audio(this.customAudioUrl);
        this.customAudioEl.loop = true;
        this.customAudioEl.volume = this.isMuted ? 0 : this.volume * 0.85;
      } catch (e) {
        console.warn('Failed to initialize custom audio element:', e);
      }
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    if (this.customAudioEl) {
      this.customAudioEl.volume = this.isMuted ? 0 : this.volume * 0.85;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    if (this.customAudioEl) {
      this.customAudioEl.volume = this.isMuted ? 0 : this.volume * 0.85;
    }
  }

  // Quick unlock for touch events
  public unlock() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
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
      filter.frequency.setValueAtTime(1600, now);

      osc.type = 'sine';
      const baseFreq = (280 + Math.random() * 80) * pitchMod;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.9, now + 0.07);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
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
      const freq = (500 + (Math.random() - 0.5) * 80) * pitch;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.45, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.18);
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
      
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(note, now);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(note * 2, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.28, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.08, now + 0.03);
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
      filter.frequency.setValueAtTime(360 + Math.random() * 80, now);
      filter.Q.setValueAtTime(2.5, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + Math.random() * 30, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
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
      osc.frequency.linearRampToValueAtTime(620, now + 0.25);
      osc.frequency.linearRampToValueAtTime(520, now + 0.55);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.7);
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
    if (this.customAudioEl) {
      this.customAudioEl.pause();
    }
  }

  public stopAmbient(type: AmbientSoundType) {
    if (type === 'custom' && this.customAudioEl) {
      this.customAudioEl.pause();
    }
    const active = this.activeAmbients.get(type);
    if (active) {
      active.stop();
      this.activeAmbients.delete(type);
    }
  }

  public startAmbient(type: AmbientSoundType) {
    if (this.activeAmbients.has(type)) return;
    this.initContext();
    if (!this.ctx || !this.ambientMasterGain) return;

    let stopFn: () => void = () => {};
    const ambientGain = this.ctx.createGain();
    ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.75, this.ctx.currentTime + 0.8);
    ambientGain.connect(this.ambientMasterGain);

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
      case 'custom':
        stopFn = this.createCustomAudioSynthesizer();
        break;
    }

    this.activeAmbients.set(type, {
      stop: () => {
        if (this.ctx) {
          ambientGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.3);
          setTimeout(() => {
            stopFn();
            ambientGain.disconnect();
          }, 600);
        } else {
          stopFn();
        }
      },
      gainNode: ambientGain
    });
  }

  // High quality Paul Kellet filter Pink Noise Buffer
  private createPinkNoiseBuffer(duration: number = 4): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.22;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // 0. Custom Audio Player
  private createCustomAudioSynthesizer(): () => void {
    if (!this.customAudioEl) return () => {};
    try {
      this.customAudioEl.currentTime = 0;
      this.customAudioEl.volume = this.isMuted ? 0 : this.volume * 0.85;
      const playPromise = this.customAudioEl.play();
      if (playPromise) {
        playPromise.catch((e) => {
          console.warn('Custom audio playback blocked:', e);
        });
      }
    } catch (e) {
      console.warn('Custom audio play error:', e);
    }

    return () => {
      if (this.customAudioEl) {
        this.customAudioEl.pause();
      }
    };
  }

  // 1. Rain Synthesizer (Natural soothing rain with soft droplet clicks)
  private createRainSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    let isRunning = true;
    let dropTimeout: number | null = null;

    const pinkBuffer = this.createPinkNoiseBuffer(4);
    const source = this.ctx.createBufferSource();
    source.buffer = pinkBuffer;
    source.loop = true;

    // Filter for gentle rain frequency profile
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'peaking';
    bp.frequency.value = 1200;
    bp.gain.value = 4;
    bp.Q.value = 1.0;

    source.connect(lp);
    lp.connect(bp);
    bp.connect(targetGain);
    source.start();

    // Occasional gentle water drops hitting puddles/leaves
    const spawnPuddleDrop = () => {
      if (!isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const dropOsc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();

      dropOsc.type = 'sine';
      const f = 1200 + Math.random() * 800;
      dropOsc.frequency.setValueAtTime(f, now);
      dropOsc.frequency.exponentialRampToValueAtTime(f * 0.7, now + 0.04);

      dropGain.gain.setValueAtTime(0, now);
      dropGain.gain.linearRampToValueAtTime(0.08, now + 0.01);
      dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      dropOsc.connect(dropGain);
      dropGain.connect(targetGain);

      dropOsc.start(now);
      dropOsc.stop(now + 0.06);

      dropTimeout = window.setTimeout(spawnPuddleDrop, 180 + Math.random() * 320);
    };

    spawnPuddleDrop();

    return () => {
      isRunning = false;
      if (dropTimeout) clearTimeout(dropTimeout);
      try { source.stop(); } catch { /* ignore */ }
    };
  }

  // 2. Ocean Waves Synthesizer (Rhythmic rolling surf with filter sweep)
  private createOceanSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    const pinkBuffer = this.createPinkNoiseBuffer(5);
    const source = this.ctx.createBufferSource();
    source.buffer = pinkBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    const waveGain = this.ctx.createGain();
    waveGain.gain.value = 0.65;

    // LFO for periodic wave cresting every 7 seconds
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.14; // ~7s period

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.45;

    // Filter frequency modulation for wave surge
    const filterLfo = this.ctx.createGain();
    filterLfo.gain.value = 280;

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    lfo.connect(filterLfo);
    filterLfo.connect(filter.frequency);

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

  // 3. Birds Synthesizer (Gentle woodland breeze + frequent sweet bird calls)
  private createBirdsSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    let isRunning = true;
    let timeoutId: number | null = null;

    // Ambient soft breeze background so it is never dead silent
    const pinkBuffer = this.createPinkNoiseBuffer(4);
    const breeze = this.ctx.createBufferSource();
    breeze.buffer = pinkBuffer;
    breeze.loop = true;

    const breezeFilter = this.ctx.createBiquadFilter();
    breezeFilter.type = 'lowpass';
    breezeFilter.frequency.value = 400;

    const breezeGain = this.ctx.createGain();
    breezeGain.gain.value = 0.2;

    breeze.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(targetGain);
    breeze.start();

    // Frequent, melodic bird chirps
    const chirp = () => {
      if (!isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const count = 1 + Math.floor(Math.random() * 3);

      for (let k = 0; k < count; k++) {
        if (!this.ctx) break;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        const delay = k * 0.14;
        const baseFreq = 2000 + Math.random() * 900;
        osc.frequency.setValueAtTime(baseFreq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + delay + 0.05);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + delay + 0.12);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.28, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.13);

        osc.connect(gain);
        gain.connect(targetGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.14);
      }

      // Repeat every 1.5 to 3.5 seconds
      const nextTime = 1600 + Math.random() * 1800;
      timeoutId = window.setTimeout(chirp, nextTime);
    };

    chirp();

    return () => {
      isRunning = false;
      if (timeoutId) clearTimeout(timeoutId);
      try { breeze.stop(); } catch { /* ignore */ }
    };
  }

  // 4. Forest Synthesizer (Whispering wind through pine leaves + gentle crickets)
  private createForestSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};

    // Wind noise
    const pinkBuffer = this.createPinkNoiseBuffer(5);
    const source = this.ctx.createBufferSource();
    source.buffer = pinkBuffer;
    source.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 520;
    windFilter.Q.value = 0.8;

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.45;

    source.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(targetGain);
    source.start();

    // High crickets / cicadas pulse
    const cricketOsc = this.ctx.createOscillator();
    const cricketGain = this.ctx.createGain();
    const cricketFilter = this.ctx.createBiquadFilter();

    cricketOsc.type = 'triangle';
    cricketOsc.frequency.value = 4600;

    cricketFilter.type = 'bandpass';
    cricketFilter.frequency.value = 4600;
    cricketFilter.Q.value = 6.0;

    // Tremolo modulation for crickets
    const tremolo = this.ctx.createOscillator();
    tremolo.type = 'sine';
    tremolo.frequency.value = 7.0; // 7Hz chirp cadence

    const tremoloGain = this.ctx.createGain();
    tremoloGain.gain.value = 0.04;
    cricketGain.gain.value = 0.05;

    tremolo.connect(tremoloGain);
    tremoloGain.connect(cricketGain.gain);

    cricketOsc.connect(cricketFilter);
    cricketFilter.connect(cricketGain);
    cricketGain.connect(targetGain);

    cricketOsc.start();
    tremolo.start();

    return () => {
      try {
        source.stop();
        cricketOsc.stop();
        tremolo.stop();
      } catch { /* ignore */ }
    };
  }

  // 5. Soft Tones (Rich 432Hz ambient chord pad with breathing filter)
  private createTonesSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    // F major 9 chord tuned to 432Hz harmonic base
    // F2 (86.4Hz), C3 (129.6Hz), F3 (172.8Hz), A3 (216Hz), C4 (259.2Hz), E4 (324Hz)
    const freqs = [86.4, 129.6, 172.8, 216.0, 259.2, 324.0];
    const oscs: OscillatorNode[] = [];

    // Master filter with breathing LFO
    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 650;
    padFilter.Q.value = 1.0;

    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.55;

    // Slow breathing filter LFO (~12 second cycle)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 350;

    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);

    padFilter.connect(padGain);
    padGain.connect(targetGain);
    lfo.start();

    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();

      // Alternate warm sine and triangle
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      // Gentle chorus detune
      osc.detune.value = (i % 2 === 0 ? 3 : -3) * (i + 1);

      voiceGain.gain.value = 0.22 / Math.sqrt(freqs.length);
      osc.connect(voiceGain);
      voiceGain.connect(padFilter);
      osc.start();
      oscs.push(osc);
    });

    return () => {
      try {
        lfo.stop();
        oscs.forEach((o) => o.stop());
      } catch { /* ignore */ }
    };
  }

  // 6. Gentle Bells (Singing bowl drone + resonant harmonic bells)
  private createBellsSynthesizer(targetGain: GainNode): () => void {
    if (!this.ctx) return () => {};
    let isRunning = true;
    let bellTimer: number | null = null;

    // Continuous warm singing bowl fundamental drone
    const drone1 = this.ctx.createOscillator();
    const drone2 = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();

    drone1.type = 'sine';
    drone1.frequency.value = 108; // Deep resonant sub-bowl
    drone2.type = 'sine';
    drone2.frequency.value = 216; // Harmonic

    droneGain.gain.value = 0.18;
    drone1.connect(droneGain);
    drone2.connect(droneGain);
    droneGain.connect(targetGain);
    drone1.start();
    drone2.start();

    // Pentatonic bell strikes
    const bellNotes = [324, 388.8, 432, 518.4, 648];

    const strikeBell = () => {
      if (!isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = bellNotes[Math.floor(Math.random() * bellNotes.length)];

      const osc = this.ctx.createOscillator();
      const harm = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      harm.type = 'sine';
      harm.frequency.setValueAtTime(freq * 2.76, now); // Metallic acoustic chime overtone

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

      osc.connect(gain);
      harm.connect(gain);
      gain.connect(targetGain);

      osc.start(now);
      harm.start(now);
      osc.stop(now + 4.3);
      harm.stop(now + 4.3);

      bellTimer = window.setTimeout(strikeBell, 3500 + Math.random() * 2500);
    };

    strikeBell();

    return () => {
      isRunning = false;
      if (bellTimer) clearTimeout(bellTimer);
      try {
        drone1.stop();
        drone2.stop();
      } catch { /* ignore */ }
    };
  }
}

export const audioService = new AudioService();
