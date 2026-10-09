/**
 * KeyRush Landing Page (Screen 01)
 * Cinematic esports hero section with 3D canvas preview, live statistics strip,
 * game modes showcase, vehicle unlocks preview, and high-impact CTAs.
 */

import { Track3D } from '../graphics/track3D.js';

export class LandingView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.trackPreview = null;
  }

  render(profile) {
    this.container.innerHTML = `
      <div class="landing-page-wrapper">
        <!-- HERO SECTION -->
        <section class="landing-hero">
          <!-- 3D Background Canvas -->
          <div id="landing-3d-canvas" class="hero-3d-container"></div>
          <div class="hero-overlay-gradient"></div>

          <div class="hero-content">
            <div class="hero-badge">
              <span class="pulse-dot"></span> NEXT-GEN MOTORSPORT TYPING SIMULATOR
            </div>
            <h1 class="hero-title">
              YOUR KEYBOARD.<br>
              <span class="gradient-text">YOUR ENGINE.</span><br>
              YOUR VICTORY.
            </h1>
            <p class="hero-subtitle">
              Master your typing speed. Sharpen your accuracy. Leave everyone behind.
              Real-time physics where every keystroke drives vehicle acceleration.
            </p>

            <div class="hero-actions">
              <button class="btn btn-primary btn-large glow-primary" data-nav="race">
                <span class="btn-icon">⚡</span> START RACING
              </button>
              <button class="btn btn-secondary btn-large" data-nav="diagnostic">
                <span class="btn-icon">⏱️</span> SKILL DIAGNOSTIC
              </button>
              <button class="btn btn-ghost btn-large" data-nav="academy">
                <span class="btn-icon">🎯</span> EXPLORE TRAINING
              </button>
            </div>

            <!-- COMPACT LIVE TELEMETRY STRIP -->
            <div class="telemetry-strip">
              <div class="telem-item">
                <span class="telem-label">GLOBAL PEAK SPEED</span>
                <span class="telem-val">168 <small>WPM</small></span>
              </div>
              <div class="telem-divider"></div>
              <div class="telem-item">
                <span class="telem-label">AVERAGE ACCURACY</span>
                <span class="telem-val">97.4<small>%</small></span>
              </div>
              <div class="telem-divider"></div>
              <div class="telem-item">
                <span class="telem-label">ACTIVE RACERS TODAY</span>
                <span class="telem-val">14,820 <small>ONLINE</small></span>
              </div>
              <div class="telem-divider"></div>
              <div class="telem-item">
                <span class="telem-label">OFFLINE CAPABILITY</span>
                <span class="telem-val"><span class="status-dot online"></span> 100% READY</span>
              </div>
            </div>
          </div>
        </section>

        <!-- GAME MODES SECTION -->
        <section class="modes-section section-padding">
          <div class="section-header">
            <span class="section-tag">COMPETITIVE CIRCUIT</span>
            <h2 class="section-title">CHOOSE YOUR RACING DISCIPLINE</h2>
            <p class="section-desc">From solo finger-agility drills to cutthroat online head-to-head Grand Prix.</p>
          </div>

          <div class="modes-grid">
            <div class="mode-card" data-nav="race" data-nav-param="practice">
              <div class="mode-card-badge">OFFLINE READY</div>
              <div class="mode-icon">🎯</div>
              <h3 class="mode-title">Solo Practice</h3>
              <p class="mode-desc">Refine muscle memory, eliminate weak-finger hitches, and warm up without pressure.</p>
              <div class="mode-footer">
                <span class="mode-stat">Custom Passages & Drills</span>
                <span class="mode-arrow">→</span>
              </div>
            </div>

            <div class="mode-card highlighted" data-nav="ai-select">
              <div class="mode-card-badge glow-badge">POPULAR</div>
              <div class="mode-icon">🤖</div>
              <h3 class="mode-title">Race Against AI</h3>
              <p class="mode-desc">Face 5 tiers of simulated human drivers or adaptive neural AI that calibrates to your pace.</p>
              <div class="mode-footer">
                <span class="mode-stat">35 - 120 WPM Tiers</span>
                <span class="mode-arrow">→</span>
              </div>
            </div>

            <div class="mode-card" data-nav="multiplayer">
              <div class="mode-card-badge">P2P & LOBBY</div>
              <div class="mode-icon">⚔️</div>
              <h3 class="mode-title">Multiplayer & Friends</h3>
              <p class="mode-desc">Challenge friends with private codes, local 2-player split screen, or ranked matchmaking.</p>
              <div class="mode-footer">
                <span class="mode-stat">Real-time Latency HUD</span>
                <span class="mode-arrow">→</span>
              </div>
            </div>

            <div class="mode-card" data-nav="academy">
              <div class="mode-card-badge">ESPORTS ACADEMY</div>
              <div class="mode-icon">⌨️</div>
              <h3 class="mode-title">Touch-Typing Academy</h3>
              <p class="mode-desc">Home-row discipline, visual finger assignment maps, and elite finger agility exercises.</p>
              <div class="mode-footer">
                <span class="mode-stat">6 Specialized Courses</span>
                <span class="mode-arrow">→</span>
              </div>
            </div>
          </div>
        </section>

        <!-- VEHICLE SHOWCASE PREVIEW -->
        <section class="garage-preview-section section-padding">
          <div class="preview-layout">
            <div class="preview-info">
              <span class="section-tag">COSMETIC REWARDS</span>
              <h2 class="section-title">EARN SUPERCARS THROUGH KEYBOARD SPEED</h2>
              <p class="preview-body">
                Skill is your currency. Win races, maintain daily streaks, and break personal records to unlock
                aerodynamic hypercars, custom neon underglow, paint schemes, and particle exhaust trails.
                Zero pay-to-win mechanics — pure touch-typing mastery.
              </p>
              <div class="preview-highlights">
                <div class="highlight-item">
                  <span class="check-icon">✓</span> 5 Tiered Vehicles (Starter to Mythic Chronos V12)
                </div>
                <div class="highlight-item">
                  <span class="check-icon">✓</span> Dynamic WebGL 3D Showroom with Turntable Studio
                </div>
                <div class="highlight-item">
                  <span class="check-icon">✓</span> Custom Underglow, Neon Rim Accents, and Exhaust Trails
                </div>
              </div>
              <button class="btn btn-primary" data-nav="garage">
                ENTER VEHICLE GARAGE →
              </button>
            </div>

            <div class="preview-cards-rack">
              <div class="mini-car-card">
                <span class="car-badge">COMMON</span>
                <h4>Apex Talon</h4>
                <p>Starter Cyber-Coupe</p>
              </div>
              <div class="mini-car-card">
                <span class="car-badge rare">RARE</span>
                <h4>Vortex R34</h4>
                <p>Widebody Tuner</p>
              </div>
              <div class="mini-car-card">
                <span class="car-badge epic">EPIC</span>
                <h4>Phantom GT</h4>
                <p>Mid-Engine Supercar</p>
              </div>
              <div class="mini-car-card">
                <span class="car-badge legendary">LEGENDARY</span>
                <h4>Chronos V12</h4>
                <p>Experimental Plasma Hypercar</p>
              </div>
            </div>
          </div>
        </section>

        <!-- FOOTER -->
        <footer class="app-footer">
          <div class="footer-inner">
            <div class="footer-left">
              <span class="logo-icon">⚡</span>
              <span class="brand-title">KEYRUSH</span>
              <span class="footer-copyright">© 2026 KEYRUSH. All rights reserved. Offline-first PWA enabled.</span>
            </div>
            <div class="footer-links">
              <button class="footer-btn" data-nav="settings">Offline & Privacy</button>
              <button class="footer-btn" data-nav="diagnostic">Diagnostic Assessment</button>
              <button class="footer-btn" data-nav="analytics">Export Telemetry</button>
            </div>
          </div>
        </footer>
      </div>
    `;

    // Initialize 3D preview track in the background hero
    setTimeout(() => {
      const container = document.getElementById('landing-3d-canvas');
      if (container) {
        this.trackPreview = new Track3D(container);
        this.trackPreview.setPlayerCar('phantom', '#00e5ff', '#a855f7');
        this.trackPreview.setOpponents([
          { id: 'op1', carModel: 'vortex', color: '#ff3366' },
          { id: 'op2', carModel: 'talon', color: '#ffb800' }
        ]);

        // Gentle auto demo drive
        let demoProgress = 0.2;
        let demoOpProgress = 0.22;
        this.demoTimer = setInterval(() => {
          if (!this.trackPreview) return;
          demoProgress = (demoProgress + 0.0006) % 0.85;
          demoOpProgress = (demoOpProgress + 0.0005) % 0.85;
          this.trackPreview.updatePlayerProgress(demoProgress, 75, true);
          this.trackPreview.updateOpponentProgress('op1', demoOpProgress, 72);
        }, 16);
      }
    }, 50);
  }

  dispose() {
    if (this.demoTimer) {
      clearInterval(this.demoTimer);
      this.demoTimer = null;
    }
    if (this.trackPreview) {
      this.trackPreview.dispose();
      this.trackPreview = null;
    }
  }
}
