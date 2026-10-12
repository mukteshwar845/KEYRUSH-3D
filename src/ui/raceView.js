/**
 * KEYRUSH — Complete 3D Car Racing Engine & Production Gameplay View
 * - Fullscreen Real Three.js 3D Racing Arena (infinite scrolling procedural city, animated sky, lighting)
 * - True 3D Player sports car with rolling wheels, front steering, nitro exhaust flames, dynamic brake lights
 * - Multi-Car 3D Opponent Grid with live AI pacing, lane wander, and authoritative race standings
 * - Real-time typing engine driving vehicle acceleration, speed lines, camera shake, and cockpit gauges
 * - Synchronized HUD: live 3D track radar, digital speedometer, 7-segment nitro meter, pilot telemetry
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

const CAR_THUMBNAILS = {
  player: '/images/cars/thumb-you.png',
  you: '/images/cars/thumb-you.png',
  talon: '/images/cars/thumb-you.png',
  talon_gt: '/images/cars/thumb-talon-gt.png',
  talon_gold: '/images/cars/thumb-talon-gt.png',
  shadow: '/images/cars/thumb-viper-drift.png',
  nitro_phantom: '/images/cars/thumb-nitro-phantom.png',
  phantom: '/images/cars/thumb-nitro-phantom.png',
  neural_adaptive: '/images/cars/thumb-neural-adaptive.png',
  street_cruiser: '/images/cars/thumb-street-cruiser.png',
  drift_king: '/images/cars/thumb-viper-drift.png',
  viper_drift: '/images/cars/thumb-viper-drift.png',
  cyber_apex: '/images/cars/thumb-street-cruiser.png',
  ghost_rider: '/images/cars/thumb-viper-drift.png',
  titan_overdrive: '/images/cars/thumb-nitro-phantom.png',
  rookie_bolt: '/images/cars/thumb-talon-gt.png',
  vortex: '/images/cars/thumb-viper-drift.png',
  nebula: '/images/cars/thumb-neural-adaptive.png',
  chronos: '/images/cars/thumb-nitro-phantom.png'
};

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
      mode: 'Online Race',
      difficulty: 'AMATEUR',
      circuit: 'Neo-Metropolis GP',
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
    this.playerRank = 5;
    this.previousPlayerRank = 5;
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
    this.initVisualStage();
    this.startCountdown();
  }

  initTypingEngine(text) {
    this.typingEngine = new TypingEngine({
      errorPenaltyMode: this.settings?.errorPenalty || 'standard',
      onCharTyped: (char, isCorrect, stats) => {
        soundEffects.playKeyClick(true);
        this.updateTypingDisplay();
        this.updatePlayerHUD(stats);
        if (this.track3D) {
          this.track3D.updatePlayerProgress(stats.progress, stats.wpm, stats.currentStreak > 15);
        }
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
        const kmh = Math.round(stats.wpm * 2.45);
        if (this.track3D) {
          this.track3D.updatePlayerProgress(progress, stats.wpm, stats.currentStreak > 15);
        }
        soundEffects.updateEngineSpeed(stats.wpm / 80, stats.penaltyMultiplier);
        this.updateCockpitInstruments(stats.wpm, stats);
        this.updateGridStandings();
      },
      onFinish: (finalStats) => {
        if (this.track3D) {
          this.track3D.setFinished(true);
        }
        this.handleRaceFinish(finalStats);
      }
    });

    this.typingEngine.loadText(text);
  }

  renderLayout() {
    const carThumb = CAR_THUMBNAILS[this.playerCarId] || '/images/cars/thumb-talon-gt.png';
    const carDisplayName = this.playerCarId.toUpperCase().replace('_', ' ');

      const isMultiplayer = (this.raceConfig.mode === 'Multiplayer');

      this.container.innerHTML = `
      <div class="race-screen-wrapper">
        <!-- 1. FULLSCREEN 3D RACING ARENA STAGE -->
        <div class="race-arena-stage" id="race-arena-stage">
          <div id="race-3d-canvas-container" class="race-3d-canvas-container"></div>
        </div>

        <!-- 2. TOP HUD STRIP -->
        <header class="hud-top-strip">
          <!-- Logo Brand & Tagline -->
          <div class="hud-brand-container">
            <div class="hud-brand-logo">
              <span class="hud-brand-k">K</span>
              <span class="hud-brand-text">KEYRUSH</span>
            </div>
            <span class="hud-brand-tagline">Type. Race. Dominate.</span>
          </div>

          <!-- Position Bracket Badge (e.g. POSITION 5/5) -->
          <div class="hud-position-bracket" id="hud-pos-pill">
            <span class="bracket-pos-label">POSITION</span>
            <div class="bracket-pos-values">
              <span class="pos-num" id="hud-pos-val">5</span>
              <span class="pos-divider">/</span>
              <span class="pos-total" id="hud-pos-total">5</span>
            </div>
          </div>

          <!-- Mini Track Progress Radar -->
          <div class="hud-mini-track-radar">
            <div class="track-radar-groove" id="track-radar-bar">
              <div class="track-radar-fill" id="track-progress-fill" style="width: 0%"></div>
              <div class="track-radar-dot player-dot" id="radar-player-marker" style="left: 0%"></div>
            </div>
            <span class="track-flag-ico" title="Finish Line">🏁</span>
          </div>

          <!-- Lap Time Stopwatch -->
          <div class="hud-lap-timer-pill">
            <span class="timer-tag">LAP TIME</span>
            <span class="timer-readout font-mono" id="hud-timer-val">00:00.0</span>
          </div>

          <!-- Race Mode Connection Status Badge -->
          <div class="hud-online-badge">
            <span class="status-pulse-dot"></span>
            <span class="status-mode-label">${isMultiplayer ? 'ONLINE RACE' : 'AI CIRCUIT'}</span>
            <span class="latency-pill font-mono" id="hud-latency-pill">${isMultiplayer ? '24ms' : 'GRID'}</span>
          </div>

          <!-- Quick Action Buttons -->
          <div class="hud-action-controls">
            <button class="hud-ctrl-btn" id="race-pause-btn" title="Pause Lap (Esc)">⏸</button>
            <button class="hud-ctrl-btn" id="race-fullscreen-btn" title="Toggle Fullscreen">⛶</button>
            <button class="hud-ctrl-btn" id="race-restart-btn" title="Restart Lap">↺</button>
          </div>
        </header>

        <!-- 3. TOP-LEFT: PILOT TELEMETRY CARD -->
        <aside class="hud-card hud-pilot-card">
          <div class="pilot-identity-header">
            <div class="pilot-avatar-frame">
              <img src="/images/ui/pilot-avatar.png" alt="Pilot" class="pilot-avatar-img" />
            </div>
            <div class="pilot-labels">
              <div class="pilot-name-text">${this.profile?.username || 'You'}</div>
              <div class="pilot-car-model">${carDisplayName}</div>
            </div>
            <div class="pilot-vehicle-preview">
              <img src="${carThumb}" alt="${carDisplayName}" class="pilot-car-thumb" onerror="this.src='/images/cars/thumb-you.png'" />
            </div>
          </div>

          <div class="pilot-stats-grid">
            <div class="pilot-stat-box">
              <div class="pilot-stat-number font-mono highlight-cyan" id="hud-wpm">0</div>
              <div class="pilot-stat-caption">WPM</div>
            </div>
            <div class="pilot-stat-box">
              <div class="pilot-stat-number font-mono" id="hud-acc">100%</div>
              <div class="pilot-stat-caption">ACCURACY</div>
            </div>
            <div class="pilot-stat-box">
              <div class="pilot-stat-number font-mono" id="hud-errors">0</div>
              <div class="pilot-stat-caption">ERRORS</div>
            </div>
            <div class="pilot-stat-box">
              <div class="pilot-stat-number font-mono" id="hud-streak"><span class="flame-ico">🔥</span> 0</div>
              <div class="pilot-stat-caption">STREAK</div>
            </div>
          </div>
        </aside>

        <!-- 4. TOP-RIGHT: RACE STANDINGS CARD -->
        <aside class="hud-card hud-standings-card" id="hud-leaderboard-panel">
          <div class="standings-card-title">
            <span class="trophy-ico">🏆</span>
            <span class="standings-txt">RACE STANDINGS</span>
          </div>
          <div class="standings-rows-stack" id="leaderboard-racers-list">
            <!-- Dynamic Competitor Rows -->
          </div>
        </aside>

        <!-- 5. BOTTOM: TYPING CHALLENGE HUD PANEL -->
        <section class="hud-card hud-typing-challenge-panel" id="typing-teleprompter" tabindex="0">
          <div class="typing-panel-header">
            <div class="typing-title-group">
              <span class="lightning-ico">⚡</span>
              <span class="typing-challenge-tag">TYPING CHALLENGE</span>
              <span class="typing-char-counter font-mono" id="hud-char-count">0 / 0 CHARACTERS</span>
            </div>
            <div class="typing-legend-group">
              <span class="legend-chip"><span class="leg-dot correct"></span> Correct</span>
              <span class="legend-chip"><span class="leg-dot current"></span> Current</span>
              <span class="legend-chip"><span class="leg-dot error"></span> Error</span>
              <span class="legend-chip"><span class="leg-dot upcoming"></span> Upcoming</span>
            </div>
          </div>

          <div class="typing-stream-container">
            <div class="typing-stream-text font-mono" id="text-passage-stream">
              <!-- Live active text stream with [T] caret -->
            </div>
          </div>

          <div class="typing-panel-footer">
            <div class="typing-hint-guide">
              <span class="kbd-ico">⌨️</span>
              <span class="hint-text">Type the text accurately to accelerate your car</span>
            </div>
            <div class="typing-esc-action">
              <span class="esc-badge"><kbd>ESC</kbd> Pause</span>
            </div>
          </div>
        </section>

        <!-- 6. BOTTOM-RIGHT: DIGITAL COCKPIT INSTRUMENTS -->
        <aside class="hud-cockpit-gauges">
          <!-- Circular Speedometer Gauge -->
          <div class="circular-speedometer-module">
            <svg class="speedometer-svg-dial" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="speedoArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#a855f7" />
                  <stop offset="45%" stop-color="#0091ff" />
                  <stop offset="100%" stop-color="#00e5ff" />
                </linearGradient>
                <filter id="cyanDialGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle class="speedo-outer-ring" cx="80" cy="80" r="70" />
              <!-- Track Background Arc -->
              <circle class="speedo-track-arc" cx="80" cy="80" r="62" stroke-dasharray="320" stroke-dashoffset="65" />
              <!-- Dynamic Glowing Speed Fill -->
              <circle class="speedo-fill-arc" id="speed-arc-fill" cx="80" cy="80" r="62" stroke-dasharray="320" stroke-dashoffset="320" filter="url(#cyanDialGlow)" />
            </svg>
            <div class="speedometer-center-core">
              <span class="speedometer-digits font-mono" id="digital-speed-val">0</span>
              <span class="speedometer-unit-label">KM/H</span>
              <span class="speedometer-gear-label font-mono" id="digital-gear-val">1</span>
            </div>
          </div>

          <!-- Vertical Angled Nitro Gauge -->
          <div class="vertical-nitro-module">
            <div class="nitro-badge-title">
              <span class="nitro-bolt-ico">⚡</span>
              <span class="nitro-text-label">NITRO</span>
            </div>
            <div class="nitro-segments-stack" id="nitro-segments-stack">
              <div class="nitro-seg-bar" id="nitro-seg-6"></div>
              <div class="nitro-seg-bar" id="nitro-seg-5"></div>
              <div class="nitro-seg-bar" id="nitro-seg-4"></div>
              <div class="nitro-seg-bar" id="nitro-seg-3"></div>
              <div class="nitro-seg-bar" id="nitro-seg-2"></div>
              <div class="nitro-seg-bar" id="nitro-seg-1"></div>
              <div class="nitro-seg-bar" id="nitro-seg-0"></div>
            </div>
          </div>
        </aside>

        <!-- 7. OVERTAKE NOTIFICATION TOAST -->
        <div class="overtake-toast hidden" id="overtake-toast">
          <span class="overtake-icon">⚡</span>
          <span class="overtake-text" id="overtake-text">OVERTAKING P2!</span>
        </div>

        <!-- 8. COUNTDOWN OVERLAY (3-2-1-GO!) -->
        <div class="countdown-overlay" id="race-countdown-overlay">
          <div class="countdown-box">
            <div class="starting-grid-info">
              <span class="grid-circuit-name">${(this.raceConfig.circuit || 'NEO-METROPOLIS GP').toUpperCase()}</span>
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

        <!-- 9. PAUSE MODAL OVERLAY -->
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

        <!-- 10. RESULTS MODAL -->
        <div class="race-results-modal hidden" id="race-results-modal"></div>
      </div>
    `;

    this.updateTypingDisplay();
    this.bindEvents();
  }

  initVisualStage() {
    const stageEl = document.getElementById('race-3d-canvas-container');
    if (stageEl) {
      this.track3D = new Track3D(stageEl, {
        circuit: this.raceConfig.circuit || 'Neo-Metropolis GP'
      });
      this.track3D.setPlayerCar(this.playerCarId, this.paintColor, this.underglowColor);
    }

    // Initialize 4-car AI Opponent Grid
    const oppCount = this.raceConfig.opponentCount || 4;
    this.aiGrid = new AiOpponentGrid(
      this.raceConfig.difficulty,
      this.profile?.averageWpm || 65,
      oppCount
    );

    const opponentsData = this.aiGrid.getOpponentsData();
    if (this.track3D) {
      this.track3D.setOpponents(opponentsData);
      this.track3D.setCountdownState(true);
    }
    this.initRadarMarkers(opponentsData);
    this.updateGridStandings();
  }

  initRadarMarkers(opponentsData) {
    const radarTrack = document.getElementById('track-radar-bar');
    if (!radarTrack) return;

    opponentsData.forEach(opp => {
      const marker = document.createElement('div');
      marker.className = 'track-radar-dot opponent-dot';
      marker.id = `radar-opp-${opp.id}`;
      marker.style.left = '0%';
      marker.style.background = opp.color || '#a855f7';
      marker.title = `${opp.name} (${opp.wpm} WPM)`;
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

        if (this.track3D) {
          this.track3D.setCountdownState(false);
          this.track3D.triggerNitroSurge();
        }

        clearInterval(this.countdownInterval);
        this.countdownInterval = null;

        setTimeout(() => {
          if (overlay) overlay.style.display = 'none';
          this.isCountdown = false;
          this.isRaceActive = true;
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
    const counter = document.getElementById('hud-char-count');
    if (!stream || !this.typingEngine) return;

    const text = this.typingEngine.targetText;
    const curIdx = this.typingEngine.currentIndex;

    if (counter) {
      counter.textContent = `${curIdx} / ${text.length} CHARACTERS`;
    }

    let html = '';
    // Reading window (20 chars behind, 65 upcoming)
    const startIdx = Math.max(0, curIdx - 20);
    const endIdx = Math.min(text.length, curIdx + 65);

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
    const progressFill = document.getElementById('track-progress-fill');
    const playerMarker = document.getElementById('radar-player-marker');

    if (wpmEl) wpmEl.textContent = stats.wpm;
    if (accEl) accEl.textContent = `${stats.accuracy}%`;
    if (errEl) errEl.textContent = stats.errorCount;
    if (streakEl) streakEl.innerHTML = `<span class="flame-ico">🔥</span> ${stats.currentStreak}`;

    const progPercent = Math.min(100, Math.round(stats.progress * 100));
    if (progressFill) progressFill.style.width = `${progPercent}%`;
    if (playerMarker) playerMarker.style.left = `${progPercent}%`;
  }

  updateCockpitInstruments(wpm, stats = {}) {
    const kmh = Math.round(wpm * 2.45);
    const digitalEl = document.getElementById('digital-speed-val');
    const arcFill = document.getElementById('speed-arc-fill');
    const gearEl = document.getElementById('digital-gear-val');

    if (digitalEl) digitalEl.textContent = kmh.toString();

    // Transmission Gear Calculation
    if (gearEl) {
      const gear = kmh < 35 ? 1 : (kmh < 75 ? 2 : (kmh < 120 ? 3 : (kmh < 165 ? 4 : (kmh < 210 ? 5 : 6))));
      gearEl.textContent = gear.toString();
    }

    // SVG Circular Speedometer Fill Arc
    const ratio = Math.min(1.0, kmh / 260);
    if (arcFill) {
      const offset = 320 - (ratio * 255);
      arcFill.style.strokeDashoffset = offset;
    }

    // 7-segment Vertical Nitro Gauge
    const streak = stats.currentStreak || 0;
    const nitroRatio = Math.min(1.0, (wpm / 80) * 0.7 + (streak / 25) * 0.3);
    const activeSegments = Math.round(nitroRatio * 7);

    for (let i = 0; i < 7; i++) {
      const seg = document.getElementById(`nitro-seg-${i}`);
      if (seg) {
        seg.classList.toggle('active', i < activeSegments);
      }
    }

    if (wpm >= 70 && this.track3D) {
      this.track3D.triggerNitroSurge();
    }
  }

  handleGridUpdate(opponents) {
    opponents.forEach(opp => {
      const marker = document.getElementById(`radar-opp-${opp.id}`);
      if (marker) {
        const pct = Math.min(100, Math.round(opp.progress * 100));
        marker.style.left = `${pct}%`;
      }
      if (this.track3D) {
        this.track3D.updateOpponentProgress(opp.id, opp.progress, opp.wpm);
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

    // Update Top Position Bracket Badge
    const posVal = document.getElementById('hud-pos-val');
    const posTotal = document.getElementById('hud-pos-total');
    if (posVal) posVal.textContent = this.playerRank;
    if (posTotal) posTotal.textContent = result.totalRacers;

    // Render Right Standings List
    const listEl = document.getElementById('leaderboard-racers-list');
    if (!listEl) return;

    listEl.innerHTML = result.standings.map(r => {
      const isPlayer = r.isPlayer;
      const thumbKey = isPlayer ? 'player' : (r.id || 'nitro_phantom');
      const thumbSrc = CAR_THUMBNAILS[thumbKey] || CAR_THUMBNAILS[r.carModel] || '/images/cars/thumb-you.png';
      const gapDisplay = isPlayer ? '--' : (r.rank === 1 ? '+0.0s' : `+${((r.rank - 1) * 0.4).toFixed(1)}s`);

      return `
        <div class="standings-row ${isPlayer ? 'player-active-row' : ''}">
          <span class="racer-rank-num font-mono">${r.rank}</span>
          <div class="racer-car-box">
            <img src="${thumbSrc}" alt="${r.name}" class="racer-thumb-img" onerror="this.src='/images/cars/thumb-you.png'" />
          </div>
          <div class="racer-info-cell">
            <div class="racer-name">${isPlayer ? 'You' : `${r.name} <span class="ai-tag-chip">AI</span>`}</div>
            <div class="racer-stats-sub font-mono">
              <span class="racer-wpm highlight-cyan">${r.wpm} WPM</span>
              <span class="racer-acc">${r.accuracy}%</span>
            </div>
          </div>
          <div class="racer-gap font-mono ${r.rank === 1 ? 'leader' : ''}">${gapDisplay}</div>
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

    musicManager.playInterior(1500);

    const isWinner = this.playerRank === 1;

    if (isWinner) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    }

    const baseExp = Math.round(finalStats.wpm * 2.5);
    const accuracyBonus = Math.round(finalStats.accuracy * 1.5);
    const rankBonus = this.playerRank === 1 ? 180 : (this.playerRank === 2 ? 100 : 50);
    const totalXp = baseExp + accuracyBonus + rankBonus;

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

      profile.weakKeys = profile.weakKeys || {};
      for (const [k, count] of Object.entries(finalStats.keyErrors)) {
        profile.weakKeys[k] = (profile.weakKeys[k] || 0) + count;
      }
      await storage.saveProfile(profile);
      this.profile = profile;
    }

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
    if (this.track3D) {
      this.track3D.setPaused(true);
    }
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
    if (this.track3D) {
      this.track3D.setPaused(false);
    }
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

    document.getElementById('race-restart-btn')?.addEventListener('click', () => {
      this.dispose();
      this.setup(this.raceConfig);
    });

    document.getElementById('race-fullscreen-btn')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.togglePause();
      return;
    }

    if (!this.isRaceActive || this.isPaused || this.isCountdown) {
      return;
    }

    // Dynamic lane switching with Left and Right arrow keys
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (this.track3D) {
        this.track3D.steerLane(-1);
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (this.track3D) {
        this.track3D.steerLane(1);
      }
      return;
    }

    if (e.key.length === 1 || e.key === 'Backspace') {
      if (e.key === ' ' || e.key === 'Backspace') {
        e.preventDefault();
      }
      this.typingEngine.handleKey(e.key);
    }
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
    if (this.track3D) {
      this.track3D.dispose();
      this.track3D = null;
    }
    soundEffects.stopEngine();
    clearTimeout(this.overtakeTimeout);
  }
}
