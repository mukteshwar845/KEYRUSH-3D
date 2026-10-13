/**
 * KeyRush AI Opponent Racing Selection (Screen 06)
 * Selection interface for 5 offline AI opponents ranging from Beginner to Adaptive AI.
 */

import { AI_PRESETS } from '../engine/aiOpponent.js';
import { storage } from '../db/storage.js';

export class AiSelectView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.selectedTier = 'intermediate';
  }

  async render() {
    const profile = await storage.getProfile();
    const playerAvg = profile?.averageWpm || 65;

    this.container.innerHTML = `
      <div class="ai-select-screen-wrapper">
        <div class="screen-header text-center">
          <span class="section-tag">OFFLINE AI SIMULATOR</span>
          <h1 class="screen-title">CHOOSE YOUR AI OPPONENT</h1>
          <p class="screen-subtitle">
            Compete against advanced simulated human drivers operating 100% locally.
            No network or cloud API required. Select a fixed WPM skill tier or challenge the Adaptive AI.
          </p>
        </div>

        <div class="ai-roster-grid">
          <!-- 1. BEGINNER -->
          <div class="ai-card ${this.selectedTier === 'beginner' ? 'active' : ''}" data-ai-tier="beginner">
            <div class="ai-card-header">
              <span class="ai-avatar">🤖</span>
              <div class="ai-headline">
                <h3>Rookie Bolt</h3>
                <span class="ai-tier-tag">BEGINNER TIER</span>
              </div>
            </div>
            <div class="ai-specs-grid">
              <div class="ai-spec">
                <span class="spec-label">TARGET SPEED</span>
                <span class="spec-val">35 - 45 WPM</span>
              </div>
              <div class="ai-spec">
                <span class="spec-label">ACCURACY</span>
                <span class="spec-val">92%</span>
              </div>
            </div>
            <p class="ai-desc">Cautious home-row driver. Occasionally pauses to correct peripheral key mistakes.</p>
            <button class="btn btn-outline btn-full btn-select-ai" data-ai-tier="beginner">Select Opponent</button>
          </div>

          <!-- 2. INTERMEDIATE -->
          <div class="ai-card ${this.selectedTier === 'intermediate' ? 'active' : ''}" data-ai-tier="intermediate">
            <div class="ai-card-header">
              <span class="ai-avatar">⚡</span>
              <div class="ai-headline">
                <h3>Street Cruiser</h3>
                <span class="ai-tier-tag text-warning">INTERMEDIATE</span>
              </div>
            </div>
            <div class="ai-specs-grid">
              <div class="ai-spec">
                <span class="spec-label">TARGET SPEED</span>
                <span class="spec-val">55 - 65 WPM</span>
              </div>
              <div class="ai-spec">
                <span class="spec-label">ACCURACY</span>
                <span class="spec-val">95%</span>
              </div>
            </div>
            <p class="ai-desc">Steady and dependable rhythm. Maintains smooth acceleration across common sentences.</p>
            <button class="btn btn-primary btn-full btn-select-ai" data-ai-tier="intermediate">Select Opponent</button>
          </div>

          <!-- 3. ADVANCED -->
          <div class="ai-card ${this.selectedTier === 'advanced' ? 'active' : ''}" data-ai-tier="advanced">
            <div class="ai-card-header">
              <span class="ai-avatar">🔥</span>
              <div class="ai-headline">
                <h3>Nitro Phantom</h3>
                <span class="ai-tier-tag text-purple">ADVANCED</span>
              </div>
            </div>
            <div class="ai-specs-grid">
              <div class="ai-spec">
                <span class="spec-label">TARGET SPEED</span>
                <span class="spec-val">75 - 85 WPM</span>
              </div>
              <div class="ai-spec">
                <span class="spec-label">ACCURACY</span>
                <span class="spec-val">97%</span>
              </div>
            </div>
            <p class="ai-desc">Aggressive tournament contender with rapid burst speed and minimal error pauses.</p>
            <button class="btn btn-outline btn-full btn-select-ai" data-ai-tier="advanced">Select Opponent</button>
          </div>

          <!-- 4. EXPERT -->
          <div class="ai-card ${this.selectedTier === 'expert' ? 'active' : ''}" data-ai-tier="expert">
            <div class="ai-card-header">
              <span class="ai-avatar">👑</span>
              <div class="ai-headline">
                <h3>Cyber Apex</h3>
                <span class="ai-tier-tag text-danger">EXPERT</span>
              </div>
            </div>
            <div class="ai-specs-grid">
              <div class="ai-spec">
                <span class="spec-label">TARGET SPEED</span>
                <span class="spec-val">100 - 120 WPM</span>
              </div>
              <div class="ai-spec">
                <span class="spec-label">ACCURACY</span>
                <span class="spec-val">99%</span>
              </div>
            </div>
            <p class="ai-desc">Grand Prix esports champion. Near-zero recovery latency and surgical precision.</p>
            <button class="btn btn-outline btn-full btn-select-ai" data-ai-tier="expert">Select Opponent</button>
          </div>

          <!-- 5. ADAPTIVE (FEATURED) -->
          <div class="ai-card adaptive-card ${this.selectedTier === 'adaptive' ? 'active' : ''}" data-ai-tier="adaptive">
            <div class="ai-card-header">
              <span class="ai-avatar">🧠</span>
              <div class="ai-headline">
                <h3>Neural Adaptive AI</h3>
                <span class="ai-tier-tag glow-badge">SELF-TUNING</span>
              </div>
            </div>
            <div class="ai-specs-grid">
              <div class="ai-spec">
                <span class="spec-label">TARGET SPEED</span>
                <span class="spec-val highlight-cyan">~${playerAvg + 3} WPM</span>
              </div>
              <div class="ai-spec">
                <span class="spec-label">ACCURACY</span>
                <span class="spec-val">96%</span>
              </div>
            </div>
            <p class="ai-desc">Calibrates in real-time to your recent 5-race moving average. Designed to keep you in the optimal flow state without unfair rubber-banding.</p>
            <button class="btn btn-secondary btn-full btn-select-ai" data-ai-tier="adaptive">Select Adaptive AI</button>
          </div>
        </div>

        <!-- QUICK LAUNCH ACTIONS -->
        <div class="ai-launch-footer text-center">
          <button class="btn btn-primary btn-large glow-primary" id="btn-launch-ai-race">
            START AI RACE NOW →
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('.btn-select-ai').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tier = btn.getAttribute('data-ai-tier');
        this.selectedTier = tier;

        this.container.querySelectorAll('.ai-card').forEach((c) => {
          c.classList.toggle('active', c.getAttribute('data-ai-tier') === tier);
        });

        // Launch immediately on double click / click
        this.launchRace(tier);
      });
    });

    document.getElementById('btn-launch-ai-race')?.addEventListener('click', () => {
      this.launchRace(this.selectedTier);
    });
  }

  launchRace(tier) {
    let diff = 'AMATEUR';
    if (tier === 'beginner') diff = 'ROOKIE';
    if (tier === 'advanced') diff = 'PRO';
    if (tier === 'expert') diff = 'ELITE';

    this.app.showScreen('race', {
      mode: 'Race Against AI',
      difficulty: diff,
      aiTier: tier
    });
  }

  dispose() {}
}
