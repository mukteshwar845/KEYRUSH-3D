/**
 * KeyRush Audio Synthesizer Engine (Web Audio API)
 * Fully offline procedural audio: dynamic vehicle engine, mechanical keyboard switches,
 * turbo whoosh, countdown beeps, error misfires, and victory fanfare.
 */

class SoundEffectsEngine {
  constructor() {
    this.ctx = null;
    this.engineNode = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
    this.soundEnabled = true;
    this.engineEnabled = true;
    this.sfxVolume = 0.35;
    this.engineVolume = 0.40;
    this.masterVolume = 0.70;
    this.muted = false;
    this.keyClickType = 'cherry-blue'; // cherry-blue, mx-red, cyber-blip, off
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getEffectiveSfxVolume() {
    if (this.muted || !this.soundEnabled) return 0;
    return Math.max(0, Math.min(1, this.masterVolume * this.sfxVolume));
  }

  getEffectiveEngineVolume() {
    if (this.muted || !this.engineEnabled) return 0;
    return Math.max(0, Math.min(1, this.masterVolume * this.engineVolume));
  }

  updateSettings({ soundEffects, engineAudio, sfxVolume, engineVolume, keyboardClickSound, masterVolume, musicMuted, soundMuted }) {
    if (soundEffects !== undefined) this.soundEnabled = soundEffects;
    if (engineAudio !== undefined) this.engineEnabled = engineAudio;
    if (sfxVolume !== undefined) this.sfxVolume = sfxVolume;
    if (engineVolume !== undefined) this.engineVolume = engineVolume;
    if (keyboardClickSound !== undefined) this.keyClickType = keyboardClickSound;
    if (masterVolume !== undefined) this.masterVolume = masterVolume;
    if (musicMuted !== undefined) this.muted = musicMuted;
    if (soundMuted !== undefined) this.muted = soundMuted;

    if ((!this.engineEnabled || this.muted) && this.isEngineRunning) {
      this.stopEngine();
    } else if (this.isEngineRunning && this.engineGain && this.ctx) {
      try {
        this.engineGain.gain.setValueAtTime(this.getEffectiveEngineVolume() * 0.35, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  // --- ENGINE SYNTHESIZER ---
  startEngine() {
    if (!this.engineEnabled || this.isEngineRunning) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      // Dual oscillator engine with saw and square waves
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';
      this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);
      this.engineOsc2.frequency.setValueAtTime(22.5, this.ctx.currentTime);

      // Lowpass resonant filter
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      // Master engine gain
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.005, this.ctx.currentTime);
      this.engineGain.gain.linearRampToValueAtTime(this.getEffectiveEngineVolume() * 0.45, this.ctx.currentTime + 0.3);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn('Could not start audio engine:', e);
    }
  }

  updateEngineSpeed(wpmRatio, rpmRatio = 0) {
    if (!this.isEngineRunning || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Base idle is 45Hz, redline at 180Hz
      const targetFreq = 45 + Math.min(1.2, wpmRatio) * 110 + (rpmRatio * 25);
      this.engineOsc1.frequency.setTargetAtTime(targetFreq, now, 0.08);
      this.engineOsc2.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.08);

      // Filter opens up as speed increases
      const filterCutoff = 220 + Math.min(1.2, wpmRatio) * 900;
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.1);
    } catch (e) {}
  }

  stopEngine() {
    if (!this.isEngineRunning || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.engineGain) {
        this.engineGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      }
      setTimeout(() => {
        try {
          if (this.engineOsc1) this.engineOsc1.stop();
          if (this.engineOsc2) this.engineOsc2.stop();
        } catch (e) {}
        this.isEngineRunning = false;
      }, 350);
    } catch (e) {
      this.isEngineRunning = false;
    }
  }

  // --- KEYBOARD CLICK SYNTHESIS ---
  playKeyClick(isCorrect = true) {
    if (!this.soundEnabled || this.muted || this.keyClickType === 'off') return;
    this.ensureContext();
    if (!this.ctx) return;

    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;

    const now = this.ctx.currentTime;

    if (this.keyClickType === 'cherry-blue') {
      // Cherry MX Blue: High frequency mechanical snap + slight tactile clack
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isCorrect ? 1800 : 700, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(sfxVol * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);

    } else if (this.keyClickType === 'mx-red') {
      // MX Red: Smooth, lower-pitched dampened thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);

      gain.gain.setValueAtTime(sfxVol * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);

    } else if (this.keyClickType === 'cyber-blip') {
      // Futuristic cyber blip
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isCorrect ? 880 : 330, now);
      osc.frequency.exponentialRampToValueAtTime(isCorrect ? 1200 : 220, now + 0.04);

      gain.gain.setValueAtTime(sfxVol * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    }
  }

  // --- TYPING ERROR / ENGINE MISFIRE ---
  playErrorMisfire() {
    if (!this.soundEnabled || this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.12);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    gain.gain.setValueAtTime(sfxVol * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // --- TURBO / NITRO WHOOSH ---
  playNitroBoost() {
    if (!this.soundEnabled || this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.35);
      filter.Q.setValueAtTime(4.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(sfxVol * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch (e) {}
  }

  // --- COUNTDOWN BEEPS ---
  playCountdown(count) {
    if (!this.soundEnabled || this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (count > 0) {
      // 3, 2, 1 beeps: 440 Hz
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(sfxVol * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // GO! 880 Hz triumphant chord
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(sfxVol * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.48);
    }
  }

  // --- FINISH LINE FANFARE ---
  playVictoryFanfare() {
    if (!this.soundEnabled || this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(sfxVol * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx === 3 ? 0.8 : 0.25));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (idx === 3 ? 0.85 : 0.28));
    });
  }

  // --- UI HOVER & CLICK ---
  playUiClick() {
    if (!this.soundEnabled || this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    gain.gain.setValueAtTime(sfxVol * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }
}

export const soundEffects = new SoundEffectsEngine();
