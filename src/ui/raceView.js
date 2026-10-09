/**
 * KeyRush Core Typing-Racing Gameplay Screen (Screen 03)
 * Full 3D Three.js race track, precision telemetry HUD, high-contrast typing panel,
 * analog/digital speedometer, RPM gauge, countdown overlay, and post-race victory results.
 */

import { Track3D } from '../graphics/track3D.js';
import { TypingEngine } from '../engine/typingEngine.js';
import { getRandomPassage, getAcademyLesson } from '../engine/textGenerator.js';
import { AiOpponent } from '../engine/aiOpponent.js';
import { soundEffects } from '../audio/soundEffects.js';
import { musicManager } from '../audio/musicManager.js';
import { storage } from '../db/storage.js';
import { downloadPerformanceCard } from '../utils/shareCard.js';
import confetti from 'canvas-confetti';

export class RaceView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.track3D = null;
    this.typingEngine = null;
    this.aiOpponent = null;
    this.isRaceActive = false;
    this.isCountdown = false;
    this.isPaused = false;
    this.raceConfig = {
      mode: 'AI Racing',
      difficulty: 'AMATEUR',
      aiTier: 'intermediate',
      lessonId: null,
      customText: null
    };

    this.playerCarId = 'talon';
    this.paintColor = '#00e5ff';
    this.underglowColor = '#a855f7';
    this.settings = null;
    this.profile = null;
    this.opponentStats = { wpm: 0, progress: 0, accuracy: 95 };

    this.onKeyDownHandler = this.handleKeyDown.bind(this);
  }

  async setup(config = {}) {
    this.raceConfig = { ...this.raceConfig, ...config };
    this.profile = await storage.getProfile();
    const garage = await storage.getGarage();
    this.settings = await storage.getSettings();

    if (garage) {
      this.playerCarId = garage.activeVehicleId || 'talon';
      this.paintColor = garage.paintColor || '#00e5ff';
      this.underglowColor = garage.underglowColor || '#a855f7';
    }

    // Determine target passage
    let passage = '';
    if (this.raceConfig.customText) {
      passage = this.raceConfig.customText;
    } else if (this.raceConfig.lessonId) {
      passage = getAcademyLesson(this.raceConfig.lessonId).text;
    } else {
      passage = getRandomPassage(this.raceConfig.difficulty);
    }

    this.initTypingEngine(passage);
    this.renderLayout();
    this.init3DTrack();
    this.startCountdown();
  }

  initTypingEngine(text) {
    this.typingEngine = new TypingEngine({
      errorPenaltyMode: this.settings?.errorPenalty || 'standard',
      onCharTyped: (char, isCorrect, stats) => {
        soundEffects.playKeyClick(true);
        this.updateTypingDisplay();
        this.updateHUD(stats);
      },
      onMistake: (expected, typed, stats) => {
        soundEffects.playKeyClick(false);
        soundEffects.playErrorMisfire();
        this.updateTypingDisplay();
        this.updateHUD(stats);
      },
      onProgress: (progress, stats) => {
        if (this.track3D) {
          const isBoosting = stats.wpm >= 70;
          this.track3D.updatePlayerProgress(progress, stats.wpm, isBoosting);
        }
        soundEffects.updateEngineSpeed(stats.wpm / 80, stats.penaltyMultiplier);
        this.updateSpeedometer(stats.wpm);
      },
      onFinish: (finalStats) => {
        this.handleRaceFinish(finalStats);
      }
    });

    this.typingEngine.loadText(text);
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="race-screen-wrapper">
        <!-- 3D TRACK CANVAS CONTAINER (Upper 65%) -->
        <div class="race-viewport-container">
          <div id="race-3d-canvas" class="race-3d-scene"></div>

          <!-- TOP TELEMETRY HUD BAR -->
          <div class="top-hud-strip">
            <div class="hud-pill race-pos-pill">
              <span class="hud-label">POSITION</span>
              <span class="hud-val" id="hud-pos-val">1<small>/2</small></span>
            </div>

            <!-- Race Distance Progress Tracker -->
            <div class="race-track-progress-bar">
              <div class="track-progress-fill" id="track-progress-fill" style="width: 0%"></div>
              <div class="player-marker" id="track-player-marker" style="left: 0%">🏎️</div>
              <div class="opponent-marker" id="track-opponent-marker" style="left: 0%">🤖</div>
              <div class="track-finish-flag">🏁</div>
            </div>

            <div class="hud-pill timer-pill">
              <span class="hud-label">RACE TIME</span>
              <span class="hud-val font-mono" id="hud-timer-val">00:00.0</span>
            </div>

            <div class="hud-pill latency-pill">
              <span class="status-dot online"></span>
              <span id="hud-ping-val">18ms</span>
            </div>

            <button class="btn btn-icon btn-small hud-pause-btn" id="race-pause-btn" title="Pause / Resume Race (Esc)">
              ⏸
            </button>
            <button class="btn btn-icon btn-small hud-restart-btn" id="race-restart-btn" title="Restart Race">
              ↺
            </button>
          </div>

          <!-- LEFT HUD: PLAYER TELEMETRY -->
          <div class="hud-panel hud-left-pilot">
            <div class="pilot-badge">
              <span class="pilot-avatar">${this.profile?.avatar || '🏎️'}</span>
              <div class="pilot-info">
                <span class="pilot-name">${this.profile?.username || 'Pilot'}</span>
                <span class="pilot-car">${this.playerCarId.toUpperCase()}</span>
              </div>
            </div>

            <div class="telem-row">
              <div class="telem-block">
                <span class="telem-label">WPM</span>
                <span class="telem-val highlight-cyan font-mono" id="hud-wpm">0</span>
              </div>
              <div class="telem-block">
                <span class="telem-label">ACCURACY</span>
                <span class="telem-val text-positive font-mono" id="hud-acc">100%</span>
              </div>
            </div>

            <div class="telem-row mini">
              <div class="telem-block">
                <span class="telem-label">ERRORS</span>
                <span class="telem-val text-negative font-mono" id="hud-errors">0</span>
              </div>
              <div class="telem-block">
                <span class="telem-label">STREAK</span>
                <span class="telem-val text-gold font-mono" id="hud-streak">0</span>
              </div>
            </div>
          </div>

          <!-- RIGHT HUD: OPPONENT TELEMETRY -->
          <div class="hud-panel hud-right-opponent">
            <div class="pilot-badge opponent-badge">
              <span class="pilot-avatar" id="opp-avatar">🤖</span>
              <div class="pilot-info">
                <span class="pilot-name" id="opp-name">AI Racer</span>
                <span class="pilot-car" id="opp-difficulty">${this.raceConfig.difficulty}</span>
              </div>
            </div>

            <div class="telem-row">
              <div class="telem-block">
                <span class="telem-label">OPPONENT WPM</span>
                <span class="telem-val text-warning font-mono" id="opp-wpm">0</span>
              </div>
              <div class="telem-block">
                <span class="telem-label">GAP</span>
                <span class="telem-val font-mono" id="opp-gap">+0.0s</span>
              </div>
            </div>
          </div>

          <!-- COUNTDOWN OVERLAY (3-2-1-GO!) -->
          <div class="countdown-overlay" id="race-countdown-overlay">
            <div class="countdown-box">
              <div class="countdown-lights">
                <span class="light red" id="light-1"></span>
                <span class="light yellow" id="light-2"></span>
                <span class="light green" id="light-3"></span>
              </div>
              <div class="countdown-number" id="countdown-number">READY</div>
              <div class="countdown-subtext">GET YOUR HANDS ON THE HOME ROW</div>
            </div>
          </div>
        </div>

        <!-- LOWER SECTION: TYPING PANEL & SPEEDOMETERS -->
        <div class="race-controls-dock">
          <!-- TYPING TEXT PANEL (HIGH READABILITY & FOCUS) -->
          <div class="typing-teleprompter-card" id="typing-teleprompter" tabindex="0">
            <div class="text-passage-stream" id="text-passage-stream">
              <!-- Dynamically populated character spans -->
            </div>
            <div class="typing-status-hint">
              <span class="hint-key">Type naturally to accelerate</span>
              <span class="hint-shortcuts">Press [ESC] to restart lap</span>
            </div>
          </div>

          <!-- ANALOG & DIGITAL SPEEDOMETER + RPM CLUSTER -->
          <div class="dashboard-instrument-cluster">
            <!-- Analog/Digital Speedometer Gauge -->
            <div class="speedometer-gauge">
              <div class="gauge-dial">
                <div class="gauge-arc"></div>
                <div class="gauge-needle" id="gauge-needle" style="transform: rotate(-120deg)"></div>
                <div class="digital-speed-readout">
                  <span class="speed-number font-mono" id="digital-speed-val">000</span>
                  <span class="speed-unit">KM/H</span>
                </div>
              </div>
            </div>

            <!-- RPM Tachometer & Redline -->
            <div class="tachometer-cluster">
              <div class="tach-header">
                <span>ENGINE THROTTLE</span>
                <span class="tach-val font-mono" id="rpm-val">1,200 RPM</span>
              </div>
              <div class="tach-bars-container" id="tach-bars-container">
                <!-- 20 dynamic rev bars -->
              </div>
              <div class="nitro-gauge-wrap">
                <div class="nitro-label">NITRO BOOST</div>
                <div class="nitro-bar">
                  <div class="nitro-fill" id="nitro-fill" style="width: 20%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PAUSE OVERLAY (HIDDEN INITIALLY) -->
        <div class="race-pause-modal hidden" id="race-pause-modal">
          <div class="pause-card card-dark">
            <span class="pause-badge">⏸ RACE PAUSED</span>
            <h2 class="pause-title">PIT STOP</h2>
            <p class="pause-subtitle">Telemetry recording suspended. Audio and engine idle.</p>
            <div class="pause-actions">
              <button class="btn btn-primary btn-large glow-primary" id="btn-pause-resume">
                ▶ RESUME RACE
              </button>
              <button class="btn btn-secondary" id="btn-pause-restart">
                ↺ RESTART LAP
              </button>
              <button class="btn btn-ghost" id="btn-pause-exit" data-nav="dashboard">
                ✕ RETURN TO DASHBOARD
              </button>
            </div>
          </div>
        </div>

        <!-- RESULTS OVERLAY (HIDDEN INITIALLY) -->
        <div class="race-results-modal hidden" id="race-results-modal"></div>
      </div>
    `;

    this.renderTachometerBars();
    this.updateTypingDisplay();
    this.bindEvents();
  }

  renderTachometerBars() {
    const container = document.getElementById('tach-bars-container');
    if (!container) return;
    let html = '';
    for (let i = 0; i < 24; i++) {
      const isRedline = i >= 18;
      html += `<div class="tach-seg ${isRedline ? 'redline' : ''}" id="tach-seg-${i}"></div>`;
    }
    container.innerHTML = html;
  }

  init3DTrack() {
    const canvasBox = document.getElementById('race-3d-canvas');
    if (!canvasBox) return;

    this.track3D = new Track3D(canvasBox);
    this.track3D.setPlayerCar(this.playerCarId, this.paintColor, this.underglowColor);

    // If AI or Multiplayer mode, configure opponent car
    if (this.raceConfig.mode !== 'Solo Practice') {
      const oppTier = this.raceConfig.aiTier || 'intermediate';
      this.aiOpponent = new AiOpponent(oppTier, this.profile?.averageWpm || 65);

      this.track3D.setOpponents([{
        id: this.aiOpponent.config.id,
        carModel: this.aiOpponent.config.carModel,
        color: this.aiOpponent.config.color
      }]);

      const oppName = document.getElementById('opp-name');
      const oppAvatar = document.getElementById('opp-avatar');
      const oppDifficulty = document.getElementById('opp-difficulty');
      if (oppName) oppName.textContent = this.aiOpponent.config.name;
      if (oppAvatar) oppAvatar.textContent = this.aiOpponent.config.avatar;
      if (oppDifficulty) oppDifficulty.textContent = `${this.aiOpponent.config.targetWpm} WPM TARGET`;
    } else {
      // Solo Practice: Hide opponent HUD
      const oppHud = document.querySelector('.hud-right-opponent');
      if (oppHud) oppHud.style.display = 'none';
    }
  }

  startCountdown() {
    this.isCountdown = true;
    this.isRaceActive = false;
    let count = 3;

    const overlay = document.getElementById('race-countdown-overlay');
    const numberEl = document.getElementById('countdown-number');
    const light1 = document.getElementById('light-1');
    const light2 = document.getElementById('light-2');
    const light3 = document.getElementById('light-3');

    soundEffects.startEngine();
    soundEffects.playCountdown(count);
    musicManager.duck(0.70, 350);

    this.countdownInterval = setInterval(() => {
      count--;
      if (count === 2) {
        if (numberEl) numberEl.textContent = '2';
        if (light1) light1.classList.add('active');
        soundEffects.playCountdown(2);
        musicManager.duck(0.70, 350);
      } else if (count === 1) {
        if (numberEl) numberEl.textContent = '1';
        if (light2) light2.classList.add('active');
        soundEffects.playCountdown(1);
        musicManager.duck(0.70, 350);
      } else if (count === 0) {
        if (numberEl) {
          numberEl.textContent = 'GO!';
          numberEl.classList.add('countdown-go');
        }
        if (light3) light3.classList.add('active');
        soundEffects.playCountdown(0);
        soundEffects.playNitroBoost();
        musicManager.duck(0.60, 500);

        clearInterval(this.countdownInterval);
        this.countdownInterval = null;

        setTimeout(() => {
          if (overlay) overlay.style.display = 'none';
          this.isCountdown = false;
          this.isRaceActive = true;
          this.startRaceTimer();

          // Seamless transition into high-energy racing music
          musicManager.playRacing(1200);

          // Start AI Opponent if present
          if (this.aiOpponent) {
            this.aiOpponent.start(
              this.typingEngine.targetText.length,
              (oppStats) => this.handleOpponentUpdate(oppStats),
              (oppFinal) => this.handleOpponentFinish(oppFinal)
            );
          }

          // Focus teleprompter
          const tele = document.getElementById('typing-teleprompter');
          if (tele) tele.focus();
        }, 500);
      }
    }, 900);
  }

  startRaceTimer() {
    this.raceTimerInterval = setInterval(() => {
      if (!this.isRaceActive || !this.typingEngine) return;
      const sec = this.typingEngine.getElapsedSeconds();
      const mins = Math.floor(sec / 60);
      const remainSec = (sec % 60).toFixed(1);
      const timerEl = document.getElementById('hud-timer-val');
      if (timerEl) {
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${remainSec.padStart(4, '0')}`;
      }
    }, 100);
  }

  updateTypingDisplay() {
    const stream = document.getElementById('text-passage-stream');
    if (!stream || !this.typingEngine) return;

    const text = this.typingEngine.targetText;
    const curIdx = this.typingEngine.currentIndex;

    let html = '';
    // Window around current index for optimal reading flow
    const startIdx = Math.max(0, curIdx - 20);
    const endIdx = Math.min(text.length, curIdx + 60);

    for (let i = startIdx; i < endIdx; i++) {
      const ch = text[i];
      const displayChar = ch === ' ' ? '&nbsp;' : ch;

      if (i < curIdx) {
        html += `<span class="char typed-correct">${displayChar}</span>`;
      } else if (i === curIdx) {
        html += `<span class="char current-char-caret">${displayChar}</span>`;
      } else {
        html += `<span class="char upcoming-char">${displayChar}</span>`;
      }
    }

    stream.innerHTML = html;
  }

  updateHUD(stats) {
    const wpmEl = document.getElementById('hud-wpm');
    const accEl = document.getElementById('hud-acc');
    const errEl = document.getElementById('hud-errors');
    const streakEl = document.getElementById('hud-streak');
    const progressFill = document.getElementById('track-progress-fill');
    const playerMarker = document.getElementById('track-player-marker');

    if (wpmEl) wpmEl.textContent = stats.wpm;
    if (accEl) accEl.textContent = `${stats.accuracy}%`;
    if (errEl) errEl.textContent = stats.errorCount;
    if (streakEl) streakEl.textContent = stats.currentStreak;

    const progPercent = Math.min(100, Math.round(stats.progress * 100));
    if (progressFill) progressFill.style.width = `${progPercent}%`;
    if (playerMarker) playerMarker.style.left = `${progPercent}%`;

    // Update position indicator (1st or 2nd)
    const posVal = document.getElementById('hud-pos-val');
    if (posVal && this.aiOpponent) {
      const isAhead = stats.progress >= (this.opponentStats.progress || 0);
      posVal.innerHTML = isAhead ? `1<small>/2</small>` : `2<small>/2</small>`;
    }
  }

  updateSpeedometer(wpm) {
    // Speed: 80 WPM ~ 176 km/h, max 280 km/h
    const kmh = Math.round(wpm * 2.2);
    const digitalEl = document.getElementById('digital-speed-val');
    const needleEl = document.getElementById('gauge-needle');
    const rpmValEl = document.getElementById('rpm-val');
    const nitroFill = document.getElementById('nitro-fill');

    if (digitalEl) digitalEl.textContent = kmh.toString().padStart(3, '0');

    // Needle rotation: -120 deg (0 km/h) to +120 deg (260 km/h)
    const ratio = Math.min(1.0, kmh / 240);
    const deg = -120 + (ratio * 240);
    if (needleEl) needleEl.style.transform = `rotate(${deg}deg)`;

    // RPM: 1,000 to 9,000 RPM
    const rpm = Math.round(1000 + ratio * 7800);
    if (rpmValEl) rpmValEl.textContent = `${rpm.toLocaleString()} RPM`;

    // Tachometer segments
    const activeSegs = Math.round(ratio * 24);
    for (let i = 0; i < 24; i++) {
      const seg = document.getElementById(`tach-seg-${i}`);
      if (seg) {
        seg.classList.toggle('active', i < activeSegs);
      }
    }

    // Nitro gauge
    const nitroPercent = Math.min(100, Math.round((wpm / 80) * 100));
    if (nitroFill) nitroFill.style.width = `${nitroPercent}%`;
  }

  handleOpponentUpdate(stats) {
    this.opponentStats = stats;
    const oppWpm = document.getElementById('opp-wpm');
    const oppMarker = document.getElementById('track-opponent-marker');
    const oppGap = document.getElementById('opp-gap');

    if (oppWpm) oppWpm.textContent = stats.wpm;

    const progPercent = Math.min(100, Math.round(stats.progress * 100));
    if (oppMarker) oppMarker.style.left = `${progPercent}%`;

    if (this.track3D) {
      this.track3D.updateOpponentProgress(stats.id, stats.progress, stats.wpm);
    }

    if (oppGap && this.typingEngine) {
      const pProg = this.typingEngine.getProgress();
      const diff = Math.round((pProg - stats.progress) * 100);
      if (diff >= 0) {
        oppGap.textContent = `+${diff}% ahead`;
        oppGap.className = 'telem-val text-positive font-mono';
      } else {
        oppGap.textContent = `${diff}% behind`;
        oppGap.className = 'telem-val text-negative font-mono';
      }
    }
  }

  handleOpponentFinish(oppFinal) {
    // If AI finishes first and player hasn't
    if (this.isRaceActive) {
      const posVal = document.getElementById('hud-pos-val');
      if (posVal) posVal.innerHTML = `2<small>/2</small>`;
    }
  }

  async handleRaceFinish(finalStats) {
    this.isRaceActive = false;
    clearInterval(this.raceTimerInterval);
    if (this.aiOpponent) this.aiOpponent.stop();

    soundEffects.stopEngine();
    musicManager.duck(0.50, 1100);
    soundEffects.playVictoryFanfare();

    // Crossfade smoothly back to ambient interior music
    musicManager.playInterior(1500);

    const won = !this.aiOpponent || (finalStats.progress >= (this.opponentStats.progress || 0));

    if (won) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Calculate XP earned
    const baseExp = Math.round(finalStats.wpm * 2.5);
    const accuracyBonus = Math.round(finalStats.accuracy * 1.5);
    const winBonus = won ? 150 : 50;
    const totalXp = baseExp + accuracyBonus + winBonus;

    // Save session to IndexedDB
    const sessionRecord = {
      timestamp: Date.now(),
      mode: this.raceConfig.mode,
      difficulty: this.raceConfig.difficulty,
      wpm: finalStats.wpm,
      rawWpm: finalStats.rawWpm,
      accuracy: finalStats.accuracy,
      errorCount: finalStats.errorCount,
      duration: Math.round(finalStats.elapsedSeconds),
      won,
      opponentWpm: this.opponentStats.wpm || 0,
      cpm: finalStats.cpm,
      consistency: finalStats.consistency,
      keyErrors: finalStats.keyErrors
    };
    await storage.addSession(sessionRecord);

    // Update Player Profile in DB
    const profile = await storage.getProfile();
    if (profile) {
      profile.xp = (profile.xp || 0) + totalXp;
      profile.level = Math.floor(profile.xp / 500) + 1;
      profile.racesPlayed = (profile.racesPlayed || 0) + 1;
      if (won) profile.racesWon = (profile.racesWon || 0) + 1;
      if (finalStats.wpm > (profile.bestWpm || 0)) {
        profile.bestWpm = finalStats.wpm;
      }
      profile.totalPracticeTimeSec = (profile.totalPracticeTimeSec || 0) + Math.round(finalStats.elapsedSeconds);

      // Accumulate weak keys
      profile.weakKeys = profile.weakKeys || {};
      for (const [k, count] of Object.entries(finalStats.keyErrors)) {
        profile.weakKeys[k] = (profile.weakKeys[k] || 0) + count;
      }
      await storage.saveProfile(profile);
      this.profile = profile;
    }

    // Check unlocks
    let unlockedVehicleName = null;
    const garage = await storage.getGarage();
    if (garage) {
      if (finalStats.wpm >= 80 && !garage.unlockedVehicles.includes('phantom')) {
        garage.unlockedVehicles.push('phantom');
        unlockedVehicleName = 'Phantom GT (Epic Supercar)';
        await storage.saveGarage(garage);
      }
      if (finalStats.wpm >= 100 && finalStats.accuracy >= 98 && !garage.unlockedVehicles.includes('chronos')) {
        garage.unlockedVehicles.push('chronos');
        unlockedVehicleName = 'Chronos V12 (Mythic Hypercar)';
        await storage.saveGarage(garage);
      }
    }

    this.showResultsModal(finalStats, won, totalXp, unlockedVehicleName);
  }

  showResultsModal(stats, won, xpEarned, unlockedVehicleName) {
    const modal = document.getElementById('race-results-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="results-card card-dark">
        <div class="results-header ${won ? 'victory' : 'defeat'}">
          <span class="results-badge">${won ? '🏆 1ST PLACE VICTORY' : '🥈 2ND PLACE FINISH'}</span>
          <h2 class="results-title">${won ? 'CIRCUIT DOMINATED!' : 'STRONG LAP TIME!'}</h2>
          <p class="results-subtitle">Lap telemetry analyzed and recorded to offline database.</p>
        </div>

        <div class="results-metrics-grid">
          <div class="metric-cell">
            <span class="m-label">FINAL SPEED</span>
            <span class="m-val highlight-cyan font-mono">${stats.wpm} <small>WPM</small></span>
          </div>
          <div class="metric-cell">
            <span class="m-label">ACCURACY</span>
            <span class="m-val text-positive font-mono">${stats.accuracy}%</span>
          </div>
          <div class="metric-cell">
            <span class="m-label">CONSISTENCY</span>
            <span class="m-val text-gold font-mono">${stats.consistency}%</span>
          </div>
          <div class="metric-cell">
            <span class="m-label">ERRORS</span>
            <span class="m-val text-negative font-mono">${stats.errorCount}</span>
          </div>
          <div class="metric-cell">
            <span class="m-label">TIME</span>
            <span class="m-val font-mono">${stats.elapsedSeconds}s</span>
          </div>
          <div class="metric-cell">
            <span class="m-label">XP EARNED</span>
            <span class="m-val text-positive font-mono">+${xpEarned} XP</span>
          </div>
        </div>

        ${unlockedVehicleName ? `
          <div class="unlock-alert-banner">
            <span class="alert-icon">🎁</span>
            <div class="alert-text">
              <strong>NEW VEHICLE UNLOCKED!</strong>
              <span>${unlockedVehicleName} is now ready in your Garage!</span>
            </div>
            <button class="btn btn-small btn-primary" data-nav="garage">View Garage</button>
          </div>
        ` : ''}

        <div class="results-actions">
          <button class="btn btn-primary btn-large glow-primary" id="btn-rematch">
            <span class="btn-icon">↺</span> REMATCH LAP
          </button>
          <button class="btn btn-secondary" id="btn-practice-weak-keys">
            <span class="btn-icon">🎯</span> PRACTICE WEAK KEYS
          </button>
          <button class="btn btn-outline" id="btn-share-results">
            <span class="btn-icon">📸</span> EXPORT SHARE CARD
          </button>
          <button class="btn btn-ghost" data-nav="dashboard">
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-rematch')?.addEventListener('click', () => {
      this.dispose();
      this.setup(this.raceConfig);
    });

    document.getElementById('btn-practice-weak-keys')?.addEventListener('click', () => {
      // Collect weak keys
      const weakKeys = Object.keys(stats.keyErrors);
      const drillText = weakKeys.length > 0
        ? weakKeys.map(k => `${k}${k}${k} ${k}a${k} ${k}e${k} ${k}o${k}`).join(' ')
        : 'focus speed precision consistency accuracy flow rhythm cadence';
      this.dispose();
      this.setup({ mode: 'Solo Practice', customText: drillText });
    });

    document.getElementById('btn-share-results')?.addEventListener('click', () => {
      downloadPerformanceCard({
        username: this.profile?.username || 'Racer',
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        consistency: stats.consistency,
        rank: this.profile?.league || 'Silver II',
        carName: this.playerCarId.toUpperCase(),
        mode: this.raceConfig.mode
      });
    });
  }

  togglePause() {
    if (this.isPaused) {
      this.resumeRace();
    } else if (this.isRaceActive) {
      this.pauseRace();
    }
  }

  pauseRace() {
    if (!this.isRaceActive || this.isPaused) return;
    this.isPaused = true;
    this.isRaceActive = false;
    if (this.raceTimerInterval) {
      clearInterval(this.raceTimerInterval);
      this.raceTimerInterval = null;
    }
    soundEffects.stopEngine();
    musicManager.pauseRaceMusic();

    const pauseModal = document.getElementById('race-pause-modal');
    if (pauseModal) pauseModal.classList.remove('hidden');
  }

  resumeRace() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.isRaceActive = true;
    this.startRaceTimer();
    soundEffects.startEngine();
    musicManager.resumeRaceMusic();

    const pauseModal = document.getElementById('race-pause-modal');
    if (pauseModal) pauseModal.classList.add('hidden');

    const tele = document.getElementById('typing-teleprompter');
    if (tele) tele.focus();
  }

  bindEvents() {
    window.addEventListener('keydown', this.onKeyDownHandler);

    // Pause / Resume triggers
    document.getElementById('race-pause-btn')?.addEventListener('click', () => {
      this.togglePause();
    });

    document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
      this.resumeRace();
    });

    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      this.dispose();
      this.setup(this.raceConfig);
    });

    document.getElementById('btn-pause-exit')?.addEventListener('click', () => {
      this.dispose();
      this.app.showScreen('dashboard');
    });

    // Quick restart button
    document.getElementById('race-restart-btn')?.addEventListener('click', () => {
      this.dispose();
      this.setup(this.raceConfig);
    });
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      if (this.isRaceActive || this.isPaused) {
        this.togglePause();
        return;
      }
    }

    if (!this.isRaceActive || this.isPaused) return;

    // Prevent default scrolling for Spacebar
    if (e.key === ' ') {
      e.preventDefault();
    }

    this.typingEngine.handleKey(e.key);
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDownHandler);
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.raceTimerInterval) {
      clearInterval(this.raceTimerInterval);
      this.raceTimerInterval = null;
    }
    if (this.aiOpponent) {
      this.aiOpponent.stop();
      this.aiOpponent = null;
    }
    this.isRaceActive = false;
    this.isPaused = false;
    soundEffects.stopEngine();

    // Ensure safe return to interior ambient music when exiting or resetting race
    musicManager.playInterior(1500);

    if (this.track3D) {
      this.track3D.dispose();
      this.track3D = null;
    }
  }
}
