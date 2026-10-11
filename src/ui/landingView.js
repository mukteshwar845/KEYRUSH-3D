/**
 * KEYRUSH — Next-Gen Esports Motorsport Typing Simulator
 * Landing & Overview Page
 * Redesigned to match reference specifications:
 * - Top Navbar: Brand, 7 Navigation Links, Offline Status, Notifications, Settings, Login, Get Started
 * - Hero Stage: Cyberpunk night city hypercar showcase, "TYPE FASTER. RACE HARDER.", CTAs & 4 Feature Badges
 * - Game Modes: "Choose Your Challenge" 5-column grid (Solo, AI, Local, Online, Ranked)
 * - Value Proposition Bar: Unlock Epic Cars, Global Leaderboard, Daily Tournaments, Works Offline, Banner Card
 * - Interactive Trailer & Login Modals
 */

import { soundEffects } from '../audio/soundEffects.js';
import { musicManager } from '../audio/musicManager.js';
import { storage } from '../db/storage.js';

export class LandingView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.profile = null;
    this.trailerOpen = false;
  }

  async render(profile) {
    this.profile = profile || (await storage.getProfile()) || {};
    musicManager.playInterior(1500, true);

    this.container.innerHTML = `
      <div class="landing-universe" id="landing-root">
        
        <!-- 1. TOP NAVBAR (GLASSMORPHIC FULL-WIDTH) -->
        <header class="landing-navbar" id="landing-navbar">
          <!-- Left Logo -->
          <div class="nav-brand" role="button" tabindex="0" data-nav="landing" title="KEYRUSH Home">
            <div class="nav-brand-bolt">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#navBoltGrad)" stroke="#00D9FF" stroke-width="1.2" stroke-linejoin="round"/>
                <defs>
                  <linearGradient id="navBoltGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#00D9FF"/>
                    <stop offset="0.5" stop-color="#147BFF"/>
                    <stop offset="1" stop-color="#8B35FF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="nav-brand-text">
              <span class="nav-logo-name">KEYRUSH</span>
              <span class="nav-logo-sub">Type. Race. Dominate.</span>
            </div>
          </div>

          <!-- Center Navigation Links -->
          <nav class="nav-links" aria-label="Main Landing Links">
            <a href="#section-hero" class="nav-link active" data-scroll="section-hero">Home</a>
            <a href="#section-hero" class="nav-link" data-scroll="section-hero">Features</a>
            <a href="#section-modes" class="nav-link" data-scroll="section-modes">Game Modes</a>
            <a href="#section-footer" class="nav-link" data-scroll="section-footer">Garage</a>
            <a href="#section-footer" class="nav-link" data-scroll="section-footer">Leaderboard</a>
            <a href="#section-footer" class="nav-link" data-scroll="section-footer">Tournaments</a>
            <a href="#section-footer" class="nav-link" data-scroll="section-footer">About</a>
          </nav>

          <!-- Right Action Controls: ONLY Get Started button -->
          <div class="nav-actions">
            <!-- Get Started Vibrant Gradient CTA -->
            <button class="nav-btn-get-started" id="landing-get-started-btn" data-nav="dashboard">
              <span>Get Started</span>
              <span class="btn-arrow-right">→</span>
            </button>
          </div>
        </header>

        <!-- 2. HERO SHOWCASE SECTION -->
        <section class="landing-hero-stage" id="section-hero">
          <!-- Cyberpunk Street Background Visual & Hypercar (from mockup) -->
          <div class="hero-stage-bg-wrap">
            <img 
              src="/images/heroes/landing-hero-car.jpg" 
              alt="KEYRUSH Cyberpunk Night Racing Hypercar" 
              class="hero-stage-car-backdrop" 
            />
            <div class="hero-stage-gradient-overlay"></div>
          </div>

          <div class="hero-stage-container">
            <div class="hero-stage-left-content">
              <!-- Top Kicker Pill Badge -->
              <div class="hero-experience-badge">
                <span class="badge-bolt-icon">⚡</span>
                <span class="badge-text">THE ULTIMATE TYPING RACING EXPERIENCE</span>
              </div>

              <!-- Main Hero Typography -->
              <h1 class="hero-main-title">
                <span class="title-line-white">TYPE FASTER.</span>
                <span class="title-line-gradient">RACE HARDER.</span>
              </h1>

              <!-- Hero Tagline / Subtitle -->
              <p class="hero-description-text">
                Turn your typing skills into real speed. Race, improve, and become a legend in the ultimate typing racing game.
              </p>

              <!-- Hero CTA Buttons -->
              <div class="hero-actions-row">
                <button class="hero-btn-start-racing" data-nav="race" id="hero-btn-play-race">
                  <span class="btn-play-circle">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </span>
                  <span>Start Racing</span>
                  <span class="btn-arrow-glyph">→</span>
                </button>

                <button class="hero-btn-trailer" id="hero-btn-watch-trailer">
                  <span class="trailer-play-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
                    </svg>
                  </span>
                  <span>Watch Trailer</span>
                </button>
              </div>

              <!-- 4 Feature Quick Badges Row -->
              <div class="hero-features-quad-row">
                <div class="hero-feat-chip">
                  <div class="feat-chip-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                  <div class="feat-chip-text">
                    <span class="chip-main">Improve</span>
                    <span class="chip-sub">Typing Speed</span>
                  </div>
                </div>

                <div class="hero-feat-chip">
                  <div class="feat-chip-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                  </div>
                  <div class="feat-chip-text">
                    <span class="chip-main">Boost</span>
                    <span class="chip-sub">Accuracy</span>
                  </div>
                </div>

                <div class="hero-feat-chip">
                  <div class="feat-chip-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                      <path d="M6 5h12v4a6 6 0 0 1-12 0V5z"></path>
                    </svg>
                  </div>
                  <div class="feat-chip-text">
                    <span class="chip-main">Earn Rewards</span>
                    <span class="chip-sub">& Unlock Cars</span>
                  </div>
                </div>

                <div class="hero-feat-chip">
                  <div class="feat-chip-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <div class="feat-chip-text">
                    <span class="chip-main">Play Online</span>
                    <span class="chip-sub">or Offline</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- 3. CHOOSE YOUR CHALLENGE (GAME MODES) SECTION -->
        <section class="landing-modes-section" id="section-modes">
          <div class="modes-section-container">
            <!-- Header Row -->
            <div class="modes-section-header">
              <div class="modes-header-left">
                <span class="modes-kicker-tag">&lt;GAME MODES&gt;</span>
                <h2 class="modes-title-heading">Choose Your Challenge</h2>
                <p class="modes-sub-heading">Pick your mode and start your journey to become a typing champion.</p>
              </div>
              <button class="modes-view-all-link" data-nav="race-modes">
                <span>View All Modes</span>
                <span class="view-all-arrow">→</span>
              </button>
            </div>

            <!-- 5-Column Game Modes Cards Grid -->
            <div class="modes-cards-row-grid">
              
              <!-- 1. Solo Practice -->
              <div class="mode-showcase-card" data-nav="diagnostic" role="button" tabindex="0">
                <div class="mode-card-thumb-wrap">
                  <img src="/images/game-modes/landing-mode-solo.jpg" alt="Solo Practice" class="mode-card-img" />
                </div>
                <div class="mode-card-footer-info">
                  <div class="mode-icon-circle purple-glow">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div class="mode-text-details">
                    <h3 class="mode-card-name">Solo Practice</h3>
                    <span class="mode-card-desc">Improve at your own pace.</span>
                  </div>
                  <span class="mode-arrow-action">→</span>
                </div>
              </div>

              <!-- 2. Race Against AI -->
              <div class="mode-showcase-card" data-nav="race" data-mode="AI Racing" role="button" tabindex="0">
                <div class="mode-card-thumb-wrap">
                  <img src="/images/game-modes/landing-mode-ai.jpg" alt="Race Against AI" class="mode-card-img" />
                </div>
                <div class="mode-card-footer-info">
                  <div class="mode-icon-circle purple-glow">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                      <circle cx="12" cy="5" r="2"></circle>
                      <path d="M12 7v4"></path>
                      <line x1="8" y1="16" x2="8.01" y2="16"></line>
                      <line x1="16" y1="16" x2="16.01" y2="16"></line>
                    </svg>
                  </div>
                  <div class="mode-text-details">
                    <h3 class="mode-card-name">Race Against AI</h3>
                    <span class="mode-card-desc">Challenge computer opponents.</span>
                  </div>
                  <span class="mode-arrow-action">→</span>
                </div>
              </div>

              <!-- 3. Local Multiplayer -->
              <div class="mode-showcase-card" data-nav="race-modes" role="button" tabindex="0">
                <div class="mode-card-thumb-wrap">
                  <img src="/images/game-modes/landing-mode-local.jpg" alt="Local Multiplayer" class="mode-card-img" />
                </div>
                <div class="mode-card-footer-info">
                  <div class="mode-icon-circle purple-glow">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div class="mode-text-details">
                    <h3 class="mode-card-name">Local Multiplayer</h3>
                    <span class="mode-card-desc">Play with friends (offline).</span>
                  </div>
                  <span class="mode-arrow-action">→</span>
                </div>
              </div>

              <!-- 4. Online Multiplayer -->
              <div class="mode-showcase-card" data-nav="race-modes" role="button" tabindex="0">
                <div class="mode-card-thumb-wrap">
                  <img src="/images/game-modes/landing-mode-online.jpg" alt="Online Multiplayer" class="mode-card-img" />
                </div>
                <div class="mode-card-footer-info">
                  <div class="mode-icon-circle purple-glow">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <div class="mode-text-details">
                    <h3 class="mode-card-name">Online Multiplayer</h3>
                    <span class="mode-card-desc">Race real players worldwide.</span>
                  </div>
                  <span class="mode-arrow-action">→</span>
                </div>
              </div>

              <!-- 5. Ranked Championship -->
              <div class="mode-showcase-card" data-nav="leaderboard" role="button" tabindex="0">
                <div class="mode-card-thumb-wrap">
                  <img src="/images/game-modes/landing-mode-ranked.jpg" alt="Ranked Championship" class="mode-card-img" />
                </div>
                <div class="mode-card-footer-info">
                  <div class="mode-icon-circle purple-glow">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                      <path d="M6 5h12v4a6 6 0 0 1-12 0V5z"></path>
                    </svg>
                  </div>
                  <div class="mode-text-details">
                    <h3 class="mode-card-name">Ranked Championship</h3>
                    <span class="mode-card-desc">Climb the global ranks.</span>
                  </div>
                  <span class="mode-arrow-action">→</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- 4. BOTTOM VALUE PROPOSITION & FEATURE HIGHLIGHTS BAR -->
        <section class="landing-values-strip-section" id="section-footer">
          <div class="values-strip-container">
            
            <div class="value-item" data-nav="garage" role="button" tabindex="0">
              <span class="value-icon gold">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path>
                </svg>
              </span>
              <div class="value-text">
                <strong class="value-title">Unlock Epic Cars</strong>
                <span class="value-desc">Collect, upgrade, and customize your dream vehicles.</span>
              </div>
            </div>

            <div class="value-item" data-nav="leaderboard" role="button" tabindex="0">
              <span class="value-icon star">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
              <div class="value-text">
                <strong class="value-title">Global Leaderboard</strong>
                <span class="value-desc">Compete with players around the world.</span>
              </div>
            </div>

            <div class="value-item" data-nav="missions" role="button" tabindex="0">
              <span class="value-icon bolt">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#00D9FF">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </span>
              <div class="value-text">
                <strong class="value-title">Daily Tournaments</strong>
                <span class="value-desc">Special events, bigger rewards.</span>
              </div>
            </div>

            <div class="value-item">
              <span class="value-icon device">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </span>
              <div class="value-text">
                <strong class="value-title">Works Offline</strong>
                <span class="value-desc">Full features without internet.</span>
              </div>
            </div>

            <!-- Banner Card on the Right (YOUR SKILLS. YOUR RIDE.) -->
            <div class="value-banner-card" data-nav="garage" role="button" tabindex="0" title="Explore Supercar Garage">
              <img src="/images/cars/landing-banner-car.jpg" alt="Your Skills Your Ride" class="banner-car-thumb" />
              <div class="banner-card-text">
                <span class="banner-line-1">YOUR SKILLS.</span>
                <span class="banner-line-2">YOUR RIDE.</span>
              </div>
              <div class="banner-card-arrow">→</div>
            </div>

          </div>
        </section>

        <!-- CINEMATIC TRAILER MODAL -->
        <div class="trailer-modal-backdrop hidden" id="trailer-modal-backdrop">
          <div class="trailer-modal-card">
            <div class="trailer-modal-header">
              <div class="trailer-header-brand">
                <span class="modal-badge-tag">CINEMATIC TRAILER</span>
                <h3>KEYRUSH — TYPE. RACE. DOMINATE.</h3>
              </div>
              <button class="modal-close-btn" id="trailer-modal-close" aria-label="Close Trailer">✕</button>
            </div>
            <div class="trailer-video-stage">
              <img src="/images/branding/landing-reference.jpg" alt="KeyRush Trailer" class="trailer-preview-frame" />
              <div class="trailer-overlay-hud">
                <div class="hud-pulse-ring"></div>
                <button class="hud-launch-race-btn" data-nav="race">
                  ▶ START 3D RACE NOW
                </button>
              </div>
            </div>
            <div class="trailer-modal-footer">
              <span>High-speed touch typing simulator powered by Three.js procedural motorsport engine.</span>
              <button class="btn btn-primary" data-nav="race-modes">Select Mode →</button>
            </div>
          </div>
        </div>

      </div>
    `;

    setTimeout(() => {
      this.bindEvents();
    }, 40);
  }

  bindEvents() {
    // 1. Get Started Button — The official gate to the Main Dashboard
    const getStartedBtn = document.getElementById('landing-get-started-btn');
    getStartedBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      soundEffects.playUiClick();
      sessionStorage.setItem('keyrush_entered', 'true');
      this.app.showScreen('dashboard');
    });

    // 2. Navigation items delegation (Hero CTA, Challenge cards, etc.)
    this.container.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetScreen = btn.getAttribute('data-nav');
        soundEffects.playKeyClick(true);
        sessionStorage.setItem('keyrush_entered', 'true');
        if (targetScreen === 'race') {
          soundEffects.playNitroBoost();
        }
        this.app.showScreen(targetScreen);
      });
    });

    // 3. Smooth internal scroll anchors for Landing Navbar & Sections
    this.container.querySelectorAll('[data-scroll]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-scroll');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          soundEffects.playUiClick();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // 4. Trailer Modal
    const trailerBtn = document.getElementById('hero-btn-watch-trailer');
    const trailerModal = document.getElementById('trailer-modal-backdrop');
    const trailerClose = document.getElementById('trailer-modal-close');

    trailerBtn?.addEventListener('click', () => {
      soundEffects.playUiClick();
      if (trailerModal) trailerModal.classList.remove('hidden');
    });

    trailerClose?.addEventListener('click', () => {
      soundEffects.playUiClick();
      if (trailerModal) trailerModal.classList.add('hidden');
    });

    trailerModal?.addEventListener('click', (e) => {
      if (e.target === trailerModal) {
        trailerModal.classList.add('hidden');
      }
    });
  }

  dispose() {
    // Cleanup if needed
  }
}
