/**
 * KEYRUSH — Race Modes Hub View
 * Unified race mode selection, track circuit preview, and difficulty grid launcher
 * designed to match the Home Dashboard dark cyber aesthetic.
 */

import { storage } from '../db/storage.js';
import { soundEffects } from '../audio/soundEffects.js';

export class RaceModesView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.selectedMode = 'AI Racing';
    this.selectedDifficulty = 'AMATEUR';
    this.selectedCircuit = 'Neo-Metropolis GP';
    this.opponentCount = 4;
    this.garage = null;
  }

  async render() {
    this.garage = (await storage.getGarage()) || {};
    const activeCar = this.garage.activeVehicleId || 'talon';

    this.container.innerHTML = `
      <div class="dash-page-container">
        <!-- Section Header -->
        <header class="dash-section-hero">
          <div class="section-hero-content">
            <h1 class="dash-page-title">Race Modes</h1>
            <p class="dash-page-desc">
              Select your competitive arena. Type accurately to generate horsepower, overtake AI competitors, and dominate the circuits.
            </p>
          </div>
          <div class="section-hero-stats">
            <div class="inline-stat-chip">
              <span class="chip-label">Active Supercar</span>
              <span class="chip-val font-mono highlight-cyan">${activeCar.toUpperCase()} GT</span>
            </div>
            <div class="inline-stat-chip">
              <span class="chip-label">Grid</span>
              <span class="chip-val font-mono">5 Racers</span>
            </div>
          </div>
        </header>

        <!-- 5 Interactive Race Mode Cards Grid -->
        <div class="race-modes-grid">
          <!-- Mode 1: Solo Practice -->
          <div class="race-mode-hub-card ${this.selectedMode === 'Solo Practice' ? 'active-mode' : ''}" data-mode="Solo Practice">
            <div class="mode-card-badge purple">TRAINING</div>
            <div class="mode-icon-circle purple-circle">🏎️</div>
            <h3 class="mode-title">Solo Practice</h3>
            <p class="mode-desc">Train at your own pace without opponent pressure. Perfect your touch-typing flow and finger positioning.</p>
            <div class="mode-specs">
              <span>• No AI rivals</span>
              <span>• Custom speed targets</span>
            </div>
            <button class="mode-select-btn ${this.selectedMode === 'Solo Practice' ? 'selected' : ''}">
              ${this.selectedMode === 'Solo Practice' ? '✓ SELECTED' : 'SELECT MODE'}
            </button>
          </div>

          <!-- Mode 2: Race Against AI (Default / Highlighted) -->
          <div class="race-mode-hub-card ${this.selectedMode === 'AI Racing' ? 'active-mode' : ''}" data-mode="AI Racing">
            <div class="mode-card-badge cyan">RECOMMENDED</div>
            <div class="mode-icon-circle blue-circle">🤖</div>
            <h3 class="mode-title">Race Against AI</h3>
            <p class="mode-desc">Populated 5-car grid with autonomous AI opponents simulating realistic human cadence, overtakes, and error recovery.</p>
            <div class="mode-specs">
              <span>• 4 AI competitors</span>
              <span>• Real-time overtakes</span>
            </div>
            <button class="mode-select-btn ${this.selectedMode === 'AI Racing' ? 'selected' : ''}">
              ${this.selectedMode === 'AI Racing' ? '✓ SELECTED' : 'SELECT MODE'}
            </button>
          </div>

          <!-- Mode 3: Local Multiplayer -->
          <div class="race-mode-hub-card ${this.selectedMode === 'Local Multiplayer' ? 'active-mode' : ''}" data-mode="Local Multiplayer">
            <div class="mode-card-badge green">OFFLINE CO-OP</div>
            <div class="mode-icon-circle green-circle">👥</div>
            <h3 class="mode-title">Local Multiplayer</h3>
            <p class="mode-desc">Compete with friends on the same device. Pass-and-play ghost racers or split-screen telemetry comparison.</p>
            <div class="mode-specs">
              <span>• 100% offline</span>
              <span>• Custom challenges</span>
            </div>
            <button class="mode-select-btn ${this.selectedMode === 'Local Multiplayer' ? 'selected' : ''}">
              ${this.selectedMode === 'Local Multiplayer' ? '✓ SELECTED' : 'SELECT MODE'}
            </button>
          </div>

          <!-- Mode 4: Online Multiplayer -->
          <div class="race-mode-hub-card ${this.selectedMode === 'Online Multiplayer' ? 'active-mode' : ''}" data-mode="Online Multiplayer">
            <div class="mode-card-badge gold">ESPORTS LOBBY</div>
            <div class="mode-icon-circle gold-circle">🌐</div>
            <h3 class="mode-title">Online Multiplayer</h3>
            <p class="mode-desc">Challenge real racers across global servers. Real-time netcode, latency display, and synchronized starts.</p>
            <div class="mode-specs">
              <span>• Verified matchmaking</span>
              <span>• Live ping & telemetry</span>
            </div>
            <button class="mode-select-btn ${this.selectedMode === 'Online Multiplayer' ? 'selected' : ''}">
              ${this.selectedMode === 'Online Multiplayer' ? '✓ SELECTED' : 'SELECT MODE'}
            </button>
          </div>

          <!-- Mode 5: Ranked Championship -->
          <div class="race-mode-hub-card ${this.selectedMode === 'Ranked Championship' ? 'active-mode' : ''}" data-mode="Ranked Championship">
            <div class="mode-card-badge red">COMPETITIVE</div>
            <div class="mode-icon-circle red-circle">🏆</div>
            <h3 class="mode-title">Ranked Championship</h3>
            <p class="mode-desc">Ascend the worldwide leaderboard from Bronze to Apex Legend. Win matches to unlock rare vehicles and liveries.</p>
            <div class="mode-specs">
              <span>• Ranked league points</span>
              <span>• Exclusive vehicle rewards</span>
            </div>
            <button class="mode-select-btn ${this.selectedMode === 'Ranked Championship' ? 'selected' : ''}">
              ${this.selectedMode === 'Ranked Championship' ? '✓ SELECTED' : 'SELECT MODE'}
            </button>
          </div>
        </div>

        <!-- Circuit Selection & Launch Configuration Panel -->
        <div class="race-config-panel card-dark">
          <div class="config-cols">
            <!-- Col 1: Difficulty Selector -->
            <div class="config-col">
              <label class="config-label">RACE DIFFICULTY & AI CADENCE</label>
              <div class="difficulty-pills" id="difficulty-pills">
                <button class="diff-pill ${this.selectedDifficulty === 'NOVICE' ? 'active' : ''}" data-diff="NOVICE">NOVICE (40 WPM)</button>
                <button class="diff-pill ${this.selectedDifficulty === 'AMATEUR' ? 'active' : ''}" data-diff="AMATEUR">AMATEUR (60 WPM)</button>
                <button class="diff-pill ${this.selectedDifficulty === 'PRO' ? 'active' : ''}" data-diff="PRO">PRO (80 WPM)</button>
                <button class="diff-pill ${this.selectedDifficulty === 'CHAMPION' ? 'active' : ''}" data-diff="CHAMPION">CHAMPION (100 WPM)</button>
                <button class="diff-pill ${this.selectedDifficulty === 'ADAPTIVE' ? 'active' : ''}" data-diff="ADAPTIVE">ADAPTIVE (DYNAMIC)</button>
              </div>
            </div>

            <!-- Col 2: Track Circuit Selector -->
            <div class="config-col">
              <label class="config-label">TRACK CIRCUIT ENVIRONMENT</label>
              <div class="circuit-cards-row">
                <div class="circuit-choice-card active" data-circuit="Neo-Metropolis GP">
                  <span class="circuit-name">Neo-Metropolis GP</span>
                  <span class="circuit-meta">Night Megacity • 4 Lanes • Tunnel Arches</span>
                </div>
                <div class="circuit-choice-card" data-circuit="Cyber Highway 2099">
                  <span class="circuit-name">Cyber Highway 2099</span>
                  <span class="circuit-meta">High-Speed Straightaway • Wet Asphalt</span>
                </div>
                <div class="circuit-choice-card" data-circuit="Sunset Horizon Expressway">
                  <span class="circuit-name">Sunset Horizon Expressway</span>
                  <span class="circuit-meta">Golden Hour Twilight • Warm Sunset Sky</span>
                </div>
                <div class="circuit-choice-card" data-circuit="Tokyo Neon Rain Circuit">
                  <span class="circuit-name">Tokyo Neon Rain Circuit</span>
                  <span class="circuit-meta">Downpour Rain Streaks • Specular Wet Road</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Big Launch Button -->
          <div class="race-launch-bar">
            <div class="launch-summary">
              <span class="summary-mode">${this.selectedMode}</span>
              <span class="summary-meta">• ${this.selectedDifficulty} • ${this.selectedCircuit} • 5-Car Grid</span>
            </div>
            <button class="btn btn-primary btn-large glow-primary" id="btn-launch-3d-race">
              <span class="btn-play-triangle">▶</span>
              <span>LAUNCH 3D CIRCUIT RACE</span>
              <span class="btn-arrow-right">→</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Mode Card Selection
    this.container.querySelectorAll('.race-mode-hub-card').forEach((card) => {
      card.addEventListener('click', () => {
        soundEffects.playKeyClick(true);
        this.selectedMode = card.getAttribute('data-mode');
        this.container.querySelectorAll('.race-mode-hub-card').forEach((c) => {
          c.classList.toggle('active-mode', c === card);
          const btn = c.querySelector('.mode-select-btn');
          if (btn) {
            btn.classList.toggle('selected', c === card);
            btn.textContent = c === card ? '✓ SELECTED' : 'SELECT MODE';
          }
        });
        const summaryMode = this.container.querySelector('.summary-mode');
        if (summaryMode) summaryMode.textContent = this.selectedMode;
      });
    });

    // Difficulty Pills
    this.container.querySelectorAll('.diff-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        soundEffects.playKeyClick(true);
        this.selectedDifficulty = pill.getAttribute('data-diff');
        this.container.querySelectorAll('.diff-pill').forEach((p) => {
          p.classList.toggle('active', p === pill);
        });
        const summaryMeta = this.container.querySelector('.summary-meta');
        if (summaryMeta) {
          summaryMeta.textContent = `• ${this.selectedDifficulty} • ${this.selectedCircuit} • 5-Car Grid`;
        }
      });
    });

    // Circuit Cards
    this.container.querySelectorAll('.circuit-choice-card').forEach((cCard) => {
      cCard.addEventListener('click', () => {
        soundEffects.playKeyClick(true);
        this.selectedCircuit = cCard.getAttribute('data-circuit');
        this.container.querySelectorAll('.circuit-choice-card').forEach((c) => {
          c.classList.toggle('active', c === cCard);
        });
        const summaryMeta = this.container.querySelector('.summary-meta');
        if (summaryMeta) {
          summaryMeta.textContent = `• ${this.selectedDifficulty} • ${this.selectedCircuit} • 5-Car Grid`;
        }
      });
    });

    // Launch Button
    const launchBtn = document.getElementById('btn-launch-3d-race');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        soundEffects.playKeyClick(true);
        this.app.showScreen('race', {
          mode: this.selectedMode,
          difficulty: this.selectedDifficulty,
          circuit: this.selectedCircuit,
          opponentCount: this.selectedMode === 'Solo Practice' ? 0 : 4
        });
      });
    }
  }
}
