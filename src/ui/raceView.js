/**
 * KeyRush Core Typing-Racing Gameplay Screen (Screen 03) — Complete AAA Overhaul
 * - 3D Cyberpunk Megacity race track with dynamic chase camera & procedural scenery
 * - Multi-opponent competitive grid (3-5 simultaneous AI racers) with independent telemetry
 * - Real-time esports race standings leaderboard (P1 to P5) with live overtake notifications
 * - Multi-vehicle track progress radar showing live positions of all competitors
 * - Advanced digital cockpit instrument cluster: speed (KM/H), RPM tachometer, active gear (1-6), nitro
 * - High-contrast readable teleprompter with smooth text streaming, active character caret, error feedback
 * - Cinematic race states: starting grid, 3-2-1-GO countdown, active race, victory podium & full standings
 */

import { Track3D } from '../graphics/track3D.js';
import { TypingEngine } from '../engine/typingEngine.js';
import { getRandomPassage, getAcademyLesson } from '../engine/textGenerator.js';
import { AiOpponentGrid } from '../engine/aiOpponent.js';
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
    this.aiGrid = null;
    this.isRaceActive = false;
    this.isCountdown = false;
    this.isPaused = false;
    this.raceConfig = {
      mode: 'AI Racing',
      difficulty: 'AMATEUR',
      aiTier: 'intermediate',
      lessonId: null,
      customText: null,
      opponentCount: 4
    };

    this.playerCarId = 'talon';
    this.paintColor = '#00e5ff';
    this.underglowColor = '#a855f7';
    this.settings = null;
    this.profile = null;

    // Grid Telemetry State
    this.currentStandings = [];
    this.playerRank = 1;
    this.previousPlayerRank = 1;
    this.overtakeTimeout = null;

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
        this.updatePlayerHUD(stats);
      },
      onMistake: (expected, typed, stats) => {
        soundEffects.playKeyClick(false);
        soundEffects.playErrorMisfire();
        if (this.track3D) {
          this.track3D.triggerBrakeFeedback();
        }
        this.updateTypingDisplay(true);
        this.updatePlayerHUD(stats);
      },
      onProgress: (progress, stats) => {
        if (this.track3D) {
          const isBoosting = stats.wpm >= 70;
          this.track3D.updatePlayerProgress(progress, stats.wpm, isBoosting);
        }
        soundEffects.updateEngineSpeed(stats.wpm / 80, stats.penaltyMultiplier);
        this.updateCockpitInstruments(stats.wpm);
        this.updateGridStandings();
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
        <!-- 3D TRACK CANVAS CONTAINER (Upper 62%) -->
        <div class="race-viewport-container">
          <div id="race-3d-canvas" class="race-3d-scene"></div>

          <!-- TOP TELEMETRY HUD BAR -->
          <div class="top-hud-strip">
            <!-- Dynamic Race Position Badge -->
            <div class="hud-pill race-pos-pill" id="hud-pos-pill">
              <span class="hud-pos-prefix">POS</span>
              <span class="hud-pos-rank" id="hud-pos-val">P1</span>
              <span class="hud-pos-total" id="hud-pos-total">/ 5</span>
            </div>

            <!-- Multi-Vehicle Track Progress Radar -->
            <div class="race-track-radar-wrap">
              <div class="track-radar-track" id="track-radar-bar">
                <div class="track-progress-fill" id="track-progress-fill" style="width: 0%"></div>
                <!-- Dynamic markers for player and opponents will be mounted here -->
                <div class="radar-marker player-marker" id="radar-player-marker" style="left: 0%" title="You">
                  <span class="marker-dot player-dot"></span>
                  <span class="marker-label">YOU</span>
                </div>
              </div>
              <div class="track-finish-flag" title="Finish Line">🏁</div>
            </div>

            <!-- Race Lap Stopwatch -->
            <div class="hud-pill timer-pill">
              <span class="hud-label">LAP TIME</span>
              <span class="hud-val font-mono" id="hud-timer-val">00:00.0</span>
            </div>

            <!-- Network Status Pill -->
            <div class="hud-pill network-pill" id="hud-network-pill">
              <span class="status-dot online"></span>
              <span id="hud-network-label">OFFLINE AI GRID</span>
            </div>

            <!-- Quick Action Buttons -->
            <button class="btn btn-icon btn-small hud-pause-btn" id="race-pause-btn" title="Pause Lap (Esc)">
              ⏸
            </button>
            <button class="btn btn-icon btn-small hud-restart-btn" id="race-restart-btn" title="Restart Lap">
              ↺
            </button>
          </div>

          <!-- LEFT HUD: PILOT TELEMETRY -->
          <div class="hud-panel hud-left-pilot">
            <div class="pilot-badge">
              <span class="pilot-avatar">${this.profile?.avatar || '🏎️'}</span>
              <div class="pilot-info">
                <span class="pilot-name">${this.profile?.username || 'Pilot'}</span>
                <span class="pilot-car">${this.playerCarId.toUpperCase()} GT</span>
              </div>
            </div>

            <div class="telem-row main-wpm-row">
              <div class="telem-block">
                <span class="telem-label">SPEED (WPM)</span>
                <span class="telem-val highlight-cyan font-mono" id="hud-wpm">0</span>
              </div>
              <div class="telem-badge-container">
                <span class="speed-tier-badge" id="speed-tier-badge">IDLE</span>
              </div>
            </div>

            <div class="telem-grid-metrics">
              <div class="telem-block">
                <span class="telem-label">ACCURACY</span>
                <span class="telem-val text-positive font-mono" id="hud-acc">100%</span>
              </div>
              <div class="telem-block">
                <span class="telem-label">ERRORS</span>
                <span class="telem-val text-negative font-mono" id="hud-errors">0</span>
              </div>
              <div class="telem-block">
                <span class="telem-label">STREAK</span>
                <span class="telem-val text-gold font-mono" id="hud-streak">0 🔥</span>
              </div>
            </div>
          </div>

          <!-- RIGHT HUD: LIVE ESPORTS LEADERBOARD -->
          <div class="hud-panel hud-right-leaderboard" id="hud-leaderboard-panel">
            <div class="leaderboard-header">
              <span class="lb-title">⚡ RACE STANDINGS</span>
              <span class="lb-mode">${this.raceConfig.difficulty}</span>
            </div>
            <div class="leaderboard-racers-list" id="leaderboard-racers-list">
              <!-- Dynamically populated 5 racer rows -->
            </div>
          </div>

          <!-- OVERTAKE NOTIFICATION TOAST -->
          <div class="overtake-toast hidden" id="overtake-toast">
            <span class="overtake-icon">⚡</span>
            <span class="overtake-text" id="overtake-text">OVERTAKING P2!</span>
          </div>

          <!-- COUNTDOWN OVERLAY (3-2-1-GO!) -->
          <div class="countdown-overlay" id="race-countdown-overlay">
            <div class="countdown-box">
              <div class="starting-grid-info">
                <span class="grid-circuit-name">NEO-METROPOLIS CIRCUIT</span>
                <span class="grid-lap-desc">${this.raceConfig.mode} • 5 RACERS GRID</span>
              </div>
              <div class="countdown-lights">
                <span class="light red" id="light-1"></span>
                <span class="light yellow" id="light-2"></span>
                <span class="light green" id="light-3"></span>
              </div>
              <div class="countdown-number" id="countdown-number">READY</div>
              <div class="countdown-subtext">HANDS ON HOME ROW • TYPE TO ACCELERATE</div>
            </div>
          </div>
        </div>

        <!-- LOWER SECTION: REBUILT TYPING TELEPROMPTER & COCKPIT INSTRUMENTS -->
        <div class="race-controls-dock">
          <!-- TYPING TELEPROMPTER CARD -->
          <div class="typing-teleprompter-card" id="typing-teleprompter" tabindex="0">
            <div class="teleprompter-glass-header">
              <span class="hud-term-dot"></span>
              <span class="hud-term-title">HUD TELEMETRY FEED // KEYSTROKE SENSOR ACTIVE</span>
              <span class="hud-focus-indicator">● KEYBOARD LOCKED</span>
            </div>
            <div class="text-passage-stream" id="text-passage-stream">
              <!-- Dynamically populated character spans -->
            </div>
            <div class="typing-status-hint">
              <span class="hint-key">⚡ Smooth, accurate cadence maximizes speed and downforce</span>
              <span class="hint-shortcuts"><kbd>[ESC]</kbd> Pit Stop / Pause</span>
            </div>
          </div>

          <!-- HIGH-TECH COCKPIT INSTRUMENT CLUSTER -->
          <div class="dashboard-instrument-cluster">
            <!-- Integrated Speedometer Arc & Gear Display -->
            <div class="speedometer-gauge-box">
              <div class="speed-arc-gauge">
                <svg class="speed-svg-dial" viewBox="0 0 160 140">
                  <path class="arc-bg" d="M 25 120 A 65 65 0 1 1 135 120" />
                  <path class="arc-fill" id="speed-arc-fill" d="M 25 120 A 65 65 0 1 1 135 120" stroke-dasharray="280" stroke-dashoffset="280" />
                </svg>
                <div class="speed-center-readout">
                  <div class="gear-indicator-badge" id="gear-val">GEAR 1</div>
                  <span class="speed-number font-mono" id="digital-speed-val">000</span>
                  <span class="speed-unit">KM/H</span>
                </div>
              </div>
            </div>

            <!-- Engine RPM Tachometer & Nitro Surge -->
            <div class="tachometer-cluster">
              <div class="tach-header">
                <span>THROTTLE RPM</span>
                <span class="tach-val font-mono" id="rpm-val">1,200 RPM</span>
              </div>
              <div class="tach-bars-container" id="tach-bars-container">
                <!-- 24 dynamic rev segments -->
              </div>
              <div class="nitro-gauge-wrap">
                <div class="nitro-header">
                  <span class="nitro-label">NITRO SURGE</span>
                  <span class="nitro-status-tag" id="nitro-status-tag">CHARGING</span>
                </div>
                <div class="nitro-bar">
                  <div class="nitro-fill" id="nitro-fill" style="width: 15%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PAUSE MODAL OVERLAY -->
        <div class="race-pause-modal hidden" id="race-pause-modal">
          <div class="pause-card card-dark">
            <span class="pause-badge">⏸ RACE PAUSED</span>
            <h2 class="pause-title">PIT STOP CREW ACTIVE</h2>
            <p class="pause-subtitle">Telemetry recording suspended. Audio and engine idle.</p>
            <div class="pause-actions">
              <button class="btn btn-primary btn-large glow-primary" id="btn-pause-resume">
                ▶ RESUME RACE
              </button>
              <button class="btn btn-secondary" id="btn-pause-restart">
                ↺ RESTART LAP
              </button>
              <button class="btn btn-ghost" id="btn-pause-exit">
                ✕ RETURN TO DASHBOARD
              </button>
            </div>
          </div>
        </div>

        <!-- RESULTS MODAL (HIDDEN INITIALLY) -->
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
      const isRedline = i >= 19;
      html += `<div class="tach-seg ${isRedline ? 'redline' : ''}" id="tach-seg-${i}"></div>`;
    }
    container.innerHTML = html;
  }

  init3DTrack() {
    const canvasBox = document.getElementById('race-3d-canvas');
    if (!canvasBox) return;

    this.track3D = new Track3D(canvasBox);
    this.track3D.setPlayerCar(this.playerCarId, this.paintColor, this.underglowColor);

    // Initialize 4-car AI Opponent Grid
    if (this.raceConfig.mode !== 'Solo Practice') {
      const oppCount = this.raceConfig.opponentCount || 4;
      this.aiGrid = new AiOpponentGrid(
        this.raceConfig.difficulty,
        this.profile?.averageWpm || 65,
        oppCount
      );

      const opponentsData = this.aiGrid.getOpponentsData();
      this.track3D.setOpponents(opponentsData);
      this.initRadarMarkers(opponentsData);
      this.updateGridStandings();
    } else {
      // Solo Practice
      const lb = document.getElementById('hud-leaderboard-panel');
      if (lb) lb.style.display = 'none';
      const posPill = document.getElementById('hud-pos-pill');
      if (posPill) posPill.innerHTML = `<span class="hud-pos-rank">SOLO</span>`;
    }
  }

  initRadarMarkers(opponentsData) {
    const radarTrack = document.getElementById('track-radar-bar');
    if (!radarTrack) return;

    opponentsData.forEach(opp => {
      const marker = document.createElement('div');
      marker.className = 'radar-marker opponent-marker';
      marker.id = `radar-opp-${opp.id}`;
      marker.style.left = '0%';
      marker.title = `${opp.name} (${opp.wpm} WPM)`;
      marker.innerHTML = `
        <span class="marker-dot" style="background: ${opp.color}"></span>
      `;
      radarTrack.appendChild(marker);
    });
  }

  startCountdown() {
    this.isCountdown = true;
    this.isRaceActive = false;
    let count = 3;

    if (this.track3D) {
      this.track3D.setCountdownState(true);
    }

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
          if (this.track3D) {
            this.track3D.setCountdownState(false);
          }
          this.startRaceTimer();

          // High-energy racing soundtrack
          musicManager.playRacing(1200);

          // Start multi-car AI Grid simulation
          if (this.aiGrid) {
            this.aiGrid.start(
              this.typingEngine.targetText.length,
              (updatedOpponents) => this.handleGridUpdate(updatedOpponents),
              (finalOpponents) => this.handleGridFinish(finalOpponents)
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

  updateTypingDisplay(hadError = false) {
    const stream = document.getElementById('text-passage-stream');
    if (!stream || !this.typingEngine) return;

    const text = this.typingEngine.targetText;
    const curIdx = this.typingEngine.currentIndex;

    let html = '';
    // Generous reading window (25 characters behind, 75 upcoming)
    const startIdx = Math.max(0, curIdx - 25);
    const endIdx = Math.min(text.length, curIdx + 75);

    for (let i = startIdx; i < endIdx; i++) {
      const ch = text[i];
      const displayChar = ch === ' ' ? ' ' : ch;

      if (i < curIdx) {
        html += `<span class="char typed-correct">${displayChar === ' ' ? '&nbsp;' : displayChar}</span>`;
      } else if (i === curIdx) {
        const errorCls = hadError ? 'char-error' : '';
        html += `<span class="char current-char-caret ${errorCls}">${displayChar === ' ' ? '&nbsp;' : displayChar}</span>`;
      } else {
        html += `<span class="char upcoming-char">${displayChar === ' ' ? '&nbsp;' : displayChar}</span>`;
      }
    }

    stream.innerHTML = html;
  }

  updatePlayerHUD(stats) {
    const wpmEl = document.getElementById('hud-wpm');
    const accEl = document.getElementById('hud-acc');
    const errEl = document.getElementById('hud-errors');
    const streakEl = document.getElementById('hud-streak');
    const speedTierEl = document.getElementById('speed-tier-badge');
    const progressFill = document.getElementById('track-progress-fill');
    const playerMarker = document.getElementById('radar-player-marker');

    if (wpmEl) wpmEl.textContent = stats.wpm;
    if (accEl) accEl.textContent = `${stats.accuracy}%`;
    if (errEl) errEl.textContent = stats.errorCount;
    if (streakEl) streakEl.textContent = `${stats.currentStreak} 🔥`;

    // Dynamic Speed Tier Badge
    if (speedTierEl) {
      if (stats.wpm >= 90) {
        speedTierEl.textContent = 'HYPERDRIVE';
        speedTierEl.className = 'speed-tier-badge hyper';
      } else if (stats.wpm >= 70) {
        speedTierEl.textContent = 'SUPERSONIC';
        speedTierEl.className = 'speed-tier-badge supersonic';
      } else if (stats.wpm >= 45) {
        speedTierEl.textContent = 'CRUISING';
        speedTierEl.className = 'speed-tier-badge cruising';
      } else {
        speedTierEl.textContent = 'WARMUP';
        speedTierEl.className = 'speed-tier-badge warmup';
      }
    }

    const progPercent = Math.min(100, Math.round(stats.progress * 100));
    if (progressFill) progressFill.style.width = `${progPercent}%`;
    if (playerMarker) playerMarker.style.left = `${progPercent}%`;
  }

  updateCockpitInstruments(wpm) {
    // Speed: 80 WPM ~ 180 km/h, max ~ 285 km/h
    const kmh = Math.round(wpm * 2.3);
    const digitalEl = document.getElementById('digital-speed-val');
    const gearEl = document.getElementById('gear-val');
    const rpmValEl = document.getElementById('rpm-val');
    const nitroFill = document.getElementById('nitro-fill');
    const nitroTag = document.getElementById('nitro-status-tag');
    const arcFill = document.getElementById('speed-arc-fill');

    if (digitalEl) digitalEl.textContent = kmh.toString().padStart(3, '0');

    // Gear calculation based on speed
    if (gearEl) {
      let gear = 1;
      if (kmh >= 220) gear = 6;
      else if (kmh >= 170) gear = 5;
      else if (kmh >= 125) gear = 4;
      else if (kmh >= 80) gear = 3;
      else if (kmh >= 40) gear = 2;
      gearEl.textContent = `GEAR ${gear}`;
    }

    // SVG Speedometer Arc
    const ratio = Math.min(1.0, kmh / 260);
    if (arcFill) {
      // Stroke dashoffset: 280 (empty) to 0 (full)
      const offset = 280 - (ratio * 280);
      arcFill.style.strokeDashoffset = offset;
    }

    // RPM calculation: 1,200 to 9,200 RPM
    const rpm = Math.round(1200 + ratio * 8000);
    if (rpmValEl) rpmValEl.textContent = `${rpm.toLocaleString()} RPM`;

    // 24 Tachometer Segments
    const activeSegs = Math.round(ratio * 24);
    for (let i = 0; i < 24; i++) {
      const seg = document.getElementById(`tach-seg-${i}`);
      if (seg) {
        seg.classList.toggle('active', i < activeSegs);
      }
    }

    // Nitro Surge Fill
    const nitroPercent = Math.min(100, Math.round((wpm / 80) * 100));
    if (nitroFill) nitroFill.style.width = `${nitroPercent}%`;
    if (nitroTag) {
      if (wpm >= 70) {
        nitroTag.textContent = 'OVERDRIVE ACTIVE!';
        nitroTag.className = 'nitro-status-tag active';
      } else {
        nitroTag.textContent = 'CHARGING';
        nitroTag.className = 'nitro-status-tag';
      }
    }
  }

  handleGridUpdate(opponents) {
    if (!this.track3D) return;

    // Update 3D opponents & track radar markers
    opponents.forEach(opp => {
      this.track3D.updateOpponentProgress(opp.id, opp.progress, opp.wpm);

      const marker = document.getElementById(`radar-opp-${opp.id}`);
      if (marker) {
        const pct = Math.min(100, Math.round(opp.progress * 100));
        marker.style.left = `${pct}%`;
      }
    });

    this.updateGridStandings();
  }

  updateGridStandings() {
    if (!this.aiGrid || !this.typingEngine) return;

    const playerStats = this.typingEngine.getStats();
    const result = this.aiGrid.calculateStandings({
      name: this.profile?.username || 'You',
      avatar: this.profile?.avatar || '🏎️',
      carId: this.playerCarId,
      progress: playerStats.progress,
      wpm: playerStats.wpm,
      accuracy: playerStats.accuracy,
      isFinished: this.typingEngine.isFinished
    });

    this.currentStandings = result.standings;
    this.playerRank = result.playerPosition;

    // Check for Overtake event
    if (this.previousPlayerRank > this.playerRank) {
      this.showOvertakeNotification(`P${this.previousPlayerRank} ➔ P${this.playerRank}: OVERTAKE!`);
    }
    this.previousPlayerRank = this.playerRank;

    // Update Top Position Badge
    const posVal = document.getElementById('hud-pos-val');
    const posTotal = document.getElementById('hud-pos-total');
    if (posVal) posVal.textContent = `P${this.playerRank}`;
    if (posTotal) posTotal.textContent = `/ ${result.totalRacers}`;

    // Render Right Leaderboard Rows
    const listEl = document.getElementById('leaderboard-racers-list');
    if (!listEl) return;

    listEl.innerHTML = result.standings.map(r => {
      const isPlayer = r.isPlayer;
      const rankBadge = r.rank === 1 ? 'gold' : (r.rank === 2 ? 'silver' : (r.rank === 3 ? 'bronze' : ''));
      return `
        <div class="lb-row ${isPlayer ? 'player-row' : ''}">
          <span class="lb-rank ${rankBadge}">P${r.rank}</span>
          <span class="lb-avatar">${r.avatar}</span>
          <div class="lb-details">
            <span class="lb-name">${r.name}</span>
            <span class="lb-gap">${r.gapText}</span>
          </div>
          <span class="lb-wpm font-mono">${r.wpm} <small>WPM</small></span>
        </div>
      `;
    }).join('');
  }

  showOvertakeNotification(text) {
    const toast = document.getElementById('overtake-toast');
    const toastText = document.getElementById('overtake-text');
    if (!toast || !toastText) return;

    toastText.textContent = text;
    toast.classList.remove('hidden');

    clearTimeout(this.overtakeTimeout);
    this.overtakeTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2200);
  }

  handleGridFinish(finalOpponents) {
    this.updateGridStandings();
  }

  async handleRaceFinish(finalStats) {
    this.isRaceActive = false;
    clearInterval(this.raceTimerInterval);
    if (this.aiGrid) this.aiGrid.stop();

    soundEffects.stopEngine();
    musicManager.duck(0.50, 1100);
    soundEffects.playVictoryFanfare();

    // Crossfade back to ambient music
    musicManager.playInterior(1500);

    const isWinner = this.playerRank === 1;

    if (isWinner) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    }

    // XP calculation
    const baseExp = Math.round(finalStats.wpm * 2.5);
    const accuracyBonus = Math.round(finalStats.accuracy * 1.5);
    const rankBonus = this.playerRank === 1 ? 180 : (this.playerRank === 2 ? 100 : 50);
    const totalXp = baseExp + accuracyBonus + rankBonus;

    // Save race session to IndexedDB
    const sessionRecord = {
      timestamp: Date.now(),
      mode: this.raceConfig.mode,
      difficulty: this.raceConfig.difficulty,
      wpm: finalStats.wpm,
      rawWpm: finalStats.rawWpm,
      accuracy: finalStats.accuracy,
      errorCount: finalStats.errorCount,
      duration: Math.round(finalStats.elapsedSeconds),
      won: isWinner,
      finishRank: this.playerRank,
      cpm: finalStats.cpm,
      consistency: finalStats.consistency,
      keyErrors: finalStats.keyErrors
    };
    await storage.addSession(sessionRecord);

    // Update Player Profile
    const profile = await storage.getProfile();
    if (profile) {
      profile.xp = (profile.xp || 0) + totalXp;
      profile.level = Math.floor(profile.xp / 500) + 1;
      profile.racesPlayed = (profile.racesPlayed || 0) + 1;
      if (isWinner) profile.racesWon = (profile.racesWon || 0) + 1;
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

    // Vehicle unlocks
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

    this.showResultsModal(finalStats, isWinner, totalXp, unlockedVehicleName);
  }

  showResultsModal(stats, won, xpEarned, unlockedVehicleName) {
    const modal = document.getElementById('race-results-modal');
    if (!modal) return;

    modal.classList.remove('hidden');

    const rankTitle = this.playerRank === 1
      ? '🏆 1ST PLACE CHAMPION'
      : (this.playerRank === 2 ? '🥈 2ND PLACE PODIUM' : `🏁 P${this.playerRank} FINISH`);

    modal.innerHTML = `
      <div class="results-card card-dark">
        <div class="results-header ${won ? 'victory' : 'podium'}">
          <span class="results-badge">${rankTitle}</span>
          <h2 class="results-title">${won ? 'CIRCUIT DOMINATED!' : 'STRONG LAP TELEMETRY!'}</h2>
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
            <span class="m-label">LAP TIME</span>
            <span class="m-val font-mono">${stats.elapsedSeconds}s</span>
          </div>
          <div class="metric-cell">
            <span class="m-label">XP EARNED</span>
            <span class="m-val text-positive font-mono">+${xpEarned} XP</span>
          </div>
        </div>

        <!-- Full Grid Standings Table -->
        <div class="results-standings-section">
          <h3 class="results-standings-title">FINAL GRID STANDINGS</h3>
          <div class="results-table">
            ${this.currentStandings.map(r => `
              <div class="results-table-row ${r.isPlayer ? 'player-row' : ''}">
                <span class="res-rank">P${r.rank}</span>
                <span class="res-avatar">${r.avatar}</span>
                <span class="res-name">${r.name}</span>
                <span class="res-wpm font-mono">${r.wpm} WPM</span>
                <span class="res-acc font-mono">${r.accuracy}% ACC</span>
              </div>
            `).join('')}
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
          <button class="btn btn-ghost" id="btn-results-dashboard">
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
        rank: `P${this.playerRank}`,
        carName: this.playerCarId.toUpperCase(),
        mode: this.raceConfig.mode
      });
    });

    document.getElementById('btn-results-dashboard')?.addEventListener('click', () => {
      this.dispose();
      this.app.showScreen('dashboard');
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
    if (this.aiGrid) {
      this.aiGrid.stop();
      this.aiGrid = null;
    }
    this.isRaceActive = false;
    this.isPaused = false;
    soundEffects.stopEngine();

    // Crossfade smoothly back to ambient music
    musicManager.playInterior(1500);

    if (this.track3D) {
      this.track3D.dispose();
      this.track3D = null;
    }
  }
}
