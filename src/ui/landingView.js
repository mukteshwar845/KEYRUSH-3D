/**
 * KEYRUSH — SP40 Concept Hypercar Showcase Landing Page
 * Uses the user's high-resolution clean hypercar render: /images/sp40_car_clean.png
 * Renders complete precision UI matching the reference design:
 * - Geometric HUD frame with chamfered 45-degree corner lines
 * - Top-left SP40 emblem
 * - Top telemetry specs bar (Top Speed, 0-60 Mph, Power, Engine)
 * - Top-right action buttons (Profile circle, Notification badge '1', Hamburger menu)
 * - Left flank giant vertical outline typography: HUAYRAN
 * - Bottom-right title, luxury description, 'Book A Test Drive' pill & '↗' circle button
 * - Bottom-center 5 pagination dashes
 * - Far-right vertical slider rail & stacked ↑ / ↓ arrows
 * - Cyber navigation drawer with access to all game screens
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
    this.onKeyDown = null;
  }

  render(profile) {
    this.profile = profile || {};

    this.container.innerHTML = `
      <div class="sp40-landing-screen" id="sp40-root">
        <!-- IMMERSIVE 1024:643 RESPONSIVE SHOWCASE STAGE -->
        <div class="sp40-stage" id="sp40-stage">
          <!-- 1. HIGH-RESOLUTION CLEAN CAR CENTERPIECE -->
          <img 
            src="/images/sp40_car_clean.png" 
            alt="KEYRUSH SP40 Concept Hypercar" 
            class="sp40-car-render"
            id="sp40-car-render"
            draggable="false"
          />

          <!-- 2. VECTOR HUD CHAMFER FRAME -->
          <svg class="sp40-hud-svg" viewBox="0 0 1024 643" preserveAspectRatio="none" aria-hidden="true">
            <polyline 
              points="20,620 20,129 121,28 813,28 854,69 1005,69 1005,620 20,620" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.24)" 
              stroke-width="1.2"
              vector-effect="non-scaling-stroke"
            />
          </svg>

          <!-- 3. TOP-LEFT SP40 EMBLEM -->
          <div class="sp40-brand-group" id="hs-logo" title="KEYRUSH — SP40 Concept Hypercar">
            <span class="sp40-brand-text">SP40</span>
          </div>

          <!-- 4. TOP-RIGHT CIRCULAR ACTIONS CLUSTER -->
          <div class="sp40-top-actions">
            <!-- Profile Circle -->
            <button 
              class="sp40-top-btn sp40-profile-btn" 
              id="hs-profile" 
              title="Pilot Profile (${this.profile?.username || 'Pilot'})"
              aria-label="Pilot Profile"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            <!-- Notification Badge "1" Circle -->
            <button 
              class="sp40-top-btn sp40-badge-btn" 
              id="hs-badge" 
              title="Active Directive (1 Quest Available)"
              aria-label="Directives"
            >
              <span>1</span>
            </button>

            <!-- Hamburger Menu Circle -->
            <button 
              class="sp40-top-btn sp40-menu-btn" 
              id="hs-menu" 
              title="Open Navigation Terminal"
              aria-label="Open Menu"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- 5. TOP TELEMETRY SPECS ROW -->
          <div class="sp40-specs-bar" id="sp40-specs-bar">
            <div class="sp40-spec-col">
              <span class="sp40-spec-label">Top Speed:</span>
              <span class="sp40-spec-value">250 Mph (402 Km/H)</span>
            </div>
            <div class="sp40-spec-col">
              <span class="sp40-spec-label">0-60 Mph:</span>
              <span class="sp40-spec-value">2.5 Seconds</span>
            </div>
            <div class="sp40-spec-col">
              <span class="sp40-spec-label">Power:</span>
              <span class="sp40-spec-value">887 Hp (661 Kw)</span>
            </div>
            <div class="sp40-spec-col">
              <span class="sp40-spec-label">Engine:</span>
              <span class="sp40-spec-value">4.6-Liter V8 Hybrid</span>
            </div>
          </div>

          <!-- 6. LEFT FLANK VERTICAL OUTLINE TYPOGRAPHY: HUAYRAN -->
          <div class="sp40-flank-brand" aria-hidden="true">
            <span class="sp40-vertical-outline">HUAYRAN</span>
          </div>

          <!-- 7. BOTTOM-RIGHT HERO TITLE, COPY & CTA BUTTONS -->
          <div class="sp40-hero-content">
            <h2 class="sp40-hero-title">The Pinnacle Of Automotive Excellence</h2>
            <p class="sp40-hero-desc">
              Every Vehicle That Bears The Apex Badge Is A Testament<br>
              To Our Commitment To Pushing The Boundaries Of<br>
              Performance, Design, And Technology.
            </p>
            <div class="sp40-cta-row">
              <button 
                class="sp40-cta-testdrive" 
                id="hs-testdrive" 
                title="Book A Test Drive (Launch 3D Race)"
              >
                Book A Test Drive
              </button>
              <button 
                class="sp40-cta-arrow" 
                id="hs-arrow" 
                title="Enter Cockpit & Race"
                aria-label="Launch 3D Race"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- 8. BOTTOM-CENTER PAGINATION DASHES -->
          <div class="sp40-dashes-row" id="hs-dashes-bar" title="Supercar Showcase Carousel">
            <button class="sp40-dash-pill" data-index="0" title="Model 1 — APEX GT" aria-label="Car 1"></button>
            <button class="sp40-dash-pill" data-index="1" title="Model 2 — PHANTOM EV" aria-label="Car 2"></button>
            <button class="sp40-dash-pill active" data-index="2" title="Model 3 — HUAYRAN SP40" aria-label="Car 3"></button>
            <button class="sp40-dash-pill" data-index="3" title="Model 4 — VIPER GTS" aria-label="Car 4"></button>
            <button class="sp40-dash-pill" data-index="4" title="Model 5 — TALON FX" aria-label="Car 5"></button>
          </div>

          <!-- 9. FAR-RIGHT SLIDER RAIL -->
          <div class="sp40-right-rail" aria-hidden="true">
            <div class="sp40-rail-track">
              <div class="sp40-rail-thumb"></div>
            </div>
          </div>

          <!-- 10. FAR-RIGHT STACKED NAV ARROWS -->
          <div class="sp40-nav-arrows">
            <button class="sp40-arrow-btn sp40-arrow-up" id="hs-arrow-up" title="Previous Supercar" aria-label="Previous">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button class="sp40-arrow-btn sp40-arrow-down" id="hs-arrow-down" title="Next Supercar" aria-label="Next">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
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
            <div class="mission-item">
              <div class="mission-badge">⚡ ACTIVE QUEST</div>
              <h4 class="mission-title">Hit 60 WPM with Zero Errors</h4>
              <p class="mission-desc">Achieve 100% accuracy on the Cyber Highway sprint to earn +250 XP and unlock Neon Magenta chassis underglow.</p>
              <div class="mission-reward">
                <span>REWARD: <strong>250 CREDITS</strong> + <strong>TIER BADGE</strong></span>
              </div>
            </div>
            <div class="profile-modal-actions">
              <button class="btn btn-primary btn-full glow-primary" data-nav="race">
                ENGAGE MISSION RACE
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  toggleDrawer(show) {
    this.isDrawerOpen = typeof show === 'boolean' ? show : !this.isDrawerOpen;
    const overlay = document.getElementById('sp40-drawer-overlay');
    const drawer = document.getElementById('sp40-nav-drawer');
    if (overlay && drawer) {
      if (this.isDrawerOpen) {
        overlay.classList.add('open');
        drawer.classList.add('open');
      } else {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
      }
    }
  }

  bindEvents() {
    // 1. Launch 3D Race ("Book A Test Drive" and Arrow circle)
    const launchRace = () => {
      soundEffects.playCarEngine();
      this.app.showScreen('race');
    };

    document.getElementById('hs-testdrive')?.addEventListener('click', () => {
      soundEffects.playNitro();
      launchRace();
    });

    document.getElementById('hs-arrow')?.addEventListener('click', () => {
      soundEffects.playNitro();
      launchRace();
    });

    // 2. Open / Close Navigation Drawer
    document.getElementById('hs-menu')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
      this.toggleDrawer(true);
    });

    // 3. Profile Circle Modal
    document.getElementById('hs-profile')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
      document.getElementById('sp40-profile-modal')?.classList.remove('hidden');
    });

    document.getElementById('profile-modal-close')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
      document.getElementById('sp40-profile-modal')?.classList.add('hidden');
    });

    // 4. Notification Circle Modal
    document.getElementById('hs-badge')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
      document.getElementById('sp40-mission-modal')?.classList.remove('hidden');
    });

    document.getElementById('mission-modal-close')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
      document.getElementById('sp40-mission-modal')?.classList.add('hidden');
    });

    // Drawer close buttons
    document.getElementById('sp40-drawer-close')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
      this.toggleDrawer(false);
    });

    document.getElementById('sp40-drawer-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'sp40-drawer-overlay') {
        soundEffects.playKeyClick(true);
        this.toggleDrawer(false);
      }
    });

    // Modal background close
    document.querySelectorAll('.sp40-modal-overlay').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          soundEffects.playKeyClick(true);
          modal.classList.add('hidden');
        }
      });
    });

    // 5. Logo Click Feedback
    document.getElementById('hs-logo')?.addEventListener('click', () => {
      soundEffects.playKeyClick(true);
    });

    // 6. Navigation items
    this.container.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetScreen = btn.getAttribute('data-nav');
        soundEffects.playKeyClick(true);
        this.toggleDrawer(false);
        document.getElementById('sp40-profile-modal')?.classList.add('hidden');
        document.getElementById('sp40-mission-modal')?.classList.add('hidden');
        this.app.showScreen(targetScreen);
      });
    });

    // 7. Dashes and Arrows
    const dashBtns = this.container.querySelectorAll('.sp40-dash-pill');
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
