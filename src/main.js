/**
 * KEYRUSH — TYPE. RACE. DOMINATE.
 * Main Application Orchestrator & Screen Router
 */

import './style.css';
import { storage } from './db/storage.js';
import { soundEffects } from './audio/soundEffects.js';
import { musicManager } from './audio/musicManager.js';
import { NavigationManager } from './ui/navigation.js';
import { LandingView } from './ui/landingView.js';
import { DashboardView } from './ui/dashboardView.js';
import { RaceModesView } from './ui/raceModesView.js';
import { RaceView } from './ui/raceView.js';
import { DiagnosticView } from './ui/diagnosticView.js';
import { MultiplayerView } from './ui/multiplayerView.js';
import { AiSelectView } from './ui/aiSelectView.js';
import { AcademyView } from './ui/academyView.js';
import { GarageView } from './ui/garageView.js';
import { LeaderboardView } from './ui/leaderboardView.js';
import { AnalyticsView } from './ui/analyticsView.js';
import { MissionsView } from './ui/missionsView.js';
import { SettingsView } from './ui/settingsView.js';

class KeyRushApp {
  constructor() {
    this.navManager = null;
    this.currentViewInstance = null;
    this.currentScreen = 'dashboard';
    this.profile = null;
    this.settings = null;
  }

  async init() {
    // 1. Initialize offline IndexedDB storage
    await storage.ready;
    this.profile = await storage.getProfile();
    this.settings = await storage.getSettings();

    // 2. Configure audio settings
    if (this.settings) {
      soundEffects.updateSettings(this.settings);
      musicManager.applySettings(this.settings);
      document.body.className = `theme-${this.settings.theme || 'cyber-dark'}`;
    }

    // 3. Setup Navigation Controller
    this.navManager = new NavigationManager(this);

    // 4. Render Layout Shell (Persistent Master Navigation)
    this.renderShell();
    this.navManager.bindEvents();

    // 5. Initial View Route — check hash or default to Home Dashboard
    const validScreens = ['landing', 'dashboard', 'race', 'race-modes', 'diagnostic', 'academy', 'garage', 'leaderboard', 'analytics', 'missions', 'settings'];
    const initialHash = window.location.hash.replace('#', '').trim();
    if (initialHash && validScreens.includes(initialHash)) {
      this.showScreen(initialHash);
    } else {
      this.showScreen('dashboard');
    }

    // Support browser back/forward buttons
    window.addEventListener('hashchange', () => {
      const targetHash = window.location.hash.replace('#', '').trim();
      if (targetHash && validScreens.includes(targetHash) && targetHash !== this.currentScreen) {
        this.showScreen(targetHash);
      }
    });

    // 6. Register PWA Service Worker if supported
    this.registerServiceWorker();
  }

  renderShell() {
    const appEl = document.getElementById('app');
    if (!appEl) return;
    appEl.innerHTML = this.navManager.renderShell(this.profile);
  }

  async updateHeader() {
    this.profile = await storage.getProfile();
    const userChip = document.getElementById('dash-user-chip');
    if (userChip && this.profile) {
      const nameEl = userChip.querySelector('.dash-user-name');
      if (nameEl) nameEl.textContent = this.profile.username || 'Kartik';
    }
  }

  async showScreen(screenId, params = null) {
    // Dispose previous active screen
    if (this.currentViewInstance && this.currentViewInstance.dispose) {
      this.currentViewInstance.dispose();
      this.currentViewInstance = null;
    }

    this.currentScreen = screenId;
    if (window.location.hash !== `#${screenId}`) {
      history.replaceState(null, '', `#${screenId}`);
    }
    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    // Refresh profile in case stats changed
    this.profile = await storage.getProfile();

    // Highlight current active tab in left sidebar and handle race mode full-width
    if (this.navManager) {
      this.navManager.setActiveScreen(screenId);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Music Management:
    if (screenId !== 'race') {
      musicManager.playInterior();
    }

    switch (screenId) {
      case 'dashboard':
        this.currentViewInstance = new DashboardView(mainEl, this);
        await this.currentViewInstance.render(this.profile);
        break;

      case 'race-modes':
        this.currentViewInstance = new RaceModesView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'race':
        this.currentViewInstance = new RaceView(mainEl, this);
        await this.currentViewInstance.setup(params || { mode: 'AI Racing', difficulty: 'AMATEUR' });
        break;

      case 'diagnostic':
        this.currentViewInstance = new DiagnosticView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'academy':
        this.currentViewInstance = new AcademyView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'garage':
        this.currentViewInstance = new GarageView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'leaderboard':
        this.currentViewInstance = new LeaderboardView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'analytics':
        this.currentViewInstance = new AnalyticsView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'missions':
        this.currentViewInstance = new MissionsView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'settings':
        this.currentViewInstance = new SettingsView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'multiplayer':
        this.currentViewInstance = new MultiplayerView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'ai-select':
        this.currentViewInstance = new AiSelectView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'landing':
        this.currentViewInstance = new LandingView(mainEl, this);
        this.currentViewInstance.render(this.profile);
        break;

      default:
        this.currentViewInstance = new DashboardView(mainEl, this);
        await this.currentViewInstance.render(this.profile);
        break;
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => {
            console.log('KeyRush ServiceWorker registered successfully:', reg.scope);
          })
          .catch(err => {
            console.log('KeyRush ServiceWorker registration skipped/failed:', err);
          });
      });
    }
  }
}

// Start application
const app = new KeyRushApp();
window.keyRushApp = app;
window.musicManager = musicManager;
window.soundEffects = soundEffects;

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

