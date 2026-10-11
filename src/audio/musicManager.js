/**
 * KeyRush Centralized Dual-Music Manager
 * Professional Studio Audio Mixing & Environmental Soundstaging:
 * - Master volume: 70% (0.70)
 * - Interior Ambient track (/audio/interior_music.mp3): 15% (0.15) of master level
 * - Racing Active track (/audio/racing_music.mp3): 22% (0.22) of master level
 * - Procedural Sound Effects (/audio/soundEffects.js): 35% (0.35) of master level
 * - Engine Audio: 40% (0.40) of master level
 * - Dynamic Audio Ducking: Intelligent volume reduction during gameplay cues (beeps, nitro, victory)
 * - Gentle fade-in on application entry, seamless equal-power crossfades (1.2–1.8s)
 * - Gentle fade-out on pause and fade-in on resume (no pops, clicks, or volume spikes)
 * - Idempotent menu navigation: continuous ambient atmosphere across dashboard, garage, settings
 * - Zero duplicated multipliers or volume compounding
 * - Safe cancellable animation frames and graceful promise error handling
 */

import { soundEffects } from './soundEffects.js';
import { storage } from '../db/storage.js';

export const AUDIO_PATHS = {
  INTERIOR: '/audio/interior_music.mp3',
  RACING: '/audio/racing_music.mp3'
};

export const RECOMMENDED_AUDIO_MIX = {
  masterVolume: 0.80,   // 80% Master
  interiorVolume: 0.55, // 55% of Master (Effective: ~44% output — rich ambient soundtrack)
  racingVolume: 0.65,   // 65% of Master (Effective: ~52% output — energetic race soundtrack)
  sfxVolume: 0.60,      // 60% of Master
  engineVolume: 0.50,   // 50% of Master
  musicMuted: false
};

class MusicManager {
  constructor() {
    this.interiorAudio = new Audio(AUDIO_PATHS.INTERIOR);
    this.interiorAudio.loop = true;
    this.interiorAudio.preload = 'auto';
    this.interiorAudio.volume = 0;

    this.racingAudio = new Audio(AUDIO_PATHS.RACING);
    this.racingAudio.loop = true;
    this.racingAudio.preload = 'auto';
    this.racingAudio.volume = 0;

    // Playback state
    this.currentMode = null; // 'interior' | 'racing' | null
    this.isPausedForRace = false;

    // Studio mix levels (normalized 0.0 to 1.0)
    this.masterVolume = RECOMMENDED_AUDIO_MIX.masterVolume;
    this.interiorVolume = RECOMMENDED_AUDIO_MIX.interiorVolume;
    this.racingVolume = RECOMMENDED_AUDIO_MIX.racingVolume;
    this.muted = false;

    // Dynamic ducking factor (1.0 = normal, < 1.0 = ducked during announcements/nitro)
    this._duckFactor = 1.0;
    this._duckAnimationId = null;
    this._duckHoldTimer = null;

    // Crossfade animation state
    this._fadeAnimationId = null;
    this._fadeDuration = 1500;

    // Autoplay unlock state
    this._isUnlocked = false;
    this._pendingMode = null;

    this._setupAudioErrorHandling();
    this._setupAutoplayUnlock();
  }

  // --- ERROR HANDLING & AUTOPLAY UNLOCK ---

  _setupAudioErrorHandling() {
    this.interiorAudio.addEventListener('error', (e) => {
      console.warn('[MusicManager] Interior audio element load warning:', e);
    });
    this.racingAudio.addEventListener('error', (e) => {
      console.warn('[MusicManager] Racing audio element load warning:', e);
    });

    // Seamless loop watchdog: automatically re-triggers if browser loop glitches
    this.interiorAudio.addEventListener('ended', () => {
      if (this.currentMode === 'interior' && !this.muted) {
        this.interiorAudio.currentTime = 0;
        this.interiorAudio.play().catch(() => {});
      }
    });
    this.racingAudio.addEventListener('ended', () => {
      if (this.currentMode === 'racing' && !this.muted) {
        this.racingAudio.currentTime = 0;
        this.racingAudio.play().catch(() => {});
      }
    });
  }

