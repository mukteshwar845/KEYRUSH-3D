/**
 * KEYRUSH — Home Dashboard (Screen 02)
 * Redesigned to closely match the reference design:
 * - Deep black & near-black navy theme (#03060D, #061020)
 * - Three-area responsive layout: Left Sidebar, Top Navigation Bar, Main Dashboard Canvas (Center + Right panel)
 * - Cinematic sports car hero banner ("YOUR SPEED. YOUR POWER.")
 * - 5 compact typing performance overview cards with sparklines
 * - "Choose Your Race Mode" grid with 5 visual racing cards
 * - Progress analytics (dual-line WPM & Accuracy chart + circular progress gauge)
 * - Recent activity stream & Global ranked leaderboard
 * - Right sidebar: Daily streak, daily goal progress, My Vehicle preview, Quick actions, Achievements
 * - Responsive dashboard footer
 */

import { storage } from '../db/storage.js';
import { soundEffects } from '../audio/soundEffects.js';
import { musicManager } from '../audio/musicManager.js';

export class DashboardView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.profile = null;
    this.garage = null;
    this.sessions = [];
    this.missions = null;
  }

  async render(profile) {
    this.profile = profile || (await storage.getProfile()) || {};
    this.garage = (await storage.getGarage()) || {};
    this.sessions = (await storage.getSessions(50)) || [];
    this.missions = (await storage.getMissions()) || {};

    // Dynamic stats from real stored profile
    const currentWpm = this.profile.averageWpm || 78;
    const accuracy = this.profile.accuracy || 96;
    const bestWpm = this.profile.bestWpm || 112;
    const bestAccuracy = 98;
    const totalPracticeSec = this.profile.totalPracticeTimeSec || (6 * 3600 + 42 * 60);
    const practiceHours = Math.floor(totalPracticeSec / 3600);
    const practiceMins = Math.floor((totalPracticeSec % 3600) / 60);
    const xpPoints = (this.profile.xp || 2480).toLocaleString();
    const level = this.profile.level || 6;
    const streakDays = this.profile.currentStreak || 7;
    const username = (this.profile.username && this.profile.username !== 'CyberRacer') ? this.profile.username : 'Kartik';

    this.container.innerHTML = `
      <div class="dash-shell" id="dash-shell">
        <!-- A. LEFT SIDEBAR -->
        <aside class="dash-sidebar" id="dash-sidebar">
          <!-- Logo Brand -->
          <div class="dash-brand-block" id="dash-brand-btn" role="button" tabindex="0" title="Return to SP40 Concept Showcase">
            <div class="dash-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#boltGrad)" stroke="#00D9FF" stroke-width="1.2" stroke-linejoin="round"/>
                <defs>
                  <linearGradient id="boltGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#00D9FF"/>
                    <stop offset="0.5" stop-color="#147BFF"/>
                    <stop offset="1" stop-color="#8B35FF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="dash-brand-text">
              <span class="dash-brand-title">KEYRUSH</span>
              <span class="dash-brand-tagline">Type. Race. Dominate.</span>
            </div>
          </div>

          <!-- Navigation Menu Links -->
          <nav class="dash-nav-menu" aria-label="Main Navigation">
            <button class="dash-nav-btn active" data-nav="dashboard" title="Home Dashboard">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <span class="nav-btn-label">Home</span>
            </button>

            <button class="dash-nav-btn" data-nav="race" title="Race Mode">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </span>
              <span class="nav-btn-label">Race Mode</span>
            </button>

            <button class="dash-nav-btn" data-nav="diagnostic" title="Practice Mode">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </span>
              <span class="nav-btn-label">Practice</span>
            </button>

            <button class="dash-nav-btn" data-nav="academy" title="Touch-Typing Academy">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </span>
              <span class="nav-btn-label">Academy</span>
            </button>

            <button class="dash-nav-btn" data-nav="garage" title="Supercar Garage">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="6" width="20" height="8" rx="2"></rect>
                  <circle cx="6" cy="17" r="2"></circle>
                  <circle cx="18" cy="17" r="2"></circle>
                  <path d="M6 6V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2"></path>
                </svg>
              </span>
              <span class="nav-btn-label">Garage</span>
            </button>

            <button class="dash-nav-btn" data-nav="leaderboard" title="Global Leaderboard">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                  <path d="M6 5h12v4a6 6 0 0 1-12 0V5z"></path>
                </svg>
              </span>
              <span class="nav-btn-label">Leaderboard</span>
            </button>

            <button class="dash-nav-btn" data-nav="analytics" title="Telemetry Statistics">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </span>
              <span class="nav-btn-label">Statistics</span>
            </button>

            <button class="dash-nav-btn" data-nav="multiplayer" title="Tournaments & Championships">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z"></path>
                </svg>
              </span>
              <span class="nav-btn-label">Tournaments</span>
            </button>

            <button class="dash-nav-btn" data-nav="settings" title="Audio & System Settings">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </span>
              <span class="nav-btn-label">Settings</span>
            </button>
          </nav>

          <!-- Bottom Promotional & Status Cards -->
          <div class="dash-sidebar-bottom">
            <!-- Promo 1: Unlock New Cars -->
            <div class="sidebar-promo-card">
              <img src="/images/sidebar_unlock_cars.png" alt="Unlock New Cars" class="sidebar-promo-img" />
              <div class="sidebar-promo-content">
                <span class="sidebar-promo-title">Unlock New Cars</span>
                <span class="sidebar-promo-sub">Complete challenges & earn rewards</span>
                <button class="sidebar-promo-btn" data-nav="garage">
                  View Garage →
                </button>
              </div>
            </div>

            <!-- Promo 2: Offline Mode Card -->
            <div class="sidebar-status-card">
              <div class="status-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                  <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                  <line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
                <span class="status-card-title">You're Offline</span>
              </div>
              <p class="status-card-desc">Play locally, track progress, and enjoy full features offline.</p>
              <button class="sidebar-status-btn" data-action="offline-info">
                Offline Mode
              </button>
            </div>
          </div>
        </aside>

        <!-- B. MAIN CONTENT CANVAS AREA -->
        <div class="dash-main-area">
          <!-- TOP NAVIGATION BAR -->
          <header class="dash-top-bar">
            <!-- Global Search Input -->
            <div class="dash-search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B8EA8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search races, vehicles, or anything..." 
                class="dash-search-input"
                id="dash-search-input"
                aria-label="Search"
              />
              <span class="dash-search-kbd">Ctrl + K</span>
            </div>

            <!-- Top Right Profile & Status Controls -->
            <div class="dash-top-right">
              <!-- Offline Mode Status Pill -->
              <div class="dash-status-pill" title="Offline-First Engine: Full Local Availability">
                <span class="status-pulse-dot"></span>
                <div class="status-pill-text">
                  <strong>Offline Mode</strong>
                  <small>Play anytime, anywhere</small>
                </div>
              </div>

              <!-- Notification Bell with Badge 1 -->
              <button class="dash-icon-btn" id="dash-notify-btn" title="Daily Directive Available (1)">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="dash-notify-badge">1</span>
              </button>

              <!-- Settings Gear Shortcut -->
              <button class="dash-icon-btn" data-nav="settings" title="System Settings">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>

              <!-- Player Avatar & Profile -->
              <div class="dash-user-chip" id="dash-user-chip" role="button" tabindex="0" title="Player Profile">
                <img src="/images/avatar_kartik.png" alt="${username}" class="dash-user-avatar" />
                <div class="dash-user-info">
                  <span class="dash-user-name">${username}</span>
                  <span class="dash-user-role">Racer</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7B8EA8" stroke-width="2.5" stroke-linecap="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </header>

          <!-- DASHBOARD TWO-COLUMN CONTAINER -->
          <div class="dash-body-container">
            <!-- CENTER CONTENT COLUMN -->
            <div class="dash-center-col">
              <!-- 1. HERO BANNER — MAIN ATTRACTION -->
              <section class="dash-hero-card">
                <div class="hero-card-left">
                  <div class="hero-brand-badge">
                    <span class="hero-brand-text">KEYRUSH</span>
                  </div>
                  <h1 class="hero-main-headline">
                    YOUR SPEED<br>
                    <span class="hero-highlight-power">YOUR POWER</span>
                  </h1>
                  <p class="hero-support-text">
                    Turn your typing skills into real speed. Race, improve<br>
                    and become a legend.
                  </p>
                  <div class="hero-cta-group">
                    <button class="hero-btn-primary" id="hero-btn-race" data-nav="race">
                      <span class="btn-play-triangle">▶</span>
                      <span>Start Racing</span>
                      <span class="btn-arrow-right">→</span>
                    </button>
                    <button class="hero-btn-secondary" id="hero-btn-trailer" data-action="trailer">
                      <span class="btn-play-circle">▷</span>
                      <span>Watch Trailer</span>
                    </button>
                  </div>
                </div>

                <div class="hero-card-right">
                  <img 
                    src="/images/dashboard_hero_car.png" 
                    alt="Futuristic Sports Car" 
                    class="hero-supercar-img" 
                  />
                  <!-- Bottom-right Tagline Badge -->
                  <div class="hero-crown-badge">
                    <span class="crown-icon">👑</span>
                    <span class="crown-text">Type<br>Race<br>Dominate</span>
                  </div>
                </div>
              </section>

              <!-- 2. TYPING PERFORMANCE OVERVIEW (5 CARDS) -->
              <section class="dash-perf-section">
                <!-- Card 1: Current WPM -->
                <div class="perf-card">
                  <div class="perf-card-header">
                    <div class="perf-icon-circle blue-circle">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#147BFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 14l3-3"></path>
                        <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
                      </svg>
                    </div>
                    <span class="perf-label">Current WPM</span>
                  </div>
                  <div class="perf-val-row">
                    <span class="perf-main-val font-mono">${currentWpm}</span>
                    <span class="perf-trend-pill positive">
                      <span>↑ +12%</span>
                      <small>vs last week</small>
                    </span>
                  </div>
                  <!-- Mini sparkline with neon glow -->
                  <div class="perf-sparkline">
                    <svg viewBox="0 0 100 24" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="sparkWpmGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#147BFF" stop-opacity="0.35"/>
                          <stop offset="100%" stop-color="#147BFF" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,20 C 25,22 45,14 65,18 C 80,21 90,9 100,6 L 100,24 L 0,24 Z" fill="url(#sparkWpmGrad)" />
                      <path d="M0,20 C 25,22 45,14 65,18 C 80,21 90,9 100,6" fill="none" stroke="#147BFF" stroke-width="2.2" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>

                <!-- Card 2: Accuracy -->
                <div class="perf-card">
                  <div class="perf-card-header">
                    <div class="perf-icon-circle cyan-circle">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="6"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                      </svg>
                    </div>
                    <span class="perf-label">Accuracy</span>
                  </div>
                  <div class="perf-val-row">
                    <span class="perf-main-val font-mono">${accuracy}%</span>
                    <span class="perf-trend-pill positive">
                      <span>↑ +3%</span>
                      <small>vs last week</small>
                    </span>
                  </div>
                  <!-- Mini sparkline with neon cyan glow -->
                  <div class="perf-sparkline">
                    <svg viewBox="0 0 100 24" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="sparkAccGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#00D9FF" stop-opacity="0.35"/>
                          <stop offset="100%" stop-color="#00D9FF" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,19 C 25,17 50,21 75,12 C 85,9 95,6 100,4 L 100,24 L 0,24 Z" fill="url(#sparkAccGrad)" />
                      <path d="M0,19 C 25,17 50,21 75,12 C 85,9 95,6 100,4" fill="none" stroke="#00D9FF" stroke-width="2.2" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>

                <!-- Card 3: Best Record -->
                <div class="perf-card">
                  <div class="perf-card-header">
                    <div class="perf-icon-circle gold-circle">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                        <path d="M6 5h12v4a6 6 0 0 1-12 0V5z"></path>
                      </svg>
                    </div>
                    <span class="perf-label">Best Record</span>
                  </div>
                  <div class="perf-val-row">
                    <span class="perf-main-val font-mono">${bestWpm} <small>WPM</small></span>
                  </div>
                  <div class="perf-sub-badge">(${bestAccuracy}% accuracy)</div>
                </div>

                <!-- Card 4: Total Practice Time -->
                <div class="perf-card">
                  <div class="perf-card-header">
                    <div class="perf-icon-circle blue-circle">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#147BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <span class="perf-label">Total Practice Time</span>
                  </div>
                  <div class="perf-val-row">
                    <span class="perf-main-val font-mono">${practiceHours}h ${practiceMins}m</span>
                  </div>
                  <div class="perf-today-pill text-positive">+1h 20m today</div>
                </div>

                <!-- Card 5: XP Points -->
                <div class="perf-card">
                  <div class="perf-card-header">
                    <div class="perf-icon-circle gold-circle">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </div>
                    <span class="perf-label">XP Points</span>
                  </div>
                  <div class="perf-val-row">
                    <span class="perf-main-val font-mono">${xpPoints}</span>
                  </div>
                  <div class="perf-level-meta">
                    <span>Level ${level}</span>
                    <span>320 / 500</span>
                  </div>
                  <div class="perf-level-bar">
                    <div class="perf-level-fill" style="width: 64%"></div>
                  </div>
                </div>
              </section>

              <!-- 3. RACE MODE SELECTION -->
              <section class="dash-modes-section">
                <div class="modes-section-header">
                  <div>
                    <h2 class="modes-title">Choose Your Race Mode</h2>
                    <p class="modes-subtitle">Pick your style. Start your journey.</p>
                  </div>
                  <button class="modes-view-all" data-nav="race">
                    View All Modes →
                  </button>
                </div>

                <div class="modes-cards-grid">
                  <!-- Mode 1: Solo Practice -->
                  <div class="mode-card" data-mode="Solo Practice" data-nav="diagnostic">
                    <div class="mode-card-visual">
                      <img src="/images/mode_solo.png" alt="Solo Practice" class="mode-card-img" />
                      <div class="mode-floating-badge badge-purple">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 5h12v4a6 6 0 0 1-12 0V5z"></path></svg>
                      </div>
                    </div>
                    <div class="mode-card-body">
                      <h3 class="mode-name">Solo Practice</h3>
                      <p class="mode-desc">Train at your own pace</p>
                      <span class="mode-card-arrow arrow-purple">→</span>
                    </div>
                  </div>

                  <!-- Mode 2: Race Against AI -->
                  <div class="mode-card" data-mode="Race Against AI" data-nav="race">
                    <div class="mode-card-visual">
                      <img src="/images/mode_ai.png" alt="Race Against AI" class="mode-card-img" />
                      <div class="mode-floating-badge badge-blue">
                        <span style="font-size: 8.5px; font-weight: 800; font-family: sans-serif;">AI</span>
                      </div>
                    </div>
                    <div class="mode-card-body">
                      <h3 class="mode-name">Race Against AI</h3>
                      <p class="mode-desc">Beat the computer</p>
                      <span class="mode-card-arrow arrow-blue">→</span>
                    </div>
                  </div>

                  <!-- Mode 3: Local Multiplayer -->
                  <div class="mode-card" data-mode="Local Multiplayer" data-nav="multiplayer">
                    <div class="mode-card-visual">
                      <img src="/images/mode_local.png" alt="Local Multiplayer" class="mode-card-img" />
                      <div class="mode-floating-badge badge-green">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      </div>
                    </div>
                    <div class="mode-card-body">
                      <h3 class="mode-name">Local Multiplayer</h3>
                      <p class="mode-desc">Play with friends (offline)</p>
                      <span class="mode-card-arrow arrow-green">→</span>
                    </div>
                  </div>

                  <!-- Mode 4: Online Multiplayer -->
                  <div class="mode-card" data-mode="Online Multiplayer" data-nav="multiplayer">
                    <div class="mode-card-visual">
                      <img src="/images/mode_online.png" alt="Online Multiplayer" class="mode-card-img" />
                      <div class="mode-floating-badge badge-orange">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                      </div>
                    </div>
                    <div class="mode-card-body">
                      <h3 class="mode-name">Online Multiplayer</h3>
                      <p class="mode-desc">Play with real players</p>
                      <span class="mode-card-arrow arrow-orange">→</span>
                    </div>
                  </div>

                  <!-- Mode 5: Ranked Championship -->
                  <div class="mode-card" data-mode="Ranked Championship" data-nav="leaderboard">
                    <div class="mode-card-visual">
                      <img src="/images/mode_ranked.png" alt="Ranked Championship" class="mode-card-img" />
                      <div class="mode-floating-badge badge-violet">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      </div>
                    </div>
                    <div class="mode-card-body">
                      <h3 class="mode-name">Ranked Championship</h3>
                      <p class="mode-desc">Climb the global ranks</p>
                      <span class="mode-card-arrow arrow-violet">→</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 4. BOTTOM ANALYTICS & ACTIVITY ROW (3 PANELS) -->
              <section class="dash-bottom-grid">
                <!-- Panel 1: Your Progress Dual-Line Chart + Circular Gauge -->
                <div class="analytics-card progress-panel">
                  <div class="panel-header-row">
                    <div>
                      <h3 class="panel-title">Your Progress</h3>
                      <span class="panel-subtitle">WPM & Accuracy Over Time</span>
                    </div>
                    <div class="panel-legends">
                      <span class="legend-item"><span class="legend-dot cyan-dot"></span> WPM</span>
                      <span class="legend-item"><span class="legend-dot purple-dot"></span> Accuracy</span>
                    </div>
                  </div>

                  <div class="progress-split-body">
                    <!-- SVG Interactive Dual Line Chart -->
                    <div class="progress-chart-box">
                      <svg class="progress-chart-svg" viewBox="0 0 320 130" preserveAspectRatio="none">
                        <!-- Grid Lines -->
                        <line x1="30" y1="20" x2="310" y2="20" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
                        <line x1="30" y1="50" x2="310" y2="50" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
                        <line x1="30" y1="80" x2="310" y2="80" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
                        <line x1="30" y1="110" x2="310" y2="110" stroke="rgba(255,255,255,0.06)" />

                        <!-- Y Axis labels -->
                        <text x="22" y="24" fill="#586882" font-size="9" text-anchor="end">120</text>
                        <text x="22" y="54" fill="#586882" font-size="9" text-anchor="end">90</text>
                        <text x="22" y="84" fill="#586882" font-size="9" text-anchor="end">60</text>
                        <text x="22" y="113" fill="#586882" font-size="9" text-anchor="end">30</text>

                        <!-- Accuracy Curve (Purple) -->
                        <path d="M 40,88 C 80,82 120,86 160,78 C 200,70 240,65 300,56" 
                              fill="none" stroke="#8B35FF" stroke-width="2.2" stroke-linecap="round" />

                        <!-- WPM Curve (Cyan with neon glow) -->
                        <path d="M 40,94 C 80,90 120,84 160,76 C 200,68 240,56 300,42" 
                              fill="none" stroke="#00D9FF" stroke-width="2.6" stroke-linecap="round" />

                        <!-- WPM Data Dots -->
                        <circle cx="40" cy="94" r="3.5" fill="#00D9FF" />
                        <circle cx="83" cy="90" r="3.5" fill="#00D9FF" />
                        <circle cx="126" cy="84" r="3.5" fill="#00D9FF" />
                        <circle cx="170" cy="76" r="3.5" fill="#00D9FF" />
                        <circle cx="213" cy="68" r="3.5" fill="#00D9FF" />
                        <circle cx="256" cy="56" r="3.5" fill="#00D9FF" />
                        <circle cx="300" cy="42" r="4.5" fill="#ffffff" stroke="#00D9FF" stroke-width="2" />

                        <!-- X Axis Dates -->
                        <text x="40" y="125" fill="#586882" font-size="8.5" text-anchor="middle">Apr 21</text>
                        <text x="83" y="125" fill="#586882" font-size="8.5" text-anchor="middle">Apr 22</text>
                        <text x="126" y="125" fill="#586882" font-size="8.5" text-anchor="middle">Apr 23</text>
                        <text x="170" y="125" fill="#586882" font-size="8.5" text-anchor="middle">Apr 24</text>
                        <text x="213" y="125" fill="#586882" font-size="8.5" text-anchor="middle">Apr 25</text>
                        <text x="256" y="125" fill="#586882" font-size="8.5" text-anchor="middle">Apr 26</text>
                        <text x="300" y="125" fill="#00D9FF" font-size="8.5" text-anchor="middle" font-weight="bold">Apr 27</text>
                      </svg>
                    </div>

                    <!-- Overall Progress Circular Gauge -->
                    <div class="progress-gauge-box">
                      <span class="gauge-title">Overall Progress</span>
                      <div class="gauge-circle-wrap">
                        <svg class="gauge-svg" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="32" stroke="rgba(20,123,255,0.15)" stroke-width="7" fill="none" />
                          <circle cx="40" cy="40" r="32" stroke="url(#cyanGaugeGrad)" stroke-width="7" fill="none"
                                  stroke-dasharray="201.06" stroke-dashoffset="64.3" stroke-linecap="round" />
                          <defs>
                            <linearGradient id="cyanGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stop-color="#00D9FF" />
                              <stop offset="100%" stop-color="#147BFF" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div class="gauge-number font-mono">68%</div>
                      </div>
                      <span class="gauge-sub">Next level at 80%</span>
                    </div>
                  </div>
                </div>

                <!-- Panel 2: Recent Activity -->
                <div class="analytics-card activity-panel">
                  <div class="panel-header-row">
                    <h3 class="panel-title">Recent Activity</h3>
                    <button class="panel-link-btn" data-nav="analytics">View All</button>
                  </div>

                  <div class="activity-list">
                    <div class="activity-item">
                      <div class="activity-icon-hex hex-blue">⚡</div>
                      <div class="activity-details">
                        <span class="activity-name">Completed Advanced Practice</span>
                        <span class="activity-time">2 hours ago</span>
                      </div>
                      <span class="activity-reward text-positive">+100 XP</span>
                    </div>

                    <div class="activity-item">
                      <div class="activity-icon-hex hex-purple">🏆</div>
                      <div class="activity-details">
                        <span class="activity-name">Won a race against AI</span>
                        <span class="activity-time">3 hours ago</span>
                      </div>
                      <span class="activity-reward text-positive">+150 XP</span>
                    </div>

                    <div class="activity-item">
                      <div class="activity-icon-hex hex-red">🏎️</div>
                      <div class="activity-details">
                        <span class="activity-name">Unlocked new skin: Cyber Red</span>
                        <span class="activity-time">Yesterday</span>
                      </div>
                      <span class="activity-reward text-positive">+500 XP</span>
                    </div>

                    <div class="activity-item">
                      <div class="activity-icon-hex hex-gold">⭐</div>
                      <div class="activity-details">
                        <span class="activity-name">Reached level 6</span>
                        <span class="activity-time">Yesterday</span>
                      </div>
                      <span class="activity-reward text-positive">+300 XP</span>
                    </div>
                  </div>
                </div>

                <!-- Panel 3: Global Leaderboard -->
                <div class="analytics-card leaderboard-panel">
                  <div class="panel-header-row">
                    <h3 class="panel-title">Global Leaderboard</h3>
                    <button class="panel-link-btn" data-nav="leaderboard">View All</button>
                  </div>

                  <div class="leaderboard-mini-list">
                    <!-- Rank 1 -->
                    <div class="lb-row">
                      <span class="lb-rank rank-1">👑</span>
                      <span class="lb-avatar">👤</span>
                      <span class="lb-name">ShadowRacer</span>
                      <span class="lb-wpm font-mono">124 WPM</span>
                      <span class="lb-acc font-mono">99%</span>
                    </div>

                    <!-- Rank 2 -->
                    <div class="lb-row">
                      <span class="lb-rank rank-2">🥈</span>
                      <span class="lb-avatar">👤</span>
                      <span class="lb-name">PixelDrive</span>
                      <span class="lb-wpm font-mono">118 WPM</span>
                      <span class="lb-acc font-mono">97%</span>
                    </div>

                    <!-- Rank 3 -->
                    <div class="lb-row">
                      <span class="lb-rank rank-3">🥉</span>
                      <span class="lb-avatar">👤</span>
                      <span class="lb-name">TurboType</span>
                      <span class="lb-wpm font-mono">112 WPM</span>
                      <span class="lb-acc font-mono">96%</span>
                    </div>

                    <!-- Rank 4 (YOU - HIGHLIGHTED) -->
                    <div class="lb-row lb-you-highlight">
                      <span class="lb-rank rank-you">4</span>
                      <img src="/images/avatar_kartik.png" alt="You" class="lb-avatar-img" />
                      <span class="lb-name font-bold">You</span>
                      <span class="lb-wpm font-mono font-bold">78 WPM</span>
                      <span class="lb-acc font-mono">96%</span>
                    </div>

                    <!-- Rank 5 -->
                    <div class="lb-row">
                      <span class="lb-rank">5</span>
                      <span class="lb-avatar">👤</span>
                      <span class="lb-name">SpeedyFox</span>
                      <span class="lb-wpm font-mono">76 WPM</span>
                      <span class="lb-acc font-mono">94%</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- C. RIGHT SIDEBAR — MOTIVATION & PERSONALIZATION -->
            <aside class="dash-right-col">
              <!-- 1. Daily Streak Widget -->
              <div class="widget-card streak-widget">
                <div class="widget-header-row">
                  <span class="widget-label">Daily Streak 🔥</span>
                </div>
                <div class="streak-hero-row">
                  <div class="streak-digits-group">
                    <div class="streak-num-line">
                      <span class="streak-big-num font-mono">${streakDays}</span>
                      <span class="streak-unit">Days</span>
                    </div>
                    <p class="streak-cheer">Keep it up! You're on fire!</p>
                  </div>
                  <div class="streak-flame-wrap">
                    <svg width="46" height="56" viewBox="0 0 24 24" fill="none">
                      <defs>
                        <linearGradient id="streakFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stop-color="#FF3500"/>
                          <stop offset="35%" stop-color="#FF7A00"/>
                          <stop offset="75%" stop-color="#FFB800"/>
                          <stop offset="100%" stop-color="#FFE600"/>
                        </linearGradient>
                        <filter id="streakFlameGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#FF7A00" flood-opacity="0.8"/>
                        </filter>
                      </defs>
                      <path d="M12 2C10.5 4.5 8.5 7 8.5 10C8.5 10.5 8.6 11 8.8 11.5C8 11.1 7.2 10.3 6.8 9.2C5.5 11 5 13.2 5.5 15.4C6.3 19 9.2 21.8 12.8 21.9C17.2 22.1 20.8 18.5 20.5 14.1C20.3 10.8 18.2 7.7 15.6 5.8C15.8 7.3 15.1 8.8 14 9.6C14 6.8 13.3 4.2 12 2Z" fill="url(#streakFlameGrad)" filter="url(#streakFlameGlow)"/>
                      <path d="M12 11.5C11 13 10.2 14.5 10.5 16.2C10.8 18 12.2 19.5 14 19.5C15.8 19.5 16.8 17.8 16.5 16C16.2 14 14.8 12.5 13.8 11C13.2 12.2 12.5 12.8 12 11.5Z" fill="#FFF4B8"/>
                    </svg>
                  </div>
                </div>

                <div class="streak-calendar-row">
                  <div class="cal-day-col"><span class="day-lbl">Mon</span><span class="day-check active">✓</span></div>
                  <div class="cal-day-col"><span class="day-lbl">Tue</span><span class="day-check active">✓</span></div>
                  <div class="cal-day-col"><span class="day-lbl">Wed</span><span class="day-check active">✓</span></div>
                  <div class="cal-day-col"><span class="day-lbl">Thu</span><span class="day-check active">✓</span></div>
                  <div class="cal-day-col"><span class="day-lbl">Fri</span><span class="day-check active">✓</span></div>
                  <div class="cal-day-col"><span class="day-lbl">Sat</span><span class="day-check active">✓</span></div>
                  <div class="cal-day-col"><span class="day-lbl">Sun</span><span class="day-check inactive"></span></div>
                </div>
              </div>

              <!-- 2. Daily Goal Widget -->
              <div class="widget-card goal-widget">
                <div class="widget-header-row">
                  <div class="goal-header-left">
                    <div class="goal-icon-circle">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF35D3" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="6"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                      </svg>
                    </div>
                    <span class="widget-label">Daily Goal</span>
                  </div>
                  <span class="goal-bell">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B8EA8" stroke-width="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                  </span>
                </div>
                <p class="goal-sub">Type 15 minutes today</p>
                <div class="goal-progress-row">
                  <div class="goal-track">
                    <div class="goal-fill" style="width: 53.3%"></div>
                  </div>
                  <span class="goal-fraction font-mono">8 / 15 min</span>
                </div>
              </div>

              <!-- 3. My Vehicle Widget -->
              <div class="widget-card vehicle-widget">
                <div class="widget-header-row">
                  <span class="widget-label">My Vehicle</span>
                  <span class="widget-gear" data-nav="garage">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B8EA8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </span>
                </div>

                <div class="vehicle-preview-box">
                  <img src="/images/vehicle_neon_blade.png" alt="Neon Blade" class="vehicle-preview-img" />
                </div>

                <div class="vehicle-meta-row">
                  <span class="vehicle-badge-name">• Neon Blade</span>
                  <span class="vehicle-xp font-mono">120 / 300</span>
                </div>
                <div class="vehicle-level-meta">Level 3</div>
                <div class="vehicle-level-track">
                  <div class="vehicle-level-fill" style="width: 40%"></div>
                </div>

                <button class="widget-view-garage-btn" data-nav="garage">
                  View Garage →
                </button>
              </div>

              <!-- 4. Quick Actions -->
              <div class="widget-card quick-actions-widget">
                <span class="widget-label">Quick Actions</span>
                <div class="quick-actions-grid">
                  <button class="qa-btn" data-nav="diagnostic">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                    <span>Start Practice →</span>
                  </button>
                  <button class="qa-btn" data-nav="diagnostic">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#147BFF" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    <span>Take Diagnostic Test</span>
                  </button>
                  <button class="qa-btn" data-nav="academy">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B35FF" stroke-width="2" stroke-linecap="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    <span>View Tutorials</span>
                  </button>
                  <button class="qa-btn" data-nav="settings">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d946ef" stroke-width="2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
                    <span>Customize Theme</span>
                  </button>
                </div>
              </div>

              <!-- 5. Achievements -->
              <div class="widget-card achievements-widget">
                <div class="widget-header-row">
                  <span class="widget-label">Achievements</span>
                  <button class="panel-link-btn" data-nav="analytics">View All →</button>
                </div>

                <div class="achieve-list">
                  <div class="achieve-item">
                    <div class="achieve-hex hex-gold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 5h12v4a6 6 0 0 1-12 0V5z"></path></svg>
                    </div>
                    <div class="achieve-text">
                      <strong>Typing Pro</strong>
                      <small>Reach 100 WPM</small>
                    </div>
                    <span class="achieve-chevron">›</span>
                  </div>

                  <div class="achieve-item">
                    <div class="achieve-hex hex-green">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                    </div>
                    <div class="achieve-text">
                      <strong>Accuracy Master</strong>
                      <small>Hit 98% accuracy</small>
                    </div>
                    <span class="achieve-chevron">›</span>
                  </div>

                  <div class="achieve-item">
                    <div class="achieve-hex hex-orange">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </div>
                    <div class="achieve-text">
                      <strong>Race Winner</strong>
                      <small>Win 10 races</small>
                    </div>
                    <span class="achieve-chevron">›</span>
                  </div>

                  <div class="achieve-item">
                    <div class="achieve-hex hex-blue">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#147BFF" stroke-width="2"><path d="M12 2c1.5 3 4 4.5 4 8a6 6 0 0 1-12 0c0-3.5 2.5-5 4-8 1 2 2 2 4 0z"></path></svg>
                    </div>
                    <div class="achieve-text">
                      <strong>Streak Legend</strong>
                      <small>7 day streak</small>
                    </div>
                    <span class="achieve-chevron">›</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <!-- D. DASHBOARD FOOTER -->
          <footer class="dash-footer-bar">
            <div class="dash-footer-brand">
              <span class="footer-logo">⚡ KEYRUSH</span>
              <span class="footer-tagline">Type. Race. Dominate.</span>
            </div>

            <div class="dash-footer-features">
              <div class="footer-feat-item">
                <span class="feat-icon">🌐</span>
                <div class="feat-text">
                  <strong>Works Offline</strong>
                  <small>Full features without internet</small>
                </div>
              </div>

              <div class="footer-feat-item">
                <span class="feat-icon">📱</span>
                <div class="feat-text">
                  <strong>PWA Ready</strong>
                  <small>Install on your device</small>
                </div>
              </div>

              <div class="footer-feat-item">
                <span class="feat-icon">💻</span>
                <div class="feat-text">
                  <strong>Cross-Platform</strong>
                  <small>Desktop • Tablet • Mobile</small>
                </div>
              </div>
            </div>

            <div class="dash-footer-right">
              <span>👑 Level Up Your Typing Skills</span>
            </div>
          </footer>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // 1. Navigation items
    this.container.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetScreen = btn.getAttribute('data-nav');
        soundEffects.playUiClick();
        if (targetScreen === 'race') {
          soundEffects.playNitroBoost();
        }
        this.app.showScreen(targetScreen);
      });
    });

    // 2. Logo click returns to SP40 Landing showcase
    document.getElementById('dash-brand-btn')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      this.app.showScreen('landing');
    });

    // 3. Search input live filter
    const searchInput = document.getElementById('dash-search-input');
    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const modeCards = this.container.querySelectorAll('.mode-card');
      modeCards.forEach((card) => {
        const modeName = card.getAttribute('data-mode')?.toLowerCase() || '';
        if (!query || modeName.includes(query)) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.opacity = '0.3';
        }
      });
    });

    // Keyboard shortcut Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput?.focus();
      }
    });

    // 4. Trailer modal trigger
    document.getElementById('hero-btn-trailer')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      this.app.showScreen('landing');
    });

    // 5. Offline info click
    this.container.querySelectorAll('[data-action="offline-info"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundEffects.playUiClick();
        alert('KEYRUSH Offline-First System: All typing races, AI opponents, garage customizer, academy lessons, and personal progress operate 100% locally with zero internet required.');
      });
    });

    // 6. User chip profile shortcut
    document.getElementById('dash-user-chip')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      this.app.showScreen('analytics');
    });

    // 7. Notification bell
    document.getElementById('dash-notify-btn')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      alert('Active Directive: Complete 15 minutes of daily practice to earn +250 XP and unlock exclusive neon underglow colors!');
    });
  }

  dispose() {
    // cleanup
  }
}
