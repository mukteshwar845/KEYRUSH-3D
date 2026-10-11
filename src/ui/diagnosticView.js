/**
 * KeyRush Skill Assessment & Difficulty Calibration (Screen 04)
 * Allows manual difficulty selection across 4 tiers or an interactive
 * timed diagnostic test that algorithmically determines the ideal racing tier.
 */

import { TypingEngine } from '../engine/typingEngine.js';
import { getDiagnosticPassage } from '../engine/textGenerator.js';
import { soundEffects } from '../audio/soundEffects.js';

export class DiagnosticView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.engine = null;
    this.isTestRunning = false;
    this.timerId = null;
    this.remainingSec = 45;
  }

  render() {
    this.container.innerHTML = `
      <div class="dash-page-container">
        <!-- Section Hero Banner -->
        <div class="dash-section-hero card-dark">
          <div class="section-hero-content">
            <span class="section-tag-pill">CALIBRATION & GRADING</span>
            <h1 class="dash-page-title">PRACTICE & SKILL ASSESSMENT</h1>
            <p class="dash-page-desc">
              Choose your competitive circuit tier manually or complete a 45-second diagnostic telemetry run to calibrate your recommended AI opponent challenge.
            </p>
          </div>
          <div class="section-hero-stats">
            <div class="stat-pill-item">
              <span class="stat-pill-label">BENCHMARK TEST</span>
              <span class="stat-pill-val highlight-cyan font-mono">45 SECONDS</span>
            </div>
            <div class="stat-pill-item">
              <span class="stat-pill-label">SKILL TIERS</span>
              <span class="stat-pill-val text-gold font-mono">4 TIERS</span>
            </div>
          </div>
        </div>

        <!-- TWO PATHWAYS TABS -->
        <div class="diagnostic-tabs">
          <button class="diag-tab-btn active" id="tab-btn-manual">1. Choose Difficulty Manually</button>
          <button class="diag-tab-btn" id="tab-btn-diag">2. Take Diagnostic Assessment (Recommended)</button>
        </div>

        <!-- MANUAL DIFFICULTY SELECTION SECTION -->
        <div class="diag-section" id="section-manual">
          <div class="difficulty-cards-grid">
            <div class="tier-card" data-tier="ROOKIE">
              <div class="tier-header">
                <span class="tier-badge rookie">TIER 1</span>
                <span class="tier-icon">🌱</span>
              </div>
              <h3 class="tier-title">ROOKIE</h3>
              <p class="tier-desc">Home-row keys, high-frequency simple words, minimal punctuation. Perfect for beginners learning touch-typing finger posture.</p>
              <div class="tier-specs">
                <span>Speed Target: 25 - 45 WPM</span>
                <span>Accuracy Focus: 90%+</span>
              </div>
              <button class="btn btn-outline btn-full select-tier-btn" data-tier="ROOKIE">
                Select Rookie →
              </button>
            </div>

            <div class="tier-card active-card" data-tier="AMATEUR">
              <div class="tier-header">
                <span class="tier-badge amateur">TIER 2</span>
                <span class="tier-icon">🏎️</span>
              </div>
              <h3 class="tier-title">AMATEUR</h3>
              <p class="tier-desc">Common English sentences, capitalization, commas, and periods. Great for drivers building rhythm and cadence.</p>
              <div class="tier-specs">
                <span>Speed Target: 45 - 70 WPM</span>
                <span>Accuracy Focus: 94%+</span>
              </div>
              <button class="btn btn-primary btn-full select-tier-btn" data-tier="AMATEUR">
                Select Amateur →
              </button>
            </div>

            <div class="tier-card" data-tier="PRO">
              <div class="tier-header">
                <span class="tier-badge pro">TIER 3</span>
                <span class="tier-icon">🔥</span>
              </div>
              <h3 class="tier-title">PRO</h3>
              <p class="tier-desc">Longer technical passages, mixed punctuation, numbers, and sustained high-cadence endurance.</p>
              <div class="tier-specs">
                <span>Speed Target: 70 - 95 WPM</span>
                <span>Accuracy Focus: 97%+</span>
              </div>
              <button class="btn btn-outline btn-full select-tier-btn" data-tier="PRO">
                Select Pro →
              </button>
            </div>

            <div class="tier-card" data-tier="ELITE">
              <div class="tier-header">
                <span class="tier-badge elite">TIER 4</span>
                <span class="tier-icon">👑</span>
              </div>
              <h3 class="tier-title">ELITE</h3>
              <p class="tier-desc">Complex programming syntax, brackets, symbols, advanced vocabulary, and extreme pressure pacing.</p>
              <div class="tier-specs">
                <span>Speed Target: 95+ WPM</span>
                <span>Accuracy Focus: 98.5%+</span>
              </div>
              <button class="btn btn-outline btn-full select-tier-btn" data-tier="ELITE">
                Select Elite →
              </button>
            </div>
          </div>
        </div>

        <!-- DIAGNOSTIC TEST RUNNER (Initially Hidden) -->
        <div class="diag-section hidden" id="section-diag">
          <div class="diag-runner-card card-dark">
            <div class="runner-top-bar">
              <div class="runner-metric">
                <span class="m-label">TIME REMAINING</span>
                <span class="m-val highlight-cyan font-mono" id="diag-timer">45s</span>
              </div>
              <div class="runner-metric">
                <span class="m-label">CURRENT SPEED</span>
                <span class="m-val font-mono" id="diag-wpm">0 WPM</span>
              </div>
              <div class="runner-metric">
                <span class="m-label">ACCURACY</span>
                <span class="m-val text-positive font-mono" id="diag-acc">100%</span>
              </div>
              <div class="runner-metric">
                <span class="m-label">ERRORS</span>
                <span class="m-val text-negative font-mono" id="diag-errors">0</span>
              </div>
            </div>

            <div class="diag-passage-box" id="diag-passage-box">
              <!-- Rendered diagnostic text stream -->
            </div>

            <div class="diag-controls-footer">
              <button class="btn btn-primary btn-large glow-primary" id="btn-start-diag">
                START 45S DIAGNOSTIC TEST
              </button>
              <span class="diag-helper-hint">Difficulty recommendations can be adjusted at any time in Settings.</span>
            </div>

            <!-- RESULT RECOMMENDATION POPUP -->
            <div class="diag-recommendation-box hidden" id="diag-recommendation-box"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const tabManual = document.getElementById('tab-btn-manual');
    const tabDiag = document.getElementById('tab-btn-diag');
    const secManual = document.getElementById('section-manual');
    const secDiag = document.getElementById('section-diag');

    tabManual?.addEventListener('click', () => {
      tabManual.classList.add('active');
      tabDiag.classList.remove('active');
      secManual.classList.remove('hidden');
      secDiag.classList.add('hidden');
    });

    tabDiag?.addEventListener('click', () => {
      tabDiag.classList.add('active');
      tabManual.classList.remove('active');
      secDiag.classList.remove('hidden');
      secManual.classList.add('hidden');
    });

    // Manual tier selection buttons
    this.container.querySelectorAll('.select-tier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tier = btn.getAttribute('data-tier');
        this.app.showScreen('race', { difficulty: tier });
      });
    });

    // Start diagnostic button
    document.getElementById('btn-start-diag')?.addEventListener('click', () => {
      this.startDiagnosticTest();
    });
  }

  startDiagnosticTest() {
    const text = getDiagnosticPassage();
    this.remainingSec = 45;
    this.isTestRunning = true;

    const startBtn = document.getElementById('btn-start-diag');
    if (startBtn) startBtn.style.display = 'none';

    this.engine = new TypingEngine({
      errorPenaltyMode: 'standard',
      onCharTyped: () => {
        soundEffects.playKeyClick(true);
        this.updateDiagDisplay();
        this.updateDiagStats();
      },
      onMistake: () => {
        soundEffects.playKeyClick(false);
        soundEffects.playErrorMisfire();
        this.updateDiagDisplay();
        this.updateDiagStats();
      },
      onFinish: (stats) => {
        this.finishDiagnostic(stats);
      }
    });

    this.engine.loadText(text);
    this.updateDiagDisplay();

    // 45s Countdown Timer
    this.timerId = setInterval(() => {
      this.remainingSec--;
      const timerEl = document.getElementById('diag-timer');
      if (timerEl) timerEl.textContent = `${this.remainingSec}s`;

      if (this.remainingSec <= 0) {
        clearInterval(this.timerId);
        const stats = this.engine.getStats();
        this.finishDiagnostic(stats);
      }
    }, 1000);

    // Keydown listener
    this.onKeyDown = (e) => {
      if (!this.isTestRunning) return;
      if (e.key === ' ') e.preventDefault();
      this.engine.handleKey(e.key);
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  updateDiagDisplay() {
    const box = document.getElementById('diag-passage-box');
    if (!box || !this.engine) return;

    const text = this.engine.targetText;
    const curIdx = this.engine.currentIndex;

    let html = '';
    for (let i = 0; i < text.length; i++) {
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
    box.innerHTML = html;
  }

  updateDiagStats() {
    if (!this.engine) return;
    const stats = this.engine.getStats();
    const wpmEl = document.getElementById('diag-wpm');
    const accEl = document.getElementById('diag-acc');
    const errEl = document.getElementById('diag-errors');

    if (wpmEl) wpmEl.textContent = `${stats.wpm} WPM`;
    if (accEl) accEl.textContent = `${stats.accuracy}%`;
    if (errEl) errEl.textContent = stats.errorCount;
  }

  finishDiagnostic(stats) {
    this.isTestRunning = false;
    clearInterval(this.timerId);
    window.removeEventListener('keydown', this.onKeyDown);

    soundEffects.playVictoryFanfare();

    // Balanced algorithm: combines WPM, Accuracy, and Consistency
    let recommendedTier = 'AMATEUR';
    let reasoning = '';

    if (stats.wpm < 40 || stats.accuracy < 92) {
      recommendedTier = 'ROOKIE';
      reasoning = 'Focusing on building clean muscle memory and home-row key reaches before pushing maximum top speed.';
    } else if (stats.wpm < 70 && stats.accuracy >= 92) {
      recommendedTier = 'AMATEUR';
      reasoning = 'Solid foundation with consistent rhythm. Ready to build fluid sentence endurance and higher average velocity.';
    } else if (stats.wpm < 95 && stats.accuracy >= 95) {
      recommendedTier = 'PRO';
      reasoning = 'High velocity and strong precision. Ready for championship Grand Prix pacing, numbers, and punctuation.';
    } else {
      recommendedTier = 'ELITE';
      reasoning = 'Elite esports mastery. Ready for complex developer syntax, intense symbol distribution, and triple-digit WPM.';
    }

    const recBox = document.getElementById('diag-recommendation-box');
    if (recBox) {
      recBox.classList.remove('hidden');
      recBox.innerHTML = `
        <div class="recommendation-content">
          <span class="rec-badge">DIAGNOSTIC TELEMETRY COMPLETE</span>
          <h3>RECOMMENDED TIER: <span class="highlight-cyan">${recommendedTier}</span></h3>
          <p class="rec-stats">
            Recorded Pace: <strong>${stats.wpm} WPM</strong> • Accuracy: <strong>${stats.accuracy}%</strong> • Consistency: <strong>${stats.consistency}%</strong>
          </p>
          <p class="rec-reasoning">${reasoning}</p>

          <div class="rec-actions">
            <button class="btn btn-primary btn-large glow-primary" id="btn-accept-rec">
              ACCEPT & ENTER ${recommendedTier} CIRCUIT →
            </button>
            <button class="btn btn-ghost" id="btn-retry-diag">
              Retake Assessment
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-accept-rec')?.addEventListener('click', () => {
        this.app.showScreen('race', { difficulty: recommendedTier });
      });

      document.getElementById('btn-retry-diag')?.addEventListener('click', () => {
        recBox.classList.add('hidden');
        this.startDiagnosticTest();
      });
    }
  }

  dispose() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