  _setupAutoplayUnlock() {
    const unlockHandler = () => {
      this.unlock();
      // Only remove global event listeners when audio playback has verified active
      const isInteriorPlaying = this.currentMode === 'interior' && !this.interiorAudio.paused;
      const isRacingPlaying = this.currentMode === 'racing' && !this.racingAudio.paused;
      if (isInteriorPlaying || isRacingPlaying || this.muted) {
        ['pointerdown', 'keydown', 'click', 'touchstart'].forEach((evt) => {
          window.removeEventListener(evt, unlockHandler);
        });
      }
    };

    ['pointerdown', 'keydown', 'click', 'touchstart'].forEach((evt) => {
      window.addEventListener(evt, unlockHandler, { passive: true });
    });
  }

  unlock() {
    this._isUnlocked = true;

    // Prime Web Audio synthesizer
    soundEffects.ensureContext();

    // Start playback if not muted
    if (!this.muted) {
      if (this.currentMode === 'racing') {
        if (this.racingAudio.paused) {
          this.playRacing(1000);
        }
      } else {
        if (this.interiorAudio.paused) {
          this.playInterior(1200, true);
        }
      }
    }
  }

  // --- OUTPUT VOLUME CALCULATIONS ---
  // Guaranteed single-calculation formula: master * trackLevel * duckFactor

  getTargetInteriorVolume() {
    if (this.muted) return 0;
    const effective = this.masterVolume * this.interiorVolume * this._duckFactor;
    return Math.max(0, Math.min(1, effective));
  }

  getTargetRacingVolume() {
    if (this.muted) return 0;
    const effective = this.masterVolume * this.racingVolume * this._duckFactor;
    return Math.max(0, Math.min(1, effective));
  }

  // --- DYNAMIC AUDIO DUCKING ---

  _cancelDuck() {
    if (this._duckAnimationId !== null) {
      cancelAnimationFrame(this._duckAnimationId);
      this._duckAnimationId = null;
    }
    if (this._duckHoldTimer !== null) {
      clearTimeout(this._duckHoldTimer);
      this._duckHoldTimer = null;
    }
  }

  /**
   * Duck the active soundtrack slightly so gameplay events (countdown, nitro, victory) cut through.
   * @param {number} factor - Volume multiplier (e.g. 0.65 for 35% reduction)
   * @param {number} durationMs - Auto-restore delay in milliseconds (0 = manual unduck)
   * @param {number} rampDownMs - Transition down time
   * @param {number} rampUpMs - Transition up time
   */
  duck(factor = 0.65, durationMs = 0, rampDownMs = 150, rampUpMs = 350) {
    if (this.muted) return;
    this._cancelDuck();

    const startFactor = this._duckFactor;
    const targetFactor = Math.max(0.1, Math.min(1.0, factor));
    const startTime = performance.now();

    const rampDown = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / rampDownMs);
      this._duckFactor = startFactor + (targetFactor - startFactor) * progress;
      this._applyDuckToActiveTrack();

