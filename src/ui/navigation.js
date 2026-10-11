/**
 * KEYRUSH — Unified Master Navigation & Shell Manager
 * Controls persistent left sidebar, top search/status bar, footer,
 * global event delegation, active screen highlights, and modals.
 */

import { storage } from '../db/storage.js';
import { soundEffects } from '../audio/soundEffects.js';
import { musicManager } from '../audio/musicManager.js';

export class NavigationManager {
  constructor(app) {
    this.app = app;
    this.currentScreen = 'dashboard';
    this.isOnline = navigator.onLine;
    this.currentLatencyMs = 18;
    this.pingInterval = null;
    this.searchOpen = false;
    this.notifyOpen = false;

    this.initNetworkDetection();
  }

  initNetworkDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateNetworkBadge();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateNetworkBadge();
    });

    this.pingInterval = setInterval(() => {
      if (this.isOnline) {
        const start = performance.now();
        fetch('/vite.svg', { method: 'HEAD', cache: 'no-store' })
          .then(() => {
            this.currentLatencyMs = Math.round(performance.now() - start);
            this.updateNetworkBadge();
          })
          .catch(() => {
            this.currentLatencyMs = 24;
            this.updateNetworkBadge();
          });
      }
    }, 10000);
  }

  updateNetworkBadge() {
    const pillText = document.getElementById('dash-network-status-text');
    const dot = document.getElementById('dash-network-status-dot');
    if (!pillText) return;

    if (this.isOnline) {
      if (dot) {
        dot.className = 'status-pulse-dot';
        dot.style.background = '#10B981';
      }
      pillText.innerHTML = `
        <strong>Online Mode</strong>
        <small>${this.currentLatencyMs}ms ping</small>
      `;
    } else {
      if (dot) {
        dot.className = 'status-pulse-dot';
        dot.style.background = '#F59E0B';
      }
      pillText.innerHTML = `
        <strong>Offline Mode</strong>
        <small>Play anytime, anywhere</small>
      `;
    }
  }

  renderShell(profile) {
    const username = (profile?.username && profile.username !== 'CyberRacer') ? profile.username : 'Kartik';
    const streak = profile?.currentStreak || 7;

    return `
      <div class="dash-shell" id="dash-shell">
        <!-- A. PERSISTENT LEFT SIDEBAR -->
        <aside class="dash-sidebar" id="dash-sidebar">
          <!-- Logo Brand -->
          <div class="dash-brand-block" id="dash-brand-btn" role="button" tabindex="0" data-nav="dashboard" title="KEYRUSH Home Dashboard">
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

          <!-- Navigation Menu Links (9 Unified Sections) -->
          <nav class="dash-nav-menu" id="dash-nav-menu" aria-label="Main Navigation">
            <button class="dash-nav-btn active" data-nav="dashboard" title="Home Dashboard">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <span class="nav-btn-label">Home</span>
            </button>

            <button class="dash-nav-btn" data-nav="race-modes" title="Race Modes Hub">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </span>
              <span class="nav-btn-label">Race Mode</span>
            </button>

            <button class="dash-nav-btn" data-nav="diagnostic" title="Practice Benchmark">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="2"></circle>
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

            <button class="dash-nav-btn" data-nav="leaderboard" title="Ranked Leaderboard">
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

            <button class="dash-nav-btn" data-nav="analytics" title="Telemetry & Statistics">
              <span class="nav-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </span>
              <span class="nav-btn-label">Statistics</span>
            </button>

            <button class="dash-nav-btn" data-nav="missions" title="Tournaments & Championships">
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
        <div class="dash-main-area" id="dash-main-area">
          <!-- TOP NAVIGATION BAR -->
          <header class="dash-top-bar" id="dash-top-bar">
            <!-- Global Search Input -->
            <div class="dash-search-box" id="dash-search-trigger">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B8EA8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search cars, skins, or upgrades..." 
                class="dash-search-input"
                id="dash-search-input"
                aria-label="Search"
              />
            </div>

            <!-- Top Right Profile & Status Controls -->
            <div class="dash-top-right">
              <!-- Offline Mode Status Pill -->
              <div class="dash-status-pill" id="dash-status-pill" title="Offline-First Engine: Full Local Availability">
                <span class="status-pulse-dot" id="dash-network-status-dot"></span>
                <div class="status-pill-text" id="dash-network-status-text">
                  <strong>Offline Mode</strong>
                  <small>Play anytime, anywhere</small>
                </div>
              </div>

              <!-- Music & Audio Soundtrack Quick Toggle -->
              <button class="dash-icon-btn audio-quick-toggle" id="dash-audio-toggle" title="Background Music: Click to Toggle (Mute / Unmute)">
                <span class="audio-toggle-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path class="wave-outer" d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    <path class="wave-inner" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </span>
                <span class="audio-live-pill" id="dash-audio-pill">MUSIC ON</span>
              </button>

              <!-- Notification Bell with Badge 3 -->
              <button class="dash-icon-btn" id="dash-notify-btn" title="Notifications (3)">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="dash-notify-badge">3</span>
              </button>

              <!-- Settings Gear Shortcut -->
              <button class="dash-icon-btn" data-nav="settings" title="System Settings">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>

              <!-- Player Avatar & Profile -->
              <div class="dash-user-chip" id="dash-user-chip" role="button" tabindex="0" data-nav="analytics" title="Player Profile & Telemetry">
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

          <!-- DYNAMIC CONTENT VIEWPORT (SWAPPED ON ROUTING) -->
          <main id="main-content" class="dash-content-viewport"></main>

          <!-- PERSISTENT FOOTER -->
          <footer class="dash-footer" id="dash-footer">
            <div class="footer-left">
              <div class="footer-brand-wrap">
                <div class="footer-brand-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#footBoltGrad)" stroke="#00D9FF" stroke-width="1.2" stroke-linejoin="round"/>
                    <defs>
                      <linearGradient id="footBoltGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#00D9FF"/>
                        <stop offset="0.5" stop-color="#147BFF"/>
                        <stop offset="1" stop-color="#8B35FF"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div class="footer-brand-text">
                  <strong class="footer-brand-title">KEYRUSH</strong>
                  <span class="footer-tagline">Type. Race. Dominate.</span>
                </div>
              </div>
            </div>

            <div class="footer-center">
              <div class="footer-feat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                </svg>
                <div class="feat-text">
                  <span class="feat-title">Works Offline</span>
                  <span class="feat-sub">Full features without internet</span>
                </div>
              </div>

              <div class="footer-feat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                  <path d="M12 18h.01"/>
                </svg>
                <div class="feat-text">
                  <span class="feat-title">PWA Ready</span>
                  <span class="feat-sub">Install on your device</span>
                </div>
              </div>

              <div class="footer-feat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="14" x="2" y="3" rx="2"/>
                  <line x1="8" x2="16" y1="21" y2="21"/>
                  <line x1="12" x2="12" y1="17" y2="21"/>
                </svg>
                <div class="feat-text">
                  <span class="feat-title">Cross-Platform</span>
                  <span class="feat-sub">Desktop • Tablet • Mobile</span>
                </div>
              </div>
            </div>

            <div class="footer-right">
              <span class="footer-crown">👑 Level Up Your Typing Skills</span>
            </div>
          </footer>
        </div>

        <!-- SEARCH COMMAND PALETTE MODAL -->
        <div class="search-palette-modal hidden" id="search-palette-modal">
          <div class="search-palette-card">
            <div class="search-palette-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="palette-search-input" placeholder="Type to jump to a race, vehicle, lesson, or feature..." autofocus />
              <button class="palette-close-btn" id="palette-close-btn">ESC</button>
            </div>
            <div class="search-palette-results" id="search-palette-results">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>

        <!-- NOTIFICATION POPOVER -->
        <div class="notify-popover hidden" id="notify-popover">
          <div class="notify-header">
            <h4>NOTIFICATIONS</h4>
            <span class="notify-count">1 NEW</span>
          </div>
          <div class="notify-list">
            <div class="notify-item unread">
              <span class="notify-icon">🔥</span>
              <div class="notify-text">
                <strong>Daily Streak Active!</strong>
                <span>You're on a ${streak}-day daily typing streak. Keep it up!</span>
              </div>
            </div>
            <div class="notify-item">
              <span class="notify-icon">🏎️</span>
              <div class="notify-text">
                <strong>Garage Available</strong>
                <span>New custom liveries and underglow are ready to equip.</span>
              </div>
            </div>
            <div class="notify-item">
              <span class="notify-icon">⚡</span>
              <div class="notify-text">
                <strong>Ranked Leagues</strong>
                <span>Climb the global esports leaderboard in Race Mode.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setActiveScreen(screenId) {
    this.currentScreen = screenId;

    // Normalizing screen keys for active state
    let targetNav = screenId;
    if (screenId === 'race-modes' || screenId === 'race') targetNav = 'race-modes';
    if (screenId === 'diagnostic') targetNav = 'diagnostic';
    if (screenId === 'dashboard') targetNav = 'dashboard';

    // Update .active class on all sidebar buttons
    const navBtns = document.querySelectorAll('.dash-nav-btn');
    navBtns.forEach(btn => {
      const navTarget = btn.getAttribute('data-nav');
      if (navTarget === targetNav || (navTarget === 'race-modes' && (screenId === 'race' || screenId === 'ai-select'))) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Control visibility of sidebar/topbar during full-screen 3D race or full-width Landing Showcase
    const sidebar = document.getElementById('dash-sidebar');
    const topBar = document.getElementById('dash-top-bar');
    const footer = document.getElementById('dash-footer');

    if (screenId === 'race' || screenId === 'landing') {
      if (sidebar) sidebar.style.display = 'none';
      if (topBar) topBar.style.display = 'none';
      if (footer) footer.style.display = 'none';
    } else {
      if (sidebar) sidebar.style.display = 'flex';
      if (topBar) topBar.style.display = 'flex';
      if (footer) footer.style.display = 'flex';
    }
  }

  bindEvents() {
    // 1. Global Navigation Delegation for all [data-nav] elements
    document.addEventListener('click', (e) => {
      const navTarget = e.target.closest('[data-nav]');
      if (navTarget) {
        e.preventDefault();
        const screenId = navTarget.getAttribute('data-nav');
        if (screenId) {
          soundEffects.playKeyClick(true);
          this.app.showScreen(screenId);
        }
        return;
      }

      // Offline info modal trigger
      const offlineBtn = e.target.closest('[data-action="offline-info"]');
      if (offlineBtn) {
        e.preventDefault();
        alert('⚡ KEYRUSH Offline-First System\n\nAll AI racers, 3D tracks, touch-typing lessons, vehicle customizations, and telemetry logs are 100% saved locally on your device in IndexedDB. No internet connection required!');
        return;
      }

      // Audio quick toggle
      const audioBtn = e.target.closest('#dash-audio-toggle');
      if (audioBtn) {
        e.preventDefault();
        soundEffects.playUiClick();
        musicManager.toggleMute(true).then((isMuted) => {
          this.updateAudioToggleUI(!isMuted);
        });
        return;
      }

      // Notification toggle
      const notifyBtn = e.target.closest('#dash-notify-btn');
      if (notifyBtn) {
        e.preventDefault();
        this.toggleNotificationPopover();
        return;
      }

      // Close notification popover if clicked outside
      const popover = document.getElementById('notify-popover');
      if (popover && !popover.classList.contains('hidden') && !e.target.closest('#notify-popover') && !e.target.closest('#dash-notify-btn')) {
        popover.classList.add('hidden');
      }

      // Search Palette close
      const paletteClose = e.target.closest('#palette-close-btn');
      if (paletteClose) {
        this.closeSearchPalette();
        return;
      }
    });

    // Audio status sync listener
    window.addEventListener('keyrush:audio-toggle', (e) => {
      this.updateAudioToggleUI(!e.detail.muted);
    });
    this.updateAudioToggleUI(!musicManager.muted);

    // 2. Keyboard shortcuts (Ctrl+K for search palette, ESC to close)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openSearchPalette();
      } else if (e.key === 'Escape') {
        this.closeSearchPalette();
        const popover = document.getElementById('notify-popover');
        if (popover) popover.classList.add('hidden');
      }
    });

    // 3. Search box click opens palette
    const searchTrigger = document.getElementById('dash-search-trigger');
    if (searchTrigger) {
      searchTrigger.addEventListener('click', () => {
        this.openSearchPalette();
      });
    }

    const paletteInput = document.getElementById('palette-search-input');
    if (paletteInput) {
      paletteInput.addEventListener('input', (e) => {
        this.renderSearchResults(e.target.value);
      });
    }
  }

  toggleNotificationPopover() {
    const popover = document.getElementById('notify-popover');
    if (popover) {
      popover.classList.toggle('hidden');
    }
  }

  openSearchPalette() {
    const modal = document.getElementById('search-palette-modal');
    const input = document.getElementById('palette-search-input');
    if (modal) {
      modal.classList.remove('hidden');
      this.renderSearchResults('');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  }

  closeSearchPalette() {
    const modal = document.getElementById('search-palette-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  updateAudioToggleUI(isActive) {
    const btn = document.getElementById('dash-audio-toggle');
    const pill = document.getElementById('dash-audio-pill');
    if (!btn || !pill) return;
    if (isActive) {
      btn.classList.remove('is-muted');
      btn.classList.add('is-active');
      btn.title = 'Background Music: Playing (Click to Mute)';
      pill.textContent = 'MUSIC ON';
    } else {
      btn.classList.remove('is-active');
      btn.classList.add('is-muted');
      btn.title = 'Background Music: Muted (Click to Unmute)';
      pill.textContent = 'MUTED';
    }
  }

  renderSearchResults(query = '') {
    const resultsContainer = document.getElementById('search-palette-results');
    if (!resultsContainer) return;

    const items = [
      { title: 'Home Dashboard', desc: 'Performance stats, quick actions & overview', nav: 'dashboard', icon: '🏠' },
      { title: 'Showcase Landing Page', desc: 'Cinematic game showcase, features & live demo', nav: 'landing', icon: '✨' },
      { title: 'Race Mode Hub', desc: 'Solo, AI Grid, Multiplayer & Championships', nav: 'race-modes', icon: '🏎️' },
      { title: 'Practice Benchmark', desc: 'Typing speed & accuracy diagnostic test', nav: 'diagnostic', icon: '🎯' },
      { title: 'Touch-Typing Academy', desc: 'Mastery curriculum from home row to code', nav: 'academy', icon: '🎓' },
      { title: 'Supercar Garage', desc: '3D showroom, custom liveries & underglow', nav: 'garage', icon: '🛠️' },
      { title: 'Ranked Leaderboard', desc: 'Global rankings & competitive league tiers', nav: 'leaderboard', icon: '🏆' },
      { title: 'Telemetry & Statistics', desc: 'WPM trends, accuracy curves & key analytics', nav: 'analytics', icon: '📈' },
      { title: 'Tournaments & Directives', desc: 'Weekly Grand Prix cups & daily missions', nav: 'missions', icon: '🛡️' },
      { title: 'System & Audio Settings', desc: 'Configure engine audio, themes & calibration', nav: 'settings', icon: '⚙️' }
    ];

    const q = query.toLowerCase().trim();
    const filtered = items.filter(item => 
      !q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="palette-empty">No matching races or features found for "${query}"</div>
      `;
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
      <div class="palette-item" role="button" data-nav="${item.nav}">
        <span class="palette-item-icon">${item.icon}</span>
        <div class="palette-item-text">
          <strong class="palette-item-title">${item.title}</strong>
          <span class="palette-item-desc">${item.desc}</span>
        </div>
        <span class="palette-item-arrow">→</span>
      </div>
    `).join('');

    // Attach click events to results
    resultsContainer.querySelectorAll('.palette-item').forEach(el => {
      el.addEventListener('click', () => {
        const navTarget = el.getAttribute('data-nav');
        this.closeSearchPalette();
        this.app.showScreen(navTarget);
      });
    });
  }
}
