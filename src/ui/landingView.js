/**
 * KEYRUSH — SP40 Concept Hypercar Showcase Landing Page
 * Exactly matches the user's reference design with pixel-perfect fidelity:
 * - 1:1 Aspect ratio responsive frame
 * - Obsidian black atmosphere with glowing neon aerodynamic hypercar
 * - Geometric HUD frame with chamfered 45-degree corner lines
 * - Interactive hotspots with futuristic glowing hover states:
 *   - SP40 Emblem
 *   - Pilot Profile Avatar Circle (links to dashboard/profile)
 *   - Notification Badge "1" Circle (daily directives)
 *   - Hamburger Menu Circle (slides open the cyber navigation drawer)
 *   - "Book A Test Drive" CTA Button (launches live 3D race)
 *   - Diagonal Arrow Circle Button (launches live 3D race)
 *   - 5-Dash Pagination Indicators
 *   - Stacked Up/Down Nav Arrows
 */

import { soundEffects } from '../audio/soundEffects.js';
import { musicManager } from '../audio/musicManager.js';

export class LandingView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.activeCarIndex = 2; // Default: HUAYRAN (3rd dash)
    this.isDrawerOpen = false;
    this.profile = null;
  }

  render(profile) {
    this.profile = profile || {};

    this.container.innerHTML = `
      <div class="sp40-landing-screen" id="sp40-root">
        <!-- IMMERSIVE 16:10 RESPONSIVE SHOWCASE STAGE -->
        <div class="sp40-stage" id="sp40-stage">
          <!-- PIXEL-PERFECT CONCEPT CAR BACKDROP -->
          <img 
            src="/images/sp40_landing.png" 
            alt="KEYRUSH SP40 Concept Hypercar" 
            class="sp40-backdrop-img"
            id="sp40-backdrop-img"
            draggable="false"
          />

          <!-- 1. TOP-LEFT LOGO HOTSPOT -->
          <button 
            class="sp40-hotspot sp40-hs-logo" 
            id="hs-logo" 
            title="KEYRUSH — SP40 Concept Hypercar"
            aria-label="SP40 Brand"
          ></button>

          <!-- 2. TOP-RIGHT CIRCULAR ACTIONS CLUSTER -->
          <!-- Profile Circle -->
          <button 
            class="sp40-hotspot sp40-hs-circle sp40-hs-profile" 
            id="hs-profile" 
            title="Pilot Profile (${this.profile?.username || 'Pilot'})"
            aria-label="Profile"
          ></button>

          <!-- Notification Badge "1" Circle -->
          <button 
            class="sp40-hotspot sp40-hs-circle sp40-hs-badge" 
            id="hs-badge" 
            title="Active Directive (1 Quest Available)"
            aria-label="Notifications"
          ></button>

          <!-- Hamburger Menu Circle -->
          <button 
            class="sp40-hotspot sp40-hs-circle sp40-hs-menu" 
            id="hs-menu" 
            title="Open Mission Terminal"
            aria-label="Menu"
          ></button>

          <!-- 3. BOTTOM-RIGHT 'BOOK A TEST DRIVE' PILL BUTTON -->
          <button 
            class="sp40-hotspot sp40-hs-testdrive" 
            id="hs-testdrive" 
            title="Book A Test Drive (Launch 3D Race)"
            aria-label="Book A Test Drive"
          ></button>

          <!-- 4. BOTTOM-RIGHT DIAGONAL ARROW CIRCLE -->
          <button 
            class="sp40-hotspot sp40-hs-circle sp40-hs-arrow" 
            id="hs-arrow" 
            title="Enter Cockpit & Race"
            aria-label="Launch Race"
          ></button>

          <!-- 5. BOTTOM-CENTER PAGINATION DASHES -->
          <div class="sp40-hs-dashes" id="hs-dashes-bar" title="Supercar Showcase Carousel">
            <button class="sp40-dash-btn" data-index="0" title="Model 1 — APEX GT" aria-label="Car 1"></button>
            <button class="sp40-dash-btn" data-index="1" title="Model 2 — PHANTOM EV" aria-label="Car 2"></button>
            <button class="sp40-dash-btn active" data-index="2" title="Model 3 — HUAYRAN SP40" aria-label="Car 3"></button>
            <button class="sp40-dash-btn" data-index="3" title="Model 4 — VIPER GTS" aria-label="Car 4"></button>
            <button class="sp40-dash-btn" data-index="4" title="Model 5 — TALON FX" aria-label="Car 5"></button>
          </div>

          <!-- 6. FAR-RIGHT STACKED NAV ARROWS -->
          <button class="sp40-hs-arrow-nav sp40-hs-arrow-up" id="hs-arrow-up" title="Previous Supercar" aria-label="Previous"></button>
          <button class="sp40-hs-arrow-nav sp40-hs-arrow-down" id="hs-arrow-down" title="Next Supercar" aria-label="Next"></button>
        </div>

        <!-- SLIDE-OVER NAVIGATION DRAWER -->
        <div class="sp40-drawer-overlay" id="sp40-drawer-overlay">
          <aside class="sp40-nav-drawer" id="sp40-nav-drawer">
            <div class="sp40-drawer-header">
              <div class="drawer-title-group">
                <span class="drawer-badge">KEYRUSH OS // 2026</span>
                <h3 class="drawer-title">MISSION ACCESS</h3>
              </div>
              <button class="sp40-drawer-close-btn" id="sp40-drawer-close" aria-label="Close Menu">✕</button>
            </div>

            <nav class="sp40-drawer-menu">
              <button class="sp40-drawer-item" data-nav="race">
                <span class="drawer-item-icon">🏎️</span>
                <div class="drawer-item-text">
                  <strong>TEST DRIVE & RACE</strong>
                  <small>Live 3D track, head-to-head AI, telemetry HUD</small>
                </div>
                <span class="drawer-item-arrow">→</span>
              </button>

              <button class="sp40-drawer-item" data-nav="dashboard">
                <span class="drawer-item-icon">📊</span>
                <div class="drawer-item-text">
                  <strong>PILOT DASHBOARD</strong>
                  <small>WPM benchmark, accuracy curve, daily practice</small>
                </div>
                <span class="drawer-item-arrow">→</span>
              </button>

              <button class="sp40-drawer-item" data-nav="garage">
                <span class="drawer-item-icon">🛠️</span>
                <div class="drawer-item-text">
                  <strong>3D SUPERCAR GARAGE</strong>
                  <small>Custom paint, neon underglow, unlocked hypercars</small>
                </div>
                <span class="drawer-item-arrow">→</span>
              </button>

              <button class="sp40-drawer-item" data-nav="ai-select">
                <span class="drawer-item-icon">🤖</span>
                <div class="drawer-item-text">
                  <strong>AI RACING SIMULATOR</strong>
                  <small>Face 5 difficulty tiers from Amateur to Apex Legend</small>
                </div>
                <span class="drawer-item-arrow">→</span>
              </button>

              <button class="sp40-drawer-item" data-nav="academy">
                <span class="drawer-item-icon">🎯</span>
                <div class="drawer-item-text">
                  <strong>TOUCH-TYPING ACADEMY</strong>
                  <small>Home-row discipline, finger agility, rhythm courses</small>
                </div>
                <span class="drawer-item-arrow">→</span>
              </button>

              <button class="sp40-drawer-item" data-nav="leaderboard">
                <span class="drawer-item-icon">🏆</span>
                <div class="drawer-item-text">
                  <strong>GLOBAL RANKED LEAGUE</strong>
                  <small>Competitive tiers from Bronze to Grandmaster</small>
                </div>
                <span class="drawer-item-arrow">→</span>
              </button>

              <button class="sp40-drawer-item" data-nav="analytics">
                <span class="drawer-item-icon">📈</span>
                <div class="drawer-item-text">
                  <strong>TELEMETRY ANALYTICS</strong>
                  <small>Weak key heatmaps, consistency, acceleration graphs</small>
                </div>
                <span class="drawer-item-arrow">→</span>
              </button>

              <button class="sp40-drawer-item" data-nav="settings">
                <span class="drawer-item-icon">⚙️</span>
                <div class="drawer-item-text">
                  <strong>AUDIO & SYSTEM SETTINGS</strong>
                  <small>Volume sliders, recommended mix reset, themes</small>
                </div>
                <span class="drawer-item-arrow">→</span>
              </button>
            </nav>

            <div class="sp40-drawer-footer">
              <div class="sp40-pilot-pill">
                <span class="pilot-avatar-icon">${this.profile?.avatar || '🏎️'}</span>
                <div class="pilot-details">
                  <span class="pilot-callsign">${this.profile?.username || 'Pilot'}</span>
                  <span class="pilot-tier">LVL ${this.profile?.level || 1} • ${this.profile?.league || 'Silver II'}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <!-- PROFILE POPUP MODAL -->
        <div class="sp40-modal-overlay hidden" id="sp40-profile-modal">
          <div class="sp40-modal-card card-dark">
            <div class="sp40-modal-header">
              <span class="modal-chip">DRIVER IDENTIFICATION</span>
              <button class="sp40-modal-close" id="profile-modal-close">✕</button>
            </div>
            <div class="profile-hero-row">
              <span class="profile-large-avatar">${this.profile?.avatar || '🏎️'}</span>
              <div class="profile-header-info">
                <h3 class="profile-username">${this.profile?.username || 'CyberRacer'}</h3>
                <span class="profile-league-tag">${this.profile?.league || 'Silver Division II'}</span>
              </div>
            </div>
            <div class="profile-stats-grid">
              <div class="p-stat">
                <span class="p-label">BEST SPEED</span>
                <strong class="p-val font-mono">${this.profile?.bestWpm || 0} <small>WPM</small></strong>
              </div>
              <div class="p-stat">
                <span class="p-label">AVG ACCURACY</span>
                <strong class="p-val font-mono">${this.profile?.averageAccuracy || 98}%</strong>
              </div>
              <div class="p-stat">
                <span class="p-label">RACES COMPLETED</span>
                <strong class="p-val font-mono">${this.profile?.racesPlayed || 0}</strong>
              </div>
              <div class="p-stat">
                <span class="p-label">PRACTICE STREAK</span>
                <strong class="p-val font-mono">${this.profile?.currentStreak || 1} Days</strong>
              </div>
            </div>
            <div class="profile-modal-actions">
              <button class="btn btn-primary btn-full glow-primary" data-nav="dashboard">
                OPEN FULL PILOT DASHBOARD
              </button>
            </div>
          </div>
        </div>

        <!-- MISSIONS / NOTIFICATION MODAL -->
        <div class="sp40-modal-overlay hidden" id="sp40-mission-modal">
          <div class="sp40-modal-card card-dark">
            <div class="sp40-modal-header">
              <span class="modal-chip">DAILY DIRECTIVE</span>
              <button class="sp40-modal-close" id="mission-modal-close">✕</button>
            </div>
            <div class="mission-briefing">
              <div class="mission-icon-box">⚡</div>
              <div>
                <h4>CIRCUIT QUALIFYING LAP</h4>
                <p>Complete 1 race above 65 WPM with 96%+ accuracy to claim daily telemetry bonus.</p>
              </div>
            </div>
            <div class="mission-progress-bar">
              <div class="progress-fill" style="width: 50%"></div>
            </div>
            <div class="mission-reward-row">
              <span>REWARD: +150 XP • TACHOMETER BADGE</span>
              <button class="btn btn-primary" data-nav="race">RACE NOW</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  toggleDrawer(open) {
    this.isDrawerOpen = typeof open === 'boolean' ? open : !this.isDrawerOpen;
    const overlay = document.getElementById('sp40-drawer-overlay');
    if (overlay) {
      overlay.classList.toggle('active', this.isDrawerOpen);
    }
    if (this.isDrawerOpen) {
      soundEffects.playKeyClick(true);
    }
  }

  bindEvents() {
    // 1. Launch Race via 'Book A Test Drive' or diagonal arrow
    const launchRace = () => {
      soundEffects.playNitroBoost();
      this.app.showScreen('race', { mode: 'Solo Practice' });
    };

    document.getElementById('hs-testdrive')?.addEventListener('click', launchRace);
    document.getElementById('hs-arrow')?.addEventListener('click', launchRace);

    // 2. Profile Circle
    document.getElementById('hs-profile')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
      document.getElementById('sp40-profile-modal')?.classList.remove('hidden');
    });

    document.getElementById('profile-modal-close')?.addEventListener('click', () => {
      document.getElementById('sp40-profile-modal')?.classList.add('hidden');
    });

    // 3. Notification Badge "1"
    document.getElementById('hs-badge')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
      document.getElementById('sp40-mission-modal')?.classList.remove('hidden');
    });

    document.getElementById('mission-modal-close')?.addEventListener('click', () => {
      document.getElementById('sp40-mission-modal')?.classList.add('hidden');
    });

    // 4. Hamburger Menu Drawer
    document.getElementById('hs-menu')?.addEventListener('click', () => {
      this.toggleDrawer(true);
    });

    document.getElementById('sp40-drawer-close')?.addEventListener('click', () => {
      this.toggleDrawer(false);
    });

    document.getElementById('sp40-drawer-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'sp40-drawer-overlay') {
        this.toggleDrawer(false);
      }
    });

    // 5. Logo Click Feedback
    document.getElementById('hs-logo')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
    });

    // 6. Navigation items
    this.container.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetScreen = btn.getAttribute('data-nav');
        soundEffects.playKeyClick(true);
        this.toggleDrawer(false);
        document.getElementById('sp40-profile-modal')?.classList.add('hidden');
        document.getElementById('sp40-mission-modal')?.classList.add('hidden');
        this.app.showScreen(targetScreen);
      });
    });

    // 7. Dashes and Arrows
    const dashBtns = this.container.querySelectorAll('.sp40-dash-btn');
    const updateActiveDash = (idx) => {
      this.activeCarIndex = idx;
      dashBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
      soundEffects.playKeyClick(true);
    };

    dashBtns.forEach((dash) => {
      dash.addEventListener('click', () => {
        const idx = Number(dash.getAttribute('data-index'));
        updateActiveDash(idx);
      });
    });

    document.getElementById('hs-arrow-up')?.addEventListener('click', () => {
      const prev = (this.activeCarIndex - 1 + 5) % 5;
      updateActiveDash(prev);
    });

    document.getElementById('hs-arrow-down')?.addEventListener('click', () => {
      const next = (this.activeCarIndex + 1) % 5;
      updateActiveDash(next);
    });

    // 8. Keyboard listener (ESC closes modals/drawer)
    this.onKeyDown = (e) => {
      if (this.app.currentScreen !== 'landing') return;
      if (e.key === 'Escape') {
        this.toggleDrawer(false);
        document.getElementById('sp40-profile-modal')?.classList.add('hidden');
        document.getElementById('sp40-mission-modal')?.classList.add('hidden');
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  dispose() {
    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
      this.onKeyDown = null;
    }
  }
}