      if (progress < 1) {
        this._duckAnimationId = requestAnimationFrame(rampDown);
      } else {
        this._duckFactor = targetFactor;
        this._applyDuckToActiveTrack();
        this._duckAnimationId = null;

        if (durationMs > 0) {
          this._duckHoldTimer = setTimeout(() => {
            this.unduck(rampUpMs);
          }, durationMs);
        }
      }
    };

    this._duckAnimationId = requestAnimationFrame(rampDown);
  }

  unduck(rampUpMs = 350) {
    if (this.muted) return;
    this._cancelDuck();

    const startFactor = this._duckFactor;
    const targetFactor = 1.0;
    const startTime = performance.now();

    const rampUp = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / rampUpMs);
      this._duckFactor = startFactor + (targetFactor - startFactor) * progress;
      this._applyDuckToActiveTrack();

      if (progress < 1) {
        this._duckAnimationId = requestAnimationFrame(rampUp);
      } else {
        this._duckFactor = 1.0;
        this._applyDuckToActiveTrack();
        this._duckAnimationId = null;
      }
    };

    this._duckAnimationId = requestAnimationFrame(rampUp);
  }

  _applyDuckToActiveTrack() {
    if (!this._fadeAnimationId) {
      if (this.currentMode === 'interior' && !this.interiorAudio.paused) {
        this.interiorAudio.volume = this.getTargetInteriorVolume();
      } else if (this.currentMode === 'racing' && !this.racingAudio.paused) {
        this.racingAudio.volume = this.getTargetRacingVolume();
      }
    }
  }

  // --- PUBLIC PLAYBACK METHODS ---

  /**
   * Play or transition to interior ambient music.
   * If interior is already playing, does NOT restart or seek (idempotent across menu nav).
   * @param {number} fadeDurationMs - Crossfade duration in ms
   * @param {boolean} forceFadeIn - Whether to fade in from silence on fresh entry
   */
  playInterior(fadeDurationMs = 1500, forceFadeIn = false) {
    this.isPausedForRace = false;

    // Already playing interior ambient track smoothly: no-op to preserve playback position
    if (this.currentMode === 'interior' && !this.interiorAudio.paused && !this._fadeAnimationId) {
      this.interiorAudio.volume = this.getTargetInteriorVolume();
      return;
    }

    if (this.currentMode === 'racing' && !this.racingAudio.paused) {
      this.crossfadeTo('interior', fadeDurationMs);
    } else {
      this.currentMode = 'interior';
      this._cancelFade();

      this.racingAudio.pause();
      this.racingAudio.volume = 0;

      const targetVol = this.getTargetInteriorVolume();

      if (forceFadeIn || this.interiorAudio.paused) {
        // Gentle atmospheric swell on fresh entry
        this.interiorAudio.volume = 0;
        const playPromise = this.interiorAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this._fadeInTrack(this.interiorAudio, 'interior', fadeDurationMs);
          }).catch(() => {
            this._pendingMode = 'interior';
          });
        }
      } else {
        this.interiorAudio.volume = targetVol;
      }
    }
  }

  /**
   * Play or transition to active racing music.
   * Called when race countdown ends and racing starts.
   */
  playRacing(fadeDurationMs = 1500) {
    this.isPausedForRace = false;

    if (this.currentMode === 'racing' && !this.racingAudio.paused && !this._fadeAnimationId) {
      this.racingAudio.volume = this.getTargetRacingVolume();
      return;
    }

    if (this.currentMode === 'interior' && !this.interiorAudio.paused) {
      this.crossfadeTo('racing', fadeDurationMs);
    } else {
      this.currentMode = 'racing';
      this._cancelFade();

      this.interiorAudio.pause();
      this.interiorAudio.volume = 0;

      const targetVol = this.getTargetRacingVolume();
      this.racingAudio.volume = 0;

      const playPromise = this.racingAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this._fadeInTrack(this.racingAudio, 'racing', fadeDurationMs);
        }).catch(() => {
          this._pendingMode = 'racing';
        });
      }
    }
  }

  /**
   * Gentle, professional pause: smoothly ramps volume to zero over ~300ms before pausing.
   */
  pauseRaceMusic(fadeMs = 300) {
    if (this.currentMode === 'racing' && !this.racingAudio.paused) {
      this.isPausedForRace = true;
      this._cancelFade();

      const startVol = this.racingAudio.volume;
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / fadeMs);
        this.racingAudio.volume = Math.max(0, startVol * (1 - progress));

        if (progress < 1 && this.isPausedForRace) {
          this._fadeAnimationId = requestAnimationFrame(step);
        } else {
          this._fadeAnimationId = null;
          if (this.isPausedForRace) {
            this.racingAudio.pause();
          }
        }
      };

      this._fadeAnimationId = requestAnimationFrame(step);
    }
  }

  /**
   * Gentle resume: smoothly ramps volume up from zero over ~350ms back to target racing level.
   */
  resumeRaceMusic(fadeMs = 350) {
    if (this.currentMode === 'racing' && this.isPausedForRace) {
      this.isPausedForRace = false;
      this._cancelFade();

      this.racingAudio.volume = 0;
      const playPromise = this.racingAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }

      const targetVol = this.getTargetRacingVolume();
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / fadeMs);
        this.racingAudio.volume = Math.max(0, Math.min(1, targetVol * progress));

        if (progress < 1 && !this.isPausedForRace) {
          this._fadeAnimationId = requestAnimationFrame(step);
        } else {
          this._fadeAnimationId = null;
          if (!this.isPausedForRace) {
            this.racingAudio.volume = targetVol;
          }
        }
      };

      this._fadeAnimationId = requestAnimationFrame(step);
    }
  }

  /**
   * Stop all music immediately (e.g. for reset).
   */
  stopAll() {
    this._cancelFade();
    this._cancelDuck();
    this._pendingMode = null;
    this.currentMode = null;
    this.isPausedForRace = false;
    this.interiorAudio.pause();
    this.interiorAudio.volume = 0;
    this.racingAudio.pause();
    this.racingAudio.volume = 0;
  }

  /**
   * Smoothly fade out and stop all playing music over fadeMs.
   * Clears any pending playback queues.
   */
  fadeOutAndStop(fadeMs = 500) {
    this._pendingMode = null;
    this._cancelDuck();
    if ((!this.interiorAudio.paused && this.interiorAudio.volume > 0) ||
        (!this.racingAudio.paused && this.racingAudio.volume > 0)) {
      this._cancelFade();
      const startInterior = this.interiorAudio.volume;
      const startRacing = this.racingAudio.volume;
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / fadeMs);
        this.interiorAudio.volume = Math.max(0, startInterior * (1 - progress));
        this.racingAudio.volume = Math.max(0, startRacing * (1 - progress));

        if (progress < 1) {
          this._fadeAnimationId = requestAnimationFrame(step);
        } else {
          this._fadeAnimationId = null;
          this.stopAll();
        }
      };

      this._fadeAnimationId = requestAnimationFrame(step);
    } else {
      this.stopAll();
    }
  }

  // --- CROSSFADE & FADE-IN ENGINES ---

  _cancelFade() {
    if (this._fadeAnimationId !== null) {
      cancelAnimationFrame(this._fadeAnimationId);
      this._fadeAnimationId = null;
    }
  }

  _fadeInTrack(audioElement, mode = 'interior', durationMs = 1500) {
    this._cancelFade();
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const ease = Math.sin((progress * Math.PI) / 2); // Smooth ease-out swell
      const currentTarget = mode === 'racing' ? this.getTargetRacingVolume() : this.getTargetInteriorVolume();

      audioElement.volume = Math.max(0, Math.min(1, currentTarget * ease));

      if (progress < 1) {
        this._fadeAnimationId = requestAnimationFrame(step);
      } else {
        const finalTarget = mode === 'racing' ? this.getTargetRacingVolume() : this.getTargetInteriorVolume();
        audioElement.volume = finalTarget;
        this._fadeAnimationId = null;
      }
    };

    this._fadeAnimationId = requestAnimationFrame(step);
  }

  crossfadeTo(targetMode, durationMs = 1500) {
    this._cancelFade();
    this.currentMode = targetMode;
    this._fadeDuration = Math.max(400, durationMs);

    const incomingAudio = targetMode === 'racing' ? this.racingAudio : this.interiorAudio;
    const outgoingAudio = targetMode === 'racing' ? this.interiorAudio : this.racingAudio;

    // Start incoming track at silence
    if (incomingAudio.paused) {
      incomingAudio.volume = 0;
      const playPromise = incomingAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this._pendingMode = targetMode;
        });
      }
    }

    const startIncomingVol = incomingAudio.volume;
    const startOutgoingVol = outgoingAudio.volume;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / this._fadeDuration);

      // Trigonometric equal-power crossfade curve
      const fadeOutFactor = Math.cos((progress * Math.PI) / 2);
      const fadeInFactor = Math.sin((progress * Math.PI) / 2);

      const targetIncoming = targetMode === 'racing' ? this.getTargetRacingVolume() : this.getTargetInteriorVolume();

      incomingAudio.volume = Math.max(0, Math.min(1, startIncomingVol + (targetIncoming - startIncomingVol) * fadeInFactor));
      outgoingAudio.volume = Math.max(0, Math.min(1, startOutgoingVol * fadeOutFactor));

      if (progress < 1) {
        this._fadeAnimationId = requestAnimationFrame(step);
      } else {
        this._fadeAnimationId = null;
        outgoingAudio.pause();
        outgoingAudio.volume = 0;
        incomingAudio.volume = targetIncoming;
      }
    };

    this._fadeAnimationId = requestAnimationFrame(step);
  }

  // --- SETTINGS INTEGRATION & PERSISTENCE ---

  applySettings(settings = {}) {
    if (settings.masterVolume !== undefined) {
      this.masterVolume = Math.max(0, Math.min(1, Number(settings.masterVolume)));
    }
    if (settings.interiorVolume !== undefined) {
      this.interiorVolume = Math.max(0, Math.min(1, Number(settings.interiorVolume)));
    }
    if (settings.racingVolume !== undefined) {
      this.racingVolume = Math.max(0, Math.min(1, Number(settings.racingVolume)));
    }
    if (settings.musicMuted !== undefined) {
      this.muted = Boolean(settings.musicMuted);
    }

    // Apply proportional master and SFX/Engine settings to synthesizer
    soundEffects.updateSettings({
      masterVolume: this.masterVolume,
      musicMuted: this.muted,
      sfxVolume: settings.sfxVolume !== undefined ? settings.sfxVolume : undefined,
      engineVolume: settings.engineVolume !== undefined ? settings.engineVolume : undefined,
      soundEffects: settings.soundEffects,
      engineAudio: settings.engineAudio,
      keyboardClickSound: settings.keyboardClickSound
    });

    // Update active tracks immediately if not mid-crossfade
    if (!this._fadeAnimationId) {
      if (!this.muted) {
        if (this.currentMode === 'interior') {
          if (this.interiorAudio.paused) {
            this.playInterior(1000, true);
          } else {
            this.interiorAudio.volume = this.getTargetInteriorVolume();
          }
        } else if (this.currentMode === 'racing') {
          if (this.racingAudio.paused) {
            this.playRacing(1000);
          } else {
            this.racingAudio.volume = this.getTargetRacingVolume();
          }
        }
      } else {
        this.interiorAudio.volume = 0;
        this.racingAudio.volume = 0;
      }
    }
  }

  getSettings() {
    return {
      masterVolume: this.masterVolume,
      interiorVolume: this.interiorVolume,
      racingVolume: this.racingVolume,
      musicMuted: this.muted
    };
  }

  async setMasterVolume(val, persist = true) {
    this.masterVolume = Math.max(0, Math.min(1, Number(val)));
    this.applySettings();
    if (persist) await this._persistSettings();
  }

  async setInteriorVolume(val, persist = true) {
    this.interiorVolume = Math.max(0, Math.min(1, Number(val)));
    this.applySettings();
    if (persist) await this._persistSettings();
  }

  async setRacingVolume(val, persist = true) {
    this.racingVolume = Math.max(0, Math.min(1, Number(val)));
    this.applySettings();
    if (persist) await this._persistSettings();
  }

  async toggleMute(persist = true) {
    this.muted = !this.muted;
    this.applySettings({ musicMuted: this.muted });
    if (persist) await this._persistSettings();
    window.dispatchEvent(new CustomEvent('keyrush:audio-toggle', { detail: { muted: this.muted } }));
    return this.muted;
  }

  async setMuted(isMuted, persist = true) {
    this.muted = Boolean(isMuted);
    this.applySettings({ musicMuted: this.muted });
    if (persist) await this._persistSettings();
    window.dispatchEvent(new CustomEvent('keyrush:audio-toggle', { detail: { muted: this.muted } }));
    return this.muted;
  }

  /**
   * Reset all audio mixing values to the recommended game-audio designer defaults.
   */
  async restoreRecommendedDefaults(persist = true) {
    this._cancelFade();
    this._cancelDuck();
    this.masterVolume = RECOMMENDED_AUDIO_MIX.masterVolume;
    this.interiorVolume = RECOMMENDED_AUDIO_MIX.interiorVolume;
    this.racingVolume = RECOMMENDED_AUDIO_MIX.racingVolume;
    this.muted = RECOMMENDED_AUDIO_MIX.musicMuted;

    this.applySettings({
      masterVolume: this.masterVolume,
      interiorVolume: this.interiorVolume,
      racingVolume: this.racingVolume,
      sfxVolume: RECOMMENDED_AUDIO_MIX.sfxVolume,
      engineVolume: RECOMMENDED_AUDIO_MIX.engineVolume,
      musicMuted: this.muted
    });

    if (this.currentMode === 'interior' && !this.interiorAudio.paused) {
      this.interiorAudio.volume = this.getTargetInteriorVolume();
    } else if (this.currentMode === 'racing' && !this.racingAudio.paused) {
      this.racingAudio.volume = this.getTargetRacingVolume();
    }

    if (persist) {
      try {
        const cur = (await storage.getSettings()) || {};
        await storage.saveSettings({
          ...cur,
          masterVolume: this.masterVolume,
          interiorVolume: this.interiorVolume,
          racingVolume: this.racingVolume,
          sfxVolume: RECOMMENDED_AUDIO_MIX.sfxVolume,
          engineVolume: RECOMMENDED_AUDIO_MIX.engineVolume,
          musicMuted: this.muted
        });
      } catch (e) {
        console.warn('[MusicManager] Could not persist defaults:', e);
      }
    }

    return RECOMMENDED_AUDIO_MIX;
  }

  async _persistSettings() {
    try {
      const current = (await storage.getSettings()) || {};
      const updated = {
        ...current,
        masterVolume: this.masterVolume,
        interiorVolume: this.interiorVolume,
        racingVolume: this.racingVolume,
        musicMuted: this.muted
      };
      await storage.saveSettings(updated);
    } catch (e) {
      console.warn('[MusicManager] Could not persist settings:', e);
    }
  }
}

export const musicManager = new MusicManager();
